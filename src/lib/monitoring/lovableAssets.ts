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

  const handleResourceError = (event: Event) => {
    const details = extractUrl(event.target);
    if (!details) return;

    logEvent(
      'lovable.asset_load_error',
      {
        ...details,
        timestamp: Date.now(),
      },
      'warn',
    );
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    logEvent(
      'lovable.asset_promise_rejection',
      {
        reason: event.reason?.message ?? String(event.reason ?? 'unknown'),
        timestamp: Date.now(),
      },
      'warn',
    );
  };

  window.addEventListener('error', handleResourceError, true);
  window.addEventListener('unhandledrejection', handleRejection);

  return () => {
    window.removeEventListener('error', handleResourceError, true);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
};
