import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const acting = ref(false);
    const showCancelForm = ref(false);
    const cancelReason = ref("");
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/purchase/adjustments/${route.params.id}`,
      "$D0rY6Bfs9I"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const note = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.note) != null ? _b : {};
    });
    const reasonLabels = {
      over_delivery: "Over-Delivery",
      under_delivery_closure: "Under-Delivery Closure",
      quality_deduction: "Quality / Weight Deduction",
      price_dispute: "Price Dispute",
      return: "Goods Return",
      other: "Other"
    };
    const workflowSteps = [
      { label: "Draft", statusGe: "draft", icon: "\u270E" },
      { label: "Approved", statusGe: "approved", icon: "\u2713" },
      { label: "Posted", statusGe: "posted", icon: "\u2B06" }
    ];
    const statusOrder = { draft: 1, approved: 2, posted: 3, cancelled: 0 };
    function stepActive(step) {
      return statusOrder[note.value.status] >= statusOrder[step.statusGe];
    }
    function stepClass(step) {
      if (note.value.status === "cancelled") return "bg-red-500/10 text-red-500";
      return stepActive(step) ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/[0.05] text-gray-600";
    }
    const afterPostBalance = computed(() => {
      const bal = Number(note.value.balance_payable || 0);
      const amt = Number(note.value.amount || 0);
      return note.value.note_type === "debit" ? Math.max(0, bal + amt) : Math.max(0, bal - amt);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(note).note_number,
          subtitle: `${unref(note).supplier_name || "\u2014"} \xB7 ${unref(note).note_type === "debit" ? "Debit Note (DAN)" : "Credit Note (CAN)"}`,
          breadcrumb: ["Purchase", "Adjustments", unref(note).note_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/purchase/adjustments",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u2190 All Notes`);
                  } else {
                    return [
                      createTextVNode("\u2190 All Notes")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(note).purchase_order_id) {
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/purchase/orders/${unref(note).purchase_order_id}`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`View PO`);
                    } else {
                      return [
                        createTextVNode("View PO")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: "/purchase/adjustments",
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u2190 All Notes")
                  ]),
                  _: 1
                }),
                unref(note).purchase_order_id ? (openBlock(), createBlock(_component_NuxtLink, {
                  key: 0,
                  to: `/purchase/orders/${unref(note).purchase_order_id}`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("View PO")
                  ]),
                  _: 1
                }, 8, ["to"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="${ssrRenderClass([unref(note).note_type === "debit" ? "border-orange-500/40 bg-orange-500/5" : "border-blue-500/40 bg-blue-500/5", "rounded-xl border-2 p-4 flex flex-wrap items-center gap-4"])}"><div class="flex-1"><p class="${ssrRenderClass([unref(note).note_type === "debit" ? "text-orange-400" : "text-blue-400", "text-lg font-bold"])}">${ssrInterpolate(unref(note).note_type === "debit" ? "\u25B2 Debit Adjustment Note (DAN)" : "\u25BC Credit Adjustment Note (CAN)")}</p><p class="text-xs text-gray-500 mt-1">${ssrInterpolate(unref(note).note_type === "debit" ? "We owe the supplier more \u2014 increases payable amount when posted." : "Supplier owes us a reduction \u2014 decreases payable and creates credit when posted.")}</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(note).status
        }, null, _parent));
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Note Details</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"><div class="space-y-2"><div class="flex justify-between"><span class="text-gray-500">Note Number</span><span class="font-mono text-gold-400/80 font-bold">${ssrInterpolate(unref(note).note_number)}</span></div><div class="flex justify-between"><span class="text-gray-500">Reason</span><span class="text-gray-300">${ssrInterpolate(reasonLabels[unref(note).reason_type] || unref(note).reason_type)}</span></div><div class="flex justify-between"><span class="text-gray-500">Purchase Order</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/orders/${unref(note).purchase_order_id}`,
          class: "font-mono text-gold-400/80 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`#${ssrInterpolate(unref(note).po_number)}`);
            } else {
              return [
                createTextVNode("#" + toDisplayString(unref(note).po_number), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="flex justify-between"><span class="text-gray-500">Supplier</span><span class="text-gray-300">${ssrInterpolate(unref(note).supplier_name || "\u2014")}</span></div></div><div class="space-y-2"><div class="flex justify-between"><span class="text-gray-500">Quantity</span><span class="text-gray-300">${ssrInterpolate(unref(note).quantity_kg ? Number(unref(note).quantity_kg).toLocaleString() + " kg" : "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-500">Unit Price</span><span class="text-gray-300">${ssrInterpolate(unref(note).unit_price_per_kg ? "\u09F3" + Number(unref(note).unit_price_per_kg).toLocaleString() : "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-500">Amount</span><span class="${ssrRenderClass([unref(note).note_type === "debit" ? "text-orange-400" : "text-blue-400", "text-xl font-bold"])}"> \u09F3${ssrInterpolate(Number(unref(note).amount).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-500">Created</span><span class="text-gray-400">${ssrInterpolate((_a = unref(note).created_at) == null ? void 0 : _a.slice(0, 10))}</span></div></div></div>`);
        if (unref(note).description) {
          _push(`<div class="border-t border-white/[0.06] pt-4"><p class="text-xs font-semibold text-gray-600 mb-1">Description:</p><p class="text-xs text-gray-400 whitespace-pre-wrap">${ssrInterpolate(unref(note).description)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5 space-y-3"><h3 class="section-title">PO Financial Context</h3><div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center"><div class="bg-white/[0.03] rounded-lg p-3"><p class="text-gray-500 mb-1">Order Value</p><p class="font-bold text-gray-200">\u09F3${ssrInterpolate(Number(unref(note).total_order_value || 0).toLocaleString())}</p></div><div class="bg-white/[0.03] rounded-lg p-3"><p class="text-gray-500 mb-1">Received</p><p class="font-bold text-emerald-400">\u09F3${ssrInterpolate(Number(unref(note).total_received_value || 0).toLocaleString())}</p></div><div class="bg-white/[0.03] rounded-lg p-3"><p class="text-gray-500 mb-1">Total Paid</p><p class="font-bold text-blue-400">\u09F3${ssrInterpolate(Number(unref(note).total_paid || 0).toLocaleString())}</p></div><div class="bg-white/[0.03] rounded-lg p-3"><p class="text-gray-500 mb-1">Balance</p><p class="font-bold text-red-400">\u09F3${ssrInterpolate(Number(unref(note).balance_payable || 0).toLocaleString())}</p></div></div>`);
        if (unref(note).status === "approved") {
          _push(`<div class="rounded-lg bg-white/[0.03] border border-white/[0.08] p-3 text-xs text-gray-400"><strong class="text-gray-300">After posting this ${ssrInterpolate(unref(note).note_type === "debit" ? "DAN" : "CAN")}:</strong> Balance Payable will become <strong class="${ssrRenderClass(unref(note).note_type === "debit" ? "text-orange-400" : "text-emerald-400")}"> \u09F3${ssrInterpolate(unref(afterPostBalance).toLocaleString())}</strong> (${ssrInterpolate(unref(note).note_type === "debit" ? "+" : "\u2212")}\u09F3${ssrInterpolate(Number(unref(note).amount).toLocaleString())}) </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="space-y-4"><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Workflow</h3><!--[-->`);
        ssrRenderList(workflowSteps, (step) => {
          _push(`<div class="flex items-center gap-3"><div class="${ssrRenderClass([stepClass(step), "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"])}">${ssrInterpolate(step.icon)}</div><span class="${ssrRenderClass([stepActive(step) ? "text-gray-200 font-medium" : "text-gray-600", "text-sm"])}">${ssrInterpolate(step.label)}</span></div>`);
        });
        _push(`<!--]-->`);
        if (unref(note).status === "cancelled") {
          _push(`<div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 text-xs font-bold">\u2715</div><span class="text-sm text-red-400 font-medium">Cancelled</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (!["posted", "cancelled"].includes(unref(note).status)) {
          _push(`<div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Actions</h3>`);
          if (unref(note).status === "draft") {
            _push(`<button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-ghost text-xs w-full justify-center text-blue-400 border-blue-500/30 hover:border-blue-400/60">${ssrInterpolate(unref(acting) === "approve" ? "Approving\u2026" : "\u2713 Approve Note")}</button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(note).status === "approved") {
            _push(`<button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold text-xs w-full justify-center">${ssrInterpolate(unref(acting) === "post" ? "Posting\u2026" : "\u2B06 Post Note (Apply Financial Effect)")}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div><button class="btn-ghost text-xs w-full justify-center text-red-400 border-red-500/30 hover:border-red-400/60"> \u2715 Cancel Note </button>`);
          if (unref(showCancelForm)) {
            _push(`<div class="mt-3 space-y-2"><textarea rows="3" class="input-glass text-xs resize-none" placeholder="Reason for cancellation (required)\u2026">${ssrInterpolate(unref(cancelReason))}</textarea><button${ssrIncludeBooleanAttr(unref(acting) || !unref(cancelReason).trim()) ? " disabled" : ""} class="w-full py-2 px-4 rounded-xl bg-red-600 text-white text-xs hover:bg-red-700 disabled:opacity-50">${ssrInterpolate(unref(acting) === "cancel" ? "Cancelling\u2026" : "Confirm Cancellation")}</button></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<div class="glass-card p-4 text-center text-xs text-gray-500"><p class="text-lg mb-1">\u{1F512}</p><p class="font-medium text-gray-400">${ssrInterpolate(unref(note).status === "posted" ? "This note is posted and locked." : "This note has been cancelled.")}</p><p class="mt-1">No further actions available.</p></div>`);
        }
        _push(`</div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/adjustments/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Dro8hkJP.mjs.map
