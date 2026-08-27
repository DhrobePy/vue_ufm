import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, reactive, watch, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { c as _export_sfc, k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
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
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const route = useRoute();
    const expenseId = computed(() => Number(route.params.id));
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/expenses/${expenseId.value}`,
      "$AeUaL3MYeD"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const exp = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.expense) != null ? _b : null;
    });
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
        "$MN1CQWXjX-"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/branches",
        "$cMspGsOc6r"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/bank-accounts",
        "$pOlGb987NZ"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/hr/employees",
        "$1369hD3zvY"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/expenses/petty-cash-accounts",
        "$Am5vdht7ZC"
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
    const selectedCategory = computed(() => {
      var _a;
      return (_a = categories.value.find((c) => c.id === form.categoryId)) != null ? _a : null;
    });
    const form = reactive({
      date: "",
      categoryId: "",
      subcategoryId: "",
      qty: null,
      unitCost: null,
      totalOverride: 0,
      method: "cash",
      bankAccountId: "",
      cashAccountId: "",
      paymentReference: "",
      employeeId: "",
      handledBy: "",
      branchId: "",
      remarks: ""
    });
    watch(exp, (e) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      if (!e) return;
      Object.assign(form, {
        date: String(e.expense_date).slice(0, 10),
        categoryId: (_a = e.category_id) != null ? _a : "",
        subcategoryId: (_b = e.subcategory_id) != null ? _b : "",
        qty: e.unit_quantity != null ? Number(e.unit_quantity) : null,
        unitCost: e.per_unit_cost != null ? Number(e.per_unit_cost) : null,
        totalOverride: Number(e.total_amount),
        method: (_c = e.payment_method) != null ? _c : "cash",
        bankAccountId: (_d = e.bank_account_id) != null ? _d : "",
        cashAccountId: (_e = e.cash_account_id) != null ? _e : "",
        paymentReference: (_f = e.payment_reference) != null ? _f : "",
        employeeId: (_g = e.employee_id) != null ? _g : "",
        handledBy: (_h = e.handled_by_person) != null ? _h : "",
        branchId: (_i = e.branch_id) != null ? _i : "",
        remarks: (_j = e.remarks) != null ? _j : ""
      });
    }, { immediate: true });
    const computedTotal = computed(() => {
      var _a, _b;
      const qty = (_a = form.qty) != null ? _a : 0, cost = (_b = form.unitCost) != null ? _b : 0;
      return qty && cost ? qty * cost : form.totalOverride;
    });
    watch([() => form.qty, () => form.unitCost], () => {
      if (form.qty && form.unitCost) form.totalOverride = form.qty * form.unitCost;
    });
    const isValid = computed(() => {
      if (!form.date || !form.categoryId || !form.subcategoryId || !form.remarks.trim()) return false;
      if (form.method === "bank" && !form.bankAccountId) return false;
      if (form.method === "cash" && !form.cashAccountId) return false;
      if (computedTotal.value <= 0) return false;
      return true;
    });
    const submitting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl" }, _attrs))} data-v-23006f1c>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Edit ${(_b = (_a = unref(exp)) == null ? void 0 : _a.voucher_number) != null ? _b : "Expense"}`,
        breadcrumb: ["Expenses", (_d = (_c = unref(exp)) == null ? void 0 : _c.voucher_number) != null ? _d : "", "Edit"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-23006f1c>Loading\u2026</div>`);
      } else if (!unref(exp)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-23006f1c>Expense not found.</div>`);
      } else if (unref(exp).status !== "pending") {
        _push(`<div class="glass-card p-6 text-center text-orange-400 text-sm" data-v-23006f1c> This voucher is &quot;${ssrInterpolate(unref(exp).status)}&quot; \u2014 only pending vouchers can be edited. </div>`);
      } else {
        _push(`<div class="glass-card p-6 space-y-6" data-v-23006f1c><div data-v-23006f1c><h3 class="section-title mb-4" data-v-23006f1c>Expense Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-23006f1c><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass" data-v-23006f1c></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Branch</label><select class="input-glass" data-v-23006f1c><option value="" data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "") : ssrLooseEqual(unref(form).branchId, "")) ? " selected" : ""}>\u2014 Select branch \u2014</option><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          _push(`<option${ssrRenderAttr("value", b.id)} data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, b.id) : ssrLooseEqual(unref(form).branchId, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Category *</label><select class="input-glass" data-v-23006f1c><option value="" data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).categoryId) ? ssrLooseContain(unref(form).categoryId, "") : ssrLooseEqual(unref(form).categoryId, "")) ? " selected" : ""}>Select category\u2026</option><!--[-->`);
        ssrRenderList(unref(categories), (c) => {
          _push(`<option${ssrRenderAttr("value", c.id)} data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).categoryId) ? ssrLooseContain(unref(form).categoryId, c.id) : ssrLooseEqual(unref(form).categoryId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Sub-category *</label><select class="input-glass"${ssrIncludeBooleanAttr(!((_f = (_e = unref(selectedCategory)) == null ? void 0 : _e.subcategories) == null ? void 0 : _f.length)) ? " disabled" : ""} data-v-23006f1c><option value="" data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).subcategoryId) ? ssrLooseContain(unref(form).subcategoryId, "") : ssrLooseEqual(unref(form).subcategoryId, "")) ? " selected" : ""}>\u2014 Select sub-category \u2014</option><!--[-->`);
        ssrRenderList((_h = (_g = unref(selectedCategory)) == null ? void 0 : _g.subcategories) != null ? _h : [], (s) => {
          _push(`<option${ssrRenderAttr("value", s.id)} data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).subcategoryId) ? ssrLooseContain(unref(form).subcategoryId, s.id) : ssrLooseEqual(unref(form).subcategoryId, s.id)) ? " selected" : ""}>${ssrInterpolate(s.name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Unit Quantity</label><input${ssrRenderAttr("value", unref(form).qty)} type="number" min="0" step="0.01" class="input-glass" data-v-23006f1c></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Per Unit Cost (\u09F3)</label><input${ssrRenderAttr("value", unref(form).unitCost)} type="number" min="0" step="0.01" class="input-glass" data-v-23006f1c></div><div class="md:col-span-2 p-4 rounded-xl flex justify-between items-center" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border": "1px solid rgba(245,158,11,0.15)" })}" data-v-23006f1c><span class="text-xs text-gray-500" data-v-23006f1c>Total Amount</span><input${ssrRenderAttr("value", unref(form).totalOverride)} type="number" min="0" step="0.01" class="font-bold text-gold-400 text-2xl font-mono bg-transparent text-right w-40 outline-none" data-v-23006f1c></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Handled By (Employee)</label><select class="input-glass" data-v-23006f1c><option value="" data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).employeeId) ? ssrLooseContain(unref(form).employeeId, "") : ssrLooseEqual(unref(form).employeeId, "")) ? " selected" : ""}>\u2014 Select employee \u2014</option><!--[-->`);
        ssrRenderList(unref(employees), (e) => {
          _push(`<option${ssrRenderAttr("value", e.id)} data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).employeeId) ? ssrLooseContain(unref(form).employeeId, e.id) : ssrLooseEqual(unref(form).employeeId, e.id)) ? " selected" : ""}>${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Handled By (Free text)</label><input${ssrRenderAttr("value", unref(form).handledBy)} class="input-glass" data-v-23006f1c></div><div class="md:col-span-2 space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Remarks *</label><textarea rows="3" class="input-glass resize-none" data-v-23006f1c>${ssrInterpolate(unref(form).remarks)}</textarea></div></div></div><div data-v-23006f1c><h3 class="section-title mb-4" data-v-23006f1c>Payment Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4" data-v-23006f1c><div class="md:col-span-2 space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Payment Method *</label><div class="flex gap-3" data-v-23006f1c><button type="button" class="${ssrRenderClass([
          "flex-1 py-3 rounded-xl border text-sm font-semibold transition-all",
          unref(form).method === "cash" ? "bg-green-500/15 border-green-500/50 text-green-300" : "border-white/10 text-gray-500 hover:border-white/20"
        ])}" data-v-23006f1c> \u{1F4B5} Cash / Petty Cash </button><button type="button" class="${ssrRenderClass([
          "flex-1 py-3 rounded-xl border text-sm font-semibold transition-all",
          unref(form).method === "bank" ? "bg-blue-500/15 border-blue-500/50 text-blue-300" : "border-white/10 text-gray-500 hover:border-white/20"
        ])}" data-v-23006f1c> \u{1F3E6} Bank / Cheque </button></div></div>`);
        if (unref(form).method === "cash") {
          _push(`<!--[--><div class="md:col-span-2 space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Petty Cash Account *</label><select class="input-glass" data-v-23006f1c><option value="" data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).cashAccountId) ? ssrLooseContain(unref(form).cashAccountId, "") : ssrLooseEqual(unref(form).cashAccountId, "")) ? " selected" : ""}>\u2014 Select petty cash account \u2014</option><!--[-->`);
          ssrRenderList(unref(pettyCashAccounts), (a) => {
            _push(`<option${ssrRenderAttr("value", a.id)} data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).cashAccountId) ? ssrLooseContain(unref(form).cashAccountId, a.id) : ssrLooseEqual(unref(form).cashAccountId, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_name)} (\u09F3${ssrInterpolate(Number(a.current_balance).toLocaleString())})</option>`);
          });
          _push(`<!--]--></select></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Reference / Receipt No.</label><input${ssrRenderAttr("value", unref(form).paymentReference)} class="input-glass" data-v-23006f1c></div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        if (unref(form).method === "bank") {
          _push(`<!--[--><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Bank Account *</label><select class="input-glass" data-v-23006f1c><option value="" data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).bankAccountId) ? ssrLooseContain(unref(form).bankAccountId, "") : ssrLooseEqual(unref(form).bankAccountId, "")) ? " selected" : ""}>\u2014 Select bank account \u2014</option><!--[-->`);
          ssrRenderList(unref(bankAccounts), (a) => {
            _push(`<option${ssrRenderAttr("value", a.id)} data-v-23006f1c${ssrIncludeBooleanAttr(Array.isArray(unref(form).bankAccountId) ? ssrLooseContain(unref(form).bankAccountId, a.id) : ssrLooseEqual(unref(form).bankAccountId, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2013 ${ssrInterpolate(a.account_name)} (${ssrInterpolate(a.account_number)})</option>`);
          });
          _push(`<!--]--></select></div><div class="space-y-1.5" data-v-23006f1c><label class="field-label" data-v-23006f1c>Cheque / Transaction Ref.</label><input${ssrRenderAttr("value", unref(form).paymentReference)} class="input-glass" data-v-23006f1c></div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="flex justify-end gap-3 pt-2 border-t border-white/5" data-v-23006f1c>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/expenses/${unref(exp).id}`,
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
        _push(`<button${ssrIncludeBooleanAttr(unref(submitting) || !unref(isValid)) ? " disabled" : ""} class="btn-gold disabled:opacity-50" data-v-23006f1c>${ssrInterpolate(unref(submitting) ? "Saving\u2026" : "Save Changes")}</button></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const edit = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-23006f1c"]]);

export { edit as default };
//# sourceMappingURL=edit-cjD0vrIH.mjs.map
