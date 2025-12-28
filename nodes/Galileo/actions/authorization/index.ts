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
import { validateRequiredField, validateAmountField } from '../../utils/validationUtils';

/**
 * Authorization Resource - Operations and Descriptions
 */

export const authorizationOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['authorization'],
      },
    },
    options: [
      { name: 'Approve Authorization', value: 'approve', description: 'Approve a pending authorization', action: 'Approve an authorization' },
      { name: 'Decline Authorization', value: 'decline', description: 'Decline an authorization', action: 'Decline an authorization' },
      { name: 'Get Authorization', value: 'get', description: 'Get authorization details', action: 'Get an authorization' },
      { name: 'Get Auth by Merchant', value: 'getByMerchant', description: 'Get authorizations by merchant', action: 'Get auth by merchant' },
      { name: 'Get Auth Controls', value: 'getControls', description: 'Get authorization controls', action: 'Get auth controls' },
      { name: 'Get Pending Authorizations', value: 'getPending', description: 'Get pending authorizations', action: 'Get pending authorizations' },
      { name: 'List Authorizations', value: 'list', description: 'List all authorizations', action: 'List authorizations' },
      { name: 'Simulate Authorization', value: 'simulate', description: 'Simulate an authorization (sandbox)', action: 'Simulate an authorization' },
    ],
    default: 'get',
  },
];

export const authorizationFields: INodeProperties[] = [
  // Auth ID
  {
    displayName: 'Authorization ID',
    name: 'authId',
    type: 'string',
    required: true,
    default: '',
    description: 'The unique authorization identifier',
    displayOptions: {
      show: {
        resource: ['authorization'],
        operation: ['get', 'approve', 'decline'],
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
        resource: ['authorization'],
        operation: ['list', 'getPending', 'getControls'],
      },
    },
  },
  // Merchant Name
  {
    displayName: 'Merchant Name',
    name: 'merchantName',
    type: 'string',
    required: true,
    default: '',
    description: 'The merchant name to filter by',
    displayOptions: {
      show: {
        resource: ['authorization'],
        operation: ['getByMerchant'],
      },
    },
  },
  // Decline Reason
  {
    displayName: 'Decline Reason',
    name: 'declineReason',
    type: 'options',
    required: true,
    default: 'fraud',
    options: [
      { name: 'Fraud Suspected', value: 'fraud' },
      { name: 'Insufficient Funds', value: 'insufficient_funds' },
      { name: 'Card Blocked', value: 'card_blocked' },
      { name: 'Velocity Exceeded', value: 'velocity' },
      { name: 'MCC Blocked', value: 'mcc_blocked' },
      { name: 'Country Blocked', value: 'country_blocked' },
      { name: 'Other', value: 'other' },
    ],
    displayOptions: {
      show: {
        resource: ['authorization'],
        operation: ['decline'],
      },
    },
  },
  // Simulate Fields
  {
    displayName: 'Card Number',
    name: 'cardNo',
    type: 'string',
    required: true,
    default: '',
    description: 'The card number (PAN)',
    displayOptions: {
      show: {
        resource: ['authorization'],
        operation: ['simulate'],
      },
    },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    default: 0,
    description: 'Authorization amount',
    displayOptions: {
      show: {
        resource: ['authorization'],
        operation: ['simulate'],
      },
    },
  },
  {
    displayName: 'Merchant Name',
    name: 'merchantName',
    type: 'string',
    required: true,
    default: '',
    description: 'The merchant name',
    displayOptions: {
      show: {
        resource: ['authorization'],
        operation: ['simulate'],
      },
    },
  },
  {
    displayName: 'MCC Code',
    name: 'mccCode',
    type: 'string',
    default: '5411',
    description: 'Merchant Category Code',
    displayOptions: {
      show: {
        resource: ['authorization'],
        operation: ['simulate'],
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
        resource: ['authorization'],
        operation: ['list', 'getPending', 'getByMerchant'],
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
        displayName: 'Min Amount',
        name: 'minAmount',
        type: 'number',
        default: 0,
      },
      {
        displayName: 'Max Amount',
        name: 'maxAmount',
        type: 'number',
        default: 0,
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        options: [
          { name: 'All', value: '' },
          { name: 'Approved', value: 'approved' },
          { name: 'Declined', value: 'declined' },
          { name: 'Pending', value: 'pending' },
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

export async function executeAuthorizationOperations(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const client = await createGalileoClient.call(this);
  let response: GalileoResponse;

  switch (operation) {
    case 'get': {
      const authId = this.getNodeParameter('authId', index) as string;
      validateRequiredField(this, authId, 'Authorization ID', index);
      response = await client.request(ENDPOINTS.authorization.get, { authId });
      break;
    }

    case 'list': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.authorization.list, {
        accountNo,
        ...filters,
      });
      break;
    }

    case 'getPending': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, accountNo, 'Account Number', index);

      response = await client.request(ENDPOINTS.authorization.getPending, {
        accountNo,
        ...filters,
      });
      break;
    }

    case 'simulate': {
      const cardNo = this.getNodeParameter('cardNo', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const merchantName = this.getNodeParameter('merchantName', index) as string;
      const mccCode = this.getNodeParameter('mccCode', index, '5411') as string;

      validateRequiredField(this, cardNo, 'Card Number', index);
      validateAmountField(this, amount, 'Amount', index);
      validateRequiredField(this, merchantName, 'Merchant Name', index);

      response = await client.request(ENDPOINTS.authorization.simulate, {
        cardNo,
        amount: amount.toFixed(2),
        merchantName,
        mccCode,
      });
      break;
    }

    case 'approve': {
      const authId = this.getNodeParameter('authId', index) as string;
      validateRequiredField(this, authId, 'Authorization ID', index);
      response = await client.request(ENDPOINTS.authorization.approve, { authId });
      break;
    }

    case 'decline': {
      const authId = this.getNodeParameter('authId', index) as string;
      const declineReason = this.getNodeParameter('declineReason', index) as string;

      validateRequiredField(this, authId, 'Authorization ID', index);

      response = await client.request(ENDPOINTS.authorization.decline, {
        authId,
        reason: declineReason,
      });
      break;
    }

    case 'getByMerchant': {
      const merchantName = this.getNodeParameter('merchantName', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

      validateRequiredField(this, merchantName, 'Merchant Name', index);

      response = await client.request(ENDPOINTS.authorization.getByMerchant, {
        merchantName,
        ...filters,
      });
      break;
    }

    case 'getControls': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      validateRequiredField(this, accountNo, 'Account Number', index);
      response = await client.request(ENDPOINTS.authorization.getControls, { accountNo });
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
