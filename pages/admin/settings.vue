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
              activeTab !== tab.id && 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]']"
            :style="activeTab === tab.id
              ? 'background:rgb(var(--accent)/0.10);color:var(--accent-from);border:1px solid rgb(var(--accent)/0.20)'
              : ''"
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

        <!-- Appearance -->
        <div v-if="activeTab === 'appearance'" class="space-y-5">
          <div class="glass-card p-6 space-y-6">
            <div>
              <h3 class="section-title">Appearance &amp; Theme</h3>
              <p class="text-xs text-gray-500 mt-1">Personalise the look of your workspace — background, accent colour, and presets.</p>
            </div>

            <!-- Background -->
            <div class="space-y-3">
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Background</p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  v-for="base in themeStore.BASE_THEMES"
                  :key="base.id"
                  @click="themeStore.setBase(base.id)"
                  class="relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left"
                  :style="themeStore.baseId.value === base.id
                    ? 'border-color:var(--accent-from);box-shadow:0 0 0 3px rgb(var(--accent)/0.18)'
                    : 'border-color:transparent'"
                  :class="themeStore.baseId.value !== base.id && 'hover:border-white/20'"
                  style="height:76px">
                  <div class="absolute inset-0"
                       :style="`background: linear-gradient(135deg, ${base.preview[0]} 0%, ${base.bgTo} 100%)`" />
                  <div class="absolute top-0 left-0 bottom-0 w-[28%]"
                       :style="`background: linear-gradient(180deg, ${base.sidebarFrom} 0%, ${base.sidebarTo} 100%); opacity: 0.9`" />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-9 rounded-lg opacity-80"
                       :style="`background: ${base.dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.80)'}; border: 1px solid ${base.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`" />
                  <div class="absolute bottom-2 right-3 text-right">
                    <p class="text-[11px] font-semibold leading-tight"
                       :style="`color: ${base.dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)'}`">
                      {{ base.emoji }} {{ base.name }}
                    </p>
                  </div>
                  <div v-if="themeStore.baseId.value === base.id"
                       class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                       style="background:var(--accent-from)">
                    <svg class="w-3 h-3 text-black" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <!-- Accent Color -->
            <div class="space-y-3">
              <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Accent Color</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="accent in themeStore.ACCENTS"
                  :key="accent.id"
                  @click="themeStore.setAccent(accent.id)"
                  :title="accent.name"
                  class="relative w-9 h-9 rounded-full transition-all duration-200"
                  :style="`background: linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`"
                  :class="themeStore.accentId.value === accent.id
                    ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110'
                    : 'opacity-80 hover:opacity-100 hover:scale-105'">
                  <span v-if="themeStore.accentId.value === accent.id"
                        class="absolute inset-0 flex items-center justify-center">
                    <svg class="w-4 h-4" :style="`color:${accent.btnText}`" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                </button>
                <!-- Custom color picker -->
                <div class="relative">
                  <label :title="`Custom: ${appCustomHex}`"
                         class="relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all"
                         :class="themeStore.accentId.value === 'custom'
                           ? 'ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110'
                           : 'opacity-80 hover:opacity-100 hover:scale-105'"
                         :style="`background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`">
                    <svg v-if="themeStore.accentId.value !== 'custom'" class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.657-6.343l-.707.707M7.05 16.95l-.707.707m12.02 0l-.707-.707M7.05 7.05l-.707-.707"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <input type="color" v-model="appCustomHex"
                           @input="applyAppCustom($event)"
                           @change="applyAppCustom($event)"
                           class="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full" />
                  </label>
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <div class="w-4 h-4 rounded-full shrink-0"
                     style="background: linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)" />
                <span>
                  {{ themeStore.accentId.value === 'custom'
                    ? `Custom ${appCustomHex}`
                    : themeStore.currentAccent.value?.name ?? 'Custom' }}
                </span>
              </div>
            </div>

            <!-- Preview -->
            <div class="rounded-xl p-4 space-y-3"
                 style="background:rgb(var(--tint)/0.04);border:1px solid rgb(var(--tint)/0.08)">
              <p class="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Preview</p>
              <div class="flex gap-2 items-center flex-wrap">
                <button class="btn-gold text-xs px-3 py-1.5">Primary Action</button>
                <button class="btn-ghost text-xs px-3 py-1.5">Secondary</button>
                <span class="nav-item nav-item-active text-xs px-2.5 py-1">Active item</span>
              </div>
              <div class="flex gap-2 items-center">
                <div class="h-1.5 flex-1 rounded-full overflow-hidden" style="background:rgb(var(--tint)/0.08)">
                  <div class="h-full w-[65%] rounded-full" style="background:linear-gradient(90deg,var(--accent-from),var(--accent-to))"/>
                </div>
                <span class="text-[10px] text-gray-500">65%</span>
              </div>
            </div>

            <div class="flex justify-between items-center pt-2">
              <button @click="resetAppearance" class="btn-ghost text-xs">↺ Reset to default</button>
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

        <!-- ── Delivery Verification ────────────────────────────────────── -->
        <div v-if="activeTab === 'delivery'" class="space-y-5">
          <div class="glass-card p-6 space-y-5">
            <div>
              <h3 class="section-title">QR Delivery Verification</h3>
              <p class="text-xs text-gray-500 mt-1">
                Each credit sales invoice gets a unique QR code and 6-digit PIN.
                When scanned, the dispatcher or driver can confirm dispatch / delivery without logging into the ERP.
              </p>
            </div>

            <!-- Toggle: Require Dispatch PIN -->
            <div class="flex items-start justify-between gap-4 py-4 border-t border-white/[0.06]">
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-200">Require Dispatch PIN <span class="text-[10px] font-normal text-emerald-400 ml-1.5">Active</span></p>
                <p class="text-xs text-gray-500 mt-0.5">
                  Dispatcher must scan the invoice QR and enter the 6-digit PIN to mark an order as
                  <span class="text-gray-300 font-mono text-[11px]">dispatched</span>.
                  PIN is printed on the invoice footer and never expires.
                </p>
                <p class="text-xs text-gray-600 mt-1">Status transition: <span class="text-purple-400 font-mono text-[11px]">ready_to_ship → dispatched</span></p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0">
                <input v-model="deliverySettings.require_dispatch_pin" type="checkbox" class="sr-only peer" />
                <div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" />
              </label>
            </div>

            <!-- Final delivery confirmation — authorized staff -->
            <div class="py-4 border-t border-white/[0.06]">
              <p class="text-sm font-semibold text-gray-200">
                Final Delivery Confirmation — Authorized Staff
                <span class="text-[10px] font-normal text-emerald-400 ml-1.5">Active</span>
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                Drivers do not confirm deliveries. When a <span class="text-gray-300 font-mono text-[11px]">dispatched</span>
                order's QR is scanned by a logged-in authorized user, they get a one-tap
                "Confirm Final Delivery" button that records the full delivery, posts the customer
                ledger entry and marks the order <span class="text-gray-300 font-mono text-[11px]">delivered</span>.
              </p>
              <p class="text-xs text-gray-600 mt-1.5 mb-3">
                Admins and superadmins are always authorized. Assign additional users below (e.g. the dispatch manager):
              </p>

              <div class="rounded-xl bg-white/[0.03] border border-white/[0.07] divide-y divide-white/[0.05] max-h-64 overflow-y-auto">
                <label v-for="u in assignableUsers" :key="u.id"
                  class="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/[0.03]">
                  <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-200 truncate">{{ u.display_name }}</p>
                    <p class="text-[10px] text-gray-500 truncate">{{ u.email }} · {{ u.role }}</p>
                  </div>
                  <input type="checkbox" class="accent-amber-500 shrink-0"
                    :checked="deliverySettings.delivery_confirm_user_ids.includes(u.id)"
                    @change="toggleDeliveryUser(u.id)" />
                </label>
                <p v-if="!assignableUsers.length" class="px-4 py-3 text-xs text-gray-500">No other active users found.</p>
              </div>
            </div>

            <!-- How it works (info box) -->
            <div class="rounded-xl p-4 bg-white/[0.03] border border-white/[0.07] space-y-2">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">How it works</p>
              <ol class="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
                <li>Invoice is printed with a QR code and 6-digit PIN in the footer.</li>
                <li>When order is <span class="text-gray-300 font-mono">ready_to_ship</span>, dispatcher scans the QR with any phone camera.</li>
                <li>Public page opens — no login needed. Dispatcher enters the PIN.</li>
                <li>Status updates to <span class="text-gray-300 font-mono">dispatched</span> automatically.</li>
                <li>At handover, an authorized staff member (logged into the ERP on their phone) scans the same QR and taps <span class="text-gray-300">Confirm Final Delivery</span>.</li>
                <li>Full delivery is recorded — ledger, journal entry and balances — and status becomes <span class="text-gray-300 font-mono">delivered</span>.</li>
                <li>QR is rescanable — scanning again shows current status and audit trail.</li>
              </ol>
            </div>

            <div v-if="deliverySaveMsg" class="text-xs" :class="deliverySaveMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'">
              {{ deliverySaveMsg }}
            </div>

            <div class="flex justify-end">
              <button @click="saveDeliverySettings" :disabled="deliverySaving"
                class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                {{ deliverySaving ? 'Saving…' : 'Save Delivery Settings' }}
              </button>
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

