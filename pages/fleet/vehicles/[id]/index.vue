<template>
  <div class="space-y-6" v-if="vehicle">
    <!-- Header -->
    <UiPageHeader
      :title="vehicle.registration_no"
      :subtitle="`${vehicle.make || ''} ${vehicle.model || ''} · ${vehicle.vehicle_type}`"
      :breadcrumb="['Fleet','Vehicles', vehicle.registration_no]"
    >
      <template #actions>
        <UiStatusBadge :status="vehicle.status" />
        <NuxtLink :to="`/fleet/vehicles/${id}/edit`" class="btn-secondary text-xs">Edit</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-white/[0.07]">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        class="px-4 py-2 text-xs font-medium transition-colors rounded-t-lg"
        :class="activeTab === tab.key ? 'text-gold-400 border-b-2 border-gold-400' : 'text-gray-500 hover:text-gray-300'">
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab: Summary -->
    <div v-if="activeTab === 'summary'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Vehicle Details -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Vehicle Details</h3>
        <dl class="space-y-3">
          <div v-for="row in vehicleFields" :key="row.label" class="flex justify-between text-sm">
            <dt class="text-gray-500">{{ row.label }}</dt>
            <dd class="text-gray-200 font-medium">{{ row.value || '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Assigned Driver -->
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Assigned Driver</h3>
        <div v-if="vehicle.driver_name" class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {{ vehicle.driver_name?.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-200">{{ vehicle.driver_name }}</p>
              <p class="text-xs text-gray-500">{{ vehicle.driver_mobile || 'No mobile' }}</p>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-600 text-sm">No driver assigned</div>
      </div>
    </div>

    <!-- Tab: Documents -->
    <div v-if="activeTab === 'documents'">
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="section-title">Vehicle Documents</h3>
          <button @click="openAddDoc" class="btn-gold text-xs">+ Add Document</button>
        </div>
        <div v-if="!documents.length" class="text-center py-6 text-gray-600 text-sm">No documents recorded</div>
        <div class="overflow-x-auto" v-else>
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-white/[0.06]">
                <th class="pb-2 text-left text-gray-500 font-medium">Document Type</th>
                <th class="pb-2 text-left text-gray-500 font-medium">Document No</th>
                <th class="pb-2 text-left text-gray-500 font-medium">Issue Date</th>
                <th class="pb-2 text-left text-gray-500 font-medium">Expiry Date</th>
                <th class="pb-2 text-left text-gray-500 font-medium">Notes</th>
                <th class="pb-2 text-left text-gray-500 font-medium">Status</th>
                <th class="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in documents" :key="d.id" class="border-b border-white/[0.03]">
                <td class="py-2 text-gray-300 font-medium">{{ d.document_type }}</td>
                <td class="py-2 font-mono text-gray-400">{{ d.document_number || '—' }}</td>
                <td class="py-2 text-gray-400">{{ d.issue_date || '—' }}</td>
                <td class="py-2" :class="isExpiringSoon(d.expiry_date) ? 'text-amber-400 font-medium' : isExpired(d.expiry_date) ? 'text-red-400 font-medium' : 'text-gray-400'">
                  {{ d.expiry_date || '—' }}
                </td>
                <td class="py-2 text-gray-400">{{ d.notes || '—' }}</td>
                <td class="py-2">
                  <span class="badge" :class="isExpired(d.expiry_date) ? 'bg-red-500/10 text-red-400' : isExpiringSoon(d.expiry_date) ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'">
                    {{ isExpired(d.expiry_date) ? 'Expired' : isExpiringSoon(d.expiry_date) ? 'Expiring Soon' : 'Valid' }}
                  </span>
                </td>
                <td class="py-2 text-right">
                  <button @click="deleteDoc(d.id)" class="text-gray-600 hover:text-red-400 transition-colors">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Document Modal -->
    <Teleport to="body">
      <div v-if="docModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)" @click.self="docModal = false">
        <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
          <h3 class="text-sm font-semibold text-gray-200">Add Document</h3>
          <div class="space-y-3">
            <div>
              <label class="field-label">Document Type *</label>
              <input v-model="docForm.document_type" type="text" class="field-input w-full" placeholder="e.g. Fitness Certificate, Tax Token, Insurance, Route Permit" />
            </div>
            <div>
              <label class="field-label">Document Number</label>
              <input v-model="docForm.document_number" type="text" class="field-input w-full" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Issue Date</label>
                <input v-model="docForm.issue_date" type="date" class="field-input w-full" />
              </div>
              <div>
                <label class="field-label">Expiry Date</label>
                <input v-model="docForm.expiry_date" type="date" class="field-input w-full" />
              </div>
            </div>
            <div>
              <label class="field-label">Notes</label>
              <input v-model="docForm.notes" type="text" class="field-input w-full" />
            </div>
          </div>
          <div class="flex gap-2 pt-1">
            <button @click="docModal = false" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
            <button @click="saveDoc" :disabled="!docForm.document_type" class="btn-gold text-xs flex-1 justify-center disabled:opacity-40">Save</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Tab: Trips History -->
    <div v-if="activeTab === 'trips'">
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Trip History</h3>
        <div v-if="!trips.length" class="text-center py-6 text-gray-600 text-sm">No trips recorded</div>
        <div class="space-y-2" v-else>
          <div v-for="t in trips" :key="t.id" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer" @click="$router.push(`/fleet/trips/${t.id}`)">
            <div class="w-2 h-2 rounded-full" :class="tripDot(t.trip_status)" />
            <div class="flex-1">
              <p class="text-xs font-mono font-bold text-gold-400/80">{{ t.trip_number }}</p>
              <p class="text-[11px] text-gray-500">{{ t.origin }} → {{ t.destination }} · {{ t.driver_name }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-medium text-gray-300">৳{{ Number(t.trip_charge || 0).toLocaleString() }}</p>
              <p class="text-[10px] text-gray-600">{{ t.trip_date }}</p>
            </div>
            <UiStatusBadge :status="t.trip_status" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Fuel History -->
    <div v-if="activeTab === 'fuel'">
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Fuel History</h3>
        <div v-if="!fuel.length" class="text-center py-6 text-gray-600 text-sm">No fuel logs recorded</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Date</th>
              <th class="pb-2 text-left text-gray-500">Fuel Type</th>
              <th class="pb-2 text-right text-gray-500">Qty (L)</th>
              <th class="pb-2 text-right text-gray-500">Rate</th>
              <th class="pb-2 text-right text-gray-500">Amount</th>
              <th class="pb-2 text-right text-gray-500">Odometer</th>
              <th class="pb-2 text-left text-gray-500">Station</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in fuel" :key="f.id" class="border-b border-white/[0.03]">
              <td class="py-2 text-gray-400">{{ f.fuel_date }}</td>
              <td class="py-2"><span class="badge bg-blue-500/10 text-blue-400 text-[10px]">{{ f.fuel_type }}</span></td>
              <td class="py-2 text-right text-gray-300">{{ f.quantity_liters }}</td>
              <td class="py-2 text-right text-gray-400">৳{{ Number(f.price_per_liter || 0).toFixed(2) }}</td>
              <td class="py-2 text-right font-medium text-gray-200">৳{{ Number(f.total_amount || 0).toLocaleString() }}</td>
              <td class="py-2 text-right text-gray-400">{{ f.odometer_reading ? f.odometer_reading.toLocaleString() + ' km' : '—' }}</td>
              <td class="py-2 text-gray-400">{{ f.station_name || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Maintenance -->
    <div v-if="activeTab === 'maintenance'">
      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="section-title">Maintenance History</h3>
          <NuxtLink :to="`/fleet/maintenance/create?vehicle_id=${id}`" class="btn-gold text-xs">+ Log Maintenance</NuxtLink>
        </div>
        <div v-if="!maintenance.length" class="text-center py-6 text-gray-600 text-sm">No maintenance records</div>
        <div class="space-y-2" v-else>
          <div v-for="m in maintenance" :key="m.id" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03]">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p class="text-xs font-mono font-bold text-gold-400/80">{{ m.request_no }}</p>
                <span class="badge text-[10px]" :class="m.repair_type === 'preventive' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'">{{ m.repair_type }}</span>
              </div>
              <p class="text-[11px] text-gray-500 mt-0.5">{{ m.station_supplier || 'No station' }} · {{ m.request_date }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs font-medium text-gray-200">৳{{ Number(m.total_cost || 0).toLocaleString() }}</p>
            </div>
            <UiStatusBadge :status="m.status" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tab: Tyres -->
    <div v-if="activeTab === 'tyres'">
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Tyre History</h3>
        <div v-if="!tyres.length" class="text-center py-6 text-gray-600 text-sm">No tyre records</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Position</th>
              <th class="pb-2 text-left text-gray-500">Brand/Size</th>
              <th class="pb-2 text-left text-gray-500">Fitted</th>
              <th class="pb-2 text-left text-gray-500">Removed</th>
              <th class="pb-2 text-right text-gray-500">Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in tyres" :key="t.id" class="border-b border-white/[0.03]">
              <td class="py-2 text-gray-300">{{ t.position || '—' }}</td>
              <td class="py-2 text-gray-400">{{ t.brand }} {{ t.size }}</td>
              <td class="py-2 text-gray-400">{{ t.fitted_date || '—' }}</td>
              <td class="py-2 text-gray-400">{{ t.removed_date || 'In use' }}</td>
              <td class="py-2 text-right text-gray-200">{{ t.cost ? '৳' + Number(t.cost).toLocaleString() : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const route = useRoute()
const id    = Number(route.params.id)

const { data, refresh } = await useFetch(`/api/fleet/vehicles/${id}`)

const vehicle    = computed(() => (data.value as any)?.vehicle    ?? null)
const documents  = computed(() => (data.value as any)?.documents  ?? [])
const trips      = computed(() => (data.value as any)?.trips      ?? [])
const fuel       = computed(() => (data.value as any)?.fuel       ?? [])
const maintenance = computed(() => (data.value as any)?.maintenance ?? [])
const tyres      = computed(() => (data.value as any)?.tyres      ?? [])

const activeTab = ref('summary')
const tabs = [
  { key: 'summary',     label: 'Summary'    },
  { key: 'documents',   label: 'Documents'  },
  { key: 'trips',       label: 'Trips'      },
  { key: 'fuel',        label: 'Fuel'       },
  { key: 'maintenance', label: 'Maintenance'},
  { key: 'tyres',       label: 'Tyres'      },
]

const vehicleFields = computed(() => {
  const v = vehicle.value
  if (!v) return []
  return [
    { label: 'Registration No',   value: v.registration_no    },
    { label: 'Type',              value: v.vehicle_type       },
    { label: 'Make / Model',      value: `${v.make || '—'} / ${v.model || '—'}` },
    { label: 'Engine No',         value: v.engine_no          },
    { label: 'Chassis No',        value: v.chassis_no         },
    { label: 'Year',              value: v.year_of_mfg        },
    { label: 'Fuel Type',         value: v.fuel_type          },
    { label: 'Ownership',         value: v.ownership_type     },
    { label: 'Capacity',          value: v.weight_capacity_kg ? (v.weight_capacity_kg / 1000).toFixed(1) + ' MT' : null },
    { label: 'Odometer',          value: v.current_odometer ? v.current_odometer.toLocaleString() + ' km' : null },
    { label: 'Status',            value: v.status             },
  ]
})

function isExpired(d: string) {
  return d && new Date(d) < new Date()
}
function isExpiringSoon(d: string) {
  if (!d) return false
  const diff = (new Date(d).getTime() - Date.now()) / 86400000
  return diff >= 0 && diff <= 30
}
function tripDot(s: string) {
  return { in_progress: 'bg-blue-400', scheduled: 'bg-amber-400', completed: 'bg-emerald-400', cancelled: 'bg-red-400', closed: 'bg-gray-500' }[s] ?? 'bg-gray-500'
}

// ── Document management ────────────────────────────────
const docModal = ref(false)
const docForm = reactive({ document_type: '', document_number: '', issue_date: '', expiry_date: '', notes: '' })

function openAddDoc() {
  Object.assign(docForm, { document_type: '', document_number: '', issue_date: '', expiry_date: '', notes: '' })
  docModal.value = true
}

async function saveDoc() {
  if (!docForm.document_type) return
  try {
    await $fetch(`/api/fleet/vehicles/${id}/documents`, { method: 'POST', body: docForm })
    success('Document added ✓')
    docModal.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to add document')
  }
}

async function deleteDoc(docId: number) {
  if (!confirm('Delete this document?')) return
  try {
    await $fetch(`/api/fleet/vehicles/documents/${docId}`, { method: 'DELETE' })
    success('Document removed')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to delete document')
  }
}
</script>
