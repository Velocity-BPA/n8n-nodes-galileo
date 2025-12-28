// @ts-nocheck
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
import { validateRequiredField, validateAmountField, validateRoutingNumber, validateAccountNumber } from '../../utils/validationUtils';

/**
 * Payment Resource - Operations and Descriptions
 */

export const paymentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['payment'],
      },
    },
    options: [
      { name: 'Cancel Payment', value: 'cancel', description: 'Cancel a pending payment', action: 'Cancel a payment' },
      { name: 'Create ACH Transfer', value: 'createAch', description: 'Create an ACH transfer', action: 'Create ACH transfer' },
      { name: 'Create Card-to-Card Transfer', value: 'createCardToCard', description: 'Transfer between cards', action: 'Create card-to-card transfer' },
      { name: 'Create Instant Transfer', value: 'createInstant', description: 'Create an instant transfer', action: 'Create instant transfer' },
      { name: 'Get Payment', value: 'get', description: 'Get payment details', action: 'Get a payment' },
      { name: 'Get Payment History', value: 'getHistory', description: 'Get payment history', action: 'Get payment history' },
      { name: 'Get Payment Status', value: 'getStatus', description: 'Get payment status', action: 'Get payment status' },
      { name: 'Get Payments by Account', value: 'getByAccount', description: 'Get payments by account', action: 'Get payments by account' },
    ],
    default: 'get',
  },
];

export const paymentFields: INodeProperties[] = [
  // Payment ID
  {
    displayName: 'Payment ID',
    name: 'paymentId',
    type: 'string',
    required: true,
    default: '',
    description: 'The unique payment identifier',
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['get', 'getStatus', 'cancel'],
      },
    },
  },
  // Source Account
  {
    displayName: 'Source Account',
    name: 'sourceAccount',
    type: 'string',
    required: true,
    default: '',
    description: 'The source account number (PRN)',
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['createAch', 'createInstant', 'createCardToCard', 'getByAccount', 'getHistory'],
      },
    },
  },
  // Amount
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    default: 0,
    description: 'Transfer amount in dollars',
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['createAch', 'createInstant', 'createCardToCard'],
      },
    },
  },
  // ACH Fields
  {
    displayName: 'Routing Number',
    name: 'routingNumber',
    type: 'string',
    required: true,
    default: '',
    description: 'Destination bank routing number (9 digits)',
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['createAch'],
      },
    },
  },
  {
    displayName: 'Account Number',
    name: 'destAccountNo',
    type: 'string',
    required: true,
    default: '',
    description: 'Destination bank account number',
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['createAch'],
      },
    },
  },
  {
    displayName: 'Account Type',
    name: 'accountType',
    type: 'options',
    required: true,
    default: 'checking',
    options: [
      { name: 'Checking', value: 'checking' },
      { name: 'Savings', value: 'savings' },
    ],
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['createAch'],
      },
    },
  },
  {
    displayName: 'ACH Type',
    name: 'achType',
    type: 'options',
    required: true,
    default: 'credit',
    options: [
      { name: 'Credit (Push)', value: 'credit' },
      { name: 'Debit (Pull)', value: 'debit' },
    ],
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['createAch'],
      },
    },
  },
  // Instant Transfer Fields
  {
    displayName: 'Destination Account',
    name: 'destAccount',
    type: 'string',
    required: true,
    default: '',
    description: 'Destination account number (PRN)',
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['createInstant', 'createCardToCard'],
      },
    },
  },
  // Memo/Description
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    default: '',
    description: 'Payment description or memo',
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['createAch', 'createInstant', 'createCardToCard'],
      },
    },
  },
  // Cancel Reason
  {
    displayName: 'Cancel Reason',
    name: 'cancelReason',
    type: 'string',
    default: '',
    description: 'Reason for cancellation',
    displayOptions: {
      show: {
        resource: ['payment'],
        operation: ['cancel'],
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
        resource: ['payment'],
        operation: ['getByAccount', 'getHistory'],
      },
    },
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'string',
        default: '',
        description: 'Filter from this date (YYYY-MM-DD)',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'string',
        default: '',
        description: 'Filter to this date (YYYY-MM-DD)',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        options: [
          { name: 'All', value: '' },
          { name: 'Pending', value: 'pending' },
          { name: 'Completed', value: 'completed' },
          { name: 'Failed', value: 'failed' },
          { name: 'Cancelled', value: 'cancelled' },
        ],
      },
      {
        displayName: 'Payment Type',
        name: 'paymentType',
        type: 'options',
        default: '',
        options: [
          { name: 'All', value: '' },
          { name: 'ACH', value: 'ach' },
          { name: 'Instant', value: 'instant' },
          { name: 'Card-to-Card', value: 'card_to_card' },
        ],
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
      },
    ],
  },
];

