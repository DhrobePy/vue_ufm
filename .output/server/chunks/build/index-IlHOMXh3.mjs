import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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

const perPage = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const statusFilter = ref("");
    const page = ref(1);
    const cols = [
      { key: "voucher_number", label: "Voucher #", sortable: true },
      { key: "date", label: "Date", sortable: true },
      { key: "paid_to", label: "Pay To", sortable: true },
      { key: "purpose", label: "Purpose" },
      { key: "payment_account", label: "Method" },
      { key: "amount", label: "Amount", sortable: true },
      { key: "status", label: "Status" }
    ];
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/vouchers",
      {
        query: computed(() => ({
          search: search.value,
          status: statusFilter.value,
          page: page.value,
          per: perPage
        }))
      },
      "$tykqzYEmxe"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vouchers = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.vouchers) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const total = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.total) != null ? _b : 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Debit Vouchers",
        subtitle: "Payment vouchers authorised for disbursement",
        breadcrumb: ["Accounts", "Voucher"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/accounts/voucher/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Voucher`);
                } else {
                  return [
                    createTextVNode("+ New Voucher")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/accounts/voucher/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Voucher")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Today&#39;s Vouchers</p><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).today_count) != null ? _a : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Today&#39;s Total</p><p class="text-2xl font-bold text-red-400">\u09F3${ssrInterpolate(Number((_b = unref(stats).today_total) != null ? _b : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Pending Approval</p><p class="text-2xl font-bold text-yellow-400">${ssrInterpolate((_c = unref(stats).pending_count) != null ? _c : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">This Month Total</p><p class="text-2xl font-bold text-gray-200">\u09F3${ssrInterpolate(Number((_d = unref(stats).month_total) != null ? _d : 0).toLocaleString())}</p></div></div><div class="glass-card p-4 flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" placeholder="Search voucher #, payee\u2026"><select class="input-glass w-auto text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "") : ssrLooseEqual(unref(statusFilter), "")) ? " selected" : ""}>All Status</option><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "draft") : ssrLooseEqual(unref(statusFilter), "draft")) ? " selected" : ""}>Draft / Pending</option><option value="approved"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "approved") : ssrLooseEqual(unref(statusFilter), "approved")) ? " selected" : ""}>Approved</option><option value="cancelled"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "cancelled") : ssrLooseEqual(unref(statusFilter), "cancelled")) ? " selected" : ""}>Cancelled</option></select><button class="btn-ghost text-xs py-1.5">Reset</button></div><div class="glass-card p-5">`);
      if (unref(pending)) {
        _push(`<div class="py-8 text-center text-xs text-gray-500 animate-pulse">Loading vouchers\u2026</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(vouchers),
          "per-page": 15,
          "search-placeholder": ""
        }, {
          "cell-voucher_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs font-bold text-red-400"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs font-bold text-red-400" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
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
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex gap-1.5"${_scopeId}><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>View</button><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>Print</button></div>`);
            } else {
              return [
                createVNode("div", { class: "flex gap-1.5" }, [
                  createVNode("button", { class: "btn-ghost text-xs py-1 px-2" }, "View"),
                  createVNode("button", { class: "btn-ghost text-xs py-1 px-2" }, "Print")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div>`);
      if (unref(total) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(unref(total) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(unref(total) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/voucher/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-IlHOMXh3.mjs.map
