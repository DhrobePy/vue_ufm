<template>
  <div class="space-y-6">
    <UiPageHeader title="NBR Tax Statement" subtitle="Corporate income tax return DRAFT — P&amp;L, Balance Sheet, worksheet"
                  :breadcrumb="['Accounts', 'Tax Statement']">
      <template #actions>
        <button @click="exportCsv" class="btn-ghost text-xs">⬇ CSV</button>
        <button @click="printStatement" class="btn-gold text-xs">🖨 Print</button>
      </template>
    </UiPageHeader>

    <div class="rounded-xl p-3 text-xs text-amber-300" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);">
      ⚠ <strong>DRAFT — not for filing.</strong> This report shows the system's P&amp;L and Balance Sheet for the selected fiscal year. It does NOT compute disallowed-expense adjustments, depreciation, or final tax liability — this system has no fixed-asset/depreciation register. Hand this to your accountant as a starting point, not a final return.
    </div>

    <!-- Fiscal year + company info -->
    <div class="glass-card p-4 flex flex-wrap items-end gap-3">
      <div class="space-y-1">
        <label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Fiscal Year</label>
        <select v-model.number="selectedFy" class="input-glass text-xs py-1.5">
          <option v-for="y in fyOptions" :key="y" :value="y">FY {{ y }}-{{ String(y + 1).slice(2) }}</option>
        </select>
      </div>
      <p class="text-xs text-gray-500 pb-1.5">{{ fiscalYear.from }} to {{ fiscalYear.to }}</p>
      <span class="flex-1" />
      <button v-if="isAdminUser" @click="showCompanySettings = !showCompanySettings" class="btn-ghost text-xs py-2">
        {{ showCompanySettings ? 'Hide' : 'Edit' }} Company Info
      </button>
    </div>

    <!-- Company tax-identity settings (admin only) -->
    <div v-if="showCompanySettings && isAdminUser" class="glass-card p-5 space-y-3">
      <h3 class="section-title">Company Tax Identity</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Legal Name</label>
          <input v-model="companyForm.legal_name" class="input-glass text-xs" placeholder="Registered company name" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Address</label>
          <input v-model="companyForm.address" class="input-glass text-xs" placeholder="Registered address" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">TIN</label>
          <input v-model="companyForm.tin" class="input-glass text-xs font-mono" placeholder="Taxpayer ID Number" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">BIN</label>
          <input v-model="companyForm.bin" class="input-glass text-xs font-mono" placeholder="Business ID Number" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Fiscal Year Starts (Month)</label>
          <select v-model.number="companyForm.fiscal_year_start_month" class="input-glass text-xs">
            <option v-for="m in 12" :key="m" :value="m">{{ new Date(2000, m - 1, 1).toLocaleString('en', { month: 'long' }) }}</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end">
        <button @click="saveCompanySettings" :disabled="savingCompany" class="btn-gold text-xs disabled:opacity-50">
          {{ savingCompany ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>

    <!-- Profit & Loss -->
    <div id="tax-statement-print" class="glass-card p-6">
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold text-gray-100">{{ company.legal_name || 'Ujjal Flour Mills' }}</h2>
        <p class="text-xs text-gray-500 mt-1">Profit &amp; Loss Statement — {{ fiscalYear.label }} ({{ fiscalYear.from }} to {{ fiscalYear.to }})</p>
        <p v-if="company.tin || company.bin" class="text-[11px] text-gray-600 mt-0.5">
          {{ company.tin ? `TIN: ${company.tin}` : '' }}{{ company.tin && company.bin ? ' · ' : '' }}{{ company.bin ? `BIN: ${company.bin}` : '' }}
        </p>
      </div>

      <div class="max-w-lg mx-auto space-y-6">
        <div>
          <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Revenue</h3>
          <div v-for="item in pl.revenue" :key="item.code" class="flex justify-between py-1.5 text-sm">
            <span class="text-gray-400 pl-4">{{ item.name }}</span>
            <span class="font-mono text-gray-200">৳{{ Number(item.amount).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between py-2 border-t border-white/[0.06] mt-1">
            <span class="font-bold text-gray-200">Total Revenue</span>
            <span class="font-bold font-mono text-emerald-400">৳{{ Number(pl.totalRevenue).toLocaleString() }}</span>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Cost of Goods Sold</h3>
          <div v-for="item in pl.cogs" :key="item.code" class="flex justify-between py-1.5 text-sm">
            <span class="text-gray-400 pl-4">{{ item.name }}</span>
            <span class="font-mono text-gray-200">৳{{ Number(item.amount).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between py-2 border-t border-white/[0.06] mt-1">
            <span class="font-bold text-gray-200">Gross Profit</span>
            <span class="font-bold font-mono text-gold-400">৳{{ Number(pl.grossProfit).toLocaleString() }}</span>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Operating Expenses</h3>
          <div v-for="item in pl.opex" :key="item.code" class="flex justify-between py-1.5 text-sm">
            <span class="text-gray-400 pl-4">{{ item.name }}</span>
            <span class="font-mono text-gray-200">৳{{ Number(item.amount).toLocaleString() }}</span>
          </div>
        </div>

        <div class="border-t-2 border-gold-500/30 pt-4">
          <div class="flex justify-between">
            <span class="text-lg font-bold text-gray-100">Net Profit (Accounting)</span>
            <span class="text-xl font-bold font-mono text-gold-400">৳{{ Number(pl.netProfit).toLocaleString() }}</span>
          </div>
          <p class="text-right text-xs text-gray-500 mt-1">Net margin: {{ pl.totalRevenue ? Math.round(pl.netProfit / pl.totalRevenue * 100) : 0 }}%</p>
        </div>
      </div>
    </div>

    <!-- Balance Sheet -->
    <div class="glass-card p-6">
      <div class="text-center mb-6">
        <h2 class="text-lg font-bold text-gray-100">Balance Sheet</h2>
        <p class="text-xs text-gray-500 mt-1">As at {{ fiscalYear.to }}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Assets</h3>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Current Assets</p>
            <div v-for="item in bs.currentAssets" :key="item.code" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ Number(item.amount).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-t border-white/[0.06] mt-1 text-sm font-semibold">
              <span class="text-gray-300">Total Current Assets</span>
              <span class="font-mono text-emerald-400">{{ Number(bs.totalCurrentAssets).toLocaleString() }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Fixed Assets</p>
            <div v-for="item in bs.fixedAssets" :key="item.code" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ Number(item.amount).toLocaleString() }}</span>
            </div>
            <p v-if="!bs.fixedAssets.length" class="text-[11px] text-gray-600 pl-3">No fixed-asset accounts posted — this system has no depreciation register.</p>
            <div class="flex justify-between py-1.5 border-t border-white/[0.06] mt-1 text-sm font-semibold">
              <span class="text-gray-300">Total Fixed Assets</span>
              <span class="font-mono text-emerald-400">{{ Number(bs.totalFixedAssets).toLocaleString() }}</span>
            </div>
          </div>
          <div class="border-t-2 border-white/10 pt-2 flex justify-between font-bold">
            <span class="text-gray-100">Total Assets</span>
            <span class="font-mono text-gold-400">{{ Number(bs.totalAssets).toLocaleString() }}</span>
          </div>
        </div>
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-red-400 uppercase tracking-wider">Liabilities &amp; Equity</h3>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Current Liabilities</p>
            <div v-for="item in bs.currentLiabilities" :key="item.code" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ Number(item.amount).toLocaleString() }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Long-term Liabilities</p>
            <div v-for="item in bs.longTermLiabilities" :key="item.code" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ Number(item.amount).toLocaleString() }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Equity</p>
            <div v-for="item in bs.equity" :key="item.code" class="flex justify-between py-1 text-sm">
              <span class="text-gray-400 pl-3">{{ item.name }}</span>
              <span class="font-mono text-gray-200">{{ Number(item.amount).toLocaleString() }}</span>
            </div>
          </div>
          <div class="border-t-2 border-white/10 pt-2 flex justify-between font-bold">
            <span class="text-gray-100">Total Liabilities &amp; Equity</span>
            <span class="font-mono text-gold-400">{{ Number(bs.totalLiabAndEquity).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tax Computation Worksheet — deliberately blank -->
    <div class="glass-card p-6">
      <h2 class="text-lg font-bold text-gray-100 text-center mb-1">Tax Computation Worksheet</h2>
      <p class="text-xs text-gray-500 text-center mb-6">For your accountant to complete — this system does not compute these figures</p>
      <div class="max-w-lg mx-auto space-y-2 text-sm">
        <div class="flex justify-between py-2 border-b border-white/[0.06]">
          <span class="text-gray-300">Net Profit per Accounts</span>
          <span class="font-mono text-gray-200">৳{{ Number(pl.netProfit).toLocaleString() }}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-white/[0.06]">
          <span class="text-gray-500">Add: Disallowed Expenses</span>
          <span class="font-mono text-gray-600">—</span>
        </div>
        <div class="flex justify-between py-2 border-b border-white/[0.06]">
          <span class="text-gray-500">Less: Depreciation (Tax Rate)</span>
          <span class="font-mono text-gray-600">—</span>
        </div>
        <div class="flex justify-between py-2 border-b border-white/[0.06]">
          <span class="text-gray-500">Less: Other Tax Adjustments</span>
          <span class="font-mono text-gray-600">—</span>
        </div>
        <div class="flex justify-between py-3 border-t-2 border-white/10 font-bold">
          <span class="text-gray-200">Taxable Income</span>
          <span class="font-mono text-gray-600">— (not computed)</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-gray-500">Tax Liability</span>
          <span class="font-mono text-gray-600">— (not computed)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { printElement } = usePrint()
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isAdminUser = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const now = new Date()
const defaultFy = ref(now.getFullYear())

const { data: settingsData } = await useFetch('/api/settings/tax')
const fyStartMonth = computed(() => (settingsData.value as any)?.fiscal_year_start_month ?? 7)
if ((settingsData.value as any)) {
  defaultFy.value = now.getMonth() + 1 >= fyStartMonth.value ? now.getFullYear() : now.getFullYear() - 1
}
const selectedFy = ref(defaultFy.value)
const fyOptions = computed(() => {
  const years = []
  for (let y = defaultFy.value; y >= defaultFy.value - 4; y--) years.push(y)
  return years
})

const { data, refresh } = await useFetch(() => `/api/accounts/tax-statement?fy=${selectedFy.value}`)
watch(selectedFy, () => refresh())

const company     = computed<any>(() => (data.value as any)?.company ?? {})
const fiscalYear  = computed<any>(() => (data.value as any)?.fiscal_year ?? { label: '', from: '', to: '' })
const pl          = computed<any>(() => (data.value as any)?.pl ?? { revenue: [], totalRevenue: 0, cogs: [], grossProfit: 0, opex: [], netProfit: 0 })
const bs          = computed<any>(() => (data.value as any)?.bs ?? {
  currentAssets: [], totalCurrentAssets: 0, fixedAssets: [], totalFixedAssets: 0, totalAssets: 0,
  currentLiabilities: [], longTermLiabilities: [], equity: [], totalLiabAndEquity: 0,
})

const showCompanySettings = ref(false)
const savingCompany = ref(false)
const companyForm = reactive({ tin: '', bin: '', legal_name: '', address: '', fiscal_year_start_month: 7 })
watch(company, (c) => {
  companyForm.tin = c.tin ?? ''
  companyForm.bin = c.bin ?? ''
  companyForm.legal_name = c.legal_name ?? ''
  companyForm.address = c.address ?? ''
  companyForm.fiscal_year_start_month = c.fiscal_year_start_month ?? 7
}, { immediate: true })

async function saveCompanySettings() {
  savingCompany.value = true
  try {
    await $fetch('/api/settings/tax', { method: 'PUT', body: companyForm })
    success('Company tax info saved ✓')
    showCompanySettings.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to save')
  } finally {
    savingCompany.value = false
  }
}

function printStatement() {
  printElement('tax-statement-print', `Tax Statement — ${fiscalYear.value.label}`)
}

function exportCsv() {
  const rows: any[] = [
    ['NBR Tax Statement DRAFT', fiscalYear.value.label, `${fiscalYear.value.from} to ${fiscalYear.value.to}`],
    [],
    ['Profit & Loss'],
    ['Revenue'],
    ...pl.value.revenue.map((r: any) => [r.code, r.name, r.amount]),
    ['Total Revenue', '', pl.value.totalRevenue],
    ['Cost of Goods Sold'],
    ...pl.value.cogs.map((r: any) => [r.code, r.name, r.amount]),
    ['Gross Profit', '', pl.value.grossProfit],
    ['Operating Expenses'],
    ...pl.value.opex.map((r: any) => [r.code, r.name, r.amount]),
    ['Net Profit', '', pl.value.netProfit],
    [],
    ['Balance Sheet'],
    ['Current Assets'],
    ...bs.value.currentAssets.map((r: any) => [r.code, r.name, r.amount]),
    ['Fixed Assets'],
    ...bs.value.fixedAssets.map((r: any) => [r.code, r.name, r.amount]),
    ['Total Assets', '', bs.value.totalAssets],
    ['Current Liabilities'],
    ...bs.value.currentLiabilities.map((r: any) => [r.code, r.name, r.amount]),
    ['Long-term Liabilities'],
    ...bs.value.longTermLiabilities.map((r: any) => [r.code, r.name, r.amount]),
    ['Equity'],
    ...bs.value.equity.map((r: any) => [r.code, r.name, r.amount]),
    ['Total Liabilities & Equity', '', bs.value.totalLiabAndEquity],
  ]
  const csv = rows.map(r => r.map((v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `tax-statement-${fiscalYear.value.from}-${fiscalYear.value.to}.csv`
  a.click()
}
</script>
