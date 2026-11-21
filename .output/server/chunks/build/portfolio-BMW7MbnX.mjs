import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as _sfc_main$2 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$3 } from './ReportTable-B52hYz1U.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { _ as _sfc_main$4 } from './CrmLabel-C2h7E70V.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, openBlock, createBlock, Fragment, createVNode, renderList, createCommentVNode, withDirectives, isRef, vModelSelect, vModelText, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-DhfvsbwY.mjs';
import './server.mjs';
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
import 'vue-router';
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
import './useAppSettings-Cev_RXDm.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "portfolio",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
    const labelList = ["Risky", "Slipping", "Dormant", "Growing", "Loyal", "Steady", "Never bought"];
    const label = ref(""), segment = ref(""), district = ref(""), search = ref("");
    const { data: d, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/portfolio",
      { query: computed(() => ({ label: label.value || void 0, segment: segment.value || void 0, district: district.value || void 0, search: search.value || void 0 })), watch: [label, segment, district, search] },
      "$j1D9a2Ibb3"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const crore = (v) => `\u09F3${(v / 1e7).toFixed(2)} crore`;
    const tiles = computed(() => {
      var _a;
      const s = (_a = d.value) == null ? void 0 : _a.summary;
      if (!s) return [];
      return [
        { l: "Buying customers (12 mo)", v: String(s.buyers), s: `${s.customers} active in total \xB7 ${crore(s.value_12m)} sales` },
        { l: "Concentration", v: `${s.concentration.top10.toFixed(0)}% in top 10`, s: `top 1 ${s.concentration.top1.toFixed(1)}% \xB7 top 5 ${s.concentration.top5.toFixed(0)}% \xB7 top 20 ${s.concentration.top20.toFixed(0)}%` },
        { l: "Owed to us", v: crore(s.credit.owed), s: `${s.credit.owing_count} customers owe` },
        { l: "Over credit limit", v: String(s.credit.over_limit), s: `${crore(s.credit.over_limit_amount)} above limits (real limits only)` }
      ];
    });
    const T = (key, label2, extra = {}) => ({ key, label: label2, ...extra });
    const rollCols = (first) => [T("key", first), T("customers", "Customers", { fmt: "qty", sum: true }), T("buyers", "Buying", { fmt: "qty", sum: true }), T("value_12m", "12-mo sales \u09F3", { fmt: "money", sum: true }), T("share", "Share %", { fmt: "qty" }), T("avg_pay_days", "Avg days to pay", { fmt: "qty" }), T("owing", "Owed \u09F3", { fmt: "money", sum: true }), T("over_limit", "Over limit", { fmt: "qty", sum: true })];
    const sections = computed(() => {
      var _a;
      const s = (_a = d.value) == null ? void 0 : _a.summary;
      if (!s) return [];
      return [
        { title: "By business type", cols: rollCols("Business type"), rows: s.segments, totals: true },
        { title: "By district", cols: rollCols("District"), rows: s.districts, totals: true },
        { title: "By branch", cols: rollCols("Branch"), rows: s.branches, totals: true },
        { title: "By product (12 months)", cols: [T("product", "Product"), T("customers", "Customers", { fmt: "qty" }), T("qty", "Bags / units", { fmt: "qty", sum: true }), T("value", "Sales \u09F3", { fmt: "money", sum: true }), T("share", "Share %", { fmt: "qty" })], rows: s.products, totals: true }
      ];
    });
    const sheets = computed(() => {
      var _a, _b;
      return [
        ...sections.value.map((s) => ({ name: s.title.slice(0, 30), cols: s.cols, rows: s.rows, totals: s.totals })),
        { name: "Customers", cols: [T("name", "Customer"), T("label", "Health"), T("segment", "Type"), T("district", "District"), T("branch", "Branch"), T("value_12m", "12-mo \u09F3", { fmt: "money", sum: true }), T("balance", "Balance \u09F3", { fmt: "money", sum: true }), T("credit_limit", "Limit \u09F3", { fmt: "money" }), T("days_since_last", "Days since order", { fmt: "qty" }), T("pay_days", "Days to pay", { fmt: "qty" })], rows: (_b = (_a = d.value) == null ? void 0 : _a.customers) != null ? _b : [], totals: false }
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HubTabs = _sfc_main$1;
      const _component_ReportFrame = _sfc_main$2;
      const _component_ReportTable = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_1;
      const _component_CrmLabel = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      _push(ssrRenderComponent(_component_ReportFrame, {
        title: "Customer Portfolio Assessment",
        subtitle: "Who your customers are, how healthy each relationship is, and where to act",
        period: unref(today),
        filename: "customer-portfolio",
        sheets: unref(sheets)
      }, {
        filters: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          if (_push2) {
            _push2(`<div class="glass-card p-4 flex flex-wrap items-center gap-2"${_scopeId}><!--[-->`);
            ssrRenderList(labelList, (l) => {
              var _a2, _b2;
              _push2(`<button class="${ssrRenderClass([unref(label) === l ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300", "px-3 py-1.5 rounded-xl text-xs border transition-all"])}"${_scopeId}>${ssrInterpolate(l)} <span class="text-gray-600"${_scopeId}>${ssrInterpolate((_b2 = (_a2 = unref(d)) == null ? void 0 : _a2.summary.labels[l]) != null ? _b2 : 0)}</span></button>`);
            });
            _push2(`<!--]--><select class="field-input text-xs py-1.5 w-44"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(segment)) ? ssrLooseContain(unref(segment), "") : ssrLooseEqual(unref(segment), "")) ? " selected" : ""}${_scopeId}>All business types</option><!--[-->`);
            ssrRenderList((_b = (_a = unref(d)) == null ? void 0 : _a.summary.segments) != null ? _b : [], (s) => {
              _push2(`<option${ssrRenderAttr("value", s.key)}${ssrIncludeBooleanAttr(Array.isArray(unref(segment)) ? ssrLooseContain(unref(segment), s.key) : ssrLooseEqual(unref(segment), s.key)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(s.key)}</option>`);
            });
            _push2(`<!--]--></select><select class="field-input text-xs py-1.5 w-40"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(district)) ? ssrLooseContain(unref(district), "") : ssrLooseEqual(unref(district), "")) ? " selected" : ""}${_scopeId}>All districts</option><!--[-->`);
            ssrRenderList((_d = (_c = unref(d)) == null ? void 0 : _c.summary.districts) != null ? _d : [], (s) => {
              _push2(`<option${ssrRenderAttr("value", s.key)}${ssrIncludeBooleanAttr(Array.isArray(unref(district)) ? ssrLooseContain(unref(district), s.key) : ssrLooseEqual(unref(district), s.key)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(s.key)}</option>`);
            });
            _push2(`<!--]--></select><input${ssrRenderAttr("value", unref(search))} type="search" placeholder="Name, area\u2026" class="field-input text-xs py-1.5 w-44"${_scopeId}></div>`);
          } else {
            return [
              createVNode("div", { class: "glass-card p-4 flex flex-wrap items-center gap-2" }, [
                (openBlock(), createBlock(Fragment, null, renderList(labelList, (l) => {
                  var _a2, _b2;
                  return createVNode("button", {
                    key: l,
                    class: ["px-3 py-1.5 rounded-xl text-xs border transition-all", unref(label) === l ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300"],
                    onClick: ($event) => label.value = unref(label) === l ? "" : l
                  }, [
                    createTextVNode(toDisplayString(l) + " ", 1),
                    createVNode("span", { class: "text-gray-600" }, toDisplayString((_b2 = (_a2 = unref(d)) == null ? void 0 : _a2.summary.labels[l]) != null ? _b2 : 0), 1)
                  ], 10, ["onClick"]);
                }), 64)),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => isRef(segment) ? segment.value = $event : null,
                  class: "field-input text-xs py-1.5 w-44"
                }, [
                  createVNode("option", { value: "" }, "All business types"),
                  (openBlock(true), createBlock(Fragment, null, renderList((_f = (_e = unref(d)) == null ? void 0 : _e.summary.segments) != null ? _f : [], (s) => {
                    return openBlock(), createBlock("option", {
                      key: s.key,
                      value: s.key
                    }, toDisplayString(s.key), 9, ["value"]);
                  }), 128))
                ], 8, ["onUpdate:modelValue"]), [
                  [vModelSelect, unref(segment)]
                ]),
                withDirectives(createVNode("select", {
                  "onUpdate:modelValue": ($event) => isRef(district) ? district.value = $event : null,
                  class: "field-input text-xs py-1.5 w-40"
                }, [
                  createVNode("option", { value: "" }, "All districts"),
                  (openBlock(true), createBlock(Fragment, null, renderList((_h = (_g = unref(d)) == null ? void 0 : _g.summary.districts) != null ? _h : [], (s) => {
                    return openBlock(), createBlock("option", {
                      key: s.key,
                      value: s.key
                    }, toDisplayString(s.key), 9, ["value"]);
                  }), 128))
                ], 8, ["onUpdate:modelValue"]), [
                  [vModelSelect, unref(district)]
                ]),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                  type: "search",
                  placeholder: "Name, area\u2026",
                  class: "field-input text-xs py-1.5 w-44"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(search)]
                ])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(d)) {
              _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(unref(tiles), (k) => {
                _push2(`<div class="glass-card p-3"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(k.l)}</p><p class="text-lg font-bold font-mono text-gray-100"${_scopeId}>${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600"${_scopeId}>${ssrInterpolate(k.s)}</p></div>`);
              });
              _push2(`<!--]--></div>`);
              if (unref(d).summary.data_gaps) {
                _push2(`<div class="no-print glass-card p-3 text-xs text-amber-300/90"${_scopeId}> Data gaps that weaken the assessment: ${ssrInterpolate(unref(d).summary.data_gaps.no_address)} customers have no address \xB7 ${ssrInterpolate(unref(d).summary.data_gaps.buyers_without_branch)} buyers have orders with no branch \xB7 business type is a guess for ${ssrInterpolate(unref(d).summary.data_gaps.segment_unconfirmed)} customers (open a customer card to confirm) \xB7 ${ssrInterpolate(unref(d).summary.credit.no_limit_owing)} customers owe money but have no real credit limit set. </div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--[-->`);
              ssrRenderList(unref(sections), (s) => {
                _push2(`<section class="space-y-1"${_scopeId}><h2 class="text-sm font-bold text-gray-200 mt-3"${_scopeId}>${ssrInterpolate(s.title)}</h2>`);
                _push2(ssrRenderComponent(_component_ReportTable, {
                  cols: s.cols,
                  rows: s.rows,
                  totals: s.totals
                }, null, _parent2, _scopeId));
                _push2(`</section>`);
              });
              _push2(`<!--]--><h2 class="text-sm font-bold text-gray-200 mt-4"${_scopeId}>Customers <span class="text-gray-600 font-normal"${_scopeId}>(${ssrInterpolate(unref(d).customers.length)} shown, most urgent first)</span></h2><div class="glass-card overflow-x-auto"${_scopeId}><table class="w-full text-xs"${_scopeId}><thead${_scopeId}><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"${_scopeId}><th class="px-3 py-2 text-left"${_scopeId}>Customer</th><th class="px-3 py-2 text-left"${_scopeId}>Health</th><th class="px-3 py-2 text-left"${_scopeId}>Type \xB7 district</th><th class="px-3 py-2 text-right"${_scopeId}>12-mo \u09F3</th><th class="px-3 py-2 text-right"${_scopeId}>Owes \u09F3</th><th class="px-3 py-2 text-right"${_scopeId}>Last order</th><th class="px-3 py-2 text-left"${_scopeId}>Why / next step</th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(d).customers, (c) => {
                _push2(`<tr class="border-b border-white/[0.04] align-top"${_scopeId}><td class="px-3 py-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/crm/customers/${c.id}`,
                  class: "text-gold-400 hover:underline"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(c.name)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(c.name), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</td><td class="px-3 py-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_CrmLabel, {
                  label: c.label
                }, null, _parent2, _scopeId));
                _push2(`</td><td class="px-3 py-2 text-gray-400"${_scopeId}>${ssrInterpolate(c.segment)} \xB7 ${ssrInterpolate(c.district)}</td><td class="px-3 py-2 text-right font-mono"${_scopeId}>${ssrInterpolate(n0(c.value_12m))}</td><td class="px-3 py-2 text-right font-mono"${_scopeId}>${ssrInterpolate(n0(Math.max(0, c.balance)))}</td><td class="px-3 py-2 text-right text-gray-500"${_scopeId}>${ssrInterpolate(c.days_since_last != null ? c.days_since_last + " d ago" : "\u2014")}</td><td class="px-3 py-2 text-gray-400 max-w-[28rem]"${_scopeId}>${ssrInterpolate(c.reasons.join(" \xB7 "))}`);
                if (c.suggestions[0]) {
                  _push2(`<div class="text-gray-200"${_scopeId}>\u2192 ${ssrInterpolate(c.suggestions[0])}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td></tr>`);
              });
              _push2(`<!--]--></tbody></table></div><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Loading\u2026")) : unref(d) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-4 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(tiles), (k) => {
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
                unref(d).summary.data_gaps ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "no-print glass-card p-3 text-xs text-amber-300/90"
                }, " Data gaps that weaken the assessment: " + toDisplayString(unref(d).summary.data_gaps.no_address) + " customers have no address \xB7 " + toDisplayString(unref(d).summary.data_gaps.buyers_without_branch) + " buyers have orders with no branch \xB7 business type is a guess for " + toDisplayString(unref(d).summary.data_gaps.segment_unconfirmed) + " customers (open a customer card to confirm) \xB7 " + toDisplayString(unref(d).summary.credit.no_limit_owing) + " customers owe money but have no real credit limit set. ", 1)) : createCommentVNode("", true),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(sections), (s) => {
                  return openBlock(), createBlock("section", {
                    key: s.title,
                    class: "space-y-1"
                  }, [
                    createVNode("h2", { class: "text-sm font-bold text-gray-200 mt-3" }, toDisplayString(s.title), 1),
                    createVNode(_component_ReportTable, {
                      cols: s.cols,
                      rows: s.rows,
                      totals: s.totals
                    }, null, 8, ["cols", "rows", "totals"])
                  ]);
                }), 128)),
                createVNode("h2", { class: "text-sm font-bold text-gray-200 mt-4" }, [
                  createTextVNode("Customers "),
                  createVNode("span", { class: "text-gray-600 font-normal" }, "(" + toDisplayString(unref(d).customers.length) + " shown, most urgent first)", 1)
                ]),
                createVNode("div", { class: "glass-card overflow-x-auto" }, [
                  createVNode("table", { class: "w-full text-xs" }, [
                    createVNode("thead", null, [
                      createVNode("tr", { class: "border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500" }, [
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Customer"),
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Health"),
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Type \xB7 district"),
                        createVNode("th", { class: "px-3 py-2 text-right" }, "12-mo \u09F3"),
                        createVNode("th", { class: "px-3 py-2 text-right" }, "Owes \u09F3"),
                        createVNode("th", { class: "px-3 py-2 text-right" }, "Last order"),
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Why / next step")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(d).customers, (c) => {
                        return openBlock(), createBlock("tr", {
                          key: c.id,
                          class: "border-b border-white/[0.04] align-top"
                        }, [
                          createVNode("td", { class: "px-3 py-2" }, [
                            createVNode(_component_NuxtLink, {
                              to: `/crm/customers/${c.id}`,
                              class: "text-gold-400 hover:underline"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(c.name), 1)
                              ]),
                              _: 2
                            }, 1032, ["to"])
                          ]),
                          createVNode("td", { class: "px-3 py-2" }, [
                            createVNode(_component_CrmLabel, {
                              label: c.label
                            }, null, 8, ["label"])
                          ]),
                          createVNode("td", { class: "px-3 py-2 text-gray-400" }, toDisplayString(c.segment) + " \xB7 " + toDisplayString(c.district), 1),
                          createVNode("td", { class: "px-3 py-2 text-right font-mono" }, toDisplayString(n0(c.value_12m)), 1),
                          createVNode("td", { class: "px-3 py-2 text-right font-mono" }, toDisplayString(n0(Math.max(0, c.balance))), 1),
                          createVNode("td", { class: "px-3 py-2 text-right text-gray-500" }, toDisplayString(c.days_since_last != null ? c.days_since_last + " d ago" : "\u2014"), 1),
                          createVNode("td", { class: "px-3 py-2 text-gray-400 max-w-[28rem]" }, [
                            createTextVNode(toDisplayString(c.reasons.join(" \xB7 ")), 1),
                            c.suggestions[0] ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-gray-200"
                            }, "\u2192 " + toDisplayString(c.suggestions[0]), 1)) : createCommentVNode("", true)
                          ])
                        ]);
                      }), 128))
                    ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/portfolio.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=portfolio-BMW7MbnX.mjs.map
