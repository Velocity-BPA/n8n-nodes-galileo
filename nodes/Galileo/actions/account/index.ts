/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  IDataObject,
} from 'n8n-workflow';
import { createGalileoClient, GalileoResponse } from '../../transport/galileoClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { ACCOUNT_STATUS_OPTIONS } from '../../constants/cardStatuses';
import { validateRequiredField, validateAmountField } from '../../utils/validationUtils';

/**
 * Account Resource - Operations and Descriptions
 */

export const accountOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['account'],
      },
    },
    options: [
      { name: 'Close Account', value: 'close', description: 'Close an account', action: 'Close an account' },
      { name: 'Create Account', value: 'create', description: 'Create a new account', action: 'Create an account' },
      { name: 'Freeze Account', value: 'freeze', description: 'Freeze an account', action: 'Freeze an account' },
      { name: 'Get Account', value: 'get', description: 'Get account overview', action: 'Get an account' },
      { name: 'Get Account Balance', value: 'getBalance', description: 'Get account balance', action: 'Get account balance' },
      { name: 'Get Account by External ID', value: 'getByExternalId', description: 'Get account by external ID', action: 'Get account by external ID' },
      { name: 'Get Account History', value: 'getHistory', description: 'Get account history', action: 'Get account history' },
      { name: 'Get Account Limits', value: 'getLimits', description: 'Get account limits', action: 'Get account limits' },
      { name: 'Get Account Status', value: 'getStatus', description: 'Get account status', action: 'Get account status' },
      { name: 'Get Account Transactions', value: 'getTransactions', description: 'Get account transactions', action: 'Get account transactions' },
      { name: 'List Accounts', value: 'list', description: 'List all accounts', action: 'List accounts' },
      { name: 'Unfreeze Account', value: 'unfreeze', description: 'Unfreeze an account', action: 'Unfreeze an account' },
      { name: 'Update Account Limits', value: 'updateLimits', description: 'Update account limits', action: 'Update account limits' },
      { name: 'Update Account Status', value: 'updateStatus', description: 'Update account status', action: 'Update account status' },
    ],
    default: 'get',
  },
];

export const accountFields: INodeProperties[] = [
  // Account Number (common field)
  {
    displayName: 'Account Number',
    name: 'accountNo',
    type: 'string',
    required: true,
    default: '',
    description: 'The account number (PRN)',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['get', 'getBalance', 'getStatus', 'getHistory', 'getTransactions', 'getLimits', 'updateLimits', 'updateStatus', 'freeze', 'unfreeze', 'close'],
      },
    },
  },
  // External ID
  {
    displayName: 'External ID',
    name: 'externalId',
    type: 'string',
    required: true,
    default: '',
    description: 'The external ID assigned to the account',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getByExternalId'],
      },
    },
  },
  // Create Account Fields
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'string',
    required: true,
    default: '',
    description: 'The product ID for the account type',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Cardholder PRN',
    name: 'cardholderPrn',
    type: 'string',
    required: true,
    default: '',
    description: 'The PRN of the cardholder',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'External ID',
        name: 'externalId',
        type: 'string',
        default: '',
        description: 'Optional external ID for the account',
      },
      {
        displayName: 'Initial Load Amount',
        name: 'initialLoad',
        type: 'number',
        typeOptions: { numberPrecision: 2, minValue: 0 },
        default: 0,
        description: 'Initial amount to load into the account',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'options',
        options: [
          { name: 'USD', value: 'USD' },
          { name: 'EUR', value: 'EUR' },
          { name: 'GBP', value: 'GBP' },
          { name: 'CAD', value: 'CAD' },
          { name: 'MXN', value: 'MXN' },
        ],
        default: 'USD',
        description: 'Account currency',
      },
    ],
  },
  // Update Status Fields
  {
    displayName: 'New Status',
    name: 'newStatus',
    type: 'options',
    options: ACCOUNT_STATUS_OPTIONS,
    required: true,
    default: '',
    description: 'The new status for the account',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['updateStatus'],
      },
    },
  },
  {
    displayName: 'Status Reason',
    name: 'statusReason',
    type: 'string',
    default: '',
    description: 'Reason for the status change',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['updateStatus', 'freeze', 'close'],
      },
    },
  },
  // Update Limits Fields
  {
    displayName: 'Limit Type',
    name: 'limitType',
    type: 'options',
    options: [
      { name: 'Daily Spend', value: 'dailySpend' },
      { name: 'Monthly Spend', value: 'monthlySpend' },
      { name: 'Daily Load', value: 'dailyLoad' },
      { name: 'Monthly Load', value: 'monthlyLoad' },
      { name: 'Daily ATM', value: 'dailyAtm' },
      { name: 'Monthly ATM', value: 'monthlyAtm' },
    ],
    required: true,
    default: 'dailySpend',
    description: 'The type of limit to update',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['updateLimits'],
      },
    },
  },
  {
    displayName: 'Limit Amount',
    name: 'limitAmount',
    type: 'number',
    typeOptions: { numberPrecision: 2, minValue: 0 },
    required: true,
    default: 0,
    description: 'The new limit amount',
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['updateLimits'],
      },
    },
  },
  // Transaction History Filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['account'],
        operation: ['getHistory', 'getTransactions', 'list'],
      },
    },
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Start date for the history range',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        default: '',
        description: 'End date for the history range',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: { minValue: 1, maxValue: 1000 },
        default: 100,
        description: 'Maximum number of records to return',
      },
      {
        displayName: 'Offset',
        name: 'offset',
        type: 'number',
        typeOptions: { minValue: 0 },
        default: 0,
        description: 'Number of records to skip',
      },
    ],
  },
];

