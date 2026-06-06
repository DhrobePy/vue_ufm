import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderTeleport } from 'vue/server-renderer';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "approve",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
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
          _push(`<button class="btn-ghost text-xs py-2 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10">Reject</button><button class="${ssrRenderClass([
            "text-xs py-2 px-4 rounded-xl font-semibold transition-all duration-200",
            creditPct(order) > 80 ? "bg-orange-500/15 border border-orange-500/25 text-orange-400 hover:bg-orange-500/25" : "btn-gold"
          ])}"${ssrIncludeBooleanAttr(unref(acting) === order.id) ? " disabled" : ""}>${ssrInterpolate(unref(acting) === order.id ? "\u2026" : creditPct(order) > 80 ? "Escalate" : "Approve")}</button></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
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
//# sourceMappingURL=approve-BhOvx7tg.mjs.map
