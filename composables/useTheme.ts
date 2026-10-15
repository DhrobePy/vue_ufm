// ── Base Atmospheres ─────────────────────────────────────
export const BASE_THEMES = [
  {
    id: 'midnight', name: 'Midnight', emoji: '🌑', dark: true,
    bgFrom: '#1a1410', bgTo: '#0a0a0a',
    sidebarFrom: '#1c1c1c', sidebarTo: '#151515',
    topbarBg: 'rgba(14,14,14,0.85)',
    tint: '255 255 255',
    preview: ['#1a1410', '#1c1c1c'],
  },
  {
    id: 'abyss', name: 'Abyss', emoji: '🌊', dark: true,
    bgFrom: '#080e1a', bgTo: '#050810',
    sidebarFrom: '#0c1222', sidebarTo: '#070d18',
    topbarBg: 'rgba(6,9,18,0.9)',
    tint: '255 255 255',
    preview: ['#080e1a', '#0c1222'],
  },
  {
    id: 'eclipse', name: 'Eclipse', emoji: '🔮', dark: true,
    bgFrom: '#0e0818', bgTo: '#060310',
    sidebarFrom: '#130c1e', sidebarTo: '#0b0714',
    topbarBg: 'rgba(8,4,16,0.9)',
    tint: '255 255 255',
    preview: ['#0e0818', '#130c1e'],
  },
  {
    id: 'ivory', name: 'Ivory', emoji: '☀️', dark: false,
    bgFrom: '#fdf8ef', bgTo: '#f5ede0',
    sidebarFrom: '#fef8ec', sidebarTo: '#f9f3e7',
    topbarBg: 'rgba(255,255,255,0.9)',
    tint: '0 0 0',
    preview: ['#fdf8ef', '#fef8ec'],
  },
  {
    id: 'cloud', name: 'Cloud', emoji: '🌤', dark: false,
    bgFrom: '#f0f5ff', bgTo: '#e8edf8',
    sidebarFrom: '#f5f8ff', sidebarTo: '#ecf0fc',
    topbarBg: 'rgba(248,251,255,0.9)',
    tint: '0 0 0',
    preview: ['#f0f5ff', '#f5f8ff'],
  },
] as const

export type BaseThemeId = typeof BASE_THEMES[number]['id']

// ── Accent Colors ────────────────────────────────────────
export const ACCENTS = [
  { id: 'gold',    name: 'Gold',    from: '#f59e0b', to: '#d97706', rgb: '245 158 11',  btnText: '#000', glow: '245,158,11' },
  { id: 'sky',     name: 'Sky',     from: '#38bdf8', to: '#0ea5e9', rgb: '56 189 248',  btnText: '#000', glow: '56,189,248' },
  { id: 'violet',  name: 'Violet',  from: '#a78bfa', to: '#7c3aed', rgb: '167 139 250', btnText: '#fff', glow: '167,139,250' },
  { id: 'rose',    name: 'Rose',    from: '#f43f5e', to: '#e11d48', rgb: '244 63 94',   btnText: '#fff', glow: '244,63,94' },
  { id: 'emerald', name: 'Emerald', from: '#34d399', to: '#059669', rgb: '52 211 153',  btnText: '#000', glow: '52,211,153' },
  { id: 'cyan',    name: 'Cyan',    from: '#22d3ee', to: '#0891b2', rgb: '34 211 238',  btnText: '#000', glow: '34,211,238' },
  { id: 'orange',  name: 'Orange',  from: '#fb923c', to: '#ea580c', rgb: '251 146 60',  btnText: '#000', glow: '251,146,60' },
] as const

export type AccentId = typeof ACCENTS[number]['id'] | 'custom'

