<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    <UiPageHeader title="Create Trip" :breadcrumb="['Fleet','Trips','Create']" />

    <form class="glass-card p-6 space-y-5" @submit.prevent="submit">

      <!-- Date & Time -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Trip Date *</label>
          <input v-model="form.trip_date" type="date" class="form-input" required />
        </div>
        <div>
          <label class="form-label">Departure Time</label>
          <input v-model="form.departure_time" type="time" class="form-input" />
        </div>
      </div>

      <!-- Origin & Destination -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Origin / Loading Point</label>
          <input v-model="form.origin" class="form-input" placeholder="e.g. Dhaka Factory" />
        </div>
        <div>
          <label class="form-label">Destination</label>
          <input v-model="form.destination" class="form-input" placeholder="e.g. Chittagong Depot" />
        </div>
      </div>

      <!-- Customer -->
      <div>
        <label class="form-label">Customer (optional)</label>
        <div class="relative" ref="customerRef">
          <input
            v-model="customerSearch"
            type="text"
            class="form-input pr-8"
            placeholder="Search customer…"
            @focus="customerOpen = true"
            @input="customerOpen = true"
            @keydown.escape="customerOpen = false"
          />
          <button v-if="form.customer_id" type="button" @click="clearCustomer" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">×</button>

          <div v-if="customerOpen && filteredCustomers.length"
            class="absolute z-50 w-full mt-1 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
            style="background:rgba(18,18,20,0.98);border:1px solid rgba(255,255,255,0.10);box-shadow:0 8px 24px rgba(0,0,0,0.6)">
            <button
              v-for="c in filteredCustomers" :key="c.id"
              type="button"
              class="w-full text-left px-3 py-2 text-xs hover:bg-white/[0.07] transition-colors"
              @mousedown.prevent="selectCustomer(c)"
            >
              <span class="font-medium text-gray-200">{{ c.name }}</span>
              <span v-if="c.business_name" class="text-gray-500 ml-2">· {{ c.business_name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Vehicle & Driver -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Vehicle *</label>
          <select v-model="form.vehicle_id" class="form-input" required>
            <option value="">— Select vehicle —</option>
            <option v-for="v in availableVehicles" :key="v.id" :value="v.id">
              {{ v.registration_no }} ({{ v.vehicle_type }}) – {{ v.status }}
            </option>
          </select>
        </div>
        <div>
          <label class="form-label">Driver *</label>
          <select v-model="form.driver_id" class="form-input" required>
            <option value="">— Select driver —</option>
            <option v-for="d in activeDrivers" :key="d.id" :value="d.id">{{ d.full_name }} · {{ d.mobile || '' }}</option>
          </select>
        </div>
      </div>

      <!-- Goods Info -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="form-label">Quantity</label>
          <input v-model="form.quantity" type="number" step="0.01" class="form-input" placeholder="Units" />
        </div>
        <div>
          <label class="form-label">Weight (kg)</label>
          <input v-model="form.weight_kg" type="number" step="0.01" class="form-input" placeholder="kg" />
        </div>
        <div>
          <label class="form-label">Est. Duration (hrs)</label>
          <input v-model="form.estimated_duration" type="number" step="0.5" class="form-input" placeholder="8" />
        </div>
      </div>

      <div>
        <label class="form-label">Goods Description</label>
        <input v-model="form.goods_description" class="form-input" placeholder="e.g. 25kg flour bags, 500 units" />
      </div>

      <!-- Financial -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Trip Charge (Revenue) ৳</label>
          <input v-model="form.trip_charge" type="number" step="0.01" class="form-input" placeholder="0" />
        </div>
        <div>
          <label class="form-label">Advance Amount ৳</label>
          <input v-model="form.advance_amount" type="number" step="0.01" class="form-input" placeholder="0" />
        </div>
      </div>

      <!-- Balance summary -->
      <div v-if="form.trip_charge || form.advance_amount" class="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.03]">
        <div class="text-center">
          <p class="text-xs text-gray-500">Trip Charge</p>
          <p class="text-sm font-bold text-gray-200 mt-0.5">৳{{ fmt(form.trip_charge) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">Advance</p>
          <p class="text-sm font-bold text-amber-400 mt-0.5">৳{{ fmt(form.advance_amount) }}</p>
        </div>
        <div class="text-center">
          <p class="text-xs text-gray-500">Balance</p>
          <p class="text-sm font-bold text-emerald-400 mt-0.5">৳{{ fmt(Number(form.trip_charge || 0) - Number(form.advance_amount || 0)) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Destination Account</label>
          <input v-model="form.destination_account" class="form-input" placeholder="Where balance is collected" />
        </div>
        <div>
          <label class="form-label">Payment Date</label>
          <input v-model="form.payment_date" type="date" class="form-input" />
        </div>
      </div>

      <div>
        <label class="form-label">Notes</label>
        <textarea v-model="form.notes" class="form-input" rows="2" placeholder="Any special instructions…" />
      </div>

      <!-- Start immediately -->
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="form.start_immediately" type="checkbox" class="w-4 h-4 accent-gold-400" />
        <span class="text-sm text-gray-300">Start trip immediately (vehicle status → Busy)</span>
      </label>

      <!-- Error -->
      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ error }}</div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button type="submit" class="btn-gold" :disabled="loading">{{ loading ? 'Creating…' : 'Create Trip' }}</button>
        <NuxtLink to="/fleet/trips" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const loading = ref(false)
const error   = ref('')

// Fetch vehicles & drivers
const { data: vData } = await useFetch('/api/fleet/vehicles')
const { data: dData } = await useFetch('/api/fleet/drivers')
const { data: cData } = await useFetch('/api/customers')

const availableVehicles = computed(() => ((vData.value as any)?.vehicles ?? []).filter((v: any) => v.status !== 'inactive'))
const activeDrivers     = computed(() => ((dData.value as any)?.drivers ?? []).filter((d: any) => d.status === 'active'))
const allCustomers      = computed(() => (cData.value as any)?.customers ?? (cData.value as any) ?? [])

// Customer combobox
const customerSearch = ref('')
const customerOpen   = ref(false)
const customerRef    = ref<HTMLElement>()

const filteredCustomers = computed(() => {
  const q = customerSearch.value.toLowerCase()
  const all = allCustomers.value as any[]
  if (!q) return all.slice(0, 20)
  return all.filter((c: any) =>
    (c.name || '').toLowerCase().includes(q) || (c.business_name || '').toLowerCase().includes(q)
  ).slice(0, 20)
})

function selectCustomer(c: any) {
  form.customer_id = c.id
  customerSearch.value = c.name + (c.business_name ? ` (${c.business_name})` : '')
  customerOpen.value = false
}
function clearCustomer() {
  form.customer_id = null
  customerSearch.value = ''
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (customerRef.value && !customerRef.value.contains(e.target as Node)) {
      customerOpen.value = false
    }
  })
})

const form = reactive({
  trip_date:           new Date().toISOString().slice(0, 10),
  departure_time:      '',
  origin:              '',
  destination:         '',
  customer_id:         null as number | null,
  vehicle_id:          '',
  driver_id:           '',
  estimated_duration:  '',
  quantity:            '',
  weight_kg:           '',
  goods_description:   '',
  trip_charge:         '',
  advance_amount:      '',
  destination_account: '',
  payment_date:        '',
  notes:               '',
  start_immediately:   false,
})

function fmt(n: any) {
  return Number(n || 0).toLocaleString('en-BD')
}

async function submit() {
  loading.value = true
  error.value   = ''
  try {
    const res = await $fetch('/api/fleet/trips', { method: 'POST', body: form }) as any
    router.push(`/fleet/trips/${res.id}`)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to create trip'
  } finally {
    loading.value = false
  }
}
</script>
