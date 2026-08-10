import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
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
  __name: "voucher",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const expenseId = computed(() => Number(route.params.id));
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/expenses/${expenseId.value}`,
      "$Spxgq4z6in"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const raw = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.expense;
    });
    function amountInWords(n) {
      if (!n || n === 0) return "Zero Taka Only";
      const ones = [
        "",
        "One",
        "Two",
        "Three",
        "Four",
        "Five",
        "Six",
        "Seven",
        "Eight",
        "Nine",
        "Ten",
        "Eleven",
        "Twelve",
        "Thirteen",
        "Fourteen",
        "Fifteen",
        "Sixteen",
        "Seventeen",
        "Eighteen",
        "Nineteen"
      ];
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      function toWords(num) {
        if (num === 0) return "";
        if (num < 20) return ones[num] + " ";
        if (num < 100) return tens[Math.floor(num / 10)] + " " + ones[num % 10] + " ";
        if (num < 1e3) return ones[Math.floor(num / 100)] + " Hundred " + toWords(num % 100);
        if (num < 1e5) return toWords(Math.floor(num / 1e3)) + "Thousand " + toWords(num % 1e3);
        if (num < 1e7) return toWords(Math.floor(num / 1e5)) + "Lakh " + toWords(num % 1e5);
        return toWords(Math.floor(num / 1e7)) + "Crore " + toWords(num % 1e7);
      }
      const integer = Math.floor(n);
      const decimal = Math.round((n - integer) * 100);
      let result = toWords(integer).trim() + " Taka";
      if (decimal > 0) result += " and " + toWords(decimal).trim() + " Paisa";
      return result + " Only";
    }
    const expense = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
      const e = raw.value;
      if (!e) return null;
      const glCode = (_b = (_a = e.gl_account_code) != null ? _a : e.category_code) != null ? _b : "";
      const glName = (_d = (_c = e.gl_account_name) != null ? _c : e.category_name) != null ? _d : "";
      const glAccount = glCode ? `${glCode} \u2014 ${glName}` : glName || "\u2014";
      let bankInfo = "";
      if (e.bank_name) {
        bankInfo = `${e.bank_name} \xB7 ${(_e = e.bank_account_name) != null ? _e : ""} (${(_f = e.account_number) != null ? _f : ""})`;
      } else if (e.payment_account_name) {
        bankInfo = e.payment_account_name;
      }
      return {
        expNo: e.voucher_number,
        date: String(e.expense_date).slice(0, 10),
        category: (_g = e.category_name) != null ? _g : "\u2014",
        subcategory: (_h = e.subcategory_name) != null ? _h : "",
        amount: Number((_i = e.total_amount) != null ? _i : 0),
        amountInWords: amountInWords(Number((_j = e.total_amount) != null ? _j : 0)),
        branch: (_k = e.branch_name) != null ? _k : "\u2014",
        method: (_l = e.payment_method) != null ? _l : "\u2014",
        submittedBy: (_n = (_m = e.created_by_name) != null ? _m : e.handled_by_person) != null ? _n : "\u2014",
        qty: Number((_o = e.unit_quantity) != null ? _o : 0),
        unit: (_p = e.unit_type) != null ? _p : "",
        unitCost: Number((_q = e.per_unit_cost) != null ? _q : 0),
        status: (_r = e.status) != null ? _r : "pending",
        remarks: (_s = e.remarks) != null ? _s : "",
        approvedBy: (_t = e.approved_by_name) != null ? _t : "",
        approvedAt: e.approved_at ? String(e.approved_at).slice(0, 10) : "",
        glAccount,
        bankInfo,
        paymentRef: (_u = e.payment_reference) != null ? _u : ""
      };
    });
    const statusStyle = computed(() => {
      var _a, _b;
      const s = (_b = (_a = expense.value) == null ? void 0 : _a.status) != null ? _b : "";
      if (s === "approved") return "background:#dcfce7;color:#166534;border:1px solid #bbf7d0;";
      if (s === "rejected") return "background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;";
      return "background:#fef3c7;color:#92400e;border:1px solid #fcd34d;";
    });
    const generatedAt = (/* @__PURE__ */ new Date()).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "min-height": "100vh", "background": "#e8e4dd", "font-family": "'Inter',sans-serif" } }, _attrs))}><div class="no-print" style="${ssrRenderStyle({ "position": "sticky", "top": "0", "z-index": "100", "background": "rgba(14,12,10,0.95)", "backdrop-filter": "blur(12px)", "border-bottom": "1px solid rgba(255,255,255,0.08)", "padding": "12px 24px", "display": "flex", "align-items": "center", "gap": "12px" })}">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/expenses/${unref(route).params.id}`,
        style: { "display": "inline-flex", "align-items": "center", "gap": "6px", "padding": "7px 14px", "border-radius": "10px", "border": "1px solid rgba(255,255,255,0.12)", "color": "#9ca3af", "font-size": "12px", "font-weight": "500", "text-decoration": "none" },
        onmouseover: "this.style.color='#e5e7eb';this.style.borderColor='rgba(255,255,255,0.22)'",
        onmouseout: "this.style.color='#9ca3af';this.style.borderColor='rgba(255,255,255,0.12)'"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 Back to Expense`);
          } else {
            return [
              createTextVNode("\u2190 Back to Expense")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div style="${ssrRenderStyle({ "flex": "1", "text-align": "center" })}"><span style="${ssrRenderStyle({ "font-size": "13px", "color": "#d1d5db", "font-weight": "600" })}">${ssrInterpolate((_a = unref(expense)) == null ? void 0 : _a.expNo)}</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280", "margin-left": "8px" })}">Expense Voucher Preview</span></div><button onclick="window.print()" style="${ssrRenderStyle({ "display": "inline-flex", "align-items": "center", "gap": "6px", "padding": "8px 18px", "border-radius": "10px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "color": "#000", "font-size": "12px", "font-weight": "700", "border": "none", "cursor": "pointer" })}"> \u{1F5A8}\uFE0F Print / Save PDF </button></div><div style="${ssrRenderStyle({ "max-width": "794px", "margin": "32px auto", "padding-bottom": "48px" })}" class="no-print-margin"><div style="${ssrRenderStyle({ "background": "#fff", "box-shadow": "0 4px 32px rgba(0,0,0,0.18)", "border-radius": "4px", "overflow": "hidden" })}"><div style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#1a1208 0%,#2d1f0a 60%,#1a1208 100%)", "padding": "28px 40px", "display": "flex", "align-items": "flex-start", "justify-content": "space-between", "gap": "24px" })}"><div style="${ssrRenderStyle({ "display": "flex", "align-items": "flex-start", "gap": "16px" })}"><div style="${ssrRenderStyle({ "width": "48px", "height": "48px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "border-radius": "12px", "display": "flex", "align-items": "center", "justify-content": "center", "font-weight": "900", "font-size": "20px", "color": "#000", "flex-shrink": "0", "box-shadow": "0 4px 16px rgba(245,158,11,0.4)" })}">U</div><div><div style="${ssrRenderStyle({ "font-size": "19px", "font-weight": "800", "color": "#fff", "letter-spacing": "-0.3px" })}">Ujjal Flour Mills Co.</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#f59e0b", "font-weight": "600", "margin-top": "3px", "letter-spacing": "0.05em" })}">PREMIUM WHEAT PRODUCTS</div><div style="${ssrRenderStyle({ "font-size": "10.5px", "color": "#9ca3af", "margin-top": "5px", "line-height": "1.7" })}"> Sirajgonj Sadar, Sirajgonj-6700 \xB7 Demra, Dhaka-1361<br> \u{1F4DE} +880 1711-000000 \xB7 \u2709 accounts@ujjalfmc.com </div></div></div><div style="${ssrRenderStyle({ "text-align": "right", "flex-shrink": "0" })}"><div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "700", "color": "#f59e0b", "letter-spacing": "0.15em", "text-transform": "uppercase", "margin-bottom": "6px" })}">Expense Voucher</div><div style="${ssrRenderStyle({ "font-size": "22px", "font-weight": "900", "color": "#fff", "letter-spacing": "-0.5px" })}">${ssrInterpolate((_b = unref(expense)) == null ? void 0 : _b.expNo)}</div><div style="${ssrRenderStyle({ "margin-top": "10px", "display": "flex", "flex-direction": "column", "gap": "4px", "align-items": "flex-end" })}"><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Date</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#e5e7eb", "font-weight": "600" })}">${ssrInterpolate((_c = unref(expense)) == null ? void 0 : _c.date)}</span></div><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "align-items": "center" })}"><span style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}">Branch</span><span style="${ssrRenderStyle({ "font-size": "11px", "color": "#e5e7eb", "font-weight": "600" })}">${ssrInterpolate((_d = unref(expense)) == null ? void 0 : _d.branch)}</span></div><div style="${ssrRenderStyle({ "margin-top": "6px" })}"><span style="${ssrRenderStyle(`font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;${unref(statusStyle)}`)}">${ssrInterpolate(((_f = (_e = unref(expense)) == null ? void 0 : _e.status) != null ? _f : "").toUpperCase())}</span></div></div></div></div><div style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#fffbf0,#fef9ee)", "border-bottom": "1px solid #f0ede8", "padding": "28px 40px", "text-align": "center" })}"><div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.15em", "text-transform": "uppercase", "margin-bottom": "10px" })}">Total Amount</div><div style="${ssrRenderStyle({ "font-size": "48px", "font-weight": "900", "color": "#b45309", "font-family": "monospace", "letter-spacing": "-1px" })}">\u09F3${ssrInterpolate(Number((_h = (_g = unref(expense)) == null ? void 0 : _g.amount) != null ? _h : 0).toLocaleString())}</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#92400e", "margin-top": "8px", "font-weight": "600" })}">${ssrInterpolate((_i = unref(expense)) == null ? void 0 : _i.amountInWords)}</div></div><div style="${ssrRenderStyle({ "padding": "28px 40px", "border-bottom": "1px solid #f0ede8" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "16px" })}">Expense Details</div><div style="${ssrRenderStyle({ "display": "grid", "grid-template-columns": "1fr 1fr 1fr", "gap": "20px" })}"><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Voucher No.</div><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#111", "font-family": "monospace" })}">${ssrInterpolate((_j = unref(expense)) == null ? void 0 : _j.expNo)}</div></div><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Category</div><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#111" })}">${ssrInterpolate((_k = unref(expense)) == null ? void 0 : _k.category)}</div></div><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Sub-category</div><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#374151" })}">${ssrInterpolate(((_l = unref(expense)) == null ? void 0 : _l.subcategory) || "\u2014")}</div></div><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Payment Method</div><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#111" })}">${ssrInterpolate((_m = unref(expense)) == null ? void 0 : _m.method)}</div></div><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Submitted By</div><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#111" })}">${ssrInterpolate((_n = unref(expense)) == null ? void 0 : _n.submittedBy)}</div></div><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">GL Account</div><div style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "600", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate((_o = unref(expense)) == null ? void 0 : _o.glAccount)}</div></div></div></div>`);
      if (((_p = unref(expense)) == null ? void 0 : _p.bankInfo) || ((_q = unref(expense)) == null ? void 0 : _q.paymentRef)) {
        _push(`<div style="${ssrRenderStyle({ "padding": "16px 40px", "border-bottom": "1px solid #f0ede8", "background": "#fffdf8", "display": "flex", "gap": "32px", "flex-wrap": "wrap" })}">`);
        if ((_r = unref(expense)) == null ? void 0 : _r.bankInfo) {
          _push(`<div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Payment Account</div><div style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "600", "color": "#374151" })}">${ssrInterpolate(unref(expense).bankInfo)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_s = unref(expense)) == null ? void 0 : _s.paymentRef) {
          _push(`<div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Reference / Cheque No.</div><div style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "700", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate(unref(expense).paymentRef)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (((_t = unref(expense)) == null ? void 0 : _t.qty) > 0) {
        _push(`<div style="${ssrRenderStyle({ "padding": "20px 40px", "border-bottom": "1px solid #f0ede8", "background": "#faf8f5" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "12px" })}">Quantity Breakdown</div><table style="${ssrRenderStyle({ "width": "100%", "border-collapse": "collapse" })}"><thead><tr style="${ssrRenderStyle({ "border-bottom": "1px solid #e5e0d8" })}"><th style="${ssrRenderStyle({ "padding": "8px 10px", "text-align": "left", "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em" })}">Description</th><th style="${ssrRenderStyle({ "padding": "8px 10px", "text-align": "right", "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em" })}">Qty</th><th style="${ssrRenderStyle({ "padding": "8px 10px", "text-align": "right", "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em" })}">Unit</th><th style="${ssrRenderStyle({ "padding": "8px 10px", "text-align": "right", "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em" })}">Unit Cost</th><th style="${ssrRenderStyle({ "padding": "8px 10px", "text-align": "right", "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em" })}">Total</th></tr></thead><tbody><tr><td style="${ssrRenderStyle({ "padding": "10px 10px", "font-size": "13px", "color": "#111", "font-weight": "600" })}">${ssrInterpolate(((_u = unref(expense)) == null ? void 0 : _u.subcategory) || ((_v = unref(expense)) == null ? void 0 : _v.category))}</td><td style="${ssrRenderStyle({ "padding": "10px 10px", "text-align": "right", "font-size": "13px", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate((_w = unref(expense)) == null ? void 0 : _w.qty)}</td><td style="${ssrRenderStyle({ "padding": "10px 10px", "text-align": "right", "font-size": "13px", "color": "#374151" })}">${ssrInterpolate((_x = unref(expense)) == null ? void 0 : _x.unit)}</td><td style="${ssrRenderStyle({ "padding": "10px 10px", "text-align": "right", "font-size": "13px", "color": "#374151", "font-family": "monospace" })}">\u09F3${ssrInterpolate(((_z = (_y = unref(expense)) == null ? void 0 : _y.unitCost) != null ? _z : 0).toLocaleString())}</td><td style="${ssrRenderStyle({ "padding": "10px 10px", "text-align": "right", "font-size": "13px", "font-weight": "800", "color": "#b45309", "font-family": "monospace" })}">\u09F3${ssrInterpolate(Number((_B = (_A = unref(expense)) == null ? void 0 : _A.amount) != null ? _B : 0).toLocaleString())}</td></tr></tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle({ "padding": "24px 40px", "border-bottom": "1px solid #f0ede8" })}"><div style="${ssrRenderStyle({ "font-size": "9px", "font-weight": "800", "color": "#9ca3af", "letter-spacing": "0.12em", "text-transform": "uppercase", "margin-bottom": "10px" })}">Remarks / Description</div><div style="${ssrRenderStyle({ "font-size": "13px", "color": "#374151", "line-height": "1.7", "font-style": "italic" })}">${ssrInterpolate((_C = unref(expense)) == null ? void 0 : _C.remarks)}</div></div><div style="${ssrRenderStyle({ "padding": "20px 40px", "border-bottom": "1px solid #f0ede8", "background": "#faf8f5", "display": "flex", "gap": "32px", "align-items": "center" })}"><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Cost Centre</div><div style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "700", "color": "#374151" })}">${ssrInterpolate((_E = (_D = unref(expense)) == null ? void 0 : _D.branch) != null ? _E : "\u2014")}</div></div><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">Journal Entry</div><div style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "700", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate(((_F = unref(expense)) == null ? void 0 : _F.status) === "approved" ? `JE-${unref(expense).expNo}` : "Pending Approval")}</div></div><div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "font-weight": "700", "text-transform": "uppercase", "letter-spacing": "0.08em", "margin-bottom": "5px" })}">GL Account</div><div style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "700", "color": "#374151", "font-family": "monospace" })}">${ssrInterpolate((_G = unref(expense)) == null ? void 0 : _G.glAccount)}</div></div><div style="${ssrRenderStyle({ "margin-left": "auto", "text-align": "right" })}"><div style="${ssrRenderStyle({ "font-size": "22px", "font-weight": "900", "color": "#b45309", "font-family": "monospace" })}">\u09F3${ssrInterpolate(((_I = (_H = unref(expense)) == null ? void 0 : _H.amount) != null ? _I : 0).toLocaleString())}</div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "2px" })}">TOTAL AMOUNT</div></div></div><div style="${ssrRenderStyle({ "padding": "28px 40px 0", "display": "grid", "grid-template-columns": "1fr 1fr 1fr", "gap": "32px" })}"><div style="${ssrRenderStyle({ "text-align": "center" })}"><div style="${ssrRenderStyle({ "height": "48px", "border-bottom": "1.5px solid #d1d5db", "margin-bottom": "8px" })}"></div><div style="${ssrRenderStyle({ "font-size": "11px", "font-weight": "700", "color": "#374151" })}">${ssrInterpolate((_J = unref(expense)) == null ? void 0 : _J.submittedBy)}</div><div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "700", "color": "#6b7280", "letter-spacing": "0.05em", "margin-top": "2px" })}">Submitted By</div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "3px" })}">Signature &amp; Stamp</div></div><div style="${ssrRenderStyle({ "text-align": "center" })}"><div style="${ssrRenderStyle({ "height": "48px", "border-bottom": "1.5px solid #d1d5db", "margin-bottom": "8px" })}"></div>`);
      if ((_K = unref(expense)) == null ? void 0 : _K.approvedBy) {
        _push(`<div style="${ssrRenderStyle({ "font-size": "11px", "font-weight": "700", "color": "#374151" })}">${ssrInterpolate(unref(expense).approvedBy)}</div>`);
      } else {
        _push(`<div style="${ssrRenderStyle({ "font-size": "11px", "color": "#9ca3af", "font-style": "italic" })}">Pending</div>`);
      }
      _push(`<div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "700", "color": "#6b7280", "letter-spacing": "0.05em", "margin-top": "2px" })}">Approved By</div>`);
      if ((_L = unref(expense)) == null ? void 0 : _L.approvedAt) {
        _push(`<div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "3px" })}">${ssrInterpolate(unref(expense).approvedAt)}</div>`);
      } else {
        _push(`<div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "3px" })}">Signature &amp; Stamp</div>`);
      }
      _push(`</div><div style="${ssrRenderStyle({ "text-align": "center" })}"><div style="${ssrRenderStyle({ "height": "48px", "border-bottom": "1.5px solid #d1d5db", "margin-bottom": "8px" })}"></div><div style="${ssrRenderStyle({ "font-size": "10px", "font-weight": "700", "color": "#6b7280", "letter-spacing": "0.05em" })}">Accounts &amp; Finance</div><div style="${ssrRenderStyle({ "font-size": "9px", "color": "#9ca3af", "margin-top": "3px" })}">Signature &amp; Stamp</div></div></div><div style="${ssrRenderStyle({ "margin-top": "28px", "background": "#faf8f5", "border-top": "1px solid #f0ede8", "padding": "16px 40px", "display": "flex", "align-items": "center", "justify-content": "space-between" })}"><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#9ca3af" })}"> Generated by Ujjal FMC ERP \xB7 ${ssrInterpolate(unref(generatedAt))}</div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#9ca3af", "text-align": "center" })}"> This is a system-generated expense voucher.<br> Please retain original receipts for audit purposes. </div><div style="${ssrRenderStyle({ "text-align": "right" })}"><div style="${ssrRenderStyle({ "width": "48px", "height": "48px", "background": "#111", "border-radius": "6px", "display": "flex", "align-items": "center", "justify-content": "center", "margin-left": "auto" })}"><svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" fill="white"></rect><rect x="5" y="5" width="8" height="8" rx="1" fill="#111"></rect><rect x="20" y="2" width="14" height="14" rx="2" fill="white"></rect><rect x="23" y="5" width="8" height="8" rx="1" fill="#111"></rect><rect x="2" y="20" width="14" height="14" rx="2" fill="white"></rect><rect x="5" y="23" width="8" height="8" rx="1" fill="#111"></rect><rect x="20" y="20" width="4" height="4" fill="white"></rect><rect x="26" y="20" width="4" height="4" fill="white"></rect><rect x="20" y="26" width="4" height="4" fill="white"></rect><rect x="26" y="26" width="8" height="8" fill="white"></rect><rect x="32" y="20" width="2" height="4" fill="white"></rect></svg></div><div style="${ssrRenderStyle({ "font-size": "8px", "color": "#9ca3af", "margin-top": "3px", "text-align": "center" })}">Scan to verify</div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/[id]/voucher.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=voucher-BBWkZtq5.mjs.map
