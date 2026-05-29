<template>
  <div class="space-y-6">
    <UiPageHeader title="System Settings" subtitle="Configure ERP preferences, branches, and integrations"
                  :breadcrumb="['Admin', 'Settings']" />

    <div class="flex gap-6 flex-col lg:flex-row">
      <!-- Settings nav -->
      <div class="lg:w-52 shrink-0">
        <div class="glass-card p-2 space-y-0.5">
          <button v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            :class="['w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
              activeTab === tab.id
                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]']"
          >
            <span class="text-base">{{ tab.icon }}</span>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Settings content -->
      <div class="flex-1 space-y-5">

        <!-- Company -->
        <div v-if="activeTab === 'company'" class="space-y-5">
          <div class="glass-card p-6 space-y-5">
            <h3 class="section-title">Company Information</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Name</label>
                <input v-model="company.name" type="text" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trade Name</label>
                <input v-model="company.tradeName" type="text" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration No.</label>
                <input v-model="company.regNo" type="text" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">TIN / BIN</label>
                <input v-model="company.tin" type="text" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5 sm:col-span-2">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Address</label>
                <textarea v-model="company.address" rows="2" class="input-glass resize-none" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label>
                <input v-model="company.phone" type="text" class="input-glass" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                <input v-model="company.email" type="email" class="input-glass" />
              </div>
            </div>
            <div class="flex justify-end">
              <button @click="save('Company info')" class="btn-gold text-xs">Save Changes</button>
            </div>
          </div>
        </div>

        <!-- Branches -->
        <div v-if="activeTab === 'branches'" class="space-y-5">
          <div class="glass-card p-6 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="section-title">Branches</h3>
              <button class="btn-gold text-xs">+ Add Branch</button>
            </div>
            <div class="space-y-3">
              <div v-for="b in branches" :key="b.id"
                class="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div>
                  <p class="text-sm font-semibold text-gray-200">{{ b.name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ b.address }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <UiStatusBadge :status="b.status" />
                  <button class="text-xs text-gray-500 hover:text-gold-400 transition-colors">Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fiscal / Finance -->
        <div v-if="activeTab === 'finance'" class="space-y-5">
          <div class="glass-card p-6 space-y-5">
            <h3 class="section-title">Fiscal Settings</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fiscal Year Start</label>
                <select v-model="finance.fyStart" class="input-glass">
                  <option value="01">January</option>
                  <option value="04">April</option>
                  <option value="07">July (Bangladesh FY)</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Currency</label>
                <select v-model="finance.currency" class="input-glass">
                  <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Credit Limit (৳)</label>
                <input v-model.number="finance.defaultCreditLimit" type="number" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Payment Terms (days)</label>
                <input v-model.number="finance.defaultPaymentTerms" type="number" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">VAT Rate (%)</label>
                <input v-model.number="finance.vatRate" type="number" step="0.5" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Late Payment Penalty (%)</label>
                <input v-model.number="finance.lateRate" type="number" step="0.5" class="input-glass font-mono" />
              </div>
            </div>
            <div class="flex justify-end">
              <button @click="save('Finance settings')" class="btn-gold text-xs">Save Changes</button>
            </div>
          </div>
        </div>

        <!-- Order settings -->
        <div v-if="activeTab === 'orders'" class="space-y-5">
          <div class="glass-card p-6 space-y-5">
            <h3 class="section-title">Order Settings</h3>
            <div class="space-y-4">
              <div v-for="opt in orderOptions" :key="opt.key"
                class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p class="text-sm font-medium text-gray-200">{{ opt.label }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ opt.description }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="opt.value" type="checkbox" class="sr-only peer" />
                  <div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" />
                </label>
              </div>
            </div>
            <div class="flex justify-end">
              <button @click="save('Order settings')" class="btn-gold text-xs">Save Changes</button>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div v-if="activeTab === 'notifications'" class="space-y-5">
          <div class="glass-card p-6 space-y-4">
            <h3 class="section-title">Notification Channels</h3>
            <div class="space-y-4">
              <div v-for="ch in notifChannels" :key="ch.key"
                class="flex items-start justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div class="flex-1 mr-4">
                  <p class="text-sm font-medium text-gray-200">{{ ch.label }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ ch.description }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer mt-0.5">
                  <input v-model="ch.enabled" type="checkbox" class="sr-only peer" />
                  <div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" />
                </label>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telegram Bot Token</label>
              <input v-model="notifSettings.telegramToken" type="password" class="input-glass font-mono" placeholder="bot:xxxx…" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Telegram Chat ID</label>
              <input v-model="notifSettings.adminChatId" type="text" class="input-glass font-mono" placeholder="-100xxxxx" />
            </div>
            <div class="flex justify-end">
              <button @click="save('Notification settings')" class="btn-gold text-xs">Save Changes</button>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div v-if="activeTab === 'security'" class="space-y-5">
          <div class="glass-card p-6 space-y-5">
            <h3 class="section-title">Security & Access</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Session Timeout (minutes)</label>
                <input v-model.number="security.sessionTimeout" type="number" min="5" class="input-glass font-mono" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Login Attempts</label>
                <input v-model.number="security.maxLoginAttempts" type="number" min="3" class="input-glass font-mono" />
              </div>
            </div>
            <div class="space-y-4">
              <div v-for="opt in securityOptions" :key="opt.key"
                class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p class="text-sm font-medium text-gray-200">{{ opt.label }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ opt.description }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="opt.value" type="checkbox" class="sr-only peer" />
                  <div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" />
                </label>
              </div>
            </div>
            <div class="flex justify-end">
              <button @click="save('Security settings')" class="btn-gold text-xs">Save Changes</button>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="glass-card p-6 space-y-4 border border-red-500/20">
            <h3 class="text-sm font-semibold text-red-400">Danger Zone</h3>
            <div class="flex items-center justify-between py-3">
              <div>
                <p class="text-sm font-medium text-gray-200">Clear All Cache</p>
                <p class="text-xs text-gray-500">Flush system cache and session data</p>
              </div>
              <button class="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Clear Cache</button>
            </div>
            <div class="flex items-center justify-between py-3 border-t border-white/[0.04]">
              <div>
                <p class="text-sm font-medium text-gray-200">Export All Data</p>
                <p class="text-xs text-gray-500">Download full database backup as SQL</p>
              </div>
              <button class="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/[0.05] transition-colors">Export</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success } = useToast()

