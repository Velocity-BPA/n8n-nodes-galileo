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
import { TRANSACTION_TYPE_OPTIONS } from '../../constants/transactionTypes';
import { validateRequiredField, validateAmountField } from '../../utils/validationUtils';

/**
 * Transaction Resource - Operations and Descriptions
 */

export const transactionOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
      },
    },
    options: [
      { name: 'Adjust Transaction', value: 'adjust', description: 'Adjust a transaction amount', action: 'Adjust a transaction' },
      { name: 'Get Pending Transactions', value: 'getPending', description: 'Get pending transactions', action: 'Get pending transactions' },
      { name: 'Get Posted Transactions', value: 'getPosted', description: 'Get posted transactions', action: 'Get posted transactions' },
      { name: 'Get Transaction', value: 'get', description: 'Get transaction details', action: 'Get a transaction' },
      { name: 'Get Transaction Details', value: 'getDetails', description: 'Get detailed transaction info', action: 'Get transaction details' },
      { name: 'Get Transactions by Account', value: 'getByAccount', description: 'Get transactions by account', action: 'Get transactions by account' },
      { name: 'Get Transactions by Card', value: 'getByCard', description: 'Get transactions by card', action: 'Get transactions by card' },
      { name: 'Get Transactions by Date', value: 'getByDate', description: 'Get transactions by date range', action: 'Get transactions by date' },
      { name: 'List Transactions', value: 'list', description: 'List all transactions', action: 'List transactions' },
      { name: 'Reverse Transaction', value: 'reverse', description: 'Reverse a transaction', action: 'Reverse a transaction' },
      { name: 'Search Transactions', value: 'search', description: 'Search transactions', action: 'Search transactions' },
    ],
    default: 'get',
  },
];

export const transactionFields: INodeProperties[] = [
  // Transaction ID
  {
    displayName: 'Transaction ID',
    name: 'transactionId',
    type: 'string',
    required: true,
    default: '',
    description: 'The unique transaction identifier',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['get', 'getDetails', 'adjust', 'reverse'],
      },
    },
  },
  // Account Number
  {
    displayName: 'Account Number',
    name: 'accountNo',
    type: 'string',
    required: true,
    default: '',
    description: 'The account number (PRN)',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['getByAccount', 'getPending', 'getPosted'],
      },
    },
  },
  // Card Number
  {
    displayName: 'Card Number',
    name: 'cardNo',
    type: 'string',
    required: true,
    default: '',
    description: 'The card number (PAN or masked)',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['getByCard'],
      },
    },
  },
  // Date Range Fields
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'YYYY-MM-DD',
    description: 'Start date for transaction query',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['getByDate', 'list'],
      },
    },
  },
  {
    displayName: 'End Date',
    name: 'endDate',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'YYYY-MM-DD',
    description: 'End date for transaction query',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['getByDate', 'list'],
      },
    },
  },
  // Adjustment Fields
  {
    displayName: 'Adjustment Amount',
    name: 'adjustmentAmount',
    type: 'number',
    required: true,
    default: 0,
    description: 'Amount to adjust (positive or negative)',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['adjust'],
      },
    },
  },
  {
    displayName: 'Adjustment Reason',
    name: 'adjustmentReason',
    type: 'string',
    required: true,
    default: '',
    description: 'Reason for the adjustment',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['adjust'],
      },
    },
  },
  // Reversal Fields
  {
    displayName: 'Reversal Reason',
    name: 'reversalReason',
    type: 'string',
    required: true,
    default: '',
    description: 'Reason for the reversal',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['reverse'],
      },
    },
  },
  // Search Fields
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    required: true,
    default: '',
    description: 'Search query for transactions',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['search'],
      },
    },
  },
  // Filters
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['list', 'getByAccount', 'getByCard', 'getByDate', 'search', 'getPending', 'getPosted'],
      },
    },
    options: [
      {
        displayName: 'Transaction Type',
        name: 'transactionType',
        type: 'options',
        default: '',
        options: TRANSACTION_TYPE_OPTIONS,
      },
      {
        displayName: 'Min Amount',
        name: 'minAmount',
        type: 'number',
        default: 0,
        description: 'Minimum transaction amount',
      },
      {
        displayName: 'Max Amount',
        name: 'maxAmount',
        type: 'number',
        default: 0,
        description: 'Maximum transaction amount',
      },
      {
        displayName: 'Merchant Name',
        name: 'merchantName',
        type: 'string',
        default: '',
        description: 'Filter by merchant name',
      },
      {
        displayName: 'MCC Code',
        name: 'mccCode',
        type: 'string',
        default: '',
        description: 'Filter by Merchant Category Code',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Maximum number of results',
      },
      {
        displayName: 'Offset',
        name: 'offset',
        type: 'number',
        default: 0,
        description: 'Number of results to skip',
      },
    ],
  },
];

