import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, reactive, ref, computed, withAsyncContext, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { c as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import '@vue/shared';
import 'perfect-debounce';
import 'vue-router';

const perPage = 25;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "vouchers",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const filters = reactive({
      dateFrom: "",
      dateTo: "",
      status: "",
      branchId: "",
      categoryId: "",
      search: ""
    });
    const page = ref(1);
    const activeFilters = ref({ ...filters });
    const query = computed(() => ({
      page: page.value,
      per: perPage,
      search: activeFilters.value.search || void 0,
      status: activeFilters.value.status || void 0,
      branch_id: activeFilters.value.branchId || void 0,
      category_id: activeFilters.value.categoryId || void 0,
      date_from: activeFilters.value.dateFrom || void 0,
      date_to: activeFilters.value.dateTo || void 0
    }));
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/expenses",
      { query },
      "$7W8r2p_FKz"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.expenses) != null ? _b : [];
    });
    const total = computed(() => {
      var _a, _b;
      return Number((_b = (_a = data.value) == null ? void 0 : _a.total) != null ? _b : 0);
    });
    const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)));
    const statsRaw = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const statCards = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g;
      return [
        {
          label: "Total Vouchers",
          value: (_b = (_a = statsRaw.value.totalCount) == null ? void 0 : _a.toLocaleString()) != null ? _b : "0",
          color: "text-gray-200",
          sub: ""
        },
        {
          label: "Pending",
          value: (_d = (_c = statsRaw.value.pendingCount) == null ? void 0 : _c.toLocaleString()) != null ? _d : "0",
          color: "text-yellow-400",
          sub: statsRaw.value.pendingAmount ? `\u09F3${Number(statsRaw.value.pendingAmount).toLocaleString()}` : ""
        },
        {
          label: "Approved",
          value: (_f = (_e = statsRaw.value.approvedCount) == null ? void 0 : _e.toLocaleString()) != null ? _f : "0",
          color: "text-green-400",
          sub: ""
        },
        {
          label: "Approved Amount",
          value: "\u09F3" + Number((_g = statsRaw.value.approvedAmount) != null ? _g : 0).toLocaleString(),
          color: "text-gold-400",
          sub: "Total approved spend"
        }
      ];
    });
    const [{ data: branchData }, { data: catData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/branches",
        "$lAlmAa5yCP"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/expenses/categories",
        { query: { spend: false } },
        "$-cgh_zXMWT"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = branchData.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const categories = computed(() => {
      var _a, _b;
      return (_b = (_a = catData.value) == null ? void 0 : _a.categories) != null ? _b : [];
    });
    watch(page, () => refresh());
    const deleteTarget = ref(null);
    const deletingId = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-c2e4889a>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Expense Vouchers",
        subtitle: "Create, track and manage all expense vouchers",
        breadcrumb: ["Expenses", "Vouchers"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/expenses/create",
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
                to: "/expenses/create",
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
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-c2e4889a><!--[-->`);
      ssrRenderList(unref(statCards), (card) => {
        _push(`<div class="glass-card p-4 flex flex-col gap-1" data-v-c2e4889a><div class="text-xs text-gray-500 uppercase tracking-wider font-semibold" data-v-c2e4889a>${ssrInterpolate(card.label)}</div><div class="${ssrRenderClass(["text-2xl font-black font-mono", card.color])}" data-v-c2e4889a>${ssrInterpolate(card.value)}</div>`);
        if (card.sub) {
          _push(`<div class="text-xs text-gray-600" data-v-c2e4889a>${ssrInterpolate(card.sub)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div><div class="glass-card p-4" data-v-c2e4889a><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3" data-v-c2e4889a><div class="space-y-1" data-v-c2e4889a><label class="text-xs text-gray-500 font-semibold uppercase tracking-wider" data-v-c2e4889a>From</label><input${ssrRenderAttr("value", unref(filters).dateFrom)} type="date" class="input-glass text-xs" data-v-c2e4889a></div><div class="space-y-1" data-v-c2e4889a><label class="text-xs text-gray-500 font-semibold uppercase tracking-wider" data-v-c2e4889a>To</label><input${ssrRenderAttr("value", unref(filters).dateTo)} type="date" class="input-glass text-xs" data-v-c2e4889a></div><div class="space-y-1" data-v-c2e4889a><label class="text-xs text-gray-500 font-semibold uppercase tracking-wider" data-v-c2e4889a>Status</label><select class="input-glass text-xs" data-v-c2e4889a><option value="" data-v-c2e4889a${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "") : ssrLooseEqual(unref(filters).status, "")) ? " selected" : ""}>All Statuses</option><option value="pending" data-v-c2e4889a${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "pending") : ssrLooseEqual(unref(filters).status, "pending")) ? " selected" : ""}>Pending</option><option value="approved" data-v-c2e4889a${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "approved") : ssrLooseEqual(unref(filters).status, "approved")) ? " selected" : ""}>Approved</option><option value="rejected" data-v-c2e4889a${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "rejected") : ssrLooseEqual(unref(filters).status, "rejected")) ? " selected" : ""}>Rejected</option></select></div><div class="space-y-1" data-v-c2e4889a><label class="text-xs text-gray-500 font-semibold uppercase tracking-wider" data-v-c2e4889a>Branch</label><select class="input-glass text-xs" data-v-c2e4889a><option value="" data-v-c2e4889a${ssrIncludeBooleanAttr(Array.isArray(unref(filters).branchId) ? ssrLooseContain(unref(filters).branchId, "") : ssrLooseEqual(unref(filters).branchId, "")) ? " selected" : ""}>All Branches</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)} data-v-c2e4889a${ssrIncludeBooleanAttr(Array.isArray(unref(filters).branchId) ? ssrLooseContain(unref(filters).branchId, b.id) : ssrLooseEqual(unref(filters).branchId, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1" data-v-c2e4889a><label class="text-xs text-gray-500 font-semibold uppercase tracking-wider" data-v-c2e4889a>Category</label><select class="input-glass text-xs" data-v-c2e4889a><option value="" data-v-c2e4889a${ssrIncludeBooleanAttr(Array.isArray(unref(filters).categoryId) ? ssrLooseContain(unref(filters).categoryId, "") : ssrLooseEqual(unref(filters).categoryId, "")) ? " selected" : ""}>All Categories</option><!--[-->`);
      ssrRenderList(unref(categories), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)} data-v-c2e4889a${ssrIncludeBooleanAttr(Array.isArray(unref(filters).categoryId) ? ssrLooseContain(unref(filters).categoryId, c.id) : ssrLooseEqual(unref(filters).categoryId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1" data-v-c2e4889a><label class="text-xs text-gray-500 font-semibold uppercase tracking-wider" data-v-c2e4889a>Search</label><input${ssrRenderAttr("value", unref(filters).search)} type="search" class="input-glass text-xs" placeholder="Voucher # / remarks\u2026" data-v-c2e4889a></div></div><div class="mt-3 flex justify-end gap-2" data-v-c2e4889a><button class="btn-ghost text-xs py-1.5 px-3" data-v-c2e4889a>Reset</button><button class="btn-gold text-xs py-1.5 px-4" data-v-c2e4889a>Apply Filters</button></div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-c2e4889a>Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-c2e4889a>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<div class="glass-card p-5" data-v-c2e4889a><div class="overflow-x-auto" data-v-c2e4889a><table class="w-full text-xs" data-v-c2e4889a><thead data-v-c2e4889a><tr class="border-b border-white/5" data-v-c2e4889a><th class="th-cell" data-v-c2e4889a>Voucher #</th><th class="th-cell" data-v-c2e4889a>Date</th><th class="th-cell" data-v-c2e4889a>Category</th><th class="th-cell" data-v-c2e4889a>Description</th><th class="th-cell text-right" data-v-c2e4889a>Amount</th><th class="th-cell" data-v-c2e4889a>Method</th><th class="th-cell" data-v-c2e4889a>Branch</th><th class="th-cell" data-v-c2e4889a>Status</th><th class="th-cell" data-v-c2e4889a>Actions</th></tr></thead><tbody data-v-c2e4889a>`);
        if (!unref(rows).length) {
          _push(`<tr data-v-c2e4889a><td colspan="9" class="py-10 text-center text-gray-600" data-v-c2e4889a>No expense vouchers found</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(rows), (row) => {
          var _a2;
          _push(`<tr class="border-b border-white/4 hover:bg-white/2 transition-colors" data-v-c2e4889a><td class="td-cell font-mono text-gold-400/80" data-v-c2e4889a>${ssrInterpolate(row.voucher_number)}</td><td class="td-cell text-gray-400" data-v-c2e4889a>${ssrInterpolate(String(row.expense_date).slice(0, 10))}</td><td class="td-cell text-gray-300" data-v-c2e4889a>${ssrInterpolate(row.category_name)}</td><td class="td-cell max-w-48 truncate text-gray-400"${ssrRenderAttr("title", row.remarks)} data-v-c2e4889a>${ssrInterpolate(row.remarks)}</td><td class="td-cell text-right font-mono font-bold text-red-400" data-v-c2e4889a>\u09F3${ssrInterpolate(Number(row.total_amount).toLocaleString())}</td><td class="td-cell text-gray-500" data-v-c2e4889a>${ssrInterpolate(row.payment_method)}</td><td class="td-cell text-gray-500" data-v-c2e4889a>${ssrInterpolate((_a2 = row.branch_name) != null ? _a2 : "\u2014")}</td><td class="td-cell" data-v-c2e4889a>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: row.status
          }, null, _parent));
          _push(`</td><td class="td-cell" data-v-c2e4889a><div class="flex gap-1.5" data-v-c2e4889a>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/expenses/${row.id}`,
            class: "btn-ghost text-xs py-1 px-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`View`);
              } else {
                return [
                  createTextVNode("View")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/expenses/${row.id}/voucher`,
            class: "btn-ghost text-xs py-1 px-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Print`);
              } else {
                return [
                  createTextVNode("Print")
                ];
              }
            }),
            _: 2
          }, _parent));
          if (row.status === "pending") {
            _push(`<button${ssrIncludeBooleanAttr(unref(deletingId) === row.id) ? " disabled" : ""} class="text-xs py-1 px-2 rounded-lg border border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-40" data-v-c2e4889a>${ssrInterpolate(unref(deletingId) === row.id ? "\u2026" : "Del")}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div><div class="mt-4 flex items-center justify-between text-xs text-gray-500" data-v-c2e4889a><span data-v-c2e4889a>Showing ${ssrInterpolate(unref(rows).length)} of ${ssrInterpolate(unref(total))} vouchers</span><div class="flex gap-2" data-v-c2e4889a><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3 disabled:opacity-30" data-v-c2e4889a>\u2190 Prev</button><span class="px-3 py-1 rounded-lg bg-white/5 font-semibold text-gray-300" data-v-c2e4889a>${ssrInterpolate(unref(page))} / ${ssrInterpolate(unref(totalPages))}</span><button${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3 disabled:opacity-30" data-v-c2e4889a>Next \u2192</button></div></div></div>`);
      }
      if (unref(deleteTarget)) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}" data-v-c2e4889a><div class="glass-card max-w-sm w-full p-6 space-y-4" data-v-c2e4889a><h3 class="text-base font-bold text-red-400" data-v-c2e4889a>Delete Expense Voucher</h3><p class="text-sm text-gray-400" data-v-c2e4889a> Delete <span class="font-mono text-white" data-v-c2e4889a>${ssrInterpolate(unref(deleteTarget).voucher_number)}</span>? This action cannot be undone. </p><p class="text-xs text-gray-500" data-v-c2e4889a> Amount: <span class="font-bold text-red-400" data-v-c2e4889a>\u09F3${ssrInterpolate(Number(unref(deleteTarget).total_amount).toLocaleString())}</span></p><div class="flex gap-3 justify-end" data-v-c2e4889a><button class="btn-ghost text-xs" data-v-c2e4889a>Cancel</button><button${ssrIncludeBooleanAttr(unref(deletingId) === ((_a = unref(deleteTarget)) == null ? void 0 : _a.id)) ? " disabled" : ""} class="text-xs px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors disabled:opacity-50" data-v-c2e4889a>${ssrInterpolate(unref(deletingId) === ((_b = unref(deleteTarget)) == null ? void 0 : _b.id) ? "Deleting\u2026" : "Yes, Delete")}</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/vouchers.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const vouchers = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c2e4889a"]]);

export { vouchers as default };
//# sourceMappingURL=vouchers-CX4Y53Ab.mjs.map
