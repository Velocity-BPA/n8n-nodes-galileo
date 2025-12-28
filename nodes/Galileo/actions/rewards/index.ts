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

export const rewardsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['rewards'],
			},
		},
		options: [
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get rewards balance',
				action: 'Get rewards balance',
			},
			{
				name: 'Get History',
				value: 'getHistory',
				description: 'Get rewards history',
				action: 'Get rewards history',
			},
			{
				name: 'Redeem',
				value: 'redeem',
				description: 'Redeem rewards',
				action: 'Redeem rewards',
			},
			{
				name: 'Get Rules',
				value: 'getRules',
				description: 'Get rewards earning rules',
				action: 'Get rewards rules',
			},
			{
				name: 'Get Catalog',
				value: 'getCatalog',
				description: 'Get rewards redemption catalog',
				action: 'Get rewards catalog',
			},
			{
				name: 'Transfer',
				value: 'transfer',
				description: 'Transfer rewards to another account',
				action: 'Transfer rewards',
			},
		],
		default: 'getBalance',
	},
];

export const rewardsFields: INodeProperties[] = [
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
				resource: ['rewards'],
				operation: ['getBalance', 'getHistory', 'redeem', 'transfer'],
			},
		},
	},
	// Get History date range
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		default: '',
		description: 'Start date for history query',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['getHistory'],
			},
		},
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		description: 'End date for history query',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['getHistory'],
			},
		},
	},
	// Redeem fields
	{
		displayName: 'Redemption Type',
		name: 'redemptionType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Cash Back', value: 'cash_back' },
			{ name: 'Statement Credit', value: 'statement_credit' },
			{ name: 'Gift Card', value: 'gift_card' },
			{ name: 'Merchandise', value: 'merchandise' },
			{ name: 'Travel', value: 'travel' },
			{ name: 'Charity', value: 'charity' },
		],
		default: 'cash_back',
		description: 'Type of redemption',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['redeem'],
			},
		},
	},
	{
		displayName: 'Points',
		name: 'points',
		type: 'number',
		required: true,
		default: 0,
		description: 'Number of points to redeem',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['redeem'],
			},
		},
	},
	{
		displayName: 'Catalog Item ID',
		name: 'catalogItemId',
		type: 'string',
		default: '',
		description: 'ID of the catalog item to redeem (for gift card/merchandise)',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['redeem'],
				redemptionType: ['gift_card', 'merchandise'],
			},
		},
	},
	// Transfer fields
	{
		displayName: 'Destination PRN',
		name: 'destinationPrn',
		type: 'string',
		required: true,
		default: '',
		description: 'PRN of the account to transfer rewards to',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['transfer'],
			},
		},
	},
	{
		displayName: 'Transfer Points',
		name: 'transferPoints',
		type: 'number',
		required: true,
		default: 0,
		description: 'Number of points to transfer',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['transfer'],
			},
		},
	},
	// Get Catalog filters
	{
		displayName: 'Category',
		name: 'category',
		type: 'options',
		options: [
			{ name: 'All', value: '' },
			{ name: 'Gift Cards', value: 'gift_cards' },
			{ name: 'Merchandise', value: 'merchandise' },
			{ name: 'Travel', value: 'travel' },
			{ name: 'Experiences', value: 'experiences' },
			{ name: 'Charity', value: 'charity' },
		],
		default: '',
		description: 'Filter catalog by category',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['getCatalog'],
			},
		},
	},
	{
		displayName: 'Min Points',
		name: 'minPoints',
		type: 'number',
		default: 0,
		description: 'Minimum points required for items',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['getCatalog'],
			},
		},
	},
	{
		displayName: 'Max Points',
		name: 'maxPoints',
		type: 'number',
		default: 0,
		description: 'Maximum points for items (0 = no limit)',
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['getCatalog'],
			},
		},
	},
	// Additional options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['getHistory'],
			},
		},
		options: [
			{
				displayName: 'Transaction Type',
				name: 'transactionType',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Earned', value: 'earned' },
					{ name: 'Redeemed', value: 'redeemed' },
					{ name: 'Expired', value: 'expired' },
					{ name: 'Adjusted', value: 'adjusted' },
					{ name: 'Transferred', value: 'transferred' },
				],
				default: '',
				description: 'Filter by transaction type',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 100,
				description: 'Maximum number of records to return',
			},
		],
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['rewards'],
				operation: ['redeem'],
			},
		},
		options: [
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				description: 'Optional note for the redemption',
			},
			{
				displayName: 'Shipping Address',
				name: 'shippingAddress',
				type: 'string',
				default: '',
				description: 'Shipping address for merchandise redemptions',
			},
		],
	},
];

export async function executeRewards(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject> {
	const operation = this.getNodeParameter('operation', index) as string;
	const client = await createGalileoClient.call(this);

	switch (operation) {
		case 'getBalance': {
			const prn = this.getNodeParameter('prn', index) as string;

			return client.request(ENDPOINTS.rewards.getBalance, {
				accountNo: prn,
			});
		}

		case 'getHistory': {
			const prn = this.getNodeParameter('prn', index) as string;
			const startDate = this.getNodeParameter('startDate', index, '') as string;
			const endDate = this.getNodeParameter('endDate', index, '') as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
			};

			if (startDate) {
				params.startDate = startDate.split('T')[0];
			}
			if (endDate) {
				params.endDate = endDate.split('T')[0];
			}
			if (additionalOptions.transactionType) {
				params.transactionType = additionalOptions.transactionType;
			}
			if (additionalOptions.limit) {
				params.recordCnt = additionalOptions.limit;
			}

			return client.request(ENDPOINTS.rewards.getHistory, params);
		}

		case 'redeem': {
			const prn = this.getNodeParameter('prn', index) as string;
			const redemptionType = this.getNodeParameter('redemptionType', index) as string;
			const points = this.getNodeParameter('points', index) as number;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
				redemptionType,
				points: points.toString(),
			};

			if (redemptionType === 'gift_card' || redemptionType === 'merchandise') {
				const catalogItemId = this.getNodeParameter('catalogItemId', index, '') as string;
				if (catalogItemId) {
					params.catalogItemId = catalogItemId;
				}
			}

			if (additionalOptions.note) {
				params.note = additionalOptions.note;
			}
			if (additionalOptions.shippingAddress) {
				params.shippingAddress = additionalOptions.shippingAddress;
			}

			return client.request(ENDPOINTS.rewards.redeem, params);
		}

		case 'getRules': {
			return client.request(ENDPOINTS.rewards.getRules, {});
		}

		case 'getCatalog': {
			const category = this.getNodeParameter('category', index, '') as string;
			const minPoints = this.getNodeParameter('minPoints', index, 0) as number;
			const maxPoints = this.getNodeParameter('maxPoints', index, 0) as number;

			const params: IDataObject = {};

			if (category) {
				params.category = category;
			}
			if (minPoints > 0) {
				params.minPoints = minPoints.toString();
			}
			if (maxPoints > 0) {
				params.maxPoints = maxPoints.toString();
			}

			return client.request(ENDPOINTS.rewards.getCatalog, params);
		}

		case 'transfer': {
			const prn = this.getNodeParameter('prn', index) as string;
			const destinationPrn = this.getNodeParameter('destinationPrn', index) as string;
			const transferPoints = this.getNodeParameter('transferPoints', index) as number;

			return client.request(ENDPOINTS.rewards.transfer, {
				accountNo: prn,
				destinationAccountNo: destinationPrn,
				points: transferPoints.toString(),
			});
		}

		default:
			throw new Error(`Operation ${operation} is not supported for rewards resource`);
	}
}
