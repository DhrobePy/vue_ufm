<template>
  <div class="space-y-6">
    <UiPageHeader title="Chart of Accounts" subtitle="Full list of ledger accounts organised by type"
                  :breadcrumb="['Accounts', 'Chart of Accounts']">
      <template #actions>
        <button @click="showAddModal = true" class="btn-gold text-xs">+ Add Account</button>
      </template>
    </UiPageHeader>

    <!-- Search + filter -->
    <div class="glass-card p-4 flex flex-wrap gap-3">
      <input v-model.lazy="search" type="text" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" placeholder="Search accounts…" />
      <select v-model="filterType" class="input-glass w-auto text-xs py-1.5">
        <option value="">All Groups</option>
        <option value="Asset">Asset</option>
        <option value="Liability">Liability</option>
        <option value="Equity">Equity</option>
        <option value="Revenue">Revenue</option>
        <option value="Expense">Expense</option>
      </select>
      <select v-model="filterStatus" class="input-glass w-auto text-xs py-1.5">
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading accounts…</div>

    <!-- Account groups -->
    <div v-for="group in filteredGroups" :key="group.type" class="glass-card p-5">
      <div class="flex items-center justify-between mb-4 cursor-pointer" @click="toggleGroup(group.type)">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
               :style="`background: ${group.color}20; color: ${group.color}`">
            {{ group.icon }}
          </div>
          <div>
            <h3 class="font-semibold text-gray-200">{{ group.label }}</h3>
            <p class="text-xs text-gray-500">{{ group.accounts.length }} accounts</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-xs text-gray-500">Net Balance</p>
            <p class="font-bold text-sm" :style="`color: ${group.color}`">
              ৳{{ group.accounts.reduce((s: number, a: any) => s + Number(a.balance ?? 0), 0).toLocaleString() }}
            </p>
          </div>
          <svg class="w-4 h-4 text-gray-600 transition-transform" :class="collapsedGroups.has(group.type) ? '' : 'rotate-180'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      <div v-if="!collapsedGroups.has(group.type)">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Code</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account Name</th>
              <th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Type</th>
              <th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Balance (৳)</th>
              <th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th>
              <th class="pb-2 px-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-for="acc in group.accounts" :key="acc.id" class="hover:bg-white/[0.02]">
              <td class="py-2.5 px-3 font-mono text-gray-500">{{ acc.account_number ?? '—' }}</td>
              <td class="py-2.5 px-3 text-gray-200 font-medium">{{ acc.name }}</td>
              <td class="py-2.5 px-3 text-gray-500">{{ acc.account_type }}</td>
              <td class="py-2.5 px-3 text-right font-mono font-semibold" :style="`color: ${group.color}`">
                {{ Number(acc.balance ?? 0).toLocaleString() }}
              </td>
              <td class="py-2.5 px-3 text-center"><UiStatusBadge :status="acc.status" /></td>
              <td class="py-2.5 px-3 text-right">
                <button class="text-gray-600 hover:text-gold-400 text-xs transition-colors">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const search       = ref('')
const filterType   = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const collapsedGroups = ref(new Set<string>())

function toggleGroup(type: string) {
  if (collapsedGroups.value.has(type)) collapsedGroups.value.delete(type)
  else collapsedGroups.value.add(type)
}

const GROUP_META: Record<string, { icon: string; color: string }> = {
  Asset:     { icon: '🏛', color: '#10b981' },
  Liability: { icon: '📋', color: '#ef4444' },
  Equity:    { icon: '📊', color: '#8b5cf6' },
  Revenue:   { icon: '💰', color: '#f59e0b' },
  Expense:   { icon: '💸', color: '#f97316' },
}

const { data, pending } = await useFetch('/api/accounts/coa', {
  query: computed(() => ({
    search: search.value,
    type:   filterType.value,
    status: filterStatus.value,
  })),
})

const accounts = computed(() => (data.value as any)?.accounts ?? [])

const filteredGroups = computed(() => {
  // Group by account_type_group
  const groups: Record<string, any[]> = {}
  for (const acc of accounts.value) {
    const g = acc.account_type_group ?? 'Other'
    if (!groups[g]) groups[g] = []
    groups[g].push(acc)
  }

  return Object.entries(groups).map(([type, accs]) => ({
    type,
    label: type,
    icon:  GROUP_META[type]?.icon  ?? '📁',
    color: GROUP_META[type]?.color ?? '#6b7280',
    accounts: accs,
  }))
})
</script>
