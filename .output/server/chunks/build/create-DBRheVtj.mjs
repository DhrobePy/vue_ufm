import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate } from 'vue/server-renderer';
import { l as useRouter } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const loading = ref(false);
    const error = ref("");
    const vehicleTypes = ["TRUCK", "PICKUP", "VAN", "MINI_TRUCK", "AIRPORT_SHUTTLE", "OTHER"];
    const form = reactive({
      registration_no: "",
      vehicle_type: "TRUCK",
      make: "",
      model: "",
      engine_no: "",
      chassis_no: "",
      year_of_mfg: "",
      fuel_type: "DIESEL",
      ownership_type: "OWNED",
      weight_capacity_kg: "",
      current_odometer: "0",
      status: "available",
      remarks: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-2xl mx-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Add Vehicle",
        breadcrumb: ["Fleet", "Vehicles", "Add"]
      }, null, _parent));
      _push(`<form class="glass-card p-6 space-y-5"><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Registration No *</label><input${ssrRenderAttr("value", unref(form).registration_no)} class="form-input" placeholder="e.g. DHAKA-TRK-08" required></div><div><label class="form-label">Vehicle Type</label><select class="form-input"><!--[-->`);
      ssrRenderList(vehicleTypes, (t) => {
        _push(`<option${ssrRenderAttr("value", t)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_type) ? ssrLooseContain(unref(form).vehicle_type, t) : ssrLooseEqual(unref(form).vehicle_type, t)) ? " selected" : ""}>${ssrInterpolate(t)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Make</label><input${ssrRenderAttr("value", unref(form).make)} class="form-input" placeholder="e.g. Tata, Isuzu"></div><div><label class="form-label">Model</label><input${ssrRenderAttr("value", unref(form).model)} class="form-input" placeholder="e.g. 1613, NQR"></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Engine No</label><input${ssrRenderAttr("value", unref(form).engine_no)} class="form-input" placeholder="Engine number"></div><div><label class="form-label">Chassis No</label><input${ssrRenderAttr("value", unref(form).chassis_no)} class="form-input" placeholder="Chassis number"></div></div><div class="grid grid-cols-3 gap-4"><div><label class="form-label">Year of Manufacture</label><input${ssrRenderAttr("value", unref(form).year_of_mfg)} class="form-input" type="number" min="1990" max="2030" placeholder="2020"></div><div><label class="form-label">Fuel Type</label><select class="form-input"><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>DIESEL</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>PETROL</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>CNG</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>ELECTRIC</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>HYBRID</option></select></div><div><label class="form-label">Ownership</label><select class="form-input"><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership_type) ? ssrLooseContain(unref(form).ownership_type, null) : ssrLooseEqual(unref(form).ownership_type, null)) ? " selected" : ""}>OWNED</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership_type) ? ssrLooseContain(unref(form).ownership_type, null) : ssrLooseEqual(unref(form).ownership_type, null)) ? " selected" : ""}>RENTED</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership_type) ? ssrLooseContain(unref(form).ownership_type, null) : ssrLooseEqual(unref(form).ownership_type, null)) ? " selected" : ""}>LEASED</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership_type) ? ssrLooseContain(unref(form).ownership_type, null) : ssrLooseEqual(unref(form).ownership_type, null)) ? " selected" : ""}>BORROWED</option></select></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Weight Capacity (kg)</label><input${ssrRenderAttr("value", unref(form).weight_capacity_kg)} class="form-input" type="number" placeholder="15000"></div><div><label class="form-label">Current Odometer (km)</label><input${ssrRenderAttr("value", unref(form).current_odometer)} class="form-input" type="number" placeholder="0"></div></div><div><label class="form-label">Status</label><select class="form-input"><option value="available"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "available") : ssrLooseEqual(unref(form).status, "available")) ? " selected" : ""}>Available</option><option value="busy"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "busy") : ssrLooseEqual(unref(form).status, "busy")) ? " selected" : ""}>Busy</option><option value="repair"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "repair") : ssrLooseEqual(unref(form).status, "repair")) ? " selected" : ""}>In Repair</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "inactive") : ssrLooseEqual(unref(form).status, "inactive")) ? " selected" : ""}>Inactive</option></select></div><div><label class="form-label">Remarks</label><textarea class="form-input" rows="2" placeholder="Optional notes\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div>`);
      if (unref(error)) {
        _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-3 pt-2"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Saving\u2026" : "Save Vehicle")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/vehicles",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/vehicles/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-DBRheVtj.mjs.map
