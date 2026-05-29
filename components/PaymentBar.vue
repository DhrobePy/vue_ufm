<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-400 font-medium">{{ label }}</span>
      <span class="text-gray-300 font-semibold">{{ value }} <span class="text-gray-600 font-normal">({{ pct }}%)</span></span>
    </div>
    <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-700 ease-out"
        :style="`width: ${pct}%; background: ${color}; box-shadow: 0 0 8px ${color}55`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; pct: number; value: string; color: string }>()
</script>
