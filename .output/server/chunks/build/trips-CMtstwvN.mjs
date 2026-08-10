import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "trips",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const now = /* @__PURE__ */ new Date();
    const from = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
    const to = ref(now.toISOString().slice(0, 10));
    const url = computed(() => `/api/fleet/reports/trips?from=${from.value}&to=${to.value}`);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      url,
      "$NTptcAgpH7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const trips = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.trips) != null ? _b : [];
    });
    const byDriver = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.byDriver) != null ? _b : [];
    });
    const byVehicle = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.byVehicle) != null ? _b : [];
    });
    const summary = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.summary) != null ? _b : { total_trips: 0, revenue: 0, total_expense: 0, net: 0 };
    });
    const maxDriverRevenue = computed(() => Math.max(...byDriver.value.map((d) => Number(d.revenue || 0)), 1));
    const maxVehicleRevenue = computed(() => Math.max(...byVehicle.value.map((v) => Number(v.revenue || 0)), 1));
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
        title: "Trip Summary Report",
        breadcrumb: ["Fleet", "Reports", "Trip Summary"]
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
      _push(`<div class="glass-card p-4 flex flex-wrap gap-4 items-end"><div><label class="form-label">From</label><input${ssrRenderAttr("value", unref(from))} type="date" class="form-input"></div><div><label class="form-label">To</label><input${ssrRenderAttr("value", unref(to))} type="date" class="form-input"></div><button class="btn-gold text-xs">Apply Filter</button><button class="btn-secondary text-xs">This Month</button></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Trips</p><p class="text-2xl font-bold text-gold-400 mt-1">${ssrInterpolate(unref(summary).total_trips)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Revenue</p><p class="text-2xl font-bold text-emerald-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(summary).revenue))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Expenses</p><p class="text-2xl font-bold text-red-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(summary).total_expense))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Net (Revenue \u2212 Expenses)</p><p class="${ssrRenderClass([unref(summary).net >= 0 ? "text-blue-400" : "text-red-400", "text-2xl font-bold mt-1"])}">\u09F3${ssrInterpolate(fmt(unref(summary).net))}</p></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><h3 class="section-title mb-4">Revenue by Driver</h3>`);
      if (!unref(byDriver).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No trip data for this period</div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(byDriver), (d) => {
          var _a;
          _push(`<div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">${ssrInterpolate((_a = d.driver_name) == null ? void 0 : _a.charAt(0))}</div><div class="flex-1 min-w-0"><div class="flex justify-between mb-1"><span class="text-xs text-gray-300 truncate">${ssrInterpolate(d.driver_name)}</span><span class="text-xs font-bold text-emerald-400 shrink-0 ml-2">\u09F3${ssrInterpolate(fmt(d.revenue))}</span></div><div class="w-full bg-white/[0.05] rounded-full h-1.5"><div class="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style="${ssrRenderStyle({ width: Number(d.revenue) / unref(maxDriverRevenue) * 100 + "%" })}"></div></div><p class="text-[10px] text-gray-600 mt-0.5">${ssrInterpolate(d.trips)} trips \xB7 \u09F3${ssrInterpolate(fmt(d.expenses))} expenses</p></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div><div class="glass-card p-5"><h3 class="section-title mb-4">Revenue by Vehicle</h3>`);
      if (!unref(byVehicle).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No trip data for this period</div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(byVehicle), (v) => {
          _push(`<div class="flex items-center gap-3"><p class="font-mono text-xs font-bold text-gold-400/80 w-28 shrink-0">${ssrInterpolate(v.registration_no)}</p><div class="flex-1"><div class="flex justify-between mb-1"><span class="text-xs text-gray-500">${ssrInterpolate(v.trips)} trips</span><span class="text-xs font-bold text-emerald-400">\u09F3${ssrInterpolate(fmt(v.revenue))}</span></div><div class="w-full bg-white/[0.05] rounded-full h-1.5"><div class="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-400" style="${ssrRenderStyle({ width: Number(v.revenue) / unref(maxVehicleRevenue) * 100 + "%" })}"></div></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div><div class="glass-card p-5"><h3 class="section-title mb-4">All Trips <span class="text-gray-500 font-normal text-xs normal-case">(${ssrInterpolate(unref(trips).length)} trips)</span></h3>`);
      if (!unref(trips).length) {
        _push(`<div class="text-center py-8 text-gray-600 text-sm">No trips found for this period</div>`);
      } else {
        _push(`<div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="pb-2 text-left text-gray-500">Trip No</th><th class="pb-2 text-left text-gray-500">Date</th><th class="pb-2 text-left text-gray-500">Route</th><th class="pb-2 text-left text-gray-500">Vehicle</th><th class="pb-2 text-left text-gray-500">Driver</th><th class="pb-2 text-right text-gray-500">Charge \u09F3</th><th class="pb-2 text-right text-gray-500">Expenses \u09F3</th><th class="pb-2 text-right text-gray-500">Net \u09F3</th><th class="pb-2 text-left text-gray-500">Status</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(trips), (t) => {
          _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer"><td class="py-2 font-mono font-bold text-gold-400/80">${ssrInterpolate(t.trip_number)}</td><td class="py-2 text-gray-400">${ssrInterpolate(t.trip_date)}</td><td class="py-2 text-gray-400 max-w-[120px] truncate">${ssrInterpolate(t.origin)} \u2192 ${ssrInterpolate(t.destination)}</td><td class="py-2 font-mono text-gray-300">${ssrInterpolate(t.vehicle_no)}</td><td class="py-2 text-gray-300">${ssrInterpolate(t.driver_name)}</td><td class="py-2 text-right text-emerald-400 font-medium">${ssrInterpolate(fmt(t.trip_charge))}</td><td class="py-2 text-right text-red-400">${ssrInterpolate(fmt(t.total_expense))}</td><td class="${ssrRenderClass([Number(t.trip_charge) - Number(t.total_expense) >= 0 ? "text-blue-400" : "text-red-400", "py-2 text-right font-bold"])}">${ssrInterpolate(fmt(Number(t.trip_charge) - Number(t.total_expense)))}</td><td class="py-2">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: t.trip_status
          }, null, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot><tr class="border-t border-white/[0.07]"><td colspan="5" class="pt-3 text-right text-gray-500 text-xs">Totals</td><td class="pt-3 text-right font-bold text-emerald-400">\u09F3${ssrInterpolate(fmt(unref(summary).revenue))}</td><td class="pt-3 text-right font-bold text-red-400">\u09F3${ssrInterpolate(fmt(unref(summary).total_expense))}</td><td class="${ssrRenderClass([unref(summary).net >= 0 ? "text-blue-400" : "text-red-400", "pt-3 text-right font-bold"])}">\u09F3${ssrInterpolate(fmt(unref(summary).net))}</td><td></td></tr></tfoot></table></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/reports/trips.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=trips-CMtstwvN.mjs.map
