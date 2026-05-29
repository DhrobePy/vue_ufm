<template>
  <div class="glass-card-hover p-4 flex items-center gap-3 relative overflow-hidden">
    <!-- Accent glow bg -->
    <div class="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-[0.08] pointer-events-none"
         :style="`background: radial-gradient(circle, ${accentHex}, transparent)`" />

    <!-- Icon -->
    <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
         :style="`background: rgba(${accentRgb}, 0.12); border: 1px solid rgba(${accentRgb}, 0.2);`">
      <SidebarIcon :type="iconType" class="w-4 h-4" :style="`color: ${accentHex}`" />
    </div>

    <!-- Text -->
    <div class="flex-1 min-w-0">
      <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">{{ label }}</p>
      <p class="text-xl font-bold text-white leading-tight mt-0.5">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string | number
  icon: string        // matches SidebarIcon type
  color?: string      // blue | green | yellow | teal | red | orange | indigo
}>()

const iconType = computed(() => props.icon)

const colorMap: Record<string, { hex: string; rgb: string }> = {
  blue:   { hex: '#60a5fa', rgb: '96,165,250' },
  green:  { hex: '#4ade80', rgb: '74,222,128' },
  yellow: { hex: '#facc15', rgb: '250,204,21' },
  teal:   { hex: '#2dd4bf', rgb: '45,212,191' },
  red:    { hex: '#f87171', rgb: '248,113,113' },
  orange: { hex: '#fb923c', rgb: '251,146,60' },
  indigo: { hex: '#818cf8', rgb: '129,140,248' },
  gray:   { hex: '#9ca3af', rgb: '156,163,175' },
}

const c = computed(() => colorMap[props.color ?? 'blue'] ?? colorMap.blue)
const accentHex = computed(() => c.value.hex)
const accentRgb = computed(() => c.value.rgb)
</script>
