/**
 * Enhanced input validation utilities
 * Comprehensive validation functions for form inputs and user data
 */

import { sanitizeEmail, sanitizeHTML, sanitizePhone, sanitizeURL } from '@/utils/sanitization';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Email validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }

  const sanitized = sanitizeEmail(email);
  if (!sanitized) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Additional validation
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  return { isValid: true, sanitized };
}

/**
 * Password validation
 */
export function validatePassword(
  password: string,
  options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  },
): ValidationResult {
  const {
    minLength = 6,
    requireUppercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options || {};

  if (!password || password.length === 0) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true, sanitized: password };
}

/**
 * URL validation
 */
export function validateURL(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  const sanitized = sanitizeURL(url);
  if (!sanitized) {
    return { isValid: false, error: 'Invalid URL format' };
  }

  return { isValid: true, sanitized };
}

/**
 * Phone number validation
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const sanitized = sanitizePhone(phone);
  const digitsOnly = sanitized.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must contain at least 10 digits' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }

  return { isValid: true, sanitized };
}

/**
 * Required field validation
 */
export function validateRequired(value: unknown, fieldName = 'Field'): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * String length validation
 */
export function validateLength(
  value: string,
  options: { min?: number; max?: number; fieldName?: string },
): ValidationResult {
  const { min, max, fieldName = 'Field' } = options;

  if (min !== undefined && value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }

  if (max !== undefined && value.length > max) {
    return { isValid: false, error: `${fieldName} must be no more than ${max} characters` };
  }

  return { isValid: true };
}

/**
 * Number range validation
 */
export function validateNumberRange(
  value: number,
  options: { min?: number; max?: number; fieldName?: string },
): ValidationResult {
  const { min, max, fieldName = 'Field' } = options;

  if (!Number.isFinite(value)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && value < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && value > max) {
    return { isValid: false, error: `${fieldName} must be no more than ${max}` };
  }

  return { isValid: true };
}

/**
 * HTML content validation and sanitization
 */
export function validateHTML(
  html: string,
  options?: { maxLength?: number; allowTags?: string[] },
): ValidationResult {
  const { maxLength = 10000, allowTags = [] } = options || {};

  if (html.length > maxLength) {
    return { isValid: false, error: `Content must be no more than ${maxLength} characters` };
  }

  // Sanitize HTML
  const sanitized = sanitizeHTML(html);

  return { isValid: true, sanitized };
}

/**
 * Form validation helper
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, (value: unknown) => ValidationResult>,
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(rules)) {
    const value = data[field as keyof T];
    const result = validator(value);

    if (!result.isValid) {
      isValid = false;
      errors[field] = result.error || 'Invalid value';
    }
  }

  return { isValid, errors };
}

/**
 * Async validation helper
 */
export async function validateAsync<T>(
  value: T,
  validators: Array<(value: T) => Promise<ValidationResult> | ValidationResult>,
): Promise<ValidationResult> {
  for (const validator of validators) {
    const result = await validator(value);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}
