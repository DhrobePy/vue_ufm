import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, ref, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderClass } from 'vue/server-renderer';
import { k as useRoute, p as useUserSession } from './server.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const { user: sessionUser } = useUserSession();
    const isSuperadmin = computed(() => {
      var _a, _b;
      return ((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase() === "superadmin";
    });
    const deleting = ref(false);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/purchase/payments/${route.params.id}`,
      "$ZTMSTXQjYs"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const pmt = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payment) != null ? _b : {};
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: `Payment \u2014 ${unref(pmt).payment_voucher_number}`,
          subtitle: `${unref(pmt).supplier_name} \xB7 ${unref(pmt).payment_date}`,
          breadcrumb: ["Purchase", "Payments", unref(pmt).payment_voucher_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/purchase/payments/${unref(route).params.id}/print`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u{1F5A8} Print`);
                  } else {
                    return [
                      createTextVNode("\u{1F5A8} Print")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/purchase/payments/${unref(route).params.id}/edit`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u270F Edit`);
                  } else {
                    return [
                      createTextVNode("\u270F Edit")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/purchase/payments",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u2190 All Payments`);
                  } else {
                    return [
                      createTextVNode("\u2190 All Payments")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/purchase/payments/${unref(route).params.id}/print`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u{1F5A8} Print")
                  ]),
                  _: 1
                }, 8, ["to"]),
                createVNode(_component_NuxtLink, {
                  to: `/purchase/payments/${unref(route).params.id}/edit`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u270F Edit")
                  ]),
                  _: 1
                }, 8, ["to"]),
                createVNode(_component_NuxtLink, {
                  to: "/purchase/payments",
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u2190 All Payments")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-6 space-y-5"><div class="flex items-start justify-between gap-4 flex-wrap"><div><h2 class="text-xl font-bold font-mono text-gold-400">${ssrInterpolate(unref(pmt).payment_voucher_number)}</h2><p class="text-xs text-gray-500 mt-0.5">Date: ${ssrInterpolate(unref(pmt).payment_date)}</p></div><span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">${ssrInterpolate(unref(pmt).payment_type || "regular")}</span></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"><div class="space-y-2"><div class="flex justify-between"><span class="text-gray-500">Supplier</span><span class="text-gray-200 font-semibold">${ssrInterpolate(unref(pmt).supplier_name)}</span></div><div class="flex justify-between"><span class="text-gray-500">PO #</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/orders/${unref(pmt).purchase_order_id}`,
          class: "font-mono text-gold-400/80 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(pmt).po_number)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(pmt).po_number), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="flex justify-between"><span class="text-gray-500">Payment Method</span><span class="text-gray-200 uppercase font-medium">${ssrInterpolate(unref(pmt).payment_method)}</span></div></div><div class="space-y-2"><div class="flex justify-between"><span class="text-gray-500">Bank</span><span class="text-gray-200">${ssrInterpolate(unref(pmt).bank_name || unref(pmt).po_supplier_name || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-500">Reference</span><span class="text-gray-200">${ssrInterpolate(unref(pmt).reference_number || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-500">Handled By</span><span class="text-gray-200">${ssrInterpolate(unref(pmt).handled_by_employee || "\u2014")}</span></div></div></div><div class="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center"><p class="text-xs text-gray-500 mb-1">AMOUNT PAID</p><p class="text-3xl font-bold text-emerald-400">\u09F3${ssrInterpolate(Number(unref(pmt).amount_paid).toLocaleString())}</p></div>`);
        if (unref(pmt).remarks) {
          _push(`<div class="text-xs text-gray-500 border-t border-white/[0.06] pt-3"><span class="font-semibold text-gray-600">Remarks: </span>${ssrInterpolate(unref(pmt).remarks)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-5"><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">PO Summary</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Total Value</span><span class="text-gray-200">\u09F3${ssrInterpolate(Number(unref(pmt).total_order_value || 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Received Value</span><span class="text-gray-200">\u09F3${ssrInterpolate(Number(unref(pmt).total_received_value || 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Balance</span><span class="text-red-400 font-bold">\u09F3${ssrInterpolate(Number(unref(pmt).balance_payable || 0).toLocaleString())}</span></div></div></div><div class="glass-card p-5 space-y-2"><h3 class="text-sm font-semibold text-gray-300">Actions</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/payments/${unref(route).params.id}/edit`,
          class: "btn-ghost text-xs w-full justify-start gap-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u270F Edit Payment`);
            } else {
              return [
                createTextVNode("\u270F Edit Payment")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/payments/${unref(route).params.id}/print`,
          class: "btn-ghost text-xs w-full justify-start gap-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F5A8} Print Receipt`);
            } else {
              return [
                createTextVNode("\u{1F5A8} Print Receipt")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(isSuperadmin)) {
          _push(`<button${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""} class="${ssrRenderClass([unref(deleting) ? "opacity-50 cursor-not-allowed" : "", "btn-ghost text-xs w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:border-red-500/30"])}">${ssrInterpolate(unref(deleting) ? "Deleting\u2026" : "\u2715 Delete Payment")}</button>`);
        } else {
          _push(`<p class="text-[11px] text-gray-600 italic px-1">Only a Superadmin can delete a payment</p>`);
        }
        _push(`</div></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/payments/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DafNbns5.mjs.map
