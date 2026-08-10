import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, reactive, ref, withAsyncContext, computed, watch, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
    useToast();
    const form = reactive({
      commodityId: "",
      supplierId: "",
      poDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      origin: "",
      expectedDelivery: "",
      paymentTerms: "Credit 30",
      qty: 0,
      unitPrice: 0,
      remarks: ""
    });
    const submitting = ref(false);
    const { data: commData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/commodities",
      "$ooCX6n1MJA"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const commodities = computed(() => {
      var _a, _b;
      return (_b = (_a = commData.value) == null ? void 0 : _a.commodities) != null ? _b : [];
    });
    const { data: supData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/suppliers",
      { query: { per: 200 } },
      "$PxLfpTBhXf"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const suppliers = computed(() => {
      var _a, _b;
      return (_b = (_a = supData.value) == null ? void 0 : _a.suppliers) != null ? _b : [];
    });
    const selectedCommodity = computed(() => commodities.value.find((c) => c.id === Number(form.commodityId)));
    const selectedUnit = computed(() => {
      var _a, _b;
      return (_b = (_a = selectedCommodity.value) == null ? void 0 : _a.unit) != null ? _b : "MT";
    });
    const originOptions = computed(() => {
      var _a, _b;
      return (_b = (_a = selectedCommodity.value) == null ? void 0 : _a.origins) != null ? _b : [];
    });
    const eligibleSuppliers = computed(() => {
      var _a, _b;
      const ids = (_b = (_a = selectedCommodity.value) == null ? void 0 : _a.supplier_ids) != null ? _b : [];
      return ids.length ? suppliers.value.filter((s) => ids.includes(s.id)) : suppliers.value;
    });
    const supplierOptions = computed(() => eligibleSuppliers.value.map((s) => ({
      value: s.id,
      label: s.company_name
    })));
    watch(commodities, (list) => {
      var _a;
      if (!form.commodityId && list.length) {
        form.commodityId = ((_a = list.find((c) => c.name === "Wheat")) != null ? _a : list[0]).id;
      }
    }, { immediate: true });
    watch(() => form.commodityId, () => {
      if (form.origin && !originOptions.value.includes(form.origin)) form.origin = "";
      if (form.supplierId && !eligibleSuppliers.value.some((s) => s.id === Number(form.supplierId))) form.supplierId = "";
    });
    const totalValue = computed(() => Math.round(form.qty * form.unitPrice));
    const isValid = computed(() => form.commodityId && form.supplierId && form.poDate && form.qty > 0 && form.unitPrice > 0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSearchSelect = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create Purchase Order",
        breadcrumb: ["Purchase", "Create PO"]
      }, null, _parent));
      _push(`<div class="glass-card p-6 space-y-5"><h3 class="section-title">PO Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commodity *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).commodityId) ? ssrLooseContain(unref(form).commodityId, "") : ssrLooseEqual(unref(form).commodityId, "")) ? " selected" : ""}>Select commodity\u2026</option><!--[-->`);
      ssrRenderList(unref(commodities), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).commodityId) ? ssrLooseContain(unref(form).commodityId, c.id) : ssrLooseEqual(unref(form).commodityId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/commodities",
        class: "text-[11px] text-gold-500 hover:text-gold-400"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`+ Manage catalog`);
          } else {
            return [
              createTextVNode("+ Manage catalog")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier *</label>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(form).supplierId,
        "onUpdate:modelValue": ($event) => unref(form).supplierId = $event,
        options: unref(supplierOptions),
        placeholder: "Search supplier\u2026"
      }, null, _parent));
      _push(`</div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">PO Date *</label><input${ssrRenderAttr("value", unref(form).poDate)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Origin</label>`);
      if (unref(originOptions).length) {
        _push(`<select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).origin) ? ssrLooseContain(unref(form).origin, "") : ssrLooseEqual(unref(form).origin, "")) ? " selected" : ""}>Select origin\u2026</option><!--[-->`);
        ssrRenderList(unref(originOptions), (o) => {
          _push(`<option${ssrRenderAttr("value", o)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).origin) ? ssrLooseContain(unref(form).origin, o) : ssrLooseEqual(unref(form).origin, o)) ? " selected" : ""}>${ssrInterpolate(o)}</option>`);
        });
        _push(`<!--]--></select>`);
      } else {
        _push(`<input${ssrRenderAttr("value", unref(form).origin)} class="input-glass" placeholder="Optional \u2014 e.g. supplier location">`);
      }
      _push(`</div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Delivery</label><input${ssrRenderAttr("value", unref(form).expectedDelivery)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Terms *</label><select class="input-glass"><option value="Advance"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "Advance") : ssrLooseEqual(unref(form).paymentTerms, "Advance")) ? " selected" : ""}>Advance (Pay Before Delivery)</option><option value="Credit 30"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "Credit 30") : ssrLooseEqual(unref(form).paymentTerms, "Credit 30")) ? " selected" : ""}>Credit \u2014 30 Days</option><option value="Credit 60"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "Credit 60") : ssrLooseEqual(unref(form).paymentTerms, "Credit 60")) ? " selected" : ""}>Credit \u2014 60 Days</option><option value="Credit 90"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "Credit 90") : ssrLooseEqual(unref(form).paymentTerms, "Credit 90")) ? " selected" : ""}>Credit \u2014 90 Days</option><option value="Credit 120"${ssrIncludeBooleanAttr(Array.isArray(unref(form).paymentTerms) ? ssrLooseContain(unref(form).paymentTerms, "Credit 120") : ssrLooseEqual(unref(form).paymentTerms, "Credit 120")) ? " selected" : ""}>Credit \u2014 120 Days</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity (${ssrInterpolate(unref(selectedUnit))}) *</label><input${ssrRenderAttr("value", unref(form).qty)} type="number" min="0" step="0.5" class="input-glass" placeholder="0.000"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price / ${ssrInterpolate(unref(selectedUnit))} (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).unitPrice)} type="number" min="0" class="input-glass" placeholder="0.00"></div><div class="md:col-span-2 p-4 rounded-xl" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border": "1px solid rgba(245,158,11,0.15)" })}"><div class="flex justify-between text-sm"><span class="text-gray-500">Total Order Value</span><span class="font-bold text-gold-400 text-lg">\u09F3${ssrInterpolate(unref(totalValue).toLocaleString())}</span></div></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks</label><textarea rows="2" class="input-glass resize-none" placeholder="Any remarks for this PO\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div></div><div class="flex justify-end gap-3 pt-2">`);
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
//# sourceMappingURL=create-CfsS6B_f.mjs.map
