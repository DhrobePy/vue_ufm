import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrRenderTeleport } from 'vue/server-renderer';
import { c as _export_sfc, j as useRoute, n as navigateTo } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { success, error: toastError } = useToast();
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/expenses/${route.params.id}`,
      "$HOcoS2oduw"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const exp = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.expense) != null ? _b : {};
    });
    const timeline = computed(() => {
      var _a, _b, _c, _d, _e;
      const e = exp.value;
      const items = [];
      items.push({
        id: 1,
        event: "Voucher Submitted",
        by: (_a = e.created_by_name) != null ? _a : "\u2014",
        time: (_b = e.expense_date) != null ? _b : "\u2014",
        color: "#6366f1",
        comment: ""
      });
      if (e.status === "approved") {
        items.push({
          id: 2,
          event: "Approved",
          by: (_c = e.approved_by_name) != null ? _c : "Finance",
          time: e.approved_at ? String(e.approved_at).slice(0, 16).replace("T", " ") : "\u2014",
          color: "#10b981",
          comment: ""
        });
      } else if (e.status === "rejected") {
        items.push({
          id: 2,
          event: "Rejected",
          by: (_d = e.approved_by_name) != null ? _d : "Finance",
          time: e.approved_at ? String(e.approved_at).slice(0, 16).replace("T", " ") : "\u2014",
          color: "#ef4444",
          comment: (_e = e.rejection_reason) != null ? _e : ""
        });
      } else {
        items.push({
          id: 2,
          event: "Awaiting Approval",
          by: "System",
          time: "Now",
          color: "#eab308",
          comment: "Pending finance review"
        });
      }
      return items;
    });
    const acting = ref(false);
    const reviewComment = ref("");
    const rejectModal = ref(false);
    const rejectReason = ref("");
    function openReject() {
      rejectReason.value = "";
      rejectModal.value = true;
    }
    async function doApprove() {
      var _a, _b;
      acting.value = true;
      try {
        await $fetch(`/api/expenses/${route.params.id}/approve`, {
          method: "POST",
          body: { action: "approve", reason: reviewComment.value || void 0 }
        });
        success(`${exp.value.voucher_number} approved \u2713`);
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to approve");
      } finally {
        acting.value = false;
      }
    }
    function printVoucher() {
      navigateTo(`/expenses/${route.params.id}/voucher`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-4xl" }, _attrs))} data-v-e75443b3>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-e75443b3>Loading expense\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-e75443b3>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(exp).voucher_number,
          subtitle: unref(exp).category_name || "Expense",
          breadcrumb: ["Expenses", "History", unref(exp).voucher_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<button class="btn-ghost text-xs" data-v-e75443b3${_scopeId}>\u{1F5A8}\uFE0F Print Voucher</button>`);
              if (unref(exp).status === "pending") {
                _push2(`<button class="btn-ghost text-xs border-red-500/20 text-red-400 hover:bg-red-500/10" data-v-e75443b3${_scopeId}>Reject</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(exp).status === "pending") {
                _push2(`<button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold text-xs" data-v-e75443b3${_scopeId}>${ssrInterpolate(unref(acting) ? "\u2026" : "\u2713 Approve")}</button>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("button", {
                  onClick: printVoucher,
                  class: "btn-ghost text-xs"
                }, "\u{1F5A8}\uFE0F Print Voucher"),
                unref(exp).status === "pending" ? (openBlock(), createBlock("button", {
                  key: 0,
                  onClick: openReject,
                  class: "btn-ghost text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                }, "Reject")) : createCommentVNode("", true),
                unref(exp).status === "pending" ? (openBlock(), createBlock("button", {
                  key: 1,
                  onClick: doApprove,
                  disabled: unref(acting),
                  class: "btn-gold text-xs"
                }, toDisplayString(unref(acting) ? "\u2026" : "\u2713 Approve"), 9, ["disabled"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-e75443b3><div class="lg:col-span-2 space-y-5" data-v-e75443b3><div class="glass-card p-5 space-y-4" data-v-e75443b3><div class="flex items-center justify-between" data-v-e75443b3><h3 class="section-title" data-v-e75443b3>Expense Details</h3><div class="flex items-center gap-2" data-v-e75443b3>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(exp).status
        }, null, _parent));
        if (unref(exp).priority) {
          _push(`<span class="${ssrRenderClass([
            "text-xs font-bold px-2 py-1 rounded-lg",
            unref(exp).priority === "urgent" ? "text-red-400 bg-red-500/10" : unref(exp).priority === "high" ? "text-orange-400 bg-orange-500/10" : "text-gray-500 bg-white/[0.04]"
          ])}" data-v-e75443b3>${ssrInterpolate(unref(exp).priority)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="rounded-2xl p-6 text-center" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.04))", "border": "1px solid rgba(245,158,11,0.15)" })}" data-v-e75443b3><p class="text-xs text-gray-500 uppercase tracking-widest mb-2" data-v-e75443b3>Total Amount</p><p class="text-5xl font-bold text-gold-400 font-mono" data-v-e75443b3>\u09F3${ssrInterpolate(Number(unref(exp).total_amount).toLocaleString())}</p><p class="text-xs text-gray-600 mt-2" data-v-e75443b3>${ssrInterpolate(unref(exp).category_name)}`);
        if (unref(exp).subcategory_name) {
          _push(`<span data-v-e75443b3> \u2014 ${ssrInterpolate(unref(exp).subcategory_name)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p></div><div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm" data-v-e75443b3><div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Voucher No.</p><p class="text-gray-200 font-mono font-medium" data-v-e75443b3>${ssrInterpolate(unref(exp).voucher_number)}</p></div><div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Date</p><p class="text-gray-200" data-v-e75443b3>${ssrInterpolate(unref(exp).expense_date)}</p></div><div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Category</p><p class="text-gray-200" data-v-e75443b3>${ssrInterpolate(unref(exp).category_name || "\u2014")}</p></div><div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Branch</p><p class="text-gray-200" data-v-e75443b3>${ssrInterpolate(unref(exp).branch_name || "\u2014")}</p></div><div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Payment Method</p><p class="text-gray-200" data-v-e75443b3>${ssrInterpolate(unref(exp).payment_method || "\u2014")}</p></div><div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Submitted By</p><p class="text-gray-200" data-v-e75443b3>${ssrInterpolate(unref(exp).created_by_name || "\u2014")}</p></div>`);
        if (Number(unref(exp).quantity) > 0) {
          _push(`<div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Quantity</p><p class="text-gray-200" data-v-e75443b3>${ssrInterpolate(unref(exp).quantity)} ${ssrInterpolate(unref(exp).unit_of_measurement)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(exp).unit_cost) > 0) {
          _push(`<div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Unit Cost</p><p class="text-gray-200 font-mono" data-v-e75443b3>\u09F3${ssrInterpolate(Number(unref(exp).unit_cost).toLocaleString())}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exp).handled_by_person) {
          _push(`<div data-v-e75443b3><p class="text-xs text-gray-600 mb-1" data-v-e75443b3>Handled By</p><p class="text-gray-200" data-v-e75443b3>${ssrInterpolate(unref(exp).handled_by_person)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(exp).bank_name) {
          _push(`<div class="text-xs text-gray-500 pt-3 border-t border-white/[0.06]" data-v-e75443b3> Bank: <span class="text-gray-300" data-v-e75443b3>${ssrInterpolate(unref(exp).bank_name)}</span>`);
          if (unref(exp).account_number) {
            _push(`<span data-v-e75443b3> \xB7 A/C: <span class="text-gray-300 font-mono" data-v-e75443b3>${ssrInterpolate(unref(exp).account_number)}</span></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="pt-3 border-t border-white/[0.06]" data-v-e75443b3><p class="text-xs text-gray-600 mb-2" data-v-e75443b3>Remarks / Description</p><p class="text-sm text-gray-300 leading-relaxed" data-v-e75443b3>${ssrInterpolate(unref(exp).remarks || "\u2014")}</p></div>`);
        if (unref(exp).rejection_reason) {
          _push(`<div class="rounded-xl p-3 text-xs" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.08)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-e75443b3><p class="text-red-400 font-semibold" data-v-e75443b3>Rejection Reason</p><p class="text-gray-400 mt-1" data-v-e75443b3>${ssrInterpolate(unref(exp).rejection_reason)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(exp).status === "pending") {
          _push(`<div class="glass-card p-5 space-y-3" style="${ssrRenderStyle({ "border": "1px solid rgba(245,158,11,0.15)" })}" data-v-e75443b3><h3 class="section-title" data-v-e75443b3>Review this Expense</h3><div class="space-y-1.5" data-v-e75443b3><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-e75443b3>Review Comment</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="Optional: add a comment for the submitter\u2026" data-v-e75443b3>${ssrInterpolate(unref(reviewComment))}</textarea></div><div class="flex gap-3" data-v-e75443b3><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold flex-1 justify-center" data-v-e75443b3>${ssrInterpolate(unref(acting) ? "\u2026" : "\u2713 Approve Expense")}</button><button class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all" data-v-e75443b3> \u2717 Reject </button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-5" data-v-e75443b3><div class="glass-card p-5" data-v-e75443b3><h3 class="section-title mb-4" data-v-e75443b3>Approval Timeline</h3><div class="space-y-0" data-v-e75443b3><!--[-->`);
        ssrRenderList(unref(timeline), (ev, idx) => {
          _push(`<div class="flex gap-3" data-v-e75443b3><div class="flex flex-col items-center" data-v-e75443b3><div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="${ssrRenderStyle(`background:${ev.color}18;border:1px solid ${ev.color}30`)}" data-v-e75443b3><div class="w-2 h-2 rounded-full" style="${ssrRenderStyle(`background:${ev.color}`)}" data-v-e75443b3></div></div>`);
          if (idx < unref(timeline).length - 1) {
            _push(`<div class="w-px flex-1 bg-white/[0.06] my-1 min-h-[16px]" data-v-e75443b3></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="pb-4" data-v-e75443b3><p class="text-xs font-semibold text-gray-200" data-v-e75443b3>${ssrInterpolate(ev.event)}</p><p class="text-[11px] text-gray-600 mt-0.5" data-v-e75443b3>${ssrInterpolate(ev.by)} \xB7 ${ssrInterpolate(ev.time)}</p>`);
          if (ev.comment) {
            _push(`<p class="text-[11px] text-gray-500 mt-1 italic" data-v-e75443b3>${ssrInterpolate(ev.comment)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div><div class="glass-card p-4 space-y-2" data-v-e75443b3><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" data-v-e75443b3>Related</h3><div class="flex justify-between text-xs text-gray-500" data-v-e75443b3><span data-v-e75443b3>Category Code</span><span class="text-gray-300 font-mono" data-v-e75443b3>${ssrInterpolate(unref(exp).category_code || "\u2014")}</span></div><div class="flex justify-between text-xs text-gray-500" data-v-e75443b3><span data-v-e75443b3>Cost Centre</span><span class="text-gray-300" data-v-e75443b3>${ssrInterpolate(unref(exp).branch_name || "\u2014")}</span></div>`);
        if (unref(exp).approved_at) {
          _push(`<div class="flex justify-between text-xs text-gray-500" data-v-e75443b3><span data-v-e75443b3>Approved At</span><span class="text-gray-300" data-v-e75443b3>${ssrInterpolate(unref(exp).approved_at)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exp).approved_by_name) {
          _push(`<div class="flex justify-between text-xs text-gray-500" data-v-e75443b3><span data-v-e75443b3>Approved By</span><span class="text-gray-300" data-v-e75443b3>${ssrInterpolate(unref(exp).approved_by_name)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-4 space-y-2" data-v-e75443b3><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" data-v-e75443b3>Quick Actions</h3><button class="btn-ghost w-full justify-start text-xs py-2" data-v-e75443b3>\u{1F5A8}\uFE0F Print Voucher</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/expenses/history",
          class: "btn-ghost w-full justify-start text-xs py-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u2190 Back to History`);
            } else {
              return [
                createTextVNode("\u2190 Back to History")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(rejectModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.6)", "backdrop-filter": "blur(4px)" })}" data-v-e75443b3><div class="w-full max-w-md glass-card p-6 space-y-4" data-v-e75443b3><h3 class="section-title text-red-400" data-v-e75443b3>Reject Expense</h3><p class="text-sm text-gray-400" data-v-e75443b3>Please provide a reason for rejecting <strong class="text-gold-400" data-v-e75443b3>${ssrInterpolate(unref(exp).voucher_number)}</strong>.</p><textarea rows="3" class="field-input w-full resize-none" placeholder="Rejection reason\u2026" data-v-e75443b3>${ssrInterpolate(unref(rejectReason))}</textarea><div class="flex gap-3 justify-end" data-v-e75443b3><button class="btn-ghost text-xs" data-v-e75443b3>Cancel</button><button${ssrIncludeBooleanAttr(!unref(rejectReason).trim() || unref(acting)) ? " disabled" : ""} class="btn-ghost text-xs border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-40" data-v-e75443b3>${ssrInterpolate(unref(acting) ? "\u2026" : "Confirm Reject")}</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e75443b3"]]);

export { index as default };
//# sourceMappingURL=index-Cnb0dvv7.mjs.map
