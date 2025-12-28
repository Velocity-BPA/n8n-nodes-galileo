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
import { SandboxClient } from '../../transport/sandboxClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { MCC_CATEGORIES } from '../../constants/mccCodes';

export const sandboxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['sandbox'],
			},
		},
		options: [
			{
				name: 'Simulate Authorization',
				value: 'simulateAuthorization',
				description: 'Simulate a card authorization',
				action: 'Simulate authorization',
			},
			{
				name: 'Simulate Settlement',
				value: 'simulateSettlement',
				description: 'Simulate a transaction settlement',
				action: 'Simulate settlement',
			},
			{
				name: 'Simulate ACH',
				value: 'simulateAch',
				description: 'Simulate an ACH transfer',
				action: 'Simulate ach',
			},
			{
				name: 'Simulate Load',
				value: 'simulateLoad',
				description: 'Simulate a load/deposit',
				action: 'Simulate load',
			},
			{
				name: 'Simulate Transaction',
				value: 'simulateTransaction',
				description: 'Simulate any transaction type',
				action: 'Simulate transaction',
			},
			{
				name: 'Advance Time',
				value: 'advanceTime',
				description: 'Advance sandbox time for testing',
				action: 'Advance time',
			},
			{
				name: 'Reset Account',
				value: 'resetAccount',
				description: 'Reset a sandbox account to initial state',
				action: 'Reset account',
			},
		],
		default: 'simulateAuthorization',
	},
];

// Build MCC options from constants
const mccOptions = Object.entries(MCC_CATEGORIES).map(([key, value]) => ({
	name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
	value: value as string,
}));

