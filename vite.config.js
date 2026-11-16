import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'TentCraft — Toko Alat Tenda & Outdoor',
        short_name: 'TentCraft',
        description: 'Aplikasi PWA Penjualan & Persewaan Alat Tenda Outdoor Terlengkap.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
        shortcuts: [
          {
            name: 'Katalog Alat Tenda',
            short_name: 'Katalog',
            description: 'Lihat katalog alat tenda dan outdoor',
            url: '/?tab=Catalog',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Kelola Produk (CRUD)',
            short_name: 'Kelola',
            description: 'Tambah atau edit alat tenda',
            url: '/?tab=Manage',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Daftar Favorit',
            short_name: 'Favorit',
            description: 'Lihat produk tenda favorit',
            url: '/?tab=Favorites',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Profil Mahasiswa',
            short_name: 'Profil',
            description: 'Lihat profil pengembang & identitas praktikum',
            url: '/?tab=Profile',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,ico}'],
        runtimeCaching: [
          {
            urlPattern: /\/(?:api|rest)\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tentcraft-api-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tentcraft-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})

