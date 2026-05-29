<template>
  <div class="flex items-start gap-3 group">
    <!-- Icon dot -->
    <div :class="['w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150', dotClass]">
      <SidebarIcon :type="icon" class="w-3 h-3" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-xs text-gray-300 leading-snug">{{ label }}</p>
      <p class="text-[10px] text-gray-600 mt-0.5">{{ time }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ icon: string; label: string; time: string; type: string }>()

const dotClass = computed(() => ({
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  gold:    'bg-gold-500/10 text-gold-400 border border-gold-500/20',
  info:    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  error:   'bg-red-500/10 text-red-400 border border-red-500/20',
}[props.type] ?? 'bg-white/[0.06] text-gray-400'))
</script>
