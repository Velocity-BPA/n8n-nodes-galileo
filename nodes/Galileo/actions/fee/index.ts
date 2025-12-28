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

export const feeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['fee'],
			},
		},
		options: [
			{
				name: 'Get Schedule',
				value: 'getSchedule',
				description: 'Get fee schedule for an account',
				action: 'Get fee schedule',
			},
			{
				name: 'Apply Fee',
				value: 'applyFee',
				description: 'Apply a fee to an account',
				action: 'Apply fee',
			},
			{
				name: 'Waive Fee',
				value: 'waiveFee',
				description: 'Waive a fee',
				action: 'Waive fee',
			},
			{
				name: 'Get By Account',
				value: 'getByAccount',
				description: 'Get fees charged to an account',
				action: 'Get fees by account',
			},
			{
				name: 'Get History',
				value: 'getHistory',
				description: 'Get fee history',
				action: 'Get fee history',
			},
			{
				name: 'Get Types',
				value: 'getTypes',
				description: 'Get available fee types',
				action: 'Get fee types',
			},
			{
				name: 'Calculate Fee',
				value: 'calculateFee',
				description: 'Calculate fee amount',
				action: 'Calculate fee',
			},
		],
		default: 'getSchedule',
	},
];

export const feeFields: INodeProperties[] = [
	// PRN
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['getSchedule', 'applyFee', 'getByAccount', 'getHistory', 'calculateFee'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Fee ID
	{
		displayName: 'Fee ID',
		name: 'feeId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['waiveFee'],
			},
		},
		default: '',
		description: 'The unique identifier for the fee',
	},
	// Fee Type
	{
		displayName: 'Fee Type',
		name: 'feeType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['applyFee', 'calculateFee'],
			},
		},
		options: [
			{ name: 'Monthly Maintenance', value: 'MONTHLY_MAINTENANCE' },
			{ name: 'ATM Fee (In-Network)', value: 'ATM_IN_NETWORK' },
			{ name: 'ATM Fee (Out-of-Network)', value: 'ATM_OUT_NETWORK' },
			{ name: 'ATM Decline Fee', value: 'ATM_DECLINE' },
			{ name: 'Foreign Transaction', value: 'FOREIGN_TRANSACTION' },
			{ name: 'Overdraft', value: 'OVERDRAFT' },
			{ name: 'NSF (Non-Sufficient Funds)', value: 'NSF' },
			{ name: 'ACH Return', value: 'ACH_RETURN' },
			{ name: 'Wire Transfer', value: 'WIRE_TRANSFER' },
			{ name: 'Card Replacement', value: 'CARD_REPLACEMENT' },
			{ name: 'Expedited Card', value: 'EXPEDITED_CARD' },
			{ name: 'Paper Statement', value: 'PAPER_STATEMENT' },
			{ name: 'Inactivity', value: 'INACTIVITY' },
			{ name: 'Account Closure', value: 'ACCOUNT_CLOSURE' },
			{ name: 'Balance Inquiry', value: 'BALANCE_INQUIRY' },
			{ name: 'Bill Pay', value: 'BILL_PAY' },
			{ name: 'Express Bill Pay', value: 'EXPRESS_BILL_PAY' },
			{ name: 'Same Day ACH', value: 'SAME_DAY_ACH' },
			{ name: 'Custom', value: 'CUSTOM' },
		],
		default: 'MONTHLY_MAINTENANCE',
		description: 'Type of fee',
	},
	// Fee Amount (for applyFee)
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['applyFee'],
			},
		},
		default: 0,
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
		description: 'Fee amount (leave at 0 to use default amount for fee type)',
	},
	// Apply Fee Options
	{
		displayName: 'Fee Options',
		name: 'feeOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['applyFee'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the fee',
			},
			{
				displayName: 'Reference ID',
				name: 'referenceId',
				type: 'string',
				default: '',
				description: 'External reference ID',
			},
			{
				displayName: 'Related Transaction ID',
				name: 'relatedTransactionId',
				type: 'string',
				default: '',
				description: 'ID of related transaction that triggered this fee',
			},
			{
				displayName: 'Effective Date',
				name: 'effectiveDate',
				type: 'dateTime',
				default: '',
				description: 'Date the fee should be applied',
			},
		],
	},
	// Waive Fee Options
	{
		displayName: 'Waive Options',
		name: 'waiveOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['waiveFee'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'options',
				options: [
					{ name: 'Customer Request', value: 'CUSTOMER_REQUEST' },
					{ name: 'Goodwill Gesture', value: 'GOODWILL' },
					{ name: 'System Error', value: 'SYSTEM_ERROR' },
					{ name: 'Promotion', value: 'PROMOTION' },
					{ name: 'New Account', value: 'NEW_ACCOUNT' },
					{ name: 'Loyalty', value: 'LOYALTY' },
					{ name: 'Other', value: 'OTHER' },
				],
				default: 'CUSTOMER_REQUEST',
				description: 'Reason for waiving the fee',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Additional notes about the waiver',
			},
		],
	},
	// Transaction Amount (for calculateFee)
	{
		displayName: 'Transaction Amount',
		name: 'transactionAmount',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['calculateFee'],
			},
		},
		default: 0,
		typeOptions: {
			numberPrecision: 2,
			minValue: 0,
		},
		description: 'Transaction amount (for percentage-based fees)',
	},
	// Date filters
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['getByAccount', 'getHistory'],
			},
		},
		default: '',
		description: 'Start date for fee history',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['getByAccount', 'getHistory'],
			},
		},
		default: '',
		description: 'End date for fee history',
	},
	// Include Waived
	{
		displayName: 'Include Waived Fees',
		name: 'includeWaived',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['fee'],
				operation: ['getByAccount', 'getHistory'],
			},
		},
		default: false,
		description: 'Whether to include waived fees in the results',
	},
];

