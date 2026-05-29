<template>
  <div class="glass-card px-4 py-3.5 flex items-center gap-3">
    <div class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 shrink-0"
         style="background: rgba(255,255,255,0.06);">
      <SidebarIcon :type="icon" class="w-3.5 h-3.5" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-[11px] text-gray-500 truncate">{{ label }}</p>
      <p class="text-base font-bold text-white leading-tight">{{ value }}</p>
    </div>
    <span :class="['text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0',
                   positive !== false ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10']">
      {{ delta }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: number; delta: string; icon: string; positive?: boolean }>()
</script>
