import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

const runtimeEnv =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env) ||
  (typeof process !== 'undefined' ? process.env : {});

const SUPABASE_URL =
  (runtimeEnv?.VITE_SUPABASE_URL as string | undefined) ||
  (runtimeEnv?.SUPABASE_URL as string | undefined) ||
  '';

const SUPABASE_BROWSER_KEY =
  (runtimeEnv?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (runtimeEnv?.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (runtimeEnv?.SUPABASE_ANON_KEY as string | undefined) ||
  '';

if (!SUPABASE_URL || !SUPABASE_BROWSER_KEY) {
  throw new Error(
    'Supabase environment not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your environment before starting the app.',
  );
}

const authStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : undefined;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_BROWSER_KEY, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
