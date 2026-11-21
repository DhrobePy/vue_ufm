import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { _ as _sfc_main$1 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './server.mjs';
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
import 'vue-router';
import './SidebarIcon-oZVkzwjh.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/collector/schedule",
      "$bHNuFbH9dY"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const schedule = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.schedule) != null ? _b : [];
    });
    const recentCollections = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recentCollections) != null ? _b : [];
    });
    function fmtBDT(n) {
      const v = Number(n);
      if (v >= 1e5) return `\u09F3${(v / 1e5).toFixed(1)}L`;
      if (v >= 1e3) return `\u09F3${(v / 1e3).toFixed(0)}K`;
      return `\u09F3${v.toLocaleString()}`;
    }
    const cols = [
      { key: "date", label: "Date", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "amount", label: "Amount", sortable: true },
      { key: "paymentMode", label: "Method" },
      { key: "reference", label: "Reference" },
      { key: "collector", label: "Collector" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      const _component_KpiCard = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Collections",
        subtitle: "Field payment collection \xB7 reconciliation \xB7 daily summary",
        breadcrumb: ["Collector"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/credit-sales/collect",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Record Collection`);
                } else {
                  return [
                    createTextVNode("+ Record Collection")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/credit-sales/collect",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Record Collection")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`);
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Today's Collections",
        value: fmtBDT((_b = (_a = unref(stats)) == null ? void 0 : _a.today_total) != null ? _b : 0),
        trend: "Collected today",
        "trend-up": "",
        icon: "money",
        color: "gold"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Pending Accounts",
        value: String(unref(schedule).length),
        trend: "With balance due",
        "trend-up": false,
        icon: "users",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Month Total",
        value: fmtBDT((_d = (_c = unref(stats)) == null ? void 0 : _c.month_total) != null ? _d : 0),
        trend: "This month",
        "trend-up": "",
        icon: "chart",
        color: "teal"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Overdue Accounts",
        value: String(unref(schedule).filter((v) => Number(v.outstanding) > 1e5).length),
        trend: "High balance",
        "trend-up": false,
        icon: "list",
        color: "red"
      }, null, _parent));
      _push(`</div><div class="glass-card p-5"><h2 class="section-title mb-4">Today&#39;s Collection Schedule</h2><div class="space-y-2">`);
      if (!unref(schedule).length) {
        _push(`<div class="py-8 text-center text-xs text-gray-600">No outstanding accounts today</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(schedule), (visit) => {
        _push(`<div class="flex items-center gap-4 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"><div class="${ssrRenderClass([
          "w-2 h-2 rounded-full shrink-0",
          visit.status === "collected" ? "bg-emerald-400" : visit.status === "partial" ? "bg-yellow-400" : visit.status === "skipped" ? "bg-red-400" : "bg-gray-600"
        ])}"></div><div class="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3"><div><p class="text-xs font-medium text-gray-200 truncate">${ssrInterpolate(visit.customer)}</p><p class="text-[11px] text-gray-600">${ssrInterpolate(visit.area)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Outstanding</p><p class="text-sm font-bold text-red-400">\u09F3${ssrInterpolate(visit.outstanding.toLocaleString())}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Collected</p><p class="${ssrRenderClass([visit.collected > 0 ? "text-emerald-400" : "text-gray-600", "text-sm font-semibold"])}">${ssrInterpolate(visit.collected > 0 ? `\u09F3${visit.collected.toLocaleString()}` : "\u2014")}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Method</p><p class="text-xs text-gray-400">${ssrInterpolate(visit.method || "\u2014")}</p></div></div><div class="flex gap-2 shrink-0">`);
        if (visit.status === "pending") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/collect?customer=${visit.id}`,
            class: "btn-gold text-xs py-1.5 px-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Collect `);
              } else {
                return [
                  createTextVNode(" Collect ")
                ];
              }
            }),
            _: 2
          }, _parent));
        } else if (visit.status === "partial") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/collect?customer=${visit.id}`,
            class: "btn-ghost text-xs py-1.5 px-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Collect more`);
              } else {
                return [
                  createTextVNode("Collect more")
                ];
              }
            }),
            _: 2
          }, _parent));
        } else if (visit.status === "collected") {
          _push(`<span class="text-xs text-emerald-400 font-medium px-2">\u2713 Done</span>`);
        } else {
          _push(`<!---->`);
        }
        if (visit.status === "partial") {
          _push(`<span class="text-xs text-yellow-400 font-medium px-2">Part-paid today</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-5"><h2 class="section-title mb-4">Recent Collections</h2>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(recentCollections),
        "per-page": 10,
        exportable: "",
        "search-placeholder": "Search\u2026"
      }, {
        "cell-amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs font-bold text-emerald-400"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs font-bold text-emerald-400" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        "cell-paymentMode": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]" }, toDisplayString(value), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/collector/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CVPnomSj.mjs.map
