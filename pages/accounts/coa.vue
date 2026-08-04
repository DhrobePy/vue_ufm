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
                <button @click="openEdit(acc)" class="text-gray-600 hover:text-gold-400 text-xs transition-colors">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════ ADD / EDIT ACCOUNT MODAL ══════════════ -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
           style="background:rgba(0,0,0,0.7);backdrop-filter:blur(4px)"
           @click.self="closeModal">
        <div class="glass-card p-6 w-full max-w-sm space-y-4" @click.stop>
          <div class="flex items-start justify-between">
            <h3 class="text-sm font-semibold text-gray-200">{{ editingId ? 'Edit Account' : 'New GL Account' }}</h3>
            <button @click="closeModal" class="text-gray-600 hover:text-gray-300 text-lg leading-none">✕</button>
          </div>

          <div class="space-y-3">
            <div>
              <label class="field-label">Account Name *</label>
              <input v-model="form.name" type="text" class="field-input w-full" placeholder="e.g. Office Rent Expense" />
            </div>
            <div>
              <label class="field-label">Account Number</label>
              <input v-model="form.account_number" type="text" class="field-input w-full font-mono" placeholder="e.g. 5010" />
            </div>
            <div v-if="!editingId">
              <label class="field-label">Account Type *</label>
              <select v-model="form.account_type" class="field-input w-full">
                <option value="">Select…</option>
                <optgroup v-for="grp in ACCOUNT_TYPE_GROUPS" :key="grp.label" :label="grp.label">
                  <option v-for="t in grp.types" :key="t" :value="t">{{ t }}</option>
                </optgroup>
              </select>
              <p class="text-[10px] text-gray-600 mt-1">Type cannot be changed after creation (affects posted entries).</p>
            </div>
            <div v-else class="text-xs text-gray-500">
              Type: <span class="text-gray-300">{{ form.account_type }}</span> · Normal balance: {{ form.normal_balance }}
            </div>
            <div>
              <label class="field-label">Description</label>
              <input v-model="form.description" type="text" class="field-input w-full" placeholder="Optional notes" />
            </div>
            <div v-if="editingId">
              <label class="field-label">Status</label>
              <select v-model="form.status" class="field-input w-full">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2 pt-1">
            <button @click="closeModal" class="btn-ghost text-xs flex-1 justify-center">Cancel</button>
            <button @click="saveAccount" :disabled="!form.name || (!editingId && !form.account_type) || saving"
                    class="btn-gold text-xs flex-1 justify-center disabled:opacity-40">
              {{ saving ? 'Saving…' : editingId ? 'Update' : 'Create Account' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const search       = ref('')
const filterType   = ref('')
const filterStatus = ref('')
const showAddModal = ref(false)
const collapsedGroups = ref(new Set<string>())

const ACCOUNT_TYPE_GROUPS = [
  { label: 'Asset',     types: ['Bank', 'Petty Cash', 'Cash', 'Accounts Receivable', 'Other Current Asset', 'Fixed Asset'] },
  { label: 'Liability', types: ['Accounts Payable', 'Credit Card', 'Loan', 'Other Liability'] },
  { label: 'Equity',    types: ['Owner Equity'] },
  { label: 'Revenue',   types: ['Revenue', 'Other Income'] },
  { label: 'Expense',   types: ['Expense', 'Cost of Goods Sold', 'Other Expense'] },
]
function groupForType(type: string): string {
  return ACCOUNT_TYPE_GROUPS.find(g => g.types.includes(type))?.label ?? 'Other'
}

const editingId = ref<number | null>(null)
const saving    = ref(false)
const form = reactive({
  name: '', account_number: '', account_type: '', description: '',
  status: 'active', normal_balance: '',
})

function openEdit(acc: any) {
  editingId.value = acc.id
  Object.assign(form, {
    name: acc.name, account_number: acc.account_number ?? '',
    account_type: acc.account_type, description: acc.description ?? '',
    status: acc.status, normal_balance: acc.normal_balance ?? '',
  })
  showAddModal.value = true
}

function closeModal() {
  showAddModal.value = false
  editingId.value = null
  Object.assign(form, { name: '', account_number: '', account_type: '', description: '', status: 'active', normal_balance: '' })
}

async function saveAccount() {
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/accounts/coa/${editingId.value}`, {
        method: 'PATCH',
        body: {
          name: form.name, account_number: form.account_number || null,
          description: form.description || null, status: form.status,
        },
      })
      success(`Account "${form.name}" updated`)
    } else {
      await $fetch('/api/accounts/coa', {
        method: 'POST',
        body: {
          name: form.name, account_number: form.account_number || null,
          account_type: form.account_type, account_type_group: groupForType(form.account_type),
          description: form.description || null,
        },
      })
      success(`Account "${form.name}" created`)
    }
    closeModal()
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to save account')
  } finally {
    saving.value = false
  }
}

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

const { data, pending, refresh } = await useFetch('/api/accounts/coa', {
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
