import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-Bt-D0WF_.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dispatch",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const { success, error: toastError } = useToast();
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/dispatch",
      "$qng65-w87I"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const orders = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const onBoard = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.onBoard) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const urgentCount = computed(() => orders.value.filter((o) => o.priority === "urgent").length);
    const tableRows = computed(() => orders.value.map((o) => {
      var _a;
      return {
        id: o.id,
        order_number: o.order_number,
        customer: o.customer_name,
        address: o.delivery_address || "\u2014",
        weight: o.total_weight_kg,
        priority: o.priority,
        status: o.status,
        dispatch_hold: !!o.dispatch_hold,
        gate_met: !!o.gate_met,
        gate_auto: !!o.gate_auto,
        gate_label: o.dispatch_hold ? `${((_a = o.gate_condition) != null ? _a : "manual").replace(/_/g, " ")}${o.gate_amount ? ` \u09F3${Number(o.gate_amount).toLocaleString()}` : ""}` : ""
      };
    }));
    const onBoardRows = computed(() => onBoard.value.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer: o.customer_name,
      address: o.delivery_address || "\u2014",
      weight: o.total_weight_kg,
      status: o.status
    })));
    const cols = [
      { key: "order_number", label: "Order #", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "address", label: "Delivery Address" },
      { key: "weight", label: "Weight" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" }
    ];
    const onBoardCols = [
      { key: "order_number", label: "Order #", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "address", label: "Delivery Address" },
      { key: "weight", label: "Weight" },
      { key: "status", label: "Status" }
    ];
    const acting = ref(null);
    async function dispatch(row) {
      var _a, _b;
      acting.value = row.id;
      try {
        await $fetch(`/api/credit-sales/${row.id}/workflow`, {
          method: "POST",
          body: { to_status: "goods_on_board", comments: "Goods on board \u2014 from dispatch queue" }
        });
        success(`Order ${row.order_number} \u2014 goods on board, invoice posted`);
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to mark goods on board");
      } finally {
        acting.value = null;
      }
    }
    async function markShipped(row) {
      var _a, _b;
      acting.value = row.id;
      try {
        await $fetch(`/api/credit-sales/${row.id}/workflow`, {
          method: "POST",
          body: { to_status: "shipped", comments: "Truck departed \u2014 from dispatch queue" }
        });
        success(`Order ${row.order_number} marked shipped`);
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to mark shipped");
      } finally {
        acting.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Dispatch Queue",
        subtitle: "Assign vehicles and dispatch ready orders",
        breadcrumb: ["Credit Sales", "Dispatch"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Ready to Dispatch</p><p class="text-2xl font-bold text-orange-400">${ssrInterpolate((_a = unref(stats).ready_count) != null ? _a : unref(orders).length)}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Goods on Board Today</p><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate((_b = unref(stats).dispatched_today) != null ? _b : 0)}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Load Today</p><p class="text-2xl font-bold text-gold-400">${ssrInterpolate((((_c = unref(stats).dispatched_kg_today) != null ? _c : 0) / 1e3).toFixed(1))}MT</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Urgent Orders</p><p class="text-2xl font-bold text-red-400">${ssrInterpolate(unref(urgentCount))}</p></div></div><div class="glass-card p-5"><h2 class="section-title mb-4">Ready for Dispatch <span class="text-xs font-normal text-gray-600">\u2014 mark Goods on Board (posts invoice)</span></h2>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(tableRows),
          "per-page": 15,
          "search-placeholder": "Search orders\u2026"
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
          "cell-priority": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
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
          "cell-weight": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gray-300"${_scopeId}>${ssrInterpolate(value ? (Number(value) / 1e3).toFixed(2) + " MT" : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gray-300" }, toDisplayString(value ? (Number(value) / 1e3).toFixed(2) + " MT" : "\u2014"), 1)
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center gap-2 justify-end"${_scopeId}>`);
              if (row.dispatch_hold) {
                _push2(`<span class="${ssrRenderClass([row.gate_met ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25" : "bg-amber-500/12 text-amber-400 border-amber-500/25", "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}"${ssrRenderAttr("title", row.gate_label)}${_scopeId}>${ssrInterpolate(row.gate_met ? row.gate_auto ? "\u2713 auto-clears" : "\u2713 met \u2014 needs clearance" : "\u{1F6AB} payment hold")}</span>`);
              } else {
                _push2(`<!---->`);
              }
              if (row.dispatch_hold && !(row.gate_met && row.gate_auto)) {
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: "/credit-sales/payment-watch",
                  class: "text-[10px] text-sky-400 hover:text-sky-300 underline shrink-0"
                }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`watch`);
                    } else {
                      return [
                        createTextVNode("watch")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canDo("credit_sales", "dispatch", "mark_dispatched")) {
                _push2(`<button class="${ssrRenderClass([row.dispatch_hold && !(row.gate_met && row.gate_auto) ? "opacity-40" : "", "btn-gold text-xs py-1 px-2.5"])}"${ssrIncludeBooleanAttr(unref(acting) === row.id) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(acting) === row.id ? "\u2026" : "Goods on Board")}</button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-2 justify-end" }, [
                  row.dispatch_hold ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: ["px-2 py-0.5 rounded-full text-[10px] font-semibold border", row.gate_met ? "bg-emerald-500/12 text-emerald-400 border-emerald-500/25" : "bg-amber-500/12 text-amber-400 border-amber-500/25"],
                    title: row.gate_label
                  }, toDisplayString(row.gate_met ? row.gate_auto ? "\u2713 auto-clears" : "\u2713 met \u2014 needs clearance" : "\u{1F6AB} payment hold"), 11, ["title"])) : createCommentVNode("", true),
                  row.dispatch_hold && !(row.gate_met && row.gate_auto) ? (openBlock(), createBlock(_component_NuxtLink, {
                    key: 1,
                    to: "/credit-sales/payment-watch",
                    class: "text-[10px] text-sky-400 hover:text-sky-300 underline shrink-0"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("watch")
                    ]),
                    _: 1
                  })) : createCommentVNode("", true),
                  unref(perms).canDo("credit_sales", "dispatch", "mark_dispatched") ? (openBlock(), createBlock("button", {
                    key: 2,
                    class: ["btn-gold text-xs py-1 px-2.5", row.dispatch_hold && !(row.gate_met && row.gate_auto) ? "opacity-40" : ""],
                    onClick: ($event) => dispatch(row),
                    disabled: unref(acting) === row.id
                  }, toDisplayString(unref(acting) === row.id ? "\u2026" : "Goods on Board"), 11, ["onClick", "disabled"])) : createCommentVNode("", true)
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(onBoardRows).length) {
          _push(`<div class="glass-card p-5"><h2 class="section-title mb-4">Awaiting Departure <span class="text-xs font-normal text-gray-600">\u2014 invoice already posted, mark once the truck leaves</span></h2>`);
          _push(ssrRenderComponent(_component_UiDataTable, {
            columns: onBoardCols,
            rows: unref(onBoardRows),
            "per-page": 15,
            "search-placeholder": "Search orders\u2026"
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
            "cell-weight": withCtx(({ value }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="font-mono text-xs text-gray-300"${_scopeId}>${ssrInterpolate(value ? (Number(value) / 1e3).toFixed(2) + " MT" : "\u2014")}</span>`);
              } else {
                return [
                  createVNode("span", { class: "font-mono text-xs text-gray-300" }, toDisplayString(value ? (Number(value) / 1e3).toFixed(2) + " MT" : "\u2014"), 1)
                ];
              }
            }),
            actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (unref(perms).canDo("credit_sales", "dispatch", "mark_shipped")) {
                  _push2(`<button class="btn-gold text-xs py-1 px-2.5"${ssrIncludeBooleanAttr(unref(acting) === row.id) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(acting) === row.id ? "\u2026" : "\u{1F69B} Mark Shipped")}</button>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  unref(perms).canDo("credit_sales", "dispatch", "mark_shipped") ? (openBlock(), createBlock("button", {
                    key: 0,
                    class: "btn-gold text-xs py-1 px-2.5",
                    onClick: ($event) => markShipped(row),
                    disabled: unref(acting) === row.id
                  }, toDisplayString(unref(acting) === row.id ? "\u2026" : "\u{1F69B} Mark Shipped"), 9, ["onClick", "disabled"])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/dispatch.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dispatch-BIp1ySyR.mjs.map
