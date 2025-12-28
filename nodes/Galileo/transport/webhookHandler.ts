// @ts-nocheck
/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IDataObject, IWebhookFunctions, IHookFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  verifyWebhookSignature,
  parseWebhookSignatureHeader,
} from '../utils/authUtils';
import { EVENT_TYPES, EventType } from '../constants/eventTypes';

/**
 * Webhook Handler
 *
 * Handles incoming webhook events from Galileo, including signature
 * verification and event parsing.
 */

export interface GalileoWebhookEvent {
  id: string;
  type: EventType;
  timestamp: string;
  data: IDataObject;
  accountId?: string;
  cardId?: string;
  transactionId?: string;
}

export interface WebhookHandlerOptions {
  verifySignature?: boolean;
  webhookSecret?: string;
  allowedEventTypes?: EventType[];
}

/**
 * Parses and validates incoming webhook payload
 */
export function parseWebhookPayload(
  body: IDataObject | string,
): GalileoWebhookEvent | null {
  let payload: IDataObject;

  if (typeof body === 'string') {
    try {
      payload = JSON.parse(body) as IDataObject;
    } catch {
      return null;
    }
  } else {
    payload = body;
  }

  // Validate required fields
  if (!payload.type || !payload.id) {
    // Try alternative field names used by Galileo
    const eventType = payload.event_type || payload.eventType || payload.type;
    const eventId = payload.event_id || payload.eventId || payload.id;

    if (!eventType) {
      return null;
    }

    return {
      id: String(eventId || Date.now()),
      type: String(eventType) as EventType,
      timestamp: String(payload.timestamp || payload.created_at || new Date().toISOString()),
      data: (payload.data as IDataObject) || payload,
      accountId: payload.account_id as string | undefined,
      cardId: payload.card_id as string | undefined,
      transactionId: payload.transaction_id as string | undefined,
    };
  }

  return {
    id: String(payload.id),
    type: String(payload.type) as EventType,
    timestamp: String(payload.timestamp || payload.created_at || new Date().toISOString()),
    data: (payload.data as IDataObject) || payload,
    accountId: payload.account_id as string | undefined,
    cardId: payload.card_id as string | undefined,
    transactionId: payload.transaction_id as string | undefined,
  };
}

/**
 * Verifies webhook signature from request headers
 */
export function verifyWebhookRequest(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string,
): boolean {
  // Parse signature header
  const parsedSignature = parseWebhookSignatureHeader(signatureHeader);
  if (!parsedSignature) {
    // Try simple signature format
    return verifyWebhookSignature(rawBody, signatureHeader, webhookSecret);
  }

  // Verify timestamped signature
  const stringToSign = `${parsedSignature.timestamp}.${rawBody}`;
  return verifyWebhookSignature(stringToSign, parsedSignature.signature, webhookSecret);
}

/**
 * Filters events based on allowed event types
 */
export function filterEventTypes(
  event: GalileoWebhookEvent,
  allowedTypes: EventType[],
): boolean {
  if (!allowedTypes || allowedTypes.length === 0) {
    return true;
  }
  return allowedTypes.includes(event.type);
}

/**
 * Converts webhook event to n8n execution data
 */
export function webhookEventToExecutionData(
  event: GalileoWebhookEvent,
): INodeExecutionData {
  return {
    json: {
      eventId: event.id,
      eventType: event.type,
      timestamp: event.timestamp,
      accountId: event.accountId,
      cardId: event.cardId,
      transactionId: event.transactionId,
      ...event.data,
    },
  };
}

/**
 * Gets all available event type options for n8n UI
 */
export function getEventTypeOptions(): Array<{ name: string; value: string }> {
  return Object.entries(EVENT_TYPES).map(([key, value]) => ({
    name: key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
    value,
  }));
}

/**
 * Creates webhook registration payload for Galileo
 */
export function createWebhookRegistrationPayload(
  webhookUrl: string,
  eventTypes: EventType[],
  options: {
    description?: string;
    headers?: Record<string, string>;
    enabled?: boolean;
  } = {},
): IDataObject {
  return {
    url: webhookUrl,
    events: eventTypes,
    description: options.description || 'n8n Galileo Trigger',
    headers: options.headers || {},
    enabled: options.enabled !== false,
  };
}

/**
 * Processes webhook in n8n trigger context
 */
export async function processWebhook(
  context: IWebhookFunctions,
  options: WebhookHandlerOptions = {},
): Promise<INodeExecutionData[][]> {
  const req = context.getRequestObject();
  const headerData = context.getHeaderData() as IDataObject;

  // Get raw body for signature verification
  const rawBody = (req as { rawBody?: string }).rawBody || JSON.stringify(req.body);

  // Verify signature if enabled
  if (options.verifySignature && options.webhookSecret) {
    const signatureHeader =
      (headerData['x-galileo-signature'] as string) ||
      (headerData['x-signature'] as string) ||
      '';

    if (!signatureHeader) {
      throw new Error('Missing webhook signature header');
    }

    const isValid = verifyWebhookRequest(rawBody, signatureHeader, options.webhookSecret);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }
  }

  // Parse webhook payload
  const event = parseWebhookPayload(req.body as IDataObject);
  if (!event) {
    throw new Error('Invalid webhook payload');
  }

  // Filter by event types if specified
  if (options.allowedEventTypes && !filterEventTypes(event, options.allowedEventTypes)) {
    // Return empty if event type not allowed (webhook will still return 200)
    return [];
  }

  // Convert to execution data
  const executionData = webhookEventToExecutionData(event);
  return [[executionData]];
}

/**
 * Registers webhook with Galileo (used in trigger setup)
 */
export async function registerWebhook(
  context: IHookFunctions,
  webhookUrl: string,
  eventTypes: EventType[],
): Promise<string | null> {
  // Note: This would call the Galileo API to register the webhook
  // For now, return a placeholder as Galileo webhook registration
  // may require manual setup in their dashboard
  console.log(`Webhook registration requested for URL: ${webhookUrl}`);
  console.log(`Event types: ${eventTypes.join(', ')}`);
  return `webhook_${Date.now()}`;
}

/**
 * Unregisters webhook from Galileo (used in trigger teardown)
 */
export async function unregisterWebhook(
  context: IHookFunctions,
  webhookId: string,
): Promise<boolean> {
  // Note: This would call the Galileo API to unregister the webhook
  console.log(`Webhook unregistration requested for ID: ${webhookId}`);
  return true;
}
