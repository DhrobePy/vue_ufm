import { _ as _sfc_main$2 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-C6rBgLMJ.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, mergeProps, unref, withCtx, createTextVNode, openBlock, createBlock, createCommentVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList, ssrRenderTeleport, ssrLooseContain, ssrRenderAttr, ssrLooseEqual } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, p as useUserSession, n as navigateTo } from './server.mjs';
import { u as usePermissions } from './usePermissions-2-WrZbuH.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import './permRoutes-D3m_BSE2.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "UiOrderProgress",
  __ssrInlineRender: true,
  props: {
    currentStatus: {},
    history: {}
  },
  setup(__props) {
    const props = __props;
    const activeTooltip = ref(-1);
    const STEPS = [
      { status: "pending_approval", label: "Pending", color: "#eab308" },
      { status: "escalated", label: "Escalated", color: "#f97316" },
      { status: "approved", label: "Approved", color: "#10b981" },
      { status: "in_production", label: "Production", color: "#3b82f6" },
      { status: "ready_to_ship", label: "Ready", color: "#06b6d4" },
      { status: "dispatched", label: "Dispatched", color: "#f97316" },
      { status: "delivered", label: "Delivered", color: "#14b8a6" },
      { status: "completed", label: "Completed", color: "#a855f7" }
    ];
    const visibleSteps = computed(() => {
      const steps = props.currentStatus === "escalated" ? STEPS : STEPS.filter((s) => s.status !== "escalated");
      return steps.map((s) => {
        var _a;
        const hist = (_a = props.history) == null ? void 0 : _a.find((h) => h.status === s.status);
        return { ...s, by: (hist == null ? void 0 : hist.by) || "", at: (hist == null ? void 0 : hist.at) || "" };
      });
    });
    const TERMINAL_BAD = ["rejected", "cancelled"];
    const isTerminalBad = computed(() => TERMINAL_BAD.includes(props.currentStatus));
    const currentIdx = computed(() => {
      const idx = visibleSteps.value.findIndex((s) => s.status === props.currentStatus);
      return idx;
    });
    function isDone(step, i) {
      if (isTerminalBad.value) return false;
      return i < currentIdx.value;
    }
    function isCurrent(step) {
      return step.status === props.currentStatus;
    }
    function nodeClass(step, i) {
      if (isTerminalBad.value) return "border-white/10 bg-white/[0.03] text-gray-700";
      if (isCurrent(step)) {
        if (step.status === "escalated") return "border-orange-400 bg-orange-500/20 text-orange-300 scale-110 shadow-lg shadow-orange-500/20";
        return "border-gold-400 bg-gold-500/20 text-gold-300 scale-110 shadow-lg shadow-gold-500/20";
      }
      if (isDone(step, i)) return "border-emerald-500 bg-emerald-500/20 text-emerald-400";
      return "border-white/10 bg-white/[0.03] text-gray-700";
    }
    const progressPct = computed(() => {
      if (isTerminalBad.value || currentIdx.value < 0) return 0;
      const n = visibleSteps.value.length;
      if (n <= 1) return 0;
      return Math.round(currentIdx.value / (n - 1) * 100);
    });
    const terminalEntry = computed(
      () => {
        var _a;
        return (_a = props.history) == null ? void 0 : _a.find((h) => TERMINAL_BAD.includes(h.status));
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "glass-card p-5" }, _attrs))} data-v-caf0d210><div class="flex items-center justify-between mb-6" data-v-caf0d210><h3 class="section-title" data-v-caf0d210>Order Progress</h3>`);
      _push(ssrRenderComponent(_component_UiStatusBadge, { status: __props.currentStatus }, null, _parent));
      _push(`</div>`);
      if (unref(isTerminalBad)) {
        _push(`<div class="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.08)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-caf0d210><svg class="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-caf0d210><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" data-v-caf0d210></path></svg><p class="text-xs text-red-400" data-v-caf0d210> Order <span class="font-semibold uppercase tracking-wider" data-v-caf0d210>${ssrInterpolate(__props.currentStatus.replace("_", " "))}</span>`);
        if ((_a = unref(terminalEntry)) == null ? void 0 : _a.by) {
          _push(`<span data-v-caf0d210> by <strong data-v-caf0d210>${ssrInterpolate(unref(terminalEntry).by)}</strong></span>`);
        } else {
          _push(`<!---->`);
        }
        if ((_b = unref(terminalEntry)) == null ? void 0 : _b.at) {
          _push(`<span data-v-caf0d210> \xB7 ${ssrInterpolate(unref(terminalEntry).at)}</span>`);
        } else {
          _push(`<span data-v-caf0d210> \u2014 no further action required</span>`);
        }
        _push(`</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative" data-v-caf0d210><div class="absolute top-5 left-5 right-5 h-0.5 bg-white/[0.06] rounded-full" data-v-caf0d210></div>`);
      if (!unref(isTerminalBad) && unref(progressPct) > 0) {
        _push(`<div class="absolute top-5 left-5 h-0.5 rounded-full transition-all duration-700 ease-out" style="${ssrRenderStyle(`width: calc(${unref(progressPct)}% - 2.5rem); background: linear-gradient(90deg, #f59e0b, #10b981)`)}" data-v-caf0d210></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative flex justify-between" data-v-caf0d210><!--[-->`);
      ssrRenderList(unref(visibleSteps), (step, i) => {
        _push(`<div class="flex flex-col items-center gap-2.5 cursor-pointer relative" style="${ssrRenderStyle(`width:${100 / unref(visibleSteps).length}%`)}" data-v-caf0d210><div class="${ssrRenderClass([nodeClass(step, i), "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative"])}" data-v-caf0d210>`);
        if (isCurrent(step) && !unref(isTerminalBad)) {
          _push(`<div class="absolute inset-0 rounded-full animate-ping opacity-30" style="${ssrRenderStyle(`background: ${step.color}`)}" data-v-caf0d210></div>`);
        } else {
          _push(`<!---->`);
        }
        if (isDone(step, i)) {
          _push(`<svg class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-caf0d210><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-caf0d210></path></svg>`);
        } else if (isCurrent(step) && step.status === "escalated") {
          _push(`<svg class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-caf0d210><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" data-v-caf0d210></path></svg>`);
        } else if (isCurrent(step)) {
          _push(`<svg class="w-3.5 h-3.5 relative z-10 animate-spin" fill="none" viewBox="0 0 24 24" data-v-caf0d210><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" data-v-caf0d210></circle><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" class="opacity-75" data-v-caf0d210></path></svg>`);
        } else {
          _push(`<span class="text-[11px] font-bold relative z-10" data-v-caf0d210>${ssrInterpolate(i + 1)}</span>`);
        }
        _push(`</div><span class="${ssrRenderClass([isCurrent(step) ? step.status === "escalated" ? "text-orange-400" : "text-gold-400" : isDone(step, i) ? "text-emerald-400" : "text-gray-700", "text-[9px] font-semibold uppercase tracking-wider text-center leading-tight transition-colors"])}" data-v-caf0d210>${ssrInterpolate(step.label)}</span>`);
        if (unref(activeTooltip) === i) {
          _push(`<div class="absolute z-30 w-44 rounded-xl px-3 py-2.5 text-xs shadow-2xl" style="${ssrRenderStyle({ "top": "calc(100% + 4px)", "background": "rgba(20,16,12,0.98)", "border": "1px solid rgba(255,255,255,0.1)" })}" data-v-caf0d210><div class="flex items-center gap-1.5 mb-1.5" data-v-caf0d210><div class="w-2 h-2 rounded-full" style="${ssrRenderStyle(`background:${step.color}`)}" data-v-caf0d210></div><p class="font-semibold text-gray-200" data-v-caf0d210>${ssrInterpolate(step.label)}</p></div>`);
          if (step.by) {
            _push(`<p class="text-gray-400" data-v-caf0d210>\u{1F464} ${ssrInterpolate(step.by)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (step.at) {
            _push(`<p class="text-gray-600 font-mono mt-0.5" data-v-caf0d210>\u{1F550} ${ssrInterpolate(step.at)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (!step.by && !isCurrent(step) && !isDone(step, i)) {
            _push(`<p class="text-gray-700 italic" data-v-caf0d210>Not reached yet</p>`);
          } else {
            _push(`<!---->`);
          }
          if (isCurrent(step) && !step.by) {
            _push(`<p class="text-gold-500/70" data-v-caf0d210>In progress\u2026</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UiOrderProgress.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-caf0d210"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const route = useRoute();
    const id = computed(() => Number(route.params.id));
    const { success, error: toastError } = useToast();
    const { user: sessionUser } = useUserSession();
    const isAdmin = computed(
      () => {
        var _a, _b;
        return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
      }
    );
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/credit-sales/${id.value}`,
      "$Oort5klUwG"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const order = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.order) != null ? _b : {};
    });
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const returns = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.returns) != null ? _b : [];
    });
    const payments = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payments) != null ? _b : [];
    });
    const apiWorkflow = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.workflow) != null ? _b : [];
    });
    const totalPaid = computed(
      () => payments.value.reduce((s, p) => s + Number(p.amount), 0)
    );
    function methodIcon(method) {
      const m = (method != null ? method : "").toLowerCase();
      if (m.includes("cash")) return "\u{1F4B5}";
      if (m.includes("mobile") || m.includes("bkash") || m.includes("nagad")) return "\u{1F4F1}";
      if (m.includes("bank") || m.includes("transfer")) return "\u{1F3E6}";
      if (m.includes("cheque") || m.includes("check")) return "\u{1F4C4}";
      return "\u{1F4B3}";
    }
    function isReversed(p) {
      var _a;
      return ((_a = p.notes) != null ? _a : "").startsWith("REVERSED");
    }
    const approvedReturns = computed(() => returns.value.filter((r) => r.status === "approved"));
    const pendingReturns = computed(() => returns.value.filter((r) => r.status === "pending"));
    const totalReturned = computed(() => approvedReturns.value.reduce((s, r) => s + Number(r.total_returned_amount), 0));
    const totalExposure = computed(() => {
      var _a, _b, _c, _d;
      const ledger = Number((_b = (_a = order.value.ledger_balance) != null ? _a : order.value.current_balance) != null ? _b : 0);
      const others = Number((_c = order.value.other_pending_exposure) != null ? _c : 0);
      const thisOrd = Number((_d = order.value.this_order_pending) != null ? _d : 0);
      return Math.max(0, ledger + others + thisOrd);
    });
    const creditPct = computed(() => {
      var _a;
      const limit = Number((_a = order.value.credit_limit) != null ? _a : 0);
      if (!limit) return 0;
      return Math.min(150, Math.round(totalExposure.value / limit * 100));
    });
    const canCollectPayment = computed(
      () => ["approved", "in_production", "ready_to_ship", "dispatched", "delivered", "partial_delivery", "completed"].includes(order.value.status)
    );
    const isAccountsFamily = computed(() => {
      var _a, _b;
      return ["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const isShippedOrLater = computed(() => {
      var _a;
      return ["shipped", "dispatched", "delivered", "completed", "cancelled", "rejected"].includes((_a = order.value) == null ? void 0 : _a.status);
    });
    const { data: gateData, refresh: refreshGate } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/credit-sales/${id.value}/gates`,
      { ignoreResponseError: true },
      "$1JrgT5rnEx"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const gate = computed(() => {
      var _a, _b;
      return (_b = (_a = gateData.value) == null ? void 0 : _a.gate) != null ? _b : null;
    });
    const gateConditionLabel = computed(() => {
      var _a, _b;
      const g = gate.value;
      if (!(g == null ? void 0 : g.dispatchHold)) return "";
      const amt = g.conditionAmount != null ? ` \u09F3${Number(g.conditionAmount).toLocaleString()}` : "";
      const map = {
        manual: "Manual clearance by accounts",
        outstanding_below: `Old dues must drop to${amt}`,
        outstanding_after_ship: Number(g.conditionAmount) === 0 ? "Pay everything incl. this invoice" : `Total dues after shipping \u2264${amt}`,
        amount_received: `Receive${amt} against this order`
      };
      return (_b = map[(_a = g.conditionType) != null ? _a : "manual"]) != null ? _b : "Dispatch hold";
    });
    const gateModal = ref(false);
    const gateSaving = ref(false);
    const gateForm = reactive({
      production_hold: false,
      production_hold_note: "",
      dispatch_hold: false,
      condition_type: "manual",
      condition_amount: null,
      auto_release: false,
      accounts_note: ""
    });
    const orderHistory = computed(
      () => apiWorkflow.value.map((w) => {
        var _a;
        return {
          status: w.to_status,
          by: (_a = w.performed_by_name) != null ? _a : "System",
          at: fmtDateTime(w.performed_at)
        };
      })
    );
    const WF_COLORS = ["#6366f1", "#eab308", "#f97316", "#10b981", "#3b82f6", "#06b6d4", "#14b8a6", "#a855f7"];
    const WF_LABELS = {
      pending_approval: "Order Created",
      escalated: "Escalated",
      approved: "Approved",
      in_production: "Sent to Production",
      ready_to_ship: "Ready to Ship",
      shipped: "Shipped",
      dispatched: "Dispatched",
      delivered: "Delivery Recorded",
      partial_delivery: "Partial Delivery",
      payment_received: "Payment Received",
      completed: "Order Completed",
      return_submitted: "Return Submitted",
      return_approved: "Return Approved",
      return_rejected: "Return Rejected",
      cancelled: "Order Cancelled",
      rejected: "Order Rejected"
    };
    const WF_EVENT_COLORS = {
      payment_received: "#10b981",
      completed: "#a855f7",
      dispatched: "#f97316",
      delivered: "#14b8a6",
      partial_delivery: "#06b6d4",
      return_submitted: "#f59e0b",
      return_approved: "#10b981",
      return_rejected: "#ef4444",
      approved: "#10b981",
      escalated: "#f97316",
      cancelled: "#ef4444",
      rejected: "#ef4444"
    };
    const workflowTimeline = computed(
      () => [...apiWorkflow.value].reverse().map((w, i) => {
        var _a, _b, _c, _d;
        return {
          id: w.id,
          action: (_a = WF_LABELS[w.to_status]) != null ? _a : w.to_status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          by: (_b = w.performed_by_name) != null ? _b : "System",
          time: fmtDateTime(w.performed_at),
          color: (_c = WF_EVENT_COLORS[w.to_status]) != null ? _c : WF_COLORS[i % WF_COLORS.length],
          note: (_d = w.comments) != null ? _d : ""
        };
      })
    );
    function fmtDateTime(dt) {
      if (!dt) return "\u2014";
      const d = new Date(dt);
      return d.toLocaleDateString("en-BD", { day: "2-digit", month: "short" }) + " \xB7 " + d.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    const approvalModal = ref(false);
    const approvalComment = ref("");
    const cancelModal = ref(false);
    const cancelReason = ref("");
    const deleteModal = ref(false);
    const acting = ref(false);
    const returnApprovalModal = ref(false);
    const returnApprovalNote = ref("");
    const pendingReturnTarget = ref(null);
    const pendingReturnAction = ref("approve");
    const reverseModal = ref(false);
    const reverseTarget = ref(null);
    const reverseReason = ref("");
    const deleteReturnModal = ref(false);
    const deleteReturnTarget = ref(null);
    async function callWorkflow(toStatus, comments) {
      var _a, _b;
      acting.value = true;
      try {
        await $fetch(`/api/credit-sales/${id.value}/workflow`, {
          method: "POST",
          body: { to_status: toStatus, comments }
        });
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Action failed");
        throw e;
      } finally {
        acting.value = false;
      }
    }
    async function advanceStatus(newStatus, msg) {
      try {
        await callWorkflow(newStatus, msg);
        success(`${order.value.order_number}: ${msg}`);
      } catch {
      }
    }
    function printInvoice() {
      navigateTo(`/credit-sales/${id.value}/invoice`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      const _component_UiPageHeader = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiOrderProgress = __nuxt_component_2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-ef0c2df7>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-ef0c2df7>Loading order\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-ef0c2df7>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(order).order_number,
          subtitle: unref(order).customer_name,
          breadcrumb: ["Credit Sales", "All Sales", unref(order).order_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canDo("credit_sales", "all", "print")) {
                _push2(`<button class="btn-ghost text-xs" data-v-ef0c2df7${_scopeId}>\u{1F5A8}\uFE0F Print Invoice</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(canCollectPayment) && unref(perms).canDo("credit_sales", "all", "collect_payment")) {
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/credit-sales/${unref(id)}/payment`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`\u{1F4B0} Collect Payment`);
                    } else {
                      return [
                        createTextVNode("\u{1F4B0} Collect Payment")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(order).status === "pending_approval" && unref(perms).canDo("credit_sales", "approve", "approve")) {
                _push2(`<button class="btn-gold text-xs" data-v-ef0c2df7${_scopeId}> \u{1F4CB} Review &amp; Approve </button>`);
              } else if (unref(order).status === "escalated" && unref(perms).canDo("credit_sales", "approve", "escalate")) {
                _push2(`<button class="btn-gold text-xs" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#f97316,#ea580c)", "color": "#000" })}" data-v-ef0c2df7${_scopeId}> \u26A0\uFE0F Escalation Review </button>`);
              } else if (unref(order).status === "approved" && unref(perms).canDo("credit_sales", "production", "mark_ready")) {
                _push2(`<button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} data-v-ef0c2df7${_scopeId}> \u{1F3ED} Send to Production </button>`);
              } else if (unref(order).status === "in_production" && unref(perms).canDo("credit_sales", "production", "mark_ready")) {
                _push2(`<button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} data-v-ef0c2df7${_scopeId}> \u{1F4E4} Ready to Dispatch </button>`);
              } else if ((unref(order).status === "ready_to_ship" || unref(order).status === "shipped" || unref(order).status === "dispatched") && unref(perms).canDo("credit_sales", "all", "record_delivery")) {
                _push2(`<button class="btn-gold text-xs" data-v-ef0c2df7${_scopeId}> \u{1F4E6} Record Delivery </button>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(isAdmin)) {
                _push2(`<button class="btn-ghost text-xs text-red-400 hover:bg-red-500/10 border-red-500/20" data-v-ef0c2df7${_scopeId}> \u{1F5D1}\uFE0F Delete </button>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canDo("credit_sales", "all", "print") ? (openBlock(), createBlock("button", {
                  key: 0,
                  onClick: printInvoice,
                  class: "btn-ghost text-xs"
                }, "\u{1F5A8}\uFE0F Print Invoice")) : createCommentVNode("", true),
                unref(canCollectPayment) && unref(perms).canDo("credit_sales", "all", "collect_payment") ? (openBlock(), createBlock(_component_NuxtLink, {
                  key: 1,
                  to: `/credit-sales/${unref(id)}/payment`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u{1F4B0} Collect Payment")
                  ]),
                  _: 1
                }, 8, ["to"])) : createCommentVNode("", true),
                unref(order).status === "pending_approval" && unref(perms).canDo("credit_sales", "approve", "approve") ? (openBlock(), createBlock("button", {
                  key: 2,
                  class: "btn-gold text-xs",
                  onClick: ($event) => approvalModal.value = true
                }, " \u{1F4CB} Review & Approve ", 8, ["onClick"])) : unref(order).status === "escalated" && unref(perms).canDo("credit_sales", "approve", "escalate") ? (openBlock(), createBlock("button", {
                  key: 3,
                  class: "btn-gold text-xs",
                  onClick: ($event) => approvalModal.value = true,
                  style: { "background": "linear-gradient(135deg,#f97316,#ea580c)", "color": "#000" }
                }, " \u26A0\uFE0F Escalation Review ", 8, ["onClick"])) : unref(order).status === "approved" && unref(perms).canDo("credit_sales", "production", "mark_ready") ? (openBlock(), createBlock("button", {
                  key: 4,
                  class: "btn-gold text-xs",
                  disabled: unref(acting),
                  onClick: ($event) => advanceStatus("in_production", "Sent to production queue")
                }, " \u{1F3ED} Send to Production ", 8, ["disabled", "onClick"])) : unref(order).status === "in_production" && unref(perms).canDo("credit_sales", "production", "mark_ready") ? (openBlock(), createBlock("button", {
                  key: 5,
                  class: "btn-gold text-xs",
                  disabled: unref(acting),
                  onClick: ($event) => advanceStatus("ready_to_ship", "Marked ready to ship")
                }, " \u{1F4E4} Ready to Dispatch ", 8, ["disabled", "onClick"])) : (unref(order).status === "ready_to_ship" || unref(order).status === "shipped" || unref(order).status === "dispatched") && unref(perms).canDo("credit_sales", "all", "record_delivery") ? (openBlock(), createBlock("button", {
                  key: 6,
                  class: "btn-gold text-xs",
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/credit-sales/${unref(id)}/deliver`)
                }, " \u{1F4E6} Record Delivery ", 8, ["onClick"])) : createCommentVNode("", true),
                unref(isAdmin) ? (openBlock(), createBlock("button", {
                  key: 7,
                  class: "btn-ghost text-xs text-red-400 hover:bg-red-500/10 border-red-500/20",
                  onClick: ($event) => deleteModal.value = true
                }, " \u{1F5D1}\uFE0F Delete ", 8, ["onClick"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiOrderProgress, {
          "current-status": unref(order).status,
          history: unref(orderHistory)
        }, null, _parent));
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-ef0c2df7><div class="lg:col-span-2 space-y-5" data-v-ef0c2df7><div class="glass-card p-5 space-y-4" data-v-ef0c2df7><div class="flex items-center justify-between" data-v-ef0c2df7><h3 class="section-title" data-v-ef0c2df7>Order Details</h3>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(order).status
        }, null, _parent));
        _push(`</div><div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm" data-v-ef0c2df7><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Customer</p><p class="text-gray-200 font-semibold" data-v-ef0c2df7>${ssrInterpolate(unref(order).customer_name)}</p></div><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Customer Type</p>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(order).customer_type || "credit"
        }, null, _parent));
        _push(`</div><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Branch</p><p class="text-gray-200" data-v-ef0c2df7>${ssrInterpolate(unref(order).branch_name || "\u2014")}</p></div><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Order Date</p><p class="text-gray-200" data-v-ef0c2df7>${ssrInterpolate(unref(order).order_date)}</p></div><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Required Date</p><p class="text-gray-200" data-v-ef0c2df7>${ssrInterpolate(unref(order).required_date || "\u2014")}</p></div><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Priority</p><span class="${ssrRenderClass([
          "text-xs font-medium",
          unref(order).priority === "urgent" ? "text-red-400" : unref(order).priority === "high" ? "text-orange-400" : "text-gray-500"
        ])}" data-v-ef0c2df7>${ssrInterpolate(unref(order).priority || "normal")}</span></div><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Order Total</p><p class="text-gold-400 font-bold text-base" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())}</p></div><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Amount Paid</p><p class="text-emerald-400 font-semibold" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(order).amount_paid).toLocaleString())}</p></div><div data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Balance Due</p><p class="text-red-400 font-bold" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(order).balance_due).toLocaleString())}</p></div></div>`);
        if (unref(order).delivery_address) {
          _push(`<div class="pt-3 border-t border-white/[0.06]" data-v-ef0c2df7><p class="text-xs text-gray-600 mb-1" data-v-ef0c2df7>Delivery Address</p><p class="text-sm text-gray-300" data-v-ef0c2df7>${ssrInterpolate(unref(order).delivery_address)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(order).created_by_name) {
          _push(`<div class="text-xs text-gray-600" data-v-ef0c2df7> Created by <span class="text-gray-400" data-v-ef0c2df7>${ssrInterpolate(unref(order).created_by_name)}</span>`);
          if (unref(order).approved_by_name) {
            _push(`<span data-v-ef0c2df7> \xB7 Approved by <span class="text-gray-400" data-v-ef0c2df7>${ssrInterpolate(unref(order).approved_by_name)}</span></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5" data-v-ef0c2df7><div class="flex items-center justify-between mb-3" data-v-ef0c2df7><h3 class="section-title" data-v-ef0c2df7>Credit Utilisation</h3><span class="${ssrRenderClass(["text-xs font-semibold", unref(creditPct) > 100 ? "text-red-400" : unref(creditPct) > 80 ? "text-orange-400" : "text-gray-500"])}" data-v-ef0c2df7>${ssrInterpolate(unref(creditPct))}% used </span></div><div class="h-2 rounded-full bg-white/[0.06] overflow-hidden" data-v-ef0c2df7><div class="h-full rounded-full transition-all duration-500" style="${ssrRenderStyle(`width:${Math.min(unref(creditPct), 100)}%;background:${unref(creditPct) > 100 ? "#ef4444" : unref(creditPct) > 80 ? "#ef4444" : unref(creditPct) > 60 ? "#f97316" : "#10b981"}`)}" data-v-ef0c2df7></div></div><div class="mt-3 space-y-1.5 text-[11px]" data-v-ef0c2df7><div class="flex justify-between text-gray-600" data-v-ef0c2df7><span data-v-ef0c2df7>Credit Limit</span><span class="text-gray-400 font-medium" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(order).credit_limit || 0).toLocaleString())}</span></div><div class="flex justify-between text-gray-600" data-v-ef0c2df7><span data-v-ef0c2df7>Delivered &amp; Unpaid (Ledger)</span><span class="text-orange-400/80" data-v-ef0c2df7>\u09F3${ssrInterpolate(Math.max(0, Number((_b = (_a = unref(order).ledger_balance) != null ? _a : unref(order).current_balance) != null ? _b : 0)).toLocaleString())}</span></div>`);
        if (Number(unref(order).other_pending_exposure) > 0) {
          _push(`<div class="flex justify-between text-gray-600" data-v-ef0c2df7><span data-v-ef0c2df7>Other Pending Orders</span><span class="text-yellow-400/80" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(order).other_pending_exposure).toLocaleString())}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(order).this_order_pending) > 0) {
          _push(`<div class="flex justify-between text-gray-600" data-v-ef0c2df7><span data-v-ef0c2df7>This Order (pre-delivery)</span><span class="text-blue-400/80" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(order).this_order_pending).toLocaleString())}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-between border-t border-white/[0.06] pt-1.5 mt-1" data-v-ef0c2df7><span class="font-semibold text-gray-400" data-v-ef0c2df7>Total Exposure</span><span class="${ssrRenderClass(["font-bold", unref(creditPct) > 100 ? "text-red-400" : unref(creditPct) > 80 ? "text-orange-400" : "text-emerald-400"])}" data-v-ef0c2df7> \u09F3${ssrInterpolate(unref(totalExposure).toLocaleString())}</span></div></div>`);
        if (unref(creditPct) > 100) {
          _push(`<p class="mt-2 text-[10px] text-red-400/80 leading-snug" data-v-ef0c2df7> \u26A0 Customer is over credit limit. Escalate to CFO before processing further orders. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5" data-v-ef0c2df7><h3 class="section-title mb-4" data-v-ef0c2df7>Line Items</h3><div class="overflow-x-auto" data-v-ef0c2df7><table class="w-full text-sm" data-v-ef0c2df7><thead data-v-ef0c2df7><tr class="border-b border-white/[0.06] text-[11px] text-gray-600 uppercase tracking-wider" data-v-ef0c2df7><th class="pb-2.5 text-left font-semibold" data-v-ef0c2df7>Product</th><th class="pb-2.5 text-right font-semibold" data-v-ef0c2df7>Qty (bags)</th><th class="pb-2.5 text-right font-semibold" data-v-ef0c2df7>Unit Price</th><th class="pb-2.5 text-right font-semibold" data-v-ef0c2df7>Discount</th><th class="pb-2.5 text-right font-semibold" data-v-ef0c2df7>Total</th></tr></thead><tbody class="divide-y divide-white/[0.04]" data-v-ef0c2df7><!--[-->`);
        ssrRenderList(unref(items), (item) => {
          _push(`<tr class="hover:bg-white/[0.02]" data-v-ef0c2df7><td class="py-3 text-gray-300" data-v-ef0c2df7>${ssrInterpolate(item.product_name)} `);
          if (item.weight_variant) {
            _push(`<span class="text-xs text-gray-500" data-v-ef0c2df7> \xB7 ${ssrInterpolate(item.weight_variant)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="py-3 text-right text-gray-400" data-v-ef0c2df7>${ssrInterpolate(Number(item.qty_bags).toLocaleString())}</td><td class="py-3 text-right text-gray-400" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(item.unit_price).toLocaleString())}</td><td class="py-3 text-right text-red-400/70" data-v-ef0c2df7>${ssrInterpolate(Number(item.discount_amount) > 0 ? `-\u09F3${Number(item.discount_amount).toLocaleString()}` : "\u2014")}</td><td class="py-3 text-right font-semibold text-gold-400" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(item.line_total).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(items).length) {
          _push(`<tr data-v-ef0c2df7><td colspan="5" class="py-6 text-center text-xs text-gray-600" data-v-ef0c2df7>No line items</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody>`);
        if (unref(items).length) {
          _push(`<tfoot data-v-ef0c2df7><tr class="border-t border-white/[0.08]" data-v-ef0c2df7><td colspan="4" class="pt-3 text-right text-sm font-bold text-gray-300" data-v-ef0c2df7>Sub-Total</td><td class="pt-3 text-right font-bold text-gold-400 text-base" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())}</td></tr>`);
          if (unref(totalReturned) > 0) {
            _push(`<tr data-v-ef0c2df7><td colspan="4" class="pt-1 text-right text-xs text-amber-400/80" data-v-ef0c2df7>Credit Notes (Returns)</td><td class="pt-1 text-right text-xs text-amber-400 font-semibold" data-v-ef0c2df7>-\u09F3${ssrInterpolate(unref(totalReturned).toLocaleString())}</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(pendingReturns).length) {
            _push(`<tr data-v-ef0c2df7><td colspan="4" class="pt-1 text-right text-xs text-yellow-500/70" data-v-ef0c2df7>Pending Returns (unprocessed)</td><td class="pt-1 text-right text-xs text-yellow-500/70 italic" data-v-ef0c2df7> \u09F3${ssrInterpolate(unref(pendingReturns).reduce((s, r) => s + Number(r.total_returned_amount), 0).toLocaleString())} \u23F3 </td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<tr data-v-ef0c2df7><td colspan="4" class="pt-1 text-right text-xs text-gray-500" data-v-ef0c2df7>Amount Paid</td><td class="pt-1 text-right text-xs text-emerald-400 font-semibold" data-v-ef0c2df7>-\u09F3${ssrInterpolate(Number(unref(order).amount_paid).toLocaleString())}</td></tr><tr class="border-t border-white/[0.06]" data-v-ef0c2df7><td colspan="4" class="pt-2 text-right text-xs font-bold text-gray-300" data-v-ef0c2df7>Balance Due</td><td class="pt-2 text-right text-sm font-bold text-red-400" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(order).balance_due).toLocaleString())}</td></tr></tfoot>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</table></div></div>`);
        if (unref(order).special_notes) {
          _push(`<div class="glass-card p-5" data-v-ef0c2df7><h3 class="section-title mb-2" data-v-ef0c2df7>Special Instructions</h3><p class="text-sm text-gray-400 italic" data-v-ef0c2df7>${ssrInterpolate(unref(order).special_notes)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-5 space-y-4" data-v-ef0c2df7><div class="flex items-center justify-between" data-v-ef0c2df7><h3 class="section-title" data-v-ef0c2df7>Payments Received</h3>`);
        if (unref(payments).length) {
          _push(`<span class="text-[11px] font-semibold text-emerald-400" data-v-ef0c2df7> \u09F3${ssrInterpolate(unref(totalPaid).toLocaleString())} of \u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(payments).length) {
          _push(`<div class="space-y-0 divide-y divide-white/[0.04]" data-v-ef0c2df7><!--[-->`);
          ssrRenderList(unref(payments), (p) => {
            _push(`<div class="${ssrRenderClass([isReversed(p) ? "opacity-40" : "", "py-3 space-y-2"])}" data-v-ef0c2df7><div class="flex items-start gap-3" data-v-ef0c2df7><div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10 text-emerald-400 text-xs font-bold mt-0.5" data-v-ef0c2df7>${ssrInterpolate(methodIcon(p.payment_method))}</div><div class="flex-1 min-w-0" data-v-ef0c2df7><div class="flex items-center gap-2 flex-wrap" data-v-ef0c2df7><p class="text-xs font-mono font-semibold text-gray-300" data-v-ef0c2df7>${ssrInterpolate(p.payment_number)}</p>`);
            if (p.payment_type === "advance") {
              _push(`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20" data-v-ef0c2df7>ADVANCE</span>`);
            } else {
              _push(`<!---->`);
            }
            if (isReversed(p)) {
              _push(`<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20" data-v-ef0c2df7>REVERSED</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><p class="text-[11px] text-gray-500 mt-0.5" data-v-ef0c2df7><span class="font-medium text-gray-400" data-v-ef0c2df7>${ssrInterpolate(p.payment_method)}</span>`);
            if (p.bank_name) {
              _push(`<!--[--> \xB7 ${ssrInterpolate(p.bank_name)}`);
              if (p.bank_account_number) {
                _push(`<span class="font-mono" data-v-ef0c2df7> (${ssrInterpolate(p.bank_account_number)})</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            } else if (p.cash_account_name) {
              _push(`<!--[--> \xB7 ${ssrInterpolate(p.cash_account_name)}<!--]-->`);
            } else {
              _push(`<!---->`);
            }
            if (p.bank_transaction_type) {
              _push(`<!--[--> \xB7 ${ssrInterpolate(p.bank_transaction_type)}<!--]-->`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p>`);
            if (p.cheque_number) {
              _push(`<p class="text-[11px] text-gray-600 mt-0.5" data-v-ef0c2df7> Cheque #<span class="font-mono text-gray-400" data-v-ef0c2df7>${ssrInterpolate(p.cheque_number)}</span>`);
              if (p.cheque_date) {
                _push(`<span data-v-ef0c2df7> dated ${ssrInterpolate(String(p.cheque_date).slice(0, 10))}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</p>`);
            } else {
              _push(`<!---->`);
            }
            if (p.reference_number && p.reference_number !== p.payment_number) {
              _push(`<p class="text-[11px] text-gray-600 mt-0.5" data-v-ef0c2df7> Ref: <span class="font-mono text-gray-400" data-v-ef0c2df7>${ssrInterpolate(p.reference_number)}</span></p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<p class="text-[11px] text-gray-600 mt-0.5" data-v-ef0c2df7> Collected by: <span class="text-gray-400" data-v-ef0c2df7>`);
            if (p.collector_first_name) {
              _push(`<!--[-->${ssrInterpolate(p.collector_first_name)} ${ssrInterpolate(p.collector_last_name)}<!--]-->`);
            } else if (p.collected_by) {
              _push(`<!--[-->${ssrInterpolate(p.collected_by)}<!--]-->`);
            } else {
              _push(`<!--[-->\u2014<!--]-->`);
            }
            _push(`</span>`);
            if (p.journal_entry_id) {
              _push(`<span class="ml-2" data-v-ef0c2df7> \xB7 `);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/accounts/journal",
                class: "text-blue-400 hover:text-blue-300 font-mono transition-colors"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`JE-${ssrInterpolate(p.journal_entry_id)}`);
                  } else {
                    return [
                      createTextVNode("JE-" + toDisplayString(p.journal_entry_id), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p>`);
            if (p.notes) {
              _push(`<p class="text-[10px] text-gray-600 mt-0.5 italic" data-v-ef0c2df7>${ssrInterpolate(p.notes)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="flex items-center gap-3 shrink-0" data-v-ef0c2df7><div class="text-right" data-v-ef0c2df7><p class="text-sm font-bold text-emerald-400" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(p.amount).toLocaleString())}</p><p class="text-[10px] text-gray-600 mt-0.5" data-v-ef0c2df7>${ssrInterpolate(String(p.payment_date).slice(0, 10))}</p></div>`);
            if (unref(isAdmin) && !isReversed(p)) {
              _push(`<button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150" title="Reverse this payment" data-v-ef0c2df7><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ef0c2df7><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" data-v-ef0c2df7></path></svg></button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="py-6 text-center" data-v-ef0c2df7><p class="text-xs text-gray-600" data-v-ef0c2df7>No payments recorded yet.</p>`);
          if (unref(canCollectPayment)) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/${unref(id)}/payment`,
              class: "text-xs text-gold-400 hover:text-gold-300 mt-1 inline-block transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` + Collect payment \u2192 `);
                } else {
                  return [
                    createTextVNode(" + Collect payment \u2192 ")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        if (unref(payments).length) {
          _push(`<div class="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Balance remaining</span><span class="${ssrRenderClass(["font-bold", Number(unref(order).balance_due) > 0 ? "text-red-400" : "text-emerald-400"])}" data-v-ef0c2df7> \u09F3${ssrInterpolate(Number(unref(order).balance_due).toLocaleString())}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(returns).length) {
          _push(`<div class="glass-card p-5 space-y-4" data-v-ef0c2df7><div class="flex items-center justify-between" data-v-ef0c2df7><h3 class="section-title" data-v-ef0c2df7>Returns &amp; Credit Notes</h3><div class="flex items-center gap-2" data-v-ef0c2df7>`);
          if (unref(pendingReturns).length) {
            _push(`<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/20" data-v-ef0c2df7>${ssrInterpolate(unref(pendingReturns).length)} pending </span>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(approvedReturns).length) {
            _push(`<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400" data-v-ef0c2df7>${ssrInterpolate(unref(approvedReturns).length)} approved </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="space-y-3" data-v-ef0c2df7><!--[-->`);
          ssrRenderList(unref(returns), (ret) => {
            var _a2, _b2, _c2;
            _push(`<div class="${ssrRenderClass([ret.status === "pending" ? "border-yellow-500/25 bg-yellow-500/[0.04]" : ret.status === "approved" ? "border-emerald-500/20 bg-white/[0.02]" : "border-red-500/20 bg-red-500/[0.03] opacity-60", "rounded-xl border p-4 space-y-3"])}" data-v-ef0c2df7><div class="flex items-start justify-between gap-3" data-v-ef0c2df7><div data-v-ef0c2df7><p class="text-xs font-mono font-bold text-gold-400/80" data-v-ef0c2df7>${ssrInterpolate(ret.return_number)}</p><p class="text-[11px] text-gray-500 mt-0.5" data-v-ef0c2df7>${ssrInterpolate(ret.return_date)} \xB7 ${ssrInterpolate((_a2 = ret.return_reason) != null ? _a2 : "\u2014")}</p><p class="text-[10px] text-gray-600 mt-0.5" data-v-ef0c2df7>By ${ssrInterpolate((_b2 = ret.created_by_name) != null ? _b2 : "Unknown")}</p></div><div class="flex flex-col items-end gap-2 shrink-0" data-v-ef0c2df7><div class="text-right" data-v-ef0c2df7><p class="text-sm font-bold text-red-400" data-v-ef0c2df7>-\u09F3${ssrInterpolate(Number(ret.total_returned_amount).toLocaleString())}</p><span class="${ssrRenderClass([
              "text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block",
              ret.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : ret.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/15 text-yellow-400"
            ])}" data-v-ef0c2df7>${ssrInterpolate(ret.status)}</span></div>`);
            if (unref(isAdmin)) {
              _push(`<button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150" title="Delete this return" data-v-ef0c2df7><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-ef0c2df7><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-ef0c2df7></path></svg></button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
            if ((_c2 = ret.items) == null ? void 0 : _c2.length) {
              _push(`<div class="text-[11px] text-gray-500 space-y-1" data-v-ef0c2df7><!--[-->`);
              ssrRenderList(ret.items, (ri) => {
                _push(`<div class="flex justify-between" data-v-ef0c2df7><span data-v-ef0c2df7>${ssrInterpolate(ri.product_name)}`);
                if (ri.weight_variant) {
                  _push(`<span class="text-gray-600" data-v-ef0c2df7> \xB7 ${ssrInterpolate(ri.weight_variant)}</span>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</span><span class="font-mono" data-v-ef0c2df7>\xD7${ssrInterpolate(Number(ri.returned_qty).toFixed(0))} @ \u09F3${ssrInterpolate(Number(ri.unit_price).toLocaleString())}</span></div>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(isAdmin) && ret.status === "pending") {
              _push(`<div class="flex items-center gap-2 pt-1" data-v-ef0c2df7><span class="text-[10px] text-yellow-400/70 flex-1" data-v-ef0c2df7>\u23F3 Awaiting your approval \u2014 balance will be adjusted upon approval</span><button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all" data-v-ef0c2df7> \u2713 Approve </button><button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all" data-v-ef0c2df7> \u2717 Reject </button></div>`);
            } else if (ret.status === "approved" && ret.approved_by_name) {
              _push(`<div class="text-[10px] text-gray-600" data-v-ef0c2df7> Approved by ${ssrInterpolate(ret.approved_by_name)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-5" data-v-ef0c2df7><div class="glass-card p-5" data-v-ef0c2df7><h3 class="section-title mb-4" data-v-ef0c2df7>Workflow History</h3>`);
        if (unref(workflowTimeline).length) {
          _push(`<div class="space-y-0" data-v-ef0c2df7><!--[-->`);
          ssrRenderList(unref(workflowTimeline), (wf, idx) => {
            _push(`<div class="flex gap-3" data-v-ef0c2df7><div class="flex flex-col items-center" data-v-ef0c2df7><div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="${ssrRenderStyle(`background:${wf.color}18;border:1px solid ${wf.color}30`)}" data-v-ef0c2df7><div class="w-2 h-2 rounded-full" style="${ssrRenderStyle(`background:${wf.color}`)}" data-v-ef0c2df7></div></div>`);
            if (idx < unref(workflowTimeline).length - 1) {
              _push(`<div class="w-px flex-1 bg-white/[0.06] my-1 min-h-[16px]" data-v-ef0c2df7></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="pb-4" data-v-ef0c2df7><p class="text-xs font-semibold text-gray-200" data-v-ef0c2df7>${ssrInterpolate(wf.action)}</p><p class="text-[11px] text-gray-600 mt-0.5" data-v-ef0c2df7>${ssrInterpolate(wf.by)} \xB7 ${ssrInterpolate(wf.time)}</p>`);
            if (wf.note) {
              _push(`<p class="text-[11px] text-gray-500 mt-1 italic" data-v-ef0c2df7>${ssrInterpolate(wf.note)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<p class="text-xs text-gray-600" data-v-ef0c2df7>No workflow events yet.</p>`);
        }
        _push(`</div>`);
        if (((_c = unref(gate)) == null ? void 0 : _c.exists) || unref(isAccountsFamily) && !unref(isShippedOrLater)) {
          _push(`<div class="${ssrRenderClass([((_d = unref(gate)) == null ? void 0 : _d.dispatchHold) && !((_e = unref(gate)) == null ? void 0 : _e.dispatchCleared) ? "border border-amber-500/25" : "", "glass-card p-4 space-y-2"])}" data-v-ef0c2df7><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" data-v-ef0c2df7>Dispatch Control</h3>`);
          if ((_f = unref(gate)) == null ? void 0 : _f.exists) {
            _push(`<!--[-->`);
            if (unref(gate).productionHold) {
              _push(`<div class="${ssrRenderClass([unref(gate).productionReleased ? "text-gray-500" : "text-red-400", "text-[11px] flex items-center gap-1.5"])}" data-v-ef0c2df7> \u26D4 Production hold ${ssrInterpolate(unref(gate).productionReleased ? "(released)" : "\u2014 active")}</div>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(gate).dispatchHold) {
              _push(`<div class="text-[11px] space-y-1" data-v-ef0c2df7><p class="${ssrRenderClass(unref(gate).dispatchCleared ? "text-emerald-400" : unref(gate).conditionMet ? "text-emerald-300" : "text-amber-400")}" data-v-ef0c2df7>${ssrInterpolate(unref(gate).dispatchCleared ? "\u{1F7E2} Dispatch clearance granted" : unref(gate).conditionMet ? "\u2713 Condition met \u2014 awaiting clearance" : "\u{1F6AB} Dispatch held \u2014 condition pending")}</p><p class="text-gray-600" data-v-ef0c2df7>${ssrInterpolate(unref(gateConditionLabel))} `);
              if (unref(gate).autoRelease) {
                _push(`<span class="text-amber-500/80" data-v-ef0c2df7> \xB7 auto-release</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</p>`);
              if (unref(gate).accountsNote) {
                _push(`<p class="text-gray-600 italic" data-v-ef0c2df7>\u{1F4DD} ${ssrInterpolate(unref(gate).accountsNote)}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            } else {
              _push(`<!---->`);
            }
            if (!unref(gate).productionHold && !unref(gate).dispatchHold) {
              _push(`<div class="text-[11px] text-gray-600" data-v-ef0c2df7> No active holds </div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<p class="text-[11px] text-gray-600" data-v-ef0c2df7>No holds \u2014 order will dispatch freely</p>`);
          }
          if (unref(isAccountsFamily) && !unref(isShippedOrLater)) {
            _push(`<div class="flex flex-wrap gap-2 pt-1" data-v-ef0c2df7><button class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-500/12 text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 transition-colors" data-v-ef0c2df7> \u2699 ${ssrInterpolate(((_g = unref(gate)) == null ? void 0 : _g.exists) ? "Edit Conditions" : "Set Hold / Condition")}</button>`);
            if (((_h = unref(gate)) == null ? void 0 : _h.dispatchHold) && !((_i = unref(gate)) == null ? void 0 : _i.dispatchCleared)) {
              _push(`<button class="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors" data-v-ef0c2df7> \u2713 Grant Clearance </button>`);
            } else {
              _push(`<!---->`);
            }
            if ((_j = unref(gate)) == null ? void 0 : _j.dispatchCleared) {
              _push(`<button class="px-3 py-1.5 rounded-lg text-[11px] text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 transition-colors" data-v-ef0c2df7> Revoke </button>`);
            } else {
              _push(`<!---->`);
            }
            if (((_k = unref(gate)) == null ? void 0 : _k.productionHold) && !((_l = unref(gate)) == null ? void 0 : _l.productionReleased) && unref(isAdmin)) {
              _push(`<button class="px-3 py-1.5 rounded-lg text-[11px] text-amber-400 border border-amber-500/25 hover:bg-amber-500/10 transition-colors" data-v-ef0c2df7> Release Production </button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-4 space-y-2" data-v-ef0c2df7><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" data-v-ef0c2df7>Quick Actions</h3>`);
        if (unref(perms).canDo("credit_sales", "all", "print")) {
          _push(`<button class="btn-ghost w-full justify-start text-xs py-2" data-v-ef0c2df7>\u{1F5A8}\uFE0F Print Invoice</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(canCollectPayment) && unref(perms).canDo("credit_sales", "all", "collect_payment")) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${unref(id)}/payment`,
            class: "btn-ghost w-full justify-start text-xs py-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F4B0} Collect Payment`);
              } else {
                return [
                  createTextVNode("\u{1F4B0} Collect Payment")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if ((unref(order).status === "ready_to_ship" || unref(order).status === "shipped" || unref(order).status === "dispatched") && unref(perms).canDo("credit_sales", "all", "record_delivery")) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${unref(id)}/deliver`,
            class: "btn-ghost w-full justify-start text-xs py-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F4E6} Record Delivery`);
              } else {
                return [
                  createTextVNode("\u{1F4E6} Record Delivery")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (unref(perms).canDo("credit_sales", "all", "telegram")) {
          _push(`<button class="btn-ghost w-full justify-start text-xs py-2" data-v-ef0c2df7>\u{1F4F1} Send Telegram Alert</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(perms).canDo("credit_sales", "all", "record_return")) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${unref(id)}/return`,
            class: "btn-ghost w-full justify-start text-xs py-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u21A9\uFE0F Record Return`);
              } else {
                return [
                  createTextVNode("\u21A9\uFE0F Record Return")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (!["cancelled", "rejected"].includes(unref(order).status)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${unref(id)}/amend`,
            class: "btn-ghost w-full justify-start text-xs py-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F4DD} Amend Order`);
              } else {
                return [
                  createTextVNode("\u{1F4DD} Amend Order")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (!["cancelled", "completed", "rejected"].includes(unref(order).status) && unref(perms).canDo("credit_sales", "all", "cancel")) {
          _push(`<button class="btn-ghost w-full justify-start text-xs py-2 text-red-400 hover:bg-red-500/10" data-v-ef0c2df7> \u274C Cancel Order </button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isAdmin)) {
          _push(`<button class="btn-ghost w-full justify-start text-xs py-2 text-red-500 hover:bg-red-500/10" data-v-ef0c2df7> \u{1F5D1}\uFE0F Delete Order </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(approvalModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-ef0c2df7><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-ef0c2df7></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-ef0c2df7><h3 class="section-title" data-v-ef0c2df7>${ssrInterpolate(unref(order).status === "escalated" ? "\u26A0\uFE0F Escalation Review" : "\u{1F4CB} Order Review")}</h3><p class="text-sm text-gray-400" data-v-ef0c2df7><span class="text-gold-400 font-semibold" data-v-ef0c2df7>${ssrInterpolate(unref(order).order_number)}</span>`);
            if (unref(order).status === "escalated") {
              _push2(`<span data-v-ef0c2df7> \u2014 escalated due to credit concerns (${ssrInterpolate(unref(creditPct))}% utilisation)</span>`);
            } else {
              _push2(`<span data-v-ef0c2df7> \u2014 \u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())} \xB7 ${ssrInterpolate(unref(order).customer_name)}</span>`);
            }
            _push2(`</p>`);
            if (unref(creditPct) > 80) {
              _push2(`<div class="rounded-xl p-3 text-xs" style="${ssrRenderStyle({ "background": "rgba(249,115,22,0.08)", "border": "1px solid rgba(249,115,22,0.2)" })}" data-v-ef0c2df7><p class="text-orange-400 font-semibold" data-v-ef0c2df7>\u26A0 Credit Utilisation: ${ssrInterpolate(unref(creditPct))}%</p><p class="text-gray-500 mt-0.5" data-v-ef0c2df7>Customer is near or over credit limit. Ensure CFO sign-off before approving.</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="space-y-1.5" data-v-ef0c2df7><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-ef0c2df7>Comment (optional)</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="Add a note for the record\u2026" data-v-ef0c2df7>${ssrInterpolate(unref(approvalComment))}</textarea></div><div class="flex gap-3" data-v-ef0c2df7><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold flex-1 justify-center" data-v-ef0c2df7>${ssrInterpolate(unref(acting) ? "\u2026" : "\u2713 Approve")}</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-40" data-v-ef0c2df7> \u2717 Reject </button></div><button class="btn-ghost w-full text-xs py-1.5" data-v-ef0c2df7>Cancel</button></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        ssrRenderTeleport(_push, (_push2) => {
          var _a2, _b2, _c2;
          if (unref(returnApprovalModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-ef0c2df7><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-ef0c2df7></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-ef0c2df7><h3 class="${ssrRenderClass(["section-title", unref(pendingReturnAction) === "reject" ? "text-red-400" : "text-emerald-400"])}" data-v-ef0c2df7>${ssrInterpolate(unref(pendingReturnAction) === "approve" ? "\u2713 Approve Return" : "\u2717 Reject Return")}</h3>`);
            if (unref(pendingReturnTarget)) {
              _push2(`<div class="${ssrRenderClass([unref(pendingReturnAction) === "approve" ? "bg-emerald-500/08 border border-emerald-500/20" : "bg-red-500/08 border border-red-500/20", "rounded-xl p-3 text-xs space-y-1"])}" data-v-ef0c2df7><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Return #</span><span class="font-mono font-bold text-gold-400/80" data-v-ef0c2df7>${ssrInterpolate(unref(pendingReturnTarget).return_number)}</span></div><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Amount</span><span class="font-bold text-red-400" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(pendingReturnTarget).total_returned_amount).toLocaleString())}</span></div><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Reason</span><span class="text-gray-300" data-v-ef0c2df7>${ssrInterpolate((_a2 = unref(pendingReturnTarget).return_reason) != null ? _a2 : "\u2014")}</span></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(pendingReturnAction) === "approve") {
              _push2(`<p class="text-xs text-gray-400" data-v-ef0c2df7> Approving will immediately deduct <span class="text-red-400 font-semibold" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number((_c2 = (_b2 = unref(pendingReturnTarget)) == null ? void 0 : _b2.total_returned_amount) != null ? _c2 : 0).toLocaleString())}</span> from the order balance and customer ledger. </p>`);
            } else {
              _push2(`<p class="text-xs text-gray-400" data-v-ef0c2df7> Rejecting will dismiss this return request. No balance adjustments will be made. </p>`);
            }
            _push2(`<div class="space-y-1.5" data-v-ef0c2df7><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-ef0c2df7>Note (optional)</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="Add a note for the record\u2026" data-v-ef0c2df7>${ssrInterpolate(unref(returnApprovalNote))}</textarea></div><div class="flex gap-3" data-v-ef0c2df7><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="${ssrRenderClass([
              "flex-1 py-2 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all",
              unref(pendingReturnAction) === "approve" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25"
            ])}" data-v-ef0c2df7>${ssrInterpolate(unref(acting) ? "\u2026" : unref(pendingReturnAction) === "approve" ? "\u2713 Confirm Approve" : "\u2717 Confirm Reject")}</button><button class="btn-ghost flex-1" data-v-ef0c2df7>Cancel</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(gateModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" data-v-ef0c2df7><div class="absolute inset-0 bg-black/70 backdrop-blur-sm" data-v-ef0c2df7></div><div class="relative w-full max-w-lg glass-card p-6 space-y-4 animate-slide-up my-8" data-v-ef0c2df7><h3 class="section-title text-amber-300" data-v-ef0c2df7>\u2699 Dispatch Control \u2014 ${ssrInterpolate(unref(order).order_number)}</h3><p class="text-xs text-gray-500" data-v-ef0c2df7> Holds apply from this moment until cleared. The dispatch button enforces them server-side. </p><label class="flex items-center gap-2 cursor-pointer text-sm text-gray-300" data-v-ef0c2df7><input${ssrIncludeBooleanAttr(Array.isArray(unref(gateForm).production_hold) ? ssrLooseContain(unref(gateForm).production_hold, null) : unref(gateForm).production_hold) ? " checked" : ""} type="checkbox" class="accent-amber-500" data-v-ef0c2df7> \u26D4 Hold production until admin releases </label>`);
            if (unref(gateForm).production_hold) {
              _push2(`<input${ssrRenderAttr("value", unref(gateForm).production_hold_note)} type="text" class="input-glass w-full py-1.5 text-xs" placeholder="Why is production held?" data-v-ef0c2df7>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<label class="flex items-center gap-2 cursor-pointer text-sm text-gray-300" data-v-ef0c2df7><input${ssrIncludeBooleanAttr(Array.isArray(unref(gateForm).dispatch_hold) ? ssrLooseContain(unref(gateForm).dispatch_hold, null) : unref(gateForm).dispatch_hold) ? " checked" : ""} type="checkbox" class="accent-amber-500" data-v-ef0c2df7> \u{1F6AB} Hold dispatch until a payment condition is met </label>`);
            if (unref(gateForm).dispatch_hold) {
              _push2(`<!--[--><select class="input-glass w-full py-1.5 text-xs" data-v-ef0c2df7><option value="manual" data-v-ef0c2df7${ssrIncludeBooleanAttr(Array.isArray(unref(gateForm).condition_type) ? ssrLooseContain(unref(gateForm).condition_type, "manual") : ssrLooseEqual(unref(gateForm).condition_type, "manual")) ? " selected" : ""}>Manual \u2014 accounts clears by hand</option><option value="outstanding_below" data-v-ef0c2df7${ssrIncludeBooleanAttr(Array.isArray(unref(gateForm).condition_type) ? ssrLooseContain(unref(gateForm).condition_type, "outstanding_below") : ssrLooseEqual(unref(gateForm).condition_type, "outstanding_below")) ? " selected" : ""}>Old dues must drop below\u2026</option><option value="outstanding_after_ship" data-v-ef0c2df7${ssrIncludeBooleanAttr(Array.isArray(unref(gateForm).condition_type) ? ssrLooseContain(unref(gateForm).condition_type, "outstanding_after_ship") : ssrLooseEqual(unref(gateForm).condition_type, "outstanding_after_ship")) ? " selected" : ""}>Total dues after shipping \u2264\u2026 (0 = pay everything first)</option><option value="amount_received" data-v-ef0c2df7${ssrIncludeBooleanAttr(Array.isArray(unref(gateForm).condition_type) ? ssrLooseContain(unref(gateForm).condition_type, "amount_received") : ssrLooseEqual(unref(gateForm).condition_type, "amount_received")) ? " selected" : ""}>Receive at least \u2026 against this order</option></select>`);
              if (unref(gateForm).condition_type !== "manual") {
                _push2(`<input${ssrRenderAttr("value", unref(gateForm).condition_amount)} type="number" min="0" class="input-glass w-full py-1.5 font-mono text-center text-xs" placeholder="Amount (\u09F3)" data-v-ef0c2df7>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<label class="flex items-start gap-2 cursor-pointer text-xs text-gray-500" data-v-ef0c2df7><input${ssrIncludeBooleanAttr(Array.isArray(unref(gateForm).auto_release) ? ssrLooseContain(unref(gateForm).auto_release, null) : unref(gateForm).auto_release) ? " checked" : ""} type="checkbox" class="accent-amber-500 mt-0.5" data-v-ef0c2df7><span data-v-ef0c2df7>\u26A1 Auto-release when the condition is met <span class="block text-[10px] text-amber-500/80" data-v-ef0c2df7>Careful with cheques \u2014 money may not be cleared yet</span></span></label><input${ssrRenderAttr("value", unref(gateForm).accounts_note)} type="text" class="input-glass w-full py-1.5 text-xs" placeholder="Note for the dispatch team\u2026" data-v-ef0c2df7><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="flex gap-3 pt-1" data-v-ef0c2df7><button class="btn-ghost flex-1 text-xs" data-v-ef0c2df7>Cancel</button><button${ssrIncludeBooleanAttr(unref(gateSaving)) ? " disabled" : ""} class="btn-gold flex-1 text-xs disabled:opacity-50" data-v-ef0c2df7>${ssrInterpolate(unref(gateSaving) ? "Saving\u2026" : "Save Conditions")}</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(deleteModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-ef0c2df7><div class="absolute inset-0 bg-black/70 backdrop-blur-sm" data-v-ef0c2df7></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-ef0c2df7><h3 class="section-title text-red-400" data-v-ef0c2df7>\u{1F5D1}\uFE0F Delete Order</h3><p class="text-sm text-gray-400" data-v-ef0c2df7> This will permanently delete <strong class="text-gold-400" data-v-ef0c2df7>${ssrInterpolate(unref(order).order_number)}</strong> along with all deliveries, returns, payments and ledger entries. </p><div class="rounded-xl p-3 text-xs" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.07)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-ef0c2df7><p class="text-red-400 font-semibold" data-v-ef0c2df7>\u26A0 This action cannot be undone.</p></div><div class="flex gap-3" data-v-ef0c2df7><button class="btn-ghost flex-1" data-v-ef0c2df7>Go Back</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all" data-v-ef0c2df7>${ssrInterpolate(unref(acting) ? "\u2026" : "Confirm Delete")}</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(cancelModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-ef0c2df7><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-ef0c2df7></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-ef0c2df7><h3 class="section-title text-red-400" data-v-ef0c2df7>\u274C Cancel Order</h3><p class="text-sm text-gray-400" data-v-ef0c2df7> Cancelling <strong class="text-gold-400" data-v-ef0c2df7>${ssrInterpolate(unref(order).order_number)}</strong>. This cannot be undone. </p><div class="space-y-1.5" data-v-ef0c2df7><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-ef0c2df7>Reason *</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="e.g. Customer requested cancellation, stock shortage\u2026" data-v-ef0c2df7>${ssrInterpolate(unref(cancelReason))}</textarea></div><div class="flex gap-3" data-v-ef0c2df7><button class="btn-ghost flex-1" data-v-ef0c2df7>Go Back</button><button${ssrIncludeBooleanAttr(!unref(cancelReason).trim() || unref(acting)) ? " disabled" : ""} class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" data-v-ef0c2df7>${ssrInterpolate(unref(acting) ? "\u2026" : "Confirm Cancel")}</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        ssrRenderTeleport(_push, (_push2) => {
          var _a2, _b2;
          if (unref(reverseModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-ef0c2df7><div class="absolute inset-0 bg-black/70 backdrop-blur-sm" data-v-ef0c2df7></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-ef0c2df7><h3 class="section-title text-amber-400" data-v-ef0c2df7>\u21A9 Reverse Payment</h3>`);
            if (unref(reverseTarget)) {
              _push2(`<div class="rounded-xl p-3 text-xs space-y-1.5" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.07)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-ef0c2df7><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Payment #</span><span class="font-mono font-bold text-gold-400/80" data-v-ef0c2df7>${ssrInterpolate(unref(reverseTarget).payment_number)}</span></div><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Amount</span><span class="font-bold text-emerald-400" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(reverseTarget).amount).toLocaleString())}</span></div><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Method</span><span class="text-gray-300" data-v-ef0c2df7>${ssrInterpolate(unref(reverseTarget).payment_method)}</span></div><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Date</span><span class="text-gray-400" data-v-ef0c2df7>${ssrInterpolate(String(unref(reverseTarget).payment_date).slice(0, 10))}</span></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<p class="text-xs text-gray-400 leading-relaxed" data-v-ef0c2df7> This will <strong class="text-red-400" data-v-ef0c2df7>void the payment</strong> by posting a debit note to the ledger, restoring <span class="text-red-400 font-semibold" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number((_b2 = (_a2 = unref(reverseTarget)) == null ? void 0 : _a2.amount) != null ? _b2 : 0).toLocaleString())}</span> back to the order balance and customer account. The original payment record will be marked as <em data-v-ef0c2df7>REVERSED</em>. </p><div class="space-y-1.5" data-v-ef0c2df7><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-ef0c2df7>Reason (optional)</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="e.g. Cheque bounced, wrong amount, duplicate entry\u2026" data-v-ef0c2df7>${ssrInterpolate(unref(reverseReason))}</textarea></div><div class="rounded-xl p-3 text-xs" style="${ssrRenderStyle({ "background": "rgba(249,115,22,0.06)", "border": "1px solid rgba(249,115,22,0.2)" })}" data-v-ef0c2df7><p class="text-orange-400 font-semibold" data-v-ef0c2df7>\u26A0 This cannot be undone.</p><p class="text-gray-500 mt-0.5" data-v-ef0c2df7>The balance due on this order will increase by the reversed amount.</p></div><div class="flex gap-3" data-v-ef0c2df7><button class="btn-ghost flex-1" data-v-ef0c2df7>Go Back</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="flex-1 py-2 rounded-xl text-sm font-semibold text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" data-v-ef0c2df7>${ssrInterpolate(unref(acting) ? "\u2026" : "\u21A9 Confirm Reversal")}</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        ssrRenderTeleport(_push, (_push2) => {
          var _a2, _b2, _c2;
          if (unref(deleteReturnModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-ef0c2df7><div class="absolute inset-0 bg-black/70 backdrop-blur-sm" data-v-ef0c2df7></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-ef0c2df7><h3 class="section-title text-red-400" data-v-ef0c2df7>\u{1F5D1}\uFE0F Delete Return</h3>`);
            if (unref(deleteReturnTarget)) {
              _push2(`<div class="rounded-xl p-3 text-xs space-y-1.5" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.07)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-ef0c2df7><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Return #</span><span class="font-mono font-bold text-gold-400/80" data-v-ef0c2df7>${ssrInterpolate(unref(deleteReturnTarget).return_number)}</span></div><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Amount</span><span class="font-bold text-red-400" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number(unref(deleteReturnTarget).total_returned_amount).toLocaleString())}</span></div><div class="flex justify-between" data-v-ef0c2df7><span class="text-gray-500" data-v-ef0c2df7>Status</span><span class="${ssrRenderClass(unref(deleteReturnTarget).status === "approved" ? "text-emerald-400" : unref(deleteReturnTarget).status === "rejected" ? "text-red-400" : "text-yellow-400")}" data-v-ef0c2df7>${ssrInterpolate(unref(deleteReturnTarget).status)}</span></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (((_a2 = unref(deleteReturnTarget)) == null ? void 0 : _a2.status) === "approved") {
              _push2(`<div class="rounded-xl p-3 text-xs space-y-1" style="${ssrRenderStyle({ "background": "rgba(249,115,22,0.08)", "border": "1px solid rgba(249,115,22,0.25)" })}" data-v-ef0c2df7><p class="text-orange-400 font-semibold" data-v-ef0c2df7>\u26A0 Approved return \u2014 accounting will be reversed</p><p class="text-gray-500 leading-relaxed mt-0.5" data-v-ef0c2df7> Because this return was already approved, deleting it will: </p><ul class="text-gray-500 mt-1 space-y-0.5 pl-2 list-disc list-inside leading-relaxed" data-v-ef0c2df7><li data-v-ef0c2df7>Remove the credit note from the customer ledger</li><li data-v-ef0c2df7>Add <span class="text-orange-300 font-semibold" data-v-ef0c2df7>\u09F3${ssrInterpolate(Number((_c2 = (_b2 = unref(deleteReturnTarget)) == null ? void 0 : _b2.total_returned_amount) != null ? _c2 : 0).toLocaleString())}</span> back to the order balance</li><li data-v-ef0c2df7>Restore the customer&#39;s outstanding balance</li></ul></div>`);
            } else {
              _push2(`<p class="text-xs text-gray-400" data-v-ef0c2df7> This return request will be permanently removed. No accounting adjustments will be made as it was never approved. </p>`);
            }
            _push2(`<div class="flex gap-3" data-v-ef0c2df7><button class="btn-ghost flex-1" data-v-ef0c2df7>Go Back</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/30 hover:bg-red-500/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all" data-v-ef0c2df7>${ssrInterpolate(unref(acting) ? "\u2026" : "Confirm Delete")}</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ef0c2df7"]]);

export { index as default };
//# sourceMappingURL=index-DJxhQ9mx.mjs.map
