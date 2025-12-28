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
import { validateRequiredField, validateAmountField } from '../../utils/validationUtils';

export const loadOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['load'] } },
    options: [
      { name: 'Cancel Load', value: 'cancel', description: 'Cancel a pending load', action: 'Cancel a load' },
      { name: 'Get Load by Reference', value: 'getByReference', description: 'Get load by reference ID', action: 'Get load by reference' },
      { name: 'Get Load History', value: 'getHistory', description: 'Get load history', action: 'Get load history' },
      { name: 'Get Load Status', value: 'getStatus', description: 'Get load status', action: 'Get load status' },
      { name: 'Load Funds', value: 'load', description: 'Load funds to an account', action: 'Load funds' },
      { name: 'Load Funds Immediate', value: 'loadImmediate', description: 'Load funds immediately', action: 'Load funds immediate' },
    ],
    default: 'load',
  },
];

export const loadFields: INodeProperties[] = [
  {
    displayName: 'Account Number',
    name: 'accountNo',
    type: 'string',
    required: true,
    default: '',
    description: 'The account number (PRN)',
    displayOptions: { show: { resource: ['load'], operation: ['load', 'loadImmediate', 'getHistory'] } },
  },
  {
    displayName: 'Load ID',
    name: 'loadId',
    type: 'string',
    required: true,
    default: '',
    description: 'The load transaction ID',
    displayOptions: { show: { resource: ['load'], operation: ['getStatus', 'cancel'] } },
  },
  {
    displayName: 'Reference ID',
    name: 'referenceId',
    type: 'string',
    required: true,
    default: '',
    description: 'The external reference ID',
    displayOptions: { show: { resource: ['load'], operation: ['getByReference'] } },
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    default: 0,
    description: 'Amount to load in dollars',
    displayOptions: { show: { resource: ['load'], operation: ['load', 'loadImmediate'] } },
  },
  {
    displayName: 'Load Type',
    name: 'loadType',
    type: 'options',
    default: 'standard',
    options: [
      { name: 'Standard', value: 'standard' },
      { name: 'Cash', value: 'cash' },
      { name: 'Check', value: 'check' },
      { name: 'ACH', value: 'ach' },
      { name: 'Wire', value: 'wire' },
    ],
    displayOptions: { show: { resource: ['load'], operation: ['load', 'loadImmediate'] } },
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    default: '',
    displayOptions: { show: { resource: ['load'], operation: ['load', 'loadImmediate'] } },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: { show: { resource: ['load'], operation: ['getHistory'] } },
    options: [
      { displayName: 'Start Date', name: 'startDate', type: 'string', default: '' },
      { displayName: 'End Date', name: 'endDate', type: 'string', default: '' },
      { displayName: 'Limit', name: 'limit', type: 'number', default: 50 },
    ],
  },
];

export async function executeLoadOperations(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const client = await createGalileoClient.call(this);
  let response: GalileoResponse;

  switch (operation) {
    case 'load': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const loadType = this.getNodeParameter('loadType', index, 'standard') as string;
      const description = this.getNodeParameter('description', index, '') as string;

      validateRequiredField(this, accountNo, 'Account Number', index);
      validateAmountField(this, amount, 'Amount', index);

      const params: IDataObject = { accountNo, amount: amount.toFixed(2), loadType };
      if (description) params.description = description;

      response = await client.request(ENDPOINTS.load.funds, params);
      break;
    }

    case 'loadImmediate': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const amount = this.getNodeParameter('amount', index) as number;
      const loadType = this.getNodeParameter('loadType', index, 'standard') as string;
      const description = this.getNodeParameter('description', index, '') as string;

      validateRequiredField(this, accountNo, 'Account Number', index);
      validateAmountField(this, amount, 'Amount', index);

      const params: IDataObject = { accountNo, amount: amount.toFixed(2), loadType, immediate: true };
      if (description) params.description = description;

      response = await client.request(ENDPOINTS.load.fundsImmediate, params);
      break;
    }

    case 'getStatus': {
      const loadId = this.getNodeParameter('loadId', index) as string;
      validateRequiredField(this, loadId, 'Load ID', index);
      response = await client.request(ENDPOINTS.load.getStatus, { loadId });
      break;
    }

    case 'getHistory': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
      validateRequiredField(this, accountNo, 'Account Number', index);
      response = await client.request(ENDPOINTS.load.getHistory, { accountNo, ...filters });
      break;
    }

    case 'getByReference': {
      const referenceId = this.getNodeParameter('referenceId', index) as string;
      validateRequiredField(this, referenceId, 'Reference ID', index);
      response = await client.request(ENDPOINTS.load.getByReference, { referenceId });
      break;
    }

    case 'cancel': {
      const loadId = this.getNodeParameter('loadId', index) as string;
      validateRequiredField(this, loadId, 'Load ID', index);
      response = await client.request(ENDPOINTS.load.cancel, { loadId });
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return [{
    json: {
      success: response.status === 0,
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      transactionId: response.transactionId,
      data: response.data,
    },
  }];
}
