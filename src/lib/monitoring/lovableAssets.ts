import { logEvent } from '@/lib/logging';
import { isLovableHost } from '@/lib/routing/basePath';

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

export const installLovableAssetMonitoring = (): (() => void) => {
  if (typeof window === 'undefined' || !isLovableHost()) {
    return () => {};
  }

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
  };
};
