import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
    const statusFilter = ref("");
    const statuses = [
      { v: "", l: "All" },
      { v: "pending", l: "Pending" },
      { v: "in_progress", l: "In Progress" },
      { v: "completed", l: "Completed" },
      { v: "cancelled", l: "Cancelled" }
    ];
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/maintenance",
      {
        query: computed(() => ({ status: statusFilter.value })),
        watch: [statusFilter]
      },
      "$Jf__lzLtz4"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const requests = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.requests) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    function fmtK(n) {
      const v = Number(n || 0);
      if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
      if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
      return v.toLocaleString();
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Maintenance",
        breadcrumb: ["Fleet", "Maintenance"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/maintenance/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Log Maintenance`);
                } else {
                  return [
                    createTextVNode("+ Log Maintenance")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/fleet/maintenance/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Log Maintenance")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total) != null ? _a : 0)}</p><p class="text-xs text-gray-500 mt-1">Total Requests</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-amber-400">${ssrInterpolate((_b = unref(stats).pending) != null ? _b : 0)}</p><p class="text-xs text-gray-500 mt-1">Pending</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-blue-400">${ssrInterpolate((_c = unref(stats).in_progress) != null ? _c : 0)}</p><p class="text-xs text-gray-500 mt-1">In Progress</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gold-400">\u09F3${ssrInterpolate(fmtK(unref(stats).this_month_cost))}</p><p class="text-xs text-gray-500 mt-1">This Month Cost</p></div></div><div class="flex gap-2"><!--[-->`);
      ssrRenderList(statuses, (s) => {
        _push(`<button class="${ssrRenderClass([unref(statusFilter) === s.v ? "bg-gold-500/20 text-gold-400" : "bg-white/[0.04] text-gray-500 hover:text-gray-300", "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"])}">${ssrInterpolate(s.l)}</button>`);
      });
      _push(`<!--]--></div><div class="glass-card overflow-hidden"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="px-4 py-3 text-left text-gray-500 font-medium">Request #</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Date</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Vehicle</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Type</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Station / Supplier</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Status</th><th class="px-4 py-3 text-right text-gray-500 font-medium">Total Cost</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(requests), (r) => {
        _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer"><td class="px-4 py-3 font-mono font-bold text-gold-400/80">${ssrInterpolate(r.request_no)}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(r.request_date)}</td><td class="px-4 py-3 font-mono text-gray-300">${ssrInterpolate(r.vehicle_no)}</td><td class="px-4 py-3"><span class="${ssrRenderClass([r.repair_type === "preventive" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400", "badge text-[10px]"])}">${ssrInterpolate(r.repair_type)}</span></td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(r.station_supplier || "\u2014")}</td><td class="px-4 py-3">`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: r.status
        }, null, _parent));
        _push(`</td><td class="px-4 py-3 text-right font-medium text-gray-200">\u09F3${ssrInterpolate(Number(r.total_cost || 0).toLocaleString())}</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(requests).length) {
        _push(`<tr><td colspan="7" class="px-4 py-12 text-center text-gray-600">No maintenance records found</td></tr>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/maintenance/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BNYULlAf.mjs.map
