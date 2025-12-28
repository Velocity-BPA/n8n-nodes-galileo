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

export const limitOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['limit'],
			},
		},
		options: [
			{
				name: 'Get Account Limits',
				value: 'getAccountLimits',
				description: 'Get limits for an account',
				action: 'Get account limits',
			},
			{
				name: 'Update Account Limits',
				value: 'updateAccountLimits',
				description: 'Update account limits',
				action: 'Update account limits',
			},
			{
				name: 'Get Card Limits',
				value: 'getCardLimits',
				description: 'Get limits for a card',
				action: 'Get card limits',
			},
			{
				name: 'Update Card Limits',
				value: 'updateCardLimits',
				description: 'Update card limits',
				action: 'Update card limits',
			},
			{
				name: 'Get Transaction Limits',
				value: 'getTransactionLimits',
				description: 'Get transaction-level limits',
				action: 'Get transaction limits',
			},
			{
				name: 'Get Daily Limits',
				value: 'getDailyLimits',
				description: 'Get daily spending/withdrawal limits',
				action: 'Get daily limits',
			},
			{
				name: 'Get Monthly Limits',
				value: 'getMonthlyLimits',
				description: 'Get monthly spending limits',
				action: 'Get monthly limits',
			},
			{
				name: 'Reset Limits',
				value: 'resetLimits',
				description: 'Reset limits to default values',
				action: 'Reset limits',
			},
		],
		default: 'getAccountLimits',
	},
];

export const limitFields: INodeProperties[] = [
	// PRN (Account)
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['limit'],
				operation: ['getAccountLimits', 'updateAccountLimits', 'getDailyLimits', 'getMonthlyLimits', 'resetLimits'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Card PRN
	{
		displayName: 'Card PRN',
		name: 'cardPrn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['limit'],
				operation: ['getCardLimits', 'updateCardLimits', 'getTransactionLimits'],
			},
		},
		default: '',
		description: 'Card Program Routing Number',
	},
	// Account Limits Update
	{
		displayName: 'Account Limits',
		name: 'accountLimits',
		type: 'collection',
		placeholder: 'Add Limit',
		displayOptions: {
			show: {
				resource: ['limit'],
				operation: ['updateAccountLimits'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Daily Spend Limit',
				name: 'dailySpendLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum daily spending amount',
			},
			{
				displayName: 'Daily ATM Limit',
				name: 'dailyAtmLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum daily ATM withdrawal amount',
			},
			{
				displayName: 'Monthly Spend Limit',
				name: 'monthlySpendLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum monthly spending amount',
			},
			{
				displayName: 'Single Transaction Limit',
				name: 'singleTransactionLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum single transaction amount',
			},
			{
				displayName: 'ACH Daily Limit',
				name: 'achDailyLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum daily ACH transfer amount',
			},
			{
				displayName: 'ACH Monthly Limit',
				name: 'achMonthlyLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum monthly ACH transfer amount',
			},
			{
				displayName: 'Load Daily Limit',
				name: 'loadDailyLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum daily load amount',
			},
			{
				displayName: 'Balance Limit',
				name: 'balanceLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum account balance',
			},
		],
	},
	// Card Limits Update
	{
		displayName: 'Card Limits',
		name: 'cardLimits',
		type: 'collection',
		placeholder: 'Add Limit',
		displayOptions: {
			show: {
				resource: ['limit'],
				operation: ['updateCardLimits'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Daily POS Limit',
				name: 'dailyPosLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum daily point-of-sale spend',
			},
			{
				displayName: 'Daily ATM Limit',
				name: 'dailyAtmLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum daily ATM withdrawal',
			},
			{
				displayName: 'Single POS Limit',
				name: 'singlePosLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum single POS transaction',
			},
			{
				displayName: 'Single ATM Limit',
				name: 'singleAtmLimit',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Maximum single ATM withdrawal',
			},
			{
				displayName: 'Daily Transaction Count',
				name: 'dailyTransactionCount',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Maximum number of transactions per day',
			},
			{
				displayName: 'Daily ATM Count',
				name: 'dailyAtmCount',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description: 'Maximum number of ATM withdrawals per day',
			},
			{
				displayName: 'International Enabled',
				name: 'internationalEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether international transactions are allowed',
			},
			{
				displayName: 'Ecommerce Enabled',
				name: 'ecommerceEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether online/e-commerce transactions are allowed',
			},
		],
	},
	// Limit Type for reset
	{
		displayName: 'Limit Type',
		name: 'limitType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['limit'],
				operation: ['resetLimits'],
			},
		},
		options: [
			{ name: 'All Limits', value: 'ALL' },
			{ name: 'Daily Limits', value: 'DAILY' },
			{ name: 'Monthly Limits', value: 'MONTHLY' },
			{ name: 'Transaction Limits', value: 'TRANSACTION' },
			{ name: 'ATM Limits', value: 'ATM' },
			{ name: 'ACH Limits', value: 'ACH' },
		],
		default: 'ALL',
		description: 'Which limits to reset',
	},
];

