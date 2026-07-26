import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, reactive, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { c as _export_sfc } from './server.mjs';
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
      qty: null,
      unitCost: null,
      method: "cash",
      bankAccountId: "",
      cashAccountId: "",
      paymentReference: "",
      employeeId: "",
      handledBy: "",
      branchId: "",
      remarks: ""
    });
    const submitting = ref(false);
    const [
      { data: catData },
      { data: branchData },
      { data: bankData },
      { data: empData },
      { data: pettyData }
    ] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
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
      ),
      useFetch(
        "/api/expenses/petty-cash-accounts",
        "$NPikOYLuth"
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
    const pettyCashAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = pettyData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
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
    const selectedPettyCash = computed(
      () => {
        var _a;
        return (_a = pettyCashAccounts.value.find((a) => a.id === form.cashAccountId)) != null ? _a : null;
      }
    );
    const totalAmount = computed(() => {
      var _a, _b;
      const qty = (_a = form.qty) != null ? _a : 0;
      const cost = (_b = form.unitCost) != null ? _b : 0;
      if (qty && cost) return qty * cost;
      return 0;
    });
    const isValid = computed(() => {
      if (!form.date || !form.categoryId || !form.subcategoryId || !form.remarks.trim()) return false;
      if (form.method === "bank" && !form.bankAccountId) return false;
      if (form.method === "cash" && !form.cashAccountId) return false;
      if (totalAmount.value <= 0) return false;
      return true;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl" }, _attrs))} data-v-fb25822d>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create Expense Voucher",
        breadcrumb: ["Expenses", "Create"]
      }, null, _parent));
      _push(`<div class="glass-card p-6 space-y-6" data-v-fb25822d><div data-v-fb25822d><h3 class="section-title mb-4" data-v-fb25822d>Expense Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-fb25822d><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass" data-v-fb25822d></div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Branch</label><select class="input-glass" data-v-fb25822d><option value="" data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "") : ssrLooseEqual(unref(form).branchId, "")) ? " selected" : ""}>\u2014 Select branch \u2014</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", b.id)} data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, b.id) : ssrLooseEqual(unref(form).branchId, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Category *</label><select class="input-glass" data-v-fb25822d><option value="" data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).categoryId) ? ssrLooseContain(unref(form).categoryId, "") : ssrLooseEqual(unref(form).categoryId, "")) ? " selected" : ""}>Select category\u2026</option><!--[-->`);
      ssrRenderList(unref(categories), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)} data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).categoryId) ? ssrLooseContain(unref(form).categoryId, c.id) : ssrLooseEqual(unref(form).categoryId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Sub-category *</label><select class="input-glass"${ssrIncludeBooleanAttr(!((_b = (_a = unref(selectedCategory)) == null ? void 0 : _a.subcategories) == null ? void 0 : _b.length)) ? " disabled" : ""} data-v-fb25822d><option value="" data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).subcategoryId) ? ssrLooseContain(unref(form).subcategoryId, "") : ssrLooseEqual(unref(form).subcategoryId, "")) ? " selected" : ""}>\u2014 Select sub-category \u2014</option><!--[-->`);
      ssrRenderList((_d = (_c = unref(selectedCategory)) == null ? void 0 : _c.subcategories) != null ? _d : [], (s) => {
        _push(`<option${ssrRenderAttr("value", s.id)} data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).subcategoryId) ? ssrLooseContain(unref(form).subcategoryId, s.id) : ssrLooseEqual(unref(form).subcategoryId, s.id)) ? " selected" : ""}>${ssrInterpolate(s.name)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (unref(form).categoryId && !((_f = (_e = unref(selectedCategory)) == null ? void 0 : _e.subcategories) == null ? void 0 : _f.length)) {
        _push(`<p class="text-xs text-yellow-500/70 mt-1" data-v-fb25822d>No sub-categories for this category</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d> Unit Quantity `);
      if (unref(selectedUnit)) {
        _push(`<span class="ml-1 text-gold-400/70 normal-case font-normal" data-v-fb25822d> (${ssrInterpolate(unref(selectedUnit))}) </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label><input${ssrRenderAttr("value", unref(form).qty)} type="number" min="0" step="0.01" class="input-glass" placeholder="e.g. litres, kg, units" data-v-fb25822d></div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Per Unit Cost (\u09F3)</label><input${ssrRenderAttr("value", unref(form).unitCost)} type="number" min="0" step="0.01" class="input-glass" placeholder="0.00" data-v-fb25822d></div><div class="md:col-span-2 p-4 rounded-xl flex justify-between items-center" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border": "1px solid rgba(245,158,11,0.15)" })}" data-v-fb25822d><span class="text-xs text-gray-500" data-v-fb25822d>Total Amount</span><span class="font-bold text-gold-400 text-2xl font-mono" data-v-fb25822d>\u09F3${ssrInterpolate(unref(totalAmount).toLocaleString())}</span></div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Handled By (Employee)</label><select class="input-glass" data-v-fb25822d><option value="" data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).employeeId) ? ssrLooseContain(unref(form).employeeId, "") : ssrLooseEqual(unref(form).employeeId, "")) ? " selected" : ""}>\u2014 Select employee \u2014</option><!--[-->`);
      ssrRenderList(unref(employees), (e) => {
        _push(`<option${ssrRenderAttr("value", e.id)} data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).employeeId) ? ssrLooseContain(unref(form).employeeId, e.id) : ssrLooseEqual(unref(form).employeeId, e.id)) ? " selected" : ""}>${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Handled By (Free text)</label><input${ssrRenderAttr("value", unref(form).handledBy)} class="input-glass" placeholder="Name if not in list" data-v-fb25822d></div><div class="md:col-span-2 space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Remarks *</label><textarea rows="3" class="input-glass resize-none" placeholder="Describe the expense clearly\u2026" data-v-fb25822d>${ssrInterpolate(unref(form).remarks)}</textarea></div></div></div><div data-v-fb25822d><h3 class="section-title mb-4" data-v-fb25822d>Payment Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-fb25822d><div class="md:col-span-2 space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Payment Method *</label><div class="flex gap-3" data-v-fb25822d><button type="button" class="${ssrRenderClass([
        "flex-1 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2",
        unref(form).method === "cash" ? "bg-green-500/15 border-green-500/50 text-green-300" : "border-white/10 text-gray-500 hover:border-white/20"
      ])}" data-v-fb25822d> \u{1F4B5} Cash / Petty Cash </button><button type="button" class="${ssrRenderClass([
        "flex-1 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2",
        unref(form).method === "bank" ? "bg-blue-500/15 border-blue-500/50 text-blue-300" : "border-white/10 text-gray-500 hover:border-white/20"
      ])}" data-v-fb25822d> \u{1F3E6} Bank / Cheque </button></div></div>`);
      if (unref(form).method === "cash") {
        _push(`<!--[--><div class="md:col-span-2 space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Petty Cash Account *</label><select class="input-glass" data-v-fb25822d><option value="" data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).cashAccountId) ? ssrLooseContain(unref(form).cashAccountId, "") : ssrLooseEqual(unref(form).cashAccountId, "")) ? " selected" : ""}>\u2014 Select petty cash account \u2014</option><!--[-->`);
        ssrRenderList(unref(pettyCashAccounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)} data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).cashAccountId) ? ssrLooseContain(unref(form).cashAccountId, a.id) : ssrLooseEqual(unref(form).cashAccountId, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_name)} `);
          if (a.current_balance !== void 0) {
            _push(`<span data-v-fb25822d> (Balance: \u09F3${ssrInterpolate(Number(a.current_balance).toLocaleString())}) </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</option>`);
        });
        _push(`<!--]--></select>`);
        if (unref(selectedPettyCash) && Number(unref(selectedPettyCash).current_balance) < unref(totalAmount)) {
          _push(`<p class="text-xs text-yellow-400 mt-1" data-v-fb25822d> \u26A0 Petty cash balance (\u09F3${ssrInterpolate(Number(unref(selectedPettyCash).current_balance).toLocaleString())}) is less than this expense amount. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Reference / Receipt No.</label><input${ssrRenderAttr("value", unref(form).paymentReference)} class="input-glass" placeholder="e.g. receipt #, mobile TXN" data-v-fb25822d></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (unref(form).method === "bank") {
        _push(`<!--[--><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Bank Account *</label><select class="input-glass" data-v-fb25822d><option value="" data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).bankAccountId) ? ssrLooseContain(unref(form).bankAccountId, "") : ssrLooseEqual(unref(form).bankAccountId, "")) ? " selected" : ""}>\u2014 Select bank account \u2014</option><!--[-->`);
        ssrRenderList(unref(bankAccounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)} data-v-fb25822d${ssrIncludeBooleanAttr(Array.isArray(unref(form).bankAccountId) ? ssrLooseContain(unref(form).bankAccountId, a.id) : ssrLooseEqual(unref(form).bankAccountId, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2013 ${ssrInterpolate(a.account_name)} (${ssrInterpolate(a.account_number)}) </option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5" data-v-fb25822d><label class="field-label" data-v-fb25822d>Cheque / Transaction Ref.</label><input${ssrRenderAttr("value", unref(form).paymentReference)} class="input-glass" placeholder="Cheque # or TXN ID" data-v-fb25822d></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="flex justify-end gap-3 pt-2 border-t border-white/5" data-v-fb25822d>`);
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
      _push(`<button${ssrIncludeBooleanAttr(unref(submitting) || !unref(isValid)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" data-v-fb25822d>`);
      if (unref(submitting)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-fb25822d><circle cx="12" cy="12" r="10" stroke-opacity=".25" data-v-fb25822d></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" data-v-fb25822d></path></svg>`);
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
const create = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-fb25822d"]]);

export { create as default };
//# sourceMappingURL=create-B24E5tjM.mjs.map
