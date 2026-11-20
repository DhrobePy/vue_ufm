<template>
  <div class="report-frame space-y-5">
    <!-- on-screen header + actions (not printed) -->
    <div class="no-print flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-100">{{ title }}</h1>
        <p class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-ghost text-xs" :disabled="!sheets.length" @click="exp.xlsx(filename, sheets, `${company.name} — ${title} (${period})`)">Excel</button>
        <button class="btn-ghost text-xs" :disabled="!sheets.length" @click="exp.csv(filename, sheets[activeSheet] ?? sheets[0])">CSV</button>
        <button class="btn-gold text-xs" @click="exp.print()">Print / PDF</button>
      </div>
    </div>
    <div class="no-print"><slot name="filters" /></div>

    <!-- printed letterhead -->
    <div class="print-only report-letterhead">
      <div><strong>{{ company.name }}</strong><div>{{ company.address }}</div><div>{{ company.phone }}</div></div>
      <div class="r"><strong>{{ title }}</strong><div>{{ period }}</div><div>Generated {{ now }}</div></div>
    </div>

    <slot />

    <div class="print-only report-foot">Prepared from live data · {{ company.name }} · {{ now }}</div>
  </div>
</template>

<script setup lang="ts">
import type { ReportSheet } from '~/composables/useReportExport'
const props = defineProps<{ title: string; subtitle?: string; period: string; filename: string; sheets: ReportSheet[]; activeSheet?: number }>()
const exp = useReportExport()
const { company } = useAppSettings()
const now = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', dateStyle: 'medium', timeStyle: 'short' })
void props
</script>

<style>
.print-only { display: none; }
@media print {
  @page { size: A4 landscape; margin: 9mm; }
  html, body, .app-shell { background: #fff !important; color: #000 !important; height: auto !important; overflow: visible !important; }
  body * { visibility: hidden; }
  .report-frame, .report-frame * { visibility: visible; }
  .report-frame { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  .report-frame .glass-card { background: #fff !important; border: 0 !important; box-shadow: none !important; padding: 0 !important; backdrop-filter: none !important; }
  .report-frame table { width: 100%; border-collapse: collapse; font-size: 9pt; color: #000; }
  .report-frame th { background: #eee !important; color: #000 !important; border: 1px solid #999; padding: 3px 5px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .report-frame td { border: 1px solid #ccc; padding: 2px 5px; color: #000 !important; }
  .report-frame tr { break-inside: avoid; }
  .report-frame thead { display: table-header-group; }
  .report-frame tfoot td { font-weight: 700; background: #f4f4f4 !important; }
  .report-letterhead { display: flex !important; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 8px; font-size: 9pt; color: #000; }
  .report-letterhead .r { text-align: right; }
  .report-foot { margin-top: 8px; font-size: 8pt; color: #555; text-align: center; }
}
</style>
