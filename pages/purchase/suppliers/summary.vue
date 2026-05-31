<template>
  <div class="space-y-6">
    <UiPageHeader title="Supplier Summary" subtitle="Comprehensive supplier-wise purchase overview"
                  :breadcrumb="['Purchase','Suppliers','Summary']">
      <template #actions>
        <NuxtLink to="/purchase/suppliers" class="btn-ghost text-xs">← Suppliers</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- KPI Strip -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center border-l-2 border-blue-500/40">
        <p class="text-xs text-gray-500 mb-1">Total Suppliers</p>
        <p class="text-2xl font-bold text-gray-200">{{ totals.suppliers }}</p>
        <p v-if="totals.suppliers_with_adj > 0" class="text-[10px] text-indigo-400 mt-0.5">
          {{ totals.suppliers_with_adj }} with adjustments
        </p>
      </div>
      <div class="glass-card p-4 text-center border-l-2 border-purple-500/40">
        <p class="text-xs text-gray-500 mb-1">Total Orders</p>
        <p class="text-2xl font-bold text-gray-200">{{ totals.total_orders.toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4 text-center border-l-2 border-emerald-500/40">
        <p class="text-xs text-gray-500 mb-1">Total Paid</p>
        <p class="text-2xl font-bold text-emerald-400">৳{{ fmt(totals.paid) }}</p>
        <p class="text-[10px] text-gray-600 mt-0.5">Posted payments only</p>
      </div>
      <div class="glass-card p-4 text-center border-l-2 border-red-500/40">
        <p class="text-xs text-gray-500 mb-1">Total Balance Due</p>
        <p class="text-2xl font-bold text-red-400">৳{{ fmt(totals.balance_due) }}</p>
        <p v-if="totals.advance > 0" class="text-[10px] text-blue-400 mt-0.5">
          ৳{{ fmt(totals.advance) }} advance across suppliers
        </p>
      </div>
    </div>

    <!-- Adjustment summary bar -->
    <div v-if="totals.adj_debit > 0 || totals.adj_credit > 0"
         class="glass-card p-4 flex flex-wrap items-center gap-5 text-xs border border-indigo-500/20">
      <span class="font-semibold text-indigo-400">⚖ Ledger Adjustments (posted)</span>
      <span>
        <span class="text-gray-500">Adj Debits:</span>
        <span class="text-red-400 font-bold ml-1">৳{{ fmt(totals.adj_debit) }}</span>
        <span class="text-gray-600 ml-1">(Add Payable)</span>
      </span>
      <span>
        <span class="text-gray-500">Adj Credits:</span>
        <span class="text-emerald-400 font-bold ml-1">৳{{ fmt(totals.adj_credit) }}</span>
        <span class="text-gray-600 ml-1">(Reduce Payable)</span>
      </span>
      <span class="font-bold" :class="totals.net_adj >= 0 ? 'text-red-400' : 'text-emerald-400'">
        Net: {{ totals.net_adj >= 0 ? '+' : '' }}৳{{ fmt(Math.abs(totals.net_adj)) }}
        <span class="text-gray-500 font-normal ml-1">
          {{ totals.net_adj >= 0 ? '(increases payable)' : '(reduces payable)' }}
        </span>
      </span>
    </div>

    <!-- Filter bar -->
    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search supplier name, code, phone…" />
      <select v-model="statusFilter" class="field-input text-xs py-1.5 w-36">
        <option value="active">Active Only</option>
        <option value="inactive">Inactive Only</option>
        <option value="all">All Suppliers</option>
      </select>
      <button @click="search='';statusFilter='active';refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
      <div class="ml-auto text-xs text-gray-500">
        <span class="font-medium text-gray-300">{{ suppliers.length }}</span> suppliers
      </div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <!-- Note about calculation method -->
    <div v-else class="text-[10px] text-gray-600 -mt-2 px-1">
      * Receivable = Expected Qty × PO Contract Rate (verified GRNs) ·
      Balance = (Receivable + Adj Debits) − (Paid + Adj Credits)
    </div>

    <!-- Table -->
    <div v-if="!pending && !error" class="glass-card overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.08]">
            <th class="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
            <th class="px-4 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Ordered (KG)</th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Ordered Value</th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Received (KG)</th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Receivable*</th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Net Adj</th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Paid</th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold text-red-400 uppercase tracking-wider">Balance Due</th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Advance</th>
            <th class="px-4 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-4 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-if="!suppliers.length">
            <td colspan="12" class="px-4 py-10 text-center text-gray-600">No suppliers found.</td>
          </tr>
          <tr v-for="s in suppliers" :key="s.id"
              class="hover:bg-white/[0.02] transition-colors"
              :class="s.balance_due > 0 ? 'hover:bg-red-500/[0.03]' : ''">
            <!-- Supplier Info -->
            <td class="px-4 py-3">
              <NuxtLink :to="`/purchase/suppliers/${s.id}/ledger`"
                        class="font-semibold text-gold-400/80 hover:underline block">
                {{ s.company_name }}
              </NuxtLink>
              <p v-if="s.supplier_code" class="text-gray-600 font-mono">{{ s.supplier_code }}</p>
              <p v-if="s.phone" class="text-gray-600">{{ s.phone }}</p>
              <p v-if="s.last_order_date" class="text-gray-700 mt-0.5">
                Last: {{ s.last_order_date }}
              </p>
            </td>
            <!-- Orders -->
            <td class="px-4 py-3 text-center">
              <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                {{ s.total_orders }}
              </span>
              <p v-if="s.active_orders > 0" class="text-emerald-500 text-[10px] mt-0.5">{{ s.active_orders }} active</p>
            </td>
            <!-- Ordered KG -->
            <td class="px-4 py-3 text-right font-mono text-gray-300 font-semibold">
              {{ Number(s.total_ordered_kg).toLocaleString() }}
            </td>
            <!-- Ordered Value -->
            <td class="px-4 py-3 text-right font-mono text-gray-400">
              ৳{{ fmt(s.total_ordered_value) }}
            </td>
            <!-- Received KG -->
            <td class="px-4 py-3 text-right font-mono font-semibold"
                :class="Number(s.total_received_kg) >= Number(s.total_ordered_kg) ? 'text-emerald-400' :
                         Number(s.total_received_kg) > 0 ? 'text-yellow-400' : 'text-gray-600'">
              {{ Number(s.total_received_kg).toLocaleString() }}
            </td>
            <!-- Receivable -->
            <td class="px-4 py-3 text-right font-mono font-semibold text-purple-400">
              ৳{{ fmt(s.total_receivable_value) }}
            </td>
            <!-- Net Adjustment -->
            <td class="px-4 py-3 text-right font-semibold">
              <template v-if="s.adj_count == 0">
                <span class="text-gray-700">—</span>
              </template>
              <template v-else-if="s.net_adjustment > 0">
                <span class="text-red-400">+৳{{ fmt(s.net_adjustment) }}</span>
                <p class="text-gray-600 text-[10px]">{{ s.adj_count }} adj</p>
              </template>
              <template v-else-if="s.net_adjustment < 0">
                <span class="text-emerald-400">−৳{{ fmt(Math.abs(s.net_adjustment)) }}</span>
                <p class="text-gray-600 text-[10px]">{{ s.adj_count }} adj</p>
              </template>
              <template v-else>
                <span class="text-gray-600 text-[10px]">±0 ({{ s.adj_count }} cancel out)</span>
              </template>
            </td>
            <!-- Paid -->
            <td class="px-4 py-3 text-right font-mono font-semibold text-emerald-400">
              ৳{{ fmt(s.total_paid) }}
            </td>
            <!-- Balance Due -->
            <td class="px-4 py-3 text-right font-mono font-semibold">
              <span v-if="s.balance_due > 0" class="text-red-400">৳{{ fmt(s.balance_due) }}</span>
              <span v-else class="text-gray-700">—</span>
            </td>
            <!-- Advance -->
            <td class="px-4 py-3 text-right">
              <span v-if="s.advance > 0"
                    class="inline-block px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                ৳{{ fmt(s.advance) }}
              </span>
              <span v-else class="text-gray-700">—</span>
            </td>
            <!-- Status -->
            <td class="px-4 py-3 text-center">
              <UiStatusBadge :status="s.status" />
            </td>
            <!-- Actions -->
            <td class="px-4 py-3 text-center">
              <NuxtLink :to="`/purchase/suppliers/${s.id}/ledger`"
                        class="text-gold-500 hover:text-gold-400 text-xs">📒 Ledger</NuxtLink>
            </td>
          </tr>

          <!-- Grand Totals Row -->
          <tr v-if="suppliers.length" class="border-t-2 border-white/[0.12] bg-white/[0.02] font-bold">
            <td class="px-4 py-3 text-right text-gray-400 text-xs uppercase tracking-wider">Grand Totals</td>
            <td class="px-4 py-3 text-center text-gray-200">{{ totals.total_orders.toLocaleString() }}</td>
            <td class="px-4 py-3 text-right font-mono text-gray-200">{{ Number(totals.ordered_kg).toLocaleString() }}</td>
            <td class="px-4 py-3 text-right font-mono text-gray-200">৳{{ fmt(totals.ordered_value) }}</td>
            <td class="px-4 py-3 text-right font-mono text-gray-200">{{ Number(totals.received_kg).toLocaleString() }}</td>
            <td class="px-4 py-3 text-right font-mono text-purple-400">৳{{ fmt(totals.receivable_value) }}</td>
            <td class="px-4 py-3 text-right font-mono"
                :class="totals.net_adj > 0 ? 'text-red-400' : totals.net_adj < 0 ? 'text-emerald-400' : 'text-gray-600'">
              <template v-if="totals.net_adj !== 0">
                {{ totals.net_adj > 0 ? '+' : '−' }}৳{{ fmt(Math.abs(totals.net_adj)) }}
              </template>
              <template v-else>—</template>
            </td>
            <td class="px-4 py-3 text-right font-mono text-emerald-400">৳{{ fmt(totals.paid) }}</td>
            <td class="px-4 py-3 text-right font-mono text-red-400">
              ৳{{ fmt(totals.balance_due) }}
              <p class="text-[10px] text-indigo-400 font-normal">incl. adj</p>
            </td>
            <td class="px-4 py-3 text-right font-mono text-blue-400">৳{{ fmt(totals.advance) }}</td>
            <td colspan="2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search       = ref('')
const statusFilter = ref('active')

const { data, pending, error, refresh } = await useFetch('/api/purchase/suppliers/summary', {
  query: computed(() => ({
    search: search.value,
    status: statusFilter.value,
  })),
})

const suppliers = computed(() => (data.value?.suppliers ?? []) as any[])
const totals    = computed(() => (data.value?.totals ?? {
  suppliers: 0, total_orders: 0, ordered_kg: 0, ordered_value: 0,
  received_kg: 0, receivable_value: 0, paid: 0,
  adj_debit: 0, adj_credit: 0, suppliers_with_adj: 0,
  balance_due: 0, advance: 0, net_adj: 0,
}) as any)

function fmt(v: any) {
  return Number(v ?? 0).toLocaleString()
}
</script>
