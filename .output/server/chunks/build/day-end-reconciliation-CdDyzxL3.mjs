import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
  __name: "day-end-reconciliation",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const date = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/day-end-reconciliation",
      {
        query: computed(() => ({ date: date.value }))
      },
      "$8_ov8klND3"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    function varClass(v) {
      if (v === null) return "text-gray-500";
      if (Math.abs(v) < 0.5) return "text-emerald-400";
      return "text-red-400";
    }
    function fmtVar(v) {
      if (v === null) return "\u2014";
      return (v >= 0 ? "+" : "") + "\u09F3" + v.toLocaleString();
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Day-End Reconciliation",
        subtitle: "Bank + Petty Cash + AR + AP, side by side \u2014 read-only diagnostic",
        breadcrumb: ["Accounts", "Day-End Reconciliation"]
      }, null, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap items-center gap-3"><label class="text-xs text-gray-500">Date</label><input${ssrRenderAttr("value", unref(date))} type="date" class="input-glass w-auto text-xs"><button class="btn-ghost text-xs">\u21BB Refresh</button>`);
      if (unref(data) && !unref(data).is_today) {
        _push(`<span class="text-[11px] text-amber-400 ml-2"> \u26A0 Petty Cash / AP cached balances are always live \u2014 only the ledger/GL sides are cut off at this date. </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="glass-card p-5"><h3 class="section-title mb-4">\u{1F3E6} Bank</h3>`);
        if (!unref(data).bank.length) {
          _push(`<div class="text-xs text-gray-600 text-center py-4">No active bank accounts.</div>`);
        } else {
          _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Account</th><th class="pb-2 text-right text-gray-500">Module Balance</th><th class="pb-2 text-right text-gray-500">GL Balance</th><th class="pb-2 text-right text-gray-500">Variance</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(data).bank, (b) => {
            _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300">${ssrInterpolate(b.bank_name)} \u2014 ${ssrInterpolate(b.account_name)}</td><td class="py-2 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(b.module_balance.toLocaleString())}</td><td class="py-2 text-right font-mono text-gray-300">${ssrInterpolate(b.gl_balance === null ? "\u2014 no GL link" : "\u09F3" + b.gl_balance.toLocaleString())}</td><td class="${ssrRenderClass([varClass(b.variance), "py-2 text-right font-mono font-semibold"])}">${ssrInterpolate(fmtVar(b.variance))}</td></tr>`);
          });
          _push(`<!--]--></tbody></table>`);
        }
        _push(`</div><div class="glass-card p-5"><h3 class="section-title mb-4">\u{1F4B5} Petty Cash</h3>`);
        if (!unref(data).petty_cash.length) {
          _push(`<div class="text-xs text-gray-600 text-center py-4">No active petty cash accounts.</div>`);
        } else {
          _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Branch</th><th class="pb-2 text-right text-gray-500">Cached Balance</th><th class="pb-2 text-right text-gray-500">Ledger Balance</th><th class="pb-2 text-right text-gray-500">Variance</th><th class="pb-2 text-right text-gray-500">Day&#39;s Cash Count</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(data).petty_cash, (p) => {
            _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300">${ssrInterpolate(p.branch_name)} <span class="text-gray-600">(${ssrInterpolate(p.account_name)})</span></td><td class="py-2 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(p.cached_balance.toLocaleString())}</td><td class="py-2 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(p.ledger_balance.toLocaleString())}</td><td class="${ssrRenderClass([varClass(p.variance), "py-2 text-right font-mono font-semibold"])}">${ssrInterpolate(fmtVar(p.variance))}</td><td class="py-2 text-right text-gray-400">`);
            if (p.day_verification) {
              _push(`<!--[--> \u09F3${ssrInterpolate(Number(p.day_verification.actual_cash).toLocaleString())} <span class="${ssrRenderClass(Number(p.day_verification.variance) === 0 ? "text-emerald-400" : "text-amber-400")}"> (${ssrInterpolate(Number(p.day_verification.variance) >= 0 ? "+" : "")}${ssrInterpolate(Number(p.day_verification.variance).toLocaleString())}) </span><!--]-->`);
            } else {
              _push(`<span class="text-gray-700">not verified</span>`);
            }
            _push(`</td></tr>`);
          });
          _push(`<!--]--></tbody></table>`);
        }
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><h3 class="section-title mb-4">\u{1F4D7} Accounts Receivable</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-500">Ledger (customer_ledger)</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(unref(data).ar.ledger_balance.toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-500">GL (Accounts Receivable)</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(unref(data).ar.gl_balance.toLocaleString())}</span></div><div class="flex justify-between pt-2 border-t border-white/[0.06]"><span class="text-gray-500">Variance</span><span class="${ssrRenderClass([varClass(unref(data).ar.variance), "font-mono font-semibold"])}">${ssrInterpolate(fmtVar(unref(data).ar.variance))}</span></div></div></div><div class="glass-card p-5"><h3 class="section-title mb-4">\u{1F4D5} Accounts Payable</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-500">Cached (suppliers.current_balance)</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(unref(data).ap.cached_balance.toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-500">GL (Accounts Payable)</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(unref(data).ap.gl_balance.toLocaleString())}</span></div><div class="flex justify-between pt-2 border-t border-white/[0.06]"><span class="text-gray-500">Variance</span><span class="${ssrRenderClass([varClass(unref(data).ap.variance), "font-mono font-semibold"])}">${ssrInterpolate(fmtVar(unref(data).ap.variance))}</span></div></div></div></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/day-end-reconciliation.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=day-end-reconciliation-CdDyzxL3.mjs.map