// ── Helpers ──────────────────────────────────────────────
function hexToRgbSpaced(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r} ${g} ${b}`
}

function hexToRgbComma(hex: string): string {
  return hexToRgbSpaced(hex).replace(/ /g, ',')
}

function darkenHex(hex: string, amount = 32): string {
  const clean = hex.replace('#', '')
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount)
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount)
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Relative luminance + WCAG contrast — used so accent buttons/text stay readable
// for EVERY accent (and any custom colour), instead of a hard-coded black/white.
function lum(hex: string): number {
  const c = hex.replace('#', '')
  const ch = [0, 2, 4].map(i => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
/** Black or white text — whichever is more readable across BOTH ends of the button gradient. */
function readableOn(from: string, to: string): string {
  const worst = (fg: string) => Math.min(contrast(fg, from), contrast(fg, to))
  return worst('#000000') >= worst('#ffffff') ? '#000' : '#fff'
}
/** The accent darkened until it reads as TEXT on a light page (>= 4.7:1) — for light themes. */
function inkOnLight(hex: string): string {
  // Scale each channel (not subtract) so the hue stays the same colour — gold stays amber, not brown-red.
  const scale = (h: string, k: number) => '#' + [0, 2, 4]
    .map(i => Math.round(parseInt(h.replace('#', '').slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('')
  let h = hex
  for (let i = 0; i < 20 && contrast(h, '#f5ede0') < 4.7; i++) h = scale(h, 0.93)
  return h
}

// ── Storage keys ─────────────────────────────────────────
const KEY_BASE   = 'erp_base_theme'
const KEY_ACCENT = 'erp_accent'
const KEY_CUSTOM = 'erp_custom_accent'
const KEY_VARS   = 'erp_theme_vars'   // last applied CSS vars — replayed by an inline head script before first paint

// ── Transition class debounce (prevents stacking timeouts on rapid @input) ─
let _transitionTimer: ReturnType<typeof setTimeout> | null = null

// ── Composable ────────────────────────────────────────────
export function useTheme() {
  const baseId       = useState<BaseThemeId>('theme_base',   () => 'midnight')
  const accentId     = useState<AccentId>('theme_accent',    () => 'gold')
  const customHex    = useState<string>('theme_custom_hex',  () => '#f59e0b')
  const pickerOpen   = useState<boolean>('theme_picker',     () => false)

  const currentBase   = computed(() => BASE_THEMES.find(b => b.id === baseId.value) ?? BASE_THEMES[0])
  const currentAccent = computed(() => accentId.value === 'custom' ? null : ACCENTS.find(a => a.id === accentId.value) ?? ACCENTS[0])
  const isDark        = computed(() => currentBase.value.dark)
  // For backward compat (AppTopbar uses themeStore.isDark.value)
  const isDarkRef     = computed(() => isDark.value)

  function applyVars(baseOverride?: BaseThemeId, accentOverride?: AccentId, customOverride?: string) {
    if (!import.meta.client) return

    const b   = BASE_THEMES.find(t => t.id === (baseOverride ?? baseId.value)) ?? BASE_THEMES[0]
    const aId = accentOverride ?? accentId.value
    const a   = aId === 'custom' ? null : ACCENTS.find(c => c.id === aId) ?? ACCENTS[0]
    const hex = customOverride ?? customHex.value

    const root = document.documentElement

    // ── smooth transition flash (debounced so rapid @input calls don't stack) ──
    root.classList.add('theme-transitioning')
    if (_transitionTimer) clearTimeout(_transitionTimer)
    _transitionTimer = setTimeout(() => {
      root.classList.remove('theme-transitioning')
      _transitionTimer = null
    }, 380)

    // ── Base atmosphere vars ──
    root.style.setProperty('--bg-from',      b.bgFrom)
    root.style.setProperty('--bg-to',        b.bgTo)
    root.style.setProperty('--sidebar-from', b.sidebarFrom)
    root.style.setProperty('--sidebar-to',   b.sidebarTo)
    root.style.setProperty('--topbar-bg',    b.topbarBg)
    root.style.setProperty('--tint',         b.tint)

    // ── Accent vars ──
    const accentFrom = a ? a.from : hex
    const accentTo   = a ? a.to   : darkenHex(hex)
    const accentRgb  = a ? a.rgb  : hexToRgbSpaced(hex)
    const accentGlow = a ? a.glow : hexToRgbComma(hex)
    const accentText = readableOn(accentFrom, accentTo)
    const accentInk  = b.dark ? accentFrom : inkOnLight(accentTo)

    root.style.setProperty('--accent',      accentRgb)   // "245 158 11"  — for rgb(var(--accent)/0.2)
    root.style.setProperty('--accent-from', accentFrom)  // "#f59e0b"     — for gradient from
    root.style.setProperty('--accent-to',   accentTo)    // "#d97706"     — for gradient to
    root.style.setProperty('--accent-glow', accentGlow)  // "245,158,11"  — for rgba(var(--accent-glow),0.4)
    root.style.setProperty('--accent-text', accentText)  // btn text color (auto black/white)
    root.style.setProperty('--accent-ink',  accentInk)   // accent used AS TEXT: bright on dark themes, darkened on light ones

    // Remember the result so the inline head script can paint the right theme
    // immediately on the next page load (no dark→light flash).
    try {
      localStorage.setItem(KEY_VARS, JSON.stringify({
        light: !b.dark,
        vars: {
          '--bg-from': b.bgFrom, '--bg-to': b.bgTo, '--sidebar-from': b.sidebarFrom, '--sidebar-to': b.sidebarTo,
          '--topbar-bg': b.topbarBg, '--tint': b.tint, '--accent': accentRgb, '--accent-from': accentFrom,
          '--accent-to': accentTo, '--accent-glow': accentGlow, '--accent-text': accentText, '--accent-ink': accentInk,
        },
      }))
    } catch { /* private mode — theme still applies, just not pre-painted */ }

    // ── Dark / light mode ──
    if (b.dark) {
      root.removeAttribute('data-theme')
      root.classList.remove('light')
    } else {
      root.setAttribute('data-theme', 'light')
      root.classList.add('light')
    }
  }

  function setBase(id: BaseThemeId) {
    baseId.value = id
    applyVars(id)
    if (import.meta.client) localStorage.setItem(KEY_BASE, id)
  }

  function setAccent(id: AccentId, hex?: string) {
    accentId.value = id
    if (hex) customHex.value = hex
    applyVars(undefined, id, hex)
    if (import.meta.client) {
      localStorage.setItem(KEY_ACCENT, id)
      if (hex) localStorage.setItem(KEY_CUSTOM, hex)
    }
  }

  function init() {
    if (!import.meta.client) return
    const savedBase   = localStorage.getItem(KEY_BASE)   as BaseThemeId | null
    const savedAccent = localStorage.getItem(KEY_ACCENT) as AccentId    | null
    const savedCustom = localStorage.getItem(KEY_CUSTOM)
    if (savedBase)   baseId.value   = savedBase
    if (savedAccent) accentId.value = savedAccent
    if (savedCustom) customHex.value = savedCustom
    applyVars()
  }

  // Legacy toggle — flips between midnight ↔ ivory
  function toggle() {
    setBase(isDark.value ? 'ivory' : 'midnight')
  }

  function openPicker()  { pickerOpen.value = true }
  function closePicker() { pickerOpen.value = false }

  return {
    baseId, accentId, customHex, pickerOpen,
    currentBase, currentAccent,
    isDark, isDarkRef,   // isDarkRef kept as the legacy alias
    BASE_THEMES, ACCENTS,
    setBase, setAccent, init, toggle,
    openPicker, closePicker,
  }
}