// ── Appearance / Theme ───────────────────────────────────────────────────────
const themeStore   = useTheme()
const appCustomHex = ref(themeStore.customHex.value)
watch(() => themeStore.customHex.value, v => { appCustomHex.value = v })

function applyAppCustom(e?: Event) {
  const hex = e ? (e.target as HTMLInputElement).value : appCustomHex.value
  if (hex) {
    appCustomHex.value = hex
    themeStore.setAccent('custom', hex)
  }
}

function resetAppearance() {
  themeStore.setBase('midnight')
  themeStore.setAccent('gold')
  appCustomHex.value = '#f59e0b'
}

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

// ── Delivery verification settings ──────────────────────────────────────────
const { data: deliveryData } = await useFetch('/api/settings/delivery')
const deliverySettings = reactive({
  require_dispatch_pin: (deliveryData.value as any)?.settings?.require_dispatch_pin ?? true,
  delivery_confirm_user_ids: [
    ...((deliveryData.value as any)?.settings?.delivery_confirm_user_ids ?? []),
  ].map(Number) as number[],
})
const deliverySaving  = ref(false)
const deliverySaveMsg = ref('')

// Users assignable as delivery confirmers (admins are always allowed implicitly)
const { data: allUsersData } = await useFetch('/api/admin/users')
const assignableUsers = computed(() =>
  ((allUsersData.value as any)?.users ?? []).filter((u: any) =>
    u.status === 'active' && !['admin', 'superadmin'].includes((u.role ?? '').toLowerCase()),
  ),
)

function toggleDeliveryUser(id: number) {
  const ids = deliverySettings.delivery_confirm_user_ids
  const idx = ids.indexOf(id)
  if (idx >= 0) ids.splice(idx, 1)
  else ids.push(id)
}

async function saveDeliverySettings() {
  deliverySaving.value  = true
  deliverySaveMsg.value = ''
  try {
    await $fetch('/api/settings/delivery', {
      method: 'PUT',
      body: {
        require_dispatch_pin: deliverySettings.require_dispatch_pin,
        delivery_confirm_user_ids: deliverySettings.delivery_confirm_user_ids,
      },
    })
    deliverySaveMsg.value = '✓ Delivery settings saved'
    success('Delivery settings saved')
  } catch (e: any) {
    deliverySaveMsg.value = '✗ ' + (e?.data?.statusMessage ?? 'Failed to save')
    toastError(e?.data?.statusMessage ?? 'Failed to save delivery settings')
  } finally {
    deliverySaving.value = false
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
  { id: 'delivery',      icon: '📦', label: 'Delivery' },
  { id: 'appearance',    icon: '🎨', label: 'Appearance' },
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
