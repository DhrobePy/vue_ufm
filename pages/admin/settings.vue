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

        <!-- Documents -->
        <div v-if="activeTab === 'documents'" class="space-y-5">
          <div class="glass-card p-6 space-y-6">
            <h3 class="section-title">Document Terms &amp; Conditions</h3>
            <p class="text-xs text-gray-500">Customize the T&amp;C text printed on vouchers. Enter one clause per line — each line becomes a bullet point on the document.</p>

            <!-- Purchase Order T&C -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order T&amp;C</label>
              <p class="text-[11px] text-gray-600">Printed in the Terms &amp; Conditions box of every PO receipt.</p>
              <textarea v-model="docSettings.tc_purchase_order" rows="7"
                class="input-glass resize-y font-mono text-xs leading-relaxed"
                placeholder="One clause per line…" />
            </div>

            <!-- Credit Invoice T&C -->
            <div class="space-y-2">
              <label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credit Sales Invoice T&amp;C</label>
              <p class="text-[11px] text-gray-600">Printed in the Notes &amp; Terms section of every credit sales invoice.</p>
              <textarea v-model="docSettings.tc_credit_invoice" rows="7"
                class="input-glass resize-y font-mono text-xs leading-relaxed"
                placeholder="One clause per line…" />
            </div>

            <div class="flex items-center justify-between pt-2">
              <button @click="resetDocSettings" class="btn-ghost text-xs">Reset to Defaults</button>
              <button @click="saveDocSettings" :disabled="docSaving"
                class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                <svg v-if="docSaving" class="w-3.5 h-3.5 animate-spin inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                {{ docSaving ? 'Saving…' : 'Save Document Settings' }}
              </button>
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

        <!-- ── Maintenance ───────────────────────────────────────────────── -->
        <div v-if="activeTab === 'maintenance'" class="space-y-5">

          <!-- Backfill expense journals -->
          <div class="glass-card p-6 space-y-4">
            <h3 class="section-title">Data Migrations</h3>
            <p class="text-xs text-gray-500">One-time tasks to backfill historical data into new accounting tables. Safe to run multiple times — already-linked records are skipped automatically.</p>

            <div class="border border-white/[0.06] rounded-xl p-5 space-y-4">
              <div>
                <p class="text-sm font-semibold text-gray-200">Backfill Expense Journal Entries</p>
                <p class="text-xs text-gray-500 mt-1">
                  Creates <strong class="text-gray-300">journal_entries</strong> and <strong class="text-gray-300">transaction_lines</strong> for every approved / cancelled-after-approval expense voucher that currently has no GL entry. Cancelled expenses also get a matching reversal entry.
                </p>
              </div>

              <div v-if="seedReport" class="rounded-xl p-4 text-xs space-y-1"
                   :style="seedReport.errors.length ? 'background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2)' : 'background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2)'">
                <p :class="seedReport.errors.length ? 'text-red-300 font-semibold' : 'text-emerald-300 font-semibold'">{{ seedSummary }}</p>
                <p class="text-gray-400">✅ Created: {{ seedReport.created }} &nbsp;·&nbsp; ⏭ Skipped: {{ seedReport.skipped }} &nbsp;·&nbsp; ❌ Errors: {{ seedReport.errors.length }}</p>
                <div v-if="seedReport.errors.length" class="mt-2 space-y-1">
                  <p class="text-red-400 font-semibold">Errors (missing GL account config):</p>
                  <div v-for="e in seedReport.errors" :key="e.id" class="text-red-300 font-mono">
                    {{ e.voucher }}: {{ e.reason }}
                  </div>
                </div>
              </div>

              <button @click="runSeedExpenseJournals" :disabled="seeding"
                class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                <svg v-if="seeding" class="w-3.5 h-3.5 animate-spin inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                {{ seeding ? 'Running backfill…' : '▶ Run Backfill Now' }}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

// ── Document T&C settings ────────────────────────────────────────────────────
const TC_DEFAULTS = {
  tc_purchase_order: [
    'Goods must conform to specified quality standards upon delivery.',
    'Moisture content must not exceed 13% for wheat.',
    'Supplier must provide phytosanitary certificate for imported wheat.',
    'Payment terms as stated above from GRN acceptance.',
    'Any short delivery must be notified before unloading.',
    'Subject to Sirajgonj jurisdiction.',
  ].join('\n'),
  tc_credit_invoice: [
    'Payment due within 30 days of invoice date.',
    'Goods once sold cannot be returned without prior written approval.',
    'Interest @ 2% per month charged on overdue balances.',
    'All disputes subject to Sirajgonj jurisdiction.',
    'This invoice is valid only with authorised company stamp.',
  ].join('\n'),
}

const { data: docData } = await useFetch('/api/settings/documents')
const docSettings = reactive({
  tc_purchase_order: (docData.value as any)?.settings?.tc_purchase_order ?? TC_DEFAULTS.tc_purchase_order,
  tc_credit_invoice: (docData.value as any)?.settings?.tc_credit_invoice ?? TC_DEFAULTS.tc_credit_invoice,
})
const docSaving = ref(false)

function resetDocSettings() {
  docSettings.tc_purchase_order = TC_DEFAULTS.tc_purchase_order
  docSettings.tc_credit_invoice = TC_DEFAULTS.tc_credit_invoice
}

async function saveDocSettings() {
  docSaving.value = true
  try {
    await $fetch('/api/settings/documents', {
      method: 'PUT',
      body: {
        tc_purchase_order: docSettings.tc_purchase_order,
        tc_credit_invoice: docSettings.tc_credit_invoice,
      },
    })
    success('Document T&C settings saved successfully')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to save document settings')
  } finally {
    docSaving.value = false
  }
}

// ── Seed state ───────────────────────────────────────────────────────────────
const seeding    = ref(false)
const seedReport = ref<any>(null)
const seedSummary = ref('')

async function runSeedExpenseJournals() {
  seeding.value = true
  seedReport.value = null
  try {
    const res = await $fetch('/api/admin/seed-expense-journals', { method: 'POST' }) as any
    seedReport.value = res.report
    seedSummary.value = res.summary
    success(res.summary)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Backfill failed')
  } finally {
    seeding.value = false
  }
}

const activeTab = ref('company')

const tabs = [
  { id: 'company',       icon: '🏢', label: 'Company' },
  { id: 'branches',      icon: '📍', label: 'Branches' },
  { id: 'finance',       icon: '💰', label: 'Finance' },
  { id: 'orders',        icon: '📋', label: 'Orders' },
  { id: 'documents',     icon: '📄', label: 'Documents' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'security',      icon: '🔒', label: 'Security' },
  { id: 'maintenance',   icon: '🔧', label: 'Maintenance' },
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
