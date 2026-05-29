<template>
  <div class="p-6 space-y-5">
    <div>
      <h1 class="text-2xl font-bold text-white">Salary Structure</h1>
      <p class="text-sm text-gray-400 mt-0.5">Manage per-employee compensation breakdown</p>
    </div>

    <div class="grid grid-cols-12 gap-5">
      <!-- Employee list -->
      <div class="col-span-12 lg:col-span-4">
        <div class="card overflow-hidden">
          <div class="px-4 py-3 border-b border-white/[0.06]">
            <input v-model="search" placeholder="Search…" class="input-field w-full text-sm" />
          </div>
          <div class="overflow-y-auto max-h-[600px]">
            <button v-for="emp in filteredEmps" :key="emp.id"
              @click="selectEmployee(emp.id)"
              :class="['w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/[0.04]',
                       selectedId === emp.id ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]']">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                   style="background: rgba(var(--accent-glow),0.15); color: var(--accent-from)">
                {{ initials(emp.first_name, emp.last_name) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-200 truncate">{{ emp.first_name }} {{ emp.last_name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ emp.position_name || emp.department_name || '—' }}</p>
              </div>
              <div class="text-right shrink-0">
                <p v-if="emp.gross_salary" class="text-xs text-gray-300">৳{{ fmt(emp.gross_salary) }}</p>
                <p v-else class="text-xs text-gray-600">Not set</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="col-span-12 lg:col-span-8">
        <div v-if="!selectedId" class="card flex items-center justify-center h-48">
          <p class="text-gray-500">← Select an employee to manage salary structure</p>
        </div>

        <div v-else class="card p-5 space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-white">{{ selectedEmp?.first_name }} {{ selectedEmp?.last_name }}</h2>
              <p class="text-sm text-gray-500">{{ selectedEmp?.position_name }} · {{ selectedEmp?.department_name }}</p>
            </div>
            <div v-if="structure" class="text-right">
              <p class="text-xs text-gray-500">Last updated</p>
              <p class="text-sm text-gray-300">{{ fmtDate(structure.updated_date || structure.created_date) }}</p>
            </div>
          </div>

          <form @submit.prevent="save" class="space-y-5">
            <!-- Earnings -->
            <div>
              <h3 class="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <span>↑</span> Earnings
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="field in earningFields" :key="field.key">
                  <label class="label">{{ field.label }}</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">৳</span>
                    <input v-model.number="form[field.key]" type="number" min="0" step="0.01"
                           class="input-field w-full pl-7" @input="recalc" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Deductions -->
            <div>
              <h3 class="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                <span>↓</span> Deductions
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="field in deductionFields" :key="field.key">
                  <label class="label">{{ field.label }}</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">৳</span>
                    <input v-model.number="form[field.key]" type="number" min="0" step="0.01"
                           class="input-field w-full pl-7" @input="recalc" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="rounded-xl p-4 grid grid-cols-3 gap-4" style="background: rgba(var(--tint)/0.04); border: 1px solid rgba(var(--tint)/0.07)">
              <div class="text-center">
                <p class="text-xs text-gray-500">Total Allowances</p>
                <p class="text-lg font-bold text-green-400">৳{{ fmt(totalAllowances) }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-500">Gross Salary</p>
                <p class="text-xl font-bold text-white">৳{{ fmt(grossSalary) }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-500">Net Salary</p>
                <p class="text-xl font-bold text-blue-400">৳{{ fmt(netSalary) }}</p>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button type="submit" :disabled="saving" class="btn-primary px-6">
                {{ saving ? 'Saving…' : 'Save Structure' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()

// Load employee list
const { data: listData } = await useFetch('/api/hr/salary-structure')
const empList = computed(() => (listData.value as any)?.employees ?? [])

const search = ref('')
const filteredEmps = computed(() => {
  const q = search.value.toLowerCase()
  return empList.value.filter((e: any) =>
    !q || `${e.first_name} ${e.last_name}`.toLowerCase().includes(q)
  )
})

const selectedId  = ref<number | null>(route.query.emp ? Number(route.query.emp) : null)
const selectedEmp = ref<any>(null)
const structure   = ref<any>(null)

const emptyForm = () => ({
  basic_salary: 0, house_allowance: 0, transport_allowance: 0,
  medical_allowance: 0, other_allowances: 0,
  provident_fund: 0, tax_deduction: 0, other_deductions: 0,
})
const form = ref(emptyForm())

async function selectEmployee(id: number) {
  selectedId.value = id
  const res = await $fetch<any>('/api/hr/salary-structure', { query: { employeeId: id } })
  selectedEmp.value = res.employee
  structure.value   = res.structure

  if (res.structure) {
    const s = res.structure
    form.value = {
      basic_salary: Number(s.basic_salary),
      house_allowance: Number(s.house_allowance),
      transport_allowance: Number(s.transport_allowance),
      medical_allowance: Number(s.medical_allowance),
      other_allowances: Number(s.other_allowances),
      provident_fund: Number(s.provident_fund),
      tax_deduction: Number(s.tax_deduction),
      other_deductions: Number(s.other_deductions),
    }
  } else {
    form.value = emptyForm()
    form.value.basic_salary = Number(res.employee?.base_salary) || 0
  }
  recalc()
}

// Auto-select if query param present
if (selectedId.value) await selectEmployee(selectedId.value)

const totalAllowances = ref(0)
const grossSalary     = ref(0)
const netSalary       = ref(0)

function recalc() {
  const f = form.value
  totalAllowances.value = f.house_allowance + f.transport_allowance + f.medical_allowance + f.other_allowances
  grossSalary.value     = f.basic_salary + totalAllowances.value
  netSalary.value       = grossSalary.value - f.provident_fund - f.tax_deduction - f.other_deductions
}

const saving = ref(false)
async function save() {
  saving.value = true
  try {
    const res = await $fetch<any>('/api/hr/salary-structure', {
      method: 'POST',
      body: { employee_id: selectedId.value, ...form.value },
    })
    // Refresh list
    const { data: newList } = await useFetch('/api/hr/salary-structure')
    // Refresh detail
    await selectEmployee(selectedId.value!)
  } finally { saving.value = false }
}

const earningFields = [
  { key: 'basic_salary',        label: 'Basic Salary *' },
  { key: 'house_allowance',     label: 'House Allowance' },
  { key: 'transport_allowance', label: 'Transport Allowance' },
  { key: 'medical_allowance',   label: 'Medical Allowance' },
  { key: 'other_allowances',    label: 'Other Allowances' },
]
const deductionFields = [
  { key: 'provident_fund',   label: 'Provident Fund' },
  { key: 'tax_deduction',    label: 'Tax Deduction' },
  { key: 'other_deductions', label: 'Other Deductions' },
]

const initials = (f: string, l: string) => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase()
const fmt      = (n: any) => Number(n || 0).toLocaleString('en-IN')
const fmtDate  = (d: string) => d ? new Date(d).toLocaleDateString('en-GB') : '—'

// Recalc on mount if form already has values
recalc()
</script>
