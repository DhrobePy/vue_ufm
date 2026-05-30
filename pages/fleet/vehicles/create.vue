<template>
  <div class="space-y-6 max-w-2xl mx-auto">
    <UiPageHeader title="Add Vehicle" :breadcrumb="['Fleet','Vehicles','Add']" />

    <form class="glass-card p-6 space-y-5" @submit.prevent="submit">
      <!-- Registration & Type -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Registration No *</label>
          <input v-model="form.registration_no" class="form-input" placeholder="e.g. DHAKA-TRK-08" required />
        </div>
        <div>
          <label class="form-label">Vehicle Type</label>
          <select v-model="form.vehicle_type" class="form-input">
            <option v-for="t in vehicleTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>

      <!-- Make & Model -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Make</label>
          <input v-model="form.make" class="form-input" placeholder="e.g. Tata, Isuzu" />
        </div>
        <div>
          <label class="form-label">Model</label>
          <input v-model="form.model" class="form-input" placeholder="e.g. 1613, NQR" />
        </div>
      </div>

      <!-- Engine & Chassis -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Engine No</label>
          <input v-model="form.engine_no" class="form-input" placeholder="Engine number" />
        </div>
        <div>
          <label class="form-label">Chassis No</label>
          <input v-model="form.chassis_no" class="form-input" placeholder="Chassis number" />
        </div>
      </div>

      <!-- Year, Fuel, Ownership -->
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label class="form-label">Year of Manufacture</label>
          <input v-model="form.year_of_mfg" class="form-input" type="number" min="1990" max="2030" placeholder="2020" />
        </div>
        <div>
          <label class="form-label">Fuel Type</label>
          <select v-model="form.fuel_type" class="form-input">
            <option>DIESEL</option><option>PETROL</option><option>CNG</option><option>ELECTRIC</option><option>HYBRID</option>
          </select>
        </div>
        <div>
          <label class="form-label">Ownership</label>
          <select v-model="form.ownership_type" class="form-input">
            <option>OWNED</option><option>RENTED</option><option>LEASED</option><option>BORROWED</option>
          </select>
        </div>
      </div>

      <!-- Capacity & Odometer -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Weight Capacity (kg)</label>
          <input v-model="form.weight_capacity_kg" class="form-input" type="number" placeholder="15000" />
        </div>
        <div>
          <label class="form-label">Current Odometer (km)</label>
          <input v-model="form.current_odometer" class="form-input" type="number" placeholder="0" />
        </div>
      </div>

      <!-- Status -->
      <div>
        <label class="form-label">Status</label>
        <select v-model="form.status" class="form-input">
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="repair">In Repair</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Remarks -->
      <div>
        <label class="form-label">Remarks</label>
        <textarea v-model="form.remarks" class="form-input" rows="2" placeholder="Optional notes…" />
      </div>

      <!-- Error -->
      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ error }}</div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button type="submit" class="btn-gold" :disabled="loading">
          {{ loading ? 'Saving…' : 'Save Vehicle' }}
        </button>
        <NuxtLink to="/fleet/vehicles" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const loading = ref(false)
const error   = ref('')

const vehicleTypes = ['TRUCK','PICKUP','VAN','MINI_TRUCK','AIRPORT_SHUTTLE','OTHER']

const form = reactive({
  registration_no: '',
  vehicle_type:    'TRUCK',
  make: '', model: '', engine_no: '', chassis_no: '',
  year_of_mfg: '', fuel_type: 'DIESEL', ownership_type: 'OWNED',
  weight_capacity_kg: '', current_odometer: '0',
  status: 'available', remarks: '',
})

async function submit() {
  loading.value = true
  error.value   = ''
  try {
    await $fetch('/api/fleet/vehicles', { method: 'POST', body: form })
    router.push('/fleet/vehicles')
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to save vehicle'
  } finally {
    loading.value = false
  }
}
</script>
