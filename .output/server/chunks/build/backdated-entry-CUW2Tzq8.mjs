import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, ref, withAsyncContext, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { p as useUserSession, e as createError } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
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
  __name: "backdated-entry",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { user: sessionUser } = useUserSession();
    const isAdminUser = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    if (!isAdminUser.value) {
      throw createError({ statusCode: 403, statusMessage: "Backdated order entry is admin/superadmin only" });
    }
    const submitting = ref(false);
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const { data: branchListData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$V-AdA7jWmz"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const orderBranches = computed(() => {
      var _a, _b;
      return ((_b = (_a = branchListData.value) == null ? void 0 : _a.branches) != null ? _b : []).filter((b) => b.status === "active" && b.branch_type !== "office");
    });
    const form = reactive({
      customerId: "",
      transactionDate: todayStr,
      branchId: "",
      shippingAddress: "",
      items: [{ variantId: "", productId: "", quantity: 1, unitPrice: 0, discount: 0 }],
      amountPaid: 0,
      paymentMethod: "Cash",
      bankAccountId: "",
      cashAccountId: "",
      reference: "",
      chequeNumber: "",
      chequeDate: "",
      notes: ""
    });
    const customerQuery = ref("");
    const customerDropdownOpen = ref(false);
    ref(null);
    const paymentMethods = [
      { value: "Cash", icon: "\u{1F4B5}", label: "Cash" },
      { value: "Bank Transfer", icon: "\u{1F3E6}", label: "Bank Transfer" },
      { value: "Cheque", icon: "\u{1F4C4}", label: "Cheque" },
      { value: "Mobile Banking", icon: "\u{1F4F1}", label: "Mobile Banking" },
      { value: "Card", icon: "\u{1F4B3}", label: "Card" }
    ];
    const [{ data: custData }, { data: bankData }, { data: pettyData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/customers",
        { query: { per: 500, simple: "1" } },
        "$QoJnOAU-xQ"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/bank-accounts",
        "$bhCafOCQa0"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/cash-accounts",
        "$f52FuSNgpw"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const { data: prodData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products",
      {
        query: computed(() => form.branchId ? { branch_id: form.branchId } : {})
      },
      "$R59Z76tAnK"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const customers = computed(() => {
      var _a, _b;
      return ((_b = (_a = custData.value) == null ? void 0 : _a.customers) != null ? _b : []).map((c) => ({
        id: String(c.id),
        name: c.name,
        business: c.business_name || c.customer_type || ""
      }));
    });
    const bankAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({
        value: a.id,
        label: `${a.bank_name} \u2014 AC: ${a.account_number}`,
        sub: a.branch_name || a.account_name || ""
      }));
    });
    const cashAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = pettyData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({
        value: a.id,
        label: a.account_name,
        sub: a.branch_name || "Head Office"
      }));
    });
    const filteredCustomers = computed(() => {
      const q = customerQuery.value.toLowerCase().trim();
      if (!q) return customers.value.slice(0, 20);
      return customers.value.filter((c) => c.name.toLowerCase().includes(q) || (c.business || "").toLowerCase().includes(q)).slice(0, 20);
    });
    const variants = computed(() => {
      var _a, _b, _c;
      const list = [];
      for (const p of (_b = (_a = prodData.value) == null ? void 0 : _a.products) != null ? _b : []) {
        for (const v of (_c = p.variants) != null ? _c : []) {
          const priceLabel = v.unit_price ? ` \xB7 \u09F3${Number(v.unit_price).toLocaleString()}` : "";
          const gradeLabel = v.grade ? ` [${v.grade}]` : "";
          list.push({ id: String(v.id), name: `${p.base_name} (${v.weight_variant})${gradeLabel}${priceLabel}`, productId: String(p.id), price: v.unit_price ? Number(v.unit_price) : null });
        }
      }
      return list;
    });
    const subtotal = computed(() => form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0));
    const totalDiscount = computed(() => form.items.reduce((s, i) => s + (i.discount || 0), 0));
    const orderTotal = computed(() => subtotal.value - totalDiscount.value);
    const canSubmit = computed(() => !!form.customerId && !!form.transactionDate && form.items.some((i) => i.variantId) && ((form.amountPaid || 0) === 0 || (form.paymentMethod === "Cash" ? !!form.cashAccountId : !!form.bankAccountId)));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-4xl" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Backdated Order Entry",
        subtitle: "Admin-only \u2014 records a sale that already happened, straight to delivered with a historical ledger date",
        breadcrumb: ["Credit Sales", "Backdated Entry"]
      }, null, _parent));
      _push(`<div class="rounded-xl p-3 text-xs text-amber-300 leading-snug" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.08)", "border": "1px solid rgba(245,158,11,0.2)" })}"> \u26A0 This skips approval, production and dispatch entirely. The order is created directly as <strong>delivered</strong> and the invoice posts to the ledger + journal on the transaction date you set below \u2014 not today. Use this only to record sales the system missed, not for new orders. </div><div class="glass-card p-6 space-y-5"><h3 class="section-title">Sale Details</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="md:col-span-2 space-y-1.5 relative"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer *</label><div class="relative"><input${ssrRenderAttr("value", unref(customerQuery))} type="text" class="input-glass w-full pr-8" placeholder="Search customer by name or business\u2026" autocomplete="off">`);
      if (unref(form).customerId) {
        _push(`<button type="button" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(customerDropdownOpen) && unref(filteredCustomers).length) {
        _push(`<div class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl max-h-56 overflow-y-auto py-1.5" style="${ssrRenderStyle({ "background": "rgba(18,18,20,0.98)", "border": "1px solid rgba(255,255,255,0.10)", "box-shadow": "0 16px 40px rgba(0,0,0,0.65)", "backdrop-filter": "blur(20px)" })}"><!--[-->`);
        ssrRenderList(unref(filteredCustomers), (c) => {
          _push(`<button type="button" class="w-full text-left px-4 py-2.5 hover:bg-white/[0.07] transition-colors"><span class="text-sm text-gray-100 font-medium">${ssrInterpolate(c.name)}</span>`);
          if (c.business) {
            _push(`<span class="text-xs text-gray-500 ml-2">${ssrInterpolate(c.business)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Date * (backdated)</label><input${ssrRenderAttr("value", unref(form).transactionDate)} type="date"${ssrRenderAttr("max", unref(todayStr))} class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "") : ssrLooseEqual(unref(form).branchId, "")) ? " selected" : ""}>Select branch\u2026</option><!--[-->`);
      ssrRenderList(unref(orderBranches), (b) => {
        _push(`<option${ssrRenderAttr("value", String(b.id))}${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, String(b.id)) : ssrLooseEqual(unref(form).branchId, String(b.id))) ? " selected" : ""}>${ssrInterpolate(b.branch_type === "factory" ? "\u{1F3ED}" : "\u{1F4CD}")} ${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Address</label><textarea rows="2" class="input-glass resize-none" placeholder="Optional\u2026">${ssrInterpolate(unref(form).shippingAddress)}</textarea></div></div></div><div class="glass-card p-6 space-y-5"><div class="flex items-center justify-between"><h3 class="section-title">Line Items</h3><button class="btn-ghost text-xs py-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> Add Item </button></div><div class="space-y-3"><!--[-->`);
      ssrRenderList(unref(form).items, (item, idx) => {
        _push(`<div class="grid grid-cols-12 gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"><div class="col-span-4 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Product Variant</label><select class="input-glass text-xs py-2"><option value=""${ssrIncludeBooleanAttr(Array.isArray(item.variantId) ? ssrLooseContain(item.variantId, "") : ssrLooseEqual(item.variantId, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
        ssrRenderList(unref(variants), (v) => {
          _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(item.variantId) ? ssrLooseContain(item.variantId, v.id) : ssrLooseEqual(item.variantId, v.id)) ? " selected" : ""}>${ssrInterpolate(v.name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="col-span-2 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Qty</label><input${ssrRenderAttr("value", item.quantity)} type="number" min="1" class="input-glass text-xs py-2"></div><div class="col-span-2 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Unit Price</label><input${ssrRenderAttr("value", item.unitPrice)} type="number" class="input-glass text-xs py-2"></div><div class="col-span-2 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Discount</label><input${ssrRenderAttr("value", item.discount)} type="number" class="input-glass text-xs py-2"></div><div class="col-span-1 space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Total</label><p class="text-xs font-semibold text-gold-400 pt-2.5">\u09F3${ssrInterpolate((item.quantity * item.unitPrice - item.discount).toLocaleString())}</p></div><div class="col-span-1 flex items-end justify-center pb-1"><button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(form).items.length) {
        _push(`<div class="py-8 text-center text-sm text-gray-600">No items added yet. Click &quot;Add Item&quot; to start.</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex justify-end pt-2 border-t border-white/[0.06]"><div class="space-y-1.5 min-w-[220px]"><div class="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span class="text-gray-300">\u09F3${ssrInterpolate(unref(subtotal).toLocaleString())}</span></div><div class="flex justify-between text-xs text-gray-500"><span>Total Discount</span><span class="text-red-400">-\u09F3${ssrInterpolate(unref(totalDiscount).toLocaleString())}</span></div><div class="flex justify-between text-sm font-bold text-white border-t border-white/[0.06] pt-1.5 mt-1.5"><span>Total</span><span class="text-gold-400">\u09F3${ssrInterpolate(unref(orderTotal).toLocaleString())}</span></div></div></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Already Collected (optional)</h3><p class="text-xs text-gray-500">If money was already received at the time of this sale, record it here so the ledger balance is correct. Leave at \u09F30 if the full amount is still outstanding.</p><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Already Paid (\u09F3)</label><input${ssrRenderAttr("value", unref(form).amountPaid)} type="number" min="0"${ssrRenderAttr("max", unref(orderTotal))} class="input-glass" placeholder="0"></div></div>`);
      if ((unref(form).amountPaid || 0) > 0) {
        _push(`<div class="rounded-xl p-4 space-y-4" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.04)", "border": "1px solid rgba(16,185,129,0.15)" })}"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method *</label><div class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(paymentMethods, (m) => {
          _push(`<button type="button" class="${ssrRenderClass([
            "px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
            unref(form).paymentMethod === m.value ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" : "border-white/10 text-gray-500 hover:border-white/20"
          ])}">${ssrInterpolate(m.icon)} ${ssrInterpolate(m.label)}</button>`);
        });
        _push(`<!--]--></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4">`);
        if (unref(form).paymentMethod === "Cash") {
          _push(`<div class="md:col-span-2 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Petty Cash Account *</label>`);
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
        if (["Bank Transfer", "Cheque", "Card", "Mobile Banking"].includes(unref(form).paymentMethod)) {
          _push(`<!--[--><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bank Account *</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(form).bankAccountId,
            "onUpdate:modelValue": ($event) => unref(form).bankAccountId = $event,
            options: unref(bankAccountOptions),
            placeholder: "Type bank name or account number\u2026"
          }, null, _parent));
          _push(`</div>`);
          if (unref(form).paymentMethod === "Cheque") {
            _push(`<!--[--><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cheque Number</label><input${ssrRenderAttr("value", unref(form).chequeNumber)} class="input-glass font-mono" placeholder="e.g. 001234"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cheque Date</label><input${ssrRenderAttr("value", unref(form).chequeDate)} type="date" class="input-glass"></div><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference / Receipt No.</label><input${ssrRenderAttr("value", unref(form).reference)} class="input-glass font-mono" placeholder="Optional"></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes / Reason</label><textarea rows="2" class="input-glass resize-none" placeholder="Why this is being entered late\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div><div class="flex items-center justify-end gap-3">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/credit-sales",
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
      _push(`<button class="btn-gold"${ssrIncludeBooleanAttr(!unref(canSubmit) || unref(submitting)) ? " disabled" : ""}>`);
      if (unref(submitting)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(submitting) ? "Recording\u2026" : "Record Backdated Sale")}</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/backdated-entry.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=backdated-entry-CUW2Tzq8.mjs.map
