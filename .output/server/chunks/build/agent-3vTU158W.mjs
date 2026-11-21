import { _ as _sfc_main$1 } from './HubTabs-B7UBGuJv.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { defineComponent, withAsyncContext, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './nuxt-link-rXgW20ax.mjs';
import '../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import './server.mjs';
import 'vue-router';
import './hubs-AUChU-3l.mjs';
import './usePermissions-CG_SWEjg.mjs';
import './permRoutes-DvaKf2tr.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "agent",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: st } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/agent-status",
      "$eVjwMup--T"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const msgs = ref([]), q = ref(""), busy = ref(false);
    const samples = ["Which customers should we call first today, and why?", "How is our customer portfolio \u2014 where are we weak?", "Which good payers could have their credit limit reviewed?", "Find 5 bakeries in Gazipur or Narayanganj that could buy our moyda, with their contact details and where you found them."];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_HubTabs = _sfc_main$1;
      const _component_UiPageHeader = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Ask the CRM assistant",
        subtitle: "Questions about customers, collections and prospects \u2014 answers come from your live data",
        breadcrumb: ["CRM", "Ask"]
      }, null, _parent));
      if (unref(st) && !(unref(st).enabled && unref(st).configured)) {
        _push(`<div class="glass-card p-4 text-xs text-amber-200 border border-amber-500/30"><strong>The assistant is not ready:</strong>`);
        if (!unref(st).enabled) {
          _push(`<span> it is switched off (an admin turns it on in Settings \u2192 CRM).</span>`);
        } else {
          _push(`<span> the server has no API key yet \u2014 the administrator must add <code>NUXT_ANTHROPIC_API_KEY</code> to the server settings file. Everything else in the CRM works without it.</span>`);
        }
        _push(`</div>`);
      } else if (unref(st)) {
        _push(`<div class="text-[11px] text-gray-600">Model ${ssrInterpolate(unref(st).model)} \xB7 ${ssrInterpolate(unref(st).used_today)} / ${ssrInterpolate(unref(st).daily_limit)} questions today${ssrInterpolate(unref(st).web_search ? " \xB7 web search on" : "")} \xB7 phone numbers ${ssrInterpolate(unref(st).mask_phones ? "are hidden from the AI" : "are shared with the AI")} \xB7 it can add prospects, notes and tasks, never change money or send messages.</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-4 space-y-3 min-h-[20rem]">`);
      if (!unref(msgs).length) {
        _push(`<div class="space-y-2"><p class="text-xs text-gray-500">Try:</p><!--[-->`);
        ssrRenderList(samples, (s) => {
          _push(`<button class="block text-left text-xs px-3 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 w-full">${ssrInterpolate(s)}</button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(msgs), (m, i) => {
        _push(`<div class="${ssrRenderClass([m.role === "user" ? "text-right" : "", "text-sm"])}"><div class="${ssrRenderClass([m.role === "user" ? "bg-gold-500/15 text-gray-100" : "bg-white/[0.05] text-gray-200", "inline-block max-w-[92%] text-left px-3 py-2 rounded-xl whitespace-pre-wrap"])}">${ssrInterpolate(m.text)}</div>`);
        if (m.meta) {
          _push(`<p class="text-[10px] text-gray-600 mt-0.5">${ssrInterpolate(m.meta)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]-->`);
      if (unref(busy)) {
        _push(`<p class="text-xs text-gray-500 animate-pulse">Thinking\u2026 (it may look things up first)</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><form class="flex gap-2"><input${ssrRenderAttr("value", unref(q))} class="field-input flex-1" placeholder="Ask about a customer, a collection, your portfolio, or new prospects\u2026"${ssrIncludeBooleanAttr(unref(busy)) ? " disabled" : ""}><button class="btn-gold"${ssrIncludeBooleanAttr(unref(busy) || !unref(q).trim() || !(((_a = unref(st)) == null ? void 0 : _a.enabled) && ((_b = unref(st)) == null ? void 0 : _b.configured))) ? " disabled" : ""}>Ask</button></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/agent.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=agent-3vTU158W.mjs.map
