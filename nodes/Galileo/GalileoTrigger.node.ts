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

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

import { EVENT_TYPES, EVENT_CATEGORIES } from './constants/eventTypes';
import { verifyWebhookRequest, parseWebhookPayload, webhookEventToExecutionData } from './transport/webhookHandler';

/**
 * Log licensing notice once per node load
 */
let licensingNoticeLogged = false;
function logLicensingNotice(): void {
	if (!licensingNoticeLogged) {
		console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
		licensingNoticeLogged = true;
	}
}

// Build event type options from constants, grouped by category
const eventTypeOptions = Object.entries(EVENT_CATEGORIES).flatMap(([category, eventTypes]) => {
	return (eventTypes as string[]).map((eventType) => {
		const eventKey = Object.keys(EVENT_TYPES).find(
			(key) => EVENT_TYPES[key as keyof typeof EVENT_TYPES] === eventType
		);
		return {
			name: eventKey ? eventKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : eventType,
			value: eventType,
			description: `${category} event`,
		};
	});
});

export class GalileoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Galileo Trigger',
		name: 'galileoTrigger',
		icon: 'file:galileo.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].length}} event(s)',
		description: 'Starts workflow when Galileo events occur',
		defaults: {
			name: 'Galileo Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'galileoApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: [
					// Account Events
					{
						name: '--- Account Events ---',
						value: '__account_header__',
						description: 'Account-related events',
					},
					{
						name: 'Account Created',
						value: 'account.created',
					},
					{
						name: 'Account Updated',
						value: 'account.updated',
					},
					{
						name: 'Account Frozen',
						value: 'account.frozen',
					},
					{
						name: 'Account Unfrozen',
						value: 'account.unfrozen',
					},
					{
						name: 'Account Closed',
						value: 'account.closed',
					},
					{
						name: 'Balance Changed',
						value: 'account.balance_changed',
					},
					{
						name: 'Limit Changed',
						value: 'account.limit_changed',
					},
					// Card Events
					{
						name: '--- Card Events ---',
						value: '__card_header__',
						description: 'Card-related events',
					},
					{
						name: 'Card Created',
						value: 'card.created',
					},
					{
						name: 'Card Activated',
						value: 'card.activated',
					},
					{
						name: 'Card Frozen',
						value: 'card.frozen',
					},
					{
						name: 'Card Unfrozen',
						value: 'card.unfrozen',
					},
					{
						name: 'Card Replaced',
						value: 'card.replaced',
					},
					{
						name: 'Card Closed',
						value: 'card.closed',
					},
					{
						name: 'PIN Changed',
						value: 'card.pin_changed',
					},
					{
						name: 'Card Shipped',
						value: 'card.shipped',
					},
					// Transaction Events
					{
						name: '--- Transaction Events ---',
						value: '__transaction_header__',
						description: 'Transaction-related events',
					},
					{
						name: 'Authorization Created',
						value: 'authorization.created',
					},
					{
						name: 'Authorization Declined',
						value: 'authorization.declined',
					},
					{
						name: 'Transaction Posted',
						value: 'transaction.posted',
					},
					{
						name: 'Transaction Reversed',
						value: 'transaction.reversed',
					},
					{
						name: 'Transaction Adjusted',
						value: 'transaction.adjusted',
					},
					{
						name: 'Large Transaction Alert',
						value: 'transaction.large_amount',
					},
					// Payment Events
					{
						name: '--- Payment Events ---',
						value: '__payment_header__',
						description: 'Payment-related events',
					},
					{
						name: 'ACH Initiated',
						value: 'ach.initiated',
					},
					{
						name: 'ACH Completed',
						value: 'ach.completed',
					},
					{
						name: 'ACH Returned',
						value: 'ach.returned',
					},
					{
						name: 'Load Completed',
						value: 'load.completed',
					},
					{
						name: 'Withdrawal Completed',
						value: 'withdrawal.completed',
					},
					{
						name: 'Transfer Completed',
						value: 'transfer.completed',
					},
					// Fraud Events
					{
						name: '--- Fraud Events ---',
						value: '__fraud_header__',
						description: 'Fraud-related events',
					},
					{
						name: 'Fraud Alert',
						value: 'fraud.alert',
					},
					{
						name: 'Velocity Exceeded',
						value: 'fraud.velocity_exceeded',
					},
					{
						name: 'Suspicious Activity',
						value: 'fraud.suspicious_activity',
					},
					{
						name: 'Card Blocked',
						value: 'fraud.card_blocked',
					},
					// Dispute Events
					{
						name: '--- Dispute Events ---',
						value: '__dispute_header__',
						description: 'Dispute-related events',
					},
					{
						name: 'Dispute Created',
						value: 'dispute.created',
					},
					{
						name: 'Dispute Updated',
						value: 'dispute.updated',
					},
					{
						name: 'Dispute Resolved',
						value: 'dispute.resolved',
					},
					{
						name: 'Chargeback Received',
						value: 'dispute.chargeback',
					},
					// Digital Wallet Events
					{
						name: '--- Digital Wallet Events ---',
						value: '__wallet_header__',
						description: 'Digital wallet events',
					},
					{
						name: 'Wallet Provisioned',
						value: 'wallet.provisioned',
					},
					{
						name: 'Wallet Activated',
						value: 'wallet.activated',
					},
					{
						name: 'Wallet Deactivated',
						value: 'wallet.deactivated',
					},
					// KYC Events
					{
						name: '--- KYC Events ---',
						value: '__kyc_header__',
						description: 'KYC-related events',
					},
					{
						name: 'KYC Submitted',
						value: 'kyc.submitted',
					},
					{
						name: 'KYC Approved',
						value: 'kyc.approved',
					},
					{
						name: 'KYC Rejected',
						value: 'kyc.rejected',
					},
					{
						name: 'Document Required',
						value: 'kyc.document_required',
					},
				],
				description: 'Events to trigger on',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Verify Signature',
						name: 'verifySignature',
						type: 'boolean',
						default: true,
						description: 'Whether to verify webhook signature',
					},
					{
						displayName: 'Include Raw Body',
						name: 'includeRawBody',
						type: 'boolean',
						default: false,
						description: 'Whether to include the raw webhook body in output',
					},
					{
						displayName: 'Filter by Account',
						name: 'filterByAccount',
						type: 'string',
						default: '',
						description: 'Only trigger for specific account PRN (leave empty for all)',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Log licensing notice
				logLicensingNotice();

				const webhookUrl = this.getNodeWebhookUrl('default');
				const webhookData = this.getWorkflowStaticData('node');

				// Check if we have a stored webhook ID
				if (webhookData.webhookId) {
					// In production, verify the webhook still exists in Galileo
					// For now, return true if we have a stored ID
					return true;
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				// Log licensing notice
				logLicensingNotice();

				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				// Filter out header options
				const filteredEvents = events.filter(e => !e.startsWith('__'));

				if (filteredEvents.length === 0) {
					throw new Error('Please select at least one event to subscribe to');
				}

				// In production, call Galileo API to create webhook
				// For now, store the configuration
				webhookData.webhookId = `n8n_${Date.now()}`;
				webhookData.webhookUrl = webhookUrl;
				webhookData.events = filteredEvents;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				// In production, call Galileo API to delete webhook
				// For now, clear the stored data
				delete webhookData.webhookId;
				delete webhookData.webhookUrl;
				delete webhookData.events;

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// Log licensing notice
		logLicensingNotice();

		const req = this.getRequestObject();
		const options = this.getNodeParameter('options', {}) as IDataObject;
		const events = this.getNodeParameter('events') as string[];

		// Filter out header options
		const subscribedEvents = events.filter(e => !e.startsWith('__'));

		// Verify webhook signature if enabled
		if (options.verifySignature !== false) {
			try {
				const credentials = await this.getCredentials('galileoApi');
				const webhookSecret = credentials.webhookSecret as string;

				if (webhookSecret) {
					const isValid = verifyWebhookRequest(req, webhookSecret);
					if (!isValid) {
						return {
							webhookResponse: { status: 'error', message: 'Invalid signature' },
						};
					}
				}
			} catch (error) {
				// Continue without verification if credentials not available
			}
		}

		// Parse the webhook payload
		const payload = parseWebhookPayload(req);

		if (!payload) {
			return {
				webhookResponse: { status: 'error', message: 'Invalid payload' },
			};
		}

		// Check if this event type is subscribed
		const eventType = payload.eventType as string;
		if (!subscribedEvents.includes(eventType)) {
			// Event not subscribed, acknowledge but don't trigger
			return {
				webhookResponse: { status: 'ignored', message: 'Event type not subscribed' },
			};
		}

		// Filter by account if specified
		if (options.filterByAccount) {
			const accountPrn = payload.data?.accountNo || payload.data?.prn;
			if (accountPrn !== options.filterByAccount) {
				return {
					webhookResponse: { status: 'ignored', message: 'Account filter not matched' },
				};
			}
		}

		// Build output data
		const outputData = webhookEventToExecutionData(payload);

		// Include raw body if requested
		if (options.includeRawBody) {
			outputData.rawBody = req.body;
		}

		return {
			webhookResponse: { status: 'ok' },
			workflowData: [
				this.helpers.returnJsonArray([outputData]),
			],
		};
	}
}
