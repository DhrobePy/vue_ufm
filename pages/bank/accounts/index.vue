<template>
  <div class="space-y-6">
    <UiPageHeader title="Bank Accounts" subtitle="All registered company bank accounts"
                  :breadcrumb="['Bank', 'Accounts']">
      <template #actions>
        <button @click="showAddModal = true" class="btn-gold text-xs">+ Add Account</button>
      </template>
    </UiPageHeader>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in 3" :key="i" class="glass-card p-5 h-48 animate-pulse" />
    </div>

    <!-- Account cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="(acc, idx) in accounts" :key="acc.id"
        class="glass-card-hover p-5 space-y-4 cursor-pointer">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                 :style="`background: ${cardColor(idx)}15; border: 1px solid ${cardColor(idx)}30`">
              🏦
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-200">{{ acc.bank_name }}</p>
              <p class="text-xs text-gray-500">{{ acc.branch_name || '—' }}</p>
            </div>
          </div>
          <UiStatusBadge :status="acc.status" />
        </div>

        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between"><span class="text-gray-600">Account No.</span><span class="font-mono text-gray-300">{{ acc.account_number }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Account Type</span><span class="text-gray-400">{{ acc.account_type }}</span></div>
          <div class="flex justify-between"><span class="text-gray-600">Currency</span><span class="text-gray-400">BDT</span></div>
        </div>

        <div class="border-t border-white/[0.06] pt-3">
          <p class="text-xs text-gray-600 mb-0.5">Current Balance</p>
          <p class="text-xl font-bold font-mono" :style="`color: ${cardColor(idx)}`">৳{{ Number(acc.balance ?? 0).toLocaleString() }}</p>
        </div>

        <div class="flex gap-2">
          <NuxtLink to="/bank/transaction/create" class="btn-ghost text-xs flex-1 justify-center">Transact</NuxtLink>
        </div>
      </div>
    </div>

    <!-- ── GL-Linked Accounts ────────────────────────────────────────────── -->
    <div v-if="glAccounts.length" class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="section-title">GL-Linked Accounts</h2>
        <p class="text-xs text-gray-600">Accounts with journal-entry history — click Statement to see full passbook</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(acc, idx) in glAccounts" :key="acc.id"
             class="glass-card p-4 space-y-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                   :style="`background: ${cardColor(idx)}15; border: 1px solid ${cardColor(idx)}30`">
                🏦
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-200">{{ acc.bank_name }}</p>
                <p class="text-xs text-gray-500">{{ acc.account_name }}</p>
              </div>
            </div>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium">GL</span>
          </div>
          <p class="text-xs text-gray-600 font-mono">{{ acc.account_number || '—' }}</p>
          <div class="flex gap-2 pt-1">
            <NuxtLink :to="`/bank/statement?account=${acc.id}`"
                      class="btn-gold text-[11px] py-1.5 px-3 flex-1 text-center">
              📒 View Statement
            </NuxtLink>
          </div>
        </div>
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
                  <option value="Current">Current Account</option>
                  <option value="Savings">Savings Account</option>
                  <option value="Cash">Cash</option>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error } = useToast()

const showAddModal = ref(false)
const saving       = ref(false)

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']
const cardColor = (idx: number) => COLORS[idx % COLORS.length]

// Bank Module accounts (bank_tx_accounts) — manual entry system
const { data, pending, refresh } = await useFetch('/api/bank/dashboard')
const accounts     = computed(() => (data.value as any)?.accounts ?? [])
const totalBalance = computed(() => (data.value as any)?.stats?.total_balance ?? 0)

// GL-linked accounts (bank_accounts) — connected to journal entries / unified statement
const { data: glData } = await useFetch('/api/bank-accounts')
const glAccounts = computed(() =>
  ((glData.value as any)?.accounts ?? []).filter((a: any) => a.chart_of_account_id),
)

const newAccount = reactive({
  bank_name: '',
  account_name: '',
  branch_name: '',
  account_number: '',
  account_type: 'Current',
  opening_balance: 0,
})

async function addAccount() {
  if (!newAccount.bank_name || !newAccount.account_number) return
  saving.value = true
  try {
    await $fetch('/api/bank/accounts', {
      method: 'POST',
      body: { ...newAccount },
    })
    success(`Account "${newAccount.bank_name}" added`)
    showAddModal.value = false
    Object.assign(newAccount, { bank_name: '', account_name: '', branch_name: '', account_number: '', account_type: 'Current', opening_balance: 0 })
    await refresh()
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to add account')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
