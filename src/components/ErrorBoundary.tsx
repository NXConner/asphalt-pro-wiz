import { Component, type ErrorInfo, type ReactNode } from 'react';

import { logError } from '@/lib/logging';
import type { AppError, ErrorContext } from '@/types';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): Pick<State, 'hasError' | 'error'> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error with context
    const errorContext: ErrorContext = {
      error: error as AppError,
      timestamp: Date.now(),
      componentStack: errorInfo.componentStack,
    };

    logError(error, errorContext);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Store error info for display
    this.setState({ errorInfo });
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default error UI
      return (
        <div
          className="min-h-screen flex items-center justify-center p-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Error Details
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-2 rounded-md border bg-primary text-primary-foreground hover:bg-primary-hover"
                onClick={this.resetError}
                type="button"
              >
                Try Again
              </button>
              <button
                className="px-4 py-2 rounded-md border"
                onClick={() => {
                  window.location.reload();
                }}
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
