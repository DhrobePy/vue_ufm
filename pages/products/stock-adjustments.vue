<template>
  <div class="space-y-5">
    <UiPageHeader title="Stock Adjustments" subtitle="Inventory corrections — maker submits, a different authorised user approves"
                  :breadcrumb="['Products', 'Stock Adjustments']">
      <template #actions>
        <button v-if="canCreate" @click="showForm = !showForm" class="btn-primary text-xs">
          {{ showForm ? 'Cancel' : '+ New Adjustment' }}
        </button>
      </template>
    </UiPageHeader>

    <div v-if="showForm" class="glass-card p-5 space-y-4">
      <h3 class="section-title">New Stock Adjustment</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product / SKU</label>
          <select v-model="form.variant_id" class="field-input">
            <option :value="null" disabled>Select a variant…</option>
            <option v-for="v in variants" :key="v.id" :value="v.id">
              {{ v.product_name }} — {{ v.weight_variant }} ({{ v.sku }}) · in stock {{ Number(v.stock_qty).toLocaleString() }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity Change</label>
          <input v-model.number="form.delta" type="number" placeholder="e.g. -12 or 8" class="field-input" />
          <p class="text-[11px] text-gray-600 mt-1">Negative = decrease, positive = increase</p>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</label>
          <select v-model="form.reason" class="field-input">
            <option value="" disabled>Select reason…</option>
            <option>Physical count discrepancy</option>
            <option>Damaged goods</option>
            <option>Spillage / wastage</option>
            <option>Theft / loss</option>
            <option>Warehouse transfer correction</option>
            <option>Other</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes (optional)</label>
          <textarea v-model="form.notes" rows="2" class="field-input" placeholder="Additional detail…" />
        </div>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="showForm = false" class="btn-ghost text-xs">Cancel</button>
        <button @click="submit" :disabled="submitting" class="btn-primary text-xs disabled:opacity-40">
          {{ submitting ? 'Submitting…' : 'Submit for Approval' }}
        </button>
      </div>
    </div>

    <div class="flex gap-2">
      <button v-for="t in tabs" :key="t.value" @click="statusFilter = t.value; refresh()"
              :class="['px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border',
                statusFilter === t.value
                  ? 'bg-gold-500/15 text-gold-400 border-gold-500/25'
                  : 'text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]']">
        {{ t.label }}
      </button>
    </div>

    <div v-if="pending" class="glass-card p-12 text-center">
      <div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"/>
      <p class="text-xs text-gray-500">Loading…</p>
    </div>

    <div v-else-if="!items.length" class="glass-card p-14 text-center space-y-2">
      <div class="text-5xl">📦</div>
      <p class="text-gray-400 font-semibold">Nothing here</p>
      <p class="text-xs text-gray-600">Stock adjustments will appear here for review</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="adj in items" :key="adj.id" class="glass-card p-5 flex items-start gap-4 flex-wrap">
        <div class="min-w-[220px] flex-1">
          <span class="text-sm font-bold text-gray-200">{{ adj.product_name }}</span>
          <span class="text-xs text-gray-500 ml-2">{{ adj.sku }}</span>
          <span class="font-mono text-xs text-gray-500 ml-2">{{ adj.adj_number }}</span>
          <p class="text-xs text-gray-500 mt-1">
            {{ adj.reason }} · by {{ adj.created_by_name ?? '—' }} · {{ new Date(adj.created_at).toLocaleString('en-GB') }}
          </p>
          <p v-if="adj.notes" class="text-[11px] text-gray-600 mt-1">{{ adj.notes }}</p>
          <p v-if="adj.status !== 'pending'" class="text-[11px] text-gray-500 mt-1">
            {{ adj.status === 'approved' ? '✓ Approved' : '✗ Rejected' }} by {{ adj.approved_by_name ?? '—' }}
            {{ adj.decision_note ? `— ${adj.decision_note}` : '' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg font-bold font-mono" :class="Number(adj.delta) < 0 ? 'text-red-400' : 'text-emerald-400'">
            {{ Number(adj.delta) > 0 ? '+' : '' }}{{ Number(adj.delta).toLocaleString() }}
          </p>
          <p class="text-[11px] text-gray-600">now {{ Number(adj.current_stock).toLocaleString() }}</p>
        </div>
        <div v-if="adj.status === 'pending'" class="flex items-center gap-2 shrink-0">
          <button @click="decide(adj, 'approve')" :disabled="acting === adj.id"
                  class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">
            {{ acting === adj.id ? '…' : '✓ Approve' }}
          </button>
          <button @click="decide(adj, 'reject')" :disabled="acting === adj.id"
                  class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 disabled:opacity-40 transition-colors">
            Reject
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()
const { user } = useUserSession()

const PROD_ROLES = ['admin', 'superadmin', 'production manager-srg', 'production manager-demra']
const canCreate = computed(() => PROD_ROLES.includes(((user.value as any)?.role ?? '').toLowerCase()))

const tabs = [
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]
const statusFilter = ref('pending')

const { data, pending, refresh } = await useFetch('/api/products/stock-adjustments', {
  query: computed(() => ({ status: statusFilter.value })),
})
const items = computed<any[]>(() => (data.value as any)?.adjustments ?? [])

const { data: invData } = await useFetch('/api/products/inventory')
const variants = computed<any[]>(() => (invData.value as any)?.variants ?? [])

const showForm = ref(false)
const submitting = ref(false)
const form = reactive({ variant_id: null as number | null, delta: null as number | null, reason: '', notes: '' })

async function submit() {
  if (!form.variant_id) return toastError('Select a variant')
  if (!form.delta) return toastError('Enter a quantity change')
  if (!form.reason) return toastError('Select a reason')

  submitting.value = true
  try {
    const res: any = await $fetch('/api/products/stock-adjustments', {
      method: 'POST',
      body: { variant_id: form.variant_id, delta: form.delta, reason: form.reason, notes: form.notes || undefined },
    })
    success(`${res.adj_number} submitted for approval`)
    showForm.value = false
    form.variant_id = null; form.delta = null; form.reason = ''; form.notes = ''
    statusFilter.value = 'pending'
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to submit')
  } finally {
    submitting.value = false
  }
}

const acting = ref<number | null>(null)

async function decide(adj: any, action: 'approve' | 'reject') {
  const note = action === 'reject' ? prompt(`Reject ${adj.adj_number}? Reason:`) : null
  if (action === 'reject' && note === null) return
  if (action === 'approve' && !confirm(`Approve ${adj.adj_number} — ${Number(adj.delta) > 0 ? '+' : ''}${adj.delta} on ${adj.product_name}?`)) return

  acting.value = adj.id
  try {
    await $fetch(`/api/products/stock-adjustments/${adj.id}/status`, {
      method: 'PATCH',
      body: { action, notes: note || undefined },
    })
    success(`${adj.adj_number} ${action}d`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to decide')
  } finally {
    acting.value = null
  }
}
</script>
