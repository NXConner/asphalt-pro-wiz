import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PanelErrorBoundaryProps {
  title: string;
  children: ReactNode;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function PanelErrorBoundary({
  title,
  children,
  description = 'We were unable to render this panel. Try again to reload the data.',
  onRetry,
  className,
}: PanelErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ reset }) => (
        <div
          role="alert"
          className={cn(
            'rounded-3xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive-foreground shadow-[0_24px_60px_rgba(22,8,2,0.4)] backdrop-blur',
            className,
          )}
        >
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-destructive/20 p-2 text-destructive-foreground">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-[0.35em] text-destructive-foreground/70">
                {title}
              </p>
              <h3 className="text-base font-semibold">Panel offline</h3>
              <p className="text-sm text-destructive-foreground/80">{description}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="border border-destructive/40 text-destructive-foreground hover:bg-destructive/20"
                  onClick={() => {
                    reset();
                    onRetry?.();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry {title}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
