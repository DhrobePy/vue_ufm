import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, withAsyncContext, computed, reactive, watch, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "record",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const [{ data: suppData }, { data: poData }, { data: baData }, { data: pmtData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/suppliers",
        { query: { per: 100 } },
        "$LC-NSrc1t6"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/purchase/orders/open",
        "$OQE2W49T-C"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/bank-accounts",
        "$keGjTBr0e9"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/purchase/payments",
        { query: { per: 5 } },
        "$TyvT_Gk2fv"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const suppliers = computed(() => {
      var _a, _b;
      return (_b = (_a = suppData.value) == null ? void 0 : _a.suppliers) != null ? _b : [];
    });
    const openPOs = computed(() => {
      var _a, _b;
      return (_b = (_a = poData.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const bankAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = baData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const bankAccountOptions = computed(() => bankAccounts.value.map((a) => ({
      value: a.id,
      label: `${a.bank_name} \u2014 AC: ${a.account_number}`,
      sub: a.branch_name || a.account_name || ""
    })));
    const recentPayments = computed(() => {
      var _a, _b;
      return (_b = (_a = pmtData.value) == null ? void 0 : _a.payments) != null ? _b : [];
    });
    const paymentTypes = [
      { value: "advance", label: "Advance", hint: "Before delivery" },
      { value: "credit", label: "Credit", hint: "After delivery" },
      { value: "against_delivery", label: "Against Delivery", hint: "Delivery expenses" },
      { value: "contra", label: "Contra / Offset", hint: "Sales invoice set-off" }
    ];
    const form = reactive({
      supplierId: "",
      poId: "",
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      payType: "credit",
      method: "bank",
      amount: null,
      reference: "",
      bankAccountId: "",
      notes: ""
    });
    watch(() => form.payType, (val) => {
      if (val === "contra") form.method = "contra";
      else if (form.method === "contra") form.method = "bank";
    });
    const saving = ref(false);
    const selectedSupplier = computed(() => suppliers.value.find((s) => s.id === Number(form.supplierId)));
    const filteredPOs = computed(() => openPOs.value.filter((po) => {
      if (!form.supplierId) return true;
      return po.supplier_id === Number(form.supplierId);
    }));
    const selectedPO = computed(() => openPOs.value.find((po) => po.id === Number(form.poId)));
    const isValid = computed(() => {
      if (!form.supplierId || !form.poId || !form.date || !form.method) return false;
      if (!form.amount || form.amount <= 0) return false;
      if (form.payType === "contra") return !!form.reference;
      if (form.method === "cash" || form.method === "mobile_banking") return true;
      return !!form.reference && !!form.bankAccountId;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSearchSelect = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Record Supplier Payment",
        subtitle: "Record a payment made to a wheat supplier",
        breadcrumb: ["Purchase", "Payments", "Record Payment"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/payments",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Payment History`);
                } else {
                  return [
                    createTextVNode("\u2190 Payment History")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/payments",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Payment History")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-6 space-y-5"><h3 class="section-title">Payment Details</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Supplier *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).supplierId) ? ssrLooseContain(unref(form).supplierId, "") : ssrLooseEqual(unref(form).supplierId, "")) ? " selected" : ""}>\u2014 Select supplier \u2014</option><!--[-->`);
      ssrRenderList(unref(suppliers), (s) => {
        _push(`<option${ssrRenderAttr("value", s.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).supplierId) ? ssrLooseContain(unref(form).supplierId, s.id) : ssrLooseEqual(unref(form).supplierId, s.id)) ? " selected" : ""}>${ssrInterpolate(s.company_name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).poId) ? ssrLooseContain(unref(form).poId, "") : ssrLooseEqual(unref(form).poId, "")) ? " selected" : ""}>\u2014 Select PO \u2014</option><!--[-->`);
      ssrRenderList(unref(filteredPOs), (po) => {
        var _a2;
        _push(`<option${ssrRenderAttr("value", po.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).poId) ? ssrLooseContain(unref(form).poId, po.id) : ssrLooseEqual(unref(form).poId, po.id)) ? " selected" : ""}>${ssrInterpolate(po.po_number)} \u2014 \u09F3${ssrInterpolate(Number((_a2 = po.balance_payable) != null ? _a2 : 0).toLocaleString())} due </option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Type *</label><div class="grid grid-cols-2 sm:grid-cols-4 gap-2"><!--[-->`);
      ssrRenderList(paymentTypes, (pt) => {
        _push(`<button type="button" class="${ssrRenderClass([
          "px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center",
          unref(form).payType === pt.value ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/20"
        ])}"><div>${ssrInterpolate(pt.label)}</div><div class="text-[10px] font-normal opacity-70 mt-0.5">${ssrInterpolate(pt.hint)}</div></button>`);
      });
      _push(`<!--]--></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">${ssrInterpolate(unref(form).payType === "contra" ? "Contra Method" : "Payment Method *")}</label><select class="input-glass">`);
      if (unref(form).payType === "contra") {
        _push(`<option value="contra"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "contra") : ssrLooseEqual(unref(form).method, "contra")) ? " selected" : ""}>Contra / Sales Offset</option>`);
      } else {
        _push(`<!--[--><option value="cash"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "cash") : ssrLooseEqual(unref(form).method, "cash")) ? " selected" : ""}>Cash</option><option value="bank"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "bank") : ssrLooseEqual(unref(form).method, "bank")) ? " selected" : ""}>Bank Transfer / BEFTN</option><option value="cheque"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "cheque") : ssrLooseEqual(unref(form).method, "cheque")) ? " selected" : ""}>Cheque</option><option value="mobile_banking"${ssrIncludeBooleanAttr(Array.isArray(unref(form).method) ? ssrLooseContain(unref(form).method, "mobile_banking") : ssrLooseEqual(unref(form).method, "mobile_banking")) ? " selected" : ""}>Mobile Banking (bKash/Nagad)</option><!--]-->`);
      }
      _push(`</select></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (\u09F3) *</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">\u09F3</span><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="1" class="input-glass pl-8 font-mono text-lg font-bold" placeholder="0"></div>`);
      if (unref(selectedPO)) {
        _push(`<div class="flex gap-2 mt-2"><button class="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"> Full Outstanding \u09F3${ssrInterpolate(Number((_a = unref(selectedPO).balance_payable) != null ? _a : 0).toLocaleString())}</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(form).payType === "contra") {
        _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sales Invoice / Reference *</label><input${ssrRenderAttr("value", unref(form).reference)} type="text" class="input-glass font-mono" placeholder="Credit invoice no. or reference being offset\u2026"><p class="text-[11px] text-gray-500">Enter the sales invoice number that offsets this payment amount.</p></div>`);
      } else if (unref(form).method !== "cash") {
        _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference / Cheque No. *</label><input${ssrRenderAttr("value", unref(form).reference)} type="text" class="input-glass font-mono" placeholder="BEFTN ref, cheque no., TxID, or bKash TrxID"></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(form).payType !== "contra" && unref(form).method !== "cash") {
        _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Bank Account *</label>`);
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
      _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label><textarea rows="3" class="input-glass resize-none" placeholder="Remarks about this payment\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div><div class="flex items-center gap-3 pt-2 border-t border-white/[0.06]"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Recording\u2026" : "Record Payment")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/payments",
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
      _push(`</div></div><div class="space-y-5">`);
      if (unref(selectedSupplier)) {
        _push(`<div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Supplier Info</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Name</span><span class="text-gray-300">${ssrInterpolate(unref(selectedSupplier).company_name)}</span></div><div class="flex justify-between"><span class="text-gray-600">Outstanding</span><span class="font-bold text-red-400">\u09F3${ssrInterpolate(Number((_b = unref(selectedSupplier).current_balance) != null ? _b : 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Credit Limit</span><span class="text-gray-300">\u09F3${ssrInterpolate(Number((_c = unref(selectedSupplier).credit_limit) != null ? _c : 0).toLocaleString())}</span></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Recent Payments</h3><!--[-->`);
      ssrRenderList(unref(recentPayments), (p) => {
        _push(`<div class="py-2 border-b border-white/[0.04] last:border-0 text-xs"><div class="flex justify-between"><span class="text-gray-300 font-semibold">\u09F3${ssrInterpolate(Number(p.amount_paid).toLocaleString())}</span><span class="text-gray-600">${ssrInterpolate(p.payment_date)}</span></div><p class="text-gray-500 mt-0.5">${ssrInterpolate(p.supplier_name)} \xB7 ${ssrInterpolate(p.payment_method)}</p></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(recentPayments).length) {
        _push(`<p class="text-xs text-gray-600 text-center py-2">No recent payments</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/payments/record.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=record-DD8UnKRx.mjs.map
