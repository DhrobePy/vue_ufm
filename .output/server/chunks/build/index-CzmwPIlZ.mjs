import { _ as _sfc_main$2 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { _ as _sfc_main$4 } from './DataTable-CCNVWvkK.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "PaymentBar",
  __ssrInlineRender: true,
  props: {
    label: {},
    pct: {},
    value: {},
    color: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-1.5" }, _attrs))}><div class="flex items-center justify-between text-xs"><span class="text-gray-400 font-medium">${ssrInterpolate(__props.label)}</span><span class="text-gray-300 font-semibold">${ssrInterpolate(__props.value)} <span class="text-gray-600 font-normal">(${ssrInterpolate(__props.pct)}%)</span></span></div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full transition-all duration-700 ease-out" style="${ssrRenderStyle(`width: ${__props.pct}%; background: ${__props.color}; box-shadow: 0 0 8px ${__props.color}55`)}"></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PaymentBar.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/expenses/dashboard",
      "$QVEh2kJ8ju"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const pendingList = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.pendingList) != null ? _b : [];
    });
    const categoryBreakdown = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.categoryBreakdown) != null ? _b : [];
    });
    const tableRows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.expenses) != null ? _b : [];
    });
    function fmtLakh(n) {
      if (n >= 1e5) return (n / 1e5).toFixed(1) + "L";
      if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
      return n.toLocaleString();
    }
    const cols = [
      { key: "voucher_number", label: "Voucher #", sortable: true },
      { key: "expense_date", label: "Date", sortable: true },
      { key: "category_name", label: "Category", sortable: true },
      { key: "remarks", label: "Description" },
      { key: "total_amount", label: "Amount", sortable: true },
      { key: "payment_method", label: "Method" },
      { key: "status", label: "Status" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$3;
      const _component_PaymentBar = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Expenses",
        subtitle: "Voucher creation \xB7 approval \xB7 categorisation",
        breadcrumb: ["Expenses"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/expenses/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Expense`);
                } else {
                  return [
                    createTextVNode("+ New Expense")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/expenses/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Expense")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Pending Approval</p><p class="text-2xl font-bold text-yellow-400">${ssrInterpolate((_a = unref(stats).pending) != null ? _a : 0)}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">This Month</p><p class="text-2xl font-bold text-orange-400">\u09F3${ssrInterpolate(fmtLakh((_b = unref(stats).this_month_total) != null ? _b : 0))}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Approved Today</p><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate((_c = unref(stats).approved_today) != null ? _c : 0)}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Top Category</p><p class="text-xl font-bold text-blue-400 truncate">${ssrInterpolate((_d = unref(stats).top_category) != null ? _d : "\u2014")}</p></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Pending Approval</h2>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/expenses/approve",
          class: "text-xs text-gold-500 hover:text-gold-400 font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`View all \u2192`);
            } else {
              return [
                createTextVNode("View all \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(pendingList), (e) => {
          _push(`<div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"><div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#f59e0b,#d97706)" })}">${ssrInterpolate((e.category_name || "E")[0])}</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(e.remarks || e.category_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(e.category_name)} \xB7 ${ssrInterpolate(String(e.expense_date).slice(0, 10))}</p></div><div class="text-right shrink-0"><p class="text-sm font-bold text-gold-400">\u09F3${ssrInterpolate(Number(e.total_amount).toLocaleString())}</p>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: e.status
          }, null, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(pendingList).length) {
          _push(`<div class="text-xs text-center text-gray-600 py-4">No pending expenses</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="glass-card p-5"><h2 class="section-title mb-4">Expense by Category</h2><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(categoryBreakdown), (cat) => {
          _push(ssrRenderComponent(_component_PaymentBar, {
            key: cat.label,
            label: cat.label,
            pct: cat.pct,
            value: cat.value,
            color: cat.color
          }, null, _parent));
        });
        _push(`<!--]-->`);
        if (!unref(categoryBreakdown).length) {
          _push(`<div class="text-xs text-center text-gray-600 py-4">No category data</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="glass-card p-5"><h2 class="section-title mb-4">Expense History</h2>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(tableRows),
          "per-page": 10,
          exportable: "",
          "search-placeholder": "Search expenses\u2026"
        }, {
          "cell-voucher_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-total_amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-semibold font-mono text-xs text-gray-200"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-semibold font-mono text-xs text-gray-200" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/expenses/${row.id}`,
                class: "btn-ghost text-xs py-1 px-2"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`View`);
                  } else {
                    return [
                      createTextVNode("View")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/expenses/${row.id}`,
                  class: "btn-ghost text-xs py-1 px-2"
                }, {
                  default: withCtx(() => [
                    createTextVNode("View")
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CzmwPIlZ.mjs.map
