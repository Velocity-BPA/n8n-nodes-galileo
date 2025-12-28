// @ts-nocheck
/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { parseStringPromise, Builder } from 'xml2js';
import { IExecuteFunctions, IHttpRequestMethods, NodeApiError, IDataObject } from 'n8n-workflow';
import {
  GalileoCredentials,
  getBaseUrl,
  createAuthParams,
  generateTransactionId,
} from '../utils/authUtils';
import { ENDPOINTS } from '../constants/endpoints';

/**
 * Galileo API Client
 *
 * Handles all communication with the Galileo Instant API including
 * authentication, request formatting, and response parsing.
 */

export interface GalileoResponse<T = IDataObject> {
  status: number;
  statusCode: string;
  statusMessage: string;
  processingTime: number;
  transactionId: string;
  data?: T;
  rawResponse?: IDataObject;
}

export interface GalileoError {
  status: number;
  statusCode: string;
  statusMessage: string;
  errorDetails?: string;
}

export class GalileoClient {
  private client: AxiosInstance;
  private credentials: GalileoCredentials;
  private context: IExecuteFunctions;

  constructor(credentials: GalileoCredentials, context: IExecuteFunctions) {
    this.credentials = credentials;
    this.context = context;

    const baseURL = getBaseUrl(credentials);

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/xml',
      },
    });

    // Add response interceptor for logging (without sensitive data)
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Log error without sensitive data
        console.error('Galileo API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
        });
        return Promise.reject(error);
      },
    );
  }

  /**
   * Makes a request to the Galileo API
   */
  async request<T = IDataObject>(
    endpoint: string,
    params: Record<string, unknown> = {},
    method: IHttpRequestMethods = 'POST',
  ): Promise<GalileoResponse<T>> {
    const authParams = createAuthParams(this.credentials);

    // Merge auth params with request params
    const requestParams: Record<string, string> = {
      ...authParams,
    };

    // Convert all params to strings for form encoding
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        requestParams[key] = String(value);
      }
    }

    // Create form-encoded body
    const formBody = new URLSearchParams(requestParams).toString();

    try {
      const config: AxiosRequestConfig = {
        method,
        url: endpoint,
        data: formBody,
      };

      const response = await this.client.request(config);

      // Parse XML response
      const parsed = await this.parseXmlResponse(response.data);

      return this.formatResponse<T>(parsed, requestParams.transactionId);
    } catch (error) {
      throw this.handleError(error as Error);
    }
  }

  /**
   * Makes a request using endpoint category and name
   */

  /**
   * Parses XML response to JSON
   */
  private async parseXmlResponse(xml: string): Promise<IDataObject> {
    try {
      const result = await parseStringPromise(xml, {
        explicitArray: false,
        ignoreAttrs: true,
        trim: true,
      });
      return result as IDataObject;
    } catch (error) {
      // If not XML, try to parse as JSON
      try {
        return JSON.parse(xml) as IDataObject;
      } catch {
        return { rawResponse: xml };
      }
    }
  }

  /**
   * Formats the parsed response into standardized structure
   */
  private formatResponse<T>(
    parsed: IDataObject,
    transactionId: string,
  ): GalileoResponse<T> {
    // Galileo responses typically have a wrapper element
    const responseData =
      (parsed.response as IDataObject) ||
      (parsed.Response as IDataObject) ||
      parsed;

    const systemInfo =
      (responseData.system_timestamp as IDataObject) ||
      (responseData.system as IDataObject) ||
      {};

    return {
      status: parseInt(String(responseData.status || responseData.Status || '0'), 10),
      statusCode: String(responseData.status_code || responseData.statusCode || '0'),
      statusMessage: String(
        responseData.status_message ||
          responseData.statusMessage ||
          responseData.message ||
          'OK',
      ),
      processingTime: parseFloat(String(systemInfo.processing_time || '0')),
      transactionId,
      data: (responseData.data || responseData.Data || responseData) as T,
      rawResponse: parsed,
    };
  }

  /**
   * Handles and transforms errors
   */
  private handleError(error: Error): NodeApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      let message = 'Galileo API Error';
      let description = axiosError.message;

      if (axiosError.response?.data) {
        try {
          // Try to extract error message from response
          const responseData = axiosError.response.data as IDataObject;
          if (typeof responseData === 'string') {
            description = responseData;
          } else if (responseData.message) {
            description = String(responseData.message);
          } else if (responseData.status_message) {
            description = String(responseData.status_message);
          }
        } catch {
          // Keep original message
        }
      }

      // Map common HTTP status codes
      switch (statusCode) {
        case 400:
          message = 'Bad Request - Invalid parameters';
          break;
        case 401:
          message = 'Authentication Failed - Check your API credentials';
          break;
        case 403:
          message = 'Access Denied - Insufficient permissions';
          break;
        case 404:
          message = 'Resource Not Found';
          break;
        case 429:
          message = 'Rate Limit Exceeded - Too many requests';
          break;
        case 500:
          message = 'Galileo Server Error';
          break;
        case 503:
          message = 'Galileo Service Unavailable';
          break;
      }

      return new NodeApiError(this.context.getNode(), error, {
        message,
        description,
        httpCode: String(statusCode),
      });
    }

    return new NodeApiError(this.context.getNode(), error, {
      message: 'Unknown Error',
      description: error.message,
    });
  }

  /**
   * Tests the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request(ENDPOINTS.utility.testConnection);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Creates XML body for requests that require it
   */
  createXmlBody(data: IDataObject): string {
    const builder = new Builder({
      rootName: 'request',
      renderOpts: { pretty: false },
    });
    return builder.buildObject(data);
  }

  /**
   * Gets the default product ID from credentials
   */
  getDefaultProductId(): string | undefined {
    return this.credentials.productId;
  }

  /**
   * Gets the provider ID from credentials
   */
  getProviderId(): string {
    return this.credentials.providerId;
  }

  /**
   * Generates a new transaction ID
   */
  generateTransactionId(): string {
    return generateTransactionId();
  }
}

/**
 * Creates a Galileo client instance from n8n execution context
 */
export async function createGalileoClient(
  context: IExecuteFunctions,
  credentialName = 'galileoApi',
): Promise<GalileoClient> {
  const credentials = (await context.getCredentials(credentialName)) as unknown as GalileoCredentials;
  return new GalileoClient(credentials, context);
}
