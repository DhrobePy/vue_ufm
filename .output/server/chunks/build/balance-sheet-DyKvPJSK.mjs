import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as _sfc_main$2 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$3 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, ref, computed, withAsyncContext, mergeProps, unref, withCtx, openBlock, createBlock, Fragment, renderList, createVNode, toDisplayString, createTextVNode, createCommentVNode, withDirectives, isRef, vModelText, vModelCheckbox, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './nuxt-link-rXgW20ax.mjs';
import '../nitro/nitro.mjs';
import '@opentelemetry/api';
import 'standardwebhooks';
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
import './server.mjs';
import 'vue-router';
import './hubs-DhfvsbwY.mjs';
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
import './useAppSettings-Cev_RXDm.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "balance-sheet",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
    const asOf = ref(today), showCompare = ref(false), compareDate = ref(today.slice(0, 4) + "-06-30");
    const compare = computed(() => showCompare.value ? compareDate.value : "");
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/balance-sheet",
      { query: computed(() => ({ as_of: asOf.value, compare: compare.value || void 0 })), watch: [asOf, showCompare, compareDate] },
      "$Dgnc9hRnN5"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const diff = computed(() => {
      var _a, _b, _c, _d;
      return Number((_b = (_a = data.value) == null ? void 0 : _a.assets.total) != null ? _b : 0) - Number((_d = (_c = data.value) == null ? void 0 : _c.liabilitiesEquity.total) != null ? _d : 0);
    });
    const cols = computed(() => [
      { key: "code", label: "Code" },
      { key: "name", label: "Account" },
      { key: "amount", label: `${asOf.value} \u09F3`, fmt: "money", sum: true },
      ...compare.value ? [{ key: "compare", label: `${compare.value} \u09F3`, fmt: "money", sum: true }] : []
    ]);
    const sheets = computed(() => {
      var _a, _b;
      return ((_b = (_a = data.value) == null ? void 0 : _a.sections) != null ? _b : []).map((s) => ({ name: s.label, cols: cols.value, rows: s.rows, totals: true }));
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HubTabs = _sfc_main$1;
      const _component_ReportFrame = _sfc_main$2;
      const _component_ReportTable = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="no-print">`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "statements" }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_ReportFrame, {
        title: "Balance Sheet",
        subtitle: "Assets, liabilities and equity from the general ledger",
        period: `as of ${unref(asOf)}${unref(compare) ? " \xB7 compared with " + unref(compare) : ""}`,
        filename: "balance-sheet",
        sheets: unref(sheets)
      }, {
        filters: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="glass-card p-4 flex flex-wrap items-center gap-2"${_scopeId}><label class="text-xs text-gray-500"${_scopeId}>As of</label><input${ssrRenderAttr("value", unref(asOf))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><label class="flex items-center gap-1.5 text-xs text-gray-400 ml-2"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(showCompare)) ? ssrLooseContain(unref(showCompare), null) : unref(showCompare)) ? " checked" : ""} type="checkbox"${_scopeId}> Compare with</label>`);
            if (unref(showCompare)) {
              _push2(`<input${ssrRenderAttr("value", unref(compareDate))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "glass-card p-4 flex flex-wrap items-center gap-2" }, [
                createVNode("label", { class: "text-xs text-gray-500" }, "As of"),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(asOf) ? asOf.value = $event : null,
                  type: "date",
                  class: "field-input text-xs py-1.5 w-36"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(asOf)]
                ]),
                createVNode("label", { class: "flex items-center gap-1.5 text-xs text-gray-400 ml-2" }, [
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(showCompare) ? showCompare.value = $event : null,
                    type: "checkbox"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelCheckbox, unref(showCompare)]
                  ]),
                  createTextVNode(" Compare with")
                ]),
                unref(showCompare) ? withDirectives((openBlock(), createBlock("input", {
                  key: 0,
                  "onUpdate:modelValue": ($event) => isRef(compareDate) ? compareDate.value = $event : null,
                  type: "date",
                  class: "field-input text-xs py-1.5 w-36"
                }, null, 8, ["onUpdate:modelValue"])), [
                  [vModelText, unref(compareDate)]
                ]) : createCommentVNode("", true)
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(data)) {
              _push2(`<!--[--><!--[-->`);
              ssrRenderList(unref(data).sections, (s) => {
                _push2(`<div${_scopeId}><h2 class="text-sm font-bold text-gray-200 mt-3 mb-1"${_scopeId}>${ssrInterpolate(s.label)}</h2>`);
                _push2(ssrRenderComponent(_component_ReportTable, {
                  cols: unref(cols),
                  rows: s.rows,
                  totals: s.rows.length > 0
                }, null, _parent2, _scopeId));
                _push2(`</div>`);
              });
              _push2(`<!--]--><div class="glass-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm"${_scopeId}><div${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>Total assets</p><p class="font-mono font-bold text-gray-100"${_scopeId}>\u09F3${ssrInterpolate(n0(unref(data).assets.total))}`);
              if (unref(data).compare) {
                _push2(`<span class="text-gray-500 text-xs"${_scopeId}> \xB7 \u09F3${ssrInterpolate(n0(unref(data).assets.compare))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</p></div><div${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>Liabilities + equity</p><p class="font-mono font-bold text-gray-100"${_scopeId}>\u09F3${ssrInterpolate(n0(unref(data).liabilitiesEquity.total))}`);
              if (unref(data).compare) {
                _push2(`<span class="text-gray-500 text-xs"${_scopeId}> \xB7 \u09F3${ssrInterpolate(n0(unref(data).liabilitiesEquity.compare))}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</p></div><div${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>Difference</p><p class="${ssrRenderClass([Math.abs(unref(diff)) < 1 ? "text-emerald-400" : "text-red-400", "font-mono font-bold"])}"${_scopeId}>\u09F3${ssrInterpolate(n0(unref(diff)))} ${ssrInterpolate(Math.abs(unref(diff)) < 1 ? "\u2014 balanced" : "\u2014 does not balance")}</p></div></div><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Loading\u2026")) : unref(data) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(data).sections, (s) => {
                  return openBlock(), createBlock("div", {
                    key: s.key
                  }, [
                    createVNode("h2", { class: "text-sm font-bold text-gray-200 mt-3 mb-1" }, toDisplayString(s.label), 1),
                    createVNode(_component_ReportTable, {
                      cols: unref(cols),
                      rows: s.rows,
                      totals: s.rows.length > 0
                    }, null, 8, ["cols", "rows", "totals"])
                  ]);
                }), 128)),
                createVNode("div", { class: "glass-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm" }, [
                  createVNode("div", null, [
                    createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, "Total assets"),
                    createVNode("p", { class: "font-mono font-bold text-gray-100" }, [
                      createTextVNode("\u09F3" + toDisplayString(n0(unref(data).assets.total)), 1),
                      unref(data).compare ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "text-gray-500 text-xs"
                      }, " \xB7 \u09F3" + toDisplayString(n0(unref(data).assets.compare)), 1)) : createCommentVNode("", true)
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, "Liabilities + equity"),
                    createVNode("p", { class: "font-mono font-bold text-gray-100" }, [
                      createTextVNode("\u09F3" + toDisplayString(n0(unref(data).liabilitiesEquity.total)), 1),
                      unref(data).compare ? (openBlock(), createBlock("span", {
                        key: 0,
                        class: "text-gray-500 text-xs"
                      }, " \xB7 \u09F3" + toDisplayString(n0(unref(data).liabilitiesEquity.compare)), 1)) : createCommentVNode("", true)
                    ])
                  ]),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, "Difference"),
                    createVNode("p", {
                      class: ["font-mono font-bold", Math.abs(unref(diff)) < 1 ? "text-emerald-400" : "text-red-400"]
                    }, "\u09F3" + toDisplayString(n0(unref(diff))) + " " + toDisplayString(Math.abs(unref(diff)) < 1 ? "\u2014 balanced" : "\u2014 does not balance"), 3)
                  ])
                ])
              ], 64)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/balance-sheet.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=balance-sheet-DyKvPJSK.mjs.map
