<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="so-backdrop">
      <div v-if="modelValue"
           class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
           @click="close" />
    </Transition>

    <!-- Panel -->
    <Transition name="so-panel">
      <div v-if="modelValue"
           class="fixed right-0 top-0 h-full z-[101] flex flex-col"
           :style="`width: ${width}px`"
           style="background:rgba(16,12,8,0.99);border-left:1px solid rgba(255,255,255,0.08);box-shadow:-32px 0 80px rgba(0,0,0,0.7)">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 shrink-0"
             style="border-bottom:1px solid rgba(255,255,255,0.07)">
          <div class="min-w-0">
            <h3 class="text-base font-bold text-gray-100 truncate">{{ title }}</h3>
            <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5 truncate">{{ subtitle }}</p>
          </div>
          <div class="flex items-center gap-2 ml-3 shrink-0">
            <slot name="header-actions" />
            <button @click="close"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.08] transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 overflow-y-auto">
          <slot />
        </div>

        <!-- Sticky footer -->
        <div v-if="$slots.footer" class="shrink-0" style="border-top:1px solid rgba(255,255,255,0.07)">
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title: string
  subtitle?: string
  width?: number
}>(), { width: 460 })

const emit = defineEmits<{ 'update:modelValue': [boolean] }>()

function close() { emit('update:modelValue', false) }

// ESC key to close
if (import.meta.client) {
  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  })
}
</script>

<style scoped>
.so-backdrop-enter-active { transition: opacity 0.2s ease; }
.so-backdrop-leave-active { transition: opacity 0.15s ease; }
.so-backdrop-enter-from,
.so-backdrop-leave-to    { opacity: 0; }

.so-panel-enter-active { transition: transform 0.25s cubic-bezier(0.32,0.72,0,1); }
.so-panel-leave-active { transition: transform 0.2s cubic-bezier(0.32,0.72,0,1); }
.so-panel-enter-from,
.so-panel-leave-to    { transform: translateX(100%); }
</style>
