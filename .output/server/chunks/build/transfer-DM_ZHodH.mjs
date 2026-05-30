import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "transfer",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: acctData, pending: acctPending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/dashboard",
      "$ZZ5Lei8PWp"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const accounts = computed(() => {
      var _a, _b;
      return (_b = (_a = acctData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const form = reactive({
      fromAccount: null,
      toAccount: null,
      amount: null,
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      reference: "",
      notes: ""
    });
    const saving = ref(false);
    const fromAccountData = computed(
      () => {
        var _a;
        return form.fromAccount ? (_a = accounts.value.find((a) => a.id === form.fromAccount)) != null ? _a : null : null;
      }
    );
    const isValid = computed(
      () => {
        var _a;
        return form.fromAccount && form.toAccount && form.fromAccount !== form.toAccount && form.amount && Number(form.amount) > 0 && Number(form.amount) <= Number(((_a = fromAccountData.value) == null ? void 0 : _a.balance) || 0);
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Inter-Bank Transfer",
        subtitle: "Transfer funds between company bank accounts",
        breadcrumb: ["Bank", "Transfer"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/bank",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Bank Dashboard`);
                } else {
                  return [
                    createTextVNode("\u2190 Bank Dashboard")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/bank",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Bank Dashboard")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(acctPending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading accounts\u2026</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Transfer Details</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">From Account *</label><select class="field-input"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).fromAccount) ? ssrLooseContain(unref(form).fromAccount, null) : ssrLooseEqual(unref(form).fromAccount, null)) ? " selected" : ""}>\u2014 Select source account \u2014</option><!--[-->`);
        ssrRenderList(unref(accounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).fromAccount) ? ssrLooseContain(unref(form).fromAccount, a.id) : ssrLooseEqual(unref(form).fromAccount, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)} \xB7 Balance: \u09F3${ssrInterpolate(Number(a.balance || 0).toLocaleString())}</option>`);
        });
        _push(`<!--]--></select>`);
        if (unref(fromAccountData)) {
          _push(`<p class="text-xs text-gray-500"> Available: <span class="font-semibold text-gray-300">\u09F3${ssrInterpolate(Number(unref(fromAccountData).balance || 0).toLocaleString())}</span></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex justify-center"><button class="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-gray-500 hover:text-gold-400 hover:border-gold-500/40 transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"></path></svg></button></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">To Account *</label><select class="field-input"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).toAccount) ? ssrLooseContain(unref(form).toAccount, null) : ssrLooseEqual(unref(form).toAccount, null)) ? " selected" : ""}>\u2014 Select destination account \u2014</option><!--[-->`);
        ssrRenderList(unref(accounts).filter((a) => a.id !== unref(form).fromAccount), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).toAccount) ? ssrLooseContain(unref(form).toAccount, a.id) : ssrLooseEqual(unref(form).toAccount, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount *</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">\u09F3</span><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="1" class="field-input pl-8 font-mono text-lg font-bold" placeholder="0"></div>`);
        if (unref(form).amount && unref(fromAccountData) && Number(unref(form).amount) > Number(unref(fromAccountData).balance || 0)) {
          _push(`<p class="text-xs text-red-400">\u26A0 Amount exceeds available balance</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transfer Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="field-input"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference No.</label><input${ssrRenderAttr("value", unref(form).reference)} type="text" class="field-input font-mono" placeholder="BEFTN / IFT ref."></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purpose / Notes</label><textarea rows="3" class="field-input resize-none" placeholder="Why is this transfer being made?">${ssrInterpolate(unref(form).notes)}</textarea></div><div class="flex items-center gap-3"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
        } else {
          _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"></path></svg>`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Processing\u2026" : "Submit Transfer")}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/bank",
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
        _push(`</div></div></div><div class="space-y-5"><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Account Balances</h3><!--[-->`);
        ssrRenderList(unref(accounts), (a) => {
          _push(`<div class="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0"><div><p class="text-xs font-medium text-gray-300">${ssrInterpolate(a.bank_name)}</p><p class="text-[11px] text-gray-600 font-mono">${ssrInterpolate(a.account_number)}</p></div><span class="font-mono text-xs font-bold text-gray-200">\u09F3${ssrInterpolate(Number(a.balance || 0).toLocaleString())}</span></div>`);
        });
        _push(`<!--]--></div><div class="glass-card p-5 space-y-2 text-xs text-gray-500"><p class="font-semibold text-gray-400">Note</p><p>Transfers are submitted for approval. Balances will update after a maker-checker approves the transaction.</p></div></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bank/transfer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=transfer-DM_ZHodH.mjs.map
