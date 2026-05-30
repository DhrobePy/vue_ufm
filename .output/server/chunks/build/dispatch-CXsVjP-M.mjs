import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './DataTable-CCNVWvkK.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dispatch",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
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
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const urgentCount = computed(() => orders.value.filter((o) => o.priority === "urgent").length);
    const tableRows = computed(() => orders.value.map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer: o.customer_name,
      address: o.delivery_address || "\u2014",
      weight: o.total_weight_kg,
      priority: o.priority,
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
    const acting = ref(null);
    async function dispatch(row) {
      var _a, _b;
      acting.value = row.id;
      try {
        await $fetch(`/api/credit-sales/${row.id}/workflow`, {
          method: "POST",
          body: { to_status: "dispatched", comments: "Dispatched" }
        });
        success(`Order ${row.order_number} dispatched`);
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to dispatch order");
      } finally {
        acting.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
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
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Ready to Dispatch</p><p class="text-2xl font-bold text-orange-400">${ssrInterpolate((_a = unref(stats).ready_count) != null ? _a : unref(orders).length)}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Dispatched Today</p><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate((_b = unref(stats).dispatched_today) != null ? _b : 0)}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Load Today</p><p class="text-2xl font-bold text-gold-400">${ssrInterpolate((((_c = unref(stats).dispatched_kg_today) != null ? _c : 0) / 1e3).toFixed(1))}MT</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Urgent Orders</p><p class="text-2xl font-bold text-red-400">${ssrInterpolate(unref(urgentCount))}</p></div></div><div class="glass-card p-5"><h2 class="section-title mb-4">Ready for Dispatch</h2>`);
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
              _push2(`<button class="btn-gold text-xs py-1 px-2.5"${ssrIncludeBooleanAttr(unref(acting) === row.id) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(acting) === row.id ? "\u2026" : "Dispatch")}</button>`);
            } else {
              return [
                createVNode("button", {
                  class: "btn-gold text-xs py-1 px-2.5",
                  onClick: ($event) => dispatch(row),
                  disabled: unref(acting) === row.id
                }, toDisplayString(unref(acting) === row.id ? "\u2026" : "Dispatch"), 9, ["onClick", "disabled"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><!--]-->`);
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
//# sourceMappingURL=dispatch-CXsVjP-M.mjs.map
