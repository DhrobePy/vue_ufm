import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const { data: poData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/orders/open",
      "$0dhNeqPc_c"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const openPOs = computed(() => {
      var _a, _b;
      return (_b = (_a = poData.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const form = reactive({
      po_id: "",
      grn_date: today,
      truck_number: "",
      quantity_received_kg: 0,
      expected_quantity: 0,
      unload_point_name: "",
      remarks: "",
      over_delivery_action: "as_is",
      excess_qty: 0
    });
    const saving = ref(false);
    const selectedPO = computed(() => {
      var _a;
      return (_a = openPOs.value.find((p) => p.id === Number(form.po_id))) != null ? _a : null;
    });
    const showVariance = computed(
      () => form.expected_quantity > 0 && form.quantity_received_kg > 0
    );
    const varianceKg = computed(() => form.quantity_received_kg - form.expected_quantity);
    const variancePct = computed(
      () => form.expected_quantity > 0 ? varianceKg.value / form.expected_quantity * 100 : 0
    );
    const varianceBg = computed(() => {
      const pct = Math.abs(variancePct.value);
      if (pct > 1) return "bg-red-500/[0.08] border-red-400/40 text-red-300";
      if (pct > 0.5) return "bg-yellow-500/[0.08] border-yellow-400/40 text-yellow-300";
      return "bg-emerald-500/[0.08] border-emerald-400/40 text-emerald-300";
    });
    const calculatedValue = computed(() => {
      var _a, _b;
      const unitPrice = Number((_b = (_a = selectedPO.value) == null ? void 0 : _a.unit_price_per_kg) != null ? _b : 0);
      const expected = form.expected_quantity || 0;
      return unitPrice * expected;
    });
    const overDelivery = reactive({ show: false, pending: 0, excess: 0, choiceConfirmed: false });
    const isValid = computed(
      () => !!form.po_id && !!form.grn_date && form.quantity_received_kg > 0 && !!form.unload_point_name
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Record Goods Received",
        subtitle: "Record inbound wheat delivery against a Purchase Order",
        breadcrumb: ["Purchase", "GRN", "Record GRN"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/grn",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All GRNs`);
                } else {
                  return [
                    createTextVNode("\u2190 All GRNs")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/grn",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All GRNs")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">GRN Details</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"> Purchase Order <span class="text-red-500">*</span></label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).po_id) ? ssrLooseContain(unref(form).po_id, "") : ssrLooseEqual(unref(form).po_id, "")) ? " selected" : ""}>\u2014 Select Purchase Order \u2014</option><!--[-->`);
      ssrRenderList(unref(openPOs), (po) => {
        _push(`<option${ssrRenderAttr("value", po.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).po_id) ? ssrLooseContain(unref(form).po_id, po.id) : ssrLooseEqual(unref(form).po_id, po.id)) ? " selected" : ""}> PO #${ssrInterpolate(po.po_number)} \u2014 ${ssrInterpolate(po.supplier_name)} \u2014 ${ssrInterpolate(po.wheat_origin)} (Pending: ${ssrInterpolate(Number(po.qty_yet_to_receive).toLocaleString())} KG) </option>`);
      });
      _push(`<!--]--></select></div>`);
      if (unref(selectedPO)) {
        _push(`<div class="rounded-xl bg-blue-500/[0.05] border border-blue-500/20 p-4 text-xs space-y-2"><div class="grid grid-cols-2 gap-2"><div class="space-y-1.5"><div class="flex justify-between"><span class="text-gray-500">Supplier</span><span class="text-gray-200">${ssrInterpolate(unref(selectedPO).supplier_name)}</span></div><div class="flex justify-between"><span class="text-gray-500">Origin</span><span class="text-gray-200">${ssrInterpolate(unref(selectedPO).wheat_origin || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-500">Unit Price</span><span class="text-gray-200 font-mono">\u09F3${ssrInterpolate(Number(unref(selectedPO).unit_price_per_kg).toLocaleString())}/KG</span></div></div><div class="space-y-1.5"><div class="flex justify-between"><span class="text-gray-500">Ordered</span><span class="text-gray-200 font-mono">${ssrInterpolate(Number(unref(selectedPO).quantity_kg).toLocaleString())} KG</span></div><div class="flex justify-between"><span class="text-gray-500">Already Received</span><span class="text-gray-200 font-mono">${ssrInterpolate(Number((_a = unref(selectedPO).total_received_qty) != null ? _a : 0).toLocaleString())} KG</span></div><div class="flex justify-between"><span class="text-gray-500">Yet to Receive</span><span class="${ssrRenderClass([Number(unref(selectedPO).qty_yet_to_receive) > 0 ? "text-orange-300" : "text-emerald-400", "font-mono font-semibold"])}">${ssrInterpolate(Number(unref(selectedPO).qty_yet_to_receive).toLocaleString())} KG </span></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"> GRN Date <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", unref(form).grn_date)} type="date" class="input-glass"${ssrRenderAttr("max", unref(today))}></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Truck Number</label><input${ssrRenderAttr("value", unref(form).truck_number)} type="text" class="input-glass" placeholder="e.g., 1234" maxlength="20"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"> Quantity Received (KG) <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", unref(form).quantity_received_kg)} type="number" step="0.01" min="0.01" class="input-glass font-mono text-lg"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Expected Quantity (KG)</label><input${ssrRenderAttr("value", unref(form).expected_quantity)} type="number" step="0.01" min="0" class="input-glass font-mono"><p class="text-[10px] text-gray-600">Optional \u2014 for weight variance tracking (as per truck challan)</p></div></div>`);
      if (unref(showVariance)) {
        _push(`<div class="${ssrRenderClass([unref(varianceBg), "rounded-xl px-4 py-3 text-xs font-semibold border"])}"><span class="font-bold">Weight Variance:</span> ${ssrInterpolate(unref(varianceKg) > 0 ? "+" : "")}${ssrInterpolate(unref(varianceKg).toFixed(2))} KG (${ssrInterpolate(unref(varianceKg) > 0 ? "+" : "")}${ssrInterpolate(unref(variancePct).toFixed(2))}%) </div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(overDelivery).show) {
        _push(`<div class="rounded-xl p-4 bg-orange-500/[0.08] border-2 border-orange-400/40 space-y-3"><div class="flex items-start gap-3"><span class="text-orange-400 text-lg">\u26A0</span><div class="flex-1 space-y-1"><p class="font-semibold text-orange-300 text-sm">Over-Delivery Detected</p><p class="text-xs text-orange-200/80"> Remaining on PO: <strong>${ssrInterpolate(unref(overDelivery).pending.toFixed(2))}</strong> KG | Recording: <strong>${ssrInterpolate(unref(form).quantity_received_kg.toFixed(2))}</strong> KG | Excess: <strong class="text-red-400">${ssrInterpolate(unref(overDelivery).excess.toFixed(2))}</strong> KG </p><p class="text-xs text-orange-200/70">How would you like to handle the excess?</p></div></div><div class="flex flex-wrap gap-2"><button type="button" class="${ssrRenderClass([unref(form).over_delivery_action === "accept_with_dan" ? "bg-orange-500 text-white" : "bg-white/[0.08] text-orange-300 hover:bg-orange-500/30", "px-3 py-2 rounded-lg text-xs font-semibold transition-colors"])}"> \u{1F4C4} Accept All + Auto-Draft Debit Note (DAN) </button><button type="button" class="${ssrRenderClass([unref(form).over_delivery_action === "as_is" ? "bg-gray-600 text-white" : "bg-white/[0.08] text-gray-300 hover:bg-gray-600/40", "px-3 py-2 rounded-lg text-xs font-semibold transition-colors"])}"> \u2714 Record As-Is (handle manually later) </button></div>`);
        if (unref(overDelivery).choiceConfirmed) {
          _push(`<p class="text-xs text-emerald-400 font-semibold">${ssrInterpolate(unref(form).over_delivery_action === "accept_with_dan" ? "\u2714 Choice: Accept all + Auto-draft Debit Note for excess. Click Record GRN to confirm." : "\u2714 Choice: Record as-is. You can create an adjustment note manually later.")}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4"><p class="text-xs text-gray-500 mb-1">Calculated Value (Expected Qty \xD7 Unit Price)</p><p class="text-3xl font-bold text-gold-400 font-mono">\u09F3${ssrInterpolate(unref(calculatedValue).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider"> Unload Location <span class="text-red-500">*</span></label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "") : ssrLooseEqual(unref(form).unload_point_name, "")) ? " selected" : ""}>\u2014 Select Location \u2014</option><option value="\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C") : ssrLooseEqual(unref(form).unload_point_name, "\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C")) ? " selected" : ""}>\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C (Sirajganj)</option><option value="\u09A1\u09C7\u09AE\u09B0\u09BE"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09A1\u09C7\u09AE\u09B0\u09BE") : ssrLooseEqual(unref(form).unload_point_name, "\u09A1\u09C7\u09AE\u09B0\u09BE")) ? " selected" : ""}>\u09A1\u09C7\u09AE\u09B0\u09BE (Demra)</option><option value="\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE") : ssrLooseEqual(unref(form).unload_point_name, "\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE")) ? " selected" : ""}>\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE (Rampura)</option><option value="Head Office"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "Head Office") : ssrLooseEqual(unref(form).unload_point_name, "Head Office")) ? " selected" : ""}>Head Office</option><option value="Other"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "Other") : ssrLooseEqual(unref(form).unload_point_name, "Other")) ? " selected" : ""}>Other</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remarks</label><textarea rows="3" class="input-glass resize-none" placeholder="Any notes about this delivery\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div><div class="flex items-center gap-3 pt-2"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Record GRN")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/grn",
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
      _push(`</div></div></div><div class="space-y-5"><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Instructions</h3><ol class="list-decimal list-inside space-y-1.5 text-xs text-gray-500"><li>Select the purchase order</li><li>Enter the date goods were received</li><li>Enter truck number (optional)</li><li>Enter actual quantity received</li><li>Enter expected quantity (for variance tracking)</li><li>Select unload location</li><li>Add any remarks if needed</li><li>Review calculated value</li><li>Click &quot;Record GRN&quot;</li></ol><div class="h-px bg-white/[0.06]"></div><p class="text-[10px] text-gray-600"> If actual weight differs from expected by more than 0.5%, a variance record will be automatically created. </p></div>`);
      if (unref(selectedPO)) {
        _push(`<div class="glass-card p-5 space-y-2 text-xs"><h3 class="text-sm font-semibold text-gray-300">GRN Summary</h3><div class="flex justify-between"><span class="text-gray-600">PO #</span><span class="font-mono text-gold-400/80">${ssrInterpolate(unref(selectedPO).po_number)}</span></div><div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">${ssrInterpolate(unref(selectedPO).supplier_name)}</span></div><div class="flex justify-between"><span class="text-gray-600">Unit Price</span><span class="font-mono text-gray-300">\u09F3${ssrInterpolate(Number(unref(selectedPO).unit_price_per_kg).toLocaleString())}/kg</span></div><div class="h-px bg-white/[0.06]"></div><div class="flex justify-between"><span class="text-gray-600 font-semibold">Expected Value</span><span class="font-bold text-gold-400">\u09F3${ssrInterpolate(unref(calculatedValue).toLocaleString(void 0, { maximumFractionDigits: 0 }))}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/grn/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-CQszrfHW.mjs.map
