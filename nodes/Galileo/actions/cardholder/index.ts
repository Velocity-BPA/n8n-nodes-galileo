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
import { validateRequiredField, validateEmail, validatePhoneNumber, validateSsn } from '../../utils/validationUtils';

/**
 * Cardholder Resource - Operations and Descriptions
 */

export const cardholderOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['cardholder'],
      },
    },
    options: [
      { name: 'Create Cardholder', value: 'create', description: 'Create a new cardholder', action: 'Create a cardholder' },
      { name: 'Get Cardholder', value: 'get', description: 'Get cardholder information', action: 'Get a cardholder' },
      { name: 'Get Cardholder by External ID', value: 'getByExternalId', description: 'Get cardholder by external ID', action: 'Get cardholder by external ID' },
      { name: 'Get Cardholder by SSN', value: 'getBySsn', description: 'Get cardholder by SSN', action: 'Get cardholder by SSN' },
      { name: 'Get Cardholder Status', value: 'getStatus', description: 'Get cardholder status', action: 'Get cardholder status' },
      { name: 'Update Cardholder', value: 'update', description: 'Update cardholder information', action: 'Update a cardholder' },
      { name: 'Update Cardholder Address', value: 'updateAddress', description: 'Update cardholder address', action: 'Update cardholder address' },
      { name: 'Update Cardholder Email', value: 'updateEmail', description: 'Update cardholder email', action: 'Update cardholder email' },
      { name: 'Update Cardholder Phone', value: 'updatePhone', description: 'Update cardholder phone', action: 'Update cardholder phone' },
      { name: 'Update Cardholder Status', value: 'updateStatus', description: 'Update cardholder status', action: 'Update cardholder status' },
    ],
    default: 'get',
  },
];

export const cardholderFields: INodeProperties[] = [
  // PRN (common field)
  {
    displayName: 'PRN',
    name: 'prn',
    type: 'string',
    required: true,
    default: '',
    description: 'The Program Routing Number for the cardholder',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['get', 'update', 'updateAddress', 'updatePhone', 'updateEmail', 'getStatus', 'updateStatus'],
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
    description: 'The external ID assigned to the cardholder',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['getByExternalId'],
      },
    },
  },
  // SSN
  {
    displayName: 'SSN',
    name: 'ssn',
    type: 'string',
    required: true,
    default: '',
    description: 'The Social Security Number (last 4 or full)',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['getBySsn'],
      },
    },
  },
  // Create Cardholder Fields
  {
    displayName: 'First Name',
    name: 'firstName',
    type: 'string',
    required: true,
    default: '',
    description: 'Cardholder first name',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Last Name',
    name: 'lastName',
    type: 'string',
    required: true,
    default: '',
    description: 'Cardholder last name',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Date of Birth',
    name: 'dateOfBirth',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'YYYY-MM-DD',
    description: 'Cardholder date of birth (YYYY-MM-DD)',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'SSN',
    name: 'ssn',
    type: 'string',
    required: true,
    default: '',
    description: 'Social Security Number (9 digits)',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create'],
      },
    },
  },
  {
    displayName: 'Address Line 1',
    name: 'address1',
    type: 'string',
    required: true,
    default: '',
    description: 'Street address',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create', 'updateAddress'],
      },
    },
  },
  {
    displayName: 'Address Line 2',
    name: 'address2',
    type: 'string',
    default: '',
    description: 'Additional address information',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create', 'updateAddress'],
      },
    },
  },
  {
    displayName: 'City',
    name: 'city',
    type: 'string',
    required: true,
    default: '',
    description: 'City',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create', 'updateAddress'],
      },
    },
  },
  {
    displayName: 'State',
    name: 'state',
    type: 'string',
    required: true,
    default: '',
    description: 'State (2-letter code)',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create', 'updateAddress'],
      },
    },
  },
  {
    displayName: 'ZIP Code',
    name: 'postalCode',
    type: 'string',
    required: true,
    default: '',
    description: 'ZIP or postal code',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create', 'updateAddress'],
      },
    },
  },
  {
    displayName: 'Country',
    name: 'countryCode',
    type: 'string',
    default: 'US',
    description: 'Country code (ISO 3166-1 alpha-2)',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create', 'updateAddress'],
      },
    },
  },
  {
    displayName: 'Phone Number',
    name: 'phone',
    type: 'string',
    default: '',
    description: 'Phone number',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create', 'updatePhone'],
      },
    },
  },
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    default: '',
    description: 'Email address',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['create', 'updateEmail'],
      },
    },
  },
  // Update Fields
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'First Name',
        name: 'firstName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Last Name',
        name: 'lastName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'Middle Name',
        name: 'middleName',
        type: 'string',
        default: '',
      },
      {
        displayName: 'External ID',
        name: 'externalId',
        type: 'string',
        default: '',
      },
    ],
  },
  // Status Update
  {
    displayName: 'New Status',
    name: 'newStatus',
    type: 'options',
    required: true,
    default: 'A',
    options: [
      { name: 'Active', value: 'A' },
      { name: 'Inactive', value: 'I' },
      { name: 'Suspended', value: 'S' },
      { name: 'Closed', value: 'C' },
    ],
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['updateStatus'],
      },
    },
  },
  {
    displayName: 'Status Reason',
    name: 'statusReason',
    type: 'string',
    default: '',
    description: 'Reason for status change',
    displayOptions: {
      show: {
        resource: ['cardholder'],
        operation: ['updateStatus'],
      },
    },
  },
];

