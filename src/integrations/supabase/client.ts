import { createClient } from '@supabase/supabase-js';

import type { Database } from './types';

type EnvRecord = Record<string, string | undefined>;

const metaEnv = (import.meta as unknown as { env?: EnvRecord })?.env ?? {};
const nodeEnv = typeof process !== 'undefined' ? (process.env as EnvRecord) : {};

const SUPABASE_URL =
  metaEnv.VITE_SUPABASE_URL?.trim() || nodeEnv.VITE_SUPABASE_URL?.trim() || '';

const SUPABASE_PUBLISHABLE_KEY =
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  metaEnv.VITE_SUPABASE_ANON_KEY?.trim() ||
  nodeEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  nodeEnv.VITE_SUPABASE_ANON_KEY?.trim() ||
  '';

if (!SUPABASE_URL) {
  throw new Error(
    'Supabase configuration missing: set VITE_SUPABASE_URL in your environment to initialize the client.',
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Supabase configuration missing: set VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) to initialize the client.',
  );
}

const authStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : undefined;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
