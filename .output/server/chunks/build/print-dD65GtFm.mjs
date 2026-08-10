import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
  __name: "print",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/purchase/payments/${route.params.id}`,
      "$y85aLXOPTX"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const pmt = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payment) != null ? _b : {};
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
          to: `/purchase/payments/${unref(route).params.id}`,
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
        _push(`</div><div class="receipt-container max-w-4xl mx-auto bg-white p-10 text-gray-900 font-[Arial,sans-serif]"><div class="text-center border-b-4 border-emerald-600 pb-6 mb-6"><h1 class="text-3xl font-bold">\u0989\u099C\u09CD\u099C\u09B2 \u09AB\u09CD\u09B2\u09BE\u0993\u09AF\u09BC\u09BE\u09B0 \u09AE\u09BF\u09B2\u09B8</h1><p class="text-gray-600 mt-1">\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C, \u09A1\u09C7\u09AE\u09B0\u09BE, \u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE</p><p class="text-gray-600">info@ujjalfm.com</p></div><div class="bg-emerald-600 text-white text-center py-3 text-xl font-bold tracking-widest mb-4"> PAYMENT RECEIPT / VOUCHER </div><div class="text-center bg-yellow-50 border-2 border-yellow-400 rounded py-3 mb-6"><span class="text-lg font-bold text-yellow-800">${ssrInterpolate(unref(pmt).payment_voucher_number)}</span><span class="ml-3 text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">${ssrInterpolate(unref(pmt).is_posted ? "\u2713 POSTED" : "\u23F3 PENDING")}</span>`);
        if (unref(pmt).payment_type === "advance") {
          _push(`<span class="ml-2 text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">ADVANCE</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-2 gap-6 mb-6 text-sm"><div class="space-y-3"><div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Payment Date:</span><span>${ssrInterpolate(unref(pmt).payment_date)}</span></div><div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Payment Method:</span><span class="uppercase font-bold">${ssrInterpolate(unref(pmt).payment_method)}</span></div><div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Payment Type:</span><span class="capitalize">${ssrInterpolate(unref(pmt).payment_type)}</span></div></div><div class="space-y-3"><div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">PO Number:</span><span class="font-bold text-emerald-700">${ssrInterpolate(unref(pmt).po_number)}</span></div><div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Reference:</span><span>${ssrInterpolate(unref(pmt).reference_number || "\u2014")}</span></div><div class="flex border-b pb-2"><span class="font-bold w-36 text-gray-600">Handled By:</span><span>${ssrInterpolate(unref(pmt).handled_by_employee || "\u2014")}</span></div></div></div><div class="bg-gray-100 rounded p-3 mb-4 flex items-center"><span class="font-bold w-36 text-gray-600">Paid To:</span><span class="text-lg font-bold">${ssrInterpolate(unref(pmt).supplier_name)}</span></div><div class="border-2 border-emerald-600 rounded-lg p-6 text-center mb-6 bg-emerald-50"><p class="text-sm text-gray-500 mb-2">AMOUNT PAID</p><p class="text-4xl font-bold text-emerald-700">\u09F3 ${ssrInterpolate(Number(unref(pmt).amount_paid).toLocaleString())}</p></div><table class="w-full text-sm border-collapse mb-6"><tbody><tr class="border-b border-gray-200"><td class="py-2 font-semibold text-gray-600">Total Order Value:</td><td class="py-2 text-right">\u09F3 ${ssrInterpolate(Number(unref(pmt).total_order_value || 0).toLocaleString())}</td></tr><tr class="border-b border-gray-200"><td class="py-2 font-semibold text-gray-600">Goods Received Value:</td><td class="py-2 text-right">\u09F3 ${ssrInterpolate(Number(unref(pmt).total_received_value || 0).toLocaleString())}</td></tr><tr class="border-b-2 border-gray-400 font-bold text-emerald-700"><td class="py-2">Balance After Payment:</td><td class="py-2 text-right">\u09F3 ${ssrInterpolate(Number(unref(pmt).balance_payable || 0).toLocaleString())}</td></tr></tbody></table>`);
        if (unref(pmt).remarks) {
          _push(`<div class="border border-gray-200 rounded p-4 mb-6 bg-gray-50"><p class="font-bold text-gray-600 mb-1">Remarks:</p><p class="text-gray-700">${ssrInterpolate(unref(pmt).remarks)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-3 gap-8 mt-12 pt-6 border-t-2 border-gray-300"><div class="text-center"><div class="border-t-2 border-gray-400 pt-2 mt-16"><p class="font-semibold text-sm">Prepared By</p><p class="text-xs text-gray-500">Accounts Department</p></div></div><div class="text-center"><div class="border-t-2 border-gray-400 pt-2 mt-16"><p class="font-semibold text-sm">Verified By</p><p class="text-xs text-gray-500">Accounts Manager</p></div></div><div class="text-center"><div class="border-t-2 border-gray-400 pt-2 mt-16"><p class="font-semibold text-sm">Approved By</p><p class="text-xs text-gray-500">Authorized Signatory</p></div></div></div><div class="text-center mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500"><p>Computer-generated payment receipt \u2014 Payment ID: ${ssrInterpolate(unref(pmt).id)}</p></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/payments/[id]/print.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=print-dD65GtFm.mjs.map
