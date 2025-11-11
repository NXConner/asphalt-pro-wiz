export type LogLevel = "debug" | "info" | "warn" | "error";
import { nanoid } from "nanoid";

import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const LOG_PREFIX = "[PPS]";
const OBSERVABILITY_FUNCTION = "log-beacon";

type BooleanLike = string | number | boolean | undefined | null;

function isDev(): boolean {
  return (
    import.meta?.env?.MODE === "development" ||
    (globalThis as any)?.process?.env?.NODE_ENV === "development"
  );
}

function resolveBooleanFlag(value: BooleanLike, fallback = false): boolean {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "1" || normalized === "true" || normalized === "yes") return true;
    if (normalized === "0" || normalized === "false" || normalized === "no") return false;
    return fallback;
  }
  if (typeof value === "number") {
    if (Number.isNaN(value)) return fallback;
    return value !== 0;
  }
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function getRuntimeEnv(): Record<string, unknown> {
  if (typeof import.meta !== "undefined" && (import.meta as any)?.env) {
    return (import.meta as any).env as Record<string, unknown>;
  }
  if ((globalThis as any)?.process?.env) {
    return (globalThis as any).process.env as Record<string, unknown>;
  }
  return {};
}

function getEnvironment(): string {
  const env = getRuntimeEnv();
  const explicit =
    (env.VITE_APP_ENV as string | undefined) ??
    (env.VITE_RUNTIME_ENV as string | undefined) ??
    (env.APP_ENV as string | undefined);
  if (explicit) return explicit;
  const mode = (env.MODE as string | undefined) ?? (env.NODE_ENV as string | undefined);
  return mode ?? "production";
}

const OBSERVABILITY_ENABLED = resolveBooleanFlag(
  (getRuntimeEnv().VITE_FLAG_OBSERVABILITY ??
    getRuntimeEnv().FLAG_OBSERVABILITY ??
    getRuntimeEnv().PPS_FLAG_OBSERVABILITY ??
    1) as BooleanLike,
  true,
);

function getObservabilitySampleRate(): number {
  const raw =
    Number(
      getRuntimeEnv().VITE_OBSERVABILITY_SAMPLE_RATE ??
        getRuntimeEnv().OBSERVABILITY_SAMPLE_RATE ??
        1,
    ) || 0;
  if (!Number.isFinite(raw)) return 0;
  if (raw <= 0) return 0;
  if (raw >= 1) return 1;
  return raw;
}

const OBSERVABILITY_SAMPLE_RATE = getObservabilitySampleRate();

let globalContext: Record<string, unknown> = {};

function getDeviceId(): string {
  try {
    const key = "pps:deviceId";
    const existing = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
    if (existing) return existing;
    const id = nanoid(16);
    localStorage.setItem(key, id);
    return id;
  } catch {
    return "unknown-device";
  }
}

function getSessionId(): string {
  try {
    const key = "pps:sessionId";
    const existing = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(key) : null;
    if (existing) return existing;
    const id = nanoid(12);
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return "unknown-session";
  }
}

function shouldShipToSupabase(event: string): boolean {
  if (typeof window === "undefined") return false;
  if (!OBSERVABILITY_ENABLED || !isSupabaseConfigured) return false;
  if (!event) return false;
  if (event.startsWith("lovable.asset_")) {
    return true;
  }
  if (OBSERVABILITY_SAMPLE_RATE >= 1) {
    return true;
  }
  if (OBSERVABILITY_SAMPLE_RATE <= 0) {
    return false;
  }
  return Math.random() <= OBSERVABILITY_SAMPLE_RATE;
}

function dispatchToSupabase(payload: Record<string, unknown>) {
  try {
    const event = typeof payload.event === "string" ? payload.event : "";
    if (!shouldShipToSupabase(event)) return;
    if (!isSupabaseConfigured()) return;
    
    void supabase.functions.invoke(OBSERVABILITY_FUNCTION, { body: payload }).catch((error: unknown) => {
      // Silently ignore CORS errors and network failures in development
      // These are expected when Supabase functions aren't configured for localhost
      if (isDev()) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isExpectedError = 
          errorMessage.includes('CORS') ||
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('ERR_FAILED');
        
        if (!isExpectedError) {
          console.warn(`${LOG_PREFIX} failed to send observability payload`, error);
        }
      }
    });
  } catch (error) {
    // Silently ignore errors in development (expected when services aren't configured)
    if (!isDev()) {
      console.warn(`${LOG_PREFIX} dispatchToSupabase error`, error);
    }
  }
}

