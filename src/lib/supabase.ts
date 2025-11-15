import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';

import { supabase } from '@/integrations/supabase/client';

export type { SupabaseClient };

export interface SupabaseClients {
  browser: SupabaseClient | null;
}

let cached: SupabaseClients | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (cached?.browser !== undefined && cached !== null) return cached.browser;
  const url =
    typeof import.meta !== 'undefined' &&
    'env' in import.meta &&
    typeof (import.meta.env as { VITE_SUPABASE_URL?: string })?.VITE_SUPABASE_URL === 'string'
      ? (import.meta.env as { VITE_SUPABASE_URL: string }).VITE_SUPABASE_URL
      : undefined;
  const key =
    typeof import.meta !== 'undefined' &&
    'env' in import.meta &&
    typeof (import.meta.env as { VITE_SUPABASE_ANON_KEY?: string })?.VITE_SUPABASE_ANON_KEY ===
      'string'
      ? (import.meta.env as { VITE_SUPABASE_ANON_KEY: string }).VITE_SUPABASE_ANON_KEY
      : undefined;
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

/**
 * Supabase utility functions for common operations
 */

export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

/**
 * Safe query wrapper with error handling
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
): Promise<QueryResult<T>> {
  try {
    const result = await queryFn();
    return result;
  } catch (error) {
    console.error('Query error:', error);
    return {
      data: null,
      error: error as PostgrestError,
    };
  }
}

/**
 * Check if user has permission to access resource
 */
export async function checkPermission(
  table: string,
  id: string | number,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase.from(table).select('user_id').eq('id', id).single();

  if (error || !data) return false;
  return (data as { user_id?: string }).user_id === userId;
}

/**
 * Upload file to Supabase storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

/**
 * Delete file from Supabase storage
 */
export async function deleteFile(bucket: string, path: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Batch insert with transaction support
 */
export async function batchInsert<T>(
  table: string,
  records: Partial<T>[],
): Promise<QueryResult<T[]>> {
  return safeQuery(async () => {
    const { data, error } = await (supabase.from(table as any) as any)
      .insert(records as any)
      .select();
    return { data: data as T[] | null, error };
  });
}

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Realtime subscription helper
 */
export function subscribeToTable<T>(
  table: string,
  callback: (payload: T) => void,
  filters?: Record<string, string | number | boolean>,
) {
  const channel = supabase.channel(`${table}_changes`).on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table,
      ...(filters && {
        filter: Object.entries(filters)
          .map(([k, v]) => `${k}=eq.${v}`)
          .join(','),
      }),
    },
    (payload) => callback(payload.new as T),
  );

  channel.subscribe();

  return () => {
    channel.unsubscribe();
  };
}
