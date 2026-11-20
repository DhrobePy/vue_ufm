<template>
  <ReportFrame :title="`Chairman's Report — ${data?.label ?? ''}`" subtitle="Date-ranged reports for the chairman: sales, receivables, collections, expenses, purchases and more" :period="`${from} to ${to}`" :filename="`chairman_${type}_${from}_to_${to}`" :sheets="sheets">
    <template #filters>
      <div class="glass-card p-4 space-y-3">
        <div class="flex flex-wrap gap-1.5">
          <button v-for="(l, k) in data?.types ?? {}" :key="k" class="px-3 py-1.5 rounded-xl text-xs border transition-all"
                  :class="type === k ? 'bg-gold-500/15 text-gold-400 border-gold-500/25' : 'text-gray-500 border-white/[0.07] hover:text-gray-300'" @click="type = String(k)">{{ l }}</button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button v-for="p in presets" :key="p.l" class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200" @click="from = p.from; to = p.to">{{ p.l }}</button>
          <input v-model="from" type="date" class="field-input text-xs py-1.5 w-36" /><span class="text-xs text-gray-600">to</span><input v-model="to" type="date" class="field-input text-xs py-1.5 w-36" />
          <select v-model="branch" class="field-input text-xs py-1.5 w-44"><option value="">All factories</option><option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option></select>
        </div>
      </div>
    </template>
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>
    <template v-else-if="data">
      <p v-if="data.note" class="text-xs text-gray-500">{{ data.note }}</p>
      <ReportTable :cols="data.cols" :rows="data.rows" totals />
      <p class="no-print text-[11px] text-gray-600">{{ data.rows.length }} row(s). Use Excel / CSV for spreadsheets, Print / PDF for the formatted copy.</p>
    </template>
  </ReportFrame>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const dhaka = (d = new Date()) => new Date(d.getTime() + 6 * 3600_000).toISOString().slice(0, 10)
const t0 = dhaka(), mStart = t0.slice(0, 8) + '01'
const weekStart = dhaka(new Date(Date.now() - ((new Date(Date.now() + 6 * 3600_000).getUTCDay() + 6) % 7) * 86400_000))
const qStart = `${t0.slice(0, 4)}-${String(Math.floor((Number(t0.slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, '0')}-01`
const presets = [{ l: 'Today', from: t0, to: t0 }, { l: 'This week', from: weekStart, to: t0 }, { l: 'This month', from: mStart, to: t0 }, { l: 'This quarter', from: qStart, to: t0 }, { l: 'This year', from: t0.slice(0, 4) + '-01-01', to: t0 }]
const type = ref('completed_sales'), from = ref(mStart), to = ref(t0), branch = ref('')
const { data, pending, error } = await useFetch<any>('/api/admin/chairman-report', { query: computed(() => ({ type: type.value, date_from: from.value, date_to: to.value, branch_id: branch.value || undefined })), watch: [type, from, to, branch] })
const { data: bdata } = await useFetch<any>('/api/branches')
const branches = computed(() => (bdata.value?.branches ?? []) as any[])
const sheets = computed(() => data.value ? [{ name: String(data.value.label).slice(0, 30), cols: data.value.cols, rows: data.value.rows, totals: true }] : [])
</script>
