import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
  __name: "totals",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const from = ref(new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10));
    const to = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/production/totals",
      {
        query: computed(() => ({ from: from.value, to: to.value }))
      },
      "$1BoXs4UsJD"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const byDate = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.by_date) != null ? _b : [];
    });
    const byProduct = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.by_product) != null ? _b : [];
    });
    const totalBags = computed(() => byDate.value.reduce((s, r) => s + r.bags, 0));
    const totalKg = computed(() => byDate.value.reduce((s, r) => s + r.kg, 0));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Production Totals",
        subtitle: "Actual output grouped by date and by product",
        breadcrumb: ["Production", "Totals"]
      }, null, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap items-center gap-3"><label class="text-xs text-gray-500">From</label><input${ssrRenderAttr("value", unref(from))} type="date" class="input-glass w-auto text-xs"><label class="text-xs text-gray-500">To</label><input${ssrRenderAttr("value", unref(to))} type="date" class="input-glass w-auto text-xs"></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><h3 class="section-title mb-4">By Date</h3>`);
      if (!unref(byDate).length) {
        _push(`<div class="text-xs text-gray-600 text-center py-8">No completed batches in this range.</div>`);
      } else {
        _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Date</th><th class="pb-2 text-right text-gray-500">Bags</th><th class="pb-2 text-right text-gray-500">KG</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(byDate), (r) => {
          _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300">${ssrInterpolate(r.date)}</td><td class="py-2 text-right font-mono text-gray-200">${ssrInterpolate(r.bags.toLocaleString())}</td><td class="py-2 text-right font-mono text-gray-400">${ssrInterpolate(r.kg ? r.kg.toLocaleString() + " kg" : "\u2014")}</td></tr>`);
        });
        _push(`<!--]--></tbody><tfoot><tr class="border-t border-white/[0.08] font-semibold"><td class="py-2 text-gray-400">Total</td><td class="py-2 text-right font-mono text-gold-400">${ssrInterpolate(unref(totalBags).toLocaleString())}</td><td class="py-2 text-right font-mono text-gold-400">${ssrInterpolate(unref(totalKg).toLocaleString())} kg</td></tr></tfoot></table>`);
      }
      _push(`</div><div class="glass-card p-5"><h3 class="section-title mb-4">By Product</h3>`);
      if (!unref(byProduct).length) {
        _push(`<div class="text-xs text-gray-600 text-center py-8">No completed batches in this range.</div>`);
      } else {
        _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Product</th><th class="pb-2 text-right text-gray-500">Bags</th><th class="pb-2 text-right text-gray-500">KG</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(byProduct), (r) => {
          _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300">${ssrInterpolate(r.product)}</td><td class="py-2 text-right font-mono text-gray-200">${ssrInterpolate(r.bags.toLocaleString())}</td><td class="py-2 text-right font-mono text-gray-400">${ssrInterpolate(r.kg ? r.kg.toLocaleString() + " kg" : "\u2014")}</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`<p class="text-[10px] text-gray-600 mt-3"> A batch covering multiple products distributes its completion proportionally across each line item \u2014 production isn&#39;t tracked per-product internally, only per batch. </p></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/production/totals.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=totals-Drwaj5vr.mjs.map
