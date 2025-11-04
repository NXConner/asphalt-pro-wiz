import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FallbackUIProps {
  error: Error;
  resetError: () => void;
}

export function FallbackUI({ error, resetError }: FallbackUIProps) {
  const isDev = import.meta.env.DEV;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            An error occurred while rendering this component. Please try refreshing the page.
          </CardDescription>
        </CardHeader>

        {isDev && (
          <CardContent className="space-y-2">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-semibold text-destructive">{error.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
            </div>
            {error.stack && (
              <details className="cursor-pointer text-xs">
                <summary className="font-semibold">Stack trace</summary>
                <pre className="mt-2 overflow-auto rounded-md bg-muted p-2 text-xs">
                  {error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        )}

        <CardFooter className="flex gap-2">
          <Button onClick={resetError} variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline">
            Go home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
