<template>
  <div class="space-y-6">
    <UiPageHeader :title="`Edit User — ${user?.display_name ?? '…'}`"
                  :breadcrumb="['Admin', 'Users', user?.display_name ?? '…', 'Edit']">
      <template #actions>
        <NuxtLink to="/admin/users" class="btn-ghost text-xs">← All Users</NuxtLink>
        <NuxtLink :to="`/admin/users/${route.params.id}/permissions`" class="btn-ghost text-xs">🔑 Permissions</NuxtLink>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">
        <div class="glass-card p-6 space-y-5">
          <h3 class="section-title">Account Details</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name *</label>
              <input v-model="form.name" type="text" class="input-glass" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email *</label>
              <input v-model="form.email" type="email" class="input-glass font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role *</label>
              <select v-model="form.role" class="input-glass">
                <optgroup label="System">
                  <option value="Superadmin">Superadmin</option>
                  <option value="admin">Admin</option>
                </optgroup>
                <optgroup label="Accounts">
                  <option value="Accounts">Accounts (All branches)</option>
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
                  <option value="Expense Initiator">Expense Initiator</option>
                  <option value="Expense Approver">Expense Approver</option>
                  <option value="Bank Transaction Initiator">Bank Transaction Initiator</option>
                  <option value="Bank Transaction Approver">Bank Transaction Approver</option>
                </optgroup>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label>
              <select v-model="form.status" class="input-glass">
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label>
              <input v-model="form.phone" type="tel" class="input-glass" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telegram Username</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                <input v-model="form.telegram" type="text" class="input-glass pl-7 font-mono" placeholder="username" />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="relative inline-flex items-center cursor-pointer">
              <input v-model="form.telegramEnabled" type="checkbox" class="sr-only peer" />
              <div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" />
            </label>
            <span class="text-sm text-gray-300">Enable Telegram notifications</span>
          </div>
        </div>

        <!-- Password change -->
        <div class="glass-card p-6 space-y-4">
          <h3 class="section-title">Change Password</h3>
          <p class="text-xs text-gray-500">Leave blank to keep the current password.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Password</label>
              <div class="relative">
                <input v-model="form.newPassword" :type="showPass ? 'text' : 'password'" class="input-glass pr-10" placeholder="Min 8 characters" />
                <button @click="showPass = !showPass" type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  <svg v-if="!showPass" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
              <input v-model="form.confirmPassword" :type="showPass ? 'text' : 'password'" class="input-glass" />
            </div>
          </div>
          <p v-if="form.newPassword && form.newPassword !== form.confirmPassword" class="text-xs text-red-400">Passwords do not match</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button @click="submit" :disabled="!isValid || saving" class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
          <NuxtLink to="/admin/users" class="btn-ghost">Cancel</NuxtLink>
        </div>
      </div>

      <!-- Right panel -->
      <div class="space-y-5">
        <div class="glass-card p-5 space-y-4">
          <h3 class="text-sm font-semibold text-gray-300">User Info</h3>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black shrink-0"
                 style="background: linear-gradient(135deg, #f59e0b, #d97706)">
              {{ (user?.display_name ?? '?').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() }}
            </div>
            <div>
              <p class="text-sm font-bold text-gray-200">{{ user?.display_name ?? '—' }}</p>
              <p class="text-xs text-gray-500 font-mono">{{ user?.role ?? '—' }}</p>
            </div>
          </div>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between"><span class="text-gray-600">User ID</span><span class="font-mono text-gray-400">#{{ route.params.id }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Status</span><UiStatusBadge :status="user?.status ?? 'active'" /></div>
            <div class="flex justify-between"><span class="text-gray-600">Joined</span><span class="text-gray-400">{{ user?.created_at?.slice(0, 10) ?? '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-600">Last Login</span><span class="text-gray-400">{{ user?.last_login ?? '—' }}</span></div>
          </div>
        </div>

        <div class="glass-card p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-300">Danger Zone</h3>
          <button class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"/></svg>
            Suspend this account
          </button>
          <button class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-all">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            Delete this account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error } = useToast()

const userId = Number(route.params.id)

// Load user from API
const { data } = await useFetch(`/api/admin/users/${userId}`)
const user = computed(() => (data.value as any)?.user ?? {})

const form = reactive({
  name:            '',
  email:           '',
  role:            '',
  status:          'active',
  telegram:        '',
  telegramEnabled: false,
  newPassword:     '',
  confirmPassword: '',
})

// Populate form once data loads
watch(user, (u) => {
  if (u?.id) {
    form.name   = u.display_name
    form.email  = u.email
    form.role   = u.role
    form.status = u.status
  }
}, { immediate: true })

const showPass = ref(false)
const saving   = ref(false)

const passwordOk = computed(() =>
  !form.newPassword || (form.newPassword.length >= 8 && form.newPassword === form.confirmPassword)
)

const isValid = computed(() => form.name && form.email && form.role && passwordOk.value)

async function submit() {
  if (!isValid.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: {
        display_name: form.name.trim(),
        email:        form.email.trim(),
        role:         form.role,
        status:       form.status,
        password:     form.newPassword || undefined,
      },
    })
    success(`User ${form.name} updated successfully`)
    navigateTo('/admin/users')
  } catch (e: any) {
    error(e?.data?.statusMessage ?? 'Failed to update user')
  } finally {
    saving.value = false
  }
}
</script>
