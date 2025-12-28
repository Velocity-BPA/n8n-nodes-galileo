/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Card Utilities
 *
 * Functions for card number validation, formatting, and BIN detection.
 */

/**
 * Validates a card number using the Luhn algorithm
 */
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Extracts the BIN (Bank Identification Number) from a card number
 */
export function extractBin(cardNumber: string, length = 6): string {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.slice(0, length);
}

/**
 * Masks a card number for display (shows first 6 and last 4 digits)
 */
export function maskCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 10) {
    return '*'.repeat(digits.length);
  }
  const first6 = digits.slice(0, 6);
  const last4 = digits.slice(-4);
  const masked = '*'.repeat(digits.length - 10);
  return `${first6}${masked}${last4}`;
}

/**
 * Formats a card number with spaces for display
 */
export function formatCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  return digits.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Detects the card network based on BIN
 */
export function detectCardNetwork(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');

  // Visa: Starts with 4
  if (/^4/.test(digits)) {
    return 'VISA';
  }

  // Mastercard: Starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) {
    return 'MASTERCARD';
  }

  // American Express: Starts with 34 or 37
  if (/^3[47]/.test(digits)) {
    return 'AMEX';
  }

  // Discover: Starts with 6011, 622126-622925, 644-649, 65
  if (/^6(?:011|5|4[4-9]|22)/.test(digits)) {
    return 'DISCOVER';
  }

  // JCB: Starts with 3528-3589
  if (/^35(?:2[89]|[3-8])/.test(digits)) {
    return 'JCB';
  }

  // Diners Club: Starts with 36, 38, 300-305
  if (/^3(?:0[0-5]|[68])/.test(digits)) {
    return 'DINERS';
  }

  // UnionPay: Starts with 62
  if (/^62/.test(digits)) {
    return 'UNIONPAY';
  }

  return 'UNKNOWN';
}

/**
 * Validates card expiration date
 */
export function isCardExpired(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Normalize 2-digit year to 4-digit
  const fullYear = year < 100 ? 2000 + year : year;

  if (fullYear < currentYear) {
    return true;
  }

  if (fullYear === currentYear && month < currentMonth) {
    return true;
  }

  return false;
}

/**
 * Formats expiration date for display
 */
export function formatExpiration(month: number, year: number): string {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = (year % 100).toString().padStart(2, '0');
  return `${monthStr}/${yearStr}`;
}

/**
 * Validates CVV format
 */
export function validateCvv(cvv: string, cardNetwork?: string): boolean {
  const digits = cvv.replace(/\D/g, '');

  // AMEX uses 4-digit CVV
  if (cardNetwork === 'AMEX') {
    return digits.length === 4;
  }

  // All other networks use 3-digit CVV
  return digits.length === 3;
}

/**
 * Generates a test card number for sandbox (Luhn-valid)
 */
export function generateTestCardNumber(prefix = '4111111111', length = 16): string {
  let cardNumber = prefix;

  // Generate random digits until we're one short of the desired length
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  // Calculate and append the check digit using Luhn algorithm
  let sum = 0;
  let isEven = true; // Because we're adding one more digit

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return cardNumber + checkDigit.toString();
}
