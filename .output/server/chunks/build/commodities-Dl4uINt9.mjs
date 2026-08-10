import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
  __name: "commodities",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, pending, error: fetchError, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/commodities",
      "$-t0ddQk6Ye"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const commodities = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.commodities) != null ? _b : [];
    });
    const { data: supData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/suppliers",
      { query: { per: 500 } },
      "$e66y7ao22K"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allSuppliers = computed(() => {
      var _a, _b;
      return (_b = (_a = supData.value) == null ? void 0 : _a.suppliers) != null ? _b : [];
    });
    const units = ["KG", "MT", "pcs", "bag", "litre", "ton", "box"];
    const showModal = ref(false);
    const saving = ref(false);
    const editingId = ref(null);
    const originsText = ref("");
    const emptyForm = () => ({ name: "", unit: "KG", status: "active", supplier_ids: [] });
    const form = reactive(emptyForm());
    function openAdd() {
      Object.assign(form, emptyForm());
      originsText.value = "";
      editingId.value = null;
      showModal.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Commodities",
        subtitle: "Procurement catalog \u2014 one commodity per PO, each with its own unit, origins & suppliers",
        breadcrumb: ["Purchase", "Commodities"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs"${_scopeId}>+ Add Commodity</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: openAdd,
                class: "btn-gold text-xs"
              }, "+ Add Commodity")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><!--[-->`);
        ssrRenderList(unref(commodities), (c) => {
          _push(`<div class="glass-card p-5 space-y-3"><div class="flex items-start justify-between"><div><h3 class="text-sm font-bold text-gray-100">${ssrInterpolate(c.name)}</h3><p class="text-xs text-gray-500">Unit: <span class="font-mono text-gray-300">${ssrInterpolate(c.unit)}</span></p></div><button class="btn-ghost text-xs py-1 px-2.5">Edit</button></div><div class="text-xs text-gray-500"><span class="font-semibold text-gray-400">Origins:</span>`);
          if (c.origins.length) {
            _push(`<span>${ssrInterpolate(c.origins.join(", "))}</span>`);
          } else {
            _push(`<span class="text-gray-600"> none configured</span>`);
          }
          _push(`</div><div class="text-xs text-gray-500"><span class="font-semibold text-gray-400">Suppliers:</span>`);
          if (c.supplier_ids.length) {
            _push(`<span>${ssrInterpolate(c.supplier_ids.length)} linked (scoped)</span>`);
          } else {
            _push(`<span class="text-gray-600"> none linked \u2014 all active suppliers eligible</span>`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(commodities).length) {
          _push(`<div class="md:col-span-2 glass-card p-10 text-center text-xs text-gray-500"> No commodities yet \u2014 add one to start procuring beyond wheat. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"><div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4 my-8"><div class="flex items-center justify-between"><h3 class="text-lg font-bold text-gray-100">${ssrInterpolate(unref(editingId) ? "Edit Commodity" : "Add Commodity")}</h3><button class="text-gray-500 hover:text-gray-200 text-xl leading-none">\u2715</button></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="sm:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name *</label><input${ssrRenderAttr("value", unref(form).name)} class="input-glass" placeholder="e.g. Packaging Bags"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit</label><select class="input-glass"><!--[-->`);
          ssrRenderList(units, (u) => {
            _push2(`<option${ssrRenderAttr("value", u)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).unit) ? ssrLooseContain(unref(form).unit, u) : ssrLooseEqual(unref(form).unit, u)) ? " selected" : ""}>${ssrInterpolate(u)}</option>`);
          });
          _push2(`<!--]--></select></div>`);
          if (unref(editingId)) {
            _push2(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label><select class="input-glass"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "inactive") : ssrLooseEqual(unref(form).status, "inactive")) ? " selected" : ""}>Inactive</option></select></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="sm:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Origins (comma-separated)</label><textarea rows="2" class="input-glass resize-none" placeholder="e.g. China, India, Local">${ssrInterpolate(unref(originsText))}</textarea></div><div class="sm:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"> Linked Suppliers <span class="text-gray-600 normal-case font-normal">(leave empty to allow all)</span></label><div class="max-h-40 overflow-y-auto rounded-xl border border-white/[0.08] p-2 space-y-1"><!--[-->`);
          ssrRenderList(unref(allSuppliers), (s) => {
            _push2(`<label class="flex items-center gap-2 text-xs text-gray-300 py-0.5"><input type="checkbox"${ssrRenderAttr("value", s.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).supplier_ids) ? ssrLooseContain(unref(form).supplier_ids, s.id) : unref(form).supplier_ids) ? " checked" : ""} class="accent-gold-500"> ${ssrInterpolate(s.company_name)}</label>`);
          });
          _push2(`<!--]-->`);
          if (!unref(allSuppliers).length) {
            _push2(`<p class="text-xs text-gray-600 p-1">No suppliers found</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div></div><div class="flex gap-3 pt-2"><button${ssrIncludeBooleanAttr(!unref(form).name.trim() || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50">${ssrInterpolate(unref(saving) ? "Saving\u2026" : unref(editingId) ? "Save Changes" : "Add Commodity")}</button><button class="btn-ghost text-xs">Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/commodities.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=commodities-Dl4uINt9.mjs.map
