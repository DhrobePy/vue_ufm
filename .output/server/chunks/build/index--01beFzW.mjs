import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderList, ssrRenderAttr, ssrRenderTeleport, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: pendingData, refresh: refreshPending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/payroll",
      { query: { view: "pending" } },
      "$9fyMK2b-Xm"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: approvedData, refresh: refreshApproved } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/payroll",
      {
        query: { view: "approved" }
      },
      "$lHaMFlRoQi"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const payrolls = computed(() => {
      var _a, _b;
      return (_b = (_a = pendingData.value) == null ? void 0 : _a.payrolls) != null ? _b : [];
    });
    const approved = computed(() => {
      var _a, _b;
      return (_b = (_a = approvedData.value) == null ? void 0 : _a.payrolls) != null ? _b : [];
    });
    const selected = ref([]);
    const selectAll = computed({
      get: () => payrolls.value.length > 0 && selected.value.length === payrolls.value.length,
      set: (v) => {
        selected.value = v ? payrolls.value.map((p) => p.id) : [];
      }
    });
    const acting = ref(false);
    const showPrepare = ref(false);
    const preparing = ref(false);
    const prepareErr = ref("");
    const today = /* @__PURE__ */ new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    const pForm = ref({ start: firstDay, end: lastDay });
    const editPayroll = ref(null);
    const eForm = ref({ gross_salary: 0, absence_deduction: 0, advance_deduction: 0, loan_deduction: 0, other_loan_repayment: 0 });
    const eNetSalary = ref(0);
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div><h1 class="text-2xl font-bold text-white">Payroll</h1><p class="text-sm text-gray-400">Prepare \xB7 Approve \xB7 Disburse</p></div><div class="flex gap-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/hr/payroll/history",
        class: "btn-secondary text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`History`);
          } else {
            return [
              createTextVNode("History")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="btn-primary flex items-center gap-2"><span>+</span> Prepare Payroll </button></div></div>`);
      if (unref(payrolls).length) {
        _push(`<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between"><h2 class="text-sm font-semibold text-gray-200"> Pending Approval \u2014 ${ssrInterpolate(unref(payrolls).length)} records </h2><div class="flex gap-2"><button class="btn-xs btn-secondary">${ssrInterpolate(unref(selectAll) ? "Deselect All" : "Select All")}</button>`);
        if (unref(selected).length) {
          _push(`<button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-xs badge-green text-xs px-2 py-1 rounded"> Approve ${ssrInterpolate(unref(selected).length)} \u2713 </button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(selected).length) {
          _push(`<button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-xs badge-red text-xs px-2 py-1 rounded"> Reject ${ssrInterpolate(unref(selected).length)}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th w-8"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(selectAll)) ? ssrLooseContain(unref(selectAll), null) : unref(selectAll)) ? " checked" : ""} class="accent-current"></th><th class="th">Employee</th><th class="th">Period</th><th class="th text-right">Gross</th><th class="th text-right">Absence Ded.</th><th class="th text-right">Advance Ded.</th><th class="th text-right">Loan Ded.</th><th class="th text-right text-green-400">Net Salary</th><th class="th text-right">Action</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(payrolls), (p) => {
          _push(`<tr class="tr"><td class="td"><input type="checkbox"${ssrRenderAttr("value", p.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(selected)) ? ssrLooseContain(unref(selected), p.id) : unref(selected)) ? " checked" : ""} class="accent-current"></td><td class="td"><p class="font-medium text-gray-200">${ssrInterpolate(p.first_name)} ${ssrInterpolate(p.last_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(p.position_name)}</p></td><td class="td text-gray-400 text-xs">${ssrInterpolate(fmtDate(p.pay_period_start))} \u2013 ${ssrInterpolate(fmtDate(p.pay_period_end))}</td><td class="td text-right text-gray-300">\u09F3${ssrInterpolate(fmt(p.gross_salary))}</td><td class="td text-right text-red-400">${ssrInterpolate(p.absent_days > 0 ? `\u09F3${fmt(p.absence_deduction)} (${p.absent_days}d)` : "\u2014")}</td><td class="td text-right text-red-400">${ssrInterpolate(Number(p.advance_deduction) > 0 ? `\u09F3${fmt(p.advance_deduction)}` : "\u2014")}</td><td class="td text-right text-red-400">${ssrInterpolate(Number(p.loan_deduction) > 0 ? `\u09F3${fmt(p.loan_deduction)}` : "\u2014")}</td><td class="td text-right font-semibold text-green-400">\u09F3${ssrInterpolate(fmt(p.net_salary))}</td><td class="td text-right"><div class="flex justify-end gap-1"><button class="btn-xs">Edit</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-xs badge-green text-xs px-2 py-0.5 rounded">\u2713</button></div></td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot><tr class="border-t border-white/[0.08]"><td colspan="7" class="td text-right text-sm font-semibold text-gray-300">Total Net:</td><td class="td text-right font-bold text-green-400"> \u09F3${ssrInterpolate(fmt(unref(payrolls).reduce((s, p) => s + Number(p.net_salary), 0)))}</td><td></td></tr></tfoot></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(approved).length) {
        _push(`<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between"><h2 class="text-sm font-semibold text-blue-400">Approved \u2014 Ready to Disburse (${ssrInterpolate(unref(approved).length)})</h2><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-primary text-sm"> Disburse All \u09F3${ssrInterpolate(fmt(unref(approved).reduce((s, p) => s + Number(p.net_salary), 0)))}</button></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th">Period</th><th class="th text-right">Gross</th><th class="th text-right">Deductions</th><th class="th text-right text-green-400">Net</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(approved), (p) => {
          _push(`<tr class="tr"><td class="td text-gray-200">${ssrInterpolate(p.first_name)} ${ssrInterpolate(p.last_name)}</td><td class="td text-gray-400 text-xs">${ssrInterpolate(fmtDate(p.pay_period_start))} \u2013 ${ssrInterpolate(fmtDate(p.pay_period_end))}</td><td class="td text-right text-gray-300">\u09F3${ssrInterpolate(fmt(p.gross_salary))}</td><td class="td text-right text-red-400">\u09F3${ssrInterpolate(fmt(p.deductions))}</td><td class="td text-right font-semibold text-green-400">\u09F3${ssrInterpolate(fmt(p.net_salary))}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(payrolls).length && !unref(approved).length) {
        _push(`<div class="card p-12 text-center"><p class="text-gray-500 mb-4">No pending payrolls. Click &quot;Prepare Payroll&quot; to begin.</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/hr/payroll/history",
          class: "btn-secondary text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`View History`);
            } else {
              return [
                createTextVNode("View History")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showPrepare)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-md"><h2 class="text-lg font-bold text-white mb-5">Prepare Payroll</h2><form class="space-y-4"><div><label class="label">Pay Period Start *</label><input${ssrRenderAttr("value", unref(pForm).start)} type="date" required class="input-field w-full"></div><div><label class="label">Pay Period End *</label><input${ssrRenderAttr("value", unref(pForm).end)} type="date" required class="input-field w-full"></div><p class="text-xs text-gray-500"> This will prepare payrolls for all active employees, auto-calculating absence deductions, approved advances, and fixed loan installments. </p>`);
          if (unref(prepareErr)) {
            _push2(`<div class="rounded-lg p-3 text-sm text-red-400 bg-red-500/10">${ssrInterpolate(unref(prepareErr))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-end gap-3 pt-2"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(preparing)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(preparing) ? "Preparing\u2026" : "Prepare")}</button></div></form></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(editPayroll)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-lg"><h2 class="text-lg font-bold text-white mb-1">Edit Payroll</h2><p class="text-sm text-gray-400 mb-5">${ssrInterpolate(unref(editPayroll).first_name)} ${ssrInterpolate(unref(editPayroll).last_name)}</p><div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="label">Gross Salary</label><input${ssrRenderAttr("value", unref(eForm).gross_salary)} type="number" class="input-field w-full"></div><div><label class="label">Absence Deduction</label><input${ssrRenderAttr("value", unref(eForm).absence_deduction)} type="number" class="input-field w-full"></div><div><label class="label">Advance Deduction</label><input${ssrRenderAttr("value", unref(eForm).advance_deduction)} type="number" class="input-field w-full"></div><div><label class="label">Loan Deduction</label><input${ssrRenderAttr("value", unref(eForm).loan_deduction)} type="number" class="input-field w-full"></div>`);
          if (unref(editPayroll).random_loan_id) {
            _push2(`<div><label class="label">Random Loan Repayment</label><input${ssrRenderAttr("value", unref(eForm).other_loan_repayment)} type="number" class="input-field w-full"><p class="text-xs text-gray-500 mt-1">Balance: \u09F3${ssrInterpolate(fmt(unref(editPayroll).random_loan_balance))}</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="rounded-lg p-3 flex justify-between" style="${ssrRenderStyle({ "background": "rgba(var(--accent-glow),0.06)" })}"><span class="text-sm text-gray-400">Net Salary</span><span class="font-bold text-green-400">\u09F3${ssrInterpolate(fmt(unref(eNetSalary)))}</span></div><div class="flex justify-end gap-3"><button class="btn-secondary">Cancel</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-primary">Save Changes</button></div></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/payroll/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index--01beFzW.mjs.map
