import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
  __name: "over-deliveries",
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
      "/api/credit-sales/over-deliveries",
      {
        query: computed(() => ({ status: statusFilter.value }))
      },
      "$bjfwC2NlXM"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.over_deliveries) != null ? _b : [];
    });
    const acting = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Over-Deliveries",
        subtitle: "Goods delivered beyond what was ordered \u2014 review, approve, resolve",
        breadcrumb: ["Credit Sales", "Over-Deliveries"]
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
      } else if (!unref(items).length) {
        _push(`<div class="glass-card p-14 text-center space-y-2"><div class="text-5xl">\u{1F4E6}</div><p class="text-gray-400 font-semibold">Nothing here</p><p class="text-xs text-gray-600">Over-deliveries recorded on any order will appear for review</p></div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(items), (od) => {
          var _a, _b;
          _push(`<div class="glass-card p-5 flex items-start gap-4 flex-wrap"><div class="min-w-[200px] flex-1">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${od.order_id}`,
            class: "text-sm font-bold text-gold-400 hover:text-gold-300"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(od.order_number)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(od.order_number), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="font-mono text-xs text-gray-500 ml-2">${ssrInterpolate(od.od_number)}</span><p class="text-xs text-gray-500 mt-1">${ssrInterpolate(od.customer_name)} \xB7 ${ssrInterpolate(od.total_extra_qty)} bags extra \xB7 resolution <strong class="text-gray-400">${ssrInterpolate(od.resolution)}</strong> \xB7 by ${ssrInterpolate((_a = od.created_by_name) != null ? _a : "\u2014")} \xB7 ${ssrInterpolate(new Date(od.created_at).toLocaleString("en-GB"))}</p>`);
          if (od.notes) {
            _push(`<p class="text-[11px] text-gray-600 mt-1">${ssrInterpolate(od.notes)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (od.status !== "pending") {
            _push(`<p class="text-[11px] text-gray-500 mt-1">${ssrInterpolate(od.status === "approved" ? "\u2713 Approved" : "\u2717 Rejected")} by ${ssrInterpolate((_b = od.approved_by_name) != null ? _b : "\u2014")} ${ssrInterpolate(od.decision_note ? `\u2014 ${od.decision_note}` : "")}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (od.resolution === "retrieve" && od.status === "approved") {
            _push(`<p class="${ssrRenderClass([od.retrieved_at ? "text-emerald-400" : "text-amber-400", "text-[11px] mt-1"])}">${ssrInterpolate(od.retrieved_at ? `\u2713 Retrieved ${new Date(od.retrieved_at).toLocaleDateString("en-GB")}` : "\u23F3 Awaiting physical retrieval")}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-right"><p class="text-lg font-bold text-amber-300 font-mono">\u09F3${ssrInterpolate(Number(od.total_extra_amount).toLocaleString())}</p></div><div class="flex items-center gap-2 shrink-0">`);
          if (od.status === "pending") {
            _push(`<!--[--><button${ssrIncludeBooleanAttr(unref(acting) === od.id) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">${ssrInterpolate(unref(acting) === od.id ? "\u2026" : "\u2713 Approve")}</button><button${ssrIncludeBooleanAttr(unref(acting) === od.id) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 disabled:opacity-40 transition-colors"> Reject </button><!--]-->`);
          } else if (od.resolution === "retrieve" && od.status === "approved" && !od.retrieved_at) {
            _push(`<button${ssrIncludeBooleanAttr(unref(acting) === od.id) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/25 hover:bg-sky-500/25 disabled:opacity-40 transition-colors">${ssrInterpolate(unref(acting) === od.id ? "\u2026" : "\u{1F4E6} Mark Retrieved")}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/over-deliveries.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=over-deliveries-z8HdHfzz.mjs.map
