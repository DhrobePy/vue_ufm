import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/hr/payroll`,
      {
        query: { view: "payslip", payrollId: route.params.id }
      },
      "$eNsB3X24ke"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const payroll = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payroll) != null ? _b : null;
    });
    const allowanceItems = computed(() => {
      var _a, _b;
      return ((_b = (_a = data.value) == null ? void 0 : _a.items) != null ? _b : []).filter((i) => i.type === "allowance");
    });
    const deductionItems = computed(() => {
      var _a, _b;
      return ((_b = (_a = data.value) == null ? void 0 : _a.items) != null ? _b : []).filter((i) => i.type === "deduction");
    });
    const loanInstallments = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.installments) != null ? _b : [];
    });
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }) : "\u2014";
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6" }, _attrs))}><div class="flex items-center justify-between mb-6 print:hidden">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/hr/payroll/history",
        class: "btn-secondary text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 Back`);
          } else {
            return [
              createTextVNode("\u2190 Back")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="btn-primary text-sm">\u{1F5A8} Print Payslip</button></div>`);
      if (unref(payroll)) {
        _push(`<div class="max-w-2xl mx-auto bg-white text-gray-900 rounded-xl p-8 shadow print:shadow-none print:rounded-none"><div class="flex justify-between items-start border-b-2 border-gray-200 pb-5 mb-5"><div><h1 class="text-2xl font-bold">PAYSLIP</h1><p class="text-sm text-gray-500 mt-1"> Period: ${ssrInterpolate(fmtDate(unref(payroll).pay_period_start))} \u2013 ${ssrInterpolate(fmtDate(unref(payroll).pay_period_end))}</p></div><div class="text-right"><p class="text-xl font-bold text-blue-700">Ujjal FMC</p><p class="text-xs text-gray-500">ERP System</p></div></div><div class="grid grid-cols-2 gap-4 mb-6"><div><p class="text-xs text-gray-400 uppercase tracking-wide">Employee</p><p class="font-semibold text-gray-800">${ssrInterpolate(unref(payroll).first_name)} ${ssrInterpolate(unref(payroll).last_name)}</p></div><div><p class="text-xs text-gray-400 uppercase tracking-wide">Position</p><p class="text-gray-700">${ssrInterpolate(unref(payroll).position_name || "\u2014")}</p></div><div><p class="text-xs text-gray-400 uppercase tracking-wide">Department</p><p class="text-gray-700">${ssrInterpolate(unref(payroll).department_name || "\u2014")}</p></div><div><p class="text-xs text-gray-400 uppercase tracking-wide">Hire Date</p><p class="text-gray-700">${ssrInterpolate(fmtDate(unref(payroll).hire_date))}</p></div><div><p class="text-xs text-gray-400 uppercase tracking-wide">Email</p><p class="text-gray-700">${ssrInterpolate(unref(payroll).email)}</p></div><div><p class="text-xs text-gray-400 uppercase tracking-wide">Phone</p><p class="text-gray-700">${ssrInterpolate(unref(payroll).phone || "\u2014")}</p></div></div><div class="grid grid-cols-2 gap-6 mb-6"><div><h3 class="text-sm font-bold text-green-700 border-b border-green-100 pb-1 mb-2">Earnings</h3><div class="space-y-1.5 text-sm"><div class="flex justify-between"><span class="text-gray-600">Basic Salary</span><span class="font-medium">\u09F3${ssrInterpolate(fmt(unref(payroll).basic_salary || unref(payroll).gross_salary))}</span></div>`);
        if (Number(unref(payroll).house_allowance) > 0) {
          _push(`<div class="flex justify-between"><span class="text-gray-600">House Allowance</span><span>\u09F3${ssrInterpolate(fmt(unref(payroll).house_allowance))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(payroll).transport_allowance) > 0) {
          _push(`<div class="flex justify-between"><span class="text-gray-600">Transport Allowance</span><span>\u09F3${ssrInterpolate(fmt(unref(payroll).transport_allowance))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(payroll).medical_allowance) > 0) {
          _push(`<div class="flex justify-between"><span class="text-gray-600">Medical Allowance</span><span>\u09F3${ssrInterpolate(fmt(unref(payroll).medical_allowance))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(payroll).other_allowances) > 0) {
          _push(`<div class="flex justify-between"><span class="text-gray-600">Other Allowances</span><span>\u09F3${ssrInterpolate(fmt(unref(payroll).other_allowances))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(allowanceItems), (item) => {
          _push(`<div class="flex justify-between"><span class="text-gray-600">${ssrInterpolate(item.name)}</span><span>\u09F3${ssrInterpolate(fmt(item.amount))}</span></div>`);
        });
        _push(`<!--]--><div class="flex justify-between font-bold border-t border-gray-200 pt-1 mt-2"><span>Gross Salary</span><span class="text-green-700">\u09F3${ssrInterpolate(fmt(unref(payroll).gross_salary))}</span></div></div></div><div><h3 class="text-sm font-bold text-red-700 border-b border-red-100 pb-1 mb-2">Deductions</h3><div class="space-y-1.5 text-sm">`);
        if (Number(unref(payroll).provident_fund) > 0) {
          _push(`<div class="flex justify-between"><span class="text-gray-600">Provident Fund</span><span>\u09F3${ssrInterpolate(fmt(unref(payroll).provident_fund))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(payroll).tax_deduction) > 0) {
          _push(`<div class="flex justify-between"><span class="text-gray-600">Tax Deduction</span><span>\u09F3${ssrInterpolate(fmt(unref(payroll).tax_deduction))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(deductionItems), (item) => {
          _push(`<div class="flex justify-between"><span class="text-gray-600">${ssrInterpolate(item.name)}</span><span>\u09F3${ssrInterpolate(fmt(item.amount))}</span></div>`);
        });
        _push(`<!--]-->`);
        if (unref(loanInstallments).length) {
          _push(`<div class="flex justify-between"><span class="text-gray-600">Loan Repayment</span><span>\u09F3${ssrInterpolate(fmt(unref(loanInstallments).reduce((s, i) => s + Number(i.amount), 0)))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-between font-bold border-t border-gray-200 pt-1 mt-2"><span>Total Deductions</span><span class="text-red-700">\u09F3${ssrInterpolate(fmt(unref(payroll).deductions))}</span></div></div></div></div><div class="rounded-lg p-4 flex justify-between items-center" style="${ssrRenderStyle({ "background": "#f0fdf4" })}"><div><p class="text-xs text-gray-500 uppercase tracking-wide">Net Salary Payable</p><p class="text-xs text-gray-400 mt-0.5">Status: <span class="font-medium capitalize">${ssrInterpolate((_a = unref(payroll).status) == null ? void 0 : _a.replace("_", " "))}</span></p></div><p class="text-3xl font-bold text-green-700">\u09F3${ssrInterpolate(fmt(unref(payroll).net_salary))}</p></div><div class="mt-6 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400"><span>Generated: ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleString("en-GB"))}</span><span>Payroll ID: #${ssrInterpolate(unref(payroll).id)}</span></div></div>`);
      } else {
        _push(`<div class="text-center text-gray-500 py-20"><p>Payroll not found.</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/payslip/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-3_aS9fSv.mjs.map
