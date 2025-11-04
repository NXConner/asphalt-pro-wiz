import '@fontsource/rajdhani/500.css';
import '@fontsource/rajdhani/600.css';
import '@fontsource/rajdhani/700.css';
import '@fontsource/orbitron/600.css';
import '@fontsource/share-tech-mono/400.css';

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
  setLogContext({ appVersion: (import.meta as any)?.env?.VITE_APP_VERSION });
  logEvent('app.start');
} catch {}

createRoot(document.getElementById('root')!).render(<App />);

// Web-vitals (lazy) with sampling
if ((import.meta as any)?.env?.VITE_ENABLE_WEB_VITALS) {
  import('web-vitals').then(({ onCLS, onLCP, onFCP, onTTFB, onINP }) => {
    try {
      onCLS((m) => logVital('CLS', m.value, m.id));
      onLCP((m) => logVital('LCP', m.value, m.id));
      onFCP?.((m: any) => logVital('FCP', m.value, m.id));
      onTTFB?.((m: any) => logVital('TTFB', m.value, m.id));
      onINP?.((m: any) => logVital('INP', m.value, m.id));
    } catch {}
  });
}
