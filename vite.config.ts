import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure assets resolve under sub-path previews (e.g., /preview/xyz)
  // Use relative base in production to avoid absolute /assets paths breaking behind proxies
  base: mode === 'development' ? '/' : (process.env.VITE_BASE_PATH || './'),
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
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Pavement Performance Suite",
        short_name: "PPS",
        description: "Estimator and AI assistant for asphalt maintenance",
        theme_color: "#0b0b0b",
        background_color: "#0b0b0b",
        display: "standalone",
        icons: [{ src: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon" }],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