export const sandboxFields: INodeProperties[] = [
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
				resource: ['sandbox'],
				operation: ['simulateAuthorization', 'simulateSettlement', 'simulateAch', 'simulateLoad', 'simulateTransaction', 'resetAccount'],
			},
		},
	},
	// Simulate Authorization fields
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Transaction amount in dollars',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAuthorization', 'simulateSettlement', 'simulateLoad', 'simulateTransaction'],
			},
		},
	},
	{
		displayName: 'Merchant Name',
		name: 'merchantName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'Test Merchant',
		description: 'Name of the merchant',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAuthorization', 'simulateSettlement'],
			},
		},
	},
	{
		displayName: 'MCC Category',
		name: 'mccCategory',
		type: 'options',
		options: mccOptions,
		default: '5411',
		description: 'Merchant Category Code',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAuthorization', 'simulateSettlement'],
			},
		},
	},
	// Simulate Settlement - requires auth ID
	{
		displayName: 'Authorization ID',
		name: 'authorizationId',
		type: 'string',
		required: true,
		default: '',
		description: 'The authorization ID to settle',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateSettlement'],
			},
		},
	},
	// Simulate ACH fields
	{
		displayName: 'ACH Amount',
		name: 'achAmount',
		type: 'number',
		required: true,
		default: 0,
		description: 'ACH transfer amount in dollars',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAch'],
			},
		},
	},
	{
		displayName: 'ACH Type',
		name: 'achType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Credit (Incoming)', value: 'credit' },
			{ name: 'Debit (Outgoing)', value: 'debit' },
		],
		default: 'credit',
		description: 'Type of ACH transfer',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAch'],
			},
		},
	},
	{
		displayName: 'ACH Source',
		name: 'achSource',
		type: 'options',
		options: [
			{ name: 'Payroll', value: 'payroll' },
			{ name: 'Government', value: 'government' },
			{ name: 'Transfer', value: 'transfer' },
			{ name: 'Bill Pay', value: 'billpay' },
		],
		default: 'transfer',
		description: 'Source type for ACH',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAch'],
			},
		},
	},
	// Simulate Transaction fields
	{
		displayName: 'Transaction Type',
		name: 'transactionType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Purchase', value: 'purchase' },
			{ name: 'ATM Withdrawal', value: 'atm' },
			{ name: 'Cash Back', value: 'cashback' },
			{ name: 'Refund', value: 'refund' },
			{ name: 'Fee', value: 'fee' },
			{ name: 'Adjustment', value: 'adjustment' },
			{ name: 'P2P Transfer', value: 'p2p' },
		],
		default: 'purchase',
		description: 'Type of transaction to simulate',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateTransaction'],
			},
		},
	},
	// Advance Time fields
	{
		displayName: 'Days',
		name: 'days',
		type: 'number',
		required: true,
		default: 1,
		description: 'Number of days to advance',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['advanceTime'],
			},
		},
	},
	{
		displayName: 'Process Settlements',
		name: 'processSettlements',
		type: 'boolean',
		default: true,
		description: 'Whether to process pending settlements during time advance',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['advanceTime'],
			},
		},
	},
	// Additional options for authorization simulation
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAuthorization'],
			},
		},
		options: [
			{
				displayName: 'Card ID',
				name: 'cardId',
				type: 'string',
				default: '',
				description: 'Specific card ID (defaults to primary)',
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				default: 'USD',
				description: 'Transaction currency',
			},
			{
				displayName: 'Entry Mode',
				name: 'entryMode',
				type: 'options',
				options: [
					{ name: 'Chip', value: 'chip' },
					{ name: 'Swipe', value: 'swipe' },
					{ name: 'Manual', value: 'manual' },
					{ name: 'Contactless', value: 'contactless' },
					{ name: 'E-Commerce', value: 'ecommerce' },
				],
				default: 'chip',
				description: 'Card entry mode',
			},
			{
				displayName: 'Force Decline',
				name: 'forceDecline',
				type: 'boolean',
				default: false,
				description: 'Whether to force a declined authorization',
			},
			{
				displayName: 'Decline Reason',
				name: 'declineReason',
				type: 'options',
				options: [
					{ name: 'Insufficient Funds', value: 'insufficient_funds' },
					{ name: 'Card Blocked', value: 'card_blocked' },
					{ name: 'Invalid Card', value: 'invalid_card' },
					{ name: 'Expired Card', value: 'expired' },
					{ name: 'Suspected Fraud', value: 'fraud' },
					{ name: 'Velocity Exceeded', value: 'velocity' },
				],
				default: 'insufficient_funds',
				description: 'Reason for forced decline',
			},
			{
				displayName: 'Merchant City',
				name: 'merchantCity',
				type: 'string',
				default: 'San Francisco',
				description: 'Merchant city',
			},
			{
				displayName: 'Merchant State',
				name: 'merchantState',
				type: 'string',
				default: 'CA',
				description: 'Merchant state',
			},
			{
				displayName: 'Merchant Country',
				name: 'merchantCountry',
				type: 'string',
				default: 'USA',
				description: 'Merchant country',
			},
		],
	},
	// Additional options for ACH simulation
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAch'],
			},
		},
		options: [
			{
				displayName: 'Simulate Return',
				name: 'simulateReturn',
				type: 'boolean',
				default: false,
				description: 'Whether to simulate an ACH return',
			},
			{
				displayName: 'Return Code',
				name: 'returnCode',
				type: 'options',
				options: [
					{ name: 'R01 - Insufficient Funds', value: 'R01' },
					{ name: 'R02 - Account Closed', value: 'R02' },
					{ name: 'R03 - No Account', value: 'R03' },
					{ name: 'R04 - Invalid Account', value: 'R04' },
					{ name: 'R08 - Payment Stopped', value: 'R08' },
					{ name: 'R10 - Customer Advises Unauthorized', value: 'R10' },
				],
				default: 'R01',
				description: 'ACH return reason code',
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				default: '',
				description: 'Originating company name',
			},
		],
	},
	// Reset options
	{
		displayName: 'Reset Options',
		name: 'resetOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['resetAccount'],
			},
		},
		options: [
			{
				displayName: 'Reset Balance',
				name: 'resetBalance',
				type: 'boolean',
				default: true,
				description: 'Whether to reset account balance',
			},
			{
				displayName: 'Initial Balance',
				name: 'initialBalance',
				type: 'number',
				default: 1000,
				description: 'Initial balance after reset',
			},
			{
				displayName: 'Clear Transactions',
				name: 'clearTransactions',
				type: 'boolean',
				default: true,
				description: 'Whether to clear transaction history',
			},
			{
				displayName: 'Reset Card Status',
				name: 'resetCardStatus',
				type: 'boolean',
				default: true,
				description: 'Whether to reset card to active status',
			},
		],
	},
];

