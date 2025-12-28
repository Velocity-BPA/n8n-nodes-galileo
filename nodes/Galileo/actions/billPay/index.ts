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

export const billPayOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['billPay'],
			},
		},
		options: [
			{
				name: 'Create Payment',
				value: 'createPayment',
				description: 'Create a bill payment',
				action: 'Create bill payment',
			},
			{
				name: 'Get Payment',
				value: 'getPayment',
				description: 'Get bill payment details',
				action: 'Get bill payment',
			},
			{
				name: 'Cancel Payment',
				value: 'cancelPayment',
				description: 'Cancel a bill payment',
				action: 'Cancel bill payment',
			},
			{
				name: 'Get Payments',
				value: 'getPayments',
				description: 'Get bill payments for an account',
				action: 'Get bill payments',
			},
			{
				name: 'Get Billers',
				value: 'getBillers',
				description: 'Get saved billers for an account',
				action: 'Get billers',
			},
			{
				name: 'Add Biller',
				value: 'addBiller',
				description: 'Add a new biller',
				action: 'Add biller',
			},
			{
				name: 'Remove Biller',
				value: 'removeBiller',
				description: 'Remove a saved biller',
				action: 'Remove biller',
			},
			{
				name: 'Get Payment Status',
				value: 'getPaymentStatus',
				description: 'Get bill payment status',
				action: 'Get payment status',
			},
		],
		default: 'createPayment',
	},
];

export const billPayFields: INodeProperties[] = [
	// PRN - Used by multiple operations
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['createPayment', 'getPayments', 'getBillers', 'addBiller'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Payment ID
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['getPayment', 'cancelPayment', 'getPaymentStatus'],
			},
		},
		default: '',
		description: 'The unique identifier for the bill payment',
	},
	// Biller ID
	{
		displayName: 'Biller ID',
		name: 'billerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['createPayment', 'removeBiller'],
			},
		},
		default: '',
		description: 'The unique identifier for the biller',
	},
	// Amount
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['createPayment'],
			},
		},
		default: 0,
		typeOptions: {
			numberPrecision: 2,
			minValue: 0.01,
		},
		description: 'Payment amount in dollars',
	},
	// Payment Options
	{
		displayName: 'Payment Options',
		name: 'paymentOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['createPayment'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Account Number at Biller',
				name: 'billerAccountNumber',
				type: 'string',
				default: '',
				description: 'Your account number with the biller',
			},
			{
				displayName: 'Schedule Date',
				name: 'scheduleDate',
				type: 'dateTime',
				default: '',
				description: 'Date to schedule the payment (for future-dated payments)',
			},
			{
				displayName: 'Memo',
				name: 'memo',
				type: 'string',
				default: '',
				description: 'Payment memo/note',
			},
			{
				displayName: 'Recurring',
				name: 'recurring',
				type: 'boolean',
				default: false,
				description: 'Whether this is a recurring payment',
			},
			{
				displayName: 'Frequency',
				name: 'frequency',
				type: 'options',
				options: [
					{ name: 'Weekly', value: 'WEEKLY' },
					{ name: 'Bi-Weekly', value: 'BIWEEKLY' },
					{ name: 'Monthly', value: 'MONTHLY' },
					{ name: 'Quarterly', value: 'QUARTERLY' },
					{ name: 'Annually', value: 'ANNUALLY' },
				],
				default: 'MONTHLY',
				description: 'Frequency for recurring payments',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'End date for recurring payments',
			},
			{
				displayName: 'Express Payment',
				name: 'expressPayment',
				type: 'boolean',
				default: false,
				description: 'Whether to use express/expedited payment (additional fees may apply)',
			},
		],
	},
	// Add Biller fields
	{
		displayName: 'Biller Name',
		name: 'billerName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['addBiller'],
			},
		},
		default: '',
		description: 'Name of the biller',
	},
	{
		displayName: 'Biller Details',
		name: 'billerDetails',
		type: 'collection',
		placeholder: 'Add Detail',
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['addBiller'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Account Number',
				name: 'accountNumber',
				type: 'string',
				default: '',
				description: 'Your account number with the biller',
			},
			{
				displayName: 'Biller Address',
				name: 'billerAddress',
				type: 'string',
				default: '',
				description: 'Mailing address for the biller',
			},
			{
				displayName: 'Biller City',
				name: 'billerCity',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Biller State',
				name: 'billerState',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Biller ZIP',
				name: 'billerZip',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Biller Phone',
				name: 'billerPhone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: [
					{ name: 'Utilities', value: 'UTILITIES' },
					{ name: 'Credit Card', value: 'CREDIT_CARD' },
					{ name: 'Insurance', value: 'INSURANCE' },
					{ name: 'Mortgage', value: 'MORTGAGE' },
					{ name: 'Auto Loan', value: 'AUTO_LOAN' },
					{ name: 'Phone', value: 'PHONE' },
					{ name: 'Internet', value: 'INTERNET' },
					{ name: 'Cable', value: 'CABLE' },
					{ name: 'Other', value: 'OTHER' },
				],
				default: 'OTHER',
				description: 'Category of biller',
			},
			{
				displayName: 'Nickname',
				name: 'nickname',
				type: 'string',
				default: '',
				description: 'Friendly nickname for this biller',
			},
		],
	},
	// Date filters for getPayments
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['getPayments'],
			},
		},
		default: '',
		description: 'Start date for payment history',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['billPay'],
				operation: ['getPayments'],
			},
		},
		default: '',
		description: 'End date for payment history',
	},
];

