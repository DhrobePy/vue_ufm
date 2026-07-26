<template>
  <div class="space-y-6">
    <UiPageHeader title="Commodity Sales" subtitle="Record a trading sale — manual pricing, per-origin stock, maker/checker"
                  :breadcrumb="['Trading', 'Sales']" />

    <!-- New sale form -->
    <div class="glass-card p-6 space-y-4 max-w-4xl">
      <h3 class="section-title">New Sale</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-1.5 md:col-span-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer *</label>
          <UiSearchSelect v-model="form.customerId" :options="customerOptions" placeholder="Search customer…" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sale Date{{ isAdminUser ? ' (backdatable)' : '' }}</label>
          <input v-model="form.saleDate" type="date" :max="todayStr" :disabled="!isAdminUser" class="input-glass" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commodity *</label>
          <select v-model="form.commodityId" class="input-glass" @change="form.origin = ''">
            <option value="">Select…</option>
            <option v-for="c in commodities" :key="c.id" :value="String(c.id)" :disabled="!c.ready">
              {{ c.name }} ({{ c.unit }}){{ c.ready ? '' : ' — no GL account set' }}
            </option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Origin</label>
          <select v-model="form.origin" class="input-glass">
            <option value="">Not tracked</option>
            <option v-for="o in selectedCommodity?.origins ?? []" :key="o" :value="o">{{ o }}</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</label>
          <select v-model="form.branchId" class="input-glass">
            <option value="">— None —</option>
            <option v-for="b in branches" :key="b.id" :value="String(b.id)">{{ b.name }}</option>
          </select>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity * <span v-if="selectedCommodity" class="normal-case">({{ selectedCommodity.unit }})</span></label>
          <input v-model.number="form.quantity" type="number" min="0" step="any" class="input-glass font-mono" />
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price * (৳)</label>
          <input v-model.number="form.unitPrice" type="number" min="0" step="any" class="input-glass font-mono"
                 :placeholder="avgCostHint ? `avg cost ৳${avgCostHint.toLocaleString()}` : ''" />
          <p v-if="avgCostHint" class="text-[10px] text-gray-600">Reference: weighted-avg cost ৳{{ avgCostHint.toLocaleString() }}</p>
        </div>
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</label>
          <p class="text-lg font-bold text-gold-400 pt-1.5">৳{{ totalAmount.toLocaleString() }}</p>
        </div>
        <div class="md:col-span-3 space-y-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</label>
          <input v-model="form.notes" class="input-glass" placeholder="Optional…" />
        </div>
      </div>

      <!-- Stock warn + override -->
      <div v-if="stockWarning" class="rounded-xl p-3 text-xs text-amber-300 space-y-2" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);">
        <p>⚠ {{ stockWarning }}</p>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="form.stockOverride" type="checkbox" class="accent-amber-500" />
          <span class="text-gray-300">Sell anyway — I understand stock will go negative</span>
        </label>
      </div>

      <div class="flex justify-end">
        <button @click="submit" :disabled="!canSubmit || submitting" class="btn-gold text-xs disabled:opacity-50">
          {{ submitting ? 'Recording…' : 'Record Sale' }}
        </button>
      </div>
    </div>

    <!-- Recent sales -->
    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Recent Sales</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Sale #</th><th class="text-left pr-3">Date</th>
            <th class="text-left pr-3">Customer</th><th class="text-left pr-3">Commodity</th>
            <th class="text-right pr-3">Qty</th><th class="text-right pr-3">Total</th>
            <th class="text-right pr-3">Due</th><th class="text-left pr-3">Dispatch</th><th></th>
          </tr></thead>
          <tbody>
            <tr v-for="s in sales" :key="s.id" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3"><NuxtLink :to="`/trading/sales/${s.id}`" class="font-mono text-gold-400 hover:underline">{{ s.sale_number }}</NuxtLink></td>
              <td class="pr-3 text-gray-400">{{ String(s.sale_date).slice(0, 10) }}</td>
              <td class="pr-3 text-gray-200">{{ s.customer_name }}</td>
              <td class="pr-3 text-gray-400">{{ s.commodity_name }}{{ s.origin ? ` (${s.origin})` : '' }}</td>
              <td class="pr-3 text-right font-mono text-gray-300">{{ Number(s.quantity).toLocaleString() }} {{ s.unit }}</td>
              <td class="pr-3 text-right font-mono text-gray-200">৳{{ Number(s.total_amount).toLocaleString() }}</td>
              <td :class="['pr-3 text-right font-mono', Number(s.balance_due) > 0 ? 'text-orange-400' : 'text-emerald-400']">৳{{ Number(s.balance_due).toLocaleString() }}</td>
              <td class="pr-3 text-gray-500">{{ s.delivered_at ? '✅ Delivered' : s.gate_out_at ? '🚚 In transit' : '—' }}</td>
              <td class="text-right"><NuxtLink :to="`/trading/sales/${s.id}`" class="btn-ghost text-[10px] py-1">Open</NuxtLink></td>
            </tr>
            <tr v-if="!sales.length"><td colspan="9" class="py-6 text-center text-gray-600">No sales yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isAdminUser = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))
