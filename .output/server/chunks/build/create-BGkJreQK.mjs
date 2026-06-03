import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, reactive, ref, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import { c as _export_sfc } from './server.mjs';
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
import 'perfect-debounce';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const form = reactive({
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      categoryId: "",
      subcategoryId: "",
      qty: 1,
      unitCost: 0,
      method: "Cash",
      bankAccountId: "",
      paymentReference: "",
      employeeId: "",
      handledBy: "",
      branchId: "",
      remarks: ""
    });
    const submitting = ref(false);
    const methods = [
      { value: "Cash", label: "\u{1F4B5} Cash" },
      { value: "Bank Transfer", label: "\u{1F3E6} Bank Transfer" },
      { value: "Cheque", label: "\u{1F9FE} Cheque" },
      { value: "Mobile Banking", label: "\u{1F4F1} Mobile Banking" }
    ];
    const needsBankAccount = computed(
      () => form.method === "Bank Transfer" || form.method === "Cheque"
    );
    const [{ data: catData }, { data: branchData }, { data: bankData }, { data: empData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/expenses/categories",
        { query: { spend: false } },
        "$PHCzFYpnZa"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/branches",
        "$A7q_QTn3VP"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/bank-accounts",
        "$i_xcNKfLS5"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/hr/employees",
        "$1XaOXtJ5_N"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const categories = computed(() => {
      var _a, _b;
      return (_b = (_a = catData.value) == null ? void 0 : _a.categories) != null ? _b : [];
    });
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = branchData.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const bankAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const employees = computed(() => {
      var _a, _b;
      return (_b = (_a = empData.value) == null ? void 0 : _a.employees) != null ? _b : [];
    });
    const selectedCategory = computed(
      () => {
        var _a;
        return (_a = categories.value.find((c) => c.id === form.categoryId)) != null ? _a : null;
      }
    );
    const selectedUnit = computed(() => {
      var _a, _b, _c;
      if (!form.subcategoryId) return "";
      const sub = (_b = (_a = selectedCategory.value) == null ? void 0 : _a.subcategories) == null ? void 0 : _b.find((s) => s.id === form.subcategoryId);
      return (_c = sub == null ? void 0 : sub.unit) != null ? _c : "";
    });
    const totalAmount = computed(() => (form.qty || 1) * (form.unitCost || 0));
    const isValid = computed(() => {
      if (!form.date || !form.categoryId || !form.remarks.trim()) return false;
      if (needsBankAccount.value && !form.bankAccountId) return false;
      return true;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl" }, _attrs))} data-v-035dc9f4>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create Expense Voucher",
        breadcrumb: ["Expenses", "Create"]
      }, null, _parent));
      _push(`<div class="glass-card p-6 space-y-6" data-v-035dc9f4><div data-v-035dc9f4><h3 class="section-title mb-4" data-v-035dc9f4>Expense Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-035dc9f4><div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass" data-v-035dc9f4></div><div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Branch</label><select class="input-glass" data-v-035dc9f4><option value="" data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "") : ssrLooseEqual(unref(form).branchId, "")) ? " selected" : ""}>\u2014 Select branch \u2014</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)} data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, b.id) : ssrLooseEqual(unref(form).branchId, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Category *</label><select class="input-glass" data-v-035dc9f4><option value="" data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).categoryId) ? ssrLooseContain(unref(form).categoryId, "") : ssrLooseEqual(unref(form).categoryId, "")) ? " selected" : ""}>Select category\u2026</option><!--[-->`);
      ssrRenderList(unref(categories), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)} data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).categoryId) ? ssrLooseContain(unref(form).categoryId, c.id) : ssrLooseEqual(unref(form).categoryId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if ((_b = (_a = unref(selectedCategory)) == null ? void 0 : _a.subcategories) == null ? void 0 : _b.length) {
        _push(`<div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Sub-category</label><select class="input-glass" data-v-035dc9f4><option value="" data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).subcategoryId) ? ssrLooseContain(unref(form).subcategoryId, "") : ssrLooseEqual(unref(form).subcategoryId, "")) ? " selected" : ""}>None</option><!--[-->`);
        ssrRenderList(unref(selectedCategory).subcategories, (s) => {
          _push(`<option${ssrRenderAttr("value", s.id)} data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).subcategoryId) ? ssrLooseContain(unref(form).subcategoryId, s.id) : ssrLooseEqual(unref(form).subcategoryId, s.id)) ? " selected" : ""}>${ssrInterpolate(s.name)}</option>`);
        });
        _push(`<!--]--></select></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Unit Quantity</label><input${ssrRenderAttr("value", unref(form).qty)} type="number" min="0" step="0.01" class="input-glass" placeholder="e.g. litres, kg, units" data-v-035dc9f4></div><div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4> Per Unit Cost (\u09F3) `);
      if (unref(selectedUnit)) {
        _push(`<span class="ml-1 text-gold-400/70 normal-case font-normal" data-v-035dc9f4>per ${ssrInterpolate(unref(selectedUnit))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label><input${ssrRenderAttr("value", unref(form).unitCost)} type="number" min="0" step="0.01" class="input-glass" placeholder="0.00" data-v-035dc9f4></div><div class="md:col-span-2 p-4 rounded-xl flex justify-between items-center" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border": "1px solid rgba(245,158,11,0.15)" })}" data-v-035dc9f4><span class="text-xs text-gray-500" data-v-035dc9f4>Total Amount</span><span class="font-bold text-gold-400 text-2xl font-mono" data-v-035dc9f4>\u09F3${ssrInterpolate(unref(totalAmount).toLocaleString())}</span></div><div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Handled By (Employee)</label><select class="input-glass" data-v-035dc9f4><option value="" data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).employeeId) ? ssrLooseContain(unref(form).employeeId, "") : ssrLooseEqual(unref(form).employeeId, "")) ? " selected" : ""}>\u2014 Select employee \u2014</option><!--[-->`);
      ssrRenderList(unref(employees), (e) => {
        _push(`<option${ssrRenderAttr("value", e.id)} data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).employeeId) ? ssrLooseContain(unref(form).employeeId, e.id) : ssrLooseEqual(unref(form).employeeId, e.id)) ? " selected" : ""}>${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Handled By (Name / Other)</label><input${ssrRenderAttr("value", unref(form).handledBy)} class="input-glass" placeholder="Free-form name if not in list" data-v-035dc9f4></div><div class="md:col-span-2 space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Remarks *</label><textarea rows="3" class="input-glass resize-none" placeholder="Describe the expense clearly\u2026" data-v-035dc9f4>${ssrInterpolate(unref(form).remarks)}</textarea></div></div></div><div data-v-035dc9f4><h3 class="section-title mb-4" data-v-035dc9f4>Payment Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-035dc9f4><div class="md:col-span-2 space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Payment Method *</label><div class="flex flex-wrap gap-2" data-v-035dc9f4><!--[-->`);
      ssrRenderList(methods, (m) => {
        _push(`<button type="button" class="${ssrRenderClass([
          "px-4 py-2 rounded-lg text-xs font-semibold border transition-all",
          unref(form).method === m.value ? "bg-gold-500/20 border-gold-500/60 text-gold-300" : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-300"
        ])}" data-v-035dc9f4>${ssrInterpolate(m.label)}</button>`);
      });
      _push(`<!--]--></div></div>`);
      if (unref(needsBankAccount)) {
        _push(`<!--[--><div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Bank Account *</label><select class="input-glass" data-v-035dc9f4><option value="" data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).bankAccountId) ? ssrLooseContain(unref(form).bankAccountId, "") : ssrLooseEqual(unref(form).bankAccountId, "")) ? " selected" : ""}>\u2014 Select account \u2014</option><optgroup label="Bank Accounts" data-v-035dc9f4><!--[-->`);
        ssrRenderList(unref(bankAccounts).filter((a) => a.account_type !== "Cash"), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)} data-v-035dc9f4${ssrIncludeBooleanAttr(Array.isArray(unref(form).bankAccountId) ? ssrLooseContain(unref(form).bankAccountId, a.id) : ssrLooseEqual(unref(form).bankAccountId, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2013 ${ssrInterpolate(a.account_name)} (${ssrInterpolate(a.account_number)}) </option>`);
        });
        _push(`<!--]--></optgroup></select></div><div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>${ssrInterpolate(unref(form).method === "Cheque" ? "Cheque Number" : "Transaction / Reference No.")}</label><input${ssrRenderAttr("value", unref(form).paymentReference)} class="input-glass"${ssrRenderAttr("placeholder", unref(form).method === "Cheque" ? "Cheque #" : "TXN-XXXXXXXX")} data-v-035dc9f4></div><!--]-->`);
      } else if (unref(form).method === "Mobile Banking") {
        _push(`<div class="space-y-1.5" data-v-035dc9f4><label class="field-label" data-v-035dc9f4>Mobile TXN / Reference No.</label><input${ssrRenderAttr("value", unref(form).paymentReference)} class="input-glass" placeholder="e.g. bKash/Nagad TXN ID" data-v-035dc9f4></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(form).method === "Cash") {
        _push(`<div class="md:col-span-2 flex items-center gap-3 p-3 rounded-lg" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.07)", "border": "1px solid rgba(16,185,129,0.18)" })}" data-v-035dc9f4><span class="text-green-400" data-v-035dc9f4>\u{1F4B5}</span><span class="text-xs text-green-300/80" data-v-035dc9f4>Cash payment \u2014 will be disbursed from branch petty cash on approval.</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="flex justify-end gap-3 pt-2 border-t border-white/5" data-v-035dc9f4>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/expenses",
        class: "btn-ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cancel`);
          } else {
            return [
              createTextVNode("Cancel")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button${ssrIncludeBooleanAttr(unref(submitting) || !unref(isValid)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" data-v-035dc9f4>`);
      if (unref(submitting)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-035dc9f4><circle cx="12" cy="12" r="10" stroke-opacity=".25" data-v-035dc9f4></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" data-v-035dc9f4></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(submitting) ? "Submitting\u2026" : "Submit for Approval")}</button></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const create = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-035dc9f4"]]);

export { create as default };
//# sourceMappingURL=create-BGkJreQK.mjs.map
