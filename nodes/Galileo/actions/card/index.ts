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
import { CARD_STATUS_OPTIONS } from '../../constants/cardStatuses';
import { validateRequiredField } from '../../utils/validationUtils';

/**
 * Card Resource - Operations and Descriptions
 */

export const cardOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['card'],
      },
    },
    options: [
      { name: 'Activate Card', value: 'activate', description: 'Activate a card', action: 'Activate a card' },
      { name: 'Close Card', value: 'close', description: 'Close a card', action: 'Close a card' },
      { name: 'Create Card', value: 'create', description: 'Create a new card', action: 'Create a card' },
      { name: 'Freeze Card', value: 'freeze', description: 'Freeze a card', action: 'Freeze a card' },
      { name: 'Get Card', value: 'get', description: 'Get card information', action: 'Get a card' },
      { name: 'Get Card CVV2', value: 'getCvv2', description: 'Get card CVV2 (PCI required)', action: 'Get card CVV2' },
      { name: 'Get Card Details', value: 'getDetails', description: 'Get full card details (PCI required)', action: 'Get card details' },
      { name: 'Get Card Expiration', value: 'getExpiration', description: 'Get card expiration date', action: 'Get card expiration' },
      { name: 'Get Card PIN', value: 'getPin', description: 'Get card PIN (PCI required)', action: 'Get card PIN' },
      { name: 'Get Card Status', value: 'getStatus', description: 'Get card status', action: 'Get card status' },
      { name: 'List Cards by Account', value: 'listByAccount', description: 'List all cards for an account', action: 'List cards by account' },
      { name: 'Reissue Card', value: 'reissue', description: 'Reissue a card with same number', action: 'Reissue a card' },
      { name: 'Replace Card', value: 'replace', description: 'Replace with new card number', action: 'Replace a card' },
      { name: 'Reset Card PIN', value: 'resetPin', description: 'Reset card PIN', action: 'Reset card PIN' },
      { name: 'Set Card PIN', value: 'setPin', description: 'Set card PIN', action: 'Set card PIN' },
      { name: 'Unfreeze Card', value: 'unfreeze', description: 'Unfreeze a card', action: 'Unfreeze a card' },
      { name: 'Update Card Limits', value: 'updateLimits', description: 'Update card limits', action: 'Update card limits' },
      { name: 'Update Card Status', value: 'updateStatus', description: 'Update card status', action: 'Update card status' },
    ],
    default: 'get',
  },
];

