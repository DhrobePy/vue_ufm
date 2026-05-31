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
          <button @click="printInvoice" class="btn-ghost text-xs">🖨️ Print Invoice</button>
          <NuxtLink v-if="canCollectPayment" :to="`/credit-sales/${id}/payment`" class="btn-ghost text-xs">💰 Collect Payment</NuxtLink>

          <button v-if="order.status === 'pending_approval'"
            class="btn-gold text-xs" @click="approvalModal = true">
            📋 Review &amp; Approve
          </button>
          <button v-else-if="order.status === 'escalated'"
            class="btn-gold text-xs" @click="approvalModal = true"
            style="background:linear-gradient(135deg,#f97316,#ea580c);color:#000;">
            ⚠️ Escalation Review
          </button>
          <button v-else-if="order.status === 'approved'"
            class="btn-gold text-xs" :disabled="acting"
            @click="advanceStatus('in_production', 'Sent to production queue')">
            🏭 Send to Production
          </button>
          <button v-else-if="order.status === 'in_production'"
            class="btn-gold text-xs" :disabled="acting"
            @click="advanceStatus('ready_to_ship', 'Marked ready to ship')">
            📤 Ready to Dispatch
          </button>
          <button v-else-if="order.status === 'ready_to_ship' || order.status === 'shipped'"
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
                  <div class="text-right shrink-0">
                    <p class="text-sm font-bold text-red-400">-৳{{ Number(ret.total_returned_amount).toLocaleString() }}</p>
                    <span :class="['text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block',
                      ret.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                      ret.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-yellow-500/15 text-yellow-400']">
                      {{ ret.status }}
                    </span>
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
            <button @click="printInvoice" class="btn-ghost w-full justify-start text-xs py-2">🖨️ Print Invoice</button>
            <NuxtLink v-if="canCollectPayment" :to="`/credit-sales/${id}/payment`" class="btn-ghost w-full justify-start text-xs py-2">💰 Collect Payment</NuxtLink>
            <NuxtLink v-if="order.status === 'ready_to_ship' || order.status === 'shipped'" :to="`/credit-sales/${id}/deliver`" class="btn-ghost w-full justify-start text-xs py-2">📦 Record Delivery</NuxtLink>
            <button @click="sendAlert" class="btn-ghost w-full justify-start text-xs py-2">📱 Send Telegram Alert</button>
            <NuxtLink :to="`/credit-sales/${id}/return`" class="btn-ghost w-full justify-start text-xs py-2">↩️ Record Return</NuxtLink>
            <button v-if="!['cancelled','completed','rejected'].includes(order.status)"
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
    </template>
  </div>
</template>

<script setup lang="ts">
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
const apiWorkflow = computed(() => (data.value?.workflow ?? []) as any[])

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
  ['approved','in_production','ready_to_ship','delivered','partial_delivery','completed']
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
