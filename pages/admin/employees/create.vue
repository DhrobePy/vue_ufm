<template>
  <div class="space-y-6">
    <UiPageHeader title="Add Employee" subtitle="Register a new staff member"
                  :breadcrumb="['Admin', 'Employees', 'Add Employee']">
      <template #actions>
        <NuxtLink to="/admin/employees" class="btn-ghost text-xs">← All Employees</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">
        <div class="glass-card p-6 space-y-5">
          <h3 class="section-title">Personal Information</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name *</label>
              <input v-model="form.name" type="text" class="input-glass" placeholder="Md. Firstname Lastname" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone *</label>
              <input v-model="form.phone" type="tel" class="input-glass" placeholder="+880 1xxx-xxxxxx" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
              <input v-model="form.email" type="email" class="input-glass" placeholder="staff@ujjalfm.com" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date of Birth</label>
              <input v-model="form.dob" type="date" class="input-glass" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Permanent Address</label>
            <textarea v-model="form.address" rows="2" class="input-glass resize-none" placeholder="Village, Upazila, District" />
          </div>
        </div>

        <div class="glass-card p-6 space-y-5">
          <h3 class="section-title">Employment Details</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</label>
              <select v-model="form.position_id" class="input-glass">
                <option value="">— Select position —</option>
                <option v-for="p in positions" :key="p.id" :value="p.id">{{ p.title }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch *</label>
              <select v-model="form.branch_id" class="input-glass">
                <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employment Type</label>
              <select v-model="form.employmentType" class="input-glass">
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="daily">Daily Labour</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Join Date *</label>
              <input v-model="form.joinDate" type="date" class="input-glass" />
            </div>
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Salary (৳) *</label>
              <input v-model.number="form.salary" type="number" class="input-glass font-mono" />
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
            <textarea v-model="form.notes" rows="2" class="input-glass resize-none" placeholder="Additional details…" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Adding…' : 'Add Employee' }}
          </button>
          <NuxtLink to="/admin/employees" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right panel -->
      <div class="glass-card p-5 space-y-4">
        <h3 class="text-sm font-semibold text-gray-300">Summary</h3>
        <div class="space-y-2.5 text-xs">
          <div class="flex justify-between"><span class="text-gray-600">Name</span><span class="text-gray-300">{{ form.name || '—' }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Position</span><span class="text-gray-300">{{ positions.find((p: any) => p.id === Number(form.position_id))?.title || '—' }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Branch</span><span class="text-gray-300">{{ branches.find((b: any) => b.id === Number(form.branch_id))?.name || '—' }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Type</span><span class="text-gray-300 capitalize">{{ form.employmentType }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Salary</span><span class="font-mono text-gold-400">{{ form.salary ? `৳${form.salary.toLocaleString()}` : '—' }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

// Fetch branches and positions
const [{ data: branchData }, { data: posData }] = await Promise.all([
  useFetch('/api/branches'),
  useFetch('/api/positions'),
])
const branches  = computed(() => (branchData.value as any)?.branches  ?? [])
const positions = computed(() => (posData.value  as any)?.positions   ?? [])

const form = reactive({
  name:           '',
  email:          '',
  phone:          '',
  nid:            '',
  dob:            '',
  address:        '',
  position_id:    '' as number | string,
  branch_id:      1  as number | string,
  employmentType: 'permanent',
  joinDate:       new Date().toISOString().slice(0, 10),
  salary:         null as number | null,
  notes:          '',
})

const saving = ref(false)

const isValid = computed(() =>
  form.name && form.phone && form.joinDate && form.salary
)

// Helper: split full name into first / last
function splitName(full: string) {
  const parts = full.trim().split(/\s+/)
  const last  = parts.length > 1 ? parts.pop()! : ''
  return { first: parts.join(' ') || full.trim(), last }
}

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    const { first, last } = splitName(form.name)
    await $fetch('/api/admin/employees', {
      method: 'POST',
      body: {
        first_name:  first,
        last_name:   last,
        email:       form.email || `emp_${Date.now()}@ujjalfm.local`,
        phone:       form.phone  || null,
        address:     form.address || null,
        position_id: form.position_id ? Number(form.position_id) : null,
        hire_date:   form.joinDate,
        base_salary: form.salary,
        branch_id:   Number(form.branch_id),
      },
    })
    success(`Employee ${form.name} added successfully`)
    navigateTo('/admin/employees')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to add employee')
  } finally {
    saving.value = false
  }
}
</script>
