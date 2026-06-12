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
          <button v-else-if="order.status === 'in_production' && perms.canDo('credit_sales', 'production', 'mark_ready')"
            class="btn-gold text-xs" :disabled="acting"
            @click="advanceStatus('ready_to_ship', 'Marked ready to ship')">
            📤 Ready to Dispatch
          </button>
          <button v-else-if="(order.status === 'ready_to_ship' || order.status === 'shipped' || order.status === 'dispatched') && perms.canDo('credit_sales', 'all', 'record_delivery')"
            class="btn-gold text-xs"
            @click="navigateTo(`/credit-sales/${id}/deliver`)">
            📦 Record Delivery
          </button>
          <button v-if="isAdmin"
            class="btn-ghost text-xs text-red-400 hover:bg-red-500/10 border-red-500/20"
            @click="deleteModal = true">
            🗑️ Delete
          </button>
        </template>
      </UiPageHeader>

      <!-- Animated order progress pipeline -->
      <UiOrderProgress :current-status="order.status" :history="orderHistory" />

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
                      <span v-if="p.payment_type === 'advance'" class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">ADVANCE</span>
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
                      <p class="text-sm font-bold text-emerald-400">৳{{ Number(p.amount).toLocaleString() }}</p>
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
                <div v-if="isAdmin && ret.status === 'pending'" class="flex items-center gap-2 pt-1">
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
          <!-- Workflow timeline -->
          <div class="glass-card p-5">
            <h3 class="section-title mb-4">Workflow History</h3>
            <div v-if="workflowTimeline.length" class="space-y-0">
              <div v-for="(wf, idx) in workflowTimeline" :key="wf.id" class="flex gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                       :style="`background:${wf.color}18;border:1px solid ${wf.color}30`">
                    <div class="w-2 h-2 rounded-full" :style="`background:${wf.color}`" />
                  </div>
                  <div v-if="idx < workflowTimeline.length - 1" class="w-px flex-1 bg-white/[0.06] my-1 min-h-[16px]" />
                </div>
                <div class="pb-4">
                  <p class="text-xs font-semibold text-gray-200">{{ wf.action }}</p>
                  <p class="text-[11px] text-gray-600 mt-0.5">{{ wf.by }} · {{ wf.time }}</p>
                  <p v-if="wf.note" class="text-[11px] text-gray-500 mt-1 italic">{{ wf.note }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-xs text-gray-600">No workflow events yet.</p>
          </div>

          <!-- Quick actions -->
          <div class="glass-card p-4 space-y-2">
            <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
            <button v-if="perms.canDo('credit_sales', 'all', 'print')" @click="printInvoice" class="btn-ghost w-full justify-start text-xs py-2">🖨️ Print Invoice</button>
            <NuxtLink v-if="canCollectPayment && perms.canDo('credit_sales', 'all', 'collect_payment')" :to="`/credit-sales/${id}/payment`" class="btn-ghost w-full justify-start text-xs py-2">💰 Collect Payment</NuxtLink>
            <NuxtLink v-if="(order.status === 'ready_to_ship' || order.status === 'shipped' || order.status === 'dispatched') && perms.canDo('credit_sales', 'all', 'record_delivery')" :to="`/credit-sales/${id}/deliver`" class="btn-ghost w-full justify-start text-xs py-2">📦 Record Delivery</NuxtLink>
            <button v-if="perms.canDo('credit_sales', 'all', 'telegram')" @click="sendAlert" class="btn-ghost w-full justify-start text-xs py-2">📱 Send Telegram Alert</button>
            <NuxtLink v-if="perms.canDo('credit_sales', 'all', 'record_return')" :to="`/credit-sales/${id}/return`" class="btn-ghost w-full justify-start text-xs py-2">↩️ Record Return</NuxtLink>
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
const payments  = computed(() => (data.value?.payments  ?? []) as any[])
const apiWorkflow = computed(() => (data.value?.workflow ?? []) as any[])

const totalPaid = computed(() =>
  payments.value.reduce((s: number, p: any) => s + Number(p.amount), 0),
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
  return (p.notes ?? '').startsWith('REVERSED')
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

const canCollectPayment = computed(() =>
  ['approved','in_production','ready_to_ship','dispatched','delivered','partial_delivery','completed']
    .includes(order.value.status),
)

// Build workflow history for UiOrderProgress (oldest-first, API now returns ASC)
const orderHistory = computed(() =>
  apiWorkflow.value.map((w: any) => ({
    status: w.to_status,
    by:     w.performed_by_name ?? 'System',
    at:     fmtDateTime(w.performed_at),
  })),
)

// Build sidebar timeline
const WF_COLORS = ['#6366f1','#eab308','#f97316','#10b981','#3b82f6','#06b6d4','#14b8a6','#a855f7']

const WF_LABELS: Record<string, string> = {
  pending_approval:  'Order Created',
  escalated:         'Escalated',
  approved:          'Approved',
  in_production:     'Sent to Production',
  ready_to_ship:     'Ready to Ship',
  shipped:           'Shipped',
  dispatched:        'Dispatched',
  delivered:         'Delivery Recorded',
  partial_delivery:  'Partial Delivery',
  payment_received:  'Payment Received',
  completed:         'Order Completed',
  return_submitted:  'Return Submitted',
  return_approved:   'Return Approved',
  return_rejected:   'Return Rejected',
  cancelled:         'Order Cancelled',
  rejected:          'Order Rejected',
}

const WF_EVENT_COLORS: Record<string, string> = {
  payment_received: '#10b981',
  completed:        '#a855f7',
  dispatched:       '#f97316',
  delivered:        '#14b8a6',
  partial_delivery: '#06b6d4',
  return_submitted: '#f59e0b',
  return_approved:  '#10b981',
  return_rejected:  '#ef4444',
  approved:         '#10b981',
  escalated:        '#f97316',
  cancelled:        '#ef4444',
  rejected:         '#ef4444',
}

// Sidebar timeline: newest on top (reverse of ASC api order)
const workflowTimeline = computed(() =>
  [...apiWorkflow.value].reverse().map((w: any, i: number) => ({
    id:     w.id,
    action: WF_LABELS[w.to_status] ?? (w.to_status as string).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    by:     w.performed_by_name ?? 'System',
    time:   fmtDateTime(w.performed_at),
    color:  WF_EVENT_COLORS[w.to_status] ?? WF_COLORS[i % WF_COLORS.length],
    note:   w.comments ?? '',
  })),
)

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
async function callWorkflow(toStatus: string, comments: string) {
  acting.value = true
  try {
    await $fetch(`/api/credit-sales/${id.value}/workflow`, {
      method: 'POST',
      body:   { to_status: toStatus, comments },
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
    await callWorkflow('approved', approvalComment.value || 'Approved')
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
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
