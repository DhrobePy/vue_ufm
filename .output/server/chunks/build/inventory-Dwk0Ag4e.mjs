import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "inventory",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const filterCategory = ref("");
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/inventory",
      "$j1epYJesE3"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const variants = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.variants) != null ? _b : [];
    });
    const rawMaterials = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.rawMaterials) != null ? _b : [];
    });
    const filteredVariants = computed(
      () => filterCategory.value ? variants.value.filter((v) => v.category === filterCategory.value) : variants.value
    );
    function available(v) {
      return Math.max(0, Number(v.stock_qty) - Number(v.reserved_qty));
    }
    const inStockCount = computed(() => variants.value.filter((v) => available(v) > Number(v.reorder_level)).length);
    const lowStockCount = computed(() => variants.value.filter((v) => available(v) <= Number(v.reorder_level) && Number(v.stock_qty) > 0).length);
    const outOfStockCount = computed(() => variants.value.filter((v) => Number(v.stock_qty) === 0).length);
    function exportCsv() {
      const rows = filteredVariants.value;
      if (!rows.length) return;
      const headers = ["Product", "Category", "Pack", "In Stock", "Reserved", "Available", "Reorder Level", "Status"];
      const lines = rows.map((v) => [
        v.product_name,
        v.category,
        v.weight_variant,
        v.stock_qty,
        v.reserved_qty,
        available(v),
        v.reorder_level,
        Number(v.stock_qty) === 0 ? "out_of_stock" : available(v) <= Number(v.reorder_level) ? "low_stock" : "ok"
      ].join(","));
      const csv = [headers.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = "inventory.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Product Inventory",
        subtitle: "Real-time stock levels by product and storage location",
        breadcrumb: ["Products", "Inventory"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u2B07 Export</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: exportCsv,
                class: "btn-ghost text-xs"
              }, "\u2B07 Export")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total SKUs</p><p class="text-2xl font-bold text-gray-100">${ssrInterpolate(unref(variants).length)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">In Stock</p><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate(unref(inStockCount))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Low Stock</p><p class="text-2xl font-bold text-yellow-400">${ssrInterpolate(unref(lowStockCount))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Out of Stock</p><p class="text-2xl font-bold text-red-400">${ssrInterpolate(unref(outOfStockCount))}</p></div></div><div class="glass-card p-5 space-y-4"><h3 class="section-title">Raw Material (Wheat)</h3><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(unref(rawMaterials), (raw) => {
          _push(`<div class="rounded-xl border border-white/[0.07] p-4 space-y-3"><div class="flex justify-between items-start"><div><p class="text-sm font-semibold text-gray-200">${ssrInterpolate(raw.name)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(raw.location)}</p></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: Number(raw.stock_mt) > Number(raw.reorder_mt) ? "active" : "pending"
          }, null, _parent));
          _push(`</div><div class="space-y-1"><div class="flex justify-between text-xs"><span class="text-gray-600">In stock</span><span class="font-bold text-gray-200">${ssrInterpolate(Number(raw.stock_mt).toLocaleString())} MT</span></div><div class="h-2 rounded-full bg-white/[0.06] overflow-hidden"><div class="${ssrRenderClass([Number(raw.stock_mt) > Number(raw.reorder_mt) ? "bg-emerald-500" : Number(raw.stock_mt) > 0 ? "bg-yellow-500" : "bg-red-500", "h-full rounded-full transition-all"])}" style="${ssrRenderStyle(`width:${Math.min(100, Math.round(Number(raw.stock_mt) / Number(raw.capacity_mt) * 100))}%`)}"></div></div><div class="flex justify-between text-[11px]"><span class="text-gray-600">Capacity: ${ssrInterpolate(Number(raw.capacity_mt).toLocaleString())} MT</span><span class="text-gray-600">Reorder: ${ssrInterpolate(Number(raw.reorder_mt).toLocaleString())} MT</span></div></div></div>`);
        });
        _push(`<!--]--></div></div><div class="glass-card p-5 space-y-4"><div class="flex items-center justify-between"><h3 class="section-title">Finished Goods Stock</h3><select class="field-input w-auto text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "") : ssrLooseEqual(unref(filterCategory), "")) ? " selected" : ""}>All Categories</option><option value="Flour"${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "Flour") : ssrLooseEqual(unref(filterCategory), "Flour")) ? " selected" : ""}>Flour</option><option value="Atta"${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "Atta") : ssrLooseEqual(unref(filterCategory), "Atta")) ? " selected" : ""}>Atta</option><option value="Bran"${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "Bran") : ssrLooseEqual(unref(filterCategory), "Bran")) ? " selected" : ""}>Bran</option></select></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Product</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Pack</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">In Stock</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Reserved</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Available</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Reorder Lvl</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th></tr></thead><tbody class="divide-y divide-white/[0.04]">`);
        if (!unref(filteredVariants).length) {
          _push(`<tr><td colspan="7" class="py-6 text-center text-gray-600">No data</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(filteredVariants), (v) => {
          _push(`<tr class="hover:bg-white/[0.02]"><td class="py-2.5 px-3"><p class="font-medium text-gray-200">${ssrInterpolate(v.product_name)}</p><p class="text-gray-600 text-[11px]">${ssrInterpolate(v.category)}</p></td><td class="py-2.5 px-3 text-right text-gray-400">${ssrInterpolate(v.weight_variant)}</td><td class="py-2.5 px-3 text-right font-mono font-bold text-gray-200">${ssrInterpolate(Number(v.stock_qty).toLocaleString())}</td><td class="py-2.5 px-3 text-right font-mono text-orange-400">${ssrInterpolate(Number(v.reserved_qty).toLocaleString())}</td><td class="${ssrRenderClass([available(v) <= Number(v.reorder_level) ? "text-yellow-400" : "text-emerald-400", "py-2.5 px-3 text-right font-mono font-bold"])}">${ssrInterpolate(available(v).toLocaleString())}</td><td class="py-2.5 px-3 text-right text-gray-600">${ssrInterpolate(Number(v.reorder_level).toLocaleString())}</td><td class="py-2.5 px-3 text-center">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: Number(v.stock_qty) === 0 ? "cancelled" : available(v) <= Number(v.reorder_level) ? "pending" : "active"
          }, null, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/inventory.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=inventory-Dwk0Ag4e.mjs.map
