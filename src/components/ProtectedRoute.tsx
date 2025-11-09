import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoadingSpinner } from './common/LoadingSpinner';

import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, isConfigured } = useAuthContext();
  const navigate = useNavigate();

  // Detect Lovable preview environment or hosted sandbox to keep preview unblocked
  const isPreviewEnv =
    typeof window !== 'undefined' && (
      !!(window as any).__LOVABLE__ ||
      !!(window as any).lovable ||
      /(^|\.)lovableproject\.com$/.test(window.location.hostname)
    );
  // Only redirect to /auth when the backend is configured and not in Lovable preview.
  useEffect(() => {
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
  if (isLovablePreview || !isConfigured) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
