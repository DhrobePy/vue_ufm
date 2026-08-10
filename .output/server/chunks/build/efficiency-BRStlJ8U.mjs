import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
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
  __name: "efficiency",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/fuel/efficiency",
      "$tT55h1AtOi"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicleSummary = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.vehicleSummary) != null ? _b : [];
    });
    const monthlyTrend = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.monthlyTrend) != null ? _b : [];
    });
    const topConsumers = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.topConsumers) != null ? _b : [];
    });
    const fleetStats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.fleetStats) != null ? _b : {};
    });
    const maxMonthlyCost = computed(
      () => Math.max(...monthlyTrend.value.map((m) => Number(m.total_cost || 0)), 1)
    );
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    function formatMonth(m) {
      if (!m) return "\u2014";
      const [y, mo] = m.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[Number(mo) - 1]} ${y}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Fuel Efficiency Report",
        breadcrumb: ["Fleet", "Fuel", "Efficiency"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/fuel",
              class: "btn-secondary text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Fuel Logs`);
                } else {
                  return [
                    createTextVNode("\u2190 Fuel Logs")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
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
                to: "/fleet/fuel",
                class: "btn-secondary text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Fuel Logs")
                ]),
                _: 1
              }),
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
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500">Vehicles Fuelled</p><p class="text-2xl font-bold text-gold-400 mt-1">${ssrInterpolate(unref(fleetStats).vehicles_fuelled || 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Fuel (L)</p><p class="text-2xl font-bold text-blue-400 mt-1">${ssrInterpolate(fmt(unref(fleetStats).total_liters))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Cost</p><p class="text-2xl font-bold text-amber-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(fleetStats).total_cost))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Fleet Avg Mileage</p><p class="text-2xl font-bold text-emerald-400 mt-1">${ssrInterpolate(unref(fleetStats).avg_mileage ? Number(unref(fleetStats).avg_mileage).toFixed(2) : "\u2014")} <span class="text-xs text-gray-500 font-normal">km/L</span></p></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><h3 class="section-title mb-4">Per-Vehicle Efficiency</h3>`);
      if (!unref(vehicleSummary).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No fuel data recorded yet</div>`);
      } else {
        _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Vehicle</th><th class="pb-2 text-right text-gray-500">Fills</th><th class="pb-2 text-right text-gray-500">Total (L)</th><th class="pb-2 text-right text-gray-500">Cost</th><th class="pb-2 text-right text-gray-500">Avg km/L</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(vehicleSummary), (v) => {
          _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02]"><td class="py-2"><p class="font-mono font-bold text-gold-400/80">${ssrInterpolate(v.registration_no)}</p><p class="text-[10px] text-gray-500">${ssrInterpolate(v.vehicle_type)} \xB7 ${ssrInterpolate(v.make)} ${ssrInterpolate(v.model)}</p></td><td class="py-2 text-right text-gray-400">${ssrInterpolate(v.fill_count)}</td><td class="py-2 text-right text-gray-300">${ssrInterpolate(Number(v.total_liters || 0).toFixed(1))}</td><td class="py-2 text-right text-amber-400">\u09F3${ssrInterpolate(fmt(v.total_cost))}</td><td class="py-2 text-right">`);
          if (v.avg_mileage) {
            _push(`<span class="${ssrRenderClass([Number(v.avg_mileage) >= 8 ? "text-emerald-400" : Number(v.avg_mileage) >= 5 ? "text-amber-400" : "text-red-400", "font-bold"])}">${ssrInterpolate(Number(v.avg_mileage).toFixed(2))}</span>`);
          } else {
            _push(`<span class="text-gray-600">\u2014</span>`);
          }
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`</div><div class="glass-card p-5"><h3 class="section-title mb-4">Top Fuel Consumers <span class="text-xs text-gray-500 normal-case font-normal">(Last 90 days)</span></h3>`);
      if (!unref(topConsumers).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No recent fuel data</div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(topConsumers), (v, i) => {
          var _a;
          _push(`<div class="flex items-center gap-3"><div class="${ssrRenderClass([i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-gray-400/20 text-gray-400" : "bg-orange-500/10 text-orange-400", "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"])}">${ssrInterpolate(i + 1)}</div><div class="flex-1"><p class="text-xs font-mono font-bold text-gold-400/80">${ssrInterpolate(v.registration_no)}</p><p class="text-[10px] text-gray-500">${ssrInterpolate(v.vehicle_type)} \xB7 ${ssrInterpolate(v.fill_count)} fills</p></div><div class="text-right"><p class="text-xs font-bold text-blue-400">${ssrInterpolate(Number(v.total_liters || 0).toFixed(1))} L</p><p class="text-[10px] text-amber-400">\u09F3${ssrInterpolate(fmt(v.total_cost))}</p></div><div class="w-20 bg-white/[0.05] rounded-full h-1.5"><div class="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style="${ssrRenderStyle({ width: Number(v.total_liters) / Number(((_a = unref(topConsumers)[0]) == null ? void 0 : _a.total_liters) || 1) * 100 + "%" })}"></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div><div class="glass-card p-5"><h3 class="section-title mb-4">Monthly Fuel Cost Trend <span class="text-xs text-gray-500 normal-case font-normal">(Last 12 months)</span></h3>`);
      if (!unref(monthlyTrend).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No monthly data available</div>`);
      } else {
        _push(`<div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Month</th><th class="pb-2 text-right text-gray-500">Fill-ups</th><th class="pb-2 text-right text-gray-500">Liters</th><th class="pb-2 text-right text-gray-500">Cost (\u09F3)</th><th class="pb-2 text-left text-gray-500 pl-4">Cost Bar</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(monthlyTrend), (m) => {
          _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300 font-medium">${ssrInterpolate(formatMonth(m.month))}</td><td class="py-2 text-right text-gray-400">${ssrInterpolate(m.fill_count)}</td><td class="py-2 text-right text-blue-400">${ssrInterpolate(Number(m.total_liters || 0).toFixed(1))}</td><td class="py-2 text-right text-amber-400 font-medium">\u09F3${ssrInterpolate(fmt(m.total_cost))}</td><td class="py-2 pl-4"><div class="w-full bg-white/[0.05] rounded-full h-2"><div class="h-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400" style="${ssrRenderStyle({ width: Number(m.total_cost) / unref(maxMonthlyCost) * 100 + "%" })}"></div></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      _push(`</div><div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mileage Rating Guide</h4><div class="flex gap-6 flex-wrap text-xs"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span> <span class="text-emerald-400">\u2265 8 km/L</span> <span class="text-gray-500">\u2014 Excellent</span></div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-amber-400 inline-block"></span> <span class="text-amber-400">5\u20138 km/L</span> <span class="text-gray-500">\u2014 Average</span></div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full bg-red-400 inline-block"></span> <span class="text-red-400">&lt; 5 km/L</span> <span class="text-gray-500">\u2014 Poor / Needs Attention</span></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/fuel/efficiency.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=efficiency-BRStlJ8U.mjs.map
