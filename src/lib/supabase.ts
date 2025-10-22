import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type { SupabaseClient };

export interface SupabaseClients {
  browser: SupabaseClient | null;
}

let cached: SupabaseClients | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (cached?.browser !== undefined && cached !== null) return cached.browser;
  const url = (import.meta as any)?.env?.VITE_SUPABASE_URL as string | undefined;
  const key = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) {
    cached = { browser: null };
    return null;
  }
  const client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  cached = { browser: client };
  return client;
}
