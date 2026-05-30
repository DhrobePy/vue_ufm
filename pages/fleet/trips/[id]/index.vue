<template>
  <div class="space-y-6" v-if="trip">
    <!-- Header -->
    <UiPageHeader
      :title="trip.trip_number"
      :subtitle="`${trip.origin || '—'} → ${trip.destination || '—'}`"
      :breadcrumb="['Fleet','Trips', trip.trip_number]"
    >
      <template #actions>
        <UiStatusBadge :status="trip.trip_status" />
        <span class="badge text-[10px]" :class="trip.report_status === 'reported' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'">
          {{ trip.report_status }}
        </span>
        <NuxtLink :to="`/fleet/trips/${id}/print`" target="_blank" class="btn-secondary text-xs">🖨 Print Sheet</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Workflow buttons -->
    <div class="flex gap-2 flex-wrap">
      <button v-if="trip.trip_status === 'scheduled'"   @click="doAction('start')"    class="btn-gold text-xs">▶ Start Trip</button>
      <button v-if="trip.trip_status === 'in_progress'" @click="doAction('complete')" class="btn-secondary text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">✓ Mark Completed</button>
      <button v-if="trip.trip_status === 'completed'"   @click="doAction('close')"    class="btn-secondary text-xs">Close Trip</button>
      <button v-if="trip.trip_status === 'scheduled' || trip.trip_status === 'in_progress'" @click="doAction('cancel')" class="btn-secondary text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">✕ Cancel</button>
      <button v-if="trip.trip_status === 'completed' && trip.report_status === 'unreported'" @click="doAction('report')" class="btn-secondary text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10">📋 Mark Reported</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: main info -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Trip Info -->
        <div class="glass-card p-5">
          <h3 class="section-title mb-4">Trip Details</h3>
          <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div v-for="f in tripFields" :key="f.label" class="flex justify-between">
              <span class="text-gray-500">{{ f.label }}</span>
              <span class="text-gray-200 font-medium">{{ f.value || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Tabs: Advances | Expenses | Profitability -->
        <div class="glass-card p-5">
          <div class="flex gap-1 border-b border-white/[0.06] mb-4">
            <button v-for="t in ['Advances','Expenses','Profitability']" :key="t"
              @click="subTab = t"
              class="px-4 py-2 text-xs font-medium transition-colors"
              :class="subTab===t ? 'text-gold-400 border-b-2 border-gold-400' : 'text-gray-500 hover:text-gray-300'">
              {{ t }}
            </button>
          </div>

          <!-- Advances -->
          <div v-if="subTab === 'Advances'">
            <div class="flex justify-end mb-3">
              <button @click="showAddAdvance = !showAddAdvance" class="btn-gold text-xs">+ Add Advance</button>
            </div>
            <form v-if="showAddAdvance" @submit.prevent="addAdvance" class="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-white/[0.03]">
              <div><label class="form-label">Amount *</label><input v-model="advForm.amount" type="number" class="form-input" required /></div>
              <div><label class="form-label">Purpose</label><input v-model="advForm.purpose" class="form-input" /></div>
              <div><label class="form-label">Given By</label><input v-model="advForm.given_by" class="form-input" /></div>
              <div class="col-span-3 flex gap-2">
                <button type="submit" class="btn-gold text-xs">Save</button>
                <button type="button" @click="showAddAdvance = false" class="btn-secondary text-xs">Cancel</button>
              </div>
            </form>
            <div v-if="!advances.length" class="text-center py-4 text-gray-600 text-sm">No advances recorded</div>
            <div v-for="a in advances" :key="a.id" class="flex justify-between p-3 rounded-lg hover:bg-white/[0.02] text-sm">
              <div>
                <p class="text-gray-300">{{ a.purpose || 'Advance' }}</p>
                <p class="text-xs text-gray-600">{{ a.given_by ? 'By ' + a.given_by : '' }} · {{ a.given_at?.slice(0,10) }}</p>
              </div>
              <p class="font-medium text-amber-400">৳{{ Number(a.amount).toLocaleString() }}</p>
            </div>
          </div>

          <!-- Expenses -->
          <div v-if="subTab === 'Expenses'">
            <div class="flex justify-end mb-3">
              <button @click="showAddExpense = !showAddExpense" class="btn-gold text-xs">+ Add Expense</button>
            </div>
            <form v-if="showAddExpense" @submit.prevent="addExpense" class="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-white/[0.03]">
              <div><label class="form-label">Category</label>
                <select v-model="expForm.category" class="form-input">
                  <option v-for="c in expCategories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div><label class="form-label">Description</label><input v-model="expForm.description" class="form-input" /></div>
              <div><label class="form-label">Amount *</label><input v-model="expForm.amount" type="number" class="form-input" required /></div>
              <div class="col-span-3 flex gap-2">
                <button type="submit" class="btn-gold text-xs">Save</button>
                <button type="button" @click="showAddExpense = false" class="btn-secondary text-xs">Cancel</button>
              </div>
            </form>
            <div v-if="!expenses.length" class="text-center py-4 text-gray-600 text-sm">No expenses recorded</div>
            <div v-for="e in expenses" :key="e.id" class="flex justify-between p-3 rounded-lg hover:bg-white/[0.02] text-sm">
              <div>
                <p class="text-gray-300">{{ e.category || 'Expense' }} <span class="text-gray-500">· {{ e.description }}</span></p>
                <p class="text-xs text-gray-600">{{ e.incurred_at?.slice(0,10) }}</p>
              </div>
              <p class="font-medium text-red-400">৳{{ Number(e.amount).toLocaleString() }}</p>
            </div>
          </div>

          <!-- Profitability -->
          <div v-if="subTab === 'Profitability'">
            <div class="space-y-3">
              <div class="flex justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span class="text-sm text-emerald-400">Revenue (Trip Charge)</span>
                <span class="text-sm font-bold text-emerald-400">৳{{ fmt(settlement.revenue) }}</span>
              </div>
              <div class="flex justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span class="text-sm text-amber-400">Total Advances Given</span>
                <span class="text-sm font-bold text-amber-400">৳{{ fmt(settlement.total_advance) }}</span>
              </div>
              <div class="flex justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span class="text-sm text-red-400">Total Expenses</span>
                <span class="text-sm font-bold text-red-400">৳{{ fmt(settlement.total_expense) }}</span>
              </div>
              <div class="flex justify-between p-3 rounded-xl" :class="settlement.final_balance >= 0 ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-red-500/10 border border-red-500/20'">
                <span class="text-sm font-bold" :class="settlement.final_balance >= 0 ? 'text-blue-400' : 'text-red-400'">Final Balance (Due to Company)</span>
                <span class="text-sm font-bold" :class="settlement.final_balance >= 0 ? 'text-blue-400' : 'text-red-400'">৳{{ fmt(settlement.final_balance) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: sidebar -->
      <div class="space-y-4">
        <!-- Vehicle -->
        <div class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vehicle</h4>
          <p class="text-sm font-mono font-bold text-gold-400/90">{{ trip.vehicle_no }}</p>
          <p class="text-xs text-gray-500">{{ trip.vehicle_type }} · {{ trip.make }} {{ trip.model }}</p>
        </div>

        <!-- Driver -->
        <div class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Driver</h4>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {{ trip.driver_name?.charAt(0) }}
            </div>
            <div>
              <p class="text-sm text-gray-200">{{ trip.driver_name }}</p>
              <p class="text-xs text-gray-500">{{ trip.driver_mobile || 'No mobile' }}</p>
            </div>
          </div>
        </div>

        <!-- Customer -->
        <div v-if="trip.customer_name" class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h4>
          <p class="text-sm text-gray-200">{{ trip.customer_name }}</p>
          <p class="text-xs text-gray-500">{{ trip.customer_phone || '' }}</p>
        </div>

        <!-- Settlement quick view -->
        <div class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Settlement Summary</h4>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-500">Charge</span><span class="text-emerald-400 font-medium">৳{{ fmt(settlement.revenue) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Advance</span><span class="text-amber-400 font-medium">৳{{ fmt(settlement.total_advance) }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Expenses</span><span class="text-red-400 font-medium">৳{{ fmt(settlement.total_expense) }}</span></div>
            <div class="border-t border-white/[0.06] pt-2 flex justify-between">
              <span class="text-gray-400 font-medium">Balance Due</span>
              <span class="font-bold" :class="settlement.final_balance >= 0 ? 'text-blue-400' : 'text-red-400'">৳{{ fmt(settlement.final_balance) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id    = Number(route.params.id)

const { data, refresh } = await useFetch(`/api/fleet/trips/${id}`)

const trip       = computed(() => (data.value as any)?.trip       ?? null)
const advances   = computed(() => (data.value as any)?.advances   ?? [])
const expenses   = computed(() => (data.value as any)?.expenses   ?? [])
const settlement = computed(() => (data.value as any)?.settlement ?? { revenue: 0, total_advance: 0, total_expense: 0, final_balance: 0 })

const subTab = ref('Advances')

// Advance form
const showAddAdvance = ref(false)
const advForm = reactive({ amount: '', purpose: '', given_by: '' })

// Expense form
const showAddExpense = ref(false)
const expCategories = ['Toll', 'Fuel', 'Food', 'Labour', 'Repair', 'Parking', 'Ferry', 'Other']
const expForm = reactive({ category: 'Toll', description: '', amount: '' })

const tripFields = computed(() => {
  const t = trip.value
  if (!t) return []
  return [
    { label: 'Trip Date',    value: t.trip_date },
    { label: 'Departure',    value: t.departure_time || '—' },
    { label: 'Origin',       value: t.origin },
    { label: 'Destination',  value: t.destination },
    { label: 'Goods',        value: t.goods_description },
    { label: 'Quantity',     value: t.quantity ? Number(t.quantity).toLocaleString() : null },
    { label: 'Weight',       value: t.weight_kg ? Number(t.weight_kg).toLocaleString() + ' kg' : null },
    { label: 'Est. Duration',value: t.estimated_duration ? t.estimated_duration + ' hrs' : null },
    { label: 'Trip Charge',  value: t.trip_charge ? '৳' + Number(t.trip_charge).toLocaleString() : null },
    { label: 'Advance',      value: t.advance_amount ? '৳' + Number(t.advance_amount).toLocaleString() : null },
    { label: 'Dest. Account',value: t.destination_account },
    { label: 'Payment Date', value: t.payment_date },
  ]
})

function fmt(n: any) { return Number(n || 0).toLocaleString('en-BD') }

async function doAction(action: string) {
  await $fetch(`/api/fleet/trips/${id}`, { method: 'PATCH', body: { action } })
  refresh()
}

async function addAdvance() {
  await $fetch(`/api/fleet/trips/${id}`, { method: 'PATCH', body: { action: 'add_advance', ...advForm } })
  advForm.amount = ''; advForm.purpose = ''; advForm.given_by = ''
  showAddAdvance.value = false
  refresh()
}

async function addExpense() {
  await $fetch(`/api/fleet/trips/${id}`, { method: 'PATCH', body: { action: 'add_expense', ...expForm } })
  expForm.amount = ''; expForm.description = ''
  showAddExpense.value = false
  refresh()
}
</script>
