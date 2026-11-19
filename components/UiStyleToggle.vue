<template>
  <!-- Segmented control (HIG): switches the whole interface between the Apple style (default) and the original look. -->
  <div role="radiogroup" aria-label="Interface style" class="seg" :class="{ 'seg-lg': size === 'lg' }">
    <button v-for="o in OPTIONS" :key="o.value" type="button" role="radio"
            :aria-checked="theme.uiStyle.value === o.value" :class="{ on: theme.uiStyle.value === o.value }"
            :title="o.hint" @click="theme.setUiStyle(o.value)">
      {{ o.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ size?: 'sm' | 'lg' }>()
const theme = useTheme()
const OPTIONS = [
  { value: 'apple' as const,   label: 'Apple',   hint: 'Apple Human Interface style — follows your device’s light / dark setting' },
  { value: 'classic' as const, label: 'Classic', hint: 'The original gold look, with your chosen theme' },
]
</script>

<style scoped>
.seg { display: inline-flex; padding: 2px; border-radius: 9px; background: rgb(var(--tint) / 0.1); gap: 2px; }
.seg button { padding: 3px 11px; border-radius: 7px; font-size: 12px; font-weight: 500; line-height: 1.5; color: rgb(var(--tint) / 0.7); transition: background .15s ease, color .15s ease; white-space: nowrap; }
.seg button:hover:not(.on) { color: rgb(var(--tint) / 0.95); }
.seg button.on { background: rgb(var(--tint) / 0.2); color: rgb(var(--tint) / 1); font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.18); }
html[data-theme="light"] .seg button.on { background: #fff; color: #111; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
.seg-lg button { padding: 6px 18px; font-size: 13px; }
@media (pointer: coarse) { .seg button { min-height: 32px; } .seg-lg button { min-height: 40px; } }
</style>
