<template>
  <Teleport to="body">
    <Transition name="picker-overlay">
      <div v-if="theme.pickerOpen.value"
           class="fixed inset-0 z-[200]"
           style="background:rgba(0,0,0,0.45);backdrop-filter:blur(3px)"
           @click.self="theme.closePicker()" />
    </Transition>

    <Transition name="picker-slide">
      <aside v-if="theme.pickerOpen.value"
             class="fixed right-0 top-0 h-full z-[201] flex flex-col"
             style="width:340px;background:var(--panel-bg, #111);border-left:1px solid rgb(var(--tint)/0.09);box-shadow:-12px 0 40px rgba(0,0,0,0.5)">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 shrink-0"
             style="border-bottom:1px solid rgb(var(--tint)/0.07)">
          <div>
            <h2 class="text-sm font-semibold text-gray-200">Appearance</h2>
            <p class="text-[11px] text-gray-500 mt-0.5">Personalise your workspace</p>
          </div>
          <button @click="theme.closePicker()"
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-7">

          <!-- ── Background ───────────────────────────── -->
          <section class="space-y-3">
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Background</p>
            <div class="grid grid-cols-2 gap-2.5">
              <button
                v-for="base in theme.BASE_THEMES"
                :key="base.id"
                @click="theme.setBase(base.id)"
                class="relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left"
                :class="theme.baseId.value === base.id
                  ? 'border-[var(--accent-from)] shadow-[0_0_0_3px_rgb(var(--accent)/0.18)]'
                  : 'border-transparent hover:border-white/20'"
                style="height:76px">

                <!-- Bg preview -->
                <div class="absolute inset-0"
                     :style="`background: linear-gradient(135deg, ${base.preview[0]} 0%, ${base.bgTo} 100%)`" />

                <!-- Sidebar stripe -->
                <div class="absolute top-0 left-0 bottom-0 w-[28%]"
                     :style="`background: linear-gradient(180deg, ${base.sidebarFrom} 0%, ${base.sidebarTo} 100%); opacity: 0.9`" />

                <!-- Mini card -->
                <div class="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-9 rounded-lg opacity-80"
                     :style="`background: ${base.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.80)'}; border: 1px solid ${base.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`" />

                <!-- Label -->
                <div class="absolute bottom-2 right-3 text-right">
                  <p class="text-[11px] font-semibold leading-tight"
                     :style="`color: ${base.dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)'}`">
                    {{ base.emoji }} {{ base.name }}
                  </p>
                </div>

                <!-- Active tick -->
                <div v-if="theme.baseId.value === base.id"
                     class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                     style="background:var(--accent-from)">
                  <svg class="w-3 h-3 text-black" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </button>
            </div>
          </section>

          <!-- ── Accent Color ─────────────────────────── -->
          <section class="space-y-3">
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Accent Color</p>

            <!-- Preset chips -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="accent in theme.ACCENTS"
                :key="accent.id"
                @click="theme.setAccent(accent.id)"
                :title="accent.name"
                class="relative w-9 h-9 rounded-full transition-all duration-200"
                :style="`background: linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`"
                :class="theme.accentId.value === accent.id
                  ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110'
                  : 'opacity-80 hover:opacity-100 hover:scale-105'">
                <span v-if="theme.accentId.value === accent.id"
                      class="absolute inset-0 flex items-center justify-center">
                  <svg class="w-4 h-4" :style="`color:${accent.btnText}`" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
              </button>

              <!-- Custom colour picker -->
              <div class="relative">
                <label :title="`Custom: ${customPickerHex}`"
                       class="relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all"
                       :class="theme.accentId.value === 'custom'
                         ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110'
                         : 'opacity-80 hover:opacity-100 hover:scale-105'"
                       :style="`background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`">
                  <svg v-if="theme.accentId.value !== 'custom'" class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.657-6.343l-.707.707M7.05 16.95l-.707.707m12.02 0l-.707-.707M7.05 7.05l-.707-.707"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  <input type="color" v-model="customPickerHex"
                         @change="applyCustom"
                         class="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full" />
                </label>
              </div>
            </div>

            <!-- Accent name / value -->
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <div class="w-4 h-4 rounded-full shrink-0"
                   :style="`background: linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)`" />
              <span>
                {{ theme.accentId.value === 'custom'
                  ? `Custom ${customPickerHex}`
                  : theme.currentAccent.value?.name ?? 'Custom' }}
              </span>
            </div>

            <!-- Live preview pill -->
            <div class="rounded-xl p-3 space-y-2.5"
                 style="background:rgb(var(--tint)/0.04);border:1px solid rgb(var(--tint)/0.08)">
              <p class="text-[10px] text-gray-600 uppercase tracking-wider">Preview</p>
              <div class="flex gap-2 items-center flex-wrap">
                <button class="btn-gold text-xs px-3 py-1.5">Primary Action</button>
                <button class="btn-ghost text-xs px-3 py-1.5">Secondary</button>
                <span class="nav-item nav-item-active text-xs px-2.5 py-1">Active item</span>
              </div>
              <div class="flex gap-2">
                <div class="h-1.5 flex-1 rounded-full overflow-hidden" style="background:rgb(var(--tint)/0.08)">
                  <div class="h-full w-[65%] rounded-full" style="background:linear-gradient(90deg,var(--accent-from),var(--accent-to))"/>
                </div>
                <span class="text-[10px] text-gray-500">65%</span>
              </div>
            </div>
          </section>

          <!-- ── Quick Presets ────────────────────────── -->
          <section class="space-y-3">
            <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Quick Presets</p>
            <div class="grid grid-cols-1 gap-2">
              <button
                v-for="preset in PRESETS"
                :key="preset.id"
                @click="applyPreset(preset)"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                :class="currentPresetId === preset.id
                  ? 'ring-1 ring-[var(--accent-from)]'
                  : 'hover:bg-white/[0.05]'"
                style="border:1px solid rgb(var(--tint)/0.07)">
                <!-- Mini palette swatch -->
                <div class="flex shrink-0">
                  <div class="w-4 h-7 rounded-l-full"
                       :style="`background:${preset.sidebarFrom}`" />
                  <div class="w-4 h-7"
                       :style="`background:${preset.bgFrom}`" />
                  <div class="w-4 h-7 rounded-r-full"
                       :style="`background:linear-gradient(135deg,${preset.accentFrom},${preset.accentTo})`" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-gray-200">{{ preset.name }}</p>
                  <p class="text-[10px] text-gray-600">{{ preset.desc }}</p>
                </div>
                <div v-if="currentPresetId === preset.id"
                     class="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                     style="background:var(--accent-from)">
                  <svg class="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </button>
            </div>
          </section>

        </div>

        <!-- Footer -->
        <div class="shrink-0 px-5 py-4" style="border-top:1px solid rgb(var(--tint)/0.07)">
          <button @click="resetToDefault"
                  class="btn-ghost text-xs w-full justify-center">
            ↺ Reset to default
          </button>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const theme = useTheme()

