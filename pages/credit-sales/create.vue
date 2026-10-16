<template>
  <div class="max-w-[1400px] mx-auto pb-28 lg:pb-4">
    <!-- Compact header -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
      <NuxtLink to="/credit-sales" class="text-gray-500 hover:text-gray-200 text-sm" title="Back">←</NuxtLink>
      <h1 class="text-lg font-bold text-gray-100">New Credit Order</h1>
      <span class="text-xs text-gray-600">Credit Sales / Create Order</span>
      <span class="flex-1" />
      <span v-if="outcome" class="px-2.5 py-1 rounded-full text-[11px] font-semibold" :class="outcome.cls">{{ outcome.label }}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
      <!-- ═════════ LEFT: the order ═════════ -->
      <div class="space-y-3 min-w-0">

        <!-- Customer + delivery -->
        <section class="glass-card p-3 sm:p-4 space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <!-- searchable customer -->
            <div class="relative" ref="customerComboRef">
              <label class="lbl">Customer *</label>
              <div class="relative">
                <input v-model="customerQuery" type="text" class="ci w-full pr-8" placeholder="Search customer by name, business or phone…" autocomplete="off"
                       @focus="onCustomerFocus" @input="onCustomerInput" />
                <button v-if="form.customerId" type="button" @click="clearCustomer" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300" title="Clear">✕</button>
              </div>
              <div v-if="customerDropdownOpen && filteredCustomers.length" class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl max-h-60 overflow-y-auto py-1"
                   style="background:rgba(18,18,20,0.98);border:1px solid rgba(255,255,255,0.10);box-shadow:0 16px 40px rgba(0,0,0,0.65)">
                <button v-for="c in filteredCustomers" :key="c.id" type="button" class="w-full text-left px-3 py-2 hover:bg-white/[0.07] flex items-baseline gap-2" @mousedown.prevent="selectCustomer(c)">
                  <span class="text-sm text-gray-100 font-medium truncate">{{ c.name }}</span>
                  <span v-if="c.business" class="text-[11px] text-gray-500 truncate">{{ c.business }}</span>
                  <span class="ml-auto text-[10px] text-gray-600 shrink-0">{{ c.phone }}</span>
                </button>
              </div>
              <div v-else-if="customerDropdownOpen && customerQuery.length >= 1" class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl py-3 text-center text-xs text-gray-500"
                   style="background:rgba(18,18,20,0.98);border:1px solid rgba(255,255,255,0.10)">No active credit customer matches “{{ customerQuery }}”</div>
            </div>

            <!-- sale type -->
            <div>
              <label class="lbl">Sale type</label>
              <div class="seg">
                <button type="button" :class="{ on: !form.isOtherSales }" @click="setOtherSales(false)">🌾 Flour</button>
                <button type="button" :class="{ on: form.isOtherSales, em: true }" @click="setOtherSales(true)">📦 Other Sales</button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            <div>
              <label class="lbl">Branch *</label>
              <select v-model="form.branchId" class="ci w-full">
                <option value="">Select…</option>
                <option v-for="b in orderBranches" :key="b.id" :value="String(b.id)">{{ b.branch_type === 'factory' ? '🏭' : '📍' }} {{ b.name }}</option>
              </select>
            </div>
            <div>
              <label class="lbl">Required date</label>
              <input v-model="form.requiredDate" type="date" class="ci w-full" />
            </div>
            <div class="col-span-2 md:col-span-1 xl:col-span-2">
              <label class="lbl">Delivery</label>
              <div class="seg">
                <button type="button" :class="{ on: form.deliveryType === 'big_truck' }" @click="form.deliveryType = 'big_truck'">🚛 Big truck</button>
                <button type="button" :class="{ on: form.deliveryType === 'mini_truck', warn: true }" @click="form.deliveryType = 'mini_truck'">🛻 Mini truck</button>
              </div>
            </div>
            <div>
              <label class="lbl">Priority</label>
              <select v-model="form.priority" class="ci w-full"><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select>
            </div>
            <div v-if="isAdminUser">
              <label class="lbl">Order date <span class="text-amber-500 normal-case">(admin)</span></label>
              <input v-model="form.orderDate" type="date" :max="todayStr" class="ci w-full" />
            </div>
          </div>
          <p v-if="form.deliveryType === 'mini_truck'" class="text-[11px] text-amber-500/90 -mt-1">Mini-truck: the branch’s per-bag surcharge is added automatically when the order is saved.</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label class="lbl">Delivery address</label><textarea v-model="form.shippingAddress" rows="2" class="ci w-full resize-none" placeholder="Where should it go?" /></div>
            <div><label class="lbl">Special instructions</label><textarea v-model="form.notes" rows="2" class="ci w-full resize-none" placeholder="Anything the approver / production / dispatch should know" /></div>
          </div>
        </section>

        <!-- Items -->
        <section class="glass-card p-3 sm:p-4">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="section-title">{{ form.isOtherSales ? 'Commodities' : 'Items' }}</h3>
            <span class="text-[11px] text-gray-600">{{ validItems.length }} line{{ validItems.length === 1 ? '' : 's' }} · {{ totalQty }} {{ form.isOtherSales ? 'units' : 'bags' }}</span>
            <span class="flex-1" />
            <button type="button" class="btn-ghost text-xs py-1 px-2.5" @click="addItem">＋ Add item</button>
          </div>

          <!-- column heads (md+) -->
          <div class="hidden md:grid grid-cols-[minmax(0,1fr)_84px_104px_96px_104px_28px] gap-2 px-1 pb-1 text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
            <span>{{ form.isOtherSales ? 'Commodity / origin' : 'Product variant' }}</span><span class="text-right">Qty</span><span class="text-right">Unit price</span><span class="text-right">Discount</span><span class="text-right">Line total</span><span />
          </div>
          <div class="space-y-1.5 md:max-h-[calc(100vh-520px)] md:min-h-[120px] md:overflow-y-auto md:pr-1">
            <div v-for="(item, idx) in form.items" :key="idx"
                 class="grid grid-cols-3 md:grid-cols-[minmax(0,1fr)_84px_104px_96px_104px_28px] gap-2 items-center rounded-xl p-2 md:p-1.5 border border-white/[0.06] bg-white/[0.02]">
              <div class="col-span-3 md:col-span-1 min-w-0">
                <select v-if="!form.isOtherSales" v-model="item.variantId" class="ci w-full" @change="onVariantChange(item)">
                  <option value="">Select product…</option>
                  <option v-for="v in variants" :key="v.id" :value="v.id">{{ v.name }}</option>
                </select>
                <div v-else class="grid grid-cols-2 gap-2">
                  <select v-model="item.commodityId" class="ci w-full" @change="item.commodityOrigin = ''">
                    <option value="">Commodity…</option>
                    <option v-for="c in tradingCommodities" :key="c.id" :value="String(c.id)" :disabled="!c.ready">{{ c.name }} ({{ c.unit }})</option>
                  </select>
                  <select v-model="item.commodityOrigin" class="ci w-full"><option value="">Origin: any</option><option v-for="o in commodityOrigins(item.commodityId)" :key="o" :value="o">{{ o }}</option></select>
                </div>
              </div>
              <label class="md:contents"><span class="mlbl block md:hidden">Qty</span>
                <input v-model.number="item.quantity" type="number" min="1" inputmode="numeric" class="ci w-full text-right" /></label>
              <label class="md:contents"><span class="mlbl block md:hidden">Unit price</span>
                <input v-model.number="item.unitPrice" type="number" min="0" inputmode="decimal" class="ci w-full text-right" /></label>
              <label class="md:contents"><span class="mlbl block md:hidden">Discount</span>
                <input v-model.number="item.discount" type="number" min="0" inputmode="decimal" class="ci w-full text-right" placeholder="0" /></label>
              <div class="col-span-2 md:col-span-1 text-right font-mono text-sm font-semibold text-gold-400 px-1 md:px-0">৳{{ money(lineTotal(item)) }}</div>
              <button type="button" class="justify-self-end w-7 h-7 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10" title="Remove line" @click="removeItem(idx)">✕</button>
            </div>
            <div v-if="!form.items.length" class="py-6 text-center text-sm text-gray-600">No items yet — click “Add item”.</div>
          </div>
        </section>

        <!-- Advance payment (collapsed unless used) -->
        <section class="glass-card p-3 sm:p-4">
          <label class="flex items-center gap-3 cursor-pointer select-none">
            <input v-model="takeAdvance" type="checkbox" class="sr-only" />
            <span class="relative inline-block w-9 h-5 rounded-full transition-colors" :class="takeAdvance ? 'bg-emerald-500' : 'bg-white/15'"><span class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" :class="takeAdvance ? 'left-[18px]' : 'left-0.5'" /></span>
            <span class="text-sm font-semibold text-gray-200">Customer is paying an advance now</span>
            <span v-if="takeAdvance && (form.advancePaid || 0) > 0" class="ml-auto font-mono text-emerald-400 text-sm">৳{{ money(form.advancePaid) }}</span>
          </label>

          <div v-if="takeAdvance" class="mt-3 space-y-3 rounded-xl p-3" style="background:rgba(16,185,129,0.04);border:1px solid rgba(16,185,129,0.15)">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="col-span-2 md:col-span-1">
                <label class="lbl">Advance (৳) *</label>
                <input v-model.number="form.advancePaid" type="number" min="0" inputmode="decimal" class="ci w-full font-mono" placeholder="0" />
              </div>
              <div class="col-span-2 md:col-span-3">
                <label class="lbl">Method *</label>
                <div class="flex flex-wrap gap-1.5">
                  <button v-for="m in paymentMethods" :key="m.value" type="button"
                          @click="form.advanceMethod = m.value; form.advanceBankAccountId = ''; form.advanceCashAccountId = ''"
                          :class="['px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all', form.advanceMethod === m.value ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'border-white/10 text-gray-500 hover:border-white/20']">{{ m.icon }} {{ m.label }}</button>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div v-if="form.advanceMethod === 'Cash'" class="sm:col-span-2"><label class="lbl">Petty cash account *</label>
                <UiSearchSelect v-model="form.advanceCashAccountId" :options="cashAccountOptions" placeholder="Cash box / account…" /></div>
              <template v-if="['Bank Transfer', 'Cheque', 'Card'].includes(form.advanceMethod)">
                <div><label class="lbl">Bank account *</label><UiSearchSelect v-model="form.advanceBankAccountId" :options="bankAccountOptions" placeholder="Bank / account no…" /></div>
                <div v-if="form.advanceMethod === 'Bank Transfer'"><label class="lbl">Transfer type</label>
                  <select v-model="form.advanceBankTxType" class="ci w-full"><option value="">— select —</option><option v-for="t in ['RTGS', 'BEFTN', 'NPSB', 'Online', 'Deposit']" :key="t" :value="t">{{ t }}</option></select></div>
                <template v-if="form.advanceMethod === 'Cheque'">
                  <div><label class="lbl">Cheque no.</label><input v-model="form.advanceChequeNumber" class="ci w-full font-mono" /></div>
                  <div><label class="lbl">Cheque date</label><input v-model="form.advanceChequeDate" type="date" class="ci w-full" /></div>
                </template>
              </template>
              <div v-if="form.advanceMethod === 'Mobile Banking'" class="sm:col-span-2"><label class="lbl">Transaction reference *</label>
                <input v-model="form.advanceReference" class="ci w-full font-mono" placeholder="e.g. bKash TXN ID" /></div>
              <div v-else><label class="lbl">Reference / receipt no.</label><input v-model="form.advanceReference" class="ci w-full font-mono" placeholder="optional" /></div>
              <div><label class="lbl">Collected by</label><UiSearchSelect v-model="form.advanceCollectedBy" :options="employeeOptions" placeholder="Employee…" /></div>
            </div>
          </div>
        </section>
      </div>

      <!-- ═════════ RIGHT: summary + credit (sticky on desktop) ═════════ -->
      <aside class="space-y-3 lg:sticky lg:top-20">
        <!-- credit standing -->
        <section v-if="selectedCustomer" class="glass-card p-3 sm:p-4 space-y-2"
                 :style="creditUtilPct > 100 ? 'border-color:rgba(239,68,68,0.35)' : ''">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-gray-400 truncate">Credit — {{ selectedCustomer.name }}</span>
            <span class="ml-auto text-[11px] font-bold" :class="creditUtilPct > 100 ? 'text-red-400' : creditUtilPct > 80 ? 'text-orange-400' : 'text-emerald-400'">{{ creditLimit > 0 ? creditUtilPct + '%' : 'no limit' }}</span>
          </div>
          <div class="h-1.5 rounded-full bg-white/[0.07] overflow-hidden"><div class="h-full rounded-full transition-all" :style="`width:${Math.min(creditUtilPct, 100)}%;background:${creditUtilPct > 100 ? '#ef4444' : creditUtilPct > 80 ? '#f97316' : '#10b981'}`" /></div>
          <dl class="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div><dt class="text-gray-600">Limit</dt><dd class="font-mono font-semibold text-gray-200">{{ creditLimit > 0 ? '৳' + money(creditLimit) : '—' }}</dd></div>
            <div><dt class="text-gray-600">Owes (ledger)</dt><dd class="font-mono font-semibold text-orange-300">৳{{ money(creditLedger) }}</dd></div>
            <div><dt class="text-gray-600">Open orders</dt><dd class="font-mono font-semibold text-yellow-300">৳{{ money(customerPendingExposure) }}</dd></div>
            <div><dt class="text-gray-600">Left after this</dt><dd class="font-mono font-bold" :class="creditLeft > 0 || creditLimit <= 0 ? 'text-emerald-300' : 'text-red-400'">{{ creditLimit > 0 ? '৳' + money(creditLeft) : '—' }}</dd></div>
          </dl>
        </section>
        <section v-else class="glass-card p-3 text-xs text-gray-600 text-center">Pick a customer to see their credit position.</section>

        <!-- totals + submit -->
        <section class="glass-card p-3 sm:p-4 space-y-2">
          <div class="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span class="font-mono text-gray-300">৳{{ money(subtotal) }}</span></div>
          <div v-if="totalDiscount > 0" class="flex justify-between text-xs text-gray-500"><span>Discount</span><span class="font-mono text-red-400">−৳{{ money(totalDiscount) }}</span></div>
          <div v-if="form.deliveryType === 'mini_truck'" class="flex justify-between text-xs text-amber-500/80"><span>Mini-truck surcharge</span><span>added on save</span></div>
          <div class="flex justify-between text-sm font-bold text-white border-t border-white/[0.08] pt-2"><span>Order total</span><span class="font-mono text-gold-400">৳{{ money(currentOrderTotal) }}</span></div>
          <div v-if="takeAdvance && (form.advancePaid || 0) > 0" class="flex justify-between text-xs text-gray-500"><span>Advance ({{ form.advanceMethod }})</span><span class="font-mono text-emerald-400">−৳{{ money(form.advancePaid) }}</span></div>
          <div class="flex justify-between text-sm font-bold text-white"><span>Balance due</span><span class="font-mono text-gold-400">৳{{ money(balanceDue) }}</span></div>

          <ul v-if="problems.length" class="text-[11px] text-amber-400/90 space-y-0.5 pt-1">
            <li v-for="p in problems" :key="p">• {{ p }}</li>
          </ul>
          <div class="hidden lg:flex gap-2 pt-1">
            <NuxtLink to="/credit-sales" class="btn-ghost flex-1 justify-center text-sm">Cancel</NuxtLink>
            <button class="btn-gold flex-[2] justify-center text-sm" :disabled="submitting || problems.length > 0" @click="submitOrder">{{ submitting ? 'Submitting…' : '✓ Submit order' }}</button>
          </div>
        </section>
      </aside>
    </div>

    <!-- mobile / tablet action bar -->
    <div class="lg:hidden fixed bottom-0 inset-x-0 z-30 px-3 py-2.5 flex items-center gap-3" style="background:rgba(14,12,10,0.97);border-top:1px solid rgba(255,255,255,0.1);padding-bottom:max(0.625rem,env(safe-area-inset-bottom))">
      <div class="min-w-0">
        <p class="text-[10px] text-gray-500 leading-none">Balance due</p>
        <p class="font-mono font-bold text-gold-400 text-base leading-tight">৳{{ money(balanceDue) }}</p>
      </div>
      <span class="flex-1" />
      <NuxtLink to="/credit-sales" class="btn-ghost text-xs">Cancel</NuxtLink>
      <button class="btn-gold text-sm px-5" :disabled="submitting || problems.length > 0" @click="submitOrder">{{ submitting ? '…' : '✓ Submit' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const { success, error: toastError } = useToast()
const { user: sessionUser } = useUserSession()
const isAdminUser = computed(() => ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase()))
const submitting = ref(false)
const todayStr = new Date().toISOString().slice(0, 10)
const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
const money = (v: any) => Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })

