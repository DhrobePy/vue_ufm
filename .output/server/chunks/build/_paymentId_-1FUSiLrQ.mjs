import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute } from './server.mjs';
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
  __name: "[paymentId]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const paymentId = Number(route.params.paymentId);
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/credit-sales/payments/${paymentId}`,
      "$UzDWuStZbO"
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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "receipt-wrap" }, _attrs))} data-v-b5a25202><div class="no-print flex items-center justify-between mb-4" data-v-b5a25202>`);
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
      _push(`<button class="btn-gold text-xs px-5" data-v-b5a25202>\u{1F5A8} Print Receipt</button></div>`);
      if (unref(pending)) {
        _push(`<div class="no-print glass-card p-10 text-center text-xs text-gray-500" data-v-b5a25202>Loading receipt\u2026</div>`);
      } else if (unref(p)) {
        _push(`<div class="a4-page" data-v-b5a25202><div class="rc-header" data-v-b5a25202><div data-v-b5a25202><h1 data-v-b5a25202>UJJAL FLOUR MILLS COMPANY</h1><p data-v-b5a25202>Sarghat, Hossenpur, Sirajgonj \xB7 Phone: 01912071977</p></div><div class="rc-doc" data-v-b5a25202><h2 data-v-b5a25202>MONEY RECEIPT</h2><p class="mono" data-v-b5a25202>${ssrInterpolate(unref(p).payment_number)}</p></div></div><div class="rc-grid" data-v-b5a25202><div data-v-b5a25202><p class="rc-label" data-v-b5a25202>Received From</p><p class="rc-strong" data-v-b5a25202>${ssrInterpolate(unref(p).customer_name)}</p>`);
        if (unref(p).customer_phone) {
          _push(`<p data-v-b5a25202>${ssrInterpolate(unref(p).customer_phone)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).customer_address) {
          _push(`<p data-v-b5a25202>${ssrInterpolate(unref(p).customer_address)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div data-v-b5a25202><table class="rc-meta" data-v-b5a25202><tbody data-v-b5a25202><tr data-v-b5a25202><td data-v-b5a25202>Date</td><td class="mono" data-v-b5a25202>${ssrInterpolate(String(unref(p).payment_date).slice(0, 10))}</td></tr><tr data-v-b5a25202><td data-v-b5a25202>Method</td><td data-v-b5a25202>${ssrInterpolate(unref(p).payment_method)}</td></tr>`);
        if (unref(p).bank_account_name) {
          _push(`<tr data-v-b5a25202><td data-v-b5a25202>Bank</td><td data-v-b5a25202>${ssrInterpolate(unref(p).bank_name)} \u2014 ${ssrInterpolate(unref(p).bank_account_name)}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).cash_account_name) {
          _push(`<tr data-v-b5a25202><td data-v-b5a25202>Cash A/c</td><td data-v-b5a25202>${ssrInterpolate(unref(p).cash_account_name)}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).cheque_number) {
          _push(`<tr data-v-b5a25202><td data-v-b5a25202>Cheque</td><td class="mono" data-v-b5a25202>${ssrInterpolate(unref(p).cheque_number)} (${ssrInterpolate(unref(p).cheque_date ? String(unref(p).cheque_date).slice(0, 10) : "")})</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(p).reference_number) {
          _push(`<tr data-v-b5a25202><td data-v-b5a25202>Reference</td><td class="mono" data-v-b5a25202>${ssrInterpolate(unref(p).reference_number)}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div><div class="rc-amount" data-v-b5a25202><span data-v-b5a25202>Amount Received</span><strong data-v-b5a25202>\u09F3 ${ssrInterpolate(Number(unref(p).amount).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</strong></div><p class="rc-words" data-v-b5a25202>In words: ${ssrInterpolate(unref(amountInWords))} taka only</p>`);
        if (unref(allocations).length) {
          _push(`<table class="rc-table" data-v-b5a25202><thead data-v-b5a25202><tr data-v-b5a25202><th data-v-b5a25202>Applied To</th><th data-v-b5a25202>Type</th><th class="num" data-v-b5a25202>Amount (\u09F3)</th></tr></thead><tbody data-v-b5a25202><!--[-->`);
          ssrRenderList(unref(allocations), (a, i) => {
            _push(`<tr data-v-b5a25202><td class="mono" data-v-b5a25202>${ssrInterpolate(a.order_number)}</td><td data-v-b5a25202>${ssrInterpolate(a.as_advance ? "Advance (pre-dispatch)" : "Invoice payment")}</td><td class="num mono" data-v-b5a25202>${ssrInterpolate(Number(a.allocated_amount).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</td></tr>`);
          });
          _push(`<!--]-->`);
          if (unref(onAccount) > 0) {
            _push(`<tr data-v-b5a25202><td data-v-b5a25202>\u2014</td><td data-v-b5a25202>On account</td><td class="num mono" data-v-b5a25202>${ssrInterpolate(unref(onAccount).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table>`);
        } else if (unref(p).direct_order_number) {
          _push(`<p class="rc-note" data-v-b5a25202>Applied to order <span class="mono" data-v-b5a25202>${ssrInterpolate(unref(p).direct_order_number)}</span></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="rc-outstanding" data-v-b5a25202> Customer outstanding after this payment: <strong class="mono" data-v-b5a25202>\u09F3 ${ssrInterpolate(Number(unref(outstanding)).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</strong></div><div class="rc-sign" data-v-b5a25202><div data-v-b5a25202><div class="line" data-v-b5a25202></div><p data-v-b5a25202>Received By${ssrInterpolate(unref(p).recorded_by ? ` \u2014 ${unref(p).recorded_by}` : "")}</p></div><div data-v-b5a25202><div class="line" data-v-b5a25202></div><p data-v-b5a25202>Customer Signature</p></div><div data-v-b5a25202><div class="line" data-v-b5a25202></div><p data-v-b5a25202>Authorised Signature</p></div></div><p class="rc-foot" data-v-b5a25202>Computer-generated receipt \xB7 ${ssrInterpolate(unref(p).payment_number)} \xB7 printed ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleString("en-GB"))}</p></div>`);
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
const _paymentId_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b5a25202"]]);

export { _paymentId_ as default };
//# sourceMappingURL=_paymentId_-1FUSiLrQ.mjs.map
