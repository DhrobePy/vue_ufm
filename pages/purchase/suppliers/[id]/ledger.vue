<template>
  <div class="space-y-6">
    <UiPageHeader :title="`Supplier Ledger — ${supplier?.company_name ?? '…'}`"
                  :subtitle="`All transactions with this supplier`"
                  :breadcrumb="['Purchase', 'Suppliers', supplier?.company_name ?? '…', 'Ledger']">
      <template #actions>
        <button @click="printLedger" class="btn-ghost text-xs">🖨 Print</button>
        <NuxtLink to="/purchase/suppliers" class="btn-ghost text-xs">← Suppliers</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading ledger…</div>

    <template v-else>
      <!-- Summary -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Purchased</p>
          <p class="text-xl font-bold text-gray-100">৳{{ Number(stats.total_purchased ?? 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Total Paid</p>
          <p class="text-xl font-bold text-emerald-400">৳{{ Number(stats.total_paid ?? 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Outstanding</p>
          <p class="text-xl font-bold text-red-400">৳{{ Number(supplier?.current_balance ?? 0).toLocaleString() }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="text-xs text-gray-500 mb-1">Transactions</p>
          <p class="text-xl font-bold text-gray-100">{{ ledger.length }}</p>
        </div>
      </div>

      <!-- Ledger table -->
      <div id="supplier-ledger-print" class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="section-title">{{ supplier?.company_name }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ supplier?.address }} · {{ supplier?.phone }}</p>
          </div>
          <div class="flex gap-2">
            <input v-model="dateFrom" type="date" class="input-glass w-auto text-xs py-1.5" />
            <span class="text-gray-600 self-center">→</span>
            <input v-model="dateTo" type="date" class="input-glass w-auto text-xs py-1.5" />
          </div>
        </div>

        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Reference</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit (Payment)</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit (Purchase)</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-for="tx in ledger" :key="tx.id" class="hover:bg-white/[0.02]">
              <td class="py-2.5 px-3 text-gray-500 font-mono">{{ tx.date }}</td>
              <td class="py-2.5 px-3 text-gray-300">{{ tx.description }}</td>
              <td class="py-2.5 px-3 font-mono text-gray-600">{{ tx.ref }}</td>
              <td class="py-2.5 px-3 text-right font-mono text-emerald-400">{{ Number(tx.debit) > 0 ? `৳${Number(tx.debit).toLocaleString()}` : '—' }}</td>
              <td class="py-2.5 px-3 text-right font-mono text-red-400">{{ Number(tx.credit) > 0 ? `৳${Number(tx.credit).toLocaleString()}` : '—' }}</td>
              <td class="py-2.5 px-3 text-right font-bold font-mono text-gray-200">৳{{ Number(tx.balance).toLocaleString() }}</td>
            </tr>
          </tbody>
          <tfoot class="border-t-2 border-white/10">
            <tr>
              <td colspan="3" class="pt-3 px-3 font-bold text-gray-400">Closing Balance</td>
              <td class="pt-3 px-3 text-right font-bold font-mono text-emerald-400">৳{{ Number(stats.total_paid ?? 0).toLocaleString() }}</td>
              <td class="pt-3 px-3 text-right font-bold font-mono text-red-400">৳{{ Number(stats.total_purchased ?? 0).toLocaleString() }}</td>
              <td class="pt-3 px-3 text-right font-bold font-mono text-gold-400 text-sm">৳{{ Number(supplier?.current_balance ?? 0).toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()

const supplierId = Number(route.params.id)

const dateFrom = ref('')
const dateTo   = ref('')

const { data, pending } = await useFetch(`/api/purchase/suppliers/${supplierId}/ledger`, {
  query: computed(() => ({
    date_from: dateFrom.value,
    date_to:   dateTo.value,
  })),
})

const supplier = computed(() => (data.value as any)?.supplier ?? null)
const ledger   = computed(() => (data.value as any)?.ledger   ?? [])
const stats    = computed(() => (data.value as any)?.stats    ?? {})

function printLedger() {
  window.print()
}
</script>
