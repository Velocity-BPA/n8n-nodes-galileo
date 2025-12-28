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
import { DISPUTE_STATUS_OPTIONS } from '../../constants/cardStatuses';

export const disputeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a dispute',
				action: 'Create a dispute',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get dispute details',
				action: 'Get a dispute',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get dispute status',
				action: 'Get dispute status',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a dispute',
				action: 'Update a dispute',
			},
			{
				name: 'Get By Account',
				value: 'getByAccount',
				description: 'Get disputes by account',
				action: 'Get disputes by account',
			},
			{
				name: 'Get By Card',
				value: 'getByCard',
				description: 'Get disputes by card',
				action: 'Get disputes by card',
			},
			{
				name: 'Upload Document',
				value: 'uploadDocument',
				description: 'Upload a dispute document',
				action: 'Upload dispute document',
			},
			{
				name: 'Get Deadline',
				value: 'getDeadline',
				description: 'Get dispute deadline',
				action: 'Get dispute deadline',
			},
		],
		default: 'create',
	},
];

export const disputeFields: INodeProperties[] = [
	// PRN
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['create', 'getByAccount'],
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
				resource: ['dispute'],
				operation: ['getByCard'],
			},
		},
		default: '',
		description: 'Card Program Routing Number',
	},
	// Dispute ID
	{
		displayName: 'Dispute ID',
		name: 'disputeId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['get', 'getStatus', 'update', 'uploadDocument', 'getDeadline'],
			},
		},
		default: '',
		description: 'The unique identifier for the dispute',
	},
	// Transaction ID for creating dispute
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The transaction ID being disputed',
	},
	// Dispute Reason
	{
		displayName: 'Dispute Reason',
		name: 'disputeReason',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Unauthorized Transaction', value: 'UNAUTHORIZED' },
			{ name: 'Duplicate Charge', value: 'DUPLICATE' },
			{ name: 'Incorrect Amount', value: 'INCORRECT_AMOUNT' },
			{ name: 'Merchandise Not Received', value: 'NOT_RECEIVED' },
			{ name: 'Merchandise Not as Described', value: 'NOT_AS_DESCRIBED' },
			{ name: 'Credit Not Processed', value: 'CREDIT_NOT_PROCESSED' },
			{ name: 'Canceled Transaction', value: 'CANCELED' },
			{ name: 'Quality Issue', value: 'QUALITY' },
			{ name: 'Fraud', value: 'FRAUD' },
			{ name: 'ATM Dispute', value: 'ATM' },
			{ name: 'Other', value: 'OTHER' },
		],
		default: 'UNAUTHORIZED',
		description: 'Reason for the dispute',
	},
	// Dispute Details
	{
		displayName: 'Dispute Details',
		name: 'disputeDetails',
		type: 'collection',
		placeholder: 'Add Detail',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Detailed description of the dispute',
			},
			{
				displayName: 'Disputed Amount',
				name: 'disputedAmount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0.01,
				},
				default: 0,
				description: 'Amount being disputed (if different from transaction amount)',
			},
			{
				displayName: 'Contact Name',
				name: 'contactName',
				type: 'string',
				default: '',
				description: 'Contact name for dispute communication',
			},
			{
				displayName: 'Contact Phone',
				name: 'contactPhone',
				type: 'string',
				default: '',
				description: 'Contact phone number',
			},
			{
				displayName: 'Contact Email',
				name: 'contactEmail',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Contact email address',
			},
			{
				displayName: 'Merchant Contacted',
				name: 'merchantContacted',
				type: 'boolean',
				default: false,
				description: 'Whether the cardholder has contacted the merchant',
			},
			{
				displayName: 'Merchant Response',
				name: 'merchantResponse',
				type: 'string',
				default: '',
				description: "Merchant's response if contacted",
			},
			{
				displayName: 'Card Lost or Stolen',
				name: 'cardLostStolen',
				type: 'boolean',
				default: false,
				description: 'Whether the card was lost or stolen',
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
	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: DISPUTE_STATUS_OPTIONS,
				default: 'IN_REVIEW',
				description: 'New status for the dispute',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				description: 'Additional notes',
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{ name: 'Pending', value: 'PENDING' },
					{ name: 'Customer Favor', value: 'CUSTOMER_FAVOR' },
					{ name: 'Merchant Favor', value: 'MERCHANT_FAVOR' },
					{ name: 'Partial Credit', value: 'PARTIAL_CREDIT' },
					{ name: 'Withdrawn', value: 'WITHDRAWN' },
				],
				default: 'PENDING',
				description: 'Resolution outcome',
			},
			{
				displayName: 'Credit Amount',
				name: 'creditAmount',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Credit amount if resolved in customer favor',
			},
		],
	},
	// Document upload
	{
		displayName: 'Document Type',
		name: 'documentType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['uploadDocument'],
			},
		},
		options: [
			{ name: 'Receipt', value: 'RECEIPT' },
			{ name: 'Statement', value: 'STATEMENT' },
			{ name: 'Correspondence', value: 'CORRESPONDENCE' },
			{ name: 'Police Report', value: 'POLICE_REPORT' },
			{ name: 'ID Document', value: 'ID' },
			{ name: 'Other', value: 'OTHER' },
		],
		default: 'OTHER',
		description: 'Type of document being uploaded',
	},
	{
		displayName: 'Document (Base64)',
		name: 'documentData',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['uploadDocument'],
			},
		},
		default: '',
		description: 'Base64-encoded document data',
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['uploadDocument'],
			},
		},
		default: '',
		placeholder: 'document.pdf',
		description: 'Name of the file being uploaded',
	},
	// Date filters
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['getByAccount', 'getByCard'],
			},
		},
		default: '',
		description: 'Start date for dispute history',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['dispute'],
				operation: ['getByAccount', 'getByCard'],
			},
		},
		default: '',
		description: 'End date for dispute history',
	},
];

