import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
    useToast();
    const [{ data: branchData }, { data: posData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/branches",
        "$Vp6VMXAOrr"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/positions",
        "$iEgWuVNcuk"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = branchData.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const positions = computed(() => {
      var _a, _b;
      return (_b = (_a = posData.value) == null ? void 0 : _a.positions) != null ? _b : [];
    });
    const form = reactive({
      name: "",
      email: "",
      phone: "",
      nid: "",
      dob: "",
      address: "",
      position_id: "",
      branch_id: 1,
      employmentType: "permanent",
      joinDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      salary: null,
      notes: ""
    });
    const saving = ref(false);
    const isValid = computed(
      () => form.name && form.phone && form.joinDate && form.salary
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Add Employee",
        subtitle: "Register a new staff member",
        breadcrumb: ["Admin", "Employees", "Add Employee"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/admin/employees",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All Employees`);
                } else {
                  return [
                    createTextVNode("\u2190 All Employees")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/admin/employees",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All Employees")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Personal Information</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name *</label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="input-glass" placeholder="Md. Firstname Lastname"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone *</label><input${ssrRenderAttr("value", unref(form).phone)} type="tel" class="input-glass" placeholder="+880 1xxx-xxxxxx"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label><input${ssrRenderAttr("value", unref(form).email)} type="email" class="input-glass" placeholder="staff@ujjalfm.com"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date of Birth</label><input${ssrRenderAttr("value", unref(form).dob)} type="date" class="input-glass"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Permanent Address</label><textarea rows="2" class="input-glass resize-none" placeholder="Village, Upazila, District">${ssrInterpolate(unref(form).address)}</textarea></div></div><div class="glass-card p-6 space-y-5"><h3 class="section-title">Employment Details</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).position_id) ? ssrLooseContain(unref(form).position_id, "") : ssrLooseEqual(unref(form).position_id, "")) ? " selected" : ""}>\u2014 Select position \u2014</option><!--[-->`);
      ssrRenderList(unref(positions), (p) => {
        _push(`<option${ssrRenderAttr("value", p.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).position_id) ? ssrLooseContain(unref(form).position_id, p.id) : ssrLooseEqual(unref(form).position_id, p.id)) ? " selected" : ""}>${ssrInterpolate(p.title)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branch *</label><select class="input-glass"><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch_id) ? ssrLooseContain(unref(form).branch_id, b.id) : ssrLooseEqual(unref(form).branch_id, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employment Type</label><select class="input-glass"><option value="permanent"${ssrIncludeBooleanAttr(Array.isArray(unref(form).employmentType) ? ssrLooseContain(unref(form).employmentType, "permanent") : ssrLooseEqual(unref(form).employmentType, "permanent")) ? " selected" : ""}>Permanent</option><option value="contract"${ssrIncludeBooleanAttr(Array.isArray(unref(form).employmentType) ? ssrLooseContain(unref(form).employmentType, "contract") : ssrLooseEqual(unref(form).employmentType, "contract")) ? " selected" : ""}>Contract</option><option value="daily"${ssrIncludeBooleanAttr(Array.isArray(unref(form).employmentType) ? ssrLooseContain(unref(form).employmentType, "daily") : ssrLooseEqual(unref(form).employmentType, "daily")) ? " selected" : ""}>Daily Labour</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Join Date *</label><input${ssrRenderAttr("value", unref(form).joinDate)} type="date" class="input-glass"></div><div class="space-y-1.5 sm:col-span-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Salary (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).salary)} type="number" class="input-glass font-mono"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label><textarea rows="2" class="input-glass resize-none" placeholder="Additional details\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div><div class="flex items-center gap-3"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Adding\u2026" : "Add Employee")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/employees",
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
      _push(`</div></div><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Summary</h3><div class="space-y-2.5 text-xs"><div class="flex justify-between"><span class="text-gray-600">Name</span><span class="text-gray-300">${ssrInterpolate(unref(form).name || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Position</span><span class="text-gray-300">${ssrInterpolate(((_a = unref(positions).find((p) => p.id === Number(unref(form).position_id))) == null ? void 0 : _a.title) || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Branch</span><span class="text-gray-300">${ssrInterpolate(((_b = unref(branches).find((b) => b.id === Number(unref(form).branch_id))) == null ? void 0 : _b.name) || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Type</span><span class="text-gray-300 capitalize">${ssrInterpolate(unref(form).employmentType)}</span></div><div class="flex justify-between"><span class="text-gray-600">Salary</span><span class="font-mono text-gold-400">${ssrInterpolate(unref(form).salary ? `\u09F3${unref(form).salary.toLocaleString()}` : "\u2014")}</span></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/employees/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-C6heYyoI.mjs.map
