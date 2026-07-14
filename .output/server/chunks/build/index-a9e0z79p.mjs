import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const activeFilter = ref("all");
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/purchases",
      "$cQNjZ8iV-R"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const purchases = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.purchases) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const filteredPurchases = computed(() => {
      if (activeFilter.value === "all") return purchases.value;
      return purchases.value.filter((p) => p.status === activeFilter.value);
    });
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Fleet Purchases",
        subtitle: "Parts & supplies procurement",
        breadcrumb: ["Fleet", "Purchases"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/purchases/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Purchase`);
                } else {
                  return [
                    createTextVNode("+ New Purchase")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/fleet/purchases/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Purchase")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="${ssrRenderClass([unref(activeFilter) === "all" ? "ring-1 ring-gold-400/40" : "", "glass-card p-4 cursor-pointer"])}"><p class="text-xs text-gray-500">Total POs</p><p class="text-2xl font-bold text-gold-400 mt-1">${ssrInterpolate(unref(stats).total || 0)}</p><p class="text-xs text-gray-600 mt-1">\u09F3${ssrInterpolate(fmt(unref(stats).total_value))}</p></div><div class="${ssrRenderClass([unref(activeFilter) === "pending" ? "ring-1 ring-amber-400/40" : "", "glass-card p-4 cursor-pointer"])}"><p class="text-xs text-gray-500">Pending</p><p class="text-2xl font-bold text-amber-400 mt-1">${ssrInterpolate(unref(stats).pending || 0)}</p></div><div class="${ssrRenderClass([unref(activeFilter) === "approved" ? "ring-1 ring-blue-400/40" : "", "glass-card p-4 cursor-pointer"])}"><p class="text-xs text-gray-500">Approved</p><p class="text-2xl font-bold text-blue-400 mt-1">${ssrInterpolate(unref(stats).approved || 0)}</p></div><div class="${ssrRenderClass([unref(activeFilter) === "received" ? "ring-1 ring-emerald-400/40" : "", "glass-card p-4 cursor-pointer"])}"><p class="text-xs text-gray-500">Received</p><p class="text-2xl font-bold text-emerald-400 mt-1">${ssrInterpolate(unref(stats).received || 0)}</p><p class="text-xs text-gray-600 mt-1">\u09F3${ssrInterpolate(fmt(unref(stats).total_paid))} paid</p></div></div><div class="glass-card overflow-hidden">`);
      if (!unref(filteredPurchases).length) {
        _push(`<div class="text-center py-12 text-gray-600 text-sm"> No purchase orders found. </div>`);
      } else {
        _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="px-4 py-3 text-left text-gray-500">PO Number</th><th class="px-4 py-3 text-left text-gray-500">Date</th><th class="px-4 py-3 text-left text-gray-500">Supplier</th><th class="px-4 py-3 text-right text-gray-500">Items</th><th class="px-4 py-3 text-right text-gray-500">Total \u09F3</th><th class="px-4 py-3 text-right text-gray-500">Paid \u09F3</th><th class="px-4 py-3 text-left text-gray-500">Status</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(filteredPurchases), (po) => {
          _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer"><td class="px-4 py-3 font-mono font-bold text-gold-400/80">${ssrInterpolate(po.po_number)}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(po.purchase_date)}</td><td class="px-4 py-3 text-gray-300">${ssrInterpolate(po.supplier_name || "\u2014")}</td><td class="px-4 py-3 text-right text-gray-400">${ssrInterpolate(po.item_count)}</td><td class="px-4 py-3 text-right font-medium text-gray-200">\u09F3${ssrInterpolate(fmt(po.total_amount))}</td><td class="px-4 py-3 text-right text-emerald-400">\u09F3${ssrInterpolate(fmt(po.paid_amount))}</td><td class="px-4 py-3">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: po.status
          }, null, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/purchases/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-a9e0z79p.mjs.map
