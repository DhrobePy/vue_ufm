import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-C6rBgLMJ.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const cols = [
      { key: "number", label: "Vehicle #", sortable: true },
      { key: "type", label: "Type" },
      { key: "category", label: "Category", sortable: true },
      { key: "capacity", label: "Capacity" },
      { key: "driver", label: "Assigned Driver" },
      { key: "status", label: "Status" },
      { key: "nextService", label: "Next Service" }
    ];
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/logistics/vehicles",
      "$TEFZVsZgtw"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.vehicles) != null ? _b : []).map((v) => ({
          id: v.id,
          number: v.vehicle_number,
          type: v.vehicle_type,
          // 'Own' | 'Rented'
          category: v.category,
          // 'Truck' | 'Van' | 'Pickup' …
          capacity: v.capacity_kg ? `${(v.capacity_kg / 1e3).toFixed(1)} MT` : "\u2014",
          driver: v.driver_name || "\u2014",
          status: v.status,
          // already 'Active' | 'Maintenance' | 'Inactive'
          nextService: v.next_service_due_date ? String(v.next_service_due_date).slice(0, 10) : "\u2014"
        }));
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Vehicles",
        breadcrumb: ["Logistics", "Vehicles"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/logistics/vehicles/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Add Vehicle`);
                } else {
                  return [
                    createTextVNode("+ Add Vehicle")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/logistics/vehicles/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Add Vehicle")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(vehicles),
        "per-page": 10,
        exportable: "",
        "search-placeholder": "Search vehicles\u2026"
      }, {
        "cell-number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-gold-400/80 font-bold"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-gold-400/80 font-bold" }, toDisplayString(value), 1)
            ];
          }
        }),
        "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, {
              status: value === "Active" ? "active" : value === "Maintenance" ? "in_maintenance" : "inactive"
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, {
                status: value === "Active" ? "active" : value === "Maintenance" ? "in_maintenance" : "inactive"
              }, null, 8, ["status"])
            ];
          }
        }),
        "cell-type": withCtx(({ value }, _push2, _parent2, _scopeId) => {
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
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/vehicles/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B9qfrLHM.mjs.map
