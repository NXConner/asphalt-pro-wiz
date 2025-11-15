export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
import { nanoid } from 'nanoid';

const LOG_PREFIX = '[PPS]';

function isDev(): boolean {
  return (
    import.meta?.env?.MODE === 'development' ||
    (typeof globalThis !== 'undefined' &&
      'process' in globalThis &&
      typeof (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
        ?.NODE_ENV === 'string' &&
      (globalThis as { process: { env: { NODE_ENV: string } } }).process.env.NODE_ENV ===
        'development')
  );
}

let globalContext: Record<string, unknown> = {};

function getDeviceId(): string {
  try {
    const key = 'pps:deviceId';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = nanoid(16);
    localStorage.setItem(key, id);
    return id;
  } catch {
    return 'unknown-device';
  }
}

function getSessionId(): string {
  try {
    const key = 'pps:sessionId';
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = nanoid(12);
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return 'unknown-session';
  }
}

export function setLogContext(context: Record<string, unknown>): void {
  globalContext = { ...globalContext, ...context };
}

export function logEvent(
  event: string,
  data?: Record<string, unknown>,
  level: LogLevel = 'info',
): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    deviceId: getDeviceId(),
    sessionId: getSessionId(),
    url: typeof location !== 'undefined' ? location.href : undefined,
    ...globalContext,
    ...data,
  };
  try {
    if (isDev()) {
      console.log(`${LOG_PREFIX} ${event}`, payload);
    }
    // Hook for production observability (no-op by default)
    const beaconUrl =
      typeof import.meta !== 'undefined' &&
      'env' in import.meta &&
      typeof (import.meta.env as { VITE_LOG_BEACON_URL?: string })?.VITE_LOG_BEACON_URL === 'string'
        ? (import.meta.env as { VITE_LOG_BEACON_URL: string }).VITE_LOG_BEACON_URL
        : undefined;
    if (beaconUrl && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(beaconUrl, blob);
    }
  } catch {
    // ignore
  }
}

export function logError(error: unknown, context?: Record<string, unknown>): void {
  const err =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { error };
  logEvent('error', { ...context, ...err }, 'error');
}

// Convenience API for web-vitals integration
export type WebVitalName = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';
export function logVital(name: WebVitalName, value: number, id?: string): void {
  const sampleRateEnv =
    typeof import.meta !== 'undefined' &&
    'env' in import.meta &&
    typeof (import.meta.env as { VITE_OBSERVABILITY_SAMPLE_RATE?: string })
      ?.VITE_OBSERVABILITY_SAMPLE_RATE === 'string'
      ? (import.meta.env as { VITE_OBSERVABILITY_SAMPLE_RATE: string })
          .VITE_OBSERVABILITY_SAMPLE_RATE
      : undefined;
  const sampleRate = Number(sampleRateEnv ?? 1);
  if (Number.isFinite(sampleRate) && Math.random() > sampleRate) return;
  logEvent('web_vital', { name, value, id });
}
