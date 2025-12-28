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
import { MCC_CATEGORIES } from '../../constants/mccCodes';

export const fraudOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['fraud'],
			},
		},
		options: [
			{
				name: 'Get Fraud Score',
				value: 'getFraudScore',
				description: 'Get fraud risk score for a transaction',
				action: 'Get fraud score',
			},
			{
				name: 'Report Fraud',
				value: 'reportFraud',
				description: 'Report a fraudulent transaction',
				action: 'Report fraud',
			},
			{
				name: 'Get Alerts',
				value: 'getAlerts',
				description: 'Get fraud alerts for an account',
				action: 'Get fraud alerts',
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				description: 'Update fraud alert status',
				action: 'Update fraud status',
			},
			{
				name: 'Get Rules',
				value: 'getRules',
				description: 'Get fraud prevention rules',
				action: 'Get fraud rules',
			},
			{
				name: 'Block Transaction Type',
				value: 'blockTransactionType',
				description: 'Block a transaction type',
				action: 'Block transaction type',
			},
			{
				name: 'Unblock Transaction Type',
				value: 'unblockTransactionType',
				description: 'Unblock a transaction type',
				action: 'Unblock transaction type',
			},
			{
				name: 'Get Velocity Limits',
				value: 'getVelocityLimits',
				description: 'Get velocity limits for fraud prevention',
				action: 'Get velocity limits',
			},
		],
		default: 'getFraudScore',
	},
];

export const fraudFields: INodeProperties[] = [
	// PRN
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['getAlerts', 'getRules', 'blockTransactionType', 'unblockTransactionType', 'getVelocityLimits'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Transaction ID
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['getFraudScore', 'reportFraud'],
			},
		},
		default: '',
		description: 'The transaction identifier',
	},
	// Alert ID
	{
		displayName: 'Alert ID',
		name: 'alertId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['updateStatus'],
			},
		},
		default: '',
		description: 'The fraud alert identifier',
	},
	// Fraud Report Details
	{
		displayName: 'Report Details',
		name: 'reportDetails',
		type: 'collection',
		placeholder: 'Add Detail',
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['reportFraud'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Fraud Type',
				name: 'fraudType',
				type: 'options',
				options: [
					{ name: 'Unauthorized Transaction', value: 'UNAUTHORIZED' },
					{ name: 'Card Not Present Fraud', value: 'CNP_FRAUD' },
					{ name: 'Card Present Fraud', value: 'CP_FRAUD' },
					{ name: 'Lost Card', value: 'LOST_CARD' },
					{ name: 'Stolen Card', value: 'STOLEN_CARD' },
					{ name: 'Counterfeit Card', value: 'COUNTERFEIT' },
					{ name: 'Account Takeover', value: 'ACCOUNT_TAKEOVER' },
					{ name: 'Identity Theft', value: 'IDENTITY_THEFT' },
					{ name: 'Phishing', value: 'PHISHING' },
					{ name: 'Other', value: 'OTHER' },
				],
				default: 'UNAUTHORIZED',
				description: 'Type of fraud being reported',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Detailed description of the fraud',
			},
			{
				displayName: 'Card Compromised',
				name: 'cardCompromised',
				type: 'boolean',
				default: false,
				description: 'Whether the card is believed to be compromised',
			},
			{
				displayName: 'Block Card',
				name: 'blockCard',
				type: 'boolean',
				default: true,
				description: 'Whether to block the card immediately',
			},
			{
				displayName: 'Contact Method',
				name: 'contactMethod',
				type: 'options',
				options: [
					{ name: 'Phone', value: 'PHONE' },
					{ name: 'Email', value: 'EMAIL' },
					{ name: 'Chat', value: 'CHAT' },
					{ name: 'In-App', value: 'IN_APP' },
				],
				default: 'PHONE',
				description: 'How the customer reported the fraud',
			},
			{
				displayName: 'Police Report Filed',
				name: 'policeReportFiled',
				type: 'boolean',
				default: false,
				description: 'Whether a police report has been filed',
			},
			{
				displayName: 'Police Report Number',
				name: 'policeReportNumber',
				type: 'string',
				default: '',
				description: 'Police report number if filed',
			},
		],
	},
	// Status Update
	{
		displayName: 'New Status',
		name: 'newStatus',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['updateStatus'],
			},
		},
		options: [
			{ name: 'New', value: 'NEW' },
			{ name: 'Under Investigation', value: 'INVESTIGATING' },
			{ name: 'Confirmed Fraud', value: 'CONFIRMED' },
			{ name: 'False Positive', value: 'FALSE_POSITIVE' },
			{ name: 'Resolved', value: 'RESOLVED' },
			{ name: 'Closed', value: 'CLOSED' },
		],
		default: 'INVESTIGATING',
		description: 'New status for the fraud alert',
	},
	{
		displayName: 'Status Notes',
		name: 'statusNotes',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['updateStatus'],
			},
		},
		default: '',
		description: 'Notes about the status change',
	},
	// Transaction Type for blocking
	{
		displayName: 'Transaction Type',
		name: 'transactionType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['blockTransactionType', 'unblockTransactionType'],
			},
		},
		options: [
			{ name: 'International', value: 'INTERNATIONAL' },
			{ name: 'Online/E-commerce', value: 'ECOMMERCE' },
			{ name: 'ATM', value: 'ATM' },
			{ name: 'POS (Point of Sale)', value: 'POS' },
			{ name: 'Cash Advance', value: 'CASH_ADVANCE' },
			{ name: 'Gambling', value: 'GAMBLING' },
			{ name: 'Adult Entertainment', value: 'ADULT' },
			{ name: 'Cryptocurrency', value: 'CRYPTO' },
			{ name: 'Wire Transfers', value: 'WIRE' },
			{ name: 'Money Orders', value: 'MONEY_ORDER' },
		],
		default: 'INTERNATIONAL',
		description: 'Type of transaction to block/unblock',
	},
	// MCC Category for blocking
	{
		displayName: 'Block by MCC Category',
		name: 'mccCategory',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['blockTransactionType'],
			},
		},
		options: [
			{ name: 'None (Use Transaction Type)', value: '' },
			{ name: 'Gambling', value: 'GAMBLING' },
			{ name: 'Adult Entertainment', value: 'ADULT' },
			{ name: 'Cryptocurrency', value: 'CRYPTO' },
			{ name: 'High Risk Merchants', value: 'HIGH_RISK' },
			{ name: 'Travel', value: 'TRAVEL' },
		],
		default: '',
		description: 'Optionally block by MCC category instead',
	},
	// Date filters for alerts
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['getAlerts'],
			},
		},
		default: '',
		description: 'Start date for alert history',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['getAlerts'],
			},
		},
		default: '',
		description: 'End date for alert history',
	},
	// Alert Status Filter
	{
		displayName: 'Status Filter',
		name: 'statusFilter',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['fraud'],
				operation: ['getAlerts'],
			},
		},
		options: [
			{ name: 'All', value: '' },
			{ name: 'New', value: 'NEW' },
			{ name: 'Under Investigation', value: 'INVESTIGATING' },
			{ name: 'Confirmed', value: 'CONFIRMED' },
			{ name: 'Resolved', value: 'RESOLVED' },
		],
		default: '',
		description: 'Filter alerts by status',
	},
];

