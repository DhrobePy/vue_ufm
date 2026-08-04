<template>
  <div class="space-y-6 max-w-4xl">
    <UiPageHeader :title="sale?.sale_number ?? 'Commodity Sale'" :subtitle="sale ? `${sale.customer_name} · ${sale.commodity_name}` : ''"
                  :breadcrumb="['Trading', 'Sales', sale?.sale_number ?? '…']" />

    <div v-if="pendingEdit" class="rounded-xl p-3 text-xs text-amber-300" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);">
      ⏳ A correction by {{ pendingEdit.requested_by }} is pending approval — Edit/Delete are locked until it's decided on
      <NuxtLink to="/credit-sales/approval-requests" class="underline">Approval Requests</NuxtLink>.
    </div>

    <div v-if="sale" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Detail -->
      <div class="glass-card p-5 space-y-2 text-xs">
        <h3 class="section-title mb-2">Details</h3>
        <div v-for="row in detailRows" :key="row[0]" class="flex justify-between py-1 border-b border-white/[0.03]">
          <span class="text-gray-500">{{ row[0] }}</span><span class="text-gray-200 font-medium">{{ row[1] }}</span>
        </div>
        <div class="flex gap-2 pt-3">
          <button v-if="canModify" @click="showEdit = !showEdit" class="btn-ghost text-xs">✏️ Correct</button>
          <button v-if="canModify" @click="deleteSale" class="btn-ghost text-xs text-red-400">🗑 Delete</button>
          <NuxtLink :to="`/trading/sales/${sale.id}/gate-pass`" class="btn-ghost text-xs">🖨 Gate Pass</NuxtLink>
          <NuxtLink :to="`/trading/sales/${sale.id}/invoice`" class="btn-ghost text-xs">🧾 Invoice</NuxtLink>
        </div>
        <p v-if="!canModify && Number(sale.amount_paid) > 0" class="text-[10px] text-gray-600 pt-1">
          Corrections/deletion locked — payments exist. Reverse them first from Payment History.
        </p>
      </div>

      <!-- Financials + JE -->
      <div class="glass-card p-5 space-y-2 text-xs">
        <h3 class="section-title mb-2">Financials</h3>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="f in finTiles" :key="f.label" class="rounded-lg p-2.5 bg-white/[0.03]">
            <p class="text-[10px] text-gray-600 uppercase">{{ f.label }}</p>
            <p :class="['font-bold font-mono', f.color]">{{ f.value }}</p>
          </div>
        </div>
        <div v-if="jeLines.length" class="pt-2">
          <p class="text-[10px] text-gray-600 uppercase font-semibold mb-1">Journal Entry</p>
          <div v-for="(l, i) in jeLines" :key="i" class="flex justify-between py-0.5 font-mono text-[11px]">
            <span class="text-gray-400">{{ l.account_name }}</span>
            <span class="text-gray-300">{{ Number(l.debit_amount) > 0 ? `Dr ৳${Number(l.debit_amount).toLocaleString()}` : `Cr ৳${Number(l.credit_amount).toLocaleString()}` }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit form -->
    <div v-if="showEdit && sale" class="glass-card p-5 space-y-3 max-w-4xl border border-amber-500/20">
      <h3 class="section-title">Correct This Sale</h3>
      <p class="text-[11px] text-gray-600">Saving reverses this sale and posts a fresh, traceable replacement — the old version stays restorable from the Recycle Bin.</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Quantity</label>
          <input v-model.number="edit.quantity" type="number" step="any" class="input-glass text-xs font-mono" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Unit Price</label>
          <input v-model.number="edit.unit_price" type="number" step="any" class="input-glass text-xs font-mono" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Sale Date</label>
          <input v-model="edit.sale_date" type="date" class="input-glass text-xs" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Origin</label>
          <input v-model="edit.origin" class="input-glass text-xs" /></div>
        <div class="col-span-2 md:col-span-4 space-y-1"><label class="text-[10px] text-gray-600 uppercase">Reason *</label>
          <input v-model="edit.reason" class="input-glass text-xs" placeholder="Why is this correction needed…" /></div>
      </div>
      <div class="flex justify-end gap-2">
        <button @click="showEdit = false" class="btn-ghost text-xs">Cancel</button>
        <button @click="submitEdit" :disabled="!edit.reason.trim() || editing" class="btn-gold text-xs disabled:opacity-50">
          {{ editing ? 'Applying…' : 'Save Correction' }}
        </button>
      </div>
    </div>

    <!-- Dispatch -->
    <div v-if="sale" class="glass-card p-5 space-y-3">
      <h3 class="section-title">Dispatch</h3>
      <div class="text-xs text-gray-400">
        <p v-if="dispatch?.confirmed_at">✅ Delivered {{ dispatch.confirmed_at }} — confirmed by {{ dispatch.confirmed_by_name }}<span v-if="dispatch.received_by"> · received by {{ dispatch.received_by }}</span></p>
        <p v-else-if="dispatch?.gate_out_at">🚚 Gated out {{ dispatch.gate_out_at }} by {{ dispatch.gate_out_by_name }} · {{ dispatch.driver_name ?? '—' }} / {{ dispatch.vehicle_number ?? '—' }}</p>
        <p v-else>Not dispatched yet.</p>
      </div>
      <div v-if="!dispatch?.confirmed_at" class="flex flex-wrap items-end gap-2">
        <template v-if="!dispatch?.gate_out_at">
          <input v-model="gateForm.driver_name" class="input-glass text-xs py-1.5 w-40" placeholder="Driver name" />
          <input v-model="gateForm.vehicle_number" class="input-glass text-xs py-1.5 w-36" placeholder="Vehicle #" />
          <button @click="dispatchAction('gate_out')" :disabled="dispatching" class="btn-gold text-xs py-2">🚚 Gate Out</button>
        </template>
        <template v-else>
          <input v-model="gateForm.received_by" class="input-glass text-xs py-1.5 w-44" placeholder="Received by (customer side)" />
          <button @click="dispatchAction('deliver')" :disabled="dispatching" class="btn-gold text-xs py-2">📦 Confirm Delivery</button>
        </template>
      </div>
    </div>

    <!-- Collect payment -->
    <div v-if="sale && Number(sale.balance_due) > 0 && sale.status === 'posted'" class="glass-card p-5 space-y-3">
      <h3 class="section-title">Collect Payment <span class="text-gray-500 font-normal text-xs">— due ৳{{ Number(sale.balance_due).toLocaleString() }}</span></h3>
      <div class="flex flex-wrap items-end gap-3">
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Amount</label>
          <input v-model.number="pay.amount" type="number" step="any" class="input-glass text-xs font-mono w-32" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Method</label>
          <select v-model="pay.method" class="input-glass text-xs w-36">
            <option v-for="m in ['Cash','Bank Transfer','Cheque','Mobile Banking','Card']" :key="m" :value="m">{{ m }}</option>
          </select></div>
        <div v-if="pay.method === 'Cash'" class="space-y-1 min-w-[220px]"><label class="text-[10px] text-gray-600 uppercase">Petty Cash Account</label>
          <UiSearchSelect v-model="pay.cashAccountId" :options="cashAccountOptions" placeholder="Cash box…" /></div>
        <div v-else class="space-y-1 min-w-[220px]"><label class="text-[10px] text-gray-600 uppercase">Bank Account</label>
          <UiSearchSelect v-model="pay.bankAccountId" :options="bankAccountOptions" placeholder="Bank account…" /></div>
        <div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Reference</label>
          <input v-model="pay.reference" class="input-glass text-xs w-32" placeholder="Optional" /></div>
        <button @click="collect" :disabled="!(pay.amount > 0) || collecting" class="btn-gold text-xs py-2 disabled:opacity-50">
          {{ collecting ? 'Posting…' : 'Collect' }}
        </button>
      </div>
    </div>

    <!-- Payment history -->
    <div v-if="payments.length" class="glass-card p-5">
      <h3 class="section-title mb-3">Payment History</h3>
      <div v-for="p in payments" :key="p.id" class="flex items-center gap-3 text-xs py-1.5 border-b border-white/[0.03]">
        <span class="font-mono text-gold-400">{{ p.payment_number }}</span>
        <span class="text-gray-400">{{ String(p.payment_date).slice(0, 10) }}</span>
        <span class="text-gray-400">{{ p.payment_method }}</span>
        <span class="flex-1" />
        <span class="font-mono text-emerald-400">৳{{ Number(p.amount).toLocaleString() }}</span>
        <button v-if="isAdminUser" @click="reversePayment(p)" class="btn-ghost text-[10px] py-0.5 text-red-400">Reverse</button>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="sale" class="glass-card p-5">
      <h3 class="section-title mb-3">Timeline</h3>
      <div class="space-y-2 text-xs">
        <div v-for="(e, i) in editChain" :key="i" class="flex gap-3 py-1.5 border-b border-white/[0.03]">
          <span class="text-amber-400">✏️</span>
          <div class="flex-1">
            <p class="text-gray-300">Corrected: <span class="font-mono">{{ e.old_sale_number }}</span> → <span class="font-mono">{{ e.new_sale_number }}</span>
              <span class="text-gray-600"> · {{ e.requested_by }}{{ e.decided_by && e.decided_by !== e.requested_by ? ` · approved by ${e.decided_by}` : '' }}</span></p>
            <p class="text-gray-500">{{ e.reason }}</p>
            <p v-if="e.change_summary" class="text-[10px] text-gray-600 font-mono">{{ formatDiff(e.change_summary) }}</p>
          </div>
          <span class="text-gray-600">{{ String(e.decided_at ?? e.created_at).slice(0, 16).replace('T', ' ') }}</span>
        </div>
        <div class="flex gap-3 py-1.5">
          <span class="text-emerald-400">●</span>
          <p class="flex-1 text-gray-300">Created by {{ sale.created_by ?? '—' }}</p>
          <span class="text-gray-600">{{ String(sale.created_at).slice(0, 16).replace('T', ' ') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isAdminUser = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))

const saleId = computed(() => Number(route.params.id))
const { data, refresh } = await useFetch(() => `/api/trading/sales/${saleId.value}`)

// Superseded links forward to the live replacement
watch(data, (d: any) => {
  if (d?.superseded_by) navigateTo(`/trading/sales/${d.superseded_by}`, { replace: true })
}, { immediate: true })

const sale        = computed<any>(() => (data.value as any)?.sale ?? null)
const jeLines     = computed<any[]>(() => (data.value as any)?.je_lines ?? [])
const payments    = computed<any[]>(() => (data.value as any)?.payments ?? [])
const dispatch    = computed<any>(() => (data.value as any)?.dispatch ?? null)
const editChain   = computed<any[]>(() => (data.value as any)?.edit_chain ?? [])
const pendingEdit = computed<any>(() => (data.value as any)?.pending_edit ?? null)
const canModify   = computed(() => sale.value && Number(sale.value.amount_paid) <= 0.01 && !pendingEdit.value)

const detailRows = computed(() => sale.value ? [
  ['Customer', sale.value.customer_name],
  ['Commodity', `${sale.value.commodity_name}${sale.value.origin ? ` (${sale.value.origin})` : ''}`],
  ['Quantity', `${Number(sale.value.quantity).toLocaleString()} ${sale.value.unit}`],
  ['Sale Date', String(sale.value.sale_date).slice(0, 10)],
  ['Branch', sale.value.branch_name ?? '—'],
  ['Source PO', sale.value.source_po_number ?? '—'],
  ['Recorded by', sale.value.created_by ?? '—'],
  ['Status', sale.value.status],
] : [])

const finTiles = computed(() => sale.value ? [
  { label: 'Revenue', value: `৳${Number(sale.value.total_amount).toLocaleString()}`, color: 'text-gold-400' },
  { label: 'COGS', value: `৳${Number(sale.value.cogs_amount).toLocaleString()}`, color: 'text-gray-300' },
  { label: 'Margin', value: `৳${(Number(sale.value.total_amount) - Number(sale.value.cogs_amount)).toLocaleString()}`, color: 'text-emerald-400' },
  { label: 'Paid / Due', value: `৳${Number(sale.value.amount_paid).toLocaleString()} / ৳${Number(sale.value.balance_due).toLocaleString()}`, color: Number(sale.value.balance_due) > 0 ? 'text-orange-400' : 'text-emerald-400' },
] : [])

function formatDiff(json: string) {
  try {
    const d = JSON.parse(json)
    return Object.entries(d).map(([k, v]: [string, any]) => `${k}: ${v.from} → ${v.to}`).join(' · ')
  } catch { return '' }
}

// Accounts for the payment form
const [{ data: bankData }, { data: pettyData }] = await Promise.all([
  useFetch('/api/lookup/bank-accounts'), useFetch('/api/lookup/cash-accounts'),
])
const bankAccountOptions = computed(() => (((bankData.value as any)?.accounts ?? []) as any[]).map(a => ({
  value: a.id, label: `${a.bank_name} — AC: ${a.account_number}`, sub: a.branch_name || '' })))
const cashAccountOptions = computed(() => (((pettyData.value as any)?.accounts ?? []) as any[]).map(a => ({
  value: a.id, label: a.account_name, sub: a.branch_name || 'Head Office' })))

const pay = reactive({ amount: 0, method: 'Cash', bankAccountId: '' as any, cashAccountId: '' as any, reference: '' })
const collecting = ref(false)
async function collect() {
  collecting.value = true
  try {
    const res: any = await $fetch(`/api/trading/sales/${saleId.value}/payment`, {
      method: 'POST',
      body: {
        amount: pay.amount, payment_method: pay.method,
        bank_account_id: pay.bankAccountId || undefined,
        cash_account_id: pay.cashAccountId || undefined,
        reference_number: pay.reference || undefined,
      },
    })
    success(res.queued ? (res.message ?? 'Payment queued for approval') : `${res.payment_number} posted ✓`)
    pay.amount = 0
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Payment failed')
  } finally { collecting.value = false }
}

async function reversePayment(p: any) {
  const reason = prompt(`Reverse ${p.payment_number} (৳${Number(p.amount).toLocaleString()})? Reason:`)
  if (!reason?.trim()) return
  try {
    await $fetch(`/api/trading/payments/${p.id}`, { method: 'DELETE', body: { reason } })
    success('Payment reversed — restorable from Recycle Bin')
    await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Reverse failed') }
}

const showEdit = ref(false)
const editing  = ref(false)
const edit = reactive({ quantity: 0, unit_price: 0, sale_date: '', origin: '', reason: '' })
watch(sale, (s: any) => {
  if (!s) return
  edit.quantity = Number(s.quantity); edit.unit_price = Number(s.unit_price)
  edit.sale_date = String(s.sale_date).slice(0, 10); edit.origin = s.origin ?? ''
}, { immediate: true })
async function submitEdit() {
  editing.value = true
  try {
    const res: any = await $fetch(`/api/trading/sales/${saleId.value}/edit`, {
      method: 'POST',
      body: { quantity: edit.quantity, unit_price: edit.unit_price, sale_date: edit.sale_date, origin: edit.origin, reason: edit.reason },
    })
    if (res.queued) { success(res.message ?? 'Correction queued'); showEdit.value = false; await refresh() }
    else { success(`Corrected → ${res.sale_number} ✓`); navigateTo(`/trading/sales/${res.id}`, { replace: true }) }
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Correction failed')
  } finally { editing.value = false }
}

async function deleteSale() {
  const reason = prompt(`Delete ${sale.value.sale_number}? This reverses stock + ledger (restorable). Reason:`)
  if (!reason?.trim()) return
  try {
    await $fetch(`/api/trading/sales/${saleId.value}`, { method: 'DELETE', body: { reason } })
    success('Sale deleted — restorable from Recycle Bin')
    navigateTo('/trading/sales')
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Delete failed') }
}

const gateForm = reactive({ driver_name: '', vehicle_number: '', received_by: '' })
const dispatching = ref(false)
async function dispatchAction(action: 'gate_out' | 'deliver') {
  dispatching.value = true
  try {
    await $fetch(`/api/trading/sales/${saleId.value}/dispatch`, {
      method: 'POST',
      body: { action, driver_name: gateForm.driver_name || undefined, vehicle_number: gateForm.vehicle_number || undefined, received_by: gateForm.received_by || undefined },
    })
    success(action === 'deliver' ? 'Delivery confirmed & locked ✓' : 'Gate-out recorded ✓')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Dispatch action failed')
  } finally { dispatching.value = false }
}
</script>
