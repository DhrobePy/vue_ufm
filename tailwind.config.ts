import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  safelist: [
    'lg:ml-[72px]',
    'lg:ml-[260px]',
    'lg:w-[72px]',
    'lg:w-[260px]',
    '-translate-x-full',
    'translate-x-0',
    'lg:translate-x-0',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Sora', 'Inter', 'ui-sans-serif'],
      },
      colors: {
        // Brand gold
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // App surfaces
        surface: {
          50:  '#f8f8f8',
          100: '#1a1a1a',
          200: '#161616',
          300: '#111111',
          400: '#0d0d0d',
          500: '#0a0a0a',
        },
        // Glass panels
        glass: {
          DEFAULT: 'rgba(255,255,255,0.04)',
          border: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.07)',
          active: 'rgba(245,158,11,0.12)',
        },
      },
      backgroundImage: {
        'gold-radial': 'radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.15) 0%, transparent 60%)',
        'gold-linear': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'dark-base': 'radial-gradient(ellipse at top left, #1a1410 0%, #0a0a0a 60%)',
        'sidebar-glow': 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 40%)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'gold-sm': '0 0 12px rgba(245,158,11,0.15)',
        'gold-md': '0 0 24px rgba(245,158,11,0.20)',
        'gold-lg': '0 0 48px rgba(245,158,11,0.25)',
        'glass': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card': '0 2px 16px rgba(0,0,0,0.5)',
      },
      borderColor: {
        glass: 'rgba(255,255,255,0.08)',
        'glass-gold': 'rgba(245,158,11,0.25)',
        'glass-gold-hover': 'rgba(245,158,11,0.5)',
      },
      backdropBlur: {
        xs: '4px',
        glass: '16px',
        'glass-lg': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(var(--accent-glow, 245,158,11),0.15)' },
          '50%': { boxShadow: '0 0 28px rgba(var(--accent-glow, 245,158,11),0.35)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} satisfies Config
