<template>
  <div class="space-y-5">
    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading customer…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ (error as any).statusMessage ?? error.message }}</div>

    <template v-else-if="p">
      <!-- Breadcrumb -->
      <p class="text-xs text-gray-600">
        <NuxtLink to="/customers" class="hover:text-gray-300">Customers</NuxtLink> <span class="mx-1">/</span> <span class="text-gray-400">{{ c.name }}</span>
      </p>

      <!-- ── Header: identity + actions (z-20: its dropdown must paint above the KPI cards below) ── -->
      <div class="glass-card p-5 relative z-20">
        <div class="flex flex-wrap items-start gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
               style="background:linear-gradient(135deg,var(--accent-from),var(--accent-to));color:var(--accent-text)">{{ (c.name || '?')[0] }}</div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-lg font-bold text-gray-100 leading-tight">{{ c.name }}</h1>
              <UiStatusBadge :status="c.status" />
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-gray-400">{{ c.customer_type }}</span>
              <span class="text-[11px] text-gray-600 font-mono">ID #{{ c.id }}</span>
            </div>
            <p v-if="c.business_name" class="text-xs text-gray-500 mt-0.5">{{ c.business_name }}</p>
            <div class="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-400">
              <a v-if="c.phone_number" :href="`tel:${c.phone_number}`" class="hover:text-gold-400">📞 {{ c.phone_number }}</a>
              <a v-if="c.email" :href="`mailto:${c.email}`" class="hover:text-gold-400">✉️ {{ c.email }}</a>
              <span v-if="c.business_address">📍 {{ c.business_address }}</span>
              <span v-if="c.created_at" class="text-gray-600">Customer since {{ day(c.created_at) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <NuxtLink v-if="p.can.createOrder && c.status === 'active'" :to="`/credit-sales/create?customer=${c.id}`" class="btn-gold text-xs">+ New Order</NuxtLink>
            <NuxtLink v-if="p.can.collect" :to="`/credit-sales/collect?customer=${c.id}`" class="btn-ghost text-xs">💰 Collect Payment</NuxtLink>
            <button v-if="p.can.collect" class="btn-ghost text-xs" @click="allotOpen = true">🧷 Allot Advance</button>
            <button v-if="perms.canExplicit('credit_sales', 'all', 'refund_customer')" class="btn-ghost text-xs" @click="refundOpen = true">↩️ Refund</button>
            <NuxtLink :to="`/customers/${c.id}/statement`" class="btn-ghost text-xs">🧾 Statement</NuxtLink>
            <NuxtLink v-if="p.can.edit" :to="`/customers/${c.id}/edit`" class="btn-ghost text-xs">✏️ Edit</NuxtLink>

            <!-- More actions -->
            <div class="relative" ref="menuRoot">
              <button class="btn-ghost text-xs" @click="menuOpen = !menuOpen">⋯ More</button>
              <div v-if="menuOpen" class="absolute right-0 mt-1.5 w-60 rounded-xl py-1.5 z-30 text-xs"
                   style="background:rgba(22,18,14,0.98);border:1px solid rgba(255,255,255,0.1);box-shadow:0 12px 40px rgba(0,0,0,0.6)">
                <NuxtLink v-if="can('/credit-sales/ledger')" :to="`/credit-sales/ledger?customer=${c.id}`" class="menu-item" @click="menuOpen = false">📒 Full ledger &amp; adjustments</NuxtLink>
                <NuxtLink v-if="can('/credit-sales/all')" :to="`/credit-sales/all?search=${encodeURIComponent(c.name)}`" class="menu-item" @click="menuOpen = false">📋 Orders in All Sales</NuxtLink>
                <NuxtLink v-if="can('/credit-sales/payments')" :to="`/credit-sales/payments?search=${encodeURIComponent(c.name)}`" class="menu-item" @click="menuOpen = false">💳 Payment history</NuxtLink>
                <NuxtLink v-if="can('/credit-sales/ageing')" to="/credit-sales/ageing" class="menu-item" @click="menuOpen = false">⏳ Ageing report</NuxtLink>
                <button v-if="p.can.creditLimit" class="menu-item" @click="openLimit">🎚️ Change credit limit</button>
                <button class="menu-item" @click="exportLedger">⬇️ Export ledger (CSV)</button>
                <button class="menu-item" @click="printProfile">🖨️ Print profile</button>
                <div v-if="p.can.status || p.can.delete" class="my-1 border-t border-white/[0.07]" />
                <button v-if="p.can.status && c.status !== 'active'" class="menu-item text-emerald-400" @click="openStatus('active')">✅ Reactivate customer</button>
                <button v-if="p.can.status && c.status === 'active'" class="menu-item" @click="openStatus('inactive')">⏸️ Mark inactive</button>
                <button v-if="p.can.status && c.status !== 'blacklisted'" class="menu-item text-red-400" @click="openStatus('blacklisted')">🚫 Blacklist</button>
                <button v-if="p.can.delete" class="menu-item text-red-400" @click="deleteOpen = true; menuOpen = false">🗑️ Delete customer…</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="c.status !== 'active'" class="rounded-xl px-4 py-3 text-xs flex items-center gap-2"
           :class="c.status === 'blacklisted' ? 'bg-red-500/10 border border-red-500/30 text-red-300' : 'bg-gray-500/10 border border-gray-500/25 text-gray-300'">
        <strong>{{ c.status === 'blacklisted' ? '🚫 Blacklisted' : '⏸️ Inactive' }}</strong> — new orders are blocked for this customer.
        <button v-if="p.can.status" class="ml-auto underline" @click="openStatus('active')">Reactivate</button>
      </div>
      <div v-if="credit.limit > 0 && credit.usagePct > 100" class="rounded-xl px-4 py-3 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300">
        ⚠ Over credit limit — exposure ৳{{ money(credit.exposure) }} against a limit of ৳{{ money(credit.limit) }}. New orders will be escalated.
      </div>
      <div v-if="Number(p.ageing.d90) > 0" class="rounded-xl px-4 py-3 text-xs bg-red-500/10 border border-red-500/25 text-red-300">
        ⏰ ৳{{ money(p.ageing.d90) }} is more than 90 days old.
      </div>

      <!-- ── KPI strip ────────────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div class="glass-card p-4">
          <p class="kpi-label">Outstanding</p>
          <p class="kpi-value" :class="credit.outstanding > 0 ? 'text-red-400' : 'text-emerald-400'">৳{{ money(credit.outstanding) }}</p>
          <p class="kpi-sub">per ledger</p>
        </div>
        <div class="glass-card p-4">
          <p class="kpi-label">Credit limit</p>
          <p class="kpi-value text-gray-100">৳{{ money(credit.limit) }}</p>
          <div class="h-1.5 rounded-full bg-white/[0.07] mt-2 overflow-hidden">
            <div class="h-full rounded-full" :style="`width:${Math.min(100, credit.usagePct)}%;background:${credit.usagePct > 100 ? '#ef4444' : credit.usagePct > 80 ? '#f59e0b' : '#10b981'}`" />
          </div>
          <p class="kpi-sub">{{ credit.usagePct > 900 ? 'no limit set' : credit.usagePct + '% used' }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="kpi-label">Available</p>
          <p class="kpi-value text-emerald-400">৳{{ money(credit.available) }}</p>
          <p class="kpi-sub">after open orders</p>
        </div>
        <div class="glass-card p-4">
          <p class="kpi-label">Open orders</p>
          <p class="kpi-value text-sky-400">৳{{ money(credit.pending) }}</p>
          <p class="kpi-sub">{{ stats.open_orders ?? 0 }} not yet invoiced / delivered</p>
        </div>
        <div class="glass-card p-4">
          <p class="kpi-label">Lifetime sales</p>
          <p class="kpi-value text-gray-100">৳{{ money(stats.sales) }}</p>
          <p class="kpi-sub">{{ stats.orders ?? 0 }} orders · avg ৳{{ money(stats.avg_order) }}</p>
        </div>
        <div class="glass-card p-4">
          <p class="kpi-label">Last payment</p>
          <p class="kpi-value text-gray-100">{{ stats.lastPayment ? '৳' + money(stats.lastPayment.amount) : '—' }}</p>
          <p class="kpi-sub">{{ stats.lastPayment ? day(stats.lastPayment.payment_date) : 'none yet' }}</p>
        </div>
      </div>

      <!-- ── Tabs (routed: ?tab=) ─────────────────────────────────────────── -->
      <div class="flex flex-wrap gap-1.5 p-1 rounded-xl w-fit max-w-full" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07)">
        <button v-for="t in tabs" :key="t.id" type="button" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                :class="tab === t.id ? 'btn-gold' : 'text-gray-400 hover:text-gray-100 hover:bg-white/[0.06]'" @click="tab = t.id">
          {{ t.label }}<span v-if="t.n" class="ml-1.5 opacity-70">{{ t.n }}</span>
        </button>
      </div>

      <!-- ═════════════ OVERVIEW ═════════════ -->
      <div v-if="tab === 'overview'" class="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div class="space-y-5 xl:col-span-1">
          <div class="glass-card p-5 space-y-3">
            <h3 class="section-title">Account</h3>
            <dl class="text-xs space-y-2">
              <div class="row"><dt>Type</dt><dd>{{ c.customer_type }}</dd></div>
              <div class="row"><dt>Opening due</dt><dd>৳{{ money(c.initial_due) }}</dd></div>
              <div class="row"><dt>Total invoiced</dt><dd>৳{{ money(ledgerDebit) }}</dd></div>
              <div class="row"><dt>Total received</dt><dd class="text-emerald-400">৳{{ money(ledgerCredit) }}</dd></div>
              <div class="row"><dt>First order</dt><dd>{{ stats.first_order ? day(stats.first_order) : '—' }}</dd></div>
              <div class="row"><dt>Last order</dt><dd>{{ stats.last_order ? day(stats.last_order) : '—' }}</dd></div>
              <div v-if="Math.abs(credit.storedBalance - credit.outstanding) > 1" class="row">
                <dt title="The balance stored on the customer record differs from the ledger — the ledger is the truth">Stored balance</dt>
                <dd class="text-amber-400">৳{{ money(credit.storedBalance) }} ⚠</dd>
              </div>
            </dl>
          </div>

          <div class="glass-card p-5 space-y-3">
            <h3 class="section-title">Receivables by age</h3>
            <div v-for="b in ageBuckets" :key="b.label" class="text-xs">
              <div class="flex justify-between mb-1"><span class="text-gray-500">{{ b.label }}</span><span class="font-mono" :class="b.bad && b.v > 0 ? 'text-red-400' : 'text-gray-300'">৳{{ money(b.v) }}</span></div>
              <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full" :style="`width:${ageTotal ? Math.round(b.v / ageTotal * 100) : 0}%;background:${b.color}`" /></div>
            </div>
            <p v-if="!ageTotal" class="text-[11px] text-gray-600">Nothing overdue on dispatched orders.</p>
          </div>
        </div>

        <div class="space-y-5 xl:col-span-2">
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-3"><h3 class="section-title">Sales — last 12 months</h3><span class="text-[11px] text-gray-600">৳{{ money(monthTotal) }}</span></div>
            <div class="flex items-end gap-1.5 h-32">
              <div v-for="m in months" :key="m.key" class="flex-1 flex flex-col items-center justify-end h-full group" :title="`${m.label}: ৳${money(m.total)} (${m.n} orders)`">
                <div class="w-full rounded-t-md min-h-[2px]" :style="`height:${monthMax ? Math.max(2, Math.round(m.total / monthMax * 100)) : 2}%;background:linear-gradient(180deg,var(--accent-from),var(--accent-to));opacity:${m.total ? 1 : 0.25}`" />
                <span class="text-[9px] text-gray-600 mt-1">{{ m.short }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="glass-card p-5">
              <div class="flex items-center justify-between mb-3"><h3 class="section-title">Recent orders</h3><button class="link" @click="tab = 'orders'">All →</button></div>
              <div v-for="o in p.orders.slice(0, 5)" :key="o.id" class="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0 text-xs">
                <NuxtLink :to="`/credit-sales/${o.id}`" class="font-mono text-gold-400/90 hover:underline">{{ o.order_number }}</NuxtLink>
                <UiStatusBadge :status="o.status" />
                <span class="ml-auto font-mono text-gray-300">৳{{ money(o.total_amount) }}</span>
              </div>
              <p v-if="!p.orders.length" class="text-xs text-gray-600 py-4 text-center">No orders yet</p>
            </div>
            <div class="glass-card p-5">
              <div class="flex items-center justify-between mb-3"><h3 class="section-title">Recent payments</h3><button class="link" @click="tab = 'payments'">All →</button></div>
              <div v-for="pm in p.payments.slice(0, 5)" :key="pm.id" class="flex items-center gap-2 py-2 border-b border-white/[0.04] last:border-0 text-xs">
                <span class="text-gray-500 font-mono">{{ day(pm.payment_date) }}</span>
                <span class="text-gray-400">{{ pm.payment_method || '—' }}</span>
                <span v-if="pm.reversed_at" class="text-[10px] text-red-400">reversed</span>
                <span class="ml-auto font-mono" :class="pm.reversed_at ? 'text-gray-600 line-through' : 'text-emerald-400'">৳{{ money(pm.amount) }}</span>
              </div>
              <p v-if="!p.payments.length" class="text-xs text-gray-600 py-4 text-center">No payments yet</p>
            </div>
          </div>

          <div v-if="openOrders.length" class="glass-card p-5">
            <h3 class="section-title mb-3">Orders with a balance</h3>
            <div v-for="o in openOrders" :key="o.id" class="flex flex-wrap items-center gap-3 py-2 border-b border-white/[0.04] last:border-0 text-xs">
              <NuxtLink :to="`/credit-sales/${o.id}`" class="font-mono text-gold-400/90 hover:underline">{{ o.order_number }}</NuxtLink>
              <UiStatusBadge :status="o.status" />
              <span class="text-gray-600">{{ day(o.order_date) }}</span>
              <span class="ml-auto text-gray-500">balance <strong class="font-mono text-red-400">৳{{ money(o.balance_due) }}</strong></span>
              <NuxtLink v-if="p.can.collect" :to="`/credit-sales/${o.id}/payment`" class="btn-ghost text-[11px] py-1 px-2">Pay</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- ═════════════ ORDERS ═════════════ -->
      <div v-else-if="tab === 'orders'" class="glass-card p-5 space-y-3">
        <div class="flex flex-wrap gap-1.5">
          <button v-for="f in orderFilters" :key="f.id" type="button" class="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  :class="orderFilter === f.id ? 'btn-gold' : 'bg-white/[0.05] text-gray-400 hover:text-gray-100'" @click="orderFilter = f.id">{{ f.label }} <span class="opacity-60">{{ f.n }}</span></button>
        </div>
        <UiDataTable :columns="orderCols" :rows="filteredOrders" :per-page="10" search-placeholder="Search orders…" exportable>
          <template #cell-order_number="{ value, row }"><NuxtLink :to="`/credit-sales/${row.id}`" class="font-mono text-xs text-gold-400/90 hover:underline">{{ value }}</NuxtLink></template>
          <template #cell-order_date="{ value }"><span class="text-xs text-gray-400">{{ day(value) }}</span></template>
          <template #cell-status="{ value }"><UiStatusBadge :status="value" /></template>
          <template #cell-total_amount="{ value }"><span class="font-mono text-xs text-gray-200">৳{{ money(value) }}</span></template>
          <template #cell-amount_paid="{ value }"><span class="font-mono text-xs text-emerald-400">৳{{ money(value) }}</span></template>
          <template #cell-balance_due="{ value }"><span class="font-mono text-xs" :class="Number(value) > 0 ? 'text-red-400' : 'text-gray-600'">৳{{ money(value) }}</span></template>
          <template #actions="{ row }">
            <div class="flex gap-1.5 justify-end">
              <NuxtLink :to="`/credit-sales/${row.id}`" class="btn-ghost text-[11px] py-1 px-2">View</NuxtLink>
              <NuxtLink :to="`/credit-sales/${row.id}/invoice`" class="btn-ghost text-[11px] py-1 px-2">Invoice</NuxtLink>
              <NuxtLink v-if="p.can.collect && Number(row.balance_due) > 0" :to="`/credit-sales/${row.id}/payment`" class="btn-ghost text-[11px] py-1 px-2">Pay</NuxtLink>
            </div>
          </template>
        </UiDataTable>
        <p v-if="p.branchLimited" class="text-[11px] text-gray-600">Showing orders from your branch only.</p>
      </div>

      <!-- ═════════════ LEDGER ═════════════ -->
      <div v-else-if="tab === 'ledger'" class="glass-card p-4 sm:p-5 space-y-3">
        <div v-if="p.review.flagged" class="rounded-xl px-3 py-2.5 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>⚠ <b>{{ p.review.flagged }}</b> line(s) below are flagged for review (net ৳{{ money(p.review.net) }}).</span>
          <span>Balance if they were all deleted: <b class="font-mono">৳{{ money(p.review.balanceWithoutFlagged) }}</b></span>
          <NuxtLink v-if="p.can.reviewLedger" :to="`/credit-sales/ledger-review?customer=${c.id}`" class="underline ml-auto">Open in Ledger Review →</NuxtLink>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="text-xs text-gray-500">Invoiced <strong class="font-mono text-gray-300">৳{{ money(ledgerDebit) }}</strong> · Received <strong class="font-mono text-emerald-400">৳{{ money(ledgerCredit) }}</strong> · Balance <strong class="font-mono" :class="credit.outstanding > 0 ? 'text-red-400' : 'text-emerald-400'">৳{{ money(credit.outstanding) }}</strong></div>
          <span class="flex-1" />
          <NuxtLink :to="`/customers/${c.id}/statement`" class="btn-ghost text-xs">🧾 Statement</NuxtLink>
          <button class="btn-ghost text-xs" @click="exportLedger">⬇️ CSV</button>
          <NuxtLink v-if="can('/credit-sales/ledger')" :to="`/credit-sales/ledger?customer=${c.id}`" class="btn-ghost text-xs">Full ledger →</NuxtLink>
        </div>
        <UiDataTable :columns="ledgerCols" :rows="p.ledger" :per-page="12" search-placeholder="Search ledger…">
          <template #cell-date="{ value }"><span class="text-xs text-gray-400">{{ day(value) }}</span></template>
          <template #cell-type="{ value }"><span class="text-[11px] text-gray-400">{{ String(value).replace(/_/g, ' ') }}</span></template>
          <template #cell-ref="{ value, row }">
            <NuxtLink v-if="row.linked_order_id" :to="`/credit-sales/${row.linked_order_id}`" class="font-mono text-xs text-gold-400/90 hover:underline">{{ value }}</NuxtLink>
            <span v-else class="font-mono text-xs text-gray-400">{{ value }}</span>
          </template>
          <template #cell-description="{ value, row }">
            <span class="text-xs text-gray-300">{{ value }}</span>
            <span v-if="row.review_status === 'review'" class="ml-1.5 inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30" :title="REVIEW_REASONS[row.review_reason]?.hint">⚠ {{ reasonLabel(row.review_reason) }}</span>
            <span v-else-if="row.review_status === 'kept'" class="ml-1.5 text-[10px] text-emerald-500" :title="row.review_note">✓ reviewed</span>
          </template>
          <template #cell-debit="{ value }"><span class="font-mono text-xs">{{ Number(value) ? '৳' + money(value) : '' }}</span></template>
          <template #cell-credit="{ value }"><span class="font-mono text-xs text-emerald-400">{{ Number(value) ? '৳' + money(value) : '' }}</span></template>
          <template #cell-balance="{ value }"><span class="font-mono text-xs text-gray-200">৳{{ money(value) }}</span></template>
          <template v-if="p.can.reviewLedger" #actions="{ row }">
            <div v-if="row.review_status === 'review'" class="flex gap-1 justify-end">
              <button class="btn-ghost text-[11px] py-1 px-2" @click="reviewLine(row, 'keep')">Keep</button>
              <button class="text-[11px] py-1 px-2 rounded-lg text-red-400 hover:bg-red-500/10" @click="reviewLine(row, 'delete')">Delete</button>
            </div>
          </template>
        </UiDataTable>
      </div>

      <!-- ═════════════ PAYMENTS ═════════════ -->
      <div v-else-if="tab === 'payments'" class="glass-card p-5 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <div class="text-xs text-gray-500">{{ stats.payments }} payments · <strong class="font-mono text-emerald-400">৳{{ money(stats.paid) }}</strong> received</div>
          <span class="flex-1" />
          <NuxtLink v-if="p.can.collect" :to="`/credit-sales/collect?customer=${c.id}`" class="btn-gold text-xs">💰 Collect Payment</NuxtLink>
        </div>
        <UiDataTable :columns="payCols" :rows="p.payments" :per-page="10" search-placeholder="Search payments…" exportable>
          <template #cell-payment_date="{ value }"><span class="text-xs text-gray-400">{{ day(value) }}</span></template>
          <template #cell-payment_number="{ value, row }"><span class="font-mono text-xs" :class="row.reversed_at ? 'text-gray-600 line-through' : 'text-gray-300'">{{ value || row.receipt_number || '—' }}</span></template>
          <template #cell-amount="{ value, row }"><span class="font-mono text-xs" :class="row.reversed_at ? 'text-gray-600 line-through' : 'text-emerald-400'">৳{{ money(value) }}</span></template>
          <template #cell-reversed_at="{ value }"><UiStatusBadge :status="value ? 'cancelled' : 'completed'" /></template>
          <template #actions="{ row }"><NuxtLink :to="`/credit-sales/receipt/${row.id}`" class="btn-ghost text-[11px] py-1 px-2">Receipt</NuxtLink></template>
        </UiDataTable>
      </div>

      <!-- ═════════════ RETURNS & AMENDMENTS ═════════════ -->
      <div v-else-if="tab === 'changes'" class="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div class="glass-card p-5">
          <h3 class="section-title mb-3">Returns</h3>
          <div v-for="r in p.returns" :key="r.id" class="flex flex-wrap items-center gap-2 py-2 border-b border-white/[0.04] last:border-0 text-xs">
            <span class="font-mono text-gray-300">{{ r.return_number }}</span>
            <NuxtLink :to="`/credit-sales/${r.order_id}`" class="font-mono text-gold-400/90 hover:underline">{{ r.order_number }}</NuxtLink>
            <UiStatusBadge :status="r.status" />
            <span class="text-gray-600">{{ day(r.return_date) }}</span>
            <span class="ml-auto font-mono text-red-400">−৳{{ money(r.total_returned_amount) }}</span>
          </div>
          <p v-if="!p.returns.length" class="text-xs text-gray-600 py-4 text-center">No returns</p>
        </div>
        <div class="glass-card p-5">
          <h3 class="section-title mb-3">Amendments</h3>
          <div v-for="a in p.amendments" :key="a.id" class="py-2 border-b border-white/[0.04] last:border-0 text-xs">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-gray-300">{{ a.amendment_number }}</span>
              <NuxtLink :to="`/credit-sales/${a.order_id}`" class="font-mono text-gold-400/90 hover:underline">{{ a.order_number }}</NuxtLink>
              <UiStatusBadge :status="a.status" />
              <span class="text-gray-600">{{ a.regime }} · {{ a.amend_type }}</span>
              <span v-if="a.flat_amount" class="ml-auto font-mono" :class="Number(a.flat_amount) > 0 ? 'text-amber-400' : 'text-emerald-400'">{{ Number(a.flat_amount) > 0 ? '+' : '' }}৳{{ money(a.flat_amount) }}</span>
            </div>
            <p v-if="a.description" class="text-gray-600 mt-0.5">{{ a.description }}</p>
          </div>
          <p v-if="!p.amendments.length" class="text-xs text-gray-600 py-4 text-center">No amendments</p>
        </div>
      </div>

      <!-- ═════════════ PRODUCTS ═════════════ -->
      <div v-else-if="tab === 'products'" class="glass-card p-5">
        <h3 class="section-title mb-3">What this customer buys</h3>
        <table class="w-full text-xs">
          <thead><tr class="border-b border-white/[0.06] text-gray-600 uppercase tracking-wider text-[10px]">
            <th class="pb-2 text-left">Product</th><th class="pb-2 text-right">Bags</th><th class="pb-2 text-right">Value</th><th class="pb-2 text-right">Orders</th><th class="pb-2 text-right">Last bought</th></tr></thead>
          <tbody class="divide-y divide-white/[0.04]">
            <tr v-for="(pr, i) in p.products" :key="i">
              <td class="py-2 text-gray-300">{{ pr.product }} <span class="text-gray-600">{{ pr.weight_variant }} {{ pr.grade }}</span></td>
              <td class="py-2 text-right font-mono">{{ money(pr.qty) }}</td>
              <td class="py-2 text-right font-mono text-gray-200">৳{{ money(pr.amount) }}</td>
              <td class="py-2 text-right text-gray-500">{{ pr.orders }}</td>
              <td class="py-2 text-right text-gray-500">{{ day(pr.last_order) }}</td>
            </tr>
            <tr v-if="!p.products.length"><td colspan="5" class="py-6 text-center text-gray-600">No purchases yet</td></tr>
          </tbody>
        </table>
      </div>

      <!-- ═════════════ NOTES ═════════════ -->
      <div v-else-if="tab === 'notes'" class="glass-card p-5 space-y-4 max-w-3xl">
        <form class="space-y-2" @submit.prevent="addNote">
          <textarea v-model="newNote" rows="3" maxlength="2000" class="input-glass w-full resize-none" placeholder="Internal note — call outcome, promise to pay, dispute, special handling…" />
          <div class="flex justify-end"><button class="btn-gold text-xs" :disabled="!newNote.trim() || noteBusy">{{ noteBusy ? 'Saving…' : 'Add note' }}</button></div>
        </form>
        <div v-for="n in p.notes" :key="n.id" class="rounded-xl p-3 text-xs" :class="n.kind === 'status' ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-white/[0.03] border border-white/[0.06]'">
          <div class="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
            <span>{{ n.kind === 'status' ? '🚦 Status change' : '📝' }}</span><span>{{ n.author || 'System' }}</span><span>· {{ stamp(n.created_at) }}</span>
            <button v-if="n.kind !== 'status' && (isAdmin || n.created_by_user_id === me?.id)" class="ml-auto text-gray-600 hover:text-red-400" @click="delNote(n)">delete</button>
          </div>
          <p class="text-gray-300 whitespace-pre-wrap">{{ n.note }}</p>
        </div>
        <p v-if="!p.notes.length" class="text-xs text-gray-600 text-center py-4">No notes yet</p>
      </div>

      <!-- ═════════════ ACTIVITY ═════════════ -->
      <div v-else-if="tab === 'activity'" class="glass-card p-5 max-w-3xl">
        <h3 class="section-title mb-3">Recent activity</h3>
        <div v-for="(a, i) in p.activity" :key="i" class="flex gap-3 py-2.5 border-b border-white/[0.04] last:border-0 text-xs">
          <span class="text-base leading-none mt-0.5">{{ a.icon }}</span>
          <div class="min-w-0">
            <p class="text-gray-300">
              <NuxtLink v-if="a.order_id" :to="`/credit-sales/${a.order_id}`" class="hover:underline">{{ a.title }}</NuxtLink><span v-else>{{ a.title }}</span>
            </p>
            <p v-if="a.detail" class="text-gray-600 truncate">{{ a.detail }}</p>
            <p class="text-[11px] text-gray-600">{{ a.by || 'System' }} · {{ stamp(a.at) }}</p>
          </div>
        </div>
        <p v-if="!p.activity.length" class="text-xs text-gray-600 text-center py-4">No activity yet</p>
      </div>
    </template>

    <!-- ── Dialogs ─────────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="statusDlg.open" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="statusDlg.open = false">
        <form class="glass-card p-6 w-full max-w-md space-y-4" @submit.prevent="saveStatus">
          <h3 class="font-bold text-gray-100">{{ statusDlg.target === 'blacklisted' ? '🚫 Blacklist customer' : statusDlg.target === 'inactive' ? '⏸️ Mark inactive' : '✅ Reactivate customer' }}</h3>
          <p class="text-xs text-gray-500">{{ statusDlg.target === 'active' ? 'New orders will be allowed again.' : 'New orders will be blocked. Existing orders and payments are not affected.' }} The reason is kept permanently in the notes.</p>
          <textarea v-model="statusDlg.reason" rows="3" class="input-glass w-full resize-none" placeholder="Reason (required)" required />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-ghost text-xs" @click="statusDlg.open = false">Cancel</button>
            <button class="text-xs px-4 py-2 rounded-xl font-semibold" :class="statusDlg.target === 'blacklisted' ? 'bg-red-600 text-white' : 'btn-gold'" :disabled="statusDlg.busy">{{ statusDlg.busy ? 'Saving…' : 'Confirm' }}</button>
          </div>
        </form>
      </div>
      <div v-if="limitDlg.open" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="limitDlg.open = false">
        <form class="glass-card p-6 w-full max-w-sm space-y-4" @submit.prevent="saveLimit">
          <h3 class="font-bold text-gray-100">🎚️ Credit limit</h3>
          <p class="text-xs text-gray-500">Current limit ৳{{ money(credit.limit) }}. Exposure (ledger + open orders) is ৳{{ money(credit.exposure) }}.</p>
          <input v-model.number="limitDlg.value" type="number" min="0" step="1000" class="input-glass w-full font-mono" required />
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-ghost text-xs" @click="limitDlg.open = false">Cancel</button>
            <button class="btn-gold text-xs" :disabled="limitDlg.busy">{{ limitDlg.busy ? 'Saving…' : 'Save' }}</button>
          </div>
        </form>
      </div>
      <div v-if="deleteOpen" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" @click.self="deleteOpen = false">
        <div class="glass-card p-6 w-full max-w-md space-y-4">
          <h3 class="font-bold text-red-400">🗑️ Delete {{ c.name }}?</h3>
          <p class="text-xs text-gray-400">This archives the customer with every order, payment and ledger entry to the Recycle Bin (restorable by an admin). It is refused if the ledger balance is not zero.</p>
          <div class="flex justify-end gap-2">
            <button class="btn-ghost text-xs" @click="deleteOpen = false">Cancel</button>
            <button class="text-xs px-4 py-2 rounded-xl font-semibold bg-red-600 text-white" :disabled="busyDelete" @click="doDelete">{{ busyDelete ? 'Deleting…' : 'Delete customer' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
    <AdvanceAllot :open="allotOpen" :customer-id="c.id" @close="allotOpen = false" @done="refresh()" />
    <CustomerRefund :open="refundOpen" :customer-id="c.id" @close="refundOpen = false" @done="refresh()" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const router = useRouter()
const perms = usePermissions()
const { success, error: toastError } = useToast()
const { user: me } = useUserSession()
const isAdmin = computed(() => ['admin', 'superadmin'].includes(String(me.value?.role ?? '').toLowerCase()))
const can = (path: string) => perms.canAccessRoute(path)
const allotOpen = ref(false), refundOpen = ref(false)

const { data, pending, error, refresh } = await useFetch<any>(() => `/api/customers/${route.params.id}/profile`)
const p = computed(() => data.value as any)
const c = computed(() => (p.value?.customer ?? {}) as any)
const credit = computed(() => (p.value?.credit ?? {}) as any)
const stats = computed(() => (p.value?.stats ?? {}) as any)

// ── formatting ───────────────────────────────────────────────────────────────
const money = (v: any) => Number(v ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
const day = (v: any) => {
  const m = String(v ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}
const stamp = (v: any) => String(v ?? '').replace('T', ' ').slice(0, 16)

// ── routed tabs (?tab=) ──────────────────────────────────────────────────────
const tabs = computed(() => [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders', n: p.value?.orders?.length },
  { id: 'ledger', label: 'Ledger' },
  { id: 'payments', label: 'Payments', n: stats.value.payments },
  { id: 'changes', label: 'Returns & Amendments', n: (p.value?.returns?.length ?? 0) + (p.value?.amendments?.length ?? 0) },
  { id: 'products', label: 'Products' },
  { id: 'notes', label: 'Notes', n: p.value?.notes?.length },
  { id: 'activity', label: 'Activity' },
])
const tab = computed({
  get: () => (tabs.value.some(t => t.id === route.query.tab) ? String(route.query.tab) : 'overview'),
  set: (v: string) => router.replace({ query: { ...route.query, tab: v === 'overview' ? undefined : v } }),
})

// ── overview helpers ─────────────────────────────────────────────────────────
const ledgerDebit = computed(() => Number(p.value?.ledgerTotals?.debit ?? 0))
const ledgerCredit = computed(() => Number(p.value?.ledgerTotals?.credit ?? 0))
const ageBuckets = computed(() => [
  { label: '0–30 days', v: Number(p.value?.ageing?.d0 ?? 0), color: '#10b981' },
  { label: '31–60 days', v: Number(p.value?.ageing?.d31 ?? 0), color: '#f59e0b' },
  { label: '61–90 days', v: Number(p.value?.ageing?.d61 ?? 0), color: '#f97316', bad: true },
  { label: 'Over 90 days', v: Number(p.value?.ageing?.d90 ?? 0), color: '#ef4444', bad: true },
])
const ageTotal = computed(() => ageBuckets.value.reduce((s, b) => s + b.v, 0))
const months = computed(() => {
  const by = new Map<string, any>((p.value?.monthly ?? []).map((m: any) => [m.m, m]))
  const out = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    out.push({ key, total: Number(by.get(key)?.total ?? 0), n: Number(by.get(key)?.n ?? 0),
      short: d.toLocaleDateString('en-GB', { month: 'short' }), label: d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) })
  }
  return out
})
const monthMax = computed(() => Math.max(0, ...months.value.map(m => m.total)))
const monthTotal = computed(() => months.value.reduce((s, m) => s + m.total, 0))
const openOrders = computed(() => (p.value?.orders ?? []).filter((o: any) => Number(o.balance_due) > 0 && !['cancelled', 'rejected', 'draft'].includes(o.status)).slice(0, 6))

// ── orders tab ───────────────────────────────────────────────────────────────
const orderFilter = ref('all')
const orderFilters = computed(() => {
  const os = (p.value?.orders ?? []) as any[]
  const n = (f: (o: any) => boolean) => os.filter(f).length
  return [
    { id: 'all', label: 'All', n: os.length },
    { id: 'open', label: 'In progress', n: n(o => !['delivered', 'completed', 'cancelled', 'rejected', 'draft'].includes(o.status)) },
    { id: 'due', label: 'With balance', n: n(o => Number(o.balance_due) > 0 && !['cancelled', 'rejected', 'draft'].includes(o.status)) },
    { id: 'done', label: 'Delivered', n: n(o => ['delivered', 'completed'].includes(o.status)) },
    { id: 'closed', label: 'Cancelled / rejected', n: n(o => ['cancelled', 'rejected'].includes(o.status)) },
  ]
})
const filteredOrders = computed(() => {
  const os = (p.value?.orders ?? []) as any[]
  switch (orderFilter.value) {
    case 'open': return os.filter(o => !['delivered', 'completed', 'cancelled', 'rejected', 'draft'].includes(o.status))
    case 'due': return os.filter(o => Number(o.balance_due) > 0 && !['cancelled', 'rejected', 'draft'].includes(o.status))
    case 'done': return os.filter(o => ['delivered', 'completed'].includes(o.status))
    case 'closed': return os.filter(o => ['cancelled', 'rejected'].includes(o.status))
    default: return os
  }
})
const orderCols = [
  { key: 'order_number', label: 'Order #', sortable: true }, { key: 'order_date', label: 'Date', sortable: true },
  { key: 'status', label: 'Status' }, { key: 'total_amount', label: 'Total', sortable: true },
  { key: 'amount_paid', label: 'Paid' }, { key: 'balance_due', label: 'Balance', sortable: true },
]
const ledgerCols = [
  { key: 'date', label: 'Date', sortable: true }, { key: 'type', label: 'Type' }, { key: 'ref', label: 'Reference' },
  { key: 'description', label: 'Description' }, { key: 'debit', label: 'Debit' }, { key: 'credit', label: 'Credit' }, { key: 'balance', label: 'Balance' },
]
const payCols = [
  { key: 'payment_date', label: 'Date', sortable: true }, { key: 'payment_number', label: 'Payment #' },
  { key: 'payment_method', label: 'Method' }, { key: 'reference_number', label: 'Reference' },
  { key: 'amount', label: 'Amount', sortable: true }, { key: 'collected_by', label: 'Collected by' }, { key: 'reversed_at', label: 'Status' },
]

// ── header menu ──────────────────────────────────────────────────────────────
const menuOpen = ref(false)
const menuRoot = ref<HTMLElement | null>(null)
if (import.meta.client) {
  useEventListener('click', (e: MouseEvent) => { if (menuOpen.value && menuRoot.value && !menuRoot.value.contains(e.target as Node)) menuOpen.value = false })
}

function exportLedger() {
  menuOpen.value = false
  const rows = [['Date', 'Type', 'Reference', 'Description', 'Debit', 'Credit', 'Balance'],
    ...[...(p.value.ledger as any[])].reverse().map(r => [day(r.date), r.type, r.ref, r.description, r.debit, r.credit, r.balance])]
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = `ledger-${String(c.value.name).replace(/\W+/g, '_')}.csv`
  a.click()
}
function printProfile() { menuOpen.value = false; window.print() }

// ── status dialog ────────────────────────────────────────────────────────────
const statusDlg = reactive({ open: false, target: 'inactive', reason: '', busy: false })
function openStatus(target: string) { menuOpen.value = false; Object.assign(statusDlg, { open: true, target, reason: '', busy: false }) }
async function saveStatus() {
  statusDlg.busy = true
  try {
    await $fetch(`/api/customers/${c.value.id}/status`, { method: 'POST', body: { status: statusDlg.target, reason: statusDlg.reason } })
    success('Customer status updated'); statusDlg.open = false; await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not change status') } finally { statusDlg.busy = false }
}

// ── credit limit dialog ──────────────────────────────────────────────────────
const limitDlg = reactive({ open: false, value: 0, busy: false })
function openLimit() { menuOpen.value = false; Object.assign(limitDlg, { open: true, value: Number(credit.value.limit), busy: false }) }
async function saveLimit() {
  limitDlg.busy = true
  try {
    await $fetch('/api/credit-sales/credit-limits', { method: 'PATCH', body: { updates: [{ id: c.value.id, credit_limit: limitDlg.value }] } })
    success('Credit limit updated'); limitDlg.open = false; await refresh()
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not update the limit') } finally { limitDlg.busy = false }
}

// ── ledger review (keep / delete a flagged line) ─────────────────────────────
async function reviewLine(row: any, action: 'keep' | 'delete') {
  let note = ''
  if (action === 'delete') {
    const r = prompt(`Delete this ledger line (৳${money(Number(row.debit) || Number(row.credit))} ${Number(row.credit) ? 'credit' : 'debit'}, ${day(row.date)})?\nIt moves to the Recycle Bin and can be restored.\n\nReason (required):`)
    if (!r || r.trim().length < 3) return
    note = r.trim()
  }
  try { await $fetch('/api/ledger/review', { method: 'POST', body: { ids: [row.id], action, note } }); success(action === 'keep' ? 'Line kept' : 'Line moved to the Recycle Bin'); await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not save the decision') }
}

// ── delete ───────────────────────────────────────────────────────────────────
const deleteOpen = ref(false)
const busyDelete = ref(false)
async function doDelete() {
  busyDelete.value = true
  try { await $fetch(`/api/customers/${c.value.id}`, { method: 'DELETE' }); success('Customer archived to the Recycle Bin'); await navigateTo('/customers') }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not delete'); deleteOpen.value = false } finally { busyDelete.value = false }
}

// ── notes ────────────────────────────────────────────────────────────────────
const newNote = ref('')
const noteBusy = ref(false)
async function addNote() {
  noteBusy.value = true
  try { await $fetch(`/api/customers/${c.value.id}/notes`, { method: 'POST', body: { note: newNote.value } }); newNote.value = ''; await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not save note') } finally { noteBusy.value = false }
}
async function delNote(n: any) {
  if (!confirm('Delete this note?')) return
  try { await $fetch(`/api/customers/${c.value.id}/notes/${n.id}`, { method: 'DELETE' }); await refresh() }
  catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not delete') }
}
</script>

<style scoped>
.kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; color: #6b7280; }
.kpi-value { font-size: 1.15rem; font-weight: 700; font-family: ui-monospace, monospace; margin-top: 2px; }
.kpi-sub { font-size: 10px; color: #6b7280; margin-top: 2px; }
.row { display: flex; justify-content: space-between; gap: 12px; }
.row dt { color: #6b7280; }
.row dd { color: #d1d5db; font-family: ui-monospace, monospace; text-align: right; }
.link { font-size: 11px; color: var(--accent-ink, #f59e0b); }
.menu-item { display: block; width: 100%; text-align: left; padding: 7px 14px; color: #d1d5db; }
.menu-item:hover { background: rgba(255,255,255,0.07); }
@media print { .menu-item { display: none; } }
</style>
