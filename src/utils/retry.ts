/**
 * Utility functions for implementing retry logic with exponential backoff
 */

interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  shouldRetry: () => true,
};

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(fn: () => Promise<T>, config: RetryConfig = {}): Promise<T> {
  const { maxAttempts, initialDelay, maxDelay, backoffMultiplier, shouldRetry } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't wait after the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt - 1), maxDelay);

      console.log(`Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Create a retry wrapper for a function
 */
export function createRetryWrapper<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config?: RetryConfig,
): T {
  return ((...args: Parameters<T>) => withRetry(() => fn(...args), config)) as T;
}

/**
 * Check if an error is retryable (network errors, timeouts, 5xx responses)
 */
export function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'network',
    'timeout',
    'connection',
    'econnreset',
    'enotfound',
    'etimedout',
  ];

  const message = error.message.toLowerCase();
  if (retryableMessages.some((msg) => message.includes(msg))) {
    return true;
  }

  // Check for HTTP status codes
  if ('status' in error && typeof (error as { status?: unknown }).status === 'number') {
    const status = (error as { status: number }).status;
    return status >= 500 || status === 408 || status === 429;
  }

  return false;
}

/**
 * Retry with linear backoff (constant delay between attempts)
 */
export async function withLinearRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000,
): Promise<T> {
  return withRetry(fn, {
    maxAttempts,
    initialDelay: delay,
    backoffMultiplier: 1,
  });
}

/**
 * Retry immediately without delay
 */
export async function withImmediateRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  return withRetry(fn, {
    maxAttempts,
    initialDelay: 0,
    backoffMultiplier: 1,
  });
}
