import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './DataTable-CCNVWvkK.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import './SidebarIcon-oZVkzwjh.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const weekStart = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
    const dateRanges = ["Today", "This Week", "This Month", "Custom"];
    const dateRange = ref("This Week");
    const fromDate = ref(weekStart);
    const toDate = ref(today);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/sales/dashboard",
      {
        query: computed(() => ({
          from: fromDate.value,
          to: toDate.value
        }))
      },
      "$wPSKB2qEvZ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.transactions) != null ? _b : [];
    });
    const dailyBars = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.dailyBars) != null ? _b : [];
    });
    const productBreakdown = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.productBreakdown) != null ? _b : [];
    });
    function fmtLakh(n) {
      if (n >= 1e7) return (n / 1e7).toFixed(2) + "Cr";
      if (n >= 1e5) return (n / 1e5).toFixed(1) + "L";
      if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
      return n.toLocaleString();
    }
    const cols = [
      { key: "receipt_number", label: "Receipt #", sortable: true },
      { key: "sale_date", label: "Date", sortable: true },
      { key: "customer_name", label: "Customer", sortable: true },
      { key: "product_name", label: "Product" },
      { key: "quantity", label: "Qty" },
      { key: "total_amount", label: "Amount", sortable: true },
      { key: "payment_method", label: "Payment" },
      { key: "cashier_name", label: "Cashier" }
    ];
    function exportCsv() {
      const r = rows.value;
      if (!r.length) return;
      const headers = ["Receipt #", "Date", "Customer", "Product", "Qty", "Amount", "Payment", "Cashier"];
      const lines = r.map((s) => [
        s.receipt_number,
        String(s.sale_date).slice(0, 19),
        s.customer_name,
        s.product_name,
        s.quantity,
        s.total_amount,
        s.payment_method,
        s.cashier_name
      ].join(","));
      const csv = [headers.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = "sales-report.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Sales Report",
        subtitle: "Cash & POS sales \xB7 daily summary \xB7 branch breakdown",
        breadcrumb: ["Sales"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u{1F4CA} Export</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: exportCsv,
                class: "btn-ghost text-xs"
              }, "\u{1F4CA} Export")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4"><div class="flex flex-wrap items-center gap-4"><div class="flex gap-2"><!--[-->`);
      ssrRenderList(dateRanges, (r) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
          unref(dateRange) === r ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300"
        ])}">${ssrInterpolate(r)}</button>`);
      });
      _push(`<!--]--></div><div class="flex items-center gap-2 text-xs text-gray-600"><input type="date"${ssrRenderAttr("value", unref(fromDate))} class="field-input text-xs py-1.5 w-36"><span>\u2014</span><input type="date"${ssrRenderAttr("value", unref(toDate))} class="field-input text-xs py-1.5 w-36"></div></div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`);
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Total Sales",
          value: "\u09F3" + fmtLakh((_a = unref(stats).total_sales) != null ? _a : 0),
          trend: "period total",
          "trend-up": "",
          icon: "chart",
          color: "gold"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Cash / Card",
          value: "\u09F3" + fmtLakh((_b = unref(stats).cash_sales) != null ? _b : 0),
          trend: "direct sales",
          "trend-up": "",
          icon: "register",
          color: "teal"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Transactions",
          value: String((_c = unref(stats).transaction_count) != null ? _c : 0),
          trend: "receipts",
          "trend-up": "",
          icon: "receipt",
          color: "blue"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Avg Daily",
          value: "\u09F3" + fmtLakh((_d = unref(stats).avg_daily) != null ? _d : 0),
          trend: "per day",
          "trend-up": "",
          icon: "money",
          color: "purple"
        }, null, _parent));
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-5"><h2 class="section-title mb-4">Daily Sales Trend</h2>`);
        if (unref(dailyBars).length) {
          _push(`<div class="flex items-end gap-1.5 h-40"><!--[-->`);
          ssrRenderList(unref(dailyBars), (bar, i) => {
            _push(`<div class="flex-1 rounded-t-lg transition-all duration-300 cursor-pointer hover:opacity-80 relative group" style="${ssrRenderStyle(`height:${Math.max(bar.pct, 4)}%;background:rgba(245,158,11,${0.2 + bar.pct / 200})`)}"><div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-gray-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"> \u09F3${ssrInterpolate((bar.value / 1e3).toFixed(0))}K </div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="h-40 flex items-center justify-center text-xs text-gray-600">No data for this period</div>`);
        }
        if (unref(dailyBars).length) {
          _push(`<div class="flex gap-1.5 mt-2"><!--[-->`);
          ssrRenderList(unref(dailyBars), (bar, i) => {
            _push(`<div class="flex-1 text-center text-[9px] text-gray-700">${ssrInterpolate(bar.label)}</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5"><h2 class="section-title mb-4">By Product</h2><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(productBreakdown), (p) => {
          _push(`<div class="space-y-1"><div class="flex justify-between text-xs"><span class="text-gray-400 truncate pr-2">${ssrInterpolate(p.name)}</span><span class="text-gray-300 font-mono shrink-0">\u09F3${ssrInterpolate((p.amount / 1e3).toFixed(0))}K</span></div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full" style="${ssrRenderStyle(`width:${p.pct}%;background:rgba(245,158,11,0.5)`)}"></div></div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(productBreakdown).length) {
          _push(`<div class="text-xs text-center text-gray-600 py-4">No data</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="glass-card p-5"><h2 class="section-title mb-4">Sales Transactions</h2>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(rows),
          "per-page": 15,
          exportable: "",
          "search-placeholder": "Search transactions\u2026"
        }, {
          "cell-receipt_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-total_amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs font-bold text-emerald-400"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs font-bold text-emerald-400" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-payment_method": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] capitalize"${_scopeId}>${ssrInterpolate(String(value).replace("_", " "))}</span>`);
            } else {
              return [
                createVNode("span", { class: "badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] capitalize" }, toDisplayString(String(value).replace("_", " ")), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/sales/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BnYZnG6e.mjs.map
