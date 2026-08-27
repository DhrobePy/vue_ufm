<template>
  <div class="space-y-6">
    <UiPageHeader title="Users" subtitle="Manage system users and access"
                  :breadcrumb="['Admin','Users']">
      <template #actions>
        <NuxtLink to="/admin/users/create" class="btn-gold text-xs">+ Add User</NuxtLink>
      </template>
    </UiPageHeader>

    <!-- Stats row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="s in statsCards" :key="s.label" class="glass-card p-4">
        <p class="text-xs text-gray-500">{{ s.label }}</p>
        <p class="text-xl font-bold mt-1" :class="s.cls">{{ s.value }}</p>
      </div>
    </div>

    <!-- Filter -->
    <div class="glass-card p-4 flex flex-wrap items-center gap-3">
      <input v-model.lazy="search" type="text" class="field-input text-xs py-1.5 w-52"
             placeholder="Search name, email, role…" />
      <button @click="search='';refresh()" class="btn-ghost text-xs py-1.5">Reset</button>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <UiDataTable v-else
      :columns="cols"
      :rows="rows"
      :per-page="25"
      exportable
      search-placeholder=""
      @row-click="row => { if (isSuperadmin) navigateTo(`/admin/users/${row.id}/permissions`) }"
    >
      <template #cell-role="{ value }">
        <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border bg-blue-500/10 text-blue-300 border-blue-500/20 whitespace-nowrap">
          {{ value }}
        </span>
      </template>
      <template #cell-branch_name="{ value }">
        <span v-if="value" class="text-xs text-gray-400">{{ value }}</span>
        <span v-else class="text-xs text-gray-700">All</span>
      </template>
      <template #cell-status="{ value }">
        <UiStatusBadge :status="value" />
      </template>
      <template #cell-last_login_at="{ value }">
        <span class="text-[11px] text-gray-500 font-mono">{{ value ? String(value).slice(0, 16).replace('T', ' ') : 'Never' }}</span>
      </template>
      <template #actions="{ row }">
        <NuxtLink v-if="isSuperadmin" :to="`/admin/users/${row.id}/permissions`" class="btn-ghost text-[11px] py-1 px-2.5">Permissions</NuxtLink>
        <NuxtLink :to="`/admin/users/${row.id}/edit`"        class="btn-ghost text-[11px] py-1 px-2.5">Edit</NuxtLink>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { user: sessionUser } = useUserSession()
const isSuperadmin = computed(() => (sessionUser.value?.role ?? '').toLowerCase() === 'superadmin')

const search = ref('')

const { data, pending, error, refresh } = await useFetch('/api/admin/users', {
  query: computed(() => ({ search: search.value })),
})

const rows  = computed(() => (data.value?.users ?? []) as any[])
const stats = computed(() => (data.value?.stats ?? {}) as any)

const statsCards = computed(() => [
  { label: 'Total Users', value: stats.value.total     ?? 0, cls: 'text-white' },
  { label: 'Active',      value: stats.value.active    ?? 0, cls: 'text-emerald-400' },
  { label: 'Pending',     value: stats.value.pending   ?? 0, cls: 'text-yellow-400' },
  { label: 'Suspended',   value: stats.value.suspended ?? 0, cls: 'text-red-400' },
])

const cols = [
  { key: 'display_name',  label: 'Name',       sortable: true },
  { key: 'email',         label: 'Email',      sortable: true },
  { key: 'role',          label: 'Role',       sortable: true },
  { key: 'branch_name',   label: 'Branch' },
  { key: 'last_login_at', label: 'Last Login', sortable: true },
  { key: 'status',        label: 'Status' },
]
</script>
