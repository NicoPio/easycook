// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@vite-pwa/nuxt', '@nuxt/image'],

  css: ['~/assets/css/main.css'],

  icon: {
    serverBundle: {
      collections: ['lucide']
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
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
      navigateFallbackDenylist: [/^\/api\//],
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          // Recipe details - Cache First for offline access
          urlPattern: ({ url }) => url.pathname.match(/^\/api\/recipes\/[^\/]+$/),
          handler: 'CacheFirst',
          options: {
            cacheName: 'recipe-details',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          // Recipe list and search - Network First for fresh data
          urlPattern: ({ url }) => url.pathname.match(/^\/api\/recipes/),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'recipe-list',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 // 1 hour
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          // Images - Cache First for performance
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  },

  image: {
    format: ['webp', 'avif'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    },
    providers: {
      // Use local provider for static images
    },
    presets: {
      recipe: {
        modifiers: {
          format: 'webp',
          quality: 80,
          loading: 'lazy'
        }
      },
      thumbnail: {
        modifiers: {
          format: 'webp',
          quality: 70,
          width: 400,
          height: 300,
          fit: 'cover',
          loading: 'lazy'
        }
      }
    }
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    routeRules: {
      '/**': {
        headers: {
          // Content Security Policy
          'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Nuxt dev
            "style-src 'self' 'unsafe-inline'", // unsafe-inline needed for dynamic styles
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
          ].join('; '),
          // Other security headers
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
        }
      }
    }
  }
})
