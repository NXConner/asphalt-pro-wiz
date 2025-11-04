import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 w-auto z-50 animate-fade-in">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        You're offline. Some features may not work.
      </AlertDescription>
    </Alert>
  );
}
