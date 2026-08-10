import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "vehicles",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const now = /* @__PURE__ */ new Date();
    const from = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
    const to = ref(now.toISOString().slice(0, 10));
    const url = computed(() => `/api/fleet/reports/vehicles?from=${from.value}&to=${to.value}`);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      url,
      "$NjEedlAkM9"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const days = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.days) != null ? _b : 1;
    });
    const totalRevenue = computed(() => vehicles.value.reduce((s, v) => s + Number(v.revenue || 0), 0));
    const totalFuel = computed(() => vehicles.value.reduce((s, v) => s + Number(v.fuel_cost || 0), 0));
    const totalMaint = computed(() => vehicles.value.reduce((s, v) => s + Number(v.maint_cost || 0), 0));
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    watch(url, () => refresh());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Vehicle Utilisation Report",
        breadcrumb: ["Fleet", "Reports", "Vehicle Utilisation"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/reports",
              class: "btn-secondary text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Reports`);
                } else {
                  return [
                    createTextVNode("\u2190 Reports")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/fleet/reports",
                class: "btn-secondary text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Reports")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap gap-4 items-end"><div><label class="form-label">From</label><input${ssrRenderAttr("value", unref(from))} type="date" class="form-input"></div><div><label class="form-label">To</label><input${ssrRenderAttr("value", unref(to))} type="date" class="form-input"></div><button class="btn-gold text-xs">Apply</button><button class="btn-secondary text-xs">This Month</button><span class="text-xs text-gray-500 self-center">Period: ${ssrInterpolate(unref(days))} days</span></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Vehicles</p><p class="text-2xl font-bold text-gold-400 mt-1">${ssrInterpolate(unref(vehicles).length)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Active (has trips)</p><p class="text-2xl font-bold text-emerald-400 mt-1">${ssrInterpolate(unref(vehicles).filter((v) => v.total_trips > 0).length)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Revenue</p><p class="text-2xl font-bold text-blue-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(totalRevenue)))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Fuel Cost</p><p class="text-2xl font-bold text-amber-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(totalFuel)))}</p></div></div><div class="glass-card p-5"><h3 class="section-title mb-4">Vehicle-by-Vehicle Breakdown</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="pb-2 text-left text-gray-500">Vehicle</th><th class="pb-2 text-left text-gray-500">Type</th><th class="pb-2 text-center text-gray-500">Status</th><th class="pb-2 text-right text-gray-500">Trips</th><th class="pb-2 text-right text-gray-500">Completed</th><th class="pb-2 text-right text-gray-500">Revenue \u09F3</th><th class="pb-2 text-right text-gray-500">Fuel Cost \u09F3</th><th class="pb-2 text-right text-gray-500">Maint Cost \u09F3</th><th class="pb-2 text-right text-gray-500">Utilisation</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer"><td class="py-2"><p class="font-mono font-bold text-gold-400/80">${ssrInterpolate(v.registration_no)}</p><p class="text-[10px] text-gray-500">${ssrInterpolate(v.make)} ${ssrInterpolate(v.model)}</p></td><td class="py-2 text-gray-400">${ssrInterpolate(v.vehicle_type)}</td><td class="py-2 text-center">`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: v.status
        }, null, _parent));
        _push(`</td><td class="py-2 text-right text-gray-300">${ssrInterpolate(v.total_trips)}</td><td class="py-2 text-right text-emerald-400">${ssrInterpolate(v.completed_trips)}</td><td class="py-2 text-right text-emerald-400 font-medium">${ssrInterpolate(fmt(v.revenue))}</td><td class="py-2 text-right text-amber-400">${ssrInterpolate(fmt(v.fuel_cost))}</td><td class="py-2 text-right text-orange-400">${ssrInterpolate(fmt(v.maint_cost))}</td><td class="py-2 text-right"><div class="flex items-center justify-end gap-2"><div class="w-16 bg-white/[0.05] rounded-full h-1.5"><div class="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400" style="${ssrRenderStyle({ width: Math.min(100, Number(v.total_trips) / Math.max(unref(days) / 7, 1) * 100) + "%" })}"></div></div><span class="text-gray-400 w-8 text-right">${ssrInterpolate(v.total_trips > 0 ? Math.min(100, Math.round(Number(v.total_trips) / Math.max(unref(days) / 7, 1) * 100)) + "%" : "\u2014")}</span></div></td></tr>`);
      });
      _push(`<!--]--></tbody><tfoot><tr class="border-t border-white/[0.07]"><td colspan="5" class="pt-3 text-right text-gray-500">Totals</td><td class="pt-3 text-right font-bold text-emerald-400">\u09F3${ssrInterpolate(fmt(unref(totalRevenue)))}</td><td class="pt-3 text-right font-bold text-amber-400">\u09F3${ssrInterpolate(fmt(unref(totalFuel)))}</td><td class="pt-3 text-right font-bold text-orange-400">\u09F3${ssrInterpolate(fmt(unref(totalMaint)))}</td><td></td></tr></tfoot></table></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/reports/vehicles.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=vehicles-D-N0tOuK.mjs.map
