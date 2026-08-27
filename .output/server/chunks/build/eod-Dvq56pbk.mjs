import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
  __name: "eod",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const [{ data, refresh }, { data: usersData }, { data: bankData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/pos/eod",
        "$oSzkOcSoAx"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/admin/users",
        { query: { per: 200 } },
        "$6K4GzdG7Zd"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/bank/accounts",
        "$cUCsxw_ezR"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const cashAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.cash_accounts) != null ? _b : [];
    });
    const history = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.history) != null ? _b : [];
    });
    const users = computed(() => {
      var _a, _b;
      return (_b = (_a = usersData.value) == null ? void 0 : _a.users) != null ? _b : [];
    });
    const bankAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const form = reactive({ cash_account_id: "", actual_cash: 0, variance_reason: "", witness_user_id: "" });
    const selectedAccount = computed(() => cashAccounts.value.find((a) => String(a.id) === String(form.cash_account_id)));
    const variance = computed(() => selectedAccount.value ? Math.round((form.actual_cash - Number(selectedAccount.value.current_balance)) * 100) / 100 : null);
    const canSubmit = computed(() => {
      var _a;
      return !!form.cash_account_id && form.actual_cash >= 0 && (Math.abs((_a = variance.value) != null ? _a : 0) < 5e-3 || form.variance_reason.trim().length > 0);
    });
    const submitting = ref(false);
    const depositTarget = ref(null);
    const depositForm = reactive({ bank_account_id: "", deposit_reference: "" });
    const depositSubmitting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "End of Day \u2014 Cash Reconciliation",
        subtitle: "Count the till, confirm against the system balance, then confirm next-day deposit",
        breadcrumb: ["POS", "End of Day"]
      }, null, _parent));
      _push(`<div class="glass-card p-5 space-y-4 max-w-xl"><h3 class="section-title">New Count</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cash Box</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).cash_account_id) ? ssrLooseContain(unref(form).cash_account_id, "") : ssrLooseEqual(unref(form).cash_account_id, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
      ssrRenderList(unref(cashAccounts), (a) => {
        _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).cash_account_id) ? ssrLooseContain(unref(form).cash_account_id, a.id) : ssrLooseEqual(unref(form).cash_account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_name)}${ssrInterpolate(a.branch_name ? ` \u2014 ${a.branch_name}` : "")}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if (unref(selectedAccount)) {
        _push(`<div class="rounded-xl p-3 text-xs" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)" })}"><div class="flex justify-between"><span class="text-gray-500">Expected (system balance)</span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(Number(unref(selectedAccount).current_balance).toLocaleString())}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual Cash Counted</label><input${ssrRenderAttr("value", unref(form).actual_cash)} type="number" min="0" step="any" class="input-glass font-mono"></div>`);
      if (unref(variance) !== null && Math.abs(unref(variance)) > 5e-3) {
        _push(`<div class="space-y-1.5"><p class="${ssrRenderClass(["text-xs font-semibold", unref(variance) < 0 ? "text-red-400" : "text-amber-400"])}"> Variance: \u09F3${ssrInterpolate(unref(variance).toLocaleString())} ${ssrInterpolate(unref(variance) < 0 ? "(short)" : "(over)")}</p><input${ssrRenderAttr("value", unref(form).variance_reason)} class="input-glass text-xs" placeholder="Reason for variance\u2026"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Witness (optional)</label><select class="input-glass text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).witness_user_id) ? ssrLooseContain(unref(form).witness_user_id, "") : ssrLooseEqual(unref(form).witness_user_id, "")) ? " selected" : ""}>\u2014 None \u2014</option><!--[-->`);
      ssrRenderList(unref(users), (u) => {
        _push(`<option${ssrRenderAttr("value", u.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).witness_user_id) ? ssrLooseContain(unref(form).witness_user_id, u.id) : ssrLooseEqual(unref(form).witness_user_id, u.id)) ? " selected" : ""}>${ssrInterpolate(u.display_name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="flex justify-end"><button${ssrIncludeBooleanAttr(!unref(canSubmit) || unref(submitting)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50">${ssrInterpolate(unref(submitting) ? "Saving\u2026" : "Submit Count")}</button></div></div><div class="glass-card p-5"><h3 class="section-title mb-3">Recent Counts</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Date</th><th class="text-left pr-3">Branch</th><th class="text-right pr-3">Expected</th><th class="text-right pr-3">Actual</th><th class="text-right pr-3">Variance</th><th class="text-left pr-3">Status</th><th></th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(history), (h) => {
        _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 pr-3 text-gray-400">${ssrInterpolate(String(h.verification_date).slice(0, 10))}</td><td class="pr-3 text-gray-300">${ssrInterpolate(h.branch_name)}</td><td class="pr-3 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(Number(h.expected_cash).toLocaleString())}</td><td class="pr-3 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(Number(h.actual_cash).toLocaleString())}</td><td class="${ssrRenderClass(["pr-3 text-right font-mono", Math.abs(h.variance) > 5e-3 ? h.variance < 0 ? "text-red-400" : "text-amber-400" : "text-emerald-400"])}"> \u09F3${ssrInterpolate(Number(h.variance).toLocaleString())}</td><td class="pr-3"><span class="${ssrRenderClass([
          "px-2 py-0.5 rounded-full text-[10px] font-semibold",
          h.status === "approved" ? "bg-emerald-500/15 text-emerald-400" : h.status === "disputed" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
        ])}">${ssrInterpolate(h.status)}</span>`);
        if (h.deposited_at) {
          _push(`<span class="ml-1 text-[10px] text-blue-400">\xB7 deposited</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td><td class="text-right">`);
        if (h.status === "approved" && !h.deposited_at) {
          _push(`<button class="btn-ghost text-[10px] py-1">Confirm Deposit</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(history).length) {
        _push(`<tr><td colspan="7" class="py-6 text-center text-gray-600">No counts yet.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      if (unref(depositTarget)) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div class="glass-card p-5 w-full max-w-sm space-y-4"><h3 class="section-title">Confirm Bank Deposit</h3><p class="text-xs text-gray-400"> \u09F3${ssrInterpolate(Number(unref(depositTarget).actual_cash).toLocaleString())} from ${ssrInterpolate(unref(depositTarget).branch_name)}</p><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deposited To</label><select class="input-glass text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(depositForm).bank_account_id) ? ssrLooseContain(unref(depositForm).bank_account_id, "") : ssrLooseEqual(unref(depositForm).bank_account_id, "")) ? " selected" : ""}>Select bank account\u2026</option><!--[-->`);
        ssrRenderList(unref(bankAccounts), (b) => {
          _push(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(depositForm).bank_account_id) ? ssrLooseContain(unref(depositForm).bank_account_id, b.id) : ssrLooseEqual(unref(depositForm).bank_account_id, b.id)) ? " selected" : ""}>${ssrInterpolate(b.bank_name)} \u2014 ${ssrInterpolate(b.account_name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Deposit Reference</label><input${ssrRenderAttr("value", unref(depositForm).deposit_reference)} class="input-glass text-xs" placeholder="Slip / transaction ref\u2026"></div><div class="flex justify-end gap-2"><button class="btn-ghost text-xs">Cancel</button><button${ssrIncludeBooleanAttr(!unref(depositForm).bank_account_id || !unref(depositForm).deposit_reference.trim() || unref(depositSubmitting)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50">${ssrInterpolate(unref(depositSubmitting) ? "Confirming\u2026" : "Confirm Deposit")}</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/eod.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=eod-Dvq56pbk.mjs.map