/**
 * Execute account operations
 */
export async function executeAccountOperations(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const client = await createGalileoClient(this);

  let response: GalileoResponse;

  switch (operation) {
    case 'create': {
      const productId = this.getNodeParameter('productId', index) as string;
      const cardholderPrn = this.getNodeParameter('cardholderPrn', index) as string;
      const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

      validateRequiredField(this, productId, 'Product ID', index);
      validateRequiredField(this, cardholderPrn, 'Cardholder PRN', index);

      const params: IDataObject = {
        productId,
        prnCardholder: cardholderPrn,
        ...additionalFields,
      };

      response = await client.request(ENDPOINTS.account.create, params);
      break;
    }

    case 'get': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      validateRequiredField(this, accountNo, 'Account Number', index);
      response = await client.request(ENDPOINTS.account.get, { accountNo });
      break;
    }

    case 'getBalance': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      validateRequiredField(this, accountNo, 'Account Number', index);
      response = await client.request(ENDPOINTS.account.getBalance, { accountNo });
      break;
    }

    case 'getStatus': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      validateRequiredField(this, accountNo, 'Account Number', index);
      response = await client.request(ENDPOINTS.account.getStatus, { accountNo });
      break;
    }

    case 'updateStatus': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const newStatus = this.getNodeParameter('newStatus', index) as string;
      const statusReason = this.getNodeParameter('statusReason', index, '') as string;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.account.updateStatus, {
        accountNo,
        status: newStatus,
        reason: statusReason,
      });
      break;
    }

    case 'freeze': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const statusReason = this.getNodeParameter('statusReason', index, '') as string;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.account.freeze, {
        accountNo,
        reason: statusReason,
      });
      break;
    }

    case 'unfreeze': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      validateRequiredField(this, accountNo, 'Account Number', index);
      response = await client.request(ENDPOINTS.account.unfreeze, { accountNo });
      break;
    }

    case 'close': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const statusReason = this.getNodeParameter('statusReason', index, '') as string;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.account.close, {
        accountNo,
        reason: statusReason,
      });
      break;
    }

    case 'getHistory': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.account.getHistory, {
        accountNo,
        ...filters,
      });
      break;
    }

    case 'getTransactions': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.account.getTransactions, {
        accountNo,
        ...filters,
      });
      break;
    }

    case 'getLimits': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      validateRequiredField(this, accountNo, 'Account Number', index);
      response = await client.request(ENDPOINTS.account.getLimits, { accountNo });
      break;
    }

    case 'updateLimits': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const limitType = this.getNodeParameter('limitType', index) as string;
      const limitAmount = this.getNodeParameter('limitAmount', index) as number;

      validateRequiredField(this, accountNo, 'Account Number', index);
      validateAmountField(this, limitAmount, 'Limit Amount', index);

      response = await client.request(ENDPOINTS.account.updateLimits, {
        accountNo,
        limitType,
        limitAmount: limitAmount.toFixed(2),
      });
      break;
    }

    case 'getByExternalId': {
      const externalId = this.getNodeParameter('externalId', index) as string;
      validateRequiredField(this, externalId, 'External ID', index);
      response = await client.request(ENDPOINTS.account.getByExternalId, { externalId });
      break;
    }

    case 'list': {
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
      response = await client.request(ENDPOINTS.account.list, filters);
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return [
    {
      json: {
        success: response.status === 0,
        statusCode: response.statusCode,
        statusMessage: response.statusMessage,
        transactionId: response.transactionId,
        data: response.data,
      },
    },
  ];
}
