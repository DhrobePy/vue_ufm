import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
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
import './SidebarIcon-oZVkzwjh.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const jCols = [
      { key: "id", label: "Ref #", sortable: true },
      { key: "date", label: "Date", sortable: true },
      { key: "description", label: "Description" },
      { key: "debit_total", label: "Debit" },
      { key: "credit_total", label: "Credit" }
    ];
    const GROUP_COLORS = {
      Asset: "#10b981",
      Liability: "#ef4444",
      Equity: "#8b5cf6",
      Revenue: "#f59e0b",
      Expense: "#f97316"
    };
    const groupColor = (g) => {
      var _a;
      return (_a = GROUP_COLORS[g]) != null ? _a : "#6b7280";
    };
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/dashboard",
      "$l7NUSqtjps"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const recentEntries = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recentEntries) != null ? _b : [];
    });
    const accountSummary = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.accountSummary) != null ? _b : {};
    });
    function fmtCr(v) {
      const n = Number(v != null ? v : 0);
      if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
      if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
      return n.toLocaleString();
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Accounts",
        subtitle: "Chart of accounts \xB7 journal \xB7 vouchers \xB7 statements",
        breadcrumb: ["Accounts"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/accounts/journal/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Entry`);
                } else {
                  return [
                    createTextVNode("+ New Entry")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/accounts/journal/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Entry")
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
        label: "Total Assets",
        value: `\u09F3${fmtCr(unref(stats).total_assets)}`,
        trend: "Balance sheet",
        "trend-up": "",
        icon: "bank",
        color: "teal"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Total Liabilities",
        value: `\u09F3${fmtCr(unref(stats).total_liabilities)}`,
        trend: "Balance sheet",
        "trend-up": false,
        icon: "money",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Net Equity",
        value: `\u09F3${fmtCr(unref(stats).net_equity)}`,
        trend: "Owner's equity",
        "trend-up": "",
        icon: "chart",
        color: "gold"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Journal Entries",
        value: (_a = unref(stats).journal_entries) != null ? _a : 0,
        trend: "This month",
        "trend-up": "",
        icon: "book",
        color: "blue"
      }, null, _parent));
      _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><h2 class="section-title mb-4">Recent Journal Entries</h2>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: jCols,
        rows: unref(recentEntries),
        "per-page": 6,
        "search-placeholder": "Search\u2026"
      }, {
        "cell-id": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>JE-${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, "JE-" + toDisplayString(value), 1)
            ];
          }
        }),
        "cell-debit_total": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-red-400 font-mono text-xs font-semibold"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-red-400 font-mono text-xs font-semibold" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        "cell-credit_total": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-emerald-400 font-mono text-xs font-semibold"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-emerald-400 font-mono text-xs font-semibold" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="glass-card p-5"><h2 class="section-title mb-4">Account Summary</h2><div class="space-y-2"><!--[-->`);
      ssrRenderList(unref(accountSummary), (balance, group) => {
        _push(`<div class="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors"><div class="flex items-center gap-3"><div class="w-2 h-2 rounded-full" style="${ssrRenderStyle(`background:${groupColor(group)}`)}"></div><span class="text-sm text-gray-300">${ssrInterpolate(group)}</span></div><span class="font-bold font-mono text-sm" style="${ssrRenderStyle(`color:${groupColor(group)}`)}"> \u09F3${ssrInterpolate(Number(Math.abs(balance)).toLocaleString())}</span></div>`);
      });
      _push(`<!--]-->`);
      if (!Object.keys(unref(accountSummary)).length) {
        _push(`<p class="text-xs text-gray-600 text-center py-4">No data</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B9k1vYBz.mjs.map
