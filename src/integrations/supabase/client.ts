import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './types';

import { isDemoModeEnabled } from '@/lib/runtimeEnv';


const runtimeEnv =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env) ||
  (typeof process !== 'undefined' ? process.env : {});

const DEFAULT_SUPABASE_URL = 'https://vodglzbgqsafghlihivy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM';

const SUPABASE_URL =
  (runtimeEnv?.VITE_SUPABASE_URL as string | undefined) ||
  (runtimeEnv?.SUPABASE_URL as string | undefined) ||
  DEFAULT_SUPABASE_URL;

const SUPABASE_BROWSER_KEY =
  (runtimeEnv?.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (runtimeEnv?.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (runtimeEnv?.SUPABASE_ANON_KEY as string | undefined) ||
  DEFAULT_SUPABASE_ANON_KEY;
const demoModeEnabled = isDemoModeEnabled();

export const SUPABASE_CONFIGURATION_MESSAGE =
  'Supabase environment not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) before starting the app.';

export class SupabaseConfigurationError extends Error {
  constructor(message = SUPABASE_CONFIGURATION_MESSAGE) {
    super(message);
    this.name = 'SupabaseConfigurationError';
  }
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_BROWSER_KEY);

export const supabaseConfigurationError =
  isSupabaseConfigured || demoModeEnabled ? null : new SupabaseConfigurationError();

const createDemoClient = (): SupabaseClient<Database> => {
  const createQueryBuilder = () => {
    const builder: any = {
      select: () => builder,
      insert: () => builder,
      upsert: () => builder,
      update: () => builder,
      delete: () => builder,
      eq: () => builder,
      neq: () => builder,
      in: () => builder,
      overlap: () => builder,
      order: () => builder,
      limit: () => builder,
      returns: () => builder,
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      single: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: (value: { data: unknown; error: null }) => void) => {
        resolve({ data: [], error: null });
      },
    };
    return builder;
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_callback) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: async () => ({ data: { session: null }, error: null }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => createQueryBuilder(),
    channel: () => {
      const channel: any = {
        on: () => channel,
        subscribe: () => channel,
        unsubscribe: () => {},
      };
      return channel;
    },
    rpc: () => ({
      then: (resolve: (value: { data: unknown; error: null }) => void) =>
        resolve({ data: null, error: null }),
    }),
    functions: {
      invoke: async () => ({ data: null, error: null }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: '' }, error: null }),
        remove: async () => ({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
     
  } as unknown as SupabaseClient<Database>;
};

const createStubProxy = (): SupabaseClient<Database> => {
  const error = supabaseConfigurationError ?? new SupabaseConfigurationError();

  const buildThrower = () =>
    new Proxy(
      () => {
        throw error;
      },
      {
        get: () => buildThrower(),
        apply: () => {
          throw error;
        },
      },
    );

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
  : demoModeEnabled
    ? createDemoClient()
    : createStubProxy();

if (!isSupabaseConfigured && !demoModeEnabled) {
  console.error(SUPABASE_CONFIGURATION_MESSAGE);
}
