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
    googleOauthClientId: '',        // Google OAuth2 client id (installed-app flow) — set NUXT_GOOGLE_OAUTH_CLIENT_ID in .env
    googleOauthClientSecret: '',    // Google OAuth2 client secret — set NUXT_GOOGLE_OAUTH_CLIENT_SECRET in .env
    googleOauthRefreshToken: '',    // long-lived refresh token for the real Drive account that owns the backup folder — set NUXT_GOOGLE_OAUTH_REFRESH_TOKEN in .env
    googleDriveBackupFolderId: '',  // Drive folder id the DB backups get uploaded into — set NUXT_GOOGLE_DRIVE_BACKUP_FOLDER_ID in .env
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
      // Paint the saved theme BEFORE first render so light-theme users don't see a
      // dark flash on every page load. useTheme() stores the computed CSS vars.
      script: [
        {
          innerHTML: "try{var t=JSON.parse(localStorage.getItem('erp_theme_vars')||'null');if(t){var r=document.documentElement;for(var k in t.vars)r.style.setProperty(k,t.vars[k]);if(t.light){r.setAttribute('data-theme','light');r.classList.add('light')}}}catch(e){}",
          tagPosition: 'head',
        },
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
