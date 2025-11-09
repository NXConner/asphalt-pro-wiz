import { logError } from './logging';

/**
 * Error handling utilities for consistent error management across the application
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: ErrorContext,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Safely execute an async function with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: ErrorContext,
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError(err, context);
    return { data: null, error: err };
  }
}

/**
 * Safely execute a synchronous function with error handling
 */
export function safeSync<T>(
  fn: () => T,
  context?: ErrorContext,
): { data: T | null; error: Error | null } {
  try {
    const data = fn();
    return { data, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError(err, context);
    return { data: null, error: err };
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    multiplier?: number;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    multiplier = 2,
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * multiplier, maxDelay);
      }
    }
  }

  throw lastError ?? new Error('Retry failed');
}

/**
 * Create a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    // Generic error
    return 'An unexpected error occurred. Please try again or contact support.';
  }

  return 'An unknown error occurred.';
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code.startsWith('RECOVERABLE_');
  }

  if (error instanceof Error) {
    // Network errors are usually recoverable
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return true;
    }

    // Timeout errors are recoverable
    if (error.message.includes('timeout')) {
      return true;
    }
  }

  return false;
}

/**
 * Error boundary helper to determine if error should be caught
 */
export function shouldCatchError(error: unknown): boolean {
  // Don't catch errors in development for easier debugging
  if (import.meta.env.DEV) {
    return false;
  }

  // Always catch in production
  return true;
}

