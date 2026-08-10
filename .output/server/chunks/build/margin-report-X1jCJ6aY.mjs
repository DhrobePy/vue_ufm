import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, reactive, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "margin-report",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const filters = reactive({ date_from: "", date_to: "" });
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/trading/margin-report",
      {
        query: computed(() => ({
          ...filters.date_from ? { date_from: filters.date_from } : {},
          ...filters.date_to ? { date_to: filters.date_to } : {}
        }))
      },
      "$G1gQE4xcoN"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const period = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.period) != null ? _b : {};
    });
    const byCommodity = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.by_commodity) != null ? _b : [];
    });
    const salesDetail = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.sales) != null ? _b : [];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Trading Margin Report",
        subtitle: "Revenue / COGS / margin per commodity",
        breadcrumb: ["Trading", "Margin Report"]
      }, null, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap items-end gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase">From</label><input${ssrRenderAttr("value", unref(filters).date_from)} type="date" class="input-glass text-xs py-1.5"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase">To</label><input${ssrRenderAttr("value", unref(filters).date_to)} type="date" class="input-glass text-xs py-1.5"></div><button class="btn-gold text-xs py-2">Apply</button><span class="flex-1"></span><button class="btn-ghost text-xs py-2">\u2B07 CSV</button></div><div class="glass-card p-5"><h3 class="section-title mb-3">By Commodity <span class="text-gray-600 text-xs font-normal">${ssrInterpolate(unref(period).from)} \u2192 ${ssrInterpolate(unref(period).to)}</span></h3><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Commodity</th><th class="text-right pr-3">Sales</th><th class="text-right pr-3">Qty</th><th class="text-right pr-3">Revenue</th><th class="text-right pr-3">COGS</th><th class="text-right pr-3">Margin</th><th class="text-right">Margin %</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(byCommodity), (r) => {
        _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 pr-3 text-gray-200">${ssrInterpolate(r.commodity_name)}</td><td class="pr-3 text-right text-gray-400">${ssrInterpolate(r.sales_count)}</td><td class="pr-3 text-right font-mono text-gray-400">${ssrInterpolate(Number(r.qty).toLocaleString())} ${ssrInterpolate(r.unit)}</td><td class="pr-3 text-right font-mono text-gold-400">\u09F3${ssrInterpolate(Number(r.revenue).toLocaleString())}</td><td class="pr-3 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(Number(r.cogs).toLocaleString())}</td><td class="${ssrRenderClass(["pr-3 text-right font-mono font-bold", r.margin >= 0 ? "text-emerald-400" : "text-red-400"])}">\u09F3${ssrInterpolate(Number(r.margin).toLocaleString())}</td><td class="${ssrRenderClass(["text-right font-mono", r.margin >= 0 ? "text-emerald-400" : "text-red-400"])}">${ssrInterpolate(r.margin_pct)}%</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(byCommodity).length) {
        _push(`<tr><td colspan="7" class="py-6 text-center text-gray-600">No sales in this period.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div><div class="glass-card p-5"><h3 class="section-title mb-3">Sale Detail</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Sale #</th><th class="text-left pr-3">Date</th><th class="text-left pr-3">Customer</th><th class="text-left pr-3">Commodity</th><th class="text-right pr-3">Qty</th><th class="text-right pr-3">Revenue</th><th class="text-right pr-3">COGS</th><th class="text-right">Margin</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(salesDetail), (s) => {
        _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 pr-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/trading/sales/${s.id}`,
          class: "font-mono text-gold-400 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(s.sale_number)}`);
            } else {
              return [
                createTextVNode(toDisplayString(s.sale_number), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td><td class="pr-3 text-gray-400">${ssrInterpolate(String(s.sale_date).slice(0, 10))}</td><td class="pr-3 text-gray-200">${ssrInterpolate(s.customer_name)}</td><td class="pr-3 text-gray-400">${ssrInterpolate(s.commodity_name)}${ssrInterpolate(s.origin ? ` (${s.origin})` : "")}</td><td class="pr-3 text-right font-mono text-gray-400">${ssrInterpolate(Number(s.quantity).toLocaleString())}</td><td class="pr-3 text-right font-mono text-gold-400">\u09F3${ssrInterpolate(Number(s.total_amount).toLocaleString())}</td><td class="pr-3 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(Number(s.cogs_amount).toLocaleString())}</td><td class="text-right font-mono text-emerald-400">\u09F3${ssrInterpolate((Number(s.total_amount) - Number(s.cogs_amount)).toLocaleString())}</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trading/margin-report.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=margin-report-X1jCJ6aY.mjs.map
