// @ts-nocheck
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

export const programOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['program'],
			},
		},
		options: [
			{
				name: 'Get Info',
				value: 'getInfo',
				description: 'Get program information',
				action: 'Get program info',
			},
			{
				name: 'Get Settings',
				value: 'getSettings',
				description: 'Get program settings',
				action: 'Get program settings',
			},
			{
				name: 'Get Limits',
				value: 'getLimits',
				description: 'Get program limits',
				action: 'Get program limits',
			},
			{
				name: 'Get Fees',
				value: 'getFees',
				description: 'Get program fee schedule',
				action: 'Get program fees',
			},
			{
				name: 'Get Card Products',
				value: 'getCardProducts',
				description: 'Get available card products',
				action: 'Get card products',
			},
			{
				name: 'Get Account Products',
				value: 'getAccountProducts',
				description: 'Get available account products',
				action: 'Get account products',
			},
		],
		default: 'getInfo',
	},
];

export const programFields: INodeProperties[] = [
	// Get Info fields
	{
		displayName: 'Program ID',
		name: 'programId',
		type: 'string',
		default: '',
		description: 'The program identifier. Leave empty to use default from credentials.',
		displayOptions: {
			show: {
				resource: ['program'],
				operation: ['getInfo', 'getSettings', 'getLimits', 'getFees', 'getCardProducts', 'getAccountProducts'],
			},
		},
	},
	// Get Card Products additional options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['program'],
				operation: ['getCardProducts'],
			},
		},
		options: [
			{
				displayName: 'Include Inactive',
				name: 'includeInactive',
				type: 'boolean',
				default: false,
				description: 'Whether to include inactive card products',
			},
			{
				displayName: 'Card Type',
				name: 'cardType',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Physical', value: 'physical' },
					{ name: 'Virtual', value: 'virtual' },
				],
				default: '',
				description: 'Filter by card type',
			},
			{
				displayName: 'Network',
				name: 'network',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Visa', value: 'visa' },
					{ name: 'Mastercard', value: 'mastercard' },
				],
				default: '',
				description: 'Filter by card network',
			},
		],
	},
	// Get Account Products additional options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['program'],
				operation: ['getAccountProducts'],
			},
		},
		options: [
			{
				displayName: 'Include Inactive',
				name: 'includeInactive',
				type: 'boolean',
				default: false,
				description: 'Whether to include inactive account products',
			},
			{
				displayName: 'Account Type',
				name: 'accountType',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Prepaid', value: 'prepaid' },
					{ name: 'DDA', value: 'dda' },
					{ name: 'Credit', value: 'credit' },
				],
				default: '',
				description: 'Filter by account type',
			},
		],
	},
	// Get Fees additional options
	{
		displayName: 'Fee Category',
		name: 'feeCategory',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Transaction', value: 'transaction' },
			{ name: 'Monthly', value: 'monthly' },
			{ name: 'ATM', value: 'atm' },
			{ name: 'Transfer', value: 'transfer' },
			{ name: 'Card', value: 'card' },
			{ name: 'Account', value: 'account' },
		],
		default: '',
		description: 'Filter fees by category',
		displayOptions: {
			show: {
				resource: ['program'],
				operation: ['getFees'],
			},
		},
	},
];

export async function executeProgram(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject> {
	const operation = this.getNodeParameter('operation', index) as string;
	const client = await createGalileoClient.call(this);

	const programId = this.getNodeParameter('programId', index, '') as string;

	switch (operation) {
		case 'getInfo': {
			const params: IDataObject = {};
			if (programId) {
				params.programId = programId;
			}
			return client.request(ENDPOINTS.program.getInfo, params);
		}

		case 'getSettings': {
			const params: IDataObject = {};
			if (programId) {
				params.programId = programId;
			}
			return client.request(ENDPOINTS.program.getSettings, params);
		}

		case 'getLimits': {
			const params: IDataObject = {};
			if (programId) {
				params.programId = programId;
			}
			return client.request(ENDPOINTS.program.getLimits, params);
		}

		case 'getFees': {
			const feeCategory = this.getNodeParameter('feeCategory', index, '') as string;
			const params: IDataObject = {};
			if (programId) {
				params.programId = programId;
			}
			if (feeCategory) {
				params.feeCategory = feeCategory;
			}
			return client.request(ENDPOINTS.program.getFees, params);
		}

		case 'getCardProducts': {
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;
			const params: IDataObject = {};
			if (programId) {
				params.programId = programId;
			}
			if (additionalOptions.includeInactive) {
				params.includeInactive = '1';
			}
			if (additionalOptions.cardType) {
				params.cardType = additionalOptions.cardType;
			}
			if (additionalOptions.network) {
				params.network = additionalOptions.network;
			}
			return client.request(ENDPOINTS.program.getCardProducts, params);
		}

		case 'getAccountProducts': {
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;
			const params: IDataObject = {};
			if (programId) {
				params.programId = programId;
			}
			if (additionalOptions.includeInactive) {
				params.includeInactive = '1';
			}
			if (additionalOptions.accountType) {
				params.accountType = additionalOptions.accountType;
			}
			return client.request(ENDPOINTS.program.getAccountProducts, params);
		}

		default:
			throw new Error(`Operation ${operation} is not supported for program resource`);
	}
}
