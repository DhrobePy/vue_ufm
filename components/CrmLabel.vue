<template><span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap" :class="cls">{{ label }}</span></template>
<script setup lang="ts">
const props = defineProps<{ label: string }>()
const cls = computed(() => ({
  Risky: 'bg-red-500/15 text-red-300', Slipping: 'bg-amber-500/15 text-amber-300', Dormant: 'bg-orange-500/15 text-orange-300', Growing: 'bg-emerald-500/15 text-emerald-300',
  Loyal: 'bg-blue-500/15 text-blue-300', Steady: 'bg-white/10 text-gray-300', 'Never bought': 'bg-white/5 text-gray-500',
} as Record<string, string>)[props.label] ?? 'bg-white/10 text-gray-300')
</script>
