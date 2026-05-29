<template>
  <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/[0.04] group cursor-pointer">
    <div class="w-1.5 h-1.5 rounded-full shrink-0" :style="`background: ${statusColor}`" />
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono font-medium text-gold-400/80">{{ orderNo }}</span>
        <span :class="['badge text-[10px]', badgeClass]">{{ statusLabel }}</span>
      </div>
      <p class="text-xs text-gray-400 truncate mt-0.5">{{ customer }}</p>
    </div>
    <div class="text-right shrink-0">
      <p class="text-xs font-semibold text-gray-200">৳{{ (amount / 1000).toFixed(0) }}K</p>
    </div>
    <svg class="w-3.5 h-3.5 text-gray-700 group-hover:text-gold-500 transition-colors duration-150 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ orderNo: string; customer: string; amount: number; status: string }>()

const statusColor = computed(() => props.status === 'escalated' ? '#f97316' : '#f59e0b')
const statusLabel = computed(() => props.status === 'escalated' ? 'Escalated' : 'Pending')
const badgeClass = computed(() =>
  props.status === 'escalated'
    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
)
</script>
