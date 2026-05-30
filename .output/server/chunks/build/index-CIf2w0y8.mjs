import { _ as _sfc_main$2 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList, ssrRenderTeleport } from 'vue/server-renderer';
import { c as _export_sfc, j as useRoute, n as navigateTo } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'vue-router';
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "glass-card p-5" }, _attrs))} data-v-5148ff3f><div class="flex items-center justify-between mb-6" data-v-5148ff3f><h3 class="section-title" data-v-5148ff3f>Order Progress</h3>`);
      _push(ssrRenderComponent(_component_UiStatusBadge, { status: __props.currentStatus }, null, _parent));
      _push(`</div>`);
      if (unref(isTerminalBad)) {
        _push(`<div class="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.08)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-5148ff3f><svg class="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-5148ff3f><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" data-v-5148ff3f></path></svg><p class="text-xs text-red-400" data-v-5148ff3f> Order <span class="font-semibold uppercase tracking-wider" data-v-5148ff3f>${ssrInterpolate(__props.currentStatus.replace("_", " "))}</span>`);
        if ((_a = unref(terminalEntry)) == null ? void 0 : _a.by) {
          _push(`<span data-v-5148ff3f> by <strong data-v-5148ff3f>${ssrInterpolate(unref(terminalEntry).by)}</strong></span>`);
        } else {
          _push(`<!---->`);
        }
        if ((_b = unref(terminalEntry)) == null ? void 0 : _b.at) {
          _push(`<span data-v-5148ff3f> \xB7 ${ssrInterpolate(unref(terminalEntry).at)}</span>`);
        } else {
          _push(`<span data-v-5148ff3f> \u2014 no further action required</span>`);
        }
        _push(`</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative" data-v-5148ff3f><div class="absolute top-5 left-5 right-5 h-0.5 bg-white/[0.06] rounded-full" data-v-5148ff3f></div>`);
      if (!unref(isTerminalBad) && unref(progressPct) > 0) {
        _push(`<div class="absolute top-5 left-5 h-0.5 rounded-full transition-all duration-700 ease-out" style="${ssrRenderStyle(`width: calc(${unref(progressPct)}% - 2.5rem); background: linear-gradient(90deg, #f59e0b, #10b981)`)}" data-v-5148ff3f></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative flex justify-between" data-v-5148ff3f><!--[-->`);
      ssrRenderList(unref(visibleSteps), (step, i) => {
        _push(`<div class="flex flex-col items-center gap-2.5 cursor-pointer relative" style="${ssrRenderStyle(`width:${100 / unref(visibleSteps).length}%`)}" data-v-5148ff3f><div class="${ssrRenderClass([nodeClass(step, i), "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative"])}" data-v-5148ff3f>`);
        if (isCurrent(step) && !unref(isTerminalBad)) {
          _push(`<div class="absolute inset-0 rounded-full animate-ping opacity-30" style="${ssrRenderStyle(`background: ${step.color}`)}" data-v-5148ff3f></div>`);
        } else {
          _push(`<!---->`);
        }
        if (isDone(step, i)) {
          _push(`<svg class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-5148ff3f><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-5148ff3f></path></svg>`);
        } else if (isCurrent(step) && step.status === "escalated") {
          _push(`<svg class="w-4 h-4 relative z-10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-5148ff3f><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" data-v-5148ff3f></path></svg>`);
        } else if (isCurrent(step)) {
          _push(`<svg class="w-3.5 h-3.5 relative z-10 animate-spin" fill="none" viewBox="0 0 24 24" data-v-5148ff3f><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" data-v-5148ff3f></circle><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" class="opacity-75" data-v-5148ff3f></path></svg>`);
        } else {
          _push(`<span class="text-[11px] font-bold relative z-10" data-v-5148ff3f>${ssrInterpolate(i + 1)}</span>`);
        }
        _push(`</div><span class="${ssrRenderClass([isCurrent(step) ? step.status === "escalated" ? "text-orange-400" : "text-gold-400" : isDone(step, i) ? "text-emerald-400" : "text-gray-700", "text-[9px] font-semibold uppercase tracking-wider text-center leading-tight transition-colors"])}" data-v-5148ff3f>${ssrInterpolate(step.label)}</span>`);
        if (unref(activeTooltip) === i) {
          _push(`<div class="absolute z-30 w-44 rounded-xl px-3 py-2.5 text-xs shadow-2xl" style="${ssrRenderStyle({ "top": "calc(100% + 4px)", "background": "rgba(20,16,12,0.98)", "border": "1px solid rgba(255,255,255,0.1)" })}" data-v-5148ff3f><div class="flex items-center gap-1.5 mb-1.5" data-v-5148ff3f><div class="w-2 h-2 rounded-full" style="${ssrRenderStyle(`background:${step.color}`)}" data-v-5148ff3f></div><p class="font-semibold text-gray-200" data-v-5148ff3f>${ssrInterpolate(step.label)}</p></div>`);
          if (step.by) {
            _push(`<p class="text-gray-400" data-v-5148ff3f>\u{1F464} ${ssrInterpolate(step.by)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (step.at) {
            _push(`<p class="text-gray-600 font-mono mt-0.5" data-v-5148ff3f>\u{1F550} ${ssrInterpolate(step.at)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (!step.by && !isCurrent(step) && !isDone(step, i)) {
            _push(`<p class="text-gray-700 italic" data-v-5148ff3f>Not reached yet</p>`);
          } else {
            _push(`<!---->`);
          }
          if (isCurrent(step) && !step.by) {
            _push(`<p class="text-gold-500/70" data-v-5148ff3f>In progress\u2026</p>`);
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
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-5148ff3f"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const id = computed(() => Number(route.params.id));
    const { success, error: toastError } = useToast();
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
    const apiWorkflow = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.workflow) != null ? _b : [];
    });
    const creditPct = computed(() => {
      var _a, _b;
      const limit = Number((_a = order.value.credit_limit) != null ? _a : 0);
      const balance = Number((_b = order.value.current_balance) != null ? _b : 0);
      if (!limit) return 0;
      return Math.round(balance / limit * 100);
    });
    const canCollectPayment = computed(
      () => ["approved", "in_production", "ready_to_ship", "delivered", "partial_delivery", "completed"].includes(order.value.status)
    );
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
    const workflowTimeline = computed(
      () => apiWorkflow.value.map((w, i) => {
        var _a, _b;
        return {
          id: w.id,
          action: w.to_status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          by: (_a = w.performed_by_name) != null ? _a : "System",
          time: fmtDateTime(w.performed_at),
          color: WF_COLORS[i % WF_COLORS.length],
          note: (_b = w.comments) != null ? _b : ""
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
    const acting = ref(false);
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
      const _component_UiPageHeader = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiOrderProgress = __nuxt_component_2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-98af196e>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-98af196e>Loading order\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-98af196e>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(order).order_number,
          subtitle: unref(order).customer_name,
          breadcrumb: ["Credit Sales", "All Sales", unref(order).order_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<button class="btn-ghost text-xs" data-v-98af196e${_scopeId}>\u{1F5A8}\uFE0F Print Invoice</button>`);
              if (unref(canCollectPayment)) {
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
              if (unref(order).status === "pending_approval") {
                _push2(`<button class="btn-gold text-xs" data-v-98af196e${_scopeId}> \u{1F4CB} Review &amp; Approve </button>`);
              } else if (unref(order).status === "escalated") {
                _push2(`<button class="btn-gold text-xs" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#f97316,#ea580c)", "color": "#000" })}" data-v-98af196e${_scopeId}> \u26A0\uFE0F Escalation Review </button>`);
              } else if (unref(order).status === "approved") {
                _push2(`<button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} data-v-98af196e${_scopeId}> \u{1F3ED} Send to Production </button>`);
              } else if (unref(order).status === "in_production") {
                _push2(`<button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} data-v-98af196e${_scopeId}> \u{1F4E4} Ready to Dispatch </button>`);
              } else if (unref(order).status === "ready_to_ship") {
                _push2(`<button class="btn-gold text-xs" data-v-98af196e${_scopeId}> \u{1F4E6} Record Delivery </button>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("button", {
                  onClick: printInvoice,
                  class: "btn-ghost text-xs"
                }, "\u{1F5A8}\uFE0F Print Invoice"),
                unref(canCollectPayment) ? (openBlock(), createBlock(_component_NuxtLink, {
                  key: 0,
                  to: `/credit-sales/${unref(id)}/payment`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u{1F4B0} Collect Payment")
                  ]),
                  _: 1
                }, 8, ["to"])) : createCommentVNode("", true),
                unref(order).status === "pending_approval" ? (openBlock(), createBlock("button", {
                  key: 1,
                  class: "btn-gold text-xs",
                  onClick: ($event) => approvalModal.value = true
                }, " \u{1F4CB} Review & Approve ", 8, ["onClick"])) : unref(order).status === "escalated" ? (openBlock(), createBlock("button", {
                  key: 2,
                  class: "btn-gold text-xs",
                  onClick: ($event) => approvalModal.value = true,
                  style: { "background": "linear-gradient(135deg,#f97316,#ea580c)", "color": "#000" }
                }, " \u26A0\uFE0F Escalation Review ", 8, ["onClick"])) : unref(order).status === "approved" ? (openBlock(), createBlock("button", {
                  key: 3,
                  class: "btn-gold text-xs",
                  disabled: unref(acting),
                  onClick: ($event) => advanceStatus("in_production", "Sent to production queue")
                }, " \u{1F3ED} Send to Production ", 8, ["disabled", "onClick"])) : unref(order).status === "in_production" ? (openBlock(), createBlock("button", {
                  key: 4,
                  class: "btn-gold text-xs",
                  disabled: unref(acting),
                  onClick: ($event) => advanceStatus("ready_to_ship", "Marked ready to ship")
                }, " \u{1F4E4} Ready to Dispatch ", 8, ["disabled", "onClick"])) : unref(order).status === "ready_to_ship" ? (openBlock(), createBlock("button", {
                  key: 5,
                  class: "btn-gold text-xs",
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/credit-sales/${unref(id)}/deliver`)
                }, " \u{1F4E6} Record Delivery ", 8, ["onClick"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_UiOrderProgress, {
          "current-status": unref(order).status,
          history: unref(orderHistory)
        }, null, _parent));
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-98af196e><div class="lg:col-span-2 space-y-5" data-v-98af196e><div class="glass-card p-5 space-y-4" data-v-98af196e><div class="flex items-center justify-between" data-v-98af196e><h3 class="section-title" data-v-98af196e>Order Details</h3>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(order).status
        }, null, _parent));
        _push(`</div><div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm" data-v-98af196e><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Customer</p><p class="text-gray-200 font-semibold" data-v-98af196e>${ssrInterpolate(unref(order).customer_name)}</p></div><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Customer Type</p>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(order).customer_type || "credit"
        }, null, _parent));
        _push(`</div><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Branch</p><p class="text-gray-200" data-v-98af196e>${ssrInterpolate(unref(order).branch_name || "\u2014")}</p></div><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Order Date</p><p class="text-gray-200" data-v-98af196e>${ssrInterpolate(unref(order).order_date)}</p></div><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Required Date</p><p class="text-gray-200" data-v-98af196e>${ssrInterpolate(unref(order).required_date || "\u2014")}</p></div><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Priority</p><span class="${ssrRenderClass([
          "text-xs font-medium",
          unref(order).priority === "urgent" ? "text-red-400" : unref(order).priority === "high" ? "text-orange-400" : "text-gray-500"
        ])}" data-v-98af196e>${ssrInterpolate(unref(order).priority || "normal")}</span></div><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Order Total</p><p class="text-gold-400 font-bold text-base" data-v-98af196e>\u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())}</p></div><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Amount Paid</p><p class="text-emerald-400 font-semibold" data-v-98af196e>\u09F3${ssrInterpolate(Number(unref(order).amount_paid).toLocaleString())}</p></div><div data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Balance Due</p><p class="text-red-400 font-bold" data-v-98af196e>\u09F3${ssrInterpolate(Number(unref(order).balance_due).toLocaleString())}</p></div></div>`);
        if (unref(order).delivery_address) {
          _push(`<div class="pt-3 border-t border-white/[0.06]" data-v-98af196e><p class="text-xs text-gray-600 mb-1" data-v-98af196e>Delivery Address</p><p class="text-sm text-gray-300" data-v-98af196e>${ssrInterpolate(unref(order).delivery_address)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(order).created_by_name) {
          _push(`<div class="text-xs text-gray-600" data-v-98af196e> Created by <span class="text-gray-400" data-v-98af196e>${ssrInterpolate(unref(order).created_by_name)}</span>`);
          if (unref(order).approved_by_name) {
            _push(`<span data-v-98af196e> \xB7 Approved by <span class="text-gray-400" data-v-98af196e>${ssrInterpolate(unref(order).approved_by_name)}</span></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5" data-v-98af196e><div class="flex items-center justify-between mb-3" data-v-98af196e><h3 class="section-title" data-v-98af196e>Credit Utilisation</h3><span class="text-xs text-gray-500" data-v-98af196e>${ssrInterpolate(unref(creditPct))}% used</span></div><div class="h-2 rounded-full bg-white/[0.06] overflow-hidden" data-v-98af196e><div class="h-full rounded-full transition-all duration-500" style="${ssrRenderStyle(`width:${Math.min(unref(creditPct), 100)}%;background:${unref(creditPct) > 80 ? "#ef4444" : unref(creditPct) > 60 ? "#f97316" : "#10b981"}`)}" data-v-98af196e></div></div><div class="flex justify-between text-[11px] text-gray-600 mt-2" data-v-98af196e><span data-v-98af196e>Limit: \u09F3${ssrInterpolate(Number(unref(order).credit_limit || 0).toLocaleString())}</span><span data-v-98af196e>Balance: \u09F3${ssrInterpolate(Number(unref(order).current_balance || 0).toLocaleString())}</span></div></div><div class="glass-card p-5" data-v-98af196e><h3 class="section-title mb-4" data-v-98af196e>Line Items</h3><div class="overflow-x-auto" data-v-98af196e><table class="w-full text-sm" data-v-98af196e><thead data-v-98af196e><tr class="border-b border-white/[0.06] text-[11px] text-gray-600 uppercase tracking-wider" data-v-98af196e><th class="pb-2.5 text-left font-semibold" data-v-98af196e>Product</th><th class="pb-2.5 text-right font-semibold" data-v-98af196e>Qty (bags)</th><th class="pb-2.5 text-right font-semibold" data-v-98af196e>Unit Price</th><th class="pb-2.5 text-right font-semibold" data-v-98af196e>Discount</th><th class="pb-2.5 text-right font-semibold" data-v-98af196e>Total</th></tr></thead><tbody class="divide-y divide-white/[0.04]" data-v-98af196e><!--[-->`);
        ssrRenderList(unref(items), (item) => {
          _push(`<tr class="hover:bg-white/[0.02]" data-v-98af196e><td class="py-3 text-gray-300" data-v-98af196e>${ssrInterpolate(item.product_name)} `);
          if (item.weight_variant) {
            _push(`<span class="text-xs text-gray-500" data-v-98af196e> \xB7 ${ssrInterpolate(item.weight_variant)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="py-3 text-right text-gray-400" data-v-98af196e>${ssrInterpolate(Number(item.qty_bags).toLocaleString())}</td><td class="py-3 text-right text-gray-400" data-v-98af196e>\u09F3${ssrInterpolate(Number(item.unit_price).toLocaleString())}</td><td class="py-3 text-right text-red-400/70" data-v-98af196e>${ssrInterpolate(Number(item.discount_amount) > 0 ? `-\u09F3${Number(item.discount_amount).toLocaleString()}` : "\u2014")}</td><td class="py-3 text-right font-semibold text-gold-400" data-v-98af196e>\u09F3${ssrInterpolate(Number(item.line_total).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(items).length) {
          _push(`<tr data-v-98af196e><td colspan="5" class="py-6 text-center text-xs text-gray-600" data-v-98af196e>No line items</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody>`);
        if (unref(items).length) {
          _push(`<tfoot data-v-98af196e><tr class="border-t border-white/[0.08]" data-v-98af196e><td colspan="4" class="pt-3 text-right text-sm font-bold text-gray-300" data-v-98af196e>Grand Total</td><td class="pt-3 text-right font-bold text-gold-400 text-base" data-v-98af196e>\u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())}</td></tr><tr data-v-98af196e><td colspan="4" class="pt-1 text-right text-xs text-gray-500" data-v-98af196e>Amount Paid</td><td class="pt-1 text-right text-xs text-emerald-400 font-semibold" data-v-98af196e>-\u09F3${ssrInterpolate(Number(unref(order).amount_paid).toLocaleString())}</td></tr><tr data-v-98af196e><td colspan="4" class="pt-1 text-right text-xs font-bold text-gray-300" data-v-98af196e>Balance Due</td><td class="pt-1 text-right text-sm font-bold text-red-400" data-v-98af196e>\u09F3${ssrInterpolate(Number(unref(order).balance_due).toLocaleString())}</td></tr></tfoot>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</table></div></div>`);
        if (unref(order).special_notes) {
          _push(`<div class="glass-card p-5" data-v-98af196e><h3 class="section-title mb-2" data-v-98af196e>Special Instructions</h3><p class="text-sm text-gray-400 italic" data-v-98af196e>${ssrInterpolate(unref(order).special_notes)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-5" data-v-98af196e><div class="glass-card p-5" data-v-98af196e><h3 class="section-title mb-4" data-v-98af196e>Workflow History</h3>`);
        if (unref(workflowTimeline).length) {
          _push(`<div class="space-y-0" data-v-98af196e><!--[-->`);
          ssrRenderList(unref(workflowTimeline), (wf, idx) => {
            _push(`<div class="flex gap-3" data-v-98af196e><div class="flex flex-col items-center" data-v-98af196e><div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="${ssrRenderStyle(`background:${wf.color}18;border:1px solid ${wf.color}30`)}" data-v-98af196e><div class="w-2 h-2 rounded-full" style="${ssrRenderStyle(`background:${wf.color}`)}" data-v-98af196e></div></div>`);
            if (idx < unref(workflowTimeline).length - 1) {
              _push(`<div class="w-px flex-1 bg-white/[0.06] my-1 min-h-[16px]" data-v-98af196e></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="pb-4" data-v-98af196e><p class="text-xs font-semibold text-gray-200" data-v-98af196e>${ssrInterpolate(wf.action)}</p><p class="text-[11px] text-gray-600 mt-0.5" data-v-98af196e>${ssrInterpolate(wf.by)} \xB7 ${ssrInterpolate(wf.time)}</p>`);
            if (wf.note) {
              _push(`<p class="text-[11px] text-gray-500 mt-1 italic" data-v-98af196e>${ssrInterpolate(wf.note)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<p class="text-xs text-gray-600" data-v-98af196e>No workflow events yet.</p>`);
        }
        _push(`</div><div class="glass-card p-4 space-y-2" data-v-98af196e><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" data-v-98af196e>Quick Actions</h3><button class="btn-ghost w-full justify-start text-xs py-2" data-v-98af196e>\u{1F5A8}\uFE0F Print Invoice</button>`);
        if (unref(canCollectPayment)) {
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
        if (unref(order).status === "ready_to_ship") {
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
        _push(`<button class="btn-ghost w-full justify-start text-xs py-2" data-v-98af196e>\u{1F4F1} Send Telegram Alert</button>`);
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
        if (!["cancelled", "completed", "rejected"].includes(unref(order).status)) {
          _push(`<button class="btn-ghost w-full justify-start text-xs py-2 text-red-400 hover:bg-red-500/10" data-v-98af196e> \u274C Cancel Order </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(approvalModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-98af196e><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-98af196e></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-98af196e><h3 class="section-title" data-v-98af196e>${ssrInterpolate(unref(order).status === "escalated" ? "\u26A0\uFE0F Escalation Review" : "\u{1F4CB} Order Review")}</h3><p class="text-sm text-gray-400" data-v-98af196e><span class="text-gold-400 font-semibold" data-v-98af196e>${ssrInterpolate(unref(order).order_number)}</span>`);
            if (unref(order).status === "escalated") {
              _push2(`<span data-v-98af196e> \u2014 escalated due to credit concerns (${ssrInterpolate(unref(creditPct))}% utilisation)</span>`);
            } else {
              _push2(`<span data-v-98af196e> \u2014 \u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())} \xB7 ${ssrInterpolate(unref(order).customer_name)}</span>`);
            }
            _push2(`</p>`);
            if (unref(creditPct) > 80) {
              _push2(`<div class="rounded-xl p-3 text-xs" style="${ssrRenderStyle({ "background": "rgba(249,115,22,0.08)", "border": "1px solid rgba(249,115,22,0.2)" })}" data-v-98af196e><p class="text-orange-400 font-semibold" data-v-98af196e>\u26A0 Credit Utilisation: ${ssrInterpolate(unref(creditPct))}%</p><p class="text-gray-500 mt-0.5" data-v-98af196e>Customer is near or over credit limit. Ensure CFO sign-off before approving.</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="space-y-1.5" data-v-98af196e><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-98af196e>Comment (optional)</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="Add a note for the record\u2026" data-v-98af196e>${ssrInterpolate(unref(approvalComment))}</textarea></div><div class="flex gap-3" data-v-98af196e><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold flex-1 justify-center" data-v-98af196e>${ssrInterpolate(unref(acting) ? "\u2026" : "\u2713 Approve")}</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-40" data-v-98af196e> \u2717 Reject </button></div><button class="btn-ghost w-full text-xs py-1.5" data-v-98af196e>Cancel</button></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(cancelModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-98af196e><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-98af196e></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-98af196e><h3 class="section-title text-red-400" data-v-98af196e>\u274C Cancel Order</h3><p class="text-sm text-gray-400" data-v-98af196e> Cancelling <strong class="text-gold-400" data-v-98af196e>${ssrInterpolate(unref(order).order_number)}</strong>. This cannot be undone. </p><div class="space-y-1.5" data-v-98af196e><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-98af196e>Reason *</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="e.g. Customer requested cancellation, stock shortage\u2026" data-v-98af196e>${ssrInterpolate(unref(cancelReason))}</textarea></div><div class="flex gap-3" data-v-98af196e><button class="btn-ghost flex-1" data-v-98af196e>Go Back</button><button${ssrIncludeBooleanAttr(!unref(cancelReason).trim() || unref(acting)) ? " disabled" : ""} class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" data-v-98af196e>${ssrInterpolate(unref(acting) ? "\u2026" : "Confirm Cancel")}</button></div></div></div>`);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-98af196e"]]);

export { index as default };
//# sourceMappingURL=index-CIf2w0y8.mjs.map
