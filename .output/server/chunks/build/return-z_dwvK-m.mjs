import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "return",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const id = Number(route.params.id);
    const { data: orderData, pending: orderPending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/credit-sales/${id}`,
      "$fl4EZ-8xzH"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const order = computed(() => {
      var _a, _b;
      return (_b = (_a = orderData.value) == null ? void 0 : _a.order) != null ? _b : null;
    });
    const orderItems = computed(() => {
      var _a, _b;
      return (_b = (_a = orderData.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const returnItems = computed(
      () => orderItems.value.map((item) => {
        var _a;
        return {
          ...item,
          return_qty: 0,
          unit_price: (_a = item.unit_price) != null ? _a : item.line_total / item.quantity
        };
      })
    );
    const reasons = [
      { value: "damaged", label: "Damaged Goods", description: "Items damaged during delivery" },
      { value: "quality", label: "Quality Issue", description: "Product does not meet quality standard" },
      { value: "wrong_item", label: "Wrong Item", description: "Incorrect product delivered" },
      { value: "excess", label: "Excess Delivery", description: "More than ordered was delivered" },
      { value: "cancelled", label: "Order Cancelled", description: "Customer no longer needs the goods" },
      { value: "other", label: "Other", description: "Specify below" }
    ];
    const form = reactive({
      reason: "",
      reasonDetail: "",
      return_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      notes: ""
    });
    const saving = ref(false);
    const totalReturn = computed(
      () => returnItems.value.reduce((s, i) => s + Number(i.return_qty) * Number(i.unit_price), 0)
    );
    const isValid = computed(
      () => form.reason && totalReturn.value > 0 && (form.reason !== "other" || form.reasonDetail)
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Return / Claim \u2014 ${(_b = (_a = unref(order)) == null ? void 0 : _a.order_number) != null ? _b : "\u2026"}`,
        subtitle: unref(order) ? `${unref(order).customer_name} \xB7 ${(_c = unref(order).shipping_address) != null ? _c : ""}` : "Loading\u2026",
        breadcrumb: ["Credit Sales", (_e = (_d = unref(order)) == null ? void 0 : _d.order_number) != null ? _e : "\u2026", "Return"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/${unref(route).params.id}`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Back to Order`);
                } else {
                  return [
                    createTextVNode("\u2190 Back to Order")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/credit-sales/${unref(route).params.id}`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back to Order")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(orderPending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading order\u2026</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Return Reason</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><!--[-->`);
        ssrRenderList(reasons, (r) => {
          _push(`<button class="${ssrRenderClass([
            "rounded-xl border p-3 text-left text-xs transition-all duration-150",
            unref(form).reason === r.value ? "bg-red-500/10 border-red-500/40 text-red-300" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
          ])}"><p class="font-semibold">${ssrInterpolate(r.label)}</p><p class="text-[11px] text-gray-500 mt-0.5">${ssrInterpolate(r.description)}</p></button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(form).reason === "other") {
          _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Specify Reason *</label><input${ssrRenderAttr("value", unref(form).reasonDetail)} type="text" class="input-glass" placeholder="Describe the reason\u2026"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Items to Return</h3><p class="text-xs text-gray-500">Enter quantities to be returned for each item.</p><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Product</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Ordered</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Return Qty</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Return Value</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(returnItems), (item) => {
          _push(`<tr><td class="py-3 px-3"><p class="text-gray-200 font-medium">${ssrInterpolate(item.product_name)}</p><p class="text-gray-600">${ssrInterpolate(item.weight_variant)} \xB7 \u09F3${ssrInterpolate(Number(item.unit_price).toLocaleString())}/bag</p></td><td class="py-3 px-3 text-right text-gray-400">${ssrInterpolate(item.quantity)}</td><td class="py-3 px-3 text-right"><input${ssrRenderAttr("value", item.return_qty)} type="number" min="0"${ssrRenderAttr("max", item.quantity)} class="w-16 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-right text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50"></td><td class="py-3 px-3 text-right text-red-400 font-mono"> \u09F3${ssrInterpolate((item.return_qty * Number(item.unit_price)).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot><tr class="border-t border-white/[0.06]"><td colspan="3" class="pt-3 px-3 text-right text-gray-600 font-semibold">Total Return Value</td><td class="pt-3 px-3 text-right font-bold text-red-400">\u09F3${ssrInterpolate(unref(totalReturn).toLocaleString())}</td></tr></tfoot></table></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Details</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Return Date *</label><input${ssrRenderAttr("value", unref(form).return_date)} type="date" class="input-glass w-auto"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label><textarea rows="3" class="input-glass resize-none" placeholder="Additional details about this return\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div><div class="flex items-center gap-3"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Submitting\u2026" : "Submit Return")}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/credit-sales/${unref(route).params.id}`,
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
        _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Order Info</h3><div class="space-y-2.5 text-xs"><div class="flex justify-between"><span class="text-gray-600">Order #</span><span class="font-mono text-gold-400/80">${ssrInterpolate((_f = unref(order)) == null ? void 0 : _f.order_number)}</span></div><div class="flex justify-between"><span class="text-gray-600">Customer</span><span class="text-gray-300">${ssrInterpolate((_g = unref(order)) == null ? void 0 : _g.customer_name)}</span></div><div class="flex justify-between"><span class="text-gray-600">Order Total</span><span class="text-gray-200">\u09F3${ssrInterpolate(Number((_i = (_h = unref(order)) == null ? void 0 : _h.total_amount) != null ? _i : 0).toLocaleString())}</span></div><div class="h-px bg-white/[0.06]"></div><div class="flex justify-between"><span class="text-gray-600">Return Value</span><span class="font-bold text-red-400">\u09F3${ssrInterpolate(unref(totalReturn).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Net After Return</span><span class="font-bold text-emerald-400">\u09F3${ssrInterpolate((Number((_k = (_j = unref(order)) == null ? void 0 : _j.total_amount) != null ? _k : 0) - unref(totalReturn)).toLocaleString())}</span></div></div></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">About Returns</h3><div class="space-y-2 text-xs text-gray-500 leading-relaxed"><p>Returns are submitted as <span class="text-amber-400 font-semibold">pending</span> and require admin approval before the balance is adjusted.</p><p>The customer&#39;s outstanding balance is reduced only after the return is <span class="text-emerald-400 font-semibold">approved</span>.</p></div></div></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/[id]/return.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=return-z_dwvK-m.mjs.map
