<template>
  <div class="space-y-6">
    <UiPageHeader title="Vehicle Rentals" subtitle="Rental income — daily/monthly/trip/fixed contracts"
                  :breadcrumb="['Fleet', 'Rentals']">
      <template #actions>
        <button @click="openCreate" class="btn-gold text-xs">+ New Rental</button>
      </template>
    </UiPageHeader>

    <!-- KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Scheduled"   :value="String(stats.scheduled || 0)" icon="list" color="blue" trend-up trend="Upcoming" />
      <KpiCard label="In Progress" :value="String(stats.in_progress || 0)" icon="truck" color="teal" trend-up trend="Active now" />
      <KpiCard label="Completed (mo.)" :value="String(stats.completed_this_month || 0)" icon="check" color="gold" trend-up trend="This month" />
      <KpiCard label="Revenue (mo.)" :value="'৳' + Number(stats.revenue_this_month || 0).toLocaleString()" icon="chart" color="gold" trend-up trend="This month" />
    </div>

    <div class="glass-card p-4 flex flex-wrap gap-3">
      <select v-model="filterStatus" class="input-glass w-auto text-xs py-1.5">
        <option value="">All Status</option>
        <option>Scheduled</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
      </select>
    </div>

    <div class="glass-card overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-white/[0.06]">
            <th class="py-2.5 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Vehicle</th>
            <th class="py-2.5 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Customer</th>
            <th class="py-2.5 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Type</th>
            <th class="py-2.5 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Period</th>
            <th class="py-2.5 px-4 text-right text-gray-600 font-semibold uppercase tracking-wider">Amount ৳</th>
            <th class="py-2.5 px-4 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
            <th class="py-2.5 px-4 text-center text-gray-600 font-semibold uppercase tracking-wider">Payment</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/[0.04]">
          <tr v-for="r in rentals" :key="r.id" class="hover:bg-white/[0.02]">
            <td class="py-2.5 px-4 font-mono text-gold-400/80">{{ r.vehicle_no }}</td>
            <td class="py-2.5 px-4 text-gray-200">{{ r.customer_name }}</td>
            <td class="py-2.5 px-4 text-gray-400">{{ r.rental_type }}</td>
            <td class="py-2.5 px-4 text-gray-500">{{ fmtDate(r.start_datetime) }} → {{ fmtDate(r.end_datetime) }}</td>
            <td class="py-2.5 px-4 text-right font-semibold text-gray-200">{{ Number(r.total_amount).toLocaleString() }}</td>
            <td class="py-2.5 px-4 text-center">
              <select :value="r.status" @change="updateRental(r, { status: ($event.target as HTMLSelectElement).value })"
                      class="input-glass text-[10px] py-0.5">
                <option>Scheduled</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
              </select>
            </td>
            <td class="py-2.5 px-4 text-center">
              <select :value="r.payment_status" @change="updateRental(r, { payment_status: ($event.target as HTMLSelectElement).value })"
                      class="input-glass text-[10px] py-0.5">
                <option>Pending</option><option>Partially Paid</option><option>Paid</option>
              </select>
            </td>
          </tr>
          <tr v-if="!rentals.length">
            <td colspan="7" class="py-10 text-center text-gray-600">No rentals yet. Book one with "+ New Rental".</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ══════════════ NEW RENTAL MODAL ══════════════ -->
    <Teleport to="body">
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)" @click.self="showCreate = false">
        <div class="glass-card p-6 w-full max-w-lg space-y-4" @click.stop>
          <div class="flex items-start justify-between">
            <h3 class="text-sm font-semibold text-gray-200">New Vehicle Rental</h3>
            <button @click="showCreate = false" class="text-gray-600 hover:text-gray-300 text-lg leading-none">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="field-label">Vehicle *</label>
              <select v-model="form.vehicle_id" class="field-input w-full">
                <option value="">Select…</option>
                <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.registration_no }}</option>
              </select>
            </div>
            <div>
              <label class="field-label">Customer *</label>
              <UiSearchSelect v-model="form.customer_id" :options="customerOptions" placeholder="Search customer…" />
            </div>
            <div>
              <label class="field-label">Rental Type *</label>
              <select v-model="form.rental_type" class="field-input w-full" @change="recalc">
                <option>Daily</option><option>Monthly</option><option>Trip</option><option>Fixed</option>
              </select>
            </div>
            <div>
              <label class="field-label">{{ form.rental_type === 'Trip' || form.rental_type === 'Fixed' ? 'Total Cost ৳ *' : `Rate per ${form.rental_type === 'Monthly' ? 'Month' : 'Day'} ৳ *` }}</label>
              <input v-model.number="form.rate" type="number" class="field-input w-full font-mono" @input="recalc" />
            </div>
            <div>
              <label class="field-label">Start</label>
              <input v-model="form.start_date" type="datetime-local" class="field-input w-full" @change="recalc" />
            </div>
            <div>
              <label class="field-label">End</label>
              <input v-model="form.end_date" type="datetime-local" class="field-input w-full" @change="recalc" />
            </div>
            <div class="col-span-2">
              <label class="field-label">Total Amount ৳ *</label>
              <input v-model.number="form.total_amount" type="number" class="field-input w-full font-mono" />
              <p class="text-[10px] text-gray-600 mt-1">Posts as an invoice: DR Accounts Receivable / CR Vehicle Rental Income.</p>
            </div>
            <div class="col-span-2">
              <label class="field-label">Notes</label>
              <input v-model="form.notes" type="text" class="field-input w-full" placeholder="Rental terms, destination, etc." />
            </div>
          </div>

          <div v-if="createError" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{{ createError }}</div>

          <div class="flex gap-2 pt-1">
            <button @click="showCreate = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
            <button @click="submitCreate" :disabled="!canSubmit || saving" class="btn-gold text-xs flex-1 justify-center disabled:opacity-40">
              {{ saving ? 'Booking…' : 'Book Rental' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const filterStatus = ref('')
const { data, refresh } = await useFetch('/api/fleet/rentals', {
  query: computed(() => ({ status: filterStatus.value })),
})
const rentals = computed(() => (data.value as any)?.rentals ?? [])
const stats    = computed(() => (data.value as any)?.stats ?? {})

const { data: vData } = await useFetch('/api/fleet/vehicles')
const { data: cData } = await useFetch('/api/customers', { query: { per: 500, simple: '1' } })
const vehicles = computed(() => (vData.value as any)?.vehicles ?? [])
const customerOptions = computed(() =>
  ((cData.value as any)?.customers ?? (cData.value as any)?.data ?? []).map((c: any) => ({ value: c.id, label: c.name })),
)

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: '2-digit' })
}

