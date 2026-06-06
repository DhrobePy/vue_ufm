import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
import { k as useRoute, p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "invoice",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const orderId = computed(() => Number(route.params.id));
    const [{ data, error }, { data: settingsData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        () => `/api/credit-sales/${orderId.value}`,
        "$bi99f3578J"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/settings/documents",
        "$Y_4DcIPs5l"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const invoiceNo = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = data.value) == null ? void 0 : _a.order) == null ? void 0 : _b.order_number) != null ? _c : `INV-${orderId.value}`;
    });
    const order = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const o = (_a = data.value) == null ? void 0 : _a.order;
      if (!o) return null;
      return {
        customer: o.customer_name,
        customerType: (_b = o.customer_type) != null ? _b : "credit",
        branch: (_c = o.branch_name) != null ? _c : "\u2014",
        status: o.status,
        priority: o.priority,
        total: Number((_d = o.total_amount) != null ? _d : 0),
        advance: Number((_e = o.amount_paid) != null ? _e : 0),
        orderDate: String(o.order_date).slice(0, 10),
        requiredDate: o.required_date ? String(o.required_date).slice(0, 10) : "\u2014",
        deliveryAddress: (_f = o.delivery_address) != null ? _f : "",
        notes: (_g = o.notes) != null ? _g : "",
        // Customer credit info
        creditLimit: Number((_h = o.credit_limit) != null ? _h : 0),
        currentBalance: Number((_i = o.current_balance) != null ? _i : 0),
        balanceDue: Number((_j = o.balance_due) != null ? _j : 0)
      };
    });
    const items = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.items) != null ? _b : []).map((i) => {
          var _a2, _b2, _c, _d;
          return {
            id: i.id,
            product: `${(_a2 = i.product_name) != null ? _a2 : "\u2014"}${i.weight_variant ? " \u2014 " + i.weight_variant : ""}`,
            qty: Number((_b2 = i.quantity) != null ? _b2 : 0),
            price: Number((_c = i.unit_price) != null ? _c : 0),
            discount: Number((_d = i.discount_amount) != null ? _d : 0)
          };
        });
      }
    );
    const payments = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payments) != null ? _b : [];
    });
    const totalPaid = computed(() => payments.value.reduce((s, p) => s + Number(p.amount), 0));
    const subtotal = computed(() => items.value.reduce((s, i) => s + i.qty * i.price, 0));
    const totalDiscount = computed(() => items.value.reduce((s, i) => s + i.discount, 0));
    const statusStyle = computed(() => {
      var _a, _b;
      const s = (_b = (_a = order.value) == null ? void 0 : _a.status) != null ? _b : "";
      if (s === "completed" || s === "delivered") return "background:#dcfce7;color:#166534;border:1px solid #bbf7d0;";
      if (s === "cancelled" || s === "rejected") return "background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;";
      if (s === "in_production" || s === "ready_to_ship") return "background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;";
      if (s === "escalated") return "background:#fed7aa;color:#9a3412;border:1px solid #fdba74;";
      return "background:#fef3c7;color:#92400e;border:1px solid #fcd34d;";
    });
    const generatedAt = (/* @__PURE__ */ new Date()).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    const { user: sessionUser } = useUserSession();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const TC_DEFAULT = [
      "Payment due within 30 days of invoice date.",
      "Goods once sold cannot be returned without prior written approval.",
      "Interest @ 2% per month charged on overdue balances.",
      "All disputes subject to Sirajgonj jurisdiction.",
      "This invoice is valid only with authorised company stamp."
    ].join("\n");
    computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = settingsData.value) == null ? void 0 : _a.settings) == null ? void 0 : _b.tc_credit_invoice) != null ? _c : TC_DEFAULT;
    });
    const tcDraft = ref("");
    const tcLive = ref("");
    const tcEditorOpen = ref(false);
    const tcSaving = ref(false);
    const tcSaveMsg = ref("");
    const tcClauses = computed(() => tcLive.value.split("\n").map((l) => l.trim()).filter(Boolean));
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "min-height": "100vh", "background": "#e8e4dd", "font-family": "'Inter',sans-serif" } }, _attrs))}><div class="no-print" style="${ssrRenderStyle({ "position": "sticky", "top": "0", "z-index": "100", "background": "rgba(14,12,10,0.95)", "backdrop-filter": "blur(12px)", "border-bottom": "1px solid rgba(255,255,255,0.08)", "padding": "12px 24px", "display": "flex", "align-items": "center", "gap": "12px" })}">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/credit-sales/${unref(route).params.id}`,
        style: { "display": "inline-flex", "align-items": "center", "gap": "6px", "padding": "7px 14px", "border-radius": "10px", "border": "1px solid rgba(255,255,255,0.12)", "color": "#9ca3af", "font-size": "12px", "font-weight": "500", "text-decoration": "none", "transition": "all .15s ease" },
        onmouseover: "this.style.color='#e5e7eb';this.style.borderColor='rgba(255,255,255,0.22)'",
        onmouseout: "this.style.color='#9ca3af';this.style.borderColor='rgba(255,255,255,0.12)'"
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
      _push(`<div style="${ssrRenderStyle({ "flex": "1", "text-align": "center" })}"><span style="${ssrRenderStyle({ "font-size": "13px", "color": "#d1d5db", "font-weight": "600" })}">${ssrInterpolate(unref(invoiceNo))}</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-left": "8px" })}">Preview \u2014 click Print to generate PDF</span></div>`);
      if (unref(isAdmin)) {
        _push(`<button style="${ssrRenderStyle(`display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:all .15s;${unref(tcEditorOpen) ? "background:rgba(245,158,11,0.15);color:#f59e0b;" : "background:rgba(255,255,255,0.07);color:#9ca3af;"}`)}"> \u270F\uFE0F Edit T&amp;C </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button onclick="window.print()" style="${ssrRenderStyle({ "display": "inline-flex", "align-items": "center", "gap": "6px", "padding": "8px 18px", "border-radius": "10px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "color": "#000", "font-size": "12px", "font-weight": "700", "border": "none", "cursor": "pointer" })}"> \u{1F5A8}\uFE0F Print / Save PDF </button></div>`);
      if (unref(isAdmin) && unref(tcEditorOpen)) {
        _push(`<div class="no-print" style="${ssrRenderStyle({ "background": "rgba(20,16,10,0.97)", "border-bottom": "1px solid rgba(245,158,11,0.2)", "padding": "16px 24px" })}"><div style="${ssrRenderStyle({ "max-width": "794px", "margin": "0 auto" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "justify-content": "space-between", "margin-bottom": "10px" })}"><div><span style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#f59e0b" })}">Credit Invoice \u2014 Notes &amp; Terms</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-left": "8px" })}">One clause per line \xB7 changes apply to all future prints</span></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px" })}"><button style="${ssrRenderStyle({ "padding": "6px 12px", "border-radius": "8px", "border": "1px solid rgba(255,255,255,0.1)", "background": "transparent", "color": "#9ca3af", "font-size": "11px", "cursor": "pointer" })}"> Reset to Default </button><button${ssrIncludeBooleanAttr(unref(tcSaving)) ? " disabled" : ""} style="${ssrRenderStyle({ "padding": "6px 14px", "border-radius": "8px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "color": "#000", "font-size": "11px", "font-weight": "700", "border": "none", "cursor": "pointer" })}">${ssrInterpolate(unref(tcSaving) ? "Saving\u2026" : "\u2713 Save T&C")}</button></div></div><textarea rows="7" style="${ssrRenderStyle({ "width": "100%", "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(245,158,11,0.2)", "border-radius": "10px", "color": "#e5e7eb", "font-size": "12px", "line-height": "1.7", "padding": "12px 14px", "resize": "vertical", "font-family": "'Inter',sans-serif", "outline": "none" })}" placeholder="One clause per line\u2026">${ssrInterpolate(unref(tcDraft))}</textarea>`);
        if (unref(tcSaveMsg)) {
          _push(`<p style="${ssrRenderStyle([{ "font-size": "11px", "margin-top": "6px" }, unref(tcSaveMsg).startsWith("\u2713") ? "color:#4ade80;" : "color:#f87171;"])}">${ssrInterpolate(unref(tcSaveMsg))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle({ "max-width": "794px", "margin": "32px auto", "padding-bottom": "48px" })}" class="no-print-margin"><div id="invoice-paper" style="${ssrRenderStyle({ "background": "#fff", "box-shadow": "0 4px 32px rgba(0,0,0,0.18),0 1px 4px rgba(0,0,0,0.12)", "border-radius": "4px", "overflow": "hidden" })}"><div style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%)", "padding": "32px 40px", "display": "flex", "align-items": "flex-start", "justify-content": "space-between", "gap": "24px" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "flex-start", "gap": "16px" })}"><div style="${ssrRenderStyle({ "width": "52px", "height": "52px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "border-radius": "12px", "display": "flex", "align-items": "center", "justify-content": "center", "font-weight": "900", "font-size": "22px", "color": "#000", "flex-shrink": "0", "box-shadow": "0 4px 16px rgba(245,158,11,0.4)" })}">U</div><div><div style="${ssrRenderStyle({ "font-size": "20px", "font-weight": "800", "color": "#fff", "letter-spacing": "-0.3px" })}">Ujjal Flour Mills Co.</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#f59e0b", "font-weight": "600", "margin-top": "3px", "letter-spacing": "0.05em" })}">PREMIUM WHEAT PRODUCTS</div><div style="${ssrRenderStyle({ "font-size": "10.5px", "color": "#9ca3af", "margin-top": "6px", "line-height": "1.7" })}"> Sirajgonj Sadar, Sirajgonj-6700 \xB7 Demra, Dhaka-1361<br> \u{1F4DE} +880 1711-000000 \xB7 \u2709 accounts@ujjalfmc.com<br> Trade Lic: TL-SRG-2018-4821 \xB7 BIN: 002148694 </div></div></div><div style="${ssrRenderStyle({ "text-align": "right", "flex-shrink": "0" })}"><div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "700", "color": "#f59e0b", "letter-spacing": "0.15em", "text-transform": "uppercase", "margin-bottom": "6px" })}">Credit Invoice</div><div style="${ssrRenderStyle({ "font-size": "24px", "font-weight": "900", "color": "#fff", "letter-spacing": "-0.5px" })}">${ssrInterpolate(unref(invoiceNo))}</div><div style="${ssrRenderStyle({ "margin-top": "10px", "display": "flex", "flex-direction": "column", "gap": "4px", "align-items": "flex-end" })}"><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Issue Date</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#e5e7eb", "font-weight": "600" })}">${ssrInterpolate(unref(order).orderDate)}</span></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Due Date</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#f87171", "font-weight": "700" })}">${ssrInterpolate(unref(order).requiredDate)}</span></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Branch</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#e5e7eb", "font-weight": "600" })}">${ssrInterpolate(unref(order).branch)}</span></div><div style="${ssrRenderStyle({ "margin-top": "6px" })}"><span style="${ssrRenderStyle(`font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;${unref(statusStyle)}`)}">${ssrInterpolate(unref(order).status.replace(/_/g, " ").toUpperCase())}</span></div></div></div></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr", "border-bottom": "1px solid #f0ede8" })}"><div style="${ssrRenderStyle({ "padding": "24px 40px", "border-right": "1px solid #f0ede8" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "10px" })}">Bill To</div><div style="${ssrRenderStyle({ "font-size": "15px", "font-weight": "800", "color": "#111", "margin-bottom": "4px" })}">${ssrInterpolate(unref(order).customer)}</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "line-height": "1.8" })}"><div>${ssrInterpolate(unref(order).customerType)} Customer \xB7 ${ssrInterpolate(unref(order).branch)} Territory</div><div>Credit Limit: <span style="${ssrRenderStyle({ "font-weight": "700", "color": "#d97706" })}">\u09F3${ssrInterpolate(((_b = (_a = unref(order)) == null ? void 0 : _a.creditLimit) != null ? _b : 0).toLocaleString())}</span></div><div>Outstanding: <span style="${ssrRenderStyle({ "font-weight": "700", "color": "#dc2626" })}">\u09F3${ssrInterpolate(((_d = (_c = unref(order)) == null ? void 0 : _c.currentBalance) != null ? _d : 0).toLocaleString())}</span></div></div></div><div style="${ssrRenderStyle({ "padding": "24px 40px" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "10px" })}">Ship To</div><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "600", "color": "#111", "margin-bottom": "4px" })}">${ssrInterpolate(unref(order).customer)}</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "line-height": "1.8" })}"><div>${ssrInterpolate(unref(order).deliveryAddress)}</div><div>Priority: <span style="${ssrRenderStyle(`font-weight:700;color:${unref(order).priority === "urgent" ? "#dc2626" : unref(order).priority === "high" ? "#ea580c" : "#6b7280"}`)}">${ssrInterpolate(unref(order).priority.toUpperCase())}</span></div></div></div></div><div style="${ssrRenderStyle({ "padding": "0 40px" })}"><table style="${ssrRenderStyle({ "width": "100%", "border-collapse": "collapse", "margin": "0" })}"><thead><tr style="${ssrRenderStyle({ "background": "#faf8f5", "border-bottom": "2px solid #f0ede8" })}"><th style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "left", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">#</th><th style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "left", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Product Description</th><th style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "center", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Qty (Bags)</th><th style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "right", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Unit Price</th><th style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "right", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Discount</th><th style="${ssrRenderStyle({ "padding": "12px 10px", "text-align": "right", "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.1em", "text-transform": "uppercase" })}">Line Total</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(items), (item, i) => {
        _push(`<tr style="${ssrRenderStyle(`border-bottom:1px solid #f5f3f0;background:${i % 2 === 0 ? "#fff" : "#fefcfa"}`)}"><td style="${ssrRenderStyle({ "padding": "13px 10px", "font-size": "11px", "color": "#9ca3af", "font-weight": "600" })}">${ssrInterpolate(i + 1)}</td><td style="${ssrRenderStyle({ "padding": "13px 10px" })}"><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#111" })}">${ssrInterpolate(item.product)}</div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#9ca3af", "margin-top": "2px" })}">Premium wheat flour \xB7 Ujjal FMC brand</div></td><td style="${ssrRenderStyle({ "padding": "13px 10px", "text-align": "center", "font-size": "13px", "font-weight": "700", "color": "#374151" })}">${ssrInterpolate(item.qty.toLocaleString())}</td><td style="${ssrRenderStyle({ "padding": "13px 10px", "text-align": "right", "font-size": "13px", "color": "#374151", "font-family": "monospace" })}">\u09F3${ssrInterpolate(item.price.toLocaleString())}</td><td style="${ssrRenderStyle({ "padding": "13px 10px", "text-align": "right", "font-size": "12px", "color": "#dc2626", "font-family": "monospace" })}">${ssrInterpolate(item.discount > 0 ? `-\u09F3${item.discount.toLocaleString()}` : "\u2014")}</td><td style="${ssrRenderStyle({ "padding": "13px 10px", "text-align": "right", "font-size": "13px", "font-weight": "700", "color": "#111", "font-family": "monospace" })}"> \u09F3${ssrInterpolate((item.qty * item.price - item.discount).toLocaleString())}</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 300px", "gap": "0", "border-top": "2px solid #f0ede8", "margin": "0 40px 0 40px", "padding-top": "24px", "padding-bottom": "24px" })}"><div style="${ssrRenderStyle({ "padding-right": "32px" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "8px" })}">Notes &amp; Terms</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "line-height": "1.8" })}">`);
      if (unref(order).notes) {
        _push(`<div style="${ssrRenderStyle({ "margin-bottom": "6px", "font-style": "italic", "color": "#374151" })}">${ssrInterpolate(unref(order).notes)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(tcClauses), (clause, ci) => {
        _push(`<div>\u2022 ${ssrInterpolate(clause)}</div>`);
      });
      _push(`<!--]--></div></div><div style="${ssrRenderStyle({ "background": "#faf8f5", "border-radius": "12px", "padding": "20px", "border": "1px solid #f0ede8" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "5px 0", "font-size": "12px" })}"><span style="${ssrRenderStyle({ "color": "#6b7280" })}">Subtotal</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#374151" })}">\u09F3${ssrInterpolate(unref(subtotal).toLocaleString())}</span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "5px 0", "font-size": "12px" })}"><span style="${ssrRenderStyle({ "color": "#6b7280" })}">Line Discounts</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#dc2626" })}">-\u09F3${ssrInterpolate(unref(totalDiscount).toLocaleString())}</span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "5px 0", "font-size": "12px" })}"><span style="${ssrRenderStyle({ "color": "#6b7280" })}">Overall Discount</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#dc2626" })}">\u09F30</span></div><div style="${ssrRenderStyle({ "border-top": "1px solid #e5e0d8", "margin": "8px 0" })}"></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "8px 0", "font-size": "15px", "font-weight": "800" })}"><span style="${ssrRenderStyle({ "color": "#111" })}">Invoice Total</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#b45309" })}">\u09F3${ssrInterpolate(((_f = (_e = unref(order)) == null ? void 0 : _e.total) != null ? _f : 0).toLocaleString())}</span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "5px 0", "font-size": "12px" })}"><span style="${ssrRenderStyle({ "color": "#6b7280" })}">Total Paid${ssrInterpolate(unref(payments).length > 1 ? ` (${unref(payments).length} payments)` : unref(payments).length === 1 ? " (1 payment)" : "")}</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#16a34a", "font-weight": "600" })}">-\u09F3${ssrInterpolate(unref(totalPaid).toLocaleString())}</span></div><div style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#fef3c7,#fef9ee)", "border-radius": "8px", "padding": "12px 14px", "margin-top": "8px", "border": "1px solid #fcd34d" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "font-size": "14px", "font-weight": "800" })}"><span style="${ssrRenderStyle({ "color": "#92400e" })}">Balance Due</span><span style="${ssrRenderStyle({ "font-family": "monospace", "color": "#b45309" })}">\u09F3${ssrInterpolate(((_h = (_g = unref(order)) == null ? void 0 : _g.balanceDue) != null ? _h : 0).toLocaleString())}</span></div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#b45309", "margin-top": "4px", "opacity": "0.8" })}">Due: ${ssrInterpolate((_i = unref(order)) == null ? void 0 : _i.requiredDate)}</div></div></div></div>`);
      if (unref(payments).length) {
        _push(`<div style="${ssrRenderStyle({ "margin": "0 40px 24px", "padding": "20px", "border-radius": "12px", "background": "#f9fafb", "border": "1px solid #f0ede8" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "12px" })}"> Payment History </div><table style="${ssrRenderStyle({ "width": "100%", "border-collapse": "collapse" })}"><thead><tr style="${ssrRenderStyle({ "border-bottom": "1px solid #e5e7eb" })}"><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "left", "font-size": "9px", "font-weight": "700", "color": "#9ca3af", "text-transform": "uppercase" })}">Date</th><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "left", "font-size": "9px", "font-weight": "700", "color": "#9ca3af", "text-transform": "uppercase" })}">Reference</th><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "left", "font-size": "9px", "font-weight": "700", "color": "#9ca3af", "text-transform": "uppercase" })}">Method</th><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "left", "font-size": "9px", "font-weight": "700", "color": "#9ca3af", "text-transform": "uppercase" })}">Note</th><th style="${ssrRenderStyle({ "padding": "4px 8px", "text-align": "right", "font-size": "9px", "font-weight": "700", "color": "#9ca3af", "text-transform": "uppercase" })}">Amount</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(payments), (p) => {
          _push(`<tr style="${ssrRenderStyle({ "border-bottom": "1px solid #f3f4f6" })}"><td style="${ssrRenderStyle({ "padding": "6px 8px", "font-size": "11px", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate(String(p.payment_date).slice(0, 10))}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "font-size": "11px", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate(p.payment_number)}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "font-size": "11px", "color": "#6b7280" })}">${ssrInterpolate(p.payment_method)}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "font-size": "10px", "color": "#9ca3af", "font-style": "italic" })}">${ssrInterpolate(p.notes || "\u2014")}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "text-align": "right", "font-size": "12px", "font-weight": "700", "color": "#16a34a", "font-family": "monospace" })}">\u09F3${ssrInterpolate(Number(p.amount).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot><tr style="${ssrRenderStyle({ "border-top": "2px solid #e5e7eb" })}"><td colspan="4" style="${ssrRenderStyle({ "padding": "8px 8px", "font-size": "12px", "font-weight": "700", "color": "#374151" })}">Total Paid</td><td style="${ssrRenderStyle({ "padding": "8px 8px", "text-align": "right", "font-size": "13px", "font-weight": "800", "color": "#16a34a", "font-family": "monospace" })}">\u09F3${ssrInterpolate(unref(totalPaid).toLocaleString())}</td></tr></tfoot></table></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle({ "margin": "0 40px", "padding": "24px 0 0", "border-top": "1px solid #f0ede8", "display": "grid", "grid-template-columns": "1fr 1fr 1fr", "gap": "32px" })}"><!--[-->`);
      ssrRenderList(["Sales Officer", "Accounts & Finance", "Customer / Receiver"], (sig) => {
        _push(`<div style="${ssrRenderStyle({ "text-align": "center" })}"><div style="${ssrRenderStyle({ "height": "48px", "border-bottom": "1.5px solid #d1d5db", "margin-bottom": "8px" })}"></div><div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "700", "color": "#6b7280", "letter-spacing": "0.05em" })}">${ssrInterpolate(sig)}</div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "3px" })}">Signature &amp; Stamp</div></div>`);
      });
      _push(`<!--]--></div><div style="${ssrRenderStyle({ "margin-top": "28px", "background": "#faf8f5", "border-top": "1px solid #f0ede8", "padding": "16px 40px", "display": "flex", "align-items": "center", "justify-content": "space-between" })}"><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#9ca3af" })}"> Generated by Ujjal FMC ERP \xB7 ${ssrInterpolate(unref(generatedAt))}</div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#9ca3af", "text-align": "center" })}"> This is a computer-generated invoice and is valid without signature<br> when processed through the ERP system. </div><div style="${ssrRenderStyle({ "text-align": "right" })}"><div style="${ssrRenderStyle({ "width": "48px", "height": "48px", "background": "#111", "border-radius": "6px", "display": "flex", "align-items": "center", "justify-content": "center", "margin-left": "auto" })}"><svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white"></rect><rect x="5" y="5" width="8" height="8" rx="1" fill="#111"></rect><rect x="20" y="2" width="14" height="14" rx="2" fill="white"></rect><rect x="23" y="5" width="8" height="8" rx="1" fill="#111"></rect><rect x="2" y="20" width="14" height="14" rx="2" fill="white"></rect><rect x="5" y="23" width="8" height="8" rx="1" fill="#111"></rect><rect x="20" y="20" width="4" height="4" fill="white"></rect><rect x="26" y="20" width="4" height="4" fill="white"></rect><rect x="20" y="26" width="4" height="4" fill="white"></rect><rect x="26" y="26" width="8" height="8" fill="white"></rect><rect x="32" y="20" width="2" height="4" fill="white"></rect></svg></div><div style="${ssrRenderStyle({ "font-size": "8px", "color": "#9ca3af", "margin-top": "3px", "text-align": "center" })}">Scan to verify</div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/[id]/invoice.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=invoice-B4sEhpvn.mjs.map