const customPickerHex = ref(theme.customHex.value)

function applyCustom() {
  theme.setAccent('custom', customPickerHex.value)
}

// ── Quick presets ─────────────────────────────────────────
const PRESETS = [
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    desc: 'Classic dark — amber accent',
    base: 'midnight', accent: 'gold',
    sidebarFrom: '#1c1c1c', bgFrom: '#1a1410',
    accentFrom: '#f59e0b', accentTo: '#d97706',
  },
  {
    id: 'abyss-sky',
    name: 'Abyss Sky',
    desc: 'Deep ocean — sky blue accent',
    base: 'abyss', accent: 'sky',
    sidebarFrom: '#0c1222', bgFrom: '#080e1a',
    accentFrom: '#38bdf8', accentTo: '#0ea5e9',
  },
  {
    id: 'eclipse-violet',
    name: 'Eclipse Violet',
    desc: 'Dark cosmos — violet accent',
    base: 'eclipse', accent: 'violet',
    sidebarFrom: '#130c1e', bgFrom: '#0e0818',
    accentFrom: '#a78bfa', accentTo: '#7c3aed',
  },
  {
    id: 'midnight-rose',
    name: 'Noir Rose',
    desc: 'Dark dramatic — rose accent',
    base: 'midnight', accent: 'rose',
    sidebarFrom: '#1c1c1c', bgFrom: '#1a1410',
    accentFrom: '#f43f5e', accentTo: '#e11d48',
  },
  {
    id: 'abyss-emerald',
    name: 'Deep Forest',
    desc: 'Dark cool — emerald accent',
    base: 'abyss', accent: 'emerald',
    sidebarFrom: '#0c1222', bgFrom: '#080e1a',
    accentFrom: '#34d399', accentTo: '#059669',
  },
  {
    id: 'ivory-gold',
    name: 'Ivory Gold',
    desc: 'Warm light — amber accent',
    base: 'ivory', accent: 'gold',
    sidebarFrom: '#fef8ec', bgFrom: '#fdf8ef',
    accentFrom: '#f59e0b', accentTo: '#d97706',
  },
  {
    id: 'cloud-sky',
    name: 'Cloud Sky',
    desc: 'Cool light — sky blue accent',
    base: 'cloud', accent: 'sky',
    sidebarFrom: '#f5f8ff', bgFrom: '#f0f5ff',
    accentFrom: '#38bdf8', accentTo: '#0ea5e9',
  },
] as const

const currentPresetId = computed(() => {
  const b = theme.baseId.value
  const a = theme.accentId.value
  return PRESETS.find(p => p.base === b && p.accent === a)?.id ?? null
})

function applyPreset(p: typeof PRESETS[number]) {
  theme.setBase(p.base as any)
  theme.setAccent(p.accent as any)
}

function resetToDefault() {
  theme.setBase('midnight')
  theme.setAccent('gold')
  customPickerHex.value = '#f59e0b'
}

// sync custom hex if changed externally
watch(() => theme.customHex.value, v => { customPickerHex.value = v })
</script>

<style scoped>
/* Panel slide-in from right */
.picker-slide-enter-active { transition: transform 0.28s cubic-bezier(0.32,0.72,0,1); }
.picker-slide-leave-active { transition: transform 0.22s cubic-bezier(0.32,0.72,0,1); }
.picker-slide-enter-from   { transform: translateX(100%); }
.picker-slide-leave-to     { transform: translateX(100%); }

/* Overlay fade */
.picker-overlay-enter-active { transition: opacity 0.22s ease; }
.picker-overlay-leave-active { transition: opacity 0.18s ease; }
.picker-overlay-enter-from   { opacity: 0; }
.picker-overlay-leave-to     { opacity: 0; }

/* Panel bg: use sidebar colour so it feels connected to the chrome */
aside {
  background: var(--sidebar-from) !important;
}
</style>
