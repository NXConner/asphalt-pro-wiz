// @ts-nocheck - Uses window/document with typeof guards for non-DOM runtimes
import { runtimeEnv } from '../runtimeEnv';

const LOVABLE_HOST_REGEX = /(^|\.)lovable(?:project\.com|\.app|\.dev)$/i;

type LovableGlobal =
  | {
      basePath?: string;
      paths?: { base?: string };
      context?: { basePath?: string };
    }
  | undefined;

const lovables = (): LovableGlobal => {
  if (typeof window === 'undefined') return undefined;
  const win = window as Window & {
    __LOVABLE__?: LovableGlobal;
    lovable?: { basePath?: string };
  };
  return win.__LOVABLE__ ?? win.lovable ?? undefined;
};

const envCandidates = (): Array<string | undefined> => {
  const envAny = (typeof import.meta !== 'undefined' && (import.meta as any)?.env) || {};
  return [
    runtimeEnv.VITE_LOVABLE_BASE_PATH as string | undefined,
    runtimeEnv.LOVABLE_BASE_PATH as string | undefined,
    envAny.VITE_LOVABLE_BASE_PATH as string | undefined,
    envAny.LOVABLE_BASE_PATH as string | undefined,
    envAny.VITE_BASE_NAME as string | undefined,
    envAny.VITE_BASE_PATH as string | undefined,
    envAny.BASE_URL as string | undefined,
  ];
};

const normalizeBaseCandidate = (candidate?: string | null): string | undefined => {
  if (!candidate) return undefined;
  const trimmed = candidate.trim();
  if (!trimmed) return undefined;
  if (trimmed === '.' || trimmed === './') return '/';
  if (trimmed === '/') return '/';
  try {
    const origin =
      typeof window !== 'undefined' && (window as Window).location?.origin
        ? (window as Window).location.origin
        : 'http://localhost';
    const url = new URL(trimmed, origin);
    return url.pathname.replace(/\/?index\.html$/, '').replace(/\/+$/, '') || '/';
  } catch {
    if (trimmed.startsWith('/')) {
      return trimmed.replace(/\/?index\.html$/, '').replace(/\/+$/, '') || '/';
    }
  }
  return undefined;
};

const resolveBaseFromLocation = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  const { pathname } = (window as Window).location ?? { pathname: '/' };
  const path = pathname.replace(/\/?index\.html$/, '');
  if (!path || path === '/') return '/';

  const anchors = [
    '/command-center',
    '/portal',
    '/auth',
    '/admin',
    '/service/',
    '/premium',
    '/engagement',
    '/settings',
  ];

  for (const anchor of anchors) {
    const idx = path.indexOf(anchor);
    if (idx > 0) {
      const base = path.slice(0, idx);
      return base ? base.replace(/\/+$/, '') || '/' : '/';
    }
  }

  return path.endsWith('/') ? path.slice(0, -1) || '/' : path || '/';
};

const candidateMetaTags = ['lovable:base-path', 'lovable-base-path', 'lovable:path'];

const resolveMetaBasePath = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  for (const name of candidateMetaTags) {
    const value =
      (document as Document).querySelector(`meta[name="${name}"]`)?.getAttribute?.('content') ??
      undefined;
    const normalized = normalizeBaseCandidate(value);
    if (normalized && normalized !== '/') {
      return normalized;
    }
  }
  return undefined;
};

const resolveLovableGlobalBase = (): string | undefined => {
  const globalLovable = lovables();
  if (!globalLovable) return undefined;
  const candidates = [
    (globalLovable as any).__LOVABLE_BASE_PATH as string | undefined,
    (globalLovable as any).__LOVABLE_APP_BASE_PATH as string | undefined,
    globalLovable.basePath,
    globalLovable.paths?.base,
    globalLovable.context?.basePath,
  ];
  for (const candidate of candidates) {
    const normalized = normalizeBaseCandidate(candidate);
    if (normalized && normalized !== '/') {
      return normalized;
    }
  }
  return undefined;
};

const resolveBaseFromEnv = (): string | undefined => {
  for (const candidate of envCandidates()) {
    const normalized = normalizeBaseCandidate(candidate);
    if (normalized && normalized !== '/') {
      return normalized;
    }
  }
  return undefined;
};

const fallbackBase = (): string => {
  const locationBase = normalizeBaseCandidate(resolveBaseFromLocation());
  if (locationBase && locationBase !== '/') {
    return locationBase;
  }
  return '/';
};

let CACHED_BASE: string | undefined;

const ensureBaseForLocation = (base?: string): string => {
  if (!base || base === '/') return '/';
  try {
    if (typeof window === 'undefined') return base;
    const pathname = (window as Window).location?.pathname || '/';
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      return base;
    }
    return '/';
  } catch {
    return base;
  }
};

export const getRouterBaseName = (): string => {
  if (CACHED_BASE) return CACHED_BASE;
  
  const candidates = [
    resolveLovableGlobalBase(),
    resolveMetaBasePath(),
    resolveBaseFromEnv(),
    fallbackBase(),
  ];
  
  const selected = candidates.find((b) => b && b !== '/') || '/';
  const safe = ensureBaseForLocation(selected);
  CACHED_BASE = safe;
  return safe;
};

export const subscribeToLovableConfig = (listener: (basePath: string) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const win = window as Window;
  const emit = () => listener(getRouterBaseName());
  emit();

  const handler = () => emit();
  win.addEventListener('lovable:config', handler as any);

  const interval = win.setInterval(() => {
    const base = resolveLovableGlobalBase();
    if (base) {
      emit();
      win.clearInterval(interval);
    }
  }, 200);

  return () => {
    win.removeEventListener('lovable:config', handler as any);
    win.clearInterval(interval);
  };
};

export const isLovableHost = (hostname?: string): boolean => {
  const subject =
    hostname ??
    (typeof window !== 'undefined' ? ((window as Window).location?.hostname ?? '') : '');
  return LOVABLE_HOST_REGEX.test(subject);
};

export const isLovablePreviewRuntime = (): boolean => {
  if (typeof window === 'undefined') return false;
  const anyWindow = window as Window & {
    __LOVABLE__?: unknown;
    lovable?: unknown;
  };
  return Boolean(anyWindow.__LOVABLE__ || anyWindow.lovable || isLovableHost());
};

export const sanitizeViteBase = (candidate?: string | null): string => {
  const normalized = normalizeBaseCandidate(candidate);
  if (!normalized || normalized === '/' || normalized === '') {
    return './';
  }
  if (normalized.startsWith('/')) {
    return `.${normalized}`;
  }
  if (normalized.startsWith('.')) {
    return normalized;
  }
  return `./${normalized}`;
};