export const cardFields: INodeProperties[] = [
  // Card ID / PRN
  {
    displayName: 'Card ID',
    name: 'cardId',
    type: 'string',
    required: true,
    default: '',
    description: 'The card ID or PRN',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['get', 'getDetails', 'activate', 'freeze', 'unfreeze', 'replace', 'reissue', 'close', 'getStatus', 'updateStatus', 'getPin', 'setPin', 'resetPin', 'getCvv2', 'getExpiration', 'updateLimits'],
      },
    },
  },
  // Account Number for listing and creating cards
  {
    displayName: 'Account Number',
    name: 'accountNo',
    type: 'string',
    required: true,
    default: '',
    description: 'The account number (PRN)',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['create', 'listByAccount'],
      },
    },
  },
  // Create Card Fields
  {
    displayName: 'Product ID',
    name: 'productId',
    type: 'string',
    required: true,
    default: '',
    description: 'The product ID for the card type',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Card Type',
    name: 'cardType',
    type: 'options',
    options: [
      { name: 'Physical Card', value: 'physical' },
      { name: 'Virtual Card', value: 'virtual' },
    ],
    default: 'physical',
    description: 'Type of card to create',
    displayOptions: {
      show: {
        resource: ['card'],
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
        resource: ['card'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Emboss Name',
        name: 'embossName',
        type: 'string',
        default: '',
        description: 'Name to emboss on the card (max 21 characters)',
      },
      {
        displayName: 'Expedited Shipping',
        name: 'expedited',
        type: 'boolean',
        default: false,
        description: 'Whether to expedite card shipping',
      },
      {
        displayName: 'External ID',
        name: 'externalId',
        type: 'string',
        default: '',
        description: 'Optional external ID for the card',
      },
      {
        displayName: 'Shipping Address Line 1',
        name: 'shipAddr1',
        type: 'string',
        default: '',
        description: 'Shipping address line 1',
      },
      {
        displayName: 'Shipping Address Line 2',
        name: 'shipAddr2',
        type: 'string',
        default: '',
        description: 'Shipping address line 2',
      },
      {
        displayName: 'Shipping City',
        name: 'shipCity',
        type: 'string',
        default: '',
        description: 'Shipping city',
      },
      {
        displayName: 'Shipping State',
        name: 'shipState',
        type: 'string',
        default: '',
        description: 'Shipping state (2-letter code)',
      },
      {
        displayName: 'Shipping ZIP',
        name: 'shipZip',
        type: 'string',
        default: '',
        description: 'Shipping ZIP code',
      },
    ],
  },
  // Activation Fields
  {
    displayName: 'Last 4 Digits',
    name: 'last4',
    type: 'string',
    default: '',
    description: 'Last 4 digits of card for verification (optional)',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['activate'],
      },
    },
  },
  {
    displayName: 'CVV2',
    name: 'cvv2',
    type: 'string',
    default: '',
    description: 'CVV2 for verification (optional)',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['activate'],
      },
    },
  },
  // Update Status
  {
    displayName: 'New Status',
    name: 'newStatus',
    type: 'options',
    options: CARD_STATUS_OPTIONS,
    required: true,
    default: '',
    description: 'The new status for the card',
    displayOptions: {
      show: {
        resource: ['card'],
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
        resource: ['card'],
        operation: ['updateStatus', 'freeze', 'close'],
      },
    },
  },
  // PIN Fields
  {
    displayName: 'New PIN',
    name: 'newPin',
    type: 'string',
    typeOptions: { password: true },
    required: true,
    default: '',
    description: 'The new 4-digit PIN',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['setPin'],
      },
    },
  },
  // Replace/Reissue Fields
  {
    displayName: 'Replacement Reason',
    name: 'replacementReason',
    type: 'options',
    options: [
      { name: 'Damaged', value: 'damaged' },
      { name: 'Lost', value: 'lost' },
      { name: 'Stolen', value: 'stolen' },
      { name: 'Expired', value: 'expired' },
      { name: 'Other', value: 'other' },
    ],
    default: 'damaged',
    description: 'Reason for card replacement',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['replace', 'reissue'],
      },
    },
  },
  // Card Limits
  {
    displayName: 'Limit Type',
    name: 'limitType',
    type: 'options',
    options: [
      { name: 'Daily Spend', value: 'dailySpend' },
      { name: 'Per Transaction', value: 'perTransaction' },
      { name: 'Daily ATM', value: 'dailyAtm' },
      { name: 'Daily POS', value: 'dailyPos' },
    ],
    required: true,
    default: 'dailySpend',
    description: 'The type of limit to update',
    displayOptions: {
      show: {
        resource: ['card'],
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
        resource: ['card'],
        operation: ['updateLimits'],
      },
    },
  },
];

/**
 * Execute card operations
 */
