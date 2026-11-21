import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { _ as _sfc_main$2 } from './CrmLabel-C2h7E70V.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-DhfvsbwY.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
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
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: d, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/today",
      "$_zJDC6Jtdt"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const pipelineOpen = computed(() => {
      var _a, _b;
      return ((_b = (_a = d.value) == null ? void 0 : _a.pipeline) != null ? _b : []).filter((x) => !["won", "lost"].includes(x.stage)).reduce((t, x) => t + Number(x.n), 0);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HubTabs = _sfc_main$1;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      const _component_CrmLabel = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "CRM \u2014 Today",
        subtitle: "Who to call, what's due, and which prospects are going cold",
        breadcrumb: ["CRM", "Today"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(d)) {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"><div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Open tasks</p><p class="text-xl font-bold text-gray-100">${ssrInterpolate(unref(d).counts.open_tasks)}</p></div><div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Overdue</p><p class="${ssrRenderClass([unref(d).counts.overdue ? "text-red-400" : "text-emerald-400", "text-xl font-bold"])}">${ssrInterpolate(unref(d).counts.overdue)}</p></div><div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Customers needing a call</p><p class="text-xl font-bold text-amber-400">${ssrInterpolate(unref(d).calls.length)}</p></div><div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">Prospects in the pipeline</p><p class="text-xl font-bold text-gray-100">${ssrInterpolate(unref(pipelineOpen))}</p></div></div><div class="glass-card p-4 space-y-2"><h2 class="section-title">Tasks due (next 3 days and overdue)</h2><!--[-->`);
        ssrRenderList(unref(d).tasks, (t) => {
          _push(`<div class="flex flex-wrap items-center gap-2 py-1.5 border-b border-white/[0.05] text-xs"><span class="px-2 py-0.5 rounded bg-white/10 text-gray-300">${ssrInterpolate(t.kind.replace("_", " "))}</span>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: t.party_type === "prospect" ? `/crm/prospects/${t.party_id}` : `/crm/customers/${t.party_id}`,
            class: "text-gold-400 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(t.party_name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(t.party_name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-gray-300 flex-1 min-w-[10rem]">${ssrInterpolate(t.title)}`);
          if (t.created_by_agent) {
            _push(`<span class="text-gray-600"> \xB7 by assistant</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span><span class="${ssrRenderClass(Number(t.overdue) ? "text-red-400" : "text-gray-500")}">${ssrInterpolate(t.due_date ? String(t.due_date).slice(0, 10) : "no date")}</span><button class="btn-gold text-[11px] px-2.5 py-1">Done</button></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(d).tasks.length) {
          _push(`<p class="text-xs text-gray-600 py-2">Nothing due \u2014 good. Add follow-ups from a customer or prospect page.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-4 space-y-2"><h2 class="section-title">Customers who most need a conversation</h2><!--[-->`);
        ssrRenderList(unref(d).calls, (c) => {
          _push(`<div class="py-2 border-b border-white/[0.05] text-xs space-y-1"><div class="flex flex-wrap items-center gap-2">`);
          _push(ssrRenderComponent(_component_CrmLabel, {
            label: c.label
          }, null, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/crm/customers/${c.id}`,
            class: "font-semibold text-gold-400 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(c.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(c.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-gray-500">${ssrInterpolate(c.segment)} \xB7 ${ssrInterpolate(c.district)}</span><span class="ml-auto text-gray-500">12-mo \u09F3${ssrInterpolate(n0(c.value_12m))} \xB7 owes \u09F3${ssrInterpolate(n0(Math.max(0, c.balance)))}</span></div><p class="text-gray-400">${ssrInterpolate(c.reasons.join(" \xB7 "))}</p><p class="text-gray-200">\u2192 ${ssrInterpolate(c.suggestions[0])}</p><div class="flex gap-2">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/crm/customers/${c.id}`,
            class: "btn-ghost text-[11px] px-2.5 py-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Open card`);
              } else {
                return [
                  createTextVNode("Open card")
                ];
              }
            }),
            _: 2
          }, _parent));
          if (c.has_open_task) {
            _push(`<span class="text-[11px] text-emerald-400 self-center">task already open</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(d).calls.length) {
          _push(`<p class="text-xs text-gray-600 py-2">No customer is flagged right now.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(d).cold_prospects.length) {
          _push(`<div class="glass-card p-4 space-y-2"><h2 class="section-title">Prospects going cold</h2><!--[-->`);
          ssrRenderList(unref(d).cold_prospects, (p) => {
            var _a;
            _push(`<div class="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.05]">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/crm/prospects/${p.id}`,
              class: "text-gold-400 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(p.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(p.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="text-gray-500">${ssrInterpolate(p.stage)} \xB7 ${ssrInterpolate((_a = p.segment) != null ? _a : "type unknown")}</span><span class="ml-auto text-amber-400">${ssrInterpolate(p.idle_days)} days with no contact</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bswpxy06.mjs.map
