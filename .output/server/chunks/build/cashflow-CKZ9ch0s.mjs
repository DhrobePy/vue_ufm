import { _ as _sfc_main$1 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$2 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, Fragment, createVNode, renderList, createTextVNode, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
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
  __name: "cashflow",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: d, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/cashflow",
      "$b4WydGRkWv"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const trendPct = (a, b) => b ? `${a >= b ? "\u25B2" : "\u25BC"} ${Math.abs((a - b) / b * 100).toFixed(0)}% vs last month` : "no last-month figure";
    const max = computed(() => {
      var _a, _b;
      return Math.max(1, ...((_b = (_a = d.value) == null ? void 0 : _a.daily) != null ? _b : []).flatMap((x) => [x.inflow, x.outflow]));
    });
    const pct = (v) => Math.max(v > 0 ? 3 : 0, v / max.value * 100);
    const kpis = computed(() => {
      const x = d.value;
      if (!x) return [];
      return [
        { l: "Money in \u2014 this month", v: "\u09F3" + n0(x.inflow.month), s: `${x.inflow.count} receipts \xB7 today \u09F3${n0(x.inflow.today)} \xB7 ${trendPct(x.inflow.month, x.inflow.prev)}`, cls: "text-emerald-400" },
        { l: "Paid to suppliers", v: "\u09F3" + n0(x.supplier.month), s: `today \u09F3${n0(x.supplier.today)} \xB7 ${trendPct(x.supplier.month, x.supplier.prev)}` },
        { l: "Expenses (approved)", v: "\u09F3" + n0(x.expense.month), s: `today \u09F3${n0(x.expense.today)} \xB7 ${trendPct(x.expense.month, x.expense.prev)}` },
        { l: "Net cash flow", v: "\u09F3" + n0(x.net.month), s: `last month \u09F3${n0(x.net.prev)}`, cls: x.net.month < 0 ? "text-red-400" : "text-emerald-400" },
        { l: "Receivables", v: "\u09F3" + n0(x.receivables), s: "owed by credit customers" },
        { l: "Supplier payables", v: "\u09F3" + n0(x.payables), s: `${x.openPo.n} open POs worth \u09F3${n0(x.openPo.v)}` },
        { l: "Sales this month", v: "\u09F3" + n0(x.sales.month), s: `${trendPct(x.sales.month, x.sales.prev)} \xB7 ${x.pendingSales.n} orders in progress (\u09F3${n0(x.pendingSales.v)})` },
        { l: "Raw material received", v: n0(x.rm.month_kg) + " kg", s: `today ${n0(x.rm.today_kg)} kg \xB7 ${trendPct(x.rm.month_kg, x.rm.prev_kg)}` }
      ];
    });
    const T = (key, label, extra = {}) => ({ key, label, ...extra });
    const sections = computed(() => {
      const x = d.value;
      if (!x) return [];
      return [
        { title: "Six-month trend", cols: [T("month", "Month"), T("sales", "Sales \u09F3", { fmt: "money", sum: true }), T("inflow", "Money in \u09F3", { fmt: "money", sum: true }), T("outflow", "Money out \u09F3", { fmt: "money", sum: true }), T("rm_kg", "Raw material kg", { fmt: "money", sum: true })], rows: x.trend, totals: true },
        { title: "Latest receipts", cols: [T("date", "Date"), T("ref", "Receipt"), T("party", "Customer"), T("method", "Method"), T("amount", "Amount \u09F3", { fmt: "money", sum: true })], rows: x.recentIn, totals: false },
        { title: "Latest supplier payments", cols: [T("date", "Date"), T("ref", "Voucher"), T("party", "Supplier"), T("method", "Method"), T("amount", "Amount \u09F3", { fmt: "money", sum: true })], rows: x.recentOut, totals: false },
        { title: "Latest goods received", cols: [T("date", "Date"), T("ref", "GRN"), T("party", "Supplier"), T("qty_kg", "Kg", { fmt: "money", sum: true }), T("amount", "Value \u09F3", { fmt: "money", sum: true })], rows: x.recentGrn, totals: false }
      ];
    });
    const sheets = computed(() => {
      var _a, _b;
      return [
        { name: "Summary", cols: [T("l", "Measure"), T("v", "Value"), T("s", "Detail")], rows: kpis.value, totals: false },
        { name: "Daily flow", cols: [T("date", "Date"), T("inflow", "In \u09F3", { fmt: "money", sum: true }), T("outflow", "Out \u09F3", { fmt: "money", sum: true }), T("net", "Net \u09F3", { fmt: "money", sum: true })], rows: (_b = (_a = d.value) == null ? void 0 : _a.daily) != null ? _b : [], totals: true },
        ...sections.value.map((s) => ({ name: s.title, cols: s.cols, rows: s.rows, totals: s.totals }))
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_ReportFrame = _sfc_main$1;
      const _component_ReportTable = _sfc_main$2;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: "Cashflow Dashboard",
        subtitle: "Money in, money out, receivables, payables and sales \u2014 this month against last month",
        period: (_b = (_a = unref(d)) == null ? void 0 : _a.month) != null ? _b : "",
        filename: "cashflow",
        sheets: unref(sheets)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(error)) {
              _push2(`<div class="glass-card p-6 text-center text-red-400 text-sm"${_scopeId}>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
            } else if (unref(d)) {
              _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(unref(kpis), (k) => {
                var _a2;
                _push2(`<div class="glass-card p-3"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(k.l)}</p><p class="${ssrRenderClass([(_a2 = k.cls) != null ? _a2 : "text-gray-100", "text-lg font-bold font-mono"])}"${_scopeId}>${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600"${_scopeId}>${ssrInterpolate(k.s)}</p></div>`);
              });
              _push2(`<!--]--></div><div class="glass-card p-4"${_scopeId}><h2 class="text-sm font-bold text-gray-200 mb-3"${_scopeId}>Daily flow \u2014 last 30 days <span class="text-gray-600 font-normal"${_scopeId}>(green = in, red = out)</span></h2><div class="flex items-end gap-1 h-36"${_scopeId}><!--[-->`);
              ssrRenderList(unref(d).daily, (x) => {
                _push2(`<div class="flex-1 flex items-end gap-px group relative"${ssrRenderAttr("title", `${x.date}: in \u09F3${n0(x.inflow)} \xB7 out \u09F3${n0(x.outflow)}`)}${_scopeId}><div class="flex-1 rounded-t bg-emerald-500/70" style="${ssrRenderStyle(`height:${pct(x.inflow)}%`)}"${_scopeId}></div><div class="flex-1 rounded-t bg-red-500/70" style="${ssrRenderStyle(`height:${pct(x.outflow)}%`)}"${_scopeId}></div></div>`);
              });
              _push2(`<!--]--></div><div class="flex justify-between text-[10px] text-gray-600 mt-1"${_scopeId}><span${_scopeId}>${ssrInterpolate(unref(d).daily[0].date)}</span><span${_scopeId}>${ssrInterpolate(unref(d).daily[29].date)}</span></div></div><!--[-->`);
              ssrRenderList(unref(sections), (s) => {
                _push2(`<section class="space-y-1"${_scopeId}><h2 class="text-sm font-bold text-gray-200 mt-2"${_scopeId}>${ssrInterpolate(s.title)}</h2>`);
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
                createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-4 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(kpis), (k) => {
                    var _a2;
                    return openBlock(), createBlock("div", {
                      key: k.l,
                      class: "glass-card p-3"
                    }, [
                      createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, toDisplayString(k.l), 1),
                      createVNode("p", {
                        class: ["text-lg font-bold font-mono", (_a2 = k.cls) != null ? _a2 : "text-gray-100"]
                      }, toDisplayString(k.v), 3),
                      createVNode("p", { class: "text-[10px] text-gray-600" }, toDisplayString(k.s), 1)
                    ]);
                  }), 128))
                ]),
                createVNode("div", { class: "glass-card p-4" }, [
                  createVNode("h2", { class: "text-sm font-bold text-gray-200 mb-3" }, [
                    createTextVNode("Daily flow \u2014 last 30 days "),
                    createVNode("span", { class: "text-gray-600 font-normal" }, "(green = in, red = out)")
                  ]),
                  createVNode("div", { class: "flex items-end gap-1 h-36" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(d).daily, (x) => {
                      return openBlock(), createBlock("div", {
                        key: x.date,
                        class: "flex-1 flex items-end gap-px group relative",
                        title: `${x.date}: in \u09F3${n0(x.inflow)} \xB7 out \u09F3${n0(x.outflow)}`
                      }, [
                        createVNode("div", {
                          class: "flex-1 rounded-t bg-emerald-500/70",
                          style: `height:${pct(x.inflow)}%`
                        }, null, 4),
                        createVNode("div", {
                          class: "flex-1 rounded-t bg-red-500/70",
                          style: `height:${pct(x.outflow)}%`
                        }, null, 4)
                      ], 8, ["title"]);
                    }), 128))
                  ]),
                  createVNode("div", { class: "flex justify-between text-[10px] text-gray-600 mt-1" }, [
                    createVNode("span", null, toDisplayString(unref(d).daily[0].date), 1),
                    createVNode("span", null, toDisplayString(unref(d).daily[29].date), 1)
                  ])
                ]),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(sections), (s) => {
                  return openBlock(), createBlock("section", {
                    key: s.title,
                    class: "space-y-1"
                  }, [
                    createVNode("h2", { class: "text-sm font-bold text-gray-200 mt-2" }, toDisplayString(s.title), 1),
                    createVNode(_component_ReportTable, {
                      cols: s.cols,
                      rows: s.rows,
                      totals: s.totals
                    }, null, 8, ["cols", "rows", "totals"])
                  ]);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/cashflow.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=cashflow-CKZ9ch0s.mjs.map
