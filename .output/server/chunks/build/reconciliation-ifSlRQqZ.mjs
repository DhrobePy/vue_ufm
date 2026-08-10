import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
  __name: "reconciliation",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const selectedAccount = ref(route.query.account ? Number(route.query.account) : "");
    const onlyUnreconciled = ref(false);
    const togglingId = ref(null);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/reconciliation",
      {
        query: computed(() => ({ account: selectedAccount.value || void 0 }))
      },
      "$oc82GqiMGE"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const accounts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const rows = computed(() => {
      var _a, _b;
      const all = (_b = (_a = data.value) == null ? void 0 : _a.transactions) != null ? _b : [];
      return onlyUnreconciled.value ? all.filter((t) => t.status === "approved" && !t.reconciled_at) : all;
    });
    const varianceClass = computed(() => {
      var _a;
      const v = (_a = data.value) == null ? void 0 : _a.variance;
      if (v === null || v === void 0) return "";
      return Number(v) === 0 ? "border-emerald-500/20" : "border-amber-500/30";
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Bank Reconciliation",
        subtitle: "Bank-module ledger vs. GL books for the same real-world account",
        breadcrumb: ["Bank", "Reconciliation"]
      }, null, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3 items-center"><select class="field-input text-xs py-1.5 min-w-[280px]"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(selectedAccount)) ? ssrLooseContain(unref(selectedAccount), "") : ssrLooseEqual(unref(selectedAccount), "")) ? " selected" : ""}>\u2014 Select Bank Account \u2014</option><!--[-->`);
      ssrRenderList(unref(accounts), (a) => {
        _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedAccount)) ? ssrLooseContain(unref(selectedAccount), a.id) : ssrLooseEqual(unref(selectedAccount), a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)} `);
        if (a.account_number) {
          _push(`<!--[--> (${ssrInterpolate(a.account_number)})<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</option>`);
      });
      _push(`<!--]--></select><label class="flex items-center gap-2 text-xs text-gray-400 ml-auto"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(onlyUnreconciled)) ? ssrLooseContain(unref(onlyUnreconciled), null) : unref(onlyUnreconciled)) ? " checked" : ""} class="accent-gold-500"> Show unreconciled only </label></div>`);
      if (!unref(selectedAccount)) {
        _push(`<div class="glass-card p-14 text-center text-gray-500 text-sm space-y-2"><div class="text-4xl">\u2696\uFE0F</div><p>Select a bank account above to reconcile it</p></div>`);
      } else if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Per Bank Module</p><p class="text-xl font-bold text-gray-100">\u09F3${ssrInterpolate(Number((_b = (_a = unref(data)) == null ? void 0 : _a.bank_module_balance) != null ? _b : 0).toLocaleString())}</p><p class="text-[10px] text-gray-600 mt-0.5">from bank_transactions entries</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Per GL Books</p>`);
        if ((_c = unref(data)) == null ? void 0 : _c.glMatch) {
          _push(`<p class="text-xl font-bold text-gray-100">\u09F3${ssrInterpolate(Number(unref(data).glMatch.balance).toLocaleString())}</p>`);
        } else {
          _push(`<p class="text-sm text-gray-600 mt-1.5">No GL-linked account matches this account number</p>`);
        }
        _push(`</div><div class="${ssrRenderClass([unref(varianceClass), "glass-card p-4"])}"><p class="text-xs text-gray-500 mb-1">Variance</p>`);
        if (((_d = unref(data)) == null ? void 0 : _d.variance) !== null) {
          _push(`<p class="text-xl font-bold">${ssrInterpolate(Number((_e = unref(data)) == null ? void 0 : _e.variance) === 0 ? "\u09F30 \u2713" : `\u09F3${Math.abs(Number((_f = unref(data)) == null ? void 0 : _f.variance)).toLocaleString()} ${Number((_g = unref(data)) == null ? void 0 : _g.variance) > 0 ? "(GL ahead)" : "(Bank ahead)"}`)}</p>`);
        } else {
          _push(`<p class="text-sm text-gray-600 mt-1.5">\u2014</p>`);
        }
        _push(`</div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Unreconciled</p><p class="${ssrRenderClass([((_i = (_h = unref(data)) == null ? void 0 : _h.unreconciled_count) != null ? _i : 0) > 0 ? "text-amber-400" : "text-emerald-400", "text-xl font-bold"])}">${ssrInterpolate((_k = (_j = unref(data)) == null ? void 0 : _j.unreconciled_count) != null ? _k : 0)}</p><p class="text-[10px] text-gray-600 mt-0.5"> net \u09F3${ssrInterpolate(Number((_m = (_l = unref(data)) == null ? void 0 : _l.unreconciled_amount) != null ? _m : 0).toLocaleString())}</p></div></div><div class="glass-card p-5"><div class="overflow-x-auto"><table class="w-full text-xs min-w-[720px]"><thead><tr class="border-b border-white/[0.08]"><th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider w-[100px]">Date</th><th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th><th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider w-[110px]">Status</th><th class="pb-2.5 px-3 text-right text-red-400/70 font-semibold uppercase tracking-wider w-[120px]">Debit</th><th class="pb-2.5 px-3 text-right text-emerald-400/70 font-semibold uppercase tracking-wider w-[120px]">Credit</th><th class="pb-2.5 px-3 text-right text-gray-400/70 font-semibold uppercase tracking-wider w-[130px]">Balance</th><th class="pb-2.5 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider w-[110px]">Reconciled</th></tr></thead><tbody class="divide-y divide-white/[0.03]">`);
        if (!unref(rows).length) {
          _push(`<tr><td colspan="7" class="py-10 text-center text-gray-600">No transactions found</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(rows), (t) => {
          _push(`<tr class="hover:bg-white/[0.025] transition-colors"><td class="py-2.5 px-3 text-gray-500 font-mono whitespace-nowrap">${ssrInterpolate(String(t.transaction_date).slice(0, 10))}</td><td class="py-2.5 px-3 text-gray-300 max-w-[280px]"><span class="leading-snug">${ssrInterpolate(t.description)}</span>`);
          if (t.payee_payer_name) {
            _push(`<span class="text-gray-600 text-[10px] block mt-0.5">${ssrInterpolate(t.payee_payer_name)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="py-2.5 px-3">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: t.status
          }, null, _parent));
          _push(`</td><td class="py-2.5 px-3 text-right font-mono">`);
          if (t.entry_type === "debit") {
            _push(`<span class="text-red-400">\u09F3${ssrInterpolate(Number(t.amount).toLocaleString())}</span>`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="py-2.5 px-3 text-right font-mono">`);
          if (t.entry_type === "credit") {
            _push(`<span class="text-emerald-400">\u09F3${ssrInterpolate(Number(t.amount).toLocaleString())}</span>`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="py-2.5 px-3 text-right font-mono font-semibold text-gray-200">\u09F3${ssrInterpolate(Number(t.balance).toLocaleString())}</td><td class="py-2.5 px-3 text-center">`);
          if (t.status === "approved") {
            _push(`<button${ssrIncludeBooleanAttr(unref(togglingId) === t.id) ? " disabled" : ""} class="${ssrRenderClass([
              "px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors disabled:opacity-40",
              t.reconciled_at ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : "text-gray-500 border-white/[0.1] hover:border-white/[0.2]"
            ])}">${ssrInterpolate(t.reconciled_at ? "\u2713 Cleared" : "Mark Cleared")}</button>`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bank/reconciliation.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reconciliation-ifSlRQqZ.mjs.map
