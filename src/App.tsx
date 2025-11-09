import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy, useEffect, useState, Fragment } from 'react';
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
import { FeatureFlagProvider } from '@/contexts/FeatureFlagProvider';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { KeyboardProvider } from '@/contexts/KeyboardContext';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { trackPageView } from '@/lib/analytics';
import { I18nProvider } from '@/lib/i18n';
import { logEvent } from '@/lib/logging';
import { initializeMonitoring } from '@/lib/monitoring';
import { installLovableAssetMonitoring } from '@/lib/monitoring/lovableAssets';
import { getRouterBaseName, subscribeToLovableConfig, isLovablePreviewRuntime } from '@/lib/routing/basePath';

// Route-level code splitting for faster initial load
const Index = lazy(() => import('./pages/Index'));
const PremiumServiceDetails = lazy(() => import('./pages/PremiumServiceDetails'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Portal = lazy(() => import('./pages/Portal/Portal'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const Auth = lazy(() => import('./pages/Auth'));
const AdminPanel = lazy(() => import('@/components/AdminPanel'));
import Health from './pages/Health';
import PreviewSafe from './pages/PreviewSafe';
const queryClient = new QueryClient();

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

  const [baseName, setBaseName] = useState(getRouterBaseName);

  useEffect(() => subscribeToLovableConfig(setBaseName), []);
  useEffect(() => installLovableAssetMonitoring(), []);

  const isPreviewEnv = isLovablePreviewRuntime();
  const Guard: React.ComponentType<{ children: React.ReactNode }> = isPreviewEnv ? Fragment : ProtectedRoute;
  const routerBase = isPreviewEnv ? '/' : baseName;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.routerBase = baseName;
    }
    if (typeof window !== 'undefined') {
      (window as typeof window & { __PPS_ROUTER_BASE?: string }).__PPS_ROUTER_BASE = baseName;
      // Debug: trace base routing
      try { console.debug('[App] Router base set', { baseName, path: window.location.pathname }); } catch {}
    }
    logEvent('lovable.routing.base', { baseName });
  }, [baseName]);

  return (
    <ErrorBoundary>
      <ErrorRecovery>
        <PerformanceProvider>
          <ThemeProvider>
              <AuthProvider>
                <FeatureFlagProvider>
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
                            <BrowserRouter basename={routerBase}>
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
                                    <Route path="/health" element={<Health />} />
                                    <Route
                                      path="/"
                                      element={
                                        isPreviewEnv ? (
                                          <PreviewSafe />
                                        ) : (
                                          <Guard>
                                            <Index />
                                          </Guard>
                                        )
                                      }
                                    />
                                    <Route
                                      path="/command-center"
                                      element={
                                        <Guard>
                                          <CommandCenter />
                                        </Guard>
                                      }
                                    />
                                    <Route
                                      path="/admin"
                                      element={
                                        <Guard>
                                          <AdminPanel />
                                        </Guard>
                                      }
                                    />
                                    <Route
                                      path="/service/:serviceId"
                                      element={
                                        <Guard>
                                          <PremiumServiceDetails />
                                        </Guard>
                                      }
                                    />
                                    <Route
                                      path="/portal"
                                      element={
                                        <Guard>
                                          <Portal />
                                        </Guard>
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
                </FeatureFlagProvider>
            </AuthProvider>
          </ThemeProvider>
        </PerformanceProvider>
      </ErrorRecovery>
    </ErrorBoundary>
  );
};

export default App;