export async function executeDisputeOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;

	switch (operation) {
		case 'create': {
			const prn = this.getNodeParameter('prn', i) as string;
			const transactionId = this.getNodeParameter('transactionId', i) as string;
			const disputeReason = this.getNodeParameter('disputeReason', i) as string;
			const disputeDetails = this.getNodeParameter('disputeDetails', i) as IDataObject;

			validatePrnField.call(this, prn, 'PRN');

			const params: IDataObject = {
				accountNo: prn,
				trans_id: transactionId,
				reason: disputeReason,
				...disputeDetails,
			};

			response = await client.request(ENDPOINTS.dispute.create, params);
			break;
		}

		case 'get': {
			const disputeId = this.getNodeParameter('disputeId', i) as string;

			response = await client.request(ENDPOINTS.dispute.get, {
				dispute_id: disputeId,
			});
			break;
		}

		case 'getStatus': {
			const disputeId = this.getNodeParameter('disputeId', i) as string;

			response = await client.request(ENDPOINTS.dispute.getStatus, {
				dispute_id: disputeId,
			});
			break;
		}

		case 'update': {
			const disputeId = this.getNodeParameter('disputeId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const params: IDataObject = {
				dispute_id: disputeId,
				...updateFields,
			};

			response = await client.request(ENDPOINTS.dispute.update, params);
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

			response = await client.request(ENDPOINTS.dispute.getByAccount, params);
			break;
		}

		case 'getByCard': {
			const cardPrn = this.getNodeParameter('cardPrn', i) as string;
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;

			validatePrnField.call(this, cardPrn, 'Card PRN');

			const params: IDataObject = {
				cardNo: cardPrn,
			};

			if (startDate) params.startDate = startDate;
			if (endDate) params.endDate = endDate;

			response = await client.request(ENDPOINTS.dispute.getByCard, params);
			break;
		}

		case 'uploadDocument': {
			const disputeId = this.getNodeParameter('disputeId', i) as string;
			const documentType = this.getNodeParameter('documentType', i) as string;
			const documentData = this.getNodeParameter('documentData', i) as string;
			const fileName = this.getNodeParameter('fileName', i) as string;

			const params: IDataObject = {
				dispute_id: disputeId,
				doc_type: documentType,
				doc_data: documentData,
				file_name: fileName,
			};

			response = await client.request(ENDPOINTS.dispute.uploadDocument, params);
			break;
		}

		case 'getDeadline': {
			const disputeId = this.getNodeParameter('disputeId', i) as string;

			response = await client.request(ENDPOINTS.dispute.getDeadline, {
				dispute_id: disputeId,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
