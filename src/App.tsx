import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PremiumServiceDetails from "./pages/PremiumServiceDetails";
import { useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { I18nProvider } from "@/lib/i18n";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

  return (
    <ErrorBoundary>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/service/:serviceId" element={<PremiumServiceDetails />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
};

export default App;
