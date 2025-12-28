/**
 * Velocity BPA - n8n-nodes-galileo
 * 
 * @license BSL-1.1
 * @copyright 2025 Velocity BPA
 * @see https://velobpa.com/licensing
 */

import {
	validateSsn,
	formatSsn,
	validatePhoneNumber,
	formatPhoneE164,
	validateEmail,
	validateZipCode,
	validateDateFormat,
	validateAmount,
	validateRoutingNumber,
	validateAccountNumber,
	validatePrn,
	sanitizeString,
	amountToCents,
	centsToAmount,
} from '../../nodes/Galileo/utils/validationUtils';

describe('Validation Utilities', () => {
	describe('validateSsn', () => {
		it('should validate correct SSN without dashes', () => {
			expect(validateSsn('123456789')).toBe(true);
		});

		it('should validate correct SSN with dashes', () => {
			expect(validateSsn('123-45-6789')).toBe(true);
		});

		it('should reject SSN starting with 000', () => {
			expect(validateSsn('000-12-3456')).toBe(false);
		});

		it('should reject SSN starting with 666', () => {
			expect(validateSsn('666-12-3456')).toBe(false);
		});

		it('should reject SSN starting with 900+', () => {
			expect(validateSsn('900-12-3456')).toBe(false);
		});

		it('should reject SSN with group 00', () => {
			expect(validateSsn('123-00-6789')).toBe(false);
		});

		it('should reject SSN with serial 0000', () => {
			expect(validateSsn('123-45-0000')).toBe(false);
		});

		it('should reject short SSN', () => {
			expect(validateSsn('12345678')).toBe(false);
		});
	});

	describe('formatSsn', () => {
		it('should format SSN with dashes', () => {
			expect(formatSsn('123456789')).toBe('123-45-6789');
		});

		it('should handle already formatted SSN', () => {
			expect(formatSsn('123-45-6789')).toBe('123-45-6789');
		});

		it('should return original for invalid length', () => {
			expect(formatSsn('12345')).toBe('12345');
		});
	});

	describe('validatePhoneNumber', () => {
		it('should validate 10-digit number', () => {
			expect(validatePhoneNumber('5551234567')).toBe(true);
		});

		it('should validate formatted number', () => {
			expect(validatePhoneNumber('(555) 123-4567')).toBe(true);
		});

		it('should validate number with country code', () => {
			expect(validatePhoneNumber('15551234567')).toBe(true);
		});

		it('should reject short number', () => {
			expect(validatePhoneNumber('555123456')).toBe(false);
		});
	});

	describe('formatPhoneE164', () => {
		it('should format 10-digit number', () => {
			expect(formatPhoneE164('5551234567')).toBe('+15551234567');
		});

		it('should format number with country code', () => {
			expect(formatPhoneE164('15551234567')).toBe('+15551234567');
		});
	});

	describe('validateEmail', () => {
		it('should validate correct email', () => {
			expect(validateEmail('test@example.com')).toBe(true);
		});

		it('should validate email with subdomain', () => {
			expect(validateEmail('test@mail.example.com')).toBe(true);
		});

		it('should reject email without @', () => {
			expect(validateEmail('testexample.com')).toBe(false);
		});

		it('should reject email without domain', () => {
			expect(validateEmail('test@')).toBe(false);
		});
	});

	describe('validateZipCode', () => {
		it('should validate 5-digit zip', () => {
			expect(validateZipCode('12345')).toBe(true);
		});

		it('should validate 9-digit zip', () => {
			expect(validateZipCode('12345-6789')).toBe(true);
		});

		it('should reject invalid zip', () => {
			expect(validateZipCode('1234')).toBe(false);
		});

		it('should reject letters in zip', () => {
			expect(validateZipCode('1234a')).toBe(false);
		});
	});

	describe('validateDateFormat', () => {
		it('should validate correct YYYY-MM-DD format', () => {
			expect(validateDateFormat('2024-01-15')).toBe(true);
		});

		it('should reject incorrect format', () => {
			expect(validateDateFormat('01/15/2024')).toBe(false);
		});

		it('should reject invalid date', () => {
			expect(validateDateFormat('2024-13-45')).toBe(false);
		});
	});

	describe('validateAmount', () => {
		it('should validate positive amount', () => {
			expect(validateAmount(100.00)).toBe(true);
		});

		it('should validate amount with 2 decimal places', () => {
			expect(validateAmount(50.99)).toBe(true);
		});

		it('should reject negative amount', () => {
			expect(validateAmount(-10.00)).toBe(false);
		});

		it('should reject zero amount', () => {
			expect(validateAmount(0)).toBe(false);
		});

		it('should reject more than 2 decimal places', () => {
			expect(validateAmount(10.999)).toBe(false);
		});
	});

	describe('validateRoutingNumber', () => {
		it('should validate correct routing number', () => {
			expect(validateRoutingNumber('021000021')).toBe(true);
		});

		it('should reject invalid checksum', () => {
			expect(validateRoutingNumber('123456789')).toBe(false);
		});

		it('should reject short routing number', () => {
			expect(validateRoutingNumber('12345678')).toBe(false);
		});
	});

	describe('validateAccountNumber', () => {
		it('should validate correct account number', () => {
			expect(validateAccountNumber('12345678901')).toBe(true);
		});

		it('should reject too short account number', () => {
			expect(validateAccountNumber('123')).toBe(false);
		});

		it('should reject too long account number', () => {
			expect(validateAccountNumber('123456789012345678')).toBe(false);
		});
	});

	describe('validatePrn', () => {
		it('should validate correct PRN', () => {
			expect(validatePrn('123456789012')).toBe(true);
		});

		it('should reject PRN with letters', () => {
			expect(validatePrn('123456789abc')).toBe(false);
		});
	});

	describe('sanitizeString', () => {
		it('should trim whitespace', () => {
			expect(sanitizeString('  test  ')).toBe('test');
		});

		it('should remove control characters', () => {
			expect(sanitizeString('test\x00string')).toBe('teststring');
		});
	});

	describe('amountToCents', () => {
		it('should convert dollars to cents', () => {
			expect(amountToCents(10.50)).toBe(1050);
		});

		it('should handle whole dollars', () => {
			expect(amountToCents(100)).toBe(10000);
		});

		it('should round floating point issues', () => {
			expect(amountToCents(10.99)).toBe(1099);
		});
	});

	describe('centsToAmount', () => {
		it('should convert cents to dollars', () => {
			expect(centsToAmount(1050)).toBe(10.50);
		});

		it('should handle whole amounts', () => {
			expect(centsToAmount(10000)).toBe(100);
		});
	});
});
