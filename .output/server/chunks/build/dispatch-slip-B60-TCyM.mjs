import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
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
  __name: "dispatch-slip",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/credit-sales/${route.params.id}/dispatch-slip`,
      "$I9tbdplYAU"
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
    const confirmation = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.confirmation;
    });
    const totalQty = computed(() => items.value.reduce((s, i) => {
      var _a;
      return s + Number((_a = i.quantity) != null ? _a : 0);
    }, 0));
    const statusBanner = computed(() => {
      var _a, _b, _c;
      if ((_a = confirmation.value) == null ? void 0 : _a.confirmed_at) {
        return { text: "\u2713 DELIVERED \u2014 confirmed by " + ((_b = confirmation.value.confirmed_by_name) != null ? _b : "recipient"), style: "background:rgba(16,185,129,0.1);color:#047857;" };
      }
      if ((_c = confirmation.value) == null ? void 0 : _c.gate_out_at) {
        return { text: "\u{1F69A} GATE-OUT RECORDED \u2014 awaiting delivery confirmation", style: "background:rgba(245,158,11,0.1);color:#b45309;" };
      }
      return { text: "\u23F3 AWAITING GATE SCAN \u2014 not yet dispatched", style: "background:rgba(107,114,128,0.08);color:#4b5563;" };
    });
    const qrDataUrl = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "min-height": "100vh", "background": "#e8e4dd", "font-family": "'Inter',sans-serif" } }, _attrs))}><div class="no-print" style="${ssrRenderStyle({ "position": "sticky", "top": "0", "z-index": "100", "background": "rgba(14,12,10,0.95)", "backdrop-filter": "blur(12px)", "border-bottom": "1px solid rgba(255,255,255,0.08)", "padding": "12px 24px", "display": "flex", "align-items": "center", "gap": "12px" })}">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/credit-sales/${unref(route).params.id}`,
        style: { "display": "inline-flex", "align-items": "center", "gap": "6px", "padding": "7px 14px", "border-radius": "10px", "border": "1px solid rgba(255,255,255,0.12)", "color": "#9ca3af", "font-size": "12px", "font-weight": "500", "text-decoration": "none" }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u2190 Back to Order `);
          } else {
            return [
              createTextVNode(" \u2190 Back to Order ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div style="${ssrRenderStyle({ "flex": "1", "text-align": "center" })}"><span style="${ssrRenderStyle({ "font-size": "13px", "color": "#d1d5db", "font-weight": "600" })}">${ssrInterpolate(unref(order).order_number)}</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-left": "8px" })}">Dispatch Slip / Gate Pass \u2014 driver copy, no amounts</span></div><button onclick="window.print()" style="${ssrRenderStyle({ "display": "inline-flex", "align-items": "center", "gap": "6px", "padding": "8px 18px", "border-radius": "10px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "color": "#000", "font-size": "12px", "font-weight": "700", "border": "none", "cursor": "pointer" })}"> \u{1F5A8}\uFE0F Print / Save PDF </button></div>`);
      if (unref(pending)) {
        _push(`<div class="no-print" style="${ssrRenderStyle({ "max-width": "794px", "margin": "32px auto", "text-align": "center", "color": "#9ca3af", "font-size": "13px" })}">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="no-print" style="${ssrRenderStyle({ "max-width": "794px", "margin": "32px auto", "text-align": "center", "color": "#f87171", "font-size": "13px" })}">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<div style="${ssrRenderStyle({ "max-width": "794px", "margin": "32px auto", "padding-bottom": "48px" })}" class="no-print-margin"><div class="slip-paper" style="${ssrRenderStyle({ "background": "#fff", "box-shadow": "0 4px 32px rgba(0,0,0,0.18),0 1px 4px rgba(0,0,0,0.12)", "border-radius": "4px", "overflow": "hidden" })}"><div style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%)", "padding": "24px 40px", "display": "flex", "align-items": "flex-start", "justify-content": "space-between", "gap": "24px" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "flex-start", "gap": "16px" })}"><div style="${ssrRenderStyle({ "width": "52px", "height": "52px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "border-radius": "12px", "display": "flex", "align-items": "center", "justify-content": "center", "font-weight": "900", "font-size": "22px", "color": "#000", "flex-shrink": "0" })}">U</div><div><div style="${ssrRenderStyle({ "font-size": "20px", "font-weight": "800", "color": "#fff", "letter-spacing": "-0.3px" })}">Ujjal Flour Mills Co.</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#f59e0b", "font-weight": "600", "margin-top": "3px", "letter-spacing": "0.05em" })}">DISPATCH SLIP / GATE PASS</div><div style="${ssrRenderStyle({ "font-size": "10.5px", "color": "#9ca3af", "margin-top": "6px", "line-height": "1.7" })}"> Sirajgonj Sadar, Sirajgonj-6700 \xB7 Demra, Dhaka-1361<br> \u{1F4DE} +880 1711-000000 </div></div></div><div style="${ssrRenderStyle({ "text-align": "right", "flex-shrink": "0" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "700", "color": "#f59e0b", "letter-spacing": "0.15em", "text-transform": "uppercase", "margin-bottom": "6px" })}">Order Reference</div><div style="${ssrRenderStyle({ "font-size": "24px", "font-weight": "900", "color": "#fff", "letter-spacing": "-0.5px" })}">${ssrInterpolate(unref(order).order_number)}</div><div style="${ssrRenderStyle({ "margin-top": "10px", "display": "flex", "flex-direction": "column", "gap": "4px", "align-items": "flex-end" })}"><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Order Date</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#e5e7eb", "font-weight": "600" })}">${ssrInterpolate(unref(order).order_date || "\u2014")}</span></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Branch</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#e5e7eb", "font-weight": "600" })}">${ssrInterpolate(unref(order).branch_name || "\u2014")}</span></div></div></div></div><div style="${ssrRenderStyle(`padding:10px 40px;font-size:11px;font-weight:700;letter-spacing:0.03em;${unref(statusBanner).style}`)}">${ssrInterpolate(unref(statusBanner).text)}</div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "24px", "padding": "24px 40px 0" })}"><div><h3 style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase", "margin-bottom": "8px" })}">Deliver To</h3><p style="${ssrRenderStyle({ "font-size": "14px", "font-weight": "700", "color": "#111" })}">${ssrInterpolate(unref(order).customer_name || "\u2014")}</p>`);
        if (unref(order).customer_phone) {
          _push(`<p style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-top": "2px" })}">${ssrInterpolate(unref(order).customer_phone)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(order).shipping_address) {
          _push(`<p style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-top": "4px", "line-height": "1.5" })}">${ssrInterpolate(unref(order).shipping_address)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div><h3 style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase", "margin-bottom": "8px" })}">Driver &amp; Vehicle</h3><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#374151", "line-height": "1.9" })}"><div>Driver: <strong style="${ssrRenderStyle({ "color": "#111" })}">${ssrInterpolate(((_a = unref(confirmation)) == null ? void 0 : _a.driver_name) || "\u2014 to be filled at gate \u2014")}</strong></div><div>Vehicle: <strong style="${ssrRenderStyle({ "color": "#111" })}">${ssrInterpolate(((_b = unref(confirmation)) == null ? void 0 : _b.vehicle_number) || "\u2014 to be filled at gate \u2014")}</strong></div>`);
        if (unref(order).delivery_type) {
          _push(`<div>Truck Type: <strong style="${ssrRenderStyle({ "color": "#111" })}">${ssrInterpolate(unref(order).delivery_type === "mini_truck" ? "Mini Truck" : "Big Truck")}</strong></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(order).total_weight_kg) {
          _push(`<div>Total Weight: <strong style="${ssrRenderStyle({ "color": "#111" })}">${ssrInterpolate(Number(unref(order).total_weight_kg).toLocaleString())} KG</strong></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div style="${ssrRenderStyle({ "margin": "24px 40px 0", "border": "1px solid #f0ede8", "border-radius": "10px", "overflow": "hidden" })}"><table style="${ssrRenderStyle({ "width": "100%", "border-collapse": "collapse" })}"><thead><tr style="${ssrRenderStyle({ "background": "#faf8f5", "border-bottom": "2px solid #f0ede8" })}"><th style="${ssrRenderStyle({ "padding": "10px 14px", "text-align": "left", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">#</th><th style="${ssrRenderStyle({ "padding": "10px 14px", "text-align": "left", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Product</th><th style="${ssrRenderStyle({ "padding": "10px 14px", "text-align": "right", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Quantity (Bags)</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(items), (item, i) => {
          _push(`<tr style="${ssrRenderStyle(`border-bottom:1px solid #f5f3f0;background:${i % 2 === 0 ? "#fff" : "#fefcfa"}`)}"><td style="${ssrRenderStyle({ "padding": "10px 14px", "font-size": "11px", "color": "#9ca3af", "font-weight": "600" })}">${ssrInterpolate(i + 1)}</td><td style="${ssrRenderStyle({ "padding": "10px 14px", "font-size": "12px", "font-weight": "600", "color": "#111" })}">${ssrInterpolate(item.product_name)}`);
          if (item.weight_variant) {
            _push(`<span style="${ssrRenderStyle({ "color": "#6b7280", "font-weight": "400" })}"> \xB7 ${ssrInterpolate(item.weight_variant)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (item.grade) {
            _push(`<span style="${ssrRenderStyle({ "color": "#6b7280", "font-weight": "400" })}"> \xB7 Grade ${ssrInterpolate(item.grade)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td style="${ssrRenderStyle({ "padding": "10px 14px", "text-align": "right", "font-size": "13px", "font-weight": "700", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate(item.quantity.toLocaleString())}</td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot><tr style="${ssrRenderStyle({ "background": "#faf8f5", "border-top": "2px solid #f0ede8" })}"><td colspan="2" style="${ssrRenderStyle({ "padding": "10px 14px", "font-size": "11px", "font-weight": "800", "color": "#111" })}">Total Bags</td><td style="${ssrRenderStyle({ "padding": "10px 14px", "text-align": "right", "font-size": "14px", "font-weight": "900", "color": "#b45309", "font-family": "monospace" })}">${ssrInterpolate(unref(totalQty).toLocaleString())}</td></tr></tfoot></table></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 220px", "gap": "20px", "margin": "24px 40px 0", "padding": "18px 20px", "background": "#faf8f5", "border-radius": "10px", "border": "1px solid #f0ede8", "align-items": "center" })}"><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "line-height": "1.8" })}"><p style="${ssrRenderStyle({ "font-weight": "800", "color": "#111", "font-size": "12px", "margin-bottom": "6px" })}">Scan this code TWICE:</p><p>1\uFE0F\u20E3 At the gate, before the truck leaves \u2014 captures driver &amp; vehicle, marks the order shipped.</p><p>2\uFE0F\u20E3 At the customer&#39;s door, on delivery \u2014 confirms receipt.</p><p style="${ssrRenderStyle({ "margin-top": "8px", "color": "#9ca3af" })}">Scanning requires an ERP login. A third scan is flagged as a possible duplicate delivery and alerts the office.</p></div><div style="${ssrRenderStyle({ "text-align": "center" })}">`);
        if (unref(qrDataUrl)) {
          _push(`<img${ssrRenderAttr("src", unref(qrDataUrl))} alt="Gate pass QR" style="${ssrRenderStyle({ "width": "120px", "height": "120px", "border": "1px solid #e5e0d8", "border-radius": "8px", "padding": "4px", "background": "#fff" })}">`);
        } else {
          _push(`<div style="${ssrRenderStyle({ "width": "120px", "height": "120px", "border": "1px dashed #d1d5db", "border-radius": "8px", "margin": "0 auto", "display": "flex", "align-items": "center", "justify-content": "center", "font-size": "10px", "color": "#9ca3af" })}">QR unavailable</div>`);
        }
        _push(`<p style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "6px" })}">${ssrInterpolate(unref(order).order_number)}</p></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "24px", "margin": "28px 40px 0" })}"><div style="${ssrRenderStyle({ "border-top": "1.5px solid #111", "padding-top": "8px" })}"><p style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "700", "color": "#6b7280", "letter-spacing": "0.05em", "text-transform": "uppercase" })}">Dispatch / Gate Officer</p><p style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "2px" })}">Name &amp; Signature</p></div><div style="${ssrRenderStyle({ "border-top": "1.5px solid #111", "padding-top": "8px" })}"><p style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "700", "color": "#6b7280", "letter-spacing": "0.05em", "text-transform": "uppercase" })}">Driver</p><p style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "2px" })}">Name &amp; Signature</p></div></div><div style="${ssrRenderStyle({ "margin-top": "24px", "padding": "14px 40px", "background": "#faf8f5", "border-top": "1px solid #f0ede8", "text-align": "center" })}"><p style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af" })}">This document authorizes goods movement only \u2014 it carries no pricing or payment information. Retain until delivery is confirmed.</p></div></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/[id]/dispatch-slip.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dispatch-slip-B60-TCyM.mjs.map
