import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const saleId = computed(() => Number(route.params.id));
    computed(() => {
      var _a;
      return String((_a = route.query.sig) != null ? _a : "");
    });
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/trading/sales/${saleId.value}`,
      "$h-Z3_MBn1c"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const sale = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.sale) != null ? _b : null;
    });
    const dispatch = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.dispatch) != null ? _b : null;
    });
    const hasHistory = ref(false);
    const form = reactive({ driver_name: "", vehicle_number: "", received_by: "" });
    const acting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiBackButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center p-4" }, _attrs))}><div class="glass-card p-6 w-full max-w-md space-y-4">`);
      if (unref(hasHistory)) {
        _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<h1 class="text-lg font-bold text-gray-100">Commodity Dispatch Verification</h1>`);
      if (unref(sale)) {
        _push(`<!--[--><div class="text-xs space-y-1.5"><div class="flex justify-between"><span class="text-gray-500">Sale</span><span class="font-mono text-gold-400">${ssrInterpolate(unref(sale).sale_number)}</span></div><div class="flex justify-between"><span class="text-gray-500">Customer</span><span class="text-gray-200">${ssrInterpolate(unref(sale).customer_name)}</span></div><div class="flex justify-between"><span class="text-gray-500">Commodity</span><span class="text-gray-200">${ssrInterpolate(unref(sale).commodity_name)}${ssrInterpolate(unref(sale).origin ? ` (${unref(sale).origin})` : "")}</span></div><div class="flex justify-between"><span class="text-gray-500">Quantity</span><span class="text-gray-200 font-mono">${ssrInterpolate(Number(unref(sale).quantity).toLocaleString())} ${ssrInterpolate((_a = unref(sale).unit) != null ? _a : unref(sale).commodity_unit)}</span></div></div>`);
        if ((_b = unref(dispatch)) == null ? void 0 : _b.confirmed_at) {
          _push(`<div class="rounded-xl p-3 text-xs text-emerald-300" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.08)", "border": "1px solid rgba(16,185,129,0.25)" })}"> \u2705 ALREADY DELIVERED \u2014 ${ssrInterpolate(unref(dispatch).confirmed_at)} by ${ssrInterpolate(unref(dispatch).confirmed_by_name)}. A second delivery is not possible. </div>`);
        } else if (!((_c = unref(dispatch)) == null ? void 0 : _c.gate_out_at)) {
          _push(`<!--[--><p class="text-xs text-gray-400">Stage 1 \u2014 record goods leaving the warehouse:</p><input${ssrRenderAttr("value", unref(form).driver_name)} class="input-glass text-xs" placeholder="Driver name"><input${ssrRenderAttr("value", unref(form).vehicle_number)} class="input-glass text-xs" placeholder="Vehicle number"><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold text-xs w-full">\u{1F69A} Confirm Gate-Out</button><!--]-->`);
        } else {
          _push(`<!--[--><p class="text-xs text-gray-400">Stage 2 \u2014 confirm delivery at the customer (locks permanently):</p><input${ssrRenderAttr("value", unref(form).received_by)} class="input-glass text-xs" placeholder="Received by (name at customer)"><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold text-xs w-full">\u{1F4E6} Confirm Delivery</button><!--]-->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<p class="text-xs text-gray-500">Loading\u2026</p>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trading/verify/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-CsykrC2M.mjs.map
