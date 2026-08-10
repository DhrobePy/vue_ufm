import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, reactive, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const reasonLabels = {
      over_delivery: "Over-Delivery",
      under_delivery_closure: "Under-Delivery Closure",
      quality_deduction: "Quality Deduction",
      price_dispute: "Price Dispute",
      return: "Return",
      other: "Other"
    };
    const filters = reactive({ search: "", note_type: "", status: "" });
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/adjustments",
      {
        query: computed(() => ({
          search: filters.search,
          note_type: filters.note_type,
          status: filters.status
        }))
      },
      "$twbqr4VEB_"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const notes = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.notes) != null ? _b : [];
    });
    const danCount = computed(() => notes.value.filter((n) => n.note_type === "debit").length);
    const canCount = computed(() => notes.value.filter((n) => n.note_type === "credit").length);
    const danAmount = computed(() => notes.value.filter((n) => n.note_type === "debit").reduce((s, n) => s + Number(n.amount), 0));
    const canAmount = computed(() => notes.value.filter((n) => n.note_type === "credit").reduce((s, n) => s + Number(n.amount), 0));
    const pendingCount = computed(() => notes.value.filter((n) => ["draft", "approved"].includes(n.status)).length);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Purchase Adjustment Notes",
        subtitle: "DAN (Debit) and CAN (Credit) adjustment notes",
        breadcrumb: ["Purchase", "Adjustments"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/adjustments/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Adjustment`);
                } else {
                  return [
                    createTextVNode("+ New Adjustment")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/adjustments/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Adjustment")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-5 text-center space-y-1"><p class="text-2xl font-bold text-orange-400">${ssrInterpolate(unref(danCount))}</p><p class="text-xs text-gray-500">Debit Notes (DAN)</p><p class="text-[11px] text-orange-400/70">\u09F3${ssrInterpolate(unref(danAmount).toLocaleString())}</p></div><div class="glass-card p-5 text-center space-y-1"><p class="text-2xl font-bold text-blue-400">${ssrInterpolate(unref(canCount))}</p><p class="text-xs text-gray-500">Credit Notes (CAN)</p><p class="text-[11px] text-blue-400/70">\u09F3${ssrInterpolate(unref(canAmount).toLocaleString())}</p></div><div class="glass-card p-5 text-center space-y-1"><p class="text-2xl font-bold text-yellow-400">${ssrInterpolate(unref(pendingCount))}</p><p class="text-xs text-gray-500">Awaiting Action</p><p class="text-[11px] text-gray-500">Draft / Approved</p></div><div class="glass-card p-5 text-center space-y-1"><p class="text-2xl font-bold text-gray-200">${ssrInterpolate(unref(notes).length)}</p><p class="text-xs text-gray-500">Total (filtered)</p></div></div><div class="glass-card p-4 flex flex-wrap gap-3 items-center"><input${ssrRenderAttr("value", unref(filters).search)} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search note #, PO #, supplier\u2026"><select class="field-input text-xs py-1.5 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).note_type) ? ssrLooseContain(unref(filters).note_type, "") : ssrLooseEqual(unref(filters).note_type, "")) ? " selected" : ""}>All Types</option><option value="debit"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).note_type) ? ssrLooseContain(unref(filters).note_type, "debit") : ssrLooseEqual(unref(filters).note_type, "debit")) ? " selected" : ""}>Debit (DAN)</option><option value="credit"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).note_type) ? ssrLooseContain(unref(filters).note_type, "credit") : ssrLooseEqual(unref(filters).note_type, "credit")) ? " selected" : ""}>Credit (CAN)</option></select><select class="field-input text-xs py-1.5 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "") : ssrLooseEqual(unref(filters).status, "")) ? " selected" : ""}>All Status</option><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "draft") : ssrLooseEqual(unref(filters).status, "draft")) ? " selected" : ""}>Draft</option><option value="approved"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "approved") : ssrLooseEqual(unref(filters).status, "approved")) ? " selected" : ""}>Approved</option><option value="posted"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "posted") : ssrLooseEqual(unref(filters).status, "posted")) ? " selected" : ""}>Posted</option><option value="cancelled"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "cancelled") : ssrLooseEqual(unref(filters).status, "cancelled")) ? " selected" : ""}>Cancelled</option></select><button class="btn-ghost text-xs py-1.5">Reset</button><div class="ml-auto text-xs text-gray-500">${ssrInterpolate(unref(notes).length)} records</div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<div class="glass-card overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full divide-y divide-white/[0.06] text-xs"><thead><tr class="text-gray-500 uppercase text-[10px] tracking-wider"><th class="px-4 py-3 text-left">Note #</th><th class="px-4 py-3 text-center">Type</th><th class="px-4 py-3 text-left">Reason</th><th class="px-4 py-3 text-left">PO #</th><th class="px-4 py-3 text-left">Supplier</th><th class="px-4 py-3 text-right">Amount</th><th class="px-4 py-3 text-center">Status</th><th class="px-4 py-3 text-left">Created</th><th class="px-4 py-3 text-center">Action</th></tr></thead><tbody class="divide-y divide-white/[0.04]">`);
        if (!unref(notes).length) {
          _push(`<tr><td colspan="9" class="px-4 py-8 text-center text-gray-500">No adjustment notes found.</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(notes), (note) => {
          var _a;
          _push(`<tr class="hover:bg-white/[0.02]"><td class="px-4 py-3 font-mono">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/adjustments/${note.id}`,
            class: "text-gold-400/80 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(note.note_number)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(note.note_number), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="px-4 py-3 text-center"><span class="${ssrRenderClass([note.note_type === "debit" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400", "px-2 py-0.5 rounded text-[10px] font-bold"])}">${ssrInterpolate(note.note_type === "debit" ? "\u25B2 DAN" : "\u25BC CAN")}</span></td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(reasonLabels[note.reason_type] || note.reason_type)}</td><td class="px-4 py-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/orders/${note.purchase_order_id}`,
            class: "text-blue-400/80 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`#${ssrInterpolate(note.po_number)}`);
              } else {
                return [
                  createTextVNode("#" + toDisplayString(note.po_number), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="px-4 py-3 text-gray-300">${ssrInterpolate(note.supplier_name || "\u2014")}</td><td class="${ssrRenderClass([note.note_type === "debit" ? "text-orange-400" : "text-blue-400", "px-4 py-3 text-right font-mono font-bold"])}"> \u09F3${ssrInterpolate(Number(note.amount).toLocaleString())}</td><td class="px-4 py-3 text-center">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: note.status
          }, null, _parent));
          _push(`</td><td class="px-4 py-3 text-gray-500">${ssrInterpolate((_a = note.created_at) == null ? void 0 : _a.slice(0, 10))}</td><td class="px-4 py-3 text-center">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/adjustments/${note.id}`,
            class: "text-indigo-400 hover:text-indigo-300 text-[11px]"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`View \u2192`);
              } else {
                return [
                  createTextVNode("View \u2192")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      }
      _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"><div class="glass-card p-4 border border-orange-500/20"><p class="font-semibold text-orange-400 mb-1">\u25B2 DAN \u2014 Debit Adjustment Note</p><p class="text-gray-500">We owe the supplier <strong class="text-gray-400">more</strong> than the original PO amount. Used for over-delivery, price disputes (upward).</p></div><div class="glass-card p-4 border border-blue-500/20"><p class="font-semibold text-blue-400 mb-1">\u25BC CAN \u2014 Credit Adjustment Note</p><p class="text-gray-500">The supplier owes us a <strong class="text-gray-400">reduction</strong>. Used for under-delivery closure, quality deductions, returns.</p></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/adjustments/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Jkj0ZJ1D.mjs.map
