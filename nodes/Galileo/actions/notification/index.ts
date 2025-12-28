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

export const notificationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['notification'],
			},
		},
		options: [
			{
				name: 'Get Settings',
				value: 'getSettings',
				description: 'Get notification settings',
				action: 'Get notification settings',
			},
			{
				name: 'Update Settings',
				value: 'updateSettings',
				description: 'Update notification settings',
				action: 'Update notification settings',
			},
			{
				name: 'Get Notifications',
				value: 'getNotifications',
				description: 'Get notifications for an account',
				action: 'Get notifications',
			},
			{
				name: 'Mark Read',
				value: 'markRead',
				description: 'Mark notification as read',
				action: 'Mark notification read',
			},
			{
				name: 'Get Channels',
				value: 'getChannels',
				description: 'Get available notification channels',
				action: 'Get notification channels',
			},
			{
				name: 'Subscribe',
				value: 'subscribe',
				description: 'Subscribe to notifications',
				action: 'Subscribe to notifications',
			},
			{
				name: 'Unsubscribe',
				value: 'unsubscribe',
				description: 'Unsubscribe from notifications',
				action: 'Unsubscribe from notifications',
			},
		],
		default: 'getSettings',
	},
];

export const notificationFields: INodeProperties[] = [
	// PRN - Used by all operations
	{
		displayName: 'PRN',
		name: 'prn',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['notification'],
			},
		},
		default: '',
		description: 'Program Routing Number - the unique account identifier',
	},
	// Notification ID
	{
		displayName: 'Notification ID',
		name: 'notificationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['markRead'],
			},
		},
		default: '',
		description: 'The unique identifier for the notification',
	},
	// Notification Settings
	{
		displayName: 'Settings',
		name: 'settings',
		type: 'collection',
		placeholder: 'Add Setting',
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['updateSettings'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Email Enabled',
				name: 'emailEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether email notifications are enabled',
			},
			{
				displayName: 'SMS Enabled',
				name: 'smsEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether SMS notifications are enabled',
			},
			{
				displayName: 'Push Enabled',
				name: 'pushEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether push notifications are enabled',
			},
			{
				displayName: 'Transaction Alerts',
				name: 'transactionAlerts',
				type: 'boolean',
				default: true,
				description: 'Whether to receive transaction alerts',
			},
			{
				displayName: 'Transaction Alert Threshold',
				name: 'transactionAlertThreshold',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 0,
				description: 'Minimum amount to trigger transaction alerts (0 for all)',
			},
			{
				displayName: 'Balance Alerts',
				name: 'balanceAlerts',
				type: 'boolean',
				default: true,
				description: 'Whether to receive low balance alerts',
			},
			{
				displayName: 'Low Balance Threshold',
				name: 'lowBalanceThreshold',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
					minValue: 0,
				},
				default: 100,
				description: 'Balance threshold for low balance alerts',
			},
			{
				displayName: 'Security Alerts',
				name: 'securityAlerts',
				type: 'boolean',
				default: true,
				description: 'Whether to receive security/fraud alerts',
			},
			{
				displayName: 'Marketing Communications',
				name: 'marketingCommunications',
				type: 'boolean',
				default: false,
				description: 'Whether to receive marketing communications',
			},
			{
				displayName: 'Deposit Alerts',
				name: 'depositAlerts',
				type: 'boolean',
				default: true,
				description: 'Whether to receive deposit/load notifications',
			},
			{
				displayName: 'Payment Reminders',
				name: 'paymentReminders',
				type: 'boolean',
				default: true,
				description: 'Whether to receive payment reminders',
			},
		],
	},
	// Notification Type for subscribe/unsubscribe
	{
		displayName: 'Notification Type',
		name: 'notificationType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['subscribe', 'unsubscribe'],
			},
		},
		options: [
			{ name: 'Transaction Alerts', value: 'TRANSACTION' },
			{ name: 'Balance Alerts', value: 'BALANCE' },
			{ name: 'Security Alerts', value: 'SECURITY' },
			{ name: 'Deposit Notifications', value: 'DEPOSIT' },
			{ name: 'Payment Reminders', value: 'PAYMENT' },
			{ name: 'Card Status', value: 'CARD_STATUS' },
			{ name: 'Account Updates', value: 'ACCOUNT' },
			{ name: 'Promotional', value: 'PROMOTIONAL' },
		],
		default: 'TRANSACTION',
		description: 'Type of notification to subscribe to/unsubscribe from',
	},
	// Channel for subscribe/unsubscribe
	{
		displayName: 'Channel',
		name: 'channel',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['subscribe', 'unsubscribe'],
			},
		},
		options: [
			{ name: 'Email', value: 'EMAIL' },
			{ name: 'SMS', value: 'SMS' },
			{ name: 'Push Notification', value: 'PUSH' },
			{ name: 'In-App', value: 'IN_APP' },
		],
		default: 'EMAIL',
		description: 'Notification delivery channel',
	},
	// Filters for getNotifications
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['notification'],
				operation: ['getNotifications'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Unread', value: 'UNREAD' },
					{ name: 'Read', value: 'READ' },
				],
				default: '',
				description: 'Filter by read status',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Transaction', value: 'TRANSACTION' },
					{ name: 'Balance', value: 'BALANCE' },
					{ name: 'Security', value: 'SECURITY' },
					{ name: 'Deposit', value: 'DEPOSIT' },
					{ name: 'Payment', value: 'PAYMENT' },
					{ name: 'Account', value: 'ACCOUNT' },
				],
				default: '',
				description: 'Filter by notification type',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'Start date filter',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'End date filter',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 50,
				description: 'Maximum notifications to return',
			},
		],
	},
];

