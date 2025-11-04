import { useState, useCallback } from 'react';

interface CopyStatus {
  copied: boolean;
  error: Error | null;
}

/**
 * Hook for copying text to clipboard
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [status, setStatus] = useState<CopyStatus>({
    copied: false,
    error: null,
  });

  const copy = useCallback(
    async (text: string) => {
      try {
        if (!navigator?.clipboard) {
          throw new Error('Clipboard API not available');
        }

        await navigator.clipboard.writeText(text);
        setStatus({ copied: true, error: null });

        // Reset status after delay
        setTimeout(() => {
          setStatus({ copied: false, error: null });
        }, resetDelay);
      } catch (error) {
        setStatus({
          copied: false,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    },
    [resetDelay]
  );

  return {
    copy,
    ...status,
  };
}
