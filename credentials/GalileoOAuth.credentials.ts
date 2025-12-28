/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * Galileo OAuth2 Credentials
 *
 * Supports OAuth2 client credentials flow for Galileo API authentication.
 * Used for server-to-server integrations requiring OAuth2 authentication.
 */
export class GalileoOAuth implements ICredentialType {
  name = 'galileoOAuth';
  displayName = 'Galileo OAuth2';
  documentationUrl = 'https://docs.galileo-ft.com/';
  extends = ['oAuth2Api'];
  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'clientCredentials',
    },
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
      ],
      default: 'sandbox',
      description: 'Select the Galileo environment',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'OAuth2 Client ID from Galileo',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'OAuth2 Client Secret from Galileo',
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'string',
      default:
        '={{$self["environment"] === "production" ? "https://auth.galileo-ft.com/oauth/token" : "https://auth-sandbox.galileo-ft.com/oauth/token"}}',
      description: 'URL to obtain access tokens',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'string',
      default: 'api:full',
      description: 'OAuth2 scope for API access',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'body',
    },
    {
      displayName: 'Provider ID',
      name: 'providerId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your Galileo Provider ID',
    },
  ];
}
