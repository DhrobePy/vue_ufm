<template>
  <div class="space-y-6">
    <UiPageHeader title="Add Vehicle" subtitle="Register a new vehicle in the fleet"
                  :breadcrumb="['Logistics', 'Vehicles', 'Add Vehicle']">
      <template #actions>
        <NuxtLink to="/logistics/vehicles" class="btn-ghost text-xs">← All Vehicles</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 glass-card p-6 space-y-5">
        <h3 class="section-title">Vehicle Information</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category *</label>
            <select v-model="form.type" class="input-glass">
              <option value="">— Select —</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Pickup">Pickup</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Make</label>
            <input v-model="form.make" type="text" class="input-glass" placeholder="e.g. Tata, Mahindra" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model</label>
            <input v-model="form.model" type="text" class="input-glass" placeholder="e.g. LPT 1109, Bolero" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration Year</label>
            <input v-model.number="form.year" type="number" min="2000" max="2030" class="input-glass font-mono" placeholder="2023" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration Plate / Vehicle Number *</label>
          <input v-model="form.plate" type="text" class="input-glass font-mono uppercase" placeholder="e.g. DHK-GA-1234" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity (MT) *</label>
            <input v-model.number="form.capacity" type="number" min="0.5" step="0.5" class="input-glass font-mono" placeholder="5" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fuel Type</label>
            <select v-model="form.fuelType" class="input-glass">
              <option value="Diesel">Diesel</option>
              <option value="Petrol">Petrol</option>
              <option value="CNG">CNG</option>
              <option value="Electric">Electric</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Branch</label>
            <select v-model="form.branch_id" class="input-glass">
              <option value="">— None —</option>
              <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle Type</label>
            <select v-model="form.ownership" class="input-glass">
              <option value="Own">Company Owned</option>
              <option value="Rented">Rented / Hired</option>
            </select>
          </div>
          <div v-if="form.ownership === 'Rented'" class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rental Rate (৳/day)</label>
            <input v-model.number="form.rentalRate" type="number" class="input-glass font-mono" />
          </div>
        </div>

        <!-- Service schedule -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Next Service Due Date</label>
          <input v-model="form.nextServiceDate" type="date" class="input-glass" />
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
          <textarea v-model="form.notes" rows="3" class="input-glass resize-none" placeholder="Any special notes about this vehicle…" />
        </div>

        <div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Registering…' : 'Register Vehicle' }}
          </button>
          <NuxtLink to="/logistics/vehicles" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Preview card -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-300">Vehicle Card Preview</h3>
          <div class="rounded-xl border border-white/10 p-4 bg-white/[0.02] space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xl">🚛</div>
              <div>
                <p class="text-sm font-bold text-gray-200">{{ form.model || 'Vehicle Model' }}</p>
                <p class="text-xs font-mono text-gray-500">{{ form.plate || 'REG PLATE' }}</p>
              </div>
            </div>
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between"><span class="text-gray-600">Category</span><span class="text-gray-300">{{ form.type || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Capacity</span><span class="text-gray-300">{{ form.capacity || '—' }} MT</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Branch</span><span class="text-gray-300">{{ branches.find((b: any) => b.id === Number(form.branch_id))?.name || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-gray-600">Type</span><span class="text-gray-300">{{ form.ownership }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

// Fetch branches
const { data: branchData } = await useFetch('/api/branches')
const branches = computed(() => (branchData.value as any)?.branches ?? [])

const form = reactive({
  type:            '',      // category
  make:            '',
  model:           '',
  plate:           '',      // vehicle_number
  year:            null as number | null,
  capacity:        null as number | null,  // in MT on form, stored as kg
  fuelType:        'diesel',
  branch_id:       '' as number | string,
  ownership:       'Own',   // 'Own' | 'Rented'
  rentalRate:      null as number | null,
  nextServiceDate: '',
  notes:           '',
})

const saving = ref(false)

const isValid = computed(() =>
  form.type && form.plate && form.capacity && form.capacity > 0
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch('/api/logistics/vehicles', {
      method: 'POST',
      body: {
        vehicle_number:       form.plate.toUpperCase(),
        category:             form.type,
        make:                 form.make  || null,
        model:                form.model || null,
        year:                 form.year,
        capacity_kg:          (form.capacity || 0) * 1000,   // convert MT → kg
        fuel_type:            form.fuelType,
        vehicle_type:         form.ownership,
        assigned_branch_id:   form.branch_id ? Number(form.branch_id) : null,
        rental_rate_per_day:  form.rentalRate,
        next_service_due_date: form.nextServiceDate || null,
        notes:                form.notes || null,
      },
    })
    success(`Vehicle ${form.plate} registered successfully`)
    navigateTo('/logistics/vehicles')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to register vehicle')
  } finally {
    saving.value = false
  }
}
</script>
