<template>
  <div class="space-y-6">
    <UiPageHeader title="Bank Accounts" subtitle="All registered company bank accounts — one list, GL-linked from creation"
                  :breadcrumb="['Bank', 'Accounts']">
      <template #actions>
        <NuxtLink to="/bank/accounts/types" class="btn-ghost text-xs">Transaction Types</NuxtLink>
        <button @click="showAddModal = true" class="btn-gold text-xs">+ Add Account</button>
      </template>
    </UiPageHeader>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in 3" :key="i" class="glass-card p-5 h-56 animate-pulse" />
    </div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <!-- Account cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="(acc, idx) in accounts" :key="acc.id"
        class="glass-card-hover p-5 space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                 :style="`background: ${cardColor(idx)}15; border: 1px solid ${cardColor(idx)}30`">
              🏦
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-200">{{ acc.bank_name }}</p>
              <p class="text-xs text-gray-500">{{ acc.branch_name || acc.account_name || '—' }}</p>
            </div>
          </div>
          <UiStatusBadge :status="acc.status" />
        </div>

        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between"><span class="text-gray-600">Account No.</span><span class="font-mono text-gray-300">{{ acc.account_number }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Account Type</span><span class="text-gray-400">{{ acc.account_type }}</span></div>
          <div class="flex justify-between">
            <span class="text-gray-600">GL Link</span>
            <span v-if="acc.chart_of_account_id" class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">Linked</span>
            <span v-else class="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">Not linked</span>
          </div>
        </div>

        <div class="border-t border-white/[0.06] pt-3">
          <p class="text-xs text-gray-600 mb-0.5">Current Balance</p>
          <p class="text-xl font-bold font-mono" :style="`color: ${cardColor(idx)}`">৳{{ Number(acc.balance ?? 0).toLocaleString() }}</p>
        </div>

        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/bank/transaction/create" class="btn-ghost text-xs flex-1 justify-center">Transact</NuxtLink>
          <button @click="openEdit(acc)" class="btn-ghost text-xs px-3">Edit</button>
        </div>
        <div class="flex gap-2">
          <NuxtLink :to="`/bank/statement?account=${acc.id}`" class="btn-ghost text-xs flex-1 justify-center">📒 Statement</NuxtLink>
          <NuxtLink v-if="acc.tx_account_id" :to="`/bank/reconciliation?account=${acc.tx_account_id}`" class="btn-ghost text-xs flex-1 justify-center">⚖️ Reconcile</NuxtLink>
        </div>
      </div>

      <div v-if="!accounts.length" class="sm:col-span-2 lg:col-span-3 glass-card p-14 text-center text-gray-500 text-sm">
        No bank accounts yet — add one to get started.
      </div>
    </div>

    <!-- Total balances -->
    <div class="glass-card p-5">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Total Cash + Bank Balance</p>
          <p class="text-3xl font-bold text-gold-400 mt-1">৳{{ totalBalance.toLocaleString() }}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-600">{{ accounts.length }} account{{ accounts.length !== 1 ? 's' : '' }}</p>
          <p class="text-xs text-gray-400">Live from database</p>
        </div>
      </div>
    </div>

    <!-- Add account modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Add Bank Account</h3>
              <button @click="showAddModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <p class="text-xs text-gray-600 -mt-2">Automatically linked to the chart of accounts — ready for journal-entry posting from creation.</p>
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bank Name *</label>
                <input v-model="newAccount.bank_name" type="text" class="input-glass" placeholder="e.g. Islami Bank Bangladesh" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Name</label>
                <input v-model="newAccount.account_name" type="text" class="input-glass" placeholder="e.g. Main Operating Account" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch</label>
                <input v-model="newAccount.branch_name" type="text" class="input-glass" placeholder="e.g. Sirajgonj Branch" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account No. *</label>
                <input v-model="newAccount.account_number" type="text" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Type</label>
                <select v-model="newAccount.account_type" class="input-glass">
                  <option value="Checking">Checking / Current</option>
                  <option value="Savings">Savings</option>
                  <option value="Loan">Loan</option>
                  <option value="Credit">Credit</option>
                  <option value="Other">Other / Cash / MFS</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Opening Balance (৳)</label>
                <input v-model.number="newAccount.opening_balance" type="number" class="input-glass font-mono" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="addAccount" :disabled="saving" class="btn-gold text-xs flex-1">
                {{ saving ? 'Saving…' : 'Add Account' }}
              </button>
              <button @click="showAddModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit account modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-100">Edit Account</h3>
              <button @click="showEditModal = false" class="text-gray-500 hover:text-gray-200">✕</button>
            </div>
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bank Name *</label>
                <input v-model="editForm.bank_name" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Name</label>
                <input v-model="editForm.account_name" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch</label>
                <input v-model="editForm.branch_name" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account No.</label>
                <input v-model="editForm.account_number" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Type</label>
                <select v-model="editForm.account_type" class="input-glass">
                  <option value="Checking">Checking / Current</option>
                  <option value="Savings">Savings</option>
                  <option value="Loan">Loan</option>
                  <option value="Credit">Credit</option>
                  <option value="Other">Other / Cash / MFS</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
                <select v-model="editForm.status" class="input-glass">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="saveEdit" :disabled="saving" class="btn-gold text-xs flex-1">
                {{ saving ? 'Saving…' : 'Save Changes' }}
              </button>
              <button @click="showEditModal = false" class="btn-ghost text-xs">Cancel</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

const showAddModal  = ref(false)
const showEditModal = ref(false)
const saving        = ref(false)
const editingId      = ref<number | null>(null)

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
const cardColor = (idx: number) => COLORS[idx % COLORS.length]

const { data, pending, error, refresh } = await useFetch('/api/bank/accounts')
const accounts     = computed(() => (data.value as any)?.accounts ?? [])
const totalBalance = computed(() => (data.value as any)?.total_balance ?? 0)

const newAccount = reactive({
  bank_name: '', account_name: '', branch_name: '',
  account_number: '', account_type: 'Checking', opening_balance: 0,
})

const editForm = reactive({
  bank_name: '', account_name: '', branch_name: '',
  account_number: '', account_type: 'Checking', status: 'active',
})

function openEdit(acc: any) {
  editingId.value = acc.id
  Object.assign(editForm, {
    bank_name:      acc.bank_name      ?? '',
    account_name:   acc.account_name   ?? '',
    branch_name:    acc.branch_name    ?? '',
    account_number: acc.account_number ?? '',
    account_type:   acc.account_type   ?? 'Checking',
    status:         acc.status         ?? 'active',
  })
  showEditModal.value = true
}

async function addAccount() {
  if (!newAccount.bank_name || !newAccount.account_number) return
  saving.value = true
  try {
    await $fetch('/api/bank/accounts', { method: 'POST', body: { ...newAccount } })
    success(`Account "${newAccount.bank_name}" added`)
    showAddModal.value = false
    Object.assign(newAccount, { bank_name: '', account_name: '', branch_name: '', account_number: '', account_type: 'Checking', opening_balance: 0 })
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to add account')
  } finally {
    saving.value = false
  }
}

async function saveEdit() {
  if (!editingId.value || !editForm.bank_name) return
  saving.value = true
  try {
    await $fetch(`/api/bank/accounts/${editingId.value}`, { method: 'PATCH', body: { ...editForm } })
    success('Account updated')
    showEditModal.value = false
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to update account')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
