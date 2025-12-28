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
import { MCC_CATEGORIES } from '../../constants/mccCodes';
import { validateLuhn, detectCardNetwork, extractBin } from '../../utils/cardUtils';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Get BIN Info',
				value: 'getBinInfo',
				description: 'Get information about a card BIN',
				action: 'Get bin info',
			},
			{
				name: 'Validate Card Number',
				value: 'validateCardNumber',
				description: 'Validate a card number using Luhn algorithm',
				action: 'Validate card number',
			},
			{
				name: 'Get MCC Codes',
				value: 'getMccCodes',
				description: 'Get list of Merchant Category Codes',
				action: 'Get mcc codes',
			},
			{
				name: 'Get Country Codes',
				value: 'getCountryCodes',
				description: 'Get list of supported country codes',
				action: 'Get country codes',
			},
			{
				name: 'Get Currency Codes',
				value: 'getCurrencyCodes',
				description: 'Get list of supported currency codes',
				action: 'Get currency codes',
			},
			{
				name: 'Test Connection',
				value: 'testConnection',
				description: 'Test API connection',
				action: 'Test connection',
			},
			{
				name: 'Get API Status',
				value: 'getApiStatus',
				description: 'Get Galileo API status',
				action: 'Get api status',
			},
		],
		default: 'testConnection',
	},
];

export const utilityFields: INodeProperties[] = [
	// Get BIN Info fields
	{
		displayName: 'BIN',
		name: 'bin',
		type: 'string',
		required: true,
		default: '',
		placeholder: '411111',
		description: 'Bank Identification Number (first 6-8 digits of card)',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getBinInfo'],
			},
		},
	},
	// Validate Card Number fields
	{
		displayName: 'Card Number',
		name: 'cardNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '4111111111111111',
		description: 'Full card number to validate',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateCardNumber'],
			},
		},
	},
	// Get MCC Codes filter
	{
		displayName: 'Category Filter',
		name: 'categoryFilter',
		type: 'options',
		options: [
			{ name: 'All Categories', value: '' },
			{ name: 'Airlines', value: 'airlines' },
			{ name: 'Auto/Vehicle', value: 'auto' },
			{ name: 'Business Services', value: 'business' },
			{ name: 'Clothing/Accessories', value: 'clothing' },
			{ name: 'Contracted Services', value: 'contracted' },
			{ name: 'Education', value: 'education' },
			{ name: 'Entertainment', value: 'entertainment' },
			{ name: 'Financial Services', value: 'financial' },
			{ name: 'Food/Beverage', value: 'food' },
			{ name: 'Government Services', value: 'government' },
			{ name: 'Healthcare', value: 'healthcare' },
			{ name: 'Hotels/Lodging', value: 'lodging' },
			{ name: 'Professional Services', value: 'professional' },
			{ name: 'Retail', value: 'retail' },
			{ name: 'Transportation', value: 'transportation' },
			{ name: 'Utilities', value: 'utilities' },
		],
		default: '',
		description: 'Filter MCC codes by category',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getMccCodes'],
			},
		},
	},
	// Get Country Codes filter
	{
		displayName: 'Region Filter',
		name: 'regionFilter',
		type: 'options',
		options: [
			{ name: 'All Regions', value: '' },
			{ name: 'North America', value: 'north_america' },
			{ name: 'Europe', value: 'europe' },
			{ name: 'Asia Pacific', value: 'asia_pacific' },
			{ name: 'Latin America', value: 'latin_america' },
			{ name: 'Middle East/Africa', value: 'mea' },
		],
		default: '',
		description: 'Filter countries by region',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getCountryCodes'],
			},
		},
	},
	// Get Currency Codes filter
	{
		displayName: 'Common Only',
		name: 'commonOnly',
		type: 'boolean',
		default: true,
		description: 'Whether to show only commonly used currencies',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getCurrencyCodes'],
			},
		},
	},
];

