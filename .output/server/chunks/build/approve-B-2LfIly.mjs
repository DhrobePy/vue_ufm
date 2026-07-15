import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrLooseContain, ssrRenderAttr, ssrLooseEqual } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-BSnAhZCp.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './SidebarIcon-oZVkzwjh.mjs';
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
import './server.mjs';
import 'vue-router';
import './permRoutes-D3m_BSE2.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "approve",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    useToast();
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales",
      {
        query: { status: "pending_approval", per: 50 }
      },
      "$rEkWO8RKnY"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: escalatedData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales",
      {
        query: { status: "escalated", per: 50 }
      },
      "$IZCKpEQHG7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const orders = computed(() => {
      var _a, _b, _c, _d;
      return [
        ...(_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : [],
        ...(_d = (_c = escalatedData.value) == null ? void 0 : _c.orders) != null ? _d : []
      ];
    });
    const escalatedCount = computed(() => {
      var _a, _b;
      return (_b = (_a = escalatedData.value) == null ? void 0 : _a.total) != null ? _b : 0;
    });
    function creditPct(order) {
      if (!order.credit_limit || order.credit_limit <= 0) return 0;
      return Math.round(Number(order.current_balance) / Number(order.credit_limit) * 100);
    }
    const acting = ref(null);
    const approveModal = ref(false);
    const approveTarget = ref(null);
    const showConditions = ref(false);
    const cond = reactive({
      production_hold: false,
      production_hold_note: "",
      dispatch_hold: false,
      condition_type: "manual",
      condition_amount: null,
      auto_release: false,
      accounts_note: ""
    });
    const exposureAfter = computed(() => {
      var _a, _b, _c, _d;
      return Number((_b = (_a = approveTarget.value) == null ? void 0 : _a.current_balance) != null ? _b : 0) + Number((_d = (_c = approveTarget.value) == null ? void 0 : _c.balance_due) != null ? _d : 0);
    });
    const rejectModal = ref(false);
    const rejectTarget = ref(null);
    const rejectReason = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Approve Orders",
        subtitle: "Review pending credit orders \u2014 check utilisation before approving",
        breadcrumb: ["Credit Sales", "Approve"]
      }, null, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">`);
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Awaiting Approval",
        value: String(unref(orders).length),
        trend: `${unref(escalatedCount)} escalated`,
        "trend-up": false,
        icon: "check",
        color: "yellow"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Total Value",
        value: "\u09F3" + (unref(orders).reduce((s, o) => s + Number(o.total_amount), 0) / 1e5).toFixed(1) + "L",
        trend: "pending orders",
        icon: "money",
        color: "gold"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Near Credit Limit",
        value: String(unref(orders).filter((o) => creditPct(o) > 80).length),
        trend: "orders > 80% utilisation",
        "trend-up": false,
        icon: "chart",
        color: "orange"
      }, null, _parent));
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<div class="space-y-3">`);
        if (unref(orders).length === 0) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-600"> No orders pending approval. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(orders), (order) => {
          _push(`<div class="glass-card-hover p-5 flex flex-col lg:flex-row lg:items-center gap-4"><div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4"><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Order</p><p class="text-sm font-mono font-semibold text-gold-400">${ssrInterpolate(order.order_number)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(order.order_date)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Customer</p><p class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(order.customer_name)}</p>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: order.status
          }, null, _parent));
          _push(`</div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Amount</p><p class="text-sm font-bold text-white">\u09F3${ssrInterpolate(Number(order.total_amount).toLocaleString())}</p><p class="text-xs text-gray-500 mt-0.5">Due: \u09F3${ssrInterpolate(Number(order.balance_due).toLocaleString())}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Credit Usage</p><div class="flex items-center gap-2 mt-1"><div class="flex-1 h-1.5 rounded-full bg-white/[0.06]"><div class="h-full rounded-full transition-all" style="${ssrRenderStyle(`width:${Math.min(creditPct(order), 100)}%; background:${creditPct(order) > 80 ? "#f97316" : "#10b981"}`)}"></div></div><span class="${ssrRenderClass(["text-xs font-bold", creditPct(order) > 80 ? "text-orange-400" : "text-emerald-400"])}">${ssrInterpolate(creditPct(order))}% </span></div>`);
          if (creditPct(order) > 80) {
            _push(`<p class="text-[10px] text-orange-400 mt-1">\u26A0 Exceeds 80% threshold</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex items-center gap-2 shrink-0">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${order.id}`,
            class: "btn-ghost text-xs py-2 px-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`View`);
              } else {
                return [
                  createTextVNode("View")
                ];
              }
            }),
            _: 2
          }, _parent));
          if (unref(perms).canDo("credit_sales", "approve", "reject")) {
            _push(`<button class="btn-ghost text-xs py-2 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10">Reject</button>`);
          } else {
            _push(`<!---->`);
          }
          if (creditPct(order) > 80 && order.status !== "escalated" && unref(perms).canDo("credit_sales", "approve", "escalate")) {
            _push(`<button class="text-xs py-2 px-3 rounded-xl font-semibold bg-orange-500/15 border border-orange-500/25 text-orange-400 hover:bg-orange-500/25 transition-all"${ssrIncludeBooleanAttr(unref(acting) === order.id) ? " disabled" : ""}>${ssrInterpolate(unref(acting) === order.id ? "\u2026" : "Escalate")}</button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(perms).canDo("credit_sales", "approve", "approve")) {
            _push(`<button class="btn-gold text-xs py-2 px-4"${ssrIncludeBooleanAttr(unref(acting) === order.id) ? " disabled" : ""}>${ssrInterpolate(unref(acting) === order.id ? "\u2026" : "Approve\u2026")}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
        if (unref(approveModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.6)", "backdrop-filter": "blur(4px)" })}"><div class="w-full max-w-lg glass-card p-6 space-y-4 my-8"><div><h3 class="section-title text-emerald-400">Approve Order</h3><p class="text-sm text-gray-400 mt-1"><strong class="text-gold-400">${ssrInterpolate((_a = unref(approveTarget)) == null ? void 0 : _a.order_number)}</strong> \u2014 ${ssrInterpolate((_b = unref(approveTarget)) == null ? void 0 : _b.customer_name)} \xB7 \u09F3${ssrInterpolate(Number((_d = (_c = unref(approveTarget)) == null ? void 0 : _c.total_amount) != null ? _d : 0).toLocaleString())}</p></div><div class="rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-xs space-y-1"><p class="text-gray-500">Current dues <span class="font-mono text-gray-300 float-right">\u09F3${ssrInterpolate(Number((_f = (_e = unref(approveTarget)) == null ? void 0 : _e.current_balance) != null ? _f : 0).toLocaleString())}</span></p><p class="text-gray-500">+ This invoice <span class="font-mono text-gray-300 float-right">\u09F3${ssrInterpolate(Number((_h = (_g = unref(approveTarget)) == null ? void 0 : _g.balance_due) != null ? _h : 0).toLocaleString())}</span></p><p class="text-gray-400 font-semibold border-t border-white/[0.06] pt-1">Exposure after shipping <span class="font-mono text-gold-300 float-right">\u09F3${ssrInterpolate(unref(exposureAfter).toLocaleString())}</span></p></div><div class="rounded-xl border border-amber-500/15 overflow-hidden"><button class="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-amber-300/90 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"><span>\u2699 Special Instructions (holds &amp; payment conditions)</span><span>${ssrInterpolate(unref(showConditions) ? "\u25BE" : "\u25B8")}</span></button>`);
          if (unref(showConditions)) {
            _push2(`<div class="p-4 space-y-3 text-xs"><label class="flex items-center gap-2 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(cond).production_hold) ? ssrLooseContain(unref(cond).production_hold, null) : unref(cond).production_hold) ? " checked" : ""} type="checkbox" class="accent-amber-500"><span class="text-gray-300">\u26D4 Hold production until admin releases</span></label>`);
            if (unref(cond).production_hold) {
              _push2(`<input${ssrRenderAttr("value", unref(cond).production_hold_note)} type="text" class="input-glass w-full py-1.5" placeholder="Why is production held?">`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<label class="flex items-center gap-2 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(cond).dispatch_hold) ? ssrLooseContain(unref(cond).dispatch_hold, null) : unref(cond).dispatch_hold) ? " checked" : ""} type="checkbox" class="accent-amber-500"><span class="text-gray-300">\u{1F6AB} Hold dispatch until payment condition is met</span></label>`);
            if (unref(cond).dispatch_hold) {
              _push2(`<!--[--><select class="input-glass w-full py-1.5"><option value="manual"${ssrIncludeBooleanAttr(Array.isArray(unref(cond).condition_type) ? ssrLooseContain(unref(cond).condition_type, "manual") : ssrLooseEqual(unref(cond).condition_type, "manual")) ? " selected" : ""}>Manual \u2014 accounts clears by hand</option><option value="outstanding_below"${ssrIncludeBooleanAttr(Array.isArray(unref(cond).condition_type) ? ssrLooseContain(unref(cond).condition_type, "outstanding_below") : ssrLooseEqual(unref(cond).condition_type, "outstanding_below")) ? " selected" : ""}>Old dues must drop below\u2026</option><option value="outstanding_after_ship"${ssrIncludeBooleanAttr(Array.isArray(unref(cond).condition_type) ? ssrLooseContain(unref(cond).condition_type, "outstanding_after_ship") : ssrLooseEqual(unref(cond).condition_type, "outstanding_after_ship")) ? " selected" : ""}>Total dues after shipping \u2264\u2026 (0 = pay everything)</option><option value="amount_received"${ssrIncludeBooleanAttr(Array.isArray(unref(cond).condition_type) ? ssrLooseContain(unref(cond).condition_type, "amount_received") : ssrLooseEqual(unref(cond).condition_type, "amount_received")) ? " selected" : ""}>Receive at least \u2026 against this order</option></select>`);
              if (unref(cond).condition_type !== "manual") {
                _push2(`<input${ssrRenderAttr("value", unref(cond).condition_amount)} type="number" min="0" class="input-glass w-full py-1.5 font-mono text-center" placeholder="Amount (\u09F3)">`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<label class="flex items-start gap-2 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(cond).auto_release) ? ssrLooseContain(unref(cond).auto_release, null) : unref(cond).auto_release) ? " checked" : ""} type="checkbox" class="accent-amber-500 mt-0.5"><span class="text-gray-500">\u26A1 Auto-release when condition is met <span class="text-amber-500/80 block text-[10px]">Careful with cheques \u2014 money may not be cleared yet</span></span></label><input${ssrRenderAttr("value", unref(cond).accounts_note)} type="text" class="input-glass w-full py-1.5" placeholder="Note for the dispatch team\u2026"><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="flex gap-3 justify-end"><button class="btn-ghost text-xs">Cancel</button><button${ssrIncludeBooleanAttr(unref(acting) === ((_i = unref(approveTarget)) == null ? void 0 : _i.id)) ? " disabled" : ""} class="btn-gold text-xs px-5">${ssrInterpolate(unref(acting) === ((_j = unref(approveTarget)) == null ? void 0 : _j.id) ? "\u2026" : "\u2713 Approve")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b, _c;
        if (unref(rejectModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.6)", "backdrop-filter": "blur(4px)" })}"><div class="w-full max-w-md glass-card p-6 space-y-4"><h3 class="section-title text-red-400">Reject Order</h3><p class="text-sm text-gray-400">Rejecting <strong class="text-gold-400">${ssrInterpolate((_a = unref(rejectTarget)) == null ? void 0 : _a.order_number)}</strong>. Please provide a reason.</p><textarea rows="3" class="field-input w-full resize-none" placeholder="Rejection reason\u2026">${ssrInterpolate(unref(rejectReason))}</textarea><div class="flex gap-3 justify-end"><button class="btn-ghost text-xs">Cancel</button><button${ssrIncludeBooleanAttr(!unref(rejectReason) || unref(acting) === ((_b = unref(rejectTarget)) == null ? void 0 : _b.id)) ? " disabled" : ""} class="btn-ghost text-xs border-red-500/25 text-red-400 hover:bg-red-500/10">${ssrInterpolate(unref(acting) === ((_c = unref(rejectTarget)) == null ? void 0 : _c.id) ? "\u2026" : "Confirm Reject")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/approve.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=approve-B-2LfIly.mjs.map
