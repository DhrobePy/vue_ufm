<template>
  <div class="space-y-6" v-if="driver">
    <UiPageHeader
      :title="driver.full_name"
      :subtitle="`${driver.mobile || ''} · ${driver.status}`"
      :breadcrumb="['Fleet','Drivers', driver.full_name]"
    >
      <template #actions>
        <UiStatusBadge :status="driver.status" />
        <NuxtLink :to="`/fleet/drivers/${id}/edit`" class="btn-secondary text-xs">Edit</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Tabs -->
    <div class="flex gap-1 border-b border-white/[0.07]">
      <button v-for="t in tabs" :key="t.key" @click="activeTab = t.key"
        class="px-4 py-2 text-xs font-medium transition-colors"
        :class="activeTab === t.key ? 'text-gold-400 border-b-2 border-gold-400' : 'text-gray-500 hover:text-gray-300'">
        {{ t.label }}
      </button>
    </div>

    <!-- Summary -->
    <div v-if="activeTab === 'summary'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Personal Details</h3>
        <dl class="space-y-3 text-sm">
          <div v-for="f in driverFields" :key="f.label" class="flex justify-between">
            <dt class="text-gray-500">{{ f.label }}</dt>
            <dd class="text-gray-200 font-medium">{{ f.value || '—' }}</dd>
          </div>
        </dl>
      </div>

      <div class="space-y-4">
        <!-- Assigned Vehicle -->
        <div class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned Vehicle</h4>
          <p v-if="driver.vehicle_no" class="font-mono text-sm font-bold text-gold-400/90">{{ driver.vehicle_no }}</p>
          <p v-else class="text-gray-600 text-sm">No vehicle assigned</p>
        </div>

        <!-- Emergency Contact -->
        <div v-if="driver.emergency_contact_name" class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Emergency Contact</h4>
          <p class="text-sm text-gray-200">{{ driver.emergency_contact_name }}</p>
          <p class="text-xs text-gray-500">{{ driver.emergency_contact_mobile || '' }}</p>
        </div>

        <!-- Remarks -->
        <div v-if="driver.remarks" class="glass-card p-4">
          <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Remarks</h4>
          <p class="text-xs text-gray-400">{{ driver.remarks }}</p>
        </div>
      </div>
    </div>

    <!-- Documents -->
    <div v-if="activeTab === 'documents'">
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Driver Documents</h3>
        <div v-if="!documents.length" class="text-center py-6 text-gray-600 text-sm">No documents recorded</div>
        <table v-else class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 text-left text-gray-500">Type</th>
              <th class="pb-2 text-left text-gray-500">Document No</th>
              <th class="pb-2 text-left text-gray-500">Issue Date</th>
              <th class="pb-2 text-left text-gray-500">Expiry Date</th>
              <th class="pb-2 text-left text-gray-500">Authority</th>
              <th class="pb-2 text-left text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in documents" :key="d.id" class="border-b border-white/[0.03]">
              <td class="py-2 text-gray-300 font-medium">{{ d.document_type }}</td>
              <td class="py-2 font-mono text-gray-400">{{ d.document_no || '—' }}</td>
              <td class="py-2 text-gray-400">{{ d.issue_date || '—' }}</td>
              <td class="py-2" :class="isExpired(d.expiry_date) ? 'text-red-400' : isExpiringSoon(d.expiry_date) ? 'text-amber-400' : 'text-gray-400'">
                {{ d.expiry_date || '—' }}
              </td>
              <td class="py-2 text-gray-400">{{ d.issuing_authority || '—' }}</td>
              <td class="py-2">
                <span class="badge text-[10px]"
                  :class="isExpired(d.expiry_date) ? 'bg-red-500/10 text-red-400' : isExpiringSoon(d.expiry_date) ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'">
                  {{ isExpired(d.expiry_date) ? 'Expired' : isExpiringSoon(d.expiry_date) ? 'Expiring Soon' : 'Valid' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Employment History -->
    <div v-if="activeTab === 'employment'">
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Employment History</h3>
        <div v-if="!employment.length" class="text-center py-6 text-gray-600 text-sm">No employment history recorded</div>
        <div v-else class="space-y-3">
          <div v-for="e in employment" :key="e.id" class="p-3 rounded-xl bg-white/[0.03]">
            <p class="text-sm font-medium text-gray-200">{{ e.company_name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ e.designation || 'Driver' }} · {{ e.start_date || '?' }} – {{ e.end_date || 'Present' }}</p>
            <p v-if="e.remarks" class="text-xs text-gray-600 mt-1">{{ e.remarks }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Trips -->
    <div v-if="activeTab === 'trips'">
      <div class="glass-card p-5">
        <h3 class="section-title mb-4">Trip History</h3>
        <div v-if="!trips.length" class="text-center py-6 text-gray-600 text-sm">No trips found</div>
        <div v-else class="space-y-2">
          <div v-for="t in trips" :key="t.id" class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer" @click="$router.push(`/fleet/trips/${t.id}`)">
            <div class="flex-1">
              <p class="text-xs font-mono font-bold text-gold-400/80">{{ t.trip_number }}</p>
              <p class="text-[11px] text-gray-500">{{ t.origin }} → {{ t.destination }}</p>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id    = Number(route.params.id)

const { data } = await useFetch(`/api/fleet/drivers/${id}`)

const driver     = computed(() => (data.value as any)?.driver     ?? null)
const documents  = computed(() => (data.value as any)?.documents  ?? [])
const employment = computed(() => (data.value as any)?.employment ?? [])
const trips      = computed(() => (data.value as any)?.trips      ?? [])

const activeTab = ref('summary')
const tabs = [
  { key: 'summary',    label: 'Summary'    },
  { key: 'documents',  label: 'Documents'  },
  { key: 'employment', label: 'Employment' },
  { key: 'trips',      label: 'Trips'      },
]

const driverFields = computed(() => {
  const d = driver.value
  if (!d) return []
  return [
    { label: 'Full Name',      value: d.full_name     },
    { label: 'Mobile',         value: d.mobile        },
    { label: 'NID',            value: d.nid           },
    { label: 'Address',        value: d.address       },
    { label: 'Joining Date',   value: d.joining_date  },
    { label: 'Status',         value: d.status        },
  ]
})

function isExpired(d: string) { return d && new Date(d) < new Date() }
function isExpiringSoon(d: string) {
  if (!d) return false
  const diff = (new Date(d).getTime() - Date.now()) / 86400000
  return diff >= 0 && diff <= 30
}
</script>
