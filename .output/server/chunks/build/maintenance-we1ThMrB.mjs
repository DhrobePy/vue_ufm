import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "maintenance",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const now = /* @__PURE__ */ new Date();
    const from = ref(`${now.getFullYear()}-01-01`);
    const to = ref(now.toISOString().slice(0, 10));
    const url = computed(() => `/api/fleet/reports/maintenance?from=${from.value}&to=${to.value}`);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      url,
      "$lygLxevZfq"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const byVehicle = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.byVehicle) != null ? _b : [];
    });
    const monthly = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.monthly) != null ? _b : [];
    });
    const requests = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.requests) != null ? _b : [];
    });
    const totalCost = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.totalCost) != null ? _b : 0;
    });
    const maxMonthly = computed(() => Math.max(...monthly.value.map((m) => Number(m.total_cost || 0)), 1));
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    function formatMonth(m) {
      const [y, mo] = m.split("-");
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(mo) - 1] + " " + y;
    }
    watch(url, () => refresh());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Maintenance Summary Report",
        breadcrumb: ["Fleet", "Reports", "Maintenance"]
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
      _push(`<div class="glass-card p-4 flex flex-wrap gap-4 items-end"><div><label class="form-label">From</label><input${ssrRenderAttr("value", unref(from))} type="date" class="form-input"></div><div><label class="form-label">To</label><input${ssrRenderAttr("value", unref(to))} type="date" class="form-input"></div><button class="btn-gold text-xs">Apply</button><button class="btn-secondary text-xs">This Year</button></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Requests</p><p class="text-2xl font-bold text-gold-400 mt-1">${ssrInterpolate(unref(requests).length)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Cost</p><p class="text-2xl font-bold text-red-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(totalCost)))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Corrective</p><p class="text-2xl font-bold text-amber-400 mt-1">${ssrInterpolate(unref(requests).filter((r) => r.repair_type === "corrective").length)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Preventive</p><p class="text-2xl font-bold text-blue-400 mt-1">${ssrInterpolate(unref(requests).filter((r) => r.repair_type === "preventive").length)}</p></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><h3 class="section-title mb-4">Cost by Vehicle</h3>`);
      if (!unref(byVehicle).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No maintenance data for this period</div>`);
      } else {
        _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Vehicle</th><th class="pb-2 text-right text-gray-500">Requests</th><th class="pb-2 text-right text-gray-500">C / P</th><th class="pb-2 text-right text-gray-500">Cost \u09F3</th><th class="pb-2 text-left text-gray-500">Last Service</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(byVehicle), (v) => {
          _push(`<tr class="border-b border-white/[0.03]"><td class="py-2"><p class="font-mono font-bold text-gold-400/80">${ssrInterpolate(v.registration_no)}</p><p class="text-[10px] text-gray-500">${ssrInterpolate(v.vehicle_type)}</p></td><td class="py-2 text-right text-gray-300">${ssrInterpolate(v.total_requests)}</td><td class="py-2 text-right text-gray-400">${ssrInterpolate(v.corrective)} / ${ssrInterpolate(v.preventive)}</td><td class="py-2 text-right font-bold text-red-400">\u09F3${ssrInterpolate(fmt(v.total_cost))}</td><td class="py-2 text-gray-400">${ssrInterpolate(v.last_service || "\u2014")}</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`</div><div class="glass-card p-5"><h3 class="section-title mb-4">Monthly Trend</h3>`);
      if (!unref(monthly).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No data for this period</div>`);
      } else {
        _push(`<div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(monthly), (m) => {
          _push(`<div class="flex items-center gap-3 text-xs"><span class="w-16 text-gray-400 shrink-0">${ssrInterpolate(formatMonth(m.month))}</span><div class="flex-1"><div class="w-full bg-white/[0.05] rounded-full h-2"><div class="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400" style="${ssrRenderStyle({ width: Number(m.total_cost) / unref(maxMonthly) * 100 + "%" })}"></div></div></div><span class="w-24 text-right text-orange-400 font-medium shrink-0">\u09F3${ssrInterpolate(fmt(m.total_cost))}</span><span class="w-10 text-right text-gray-500 shrink-0">${ssrInterpolate(m.requests)}x</span></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></div><div class="glass-card p-5"><h3 class="section-title mb-4">All Maintenance Requests</h3>`);
      if (!unref(requests).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No requests found for this period</div>`);
      } else {
        _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="pb-2 text-left text-gray-500">Request No</th><th class="pb-2 text-left text-gray-500">Date</th><th class="pb-2 text-left text-gray-500">Vehicle</th><th class="pb-2 text-left text-gray-500">Type</th><th class="pb-2 text-left text-gray-500">Station</th><th class="pb-2 text-right text-gray-500">Cost \u09F3</th><th class="pb-2 text-left text-gray-500">Status</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(requests), (r) => {
          _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer"><td class="py-2 font-mono font-bold text-gold-400/80">${ssrInterpolate(r.request_no)}</td><td class="py-2 text-gray-400">${ssrInterpolate(r.request_date)}</td><td class="py-2 font-mono text-gray-300">${ssrInterpolate(r.vehicle_no)}</td><td class="py-2"><span class="${ssrRenderClass([r.repair_type === "preventive" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400", "badge text-[10px]"])}">${ssrInterpolate(r.repair_type)}</span></td><td class="py-2 text-gray-400">${ssrInterpolate(r.station_supplier || "\u2014")}</td><td class="py-2 text-right font-medium text-red-400">\u09F3${ssrInterpolate(fmt(r.total_cost))}</td><td class="py-2">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: r.status
          }, null, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/reports/maintenance.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=maintenance-we1ThMrB.mjs.map
