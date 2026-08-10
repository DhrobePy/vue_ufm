import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, watch, reactive, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "over-delivery",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const id = Number(route.params.id);
    const { data: orderData, pending: orderPending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/credit-sales/${id}`,
      "$NbpB3zYk23"
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
    const { data: odData, pending: odsLoading } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/credit-sales/${id}/over-deliveries`,
      "$BsnL-blu3O"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const previousODs = computed(() => {
      var _a, _b;
      return (_b = (_a = odData.value) == null ? void 0 : _a.over_deliveries) != null ? _b : [];
    });
    const odItems = ref([]);
    watch(orderItems, (items) => {
      odItems.value = items.map((item) => {
        var _a;
        return { ...item, extra_qty: 0, unit_price: Number((_a = item.unit_price) != null ? _a : 0) };
      });
    }, { immediate: true });
    const form = reactive({
      resolution: "bill",
      od_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      notes: ""
    });
    const totalExtraValue = computed(() => odItems.value.reduce((s, i) => s + Number(i.extra_qty || 0) * Number(i.unit_price || 0), 0));
    const totalExtraQty = computed(() => odItems.value.reduce((s, i) => s + Number(i.extra_qty || 0), 0));
    const saving = ref(false);
    const apiError = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Record Over-Delivery \u2014 ${(_b = (_a = unref(order)) == null ? void 0 : _a.order_number) != null ? _b : "\u2026"}`,
        subtitle: unref(order) ? `${unref(order).customer_name} \xB7 goods received beyond what was ordered` : "Loading\u2026",
        breadcrumb: ["Credit Sales", (_d = (_c = unref(order)) == null ? void 0 : _c.order_number) != null ? _d : "\u2026", "Over-Delivery"]
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
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Resolution</h3><div class="grid grid-cols-3 gap-3"><button class="${ssrRenderClass([
          "rounded-xl border p-4 text-left transition-all",
          unref(form).resolution === "bill" ? "bg-amber-500/10 border-amber-500/40 text-amber-300" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
        ])}"><p class="font-semibold text-sm">Bill Customer</p><p class="text-[11px] mt-0.5 opacity-70">Add extra amount to the invoice</p></button><button class="${ssrRenderClass([
          "rounded-xl border p-4 text-left transition-all",
          unref(form).resolution === "retrieve" ? "bg-sky-500/10 border-sky-500/40 text-sky-300" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
        ])}"><p class="font-semibold text-sm">Retrieve Goods</p><p class="text-[11px] mt-0.5 opacity-70">Take the excess back, no charge</p></button><button class="${ssrRenderClass([
          "rounded-xl border p-4 text-left transition-all",
          unref(form).resolution === "writeoff" ? "bg-red-500/10 border-red-500/40 text-red-300" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
        ])}"><p class="font-semibold text-sm">Write Off</p><p class="text-[11px] mt-0.5 opacity-70">Company absorbs the loss</p></button></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Extra Quantity Delivered</h3><p class="text-xs text-gray-500">Enter how many extra bags were delivered for each item, beyond what was ordered.</p><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-2 text-left text-gray-500 font-medium">Product</th><th class="pb-2 px-2 text-right text-gray-500 font-medium">Ordered</th><th class="pb-2 px-2 text-right text-gray-500 font-medium">Unit Price</th><th class="pb-2 px-2 text-right text-gray-500 font-medium">Extra Qty</th><th class="pb-2 px-2 text-right text-gray-500 font-medium">Extra Value</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(odItems), (item, i) => {
          var _a2;
          _push(`<tr><td class="py-3 px-2"><p class="text-gray-200 font-medium">${ssrInterpolate(item.product_name || "\u2014")}</p><p class="text-gray-600 text-[10px]">${ssrInterpolate((_a2 = item.weight_variant) != null ? _a2 : "")}</p></td><td class="py-3 px-2 text-right text-gray-400">${ssrInterpolate(Number(item.qty_bags).toFixed(0))}</td><td class="py-3 px-2 text-right text-gray-400">\u09F3${ssrInterpolate(Number(item.unit_price).toLocaleString())}</td><td class="py-3 px-2 text-right"><input${ssrRenderAttr("value", unref(odItems)[i].extra_qty)} type="number" min="0" step="1" class="w-20 bg-white/[0.06] border border-white/[0.10] rounded-lg px-2 py-1.5 text-right text-xs text-gray-200 outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/30"></td><td class="${ssrRenderClass([item.extra_qty > 0 ? "text-amber-400" : "text-gray-600", "py-3 px-2 text-right font-mono"])}">${ssrInterpolate(item.extra_qty > 0 ? "\u09F3" + (item.extra_qty * Number(item.unit_price)).toLocaleString() : "\u2014")}</td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(odItems).length) {
          _push(`<tr><td colspan="5" class="py-6 text-center text-gray-600">No items found on this order</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody>`);
        if (unref(odItems).length) {
          _push(`<tfoot><tr class="border-t border-white/[0.08]"><td colspan="3" class="pt-3 px-2 text-right text-gray-500 font-semibold">Total Extra Value</td><td class="pt-3 px-2 text-right text-gray-400 font-medium">${ssrInterpolate(unref(totalExtraQty))} bag${ssrInterpolate(unref(totalExtraQty) !== 1 ? "s" : "")}</td><td class="pt-3 px-2 text-right font-bold text-amber-400 text-sm">\u09F3${ssrInterpolate(unref(totalExtraValue).toLocaleString())}</td></tr></tfoot>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</table></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Details</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date *</label><input${ssrRenderAttr("value", unref(form).od_date)} type="date" class="form-input"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label><textarea rows="3" class="form-input resize-none" placeholder="How was the excess discovered? Weighbridge slip, driver report, etc.">${ssrInterpolate(unref(form).notes)}</textarea></div></div>`);
        if (unref(apiError)) {
          _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(apiError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center gap-3 pb-4"><button${ssrIncludeBooleanAttr(unref(saving) || unref(totalExtraValue) === 0) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed gap-2">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Submitting\u2026" : "Submit for Approval")}</button>`);
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
        _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-2"><h3 class="text-sm font-semibold text-gray-300">Approval</h3><div class="rounded-xl p-3 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400"><p class="font-semibold mb-1">\u23F3 Pending Approval</p><p class="opacity-80 leading-snug">A different authorised user must approve this before ${ssrInterpolate(unref(form).resolution === "bill" ? "the customer's invoice is updated" : "it takes effect")}.</p></div></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Previous Over-Deliveries `);
        if (unref(previousODs).length) {
          _push(`<span class="text-xs font-normal text-gray-500 ml-1">(${ssrInterpolate(unref(previousODs).length)})</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</h3>`);
        if (unref(odsLoading)) {
          _push(`<div class="text-xs text-gray-600 py-2 text-center animate-pulse">Loading\u2026</div>`);
        } else if (!unref(previousODs).length) {
          _push(`<div class="text-xs text-gray-600 text-center py-3">None yet</div>`);
        } else {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(previousODs), (od) => {
            _push(`<div class="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs space-y-1"><div class="flex items-center justify-between"><span class="font-mono text-gold-400/80 font-semibold">${ssrInterpolate(od.od_number)}</span><span class="${ssrRenderClass([
              "badge text-[10px]",
              od.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : od.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
            ])}">${ssrInterpolate(od.status)}</span></div><div class="flex justify-between text-gray-500"><span>${ssrInterpolate(String(od.od_date).slice(0, 10))} \xB7 ${ssrInterpolate(od.resolution)}</span><span class="text-amber-400 font-semibold">\u09F3${ssrInterpolate(Number(od.total_extra_amount).toLocaleString())}</span></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/[id]/over-delivery.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=over-delivery-BEdir7Fk.mjs.map
