/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Galileo API Credentials
 *
 * Supports authentication to Galileo's Instant API for card issuing,
 * account management, and payment processing.
 */
export class GalileoApi implements ICredentialType {
  name = 'galileoApi';
  displayName = 'Galileo API';
  documentationUrl = 'https://docs.galileo-ft.com/';
  properties: INodeProperties[] = [
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'production',
        },
        {
          name: 'Sandbox',
          value: 'sandbox',
        },
        {
          name: 'Custom',
          value: 'custom',
        },
      ],
      default: 'sandbox',
      description: 'Select the Galileo environment to connect to',
    },
    {
      displayName: 'Custom API URL',
      name: 'customUrl',
      type: 'string',
      default: '',
      placeholder: 'https://api-custom.galileo-ft.com',
      description: 'Custom API endpoint URL (only used when Environment is set to Custom)',
      displayOptions: {
        show: {
          environment: ['custom'],
        },
      },
    },
    {
      displayName: 'Provider ID',
      name: 'providerId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your Galileo Provider ID (assigned by Galileo)',
    },
    {
      displayName: 'API Login',
      name: 'apiLogin',
      type: 'string',
      default: '',
      required: true,
      description: 'Your API Login credential',
    },
    {
      displayName: 'API Trans Key',
      name: 'apiTransKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your API Transaction Key (keep this secret)',
    },
    {
      displayName: 'Product ID',
      name: 'productId',
      type: 'string',
      default: '',
      description: 'Default Product ID for card/account creation (optional)',
    },
    {
      displayName: 'Webhook Secret',
      name: 'webhookSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Secret for validating webhook signatures (optional)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      body: {
        apiLogin: '={{$credentials.apiLogin}}',
        apiTransKey: '={{$credentials.apiTransKey}}',
        providerId: '={{$credentials.providerId}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.environment === "production" ? "https://api.galileo-ft.com" : $credentials.environment === "sandbox" ? "https://api-sandbox.galileo-ft.com" : $credentials.customUrl}}',
      url: '/intserv/4.0/getAccountOverview',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        apiLogin: '={{$credentials.apiLogin}}',
        apiTransKey: '={{$credentials.apiTransKey}}',
        providerId: '={{$credentials.providerId}}',
        transactionId: '={{Date.now()}}',
        accountNo: 'TEST',
      },
    },
  };
}
