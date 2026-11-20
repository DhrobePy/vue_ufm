import { a as _sfc_main$1, _ as _sfc_main$2 } from './ReportTable-BVgbf3WP.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, Fragment, createVNode, renderList, createTextVNode, createCommentVNode, withDirectives, isRef, vModelText, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './useAppSettings-Cev_RXDm.mjs';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "daily-summary",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() + 6 * 36e5 - 864e5).toISOString().slice(0, 10);
    const from = ref(today), to = ref(today);
    const { data: d, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/daily-summary",
      { query: computed(() => ({ date_from: from.value, date_to: to.value })), watch: [from, to] },
      "$LwQdhV2uLv"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const period = computed(() => from.value === to.value ? from.value : `${from.value} to ${to.value}`);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const kpis = computed(() => {
      var _a;
      const t = (_a = d.value) == null ? void 0 : _a.totals;
      if (!t) return [];
      return [
        { l: "Collected", v: "\u09F3" + n0(t.collTotal), s: `${t.collCount} receipts \xB7 advance \u09F3${n0(t.collAdvance)}` },
        { l: "Dispatched", v: "\u09F3" + n0(t.dispatchValue), s: `${t.dispatchCount} orders` },
        { l: "Paid to suppliers", v: "\u09F3" + n0(t.paidTotal), s: `goods received \u09F3${n0(t.grnValue)}` },
        { l: "Expenses", v: "\u09F3" + n0(t.expTotal), s: "approved vouchers" },
        { l: "Net flow", v: "\u09F3" + n0(t.net), s: `in \u09F3${n0(t.inflow)} \xB7 out \u09F3${n0(t.outflow)}`, cls: t.net < 0 ? "text-red-400" : "text-emerald-400" },
        { l: "Receivables", v: "\u09F3" + n0(d.value.position.receivables), s: "outstanding on orders" },
        { l: "Bank balance", v: "\u09F3" + n0(d.value.position.banks.reduce((a, b) => a + b.balance, 0)), s: `${d.value.position.banks.length} accounts (ledger)` },
        { l: "Cash in hand", v: "\u09F3" + n0(d.value.position.petty.reduce((a, b) => a + b.balance, 0)), s: `${d.value.position.petty.length} petty-cash accounts` }
      ];
    });
    const T = (key, label, extra = {}) => ({ key, label, ...extra });
    const amt = (label = "Amount \u09F3") => T("amount", label, { fmt: "money", sum: true });
    const sections = computed(() => {
      const x = d.value;
      if (!x) return [];
      return [
        { title: "Bank accounts", cols: [T("account_name", "Account"), T("bank_name", "Bank"), T("balance", "Balance \u09F3", { fmt: "money", sum: true })], rows: x.position.banks, totals: true },
        { title: "Cash / petty-cash accounts", cols: [T("account_name", "Account"), T("balance", "Balance \u09F3", { fmt: "money", sum: true })], rows: x.position.petty, totals: true },
        { title: "Collections", cols: [T("date", "Date"), T("payment_number", "Receipt"), T("customer", "Customer"), T("type", "Type"), T("method", "Method"), T("account", "Paid into"), amt()], rows: x.collections, totals: true },
        { title: "Orders dispatched", cols: [T("date", "Shipped"), T("order_number", "Order #"), T("customer", "Customer"), T("truck", "Truck"), T("status", "Status"), amt("Order value \u09F3")], rows: x.dispatches, totals: true },
        { title: "Purchase orders placed", cols: [T("date", "Date"), T("po_number", "PO #"), T("supplier", "Supplier"), T("qty_kg", "Qty kg", { fmt: "qty", sum: true }), T("rate", "Rate \u09F3/kg", { fmt: "qty" }), amt("Value \u09F3")], rows: x.purchases, totals: true },
        { title: "Goods received", cols: [T("date", "Date"), T("grn_number", "GRN"), T("supplier", "Supplier"), T("qty_kg", "Qty kg", { fmt: "qty", sum: true }), T("rate", "Rate \u09F3/kg", { fmt: "qty" }), amt("Value \u09F3")], rows: x.grns, totals: true },
        { title: "Paid to suppliers", cols: [T("date", "Date"), T("payment_number", "Voucher"), T("supplier", "Supplier"), T("method", "Method"), amt()], rows: x.supplierPaid, totals: true },
        { title: "Expenses by category", cols: [T("category", "Category"), T("vouchers", "Vouchers", { fmt: "qty", sum: true }), amt()], rows: x.expenseByCategory, totals: true },
        { title: "Expense vouchers", cols: [T("date", "Date"), T("voucher_number", "Voucher"), T("category", "Category"), T("handled_by", "Handled by"), T("method", "Method"), amt()], rows: x.expenses, totals: true }
      ];
    });
    const sheets = computed(() => sections.value.map((s) => ({ name: s.title, cols: s.cols, rows: s.rows, totals: s.totals })));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReportFrame = _sfc_main$1;
      const _component_ReportTable = _sfc_main$2;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: "Daily Financial Summary",
        subtitle: "Cash position, collections, dispatches, purchases, payments and expenses for a day or period",
        period: unref(period),
        filename: `daily-summary_${unref(from)}_to_${unref(to)}`,
        sheets: unref(sheets)
      }, _attrs), {
        filters: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="glass-card p-4 flex flex-wrap items-center gap-2"${_scopeId}><button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200"${_scopeId}>Today</button><button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200"${_scopeId}>Yesterday</button><button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200"${_scopeId}>This month</button><input${ssrRenderAttr("value", unref(from))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><span class="text-xs text-gray-600"${_scopeId}>to</span><input${ssrRenderAttr("value", unref(to))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}></div>`);
          } else {
            return [
              createVNode("div", { class: "glass-card p-4 flex flex-wrap items-center gap-2" }, [
                createVNode("button", {
                  class: "px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200",
                  onClick: ($event) => from.value = to.value = unref(today)
                }, "Today", 8, ["onClick"]),
                createVNode("button", {
                  class: "px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200",
                  onClick: ($event) => from.value = to.value = unref(yesterday)
                }, "Yesterday", 8, ["onClick"]),
                createVNode("button", {
                  class: "px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200",
                  onClick: ($event) => {
                    from.value = unref(today).slice(0, 8) + "01";
                    to.value = unref(today);
                  }
                }, "This month", 8, ["onClick"]),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(from) ? from.value = $event : null,
                  type: "date",
                  class: "field-input text-xs py-1.5 w-36"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(from)]
                ]),
                createVNode("span", { class: "text-xs text-gray-600" }, "to"),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(to) ? to.value = $event : null,
                  type: "date",
                  class: "field-input text-xs py-1.5 w-36"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(to)]
                ])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(error)) {
              _push2(`<div class="glass-card p-6 text-center text-red-400 text-sm"${_scopeId}>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
            } else if (unref(d)) {
              _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(unref(kpis), (k) => {
                var _a;
                _push2(`<div class="glass-card p-3"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(k.l)}</p><p class="${ssrRenderClass([(_a = k.cls) != null ? _a : "text-gray-100", "text-lg font-bold font-mono"])}"${_scopeId}>${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600"${_scopeId}>${ssrInterpolate(k.s)}</p></div>`);
              });
              _push2(`<!--]--></div><!--[-->`);
              ssrRenderList(unref(sections), (s) => {
                _push2(`<section class="space-y-1"${_scopeId}><h2 class="text-sm font-bold text-gray-200 mt-2"${_scopeId}>${ssrInterpolate(s.title)} <span class="text-gray-600 font-normal"${_scopeId}>(${ssrInterpolate(s.rows.length)})</span></h2>`);
                _push2(ssrRenderComponent(_component_ReportTable, {
                  cols: s.cols,
                  rows: s.rows,
                  totals: s.totals
                }, null, _parent2, _scopeId));
                _push2(`</section>`);
              });
              _push2(`<!--]--><p class="no-print text-[11px] text-gray-600"${_scopeId}>Bank and petty-cash balances are computed from the general ledger as of now. Collections exclude reversed receipts; expenses count approved vouchers only. Net flow = collections \u2212 supplier payments \u2212 expenses.</p><!--]-->`);
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
                createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-4 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(kpis), (k) => {
                    var _a;
                    return openBlock(), createBlock("div", {
                      key: k.l,
                      class: "glass-card p-3"
                    }, [
                      createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, toDisplayString(k.l), 1),
                      createVNode("p", {
                        class: ["text-lg font-bold font-mono", (_a = k.cls) != null ? _a : "text-gray-100"]
                      }, toDisplayString(k.v), 3),
                      createVNode("p", { class: "text-[10px] text-gray-600" }, toDisplayString(k.s), 1)
                    ]);
                  }), 128))
                ]),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(sections), (s) => {
                  return openBlock(), createBlock("section", {
                    key: s.title,
                    class: "space-y-1"
                  }, [
                    createVNode("h2", { class: "text-sm font-bold text-gray-200 mt-2" }, [
                      createTextVNode(toDisplayString(s.title) + " ", 1),
                      createVNode("span", { class: "text-gray-600 font-normal" }, "(" + toDisplayString(s.rows.length) + ")", 1)
                    ]),
                    createVNode(_component_ReportTable, {
                      cols: s.cols,
                      rows: s.rows,
                      totals: s.totals
                    }, null, 8, ["cols", "rows", "totals"])
                  ]);
                }), 128)),
                createVNode("p", { class: "no-print text-[11px] text-gray-600" }, "Bank and petty-cash balances are computed from the general ledger as of now. Collections exclude reversed receipts; expenses count approved vouchers only. Net flow = collections \u2212 supplier payments \u2212 expenses.")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/daily-summary.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=daily-summary-Do--Wzfr.mjs.map
