import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import './SidebarIcon-oZVkzwjh.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const activeCategory = ref("All");
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products",
      "$92syt1y5Gk"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allProducts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.products) != null ? _b : [];
    });
    const categories = computed(() => {
      const cats = new Set(allProducts.value.map((p) => p.category).filter(Boolean));
      return ["All", ...Array.from(cats).sort()];
    });
    const filteredProducts = computed(
      () => activeCategory.value === "All" ? allProducts.value : allProducts.value.filter((p) => p.category === activeCategory.value)
    );
    const totalVariants = computed(() => allProducts.value.reduce((s, p) => {
      var _a, _b;
      return s + ((_b = (_a = p.variants) == null ? void 0 : _a.length) != null ? _b : 0);
    }, 0));
    const pricedVariants = computed(() => allProducts.value.reduce((s, p) => {
      var _a;
      return s + ((_a = p.variants) != null ? _a : []).filter((v) => v.unit_price != null).length;
    }, 0));
    function priceRange(p) {
      var _a;
      const prices = ((_a = p.variants) != null ? _a : []).map((v) => Number(v.unit_price)).filter((x) => x > 0);
      if (!prices.length) return "\u2014";
      const mn = Math.min(...prices);
      const mx = Math.max(...prices);
      return mn === mx ? `\u09F3${mn.toLocaleString()}` : `\u09F3${mn.toLocaleString()}\u2013\u09F3${mx.toLocaleString()}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_KpiCard = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Products",
        subtitle: "Flour brands \xB7 variants \xB7 pricing \xB7 inventory",
        breadcrumb: ["Products"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs"${_scopeId}>+ Add Product</button>`);
          } else {
            return [
              createVNode("button", { class: "btn-gold text-xs" }, "+ Add Product")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`);
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Base Products",
        value: String(unref(allProducts).length),
        trend: "Active",
        "trend-up": "",
        icon: "box",
        color: "purple"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Variants",
        value: String(unref(totalVariants)),
        trend: "All active",
        "trend-up": "",
        icon: "list",
        color: "blue"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Categories",
        value: String(unref(categories).length - 1),
        trend: "Product lines",
        "trend-up": "",
        icon: "box",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Priced Variants",
        value: String(unref(pricedVariants)),
        trend: "Have unit prices",
        "trend-up": "",
        icon: "chart",
        color: "teal"
      }, null, _parent));
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading products\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="flex gap-2 flex-wrap"><!--[-->`);
        ssrRenderList(unref(categories), (cat) => {
          _push(`<button class="${ssrRenderClass([
            "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
            unref(activeCategory) === cat ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300"
          ])}">${ssrInterpolate(cat)}</button>`);
        });
        _push(`<!--]--></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"><!--[-->`);
        ssrRenderList(unref(filteredProducts), (p) => {
          _push(`<div class="glass-card-hover p-5 space-y-4 cursor-pointer"><div class="flex items-start justify-between gap-2"><div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.08)", "border": "1px solid rgba(245,158,11,0.15)" })}"> \u{1F33E} </div><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">active</span></div><div><h3 class="font-semibold text-gray-100 text-sm leading-tight">${ssrInterpolate(p.base_name)}</h3><p class="text-[10px] text-gray-600 mt-0.5 font-mono">${ssrInterpolate(p.base_sku)}</p><p class="text-[11px] text-gray-500 mt-1">${ssrInterpolate(p.category)}</p></div><div class="space-y-1.5"><p class="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Variants</p><div class="flex flex-wrap gap-1.5"><!--[-->`);
          ssrRenderList(p.variants, (v) => {
            _push(`<span class="px-1.5 py-0.5 rounded-md text-[10px] font-mono border bg-white/[0.06] text-gray-400 border-white/[0.08]">${ssrInterpolate(v.weight_variant)}</span>`);
          });
          _push(`<!--]--></div></div><div class="flex items-center justify-between pt-2 border-t border-white/[0.06]"><div><p class="text-[10px] text-gray-600">Price</p><p class="text-sm font-bold text-gold-400">${ssrInterpolate(priceRange(p))}</p></div><div class="text-right"><p class="text-[10px] text-gray-600">Variants</p><p class="text-sm font-semibold text-gray-300">${ssrInterpolate(p.variants.length)}</p></div></div></div>`);
        });
        _push(`<!--]--></div><div class="glass-card p-5"><h2 class="section-title mb-4">Current Price List</h2><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">Product</th><th class="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">SKU</th><th class="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">Variant</th><th class="text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">Grade</th><th class="text-right py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wider">Unit Price</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(allProducts), (p) => {
          _push(`<!--[--><!--[-->`);
          ssrRenderList(p.variants, (v, vi) => {
            _push(`<tr class="hover:bg-white/[0.02] transition-colors"><td class="py-2.5 px-3 font-medium text-gray-300">${ssrInterpolate(vi === 0 ? p.base_name : "")}</td><td class="py-2.5 px-3 font-mono text-gray-600">${ssrInterpolate(vi === 0 ? p.base_sku : "")}</td><td class="py-2.5 px-3 text-gray-400">${ssrInterpolate(v.weight_variant)}</td><td class="py-2.5 px-3 text-gray-500">${ssrInterpolate(v.grade || "\u2014")}</td><td class="${ssrRenderClass([v.unit_price ? "text-gold-400" : "text-gray-600", "py-2.5 px-3 text-right font-bold"])}">${ssrInterpolate(v.unit_price ? "\u09F3" + Number(v.unit_price).toLocaleString() : "\u2014")}</td></tr>`);
          });
          _push(`<!--]--><!--]-->`);
        });
        _push(`<!--]-->`);
        if (!unref(allProducts).length) {
          _push(`<tr><td colspan="5" class="py-8 text-center text-gray-600">No products found</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BdKJRRZm.mjs.map
