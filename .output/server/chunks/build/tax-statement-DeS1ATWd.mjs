import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, computed, ref, withAsyncContext, watch, reactive, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate } from 'vue/server-renderer';
import { u as usePrint } from './usePrint-B798zm70.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tax-statement",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { printElement } = usePrint();
    useToast();
    const { user: sessionUser } = useUserSession();
    const isAdminUser = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const now = /* @__PURE__ */ new Date();
    const defaultFy = ref(now.getFullYear());
    const { data: settingsData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/settings/tax",
      "$Wkh4kPZQr1"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const fyStartMonth = computed(() => {
      var _a, _b;
      return (_b = (_a = settingsData.value) == null ? void 0 : _a.fiscal_year_start_month) != null ? _b : 7;
    });
    if (settingsData.value) {
      defaultFy.value = now.getMonth() + 1 >= fyStartMonth.value ? now.getFullYear() : now.getFullYear() - 1;
    }
    const selectedFy = ref(defaultFy.value);
    const fyOptions = computed(() => {
      const years = [];
      for (let y = defaultFy.value; y >= defaultFy.value - 4; y--) years.push(y);
      return years;
    });
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/accounts/tax-statement?fy=${selectedFy.value}`,
      "$3QVQQSg_t-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(selectedFy, () => refresh());
    const company = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.company) != null ? _b : {};
    });
    const fiscalYear = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.fiscal_year) != null ? _b : { label: "", from: "", to: "" };
    });
    const pl = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.pl) != null ? _b : { revenue: [], totalRevenue: 0, cogs: [], grossProfit: 0, opex: [], netProfit: 0 };
    });
    const bs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.bs) != null ? _b : {
        currentAssets: [],
        totalCurrentAssets: 0,
        fixedAssets: [],
        totalFixedAssets: 0,
        totalAssets: 0,
        currentLiabilities: [],
        longTermLiabilities: [],
        equity: [],
        totalLiabAndEquity: 0
      };
    });
    const showCompanySettings = ref(false);
    const savingCompany = ref(false);
    const companyForm = reactive({ tin: "", bin: "", legal_name: "", address: "", fiscal_year_start_month: 7 });
    watch(company, (c) => {
      var _a, _b, _c, _d, _e;
      companyForm.tin = (_a = c.tin) != null ? _a : "";
      companyForm.bin = (_b = c.bin) != null ? _b : "";
      companyForm.legal_name = (_c = c.legal_name) != null ? _c : "";
      companyForm.address = (_d = c.address) != null ? _d : "";
      companyForm.fiscal_year_start_month = (_e = c.fiscal_year_start_month) != null ? _e : 7;
    }, { immediate: true });
    function printStatement() {
      printElement("tax-statement-print", `Tax Statement \u2014 ${fiscalYear.value.label}`);
    }
    function exportCsv() {
      const rows = [
        ["NBR Tax Statement DRAFT", fiscalYear.value.label, `${fiscalYear.value.from} to ${fiscalYear.value.to}`],
        [],
        ["Profit & Loss"],
        ["Revenue"],
        ...pl.value.revenue.map((r) => [r.code, r.name, r.amount]),
        ["Total Revenue", "", pl.value.totalRevenue],
        ["Cost of Goods Sold"],
        ...pl.value.cogs.map((r) => [r.code, r.name, r.amount]),
        ["Gross Profit", "", pl.value.grossProfit],
        ["Operating Expenses"],
        ...pl.value.opex.map((r) => [r.code, r.name, r.amount]),
        ["Net Profit", "", pl.value.netProfit],
        [],
        ["Balance Sheet"],
        ["Current Assets"],
        ...bs.value.currentAssets.map((r) => [r.code, r.name, r.amount]),
        ["Fixed Assets"],
        ...bs.value.fixedAssets.map((r) => [r.code, r.name, r.amount]),
        ["Total Assets", "", bs.value.totalAssets],
        ["Current Liabilities"],
        ...bs.value.currentLiabilities.map((r) => [r.code, r.name, r.amount]),
        ["Long-term Liabilities"],
        ...bs.value.longTermLiabilities.map((r) => [r.code, r.name, r.amount]),
        ["Equity"],
        ...bs.value.equity.map((r) => [r.code, r.name, r.amount]),
        ["Total Liabilities & Equity", "", bs.value.totalLiabAndEquity]
      ];
      const csv = rows.map((r) => r.map((v) => `"${String(v != null ? v : "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const a = (void 0).createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = `tax-statement-${fiscalYear.value.from}-${fiscalYear.value.to}.csv`;
      a.click();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "NBR Tax Statement",
        subtitle: "Corporate income tax return DRAFT \u2014 P&L, Balance Sheet, worksheet",
        breadcrumb: ["Accounts", "Tax Statement"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u2B07 CSV</button><button class="btn-gold text-xs"${_scopeId}>\u{1F5A8} Print</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: exportCsv,
                class: "btn-ghost text-xs"
              }, "\u2B07 CSV"),
              createVNode("button", {
                onClick: printStatement,
                class: "btn-gold text-xs"
              }, "\u{1F5A8} Print")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="rounded-xl p-3 text-xs text-amber-300" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.08)", "border": "1px solid rgba(245,158,11,0.25)" })}"> \u26A0 <strong>DRAFT \u2014 not for filing.</strong> This report shows the system&#39;s P&amp;L and Balance Sheet for the selected fiscal year. It does NOT compute disallowed-expense adjustments, depreciation, or final tax liability \u2014 this system has no fixed-asset/depreciation register. Hand this to your accountant as a starting point, not a final return. </div><div class="glass-card p-4 flex flex-wrap items-end gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Fiscal Year</label><select class="input-glass text-xs py-1.5"><!--[-->`);
      ssrRenderList(unref(fyOptions), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedFy)) ? ssrLooseContain(unref(selectedFy), y) : ssrLooseEqual(unref(selectedFy), y)) ? " selected" : ""}>FY ${ssrInterpolate(y)}-${ssrInterpolate(String(y + 1).slice(2))}</option>`);
      });
      _push(`<!--]--></select></div><p class="text-xs text-gray-500 pb-1.5">${ssrInterpolate(unref(fiscalYear).from)} to ${ssrInterpolate(unref(fiscalYear).to)}</p><span class="flex-1"></span>`);
      if (unref(isAdminUser)) {
        _push(`<button class="btn-ghost text-xs py-2">${ssrInterpolate(unref(showCompanySettings) ? "Hide" : "Edit")} Company Info </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(showCompanySettings) && unref(isAdminUser)) {
        _push(`<div class="glass-card p-5 space-y-3"><h3 class="section-title">Company Tax Identity</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Legal Name</label><input${ssrRenderAttr("value", unref(companyForm).legal_name)} class="input-glass text-xs" placeholder="Registered company name"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Address</label><input${ssrRenderAttr("value", unref(companyForm).address)} class="input-glass text-xs" placeholder="Registered address"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">TIN</label><input${ssrRenderAttr("value", unref(companyForm).tin)} class="input-glass text-xs font-mono" placeholder="Taxpayer ID Number"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">BIN</label><input${ssrRenderAttr("value", unref(companyForm).bin)} class="input-glass text-xs font-mono" placeholder="Business ID Number"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Fiscal Year Starts (Month)</label><select class="input-glass text-xs"><!--[-->`);
        ssrRenderList(12, (m) => {
          _push(`<option${ssrRenderAttr("value", m)}${ssrIncludeBooleanAttr(Array.isArray(unref(companyForm).fiscal_year_start_month) ? ssrLooseContain(unref(companyForm).fiscal_year_start_month, m) : ssrLooseEqual(unref(companyForm).fiscal_year_start_month, m)) ? " selected" : ""}>${ssrInterpolate(new Date(2e3, m - 1, 1).toLocaleString("en", { month: "long" }))}</option>`);
        });
        _push(`<!--]--></select></div></div><div class="flex justify-end"><button${ssrIncludeBooleanAttr(unref(savingCompany)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50">${ssrInterpolate(unref(savingCompany) ? "Saving\u2026" : "Save")}</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div id="tax-statement-print" class="glass-card p-6"><div class="text-center mb-6"><h2 class="text-lg font-bold text-gray-100">${ssrInterpolate(unref(company).legal_name || "Ujjal Flour Mills")}</h2><p class="text-xs text-gray-500 mt-1">Profit &amp; Loss Statement \u2014 ${ssrInterpolate(unref(fiscalYear).label)} (${ssrInterpolate(unref(fiscalYear).from)} to ${ssrInterpolate(unref(fiscalYear).to)})</p>`);
      if (unref(company).tin || unref(company).bin) {
        _push(`<p class="text-[11px] text-gray-600 mt-0.5">${ssrInterpolate(unref(company).tin ? `TIN: ${unref(company).tin}` : "")}${ssrInterpolate(unref(company).tin && unref(company).bin ? " \xB7 " : "")}${ssrInterpolate(unref(company).bin ? `BIN: ${unref(company).bin}` : "")}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="max-w-lg mx-auto space-y-6"><div><h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Revenue</h3><!--[-->`);
      ssrRenderList(unref(pl).revenue, (item) => {
        _push(`<div class="flex justify-between py-1.5 text-sm"><span class="text-gray-400 pl-4">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(Number(item.amount).toLocaleString())}</span></div>`);
      });
      _push(`<!--]--><div class="flex justify-between py-2 border-t border-white/[0.06] mt-1"><span class="font-bold text-gray-200">Total Revenue</span><span class="font-bold font-mono text-emerald-400">\u09F3${ssrInterpolate(Number(unref(pl).totalRevenue).toLocaleString())}</span></div></div><div><h3 class="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Cost of Goods Sold</h3><!--[-->`);
      ssrRenderList(unref(pl).cogs, (item) => {
        _push(`<div class="flex justify-between py-1.5 text-sm"><span class="text-gray-400 pl-4">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(Number(item.amount).toLocaleString())}</span></div>`);
      });
      _push(`<!--]--><div class="flex justify-between py-2 border-t border-white/[0.06] mt-1"><span class="font-bold text-gray-200">Gross Profit</span><span class="font-bold font-mono text-gold-400">\u09F3${ssrInterpolate(Number(unref(pl).grossProfit).toLocaleString())}</span></div></div><div><h3 class="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 pb-1 border-b border-white/[0.06]">Operating Expenses</h3><!--[-->`);
      ssrRenderList(unref(pl).opex, (item) => {
        _push(`<div class="flex justify-between py-1.5 text-sm"><span class="text-gray-400 pl-4">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(Number(item.amount).toLocaleString())}</span></div>`);
      });
      _push(`<!--]--></div><div class="border-t-2 border-gold-500/30 pt-4"><div class="flex justify-between"><span class="text-lg font-bold text-gray-100">Net Profit (Accounting)</span><span class="text-xl font-bold font-mono text-gold-400">\u09F3${ssrInterpolate(Number(unref(pl).netProfit).toLocaleString())}</span></div><p class="text-right text-xs text-gray-500 mt-1">Net margin: ${ssrInterpolate(unref(pl).totalRevenue ? Math.round(unref(pl).netProfit / unref(pl).totalRevenue * 100) : 0)}%</p></div></div></div><div class="glass-card p-6"><div class="text-center mb-6"><h2 class="text-lg font-bold text-gray-100">Balance Sheet</h2><p class="text-xs text-gray-500 mt-1">As at ${ssrInterpolate(unref(fiscalYear).to)}</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div class="space-y-4"><h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Assets</h3><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Current Assets</p><!--[-->`);
      ssrRenderList(unref(bs).currentAssets, (item) => {
        _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(Number(item.amount).toLocaleString())}</span></div>`);
      });
      _push(`<!--]--><div class="flex justify-between py-1.5 border-t border-white/[0.06] mt-1 text-sm font-semibold"><span class="text-gray-300">Total Current Assets</span><span class="font-mono text-emerald-400">${ssrInterpolate(Number(unref(bs).totalCurrentAssets).toLocaleString())}</span></div></div><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Fixed Assets</p><!--[-->`);
      ssrRenderList(unref(bs).fixedAssets, (item) => {
        _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(Number(item.amount).toLocaleString())}</span></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(bs).fixedAssets.length) {
        _push(`<p class="text-[11px] text-gray-600 pl-3">No fixed-asset accounts posted \u2014 this system has no depreciation register.</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex justify-between py-1.5 border-t border-white/[0.06] mt-1 text-sm font-semibold"><span class="text-gray-300">Total Fixed Assets</span><span class="font-mono text-emerald-400">${ssrInterpolate(Number(unref(bs).totalFixedAssets).toLocaleString())}</span></div></div><div class="border-t-2 border-white/10 pt-2 flex justify-between font-bold"><span class="text-gray-100">Total Assets</span><span class="font-mono text-gold-400">${ssrInterpolate(Number(unref(bs).totalAssets).toLocaleString())}</span></div></div><div class="space-y-4"><h3 class="text-xs font-bold text-red-400 uppercase tracking-wider">Liabilities &amp; Equity</h3><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Current Liabilities</p><!--[-->`);
      ssrRenderList(unref(bs).currentLiabilities, (item) => {
        _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(Number(item.amount).toLocaleString())}</span></div>`);
      });
      _push(`<!--]--></div><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Long-term Liabilities</p><!--[-->`);
      ssrRenderList(unref(bs).longTermLiabilities, (item) => {
        _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(Number(item.amount).toLocaleString())}</span></div>`);
      });
      _push(`<!--]--></div><div><p class="text-xs font-semibold text-gray-500 uppercase mb-2">Equity</p><!--[-->`);
      ssrRenderList(unref(bs).equity, (item) => {
        _push(`<div class="flex justify-between py-1 text-sm"><span class="text-gray-400 pl-3">${ssrInterpolate(item.name)}</span><span class="font-mono text-gray-200">${ssrInterpolate(Number(item.amount).toLocaleString())}</span></div>`);
      });
      _push(`<!--]--></div><div class="border-t-2 border-white/10 pt-2 flex justify-between font-bold"><span class="text-gray-100">Total Liabilities &amp; Equity</span><span class="font-mono text-gold-400">${ssrInterpolate(Number(unref(bs).totalLiabAndEquity).toLocaleString())}</span></div></div></div></div><div class="glass-card p-6"><h2 class="text-lg font-bold text-gray-100 text-center mb-1">Tax Computation Worksheet</h2><p class="text-xs text-gray-500 text-center mb-6">For your accountant to complete \u2014 this system does not compute these figures</p><div class="max-w-lg mx-auto space-y-2 text-sm"><div class="flex justify-between py-2 border-b border-white/[0.06]"><span class="text-gray-300">Net Profit per Accounts</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(Number(unref(pl).netProfit).toLocaleString())}</span></div><div class="flex justify-between py-2 border-b border-white/[0.06]"><span class="text-gray-500">Add: Disallowed Expenses</span><span class="font-mono text-gray-600">\u2014</span></div><div class="flex justify-between py-2 border-b border-white/[0.06]"><span class="text-gray-500">Less: Depreciation (Tax Rate)</span><span class="font-mono text-gray-600">\u2014</span></div><div class="flex justify-between py-2 border-b border-white/[0.06]"><span class="text-gray-500">Less: Other Tax Adjustments</span><span class="font-mono text-gray-600">\u2014</span></div><div class="flex justify-between py-3 border-t-2 border-white/10 font-bold"><span class="text-gray-200">Taxable Income</span><span class="font-mono text-gray-600">\u2014 (not computed)</span></div><div class="flex justify-between py-2"><span class="text-gray-500">Tax Liability</span><span class="font-mono text-gray-600">\u2014 (not computed)</span></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/tax-statement.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tax-statement-DeS1ATWd.mjs.map
