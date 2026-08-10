import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, reactive, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { p as useUserSession } from './server.mjs';
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
    let __temp, __restore;
    useToast();
    const { user: sessionUser } = useUserSession();
    const isAdminUser = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const [{ data: comData }, { data: custData }, { data: branchData }, { data: salesData, refresh: refreshSales }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/trading/commodities",
        "$OVz8ch5TBF"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/customers",
        { query: { per: 500, simple: "1" } },
        "$IwvZ2qIbIm"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/branches",
        "$susR5nYKSX"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/trading/sales",
        "$c9SKAF1agS"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const commodities = computed(() => {
      var _a, _b;
      return (_b = (_a = comData.value) == null ? void 0 : _a.commodities) != null ? _b : [];
    });
    const branches = computed(() => {
      var _a, _b;
      return ((_b = (_a = branchData.value) == null ? void 0 : _a.branches) != null ? _b : []).filter((b) => b.status === "active");
    });
    const sales = computed(() => {
      var _a, _b;
      return (_b = (_a = salesData.value) == null ? void 0 : _a.sales) != null ? _b : [];
    });
    const customerOptions = computed(() => {
      var _a, _b;
      return ((_b = (_a = custData.value) == null ? void 0 : _a.customers) != null ? _b : []).map((c) => ({
        value: c.id,
        label: c.name,
        sub: c.business_name || ""
      }));
    });
    const form = reactive({
      customerId: "",
      commodityId: "",
      origin: "",
      branchId: "",
      saleDate: todayStr,
      quantity: 0,
      unitPrice: 0,
      notes: "",
      stockOverride: false
    });
    const selectedCommodity = computed(() => commodities.value.find((c) => String(c.id) === form.commodityId));
    const stockRow = computed(() => {
      var _a, _b;
      return ((_b = (_a = selectedCommodity.value) == null ? void 0 : _a.stock) != null ? _b : []).find((s) => String(s.branch_id) === String(form.branchId || 0) && s.origin === form.origin);
    });
    const avgCostHint = computed(() => {
      var _a, _b;
      return (_b = (_a = stockRow.value) == null ? void 0 : _a.avg_cost) != null ? _b : 0;
    });
    const onHand = computed(() => {
      var _a, _b;
      return (_b = (_a = stockRow.value) == null ? void 0 : _a.qty) != null ? _b : 0;
    });
    const totalAmount = computed(() => Math.round((form.quantity || 0) * (form.unitPrice || 0) * 100) / 100);
    const stockWarning = computed(() => {
      var _a, _b;
      if (!form.commodityId || !form.quantity) return "";
      if (form.quantity > onHand.value)
        return `Only ${onHand.value.toLocaleString()} ${(_b = (_a = selectedCommodity.value) == null ? void 0 : _a.unit) != null ? _b : ""} on hand${form.origin ? ` for ${form.origin}` : ""} \u2014 this sale would go ${(form.quantity - onHand.value).toLocaleString()} negative.`;
      return "";
    });
    const canSubmit = computed(() => !!form.customerId && !!form.commodityId && form.quantity > 0 && form.unitPrice > 0 && (!stockWarning.value || form.stockOverride));
    const submitting = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Commodity Sales",
        subtitle: "Record a trading sale \u2014 manual pricing, per-origin stock, maker/checker",
        breadcrumb: ["Trading", "Sales"]
      }, null, _parent));
      _push(`<div class="glass-card p-6 space-y-4 max-w-4xl"><h3 class="section-title">New Sale</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="space-y-1.5 md:col-span-2"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer *</label>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(form).customerId,
        "onUpdate:modelValue": ($event) => unref(form).customerId = $event,
        options: unref(customerOptions),
        placeholder: "Search customer\u2026"
      }, null, _parent));
      _push(`</div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sale Date${ssrInterpolate(unref(isAdminUser) ? " (backdatable)" : "")}</label><input${ssrRenderAttr("value", unref(form).saleDate)} type="date"${ssrRenderAttr("max", unref(todayStr))}${ssrIncludeBooleanAttr(!unref(isAdminUser)) ? " disabled" : ""} class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Commodity *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).commodityId) ? ssrLooseContain(unref(form).commodityId, "") : ssrLooseEqual(unref(form).commodityId, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
      ssrRenderList(unref(commodities), (c) => {
        _push(`<option${ssrRenderAttr("value", String(c.id))}${ssrIncludeBooleanAttr(!c.ready) ? " disabled" : ""}${ssrIncludeBooleanAttr(Array.isArray(unref(form).commodityId) ? ssrLooseContain(unref(form).commodityId, String(c.id)) : ssrLooseEqual(unref(form).commodityId, String(c.id))) ? " selected" : ""}>${ssrInterpolate(c.name)} (${ssrInterpolate(c.unit)})${ssrInterpolate(c.ready ? "" : " \u2014 no GL account set")}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Origin</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).origin) ? ssrLooseContain(unref(form).origin, "") : ssrLooseEqual(unref(form).origin, "")) ? " selected" : ""}>Not tracked</option><!--[-->`);
      ssrRenderList((_b = (_a = unref(selectedCommodity)) == null ? void 0 : _a.origins) != null ? _b : [], (o) => {
        _push(`<option${ssrRenderAttr("value", o)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).origin) ? ssrLooseContain(unref(form).origin, o) : ssrLooseEqual(unref(form).origin, o)) ? " selected" : ""}>${ssrInterpolate(o)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, "") : ssrLooseEqual(unref(form).branchId, "")) ? " selected" : ""}>\u2014 None \u2014</option><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<option${ssrRenderAttr("value", String(b.id))}${ssrIncludeBooleanAttr(Array.isArray(unref(form).branchId) ? ssrLooseContain(unref(form).branchId, String(b.id)) : ssrLooseEqual(unref(form).branchId, String(b.id))) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity * `);
      if (unref(selectedCommodity)) {
        _push(`<span class="normal-case">(${ssrInterpolate(unref(selectedCommodity).unit)})</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label><input${ssrRenderAttr("value", unref(form).quantity)} type="number" min="0" step="any" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price * (\u09F3)</label><input${ssrRenderAttr("value", unref(form).unitPrice)} type="number" min="0" step="any" class="input-glass font-mono"${ssrRenderAttr("placeholder", unref(avgCostHint) ? `avg cost \u09F3${unref(avgCostHint).toLocaleString()}` : "")}>`);
      if (unref(avgCostHint)) {
        _push(`<p class="text-[10px] text-gray-600">Reference: weighted-avg cost \u09F3${ssrInterpolate(unref(avgCostHint).toLocaleString())}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</label><p class="text-lg font-bold text-gold-400 pt-1.5">\u09F3${ssrInterpolate(unref(totalAmount).toLocaleString())}</p></div><div class="md:col-span-3 space-y-1.5"><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</label><input${ssrRenderAttr("value", unref(form).notes)} class="input-glass" placeholder="Optional\u2026"></div></div>`);
      if (unref(stockWarning)) {
        _push(`<div class="rounded-xl p-3 text-xs text-amber-300 space-y-2" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.08)", "border": "1px solid rgba(245,158,11,0.25)" })}"><p>\u26A0 ${ssrInterpolate(unref(stockWarning))}</p><label class="flex items-center gap-2 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).stockOverride) ? ssrLooseContain(unref(form).stockOverride, null) : unref(form).stockOverride) ? " checked" : ""} type="checkbox" class="accent-amber-500"><span class="text-gray-300">Sell anyway \u2014 I understand stock will go negative</span></label></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex justify-end"><button${ssrIncludeBooleanAttr(!unref(canSubmit) || unref(submitting)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50">${ssrInterpolate(unref(submitting) ? "Recording\u2026" : "Record Sale")}</button></div></div><div class="glass-card p-5"><h3 class="section-title mb-3">Recent Sales</h3><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-600 uppercase tracking-wider text-[10px] border-b border-white/[0.06]"><th class="text-left py-2 pr-3">Sale #</th><th class="text-left pr-3">Date</th><th class="text-left pr-3">Customer</th><th class="text-left pr-3">Commodity</th><th class="text-right pr-3">Qty</th><th class="text-right pr-3">Total</th><th class="text-right pr-3">Due</th><th class="text-left pr-3">Dispatch</th><th></th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(sales), (s) => {
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
      if (!unref(sales).length) {
        _push(`<tr><td colspan="9" class="py-6 text-center text-gray-600">No sales yet.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trading/sales/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DB7ozhrc.mjs.map
