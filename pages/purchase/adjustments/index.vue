<template>
  <div class="space-y-6">
    <UiPageHeader title="Purchase Adjustment Notes" subtitle="DAN (Debit) and CAN (Credit) adjustment notes"
                  :breadcrumb="['Purchase','Adjustments']">
      <template #actions>
        <NuxtLink to="/purchase/adjustments/create" class="btn-gold text-xs">+ New Adjustment</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-5 text-center space-y-1">
        <p class="text-2xl font-bold text-orange-400">{{ danCount }}</p>
        <p class="text-xs text-gray-500">Debit Notes (DAN)</p>
        <p class="text-[11px] text-orange-400/70">৳{{ danAmount.toLocaleString() }}</p>
      </div>
      <div class="glass-card p-5 text-center space-y-1">
        <p class="text-2xl font-bold text-blue-400">{{ canCount }}</p>
        <p class="text-xs text-gray-500">Credit Notes (CAN)</p>
        <p class="text-[11px] text-blue-400/70">৳{{ canAmount.toLocaleString() }}</p>
      </div>
      <div class="glass-card p-5 text-center space-y-1">
        <p class="text-2xl font-bold text-yellow-400">{{ pendingCount }}</p>
        <p class="text-xs text-gray-500">Awaiting Action</p>
        <p class="text-[11px] text-gray-500">Draft / Approved</p>
      </div>
      <div class="glass-card p-5 text-center space-y-1">
        <p class="text-2xl font-bold text-gray-200">{{ notes.length }}</p>
        <p class="text-xs text-gray-500">Total (filtered)</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 flex flex-wrap gap-3 items-center">
      <input v-model.lazy="filters.search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search note #, PO #, supplier…" />
      <select v-model="filters.note_type" class="field-input text-xs py-1.5 w-36">
        <option value="">All Types</option>
        <option value="debit">Debit (DAN)</option>
        <option value="credit">Credit (CAN)</option>
      </select>
      <select v-model="filters.status" class="field-input text-xs py-1.5 w-36">
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="approved">Approved</option>
        <option value="posted">Posted</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button @click="resetFilters" class="btn-ghost text-xs py-1.5">Reset</button>
      <div class="ml-auto text-xs text-gray-500">{{ notes.length }} records</div>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <div v-else class="glass-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-white/[0.06] text-xs">
          <thead>
            <tr class="text-gray-500 uppercase text-[10px] tracking-wider">
              <th class="px-4 py-3 text-left">Note #</th>
              <th class="px-4 py-3 text-center">Type</th>
              <th class="px-4 py-3 text-left">Reason</th>
              <th class="px-4 py-3 text-left">PO #</th>
              <th class="px-4 py-3 text-left">Supplier</th>
              <th class="px-4 py-3 text-right">Amount</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-left">Created</th>
              <th class="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-if="!notes.length">
              <td colspan="9" class="px-4 py-8 text-center text-gray-500">No adjustment notes found.</td>
            </tr>
            <tr v-for="note in notes" :key="note.id" class="hover:bg-white/[0.02]">
              <td class="px-4 py-3 font-mono">
                <NuxtLink :to="`/purchase/adjustments/${note.id}`" class="text-gold-400/80 hover:underline">{{ note.note_number }}</NuxtLink>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="note.note_type === 'debit' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'">
                  {{ note.note_type === 'debit' ? '▲ DAN' : '▼ CAN' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-400">{{ reasonLabels[note.reason_type] || note.reason_type }}</td>
              <td class="px-4 py-3">
                <NuxtLink :to="`/purchase/orders/${note.purchase_order_id}`" class="text-blue-400/80 hover:underline">#{{ note.po_number }}</NuxtLink>
              </td>
              <td class="px-4 py-3 text-gray-300">{{ note.supplier_name || '—' }}</td>
              <td class="px-4 py-3 text-right font-mono font-bold"
                :class="note.note_type === 'debit' ? 'text-orange-400' : 'text-blue-400'">
                ৳{{ Number(note.amount).toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-center">
                <UiStatusBadge :status="note.status" />
              </td>
              <td class="px-4 py-3 text-gray-500">{{ note.created_at?.slice(0,10) }}</td>
              <td class="px-4 py-3 text-center">
                <NuxtLink :to="`/purchase/adjustments/${note.id}`" class="text-indigo-400 hover:text-indigo-300 text-[11px]">View →</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Legend -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      <div class="glass-card p-4 border border-orange-500/20">
        <p class="font-semibold text-orange-400 mb-1">▲ DAN — Debit Adjustment Note</p>
        <p class="text-gray-500">We owe the supplier <strong class="text-gray-400">more</strong> than the original PO amount. Used for over-delivery, price disputes (upward).</p>
      </div>
      <div class="glass-card p-4 border border-blue-500/20">
        <p class="font-semibold text-blue-400 mb-1">▼ CAN — Credit Adjustment Note</p>
        <p class="text-gray-500">The supplier owes us a <strong class="text-gray-400">reduction</strong>. Used for under-delivery closure, quality deductions, returns.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const reasonLabels: Record<string,string> = {
  over_delivery:          'Over-Delivery',
  under_delivery_closure: 'Under-Delivery Closure',
  quality_deduction:      'Quality Deduction',
  price_dispute:          'Price Dispute',
  return:                 'Return',
  other:                  'Other',
}

const filters = reactive({ search: '', note_type: '', status: '' })

const { data, pending, error } = await useFetch('/api/purchase/adjustments', {
  query: computed(() => ({
    search:    filters.search,
    note_type: filters.note_type,
    status:    filters.status,
  })),
})

const notes      = computed(() => (data.value?.notes ?? []) as any[])
const danCount   = computed(() => notes.value.filter((n: any) => n.note_type === 'debit').length)
const canCount   = computed(() => notes.value.filter((n: any) => n.note_type === 'credit').length)
const danAmount  = computed(() => notes.value.filter((n: any) => n.note_type === 'debit').reduce((s: number, n: any) => s + Number(n.amount), 0))
const canAmount  = computed(() => notes.value.filter((n: any) => n.note_type === 'credit').reduce((s: number, n: any) => s + Number(n.amount), 0))
const pendingCount = computed(() => notes.value.filter((n: any) => ['draft','approved'].includes(n.status)).length)

function resetFilters() {
  filters.search = ''
  filters.note_type = ''
  filters.status = ''
}
</script>
