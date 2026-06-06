import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
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
  __name: "summary",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const statusFilter = ref("active");
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/suppliers/summary",
      {
        query: computed(() => ({
          search: search.value,
          status: statusFilter.value
        }))
      },
      "$O_9nGMZ5cg"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const suppliers = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.suppliers) != null ? _b : [];
    });
    const totals = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.totals) != null ? _b : {
        suppliers: 0,
        total_orders: 0,
        ordered_kg: 0,
        ordered_value: 0,
        received_kg: 0,
        receivable_value: 0,
        paid: 0,
        adj_debit: 0,
        adj_credit: 0,
        suppliers_with_adj: 0,
        balance_due: 0,
        advance: 0,
        net_adj: 0
      };
    });
    function fmt(v) {
      return Number(v != null ? v : 0).toLocaleString();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Supplier Summary",
        subtitle: "Comprehensive supplier-wise purchase overview",
        breadcrumb: ["Purchase", "Suppliers", "Summary"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
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
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center border-l-2 border-blue-500/40"><p class="text-xs text-gray-500 mb-1">Total Suppliers</p><p class="text-2xl font-bold text-gray-200">${ssrInterpolate(unref(totals).suppliers)}</p>`);
      if (unref(totals).suppliers_with_adj > 0) {
        _push(`<p class="text-[10px] text-indigo-400 mt-0.5">${ssrInterpolate(unref(totals).suppliers_with_adj)} with adjustments </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="glass-card p-4 text-center border-l-2 border-purple-500/40"><p class="text-xs text-gray-500 mb-1">Total Orders</p><p class="text-2xl font-bold text-gray-200">${ssrInterpolate(unref(totals).total_orders.toLocaleString())}</p></div><div class="glass-card p-4 text-center border-l-2 border-emerald-500/40"><p class="text-xs text-gray-500 mb-1">Total Paid</p><p class="text-2xl font-bold text-emerald-400">\u09F3${ssrInterpolate(fmt(unref(totals).paid))}</p><p class="text-[10px] text-gray-600 mt-0.5">Posted payments only</p></div><div class="glass-card p-4 text-center border-l-2 border-red-500/40"><p class="text-xs text-gray-500 mb-1">Total Balance Due</p><p class="text-2xl font-bold text-red-400">\u09F3${ssrInterpolate(fmt(unref(totals).balance_due))}</p>`);
      if (unref(totals).advance > 0) {
        _push(`<p class="text-[10px] text-blue-400 mt-0.5"> \u09F3${ssrInterpolate(fmt(unref(totals).advance))} advance across suppliers </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(totals).adj_debit > 0 || unref(totals).adj_credit > 0) {
        _push(`<div class="glass-card p-4 flex flex-wrap items-center gap-5 text-xs border border-indigo-500/20"><span class="font-semibold text-indigo-400">\u2696 Ledger Adjustments (posted)</span><span><span class="text-gray-500">Adj Debits:</span><span class="text-red-400 font-bold ml-1">\u09F3${ssrInterpolate(fmt(unref(totals).adj_debit))}</span><span class="text-gray-600 ml-1">(Add Payable)</span></span><span><span class="text-gray-500">Adj Credits:</span><span class="text-emerald-400 font-bold ml-1">\u09F3${ssrInterpolate(fmt(unref(totals).adj_credit))}</span><span class="text-gray-600 ml-1">(Reduce Payable)</span></span><span class="${ssrRenderClass([unref(totals).net_adj >= 0 ? "text-red-400" : "text-emerald-400", "font-bold"])}"> Net: ${ssrInterpolate(unref(totals).net_adj >= 0 ? "+" : "")}\u09F3${ssrInterpolate(fmt(Math.abs(unref(totals).net_adj)))} <span class="text-gray-500 font-normal ml-1">${ssrInterpolate(unref(totals).net_adj >= 0 ? "(increases payable)" : "(reduces payable)")}</span></span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-4 flex flex-wrap items-center gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search supplier name, code, phone\u2026"><select class="field-input text-xs py-1.5 w-36"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "active") : ssrLooseEqual(unref(statusFilter), "active")) ? " selected" : ""}>Active Only</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "inactive") : ssrLooseEqual(unref(statusFilter), "inactive")) ? " selected" : ""}>Inactive Only</option><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "all") : ssrLooseEqual(unref(statusFilter), "all")) ? " selected" : ""}>All Suppliers</option></select><button class="btn-ghost text-xs py-1.5">Reset</button><div class="ml-auto text-xs text-gray-500"><span class="font-medium text-gray-300">${ssrInterpolate(unref(suppliers).length)}</span> suppliers </div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<div class="text-[10px] text-gray-600 -mt-2 px-1"> * Receivable = Expected Qty \xD7 PO Contract Rate (verified GRNs) \xB7 Balance = (Receivable + Adj Debits) \u2212 (Paid + Adj Credits) </div>`);
      }
      if (!unref(pending) && !unref(error)) {
        _push(`<div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.08]"><th class="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Supplier</th><th class="px-4 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Orders</th><th class="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Ordered (KG)</th><th class="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Ordered Value</th><th class="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Received (KG)</th><th class="px-4 py-3 text-right text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Receivable*</th><th class="px-4 py-3 text-right text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Net Adj</th><th class="px-4 py-3 text-right text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Paid</th><th class="px-4 py-3 text-right text-[10px] font-semibold text-red-400 uppercase tracking-wider">Balance Due</th><th class="px-4 py-3 text-right text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Advance</th><th class="px-4 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th><th class="px-4 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th></tr></thead><tbody class="divide-y divide-white/[0.04]">`);
        if (!unref(suppliers).length) {
          _push(`<tr><td colspan="12" class="px-4 py-10 text-center text-gray-600">No suppliers found.</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(suppliers), (s) => {
          _push(`<tr class="${ssrRenderClass([s.balance_due > 0 ? "hover:bg-red-500/[0.03]" : "", "hover:bg-white/[0.02] transition-colors"])}"><td class="px-4 py-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/suppliers/${s.id}/ledger`,
            class: "font-semibold text-gold-400/80 hover:underline block"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(s.company_name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(s.company_name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          if (s.supplier_code) {
            _push(`<p class="text-gray-600 font-mono">${ssrInterpolate(s.supplier_code)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (s.phone) {
            _push(`<p class="text-gray-600">${ssrInterpolate(s.phone)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (s.last_order_date) {
            _push(`<p class="text-gray-700 mt-0.5"> Last: ${ssrInterpolate(s.last_order_date)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 text-center"><span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">${ssrInterpolate(s.total_orders)}</span>`);
          if (s.active_orders > 0) {
            _push(`<p class="text-emerald-500 text-[10px] mt-0.5">${ssrInterpolate(s.active_orders)} active</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 text-right font-mono text-gray-300 font-semibold">${ssrInterpolate(Number(s.total_ordered_kg).toLocaleString())}</td><td class="px-4 py-3 text-right font-mono text-gray-400"> \u09F3${ssrInterpolate(fmt(s.total_ordered_value))}</td><td class="${ssrRenderClass([Number(s.total_received_kg) >= Number(s.total_ordered_kg) ? "text-emerald-400" : Number(s.total_received_kg) > 0 ? "text-yellow-400" : "text-gray-600", "px-4 py-3 text-right font-mono font-semibold"])}">${ssrInterpolate(Number(s.total_received_kg).toLocaleString())}</td><td class="px-4 py-3 text-right font-mono font-semibold text-purple-400"> \u09F3${ssrInterpolate(fmt(s.total_receivable_value))}</td><td class="px-4 py-3 text-right font-semibold">`);
          if (s.adj_count == 0) {
            _push(`<span class="text-gray-700">\u2014</span>`);
          } else if (s.net_adjustment > 0) {
            _push(`<!--[--><span class="text-red-400">+\u09F3${ssrInterpolate(fmt(s.net_adjustment))}</span><p class="text-gray-600 text-[10px]">${ssrInterpolate(s.adj_count)} adj</p><!--]-->`);
          } else if (s.net_adjustment < 0) {
            _push(`<!--[--><span class="text-emerald-400">\u2212\u09F3${ssrInterpolate(fmt(Math.abs(s.net_adjustment)))}</span><p class="text-gray-600 text-[10px]">${ssrInterpolate(s.adj_count)} adj</p><!--]-->`);
          } else {
            _push(`<span class="text-gray-600 text-[10px]">\xB10 (${ssrInterpolate(s.adj_count)} cancel out)</span>`);
          }
          _push(`</td><td class="px-4 py-3 text-right font-mono font-semibold text-emerald-400"> \u09F3${ssrInterpolate(fmt(s.total_paid))}</td><td class="px-4 py-3 text-right font-mono font-semibold">`);
          if (s.balance_due > 0) {
            _push(`<span class="text-red-400">\u09F3${ssrInterpolate(fmt(s.balance_due))}</span>`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="px-4 py-3 text-right">`);
          if (s.advance > 0) {
            _push(`<span class="inline-block px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20"> \u09F3${ssrInterpolate(fmt(s.advance))}</span>`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="px-4 py-3 text-center">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: s.status
          }, null, _parent));
          _push(`</td><td class="px-4 py-3 text-center">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/suppliers/${s.id}/ledger`,
            class: "text-gold-500 hover:text-gold-400 text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u{1F4D2} Ledger`);
              } else {
                return [
                  createTextVNode("\u{1F4D2} Ledger")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(suppliers).length) {
          _push(`<tr class="border-t-2 border-white/[0.12] bg-white/[0.02] font-bold"><td class="px-4 py-3 text-right text-gray-400 text-xs uppercase tracking-wider">Grand Totals</td><td class="px-4 py-3 text-center text-gray-200">${ssrInterpolate(unref(totals).total_orders.toLocaleString())}</td><td class="px-4 py-3 text-right font-mono text-gray-200">${ssrInterpolate(Number(unref(totals).ordered_kg).toLocaleString())}</td><td class="px-4 py-3 text-right font-mono text-gray-200">\u09F3${ssrInterpolate(fmt(unref(totals).ordered_value))}</td><td class="px-4 py-3 text-right font-mono text-gray-200">${ssrInterpolate(Number(unref(totals).received_kg).toLocaleString())}</td><td class="px-4 py-3 text-right font-mono text-purple-400">\u09F3${ssrInterpolate(fmt(unref(totals).receivable_value))}</td><td class="${ssrRenderClass([unref(totals).net_adj > 0 ? "text-red-400" : unref(totals).net_adj < 0 ? "text-emerald-400" : "text-gray-600", "px-4 py-3 text-right font-mono"])}">`);
          if (unref(totals).net_adj !== 0) {
            _push(`<!--[-->${ssrInterpolate(unref(totals).net_adj > 0 ? "+" : "\u2212")}\u09F3${ssrInterpolate(fmt(Math.abs(unref(totals).net_adj)))}<!--]-->`);
          } else {
            _push(`<!--[-->\u2014<!--]-->`);
          }
          _push(`</td><td class="px-4 py-3 text-right font-mono text-emerald-400">\u09F3${ssrInterpolate(fmt(unref(totals).paid))}</td><td class="px-4 py-3 text-right font-mono text-red-400"> \u09F3${ssrInterpolate(fmt(unref(totals).balance_due))} <p class="text-[10px] text-indigo-400 font-normal">incl. adj</p></td><td class="px-4 py-3 text-right font-mono text-blue-400">\u09F3${ssrInterpolate(fmt(unref(totals).advance))}</td><td colspan="2"></td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/suppliers/summary.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=summary-aFFzrxgt.mjs.map
