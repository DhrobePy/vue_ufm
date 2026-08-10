import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { l as useRouter, k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useRouter();
    const route = useRoute();
    const loading = ref(false);
    const error = ref("");
    const { data: vData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/vehicles",
      "$hjZmwEXR_Z"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const form = reactive({
      vehicle_id: route.query.vehicle_id || "",
      request_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      repair_type: "corrective",
      station_supplier: "",
      issue_description: "",
      odometer_at_request: "",
      notes: "",
      tasks: [],
      materials: []
    });
    const totalCost = computed(() => {
      const taskCost = form.tasks.reduce((s, t) => s + (Number(t.service_cost) || 0), 0);
      const matCost = form.materials.reduce((s, m) => s + (Number(m.quantity) * Number(m.unit_rate) || 0), 0);
      return taskCost + matCost;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-2xl mx-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Log Maintenance Request",
        breadcrumb: ["Fleet", "Maintenance", "Create"]
      }, null, _parent));
      _push(`<form class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="section-title">Request Details</h3><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Vehicle *</label><select class="form-input" required><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, "") : ssrLooseEqual(unref(form).vehicle_id, "")) ? " selected" : ""}>\u2014 Select vehicle \u2014</option><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, v.id) : ssrLooseEqual(unref(form).vehicle_id, v.id)) ? " selected" : ""}>${ssrInterpolate(v.registration_no)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="form-label">Request Date *</label><input${ssrRenderAttr("value", unref(form).request_date)} type="date" class="form-input" required></div><div><label class="form-label">Repair Type</label><select class="form-input"><option value="corrective"${ssrIncludeBooleanAttr(Array.isArray(unref(form).repair_type) ? ssrLooseContain(unref(form).repair_type, "corrective") : ssrLooseEqual(unref(form).repair_type, "corrective")) ? " selected" : ""}>Corrective (breakdown repair)</option><option value="preventive"${ssrIncludeBooleanAttr(Array.isArray(unref(form).repair_type) ? ssrLooseContain(unref(form).repair_type, "preventive") : ssrLooseEqual(unref(form).repair_type, "preventive")) ? " selected" : ""}>Preventive (scheduled service)</option></select></div><div><label class="form-label">Station / Workshop</label><input${ssrRenderAttr("value", unref(form).station_supplier)} class="form-input" placeholder="Workshop or supplier name"></div><div><label class="form-label">Odometer Reading (km)</label><input${ssrRenderAttr("value", unref(form).odometer_at_request)} type="number" class="form-input" placeholder="Current km reading"></div></div><div><label class="form-label">Issue Description</label><textarea class="form-input" rows="3" placeholder="Describe the problem or service needed\u2026">${ssrInterpolate(unref(form).issue_description)}</textarea></div></div><div class="glass-card p-5 space-y-3"><div class="flex items-center justify-between"><h3 class="section-title">Repair Tasks</h3><button type="button" class="btn-secondary text-xs">+ Add Task</button></div><!--[-->`);
      ssrRenderList(unref(form).tasks, (task, i) => {
        _push(`<div class="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/[0.03]"><div class="col-span-3"><label class="form-label">Description *</label><input${ssrRenderAttr("value", task.description)} class="form-input" placeholder="e.g. Replace brake pads" required></div><div><label class="form-label">Service Cost \u09F3</label><input${ssrRenderAttr("value", task.service_cost)} type="number" step="0.01" class="form-input" placeholder="0"></div><div class="flex items-end"><button type="button" class="btn-secondary text-xs text-red-400 border-red-500/20 w-full">Remove</button></div></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(form).tasks.length) {
        _push(`<div class="text-center py-3 text-gray-600 text-xs">No tasks added</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="glass-card p-5 space-y-3"><div class="flex items-center justify-between"><h3 class="section-title">Materials Used</h3><button type="button" class="btn-secondary text-xs">+ Add Material</button></div><!--[-->`);
      ssrRenderList(unref(form).materials, (mat, i) => {
        _push(`<div class="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/[0.03]"><div class="col-span-2"><label class="form-label">Item Name *</label><input${ssrRenderAttr("value", mat.item_name)} class="form-input" placeholder="e.g. Engine Oil 5W30" required></div><div><label class="form-label">Qty</label><input${ssrRenderAttr("value", mat.quantity)} type="number" step="0.001" class="form-input" placeholder="1"></div><div><label class="form-label">Unit Rate \u09F3</label><input${ssrRenderAttr("value", mat.unit_rate)} type="number" step="0.01" class="form-input" placeholder="0"></div><div class="flex items-end"><button type="button" class="btn-secondary text-xs text-red-400 border-red-500/20 w-full">Remove</button></div></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(form).materials.length) {
        _push(`<div class="text-center py-3 text-gray-600 text-xs">No materials added</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(totalCost) > 0) {
        _push(`<div class="flex justify-end pt-2 border-t border-white/[0.06]"><p class="text-sm font-bold text-gray-200">Estimated Total: \u09F3${ssrInterpolate(unref(totalCost).toLocaleString())}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><label class="form-label">Notes</label><textarea class="form-input" rows="2" placeholder="Additional notes\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div>`);
      if (unref(error)) {
        _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-3"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Saving\u2026" : "Create Request")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/maintenance",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/maintenance/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-Bbj_nxCE.mjs.map
