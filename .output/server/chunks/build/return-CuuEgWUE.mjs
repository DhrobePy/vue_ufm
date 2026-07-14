import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, watch, reactive, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
    const { data: returnsData, pending: returnsLoading } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/credit-sales/${id}/returns`,
      "$rGW3lD3sBe"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const previousReturns = computed(() => {
      var _a, _b;
      return (_b = (_a = returnsData.value) == null ? void 0 : _a.returns) != null ? _b : [];
    });
    const returnItems = ref([]);
    watch(orderItems, (items) => {
      returnItems.value = items.map((item) => {
        var _a;
        return {
          ...item,
          return_qty: 0,
          unit_price: Number((_a = item.unit_price) != null ? _a : 0)
        };
      });
    }, { immediate: true });
    const reasons = [
      { value: "damaged", label: "Damaged Goods", description: "Items damaged during delivery" },
      { value: "quality", label: "Quality Issue", description: "Product does not meet quality standard" },
      { value: "wrong_item", label: "Wrong Item", description: "Incorrect product delivered" },
      { value: "excess", label: "Excess Delivery", description: "More than ordered was delivered" },
      { value: "cancelled", label: "Order Cancelled", description: "Customer no longer needs the goods" },
      { value: "other", label: "Other", description: "Specify below" }
    ];
    const form = reactive({
      return_type: "partial",
      reason: "",
      reasonDetail: "",
      return_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      collected_by: "",
      notes: ""
    });
    const saving = ref(false);
    const submitted = ref(false);
    const apiError = ref("");
    const totalReturnValue = computed(
      () => returnItems.value.reduce((s, i) => s + Number(i.return_qty || 0) * Number(i.unit_price || 0), 0)
    );
    const totalReturnQty = computed(
      () => returnItems.value.reduce((s, i) => s + Number(i.return_qty || 0), 0)
    );
    const isValid = computed(
      () => !!form.reason && (form.reason !== "other" || !!form.reasonDetail.trim()) && totalReturnValue.value > 0
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Record Return \u2014 ${(_b = (_a = unref(order)) == null ? void 0 : _a.order_number) != null ? _b : "\u2026"}`,
        subtitle: unref(order) ? `${unref(order).customer_name} \xB7 Balance Due: \u09F3${Number((_c = unref(order).balance_due) != null ? _c : 0).toLocaleString()}` : "Loading\u2026",
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
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Return Type</h3><div class="grid grid-cols-2 gap-3"><button class="${ssrRenderClass([
          "rounded-xl border p-4 text-left transition-all",
          unref(form).return_type === "partial" ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
        ])}"><p class="font-semibold text-sm">Partial Return</p><p class="text-[11px] mt-0.5 opacity-70">Some items returned, order continues</p></button><button class="${ssrRenderClass([
          "rounded-xl border p-4 text-left transition-all",
          unref(form).return_type === "full" ? "bg-red-500/10 border-red-500/40 text-red-300" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
        ])}"><p class="font-semibold text-sm">Full Return</p><p class="text-[11px] mt-0.5 opacity-70">All goods returned, order fully reversed</p></button></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Return Reason</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><!--[-->`);
        ssrRenderList(reasons, (r) => {
          _push(`<button class="${ssrRenderClass([
            "rounded-xl border p-3 text-left text-xs transition-all duration-150",
            unref(form).reason === r.value ? "bg-red-500/10 border-red-500/40 text-red-300" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
          ])}"><p class="font-semibold">${ssrInterpolate(r.label)}</p><p class="text-[11px] text-gray-500 mt-0.5">${ssrInterpolate(r.description)}</p></button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(form).reason === "other") {
          _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Specify Reason *</label><input${ssrRenderAttr("value", unref(form).reasonDetail)} type="text" class="form-input" placeholder="Describe the reason\u2026"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-6 space-y-4"><div class="flex items-center justify-between"><h3 class="section-title">Items to Return</h3>`);
        if (unref(form).return_type === "full") {
          _push(`<button class="btn-secondary text-xs">\u2191 Fill All Quantities</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><p class="text-xs text-gray-500">Enter quantities to be returned for each item.</p><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-2 text-left text-gray-500 font-medium">Product</th><th class="pb-2 px-2 text-right text-gray-500 font-medium">Ordered</th><th class="pb-2 px-2 text-right text-gray-500 font-medium">Unit Price</th><th class="pb-2 px-2 text-right text-gray-500 font-medium">Return Qty</th><th class="pb-2 px-2 text-right text-gray-500 font-medium">Return Value</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(returnItems), (item, i) => {
          var _a2;
          _push(`<tr><td class="py-3 px-2"><p class="text-gray-200 font-medium">${ssrInterpolate(item.product_name || "\u2014")}</p><p class="text-gray-600 text-[10px]">${ssrInterpolate((_a2 = item.weight_variant) != null ? _a2 : "")}</p></td><td class="py-3 px-2 text-right text-gray-400">${ssrInterpolate(Number(item.qty_bags).toFixed(0))}</td><td class="py-3 px-2 text-right text-gray-400">\u09F3${ssrInterpolate(Number(item.unit_price).toLocaleString())}</td><td class="py-3 px-2 text-right"><input${ssrRenderAttr("value", unref(returnItems)[i].return_qty)} type="number" min="0"${ssrRenderAttr("max", item.qty_bags)} step="1" class="w-20 bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1.5 text-right text-xs text-gray-200 outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30"></td><td class="${ssrRenderClass([item.return_qty > 0 ? "text-red-400" : "text-gray-600", "py-3 px-2 text-right font-mono"])}">${ssrInterpolate(item.return_qty > 0 ? "\u09F3" + (item.return_qty * Number(item.unit_price)).toLocaleString() : "\u2014")}</td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(returnItems).length) {
          _push(`<tr><td colspan="5" class="py-6 text-center text-gray-600">No items found on this order</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody>`);
        if (unref(returnItems).length) {
          _push(`<tfoot><tr class="border-t border-white/[0.08]"><td colspan="3" class="pt-3 px-2 text-right text-gray-500 font-semibold">Total Return Value</td><td class="pt-3 px-2 text-right text-gray-400 font-medium">${ssrInterpolate(unref(totalReturnQty))} bag${ssrInterpolate(unref(totalReturnQty) !== 1 ? "s" : "")}</td><td class="pt-3 px-2 text-right font-bold text-red-400 text-sm"> \u09F3${ssrInterpolate(unref(totalReturnValue).toLocaleString())}</td></tr></tfoot>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</table></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Details</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Return Date *</label><input${ssrRenderAttr("value", unref(form).return_date)} type="date" class="form-input"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Collected By</label><input${ssrRenderAttr("value", unref(form).collected_by)} class="form-input" placeholder="Name of person receiving goods"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes (optional)</label><textarea rows="3" class="form-input resize-none" placeholder="Any additional details about this return\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div>`);
        if (!unref(isValid) && unref(submitted)) {
          _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs space-y-1">`);
          if (!unref(form).reason) {
            _push(`<p>\u2022 Please select a return reason</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(form).reason === "other" && !unref(form).reasonDetail) {
            _push(`<p>\u2022 Please specify the reason</p>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(totalReturnValue) === 0) {
            _push(`<p>\u2022 Enter at least one return quantity</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(apiError)) {
          _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(apiError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center gap-3 pb-4"><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 gap-2">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
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
        if (unref(totalReturnValue) > 0) {
          _push(`<span class="ml-auto text-xs text-gray-500"> Total: <span class="text-red-400 font-bold">\u09F3${ssrInterpolate(unref(totalReturnValue).toLocaleString())}</span></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Order Summary</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Order #</span><span class="font-mono text-gold-400/80">${ssrInterpolate((_f = unref(order)) == null ? void 0 : _f.order_number)}</span></div><div class="flex justify-between"><span class="text-gray-600">Customer</span><span class="text-gray-300">${ssrInterpolate((_g = unref(order)) == null ? void 0 : _g.customer_name)}</span></div><div class="flex justify-between"><span class="text-gray-600">Order Total</span><span class="text-gray-200">\u09F3${ssrInterpolate(Number((_i = (_h = unref(order)) == null ? void 0 : _h.total_amount) != null ? _i : 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Amount Paid</span><span class="text-emerald-400">\u09F3${ssrInterpolate(Number((_k = (_j = unref(order)) == null ? void 0 : _j.amount_paid) != null ? _k : 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Balance Due</span><span class="text-red-400 font-semibold">\u09F3${ssrInterpolate(Number((_m = (_l = unref(order)) == null ? void 0 : _l.balance_due) != null ? _m : 0).toLocaleString())}</span></div>`);
        if (unref(totalReturnValue) > 0) {
          _push(`<div class="flex justify-between border-t border-white/[0.06] pt-2"><span class="text-gray-500">After This Return</span><span class="font-bold text-amber-400">\u09F3${ssrInterpolate(Math.max(0, Number((_o = (_n = unref(order)) == null ? void 0 : _n.balance_due) != null ? _o : 0) - unref(totalReturnValue)).toLocaleString())}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="glass-card p-5 space-y-2"><h3 class="text-sm font-semibold text-gray-300">Approval</h3><div class="rounded-xl p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400"><p class="font-semibold mb-1">\u23F3 Pending Approval</p><p class="opacity-80 leading-snug"> A different authorised user must approve this return before the balance is adjusted \u2014 even admins cannot approve their own submission. </p></div></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Previous Returns `);
        if (unref(previousReturns).length) {
          _push(`<span class="text-xs font-normal text-gray-500 ml-1">(${ssrInterpolate(unref(previousReturns).length)})</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</h3>`);
        if (unref(returnsLoading)) {
          _push(`<div class="text-xs text-gray-600 py-2 text-center animate-pulse">Loading\u2026</div>`);
        } else if (!unref(previousReturns).length) {
          _push(`<div class="text-xs text-gray-600 text-center py-3">No prior returns</div>`);
        } else {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(previousReturns), (ret) => {
            var _a2, _b2;
            _push(`<div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs space-y-1"><div class="flex items-center justify-between"><span class="font-mono text-gold-400/80 font-semibold">${ssrInterpolate(ret.return_number)}</span><span class="${ssrRenderClass([
              "badge text-[10px]",
              ret.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : ret.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
            ])}">${ssrInterpolate(ret.status)}</span></div><div class="flex justify-between text-gray-500"><span>${ssrInterpolate(ret.return_date)}</span><span class="text-red-400 font-semibold">\u09F3${ssrInterpolate(Number(ret.total_returned_amount).toLocaleString())}</span></div><p class="text-gray-600 truncate">${ssrInterpolate((_a2 = ret.return_reason) != null ? _a2 : "\u2014")}</p>`);
            if ((_b2 = ret.items) == null ? void 0 : _b2.length) {
              _push(`<div class="text-[10px] text-gray-600 mt-1">${ssrInterpolate(ret.items.map((i) => {
                var _a3;
                return `${(_a3 = i.product_name) != null ? _a3 : ""} \xD7${Number(i.returned_qty).toFixed(0)}`;
              }).join(", "))}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div></div></div>`);
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
//# sourceMappingURL=return-CuuEgWUE.mjs.map