export async function executeCardholderOperations(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  const client = await createGalileoClient.call(this);
  let response: GalileoResponse;

  switch (operation) {
    case 'create': {
      const firstName = this.getNodeParameter('firstName', index) as string;
      const lastName = this.getNodeParameter('lastName', index) as string;
      const dateOfBirth = this.getNodeParameter('dateOfBirth', index) as string;
      const ssn = this.getNodeParameter('ssn', index) as string;
      const address1 = this.getNodeParameter('address1', index) as string;
      const city = this.getNodeParameter('city', index) as string;
      const state = this.getNodeParameter('state', index) as string;
      const postalCode = this.getNodeParameter('postalCode', index) as string;
      const countryCode = this.getNodeParameter('countryCode', index, 'US') as string;
      const phone = this.getNodeParameter('phone', index, '') as string;
      const email = this.getNodeParameter('email', index, '') as string;
      const address2 = this.getNodeParameter('address2', index, '') as string;

      validateRequiredField(this, firstName, 'First Name', index);
      validateRequiredField(this, lastName, 'Last Name', index);
      if (!validateSsn(ssn)) {
        throw new Error('Invalid SSN format');
      }

      const params: IDataObject = {
        firstName,
        lastName,
        dateOfBirth,
        ssn,
        address1,
        city,
        state,
        postalCode,
        countryCode,
      };

      if (address2) params.address2 = address2;
      if (phone) params.phone = phone;
      if (email) params.email = email;

      response = await client.request(ENDPOINTS.cardholder.create, params);
      break;
    }

    case 'get': {
      const prn = this.getNodeParameter('prn', index) as string;
      validateRequiredField(this, prn, 'PRN', index);
      response = await client.request(ENDPOINTS.cardholder.get, { prn });
      break;
    }

    case 'update': {
      const prn = this.getNodeParameter('prn', index) as string;
      const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

      validateRequiredField(this, prn, 'PRN', index);

      response = await client.request(ENDPOINTS.cardholder.update, {
        prn,
        ...updateFields,
      });
      break;
    }

    case 'getBySsn': {
      const ssn = this.getNodeParameter('ssn', index) as string;
      validateRequiredField(this, ssn, 'SSN', index);
      response = await client.request(ENDPOINTS.cardholder.getBySsn, { ssn });
      break;
    }

    case 'getByExternalId': {
      const externalId = this.getNodeParameter('externalId', index) as string;
      validateRequiredField(this, externalId, 'External ID', index);
      response = await client.request(ENDPOINTS.cardholder.getByExternalId, { externalId });
      break;
    }

    case 'updateAddress': {
      const prn = this.getNodeParameter('prn', index) as string;
      const address1 = this.getNodeParameter('address1', index) as string;
      const city = this.getNodeParameter('city', index) as string;
      const state = this.getNodeParameter('state', index) as string;
      const postalCode = this.getNodeParameter('postalCode', index) as string;
      const countryCode = this.getNodeParameter('countryCode', index, 'US') as string;
      const address2 = this.getNodeParameter('address2', index, '') as string;

      validateRequiredField(this, prn, 'PRN', index);

      const params: IDataObject = {
        prn,
        address1,
        city,
        state,
        postalCode,
        countryCode,
      };

      if (address2) params.address2 = address2;

      response = await client.request(ENDPOINTS.cardholder.updateAddress, params);
      break;
    }

    case 'updatePhone': {
      const prn = this.getNodeParameter('prn', index) as string;
      const phone = this.getNodeParameter('phone', index) as string;

      validateRequiredField(this, prn, 'PRN', index);
      if (!validatePhoneNumber(phone)) {
        throw new Error('Invalid phone number format');
      }

      response = await client.request(ENDPOINTS.cardholder.updatePhone, { prn, phone });
      break;
    }

    case 'updateEmail': {
      const prn = this.getNodeParameter('prn', index) as string;
      const email = this.getNodeParameter('email', index) as string;

      validateRequiredField(this, prn, 'PRN', index);
      if (!validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      response = await client.request(ENDPOINTS.cardholder.updateEmail, { prn, email });
      break;
    }

    case 'getStatus': {
      const prn = this.getNodeParameter('prn', index) as string;
      validateRequiredField(this, prn, 'PRN', index);
      response = await client.request(ENDPOINTS.cardholder.getStatus, { prn });
      break;
    }

    case 'updateStatus': {
      const prn = this.getNodeParameter('prn', index) as string;
      const newStatus = this.getNodeParameter('newStatus', index) as string;
      const statusReason = this.getNodeParameter('statusReason', index, '') as string;

      validateRequiredField(this, prn, 'PRN', index);

      response = await client.request(ENDPOINTS.cardholder.updateStatus, {
        prn,
        status: newStatus,
        reason: statusReason,
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
