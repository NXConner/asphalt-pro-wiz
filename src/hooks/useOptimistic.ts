import { useState, useCallback, useRef } from 'react';

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
  const optionsRef = useRef(options);
  const dataRef = useRef(data);

  // Update refs when values change
  optionsRef.current = options;
  dataRef.current = data;

  const update = useCallback(
    async (
      optimisticUpdate: (current: T) => T,
      serverUpdate: () => Promise<T>,
    ): Promise<boolean> => {
      const previousData = dataRef.current;
      setIsUpdating(true);
      setError(null);

      try {
        // Apply optimistic update immediately
        const updatedData = optimisticUpdate(dataRef.current);
        setData(updatedData);
        dataRef.current = updatedData;

        // Perform server update
        const result = await serverUpdate();

        // Update with server response
        setData(result);
        dataRef.current = result;
        setIsUpdating(false);

        if (optionsRef.current.onSuccess) {
          optionsRef.current.onSuccess(result);
        }

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);

        // Rollback to previous data
        if (optionsRef.current.rollbackDelay) {
          setTimeout(() => {
            setData(previousData);
            dataRef.current = previousData;
          }, optionsRef.current.rollbackDelay);
        } else {
          setData(previousData);
          dataRef.current = previousData;
        }

        setIsUpdating(false);

        if (optionsRef.current.onError) {
          optionsRef.current.onError(error);
        }

        return false;
      }
    },
    [], // Empty deps - using refs for stable callback
  );

  return {
    data,
    isUpdating,
    error,
    update,
    setData,
  };
}