export async function executeLimitOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;

	switch (operation) {
		case 'getAccountLimits': {
			const prn = this.getNodeParameter('prn', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			response = await client.request(ENDPOINTS.limit.getAccount, {
				accountNo: prn,
			});
			break;
		}

		case 'updateAccountLimits': {
			const prn = this.getNodeParameter('prn', i) as string;
			const accountLimits = this.getNodeParameter('accountLimits', i) as IDataObject;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
			};

			// Convert limit values to API format
			if (accountLimits.dailySpendLimit) params.daily_spend_limit = accountLimits.dailySpendLimit;
			if (accountLimits.dailyAtmLimit) params.daily_atm_limit = accountLimits.dailyAtmLimit;
			if (accountLimits.monthlySpendLimit) params.monthly_spend_limit = accountLimits.monthlySpendLimit;
			if (accountLimits.singleTransactionLimit) params.single_trans_limit = accountLimits.singleTransactionLimit;
			if (accountLimits.achDailyLimit) params.ach_daily_limit = accountLimits.achDailyLimit;
			if (accountLimits.achMonthlyLimit) params.ach_monthly_limit = accountLimits.achMonthlyLimit;
			if (accountLimits.loadDailyLimit) params.load_daily_limit = accountLimits.loadDailyLimit;
			if (accountLimits.balanceLimit) params.balance_limit = accountLimits.balanceLimit;

			response = await client.request(ENDPOINTS.limit.updateAccount, params);
			break;
		}

		case 'getCardLimits': {
			const cardPrn = this.getNodeParameter('cardPrn', i) as string;

			validatePrnField.call(this, cardPrn, 'Card PRN');

			response = await client.request(ENDPOINTS.limit.getCard, {
				cardNo: cardPrn,
			});
			break;
		}

		case 'updateCardLimits': {
			const cardPrn = this.getNodeParameter('cardPrn', i) as string;
			const cardLimits = this.getNodeParameter('cardLimits', i) as IDataObject;

			validatePrnField.call(this, cardPrn, 'Card PRN');

			const params: IDataObject = {
				cardNo: cardPrn,
			};

			// Convert limit values to API format
			if (cardLimits.dailyPosLimit) params.daily_pos_limit = cardLimits.dailyPosLimit;
			if (cardLimits.dailyAtmLimit) params.daily_atm_limit = cardLimits.dailyAtmLimit;
			if (cardLimits.singlePosLimit) params.single_pos_limit = cardLimits.singlePosLimit;
			if (cardLimits.singleAtmLimit) params.single_atm_limit = cardLimits.singleAtmLimit;
			if (cardLimits.dailyTransactionCount) params.daily_trans_count = cardLimits.dailyTransactionCount;
			if (cardLimits.dailyAtmCount) params.daily_atm_count = cardLimits.dailyAtmCount;
			if (cardLimits.internationalEnabled !== undefined) params.international_enabled = cardLimits.internationalEnabled;
			if (cardLimits.ecommerceEnabled !== undefined) params.ecommerce_enabled = cardLimits.ecommerceEnabled;

			response = await client.request(ENDPOINTS.limit.updateCard, params);
			break;
		}

		case 'getTransactionLimits': {
			const cardPrn = this.getNodeParameter('cardPrn', i) as string;

			validatePrnField.call(this, cardPrn, 'Card PRN');

			response = await client.request(ENDPOINTS.limit.getTransaction, {
				cardNo: cardPrn,
			});
			break;
		}

		case 'getDailyLimits': {
			const prn = this.getNodeParameter('prn', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			response = await client.request(ENDPOINTS.limit.getDaily, {
				accountNo: prn,
			});
			break;
		}

		case 'getMonthlyLimits': {
			const prn = this.getNodeParameter('prn', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			response = await client.request(ENDPOINTS.limit.getMonthly, {
				accountNo: prn,
			});
			break;
		}

		case 'resetLimits': {
			const prn = this.getNodeParameter('prn', i) as string;
			const limitType = this.getNodeParameter('limitType', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			response = await client.request(ENDPOINTS.limit.reset, {
				accountNo: prn,
				limit_type: limitType,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
