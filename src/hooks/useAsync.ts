import { useState, useEffect, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for handling async operations with loading, error, and success states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(async () => {
    setState({
      data: null,
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false,
    });

    try {
      const result = await asyncFunction();
      setState({
        data: result,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      });

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({
        data: null,
        error: err,
        isLoading: false,
        isSuccess: false,
        isError: true,
      });

      if (onError) {
        onError(err);
      }

      throw err;
    }
  }, [asyncFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
