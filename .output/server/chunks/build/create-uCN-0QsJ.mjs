import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: coaData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/coa",
      "$5kS4xBt6eW"
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
        groups[g].push({ id: a.id, code: a.account_number, name: a.name });
      }
      return Object.entries(groups).map(([label, accounts]) => ({ label, accounts }));
    });
    const form = reactive({
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      reference: "",
      type: "general",
      description: "",
      lines: [
        { account_id: "", description: "", debit: 0, credit: 0 },
        { account_id: "", description: "", debit: 0, credit: 0 }
      ]
    });
    const saving = ref(false);
    const totalDebits = computed(() => form.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0));
    const totalCredits = computed(() => form.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0));
    const isBalanced = computed(() => totalDebits.value > 0 && Math.abs(totalDebits.value - totalCredits.value) < 0.01);
    const isValid = computed(
      () => form.description && form.date && isBalanced.value && form.lines.every((l) => l.account_id)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "New Journal Entry",
        subtitle: "Post a double-entry transaction to the general ledger",
        breadcrumb: ["Accounts", "Journal", "New Entry"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/accounts/journal",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All Entries`);
                } else {
                  return [
                    createTextVNode("\u2190 All Entries")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/accounts/journal",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All Entries")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-6 space-y-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference</label><input${ssrRenderAttr("value", unref(form).reference)} type="text" class="input-glass font-mono" placeholder="Auto-generated if blank"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entry Type</label><select class="input-glass"><option value="general"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "general") : ssrLooseEqual(unref(form).type, "general")) ? " selected" : ""}>General Journal</option><option value="adjustment"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "adjustment") : ssrLooseEqual(unref(form).type, "adjustment")) ? " selected" : ""}>Adjustment</option><option value="opening"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "opening") : ssrLooseEqual(unref(form).type, "opening")) ? " selected" : ""}>Opening Balance</option><option value="closing"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "closing") : ssrLooseEqual(unref(form).type, "closing")) ? " selected" : ""}>Closing Entry</option></select></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description / Narration *</label><input${ssrRenderAttr("value", unref(form).description)} type="text" class="input-glass" placeholder="Describe the transaction\u2026"></div><div><div class="flex items-center justify-between mb-3"><h3 class="text-sm font-semibold text-gray-300">Journal Lines</h3><button class="text-xs px-3 py-1 rounded-lg border border-white/10 text-gray-400 hover:text-gold-400 hover:border-gold-500/40 transition-all">+ Add Line</button></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider w-[35%]">Account</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider w-32">Debit (\u09F3)</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider w-32">Credit (\u09F3)</th><th class="pb-2 px-3 w-8"></th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
      ssrRenderList(unref(form).lines, (line, i) => {
        _push(`<tr><td class="py-2 px-3"><select class="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"><option value=""${ssrIncludeBooleanAttr(Array.isArray(line.account_id) ? ssrLooseContain(line.account_id, "") : ssrLooseEqual(line.account_id, "")) ? " selected" : ""}>\u2014 Select account \u2014</option><!--[-->`);
        ssrRenderList(unref(accountGroups), (g) => {
          _push(`<optgroup${ssrRenderAttr("label", g.label)}><!--[-->`);
          ssrRenderList(g.accounts, (a) => {
            _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(line.account_id) ? ssrLooseContain(line.account_id, a.id) : ssrLooseEqual(line.account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.code)} \u2014 ${ssrInterpolate(a.name)}</option>`);
          });
          _push(`<!--]--></optgroup>`);
        });
        _push(`<!--]--></select></td><td class="py-2 px-3"><input${ssrRenderAttr("value", line.description)} type="text" placeholder="Optional\u2026" class="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"></td><td class="py-2 px-3"><input${ssrRenderAttr("value", line.debit)} type="number" min="0" class="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-right font-mono text-red-300 focus:outline-none focus:ring-1 focus:ring-red-500/50"></td><td class="py-2 px-3"><input${ssrRenderAttr("value", line.credit)} type="number" min="0" class="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-right font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"></td><td class="py-2 px-3 text-center">`);
        if (unref(form).lines.length > 2) {
          _push(`<button class="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all mx-auto"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"></path></svg></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody><tfoot class="border-t border-white/[0.08]"><tr><td colspan="2" class="pt-3 px-3 text-right text-gray-600 font-semibold">Totals</td><td class="pt-3 px-3 text-right font-bold font-mono text-red-400">\u09F3${ssrInterpolate(unref(totalDebits).toLocaleString())}</td><td class="pt-3 px-3 text-right font-bold font-mono text-emerald-400">\u09F3${ssrInterpolate(unref(totalCredits).toLocaleString())}</td><td></td></tr>`);
      if (!unref(isBalanced)) {
        _push(`<tr><td colspan="5" class="pt-1 px-3 text-right text-xs text-red-400">\u26A0 Difference: \u09F3${ssrInterpolate(Math.abs(unref(totalDebits) - unref(totalCredits)).toLocaleString())} \u2014 must balance before posting</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tfoot></table></div><div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Posting\u2026" : "Post Entry")}</button><button class="btn-ghost">Save Draft</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/accounts/journal",
        class: "btn-ghost text-gray-500"
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
      if (unref(isBalanced) && unref(form).lines.some((l) => l.account_id)) {
        _push(`<div class="ml-auto flex items-center gap-1.5 text-xs text-emerald-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Balanced </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/journal/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-uCN-0QsJ.mjs.map
