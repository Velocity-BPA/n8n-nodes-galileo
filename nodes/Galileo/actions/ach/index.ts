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

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { createGalileoClient } from '../../transport/galileoClient';
import { ENDPOINTS } from '../../constants/endpoints';
import {
	validateAmountField,
	validatePrnField,
	validateRoutingNumber,
	validateAccountNumber,
} from '../../utils/validationUtils';

export const achOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['ach'],
			},
		},
		options: [
			{
				name: 'Create Credit',
				value: 'createCredit',
				description: 'Create an ACH credit (push funds out)',
				action: 'Create ACH credit',
			},
			{
				name: 'Create Debit',
				value: 'createDebit',
				description: 'Create an ACH debit (pull funds in)',
				action: 'Create ACH debit',
			},
			{
				name: 'Get Transfer',
				value: 'getTransfer',
				description: 'Get ACH transfer details',
				action: 'Get ACH transfer',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get ACH transfer status',
				action: 'Get ACH status',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel an ACH transfer',
				action: 'Cancel ACH transfer',
			},
			{
				name: 'Get By Reference',
				value: 'getByReference',
				description: 'Get ACH by reference ID',
				action: 'Get ACH by reference',
			},
			{
				name: 'Get Returns',
				value: 'getReturns',
				description: 'Get ACH returns for an account',
				action: 'Get ACH returns',
			},
			{
				name: 'Get Limits',
				value: 'getLimits',
				description: 'Get ACH limits for an account',
				action: 'Get ACH limits',
			},
		],
		default: 'createCredit',
	},
];

export const achFields: INodeProperties[] = [
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['createCredit', 'createDebit', 'getReturns', 'getLimits'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	{
		displayName: 'ACH ID',
		name: 'achId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['getTransfer', 'getStatus', 'cancel'],
			},
		},
		default: '',
		description: 'The ACH transfer ID',
	},
	{
		displayName: 'Reference ID',
		name: 'referenceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['getByReference'],
			},
		},
		default: '',
		description: 'External reference ID for the ACH transfer',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['createCredit', 'createDebit'],
			},
		},
		default: 0,
		typeOptions: {
			minValue: 0.01,
			numberPrecision: 2,
		},
		description: 'Amount to transfer in dollars',
	},
	{
		displayName: 'Routing Number',
		name: 'routingNumber',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['createCredit', 'createDebit'],
			},
		},
		default: '',
		description: 'ABA routing number (9 digits)',
	},
	{
		displayName: 'Account Number',
		name: 'accountNumber',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['createCredit', 'createDebit'],
			},
		},
		default: '',
		description: 'External bank account number',
	},
	{
		displayName: 'Account Type',
		name: 'accountType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['createCredit', 'createDebit'],
			},
		},
		options: [
			{ name: 'Checking', value: 'checking' },
			{ name: 'Savings', value: 'savings' },
		],
		default: 'checking',
		description: 'Type of external bank account',
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['getReturns'],
			},
		},
		default: '',
		description: 'Start date for returns query (YYYY-MM-DD)',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['getReturns'],
			},
		},
		default: '',
		description: 'End date for returns query (YYYY-MM-DD)',
	},
	{
		displayName: 'Additional Options',
		name: 'achOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['ach'],
				operation: ['createCredit', 'createDebit'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Account Holder Name',
				name: 'accountHolderName',
				type: 'string',
				default: '',
				description: 'Name on the external bank account',
			},
			{
				displayName: 'SEC Code',
				name: 'secCode',
				type: 'options',
				options: [
					{ name: 'PPD (Prearranged Payment)', value: 'PPD' },
					{ name: 'WEB (Internet Initiated)', value: 'WEB' },
					{ name: 'CCD (Corporate Credit/Debit)', value: 'CCD' },
					{ name: 'TEL (Telephone Initiated)', value: 'TEL' },
				],
				default: 'PPD',
				description: 'Standard Entry Class code for the ACH transaction',
			},
			{
				displayName: 'Memo',
				name: 'memo',
				type: 'string',
				default: '',
				description: 'Memo or description for the transfer',
			},
			{
				displayName: 'Same Day ACH',
				name: 'sameDayAch',
				type: 'boolean',
				default: false,
				description: 'Whether to process as same-day ACH (additional fees may apply)',
			},
		],
	},
];

