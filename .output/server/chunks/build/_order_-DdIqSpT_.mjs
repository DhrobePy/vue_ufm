import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[order]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const orderId = computed(() => Number(route.params.order));
    const sig = computed(() => {
      var _a;
      return String((_a = route.query.sig) != null ? _a : "");
    });
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/pos/exit/${orderId.value}`,
      { query: { sig } },
      "$qcIgDtn8kT"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const order = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.order) != null ? _b : null;
    });
    const scanCount = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.scan_count) != null ? _b : 0;
    });
    const acting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiBackButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-lg mx-auto space-y-5 pt-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-10 text-center text-sm text-gray-500">Loading\u2026</div>`);
      } else if (!unref(order)) {
        _push(`<div class="glass-card p-10 text-center text-sm text-red-400">Order not found.</div>`);
      } else {
        _push(`<!--[--><div class="glass-card p-6 text-center space-y-1"><p class="text-xs text-gray-500 uppercase tracking-wider">POS Exit Verification</p><h2 class="text-xl font-bold text-gray-100 font-mono">${ssrInterpolate(unref(order).order_number)}</h2><p class="text-sm text-gray-400">${ssrInterpolate((_a = unref(order).customer_name) != null ? _a : "Walk-in")} \xB7 ${ssrInterpolate(unref(order).branch_name)}</p></div><div class="glass-card p-5 space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-500">Total</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(Number(unref(order).total_amount).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-500">Paid now</span><span class="font-mono text-emerald-400">\u09F3${ssrInterpolate(Number(unref(order).cash_amount).toLocaleString())}</span></div>`);
        if (Number(unref(order).credit_amount) > 0) {
          _push(`<div class="flex justify-between"><span class="text-gray-500">On credit</span><span class="font-mono text-orange-400">\u09F3${ssrInterpolate(Number(unref(order).credit_amount).toLocaleString())}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(order).exit_status === "cleared") {
          _push(`<div class="glass-card p-6 text-center space-y-2" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.08)", "border-color": "rgba(16,185,129,0.3)" })}"><p class="text-3xl">\u2705</p><p class="font-bold text-emerald-400">Cleared for Exit</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(order).cleared_by_name ? `by ${unref(order).cleared_by_name}` : "")}</p>`);
          if (unref(scanCount) > 1) {
            _push(`<p class="text-[11px] text-red-400 font-semibold pt-1"> \u26A0 Scanned ${ssrInterpolate(unref(scanCount))} times \u2014 already cleared before this scan. Verify no duplicate exit. </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="glass-card p-6 text-center space-y-3"><p class="text-3xl">\u23F3</p><p class="font-bold text-orange-400">Unpaid credit portion \u2014 release not yet cleared</p>`);
          if (unref(order).exit_requested_at) {
            _push(`<p class="text-xs text-gray-500">Approval already requested${ssrInterpolate(unref(order).requested_by_name ? ` by ${unref(order).requested_by_name}` : "")} \u2014 waiting for a checker.</p>`);
          } else {
            _push(`<div class="flex gap-3 justify-center pt-2"><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold text-sm disabled:opacity-50">Clear for Exit</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-ghost text-sm disabled:opacity-50">Request Approval</button></div>`);
          }
          _push(`</div>`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/exit/[order].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_order_-DdIqSpT_.mjs.map
