<template>
  <div class="space-y-5">
    <UiPageHeader :title="order ? `Amend ${order.order_number}` : 'Amend Order'"
                  :subtitle="order?.customer_name ?? ''"
                  :breadcrumb="['Credit Sales', order?.order_number ?? '…', 'Amend']">
      <template #actions>
        <NuxtLink :to="`/credit-sales/${orderId}`" class="btn-ghost text-xs">← Order</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-12 text-center">
      <div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"/>
      <p class="text-xs text-gray-500">Loading order…</p>
    </div>

    <template v-else-if="order">
      <!-- Regime banner -->
      <div class="glass-card px-5 py-3.5 flex items-center gap-3 border"
           :class="regime === 'pre' ? 'bg-sky-500/5 border-sky-500/20' : 'bg-amber-500/5 border-amber-500/20'">
        <span class="text-2xl">{{ regime === 'pre' ? '✏️' : '🧾' }}</span>
        <div class="text-xs">
          <p class="font-bold" :class="regime === 'pre' ? 'text-sky-300' : 'text-amber-300'">
            {{ regime === 'pre' ? 'PRE-DISPATCH — direct edit' : 'POST-DISPATCH — debit / credit note' }}
          </p>
          <p class="text-gray-500 mt-0.5">
            {{ regime === 'pre'
              ? 'The invoice has not hit the ledger yet, so items can be edited directly. Every change is snapshotted.'
              : 'The invoice is already posted. Changes go through the ledger as a debit note (+) or credit note (−) with a balanced journal entry — the original invoice is never touched.' }}
          </p>
        </div>
        <UiStatusBadge :status="order.status" class="ml-auto" />
      </div>

      <!-- ── PRE: item grid ─────────────────────────────────────────────── -->
      <div v-if="regime === 'pre'" class="glass-card p-0 overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <h2 class="text-sm font-bold text-gray-200">Edit Items</h2>
          <span class="text-[11px] text-gray-600">Current total ৳{{ Number(order.total_amount).toLocaleString() }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="border-b border-white/[0.04] text-[10px] text-gray-600 uppercase">
              <tr>
                <th class="px-4 py-2.5 text-left">Product</th>
                <th class="px-3 py-2.5 text-center w-24">Qty (bags)</th>
                <th class="px-3 py-2.5 text-center w-28">Unit Price</th>
                <th class="px-3 py-2.5 text-center w-24">Discount</th>
                <th class="px-3 py-2.5 text-right w-28">Line Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.03]">
              <tr v-for="(it, i) in editItems" :key="i">
                <td class="px-4 py-2.5 text-gray-300">
                  {{ it.product_name }} <span class="text-gray-600">{{ it.weight_variant }}</span>
                </td>
                <td class="px-3 py-2">
                  <input v-model.number="it.quantity" type="number" min="0" class="input-glass w-full py-1 text-center font-mono" />
                </td>
                <td class="px-3 py-2">
                  <input v-model.number="it.unit_price" type="number" min="0" class="input-glass w-full py-1 text-center font-mono" />
                </td>
                <td class="px-3 py-2">
                  <input v-model.number="it.discount_amount" type="number" min="0" class="input-glass w-full py-1 text-center font-mono" />
                </td>
                <td class="px-3 py-2.5 text-right font-mono font-bold text-gray-200">
                  ৳{{ lineTotal(it).toLocaleString() }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-white/[0.08]">
                <td colspan="4" class="px-4 py-3 text-right font-semibold text-gray-400">New Total</td>
                <td class="px-3 py-3 text-right font-mono font-bold text-gold-300 text-sm">৳{{ newTotal.toLocaleString() }}</td>
              </tr>
              <tr>
                <td colspan="4" class="px-4 pb-3 text-right text-[11px] text-gray-600">Change</td>
                <td class="px-3 pb-3 text-right font-mono text-xs"
                    :class="delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-gray-600'">
                  {{ delta > 0 ? '+' : '' }}৳{{ delta.toLocaleString() }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ── POST: flat amount ──────────────────────────────────────────── -->
      <div v-else class="glass-card p-5 space-y-4">
        <h2 class="text-sm font-bold text-gray-200">Debit / Credit Note</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Type</label>
            <select v-model="postForm.amend_type" class="input-glass w-full">
              <option value="freight">Freight charge (+)</option>
              <option value="rebate">Rebate / discount (−)</option>
              <option value="correction">Correction (±)</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Amount (৳) — negative reduces the bill</label>
            <input v-model.number="postForm.flat_amount" type="number" step="1"
                   class="input-glass w-full text-center font-mono font-bold text-base"
                   :class="Number(postForm.flat_amount) < 0 ? 'text-red-300' : 'text-emerald-300'" />
          </div>
          <div class="flex items-end pb-1">
            <p class="text-[11px]" :class="Number(postForm.flat_amount) > 0 ? 'text-emerald-400' : Number(postForm.flat_amount) < 0 ? 'text-red-400' : 'text-gray-600'">
              {{ Number(postForm.flat_amount) > 0 ? `Debit note — customer owes ৳${Number(postForm.flat_amount).toLocaleString()} more`
                 : Number(postForm.flat_amount) < 0 ? `Credit note — bill reduced by ৳${Math.abs(Number(postForm.flat_amount)).toLocaleString()}`
                 : 'Enter an amount' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Description + submit -->
      <div class="glass-card p-5 space-y-4">
        <div class="space-y-1.5">
          <label class="text-[11px] text-gray-500">Reason / description *</label>
          <textarea v-model="description" rows="2" class="input-glass w-full resize-none"
                    placeholder="e.g. Truck changed from big to mini at gate — freight difference" />
        </div>
        <div class="flex items-center justify-end gap-3">
          <button @click="submit" :disabled="!canSubmit || saving" class="btn-gold text-xs px-6 py-2 disabled:opacity-50">
            {{ saving ? 'Submitting…' : 'Submit Amendment' }}
          </button>
        </div>
      </div>

      <!-- ── Admin header edit ──────────────────────────────────────────── -->
      <div v-if="isAdmin" class="glass-card p-5 space-y-4 border border-violet-500/15">
        <h2 class="text-sm font-bold text-violet-300">Admin — Header Edit <span class="text-[10px] font-normal text-gray-600">(non-money fields, audited)</span></h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Required Date</label>
            <input v-model="headerForm.required_date" type="date" class="input-glass w-full" />
          </div>
          <div class="space-y-1.5">
            <label class="text-[11px] text-gray-500">Priority</label>
            <select v-model="headerForm.priority" class="input-glass w-full">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-[11px] text-gray-500">Shipping Address</label>
            <input v-model="headerForm.shipping_address" type="text" class="input-glass w-full" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label class="text-[11px] text-gray-500">Special Instructions</label>
            <input v-model="headerForm.special_instructions" type="text" class="input-glass w-full" />
          </div>
        </div>
        <div class="flex justify-end">
          <button @click="saveHeader" :disabled="savingHeader"
                  class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/25 hover:bg-violet-500/25 disabled:opacity-40">
            {{ savingHeader ? 'Saving…' : 'Save Header Changes' }}
          </button>
        </div>
      </div>

      <!-- ── Amendment history ──────────────────────────────────────────── -->
      <div class="glass-card p-0 overflow-hidden">
        <div class="px-5 py-3.5 border-b border-white/[0.06]">
          <h2 class="text-sm font-bold text-gray-200">Amendment History</h2>
        </div>
        <div v-if="!amendments.length" class="py-8 text-center text-gray-600 text-xs italic">No amendments yet</div>
        <div v-else class="divide-y divide-white/[0.04]">
          <div v-for="a in amendments" :key="a.id" class="px-5 py-3.5 flex items-start gap-3 flex-wrap">
            <div class="min-w-[130px]">
              <p class="text-xs font-bold font-mono text-gray-300">{{ a.amendment_number }}</p>
              <p class="text-[10px] text-gray-600">{{ new Date(a.created_at).toLocaleDateString('en-GB') }}</p>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="a.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400'
                        : a.status === 'rejected' ? 'bg-red-500/15 text-red-400'
                        : 'bg-amber-500/15 text-amber-400'">
              {{ a.status }}
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-gray-500">{{ a.regime }} · {{ a.amend_type }}</span>
            <div class="flex-1 text-xs text-gray-500 min-w-[160px]">
              {{ a.description || '—' }}
              <span v-if="a.flat_amount" class="font-mono ml-1"
                    :class="Number(a.flat_amount) > 0 ? 'text-emerald-400' : 'text-red-400'">
                {{ Number(a.flat_amount) > 0 ? '+' : '' }}৳{{ Number(a.flat_amount).toLocaleString() }}
              </span>
            </div>
            <div class="text-[10px] text-gray-600 text-right">
              <p>by {{ a.requested_by_name ?? '—' }}</p>
              <p v-if="a.decided_by_name">{{ a.status }} by {{ a.decided_by_name }}</p>
            </div>
            <div v-if="a.status === 'pending' && isAdmin" class="flex gap-2">
              <button @click="decide(a, 'approve')" class="px-3 py-1 rounded-lg text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25">Approve</button>
              <button @click="decide(a, 'reject')" class="px-3 py-1 rounded-lg text-[11px] text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route   = useRoute()
const orderId = Number(route.params.id)
const { user } = useUserSession()
const { success, error: toastError } = useToast()

const isAdmin = computed(() =>
  ['admin', 'superadmin'].includes((user.value?.role ?? '').toLowerCase()))

const PRE = ['pending_approval', 'escalated', 'approved', 'in_production', 'ready_to_ship']

const [{ data, pending, refresh }, { data: amdData, refresh: refreshAmd }] = await Promise.all([
  useFetch(`/api/credit-sales/${orderId}`),
  useFetch(`/api/credit-sales/${orderId}/amendments`),
])
const order      = computed<any>(() => (data.value as any)?.order ?? null)
const items      = computed<any[]>(() => (data.value as any)?.items ?? [])
const amendments = computed<any[]>(() => (amdData.value as any)?.amendments ?? [])
const regime     = computed(() => PRE.includes(order.value?.status) ? 'pre' : 'post')

// ── PRE edit grid ─────────────────────────────────────────────────────────────
const editItems = ref<any[]>([])
watch(items, (its) => {
  editItems.value = its.map((it: any) => ({
    product_id: it.product_id, variant_id: it.variant_id,
    product_name: it.product_name, weight_variant: it.weight_variant,
    quantity: Number(it.quantity), unit_price: Number(it.unit_price),
    discount_amount: Number(it.discount_amount ?? 0),
  }))
}, { immediate: true })

function lineTotal(it: any): number {
  return Number(it.quantity || 0) * Number(it.unit_price || 0) - Number(it.discount_amount || 0)
}
const newTotal = computed(() => editItems.value.reduce((s, it) => s + lineTotal(it), 0))
const delta    = computed(() => regime.value === 'pre'
  ? newTotal.value - Number(order.value?.total_amount ?? 0)
  : Number(postForm.flat_amount || 0))

// ── POST form ─────────────────────────────────────────────────────────────────
const postForm = reactive({ amend_type: 'freight', flat_amount: null as number | null })
const description = ref('')

const canSubmit = computed(() => {
  if (!description.value.trim()) return false
  if (regime.value === 'pre') return Math.abs(delta.value) > 0.005 && editItems.value.every(it => it.quantity >= 0 && it.unit_price >= 0)
  return !!Number(postForm.flat_amount)
})

const saving = ref(false)
async function submit() {
  saving.value = true
  try {
    const res: any = await $fetch(`/api/credit-sales/${orderId}/amendments`, {
      method: 'POST',
      body: regime.value === 'pre'
        ? { amend_type: 'correction', description: description.value, new_items: editItems.value }
        : { amend_type: postForm.amend_type, description: description.value, flat_amount: Number(postForm.flat_amount) },
    })
    success(res.status === 'approved'
      ? `${res.amendment_number} applied ✓`
      : `${res.amendment_number} submitted — pending admin approval`)
    description.value = ''
    postForm.flat_amount = null
    await Promise.all([refresh(), refreshAmd()])
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to submit amendment')
  } finally {
    saving.value = false
  }
}

async function decide(a: any, action: string) {
  const note = action === 'reject' ? (prompt('Reason for rejection:') ?? undefined) : undefined
  if (action === 'reject' && note === undefined) return
  try {
    await $fetch(`/api/credit-sales/amendments/${a.id}/decide`, { method: 'POST', body: { action, note } })
    success(`${a.amendment_number} ${action}d`)
    await Promise.all([refresh(), refreshAmd()])
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Decision failed')
  }
}

// ── Admin header edit ─────────────────────────────────────────────────────────
const headerForm  = reactive({ required_date: '', priority: 'normal', shipping_address: '', special_instructions: '' })
watch(order, (o) => {
  if (!o) return
  headerForm.required_date        = o.required_date ? String(o.required_date).slice(0, 10) : ''
  headerForm.priority             = o.priority ?? 'normal'
  headerForm.shipping_address     = o.shipping_address ?? ''
  headerForm.special_instructions = o.special_instructions ?? ''
}, { immediate: true })

const savingHeader = ref(false)
async function saveHeader() {
  savingHeader.value = true
  try {
    await $fetch(`/api/credit-sales/${orderId}/admin-edit`, { method: 'PUT', body: { ...headerForm } })
    success('Header updated ✓ (audited)')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update header')
  } finally {
    savingHeader.value = false
  }
}
</script>
