import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { n as navigateTo } from './server.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, unref, createTextVNode, openBlock, createBlock, createCommentVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-Bt-D0WF_.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import 'vue-router';
import './permRoutes-Ddy1yO1t.mjs';
import '@vue/shared';
import 'perfect-debounce';

const perPage = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "all",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const search = ref("");
    const activeFilter = ref("");
    const priorityFilter = ref("");
    const page = ref(1);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales",
      {
        query: computed(() => ({
          search: search.value,
          status: activeFilter.value,
          page: page.value,
          per: perPage
        }))
      },
      "$LrEjsn-U18"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const heldOnly = ref(false);
    const allRows = computed(() => {
      var _a, _b;
      return ((_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : []).map((o) => ({
        ...o,
        customer: o.customer_name,
        date: o.order_date
      }));
    });
    const rows = computed(
      () => heldOnly.value ? allRows.value.filter((r) => r.production_hold_active || r.dispatch_hold) : allRows.value
    );
    const heldCount = computed(() => allRows.value.filter((r) => r.production_hold_active || r.dispatch_hold).length);
    function conditionLabel(row) {
      var _a;
      const amt = row.condition_amount != null ? ` \u09F3${Number(row.condition_amount).toLocaleString()}` : "";
      const map = {
        manual: "Manual clearance by accounts",
        outstanding_below: `Old dues below${amt}`,
        outstanding_after_ship: Number(row.condition_amount) === 0 ? "Pay everything first" : `Dues after ship \u2264${amt}`,
        amount_received: `Receive${amt} on this order`
      };
      return (_a = map[row.condition_type]) != null ? _a : "Dispatch hold";
    }
    const statusFilters = [
      { value: "", label: "All" },
      { value: "pending_approval", label: "Pending Approval" },
      { value: "escalated", label: "Escalated" },
      { value: "approved", label: "Approved" },
      { value: "in_production", label: "In Production" },
      { value: "ready_to_ship", label: "Ready to Ship" },
      { value: "goods_on_board", label: "Goods on Board" },
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" }
    ];
    const cols = [
      { key: "order_number", label: "Order #", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "order_date", label: "Date", sortable: true },
      { key: "total_amount", label: "Total", sortable: true },
      { key: "balance_due", label: "Balance" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" },
      { key: "hold", label: "Hold / Condition" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "All Sales",
        subtitle: "Complete credit order history",
        breadcrumb: ["Credit Sales", "All Sales"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(perms).canDo("credit_sales", "all", "create")) {
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
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(perms).canDo("credit_sales", "all", "create") ? (openBlock(), createBlock(_component_NuxtLink, {
                key: 0,
                to: "/credit-sales/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Order")
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-center gap-2 flex-wrap"><!--[-->`);
      ssrRenderList(statusFilters, (f) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border",
          unref(activeFilter) === f.value ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]"
        ])}">${ssrInterpolate(f.label)} `);
        if (f.count !== void 0) {
          _push(`<span class="ml-1 opacity-60">${ssrInterpolate(f.count)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div><div class="glass-card p-4 flex flex-wrap items-center gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search order #, customer\u2026"><select class="field-input text-xs py-1.5 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(priorityFilter)) ? ssrLooseContain(unref(priorityFilter), "") : ssrLooseEqual(unref(priorityFilter), "")) ? " selected" : ""}>All Priorities</option><option value="urgent"${ssrIncludeBooleanAttr(Array.isArray(unref(priorityFilter)) ? ssrLooseContain(unref(priorityFilter), "urgent") : ssrLooseEqual(unref(priorityFilter), "urgent")) ? " selected" : ""}>Urgent</option><option value="high"${ssrIncludeBooleanAttr(Array.isArray(unref(priorityFilter)) ? ssrLooseContain(unref(priorityFilter), "high") : ssrLooseEqual(unref(priorityFilter), "high")) ? " selected" : ""}>High</option><option value="normal"${ssrIncludeBooleanAttr(Array.isArray(unref(priorityFilter)) ? ssrLooseContain(unref(priorityFilter), "normal") : ssrLooseEqual(unref(priorityFilter), "normal")) ? " selected" : ""}>Normal</option></select><label class="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer select-none"><input${ssrIncludeBooleanAttr(Array.isArray(unref(heldOnly)) ? ssrLooseContain(unref(heldOnly), null) : unref(heldOnly)) ? " checked" : ""} type="checkbox" class="accent-amber-500"> \u26A0 Held only `);
      if (unref(heldCount)) {
        _push(`<span class="text-amber-400 font-semibold">(${ssrInterpolate(unref(heldCount))})</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label><button class="btn-ghost text-xs py-1.5">Reset</button><div class="ml-auto flex items-center gap-3 text-xs text-gray-500"><span class="font-medium text-gray-300">${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.total) != null ? _b : 0)}</span> orders </div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 flex items-center justify-center"><div class="skeleton h-4 w-48 rounded"></div></div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm"> \u26A0 Failed to load orders \u2014 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(rows),
          exportable: "",
          "per-page": perPage,
          "external-total": (_d = (_c = unref(data)) == null ? void 0 : _c.total) != null ? _d : 0,
          "search-placeholder": "",
          onRowClick: (r) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/credit-sales/${r.id}`)
        }, {
          "cell-order_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/90 font-semibold"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/90 font-semibold" }, toDisplayString(value), 1)
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
              _push2(`<span class="font-semibold text-gray-200 font-mono text-xs"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-semibold text-gray-200 font-mono text-xs" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-balance_due": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass([Number(value) > 0 ? "text-red-400" : "text-emerald-400", "font-mono text-xs"])}"${_scopeId}> \u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: ["font-mono text-xs", Number(value) > 0 ? "text-red-400" : "text-emerald-400"]
                }, " \u09F3" + toDisplayString(Number(value).toLocaleString()), 3)
              ];
            }
          }),
          "cell-priority": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass([
                "text-xs font-medium",
                value === "urgent" ? "text-red-400" : value === "high" ? "text-orange-400" : "text-gray-500"
              ])}"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: [
                    "text-xs font-medium",
                    value === "urgent" ? "text-red-400" : value === "high" ? "text-orange-400" : "text-gray-500"
                  ]
                }, toDisplayString(value), 3)
              ];
            }
          }),
          "cell-hold": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (row.production_hold_active || row.dispatch_hold) {
                _push2(`<div class="flex flex-col gap-0.5 min-w-[140px]"${_scopeId}>`);
                if (row.production_hold_active) {
                  _push2(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit bg-red-500/12 text-red-400 border border-red-500/25"${_scopeId}> \u26D4 Production Hold </span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (row.dispatch_hold && !row.dispatch_cleared) {
                  _push2(`<span class="${ssrRenderClass([row.condition_met ? "bg-emerald-500/12 text-emerald-400 border border-emerald-500/25" : "bg-amber-500/12 text-amber-400 border border-amber-500/25", "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit"])}"${_scopeId}>${ssrInterpolate(row.condition_met ? "\u2713 Condition Met" : "\u{1F6AB} Payment Hold")}</span>`);
                } else if (row.dispatch_hold && row.dispatch_cleared) {
                  _push2(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit bg-sky-500/12 text-sky-400 border border-sky-500/25"${_scopeId}> \u{1F7E2} Cleared </span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (row.dispatch_hold) {
                  _push2(`<span class="text-[10px] text-gray-600 pl-0.5"${_scopeId}>${ssrInterpolate(conditionLabel(row))}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                _push2(`<span class="text-gray-700 text-xs"${_scopeId}>\u2014</span>`);
              }
            } else {
              return [
                row.production_hold_active || row.dispatch_hold ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "flex flex-col gap-0.5 min-w-[140px]"
                }, [
                  row.production_hold_active ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit bg-red-500/12 text-red-400 border border-red-500/25"
                  }, " \u26D4 Production Hold ")) : createCommentVNode("", true),
                  row.dispatch_hold && !row.dispatch_cleared ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: ["inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit", row.condition_met ? "bg-emerald-500/12 text-emerald-400 border border-emerald-500/25" : "bg-amber-500/12 text-amber-400 border border-amber-500/25"]
                  }, toDisplayString(row.condition_met ? "\u2713 Condition Met" : "\u{1F6AB} Payment Hold"), 3)) : row.dispatch_hold && row.dispatch_cleared ? (openBlock(), createBlock("span", {
                    key: 2,
                    class: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit bg-sky-500/12 text-sky-400 border border-sky-500/25"
                  }, " \u{1F7E2} Cleared ")) : createCommentVNode("", true),
                  row.dispatch_hold ? (openBlock(), createBlock("span", {
                    key: 3,
                    class: "text-[10px] text-gray-600 pl-0.5"
                  }, toDisplayString(conditionLabel(row)), 1)) : createCommentVNode("", true)
                ])) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "text-gray-700 text-xs"
                }, "\u2014"))
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/credit-sales/${row.id}`,
                class: "btn-ghost text-xs py-1 px-2.5"
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
                  class: "btn-ghost text-xs py-1 px-2.5"
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
      }
      if (((_f = (_e = unref(data)) == null ? void 0 : _e.total) != null ? _f : 0) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(((_h = (_g = unref(data)) == null ? void 0 : _g.total) != null ? _h : 0) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(((_j = (_i = unref(data)) == null ? void 0 : _i.total) != null ? _j : 0) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/all.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=all-BrqaNtd1.mjs.map
