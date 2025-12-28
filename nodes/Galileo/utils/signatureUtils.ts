/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as crypto from 'crypto';

/**
 * Signature Utilities
 *
 * Functions for generating and verifying API request signatures
 * and webhook authenticity.
 */

/**
 * Creates a request signature using HMAC-SHA256
 */
export function createRequestSignature(
  params: Record<string, string>,
  secretKey: string,
): string {
  // Sort parameters alphabetically
  const sortedKeys = Object.keys(params).sort();

  // Create string to sign
  const stringToSign = sortedKeys.map((key) => `${key}=${params[key]}`).join('&');

  // Generate HMAC signature
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(stringToSign);
  return hmac.digest('hex');
}

/**
 * Creates a timestamp-based signature for enhanced security
 */
export function createTimestampedSignature(
  payload: string,
  secretKey: string,
  timestamp?: number,
): { signature: string; timestamp: number } {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const stringToSign = `${ts}.${payload}`;

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(stringToSign);
  const signature = hmac.digest('hex');

  return { signature, timestamp: ts };
}

/**
 * Verifies a timestamped signature with tolerance window
 */
export function verifyTimestampedSignature(
  payload: string,
  signature: string,
  timestamp: number,
  secretKey: string,
  toleranceSeconds = 300, // 5 minutes default
): boolean {
  // Check timestamp is within tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return false;
  }

  // Verify signature
  const stringToSign = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(stringToSign);
  const expectedSignature = hmac.digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Parses Galileo webhook signature header
 * Format: t=timestamp,v1=signature
 */
export function parseWebhookSignatureHeader(header: string): {
  timestamp: number;
  signature: string;
} | null {
  const parts = header.split(',');
  let timestamp: number | null = null;
  let signature: string | null = null;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 't') {
      timestamp = parseInt(value, 10);
    } else if (key === 'v1') {
      signature = value;
    }
  }

  if (timestamp === null || signature === null) {
    return null;
  }

  return { timestamp, signature };
}

/**
 * Generates a webhook signature in Galileo format
 */
export function generateWebhookSignatureHeader(
  payload: string,
  secretKey: string,
  timestamp?: number,
): string {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const stringToSign = `${ts}.${payload}`;

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(stringToSign);
  const signature = hmac.digest('hex');

  return `t=${ts},v1=${signature}`;
}

/**
 * Creates a hash of sensitive data for comparison
 */
export function hashSensitiveData(data: string, salt?: string): string {
  const hash = crypto.createHash('sha256');
  if (salt) {
    hash.update(salt);
  }
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypts sensitive data using AES-256-GCM
 */
export function encryptData(
  data: string,
  key: string,
): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const keyBuffer = crypto.scryptSync(key, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

/**
 * Decrypts data encrypted with AES-256-GCM
 */
export function decryptData(
  encrypted: string,
  iv: string,
  tag: string,
  key: string,
): string {
  const keyBuffer = crypto.scryptSync(key, 'salt', 32);
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    keyBuffer,
    Buffer.from(iv, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
