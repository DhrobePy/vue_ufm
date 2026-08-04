import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, watchEffect, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { k as useRoute, l as useRouter } from './server.mjs';
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
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useRouter();
    const id = Number(route.params.id);
    const loading = ref(false);
    const error = ref("");
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
      remarks: ""
    });
    const [{ data: driverData, pending }, { data: vehiclesData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        `/api/fleet/drivers/${id}`,
        "$qsAPYoYErY"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/fleet/vehicles",
        "$cy20EyuTCb"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vehiclesData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    watchEffect(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      const d = (_a = driverData.value) == null ? void 0 : _a.driver;
      if (!d) return;
      form.full_name = (_b = d.full_name) != null ? _b : "";
      form.mobile = (_c = d.mobile) != null ? _c : "";
      form.nid = (_d = d.nid) != null ? _d : "";
      form.address = (_e = d.address) != null ? _e : "";
      form.joining_date = (_f = d.joining_date) != null ? _f : "";
      form.photo_url = (_g = d.photo_url) != null ? _g : "";
      form.emergency_contact_name = (_h = d.emergency_contact_name) != null ? _h : "";
      form.emergency_contact_mobile = (_i = d.emergency_contact_mobile) != null ? _i : "";
      form.status = (_j = d.status) != null ? _j : "active";
      form.assigned_vehicle_id = (_k = d.assigned_vehicle_id) != null ? _k : "";
      form.remarks = (_l = d.remarks) != null ? _l : "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-2xl mx-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Edit Driver \u2014 ${unref(form).full_name || "\u2026"}`,
        breadcrumb: ["Fleet", "Drivers", unref(form).full_name || unref(id), "Edit"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/fleet/drivers/${unref(id)}`,
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
                to: `/fleet/drivers/${unref(id)}`,
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
        _push(`<div class="glass-card p-10 flex items-center justify-center"><span class="text-gray-500 text-sm">Loading driver data\u2026</span></div>`);
      } else {
        _push(`<form class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="section-title">Personal Information</h3><div class="grid grid-cols-2 gap-4"><div class="col-span-2"><label class="form-label">Full Name *</label><input${ssrRenderAttr("value", unref(form).full_name)} class="form-input" required placeholder="e.g. Kamal Hossain"></div><div><label class="form-label">Mobile</label><input${ssrRenderAttr("value", unref(form).mobile)} class="form-input" placeholder="01711-XXXXXX"></div><div><label class="form-label">NID No</label><input${ssrRenderAttr("value", unref(form).nid)} class="form-input" placeholder="National ID number"></div><div><label class="form-label">Joining Date</label><input${ssrRenderAttr("value", unref(form).joining_date)} type="date" class="form-input"></div><div><label class="form-label">Status</label><select class="form-input"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "inactive") : ssrLooseEqual(unref(form).status, "inactive")) ? " selected" : ""}>Inactive</option><option value="suspended"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "suspended") : ssrLooseEqual(unref(form).status, "suspended")) ? " selected" : ""}>Suspended</option></select></div><div class="col-span-2"><label class="form-label">Address</label><textarea class="form-input" rows="2" placeholder="Home address">${ssrInterpolate(unref(form).address)}</textarea></div><div><label class="form-label">Photo URL</label><input${ssrRenderAttr("value", unref(form).photo_url)} class="form-input" placeholder="https://\u2026"></div><div><label class="form-label">Assigned Vehicle</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).assigned_vehicle_id) ? ssrLooseContain(unref(form).assigned_vehicle_id, "") : ssrLooseEqual(unref(form).assigned_vehicle_id, "")) ? " selected" : ""}>\u2014 None \u2014</option><!--[-->`);
        ssrRenderList(unref(vehicles), (v) => {
          _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).assigned_vehicle_id) ? ssrLooseContain(unref(form).assigned_vehicle_id, v.id) : ssrLooseEqual(unref(form).assigned_vehicle_id, v.id)) ? " selected" : ""}>${ssrInterpolate(v.registration_no)}</option>`);
        });
        _push(`<!--]--></select></div></div></div><div class="glass-card p-5 space-y-4"><h3 class="section-title">Emergency Contact</h3><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Contact Name</label><input${ssrRenderAttr("value", unref(form).emergency_contact_name)} class="form-input" placeholder="Father/Spouse/Friend"></div><div><label class="form-label">Contact Mobile</label><input${ssrRenderAttr("value", unref(form).emergency_contact_mobile)} class="form-input" placeholder="01711-XXXXXX"></div></div></div><div class="glass-card p-5"><label class="form-label">Remarks</label><textarea class="form-input" rows="2" placeholder="Any additional notes\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div>`);
        if (unref(error)) {
          _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(error))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-3"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Saving\u2026" : "Update Driver")}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/fleet/drivers/${unref(id)}`,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/drivers/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=edit-D6ebDVDP.mjs.map
