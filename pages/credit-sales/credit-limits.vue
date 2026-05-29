<template>
  <div class="space-y-6">
    <UiPageHeader title="Credit Limits" subtitle="Review and manage credit limits for all customers"
                  :breadcrumb="['Credit Sales', 'Credit Limits']">
      <template #actions>
        <button @click="saveAll" :disabled="saving || !dirty" class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
          {{ saving ? 'Saving…' : 'Save Changes' }}
        </button>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Credit Extended</p>
          <p class="text-xl font-bold text-gray-100">৳{{ Number(stats.total_limit || 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Outstanding</p>
          <p class="text-xl font-bold text-red-400">৳{{ Number(stats.total_outstanding || 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">At Risk (&gt;80%)</p>
          <p class="text-xl font-bold text-orange-400">{{ atRiskCount }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Overdue Customers</p>
          <p class="text-xl font-bold text-red-500">{{ overdueCount }}</p>
        </div>
      </div>

      <!-- Credit table -->
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="section-title">Customer Credit Limits</h3>
          <div class="flex gap-2">
            <button v-for="f in utilizationFilters" :key="f.value"
              @click="filterUtil = f.value"
              :class="['text-xs px-3 py-1 rounded-lg border transition-all',
                filterUtil === f.value
                  ? 'bg-gold-500/10 border-gold-500/40 text-gold-400'
                  : 'border-white/10 text-gray-500 hover:border-white/20']">
              {{ f.label }}
            </button>
          </div>
        </div>

        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Customer</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit Limit</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Outstanding</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Overdue</th>
              <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider w-40">Utilisation</th>
              <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Terms</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">New Limit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-for="c in filteredCustomers" :key="c.id" class="hover:bg-white/[0.02]">
              <td class="py-3 px-3">
                <p class="font-semibold text-gray-200">{{ c.name }}</p>
                <p class="text-gray-600">{{ c.area || '—' }}</p>
              </td>
              <td class="py-3 px-3 text-right font-mono text-gray-300">৳{{ Number(c.credit_limit || 0).toLocaleString() }}</td>
              <td class="py-3 px-3 text-right font-mono font-bold text-red-400">৳{{ Number(c.outstanding || 0).toLocaleString() }}</td>
              <td class="py-3 px-3 text-right font-mono" :class="Number(c.overdue) > 0 ? 'text-orange-400 font-bold' : 'text-gray-600'">
                {{ Number(c.overdue) > 0 ? `৳${Number(c.overdue).toLocaleString()}` : '—' }}
              </td>
              <td class="py-3 px-3">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div class="h-full rounded-full transition-all"
                         :class="utilPercent(c) > 90 ? 'bg-red-500' : utilPercent(c) > 80 ? 'bg-orange-500' : utilPercent(c) > 60 ? 'bg-yellow-500' : 'bg-emerald-500'"
                         :style="`width:${Math.min(100, utilPercent(c))}%`" />
                  </div>
                  <span :class="utilPercent(c) > 80 ? 'text-red-400' : 'text-gray-500'" class="w-8 text-right">{{ utilPercent(c) }}%</span>
                </div>
              </td>
              <td class="py-3 px-3 text-center text-gray-400">{{ c.payment_terms || '—' }}d</td>
              <td class="py-3 px-3 text-right">
                <div class="relative inline-flex">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600">৳</span>
                  <input v-model.number="c.newLimit" type="number" step="100000"
                         class="w-28 bg-white/[0.05] border border-gold-500/20 rounded-lg pl-5 pr-2 py-1 text-right font-mono text-xs text-gold-300 focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const filterUtil = ref('all')
const saving = ref(false)

const utilizationFilters = [
  { value: 'all',  label: 'All' },
  { value: 'high', label: '>80%' },
  { value: 'over', label: 'Overdue' },
]

const { data, pending, error, refresh } = await useFetch('/api/credit-sales/credit-limits')

const stats = computed(() => (data.value?.stats ?? {}) as any)

// Add reactive newLimit to each customer row
const customers = computed<any[]>(() =>
  (data.value?.customers ?? []).map((c: any) => ({
    ...c,
    newLimit: Number(c.credit_limit || 0),
  }))
)

// We need a mutable copy for the newLimit inputs
const rows = ref<any[]>([])
watch(customers, (val) => {
  rows.value = val.map(c => ({ ...c }))
}, { immediate: true })

const dirty = computed(() =>
  rows.value.some(r => r.newLimit !== Number(r.credit_limit || 0))
)

const utilPercent = (c: any) => {
  const limit = Number(c.credit_limit || 0)
  if (!limit) return 0
  return Math.min(100, Math.round(Number(c.outstanding || 0) / limit * 100))
}

const filteredCustomers = computed(() => {
  if (filterUtil.value === 'high') return rows.value.filter(c => utilPercent(c) > 80)
  if (filterUtil.value === 'over') return rows.value.filter(c => Number(c.overdue) > 0)
  return rows.value
})

const atRiskCount  = computed(() => rows.value.filter(c => utilPercent(c) > 80).length)
const overdueCount = computed(() => rows.value.filter(c => Number(c.overdue) > 0).length)

async function saveAll() {
  const updates = rows.value
    .filter(c => c.newLimit !== Number(c.credit_limit || 0))
    .map(c => ({ id: c.id, credit_limit: c.newLimit }))

  if (!updates.length) return
  saving.value = true
  try {
    await $fetch('/api/credit-sales/credit-limits', {
      method: 'PATCH',
      body: { updates },
    })
    success(`${updates.length} credit limit(s) updated successfully`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to save credit limits')
  } finally {
    saving.value = false
  }
}
</script>
