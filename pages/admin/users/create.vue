<template>
  <div class="space-y-6">
    <UiPageHeader
      title="Create User"
      subtitle="Add a new system user and assign their role"
      :breadcrumb="['Admin', 'Users', 'Create']"
    >
      <template #actions>
        <NuxtLink to="/admin/users" class="btn-ghost text-xs">← Cancel</NuxtLink>
      </template>
    </UiPageHeader>

    <form @submit.prevent="submit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Identity -->
        <div class="glass-card p-6 space-y-5">
          <h2 class="section-title">Identity</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Full Name *</label>
              <input v-model="form.name" class="input-glass" placeholder="e.g. Accounts Sirajgonj" required />
            </div>
            <div>
              <label class="form-label">Email Address *</label>
              <input v-model="form.email" type="email" class="input-glass" placeholder="user@ujjalfmc.com" required />
            </div>
            <div>
              <label class="form-label">Password *</label>
              <div class="relative">
                <input v-model="form.password" :type="showPass ? 'text' : 'password'"
                  class="input-glass pr-10" placeholder="Min 8 characters" required />
                <button type="button" @click="showPass = !showPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <template v-if="!showPass">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </template>
                    <template v-else>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </template>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label class="form-label">Confirm Password *</label>
              <input v-model="form.confirmPassword" :type="showPass ? 'text' : 'password'"
                class="input-glass" placeholder="Repeat password" required />
              <p v-if="form.confirmPassword && form.password !== form.confirmPassword"
                class="text-xs text-red-400 mt-1">Passwords do not match</p>
            </div>
          </div>
        </div>

        <!-- Role & Branch -->
        <div class="glass-card p-6 space-y-5">
          <h2 class="section-title">Role & Access</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Role *</label>
              <select v-model="form.role" class="input-glass" required>
                <option value="" disabled>Select role…</option>
                <optgroup label="System Admin">
                  <option value="Superadmin">Superadmin</option>
                  <option value="admin">Admin</option>
                </optgroup>
                <optgroup label="Accounts">
                  <option value="Accounts">Accounts (HQ)</option>
                  <option value="accounts-srg">Accounts — Sirajgonj</option>
                  <option value="accounts-demra">Accounts — Demra</option>
                  <option value="accountspos-srg">Accounts POS — Sirajgonj</option>
                  <option value="accountspos-demra">Accounts POS — Demra</option>
                </optgroup>
                <optgroup label="Sales">
                  <option value="sales-srg">Sales — Sirajgonj</option>
                  <option value="sales-demra">Sales — Demra</option>
                  <option value="sales-other">Sales — Other</option>
                </optgroup>
                <optgroup label="Production">
                  <option value="production manager-srg">Production Manager — Sirajgonj</option>
                  <option value="production manager-demra">Production Manager — Demra</option>
                </optgroup>
                <optgroup label="Dispatch">
                  <option value="dispatch-srg">Dispatch — Sirajgonj</option>
                  <option value="dispatch-demra">Dispatch — Demra</option>
                  <option value="dispatchpos-srg">Dispatch POS — Sirajgonj</option>
                  <option value="dispatchpos-demra">Dispatch POS — Demra</option>
                </optgroup>
                <optgroup label="Operations">
                  <option value="collector">Collector</option>
                  <option value="Transport Manager">Transport Manager</option>
                </optgroup>
                <optgroup label="Finance">
                  <option value="Expense Initiator">Expense Initiator</option>
                  <option value="Expense Approver">Expense Approver</option>
                  <option value="Bank Transaction Initiator">Bank Transaction Initiator</option>
                  <option value="Bank Transaction Approver">Bank Transaction Approver</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label class="form-label">Branch</label>
              <select v-model="form.branch" class="input-glass">
                <option value="">All Branches</option>
                <option value="srg">Sirajgonj</option>
                <option value="demra">Demra</option>
              </select>
            </div>
            <div>
              <label class="form-label">Status</label>
              <select v-model="form.status" class="input-glass">
                <option value="active">Active</option>
                <option value="pending">Pending (awaiting activation)</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label class="form-label">Phone (optional)</label>
              <input v-model="form.phone" class="input-glass" placeholder="+880…" />
            </div>
          </div>
        </div>

        <!-- Telegram -->
        <div class="glass-card p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="section-title">Telegram Notifications</h2>
              <p class="text-xs text-gray-600 mt-0.5">Send order status alerts via Telegram bot</p>
            </div>
            <button type="button" @click="form.telegramEnabled = !form.telegramEnabled"
              :class="['relative w-11 h-6 rounded-full transition-all border',
                form.telegramEnabled ? 'bg-gold-500/20 border-gold-500/40' : 'bg-white/[0.05] border-white/[0.08]']">
              <span :class="['absolute top-0.5 w-5 h-5 rounded-full transition-all',
                form.telegramEnabled ? 'left-5 bg-gold-400' : 'left-0.5 bg-gray-600']" />
            </button>
          </div>
          <div v-if="form.telegramEnabled">
            <label class="form-label">Telegram Chat ID</label>
            <input v-model="form.telegramChatId" class="input-glass font-mono" placeholder="e.g. 123456789" />
            <p class="text-[11px] text-gray-600 mt-1">Start a chat with @ujjalfmc_bot to get your chat ID</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Role info card -->
        <div v-if="form.role" class="glass-card p-5">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Role Summary</h3>
          <p class="text-sm font-mono text-gold-400 mb-2">{{ form.role }}</p>
          <p class="text-xs text-gray-500 leading-relaxed">{{ roleDescription }}</p>
        </div>

        <!-- Module defaults notice -->
        <div class="glass-card p-5 border border-blue-500/10">
          <div class="flex gap-3">
            <svg class="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <div>
              <p class="text-xs font-medium text-blue-300 mb-1">Default permissions apply</p>
              <p class="text-[11px] text-gray-500 leading-relaxed">The selected role determines default module access. You can fine-tune permissions after creation from the user's permission page.</p>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="btn-gold w-full justify-center py-3"
          :disabled="submitting || form.password !== form.confirmPassword">
          <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          {{ submitting ? 'Creating…' : 'Create User' }}
        </button>
        <NuxtLink to="/admin/users" class="btn-ghost w-full justify-center text-sm">Cancel</NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const showPass  = ref(false)
