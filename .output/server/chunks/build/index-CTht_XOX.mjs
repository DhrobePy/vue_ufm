import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const showAddModal = ref(false);
    const saving = ref(false);
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
    const newAccount = reactive({
      bank_name: "",
      account_name: "",
      branch_name: "",
      account_number: "",
      account_type: "Current",
      opening_balance: 0
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-2872eb4b>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Bank Accounts",
        subtitle: "All registered company bank accounts",
        breadcrumb: ["Bank", "Accounts"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-2872eb4b${_scopeId}>+ Add Account</button>`);
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
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-v-2872eb4b><!--[-->`);
        ssrRenderList(3, (i) => {
          _push(`<div class="glass-card p-5 h-48 animate-pulse" data-v-2872eb4b></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-v-2872eb4b><!--[-->`);
        ssrRenderList(unref(accounts), (acc, idx) => {
          var _a;
          _push(`<div class="glass-card-hover p-5 space-y-4 cursor-pointer" data-v-2872eb4b><div class="flex items-start justify-between" data-v-2872eb4b><div class="flex items-center gap-3" data-v-2872eb4b><div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="${ssrRenderStyle(`background: ${cardColor(idx)}15; border: 1px solid ${cardColor(idx)}30`)}" data-v-2872eb4b> \u{1F3E6} </div><div data-v-2872eb4b><p class="text-sm font-semibold text-gray-200" data-v-2872eb4b>${ssrInterpolate(acc.bank_name)}</p><p class="text-xs text-gray-500" data-v-2872eb4b>${ssrInterpolate(acc.branch_name || "\u2014")}</p></div></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: acc.status
          }, null, _parent));
          _push(`</div><div class="space-y-1.5 text-xs" data-v-2872eb4b><div class="flex justify-between" data-v-2872eb4b><span class="text-gray-600" data-v-2872eb4b>Account No.</span><span class="font-mono text-gray-300" data-v-2872eb4b>${ssrInterpolate(acc.account_number)}</span></div><div class="flex justify-between" data-v-2872eb4b><span class="text-gray-600" data-v-2872eb4b>Account Type</span><span class="text-gray-400" data-v-2872eb4b>${ssrInterpolate(acc.account_type)}</span></div><div class="flex justify-between" data-v-2872eb4b><span class="text-gray-600" data-v-2872eb4b>Currency</span><span class="text-gray-400" data-v-2872eb4b>BDT</span></div></div><div class="border-t border-white/[0.06] pt-3" data-v-2872eb4b><p class="text-xs text-gray-600 mb-0.5" data-v-2872eb4b>Current Balance</p><p class="text-xl font-bold font-mono" style="${ssrRenderStyle(`color: ${cardColor(idx)}`)}" data-v-2872eb4b>\u09F3${ssrInterpolate(Number((_a = acc.balance) != null ? _a : 0).toLocaleString())}</p></div><div class="flex gap-2" data-v-2872eb4b>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/bank/statement",
            class: "btn-ghost text-xs flex-1 justify-center"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Statement`);
              } else {
                return [
                  createTextVNode("Statement")
                ];
              }
            }),
            _: 2
          }, _parent));
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
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`<div class="glass-card p-5" data-v-2872eb4b><div class="flex items-center justify-between" data-v-2872eb4b><div data-v-2872eb4b><p class="text-sm text-gray-500" data-v-2872eb4b>Total Cash + Bank Balance</p><p class="text-3xl font-bold text-gold-400 mt-1" data-v-2872eb4b>\u09F3${ssrInterpolate(unref(totalBalance).toLocaleString())}</p></div><div class="text-right" data-v-2872eb4b><p class="text-xs text-gray-600" data-v-2872eb4b>${ssrInterpolate(unref(accounts).length)} account${ssrInterpolate(unref(accounts).length !== 1 ? "s" : "")}</p><p class="text-xs text-gray-400" data-v-2872eb4b>Live from database</p></div></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-2872eb4b><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-2872eb4b><div class="flex items-center justify-between" data-v-2872eb4b><h3 class="text-lg font-bold text-gray-100" data-v-2872eb4b>Add Bank Account</h3><button class="text-gray-500 hover:text-gray-200" data-v-2872eb4b>\u2715</button></div><div class="grid grid-cols-1 gap-4" data-v-2872eb4b><div class="space-y-1.5" data-v-2872eb4b><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-2872eb4b>Bank Name *</label><input${ssrRenderAttr("value", unref(newAccount).bank_name)} type="text" class="input-glass" placeholder="e.g. Islami Bank Bangladesh" data-v-2872eb4b></div><div class="space-y-1.5" data-v-2872eb4b><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-2872eb4b>Account Name</label><input${ssrRenderAttr("value", unref(newAccount).account_name)} type="text" class="input-glass" placeholder="e.g. Main Operating Account" data-v-2872eb4b></div><div class="space-y-1.5" data-v-2872eb4b><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-2872eb4b>Branch</label><input${ssrRenderAttr("value", unref(newAccount).branch_name)} type="text" class="input-glass" placeholder="e.g. Sirajgonj Branch" data-v-2872eb4b></div><div class="space-y-1.5" data-v-2872eb4b><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-2872eb4b>Account No. *</label><input${ssrRenderAttr("value", unref(newAccount).account_number)} type="text" class="input-glass font-mono" data-v-2872eb4b></div><div class="space-y-1.5" data-v-2872eb4b><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-2872eb4b>Account Type</label><select class="input-glass" data-v-2872eb4b><option value="Current" data-v-2872eb4b${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "Current") : ssrLooseEqual(unref(newAccount).account_type, "Current")) ? " selected" : ""}>Current Account</option><option value="Savings" data-v-2872eb4b${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "Savings") : ssrLooseEqual(unref(newAccount).account_type, "Savings")) ? " selected" : ""}>Savings Account</option><option value="Cash" data-v-2872eb4b${ssrIncludeBooleanAttr(Array.isArray(unref(newAccount).account_type) ? ssrLooseContain(unref(newAccount).account_type, "Cash") : ssrLooseEqual(unref(newAccount).account_type, "Cash")) ? " selected" : ""}>Cash</option></select></div><div class="space-y-1.5" data-v-2872eb4b><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-2872eb4b>Opening Balance (\u09F3)</label><input${ssrRenderAttr("value", unref(newAccount).opening_balance)} type="number" class="input-glass font-mono" data-v-2872eb4b></div></div><div class="flex gap-3 pt-2" data-v-2872eb4b><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1" data-v-2872eb4b>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Add Account")}</button><button class="btn-ghost text-xs" data-v-2872eb4b>Cancel</button></div></div></div>`);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2872eb4b"]]);

export { index as default };
//# sourceMappingURL=index-CTht_XOX.mjs.map
