/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Galileo Webhook Event Types
 *
 * Event types that can be received via webhooks from Galileo.
 */

export const EVENT_TYPES = {
  // Account events
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_FROZEN: 'account.frozen',
  ACCOUNT_UNFROZEN: 'account.unfrozen',
  ACCOUNT_CLOSED: 'account.closed',
  BALANCE_CHANGED: 'account.balance.changed',
  LIMIT_CHANGED: 'account.limit.changed',

  // Card events
  CARD_CREATED: 'card.created',
  CARD_ACTIVATED: 'card.activated',
  CARD_FROZEN: 'card.frozen',
  CARD_UNFROZEN: 'card.unfrozen',
  CARD_REPLACED: 'card.replaced',
  CARD_REISSUED: 'card.reissued',
  CARD_CLOSED: 'card.closed',
  PIN_CHANGED: 'card.pin.changed',
  CARD_SHIPPED: 'card.shipped',
  CARD_DELIVERED: 'card.delivered',
  CARD_RETURNED: 'card.returned',

  // Transaction events
  AUTHORIZATION_CREATED: 'authorization.created',
  AUTHORIZATION_DECLINED: 'authorization.declined',
  AUTHORIZATION_REVERSED: 'authorization.reversed',
  AUTHORIZATION_EXPIRED: 'authorization.expired',
  TRANSACTION_POSTED: 'transaction.posted',
  TRANSACTION_REVERSED: 'transaction.reversed',
  TRANSACTION_ADJUSTED: 'transaction.adjusted',
  LARGE_TRANSACTION: 'transaction.large',
  INTERNATIONAL_TRANSACTION: 'transaction.international',

  // Payment events
  ACH_INITIATED: 'ach.initiated',
  ACH_COMPLETED: 'ach.completed',
  ACH_RETURNED: 'ach.returned',
  ACH_FAILED: 'ach.failed',
  LOAD_INITIATED: 'load.initiated',
  LOAD_COMPLETED: 'load.completed',
  LOAD_FAILED: 'load.failed',
  WITHDRAWAL_INITIATED: 'withdrawal.initiated',
  WITHDRAWAL_COMPLETED: 'withdrawal.completed',
  WITHDRAWAL_FAILED: 'withdrawal.failed',
  TRANSFER_INITIATED: 'transfer.initiated',
  TRANSFER_COMPLETED: 'transfer.completed',
  TRANSFER_FAILED: 'transfer.failed',
  BILL_PAYMENT_INITIATED: 'billpay.initiated',
  BILL_PAYMENT_COMPLETED: 'billpay.completed',
  BILL_PAYMENT_FAILED: 'billpay.failed',

  // Direct deposit events
  DIRECT_DEPOSIT_RECEIVED: 'directdeposit.received',
  DIRECT_DEPOSIT_RETURNED: 'directdeposit.returned',

  // Fraud events
  FRAUD_ALERT: 'fraud.alert',
  FRAUD_SUSPECTED: 'fraud.suspected',
  FRAUD_CONFIRMED: 'fraud.confirmed',
  VELOCITY_EXCEEDED: 'fraud.velocity.exceeded',
  SUSPICIOUS_ACTIVITY: 'fraud.suspicious',
  CARD_BLOCKED: 'fraud.card.blocked',
  ACCOUNT_BLOCKED: 'fraud.account.blocked',

  // Dispute events
  DISPUTE_CREATED: 'dispute.created',
  DISPUTE_UPDATED: 'dispute.updated',
  DISPUTE_RESOLVED: 'dispute.resolved',
  DISPUTE_ESCALATED: 'dispute.escalated',
  CHARGEBACK_RECEIVED: 'dispute.chargeback.received',
  CHARGEBACK_REVERSED: 'dispute.chargeback.reversed',
  PROVISIONAL_CREDIT: 'dispute.provisional.credit',
  PROVISIONAL_DEBIT: 'dispute.provisional.debit',

  // Digital wallet events
  WALLET_PROVISIONED: 'wallet.provisioned',
  WALLET_ACTIVATED: 'wallet.activated',
  WALLET_DEACTIVATED: 'wallet.deactivated',
  WALLET_SUSPENDED: 'wallet.suspended',

  // KYC events
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_APPROVED: 'kyc.approved',
  KYC_REJECTED: 'kyc.rejected',
  KYC_DOCUMENT_REQUIRED: 'kyc.document.required',
  KYC_EXPIRED: 'kyc.expired',

  // Fee events
  FEE_APPLIED: 'fee.applied',
  FEE_WAIVED: 'fee.waived',
  FEE_REVERSED: 'fee.reversed',

  // Statement events
  STATEMENT_READY: 'statement.ready',
  STATEMENT_GENERATED: 'statement.generated',

  // Notification events
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_FAILED: 'notification.failed',

  // Rewards events
  REWARDS_EARNED: 'rewards.earned',
  REWARDS_REDEEMED: 'rewards.redeemed',
  REWARDS_EXPIRED: 'rewards.expired',
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

/**
 * Event categories for organizing webhook subscriptions
 */
export const EVENT_CATEGORIES = {
  ACCOUNT: [
    EVENT_TYPES.ACCOUNT_CREATED,
    EVENT_TYPES.ACCOUNT_UPDATED,
    EVENT_TYPES.ACCOUNT_FROZEN,
    EVENT_TYPES.ACCOUNT_UNFROZEN,
    EVENT_TYPES.ACCOUNT_CLOSED,
    EVENT_TYPES.BALANCE_CHANGED,
    EVENT_TYPES.LIMIT_CHANGED,
  ],
  CARD: [
    EVENT_TYPES.CARD_CREATED,
    EVENT_TYPES.CARD_ACTIVATED,
    EVENT_TYPES.CARD_FROZEN,
    EVENT_TYPES.CARD_UNFROZEN,
    EVENT_TYPES.CARD_REPLACED,
    EVENT_TYPES.CARD_REISSUED,
    EVENT_TYPES.CARD_CLOSED,
    EVENT_TYPES.PIN_CHANGED,
    EVENT_TYPES.CARD_SHIPPED,
  ],
  TRANSACTION: [
    EVENT_TYPES.AUTHORIZATION_CREATED,
    EVENT_TYPES.AUTHORIZATION_DECLINED,
    EVENT_TYPES.TRANSACTION_POSTED,
    EVENT_TYPES.TRANSACTION_REVERSED,
    EVENT_TYPES.TRANSACTION_ADJUSTED,
    EVENT_TYPES.LARGE_TRANSACTION,
  ],
  PAYMENT: [
    EVENT_TYPES.ACH_INITIATED,
    EVENT_TYPES.ACH_COMPLETED,
    EVENT_TYPES.ACH_RETURNED,
    EVENT_TYPES.LOAD_COMPLETED,
    EVENT_TYPES.WITHDRAWAL_COMPLETED,
    EVENT_TYPES.TRANSFER_COMPLETED,
  ],
  FRAUD: [
    EVENT_TYPES.FRAUD_ALERT,
    EVENT_TYPES.VELOCITY_EXCEEDED,
    EVENT_TYPES.SUSPICIOUS_ACTIVITY,
    EVENT_TYPES.CARD_BLOCKED,
  ],
  DISPUTE: [
    EVENT_TYPES.DISPUTE_CREATED,
    EVENT_TYPES.DISPUTE_UPDATED,
    EVENT_TYPES.DISPUTE_RESOLVED,
    EVENT_TYPES.CHARGEBACK_RECEIVED,
  ],
  WALLET: [
    EVENT_TYPES.WALLET_PROVISIONED,
    EVENT_TYPES.WALLET_ACTIVATED,
    EVENT_TYPES.WALLET_DEACTIVATED,
  ],
  KYC: [
    EVENT_TYPES.KYC_SUBMITTED,
    EVENT_TYPES.KYC_APPROVED,
    EVENT_TYPES.KYC_REJECTED,
    EVENT_TYPES.KYC_DOCUMENT_REQUIRED,
  ],
} as const;

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPES).map(([key, value]) => ({
  name: key
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' '),
  value,
}));

export const EVENT_CATEGORY_OPTIONS = Object.keys(EVENT_CATEGORIES).map((category) => ({
  name: category.charAt(0) + category.slice(1).toLowerCase(),
  value: category,
}));