export function setLogContext(context: Record<string, unknown>): void {
  globalContext = { ...globalContext, ...context };
}

export function logEvent(
  event: string,
  data?: Record<string, unknown>,
  level: LogLevel = "info",
): void {
  const pageUrl = typeof location !== "undefined" ? location.href : undefined;
  const referrer = typeof document !== "undefined" ? document.referrer : undefined;
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
  const locale = typeof navigator !== "undefined" ? navigator.language : undefined;
  const networkState =
    typeof navigator !== "undefined" && typeof navigator.onLine === "boolean"
      ? navigator.onLine
        ? "online"
        : "offline"
      : undefined;

  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    event,
    environment: getEnvironment(),
    deviceId: getDeviceId(),
    sessionId: getSessionId(),
    pageUrl,
    referrer,
    userAgent,
    locale,
    networkState,
    ...globalContext,
    ...data,
  };

  if (pageUrl !== undefined && !('url' in payload)) {
    payload.url = pageUrl;
  }

  try {
    if (isDev()) {
      console.log(`${LOG_PREFIX} ${event}`, payload);
    }

    // Only try beacon if URL is configured and not pointing to localhost (which may not be running)
    const beaconUrl = (import.meta as any)?.env?.VITE_LOG_BEACON_URL;
    if (!beaconUrl || typeof navigator === "undefined" || !("sendBeacon" in navigator)) {
      return; // Skip if no beacon URL or sendBeacon not available
    }
    
    const url = String(beaconUrl).trim();
    if (!url || url === 'undefined' || url === 'null') return; // Skip if empty or invalid
    
    // Skip ALL localhost beacon URLs - they're not useful in production and cause errors in development
    // Localhost beacons should only be used in local development with a running server
    // Check multiple patterns to catch all localhost variations (case-insensitive)
    const normalizedUrl = url.toLowerCase().trim();
    
    // Comprehensive localhost detection
    const isLocalhostUrl = 
      normalizedUrl.includes('localhost') || 
      normalizedUrl.includes('127.0.0.1') || 
      normalizedUrl.includes('::1') ||
      normalizedUrl.includes('[::1]') ||
      normalizedUrl.startsWith('http://localhost') ||
      normalizedUrl.startsWith('http://127.0.0.1') ||
      normalizedUrl.startsWith('https://localhost') ||
      normalizedUrl.startsWith('https://127.0.0.1') ||
      /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|::1)(:|\/|$)/.test(normalizedUrl);
    
    if (isLocalhostUrl) {
      return; // Never attempt localhost beacons - they cause connection refused errors
    }
    
    // Only attempt beacon for non-localhost URLs
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const sent = navigator.sendBeacon(url, blob);
      // sendBeacon returns false if it couldn't queue the request, but we can't prevent browser console errors
      if (!sent && isDev()) {
        // Beacon was rejected - likely CORS or network issue, but don't log to avoid noise
      }
    } catch (error) {
      // Silently ignore beacon errors (expected when server isn't running)
      // Browser will log network errors, but we won't add to the noise
    }

    dispatchToSupabase(payload);
  } catch (error) {
    if (isDev()) {
      console.warn(`${LOG_PREFIX} logEvent error`, error);
    }
  }
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const err =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { error };
  logEvent("error", { ...context, ...err }, "error");
}

// Convenience API for web-vitals integration
export type WebVitalName = "CLS" | "FID" | "LCP" | "FCP" | "TTFB" | "INP";
export function logVital(name: WebVitalName, value: number, id?: string): void {
  const sampleRate =
    Number((import.meta as any)?.env?.VITE_OBSERVABILITY_SAMPLE_RATE ?? 1) || 1;
  if (Number.isFinite(sampleRate) && Math.random() > sampleRate) return;
  logEvent("web_vital", { name, value, id });
}
