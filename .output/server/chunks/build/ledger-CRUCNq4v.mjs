import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
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
  __name: "ledger",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const supplierId = Number(route.params.id);
    const dateFrom = ref("");
    const dateTo = ref("");
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/purchase/suppliers/${supplierId}/ledger`,
      {
        query: computed(() => ({
          date_from: dateFrom.value,
          date_to: dateTo.value
        }))
      },
      "$rAPA8s1DdI"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const supplier = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.supplier) != null ? _b : null;
    });
    const ledger = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.ledger) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    function printLedger() {
      (void 0).print();
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Supplier Ledger \u2014 ${(_b = (_a = unref(supplier)) == null ? void 0 : _a.company_name) != null ? _b : "\u2026"}`,
        subtitle: `All transactions with this supplier`,
        breadcrumb: ["Purchase", "Suppliers", (_d = (_c = unref(supplier)) == null ? void 0 : _c.company_name) != null ? _d : "\u2026", "Ledger"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u{1F5A8} Print</button>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/suppliers",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Suppliers`);
                } else {
                  return [
                    createTextVNode("\u2190 Suppliers")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("button", {
                onClick: printLedger,
                class: "btn-ghost text-xs"
              }, "\u{1F5A8} Print"),
              createVNode(_component_NuxtLink, {
                to: "/purchase/suppliers",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Suppliers")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading ledger\u2026</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Purchased</p><p class="text-xl font-bold text-gray-100">\u09F3${ssrInterpolate(Number((_e = unref(stats).total_purchased) != null ? _e : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Paid</p><p class="text-xl font-bold text-emerald-400">\u09F3${ssrInterpolate(Number((_f = unref(stats).total_paid) != null ? _f : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Outstanding</p><p class="text-xl font-bold text-red-400">\u09F3${ssrInterpolate(Number((_h = (_g = unref(supplier)) == null ? void 0 : _g.current_balance) != null ? _h : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Transactions</p><p class="text-xl font-bold text-gray-100">${ssrInterpolate(unref(ledger).length)}</p></div></div><div id="supplier-ledger-print" class="glass-card p-5"><div class="flex items-center justify-between mb-4"><div><h3 class="section-title">${ssrInterpolate((_i = unref(supplier)) == null ? void 0 : _i.company_name)}</h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate((_j = unref(supplier)) == null ? void 0 : _j.address)} \xB7 ${ssrInterpolate((_k = unref(supplier)) == null ? void 0 : _k.phone)}</p></div><div class="flex gap-2"><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="input-glass w-auto text-xs py-1.5"><span class="text-gray-600 self-center">\u2192</span><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="input-glass w-auto text-xs py-1.5"></div></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Reference</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit (Payment)</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit (Purchase)</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Balance</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(ledger), (tx) => {
          _push(`<tr class="hover:bg-white/[0.02]"><td class="py-2.5 px-3 text-gray-500 font-mono">${ssrInterpolate(tx.date)}</td><td class="py-2.5 px-3 text-gray-300">${ssrInterpolate(tx.description)}</td><td class="py-2.5 px-3 font-mono text-gray-600">${ssrInterpolate(tx.ref)}</td><td class="py-2.5 px-3 text-right font-mono text-emerald-400">${ssrInterpolate(Number(tx.debit) > 0 ? `\u09F3${Number(tx.debit).toLocaleString()}` : "\u2014")}</td><td class="py-2.5 px-3 text-right font-mono text-red-400">${ssrInterpolate(Number(tx.credit) > 0 ? `\u09F3${Number(tx.credit).toLocaleString()}` : "\u2014")}</td><td class="py-2.5 px-3 text-right font-bold font-mono text-gray-200">\u09F3${ssrInterpolate(Number(tx.balance).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot class="border-t-2 border-white/10"><tr><td colspan="3" class="pt-3 px-3 font-bold text-gray-400">Closing Balance</td><td class="pt-3 px-3 text-right font-bold font-mono text-emerald-400">\u09F3${ssrInterpolate(Number((_l = unref(stats).total_paid) != null ? _l : 0).toLocaleString())}</td><td class="pt-3 px-3 text-right font-bold font-mono text-red-400">\u09F3${ssrInterpolate(Number((_m = unref(stats).total_purchased) != null ? _m : 0).toLocaleString())}</td><td class="pt-3 px-3 text-right font-bold font-mono text-gold-400 text-sm">\u09F3${ssrInterpolate(Number((_o = (_n = unref(supplier)) == null ? void 0 : _n.current_balance) != null ? _o : 0).toLocaleString())}</td></tr></tfoot></table></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/suppliers/[id]/ledger.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ledger-CRUCNq4v.mjs.map