export async function executeNotificationOperations(
	this: IExecuteFunctions,
	client: GalileoClient,
	operation: string,
	i: number,
): Promise<IDataObject> {
	let response: IDataObject;
	const prn = this.getNodeParameter('prn', i) as string;
	validatePrnField.call(this, prn, 'PRN');

	switch (operation) {
		case 'getSettings': {
			response = await client.request(ENDPOINTS.notification.getSettings, {
				accountNo: prn,
			});
			break;
		}

		case 'updateSettings': {
			const settings = this.getNodeParameter('settings', i) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
			};

			// Map settings to API format
			if (settings.emailEnabled !== undefined) params.email_enabled = settings.emailEnabled;
			if (settings.smsEnabled !== undefined) params.sms_enabled = settings.smsEnabled;
			if (settings.pushEnabled !== undefined) params.push_enabled = settings.pushEnabled;
			if (settings.transactionAlerts !== undefined) params.trans_alerts = settings.transactionAlerts;
			if (settings.transactionAlertThreshold) params.trans_alert_threshold = settings.transactionAlertThreshold;
			if (settings.balanceAlerts !== undefined) params.balance_alerts = settings.balanceAlerts;
			if (settings.lowBalanceThreshold) params.low_balance_threshold = settings.lowBalanceThreshold;
			if (settings.securityAlerts !== undefined) params.security_alerts = settings.securityAlerts;
			if (settings.marketingCommunications !== undefined) params.marketing = settings.marketingCommunications;
			if (settings.depositAlerts !== undefined) params.deposit_alerts = settings.depositAlerts;
			if (settings.paymentReminders !== undefined) params.payment_reminders = settings.paymentReminders;

			response = await client.request(ENDPOINTS.notification.updateSettings, params);
			break;
		}

		case 'getNotifications': {
			const filters = this.getNodeParameter('filters', i) as IDataObject;

			const params: IDataObject = {
				accountNo: prn,
			};

			if (filters.status) params.status = filters.status;
			if (filters.type) params.type = filters.type;
			if (filters.startDate) params.startDate = filters.startDate;
			if (filters.endDate) params.endDate = filters.endDate;
			if (filters.limit) params.limit = filters.limit;

			response = await client.request(ENDPOINTS.notification.list, params);
			break;
		}

		case 'markRead': {
			const notificationId = this.getNodeParameter('notificationId', i) as string;

			response = await client.request(ENDPOINTS.notification.markRead, {
				accountNo: prn,
				notification_id: notificationId,
			});
			break;
		}

		case 'getChannels': {
			response = await client.request(ENDPOINTS.notification.getChannels, {
				accountNo: prn,
			});
			break;
		}

		case 'subscribe': {
			const notificationType = this.getNodeParameter('notificationType', i) as string;
			const channel = this.getNodeParameter('channel', i) as string;

			response = await client.request(ENDPOINTS.notification.subscribe, {
				accountNo: prn,
				notification_type: notificationType,
				channel,
			});
			break;
		}

		case 'unsubscribe': {
			const notificationType = this.getNodeParameter('notificationType', i) as string;
			const channel = this.getNodeParameter('channel', i) as string;

			response = await client.request(ENDPOINTS.notification.unsubscribe, {
				accountNo: prn,
				notification_type: notificationType,
				channel,
			});
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}
