import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
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
  __name: "partners",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/trading/partners",
      "$XFMVTIvMzF"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const partners = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.partners) != null ? _b : [];
    });
    const customerOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = data.value) == null ? void 0 : _a.customers) != null ? _b : []).map((c) => ({
        value: c.id,
        label: c.name,
        sub: c.phone_number || ""
      }));
    });
    const supplierOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = data.value) == null ? void 0 : _a.suppliers) != null ? _b : []).map((s) => ({
        value: s.id,
        label: s.name,
        sub: s.phone || ""
      }));
    });
    const link = reactive({ customerId: "", supplierId: "" });
    const linking = ref(false);
    const settleTarget = ref(null);
    const settleAmount = ref(0);
    const settling = ref(false);
    const maxSettle = computed(() => settleTarget.value ? Math.min(Number(settleTarget.value.receivable), Number(settleTarget.value.payable)) : 0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Business Partners",
        subtitle: "Link a customer + supplier as one party \u2014 see both balances, settle AR against AP",
        breadcrumb: ["Trading", "Partners"]
      }, null, _parent));
      _push(`<div class="glass-card p-5 space-y-3 max-w-3xl"><h3 class="section-title">Link a Partner</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase font-semibold">Customer *</label>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(link).customerId,
        "onUpdate:modelValue": ($event) => unref(link).customerId = $event,
        options: unref(customerOptions),
        placeholder: "Search customer\u2026"
      }, null, _parent));
      _push(`</div><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase font-semibold">Supplier *</label>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(link).supplierId,
        "onUpdate:modelValue": ($event) => unref(link).supplierId = $event,
        options: unref(supplierOptions),
        placeholder: "Search supplier\u2026"
      }, null, _parent));
      _push(`</div><button${ssrIncludeBooleanAttr(!unref(link).customerId || !unref(link).supplierId || unref(linking)) ? " disabled" : ""} class="btn-gold text-xs py-2.5 disabled:opacity-50">${ssrInterpolate(unref(linking) ? "Linking\u2026" : "Link as One Partner")}</button></div></div><div class="glass-card p-5"><h3 class="section-title mb-3">Linked Partners</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Partner</th><th class="text-left pr-3">Customer Side</th><th class="text-left pr-3">Supplier Side</th><th class="text-right pr-3">They Owe Us (AR)</th><th class="text-right pr-3">We Owe Them (AP)</th><th class="text-right pr-3">Net</th><th></th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(partners), (p) => {
        var _a, _b;
        _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 pr-3 text-gray-200 font-medium">${ssrInterpolate(p.name)}</td><td class="pr-3 text-gray-400">${ssrInterpolate((_a = p.customer_name) != null ? _a : "\u2014")}</td><td class="pr-3 text-gray-400">${ssrInterpolate((_b = p.supplier_name) != null ? _b : "\u2014")}</td><td class="pr-3 text-right font-mono text-orange-400">\u09F3${ssrInterpolate(Number(p.receivable).toLocaleString())}</td><td class="pr-3 text-right font-mono text-blue-300">\u09F3${ssrInterpolate(Number(p.payable).toLocaleString())}</td><td class="${ssrRenderClass(["pr-3 text-right font-mono font-bold", Number(p.receivable) - Number(p.payable) >= 0 ? "text-emerald-400" : "text-red-400"])}"> \u09F3${ssrInterpolate((Number(p.receivable) - Number(p.payable)).toLocaleString())}</td><td class="text-right whitespace-nowrap">`);
        if (Math.min(Number(p.receivable), Number(p.payable)) > 0) {
          _push(`<button class="btn-ghost text-[10px] py-1">\u{1F500} Settle</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="btn-ghost text-[10px] py-1 text-red-400 ml-1">Unlink</button></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(partners).length) {
        _push(`<tr><td colspan="7" class="py-6 text-center text-gray-600">No linked partners yet.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      if (unref(settleTarget)) {
        _push(`<div class="glass-card p-5 space-y-3 max-w-2xl border border-gold-500/20"><h3 class="section-title">Settle \u2014 ${ssrInterpolate(unref(settleTarget).name)}</h3><p class="text-xs text-gray-500"> Nets what they owe us (AR \u09F3${ssrInterpolate(Number(unref(settleTarget).receivable).toLocaleString())}) against what we owe them (AP \u09F3${ssrInterpolate(Number(unref(settleTarget).payable).toLocaleString())}). Max settleable: \u09F3${ssrInterpolate(unref(maxSettle).toLocaleString())}. No cash moves \u2014 one journal entry (Dr Accounts Payable / Cr Accounts Receivable) plus matching ledger entries on both sides. </p><div class="flex items-end gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 uppercase">Amount (\u09F3)</label><input${ssrRenderAttr("value", unref(settleAmount))} type="number"${ssrRenderAttr("max", unref(maxSettle))} min="0" step="any" class="input-glass text-xs font-mono w-40"></div><button class="btn-ghost text-[10px] py-2">Max</button><button${ssrIncludeBooleanAttr(!(unref(settleAmount) > 0 && unref(settleAmount) <= unref(maxSettle)) || unref(settling)) ? " disabled" : ""} class="btn-gold text-xs py-2 disabled:opacity-50">${ssrInterpolate(unref(settling) ? "Posting\u2026" : "Post Settlement")}</button><button class="btn-ghost text-xs py-2">Cancel</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trading/partners.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=partners-REI3SeCO.mjs.map
