import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const cols = [
      { key: "id", label: "Trip #", sortable: true },
      { key: "date", label: "Date", sortable: true },
      { key: "vehicle", label: "Vehicle", sortable: true },
      { key: "driver", label: "Driver" },
      { key: "total_orders", label: "Orders" },
      { key: "weight_mt", label: "Weight" },
      { key: "status", label: "Status" }
    ];
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/logistics/trips",
      "$AfLW4SqgK-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const trips = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.trips) != null ? _b : [];
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
        title: "Trips",
        breadcrumb: ["Logistics", "Trips"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/logistics/trips/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Create Trip`);
                } else {
                  return [
                    createTextVNode("+ Create Trip")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/logistics/trips/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Create Trip")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-4 gap-4"><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total) != null ? _a : 0)}</p><p class="text-xs text-gray-500 mt-1">Total Trips</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-blue-400">${ssrInterpolate((_b = unref(stats).active) != null ? _b : 0)}</p><p class="text-xs text-gray-500 mt-1">In Progress</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-amber-400">${ssrInterpolate((_c = unref(stats).scheduled) != null ? _c : 0)}</p><p class="text-xs text-gray-500 mt-1">Scheduled</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate((_d = unref(stats).completed_today) != null ? _d : 0)}</p><p class="text-xs text-gray-500 mt-1">Completed Today</p></div></div>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(trips),
        "per-page": 12,
        exportable: "",
        "search-placeholder": "Search trips\u2026"
      }, {
        "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, {
              status: value == null ? void 0 : value.toLowerCase().replace(" ", "_")
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, {
                status: value == null ? void 0 : value.toLowerCase().replace(" ", "_")
              }, null, 8, ["status"])
            ];
          }
        }),
        "cell-weight_mt": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-xs text-gray-300"${_scopeId}>${ssrInterpolate(value)} MT</span>`);
          } else {
            return [
              createVNode("span", { class: "text-xs text-gray-300" }, toDisplayString(value) + " MT", 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/trips/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-iY3d4ITV.mjs.map
