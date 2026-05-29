<template>
  <div class="space-y-6">
    <UiPageHeader title="Create Trip" subtitle="Schedule a new delivery or raw material transport trip"
                  :breadcrumb="['Logistics', 'Trips', 'Create']">
      <template #actions>
        <NuxtLink to="/logistics" class="btn-ghost text-xs">← Logistics</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 glass-card p-6 space-y-5">
        <h3 class="section-title">Trip Details</h3>

        <!-- Trip type -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip Type *</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button v-for="t in tripTypes" :key="t.value"
              @click="form.trip_type = t.value"
              :class="['rounded-xl border p-3 text-center text-xs transition-all',
                form.trip_type === t.value
                  ? 'bg-gold-500/10 border-gold-500/40 text-gold-400'
                  : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20']">
              <div class="text-lg mb-1">{{ t.icon }}</div>
              <div class="font-semibold">{{ t.label }}</div>
            </button>
          </div>
        </div>

        <!-- Vehicle & driver -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle *</label>
            <select v-model="form.vehicle_id" class="input-glass">
              <option value="">— Select vehicle —</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">
                {{ v.vehicle_number }} ({{ v.category }} · {{ (Number(v.capacity_kg) / 1000).toFixed(1) }} MT)
              </option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver *</label>
            <select v-model="form.driver_id" class="input-glass">
              <option value="">— Select driver —</option>
              <option v-for="d in drivers" :key="d.id" :value="d.id">{{ d.driver_name }}</option>
            </select>
          </div>
        </div>

        <!-- Schedule -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip Date *</label>
            <input v-model="form.trip_date" type="date" class="input-glass" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Time</label>
            <input v-model="form.time" type="time" class="input-glass" />
          </div>
        </div>

        <!-- Cargo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Route Summary</label>
            <input v-model="form.route_summary" type="text" class="input-glass" placeholder="e.g. Sirajgonj → Pabna" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Weight (MT)</label>
            <input v-model.number="form.total_weight" type="number" step="0.1" min="0" class="input-glass font-mono" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
          <textarea v-model="form.notes" rows="3" class="input-glass resize-none" placeholder="Special instructions, route notes…" />
        </div>

        <div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Creating…' : 'Create Trip' }}
          </button>
          <NuxtLink to="/logistics" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right panel -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Available Vehicles</h3>
          <div v-for="v in vehicles" :key="v.id"
            class="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0 text-xs">
            <div>
              <p class="text-gray-300 font-medium">{{ v.vehicle_number }}</p>
              <p class="text-gray-600">{{ v.category }} · {{ (Number(v.capacity_kg) / 1000).toFixed(1) }} MT</p>
            </div>
            <UiStatusBadge :status="v.status?.toLowerCase()" />
          </div>
          <p v-if="!vehicles.length" class="text-xs text-gray-600 text-center py-2">No vehicles found</p>
        </div>

        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Recent Trips</h3>
          <div v-for="t in recentTrips" :key="t.id"
            class="py-2 border-b border-white/[0.04] last:border-0 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-300 font-mono">{{ t.date }}</span>
              <UiStatusBadge :status="t.status?.toLowerCase().replace(' ', '_')" />
            </div>
            <p class="text-gray-600 mt-0.5">{{ t.driver }} · {{ t.vehicle }}</p>
          </div>
          <p v-if="!recentTrips.length" class="text-xs text-gray-600 text-center py-2">No recent trips</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

const tripTypes = [
  { value: 'single',       icon: '🚚', label: 'Customer Delivery' },
  { value: 'consolidated', icon: '📦', label: 'Multi-stop / Consolidated' },
]

// Load vehicles and drivers from real APIs
const [{ data: vehicleData }, { data: driverData }, { data: tripData }] = await Promise.all([
  useFetch('/api/logistics/vehicles'),
  useFetch('/api/logistics/drivers'),
  useFetch('/api/logistics/trips', { query: { per: 5 } }),
])

const vehicles    = computed(() => (vehicleData.value as any)?.vehicles ?? [])
const drivers     = computed(() => (driverData.value  as any)?.drivers  ?? [])
const recentTrips = computed(() => (tripData.value    as any)?.trips    ?? [])

const form = reactive({
  trip_type:   'single',
  vehicle_id:  '' as number | string,
  driver_id:   '' as number | string,
  trip_date:   new Date().toISOString().slice(0, 10),
  time:        new Date().toISOString().slice(11, 16),
  total_weight: null as number | null,  // in MT
  route_summary: '',
  notes:       '',
})

const saving = ref(false)

const isValid = computed(() =>
  form.vehicle_id && form.driver_id && form.trip_date
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch('/api/logistics/trips', {
      method: 'POST',
      body: {
        vehicle_id:      Number(form.vehicle_id),
        driver_id:       Number(form.driver_id),
        trip_date:       form.trip_date,
        scheduled_time:  form.time || null,
        trip_type:       form.trip_type,
        total_weight_kg: (form.total_weight || 0) * 1000,   // MT → kg
        route_summary:   form.route_summary || null,
        notes:           form.notes || null,
      },
    })
    success('Trip created successfully')
    navigateTo('/logistics/trips')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to create trip')
  } finally {
    saving.value = false
  }
}
</script>
