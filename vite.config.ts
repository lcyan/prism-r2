import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Fix for AWS SDK v3 path issues in some environments
      "./runtimeConfig": "./runtimeConfig.browser",
    },
  },
  define: {
    // Some libraries check for this
    'process.env': {},
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-aws': ['@aws-sdk/client-s3', '@aws-sdk/lib-storage'],
          'vendor-utils': ['framer-motion', 'lucide-react', 'date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Speed up build
  },
  server: {
    port: 5174,
  },
})
