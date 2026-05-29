<template>
  <div class="space-y-6">
    <UiPageHeader title="Add Driver" subtitle="Register a new driver in the fleet"
                  :breadcrumb="['Logistics', 'Drivers', 'Add Driver']">
      <template #actions>
        <NuxtLink to="/logistics/drivers" class="btn-ghost text-xs">← All Drivers</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 glass-card p-6 space-y-5">
        <h3 class="section-title">Driver Information</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name *</label>
            <input v-model="form.name" type="text" class="input-glass" placeholder="Md. Firstname Lastname" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone *</label>
            <input v-model="form.phone" type="tel" class="input-glass" placeholder="+880 1xxx-xxxxxx" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">National ID (NID) *</label>
            <input v-model="form.nid" type="text" class="input-glass font-mono" placeholder="10 or 17-digit NID" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date of Birth</label>
            <input v-model="form.dob" type="date" class="input-glass" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Permanent Address</label>
          <textarea v-model="form.address" rows="2" class="input-glass resize-none" placeholder="Village, Union, Upazila, District" />
        </div>

        <!-- License -->
        <div class="space-y-3 pt-2">
          <h3 class="text-sm font-semibold text-gray-300">Driving License</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">License No. *</label>
              <input v-model="form.licenseNo" type="text" class="input-glass font-mono" placeholder="BRTA license #" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">License Class</label>
              <select v-model="form.licenseClass" class="input-glass">
                <option value="light">Light Vehicle</option>
                <option value="medium">Medium Vehicle</option>
                <option value="heavy">Heavy Vehicle</option>
                <option value="professional">Special / Professional</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">License Expiry *</label>
              <input v-model="form.licenseExpiry" type="date" class="input-glass" />
            </div>
          </div>
        </div>

        <!-- Employment -->
        <div class="space-y-3 pt-2">
          <h3 class="text-sm font-semibold text-gray-300">Employment</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver Type</label>
              <select v-model="form.employmentType" class="input-glass">
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary / Contract</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Branch</label>
              <select v-model="form.branch_id" class="input-glass">
                <option value="">— None —</option>
                <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Salary (৳)</label>
              <input v-model.number="form.salary" type="number" class="input-glass font-mono" />
            </div>
          </div>
        </div>

        <!-- Emergency contact -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emergency Contact Name</label>
            <input v-model="form.emergencyName" type="text" class="input-glass" />
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emergency Contact Phone</label>
            <input v-model="form.emergencyPhone" type="tel" class="input-glass" />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
          <textarea v-model="form.notes" rows="2" class="input-glass resize-none" placeholder="Any additional information…" />
        </div>

        <div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Registering…' : 'Register Driver' }}
          </button>
          <NuxtLink to="/logistics/drivers" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Preview -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="text-sm font-semibold text-gray-300">Driver Card Preview</h3>
        <div class="rounded-xl border border-white/10 p-4 bg-white/[0.02] space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-lg font-bold text-gold-400">
              {{ form.name ? form.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : '?' }}
            </div>
            <div>
              <p class="text-sm font-bold text-gray-200">{{ form.name || 'Driver Name' }}</p>
              <p class="text-xs text-gray-500">{{ form.phone || '+880 1xxx-xxxxxx' }}</p>
            </div>
          </div>
          <div class="space-y-1.5 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">License</span><span class="font-mono text-gray-300">{{ form.licenseNo || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Class</span><span class="text-gray-300 capitalize">{{ form.licenseClass }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Branch</span><span class="text-gray-300">{{ branches.find((b: any) => b.id === Number(form.branch_id))?.name || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Type</span><span class="text-gray-300">{{ form.employmentType }}</span></div>
            <div class="flex justify-between">
              <span class="text-gray-600">License Expiry</span>
              <span :class="form.licenseExpiry && new Date(form.licenseExpiry) < new Date() ? 'text-red-400' : 'text-gray-300'">{{ form.licenseExpiry || '—' }}</span>
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

// Fetch branches for the dropdown
const { data: branchData } = await useFetch('/api/branches')
const branches = computed(() => (branchData.value as any)?.branches ?? [])

const form = reactive({
  name:           '',
  phone:          '',
  nid:            '',
  dob:            '',
  address:        '',
  licenseNo:      '',
  licenseClass:   'professional',
  licenseExpiry:  '',
  employmentType: 'Permanent',
  branch_id:      '' as number | string,
  salary:         null as number | null,
  emergencyName:  '',
  emergencyPhone: '',
  notes:          '',
})

const saving = ref(false)

const isValid = computed(() =>
  form.name && form.phone && form.nid && form.licenseNo && form.licenseExpiry
)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch('/api/logistics/drivers', {
      method: 'POST',
      body: {
        driver_name:             form.name.trim(),
        phone_number:            form.phone,
        nid_number:              form.nid   || null,
        date_of_birth:           form.dob   || null,
        address:                 form.address || null,
        license_number:          form.licenseNo,
        license_type:            form.licenseClass,
        license_expiry_date:     form.licenseExpiry,
        driver_type:             form.employmentType,
        assigned_branch_id:      form.branch_id ? Number(form.branch_id) : null,
        salary:                  form.salary,
        emergency_contact_name:  form.emergencyName  || null,
        emergency_contact_phone: form.emergencyPhone || null,
        notes:                   form.notes || null,
      },
    })
    success(`Driver ${form.name} registered successfully`)
    navigateTo('/logistics/drivers')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to register driver')
  } finally {
    saving.value = false
  }
}
</script>
