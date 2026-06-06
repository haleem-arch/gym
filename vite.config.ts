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
        maximumFileSizeToCacheInBytes: 3000000
      },
      manifest: {
        name: 'Haleem',
        short_name: 'Haleem',
        description: 'Personal Athlete Dashboard',
        display: 'standalone',
        background_color: '#0f0f0f',
        theme_color: '#0f0f0f',
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
