import { _ as _sfc_main$1 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$2 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, ref, withAsyncContext, computed, watch, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, Fragment, createVNode, renderList, createTextVNode, createCommentVNode, withDirectives, isRef, vModelText, vModelSelect, vModelCheckbox, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useFetch, r as refreshNuxtData } from './fetch-DAhIlcha.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "OrderReportView",
  __ssrInlineRender: true,
  props: {
    mode: {}
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const url = { sales: "/api/credit-sales/reports/sales", dispatch: "/api/production/dispatch-report", product: "/api/credit-sales/reports/product-sales" }[props.mode];
    const META = {
      sales: { title: "Sales Report", subtitle: "Credit sales recognised when goods ship \u2014 shipped, on board and delivered orders" },
      dispatch: { title: "Dispatch Report", subtitle: "What left the factory, by date shipped \u2014 trucks, drivers, products" },
      product: { title: "Product Sales Report", subtitle: "Delivered orders only, by delivery date \u2014 a price change shows as a separate line" }
    };
    const meta = META[props.mode];
    const dhaka = (d = /* @__PURE__ */ new Date()) => new Date(d.getTime() + 6 * 36e5).toISOString().slice(0, 10);
    const t0 = dhaka(), monthStart = t0.slice(0, 8) + "01";
    const lastM = (() => {
      const d = /* @__PURE__ */ new Date(monthStart + "T00:00:00Z");
      d.setUTCMonth(d.getUTCMonth() - 1);
      const a = d.toISOString().slice(0, 10);
      const e = /* @__PURE__ */ new Date(monthStart + "T00:00:00Z");
      e.setUTCDate(0);
      return [a, e.toISOString().slice(0, 10)];
    })();
    const presets = [{ label: "Today", from: t0, to: t0 }, { label: "This month", from: monthStart, to: t0 }, { label: "Last month", from: lastM[0], to: lastM[1] }, { label: "This year", from: t0.slice(0, 4) + "-01-01", to: t0 }];
    const from = ref(monthStart), to = ref(t0), branchId = ref(""), product = ref("");
    const statuses = ref(["shipped", "goods_on_board", "delivered"]);
    const statusOpts = [{ v: "shipped", l: "Shipped" }, { v: "goods_on_board", l: "Goods on board" }, { v: "delivered", l: "Delivered" }];
    const setRange = (a, b) => {
      from.value = a;
      to.value = b;
    };
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      url,
      {
        query: computed(() => ({ date_from: from.value, date_to: to.value, branch_id: branchId.value || void 0, product: product.value || void 0, status: props.mode === "dispatch" ? statuses.value.join(",") : void 0 })),
        watch: [from, to, branchId, statuses],
        debounce: 0
      },
      "$XGxa8vzcVN"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    let tm;
    watch(product, () => {
      clearTimeout(tm);
      tm = setTimeout(() => refreshNuxtData(), 400);
    });
    const money = { fmt: "money", sum: true }, qty = { fmt: "qty", sum: true };
    const C = (key, label, extra = {}) => ({ key, label, ...extra });
    const valueCols = [C("orders", "Orders", { fmt: "qty" }), C("qty", "Bags / Units", qty), C("gross", "Gross \u09F3", money), C("discount", "Discount \u09F3", money), C("net", "Net \u09F3", money)];
    const prodCols = [C("product", "Product"), C("variant", "Variant"), C("grade", "Grade"), ...props.mode === "product" ? [C("price", "Unit price \u09F3", { fmt: "money" })] : [], ...valueCols];
    const lineCols = [
      C("d", "Date"),
      C("order_number", "Order #"),
      C("customer", "Customer"),
      C("branch", "Factory"),
      ...props.mode === "dispatch" ? [C("truck", "Truck #"), C("driver", "Driver")] : [],
      C("product", "Product"),
      C("variant", "Variant"),
      C("qty", "Qty", qty),
      C("price", "Unit price \u09F3", { fmt: "money" }),
      C("discount", "Discount \u09F3", money),
      C("total", "Line total \u09F3", money)
    ];
    const tabs = computed(() => {
      const d = data.value;
      if (!d) return [];
      const t = [{ key: "products", label: "By product", cols: prodCols, rows: d.products, totals: true }];
      if (props.mode !== "product") {
        t.push({ key: "customers", label: "By customer", cols: [C("customer", "Customer"), ...valueCols], rows: d.customers, totals: true });
        t.push({ key: "branches", label: "By factory", cols: [C("branch", "Factory"), ...valueCols], rows: d.branches, totals: true });
        t.push({ key: "daily", label: "By day", cols: [C("date", "Date"), ...valueCols], rows: d.daily, totals: true });
      }
      t.push({ key: "lines", label: "Detail lines", cols: lineCols, rows: d.rows, totals: true });
      return t;
    });
    const tab = ref(0);
    const tabIndex = computed(() => tab.value);
    const sheets = computed(() => tabs.value.map((t) => ({ name: t.label, cols: t.cols, rows: t.rows, totals: t.totals })));
    const n0 = (v) => Math.round(v).toLocaleString("en-US");
    const kpis = computed(() => {
      var _a;
      const s = (_a = data.value) == null ? void 0 : _a.summary;
      return s ? [
        { l: "Orders", v: n0(s.orders) },
        { l: "Customers", v: n0(s.customers) },
        { l: "Bags / units", v: n0(s.units) },
        { l: "Gross \u09F3", v: n0(s.gross) },
        { l: "Discount \u09F3", v: n0(s.discount) },
        { l: "Net \u09F3", v: n0(s.net) }
      ] : [];
    });
    const period = computed(() => `${from.value} to ${to.value}`);
    const filename = computed(() => `${props.mode}-report_${from.value}_to_${to.value}`);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReportFrame = _sfc_main$1;
      const _component_ReportTable = _sfc_main$2;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: unref(meta).title,
        subtitle: unref(meta).subtitle,
        period: unref(period),
        filename: unref(filename),
        sheets: unref(sheets),
        "active-sheet": unref(tabIndex)
      }, _attrs), {
        filters: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d;
          if (_push2) {
            _push2(`<div class="glass-card p-4 space-y-3"${_scopeId}><div class="flex flex-wrap items-center gap-2"${_scopeId}><!--[-->`);
            ssrRenderList(presets, (p) => {
              _push2(`<button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200"${_scopeId}>${ssrInterpolate(p.label)}</button>`);
            });
            _push2(`<!--]--><input${ssrRenderAttr("value", unref(from))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><span class="text-xs text-gray-600"${_scopeId}>to</span><input${ssrRenderAttr("value", unref(to))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><select class="field-input text-xs py-1.5 w-44"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(branchId)) ? ssrLooseContain(unref(branchId), "") : ssrLooseEqual(unref(branchId), "")) ? " selected" : ""}${_scopeId}>All factories</option><!--[-->`);
            ssrRenderList((_b = (_a = unref(data)) == null ? void 0 : _a.branch_options) != null ? _b : [], (b) => {
              _push2(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(branchId)) ? ssrLooseContain(unref(branchId), b.id) : ssrLooseEqual(unref(branchId), b.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(b.name)}</option>`);
            });
            _push2(`<!--]--></select><input${ssrRenderAttr("value", unref(product))} type="search" placeholder="Product\u2026" class="field-input text-xs py-1.5 w-36"${_scopeId}></div>`);
            if (__props.mode === "dispatch") {
              _push2(`<div class="flex flex-wrap gap-2 text-xs"${_scopeId}><!--[-->`);
              ssrRenderList(statusOpts, (s) => {
                _push2(`<label class="flex items-center gap-1.5 text-gray-400"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(statuses)) ? ssrLooseContain(unref(statuses), s.v) : unref(statuses)) ? " checked" : ""} type="checkbox"${ssrRenderAttr("value", s.v)}${_scopeId}> ${ssrInterpolate(s.l)}</label>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "glass-card p-4 space-y-3" }, [
                createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(presets, (p) => {
                    return createVNode("button", {
                      key: p.label,
                      class: "px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200",
                      onClick: ($event) => setRange(p.from, p.to)
                    }, toDisplayString(p.label), 9, ["onClick"]);
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
                    "onUpdate:modelValue": ($event) => isRef(branchId) ? branchId.value = $event : null,
                    class: "field-input text-xs py-1.5 w-44"
                  }, [
                    createVNode("option", { value: "" }, "All factories"),
                    (openBlock(true), createBlock(Fragment, null, renderList((_d = (_c = unref(data)) == null ? void 0 : _c.branch_options) != null ? _d : [], (b) => {
                      return openBlock(), createBlock("option", {
                        key: b.id,
                        value: b.id
                      }, toDisplayString(b.name), 9, ["value"]);
                    }), 128))
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(branchId)]
                  ]),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(product) ? product.value = $event : null,
                    type: "search",
                    placeholder: "Product\u2026",
                    class: "field-input text-xs py-1.5 w-36"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(product)]
                  ])
                ]),
                __props.mode === "dispatch" ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "flex flex-wrap gap-2 text-xs"
                }, [
                  (openBlock(), createBlock(Fragment, null, renderList(statusOpts, (s) => {
                    return createVNode("label", {
                      key: s.v,
                      class: "flex items-center gap-1.5 text-gray-400"
                    }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => isRef(statuses) ? statuses.value = $event : null,
                        type: "checkbox",
                        value: s.v
                      }, null, 8, ["onUpdate:modelValue", "value"]), [
                        [vModelCheckbox, unref(statuses)]
                      ]),
                      createTextVNode(" " + toDisplayString(s.l), 1)
                    ]);
                  }), 64))
                ])) : createCommentVNode("", true)
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
              _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-6 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(unref(kpis), (k) => {
                _push2(`<div class="glass-card p-3"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(k.l)}</p><p class="text-lg font-bold text-gray-100 font-mono"${_scopeId}>${ssrInterpolate(k.v)}</p></div>`);
              });
              _push2(`<!--]--></div><div class="no-print flex flex-wrap gap-1.5"${_scopeId}><!--[-->`);
              ssrRenderList(unref(tabs), (t, i) => {
                _push2(`<button class="${ssrRenderClass([unref(tab) === i ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300", "px-3 py-1.5 rounded-xl text-xs border transition-all"])}"${_scopeId}>${ssrInterpolate(t.label)} <span class="text-gray-600"${_scopeId}>(${ssrInterpolate(t.rows.length)})</span></button>`);
              });
              _push2(`<!--]--></div>`);
              if (unref(data).truncated) {
                _push2(`<p class="no-print text-xs text-amber-400"${_scopeId}>Showing the first 20,000 detail lines \u2014 narrow the dates for the full list. Totals above include every line.</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--[-->`);
              ssrRenderList(unref(tabs), (t, i) => {
                _push2(`<div class="${ssrRenderClass(i === unref(tab) ? "" : "hidden print:block")}"${_scopeId}><h2 class="print-only text-sm font-bold mt-3 mb-1"${_scopeId}>${ssrInterpolate(t.label)}</h2>`);
                _push2(ssrRenderComponent(_component_ReportTable, {
                  cols: t.cols,
                  rows: t.rows,
                  totals: t.totals
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
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
              }, "\u26A0 " + toDisplayString(unref(error).message), 1)) : unref(data) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-6 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(kpis), (k) => {
                    return openBlock(), createBlock("div", {
                      key: k.l,
                      class: "glass-card p-3"
                    }, [
                      createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, toDisplayString(k.l), 1),
                      createVNode("p", { class: "text-lg font-bold text-gray-100 font-mono" }, toDisplayString(k.v), 1)
                    ]);
                  }), 128))
                ]),
                createVNode("div", { class: "no-print flex flex-wrap gap-1.5" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(tabs), (t, i) => {
                    return openBlock(), createBlock("button", {
                      key: t.key,
                      class: ["px-3 py-1.5 rounded-xl text-xs border transition-all", unref(tab) === i ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300"],
                      onClick: ($event) => tab.value = i
                    }, [
                      createTextVNode(toDisplayString(t.label) + " ", 1),
                      createVNode("span", { class: "text-gray-600" }, "(" + toDisplayString(t.rows.length) + ")", 1)
                    ], 10, ["onClick"]);
                  }), 128))
                ]),
                unref(data).truncated ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "no-print text-xs text-amber-400"
                }, "Showing the first 20,000 detail lines \u2014 narrow the dates for the full list. Totals above include every line.")) : createCommentVNode("", true),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(tabs), (t, i) => {
                  return openBlock(), createBlock("div", {
                    key: t.key,
                    class: i === unref(tab) ? "" : "hidden print:block"
                  }, [
                    createVNode("h2", { class: "print-only text-sm font-bold mt-3 mb-1" }, toDisplayString(t.label), 1),
                    createVNode(_component_ReportTable, {
                      cols: t.cols,
                      rows: t.rows,
                      totals: t.totals
                    }, null, 8, ["cols", "rows", "totals"])
                  ], 2);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/OrderReportView.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=OrderReportView-aUnNmKCs.mjs.map
