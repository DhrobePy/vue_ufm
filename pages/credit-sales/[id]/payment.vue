<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="`Collect Payment — ${order.order_number || '…'}`"
      :subtitle="`Customer: ${order.customer_name || '…'} · Outstanding: ৳${Number(order.balance_due || 0).toLocaleString()}`"
      :breadcrumb="['Credit Sales', order.order_number || String(route.params.id), 'Collect Payment']"
    >
      <template #actions>
        <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost text-xs">← Back to Order</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="fetchError" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ fetchError.message }}</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Payment form -->
      <div class="lg:col-span-2 space-y-5">
        <div class="glass-card p-6 space-y-5">
          <h3 class="section-title">Payment Details</h3>

          <!-- Amount -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Amount *</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">৳</span>
              <input v-model.number="form.amount" type="number" min="1" :max="outstanding"
                     class="input-glass pl-8 font-mono text-lg font-bold" placeholder="0" />
            </div>
            <div class="flex flex-wrap gap-2 mt-2">
              <button @click="form.amount = outstanding"
                class="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                Full ৳{{ outstanding.toLocaleString() }}
              </button>
              <button @click="form.amount = Math.round(outstanding / 2)"
                class="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.05] text-gray-400 border border-white/10 hover:bg-white/[0.08] transition-colors">Half</button>
              <button @click="form.amount = 100000"
                class="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.05] text-gray-400 border border-white/10 hover:bg-white/[0.08] transition-colors">1 Lakh</button>
              <button @click="form.amount = 500000"
                class="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.05] text-gray-400 border border-white/10 hover:bg-white/[0.08] transition-colors">5 Lakh</button>
            </div>
          </div>

          <!-- Payment method -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method *</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button v-for="m in methods" :key="m.value"
                @click="form.method = m.value"
                :class="['rounded-xl border p-3 text-center transition-all duration-150',
                  form.method === m.value
                    ? 'bg-gold-500/10 border-gold-500/40 text-gold-400'
                    : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20']"
              >
                <div class="text-xl mb-1">{{ m.icon }}</div>
                <div class="text-xs font-semibold">{{ m.label }}</div>
              </button>
            </div>
          </div>

          <!-- Reference / TxID -->
          <div v-if="form.method !== 'cash'" class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {{ form.method === 'bkash' || form.method === 'nagad' ? 'Transaction ID *' : 'Reference / Cheque No. *' }}
            </label>
            <input v-model="form.reference" type="text" class="input-glass font-mono"
                   :placeholder="form.method === 'bank' ? 'Cheque # or BEFTN reference' : 'e.g. 8A3K2JG9P1'" />
          </div>

          <!-- Bank account -->
          <div v-if="form.method === 'bank'" class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Bank Account *</label>
            <select v-model="form.bankAccountId" class="input-glass">
              <option value="">— Select account —</option>
              <option v-for="a in bankAccounts" :key="a.id" :value="a.id">
                {{ a.bank_name }} — {{ a.branch_name || '' }} — AC: {{ a.account_number }}
              </option>
            </select>
          </div>

          <!-- Date & collector -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Date *</label>
              <input v-model="form.date" type="date" class="input-glass" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Collected By *</label>
              <input v-model="form.collectedBy" type="text" class="input-glass" placeholder="Collector name" />
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes (optional)</label>
            <textarea v-model="form.notes" rows="3" class="input-glass resize-none"
                      placeholder="Any remarks about this payment…" />
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 pt-2 flex-wrap">
            <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
              <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ saving ? 'Recording…' : 'Record Payment' }}
            </button>
            <NuxtLink :to="`/credit-sales/${route.params.id}`" class="btn-ghost">Cancel</NuxtLink>
            <span v-if="form.amount && form.amount > 0" class="ml-auto text-xs text-gray-500">
              After payment: <span class="font-bold text-emerald-400">৳{{ Math.max(0, outstanding - (form.amount || 0)).toLocaleString() }}</span> remaining
            </span>
          </div>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="space-y-5">
        <!-- Order summary -->
        <div class="glass-card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-300">Order Summary</h3>
          <div class="space-y-2.5 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">Order #</span><span class="font-mono text-gold-400/80">{{ order.order_number }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Customer</span><span class="text-gray-300">{{ order.customer_name }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Order Total</span><span class="font-semibold text-gray-200">৳{{ Number(order.total_amount || 0).toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Paid to Date</span><span class="font-semibold text-emerald-400">৳{{ Number(order.amount_paid || 0).toLocaleString() }}</span></div>
            <div class="h-px bg-white/[0.06]" />
            <div class="flex justify-between"><span class="text-gray-600 font-semibold">Outstanding</span><span class="font-bold text-red-400 text-sm">৳{{ outstanding.toLocaleString() }}</span></div>
          </div>
          <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div class="h-full rounded-full bg-emerald-500 transition-all duration-300"
                 :style="`width:${paidPct}%`" />
          </div>
          <p class="text-[10px] text-gray-600 text-right">{{ paidPct }}% collected</p>
        </div>

        <!-- Recent payments -->
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Previous Payments</h3>
          <div v-for="p in recentPayments" :key="p.id" class="flex items-start justify-between gap-2 py-2 border-b border-white/[0.04] last:border-0">
            <div>
              <p class="text-xs font-bold text-gray-200">৳{{ Number(p.amount).toLocaleString() }}</p>
              <p class="text-[11px] text-gray-500">{{ p.payment_method || p.method }} · {{ String(p.payment_date || p.date).slice(0, 10) }}</p>
            </div>
            <UiStatusBadge :status="p.allocation_status || 'cleared'" />
          </div>
          <div v-if="!recentPayments.length" class="text-xs text-gray-600 text-center py-2">No prior payments</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()

