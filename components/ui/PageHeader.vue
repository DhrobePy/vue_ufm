<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <div v-if="breadcrumb" class="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
        <span v-for="(crumb, i) in breadcrumb" :key="i" class="flex items-center gap-1.5">
          <span :class="i === breadcrumb.length - 1 ? 'text-gray-400' : 'hover:text-gray-400 cursor-pointer transition-colors'">{{ crumb }}</span>
          <svg v-if="i < breadcrumb.length - 1" class="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </span>
      </div>
      <h1 class="font-display font-bold text-xl text-white tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  breadcrumb?: string[]
}>()
</script>
