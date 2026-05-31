import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const cancelling = ref(false);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/purchase/grn/${route.params.id}`,
      "$8acmHlOhD5"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const grn = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.grn) != null ? _b : {};
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading GRN\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: `GRN \u2014 ${unref(grn).grn_number}`,
          subtitle: `${unref(grn).supplier_name} \xB7 ${unref(grn).grn_date}`,
          breadcrumb: ["Purchase", "GRNs", unref(grn).grn_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/purchase/grn/${unref(route).params.id}/print`,
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
              if (unref(grn).grn_status !== "cancelled") {
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/purchase/grn/${unref(route).params.id}/edit`,
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
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/purchase/grn",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u2190 All GRNs`);
                  } else {
                    return [
                      createTextVNode("\u2190 All GRNs")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/purchase/grn/${unref(route).params.id}/print`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u{1F5A8} Print")
                  ]),
                  _: 1
                }, 8, ["to"]),
                unref(grn).grn_status !== "cancelled" ? (openBlock(), createBlock(_component_NuxtLink, {
                  key: 0,
                  to: `/purchase/grn/${unref(route).params.id}/edit`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u270F Edit")
                  ]),
                  _: 1
                }, 8, ["to"])) : createCommentVNode("", true),
                createVNode(_component_NuxtLink, {
                  to: "/purchase/grn",
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u2190 All GRNs")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-5"><div class="flex items-start justify-between gap-4 flex-wrap"><div><h2 class="text-xl font-bold font-mono text-gold-400">${ssrInterpolate(unref(grn).grn_number)}</h2><p class="text-xs text-gray-500 mt-0.5">Date: ${ssrInterpolate(unref(grn).grn_date)}</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(grn).grn_status
        }, null, _parent));
        _push(`</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs"><div class="space-y-3"><h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">PO &amp; Supplier</h3><div class="space-y-1"><div class="flex justify-between"><span class="text-gray-500">PO #</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/orders/${unref(grn).purchase_order_id}`,
          class: "font-mono text-gold-400/80 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(grn).po_number)}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(grn).po_number), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="flex justify-between"><span class="text-gray-500">Supplier</span><span class="text-gray-200">${ssrInterpolate(unref(grn).supplier_name)}</span></div></div></div><div class="space-y-3"><h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Transport</h3><div class="space-y-1"><div class="flex justify-between"><span class="text-gray-500">Vehicle</span><span class="text-gray-200">${ssrInterpolate(unref(grn).truck_number || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-500">Unload Point</span><span class="text-gray-200">${ssrInterpolate(unref(grn).unload_point_name || "\u2014")}</span></div></div></div></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Qty (kg)</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Rate / kg</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Value</th></tr></thead><tbody><tr><td class="py-3 px-3 text-gray-200">Quantity Received</td><td class="py-3 px-3 text-right font-mono text-gray-300">${ssrInterpolate(Number(unref(grn).quantity_received_kg).toLocaleString())}</td><td class="py-3 px-3 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(Number(unref(grn).unit_price_per_kg || 0).toLocaleString())}</td><td class="py-3 px-3 text-right font-mono font-bold text-gray-200">\u09F3${ssrInterpolate(Number(unref(grn).total_value).toLocaleString())}</td></tr>`);
        if (Number(unref(grn).variance_percentage)) {
          _push(`<tr><td colspan="3" class="py-2 px-3 text-gray-500">Variance</td><td class="${ssrRenderClass([Number(unref(grn).variance_percentage) > 0 ? "text-emerald-400" : "text-red-400", "py-2 px-3 text-right font-mono"])}">${ssrInterpolate(Number(unref(grn).variance_percentage) > 0 ? "+" : "")}${ssrInterpolate(Number(unref(grn).variance_percentage).toFixed(2))}% </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table>`);
        if (unref(grn).remarks) {
          _push(`<div class="text-xs text-gray-500 border-t border-white/[0.06] pt-3"><span class="font-semibold text-gray-600">Remarks: </span>${ssrInterpolate(unref(grn).remarks)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">GRN Summary</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Received Qty</span><span class="text-gray-200 font-mono">${ssrInterpolate(Number(unref(grn).quantity_received_kg).toLocaleString())} kg</span></div><div class="flex justify-between"><span class="text-gray-600">Unit Price</span><span class="text-gray-200 font-mono">\u09F3${ssrInterpolate(Number(unref(grn).unit_price_per_kg || unref(grn).po_unit_price || 0).toLocaleString())}/kg</span></div><div class="h-px bg-white/[0.06]"></div><div class="flex justify-between"><span class="text-gray-600 font-semibold">Total Value</span><span class="font-bold text-gold-400">\u09F3${ssrInterpolate(Number(unref(grn).total_value).toLocaleString())}</span></div></div></div>`);
        if (unref(grn).grn_status !== "cancelled") {
          _push(`<div class="glass-card p-5 space-y-2"><h3 class="text-sm font-semibold text-gray-300">Actions</h3>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/grn/${unref(route).params.id}/edit`,
            class: "btn-ghost text-xs w-full justify-start gap-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u270F Edit GRN`);
              } else {
                return [
                  createTextVNode("\u270F Edit GRN")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/grn/${unref(route).params.id}/print`,
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
          _push(`<button${ssrIncludeBooleanAttr(unref(cancelling)) ? " disabled" : ""} class="${ssrRenderClass([unref(cancelling) ? "opacity-50 cursor-not-allowed" : "", "btn-ghost text-xs w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:border-red-500/30"])}">${ssrInterpolate(unref(cancelling) ? "Cancelling\u2026" : "\u2715 Cancel GRN")}</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/grn/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CNS-fRUj.mjs.map
