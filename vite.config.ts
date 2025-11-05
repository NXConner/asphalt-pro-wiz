import path from 'path';

import react from '@vitejs/plugin-react-swc';
import { componentTagger } from 'lovable-tagger';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure assets resolve under sub-path previews (e.g., /preview/xyz)
  // Use relative base in production to avoid absolute /assets paths breaking behind proxies
  base: mode === 'development' ? '/' : process.env.VITE_BASE_PATH || './',
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
    mode === 'production' && VitePWA({
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
            urlPattern: /https:\/\/services\.arcgisonline\.com\/ArcGIS\/rest\/services\/.*\/tile\//,
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
  },
  // Improve chunking to reduce initial bundle size and address chunk warnings
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@tanstack')) return 'query';
            if (id.includes('@radix-ui') || id.includes('cmdk')) return 'radix';
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
  },
}));
