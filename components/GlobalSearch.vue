<template>
  <Teleport to="body">
    <Transition name="search-overlay">
      <div v-if="open" class="fixed inset-0 z-[150] flex items-start justify-center pt-[12vh] px-4">

        <!-- Backdrop — click anywhere outside the panel to close -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @mousedown="hide" />

        <!-- Panel -->
        <div class="relative w-full max-w-2xl animate-slide-up" @keydown.esc="hide">
          <div class="rounded-2xl overflow-hidden border border-white/[0.10]"
               style="background:rgba(22,18,14,0.97);box-shadow:0 32px 80px rgba(0,0,0,0.8)">

            <!-- Search input -->
            <div class="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
              <svg class="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                ref="inputRef"
                v-model="query"
                class="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none"
                placeholder="Search orders, customers, pages…"
                @keydown.down.prevent="moveCursor(1)"
                @keydown.up.prevent="moveCursor(-1)"
                @keydown.enter.prevent="selectCurrent"
                @keydown.esc="hide"
              />
              <kbd class="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-gray-600 font-mono border border-white/[0.08]">ESC</kbd>
            </div>

            <!-- Results -->
            <div class="max-h-[420px] overflow-y-auto py-2">
              <!-- Group label -->
              <template v-if="!query.trim()">
                <p class="px-4 pt-1 pb-2 text-[10px] uppercase tracking-widest text-gray-700 font-semibold">Quick navigation</p>
              </template>

              <div
                v-for="(item, idx) in results" :key="idx"
                @click="go(item)"
                @mouseenter="cursor = idx"
                :class="['flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-75',
                  cursor === idx ? 'bg-gold-500/10' : 'hover:bg-white/[0.03]']"
              >
                <span class="text-lg w-7 text-center shrink-0">{{ item.icon }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate" :class="cursor === idx ? 'text-gold-300' : 'text-gray-200'">
                    {{ item.label }}
                  </p>
                  <p v-if="item.sublabel" class="text-xs text-gray-600 truncate">{{ item.sublabel }}</p>
                </div>
                <span class="text-[10px] text-gray-700 uppercase tracking-wider shrink-0">{{ item.type }}</span>
              </div>

              <div v-if="!results.length" class="px-4 py-8 text-center">
                <p class="text-sm text-gray-600">No results for "<span class="text-gray-400">{{ query }}</span>"</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06]">
              <span class="text-[10px] text-gray-700 flex items-center gap-1.5">
                <kbd class="px-1 py-0.5 rounded bg-white/[0.07] font-mono border border-white/[0.08]">↑↓</kbd> navigate
              </span>
              <span class="text-[10px] text-gray-700 flex items-center gap-1.5">
                <kbd class="px-1 py-0.5 rounded bg-white/[0.07] font-mono border border-white/[0.08]">↵</kbd> go
              </span>
              <span class="ml-auto text-[10px] text-gray-700">{{ results.length }} results</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { open, query, results, hide } = useGlobalSearch()
const router    = useRouter()
const cursor    = ref(0)
const inputRef  = ref<HTMLInputElement>()

watch(open, (v) => {
  if (v) nextTick(() => inputRef.value?.focus())
  cursor.value = 0
})
watch(query, () => { cursor.value = 0 })

function moveCursor(dir: number) {
  cursor.value = Math.max(0, Math.min(results.value.length - 1, cursor.value + dir))
}

function selectCurrent() {
  const item = results.value[cursor.value]
  if (item) go(item)
}

function go(item: ReturnType<typeof results.value>[0]) {
  hide()
  router.push(item.route)
}

// Global keyboard shortcuts: ⌘K to open, ESC to close
if (import.meta.client) {
  useEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      open.value ? hide() : (open.value = true)
    } else if (e.key === 'Escape' && open.value) {
      e.preventDefault()
      hide()
    }
  })
}
</script>

<style scoped>
.search-overlay-enter-active, .search-overlay-leave-active { transition: all .15s ease; }
.search-overlay-enter-from, .search-overlay-leave-to { opacity: 0; }
</style>
