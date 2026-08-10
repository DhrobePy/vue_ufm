import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
import 'node:zlib';
import 'node:stream';
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
  __name: "invoice",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const saleId = computed(() => Number(route.params.id));
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/trading/sales/${saleId.value}/invoice`,
      "$NfoQbOH796"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const sale = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.sale) != null ? _b : null;
    });
    const previousDue = computed(() => {
      var _a, _b;
      return Number((_b = (_a = data.value) == null ? void 0 : _a.previous_due) != null ? _b : 0);
    });
    function fmtDate(d) {
      if (!d) return "\u2014";
      return new Date(d).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" });
    }
    function trimQty(q) {
      return Number(q).toFixed(3).replace(/\.?0+$/, "");
    }
    return (_ctx, _push, _parent, _attrs) => {
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
        _push(`<div style="${ssrRenderStyle({ "border": "1px solid #e5e7eb", "border-radius": "10px", "margin": "12px", "padding": "28px" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "flex-start", "gap": "16px", "border-bottom": "2px solid #111827", "padding-bottom": "14px" })}"><div><div style="${ssrRenderStyle({ "font-size": "18px", "font-weight": "800" })}">Ujjal Flour Mills</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#6b7280" })}">\u0989\u099C\u09CD\u099C\u09B2 \u09AB\u09CD\u09B2\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u09AE\u09BF\u09B2\u09B8</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-top": "4px" })}">${ssrInterpolate(unref(sale).branch_address || "\u09E7\u09ED, \u09A8\u09C1\u09B0\u09BE\u0987\u09AC\u09BE\u0997, \u09A1\u09C7\u09AE\u09B0\u09BE, \u09A2\u09BE\u0995\u09BE")}</div></div><div style="${ssrRenderStyle({ "text-align": "right" })}"><div style="${ssrRenderStyle({ "font-size": "20px", "font-weight": "800", "letter-spacing": "1px" })}">INVOICE <span style="${ssrRenderStyle({ "font-weight": "600", "font-size": "12px", "color": "#6b7280" })}">/ COMMODITY SALE</span></div><div style="${ssrRenderStyle({ "font-family": "monospace", "font-weight": "700", "font-size": "14px", "margin-top": "2px" })}">${ssrInterpolate(unref(sale).sale_number)}</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-top": "2px" })}">Date: ${ssrInterpolate(fmtDate(unref(sale).sale_date))}</div></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "16px", "margin-top": "16px" })}"><div style="${ssrRenderStyle({ "border": "1px solid #e5e7eb", "border-radius": "8px", "padding": "12px" })}"><h4 style="${ssrRenderStyle({ "margin": "0 0 6px", "font-size": "10px", "text-transform": "uppercase", "letter-spacing": ".5px", "color": "#9ca3af" })}">Bill To</h4><div style="${ssrRenderStyle({ "font-size": "13px" })}"><strong>${ssrInterpolate(unref(sale).customer_name)}</strong></div>`);
        if (unref(sale).business_name) {
          _push(`<div style="${ssrRenderStyle({ "font-size": "13px" })}">${ssrInterpolate(unref(sale).business_name)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(sale).customer_phone) {
          _push(`<div style="${ssrRenderStyle({ "font-size": "13px" })}">Phone: ${ssrInterpolate(unref(sale).customer_phone)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div style="${ssrRenderStyle({ "border": "1px solid #e5e7eb", "border-radius": "8px", "padding": "12px" })}"><h4 style="${ssrRenderStyle({ "margin": "0 0 6px", "font-size": "10px", "text-transform": "uppercase", "letter-spacing": ".5px", "color": "#9ca3af" })}">Sold From</h4><div style="${ssrRenderStyle({ "font-size": "13px" })}">${ssrInterpolate(unref(sale).branch_name || "\u2014")}</div>`);
        if (unref(sale).origin) {
          _push(`<div style="${ssrRenderStyle({ "font-size": "13px" })}">Origin: ${ssrInterpolate(unref(sale).origin)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><table style="${ssrRenderStyle({ "width": "100%", "border-collapse": "collapse", "margin-top": "16px" })}"><thead><tr><th style="${ssrRenderStyle({ "background": "#111827", "color": "#fff", "font-size": "11px", "text-transform": "uppercase", "padding": "8px 10px", "text-align": "left" })}">Commodity</th><th style="${ssrRenderStyle({ "background": "#111827", "color": "#fff", "font-size": "11px", "text-transform": "uppercase", "padding": "8px 10px", "text-align": "right" })}">Quantity</th><th style="${ssrRenderStyle({ "background": "#111827", "color": "#fff", "font-size": "11px", "text-transform": "uppercase", "padding": "8px 10px", "text-align": "right" })}">Unit Price</th><th style="${ssrRenderStyle({ "background": "#111827", "color": "#fff", "font-size": "11px", "text-transform": "uppercase", "padding": "8px 10px", "text-align": "right" })}">Amount</th></tr></thead><tbody><tr><td style="${ssrRenderStyle({ "border-bottom": "1px solid #f3f4f6", "padding": "8px 10px", "font-size": "13px" })}">${ssrInterpolate(unref(sale).commodity_name)}</td><td style="${ssrRenderStyle({ "border-bottom": "1px solid #f3f4f6", "padding": "8px 10px", "font-size": "13px", "text-align": "right" })}">${ssrInterpolate(trimQty(unref(sale).quantity))} ${ssrInterpolate(unref(sale).unit)}</td><td style="${ssrRenderStyle({ "border-bottom": "1px solid #f3f4f6", "padding": "8px 10px", "font-size": "13px", "text-align": "right" })}">\u09F3${ssrInterpolate(Number(unref(sale).unit_price).toFixed(2))}</td><td style="${ssrRenderStyle({ "border-bottom": "1px solid #f3f4f6", "padding": "8px 10px", "font-size": "13px", "text-align": "right" })}">\u09F3${ssrInterpolate(Number(unref(sale).total_amount).toLocaleString(void 0, { minimumFractionDigits: 2 }))}</td></tr></tbody></table><div style="${ssrRenderStyle({ "margin-top": "16px", "margin-left": "auto", "width": "320px" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "6px 0", "font-size": "16px", "border-top": "2px solid #111827", "font-weight": "800" })}"><span>Invoice Total</span><span>\u09F3${ssrInterpolate(Number(unref(sale).total_amount).toLocaleString(void 0, { minimumFractionDigits: 2 }))}</span></div>`);
        if (Number(unref(sale).advance_paid) > 0) {
          _push(`<div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "6px 0", "font-size": "13px", "border-bottom": "1px solid #f3f4f6" })}"><span>Advance Paid</span><span>\u09F3${ssrInterpolate(Number(unref(sale).advance_paid).toLocaleString(void 0, { minimumFractionDigits: 2 }))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(sale).amount_paid) > 0) {
          _push(`<div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "6px 0", "font-size": "13px", "border-bottom": "1px solid #f3f4f6" })}"><span>Paid</span><span>\u09F3${ssrInterpolate(Number(unref(sale).amount_paid).toLocaleString(void 0, { minimumFractionDigits: 2 }))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "6px 0", "font-size": "13px", "border-bottom": "1px solid #f3f4f6", "color": "#b91c1c", "font-weight": "700" })}"><span>Balance Due (this invoice)</span><span>\u09F3${ssrInterpolate(Number(unref(sale).balance_due).toLocaleString(void 0, { minimumFractionDigits: 2 }))}</span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "6px 0", "font-size": "13px", "border-bottom": "1px solid #f3f4f6" })}"><span>Previous Account Due</span><span>\u09F3${ssrInterpolate(unref(previousDue).toLocaleString(void 0, { minimumFractionDigits: 2 }))}</span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding-top": "10px", "margin-top": "4px", "border-top": "2px solid #111827", "font-weight": "800", "font-size": "16px" })}"><span>Total Account Due</span><span>\u09F3${ssrInterpolate((unref(previousDue) + Number(unref(sale).balance_due)).toLocaleString(void 0, { minimumFractionDigits: 2 }))}</span></div></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "margin-top": "40px", "gap": "24px" })}"><div style="${ssrRenderStyle({ "flex": "1", "text-align": "center", "border-top": "1px solid #9ca3af", "padding-top": "6px", "font-size": "11px", "color": "#6b7280" })}">Prepared By</div><div style="${ssrRenderStyle({ "flex": "1", "text-align": "center", "border-top": "1px solid #9ca3af", "padding-top": "6px", "font-size": "11px", "color": "#6b7280" })}">Received By (Customer)</div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trading/sales/[id]/invoice.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=invoice-DIxX6g1J.mjs.map
