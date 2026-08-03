<template>
  <div class="space-y-6">
    <UiPageHeader :title="customer ? `${customer.name} — POS Ledger` : 'POS Customer Ledger'"
                  subtitle="Every POS sale (cash or credit) plus payments — separate from the Credit Sales ledger"
                  :breadcrumb="['POS', 'Customer Ledger']" />

    <div v-if="customer" class="glass-card p-5 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-gray-200">{{ customer.name }}</p>
        <p class="text-xs text-gray-500">{{ customer.business_name }} {{ customer.phone_number }}</p>
      </div>
      <div class="text-right">
        <p class="text-[10px] text-gray-600 uppercase">POS Credit Balance</p>
        <p :class="['text-xl font-bold font-mono', balance > 0 ? 'text-orange-400' : 'text-emerald-400']">৳{{ balance.toLocaleString() }}</p>
      </div>
    </div>

    <div v-if="customer && balance > 0" class="glass-card p-5 space-y-3 max-w-md">
      <h3 class="section-title">Collect Payment</h3>
      <div class="flex items-end gap-3 flex-wrap">
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Amount</label>
          <input v-model.number="pay.amount" type="number" min="0" step="any" class="input-glass text-xs font-mono w-32" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Method</label>
          <select v-model="pay.method" class="input-glass text-xs w-32">
            <option v-for="m in ['Cash','Bank Transfer','Card','Mobile Banking']" :key="m" :value="m">{{ m }}</option>
          </select></div>
        <div v-if="pay.method === 'Cash'" class="space-y-1 min-w-[180px]"><label class="text-[10px] text-gray-600 uppercase">Cash Box</label>
          <UiSearchSelect v-model="pay.cashAccountId" :options="cashAccountOptions" placeholder="Cash box…" /></div>
        <div v-else class="space-y-1 min-w-[180px]"><label class="text-[10px] text-gray-600 uppercase">Bank Account</label>
          <UiSearchSelect v-model="pay.bankAccountId" :options="bankAccountOptions" placeholder="Bank account…" /></div>
        <button @click="collect" :disabled="!(pay.amount > 0) || collecting" class="btn-gold text-xs py-2 disabled:opacity-50">
          {{ collecting ? 'Posting…' : 'Collect' }}
        </button>
      </div>
    </div>

    <div class="glass-card p-5">
      <h3 class="section-title mb-3">Timeline</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]">
            <th class="text-left py-2 pr-3">Date</th><th class="text-left pr-3">Type</th>
            <th class="text-left pr-3">Reference</th><th class="text-right pr-3">Debit</th><th class="text-right pr-3">Credit</th>
          </tr></thead>
          <tbody>
            <tr v-for="(t, i) in timeline" :key="i" class="border-b border-white/[0.03]">
              <td class="py-2 pr-3 text-gray-400">{{ String(t.date).slice(0, 10) }}</td>
              <td class="pr-3">
                <span v-if="t.kind === 'sale'" :class="['px-2 py-0.5 rounded-full text-[10px] font-semibold', t.balance_impact ? 'bg-orange-500/15 text-orange-400' : 'bg-white/[0.06] text-gray-500']">
                  Sale{{ t.balance_impact ? '' : ' (cash)' }}
                </span>
                <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">{{ t.kind }}</span>
              </td>
              <td class="pr-3 text-gray-300">
                <NuxtLink v-if="t.kind === 'sale'" :to="`/pos/${t.id ?? ''}`" class="font-mono text-gold-400 hover:underline">{{ t.order_number }}</NuxtLink>
                <span v-else>{{ t.description }}</span>
              </td>
              <td class="pr-3 text-right font-mono text-orange-400">{{ t.kind === 'sale' ? (t.balance_impact ? `৳${Number(t.credit_amount).toLocaleString()}` : '') : (Number(t.debit_amount) > 0 ? `৳${Number(t.debit_amount).toLocaleString()}` : '') }}</td>
              <td class="pr-3 text-right font-mono text-emerald-400">{{ t.kind !== 'sale' && Number(t.credit_amount) > 0 ? `৳${Number(t.credit_amount).toLocaleString()}` : '' }}</td>
            </tr>
            <tr v-if="!timeline.length"><td colspan="5" class="py-6 text-center text-gray-600">No transactions yet.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()

const customerId = computed(() => Number(route.params.id))
const { data, refresh } = await useFetch(() => `/api/pos/customers/${customerId.value}/ledger`)
const customer = computed<any>(() => (data.value as any)?.customer ?? null)
const balance   = computed<number>(() => Number((data.value as any)?.balance ?? 0))
const timeline  = computed<any[]>(() => (data.value as any)?.timeline ?? [])

const [{ data: bankData }, { data: pettyData }] = await Promise.all([
  useFetch('/api/lookup/bank-accounts'), useFetch('/api/lookup/cash-accounts'),
])
const bankAccountOptions = computed(() => (((bankData.value as any)?.accounts ?? []) as any[]).map(a => ({ value: a.id, label: `${a.bank_name} — AC: ${a.account_number}`, sub: a.branch_name || '' })))
const cashAccountOptions = computed(() => (((pettyData.value as any)?.accounts ?? []) as any[]).map(a => ({ value: a.id, label: a.account_name, sub: a.branch_name || '' })))

const pay = reactive({ amount: 0, method: 'Cash', bankAccountId: '' as any, cashAccountId: '' as any })
const collecting = ref(false)
async function collect() {
  collecting.value = true
  try {
    const res: any = await $fetch(`/api/pos/customers/${customerId.value}/collect-payment`, {
      method: 'POST',
      body: {
        amount: pay.amount, payment_method: pay.method,
        bank_account_id: pay.bankAccountId || undefined, cash_account_id: pay.cashAccountId || undefined,
      },
    })
    success(res.queued ? (res.message ?? 'Payment queued for approval') : 'Payment collected ✓')
    pay.amount = 0
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Payment failed')
  } finally { collecting.value = false }
}
</script>
