<template>
  <div class="space-y-6">
    <UiPageHeader title="Employees" subtitle="All staff members across all branches"
                  :breadcrumb="['Admin', 'Employees']">
      <template #actions>
        <NuxtLink to="/admin/employees/create" class="btn-gold text-xs">+ Add Employee</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Total Staff</p>
        <p class="text-2xl font-bold text-gray-100">{{ stats.total ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Active</p>
        <p class="text-2xl font-bold text-gold-400">{{ stats.active ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Branches</p>
        <p class="text-2xl font-bold text-blue-400">{{ stats.branches ?? 0 }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-xs text-gray-500 mb-1">Monthly Payroll</p>
        <p class="text-2xl font-bold text-emerald-400">৳{{ Number(stats.monthly_payroll ?? 0).toLocaleString() }}</p>
      </div>
    </div>

    <!-- Search + filter -->
    <div class="glass-card p-4 flex flex-wrap gap-3">
      <input v-model.lazy="search" type="text" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" placeholder="Search employees…" />
      <select v-model="statusFilter" class="input-glass w-auto text-xs py-1.5">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="on_leave">On Leave</option>
        <option value="terminated">Terminated</option>
      </select>
      <button @click="search='';statusFilter=''" class="btn-ghost text-xs py-1.5">Reset</button>
    </div>

    <!-- Employees table -->
    <div class="glass-card p-5">
      <div v-if="pending" class="py-8 text-center text-xs text-gray-500 animate-pulse">Loading employees…</div>
      <UiDataTable v-else :columns="cols" :rows="employees" :per-page="15" search-placeholder="">
        <template #cell-full_name="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
                 style="background: linear-gradient(135deg, #f59e0b, #d97706)">
              {{ (row as any).full_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-200">{{ (row as any).full_name }}</p>
              <p class="text-[11px] text-gray-600">{{ (row as any).phone }}</p>
            </div>
          </div>
        </template>
        <template #cell-base_salary="{ value }">
          <span class="font-mono text-xs text-gray-200">৳{{ Number(value).toLocaleString() }}</span>
        </template>
        <template #cell-status="{ value }">
          <UiStatusBadge :status="value" />
        </template>
        <template #actions="{ row }">
          <div class="flex gap-1.5">
            <button class="btn-ghost text-xs py-1 px-2">View</button>
            <button class="btn-ghost text-xs py-1 px-2">Edit</button>
          </div>
        </template>
      </UiDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search       = ref('')
const statusFilter = ref('')

const cols = [
  { key: 'full_name',   label: 'Employee',    sortable: true },
  { key: 'position',    label: 'Position',    sortable: true },
  { key: 'branch_name', label: 'Branch',      sortable: true },
  { key: 'hire_date',   label: 'Join Date',   sortable: true },
  { key: 'base_salary', label: 'Salary',      sortable: true },
  { key: 'status',      label: 'Status' },
]

const { data, pending } = await useFetch('/api/admin/employees', {
  query: computed(() => ({
    search: search.value,
    status: statusFilter.value,
  })),
})

const employees = computed(() => (data.value as any)?.employees ?? [])
const stats     = computed(() => (data.value as any)?.stats     ?? {})
</script>