const activeTab = ref('company')

const tabs = [
  { id: 'company',       icon: '🏢', label: 'Company' },
  { id: 'branches',      icon: '📍', label: 'Branches' },
  { id: 'finance',       icon: '💰', label: 'Finance' },
  { id: 'orders',        icon: '📋', label: 'Orders' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'security',      icon: '🔒', label: 'Security' },
]

const company = reactive({
  name: 'Ujjal Flour Mills Company',
  tradeName: 'Ujjal FMC',
  regNo: 'C-XXXXXX/XX',
  tin: '123456789-0101',
  address: 'Sirajgonj Sadar, Sirajgonj-6700, Bangladesh',
  phone: '+880 1711-000000',
  email: 'info@ujjalfmc.com',
})

// Fetch real branches from DB
const { data: branchData } = await useFetch('/api/branches')
const branches = computed(() =>
  ((branchData.value as any)?.branches ?? []).map((b: any) => ({
    id:      b.id,
    name:    b.name,
    code:    b.code ?? '',
    address: b.address ?? '—',
    status:  b.status ?? 'active',
  })),
)

const finance = reactive({
  fyStart: '07',
  currency: 'BDT',
  defaultCreditLimit: 500000,
  defaultPaymentTerms: 30,
  vatRate: 0,
  lateRate: 1.5,
})

const orderOptions = reactive([
  { key: 'auto_approve',    label: 'Auto-approve orders under credit limit', description: 'Orders within limit bypass manual approval', value: false },
  { key: 'require_pod',     label: 'Require Proof of Delivery',              description: 'Driver must upload photo or signature', value: true },
  { key: 'allow_partial',   label: 'Allow partial deliveries',               description: 'Orders can be delivered in multiple trips', value: true },
  { key: 'block_overdue',   label: 'Block orders for overdue customers',     description: 'Prevent new orders if customer has overdue amount', value: true },
])

const notifChannels = reactive([
  { key: 'telegram', label: 'Telegram Notifications', description: 'Send order & payment alerts to Telegram', enabled: true },
  { key: 'email',    label: 'Email Notifications',    description: 'Send daily summaries by email', enabled: false },
])

const notifSettings = reactive({ telegramToken: '', adminChatId: '' })

const security = reactive({ sessionTimeout: 120, maxLoginAttempts: 5 })

const securityOptions = reactive([
  { key: 'force_2fa',     label: 'Require 2FA for Admin roles',   description: 'Superadmin and admin must use two-factor auth', value: false },
  { key: 'ip_whitelist',  label: 'IP Whitelist (office only)',     description: 'Restrict login to known office IPs', value: false },
  { key: 'audit_all',     label: 'Log all page views',            description: 'Include read actions in audit trail', value: false },
])

function save(section: string) {
  success(`${section} saved successfully`)
}
</script>