export async function executeFeeOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;

	switch (operation) {
		case 'getSchedule': {
			const prn = this.getNodeParameter('prn', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			response = await client.request(ENDPOINTS.fee.getSchedule, {
				accountNo: prn,
			});
			break;
		}

		case 'applyFee': {
			const prn = this.getNodeParameter('prn', i) as string;
			const feeType = this.getNodeParameter('feeType', i) as string;
			const amount = this.getNodeParameter('amount', i) as number;
			const feeOptions = this.getNodeParameter('feeOptions', i) as IDataObject;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
				fee_type: feeType,
				...feeOptions,
			};

			if (amount > 0) {
				params.amount = amount.toFixed(2);
			}

			response = await client.request(ENDPOINTS.fee.apply, params);
			break;
		}

		case 'waiveFee': {
			const feeId = this.getNodeParameter('feeId', i) as string;
			const waiveOptions = this.getNodeParameter('waiveOptions', i) as IDataObject;

			const params: IDataObject = {
				fee_id: feeId,
				...waiveOptions,
			};

			response = await client.request(ENDPOINTS.fee.waive, params);
			break;
		}

		case 'getByAccount': {
			const prn = this.getNodeParameter('prn', i) as string;
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;
			const includeWaived = this.getNodeParameter('includeWaived', i) as boolean;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
				include_waived: includeWaived,
			};

			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			response = await client.request(ENDPOINTS.fee.getByAccount, params);
			break;
		}

		case 'getHistory': {
			const prn = this.getNodeParameter('prn', i) as string;
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;
			const includeWaived = this.getNodeParameter('includeWaived', i) as boolean;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
				include_waived: includeWaived,
			};

			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			response = await client.request(ENDPOINTS.fee.getHistory, params);
			break;
		}

		case 'getTypes': {
			response = await client.request(ENDPOINTS.fee.getTypes, {});
			break;
		}

		case 'calculateFee': {
			const prn = this.getNodeParameter('prn', i) as string;
			const feeType = this.getNodeParameter('feeType', i) as string;
			const transactionAmount = this.getNodeParameter('transactionAmount', i) as number;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
				fee_type: feeType,
			};

			if (transactionAmount > 0) {
				params.trans_amount = transactionAmount.toFixed(2);
			}

			response = await client.request(ENDPOINTS.fee.calculate, params);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