export async function executeUtility(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject> {
	const operation = this.getNodeParameter('operation', index) as string;
	const client = await createGalileoClient.call(this);

	switch (operation) {
		case 'getBinInfo': {
			const bin = this.getNodeParameter('bin', index) as string;

			// Validate BIN format
			if (!/^\d{6,8}$/.test(bin)) {
				throw new Error('BIN must be 6-8 digits');
			}

			return client.request(ENDPOINTS.utility.getBinInfo, {
				bin,
			});
		}

		case 'validateCardNumber': {
			const cardNumber = this.getNodeParameter('cardNumber', index) as string;

			// Clean card number
			const cleanNumber = cardNumber.replace(/[\s-]/g, '');

			// Local validation
			const isValid = validateLuhn(cleanNumber);
			const network = detectCardNetwork(cleanNumber);
			const bin = extractBin(cleanNumber);

			return {
				cardNumber: cleanNumber.replace(/\d(?=\d{4})/g, '*'), // Mask all but last 4
				isValid,
				network,
				bin,
				length: cleanNumber.length,
				validLength: cleanNumber.length >= 13 && cleanNumber.length <= 19,
			};
		}

		case 'getMccCodes': {
			const categoryFilter = this.getNodeParameter('categoryFilter', index, '') as string;

			// Return local MCC data (optionally filtered)
			const mccData = Object.entries(MCC_CATEGORIES).map(([name, code]) => ({
				code,
				name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
				category: getCategoryFromCode(code as string),
			}));

			if (categoryFilter) {
				return {
					codes: mccData.filter(item => item.category.toLowerCase() === categoryFilter),
					count: mccData.filter(item => item.category.toLowerCase() === categoryFilter).length,
					filter: categoryFilter,
				};
			}

			return {
				codes: mccData,
				count: mccData.length,
			};
		}

		case 'getCountryCodes': {
			const regionFilter = this.getNodeParameter('regionFilter', index, '') as string;

			const params: IDataObject = {};
			if (regionFilter) {
				params.region = regionFilter;
			}

			return client.request(ENDPOINTS.utility.getCountryCodes, params);
		}

		case 'getCurrencyCodes': {
			const commonOnly = this.getNodeParameter('commonOnly', index) as boolean;

			const params: IDataObject = {};
			if (commonOnly) {
				params.commonOnly = '1';
			}

			return client.request(ENDPOINTS.utility.getCurrencyCodes, params);
		}

		case 'testConnection': {
			try {
				const result = await client.testConnection();
				return {
					success: true,
					message: 'Successfully connected to Galileo API',
					...result,
				};
			} catch (error) {
				return {
					success: false,
					message: `Connection failed: ${(error as Error).message}`,
					error: (error as Error).message,
				};
			}
		}

		case 'getApiStatus': {
			return client.request(ENDPOINTS.utility.getApiStatus, {});
		}

		default:
			throw new Error(`Operation ${operation} is not supported for utility resource`);
	}
}

/**
 * Helper function to categorize MCC codes
 */
function getCategoryFromCode(code: string): string {
	const codeNum = parseInt(code, 10);

	if (codeNum >= 3000 && codeNum <= 3350) return 'Airlines';
	if (codeNum >= 3351 && codeNum <= 3500) return 'Auto';
	if (codeNum >= 3501 && codeNum <= 3999) return 'Lodging';
	if (codeNum >= 4000 && codeNum <= 4799) return 'Transportation';
	if (codeNum >= 4800 && codeNum <= 4999) return 'Utilities';
	if (codeNum >= 5000 && codeNum <= 5099) return 'Wholesale';
	if (codeNum >= 5100 && codeNum <= 5199) return 'Wholesale';
	if (codeNum >= 5200 && codeNum <= 5499) return 'Retail';
	if (codeNum >= 5500 && codeNum <= 5599) return 'Auto';
	if (codeNum >= 5600 && codeNum <= 5699) return 'Clothing';
	if (codeNum >= 5700 && codeNum <= 5799) return 'Retail';
	if (codeNum >= 5800 && codeNum <= 5899) return 'Food';
	if (codeNum >= 5900 && codeNum <= 5999) return 'Retail';
	if (codeNum >= 6000 && codeNum <= 6299) return 'Financial';
	if (codeNum >= 6300 && codeNum <= 6999) return 'Financial';
	if (codeNum >= 7000 && codeNum <= 7299) return 'Lodging';
	if (codeNum >= 7300 && codeNum <= 7399) return 'Business';
	if (codeNum >= 7500 && codeNum <= 7599) return 'Auto';
	if (codeNum >= 7600 && codeNum <= 7699) return 'Contracted';
	if (codeNum >= 7800 && codeNum <= 7999) return 'Entertainment';
	if (codeNum >= 8000 && codeNum <= 8099) return 'Professional';
	if (codeNum >= 8100 && codeNum <= 8299) return 'Professional';
	if (codeNum >= 8300 && codeNum <= 8399) return 'Professional';
	if (codeNum >= 8400 && codeNum <= 8499) return 'Professional';
	if (codeNum >= 8600 && codeNum <= 8699) return 'Professional';
	if (codeNum >= 8700 && codeNum <= 8999) return 'Professional';
	if (codeNum >= 9000 && codeNum <= 9999) return 'Government';

	return 'Other';
}
