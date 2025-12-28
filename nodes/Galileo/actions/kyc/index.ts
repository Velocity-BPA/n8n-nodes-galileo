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
import { validatePrnField, validateSsn, validateDateFormat } from '../../utils/validationUtils';
import { KYC_STATUS_OPTIONS } from '../../constants/cardStatuses';

export const kycOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['kyc'],
			},
		},
		options: [
			{
				name: 'Submit KYC',
				value: 'submit',
				description: 'Submit KYC information',
				action: 'Submit KYC',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get KYC verification status',
				action: 'Get KYC status',
			},
			{
				name: 'Get Result',
				value: 'getResult',
				description: 'Get KYC verification result',
				action: 'Get KYC result',
			},
			{
				name: 'Upload Document',
				value: 'uploadDocument',
				description: 'Upload KYC document',
				action: 'Upload KYC document',
			},
			{
				name: 'Get Requirements',
				value: 'getRequirements',
				description: 'Get KYC requirements',
				action: 'Get KYC requirements',
			},
			{
				name: 'Retry KYC',
				value: 'retry',
				description: 'Retry failed KYC verification',
				action: 'Retry KYC',
			},
			{
				name: 'Get Identity Verification',
				value: 'getIdentityVerification',
				description: 'Get identity verification details',
				action: 'Get identity verification',
			},
		],
		default: 'submit',
	},
];

export const kycFields: INodeProperties[] = [
	// PRN - Used by all operations
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['kyc'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Personal Information for submit
	{
		displayName: 'Personal Information',
		name: 'personalInfo',
		type: 'collection',
		placeholder: 'Add Field',
		required: true,
		displayOptions: {
			show: {
				resource: ['kyc'],
				operation: ['submit'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				required: true,
				default: '',
				description: 'Legal first name',
			},
			{
				displayName: 'Middle Name',
				name: 'middleName',
				type: 'string',
				default: '',
				description: 'Middle name (if any)',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				required: true,
				default: '',
				description: 'Legal last name',
			},
			{
				displayName: 'Date of Birth',
				name: 'dateOfBirth',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'Date of birth in YYYY-MM-DD format',
			},
			{
				displayName: 'SSN (Last 4)',
				name: 'ssnLast4',
				type: 'string',
				default: '',
				description: 'Last 4 digits of SSN',
			},
			{
				displayName: 'Full SSN',
				name: 'fullSsn',
				type: 'string',
				default: '',
				description: 'Full SSN (9 digits, no dashes)',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number',
			},
		],
	},
	// Address Information for submit
	{
		displayName: 'Address Information',
		name: 'addressInfo',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['kyc'],
				operation: ['submit'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Street Address',
				name: 'streetAddress',
				type: 'string',
				default: '',
				description: 'Street address line 1',
			},
			{
				displayName: 'Street Address 2',
				name: 'streetAddress2',
				type: 'string',
				default: '',
				description: 'Street address line 2 (apt, suite, etc.)',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				description: 'State/Province (2-letter code)',
			},
			{
				displayName: 'ZIP/Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: 'US',
				description: 'Country code (ISO 2-letter)',
			},
		],
	},
	// KYC Options
	{
		displayName: 'KYC Options',
		name: 'kycOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['kyc'],
				operation: ['submit'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Verification Level',
				name: 'verificationLevel',
				type: 'options',
				options: [
					{ name: 'Basic', value: 'BASIC' },
					{ name: 'Standard', value: 'STANDARD' },
					{ name: 'Enhanced', value: 'ENHANCED' },
				],
				default: 'STANDARD',
				description: 'Level of KYC verification to perform',
			},
			{
				displayName: 'ID Type',
				name: 'idType',
				type: 'options',
				options: [
					{ name: 'Driver License', value: 'DRIVERS_LICENSE' },
					{ name: 'State ID', value: 'STATE_ID' },
					{ name: 'Passport', value: 'PASSPORT' },
					{ name: 'Military ID', value: 'MILITARY_ID' },
				],
				default: 'DRIVERS_LICENSE',
				description: 'Type of ID document',
			},
			{
				displayName: 'ID Number',
				name: 'idNumber',
				type: 'string',
				default: '',
				description: 'ID document number',
			},
			{
				displayName: 'ID State',
				name: 'idState',
				type: 'string',
				default: '',
				description: 'State that issued the ID (2-letter code)',
			},
			{
				displayName: 'ID Expiration',
				name: 'idExpiration',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'ID expiration date',
			},
			{
				displayName: 'Consent Given',
				name: 'consentGiven',
				type: 'boolean',
				default: false,
				description: 'Whether the customer has given consent for verification',
			},
			{
				displayName: 'IP Address',
				name: 'ipAddress',
				type: 'string',
				default: '',
				description: "Customer's IP address at time of submission",
			},
		],
	},
	// Document Upload fields
	{
		displayName: 'Document Type',
		name: 'documentType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['kyc'],
				operation: ['uploadDocument'],
			},
		},
		options: [
			{ name: 'ID Front', value: 'ID_FRONT' },
			{ name: 'ID Back', value: 'ID_BACK' },
			{ name: 'Selfie', value: 'SELFIE' },
			{ name: 'Proof of Address', value: 'PROOF_OF_ADDRESS' },
			{ name: 'Passport', value: 'PASSPORT' },
			{ name: 'Utility Bill', value: 'UTILITY_BILL' },
			{ name: 'Bank Statement', value: 'BANK_STATEMENT' },
			{ name: 'Tax Document', value: 'TAX_DOCUMENT' },
			{ name: 'Other', value: 'OTHER' },
		],
		default: 'ID_FRONT',
		description: 'Type of document being uploaded',
	},
	{
		displayName: 'Document Data (Base64)',
		name: 'documentData',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['kyc'],
				operation: ['uploadDocument'],
			},
		},
		default: '',
		description: 'Base64-encoded document image',
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['kyc'],
				operation: ['uploadDocument'],
			},
		},
		default: '',
		placeholder: 'document.jpg',
		description: 'Name of the file being uploaded',
	},
	// Retry options
	{
		displayName: 'Retry Reason',
		name: 'retryReason',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['kyc'],
				operation: ['retry'],
			},
		},
		options: [
			{ name: 'Updated Information', value: 'UPDATED_INFO' },
			{ name: 'New Documents', value: 'NEW_DOCUMENTS' },
			{ name: 'Address Correction', value: 'ADDRESS_CORRECTION' },
			{ name: 'Name Correction', value: 'NAME_CORRECTION' },
			{ name: 'System Error', value: 'SYSTEM_ERROR' },
		],
		default: 'UPDATED_INFO',
		description: 'Reason for retrying KYC',
	},
];

