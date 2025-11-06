import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { toast as sonnerToast } from 'sonner';

import { SkipLink } from '@/components/A11y/SkipLink';
import { AccessibilityChecker } from '@/components/AccessibilityChecker/AccessibilityChecker';
import { CommandPalette } from '@/components/CommandPalette/CommandPalette';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorRecovery } from '@/components/ErrorRecovery/ErrorRecovery';
import { MobileOptimizations } from '@/components/MobileOptimizations';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SupabaseConfigBanner } from '@/components/SupabaseConfigBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { KeyboardProvider } from '@/contexts/KeyboardContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { trackPageView } from '@/lib/analytics';
import { I18nProvider } from '@/lib/i18n';
import { initializeMonitoring } from '@/lib/monitoring';

// Route-level code splitting for faster initial load
const Index = lazy(() => import('./pages/Index'));
const PremiumServiceDetails = lazy(() => import('./pages/PremiumServiceDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Portal = lazy(() => import('./pages/Portal/Portal'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const Auth = lazy(() => import('./pages/Auth'));
const AdminPanel = lazy(() => import('@/components/AdminPanel'));

const queryClient = new QueryClient();

const BASE_ROUTE_ANCHORS = [
  '/command-center',
  '/portal',
  '/auth',
  '/admin',
  '/service/',
  '/premium',
  '/engagement',
  '/settings',
];

const normalizeBaseCandidate = (candidate?: string | null): string | undefined => {
  if (!candidate) return undefined;
  const trimmed = candidate.trim();
  if (!trimmed) return undefined;
  if (trimmed === '/' || trimmed === './') return '/';

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'http://localhost';

  let rawPath: string | undefined;
  try {
    rawPath = new URL(trimmed, origin).pathname;
  } catch {
    if (trimmed.startsWith('/')) rawPath = trimmed;
  }

  if (!rawPath) return undefined;

  let path = rawPath.replace(/\/?index\.html$/, '');
  if (!path || path === '/') return '/';
  if (path.endsWith('/')) path = path.slice(0, -1);
  return path || '/';
};

const resolveBaseFromLocation = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  const { pathname } = window.location;
  const path = pathname.replace(/\/?index\.html$/, '');
  if (!path || path === '/') return '/';

  for (const anchor of BASE_ROUTE_ANCHORS) {
    const idx = path.indexOf(anchor);
    if (idx > 0) {
      const base = path.slice(0, idx);
      if (!base || base === '/') return '/';
      return base.endsWith('/') ? base.slice(0, -1) || '/' : base;
    }
  }

  return path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path || '/';
};

const deriveBaseName = (): string => {
  const envAny = (import.meta as any)?.env ?? {};
  const envCandidates = [
    envAny.VITE_BASE_NAME as string | undefined,
    envAny.VITE_BASE_PATH as string | undefined,
    envAny.VITE_BASE_URL as string | undefined,
    envAny.BASE_URL as string | undefined,
  ];

  for (const candidate of envCandidates) {
    const normalized = normalizeBaseCandidate(candidate);
    if (normalized) return normalized;
  }

  if (typeof document !== 'undefined') {
    const baseTagHref = document.querySelector?.('base')?.getAttribute?.('href');
    const normalizedBaseTag = normalizeBaseCandidate(baseTagHref);
    if (normalizedBaseTag) return normalizedBaseTag;

    const normalizedDocBase = normalizeBaseCandidate(document.baseURI);
    if (normalizedDocBase) return normalizedDocBase;
  }

  const locationDerived = resolveBaseFromLocation();
  return locationDerived ?? '/';
};

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
}

const App = () => {
  useEffect(() => {
    const cleanup = initializeMonitoring();
    return cleanup;
  }, []);

  useEffect(() => {
    let removeListener: (() => void) | undefined;

    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;
        const { App: CapApp } = await import('@capacitor/app');
        let lastBack = 0;
        const listener = await CapApp.addListener('backButton', ({ canGoBack }) => {
          const onRoot = window.location.pathname === '/';
          if (canGoBack || (!onRoot && window.history.length > 1)) {
            window.history.back();
            return;
          }
          const now = Date.now();
          if (now - lastBack < 1500) {
            CapApp.exitApp();
          } else {
            lastBack = now;
            try {
              sonnerToast('Press back again to exit');
            } catch {}
          }
        });
        removeListener = () => listener.remove();
      } catch {}
    })();

    return () => {
      try {
        removeListener?.();
      } catch {}
    };
  }, []);

  const baseName = deriveBaseName();

  return (
    <ErrorBoundary>
      <ErrorRecovery>
        <PerformanceProvider>
          <ThemeProvider>
            <AuthProvider>
              <ErrorProvider>
                <KeyboardProvider>
                  <I18nProvider>
                    <QueryClientProvider client={queryClient}>
                      <TooltipProvider>
                        <SkipLink />
                        <SupabaseConfigBanner />
                        <MobileOptimizations />
                        <Toaster />
                        <Sonner />
                        <BrowserRouter basename={baseName}>
                          <CommandPalette />
                          {process.env.NODE_ENV === 'development' && <AccessibilityChecker />}
                          <RouteTracker />
                          <OfflineIndicator />
                          <Suspense
                            fallback={
                              <div className="p-6">
                                <Skeleton className="mb-4 h-6 w-1/3" />
                                <Skeleton className="h-96 w-full" />
                              </div>
                            }
                          >
                            <Routes>
                              <Route path="/auth" element={<Auth />} />
                              <Route
                                path="/"
                                element={
                                  <ProtectedRoute>
                                    <Index />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/command-center"
                                element={
                                  <ProtectedRoute>
                                    <CommandCenter />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin"
                                element={
                                  <ProtectedRoute>
                                    <AdminPanel />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/service/:serviceId"
                                element={
                                  <ProtectedRoute>
                                    <PremiumServiceDetails />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/portal"
                                element={
                                  <ProtectedRoute>
                                    <Portal />
                                  </ProtectedRoute>
                                }
                              />
                              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </BrowserRouter>
                      </TooltipProvider>
                    </QueryClientProvider>
                  </I18nProvider>
                </KeyboardProvider>
              </ErrorProvider>
            </AuthProvider>
          </ThemeProvider>
        </PerformanceProvider>
      </ErrorRecovery>
    </ErrorBoundary>
  );
};

export default App;