// Branches (factories + sales regions, never offices)
const { data: branchListData } = await useFetch('/api/branches')
const orderBranches = computed(() => (((branchListData.value as any)?.branches ?? []) as any[]).filter(b => b.status === 'active' && b.branch_type !== 'office'))

const blankItem = () => ({ variantId: '', productId: '', commodityId: '', commodityOrigin: '', quantity: 1, unitPrice: 0, discount: 0 })
const form = reactive({
  customerId: '', orderDate: todayStr, requiredDate: tomorrowStr, branchId: '', priority: 'normal', deliveryType: 'big_truck',
  isOtherSales: false, shippingAddress: '', advancePaid: 0, notes: '',
  items: [blankItem()] as any[],
  advanceMethod: 'Cash' as string, advanceBankAccountId: '' as string | number, advanceCashAccountId: '' as string | number,
  advanceReference: '', advanceChequeNumber: '', advanceChequeDate: '', advanceBankTxType: '', advanceCollectedBy: '' as string | number,
})
const takeAdvance = ref(false)
const paymentMethods = [
  { value: 'Cash', icon: '💵', label: 'Cash' }, { value: 'Bank Transfer', icon: '🏦', label: 'Bank transfer' }, { value: 'Cheque', icon: '📄', label: 'Cheque' },
  { value: 'Mobile Banking', icon: '📱', label: 'Mobile banking' }, { value: 'Card', icon: '💳', label: 'Card' },
]

