/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Galileo Transaction Types
 *
 * Standard transaction type codes used across the Galileo platform.
 */

export const TRANSACTION_TYPES = {
  // Purchase transactions
  PURCHASE: 'PURCHASE',
  PURCHASE_REFUND: 'PURCHASE_REFUND',
  PURCHASE_REVERSAL: 'PURCHASE_REVERSAL',

  // ATM transactions
  ATM_WITHDRAWAL: 'ATM_WITHDRAWAL',
  ATM_BALANCE_INQUIRY: 'ATM_BALANCE_INQUIRY',
  ATM_DECLINE: 'ATM_DECLINE',

  // Cash transactions
  CASH_ADVANCE: 'CASH_ADVANCE',
  CASH_BACK: 'CASH_BACK',

  // Load/Unload transactions
  LOAD: 'LOAD',
  UNLOAD: 'UNLOAD',
  LOAD_REVERSAL: 'LOAD_REVERSAL',

  // ACH transactions
  ACH_CREDIT: 'ACH_CREDIT',
  ACH_DEBIT: 'ACH_DEBIT',
  ACH_RETURN: 'ACH_RETURN',
  ACH_REVERSAL: 'ACH_REVERSAL',

  // Transfer transactions
  CARD_TO_CARD: 'CARD_TO_CARD',
  ACCOUNT_TO_ACCOUNT: 'ACCOUNT_TO_ACCOUNT',
  INSTANT_TRANSFER: 'INSTANT_TRANSFER',

  // Direct deposit
  DIRECT_DEPOSIT: 'DIRECT_DEPOSIT',
  DD_REVERSAL: 'DD_REVERSAL',

  // Bill pay
  BILL_PAYMENT: 'BILL_PAYMENT',
  BILL_PAYMENT_REVERSAL: 'BILL_PAYMENT_REVERSAL',

  // Fee transactions
  FEE: 'FEE',
  FEE_WAIVER: 'FEE_WAIVER',
  FEE_REVERSAL: 'FEE_REVERSAL',

  // Adjustment transactions
  ADJUSTMENT_CREDIT: 'ADJUSTMENT_CREDIT',
  ADJUSTMENT_DEBIT: 'ADJUSTMENT_DEBIT',

  // Authorization
  AUTHORIZATION: 'AUTHORIZATION',
  AUTH_REVERSAL: 'AUTH_REVERSAL',
  AUTH_DECLINE: 'AUTH_DECLINE',

  // Settlement
  SETTLEMENT: 'SETTLEMENT',
  SETTLEMENT_REVERSAL: 'SETTLEMENT_REVERSAL',

  // Dispute/Chargeback
  CHARGEBACK: 'CHARGEBACK',
  CHARGEBACK_REVERSAL: 'CHARGEBACK_REVERSAL',
  PROVISIONAL_CREDIT: 'PROVISIONAL_CREDIT',
  PROVISIONAL_DEBIT: 'PROVISIONAL_DEBIT',

  // Interest
  INTEREST_CREDIT: 'INTEREST_CREDIT',
  INTEREST_DEBIT: 'INTEREST_DEBIT',

  // Rewards
  REWARDS_REDEMPTION: 'REWARDS_REDEMPTION',
  REWARDS_CREDIT: 'REWARDS_CREDIT',
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

export const TRANSACTION_TYPE_OPTIONS = Object.entries(TRANSACTION_TYPES).map(([key, value]) => ({
  name: key
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' '),
  value,
}));

/**
 * Transaction posting status
 */
export const POSTING_STATUS = {
  PENDING: 'PENDING',
  POSTED: 'POSTED',
  REVERSED: 'REVERSED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;

export type PostingStatus = (typeof POSTING_STATUS)[keyof typeof POSTING_STATUS];

/**
 * Authorization decision codes
 */
export const AUTH_DECISION = {
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  REFERRAL: 'REFERRAL',
  PICKUP: 'PICKUP',
  PARTIAL: 'PARTIAL',
} as const;

export type AuthDecision = (typeof AUTH_DECISION)[keyof typeof AUTH_DECISION];
