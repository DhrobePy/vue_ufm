import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseEqual, ssrLooseContain, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const saving = ref(false);
    const { data: poData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/orders",
      { query: { per: 500 } },
      "$RoWbuAFbn8"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allPOs = computed(() => {
      var _a, _b;
      return (_b = (_a = poData.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const form = reactive({
      note_type: "",
      reason_type: "",
      purchase_order_id: "",
      quantity_kg: 0,
      unit_price_per_kg: 0,
      amount: 0,
      description: ""
    });
    const selectedPO = computed(() => form.purchase_order_id ? allPOs.value.find((p) => p.id === Number(form.purchase_order_id)) : null);
    const isValid = computed(
      () => form.note_type && form.reason_type && form.purchase_order_id && form.amount > 0 && form.description
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Record Adjustment Note",
        subtitle: "Create a DAN or CAN for a purchase order",
        breadcrumb: ["Purchase", "Adjustments", "New"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/adjustments",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All Notes`);
                } else {
                  return [
                    createTextVNode("\u2190 All Notes")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/adjustments",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All Notes")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-6 space-y-5"><div class="space-y-3"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Note Type *</label><div class="grid grid-cols-2 gap-4"><label class="${ssrRenderClass([unref(form).note_type === "debit" ? "border-orange-500 bg-orange-500/10" : "border-white/[0.08] hover:border-orange-500/40", "cursor-pointer rounded-xl border-2 p-4 transition-all"])}"><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(form).note_type, "debit")) ? " checked" : ""} value="debit" class="sr-only"><p class="font-semibold text-orange-400 text-sm">\u25B2 Debit Note (DAN)</p><p class="text-xs text-gray-500 mt-1">We owe the supplier <strong class="text-gray-400">more</strong>.<br>Over-delivery, price adjustment (upward).</p></label><label class="${ssrRenderClass([unref(form).note_type === "credit" ? "border-blue-500 bg-blue-500/10" : "border-white/[0.08] hover:border-blue-500/40", "cursor-pointer rounded-xl border-2 p-4 transition-all"])}"><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(form).note_type, "credit")) ? " checked" : ""} value="credit" class="sr-only"><p class="font-semibold text-blue-400 text-sm">\u25BC Credit Note (CAN)</p><p class="text-xs text-gray-500 mt-1">Supplier owes us a <strong class="text-gray-400">reduction</strong>.<br>Short delivery, quality deduction, return.</p></label></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason *</label><select class="input-glass"${ssrIncludeBooleanAttr(!unref(form).note_type) ? " disabled" : ""}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason_type) ? ssrLooseContain(unref(form).reason_type, "") : ssrLooseEqual(unref(form).reason_type, "")) ? " selected" : ""}>\u2014 Select reason \u2014</option>`);
      if (unref(form).note_type === "debit") {
        _push(`<!--[--><option value="over_delivery"${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason_type) ? ssrLooseContain(unref(form).reason_type, "over_delivery") : ssrLooseEqual(unref(form).reason_type, "over_delivery")) ? " selected" : ""}>Over-Delivery (extra goods received)</option><option value="price_dispute"${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason_type) ? ssrLooseContain(unref(form).reason_type, "price_dispute") : ssrLooseEqual(unref(form).reason_type, "price_dispute")) ? " selected" : ""}>Price Dispute / Upward Price Adjustment</option><option value="other"${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason_type) ? ssrLooseContain(unref(form).reason_type, "other") : ssrLooseEqual(unref(form).reason_type, "other")) ? " selected" : ""}>Other (Debit)</option><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (unref(form).note_type === "credit") {
        _push(`<!--[--><option value="under_delivery_closure"${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason_type) ? ssrLooseContain(unref(form).reason_type, "under_delivery_closure") : ssrLooseEqual(unref(form).reason_type, "under_delivery_closure")) ? " selected" : ""}>Under-Delivery Closure (PO closed short)</option><option value="quality_deduction"${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason_type) ? ssrLooseContain(unref(form).reason_type, "quality_deduction") : ssrLooseEqual(unref(form).reason_type, "quality_deduction")) ? " selected" : ""}>Quality / Weight Deduction</option><option value="return"${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason_type) ? ssrLooseContain(unref(form).reason_type, "return") : ssrLooseEqual(unref(form).reason_type, "return")) ? " selected" : ""}>Goods Return</option><option value="other"${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason_type) ? ssrLooseContain(unref(form).reason_type, "other") : ssrLooseEqual(unref(form).reason_type, "other")) ? " selected" : ""}>Other (Credit)</option><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).purchase_order_id) ? ssrLooseContain(unref(form).purchase_order_id, "") : ssrLooseEqual(unref(form).purchase_order_id, "")) ? " selected" : ""}>\u2014 Select Purchase Order \u2014</option><!--[-->`);
      ssrRenderList(unref(allPOs), (po) => {
        var _a2;
        _push(`<option${ssrRenderAttr("value", po.id)}${ssrRenderAttr("data-supplier", po.supplier_name)}${ssrRenderAttr("data-balance", po.balance_payable)}${ssrRenderAttr("data-unit-price", po.unit_price_per_kg)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).purchase_order_id) ? ssrLooseContain(unref(form).purchase_order_id, po.id) : ssrLooseEqual(unref(form).purchase_order_id, po.id)) ? " selected" : ""}> PO #${ssrInterpolate(po.po_number)} \u2014 ${ssrInterpolate(po.supplier_name)} (Bal: \u09F3${ssrInterpolate(Number((_a2 = po.balance_payable) != null ? _a2 : 0).toLocaleString())}) </option>`);
      });
      _push(`<!--]--></select></div>`);
      if (unref(selectedPO)) {
        _push(`<div class="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-xs space-y-1"><div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">${ssrInterpolate(unref(selectedPO).supplier_name)}</span></div><div class="flex justify-between"><span class="text-gray-600">Ordered (kg)</span><span class="text-gray-300">${ssrInterpolate(Number(unref(selectedPO).quantity_kg).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Balance Due</span><span class="text-red-400 font-bold">\u09F3${ssrInterpolate(Number((_a = unref(selectedPO).balance_payable) != null ? _a : 0).toLocaleString())}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity (kg) <span class="text-gray-600 font-normal">optional</span></label><input${ssrRenderAttr("value", unref(form).quantity_kg)} type="number" min="0" step="0.01" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unit Price / kg <span class="text-gray-600 font-normal">optional</span></label><input${ssrRenderAttr("value", unref(form).unit_price_per_kg)} type="number" min="0" step="0.0001" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Amount (\u09F3) *</label><div class="relative"><span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">\u09F3</span><input${ssrRenderAttr("value", unref(form).amount)} type="number" min="0.01" step="0.01" class="input-glass pl-8 font-mono" placeholder="0.00"></div></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description / Details *</label><textarea rows="4" class="input-glass resize-none" placeholder="Explain the reason for this adjustment in detail\u2026">${ssrInterpolate(unref(form).description)}</textarea></div>`);
      if (unref(form).amount > 0 && unref(form).note_type) {
        _push(`<div class="${ssrRenderClass([unref(form).note_type === "debit" ? "bg-orange-500/10 border border-orange-500/30" : "bg-blue-500/10 border border-blue-500/30", "rounded-xl p-4 text-center"])}"><p class="text-xs text-gray-500 mb-1">Adjustment Amount</p><p class="${ssrRenderClass([unref(form).note_type === "debit" ? "text-orange-400" : "text-blue-400", "text-3xl font-bold"])}"> \u09F3${ssrInterpolate(Number(unref(form).amount).toLocaleString())}</p><p class="${ssrRenderClass([unref(form).note_type === "debit" ? "text-orange-400/70" : "text-blue-400/70", "text-xs mt-1"])}">${ssrInterpolate(unref(form).note_type === "debit" ? "DAN \u2014 This amount will be ADDED to PO balance payable when posted." : "CAN \u2014 This amount will be DEDUCTED from PO balance payable when posted.")}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center gap-3 pt-2"><button${ssrIncludeBooleanAttr(unref(saving) || !unref(isValid)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Creating\u2026" : "Create as Draft")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/adjustments",
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
      _push(`</div></div><div class="space-y-4"><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Workflow</h3><div class="space-y-3 text-xs text-gray-400"><div class="flex gap-3"><span class="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-[10px] font-bold">1</span><div><strong class="text-gray-300">Create (Draft)</strong><br>No financial effect yet.</div></div><div class="flex gap-3"><span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">2</span><div><strong class="text-gray-300">Approve</strong><br>Admin reviews and approves.</div></div><div class="flex gap-3"><span class="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span><div><strong class="text-gray-300">Post</strong><br>Financial effect applies:<br><ul class="list-disc ml-4 mt-1"><li>DAN \u2192 increases PO balance</li><li>CAN \u2192 decreases PO balance</li></ul></div></div></div></div><div class="glass-card p-4 border border-orange-500/20 text-xs text-gray-400"><p class="font-semibold text-orange-400 mb-1">\u26A0 Important</p><p>Creating a note does <strong class="text-gray-300">NOT</strong> affect payments or balances until it is approved and posted.</p></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/adjustments/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-DcFomYUn.mjs.map
