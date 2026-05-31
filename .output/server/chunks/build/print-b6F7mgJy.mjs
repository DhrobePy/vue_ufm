import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { j as useRoute, e as createError } from './server.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "print",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b;
    let __temp, __restore;
    const route = useRoute();
    const id = Number(route.params.id);
    const { data: apiData, error: loadError } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/purchase/orders/${id}`,
      "$GGVaWg4hvF"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    if (loadError.value || !((_a = apiData.value) == null ? void 0 : _a.po)) {
      throw createError({ statusCode: 404, message: "Purchase order not found" });
    }
    const rawPo = apiData.value.po;
    const rawGrns = (_b = apiData.value.grns) != null ? _b : [];
    const po = computed(() => {
      var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      const qtyMT = Number(rawPo.quantity_kg || 0) / 1e3;
      const pricePerMT = Number(rawPo.unit_price_per_kg || 0) * 1e3;
      const paymentTerms = Number((_b2 = (_a2 = rawPo.supplier_payment_terms) != null ? _a2 : rawPo.payment_terms) != null ? _b2 : 30);
      return {
        poNo: (_c = rawPo.po_number) != null ? _c : `PO-${id}`,
        poDate: (_d = rawPo.po_date) != null ? _d : "",
        supplier: (_f = (_e = rawPo.company_name) != null ? _e : rawPo.supplier_name) != null ? _f : "\u2014",
        supplierAddress: (_h = (_g = rawPo.supplier_address) != null ? _g : rawPo.address) != null ? _h : "\u2014",
        supplierPhone: (_i = rawPo.phone) != null ? _i : "\u2014",
        status: (_j = rawPo.po_status) != null ? _j : "draft",
        createdBy: (_k = rawPo.created_by_name) != null ? _k : "\u2014",
        expectedDelivery: (_l = rawPo.expected_delivery_date) != null ? _l : "\u2014",
        deliveryTo: (_n = (_m = rawPo.branch_name) != null ? _m : rawPo.unload_point_name) != null ? _n : "Sirajgonj Mill",
        paymentTerms,
        origin: (_o = rawPo.wheat_origin) != null ? _o : "\u2014",
        notes: (_p = rawPo.remarks) != null ? _p : "",
        totalAmount: Number(rawPo.total_order_value || 0),
        paid: Number(rawPo.total_paid || 0),
        items: [{
          product: `Wheat (${(_q = rawPo.wheat_origin) != null ? _q : "Imported"})`,
          qty: qtyMT,
          unitPrice: pricePerMT
        }],
        grns: rawGrns.map((g) => ({
          id: g.id,
          grnNo: g.grn_number,
          date: g.grn_date,
          qty: +(Number(g.quantity_received_kg || 0) / 1e3).toFixed(2),
          grade: g.grn_status === "verified" || g.grn_status === "posted" ? "A" : "\u2014"
        })).filter((g) => g.qty > 0)
      };
    });
    const statusStyle = computed(() => {
      const s = po.value.status;
      if (s === "completed" || s === "delivered") return "background:#dcfce7;color:#166534;border:1px solid #bbf7d0;";
      if (s === "partial" || s === "partial_delivery" || s === "in_transit") return "background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;";
      if (s === "cancelled") return "background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;";
      return "background:#fef3c7;color:#92400e;border:1px solid #fcd34d;";
    });
    const totalOrdered = computed(() => po.value.items.reduce((s, i) => s + i.qty, 0));
    const totalReceived = computed(() => po.value.grns.reduce((s, g) => s + g.qty, 0));
    const dueDate = computed(() => {
      const d = new Date(po.value.expectedDelivery);
      if (isNaN(d.getTime())) return "\u2014";
      d.setDate(d.getDate() + po.value.paymentTerms);
      return d.toISOString().split("T")[0];
    });
    const generatedAt = (/* @__PURE__ */ new Date()).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "min-height": "100vh", "background": "#e8e4dd", "font-family": "'Inter',sans-serif" } }, _attrs))}><div class="no-print" style="${ssrRenderStyle({ "position": "sticky", "top": "0", "z-index": "100", "background": "rgba(14,12,10,0.95)", "backdrop-filter": "blur(12px)", "border-bottom": "1px solid rgba(255,255,255,0.08)", "padding": "12px 24px", "display": "flex", "align-items": "center", "gap": "12px" })}">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/purchase/orders/${unref(route).params.id}`,
        style: { "display": "inline-flex", "align-items": "center", "gap": "6px", "padding": "7px 14px", "border-radius": "10px", "border": "1px solid rgba(255,255,255,0.12)", "color": "#9ca3af", "font-size": "12px", "font-weight": "500", "text-decoration": "none" },
        onmouseover: "this.style.color='#e5e7eb';this.style.borderColor='rgba(255,255,255,0.22)'",
        onmouseout: "this.style.color='#9ca3af';this.style.borderColor='rgba(255,255,255,0.12)'"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 Back to PO`);
          } else {
            return [
              createTextVNode("\u2190 Back to PO")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div style="${ssrRenderStyle({ "flex": "1", "text-align": "center" })}"><span style="${ssrRenderStyle({ "font-size": "13px", "color": "#d1d5db", "font-weight": "600" })}">${ssrInterpolate(unref(po).poNo)}</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-left": "8px" })}">Purchase Order Preview</span></div><button onclick="window.print()" style="${ssrRenderStyle({ "display": "inline-flex", "align-items": "center", "gap": "6px", "padding": "8px 18px", "border-radius": "10px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "color": "#000", "font-size": "12px", "font-weight": "700", "border": "none", "cursor": "pointer" })}"> \u{1F5A8}\uFE0F Print / Save PDF </button></div><div style="${ssrRenderStyle({ "max-width": "794px", "margin": "32px auto", "padding-bottom": "48px" })}" class="no-print-margin"><div style="${ssrRenderStyle({ "background": "#fff", "box-shadow": "0 4px 32px rgba(0,0,0,0.18)", "border-radius": "4px", "overflow": "hidden" })}"><div style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%)", "padding": "28px 40px", "display": "flex", "align-items": "flex-start", "justify-content": "space-between", "gap": "24px" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "flex-start", "gap": "16px" })}"><div style="${ssrRenderStyle({ "width": "48px", "height": "48px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "border-radius": "12px", "display": "flex", "align-items": "center", "justify-content": "center", "font-weight": "900", "font-size": "20px", "color": "#000", "flex-shrink": "0", "box-shadow": "0 4px 16px rgba(245,158,11,0.4)" })}">U</div><div><div style="${ssrRenderStyle({ "font-size": "19px", "font-weight": "800", "color": "#fff", "letter-spacing": "-0.3px" })}">Ujjal Flour Mills Co.</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#f59e0b", "font-weight": "600", "margin-top": "3px", "letter-spacing": "0.05em" })}">PREMIUM WHEAT PRODUCTS</div><div style="${ssrRenderStyle({ "font-size": "10.5px", "color": "#9ca3af", "margin-top": "5px", "line-height": "1.7" })}"> Sirajgonj Sadar, Sirajgonj-6700 \xB7 Demra, Dhaka-1361<br> \u{1F4DE} +880 1711-000000 \xB7 \u2709 purchase@ujjalfmc.com<br> Trade Lic: TL-SRG-2018-4821 \xB7 BIN: 002148694 </div></div></div><div style="${ssrRenderStyle({ "text-align": "right", "flex-shrink": "0" })}"><div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "700", "color": "#f59e0b", "letter-spacing": "0.15em", "text-transform": "uppercase", "margin-bottom": "6px" })}">Purchase Order</div><div style="${ssrRenderStyle({ "font-size": "24px", "font-weight": "900", "color": "#fff", "letter-spacing": "-0.5px", "font-family": "monospace" })}">${ssrInterpolate(unref(po).poNo)}</div><div style="${ssrRenderStyle({ "margin-top": "10px", "display": "flex", "flex-direction": "column", "gap": "4px", "align-items": "flex-end" })}"><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Issue Date</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#e5e7eb", "font-weight": "600" })}">${ssrInterpolate(unref(po).poDate)}</span></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Expected Delivery</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#f87171", "font-weight": "700" })}">${ssrInterpolate(unref(po).expectedDelivery)}</span></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Created By</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#e5e7eb", "font-weight": "600" })}">${ssrInterpolate(unref(po).createdBy)}</span></div><div style="${ssrRenderStyle({ "margin-top": "6px" })}"><span style="${ssrRenderStyle(`font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;${unref(statusStyle)}`)}">${ssrInterpolate(unref(po).status.replace(/_/g, " ").toUpperCase())}</span></div></div></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "border-bottom": "1px solid #f0ede8" })}"><div style="${ssrRenderStyle({ "padding": "22px 40px", "border-right": "1px solid #f0ede8" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "10px" })}">Buyer</div><div style="${ssrRenderStyle({ "font-size": "15px", "font-weight": "800", "color": "#111", "margin-bottom": "4px" })}">Ujjal Flour Mills Co.</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "line-height": "1.8" })}"><div>Sirajgonj Sadar, Sirajgonj-6700, Bangladesh</div><div>BIN: 002148694 \xB7 Trade Lic: TL-SRG-2018-4821</div><div style="${ssrRenderStyle({ "margin-top": "6px" })}">Delivery to: <span style="${ssrRenderStyle({ "font-weight": "700", "color": "#374151" })}">${ssrInterpolate(unref(po).deliveryTo)}</span></div></div></div><div style="${ssrRenderStyle({ "padding": "22px 40px" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "10px" })}">Supplier / Vendor</div><div style="${ssrRenderStyle({ "font-size": "15px", "font-weight": "800", "color": "#111", "margin-bottom": "4px" })}">${ssrInterpolate(unref(po).supplier)}</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "line-height": "1.8" })}"><div>${ssrInterpolate(unref(po).supplierAddress)}</div><div>\u{1F4DE} ${ssrInterpolate(unref(po).supplierPhone)}</div><div style="${ssrRenderStyle({ "margin-top": "6px" })}">Payment Terms: <span style="${ssrRenderStyle({ "font-weight": "700", "color": "#374151" })}">Net ${ssrInterpolate(unref(po).paymentTerms)} days</span></div></div></div></div><div style="${ssrRenderStyle({ "padding": "0 40px" })}"><table style="${ssrRenderStyle({ "width": "100%", "border-collapse": "collapse" })}"><thead><tr style="${ssrRenderStyle({ "background": "#faf8f5", "border-bottom": "2px solid #f0ede8" })}"><th style="${ssrRenderStyle({ "padding": "11px 10px", "text-align": "left", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">#</th><th style="${ssrRenderStyle({ "padding": "11px 10px", "text-align": "left", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Product Description</th><th style="${ssrRenderStyle({ "padding": "11px 10px", "text-align": "center", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Origin</th><th style="${ssrRenderStyle({ "padding": "11px 10px", "text-align": "right", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Quantity (MT)</th><th style="${ssrRenderStyle({ "padding": "11px 10px", "text-align": "right", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Unit Price/MT</th><th style="${ssrRenderStyle({ "padding": "11px 10px", "text-align": "right", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Line Total</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(po).items, (item, i) => {
        _push(`<tr style="${ssrRenderStyle(`border-bottom:1px solid #f5f3f0;background:${i % 2 === 0 ? "#fff" : "#fefcfa"}`)}"><td style="${ssrRenderStyle({ "padding": "12px 10px", "font-size": "11px", "color": "#9ca3af", "font-weight": "600" })}">${ssrInterpolate(i + 1)}</td><td style="${ssrRenderStyle({ "padding": "12px 10px" })}"><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#111" })}">${ssrInterpolate(item.product)}</div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#9ca3af", "margin-top": "2px" })}">Wheat flour raw material \xB7 Ujjal FMC procurement</div></td><td style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "center", "font-size": "12px", "color": "#374151", "font-weight": "600" })}">${ssrInterpolate(unref(po).origin)}</td><td style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "right", "font-size": "13px", "font-weight": "700", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate(item.qty.toLocaleString())}</td><td style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "right", "font-size": "13px", "color": "#374151", "font-family": "monospace" })}">\u09F3${ssrInterpolate(item.unitPrice.toLocaleString())}</td><td style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "right", "font-size": "13px", "font-weight": "800", "color": "#111", "font-family": "monospace" })}">\u09F3${ssrInterpolate((item.qty * item.unitPrice).toLocaleString())}</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 280px", "border-top": "2px solid #f0ede8", "margin": "0 40px", "padding": "22px 0" })}"><div style="${ssrRenderStyle({ "padding-right": "28px" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "10px" })}">Terms &amp; Conditions</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "line-height": "1.8" })}">`);
      if (unref(po).notes) {
        _push(`<div style="${ssrRenderStyle({ "margin-bottom": "8px", "font-style": "italic", "color": "#374151", "padding": "8px 10px", "background": "#faf8f5", "border-radius": "6px", "border-left": "3px solid #f59e0b" })}"> \u{1F4DD} ${ssrInterpolate(unref(po).notes)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div>\u2022 Goods must conform to specified quality standards upon delivery.</div><div>\u2022 Moisture content must not exceed 13% for wheat.</div><div>\u2022 Supplier must provide phytosanitary certificate for imported wheat.</div><div>\u2022 Payment within ${ssrInterpolate(unref(po).paymentTerms)} days of GRN acceptance.</div><div>\u2022 Any short delivery must be notified before unloading.</div><div>\u2022 Subject to Sirajgonj jurisdiction.</div></div></div><div style="${ssrRenderStyle({ "background": "#faf8f5", "border-radius": "12px", "padding": "18px", "border": "1px solid #f0ede8", "align-self": "start" })}"><!--[-->`);
      ssrRenderList(unref(po).items, (item) => {
        _push(`<div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0", "font-size": "12px", "border-bottom": "1px solid #f0ede8", "margin-bottom": "4px" })}"><span style="${ssrRenderStyle({ "color": "#6b7280" })}">${ssrInterpolate(item.qty)} MT \xD7 \u09F3${ssrInterpolate(item.unitPrice.toLocaleString())}</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#374151" })}">\u09F3${ssrInterpolate((item.qty * item.unitPrice).toLocaleString())}</span></div>`);
      });
      _push(`<!--]--><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0", "font-size": "12px" })}"><span style="${ssrRenderStyle({ "color": "#6b7280" })}">VAT / Tax</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#374151" })}">\u09F30</span></div><div style="${ssrRenderStyle({ "border-top": "1px solid #e5e0d8", "margin": "10px 0" })}"></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0", "font-size": "16px", "font-weight": "900" })}"><span style="${ssrRenderStyle({ "color": "#111" })}">PO Total</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#b45309" })}">\u09F3${ssrInterpolate(unref(po).totalAmount.toLocaleString())}</span></div><div style="${ssrRenderStyle({ "margin-top": "10px", "padding": "10px 12px", "background": "linear-gradient(135deg,#fef3c7,#fef9ee)", "border-radius": "8px", "border": "1px solid #fcd34d" })}"><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#92400e", "font-weight": "700", "margin-bottom": "4px" })}">PAYMENT TERMS</div><div style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "700", "color": "#b45309" })}">Net ${ssrInterpolate(unref(po).paymentTerms)} days after delivery</div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#b45309", "opacity": "0.8", "margin-top": "2px" })}">Due by: ${ssrInterpolate(unref(dueDate))}</div></div></div></div>`);
      if (unref(po).grns.length > 0) {
        _push(`<div style="${ssrRenderStyle({ "margin": "0 40px", "padding": "18px 20px", "background": "#f0fdf4", "border-radius": "10px", "border": "1px solid #bbf7d0", "margin-bottom": "20px" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#166534", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "12px" })}">Delivery Progress</div><div style="${ssrRenderStyle({ "display": "flex", "gap": "32px", "margin-bottom": "12px" })}"><div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Ordered</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "800", "color": "#111", "font-family": "monospace" })}">${ssrInterpolate(unref(totalOrdered))} MT</div></div><div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Received</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "800", "color": "#16a34a", "font-family": "monospace" })}">${ssrInterpolate(unref(totalReceived))} MT</div></div><div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Pending</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "800", "color": "#ca8a04", "font-family": "monospace" })}">${ssrInterpolate(unref(totalOrdered) - unref(totalReceived))} MT</div></div><div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Completion</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "800", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate(Math.round(unref(totalReceived) / unref(totalOrdered) * 100))}%</div></div></div><div style="${ssrRenderStyle({ "height": "6px", "background": "#dcfce7", "border-radius": "9999px", "overflow": "hidden" })}"><div style="${ssrRenderStyle(`width:${Math.round(unref(totalReceived) / unref(totalOrdered) * 100)}%;height:100%;background:#16a34a;border-radius:9999px;`)}"></div></div><table style="${ssrRenderStyle({ "width": "100%", "border-collapse": "collapse", "margin-top": "12px" })}"><thead><tr style="${ssrRenderStyle({ "border-bottom": "1px solid #bbf7d0" })}"><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "left", "font-size": "9px", "color": "#166534", "font-weight": "700", "text-transform": "uppercase" })}">GRN No.</th><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "left", "font-size": "9px", "color": "#166534", "font-weight": "700", "text-transform": "uppercase" })}">Date</th><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "right", "font-size": "9px", "color": "#166534", "font-weight": "700", "text-transform": "uppercase" })}">Qty (MT)</th><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "center", "font-size": "9px", "color": "#166534", "font-weight": "700", "text-transform": "uppercase" })}">Grade</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(po).grns, (grn) => {
          _push(`<tr style="${ssrRenderStyle({ "border-bottom": "1px solid #dcfce7" })}"><td style="${ssrRenderStyle({ "padding": "5px 8px", "font-size": "11px", "font-family": "monospace", "color": "#111", "font-weight": "600" })}">${ssrInterpolate(grn.grnNo)}</td><td style="${ssrRenderStyle({ "padding": "5px 8px", "font-size": "11px", "color": "#374151" })}">${ssrInterpolate(grn.date)}</td><td style="${ssrRenderStyle({ "padding": "5px 8px", "font-size": "11px", "text-align": "right", "font-family": "monospace", "color": "#16a34a", "font-weight": "700" })}">${ssrInterpolate(grn.qty)}</td><td style="${ssrRenderStyle({ "padding": "5px 8px", "font-size": "11px", "text-align": "center", "font-weight": "700", "color": "#374151" })}">${ssrInterpolate(grn.grade)}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle({ "margin": "0 40px", "padding": "24px 0 0", "border-top": "1px solid #f0ede8", "display": "grid", "grid-template-columns": "1fr 1fr 1fr", "gap": "32px" })}"><!--[-->`);
      ssrRenderList(["Prepared By", "Authorised By", "Supplier Acceptance"], (sig) => {
        _push(`<div style="${ssrRenderStyle({ "text-align": "center" })}"><div style="${ssrRenderStyle({ "height": "48px", "border-bottom": "1.5px solid #d1d5db", "margin-bottom": "8px" })}"></div><div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "700", "color": "#6b7280", "letter-spacing": "0.05em" })}">${ssrInterpolate(sig)}</div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "3px" })}">Signature &amp; Stamp</div></div>`);
      });
      _push(`<!--]--></div><div style="${ssrRenderStyle({ "margin-top": "24px", "background": "#faf8f5", "border-top": "1px solid #f0ede8", "padding": "14px 40px", "display": "flex", "align-items": "center", "justify-content": "space-between" })}"><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#9ca3af" })}"> Generated by Ujjal FMC ERP \xB7 ${ssrInterpolate(unref(generatedAt))}</div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#9ca3af", "text-align": "center" })}"> This is a computer-generated Purchase Order.<br> Valid only with authorised signature and company stamp. </div><div style="${ssrRenderStyle({ "text-align": "right" })}"><div style="${ssrRenderStyle({ "width": "44px", "height": "44px", "background": "#111", "border-radius": "6px", "display": "flex", "align-items": "center", "justify-content": "center", "margin-left": "auto" })}"><svg width="32" height="32" viewBox="0 0 36 36" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white"></rect><rect x="5" y="5" width="8" height="8" rx="1" fill="#111"></rect><rect x="20" y="2" width="14" height="14" rx="2" fill="white"></rect><rect x="23" y="5" width="8" height="8" rx="1" fill="#111"></rect><rect x="2" y="20" width="14" height="14" rx="2" fill="white"></rect><rect x="5" y="23" width="8" height="8" rx="1" fill="#111"></rect><rect x="20" y="20" width="4" height="4" fill="white"></rect><rect x="26" y="20" width="4" height="4" fill="white"></rect><rect x="20" y="26" width="4" height="4" fill="white"></rect><rect x="26" y="26" width="8" height="8" fill="white"></rect><rect x="32" y="20" width="2" height="4" fill="white"></rect></svg></div><div style="${ssrRenderStyle({ "font-size": "8px", "color": "#9ca3af", "margin-top": "3px", "text-align": "center" })}">Scan to verify</div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/orders/[id]/print.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=print-b6F7mgJy.mjs.map
