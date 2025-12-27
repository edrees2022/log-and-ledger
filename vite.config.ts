import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// Build cache buster: 2025-11-12T11:50
export default defineConfig({
  plugins: [
    // Keep production build clean and minimal
    react(),
  ],
  resolve: {
    dedupe: [
      // Ensure a single React instance at runtime
      'react',
      'react-dom',
    ],
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    // Restore normal production optimizations
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      output: {
        // Force new filename on every build for cache busting
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    },
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
