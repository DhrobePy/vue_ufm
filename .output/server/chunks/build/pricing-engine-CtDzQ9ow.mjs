import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, withAsyncContext, computed, reactive, watch, ref, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderAttr, ssrRenderList, ssrRenderTeleport, ssrRenderStyle } from 'vue/server-renderer';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pricing-engine",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/pricing-engine",
      "$Ou5V3nUDqF"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const raw = computed(() => data.value);
    const grades = computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.grades) != null ? _b : [];
    });
    const gradeData = computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.gradeData) != null ? _b : {};
    });
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.currentPrices) != null ? _b : {};
    });
    computed(() => {
      var _a, _b;
      return (_b = (_a = raw.value) == null ? void 0 : _a.customCurrent) != null ? _b : {};
    });
    const cfg = reactive({
      formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
      branch_surcharges: {}
    });
    watch(data, () => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const c = (_a = data.value) == null ? void 0 : _a.config;
      if (!c) return;
      cfg.formula.bag_50 = (_c = (_b = c.formula) == null ? void 0 : _b.bag_50) != null ? _c : 50;
      cfg.formula.bag_74 = (_e = (_d = c.formula) == null ? void 0 : _d.bag_74) != null ? _e : 74;
      cfg.formula.packaging_fee = (_g = (_f = c.formula) == null ? void 0 : _f.packaging_fee) != null ? _g : 150;
      for (const b of (_i = (_h = data.value) == null ? void 0 : _h.branches) != null ? _i : []) {
        cfg.branch_surcharges[b.id] = {
          surcharge_50: (_l = (_k = (_j = c.branch_surcharges) == null ? void 0 : _j[b.id]) == null ? void 0 : _k.surcharge_50) != null ? _l : 0,
          surcharge_74: (_o = (_n = (_m = c.branch_surcharges) == null ? void 0 : _m[b.id]) == null ? void 0 : _n.surcharge_74) != null ? _o : 0
        };
      }
    }, { immediate: true });
    const base50 = reactive({});
    watch(data, () => {
      var _a, _b, _c, _d, _e;
      for (const g of (_b = (_a = raw.value) == null ? void 0 : _a.grades) != null ? _b : []) {
        if (base50[g] === void 0)
          base50[g] = (_e = (_d = (_c = raw.value) == null ? void 0 : _c.current50) == null ? void 0 : _d[g]) != null ? _e : null;
      }
    }, { immediate: true });
    const customPrices = reactive({});
    const customAll = computed(() => {
      var _a, _b;
      const list = [];
      for (const [, wcs] of Object.entries(gradeData.value)) {
        for (const item of (_a = wcs["custom"]) != null ? _a : []) {
          list.push(item);
          if (customPrices[item.variant_id] === void 0)
            customPrices[item.variant_id] = (_b = item.current_price) != null ? _b : null;
        }
      }
      return list;
    });
    function calc74(base50Val) {
      return Math.round((base50Val / cfg.formula.bag_50 * cfg.formula.bag_74 + cfg.formula.packaging_fee) * 100) / 100;
    }
    const exampleCalc74 = computed(() => fmt(calc74(2500)));
    function calc74For(grade) {
      const v = base50[grade];
      if (!v || v <= 0) return "\u2014";
      return "\u09F3" + fmt(calc74(v));
    }
    function fmt(n) {
      if (n == null || isNaN(n)) return "\u2014";
      return Number(n).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    const preview = reactive({});
    function recalcPreview() {
      var _a, _b, _c;
      for (const grade of grades.value) {
        const b50 = Number(base50[grade]);
        if (!b50 || b50 <= 0) {
          preview[grade] = { base50: "\u2014", base74: "\u2014", branches: {} };
          continue;
        }
        const b74 = calc74(b50);
        const brs = {};
        for (const b of branches.value) {
          const sc = (_a = cfg.branch_surcharges[b.id]) != null ? _a : { surcharge_50: 0, surcharge_74: 0 };
          brs[b.id] = {
            p50: "\u09F3" + fmt(b50 + Number((_b = sc.surcharge_50) != null ? _b : 0)),
            p74: "\u09F3" + fmt(b74 + Number((_c = sc.surcharge_74) != null ? _c : 0))
          };
        }
        preview[grade] = { base50: "\u09F3" + fmt(b50), base74: "\u09F3" + fmt(b74), branches: brs };
      }
    }
    watch([base50, cfg], recalcPreview, { deep: true, immediate: true });
    const savingConfig = ref(false);
    const flash = reactive({ msg: "", ok: true });
    const reviewOpen = ref(false);
    const reviewRows = ref([]);
    const reviewStats = computed(() => {
      let increases = 0, decreases = 0, unchanged = 0, isNew = 0;
      for (const r of reviewRows.value) {
        if (r.delta === null) isNew++;
        else if (r.delta > 5e-3) increases++;
        else if (r.delta < -5e-3) decreases++;
        else unchanged++;
      }
      return { increases, decreases, unchanged, isNew };
    });
    const applying = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Smart Pricing Engine",
        subtitle: "Set one base price per grade \u2014 all variants and branches update automatically",
        breadcrumb: ["Products", "Pricing Engine"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30"${_scopeId}> \u{1F512} Admin Only </span><a href="/products/pricing" class="text-xs text-gray-500 hover:text-gray-300 underline"${_scopeId}>\u2190 Manual pricing</a>`);
          } else {
            return [
              createVNode("span", { class: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30" }, " \u{1F512} Admin Only "),
              createVNode("a", {
                href: "/products/pricing",
                class: "text-xs text-gray-500 hover:text-gray-300 underline"
              }, "\u2190 Manual pricing")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(flash).msg) {
        _push(`<div class="${ssrRenderClass([unref(flash).ok ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-red-500/15 border-red-500/30 text-red-300", "glass-card px-4 py-3 text-sm border flex items-start gap-2"])}"><span>${ssrInterpolate(unref(flash).ok ? "\u2713" : "\u2717")}</span><span>${ssrInterpolate(unref(flash).msg)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between"><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2"><span class="text-gray-500">\u2699</span> Pricing Rules Configuration </h2><button${ssrIncludeBooleanAttr(unref(savingConfig)) ? " disabled" : ""} class="btn-gold text-xs px-4 py-1.5 disabled:opacity-50">${ssrInterpolate(unref(savingConfig) ? "Saving\u2026" : "Save Config")}</button></div><div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-8"><div><p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">74 kg Auto-Price Formula</p><div class="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 font-mono text-xs text-blue-300 mb-4"> price_74 = (price_50 \xF7 <strong>${ssrInterpolate(unref(cfg).formula.bag_50)}</strong>) \xD7 <strong>${ssrInterpolate(unref(cfg).formula.bag_74)}</strong> + <strong>${ssrInterpolate(unref(cfg).formula.packaging_fee)}</strong></div><div class="grid grid-cols-3 gap-3"><div><label class="block text-[11px] text-gray-500 mb-1">Bag size 50 kg</label><input${ssrRenderAttr("value", unref(cfg).formula.bag_50)} type="number" min="1" step="1" class="input-glass w-full text-xs py-1.5 text-center font-mono"></div><div><label class="block text-[11px] text-gray-500 mb-1">Bag size 74 kg</label><input${ssrRenderAttr("value", unref(cfg).formula.bag_74)} type="number" min="1" step="1" class="input-glass w-full text-xs py-1.5 text-center font-mono"></div><div><label class="block text-[11px] text-gray-500 mb-1">Packaging fee (\u09F3)</label><input${ssrRenderAttr("value", unref(cfg).formula.packaging_fee)} type="number" step="0.01" class="input-glass w-full text-xs py-1.5 text-center font-mono"></div></div><p class="mt-2 text-[11px] text-gray-600"> Example (Grade A, base \u09F32,500): (2500\xF7${ssrInterpolate(unref(cfg).formula.bag_50)})\xD7${ssrInterpolate(unref(cfg).formula.bag_74)}+${ssrInterpolate(unref(cfg).formula.packaging_fee)} = <strong class="text-gray-400">\u09F3${ssrInterpolate(unref(exampleCalc74))}</strong></p></div><div><p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Branch Surcharges (\u09F3 added to base)</p><table class="w-full text-xs"><thead><tr class="text-gray-600 border-b border-white/[0.04]"><th class="pb-2 text-left font-medium">Branch</th><th class="pb-2 text-center font-medium">+ 50 kg</th><th class="pb-2 text-center font-medium">+ 74 kg</th></tr></thead><tbody class="divide-y divide-white/[0.03]"><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<tr><td class="py-1.5 text-gray-300 font-medium">${ssrInterpolate(b.name)} <span class="text-gray-600 text-[10px] ml-1">(${ssrInterpolate(b.code)})</span></td><td class="py-1.5 px-2"><input${ssrRenderAttr("value", unref(cfg).branch_surcharges[b.id].surcharge_50)} type="number" step="0.01" class="input-glass w-full text-xs py-1 text-center font-mono"></td><td class="py-1.5 px-2"><input${ssrRenderAttr("value", unref(cfg).branch_surcharges[b.id].surcharge_74)} type="number" step="0.01" class="input-glass w-full text-xs py-1 text-center font-mono"></td></tr>`);
      });
      _push(`<!--]--></tbody></table><p class="mt-2 text-[11px] text-gray-600">Surcharges apply to 50/74 kg products only. Custom-weight products use a flat price.</p></div></div></div><div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3 border-b border-white/[0.06]"><h2 class="text-sm font-bold text-gray-200"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">1</span> Set Base 50 kg Price per Grade </h2><p class="text-xs text-gray-500 mt-0.5">All products of a grade share the same grade price. 74 kg is auto-calculated.</p></div><div class="p-5 space-y-4"><!--[-->`);
      ssrRenderList(unref(grades), (grade) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        _push(`<div class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.10] transition-colors"><div class="flex items-center gap-3 px-4 py-3 bg-white/[0.025] border-b border-white/[0.06]"><span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gold-500/20 text-gold-300 font-bold text-lg">${ssrInterpolate(grade)}</span><div><p class="font-semibold text-gray-200 text-sm">Grade ${ssrInterpolate(grade)}</p><p class="text-[11px] text-gray-600">${ssrInterpolate(((_b = (_a = unref(gradeData)[grade]) == null ? void 0 : _a["50"]) != null ? _b : []).length)} \xD7 50 kg \xB7 ${ssrInterpolate(((_d = (_c = unref(gradeData)[grade]) == null ? void 0 : _c["74"]) != null ? _d : []).length)} \xD7 74 kg </p></div></div><div class="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5"><div class="flex flex-col justify-center"><label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Base 50 kg Price (\u09F3)</label><input${ssrRenderAttr("value", unref(base50)[grade])} type="number" step="0.01" min="0" placeholder="Enter price\u2026" class="input-glass w-full py-3 text-center font-bold text-xl text-gold-300"><div class="mt-2 text-center text-xs text-gray-500"> 74 kg auto \u2192 <span class="font-bold text-purple-400">${ssrInterpolate(calc74For(grade))}</span></div></div><div><p class="text-[11px] font-semibold text-blue-400 uppercase tracking-wide mb-2">50 kg Products</p>`);
        if (!((_f = (_e = unref(gradeData)[grade]) == null ? void 0 : _e["50"]) == null ? void 0 : _f.length)) {
          _push(`<div class="text-xs text-gray-600 italic">None</div>`);
        } else {
          _push(`<div class="space-y-1 max-h-36 overflow-y-auto pr-1"><!--[-->`);
          ssrRenderList(unref(gradeData)[grade]["50"], (v) => {
            _push(`<div class="flex items-start gap-2 bg-blue-500/10 rounded-lg px-2.5 py-1.5"><span class="text-blue-400 text-[10px] mt-0.5 shrink-0">\u{1F4E6}</span><div class="min-w-0"><p class="text-xs font-medium text-gray-300 truncate">${ssrInterpolate(v.product_name)}</p><p class="text-[10px] text-gray-600 truncate">${ssrInterpolate(v.sku)} `);
            if (v.current_price !== null) {
              _push(`<span> \xB7 Current: \u09F3${ssrInterpolate(fmt(v.current_price))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div><div><p class="text-[11px] font-semibold text-purple-400 uppercase tracking-wide mb-2">74 kg Products (auto)</p>`);
        if (!((_h = (_g = unref(gradeData)[grade]) == null ? void 0 : _g["74"]) == null ? void 0 : _h.length)) {
          _push(`<div class="text-xs text-gray-600 italic">None</div>`);
        } else {
          _push(`<div class="space-y-1 max-h-36 overflow-y-auto pr-1"><!--[-->`);
          ssrRenderList(unref(gradeData)[grade]["74"], (v) => {
            _push(`<div class="flex items-start gap-2 bg-purple-500/10 rounded-lg px-2.5 py-1.5"><span class="text-purple-400 text-[10px] mt-0.5 shrink-0">\u{1F4E6}</span><div class="min-w-0"><p class="text-xs font-medium text-gray-300 truncate">${ssrInterpolate(v.product_name)}</p><p class="text-[10px] text-gray-600 truncate">${ssrInterpolate(v.sku)} `);
            if (v.current_price !== null) {
              _push(`<span> \xB7 Current: \u09F3${ssrInterpolate(fmt(v.current_price))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div></div></div>`);
      });
      _push(`<!--]--></div></div>`);
      if (unref(customAll).length) {
        _push(`<div class="glass-card p-0 overflow-hidden border border-amber-500/20"><div class="px-5 py-3 border-b border-amber-500/20 bg-amber-500/5"><h2 class="text-sm font-bold text-amber-300"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-bold mr-2">2</span> Custom-Weight Products \u2014 Manual Price </h2><p class="text-xs text-amber-500/80 mt-0.5">Non-standard bag weights. Formula does not apply \u2014 enter price directly. Leave blank to keep unchanged.</p></div><div class="p-5"><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(unref(customAll), (item) => {
          _push(`<div class="border border-white/[0.06] rounded-xl p-4 hover:border-amber-500/30 transition-colors"><p class="text-xs font-semibold text-gray-300 truncate">${ssrInterpolate(item.product_name)}</p><div class="flex items-center gap-2 mt-1 mb-3"><span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium">${ssrInterpolate(item.weight_variant)} ${ssrInterpolate(item.uom)}</span><span class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-gray-500"> Grade ${ssrInterpolate(item.grade)}</span></div><label class="block text-[11px] text-gray-500 mb-1">Price per bag (\u09F3)</label><input${ssrRenderAttr("value", unref(customPrices)[item.variant_id])} type="number" step="0.01" min="0" placeholder="Enter price\u2026" class="input-glass w-full text-xs py-2 text-center font-mono font-bold">`);
          if (item.current_price !== null) {
            _push(`<p class="mt-1 text-[10px] text-gray-600 text-center"> Current: \u09F3${ssrInterpolate(fmt(item.current_price))} (all branches) </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-0 overflow-hidden"><div class="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between"><h2 class="text-sm font-bold text-gray-200"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">${ssrInterpolate(unref(customAll).length ? "3" : "2")}</span> Live Price Preview <span class="text-xs font-normal text-gray-600 ml-1">\u2014 updates as you type</span></h2><div class="flex items-center gap-3 text-[11px] text-gray-600"><span><span class="inline-block w-2 h-2 bg-blue-400 rounded-sm mr-1"></span>50 kg</span><span><span class="inline-block w-2 h-2 bg-purple-400 rounded-sm mr-1"></span>74 kg</span></div></div><div class="overflow-x-auto"><table class="w-full text-xs"><thead class="border-b border-white/[0.06]"><tr><th class="px-4 py-2.5 text-left text-gray-600 font-semibold uppercase tracking-wider sticky left-0 bg-[#0f1117] min-w-[90px]">Grade</th><th class="px-3 py-2.5 text-center text-blue-400 font-semibold uppercase bg-blue-500/5 min-w-[90px]">Base 50</th><th class="px-3 py-2.5 text-center text-purple-400 font-semibold uppercase bg-purple-500/5 min-w-[90px]">Base 74</th><!--[-->`);
      ssrRenderList(unref(branches), (b) => {
        _push(`<!--[--><th class="px-3 py-2.5 text-center text-blue-400/70 font-semibold bg-blue-500/5 min-w-[90px]">${ssrInterpolate(b.code)}<br><span class="text-[10px] font-normal text-gray-600">50 kg</span></th><th class="px-3 py-2.5 text-center text-purple-400/70 font-semibold bg-purple-500/5 min-w-[90px]">${ssrInterpolate(b.code)}<br><span class="text-[10px] font-normal text-gray-600">74 kg</span></th><!--]-->`);
      });
      _push(`<!--]--></tr></thead><tbody class="divide-y divide-white/[0.03]"><!--[-->`);
      ssrRenderList(unref(grades), (grade) => {
        var _a, _b, _c, _d;
        _push(`<tr class="hover:bg-white/[0.02]"><td class="px-4 py-2.5 font-bold text-gray-300 sticky left-0 bg-[#0f1117]">Grade ${ssrInterpolate(grade)}</td><td class="px-3 py-2.5 text-center bg-blue-500/5 font-semibold text-blue-300">${ssrInterpolate((_b = (_a = unref(preview)[grade]) == null ? void 0 : _a.base50) != null ? _b : "\u2014")}</td><td class="px-3 py-2.5 text-center bg-purple-500/5 font-semibold text-purple-300">${ssrInterpolate((_d = (_c = unref(preview)[grade]) == null ? void 0 : _c.base74) != null ? _d : "\u2014")}</td><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          var _a2, _b2, _c2, _d2, _e, _f;
          _push(`<!--[--><td class="px-3 py-2.5 text-center bg-blue-500/5 text-blue-300/80">${ssrInterpolate((_c2 = (_b2 = (_a2 = unref(preview)[grade]) == null ? void 0 : _a2.branches[b.id]) == null ? void 0 : _b2.p50) != null ? _c2 : "\u2014")}</td><td class="px-3 py-2.5 text-center bg-purple-500/5 text-purple-300/80">${ssrInterpolate((_f = (_e = (_d2 = unref(preview)[grade]) == null ? void 0 : _d2.branches[b.id]) == null ? void 0 : _e.p74) != null ? _f : "\u2014")}</td><!--]-->`);
        });
        _push(`<!--]--></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div class="px-5 py-2.5 border-t border-white/[0.04] text-[11px] text-gray-600 flex flex-wrap gap-4"><span>74 kg = (50 kg \xF7 ${ssrInterpolate(unref(cfg).formula.bag_50)}) \xD7 ${ssrInterpolate(unref(cfg).formula.bag_74)} + ${ssrInterpolate(unref(cfg).formula.packaging_fee)}</span><span>Branch price = base + surcharge</span><span>All products in the same grade share the same grade price</span></div></div><div class="glass-card p-5 flex items-center justify-between"><div><p class="font-semibold text-gray-200 text-sm"><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-bold mr-2">${ssrInterpolate(unref(customAll).length ? "4" : "3")}</span> Review &amp; Apply </p><p class="text-xs text-gray-500 mt-0.5">Click <strong class="text-gray-400">Review Changes</strong> to see a full before/after comparison.</p></div><div class="flex items-center gap-3"><button class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"> \u21BA Reset </button><button class="btn-gold text-xs px-5 py-2"> \u{1F50D} Review Changes </button></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(reviewOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8"><div class="relative bg-[#0f1117] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col" style="${ssrRenderStyle({ "max-height": "90vh" })}"><div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0"><div><h3 class="text-base font-bold text-gray-100">Review Price Changes</h3><p class="text-xs text-gray-500 mt-0.5">Confirm all changes before they are written to the database.</p></div><button class="text-gray-600 hover:text-gray-300 text-lg">\u2715</button></div><div class="px-6 py-2.5 border-b border-white/[0.04] bg-white/[0.02] flex flex-wrap gap-5 text-xs shrink-0"><span><strong class="text-gray-200">${ssrInterpolate(unref(reviewRows).length)}</strong> <span class="text-gray-500">rows</span></span><span><strong class="text-emerald-400">${ssrInterpolate(unref(reviewStats).increases)}</strong> <span class="text-gray-500">increases</span></span><span><strong class="text-red-400">${ssrInterpolate(unref(reviewStats).decreases)}</strong> <span class="text-gray-500">decreases</span></span><span><strong class="text-gray-400">${ssrInterpolate(unref(reviewStats).unchanged)}</strong> <span class="text-gray-500">unchanged</span></span><span><strong class="text-blue-400">${ssrInterpolate(unref(reviewStats).isNew)}</strong> <span class="text-gray-500">new (no prior price)</span></span></div><div class="overflow-y-auto flex-1 min-h-0"><table class="w-full text-xs"><thead class="sticky top-0 z-10 bg-[#0f1117] border-b border-white/[0.06]"><tr class="text-gray-600 uppercase tracking-wide"><th class="px-4 py-2.5 text-left font-semibold">Grade / Product</th><th class="px-4 py-2.5 text-left font-semibold">Branch</th><th class="px-4 py-2.5 text-center font-semibold">Weight</th><th class="px-4 py-2.5 text-center font-semibold">Current</th><th class="px-4 py-2.5 text-center font-semibold">New Price</th><th class="px-4 py-2.5 text-center font-semibold">\u0394 Change</th><th class="px-4 py-2.5 text-center font-semibold">%</th></tr></thead><tbody class="divide-y divide-white/[0.03]"><!--[-->`);
          ssrRenderList(unref(reviewRows), (r, i) => {
            var _a, _b, _c;
            _push2(`<tr class="${ssrRenderClass({
              "bg-blue-500/5": r.delta === null,
              "bg-emerald-500/5": r.delta !== null && r.delta > 5e-3,
              "bg-red-500/5": r.delta !== null && r.delta < -5e-3
            })}"><td class="px-4 py-2 font-semibold text-gray-300">${ssrInterpolate(r.label)}</td><td class="px-4 py-2 text-gray-400">${ssrInterpolate(r.branch)}</td><td class="px-4 py-2 text-center"><span class="${ssrRenderClass([r.weight.startsWith("50") ? "bg-blue-500/20 text-blue-300" : r.weight.includes("custom") ? "bg-amber-500/20 text-amber-300" : "bg-purple-500/20 text-purple-300", "px-1.5 py-0.5 rounded text-[10px] font-medium"])}">${ssrInterpolate(r.weight)}</span></td><td class="px-4 py-2 text-center">`);
            if (r.curr !== null) {
              _push2(`<span class="text-gray-400 font-mono">\u09F3${ssrInterpolate(fmt(r.curr))}</span>`);
            } else {
              _push2(`<span class="text-blue-400 text-[10px] font-medium">New</span>`);
            }
            _push2(`</td><td class="px-4 py-2 text-center font-bold font-mono text-gray-200">\u09F3${ssrInterpolate(fmt(r.newP))}</td><td class="px-4 py-2 text-center font-mono">`);
            if (r.delta === null) {
              _push2(`<span class="text-blue-400 text-[10px]">No prior</span>`);
            } else if (r.delta > 5e-3) {
              _push2(`<span class="text-emerald-400">+\u09F3${ssrInterpolate(fmt(r.delta))}</span>`);
            } else if (r.delta < -5e-3) {
              _push2(`<span class="text-red-400">(\u09F3${ssrInterpolate(fmt(Math.abs(r.delta)))})</span>`);
            } else {
              _push2(`<span class="text-gray-600">\u2014</span>`);
            }
            _push2(`</td><td class="px-4 py-2 text-center font-mono">`);
            if (r.pct !== null && Math.abs((_a = r.delta) != null ? _a : 0) > 5e-3) {
              _push2(`<span class="${ssrRenderClass(((_b = r.delta) != null ? _b : 0) > 0 ? "text-emerald-400" : "text-red-400")}">${ssrInterpolate(((_c = r.delta) != null ? _c : 0) > 0 ? "+" : "")}${ssrInterpolate(r.pct.toFixed(1))}% </span>`);
            } else {
              _push2(`<span class="text-gray-600">\u2014</span>`);
            }
            _push2(`</td></tr>`);
          });
          _push2(`<!--]--></tbody></table></div><div class="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 rounded-b-2xl"><div class="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg"> \u26A0 Existing prices will be <strong>archived</strong> and replaced with the prices shown above. </div><div class="flex items-center gap-3"><button class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"> \u2190 Go Back </button><button${ssrIncludeBooleanAttr(unref(applying)) ? " disabled" : ""} class="btn-gold text-xs px-6 py-2 disabled:opacity-50">`);
          if (unref(applying)) {
            _push2(`<svg class="w-3 h-3 animate-spin inline mr-1" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(` ${ssrInterpolate(unref(applying) ? "Applying\u2026" : "\u2713 Confirm & Apply")}</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/pricing-engine.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pricing-engine-CtDzQ9ow.mjs.map
