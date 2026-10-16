import { _ as __nuxt_component_0 } from './nuxt-link-DxEkMwEk.mjs';
import { _ as _sfc_main$1 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, computed, ref, withAsyncContext, reactive, watch, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, q as useUserSession } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useRoute();
    useToast();
    const { user: sessionUser } = useUserSession();
    const isAdminUser = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const submitting = ref(false);
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const tomorrowStr = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
    const money = (v) => Number(v != null ? v : 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
    const { data: branchListData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$RqEScBQ_sV"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const orderBranches = computed(() => {
      var _a, _b;
      return ((_b = (_a = branchListData.value) == null ? void 0 : _a.branches) != null ? _b : []).filter((b) => b.status === "active" && b.branch_type !== "office");
    });
    const blankItem = () => ({ variantId: "", productId: "", commodityId: "", commodityOrigin: "", quantity: 1, unitPrice: 0, discount: 0 });
    const form = reactive({
      customerId: "",
      orderDate: todayStr,
      requiredDate: tomorrowStr,
      branchId: "",
      priority: "normal",
      deliveryType: "big_truck",
      isOtherSales: false,
      shippingAddress: "",
      advancePaid: 0,
      notes: "",
      items: [blankItem()],
      advanceMethod: "Cash",
      advanceBankAccountId: "",
      advanceCashAccountId: "",
      advanceReference: "",
      advanceChequeNumber: "",
      advanceChequeDate: "",
      advanceBankTxType: "",
      advanceCollectedBy: ""
    });
    const takeAdvance = ref(false);
    const paymentMethods = [
      { value: "Cash", icon: "\u{1F4B5}", label: "Cash" },
      { value: "Bank Transfer", icon: "\u{1F3E6}", label: "Bank transfer" },
      { value: "Cheque", icon: "\u{1F4C4}", label: "Cheque" },
      { value: "Mobile Banking", icon: "\u{1F4F1}", label: "Mobile banking" },
      { value: "Card", icon: "\u{1F4B3}", label: "Card" }
    ];
    const [{ data: custData }, { data: bankData }, { data: pettyData }, { data: empData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/customers",
        { query: { per: 500, simple: "1" } },
        "$OQxQybB90P"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/bank-accounts",
        "$3iCI0YSqSa"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/cash-accounts",
        "$Tq1H37pZVK"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/lookup/employees",
        "$hfRPAFfWci"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const { data: prodData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products",
      { query: computed(() => form.branchId ? { branch_id: form.branchId } : {}) },
      "$h7EczRmNne"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: tradingComData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/trading/commodities",
      { ignoreResponseError: true },
      "$sq6Uve8DUi"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const tradingCommodities = computed(() => {
      var _a, _b;
      return (_b = (_a = tradingComData.value) == null ? void 0 : _a.commodities) != null ? _b : [];
    });
    const commodityOrigins = (id) => {
      var _a, _b;
      return (_b = (_a = tradingCommodities.value.find((c) => String(c.id) === String(id))) == null ? void 0 : _a.origins) != null ? _b : [];
    };
    const extraCustomer = ref(null);
    const customers = computed(() => {
      var _a, _b;
      const toRow = (c) => ({ id: String(c.id), name: c.name, business: c.business_name || "", phone: c.phone_number || "", type: c.customer_type, status: c.status });
      const list = ((_b = (_a = custData.value) == null ? void 0 : _a.customers) != null ? _b : []).map(toRow).filter((c) => c.type === "Credit" && c.status === "active");
      const x = extraCustomer.value;
      return x && !list.some((c) => c.id === x.id) ? [...list, x] : list;
    });
    const bankAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({ value: a.id, label: `${a.bank_name} \u2014 AC: ${a.account_number}`, sub: a.branch_name || a.account_name || "" }));
    });
    const cashAccountOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = pettyData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({ value: a.id, label: a.account_name, sub: a.branch_name || "Head Office" }));
    });
    const employeeOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = empData.value) == null ? void 0 : _a.employees) != null ? _b : []).map((e) => {
        var _a2;
        return { value: e.id, label: `${e.first_name} ${(_a2 = e.last_name) != null ? _a2 : ""}`.trim() };
      });
    });
    const customerQuery = ref("");
    const customerDropdownOpen = ref(false);
    ref(null);
    const selectedCustomer = computed(() => {
      var _a;
      return (_a = customers.value.find((c) => c.id === form.customerId)) != null ? _a : null;
    });
    const filteredCustomers = computed(() => {
      const q = customerQuery.value.toLowerCase().trim();
      const list = customers.value;
      return (q ? list.filter((c) => c.name.toLowerCase().includes(q) || c.business.toLowerCase().includes(q) || c.phone.includes(q)) : list).slice(0, 25);
    });
    const advCredit = reactive({ total: 0, legacy: 0 });
    const useAdvanceCredit = ref(true);
    const customerPendingExposure = ref(0);
    const customerData = ref(null);
    watch(() => form.customerId, async (id) => {
      var _a, _b, _c;
      customerPendingExposure.value = 0;
      customerData.value = null;
      advCredit.total = 0;
      advCredit.legacy = 0;
      if (!id) return;
      $fetch(`/api/customers/${id}/advance-credit`).then((a) => {
        var _a2, _b2;
        advCredit.total = Number((_a2 = a == null ? void 0 : a.total) != null ? _a2 : 0);
        advCredit.legacy = ((_b2 = a == null ? void 0 : a.payments) != null ? _b2 : []).filter((p) => p.legacy).reduce((t, p) => t + Number(p.remaining), 0);
      }).catch(() => {
      });
      try {
        const r = await $fetch(`/api/customers/${id}/credit-exposure`);
        customerPendingExposure.value = Number((_a = r == null ? void 0 : r.pending) != null ? _a : 0);
        customerData.value = { limit: Number((_b = r == null ? void 0 : r.limit) != null ? _b : 0), ledger: Number((_c = r == null ? void 0 : r.ledger) != null ? _c : 0) };
      } catch {
      }
    });
    const creditLimit = computed(() => {
      var _a, _b;
      return (_b = (_a = customerData.value) == null ? void 0 : _a.limit) != null ? _b : 0;
    });
    const creditLedger = computed(() => {
      var _a, _b;
      return (_b = (_a = customerData.value) == null ? void 0 : _a.ledger) != null ? _b : 0;
    });
    const variants = computed(() => {
      var _a, _b, _c;
      const list = [];
      for (const p of (_b = (_a = prodData.value) == null ? void 0 : _a.products) != null ? _b : [])
        for (const v of (_c = p.variants) != null ? _c : [])
          list.push({ id: String(v.id), name: `${p.base_name} (${v.weight_variant})${v.grade ? ` [${v.grade}]` : ""}${v.unit_price ? ` \xB7 \u09F3${Number(v.unit_price).toLocaleString()}` : ""}`, productId: String(p.id), price: v.unit_price ? Number(v.unit_price) : null });
      return list;
    });
    watch(prodData, () => {
      for (const it of form.items) {
        if (!it.variantId) continue;
        const m = variants.value.find((v) => v.id === it.variantId);
        if (m == null ? void 0 : m.price) it.unitPrice = m.price;
      }
    });
    const lineTotal = (i) => Math.max(0, (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0) - (Number(i.discount) || 0));
    const validItems = computed(() => form.items.filter((i) => (form.isOtherSales ? i.commodityId : i.variantId) && Number(i.quantity) > 0 && Number(i.unitPrice) >= 0));
    const subtotal = computed(() => validItems.value.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0));
    const totalDiscount = computed(() => validItems.value.reduce((s, i) => s + (Number(i.discount) || 0), 0));
    const totalQty = computed(() => validItems.value.reduce((s, i) => s + (Number(i.quantity) || 0), 0));
    const currentOrderTotal = computed(() => subtotal.value - totalDiscount.value);
    const advance = computed(() => takeAdvance.value ? Number(form.advancePaid) || 0 : 0);
    const balanceDue = computed(() => Math.max(0, currentOrderTotal.value - advance.value));
    const totalExposure = computed(() => creditLedger.value + customerPendingExposure.value + balanceDue.value);
    const creditUtilPct = computed(() => creditLimit.value > 0 ? Math.min(150, Math.round(totalExposure.value / creditLimit.value * 100)) : 0);
    const creditLeft = computed(() => Math.max(0, creditLimit.value - totalExposure.value));
    const overLimit = computed(() => creditLimit.value > 0 && totalExposure.value > creditLimit.value);
    const outcome = computed(() => {
      if (!selectedCustomer.value || !validItems.value.length) return null;
      if (overLimit.value) return { label: "Over credit limit \u2192 will be escalated", cls: "bg-red-500/15 text-red-300" };
      if (isAdminUser.value) return { label: "Within limit \u2192 auto-approved", cls: "bg-emerald-500/15 text-emerald-300" };
      return { label: "Within limit \u2192 goes to approval", cls: "bg-sky-500/15 text-sky-300" };
    });
    const problems = computed(() => {
      const p = [];
      if (!form.customerId) p.push("Choose a customer");
      if (!form.branchId) p.push("Choose a branch");
      if (!validItems.value.length) p.push("Add at least one item with a quantity");
      if (takeAdvance.value) {
        if (!(advance.value > 0)) p.push("Enter the advance amount");
        else if (advance.value > currentOrderTotal.value + 1e-3) p.push("Advance is more than the order total");
        const m = form.advanceMethod;
        if (m === "Cash" && !form.advanceCashAccountId) p.push("Pick the petty cash account");
        if (["Bank Transfer", "Cheque", "Card"].includes(m) && !form.advanceBankAccountId) p.push("Pick the bank account");
        if (m === "Mobile Banking" && !form.advanceReference.trim()) p.push("Enter the transaction reference");
      }
      return p;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSearchSelect = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-[1400px] mx-auto pb-28 lg:pb-4" }, _attrs))} data-v-83cce00a><div class="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3" data-v-83cce00a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/credit-sales",
        class: "text-gray-500 hover:text-gray-200 text-sm",
        title: "Back"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190`);
          } else {
            return [
              createTextVNode("\u2190")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h1 class="text-lg font-bold text-gray-100" data-v-83cce00a>New Credit Order</h1><span class="text-xs text-gray-600" data-v-83cce00a>Credit Sales / Create Order</span><span class="flex-1" data-v-83cce00a></span>`);
      if (unref(outcome)) {
        _push(`<span class="${ssrRenderClass([unref(outcome).cls, "px-2.5 py-1 rounded-full text-[11px] font-semibold"])}" data-v-83cce00a>${ssrInterpolate(unref(outcome).label)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start" data-v-83cce00a><div class="space-y-3 min-w-0" data-v-83cce00a><section class="glass-card p-3 sm:p-4 space-y-3" data-v-83cce00a><div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end" data-v-83cce00a><div class="relative" data-v-83cce00a><label class="lbl" data-v-83cce00a>Customer *</label><div class="relative" data-v-83cce00a><input${ssrRenderAttr("value", unref(customerQuery))} type="text" class="ci w-full pr-8" placeholder="Search customer by name, business or phone\u2026" autocomplete="off" data-v-83cce00a>`);
      if (unref(form).customerId) {
        _push(`<button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300" title="Clear" data-v-83cce00a>\u2715</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(customerDropdownOpen) && unref(filteredCustomers).length) {
        _push(`<div class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl max-h-60 overflow-y-auto py-1" style="${ssrRenderStyle({ "background": "rgba(18,18,20,0.98)", "border": "1px solid rgba(255,255,255,0.10)", "box-shadow": "0 16px 40px rgba(0,0,0,0.65)" })}" data-v-83cce00a><!--[-->`);
        ssrRenderList(unref(filteredCustomers), (c) => {
          _push(`<button type="button" class="w-full text-left px-3 py-2 hover:bg-white/[0.07] flex items-baseline gap-2" data-v-83cce00a><span class="text-sm text-gray-100 font-medium truncate" data-v-83cce00a>${ssrInterpolate(c.name)}</span>`);
          if (c.business) {
            _push(`<span class="text-[11px] text-gray-500 truncate" data-v-83cce00a>${ssrInterpolate(c.business)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<span class="ml-auto text-[10px] text-gray-600 shrink-0" data-v-83cce00a>${ssrInterpolate(c.phone)}</span></button>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(customerDropdownOpen) && unref(customerQuery).length >= 1) {
        _push(`<div class="absolute left-0 right-0 top-full mt-1 z-30 rounded-xl py-3 text-center text-xs text-gray-500" style="${ssrRenderStyle({ "background": "rgba(18,18,20,0.98)", "border": "1px solid rgba(255,255,255,0.10)" })}" data-v-83cce00a>No active credit customer matches \u201C${ssrInterpolate(unref(customerQuery))}\u201D</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Sale type</label><div class="seg" data-v-83cce00a><button type="button" class="${ssrRenderClass({ on: !unref(form).isOtherSales })}" data-v-83cce00a>\u{1F33E} Flour</button><button type="button" class="${ssrRenderClass({ on: unref(form).isOtherSales, em: true })}" data-v-83cce00a>\u{1F4E6} Other Sales</button></div></div></div><div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3" data-v-83cce00a><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Branch *</label><select class="ci w-full" data-v-83cce00a><option value="" data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "") : ssrLooseEqual(unref(form).branchId, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
      ssrRenderList(unref(orderBranches), (b) => {
        _push(`<option${ssrRenderAttr("value", String(b.id))} data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, String(b.id)) : ssrLooseEqual(unref(form).branchId, String(b.id))) ? " selected" : ""}>${ssrInterpolate(b.branch_type === "factory" ? "\u{1F3ED}" : "\u{1F4CD}")} ${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Required date</label><input${ssrRenderAttr("value", unref(form).requiredDate)} type="date" class="ci w-full" data-v-83cce00a></div><div class="col-span-2 md:col-span-1 xl:col-span-2" data-v-83cce00a><label class="lbl" data-v-83cce00a>Delivery</label><div class="seg" data-v-83cce00a><button type="button" class="${ssrRenderClass({ on: unref(form).deliveryType === "big_truck" })}" data-v-83cce00a>\u{1F69B} Big truck</button><button type="button" class="${ssrRenderClass({ on: unref(form).deliveryType === "mini_truck", warn: true })}" data-v-83cce00a>\u{1F6FB} Mini truck</button></div></div><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Priority</label><select class="ci w-full" data-v-83cce00a><option value="normal" data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "normal") : ssrLooseEqual(unref(form).priority, "normal")) ? " selected" : ""}>Normal</option><option value="high" data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "high") : ssrLooseEqual(unref(form).priority, "high")) ? " selected" : ""}>High</option><option value="urgent" data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "urgent") : ssrLooseEqual(unref(form).priority, "urgent")) ? " selected" : ""}>Urgent</option></select></div>`);
      if (unref(isAdminUser)) {
        _push(`<div data-v-83cce00a><label class="lbl" data-v-83cce00a>Order date <span class="text-amber-500 normal-case" data-v-83cce00a>(admin)</span></label><input${ssrRenderAttr("value", unref(form).orderDate)} type="date"${ssrRenderAttr("max", unref(todayStr))} class="ci w-full" data-v-83cce00a></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(form).deliveryType === "mini_truck") {
        _push(`<p class="text-[11px] text-amber-500/90 -mt-1" data-v-83cce00a>Mini-truck: the branch\u2019s per-bag surcharge is added automatically when the order is saved.</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-3" data-v-83cce00a><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Delivery address</label><textarea rows="2" class="ci w-full resize-none" placeholder="Where should it go?" data-v-83cce00a>${ssrInterpolate(unref(form).shippingAddress)}</textarea></div><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Special instructions</label><textarea rows="2" class="ci w-full resize-none" placeholder="Anything the approver / production / dispatch should know" data-v-83cce00a>${ssrInterpolate(unref(form).notes)}</textarea></div></div></section><section class="glass-card p-3 sm:p-4" data-v-83cce00a><div class="flex items-center gap-2 mb-2" data-v-83cce00a><h3 class="section-title" data-v-83cce00a>${ssrInterpolate(unref(form).isOtherSales ? "Commodities" : "Items")}</h3><span class="text-[11px] text-gray-600" data-v-83cce00a>${ssrInterpolate(unref(validItems).length)} line${ssrInterpolate(unref(validItems).length === 1 ? "" : "s")} \xB7 ${ssrInterpolate(unref(totalQty))} ${ssrInterpolate(unref(form).isOtherSales ? "units" : "bags")}</span><span class="flex-1" data-v-83cce00a></span><button type="button" class="btn-ghost text-xs py-1 px-2.5" data-v-83cce00a>\uFF0B Add item</button></div><div class="hidden md:grid grid-cols-[minmax(0,1fr)_84px_104px_96px_104px_28px] gap-2 px-1 pb-1 text-[10px] uppercase tracking-wider text-gray-600 font-semibold" data-v-83cce00a><span data-v-83cce00a>${ssrInterpolate(unref(form).isOtherSales ? "Commodity / origin" : "Product variant")}</span><span class="text-right" data-v-83cce00a>Qty</span><span class="text-right" data-v-83cce00a>Unit price</span><span class="text-right" data-v-83cce00a>Discount</span><span class="text-right" data-v-83cce00a>Line total</span><span data-v-83cce00a></span></div><div class="space-y-1.5 md:max-h-[calc(100vh-520px)] md:min-h-[120px] md:overflow-y-auto md:pr-1" data-v-83cce00a><!--[-->`);
      ssrRenderList(unref(form).items, (item, idx) => {
        _push(`<div class="grid grid-cols-3 md:grid-cols-[minmax(0,1fr)_84px_104px_96px_104px_28px] gap-2 items-center rounded-xl p-2 md:p-1.5 border border-white/[0.06] bg-white/[0.02]" data-v-83cce00a><div class="col-span-3 md:col-span-1 min-w-0" data-v-83cce00a>`);
        if (!unref(form).isOtherSales) {
          _push(`<select class="ci w-full" data-v-83cce00a><option value="" data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(item.variantId) ? ssrLooseContain(item.variantId, "") : ssrLooseEqual(item.variantId, "")) ? " selected" : ""}>Select product\u2026</option><!--[-->`);
          ssrRenderList(unref(variants), (v) => {
            _push(`<option${ssrRenderAttr("value", v.id)} data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(item.variantId) ? ssrLooseContain(item.variantId, v.id) : ssrLooseEqual(item.variantId, v.id)) ? " selected" : ""}>${ssrInterpolate(v.name)}</option>`);
          });
          _push(`<!--]--></select>`);
        } else {
          _push(`<div class="grid grid-cols-2 gap-2" data-v-83cce00a><select class="ci w-full" data-v-83cce00a><option value="" data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(item.commodityId) ? ssrLooseContain(item.commodityId, "") : ssrLooseEqual(item.commodityId, "")) ? " selected" : ""}>Commodity\u2026</option><!--[-->`);
          ssrRenderList(unref(tradingCommodities), (c) => {
            _push(`<option${ssrRenderAttr("value", String(c.id))}${ssrIncludeBooleanAttr(!c.ready) ? " disabled" : ""} data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(item.commodityId) ? ssrLooseContain(item.commodityId, String(c.id)) : ssrLooseEqual(item.commodityId, String(c.id))) ? " selected" : ""}>${ssrInterpolate(c.name)} (${ssrInterpolate(c.unit)})</option>`);
          });
          _push(`<!--]--></select><select class="ci w-full" data-v-83cce00a><option value="" data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(item.commodityOrigin) ? ssrLooseContain(item.commodityOrigin, "") : ssrLooseEqual(item.commodityOrigin, "")) ? " selected" : ""}>Origin: any</option><!--[-->`);
          ssrRenderList(commodityOrigins(item.commodityId), (o) => {
            _push(`<option${ssrRenderAttr("value", o)} data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(item.commodityOrigin) ? ssrLooseContain(item.commodityOrigin, o) : ssrLooseEqual(item.commodityOrigin, o)) ? " selected" : ""}>${ssrInterpolate(o)}</option>`);
          });
          _push(`<!--]--></select></div>`);
        }
        _push(`</div><label class="md:contents" data-v-83cce00a><span class="mlbl block md:hidden" data-v-83cce00a>Qty</span><input${ssrRenderAttr("value", item.quantity)} type="number" min="1" inputmode="numeric" class="ci w-full text-right" data-v-83cce00a></label><label class="md:contents" data-v-83cce00a><span class="mlbl block md:hidden" data-v-83cce00a>Unit price</span><input${ssrRenderAttr("value", item.unitPrice)} type="number" min="0" inputmode="decimal" class="ci w-full text-right" data-v-83cce00a></label><label class="md:contents" data-v-83cce00a><span class="mlbl block md:hidden" data-v-83cce00a>Discount</span><input${ssrRenderAttr("value", item.discount)} type="number" min="0" inputmode="decimal" class="ci w-full text-right" placeholder="0" data-v-83cce00a></label><div class="col-span-2 md:col-span-1 text-right font-mono text-sm font-semibold text-gold-400 px-1 md:px-0" data-v-83cce00a>\u09F3${ssrInterpolate(money(lineTotal(item)))}</div><button type="button" class="justify-self-end w-7 h-7 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10" title="Remove line" data-v-83cce00a>\u2715</button></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(form).items.length) {
        _push(`<div class="py-6 text-center text-sm text-gray-600" data-v-83cce00a>No items yet \u2014 click \u201CAdd item\u201D.</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><section class="glass-card p-3 sm:p-4" data-v-83cce00a><label class="flex items-center gap-3 cursor-pointer select-none" data-v-83cce00a><input${ssrIncludeBooleanAttr(Array.isArray(unref(takeAdvance)) ? ssrLooseContain(unref(takeAdvance), null) : unref(takeAdvance)) ? " checked" : ""} type="checkbox" class="sr-only" data-v-83cce00a><span class="${ssrRenderClass([unref(takeAdvance) ? "bg-emerald-500" : "bg-white/15", "relative inline-block w-9 h-5 rounded-full transition-colors"])}" data-v-83cce00a><span class="${ssrRenderClass([unref(takeAdvance) ? "left-[18px]" : "left-0.5", "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"])}" data-v-83cce00a></span></span><span class="text-sm font-semibold text-gray-200" data-v-83cce00a>Customer is paying an advance now</span>`);
      if (unref(takeAdvance) && (unref(form).advancePaid || 0) > 0) {
        _push(`<span class="ml-auto font-mono text-emerald-400 text-sm" data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(form).advancePaid))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label>`);
      if (unref(takeAdvance)) {
        _push(`<div class="mt-3 space-y-3 rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.04)", "border": "1px solid rgba(16,185,129,0.15)" })}" data-v-83cce00a><div class="grid grid-cols-2 md:grid-cols-4 gap-3" data-v-83cce00a><div class="col-span-2 md:col-span-1" data-v-83cce00a><label class="lbl" data-v-83cce00a>Advance (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).advancePaid)} type="number" min="0" inputmode="decimal" class="ci w-full font-mono" placeholder="0" data-v-83cce00a></div><div class="col-span-2 md:col-span-3" data-v-83cce00a><label class="lbl" data-v-83cce00a>Method *</label><div class="flex flex-wrap gap-1.5" data-v-83cce00a><!--[-->`);
        ssrRenderList(paymentMethods, (m) => {
          _push(`<button type="button" class="${ssrRenderClass(["px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all", unref(form).advanceMethod === m.value ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" : "border-white/10 text-gray-500 hover:border-white/20"])}" data-v-83cce00a>${ssrInterpolate(m.icon)} ${ssrInterpolate(m.label)}</button>`);
        });
        _push(`<!--]--></div></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3" data-v-83cce00a>`);
        if (unref(form).advanceMethod === "Cash") {
          _push(`<div class="sm:col-span-2" data-v-83cce00a><label class="lbl" data-v-83cce00a>Petty cash account *</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(form).advanceCashAccountId,
            "onUpdate:modelValue": ($event) => unref(form).advanceCashAccountId = $event,
            options: unref(cashAccountOptions),
            placeholder: "Cash box / account\u2026"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (["Bank Transfer", "Cheque", "Card"].includes(unref(form).advanceMethod)) {
          _push(`<!--[--><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Bank account *</label>`);
          _push(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(form).advanceBankAccountId,
            "onUpdate:modelValue": ($event) => unref(form).advanceBankAccountId = $event,
            options: unref(bankAccountOptions),
            placeholder: "Bank / account no\u2026"
          }, null, _parent));
          _push(`</div>`);
          if (unref(form).advanceMethod === "Bank Transfer") {
            _push(`<div data-v-83cce00a><label class="lbl" data-v-83cce00a>Transfer type</label><select class="ci w-full" data-v-83cce00a><option value="" data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(unref(form).advanceBankTxType) ? ssrLooseContain(unref(form).advanceBankTxType, "") : ssrLooseEqual(unref(form).advanceBankTxType, "")) ? " selected" : ""}>\u2014 select \u2014</option><!--[-->`);
            ssrRenderList(["RTGS", "BEFTN", "NPSB", "Online", "Deposit"], (t) => {
              _push(`<option${ssrRenderAttr("value", t)} data-v-83cce00a${ssrIncludeBooleanAttr(Array.isArray(unref(form).advanceBankTxType) ? ssrLooseContain(unref(form).advanceBankTxType, t) : ssrLooseEqual(unref(form).advanceBankTxType, t)) ? " selected" : ""}>${ssrInterpolate(t)}</option>`);
            });
            _push(`<!--]--></select></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(form).advanceMethod === "Cheque") {
            _push(`<!--[--><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Cheque no.</label><input${ssrRenderAttr("value", unref(form).advanceChequeNumber)} class="ci w-full font-mono" data-v-83cce00a></div><div data-v-83cce00a><label class="lbl" data-v-83cce00a>Cheque date</label><input${ssrRenderAttr("value", unref(form).advanceChequeDate)} type="date" class="ci w-full" data-v-83cce00a></div><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        if (unref(form).advanceMethod === "Mobile Banking") {
          _push(`<div class="sm:col-span-2" data-v-83cce00a><label class="lbl" data-v-83cce00a>Transaction reference *</label><input${ssrRenderAttr("value", unref(form).advanceReference)} class="ci w-full font-mono" placeholder="e.g. bKash TXN ID" data-v-83cce00a></div>`);
        } else {
          _push(`<div data-v-83cce00a><label class="lbl" data-v-83cce00a>Reference / receipt no.</label><input${ssrRenderAttr("value", unref(form).advanceReference)} class="ci w-full font-mono" placeholder="optional" data-v-83cce00a></div>`);
        }
        _push(`<div data-v-83cce00a><label class="lbl" data-v-83cce00a>Collected by</label>`);
        _push(ssrRenderComponent(_component_UiSearchSelect, {
          modelValue: unref(form).advanceCollectedBy,
          "onUpdate:modelValue": ($event) => unref(form).advanceCollectedBy = $event,
          options: unref(employeeOptions),
          placeholder: "Employee\u2026"
        }, null, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section></div><aside class="space-y-3 lg:sticky lg:top-20" data-v-83cce00a>`);
      if (unref(selectedCustomer)) {
        _push(`<section class="glass-card p-3 sm:p-4 space-y-2" style="${ssrRenderStyle(unref(creditUtilPct) > 100 ? "border-color:rgba(239,68,68,0.35)" : "")}" data-v-83cce00a><div class="flex items-center gap-2" data-v-83cce00a><span class="text-xs font-semibold text-gray-400 truncate" data-v-83cce00a>Credit \u2014 ${ssrInterpolate(unref(selectedCustomer).name)}</span><span class="${ssrRenderClass([unref(creditUtilPct) > 100 ? "text-red-400" : unref(creditUtilPct) > 80 ? "text-orange-400" : "text-emerald-400", "ml-auto text-[11px] font-bold"])}" data-v-83cce00a>${ssrInterpolate(unref(creditLimit) > 0 ? unref(creditUtilPct) + "%" : "no limit")}</span></div><div class="h-1.5 rounded-full bg-white/[0.07] overflow-hidden" data-v-83cce00a><div class="h-full rounded-full transition-all" style="${ssrRenderStyle(`width:${Math.min(unref(creditUtilPct), 100)}%;background:${unref(creditUtilPct) > 100 ? "#ef4444" : unref(creditUtilPct) > 80 ? "#f97316" : "#10b981"}`)}" data-v-83cce00a></div></div><dl class="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]" data-v-83cce00a><div data-v-83cce00a><dt class="text-gray-600" data-v-83cce00a>Limit</dt><dd class="font-mono font-semibold text-gray-200" data-v-83cce00a>${ssrInterpolate(unref(creditLimit) > 0 ? "\u09F3" + money(unref(creditLimit)) : "\u2014")}</dd></div><div data-v-83cce00a><dt class="text-gray-600" data-v-83cce00a>Owes (ledger)</dt><dd class="font-mono font-semibold text-orange-300" data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(creditLedger)))}</dd></div><div data-v-83cce00a><dt class="text-gray-600" data-v-83cce00a>Open orders</dt><dd class="font-mono font-semibold text-yellow-300" data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(customerPendingExposure)))}</dd></div><div data-v-83cce00a><dt class="text-gray-600" data-v-83cce00a>Left after this</dt><dd class="${ssrRenderClass([unref(creditLeft) > 0 || unref(creditLimit) <= 0 ? "text-emerald-300" : "text-red-400", "font-mono font-bold"])}" data-v-83cce00a>${ssrInterpolate(unref(creditLimit) > 0 ? "\u09F3" + money(unref(creditLeft)) : "\u2014")}</dd></div></dl>`);
        if (unref(advCredit).total > 0) {
          _push(`<label class="flex items-start gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/[0.06] p-2 text-[11px] cursor-pointer" data-v-83cce00a><input${ssrIncludeBooleanAttr(Array.isArray(unref(useAdvanceCredit)) ? ssrLooseContain(unref(useAdvanceCredit), null) : unref(useAdvanceCredit)) ? " checked" : ""} type="checkbox" class="mt-0.5 accent-emerald-500" data-v-83cce00a><span class="text-emerald-300 leading-snug" data-v-83cce00a>`);
          if (unref(advCredit).total - unref(advCredit).legacy > 0) {
            _push(`<!--[-->Earlier advance <b data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(advCredit).total - unref(advCredit).legacy))}</b> is on account \u2014 apply it to this customer&#39;s open orders, oldest first (incl. this one).<!--]-->`);
          } else {
            _push(`<!--[-->No new advance on account.<!--]-->`);
          }
          if (unref(advCredit).legacy) {
            _push(`<span class="block text-gray-500" data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(advCredit).legacy))} more is from the old app \u2014 allot that by hand from the customer page.</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span></label>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<section class="glass-card p-3 text-xs text-gray-600 text-center" data-v-83cce00a>Pick a customer to see their credit position.</section>`);
      }
      _push(`<section class="glass-card p-3 sm:p-4 space-y-2" data-v-83cce00a><div class="flex justify-between text-xs text-gray-500" data-v-83cce00a><span data-v-83cce00a>Subtotal</span><span class="font-mono text-gray-300" data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(subtotal)))}</span></div>`);
      if (unref(totalDiscount) > 0) {
        _push(`<div class="flex justify-between text-xs text-gray-500" data-v-83cce00a><span data-v-83cce00a>Discount</span><span class="font-mono text-red-400" data-v-83cce00a>\u2212\u09F3${ssrInterpolate(money(unref(totalDiscount)))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(form).deliveryType === "mini_truck") {
        _push(`<div class="flex justify-between text-xs text-amber-500/80" data-v-83cce00a><span data-v-83cce00a>Mini-truck surcharge</span><span data-v-83cce00a>added on save</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex justify-between text-sm font-bold text-white border-t border-white/[0.08] pt-2" data-v-83cce00a><span data-v-83cce00a>Order total</span><span class="font-mono text-gold-400" data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(currentOrderTotal)))}</span></div>`);
      if (unref(takeAdvance) && (unref(form).advancePaid || 0) > 0) {
        _push(`<div class="flex justify-between text-xs text-gray-500" data-v-83cce00a><span data-v-83cce00a>Advance (${ssrInterpolate(unref(form).advanceMethod)})</span><span class="font-mono text-emerald-400" data-v-83cce00a>\u2212\u09F3${ssrInterpolate(money(unref(form).advancePaid))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex justify-between text-sm font-bold text-white" data-v-83cce00a><span data-v-83cce00a>Balance due</span><span class="font-mono text-gold-400" data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(balanceDue)))}</span></div>`);
      if (unref(problems).length) {
        _push(`<ul class="text-[11px] text-amber-400/90 space-y-0.5 pt-1" data-v-83cce00a><!--[-->`);
        ssrRenderList(unref(problems), (p) => {
          _push(`<li data-v-83cce00a>\u2022 ${ssrInterpolate(p)}</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="hidden lg:flex gap-2 pt-1" data-v-83cce00a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/credit-sales",
        class: "btn-ghost flex-1 justify-center text-sm"
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
      _push(`<button class="btn-gold flex-[2] justify-center text-sm"${ssrIncludeBooleanAttr(unref(submitting) || unref(problems).length > 0) ? " disabled" : ""} data-v-83cce00a>${ssrInterpolate(unref(submitting) ? "Submitting\u2026" : "\u2713 Submit order")}</button></div></section></aside></div><div class="lg:hidden fixed bottom-0 inset-x-0 z-30 px-3 py-2.5 flex items-center gap-3" style="${ssrRenderStyle({ "background": "rgba(14,12,10,0.97)", "border-top": "1px solid rgba(255,255,255,0.1)", "padding-bottom": "max(0.625rem,env(safe-area-inset-bottom))" })}" data-v-83cce00a><div class="min-w-0" data-v-83cce00a><p class="text-[10px] text-gray-500 leading-none" data-v-83cce00a>Balance due</p><p class="font-mono font-bold text-gold-400 text-base leading-tight" data-v-83cce00a>\u09F3${ssrInterpolate(money(unref(balanceDue)))}</p></div><span class="flex-1" data-v-83cce00a></span>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/credit-sales",
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
      _push(`<button class="btn-gold text-sm px-5"${ssrIncludeBooleanAttr(unref(submitting) || unref(problems).length > 0) ? " disabled" : ""} data-v-83cce00a>${ssrInterpolate(unref(submitting) ? "\u2026" : "\u2713 Submit")}</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const create = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-83cce00a"]]);

export { create as default };
//# sourceMappingURL=create-DTM10z-5.mjs.map
