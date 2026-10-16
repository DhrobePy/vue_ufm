import { _ as __nuxt_component_0 } from './nuxt-link-DxEkMwEk.mjs';
import { defineComponent, ref, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
  __name: "statement",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const from = ref(`${today.slice(0, 4)}-01-01`);
    const to = ref(today);
    const { data: d, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/customers/${route.params.id}/statement`,
      { query: { from, to }, watch: false },
      "$xOMdK1KN7k"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const money = (v) => Number(v != null ? v : 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
    const day = (v) => {
      const m = String(v != null ? v : "").match(/^(\d{4})-(\d{2})-(\d{2})/);
      return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "\u2014";
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ style: { "min-height": "100vh", "background": "#e8e4dd", "font-family": "'Inter',sans-serif", "color": "#111" } }, _attrs))}><div class="no-print" style="${ssrRenderStyle({ "position": "sticky", "top": "0", "z-index": "50", "background": "rgba(14,12,10,0.95)", "padding": "12px 24px", "display": "flex", "flex-wrap": "wrap", "align-items": "center", "gap": "12px" })}">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/customers/${unref(route).params.id}?tab=ledger`,
        style: { "padding": "7px 14px", "border-radius": "10px", "border": "1px solid rgba(255,255,255,0.15)", "color": "#9ca3af", "font-size": "12px", "text-decoration": "none" }
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 Back to profile`);
          } else {
            return [
              createTextVNode("\u2190 Back to profile")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<label style="${ssrRenderStyle({ "color": "#9ca3af", "font-size": "12px" })}">From <input${ssrRenderAttr("value", unref(from))} type="date" style="${ssrRenderStyle({ "margin-left": "4px", "padding": "5px 8px", "border-radius": "8px", "border": "1px solid #444", "background": "#1c1917", "color": "#eee" })}"></label><label style="${ssrRenderStyle({ "color": "#9ca3af", "font-size": "12px" })}">To <input${ssrRenderAttr("value", unref(to))} type="date" style="${ssrRenderStyle({ "margin-left": "4px", "padding": "5px 8px", "border-radius": "8px", "border": "1px solid #444", "background": "#1c1917", "color": "#eee" })}"></label><button style="${ssrRenderStyle({ "padding": "7px 14px", "border-radius": "10px", "background": "#f59e0b", "color": "#000", "font-size": "12px", "font-weight": "700", "border": "0", "cursor": "pointer" })}">Apply</button><span style="${ssrRenderStyle({ "flex": "1" })}"></span><button style="${ssrRenderStyle({ "padding": "7px 18px", "border-radius": "10px", "background": "#f59e0b", "color": "#000", "font-size": "12px", "font-weight": "700", "border": "0", "cursor": "pointer" })}">\u{1F5A8}\uFE0F Print</button></div>`);
      if (unref(pending)) {
        _push(`<div style="${ssrRenderStyle({ "padding": "40px", "text-align": "center", "color": "#666" })}">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div style="${ssrRenderStyle({ "padding": "40px", "text-align": "center", "color": "#b91c1c" })}">${ssrInterpolate((_a = unref(error).statusMessage) != null ? _a : "Could not load the statement")}</div>`);
      } else if (unref(d)) {
        _push(`<div id="statement" style="${ssrRenderStyle({ "max-width": "820px", "margin": "24px auto", "background": "#fff", "padding": "36px 40px", "box-shadow": "0 8px 30px rgba(0,0,0,0.15)" })}"><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "flex-start", "border-bottom": "2px solid #111", "padding-bottom": "14px" })}"><div><h1 style="${ssrRenderStyle({ "font-size": "20px", "font-weight": "800", "margin": "0" })}">Ujjal Flour Mills</h1></div><div style="${ssrRenderStyle({ "text-align": "right" })}"><h2 style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "800", "margin": "0", "letter-spacing": "0.04em" })}">ACCOUNT STATEMENT</h2><p style="${ssrRenderStyle({ "font-size": "11px", "color": "#555", "margin": "3px 0 0" })}">${ssrInterpolate(day(unref(d).from))} \u2013 ${ssrInterpolate(day(unref(d).to))}</p></div></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "margin": "16px 0", "font-size": "12px", "line-height": "1.6" })}"><div><strong style="${ssrRenderStyle({ "font-size": "14px" })}">${ssrInterpolate(unref(d).customer.name)}</strong>`);
        if (unref(d).customer.business_name) {
          _push(`<div>${ssrInterpolate(unref(d).customer.business_name)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(d).customer.business_address) {
          _push(`<div>${ssrInterpolate(unref(d).customer.business_address)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(d).customer.phone_number) {
          _push(`<div>Phone: ${ssrInterpolate(unref(d).customer.phone_number)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div style="${ssrRenderStyle({ "text-align": "right" })}"><div>Credit limit: <strong>\u09F3${ssrInterpolate(money(unref(d).customer.credit_limit))}</strong></div><div>Statement date: ${ssrInterpolate(day((/* @__PURE__ */ new Date()).toISOString()))}</div></div></div><table style="${ssrRenderStyle({ "width": "100%", "border-collapse": "collapse", "font-size": "11.5px" })}"><thead><tr style="${ssrRenderStyle({ "background": "#111", "color": "#fff" })}"><th style="${ssrRenderStyle({ "padding": "7px 8px", "text-align": "left" })}">Date</th><th style="${ssrRenderStyle({ "padding": "7px 8px", "text-align": "left" })}">Reference</th><th style="${ssrRenderStyle({ "padding": "7px 8px", "text-align": "left" })}">Description</th><th style="${ssrRenderStyle({ "padding": "7px 8px", "text-align": "right" })}">Debit</th><th style="${ssrRenderStyle({ "padding": "7px 8px", "text-align": "right" })}">Credit</th><th style="${ssrRenderStyle({ "padding": "7px 8px", "text-align": "right" })}">Balance</th></tr></thead><tbody><tr style="${ssrRenderStyle({ "background": "#f5f3ef", "font-weight": "700" })}"><td colspan="5" style="${ssrRenderStyle({ "padding": "6px 8px" })}">Opening balance</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "text-align": "right" })}">\u09F3${ssrInterpolate(money(unref(d).openingBalance))}</td></tr><!--[-->`);
        ssrRenderList(unref(d).lines, (l, i) => {
          _push(`<tr style="${ssrRenderStyle({ "border-bottom": "1px solid #e7e3dc" })}"><td style="${ssrRenderStyle({ "padding": "6px 8px", "white-space": "nowrap" })}">${ssrInterpolate(day(l.date))}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "font-family": "monospace" })}">${ssrInterpolate(l.ref)}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "color": "#444" })}">${ssrInterpolate(l.description)}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "text-align": "right" })}">${ssrInterpolate(l.debit ? money(l.debit) : "")}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "text-align": "right", "color": "#15803d" })}">${ssrInterpolate(l.credit ? money(l.credit) : "")}</td><td style="${ssrRenderStyle({ "padding": "6px 8px", "text-align": "right", "font-weight": "600" })}">${ssrInterpolate(money(l.balance))}</td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(d).lines.length) {
          _push(`<tr><td colspan="6" style="${ssrRenderStyle({ "padding": "18px", "text-align": "center", "color": "#888" })}">No transactions in this period</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody><tfoot><tr style="${ssrRenderStyle({ "border-top": "2px solid #111", "font-weight": "700" })}"><td colspan="3" style="${ssrRenderStyle({ "padding": "8px" })}">Period totals</td><td style="${ssrRenderStyle({ "padding": "8px", "text-align": "right" })}">${ssrInterpolate(money(unref(d).totalDebit))}</td><td style="${ssrRenderStyle({ "padding": "8px", "text-align": "right" })}">${ssrInterpolate(money(unref(d).totalCredit))}</td><td></td></tr><tr style="${ssrRenderStyle({ "background": "#fef3c7", "font-weight": "800", "font-size": "13px" })}"><td colspan="5" style="${ssrRenderStyle({ "padding": "9px 8px" })}">Closing balance (amount due)</td><td style="${ssrRenderStyle({ "padding": "9px 8px", "text-align": "right" })}">\u09F3${ssrInterpolate(money(unref(d).closingBalance))}</td></tr></tfoot></table><p style="${ssrRenderStyle({ "font-size": "10px", "color": "#777", "margin-top": "18px" })}">This is a computer-generated statement. Please report any discrepancy within 7 days.</p></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/customers/[id]/statement.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=statement-XXz-H0WJ.mjs.map