export async function executePaymentOperations(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const client = await createGalileoClient.call(this);
  let response: GalileoResponse;

  switch (operation) {
    case 'get': {
      const paymentId = this.getNodeParameter('paymentId', index) as string;
      validateRequiredField(this, paymentId, 'Payment ID', index);
      response = await client.request(ENDPOINTS.payment.get, { paymentId });
      break;
    }

    case 'getStatus': {
      const paymentId = this.getNodeParameter('paymentId', index) as string;
      validateRequiredField(this, paymentId, 'Payment ID', index);
      response = await client.request(ENDPOINTS.payment.getStatus, { paymentId });
      break;
    }

    case 'createAch': {
      const sourceAccount = this.getNodeParameter('sourceAccount', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const routingNumber = this.getNodeParameter('routingNumber', index) as string;
      const destAccountNo = this.getNodeParameter('destAccountNo', index) as string;
      const accountType = this.getNodeParameter('accountType', index) as string;
      const achType = this.getNodeParameter('achType', index) as string;
      const description = this.getNodeParameter('description', index, '') as string;

      validateRequiredField(this, sourceAccount, 'Source Account', index);
      validateAmountField(this, amount, 'Amount', index);
      if (!validateRoutingNumber(routingNumber)) {
        throw new Error('Invalid routing number format (must be 9 digits)');
      }
      if (!validateAccountNumber(destAccountNo)) {
        throw new Error('Invalid account number format');
      }

      const params: IDataObject = {
        sourceAccount,
        amount: amount.toFixed(2),
        routingNumber,
        destAccountNo,
        accountType,
        achType,
      };

      if (description) params.description = description;

      response = await client.request(ENDPOINTS.payment.createAch, params);
      break;
    }

    case 'createInstant': {
      const sourceAccount = this.getNodeParameter('sourceAccount', index) as string;
      const destAccount = this.getNodeParameter('destAccount', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const description = this.getNodeParameter('description', index, '') as string;

      validateRequiredField(this, sourceAccount, 'Source Account', index);
      validateRequiredField(this, destAccount, 'Destination Account', index);
      validateAmountField(this, amount, 'Amount', index);

      const params: IDataObject = {
        sourceAccount,
        destAccount,
        amount: amount.toFixed(2),
      };

      if (description) params.description = description;

      response = await client.request(ENDPOINTS.payment.createInstant, params);
      break;
    }

    case 'createCardToCard': {
      const sourceAccount = this.getNodeParameter('sourceAccount', index) as string;
      const destAccount = this.getNodeParameter('destAccount', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const description = this.getNodeParameter('description', index, '') as string;

      validateRequiredField(this, sourceAccount, 'Source Account', index);
      validateRequiredField(this, destAccount, 'Destination Account', index);
      validateAmountField(this, amount, 'Amount', index);

      const params: IDataObject = {
        sourceAccount,
        destAccount,
        amount: amount.toFixed(2),
      };

      if (description) params.description = description;

      response = await client.request(ENDPOINTS.payment.createCardToCard, params);
      break;
    }

    case 'cancel': {
      const paymentId = this.getNodeParameter('paymentId', index) as string;
      const cancelReason = this.getNodeParameter('cancelReason', index, '') as string;

      validateRequiredField(this, paymentId, 'Payment ID', index);

      response = await client.request(ENDPOINTS.payment.cancel, {
        paymentId,
        reason: cancelReason,
      });
      break;
    }

    case 'getByAccount': {
      const sourceAccount = this.getNodeParameter('sourceAccount', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, sourceAccount, 'Source Account', index);

      response = await client.request(ENDPOINTS.payment.getByAccount, {
        accountNo: sourceAccount,
        ...filters,
      });
      break;
    }

    case 'getHistory': {
      const sourceAccount = this.getNodeParameter('sourceAccount', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, sourceAccount, 'Source Account', index);

      response = await client.request(ENDPOINTS.payment.getHistory, {
        accountNo: sourceAccount,
        ...filters,
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
