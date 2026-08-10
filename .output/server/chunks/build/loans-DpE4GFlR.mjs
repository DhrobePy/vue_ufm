import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
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
  __name: "loans",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const filterStatus = ref("active");
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/loans",
      {
        query: computed(() => filterStatus.value ? { status: filterStatus.value } : {})
      },
      "$mj4CB9guw8"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const loans = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.loans) != null ? _b : [];
    });
    const employees = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.employees) != null ? _b : [];
    });
    const showCreate = ref(false);
    const cSaving = ref(false);
    const cErr = ref("");
    const cForm = ref({ employee_id: "", amount: 0, installments: 12, monthly_payment: 0, installment_type: "fixed" });
    const installmentLoan = ref(null);
    const iAmount = ref(0);
    const iSaving = ref(false);
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBackButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div><h1 class="text-2xl font-bold text-white">Employee Loans</h1><p class="text-sm text-gray-400">${ssrInterpolate(unref(loans).length)} loans</p></div></div><button class="btn-primary flex items-center gap-2"><span>+</span> New Loan </button></div><div class="flex gap-2"><!--[-->`);
      ssrRenderList(["", "active", "paid"], (tab) => {
        _push(`<button class="${ssrRenderClass(["btn-xs", unref(filterStatus) === tab ? "btn-primary" : "btn-secondary"])}">${ssrInterpolate(tab || "All")}</button>`);
      });
      _push(`<!--]--></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th">Date</th><th class="th text-right">Loan Amount</th><th class="th text-right">Paid</th><th class="th text-right">Balance</th><th class="th text-center">Installments</th><th class="th text-center">Type</th><th class="th text-center">Status</th><th class="th text-right">Action</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(loans), (loan) => {
        _push(`<tr class="tr"><td class="td"><p class="font-medium text-gray-200">${ssrInterpolate(loan.first_name)} ${ssrInterpolate(loan.last_name)}</p></td><td class="td text-gray-400">${ssrInterpolate(fmtDate(loan.loan_date))}</td><td class="td text-right text-gray-300">\u09F3${ssrInterpolate(fmt(loan.amount))}</td><td class="td text-right text-green-400">\u09F3${ssrInterpolate(fmt(loan.paid_amount))}</td><td class="${ssrRenderClass([Number(loan.amount) - Number(loan.paid_amount) > 0 ? "text-red-400" : "text-green-400", "td text-right font-medium"])}"> \u09F3${ssrInterpolate(fmt(Math.max(0, Number(loan.amount) - Number(loan.paid_amount))))}</td><td class="td text-center text-gray-400">${ssrInterpolate(loan.installments)}\xD7\u09F3${ssrInterpolate(fmt(loan.monthly_payment))}</td><td class="td text-center"><span class="${ssrRenderClass([loan.installment_type === "fixed" ? "badge-blue" : "badge-yellow", "badge"])}">${ssrInterpolate(loan.installment_type)}</span></td><td class="td text-center"><span class="${ssrRenderClass([loan.status === "active" ? "badge-green" : "badge-gray", "badge"])}">${ssrInterpolate(loan.status)}</span></td><td class="td text-right"><div class="flex justify-end gap-1">`);
        if (loan.status === "active" && loan.installment_type === "random") {
          _push(`<button class="btn-xs">+ Payment</button>`);
        } else {
          _push(`<!---->`);
        }
        if (loan.status === "active") {
          _push(`<button class="btn-xs">Mark Paid</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(loans).length) {
        _push(`<tr><td colspan="9" class="td text-center text-gray-500 py-10">No loans found.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreate)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-md"><h2 class="text-lg font-bold text-white mb-5">New Employee Loan</h2><form class="space-y-4"><div><label class="label">Employee *</label><select required class="input-field w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).employee_id) ? ssrLooseContain(unref(cForm).employee_id, "") : ssrLooseEqual(unref(cForm).employee_id, "")) ? " selected" : ""}>Select employee</option><!--[-->`);
          ssrRenderList(unref(employees), (e) => {
            _push2(`<option${ssrRenderAttr("value", e.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).employee_id) ? ssrLooseContain(unref(cForm).employee_id, e.id) : ssrLooseEqual(unref(cForm).employee_id, e.id)) ? " selected" : ""}>${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Loan Amount (\u09F3) *</label><input${ssrRenderAttr("value", unref(cForm).amount)} type="number" min="1" required class="input-field w-full"></div><div><label class="label">No. of Installments *</label><input${ssrRenderAttr("value", unref(cForm).installments)} type="number" min="1" required class="input-field w-full"></div></div><div><label class="label">Monthly Payment (\u09F3)</label><input${ssrRenderAttr("value", unref(cForm).monthly_payment)} type="number" min="0" class="input-field w-full"><p class="text-xs text-gray-500 mt-1">Auto-calculated. Override if needed.</p></div><div><label class="label">Installment Type</label><select class="input-field w-full"><option value="fixed"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).installment_type) ? ssrLooseContain(unref(cForm).installment_type, "fixed") : ssrLooseEqual(unref(cForm).installment_type, "fixed")) ? " selected" : ""}>Fixed (auto-deducted each payroll)</option><option value="random"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).installment_type) ? ssrLooseContain(unref(cForm).installment_type, "random") : ssrLooseEqual(unref(cForm).installment_type, "random")) ? " selected" : ""}>Random (manual per payroll)</option></select></div>`);
          if (unref(cErr)) {
            _push2(`<div class="text-sm text-red-400">${ssrInterpolate(unref(cErr))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-end gap-3 pt-2"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(cSaving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(cSaving) ? "Creating\u2026" : "Create Loan")}</button></div></form></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(installmentLoan)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-sm"><h2 class="text-lg font-bold text-white mb-1">Record Payment</h2><p class="text-sm text-gray-400 mb-4">${ssrInterpolate(unref(installmentLoan).first_name)} ${ssrInterpolate(unref(installmentLoan).last_name)} \u2014 Balance \u09F3${ssrInterpolate(fmt(Math.max(0, Number(unref(installmentLoan).amount) - Number(unref(installmentLoan).paid_amount))))}</p><div class="space-y-4"><div><label class="label">Amount (\u09F3) *</label><input${ssrRenderAttr("value", unref(iAmount))} type="number" min="1" class="input-field w-full"></div><div class="flex justify-end gap-3"><button class="btn-secondary">Cancel</button><button${ssrIncludeBooleanAttr(unref(iSaving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(iSaving) ? "Saving\u2026" : "Record")}</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/loans.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=loans-DpE4GFlR.mjs.map
