import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoadingSpinner } from './common/LoadingSpinner';

import { useAuthContext } from '@/contexts/AuthContext';
import { isLovablePreviewRuntime } from '@/lib/routing/basePath';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, isConfigured } = useAuthContext();
  const navigate = useNavigate();

  // Detect Lovable preview environment or hosted sandbox to keep preview unblocked
  const isPreviewEnv = isLovablePreviewRuntime();
  // Only redirect to /auth when the backend is configured and not in Lovable preview.
  useEffect(() => {
    try { console.debug('[ProtectedRoute]', { isPreviewEnv, isConfigured, isAuthenticated, loading }); } catch {}
    if (!loading && isConfigured && !isPreviewEnv && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, isConfigured, isPreviewEnv, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // In Lovable preview or when Supabase isn't configured (or demo mode), render children.
  if (isPreviewEnv || !isConfigured) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
