<template>
  <div class="space-y-6">
    <UiPageHeader title="Vehicle Maintenance" subtitle="Schedule and track maintenance for the fleet"
                  :breadcrumb="['Logistics', 'Maintenance']">
      <template #actions>
        <button @click="showAddModal = true" class="btn-gold text-xs">+ Log Maintenance</button>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">In Maintenance</p>
        <p class="text-2xl font-bold text-yellow-400">{{ vehicles.filter((v: any) => v.status === 'Maintenance').length }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Due This Week</p>
        <p class="text-2xl font-bold text-orange-400">{{ maintStats.due_soon ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Cost This Month</p>
        <p class="text-2xl font-bold text-red-400">৳{{ Number(monthCost).toLocaleString() }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Records</p>
        <p class="text-2xl font-bold text-emerald-400">{{ maintStats.total_logs ?? 0 }}</p>
      </div>
    </div>

    <!-- Vehicles needing attention -->
    <div class="glass-card p-5 space-y-4">
      <h3 class="section-title">Fleet Status</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="v in vehicles" :key="v.id"
          class="rounded-xl border border-white/[0.07] p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-200">{{ v.vehicle_number }}</p>
              <p class="text-xs font-mono text-gray-500">{{ v.vehicle_type }}</p>
            </div>
            <UiStatusBadge :status="v.status?.toLowerCase()" />
          </div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">Next service</span>
              <span :class="v.next_service_due_date && v.next_service_due_date < today ? 'text-red-400' : 'text-gray-300'">{{ v.next_service_due_date ?? '—' }}</span>
            </div>
            <div class="flex justify-between"><span class="text-gray-600">Capacity</span><span class="text-gray-300 font-mono">{{ v.capacity_kg ? (v.capacity_kg/1000).toFixed(1) + ' MT' : '—' }}</span></div>
          </div>
          <button v-if="v.status === 'Maintenance'" class="w-full btn-gold text-xs py-1.5">Mark Completed</button>
          <button v-else class="w-full btn-ghost text-xs py-1.5" @click="scheduleService(v)">Schedule Service</button>
        </div>
      </div>
    </div>

    <!-- Maintenance log -->
    <div class="glass-card p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="section-title">Maintenance Log</h3>
        <select v-model="filterVehicle" class="input-glass w-auto text-xs py-1.5">
          <option value="">All Vehicles</option>
          <option v-for="v in vehicles" :key="v.id" :value="v.vehicle_number">{{ v.vehicle_number }}</option>
        </select>
      </div>
      <UiDataTable :columns="cols" :rows="filteredRecords" :per-page="10" search-placeholder="Search…">
        <template #cell-cost="{ value }">
          <span class="font-mono text-xs text-red-400">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>
      </UiDataTable>
    </div>

    <!-- Add maintenance modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Log Maintenance</h3>
              <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle *</label>
                <select v-model="newRecord.vehicleId" class="input-glass">
                  <option value="">— Select —</option>
                  <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.vehicle_number }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date *</label>
                <input v-model="newRecord.date" type="date" class="input-glass" />
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Maintenance Type *</label>
                <input v-model="newRecord.maintenance_type" type="text" class="input-glass" placeholder="e.g. Oil change, Tyre replacement…" />
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <input v-model="newRecord.description" type="text" class="input-glass" placeholder="Additional details…" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cost (৳)</label>
                <input v-model.number="newRecord.cost" type="number" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Garage / Vendor</label>
                <input v-model="newRecord.garage" type="text" class="input-glass" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="addRecord" class="btn-gold text-xs flex-1">Save Record</button>
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

const today = new Date().toISOString().slice(0, 10)
const showAddModal  = ref(false)
const filterVehicle = ref('')
const saving        = ref(false)

// Fetch maintenance logs
const { data, refresh } = await useFetch('/api/logistics/maintenance')
const maintStats = computed(() => (data.value as any)?.stats ?? {})
const records    = computed(() => (data.value as any)?.logs  ?? [])

// Fetch vehicles
const { data: vData } = await useFetch('/api/logistics/vehicles')
const vehicles = computed(() => (vData.value as any)?.vehicles ?? [])

const cols = [
  { key: 'vehicle',          label: 'Vehicle',     sortable: true },
  { key: 'date',             label: 'Date',        sortable: true },
  { key: 'maintenance_type', label: 'Type',        sortable: true },
  { key: 'description',      label: 'Description' },
  { key: 'cost',             label: 'Cost',        sortable: true },
  { key: 'service_provider', label: 'Garage' },
]

const monthCost = computed(() => Number(maintStats.value.this_month ?? 0))

const filteredRecords = computed(() =>
  filterVehicle.value ? records.value.filter((r: any) => r.vehicle === filterVehicle.value) : records.value
)

const newRecord = reactive({ vehicleId: '', date: today, maintenance_type: '', description: '', cost: 0, garage: '' })

function scheduleService(v: any) {
  newRecord.vehicleId = v.id
  showAddModal.value = true
}

async function addRecord() {
  if (!newRecord.vehicleId || !newRecord.maintenance_type || !newRecord.date) return
  saving.value = true
  try {
    await $fetch('/api/logistics/maintenance', {
      method: 'POST',
      body: {
        vehicle_id:       Number(newRecord.vehicleId),
        maintenance_date: newRecord.date,
        maintenance_type: newRecord.maintenance_type,
        description:      newRecord.description,
        cost:             newRecord.cost,
        service_provider: newRecord.garage,
      },
    })
    success('Maintenance record logged')
    showAddModal.value = false
    Object.assign(newRecord, { vehicleId: '', date: today, maintenance_type: '', description: '', cost: 0, garage: '' })
    await refresh()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to save maintenance record')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
