import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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

export const SUPABASE_CONFIGURATION_MESSAGE =
  'Supabase environment not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) before starting the app.';

export class SupabaseConfigurationError extends Error {
  constructor(message = SUPABASE_CONFIGURATION_MESSAGE) {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_BROWSER_KEY);

export const supabaseConfigurationError = isSupabaseConfigured
  ? null
  : new SupabaseConfigurationError();

const createStubProxy = (): SupabaseClient<Database> => {
  const error = supabaseConfigurationError ?? new SupabaseConfigurationError();

  const buildThrower = () =>
    new Proxy(() => {
      throw error;
    }, {
      get: () => buildThrower(),
      apply: () => {
        throw error;
      },
    });

  return new Proxy({} as SupabaseClient<Database>, {
    get: (_target, property) => {
      if (property === 'then') {
        return undefined;
      }
      return buildThrower();
    },
  });
};

const authStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : undefined;

export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_BROWSER_KEY, {
      auth: {
        storage: authStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createStubProxy();

if (!isSupabaseConfigured) {
  console.error(SUPABASE_CONFIGURATION_MESSAGE);
}
