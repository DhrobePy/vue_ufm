import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
  __name: "approval-requests",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const tabs = [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" }
    ];
    const statusFilter = ref("pending");
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/pending-requests",
      {
        query: computed(() => ({ status: statusFilter.value }))
      },
      "$EWMYHJdhwk"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const requests = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.requests) != null ? _b : [];
    });
    const acting = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Approval Requests",
        subtitle: "Payments queued because they exceeded the maker's transaction limit",
        breadcrumb: ["Credit Sales", "Approval Requests"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30"${_scopeId}> \u{1F441} Accounts </span>`);
          } else {
            return [
              createVNode("span", { class: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30" }, " \u{1F441} Accounts ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex gap-2"><!--[-->`);
      ssrRenderList(tabs, (t) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border",
          unref(statusFilter) === t.value ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]"
        ])}">${ssrInterpolate(t.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center"><div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"></div><p class="text-xs text-gray-500">Loading\u2026</p></div>`);
      } else if (!unref(requests).length) {
        _push(`<div class="glass-card p-14 text-center space-y-2"><div class="text-5xl">\u{1F4ED}</div><p class="text-gray-400 font-semibold">Nothing here</p><p class="text-xs text-gray-600">Payments over a maker&#39;s limit will appear for review</p></div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(requests), (r) => {
          var _a, _b;
          _push(`<div class="glass-card p-5 flex items-start gap-4 flex-wrap"><div class="min-w-[200px] flex-1"><p class="text-sm font-bold text-gray-200">${ssrInterpolate(r.reference_label)}</p><p class="text-xs text-gray-500 mt-1">${ssrInterpolate(r.request_type === "payment" ? "Order payment" : "Customer payment")} \xB7 requested by <strong class="text-gray-400">${ssrInterpolate((_a = r.requested_by_name) != null ? _a : "\u2014")}</strong> \xB7 ${ssrInterpolate(new Date(r.created_at).toLocaleString("en-GB"))}</p><p class="text-[11px] text-amber-400/90 mt-1">\u26A0 ${ssrInterpolate(r.requested_reason)}</p>`);
          if (r.status !== "pending") {
            _push(`<p class="text-[11px] text-gray-500 mt-1">${ssrInterpolate(r.status === "approved" ? "\u2713 Approved" : "\u2717 Rejected")} by ${ssrInterpolate((_b = r.decided_by_name) != null ? _b : "\u2014")} ${ssrInterpolate(r.decision_note ? `\u2014 ${r.decision_note}` : "")}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-right"><p class="text-lg font-bold text-gold-300 font-mono">\u09F3${ssrInterpolate(Number(r.amount).toLocaleString())}</p></div>`);
          if (r.status === "pending") {
            _push(`<div class="flex items-center gap-2 shrink-0"><button${ssrIncludeBooleanAttr(unref(acting) === r.id) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">${ssrInterpolate(unref(acting) === r.id ? "\u2026" : "\u2713 Approve & Post")}</button><button${ssrIncludeBooleanAttr(unref(acting) === r.id) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 disabled:opacity-40 transition-colors"> Reject </button></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/approval-requests.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=approval-requests-oSayRYif.mjs.map
