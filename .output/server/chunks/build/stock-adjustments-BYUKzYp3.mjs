import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, computed, ref, withAsyncContext, reactive, mergeProps, withCtx, unref, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
  __name: "stock-adjustments",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { user } = useUserSession();
    const PROD_ROLES = ["admin", "superadmin", "production manager-srg", "production manager-demra"];
    const canCreate = computed(() => {
      var _a, _b;
      return PROD_ROLES.includes(((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const tabs = [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" }
    ];
    const statusFilter = ref("pending");
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/stock-adjustments",
      {
        query: computed(() => ({ status: statusFilter.value }))
      },
      "$QL2oQm4FY7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.adjustments) != null ? _b : [];
    });
    const { data: invData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/inventory",
      "$-TAHH-maVx"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const variants = computed(() => {
      var _a, _b;
      return (_b = (_a = invData.value) == null ? void 0 : _a.variants) != null ? _b : [];
    });
    const showForm = ref(false);
    const submitting = ref(false);
    const form = reactive({ variant_id: null, delta: null, reason: "", notes: "" });
    const acting = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Stock Adjustments",
        subtitle: "Inventory corrections \u2014 maker submits, a different authorised user approves",
        breadcrumb: ["Products", "Stock Adjustments"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(canCreate)) {
              _push2(`<button class="btn-primary text-xs"${_scopeId}>${ssrInterpolate(unref(showForm) ? "Cancel" : "+ New Adjustment")}</button>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(canCreate) ? (openBlock(), createBlock("button", {
                key: 0,
                onClick: ($event) => showForm.value = !unref(showForm),
                class: "btn-primary text-xs"
              }, toDisplayString(unref(showForm) ? "Cancel" : "+ New Adjustment"), 9, ["onClick"])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(showForm)) {
        _push(`<div class="glass-card p-5 space-y-4"><h3 class="section-title">New Stock Adjustment</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="sm:col-span-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product / SKU</label><select class="field-input"><option${ssrRenderAttr("value", null)} disabled${ssrIncludeBooleanAttr(Array.isArray(unref(form).variant_id) ? ssrLooseContain(unref(form).variant_id, null) : ssrLooseEqual(unref(form).variant_id, null)) ? " selected" : ""}>Select a variant\u2026</option><!--[-->`);
        ssrRenderList(unref(variants), (v) => {
          _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).variant_id) ? ssrLooseContain(unref(form).variant_id, v.id) : ssrLooseEqual(unref(form).variant_id, v.id)) ? " selected" : ""}>${ssrInterpolate(v.product_name)} \u2014 ${ssrInterpolate(v.weight_variant)} (${ssrInterpolate(v.sku)}) \xB7 in stock ${ssrInterpolate(Number(v.stock_qty).toLocaleString())}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity Change</label><input${ssrRenderAttr("value", unref(form).delta)} type="number" placeholder="e.g. -12 or 8" class="field-input"><p class="text-[11px] text-gray-600 mt-1">Negative = decrease, positive = increase</p></div><div><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reason</label><select class="field-input"><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason) ? ssrLooseContain(unref(form).reason, "") : ssrLooseEqual(unref(form).reason, "")) ? " selected" : ""}>Select reason\u2026</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason) ? ssrLooseContain(unref(form).reason, null) : ssrLooseEqual(unref(form).reason, null)) ? " selected" : ""}>Physical count discrepancy</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason) ? ssrLooseContain(unref(form).reason, null) : ssrLooseEqual(unref(form).reason, null)) ? " selected" : ""}>Damaged goods</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason) ? ssrLooseContain(unref(form).reason, null) : ssrLooseEqual(unref(form).reason, null)) ? " selected" : ""}>Spillage / wastage</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason) ? ssrLooseContain(unref(form).reason, null) : ssrLooseEqual(unref(form).reason, null)) ? " selected" : ""}>Theft / loss</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason) ? ssrLooseContain(unref(form).reason, null) : ssrLooseEqual(unref(form).reason, null)) ? " selected" : ""}>Warehouse transfer correction</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).reason) ? ssrLooseContain(unref(form).reason, null) : ssrLooseEqual(unref(form).reason, null)) ? " selected" : ""}>Other</option></select></div><div class="sm:col-span-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes (optional)</label><textarea rows="2" class="field-input" placeholder="Additional detail\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div><div class="flex justify-end gap-2"><button class="btn-ghost text-xs">Cancel</button><button${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""} class="btn-primary text-xs disabled:opacity-40">${ssrInterpolate(unref(submitting) ? "Submitting\u2026" : "Submit for Approval")}</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-2"><!--[-->`);
      ssrRenderList(tabs, (t) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border",
          unref(statusFilter) === t.value ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]"
        ])}">${ssrInterpolate(t.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center"><div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"></div><p class="text-xs text-gray-500">Loading\u2026</p></div>`);
      } else if (!unref(items).length) {
        _push(`<div class="glass-card p-14 text-center space-y-2"><div class="text-5xl">\u{1F4E6}</div><p class="text-gray-400 font-semibold">Nothing here</p><p class="text-xs text-gray-600">Stock adjustments will appear here for review</p></div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(items), (adj) => {
          var _a, _b;
          _push(`<div class="glass-card p-5 flex items-start gap-4 flex-wrap"><div class="min-w-[220px] flex-1"><span class="text-sm font-bold text-gray-200">${ssrInterpolate(adj.product_name)}</span><span class="text-xs text-gray-500 ml-2">${ssrInterpolate(adj.sku)}</span><span class="font-mono text-xs text-gray-500 ml-2">${ssrInterpolate(adj.adj_number)}</span><p class="text-xs text-gray-500 mt-1">${ssrInterpolate(adj.reason)} \xB7 by ${ssrInterpolate((_a = adj.created_by_name) != null ? _a : "\u2014")} \xB7 ${ssrInterpolate(new Date(adj.created_at).toLocaleString("en-GB"))}</p>`);
          if (adj.notes) {
            _push(`<p class="text-[11px] text-gray-600 mt-1">${ssrInterpolate(adj.notes)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (adj.status !== "pending") {
            _push(`<p class="text-[11px] text-gray-500 mt-1">${ssrInterpolate(adj.status === "approved" ? "\u2713 Approved" : "\u2717 Rejected")} by ${ssrInterpolate((_b = adj.approved_by_name) != null ? _b : "\u2014")} ${ssrInterpolate(adj.decision_note ? `\u2014 ${adj.decision_note}` : "")}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-right"><p class="${ssrRenderClass([Number(adj.delta) < 0 ? "text-red-400" : "text-emerald-400", "text-lg font-bold font-mono"])}">${ssrInterpolate(Number(adj.delta) > 0 ? "+" : "")}${ssrInterpolate(Number(adj.delta).toLocaleString())}</p><p class="text-[11px] text-gray-600">now ${ssrInterpolate(Number(adj.current_stock).toLocaleString())}</p></div>`);
          if (adj.status === "pending") {
            _push(`<div class="flex items-center gap-2 shrink-0"><button${ssrIncludeBooleanAttr(unref(acting) === adj.id) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">${ssrInterpolate(unref(acting) === adj.id ? "\u2026" : "\u2713 Approve")}</button><button${ssrIncludeBooleanAttr(unref(acting) === adj.id) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 disabled:opacity-40 transition-colors"> Reject </button></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/stock-adjustments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=stock-adjustments-BYUKzYp3.mjs.map
