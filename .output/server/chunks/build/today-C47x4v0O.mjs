import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$2 } from './DataTable-CCNVWvkK.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "today",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const cols = [
      { key: "order_number", label: "Receipt #", sortable: true },
      { key: "order_date", label: "Time", sortable: true },
      { key: "customer_name", label: "Customer" },
      { key: "item_count", label: "Items" },
      { key: "payment_method", label: "Method" },
      { key: "total_amount", label: "Amount", sortable: true },
      { key: "order_status", label: "Status" }
    ];
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/pos/today",
      "$dbIvcs81Tb"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const orders = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Today's POS Sales",
        subtitle: "All counter transactions for today",
        breadcrumb: ["POS", `Today's Sales`]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/pos",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u{1F6D2} Open POS`);
                } else {
                  return [
                    createTextVNode("\u{1F6D2} Open POS")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/pos",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u{1F6D2} Open POS")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Transactions</p><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total_orders) != null ? _a : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Revenue</p><p class="text-2xl font-bold text-gold-400">\u09F3${ssrInterpolate(Number((_b = unref(stats).total_revenue) != null ? _b : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Cash</p><p class="text-2xl font-bold text-emerald-400">\u09F3${ssrInterpolate(Number((_c = unref(stats).cash_total) != null ? _c : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Other Methods</p><p class="text-2xl font-bold text-blue-400">\u09F3${ssrInterpolate(Number((_d = unref(stats).mobile_total) != null ? _d : 0).toLocaleString())}</p></div></div><div class="glass-card p-5">`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(orders),
        "per-page": 15,
        "search-placeholder": "Search transactions\u2026"
      }, {
        "cell-order_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
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
            _push2(`<span class="font-mono text-xs font-bold text-gray-200"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs font-bold text-gray-200" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        "cell-payment_method": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-xs text-gray-400"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-xs text-gray-400" }, toDisplayString(value), 1)
            ];
          }
        }),
        "cell-order_status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, {
              status: value == null ? void 0 : value.toLowerCase()
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, {
                status: value == null ? void 0 : value.toLowerCase()
              }, null, 8, ["status"])
            ];
          }
        }),
        actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex gap-1.5"${_scopeId}><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>View</button><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>\u{1F5A8}</button></div>`);
          } else {
            return [
              createVNode("div", { class: "flex gap-1.5" }, [
                createVNode("button", { class: "btn-ghost text-xs py-1 px-2" }, "View"),
                createVNode("button", { class: "btn-ghost text-xs py-1 px-2" }, "\u{1F5A8}")
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/today.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=today-C47x4v0O.mjs.map
