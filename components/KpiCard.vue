<template>
  <div :class="['glass-card-hover p-5 flex flex-col gap-3 relative overflow-hidden', urgent ? 'animate-glow-pulse' : '']">

    <!-- Background accent -->
    <div class="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] transition-opacity duration-200"
         :style="`background: radial-gradient(circle, ${accentHex}, transparent)`" />

    <!-- Top row -->
    <div class="flex items-start justify-between">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">{{ label }}</span>
      <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
           :style="`background: rgba(${accentRgb}, 0.12); border: 1px solid rgba(${accentRgb}, 0.2);`">
        <SidebarIcon :type="icon" class="w-3.5 h-3.5" :style="`color: ${accentHex}`" />
      </div>
    </div>

    <!-- Value -->
    <div>
      <p class="font-display font-bold text-2xl text-white leading-none tracking-tight">{{ value }}</p>
      <p class="text-[11px] text-gray-600 mt-1 leading-tight">{{ subLabel }}</p>
    </div>

    <!-- Trend -->
    <div class="flex items-center gap-1.5">
      <span :class="['flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md', trendUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10']">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path v-if="trendUp" stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
          <path v-else stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
        {{ trend }}
      </span>
      <span v-if="urgent" class="text-[10px] text-gold-500 font-medium">Action needed</span>
    </div>

  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  trend: string
  trendUp: boolean
  icon: string
  color: string
  subLabel?: string
  urgent?: boolean
}>()

const accentMap: Record<string, { hex: string; rgb: string }> = {
  gold:   { hex: '#f59e0b', rgb: '245,158,11' },
  blue:   { hex: '#3b82f6', rgb: '59,130,246' },
  orange: { hex: '#f97316', rgb: '249,115,22' },
  teal:   { hex: '#14b8a6', rgb: '20,184,166' },
  purple: { hex: '#a855f7', rgb: '168,85,247' },
  green:  { hex: '#22c55e', rgb: '34,197,94' },
}

const accentHex = computed(() => accentMap[props.color]?.hex ?? '#f59e0b')
const accentRgb = computed(() => accentMap[props.color]?.rgb ?? '245,158,11')
</script>
