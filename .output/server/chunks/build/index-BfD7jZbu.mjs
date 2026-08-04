import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, createCommentVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderClass, ssrRenderList, ssrRenderTeleport } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, n as navigateTo } from './server.mjs';
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
    function fmtDate(d) {
      if (!d) return "\u2014";
      try {
        return new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      } catch {
        return String(d).slice(0, 10);
      }
    }
    function fmtDateTime(d) {
      if (!d) return "\u2014";
      try {
        return new Date(d).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch {
        return String(d).slice(0, 16);
      }
    }
    const canCancel = computed(
      () => {
        var _a, _b;
        return ["approved", "pending"].includes((_a = exp.value) == null ? void 0 : _a.status) && ((_b = exp.value) == null ? void 0 : _b.status) !== "pending";
      }
      // pending uses Reject instead
    );
    const timeline = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      const e = exp.value;
      const items = [];
      items.push({
        id: 1,
        event: "Voucher Submitted",
        by: (_a = e.created_by_name) != null ? _a : "\u2014",
        time: fmtDate((_b = e.created_at) != null ? _b : e.expense_date),
        color: "#6366f1",
        comment: ""
      });
      if (e.status === "approved") {
        items.push({
          id: 2,
          event: "Approved",
          by: (_c = e.approved_by_name) != null ? _c : "Finance",
          time: fmtDateTime(e.approved_at),
          color: "#10b981",
          comment: ""
        });
      } else if (e.status === "rejected") {
        items.push({
          id: 2,
          event: "Rejected",
          by: (_d = e.approved_by_name) != null ? _d : "Finance",
          time: fmtDateTime(e.approved_at),
          color: "#ef4444",
          comment: (_e = e.rejection_reason) != null ? _e : ""
        });
      } else if (e.status === "cancelled") {
        items.push({
          id: 2,
          event: "Cancelled / Reversed",
          by: "\u2014",
          time: fmtDateTime(e.updated_at),
          color: "#f97316",
          comment: (_f = e.rejection_reason) != null ? _f : ""
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
    const cancelModal = ref(false);
    const cancelReason = ref("");
    function openReject() {
      rejectReason.value = "";
      rejectModal.value = true;
    }
    function openCancel() {
      cancelReason.value = "";
      cancelModal.value = true;
    }
    async function post(action, reason) {
      var _a, _b;
      acting.value = true;
      try {
        await $fetch(`/api/expenses/${route.params.id}/approve`, {
          method: "POST",
          body: { action, reason: reason || void 0 }
        });
        await refresh();
        return true;
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : `Failed to ${action}`);
        return false;
      } finally {
        acting.value = false;
      }
    }
    async function doApprove() {
      if (await post("approve", reviewComment.value || void 0))
        success(`${exp.value.voucher_number} approved \u2713`);
    }
    function printVoucher() {
      navigateTo(`/expenses/${route.params.id}/voucher`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-4xl" }, _attrs))} data-v-ce2d5fbc>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-ce2d5fbc>Loading expense\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-ce2d5fbc>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(exp).voucher_number,
          subtitle: unref(exp).category_name || "Expense",
          breadcrumb: ["Expenses", "History", unref(exp).voucher_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<button class="btn-ghost text-xs" data-v-ce2d5fbc${_scopeId}>\u{1F5A8}\uFE0F Print Voucher</button>`);
              if (unref(exp).status === "pending") {
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/expenses/${unref(exp).id}/edit`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`\u270F\uFE0F Edit`);
                    } else {
                      return [
                        createTextVNode("\u270F\uFE0F Edit")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(exp).status === "pending") {
                _push2(`<button class="btn-ghost text-xs border-red-500/20 text-red-400 hover:bg-red-500/10" data-v-ce2d5fbc${_scopeId}>Reject</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(exp).status === "pending") {
                _push2(`<button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold text-xs" data-v-ce2d5fbc${_scopeId}>${ssrInterpolate(unref(acting) ? "\u2026" : "\u2713 Approve")}</button>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(canCancel)) {
                _push2(`<button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-ghost text-xs border-orange-500/20 text-orange-400 hover:bg-orange-500/10" data-v-ce2d5fbc${_scopeId}> \u21A9 Cancel / Reverse </button>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("button", {
                  onClick: printVoucher,
                  class: "btn-ghost text-xs"
                }, "\u{1F5A8}\uFE0F Print Voucher"),
                unref(exp).status === "pending" ? (openBlock(), createBlock(_component_NuxtLink, {
                  key: 0,
                  to: `/expenses/${unref(exp).id}/edit`,
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u270F\uFE0F Edit")
                  ]),
                  _: 1
                }, 8, ["to"])) : createCommentVNode("", true),
                unref(exp).status === "pending" ? (openBlock(), createBlock("button", {
                  key: 1,
                  onClick: openReject,
                  class: "btn-ghost text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                }, "Reject")) : createCommentVNode("", true),
                unref(exp).status === "pending" ? (openBlock(), createBlock("button", {
                  key: 2,
                  onClick: doApprove,
                  disabled: unref(acting),
                  class: "btn-gold text-xs"
                }, toDisplayString(unref(acting) ? "\u2026" : "\u2713 Approve"), 9, ["disabled"])) : createCommentVNode("", true),
                unref(canCancel) ? (openBlock(), createBlock("button", {
                  key: 3,
                  onClick: openCancel,
                  disabled: unref(acting),
                  class: "btn-ghost text-xs border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
                }, " \u21A9 Cancel / Reverse ", 8, ["disabled"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-ce2d5fbc><div class="lg:col-span-2 space-y-5" data-v-ce2d5fbc><div class="glass-card p-5 space-y-4" data-v-ce2d5fbc><div class="flex items-center justify-between" data-v-ce2d5fbc><h3 class="section-title" data-v-ce2d5fbc>Expense Details</h3>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(exp).status
        }, null, _parent));
        _push(`</div><div class="rounded-2xl p-6 text-center" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,rgba(245,158,11,0.08),rgba(245,158,11,0.04))", "border": "1px solid rgba(245,158,11,0.15)" })}" data-v-ce2d5fbc><p class="text-xs text-gray-500 uppercase tracking-widest mb-2" data-v-ce2d5fbc>Total Amount</p><p class="text-5xl font-bold text-gold-400 font-mono" data-v-ce2d5fbc>\u09F3${ssrInterpolate(Number(unref(exp).total_amount).toLocaleString())}</p><p class="text-xs text-gray-600 mt-2" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).category_name)}`);
        if (unref(exp).subcategory_name) {
          _push(`<span data-v-ce2d5fbc> \u2014 ${ssrInterpolate(unref(exp).subcategory_name)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p></div><div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm" data-v-ce2d5fbc><div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Voucher No.</p><p class="text-gray-200 font-mono font-medium" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).voucher_number)}</p></div><div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Date</p><p class="text-gray-200" data-v-ce2d5fbc>${ssrInterpolate(fmtDate(unref(exp).expense_date))}</p></div><div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Category</p><p class="text-gray-200" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).category_name || "\u2014")}</p></div><div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Branch</p><p class="text-gray-200" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).branch_name || "\u2014")}</p></div><div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Payment Method</p><p class="text-gray-200 capitalize" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).payment_method || "\u2014")}</p></div><div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Submitted By</p><p class="text-gray-200" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).created_by_name || "\u2014")}</p></div>`);
        if (Number(unref(exp).unit_quantity) > 0) {
          _push(`<div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Quantity</p><p class="text-gray-200" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).unit_quantity)} ${ssrInterpolate(unref(exp).unit_type || "")}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (Number(unref(exp).per_unit_cost) > 0) {
          _push(`<div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Unit Cost</p><p class="text-gray-200 font-mono" data-v-ce2d5fbc>\u09F3${ssrInterpolate(Number(unref(exp).per_unit_cost).toLocaleString())}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exp).handled_by_person) {
          _push(`<div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Handled By</p><p class="text-gray-200" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).handled_by_person)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exp).payment_reference) {
          _push(`<div data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-1" data-v-ce2d5fbc>Reference / Cheque No.</p><p class="text-gray-200 font-mono" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).payment_reference)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(exp).bank_name || unref(exp).payment_account_name) {
          _push(`<div class="text-xs text-gray-500 pt-3 border-t border-white/[0.06]" data-v-ce2d5fbc>`);
          if (unref(exp).bank_name) {
            _push(`<span data-v-ce2d5fbc> Bank: <span class="text-gray-300" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).bank_name)}</span>`);
            if (unref(exp).account_number) {
              _push(`<span data-v-ce2d5fbc> \xB7 A/C: <span class="text-gray-300 font-mono" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).account_number)}</span></span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</span>`);
          } else {
            _push(`<span data-v-ce2d5fbc> Payment Account: <span class="text-gray-300" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).payment_account_name)}</span></span>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="pt-3 border-t border-white/[0.06]" data-v-ce2d5fbc><p class="text-xs text-gray-600 mb-2" data-v-ce2d5fbc>Remarks / Description</p><p class="text-sm text-gray-300 leading-relaxed" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).remarks || "\u2014")}</p></div>`);
        if (unref(exp).rejection_reason) {
          _push(`<div class="rounded-xl p-3 text-xs" style="${ssrRenderStyle(unref(exp).status === "cancelled" ? "background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2)" : "background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2)")}" data-v-ce2d5fbc><p class="${ssrRenderClass(unref(exp).status === "cancelled" ? "text-orange-400 font-semibold" : "text-red-400 font-semibold")}" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).status === "cancelled" ? "Cancellation Reason" : "Rejection Reason")}</p><p class="text-gray-400 mt-1" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).rejection_reason)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(exp).status === "pending") {
          _push(`<div class="glass-card p-5 space-y-3" style="${ssrRenderStyle({ "border": "1px solid rgba(245,158,11,0.15)" })}" data-v-ce2d5fbc><h3 class="section-title" data-v-ce2d5fbc>Review this Expense</h3><div class="space-y-1.5" data-v-ce2d5fbc><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-ce2d5fbc>Review Comment</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="Optional: add a comment for the submitter\u2026" data-v-ce2d5fbc>${ssrInterpolate(unref(reviewComment))}</textarea></div><div class="flex gap-3" data-v-ce2d5fbc><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="btn-gold flex-1 justify-center" data-v-ce2d5fbc>${ssrInterpolate(unref(acting) ? "\u2026" : "\u2713 Approve Expense")}</button><button class="flex-1 py-2 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all" data-v-ce2d5fbc> \u2717 Reject </button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(canCancel)) {
          _push(`<div class="glass-card p-5 space-y-3" style="${ssrRenderStyle({ "border": "1px solid rgba(249,115,22,0.15)" })}" data-v-ce2d5fbc><h3 class="section-title text-orange-400" data-v-ce2d5fbc>Reverse / Cancel</h3><p class="text-xs text-gray-500" data-v-ce2d5fbc> This will mark the voucher as <strong class="text-orange-300" data-v-ce2d5fbc>Cancelled</strong> and create a reversal journal entry to undo the accounting entries. Use this if the payment was made in error or needs to be undone. </p><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="py-2 px-5 rounded-xl text-sm font-semibold text-orange-400 border border-orange-500/20 hover:bg-orange-500/10 transition-all disabled:opacity-40" data-v-ce2d5fbc> \u21A9 Cancel / Reverse this Expense </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-5" data-v-ce2d5fbc><div class="glass-card p-5" data-v-ce2d5fbc><h3 class="section-title mb-4" data-v-ce2d5fbc>Timeline</h3><div class="space-y-0" data-v-ce2d5fbc><!--[-->`);
        ssrRenderList(unref(timeline), (ev, idx) => {
          _push(`<div class="flex gap-3" data-v-ce2d5fbc><div class="flex flex-col items-center" data-v-ce2d5fbc><div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style="${ssrRenderStyle(`background:${ev.color}18;border:1px solid ${ev.color}30`)}" data-v-ce2d5fbc><div class="w-2 h-2 rounded-full" style="${ssrRenderStyle(`background:${ev.color}`)}" data-v-ce2d5fbc></div></div>`);
          if (idx < unref(timeline).length - 1) {
            _push(`<div class="w-px flex-1 bg-white/[0.06] my-1 min-h-[16px]" data-v-ce2d5fbc></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="pb-4" data-v-ce2d5fbc><p class="text-xs font-semibold text-gray-200" data-v-ce2d5fbc>${ssrInterpolate(ev.event)}</p><p class="text-[11px] text-gray-600 mt-0.5" data-v-ce2d5fbc>${ssrInterpolate(ev.by)} \xB7 ${ssrInterpolate(ev.time)}</p>`);
          if (ev.comment) {
            _push(`<p class="text-[11px] text-gray-500 mt-1 italic" data-v-ce2d5fbc>${ssrInterpolate(ev.comment)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div><div class="glass-card p-4 space-y-2" data-v-ce2d5fbc><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" data-v-ce2d5fbc>Related</h3><div class="flex justify-between text-xs text-gray-500" data-v-ce2d5fbc><span data-v-ce2d5fbc>Category Code</span><span class="text-gray-300 font-mono" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).category_code || "\u2014")}</span></div><div class="flex justify-between text-xs text-gray-500" data-v-ce2d5fbc><span data-v-ce2d5fbc>GL Account</span><span class="text-gray-300 font-mono" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).gl_account_code ? `${unref(exp).gl_account_code} \u2014 ${unref(exp).gl_account_name}` : "\u2014")}</span></div>`);
        if (unref(exp).journal_entry_id) {
          _push(`<div class="flex justify-between text-xs text-gray-500" data-v-ce2d5fbc><span data-v-ce2d5fbc>Journal Entry</span>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/accounts/journal`,
            class: "text-blue-400 hover:text-blue-300 font-mono transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` JE-${ssrInterpolate(unref(exp).journal_entry_id)}`);
              } else {
                return [
                  createTextVNode(" JE-" + toDisplayString(unref(exp).journal_entry_id), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-between text-xs text-gray-500" data-v-ce2d5fbc><span data-v-ce2d5fbc>Cost Centre</span><span class="text-gray-300" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).branch_name || "\u2014")}</span></div>`);
        if (unref(exp).approved_at) {
          _push(`<div class="flex justify-between text-xs text-gray-500" data-v-ce2d5fbc><span data-v-ce2d5fbc>Approved At</span><span class="text-gray-300" data-v-ce2d5fbc>${ssrInterpolate(fmtDate(unref(exp).approved_at))}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(exp).approved_by_name) {
          _push(`<div class="flex justify-between text-xs text-gray-500" data-v-ce2d5fbc><span data-v-ce2d5fbc>Approved By</span><span class="text-gray-300" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).approved_by_name)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-4 space-y-2" data-v-ce2d5fbc><h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3" data-v-ce2d5fbc>Quick Actions</h3><button class="btn-ghost w-full justify-start text-xs py-2" data-v-ce2d5fbc>\u{1F5A8}\uFE0F Print Voucher</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/expenses",
          class: "btn-ghost w-full justify-start text-xs py-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u2190 Back to List`);
            } else {
              return [
                createTextVNode("\u2190 Back to List")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(rejectModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.6)", "backdrop-filter": "blur(4px)" })}" data-v-ce2d5fbc><div class="w-full max-w-md glass-card p-6 space-y-4" data-v-ce2d5fbc><h3 class="section-title text-red-400" data-v-ce2d5fbc>Reject Expense</h3><p class="text-sm text-gray-400" data-v-ce2d5fbc>Reason for rejecting <strong class="text-gold-400" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).voucher_number)}</strong>:</p><textarea rows="3" class="field-input w-full resize-none" placeholder="Rejection reason\u2026" data-v-ce2d5fbc>${ssrInterpolate(unref(rejectReason))}</textarea><div class="flex gap-3 justify-end" data-v-ce2d5fbc><button class="btn-ghost text-xs" data-v-ce2d5fbc>Cancel</button><button${ssrIncludeBooleanAttr(!unref(rejectReason).trim() || unref(acting)) ? " disabled" : ""} class="btn-ghost text-xs border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-40" data-v-ce2d5fbc>${ssrInterpolate(unref(acting) ? "\u2026" : "Confirm Reject")}</button></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(cancelModal)) {
            _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.6)", "backdrop-filter": "blur(4px)" })}" data-v-ce2d5fbc><div class="w-full max-w-md glass-card p-6 space-y-4" data-v-ce2d5fbc><h3 class="section-title text-orange-400" data-v-ce2d5fbc>\u21A9 Cancel / Reverse Expense</h3><p class="text-sm text-gray-400" data-v-ce2d5fbc> This will cancel <strong class="text-gold-400" data-v-ce2d5fbc>${ssrInterpolate(unref(exp).voucher_number)}</strong> (\u09F3${ssrInterpolate(Number(unref(exp).total_amount).toLocaleString())}) and log a reversal entry. </p><div class="space-y-1.5" data-v-ce2d5fbc><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-ce2d5fbc> Reason for Cancellation * </label><textarea rows="3" class="field-input w-full resize-none" placeholder="e.g. Duplicate entry, payment reversed, entered by mistake\u2026" data-v-ce2d5fbc>${ssrInterpolate(unref(cancelReason))}</textarea></div><div class="flex gap-3 justify-end" data-v-ce2d5fbc><button class="btn-ghost text-xs" data-v-ce2d5fbc>Close</button><button${ssrIncludeBooleanAttr(!unref(cancelReason).trim() || unref(acting)) ? " disabled" : ""} class="py-2 px-5 rounded-xl text-xs font-semibold text-orange-400 border border-orange-500/20 hover:bg-orange-500/10 disabled:opacity-40 transition-all" data-v-ce2d5fbc>${ssrInterpolate(unref(acting) ? "\u2026" : "Confirm Cancellation")}</button></div></div></div>`);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ce2d5fbc"]]);

export { index as default };
//# sourceMappingURL=index-BfD7jZbu.mjs.map