const todayStr = new Date().toISOString().slice(0, 10)

const [{ data: comData }, { data: custData }, { data: branchData }, { data: salesData, refresh: refreshSales }] = await Promise.all([
  useFetch('/api/trading/commodities'),
  useFetch('/api/customers', { query: { per: 500, simple: '1' } }),
  useFetch('/api/branches'),
  useFetch('/api/trading/sales'),
])

const commodities = computed<any[]>(() => (comData.value as any)?.commodities ?? [])
const branches    = computed<any[]>(() => (((branchData.value as any)?.branches ?? []) as any[]).filter(b => b.status === 'active'))
const sales       = computed<any[]>(() => (salesData.value as any)?.sales ?? [])
const customerOptions = computed(() => ((custData.value as any)?.customers ?? []).map((c: any) => ({
  value: c.id, label: c.name, sub: c.business_name || '',
})))

const form = reactive({
  customerId: '' as string | number, commodityId: '', origin: '', branchId: '',
  saleDate: todayStr, quantity: 0, unitPrice: 0, notes: '', stockOverride: false,
})

const selectedCommodity = computed(() => commodities.value.find(c => String(c.id) === form.commodityId))
const stockRow = computed(() => (selectedCommodity.value?.stock ?? []).find((s: any) =>
  String(s.branch_id) === String(form.branchId || 0) && s.origin === form.origin))
const avgCostHint = computed(() => stockRow.value?.avg_cost ?? 0)
const onHand      = computed(() => stockRow.value?.qty ?? 0)
const totalAmount = computed(() => Math.round((form.quantity || 0) * (form.unitPrice || 0) * 100) / 100)
const stockWarning = computed(() => {
  if (!form.commodityId || !form.quantity) return ''
  if (form.quantity > onHand.value)
    return `Only ${onHand.value.toLocaleString()} ${selectedCommodity.value?.unit ?? ''} on hand${form.origin ? ` for ${form.origin}` : ''} — this sale would go ${(form.quantity - onHand.value).toLocaleString()} negative.`
  return ''
})
const canSubmit = computed(() =>
  !!form.customerId && !!form.commodityId && form.quantity > 0 && form.unitPrice > 0 &&
  (!stockWarning.value || form.stockOverride))

const submitting = ref(false)
async function submit() {
  submitting.value = true
  try {
    const res: any = await $fetch('/api/trading/sales', {
      method: 'POST',
      body: {
        customer_id: Number(form.customerId),
        commodity_id: Number(form.commodityId),
        branch_id: form.branchId ? Number(form.branchId) : null,
        origin: form.origin,
        sale_date: form.saleDate,
        quantity: form.quantity,
        unit_price: form.unitPrice,
        stock_override: form.stockOverride,
        notes: form.notes || null,
      },
    })
    if (res.queued) {
      success(res.message ?? 'Sale queued for approval')
    } else {
      success(`${res.sale_number} recorded — ৳${Number(res.total_amount).toLocaleString()} ✓`)
    }
    Object.assign(form, { commodityId: '', origin: '', quantity: 0, unitPrice: 0, notes: '', stockOverride: false })
    await refreshSales()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to record sale')
  } finally {
    submitting.value = false
  }
}
</script>
