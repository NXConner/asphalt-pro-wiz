import { useState, useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  rollbackDelay?: number;
}

/**
 * Hook for optimistic UI updates with automatic rollback on error
 */
export function useOptimistic<T>(initialData: T, options: OptimisticUpdateOptions<T> = {}) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (
      optimisticUpdate: (current: T) => T,
      serverUpdate: () => Promise<T>
    ): Promise<boolean> => {
      const previousData = data;
      setIsUpdating(true);
      setError(null);

      try {
        // Apply optimistic update immediately
        const updatedData = optimisticUpdate(data);
        setData(updatedData);

        // Perform server update
        const result = await serverUpdate();

        // Update with server response
        setData(result);
        setIsUpdating(false);

        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        // Rollback to previous data
        if (options.rollbackDelay) {
          setTimeout(() => setData(previousData), options.rollbackDelay);
        } else {
          setData(previousData);
        }

        setIsUpdating(false);

        if (options.onError) {
          options.onError(error);
        }

        return false;
      }
    },
    [data, options]
  );

  return {
    data,
    isUpdating,
    error,
    update,
    setData,
  };
}
