import path from 'path';

import react from '@vitejs/plugin-react-swc';
import { componentTagger } from 'lovable-tagger';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { sanitizeViteBase } from './src/lib/routing/basePath';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const rawBase =
    process.env.VITE_BASE_PATH ??
    process.env.BASE_PATH ??
    process.env.VERCEL_PUBLIC_BASE_PATH ??
    undefined;
  const resolvedBase = sanitizeViteBase(rawBase);

  if (rawBase && resolvedBase !== rawBase && mode !== 'development') {
    console.warn(
      `[vite] Adjusted VITE_BASE_PATH from "${rawBase}" to "${resolvedBase}" to keep Lovable previews healthy.`,
    );
  }

  return {
    // Ensure assets resolve under sub-path previews (e.g., /preview/xyz)
    // Use relative base in production to avoid absolute /assets paths breaking behind proxies
    base: mode === 'development' ? '/' : resolvedBase,
    server: {
      // Bind on IPv4 for Lovable proxy compatibility and enforce port 8080
      host: true,
      port: 8080,
      strictPort: true,
      // Ensure HMR works behind Lovable's HTTPS reverse proxy
      hmr: {
        clientPort: 443,
      },
    },
    // Ensure `vite preview` uses the same port/host in Lovable
    preview: {
      host: true,
      port: 8080,
      strictPort: true,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
      mode === 'production' &&
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'robots.txt'],
          manifest: {
            name: 'Pavement Performance Suite',
            short_name: 'PPS',
            description: 'Estimator and AI assistant for asphalt maintenance',
            theme_color: '#0b0b0b',
            background_color: '#0b0b0b',
            display: 'standalone',
            icons: [{ src: '/favicon.ico', sizes: '64x64 32x32 24x24 16x16', type: 'image/x-icon' }],
          },
          workbox: {
            navigateFallbackDenylist: [/^\/api\//],
            runtimeCaching: [
              {
                urlPattern: /https:\/\/tile\.openstreetmap\.org\/.*\.(png|jpg|jpeg)$/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'osm-tiles',
                  expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
              {
                urlPattern:
                  /https:\/\/services\.arcgisonline\.com\/ArcGIS\/rest\/services\/.*\/tile\//,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'arcgis-tiles',
                  expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
              {
                urlPattern: /https:\/\/api\.openweathermap\.org\/.*$/,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'weather-api',
                  networkTimeoutSeconds: 3,
                  expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
            ],
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      // Force deduplication of React to prevent multiple instances
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    // Optimize dependencies to prevent duplicate React instances
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        // Include all Radix UI packages that use React context
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog',
        '@radix-ui/react-select',
        '@radix-ui/react-context-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-accordion',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-avatar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-collapsible',
        '@radix-ui/react-label',
        '@radix-ui/react-menubar',
        '@radix-ui/react-navigation-menu',
        '@radix-ui/react-progress',
        '@radix-ui/react-radio-group',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-separator',
        '@radix-ui/react-slider',
        '@radix-ui/react-slot',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group',
        // cmdk depends on Radix UI, so include it too
        'cmdk',
      ],
      exclude: [],
      // Force pre-bundling to ensure React is available
      esbuildOptions: {
        // Ensure React is treated as external and properly resolved
        jsx: 'automatic',
      },
    },
    // Improve chunking to reduce initial bundle size and address chunk warnings
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          previewSmoke: path.resolve(__dirname, 'preview-smoke.html'),
        },
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              // Put React, React-DOM, scheduler, ALL Radix UI components, and cmdk in the same chunk
              // This ensures React is always available when Radix UI tries to use createContext
              // cmdk depends on Radix UI, so it must also be in the same chunk
              if (id.includes('react') || 
                  id.includes('react-dom') || 
                  id.includes('scheduler') ||
                  id.includes('@radix-ui') ||
                  id.includes('cmdk')) {
                return 'react-vendor';
              }
              if (id.includes('react-router')) return 'router';
              if (id.includes('@tanstack')) return 'query';
              if (id.includes('leaflet')) return 'leaflet';
              if (id.includes('@react-google-maps')) return 'maps';
              if (id.includes('@supabase')) return 'supabase';
              if (id.includes('recharts')) return 'charts';
              if (id.includes('date-fns')) return 'date';
            }
          },
        },
      },
      // Keep warnings meaningful while allowing split vendor chunks
      chunkSizeWarningLimit: 900,
      // Ensure commonjs dependencies are properly handled
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
  };
});
