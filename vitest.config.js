import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname في بيئة ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js',
        'dist/',
        '.eslintrc.cjs',
      ],
    },
    include: ['tests/**/*.{test,spec}.{js,jsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/Components': path.resolve(__dirname, './Components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/api': path.resolve(__dirname, './api'),
      '@/contexts': path.resolve(__dirname, './contexts'),
      '@/Pages': path.resolve(__dirname, './Pages'),
    },
  },
});
