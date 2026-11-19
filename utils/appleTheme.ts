/**
 * Apple (HIG) appearance — CSS variables the theme engine sets, shared by the composable and the inline pre-paint script
 * (nuxt.config) so the right look is painted before first render. Light and dark follow the system setting.
 *
 * Colours: Apple's system grays / grouped backgrounds. The accent is the system blue, but the FILL is #0071E3 (white text 4.7:1);
 * the ink used for blue TEXT is #0066CC on light (5.6:1) and #4DA3FF on dark (6.5:1 on #1C1C1E) — plain #007AFF / #0A84FF fall
 * under 4.5:1 for small text.
 */
const common = {
  '--accent': '0 113 227',
  '--accent-from': '#0071e3',
  '--accent-to': '#0071e3',
  '--accent-glow': '0,113,227',
  '--accent-text': '#fff',
}
export const APPLE_VARS = {
  dark: {
    light: false,
    vars: { ...common, '--bg-from': '#000000', '--bg-to': '#000000', '--sidebar-from': '#1c1c1e', '--sidebar-to': '#1c1c1e',
      '--topbar-bg': 'rgba(28,28,30,0.72)', '--tint': '255 255 255', '--accent-ink': '#4da3ff' },
  },
  light: {
    light: true,
    vars: { ...common, '--bg-from': '#f2f2f7', '--bg-to': '#f2f2f7', '--sidebar-from': '#f2f2f7', '--sidebar-to': '#f2f2f7',
      '--topbar-bg': 'rgba(255,255,255,0.72)', '--tint': '0 0 0', '--accent-ink': '#0066cc' },
  },
} as const
