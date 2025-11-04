import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const envAny = (import.meta as any)?.env ?? (globalThis as any)?.process?.env ?? {};

const SUPABASE_URL =
  (envAny.VITE_SUPABASE_URL as string | undefined) ?? "https://vodglzbgqsafghlihivy.supabase.co";
const SUPABASE_ANON_KEY =
  (envAny.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGdsemJncXNhZmdobGloaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDcwMDQsImV4cCI6MjA2NDkyMzAwNH0.uLAZ_zY3zY-QmDDXwkAuspCUW9NpotsTV5fVCiHf5mM";

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  } satisfies Storage;
}

function resolveStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const { localStorage } = window;
    const probeKey = "pps:supabase:probe";
    localStorage.setItem(probeKey, "1");
    localStorage.removeItem(probeKey);
    return localStorage;
  } catch (error) {
    console.warn("LocalStorage unavailable, using in-memory Supabase session store.", error);
    return createMemoryStorage();
  }
}

const storage = resolveStorage();

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    persistSession: Boolean(storage),
    autoRefreshToken: true,
  },
});
