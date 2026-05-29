<template>
  <div class="space-y-6">
    <UiPageHeader title="Fuel Management" subtitle="Track fuel consumption and costs per vehicle"
                  :breadcrumb="['Logistics', 'Fuel']">
      <template #actions>
        <button @click="showAddModal = true" class="btn-gold text-xs">+ Log Fuel</button>
      </template>
    </UiPageHeader>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">This Month Litres</p>
        <p class="text-2xl font-bold text-gray-100">{{ Number(totalLitres).toLocaleString() }} L</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">This Month Cost</p>
        <p class="text-2xl font-bold text-red-400">৳{{ Number(totalCost).toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Avg ৳/Litre</p>
        <p class="text-2xl font-bold text-gold-400">৳{{ totalLitres > 0 ? Math.round(totalCost / totalLitres) : 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Fill-ups</p>
        <p class="text-2xl font-bold text-gray-100">{{ fuelStats.total_logs ?? 0 }}</p>
      </div>
    </div>

    <!-- Per-vehicle summary -->
    <div class="glass-card p-5 space-y-4">
      <h3 class="section-title">Per-Vehicle Fuel (May 2026)</h3>
      <div class="space-y-3">
        <div v-for="v in vehicleSummary" :key="v.plate" class="flex items-center gap-4">
          <div class="w-32 shrink-0">
            <p class="text-xs font-semibold text-gray-300">{{ v.model }}</p>
            <p class="text-[11px] font-mono text-gray-600">{{ v.plate }}</p>
          </div>
          <div class="flex-1">
            <div class="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full bg-gold-500 transition-all" :style="`width:${Math.round(v.litres/maxLitres*100)}%`" />
            </div>
          </div>
          <div class="w-32 text-right">
            <span class="text-xs font-mono text-gray-200">{{ v.litres }} L</span>
            <span class="text-xs text-gray-600 ml-2">৳{{ v.cost.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fuel log table -->
    <div class="glass-card p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="section-title">Fuel Log</h3>
        <select v-model="filterVehicle" class="input-glass w-auto text-xs py-1.5">
          <option value="">All Vehicles</option>
          <option v-for="v in vehicles" :key="v.id" :value="v.vehicle_number">{{ v.vehicle_number }}</option>
        </select>
      </div>
      <UiDataTable :columns="cols" :rows="filteredLogs" :per-page="12" search-placeholder="Search…">
        <template #cell-quantity_liters="{ value }">
          <span class="font-mono text-xs text-blue-400">{{ value }} L</span>
        </template>
        <template #cell-total_cost="{ value }">
          <span class="font-mono text-xs font-bold text-red-400">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-price_per_liter="{ value }">
          <span class="font-mono text-xs text-gray-400">৳{{ value }}</span>
        </template>
      </UiDataTable>
    </div>

    <!-- Add log modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Log Fuel</h3>
              <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle *</label>
                <select v-model="newLog.vehicleId" class="input-glass">
                  <option value="">— Select —</option>
                  <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.vehicle_number }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date *</label>
                <input v-model="newLog.date" type="date" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Litres *</label>
                <input v-model.number="newLog.litres" type="number" step="0.5" min="1" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rate (৳/litre) *</label>
                <input v-model.number="newLog.ratePerLitre" type="number" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Cost</label>
                <div class="input-glass font-mono font-bold text-gold-400 bg-white/[0.02]">৳{{ (newLog.litres * newLog.ratePerLitre).toLocaleString() }}</div>
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Petrol Pump / Vendor</label>
                <input v-model="newLog.vendor" type="text" class="input-glass" placeholder="e.g. Padma Petrol Pump" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="addLog" :disabled="!newLog.vehicleId || !newLog.litres || !newLog.ratePerLitre" class="btn-gold text-xs flex-1 disabled:opacity-50">Save Log</button>
              <button @click="showAddModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

const showAddModal  = ref(false)
const filterVehicle = ref('')
const saving        = ref(false)

// Fetch fuel logs + stats
const { data, refresh } = await useFetch('/api/logistics/fuel')
const fuelStats = computed(() => (data.value as any)?.stats ?? {})
const fuelLogs  = computed(() => (data.value as any)?.logs  ?? [])

// Fetch vehicles for dropdown
const { data: vData } = await useFetch('/api/logistics/vehicles')
const vehicles = computed(() => (vData.value as any)?.vehicles ?? [])

const cols = [
  { key: 'vehicle',         label: 'Vehicle',  sortable: true },
  { key: 'date',            label: 'Date',     sortable: true },
  { key: 'quantity_liters', label: 'Litres',   sortable: true },
  { key: 'price_per_liter', label: '৳/Litre' },
  { key: 'total_cost',      label: 'Total',    sortable: true },
  { key: 'station_name',    label: 'Vendor' },
]

const filteredLogs = computed(() =>
  filterVehicle.value
    ? fuelLogs.value.filter((l: any) => l.vehicle === filterVehicle.value)
    : fuelLogs.value
)

const totalLitres = computed(() => Number(fuelStats.value.total_liters ?? 0))
const totalCost   = computed(() => Number(fuelStats.value.this_month_cost ?? 0))

// Per-vehicle summary from logs
const vehicleSummary = computed(() => {
  const map: Record<string, { model: string; plate: string; litres: number; cost: number }> = {}
  for (const l of fuelLogs.value as any[]) {
    if (!map[l.vehicle]) map[l.vehicle] = { model: l.vehicle, plate: l.vehicle, litres: 0, cost: 0 }
    map[l.vehicle].litres += Number(l.quantity_liters)
    map[l.vehicle].cost   += Number(l.total_cost)
  }
  return Object.values(map)
})

const maxLitres = computed(() => Math.max(...vehicleSummary.value.map(v => v.litres), 1))

const newLog = reactive({ vehicleId: '', date: new Date().toISOString().slice(0, 10), litres: 0, ratePerLitre: 110, vendor: '' })

async function addLog() {
  if (!newLog.vehicleId || !newLog.litres || !newLog.ratePerLitre) return
  saving.value = true
  try {
    await $fetch('/api/logistics/fuel', {
      method: 'POST',
      body: {
        vehicle_id:       Number(newLog.vehicleId),
        fuel_date:        newLog.date,
        quantity_liters:  newLog.litres,
        price_per_liter:  newLog.ratePerLitre,
        station_name:     newLog.vendor,
      },
    })
    success(`Fuel log added — ${newLog.litres}L`)
    showAddModal.value = false
    Object.assign(newLog, { vehicleId: '', litres: 0, ratePerLitre: 110, vendor: '' })
    await refresh()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to save fuel log')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
