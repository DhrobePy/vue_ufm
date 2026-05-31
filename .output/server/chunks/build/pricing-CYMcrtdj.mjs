import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pricing",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/pricing",
      "$Q8gbW-4m-c"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const variants = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.variants) != null ? _b : [];
    });
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const categories = computed(() => {
      const cats = /* @__PURE__ */ new Set();
      for (const v of variants.value) if (v.category) cats.add(v.category);
      return [...cats].sort();
    });
    const search = ref("");
    const filterCategory = ref("");
    const filteredVariants = computed(() => {
      let list = variants.value;
      if (filterCategory.value)
        list = list.filter((v) => v.category === filterCategory.value);
      if (search.value.trim()) {
        const q = search.value.toLowerCase();
        list = list.filter(
          (v) => {
            var _a, _b;
            return ((_a = v.product_name) == null ? void 0 : _a.toLowerCase().includes(q)) || ((_b = v.sku) == null ? void 0 : _b.toLowerCase().includes(q));
          }
        );
      }
      return list;
    });
    function priceFor(variant, branchId) {
      var _a;
      return (_a = variant.prices.find((p) => p.branch_id === branchId)) != null ? _a : null;
    }
    const expandedId = ref(null);
    const historyLoading = ref(false);
    const historyRows = ref([]);
    const modal = reactive({ show: false, variant: null, branch: null, existing: null });
    const form = reactive({
      branchId: "",
      unitPrice: 0,
      effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      status: "active"
    });
    const saving = ref(false);
    const canSave = computed(
      () => (modal.existing ? true : !!form.branchId) && form.unitPrice > 0
    );
    const availableBranches = computed(() => {
      if (!modal.variant) return branches.value;
      const priced = new Set(modal.variant.prices.map((p) => p.branch_id));
      return branches.value.filter((b) => !priced.has(b.id));
    });
    function fmtDate(d) {
      if (!d) return "\u2014";
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return "\u2014";
      return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Product Pricing",
        subtitle: "Manage selling prices per variant and branch",
        breadcrumb: ["Products", "Pricing"]
      }, null, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3 items-center"><input${ssrRenderAttr("value", unref(search))} placeholder="Search product or SKU\u2026" class="input-glass w-56 text-xs py-1.5"><select class="input-glass w-auto text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "") : ssrLooseEqual(unref(filterCategory), "")) ? " selected" : ""}>All Categories</option><!--[-->`);
      ssrRenderList(unref(categories), (cat) => {
        _push(`<option${ssrRenderAttr("value", cat)}${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), cat) : ssrLooseEqual(unref(filterCategory), cat)) ? " selected" : ""}>${ssrInterpolate(cat)}</option>`);
      });
      _push(`<!--]--></select><div class="ml-auto text-xs text-gray-500">${ssrInterpolate(unref(filteredVariants).length)} variant(s) </div></div><div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-3 px-3 text-left text-gray-500 font-semibold uppercase tracking-wider min-w-[180px]">Product</th><th class="pb-3 px-3 text-left text-gray-500 font-semibold uppercase tracking-wider">SKU</th><th class="pb-3 px-3 text-left text-gray-500 font-semibold uppercase tracking-wider">Cat.</th><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<th class="pb-3 px-3 text-right text-gray-500 font-semibold uppercase tracking-wider min-w-[120px]">${ssrInterpolate(b.code)}</th>`);
      });
      _push(`<!--]--><th class="pb-3 px-3 text-right text-gray-500 font-semibold uppercase tracking-wider">Actions</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
      ssrRenderList(unref(filteredVariants), (v) => {
        _push(`<!--[--><tr class="hover:bg-white/[0.02]"><td class="py-3 px-3"><p class="font-semibold text-gray-200">${ssrInterpolate(v.product_name)}</p><p class="text-gray-600 text-[11px]">${ssrInterpolate(v.weight_variant)}${ssrInterpolate(v.unit_of_measure)} \xB7 Grade ${ssrInterpolate(v.grade)}</p></td><td class="py-3 px-3 text-gray-400 font-mono text-[11px]">${ssrInterpolate(v.sku)}</td><td class="py-3 px-3 text-gray-500">${ssrInterpolate(v.category)}</td><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          _push(`<td class="py-3 px-3 text-right">`);
          if (priceFor(v, b.id)) {
            _push(`<div class="flex flex-col items-end gap-1"><span class="font-mono font-bold text-gold-300"> \u09F3${ssrInterpolate(Number(priceFor(v, b.id).unit_price).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</span><span class="text-[10px] text-gray-600">${ssrInterpolate(fmtDate(priceFor(v, b.id).effective_date))}</span><button class="text-[10px] text-blue-400 hover:text-blue-300 underline"> Update </button></div>`);
          } else {
            _push(`<button class="text-[11px] text-gray-600 hover:text-gold-400 border border-white/10 hover:border-gold-500/30 rounded px-2 py-0.5 transition-colors"> + Set </button>`);
          }
          _push(`</td>`);
        });
        _push(`<!--]--><td class="py-3 px-3 text-right"><button class="text-[11px] text-gray-500 hover:text-gray-300 underline">${ssrInterpolate(unref(expandedId) === v.id ? "Hide" : "History")}</button></td></tr>`);
        if (unref(expandedId) === v.id) {
          _push(`<tr class="bg-white/[0.015]"><td${ssrRenderAttr("colspan", 3 + unref(branches).length + 1)} class="px-6 py-4">`);
          if (unref(historyLoading)) {
            _push(`<div class="text-xs text-gray-500 py-2">Loading history\u2026</div>`);
          } else if (!unref(historyRows).length) {
            _push(`<div class="text-xs text-gray-600 py-2">No price history found.</div>`);
          } else {
            _push(`<table class="w-full text-xs"><thead><tr class="text-gray-600 border-b border-white/[0.04]"><th class="pb-2 text-left font-medium">Branch</th><th class="pb-2 text-right font-medium">Price (\u09F3)</th><th class="pb-2 text-right font-medium">Effective</th><th class="pb-2 text-center font-medium">State</th><th class="pb-2 text-right font-medium">Set on</th></tr></thead><tbody class="divide-y divide-white/[0.02]"><!--[-->`);
            ssrRenderList(unref(historyRows), (h) => {
              _push(`<tr class="${ssrRenderClass(h.is_active ? "text-gray-200" : "text-gray-600 opacity-60")}"><td class="py-1.5">${ssrInterpolate(h.branch_name)}</td><td class="py-1.5 text-right font-mono">${ssrInterpolate(Number(h.unit_price).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</td><td class="py-1.5 text-right">${ssrInterpolate(fmtDate(h.effective_date))}</td><td class="py-1.5 text-center">`);
              if (h.is_active) {
                _push(`<span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">Active</span>`);
              } else {
                _push(`<span class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-gray-500">Archived</span>`);
              }
              _push(`</td><td class="py-1.5 text-right text-gray-600">${ssrInterpolate(fmtDate(h.created_at))}</td></tr>`);
            });
            _push(`<!--]--></tbody></table>`);
          }
          _push(`</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]-->`);
      if (!unref(filteredVariants).length) {
        _push(`<tr><td${ssrRenderAttr("colspan", 3 + unref(branches).length + 1)} class="py-10 text-center text-gray-600 text-xs"> No variants found. </td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b, _c, _d;
        if (unref(modal).show) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div><div class="relative glass-card w-full max-w-md p-6 space-y-5 z-10"><div class="flex items-start justify-between"><div><h3 class="text-base font-bold text-gray-100">${ssrInterpolate(unref(modal).existing ? "Update Price" : "Set New Price")}</h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate((_a = unref(modal).variant) == null ? void 0 : _a.product_name)} \xB7 ${ssrInterpolate((_b = unref(modal).variant) == null ? void 0 : _b.sku)}</p></div><button class="text-gray-600 hover:text-gray-300 text-lg leading-none">\u2715</button></div>`);
          if (unref(modal).existing) {
            _push2(`<div class="rounded-lg bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-xs space-y-1"><p class="text-gray-500">Current price for <span class="text-gray-300 font-semibold">${ssrInterpolate((_c = unref(modal).branch) == null ? void 0 : _c.name)}</span></p><p class="text-gold-300 font-mono font-bold text-sm"> \u09F3${ssrInterpolate(Number(unref(modal).existing.unit_price).toLocaleString("en-BD", { minimumFractionDigits: 2 }))}</p><p class="text-gray-600">Effective: ${ssrInterpolate(fmtDate(unref(modal).existing.effective_date))}</p><p class="text-gray-600 text-[11px]">Saving will archive this price and create a new active record.</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="space-y-4"><div><label class="block text-xs font-medium text-gray-400 mb-1">Branch / Factory</label>`);
          if (!unref(modal).existing) {
            _push2(`<select class="input-glass w-full text-xs py-2"><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "") : ssrLooseEqual(unref(form).branchId, "")) ? " selected" : ""}>Select branch\u2026</option><!--[-->`);
            ssrRenderList(unref(availableBranches), (b) => {
              _push2(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, b.id) : ssrLooseEqual(unref(form).branchId, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
            });
            _push2(`<!--]--></select>`);
          } else {
            _push2(`<div class="input-glass w-full text-xs py-2 text-gray-400 cursor-not-allowed opacity-70">${ssrInterpolate((_d = unref(modal).branch) == null ? void 0 : _d.name)}</div>`);
          }
          _push2(`</div><div><label class="block text-xs font-medium text-gray-400 mb-1">New Unit Price (\u09F3)</label><input${ssrRenderAttr("value", unref(form).unitPrice)} type="number" min="0" step="0.01" class="input-glass w-full text-xs py-2 font-mono" placeholder="e.g. 2250.00"></div><div><label class="block text-xs font-medium text-gray-400 mb-1">Effective Date</label><input${ssrRenderAttr("value", unref(form).effectiveDate)} type="date" class="input-glass w-full text-xs py-2"></div><div><label class="block text-xs font-medium text-gray-400 mb-1">Price Status</label><select class="input-glass w-full text-xs py-2"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="promotional"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "promotional") : ssrLooseEqual(unref(form).status, "promotional")) ? " selected" : ""}>Promotional</option></select></div></div><div class="flex justify-end gap-3 pt-1"><button class="px-4 py-2 text-xs rounded-lg border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors"> Cancel </button><button${ssrIncludeBooleanAttr(unref(saving) || !unref(canSave)) ? " disabled" : ""} class="btn-gold text-xs px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed">`);
          if (unref(saving)) {
            _push2(`<svg class="w-3 h-3 animate-spin inline mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : unref(modal).existing ? "Update Price" : "Set Price")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/pricing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pricing-CYMcrtdj.mjs.map