// ── data ──
const [{ data: custData }, { data: bankData }, { data: pettyData }, { data: empData }] = await Promise.all([
  useFetch('/api/customers', { query: { per: 500, simple: '1' } }),
  useFetch('/api/lookup/bank-accounts'), useFetch('/api/lookup/cash-accounts'), useFetch('/api/lookup/employees'),
])
const { data: prodData } = await useFetch('/api/products', { query: computed(() => form.branchId ? { branch_id: form.branchId } : {}) })
const { data: tradingComData } = await useFetch('/api/trading/commodities', { ignoreResponseError: true })
const tradingCommodities = computed<any[]>(() => (tradingComData.value as any)?.commodities ?? [])
const commodityOrigins = (id: string) => tradingCommodities.value.find((c: any) => String(c.id) === String(id))?.origins ?? []

const extraCustomer = ref<any>(null)
const customers = computed(() => {
  const toRow = (c: any) => ({ id: String(c.id), name: c.name, business: c.business_name || '', phone: c.phone_number || '', type: c.customer_type, status: c.status })
  const list = ((custData.value?.customers ?? []) as any[]).map(toRow).filter(c => c.type === 'Credit' && c.status === 'active')
  const x = extraCustomer.value
  return x && !list.some((c: any) => c.id === x.id) ? [...list, x] : list
})
const bankAccountOptions = computed(() => ((bankData.value?.accounts ?? []) as any[]).map(a => ({ value: a.id, label: `${a.bank_name} — AC: ${a.account_number}`, sub: a.branch_name || a.account_name || '' })))
const cashAccountOptions = computed(() => ((pettyData.value?.accounts ?? []) as any[]).map(a => ({ value: a.id, label: a.account_name, sub: a.branch_name || 'Head Office' })))
const employeeOptions = computed(() => ((empData.value?.employees ?? []) as any[]).map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name ?? ''}`.trim() })))

// ── customer combobox ──
const customerQuery = ref('')
const customerDropdownOpen = ref(false)
const customerComboRef = ref<HTMLElement | null>(null)
const selectedCustomer = computed(() => customers.value.find(c => c.id === form.customerId) ?? null)
const filteredCustomers = computed(() => {
  const q = customerQuery.value.toLowerCase().trim()
  const list = customers.value
  return (q ? list.filter(c => c.name.toLowerCase().includes(q) || c.business.toLowerCase().includes(q) || c.phone.includes(q)) : list).slice(0, 25)
})
const label = (c: any) => c.name + (c.business ? ' · ' + c.business : '')
function onCustomerFocus() { customerDropdownOpen.value = true; if (form.customerId) customerQuery.value = '' }
function onCustomerInput() { customerDropdownOpen.value = true; form.customerId = '' }
function selectCustomer(c: any) { form.customerId = c.id; customerQuery.value = label(c); customerDropdownOpen.value = false }
function clearCustomer() { form.customerId = ''; customerQuery.value = ''; customerDropdownOpen.value = true }

// ── credit position (ledger truth + other open orders) ──
const customerPendingExposure = ref(0)
const customerData = ref<{ limit: number; ledger: number } | null>(null)
watch(() => form.customerId, async (id) => {
  customerPendingExposure.value = 0; customerData.value = null
  if (!id) return
  try {
    const r: any = await $fetch(`/api/customers/${id}/credit-exposure`)
    customerPendingExposure.value = Number(r?.pending ?? 0)
    customerData.value = { limit: Number(r?.limit ?? 0), ledger: Number(r?.ledger ?? 0) }
  } catch { /* shows zeros */ }
})
const creditLimit = computed(() => customerData.value?.limit ?? 0)
const creditLedger = computed(() => customerData.value?.ledger ?? 0)

// ── items / totals ──
const variants = computed(() => {
  const list: Array<{ id: string; name: string; productId: string; price: number | null }> = []
  for (const p of (prodData.value?.products ?? []) as any[])
    for (const v of p.variants ?? [])
      list.push({ id: String(v.id), name: `${p.base_name} (${v.weight_variant})${v.grade ? ` [${v.grade}]` : ''}${v.unit_price ? ` · ৳${Number(v.unit_price).toLocaleString()}` : ''}`, productId: String(p.id), price: v.unit_price ? Number(v.unit_price) : null })
  return list
})
function onVariantChange(item: any) {
  const m = variants.value.find(v => v.id === item.variantId)
  if (m) { item.productId = m.productId; if (m.price) item.unitPrice = m.price }
}
watch(prodData, () => { for (const it of form.items) { if (!it.variantId) continue; const m = variants.value.find(v => v.id === it.variantId); if (m?.price) it.unitPrice = m.price } })
const lineTotal = (i: any) => Math.max(0, (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0) - (Number(i.discount) || 0))
const validItems = computed(() => form.items.filter(i => (form.isOtherSales ? i.commodityId : i.variantId) && Number(i.quantity) > 0 && Number(i.unitPrice) >= 0))
const subtotal = computed(() => validItems.value.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0))
const totalDiscount = computed(() => validItems.value.reduce((s, i) => s + (Number(i.discount) || 0), 0))
const totalQty = computed(() => validItems.value.reduce((s, i) => s + (Number(i.quantity) || 0), 0))
const currentOrderTotal = computed(() => subtotal.value - totalDiscount.value)
const advance = computed(() => (takeAdvance.value ? Number(form.advancePaid) || 0 : 0))
const balanceDue = computed(() => Math.max(0, currentOrderTotal.value - advance.value))
const totalExposure = computed(() => creditLedger.value + customerPendingExposure.value + balanceDue.value)
const creditUtilPct = computed(() => (creditLimit.value > 0 ? Math.min(150, Math.round((totalExposure.value / creditLimit.value) * 100)) : 0))
const creditLeft = computed(() => Math.max(0, creditLimit.value - totalExposure.value))
const overLimit = computed(() => creditLimit.value > 0 && totalExposure.value > creditLimit.value)
const outcome = computed(() => {
  if (!selectedCustomer.value || !validItems.value.length) return null
  if (overLimit.value) return { label: 'Over credit limit → will be escalated', cls: 'bg-red-500/15 text-red-300' }
  if (isAdminUser.value) return { label: 'Within limit → auto-approved', cls: 'bg-emerald-500/15 text-emerald-300' }
  return { label: 'Within limit → goes to approval', cls: 'bg-sky-500/15 text-sky-300' }
})
const addItem = () => form.items.push(blankItem())
const removeItem = (i: number) => { form.items.splice(i, 1); if (!form.items.length) addItem() }
function setOtherSales(v: boolean) { if (form.isOtherSales !== v) { form.isOtherSales = v; form.items = [blankItem()] } }

const problems = computed(() => {
  const p: string[] = []
  if (!form.customerId) p.push('Choose a customer')
  if (!form.branchId) p.push('Choose a branch')
  if (!validItems.value.length) p.push('Add at least one item with a quantity')
  if (takeAdvance.value) {
    if (!(advance.value > 0)) p.push('Enter the advance amount')
    else if (advance.value > currentOrderTotal.value + 0.001) p.push('Advance is more than the order total')
    const m = form.advanceMethod
    if (m === 'Cash' && !form.advanceCashAccountId) p.push('Pick the petty cash account')
    if (['Bank Transfer', 'Cheque', 'Card'].includes(m) && !form.advanceBankAccountId) p.push('Pick the bank account')
    if (m === 'Mobile Banking' && !form.advanceReference.trim()) p.push('Enter the transaction reference')
  }
  return p
})

// ── arrive from a customer profile (?customer=ID) ──
onMounted(async () => {
  const pre = String(route.query.customer ?? '')
  if (pre && !form.customerId) {
    let c = customers.value.find(x => x.id === pre)
    if (!c) {
      try {
        const k: any = (await $fetch(`/api/customers/${pre}`) as any)?.customer
        if (k && k.customer_type === 'Credit' && k.status === 'active') { c = { id: String(k.id), name: k.name, business: k.business_name || '', phone: k.phone_number || '', type: k.customer_type, status: k.status }; extraCustomer.value = c }
        else if (k) toastError(`${k.name} cannot be given a credit order (${k.status === 'active' ? k.customer_type + ' customer' : k.status})`)
      } catch { /* pick manually */ }
    }
    if (c) selectCustomer(c)
  }
})

// ── draft autosave ──
const DRAFT_KEY = 'erp_order_draft_v2'
let draftTimer: ReturnType<typeof setInterval>
onMounted(() => {
  if (!route.query.customer) {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const d = JSON.parse(saved)
        Object.assign(form, d.form ?? {}); takeAdvance.value = !!d.takeAdvance
        const c = customers.value.find(x => x.id === form.customerId)
        if (c) customerQuery.value = label(c); else form.customerId = ''
      }
    } catch { /* ignore a corrupt draft */ }
  }
  draftTimer = setInterval(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, takeAdvance: takeAdvance.value })) } catch { /* storage full/blocked */ } }, 15_000)
  const outside = (e: MouseEvent) => {
    if (customerComboRef.value && !customerComboRef.value.contains(e.target as Node)) {
      customerDropdownOpen.value = false
      if (form.customerId && !customerQuery.value) { const c = customers.value.find(x => x.id === form.customerId); if (c) customerQuery.value = label(c) }
    }
  }
  document.addEventListener('mousedown', outside)
  onUnmounted(() => document.removeEventListener('mousedown', outside))
})
onUnmounted(() => clearInterval(draftTimer))

async function submitOrder() {
  if (problems.value.length) return
  submitting.value = true
  try {
    const result = await $fetch('/api/credit-sales', {
      method: 'POST',
      body: {
        customer_id: Number(form.customerId), branch_id: form.branchId ? Number(form.branchId) : null,
        order_date: isAdminUser.value ? form.orderDate : undefined, required_date: form.requiredDate || null, priority: form.priority,
        delivery_address: form.shippingAddress || null, special_notes: form.notes || null, delivery_type: form.deliveryType,
        amount_paid: advance.value,
        advance_payment_method: advance.value > 0 ? form.advanceMethod : undefined,
        advance_bank_account_id: advance.value > 0 ? form.advanceBankAccountId || undefined : undefined,
        advance_cash_account_id: advance.value > 0 ? form.advanceCashAccountId || undefined : undefined,
        advance_reference: advance.value > 0 ? form.advanceReference || undefined : undefined,
        advance_cheque_number: advance.value > 0 ? form.advanceChequeNumber || undefined : undefined,
        advance_cheque_date: advance.value > 0 ? form.advanceChequeDate || undefined : undefined,
        advance_bank_tx_type: advance.value > 0 ? form.advanceBankTxType || undefined : undefined,
        advance_collected_by_employee_id: advance.value > 0 ? form.advanceCollectedBy || undefined : undefined,
        is_other_sales: form.isOtherSales,
        items: validItems.value.map(i => form.isOtherSales
          ? { commodity_id: Number(i.commodityId), commodity_origin: i.commodityOrigin || null, qty_bags: i.quantity, unit_price: i.unitPrice, discount_amount: i.discount || 0 }
          : { product_id: i.productId ? Number(i.productId) : null, variant_id: Number(i.variantId), qty_bags: i.quantity, unit_price: i.unitPrice, discount_amount: i.discount || 0 }),
      },
    }) as any
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    success(result.over_limit ? `Order ${result.order_number} created — ESCALATED (credit limit exceeded)`
      : result.status === 'approved' ? `Order ${result.order_number} created & auto-approved ✓` : `Order ${result.order_number} created, pending approval ✓`)
    navigateTo(`/credit-sales/${result.id}`)
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to create order')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.mlbl { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; margin-bottom: 3px; }
.lbl { display: block; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; margin-bottom: 3px; }
.ci { padding: 0.45rem 0.65rem; font-size: 0.8125rem; border-radius: 0.65rem; background: rgb(var(--tint) / 0.05); border: 1px solid rgb(var(--tint) / 0.1); color: inherit; }
.ci:focus { outline: none; border-color: rgb(var(--accent) / 0.5); box-shadow: 0 0 0 2px rgb(var(--accent) / 0.12); }
.ci option { background: #18181b; color: #e5e7eb; }
.seg { display: flex; border-radius: 0.65rem; overflow: hidden; border: 1px solid rgb(var(--tint) / 0.1); }
.seg button { flex: 1; padding: 0.45rem 0.5rem; font-size: 0.75rem; font-weight: 600; color: #9ca3af; white-space: nowrap; }
.seg button + button { border-left: 1px solid rgb(var(--tint) / 0.1); }
.seg button.on { background: rgba(245,158,11,0.15); color: #fcd34d; }
.seg button.on.em { background: rgba(16,185,129,0.15); color: #6ee7b7; }
.seg button.on.warn { background: rgba(245,158,11,0.2); color: #fbbf24; }
</style>
