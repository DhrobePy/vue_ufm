import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './DataTable-CCNVWvkK.mjs';
import { _ as _sfc_main$4 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
import './SidebarIcon-oZVkzwjh.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const poCols = [
      { key: "po_number", label: "PO #", sortable: true },
      { key: "supplier_name", label: "Supplier", sortable: true },
      { key: "qty_mt", label: "Qty (MT)" },
      { key: "value", label: "Value (\u09F3)" },
      { key: "status", label: "Status" },
      { key: "payment_status", label: "Payment" }
    ];
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/dashboard",
      "$wb-QVvjB74"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const recentPOs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recentPOs) != null ? _b : [];
    });
    const topSuppliers = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.topSuppliers) != null ? _b : [];
    });
    function fmtCr(v) {
      const n = Number(v != null ? v : 0);
      if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
      if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
      return n.toLocaleString();
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      const _component_UiStatusBadge = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Purchase",
        subtitle: "Procure-to-pay \xB7 Wheat procurement management",
        breadcrumb: ["Purchase"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/orders/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New PO`);
                } else {
                  return [
                    createTextVNode("+ New PO")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/orders/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New PO")
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
        label: "Active POs",
        value: (_a = unref(stats).active_pos) != null ? _a : 0,
        trend: "pending/approved",
        "trend-up": "",
        icon: "file",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "GRNs Pending",
        value: (_b = unref(stats).grns_pending) != null ? _b : 0,
        trend: "Needs receipt",
        "trend-up": false,
        icon: "check",
        color: "yellow"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Total Payable",
        value: `\u09F3${fmtCr(unref(stats).total_payable)}`,
        trend: "Outstanding balance",
        "trend-up": false,
        icon: "money",
        color: "red"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Wheat Received",
        value: `${Number((_c = unref(stats).wheat_received_mt) != null ? _c : 0).toFixed(1)} MT`,
        trend: "All time",
        "trend-up": "",
        icon: "box",
        color: "teal"
      }, null, _parent));
      _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Recent Purchase Orders</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/orders",
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
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: poCols,
        rows: unref(recentPOs),
        "per-page": 8,
        "search-placeholder": "Search POs\u2026"
      }, {
        "cell-po_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
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
        "cell-payment_status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
            ];
          }
        }),
        "cell-value": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-gray-300"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-gray-300" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Top Suppliers</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/suppliers",
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
      _push(`</div><div class="space-y-3"><!--[-->`);
      ssrRenderList(unref(topSuppliers), (s) => {
        var _a2;
        _push(`<div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"><div class="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">${ssrInterpolate(((_a2 = s.name) != null ? _a2 : "?")[0])}</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(s.name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(s.type)} \xB7 ${ssrInterpolate(s.orders)} orders</p></div><div class="text-right"><p class="text-xs font-semibold text-gold-400">\u09F3${ssrInterpolate(fmtCr(s.amount))}</p>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: s.status
        }, null, _parent));
        _push(`</div></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(topSuppliers).length) {
        _push(`<p class="text-xs text-gray-600 text-center py-4">No suppliers yet</p>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Dbg50j4Y.mjs.map
