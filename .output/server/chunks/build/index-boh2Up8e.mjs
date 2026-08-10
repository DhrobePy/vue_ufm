import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, unref, mergeProps, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderTeleport, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
    useToast();
    const route = useRoute();
    const id = Number(route.params.id);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/fleet/drivers/${id}`,
      "$umVJHDvW4F"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const driver = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.driver) != null ? _b : null;
    });
    const documents = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.documents) != null ? _b : [];
    });
    const employment = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.employment) != null ? _b : [];
    });
    const trips = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.trips) != null ? _b : [];
    });
    const activeTab = ref("summary");
    const tabs = [
      { key: "summary", label: "Summary" },
      { key: "documents", label: "Documents" },
      { key: "employment", label: "Employment" },
      { key: "trips", label: "Trips" }
    ];
    const driverFields = computed(() => {
      const d = driver.value;
      if (!d) return [];
      return [
        { label: "Full Name", value: d.full_name },
        { label: "Mobile", value: d.mobile },
        { label: "NID", value: d.nid },
        { label: "Address", value: d.address },
        { label: "Joining Date", value: d.joining_date },
        { label: "Status", value: d.status }
      ];
    });
    function isExpired(d) {
      return d && new Date(d) < /* @__PURE__ */ new Date();
    }
    function isExpiringSoon(d) {
      if (!d) return false;
      const diff = (new Date(d).getTime() - Date.now()) / 864e5;
      return diff >= 0 && diff <= 30;
    }
    const docModal = ref(false);
    const docForm = reactive({ document_type: "", document_number: "", issue_date: "", expiry_date: "", notes: "" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      if (unref(driver)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(driver).full_name,
          subtitle: `${unref(driver).mobile || ""} \xB7 ${unref(driver).status}`,
          breadcrumb: ["Fleet", "Drivers", unref(driver).full_name]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, {
                status: unref(driver).status
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/fleet/drivers/${unref(id)}/edit`,
                class: "btn-secondary text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Edit`);
                  } else {
                    return [
                      createTextVNode("Edit")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, {
                  status: unref(driver).status
                }, null, 8, ["status"]),
                createVNode(_component_NuxtLink, {
                  to: `/fleet/drivers/${unref(id)}/edit`,
                  class: "btn-secondary text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Edit")
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="flex gap-1 border-b border-white/[0.07]"><!--[-->`);
        ssrRenderList(tabs, (t) => {
          _push(`<button class="${ssrRenderClass([unref(activeTab) === t.key ? "text-gold-400 border-b-2 border-gold-400" : "text-gray-500 hover:text-gray-300", "px-4 py-2 text-xs font-medium transition-colors"])}">${ssrInterpolate(t.label)}</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(activeTab) === "summary") {
          _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><h3 class="section-title mb-4">Personal Details</h3><dl class="space-y-3 text-sm"><!--[-->`);
          ssrRenderList(unref(driverFields), (f) => {
            _push(`<div class="flex justify-between"><dt class="text-gray-500">${ssrInterpolate(f.label)}</dt><dd class="text-gray-200 font-medium">${ssrInterpolate(f.value || "\u2014")}</dd></div>`);
          });
          _push(`<!--]--></dl></div><div class="space-y-4"><div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Assigned Vehicle</h4>`);
          if (unref(driver).vehicle_no) {
            _push(`<p class="font-mono text-sm font-bold text-gold-400/90">${ssrInterpolate(unref(driver).vehicle_no)}</p>`);
          } else {
            _push(`<p class="text-gray-600 text-sm">No vehicle assigned</p>`);
          }
          _push(`</div>`);
          if (unref(driver).emergency_contact_name) {
            _push(`<div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Emergency Contact</h4><p class="text-sm text-gray-200">${ssrInterpolate(unref(driver).emergency_contact_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(driver).emergency_contact_mobile || "")}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(driver).remarks) {
            _push(`<div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Remarks</h4><p class="text-xs text-gray-400">${ssrInterpolate(unref(driver).remarks)}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "documents") {
          _push(`<div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h3 class="section-title">Driver Documents</h3><button class="btn-gold text-xs">+ Add Document</button></div>`);
          if (!unref(documents).length) {
            _push(`<div class="text-center py-6 text-gray-600 text-sm">No documents recorded</div>`);
          } else {
            _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Type</th><th class="pb-2 text-left text-gray-500">Document No</th><th class="pb-2 text-left text-gray-500">Issue Date</th><th class="pb-2 text-left text-gray-500">Expiry Date</th><th class="pb-2 text-left text-gray-500">Notes</th><th class="pb-2 text-left text-gray-500">Status</th><th class="pb-2"></th></tr></thead><tbody><!--[-->`);
            ssrRenderList(unref(documents), (d) => {
              _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300 font-medium">${ssrInterpolate(d.document_type)}</td><td class="py-2 font-mono text-gray-400">${ssrInterpolate(d.document_number || "\u2014")}</td><td class="py-2 text-gray-400">${ssrInterpolate(d.issue_date || "\u2014")}</td><td class="${ssrRenderClass([isExpired(d.expiry_date) ? "text-red-400" : isExpiringSoon(d.expiry_date) ? "text-amber-400" : "text-gray-400", "py-2"])}">${ssrInterpolate(d.expiry_date || "\u2014")}</td><td class="py-2 text-gray-400">${ssrInterpolate(d.notes || "\u2014")}</td><td class="py-2"><span class="${ssrRenderClass([isExpired(d.expiry_date) ? "bg-red-500/10 text-red-400" : isExpiringSoon(d.expiry_date) ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400", "badge text-[10px]"])}">${ssrInterpolate(isExpired(d.expiry_date) ? "Expired" : isExpiringSoon(d.expiry_date) ? "Expiring Soon" : "Valid")}</span></td><td class="py-2 text-right"><button class="text-gray-600 hover:text-red-400 transition-colors">\u2715</button></td></tr>`);
            });
            _push(`<!--]--></tbody></table>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(docModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-sm space-y-4"><h3 class="text-sm font-semibold text-gray-200">Add Document</h3><div class="space-y-3"><div><label class="field-label">Document Type *</label><input${ssrRenderAttr("value", unref(docForm).document_type)} type="text" class="field-input w-full" placeholder="e.g. Driving License"></div><div><label class="field-label">Document Number</label><input${ssrRenderAttr("value", unref(docForm).document_number)} type="text" class="field-input w-full"></div><div class="grid grid-cols-2 gap-3"><div><label class="field-label">Issue Date</label><input${ssrRenderAttr("value", unref(docForm).issue_date)} type="date" class="field-input w-full"></div><div><label class="field-label">Expiry Date</label><input${ssrRenderAttr("value", unref(docForm).expiry_date)} type="date" class="field-input w-full"></div></div><div><label class="field-label">Notes</label><input${ssrRenderAttr("value", unref(docForm).notes)} type="text" class="field-input w-full"></div></div><div class="flex gap-2 pt-1"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button${ssrIncludeBooleanAttr(!unref(docForm).document_type) ? " disabled" : ""} class="btn-gold text-xs flex-1 justify-center disabled:opacity-40">Save</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        if (unref(activeTab) === "employment") {
          _push(`<div><div class="glass-card p-5"><h3 class="section-title mb-4">Employment History</h3>`);
          if (!unref(employment).length) {
            _push(`<div class="text-center py-6 text-gray-600 text-sm">No employment history recorded</div>`);
          } else {
            _push(`<div class="space-y-3"><!--[-->`);
            ssrRenderList(unref(employment), (e) => {
              _push(`<div class="p-3 rounded-xl bg-white/[0.03]"><p class="text-sm font-medium text-gray-200">${ssrInterpolate(e.company_name)}</p><p class="text-xs text-gray-400 mt-0.5">${ssrInterpolate(e.designation || "Driver")} \xB7 ${ssrInterpolate(e.start_date || "?")} \u2013 ${ssrInterpolate(e.end_date || "Present")}</p>`);
              if (e.remarks) {
                _push(`<p class="text-xs text-gray-600 mt-1">${ssrInterpolate(e.remarks)}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "trips") {
          _push(`<div><div class="glass-card p-5"><h3 class="section-title mb-4">Trip History</h3>`);
          if (!unref(trips).length) {
            _push(`<div class="text-center py-6 text-gray-600 text-sm">No trips found</div>`);
          } else {
            _push(`<div class="space-y-2"><!--[-->`);
            ssrRenderList(unref(trips), (t) => {
              _push(`<div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] cursor-pointer"><div class="flex-1"><p class="text-xs font-mono font-bold text-gold-400/80">${ssrInterpolate(t.trip_number)}</p><p class="text-[11px] text-gray-500">${ssrInterpolate(t.origin)} \u2192 ${ssrInterpolate(t.destination)}</p></div><div class="text-right"><p class="text-xs font-medium text-gray-300">\u09F3${ssrInterpolate(Number(t.trip_charge || 0).toLocaleString())}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(t.trip_date)}</p></div>`);
              _push(ssrRenderComponent(_component_UiStatusBadge, {
                status: t.trip_status
              }, null, _parent));
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/drivers/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-boh2Up8e.mjs.map
