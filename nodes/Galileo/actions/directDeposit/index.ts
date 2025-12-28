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

export const directDepositOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['directDeposit'],
			},
		},
		options: [
			{
				name: 'Get Info',
				value: 'getInfo',
				description: 'Get direct deposit information for an account',
				action: 'Get direct deposit info',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update direct deposit settings',
				action: 'Update direct deposit',
			},
			{
				name: 'Get Instructions',
				value: 'getInstructions',
				description: 'Get direct deposit instructions for payroll setup',
				action: 'Get deposit instructions',
			},
			{
				name: 'Get Routing Number',
				value: 'getRoutingNumber',
				description: 'Get the routing number for direct deposits',
				action: 'Get routing number',
			},
			{
				name: 'Get Account Number',
				value: 'getAccountNumber',
				description: 'Get the account number for direct deposits',
				action: 'Get account number',
			},
		],
		default: 'getInfo',
	},
];

export const directDepositFields: INodeProperties[] = [
	// PRN - Used by all operations
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['directDeposit'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Update settings
	{
		displayName: 'Settings',
		name: 'settings',
		type: 'collection',
		placeholder: 'Add Setting',
		displayOptions: {
			show: {
				resource: ['directDeposit'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Enable Direct Deposit',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether direct deposits are enabled for this account',
			},
			{
				displayName: 'Allocation Type',
				name: 'allocationType',
				type: 'options',
				options: [
					{ name: 'Full Amount', value: 'FULL' },
					{ name: 'Fixed Amount', value: 'FIXED' },
					{ name: 'Percentage', value: 'PERCENT' },
					{ name: 'Remainder', value: 'REMAINDER' },
				],
				default: 'FULL',
				description: 'How to allocate incoming direct deposits',
			},
			{
				displayName: 'Fixed Amount',
				name: 'fixedAmount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Fixed amount to deposit (when using FIXED allocation)',
			},
			{
				displayName: 'Percentage',
				name: 'percentage',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
					maxValue: 100,
				},
				default: 100,
				description: 'Percentage to deposit (when using PERCENT allocation)',
			},
			{
				displayName: 'Priority',
				name: 'priority',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 99,
				},
				default: 1,
				description: 'Priority order for multi-account direct deposits',
			},
		],
	},
	// Format options for instructions
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['directDeposit'],
				operation: ['getInstructions'],
			},
		},
		options: [
			{ name: 'Text', value: 'text' },
			{ name: 'PDF', value: 'pdf' },
			{ name: 'JSON', value: 'json' },
		],
		default: 'text',
		description: 'Format for direct deposit instructions',
	},
];

export async function executeDirectDepositOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;
	const prn = this.getNodeParameter('prn', i) as string;
	validatePrnField.call(this, prn, 'PRN');

	switch (operation) {
		case 'getInfo': {
			response = await client.request(ENDPOINTS.directDeposit.getInfo, {
				accountNo: prn,
			});
			break;
		}

		case 'update': {
			const settings = this.getNodeParameter('settings', i) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
				...settings,
			};

			response = await client.request(ENDPOINTS.directDeposit.update, params);
			break;
		}

		case 'getInstructions': {
			const format = this.getNodeParameter('format', i) as string;

			response = await client.request(ENDPOINTS.directDeposit.getInstructions, {
				accountNo: prn,
				format,
			});
			break;
		}

		case 'getRoutingNumber': {
			response = await client.request(ENDPOINTS.directDeposit.getRoutingNumber, {
				accountNo: prn,
			});
			break;
		}

		case 'getAccountNumber': {
			response = await client.request(ENDPOINTS.directDeposit.getAccountNumber, {
				accountNo: prn,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
