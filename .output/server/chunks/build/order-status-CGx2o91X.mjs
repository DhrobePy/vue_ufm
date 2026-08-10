import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "order-status",
  __ssrInlineRender: true,
  setup(__props) {
    useToast();
    const orderNumberInput = ref("");
    const looking = ref(false);
    const lookupError = ref("");
    const order = ref(null);
    const target = ref(null);
    const reason = ref("");
    const submitting = ref(false);
    const OVERRIDE_TRANSITIONS = {
      ready_to_ship: ["goods_on_board", "shipped", "hold"],
      goods_on_board: ["shipped", "delivered", "hold"],
      shipped: ["delivered"],
      hold: ["ready_to_ship", "goods_on_board", "shipped", "delivered"],
      delivered: ["cancelled"]
    };
    const allowedTargets = computed(() => {
      var _a, _b;
      return (_b = OVERRIDE_TRANSITIONS[(_a = order.value) == null ? void 0 : _a.status]) != null ? _b : [];
    });
    function statusLabel(s) {
      return s.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-2xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Manual Status Override",
        subtitle: "Admin escape hatch for orders stuck outside the normal pipeline",
        breadcrumb: ["Credit Sales", "Order Status Override"]
      }, null, _parent));
      _push(`<div class="glass-card p-5 space-y-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Number</label><div class="flex gap-2"><input${ssrRenderAttr("value", unref(orderNumberInput))} class="input-glass flex-1" placeholder="e.g. CO-20260715-0001"><button${ssrIncludeBooleanAttr(!unref(orderNumberInput).trim() || unref(looking)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50">${ssrInterpolate(unref(looking) ? "\u2026" : "Find")}</button></div>`);
      if (unref(lookupError)) {
        _push(`<p class="text-xs text-red-400">${ssrInterpolate(unref(lookupError))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(order)) {
        _push(`<div class="glass-card p-5 space-y-5"><div class="flex items-center justify-between"><div><p class="text-sm font-bold text-gray-200">${ssrInterpolate(unref(order).order_number)}</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(order).customer_name)}</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(order).status
        }, null, _parent));
        _push(`</div>`);
        if (!unref(allowedTargets).length) {
          _push(`<div class="text-xs text-gray-500 rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(107,114,128,0.08)" })}"> No manual override targets from status &quot;${ssrInterpolate(unref(order).status)}&quot; \u2014 this order isn&#39;t in an overridable stage. </div>`);
        } else {
          _push(`<!--[--><div class="space-y-2"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Override To</label><div class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(unref(allowedTargets), (t) => {
            _push(`<button class="${ssrRenderClass([
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              unref(target) === t ? "bg-gold-500/15 text-gold-400 border-gold-500/30" : "text-gray-400 border-white/[0.08] hover:border-white/[0.18]"
            ])}">${ssrInterpolate(statusLabel(t))}</button>`);
          });
          _push(`<!--]--></div></div>`);
          if (unref(target) === "cancelled") {
            _push(`<div class="text-xs text-amber-400 rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.08)", "border": "1px solid rgba(245,158,11,0.2)" })}"> \u26A0 This reverses the goods-on-board invoice (posts a credit note + reversing journal entry). Only allowed if the order has zero payments, returns, or over-deliveries recorded \u2014 otherwise reverse those first. </div>`);
          } else if (["goods_on_board", "shipped", "delivered"].includes((_a = unref(target)) != null ? _a : "")) {
            _push(`<div class="text-xs text-blue-300 rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(59,130,246,0.08)", "border": "1px solid rgba(59,130,246,0.2)" })}"> \u2139 If the goods-on-board invoice hasn&#39;t posted yet, it will post automatically as part of this override (the accounting pivot never gets skipped). </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason *</label><textarea rows="2" class="input-glass resize-none" placeholder="Why this order needs a manual override\u2026">${ssrInterpolate(unref(reason))}</textarea></div><button${ssrIncludeBooleanAttr(!unref(target) || !unref(reason).trim() || unref(submitting)) ? " disabled" : ""} class="btn-gold text-xs w-full disabled:opacity-50">${ssrInterpolate(unref(submitting) ? "Applying\u2026" : `Override to ${unref(target) ? statusLabel(unref(target)) : "\u2026"}`)}</button><!--]-->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/order-status.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=order-status-CGx2o91X.mjs.map
