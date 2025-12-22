import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { VitePWA } from 'vite-plugin-pwa'

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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'Prism R2 Manager',
        short_name: 'PrismR2',
        description: 'Cloudflare R2 File Manager with iOS 25 Aesthetic',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
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
  esbuild: {
    // @ts-ignore - drop is supported by esbuild but might be missing in some Vite type definitions
    drop: ['console', 'debugger'],
  },
  build: {
    target: 'esnext',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@aws-sdk')) return 'vendor-aws';
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('date-fns')) return 'vendor-utils';
            return 'vendor';
          }
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
