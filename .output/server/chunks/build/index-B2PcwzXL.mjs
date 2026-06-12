import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-C6rBgLMJ.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/dashboard",
      "$q-4jtHv7Ed"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a;
      return (_a = data.value) != null ? _a : {};
    });
    const activeTrips = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.active_trips) != null ? _b : [];
    });
    const recentMaintenance = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recent_maintenance) != null ? _b : [];
    });
    const alerts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.alerts) != null ? _b : [];
    });
    const fleetStatus = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      const v = (_b = (_a = stats.value) == null ? void 0 : _a.vehicles) != null ? _b : {};
      return [
        { label: "Available", value: (_c = v.available) != null ? _c : 0, dot: "bg-emerald-500" },
        { label: "On Trip", value: (_d = v.busy) != null ? _d : 0, dot: "bg-blue-500" },
        { label: "In Repair", value: (_e = v.repair) != null ? _e : 0, dot: "bg-red-500" },
        { label: "Inactive", value: (_f = v.inactive) != null ? _f : 0, dot: "bg-gray-600" }
      ];
    });
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    function fmtK(n) {
      const v = Number(n || 0);
      if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
      if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
      return v.toLocaleString("en-BD");
    }
    function tripDot(s) {
      var _a;
      return (_a = {
        "in_progress": "bg-blue-400",
        "scheduled": "bg-amber-400",
        "completed": "bg-emerald-400",
        "cancelled": "bg-red-400",
        "closed": "bg-gray-500"
      }[s]) != null ? _a : "bg-gray-500";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Fleet Operations",
        subtitle: "Real-time fleet dashboard \xB7 vehicles \xB7 drivers \xB7 trips",
        breadcrumb: ["Fleet"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/trips/create",
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
                to: "/fleet/trips/create",
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
        value: String((_b = (_a = unref(stats).vehicles) == null ? void 0 : _a.available) != null ? _b : 0),
        trend: `${(_d = (_c = unref(stats).vehicles) == null ? void 0 : _c.total) != null ? _d : 0} total fleet`,
        "trend-up": "",
        icon: "truck",
        color: "teal"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Trips in Transit",
        value: String((_f = (_e = unref(stats).trips) == null ? void 0 : _e.ongoing) != null ? _f : 0),
        trend: `${(_h = (_g = unref(stats).trips) == null ? void 0 : _g.today) != null ? _h : 0} today`,
        "trend-up": "",
        icon: "list",
        color: "blue"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Completed Today",
        value: String((_j = (_i = unref(stats).trips) == null ? void 0 : _i.completed_today) != null ? _j : 0),
        trend: `\u09F3${fmtK((_k = unref(stats).trips) == null ? void 0 : _k.revenue_today)} revenue`,
        "trend-up": "",
        icon: "check",
        color: "gold"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Pending Settlements",
        value: String((_m = (_l = unref(stats).trips) == null ? void 0 : _l.unreported) != null ? _m : 0),
        trend: ((_n = unref(stats).maintenance) == null ? void 0 : _n.pending) > 0 ? `${unref(stats).maintenance.pending} maintenance pending` : "All clear",
        "trend-up": !(((_o = unref(stats).trips) == null ? void 0 : _o.unreported) > 0),
        icon: "money",
        color: "orange"
      }, null, _parent));
      _push(`</div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center"><div class="text-2xl font-bold text-emerald-400">${ssrInterpolate((_q = (_p = unref(stats).vehicles) == null ? void 0 : _p.busy) != null ? _q : 0)}</div><div class="text-xs text-gray-500 mt-1">Vehicles On Trip</div></div><div class="glass-card p-4 text-center"><div class="text-2xl font-bold text-red-400">${ssrInterpolate((_s = (_r = unref(stats).vehicles) == null ? void 0 : _r.repair) != null ? _s : 0)}</div><div class="text-xs text-gray-500 mt-1">In Maintenance</div></div><div class="glass-card p-4 text-center"><div class="text-2xl font-bold text-blue-400">${ssrInterpolate((_u = (_t = unref(stats).drivers) == null ? void 0 : _t.active) != null ? _u : 0)}</div><div class="text-xs text-gray-500 mt-1">Active Drivers</div></div><div class="glass-card p-4 text-center"><div class="text-2xl font-bold text-amber-400">\u09F3${ssrInterpolate(fmtK((_v = unref(stats).fuel) == null ? void 0 : _v.this_month_cost))}</div><div class="text-xs text-gray-500 mt-1">Fuel This Month</div></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Active &amp; Today&#39;s Trips</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/trips",
        class: "text-xs text-gold-400/80 hover:text-gold-400"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`View all \u2192`);
          } else {
            return [
              createTextVNode("View all \u2192")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="space-y-2">`);
      if (!unref(activeTrips).length) {
        _push(`<div class="text-center py-6 text-gray-600 text-sm">No active trips today</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(activeTrips), (t) => {
        _push(`<div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"><div class="${ssrRenderClass([tripDot(t.trip_status), "w-2 h-2 rounded-full shrink-0"])}"></div><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-xs font-bold text-gold-400/80 font-mono">${ssrInterpolate(t.trip_number)}</span>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: t.trip_status
        }, null, _parent));
        _push(`</div><p class="text-xs text-gray-400 truncate mt-0.5">${ssrInterpolate(t.origin || "\u2014")} \u2192 ${ssrInterpolate(t.destination || "\u2014")}</p><p class="text-[11px] text-gray-600">${ssrInterpolate(t.vehicle_no)} \xB7 ${ssrInterpolate(t.driver_name)}</p></div><div class="text-right shrink-0"><p class="text-xs font-medium text-gray-300">\u09F3${ssrInterpolate(fmt(t.trip_charge))}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(t.trip_date)}</p></div></div>`);
      });
      _push(`<!--]--></div></div><div class="space-y-4"><div class="glass-card p-4"><h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fleet Status</h3><div class="space-y-2"><!--[-->`);
      ssrRenderList(unref(fleetStatus), (item) => {
        _push(`<div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="${ssrRenderClass([item.dot, "w-2 h-2 rounded-full"])}"></div><span class="text-xs text-gray-400">${ssrInterpolate(item.label)}</span></div><span class="text-xs font-bold text-gray-200">${ssrInterpolate(item.value)}</span></div>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-4"><h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Critical Alerts</h3>`);
      if (!unref(alerts).length) {
        _push(`<div class="text-center py-3 text-gray-600 text-xs">No critical alerts</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(alerts).slice(0, 5), (a) => {
        _push(`<div class="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-2"><p class="text-xs font-medium text-red-300">${ssrInterpolate(a.title)}</p><p class="text-[10px] text-red-400/70 mt-0.5">Expires: ${ssrInterpolate(a.due_date)} (${ssrInterpolate(a.days_remaining)}d)</p></div>`);
      });
      _push(`<!--]--></div><div class="glass-card p-4"><h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3><div class="space-y-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/trips/create",
        class: "btn-gold w-full text-xs text-center block py-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`+ Create Trip`);
          } else {
            return [
              createTextVNode("+ Create Trip")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/vehicles",
        class: "btn-secondary w-full text-xs text-center block py-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`View Vehicles`);
          } else {
            return [
              createTextVNode("View Vehicles")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/maintenance/create",
        class: "btn-secondary w-full text-xs text-center block py-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Log Maintenance`);
          } else {
            return [
              createTextVNode("Log Maintenance")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/fuel/create",
        class: "btn-secondary w-full text-xs text-center block py-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Log Fuel`);
          } else {
            return [
              createTextVNode("Log Fuel")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div>`);
      if (unref(recentMaintenance).length) {
        _push(`<div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Ongoing Maintenance</h2>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/fleet/maintenance",
          class: "text-xs text-gold-400/80 hover:text-gold-400"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`View all \u2192`);
            } else {
              return [
                createTextVNode("View all \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500 font-medium">Request #</th><th class="pb-2 text-left text-gray-500 font-medium">Vehicle</th><th class="pb-2 text-left text-gray-500 font-medium">Type</th><th class="pb-2 text-left text-gray-500 font-medium">Station</th><th class="pb-2 text-left text-gray-500 font-medium">Status</th><th class="pb-2 text-right text-gray-500 font-medium">Cost</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(recentMaintenance), (m) => {
          _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02]"><td class="py-2 font-mono text-gold-400/80">${ssrInterpolate(m.request_no)}</td><td class="py-2 text-gray-300">${ssrInterpolate(m.vehicle_no)}</td><td class="py-2"><span class="${ssrRenderClass([m.repair_type === "preventive" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400", "badge"])}">${ssrInterpolate(m.repair_type)}</span></td><td class="py-2 text-gray-400">${ssrInterpolate(m.station_supplier || "\u2014")}</td><td class="py-2">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: m.status
          }, null, _parent));
          _push(`</td><td class="py-2 text-right text-gray-300">\u09F3${ssrInterpolate(fmt(m.total_cost))}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B2PcwzXL.mjs.map
