import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-C6rBgLMJ.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const saving = ref(false);
    ref(null);
    const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];
    const cardColor = (idx) => COLORS[idx % COLORS.length];
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/dashboard",
      "$yM9ESC8Wty"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const accounts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const totalBalance = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = data.value) == null ? void 0 : _a.stats) == null ? void 0 : _b.total_balance) != null ? _c : 0;
    });
    const { data: glData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank-accounts",
      "$yDb__Ni5Rn"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const glAccounts = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = glData.value) == null ? void 0 : _a.accounts) != null ? _b : []).filter((a) => a.chart_of_account_id);
      }
    );
    const newAccount = reactive({
      bank_name: "",
      account_name: "",
      branch_name: "",
      account_number: "",
      account_type: "Checking",
      opening_balance: 0,
      notes: ""
    });
    const editForm = reactive({
      bank_name: "",
      account_name: "",
      branch_name: "",
      account_number: "",
      account_type: "Checking",
      status: "active",
      notes: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-08b33d74>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Bank Accounts",
        subtitle: "All registered company bank accounts",
        breadcrumb: ["Bank", "Accounts"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-08b33d74${_scopeId}>+ Add Account</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: ($event) => showAddModal.value = true,
                class: "btn-gold text-xs"
              }, "+ Add Account", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-v-08b33d74><!--[-->`);
        ssrRenderList(3, (i) => {
          _push(`<div class="glass-card p-5 h-48 animate-pulse" data-v-08b33d74></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-v-08b33d74><!--[-->`);
        ssrRenderList(unref(accounts), (acc, idx) => {
          var _a;
          _push(`<div class="glass-card-hover p-5 space-y-4 cursor-pointer" data-v-08b33d74><div class="flex items-start justify-between" data-v-08b33d74><div class="flex items-center gap-3" data-v-08b33d74><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="${ssrRenderStyle(`background: ${cardColor(idx)}15; border: 1px solid ${cardColor(idx)}30`)}" data-v-08b33d74> \u{1F3E6} </div><div data-v-08b33d74><p class="text-sm font-semibold text-gray-200" data-v-08b33d74>${ssrInterpolate(acc.bank_name)}</p><p class="text-xs text-gray-500" data-v-08b33d74>${ssrInterpolate(acc.branch_name || "\u2014")}</p></div></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: acc.status
          }, null, _parent));
          _push(`</div><div class="space-y-1.5 text-xs" data-v-08b33d74><div class="flex justify-between" data-v-08b33d74><span class="text-gray-600" data-v-08b33d74>Account No.</span><span class="font-mono text-gray-300" data-v-08b33d74>${ssrInterpolate(acc.account_number)}</span></div><div class="flex justify-between" data-v-08b33d74><span class="text-gray-600" data-v-08b33d74>Account Type</span><span class="text-gray-400" data-v-08b33d74>${ssrInterpolate(acc.account_type)}</span></div><div class="flex justify-between" data-v-08b33d74><span class="text-gray-600" data-v-08b33d74>Currency</span><span class="text-gray-400" data-v-08b33d74>BDT</span></div></div><div class="border-t border-white/[0.06] pt-3" data-v-08b33d74><p class="text-xs text-gray-600 mb-0.5" data-v-08b33d74>Current Balance</p><p class="text-xl font-bold font-mono" style="${ssrRenderStyle(`color: ${cardColor(idx)}`)}" data-v-08b33d74>\u09F3${ssrInterpolate(Number((_a = acc.balance) != null ? _a : 0).toLocaleString())}</p></div><div class="flex gap-2" data-v-08b33d74>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/bank/transaction/create",
            class: "btn-ghost text-xs flex-1 justify-center"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Transact`);
              } else {
                return [
                  createTextVNode("Transact")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button class="btn-ghost text-xs px-3" data-v-08b33d74>Edit</button></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      if (unref(glAccounts).length) {
        _push(`<div class="space-y-3" data-v-08b33d74><div class="flex items-center justify-between" data-v-08b33d74><h2 class="section-title" data-v-08b33d74>GL-Linked Accounts</h2><p class="text-xs text-gray-600" data-v-08b33d74>Accounts with journal-entry history \u2014 click Statement to see full passbook</p></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-v-08b33d74><!--[-->`);
        ssrRenderList(unref(glAccounts), (acc, idx) => {
          _push(`<div class="glass-card p-4 space-y-3" data-v-08b33d74><div class="flex items-start justify-between" data-v-08b33d74><div class="flex items-center gap-2.5" data-v-08b33d74><div class="w-9 h-9 rounded-lg flex items-center justify-center text-base" style="${ssrRenderStyle(`background: ${cardColor(idx)}15; border: 1px solid ${cardColor(idx)}30`)}" data-v-08b33d74> \u{1F3E6} </div><div data-v-08b33d74><p class="text-sm font-semibold text-gray-200" data-v-08b33d74>${ssrInterpolate(acc.bank_name)}</p><p class="text-xs text-gray-500" data-v-08b33d74>${ssrInterpolate(acc.account_name)}</p></div></div><span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium" data-v-08b33d74>GL</span></div><p class="text-xs text-gray-600 font-mono" data-v-08b33d74>${ssrInterpolate(acc.account_number || "\u2014")}</p><div class="flex gap-2 pt-1" data-v-08b33d74>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/bank/statement?account=${acc.id}`,
            class: "btn-gold text-[11px] py-1.5 px-3 flex-1 text-center"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u{1F4D2} View Statement `);
              } else {
                return [
                  createTextVNode(" \u{1F4D2} View Statement ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-5" data-v-08b33d74><div class="flex items-center justify-between" data-v-08b33d74><div data-v-08b33d74><p class="text-sm text-gray-500" data-v-08b33d74>Total Cash + Bank Balance</p><p class="text-3xl font-bold text-gold-400 mt-1" data-v-08b33d74>\u09F3${ssrInterpolate(unref(totalBalance).toLocaleString())}</p></div><div class="text-right" data-v-08b33d74><p class="text-xs text-gray-600" data-v-08b33d74>${ssrInterpolate(unref(accounts).length)} account${ssrInterpolate(unref(accounts).length !== 1 ? "s" : "")}</p><p class="text-xs text-gray-400" data-v-08b33d74>Live from database</p></div></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-08b33d74><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-08b33d74><div class="flex items-center justify-between" data-v-08b33d74><h3 class="text-lg font-bold text-gray-100" data-v-08b33d74>Add Bank Account</h3><button class="text-gray-500 hover:text-gray-200" data-v-08b33d74>\u2715</button></div><div class="grid grid-cols-1 gap-4" data-v-08b33d74><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Bank Name *</label><input${ssrRenderAttr("value", unref(newAccount).bank_name)} type="text" class="input-glass" placeholder="e.g. Islami Bank Bangladesh" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Account Name</label><input${ssrRenderAttr("value", unref(newAccount).account_name)} type="text" class="input-glass" placeholder="e.g. Main Operating Account" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Branch</label><input${ssrRenderAttr("value", unref(newAccount).branch_name)} type="text" class="input-glass" placeholder="e.g. Sirajgonj Branch" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Account No. *</label><input${ssrRenderAttr("value", unref(newAccount).account_number)} type="text" class="input-glass font-mono" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Account Type</label><select class="input-glass" data-v-08b33d74><option value="Checking" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "Checking") : ssrLooseEqual(unref(newAccount).account_type, "Checking")) ? " selected" : ""}>Checking / Current</option><option value="Savings" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "Savings") : ssrLooseEqual(unref(newAccount).account_type, "Savings")) ? " selected" : ""}>Savings</option><option value="Loan" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "Loan") : ssrLooseEqual(unref(newAccount).account_type, "Loan")) ? " selected" : ""}>Loan</option><option value="Credit" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "Credit") : ssrLooseEqual(unref(newAccount).account_type, "Credit")) ? " selected" : ""}>Credit</option><option value="FDR" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "FDR") : ssrLooseEqual(unref(newAccount).account_type, "FDR")) ? " selected" : ""}>FDR</option><option value="Other" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "Other") : ssrLooseEqual(unref(newAccount).account_type, "Other")) ? " selected" : ""}>Other / Cash</option></select></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Opening Balance (\u09F3)</label><input${ssrRenderAttr("value", unref(newAccount).opening_balance)} type="number" class="input-glass font-mono" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Notes</label><textarea rows="2" class="input-glass resize-none" placeholder="Optional notes\u2026" data-v-08b33d74>${ssrInterpolate(unref(newAccount).notes)}</textarea></div></div><div class="flex gap-3 pt-2" data-v-08b33d74><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1" data-v-08b33d74>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Add Account")}</button><button class="btn-ghost text-xs" data-v-08b33d74>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showEditModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-08b33d74><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-08b33d74><div class="flex items-center justify-between" data-v-08b33d74><h3 class="text-lg font-bold text-gray-100" data-v-08b33d74>Edit Account</h3><button class="text-gray-500 hover:text-gray-200" data-v-08b33d74>\u2715</button></div><div class="grid grid-cols-1 gap-4" data-v-08b33d74><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Bank Name *</label><input${ssrRenderAttr("value", unref(editForm).bank_name)} class="input-glass" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Account Name</label><input${ssrRenderAttr("value", unref(editForm).account_name)} class="input-glass" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Branch</label><input${ssrRenderAttr("value", unref(editForm).branch_name)} class="input-glass" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Account No.</label><input${ssrRenderAttr("value", unref(editForm).account_number)} class="input-glass font-mono" data-v-08b33d74></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Account Type</label><select class="input-glass" data-v-08b33d74><option value="Checking" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).account_type) ? ssrLooseContain(unref(editForm).account_type, "Checking") : ssrLooseEqual(unref(editForm).account_type, "Checking")) ? " selected" : ""}>Checking / Current</option><option value="Savings" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).account_type) ? ssrLooseContain(unref(editForm).account_type, "Savings") : ssrLooseEqual(unref(editForm).account_type, "Savings")) ? " selected" : ""}>Savings</option><option value="Loan" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).account_type) ? ssrLooseContain(unref(editForm).account_type, "Loan") : ssrLooseEqual(unref(editForm).account_type, "Loan")) ? " selected" : ""}>Loan</option><option value="Credit" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).account_type) ? ssrLooseContain(unref(editForm).account_type, "Credit") : ssrLooseEqual(unref(editForm).account_type, "Credit")) ? " selected" : ""}>Credit</option><option value="FDR" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).account_type) ? ssrLooseContain(unref(editForm).account_type, "FDR") : ssrLooseEqual(unref(editForm).account_type, "FDR")) ? " selected" : ""}>FDR</option><option value="Other" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).account_type) ? ssrLooseContain(unref(editForm).account_type, "Other") : ssrLooseEqual(unref(editForm).account_type, "Other")) ? " selected" : ""}>Other / Cash</option></select></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Status</label><select class="input-glass" data-v-08b33d74><option value="active" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "active") : ssrLooseEqual(unref(editForm).status, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "inactive") : ssrLooseEqual(unref(editForm).status, "inactive")) ? " selected" : ""}>Inactive</option><option value="closed" data-v-08b33d74${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "closed") : ssrLooseEqual(unref(editForm).status, "closed")) ? " selected" : ""}>Closed</option></select></div><div class="space-y-1.5" data-v-08b33d74><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-08b33d74>Notes</label><textarea rows="2" class="input-glass resize-none" data-v-08b33d74>${ssrInterpolate(unref(editForm).notes)}</textarea></div></div><div class="flex gap-3 pt-2" data-v-08b33d74><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1" data-v-08b33d74>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button><button class="btn-ghost text-xs" data-v-08b33d74>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bank/accounts/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-08b33d74"]]);

export { index as default };
//# sourceMappingURL=index-CeD9jzNI.mjs.map
