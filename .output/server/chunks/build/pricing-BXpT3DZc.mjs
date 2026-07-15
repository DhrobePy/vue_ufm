import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, reactive, ref, watch, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, p as useUserSession } from './server.mjs';
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
  __name: "pricing",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const productId = Number(route.params.productId);
    const variantId = Number(route.params.variantId);
    const { user } = useUserSession();
    useToast();
    const isAccounts = computed(() => {
      var _a, _b;
      const r = ((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
      return ["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"].includes(r);
    });
    const { data, pending, error: fetchError, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/products/pricing/${variantId}`,
      "$5TVjFHoZ9G"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const variant = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.variant) != null ? _b : null;
    });
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const activePrices = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.activePrices) != null ? _b : {};
    });
    const changeLogs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.changeLogs) != null ? _b : [];
    });
    const newPrices = reactive({});
    const newDates = reactive({});
    const savingBranch = ref(null);
    const flash = reactive({ msg: "", ok: true });
    watch(branches, (bs) => {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      for (const b of bs) {
        if (!newDates[b.id]) newDates[b.id] = today;
      }
    }, { immediate: true });
    function formatDate(dt) {
      if (!dt) return "\u2014";
      const d = new Date(dt);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
    function gradeBadge(g) {
      var _a;
      const m = {
        A: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        B: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        C: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        R: "bg-rose-500/20 text-rose-300 border-rose-500/40"
      };
      return (_a = m[g]) != null ? _a : "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
    function changeTypeBadge(t) {
      var _a;
      const m = {
        set: "bg-blue-500/15 text-blue-400",
        update: "bg-emerald-500/15 text-emerald-400",
        archive: "bg-gray-500/15 text-gray-400"
      };
      return (_a = m[t]) != null ? _a : "bg-white/10 text-gray-400";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))} data-v-c07c2bba>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: unref(variant) ? `Pricing \u2014 ${unref(variant).weight_variant} ${unref(variant).grade ? `Grade ${unref(variant).grade}` : ""}` : "Pricing",
        subtitle: (_b = (_a = unref(variant)) == null ? void 0 : _a.product_name) != null ? _b : "",
        breadcrumb: ["Products", (_d = (_c = unref(variant)) == null ? void 0 : _c.product_name) != null ? _d : "\u2026", (_f = (_e = unref(variant)) == null ? void 0 : _e.weight_variant) != null ? _f : "\u2026", "Pricing"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/products/${unref(productId)}/variants`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Variants`);
                } else {
                  return [
                    createTextVNode("\u2190 Variants")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/products/${unref(productId)}/variants`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Variants")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center" data-v-c07c2bba><div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" data-v-c07c2bba></div><p class="text-xs text-gray-500" data-v-c07c2bba>Loading pricing data\u2026</p></div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-c07c2bba>\u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="glass-card px-5 py-3.5 flex items-center gap-4 flex-wrap" data-v-c07c2bba><div class="flex items-center gap-3 flex-wrap flex-1" data-v-c07c2bba>`);
        if ((_g = unref(variant)) == null ? void 0 : _g.grade) {
          _push(`<span class="${ssrRenderClass([gradeBadge(unref(variant).grade), "inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg border shrink-0"])}" data-v-c07c2bba>${ssrInterpolate(unref(variant).grade)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div data-v-c07c2bba><p class="font-bold text-gray-200 text-sm" data-v-c07c2bba>${ssrInterpolate((_h = unref(variant)) == null ? void 0 : _h.product_name)}</p><p class="text-[11px] text-gray-500" data-v-c07c2bba>${ssrInterpolate((_i = unref(variant)) == null ? void 0 : _i.weight_variant)} `);
        if ((_j = unref(variant)) == null ? void 0 : _j.sku) {
          _push(`<span class="font-mono text-gold-400/80 ml-2" data-v-c07c2bba>${ssrInterpolate(unref(variant).sku)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span class="ml-2 text-gray-600" data-v-c07c2bba>${ssrInterpolate((_k = unref(variant)) == null ? void 0 : _k.unit_of_measure)}</span></p></div></div><div class="text-[11px] text-gray-500" data-v-c07c2bba>${ssrInterpolate(unref(branches).length)} branch${ssrInterpolate(unref(branches).length !== 1 ? "es" : "")}</div></div>`);
        if (unref(flash).msg) {
          _push(`<div class="${ssrRenderClass([unref(flash).ok ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-300", "px-4 py-3 text-sm border rounded-xl flex items-center gap-2"])}" data-v-c07c2bba><span data-v-c07c2bba>${ssrInterpolate(unref(flash).ok ? "\u2713" : "\u2717")}</span><span data-v-c07c2bba>${ssrInterpolate(unref(flash).msg)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-0 overflow-hidden" data-v-c07c2bba><div class="px-5 py-3.5 border-b border-white/[0.06]" data-v-c07c2bba><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2" data-v-c07c2bba><svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c07c2bba><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-c07c2bba></path></svg> Branch Prices </h2></div><div class="divide-y divide-white/[0.04]" data-v-c07c2bba><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          var _a2;
          _push(`<div class="px-5 py-4 flex items-center gap-4 flex-wrap" data-v-c07c2bba><div class="w-28 shrink-0" data-v-c07c2bba><p class="font-semibold text-gray-200 text-xs" data-v-c07c2bba>${ssrInterpolate(b.name)}</p><p class="text-[10px] text-gray-600 font-mono" data-v-c07c2bba>${ssrInterpolate(b.code)}</p></div><div class="flex-1 min-w-[120px]" data-v-c07c2bba><p class="text-[10px] text-gray-600 mb-0.5" data-v-c07c2bba>Current price</p><p class="${ssrRenderClass([unref(activePrices)[b.id] ? "text-gold-400" : "text-gray-700", "font-bold text-base"])}" data-v-c07c2bba>${ssrInterpolate(unref(activePrices)[b.id] ? "\u09F3" + Number(unref(activePrices)[b.id].unit_price).toLocaleString() : "\u2014 Not set \u2014")}</p>`);
          if ((_a2 = unref(activePrices)[b.id]) == null ? void 0 : _a2.effective_date) {
            _push(`<p class="text-[10px] text-gray-600 mt-0.5" data-v-c07c2bba> Since ${ssrInterpolate(String(unref(activePrices)[b.id].effective_date).slice(0, 10))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (unref(isAccounts)) {
            _push(`<div class="flex items-end gap-2 flex-wrap" data-v-c07c2bba><div data-v-c07c2bba><label class="block text-[10px] text-gray-500 mb-1" data-v-c07c2bba>New Price (\u09F3)</label><input${ssrRenderAttr("value", unref(newPrices)[b.id])} type="number" step="1" min="0" class="input-glass py-1.5 text-xs font-mono text-center w-28" placeholder="0" data-v-c07c2bba></div><div data-v-c07c2bba><label class="block text-[10px] text-gray-500 mb-1" data-v-c07c2bba>Effective Date</label><input${ssrRenderAttr("value", unref(newDates)[b.id])} type="date" class="input-glass py-1.5 text-xs w-36" data-v-c07c2bba></div><button${ssrIncludeBooleanAttr(!unref(newPrices)[b.id] || unref(savingBranch) === b.id) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gold-500/15 text-gold-400 border border-gold-500/20 hover:bg-gold-500/25 disabled:opacity-40 transition-colors" data-v-c07c2bba>${ssrInterpolate(unref(savingBranch) === b.id ? "\u2026" : unref(activePrices)[b.id] ? "Update" : "Set Price")}</button>`);
            if (unref(activePrices)[b.id]) {
              _push(`<button${ssrIncludeBooleanAttr(unref(savingBranch) === b.id) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/20 disabled:opacity-40 transition-colors" data-v-c07c2bba> Archive </button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div><div class="glass-card p-0 overflow-hidden" data-v-c07c2bba><div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between" data-v-c07c2bba><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2" data-v-c07c2bba><svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-c07c2bba><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-v-c07c2bba></path></svg> Price Change Log </h2><span class="text-[11px] text-gray-600" data-v-c07c2bba>${ssrInterpolate(unref(changeLogs).length)} entries</span></div>`);
        if (!unref(changeLogs).length) {
          _push(`<div class="py-10 text-center text-gray-600 text-xs italic" data-v-c07c2bba> No price changes recorded yet </div>`);
        } else {
          _push(`<div class="overflow-x-auto" data-v-c07c2bba><table class="w-full text-xs" data-v-c07c2bba><thead data-v-c07c2bba><tr class="border-b border-white/[0.04] text-[10px] text-gray-600 uppercase tracking-wider" data-v-c07c2bba><th class="px-4 py-2.5 text-left font-semibold" data-v-c07c2bba>Date / Time</th><th class="px-3 py-2.5 text-left font-semibold" data-v-c07c2bba>Branch</th><th class="px-3 py-2.5 text-center font-semibold" data-v-c07c2bba>Type</th><th class="px-3 py-2.5 text-center font-semibold" data-v-c07c2bba>Old Price</th><th class="px-3 py-2.5 text-center font-semibold" data-v-c07c2bba>New Price</th><th class="px-3 py-2.5 text-center font-semibold" data-v-c07c2bba>\u0394</th><th class="px-3 py-2.5 text-left font-semibold" data-v-c07c2bba>By</th></tr></thead><tbody class="divide-y divide-white/[0.03]" data-v-c07c2bba><!--[-->`);
          ssrRenderList(unref(changeLogs), (log) => {
            var _a2;
            _push(`<tr class="hover:bg-white/[0.02]" data-v-c07c2bba><td class="px-4 py-2.5 text-gray-500 text-[11px] font-mono whitespace-nowrap" data-v-c07c2bba>${ssrInterpolate(formatDate(log.changed_at))}</td><td class="px-3 py-2.5 text-gray-400" data-v-c07c2bba>${ssrInterpolate(log.branch_name)}</td><td class="px-3 py-2.5 text-center" data-v-c07c2bba><span class="${ssrRenderClass([changeTypeBadge(log.change_type), "px-2 py-0.5 rounded-full text-[10px] font-semibold"])}" data-v-c07c2bba>${ssrInterpolate(log.change_type)}</span></td><td class="px-3 py-2.5 text-center font-mono text-gray-500" data-v-c07c2bba>${ssrInterpolate(log.old_price != null ? "\u09F3" + Number(log.old_price).toLocaleString() : "\u2014")}</td><td class="px-3 py-2.5 text-center font-mono font-bold text-gray-200" data-v-c07c2bba>${ssrInterpolate(log.new_price != null ? "\u09F3" + Number(log.new_price).toLocaleString() : "\u2014")}</td><td class="px-3 py-2.5 text-center font-mono" data-v-c07c2bba>`);
            if (log.old_price != null && log.new_price != null) {
              _push(`<span class="${ssrRenderClass(log.new_price - log.old_price > 5e-3 ? "text-emerald-400" : log.new_price - log.old_price < -5e-3 ? "text-red-400" : "text-gray-600")}" data-v-c07c2bba>${ssrInterpolate(log.new_price - log.old_price > 5e-3 ? "+" : "")}\u09F3${ssrInterpolate(Math.abs(log.new_price - log.old_price).toLocaleString())}</span>`);
            } else {
              _push(`<span class="text-gray-700" data-v-c07c2bba>\u2014</span>`);
            }
            _push(`</td><td class="px-3 py-2.5 text-gray-500" data-v-c07c2bba>${ssrInterpolate((_a2 = log.changed_by) != null ? _a2 : "\u2014")}</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        }
        _push(`</div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/[productId]/[variantId]/pricing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const pricing = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c07c2bba"]]);

export { pricing as default };
//# sourceMappingURL=pricing-BXpT3DZc.mjs.map
