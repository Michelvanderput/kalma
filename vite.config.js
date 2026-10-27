import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Ook het lettertype offline beschikbaar maken.
      workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] },
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Kalma',
        short_name: 'Kalma',
        description: 'Rust en vertrouwen, elke dag.',
        lang: 'nl',
        theme_color: '#1f4e4a',
        background_color: '#f4f1ea',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
        // Lang drukken op het app-icoon (Android) geeft direct de drangknop.
        shortcuts: [
          {
            name: 'Ik voel drang',
            short_name: 'Drang',
            url: '/?drang=1',
            icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
          },
        ],
      },
    }),
  ],
})
