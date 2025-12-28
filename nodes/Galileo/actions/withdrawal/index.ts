// @ts-nocheck
/**
 * [Velocity BPA Licensing Notice]
 *
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 * Use of this node by for-profit organizations in production environments requires
 * a commercial license from Velocity BPA.
 *
 * For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { createGalileoClient, type GalileoClient } from '../../transport/galileoClient';
import { ENDPOINTS } from '../../constants/endpoints';
import { validateAmountField, validatePrnField } from '../../utils/validationUtils';

export const withdrawalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['withdrawal'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a withdrawal',
				action: 'Create a withdrawal',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get withdrawal details',
				action: 'Get a withdrawal',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get withdrawal status',
				action: 'Get withdrawal status',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a withdrawal',
				action: 'Cancel a withdrawal',
			},
			{
				name: 'Get By Account',
				value: 'getByAccount',
				description: 'Get withdrawals by account',
				action: 'Get withdrawals by account',
			},
			{
				name: 'Get ATM Withdrawal',
				value: 'getAtm',
				description: 'Get ATM withdrawal details',
				action: 'Get ATM withdrawal',
			},
		],
		default: 'create',
	},
];

export const withdrawalFields: INodeProperties[] = [
	// PRN - Used by multiple operations
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['withdrawal'],
				operation: ['create', 'getByAccount'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Withdrawal ID
	{
		displayName: 'Withdrawal ID',
		name: 'withdrawalId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['withdrawal'],
				operation: ['get', 'getStatus', 'cancel'],
			},
		},
		default: '',
		description: 'The unique identifier for the withdrawal',
	},
	// ATM Transaction ID
	{
		displayName: 'ATM Transaction ID',
		name: 'atmTransactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['withdrawal'],
				operation: ['getAtm'],
			},
		},
		default: '',
		description: 'The ATM transaction identifier',
	},
	// Amount
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['withdrawal'],
				operation: ['create'],
			},
		},
		default: 0,
		typeOptions: {
			numberPrecision: 2,
			minValue: 0.01,
		},
		description: 'Withdrawal amount in dollars',
	},
	// Withdrawal Type
	{
		displayName: 'Withdrawal Type',
		name: 'withdrawalType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['withdrawal'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'ACH', value: 'ACH' },
			{ name: 'Wire', value: 'WIRE' },
			{ name: 'Check', value: 'CHECK' },
			{ name: 'Cash', value: 'CASH' },
			{ name: 'ATM', value: 'ATM' },
		],
		default: 'ACH',
		description: 'Type of withdrawal',
	},
	// Additional Options for create
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['withdrawal'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Account Number',
				name: 'accountNumber',
				type: 'string',
				default: '',
				description: 'Destination account number for ACH/wire withdrawals',
			},
			{
				displayName: 'Routing Number',
				name: 'routingNumber',
				type: 'string',
				default: '',
				description: 'Routing number for ACH withdrawals',
			},
			{
				displayName: 'Account Type',
				name: 'accountType',
				type: 'options',
				options: [
					{ name: 'Checking', value: 'C' },
					{ name: 'Savings', value: 'S' },
				],
				default: 'C',
				description: 'Bank account type',
			},
			{
				displayName: 'Memo',
				name: 'memo',
				type: 'string',
				default: '',
				description: 'Optional memo for the withdrawal',
			},
			{
				displayName: 'Reference ID',
				name: 'referenceId',
				type: 'string',
				default: '',
				description: 'External reference ID for tracking',
			},
			{
				displayName: 'Schedule Date',
				name: 'scheduleDate',
				type: 'dateTime',
				default: '',
				description: 'Date to schedule the withdrawal (future-dated)',
			},
		],
	},
	// Date range for getByAccount
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['withdrawal'],
				operation: ['getByAccount'],
			},
		},
		default: '',
		description: 'Start date for withdrawal history',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['withdrawal'],
				operation: ['getByAccount'],
			},
		},
		default: '',
		description: 'End date for withdrawal history',
	},
];

export async function executeWithdrawalOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;

	switch (operation) {
		case 'create': {
			const prn = this.getNodeParameter('prn', i) as string;
			const amount = this.getNodeParameter('amount', i) as number;
			const withdrawalType = this.getNodeParameter('withdrawalType', i) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

			validatePrnField.call(this, prn, 'PRN');
			validateAmountField.call(this, amount, 'Amount');

			const params: IDataObject = {
				accountNo: prn,
				amount: amount.toFixed(2),
				type: withdrawalType,
				...additionalOptions,
			};

			response = await client.request(ENDPOINTS.withdrawal.create, params);
			break;
		}

		case 'get': {
			const withdrawalId = this.getNodeParameter('withdrawalId', i) as string;

			response = await client.request(ENDPOINTS.withdrawal.get, {
				withdrawal_id: withdrawalId,
			});
			break;
		}

		case 'getStatus': {
			const withdrawalId = this.getNodeParameter('withdrawalId', i) as string;

			response = await client.request(ENDPOINTS.withdrawal.getStatus, {
				withdrawal_id: withdrawalId,
			});
			break;
		}

		case 'cancel': {
			const withdrawalId = this.getNodeParameter('withdrawalId', i) as string;

			response = await client.request(ENDPOINTS.withdrawal.cancel, {
				withdrawal_id: withdrawalId,
			});
			break;
		}

		case 'getByAccount': {
			const prn = this.getNodeParameter('prn', i) as string;
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
			};

			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			response = await client.request(ENDPOINTS.withdrawal.getByAccount, params);
			break;
		}

		case 'getAtm': {
			const atmTransactionId = this.getNodeParameter('atmTransactionId', i) as string;

			response = await client.request(ENDPOINTS.withdrawal.getAtm, {
				trans_id: atmTransactionId,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
