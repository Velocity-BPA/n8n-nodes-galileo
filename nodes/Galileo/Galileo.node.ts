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
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Import all resource operations and fields
import {
	accountOperations,
	accountFields,
	executeAccount,
	cardOperations,
	cardFields,
	executeCard,
	cardholderOperations,
	cardholderFields,
	executeCardholder,
	transactionOperations,
	transactionFields,
	executeTransaction,
	authorizationOperations,
	authorizationFields,
	executeAuthorization,
	paymentOperations,
	paymentFields,
	executePayment,
	loadOperations,
	loadFields,
	executeLoad,
	withdrawalOperations,
	withdrawalFields,
	executeWithdrawal,
	achOperations,
	achFields,
	executeAch,
	directDepositOperations,
	directDepositFields,
	executeDirectDeposit,
	billPayOperations,
	billPayFields,
	executeBillPay,
	disputeOperations,
	disputeFields,
	executeDispute,
	fraudOperations,
	fraudFields,
	executeFraud,
	feeOperations,
	feeFields,
	executeFee,
	limitOperations,
	limitFields,
	executeLimit,
	statementOperations,
	statementFields,
	executeStatement,
	notificationOperations,
	notificationFields,
	executeNotification,
	kycOperations,
	kycFields,
	executeKyc,
	programOperations,
	programFields,
	executeProgram,
	digitalWalletOperations,
	digitalWalletFields,
	executeDigitalWallet,
	rewardsOperations,
	rewardsFields,
	executeRewards,
	webhookOperations,
	webhookFields,
	executeWebhook,
	sandboxOperations,
	sandboxFields,
	executeSandbox,
	utilityOperations,
	utilityFields,
	executeUtility,
} from './actions';

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

