/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Galileo API Endpoints
 *
 * Central registry of all Galileo Instant API endpoints organized by resource.
 * All endpoints use POST method with form-encoded body parameters.
 */

export const GALILEO_ENVIRONMENTS = {
  production: 'https://api.galileo-ft.com',
  sandbox: 'https://api-sandbox.galileo-ft.com',
} as const;

export const API_VERSION = '4.0';

export const ENDPOINTS = {
  // Account endpoints
  account: {
    create: '/intserv/4.0/createAccount',
    get: '/intserv/4.0/getAccountOverview',
    getBalance: '/intserv/4.0/getBalance',
    getStatus: '/intserv/4.0/getAccountStatus',
    updateStatus: '/intserv/4.0/modifyStatus',
    freeze: '/intserv/4.0/freezeAccount',
    unfreeze: '/intserv/4.0/unfreezeAccount',
    close: '/intserv/4.0/closeAccount',
    getHistory: '/intserv/4.0/getAccountHistory',
    getTransactions: '/intserv/4.0/getTransHistory',
    getLimits: '/intserv/4.0/getAccountLimits',
    updateLimits: '/intserv/4.0/setAccountLimits',
    getByExternalId: '/intserv/4.0/getAccountByExternalId',
    list: '/intserv/4.0/getAccounts',
  },

  // Card endpoints
  card: {
    create: '/intserv/4.0/createCard',
    get: '/intserv/4.0/getCard',
    getDetails: '/intserv/4.0/getCardDetails',
    activate: '/intserv/4.0/activateCard',
    freeze: '/intserv/4.0/freezeCard',
    unfreeze: '/intserv/4.0/unfreezeCard',
    replace: '/intserv/4.0/replaceCard',
    reissue: '/intserv/4.0/reissueCard',
    close: '/intserv/4.0/closeCard',
    getStatus: '/intserv/4.0/getCardStatus',
    updateStatus: '/intserv/4.0/modifyCardStatus',
    getPin: '/intserv/4.0/getPin',
    setPin: '/intserv/4.0/setPin',
    resetPin: '/intserv/4.0/resetPin',
    getCvv2: '/intserv/4.0/getCVV',
    getExpiration: '/intserv/4.0/getCardExpiration',
    listByAccount: '/intserv/4.0/getCardsByAccount',
    updateLimits: '/intserv/4.0/setCardLimits',
  },

  // Cardholder endpoints
  cardholder: {
    create: '/intserv/4.0/createCardholder',
    get: '/intserv/4.0/getCardholder',
    update: '/intserv/4.0/updateCardholder',
    getBySsn: '/intserv/4.0/getCardholderBySsn',
    getByExternalId: '/intserv/4.0/getCardholderByExternalId',
    updateAddress: '/intserv/4.0/updateAddress',
    updatePhone: '/intserv/4.0/updatePhone',
    updateEmail: '/intserv/4.0/updateEmail',
    getStatus: '/intserv/4.0/getCardholderStatus',
    updateStatus: '/intserv/4.0/modifyCardholderStatus',
  },

  // Transaction endpoints
  transaction: {
    get: '/intserv/4.0/getTransaction',
    list: '/intserv/4.0/getTransactions',
    getByAccount: '/intserv/4.0/getAccountTransactions',
    getByCard: '/intserv/4.0/getCardTransactions',
    getByDate: '/intserv/4.0/getTransactionsByDate',
    getPending: '/intserv/4.0/getPendingTransactions',
    getPosted: '/intserv/4.0/getPostedTransactions',
    search: '/intserv/4.0/searchTransactions',
    getDetails: '/intserv/4.0/getTransactionDetails',
    adjust: '/intserv/4.0/adjustTransaction',
    reverse: '/intserv/4.0/reverseTransaction',
  },

  // Authorization endpoints
  authorization: {
    get: '/intserv/4.0/getAuthorization',
    list: '/intserv/4.0/getAuthorizations',
    getPending: '/intserv/4.0/getPendingAuthorizations',
    simulate: '/intserv/4.0/simulateAuthorization',
    approve: '/intserv/4.0/approveAuthorization',
    decline: '/intserv/4.0/declineAuthorization',
    getByMerchant: '/intserv/4.0/getAuthorizationsByMerchant',
    getControls: '/intserv/4.0/getAuthControls',
  },

  // Payment endpoints
  payment: {
    createAch: '/intserv/4.0/createAchTransfer',
    createInstant: '/intserv/4.0/createInstantTransfer',
    createCardToCard: '/intserv/4.0/createCardToCardTransfer',
    get: '/intserv/4.0/getPayment',
    getStatus: '/intserv/4.0/getPaymentStatus',
    cancel: '/intserv/4.0/cancelPayment',
    getByAccount: '/intserv/4.0/getPaymentsByAccount',
    getHistory: '/intserv/4.0/getPaymentHistory',
  },

  // Load endpoints
  load: {
    funds: '/intserv/4.0/loadFunds',
    fundsImmediate: '/intserv/4.0/loadFundsImmediate',
    getStatus: '/intserv/4.0/getLoadStatus',
    getHistory: '/intserv/4.0/getLoadHistory',
    getByReference: '/intserv/4.0/getLoadByReference',
    cancel: '/intserv/4.0/cancelLoad',
  },

  // Withdrawal endpoints
  withdrawal: {
    create: '/intserv/4.0/createWithdrawal',
    get: '/intserv/4.0/getWithdrawal',
    getStatus: '/intserv/4.0/getWithdrawalStatus',
    cancel: '/intserv/4.0/cancelWithdrawal',
    getByAccount: '/intserv/4.0/getWithdrawalsByAccount',
    getAtm: '/intserv/4.0/getAtmWithdrawal',
  },

  // ACH endpoints
  ach: {
    createCredit: '/intserv/4.0/createAchCredit',
    createDebit: '/intserv/4.0/createAchDebit',
    get: '/intserv/4.0/getAchTransfer',
    getStatus: '/intserv/4.0/getAchStatus',
    cancel: '/intserv/4.0/cancelAch',
    getByReference: '/intserv/4.0/getAchByReference',
    getReturns: '/intserv/4.0/getAchReturns',
    getLimits: '/intserv/4.0/getAchLimits',
  },

  // Direct Deposit endpoints
  directDeposit: {
    getInfo: '/intserv/4.0/getDirectDepositInfo',
    update: '/intserv/4.0/updateDirectDeposit',
    getInstructions: '/intserv/4.0/getDepositInstructions',
    getRoutingNumber: '/intserv/4.0/getRoutingNumber',
    getAccountNumber: '/intserv/4.0/getAccountNumber',
  },

  // Bill Pay endpoints
  billPay: {
    create: '/intserv/4.0/createBillPayment',
    get: '/intserv/4.0/getBillPayment',
    cancel: '/intserv/4.0/cancelBillPayment',
    list: '/intserv/4.0/getBillPayments',
    getBillers: '/intserv/4.0/getBillers',
    addBiller: '/intserv/4.0/addBiller',
    removeBiller: '/intserv/4.0/removeBiller',
    getStatus: '/intserv/4.0/getBillPaymentStatus',
  },

  // Dispute endpoints
  dispute: {
    create: '/intserv/4.0/createDispute',
    get: '/intserv/4.0/getDispute',
    getStatus: '/intserv/4.0/getDisputeStatus',
    update: '/intserv/4.0/updateDispute',
    getByAccount: '/intserv/4.0/getDisputesByAccount',
    getByCard: '/intserv/4.0/getDisputesByCard',
    uploadDocument: '/intserv/4.0/uploadDisputeDocument',
    getDeadline: '/intserv/4.0/getDisputeDeadline',
  },

  // Fraud endpoints
  fraud: {
    getScore: '/intserv/4.0/getFraudScore',
    report: '/intserv/4.0/reportFraud',
    getAlerts: '/intserv/4.0/getFraudAlerts',
    updateStatus: '/intserv/4.0/updateFraudStatus',
    getRules: '/intserv/4.0/getFraudRules',
    blockTransactionType: '/intserv/4.0/blockTransactionType',
    unblockTransactionType: '/intserv/4.0/unblockTransactionType',
    getVelocityLimits: '/intserv/4.0/getVelocityLimits',
  },

  // Fee endpoints
  fee: {
    getSchedule: '/intserv/4.0/getFeeSchedule',
    apply: '/intserv/4.0/applyFee',
    waive: '/intserv/4.0/waiveFee',
    getByAccount: '/intserv/4.0/getFeesByAccount',
    getHistory: '/intserv/4.0/getFeeHistory',
    getTypes: '/intserv/4.0/getFeeTypes',
    calculate: '/intserv/4.0/calculateFee',
  },

  // Limit endpoints
  limit: {
    getAccount: '/intserv/4.0/getAccountLimits',
    updateAccount: '/intserv/4.0/setAccountLimits',
    getCard: '/intserv/4.0/getCardLimits',
    updateCard: '/intserv/4.0/setCardLimits',
    getTransaction: '/intserv/4.0/getTransactionLimits',
    getDaily: '/intserv/4.0/getDailyLimits',
    getMonthly: '/intserv/4.0/getMonthlyLimits',
    reset: '/intserv/4.0/resetLimits',
  },

  // Statement endpoints
  statement: {
    get: '/intserv/4.0/getStatement',
    list: '/intserv/4.0/getStatements',
    getPdf: '/intserv/4.0/getStatementPdf',
    getByPeriod: '/intserv/4.0/getStatementByPeriod',
    getMini: '/intserv/4.0/getMiniStatement',
  },

  // Notification endpoints
  notification: {
    getSettings: '/intserv/4.0/getNotificationSettings',
    updateSettings: '/intserv/4.0/updateNotificationSettings',
    list: '/intserv/4.0/getNotifications',
    markRead: '/intserv/4.0/markNotificationRead',
    getChannels: '/intserv/4.0/getNotificationChannels',
    subscribe: '/intserv/4.0/subscribeToNotifications',
    unsubscribe: '/intserv/4.0/unsubscribeFromNotifications',
  },

  // KYC endpoints
  kyc: {
    submit: '/intserv/4.0/submitKyc',
    getStatus: '/intserv/4.0/getKycStatus',
    getResult: '/intserv/4.0/getKycResult',
    uploadDocument: '/intserv/4.0/uploadKycDocument',
    getRequirements: '/intserv/4.0/getKycRequirements',
    retry: '/intserv/4.0/retryKyc',
    getIdentityVerification: '/intserv/4.0/getIdentityVerification',
  },

  // Program endpoints
  program: {
    getInfo: '/intserv/4.0/getProgramInfo',
    getSettings: '/intserv/4.0/getProgramSettings',
    getLimits: '/intserv/4.0/getProgramLimits',
    getFees: '/intserv/4.0/getProgramFees',
    getCardProducts: '/intserv/4.0/getCardProducts',
    getAccountProducts: '/intserv/4.0/getAccountProducts',
  },

  // Digital Wallet endpoints
  digitalWallet: {
    provisionApplePay: '/intserv/4.0/provisionApplePay',
    provisionGooglePay: '/intserv/4.0/provisionGooglePay',
    provisionSamsungPay: '/intserv/4.0/provisionSamsungPay',
    getToken: '/intserv/4.0/getWalletToken',
    getStatus: '/intserv/4.0/getWalletStatus',
    deactivateToken: '/intserv/4.0/deactivateWalletToken',
    getProvisioningData: '/intserv/4.0/getProvisioningData',
  },

  // Rewards endpoints
  rewards: {
    getBalance: '/intserv/4.0/getRewardsBalance',
    getHistory: '/intserv/4.0/getRewardsHistory',
    redeem: '/intserv/4.0/redeemRewards',
    getRules: '/intserv/4.0/getRewardsRules',
    getCatalog: '/intserv/4.0/getRewardsCatalog',
    transfer: '/intserv/4.0/transferRewards',
  },

  // Webhook endpoints
  webhook: {
    create: '/intserv/4.0/createWebhook',
    get: '/intserv/4.0/getWebhook',
    update: '/intserv/4.0/updateWebhook',
    delete: '/intserv/4.0/deleteWebhook',
    list: '/intserv/4.0/getWebhooks',
    test: '/intserv/4.0/testWebhook',
    getEvents: '/intserv/4.0/getWebhookEvents',
    retry: '/intserv/4.0/retryWebhook',
  },

  // Sandbox endpoints
  sandbox: {
    simulateAuthorization: '/intserv/4.0/simulateAuth',
    simulateSettlement: '/intserv/4.0/simulateSettlement',
    simulateAch: '/intserv/4.0/simulateAch',
    simulateLoad: '/intserv/4.0/simulateLoad',
    simulateTransaction: '/intserv/4.0/simulateTransaction',
    advanceTime: '/intserv/4.0/advanceTime',
    resetAccount: '/intserv/4.0/resetAccount',
  },

  // Utility endpoints
  utility: {
    getBinInfo: '/intserv/4.0/getBinInfo',
    validateCardNumber: '/intserv/4.0/validateCardNumber',
    getMccCodes: '/intserv/4.0/getMccCodes',
    getCountryCodes: '/intserv/4.0/getCountryCodes',
    getCurrencyCodes: '/intserv/4.0/getCurrencyCodes',
    testConnection: '/intserv/4.0/ping',
    getApiStatus: '/intserv/4.0/getApiStatus',
  },
} as const;

export type EndpointCategory = keyof typeof ENDPOINTS;
export type EndpointName<T extends EndpointCategory> = keyof (typeof ENDPOINTS)[T];