export async function executeCardOperations(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const client = await createGalileoClient(this);

  let response: GalileoResponse;

  switch (operation) {
    case 'create': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      const productId = this.getNodeParameter('productId', index) as string;
      const cardType = this.getNodeParameter('cardType', index) as string;
      const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

      validateRequiredField(this, accountNo, 'Account Number', index);
      validateRequiredField(this, productId, 'Product ID', index);

      response = await client.request(ENDPOINTS.card.create, {
        accountNo,
        productId,
        cardType,
        ...additionalFields,
      });
      break;
    }

    case 'get': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      validateRequiredField(this, cardId, 'Card ID', index);
      response = await client.request(ENDPOINTS.card.get, { cardId });
      break;
    }

    case 'getDetails': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      validateRequiredField(this, cardId, 'Card ID', index);
      response = await client.request(ENDPOINTS.card.getDetails, { cardId });
      break;
    }

    case 'activate': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      const last4 = this.getNodeParameter('last4', index, '') as string;
      const cvv2 = this.getNodeParameter('cvv2', index, '') as string;

      validateRequiredField(this, cardId, 'Card ID', index);

      const params: IDataObject = { cardId };
      if (last4) params.last4 = last4;
      if (cvv2) params.cvv2 = cvv2;

      response = await client.request(ENDPOINTS.card.activate, params);
      break;
    }

    case 'freeze': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      const statusReason = this.getNodeParameter('statusReason', index, '') as string;

      validateRequiredField(this, cardId, 'Card ID', index);

      response = await client.request(ENDPOINTS.card.freeze, {
        cardId,
        reason: statusReason,
      });
      break;
    }

    case 'unfreeze': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      validateRequiredField(this, cardId, 'Card ID', index);
      response = await client.request(ENDPOINTS.card.unfreeze, { cardId });
      break;
    }

    case 'replace': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      const replacementReason = this.getNodeParameter('replacementReason', index) as string;

      validateRequiredField(this, cardId, 'Card ID', index);

      response = await client.request(ENDPOINTS.card.replace, {
        cardId,
        reason: replacementReason,
      });
      break;
    }

    case 'reissue': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      const replacementReason = this.getNodeParameter('replacementReason', index) as string;

      validateRequiredField(this, cardId, 'Card ID', index);

      response = await client.request(ENDPOINTS.card.reissue, {
        cardId,
        reason: replacementReason,
      });
      break;
    }

    case 'close': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      const statusReason = this.getNodeParameter('statusReason', index, '') as string;

      validateRequiredField(this, cardId, 'Card ID', index);

      response = await client.request(ENDPOINTS.card.close, {
        cardId,
        reason: statusReason,
      });
      break;
    }

    case 'getStatus': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      validateRequiredField(this, cardId, 'Card ID', index);
      response = await client.request(ENDPOINTS.card.getStatus, { cardId });
      break;
    }

    case 'updateStatus': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      const newStatus = this.getNodeParameter('newStatus', index) as string;
      const statusReason = this.getNodeParameter('statusReason', index, '') as string;

      validateRequiredField(this, cardId, 'Card ID', index);

      response = await client.request(ENDPOINTS.card.updateStatus, {
        cardId,
        status: newStatus,
        reason: statusReason,
      });
      break;
    }

    case 'getPin': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      validateRequiredField(this, cardId, 'Card ID', index);
      response = await client.request(ENDPOINTS.card.getPin, { cardId });
      break;
    }

    case 'setPin': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      const newPin = this.getNodeParameter('newPin', index) as string;

      validateRequiredField(this, cardId, 'Card ID', index);
      validateRequiredField(this, newPin, 'New PIN', index);

      response = await client.request(ENDPOINTS.card.setPin, {
        cardId,
        pin: newPin,
      });
      break;
    }

    case 'resetPin': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      validateRequiredField(this, cardId, 'Card ID', index);
      response = await client.request(ENDPOINTS.card.resetPin, { cardId });
      break;
    }

    case 'getCvv2': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      validateRequiredField(this, cardId, 'Card ID', index);
      response = await client.request(ENDPOINTS.card.getCvv2, { cardId });
      break;
    }

    case 'getExpiration': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      validateRequiredField(this, cardId, 'Card ID', index);
      response = await client.request(ENDPOINTS.card.getExpiration, { cardId });
      break;
    }

    case 'listByAccount': {
      const accountNo = this.getNodeParameter('accountNo', index) as string;
      validateRequiredField(this, accountNo, 'Account Number', index);
      response = await client.request(ENDPOINTS.card.listByAccount, { accountNo });
      break;
    }

    case 'updateLimits': {
      const cardId = this.getNodeParameter('cardId', index) as string;
      const limitType = this.getNodeParameter('limitType', index) as string;
      const limitAmount = this.getNodeParameter('limitAmount', index) as number;

      validateRequiredField(this, cardId, 'Card ID', index);

      response = await client.request(ENDPOINTS.card.updateLimits, {
        cardId,
        limitType,
        limitAmount: limitAmount.toFixed(2),
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
