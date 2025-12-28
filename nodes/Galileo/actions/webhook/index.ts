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
import { EVENT_TYPES } from '../../constants/eventTypes';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new webhook',
				action: 'Create webhook',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get webhook details',
				action: 'Get webhook',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a webhook',
				action: 'Update webhook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook',
				action: 'Delete webhook',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List all webhooks',
				action: 'List webhooks',
			},
			{
				name: 'Test',
				value: 'test',
				description: 'Send a test event to a webhook',
				action: 'Test webhook',
			},
			{
				name: 'Get Events',
				value: 'getEvents',
				description: 'Get webhook event history',
				action: 'Get webhook events',
			},
			{
				name: 'Retry',
				value: 'retry',
				description: 'Retry a failed webhook event',
				action: 'Retry webhook event',
			},
		],
		default: 'create',
	},
];

// Build event type options from constants
const eventTypeOptions = Object.entries(EVENT_TYPES).map(([key, value]) => ({
	name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
	value: value as string,
}));

export const webhookFields: INodeProperties[] = [
	// Webhook ID (required for get, update, delete, test, getEvents)
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		description: 'The webhook identifier',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['get', 'update', 'delete', 'test', 'getEvents'],
			},
		},
	},
	// Event ID (required for retry)
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		required: true,
		default: '',
		description: 'The event identifier to retry',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['retry'],
			},
		},
	},
	// Create webhook fields
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://your-server.com/webhook',
		description: 'The URL to receive webhook events',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Event Types',
		name: 'eventTypes',
		type: 'multiOptions',
		required: true,
		options: eventTypeOptions,
		default: [],
		description: 'The event types to subscribe to',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'Description of the webhook',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
	},
	// Update webhook fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'New URL for the webhook',
			},
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				options: eventTypeOptions,
				default: [],
				description: 'New event types to subscribe to',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook is active',
			},
		],
	},
	// Additional options for create
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Secret',
				name: 'secret',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Secret for webhook signature verification (auto-generated if not provided)',
			},
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the webhook should be active immediately',
			},
			{
				displayName: 'Retry Count',
				name: 'retryCount',
				type: 'number',
				default: 3,
				description: 'Number of retry attempts for failed deliveries',
			},
			{
				displayName: 'Timeout Seconds',
				name: 'timeoutSeconds',
				type: 'number',
				default: 30,
				description: 'Timeout for webhook delivery in seconds',
			},
		],
	},
	// Test event type
	{
		displayName: 'Test Event Type',
		name: 'testEventType',
		type: 'options',
		options: eventTypeOptions,
		default: 'account.created',
		description: 'The type of test event to send',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['test'],
			},
		},
	},
	// Get Events filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getEvents'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Retrying', value: 'retrying' },
				],
				default: '',
				description: 'Filter by delivery status',
			},
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				options: [{ name: 'All', value: '' }, ...eventTypeOptions],
				default: '',
				description: 'Filter by event type',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'Filter events after this date',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'Filter events before this date',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 100,
				description: 'Maximum number of events to return',
			},
		],
	},
	// List filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Active Only',
				name: 'activeOnly',
				type: 'boolean',
				default: false,
				description: 'Whether to only return active webhooks',
			},
		],
	},
];

export async function executeWebhook(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject> {
	const operation = this.getNodeParameter('operation', index) as string;
	const client = await createGalileoClient.call(this);

	switch (operation) {
		case 'create': {
			const url = this.getNodeParameter('url', index) as string;
			const eventTypes = this.getNodeParameter('eventTypes', index) as string[];
			const description = this.getNodeParameter('description', index, '') as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const params: IDataObject = {
				url,
				eventTypes: eventTypes.join(','),
			};

			if (description) {
				params.description = description;
			}
			if (additionalOptions.secret) {
				params.secret = additionalOptions.secret;
			}
			if (additionalOptions.active !== undefined) {
				params.active = additionalOptions.active ? '1' : '0';
			}
			if (additionalOptions.retryCount) {
				params.retryCount = additionalOptions.retryCount;
			}
			if (additionalOptions.timeoutSeconds) {
				params.timeoutSeconds = additionalOptions.timeoutSeconds;
			}

			return client.request(ENDPOINTS.webhook.create, params);
		}

		case 'get': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;

			return client.request(ENDPOINTS.webhook.get, {
				webhookId,
			});
		}

		case 'update': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

			const params: IDataObject = {
				webhookId,
			};

			if (updateFields.url) {
				params.url = updateFields.url;
			}
			if (updateFields.eventTypes && (updateFields.eventTypes as string[]).length > 0) {
				params.eventTypes = (updateFields.eventTypes as string[]).join(',');
			}
			if (updateFields.description) {
				params.description = updateFields.description;
			}
			if (updateFields.active !== undefined) {
				params.active = updateFields.active ? '1' : '0';
			}

			return client.request(ENDPOINTS.webhook.update, params);
		}

		case 'delete': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;

			return client.request(ENDPOINTS.webhook.delete, {
				webhookId,
			});
		}

		case 'list': {
			const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
			const params: IDataObject = {};

			if (filters.activeOnly) {
				params.activeOnly = '1';
			}

			return client.request(ENDPOINTS.webhook.list, params);
		}

		case 'test': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			const testEventType = this.getNodeParameter('testEventType', index) as string;

			return client.request(ENDPOINTS.webhook.test, {
				webhookId,
				eventType: testEventType,
			});
		}

		case 'getEvents': {
			const webhookId = this.getNodeParameter('webhookId', index) as string;
			const filters = this.getNodeParameter('filters', index, {}) as IDataObject;

			const params: IDataObject = {
				webhookId,
			};

			if (filters.status) {
				params.status = filters.status;
			}
			if (filters.eventType) {
				params.eventType = filters.eventType;
			}
			if (filters.startDate) {
				params.startDate = (filters.startDate as string).split('T')[0];
			}
			if (filters.endDate) {
				params.endDate = (filters.endDate as string).split('T')[0];
			}
			if (filters.limit) {
				params.recordCnt = filters.limit;
			}

			return client.request(ENDPOINTS.webhook.getEvents, params);
		}

		case 'retry': {
			const eventId = this.getNodeParameter('eventId', index) as string;

			return client.request(ENDPOINTS.webhook.retry, {
				eventId,
			});
		}

		default:
			throw new Error(`Operation ${operation} is not supported for webhook resource`);
	}
}
