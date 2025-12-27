import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

// Align vitest alias resolution with vite.config.ts to fix CI import failures
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: [
      'client/src/**/*.test.{ts,tsx}',
      'client/src/**/__tests__/**/*.{ts,tsx}',
      'tests/**/*.test.ts'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client', 'src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets')
    },
    dedupe: ['react', 'react-dom']
  }
});
