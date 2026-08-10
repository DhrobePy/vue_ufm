import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, reactive, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const customerId = computed(() => Number(route.params.id));
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/pos/customers/${customerId.value}/ledger`,
      "$CadIXNH8q-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const customer = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.customer) != null ? _b : null;
    });
    const balance = computed(() => {
      var _a, _b;
      return Number((_b = (_a = data.value) == null ? void 0 : _a.balance) != null ? _b : 0);
    });
    const timeline = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.timeline) != null ? _b : [];
    });
    const [{ data: bankData }, { data: pettyData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/lookup/bank-accounts",
        "$PdvjMmcXpm"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/cash-accounts",
        "$QyRSV9GsHO"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const bankAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({ value: a.id, label: `${a.bank_name} \u2014 AC: ${a.account_number}`, sub: a.branch_name || "" }));
    });
    const cashAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = pettyData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({ value: a.id, label: a.account_name, sub: a.branch_name || "" }));
    });
    const pay = reactive({ amount: 0, method: "Cash", bankAccountId: "", cashAccountId: "" });
    const collecting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: unref(customer) ? `${unref(customer).name} \u2014 POS Ledger` : "POS Customer Ledger",
        subtitle: "Every POS sale (cash or credit) plus payments \u2014 separate from the Credit Sales ledger",
        breadcrumb: ["POS", "Customer Ledger"]
      }, null, _parent));
      if (unref(customer)) {
        _push(`<div class="glass-card p-5 flex items-center justify-between"><div><p class="text-sm font-semibold text-gray-200">${ssrInterpolate(unref(customer).name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(customer).business_name)} ${ssrInterpolate(unref(customer).phone_number)}</p></div><div class="text-right"><p class="text-[10px] text-gray-600 uppercase">POS Credit Balance</p><p class="${ssrRenderClass(["text-xl font-bold font-mono", unref(balance) > 0 ? "text-orange-400" : "text-emerald-400"])}">\u09F3${ssrInterpolate(unref(balance).toLocaleString())}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(customer) && unref(balance) > 0) {
        _push(`<div class="glass-card p-5 space-y-3 max-w-md"><h3 class="section-title">Collect Payment</h3><div class="flex items-end gap-3 flex-wrap"><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Amount</label><input${ssrRenderAttr("value", unref(pay).amount)} type="number" min="0" step="any" class="input-glass text-xs font-mono w-32"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Method</label><select class="input-glass text-xs w-32"><!--[-->`);
        ssrRenderList(["Cash", "Bank Transfer", "Card", "Mobile Banking"], (m) => {
          _push(`<option${ssrRenderAttr("value", m)}${ssrIncludeBooleanAttr(Array.isArray(unref(pay).method) ? ssrLooseContain(unref(pay).method, m) : ssrLooseEqual(unref(pay).method, m)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
        });
        _push(`<!--]--></select></div>`);
        if (unref(pay).method === "Cash") {
          _push(`<div class="space-y-1 min-w-[180px]"><label class="text-[10px] text-gray-600 uppercase">Cash Box</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(pay).cashAccountId,
            "onUpdate:modelValue": ($event) => unref(pay).cashAccountId = $event,
            options: unref(cashAccountOptions),
            placeholder: "Cash box\u2026"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="space-y-1 min-w-[180px]"><label class="text-[10px] text-gray-600 uppercase">Bank Account</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(pay).bankAccountId,
            "onUpdate:modelValue": ($event) => unref(pay).bankAccountId = $event,
            options: unref(bankAccountOptions),
            placeholder: "Bank account\u2026"
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`<button${ssrIncludeBooleanAttr(!(unref(pay).amount > 0) || unref(collecting)) ? " disabled" : ""} class="btn-gold text-xs py-2 disabled:opacity-50">${ssrInterpolate(unref(collecting) ? "Posting\u2026" : "Collect")}</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-5"><h3 class="section-title mb-3">Timeline</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Date</th><th class="text-left pr-3">Type</th><th class="text-left pr-3">Reference</th><th class="text-right pr-3">Debit</th><th class="text-right pr-3">Credit</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(timeline), (t, i) => {
        var _a;
        _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 pr-3 text-gray-400">${ssrInterpolate(String(t.date).slice(0, 10))}</td><td class="pr-3">`);
        if (t.kind === "sale") {
          _push(`<span class="${ssrRenderClass(["px-2 py-0.5 rounded-full text-[10px] font-semibold", t.balance_impact ? "bg-orange-500/15 text-orange-400" : "bg-white/[0.06] text-gray-500"])}"> Sale${ssrInterpolate(t.balance_impact ? "" : " (cash)")}</span>`);
        } else {
          _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">${ssrInterpolate(t.kind)}</span>`);
        }
        _push(`</td><td class="pr-3 text-gray-300">`);
        if (t.kind === "sale") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/pos/${(_a = t.id) != null ? _a : ""}`,
            class: "font-mono text-gold-400 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(t.order_number)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(t.order_number), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<span>${ssrInterpolate(t.description)}</span>`);
        }
        _push(`</td><td class="pr-3 text-right font-mono text-orange-400">${ssrInterpolate(t.kind === "sale" ? t.balance_impact ? `\u09F3${Number(t.credit_amount).toLocaleString()}` : "" : Number(t.debit_amount) > 0 ? `\u09F3${Number(t.debit_amount).toLocaleString()}` : "")}</td><td class="pr-3 text-right font-mono text-emerald-400">${ssrInterpolate(t.kind !== "sale" && Number(t.credit_amount) > 0 ? `\u09F3${Number(t.credit_amount).toLocaleString()}` : "")}</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(timeline).length) {
        _push(`<tr><td colspan="5" class="py-6 text-center text-gray-600">No transactions yet.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/customer-ledger/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-DtqTozce.mjs.map
