import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const perPage = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const dateFrom = ref("");
    const dateTo = ref("");
    const page = ref(1);
    const expanded = ref(/* @__PURE__ */ new Set());
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/journal",
      {
        query: computed(() => ({
          search: search.value,
          date_from: dateFrom.value,
          date_to: dateTo.value,
          page: page.value
        }))
      },
      "$bwagGxwDAe"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const entries = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.entries) != null ? _b : [];
    });
    const total = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.total) != null ? _b : 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "General Journal",
        subtitle: "All posted journal entries",
        breadcrumb: ["Accounts", "Journal"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/accounts/journal/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Entry`);
                } else {
                  return [
                    createTextVNode("+ New Entry")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/accounts/journal/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Entry")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" placeholder="Search description\u2026" class="input-glass flex-1 min-w-[200px] text-xs py-1.5"><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="input-glass w-auto text-xs py-1.5"><span class="text-gray-600 self-center">\u2192</span><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="input-glass w-auto text-xs py-1.5"><button class="btn-ghost text-xs py-1.5">Reset</button><span class="ml-auto text-xs text-gray-500 self-center">${ssrInterpolate(unref(entries).length)} entries</span></div><div class="glass-card p-5">`);
      if (unref(pending)) {
        _push(`<div class="py-8 text-center text-xs text-gray-500 animate-pulse">Loading journal entries\u2026</div>`);
      } else {
        _push(`<div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(entries), (entry) => {
          var _a, _b, _c;
          _push(`<div class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"><div class="flex items-center justify-between p-4 bg-white/[0.02]"><div class="flex items-center gap-4"><div class="text-center"><p class="text-[10px] font-semibold text-gray-600 uppercase">${ssrInterpolate(String(entry.date).slice(5, 7))}/${ssrInterpolate(String(entry.date).slice(0, 4))}</p><p class="text-lg font-bold text-gray-200">${ssrInterpolate(String(entry.date).slice(8, 10))}</p></div><div><p class="text-sm font-semibold text-gray-200">${ssrInterpolate(entry.description)}</p><p class="text-xs text-gray-500 mt-0.5"> JE-${ssrInterpolate(entry.id)} \xB7 ${ssrInterpolate((_a = entry.type) != null ? _a : "General")} \xB7 ${ssrInterpolate((_b = entry.posted_by) != null ? _b : "\u2014")}</p></div></div><div class="flex items-center gap-6"><div class="text-right"><p class="text-xs text-gray-600">Total</p><p class="font-mono font-bold text-gold-400">\u09F3${ssrInterpolate(Number((_c = entry.total) != null ? _c : 0).toLocaleString())}</p></div><svg class="${ssrRenderClass([unref(expanded).has(entry.id) ? "rotate-180" : "", "w-4 h-4 text-gray-600 transition-transform"])}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg></div></div>`);
          if (unref(expanded).has(entry.id)) {
            _push(`<div class="border-t border-white/[0.06]"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.04]"><th class="py-2 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th><th class="py-2 px-4 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit</th><th class="py-2 px-4 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit</th></tr></thead><tbody class="divide-y divide-white/[0.03]"><!--[-->`);
            ssrRenderList(entry.lines, (line) => {
              var _a2;
              _push(`<tr><td class="py-2 px-4 text-gray-300"><span class="${ssrRenderClass(Number(line.credit_amount) > 0 ? "pl-4" : "")}">${ssrInterpolate(line.account_name)} (${ssrInterpolate((_a2 = line.account_number) != null ? _a2 : "\u2014")}) </span></td><td class="py-2 px-4 text-right font-mono text-red-400">${ssrInterpolate(Number(line.debit_amount) > 0 ? `\u09F3${Number(line.debit_amount).toLocaleString()}` : "")}</td><td class="py-2 px-4 text-right font-mono text-emerald-400">${ssrInterpolate(Number(line.credit_amount) > 0 ? `\u09F3${Number(line.credit_amount).toLocaleString()}` : "")}</td></tr>`);
            });
            _push(`<!--]--></tbody></table></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        if (!unref(entries).length) {
          _push(`<div class="text-center py-12 text-gray-600"> No journal entries found. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
      if (unref(total) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(unref(total) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(unref(total) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/journal/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-By8AKwAT.mjs.map
