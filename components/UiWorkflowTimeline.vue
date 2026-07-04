<template>
  <div class="glass-card p-5">
    <div class="flex items-center justify-between mb-5">
      <h3 class="section-title flex items-center gap-2">
        <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Order Timeline
      </h3>
      <UiStatusBadge v-if="currentStatus" :status="currentStatus" />
    </div>

    <div v-if="!nodes.length" class="text-xs text-gray-600 italic py-6 text-center">No events yet</div>

    <div v-else class="overflow-x-auto pb-1 -mx-1 px-1" style="scrollbar-width: thin;">
      <div class="flex items-start gap-0 min-w-max">
        <div v-for="(n, i) in nodes" :key="n.id"
             class="flex items-start tl-node" :style="`animation-delay:${i * 60}ms`">

          <!-- Node column -->
          <div class="flex flex-col items-center w-[132px] shrink-0">
            <div class="w-11 h-11 rounded-full flex items-center justify-center border-2 shrink-0 relative"
                 :style="`background:${n.color}1f;border-color:${n.color}55;color:${n.color}`">
              <div v-if="i === nodes.length - 1 && n.pulse"
                   class="absolute inset-0 rounded-full animate-ping opacity-25"
                   :style="`background:${n.color}`" />
              <svg class="w-5 h-5 relative z-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS[n.icon] ?? ICONS.dot"/>
              </svg>
            </div>
            <p class="text-[11px] font-bold text-gray-200 text-center mt-2.5 leading-tight px-1">{{ n.title }}</p>
            <p class="text-[10px] text-gray-600 mt-0.5 font-mono">{{ n.date }}</p>

            <!-- Description card -->
            <div class="mt-2.5 w-[124px] rounded-lg px-2.5 py-2 text-[10px] leading-snug"
                 :style="`background:${n.color}12; border:1px solid ${n.color}2a`">
              <p class="text-gray-300 break-words">{{ n.description }}</p>
              <p v-if="n.by" class="text-gray-600 mt-1 pt-1 border-t truncate" :style="`border-color:${n.color}20`">
                👤 {{ n.by }}
              </p>
            </div>
          </div>

          <!-- Connecting rail -->
          <div v-if="i < nodes.length - 1" class="h-11 flex items-center shrink-0" style="width:28px">
            <div class="h-0.5 w-full rounded-full" :style="`background:linear-gradient(90deg, ${n.color}55, ${nodes[i+1].color}55)`"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TimelineNode {
  id: string | number
  icon: string
  color: string
  title: string
  date: string
  description: string
  by?: string
  pulse?: boolean
}

defineProps<{
  nodes: TimelineNode[]
  currentStatus?: string
}>()

// Small self-contained icon set — consistent with the rest of the app's
// hand-coded inline SVGs (no icon library dependency).
const ICONS: Record<string, string> = {
  cart:        'M3 3h2l.4 2M7 13h10l3.6-8H5.4M7 13L5.4 5M7 13l-2.3 4.6A1 1 0 005.6 19H17M17 13v6M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z',
  check:       'M5 13l4 4L19 7',
  checkDouble: 'M2 13l4 4L14 9M8 13l4 4L22 7',
  hand:        'M8 12V6a1.5 1.5 0 013 0v5m0-4V4a1.5 1.5 0 013 0v6m0-4a1.5 1.5 0 013 0v5m0 0v1a6 6 0 01-6 6h-2a6 6 0 01-5-2.7L4.3 13a1.5 1.5 0 012.4-1.8l1.3 1.5',
  play:        'M14.752 11.168l-6.518-3.75A1 1 0 007 8.25v7.5a1 1 0 001.234.972l6.518-1.878a1 1 0 000-1.928l0 0zM5 5v14',
  truck:       'M3 16V6a1 1 0 011-1h9a1 1 0 011 1v10M3 16h11m0-10h3.5a1 1 0 01.8.4l2.7 3.6v6H14V6zm-8.5 12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  package:     'M20 7L12 3 4 7m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  money:       'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  undo:        'M9 14l-4-4 4-4m-4 4h11a4 4 0 010 8h-1',
  edit:        'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l9.586-9.586z',
  alert:       'M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z',
  x:           'M6 18L18 6M6 6l12 12',
  lock:        'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  unlock:      'M8 11V7a4 4 0 118 0m-9 4h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6a2 2 0 012-2z',
  dot:         'M12 8v.01M12 12v4',
}
</script>

<style scoped>
.tl-node { animation: tl-in 0.35s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .tl-node { animation: none; }
}
@keyframes tl-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
