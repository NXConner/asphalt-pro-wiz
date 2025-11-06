import { ShieldAlert } from 'lucide-react';

import {
  isSupabaseConfigured,
  supabaseConfigurationError,
  SUPABASE_CONFIGURATION_MESSAGE,
} from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function SupabaseConfigBanner() {
  if (isSupabaseConfigured) {
    return null;
  }

  const message = supabaseConfigurationError?.message ?? SUPABASE_CONFIGURATION_MESSAGE;

  return (
    <Alert
      variant="destructive"
      role="alert"
      className="rounded-none border-x-0 border-t-0 border-b px-4 py-3"
    >
      <AlertTitle className="flex items-center gap-2 text-base">
        <ShieldAlert className="h-5 w-5" aria-hidden />
        Supabase configuration required
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2 text-left text-sm">
          <p>{message}</p>
          <p>
            Copy <code>.env.example</code> to <code>.env</code>, provide the Supabase URL and browser key
            tied to your Virginia and North Carolina deployments, then refresh the running dev server
            so the new environment variables load.
          </p>
          <p className="font-medium">
            Required keys:&nbsp;
            <code>VITE_SUPABASE_URL</code>,&nbsp;
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> (or <code>VITE_SUPABASE_ANON_KEY</code>).
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
