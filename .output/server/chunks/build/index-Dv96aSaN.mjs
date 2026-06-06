import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, unref, mergeProps, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const id = Number(route.params.id);
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/fleet/vehicles/${id}`,
      "$jhUTKTkJUQ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicle = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.vehicle) != null ? _b : null;
    });
    const documents = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.documents) != null ? _b : [];
    });
    const trips = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.trips) != null ? _b : [];
    });
    const fuel = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.fuel) != null ? _b : [];
    });
    const maintenance = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.maintenance) != null ? _b : [];
    });
    const tyres = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.tyres) != null ? _b : [];
    });
    const activeTab = ref("summary");
    const tabs = [
      { key: "summary", label: "Summary" },
      { key: "documents", label: "Documents" },
      { key: "trips", label: "Trips" },
      { key: "fuel", label: "Fuel" },
      { key: "maintenance", label: "Maintenance" },
      { key: "tyres", label: "Tyres" }
    ];
    const vehicleFields = computed(() => {
      const v = vehicle.value;
      if (!v) return [];
      return [
        { label: "Registration No", value: v.registration_no },
        { label: "Type", value: v.vehicle_type },
        { label: "Make / Model", value: `${v.make || "\u2014"} / ${v.model || "\u2014"}` },
        { label: "Engine No", value: v.engine_no },
        { label: "Chassis No", value: v.chassis_no },
        { label: "Year", value: v.year_of_mfg },
        { label: "Fuel Type", value: v.fuel_type },
        { label: "Ownership", value: v.ownership_type },
        { label: "Capacity", value: v.weight_capacity_kg ? (v.weight_capacity_kg / 1e3).toFixed(1) + " MT" : null },
        { label: "Odometer", value: v.current_odometer ? v.current_odometer.toLocaleString() + " km" : null },
        { label: "Status", value: v.status }
      ];
    });
    function isExpired(d) {
      return d && new Date(d) < /* @__PURE__ */ new Date();
    }
    function isExpiringSoon(d) {
      if (!d) return false;
      const diff = (new Date(d).getTime() - Date.now()) / 864e5;
      return diff >= 0 && diff <= 30;
    }
    function tripDot(s) {
      var _a;
      return (_a = { in_progress: "bg-blue-400", scheduled: "bg-amber-400", completed: "bg-emerald-400", cancelled: "bg-red-400", closed: "bg-gray-500" }[s]) != null ? _a : "bg-gray-500";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      if (unref(vehicle)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(vehicle).registration_no,
          subtitle: `${unref(vehicle).make || ""} ${unref(vehicle).model || ""} \xB7 ${unref(vehicle).vehicle_type}`,
          breadcrumb: ["Fleet", "Vehicles", unref(vehicle).registration_no]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, {
                status: unref(vehicle).status
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/fleet/vehicles/${unref(id)}/edit`,
                class: "btn-secondary text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Edit`);
                  } else {
                    return [
                      createTextVNode("Edit")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, {
                  status: unref(vehicle).status
                }, null, 8, ["status"]),
                createVNode(_component_NuxtLink, {
                  to: `/fleet/vehicles/${unref(id)}/edit`,
                  class: "btn-secondary text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Edit")
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="flex gap-1 border-b border-white/[0.07]"><!--[-->`);
        ssrRenderList(tabs, (tab) => {
          _push(`<button class="${ssrRenderClass([unref(activeTab) === tab.key ? "text-gold-400 border-b-2 border-gold-400" : "text-gray-500 hover:text-gray-300", "px-4 py-2 text-xs font-medium transition-colors rounded-t-lg"])}">${ssrInterpolate(tab.label)}</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(activeTab) === "summary") {
          _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><h3 class="section-title mb-4">Vehicle Details</h3><dl class="space-y-3"><!--[-->`);
          ssrRenderList(unref(vehicleFields), (row) => {
            _push(`<div class="flex justify-between text-sm"><dt class="text-gray-500">${ssrInterpolate(row.label)}</dt><dd class="text-gray-200 font-medium">${ssrInterpolate(row.value || "\u2014")}</dd></div>`);
          });
          _push(`<!--]--></dl></div><div class="glass-card p-5"><h3 class="section-title mb-4">Assigned Driver</h3>`);
          if (unref(vehicle).driver_name) {
            _push(`<div class="space-y-3"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">${ssrInterpolate((_a = unref(vehicle).driver_name) == null ? void 0 : _a.charAt(0))}</div><div><p class="text-sm font-medium text-gray-200">${ssrInterpolate(unref(vehicle).driver_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(vehicle).driver_mobile || "No mobile")}</p></div></div></div>`);
          } else {
            _push(`<div class="text-center py-4 text-gray-600 text-sm">No driver assigned</div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "documents") {
          _push(`<div><div class="glass-card p-5"><h3 class="section-title mb-4">Vehicle Documents</h3>`);
          if (!unref(documents).length) {
            _push(`<div class="text-center py-6 text-gray-600 text-sm">No documents recorded</div>`);
          } else {
            _push(`<div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500 font-medium">Document Type</th><th class="pb-2 text-left text-gray-500 font-medium">Document No</th><th class="pb-2 text-left text-gray-500 font-medium">Issue Date</th><th class="pb-2 text-left text-gray-500 font-medium">Expiry Date</th><th class="pb-2 text-left text-gray-500 font-medium">Authority</th><th class="pb-2 text-left text-gray-500 font-medium">Status</th></tr></thead><tbody><!--[-->`);
            ssrRenderList(unref(documents), (d) => {
              _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300 font-medium">${ssrInterpolate(d.document_type)}</td><td class="py-2 font-mono text-gray-400">${ssrInterpolate(d.document_no || "\u2014")}</td><td class="py-2 text-gray-400">${ssrInterpolate(d.issue_date || "\u2014")}</td><td class="${ssrRenderClass([isExpiringSoon(d.expiry_date) ? "text-amber-400 font-medium" : isExpired(d.expiry_date) ? "text-red-400 font-medium" : "text-gray-400", "py-2"])}">${ssrInterpolate(d.expiry_date || "\u2014")}</td><td class="py-2 text-gray-400">${ssrInterpolate(d.issuing_authority || "\u2014")}</td><td class="py-2"><span class="${ssrRenderClass([isExpired(d.expiry_date) ? "bg-red-500/10 text-red-400" : isExpiringSoon(d.expiry_date) ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400", "badge"])}">${ssrInterpolate(isExpired(d.expiry_date) ? "Expired" : isExpiringSoon(d.expiry_date) ? "Expiring Soon" : "Valid")}</span></td></tr>`);
            });
            _push(`<!--]--></tbody></table></div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "trips") {
          _push(`<div><div class="glass-card p-5"><h3 class="section-title mb-4">Trip History</h3>`);
          if (!unref(trips).length) {
            _push(`<div class="text-center py-6 text-gray-600 text-sm">No trips recorded</div>`);
          } else {
            _push(`<div class="space-y-2"><!--[-->`);
            ssrRenderList(unref(trips), (t) => {
              _push(`<div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer"><div class="${ssrRenderClass([tripDot(t.trip_status), "w-2 h-2 rounded-full"])}"></div><div class="flex-1"><p class="text-xs font-mono font-bold text-gold-400/80">${ssrInterpolate(t.trip_number)}</p><p class="text-[11px] text-gray-500">${ssrInterpolate(t.origin)} \u2192 ${ssrInterpolate(t.destination)} \xB7 ${ssrInterpolate(t.driver_name)}</p></div><div class="text-right"><p class="text-xs font-medium text-gray-300">\u09F3${ssrInterpolate(Number(t.trip_charge || 0).toLocaleString())}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(t.trip_date)}</p></div>`);
              _push(ssrRenderComponent(_component_UiStatusBadge, {
                status: t.trip_status
              }, null, _parent));
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "fuel") {
          _push(`<div><div class="glass-card p-5"><h3 class="section-title mb-4">Fuel History</h3>`);
          if (!unref(fuel).length) {
            _push(`<div class="text-center py-6 text-gray-600 text-sm">No fuel logs recorded</div>`);
          } else {
            _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Date</th><th class="pb-2 text-left text-gray-500">Fuel Type</th><th class="pb-2 text-right text-gray-500">Qty (L)</th><th class="pb-2 text-right text-gray-500">Rate</th><th class="pb-2 text-right text-gray-500">Amount</th><th class="pb-2 text-right text-gray-500">Odometer</th><th class="pb-2 text-left text-gray-500">Station</th></tr></thead><tbody><!--[-->`);
            ssrRenderList(unref(fuel), (f) => {
              _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-400">${ssrInterpolate(f.fuel_date)}</td><td class="py-2"><span class="badge bg-blue-500/10 text-blue-400 text-[10px]">${ssrInterpolate(f.fuel_type)}</span></td><td class="py-2 text-right text-gray-300">${ssrInterpolate(f.quantity_liters)}</td><td class="py-2 text-right text-gray-400">\u09F3${ssrInterpolate(Number(f.price_per_liter || 0).toFixed(2))}</td><td class="py-2 text-right font-medium text-gray-200">\u09F3${ssrInterpolate(Number(f.total_amount || 0).toLocaleString())}</td><td class="py-2 text-right text-gray-400">${ssrInterpolate(f.odometer_reading ? f.odometer_reading.toLocaleString() + " km" : "\u2014")}</td><td class="py-2 text-gray-400">${ssrInterpolate(f.station_name || "\u2014")}</td></tr>`);
            });
            _push(`<!--]--></tbody></table>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "maintenance") {
          _push(`<div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h3 class="section-title">Maintenance History</h3>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/fleet/maintenance/create?vehicle_id=${unref(id)}`,
            class: "btn-gold text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`+ Log Maintenance`);
              } else {
                return [
                  createTextVNode("+ Log Maintenance")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
          if (!unref(maintenance).length) {
            _push(`<div class="text-center py-6 text-gray-600 text-sm">No maintenance records</div>`);
          } else {
            _push(`<div class="space-y-2"><!--[-->`);
            ssrRenderList(unref(maintenance), (m) => {
              _push(`<div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03]"><div class="flex-1"><div class="flex items-center gap-2"><p class="text-xs font-mono font-bold text-gold-400/80">${ssrInterpolate(m.request_no)}</p><span class="${ssrRenderClass([m.repair_type === "preventive" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400", "badge text-[10px]"])}">${ssrInterpolate(m.repair_type)}</span></div><p class="text-[11px] text-gray-500 mt-0.5">${ssrInterpolate(m.station_supplier || "No station")} \xB7 ${ssrInterpolate(m.request_date)}</p></div><div class="text-right"><p class="text-xs font-medium text-gray-200">\u09F3${ssrInterpolate(Number(m.total_cost || 0).toLocaleString())}</p></div>`);
              _push(ssrRenderComponent(_component_UiStatusBadge, {
                status: m.status
              }, null, _parent));
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "tyres") {
          _push(`<div><div class="glass-card p-5"><h3 class="section-title mb-4">Tyre History</h3>`);
          if (!unref(tyres).length) {
            _push(`<div class="text-center py-6 text-gray-600 text-sm">No tyre records</div>`);
          } else {
            _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Position</th><th class="pb-2 text-left text-gray-500">Brand/Size</th><th class="pb-2 text-left text-gray-500">Fitted</th><th class="pb-2 text-left text-gray-500">Removed</th><th class="pb-2 text-right text-gray-500">Cost</th></tr></thead><tbody><!--[-->`);
            ssrRenderList(unref(tyres), (t) => {
              _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300">${ssrInterpolate(t.position || "\u2014")}</td><td class="py-2 text-gray-400">${ssrInterpolate(t.brand)} ${ssrInterpolate(t.size)}</td><td class="py-2 text-gray-400">${ssrInterpolate(t.fitted_date || "\u2014")}</td><td class="py-2 text-gray-400">${ssrInterpolate(t.removed_date || "In use")}</td><td class="py-2 text-right text-gray-200">${ssrInterpolate(t.cost ? "\u09F3" + Number(t.cost).toLocaleString() : "\u2014")}</td></tr>`);
            });
            _push(`<!--]--></tbody></table>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/vehicles/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Dv96aSaN.mjs.map
