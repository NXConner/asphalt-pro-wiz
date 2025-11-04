import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  onError?: (error: Error, attempt: number) => void;
}

interface RetryState {
  isLoading: boolean;
  error: Error | null;
  attempt: number;
}

/**
 * Hook for retrying failed operations with exponential backoff
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  { maxAttempts = 3, delay = 1000, backoffMultiplier = 2, onError }: RetryOptions = {}
) {
  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    attempt: 0,
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setState({ isLoading: true, error: null, attempt: 0 });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        setState({ isLoading: false, error: null, attempt });
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ isLoading: false, error: err, attempt });

        if (onError) {
          onError(err, attempt);
        }

        if (attempt < maxAttempts) {
          const waitTime = delay * Math.pow(backoffMultiplier, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    return null;
  }, [fn, maxAttempts, delay, backoffMultiplier, onError]);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, attempt: 0 });
  }, []);

  return {
    execute,
    reset,
    ...state,
  };
}
