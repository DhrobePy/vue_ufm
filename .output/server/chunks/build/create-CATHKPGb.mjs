import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { l as useRouter } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useRouter();
    const loading = ref(false);
    const error = ref("");
    const { data: vData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/vehicles",
      "$_wX9SLS_uH"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: dData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/drivers",
      "$saQJQaGnwf"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: cData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/customers",
      "$7aElzhUdyH"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const availableVehicles = computed(() => {
      var _a, _b;
      return ((_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : []).filter((v) => v.status !== "inactive");
    });
    const activeDrivers = computed(() => {
      var _a, _b;
      return ((_b = (_a = dData.value) == null ? void 0 : _a.drivers) != null ? _b : []).filter((d) => d.status === "active");
    });
    const allCustomers = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = cData.value) == null ? void 0 : _a.customers) != null ? _b : cData.value) != null ? _c : [];
    });
    const customerSearch = ref("");
    const customerOpen = ref(false);
    ref();
    const filteredCustomers = computed(() => {
      const q = customerSearch.value.toLowerCase();
      const all = allCustomers.value;
      if (!q) return all.slice(0, 20);
      return all.filter(
        (c) => (c.name || "").toLowerCase().includes(q) || (c.business_name || "").toLowerCase().includes(q)
      ).slice(0, 20);
    });
    const form = reactive({
      trip_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      departure_time: "",
      origin: "",
      destination: "",
      customer_id: null,
      vehicle_id: "",
      driver_id: "",
      estimated_duration: "",
      quantity: "",
      weight_kg: "",
      goods_description: "",
      trip_charge: "",
      advance_amount: "",
      destination_account: "",
      payment_date: "",
      notes: "",
      start_immediately: false
    });
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl mx-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create Trip",
        breadcrumb: ["Fleet", "Trips", "Create"]
      }, null, _parent));
      _push(`<form class="glass-card p-6 space-y-5"><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Trip Date *</label><input${ssrRenderAttr("value", unref(form).trip_date)} type="date" class="form-input" required></div><div><label class="form-label">Departure Time</label><input${ssrRenderAttr("value", unref(form).departure_time)} type="time" class="form-input"></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Origin / Loading Point</label><input${ssrRenderAttr("value", unref(form).origin)} class="form-input" placeholder="e.g. Dhaka Factory"></div><div><label class="form-label">Destination</label><input${ssrRenderAttr("value", unref(form).destination)} class="form-input" placeholder="e.g. Chittagong Depot"></div></div><div><label class="form-label">Customer (optional)</label><div class="relative"><input${ssrRenderAttr("value", unref(customerSearch))} type="text" class="form-input pr-8" placeholder="Search customer\u2026">`);
      if (unref(form).customer_id) {
        _push(`<button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">\xD7</button>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(customerOpen) && unref(filteredCustomers).length) {
        _push(`<div class="absolute z-50 w-full mt-1 rounded-xl overflow-hidden max-h-48 overflow-y-auto" style="${ssrRenderStyle({ "background": "rgba(18,18,20,0.98)", "border": "1px solid rgba(255,255,255,0.10)", "box-shadow": "0 8px 24px rgba(0,0,0,0.6)" })}"><!--[-->`);
        ssrRenderList(unref(filteredCustomers), (c) => {
          _push(`<button type="button" class="w-full text-left px-3 py-2 text-xs hover:bg-white/[0.07] transition-colors"><span class="font-medium text-gray-200">${ssrInterpolate(c.name)}</span>`);
          if (c.business_name) {
            _push(`<span class="text-gray-500 ml-2">\xB7 ${ssrInterpolate(c.business_name)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Vehicle *</label><select class="form-input" required><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, "") : ssrLooseEqual(unref(form).vehicle_id, "")) ? " selected" : ""}>\u2014 Select vehicle \u2014</option><!--[-->`);
      ssrRenderList(unref(availableVehicles), (v) => {
        _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, v.id) : ssrLooseEqual(unref(form).vehicle_id, v.id)) ? " selected" : ""}>${ssrInterpolate(v.registration_no)} (${ssrInterpolate(v.vehicle_type)}) \u2013 ${ssrInterpolate(v.status)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="form-label">Driver *</label><select class="form-input" required><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).driver_id) ? ssrLooseContain(unref(form).driver_id, "") : ssrLooseEqual(unref(form).driver_id, "")) ? " selected" : ""}>\u2014 Select driver \u2014</option><!--[-->`);
      ssrRenderList(unref(activeDrivers), (d) => {
        _push(`<option${ssrRenderAttr("value", d.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).driver_id) ? ssrLooseContain(unref(form).driver_id, d.id) : ssrLooseEqual(unref(form).driver_id, d.id)) ? " selected" : ""}>${ssrInterpolate(d.full_name)} \xB7 ${ssrInterpolate(d.mobile || "")}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="grid grid-cols-3 gap-4"><div><label class="form-label">Quantity</label><input${ssrRenderAttr("value", unref(form).quantity)} type="number" step="0.01" class="form-input" placeholder="Units"></div><div><label class="form-label">Weight (kg)</label><input${ssrRenderAttr("value", unref(form).weight_kg)} type="number" step="0.01" class="form-input" placeholder="kg"></div><div><label class="form-label">Est. Duration (hrs)</label><input${ssrRenderAttr("value", unref(form).estimated_duration)} type="number" step="0.5" class="form-input" placeholder="8"></div></div><div><label class="form-label">Goods Description</label><input${ssrRenderAttr("value", unref(form).goods_description)} class="form-input" placeholder="e.g. 25kg flour bags, 500 units"></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Trip Charge (Revenue) \u09F3</label><input${ssrRenderAttr("value", unref(form).trip_charge)} type="number" step="0.01" class="form-input" placeholder="0"></div><div><label class="form-label">Advance Amount \u09F3</label><input${ssrRenderAttr("value", unref(form).advance_amount)} type="number" step="0.01" class="form-input" placeholder="0"></div></div>`);
      if (unref(form).trip_charge || unref(form).advance_amount) {
        _push(`<div class="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.03]"><div class="text-center"><p class="text-xs text-gray-500">Trip Charge</p><p class="text-sm font-bold text-gray-200 mt-0.5">\u09F3${ssrInterpolate(fmt(unref(form).trip_charge))}</p></div><div class="text-center"><p class="text-xs text-gray-500">Advance</p><p class="text-sm font-bold text-amber-400 mt-0.5">\u09F3${ssrInterpolate(fmt(unref(form).advance_amount))}</p></div><div class="text-center"><p class="text-xs text-gray-500">Balance</p><p class="text-sm font-bold text-emerald-400 mt-0.5">\u09F3${ssrInterpolate(fmt(Number(unref(form).trip_charge || 0) - Number(unref(form).advance_amount || 0)))}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 gap-4"><div><label class="form-label">Destination Account</label><input${ssrRenderAttr("value", unref(form).destination_account)} class="form-input" placeholder="Where balance is collected"></div><div><label class="form-label">Payment Date</label><input${ssrRenderAttr("value", unref(form).payment_date)} type="date" class="form-input"></div></div><div><label class="form-label">Notes</label><textarea class="form-input" rows="2" placeholder="Any special instructions\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div><label class="flex items-center gap-2 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).start_immediately) ? ssrLooseContain(unref(form).start_immediately, null) : unref(form).start_immediately) ? " checked" : ""} type="checkbox" class="w-4 h-4 accent-gold-400"><span class="text-sm text-gray-300">Start trip immediately (vehicle status \u2192 Busy)</span></label>`);
      if (unref(error)) {
        _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-3 pt-2"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Creating\u2026" : "Create Trip")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/trips",
        class: "btn-secondary"
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
      _push(`</div></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/trips/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-CATHKPGb.mjs.map
