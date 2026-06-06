import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, watchEffect, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate } from 'vue/server-renderer';
import { k as useRoute, l as useRouter } from './server.mjs';
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
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useRouter();
    const id = Number(route.params.id);
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
      assigned_driver_id: "",
      remarks: ""
    });
    const [{ data: vehicleData, pending }, { data: driversData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        `/api/fleet/vehicles/${id}`,
        "$5dh-FqfExE"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/fleet/drivers",
        "$sAuXxIlk7o"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const drivers = computed(() => {
      var _a, _b;
      return (_b = (_a = driversData.value) == null ? void 0 : _a.drivers) != null ? _b : [];
    });
    watchEffect(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const v = (_a = vehicleData.value) == null ? void 0 : _a.vehicle;
      if (!v) return;
      form.registration_no = (_b = v.registration_no) != null ? _b : "";
      form.vehicle_type = (_c = v.vehicle_type) != null ? _c : "TRUCK";
      form.make = (_d = v.make) != null ? _d : "";
      form.model = (_e = v.model) != null ? _e : "";
      form.engine_no = (_f = v.engine_no) != null ? _f : "";
      form.chassis_no = (_g = v.chassis_no) != null ? _g : "";
      form.year_of_mfg = (_h = v.year_of_mfg) != null ? _h : "";
      form.fuel_type = (_i = v.fuel_type) != null ? _i : "DIESEL";
      form.ownership_type = (_j = v.ownership_type) != null ? _j : "OWNED";
      form.weight_capacity_kg = (_k = v.weight_capacity_kg) != null ? _k : "";
      form.current_odometer = (_l = v.current_odometer) != null ? _l : "0";
      form.status = (_m = v.status) != null ? _m : "available";
      form.assigned_driver_id = (_n = v.assigned_driver_id) != null ? _n : "";
      form.remarks = (_o = v.remarks) != null ? _o : "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-2xl mx-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Edit Vehicle \u2014 ${unref(form).registration_no || "\u2026"}`,
        breadcrumb: ["Fleet", "Vehicles", unref(form).registration_no || unref(id), "Edit"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/fleet/vehicles/${unref(id)}`,
              class: "btn-secondary text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Back to Detail`);
                } else {
                  return [
                    createTextVNode("\u2190 Back to Detail")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/fleet/vehicles/${unref(id)}`,
                class: "btn-secondary text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back to Detail")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-10 flex items-center justify-center"><span class="text-gray-500 text-sm">Loading vehicle data\u2026</span></div>`);
      } else {
        _push(`<form class="glass-card p-6 space-y-5"><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Registration No *</label><input${ssrRenderAttr("value", unref(form).registration_no)} class="form-input" placeholder="e.g. DHAKA-TRK-08" required></div><div><label class="form-label">Vehicle Type</label><select class="form-input"><!--[-->`);
        ssrRenderList(vehicleTypes, (t) => {
          _push(`<option${ssrRenderAttr("value", t)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_type) ? ssrLooseContain(unref(form).vehicle_type, t) : ssrLooseEqual(unref(form).vehicle_type, t)) ? " selected" : ""}>${ssrInterpolate(t)}</option>`);
        });
        _push(`<!--]--></select></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Make</label><input${ssrRenderAttr("value", unref(form).make)} class="form-input" placeholder="e.g. Tata, Isuzu"></div><div><label class="form-label">Model</label><input${ssrRenderAttr("value", unref(form).model)} class="form-input" placeholder="e.g. 1613, NQR"></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Engine No</label><input${ssrRenderAttr("value", unref(form).engine_no)} class="form-input" placeholder="Engine number"></div><div><label class="form-label">Chassis No</label><input${ssrRenderAttr("value", unref(form).chassis_no)} class="form-input" placeholder="Chassis number"></div></div><div class="grid grid-cols-3 gap-4"><div><label class="form-label">Year of Manufacture</label><input${ssrRenderAttr("value", unref(form).year_of_mfg)} class="form-input" type="number" min="1990" max="2030" placeholder="2020"></div><div><label class="form-label">Fuel Type</label><select class="form-input"><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>DIESEL</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>PETROL</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>CNG</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>ELECTRIC</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>HYBRID</option></select></div><div><label class="form-label">Ownership</label><select class="form-input"><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership_type) ? ssrLooseContain(unref(form).ownership_type, null) : ssrLooseEqual(unref(form).ownership_type, null)) ? " selected" : ""}>OWNED</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership_type) ? ssrLooseContain(unref(form).ownership_type, null) : ssrLooseEqual(unref(form).ownership_type, null)) ? " selected" : ""}>RENTED</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership_type) ? ssrLooseContain(unref(form).ownership_type, null) : ssrLooseEqual(unref(form).ownership_type, null)) ? " selected" : ""}>LEASED</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership_type) ? ssrLooseContain(unref(form).ownership_type, null) : ssrLooseEqual(unref(form).ownership_type, null)) ? " selected" : ""}>BORROWED</option></select></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Weight Capacity (kg)</label><input${ssrRenderAttr("value", unref(form).weight_capacity_kg)} class="form-input" type="number" placeholder="15000"></div><div><label class="form-label">Current Odometer (km)</label><input${ssrRenderAttr("value", unref(form).current_odometer)} class="form-input" type="number" placeholder="0"></div></div><div><label class="form-label">Assigned Driver</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).assigned_driver_id) ? ssrLooseContain(unref(form).assigned_driver_id, "") : ssrLooseEqual(unref(form).assigned_driver_id, "")) ? " selected" : ""}>\u2014 None \u2014</option><!--[-->`);
        ssrRenderList(unref(drivers), (d) => {
          _push(`<option${ssrRenderAttr("value", d.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).assigned_driver_id) ? ssrLooseContain(unref(form).assigned_driver_id, d.id) : ssrLooseEqual(unref(form).assigned_driver_id, d.id)) ? " selected" : ""}>${ssrInterpolate(d.full_name)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">Status</label><select class="form-input"><option value="available"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "available") : ssrLooseEqual(unref(form).status, "available")) ? " selected" : ""}>Available</option><option value="busy"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "busy") : ssrLooseEqual(unref(form).status, "busy")) ? " selected" : ""}>Busy</option><option value="repair"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "repair") : ssrLooseEqual(unref(form).status, "repair")) ? " selected" : ""}>In Repair</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "inactive") : ssrLooseEqual(unref(form).status, "inactive")) ? " selected" : ""}>Inactive</option></select></div><div><label class="form-label">Remarks</label><textarea class="form-input" rows="2" placeholder="Optional notes\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div>`);
        if (unref(error)) {
          _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(error))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-3 pt-2"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Saving\u2026" : "Update Vehicle")}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/fleet/vehicles/${unref(id)}`,
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
        _push(`</div></form>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/vehicles/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=edit-BN2ezwWD.mjs.map
