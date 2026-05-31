import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: branchData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$vj-MMRy7Wn"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = branchData.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const form = reactive({
      type: "",
      // category
      make: "",
      model: "",
      plate: "",
      // vehicle_number
      year: null,
      capacity: null,
      // in MT on form, stored as kg
      fuelType: "diesel",
      branch_id: "",
      ownership: "Own",
      // 'Own' | 'Rented'
      rentalRate: null,
      nextServiceDate: "",
      notes: ""
    });
    const saving = ref(false);
    const isValid = computed(
      () => form.type && form.plate && form.capacity && form.capacity > 0
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Add Vehicle",
        subtitle: "Register a new vehicle in the fleet",
        breadcrumb: ["Logistics", "Vehicles", "Add Vehicle"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/logistics/vehicles",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All Vehicles`);
                } else {
                  return [
                    createTextVNode("\u2190 All Vehicles")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/logistics/vehicles",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All Vehicles")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-6 space-y-5"><h3 class="section-title">Vehicle Information</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "") : ssrLooseEqual(unref(form).type, "")) ? " selected" : ""}>\u2014 Select \u2014</option><option value="Truck"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "Truck") : ssrLooseEqual(unref(form).type, "Truck")) ? " selected" : ""}>Truck</option><option value="Van"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "Van") : ssrLooseEqual(unref(form).type, "Van")) ? " selected" : ""}>Van</option><option value="Pickup"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "Pickup") : ssrLooseEqual(unref(form).type, "Pickup")) ? " selected" : ""}>Pickup</option><option value="Motorcycle"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "Motorcycle") : ssrLooseEqual(unref(form).type, "Motorcycle")) ? " selected" : ""}>Motorcycle</option><option value="Other"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "Other") : ssrLooseEqual(unref(form).type, "Other")) ? " selected" : ""}>Other</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Make</label><input${ssrRenderAttr("value", unref(form).make)} type="text" class="input-glass" placeholder="e.g. Tata, Mahindra"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model</label><input${ssrRenderAttr("value", unref(form).model)} type="text" class="input-glass" placeholder="e.g. LPT 1109, Bolero"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration Year</label><input${ssrRenderAttr("value", unref(form).year)} type="number" min="2000" max="2030" class="input-glass font-mono" placeholder="2023"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration Plate / Vehicle Number *</label><input${ssrRenderAttr("value", unref(form).plate)} type="text" class="input-glass font-mono uppercase" placeholder="e.g. DHK-GA-1234"></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Capacity (MT) *</label><input${ssrRenderAttr("value", unref(form).capacity)} type="number" min="0.5" step="0.5" class="input-glass font-mono" placeholder="5"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fuel Type</label><select class="input-glass"><option value="Diesel"${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuelType) ? ssrLooseContain(unref(form).fuelType, "Diesel") : ssrLooseEqual(unref(form).fuelType, "Diesel")) ? " selected" : ""}>Diesel</option><option value="Petrol"${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuelType) ? ssrLooseContain(unref(form).fuelType, "Petrol") : ssrLooseEqual(unref(form).fuelType, "Petrol")) ? " selected" : ""}>Petrol</option><option value="CNG"${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuelType) ? ssrLooseContain(unref(form).fuelType, "CNG") : ssrLooseEqual(unref(form).fuelType, "CNG")) ? " selected" : ""}>CNG</option><option value="Electric"${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuelType) ? ssrLooseContain(unref(form).fuelType, "Electric") : ssrLooseEqual(unref(form).fuelType, "Electric")) ? " selected" : ""}>Electric</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Branch</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch_id) ? ssrLooseContain(unref(form).branch_id, "") : ssrLooseEqual(unref(form).branch_id, "")) ? " selected" : ""}>\u2014 None \u2014</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch_id) ? ssrLooseContain(unref(form).branch_id, b.id) : ssrLooseEqual(unref(form).branch_id, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vehicle Type</label><select class="input-glass"><option value="Own"${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership) ? ssrLooseContain(unref(form).ownership, "Own") : ssrLooseEqual(unref(form).ownership, "Own")) ? " selected" : ""}>Company Owned</option><option value="Rented"${ssrIncludeBooleanAttr(Array.isArray(unref(form).ownership) ? ssrLooseContain(unref(form).ownership, "Rented") : ssrLooseEqual(unref(form).ownership, "Rented")) ? " selected" : ""}>Rented / Hired</option></select></div>`);
      if (unref(form).ownership === "Rented") {
        _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Rental Rate (\u09F3/day)</label><input${ssrRenderAttr("value", unref(form).rentalRate)} type="number" class="input-glass font-mono"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Next Service Due Date</label><input${ssrRenderAttr("value", unref(form).nextServiceDate)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label><textarea rows="3" class="input-glass resize-none" placeholder="Any special notes about this vehicle\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div><div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Registering\u2026" : "Register Vehicle")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/logistics/vehicles",
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
      _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Vehicle Card Preview</h3><div class="rounded-xl border border-white/10 p-4 bg-white/[0.02] space-y-3"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xl">\u{1F69B}</div><div><p class="text-sm font-bold text-gray-200">${ssrInterpolate(unref(form).model || "Vehicle Model")}</p><p class="text-xs font-mono text-gray-500">${ssrInterpolate(unref(form).plate || "REG PLATE")}</p></div></div><div class="space-y-1.5 text-xs"><div class="flex justify-between"><span class="text-gray-600">Category</span><span class="text-gray-300">${ssrInterpolate(unref(form).type || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Capacity</span><span class="text-gray-300">${ssrInterpolate(unref(form).capacity || "\u2014")} MT</span></div><div class="flex justify-between"><span class="text-gray-600">Branch</span><span class="text-gray-300">${ssrInterpolate(((_a = unref(branches).find((b) => b.id === Number(unref(form).branch_id))) == null ? void 0 : _a.name) || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Type</span><span class="text-gray-300">${ssrInterpolate(unref(form).ownership)}</span></div></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/vehicles/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-DhZVSqkQ.mjs.map
