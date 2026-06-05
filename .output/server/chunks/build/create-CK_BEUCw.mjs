import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, reactive, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
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
    const form = reactive({
      supplierId: "",
      poDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      origin: "",
      expectedDelivery: "",
      qty: 0,
      unitPrice: 0,
      remarks: ""
    });
    const submitting = ref(false);
    const wheatOrigins = ["\u0995\u09BE\u09A8\u09BE\u09A1\u09BE", "\u09B0\u09BE\u09B6\u09BF\u09AF\u09BC\u09BE", "Australia", "Ukraine", "India", "Local", "Brazil", "Other"];
    const { data: supData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/suppliers",
      { query: { per: 200 } },
      "$ooCX6n1MJA"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const suppliers = computed(() => {
      var _a, _b;
      return (_b = (_a = supData.value) == null ? void 0 : _a.suppliers) != null ? _b : [];
    });
    const totalValue = computed(() => Math.round(form.qty * form.unitPrice));
    const isValid = computed(() => form.supplierId && form.poDate && form.qty > 0 && form.unitPrice > 0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create Purchase Order",
        breadcrumb: ["Purchase", "Create PO"]
      }, null, _parent));
      _push(`<div class="glass-card p-6 space-y-5"><h3 class="section-title">PO Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).supplierId) ? ssrLooseContain(unref(form).supplierId, "") : ssrLooseEqual(unref(form).supplierId, "")) ? " selected" : ""}>Select supplier\u2026</option><!--[-->`);
      ssrRenderList(unref(suppliers), (s) => {
        _push(`<option${ssrRenderAttr("value", s.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).supplierId) ? ssrLooseContain(unref(form).supplierId, s.id) : ssrLooseEqual(unref(form).supplierId, s.id)) ? " selected" : ""}>${ssrInterpolate(s.company_name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">PO Date *</label><input${ssrRenderAttr("value", unref(form).poDate)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Wheat Origin</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).origin) ? ssrLooseContain(unref(form).origin, "") : ssrLooseEqual(unref(form).origin, "")) ? " selected" : ""}>Select origin\u2026</option><!--[-->`);
      ssrRenderList(wheatOrigins, (o) => {
        _push(`<option${ssrRenderAttr("value", o)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).origin) ? ssrLooseContain(unref(form).origin, o) : ssrLooseEqual(unref(form).origin, o)) ? " selected" : ""}>${ssrInterpolate(o)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Delivery</label><input${ssrRenderAttr("value", unref(form).expectedDelivery)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity (MT) *</label><input${ssrRenderAttr("value", unref(form).qty)} type="number" min="0" step="0.5" class="input-glass" placeholder="0.000"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price / MT (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).unitPrice)} type="number" min="0" class="input-glass" placeholder="0.00"></div><div class="md:col-span-2 p-4 rounded-xl" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border": "1px solid rgba(245,158,11,0.15)" })}"><div class="flex justify-between text-sm"><span class="text-gray-500">Total Order Value</span><span class="font-bold text-gold-400 text-lg">\u09F3${ssrInterpolate(unref(totalValue).toLocaleString())}</span></div></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</label><textarea rows="2" class="input-glass resize-none" placeholder="Any remarks for this PO\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div></div><div class="flex justify-end gap-3 pt-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/orders",
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
      _push(`<button${ssrIncludeBooleanAttr(unref(submitting) || !unref(isValid)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(submitting)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(submitting) ? "Submitting\u2026" : "Submit PO")}</button></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/orders/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-CK_BEUCw.mjs.map
