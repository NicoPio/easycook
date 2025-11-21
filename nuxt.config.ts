// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: true,
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'EasyCook - Recettes pour robots cuisiniers',
      meta: [
        { name: 'description', content: 'Application PWA de recettes de cuisine pas-à-pas pour Thermomix, Cookeo, Monsieur Cuisine' },
        { name: 'theme-color', content: '#10b981' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },

  runtimeConfig: {
    // Private keys (server-side only)
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@easycook.local',
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
    databasePath: process.env.DATABASE_PATH || './data/recipes.db',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'mistral:7b-instruct-v0.3',
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',

    // Public keys (exposed to client)
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    },
  },

  // PWA configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'EasyCook - Recettes pour robots cuisiniers',
      short_name: 'EasyCook',
      description: 'Recettes de cuisine pas-à-pas pour Thermomix, Cookeo, Monsieur Cuisine',
      theme_color: '#10b981',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\/api\/recipes\/\d+$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'recipes-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
            },
          },
        },
        {
          urlPattern: /^https:\/\/.*\/api\/recipes$/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'recipes-list-cache',
            networkTimeoutSeconds: 10,
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
