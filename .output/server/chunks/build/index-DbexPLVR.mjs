import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/fuel",
      {
        query: computed(() => ({ search: search.value })),
        watch: [search]
      },
      "$iDyuf7_T7w"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const logs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.logs) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    function calcMileage(l) {
      if (!l.odometer_reading || !l.previous_odometer || !l.quantity_liters) return "\u2014";
      const km = l.odometer_reading - l.previous_odometer;
      const lit = Number(l.quantity_liters);
      if (km <= 0 || lit <= 0) return "\u2014";
      return (km / lit).toFixed(2) + " km/L";
    }
    function fmtK(n) {
      const v = Number(n || 0);
      if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
      if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
      return v.toLocaleString();
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Fuel Logs",
        breadcrumb: ["Fleet", "Fuel"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/fuel/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Log Fuel`);
                } else {
                  return [
                    createTextVNode("+ Log Fuel")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/fleet/fuel/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Log Fuel")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total_logs) != null ? _a : 0)}</p><p class="text-xs text-gray-500 mt-1">Total Fill-ups</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-blue-400">${ssrInterpolate(Number((_b = unref(stats).this_month_liters) != null ? _b : 0).toFixed(0))} L</p><p class="text-xs text-gray-500 mt-1">This Month (Litres)</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gold-400">\u09F3${ssrInterpolate(fmtK(unref(stats).this_month_cost))}</p><p class="text-xs text-gray-500 mt-1">This Month Cost</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-emerald-400">\u09F3${ssrInterpolate(fmtK(unref(stats).total_cost))}</p><p class="text-xs text-gray-500 mt-1">Total Cost</p></div></div><div class="flex gap-3"><div class="relative flex-1"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg><input${ssrRenderAttr("value", unref(search))} type="text" placeholder="Search vehicle, station, receipt\u2026" class="form-input pl-9"></div></div><div class="glass-card overflow-hidden"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="px-4 py-3 text-left text-gray-500">Date</th><th class="px-4 py-3 text-left text-gray-500">Vehicle</th><th class="px-4 py-3 text-left text-gray-500">Driver</th><th class="px-4 py-3 text-left text-gray-500">Fuel Type</th><th class="px-4 py-3 text-right text-gray-500">Qty (L)</th><th class="px-4 py-3 text-right text-gray-500">Rate \u09F3/L</th><th class="px-4 py-3 text-right text-gray-500">Amount \u09F3</th><th class="px-4 py-3 text-right text-gray-500">Odometer</th><th class="px-4 py-3 text-right text-gray-500">Mileage</th><th class="px-4 py-3 text-left text-gray-500">Station</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(logs), (l) => {
        _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02]"><td class="px-4 py-3 text-gray-400">${ssrInterpolate(l.fuel_date)}</td><td class="px-4 py-3 font-mono text-gold-400/80">${ssrInterpolate(l.vehicle_no)}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(l.driver_name || "\u2014")}</td><td class="px-4 py-3"><span class="badge bg-blue-500/10 text-blue-400 text-[10px]">${ssrInterpolate(l.fuel_type)}</span></td><td class="px-4 py-3 text-right text-gray-300">${ssrInterpolate(Number(l.quantity_liters).toFixed(2))}</td><td class="px-4 py-3 text-right text-gray-400">${ssrInterpolate(l.price_per_liter ? "\u09F3" + Number(l.price_per_liter).toFixed(2) : "\u2014")}</td><td class="px-4 py-3 text-right font-medium text-gray-200">\u09F3${ssrInterpolate(Number(l.total_amount || 0).toLocaleString())}</td><td class="px-4 py-3 text-right text-gray-400">${ssrInterpolate(l.odometer_reading ? l.odometer_reading.toLocaleString() + " km" : "\u2014")}</td><td class="px-4 py-3 text-right text-emerald-400/80">${ssrInterpolate(calcMileage(l))}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(l.station_name || "\u2014")}</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(logs).length) {
        _push(`<tr><td colspan="10" class="px-4 py-12 text-center text-gray-600">No fuel logs found</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/fuel/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DbexPLVR.mjs.map
