import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrRenderList } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/customers/${route.params.id}`,
      "$5dQdnDersU"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const c = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.customer) != null ? _b : {};
    });
    const recentOrders = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recentOrders) != null ? _b : [];
    });
    const recentPayments = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recentPayments) != null ? _b : [];
    });
    const creditPct = computed(() => {
      var _a, _b;
      const limit = Number((_a = c.value.credit_limit) != null ? _a : 0);
      const balance = Number((_b = c.value.current_balance) != null ? _b : 0);
      if (!limit) return 0;
      return Math.min(100, Math.round(balance / limit * 100));
    });
    const available = computed(
      () => {
        var _a, _b;
        return Math.max(0, Number((_a = c.value.credit_limit) != null ? _a : 0) - Number((_b = c.value.current_balance) != null ? _b : 0));
      }
    );
    const orderCols = [
      { key: "order_number", label: "Order #", sortable: true },
      { key: "order_date", label: "Date", sortable: true },
      { key: "total_amount", label: "Amount", sortable: true },
      { key: "status", label: "Status" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading customer\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(c).name,
          subtitle: `${unref(c).customer_type || "Customer"} \xB7 ${unref(c).city || unref(c).branch_name || "\u2014"}`,
          breadcrumb: ["Customers", unref(c).name]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/customers/${unref(route).params.id}/edit`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Edit`);
                  } else {
                    return [
                      createTextVNode("Edit")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/credit-sales/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`+ New Order`);
                  } else {
                    return [
                      createTextVNode("+ New Order")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/customers/${unref(route).params.id}/edit`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Edit")
                  ]),
                  _: 1
                }, 8, ["to"]),
                createVNode(_component_NuxtLink, {
                  to: "/credit-sales/create",
                  class: "btn-gold text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("+ New Order")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="space-y-5"><div class="glass-card p-5 space-y-4"><div class="flex items-start gap-3"><div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#f59e0b,#d97706)" })}">${ssrInterpolate((unref(c).name || "?")[0])}</div><div class="min-w-0"><h2 class="font-semibold text-gray-100 leading-tight">${ssrInterpolate(unref(c).name)}</h2>`);
        if (unref(c).business_name) {
          _push(`<p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(c).business_name)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(c).status
        }, null, _parent));
        _push(`</div></div><div class="space-y-2.5 text-xs"><div class="flex gap-2"><span class="text-gray-600 w-24 shrink-0">Type</span>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(c).customer_type || "credit"
        }, null, _parent));
        _push(`</div><div class="flex gap-2"><span class="text-gray-600 w-24 shrink-0">Phone</span><span class="text-gray-300">${ssrInterpolate(unref(c).phone_number || unref(c).mobile || "\u2014")}</span></div>`);
        if (unref(c).email) {
          _push(`<div class="flex gap-2"><span class="text-gray-600 w-24 shrink-0">Email</span><span class="text-gray-300 truncate">${ssrInterpolate(unref(c).email)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-2"><span class="text-gray-600 w-24 shrink-0">City</span><span class="text-gray-300">${ssrInterpolate(unref(c).city || "\u2014")}</span></div>`);
        if (unref(c).address) {
          _push(`<div class="flex gap-2"><span class="text-gray-600 w-24 shrink-0">Address</span><span class="text-gray-400 leading-relaxed">${ssrInterpolate(unref(c).address)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).created_at) {
          _push(`<div class="flex gap-2"><span class="text-gray-600 w-24 shrink-0">Customer Since</span><span class="text-gray-400">${ssrInterpolate(String(unref(c).created_at).slice(0, 10))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        if (unref(c).customer_type === "credit") {
          _push(`<div class="glass-card p-5 space-y-3"><h3 class="section-title">Credit Summary</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Limit</span><span class="font-semibold text-gray-200">\u09F3${ssrInterpolate(Number(unref(c).credit_limit || 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Outstanding</span><span class="font-bold text-red-400">\u09F3${ssrInterpolate(Number(unref(c).current_balance || 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Available</span><span class="font-semibold text-emerald-400">\u09F3${ssrInterpolate(unref(available).toLocaleString())}</span></div>`);
          if (unref(c).payment_terms) {
            _push(`<div class="flex justify-between"><span class="text-gray-600">Terms</span><span class="text-gray-300">${ssrInterpolate(unref(c).payment_terms)} days</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="h-2 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full transition-all" style="${ssrRenderStyle(`width:${unref(creditPct)}%;background:${unref(creditPct) > 80 ? "#ef4444" : "#10b981"}`)}"></div></div><p class="text-[10px] text-right text-gray-600">${ssrInterpolate(unref(creditPct))}% utilised</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="lg:col-span-2 space-y-5"><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h3 class="section-title">Recent Orders</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/credit-sales/all",
          class: "text-xs text-gold-400 hover:text-gold-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`All \u2192`);
            } else {
              return [
                createTextVNode("All \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: orderCols,
          rows: unref(recentOrders),
          "per-page": 5,
          "search-placeholder": ""
        }, {
          "cell-order_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          "cell-total_amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs font-bold text-gray-200"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs font-bold text-gray-200" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/credit-sales/${row.id}`,
                class: "btn-ghost text-xs py-1 px-2"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`View`);
                  } else {
                    return [
                      createTextVNode("View")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/credit-sales/${row.id}`,
                  class: "btn-ghost text-xs py-1 px-2"
                }, {
                  default: withCtx(() => [
                    createTextVNode("View")
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h3 class="section-title">Recent Payments</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/credit-sales/payments",
          class: "text-xs text-gold-400 hover:text-gold-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`All payments \u2192`);
            } else {
              return [
                createTextVNode("All payments \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Reference</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Method</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Amount</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(recentPayments), (pmt) => {
          _push(`<tr class="hover:bg-white/[0.02]"><td class="py-2.5 px-3 text-gray-500 font-mono">${ssrInterpolate(pmt.payment_date)}</td><td class="py-2.5 px-3 text-gray-400 font-mono text-[11px]">${ssrInterpolate(pmt.reference_number || "\u2014")}</td><td class="py-2.5 px-3 text-gray-400">${ssrInterpolate(pmt.payment_method || "\u2014")}</td><td class="py-2.5 px-3 text-right font-bold text-emerald-400">\u09F3${ssrInterpolate(Number(pmt.amount).toLocaleString())}</td><td class="py-2.5 px-3 text-center">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: pmt.allocation_status || "cleared"
          }, null, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(recentPayments).length) {
          _push(`<tr><td colspan="5" class="py-6 text-center text-gray-600 text-xs">No payments recorded</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/customers/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-0qRIgr5n.mjs.map
