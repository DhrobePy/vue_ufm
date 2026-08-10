import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: coaData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/coa",
      "$PJG7ZJ1Bak"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = coaData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const expenseAccountGroups = computed(() => {
      var _a, _b;
      const groups = {};
      for (const a of allAccounts.value) {
        if (!["Expense", "Liability"].includes((_a = a.account_type_group) != null ? _a : "")) continue;
        const g = (_b = a.account_type_group) != null ? _b : "Other";
        if (!groups[g]) groups[g] = [];
        groups[g].push(a);
      }
      return Object.entries(groups).map(([label, accounts]) => ({ label, accounts }));
    });
    const paymentAccounts = computed(
      () => allAccounts.value.filter((a) => a.account_type_group === "Asset")
    );
    const form = reactive({
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      method: "cash",
      payTo: "",
      expense_account_id: "",
      payment_account_id: "",
      amount: null,
      purpose: "",
      reference_number: ""
    });
    const saving = ref(false);
    const isValid = computed(
      () => form.date && form.payTo && form.expense_account_id && form.payment_account_id && form.amount && form.amount > 0 && form.purpose
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "New Debit Voucher",
        subtitle: "Authorise a cash / bank payment",
        breadcrumb: ["Accounts", "Voucher", "New"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/accounts/voucher",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All Vouchers`);
                } else {
                  return [
                    createTextVNode("\u2190 All Vouchers")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/accounts/voucher",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All Vouchers")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-6 space-y-5"><h3 class="section-title">Voucher Details</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Voucher Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method *</label><select class="input-glass"><option value="cash"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "cash") : ssrLooseEqual(unref(form).method, "cash")) ? " selected" : ""}>Cash</option><option value="bank"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "bank") : ssrLooseEqual(unref(form).method, "bank")) ? " selected" : ""}>Bank Transfer / Cheque</option><option value="bkash"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "bkash") : ssrLooseEqual(unref(form).method, "bkash")) ? " selected" : ""}>bKash</option><option value="nagad"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "nagad") : ssrLooseEqual(unref(form).method, "nagad")) ? " selected" : ""}>Nagad</option></select></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pay To *</label><input${ssrRenderAttr("value", unref(form).payTo)} type="text" class="input-glass" placeholder="Payee name or company"></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Expense Account *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).expense_account_id) ? ssrLooseContain(unref(form).expense_account_id, "") : ssrLooseEqual(unref(form).expense_account_id, "")) ? " selected" : ""}>\u2014 Select expense account \u2014</option><!--[-->`);
      ssrRenderList(unref(expenseAccountGroups), (g) => {
        _push(`<optgroup${ssrRenderAttr("label", g.label)}><!--[-->`);
        ssrRenderList(g.accounts, (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).expense_account_id) ? ssrLooseContain(unref(form).expense_account_id, a.id) : ssrLooseEqual(unref(form).expense_account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_number)} \u2014 ${ssrInterpolate(a.name)}</option>`);
        });
        _push(`<!--]--></optgroup>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Account (Bank/Cash) *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_account_id) ? ssrLooseContain(unref(form).payment_account_id, "") : ssrLooseEqual(unref(form).payment_account_id, "")) ? " selected" : ""}>\u2014 Select payment account \u2014</option><!--[-->`);
      ssrRenderList(unref(paymentAccounts), (a) => {
        _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_account_id) ? ssrLooseContain(unref(form).payment_account_id, a.id) : ssrLooseEqual(unref(form).payment_account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_number)} \u2014 ${ssrInterpolate(a.name)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (\u09F3) *</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">\u09F3</span><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="1" class="input-glass pl-8 font-mono text-lg font-bold" placeholder="0"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purpose / Narration *</label><textarea rows="3" class="input-glass resize-none" placeholder="Describe what this payment is for\u2026">${ssrInterpolate(unref(form).purpose)}</textarea></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cheque / Reference No.</label><input${ssrRenderAttr("value", unref(form).reference_number)} type="text" class="input-glass font-mono" placeholder="Cheque #, BEFTN ref., or bill number"></div><div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Creating\u2026" : "Create Voucher")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/accounts/voucher",
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
      _push(`</div></div><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Voucher Preview</h3><div class="rounded-xl border border-white/10 p-4 bg-white/[0.02] space-y-3 text-xs"><div class="text-center border-b border-white/[0.06] pb-3"><p class="font-bold text-gray-200 text-sm">DEBIT VOUCHER</p><p class="text-gray-500 mt-0.5">Ujjal Flour Mills Company</p></div><div class="space-y-1.5"><div class="flex justify-between"><span class="text-gray-600">Date</span><span class="text-gray-300">${ssrInterpolate(unref(form).date || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Pay To</span><span class="text-gray-300">${ssrInterpolate(unref(form).payTo || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Method</span><span class="text-gray-300 capitalize">${ssrInterpolate(unref(form).method)}</span></div><div class="flex justify-between"><span class="text-gray-600">Ref.</span><span class="text-gray-300 font-mono">${ssrInterpolate(unref(form).reference_number || "\u2014")}</span></div></div><div class="border-t border-white/[0.06] pt-3"><div class="flex justify-between items-center"><span class="font-semibold text-gray-300">Amount</span><span class="text-lg font-bold font-mono text-gold-400">\u09F3${ssrInterpolate((unref(form).amount || 0).toLocaleString())}</span></div></div><div class="border-t border-white/[0.06] pt-3 space-y-3"><div class="flex justify-between text-[11px] text-gray-600"><div class="text-center"><div class="h-8 border-b border-dashed border-white/20 w-20"></div><p class="mt-1">Prepared by</p></div><div class="text-center"><div class="h-8 border-b border-dashed border-white/20 w-20"></div><p class="mt-1">Approved by</p></div><div class="text-center"><div class="h-8 border-b border-dashed border-white/20 w-20"></div><p class="mt-1">Received by</p></div></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/voucher/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-BtNPEmzF.mjs.map
