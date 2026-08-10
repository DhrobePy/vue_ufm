import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const vehicleTypes = ["TRUCK", "PICKUP", "VAN", "MINI_TRUCK", "AIRPORT_SHUTTLE", "OTHER"];
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/maintenance/rules",
      "$4zOL8NzCFT"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rules = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.rules) != null ? _b : [];
    });
    const showModal = ref(false);
    const editing = ref(null);
    const saving = ref(false);
    const formError = ref("");
    const form = reactive({
      rule_name: "",
      vehicle_type: "",
      interval_km: "",
      interval_days: "",
      description: "",
      is_active: true
    });
    function resetForm() {
      form.rule_name = "";
      form.vehicle_type = "";
      form.interval_km = "";
      form.interval_days = "";
      form.description = "";
      form.is_active = true;
    }
    function openCreate() {
      editing.value = null;
      resetForm();
      formError.value = "";
      showModal.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Preventive Maintenance Rules",
        breadcrumb: ["Fleet", "Maintenance", "PM Rules"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs"${_scopeId}>+ Add Rule</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: openCreate,
                class: "btn-gold text-xs"
              }, "+ Add Rule")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-3 gap-4"><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gold-400">${ssrInterpolate(unref(rules).length)}</p><p class="text-xs text-gray-500 mt-1">Total Rules</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate(unref(rules).filter((r) => r.is_active).length)}</p><p class="text-xs text-gray-500 mt-1">Active Rules</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gray-400">${ssrInterpolate(unref(rules).filter((r) => !r.is_active).length)}</p><p class="text-xs text-gray-500 mt-1">Inactive Rules</p></div></div><div class="glass-card p-5">`);
      if (!unref(rules).length) {
        _push(`<div class="text-center py-10 text-gray-600 text-sm"> No preventive maintenance rules configured yet. </div>`);
      } else {
        _push(`<table class="w-full text-sm"><thead><tr class="border-b border-white/[0.07]"><th class="pb-3 text-left text-gray-500 font-medium">Rule Name</th><th class="pb-3 text-left text-gray-500 font-medium">Vehicle Type</th><th class="pb-3 text-right text-gray-500 font-medium">Interval (km)</th><th class="pb-3 text-right text-gray-500 font-medium">Interval (days)</th><th class="pb-3 text-left text-gray-500 font-medium">Description</th><th class="pb-3 text-center text-gray-500 font-medium">Status</th><th class="pb-3 text-right text-gray-500 font-medium">Actions</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(rules), (rule) => {
          _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02]"><td class="py-3 font-medium text-gray-200">${ssrInterpolate(rule.rule_name)}</td><td class="py-3 text-gray-400">${ssrInterpolate(rule.vehicle_type || "All Types")}</td><td class="py-3 text-right text-gray-300">${ssrInterpolate(rule.interval_km ? Number(rule.interval_km).toLocaleString() + " km" : "\u2014")}</td><td class="py-3 text-right text-gray-300">${ssrInterpolate(rule.interval_days ? rule.interval_days + " days" : "\u2014")}</td><td class="py-3 text-gray-500 max-w-xs truncate">${ssrInterpolate(rule.description || "\u2014")}</td><td class="py-3 text-center"><button class="${ssrRenderClass([rule.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400", "badge text-[10px] cursor-pointer hover:opacity-80 transition-opacity"])}">${ssrInterpolate(rule.is_active ? "Active" : "Inactive")}</button></td><td class="py-3 text-right"><div class="flex justify-end gap-2"><button class="text-xs text-blue-400 hover:text-blue-300">Edit</button><button class="text-xs text-red-400 hover:text-red-300">Delete</button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div class="glass-card p-6 w-full max-w-lg mx-4 space-y-4"><h3 class="section-title">${ssrInterpolate(unref(editing) ? "Edit Rule" : "Add Preventive Maintenance Rule")}</h3><form class="space-y-4"><div><label class="form-label">Rule Name *</label><input${ssrRenderAttr("value", unref(form).rule_name)} class="form-input" required placeholder="e.g. Engine Oil Change"></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Vehicle Type</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_type) ? ssrLooseContain(unref(form).vehicle_type, "") : ssrLooseEqual(unref(form).vehicle_type, "")) ? " selected" : ""}>All Types</option><!--[-->`);
          ssrRenderList(vehicleTypes, (t) => {
            _push2(`<option${ssrRenderAttr("value", t)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_type) ? ssrLooseContain(unref(form).vehicle_type, t) : ssrLooseEqual(unref(form).vehicle_type, t)) ? " selected" : ""}>${ssrInterpolate(t)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="form-label">Status</label><select class="form-input"><option${ssrRenderAttr("value", true)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).is_active) ? ssrLooseContain(unref(form).is_active, true) : ssrLooseEqual(unref(form).is_active, true)) ? " selected" : ""}>Active</option><option${ssrRenderAttr("value", false)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).is_active) ? ssrLooseContain(unref(form).is_active, false) : ssrLooseEqual(unref(form).is_active, false)) ? " selected" : ""}>Inactive</option></select></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Interval (km)</label><input${ssrRenderAttr("value", unref(form).interval_km)} type="number" class="form-input" placeholder="5000"></div><div><label class="form-label">Interval (days)</label><input${ssrRenderAttr("value", unref(form).interval_days)} type="number" class="form-input" placeholder="90"></div></div><div><label class="form-label">Description</label><textarea class="form-input" rows="2" placeholder="Describe what this maintenance involves\u2026">${ssrInterpolate(unref(form).description)}</textarea></div>`);
          if (unref(formError)) {
            _push2(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(formError))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex gap-3 pt-1"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "Saving\u2026" : unref(editing) ? "Update Rule" : "Add Rule")}</button><button type="button" class="btn-secondary">Cancel</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/maintenance/rules/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BtokNzsa.mjs.map
