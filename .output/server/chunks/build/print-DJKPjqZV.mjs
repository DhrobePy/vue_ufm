import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "print",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/purchase/grn/${route.params.id}`,
      "$xsQTn6KUbW"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const grn = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.grn) != null ? _b : {};
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(pending)) {
        _push(`<div class="p-8 text-center text-gray-500 text-sm">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="p-6 text-center text-red-500">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="no-print flex gap-3 p-4 border-b border-gray-200 bg-white"><button class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-2"> \u{1F5A8} Print Receipt </button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/grn/${unref(route).params.id}`,
          class: "px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u2190 Back `);
            } else {
              return [
                createTextVNode(" \u2190 Back ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="receipt max-w-4xl mx-auto bg-white p-10 text-gray-900"><div class="text-center border-b-2 border-gray-800 pb-6 mb-6"><h1 class="text-3xl font-bold">\u0989\u099C\u09CD\u099C\u09B2 \u09AB\u09CD\u09B2\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u09AE\u09BF\u09B2\u09B8</h1><p class="text-gray-600 mt-1">\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C, \u09A1\u09C7\u09AE\u09B0\u09BE, \u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE</p><p class="text-gray-600">info@ujjalfm.com</p></div><div class="text-center mb-6"><h2 class="text-2xl font-bold mb-2">GOODS RECEIVED NOTE</h2><div class="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold"> GRN #: ${ssrInterpolate(unref(grn).grn_number)}</div></div><div class="grid grid-cols-2 gap-6 mb-6 text-sm"><div class="space-y-3"><div class="flex justify-between border-b pb-2"><span class="font-semibold text-gray-700">GRN Date:</span><span>${ssrInterpolate(unref(grn).grn_date)}</span></div><div class="flex justify-between border-b pb-2"><span class="font-semibold text-gray-700">PO Number:</span><span>${ssrInterpolate(unref(grn).po_number)}</span></div><div class="flex justify-between border-b pb-2"><span class="font-semibold text-gray-700">Supplier:</span><span>${ssrInterpolate(unref(grn).supplier_name)}</span></div></div><div class="space-y-3"><div class="flex justify-between border-b pb-2"><span class="font-semibold text-gray-700">Truck Number:</span><span>${ssrInterpolate(unref(grn).truck_number || "N/A")}</span></div><div class="flex justify-between border-b pb-2"><span class="font-semibold text-gray-700">Unload Point:</span><span>${ssrInterpolate(unref(grn).unload_point_name || "\u2014")}</span></div><div class="flex justify-between border-b pb-2"><span class="font-semibold text-gray-700">Unit Price:</span><span>\u09F3${ssrInterpolate(Number(unref(grn).unit_price_per_kg || unref(grn).po_unit_price || 0).toLocaleString())}/KG</span></div></div></div><div class="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-6"><h3 class="text-lg font-bold mb-4">Quantity Details</h3><table class="w-full text-sm"><thead><tr class="border-b-2 border-gray-300"><th class="text-left py-2">Description</th><th class="text-right py-2">Weight (KG)</th><th class="text-right py-2">Value (\u09F3)</th></tr></thead><tbody><tr class="border-b border-gray-200 font-semibold"><td class="py-2">Actual Quantity Received</td><td class="text-right">${ssrInterpolate(Number(unref(grn).quantity_received_kg).toLocaleString())}</td><td class="text-right">\u09F3${ssrInterpolate(Number(unref(grn).total_value).toLocaleString())}</td></tr>`);
        if (Number(unref(grn).variance_percentage)) {
          _push(`<tr><td class="py-2">Variance</td><td class="${ssrRenderClass([Number(unref(grn).variance_percentage) > 0 ? "text-green-700" : "text-red-700", "text-right"])}">${ssrInterpolate(Number(unref(grn).variance_percentage) > 0 ? "+" : "")}${ssrInterpolate(Number(unref(grn).variance_percentage).toFixed(2))}% </td><td></td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div><div class="border-2 border-emerald-600 rounded-lg p-4 mb-6 flex justify-between items-center"><span class="text-lg font-bold">TOTAL VALUE</span><span class="text-2xl font-bold text-emerald-700">\u09F3${ssrInterpolate(Number(unref(grn).total_value).toLocaleString())}</span></div>`);
        if (unref(grn).remarks) {
          _push(`<div class="mb-6"><h3 class="text-lg font-bold mb-2">Remarks:</h3><p class="text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">${ssrInterpolate(unref(grn).remarks)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-3 gap-8 mt-12 pt-6 border-t-2 border-gray-300"><div class="text-center"><div class="border-t-2 border-gray-400 pt-2 mt-16"><p class="font-semibold">Received By</p><p class="text-sm text-gray-600">Warehouse Staff</p></div></div><div class="text-center"><div class="border-t-2 border-gray-400 pt-2 mt-16"><p class="font-semibold">Verified By</p><p class="text-sm text-gray-600">Production Manager</p></div></div><div class="text-center"><div class="border-t-2 border-gray-400 pt-2 mt-16"><p class="font-semibold">Approved By</p><p class="text-sm text-gray-600">Accounts Department</p></div></div></div><div class="text-center mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500"><p>Computer-generated document \u2014 GRN ID: ${ssrInterpolate(unref(grn).id)}</p></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/grn/[id]/print.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=print-DJKPjqZV.mjs.map
