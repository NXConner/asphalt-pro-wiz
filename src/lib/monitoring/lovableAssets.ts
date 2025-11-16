import { logEvent } from '@/lib/logging';
import { isLovableHost } from '@/lib/routing/basePath';
import { runtimeEnv } from '@/lib/runtimeEnv';
import type { LovablePreviewHealthSnapshot, LovablePreviewHealthStatus } from '@/types/lovablePreview';

type AssetLikeElement =
  | HTMLImageElement
  | HTMLScriptElement
  | HTMLLinkElement
  | HTMLSourceElement
  | HTMLVideoElement
  | HTMLAudioElement;

const extractUrl = (target: EventTarget | null): { url: string; tag: string } | null => {
  if (!target || typeof (target as Partial<Element>).tagName !== 'string') {
    return null;
  }

  const element = target as Partial<AssetLikeElement> & Element;
  const tag = element.tagName?.toLowerCase?.() ?? 'unknown';

  if ('src' in element && typeof element.src === 'string' && element.src) {
    return { url: element.src, tag };
  }

  if ('currentSrc' in element && typeof element.currentSrc === 'string' && element.currentSrc) {
    return { url: element.currentSrc, tag };
  }

  if ('href' in element && typeof element.href === 'string' && element.href) {
    return { url: element.href, tag };
  }

  return null;
};

const HEARTBEAT_EVENT_NAME = 'lovable:previewHealth';
const HEARTBEAT_PING_EVENT_NAME = 'lovable:previewHealth:ping';

const parseNumber = (value: unknown, fallback: number): number => {
  const parsed = typeof value === 'string' ? Number(value) : Number(value ?? NaN);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const heartbeatIntervalMs = parseNumber(runtimeEnv.VITE_PREVIEW_HEARTBEAT_INTERVAL_MS, 15000);
const heartbeatTimeoutMs = parseNumber(runtimeEnv.VITE_PREVIEW_HEALTH_TIMEOUT_MS, 90000);
const heartbeatUrl =
  (runtimeEnv.VITE_HEALTHCHECK_URL as string | undefined) ||
  (typeof window !== 'undefined' ? `${window.location.origin}/health` : '/health');

const defaultSnapshot: LovablePreviewHealthSnapshot = {
  status: 'unknown',
  failures: 0,
  url: heartbeatUrl,
};

const emitPreviewHealth = (snapshot: LovablePreviewHealthSnapshot) => {
  if (typeof window === 'undefined') return;
  const win = window as typeof window & { __PPS_PREVIEW_HEALTH?: LovablePreviewHealthSnapshot };
  win.__PPS_PREVIEW_HEALTH = snapshot;
  try {
    window.dispatchEvent(new CustomEvent<LovablePreviewHealthSnapshot>(HEARTBEAT_EVENT_NAME, { detail: snapshot }));
  } catch {
    // no-op
  }
};

const startPreviewHeartbeat = (): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  let failureCount = 0;
  let isShuttingDown = false;
  emitPreviewHealth(defaultSnapshot);

  const maxFailuresBeforeError = Math.max(1, Math.ceil(heartbeatTimeoutMs / heartbeatIntervalMs));

  const computeStatus = (failures: number): LovablePreviewHealthStatus => {
    if (failures <= 0) return 'healthy';
    if (failures >= maxFailuresBeforeError) return 'error';
    return 'warning';
  };

  const ping = async () => {
    if (isShuttingDown) return;
    const controller =
      typeof AbortController !== 'undefined'
        ? new AbortController()
        : ({ abort() {}, signal: undefined as AbortSignal | undefined } as AbortController);
    const timer =
      typeof window !== 'undefined'
        ? window.setTimeout(() => controller.abort(), heartbeatTimeoutMs)
        : undefined;
    try {
      const response = await fetch(heartbeatUrl, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (timer) window.clearTimeout(timer);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      failureCount = 0;
      const snapshot: LovablePreviewHealthSnapshot = {
        status: 'healthy',
        lastHeartbeat: new Date().toISOString(),
        message: undefined,
        failures: failureCount,
        url: heartbeatUrl,
      };
      emitPreviewHealth(snapshot);
      logEvent('lovable.preview.health.success', snapshot);
    } catch (error) {
      failureCount += 1;
      const status = computeStatus(failureCount);
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'Preview heartbeat failed';
      const snapshot: LovablePreviewHealthSnapshot = {
        status,
        lastHeartbeat: undefined,
        message,
        failures: failureCount,
        url: heartbeatUrl,
      };
      emitPreviewHealth(snapshot);
      logEvent(
        'lovable.preview.health.failure',
        {
          status,
          failures: failureCount,
          message,
          url: heartbeatUrl,
        },
        status === 'error' ? 'error' : 'warn',
      );
    }
  };

  const intervalId = window.setInterval(ping, heartbeatIntervalMs);
  window.addEventListener(HEARTBEAT_PING_EVENT_NAME, ping as EventListener);
  ping().catch(() => {});

  return () => {
    isShuttingDown = true;
    window.clearInterval(intervalId);
    window.removeEventListener(HEARTBEAT_PING_EVENT_NAME, ping as EventListener);
  };
};

export const installLovableAssetMonitoring = (): (() => void) => {
  if (typeof window === 'undefined' || !isLovableHost()) {
    return () => {};
  }

  const cleanupHeartbeat = startPreviewHeartbeat();

  const pageUrl = typeof location !== 'undefined' ? location.href : undefined;
  try {
    logEvent('lovable.asset_monitoring.enabled', {
      pageUrl,
      timestamp: new Date().toISOString(),
      host: window.location?.host,
    });
  } catch {
    // ignore bootstrap logging failures
  }

  const handleResourceError = (event: Event) => {
    const details = extractUrl(event.target);
    if (!details) {
      logEvent(
        'lovable.asset_load_error.unresolved',
        {
          pageUrl,
          timestamp: new Date().toISOString(),
          phase: event.type,
        },
        'warn',
      );
      return;
    }

    const errorMeta =
      event instanceof ErrorEvent
        ? {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          }
        : {};

    logEvent(
      'lovable.asset_load_error',
      {
        assetUrl: details.url,
        assetTag: details.tag,
        pageUrl,
        timestamp: new Date().toISOString(),
        networkState:
          typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
            ? navigator.onLine
              ? 'online'
              : 'offline'
            : undefined,
        ...errorMeta,
      },
      'error',
    );
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    let reasonValue: string | undefined;
    if (event.reason instanceof Error) {
      reasonValue = event.reason.message;
    } else if (typeof event.reason === 'string') {
      reasonValue = event.reason;
    } else {
      try {
        reasonValue = JSON.stringify(event.reason);
      } catch {
        reasonValue = String(event.reason ?? 'unknown');
      }
    }

    logEvent(
      'lovable.asset_promise_rejection',
      {
        reason: reasonValue ?? 'unknown',
        stack: event.reason?.stack,
        pageUrl,
        timestamp: new Date().toISOString(),
      },
      'error',
    );
  };

    window.addEventListener('error', handleResourceError, true);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleResourceError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
      cleanupHeartbeat();
    };
  };