export async function executeFraudOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;

	switch (operation) {
		case 'getFraudScore': {
			const transactionId = this.getNodeParameter('transactionId', i) as string;

			response = await client.request(ENDPOINTS.fraud.getScore, {
				trans_id: transactionId,
			});
			break;
		}

		case 'reportFraud': {
			const transactionId = this.getNodeParameter('transactionId', i) as string;
			const reportDetails = this.getNodeParameter('reportDetails', i) as IDataObject;

			const params: IDataObject = {
				trans_id: transactionId,
				...reportDetails,
			};

			response = await client.request(ENDPOINTS.fraud.report, params);
			break;
		}

		case 'getAlerts': {
			const prn = this.getNodeParameter('prn', i) as string;
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;
			const statusFilter = this.getNodeParameter('statusFilter', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
			};

			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;
			if (statusFilter) params.status = statusFilter;

			response = await client.request(ENDPOINTS.fraud.getAlerts, params);
			break;
		}

		case 'updateStatus': {
			const alertId = this.getNodeParameter('alertId', i) as string;
			const newStatus = this.getNodeParameter('newStatus', i) as string;
			const statusNotes = this.getNodeParameter('statusNotes', i) as string;

			const params: IDataObject = {
				alert_id: alertId,
				status: newStatus,
			};

			if (statusNotes) params.notes = statusNotes;

			response = await client.request(ENDPOINTS.fraud.updateStatus, params);
			break;
		}

		case 'getRules': {
			const prn = this.getNodeParameter('prn', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			response = await client.request(ENDPOINTS.fraud.getRules, {
				accountNo: prn,
			});
			break;
		}

		case 'blockTransactionType': {
			const prn = this.getNodeParameter('prn', i) as string;
			const transactionType = this.getNodeParameter('transactionType', i) as string;
			const mccCategory = this.getNodeParameter('mccCategory', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
				trans_type: transactionType,
			};

			if (mccCategory) {
				params.mcc_category = mccCategory;
			}

			response = await client.request(ENDPOINTS.fraud.blockTransactionType, params);
			break;
		}

		case 'unblockTransactionType': {
			const prn = this.getNodeParameter('prn', i) as string;
			const transactionType = this.getNodeParameter('transactionType', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
				trans_type: transactionType,
			};

			response = await client.request(ENDPOINTS.fraud.unblockTransactionType, params);
			break;
		}

		case 'getVelocityLimits': {
			const prn = this.getNodeParameter('prn', i) as string;

			validatePrnField.call(this, prn, 'PRN');

			response = await client.request(ENDPOINTS.fraud.getVelocityLimits, {
				accountNo: prn,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
