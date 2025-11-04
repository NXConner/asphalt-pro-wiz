import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { toast as sonnerToast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PerformanceProvider } from "@/contexts/PerformanceContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { trackPageView } from "@/lib/analytics";

// Route-level code splitting for faster initial load
const Index = lazy(() => import("./pages/Index"));
const PremiumServiceDetails = lazy(() => import("./pages/PremiumServiceDetails"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Portal = lazy(() => import("./pages/Portal/Portal"));
const CommandCenter = lazy(() => import("./pages/CommandCenter"));
const Auth = lazy(() => import("./pages/Auth"));

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
    let removeListener: (() => void) | undefined;
    // Register Android hardware back button handler when running natively
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        const { App } = await import("@capacitor/app");
        let lastBack = 0;
        const listener = await App.addListener("backButton", ({ canGoBack }) => {
          const onRoot = location.pathname === "/";
          if (canGoBack || (!onRoot && window.history.length > 1)) {
            window.history.back();
            return;
          }
          const now = Date.now();
          if (now - lastBack < 1500) {
            App.exitApp();
          } else {
            lastBack = now;
            try {
              sonnerToast("Press back again to exit");
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

  // Ensure routing works when the app is served from a sub-path (e.g., lovable.dev preview)
  const baseName = (() => {
    try {
      // Prefer Vite's injected BASE_URL when available, otherwise derive from document.baseURI
      const envAny = (import.meta as any)?.env ?? {};
      const envBase =
        (envAny.BASE_URL as string | undefined) || (envAny.VITE_BASE_URL as string | undefined);
      if (envBase && envBase !== "/") {
        // Treat './' (relative base) as root for router basename
        const cleaned = envBase === "./" ? "/" : envBase;
        return cleaned.replace(/\/$/, "");
      }
      let { pathname } = new URL(document.baseURI);
      // Strip index.html if present
      pathname = pathname.replace(/\/?index\.html$/, "");
      if (!pathname || pathname === "/") return "/";
      return pathname.replace(/\/$/, "");
    } catch {
      return "/";
    }
  })();

    return (
      <ErrorBoundary>
        <PerformanceProvider>
          <ThemeProvider>
            <AuthProvider>
              <I18nProvider>
                <QueryClientProvider client={queryClient}>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter basename={baseName}>
                      <RouteTracker />
                      <OfflineIndicator />
                      <Suspense
                        fallback={
                          <div className="p-6">
                            <Skeleton className="h-6 w-1/3 mb-4" />
                            <Skeleton className="h-96 w-full" />
                          </div>
                        }
                      >
                        <Routes>
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/" element={<Index />} />
                          <Route path="/command-center" element={<CommandCenter />} />
                          <Route path="/service/:serviceId" element={<PremiumServiceDetails />} />
                          <Route path="/portal" element={<Portal />} />
                          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </BrowserRouter>
                  </TooltipProvider>
                </QueryClientProvider>
              </I18nProvider>
            </AuthProvider>
          </ThemeProvider>
        </PerformanceProvider>
      </ErrorBoundary>
    );
};

export default App;
