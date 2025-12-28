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

import { Galileo } from '../../nodes/Galileo/Galileo.node';
import { GalileoTrigger } from '../../nodes/Galileo/GalileoTrigger.node';

describe('Galileo Node Integration', () => {
	describe('Galileo Action Node', () => {
		let galileoNode: Galileo;

		beforeEach(() => {
			galileoNode = new Galileo();
		});

		it('should have correct node description', () => {
			expect(galileoNode.description.displayName).toBe('Galileo');
			expect(galileoNode.description.name).toBe('galileo');
			expect(galileoNode.description.version).toBe(1);
		});

		it('should have all 24 resources defined', () => {
			const resourceProperty = galileoNode.description.properties.find(
				(p) => p.name === 'resource'
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');
			
			if (resourceProperty && 'options' in resourceProperty) {
				const options = resourceProperty.options as Array<{ value: string }>;
				const resourceValues = options.map((o) => o.value);
				
				expect(resourceValues).toContain('account');
				expect(resourceValues).toContain('card');
				expect(resourceValues).toContain('cardholder');
				expect(resourceValues).toContain('transaction');
				expect(resourceValues).toContain('authorization');
				expect(resourceValues).toContain('payment');
				expect(resourceValues).toContain('load');
				expect(resourceValues).toContain('withdrawal');
				expect(resourceValues).toContain('ach');
				expect(resourceValues).toContain('directDeposit');
				expect(resourceValues).toContain('billPay');
				expect(resourceValues).toContain('dispute');
				expect(resourceValues).toContain('fraud');
				expect(resourceValues).toContain('fee');
				expect(resourceValues).toContain('limit');
				expect(resourceValues).toContain('statement');
				expect(resourceValues).toContain('notification');
				expect(resourceValues).toContain('kyc');
				expect(resourceValues).toContain('program');
				expect(resourceValues).toContain('digitalWallet');
				expect(resourceValues).toContain('rewards');
				expect(resourceValues).toContain('webhook');
				expect(resourceValues).toContain('sandbox');
				expect(resourceValues).toContain('utility');
				expect(options.length).toBe(24);
			}
		});

		it('should require galileoApi credentials', () => {
			expect(galileoNode.description.credentials).toBeDefined();
			expect(galileoNode.description.credentials?.length).toBe(1);
			expect(galileoNode.description.credentials?.[0].name).toBe('galileoApi');
			expect(galileoNode.description.credentials?.[0].required).toBe(true);
		});

		it('should have main inputs and outputs', () => {
			expect(galileoNode.description.inputs).toContain('main');
			expect(galileoNode.description.outputs).toContain('main');
		});

		it('should have execute method defined', () => {
			expect(galileoNode.execute).toBeDefined();
			expect(typeof galileoNode.execute).toBe('function');
		});
	});

	describe('Galileo Trigger Node', () => {
		let triggerNode: GalileoTrigger;

		beforeEach(() => {
			triggerNode = new GalileoTrigger();
		});

		it('should have correct node description', () => {
			expect(triggerNode.description.displayName).toBe('Galileo Trigger');
			expect(triggerNode.description.name).toBe('galileoTrigger');
			expect(triggerNode.description.version).toBe(1);
		});

		it('should be configured as webhook', () => {
			expect(triggerNode.description.webhooks).toBeDefined();
			expect(triggerNode.description.webhooks?.length).toBeGreaterThan(0);
		});

		it('should have event type selection', () => {
			const eventProperty = triggerNode.description.properties.find(
				(p) => p.name === 'events'
			);
			expect(eventProperty).toBeDefined();
		});

		it('should have webhook methods defined', () => {
			expect(triggerNode.webhookMethods).toBeDefined();
		});
	});
});

describe('Galileo Node Resources', () => {
	let galileoNode: Galileo;

	beforeEach(() => {
		galileoNode = new Galileo();
	});

	const resourceOperations: Record<string, string[]> = {
		account: ['create', 'get', 'getBalance', 'getStatus', 'updateStatus', 'freeze', 'unfreeze', 'close', 'getHistory', 'getTransactions', 'getLimits', 'updateLimits', 'getByExternalId', 'list'],
		card: ['create', 'get', 'getDetails', 'activate', 'freeze', 'unfreeze', 'replace', 'reissue', 'close', 'getStatus', 'updateStatus', 'getPin', 'setPin', 'resetPin', 'getCvv2', 'getExpiration', 'listByAccount', 'updateLimits'],
		cardholder: ['create', 'get', 'update', 'getBySsn', 'getByExternalId', 'updateAddress', 'updatePhone', 'updateEmail', 'getStatus', 'updateStatus'],
		transaction: ['get', 'list', 'getByAccount', 'getByCard', 'getByDate', 'getPending', 'getPosted', 'search', 'getDetails', 'adjust', 'reverse'],
		authorization: ['get', 'list', 'getPending', 'simulate', 'approve', 'decline', 'getByMerchant', 'getControls'],
		payment: ['createAch', 'createInstant', 'createCardToCard', 'get', 'getStatus', 'cancel', 'getByAccount', 'getHistory'],
		load: ['load', 'loadImmediate', 'getStatus', 'getHistory', 'getByReference', 'cancel'],
		withdrawal: ['create', 'get', 'getStatus', 'cancel', 'getByAccount', 'getAtm'],
		ach: ['createCredit', 'createDebit', 'getTransfer', 'getStatus', 'cancel', 'getByReference', 'getReturns', 'getLimits'],
		directDeposit: ['getInfo', 'update', 'getInstructions', 'getRoutingNumber', 'getAccountNumber'],
		billPay: ['createPayment', 'getPayment', 'cancelPayment', 'getPayments', 'getBillers', 'addBiller', 'removeBiller', 'getPaymentStatus'],
		dispute: ['create', 'get', 'getStatus', 'update', 'getByAccount', 'getByCard', 'uploadDocument', 'getDeadline'],
		fraud: ['getFraudScore', 'reportFraud', 'getAlerts', 'updateStatus', 'getRules', 'blockTransactionType', 'unblockTransactionType', 'getVelocityLimits'],
		fee: ['getSchedule', 'applyFee', 'waiveFee', 'getByAccount', 'getHistory', 'getTypes', 'calculateFee'],
		limit: ['getAccountLimits', 'updateAccountLimits', 'getCardLimits', 'updateCardLimits', 'getTransactionLimits', 'getDailyLimits', 'getMonthlyLimits', 'resetLimits'],
		statement: ['get', 'list', 'getPdf', 'getByPeriod', 'getMini'],
		notification: ['getSettings', 'updateSettings', 'getNotifications', 'markRead', 'getChannels', 'subscribe', 'unsubscribe'],
		kyc: ['submit', 'getStatus', 'getResult', 'uploadDocument', 'getRequirements', 'retry', 'getIdentityVerification'],
		program: ['getInfo', 'getSettings', 'getLimits', 'getFees', 'getCardProducts', 'getAccountProducts'],
		digitalWallet: ['provisionApplePay', 'provisionGooglePay', 'provisionSamsungPay', 'getWalletToken', 'getWalletStatus', 'deactivateWalletToken', 'getProvisioningData'],
		rewards: ['getBalance', 'getHistory', 'redeem', 'getRules', 'getCatalog', 'transfer'],
		webhook: ['create', 'get', 'update', 'delete', 'list', 'test', 'getEvents', 'retry'],
		sandbox: ['simulateAuthorization', 'simulateSettlement', 'simulateAch', 'simulateLoad', 'simulateTransaction', 'advanceTime', 'resetAccount'],
		utility: ['getBinInfo', 'validateCardNumber', 'getMccCodes', 'getCountryCodes', 'getCurrencyCodes', 'testConnection', 'getApiStatus'],
	};

	Object.entries(resourceOperations).forEach(([resource, operations]) => {
		it(`should have operations for ${resource} resource`, () => {
			const props = galileoNode.description.properties;
			
			// Find operation property for this resource
			const operationProp = props.find(
				(p) => 
					p.name === 'operation' && 
					'displayOptions' in p &&
					p.displayOptions?.show?.resource?.includes(resource)
			);
			
			expect(operationProp).toBeDefined();
			
			if (operationProp && 'options' in operationProp) {
				const opOptions = operationProp.options as Array<{ value: string }>;
				const opValues = opOptions.map((o) => o.value);
				
				operations.forEach((op) => {
					expect(opValues).toContain(op);
				});
			}
		});
	});
});
