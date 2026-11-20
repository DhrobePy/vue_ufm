import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, watch, hasInjectionContext, inject, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, p as useState, t as tryUseNuxtApp } from './server.mjs';
import { u as useAppSettings } from './useAppSettings-Cev_RXDm.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import { u as useHead$1, h as headSymbol } from '../routes/renderer.mjs';
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
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

function injectHead(nuxtApp) {
  var _a;
  const nuxt = nuxtApp || tryUseNuxtApp();
  return ((_a = nuxt == null ? void 0 : nuxt.ssrContext) == null ? void 0 : _a.head) || (nuxt == null ? void 0 : nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      return inject(headSymbol);
    }
  }));
}
function useHead(input, options = {}) {
  const head = injectHead(options.nuxt);
  if (head) {
    return useHead$1(input, { head, ...options });
  }
}
const PRINT_SIZES = [
  { value: "a5", label: "Half page (A5) \u2014 saves paper" },
  { value: "a4", label: "Full page (A4)" },
  { value: "thermal", label: "Thermal roll (80 mm)" }
];
const PAGE_CSS = {
  a4: "@page { size: A4 portrait; margin: 10mm }",
  a5: "@page { size: A5 landscape; margin: 6mm }",
  thermal: "@page { size: 80mm auto; margin: 3mm }"
};
function usePrintSize() {
  const size = useState("print-size", () => "a5");
  watch(size, (v) => {
    try {
      localStorage.setItem("erp_print_size", v);
    } catch {
    }
  });
  useHead({ style: [{ key: "print-page", innerHTML: computed(() => PAGE_CSS[size.value]) }] });
  return { size, sizes: PRINT_SIZES };
}
function whatsappLink(phone, text) {
  const d = String(phone != null ? phone : "").replace(/\D/g, "");
  const n = d.startsWith("880") ? d : d.startsWith("0") ? "88" + d : d.length === 10 ? "880" + d : "";
  return n.length >= 12 ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[paymentId]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { size, sizes } = usePrintSize();
    const { company } = useAppSettings();
    const route = useRoute();
    const paymentId = Number(route.params.paymentId);
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/credit-sales/payments/${paymentId}`,
      "$5kDxdxsTVK"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const p = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payment) != null ? _b : null;
    });
    const allocations = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.allocations) != null ? _b : [];
    });
    const outstanding = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.outstanding) != null ? _b : 0;
    });
    const onAccount = computed(() => {
      var _a, _b;
      const alloc = allocations.value.reduce((s, a) => s + Number(a.allocated_amount), 0);
      return Math.max(0, Number((_b = (_a = p.value) == null ? void 0 : _a.amount) != null ? _b : 0) - alloc);
    });
    const ONES = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen"
    ];
    const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    function two(n) {
      return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
    }
    function words(n) {
      if (n === 0) return "zero";
      const crore = Math.floor(n / 1e7);
      n %= 1e7;
      const lakh = Math.floor(n / 1e5);
      n %= 1e5;
      const thou = Math.floor(n / 1e3);
      n %= 1e3;
      const hund = Math.floor(n / 100);
      n %= 100;
      const parts = [];
      if (crore) parts.push(`${words(crore)} crore`);
      if (lakh) parts.push(`${two(lakh)} lakh`);
      if (thou) parts.push(`${two(thou)} thousand`);
      if (hund) parts.push(`${ONES[hund]} hundred`);
      if (n) parts.push(two(n));
      return parts.join(" ");
    }
    const amountInWords = computed(() => {
      var _a, _b;
      const amt = Math.floor(Number((_b = (_a = p.value) == null ? void 0 : _a.amount) != null ? _b : 0));
      const w = words(amt);
      return w.charAt(0).toUpperCase() + w.slice(1);
    });
    const shareText = computed(() => p.value ? `${company.value.name}
Money receipt ${p.value.payment_number}
Received \u09F3${Number(p.value.amount).toLocaleString("en-BD", { minimumFractionDigits: 2 })} from ${p.value.customer_name} on ${String(p.value.payment_date).slice(0, 10)} (${p.value.payment_method}).
Outstanding after this payment: \u09F3${Number(outstanding.value).toLocaleString("en-BD", { minimumFractionDigits: 2 })}
Thank you.` : "");
    const waUrl = computed(() => p.value ? whatsappLink(p.value.customer_phone, shareText.value) : null);
    const copied = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["receipt-wrap", `size-${unref(size)}`]
      }, _attrs))} data-v-edf3a451><div class="no-print flex items-center justify-between mb-4" data-v-edf3a451>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/credit-sales/payments",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 Payments`);
          } else {
            return [
              createTextVNode("\u2190 Payments")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex flex-wrap items-center gap-2" data-v-edf3a451><select class="field-input text-xs py-1.5" data-v-edf3a451><!--[-->`);
      ssrRenderList(unref(sizes), (o) => {
        _push(`<option${ssrRenderAttr("value", o.value)} data-v-edf3a451${ssrIncludeBooleanAttr(Array.isArray(unref(size)) ? ssrLooseContain(unref(size), o.value) : ssrLooseEqual(unref(size), o.value)) ? " selected" : ""}>${ssrInterpolate(o.label)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (unref(waUrl)) {
        _push(`<a${ssrRenderAttr("href", unref(waUrl))} target="_blank" rel="noopener" class="btn-ghost text-xs" data-v-edf3a451>WhatsApp receipt</a>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-ghost text-xs" data-v-edf3a451>${ssrInterpolate(unref(copied) ? "Copied \u2713" : "Copy text")}</button><button class="btn-gold text-xs px-5" data-v-edf3a451>\u{1F5A8} Print Receipt</button></div></div>`);
      if (unref(pending)) {
        _push(`<div class="no-print glass-card p-10 text-center text-xs text-gray-500" data-v-edf3a451>Loading receipt\u2026</div>`);
      } else if (unref(p)) {
        _push(`<div class="a4-page" data-v-edf3a451><div class="rc-header" data-v-edf3a451><div data-v-edf3a451><h1 data-v-edf3a451>${ssrInterpolate(String(unref(company).name).toUpperCase())}</h1><p data-v-edf3a451>${ssrInterpolate(unref(company).address)} \xB7 Phone: ${ssrInterpolate(unref(company).phone)}</p></div><div class="rc-doc" data-v-edf3a451><h2 data-v-edf3a451>MONEY RECEIPT</h2><p class="mono" data-v-edf3a451>${ssrInterpolate(unref(p).payment_number)}</p></div></div><div class="rc-grid" data-v-edf3a451><div data-v-edf3a451><p class="rc-label" data-v-edf3a451>Received From</p><p class="rc-strong" data-v-edf3a451>${ssrInterpolate(unref(p).customer_name)}</p>`);
        if (unref(p).customer_phone) {
          _push(`<p data-v-edf3a451>${ssrInterpolate(unref(p).customer_phone)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).customer_address) {
          _push(`<p data-v-edf3a451>${ssrInterpolate(unref(p).customer_address)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div data-v-edf3a451><table class="rc-meta" data-v-edf3a451><tbody data-v-edf3a451><tr data-v-edf3a451><td data-v-edf3a451>Date</td><td class="mono" data-v-edf3a451>${ssrInterpolate(String(unref(p).payment_date).slice(0, 10))}</td></tr><tr data-v-edf3a451><td data-v-edf3a451>Method</td><td data-v-edf3a451>${ssrInterpolate(unref(p).payment_method)}</td></tr>`);
        if (unref(p).bank_account_name) {
          _push(`<tr data-v-edf3a451><td data-v-edf3a451>Bank</td><td data-v-edf3a451>${ssrInterpolate(unref(p).bank_name)} \u2014 ${ssrInterpolate(unref(p).bank_account_name)}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).cash_account_name) {
          _push(`<tr data-v-edf3a451><td data-v-edf3a451>Cash A/c</td><td data-v-edf3a451>${ssrInterpolate(unref(p).cash_account_name)}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).cheque_number) {
          _push(`<tr data-v-edf3a451><td data-v-edf3a451>Cheque</td><td class="mono" data-v-edf3a451>${ssrInterpolate(unref(p).cheque_number)} (${ssrInterpolate(unref(p).cheque_date ? String(unref(p).cheque_date).slice(0, 10) : "")})</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).reference_number) {
          _push(`<tr data-v-edf3a451><td data-v-edf3a451>Reference</td><td class="mono" data-v-edf3a451>${ssrInterpolate(unref(p).reference_number)}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div><div class="rc-amount" data-v-edf3a451><span data-v-edf3a451>Amount Received</span><strong data-v-edf3a451>\u09F3 ${ssrInterpolate(Number(unref(p).amount).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</strong></div><p class="rc-words" data-v-edf3a451>In words: ${ssrInterpolate(unref(amountInWords))} taka only</p>`);
        if (unref(allocations).length) {
          _push(`<table class="rc-table" data-v-edf3a451><thead data-v-edf3a451><tr data-v-edf3a451><th data-v-edf3a451>Applied To</th><th data-v-edf3a451>Type</th><th class="num" data-v-edf3a451>Amount (\u09F3)</th></tr></thead><tbody data-v-edf3a451><!--[-->`);
          ssrRenderList(unref(allocations), (a, i) => {
            _push(`<tr data-v-edf3a451><td class="mono" data-v-edf3a451>${ssrInterpolate(a.order_number)}</td><td data-v-edf3a451>${ssrInterpolate(a.as_advance ? "Advance (pre-dispatch)" : "Invoice payment")}</td><td class="num mono" data-v-edf3a451>${ssrInterpolate(Number(a.allocated_amount).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</td></tr>`);
          });
          _push(`<!--]-->`);
          if (unref(onAccount) > 0) {
            _push(`<tr data-v-edf3a451><td data-v-edf3a451>\u2014</td><td data-v-edf3a451>On account</td><td class="num mono" data-v-edf3a451>${ssrInterpolate(unref(onAccount).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table>`);
        } else if (unref(p).direct_order_number) {
          _push(`<p class="rc-note" data-v-edf3a451>Applied to order <span class="mono" data-v-edf3a451>${ssrInterpolate(unref(p).direct_order_number)}</span></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="rc-outstanding" data-v-edf3a451> Customer outstanding after this payment: <strong class="mono" data-v-edf3a451>\u09F3 ${ssrInterpolate(Number(unref(outstanding)).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</strong></div><div class="rc-sign" data-v-edf3a451><div data-v-edf3a451><div class="line" data-v-edf3a451></div><p data-v-edf3a451>Received By${ssrInterpolate(unref(p).recorded_by ? ` \u2014 ${unref(p).recorded_by}` : "")}</p></div><div data-v-edf3a451><div class="line" data-v-edf3a451></div><p data-v-edf3a451>Customer Signature</p></div><div data-v-edf3a451><div class="line" data-v-edf3a451></div><p data-v-edf3a451>Authorised Signature</p></div></div><p class="rc-foot" data-v-edf3a451>Computer-generated receipt \xB7 ${ssrInterpolate(unref(p).payment_number)} \xB7 printed ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleString("en-GB"))}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/receipt/[paymentId].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _paymentId_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-edf3a451"]]);

export { _paymentId_ as default };
//# sourceMappingURL=_paymentId_-Chk_JcCz.mjs.map
