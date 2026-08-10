import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { l as useRouter } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
    useRouter();
    const loading = ref(false);
    const error = ref("");
    const { data: vData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/vehicles",
      "$olreEfHqh7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const docTypes = ["Driving License", "NID", "Passport", "Birth Certificate", "Medical Certificate", "Other"];
    const form = reactive({
      full_name: "",
      mobile: "",
      nid: "",
      address: "",
      joining_date: "",
      photo_url: "",
      emergency_contact_name: "",
      emergency_contact_mobile: "",
      status: "active",
      assigned_vehicle_id: "",
      remarks: "",
      documents: [],
      employment_history: []
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-2xl mx-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Add Driver",
        breadcrumb: ["Fleet", "Drivers", "Add"]
      }, null, _parent));
      _push(`<form class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="section-title">Personal Information</h3><div class="grid grid-cols-2 gap-4"><div class="col-span-2"><label class="form-label">Full Name *</label><input${ssrRenderAttr("value", unref(form).full_name)} class="form-input" required placeholder="e.g. Kamal Hossain"></div><div><label class="form-label">Mobile</label><input${ssrRenderAttr("value", unref(form).mobile)} class="form-input" placeholder="01711-XXXXXX"></div><div><label class="form-label">NID No</label><input${ssrRenderAttr("value", unref(form).nid)} class="form-input" placeholder="National ID number"></div><div><label class="form-label">Joining Date</label><input${ssrRenderAttr("value", unref(form).joining_date)} type="date" class="form-input"></div><div><label class="form-label">Status</label><select class="form-input"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "inactive") : ssrLooseEqual(unref(form).status, "inactive")) ? " selected" : ""}>Inactive</option><option value="suspended"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "suspended") : ssrLooseEqual(unref(form).status, "suspended")) ? " selected" : ""}>Suspended</option></select></div><div class="col-span-2"><label class="form-label">Address</label><textarea class="form-input" rows="2" placeholder="Home address">${ssrInterpolate(unref(form).address)}</textarea></div><div><label class="form-label">Photo URL</label><input${ssrRenderAttr("value", unref(form).photo_url)} class="form-input" placeholder="https://\u2026"></div><div><label class="form-label">Assigned Vehicle</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).assigned_vehicle_id) ? ssrLooseContain(unref(form).assigned_vehicle_id, "") : ssrLooseEqual(unref(form).assigned_vehicle_id, "")) ? " selected" : ""}>\u2014 None \u2014</option><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).assigned_vehicle_id) ? ssrLooseContain(unref(form).assigned_vehicle_id, v.id) : ssrLooseEqual(unref(form).assigned_vehicle_id, v.id)) ? " selected" : ""}>${ssrInterpolate(v.registration_no)}</option>`);
      });
      _push(`<!--]--></select></div></div></div><div class="glass-card p-5 space-y-4"><h3 class="section-title">Emergency Contact</h3><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Contact Name</label><input${ssrRenderAttr("value", unref(form).emergency_contact_name)} class="form-input" placeholder="Father/Spouse/Friend"></div><div><label class="form-label">Contact Mobile</label><input${ssrRenderAttr("value", unref(form).emergency_contact_mobile)} class="form-input" placeholder="01711-XXXXXX"></div></div></div><div class="glass-card p-5 space-y-3"><div class="flex items-center justify-between"><h3 class="section-title">Documents</h3><button type="button" class="btn-secondary text-xs">+ Add Document</button></div><!--[-->`);
      ssrRenderList(unref(form).documents, (doc, i) => {
        _push(`<div class="grid grid-cols-5 gap-3 p-3 rounded-xl bg-white/[0.03]"><div><label class="form-label">Type</label><select class="form-input"><!--[-->`);
        ssrRenderList(docTypes, (t) => {
          _push(`<option${ssrRenderAttr("value", t)}${ssrIncludeBooleanAttr(Array.isArray(doc.document_type) ? ssrLooseContain(doc.document_type, t) : ssrLooseEqual(doc.document_type, t)) ? " selected" : ""}>${ssrInterpolate(t)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">Document No</label><input${ssrRenderAttr("value", doc.document_no)} class="form-input"></div><div><label class="form-label">Issue Date</label><input${ssrRenderAttr("value", doc.issue_date)} type="date" class="form-input"></div><div><label class="form-label">Expiry Date</label><input${ssrRenderAttr("value", doc.expiry_date)} type="date" class="form-input"></div><div class="flex items-end"><button type="button" class="btn-secondary text-xs text-red-400 border-red-500/20 w-full">Remove</button></div></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(form).documents.length) {
        _push(`<div class="text-center py-3 text-gray-600 text-xs">No documents added yet</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="glass-card p-5 space-y-3"><div class="flex items-center justify-between"><h3 class="section-title">Employment History</h3><button type="button" class="btn-secondary text-xs">+ Add</button></div><!--[-->`);
      ssrRenderList(unref(form).employment_history, (emp, i) => {
        _push(`<div class="grid grid-cols-4 gap-3 p-3 rounded-xl bg-white/[0.03]"><div><label class="form-label">Company</label><input${ssrRenderAttr("value", emp.company_name)} class="form-input"></div><div><label class="form-label">Designation</label><input${ssrRenderAttr("value", emp.designation)} class="form-input"></div><div><label class="form-label">Start Date</label><input${ssrRenderAttr("value", emp.start_date)} type="date" class="form-input"></div><div><label class="form-label">End Date</label><input${ssrRenderAttr("value", emp.end_date)} type="date" class="form-input"></div><div class="col-span-3"><label class="form-label">Remarks</label><input${ssrRenderAttr("value", emp.remarks)} class="form-input"></div><div class="flex items-end"><button type="button" class="btn-secondary text-xs text-red-400 border-red-500/20 w-full">Remove</button></div></div>`);
      });
      _push(`<!--]--></div><div><label class="form-label">Remarks</label><textarea class="form-input" rows="2" placeholder="Any additional notes\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div>`);
      if (unref(error)) {
        _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-3"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Saving\u2026" : "Save Driver")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/drivers",
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/drivers/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-KIPSb8_c.mjs.map
