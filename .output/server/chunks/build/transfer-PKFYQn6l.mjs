import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
  __name: "transfer",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: coaData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/coa",
      "$7P7u4xkZop"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = coaData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const accountGroups = computed(() => {
      var _a;
      const groups = {};
      for (const a of allAccounts.value) {
        const g = (_a = a.account_type_group) != null ? _a : "Other";
        if (!groups[g]) groups[g] = [];
        groups[g].push(a);
      }
      return Object.entries(groups).map(([label, accounts]) => ({ label, accounts }));
    });
    const form = reactive({
      from: "",
      to: "",
      amount: null,
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      narration: ""
    });
    const saving = ref(false);
    const isValid = computed(
      () => form.from && form.to && form.from !== form.to && form.amount && form.amount > 0 && form.narration
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Account Transfer",
        subtitle: "Transfer between ledger accounts",
        breadcrumb: ["Accounts", "Transfer"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/accounts/journal/create",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Use Journal Entry`);
                } else {
                  return [
                    createTextVNode("\u2190 Use Journal Entry")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/accounts/journal/create",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Use Journal Entry")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-6 space-y-4"><h3 class="section-title">Ledger Account Transfer</h3><p class="text-sm text-gray-400">Use this form to transfer a balance between two ledger accounts (e.g. re-classify an expense or move a prepayment).</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">From Account *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).from) ? ssrLooseContain(unref(form).from, "") : ssrLooseEqual(unref(form).from, "")) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
      ssrRenderList(unref(accountGroups), (g) => {
        _push(`<optgroup${ssrRenderAttr("label", g.label)}><!--[-->`);
        ssrRenderList(g.accounts, (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).from) ? ssrLooseContain(unref(form).from, a.id) : ssrLooseEqual(unref(form).from, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_number)} \u2014 ${ssrInterpolate(a.name)}</option>`);
        });
        _push(`<!--]--></optgroup>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">To Account *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).to) ? ssrLooseContain(unref(form).to, "") : ssrLooseEqual(unref(form).to, "")) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
      ssrRenderList(unref(accountGroups), (g) => {
        _push(`<optgroup${ssrRenderAttr("label", g.label)}><!--[-->`);
        ssrRenderList(g.accounts, (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).to) ? ssrLooseContain(unref(form).to, a.id) : ssrLooseEqual(unref(form).to, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_number)} \u2014 ${ssrInterpolate(a.name)}</option>`);
        });
        _push(`<!--]--></optgroup>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (\u09F3) *</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">\u09F3</span><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="1" class="input-glass pl-8 font-mono font-bold" placeholder="0"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass"></div><div class="space-y-1.5 sm:col-span-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Narration *</label><input${ssrRenderAttr("value", unref(form).narration)} type="text" class="input-glass" placeholder="Reason for transfer / re-classification"></div></div><div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">${ssrInterpolate(unref(saving) ? "Posting\u2026" : "Post Transfer")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/accounts",
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
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/transfer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=transfer-PKFYQn6l.mjs.map
