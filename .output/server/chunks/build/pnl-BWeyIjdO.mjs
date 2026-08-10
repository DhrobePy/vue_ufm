import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
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
  __name: "pnl",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const year = ref((/* @__PURE__ */ new Date()).getFullYear());
    const url = computed(() => `/api/fleet/reports/pnl?year=${year.value}`);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      url,
      "$Z45rat4fbI"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.rows) != null ? _b : [];
    });
    const totals = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.totals) != null ? _b : { revenue: 0, trip_expenses: 0, fuel_cost: 0, maint_cost: 0, total_cost: 0, profit: 0 };
    });
    const years = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.years) != null ? _b : [(/* @__PURE__ */ new Date()).getFullYear()];
    });
    const margin = computed(() => totals.value.revenue > 0 ? totals.value.profit / totals.value.revenue * 100 : 0);
    const maxBar = computed(() => Math.max(...rows.value.map((r) => Math.max(Number(r.revenue), Number(r.total_cost))), 1));
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    function formatMonth(m) {
      const [, mo] = m.split("-");
      return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(mo) - 1];
    }
    watch(url, () => refresh());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Monthly P&L Report",
        breadcrumb: ["Fleet", "Reports", "Monthly P&L"]
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
      _push(`<div class="glass-card p-4 flex flex-wrap gap-4 items-end"><div><label class="form-label">Year</label><select class="form-input w-32"><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(year)) ? ssrLooseContain(unref(year), y) : ssrLooseEqual(unref(year), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select></div><button class="btn-gold text-xs">Apply</button></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500">Annual Revenue</p><p class="text-2xl font-bold text-emerald-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(totals).revenue))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Costs</p><p class="text-2xl font-bold text-red-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(totals).total_cost))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Net Profit / Loss</p><p class="${ssrRenderClass([unref(totals).profit >= 0 ? "text-blue-400" : "text-red-400", "text-2xl font-bold mt-1"])}">\u09F3${ssrInterpolate(fmt(unref(totals).profit))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Profit Margin</p><p class="${ssrRenderClass([unref(margin) >= 0 ? "text-teal-400" : "text-red-400", "text-2xl font-bold mt-1"])}">${ssrInterpolate(unref(totals).revenue > 0 ? unref(margin).toFixed(1) + "%" : "\u2014")}</p></div></div><div class="grid grid-cols-3 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500">Trip Expenses</p><p class="text-xl font-bold text-orange-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(totals).trip_expenses))}</p><p class="text-[10px] text-gray-600 mt-1">${ssrInterpolate(unref(totals).revenue > 0 ? (unref(totals).trip_expenses / unref(totals).revenue * 100).toFixed(1) : 0)}% of revenue</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Fuel Cost</p><p class="text-xl font-bold text-amber-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(totals).fuel_cost))}</p><p class="text-[10px] text-gray-600 mt-1">${ssrInterpolate(unref(totals).revenue > 0 ? (unref(totals).fuel_cost / unref(totals).revenue * 100).toFixed(1) : 0)}% of revenue</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Maintenance Cost</p><p class="text-xl font-bold text-red-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(totals).maint_cost))}</p><p class="text-[10px] text-gray-600 mt-1">${ssrInterpolate(unref(totals).revenue > 0 ? (unref(totals).maint_cost / unref(totals).revenue * 100).toFixed(1) : 0)}% of revenue</p></div></div><div class="glass-card p-5"><h3 class="section-title mb-4">Month-by-Month Breakdown \u2014 ${ssrInterpolate(unref(year))}</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="pb-2 text-left text-gray-500">Month</th><th class="pb-2 text-right text-gray-500">Revenue \u09F3</th><th class="pb-2 text-right text-gray-500">Trip Exp \u09F3</th><th class="pb-2 text-right text-gray-500">Fuel \u09F3</th><th class="pb-2 text-right text-gray-500">Maint \u09F3</th><th class="pb-2 text-right text-gray-500">Total Cost \u09F3</th><th class="pb-2 text-right text-gray-500">Profit \u09F3</th><th class="pb-2 text-left text-gray-500 pl-4">Visual</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(rows), (r) => {
        _push(`<tr class="${ssrRenderClass([r.revenue === 0 && r.total_cost === 0 ? "opacity-30" : "", "border-b border-white/[0.03]"])}"><td class="py-2 text-gray-300 font-medium">${ssrInterpolate(formatMonth(r.month))}</td><td class="py-2 text-right text-emerald-400 font-medium">${ssrInterpolate(r.revenue > 0 ? fmt(r.revenue) : "\u2014")}</td><td class="py-2 text-right text-orange-400">${ssrInterpolate(r.trip_expenses > 0 ? fmt(r.trip_expenses) : "\u2014")}</td><td class="py-2 text-right text-amber-400">${ssrInterpolate(r.fuel_cost > 0 ? fmt(r.fuel_cost) : "\u2014")}</td><td class="py-2 text-right text-red-400">${ssrInterpolate(r.maint_cost > 0 ? fmt(r.maint_cost) : "\u2014")}</td><td class="py-2 text-right text-gray-300">${ssrInterpolate(r.total_cost > 0 ? fmt(r.total_cost) : "\u2014")}</td><td class="${ssrRenderClass([r.profit > 0 ? "text-blue-400" : r.profit < 0 ? "text-red-400" : "text-gray-600", "py-2 text-right font-bold"])}">${ssrInterpolate(r.revenue > 0 || r.total_cost > 0 ? (r.profit >= 0 ? "" : "\u2212") + fmt(Math.abs(r.profit)) : "\u2014")}</td><td class="py-2 pl-4">`);
        if (r.revenue > 0 || r.total_cost > 0) {
          _push(`<div class="flex gap-1 items-center h-4"><div class="h-3 rounded-sm bg-emerald-500/60" style="${ssrRenderStyle({ width: Number(r.revenue) / unref(maxBar) * 80 + "px" })}"${ssrRenderAttr("title", `Revenue: \u09F3${fmt(r.revenue)}`)}></div><div class="h-3 rounded-sm bg-red-500/60" style="${ssrRenderStyle({ width: Number(r.total_cost) / unref(maxBar) * 80 + "px" })}"${ssrRenderAttr("title", `Cost: \u09F3${fmt(r.total_cost)}`)}></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody><tfoot><tr class="border-t-2 border-white/[0.10]"><td class="pt-3 font-bold text-gray-200">Annual Total</td><td class="pt-3 text-right font-bold text-emerald-400">\u09F3${ssrInterpolate(fmt(unref(totals).revenue))}</td><td class="pt-3 text-right font-bold text-orange-400">\u09F3${ssrInterpolate(fmt(unref(totals).trip_expenses))}</td><td class="pt-3 text-right font-bold text-amber-400">\u09F3${ssrInterpolate(fmt(unref(totals).fuel_cost))}</td><td class="pt-3 text-right font-bold text-red-400">\u09F3${ssrInterpolate(fmt(unref(totals).maint_cost))}</td><td class="pt-3 text-right font-bold text-gray-200">\u09F3${ssrInterpolate(fmt(unref(totals).total_cost))}</td><td class="${ssrRenderClass([unref(totals).profit >= 0 ? "text-blue-400" : "text-red-400", "pt-3 text-right font-bold text-xl"])}"> \u09F3${ssrInterpolate(fmt(unref(totals).profit))}</td><td></td></tr></tfoot></table></div></div><div class="glass-card p-4 flex gap-6 text-xs flex-wrap"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-emerald-500/60 inline-block"></span> Revenue</div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-orange-500/60 inline-block"></span> Trip Expenses</div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-amber-500/60 inline-block"></span> Fuel Cost</div><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-red-500/60 inline-block"></span> Maintenance Cost</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/reports/pnl.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pnl-BWeyIjdO.mjs.map
