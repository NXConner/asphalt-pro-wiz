import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoadingSpinner } from './common/LoadingSpinner';

import { useAuthContext } from '@/contexts/AuthContext';
import { initializeSecureSession, logSecurityEvent, validateSession } from '@/lib/security';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuthContext();
  const navigate = useNavigate();

  // Initialize secure session on mount
  useEffect(() => {
    if (isAuthenticated) {
      initializeSecureSession();
    }
  }, [isAuthenticated]);

  // Validate session security
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const sessionValidation = validateSession();
      if (!sessionValidation.valid) {
        logSecurityEvent('session_timeout', {
          reason: sessionValidation.reason,
        });
        // Session invalid, redirect to auth
        navigate('/auth', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      logSecurityEvent('authorization_failure', {
        path: window.location.pathname,
      });
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, requireAuth]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
