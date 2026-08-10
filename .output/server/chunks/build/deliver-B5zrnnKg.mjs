import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
  __name: "deliver",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const id = Number(route.params.id);
    const { data: orderData, pending: orderPending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/credit-sales/${id}`,
      "$wa-xG4gpzh"
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
    const deliveryItems = computed(
      () => orderItems.value.map((item) => ({
        ...item,
        qty_deliver: item.quantity
        // default: full qty
      }))
    );
    const deliveryTypes = [
      { value: "full", label: "Full Delivery", description: "All ordered items delivered in full" },
      { value: "partial", label: "Partial Delivery", description: "Only some items / quantities delivered" }
    ];
    const form = reactive({
      is_final: true,
      delivery_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      truck_number: "",
      driver_name: "",
      driver_contact: "",
      notes: ""
    });
    const saving = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Record Delivery \u2014 ${(_b = (_a = unref(order)) == null ? void 0 : _a.order_number) != null ? _b : "\u2026"}`,
        subtitle: unref(order) ? `${unref(order).customer_name} \xB7 ${(_c = unref(order).shipping_address) != null ? _c : ""}` : "Loading\u2026",
        breadcrumb: ["Credit Sales", (_e = (_d = unref(order)) == null ? void 0 : _d.order_number) != null ? _e : "\u2026", "Record Delivery"]
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
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Delivery Type</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><!--[-->`);
        ssrRenderList(deliveryTypes, (t) => {
          _push(`<button class="${ssrRenderClass([
            "rounded-xl border p-4 text-left transition-all duration-150",
            (unref(form).is_final ? "full" : "partial") === t.value ? "bg-gold-500/10 border-gold-500/40" : "bg-white/[0.03] border-white/[0.08] hover:border-white/20"
          ])}"><p class="${ssrRenderClass(["text-sm font-semibold", (unref(form).is_final ? "full" : "partial") === t.value ? "text-gold-300" : "text-gray-300"])}">${ssrInterpolate(t.label)}</p><p class="text-xs text-gray-500 mt-1">${ssrInterpolate(t.description)}</p></button>`);
        });
        _push(`<!--]--></div></div>`);
        if (!unref(form).is_final) {
          _push(`<div class="glass-card p-6 space-y-4"><h3 class="section-title">Items Delivered</h3><p class="text-xs text-gray-500">Enter the quantity actually delivered for each item.</p><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Product</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Ordered</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Delivered</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
          ssrRenderList(unref(deliveryItems), (item) => {
            _push(`<tr><td class="py-3 px-3"><p class="text-gray-200 font-medium">${ssrInterpolate(item.product_name)}</p><p class="text-gray-600">${ssrInterpolate(item.weight_variant)}</p></td><td class="py-3 px-3 text-right text-gray-400">${ssrInterpolate(item.quantity)} bags</td><td class="py-3 px-3 text-right"><input${ssrRenderAttr("value", item.qty_deliver)} type="number" min="0"${ssrRenderAttr("max", item.quantity)} class="w-20 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-right text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50 focus:border-gold-500/50"></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-6 space-y-4"><h3 class="section-title">Vehicle &amp; Driver</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Truck Number</label><input${ssrRenderAttr("value", unref(form).truck_number)} type="text" class="input-glass" placeholder="e.g. Dhaka Metro GA-11-1234"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver Name</label><input${ssrRenderAttr("value", unref(form).driver_name)} type="text" class="input-glass" placeholder="Driver&#39;s full name"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver Contact</label><input${ssrRenderAttr("value", unref(form).driver_contact)} type="tel" class="input-glass" placeholder="+880 1xxx-xxxxxx"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Date</label><input${ssrRenderAttr("value", unref(form).delivery_date)} type="date" class="input-glass"></div></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Notes</h3><textarea rows="3" class="input-glass resize-none" placeholder="Any issues, damages, or remarks\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div><div class="flex items-center gap-3"><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Recording\u2026" : "Confirm Delivery")}</button>`);
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
        _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Delivery Address</h3><div class="space-y-2 text-xs"><div class="flex gap-2"><span class="text-gray-600 w-20 shrink-0">Customer</span><span class="text-gray-300">${ssrInterpolate((_f = unref(order)) == null ? void 0 : _f.customer_name)}</span></div><div class="flex gap-2"><span class="text-gray-600 w-20 shrink-0">Address</span><span class="text-gray-400 leading-relaxed">${ssrInterpolate((_h = (_g = unref(order)) == null ? void 0 : _g.shipping_address) != null ? _h : "\u2014")}</span></div><div class="flex gap-2"><span class="text-gray-600 w-20 shrink-0">Phone</span><span class="text-gray-300">${ssrInterpolate((_j = (_i = unref(order)) == null ? void 0 : _i.customer_phone) != null ? _j : "\u2014")}</span></div></div></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Order Items</h3><!--[-->`);
        ssrRenderList(unref(deliveryItems), (item) => {
          _push(`<div class="flex justify-between text-xs py-1.5 border-b border-white/[0.04] last:border-0"><div><p class="text-gray-300">${ssrInterpolate(item.product_name)}</p><p class="text-gray-600">${ssrInterpolate(item.weight_variant)}</p></div><span class="text-gray-400 font-mono">${ssrInterpolate(item.quantity)} bags</span></div>`);
        });
        _push(`<!--]--><div class="flex justify-between text-xs pt-1"><span class="text-gray-600 font-semibold">Total Value</span><span class="font-bold text-gray-200">\u09F3${ssrInterpolate(Number((_l = (_k = unref(order)) == null ? void 0 : _k.total_amount) != null ? _l : 0).toLocaleString())}</span></div></div></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/[id]/deliver.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=deliver-B5zrnnKg.mjs.map