const submitting = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  branch: '',
  status: 'active',
  phone: '',
  telegramEnabled: false,
  telegramChatId: '',
})

const roleDescriptions: Record<string, string> = {
  'Superadmin':                    'Full system access — no restrictions. Can create users and modify all settings.',
  'admin':                         'Administrative access. Can manage users, view all modules, adjust settings.',
  'Accounts':                      'HQ-level accounts access across both branches.',
  'accounts-srg':                  'Accounts access restricted to Sirajgonj branch.',
  'accounts-demra':                'Accounts access restricted to Demra branch.',
  'accountspos-srg':               'Combined accounts + POS for Sirajgonj.',
  'accountspos-demra':             'Combined accounts + POS for Demra.',
  'sales-srg':                     'Sales order creation and tracking — Sirajgonj.',
  'sales-demra':                   'Sales order creation and tracking — Demra.',
  'sales-other':                   'Sales access for other/remote locations.',
  'production manager-srg':        'Manages production queue and floor at Sirajgonj.',
  'production manager-demra':      'Manages production queue and floor at Demra.',
  'dispatch-srg':                  'Handles dispatch and delivery — Sirajgonj.',
  'dispatch-demra':                'Handles dispatch and delivery — Demra.',
  'dispatchpos-srg':               'Combined dispatch + POS — Sirajgonj.',
  'dispatchpos-demra':             'Combined dispatch + POS — Demra.',
  'collector':                     'Collects payments from customers in the field.',
  'Transport Manager':             'Manages vehicles, drivers and trip assignments.',
  'Expense Initiator':             'Can create and submit expense requests.',
  'Expense Approver':              'Approves or rejects submitted expenses.',
  'Bank Transaction Initiator':    'Creates bank transfer/transaction entries.',
  'Bank Transaction Approver':     'Reviews and approves bank transactions.',
}

const roleDescription = computed(() => roleDescriptions[form.role] ?? 'Custom role — set permissions manually after creation.')

const { success, error } = useToast()

async function submit() {
  if (form.password !== form.confirmPassword) return
  submitting.value = true
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        display_name:     form.name.trim(),
        email:            form.email.trim(),
        password:         form.password,
        role:             form.role,
        status:           form.status,
        telegram_chat_id: form.telegramEnabled ? form.telegramChatId : null,
      },
    })
    success(`User ${form.name} created successfully`)
    await navigateTo('/admin/users')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to create user')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.form-label { @apply block text-xs font-medium text-gray-400 mb-1.5; }
</style>
