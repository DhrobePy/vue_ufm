import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, watch, mergeProps, withCtx, unref, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const saving = ref(false);
    const { data: loadData, pending: loadPending, error: loadError } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/purchase/payments/${route.params.id}`,
      "$Fdapy--2sM"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const pmt = computed(() => {
      var _a, _b;
      return (_b = (_a = loadData.value) == null ? void 0 : _a.payment) != null ? _b : {};
    });
    const form = reactive({
      payment_date: "",
      amount_paid: 0,
      payment_method: "cash",
      payment_type: "regular",
      reference_number: "",
      handled_by_employee: "",
      remarks: ""
    });
    watch(pmt, (p) => {
      if (!(p == null ? void 0 : p.id)) return;
      form.payment_date = p.payment_date || "";
      form.amount_paid = Number(p.amount_paid || 0);
      form.payment_method = p.payment_method || "cash";
      form.payment_type = p.payment_type || "regular";
      form.reference_number = p.reference_number || "";
      form.handled_by_employee = p.handled_by_employee || "";
      form.remarks = p.remarks || "";
    }, { immediate: true });
    const isValid = computed(() => form.payment_date && form.amount_paid > 0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Edit Payment",
        subtitle: "Update payment details",
        breadcrumb: ["Purchase", "Payments", "Edit"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/purchase/payments/${unref(route).params.id}`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Back`);
                } else {
                  return [
                    createTextVNode("\u2190 Back")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/purchase/payments/${unref(route).params.id}`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(loadPending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(loadError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(loadError).message)}</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-6 space-y-4"><h3 class="section-title">Payment Details</h3><div class="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-xs space-y-1"><div class="flex justify-between"><span class="text-gray-600">Voucher #</span><span class="font-mono text-gold-400/80">${ssrInterpolate(unref(pmt).payment_voucher_number)}</span></div><div class="flex justify-between"><span class="text-gray-600">PO #</span><span class="text-gray-300">${ssrInterpolate(unref(pmt).po_number)}</span></div><div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">${ssrInterpolate(unref(pmt).supplier_name)}</span></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Date *</label><input${ssrRenderAttr("value", unref(form).payment_date)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (\u09F3) *</label><input${ssrRenderAttr("value", unref(form).amount_paid)} type="number" min="1" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Method *</label><select class="input-glass"><option value="cash"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_method) ? ssrLooseContain(unref(form).payment_method, "cash") : ssrLooseEqual(unref(form).payment_method, "cash")) ? " selected" : ""}>Cash</option><option value="bank"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_method) ? ssrLooseContain(unref(form).payment_method, "bank") : ssrLooseEqual(unref(form).payment_method, "bank")) ? " selected" : ""}>Bank Transfer / BEFTN</option><option value="cheque"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_method) ? ssrLooseContain(unref(form).payment_method, "cheque") : ssrLooseEqual(unref(form).payment_method, "cheque")) ? " selected" : ""}>Cheque</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Type</label><select class="input-glass"><option value="regular"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_type) ? ssrLooseContain(unref(form).payment_type, "regular") : ssrLooseEqual(unref(form).payment_type, "regular")) ? " selected" : ""}>Regular</option><option value="advance"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_type) ? ssrLooseContain(unref(form).payment_type, "advance") : ssrLooseEqual(unref(form).payment_type, "advance")) ? " selected" : ""}>Advance</option><option value="partial"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_type) ? ssrLooseContain(unref(form).payment_type, "partial") : ssrLooseEqual(unref(form).payment_type, "partial")) ? " selected" : ""}>Partial</option><option value="final"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_type) ? ssrLooseContain(unref(form).payment_type, "final") : ssrLooseEqual(unref(form).payment_type, "final")) ? " selected" : ""}>Final</option></select></div>`);
        if (unref(form).payment_method !== "cash") {
          _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reference / Cheque No.</label><input${ssrRenderAttr("value", unref(form).reference_number)} type="text" class="input-glass font-mono" placeholder="BEFTN ref, cheque no."></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Handled By</label><input${ssrRenderAttr("value", unref(form).handled_by_employee)} type="text" class="input-glass" placeholder="Employee name"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remarks</label><textarea rows="3" class="input-glass resize-none" placeholder="Payment notes\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div><div class="flex items-center gap-3 pt-2"><button${ssrIncludeBooleanAttr(unref(saving) || !unref(isValid)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/payments/${unref(route).params.id}`,
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
        _push(`</div></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">PO Summary</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Total Value</span><span class="text-gray-200">\u09F3${ssrInterpolate(Number(unref(pmt).total_order_value || 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Received</span><span class="text-gray-200">\u09F3${ssrInterpolate(Number(unref(pmt).total_received_value || 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Balance Payable</span><span class="text-red-400 font-bold">\u09F3${ssrInterpolate(Number(unref(pmt).balance_payable || 0).toLocaleString())}</span></div></div></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/payments/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=edit-kurPwEzx.mjs.map
