<template>
  <div class="p-6 space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-white">Employees</h1>
        <p class="text-sm text-gray-400 mt-0.5">{{ filtered.length }} of {{ employees.length }} shown</p>
      </div>
      <button @click="openCreate" class="btn-primary flex items-center gap-2">
        <span class="text-lg leading-none">+</span> Add Employee
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <input v-model="search" placeholder="Search name / email…"
        class="input-field w-56 text-sm" />
      <select v-model="filterDept" class="input-field text-sm">
        <option value="">All Departments</option>
        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <select v-model="filterStatus" class="input-field text-sm">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="on_leave">On Leave</option>
        <option value="terminated">Terminated</option>
      </select>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="th">Employee</th>
              <th class="th">Department / Position</th>
              <th class="th">Hire Date</th>
              <th class="th text-right">Gross Salary</th>
              <th class="th text-center">Status</th>
              <th class="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filtered" :key="emp.id" class="tr">
              <td class="td">
                <div class="flex items-center gap-3">
                  <img v-if="emp.photo" :src="emp.photo"
                       class="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10" />
                  <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                       style="background: rgba(var(--accent-glow),0.15); color: var(--accent-from)">
                    {{ initials(emp.first_name, emp.last_name) }}
                  </div>
                  <div>
                    <p class="font-medium text-gray-200">{{ emp.first_name }} {{ emp.last_name }}</p>
                    <p class="text-xs text-gray-500">{{ emp.email }}</p>
                  </div>
                </div>
              </td>
              <td class="td">
                <p class="text-gray-300">{{ emp.position_name || '—' }}</p>
                <p class="text-xs text-gray-500">{{ emp.department_name || '—' }}</p>
              </td>
              <td class="td text-gray-400">{{ fmtDate(emp.hire_date) }}</td>
              <td class="td text-right text-gray-200">৳{{ fmt(emp.base_salary) }}</td>
              <td class="td text-center">
                <span :class="statusClass(emp.status)" class="badge">{{ emp.status }}</span>
              </td>
              <td class="td text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink :to="`/hr/employees/${emp.id}`" class="btn-xs">👤 Profile</NuxtLink>
                  <button @click="openEdit(emp)" class="btn-xs">Edit</button>
                  <NuxtLink :to="`/hr/salary-structure?emp=${emp.id}`" class="btn-xs">Salary</NuxtLink>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="6" class="td text-center text-gray-500 py-10">No employees found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-box w-full max-w-2xl">
          <h2 class="text-lg font-bold text-white mb-5">{{ editingId ? 'Edit Employee' : 'Add Employee' }}</h2>
          <form @submit.prevent="save" class="grid grid-cols-2 gap-4">
            <div>
              <label class="label">First Name *</label>
              <input v-model="form.first_name" required class="input-field w-full" />
            </div>
            <div>
              <label class="label">Last Name *</label>
              <input v-model="form.last_name" required class="input-field w-full" />
            </div>
            <div>
              <label class="label">Email *</label>
              <input v-model="form.email" type="email" required class="input-field w-full" />
            </div>
            <div>
              <label class="label">Phone</label>
              <input v-model="form.phone" class="input-field w-full" />
            </div>
            <div class="col-span-2">
              <label class="label">Address</label>
              <textarea v-model="form.address" rows="2" class="input-field w-full resize-none" />
            </div>
            <div>
              <label class="label">Department</label>
              <select v-model="selectedDept" @change="form.position_id = ''" class="input-field w-full">
                <option value="">Select department</option>
                <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">Position</label>
              <select v-model="form.position_id" class="input-field w-full">
                <option value="">Select position</option>
                <option v-for="p in filteredPositions" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div>
              <label class="label">Hire Date *</label>
              <input v-model="form.hire_date" type="date" required class="input-field w-full" />
            </div>
            <div>
              <label class="label">Base Salary (৳)</label>
              <input v-model="form.base_salary" type="number" min="0" step="0.01" class="input-field w-full" />
            </div>
            <div>
              <label class="label">Status</label>
              <select v-model="form.status" class="input-field w-full">
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div class="col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" @click="showModal = false" class="btn-secondary">Cancel</button>
              <button type="submit" :disabled="saving" class="btn-primary">
                {{ saving ? 'Saving…' : editingId ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data, refresh } = await useFetch('/api/hr/employees')
const employees  = computed(() => (data.value as any)?.employees   ?? [])
const departments= computed(() => (data.value as any)?.departments ?? [])
const positions  = computed(() => (data.value as any)?.positions   ?? [])

const search       = ref('')
const filterDept   = ref<number | ''>('')
const filterStatus = ref('')

const filtered = computed(() => {
  return employees.value.filter((e: any) => {
    const q = search.value.toLowerCase()
    const matchSearch  = !q || `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(q)
    const matchDept    = !filterDept.value || e.department_id === filterDept.value
    const matchStatus  = !filterStatus.value || e.status === filterStatus.value
    return matchSearch && matchDept && matchStatus
  })
})

const filteredPositions = computed(() =>
  positions.value.filter((p: any) => !selectedDept.value || p.department_id === Number(selectedDept.value))
)

// ── Form ──
const showModal  = ref(false)
const saving     = ref(false)
const editingId  = ref<number | null>(null)
const selectedDept = ref<number | ''>('')

const emptyForm = () => ({
  first_name: '', last_name: '', email: '', phone: '',
  address: '', position_id: '', hire_date: '', base_salary: 0, status: 'active',
})
const form = ref(emptyForm())

function openCreate() {
  editingId.value = null
  selectedDept.value = ''
  form.value = emptyForm()
  showModal.value = true
}

function openEdit(emp: any) {
  editingId.value = emp.id
  selectedDept.value = emp.department_id || ''
  form.value = {
    first_name: emp.first_name, last_name: emp.last_name,
    email: emp.email, phone: emp.phone || '',
    address: emp.address || '', position_id: emp.position_id || '',
    hire_date: emp.hire_date?.slice(0, 10) || '', base_salary: emp.base_salary, status: emp.status,
  }
  showModal.value = true
}

async function save() {
  saving.value = true
  try {
    await $fetch('/api/hr/employees', {
      method: 'POST',
      body: { action: editingId.value ? 'update' : 'create', id: editingId.value, ...form.value },
    })
    showModal.value = false
    await refresh()
  } finally {
    saving.value = false
  }
}

// ── Helpers ──
const initials = (f: string, l: string) => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
const fmt = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'
const statusClass = (s: string) => ({
  active:     'badge-green',
  on_leave:   'badge-yellow',
  terminated: 'badge-red',
})[s] || 'badge-gray'
</script>
