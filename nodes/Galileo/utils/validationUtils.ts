/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NodeOperationError, IExecuteFunctions } from 'n8n-workflow';

/**
 * Validation Utilities
 *
 * Functions for validating input parameters specific to Galileo API.
 */

/**
 * Validates SSN format (with or without dashes)
 */
export function validateSsn(ssn: string): boolean {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) {
    return false;
  }

  // SSN cannot start with 000, 666, or 900-999
  const areaNumber = parseInt(cleaned.slice(0, 3), 10);
  if (areaNumber === 0 || areaNumber === 666 || areaNumber >= 900) {
    return false;
  }

  // Group number (digits 4-5) cannot be 00
  const groupNumber = parseInt(cleaned.slice(3, 5), 10);
  if (groupNumber === 0) {
    return false;
  }

  // Serial number (digits 6-9) cannot be 0000
  const serialNumber = parseInt(cleaned.slice(5, 9), 10);
  if (serialNumber === 0) {
    return false;
  }

  return true;
}

/**
 * Formats SSN to standard format (XXX-XX-XXXX)
 */
export function formatSsn(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) {
    return ssn;
  }
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
}

/**
 * Validates US phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // US phone numbers are 10 digits (or 11 with country code)
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'));
}

/**
 * Formats phone number to E.164 format
 */
export function formatPhoneE164(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return `+${cleaned}`;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates US ZIP code format
 */
export function validateZipCode(zip: string): boolean {
  // 5 digit or 5+4 format
  return /^\d{5}(-\d{4})?$/.test(zip);
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function validateDateFormat(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return false;
  }

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates amount is positive number with max 2 decimal places
 */
export function validateAmount(amount: number): boolean {
  if (amount <= 0) {
    return false;
  }

  // Check decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
}

/**
 * Validates routing number using checksum
 */
export function validateRoutingNumber(routing: string): boolean {
  const cleaned = routing.replace(/\D/g, '');
  if (cleaned.length !== 9) {
    return false;
  }

  // ABA routing number checksum validation
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i], 10) * weights[i];
  }

  return sum % 10 === 0;
}

/**
 * Validates account number format
 */
export function validateAccountNumber(accountNo: string): boolean {
  const cleaned = accountNo.replace(/\D/g, '');
  // Account numbers typically 4-17 digits
  return cleaned.length >= 4 && cleaned.length <= 17;
}

/**
 * Validates PRN (Program Routing Number) format
 */
export function validatePrn(prn: string): boolean {
  // PRN is typically a numeric identifier
  return /^\d{1,20}$/.test(prn);
}

/**
 * Validates and throws n8n error if invalid
 */
export function validateRequiredField(
  context: IExecuteFunctions,
  value: unknown,
  fieldName: string,
  itemIndex: number,
): void {
  if (value === undefined || value === null || value === '') {
    throw new NodeOperationError(context.getNode(), `${fieldName} is required`, {
      itemIndex,
    });
  }
}

/**
 * Validates amount and throws n8n error if invalid
 */
export function validateAmountField(
  context: IExecuteFunctions,
  amount: number,
  fieldName: string,
  itemIndex: number,
): void {
  if (!validateAmount(amount)) {
    throw new NodeOperationError(
      context.getNode(),
      `${fieldName} must be a positive number with up to 2 decimal places`,
      { itemIndex },
    );
  }
}

/**
 * Validates date and throws n8n error if invalid
 */
export function validateDateField(
  context: IExecuteFunctions,
  dateStr: string,
  fieldName: string,
  itemIndex: number,
): void {
  if (!validateDateFormat(dateStr)) {
    throw new NodeOperationError(
      context.getNode(),
      `${fieldName} must be in YYYY-MM-DD format`,
      { itemIndex },
    );
  }
}

/**
 * Validates email and throws n8n error if invalid
 */
export function validateEmailField(
  context: IExecuteFunctions,
  email: string,
  fieldName: string,
  itemIndex: number,
): void {
  if (!validateEmail(email)) {
    throw new NodeOperationError(context.getNode(), `${fieldName} must be a valid email address`, {
      itemIndex,
    });
  }
}

/**
 * Validates phone number and throws n8n error if invalid
 */
export function validatePhoneField(
  context: IExecuteFunctions,
  phone: string,
  fieldName: string,
  itemIndex: number,
): void {
  if (!validatePhoneNumber(phone)) {
    throw new NodeOperationError(
      context.getNode(),
      `${fieldName} must be a valid US phone number`,
      { itemIndex },
    );
  }
}

/**
 * Validates SSN and throws n8n error if invalid
 */
export function validateSsnField(
  context: IExecuteFunctions,
  ssn: string,
  fieldName: string,
  itemIndex: number,
): void {
  if (!validateSsn(ssn)) {
    throw new NodeOperationError(
      context.getNode(),
      `${fieldName} must be a valid Social Security Number`,
      { itemIndex },
    );
  }
}

/**
 * Validates PRN (Program Routing Number) and throws n8n error if invalid
 */
export function validatePrnField(
  context: IExecuteFunctions,
  prn: string,
  fieldName: string,
  itemIndex: number,
): void {
  if (!validatePrn(prn)) {
    throw new NodeOperationError(
      context.getNode(),
      `${fieldName} must be a valid PRN (12-16 digits)`,
      { itemIndex },
    );
  }
}

/**
 * Validates routing number and throws n8n error if invalid
 */
export function validateRoutingNumberField(
  context: IExecuteFunctions,
  routingNumber: string,
  fieldName: string,
  itemIndex: number,
): void {
  if (!validateRoutingNumber(routingNumber)) {
    throw new NodeOperationError(
      context.getNode(),
      `${fieldName} must be a valid 9-digit ABA routing number`,
      { itemIndex },
    );
  }
}

/**
 * Validates account number and throws n8n error if invalid
 */
export function validateAccountNumberField(
  context: IExecuteFunctions,
  accountNumber: string,
  fieldName: string,
  itemIndex: number,
): void {
  if (!validateAccountNumber(accountNumber)) {
    throw new NodeOperationError(
      context.getNode(),
      `${fieldName} must be a valid account number (4-17 digits)`,
      { itemIndex },
    );
  }
}

/**
 * Sanitizes string input by trimming and removing control characters
 */
export function sanitizeString(input: string): string {
  // Remove control characters and trim
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

/**
 * Converts amount to cents (integer)
 */
export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Converts cents to amount (decimal)
 */
export function centsToAmount(cents: number): number {
  return cents / 100;
}
