import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// __dirname في بيئة ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './Components'),
      '@/pages': path.resolve(__dirname, './Pages'),
      '@/entities': path.resolve(__dirname, './Entities'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/api': path.resolve(__dirname, './api'),
      '@/contexts': path.resolve(__dirname, './contexts'),
      '@/styles': path.resolve(__dirname, './styles'),
    },
  },
  server: {
    port: 5005,
    open: true,
    host: true, // للسماح بالوصول من خارج localhost
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  preview: {
    port: parseInt(process.env.PORT || '5005'),
    host: true,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          'nlp-utils': [
            '@/utils/nlp/arabicTokenizer',
            '@/utils/nlp/patternExtractor',
            '@/utils/nlp/contentClassifier',
            '@/utils/nlp/duplicateDetector',
            '@/utils/nlp/chapterDivider'
          ]
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ]
  }
}))
