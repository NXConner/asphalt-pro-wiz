import { Suspense, type ReactNode } from 'react';

import { LoadingSpinner } from './common/LoadingSpinner';

interface LoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function LoadingBoundary({ children, fallback }: LoadingBoundaryProps) {
  const defaultFallback = (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
}
