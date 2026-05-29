<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none" style="max-width:360px;width:100%">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-2xl border backdrop-blur-xl"
          :class="toastClass(t.type)"
        >
          <!-- Icon -->
          <span class="text-lg shrink-0 mt-0.5">{{ toastIcon(t.type) }}</span>
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-snug" :class="titleClass(t.type)">{{ t.title }}</p>
            <p v-if="t.message" class="text-xs opacity-75 mt-0.5 leading-relaxed">{{ t.message }}</p>
          </div>
          <!-- Close -->
          <button @click="remove(t.id)"
            class="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()

function toastClass(type: string) {
  return {
    success: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100',
    error:   'bg-red-950/90 border-red-500/30 text-red-100',
    warning: 'bg-yellow-950/90 border-yellow-500/30 text-yellow-100',
    info:    'bg-blue-950/90 border-blue-500/30 text-blue-100',
  }[type] ?? 'bg-surface-300/90 border-white/10 text-gray-200'
}

function titleClass(type: string) {
  return {
    success: 'text-emerald-300',
    error:   'text-red-300',
    warning: 'text-yellow-300',
    info:    'text-blue-300',
  }[type] ?? 'text-gray-200'
}

function toastIcon(type: string) {
  return { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type] ?? '💬'
}
</script>

<style scoped>
.toast-enter-active  { transition: all .25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active  { transition: all .2s ease; }
.toast-enter-from    { opacity: 0; transform: translateX(100%) scale(0.9); }
.toast-leave-to      { opacity: 0; transform: translateX(100%); }
.toast-move          { transition: transform .25s ease; }
</style>