async function updateRental(r: any, patch: any) {
  try {
    await $fetch(`/api/fleet/rentals/${r.id}`, { method: 'PATCH', body: patch })
    success('Rental updated')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update rental')
  }
}

// ── Create modal ─────────────────────────────────────────
const showCreate  = ref(false)
const saving      = ref(false)
const createError = ref('')

const form = reactive({
  vehicle_id: '', customer_id: '', rental_type: 'Daily', rate: 0,
  start_date: new Date().toISOString().slice(0, 16),
  end_date:   new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  total_amount: 0, notes: '',
})

function openCreate() {
  Object.assign(form, {
    vehicle_id: '', customer_id: '', rental_type: 'Daily', rate: 0,
    start_date: new Date().toISOString().slice(0, 16),
    end_date:   new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    total_amount: 0, notes: '',
  })
  createError.value = ''
  showCreate.value = true
}

function recalc() {
  if (form.rental_type === 'Trip' || form.rental_type === 'Fixed') {
    form.total_amount = Number(form.rate) || 0
    return
  }
  const start = new Date(form.start_date).getTime()
  const end   = new Date(form.end_date).getTime()
  if (!(end > start) || !form.rate) return
  if (form.rental_type === 'Daily') {
    const days = Math.max(1, Math.ceil((end - start) / 86400000))
    form.total_amount = days * Number(form.rate)
  } else if (form.rental_type === 'Monthly') {
    const months = Math.max(1, Math.ceil((end - start) / (30 * 86400000)))
    form.total_amount = months * Number(form.rate)
  }
}

const canSubmit = computed(() =>
  form.vehicle_id && form.customer_id && form.total_amount > 0 && form.start_date && form.end_date,
)

async function submitCreate() {
  saving.value = true
  createError.value = ''
  try {
    await $fetch('/api/fleet/rentals', {
      method: 'POST',
      body: {
        vehicle_id: form.vehicle_id, customer_id: form.customer_id,
        rental_type: form.rental_type, start_datetime: form.start_date.replace('T', ' '),
        end_datetime: form.end_date.replace('T', ' '), rate: form.rate,
        total_amount: form.total_amount, notes: form.notes,
      },
    })
    success('Rental booked and posted to the ledger ✓')
    showCreate.value = false
    await refresh()
  } catch (e: any) {
    createError.value = e?.data?.statusMessage ?? 'Failed to book rental'
  } finally {
    saving.value = false
  }
}
</script>
