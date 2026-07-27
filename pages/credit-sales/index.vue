<template>
  <div class="space-y-6">
    <UiPageHeader title="Credit Sales" subtitle="Order lifecycle · Approval · Dispatch · Collection" :breadcrumb="['Credit Sales']">
      <template #actions>
        <!-- View toggle -->
        <div class="flex rounded-xl overflow-hidden border border-white/[0.08]">
          <button @click="view = 'table'"
                  :class="['px-3 py-1.5 text-xs font-medium transition-all', view==='table' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-500 hover:text-gray-300']">
            ≡ Table
          </button>
          <button @click="view = 'kanban'"
                  :class="['px-3 py-1.5 text-xs font-medium transition-all', view==='kanban' ? 'bg-gold-500/20 text-gold-400' : 'text-gray-500 hover:text-gray-300']">
            ⊞ Kanban
          </button>
        </div>
        <NuxtLink to="/credit-sales/all" class="btn-ghost text-xs">View All</NuxtLink>
        <button @click="openCreate" class="btn-gold text-xs">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          New Order
        </button>
      </template>
    </UiPageHeader>

    <!-- KPIs -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard label="Pending Approval"  :value="String(kpiPending)"    trend="awaiting review"  :trend-up="false" icon="check"   color="yellow" />
      <KpiCard label="In Production"     :value="String(kpiProduction)" :trend="kpiUrgent+' urgent'" :trend-up="false" icon="factory" color="blue" />
      <KpiCard label="Ready to Dispatch" :value="String(kpiReady)"      trend="ready to ship"    trend-up          icon="truck"   color="orange" />
      <KpiCard label="Active Orders"     :value="String(recentOrders.length)" trend="loaded"     trend-up          icon="money"   color="gold" />
    </div>

    <!-- Pipeline counters -->
    <div class="glass-card p-5">
      <h2 class="section-title mb-4">Order Pipeline</h2>
      <div class="grid grid-cols-3 lg:grid-cols-6 gap-3">
        <PipelineColumn v-for="col in pipeline" :key="col.status"
          :label="col.label" :count="col.count" :color="col.color" :route="col.route" />
      </div>
    </div>

    <!-- ── TABLE VIEW ──────────────────────────────────── -->
    <div v-if="view === 'table'" class="space-y-4">
      <!-- Filter bar -->
      <div class="glass-card p-4 flex flex-wrap items-center gap-3">
        <select v-model="tableFilters.status" class="input-glass w-auto text-xs py-1.5 min-w-[140px]">
          <option value="">All Statuses</option>
          <option value="pending_approval">Pending Approval</option>
          <option value="escalated">Escalated</option>
          <option value="approved">Approved</option>
          <option value="in_production">In Production</option>
          <option value="ready_to_ship">Ready to Ship</option>
          <option value="goods_on_board">Goods on Board</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="partial_delivery">Partial Delivery</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="tableFilters.branch" class="input-glass w-auto text-xs py-1.5 min-w-[120px]">
          <option value="">All Branches</option>
          <option value="srg">Sirajgonj</option>
          <option value="demra">Demra</option>
        </select>
        <select v-model="tableFilters.priority" class="input-glass w-auto text-xs py-1.5 min-w-[120px]">
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
        </select>
        <input v-model="tableFilters.dateFrom" type="date" class="input-glass w-auto text-xs py-1.5" />
        <span class="text-gray-600 text-xs">–</span>
        <input v-model="tableFilters.dateTo"   type="date" class="input-glass w-auto text-xs py-1.5" />
        <button @click="resetTableFilters" class="btn-ghost text-xs py-1.5">Reset</button>
        <div class="ml-auto text-xs text-gray-500">
          <span class="font-medium text-gray-300">{{ filteredTableOrders.length }}</span> orders
        </div>
      </div>

      <div class="glass-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">Recent Orders</h2>
          <NuxtLink to="/credit-sales/all" class="text-xs text-gold-500 hover:text-gold-400 font-medium transition-colors">View all →</NuxtLink>
        </div>
        <UiDataTable :columns="cols" :rows="filteredTableOrders" :per-page="8" exportable search-placeholder="Search orders…"
                     @row-click="openEdit">
          <template #cell-orderNo="{ value }">
            <span class="font-mono text-xs text-gold-400/80">{{ value }}</span>
          </template>
          <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-amount="{ value }">
            <span class="font-semibold text-gold-400/90 font-mono">৳{{ Number(value).toLocaleString() }}</span>
          </template>
          <template #cell-priority="{ value }">
            <span :class="['text-xs font-medium', value==='urgent'?'text-red-400':value==='high'?'text-orange-400':'text-gray-600']">{{ value }}</span>
          </template>
          <template #actions="{ row }">
            <div class="flex gap-1">
              <button @click.stop="openEdit(row)" class="btn-ghost text-xs py-1 px-2">Edit</button>
              <NuxtLink :to="`/credit-sales/${row.id}`" class="btn-ghost text-xs py-1 px-2">View</NuxtLink>
            </div>
          </template>
        </UiDataTable>
      </div>
    </div>

    <!-- ── KANBAN VIEW ─────────────────────────────────── -->
    <div v-else class="overflow-x-auto pb-2">
      <div class="flex gap-4" style="min-width: max-content">
        <div v-for="col in kanbanCols" :key="col.status"
             class="w-64 shrink-0 rounded-2xl p-3 space-y-2"
             style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06)">

          <!-- Column header -->
          <div class="flex items-center justify-between px-1 pb-1">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full" :style="`background:${col.color}`" />
              <span class="text-xs font-semibold text-gray-300">{{ col.label }}</span>
            </div>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-gray-400"
                  style="background:rgba(255,255,255,0.06)">{{ col.orders.length }}</span>
          </div>

          <!-- Cards -->
          <div class="space-y-2 max-h-[520px] overflow-y-auto pr-0.5">
            <div v-for="order in col.orders" :key="order.id"
                 class="rounded-xl p-3 cursor-pointer group transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                 style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)"
                 @click="openEdit(order)">
              <!-- Order no + date -->
              <div class="flex items-center justify-between mb-2">
                <span class="font-mono text-[10px] text-gold-400/70">{{ order.orderNo }}</span>
                <span class="text-[10px] text-gray-600">{{ order.date }}</span>
              </div>
              <!-- Customer -->
              <p class="text-xs font-semibold text-gray-200 truncate mb-2">{{ order.customer }}</p>
              <!-- Amount + actions -->
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-gold-400 font-mono">৳{{ (order.amount/1000).toFixed(0) }}K</span>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click.stop="openEdit(order)"
                          class="text-[10px] px-1.5 py-0.5 rounded-lg text-gray-400 hover:text-gold-400 transition-colors"
                          style="background:rgba(255,255,255,0.06)">Edit</button>
                  <NuxtLink :to="`/credit-sales/${order.id}`"
                            class="text-[10px] px-1.5 py-0.5 rounded-lg text-gray-400 hover:text-gold-400 transition-colors"
                            style="background:rgba(255,255,255,0.06)"
                            @click.stop>View</NuxtLink>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="col.orders.length === 0" class="py-6 text-center">
              <p class="text-[10px] text-gray-700">No orders</p>
            </div>
          </div>

          <!-- Add to this column -->
          <button @click="openCreate(col.status)"
                  class="w-full py-2 rounded-xl text-[11px] text-gray-600 hover:text-gold-400 hover:bg-white/[0.04] transition-all border border-dashed border-white/[0.06] hover:border-gold-500/30">
            + Add order
          </button>
        </div>
      </div>
    </div>

    <!-- ── SLIDE-OVER: Create / Edit Order ─────────────── -->
    <UiSlideOver v-model="drawerOpen"
                 :title="editOrder ? `Edit ${editOrder.orderNo}` : 'New Credit Order'"
                 :subtitle="editOrder ? editOrder.customer : 'Create a new credit sales order'">
      <template #header-actions>
        <span v-if="editOrder"
              class="text-[10px] px-2 py-1 rounded-lg font-mono text-gold-400"
              style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2)">
          {{ editOrder.orderNo }}
        </span>
      </template>

      <div class="p-6 space-y-5">
        <!-- Customer & Branch -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5 col-span-2">
            <label class="field-label">Customer *</label>
            <UiSearchSelect v-model="form.customerId" :options="customerOptions" placeholder="Search customer…" />
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Branch *</label>
            <select v-model="form.branch" class="input-glass">
              <option value="srg">Sirajgonj</option>
              <option value="demra">Demra</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Priority</label>
            <select v-model="form.priority" class="input-glass">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Order Date *</label>
            <input v-model="form.orderDate" type="date" class="input-glass" />
          </div>
          <div class="space-y-1.5">
            <label class="field-label">Required Date</label>
            <input v-model="form.requiredDate" type="date" class="input-glass" />
          </div>
        </div>

        <!-- Line Items -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="field-label">Line Items *</label>
            <button @click="addItem" class="text-[11px] text-gold-400 hover:text-gold-300 transition-colors">+ Add item</button>
          </div>
          <div class="space-y-2">
            <div v-for="(item, i) in form.items" :key="i"
                 class="grid grid-cols-12 gap-2 items-center p-3 rounded-xl"
                 style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
              <div class="col-span-5">
                <select v-model="item.product" class="input-glass text-xs py-1.5 w-full">
                  <option value="">— Product —</option>
                  <option v-for="p in products" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="col-span-2">
                <input v-model.number="item.qty" type="number" min="1" placeholder="Qty"
                       class="input-glass text-xs py-1.5 text-right font-mono w-full" />
              </div>
              <div class="col-span-3">
                <div class="relative">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-xs">৳</span>
                  <input v-model.number="item.price" type="number" min="0" placeholder="Price"
                         class="input-glass text-xs py-1.5 pl-5 text-right font-mono w-full" />
                </div>
              </div>
              <div class="col-span-2 flex justify-end">
                <button v-if="form.items.length > 1" @click="removeItem(i)"
                        class="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="rounded-xl p-4 space-y-2 text-sm" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
          <div class="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span class="font-mono">৳{{ subtotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500">Discount</span>
            <div class="flex items-center gap-1">
              <span class="text-gray-600 text-xs">৳</span>
              <input v-model.number="form.discount" type="number" min="0"
                     class="w-24 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-right font-mono text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
            </div>
          </div>
          <div class="flex justify-between font-bold text-base pt-1 border-t border-white/[0.06]">
            <span class="text-gray-300">Total</span>
            <span class="text-gold-400 font-mono">৳{{ orderTotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 text-xs">Advance Payment</span>
            <div class="flex items-center gap-1">
              <span class="text-gray-600 text-xs">৳</span>
              <input v-model.number="form.advance" type="number" min="0"
                     class="w-24 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-right font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
            </div>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-600">Balance Due</span>
            <span class="font-mono text-red-400">৳{{ Math.max(0, orderTotal - form.advance).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-1.5">
          <label class="field-label">Delivery Address / Notes</label>
          <textarea v-model="form.notes" rows="2" class="input-glass resize-none text-xs" placeholder="Delivery address, special instructions…" />
        </div>

        <!-- Status (edit mode only) -->
        <div v-if="editOrder" class="space-y-1.5">
          <label class="field-label">Status</label>
          <select v-model="form.status" class="input-glass">
            <option value="pending_approval">Pending Approval</option>
            <option value="escalated">Escalated</option>
            <option value="approved">Approved</option>
            <option value="in_production">In Production</option>
            <option value="ready_to_ship">Ready to Ship</option>
            <option value="goods_on_board">Goods on Board</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="partial_delivery">Partial Delivery</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center gap-3 px-6 py-4">
          <button @click="saveOrder" :disabled="!formValid || saving"
                  class="btn-gold flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" class="opacity-75"/>
            </svg>
            {{ saving ? 'Saving…' : editOrder ? 'Save Changes' : 'Create Order' }}
          </button>
          <button v-if="editOrder"
                  @click="navigateTo(`/credit-sales/${editOrder.id}`)"
                  class="btn-ghost text-xs">
            Full View →
          </button>
          <button @click="drawerOpen = false" class="btn-ghost text-xs">Cancel</button>
        </div>
      </template>
    </UiSlideOver>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const { success, error: toastError } = useToast()

// ── View toggle ──────────────────────────────────
const view = ref<'table' | 'kanban'>('table')

// ── Live data ────────────────────────────────────
// Load recent orders + customers + products in parallel
const [{ data: ordersData, refresh: refreshOrders }, { data: custData }, { data: prodData }] = await Promise.all([
  useFetch('/api/credit-sales', { query: { per: 50 } }),
  useFetch('/api/customers',    { query: { per: 200 } }),
  useFetch('/api/products'),
])

// Map API orders to template field names
const recentOrders = computed(() =>
  ((ordersData.value?.orders ?? []) as any[]).map((o: any) => ({
    id:       o.id,
    orderNo:  o.order_number,
    customer: o.customer_name,
    date:     String(o.order_date).slice(0, 10),
    amount:   Number(o.total_amount ?? 0),
    status:   o.status,
    branch:   o.branch_id ? String(o.branch_id) : '',
    priority: o.priority ?? 'normal',
  }))
)

// ── Pipeline (counts from loaded orders) ─────────
const PIPELINE_META = [
  { status: 'pending_approval', label: 'Pending',       color: '#eab308', route: '/credit-sales/approve' },
  { status: 'escalated',        label: 'Escalated',     color: '#f97316', route: '/credit-sales/approve' },
  { status: 'approved',         label: 'Approved',      color: '#10b981', route: '/credit-sales/all' },
  { status: 'in_production',    label: 'In Production', color: '#3b82f6', route: '/credit-sales/production' },
  { status: 'ready_to_ship',    label: 'Ready to Ship', color: '#06b6d4', route: '/credit-sales/dispatch' },
  { status: 'goods_on_board',   label: 'Dispatched',    color: '#f97316', route: '/credit-sales/all',
    statuses: ['goods_on_board', 'shipped', 'dispatched'] },
  { status: 'delivered',        label: 'Delivered',     color: '#14b8a6', route: '/credit-sales/all' },
]

const pipeline = computed(() =>
  PIPELINE_META.map(m => ({
    ...m,
    count: recentOrders.value.filter(o => (m.statuses ?? [m.status]).includes(o.status)).length,
  }))
)

// ── KPI computed values ──────────────────────────
const kpiPending    = computed(() => recentOrders.value.filter((o: any) => ['pending_approval','escalated'].includes(o.status)).length)
const kpiProduction = computed(() => recentOrders.value.filter((o: any) => o.status === 'in_production').length)
const kpiReady      = computed(() => recentOrders.value.filter((o: any) => o.status === 'ready_to_ship').length)
const kpiUrgent     = computed(() => recentOrders.value.filter((o: any) => o.priority === 'urgent').length)

// ── Kanban ───────────────────────────────────────
const kanbanCols = computed(() =>
  pipeline.value.map(col => ({
    ...col,
    orders: recentOrders.value.filter((o: any) => o.status === col.status),
  }))
)

// ── Table filters ────────────────────────────────
const tableFilters = reactive({ status: '', branch: '', priority: '', dateFrom: '', dateTo: '' })
function resetTableFilters() { Object.assign(tableFilters, { status: '', branch: '', priority: '', dateFrom: '', dateTo: '' }) }

const filteredTableOrders = computed(() => recentOrders.value.filter((o: any) => {
  if (tableFilters.status   && o.status   !== tableFilters.status)   return false
  if (tableFilters.branch   && o.branch   !== tableFilters.branch)   return false
  if (tableFilters.priority && o.priority !== tableFilters.priority) return false
  if (tableFilters.dateFrom && o.date < tableFilters.dateFrom)       return false
  if (tableFilters.dateTo   && o.date > tableFilters.dateTo)         return false
  return true
}))

// ── Table columns ────────────────────────────────
const cols = [
  { key: 'orderNo',  label: 'Order #',   sortable: true },
  { key: 'customer', label: 'Customer',  sortable: true },
  { key: 'date',     label: 'Date',      sortable: true },
  { key: 'amount',   label: 'Amount',    sortable: true },
  { key: 'priority', label: 'Priority' },
  { key: 'status',   label: 'Status' },
]

// ── Slide-over CRUD ──────────────────────────────
const drawerOpen  = ref(false)
const editOrder   = ref<any | null>(null)
const saving      = ref(false)

// Real customers and products for drawer dropdowns
const customers = computed(() =>
  ((custData.value?.customers ?? []) as any[]).map((c: any) => ({
    id: String(c.id), name: c.name,
  }))
)
const customerOptions = computed(() =>
  ((custData.value?.customers ?? []) as any[]).map((c: any) => ({
    value: String(c.id), label: c.name, sub: c.business_name || c.phone_number || '',
  }))
)
const products = computed(() => {
  const list: string[] = []
  for (const p of (prodData.value?.products ?? []) as any[]) {
    for (const v of p.variants ?? []) {
      list.push(`${p.base_name} ${v.weight_variant ?? ''}`.trim())
    }
  }
  return list
})

const blankForm = () => ({
  customerId:   '' as string,
  branch:       'srg',
  priority:     'normal',
  orderDate:    new Date().toISOString().slice(0, 10),
  requiredDate: '',
  discount:     0,
  advance:      0,
  notes:        '',
  status:       'pending_approval',
  items:        [{ product: '', qty: 1, price: 0 }],
})

const form = reactive(blankForm())

// Keep backward compat: the template uses form.customer for display in openEdit
const formCustomerName = computed(() =>
  customers.value.find(c => c.id === form.customerId)?.name ?? form.customerId
)

function openCreate(defaultStatus = 'pending_approval') {
  editOrder.value = null
  Object.assign(form, blankForm())
  form.status = defaultStatus
  drawerOpen.value = true
}

function openEdit(order: any) {
  editOrder.value = order
  const matchedCust = customers.value.find(c => c.name === order.customer)
  Object.assign(form, {
    customerId:   matchedCust?.id ?? '',
    branch:       order.branch ?? 'srg',
    priority:     order.priority,
    orderDate:    order.date,
    requiredDate: '',
    discount:     0,
    advance:      0,
    notes:        '',
    status:       order.status,
    items:        [{ product: products.value[0] ?? '', qty: 1, price: order.amount }],
  })
  drawerOpen.value = true
}

function addItem()              { form.items.push({ product: '', qty: 1, price: 0 }) }
function removeItem(i: number)  { form.items.splice(i, 1) }

const subtotal   = computed(() => form.items.reduce((s, l) => s + (l.qty * l.price), 0))
const orderTotal = computed(() => Math.max(0, subtotal.value - form.discount))
const formValid  = computed(() => form.customerId && form.items.some(l => l.product && l.qty > 0 && l.price > 0))

async function saveOrder() {
  if (!formValid.value) return
  saving.value = true
  try {
    if (editOrder.value) {
      // Status-only change via workflow API
      if (form.status !== editOrder.value.status) {
        await $fetch(`/api/credit-sales/${editOrder.value.id}/workflow`, {
          method: 'POST',
          body: { to_status: form.status, comments: 'Updated via quick-edit' },
        })
      }
      success(`Order ${editOrder.value.orderNo} updated`)
      await refreshOrders()
    } else {
      // Create new order via API
      const result = await $fetch('/api/credit-sales', {
        method: 'POST',
        body: {
          customer_id:      Number(form.customerId),
          order_date:       form.orderDate,
          required_date:    form.requiredDate || null,
          priority:         form.priority,
          delivery_address: form.notes || null,
          amount_paid:      form.advance || 0,
          items: form.items
            .filter(i => i.product && i.qty > 0)
            .map(i => ({
              variant_id:      null,
              product_id:      null,
              qty_bags:        i.qty,
              unit_price:      i.price,
              discount_amount: 0,
            })),
        },
      }) as any
      success(`Order ${result.order_number} created — pending approval`)
      await refreshOrders()
    }
    drawerOpen.value = false
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to save order')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.field-label {
  @apply text-[11px] font-semibold text-gray-400 uppercase tracking-wider;
}
</style>
