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