export async function executeKycOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;
	const prn = this.getNodeParameter('prn', i) as string;
	validatePrnField.call(this, prn, 'PRN');

	switch (operation) {
		case 'submit': {
			const personalInfo = this.getNodeParameter('personalInfo', i) as IDataObject;
			const addressInfo = this.getNodeParameter('addressInfo', i) as IDataObject;
			const kycOptions = this.getNodeParameter('kycOptions', i) as IDataObject;

			// Validate required fields
			if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.dateOfBirth) {
				throw new Error('First name, last name, and date of birth are required');
			}

			// Validate SSN if provided
			if (personalInfo.fullSsn && !validateSsn(personalInfo.fullSsn as string)) {
				throw new Error('Invalid SSN format. Must be 9 digits.');
			}

			// Validate date format
			if (!validateDateFormat(personalInfo.dateOfBirth as string)) {
				throw new Error('Invalid date format. Use YYYY-MM-DD.');
			}

			const params: IDataObject = {
				accountNo: prn,
				first_name: personalInfo.firstName,
				last_name: personalInfo.lastName,
				dob: personalInfo.dateOfBirth,
			};

			// Add optional personal info
			if (personalInfo.middleName) params.middle_name = personalInfo.middleName;
			if (personalInfo.ssnLast4) params.ssn_last4 = personalInfo.ssnLast4;
			if (personalInfo.fullSsn) params.ssn = personalInfo.fullSsn;
			if (personalInfo.email) params.email = personalInfo.email;
			if (personalInfo.phone) params.phone = personalInfo.phone;

			// Add address info
			if (addressInfo.streetAddress) params.address1 = addressInfo.streetAddress;
			if (addressInfo.streetAddress2) params.address2 = addressInfo.streetAddress2;
			if (addressInfo.city) params.city = addressInfo.city;
			if (addressInfo.state) params.state = addressInfo.state;
			if (addressInfo.postalCode) params.postal_code = addressInfo.postalCode;
			if (addressInfo.country) params.country = addressInfo.country;

			// Add KYC options
			if (kycOptions.verificationLevel) params.verification_level = kycOptions.verificationLevel;
			if (kycOptions.idType) params.id_type = kycOptions.idType;
			if (kycOptions.idNumber) params.id_number = kycOptions.idNumber;
			if (kycOptions.idState) params.id_state = kycOptions.idState;
			if (kycOptions.idExpiration) params.id_expiration = kycOptions.idExpiration;
			if (kycOptions.consentGiven !== undefined) params.consent = kycOptions.consentGiven;
			if (kycOptions.ipAddress) params.ip_address = kycOptions.ipAddress;

			response = await client.request(ENDPOINTS.kyc.submit, params);
			break;
		}

		case 'getStatus': {
			response = await client.request(ENDPOINTS.kyc.getStatus, {
				accountNo: prn,
			});
			break;
		}

		case 'getResult': {
			response = await client.request(ENDPOINTS.kyc.getResult, {
				accountNo: prn,
			});
			break;
		}

		case 'uploadDocument': {
			const documentType = this.getNodeParameter('documentType', i) as string;
			const documentData = this.getNodeParameter('documentData', i) as string;
			const fileName = this.getNodeParameter('fileName', i) as string;

			response = await client.request(ENDPOINTS.kyc.uploadDocument, {
				accountNo: prn,
				doc_type: documentType,
				doc_data: documentData,
				file_name: fileName,
			});
			break;
		}

		case 'getRequirements': {
			response = await client.request(ENDPOINTS.kyc.getRequirements, {
				accountNo: prn,
			});
			break;
		}

		case 'retry': {
			const retryReason = this.getNodeParameter('retryReason', i) as string;

			response = await client.request(ENDPOINTS.kyc.retry, {
				accountNo: prn,
				reason: retryReason,
			});
			break;
		}

		case 'getIdentityVerification': {
			response = await client.request(ENDPOINTS.kyc.getIdentityVerification, {
				accountNo: prn,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
