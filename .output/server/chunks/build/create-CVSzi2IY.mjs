import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const tripTypes = [
      { value: "single", icon: "\u{1F69A}", label: "Customer Delivery" },
      { value: "consolidated", icon: "\u{1F4E6}", label: "Multi-stop / Consolidated" }
    ];
    const [{ data: vehicleData }, { data: driverData }, { data: tripData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/logistics/vehicles",
        "$4w2g5lEv8e"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/logistics/drivers",
        "$QEYA4TQik2"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/logistics/trips",
        { query: { per: 5 } },
        "$D7TyA6LPUm"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vehicleData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const drivers = computed(() => {
      var _a, _b;
      return (_b = (_a = driverData.value) == null ? void 0 : _a.drivers) != null ? _b : [];
    });
    const recentTrips = computed(() => {
      var _a, _b;
      return (_b = (_a = tripData.value) == null ? void 0 : _a.trips) != null ? _b : [];
    });
    const form = reactive({
      trip_type: "single",
      vehicle_id: "",
      driver_id: "",
      trip_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      time: (/* @__PURE__ */ new Date()).toISOString().slice(11, 16),
      total_weight: null,
      // in MT
      route_summary: "",
      notes: ""
    });
    const saving = ref(false);
    const isValid = computed(
      () => form.vehicle_id && form.driver_id && form.trip_date
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create Trip",
        subtitle: "Schedule a new delivery or raw material transport trip",
        breadcrumb: ["Logistics", "Trips", "Create"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/logistics",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Logistics`);
                } else {
                  return [
                    createTextVNode("\u2190 Logistics")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/logistics",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Logistics")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-6 space-y-5"><h3 class="section-title">Trip Details</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip Type *</label><div class="grid grid-cols-2 sm:grid-cols-3 gap-2"><!--[-->`);
      ssrRenderList(tripTypes, (t) => {
        _push(`<button class="${ssrRenderClass([
          "rounded-xl border p-3 text-center text-xs transition-all",
          unref(form).trip_type === t.value ? "bg-gold-500/10 border-gold-500/40 text-gold-400" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
        ])}"><div class="text-lg mb-1">${ssrInterpolate(t.icon)}</div><div class="font-semibold">${ssrInterpolate(t.label)}</div></button>`);
      });
      _push(`<!--]--></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, "") : ssrLooseEqual(unref(form).vehicle_id, "")) ? " selected" : ""}>\u2014 Select vehicle \u2014</option><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, v.id) : ssrLooseEqual(unref(form).vehicle_id, v.id)) ? " selected" : ""}>${ssrInterpolate(v.vehicle_number)} (${ssrInterpolate(v.category)} \xB7 ${ssrInterpolate((Number(v.capacity_kg) / 1e3).toFixed(1))} MT) </option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).driver_id) ? ssrLooseContain(unref(form).driver_id, "") : ssrLooseEqual(unref(form).driver_id, "")) ? " selected" : ""}>\u2014 Select driver \u2014</option><!--[-->`);
      ssrRenderList(unref(drivers), (d) => {
        _push(`<option${ssrRenderAttr("value", d.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).driver_id) ? ssrLooseContain(unref(form).driver_id, d.id) : ssrLooseEqual(unref(form).driver_id, d.id)) ? " selected" : ""}>${ssrInterpolate(d.driver_name)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trip Date *</label><input${ssrRenderAttr("value", unref(form).trip_date)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Time</label><input${ssrRenderAttr("value", unref(form).time)} type="time" class="input-glass"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Route Summary</label><input${ssrRenderAttr("value", unref(form).route_summary)} type="text" class="input-glass" placeholder="e.g. Sirajgonj \u2192 Pabna"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Weight (MT)</label><input${ssrRenderAttr("value", unref(form).total_weight)} type="number" step="0.1" min="0" class="input-glass font-mono"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label><textarea rows="3" class="input-glass resize-none" placeholder="Special instructions, route notes\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div><div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Creating\u2026" : "Create Trip")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/logistics",
        class: "btn-ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cancel`);
          } else {
            return [
              createTextVNode("Cancel")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Available Vehicles</h3><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        var _a;
        _push(`<div class="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0 text-xs"><div><p class="text-gray-300 font-medium">${ssrInterpolate(v.vehicle_number)}</p><p class="text-gray-600">${ssrInterpolate(v.category)} \xB7 ${ssrInterpolate((Number(v.capacity_kg) / 1e3).toFixed(1))} MT</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: (_a = v.status) == null ? void 0 : _a.toLowerCase()
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      if (!unref(vehicles).length) {
        _push(`<p class="text-xs text-gray-600 text-center py-2">No vehicles found</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Recent Trips</h3><!--[-->`);
      ssrRenderList(unref(recentTrips), (t) => {
        var _a;
        _push(`<div class="py-2 border-b border-white/[0.04] last:border-0 text-xs"><div class="flex justify-between"><span class="text-gray-300 font-mono">${ssrInterpolate(t.date)}</span>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: (_a = t.status) == null ? void 0 : _a.toLowerCase().replace(" ", "_")
        }, null, _parent));
        _push(`</div><p class="text-gray-600 mt-0.5">${ssrInterpolate(t.driver)} \xB7 ${ssrInterpolate(t.vehicle)}</p></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(recentTrips).length) {
        _push(`<p class="text-xs text-gray-600 text-center py-2">No recent trips</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/trips/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-CVSzi2IY.mjs.map
