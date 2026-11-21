import { _ as _sfc_main$1 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$2 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, Fragment, createVNode, renderList, createTextVNode, createCommentVNode, withDirectives, isRef, vModelText, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './useAppSettings-Cev_RXDm.mjs';
import '../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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
  __name: "analytics",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const dhaka = (ms = 0) => new Date(Date.now() + 6 * 36e5 + ms).toISOString().slice(0, 10);
    const t0 = dhaka();
    const presets = [{ l: "Today", from: t0, to: t0 }, { l: "Last 7 days", from: dhaka(-6 * 864e5), to: t0 }, { l: "Last 30 days", from: dhaka(-29 * 864e5), to: t0 }, { l: "Last 90 days", from: dhaka(-89 * 864e5), to: t0 }, { l: "This month", from: t0.slice(0, 8) + "01", to: t0 }, { l: "This year", from: t0.slice(0, 4) + "-01-01", to: t0 }];
    const from = ref(dhaka(-29 * 864e5)), to = ref(t0), scope = ref("open"), origin = ref(""), supplier = ref(""), delivery = ref("");
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/analytics",
      { query: computed(() => ({ date_from: from.value, date_to: to.value, scope: scope.value, origin: origin.value || void 0, supplier_id: supplier.value || void 0, delivery_status: delivery.value || void 0 })), watch: [from, to, scope, origin, supplier, delivery] },
      "$75s0gbM9z7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const kpiTiles = computed(() => {
      var _a;
      const k = (_a = data.value) == null ? void 0 : _a.kpis;
      if (!k) return [];
      return [
        { l: "Purchase orders", v: String(k.orders), s: `${k.suppliers} suppliers \xB7 ${k.completion_pct.toFixed(0)}% completed` },
        { l: "Order value", v: "\u09F3" + n0(k.order_value), s: `avg \u09F3${k.avg_price.toFixed(2)}/kg` },
        { l: "Ordered / received", v: `${n0(k.ordered_kg)} / ${n0(k.received_kg)} kg`, s: `${k.fulfillment_pct.toFixed(1)}% delivered` },
        { l: "Received value", v: "\u09F3" + n0(k.received_value), s: "priced as recorded on each GRN" },
        { l: "Paid to suppliers", v: "\u09F3" + n0(k.paid), s: `${k.payment_pct.toFixed(1)}% of received value` },
        { l: "Outstanding payable", v: "\u09F3" + n0(k.outstanding), s: "billed + adjustments \u2212 paid" }
      ];
    });
    const T = (key, label, extra = {}) => ({ key, label, ...extra });
    const kg = (k, l) => T(k, l, { fmt: "qty", sum: true }), mo = (k, l, sum = true) => T(k, l, { fmt: "money", sum });
    const sections = computed(() => {
      const x = data.value;
      if (!x) return [];
      return [
        { title: "Supplier performance (top 25 by value)", cols: [T("supplier", "Supplier"), T("orders", "POs", { fmt: "qty", sum: true }), mo("value", "Value \u09F3"), kg("ordered_kg", "Ordered kg"), kg("received_kg", "Received kg"), mo("outstanding", "Payable \u09F3"), mo("avg_price", "Avg \u09F3/kg", false), T("avg_delivery_days", "Avg days to deliver", { fmt: "qty" }), T("avg_variance_pct", "Avg weight variance %", { fmt: "qty" })], rows: x.suppliers, totals: true },
        { title: "Procurement by origin", cols: [T("origin", "Origin"), T("pos", "POs", { fmt: "qty", sum: true }), kg("ordered_kg", "Ordered kg"), kg("received_kg", "Received kg"), kg("pending_kg", "Pending kg"), mo("value", "Value \u09F3"), mo("paid", "Paid \u09F3"), mo("payable", "Payable \u09F3"), mo("avg_price", "Avg \u09F3/kg", false)], rows: x.origins, totals: true },
        { title: "Receipts by unloading point and origin (GRN date in range)", cols: [T("branch", "Unloading point"), T("origin", "Origin"), T("grns", "GRNs", { fmt: "qty", sum: true }), kg("expected_kg", "Expected kg"), kg("received_kg", "Received kg"), mo("value", "Value \u09F3")], rows: x.receipts, totals: true },
        { title: "Purchase orders \u2014 detail", cols: [T("po", "PO #"), T("date", "Date"), T("supplier", "Supplier"), T("origin", "Origin"), kg("ordered_kg", "Ordered kg"), mo("rate", "\u09F3/kg", false), mo("value", "Value \u09F3"), kg("received_kg", "Received kg"), kg("pending_kg", "Pending kg"), mo("paid", "Paid \u09F3"), mo("adjustments", "Adjustments \u09F3"), mo("payable", "Payable \u09F3"), T("delivery", "Delivery"), T("payment", "Payment")], rows: x.detail, totals: true }
      ];
    });
    const sheets = computed(() => sections.value.map((s) => ({ name: s.title.slice(0, 30), cols: s.cols, rows: s.rows, totals: s.totals })));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReportFrame = _sfc_main$1;
      const _component_ReportTable = _sfc_main$2;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: "Purchase Analytics",
        subtitle: "Orders, deliveries, payments, supplier performance and procurement by origin",
        period: `${unref(from)} to ${unref(to)} \xB7 ${unref(scope) === "open" ? "open orders" : "all orders"}`,
        filename: "purchase-analytics",
        sheets: unref(sheets)
      }, _attrs), {
        filters: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          if (_push2) {
            _push2(`<div class="glass-card p-4 space-y-3"${_scopeId}><div class="flex flex-wrap items-center gap-2"${_scopeId}><!--[-->`);
            ssrRenderList(presets, (p) => {
              _push2(`<button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200"${_scopeId}>${ssrInterpolate(p.l)}</button>`);
            });
            _push2(`<!--]--><input${ssrRenderAttr("value", unref(from))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><span class="text-xs text-gray-600"${_scopeId}>to</span><input${ssrRenderAttr("value", unref(to))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><select class="field-input text-xs py-1.5 w-44"${_scopeId}><option value="open"${ssrIncludeBooleanAttr(Array.isArray(unref(scope)) ? ssrLooseContain(unref(scope), "open") : ssrLooseEqual(unref(scope), "open")) ? " selected" : ""}${_scopeId}>Open orders only</option><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(scope)) ? ssrLooseContain(unref(scope), "all") : ssrLooseEqual(unref(scope), "all")) ? " selected" : ""}${_scopeId}>All orders</option></select></div><div class="flex flex-wrap items-center gap-2"${_scopeId}><select class="field-input text-xs py-1.5 w-40"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(origin)) ? ssrLooseContain(unref(origin), "") : ssrLooseEqual(unref(origin), "")) ? " selected" : ""}${_scopeId}>All origins</option><!--[-->`);
            ssrRenderList((_b = (_a = unref(data)) == null ? void 0 : _a.origins_list) != null ? _b : [], (o) => {
              _push2(`<option${ssrRenderAttr("value", o)}${ssrIncludeBooleanAttr(Array.isArray(unref(origin)) ? ssrLooseContain(unref(origin), o) : ssrLooseEqual(unref(origin), o)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(o)}</option>`);
            });
            _push2(`<!--]--></select><select class="field-input text-xs py-1.5 w-56"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(supplier)) ? ssrLooseContain(unref(supplier), "") : ssrLooseEqual(unref(supplier), "")) ? " selected" : ""}${_scopeId}>All suppliers</option><!--[-->`);
            ssrRenderList((_d = (_c = unref(data)) == null ? void 0 : _c.suppliers_list) != null ? _d : [], (s) => {
              _push2(`<option${ssrRenderAttr("value", s.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(supplier)) ? ssrLooseContain(unref(supplier), s.id) : ssrLooseEqual(unref(supplier), s.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(s.name)}</option>`);
            });
            _push2(`<!--]--></select><select class="field-input text-xs py-1.5 w-40"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(delivery)) ? ssrLooseContain(unref(delivery), "") : ssrLooseEqual(unref(delivery), "")) ? " selected" : ""}${_scopeId}>Any delivery status</option><!--[-->`);
            ssrRenderList(["pending", "partial", "completed", "over_received", "closed"], (d) => {
              _push2(`<option${ssrRenderAttr("value", d)}${ssrIncludeBooleanAttr(Array.isArray(unref(delivery)) ? ssrLooseContain(unref(delivery), d) : ssrLooseEqual(unref(delivery), d)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(d)}</option>`);
            });
            _push2(`<!--]--></select><span class="text-[11px] text-gray-600"${_scopeId}>Origin / supplier / delivery filters apply to the origin table and PO detail.</span></div></div>`);
          } else {
            return [
              createVNode("div", { class: "glass-card p-4 space-y-3" }, [
                createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(presets, (p) => {
                    return createVNode("button", {
                      key: p.l,
                      class: "px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200",
                      onClick: ($event) => {
                        from.value = p.from;
                        to.value = p.to;
                      }
                    }, toDisplayString(p.l), 9, ["onClick"]);
                  }), 64)),
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
                  ]),
                  withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => isRef(scope) ? scope.value = $event : null,
                    class: "field-input text-xs py-1.5 w-44"
                  }, [
                    createVNode("option", { value: "open" }, "Open orders only"),
                    createVNode("option", { value: "all" }, "All orders")
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(scope)]
                  ])
                ]),
                createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                  withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => isRef(origin) ? origin.value = $event : null,
                    class: "field-input text-xs py-1.5 w-40"
                  }, [
                    createVNode("option", { value: "" }, "All origins"),
                    (openBlock(true), createBlock(Fragment, null, renderList((_f = (_e = unref(data)) == null ? void 0 : _e.origins_list) != null ? _f : [], (o) => {
                      return openBlock(), createBlock("option", {
                        key: o,
                        value: o
                      }, toDisplayString(o), 9, ["value"]);
                    }), 128))
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(origin)]
                  ]),
                  withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => isRef(supplier) ? supplier.value = $event : null,
                    class: "field-input text-xs py-1.5 w-56"
                  }, [
                    createVNode("option", { value: "" }, "All suppliers"),
                    (openBlock(true), createBlock(Fragment, null, renderList((_h = (_g = unref(data)) == null ? void 0 : _g.suppliers_list) != null ? _h : [], (s) => {
                      return openBlock(), createBlock("option", {
                        key: s.id,
                        value: s.id
                      }, toDisplayString(s.name), 9, ["value"]);
                    }), 128))
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(supplier)]
                  ]),
                  withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => isRef(delivery) ? delivery.value = $event : null,
                    class: "field-input text-xs py-1.5 w-40"
                  }, [
                    createVNode("option", { value: "" }, "Any delivery status"),
                    (openBlock(), createBlock(Fragment, null, renderList(["pending", "partial", "completed", "over_received", "closed"], (d) => {
                      return createVNode("option", {
                        key: d,
                        value: d
                      }, toDisplayString(d), 9, ["value"]);
                    }), 64))
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(delivery)]
                  ]),
                  createVNode("span", { class: "text-[11px] text-gray-600" }, "Origin / supplier / delivery filters apply to the origin table and PO detail.")
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
            } else if (unref(data)) {
              _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(unref(kpiTiles), (k) => {
                _push2(`<div class="glass-card p-3"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(k.l)}</p><p class="text-lg font-bold font-mono text-gray-100"${_scopeId}>${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600"${_scopeId}>${ssrInterpolate(k.s)}</p></div>`);
              });
              _push2(`<!--]--></div><!--[-->`);
              ssrRenderList(unref(sections), (s) => {
                _push2(`<section class="space-y-1"${_scopeId}><h2 class="text-sm font-bold text-gray-200 mt-3"${_scopeId}>${ssrInterpolate(s.title)} <span class="text-gray-600 font-normal"${_scopeId}>(${ssrInterpolate(s.rows.length)})</span></h2>`);
                _push2(ssrRenderComponent(_component_ReportTable, {
                  cols: s.cols,
                  rows: s.rows,
                  totals: s.totals
                }, null, _parent2, _scopeId));
                _push2(`</section>`);
              });
              _push2(`<!--]--><p class="no-print text-[11px] text-gray-600"${_scopeId}>Payable = what the supplier billed (expected quantity \xD7 PO price) + posted adjustments \u2212 paid. Legacy&#39;s AI commentary and forecasts are not carried over.</p><!--]-->`);
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
              }, "\u26A0 " + toDisplayString(unref(error).message), 1)) : unref(data) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-4 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(kpiTiles), (k) => {
                    return openBlock(), createBlock("div", {
                      key: k.l,
                      class: "glass-card p-3"
                    }, [
                      createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, toDisplayString(k.l), 1),
                      createVNode("p", { class: "text-lg font-bold font-mono text-gray-100" }, toDisplayString(k.v), 1),
                      createVNode("p", { class: "text-[10px] text-gray-600" }, toDisplayString(k.s), 1)
                    ]);
                  }), 128))
                ]),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(sections), (s) => {
                  return openBlock(), createBlock("section", {
                    key: s.title,
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
                  ]);
                }), 128)),
                createVNode("p", { class: "no-print text-[11px] text-gray-600" }, "Payable = what the supplier billed (expected quantity \xD7 PO price) + posted adjustments \u2212 paid. Legacy's AI commentary and forecasts are not carried over.")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/analytics.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=analytics-Laqv2Cv_.mjs.map
