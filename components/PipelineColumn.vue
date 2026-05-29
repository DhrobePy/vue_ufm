<template>
  <NuxtLink :to="route" class="glass-card-hover p-4 text-center flex flex-col items-center gap-2 group">
    <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
         :style="`background: ${color}18; border: 1px solid ${color}30;`">
      <span class="font-display font-bold text-lg" :style="`color:${color}`">{{ count }}</span>
    </div>
    <span class="text-[11px] font-semibold text-gray-500 group-hover:text-gray-300 transition-colors text-center leading-tight">{{ label }}</span>
  </NuxtLink>
</template>
<script setup lang="ts">
defineProps<{ label: string; count: number; color: string; route: string; status: string }>()
</script>
