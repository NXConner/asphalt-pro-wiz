import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for managing timeouts
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    if (delay !== null) {
      timeoutRef.current = setTimeout(() => savedCallback.current(), delay);
    }
  }, [delay, clear]);

  useEffect(() => {
    if (delay !== null) {
      timeoutRef.current = setTimeout(() => savedCallback.current(), delay);
      return clear;
    }
  }, [delay, clear]);

  return { reset, clear };
}
