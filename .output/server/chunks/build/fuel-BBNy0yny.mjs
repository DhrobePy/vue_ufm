import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import { c as _export_sfc } from './server.mjs';
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
import '@vue/shared';
import 'perfect-debounce';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "fuel",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const showAddModal = ref(false);
    const filterVehicle = ref("");
    ref(false);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/logistics/fuel",
      "$2DPsE4omeB"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const fuelStats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const fuelLogs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.logs) != null ? _b : [];
    });
    const { data: vData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/logistics/vehicles",
      "$PKcM3L-wno"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const cols = [
      { key: "vehicle", label: "Vehicle", sortable: true },
      { key: "date", label: "Date", sortable: true },
      { key: "quantity_liters", label: "Litres", sortable: true },
      { key: "price_per_liter", label: "\u09F3/Litre" },
      { key: "total_cost", label: "Total", sortable: true },
      { key: "station_name", label: "Vendor" }
    ];
    const filteredLogs = computed(
      () => filterVehicle.value ? fuelLogs.value.filter((l) => l.vehicle === filterVehicle.value) : fuelLogs.value
    );
    const totalLitres = computed(() => {
      var _a;
      return Number((_a = fuelStats.value.total_liters) != null ? _a : 0);
    });
    const totalCost = computed(() => {
      var _a;
      return Number((_a = fuelStats.value.this_month_cost) != null ? _a : 0);
    });
    const vehicleSummary = computed(() => {
      const map = {};
      for (const l of fuelLogs.value) {
        if (!map[l.vehicle]) map[l.vehicle] = { model: l.vehicle, plate: l.vehicle, litres: 0, cost: 0 };
        map[l.vehicle].litres += Number(l.quantity_liters);
        map[l.vehicle].cost += Number(l.total_cost);
      }
      return Object.values(map);
    });
    const maxLitres = computed(() => Math.max(...vehicleSummary.value.map((v) => v.litres), 1));
    const newLog = reactive({ vehicleId: "", date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), litres: 0, ratePerLitre: 110, vendor: "" });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-0f2ddf78>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Fuel Management",
        subtitle: "Track fuel consumption and costs per vehicle",
        breadcrumb: ["Logistics", "Fuel"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-0f2ddf78${_scopeId}>+ Log Fuel</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: ($event) => showAddModal.value = true,
                class: "btn-gold text-xs"
              }, "+ Log Fuel", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-0f2ddf78><div class="glass-card p-4" data-v-0f2ddf78><p class="text-xs text-gray-500 mb-1" data-v-0f2ddf78>This Month Litres</p><p class="text-2xl font-bold text-gray-100" data-v-0f2ddf78>${ssrInterpolate(Number(unref(totalLitres)).toLocaleString())} L</p></div><div class="glass-card p-4" data-v-0f2ddf78><p class="text-xs text-gray-500 mb-1" data-v-0f2ddf78>This Month Cost</p><p class="text-2xl font-bold text-red-400" data-v-0f2ddf78>\u09F3${ssrInterpolate(Number(unref(totalCost)).toLocaleString())}</p></div><div class="glass-card p-4" data-v-0f2ddf78><p class="text-xs text-gray-500 mb-1" data-v-0f2ddf78>Avg \u09F3/Litre</p><p class="text-2xl font-bold text-gold-400" data-v-0f2ddf78>\u09F3${ssrInterpolate(unref(totalLitres) > 0 ? Math.round(unref(totalCost) / unref(totalLitres)) : 0)}</p></div><div class="glass-card p-4" data-v-0f2ddf78><p class="text-xs text-gray-500 mb-1" data-v-0f2ddf78>Fill-ups</p><p class="text-2xl font-bold text-gray-100" data-v-0f2ddf78>${ssrInterpolate((_a = unref(fuelStats).total_logs) != null ? _a : 0)}</p></div></div><div class="glass-card p-5 space-y-4" data-v-0f2ddf78><h3 class="section-title" data-v-0f2ddf78>Per-Vehicle Fuel (May 2026)</h3><div class="space-y-3" data-v-0f2ddf78><!--[-->`);
      ssrRenderList(unref(vehicleSummary), (v) => {
        _push(`<div class="flex items-center gap-4" data-v-0f2ddf78><div class="w-32 shrink-0" data-v-0f2ddf78><p class="text-xs font-semibold text-gray-300" data-v-0f2ddf78>${ssrInterpolate(v.model)}</p><p class="text-[11px] font-mono text-gray-600" data-v-0f2ddf78>${ssrInterpolate(v.plate)}</p></div><div class="flex-1" data-v-0f2ddf78><div class="h-2 rounded-full bg-white/[0.06] overflow-hidden" data-v-0f2ddf78><div class="h-full rounded-full bg-gold-500 transition-all" style="${ssrRenderStyle(`width:${Math.round(v.litres / unref(maxLitres) * 100)}%`)}" data-v-0f2ddf78></div></div></div><div class="w-32 text-right" data-v-0f2ddf78><span class="text-xs font-mono text-gray-200" data-v-0f2ddf78>${ssrInterpolate(v.litres)} L</span><span class="text-xs text-gray-600 ml-2" data-v-0f2ddf78>\u09F3${ssrInterpolate(v.cost.toLocaleString())}</span></div></div>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-5" data-v-0f2ddf78><div class="flex items-center justify-between mb-4" data-v-0f2ddf78><h3 class="section-title" data-v-0f2ddf78>Fuel Log</h3><select class="input-glass w-auto text-xs py-1.5" data-v-0f2ddf78><option value="" data-v-0f2ddf78${ssrIncludeBooleanAttr(Array.isArray(unref(filterVehicle)) ? ssrLooseContain(unref(filterVehicle), "") : ssrLooseEqual(unref(filterVehicle), "")) ? " selected" : ""}>All Vehicles</option><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        _push(`<option${ssrRenderAttr("value", v.vehicle_number)} data-v-0f2ddf78${ssrIncludeBooleanAttr(Array.isArray(unref(filterVehicle)) ? ssrLooseContain(unref(filterVehicle), v.vehicle_number) : ssrLooseEqual(unref(filterVehicle), v.vehicle_number)) ? " selected" : ""}>${ssrInterpolate(v.vehicle_number)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(filteredLogs),
        "per-page": 12,
        "search-placeholder": "Search\u2026"
      }, {
        "cell-quantity_liters": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-blue-400" data-v-0f2ddf78${_scopeId}>${ssrInterpolate(value)} L</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-blue-400" }, toDisplayString(value) + " L", 1)
            ];
          }
        }),
        "cell-total_cost": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs font-bold text-red-400" data-v-0f2ddf78${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs font-bold text-red-400" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        "cell-price_per_liter": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-gray-400" data-v-0f2ddf78${_scopeId}>\u09F3${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-gray-400" }, "\u09F3" + toDisplayString(value), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-0f2ddf78><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-0f2ddf78><div class="flex items-center justify-between" data-v-0f2ddf78><h3 class="text-lg font-bold text-gray-100" data-v-0f2ddf78>Log Fuel</h3><button class="text-gray-500 hover:text-gray-200" data-v-0f2ddf78>\u2715</button></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-0f2ddf78><div class="space-y-1.5" data-v-0f2ddf78><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0f2ddf78>Vehicle *</label><select class="input-glass" data-v-0f2ddf78><option value="" data-v-0f2ddf78${ssrIncludeBooleanAttr(Array.isArray(unref(newLog).vehicleId) ? ssrLooseContain(unref(newLog).vehicleId, "") : ssrLooseEqual(unref(newLog).vehicleId, "")) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
          ssrRenderList(unref(vehicles), (v) => {
            _push2(`<option${ssrRenderAttr("value", v.id)} data-v-0f2ddf78${ssrIncludeBooleanAttr(Array.isArray(unref(newLog).vehicleId) ? ssrLooseContain(unref(newLog).vehicleId, v.id) : ssrLooseEqual(unref(newLog).vehicleId, v.id)) ? " selected" : ""}>${ssrInterpolate(v.vehicle_number)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="space-y-1.5" data-v-0f2ddf78><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0f2ddf78>Date *</label><input${ssrRenderAttr("value", unref(newLog).date)} type="date" class="input-glass" data-v-0f2ddf78></div><div class="space-y-1.5" data-v-0f2ddf78><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0f2ddf78>Litres *</label><input${ssrRenderAttr("value", unref(newLog).litres)} type="number" step="0.5" min="1" class="input-glass font-mono" data-v-0f2ddf78></div><div class="space-y-1.5" data-v-0f2ddf78><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0f2ddf78>Rate (\u09F3/litre) *</label><input${ssrRenderAttr("value", unref(newLog).ratePerLitre)} type="number" class="input-glass font-mono" data-v-0f2ddf78></div><div class="space-y-1.5 sm:col-span-2" data-v-0f2ddf78><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0f2ddf78>Total Cost</label><div class="input-glass font-mono font-bold text-gold-400 bg-white/[0.02]" data-v-0f2ddf78>\u09F3${ssrInterpolate((unref(newLog).litres * unref(newLog).ratePerLitre).toLocaleString())}</div></div><div class="space-y-1.5 sm:col-span-2" data-v-0f2ddf78><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-0f2ddf78>Petrol Pump / Vendor</label><input${ssrRenderAttr("value", unref(newLog).vendor)} type="text" class="input-glass" placeholder="e.g. Padma Petrol Pump" data-v-0f2ddf78></div></div><div class="flex gap-3 pt-2" data-v-0f2ddf78><button${ssrIncludeBooleanAttr(!unref(newLog).vehicleId || !unref(newLog).litres || !unref(newLog).ratePerLitre) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-0f2ddf78>Save Log</button><button class="btn-ghost text-xs" data-v-0f2ddf78>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/fuel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const fuel = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0f2ddf78"]]);

export { fuel as default };
//# sourceMappingURL=fuel-BBNy0yny.mjs.map
