<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="overflow-visible">
    <!-- Bar sparkline -->
    <g v-if="type === 'bar'">
      <rect
        v-for="(val, i) in normalised"
        :key="i"
        :x="i * (barW + gap)"
        :y="height - val"
        :width="barW"
        :height="val"
        :fill="barFill(i)"
        :opacity="i === normalised.length - 1 ? 1 : 0.55"
        rx="1.5"
      />
    </g>

    <!-- Line sparkline -->
    <g v-else>
      <!-- Filled area under the line -->
      <path :d="areaPath" :fill="`url(#spark-grad-${uid})`" opacity="0.18" />
      <!-- Line itself -->
      <path :d="linePath" fill="none" :stroke="color" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <!-- Last point dot -->
      <circle :cx="points[points.length - 1][0]" :cy="points[points.length - 1][1]" r="2" :fill="color" />

      <defs>
        <linearGradient :id="`spark-grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="1" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
    </g>
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  values: number[]
  type?: 'bar' | 'line'
  color?: string
  width?: number
  height?: number
}>(), {
  type: 'line',
  color: '#10b981',
  width: 80,
  height: 28,
})

const uid = Math.random().toString(36).slice(2, 7)

const barW = computed(() => {
  const n = props.values.length || 7
  const totalGap = (n - 1) * 2
  return (props.width - totalGap) / n
})
const gap = 2

const min = computed(() => Math.min(...props.values))
const max = computed(() => Math.max(...props.values))
const range = computed(() => (max.value - min.value) || 1)

const normalised = computed(() =>
  props.values.map(v => Math.max(2, ((v - min.value) / range.value) * (props.height - 4) + 2))
)

function barFill(i: number) {
  const isUp = props.values[i] >= (props.values[i - 1] ?? props.values[i])
  return isUp ? '#10b981' : '#f87171'
}

// Line chart points
const points = computed<[number, number][]>(() => {
  const n = props.values.length
  return props.values.map((v, i) => [
    (i / (n - 1)) * props.width,
    props.height - ((v - min.value) / range.value) * (props.height - 4) - 2,
  ])
})

const linePath = computed(() => {
  if (points.value.length < 2) return ''
  const [first, ...rest] = points.value
  return `M${first[0]},${first[1]} ` + rest.map(([x, y]) => `L${x},${y}`).join(' ')
})

const areaPath = computed(() => {
  if (points.value.length < 2) return ''
  const first = points.value[0]
  const last  = points.value[points.value.length - 1]
  return `${linePath.value} L${last[0]},${props.height} L${first[0]},${props.height} Z`
})
</script>
