import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderStyle } from 'vue/server-renderer';
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
  __name: "payment",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const orderId = Number(route.params.id);
    const [{ data: orderData, pending, error: fetchError }, { data: bankData }, { data: pettyData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        () => `/api/credit-sales/${orderId}`,
        "$jz41fFPLVu"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/bank-accounts",
        "$LTfo5bM-kw"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/cash-accounts",
        "$XVg5g0lZqC"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const order = computed(() => {
      var _a, _b;
      return (_b = (_a = orderData.value) == null ? void 0 : _a.order) != null ? _b : {};
    });
    const recentPayments = computed(() => {
      var _a, _b, _c, _d;
      return (_d = (_c = (_a = orderData.value) == null ? void 0 : _a.recentPayments) != null ? _c : (_b = orderData.value) == null ? void 0 : _b.payments) != null ? _d : [];
    });
    const bankAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const pettyAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = pettyData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const bankAccountOptions = computed(() => bankAccounts.value.map((a) => ({
      value: a.id,
      label: `${a.bank_name} \u2014 AC: ${a.account_number}`,
      sub: a.branch_name || a.account_name || ""
    })));
    const cashAccountOptions = computed(() => pettyAccounts.value.map((a) => ({
      value: a.id,
      label: a.account_name,
      sub: a.branch_name || "Head Office"
    })));
    const outstanding = computed(() => {
      var _a;
      return Number((_a = order.value.balance_due) != null ? _a : 0);
    });
    const paidPct = computed(() => {
      var _a, _b;
      const total = Number((_a = order.value.total_amount) != null ? _a : 0);
      const paid = Number((_b = order.value.amount_paid) != null ? _b : 0);
      if (!total) return 0;
      return Math.min(100, Math.round(paid / total * 100));
    });
    const methods = [
      { value: "cash", icon: "\u{1F4B5}", label: "Cash" },
      { value: "bkash", icon: "\u{1F4F1}", label: "bKash" },
      { value: "nagad", icon: "\u{1F4F2}", label: "Nagad" },
      { value: "bank", icon: "\u{1F3E6}", label: "Bank Transfer" }
    ];
    const form = reactive({
      amount: null,
      method: "cash",
      reference: "",
      bankAccountId: "",
      cashAccountId: "",
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      collectedBy: "",
      notes: ""
    });
    const saving = ref(false);
    const isValid = computed(() => {
      if (!form.amount || form.amount <= 0) return false;
      if (!form.collectedBy.trim()) return false;
      if (form.method !== "cash" && !form.reference) return false;
      if (form.method === "bank" && !form.bankAccountId) return false;
      if (form.method === "cash" && !form.cashAccountId) return false;
      return true;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSearchSelect = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Collect Payment \u2014 ${unref(order).order_number || "\u2026"}`,
        subtitle: `Customer: ${unref(order).customer_name || "\u2026"} \xB7 Outstanding: \u09F3${Number(unref(order).balance_due || 0).toLocaleString()}`,
        breadcrumb: ["Credit Sales", unref(order).order_number || String(unref(route).params.id), "Collect Payment"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/${unref(route).params.id}`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Back to Order`);
                } else {
                  return [
                    createTextVNode("\u2190 Back to Order")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/credit-sales/${unref(route).params.id}`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back to Order")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Payment Details</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Amount *</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">\u09F3</span><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="1"${ssrRenderAttr("max", unref(outstanding))} class="input-glass pl-8 font-mono text-lg font-bold" placeholder="0"></div><div class="flex flex-wrap gap-2 mt-2"><button class="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"> Full \u09F3${ssrInterpolate(unref(outstanding).toLocaleString())}</button><button class="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.05] text-gray-400 border border-white/10 hover:bg-white/[0.08] transition-colors">Half</button><button class="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.05] text-gray-400 border border-white/10 hover:bg-white/[0.08] transition-colors">1 Lakh</button><button class="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.05] text-gray-400 border border-white/10 hover:bg-white/[0.08] transition-colors">5 Lakh</button></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method *</label><div class="grid grid-cols-2 sm:grid-cols-4 gap-2"><!--[-->`);
        ssrRenderList(methods, (m) => {
          _push(`<button class="${ssrRenderClass([
            "rounded-xl border p-3 text-center transition-all duration-150",
            unref(form).method === m.value ? "bg-gold-500/10 border-gold-500/40 text-gold-400" : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/20"
          ])}"><div class="text-xl mb-1">${ssrInterpolate(m.icon)}</div><div class="text-xs font-semibold">${ssrInterpolate(m.label)}</div></button>`);
        });
        _push(`<!--]--></div></div>`);
        if (unref(form).method !== "cash") {
          _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">${ssrInterpolate(unref(form).method === "bkash" || unref(form).method === "nagad" ? "Transaction ID *" : "Reference / Cheque No. *")}</label><input${ssrRenderAttr("value", unref(form).reference)} type="text" class="input-glass font-mono" maxlength="50"${ssrRenderAttr("placeholder", unref(form).method === "bank" ? "Cheque # or BEFTN reference" : "e.g. 8A3K2JG9P1")}></div>`);
        } else {
          _push(`<!---->`);
        }
        if (["bank", "bkash", "nagad"].includes(unref(form).method)) {
          _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">${ssrInterpolate(unref(form).method === "bank" ? "Company Bank Account *" : "Receiving Bank Account (optional)")}</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(form).bankAccountId,
            "onUpdate:modelValue": ($event) => unref(form).bankAccountId = $event,
            options: unref(bankAccountOptions),
            placeholder: "Type bank name or account number\u2026"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(form).method === "cash") {
          _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Petty Cash Account *</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(form).cashAccountId,
            "onUpdate:modelValue": ($event) => unref(form).cashAccountId = $event,
            options: unref(cashAccountOptions),
            placeholder: "Type cash box / account name\u2026"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Collected By *</label><input${ssrRenderAttr("value", unref(form).collectedBy)} type="text" class="input-glass" placeholder="Collector name"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes (optional)</label><textarea rows="3" class="input-glass resize-none" placeholder="Any remarks about this payment\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div><div class="flex items-center gap-3 pt-2 flex-wrap"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Recording\u2026" : "Record Payment")}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/credit-sales/${unref(route).params.id}`,
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
        if (unref(form).amount && unref(form).amount > 0) {
          _push(`<span class="ml-auto text-xs text-gray-500"> After payment: <span class="font-bold text-emerald-400">\u09F3${ssrInterpolate(Math.max(0, unref(outstanding) - (unref(form).amount || 0)).toLocaleString())}</span> remaining </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Order Summary</h3><div class="space-y-2.5 text-xs"><div class="flex justify-between"><span class="text-gray-600">Order #</span><span class="font-mono text-gold-400/80">${ssrInterpolate(unref(order).order_number)}</span></div><div class="flex justify-between"><span class="text-gray-600">Customer</span><span class="text-gray-300">${ssrInterpolate(unref(order).customer_name)}</span></div><div class="flex justify-between"><span class="text-gray-600">Order Total</span><span class="font-semibold text-gray-200">\u09F3${ssrInterpolate(Number(unref(order).total_amount || 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Paid to Date</span><span class="font-semibold text-emerald-400">\u09F3${ssrInterpolate(Number(unref(order).amount_paid || 0).toLocaleString())}</span></div><div class="h-px bg-white/[0.06]"></div><div class="flex justify-between"><span class="text-gray-600 font-semibold">Outstanding</span><span class="font-bold text-red-400 text-sm">\u09F3${ssrInterpolate(unref(outstanding).toLocaleString())}</span></div></div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full bg-emerald-500 transition-all duration-300" style="${ssrRenderStyle(`width:${unref(paidPct)}%`)}"></div></div><p class="text-[10px] text-gray-600 text-right">${ssrInterpolate(unref(paidPct))}% collected</p></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Previous Payments</h3><!--[-->`);
        ssrRenderList(unref(recentPayments), (p) => {
          _push(`<div class="flex items-start justify-between gap-2 py-2 border-b border-white/[0.04] last:border-0"><div><p class="text-xs font-bold text-gray-200">\u09F3${ssrInterpolate(Number(p.amount).toLocaleString())}</p><p class="text-[11px] text-gray-500">${ssrInterpolate(p.payment_method || p.method)} \xB7 ${ssrInterpolate(String(p.payment_date || p.date).slice(0, 10))}</p></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: p.allocation_status || "cleared"
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        if (!unref(recentPayments).length) {
          _push(`<div class="text-xs text-gray-600 text-center py-2">No prior payments</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/[id]/payment.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=payment-eKNvTtlX.mjs.map