export async function executeBillPayOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;

	switch (operation) {
		case 'createPayment': {
			const prn = this.getNodeParameter('prn', i) as string;
			const billerId = this.getNodeParameter('billerId', i) as string;
			const amount = this.getNodeParameter('amount', i) as number;
			const paymentOptions = this.getNodeParameter('paymentOptions', i) as IDataObject;

			validatePrnField.call(this, prn, 'PRN');
			validateAmountField.call(this, amount, 'Amount');

			const params: IDataObject = {
				accountNo: prn,
				biller_id: billerId,
				amount: amount.toFixed(2),
				...paymentOptions,
			};

			response = await client.request(ENDPOINTS.billPay.create, params);
			break;
		}

		case 'getPayment': {
			const paymentId = this.getNodeParameter('paymentId', i) as string;

			response = await client.request(ENDPOINTS.billPay.get, {
				payment_id: paymentId,
			});
			break;
		}

		case 'cancelPayment': {
			const paymentId = this.getNodeParameter('paymentId', i) as string;

			response = await client.request(ENDPOINTS.billPay.cancel, {
				payment_id: paymentId,
			});
			break;
		}

		case 'getPayments': {
			const prn = this.getNodeParameter('prn', i) as string;
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
			};

			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			response = await client.request(ENDPOINTS.billPay.get, params);
			break;
		}

		case 'getBillers': {
			const prn = this.getNodeParameter('prn', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			response = await client.request(ENDPOINTS.billPay.getBillers, {
				accountNo: prn,
			});
			break;
		}

		case 'addBiller': {
			const prn = this.getNodeParameter('prn', i) as string;
			const billerName = this.getNodeParameter('billerName', i) as string;
			const billerDetails = this.getNodeParameter('billerDetails', i) as IDataObject;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
				biller_name: billerName,
				...billerDetails,
			};

			response = await client.request(ENDPOINTS.billPay.addBiller, params);
			break;
		}

		case 'removeBiller': {
			const billerId = this.getNodeParameter('billerId', i) as string;

			response = await client.request(ENDPOINTS.billPay.removeBiller, {
				biller_id: billerId,
			});
			break;
		}

		case 'getPaymentStatus': {
			const paymentId = this.getNodeParameter('paymentId', i) as string;

			response = await client.request(ENDPOINTS.billPay.getStatus, {
				payment_id: paymentId,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
