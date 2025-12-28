/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as crypto from 'crypto';
import { ICredentialDataDecryptedObject } from 'n8n-workflow';
import { GALILEO_ENVIRONMENTS } from '../constants/endpoints';

/**
 * Galileo Authentication Utilities
 *
 * Functions for handling API authentication, signature generation,
 * and credential management.
 */

export interface GalileoCredentials {
  environment: 'production' | 'sandbox' | 'custom';
  customUrl?: string;
  providerId: string;
  apiLogin: string;
  apiTransKey: string;
  productId?: string;
  webhookSecret?: string;
}

/**
 * Gets the base URL for the Galileo API based on environment
 */
export function getBaseUrl(credentials: GalileoCredentials): string {
  if (credentials.environment === 'custom' && credentials.customUrl) {
    return credentials.customUrl.replace(/\/$/, '');
  }
  return (
    GALILEO_ENVIRONMENTS[credentials.environment as keyof typeof GALILEO_ENVIRONMENTS] ||
    GALILEO_ENVIRONMENTS.sandbox
  );
}

/**
 * Generates a unique transaction ID for API requests
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${random}`;
}

/**
 * Creates the authentication parameters for Galileo API requests
 */
export function createAuthParams(credentials: GalileoCredentials): Record<string, string> {
  return {
    apiLogin: credentials.apiLogin,
    apiTransKey: credentials.apiTransKey,
    providerId: credentials.providerId,
    transactionId: generateTransactionId(),
  };
}

/**
 * Validates and extracts Galileo credentials from n8n credential object
 */
export function extractCredentials(
  credentialData: ICredentialDataDecryptedObject,
): GalileoCredentials {
  const credentials: GalileoCredentials = {
    environment: (credentialData.environment as GalileoCredentials['environment']) || 'sandbox',
    providerId: credentialData.providerId as string,
    apiLogin: credentialData.apiLogin as string,
    apiTransKey: credentialData.apiTransKey as string,
  };

  if (credentialData.customUrl) {
    credentials.customUrl = credentialData.customUrl as string;
  }

  if (credentialData.productId) {
    credentials.productId = credentialData.productId as string;
  }

  if (credentialData.webhookSecret) {
    credentials.webhookSecret = credentialData.webhookSecret as string;
  }

  return credentials;
}

/**
 * Generates HMAC signature for webhook verification
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256',
): string {
  const hmac = crypto.createHmac(algorithm, secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

/**
 * Verifies webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256',
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret, algorithm);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Masks sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars * 2);
  return `${start}${masked}${end}`;
}

/**
 * Generates a random PIN (for PIN reset operations in sandbox)
 */
export function generateRandomPin(length = 4): string {
  let pin = '';
  for (let i = 0; i < length; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
}