export async function executeTransactionOperations(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const client = await createGalileoClient.call(this);
  let response: GalileoResponse;

  switch (operation) {
    case 'get': {
      const transactionId = this.getNodeParameter('transactionId', index) as string;
      validateRequiredField(this, transactionId, 'Transaction ID', index);
      response = await client.request(ENDPOINTS.transaction.get, { transactionId });
      break;
    }

    case 'getDetails': {
      const transactionId = this.getNodeParameter('transactionId', index) as string;
      validateRequiredField(this, transactionId, 'Transaction ID', index);
      response = await client.request(ENDPOINTS.transaction.getDetails, { transactionId });
      break;
    }

    case 'list': {
      const startDate = this.getNodeParameter('startDate', index) as string;
      const endDate = this.getNodeParameter('endDate', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, startDate, 'Start Date', index);
      validateRequiredField(this, endDate, 'End Date', index);

      response = await client.request(ENDPOINTS.transaction.list, {
        startDate,
        endDate,
        ...filters,
      });
      break;
    }

    case 'getByAccount': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.transaction.getByAccount, {
        accountNo,
        ...filters,
      });
      break;
    }

    case 'getByCard': {
      const cardNo = this.getNodeParameter('cardNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, cardNo, 'Card Number', index);

      response = await client.request(ENDPOINTS.transaction.getByCard, {
        cardNo,
        ...filters,
      });
      break;
    }

    case 'getByDate': {
      const startDate = this.getNodeParameter('startDate', index) as string;
      const endDate = this.getNodeParameter('endDate', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, startDate, 'Start Date', index);
      validateRequiredField(this, endDate, 'End Date', index);

      response = await client.request(ENDPOINTS.transaction.getByDate, {
        startDate,
        endDate,
        ...filters,
      });
      break;
    }

    case 'getPending': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.transaction.getPending, {
        accountNo,
        ...filters,
      });
      break;
    }

    case 'getPosted': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.transaction.getPosted, {
        accountNo,
        ...filters,
      });
      break;
    }

    case 'search': {
      const searchQuery = this.getNodeParameter('searchQuery', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, searchQuery, 'Search Query', index);

      response = await client.request(ENDPOINTS.transaction.search, {
        query: searchQuery,
        ...filters,
      });
      break;
    }

    case 'adjust': {
      const transactionId = this.getNodeParameter('transactionId', index) as string;
      const adjustmentAmount = this.getNodeParameter('adjustmentAmount', index) as number;
      const adjustmentReason = this.getNodeParameter('adjustmentReason', index) as string;

      validateRequiredField(this, transactionId, 'Transaction ID', index);
      validateAmountField(this, Math.abs(adjustmentAmount), 'Adjustment Amount', index);
      validateRequiredField(this, adjustmentReason, 'Adjustment Reason', index);

      response = await client.request(ENDPOINTS.transaction.adjust, {
        transactionId,
        amount: adjustmentAmount.toFixed(2),
        reason: adjustmentReason,
      });
      break;
    }

    case 'reverse': {
      const transactionId = this.getNodeParameter('transactionId', index) as string;
      const reversalReason = this.getNodeParameter('reversalReason', index) as string;

      validateRequiredField(this, transactionId, 'Transaction ID', index);
      validateRequiredField(this, reversalReason, 'Reversal Reason', index);

      response = await client.request(ENDPOINTS.transaction.reverse, {
        transactionId,
        reason: reversalReason,
      });
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
