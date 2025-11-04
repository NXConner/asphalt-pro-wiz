import { z } from 'zod';

/**
 * Validation schemas for forms and data
 */

export const jobSchema = z.object({
  name: z.string().min(1, 'Job name is required').max(100),
  address: z.string().min(1, 'Address is required'),
  competitor: z.string().optional(),
  status: z.enum(['pending', 'inProgress', 'completed', 'archived']),
});

export const areaSchema = z.object({
  totalArea: z.number().min(0, 'Area must be positive').max(1000000),
  items: z.array(z.object({
    id: z.number(),
    shape: z.enum(['rectangle', 'triangle', 'circle', 'drawn', 'manual', 'image']),
    area: z.number().min(0),
  })),
});

export const materialSchema = z.object({
  numCoats: z.number().int().min(1).max(5),
  sandAdded: z.boolean(),
  polymerAdded: z.boolean(),
  sealerType: z.enum(['Acrylic', 'Asphalt Emulsion', 'Coal Tar', 'PMM', 'Other']),
  sandType: z.enum(['Black Beauty', 'Black Diamond', 'Other']),
  waterPercent: z.number().min(0).max(100),
});

export const crackSchema = z.object({
  length: z.number().min(0).max(100000),
  width: z.number().min(0).max(12),
  depth: z.number().min(0).max(12),
});

export const stripingSchema = z.object({
  lines: z.number().int().min(0).max(10000),
  handicap: z.number().int().min(0).max(1000),
  arrowsLarge: z.number().int().min(0).max(1000),
  arrowsSmall: z.number().int().min(0).max(1000),
  lettering: z.number().int().min(0).max(10000),
  curb: z.number().int().min(0).max(100000),
  color: z.enum(['White', 'Blue', 'Yellow', 'Red', 'Green']),
});

export const businessDataSchema = z.object({
  laborRate: z.number().min(0),
  materialCostPerGallon: z.number().min(0),
  overheadPercent: z.number().min(0).max(100),
  profitMarginPercent: z.number().min(0).max(100),
  sqFtPerGallon: z.number().min(0),
});

/**
 * Validate data against schema
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Unknown validation error'],
    };
  }
}

/**
 * Safe parse with default fallback
 */
export function safeParseWithDefault<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaultValue: T
): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}
