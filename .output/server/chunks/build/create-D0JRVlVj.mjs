import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, reactive, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
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
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      categoryId: "",
      subcategoryId: "",
      qty: 1,
      unitCost: 0,
      method: "Cash",
      handledBy: "",
      remarks: ""
    });
    const submitting = ref(false);
    const methods = ["Cash", "Bank Transfer", "Cheque", "Mobile Banking"];
    const { data: catData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/expenses/categories",
      "$PHCzFYpnZa"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const categories = computed(() => {
      var _a, _b;
      return (_b = (_a = catData.value) == null ? void 0 : _a.categories) != null ? _b : [];
    });
    const selectedCategory = computed(
      () => {
        var _a;
        return (_a = categories.value.find((c) => c.id === form.categoryId)) != null ? _a : null;
      }
    );
    const totalAmount = computed(() => (form.qty || 1) * (form.unitCost || 0));
    const isValid = computed(() => form.date && form.categoryId && form.remarks.trim());
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-2xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create Expense",
        breadcrumb: ["Expenses", "Create"]
      }, null, _parent));
      _push(`<div class="glass-card p-6 space-y-5"><h3 class="section-title">Expense Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).categoryId) ? ssrLooseContain(unref(form).categoryId, "") : ssrLooseEqual(unref(form).categoryId, "")) ? " selected" : ""}>Select category\u2026</option><!--[-->`);
      ssrRenderList(unref(categories), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).categoryId) ? ssrLooseContain(unref(form).categoryId, c.id) : ssrLooseEqual(unref(form).categoryId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if ((_b = (_a = unref(selectedCategory)) == null ? void 0 : _a.subcategories) == null ? void 0 : _b.length) {
        _push(`<div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub-category</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).subcategoryId) ? ssrLooseContain(unref(form).subcategoryId, "") : ssrLooseEqual(unref(form).subcategoryId, "")) ? " selected" : ""}>None</option><!--[-->`);
        ssrRenderList(unref(selectedCategory).subcategories, (s) => {
          _push(`<option${ssrRenderAttr("value", s.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).subcategoryId) ? ssrLooseContain(unref(form).subcategoryId, s.id) : ssrLooseEqual(unref(form).subcategoryId, s.id)) ? " selected" : ""}>${ssrInterpolate(s.name)}</option>`);
        });
        _push(`<!--]--></select></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Quantity</label><input${ssrRenderAttr("value", unref(form).qty)} type="number" class="input-glass" placeholder="e.g. litres, units"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Per Unit Cost (\u09F3)</label><input${ssrRenderAttr("value", unref(form).unitCost)} type="number" class="input-glass" placeholder="0.00"></div><div class="md:col-span-2 p-4 rounded-xl" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border": "1px solid rgba(245,158,11,0.15)" })}"><div class="flex justify-between text-sm"><span class="text-gray-500">Total Amount</span><span class="font-bold text-gold-400 text-lg">\u09F3${ssrInterpolate(unref(totalAmount).toLocaleString())}</span></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</label><select class="input-glass"><!--[-->`);
      ssrRenderList(methods, (m) => {
        _push(`<option${ssrRenderAttr("value", m)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, m) : ssrLooseEqual(unref(form).method, m)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Handled By</label><input${ssrRenderAttr("value", unref(form).handledBy)} class="input-glass" placeholder="Employee / person name"></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Remarks *</label><textarea rows="3" class="input-glass resize-none" placeholder="Describe the expense clearly\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div></div><div class="flex justify-end gap-3 pt-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/expenses",
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
      _push(` ${ssrInterpolate(unref(submitting) ? "Submitting\u2026" : "Submit for Approval")}</button></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-D0JRVlVj.mjs.map
