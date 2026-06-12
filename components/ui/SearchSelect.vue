<template>
  <div class="relative" ref="rootRef">
    <div class="relative">
      <input
        v-model="query"
        type="text"
        class="input-glass w-full pr-8"
        :placeholder="placeholder"
        autocomplete="off"
        @focus="open = true"
        @input="onInput"
        @keydown.enter.prevent="selectFirst"
        @keydown.esc="open = false"
      />
      <button v-if="modelValue" type="button" @click="clear"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <svg v-else class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/></svg>
    </div>

    <!-- Dropdown — solid dark panel so text is readable against any background -->
    <div v-if="open && filtered.length"
      class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl max-h-56 overflow-y-auto py-1.5"
      style="background:rgba(18,18,20,0.98);border:1px solid rgba(255,255,255,0.10);box-shadow:0 16px 40px rgba(0,0,0,0.65);backdrop-filter:blur(20px)">
      <button
        v-for="opt in filtered" :key="opt.value"
        type="button"
        class="w-full text-left px-4 py-2.5 hover:bg-white/[0.07] transition-colors"
        @mousedown.prevent="select(opt)">
        <span class="text-sm text-gray-100 font-medium">{{ opt.label }}</span>
        <span v-if="opt.sub" class="text-xs text-gray-500 ml-2">{{ opt.sub }}</span>
      </button>
    </div>
    <div v-else-if="open && query.length >= 1 && !filtered.length"
      class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl py-3 text-center text-xs text-gray-500"
      style="background:rgba(18,18,20,0.98);border:1px solid rgba(255,255,255,0.10);box-shadow:0 16px 40px rgba(0,0,0,0.65)">
      No match for "{{ query }}"
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * UiSearchSelect — searchable combobox (type-to-filter dropdown).
 * Options: [{ value, label, sub? }]. v-model holds the selected value.
 * Visual style matches the customer combobox on the create-order page.
 */
export interface SearchOption { value: string | number; label: string; sub?: string }

const props = defineProps<{
  modelValue: string | number | null | undefined
  options: SearchOption[]
  placeholder?: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string | number | ''): void }>()

const query = ref('')
const open  = ref(false)
const rootRef = ref<HTMLElement | null>(null)

onClickOutside(rootRef, () => { open.value = false; syncQueryToSelection() })

const selected = computed(() =>
  props.options.find(o => String(o.value) === String(props.modelValue ?? '')) ?? null,
)

function syncQueryToSelection() {
  query.value = selected.value?.label ?? ''
}
watch(selected, syncQueryToSelection, { immediate: true })

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  // When the input still shows the selected label, show the full list
  if (!q || (selected.value && q === selected.value.label.toLowerCase())) return props.options
  return props.options.filter(o =>
    o.label.toLowerCase().includes(q) || (o.sub ?? '').toLowerCase().includes(q),
  )
})

function onInput() {
  open.value = true
  if (props.modelValue) emit('update:modelValue', '') // typing deselects
}
function select(opt: SearchOption) {
  emit('update:modelValue', opt.value)
  query.value = opt.label
  open.value = false
}
function selectFirst() {
  if (filtered.value.length) select(filtered.value[0])
}
function clear() {
  emit('update:modelValue', '')
  query.value = ''
  open.value = false
}
</script>
