import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

import { logError } from '@/lib/logging';

interface ErrorContextValue {
  handleError: (error: Error, context?: Record<string, any>) => void;
  clearError: () => void;
  lastError: Error | null;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [lastError, setLastError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error, context?: Record<string, any>) => {
    // Log error
    logError(error, context);

    // Store error
    setLastError(error);

    // Show user-friendly toast
    toast.error('Something went wrong', {
      description: error.message || 'An unexpected error occurred. Please try again.',
      action: {
        label: 'Dismiss',
        onClick: () => {},
      },
    });
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ handleError, clearError, lastError }}>
      {children}
    </ErrorContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}
