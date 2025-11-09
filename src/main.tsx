import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';

import { logEvent, logVital, setLogContext } from '@/lib/logging';
import { isLovableHost } from '@/lib/routing/basePath';
import { applyThemePreferences, loadThemePreferences } from '@/lib/theme';

// Apply saved theme asap
try {
  const prefs = loadThemePreferences();
  applyThemePreferences(prefs);
} catch {}

// Session bootstrap logging
try {
  const env = import.meta.env as Record<string, string | undefined>;
  setLogContext({ appVersion: env.VITE_APP_VERSION });
  logEvent('app.start');
} catch {
  // Ignore logging errors during bootstrap
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(<App />);

// Preview cache bust (Lovable hosts only) - run once per session
try {
    const hostname = window.location?.hostname || '';
    const onLovableHost = isLovableHost(hostname);
    const clearedFlag = 'preview-cache-cleared-v1';
    if (onLovableHost && !sessionStorage.getItem(clearedFlag)) {
      sessionStorage.setItem(clearedFlag, '1');

      (async () => {
        // Clear Supabase auth caches (localStorage keys start with 'sb-')
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          }
        } catch {}

        // Unregister service workers
        try {
          if ('serviceWorker' in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            regs.forEach((r) => r.unregister());
          }
        } catch {}

        // Clear Cache Storage
        try {
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } catch {}

        // Best-effort IndexedDB cleanup (not supported in all browsers)
        try {
          const anyIndexedDB: any = indexedDB as any;
          if (anyIndexedDB?.databases) {
            const dbs = await anyIndexedDB.databases();
            await Promise.all(
              (dbs || [])
                .filter((d: any) => d?.name && /supabase|pps|vite|workbox/i.test(d.name))
                .map(
                  (d: any) =>
                    new Promise<void>((res) => {
                      const req = indexedDB.deleteDatabase(d.name!);
                      req.onsuccess = req.onerror = req.onblocked = () => res();
                    }),
                ),
            );
          }
        } catch {}
      })().catch(() => {});
    }
} catch {}


// Web-vitals (lazy) with sampling
const env = import.meta.env as Record<string, string | undefined>;
if (env.VITE_ENABLE_WEB_VITALS === 'true') {
  import('web-vitals').then(({ onCLS, onLCP, onFCP, onTTFB, onINP }) => {
    try {
      onCLS((m) => logVital('CLS', m.value, m.id));
      onLCP((m) => logVital('LCP', m.value, m.id));
      onFCP?.((m) => logVital('FCP', m.value, m.id));
      onTTFB?.((m) => logVital('TTFB', m.value, m.id));
      onINP?.((m) => logVital('INP', m.value, m.id));
    } catch {
      // Ignore web vitals errors
    }
  }).catch(() => {
    // Ignore import errors for web-vitals
  });
}
