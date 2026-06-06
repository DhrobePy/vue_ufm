import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "maintenance",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const showAddModal = ref(false);
    const filterVehicle = ref("");
    ref(false);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/logistics/maintenance",
      "$EWGXZMOmTa"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const maintStats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const records = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.logs) != null ? _b : [];
    });
    const { data: vData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/logistics/vehicles",
      "$aLFpSbPkw1"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const cols = [
      { key: "vehicle", label: "Vehicle", sortable: true },
      { key: "date", label: "Date", sortable: true },
      { key: "maintenance_type", label: "Type", sortable: true },
      { key: "description", label: "Description" },
      { key: "cost", label: "Cost", sortable: true },
      { key: "service_provider", label: "Garage" }
    ];
    const monthCost = computed(() => {
      var _a;
      return Number((_a = maintStats.value.this_month) != null ? _a : 0);
    });
    const filteredRecords = computed(
      () => filterVehicle.value ? records.value.filter((r) => r.vehicle === filterVehicle.value) : records.value
    );
    const newRecord = reactive({ vehicleId: "", date: today, maintenance_type: "", description: "", cost: 0, garage: "" });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-d1b7bb86>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Vehicle Maintenance",
        subtitle: "Schedule and track maintenance for the fleet",
        breadcrumb: ["Logistics", "Maintenance"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-d1b7bb86${_scopeId}>+ Log Maintenance</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: ($event) => showAddModal.value = true,
                class: "btn-gold text-xs"
              }, "+ Log Maintenance", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-d1b7bb86><div class="glass-card p-4" data-v-d1b7bb86><p class="text-xs text-gray-500 mb-1" data-v-d1b7bb86>In Maintenance</p><p class="text-2xl font-bold text-yellow-400" data-v-d1b7bb86>${ssrInterpolate(unref(vehicles).filter((v) => v.status === "Maintenance").length)}</p></div><div class="glass-card p-4" data-v-d1b7bb86><p class="text-xs text-gray-500 mb-1" data-v-d1b7bb86>Due This Week</p><p class="text-2xl font-bold text-orange-400" data-v-d1b7bb86>${ssrInterpolate((_a = unref(maintStats).due_soon) != null ? _a : 0)}</p></div><div class="glass-card p-4" data-v-d1b7bb86><p class="text-xs text-gray-500 mb-1" data-v-d1b7bb86>Cost This Month</p><p class="text-2xl font-bold text-red-400" data-v-d1b7bb86>\u09F3${ssrInterpolate(Number(unref(monthCost)).toLocaleString())}</p></div><div class="glass-card p-4" data-v-d1b7bb86><p class="text-xs text-gray-500 mb-1" data-v-d1b7bb86>Total Records</p><p class="text-2xl font-bold text-emerald-400" data-v-d1b7bb86>${ssrInterpolate((_b = unref(maintStats).total_logs) != null ? _b : 0)}</p></div></div><div class="glass-card p-5 space-y-4" data-v-d1b7bb86><h3 class="section-title" data-v-d1b7bb86>Fleet Status</h3><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-v-d1b7bb86><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        var _a2, _b2;
        _push(`<div class="rounded-xl border border-white/[0.07] p-4 space-y-3" data-v-d1b7bb86><div class="flex items-center justify-between" data-v-d1b7bb86><div data-v-d1b7bb86><p class="text-sm font-semibold text-gray-200" data-v-d1b7bb86>${ssrInterpolate(v.vehicle_number)}</p><p class="text-xs font-mono text-gray-500" data-v-d1b7bb86>${ssrInterpolate(v.vehicle_type)}</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: (_a2 = v.status) == null ? void 0 : _a2.toLowerCase()
        }, null, _parent));
        _push(`</div><div class="space-y-1.5 text-xs" data-v-d1b7bb86><div class="flex justify-between" data-v-d1b7bb86><span class="text-gray-600" data-v-d1b7bb86>Next service</span><span class="${ssrRenderClass(v.next_service_due_date && v.next_service_due_date < unref(today) ? "text-red-400" : "text-gray-300")}" data-v-d1b7bb86>${ssrInterpolate((_b2 = v.next_service_due_date) != null ? _b2 : "\u2014")}</span></div><div class="flex justify-between" data-v-d1b7bb86><span class="text-gray-600" data-v-d1b7bb86>Capacity</span><span class="text-gray-300 font-mono" data-v-d1b7bb86>${ssrInterpolate(v.capacity_kg ? (v.capacity_kg / 1e3).toFixed(1) + " MT" : "\u2014")}</span></div></div>`);
        if (v.status === "Maintenance") {
          _push(`<button class="w-full btn-gold text-xs py-1.5" data-v-d1b7bb86>Mark Completed</button>`);
        } else {
          _push(`<button class="w-full btn-ghost text-xs py-1.5" data-v-d1b7bb86>Schedule Service</button>`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-5" data-v-d1b7bb86><div class="flex items-center justify-between mb-4" data-v-d1b7bb86><h3 class="section-title" data-v-d1b7bb86>Maintenance Log</h3><select class="input-glass w-auto text-xs py-1.5" data-v-d1b7bb86><option value="" data-v-d1b7bb86${ssrIncludeBooleanAttr(Array.isArray(unref(filterVehicle)) ? ssrLooseContain(unref(filterVehicle), "") : ssrLooseEqual(unref(filterVehicle), "")) ? " selected" : ""}>All Vehicles</option><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        _push(`<option${ssrRenderAttr("value", v.vehicle_number)} data-v-d1b7bb86${ssrIncludeBooleanAttr(Array.isArray(unref(filterVehicle)) ? ssrLooseContain(unref(filterVehicle), v.vehicle_number) : ssrLooseEqual(unref(filterVehicle), v.vehicle_number)) ? " selected" : ""}>${ssrInterpolate(v.vehicle_number)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(filteredRecords),
        "per-page": 10,
        "search-placeholder": "Search\u2026"
      }, {
        "cell-cost": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-red-400" data-v-d1b7bb86${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-red-400" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-d1b7bb86><div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-d1b7bb86><div class="flex items-center justify-between" data-v-d1b7bb86><h3 class="text-lg font-bold text-gray-100" data-v-d1b7bb86>Log Maintenance</h3><button class="text-gray-500 hover:text-gray-200" data-v-d1b7bb86>\u2715</button></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-d1b7bb86><div class="space-y-1.5" data-v-d1b7bb86><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-d1b7bb86>Vehicle *</label><select class="input-glass" data-v-d1b7bb86><option value="" data-v-d1b7bb86${ssrIncludeBooleanAttr(Array.isArray(unref(newRecord).vehicleId) ? ssrLooseContain(unref(newRecord).vehicleId, "") : ssrLooseEqual(unref(newRecord).vehicleId, "")) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
          ssrRenderList(unref(vehicles), (v) => {
            _push2(`<option${ssrRenderAttr("value", v.id)} data-v-d1b7bb86${ssrIncludeBooleanAttr(Array.isArray(unref(newRecord).vehicleId) ? ssrLooseContain(unref(newRecord).vehicleId, v.id) : ssrLooseEqual(unref(newRecord).vehicleId, v.id)) ? " selected" : ""}>${ssrInterpolate(v.vehicle_number)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="space-y-1.5" data-v-d1b7bb86><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-d1b7bb86>Date *</label><input${ssrRenderAttr("value", unref(newRecord).date)} type="date" class="input-glass" data-v-d1b7bb86></div><div class="space-y-1.5 sm:col-span-2" data-v-d1b7bb86><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-d1b7bb86>Maintenance Type *</label><input${ssrRenderAttr("value", unref(newRecord).maintenance_type)} type="text" class="input-glass" placeholder="e.g. Oil change, Tyre replacement\u2026" data-v-d1b7bb86></div><div class="space-y-1.5 sm:col-span-2" data-v-d1b7bb86><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-d1b7bb86>Description</label><input${ssrRenderAttr("value", unref(newRecord).description)} type="text" class="input-glass" placeholder="Additional details\u2026" data-v-d1b7bb86></div><div class="space-y-1.5" data-v-d1b7bb86><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-d1b7bb86>Cost (\u09F3)</label><input${ssrRenderAttr("value", unref(newRecord).cost)} type="number" class="input-glass font-mono" data-v-d1b7bb86></div><div class="space-y-1.5" data-v-d1b7bb86><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-d1b7bb86>Garage / Vendor</label><input${ssrRenderAttr("value", unref(newRecord).garage)} type="text" class="input-glass" data-v-d1b7bb86></div></div><div class="flex gap-3 pt-2" data-v-d1b7bb86><button class="btn-gold text-xs flex-1" data-v-d1b7bb86>Save Record</button><button class="btn-ghost text-xs" data-v-d1b7bb86>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/maintenance.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const maintenance = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d1b7bb86"]]);

export { maintenance as default };
//# sourceMappingURL=maintenance-lk-ErZuI.mjs.map
