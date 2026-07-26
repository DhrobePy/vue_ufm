import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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
  __name: "gate-pass",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const saleId = computed(() => Number(route.params.id));
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/trading/sales/${saleId.value}/gate-pass`,
      "$UOJmJvtkB_"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const sale = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.sale) != null ? _b : null;
    });
    const verifyUrl = computed(() => {
      var _a, _b;
      const path = (_b = (_a = data.value) == null ? void 0 : _a.verify_path) != null ? _b : "";
      return path;
    });
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "max-width": "800px", "margin": "0 auto", "background": "#fff", "color": "#111", "font-family": "Arial,sans-serif" } }, _attrs))}><div class="no-print" style="${ssrRenderStyle({ "padding": "12px", "display": "flex", "gap": "8px" })}"><button onclick="window.print()" style="${ssrRenderStyle({ "padding": "8px 16px", "background": "#d97706", "color": "#fff", "border": "none", "border-radius": "6px", "cursor": "pointer", "font-weight": "600" })}">\u{1F5A8} Print</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/trading/sales/${unref(saleId)}`,
        style: { "padding": "8px 16px", "background": "#eee", "border-radius": "6px", "text-decoration": "none", "color": "#333" }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 Back`);
          } else {
            return [
              createTextVNode("\u2190 Back")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(sale)) {
        _push(`<div style="${ssrRenderStyle({ "border": "2px solid #111", "margin": "12px", "padding": "24px" })}"><div style="${ssrRenderStyle({ "text-align": "center", "border-bottom": "2px solid #111", "padding-bottom": "12px", "margin-bottom": "16px" })}"><h1 style="${ssrRenderStyle({ "margin": "0", "font-size": "22px" })}">UJJAL FLOUR MILLS \u2014 COMMODITY GATE PASS</h1><p style="${ssrRenderStyle({ "margin": "4px 0 0", "font-size": "13px", "color": "#555" })}">Trading dispatch \u2014 no amounts on this document</p></div><table style="${ssrRenderStyle({ "width": "100%", "font-size": "14px", "border-collapse": "collapse" })}"><tr><td style="${ssrRenderStyle({ "padding": "6px 0", "color": "#666", "width": "180px" })}">Gate Pass / Sale #</td><td style="${ssrRenderStyle({ "font-weight": "700", "font-family": "monospace" })}">${ssrInterpolate(unref(sale).sale_number)}</td></tr><tr><td style="${ssrRenderStyle({ "padding": "6px 0", "color": "#666" })}">Date</td><td>${ssrInterpolate(String(unref(sale).sale_date).slice(0, 10))}</td></tr><tr><td style="${ssrRenderStyle({ "padding": "6px 0", "color": "#666" })}">Customer</td><td style="${ssrRenderStyle({ "font-weight": "700" })}">${ssrInterpolate(unref(sale).customer_name)}</td></tr><tr><td style="${ssrRenderStyle({ "padding": "6px 0", "color": "#666" })}">Address</td><td>${ssrInterpolate((_a = unref(sale).customer_address) != null ? _a : "\u2014")}</td></tr><tr><td style="${ssrRenderStyle({ "padding": "6px 0", "color": "#666" })}">Commodity</td><td>${ssrInterpolate(unref(sale).commodity_name)}${ssrInterpolate(unref(sale).origin ? ` (${unref(sale).origin})` : "")}</td></tr><tr><td style="${ssrRenderStyle({ "padding": "6px 0", "color": "#666" })}">Quantity</td><td style="${ssrRenderStyle({ "font-weight": "700" })}">${ssrInterpolate(Number(unref(sale).quantity).toLocaleString())} ${ssrInterpolate(unref(sale).unit)}</td></tr><tr><td style="${ssrRenderStyle({ "padding": "6px 0", "color": "#666" })}">From Branch</td><td>${ssrInterpolate((_b = unref(sale).branch_name) != null ? _b : "\u2014")}</td></tr><tr><td style="${ssrRenderStyle({ "padding": "6px 0", "color": "#666" })}">Driver / Vehicle</td><td>${ssrInterpolate((_c = unref(sale).driver_name) != null ? _c : "____________")} / ${ssrInterpolate((_d = unref(sale).vehicle_number) != null ? _d : "____________")}</td></tr></table><div style="${ssrRenderStyle({ "display": "flex", "gap": "24px", "margin-top": "24px", "align-items": "center" })}"><div style="${ssrRenderStyle({ "flex": "1" })}"><p style="${ssrRenderStyle({ "font-size": "12px", "color": "#666" })}">Scan at gate-out and again at delivery. Second delivery scan is refused and flagged.</p><p style="${ssrRenderStyle({ "font-size": "11px", "color": "#999", "font-family": "monospace" })}">${ssrInterpolate(unref(verifyUrl))}</p></div><canvas width="130" height="130" style="${ssrRenderStyle({ "border": "1px solid #ddd" })}"></canvas></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr 1fr", "gap": "16px", "margin-top": "48px", "text-align": "center", "font-size": "12px" })}"><div style="${ssrRenderStyle({ "border-top": "1px solid #111", "padding-top": "6px" })}">Gate Officer</div><div style="${ssrRenderStyle({ "border-top": "1px solid #111", "padding-top": "6px" })}">Driver</div><div style="${ssrRenderStyle({ "border-top": "1px solid #111", "padding-top": "6px" })}">Received By</div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trading/sales/[id]/gate-pass.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=gate-pass-BNQm0kDv.mjs.map
