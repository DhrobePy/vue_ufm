<template>
  <div class="glass-card overflow-x-auto">
    <table class="w-full text-xs">
      <thead>
        <tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500">
          <th v-for="c in cols" :key="c.key" class="px-3 py-2 font-semibold whitespace-nowrap" :class="alignCls(c)">{{ c.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="i" class="border-b border-white/[0.04] hover:bg-white/[0.02]">
          <td v-for="c in cols" :key="c.key" class="px-3 py-1.5 whitespace-nowrap" :class="[alignCls(c), c.fmt === 'money' || c.fmt === 'qty' ? 'font-mono' : '']">{{ show(c, r[c.key]) }}</td>
        </tr>
        <tr v-if="!rows.length"><td :colspan="cols.length" class="px-3 py-8 text-center text-gray-600">No records for this period</td></tr>
      </tbody>
      <tfoot v-if="totals && rows.length">
        <tr class="border-t border-white/[0.12] font-semibold text-gray-200">
          <td v-for="(c, i) in cols" :key="c.key" class="px-3 py-2" :class="alignCls(c)">{{ i === 0 ? 'Total' : c.sum ? show(c, total(c)) : '' }}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ReportCol } from '~/composables/useReportExport'
const props = defineProps<{ cols: ReportCol[]; rows: Record<string, any>[]; totals?: boolean }>()
const alignCls = (c: ReportCol) => (c.align ?? (c.fmt === 'money' || c.fmt === 'qty' ? 'right' : 'left')) === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
const show = (c: ReportCol, v: any) => c.fmt === 'money' ? Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 }) : c.fmt === 'qty' ? Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 2 }) : (v ?? '')
const total = (c: ReportCol) => props.rows.reduce((a, r) => a + Number(r[c.key] ?? 0), 0)
</script>
