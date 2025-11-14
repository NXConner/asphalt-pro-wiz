import { Component, type ErrorInfo, type ReactNode } from "react";

import { logError } from "@/lib/logging";

type FallbackRender = (args: { error: Error | null; reset: () => void }) => ReactNode;

interface Props {
  children: ReactNode;
  fallback?: ReactNode | FallbackRender;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced Error Boundary with recovery, logging, and better UX
 * 
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error, info) => console.error(error, info)}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { 
    hasError: false, 
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to monitoring service
    logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Store error info for display
    this.setState({ errorInfo });
  }

    handleReset = (): void => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    };

    handleReload = (): void => {
      window.location.reload();
    };

    render() {
      if (this.state.hasError) {
        // Use custom fallback if provided
        if (this.props.fallback) {
          if (typeof this.props.fallback === 'function') {
            return (this.props.fallback as FallbackRender)({
              error: this.state.error,
              reset: this.handleReset,
            });
          }
          return this.props.fallback;
        }

        // Default error UI with accessibility
        return (
          <div
            className="min-h-screen flex items-center justify-center p-8 text-center"
            role="alert"
            aria-live="assertive"
          >
            <div className="max-w-md">
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                We encountered an unexpected error. Please try refreshing the page or contact support
                if the problem persists.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                    {this.state.error.toString()}
                    {this.state.error.stack && (
                      <>
                        {'\n\n'}
                        {this.state.error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
              <div className="flex justify-center gap-3">
                <button
                  className="rounded-md border px-4 py-2 transition-colors hover:bg-muted"
                  onClick={this.handleReset}
                  type="button"
                >
                  Try Again
                </button>
                <button
                  className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                  onClick={this.handleReload}
                  type="button"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
}
