import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderStyle, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import { c as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
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
    const successModal = ref(false);
    const completing = ref(false);
    const lastReceiptNo = ref("");
    const lastTotal = ref(0);
    const lastPaymentMethod = ref("");
    const paymentMethods = ["Cash", "Card", "Mobile Banking", "Bank Transfer"];
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
    const { data: custData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/customers",
      { query: { type: "POS", per: 100 } },
      "$eSwa8D-8Z7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-screen flex gap-0 -mx-6 -my-6 overflow-hidden" }, _attrs))} data-v-b1c46c9b><div class="flex-1 flex flex-col min-w-0 bg-surface-400 border-r border-white/[0.06]" data-v-b1c46c9b><div class="p-4 border-b border-white/[0.06]" data-v-b1c46c9b><div class="relative" data-v-b1c46c9b><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-b1c46c9b><circle cx="11" cy="11" r="8" data-v-b1c46c9b></circle><path d="m21 21-4.35-4.35" data-v-b1c46c9b></path></svg><input${ssrRenderAttr("value", unref(search))} class="input-glass pl-10 text-sm" placeholder="Search by product name or SKU\u2026" data-v-b1c46c9b></div></div><div class="flex gap-2 px-4 py-2.5 border-b border-white/[0.06] overflow-x-auto no-scrollbar" data-v-b1c46c9b><!--[-->`);
      ssrRenderList(unref(categories), (cat) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150",
          unref(activeCategory) === cat ? "bg-gold-500/15 text-gold-400 border border-gold-500/25" : "text-gray-500 border border-white/[0.07] hover:text-gray-300"
        ])}" data-v-b1c46c9b>${ssrInterpolate(cat)}</button>`);
      });
      _push(`<!--]--></div><div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start" data-v-b1c46c9b>`);
      if (unref(pending)) {
        _push(`<!--[-->`);
        ssrRenderList(8, (i) => {
          _push(`<div class="glass-card p-4 h-32 animate-pulse" data-v-b1c46c9b></div>`);
        });
        _push(`<!--]-->`);
      } else {
        _push(`<!--[--><!--[-->`);
        ssrRenderList(unref(filteredProducts), (p) => {
          _push(`<button${ssrIncludeBooleanAttr(p.stock <= 0) ? " disabled" : ""} class="glass-card-hover p-4 text-left space-y-2 group active:scale-[0.97] transition-transform duration-100 disabled:opacity-40 disabled:cursor-not-allowed" data-v-b1c46c9b><div class="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-lg mb-2" data-v-b1c46c9b>\u{1F33E}</div><p class="text-xs font-semibold text-gray-200 leading-tight group-hover:text-white transition-colors" data-v-b1c46c9b>${ssrInterpolate(p.base_name)} ${ssrInterpolate(p.weight_variant)}</p><p class="text-[10px] text-gray-600 font-mono" data-v-b1c46c9b>${ssrInterpolate(p.sku)}</p><p class="text-sm font-bold text-gold-400" data-v-b1c46c9b>\u09F3${ssrInterpolate(Number(p.price).toLocaleString())}</p><p class="${ssrRenderClass([p.stock > 20 ? "text-emerald-500" : p.stock > 5 ? "text-orange-400" : "text-red-400", "text-[10px]"])}" data-v-b1c46c9b>${ssrInterpolate(p.stock)} in stock </p></button>`);
        });
        _push(`<!--]-->`);
        if (!unref(filteredProducts).length) {
          _push(`<div class="col-span-full py-12 text-center" data-v-b1c46c9b><p class="text-3xl mb-2" data-v-b1c46c9b>\u{1F50D}</p><p class="text-sm text-gray-600" data-v-b1c46c9b>No products found</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div></div><div class="w-80 xl:w-96 flex flex-col shrink-0" style="${ssrRenderStyle({ "background": "rgba(20,16,10,0.9)", "backdrop-filter": "blur(16px)" })}" data-v-b1c46c9b><div class="p-4 border-b border-white/[0.06] flex items-center justify-between" data-v-b1c46c9b><div data-v-b1c46c9b><h2 class="font-display font-bold text-white" data-v-b1c46c9b>Cart</h2><p class="text-xs text-gray-500" data-v-b1c46c9b>${ssrInterpolate(unref(cart).length)} item${ssrInterpolate(unref(cart).length !== 1 ? "s" : "")}</p></div><button class="text-xs text-gray-600 hover:text-red-400 transition-colors" data-v-b1c46c9b>Clear all</button></div><div class="px-3 pt-3 pb-2 border-b border-white/[0.04]" data-v-b1c46c9b><select class="input-glass text-xs py-2" data-v-b1c46c9b><option${ssrRenderAttr("value", null)} data-v-b1c46c9b${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCustomer)) ? ssrLooseContain(unref(selectedCustomer), null) : ssrLooseEqual(unref(selectedCustomer), null)) ? " selected" : ""}>Walk-in / Counter Customer</option><!--[-->`);
      ssrRenderList(unref(posCustomers), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)} data-v-b1c46c9b${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCustomer)) ? ssrLooseContain(unref(selectedCustomer), c.id) : ssrLooseEqual(unref(selectedCustomer), c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar" data-v-b1c46c9b>`);
      if (!unref(cart).length) {
        _push(`<div class="py-12 text-center" data-v-b1c46c9b><p class="text-3xl mb-3" data-v-b1c46c9b>\u{1F6D2}</p><p class="text-sm text-gray-600" data-v-b1c46c9b>Cart is empty</p><p class="text-xs text-gray-700 mt-1" data-v-b1c46c9b>Click products to add them</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(cart), (item) => {
        _push(`<div class="glass-card p-3 flex items-start gap-3" data-v-b1c46c9b><div class="flex-1 min-w-0" data-v-b1c46c9b><p class="text-xs font-medium text-gray-200 leading-tight truncate" data-v-b1c46c9b>${ssrInterpolate(item.name)}</p><p class="text-[11px] text-gold-400 font-bold mt-0.5" data-v-b1c46c9b>\u09F3${ssrInterpolate(Number(item.price).toLocaleString())}</p></div><div class="flex items-center gap-1.5 shrink-0" data-v-b1c46c9b><button class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center" data-v-b1c46c9b>\u2212</button><span class="w-6 text-center text-xs font-bold text-gray-200" data-v-b1c46c9b>${ssrInterpolate(item.qty)}</span><button class="w-6 h-6 rounded-lg bg-white/[0.07] text-gray-300 hover:bg-white/[0.12] transition-colors text-sm flex items-center justify-center" data-v-b1c46c9b>+</button></div><button class="text-gray-700 hover:text-red-400 transition-colors ml-1" data-v-b1c46c9b><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-b1c46c9b><path d="M6 18L18 6M6 6l12 12" data-v-b1c46c9b></path></svg></button></div>`);
      });
      _push(`<!--]--></div><div class="p-4 border-t border-white/[0.06] space-y-3" data-v-b1c46c9b><div class="flex justify-between text-xs text-gray-500" data-v-b1c46c9b><span data-v-b1c46c9b>Subtotal</span><span class="text-gray-300 font-medium" data-v-b1c46c9b>\u09F3${ssrInterpolate(unref(subtotal).toLocaleString())}</span></div><div class="flex items-center justify-between text-xs text-gray-500" data-v-b1c46c9b><span data-v-b1c46c9b>Discount</span><div class="flex items-center gap-2" data-v-b1c46c9b><span class="text-gray-600" data-v-b1c46c9b>\u09F3</span><input${ssrRenderAttr("value", unref(discount))} type="number" min="0"${ssrRenderAttr("max", unref(subtotal))} class="w-20 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/40" data-v-b1c46c9b></div></div><div class="flex justify-between text-sm font-bold border-t border-white/[0.06] pt-2" data-v-b1c46c9b><span class="text-gray-200" data-v-b1c46c9b>Total</span><span class="text-gold-400 text-base" data-v-b1c46c9b>\u09F3${ssrInterpolate(unref(total).toLocaleString())}</span></div><div class="grid grid-cols-2 gap-1.5" data-v-b1c46c9b><!--[-->`);
      ssrRenderList(paymentMethods, (m) => {
        _push(`<button class="${ssrRenderClass([
          "py-1.5 rounded-xl text-[11px] font-medium transition-all duration-150 border",
          unref(paymentMethod) === m ? "bg-gold-500/15 border-gold-500/30 text-gold-400" : "border-white/[0.07] text-gray-500 hover:text-gray-300"
        ])}" data-v-b1c46c9b>${ssrInterpolate(m)}</button>`);
      });
      _push(`<!--]--></div><button${ssrIncludeBooleanAttr(!unref(cart).length || unref(completing)) ? " disabled" : ""} class="btn-gold w-full justify-center py-3.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed" data-v-b1c46c9b><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-b1c46c9b><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-b1c46c9b></path></svg> ${ssrInterpolate(unref(completing) ? "Processing\u2026" : `Complete Sale \xB7 \u09F3${unref(total).toLocaleString()}`)}</button></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(successModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-b1c46c9b><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-b1c46c9b></div><div class="relative w-full max-w-sm glass-card p-8 text-center space-y-4 animate-slide-up" data-v-b1c46c9b><div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto" data-v-b1c46c9b><svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-b1c46c9b><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-b1c46c9b></path></svg></div><h3 class="font-display font-bold text-xl text-white" data-v-b1c46c9b>Sale Complete!</h3><p class="text-sm text-gray-400" data-v-b1c46c9b> Receipt <span class="font-mono text-gold-400" data-v-b1c46c9b>${ssrInterpolate(unref(lastReceiptNo))}</span><br data-v-b1c46c9b> Payment: <span class="text-gray-300" data-v-b1c46c9b>${ssrInterpolate(unref(lastPaymentMethod))}</span><br data-v-b1c46c9b> Total: <strong class="text-gold-400" data-v-b1c46c9b>\u09F3${ssrInterpolate(unref(lastTotal).toLocaleString())}</strong></p><div class="flex gap-3" data-v-b1c46c9b><button class="btn-ghost flex-1 justify-center text-sm" data-v-b1c46c9b> \u{1F5A8}\uFE0F Print Receipt </button><button class="btn-gold flex-1 justify-center text-sm" data-v-b1c46c9b> New Sale </button></div></div></div>`);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b1c46c9b"]]);

export { index as default };
//# sourceMappingURL=index-4LZ1CLo-.mjs.map
