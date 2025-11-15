import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

import './index.css';
import { logEvent, logVital, setLogContext } from '@/lib/logging';
import { applyThemePreferences, loadThemePreferences } from '@/lib/theme';

// Apply saved theme asap
try {
  const prefs = loadThemePreferences();
  applyThemePreferences(prefs);
} catch {}

// Session bootstrap logging
try {
  const appVersion =
    typeof import.meta !== 'undefined' &&
    'env' in import.meta &&
    typeof (import.meta.env as { VITE_APP_VERSION?: string })?.VITE_APP_VERSION === 'string'
      ? (import.meta.env as { VITE_APP_VERSION: string }).VITE_APP_VERSION
      : undefined;
  setLogContext({ appVersion });
  logEvent('app.start');
} catch {}

createRoot(document.getElementById('root')!).render(<App />);

// Web-vitals (lazy) with sampling
const enableWebVitals =
  typeof import.meta !== 'undefined' &&
  'env' in import.meta &&
  typeof (import.meta.env as { VITE_ENABLE_WEB_VITALS?: string })?.VITE_ENABLE_WEB_VITALS ===
    'string'
    ? (import.meta.env as { VITE_ENABLE_WEB_VITALS: string }).VITE_ENABLE_WEB_VITALS === 'true' ||
      (import.meta.env as { VITE_ENABLE_WEB_VITALS: string }).VITE_ENABLE_WEB_VITALS === '1'
    : false;

if (enableWebVitals) {
  import('web-vitals').then(({ onCLS, onLCP, onFCP, onTTFB, onINP }) => {
    try {
      onCLS((m) => logVital('CLS', m.value, m.id));
      onLCP((m) => logVital('LCP', m.value, m.id));
      onFCP?.((m) => logVital('FCP', m.value, m.id));
      onTTFB?.((m) => logVital('TTFB', m.value, m.id));
      onINP?.((m) => logVital('INP', m.value, m.id));
    } catch {}
  });
}
