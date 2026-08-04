<template>
  <div class="space-y-6 max-w-xl mx-auto">
    <UiPageHeader title="Log Fuel Fill-up" :breadcrumb="['Fleet','Fuel','Log']" />

    <form class="glass-card p-6 space-y-4" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Vehicle *</label>
          <select v-model="form.vehicle_id" class="form-input" required @change="onVehicleChange">
            <option value="">— Select vehicle —</option>
            <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.registration_no }}</option>
          </select>
        </div>
        <div>
          <label class="form-label">Driver</label>
          <select v-model="form.driver_id" class="form-input">
            <option value="">— Select driver —</option>
            <option v-for="d in drivers" :key="d.id" :value="d.id">{{ d.full_name }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Date *</label>
          <input v-model="form.fuel_date" type="date" class="form-input" required />
        </div>
        <div>
          <label class="form-label">Fuel Type</label>
          <select v-model="form.fuel_type" class="form-input">
            <option>DIESEL</option><option>PETROL</option><option>CNG</option><option>ELECTRIC</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="form-label">Quantity (Litres) *</label>
          <input v-model="form.quantity_liters" type="number" step="0.001" class="form-input" required placeholder="50.000" @input="calcTotal" />
        </div>
        <div>
          <label class="form-label">Price per Litre ৳</label>
          <input v-model="form.price_per_liter" type="number" step="0.01" class="form-input" placeholder="115.00" @input="calcTotal" />
        </div>
        <div>
          <label class="form-label">Total Amount ৳</label>
          <input v-model="form.total_amount" type="number" step="0.01" class="form-input" placeholder="5750.00" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Odometer Reading (km)</label>
          <input v-model="form.odometer_reading" type="number" class="form-input" placeholder="45200" />
        </div>
        <div>
          <label class="form-label">Previous Odometer (km)</label>
          <input v-model="form.previous_odometer" type="number" class="form-input" :placeholder="prevOdometer ? String(prevOdometer) : 'Auto-filled'" />
        </div>
      </div>

      <!-- Mileage preview -->
      <div v-if="mileagePreview" class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
        Estimated mileage: {{ mileagePreview }}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Station Name</label>
          <input v-model="form.station_name" class="form-input" placeholder="e.g. Meghna Filling Station" />
        </div>
        <div>
          <label class="form-label">Receipt No</label>
          <input v-model="form.receipt_no" class="form-input" placeholder="Receipt/Invoice number" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
        <div>
          <label class="form-label">Paid From</label>
          <select v-model="form.payment_method" class="form-input">
            <option value="">— Not posting to GL yet —</option>
            <option value="cash">Petty Cash</option>
            <option value="bank">Bank</option>
          </select>
        </div>
        <div v-if="form.payment_method === 'cash'">
          <label class="form-label">Petty Cash Account *</label>
          <select v-model="form.cash_account_id" class="form-input">
            <option value="">— Select —</option>
            <option v-for="a in pettyCashAccounts" :key="a.id" :value="a.id">{{ a.account_name }} (৳{{ Number(a.current_balance).toLocaleString() }})</option>
          </select>
        </div>
        <div v-if="form.payment_method === 'bank'">
          <label class="form-label">Bank Account *</label>
          <select v-model="form.bank_account_id" class="form-input">
            <option value="">— Select —</option>
            <option v-for="a in bankAccounts" :key="a.id" :value="a.id">{{ a.bank_name }} — {{ a.account_name }}</option>
          </select>
        </div>
      </div>

      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ error }}</div>

      <div class="flex gap-3 pt-2">
        <button type="submit" class="btn-gold" :disabled="loading">{{ loading ? 'Saving…' : 'Log Fuel' }}</button>
        <NuxtLink to="/fleet/fuel" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router  = useRouter()
const loading = ref(false)
const error   = ref('')
const prevOdometer = ref<number | null>(null)

const { data: vData } = await useFetch('/api/fleet/vehicles')
const { data: dData } = await useFetch('/api/fleet/drivers')
const { data: pettyData } = await useFetch('/api/expenses/petty-cash-accounts')
const { data: bankData }  = await useFetch('/api/bank-accounts')

const vehicles = computed(() => (vData.value as any)?.vehicles ?? [])
const drivers  = computed(() => ((dData.value as any)?.drivers ?? []).filter((d: any) => d.status === 'active'))
const pettyCashAccounts = computed(() => (pettyData.value as any)?.accounts ?? [])
const bankAccounts      = computed(() => (bankData.value as any)?.accounts ?? [])

const form = reactive({
  vehicle_id:        '',
  driver_id:         '',
  fuel_date:         new Date().toISOString().slice(0, 10),
  fuel_type:         'DIESEL',
  quantity_liters:   '',
  price_per_liter:   '',
  total_amount:      '',
  odometer_reading:  '',
  previous_odometer: '',
  station_name:      '',
  receipt_no:        '',
  payment_method:    '',
  cash_account_id:   '',
  bank_account_id:   '',
})

function calcTotal() {
  if (form.quantity_liters && form.price_per_liter) {
    form.total_amount = (Number(form.quantity_liters) * Number(form.price_per_liter)).toFixed(2)
  }
}

function onVehicleChange() {
  // Pre-fill odometer from vehicle data
  const v = (vehicles.value as any[]).find((v: any) => v.id == form.vehicle_id)
  if (v?.current_odometer) {
    prevOdometer.value = v.current_odometer
    form.previous_odometer = String(v.current_odometer)
  }
}

const mileagePreview = computed(() => {
  const odo = Number(form.odometer_reading)
  const prev = Number(form.previous_odometer)
  const qty  = Number(form.quantity_liters)
  if (odo > prev && prev > 0 && qty > 0) {
    return ((odo - prev) / qty).toFixed(2) + ' km/L'
  }
  return ''
})

async function submit() {
  loading.value = true
  error.value   = ''
  try {
    await $fetch('/api/fleet/fuel', { method: 'POST', body: form })
    router.push('/fleet/fuel')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to log fuel'
  } finally {
    loading.value = false
  }
}
</script>
