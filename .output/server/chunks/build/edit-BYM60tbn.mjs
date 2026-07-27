import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, withAsyncContext, computed, reactive, watch, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const poId = Number(route.params.id);
    const [{ data: poData, pending, error: fetchError }, { data: supData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        () => `/api/purchase/orders/${poId}`,
        "$WixMyhdlOr"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/suppliers",
        { query: { per: 200 } },
        "$jhJUHuCN2v"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const suppliers = computed(() => {
      var _a, _b;
      return (_b = (_a = supData.value) == null ? void 0 : _a.suppliers) != null ? _b : [];
    });
    const supplierOptions = computed(() => suppliers.value.map((s) => ({
      value: s.id,
      label: s.company_name
    })));
    const po = computed(() => {
      var _a, _b;
      return (_b = (_a = poData.value) == null ? void 0 : _a.po) != null ? _b : {};
    });
    const poNo = computed(() => {
      var _a;
      return (_a = po.value.po_number) != null ? _a : `PO-${poId}`;
    });
    const { data: commData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/commodities",
      "$psmPHCBE9W"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const originOptions = computed(() => {
      var _a, _b, _c;
      const c = ((_b = (_a = commData.value) == null ? void 0 : _a.commodities) != null ? _b : []).find((c2) => c2.id === po.value.commodity_id);
      return (_c = c == null ? void 0 : c.origins) != null ? _c : [];
    });
    const unitLabel = computed(() => {
      const u = po.value.commodity_unit;
      return !u || u === "MT" ? "KG" : u;
    });
    const original = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      return {
        poNumber: (_a = po.value.po_number) != null ? _a : "",
        poDate: po.value.po_date ? String(po.value.po_date).slice(0, 10) : "",
        supplierId: po.value.supplier_id ? String(po.value.supplier_id) : "",
        supplier: (_c = (_b = po.value.supplier_name) != null ? _b : po.value.company_name) != null ? _c : "",
        origin: (_d = po.value.wheat_origin) != null ? _d : "",
        commodityName: (_e = po.value.commodity_name) != null ? _e : "Wheat",
        qty: Number((_f = po.value.quantity_kg) != null ? _f : 0),
        unitPrice: Number((_g = po.value.unit_price_per_kg) != null ? _g : 0),
        expectedDelivery: po.value.expected_delivery_date ? String(po.value.expected_delivery_date).slice(0, 10) : "",
        remarks: (_h = po.value.remarks) != null ? _h : "",
        isLocked: Boolean(po.value.is_delivery_locked),
        lockReason: (_i = po.value.delivery_lock_reason) != null ? _i : "",
        lockedBy: (_j = po.value.locked_by_name) != null ? _j : "",
        lockedAt: po.value.delivery_locked_at ? String(po.value.delivery_locked_at).slice(0, 10) : ""
      };
    });
    const form = reactive({
      poNumber: "",
      poDate: "",
      supplierId: "",
      origin: "",
      qty: 0,
      unitPrice: 0,
      expectedDelivery: "",
      remarks: ""
    });
    watch(original, (o) => {
      Object.assign(form, {
        poNumber: o.poNumber,
        poDate: o.poDate,
        supplierId: o.supplierId,
        origin: o.origin,
        qty: o.qty,
        unitPrice: o.unitPrice,
        expectedDelivery: o.expectedDelivery,
        remarks: o.remarks
      });
    }, { immediate: true });
    const lockAction = ref("");
    const lockReason = ref("");
    const totalValue = computed(() => Math.round((form.qty || 0) * (form.unitPrice || 0)));
    const totalChanged = computed(
      () => Math.abs(totalValue.value - original.value.qty * original.value.unitPrice) > 0.5
    );
    function fmtPrice(val) {
      return val.toFixed(10).replace(/0+$/, "").replace(/\.$/, ".0");
    }
    const changes = computed(() => {
      var _a, _b;
      const o = original.value;
      const list = [];
      if (form.poNumber !== o.poNumber)
        list.push({ key: "poNumber", label: "PO Number", old: o.poNumber, new: form.poNumber });
      if (form.poDate !== o.poDate)
        list.push({ key: "poDate", label: "PO Date", old: o.poDate, new: form.poDate });
      if (form.supplierId !== o.supplierId) {
        const newSup = (_b = (_a = suppliers.value.find((s) => String(s.id) === form.supplierId)) == null ? void 0 : _a.company_name) != null ? _b : form.supplierId;
        list.push({ key: "supplier", label: "Supplier", old: o.supplier, new: newSup });
      }
      if (form.origin !== o.origin)
        list.push({ key: "origin", label: "Origin", old: o.origin, new: form.origin });
      if (Math.abs((form.qty || 0) - o.qty) > 1e-3)
        list.push({ key: "qty", label: "Quantity", old: `${Number(o.qty).toLocaleString()} ${unitLabel.value}`, new: `${Number(form.qty || 0).toLocaleString()} ${unitLabel.value}` });
      if (Math.abs((form.unitPrice || 0) - o.unitPrice) > 1e-9)
        list.push({ key: "unitPrice", label: "Unit Price", old: `\u09F3${fmtPrice(o.unitPrice)}/${unitLabel.value}`, new: `\u09F3${fmtPrice(form.unitPrice || 0)}/${unitLabel.value}` });
      if (totalChanged.value)
        list.push({ key: "total", label: "Total Value", old: `\u09F3${(o.qty * o.unitPrice).toLocaleString()}`, new: `\u09F3${totalValue.value.toLocaleString()}` });
      if (form.expectedDelivery !== o.expectedDelivery)
        list.push({ key: "delivery", label: "Expected Delivery", old: o.expectedDelivery || "Not set", new: form.expectedDelivery || "Not set" });
      if (form.remarks !== o.remarks)
        list.push({ key: "remarks", label: "Remarks", old: o.remarks || "\u2014", new: form.remarks || "\u2014" });
      if (lockAction.value === "lock")
        list.push({ key: "lock", label: "Delivery Lock", old: "Open", new: "\u{1F512} Locked" });
      if (lockAction.value === "unlock")
        list.push({ key: "lock", label: "Delivery Lock", old: "\u{1F512} Locked", new: "Open" });
      return list;
    });
    const hasChanges = computed(() => changes.value.length > 0);
    const confirmModal = ref(false);
    const saving = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSearchSelect = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-4xl" }, _attrs))} data-v-c8c97eeb>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Edit \u2014 ${unref(poNo)}`,
        subtitle: "Full Edit Mode \xB7 All changes are audit-logged",
        breadcrumb: ["Purchase", "Orders", unref(poNo), "Edit"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/purchase/orders/${unref(route).params.id}`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Back to PO`);
                } else {
                  return [
                    createTextVNode("\u2190 Back to PO")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/purchase/orders/${unref(route).params.id}`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back to PO")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-c8c97eeb>Loading\u2026</div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-c8c97eeb>\u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else {
        _push(`<!--[--><div class="rounded-2xl p-4 flex items-start gap-4" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.07)", "border": "1px solid rgba(245,158,11,0.25)" })}" data-v-c8c97eeb><span class="text-xl mt-0.5 shrink-0" data-v-c8c97eeb>\u26A0\uFE0F</span><div data-v-c8c97eeb><p class="text-sm font-bold text-amber-400" data-v-c8c97eeb>Full Edit Mode \u2014 all fields are editable</p><ul class="text-xs text-gray-500 mt-1.5 space-y-0.5 list-disc list-inside" data-v-c8c97eeb><li data-v-c8c97eeb>Every change is recorded in the audit trail for compliance</li><li data-v-c8c97eeb>Editing PO Number or Date may affect related reports and references</li><li data-v-c8c97eeb>Changes will <strong class="text-gray-400" data-v-c8c97eeb>not</strong> automatically update linked GRNs or payments</li><li data-v-c8c97eeb>PO Number must remain unique across all purchase orders</li></ul></div></div><div class="glass-card p-5" data-v-c8c97eeb><h3 class="section-title mb-4" data-v-c8c97eeb>Current Values <span class="text-gray-600 font-normal text-xs" data-v-c8c97eeb>(original \u2014 before editing)</span></h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs" data-v-c8c97eeb><div data-v-c8c97eeb><p class="text-gray-600 mb-0.5" data-v-c8c97eeb>PO Number</p><p class="font-mono font-semibold text-gold-400" data-v-c8c97eeb>${ssrInterpolate(unref(original).poNumber)}</p></div><div data-v-c8c97eeb><p class="text-gray-600 mb-0.5" data-v-c8c97eeb>PO Date</p><p class="text-gray-200" data-v-c8c97eeb>${ssrInterpolate(unref(original).poDate)}</p></div><div data-v-c8c97eeb><p class="text-gray-600 mb-0.5" data-v-c8c97eeb>Supplier</p><p class="text-gray-200" data-v-c8c97eeb>${ssrInterpolate(unref(original).supplier)}</p></div><div data-v-c8c97eeb><p class="text-gray-600 mb-0.5" data-v-c8c97eeb>Origin</p><p class="text-gray-200" data-v-c8c97eeb>${ssrInterpolate(unref(original).origin)}</p></div><div data-v-c8c97eeb><p class="text-gray-600 mb-0.5" data-v-c8c97eeb>Quantity</p><p class="font-mono text-gray-200" data-v-c8c97eeb>${ssrInterpolate(Number(unref(original).qty).toLocaleString())} ${ssrInterpolate(unref(unitLabel))}</p></div><div data-v-c8c97eeb><p class="text-gray-600 mb-0.5" data-v-c8c97eeb>Unit Price</p><p class="font-mono text-gray-200" data-v-c8c97eeb>\u09F3${ssrInterpolate(fmtPrice(unref(original).unitPrice))}/${ssrInterpolate(unref(unitLabel))}</p></div><div data-v-c8c97eeb><p class="text-gray-600 mb-0.5" data-v-c8c97eeb>Total Value</p><p class="font-mono font-bold text-gold-400" data-v-c8c97eeb>\u09F3${ssrInterpolate((unref(original).qty * unref(original).unitPrice).toLocaleString())}</p></div><div data-v-c8c97eeb><p class="text-gray-600 mb-0.5" data-v-c8c97eeb>Expected Delivery</p><p class="text-gray-200" data-v-c8c97eeb>${ssrInterpolate(unref(original).expectedDelivery || "Not set")}</p></div></div></div>`);
        if (unref(changes).length > 0) {
          _push(`<div class="rounded-2xl p-4" style="${ssrRenderStyle({ "background": "rgba(99,102,241,0.07)", "border": "1px solid rgba(99,102,241,0.25)" })}" data-v-c8c97eeb><div class="flex items-center gap-2 mb-3" data-v-c8c97eeb><span class="text-sm font-bold text-indigo-400" data-v-c8c97eeb>\u{1F4DD} Changes detected</span><span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" data-v-c8c97eeb>${ssrInterpolate(unref(changes).length)} change${ssrInterpolate(unref(changes).length > 1 ? "s" : "")}</span></div><ul class="space-y-1.5" data-v-c8c97eeb><!--[-->`);
          ssrRenderList(unref(changes), (c) => {
            _push(`<li class="flex items-start gap-2 text-xs" data-v-c8c97eeb><span class="text-indigo-500 mt-0.5" data-v-c8c97eeb>\u2192</span><span class="text-gray-400" data-v-c8c97eeb><strong class="text-gray-300" data-v-c8c97eeb>${ssrInterpolate(c.label)}:</strong><span class="line-through text-gray-600 ml-1" data-v-c8c97eeb>${ssrInterpolate(c.old)}</span><span class="text-indigo-300 ml-1" data-v-c8c97eeb>${ssrInterpolate(c.new)}</span></span></li>`);
          });
          _push(`<!--]--></ul></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-5" data-v-c8c97eeb><div class="glass-card p-5 space-y-4" style="${ssrRenderStyle({ "border-color": "rgba(245,158,11,0.2)" })}" data-v-c8c97eeb><h3 class="section-title flex items-center gap-2" data-v-c8c97eeb><span class="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] text-amber-400 font-bold" data-v-c8c97eeb>!</span> Critical Fields </h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-c8c97eeb><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-amber-400 uppercase tracking-wider" data-v-c8c97eeb> PO Number * <span class="text-gray-500 font-normal normal-case ml-1" data-v-c8c97eeb>(changing affects all references)</span></label><input${ssrRenderAttr("value", unref(form).poNumber)} type="text" class="input-glass border-amber-500/40" placeholder="e.g. PO-2026-0001" data-v-c8c97eeb>`);
        if (unref(form).poNumber !== unref(original).poNumber) {
          _push(`<p class="text-[11px] text-amber-400" data-v-c8c97eeb>\u26A0 Original: <strong data-v-c8c97eeb>${ssrInterpolate(unref(original).poNumber)}</strong></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-amber-400 uppercase tracking-wider" data-v-c8c97eeb> PO Date * <span class="text-gray-500 font-normal normal-case ml-1" data-v-c8c97eeb>(affects reporting periods)</span></label><input${ssrRenderAttr("value", unref(form).poDate)} type="date" class="input-glass border-amber-500/40" data-v-c8c97eeb>`);
        if (unref(form).poDate !== unref(original).poDate) {
          _push(`<p class="text-[11px] text-amber-400" data-v-c8c97eeb>\u26A0 Original: <strong data-v-c8c97eeb>${ssrInterpolate(unref(original).poDate)}</strong></p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="glass-card p-5 space-y-4" data-v-c8c97eeb><h3 class="section-title" data-v-c8c97eeb>Supplier &amp; Product</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-c8c97eeb><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-c8c97eeb> Commodity <span class="text-gray-600 font-normal normal-case ml-1" data-v-c8c97eeb>(fixed at creation)</span></label><div class="input-glass opacity-70 cursor-not-allowed" data-v-c8c97eeb>${ssrInterpolate(unref(original).commodityName)}</div></div><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-c8c97eeb>Supplier *</label>`);
        _push(ssrRenderComponent(_component_UiSearchSelect, {
          modelValue: unref(form).supplierId,
          "onUpdate:modelValue": ($event) => unref(form).supplierId = $event,
          options: unref(supplierOptions),
          placeholder: "Search supplier\u2026"
        }, null, _parent));
        _push(`</div><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-c8c97eeb>Origin *</label>`);
        if (unref(originOptions).length) {
          _push(`<select class="input-glass" data-v-c8c97eeb><option value="" data-v-c8c97eeb${ssrIncludeBooleanAttr(Array.isArray(unref(form).origin) ? ssrLooseContain(unref(form).origin, "") : ssrLooseEqual(unref(form).origin, "")) ? " selected" : ""}>Select origin</option><!--[-->`);
          ssrRenderList(unref(originOptions), (o) => {
            _push(`<option${ssrRenderAttr("value", o)} data-v-c8c97eeb${ssrIncludeBooleanAttr(Array.isArray(unref(form).origin) ? ssrLooseContain(unref(form).origin, o) : ssrLooseEqual(unref(form).origin, o)) ? " selected" : ""}>${ssrInterpolate(o)}</option>`);
          });
          _push(`<!--]--></select>`);
        } else {
          _push(`<input${ssrRenderAttr("value", unref(form).origin)} class="input-glass" placeholder="Optional" data-v-c8c97eeb>`);
        }
        _push(`</div></div></div><div class="glass-card p-5 space-y-4" data-v-c8c97eeb><h3 class="section-title" data-v-c8c97eeb>Pricing &amp; Quantity</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-c8c97eeb><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-c8c97eeb>Quantity (${ssrInterpolate(unref(unitLabel))}) *</label><input${ssrRenderAttr("value", unref(form).qty)} type="number" step="any" min="0.001" class="input-glass font-mono" placeholder="0.00" data-v-c8c97eeb><p class="text-[11px] text-gray-600" data-v-c8c97eeb>Original: <strong data-v-c8c97eeb>${ssrInterpolate(Number(unref(original).qty).toLocaleString())} ${ssrInterpolate(unref(unitLabel))}</strong></p></div><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-c8c97eeb>Unit Price (\u09F3/${ssrInterpolate(unref(unitLabel))}) *</label><input${ssrRenderAttr("value", unref(form).unitPrice)} type="number" step="any" min="0.0001" class="input-glass font-mono" placeholder="0.00" data-v-c8c97eeb><p class="text-[11px] text-gray-600" data-v-c8c97eeb>Original: <strong data-v-c8c97eeb>\u09F3${ssrInterpolate(fmtPrice(unref(original).unitPrice))}/${ssrInterpolate(unref(unitLabel))}</strong></p></div><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-c8c97eeb>Expected Delivery</label><input${ssrRenderAttr("value", unref(form).expectedDelivery)} type="date" class="input-glass" data-v-c8c97eeb></div><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-c8c97eeb>Total Order Value</label><div class="input-glass flex items-center justify-between cursor-default" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border-color": "rgba(245,158,11,0.2)" })}" data-v-c8c97eeb><span class="text-xs text-gray-500" data-v-c8c97eeb>Qty \xD7 Unit Price</span><span class="font-bold text-gold-400 font-mono text-base" data-v-c8c97eeb>\u09F3${ssrInterpolate(unref(totalValue).toLocaleString())}</span></div>`);
        if (unref(totalChanged)) {
          _push(`<p class="text-[11px] text-indigo-400" data-v-c8c97eeb>Was: \u09F3${ssrInterpolate((unref(original).qty * unref(original).unitPrice).toLocaleString())}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="glass-card p-5 space-y-3" data-v-c8c97eeb><h3 class="section-title" data-v-c8c97eeb>Remarks / Notes</h3><textarea rows="3" class="input-glass resize-none" placeholder="Special instructions, terms, quality requirements\u2026" data-v-c8c97eeb>${ssrInterpolate(unref(form).remarks)}</textarea></div><div class="glass-card p-5 space-y-4" style="${ssrRenderStyle(unref(original).isLocked ? "border-color:rgba(239,68,68,0.25)" : "border-color:rgba(16,185,129,0.15)")}" data-v-c8c97eeb><h3 class="section-title flex items-center gap-2" data-v-c8c97eeb><span data-v-c8c97eeb>${ssrInterpolate(unref(original).isLocked ? "\u{1F512}" : "\u{1F513}")}</span> Delivery Lock Control </h3>`);
        if (unref(original).isLocked) {
          _push(`<div class="rounded-xl p-3 flex items-start gap-3" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.07)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-c8c97eeb><span class="text-red-400 text-lg shrink-0" data-v-c8c97eeb>\u{1F512}</span><div class="text-xs" data-v-c8c97eeb><p class="font-bold text-red-400" data-v-c8c97eeb>Delivery is currently LOCKED \u2014 no further GRNs can be recorded.</p>`);
          if (unref(original).lockReason) {
            _push(`<p class="text-gray-500 mt-0.5" data-v-c8c97eeb>Reason: ${ssrInterpolate(unref(original).lockReason)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<p class="text-gray-600 mt-0.5" data-v-c8c97eeb>Locked by ${ssrInterpolate(unref(original).lockedBy)} on ${ssrInterpolate(unref(original).lockedAt)}</p></div></div>`);
        } else {
          _push(`<div class="rounded-xl p-3 flex items-center gap-3" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.06)", "border": "1px solid rgba(16,185,129,0.15)" })}" data-v-c8c97eeb><span class="text-emerald-400 text-lg" data-v-c8c97eeb>\u{1F513}</span><p class="text-xs text-emerald-400 font-medium" data-v-c8c97eeb>Delivery is currently OPEN \u2014 GRNs can be recorded normally.</p></div>`);
        }
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-c8c97eeb><div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-c8c97eeb>Change Lock Status</label><select class="input-glass" data-v-c8c97eeb><option value="" data-v-c8c97eeb${ssrIncludeBooleanAttr(Array.isArray(unref(lockAction)) ? ssrLooseContain(unref(lockAction), "") : ssrLooseEqual(unref(lockAction), "")) ? " selected" : ""}>\u2014 No change \u2014</option>`);
        if (!unref(original).isLocked) {
          _push(`<option value="lock" data-v-c8c97eeb${ssrIncludeBooleanAttr(Array.isArray(unref(lockAction)) ? ssrLooseContain(unref(lockAction), "lock") : ssrLooseEqual(unref(lockAction), "lock")) ? " selected" : ""}>\u{1F512} Lock delivery (prevent further GRNs)</option>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(original).isLocked) {
          _push(`<option value="unlock" data-v-c8c97eeb${ssrIncludeBooleanAttr(Array.isArray(unref(lockAction)) ? ssrLooseContain(unref(lockAction), "unlock") : ssrLooseEqual(unref(lockAction), "unlock")) ? " selected" : ""}>\u{1F513} Re-open delivery (allow GRNs again)</option>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</select><p class="text-[11px] text-gray-600" data-v-c8c97eeb>Locking stops ALL further GRNs regardless of quantity received.</p></div>`);
        if (unref(lockAction)) {
          _push(`<div class="space-y-1.5" data-v-c8c97eeb><label class="text-xs font-semibold text-red-400 uppercase tracking-wider" data-v-c8c97eeb>Reason * (required)</label><textarea rows="3" class="input-glass resize-none" style="${ssrRenderStyle({ "border-color": "rgba(239,68,68,0.35)" })}" placeholder="Mandatory: explain why you are locking / re-opening this PO\u2026" data-v-c8c97eeb>${ssrInterpolate(unref(lockReason))}</textarea></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="flex items-center justify-between pt-2" data-v-c8c97eeb>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/orders/${unref(route).params.id}`,
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
        _push(`<button${ssrIncludeBooleanAttr(!unref(hasChanges)) ? " disabled" : ""} class="btn-gold disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100" data-v-c8c97eeb><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-c8c97eeb><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-c8c97eeb></path></svg> Update Purchase Order `);
        if (unref(changes).length > 0) {
          _push(`<span class="ml-1.5 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px]" data-v-c8c97eeb>${ssrInterpolate(unref(changes).length)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button></div></div>`);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(confirmModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-c8c97eeb><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-c8c97eeb></div><div class="relative w-full max-w-md glass-card p-6 space-y-4 animate-slide-up" data-v-c8c97eeb><h3 class="section-title" data-v-c8c97eeb>Confirm PO Update</h3><p class="text-sm text-gray-400" data-v-c8c97eeb> The following <strong class="text-gold-400" data-v-c8c97eeb>${ssrInterpolate(unref(changes).length)} change${ssrInterpolate(unref(changes).length > 1 ? "s" : "")}</strong> will be saved and logged in the audit trail: </p><div class="rounded-xl p-3 space-y-1.5 max-h-48 overflow-y-auto" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.07)" })}" data-v-c8c97eeb><!--[-->`);
            ssrRenderList(unref(changes), (c) => {
              _push2(`<div class="text-xs flex gap-2" data-v-c8c97eeb><span class="text-indigo-500 shrink-0" data-v-c8c97eeb>\u2192</span><span class="text-gray-400" data-v-c8c97eeb><strong class="text-gray-300" data-v-c8c97eeb>${ssrInterpolate(c.label)}:</strong><span class="line-through text-gray-600 ml-1" data-v-c8c97eeb>${ssrInterpolate(c.old)}</span><span class="text-indigo-300 ml-1" data-v-c8c97eeb>${ssrInterpolate(c.new)}</span></span></div>`);
            });
            _push2(`<!--]--></div><p class="text-[11px] text-gray-600" data-v-c8c97eeb>All changes are permanent and audited. Please verify before confirming.</p><div class="flex gap-3" data-v-c8c97eeb><button class="btn-ghost flex-1" data-v-c8c97eeb>Go Back</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-gold flex-1 justify-center disabled:opacity-60" data-v-c8c97eeb>`);
            if (unref(saving)) {
              _push2(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-c8c97eeb><circle cx="12" cy="12" r="10" stroke-opacity=".25" data-v-c8c97eeb></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" data-v-c8c97eeb></path></svg>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Confirm Update")}</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/orders/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const edit = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c8c97eeb"]]);

export { edit as default };
//# sourceMappingURL=edit-BYM60tbn.mjs.map
