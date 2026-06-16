import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://gym-kappa-three.vercel.app',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000,
        navigateFallbackDenylist: [
          /^\/api/,
          /\.pdf($|\?)/
        ]
      },
      manifest: {
        name: 'Life Gym',
        short_name: 'Life Gym',
        description: 'Premium Fitness Coaching Platform',
        display: 'standalone',
        background_color: '#05060f',
        theme_color: '#05060f',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
});
