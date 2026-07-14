import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
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
import './SidebarIcon-oZVkzwjh.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: vData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/logistics/vehicles",
      "$LnJR95M_JT"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allVehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const vehicles = computed(
      () => allVehicles.value.map((v) => {
        var _a;
        return {
          id: v.id,
          number: v.vehicle_number,
          status: v.status,
          // Already 'Active' | 'Maintenance' | 'Inactive'
          driver: (_a = v.driver_name) != null ? _a : ""
        };
      })
    );
    const todayTrips = [];
    function tripColor(s) {
      var _a;
      return (_a = { completed: "#10b981", delivered: "#14b8a6", approved: "#3b82f6", pending: "#eab308", in_production: "#3b82f6", dispatched: "#14b8a6" }[s]) != null ? _a : "#6b7280";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Logistics",
        subtitle: "Fleet management \xB7 drivers \xB7 trips \xB7 fuel \xB7 maintenance",
        breadcrumb: ["Logistics"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/logistics/trips/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Trip`);
                } else {
                  return [
                    createTextVNode("+ New Trip")
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
                  createTextVNode("+ New Trip")
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
        label: "Active Vehicles",
        value: String(unref(vehicles).filter((v) => v.status === "Active").length),
        trend: `${unref(allVehicles).length} total`,
        "trend-up": "",
        icon: "truck",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "In Maintenance",
        value: String(unref(vehicles).filter((v) => v.status === "Maintenance").length),
        trend: "Awaiting service",
        "trend-up": false,
        icon: "list",
        color: "red"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Drivers Assigned",
        value: String(unref(allVehicles).filter((v) => v.driver_name).length),
        trend: "with drivers",
        "trend-up": "",
        icon: "users",
        color: "teal"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Total Fleet",
        value: String(unref(allVehicles).length),
        trend: "vehicles",
        "trend-up": "",
        icon: "truck",
        color: "gold"
      }, null, _parent));
      _push(`</div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-5"><h2 class="section-title mb-4">Fleet Status</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-3"><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        _push(`<div class="glass-card p-3 text-center space-y-1.5"><div class="text-2xl">\u{1F69B}</div><p class="text-xs font-bold text-gray-200">${ssrInterpolate(v.number)}</p>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: v.status === "Active" ? "active" : v.status === "Maintenance" ? "in_maintenance" : "inactive"
        }, null, _parent));
        _push(`<p class="text-[10px] text-gray-600">${ssrInterpolate(v.driver || "No driver")}</p></div>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-5"><h2 class="section-title mb-3">Today&#39;s Trips</h2><div class="space-y-2.5"><!--[-->`);
      ssrRenderList(todayTrips, (trip) => {
        _push(`<div class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"><div class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style="${ssrRenderStyle(`background:${tripColor(trip.status)}`)}"></div><div class="flex-1 min-w-0"><p class="text-xs font-medium text-gray-200 truncate">${ssrInterpolate(trip.vehicle)} \u2192 ${ssrInterpolate(trip.destination)}</p><p class="text-[11px] text-gray-600">${ssrInterpolate(trip.driver)} \xB7 ${ssrInterpolate(trip.time)}</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: trip.status
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-D__hewLO.mjs.map
