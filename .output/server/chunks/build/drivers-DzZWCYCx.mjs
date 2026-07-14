import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "drivers",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const now = /* @__PURE__ */ new Date();
    const from = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
    const to = ref(now.toISOString().slice(0, 10));
    const url = computed(() => `/api/fleet/reports/drivers?from=${from.value}&to=${to.value}`);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      url,
      "$wS9LwatBF-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const drivers = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.drivers) != null ? _b : [];
    });
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    function completionRate(d) {
      if (!Number(d.total_trips)) return 0;
      return Math.round(Number(d.completed_trips) / Number(d.total_trips) * 100);
    }
    watch(url, () => refresh());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Driver Performance Report",
        breadcrumb: ["Fleet", "Reports", "Driver Performance"]
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
      _push(`<div class="glass-card p-4 flex flex-wrap gap-4 items-end"><div><label class="form-label">From</label><input${ssrRenderAttr("value", unref(from))} type="date" class="form-input"></div><div><label class="form-label">To</label><input${ssrRenderAttr("value", unref(to))} type="date" class="form-input"></div><button class="btn-gold text-xs">Apply</button><button class="btn-secondary text-xs">This Month</button></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500">Active Drivers</p><p class="text-2xl font-bold text-gold-400 mt-1">${ssrInterpolate(unref(drivers).filter((d) => d.total_trips > 0).length)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Trips</p><p class="text-2xl font-bold text-blue-400 mt-1">${ssrInterpolate(unref(drivers).reduce((s, d) => s + Number(d.total_trips), 0))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Total Revenue</p><p class="text-2xl font-bold text-emerald-400 mt-1">\u09F3${ssrInterpolate(fmt(unref(drivers).reduce((s, d) => s + Number(d.total_revenue || 0), 0)))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500">Completed Trips</p><p class="text-2xl font-bold text-teal-400 mt-1">${ssrInterpolate(unref(drivers).reduce((s, d) => s + Number(d.completed_trips), 0))}</p></div></div><div class="glass-card p-5"><h3 class="section-title mb-4">Driver Breakdown</h3><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="pb-2 text-left text-gray-500">Driver</th><th class="pb-2 text-left text-gray-500">Status</th><th class="pb-2 text-right text-gray-500">Trips</th><th class="pb-2 text-right text-gray-500">Completed</th><th class="pb-2 text-right text-gray-500">Cancelled</th><th class="pb-2 text-right text-gray-500">Revenue \u09F3</th><th class="pb-2 text-right text-gray-500">Expenses \u09F3</th><th class="pb-2 text-right text-gray-500">Advances \u09F3</th><th class="pb-2 text-right text-gray-500">Completion %</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(drivers), (d) => {
        var _a;
        _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer"><td class="py-2"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">${ssrInterpolate((_a = d.full_name) == null ? void 0 : _a.charAt(0))}</div><div><p class="text-gray-200">${ssrInterpolate(d.full_name)}</p><p class="text-[10px] text-gray-500">${ssrInterpolate(d.mobile || "\u2014")}</p></div></div></td><td class="py-2">`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: d.status
        }, null, _parent));
        _push(`</td><td class="py-2 text-right text-gray-300">${ssrInterpolate(d.total_trips)}</td><td class="py-2 text-right text-emerald-400">${ssrInterpolate(d.completed_trips)}</td><td class="py-2 text-right text-red-400">${ssrInterpolate(d.cancelled_trips)}</td><td class="py-2 text-right font-medium text-emerald-400">${ssrInterpolate(fmt(d.total_revenue))}</td><td class="py-2 text-right text-red-400">${ssrInterpolate(fmt(d.total_expenses))}</td><td class="py-2 text-right text-amber-400">${ssrInterpolate(fmt(d.total_advances))}</td><td class="py-2 text-right">`);
        if (d.total_trips > 0) {
          _push(`<span class="${ssrRenderClass([completionRate(d) >= 80 ? "text-emerald-400" : completionRate(d) >= 50 ? "text-amber-400" : "text-red-400", "font-medium"])}">${ssrInterpolate(completionRate(d))}% </span>`);
        } else {
          _push(`<span class="text-gray-600">\u2014</span>`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/reports/drivers.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=drivers-DzZWCYCx.mjs.map