export class Galileo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Galileo',
		name: 'galileo',
		icon: 'file:galileo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Galileo Financial Technologies BaaS platform',
		defaults: {
			name: 'Galileo',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'galileoApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Manage accounts',
					},
					{
						name: 'ACH',
						value: 'ach',
						description: 'Manage ACH transfers',
					},
					{
						name: 'Authorization',
						value: 'authorization',
						description: 'Manage authorizations',
					},
					{
						name: 'Bill Pay',
						value: 'billPay',
						description: 'Manage bill payments',
					},
					{
						name: 'Card',
						value: 'card',
						description: 'Manage cards',
					},
					{
						name: 'Cardholder',
						value: 'cardholder',
						description: 'Manage cardholders',
					},
					{
						name: 'Digital Wallet',
						value: 'digitalWallet',
						description: 'Manage digital wallet provisioning',
					},
					{
						name: 'Direct Deposit',
						value: 'directDeposit',
						description: 'Manage direct deposits',
					},
					{
						name: 'Dispute',
						value: 'dispute',
						description: 'Manage disputes',
					},
					{
						name: 'Fee',
						value: 'fee',
						description: 'Manage fees',
					},
					{
						name: 'Fraud',
						value: 'fraud',
						description: 'Manage fraud prevention',
					},
					{
						name: 'KYC',
						value: 'kyc',
						description: 'Manage KYC verification',
					},
					{
						name: 'Limit',
						value: 'limit',
						description: 'Manage transaction limits',
					},
					{
						name: 'Load',
						value: 'load',
						description: 'Load funds to accounts',
					},
					{
						name: 'Notification',
						value: 'notification',
						description: 'Manage notifications',
					},
					{
						name: 'Payment',
						value: 'payment',
						description: 'Manage payments',
					},
					{
						name: 'Program',
						value: 'program',
						description: 'Access program information',
					},
					{
						name: 'Rewards',
						value: 'rewards',
						description: 'Manage rewards',
					},
					{
						name: 'Sandbox',
						value: 'sandbox',
						description: 'Sandbox testing utilities',
					},
					{
						name: 'Statement',
						value: 'statement',
						description: 'Manage statements',
					},
					{
						name: 'Transaction',
						value: 'transaction',
						description: 'Manage transactions',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Utility operations',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Manage webhooks',
					},
					{
						name: 'Withdrawal',
						value: 'withdrawal',
						description: 'Manage withdrawals',
					},
				],
				default: 'account',
			},
			// Account operations and fields
			...accountOperations,
			...accountFields,
			// Card operations and fields
			...cardOperations,
			...cardFields,
			// Cardholder operations and fields
			...cardholderOperations,
			...cardholderFields,
			// Transaction operations and fields
			...transactionOperations,
			...transactionFields,
			// Authorization operations and fields
			...authorizationOperations,
			...authorizationFields,
			// Payment operations and fields
			...paymentOperations,
			...paymentFields,
			// Load operations and fields
			...loadOperations,
			...loadFields,
			// Withdrawal operations and fields
			...withdrawalOperations,
			...withdrawalFields,
			// ACH operations and fields
			...achOperations,
			...achFields,
			// Direct Deposit operations and fields
			...directDepositOperations,
			...directDepositFields,
			// Bill Pay operations and fields
			...billPayOperations,
			...billPayFields,
			// Dispute operations and fields
			...disputeOperations,
			...disputeFields,
			// Fraud operations and fields
			...fraudOperations,
			...fraudFields,
			// Fee operations and fields
			...feeOperations,
			...feeFields,
			// Limit operations and fields
			...limitOperations,
			...limitFields,
			// Statement operations and fields
			...statementOperations,
			...statementFields,
			// Notification operations and fields
			...notificationOperations,
			...notificationFields,
			// KYC operations and fields
			...kycOperations,
			...kycFields,
			// Program operations and fields
			...programOperations,
			...programFields,
			// Digital Wallet operations and fields
			...digitalWalletOperations,
			...digitalWalletFields,
			// Rewards operations and fields
			...rewardsOperations,
			...rewardsFields,
			// Webhook operations and fields
			...webhookOperations,
			...webhookFields,
			// Sandbox operations and fields
			...sandboxOperations,
			...sandboxFields,
			// Utility operations and fields
			...utilityOperations,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Log licensing notice once
		logLicensingNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result;

				switch (resource) {
					case 'account':
						result = await executeAccount.call(this, i);
						break;
					case 'card':
						result = await executeCard.call(this, i);
						break;
					case 'cardholder':
						result = await executeCardholder.call(this, i);
						break;
					case 'transaction':
						result = await executeTransaction.call(this, i);
						break;
					case 'authorization':
						result = await executeAuthorization.call(this, i);
						break;
					case 'payment':
						result = await executePayment.call(this, i);
						break;
					case 'load':
						result = await executeLoad.call(this, i);
						break;
					case 'withdrawal':
						result = await executeWithdrawal.call(this, i);
						break;
					case 'ach':
						result = await executeAch.call(this, i);
						break;
					case 'directDeposit':
						result = await executeDirectDeposit.call(this, i);
						break;
					case 'billPay':
						result = await executeBillPay.call(this, i);
						break;
					case 'dispute':
						result = await executeDispute.call(this, i);
						break;
					case 'fraud':
						result = await executeFraud.call(this, i);
						break;
					case 'fee':
						result = await executeFee.call(this, i);
						break;
					case 'limit':
						result = await executeLimit.call(this, i);
						break;
					case 'statement':
						result = await executeStatement.call(this, i);
						break;
					case 'notification':
						result = await executeNotification.call(this, i);
						break;
					case 'kyc':
						result = await executeKyc.call(this, i);
						break;
					case 'program':
						result = await executeProgram.call(this, i);
						break;
					case 'digitalWallet':
						result = await executeDigitalWallet.call(this, i);
						break;
					case 'rewards':
						result = await executeRewards.call(this, i);
						break;
					case 'webhook':
						result = await executeWebhook.call(this, i);
						break;
					case 'sandbox':
						result = await executeSandbox.call(this, i);
						break;
					case 'utility':
						result = await executeUtility.call(this, i);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Resource "${resource}" is not supported`,
							{ itemIndex: i },
						);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(result),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
