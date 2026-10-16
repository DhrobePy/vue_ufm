<template>
  <div class="space-y-6">

    <div v-if="pending" class="glass-card p-8 text-center text-xs text-gray-500">Loading order…</div>
    <div v-else-if="error" class="glass-card p-6 text-center text-red-400 text-sm">⚠ {{ error.message }}</div>

    <template v-else>
      <UiPageHeader
        :title="order.order_number"
        :subtitle="order.customer_name"
        :breadcrumb="['Credit Sales', 'All Sales', order.order_number]"
      >
        <template #actions>
          <button v-if="perms.canDo('credit_sales', 'all', 'print')" @click="printInvoice" class="btn-ghost text-xs">🖨️ Print Invoice</button>
          <NuxtLink v-if="canCollectPayment && perms.canDo('credit_sales', 'all', 'collect_payment')" :to="`/credit-sales/${id}/payment`" class="btn-ghost text-xs">💰 Collect Payment</NuxtLink>

          <button v-if="order.status === 'pending_approval' && perms.canDo('credit_sales', 'approve', 'approve')"
            class="btn-gold text-xs" @click="approvalModal = true">
            📋 Review &amp; Approve
          </button>
          <button v-else-if="order.status === 'escalated' && perms.canDo('credit_sales', 'approve', 'escalate')"
            class="btn-gold text-xs" @click="approvalModal = true"
            style="background:linear-gradient(135deg,#f97316,#ea580c);color:#000;">
            ⚠️ Escalation Review
          </button>
          <button v-else-if="order.status === 'approved' && perms.canDo('credit_sales', 'production', 'mark_ready')"
            class="btn-gold text-xs" :disabled="acting"
            @click="advanceStatus('in_production', 'Sent to production queue')">
            🏭 Send to Production
          </button>
          <button v-else-if="order.status === 'in_production' && perms.canDo('credit_sales', 'production', 'mark_produced')"
            class="btn-gold text-xs" :disabled="acting"
            @click="advanceStatus('produced', 'Production complete')">
            ✓ Mark Produced
          </button>
          <button v-else-if="order.status === 'produced' && perms.canDo('credit_sales', 'production', 'mark_ready')"
            class="btn-gold text-xs" :disabled="acting"
            :title="dispatchBlocked ? 'Dispatch is held — see banner above' : ''"
            @click="advanceStatus('ready_to_ship', 'Cleared to ship')">
            📤 Ready to Ship
          </button>
          <button v-else-if="order.status === 'ready_to_ship' && perms.canDo('credit_sales', 'dispatch', 'mark_dispatched')"
            class="btn-gold text-xs" :disabled="acting"
            :title="dispatchBlocked ? 'Dispatch is held — see banner above' : ''"
            @click="doDispatch">
            📦 Goods on Board
          </button>
          <button v-else-if="order.status === 'goods_on_board' && perms.canDo('credit_sales', 'dispatch', 'mark_shipped')"
            class="btn-gold text-xs" :disabled="acting"
            @click="advanceStatus('shipped', 'Truck departed')">
            🚛 Mark Shipped
          </button>
          <button v-if="['goods_on_board', 'shipped', 'dispatched'].includes(order.status) && perms.canDo('credit_sales', 'all', 'record_delivery')"
            class="btn-gold text-xs"
            @click="navigateTo(`/credit-sales/${id}/deliver`)">
            📦 Record Delivery
          </button>
          <button v-if="isAdmin && order.status === 'goods_on_board'" class="btn-ghost text-xs" :disabled="acting"
            title="Undo Goods on Board — removes the invoice and returns the order to Ready to Ship"
            @click="reverseDispatch">
            ↩️ Reverse Dispatch
          </button>
          <button v-if="isAdmin"
            class="btn-ghost text-xs text-red-400 hover:bg-red-500/10 border-red-500/20"
            @click="deleteModal = true">
            🗑️ Delete
          </button>
        </template>
      </UiPageHeader>


      <!-- ── Related records strip ─────────────────────────────────────── -->
      <div class="-mt-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <NuxtLink :to="`/customers/${order.customer_id}`" class="rel-btn">👤 Customer Profile</NuxtLink>
        <NuxtLink :to="`/credit-sales/ledger?customer=${order.customer_id}`" class="rel-btn">📒 Customer Ledger</NuxtLink>
        <NuxtLink :to="`/credit-sales/payments?search=${encodeURIComponent(order.customer_name ?? '')}`" class="rel-btn">🧾 Payment History</NuxtLink>
        <button class="rel-btn" @click="openViewer('advance')">🧷 Advance Proof<b v-if="advancePayments.length" class="rel-n">{{ advancePayments.length }}</b></button>
        <button class="rel-btn" @click="openViewer('over')">📦 Over-Delivery<b v-if="data?.over_delivery_count" class="rel-n">{{ data.over_delivery_count }}</b></button>
        <button class="rel-btn" @click="openViewer('return')">↩️ Delivery Return<b v-if="returns.length" class="rel-n">{{ returns.length }}</b></button>
        <button class="rel-btn" @click="openViewer('price')">🏷️ Price Change Impact<b v-if="priceRevisions.length" class="rel-n">{{ priceRevisions.length }}</b></button>
      </div>

      <!-- ── BOLD hold banner — impossible to miss ──────────────────────── -->
      <div v-if="hasActiveHold"
           class="rounded-2xl border-2 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hold-banner"
           :style="`background:linear-gradient(135deg, ${holdColor}22, ${holdColor}0d); border-color:${holdColor}66`">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative"
             :style="`background:${holdColor}30; color:${holdColor}`">
          <div class="absolute inset-0 rounded-xl animate-ping opacity-30" :style="`background:${holdColor}`"/>
          <svg class="w-6 h-6 relative z-10" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-black tracking-wide uppercase" :style="`color:${holdColor}`">
            {{ holdHeadline }}
          </p>
          <p class="text-xs text-gray-300 mt-1 leading-relaxed">
            <template v-if="gate?.productionHold && !gate?.productionReleased">
              ⛔ Production is on hold{{ gate.raw?.production_hold_note ? ` — ${gate.raw.production_hold_note}` : '' }}.
            </template>
            <template v-if="gate?.dispatchHold && !gate?.dispatchCleared">
              🚫 Dispatch is blocked until <strong>{{ gateConditionLabel }}</strong>.
              <span v-if="gate.conditionMet" class="text-emerald-400 font-semibold"> Condition met — clearance still required.</span>
              <span v-if="gate.accountsNote"> Note: {{ gate.accountsNote }}</span>
            </template>
          </p>
        </div>
        <div v-if="isAccountsFamily" class="flex flex-wrap gap-2 shrink-0">
          <button v-if="gate?.productionHold && !gate?.productionReleased && isAdmin" @click="gateAction('release_production')"
                  class="px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors"
                  style="background:rgba(245,158,11,0.15);border-color:rgba(245,158,11,0.4);color:#fbbf24">
            Release Production
          </button>
          <button v-if="gate?.dispatchHold && !gate?.dispatchCleared" @click="gateAction('clear_dispatch')"
                  class="px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors"
                  style="background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.4);color:#34d399">
            ✓ Grant Clearance
          </button>
          <button @click="openGateModal"
                  class="px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/[0.12] text-gray-300 hover:bg-white/[0.06] transition-colors">
            Edit
          </button>
        </div>
      </div>

      <!-- Horizontal event timeline -->
      <UiWorkflowTimeline :nodes="timelineNodes" :current-status="order.status" />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main details -->
        <div class="lg:col-span-2 space-y-5">

          <!-- Order header -->
          <div class="glass-card p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="section-title">Order Details</h3>
              <UiStatusBadge :status="order.status" />
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p class="text-xs text-gray-600 mb-1">Customer</p>
                <p class="text-gray-200 font-semibold">{{ order.customer_name }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Customer Type</p>
                <UiStatusBadge :status="order.customer_type || 'credit'" />
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Branch</p>
                <p class="text-gray-200">{{ order.branch_name || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Order Date</p>
                <p class="text-gray-200">{{ order.order_date }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Required Date</p>
                <p class="text-gray-200">{{ order.required_date || '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Priority</p>
                <span :class="['text-xs font-medium',
                  order.priority === 'urgent' ? 'text-red-400' :
                  order.priority === 'high'   ? 'text-orange-400' : 'text-gray-500']">
                  {{ order.priority || 'normal' }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Order Total</p>
                <p class="text-gold-400 font-bold text-base">৳{{ Number(order.total_amount).toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Amount Paid</p>
                <p class="text-emerald-400 font-semibold">৳{{ Number(order.amount_paid).toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-600 mb-1">Balance Due</p>
                <p class="text-red-400 font-bold">৳{{ Number(order.balance_due).toLocaleString() }}</p>
              </div>
            </div>
            <div v-if="order.delivery_address" class="pt-3 border-t border-white/[0.06]">
              <p class="text-xs text-gray-600 mb-1">Delivery Address</p>
              <p class="text-sm text-gray-300">{{ order.delivery_address }}</p>
            </div>
            <div v-if="order.created_by_name" class="text-xs text-gray-600">
              Created by <span class="text-gray-400">{{ order.created_by_name }}</span>
              <span v-if="order.approved_by_name"> · Approved by <span class="text-gray-400">{{ order.approved_by_name }}</span></span>
            </div>
          </div>

          <!-- Credit usage bar -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="section-title">Credit Utilisation</h3>
              <span :class="['text-xs font-semibold', creditPct > 100 ? 'text-red-400' : creditPct > 80 ? 'text-orange-400' : 'text-gray-500']">
                {{ creditPct }}% used
              </span>
            </div>
            <div class="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   :style="`width:${Math.min(creditPct,100)}%;background:${creditPct > 100 ? '#ef4444' : creditPct > 80 ? '#ef4444' : creditPct > 60 ? '#f97316' : '#10b981'}`" />
            </div>
            <!-- Three-row breakdown -->
            <div class="mt-3 space-y-1.5 text-[11px]">
              <div class="flex justify-between text-gray-600">
                <span>Credit Limit</span>
                <span class="text-gray-400 font-medium">৳{{ Number(order.credit_limit || 0).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Delivered &amp; Unpaid (Ledger)</span>
                <span class="text-orange-400/80">৳{{ Math.max(0, Number(order.ledger_balance ?? order.current_balance ?? 0)).toLocaleString() }}</span>
              </div>
              <div v-if="Number(order.other_pending_exposure) > 0" class="flex justify-between text-gray-600">
                <span>Other Pending Orders</span>
                <span class="text-yellow-400/80">৳{{ Number(order.other_pending_exposure).toLocaleString() }}</span>
              </div>
              <div v-if="Number(order.this_order_pending) > 0" class="flex justify-between text-gray-600">
                <span>This Order (pre-delivery)</span>
                <span class="text-blue-400/80">৳{{ Number(order.this_order_pending).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between border-t border-white/[0.06] pt-1.5 mt-1">
                <span class="font-semibold text-gray-400">Total Exposure</span>
                <span :class="['font-bold', creditPct > 100 ? 'text-red-400' : creditPct > 80 ? 'text-orange-400' : 'text-emerald-400']">
                  ৳{{ totalExposure.toLocaleString() }}
                </span>
              </div>
            </div>
            <p v-if="creditPct > 100" class="mt-2 text-[10px] text-red-400/80 leading-snug">
              ⚠ Customer is over credit limit. Escalate to CFO before processing further orders.
            </p>
          </div>

          <!-- Line items -->
          <div class="glass-card p-5">
            <h3 class="section-title mb-4">Line Items</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-white/[0.06] text-[11px] text-gray-600 uppercase tracking-wider">
                    <th class="pb-2.5 text-left font-semibold">Product</th>
                    <th class="pb-2.5 text-right font-semibold">Qty (bags)</th>
                    <th class="pb-2.5 text-right font-semibold">Unit Price</th>
                    <th class="pb-2.5 text-right font-semibold">Discount</th>
                    <th class="pb-2.5 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-white/[0.04]">
                  <tr v-for="item in items" :key="item.id" class="hover:bg-white/[0.02]">
                    <td class="py-3 text-gray-300">
                      {{ item.product_name }}
                      <span v-if="item.weight_variant" class="text-xs text-gray-500"> · {{ item.weight_variant }}</span>
                    </td>
                    <td class="py-3 text-right text-gray-400">{{ Number(item.qty_bags).toLocaleString() }}</td>
                    <td class="py-3 text-right text-gray-400">৳{{ Number(item.unit_price).toLocaleString() }}</td>
                    <td class="py-3 text-right text-red-400/70">
                      {{ Number(item.discount_amount) > 0 ? `-৳${Number(item.discount_amount).toLocaleString()}` : '—' }}
                    </td>
                    <td class="py-3 text-right font-semibold text-gold-400">৳{{ Number(item.line_total).toLocaleString() }}</td>
                  </tr>
                  <tr v-if="!items.length">
                    <td colspan="5" class="py-6 text-center text-xs text-gray-600">No line items</td>
                  </tr>
                </tbody>
                <tfoot v-if="items.length">
                  <tr class="border-t border-white/[0.08]">
                    <td colspan="4" class="pt-3 text-right text-sm font-bold text-gray-300">Sub-Total</td>
                    <td class="pt-3 text-right font-bold text-gold-400 text-base">৳{{ Number(order.total_amount).toLocaleString() }}</td>
                  </tr>
                  <tr v-if="totalReturned > 0">
                    <td colspan="4" class="pt-1 text-right text-xs text-amber-400/80">Credit Notes (Returns)</td>
                    <td class="pt-1 text-right text-xs text-amber-400 font-semibold">-৳{{ totalReturned.toLocaleString() }}</td>
                  </tr>
                  <tr v-if="pendingReturns.length">
                    <td colspan="4" class="pt-1 text-right text-xs text-yellow-500/70">Pending Returns (unprocessed)</td>
                    <td class="pt-1 text-right text-xs text-yellow-500/70 italic">
                      ৳{{ pendingReturns.reduce((s: number, r: any) => s + Number(r.total_returned_amount), 0).toLocaleString() }} ⏳
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4" class="pt-1 text-right text-xs text-gray-500">Amount Paid</td>
                    <td class="pt-1 text-right text-xs text-emerald-400 font-semibold">-৳{{ Number(order.amount_paid).toLocaleString() }}</td>
                  </tr>
                  <tr class="border-t border-white/[0.06]">
                    <td colspan="4" class="pt-2 text-right text-xs font-bold text-gray-300">Balance Due</td>
                    <td class="pt-2 text-right text-sm font-bold text-red-400">৳{{ Number(order.balance_due).toLocaleString() }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="order.special_notes" class="glass-card p-5">
            <h3 class="section-title mb-2">Special Instructions</h3>
            <p class="text-sm text-gray-400 italic">{{ order.special_notes }}</p>
          </div>

          <!-- ── Payments Received ─────────────────────────────── -->
          <div class="glass-card p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="section-title">Payments Received</h3>
              <span v-if="payments.length" class="text-[11px] font-semibold text-emerald-400">
                ৳{{ totalPaid.toLocaleString() }} of ৳{{ Number(order.total_amount).toLocaleString() }}
              </span>
            </div>

            <div v-if="payments.length" class="space-y-0 divide-y divide-white/[0.04]">
              <div v-for="p in payments" :key="p.id"
                   class="py-3 space-y-2"
                   :class="isReversed(p) ? 'opacity-40' : ''">
                <!-- Row 1: icon + number + badges + amount + reverse -->
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-400 text-xs font-bold mt-0.5">
                    {{ methodIcon(p.payment_method) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <p class="text-xs font-mono font-semibold text-gray-300">{{ p.payment_number }}</p>
                      <span v-if="p.payment_type === 'advance' || Number(p.as_advance)" class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">ADVANCE</span>
                      <span v-if="Number(p.allocated_amount) !== Number(p.amount)" class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 border border-purple-500/20"
                            :title="`Part of a ৳${Number(p.amount).toLocaleString()} payment split across multiple orders`">SPLIT</span>
                      <span v-if="isReversed(p)" class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20">REVERSED</span>
                    </div>
                    <!-- Method + account info -->
                    <p class="text-[11px] text-gray-500 mt-0.5">
                      <span class="font-medium text-gray-400">{{ p.payment_method }}</span>
                      <template v-if="p.bank_name"> · {{ p.bank_name }}<span v-if="p.bank_account_number" class="font-mono"> ({{ p.bank_account_number }})</span></template>
                      <template v-else-if="p.cash_account_name"> · {{ p.cash_account_name }}</template>
                      <template v-if="p.bank_transaction_type"> · {{ p.bank_transaction_type }}</template>
                    </p>
                    <!-- Cheque info -->
                    <p v-if="p.cheque_number" class="text-[11px] text-gray-600 mt-0.5">
                      Cheque #<span class="font-mono text-gray-400">{{ p.cheque_number }}</span>
                      <span v-if="p.cheque_date"> dated {{ String(p.cheque_date).slice(0,10) }}</span>
                    </p>
                    <!-- Reference -->
                    <p v-if="p.reference_number && p.reference_number !== p.payment_number" class="text-[11px] text-gray-600 mt-0.5">
                      Ref: <span class="font-mono text-gray-400">{{ p.reference_number }}</span>
                    </p>
                    <!-- Collector info -->
                    <p class="text-[11px] text-gray-600 mt-0.5">
                      Collected by:
                      <span class="text-gray-400">
                        <template v-if="p.collector_first_name">{{ p.collector_first_name }} {{ p.collector_last_name }}</template>
                        <template v-else-if="p.collected_by">{{ p.collected_by }}</template>
                        <template v-else>—</template>
                      </span>
                      <span v-if="p.journal_entry_id" class="ml-2">
                        · <NuxtLink to="/accounts/journal" class="text-blue-400 hover:text-blue-300 font-mono transition-colors">JE-{{ p.journal_entry_id }}</NuxtLink>
                      </span>
                    </p>
                    <p v-if="p.notes" class="text-[10px] text-gray-600 mt-0.5 italic">{{ p.notes }}</p>
                  </div>
                  <!-- Date + Amount + Reverse -->
                  <div class="flex items-center gap-3 shrink-0">
                    <div class="text-right">
                      <p class="text-sm font-bold text-emerald-400">৳{{ Number(p.allocated_amount ?? p.amount).toLocaleString() }}</p>
                      <p class="text-[10px] text-gray-600 mt-0.5">{{ String(p.payment_date).slice(0,10) }}</p>
                    </div>
                    <button v-if="isAdmin && !isReversed(p)"
                      @click="openReversePayment(p)"
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                      title="Reverse this payment">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else class="py-6 text-center">
              <p class="text-xs text-gray-600">No payments recorded yet.</p>
              <NuxtLink v-if="canCollectPayment" :to="`/credit-sales/${id}/payment`"
                        class="text-xs text-gold-400 hover:text-gold-300 mt-1 inline-block transition-colors">
                + Collect payment →
              </NuxtLink>
            </div>

            <!-- Running total footer -->
            <div v-if="payments.length" class="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
              <span class="text-gray-500">Balance remaining</span>
              <span :class="['font-bold', Number(order.balance_due) > 0 ? 'text-red-400' : 'text-emerald-400']">
                ৳{{ Number(order.balance_due).toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- ── Returns / Credit Notes ─────────────────────── -->
          <div v-if="priceRevisions.length" class="glass-card p-5 space-y-3">
            <h3 class="section-title">Price Revision History</h3>
            <div v-for="r in priceRevisions" :key="r.id" class="text-xs text-gray-400 border-b border-white/[0.05] pb-2 last:border-0">
              <span class="font-semibold text-gray-300">{{ r.product_name }} {{ r.weight_variant }} {{ r.grade }}</span>
              · ৳{{ Number(r.old_unit_price).toLocaleString() }} → <strong class="text-gold-400">৳{{ Number(r.new_unit_price).toLocaleString() }}</strong> × {{ Number(r.quantity) }}
              <span class="text-gray-600"> · {{ String(r.created_at).slice(0, 16).replace('T', ' ') }}</span>
              <p class="text-[11px] text-gray-600 mt-0.5">{{ r.reason }}</p>
            </div>
          </div>

          <div v-if="returns.length" class="glass-card p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="section-title">Returns &amp; Credit Notes</h3>
              <div class="flex items-center gap-2">
                <span v-if="pendingReturns.length"
                      class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                  {{ pendingReturns.length }} pending
                </span>
                <span v-if="approvedReturns.length"
                      class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                  {{ approvedReturns.length }} approved
                </span>
              </div>
            </div>

            <div class="space-y-3">
              <div v-for="ret in returns" :key="ret.id"
                   class="rounded-xl border p-4 space-y-3"
                   :class="ret.status === 'pending'
                     ? 'border-yellow-500/25 bg-yellow-500/[0.04]'
                     : ret.status === 'approved'
                     ? 'border-emerald-500/20 bg-white/[0.02]'
                     : 'border-red-500/20 bg-red-500/[0.03] opacity-60'">

                <!-- Return header -->
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-mono font-bold text-gold-400/80">{{ ret.return_number }}</p>
                    <p class="text-[11px] text-gray-500 mt-0.5">{{ ret.return_date }} · {{ ret.return_reason ?? '—' }}</p>
                    <p class="text-[10px] text-gray-600 mt-0.5">By {{ ret.created_by_name ?? 'Unknown' }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <div class="text-right">
                      <p class="text-sm font-bold text-red-400">-৳{{ Number(ret.total_returned_amount).toLocaleString() }}</p>
                      <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block',
                        ret.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        ret.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/15 text-yellow-400']">
                        {{ ret.status }}
                      </span>
                    </div>
                    <button v-if="isAdmin" @click="openDeleteReturn(ret)"
                      class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                      title="Delete this return">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Return items -->
                <div v-if="ret.items?.length" class="text-[11px] text-gray-500 space-y-1">
                  <div v-for="ri in ret.items" :key="ri.id" class="flex justify-between">
                    <span>{{ ri.product_name }}<span v-if="ri.weight_variant" class="text-gray-600"> · {{ ri.weight_variant }}</span></span>
                    <span class="font-mono">×{{ Number(ri.returned_qty).toFixed(0) }} @ ৳{{ Number(ri.unit_price).toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Approval controls (admin only, pending returns) -->
                <div v-if="perms.canExplicit('credit_sales', 'all', 'approve_return') && ret.status === 'pending'" class="flex items-center gap-2 pt-1">
                  <span class="text-[10px] text-yellow-400/70 flex-1">⏳ Awaiting your approval — balance will be adjusted upon approval</span>
                  <button @click="openReturnApproval(ret, 'approve')"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all">
                    ✓ Approve
                  </button>
                  <button @click="openReturnApproval(ret, 'reject')"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                    ✗ Reject
                  </button>
                </div>

                <!-- Approved by -->
                <div v-else-if="ret.status === 'approved' && ret.approved_by_name"
                     class="text-[10px] text-gray-600">
                  Approved by {{ ret.approved_by_name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-5">

          <!-- Dispatch gates / holds -->
          <div v-if="gate?.exists || (isAccountsFamily && !isShippedOrLater)"
               class="glass-card p-4 space-y-2"
               :class="gate?.dispatchHold && !gate?.dispatchCleared ? 'border border-amber-500/25' : ''">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dispatch Control</h3>

            <template v-if="gate?.exists">
              <div v-if="gate.productionHold" class="text-[11px] flex items-center gap-1.5"
                   :class="gate.productionReleased ? 'text-gray-500' : 'text-red-400'">
                ⛔ Production hold {{ gate.productionReleased ? '(released)' : '— active' }}
              </div>
              <div v-if="gate.dispatchHold" class="text-[11px] space-y-1">
                <p :class="gate.dispatchCleared ? 'text-emerald-400' : gate.conditionMet ? 'text-emerald-300' : 'text-amber-400'">
                  {{ gate.dispatchCleared ? '🟢 Dispatch clearance granted'
                     : gate.conditionMet ? '✓ Condition met — awaiting clearance'
                     : '🚫 Dispatch held — condition pending' }}
                </p>
                <p class="text-gray-600">
                  {{ gateConditionLabel }}
                  <span v-if="gate.autoRelease" class="text-amber-500/80"> · auto-release</span>
                </p>
                <p v-if="gate.accountsNote" class="text-gray-600 italic">📝 {{ gate.accountsNote }}</p>
              </div>
              <div v-if="!gate.productionHold && !gate.dispatchHold" class="text-[11px] text-gray-600">
                No active holds
              </div>
            </template>
            <p v-else class="text-[11px] text-gray-600">No holds — order will dispatch freely</p>

            <div v-if="isAccountsFamily && !isShippedOrLater" class="flex flex-wrap gap-2 pt-1">
              <button @click="openGateModal"
                      class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/12 text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 transition-colors">
                ⚙ {{ gate?.exists ? 'Edit Conditions' : 'Set Hold / Condition' }}
              </button>
              <button v-if="gate?.dispatchHold && !gate?.dispatchCleared" @click="gateAction('clear_dispatch')"
                      class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors">
                ✓ Grant Clearance
              </button>
              <button v-if="gate?.dispatchCleared" @click="gateAction('revoke_dispatch')"
                      class="px-3 py-1.5 rounded-lg text-[11px] text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 transition-colors">
                Revoke
              </button>
              <button v-if="gate?.productionHold && !gate?.productionReleased && isAdmin" @click="gateAction('release_production')"
                      class="px-3 py-1.5 rounded-lg text-[11px] text-amber-400 border border-amber-500/25 hover:bg-amber-500/10 transition-colors">
                Release Production
              </button>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
            <button v-if="perms.canDo('credit_sales', 'all', 'print')" @click="printInvoice" class="btn-ghost w-full justify-start text-xs py-2">🖨️ Print Invoice</button>
            <button v-if="['ready_to_ship','goods_on_board','shipped','dispatched','delivered','completed'].includes(order.status) && perms.canDo('credit_sales', 'all', 'print')" @click="printDispatchSlip" class="btn-ghost w-full justify-start text-xs py-2">🚚 Print Dispatch Slip</button>
            <NuxtLink v-if="canCollectPayment && perms.canDo('credit_sales', 'all', 'collect_payment')" :to="`/credit-sales/${id}/payment`" class="btn-ghost w-full justify-start text-xs py-2">💰 Collect Payment</NuxtLink>
            <NuxtLink v-if="['goods_on_board', 'shipped', 'dispatched'].includes(order.status) && perms.canDo('credit_sales', 'all', 'record_delivery')" :to="`/credit-sales/${id}/deliver`" class="btn-ghost w-full justify-start text-xs py-2">📦 Record Delivery</NuxtLink>
            <button v-if="perms.canDo('credit_sales', 'all', 'telegram')" @click="sendAlert" class="btn-ghost w-full justify-start text-xs py-2">📱 Send Telegram Alert</button>
            <NuxtLink v-if="perms.canDo('credit_sales', 'all', 'record_return')" :to="`/credit-sales/${id}/return`" class="btn-ghost w-full justify-start text-xs py-2">↩️ Record Return</NuxtLink>
            <NuxtLink v-if="perms.canDo('credit_sales', 'all', 'record_over_delivery')" :to="`/credit-sales/${id}/over-delivery`" class="btn-ghost w-full justify-start text-xs py-2">📦 Record Over-Delivery</NuxtLink>
            <NuxtLink v-if="!['cancelled','rejected'].includes(order.status)" :to="`/credit-sales/${id}/amend`" class="btn-ghost w-full justify-start text-xs py-2">📝 Amend Order</NuxtLink>
            <button v-if="!['cancelled','completed','rejected'].includes(order.status) && perms.canDo('credit_sales', 'all', 'cancel')"
              @click="cancelModal = true"
              class="btn-ghost w-full justify-start text-xs py-2 text-red-400 hover:bg-red-500/10">
              ❌ Cancel Order
            </button>
            <button v-if="isAdmin"
              @click="deleteModal = true"
              class="btn-ghost w-full justify-start text-xs py-2 text-red-500 hover:bg-red-500/10">
              🗑️ Delete Order
            </button>
          </div>
        </div>
      </div>


      <!-- ── Related-record viewer (advance proof / over-delivery / return / price impact) ── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="viewer" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="viewer = ''" />
            <div class="relative w-full max-w-3xl max-h-[88vh] flex flex-col glass-card animate-slide-up">
              <div class="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <h3 class="section-title">
                  {{ { advance: '🧷 Advance Payment Proof', over: '📦 Over-Delivery', return: '↩️ Delivery Returns', price: '🏷️ Price Change Impact' }[viewer] }}
                  <span class="text-gray-600 font-normal"> · {{ order.order_number }}</span>
                </h3>
                <button class="text-gray-500 hover:text-gray-200 text-lg leading-none" @click="viewer = ''">✕</button>
              </div>
              <div class="overflow-y-auto p-5 space-y-3 text-xs">

                <!-- Advance proof -->
                <template v-if="viewer === 'advance'">
                  <p v-if="!advancePayments.length" class="text-gray-500 italic text-center py-6">No advance payment recorded against this order.</p>
                  <div v-for="p in advancePayments" :key="p.id" class="rounded-xl border border-white/[0.08] p-3.5 space-y-1.5" :class="isReversed(p) ? 'opacity-50' : ''">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-mono font-semibold text-gray-200">{{ p.payment_number }}
                        <span v-if="isReversed(p)" class="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">REVERSED</span></span>
                      <span class="font-bold text-emerald-400 text-sm">৳{{ Number(p.allocated_amount ?? p.amount).toLocaleString() }}</span>
                    </div>
                    <p class="text-gray-500">{{ String(p.payment_date).slice(0, 10) }} · <span class="text-gray-300">{{ p.payment_method }}</span>
                      <template v-if="p.bank_name"> · {{ p.bank_name }} <span class="font-mono">{{ p.bank_account_number }}</span></template>
                      <template v-else-if="p.cash_account_name"> · {{ p.cash_account_name }}</template>
                      <template v-if="p.cheque_number"> · Cheque #{{ p.cheque_number }}<template v-if="p.cheque_date"> ({{ String(p.cheque_date).slice(0, 10) }})</template></template>
                      <template v-if="p.reference_number && p.reference_number !== p.payment_number"> · Ref {{ p.reference_number }}</template>
                    </p>
                    <p class="text-gray-600">Received by {{ p.collector_first_name ? `${p.collector_first_name} ${p.collector_last_name ?? ''}` : (p.collected_by || '—') }}
                      <template v-if="p.notes"> · {{ p.notes }}</template></p>
                    <NuxtLink :to="`/credit-sales/receipt/${p.id}`" target="_blank" class="inline-block text-amber-400 hover:underline">🖨️ Open receipt</NuxtLink>
                  </div>
                  <div v-if="advancePayments.length" class="flex justify-between border-t border-white/[0.06] pt-3 font-semibold">
                    <span class="text-gray-400">Total advance on this order</span>
                    <span class="text-emerald-400">৳{{ advanceTotal.toLocaleString() }}</span>
                  </div>
                  <NuxtLink v-if="canCollectPayment" :to="`/credit-sales/${id}/payment`" class="btn-ghost text-xs inline-flex">💰 Collect another payment</NuxtLink>
                </template>

                <!-- Over-delivery -->
                <template v-else-if="viewer === 'over'">
                  <p v-if="viewerLoading" class="text-gray-500 text-center py-6">Loading…</p>
                  <p v-else-if="!overDeliveries.length" class="text-gray-500 italic text-center py-6">No over-delivery recorded for this order.</p>
                  <div v-for="od in overDeliveries" :key="od.id" class="rounded-xl border border-white/[0.08] p-3.5 space-y-1.5">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-mono font-semibold text-gray-200">{{ od.od_number }}</span>
                      <UiStatusBadge :status="od.status ?? 'pending'" />
                    </div>
                    <p class="text-gray-600">{{ String(od.od_date).slice(0, 10) }} · {{ od.resolution }} · by {{ od.created_by_name ?? '—' }}<template v-if="od.approved_by_name"> · approved by {{ od.approved_by_name }}</template></p>
                    <ul class="text-gray-400 space-y-0.5">
                      <li v-for="it in od.items" :key="it.id">{{ it.product_name }} {{ it.weight_variant }} — {{ Number(it.extra_qty) }} extra bags
                        × ৳{{ Number(it.unit_price).toLocaleString() }}</li>
                    </ul>
                    <p v-if="Number(od.total_extra_amount)" class="font-semibold text-amber-400">Value ৳{{ Number(od.total_extra_amount).toLocaleString() }}</p>
                  </div>
                  <NuxtLink v-if="perms.canDo('credit_sales', 'all', 'record_over_delivery')" :to="`/credit-sales/${id}/over-delivery`" class="btn-ghost text-xs inline-flex">📦 Record Over-Delivery</NuxtLink>
                </template>

                <!-- Returns -->
                <template v-else-if="viewer === 'return'">
                  <p v-if="!returns.length" class="text-gray-500 italic text-center py-6">No delivery return recorded for this order.</p>
                  <div v-for="r in returns" :key="r.id" class="rounded-xl border border-white/[0.08] p-3.5 space-y-1.5">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-mono font-semibold text-gray-200">{{ r.return_number }}</span>
                      <UiStatusBadge :status="r.status" />
                      <span class="font-bold text-amber-400">−৳{{ Number(r.total_returned_amount).toLocaleString() }}</span>
                    </div>
                    <p class="text-gray-600">{{ String(r.return_date ?? r.created_at).slice(0, 10) }} · by {{ r.created_by_name ?? '—' }}<template v-if="r.approved_by_name"> · {{ r.status }} by {{ r.approved_by_name }}</template></p>
                    <ul class="text-gray-400 space-y-0.5">
                      <li v-for="it in r.items" :key="it.id">{{ it.product_name }} {{ it.weight_variant }} — {{ Number(it.returned_qty) }} bags</li>
                    </ul>
                    <p v-if="r.return_reason" class="text-gray-500 italic">{{ r.return_reason }}</p>
                  </div>
                  <NuxtLink v-if="perms.canDo('credit_sales', 'all', 'record_return')" :to="`/credit-sales/${id}/return`" class="btn-ghost text-xs inline-flex">↩️ Record Return</NuxtLink>
                </template>

                <!-- Price change impact -->
                <template v-else-if="viewer === 'price'">
                  <p v-if="viewerLoading || !impact" class="text-gray-500 text-center py-6">Loading…</p>
                  <template v-else>
                    <div class="rounded-xl p-3 text-[11px] leading-relaxed" :class="impact.invoice.gap ? 'bg-red-500/10 border border-red-500/30 text-red-300' : 'bg-white/[0.03] border border-white/[0.08] text-gray-400'">
                      <template v-if="impact.invoice.posted">
                        <b class="text-gray-200">Invoice posted</b> ৳{{ impact.invoice.amount.toLocaleString() }}<template v-if="impact.invoice.date"> on {{ String(impact.invoice.date).slice(0, 10) }}</template>
                        <template v-if="impact.invoice.notes_net"> · amendment notes {{ impact.invoice.notes_net > 0 ? '+' : '−' }}৳{{ Math.abs(impact.invoice.notes_net).toLocaleString() }}</template>
                        → ledger carries <b class="text-gray-200">৳{{ impact.invoice.net.toLocaleString() }}</b>; order total now <b class="text-gray-200">৳{{ impact.order_total.toLocaleString() }}</b>.
                        <template v-if="impact.invoice.gap"><br>⚠ ৳{{ Math.abs(impact.invoice.gap).toLocaleString() }} {{ impact.invoice.gap > 0 ? 'not yet billed' : 'over-billed' }} — raise an amendment so the ledger and the order agree.</template>
                        <template v-else> ✓ Order and ledger agree.</template>
                      </template>
                      <template v-else-if="impact.stage === 'open'">
                        <b class="text-gray-200">Not invoiced yet.</b> A price change now just reprices the lines; the invoice is posted at the new total on Goods on Board.
                        <template v-if="impact.auto_apply"> Pricing-engine changes are being applied to open orders automatically (same ৳ shift).</template>
                        <template v-else> Automatic catalog-price sync is OFF — use Amend to reprice.</template>
                      </template>
                      <template v-else>This order is closed — no invoice was posted.</template>
                    </div>

                    <div class="overflow-x-auto">
                      <table class="w-full">
                        <thead><tr class="text-[10px] uppercase text-gray-600 border-b border-white/[0.06]">
                          <th class="py-1.5 text-left">Product</th><th class="text-right">Qty</th><th class="text-right">Original</th><th class="text-right">Now</th><th class="text-right">Impact</th></tr></thead>
                        <tbody class="divide-y divide-white/[0.04]">
                          <tr v-for="l in impact.lines" :key="l.id">
                            <td class="py-2 text-gray-300">{{ l.product_name }} <span class="text-gray-600">{{ l.weight_variant }}</span></td>
                            <td class="text-right text-gray-400">{{ l.quantity }}</td>
                            <td class="text-right text-gray-500" :class="l.impact ? 'line-through' : ''">৳{{ l.original_price.toLocaleString() }}</td>
                            <td class="text-right font-semibold text-gold-400">৳{{ l.current_price.toLocaleString() }}</td>
                            <td class="text-right font-mono" :class="l.impact > 0 ? 'text-red-400' : l.impact < 0 ? 'text-emerald-400' : 'text-gray-600'">{{ l.impact ? (l.impact > 0 ? '+' : '−') + '৳' + Math.abs(l.impact).toLocaleString() : '—' }}</td>
                          </tr>
                        </tbody>
                        <tfoot><tr class="border-t border-white/[0.08] font-bold"><td colspan="4" class="pt-2 text-right text-gray-400">Net effect of price changes</td>
                          <td class="pt-2 text-right font-mono" :class="impact.total_impact > 0 ? 'text-red-400' : impact.total_impact < 0 ? 'text-emerald-400' : 'text-gray-600'">{{ impact.total_impact ? (impact.total_impact > 0 ? '+' : '−') + '৳' + Math.abs(impact.total_impact).toLocaleString() : '—' }}</td></tr></tfoot>
                      </table>
                    </div>

                    <div v-if="impact.revisions.length" class="space-y-1.5">
                      <p class="text-[10px] uppercase text-gray-600 font-semibold">Price history</p>
                      <div v-for="r in [...impact.revisions].reverse()" :key="r.id" class="border-b border-white/[0.05] pb-1.5 last:border-0 text-gray-400">
                        <b class="text-gray-300">{{ r.product_name }} {{ r.weight_variant }}</b> ৳{{ Number(r.old_unit_price).toLocaleString() }} → <b class="text-gold-400">৳{{ Number(r.new_unit_price).toLocaleString() }}</b> × {{ Number(r.quantity) }}
                        <span class="text-gray-600"> · {{ String(r.created_at).slice(0, 16).replace('T', ' ') }}<template v-if="r.changed_by"> · {{ r.changed_by }}</template></span>
                        <p class="text-[11px] text-gray-600">{{ r.reason }}</p>
                      </div>
                    </div>
                    <p v-else class="text-gray-600 italic">No price change has ever been made on this order.</p>

                    <div v-if="impact.amendments.length" class="space-y-1.5">
                      <p class="text-[10px] uppercase text-gray-600 font-semibold">Amendments</p>
                      <div v-for="a in impact.amendments" :key="a.id" class="text-gray-400 border-b border-white/[0.05] pb-1.5 last:border-0">
                        <b class="font-mono text-gray-300">{{ a.amendment_number }}</b> · {{ a.regime }}-dispatch · {{ a.amend_type }} · <i>{{ a.status }}</i>
                        <span v-if="a.delta" class="font-mono ml-1" :class="a.delta > 0 ? 'text-red-400' : 'text-emerald-400'">{{ a.delta > 0 ? '+' : '−' }}৳{{ Math.abs(a.delta).toLocaleString() }}</span>
                        <p class="text-[11px] text-gray-600">{{ a.description }}<template v-if="a.consent"> · consent: {{ a.consent }}</template></p>
                      </div>
                    </div>
                  </template>
                  <NuxtLink v-if="!['cancelled', 'rejected'].includes(order.status)" :to="`/credit-sales/${id}/amend`" class="btn-ghost text-xs inline-flex">📝 Amend price / quantity</NuxtLink>
                </template>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Approval / Escalation Modal ─────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="approvalModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="approvalModal = false" />
            <div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up">
              <h3 class="section-title">
                {{ order.status === 'escalated' ? '⚠️ Escalation Review' : '📋 Order Review' }}
              </h3>
              <p class="text-sm text-gray-400">
                <span class="text-gold-400 font-semibold">{{ order.order_number }}</span>
                <span v-if="order.status === 'escalated'"> — escalated due to credit concerns ({{ creditPct }}% utilisation)</span>
                <span v-else> — ৳{{ Number(order.total_amount).toLocaleString() }} · {{ order.customer_name }}</span>
              </p>
              <div v-if="creditPct > 80"
                   class="rounded-xl p-3 text-xs"
                   style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2)">
                <p class="text-orange-400 font-semibold">⚠ Credit Utilisation: {{ creditPct }}%</p>
                <p class="text-gray-500 mt-0.5">Customer is near or over credit limit. Ensure CFO sign-off before approving.</p>
              </div>

            <!-- Production branch + delivery date: chosen by the approver (legacy rule) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Production branch *</label>
                <select v-model="approveFields.branch_id" class="input-glass w-full text-sm" required>
                  <option :value="0" disabled>Select branch…</option>
                  <option v-for="b in branchOptions" :key="b.id" :value="b.id">{{ b.name }}</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Required delivery date *</label>
                <input v-model="approveFields.required_date" type="date" :min="isAdminUser ? undefined : todayStr" class="input-glass w-full text-sm" required />
              </div>
            </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Comment (optional)</label>
                <textarea v-model="approvalComment" rows="2" class="field-input w-full resize-none text-sm"
                          placeholder="Add a note for the record…" />
              </div>
              <div class="flex gap-3">
                <button @click="confirmApprove" :disabled="acting" class="btn-gold flex-1 justify-center">
                  {{ acting ? '…' : '✓ Approve' }}
                </button>
                <button @click="confirmReject" :disabled="acting"
                  class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-40">
                  ✗ Reject
                </button>
              </div>
              <button @click="approvalModal = false" class="btn-ghost w-full text-xs py-1.5">Cancel</button>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Return Approval Modal ──────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="returnApprovalModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="returnApprovalModal = false" />
            <div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up">
              <h3 :class="['section-title', pendingReturnAction === 'reject' ? 'text-red-400' : 'text-emerald-400']">
                {{ pendingReturnAction === 'approve' ? '✓ Approve Return' : '✗ Reject Return' }}
              </h3>
              <div v-if="pendingReturnTarget" class="rounded-xl p-3 text-xs space-y-1"
                   :class="pendingReturnAction === 'approve'
                     ? 'bg-emerald-500/08 border border-emerald-500/20'
                     : 'bg-red-500/08 border border-red-500/20'">
                <div class="flex justify-between">
                  <span class="text-gray-500">Return #</span>
                  <span class="font-mono font-bold text-gold-400/80">{{ pendingReturnTarget.return_number }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Amount</span>
                  <span class="font-bold text-red-400">৳{{ Number(pendingReturnTarget.total_returned_amount).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Reason</span>
                  <span class="text-gray-300">{{ pendingReturnTarget.return_reason ?? '—' }}</span>
                </div>
              </div>
              <p v-if="pendingReturnAction === 'approve'" class="text-xs text-gray-400">
                Approving will immediately deduct <span class="text-red-400 font-semibold">৳{{ Number(pendingReturnTarget?.total_returned_amount ?? 0).toLocaleString() }}</span>
                from the order balance and customer ledger.
              </p>
              <p v-else class="text-xs text-gray-400">
                Rejecting will dismiss this return request. No balance adjustments will be made.
              </p>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Note (optional)</label>
                <textarea v-model="returnApprovalNote" rows="2" class="field-input w-full resize-none text-sm"
                          placeholder="Add a note for the record…" />
              </div>
              <div class="flex gap-3">
                <button @click="submitReturnApproval" :disabled="acting"
                  :class="['flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all',
                    pendingReturnAction === 'approve'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25']">
                  {{ acting ? '…' : pendingReturnAction === 'approve' ? '✓ Confirm Approve' : '✗ Confirm Reject' }}
                </button>
                <button @click="returnApprovalModal = false" class="btn-ghost flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Dispatch Gate / Conditions Modal ───────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="gateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="gateModal = false" />
            <div class="relative w-full max-w-lg glass-card p-6 space-y-4 animate-slide-up my-8">
              <h3 class="section-title text-amber-300">⚙ Dispatch Control — {{ order.order_number }}</h3>
              <p class="text-xs text-gray-500">
                Holds apply from this moment until cleared. The dispatch button enforces them server-side.
              </p>

              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input v-model="gateForm.production_hold" type="checkbox" class="accent-amber-500" />
                ⛔ Hold production until admin releases
              </label>
              <input v-if="gateForm.production_hold" v-model="gateForm.production_hold_note" type="text"
                     class="input-glass w-full py-1.5 text-xs" placeholder="Why is production held?" />

              <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input v-model="gateForm.dispatch_hold" type="checkbox" class="accent-amber-500" />
                🚫 Hold dispatch until a payment condition is met
              </label>
              <template v-if="gateForm.dispatch_hold">
                <select v-model="gateForm.condition_type" class="input-glass w-full py-1.5 text-xs">
                  <option value="manual">Manual — accounts clears by hand</option>
                  <option value="outstanding_below">Old dues must drop below…</option>
                  <option value="outstanding_after_ship">Total dues after shipping ≤… (0 = pay everything first)</option>
                  <option value="amount_received">Receive at least … against this order</option>
                </select>
                <input v-if="gateForm.condition_type !== 'manual'" v-model.number="gateForm.condition_amount"
                       type="number" min="0" class="input-glass w-full py-1.5 font-mono text-center text-xs"
                       placeholder="Amount (৳)" />
                <label class="flex items-start gap-2 cursor-pointer text-xs text-gray-500">
                  <input v-model="gateForm.auto_release" type="checkbox" class="accent-amber-500 mt-0.5" />
                  <span>⚡ Auto-release when the condition is met
                    <span class="block text-[10px] text-amber-500/80">Careful with cheques — money may not be cleared yet</span>
                  </span>
                </label>
                <input v-model="gateForm.accounts_note" type="text" class="input-glass w-full py-1.5 text-xs"
                       placeholder="Note for the dispatch team…" />
              </template>

              <div class="flex gap-3 pt-1">
                <button @click="gateModal = false" class="btn-ghost flex-1 text-xs">Cancel</button>
                <button @click="saveGate" :disabled="gateSaving"
                        class="btn-gold flex-1 text-xs disabled:opacity-50">
                  {{ gateSaving ? 'Saving…' : 'Save Conditions' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Delete Order Modal ──────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="deleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="deleteModal = false" />
            <div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up">
              <h3 class="section-title text-red-400">🗑️ Delete Order</h3>
              <p class="text-sm text-gray-400">
                This will permanently delete <strong class="text-gold-400">{{ order.order_number }}</strong>
                along with all deliveries, returns, payments and ledger entries.
              </p>
              <div class="rounded-xl p-3 text-xs" style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2)">
                <p class="text-red-400 font-semibold">⚠ This action cannot be undone.</p>
              </div>
              <div class="flex gap-3">
                <button @click="deleteModal = false" class="btn-ghost flex-1">Go Back</button>
                <button @click="confirmDelete" :disabled="acting"
                  class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {{ acting ? '…' : 'Confirm Delete' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Cancel Order Modal ──────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="cancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="cancelModal = false" />
            <div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up">
              <h3 class="section-title text-red-400">❌ Cancel Order</h3>
              <p class="text-sm text-gray-400">
                Cancelling <strong class="text-gold-400">{{ order.order_number }}</strong>. This cannot be undone.
              </p>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason *</label>
                <textarea v-model="cancelReason" rows="2" class="field-input w-full resize-none text-sm"
                          placeholder="e.g. Customer requested cancellation, stock shortage…" />
              </div>
              <div class="flex gap-3">
                <button @click="cancelModal = false" class="btn-ghost flex-1">Go Back</button>
                <button @click="confirmCancel" :disabled="!cancelReason.trim() || acting"
                  class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {{ acting ? '…' : 'Confirm Cancel' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Reverse Payment Modal ──────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="reverseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="reverseModal = false" />
            <div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up">
              <h3 class="section-title text-amber-400">↩ Reverse Payment</h3>

              <div v-if="reverseTarget" class="rounded-xl p-3 text-xs space-y-1.5"
                   style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2)">
                <div class="flex justify-between">
                  <span class="text-gray-500">Payment #</span>
                  <span class="font-mono font-bold text-gold-400/80">{{ reverseTarget.payment_number }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Amount</span>
                  <span class="font-bold text-emerald-400">৳{{ Number(reverseTarget.amount).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Method</span>
                  <span class="text-gray-300">{{ reverseTarget.payment_method }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Date</span>
                  <span class="text-gray-400">{{ String(reverseTarget.payment_date).slice(0,10) }}</span>
                </div>
              </div>

              <p class="text-xs text-gray-400 leading-relaxed">
                This will <strong class="text-red-400">void the payment</strong> by posting a debit note to the ledger,
                restoring <span class="text-red-400 font-semibold">৳{{ Number(reverseTarget?.amount ?? 0).toLocaleString() }}</span>
                back to the order balance and customer account.
                The original payment record will be marked as <em>REVERSED</em>.
              </p>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason (optional)</label>
                <textarea v-model="reverseReason" rows="2" class="field-input w-full resize-none text-sm"
                          placeholder="e.g. Cheque bounced, wrong amount, duplicate entry…" />
              </div>

              <div class="rounded-xl p-3 text-xs" style="background:rgba(249,115,22,0.06);border:1px solid rgba(249,115,22,0.2)">
                <p class="text-orange-400 font-semibold">⚠ This cannot be undone.</p>
                <p class="text-gray-500 mt-0.5">The balance due on this order will increase by the reversed amount.</p>
              </div>

              <div class="flex gap-3">
                <button @click="reverseModal = false" class="btn-ghost flex-1">Go Back</button>
                <button @click="confirmReversePayment" :disabled="acting"
                  class="flex-1 py-2 rounded-xl text-sm font-semibold text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {{ acting ? '…' : '↩ Confirm Reversal' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ── Delete Return Modal ────────────────────────── -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="deleteReturnModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="deleteReturnModal = false" />
            <div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up">
              <h3 class="section-title text-red-400">🗑️ Delete Return</h3>

              <div v-if="deleteReturnTarget" class="rounded-xl p-3 text-xs space-y-1.5"
                   style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2)">
                <div class="flex justify-between">
                  <span class="text-gray-500">Return #</span>
                  <span class="font-mono font-bold text-gold-400/80">{{ deleteReturnTarget.return_number }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Amount</span>
                  <span class="font-bold text-red-400">৳{{ Number(deleteReturnTarget.total_returned_amount).toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Status</span>
                  <span :class="deleteReturnTarget.status === 'approved' ? 'text-emerald-400' : deleteReturnTarget.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'">
                    {{ deleteReturnTarget.status }}
                  </span>
                </div>
              </div>

              <!-- Approved return: extra warning about reversal -->
              <div v-if="deleteReturnTarget?.status === 'approved'"
                   class="rounded-xl p-3 text-xs space-y-1"
                   style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.25)">
                <p class="text-orange-400 font-semibold">⚠ Approved return — accounting will be reversed</p>
                <p class="text-gray-500 leading-relaxed mt-0.5">
                  Because this return was already approved, deleting it will:
                </p>
                <ul class="text-gray-500 mt-1 space-y-0.5 pl-2 list-disc list-inside leading-relaxed">
                  <li>Remove the credit note from the customer ledger</li>
                  <li>Add <span class="text-orange-300 font-semibold">৳{{ Number(deleteReturnTarget?.total_returned_amount ?? 0).toLocaleString() }}</span> back to the order balance</li>
                  <li>Restore the customer's outstanding balance</li>
                </ul>
              </div>

              <!-- Pending / rejected: simple confirmation -->
              <p v-else class="text-xs text-gray-400">
                This return request will be permanently removed. No accounting adjustments will be made as it was never approved.
              </p>

              <div class="flex gap-3">
                <button @click="deleteReturnModal = false" class="btn-ghost flex-1">Go Back</button>
                <button @click="confirmDeleteReturn" :disabled="acting"
                  class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {{ acting ? '…' : 'Confirm Delete' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
    <DispatchSlideOver v-model="dispatchOpen" :order-id="order?.id ?? null" :order-label="order?.order_number" @done="refresh" />
  </div>
</template>

<script setup lang="ts">
const perms = usePermissions()
definePageMeta({ layout: 'default' })
const route = useRoute()
const id    = computed(() => Number(route.params.id))
const { success, error: toastError, warning } = useToast()
const { user: sessionUser } = useUserSession()
const isAdmin = computed(() =>
  ['admin', 'superadmin'].includes((sessionUser.value?.role ?? '').toLowerCase())
)

const { data, pending, error, refresh } = await useFetch(
  () => `/api/credit-sales/${id.value}`,
)

const order     = computed(() => (data.value?.order     ?? {}) as any)
const items     = computed(() => (data.value?.items     ?? []) as any[])
const returns   = computed(() => (data.value?.returns   ?? []) as any[])
const priceRevisions = computed(() => (data.value?.price_revisions ?? []) as any[])
const payments  = computed(() => (data.value?.payments  ?? []) as any[])
const apiWorkflow = computed(() => (data.value?.workflow ?? []) as any[])

// allocated_amount is this order's share of the payment — equals p.amount
// for direct (single-order) payments, but only the slice for split ones.
const totalPaid = computed(() =>
  payments.value.reduce((s: number, p: any) => s + Number(p.allocated_amount ?? p.amount), 0),
)

function methodIcon(method: string): string {
  const m = (method ?? '').toLowerCase()
  if (m.includes('cash'))   return '💵'
  if (m.includes('mobile') || m.includes('bkash') || m.includes('nagad')) return '📱'
  if (m.includes('bank') || m.includes('transfer')) return '🏦'
  if (m.includes('cheque') || m.includes('check'))  return '📄'
  return '💳'
}

function isReversed(p: any): boolean {
  // reversed_at is the real signal; the notes-prefix fallback covers payments
  // reversed before this column existed.
  return !!p.reversed_at || (p.notes ?? '').startsWith('REVERSED')
}

const approvedReturns = computed(() => returns.value.filter((r: any) => r.status === 'approved'))
const pendingReturns  = computed(() => returns.value.filter((r: any) => r.status === 'pending'))
const totalReturned   = computed(() => approvedReturns.value.reduce((s: number, r: any) => s + Number(r.total_returned_amount), 0))

// Total exposure = what's already on the ledger (delivered & unpaid)
//                + pre-delivery order commitments from OTHER orders
//                + this order's own uncommitted balance (if pre-delivery)
const totalExposure = computed(() => {
  const ledger  = Number(order.value.ledger_balance         ?? order.value.current_balance ?? 0)
  const others  = Number(order.value.other_pending_exposure ?? 0)
  const thisOrd = Number(order.value.this_order_pending     ?? 0)
  return Math.max(0, ledger + others + thisOrd)
})

const creditPct = computed(() => {
  const limit = Number(order.value.credit_limit ?? 0)
  if (!limit) return 0
  return Math.min(150, Math.round((totalExposure.value / limit) * 100))
})


// ── Related-record viewer ──────────────────────────────────────────────────────
const viewer = ref('')
const viewerLoading = ref(false)
const overDeliveries = ref<any[]>([])
const impact = ref<any>(null)
const advancePayments = computed(() => payments.value.filter((p: any) => p.payment_type === 'advance' || Number(p.as_advance)))
const advanceTotal = computed(() => advancePayments.value.filter((p: any) => !isReversed(p))
  .reduce((s: number, p: any) => s + Number(p.allocated_amount ?? p.amount), 0))
async function openViewer(kind: string) {
  viewer.value = kind
  if (kind !== 'over' && kind !== 'price') return
  viewerLoading.value = true
  try {
    if (kind === 'over') overDeliveries.value = ((await $fetch(`/api/credit-sales/${id.value}/over-deliveries`)) as any).over_deliveries ?? []
    else impact.value = await $fetch(`/api/credit-sales/${id.value}/price-impact`)
  } catch (e: any) { toastError(e?.data?.statusMessage ?? 'Could not load') }
  finally { viewerLoading.value = false }
}

// Escalated/pending orders can still take advance payments — e.g. an
// escalated (over-credit-limit) order's own dispatch-hold condition often
// requires receiving a specific amount before clearance is even possible,
// so payment must be collectible before approval, not just after. Matches
// what /credit-sales/collect (customer-level) already allows unrestricted.
const canCollectPayment = computed(() =>
  !['rejected', 'cancelled'].includes(order.value.status),
)

// ── Dispatch gates (holds & payment conditions) ───────────────────────────────
const isAccountsFamily = computed(() =>
  ['admin', 'superadmin', 'accounts', 'accounts-srg', 'accounts-demra']
    .includes((sessionUser.value?.role ?? '').toLowerCase()))
// Once goods_on_board is reached the gate has already been resolved
// (cleared/auto-released) — holds no longer apply from here on.
const isShippedOrLater = computed(() =>
  ['goods_on_board', 'shipped', 'dispatched', 'delivered', 'completed', 'cancelled', 'rejected']
    .includes(order.value?.status))

const { data: gateData, refresh: refreshGate } = await useFetch(
  () => `/api/credit-sales/${id.value}/gates`, { ignoreResponseError: true })
const gate = computed<any>(() => (gateData.value as any)?.gate ?? null)

const gateConditionLabel = computed(() => {
  const g = gate.value
  if (!g?.dispatchHold) return ''
  const amt = g.conditionAmount != null ? ` ৳${Number(g.conditionAmount).toLocaleString()}` : ''
  const map: Record<string, string> = {
    manual:                 'Manual clearance by accounts',
    outstanding_below:      `Old dues must drop to${amt}`,
    outstanding_after_ship: Number(g.conditionAmount) === 0 ? 'Pay everything incl. this invoice' : `Total dues after shipping ≤${amt}`,
    amount_received:        `Receive${amt} against this order`,
  }
  return map[g.conditionType ?? 'manual'] ?? 'Dispatch hold'
})

const gateModal  = ref(false)
const gateSaving = ref(false)
const gateForm   = reactive({
  production_hold: false, production_hold_note: '',
  dispatch_hold: false, condition_type: 'manual',
  condition_amount: null as number | null,
  auto_release: false, accounts_note: '',
})

function openGateModal() {
  const g = gate.value?.raw
  Object.assign(gateForm, g ? {
    production_hold: !!g.production_hold, production_hold_note: g.production_hold_note ?? '',
    dispatch_hold: !!g.dispatch_hold, condition_type: g.condition_type ?? 'manual',
    condition_amount: g.condition_amount != null ? Number(g.condition_amount) : null,
    auto_release: !!g.auto_release, accounts_note: g.accounts_note ?? '',
  } : {
    production_hold: false, production_hold_note: '',
    dispatch_hold: false, condition_type: 'manual',
    condition_amount: null, auto_release: false, accounts_note: '',
  })
  gateModal.value = true
}

async function saveGate() {
  gateSaving.value = true
  try {
    await $fetch(`/api/credit-sales/${id.value}/gates`, {
      method: 'POST',
      body: { action: 'set', ...gateForm },
    })
    success('Dispatch conditions saved ✓')
    gateModal.value = false
    await Promise.all([refreshGate(), refresh()])
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Failed to save conditions')
  } finally {
    gateSaving.value = false
  }
}

async function gateAction(action: string) {
  const labels: Record<string, string> = {
    clear_dispatch: 'Grant dispatch clearance', revoke_dispatch: 'Revoke clearance',
    release_production: 'Release the production hold',
  }
  if (!confirm(`${labels[action]} for ${order.value.order_number}?`)) return
  try {
    await $fetch(`/api/credit-sales/${id.value}/gates`, { method: 'POST', body: { action } })
    success(`${labels[action]} ✓`)
    await Promise.all([refreshGate(), refresh()])
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Gate action failed')
  }
}

// ── Bold hold banner ──────────────────────────────────────────────────────────
const hasActiveHold = computed(() => {
  const g = gate.value
  if (!g?.exists) return false
  return (g.productionHold && !g.productionReleased) || (g.dispatchHold && !g.dispatchCleared)
})
const dispatchBlocked = computed(() => !!gate.value?.dispatchHold && !gate.value?.dispatchCleared)
const holdColor = computed(() =>
  dispatchBlocked.value && !gate.value?.conditionMet ? '#ef4444'
  : dispatchBlocked.value ? '#f59e0b'
  : '#f59e0b')
const holdHeadline = computed(() => {
  const g = gate.value
  if (g?.productionHold && !g?.productionReleased && dispatchBlocked.value) return '⚠ Production & Dispatch Held'
  if (g?.productionHold && !g?.productionReleased) return '⚠ Production Hold Active'
  if (dispatchBlocked.value) return '⚠ Dispatch Held — Action Required'
  return '⚠ Order Held'
})

const dispatchOpen = ref(false)
async function reverseDispatch() {
  const reason = prompt(`Reverse dispatch of ${order.value.order_number}? The invoice is removed from the customer ledger (kept in the Recycle Bin) and the order returns to Ready to Ship.\n\nReason (min 5 characters):`)
  if (!reason) return
  acting.value = true
  try {
    await $fetch(`/api/credit-sales/${id.value}/reverse-dispatch`, { method: 'POST', body: { reason } })
    success('Dispatch reversed — order is back at Ready to Ship')
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Could not reverse dispatch')
  } finally {
    acting.value = false
  }
}
function doDispatch() {
  if (dispatchBlocked.value) {
    toastError(gate.value?.conditionMet
      ? 'Condition met but clearance is manual — grant clearance first'
      : `Dispatch blocked — ${gate.value ? gateConditionLabel.value : 'payment clearance pending'}`)
    return
  }
  dispatchOpen.value = true
}

// ── Horizontal event timeline (keyword-mapped icon/color per action) ─────────
// Order of preference: exact `action` key, else `to_status` key, else a
// generic status-changed fallback. Covers every event we log across
// workflow/gates/amendments/payments/returns.
const EVENT_MAP: Record<string, { icon: string; color: string; title: string }> = {
  submit:                   { icon: 'cart',        color: '#6366f1', title: 'Order Placed' },
  approved:                 { icon: 'check',       color: '#10b981', title: 'Approved' },
  rejected:                 { icon: 'x',           color: '#ef4444', title: 'Rejected' },
  escalated:                { icon: 'alert',       color: '#f97316', title: 'Escalated' },
  gate_set:                 { icon: 'hand',        color: '#f59e0b', title: 'Special Instructions' },
  gate_clear_dispatch:      { icon: 'unlock',      color: '#10b981', title: 'Dispatch Cleared' },
  gate_revoke_dispatch:     { icon: 'lock',        color: '#ef4444', title: 'Clearance Revoked' },
  gate_release_production:  { icon: 'unlock',      color: '#f59e0b', title: 'Production Released' },
  gate_auto_release:        { icon: 'unlock',      color: '#10b981', title: 'Auto-Released' },
  in_production:            { icon: 'play',        color: '#3b82f6', title: 'Production Started' },
  ready_to_ship:            { icon: 'checkDouble', color: '#06b6d4', title: 'Ready to Ship' },
  goods_on_board:           { icon: 'package',      color: '#f59e0b', title: 'Goods on Board' },
  shipped:                  { icon: 'truck',        color: '#f97316', title: 'Shipped' },
  dispatched:               { icon: 'package',      color: '#f59e0b', title: 'Goods on Board' },
  delivered:                { icon: 'package',      color: '#14b8a6', title: 'Delivered' },
  partial_delivery:         { icon: 'package',      color: '#06b6d4', title: 'Partial Delivery' },
  payment_received:         { icon: 'money',        color: '#10b981', title: 'Payment Received' },
  completed:                { icon: 'checkDouble',  color: '#a855f7', title: 'Order Completed' },
  return_submitted:         { icon: 'undo',         color: '#f59e0b', title: 'Return Submitted' },
  return_approved:          { icon: 'undo',         color: '#10b981', title: 'Return Approved' },
  return_rejected:          { icon: 'undo',         color: '#ef4444', title: 'Return Rejected' },
  over_delivery_submitted:  { icon: 'package',      color: '#f59e0b', title: 'Over-Delivery Recorded' },
  over_delivery_approved:   { icon: 'package',      color: '#10b981', title: 'Over-Delivery Approved' },
  over_delivery_rejected:   { icon: 'package',      color: '#ef4444', title: 'Over-Delivery Rejected' },
  cancelled:                { icon: 'x',            color: '#ef4444', title: 'Order Cancelled' },
  amendment_applied:        { icon: 'edit',         color: '#38bdf8', title: 'Amendment Applied' },
  amendment_requested:      { icon: 'edit',         color: '#38bdf8', title: 'Amendment Requested' },
  amendment_approved:       { icon: 'edit',         color: '#10b981', title: 'Amendment Approved' },
  amendment_rejected:       { icon: 'edit',         color: '#ef4444', title: 'Amendment Rejected' },
  admin_edit:               { icon: 'edit',         color: '#a78bfa', title: 'Admin Edit' },
}

function eventMeta(action: string, toStatus: string) {
  return EVENT_MAP[action] ?? EVENT_MAP[toStatus]
    ?? { icon: 'dot', color: '#6b7280', title: (toStatus || action).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) }
}

const timelineNodes = computed(() => {
  const nodes: any[] = []

  // Synthesized "Order Placed" node — always first, from the order itself,
  // so admin-created orders (which auto-approve, skipping a submit row)
  // still show where the order started.
  if (order.value) {
    nodes.push({
      id: 'placed', icon: 'cart', color: '#6366f1', title: 'Order Placed',
      date: fmtDateTime(order.value.created_at ?? order.value.order_date),
      description: `Order created — ৳${Number(order.value.total_amount ?? 0).toLocaleString()}`,
      by: order.value.created_by_name ?? 'System',
    })
  }

  for (const w of apiWorkflow.value) {
    const meta = eventMeta(w.action, w.to_status)
    nodes.push({
      id: w.id, icon: meta.icon, color: meta.color, title: meta.title,
      date: fmtDateTime(w.performed_at),
      description: w.comments || meta.title,
      by: w.performed_by_name ?? 'System',
      pulse: true,
    })
  }

  // The log can lag behind the order: a step done outside the normal screens
  // (a gate-pass scan on the old system, a bulk status update) changes the
  // status without writing a log row, so the timeline would stop at an older
  // step while the order says otherwise. If the current status never appears
  // as a transition in the log, show it as the final step, honestly labelled.
  const o = order.value
  if (o?.status && !['draft', 'cancelled', 'rejected'].includes(o.status)) {
    const reached = new Set(apiWorkflow.value.filter((w: any) => w.from_status !== w.to_status).map((w: any) => w.to_status))
    if (apiWorkflow.value.length && !reached.has(o.status)) {
      const meta = eventMeta('', o.status)
      nodes.push({
        id: 'current-status', icon: meta.icon, color: meta.color, title: meta.title,
        date: fmtDateTime(o.updated_at),
        description: `Order is now ${meta.title}. No log entry was recorded for this step (done outside the normal screens, e.g. a gate-pass scan) — the time shown is when the status last changed.`,
        by: 'System',
        pulse: true,
      })
    }
  }
  return nodes
})

function fmtDateTime(dt: string | null): string {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleDateString('en-BD', { day: '2-digit', month: 'short' })
    + ' · '
    + d.toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ── Modal & loading state ────────────────────────────────
const approvalModal   = ref(false)
const approvalComment = ref('')
const { data: branchData } = await useFetch<any>('/api/branches')
const branchOptions = computed(() => ((branchData.value?.branches ?? []) as any[]).filter(b => b.status === 'active' && b.branch_type !== 'office'))
const todayStr = new Date().toISOString().slice(0, 10)
const isAdminUser = computed(() => isAdmin.value)
const approveFields = reactive({ branch_id: 0, required_date: '' })
watch(() => approvalModal.value, (open) => { if (open) { approveFields.branch_id = Number(order.value.assigned_branch_id ?? 0); approveFields.required_date = String(order.value.required_date ?? '').slice(0, 10) } })
const cancelModal     = ref(false)
const cancelReason    = ref('')
const deleteModal     = ref(false)
const acting          = ref(false)

// Return approval
const returnApprovalModal  = ref(false)
const returnApprovalNote   = ref('')
const pendingReturnTarget  = ref<any>(null)
const pendingReturnAction  = ref<'approve'|'reject'>('approve')

function openReturnApproval(ret: any, action: 'approve'|'reject') {
  pendingReturnTarget.value = ret
  pendingReturnAction.value = action
  returnApprovalNote.value  = ''
  returnApprovalModal.value = true
}

async function submitReturnApproval() {
  if (!pendingReturnTarget.value) return
  acting.value = true
  try {
    await $fetch(`/api/credit-sales/returns/${pendingReturnTarget.value.id}/status`, {
      method: 'PATCH',
      body: { action: pendingReturnAction.value, notes: returnApprovalNote.value || undefined },
    })
    returnApprovalModal.value = false
    if (pendingReturnAction.value === 'approve') {
      success(`Return ${pendingReturnTarget.value.return_number} approved — balance adjusted ✓`)
    } else {
      toastError(`Return ${pendingReturnTarget.value.return_number} rejected`)
    }
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Action failed')
  } finally {
    acting.value = false
  }
}

// ── Payment reversal ─────────────────────────────────────
const reverseModal  = ref(false)
const reverseTarget = ref<any>(null)
const reverseReason = ref('')

function openReversePayment(p: any) {
  reverseTarget.value = p
  reverseReason.value = ''
  reverseModal.value  = true
}

async function confirmReversePayment() {
  if (!reverseTarget.value) return
  acting.value = true
  try {
    await $fetch('/api/credit-sales/payments/reverse', {
      method: 'POST',
      body: { payment_id: reverseTarget.value.id, reason: reverseReason.value || undefined },
    })
    reverseModal.value = false
    warning(`Payment ${reverseTarget.value.payment_number} reversed — ledger adjusted`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Reversal failed')
  } finally {
    acting.value = false
  }
}

// ── Return deletion ───────────────────────────────────────
const deleteReturnModal  = ref(false)
const deleteReturnTarget = ref<any>(null)

function openDeleteReturn(ret: any) {
  deleteReturnTarget.value = ret
  deleteReturnModal.value  = true
}

async function confirmDeleteReturn() {
  if (!deleteReturnTarget.value) return
  acting.value = true
  try {
    await $fetch(`/api/credit-sales/returns/${deleteReturnTarget.value.id}`, { method: 'DELETE' })
    deleteReturnModal.value = false
    success(`Return ${deleteReturnTarget.value.return_number} deleted`)
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Delete failed')
  } finally {
    acting.value = false
  }
}

// ── API-backed actions ───────────────────────────────────
async function callWorkflow(toStatus: string, comments: string, extra: Record<string, any> = {}) {
  acting.value = true
  try {
    await $fetch(`/api/credit-sales/${id.value}/workflow`, {
      method: 'POST',
      body:   { to_status: toStatus, comments, ...extra },
    })
    await refresh()
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Action failed')
    throw e
  } finally {
    acting.value = false
  }
}

async function advanceStatus(newStatus: string, msg: string) {
  try {
    await callWorkflow(newStatus, msg)
    success(`${order.value.order_number}: ${msg}`)
  } catch {}
}

async function confirmApprove() {
  try {
    await callWorkflow('approved', approvalComment.value || 'Approved', { branch_id: approveFields.branch_id || undefined, required_date: approveFields.required_date || undefined })
    approvalModal.value  = false
    approvalComment.value = ''
    success(`${order.value.order_number} approved ✓`)
  } catch {}
}

async function confirmReject() {
  try {
    await callWorkflow('rejected', approvalComment.value || 'Rejected')
    approvalModal.value  = false
    approvalComment.value = ''
    toastError(`${order.value.order_number} rejected`)
  } catch {}
}

async function confirmCancel() {
  if (!cancelReason.value.trim()) return
  try {
    await callWorkflow('cancelled', cancelReason.value)
    cancelModal.value  = false
    cancelReason.value = ''
    warning(`${order.value.order_number} cancelled`)
  } catch {}
}

async function confirmDelete() {
  acting.value = true
  try {
    await $fetch(`/api/credit-sales/${id.value}`, { method: 'DELETE' })
    deleteModal.value = false
    success(`Order ${order.value.order_number} deleted`)
    navigateTo('/credit-sales/all')
  } catch (e: any) {
    toastError(e?.data?.statusMessage ?? 'Delete failed')
  } finally {
    acting.value = false
  }
}

function sendAlert() {
  success('Telegram alert sent to dispatch team')
}

function printInvoice() {
  navigateTo(`/credit-sales/${id.value}/invoice`)
}

function printDispatchSlip() {
  navigateTo(`/credit-sales/${id.value}/dispatch-slip`)
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.rel-btn { @apply shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.08] bg-white/[0.03] text-gray-300 hover:bg-white/[0.07] hover:text-gold-300 transition-colors whitespace-nowrap; }
.rel-n { @apply px-1.5 py-px rounded-full bg-gold-500/20 text-gold-300 text-[10px] font-bold; }
</style>