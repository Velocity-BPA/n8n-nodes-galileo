/**
 * Velocity BPA - n8n-nodes-galileo
 * 
 * @license BSL-1.1
 * @copyright 2025 Velocity BPA
 * @see https://velobpa.com/licensing
 * 
 * This file is licensed under the Business Source License 1.1.
 * Commercial use by for-profit organizations requires a license.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createGalileoClient } from '../../transport/galileoClient';
import { ENDPOINTS } from '../../constants/endpoints';

export const digitalWalletOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
			},
		},
		options: [
			{
				name: 'Provision Apple Pay',
				value: 'provisionApplePay',
				description: 'Provision a card for Apple Pay',
				action: 'Provision apple pay',
			},
			{
				name: 'Provision Google Pay',
				value: 'provisionGooglePay',
				description: 'Provision a card for Google Pay',
				action: 'Provision google pay',
			},
			{
				name: 'Provision Samsung Pay',
				value: 'provisionSamsungPay',
				description: 'Provision a card for Samsung Pay',
				action: 'Provision samsung pay',
			},
			{
				name: 'Get Wallet Token',
				value: 'getWalletToken',
				description: 'Get wallet token details',
				action: 'Get wallet token',
			},
			{
				name: 'Get Wallet Status',
				value: 'getWalletStatus',
				description: 'Get wallet provisioning status',
				action: 'Get wallet status',
			},
			{
				name: 'Deactivate Wallet Token',
				value: 'deactivateWalletToken',
				description: 'Deactivate a wallet token',
				action: 'Deactivate wallet token',
			},
			{
				name: 'Get Provisioning Data',
				value: 'getProvisioningData',
				description: 'Get data required for wallet provisioning',
				action: 'Get provisioning data',
			},
		],
		default: 'provisionApplePay',
	},
];

export const digitalWalletFields: INodeProperties[] = [
	// PRN field (required for most operations)
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		default: '',
		description: 'Program Routing Number - unique account identifier',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionApplePay', 'provisionGooglePay', 'provisionSamsungPay', 'getWalletStatus', 'getProvisioningData'],
			},
		},
	},
	// Token Reference Number
	{
		displayName: 'Token Reference Number',
		name: 'tokenReferenceNumber',
		type: 'string',
		required: true,
		default: '',
		description: 'The wallet token reference number',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['getWalletToken', 'deactivateWalletToken'],
			},
		},
	},
	// Apple Pay specific fields
	{
		displayName: 'Device Type',
		name: 'deviceType',
		type: 'options',
		required: true,
		options: [
			{ name: 'iPhone', value: 'iphone' },
			{ name: 'iPad', value: 'ipad' },
			{ name: 'Apple Watch', value: 'watch' },
			{ name: 'Mac', value: 'mac' },
		],
		default: 'iphone',
		description: 'Type of Apple device',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionApplePay'],
			},
		},
	},
	{
		displayName: 'Certificates',
		name: 'certificates',
		type: 'string',
		required: true,
		default: '',
		description: 'Base64-encoded leaf and sub-CA certificates',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionApplePay'],
			},
		},
	},
	{
		displayName: 'Nonce',
		name: 'nonce',
		type: 'string',
		required: true,
		default: '',
		description: 'One-time use nonce for provisioning',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionApplePay'],
			},
		},
	},
	{
		displayName: 'Nonce Signature',
		name: 'nonceSignature',
		type: 'string',
		required: true,
		default: '',
		description: 'Signature of the nonce',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionApplePay'],
			},
		},
	},
	// Google Pay specific fields
	{
		displayName: 'Google Wallet ID',
		name: 'googleWalletId',
		type: 'string',
		required: true,
		default: '',
		description: 'Google Wallet identifier',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionGooglePay'],
			},
		},
	},
	{
		displayName: 'Device ID',
		name: 'deviceId',
		type: 'string',
		required: true,
		default: '',
		description: 'Unique device identifier',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionGooglePay', 'provisionSamsungPay'],
			},
		},
	},
	// Samsung Pay specific fields
	{
		displayName: 'Samsung Wallet ID',
		name: 'samsungWalletId',
		type: 'string',
		required: true,
		default: '',
		description: 'Samsung Wallet identifier',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionSamsungPay'],
			},
		},
	},
	// Additional options for provisioning
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['provisionApplePay', 'provisionGooglePay', 'provisionSamsungPay'],
			},
		},
		options: [
			{
				displayName: 'Card ID',
				name: 'cardId',
				type: 'string',
				default: '',
				description: 'Specific card ID to provision (defaults to primary)',
			},
			{
				displayName: 'Cardholder Name',
				name: 'cardholderName',
				type: 'string',
				default: '',
				description: 'Override cardholder name for wallet',
			},
			{
				displayName: 'Locale',
				name: 'locale',
				type: 'string',
				default: 'en_US',
				description: 'Locale for wallet display',
			},
		],
	},
	// Deactivation reason
	{
		displayName: 'Reason',
		name: 'reason',
		type: 'options',
		required: true,
		options: [
			{ name: 'Customer Request', value: 'customer_request' },
			{ name: 'Lost Device', value: 'lost_device' },
			{ name: 'Stolen Device', value: 'stolen_device' },
			{ name: 'Fraud', value: 'fraud' },
			{ name: 'Card Replaced', value: 'card_replaced' },
			{ name: 'Account Closed', value: 'account_closed' },
		],
		default: 'customer_request',
		description: 'Reason for deactivating the wallet token',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['deactivateWalletToken'],
			},
		},
	},
	// Wallet type filter for status
	{
		displayName: 'Wallet Type',
		name: 'walletType',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Apple Pay', value: 'apple_pay' },
			{ name: 'Google Pay', value: 'google_pay' },
			{ name: 'Samsung Pay', value: 'samsung_pay' },
		],
		default: '',
		description: 'Filter by wallet type',
		displayOptions: {
			show: {
				resource: ['digitalWallet'],
				operation: ['getWalletStatus'],
			},
		},
	},
];

export async function executeDigitalWallet(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject> {
	const operation = this.getNodeParameter('operation', index) as string;
	const client = await createGalileoClient.call(this);

	switch (operation) {
		case 'provisionApplePay': {
			const prn = this.getNodeParameter('prn', index) as string;
			const deviceType = this.getNodeParameter('deviceType', index) as string;
			const certificates = this.getNodeParameter('certificates', index) as string;
			const nonce = this.getNodeParameter('nonce', index) as string;
			const nonceSignature = this.getNodeParameter('nonceSignature', index) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
				deviceType,
				certificates,
				nonce,
				nonceSignature,
				walletType: 'apple_pay',
			};

			if (additionalOptions.cardId) {
				params.cardId = additionalOptions.cardId;
			}
			if (additionalOptions.cardholderName) {
				params.cardholderName = additionalOptions.cardholderName;
			}
			if (additionalOptions.locale) {
				params.locale = additionalOptions.locale;
			}

			return client.request(ENDPOINTS.digitalWallet.provisionApplePay, params);
		}

		case 'provisionGooglePay': {
			const prn = this.getNodeParameter('prn', index) as string;
			const googleWalletId = this.getNodeParameter('googleWalletId', index) as string;
			const deviceId = this.getNodeParameter('deviceId', index) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
				googleWalletId,
				deviceId,
				walletType: 'google_pay',
			};

			if (additionalOptions.cardId) {
				params.cardId = additionalOptions.cardId;
			}
			if (additionalOptions.cardholderName) {
				params.cardholderName = additionalOptions.cardholderName;
			}
			if (additionalOptions.locale) {
				params.locale = additionalOptions.locale;
			}

			return client.request(ENDPOINTS.digitalWallet.provisionApplePay, params);
		}

		case 'provisionSamsungPay': {
			const prn = this.getNodeParameter('prn', index) as string;
			const samsungWalletId = this.getNodeParameter('samsungWalletId', index) as string;
			const deviceId = this.getNodeParameter('deviceId', index) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
				samsungWalletId,
				deviceId,
				walletType: 'samsung_pay',
			};

			if (additionalOptions.cardId) {
				params.cardId = additionalOptions.cardId;
			}
			if (additionalOptions.cardholderName) {
				params.cardholderName = additionalOptions.cardholderName;
			}
			if (additionalOptions.locale) {
				params.locale = additionalOptions.locale;
			}

			return client.request(ENDPOINTS.digitalWallet.provisionApplePay, params);
		}

		case 'getWalletToken': {
			const tokenReferenceNumber = this.getNodeParameter('tokenReferenceNumber', index) as string;

			return client.request(ENDPOINTS.digitalWallet.getToken, {
				tokenReferenceNumber,
			});
		}

		case 'getWalletStatus': {
			const prn = this.getNodeParameter('prn', index) as string;
			const walletType = this.getNodeParameter('walletType', index, '') as string;

			const params: IDataObject = {
				accountNo: prn,
			};

			if (walletType) {
				params.walletType = walletType;
			}

			return client.request(ENDPOINTS.digitalWallet.getStatus, params);
		}

		case 'deactivateWalletToken': {
			const tokenReferenceNumber = this.getNodeParameter('tokenReferenceNumber', index) as string;
			const reason = this.getNodeParameter('reason', index) as string;

			return client.request(ENDPOINTS.digitalWallet.deactivateToken, {
				tokenReferenceNumber,
				reason,
			});
		}

		case 'getProvisioningData': {
			const prn = this.getNodeParameter('prn', index) as string;

			return client.request(ENDPOINTS.digitalWallet.getProvisioningData, {
				accountNo: prn,
			});
		}

		default:
			throw new Error(`Operation ${operation} is not supported for digitalWallet resource`);
	}
}
