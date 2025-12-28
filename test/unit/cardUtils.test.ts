/**
 * Velocity BPA - n8n-nodes-galileo
 * 
 * @license BSL-1.1
 * @copyright 2025 Velocity BPA
 * @see https://velobpa.com/licensing
 */

import {
	validateLuhn,
	extractBin,
	maskCardNumber,
	formatCardNumber,
	detectCardNetwork,
	isCardExpired,
	formatExpiration,
	validateCvv,
	generateTestCardNumber,
} from '../../nodes/Galileo/utils/cardUtils';

describe('Card Utilities', () => {
	describe('validateLuhn', () => {
		it('should validate correct Visa card number', () => {
			expect(validateLuhn('4111111111111111')).toBe(true);
		});

		it('should validate correct Mastercard number', () => {
			expect(validateLuhn('5500000000000004')).toBe(true);
		});

		it('should reject invalid card number', () => {
			expect(validateLuhn('4111111111111112')).toBe(false);
		});

		it('should reject non-numeric input', () => {
			expect(validateLuhn('411111111111111a')).toBe(false);
		});

		it('should handle empty string', () => {
			expect(validateLuhn('')).toBe(false);
		});
	});

	describe('extractBin', () => {
		it('should extract 6-digit BIN by default', () => {
			expect(extractBin('4111111111111111')).toBe('411111');
		});

		it('should extract 8-digit BIN when specified', () => {
			expect(extractBin('4111111111111111', 8)).toBe('41111111');
		});

		it('should return partial for short numbers', () => {
			expect(extractBin('4111')).toBe('4111');
		});
	});

	describe('maskCardNumber', () => {
		it('should mask middle digits', () => {
			expect(maskCardNumber('4111111111111111')).toBe('411111******1111');
		});

		it('should handle short numbers', () => {
			const result = maskCardNumber('4111');
			expect(result).toBe('****');
		});
	});

	describe('formatCardNumber', () => {
		it('should format with spaces', () => {
			expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
		});

		it('should handle numbers with existing spaces', () => {
			expect(formatCardNumber('4111 1111 1111 1111')).toBe('4111 1111 1111 1111');
		});
	});

	describe('detectCardNetwork', () => {
		it('should detect Visa', () => {
			expect(detectCardNetwork('4111111111111111')).toBe('VISA');
		});

		it('should detect Mastercard (2xxx range)', () => {
			expect(detectCardNetwork('2221000000000009')).toBe('MASTERCARD');
		});

		it('should detect Mastercard (5xxx range)', () => {
			expect(detectCardNetwork('5500000000000004')).toBe('MASTERCARD');
		});

		it('should detect American Express', () => {
			expect(detectCardNetwork('378282246310005')).toBe('AMEX');
		});

		it('should detect Discover', () => {
			expect(detectCardNetwork('6011111111111117')).toBe('DISCOVER');
		});

		it('should return UNKNOWN for unrecognized', () => {
			expect(detectCardNetwork('9999999999999999')).toBe('UNKNOWN');
		});
	});

	describe('isCardExpired', () => {
		it('should return true for past expiration', () => {
			expect(isCardExpired(1, 2020)).toBe(true);
		});

		it('should return false for future expiration', () => {
			expect(isCardExpired(12, 2030)).toBe(false);
		});

		it('should handle current month correctly', () => {
			const now = new Date();
			const month = now.getMonth() + 1;
			const year = now.getFullYear();
			// Current month should not be expired
			expect(isCardExpired(month, year)).toBe(false);
		});

		it('should handle 2-digit year', () => {
			expect(isCardExpired(12, 30)).toBe(false); // 2030
			expect(isCardExpired(1, 20)).toBe(true); // 2020
		});
	});

	describe('formatExpiration', () => {
		it('should format month and year', () => {
			expect(formatExpiration(12, 2025)).toBe('12/25');
		});

		it('should pad single digit month', () => {
			expect(formatExpiration(1, 2025)).toBe('01/25');
		});

		it('should handle 2-digit year', () => {
			expect(formatExpiration(12, 25)).toBe('12/25');
		});
	});

	describe('validateCvv', () => {
		it('should validate 3-digit CVV', () => {
			expect(validateCvv('123')).toBe(true);
		});

		it('should validate 4-digit CVV for Amex', () => {
			expect(validateCvv('1234', 'AMEX')).toBe(true);
		});

		it('should reject 4-digit CVV for non-Amex', () => {
			expect(validateCvv('1234')).toBe(false);
		});

		it('should reject 3-digit CVV for Amex', () => {
			expect(validateCvv('123', 'AMEX')).toBe(false);
		});

		it('should reject 2-digit CVV', () => {
			expect(validateCvv('12')).toBe(false);
		});

		it('should reject 5-digit CVV', () => {
			expect(validateCvv('12345')).toBe(false);
		});

		it('should reject non-numeric CVV', () => {
			expect(validateCvv('12a')).toBe(false);
		});
	});

	describe('generateTestCardNumber', () => {
		it('should generate valid Visa test card', () => {
			const card = generateTestCardNumber('4111111111', 16);
			expect(card.startsWith('4')).toBe(true);
			expect(card.length).toBe(16);
			expect(validateLuhn(card)).toBe(true);
		});

		it('should generate valid Mastercard test card', () => {
			const card = generateTestCardNumber('5555555555', 16);
			expect(card.startsWith('5')).toBe(true);
			expect(card.length).toBe(16);
			expect(validateLuhn(card)).toBe(true);
		});

		it('should generate card with custom length', () => {
			const card = generateTestCardNumber('4111', 15);
			expect(card.length).toBe(15);
			expect(validateLuhn(card)).toBe(true);
		});
	});
});
