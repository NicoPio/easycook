// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: true
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'EasyCook - Recettes pour Robots Cuisiniers',
      short_name: 'EasyCook',
      description: 'Application PWA de recettes pour robots cuisiniers avec mode pas-à-pas',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.easycook\.app\/recipes\/\d+$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'recipe-details',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
            }
          }
        },
        {
          urlPattern: /^https:\/\/api\.easycook\.app\/recipes$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'recipe-list',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 // 1 hour
            }
          }
        }
      ]
    }
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  }
})
