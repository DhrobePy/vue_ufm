import { _ as _sfc_main$2 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { c as _export_sfc } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SuccessModal",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    receiptNo: {},
    total: {},
    subtotal: {},
    discount: {},
    cashAmount: {},
    creditAmount: {},
    paymentMethod: {},
    customerName: {},
    exitStatus: {},
    items: {},
    verifyUrl: {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.modelValue) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-bcdcf20c><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-bcdcf20c></div><div class="relative w-full max-w-sm glass-card p-7 text-center space-y-4 animate-slide-up" data-v-bcdcf20c><div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto" data-v-bcdcf20c><svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-bcdcf20c><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-bcdcf20c></path></svg></div><h3 class="font-display font-bold text-xl text-white" data-v-bcdcf20c>Sale Complete!</h3><div class="text-sm text-gray-400 space-y-0.5" data-v-bcdcf20c><p data-v-bcdcf20c>Receipt <span class="font-mono text-gold-400" data-v-bcdcf20c>${ssrInterpolate(__props.receiptNo)}</span></p>`);
          if (__props.customerName) {
            _push2(`<p data-v-bcdcf20c>Customer: <span class="text-gray-300" data-v-bcdcf20c>${ssrInterpolate(__props.customerName)}</span></p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<p data-v-bcdcf20c>Paid now: <span class="text-gray-300" data-v-bcdcf20c>\u09F3${ssrInterpolate(__props.cashAmount.toLocaleString())} (${ssrInterpolate(__props.paymentMethod)})</span></p>`);
          if (__props.creditAmount > 0) {
            _push2(`<p data-v-bcdcf20c>On credit: <span class="text-orange-400" data-v-bcdcf20c>\u09F3${ssrInterpolate(__props.creditAmount.toLocaleString())}</span></p>`);
          } else {
            _push2(`<!---->`);
          }
          if (__props.discount > 0) {
            _push2(`<p data-v-bcdcf20c>Discount: <span class="text-orange-400" data-v-bcdcf20c>-\u09F3${ssrInterpolate(__props.discount.toLocaleString())}</span></p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<p class="text-base font-bold pt-1" data-v-bcdcf20c>Total: <strong class="text-gold-400" data-v-bcdcf20c>\u09F3${ssrInterpolate(__props.total.toLocaleString())}</strong></p>`);
          if (__props.exitStatus === "pending_approval") {
            _push2(`<p class="text-red-400 text-xs pt-1" data-v-bcdcf20c>\u23F3 Exit release needs approval before goods can leave \u2014 see Pending Approvals.</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="flex gap-3" data-v-bcdcf20c><button class="btn-ghost flex-1 justify-center text-sm" data-v-bcdcf20c>\u{1F5A8}\uFE0F Print All (3)</button><button class="btn-gold flex-1 justify-center text-sm" data-v-bcdcf20c>New Sale</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Pos/SuccessModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-bcdcf20c"]]);
const skeletonCount = 8;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const search = ref("");
    const activeCategory = ref("All");
    const discount = ref(0);
    const paymentMethod = ref("Cash");
    const selectedCustomer = ref(null);
    const walkInName = ref("");
    const walkInPhone = ref("");
    const saveWalkIn = ref(false);
    const splitPayment = ref(false);
    const cashAmount = ref(0);
    const cashAccountId = ref("");
    const bankAccountId = ref("");
    const successModal = ref(false);
    const completing = ref(false);
    const lastReceiptNo = ref("");
    const lastTotal = ref(0);
    const lastSubtotal = ref(0);
    const lastDiscount = ref(0);
    const lastCashAmount = ref(0);
    const lastCreditAmount = ref(0);
    const lastPaymentMethod = ref("");
    const lastCustomerName = ref("");
    const lastExitStatus = ref("cleared");
    const lastItems = ref([]);
    const lastVerifyUrl = ref("");
    const paymentMethods = ["Cash", "Card", "Bank Transfer", "bKash", "Nagad"];
    const { data: productData, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/pos/products",
      "$bOIOAyrFN3"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allProducts = computed(() => {
      var _a, _b;
      return (_b = (_a = productData.value) == null ? void 0 : _a.products) != null ? _b : [];
    });
    const categories = computed(() => {
      var _a, _b;
      return (_b = (_a = productData.value) == null ? void 0 : _a.categories) != null ? _b : ["All"];
    });
    const { data: custData, refresh: refreshCustomers } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/customers",
      { query: { type: "POS", per: 200 } },
      "$eSwa8D-8Z7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const posCustomers = computed(() => {
      var _a, _b;
      return (_b = (_a = custData.value) == null ? void 0 : _a.customers) != null ? _b : [];
    });
    const { data: cashData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/lookup/cash-accounts",
      "$awBGJOW7dJ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: bankData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/lookup/bank-accounts",
      "$TPdJq5qNvh"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const cashAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = cashData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const bankAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const filteredProducts = computed(() => allProducts.value.filter(
      (p) => {
        var _a;
        return (activeCategory.value === "All" || p.category === activeCategory.value) && (`${p.base_name} ${(_a = p.weight_variant) != null ? _a : ""}`.toLowerCase().includes(search.value.toLowerCase()) || p.sku.toLowerCase().includes(search.value.toLowerCase()));
      }
    ));
    const cart = ref([]);
    const subtotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0));
    const total = computed(() => Math.max(0, subtotal.value - (discount.value || 0)));
    const payingNow = computed(() => splitPayment.value ? Math.min(Math.max(0, cashAmount.value || 0), total.value) : total.value);
    const creditAmount = computed(() => Math.max(0, total.value - payingNow.value));
    const canComplete = computed(() => {
      if (!cart.value.length) return false;
      if (creditAmount.value > 5e-3 && !selectedCustomer.value) return false;
      if (payingNow.value > 5e-3) {
        if (paymentMethod.value === "Cash" && !cashAccountId.value) return false;
        if (paymentMethod.value !== "Cash" && !bankAccountId.value) return false;
      }
      return true;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBackButton = _sfc_main$2;
      const _component_PosSuccessModal = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-screen flex gap-0 -mx-6 -my-6 overflow-hidden" }, _attrs))}><div class="flex-1 flex flex-col min-w-0 bg-surface-400 border-r border-white/[0.06]"><div class="p-4 border-b border-white/[0.06] flex items-center gap-3">`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div class="relative flex-1"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg><input${ssrRenderAttr("value", unref(search))} class="input-glass pl-10 text-sm" placeholder="Search by product name or SKU\u2026"></div></div><div class="flex gap-2 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto no-scrollbar"><!--[-->`);
      ssrRenderList(unref(categories), (cat) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150",
          unref(activeCategory) === cat ? "bg-gold-500/15 text-gold-400 border border-gold-500/25" : "text-gray-500 border border-white/[0.07] hover:text-gray-300"
        ])}">${ssrInterpolate(cat)}</button>`);
      });
      _push(`<!--]--></div><div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">`);
      if (unref(pending)) {
        _push(`<!--[-->`);
        ssrRenderList(skeletonCount, (i) => {
          _push(`<div class="glass-card p-4 h-32 animate-pulse"></div>`);
        });
        _push(`<!--]-->`);
      } else {
        _push(`<!--[--><!--[-->`);
        ssrRenderList(unref(filteredProducts), (p) => {
          _push(`<button class="glass-card-hover p-4 text-left space-y-2 group active:scale-[0.97] transition-transform duration-100"><div class="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-lg mb-2">\u{1F33E}</div><p class="text-xs font-semibold text-gray-200 leading-tight group-hover:text-white transition-colors">${ssrInterpolate(p.base_name)} ${ssrInterpolate(p.weight_variant)}</p><p class="text-[10px] text-gray-600 font-mono">${ssrInterpolate(p.sku)}</p><p class="text-sm font-bold text-gold-400">\u09F3${ssrInterpolate(Number(p.price).toLocaleString())}</p></button>`);
        });
        _push(`<!--]-->`);
        if (!unref(filteredProducts).length) {
          _push(`<div class="col-span-full py-12 text-center"><p class="text-3xl mb-2">\u{1F50D}</p><p class="text-sm text-gray-600">No products found</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div></div><div class="w-80 xl:w-96 flex flex-col shrink-0 overflow-y-auto no-scrollbar" style="${ssrRenderStyle({ "background": "rgba(20,16,10,0.9)", "backdrop-filter": "blur(16px)" })}"><div class="p-4 border-b border-white/[0.06] flex items-center justify-between"><div><h2 class="font-display font-bold text-white">Cart</h2><p class="text-xs text-gray-500">${ssrInterpolate(unref(cart).length)} item${ssrInterpolate(unref(cart).length !== 1 ? "s" : "")}</p></div><button class="text-xs text-gray-600 hover:text-red-400 transition-colors">Clear all</button></div><div class="px-3 pt-3 pb-2 border-b border-white/[0.04] space-y-1.5"><select class="input-glass text-xs py-2"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCustomer)) ? ssrLooseContain(unref(selectedCustomer), null) : ssrLooseEqual(unref(selectedCustomer), null)) ? " selected" : ""}>Walk-in / Counter Customer</option><!--[-->`);
      ssrRenderList(unref(posCustomers), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCustomer)) ? ssrLooseContain(unref(selectedCustomer), c.id) : ssrLooseEqual(unref(selectedCustomer), c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (unref(selectedCustomer) === null) {
        _push(`<!--[--><div class="grid grid-cols-2 gap-1.5"><input${ssrRenderAttr("value", unref(walkInName))} type="text" placeholder="Name (optional)" class="input-glass text-xs py-1.5 px-2"><input${ssrRenderAttr("value", unref(walkInPhone))} type="tel" placeholder="Phone (optional)" class="input-glass text-xs py-1.5 px-2"></div>`);
        if (unref(walkInName).trim()) {
          _push(`<label class="flex items-center gap-1.5 text-[11px] text-gray-500 cursor-pointer select-none"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(saveWalkIn)) ? ssrLooseContain(unref(saveWalkIn), null) : unref(saveWalkIn)) ? " checked" : ""} class="accent-gold-500 rounded"> Save as POS customer for future </label>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="p-3 space-y-2">`);
      if (!unref(cart).length) {
        _push(`<div class="py-12 text-center"><p class="text-3xl mb-3">\u{1F6D2}</p><p class="text-sm text-gray-600">Cart is empty</p><p class="text-xs text-gray-700 mt-1">Click products to add them</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(cart), (item) => {
        _push(`<div class="glass-card p-3 flex items-start gap-3"><div class="flex-1 min-w-0"><p class="text-xs font-medium text-gray-200 leading-tight truncate">${ssrInterpolate(item.name)}</p><p class="text-[11px] text-gold-400 font-bold mt-0.5">\u09F3${ssrInterpolate(Number(item.price).toLocaleString())}</p></div><div class="flex items-center gap-1.5 shrink-0"><button class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center">\u2212</button><span class="w-6 text-center text-xs font-bold text-gray-200">${ssrInterpolate(item.qty)}</span><button class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center">+</button></div><button class="text-gray-700 hover:text-red-400 transition-colors ml-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg></button></div>`);
      });
      _push(`<!--]--></div><div class="p-4 border-t border-white/[0.06] space-y-3"><div class="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span class="text-gray-300 font-medium">\u09F3${ssrInterpolate(unref(subtotal).toLocaleString())}</span></div><div class="flex items-center justify-between text-xs text-gray-500"><span>Discount</span><div class="flex items-center gap-2"><span class="text-gray-600">\u09F3</span><input${ssrRenderAttr("value", unref(discount))} type="number" min="0"${ssrRenderAttr("max", unref(subtotal))} class="w-20 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40"></div></div><div class="flex justify-between text-sm font-bold border-t border-white/[0.06] pt-2"><span class="text-gray-200">Total</span><span class="text-gold-400 text-base">\u09F3${ssrInterpolate(unref(total).toLocaleString())}</span></div><label class="flex items-center gap-2 text-[11px] text-gray-400 cursor-pointer select-none"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(splitPayment)) ? ssrLooseContain(unref(splitPayment), null) : unref(splitPayment)) ? " checked" : ""} class="accent-gold-500 rounded"> Split payment (part cash, part on credit) </label>`);
      if (unref(splitPayment)) {
        _push(`<div class="space-y-2 rounded-xl p-2.5" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)" })}"><div class="flex items-center justify-between gap-2 text-xs"><span class="text-gray-500 w-16">Paid now</span><input${ssrRenderAttr("value", unref(cashAmount))} type="number" min="0"${ssrRenderAttr("max", unref(total))} class="input-glass text-xs py-1 flex-1 text-right font-mono"></div><div class="flex items-center justify-between gap-2 text-xs"><span class="text-gray-500 w-16">On credit</span><span class="font-mono text-orange-400 flex-1 text-right">\u09F3${ssrInterpolate(unref(creditAmount).toLocaleString())}</span></div>`);
        if (!unref(selectedCustomer)) {
          _push(`<p class="text-[10px] text-red-400">A customer must be selected for any credit portion.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-3 gap-1.5"><!--[-->`);
      ssrRenderList(paymentMethods, (m) => {
        _push(`<button class="${ssrRenderClass([
          "py-1.5 rounded-xl text-[11px] font-medium transition-all duration-150 border",
          unref(paymentMethod) === m ? "bg-gold-500/15 border-gold-500/30 text-gold-400" : "border-white/[0.07] text-gray-500 hover:text-gray-300"
        ])}">${ssrInterpolate(m)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(paymentMethod) === "Cash" && unref(payingNow) > 0) {
        _push(`<div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Cash Box</label><select class="input-glass text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(cashAccountId)) ? ssrLooseContain(unref(cashAccountId), "") : ssrLooseEqual(unref(cashAccountId), "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
        ssrRenderList(unref(cashAccounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(cashAccountId)) ? ssrLooseContain(unref(cashAccountId), a.id) : ssrLooseEqual(unref(cashAccountId), a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_name)}${ssrInterpolate(a.branch_name ? ` \u2014 ${a.branch_name}` : "")}</option>`);
        });
        _push(`<!--]--></select></div>`);
      } else if (unref(payingNow) > 0) {
        _push(`<div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Bank/Gateway Account</label><select class="input-glass text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(bankAccountId)) ? ssrLooseContain(unref(bankAccountId), "") : ssrLooseEqual(unref(bankAccountId), "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
        ssrRenderList(unref(bankAccounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(bankAccountId)) ? ssrLooseContain(unref(bankAccountId), a.id) : ssrLooseEqual(unref(bankAccountId), a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_number)}</option>`);
        });
        _push(`<!--]--></select></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button${ssrIncludeBooleanAttr(!unref(canComplete) || unref(completing)) ? " disabled" : ""} class="btn-gold w-full justify-center py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg> ${ssrInterpolate(unref(completing) ? "Processing\u2026" : `Complete Sale \xB7 \u09F3${unref(total).toLocaleString()}`)}</button></div></div>`);
      _push(ssrRenderComponent(_component_PosSuccessModal, {
        modelValue: unref(successModal),
        "onUpdate:modelValue": ($event) => isRef(successModal) ? successModal.value = $event : null,
        "receipt-no": unref(lastReceiptNo),
        total: unref(lastTotal),
        subtotal: unref(lastSubtotal),
        discount: unref(lastDiscount),
        "cash-amount": unref(lastCashAmount),
        "credit-amount": unref(lastCreditAmount),
        "payment-method": unref(lastPaymentMethod),
        "customer-name": unref(lastCustomerName),
        "exit-status": unref(lastExitStatus),
        items: unref(lastItems),
        "verify-url": unref(lastVerifyUrl)
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-GKPY59z3.mjs.map
