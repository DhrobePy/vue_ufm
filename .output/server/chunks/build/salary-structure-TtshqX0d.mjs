import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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
  __name: "salary-structure",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { data: listData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/salary-structure",
      "$7Y3enjUuqV"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const empList = computed(() => {
      var _a, _b;
      return (_b = (_a = listData.value) == null ? void 0 : _a.employees) != null ? _b : [];
    });
    const search = ref("");
    const filteredEmps = computed(() => {
      const q = search.value.toLowerCase();
      return empList.value.filter(
        (e) => !q || `${e.first_name} ${e.last_name}`.toLowerCase().includes(q)
      );
    });
    const selectedId = ref(route.query.emp ? Number(route.query.emp) : null);
    const selectedEmp = ref(null);
    const structure = ref(null);
    const emptyForm = () => ({
      basic_salary: 0,
      house_allowance: 0,
      transport_allowance: 0,
      medical_allowance: 0,
      other_allowances: 0,
      provident_fund: 0,
      tax_deduction: 0,
      other_deductions: 0
    });
    const form = ref(emptyForm());
    async function selectEmployee(id) {
      var _a;
      selectedId.value = id;
      const res = await $fetch("/api/hr/salary-structure", { query: { employeeId: id } });
      selectedEmp.value = res.employee;
      structure.value = res.structure;
      if (res.structure) {
        const s = res.structure;
        form.value = {
          basic_salary: Number(s.basic_salary),
          house_allowance: Number(s.house_allowance),
          transport_allowance: Number(s.transport_allowance),
          medical_allowance: Number(s.medical_allowance),
          other_allowances: Number(s.other_allowances),
          provident_fund: Number(s.provident_fund),
          tax_deduction: Number(s.tax_deduction),
          other_deductions: Number(s.other_deductions)
        };
      } else {
        form.value = emptyForm();
        form.value.basic_salary = Number((_a = res.employee) == null ? void 0 : _a.base_salary) || 0;
      }
      recalc();
    }
    if (selectedId.value) [__temp, __restore] = withAsyncContext(() => selectEmployee(selectedId.value)), await __temp, __restore();
    const totalAllowances = ref(0);
    const grossSalary = ref(0);
    const netSalary = ref(0);
    function recalc() {
      const f = form.value;
      totalAllowances.value = f.house_allowance + f.transport_allowance + f.medical_allowance + f.other_allowances;
      grossSalary.value = f.basic_salary + totalAllowances.value;
      netSalary.value = grossSalary.value - f.provident_fund - f.tax_deduction - f.other_deductions;
    }
    const saving = ref(false);
    const earningFields = [
      { key: "basic_salary", label: "Basic Salary *" },
      { key: "house_allowance", label: "House Allowance" },
      { key: "transport_allowance", label: "Transport Allowance" },
      { key: "medical_allowance", label: "Medical Allowance" },
      { key: "other_allowances", label: "Other Allowances" }
    ];
    const deductionFields = [
      { key: "provident_fund", label: "Provident Fund" },
      { key: "tax_deduction", label: "Tax Deduction" },
      { key: "other_deductions", label: "Other Deductions" }
    ];
    const initials = (f, l) => {
      var _a, _b;
      return `${(_a = f[0]) != null ? _a : ""}${(_b = l[0]) != null ? _b : ""}`.toUpperCase();
    };
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    recalc();
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiBackButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div><h1 class="text-2xl font-bold text-white">Salary Structure</h1><p class="text-sm text-gray-400 mt-0.5">Manage per-employee compensation breakdown</p></div></div><div class="grid grid-cols-12 gap-5"><div class="col-span-12 lg:col-span-4"><div class="card overflow-hidden"><div class="px-4 py-3 border-b border-white/[0.06]"><input${ssrRenderAttr("value", unref(search))} placeholder="Search\u2026" class="input-field w-full text-sm"></div><div class="overflow-y-auto max-h-[600px]"><!--[-->`);
      ssrRenderList(unref(filteredEmps), (emp) => {
        _push(`<button class="${ssrRenderClass([
          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/[0.04]",
          unref(selectedId) === emp.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
        ])}"><div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style="${ssrRenderStyle({ "background": "rgba(var(--accent-glow),0.15)", "color": "var(--accent-from)" })}">${ssrInterpolate(initials(emp.first_name, emp.last_name))}</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(emp.first_name)} ${ssrInterpolate(emp.last_name)}</p><p class="text-xs text-gray-500 truncate">${ssrInterpolate(emp.position_name || emp.department_name || "\u2014")}</p></div><div class="text-right shrink-0">`);
        if (emp.gross_salary) {
          _push(`<p class="text-xs text-gray-300">\u09F3${ssrInterpolate(fmt(emp.gross_salary))}</p>`);
        } else {
          _push(`<p class="text-xs text-gray-600">Not set</p>`);
        }
        _push(`</div></button>`);
      });
      _push(`<!--]--></div></div></div><div class="col-span-12 lg:col-span-8">`);
      if (!unref(selectedId)) {
        _push(`<div class="card flex items-center justify-center h-48"><p class="text-gray-500">\u2190 Select an employee to manage salary structure</p></div>`);
      } else {
        _push(`<div class="card p-5 space-y-5"><div class="flex items-center justify-between"><div><h2 class="text-lg font-bold text-white">${ssrInterpolate((_a = unref(selectedEmp)) == null ? void 0 : _a.first_name)} ${ssrInterpolate((_b = unref(selectedEmp)) == null ? void 0 : _b.last_name)}</h2><p class="text-sm text-gray-500">${ssrInterpolate((_c = unref(selectedEmp)) == null ? void 0 : _c.position_name)} \xB7 ${ssrInterpolate((_d = unref(selectedEmp)) == null ? void 0 : _d.department_name)}</p></div>`);
        if (unref(structure)) {
          _push(`<div class="text-right"><p class="text-xs text-gray-500">Last updated</p><p class="text-sm text-gray-300">${ssrInterpolate(fmtDate(unref(structure).updated_date || unref(structure).created_date))}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><form class="space-y-5"><div><h3 class="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2"><span>\u2191</span> Earnings </h3><div class="grid grid-cols-2 gap-4"><!--[-->`);
        ssrRenderList(earningFields, (field) => {
          _push(`<div><label class="label">${ssrInterpolate(field.label)}</label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">\u09F3</span><input${ssrRenderAttr("value", unref(form)[field.key])} type="number" min="0" step="0.01" class="input-field w-full pl-7"></div></div>`);
        });
        _push(`<!--]--></div></div><div><h3 class="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2"><span>\u2193</span> Deductions </h3><div class="grid grid-cols-2 gap-4"><!--[-->`);
        ssrRenderList(deductionFields, (field) => {
          _push(`<div><label class="label">${ssrInterpolate(field.label)}</label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">\u09F3</span><input${ssrRenderAttr("value", unref(form)[field.key])} type="number" min="0" step="0.01" class="input-field w-full pl-7"></div></div>`);
        });
        _push(`<!--]--></div></div><div class="rounded-xl p-4 grid grid-cols-3 gap-4" style="${ssrRenderStyle({ "background": "rgba(var(--tint)/0.04)", "border": "1px solid rgba(var(--tint)/0.07)" })}"><div class="text-center"><p class="text-xs text-gray-500">Total Allowances</p><p class="text-lg font-bold text-green-400">\u09F3${ssrInterpolate(fmt(unref(totalAllowances)))}</p></div><div class="text-center"><p class="text-xs text-gray-500">Gross Salary</p><p class="text-xl font-bold text-white">\u09F3${ssrInterpolate(fmt(unref(grossSalary)))}</p></div><div class="text-center"><p class="text-xs text-gray-500">Net Salary</p><p class="text-xl font-bold text-blue-400">\u09F3${ssrInterpolate(fmt(unref(netSalary)))}</p></div></div><div class="flex justify-end gap-3"><button type="submit"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary px-6">${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Structure")}</button></div></form></div>`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/salary-structure.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=salary-structure-TtshqX0d.mjs.map
