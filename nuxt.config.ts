export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
  ],

  runtimeConfig: {
    dbHost: 'localhost',
    dbPort: 3306,
    dbName: 'ujjalfmc_saas',
    dbUser: 'root',
    dbPass: '',
    devLogin: '',          // set NUXT_DEV_LOGIN=true in .env to enable dev credentials
    sessionSecret: 'change-this-to-a-long-random-secret-min-32-chars!!',
    cronSecret: '',        // set NUXT_CRON_SECRET in .env to enable /api/cron/* endpoints (e.g. cPanel scheduled task)
    public: {
      appName: 'Ujjal FMC ERP',
      appUrl: 'http://localhost:3000',
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
    },
  },

  routeRules: {
    '/api/**': { cors: false },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Ujjal FMC ERP',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap',
        },
      ],
    },
  },
})
