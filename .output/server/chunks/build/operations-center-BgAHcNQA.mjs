import { _ as _sfc_main$1 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$2 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, Fragment, createVNode, renderList, createTextVNode, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './useAppSettings-Cev_RXDm.mjs';
import '../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "operations-center",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: d, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/operations-center",
      "$mwpqv2Ia6C"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const kpis = computed(() => {
      var _a;
      const k = (_a = d.value) == null ? void 0 : _a.kpis;
      if (!k) return [];
      return [
        { id: "orders", l: "New orders today", v: String(k.newOrders.n), s: `\u09F3${n0(k.newOrders.v)}`, side: "in" },
        { id: "shipments", l: "Due to ship today", v: String(k.shipments.n), s: `\u09F3${n0(k.shipments.v)}`, side: "in" },
        { id: "products", l: "Products on open orders", v: String(k.products.n), s: `${n0(k.products.qty)} bags/units`, side: "in" },
        { id: "receipts", l: "Received today", v: "\u09F3" + n0(k.paymentsIn.v), s: `${k.paymentsIn.n} receipts`, side: "in" },
        { id: "receivables", l: "Receivables", v: "\u09F3" + n0(k.receivables.v), s: `${k.receivables.n}+ customers owe`, side: "in" },
        { id: "payables", l: "Supplier payables", v: "\u09F3" + n0(k.payables.v), s: `${k.payables.n} POs`, side: "out" },
        { id: "advances", l: "Supplier advances", v: "\u09F3" + n0(k.advances.v), s: `${k.advances.n} POs overpaid`, side: "out" },
        { id: "supplierpaid", l: "Paid to suppliers today", v: "\u09F3" + n0(k.supplierPaid.v), s: `${k.supplierPaid.n} payments`, side: "out" },
        { id: "expenses", l: "Expenses today", v: "\u09F3" + n0(k.expenses.v), s: `${k.expenses.n} vouchers`, side: "out" }
      ];
    });
    const T = (key, label, extra = {}) => ({ key, label, ...extra });
    const money = (k, l, sum = true) => T(k, l, { fmt: "money", sum });
    const sections = computed(() => {
      const x = d.value;
      if (!x) return [];
      return [
        { id: "orders", title: "New credit orders today", cols: [T("order_number", "Order #"), T("customer", "Customer"), T("status", "Status"), T("priority", "Priority"), money("amount", "Amount \u09F3"), money("advance", "Advance \u09F3"), money("due", "Due \u09F3")], rows: x.ordersToday, totals: true },
        { id: "shipments", title: "Scheduled to ship today", cols: [T("order_number", "Order #"), T("customer", "Customer"), T("status", "Status"), T("priority", "Priority"), money("amount", "Amount \u09F3")], rows: x.shipments, totals: true },
        { id: "products", title: "Products under open orders", cols: [T("product", "Product"), T("grade", "Grade"), T("variant", "Variant"), T("orders", "Orders", { fmt: "qty", sum: true }), T("ordered_qty", "Ordered", { fmt: "qty", sum: true }), T("stock", "In stock", { fmt: "qty" }), money("ordered_value", "Value \u09F3")], rows: x.products, totals: true },
        { id: "receipts", title: "Payments received today", cols: [T("ref", "Receipt"), T("customer", "Customer"), T("method", "Method"), T("type", "Type"), T("paid_into", "Paid into"), money("amount", "Amount \u09F3")], rows: x.paymentsToday, totals: true },
        { id: "receivables", title: "Outstanding receivables (top 100)", cols: [T("customer", "Customer"), T("phone", "Phone"), money("credit_limit", "Credit limit \u09F3", false), money("balance", "Balance \u09F3")], rows: x.receivables, totals: true },
        { id: "payables", title: "Supplier payables \u2014 outstanding", cols: [T("po", "PO #"), T("date", "Date"), T("supplier", "Supplier"), T("delivery", "Delivery"), money("billed", "Billed \u09F3"), money("paid", "Paid \u09F3"), money("due", "Due \u09F3")], rows: x.suppPayables, totals: true },
        { id: "advances", title: "Supplier advances \u2014 paid ahead of receipt", cols: [T("po", "PO #"), T("date", "Date"), T("supplier", "Supplier"), T("delivery", "Delivery"), money("billed", "Billed \u09F3"), money("paid", "Paid \u09F3"), money("advance", "Advance \u09F3")], rows: x.suppAdvances, totals: true },
        { id: "supplierpaid", title: "Supplier payments today", cols: [T("ref", "Voucher"), T("supplier", "Supplier"), T("po", "PO #"), T("method", "Method"), T("type", "Type"), money("amount", "Amount \u09F3")], rows: x.suppPaidToday, totals: true },
        { id: "expenses", title: "Expenses today (approved)", cols: [T("ref", "Voucher"), T("category", "Category"), T("subcategory", "Subcategory"), T("method", "Method"), T("remarks", "Remarks"), money("amount", "Amount \u09F3")], rows: x.expensesToday, totals: true }
      ];
    });
    const sheets = computed(() => sections.value.map((s) => ({ name: s.title.slice(0, 30), cols: s.cols, rows: s.rows, totals: s.totals })));
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_ReportFrame = _sfc_main$1;
      const _component_ReportTable = _sfc_main$2;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: "Operations Center",
        subtitle: "Today's income and expense picture \u2014 orders, shipments, receipts, receivables, supplier payables and expenses",
        period: (_b = (_a = unref(d)) == null ? void 0 : _a.today) != null ? _b : "",
        filename: "operations-center",
        sheets: unref(sheets)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(error)) {
              _push2(`<div class="glass-card p-6 text-center text-red-400 text-sm"${_scopeId}>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
            } else if (unref(d)) {
              _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-5 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(unref(kpis), (k) => {
                _push2(`<a${ssrRenderAttr("href", `#${k.id}`)} class="${ssrRenderClass([k.side === "out" ? "border-l-2 border-l-red-500/40" : "border-l-2 border-l-emerald-500/40", "glass-card p-3 block hover:border-gold-500/30"])}"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(k.l)}</p><p class="text-lg font-bold font-mono text-gray-100"${_scopeId}>${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600"${_scopeId}>${ssrInterpolate(k.s)}</p></a>`);
              });
              _push2(`<!--]--></div><p class="no-print text-[11px] text-gray-600"${_scopeId}>Orders are changed on the order pages (so every approval and hold check still applies).</p><!--[-->`);
              ssrRenderList(unref(sections), (s) => {
                _push2(`<section${ssrRenderAttr("id", s.id)} class="space-y-1"${_scopeId}><h2 class="text-sm font-bold text-gray-200 mt-3"${_scopeId}>${ssrInterpolate(s.title)} <span class="text-gray-600 font-normal"${_scopeId}>(${ssrInterpolate(s.rows.length)})</span></h2>`);
                _push2(ssrRenderComponent(_component_ReportTable, {
                  cols: s.cols,
                  rows: s.rows,
                  totals: s.totals
                }, null, _parent2, _scopeId));
                _push2(`</section>`);
              });
              _push2(`<!--]--><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Loading\u2026")) : unref(error) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "glass-card p-6 text-center text-red-400 text-sm"
              }, "\u26A0 " + toDisplayString(unref(error).message), 1)) : unref(d) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-5 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(kpis), (k) => {
                    return openBlock(), createBlock("a", {
                      key: k.id,
                      href: `#${k.id}`,
                      class: ["glass-card p-3 block hover:border-gold-500/30", k.side === "out" ? "border-l-2 border-l-red-500/40" : "border-l-2 border-l-emerald-500/40"]
                    }, [
                      createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, toDisplayString(k.l), 1),
                      createVNode("p", { class: "text-lg font-bold font-mono text-gray-100" }, toDisplayString(k.v), 1),
                      createVNode("p", { class: "text-[10px] text-gray-600" }, toDisplayString(k.s), 1)
                    ], 10, ["href"]);
                  }), 128))
                ]),
                createVNode("p", { class: "no-print text-[11px] text-gray-600" }, "Orders are changed on the order pages (so every approval and hold check still applies)."),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(sections), (s) => {
                  return openBlock(), createBlock("section", {
                    id: s.id,
                    key: s.id,
                    class: "space-y-1"
                  }, [
                    createVNode("h2", { class: "text-sm font-bold text-gray-200 mt-3" }, [
                      createTextVNode(toDisplayString(s.title) + " ", 1),
                      createVNode("span", { class: "text-gray-600 font-normal" }, "(" + toDisplayString(s.rows.length) + ")", 1)
                    ]),
                    createVNode(_component_ReportTable, {
                      cols: s.cols,
                      rows: s.rows,
                      totals: s.totals
                    }, null, 8, ["cols", "rows", "totals"])
                  ], 8, ["id"]);
                }), 128))
              ], 64)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/operations-center.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=operations-center-BgAHcNQA.mjs.map
