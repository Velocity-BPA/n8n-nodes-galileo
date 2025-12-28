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
import { validatePrnField } from '../../utils/validationUtils';

export const statementOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['statement'],
			},
		},
		options: [
			{
				name: 'Get Statement',
				value: 'get',
				description: 'Get a statement',
				action: 'Get a statement',
			},
			{
				name: 'List Statements',
				value: 'list',
				description: 'List available statements',
				action: 'List statements',
			},
			{
				name: 'Get PDF',
				value: 'getPdf',
				description: 'Get statement as PDF',
				action: 'Get statement PDF',
			},
			{
				name: 'Get By Period',
				value: 'getByPeriod',
				description: 'Get statement for a specific period',
				action: 'Get statement by period',
			},
			{
				name: 'Get Mini Statement',
				value: 'getMini',
				description: 'Get mini statement (recent transactions summary)',
				action: 'Get mini statement',
			},
		],
		default: 'get',
	},
];

export const statementFields: INodeProperties[] = [
	// PRN - Used by all operations
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['statement'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Statement ID
	{
		displayName: 'Statement ID',
		name: 'statementId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['statement'],
				operation: ['get', 'getPdf'],
			},
		},
		default: '',
		description: 'The unique identifier for the statement',
	},
	// Period for getByPeriod
	{
		displayName: 'Year',
		name: 'year',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['statement'],
				operation: ['getByPeriod'],
			},
		},
		default: new Date().getFullYear(),
		typeOptions: {
			minValue: 2000,
			maxValue: 2100,
		},
		description: 'Statement year',
	},
	{
		displayName: 'Month',
		name: 'month',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['statement'],
				operation: ['getByPeriod'],
			},
		},
		options: [
			{ name: 'January', value: 1 },
			{ name: 'February', value: 2 },
			{ name: 'March', value: 3 },
			{ name: 'April', value: 4 },
			{ name: 'May', value: 5 },
			{ name: 'June', value: 6 },
			{ name: 'July', value: 7 },
			{ name: 'August', value: 8 },
			{ name: 'September', value: 9 },
			{ name: 'October', value: 10 },
			{ name: 'November', value: 11 },
			{ name: 'December', value: 12 },
		],
		default: 1,
		description: 'Statement month',
	},
	// Options for list
	{
		displayName: 'List Options',
		name: 'listOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['statement'],
				operation: ['list'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Year',
				name: 'year',
				type: 'number',
				default: 0,
				description: 'Filter by year (0 for all)',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 12,
				description: 'Maximum number of statements to return',
			},
		],
	},
	// Mini statement options
	{
		displayName: 'Transaction Count',
		name: 'transactionCount',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['statement'],
				operation: ['getMini'],
			},
		},
		default: 10,
		typeOptions: {
			minValue: 1,
			maxValue: 50,
		},
		description: 'Number of recent transactions to include',
	},
	// Format options
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['statement'],
				operation: ['get', 'getByPeriod'],
			},
		},
		options: [
			{ name: 'JSON', value: 'json' },
			{ name: 'HTML', value: 'html' },
			{ name: 'Text', value: 'text' },
		],
		default: 'json',
		description: 'Output format for the statement',
	},
];

export async function executeStatementOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;
	const prn = this.getNodeParameter('prn', i) as string;
	validatePrnField.call(this, prn, 'PRN');

	switch (operation) {
		case 'get': {
			const statementId = this.getNodeParameter('statementId', i) as string;
			const format = this.getNodeParameter('format', i) as string;

			response = await client.request(ENDPOINTS.statement.get, {
				accountNo: prn,
				statement_id: statementId,
				format,
			});
			break;
		}

		case 'list': {
			const listOptions = this.getNodeParameter('listOptions', i) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
			};

			if (listOptions.year && listOptions.year !== 0) {
				params.year = listOptions.year;
			}
			if (listOptions.limit) {
				params.limit = listOptions.limit;
			}

			response = await client.request(ENDPOINTS.statement.list, params);
			break;
		}

		case 'getPdf': {
			const statementId = this.getNodeParameter('statementId', i) as string;

			response = await client.request(ENDPOINTS.statement.getPdf, {
				accountNo: prn,
				statement_id: statementId,
			});
			break;
		}

		case 'getByPeriod': {
			const year = this.getNodeParameter('year', i) as number;
			const month = this.getNodeParameter('month', i) as number;
			const format = this.getNodeParameter('format', i) as string;

			response = await client.request(ENDPOINTS.statement.getByPeriod, {
				accountNo: prn,
				year,
				month,
				format,
			});
			break;
		}

		case 'getMini': {
			const transactionCount = this.getNodeParameter('transactionCount', i) as number;

			response = await client.request(ENDPOINTS.statement.getMini, {
				accountNo: prn,
				trans_count: transactionCount,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
