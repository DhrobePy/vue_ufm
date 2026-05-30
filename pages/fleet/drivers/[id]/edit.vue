<template>
  <div class="space-y-6 max-w-2xl mx-auto">
    <UiPageHeader
      :title="`Edit Driver — ${form.full_name || '…'}`"
      :breadcrumb="['Fleet','Drivers', form.full_name || id, 'Edit']"
    >
      <template #actions>
        <NuxtLink :to="`/fleet/drivers/${id}`" class="btn-secondary text-xs">← Back to Detail</NuxtLink>
      </template>
    </UiPageHeader>

    <div v-if="pending" class="glass-card p-10 flex items-center justify-center">
      <span class="text-gray-500 text-sm">Loading driver data…</span>
    </div>

    <form v-else class="space-y-5" @submit.prevent="submit">
      <!-- Personal Info -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="section-title">Personal Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="form-label">Full Name *</label>
            <input v-model="form.full_name" class="form-input" required placeholder="e.g. Kamal Hossain" />
          </div>
          <div>
            <label class="form-label">Mobile</label>
            <input v-model="form.mobile" class="form-input" placeholder="01711-XXXXXX" />
          </div>
          <div>
            <label class="form-label">NID No</label>
            <input v-model="form.nid" class="form-input" placeholder="National ID number" />
          </div>
          <div>
            <label class="form-label">Joining Date</label>
            <input v-model="form.joining_date" type="date" class="form-input" />
          </div>
          <div>
            <label class="form-label">Status</label>
            <select v-model="form.status" class="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="form-label">Address</label>
            <textarea v-model="form.address" class="form-input" rows="2" placeholder="Home address" />
          </div>
          <div>
            <label class="form-label">Photo URL</label>
            <input v-model="form.photo_url" class="form-input" placeholder="https://…" />
          </div>
          <div>
            <label class="form-label">Assigned Vehicle</label>
            <select v-model="form.assigned_vehicle_id" class="form-input">
              <option value="">— None —</option>
              <option v-for="v in vehicles" :key="v.id" :value="v.id">{{ v.registration_no }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="section-title">Emergency Contact</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="form-label">Contact Name</label>
            <input v-model="form.emergency_contact_name" class="form-input" placeholder="Father/Spouse/Friend" />
          </div>
          <div>
            <label class="form-label">Contact Mobile</label>
            <input v-model="form.emergency_contact_mobile" class="form-input" placeholder="01711-XXXXXX" />
          </div>
        </div>
      </div>

      <!-- Remarks -->
      <div class="glass-card p-5">
        <label class="form-label">Remarks</label>
        <textarea v-model="form.remarks" class="form-input" rows="2" placeholder="Any additional notes…" />
      </div>

      <!-- Error -->
      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{{ error }}</div>

      <div class="flex gap-3">
        <button type="submit" class="btn-gold" :disabled="loading">{{ loading ? 'Saving…' : 'Update Driver' }}</button>
        <NuxtLink :to="`/fleet/drivers/${id}`" class="btn-secondary">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route   = useRoute()
const router  = useRouter()
const id      = Number(route.params.id)
const loading = ref(false)
const error   = ref('')

const form = reactive({
  full_name: '', mobile: '', nid: '', address: '',
  joining_date: '', photo_url: '',
  emergency_contact_name: '', emergency_contact_mobile: '',
  status: 'active', assigned_vehicle_id: '' as any, remarks: '',
})

// Load driver and vehicles in parallel
const [{ data: driverData, pending }, { data: vehiclesData }] = await Promise.all([
  useFetch(`/api/fleet/drivers/${id}`),
  useFetch('/api/fleet/vehicles'),
])

const vehicles = computed(() => (vehiclesData.value as any)?.vehicles ?? [])

// Pre-populate form once data is ready
watchEffect(() => {
  const d = (driverData.value as any)?.driver
  if (!d) return
  form.full_name                = d.full_name                ?? ''
  form.mobile                   = d.mobile                   ?? ''
  form.nid                      = d.nid                      ?? ''
  form.address                  = d.address                  ?? ''
  form.joining_date             = d.joining_date             ?? ''
  form.photo_url                = d.photo_url                ?? ''
  form.emergency_contact_name   = d.emergency_contact_name   ?? ''
  form.emergency_contact_mobile = d.emergency_contact_mobile ?? ''
  form.status                   = d.status                   ?? 'active'
  form.assigned_vehicle_id      = d.assigned_vehicle_id      ?? ''
  form.remarks                  = d.remarks                  ?? ''
})

async function submit() {
  loading.value = true
  error.value   = ''
  try {
    await $fetch(`/api/fleet/drivers/${id}`, { method: 'PUT', body: form })
    router.push(`/fleet/drivers/${id}`)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to update driver'
  } finally {
    loading.value = false
  }
}
</script>
