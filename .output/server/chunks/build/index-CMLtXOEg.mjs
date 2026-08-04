import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, reactive, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { k as useRoute, l as useRouter } from './server.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d, _e;
    let __temp, __restore;
    const route = useRoute();
    useRouter();
    const q = route.query;
    const filters = reactive({
      date_from: String((_a = q.date_from) != null ? _a : ""),
      date_to: String((_b = q.date_to) != null ? _b : ""),
      customer_id: String((_c = q.customer_id) != null ? _c : ""),
      commodity_id: String((_d = q.commodity_id) != null ? _d : ""),
      origin: String((_e = q.origin) != null ? _e : "")
    });
    const queryParams = computed(() => ({
      ...filters.date_from ? { date_from: filters.date_from } : {},
      ...filters.date_to ? { date_to: filters.date_to } : {},
      ...filters.customer_id ? { customer_id: String(filters.customer_id) } : {},
      ...filters.commodity_id ? { commodity_id: filters.commodity_id } : {},
      ...filters.origin ? { origin: filters.origin } : {}
    }));
    const hasActiveFilters = computed(() => !!(filters.date_from || filters.date_to || filters.customer_id || filters.commodity_id || filters.origin));
    const [{ data }, { data: comData }, { data: custData }, { data: salesData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/trading/dashboard",
        { query: queryParams },
        "$xIbA0bbO-x"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/trading/commodities",
        "$_TsQJ7qwaj"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/customers",
        { query: { per: 500, simple: "1" } },
        "$BDEdyaHUYw"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/trading/sales",
        { query: queryParams },
        "$KfHYVUoDZj"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const kpis = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = data.value) == null ? void 0 : _a2.kpis) != null ? _b2 : {};
    });
    const inventory = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = data.value) == null ? void 0 : _a2.inventory) != null ? _b2 : [];
    });
    const negativeStock = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = data.value) == null ? void 0 : _a2.negative_stock) != null ? _b2 : [];
    });
    const settlements = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = data.value) == null ? void 0 : _a2.settlements) != null ? _b2 : [];
    });
    const saleHistory = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = salesData.value) == null ? void 0 : _a2.sales) != null ? _b2 : [];
    });
    const commodities = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = comData.value) == null ? void 0 : _a2.commodities) != null ? _b2 : [];
    });
    const customerOptions = computed(() => {
      var _a2, _b2;
      return ((_b2 = (_a2 = custData.value) == null ? void 0 : _a2.customers) != null ? _b2 : []).map((c) => ({
        value: c.id,
        label: c.name,
        sub: c.business_name || ""
      }));
    });
    const originOptionsForFilter = computed(() => {
      var _a2, _b2;
      return (_b2 = (_a2 = commodities.value.find((c) => String(c.id) === filters.commodity_id)) == null ? void 0 : _a2.origins) != null ? _b2 : [];
    });
    const kpiTiles = computed(() => {
      var _a2, _b2, _c2, _d2, _e2, _f, _g, _h, _i;
      return [
        { label: "Sales", value: String((_a2 = kpis.value.sales_count) != null ? _a2 : 0), color: "text-gray-200" },
        { label: "Revenue", value: `\u09F3${Number((_b2 = kpis.value.revenue) != null ? _b2 : 0).toLocaleString()}`, color: "text-gold-400" },
        { label: "COGS", value: `\u09F3${Number((_c2 = kpis.value.cogs) != null ? _c2 : 0).toLocaleString()}`, color: "text-gray-300" },
        { label: "Margin", value: `\u09F3${Number((_d2 = kpis.value.margin) != null ? _d2 : 0).toLocaleString()} (${(_e2 = kpis.value.margin_pct) != null ? _e2 : 0}%)`, color: Number((_f = kpis.value.margin) != null ? _f : 0) >= 0 ? "text-emerald-400" : "text-red-400" },
        { label: "Collected", value: `\u09F3${Number((_g = kpis.value.collected) != null ? _g : 0).toLocaleString()}`, color: "text-emerald-400" },
        { label: "Outstanding", value: `\u09F3${Number((_h = kpis.value.outstanding) != null ? _h : 0).toLocaleString()}`, color: "text-orange-400" },
        { label: "Stock Value", value: `\u09F3${Number((_i = kpis.value.inventory_value) != null ? _i : 0).toLocaleString()}`, color: "text-blue-300" }
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Commodity Trading",
        subtitle: "Buy\u2013sell commodity margin business \u2014 separate from flour production",
        breadcrumb: ["Trading", "Dashboard"]
      }, null, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap items-end gap-3"><div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">From</label><input${ssrRenderAttr("value", unref(filters).date_from)} type="date" class="input-glass text-xs py-1.5"></div><div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">To</label><input${ssrRenderAttr("value", unref(filters).date_to)} type="date" class="input-glass text-xs py-1.5"></div><div class="space-y-1 min-w-[200px]"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Customer</label>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(filters).customer_id,
        "onUpdate:modelValue": ($event) => unref(filters).customer_id = $event,
        options: unref(customerOptions),
        placeholder: "All customers"
      }, null, _parent));
      _push(`</div><div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Commodity</label><select class="input-glass text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).commodity_id) ? ssrLooseContain(unref(filters).commodity_id, "") : ssrLooseEqual(unref(filters).commodity_id, "")) ? " selected" : ""}>All commodities</option><!--[-->`);
      ssrRenderList(unref(commodities), (c) => {
        _push(`<option${ssrRenderAttr("value", String(c.id))}${ssrIncludeBooleanAttr(Array.isArray(unref(filters).commodity_id) ? ssrLooseContain(unref(filters).commodity_id, String(c.id)) : ssrLooseEqual(unref(filters).commodity_id, String(c.id))) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1"><label class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Origin</label><select class="input-glass text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).origin) ? ssrLooseContain(unref(filters).origin, "") : ssrLooseEqual(unref(filters).origin, "")) ? " selected" : ""}>All origins</option><!--[-->`);
      ssrRenderList(unref(originOptionsForFilter), (o) => {
        _push(`<option${ssrRenderAttr("value", o)}${ssrIncludeBooleanAttr(Array.isArray(unref(filters).origin) ? ssrLooseContain(unref(filters).origin, o) : ssrLooseEqual(unref(filters).origin, o)) ? " selected" : ""}>${ssrInterpolate(o)}</option>`);
      });
      _push(`<!--]--></select></div><button class="btn-gold text-xs py-2">Apply</button>`);
      if (unref(hasActiveFilters)) {
        _push(`<button class="btn-ghost text-xs py-2">Clear</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="flex-1"></span>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/trading/sales",
        class: "btn-gold text-xs py-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`+ New Sale`);
          } else {
            return [
              createTextVNode("+ New Sale")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(negativeStock).length) {
        _push(`<div class="rounded-xl p-3 text-xs text-red-300" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.08)", "border": "1px solid rgba(239,68,68,0.25)" })}"> \u26A0 Negative stock (sold past on-hand with override): <!--[-->`);
        ssrRenderList(unref(negativeStock), (r, i) => {
          _push(`<span class="font-mono ml-2">${ssrInterpolate(r.commodity_name)}${ssrInterpolate(r.origin ? ` (${r.origin})` : "")}: ${ssrInterpolate(Number(r.qty_on_hand).toLocaleString())} ${ssrInterpolate(r.unit)}</span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3"><!--[-->`);
      ssrRenderList(unref(kpiTiles), (t) => {
        _push(`<div class="glass-card p-4"><p class="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">${ssrInterpolate(t.label)}</p><p class="${ssrRenderClass(["text-lg font-bold mt-1", t.color])}">${ssrInterpolate(t.value)}</p></div>`);
      });
      _push(`<!--]--></div><div class="glass-card p-5"><h3 class="section-title mb-3">Stock on Hand</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Commodity</th><th class="text-left pr-3">Branch</th><th class="text-left pr-3">Origin</th><th class="text-right pr-3">Qty</th><th class="text-right pr-3">Avg Cost</th><th class="text-right">Value</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(inventory), (r, i) => {
        var _a2;
        _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 pr-3 text-gray-200">${ssrInterpolate(r.commodity_name)}</td><td class="pr-3 text-gray-400">${ssrInterpolate((_a2 = r.branch_name) != null ? _a2 : "\u2014")}</td><td class="pr-3 text-gray-400">${ssrInterpolate(r.origin || "\u2014")}</td><td class="${ssrRenderClass(["pr-3 text-right font-mono", Number(r.qty_on_hand) < 0 ? "text-red-400 font-bold" : "text-gray-200"])}">${ssrInterpolate(Number(r.qty_on_hand).toLocaleString())} ${ssrInterpolate(r.unit)}</td><td class="pr-3 text-right font-mono text-gray-400">\u09F3${ssrInterpolate(Number(r.weighted_avg_cost).toLocaleString())}</td><td class="text-right font-mono text-gray-200">\u09F3${ssrInterpolate((Math.max(0, Number(r.qty_on_hand)) * Number(r.weighted_avg_cost)).toLocaleString(void 0, { maximumFractionDigits: 0 }))}</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(inventory).length) {
        _push(`<tr><td colspan="6" class="py-6 text-center text-gray-600">No commodity stock yet \u2014 record a GRN with a receiving branch on a commodity-tagged PO.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div><div class="glass-card p-5"><h3 class="section-title mb-3">Sale History <span class="text-gray-600 font-normal text-xs">(${ssrInterpolate(unref(saleHistory).length)} shown, max 200)</span></h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Sale #</th><th class="text-left pr-3">Date</th><th class="text-left pr-3">Customer</th><th class="text-left pr-3">Commodity</th><th class="text-right pr-3">Qty</th><th class="text-right pr-3">Total</th><th class="text-right pr-3">Due</th><th class="text-left pr-3">Dispatch</th><th></th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(saleHistory), (s) => {
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
        _push(`</td><td class="pr-3 text-gray-400">${ssrInterpolate(String(s.sale_date).slice(0, 10))}</td><td class="pr-3 text-gray-200">${ssrInterpolate(s.customer_name)}</td><td class="pr-3 text-gray-400">${ssrInterpolate(s.commodity_name)}${ssrInterpolate(s.origin ? ` (${s.origin})` : "")}</td><td class="pr-3 text-right font-mono text-gray-300">${ssrInterpolate(Number(s.quantity).toLocaleString())} ${ssrInterpolate(s.unit)}</td><td class="pr-3 text-right font-mono text-gray-200">\u09F3${ssrInterpolate(Number(s.total_amount).toLocaleString())}</td><td class="${ssrRenderClass(["pr-3 text-right font-mono", Number(s.balance_due) > 0 ? "text-orange-400" : "text-emerald-400"])}">\u09F3${ssrInterpolate(Number(s.balance_due).toLocaleString())}</td><td class="pr-3 text-gray-500">${ssrInterpolate(s.delivered_at ? "\u2705 Delivered" : s.gate_out_at ? "\u{1F69A} In transit" : "\u2014")}</td><td class="text-right">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/trading/sales/${s.id}`,
          class: "btn-ghost text-[10px] py-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Open`);
            } else {
              return [
                createTextVNode("Open")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(saleHistory).length) {
        _push(`<tr><td colspan="9" class="py-6 text-center text-gray-600">No sales match this filter.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      if (unref(settlements).length) {
        _push(`<div class="glass-card p-5"><h3 class="section-title mb-3">Recent Partner Settlements</h3><div class="space-y-1.5"><!--[-->`);
        ssrRenderList(unref(settlements), (s) => {
          _push(`<div class="flex items-center gap-3 text-xs py-1.5 border-b border-white/[0.03]"><span class="font-mono text-gold-400">${ssrInterpolate(s.settlement_number)}</span><span class="text-gray-300">${ssrInterpolate(s.partner_name)}</span><span class="flex-1"></span><span class="font-mono text-gray-200">\u09F3${ssrInterpolate(Number(s.amount).toLocaleString())}</span><span class="text-gray-600">${ssrInterpolate(String(s.settlement_date).slice(0, 10))}</span></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex flex-wrap gap-3">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/trading/sales",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Sales`);
          } else {
            return [
              createTextVNode("Sales")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/trading/partners",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Business Partners &amp; Settlement`);
          } else {
            return [
              createTextVNode("Business Partners & Settlement")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/trading/margin-report",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Margin Report`);
          } else {
            return [
              createTextVNode("Margin Report")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trading/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CMLtXOEg.mjs.map
