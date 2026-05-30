import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
    const currentStep = ref(0);
    const steps = ["Customer", "Line Items", "Summary"];
    const submitting = ref(false);
    const form = reactive({
      customerId: "",
      orderDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      requiredDate: "",
      branchId: "",
      priority: "normal",
      shippingAddress: "",
      advancePaid: 0,
      overallDiscount: 0,
      notes: "",
      items: [{ variantId: "", productId: "", quantity: 1, unitPrice: 0, discount: 0 }]
    });
    const [{ data: custData }, { data: prodData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/customers",
        { query: { per: 200 } },
        "$RqEScBQ_sV"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/products",
        "$OQxQybB90P"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const customers = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = custData.value) == null ? void 0 : _a.customers) != null ? _b : []).map((c) => ({
          id: String(c.id),
          name: c.name,
          business: c.business_name || c.customer_type || "",
          credit_limit: c.credit_limit,
          current_balance: c.current_balance
        }));
      }
    );
    const selectedCustomer = computed(
      () => {
        var _a;
        return (_a = customers.value.find((c) => c.id === form.customerId)) != null ? _a : null;
      }
    );
    const creditAvailable = computed(() => {
      if (!selectedCustomer.value) return 0;
      return Math.max(0, Number(selectedCustomer.value.credit_limit || 0) - Number(selectedCustomer.value.current_balance || 0));
    });
    const creditUtilPct = computed(() => {
      if (!selectedCustomer.value) return 0;
      const limit = Number(selectedCustomer.value.credit_limit || 0);
      const balance = Number(selectedCustomer.value.current_balance || 0);
      if (!limit) return 0;
      return Math.min(100, Math.round(balance / limit * 100));
    });
    const variants = computed(() => {
      var _a, _b, _c;
      const list = [];
      for (const p of (_b = (_a = prodData.value) == null ? void 0 : _a.products) != null ? _b : []) {
        for (const v of (_c = p.variants) != null ? _c : []) {
          list.push({
            id: String(v.id),
            name: `${p.base_name} \u2014 ${v.weight_variant}`,
            productId: String(p.id),
            price: v.unit_price ? Number(v.unit_price) : null
          });
        }
      }
      return list;
    });
    const subtotal = computed(() => form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0));
    const totalDiscount = computed(() => form.items.reduce((s, i) => s + (i.discount || 0), 0) + (form.overallDiscount || 0));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-4xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create Credit Order",
        subtitle: "Fill in customer, line items, discount and advance",
        breadcrumb: ["Credit Sales", "Create Order"]
      }, null, _parent));
      _push(`<div class="flex items-center gap-0"><!--[-->`);
      ssrRenderList(steps, (step, i) => {
        _push(`<div class="flex items-center"><div class="${ssrRenderClass([
          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
          unref(currentStep) === i ? "bg-gold-500/15 border border-gold-500/25" : "opacity-40"
        ])}"><div class="${ssrRenderClass([
          "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
          unref(currentStep) > i ? "bg-gold-500 text-black" : unref(currentStep) === i ? "bg-gold-500/20 text-gold-400 border border-gold-500/40" : "bg-white/[0.06] text-gray-600"
        ])}">`);
        if (unref(currentStep) > i) {
          _push(`<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`);
        } else {
          _push(`<span>${ssrInterpolate(i + 1)}</span>`);
        }
        _push(`</div><span class="${ssrRenderClass(["text-xs font-medium", unref(currentStep) === i ? "text-gold-300" : "text-gray-500"])}">${ssrInterpolate(step)}</span></div>`);
        if (i < steps.length - 1) {
          _push(`<div class="w-8 h-px bg-white/[0.08]"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(currentStep) === 0) {
        _push(`<div class="glass-card p-6 space-y-5 animate-slide-up"><h3 class="section-title">Customer Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).customerId) ? ssrLooseContain(unref(form).customerId, "") : ssrLooseEqual(unref(form).customerId, "")) ? " selected" : ""}>Select customer\u2026</option><!--[-->`);
        ssrRenderList(unref(customers), (c) => {
          _push(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).customerId) ? ssrLooseContain(unref(form).customerId, c.id) : ssrLooseEqual(unref(form).customerId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)} \xB7 ${ssrInterpolate(c.business)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Date *</label><input${ssrRenderAttr("value", unref(form).orderDate)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Required Date</label><input${ssrRenderAttr("value", unref(form).requiredDate)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "") : ssrLooseEqual(unref(form).branchId, "")) ? " selected" : ""}>Select branch\u2026</option><option value="1"${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "1") : ssrLooseEqual(unref(form).branchId, "1")) ? " selected" : ""}>Sirajgonj</option><option value="2"${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "2") : ssrLooseEqual(unref(form).branchId, "2")) ? " selected" : ""}>Demra</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</label><select class="input-glass"><option value="normal"${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "normal") : ssrLooseEqual(unref(form).priority, "normal")) ? " selected" : ""}>Normal</option><option value="high"${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "high") : ssrLooseEqual(unref(form).priority, "high")) ? " selected" : ""}>High</option><option value="urgent"${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "urgent") : ssrLooseEqual(unref(form).priority, "urgent")) ? " selected" : ""}>Urgent</option></select></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping Address</label><textarea rows="2" class="input-glass resize-none" placeholder="Delivery address\u2026">${ssrInterpolate(unref(form).shippingAddress)}</textarea></div></div>`);
        if (unref(form).customerId && unref(selectedCustomer)) {
          _push(`<div class="flex items-center gap-3 p-3.5 rounded-xl" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.07)", "border": "1px solid rgba(245,158,11,0.15)" })}"><svg class="w-4 h-4 text-gold-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><div class="flex-1 flex flex-wrap gap-x-6 gap-y-1 text-xs"><span class="text-gray-400">Credit Limit: <strong class="text-gray-200">\u09F3${ssrInterpolate(Number(unref(selectedCustomer).credit_limit || 0).toLocaleString())}</strong></span><span class="text-gray-400">Outstanding: <strong class="text-orange-300">\u09F3${ssrInterpolate(Number(unref(selectedCustomer).current_balance || 0).toLocaleString())}</strong></span><span class="text-gray-400">Available: <strong class="${ssrRenderClass(unref(creditAvailable) > 0 ? "text-emerald-300" : "text-red-400")}">\u09F3${ssrInterpolate(unref(creditAvailable).toLocaleString())}</strong></span><span class="text-gray-400">Utilisation: <strong class="${ssrRenderClass(unref(creditUtilPct) > 80 ? "text-red-400" : "text-orange-300")}">${ssrInterpolate(unref(creditUtilPct))}%</strong></span></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(currentStep) === 1) {
        _push(`<div class="glass-card p-6 space-y-5 animate-slide-up"><div class="flex items-center justify-between"><h3 class="section-title">Line Items</h3><button class="btn-ghost text-xs py-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> Add Item </button></div><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(form).items, (item, idx) => {
          _push(`<div class="grid grid-cols-12 gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"><div class="col-span-4 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Product Variant</label><select class="input-glass text-xs py-2"><option value=""${ssrIncludeBooleanAttr(Array.isArray(item.variantId) ? ssrLooseContain(item.variantId, "") : ssrLooseEqual(item.variantId, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
          ssrRenderList(unref(variants), (v) => {
            _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(item.variantId) ? ssrLooseContain(item.variantId, v.id) : ssrLooseEqual(item.variantId, v.id)) ? " selected" : ""}>${ssrInterpolate(v.name)}</option>`);
          });
          _push(`<!--]--></select></div><div class="col-span-2 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Qty</label><input${ssrRenderAttr("value", item.quantity)} type="number" min="1" class="input-glass text-xs py-2"></div><div class="col-span-2 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Unit Price</label><input${ssrRenderAttr("value", item.unitPrice)} type="number" class="input-glass text-xs py-2"></div><div class="col-span-2 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Discount</label><input${ssrRenderAttr("value", item.discount)} type="number" class="input-glass text-xs py-2"></div><div class="col-span-1 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Total</label><p class="text-xs font-semibold text-gold-400 pt-2.5">\u09F3${ssrInterpolate((item.quantity * item.unitPrice - item.discount).toLocaleString())}</p></div><div class="col-span-1 flex items-end justify-center pb-1"><button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(form).items.length) {
          _push(`<div class="py-8 text-center text-sm text-gray-600">No items added yet. Click &quot;Add Item&quot; to start.</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex justify-end pt-2 border-t border-white/[0.06]"><div class="space-y-1.5 min-w-[220px]"><div class="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span class="text-gray-300">\u09F3${ssrInterpolate(unref(subtotal).toLocaleString())}</span></div><div class="flex justify-between text-xs text-gray-500"><span>Total Discount</span><span class="text-red-400">-\u09F3${ssrInterpolate(unref(totalDiscount).toLocaleString())}</span></div><div class="flex justify-between text-sm font-bold text-white border-t border-white/[0.06] pt-1.5 mt-1.5"><span>Total</span><span class="text-gold-400">\u09F3${ssrInterpolate((unref(subtotal) - unref(totalDiscount)).toLocaleString())}</span></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(currentStep) === 2) {
        _push(`<div class="glass-card p-6 space-y-5 animate-slide-up"><h3 class="section-title">Payment &amp; Notes</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Advance Paid</label><input${ssrRenderAttr("value", unref(form).advancePaid)} type="number" class="input-glass" placeholder="0"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overall Discount</label><input${ssrRenderAttr("value", unref(form).overallDiscount)} type="number" class="input-glass" placeholder="0"></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Special Instructions</label><textarea rows="3" class="input-glass resize-none" placeholder="Any special instructions for this order\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div><div class="rounded-xl p-4 space-y-2" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.05)", "border": "1px solid rgba(245,158,11,0.12)" })}"><div class="flex justify-between text-xs text-gray-500"><span>Order Total</span><span class="text-gray-300 font-medium">\u09F3${ssrInterpolate((unref(subtotal) - unref(totalDiscount)).toLocaleString())}</span></div><div class="flex justify-between text-xs text-gray-500"><span>Advance</span><span class="text-emerald-400 font-medium">-\u09F3${ssrInterpolate((unref(form).advancePaid || 0).toLocaleString())}</span></div><div class="flex justify-between text-sm font-bold text-white border-t border-white/[0.08] pt-2 mt-1"><span>Balance Due</span><span class="text-gold-400">\u09F3${ssrInterpolate(Math.max(0, unref(subtotal) - unref(totalDiscount) - (unref(form).advancePaid || 0)).toLocaleString())}</span></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center justify-between">`);
      if (unref(currentStep) > 0) {
        _push(`<button class="btn-ghost">\u2190 Back</button>`);
      } else {
        _push(`<div></div>`);
      }
      _push(`<div class="flex gap-3">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/credit-sales",
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
      if (unref(currentStep) < steps.length - 1) {
        _push(`<button class="btn-gold">Continue \u2192</button>`);
      } else {
        _push(`<button class="btn-gold"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""}>`);
        if (unref(submitting)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`);
        }
        _push(` ${ssrInterpolate(unref(submitting) ? "Submitting\u2026" : "Submit Order")}</button>`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-DR_aIy8Y.mjs.map
