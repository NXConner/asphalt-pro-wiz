import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getRouterBaseName,
  isLovableHost,
  sanitizeViteBase,
} from '@/lib/routing/basePath';
import { runtimeEnv } from '@/lib/runtimeEnv';

interface WindowStub {
  location: {
    pathname: string;
    hostname: string;
    origin: string;
  };
  __LOVABLE__?: Record<string, unknown>;
  lovable?: Record<string, unknown>;
  addEventListener: (event: string, handler: EventListener) => void;
  removeEventListener: (event: string, handler: EventListener) => void;
  setInterval: typeof setInterval;
  clearInterval: typeof clearInterval;
}

let windowStub: WindowStub;
let originalLovableEnv: unknown;
let originalLovableBaseEnv: unknown;
let originalProcessLovable: string | undefined;
let originalProcessLovableBase: string | undefined;

beforeEach(() => {
  windowStub = {
    location: {
      pathname: '/',
      hostname: 'localhost',
      origin: 'http://localhost',
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setInterval: setInterval,
    clearInterval: clearInterval,
  };

  vi.stubGlobal('window', windowStub);
  vi.stubGlobal('document', {
    querySelector: vi.fn(() => null),
    baseURI: undefined,
  });

  originalLovableEnv = runtimeEnv.VITE_LOVABLE_BASE_PATH;
  originalLovableBaseEnv = runtimeEnv.LOVABLE_BASE_PATH;
  (runtimeEnv as Record<string, unknown>).VITE_LOVABLE_BASE_PATH = undefined;
  (runtimeEnv as Record<string, unknown>).LOVABLE_BASE_PATH = undefined;
  originalProcessLovable = process.env.VITE_LOVABLE_BASE_PATH;
  originalProcessLovableBase = process.env.LOVABLE_BASE_PATH;
  delete process.env.VITE_LOVABLE_BASE_PATH;
  delete process.env.LOVABLE_BASE_PATH;
});

afterEach(() => {
  (runtimeEnv as Record<string, unknown>).VITE_LOVABLE_BASE_PATH = originalLovableEnv;
  (runtimeEnv as Record<string, unknown>).LOVABLE_BASE_PATH = originalLovableBaseEnv;
  if (originalProcessLovable !== undefined) {
    process.env.VITE_LOVABLE_BASE_PATH = originalProcessLovable;
  } else {
    delete process.env.VITE_LOVABLE_BASE_PATH;
  }
  if (originalProcessLovableBase !== undefined) {
    process.env.LOVABLE_BASE_PATH = originalProcessLovableBase;
  } else {
    delete process.env.LOVABLE_BASE_PATH;
  }
  vi.unstubAllGlobals();
});

describe('routing/basePath helpers', () => {
  it('sanitizes vite base paths to relative defaults', () => {
    expect(sanitizeViteBase(undefined)).toBe('./');
    expect(sanitizeViteBase('/')).toBe('./');
    expect(sanitizeViteBase('/preview/foo')).toBe('./preview/foo');
    expect(sanitizeViteBase('./nested')).toBe('./nested');
  });

  it('detects lovable hosts', () => {
    expect(isLovableHost('preview.lovable.dev')).toBe(true);
    expect(isLovableHost('demo.lovable.app')).toBe(true);
    expect(isLovableHost('demo.lovableproject.com')).toBe(true);
    expect(isLovableHost('example.com')).toBe(false);
  });

  it('prefers meta tags when computing router base', () => {
    (document.querySelector as vi.Mock).mockImplementation((selector: string) => {
      if (selector === 'meta[name="lovable:base-path"]') {
        return {
          getAttribute: () => '/preview/meta-override',
        };
      }
      return null;
    });

    expect(getRouterBaseName()).toBe('/preview/meta-override');
  });

  it('falls back to lovable globals when meta is absent', () => {
    windowStub.__LOVABLE__ = { basePath: '/preview/global-path' };
    (document.querySelector as vi.Mock).mockReturnValue(null);

    expect(getRouterBaseName()).toBe('/preview/global-path');
  });

  it('derives from location when no metadata is available', () => {
    windowStub.location.pathname = '/preview/project-123/command-center';
    (document.querySelector as vi.Mock).mockReturnValue(null);
    delete windowStub.__LOVABLE__;
    delete windowStub.lovable;

    expect(getRouterBaseName()).toBe('/preview/project-123');
  });
});
