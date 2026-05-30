import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: poData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/orders/open",
      "$0dhNeqPc_c"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const openPOs = computed(() => {
      var _a, _b;
      return (_b = (_a = poData.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const form = reactive({
      poId: "",
      date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      vehicle: "",
      driver: "",
      quality: "A",
      notes: "",
      items: [{ product: "", qty_mt: 0, unit_price_per_mt: 45e3, condition: "good" }]
    });
    const saving = ref(false);
    const selectedPO = computed(() => {
      var _a;
      return (_a = openPOs.value.find((p) => p.id === Number(form.poId))) != null ? _a : null;
    });
    const totalQty = computed(() => form.items.reduce((s, i) => s + (i.qty_mt || 0), 0));
    const totalValue = computed(() => form.items.reduce((s, i) => s + i.qty_mt * i.unit_price_per_mt, 0));
    const isValid = computed(
      () => form.poId && form.date && form.items.every((i) => i.product && i.qty_mt > 0)
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Record Goods Received",
        subtitle: "Record inbound wheat delivery against a Purchase Order",
        breadcrumb: ["Purchase", "GRN", "Record GRN"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/grn",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All GRNs`);
                } else {
                  return [
                    createTextVNode("\u2190 All GRNs")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/grn",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All GRNs")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Purchase Order Reference</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order # *</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).poId) ? ssrLooseContain(unref(form).poId, "") : ssrLooseEqual(unref(form).poId, "")) ? " selected" : ""}>\u2014 Select PO \u2014</option><!--[-->`);
      ssrRenderList(unref(openPOs), (po) => {
        _push(`<option${ssrRenderAttr("value", po.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).poId) ? ssrLooseContain(unref(form).poId, po.id) : ssrLooseEqual(unref(form).poId, po.id)) ? " selected" : ""}>${ssrInterpolate(po.po_number)} \u2014 ${ssrInterpolate(po.supplier_name)}</option>`);
      });
      _push(`<!--]--></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">GRN Date *</label><input${ssrRenderAttr("value", unref(form).date)} type="date" class="input-glass"></div></div>`);
      if (unref(selectedPO)) {
        _push(`<div class="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-xs space-y-2"><div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">${ssrInterpolate(unref(selectedPO).supplier_name)}</span></div><div class="flex justify-between"><span class="text-gray-600">PO Amount</span><span class="text-gray-300">\u09F3${ssrInterpolate(Number(unref(selectedPO).total_order_value).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Ordered Qty</span><span class="text-gray-300">${ssrInterpolate((Number(unref(selectedPO).quantity_kg) / 1e3).toFixed(2))} MT</span></div><div class="flex justify-between"><span class="text-gray-600">Yet to Receive</span><span class="${ssrRenderClass(Number(unref(selectedPO).qty_yet_to_receive) > 0 ? "text-orange-300" : "text-emerald-400")}">${ssrInterpolate((Number((_a = unref(selectedPO).qty_yet_to_receive) != null ? _a : unref(selectedPO).quantity_kg) / 1e3).toFixed(2))} MT </span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Items Received</h3><div class="space-y-4"><!--[-->`);
      ssrRenderList(unref(form).items, (item, i) => {
        _push(`<div class="rounded-xl border border-white/[0.07] p-4 space-y-3"><div class="flex items-center justify-between"><p class="text-sm font-semibold text-gray-300">Item ${ssrInterpolate(i + 1)}</p>`);
        if (unref(form).items.length > 1) {
          _push(`<button class="text-xs text-gray-600 hover:text-red-400 transition-colors">Remove</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 sm:grid-cols-3 gap-3"><div class="space-y-1"><label class="text-[11px] font-semibold text-gray-500 uppercase">Product</label><select class="input-glass text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(item.product) ? ssrLooseContain(item.product, "") : ssrLooseEqual(item.product, "")) ? " selected" : ""}>\u2014 Select \u2014</option><option value="wheat_hard"${ssrIncludeBooleanAttr(Array.isArray(item.product) ? ssrLooseContain(item.product, "wheat_hard") : ssrLooseEqual(item.product, "wheat_hard")) ? " selected" : ""}>Hard Wheat (Import)</option><option value="wheat_soft"${ssrIncludeBooleanAttr(Array.isArray(item.product) ? ssrLooseContain(item.product, "wheat_soft") : ssrLooseEqual(item.product, "wheat_soft")) ? " selected" : ""}>Soft Wheat (Local)</option><option value="wheat_durum"${ssrIncludeBooleanAttr(Array.isArray(item.product) ? ssrLooseContain(item.product, "wheat_durum") : ssrLooseEqual(item.product, "wheat_durum")) ? " selected" : ""}>Durum Wheat</option></select></div><div class="space-y-1"><label class="text-[11px] font-semibold text-gray-500 uppercase">Quantity (MT)</label><input${ssrRenderAttr("value", item.qty_mt)} type="number" min="0" step="0.5" class="input-glass text-xs font-mono"></div><div class="space-y-1"><label class="text-[11px] font-semibold text-gray-500 uppercase">Unit Price (\u09F3/MT)</label><input${ssrRenderAttr("value", item.unit_price_per_mt)} type="number" min="0" class="input-glass text-xs font-mono"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div class="space-y-1"><label class="text-[11px] font-semibold text-gray-500 uppercase">Condition</label><select class="input-glass text-xs"><option value="good"${ssrIncludeBooleanAttr(Array.isArray(item.condition) ? ssrLooseContain(item.condition, "good") : ssrLooseEqual(item.condition, "good")) ? " selected" : ""}>Good \u2014 No damage</option><option value="minor_damage"${ssrIncludeBooleanAttr(Array.isArray(item.condition) ? ssrLooseContain(item.condition, "minor_damage") : ssrLooseEqual(item.condition, "minor_damage")) ? " selected" : ""}>Minor damage noted</option><option value="partial_reject"${ssrIncludeBooleanAttr(Array.isArray(item.condition) ? ssrLooseContain(item.condition, "partial_reject") : ssrLooseEqual(item.condition, "partial_reject")) ? " selected" : ""}>Partial rejection</option></select></div><div class="space-y-1"><label class="text-[11px] font-semibold text-gray-500 uppercase">Total Value</label><div class="input-glass text-xs font-mono text-gold-400 font-bold bg-white/[0.02]"> \u09F3${ssrInterpolate((item.qty_mt * item.unit_price_per_mt).toLocaleString())}</div></div></div></div>`);
      });
      _push(`<!--]--><button class="w-full py-2 rounded-xl border border-dashed border-white/20 text-xs text-gray-500 hover:text-gray-300 hover:border-white/40 transition-all">+ Add Item</button></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Transport &amp; Quality Check</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transport Vehicle</label><input${ssrRenderAttr("value", unref(form).vehicle)} type="text" class="input-glass" placeholder="Reg. plate / vehicle no."></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Driver / Transporter</label><input${ssrRenderAttr("value", unref(form).driver)} type="text" class="input-glass" placeholder="Name"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quality Rating</label><select class="input-glass"><option value="A"${ssrIncludeBooleanAttr(Array.isArray(unref(form).quality) ? ssrLooseContain(unref(form).quality, "A") : ssrLooseEqual(unref(form).quality, "A")) ? " selected" : ""}>Grade A \u2014 Excellent</option><option value="B"${ssrIncludeBooleanAttr(Array.isArray(unref(form).quality) ? ssrLooseContain(unref(form).quality, "B") : ssrLooseEqual(unref(form).quality, "B")) ? " selected" : ""}>Grade B \u2014 Good</option><option value="C"${ssrIncludeBooleanAttr(Array.isArray(unref(form).quality) ? ssrLooseContain(unref(form).quality, "C") : ssrLooseEqual(unref(form).quality, "C")) ? " selected" : ""}>Grade C \u2014 Acceptable</option><option value="R"${ssrIncludeBooleanAttr(Array.isArray(unref(form).quality) ? ssrLooseContain(unref(form).quality, "R") : ssrLooseEqual(unref(form).quality, "R")) ? " selected" : ""}>Rejected</option></select></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes / Remarks</label><textarea rows="3" class="input-glass resize-none" placeholder="Any issues, moisture level, pest inspection remarks\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div><div class="flex items-center gap-3"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Confirm GRN")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/grn",
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
      _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">GRN Summary</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">PO Reference</span><span class="font-mono text-gold-400/80">${ssrInterpolate(((_b = unref(selectedPO)) == null ? void 0 : _b.po_number) || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">${ssrInterpolate(((_c = unref(selectedPO)) == null ? void 0 : _c.supplier_name) || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Items</span><span class="text-gray-300">${ssrInterpolate(unref(form).items.length)}</span></div><div class="flex justify-between"><span class="text-gray-600">Total Qty</span><span class="text-gray-300">${ssrInterpolate(unref(totalQty).toFixed(2))} MT</span></div><div class="h-px bg-white/[0.06]"></div><div class="flex justify-between"><span class="text-gray-600 font-semibold">Total Value</span><span class="font-bold text-gold-400">\u09F3${ssrInterpolate(unref(totalValue).toLocaleString())}</span></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/grn/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-MJ3PkC5-.mjs.map
