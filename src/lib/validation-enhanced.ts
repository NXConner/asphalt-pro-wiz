import { z } from 'zod';

import { sanitizeHTML, sanitizeURL, sanitizeEmail, sanitizePhone } from '@/utils/sanitization';

/**
 * Enhanced validation schemas with built-in sanitization
 */

// Common field validations
export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .transform(sanitizeHTML);

export const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .max(255, 'Email must be less than 255 characters')
  .transform(sanitizeEmail);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+()-\s]*$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be less than 20 characters')
  .transform(sanitizePhone);

export const urlSchema = z
  .string()
  .trim()
  .url('Invalid URL')
  .max(2000, 'URL must be less than 2000 characters')
  .transform(sanitizeURL);

export const addressSchema = z
  .string()
  .trim()
  .min(1, 'Address is required')
  .max(500, 'Address must be less than 500 characters')
  .transform(sanitizeHTML);

export const zipCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
  .transform(sanitizeHTML);

export const currencySchema = z
  .number()
  .positive('Amount must be positive')
  .max(1000000000, 'Amount too large')
  .multipleOf(0.01, 'Amount must have at most 2 decimal places');

export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage must be at most 100');

export const coordinatesSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

// Job validation schema
export const jobValidationSchema = z.object({
  name: nameSchema,
  address: addressSchema,
  coords: coordinatesSchema.nullable(),
  competitor: z.string().max(200).transform(sanitizeHTML).optional(),
  notes: z.string().max(5000).transform(sanitizeHTML).optional(),
});

// Client validation schema
export const clientValidationSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  company: z.string().max(200).transform(sanitizeHTML).optional(),
});

// Estimate validation schema
export const estimateValidationSchema = z.object({
  job_id: z.string().uuid(),
  amount: currencySchema,
  description: z.string().max(5000).transform(sanitizeHTML).optional(),
  notes: z.string().max(5000).transform(sanitizeHTML).optional(),
});

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().trim().min(1, 'Subject is required').max(200).transform(sanitizeHTML),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters')
    .transform(sanitizeHTML),
});

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'Filename is required'),
  size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  type: z.string().refine(
    (type) =>
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'].includes(type),
    'Invalid file type. Allowed: JPEG, PNG, GIF, WEBP, PDF'
  ),
});

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Username validation
export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .transform(sanitizeHTML);

/**
 * Validate data against schema and return typed result
 */
export function validateData<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
  return { success: false, errors };
}

/**
 * Validate multiple fields at once
 */
export function validateFields<T extends Record<string, z.ZodType>>(
  schemas: T,
  data: Record<string, unknown>
): { success: true; data: { [K in keyof T]: z.infer<T[K]> } } | { success: false; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {};
  const validatedData: Record<string, any> = {};
  let hasErrors = false;

  for (const [key, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(data[key]);
    if (result.success) {
      validatedData[key] = result.data;
    } else {
      hasErrors = true;
      errors[key] = result.error.errors.map((err) => err.message);
    }
  }

  if (hasErrors) {
    return { success: false, errors: errors as Record<string, string[]> };
  }

  return { success: true, data: validatedData as any };
}

/**
 * Create a validated form handler
 */
export function createValidatedHandler<T extends z.ZodType>(
  schema: T,
  onSuccess: (data: z.infer<T>) => void | Promise<void>,
  onError?: (errors: string[]) => void
) {
  return async (data: unknown) => {
    const result = validateData(schema, data);

    if (result.success) {
      await onSuccess(result.data);
    } else {
      if (onError && 'errors' in result) {
        onError(result.errors);
      } else if ('errors' in result) {
        console.error('Validation errors:', result.errors);
      }
    }
  };
}
