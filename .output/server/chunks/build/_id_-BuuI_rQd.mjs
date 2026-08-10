import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, computed, withAsyncContext, reactive, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRoute, p as useUserSession } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const { user: sessionUser } = useUserSession();
    const isAdminUser = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const loanId = computed(() => Number(route.params.id));
    const [{ data, refresh }, { data: bankData }, { data: pettyData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        () => `/api/loans/${loanId.value}`,
        "$vtSiQyISuz"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/bank-accounts",
        "$hRg6bDVMc7"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/cash-accounts",
        "$p-a9x5Ee9e"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const loan = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.loan) != null ? _b : null;
    });
    const jeLines = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.je_lines) != null ? _b : [];
    });
    const repayments = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.repayments) != null ? _b : [];
    });
    const borrowerName = computed(() => {
      var _a, _b, _c, _d;
      return (_d = (_c = (_a = loan.value) == null ? void 0 : _a.customer_name) != null ? _c : (_b = loan.value) == null ? void 0 : _b.supplier_name) != null ? _d : "\u2014";
    });
    const detailRows = computed(() => {
      var _a, _b;
      return loan.value ? [
        ["Borrower", `${borrowerName.value} (${loan.value.customer_name ? "Customer" : "Supplier"})`],
        ["Loan Date", String(loan.value.loan_date).slice(0, 10)],
        ["Expected Return", loan.value.expected_return_date ? String(loan.value.expected_return_date).slice(0, 10) : "\u2014"],
        ["Method", loan.value.payment_method],
        ["Purpose", (_a = loan.value.purpose) != null ? _a : "\u2014"],
        ["Status", loan.value.status],
        ["Disbursed by", (_b = loan.value.created_by) != null ? _b : "\u2014"]
      ] : [];
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
    const repay = reactive({ amount: 0, method: "Cash", bankAccountId: "", cashAccountId: "" });
    const repaying = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: (_b = (_a = unref(loan)) == null ? void 0 : _a.loan_number) != null ? _b : "Loan",
        subtitle: unref(loan) ? `${unref(borrowerName)} \xB7 \u09F3${Number(unref(loan).principal_amount).toLocaleString()}` : "",
        breadcrumb: ["Loans", (_d = (_c = unref(loan)) == null ? void 0 : _c.loan_number) != null ? _d : "\u2026"]
      }, null, _parent));
      if (unref(loan)) {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-5"><div class="glass-card p-5 space-y-2 text-xs"><h3 class="section-title mb-2">Details</h3><!--[-->`);
        ssrRenderList(unref(detailRows), (row) => {
          _push(`<div class="flex justify-between py-1 border-b border-white/[0.03]"><span class="text-gray-500">${ssrInterpolate(row[0])}</span><span class="text-gray-200 font-medium">${ssrInterpolate(row[1])}</span></div>`);
        });
        _push(`<!--]-->`);
        if (unref(isAdminUser) && Number(unref(loan).amount_repaid) <= 5e-3) {
          _push(`<div class="pt-3"><button class="btn-ghost text-xs text-red-400">\u{1F5D1} Delete Loan</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5 space-y-3 text-xs"><h3 class="section-title mb-1">Balance</h3><div class="grid grid-cols-3 gap-2"><div class="rounded-lg p-2.5 bg-white/[0.03]"><p class="text-[10px] text-gray-600 uppercase">Principal</p><p class="font-bold font-mono text-gray-200">\u09F3${ssrInterpolate(Number(unref(loan).principal_amount).toLocaleString())}</p></div><div class="rounded-lg p-2.5 bg-white/[0.03]"><p class="text-[10px] text-gray-600 uppercase">Repaid</p><p class="font-bold font-mono text-emerald-400">\u09F3${ssrInterpolate(Number(unref(loan).amount_repaid).toLocaleString())}</p></div><div class="rounded-lg p-2.5 bg-white/[0.03]"><p class="text-[10px] text-gray-600 uppercase">Due</p><p class="font-bold font-mono text-orange-400">\u09F3${ssrInterpolate(Number(unref(loan).balance_due).toLocaleString())}</p></div></div>`);
        if (unref(jeLines).length) {
          _push(`<div class="pt-1"><p class="text-[10px] text-gray-600 uppercase font-semibold mb-1">Disbursement Journal</p><!--[-->`);
          ssrRenderList(unref(jeLines), (l, i) => {
            _push(`<div class="flex justify-between py-0.5 font-mono text-[11px]"><span class="text-gray-400">${ssrInterpolate(l.account_name)}</span><span class="text-gray-300">${ssrInterpolate(Number(l.debit_amount) > 0 ? `Dr \u09F3${Number(l.debit_amount).toLocaleString()}` : `Cr \u09F3${Number(l.credit_amount).toLocaleString()}`)}</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loan) && unref(loan).status === "active") {
        _push(`<div class="glass-card p-5 space-y-3"><h3 class="section-title">Record Repayment</h3><div class="flex flex-wrap items-end gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Amount</label><input${ssrRenderAttr("value", unref(repay).amount)} type="number" step="any" class="input-glass text-xs font-mono w-32"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Method</label><select class="input-glass text-xs w-36"><!--[-->`);
        ssrRenderList(["Cash", "Bank Transfer", "Cheque", "Mobile Banking"], (m) => {
          _push(`<option${ssrRenderAttr("value", m)}${ssrIncludeBooleanAttr(Array.isArray(unref(repay).method) ? ssrLooseContain(unref(repay).method, m) : ssrLooseEqual(unref(repay).method, m)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
        });
        _push(`<!--]--></select></div>`);
        if (unref(repay).method === "Cash") {
          _push(`<div class="space-y-1 min-w-[220px]"><label class="text-[10px] text-gray-600 uppercase">Petty Cash</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(repay).cashAccountId,
            "onUpdate:modelValue": ($event) => unref(repay).cashAccountId = $event,
            options: unref(cashAccountOptions),
            placeholder: "Cash box\u2026"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="space-y-1 min-w-[220px]"><label class="text-[10px] text-gray-600 uppercase">Bank Account</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(repay).bankAccountId,
            "onUpdate:modelValue": ($event) => unref(repay).bankAccountId = $event,
            options: unref(bankAccountOptions),
            placeholder: "Bank account\u2026"
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`<button${ssrIncludeBooleanAttr(!(unref(repay).amount > 0) || unref(repaying)) ? " disabled" : ""} class="btn-gold text-xs py-2 disabled:opacity-50">${ssrInterpolate(unref(repaying) ? "Posting\u2026" : "Record Repayment")}</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(repayments).length) {
        _push(`<div class="glass-card p-5"><h3 class="section-title mb-3">Repayment History</h3><!--[-->`);
        ssrRenderList(unref(repayments), (r) => {
          _push(`<div class="flex items-center gap-3 text-xs py-1.5 border-b border-white/[0.03]"><span class="font-mono text-gold-400">${ssrInterpolate(r.repayment_number)}</span><span class="text-gray-400">${ssrInterpolate(String(r.repayment_date).slice(0, 10))}</span><span class="text-gray-400">${ssrInterpolate(r.payment_method)}</span><span class="flex-1"></span><span class="font-mono text-emerald-400">\u09F3${ssrInterpolate(Number(r.amount).toLocaleString())}</span>`);
          if (unref(isAdminUser)) {
            _push(`<button class="btn-ghost text-[10px] py-0.5 text-red-400">Reverse</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/loans/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BuuI_rQd.mjs.map
