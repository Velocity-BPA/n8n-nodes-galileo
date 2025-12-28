/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Galileo Card and Account Statuses
 *
 * Standard status codes for cards and accounts on the Galileo platform.
 */

export const CARD_STATUS = {
  // Active states
  ACTIVE: 'N', // Normal/Active
  ACTIVATED: 'A', // Activated

  // Inactive states
  INACTIVE: 'I', // Inactive/Not yet activated
  PENDING: 'P', // Pending activation

  // Frozen states
  FROZEN: 'F', // Frozen by customer
  TEMP_FROZEN: 'T', // Temporarily frozen
  FRAUD_FROZEN: 'D', // Frozen due to suspected fraud

  // Lost/Stolen
  LOST: 'L', // Reported lost
  STOLEN: 'S', // Reported stolen

  // Closed states
  CLOSED: 'C', // Closed
  CANCELLED: 'X', // Cancelled

  // Replacement
  REPLACED: 'R', // Replaced with new card

  // Expired
  EXPIRED: 'E', // Card has expired
} as const;

export type CardStatus = (typeof CARD_STATUS)[keyof typeof CARD_STATUS];

export const CARD_STATUS_OPTIONS = [
  { name: 'Active', value: CARD_STATUS.ACTIVE },
  { name: 'Activated', value: CARD_STATUS.ACTIVATED },
  { name: 'Inactive', value: CARD_STATUS.INACTIVE },
  { name: 'Pending', value: CARD_STATUS.PENDING },
  { name: 'Frozen', value: CARD_STATUS.FROZEN },
  { name: 'Temporarily Frozen', value: CARD_STATUS.TEMP_FROZEN },
  { name: 'Fraud Frozen', value: CARD_STATUS.FRAUD_FROZEN },
  { name: 'Lost', value: CARD_STATUS.LOST },
  { name: 'Stolen', value: CARD_STATUS.STOLEN },
  { name: 'Closed', value: CARD_STATUS.CLOSED },
  { name: 'Cancelled', value: CARD_STATUS.CANCELLED },
  { name: 'Replaced', value: CARD_STATUS.REPLACED },
  { name: 'Expired', value: CARD_STATUS.EXPIRED },
];

export const ACCOUNT_STATUS = {
  // Active states
  ACTIVE: 'A', // Active account
  NORMAL: 'N', // Normal status

  // Restricted states
  RESTRICTED: 'R', // Restricted account
  SUSPENDED: 'S', // Suspended account
  FROZEN: 'F', // Frozen account

  // Closed states
  CLOSED: 'C', // Closed account
  DORMANT: 'D', // Dormant/Inactive

  // Pending
  PENDING: 'P', // Pending activation
  PENDING_KYC: 'K', // Pending KYC verification

  // Negative
  NEGATIVE_BALANCE: 'B', // Account has negative balance
  CHARGED_OFF: 'O', // Account charged off
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

export const ACCOUNT_STATUS_OPTIONS = [
  { name: 'Active', value: ACCOUNT_STATUS.ACTIVE },
  { name: 'Normal', value: ACCOUNT_STATUS.NORMAL },
  { name: 'Restricted', value: ACCOUNT_STATUS.RESTRICTED },
  { name: 'Suspended', value: ACCOUNT_STATUS.SUSPENDED },
  { name: 'Frozen', value: ACCOUNT_STATUS.FROZEN },
  { name: 'Closed', value: ACCOUNT_STATUS.CLOSED },
  { name: 'Dormant', value: ACCOUNT_STATUS.DORMANT },
  { name: 'Pending', value: ACCOUNT_STATUS.PENDING },
  { name: 'Pending KYC', value: ACCOUNT_STATUS.PENDING_KYC },
  { name: 'Negative Balance', value: ACCOUNT_STATUS.NEGATIVE_BALANCE },
  { name: 'Charged Off', value: ACCOUNT_STATUS.CHARGED_OFF },
];

export const KYC_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  RETRY_REQUIRED: 'RETRY_REQUIRED',
  DOCUMENT_REQUIRED: 'DOCUMENT_REQUIRED',
} as const;

export type KycStatus = (typeof KYC_STATUS)[keyof typeof KYC_STATUS];

export const KYC_STATUS_OPTIONS = [
  { name: 'Not Started', value: KYC_STATUS.NOT_STARTED },
  { name: 'Pending', value: KYC_STATUS.PENDING },
  { name: 'In Review', value: KYC_STATUS.IN_REVIEW },
  { name: 'Approved', value: KYC_STATUS.APPROVED },
  { name: 'Rejected', value: KYC_STATUS.REJECTED },
  { name: 'Expired', value: KYC_STATUS.EXPIRED },
  { name: 'Retry Required', value: KYC_STATUS.RETRY_REQUIRED },
  { name: 'Document Required', value: KYC_STATUS.DOCUMENT_REQUIRED },
];

export const DISPUTE_STATUS = {
  OPEN: 'OPEN',
  PENDING_REVIEW: 'PENDING_REVIEW',
  IN_PROGRESS: 'IN_PROGRESS',
  PROVISIONAL_CREDIT_ISSUED: 'PROVISIONAL_CREDIT_ISSUED',
  RESOLVED_CUSTOMER_FAVOR: 'RESOLVED_CUSTOMER_FAVOR',
  RESOLVED_MERCHANT_FAVOR: 'RESOLVED_MERCHANT_FAVOR',
  CLOSED: 'CLOSED',
  ESCALATED: 'ESCALATED',
} as const;

export type DisputeStatus = (typeof DISPUTE_STATUS)[keyof typeof DISPUTE_STATUS];

export const DISPUTE_STATUS_OPTIONS = [
  { name: 'Open', value: DISPUTE_STATUS.OPEN },
  { name: 'Pending Review', value: DISPUTE_STATUS.PENDING_REVIEW },
  { name: 'In Progress', value: DISPUTE_STATUS.IN_PROGRESS },
  { name: 'Provisional Credit Issued', value: DISPUTE_STATUS.PROVISIONAL_CREDIT_ISSUED },
  { name: 'Resolved - Customer Favor', value: DISPUTE_STATUS.RESOLVED_CUSTOMER_FAVOR },
  { name: 'Resolved - Merchant Favor', value: DISPUTE_STATUS.RESOLVED_MERCHANT_FAVOR },
  { name: 'Closed', value: DISPUTE_STATUS.CLOSED },
  { name: 'Escalated', value: DISPUTE_STATUS.ESCALATED },
];
