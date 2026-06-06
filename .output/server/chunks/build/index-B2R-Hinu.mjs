import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { c as _export_sfc } from './server.mjs';
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
import '@vue/shared';
import 'perfect-debounce';
import 'vue-router';

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
    useToast();
    const acting = ref(false);
    const reverseModal = ref(false);
    const deleteModal = ref(false);
    const reverseReason = ref("");
    const selectedEntry = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<!--[--><div class="space-y-6" data-v-6df0eb5b>`);
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
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3" data-v-6df0eb5b><input${ssrRenderAttr("value", unref(search))} type="text" placeholder="Search description\u2026" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" data-v-6df0eb5b><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="input-glass w-auto text-xs py-1.5" data-v-6df0eb5b><span class="text-gray-600 self-center" data-v-6df0eb5b>\u2192</span><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="input-glass w-auto text-xs py-1.5" data-v-6df0eb5b><button class="btn-ghost text-xs py-1.5" data-v-6df0eb5b>Reset</button><span class="ml-auto text-xs text-gray-500 self-center" data-v-6df0eb5b>${ssrInterpolate(unref(entries).length)} entries</span></div><div class="glass-card p-5" data-v-6df0eb5b>`);
      if (unref(pending)) {
        _push(`<div class="py-8 text-center text-xs text-gray-500 animate-pulse" data-v-6df0eb5b>Loading journal entries\u2026</div>`);
      } else {
        _push(`<div class="space-y-2" data-v-6df0eb5b><!--[-->`);
        ssrRenderList(unref(entries), (entry) => {
          var _a, _b, _c;
          _push(`<div class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer" data-v-6df0eb5b><div class="flex items-center justify-between p-4 bg-white/[0.02]" data-v-6df0eb5b><div class="flex items-center gap-4" data-v-6df0eb5b><div class="text-center" data-v-6df0eb5b><p class="text-[10px] font-semibold text-gray-600 uppercase" data-v-6df0eb5b>${ssrInterpolate(String(entry.date).slice(5, 7))}/${ssrInterpolate(String(entry.date).slice(0, 4))}</p><p class="text-lg font-bold text-gray-200" data-v-6df0eb5b>${ssrInterpolate(String(entry.date).slice(8, 10))}</p></div><div data-v-6df0eb5b><p class="text-sm font-semibold text-gray-200" data-v-6df0eb5b>${ssrInterpolate(entry.description)}</p><p class="text-xs text-gray-500 mt-0.5" data-v-6df0eb5b> JE-${ssrInterpolate(entry.id)} \xB7 ${ssrInterpolate((_a = entry.type) != null ? _a : "General")} \xB7 ${ssrInterpolate((_b = entry.posted_by) != null ? _b : "\u2014")}</p></div></div><div class="flex items-center gap-6" data-v-6df0eb5b><div class="text-right" data-v-6df0eb5b><p class="text-xs text-gray-600" data-v-6df0eb5b>Total</p><p class="font-mono font-bold text-gold-400" data-v-6df0eb5b>\u09F3${ssrInterpolate(Number((_c = entry.total) != null ? _c : 0).toLocaleString())}</p></div>`);
          if (!entry.is_reversed) {
            _push(`<div class="flex items-center gap-2 mr-3" data-v-6df0eb5b><button class="text-[11px] px-2.5 py-1 rounded-lg border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 transition-all" data-v-6df0eb5b> \u21A9 Reverse </button><button class="text-[11px] px-2.5 py-1 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all" data-v-6df0eb5b> \u{1F5D1} Delete </button></div>`);
          } else {
            _push(`<!---->`);
          }
          if (entry.is_reversed) {
            _push(`<span class="mr-3 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20" data-v-6df0eb5b>REVERSED</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<svg class="${ssrRenderClass([unref(expanded).has(entry.id) ? "rotate-180" : "", "w-4 h-4 text-gray-600 transition-transform"])}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-6df0eb5b><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" data-v-6df0eb5b></path></svg></div></div>`);
          if (unref(expanded).has(entry.id)) {
            _push(`<div class="border-t border-white/[0.06]" data-v-6df0eb5b><table class="w-full text-xs" data-v-6df0eb5b><thead data-v-6df0eb5b><tr class="border-b border-white/[0.04]" data-v-6df0eb5b><th class="py-2 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-6df0eb5b>Account</th><th class="py-2 px-4 text-right text-gray-600 font-semibold uppercase tracking-wider" data-v-6df0eb5b>Debit</th><th class="py-2 px-4 text-right text-gray-600 font-semibold uppercase tracking-wider" data-v-6df0eb5b>Credit</th></tr></thead><tbody class="divide-y divide-white/[0.03]" data-v-6df0eb5b><!--[-->`);
            ssrRenderList(entry.lines, (line) => {
              var _a2;
              _push(`<tr data-v-6df0eb5b><td class="py-2 px-4 text-gray-300" data-v-6df0eb5b><span class="${ssrRenderClass(Number(line.credit_amount) > 0 ? "pl-4" : "")}" data-v-6df0eb5b>${ssrInterpolate(line.account_name)} (${ssrInterpolate((_a2 = line.account_number) != null ? _a2 : "\u2014")}) </span></td><td class="py-2 px-4 text-right font-mono text-red-400" data-v-6df0eb5b>${ssrInterpolate(Number(line.debit_amount) > 0 ? `\u09F3${Number(line.debit_amount).toLocaleString()}` : "")}</td><td class="py-2 px-4 text-right font-mono text-emerald-400" data-v-6df0eb5b>${ssrInterpolate(Number(line.credit_amount) > 0 ? `\u09F3${Number(line.credit_amount).toLocaleString()}` : "")}</td></tr>`);
            });
            _push(`<!--]--></tbody></table></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        if (!unref(entries).length) {
          _push(`<div class="text-center py-12 text-gray-600" data-v-6df0eb5b> No journal entries found. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
      if (unref(total) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500" data-v-6df0eb5b><span data-v-6df0eb5b>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(unref(total) / perPage))}</span><div class="flex gap-2" data-v-6df0eb5b><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}" data-v-6df0eb5b>\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(unref(total) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3" data-v-6df0eb5b>Next \u2192</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b;
        if (unref(reverseModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.6)", "backdrop-filter": "blur(4px)" })}" data-v-6df0eb5b><div class="w-full max-w-md glass-card p-6 space-y-4" data-v-6df0eb5b><h3 class="section-title text-blue-400" data-v-6df0eb5b>Reverse Journal Entry</h3><p class="text-sm text-gray-400" data-v-6df0eb5b>Creating a reversal for <strong class="text-gold-400" data-v-6df0eb5b>JE-${ssrInterpolate((_a = unref(selectedEntry)) == null ? void 0 : _a.id)}</strong>:<br data-v-6df0eb5b><span class="text-gray-500 text-xs" data-v-6df0eb5b>${ssrInterpolate((_b = unref(selectedEntry)) == null ? void 0 : _b.description)}</span></p><div class="space-y-1.5" data-v-6df0eb5b><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-v-6df0eb5b>Reason (optional)</label><textarea rows="2" class="field-input w-full resize-none text-sm" placeholder="Reason for reversal\u2026" data-v-6df0eb5b>${ssrInterpolate(unref(reverseReason))}</textarea></div><div class="flex gap-3 justify-end" data-v-6df0eb5b><button class="btn-ghost text-xs" data-v-6df0eb5b>Cancel</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="px-4 py-2 rounded-xl text-xs font-semibold text-blue-400 border border-blue-500/25 hover:bg-blue-500/10 transition-all disabled:opacity-40" data-v-6df0eb5b>${ssrInterpolate(unref(acting) ? "\u2026" : "\u21A9 Confirm Reversal")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        var _a;
        if (unref(deleteModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.6)", "backdrop-filter": "blur(4px)" })}" data-v-6df0eb5b><div class="w-full max-w-md glass-card p-6 space-y-4" data-v-6df0eb5b><h3 class="section-title text-red-400" data-v-6df0eb5b>Delete Journal Entry</h3><p class="text-sm text-gray-400" data-v-6df0eb5b> Permanently delete <strong class="text-gold-400" data-v-6df0eb5b>JE-${ssrInterpolate((_a = unref(selectedEntry)) == null ? void 0 : _a.id)}</strong>? This cannot be undone. </p><div class="flex gap-3 justify-end" data-v-6df0eb5b><button class="btn-ghost text-xs" data-v-6df0eb5b>Cancel</button><button${ssrIncludeBooleanAttr(unref(acting)) ? " disabled" : ""} class="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 border border-red-500/25 hover:bg-red-500/10 transition-all disabled:opacity-40" data-v-6df0eb5b>${ssrInterpolate(unref(acting) ? "\u2026" : "Delete Permanently")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/journal/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6df0eb5b"]]);

export { index as default };
//# sourceMappingURL=index-B2R-Hinu.mjs.map
