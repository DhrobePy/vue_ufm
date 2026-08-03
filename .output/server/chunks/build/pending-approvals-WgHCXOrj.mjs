import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pending-approvals",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/pos/pending-approvals",
      "$VZihsYDBiL"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const requests = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.requests) != null ? _b : [];
    });
    const acting = ref(null);
    function timeAgo(dateStr) {
      if (!dateStr) return "\u2014";
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      return `${Math.floor(hrs / 24)}d ago`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "POS Exit Approvals",
        subtitle: "Release requests for unpaid/partial-credit POS sales",
        breadcrumb: ["POS", "Pending Approvals"]
      }, null, _parent));
      if (!unref(requests).length) {
        _push(`<div class="glass-card p-10 text-center text-sm text-gray-500"> Nothing pending \u2014 all POS sales are cleared for exit. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(requests), (r) => {
        _push(`<div class="glass-card p-5 flex items-center gap-4"><div class="flex-1"><p class="text-sm font-semibold text-gray-200">${ssrInterpolate(r.reference_label)}</p><p class="text-xs text-gray-500 mt-1">Requested by ${ssrInterpolate(r.requested_by_name)} \xB7 ${ssrInterpolate(timeAgo(r.created_at))}</p></div><div class="text-right"><p class="font-mono text-orange-400 font-bold">\u09F3${ssrInterpolate(Number(r.amount).toLocaleString())}</p></div><div class="flex gap-2 shrink-0"><button${ssrIncludeBooleanAttr(unref(acting) === r.id) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">${ssrInterpolate(unref(acting) === r.id ? "\u2026" : "\u2713 Approve")}</button><button${ssrIncludeBooleanAttr(unref(acting) === r.id) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 transition-colors"> Reject </button></div></div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/pending-approvals.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pending-approvals-WgHCXOrj.mjs.map