export async function executeSandbox(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject> {
	const operation = this.getNodeParameter('operation', index) as string;
	const client = await createGalileoClient.call(this);
	
	// Create sandbox client which extends the base client
	const sandboxClient = new SandboxClient(client);

	switch (operation) {
		case 'simulateAuthorization': {
			const prn = this.getNodeParameter('prn', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const merchantName = this.getNodeParameter('merchantName', index) as string;
			const mccCategory = this.getNodeParameter('mccCategory', index) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
				amount: amount.toFixed(2),
				merchantName,
				mcc: mccCategory,
			};

			if (additionalOptions.cardId) {
				params.cardId = additionalOptions.cardId;
			}
			if (additionalOptions.currency) {
				params.currency = additionalOptions.currency;
			}
			if (additionalOptions.entryMode) {
				params.entryMode = additionalOptions.entryMode;
			}
			if (additionalOptions.forceDecline) {
				params.forceDecline = '1';
				if (additionalOptions.declineReason) {
					params.declineReason = additionalOptions.declineReason;
				}
			}
			if (additionalOptions.merchantCity) {
				params.merchantCity = additionalOptions.merchantCity;
			}
			if (additionalOptions.merchantState) {
				params.merchantState = additionalOptions.merchantState;
			}
			if (additionalOptions.merchantCountry) {
				params.merchantCountry = additionalOptions.merchantCountry;
			}

			return sandboxClient.simulateAuthorization(params);
		}

		case 'simulateSettlement': {
			const prn = this.getNodeParameter('prn', index) as string;
			const authorizationId = this.getNodeParameter('authorizationId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const merchantName = this.getNodeParameter('merchantName', index) as string;
			const mccCategory = this.getNodeParameter('mccCategory', index) as string;

			return sandboxClient.simulateSettlement({
				accountNo: prn,
				authorizationId,
				amount: amount.toFixed(2),
				merchantName,
				mcc: mccCategory,
			});
		}

		case 'simulateAch': {
			const prn = this.getNodeParameter('prn', index) as string;
			const achAmount = this.getNodeParameter('achAmount', index) as number;
			const achType = this.getNodeParameter('achType', index) as string;
			const achSource = this.getNodeParameter('achSource', index) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
				amount: achAmount.toFixed(2),
				type: achType,
				source: achSource,
			};

			if (additionalOptions.simulateReturn) {
				params.simulateReturn = '1';
				if (additionalOptions.returnCode) {
					params.returnCode = additionalOptions.returnCode;
				}
			}
			if (additionalOptions.companyName) {
				params.companyName = additionalOptions.companyName;
			}

			return sandboxClient.simulateAch(params);
		}

		case 'simulateLoad': {
			const prn = this.getNodeParameter('prn', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;

			return sandboxClient.simulateLoad({
				accountNo: prn,
				amount: amount.toFixed(2),
			});
		}

		case 'simulateTransaction': {
			const prn = this.getNodeParameter('prn', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const transactionType = this.getNodeParameter('transactionType', index) as string;

			return sandboxClient.simulateTransaction({
				accountNo: prn,
				amount: amount.toFixed(2),
				type: transactionType,
			});
		}

		case 'advanceTime': {
			const days = this.getNodeParameter('days', index) as number;
			const processSettlements = this.getNodeParameter('processSettlements', index) as boolean;

			return sandboxClient.advanceTime({
				days,
				processSettlements: processSettlements ? '1' : '0',
			});
		}

		case 'resetAccount': {
			const prn = this.getNodeParameter('prn', index) as string;
			const resetOptions = this.getNodeParameter('resetOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
			};

			if (resetOptions.resetBalance !== undefined) {
				params.resetBalance = resetOptions.resetBalance ? '1' : '0';
			}
			if (resetOptions.initialBalance) {
				params.initialBalance = (resetOptions.initialBalance as number).toFixed(2);
			}
			if (resetOptions.clearTransactions !== undefined) {
				params.clearTransactions = resetOptions.clearTransactions ? '1' : '0';
			}
			if (resetOptions.resetCardStatus !== undefined) {
				params.resetCardStatus = resetOptions.resetCardStatus ? '1' : '0';
			}

			return sandboxClient.resetAccount(params);
		}

		default:
			throw new Error(`Operation ${operation} is not supported for sandbox resource`);
	}
}
