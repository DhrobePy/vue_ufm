import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, ref, withAsyncContext, watch, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as usePrint } from './usePrint-B798zm70.mjs';
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
  __name: "statement",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { printElement } = usePrint();
    const activeType = ref("pl");
    const period = ref("may26");
    const statementTypes = [
      { id: "pl", label: "Profit & Loss" },
      { id: "bs", label: "Balance Sheet" },
      { id: "trial", label: "Trial Balance" }
    ];
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/accounts/statements?period=${period.value}`,
      "$_gsU0eImni"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(period, () => refresh());
    const plData = computed(() => {
      var _a;
      const pl = (_a = data.value) == null ? void 0 : _a.pl;
      return pl != null ? pl : {
        revenue: [],
        totalRevenue: 0,
        cogs: [],
        grossProfit: 0,
        opex: [],
        ebit: 0,
        finance: [],
        netProfit: 0
      };
    });
    const bsData = computed(() => {
      var _a;
      const bs = (_a = data.value) == null ? void 0 : _a.bs;
      return bs != null ? bs : {
        currentAssets: [],
        totalCurrentAssets: 0,
        fixedAssets: [],
        totalFixedAssets: 0,
        totalAssets: 0,
        currentLiabilities: [],
        longTermLiabilities: [],
        equity: []
      };
    });
    const trialBalance = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.trialBalance) != null ? _b : [];
    });
    function printStatement() {
      printElement("statement-print", "Financial Statement \u2014 Ujjal FMC");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Financial Statements",
        subtitle: "Profit & Loss, Balance Sheet and Trial Balance",
        breadcrumb: ["Accounts", "Statement"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u{1F5A8} Print</button><button class="btn-gold text-xs"${_scopeId}>\u2B07 Export</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: printStatement,
                class: "btn-ghost text-xs"
              }, "\u{1F5A8} Print"),
              createVNode("button", { class: "btn-gold text-xs" }, "\u2B07 Export")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex gap-2 flex-wrap"><!--[-->`);
      ssrRenderList(statementTypes, (t) => {
        _push(`<button class="${ssrRenderClass([
          "text-sm px-4 py-2 rounded-xl border transition-all",
          unref(activeType) === t.id ? "bg-gold-500/10 border-gold-500/40 text-gold-400" : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200"
        ])}">${ssrInterpolate(t.label)}</button>`);
      });
      _push(`<!--]--><div class="ml-auto flex items-center gap-2"><select class="input-glass text-xs py-1.5 w-auto"><option value="may26"${ssrIncludeBooleanAttr(Array.isArray(unref(period)) ? ssrLooseContain(unref(period), "may26") : ssrLooseEqual(unref(period), "may26")) ? " selected" : ""}>May 2026</option><option value="apr26"${ssrIncludeBooleanAttr(Array.isArray(unref(period)) ? ssrLooseContain(unref(period), "apr26") : ssrLooseEqual(unref(period), "apr26")) ? " selected" : ""}>April 2026</option><option value="q1fy26"${ssrIncludeBooleanAttr(Array.isArray(unref(period)) ? ssrLooseContain(unref(period), "q1fy26") : ssrLooseEqual(unref(period), "q1fy26")) ? " selected" : ""}>Q1 FY 2025-26</option><option value="fy26"${ssrIncludeBooleanAttr(Array.isArray(unref(period)) ? ssrLooseContain(unref(period), "fy26") : ssrLooseEqual(unref(period), "fy26")) ? " selected" : ""}>Full FY 2025-26</option></select></div></div>`);
      if (unref(activeType) === "pl") {
        _push(`<div id="statement-print" class="glass-card p-6"><div class="text-center mb-6"><h2 class="text-lg font-bold text-gray-100">Profit &amp; Loss Statement</h2><p class="text-xs text-gray-500 mt-1">Ujjal Flour Mills Company \xB7 For the period ending 31 May 2026</p></div><div class="max-w-lg mx-auto space-y-6"><div><h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Revenue</h3><!--[-->`);
        ssrRenderList(unref(plData).revenue, (item) => {
          _push(`<div class="flex justify-between py-1.5 text-sm"><span class="text-gray-400 pl-4">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(item.amount.toLocaleString())}</span></div>`);
        });
        _push(`<!--]--><div class="flex justify-between py-2 border-t border-white/[0.06] mt-1"><span class="font-bold text-gray-200">Total Revenue</span><span class="font-bold font-mono text-emerald-400">\u09F3${ssrInterpolate(unref(plData).totalRevenue.toLocaleString())}</span></div></div><div><h3 class="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Cost of Goods Sold</h3><!--[-->`);
        ssrRenderList(unref(plData).cogs, (item) => {
          _push(`<div class="flex justify-between py-1.5 text-sm"><span class="text-gray-400 pl-4">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(item.amount.toLocaleString())}</span></div>`);
        });
        _push(`<!--]--><div class="flex justify-between py-2 border-t border-white/[0.06] mt-1"><span class="font-bold text-gray-200">Gross Profit</span><span class="font-bold font-mono text-gold-400">\u09F3${ssrInterpolate(unref(plData).grossProfit.toLocaleString())}</span></div><p class="text-right text-xs text-gray-600">Margin: ${ssrInterpolate(unref(plData).totalRevenue ? Math.round(unref(plData).grossProfit / unref(plData).totalRevenue * 100) : 0)}%</p></div><div><h3 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Operating Expenses</h3><!--[-->`);
        ssrRenderList(unref(plData).opex, (item) => {
          _push(`<div class="flex justify-between py-1.5 text-sm"><span class="text-gray-400 pl-4">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(item.amount.toLocaleString())}</span></div>`);
        });
        _push(`<!--]--><div class="flex justify-between py-2 border-t border-white/[0.06] mt-1"><span class="font-bold text-gray-200">Operating Profit (EBIT)</span><span class="font-bold font-mono text-emerald-400">\u09F3${ssrInterpolate(unref(plData).ebit.toLocaleString())}</span></div></div><div><!--[-->`);
        ssrRenderList(unref(plData).finance, (item) => {
          _push(`<div class="flex justify-between py-1.5 text-sm"><span class="text-gray-400 pl-4">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">(\u09F3${ssrInterpolate(item.amount.toLocaleString())})</span></div>`);
        });
        _push(`<!--]--></div><div class="border-t-2 border-gold-500/30 pt-4"><div class="flex justify-between"><span class="text-lg font-bold text-gray-100">Net Profit</span><span class="text-xl font-bold font-mono text-gold-400">\u09F3${ssrInterpolate(unref(plData).netProfit.toLocaleString())}</span></div><p class="text-right text-xs text-gray-500 mt-1">Net margin: ${ssrInterpolate(unref(plData).totalRevenue ? Math.round(unref(plData).netProfit / unref(plData).totalRevenue * 100) : 0)}%</p></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeType) === "bs") {
        _push(`<div class="glass-card p-6"><div class="text-center mb-6"><h2 class="text-lg font-bold text-gray-100">Balance Sheet</h2><p class="text-xs text-gray-500 mt-1">Ujjal Flour Mills Company \xB7 As at 31 May 2026</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div class="space-y-4"><h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Assets</h3><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Current Assets</p><!--[-->`);
        ssrRenderList(unref(bsData).currentAssets, (item) => {
          _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(item.amount.toLocaleString())}</span></div>`);
        });
        _push(`<!--]--><div class="flex justify-between py-1.5 border-t border-white/[0.06] mt-1 text-sm font-semibold"><span class="text-gray-300">Total Current Assets</span><span class="font-mono text-emerald-400">${ssrInterpolate(unref(bsData).totalCurrentAssets.toLocaleString())}</span></div></div><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Fixed Assets</p><!--[-->`);
        ssrRenderList(unref(bsData).fixedAssets, (item) => {
          _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(item.amount.toLocaleString())}</span></div>`);
        });
        _push(`<!--]--><div class="flex justify-between py-1.5 border-t border-white/[0.06] mt-1 text-sm font-semibold"><span class="text-gray-300">Total Fixed Assets</span><span class="font-mono text-emerald-400">${ssrInterpolate(unref(bsData).totalFixedAssets.toLocaleString())}</span></div></div><div class="border-t-2 border-white/10 pt-2 flex justify-between font-bold"><span class="text-gray-100">Total Assets</span><span class="font-mono text-gold-400">${ssrInterpolate(unref(bsData).totalAssets.toLocaleString())}</span></div></div><div class="space-y-4"><h3 class="text-xs font-bold text-red-400 uppercase tracking-wider">Liabilities &amp; Equity</h3><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Current Liabilities</p><!--[-->`);
        ssrRenderList(unref(bsData).currentLiabilities, (item) => {
          _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(item.amount.toLocaleString())}</span></div>`);
        });
        _push(`<!--]--></div><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Long-term Liabilities</p><!--[-->`);
        ssrRenderList(unref(bsData).longTermLiabilities, (item) => {
          _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(item.amount.toLocaleString())}</span></div>`);
        });
        _push(`<!--]--></div><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Equity</p><!--[-->`);
        ssrRenderList(unref(bsData).equity, (item) => {
          _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(item.amount.toLocaleString())}</span></div>`);
        });
        _push(`<!--]--></div><div class="border-t-2 border-white/10 pt-2 flex justify-between font-bold"><span class="text-gray-100">Total Liabilities &amp; Equity</span><span class="font-mono text-gold-400">${ssrInterpolate(unref(bsData).totalAssets.toLocaleString())}</span></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeType) === "trial") {
        _push(`<div class="glass-card p-6"><div class="text-center mb-6"><h2 class="text-lg font-bold text-gray-100">Trial Balance</h2><p class="text-xs text-gray-500 mt-1">Ujjal Flour Mills Company \xB7 As at 31 May 2026</p></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Code</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(trialBalance), (row) => {
          _push(`<tr class="hover:bg-white/[0.02]"><td class="py-2 px-3 font-mono text-gray-600">${ssrInterpolate(row.code)}</td><td class="py-2 px-3 text-gray-300">${ssrInterpolate(row.name)}</td><td class="py-2 px-3 text-right font-mono text-red-400">${ssrInterpolate(row.debit ? row.debit.toLocaleString() : "")}</td><td class="py-2 px-3 text-right font-mono text-emerald-400">${ssrInterpolate(row.credit ? row.credit.toLocaleString() : "")}</td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot class="border-t-2 border-white/10"><tr><td colspan="2" class="pt-3 px-3 font-bold text-gray-200">Totals</td><td class="pt-3 px-3 text-right font-bold font-mono text-red-400">${ssrInterpolate(unref(trialBalance).reduce((s, r) => s + (r.debit || 0), 0).toLocaleString())}</td><td class="pt-3 px-3 text-right font-bold font-mono text-emerald-400">${ssrInterpolate(unref(trialBalance).reduce((s, r) => s + (r.credit || 0), 0).toLocaleString())}</td></tr></tfoot></table></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/statement.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=statement-DDKTqucR.mjs.map
