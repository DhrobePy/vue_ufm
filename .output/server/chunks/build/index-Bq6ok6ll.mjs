import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const [{ data, refresh }, { data: custData }, { data: suppData }, { data: bankData }, { data: pettyData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/loans",
        "$ee_-Z_G-CW"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/customers",
        { query: { per: 500, simple: "1" } },
        "$W9nkyR9gWC"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/suppliers",
        { query: { per: 500 } },
        "$ZeUqS9LpTX"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/bank-accounts",
        "$wbOsuORqPh"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/cash-accounts",
        "$cdlcYKN58g"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const loans = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.loans) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const borrowerOptions = computed(() => {
      var _a, _b, _c, _d;
      return [
        ...((_b = (_a = custData.value) == null ? void 0 : _a.customers) != null ? _b : []).map((c) => ({
          value: `c:${c.id}`,
          label: c.name,
          sub: "Customer"
        })),
        ...((_d = (_c = suppData.value) == null ? void 0 : _c.suppliers) != null ? _d : []).map((s) => ({
          value: `s:${s.id}`,
          label: s.company_name,
          sub: "Supplier"
        }))
      ];
    });
    const bankAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({
        value: a.id,
        label: `${a.bank_name} \u2014 AC: ${a.account_number}`,
        sub: a.branch_name || ""
      }));
    });
    const cashAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = pettyData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({
        value: a.id,
        label: a.account_name,
        sub: a.branch_name || "Head Office"
      }));
    });
    const form = reactive({
      borrower: "",
      amount: 0,
      loanDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      expectedReturn: "",
      method: "Cash",
      bankAccountId: "",
      cashAccountId: "",
      purpose: ""
    });
    const canSubmit = computed(() => !!form.borrower && form.amount > 0 && (form.method === "Cash" ? !!form.cashAccountId : !!form.bankAccountId));
    const submitting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Loans & Advances",
        subtitle: "Related-party cash advances \u2014 a separate balance from trading dues",
        breadcrumb: ["Loans"]
      }, null, _parent));
      if (Number(unref(stats).overdue_count) > 0) {
        _push(`<div class="rounded-xl p-3 text-xs text-red-300" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.08)", "border": "1px solid rgba(239,68,68,0.25)" })}"> \u26A0 ${ssrInterpolate(unref(stats).overdue_count)} loan(s) past their expected return date with balance still due. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 md:grid-cols-4 gap-3"><div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase">Outstanding</p><p class="text-lg font-bold text-orange-400 mt-1">\u09F3${ssrInterpolate(Number((_a = unref(stats).outstanding) != null ? _a : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase">Overdue Loans</p><p class="text-lg font-bold text-red-400 mt-1">${ssrInterpolate((_b = unref(stats).overdue_count) != null ? _b : 0)}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase">Disbursed (MTD)</p><p class="text-lg font-bold text-gray-200 mt-1">\u09F3${ssrInterpolate(Number((_c = unref(stats).disbursed_mtd) != null ? _c : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase">Repaid (MTD)</p><p class="text-lg font-bold text-emerald-400 mt-1">\u09F3${ssrInterpolate(Number((_d = unref(stats).repaid_mtd) != null ? _d : 0).toLocaleString())}</p></div></div><div class="glass-card p-6 space-y-4 max-w-4xl"><h3 class="section-title">Disburse a Loan</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="space-y-1.5 md:col-span-2"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Borrower * <span class="normal-case text-gray-600">(customer or supplier)</span></label>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(form).borrower,
        "onUpdate:modelValue": ($event) => unref(form).borrower = $event,
        options: unref(borrowerOptions),
        placeholder: "Search customers + suppliers\u2026"
      }, null, _parent));
      _push(`</div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount * (\u09F3)</label><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="0" step="any" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Loan Date</label><input${ssrRenderAttr("value", unref(form).loanDate)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Return</label><input${ssrRenderAttr("value", unref(form).expectedReturn)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</label><select class="input-glass"><!--[-->`);
      ssrRenderList(["Cash", "Bank Transfer", "Cheque", "Mobile Banking"], (m) => {
        _push(`<option${ssrRenderAttr("value", m)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, m) : ssrLooseEqual(unref(form).method, m)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if (unref(form).method === "Cash") {
        _push(`<div class="space-y-1.5 md:col-span-2"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Petty Cash Account *</label>`);
        _push(ssrRenderComponent(_component_UiSearchSelect, {
          modelValue: unref(form).cashAccountId,
          "onUpdate:modelValue": ($event) => unref(form).cashAccountId = $event,
          options: unref(cashAccountOptions),
          placeholder: "Cash box\u2026"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="space-y-1.5 md:col-span-2"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Account *</label>`);
        _push(ssrRenderComponent(_component_UiSearchSelect, {
          modelValue: unref(form).bankAccountId,
          "onUpdate:modelValue": ($event) => unref(form).bankAccountId = $event,
          options: unref(bankAccountOptions),
          placeholder: "Bank account\u2026"
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`<div class="space-y-1.5 md:col-span-3"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Purpose</label><input${ssrRenderAttr("value", unref(form).purpose)} class="input-glass" placeholder="e.g. Tender participation funding\u2026"></div></div><div class="flex justify-end"><button${ssrIncludeBooleanAttr(!unref(canSubmit) || unref(submitting)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50">${ssrInterpolate(unref(submitting) ? "Disbursing\u2026" : "Disburse Loan")}</button></div></div><div class="glass-card p-5"><h3 class="section-title mb-3">Loan History</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Loan #</th><th class="text-left pr-3">Borrower</th><th class="text-left pr-3">Date</th><th class="text-left pr-3">Expected Return</th><th class="text-right pr-3">Principal</th><th class="text-right pr-3">Repaid</th><th class="text-right pr-3">Due</th><th class="text-left">Status</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(loans), (l) => {
        var _a2;
        _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 pr-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/loans/${l.id}`,
          class: "font-mono text-gold-400 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(l.loan_number)}`);
            } else {
              return [
                createTextVNode(toDisplayString(l.loan_number), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td><td class="pr-3 text-gray-200">${ssrInterpolate((_a2 = l.customer_name) != null ? _a2 : l.supplier_name)} <span class="text-gray-600 text-[10px]">(${ssrInterpolate(l.customer_name ? "Customer" : "Supplier")})</span></td><td class="pr-3 text-gray-400">${ssrInterpolate(String(l.loan_date).slice(0, 10))}</td><td class="${ssrRenderClass(["pr-3", l.is_overdue ? "text-red-400 font-semibold" : "text-gray-400"])}">${ssrInterpolate(l.expected_return_date ? String(l.expected_return_date).slice(0, 10) : "\u2014")}${ssrInterpolate(l.is_overdue ? " \u26A0" : "")}</td><td class="pr-3 text-right font-mono text-gray-200">\u09F3${ssrInterpolate(Number(l.principal_amount).toLocaleString())}</td><td class="pr-3 text-right font-mono text-emerald-400">\u09F3${ssrInterpolate(Number(l.amount_repaid).toLocaleString())}</td><td class="pr-3 text-right font-mono text-orange-400">\u09F3${ssrInterpolate(Number(l.balance_due).toLocaleString())}</td><td>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: l.status
        }, null, _parent));
        _push(`</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(loans).length) {
        _push(`<tr><td colspan="8" class="py-6 text-center text-gray-600">No loans yet.</td></tr>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/loans/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bq6ok6ll.mjs.map
