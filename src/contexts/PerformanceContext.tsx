import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { reportWebVitals } from '@/lib/performance';

interface PerformanceContextValue {
  // Add performance metrics and methods as needed
  markFeature: (name: string) => void;
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize web vitals reporting
    reportWebVitals();
  }, []);

  const markFeature = (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  };

  return (
    <PerformanceContext.Provider value={{ markFeature }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider');
  }
  return context;
}
