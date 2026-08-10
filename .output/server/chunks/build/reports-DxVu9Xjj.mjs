import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reports",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const range = ref("daily");
    const dateFrom = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const dateTo = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const branchId = ref("");
    const ranges = [
      { id: "daily", label: "Today" },
      { id: "weekly", label: "Last 7 Days" },
      { id: "monthly", label: "This Month" },
      { id: "custom", label: "Custom" }
    ];
    const { data: branchData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$fhwjP8W5Ay"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const branches = computed(() => {
      var _a, _b;
      return ((_b = (_a = branchData.value) == null ? void 0 : _a.branches) != null ? _b : []).filter((b) => b.status === "active");
    });
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/pos/reports",
      {
        query: computed(() => ({
          range: range.value,
          ...range.value === "custom" ? { date_from: dateFrom.value, date_to: dateTo.value } : {},
          ...branchId.value ? { branch_id: branchId.value } : {}
        }))
      },
      "$1vdsN_OE8D"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const summary = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.summary) != null ? _b : {};
    });
    const orders = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    function exportCsv() {
      const rows = [
        ["Order #", "Date", "Branch", "Customer", "Method", "Total", "Cash", "Credit", "Status"],
        ...orders.value.map((o) => [o.order_number, String(o.order_date).slice(0, 19), o.branch_name, o.customer_name, o.payment_method, o.total_amount, o.cash_amount, o.credit_amount, o.payment_status])
      ];
      const csv = rows.map((r) => r.map((v) => `"${String(v != null ? v : "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const a = (void 0).createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = `pos-report-${dateFrom.value}-${dateTo.value}.csv`;
      a.click();
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "POS Reports",
        subtitle: "Daily / weekly / monthly / custom-range sales",
        breadcrumb: ["POS", "Reports"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u2B07 CSV</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: exportCsv,
                class: "btn-ghost text-xs"
              }, "\u2B07 CSV")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap items-end gap-3"><div class="flex gap-2"><!--[-->`);
      ssrRenderList(ranges, (r) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
          unref(range) === r.id ? "bg-gold-500/15 border-gold-500/30 text-gold-400" : "border-white/[0.07] text-gray-500 hover:text-gray-300"
        ])}">${ssrInterpolate(r.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(range) === "custom") {
        _push(`<!--[--><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="input-glass text-xs py-1.5"><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="input-glass text-xs py-1.5"><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-1"><select class="input-glass text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(branchId)) ? ssrLooseContain(unref(branchId), "") : ssrLooseEqual(unref(branchId), "")) ? " selected" : ""}>All Branches</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(branchId)) ? ssrLooseContain(unref(branchId), b.id) : ssrLooseEqual(unref(branchId), b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-3"><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Orders</p><p class="text-lg font-bold text-gray-200 mt-1">${ssrInterpolate((_a = unref(summary).order_count) != null ? _a : 0)}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Revenue</p><p class="text-lg font-bold text-gold-400 mt-1">\u09F3${ssrInterpolate(Number((_b = unref(summary).total_revenue) != null ? _b : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Cash Collected</p><p class="text-lg font-bold text-emerald-400 mt-1">\u09F3${ssrInterpolate(Number((_c = unref(summary).cash_total) != null ? _c : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">On Credit</p><p class="text-lg font-bold text-orange-400 mt-1">\u09F3${ssrInterpolate(Number((_d = unref(summary).credit_total) != null ? _d : 0).toLocaleString())}</p></div></div><div class="glass-card p-5"><h3 class="section-title mb-3">Orders</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Order #</th><th class="text-left pr-3">Date</th><th class="text-left pr-3">Branch</th><th class="text-left pr-3">Customer</th><th class="text-left pr-3">Method</th><th class="text-right pr-3">Total</th><th class="text-left pr-3">Status</th><th></th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(orders), (o) => {
        _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 pr-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/pos/${o.id}`,
          class: "font-mono text-gold-400 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(o.order_number)}`);
            } else {
              return [
                createTextVNode(toDisplayString(o.order_number), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td><td class="pr-3 text-gray-400">${ssrInterpolate(String(o.order_date).slice(0, 16).replace("T", " "))}</td><td class="pr-3 text-gray-400">${ssrInterpolate(o.branch_name)}</td><td class="pr-3 text-gray-200">${ssrInterpolate(o.customer_name)}</td><td class="pr-3 text-gray-400">${ssrInterpolate(o.payment_method)}</td><td class="pr-3 text-right font-mono text-gray-200">\u09F3${ssrInterpolate(Number(o.total_amount).toLocaleString())}</td><td class="pr-3"><span class="${ssrRenderClass([
          "px-2 py-0.5 rounded-full text-[10px] font-semibold",
          o.payment_status === "Paid" ? "bg-emerald-500/15 text-emerald-400" : o.payment_status === "Partial" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"
        ])}">${ssrInterpolate(o.payment_status)}</span></td><td class="text-right">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/pos/${o.id}`,
          class: "btn-ghost text-[10px] py-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Open`);
            } else {
              return [
                createTextVNode("Open")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(orders).length) {
        _push(`<tr><td colspan="8" class="py-6 text-center text-gray-600">No orders in this period.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/reports.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reports-DxVu9Xjj.mjs.map