export async function executeAch(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IDataObject> {
	const operation = this.getNodeParameter('operation', itemIndex) as string;
	const client = await createGalileoClient(this);

	switch (operation) {
		case 'createCredit': {
			const prn = this.getNodeParameter('prn', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as number;
			const routingNumber = this.getNodeParameter('routingNumber', itemIndex) as string;
			const accountNumber = this.getNodeParameter('accountNumber', itemIndex) as string;
			const accountType = this.getNodeParameter('accountType', itemIndex) as string;
			const achOptions = this.getNodeParameter('achOptions', itemIndex) as IDataObject;

			validatePrnField(this, prn, 'PRN', itemIndex);
			validateAmountField(this, amount, 'Amount', itemIndex);
			if (!validateRoutingNumber(routingNumber)) {
				throw new Error('Invalid routing number. Must be 9 digits.');
			}
			if (!validateAccountNumber(accountNumber)) {
				throw new Error('Invalid account number');
			}

			const params: IDataObject = {
				accountNo: prn,
				amount: amount.toFixed(2),
				routing_no: routingNumber,
				account_no: accountNumber,
				account_type: accountType,
				...achOptions,
			};

			const response = await client.request(ENDPOINTS.ach.createCredit, params);
			return response.data || (response as unknown as IDataObject);
		}

		case 'createDebit': {
			const prn = this.getNodeParameter('prn', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as number;
			const routingNumber = this.getNodeParameter('routingNumber', itemIndex) as string;
			const accountNumber = this.getNodeParameter('accountNumber', itemIndex) as string;
			const accountType = this.getNodeParameter('accountType', itemIndex) as string;
			const achOptions = this.getNodeParameter('achOptions', itemIndex) as IDataObject;

			validatePrnField(this, prn, 'PRN', itemIndex);
			validateAmountField(this, amount, 'Amount', itemIndex);
			if (!validateRoutingNumber(routingNumber)) {
				throw new Error('Invalid routing number. Must be 9 digits.');
			}
			if (!validateAccountNumber(accountNumber)) {
				throw new Error('Invalid account number');
			}

			const params: IDataObject = {
				accountNo: prn,
				amount: amount.toFixed(2),
				routing_no: routingNumber,
				account_no: accountNumber,
				account_type: accountType,
				...achOptions,
			};

			const response = await client.request(ENDPOINTS.ach.createDebit, params);
			return response.data || (response as unknown as IDataObject);
		}

		case 'getTransfer': {
			const achId = this.getNodeParameter('achId', itemIndex) as string;
			const response = await client.request(ENDPOINTS.ach.get, { ach_id: achId });
			return response.data || (response as unknown as IDataObject);
		}

		case 'getStatus': {
			const achId = this.getNodeParameter('achId', itemIndex) as string;
			const response = await client.request(ENDPOINTS.ach.getStatus, { ach_id: achId });
			return response.data || (response as unknown as IDataObject);
		}

		case 'cancel': {
			const achId = this.getNodeParameter('achId', itemIndex) as string;
			const response = await client.request(ENDPOINTS.ach.cancel, { ach_id: achId });
			return response.data || (response as unknown as IDataObject);
		}

		case 'getByReference': {
			const referenceId = this.getNodeParameter('referenceId', itemIndex) as string;
			const response = await client.request(ENDPOINTS.ach.getByReference, {
				reference_id: referenceId,
			});
			return response.data || (response as unknown as IDataObject);
		}

		case 'getReturns': {
			const prn = this.getNodeParameter('prn', itemIndex) as string;
			const startDate = this.getNodeParameter('startDate', itemIndex, '') as string;
			const endDate = this.getNodeParameter('endDate', itemIndex, '') as string;

			validatePrnField(this, prn, 'PRN', itemIndex);

			const params: IDataObject = { accountNo: prn };
			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			const response = await client.request(ENDPOINTS.ach.getReturns, params);
			return response.data || (response as unknown as IDataObject);
		}

		case 'getLimits': {
			const prn = this.getNodeParameter('prn', itemIndex) as string;
			validatePrnField(this, prn, 'PRN', itemIndex);

			const response = await client.request(ENDPOINTS.ach.getLimits, { accountNo: prn });
			return response.data || (response as unknown as IDataObject);
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}
