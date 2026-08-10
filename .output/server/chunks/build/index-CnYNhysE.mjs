import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const activeFilter = ref("all");
    const search = ref("");
    const dateFilter = ref("");
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/trips",
      {
        query: computed(() => ({
          status: activeFilter.value === "all" ? "" : activeFilter.value,
          search: search.value,
          date: dateFilter.value
        })),
        watch: [activeFilter, search, dateFilter]
      },
      "$6Hf6P6QGQk"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const trips = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.trips) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const { data: suggData, refresh: refreshSuggestions } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/trips/consolidation-suggestions",
      "$FnYKWXRu2Q"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const suggestions = computed(() => {
      var _a, _b;
      return (_b = (_a = suggData.value) == null ? void 0 : _a.suggestions) != null ? _b : [];
    });
    const dismissing = ref(null);
    function suggKey(s) {
      return `${s.trip_id_a}-${s.trip_id_b}`;
    }
    function routeLabel(t) {
      return `${t.origin || "\u2014"} \u2192 ${t.destination || "\u2014"}`;
    }
    function mt(kg) {
      const n = Number(kg) || 0;
      return `${(n / 1e3).toFixed(1)}MT`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Trip Console",
        breadcrumb: ["Fleet", "Trips"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/trips/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Create Trip`);
                } else {
                  return [
                    createTextVNode("+ Create Trip")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/fleet/trips/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Create Trip")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(suggestions).length) {
        _push(`<div class="glass-card p-4 border border-gold-400/20"><div class="flex items-center gap-2 mb-3"><svg class="w-4 h-4 text-gold-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg><h3 class="text-sm font-semibold text-gray-100">Consolidation Suggestions</h3><span class="badge text-[10px] bg-gold-400/10 text-gold-400">${ssrInterpolate(unref(suggestions).length)}</span></div><div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(suggestions), (s) => {
          _push(`<div class="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.03]"><p class="text-xs text-gray-300 leading-relaxed"> Trip <span class="font-mono font-bold text-gold-400/80">${ssrInterpolate(s.trip_a.trip_number)}</span> (${ssrInterpolate(routeLabel(s.trip_a))}, ${ssrInterpolate(mt(s.trip_a.weight_kg))}) and <span class="font-mono font-bold text-gold-400/80">${ssrInterpolate(s.trip_b.trip_number)}</span> (${ssrInterpolate(routeLabel(s.trip_b))}, ${ssrInterpolate(mt(s.trip_b.weight_kg))}) share ${ssrInterpolate(s.match_on)} on ${ssrInterpolate(s.trip_date)} \u2014 could combine into <span class="text-gray-100 font-medium">${ssrInterpolate(s.vehicle.registration_no)}</span> (capacity ${ssrInterpolate(mt(s.vehicle.weight_capacity_kg))}). Save a trip. </p><button class="btn-ghost text-[10px] shrink-0"${ssrIncludeBooleanAttr(unref(dismissing) === suggKey(s)) ? " disabled" : ""}>${ssrInterpolate(unref(dismissing) === suggKey(s) ? "\u2026" : "Dismiss")}</button></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="${ssrRenderClass([unref(activeFilter) === "all" ? "ring-1 ring-white/20" : "", "glass-card p-4 text-center cursor-pointer"])}"><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total) != null ? _a : 0)}</p><p class="text-xs text-gray-500 mt-1">Total Trips</p></div><div class="${ssrRenderClass([unref(activeFilter) === "today" ? "ring-1 ring-gold-400/40" : "", "glass-card p-4 text-center cursor-pointer"])}"><p class="text-2xl font-bold text-gold-400">${ssrInterpolate((_b = unref(stats).today) != null ? _b : 0)}</p><p class="text-xs text-gray-500 mt-1">Today</p></div><div class="${ssrRenderClass([unref(activeFilter) === "ongoing" ? "ring-1 ring-blue-400/40" : "", "glass-card p-4 text-center cursor-pointer"])}"><p class="text-2xl font-bold text-blue-400">${ssrInterpolate((_c = unref(stats).ongoing) != null ? _c : 0)}</p><p class="text-xs text-gray-500 mt-1">Ongoing</p></div><div class="${ssrRenderClass([unref(activeFilter) === "unreported" ? "ring-1 ring-red-400/40" : "", "glass-card p-4 text-center cursor-pointer"])}"><p class="text-2xl font-bold text-red-400">${ssrInterpolate((_d = unref(stats).unreported) != null ? _d : 0)}</p><p class="text-xs text-gray-500 mt-1">Unreported</p></div></div><div class="flex gap-3 flex-wrap"><div class="relative flex-1 min-w-[200px]"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg><input${ssrRenderAttr("value", unref(search))} type="text" placeholder="Search trip, vehicle, driver, route\u2026" class="form-input pl-9"></div><input${ssrRenderAttr("value", unref(dateFilter))} type="date" class="form-input w-auto"></div><div class="glass-card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="px-4 py-3 text-left text-gray-500 font-medium">Trip #</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Date</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Route</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Customer</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Vehicle</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Driver</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Status</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Report</th><th class="px-4 py-3 text-right text-gray-500 font-medium">Charge</th><th class="px-4 py-3 text-center text-gray-500 font-medium">Actions</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(trips), (t) => {
        _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors"><td class="px-4 py-3 font-mono font-bold text-gold-400/80">${ssrInterpolate(t.trip_number)}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(t.trip_date)}</td><td class="px-4 py-3 text-gray-300"><span class="truncate max-w-[140px] block">${ssrInterpolate(t.origin || "\u2014")} \u2192 ${ssrInterpolate(t.destination || "\u2014")}</span></td><td class="px-4 py-3 text-gray-400 truncate max-w-[100px]">${ssrInterpolate(t.customer_name || "\u2014")}</td><td class="px-4 py-3 font-mono text-gray-300">${ssrInterpolate(t.vehicle_no)}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(t.driver_name)}</td><td class="px-4 py-3">`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: t.trip_status
        }, null, _parent));
        _push(`</td><td class="px-4 py-3"><span class="${ssrRenderClass([t.report_status === "reported" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400", "badge text-[10px]"])}">${ssrInterpolate(t.report_status)}</span></td><td class="px-4 py-3 text-right text-gray-200 font-medium">\u09F3${ssrInterpolate(Number(t.trip_charge || 0).toLocaleString())}</td><td class="px-4 py-3 text-center"><div class="flex justify-center gap-1">`);
        if (t.trip_status === "scheduled") {
          _push(`<button class="px-2 py-1 rounded text-[10px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Start</button>`);
        } else {
          _push(`<!---->`);
        }
        if (t.trip_status === "in_progress") {
          _push(`<button class="px-2 py-1 rounded text-[10px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30">Complete</button>`);
        } else {
          _push(`<!---->`);
        }
        if (t.trip_status === "completed" && t.report_status === "unreported") {
          _push(`<button class="px-2 py-1 rounded text-[10px] bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">Report</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(trips).length) {
        _push(`<tr><td colspan="10" class="px-4 py-12 text-center text-gray-600">No trips found</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/trips/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CnYNhysE.mjs.map
