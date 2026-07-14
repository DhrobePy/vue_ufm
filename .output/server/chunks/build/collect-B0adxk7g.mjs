import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { l as useRouter } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "collect",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    useRouter();
    const [{ data: bankData }, { data: cashData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/lookup/bank-accounts",
        "$OKMlXkU1Qx"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/cash-accounts",
        "$VWfoyIIp56"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const bankAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const cashAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = cashData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const customerSearch = ref("");
    const customerResults = ref([]);
    const selectedCustomer = ref(null);
    const openOrders = ref([]);
    const form = reactive({
      amount: null,
      method: "Cash",
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      bank_account_id: null,
      cash_account_id: null,
      reference: "",
      cheque_number: "",
      cheque_date: "",
      notes: ""
    });
    const allocations = reactive({});
    const allocatedTotal = computed(() => Object.values(allocations).reduce((s, v) => s + (Number(v) || 0), 0));
    const remaining = computed(() => Number(form.amount || 0) - allocatedTotal.value);
    const canSubmit = computed(() => selectedCustomer.value && Number(form.amount) > 0 && remaining.value >= -5e-3 && (form.method === "Cash" ? !!form.cash_account_id : !!form.bank_account_id));
    const saving = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Collect Payment",
        subtitle: "Record one payment against a customer and spread it across their orders",
        breadcrumb: ["Credit Sales", "Collect Payment"]
      }, null, _parent));
      _push(`<div class="glass-card p-5 space-y-3"><p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">1 \xB7 Customer</p><div class="relative"><input${ssrRenderAttr("value", unref(customerSearch))} type="text" class="input-glass w-full" placeholder="Search customer by name / phone\u2026">`);
      if (unref(customerResults).length && !unref(selectedCustomer)) {
        _push(`<div class="absolute z-20 mt-1 w-full rounded-xl bg-[#161616] border border-white/[0.1] max-h-64 overflow-y-auto shadow-2xl"><!--[-->`);
        ssrRenderList(unref(customerResults), (c) => {
          _push(`<button class="w-full text-left px-4 py-2.5 hover:bg-white/[0.05] border-b border-white/[0.04] last:border-0"><p class="text-sm text-gray-200 font-medium">${ssrInterpolate(c.name)}</p><p class="text-[11px] text-gray-600">${ssrInterpolate(c.business_name)} \xB7 ${ssrInterpolate(c.phone_number)}</p></button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(selectedCustomer)) {
        _push(`<div class="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.07] px-4 py-3"><div><p class="text-sm font-bold text-gray-200">${ssrInterpolate(unref(selectedCustomer).name)}</p><p class="text-[11px] text-gray-500">${ssrInterpolate(unref(selectedCustomer).phone_number)}</p></div><button class="text-xs text-gray-600 hover:text-red-400">\u2715 change</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(selectedCustomer)) {
        _push(`<!--[--><div class="glass-card p-5 space-y-4"><p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">2 \xB7 Payment</p><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="space-y-1.5"><label class="text-[11px] text-gray-500">Amount (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="0" step="1" class="input-glass w-full text-lg font-bold text-gold-300 text-center"></div><div class="space-y-1.5"><label class="text-[11px] text-gray-500">Method *</label><select class="input-glass w-full"><option value="Cash"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "Cash") : ssrLooseEqual(unref(form).method, "Cash")) ? " selected" : ""}>Cash</option><option value="Bank Transfer"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "Bank Transfer") : ssrLooseEqual(unref(form).method, "Bank Transfer")) ? " selected" : ""}>Bank Transfer</option><option value="Cheque"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "Cheque") : ssrLooseEqual(unref(form).method, "Cheque")) ? " selected" : ""}>Cheque</option><option value="Mobile Banking"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "Mobile Banking") : ssrLooseEqual(unref(form).method, "Mobile Banking")) ? " selected" : ""}>Mobile Banking</option></select></div><div class="space-y-1.5"><label class="text-[11px] text-gray-500">Date</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass w-full"></div>`);
        if (unref(form).method === "Cash") {
          _push(`<div class="space-y-1.5 sm:col-span-2"><label class="text-[11px] text-gray-500">Petty Cash Account *</label><select class="input-glass w-full"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).cash_account_id) ? ssrLooseContain(unref(form).cash_account_id, null) : ssrLooseEqual(unref(form).cash_account_id, null)) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
          ssrRenderList(unref(cashAccounts), (a) => {
            _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).cash_account_id) ? ssrLooseContain(unref(form).cash_account_id, a.id) : ssrLooseEqual(unref(form).cash_account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_name)} (${ssrInterpolate(a.branch_name)}) </option>`);
          });
          _push(`<!--]--></select></div>`);
        } else {
          _push(`<div class="space-y-1.5 sm:col-span-2"><label class="text-[11px] text-gray-500">Bank Account *</label><select class="input-glass w-full"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).bank_account_id) ? ssrLooseContain(unref(form).bank_account_id, null) : ssrLooseEqual(unref(form).bank_account_id, null)) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
          ssrRenderList(unref(bankAccounts), (a) => {
            _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).bank_account_id) ? ssrLooseContain(unref(form).bank_account_id, a.id) : ssrLooseEqual(unref(form).bank_account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)} (${ssrInterpolate(a.account_number)}) </option>`);
          });
          _push(`<!--]--></select></div>`);
        }
        _push(`<div class="space-y-1.5"><label class="text-[11px] text-gray-500">Reference / TrxID</label><input${ssrRenderAttr("value", unref(form).reference)} type="text" class="input-glass w-full font-mono"></div>`);
        if (unref(form).method === "Cheque") {
          _push(`<div class="space-y-1.5"><label class="text-[11px] text-gray-500">Cheque No.</label><input${ssrRenderAttr("value", unref(form).cheque_number)} type="text" class="input-glass w-full font-mono"></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(form).method === "Cheque") {
          _push(`<div class="space-y-1.5"><label class="text-[11px] text-gray-500">Cheque Date</label><input${ssrRenderAttr("value", unref(form).cheque_date)} type="date" class="input-glass w-full"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-1.5 sm:col-span-3"><label class="text-[11px] text-gray-500">Notes</label><input${ssrRenderAttr("value", unref(form).notes)} type="text" class="input-glass w-full"></div></div></div><div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between"><p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">3 \xB7 Allocate to Orders</p><div class="flex items-center gap-3"><button class="text-[11px] text-sky-400 hover:text-sky-300">\u26A1 Auto (oldest first)</button><button class="text-[11px] text-gray-600 hover:text-gray-400">Clear</button></div></div>`);
        if (!unref(openOrders).length) {
          _push(`<div class="py-10 text-center text-gray-600 text-xs italic"> No open orders \u2014 the full amount will sit on account (advance) </div>`);
        } else {
          _push(`<div class="divide-y divide-white/[0.04]"><!--[-->`);
          ssrRenderList(unref(openOrders), (o) => {
            _push(`<div class="px-5 py-3 flex items-center gap-4 flex-wrap"><div class="min-w-[150px]"><p class="text-xs font-bold text-gray-300">${ssrInterpolate(o.order_number)}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(String(o.order_date).slice(0, 10))}</p></div>`);
            _push(ssrRenderComponent(_component_UiStatusBadge, {
              status: o.status
            }, null, _parent));
            if (!o.is_dispatched) {
              _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25" title="Not dispatched yet \u2014 this allocation counts as an advance on the order"> \u2192 advance </span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="flex-1 text-right text-xs text-gray-500"> Balance <span class="font-mono font-bold text-gold-400">\u09F3${ssrInterpolate(Number(o.balance_due).toLocaleString())}</span></div><div class="flex items-center gap-1"><span class="text-[10px] text-gray-600">\u09F3</span><input${ssrRenderAttr("value", unref(allocations)[o.id])} type="number" min="0"${ssrRenderAttr("max", o.balance_due)} step="1" class="input-glass w-28 py-1.5 text-xs font-mono text-right" placeholder="0"></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`<div class="px-5 py-3 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between text-xs"><span class="text-gray-500"> Allocated <strong class="font-mono text-gray-300">\u09F3${ssrInterpolate(unref(allocatedTotal).toLocaleString())}</strong> of <strong class="font-mono text-gray-300">\u09F3${ssrInterpolate(Number(unref(form).amount || 0).toLocaleString())}</strong></span><span class="${ssrRenderClass(unref(remaining) < 0 ? "text-red-400 font-bold" : unref(remaining) > 0 ? "text-amber-400" : "text-emerald-400")}">${ssrInterpolate(unref(remaining) < 0 ? `Over-allocated by \u09F3${Math.abs(unref(remaining)).toLocaleString()}` : unref(remaining) > 0 ? `\u09F3${unref(remaining).toLocaleString()} stays on account` : "Fully allocated \u2713")}</span></div></div><div class="glass-card p-5 flex items-center justify-end gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/credit-sales/payments",
          class: "btn-ghost text-xs"
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
        _push(`<button${ssrIncludeBooleanAttr(!unref(canSubmit) || unref(saving)) ? " disabled" : ""} class="btn-gold text-sm px-8 py-2.5 disabled:opacity-50">${ssrInterpolate(unref(saving) ? "Recording\u2026" : `\u2713 Record \u09F3${Number(unref(form).amount || 0).toLocaleString()}`)}</button></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/collect.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=collect-B0adxk7g.mjs.map
