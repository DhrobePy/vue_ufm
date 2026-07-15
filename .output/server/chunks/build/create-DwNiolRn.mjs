import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
      "$7OPvEos1MX"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = branchData.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const form = reactive({
      name: "",
      phone: "",
      nid: "",
      dob: "",
      address: "",
      licenseNo: "",
      licenseClass: "professional",
      licenseExpiry: "",
      employmentType: "Permanent",
      branch_id: "",
      salary: null,
      emergencyName: "",
      emergencyPhone: "",
      notes: ""
    });
    const saving = ref(false);
    const isValid = computed(
      () => form.name && form.phone && form.nid && form.licenseNo && form.licenseExpiry
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Add Driver",
        subtitle: "Register a new driver in the fleet",
        breadcrumb: ["Logistics", "Drivers", "Add Driver"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/logistics/drivers",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All Drivers`);
                } else {
                  return [
                    createTextVNode("\u2190 All Drivers")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/logistics/drivers",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All Drivers")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-6 space-y-5"><h3 class="section-title">Driver Information</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name *</label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="input-glass" placeholder="Md. Firstname Lastname"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone *</label><input${ssrRenderAttr("value", unref(form).phone)} type="tel" class="input-glass" placeholder="+880 1xxx-xxxxxx"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">National ID (NID) *</label><input${ssrRenderAttr("value", unref(form).nid)} type="text" class="input-glass font-mono" placeholder="10 or 17-digit NID"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date of Birth</label><input${ssrRenderAttr("value", unref(form).dob)} type="date" class="input-glass"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Permanent Address</label><textarea rows="2" class="input-glass resize-none" placeholder="Village, Union, Upazila, District">${ssrInterpolate(unref(form).address)}</textarea></div><div class="space-y-3 pt-2"><h3 class="text-sm font-semibold text-gray-300">Driving License</h3><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">License No. *</label><input${ssrRenderAttr("value", unref(form).licenseNo)} type="text" class="input-glass font-mono" placeholder="BRTA license #"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">License Class</label><select class="input-glass"><option value="light"${ssrIncludeBooleanAttr(Array.isArray(unref(form).licenseClass) ? ssrLooseContain(unref(form).licenseClass, "light") : ssrLooseEqual(unref(form).licenseClass, "light")) ? " selected" : ""}>Light Vehicle</option><option value="medium"${ssrIncludeBooleanAttr(Array.isArray(unref(form).licenseClass) ? ssrLooseContain(unref(form).licenseClass, "medium") : ssrLooseEqual(unref(form).licenseClass, "medium")) ? " selected" : ""}>Medium Vehicle</option><option value="heavy"${ssrIncludeBooleanAttr(Array.isArray(unref(form).licenseClass) ? ssrLooseContain(unref(form).licenseClass, "heavy") : ssrLooseEqual(unref(form).licenseClass, "heavy")) ? " selected" : ""}>Heavy Vehicle</option><option value="professional"${ssrIncludeBooleanAttr(Array.isArray(unref(form).licenseClass) ? ssrLooseContain(unref(form).licenseClass, "professional") : ssrLooseEqual(unref(form).licenseClass, "professional")) ? " selected" : ""}>Special / Professional</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">License Expiry *</label><input${ssrRenderAttr("value", unref(form).licenseExpiry)} type="date" class="input-glass"></div></div></div><div class="space-y-3 pt-2"><h3 class="text-sm font-semibold text-gray-300">Employment</h3><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver Type</label><select class="input-glass"><option value="Permanent"${ssrIncludeBooleanAttr(Array.isArray(unref(form).employmentType) ? ssrLooseContain(unref(form).employmentType, "Permanent") : ssrLooseEqual(unref(form).employmentType, "Permanent")) ? " selected" : ""}>Permanent</option><option value="Temporary"${ssrIncludeBooleanAttr(Array.isArray(unref(form).employmentType) ? ssrLooseContain(unref(form).employmentType, "Temporary") : ssrLooseEqual(unref(form).employmentType, "Temporary")) ? " selected" : ""}>Temporary / Contract</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Branch</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch_id) ? ssrLooseContain(unref(form).branch_id, "") : ssrLooseEqual(unref(form).branch_id, "")) ? " selected" : ""}>\u2014 None \u2014</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch_id) ? ssrLooseContain(unref(form).branch_id, b.id) : ssrLooseEqual(unref(form).branch_id, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Salary (\u09F3)</label><input${ssrRenderAttr("value", unref(form).salary)} type="number" class="input-glass font-mono"></div></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emergency Contact Name</label><input${ssrRenderAttr("value", unref(form).emergencyName)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emergency Contact Phone</label><input${ssrRenderAttr("value", unref(form).emergencyPhone)} type="tel" class="input-glass"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label><textarea rows="2" class="input-glass resize-none" placeholder="Any additional information\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div><div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Registering\u2026" : "Register Driver")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/logistics/drivers",
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
      _push(`</div></div><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Driver Card Preview</h3><div class="rounded-xl border border-white/10 p-4 bg-white/[0.02] space-y-3"><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-lg font-bold text-gold-400">${ssrInterpolate(unref(form).name ? unref(form).name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?")}</div><div><p class="text-sm font-bold text-gray-200">${ssrInterpolate(unref(form).name || "Driver Name")}</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(form).phone || "+880 1xxx-xxxxxx")}</p></div></div><div class="space-y-1.5 text-xs"><div class="flex justify-between"><span class="text-gray-600">License</span><span class="font-mono text-gray-300">${ssrInterpolate(unref(form).licenseNo || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Class</span><span class="text-gray-300 capitalize">${ssrInterpolate(unref(form).licenseClass)}</span></div><div class="flex justify-between"><span class="text-gray-600">Branch</span><span class="text-gray-300">${ssrInterpolate(((_a = unref(branches).find((b) => b.id === Number(unref(form).branch_id))) == null ? void 0 : _a.name) || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Type</span><span class="text-gray-300">${ssrInterpolate(unref(form).employmentType)}</span></div><div class="flex justify-between"><span class="text-gray-600">License Expiry</span><span class="${ssrRenderClass(unref(form).licenseExpiry && new Date(unref(form).licenseExpiry) < /* @__PURE__ */ new Date() ? "text-red-400" : "text-gray-300")}">${ssrInterpolate(unref(form).licenseExpiry || "\u2014")}</span></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/drivers/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-DwNiolRn.mjs.map
