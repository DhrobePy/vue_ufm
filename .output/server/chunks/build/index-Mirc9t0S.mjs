import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { c as _export_sfc } from './server.mjs';
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
import '@vue/shared';
import 'perfect-debounce';
import 'vue-router';

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
    const successModal = ref(false);
    const completing = ref(false);
    const lastReceiptNo = ref("");
    const lastTotal = ref(0);
    ref(0);
    const lastDiscount = ref(0);
    const lastPaymentMethod = ref("");
    const lastCustomerName = ref("");
    ref([]);
    const paymentMethods = ["Cash", "Card", "Mobile Banking", "Bank Transfer"];
    const { data: productData, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/pos/products")), __temp = await __temp, __restore(), __temp);
    const allProducts = computed(() => {
      var _a, _b;
      return (_b = (_a = productData.value) == null ? void 0 : _a.products) != null ? _b : [];
    });
    const categories = computed(() => {
      var _a, _b;
      return (_b = (_a = productData.value) == null ? void 0 : _a.categories) != null ? _b : ["All"];
    });
    const { data: custData, refresh: refreshCustomers } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/customers", { query: { type: "POS", per: 200 } })), __temp = await __temp, __restore(), __temp);
    const posCustomers = computed(() => {
      var _a, _b;
      return (_b = (_a = custData.value) == null ? void 0 : _a.customers) != null ? _b : [];
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
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-screen flex gap-0 -mx-6 -my-6 overflow-hidden" }, _attrs))} data-v-bc3c1c48><div class="flex-1 flex flex-col min-w-0 bg-surface-400 border-r border-white/[0.06]" data-v-bc3c1c48><div class="p-4 border-b border-white/[0.06]" data-v-bc3c1c48><div class="relative" data-v-bc3c1c48><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-bc3c1c48><circle cx="11" cy="11" r="8" data-v-bc3c1c48></circle><path d="m21 21-4.35-4.35" data-v-bc3c1c48></path></svg><input${ssrRenderAttr("value", unref(search))} class="input-glass pl-10 text-sm" placeholder="Search by product name or SKU\u2026" data-v-bc3c1c48></div></div><div class="flex gap-2 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto no-scrollbar" data-v-bc3c1c48><!--[-->`);
      ssrRenderList(unref(categories), (cat) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150",
          unref(activeCategory) === cat ? "bg-gold-500/15 text-gold-400 border border-gold-500/25" : "text-gray-500 border border-white/[0.07] hover:text-gray-300"
        ])}" data-v-bc3c1c48>${ssrInterpolate(cat)}</button>`);
      });
      _push(`<!--]--></div><div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start" data-v-bc3c1c48>`);
      if (unref(pending)) {
        _push(`<!--[-->`);
        ssrRenderList(8, (i) => {
          _push(`<div class="glass-card p-4 h-32 animate-pulse" data-v-bc3c1c48></div>`);
        });
        _push(`<!--]-->`);
      } else {
        _push(`<!--[--, '$bOIOAyrFN3' /* nuxt-injected */><!--[-->`);
        ssrRenderList(unref(filteredProducts), (p) => {
          _push(`<button class="glass-card-hover p-4 text-left space-y-2 group active:scale-[0.97] transition-transform duration-100" data-v-bc3c1c48><div class="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-lg mb-2" data-v-bc3c1c48>\u{1F33E}</div><p clas, '$eSwa8D-8Z7' /* nuxt-injected */s="text-xs font-semibold text-gray-200 leading-tight group-hover:text-white transition-colors" data-v-bc3c1c48>${ssrInterpolate(p.base_name)} ${ssrInterpolate(p.weight_variant)}</p><p class="text-[10px] text-gray-600 font-mono" data-v-bc3c1c48>${ssrInterpolate(p.sku)}</p><p class="text-sm font-bold text-gold-400" data-v-bc3c1c48>\u09F3${ssrInterpolate(Number(p.price).toLocaleString())}</p></button>`);
        });
        _push(`<!--]-->`);
        if (!unref(filteredProducts).length) {
          _push(`<div class="col-span-full py-12 text-center" data-v-bc3c1c48><p class="text-3xl mb-2" data-v-bc3c1c48>\u{1F50D}</p><p class="text-sm text-gray-600" data-v-bc3c1c48>No products found</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div></div><div class="w-80 xl:w-96 flex flex-col shrink-0" style="${ssrRenderStyle({ "background": "rgba(20,16,10,0.9)", "backdrop-filter": "blur(16px)" })}" data-v-bc3c1c48><div class="p-4 border-b border-white/[0.06] flex items-center justify-between" data-v-bc3c1c48><div data-v-bc3c1c48><h2 class="font-display font-bold text-white" data-v-bc3c1c48>Cart</h2><p class="text-xs text-gray-500" data-v-bc3c1c48>${ssrInterpolate(unref(cart).length)} item${ssrInterpolate(unref(cart).length !== 1 ? "s" : "")}</p></div><button class="text-xs text-gray-600 hover:text-red-400 transition-colors" data-v-bc3c1c48>Clear all</button></div><div class="px-3 pt-3 pb-2 border-b border-white/[0.04] space-y-1.5" data-v-bc3c1c48><select class="input-glass text-xs py-2" data-v-bc3c1c48><option${ssrRenderAttr("value", null)} data-v-bc3c1c48${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCustomer)) ? ssrLooseContain(unref(selectedCustomer), null) : ssrLooseEqual(unref(selectedCustomer), null)) ? " selected" : ""}>Walk-in / Counter Customer</option><!--[-->`);
      ssrRenderList(unref(posCustomers), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)} data-v-bc3c1c48${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCustomer)) ? ssrLooseContain(unref(selectedCustomer), c.id) : ssrLooseEqual(unref(selectedCustomer), c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (unref(selectedCustomer) === null) {
        _push(`<!--[--><div class="grid grid-cols-2 gap-1.5" data-v-bc3c1c48><input${ssrRenderAttr("value", unref(walkInName))} type="text" placeholder="Name (optional)" class="input-glass text-xs py-1.5 px-2" data-v-bc3c1c48><input${ssrRenderAttr("value", unref(walkInPhone))} type="tel" placeholder="Phone (optional)" class="input-glass text-xs py-1.5 px-2" data-v-bc3c1c48></div>`);
        if (unref(walkInName).trim()) {
          _push(`<label class="flex items-center gap-1.5 text-[11px] text-gray-500 cursor-pointer select-none" data-v-bc3c1c48><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(saveWalkIn)) ? ssrLooseContain(unref(saveWalkIn), null) : unref(saveWalkIn)) ? " checked" : ""} class="accent-gold-500 rounded" data-v-bc3c1c48> Save as POS customer for future </label>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar" data-v-bc3c1c48>`);
      if (!unref(cart).length) {
        _push(`<div class="py-12 text-center" data-v-bc3c1c48><p class="text-3xl mb-3" data-v-bc3c1c48>\u{1F6D2}</p><p class="text-sm text-gray-600" data-v-bc3c1c48>Cart is empty</p><p class="text-xs text-gray-700 mt-1" data-v-bc3c1c48>Click products to add them</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(cart), (item) => {
        _push(`<div class="glass-card p-3 flex items-start gap-3" data-v-bc3c1c48><div class="flex-1 min-w-0" data-v-bc3c1c48><p class="text-xs font-medium text-gray-200 leading-tight truncate" data-v-bc3c1c48>${ssrInterpolate(item.name)}</p><p class="text-[11px] text-gold-400 font-bold mt-0.5" data-v-bc3c1c48>\u09F3${ssrInterpolate(Number(item.price).toLocaleString())}</p></div><div class="flex items-center gap-1.5 shrink-0" data-v-bc3c1c48><button class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center" data-v-bc3c1c48>\u2212</button><span class="w-6 text-center text-xs font-bold text-gray-200" data-v-bc3c1c48>${ssrInterpolate(item.qty)}</span><button class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center" data-v-bc3c1c48>+</button></div><button class="text-gray-700 hover:text-red-400 transition-colors ml-1" data-v-bc3c1c48><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-bc3c1c48><path d="M6 18L18 6M6 6l12 12" data-v-bc3c1c48></path></svg></button></div>`);
      });
      _push(`<!--]--></div><div class="p-4 border-t border-white/[0.06] space-y-3" data-v-bc3c1c48><div class="flex justify-between text-xs text-gray-500" data-v-bc3c1c48><span data-v-bc3c1c48>Subtotal</span><span class="text-gray-300 font-medium" data-v-bc3c1c48>\u09F3${ssrInterpolate(unref(subtotal).toLocaleString())}</span></div><div class="flex items-center justify-between text-xs text-gray-500" data-v-bc3c1c48><span data-v-bc3c1c48>Discount</span><div class="flex items-center gap-2" data-v-bc3c1c48><span class="text-gray-600" data-v-bc3c1c48>\u09F3</span><input${ssrRenderAttr("value", unref(discount))} type="number" min="0"${ssrRenderAttr("max", unref(subtotal))} class="w-20 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40" data-v-bc3c1c48></div></div><div class="flex justify-between text-sm font-bold border-t border-white/[0.06] pt-2" data-v-bc3c1c48><span class="text-gray-200" data-v-bc3c1c48>Total</span><span class="text-gold-400 text-base" data-v-bc3c1c48>\u09F3${ssrInterpolate(unref(total).toLocaleString())}</span></div><div class="grid grid-cols-2 gap-1.5" data-v-bc3c1c48><!--[-->`);
      ssrRenderList(paymentMethods, (m) => {
        _push(`<button class="${ssrRenderClass([
          "py-1.5 rounded-xl text-[11px] font-medium transition-all duration-150 border",
          unref(paymentMethod) === m ? "bg-gold-500/15 border-gold-500/30 text-gold-400" : "border-white/[0.07] text-gray-500 hover:text-gray-300"
        ])}" data-v-bc3c1c48>${ssrInterpolate(m)}</button>`);
      });
      _push(`<!--]--></div><button${ssrIncludeBooleanAttr(!unref(cart).length || unref(completing)) ? " disabled" : ""} class="btn-gold w-full justify-center py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed" data-v-bc3c1c48><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-bc3c1c48><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-bc3c1c48></path></svg> ${ssrInterpolate(unref(completing) ? "Processing\u2026" : `Complete Sale \xB7 \u09F3${unref(total).toLocaleString()}`)}</button></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(successModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-bc3c1c48><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-bc3c1c48></div><div class="relative w-full max-w-sm glass-card p-7 text-center space-y-4 animate-slide-up" data-v-bc3c1c48><div class="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto" data-v-bc3c1c48><svg class="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-bc3c1c48><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-bc3c1c48></path></svg></div><h3 class="font-display font-bold text-xl text-white" data-v-bc3c1c48>Sale Complete!</h3><div class="text-sm text-gray-400 space-y-0.5" data-v-bc3c1c48><p data-v-bc3c1c48>Receipt <span class="font-mono text-gold-400" data-v-bc3c1c48>${ssrInterpolate(unref(lastReceiptNo))}</span></p>`);
          if (unref(lastCustomerName)) {
            _push2(`<p data-v-bc3c1c48>Customer: <span class="text-gray-300" data-v-bc3c1c48>${ssrInterpolate(unref(lastCustomerName))}</span></p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<p data-v-bc3c1c48>Payment: <span class="text-gray-300" data-v-bc3c1c48>${ssrInterpolate(unref(lastPaymentMethod))}</span></p>`);
          if (unref(lastDiscount) > 0) {
            _push2(`<p data-v-bc3c1c48>Discount: <span class="text-orange-400" data-v-bc3c1c48>-\u09F3${ssrInterpolate(unref(lastDiscount).toLocaleString())}</span></p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<p class="text-base font-bold pt-1" data-v-bc3c1c48>Total: <strong class="text-gold-400" data-v-bc3c1c48>\u09F3${ssrInterpolate(unref(lastTotal).toLocaleString())}</strong></p></div><div class="flex gap-3" data-v-bc3c1c48><button class="btn-ghost flex-1 justify-center text-sm" data-v-bc3c1c48> \u{1F5A8}\uFE0F Print Receipt </button><button class="btn-gold flex-1 justify-center text-sm" data-v-bc3c1c48> New Sale </button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bc3c1c48"]]);

export { index as default };
//# sourceMappingURL=index-Mirc9t0S.mjs.map