const orderId = Number(route.params.id)

// Load order + bank accounts in parallel
const [{ data: orderData, pending, error: fetchError }, { data: bankData }] = await Promise.all([
  useFetch(() => `/api/credit-sales/${orderId}`),
  useFetch('/api/bank-accounts'),
])

const order         = computed(() => (orderData.value?.order          ?? {}) as any)
const recentPayments = computed(() => (orderData.value?.recentPayments ?? orderData.value?.payments ?? []) as any[])
const bankAccounts  = computed(() => (bankData.value?.accounts         ?? []) as any[])

const outstanding = computed(() => Number(order.value.balance_due ?? 0))
const paidPct     = computed(() => {
  const total = Number(order.value.total_amount ?? 0)
  const paid  = Number(order.value.amount_paid  ?? 0)
  if (!total) return 0
  return Math.min(100, Math.round(paid / total * 100))
})

const methods = [
  { value: 'cash',  icon: '💵', label: 'Cash' },
  { value: 'bkash', icon: '📱', label: 'bKash' },
  { value: 'nagad', icon: '📲', label: 'Nagad' },
  { value: 'bank',  icon: '🏦', label: 'Bank Transfer' },
]

const form = reactive({
  amount: null as number | null,
  method: 'cash',
  reference: '',
  bankAccountId: '' as string | number,
  date: new Date().toISOString().slice(0, 10),
  collectedBy: '',
  notes: '',
})

const saving = ref(false)

const isValid = computed(() => {
  if (!form.amount || form.amount <= 0) return false
  if (!form.collectedBy.trim()) return false
  if (form.method !== 'cash' && !form.reference) return false
  if (form.method === 'bank' && !form.bankAccountId) return false
  return true
})

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    const res: any = await $fetch(`/api/credit-sales/${orderId}/payment`, {
      method: 'POST',
      body: {
        amount:               form.amount,
        payment_method:       form.method,
        reference_number:     form.reference   || null,
        bank_account_id:      form.bankAccountId ? Number(form.bankAccountId) : null,
        payment_date:         form.date,
        collected_by_user_id: null,  // server uses session user; name stored in notes
        notes:                form.collectedBy ? `Collected by: ${form.collectedBy}${form.notes ? '. ' + form.notes : ''}` : form.notes || null,
      },
    })
    if (res?.completed) {
      success(`🎉 Order fully paid & marked COMPLETED! ৳${(form.amount || 0).toLocaleString()} received.`)
    } else {
      success(`Payment of ৳${(form.amount || 0).toLocaleString()} recorded successfully`)
    }
    navigateTo(`/credit-sales/${orderId}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to record payment')
  } finally {
    saving.value = false
  }
}
</script>
