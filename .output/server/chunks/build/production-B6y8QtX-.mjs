import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './DataTable-CCNVWvkK.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderStyle } from 'vue/server-renderer';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "production",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { success, error: toastError } = useToast();
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/production-queue",
      "$58w70CiT-E"
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
    const tableRows = computed(() => orders.value.map((o) => {
      var _a, _b, _c;
      return {
        id: o.id,
        orderNo: o.orderNo,
        customer: o.customer,
        product: ((_a = o.items) == null ? void 0 : _a.map((i) => i.product).filter(Boolean).join(", ")) || "\u2014",
        qty: ((_b = o.items) == null ? void 0 : _b.reduce((s, i) => s + Number(i.qty || 0), 0).toFixed(0)) + " bags",
        progress: (_c = o.progress) != null ? _c : 0,
        priority: o.priority,
        status: o.status
      };
    }));
    const cols = [
      { key: "orderNo", label: "Order #", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "product", label: "Product" },
      { key: "qty", label: "Qty" },
      { key: "progress", label: "Progress" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" }
    ];
    const acting = ref(null);
    async function markReady(row) {
      var _a, _b;
      acting.value = row.id;
      try {
        await $fetch(`/api/credit-sales/${row.id}/workflow`, {
          method: "POST",
          body: { to_status: "ready_to_ship", comments: "Production complete \u2014 ready to ship" }
        });
        success(`Order ${row.orderNo} marked as ready to ship`);
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to update order status");
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
        title: "Production Queue",
        subtitle: "Manage flour production for approved orders",
        breadcrumb: ["Credit Sales", "Production"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">In Production</p><p class="text-2xl font-bold text-blue-400">${ssrInterpolate((_a = unref(stats).in_production) != null ? _a : unref(orders).length)}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Ready Today</p><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate((_b = unref(stats).ready_today) != null ? _b : 0)}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Weight</p><p class="text-2xl font-bold text-gold-400">${ssrInterpolate((((_c = unref(stats).total_weight_kg) != null ? _c : 0) / 1e3).toFixed(1))}MT</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Urgent Orders</p><p class="text-2xl font-bold text-red-400">${ssrInterpolate(unref(urgentCount))}</p></div></div><div class="glass-card p-5"><h2 class="section-title mb-4">Active Production Orders</h2>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(tableRows),
          "per-page": 15,
          "search-placeholder": "Search\u2026"
        }, {
          "cell-orderNo": withCtx(({ value }, _push2, _parent2, _scopeId) => {
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
          "cell-priority": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          "cell-progress": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center gap-2"${_scopeId}><div class="flex-1 h-1.5 rounded-full bg-white/[0.06]"${_scopeId}><div class="h-full rounded-full bg-blue-400" style="${ssrRenderStyle(`width:${value}%`)}"${_scopeId}></div></div><span class="text-xs text-gray-400 w-8"${_scopeId}>${ssrInterpolate(value)}%</span></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-2" }, [
                  createVNode("div", { class: "flex-1 h-1.5 rounded-full bg-white/[0.06]" }, [
                    createVNode("div", {
                      class: "h-full rounded-full bg-blue-400",
                      style: `width:${value}%`
                    }, null, 4)
                  ]),
                  createVNode("span", { class: "text-xs text-gray-400 w-8" }, toDisplayString(value) + "%", 1)
                ])
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<button class="btn-gold text-xs py-1 px-2.5"${ssrIncludeBooleanAttr(unref(acting) === row.id) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(acting) === row.id ? "\u2026" : "Mark Ready")}</button>`);
            } else {
              return [
                createVNode("button", {
                  class: "btn-gold text-xs py-1 px-2.5",
                  onClick: ($event) => markReady(row),
                  disabled: unref(acting) === row.id
                }, toDisplayString(unref(acting) === row.id ? "\u2026" : "Mark Ready"), 9, ["onClick", "disabled"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/production.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=production-B6y8QtX-.mjs.map
