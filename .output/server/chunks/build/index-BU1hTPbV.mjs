import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './PricingEnginePanel-3psyBiWJ.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, mergeProps, withCtx, createVNode, openBlock, createBlock, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrGetDirectiveProps, ssrGetDynamicModelProps, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { c as _export_sfc, p as useUserSession } from './server.mjs';
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
    const { user } = useUserSession();
    useToast();
    const isAdmin = computed(
      () => {
        var _a, _b;
        return ["admin", "superadmin"].includes(((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
      }
    );
    const { data, refresh, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/hub",
      "$k8XaJet9bD"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allProducts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.products) != null ? _b : [];
    });
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const kpis = computed(() => {
      var _a, _b, _c;
      const totalV = allProducts.value.reduce((s, p) => {
        var _a2, _b2;
        return s + ((_b2 = (_a2 = p.variants) == null ? void 0 : _a2.length) != null ? _b2 : 0);
      }, 0);
      let priced = 0;
      let totalStock = 0;
      for (const p of allProducts.value) {
        for (const v of (_a = p.variants) != null ? _a : []) {
          if (Object.keys((_b = v.prices) != null ? _b : {}).length > 0) priced++;
          totalStock += Number((_c = v.stock_qty) != null ? _c : 0);
        }
      }
      return [
        { label: "Base Products", val: allProducts.value.length, icon: "\u{1F4E6}", color: "text-violet-400", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.20)", sub: "Active product families" },
        { label: "Variants", val: totalV, icon: "\u{1F5C2}", color: "text-sky-400", bg: "rgba(56,189,248,0.10)", border: "rgba(56,189,248,0.20)", sub: "All active SKUs" },
        { label: "Total Stock", val: totalStock.toLocaleString(), icon: "\u{1F4CA}", color: "text-emerald-400", bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.20)", sub: "Bags in warehouse" },
        { label: "Priced", val: `${priced}/${totalV}`, icon: "\u{1F4B0}", color: "text-amber-400", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.20)", sub: "Variants with price" }
      ];
    });
    const tab = ref("catalog");
    const search = ref("");
    const gradeTab = ref("All");
    const allCatalogVariants = computed(() => {
      var _a;
      const result = [];
      for (const p of allProducts.value) {
        for (const v of (_a = p.variants) != null ? _a : []) {
          result.push({ ...v, product_name: p.base_name, category: p.category, product_id: p.id });
        }
      }
      return result;
    });
    const filteredCatalogVariants = computed(() => {
      let list = allCatalogVariants.value;
      if (search.value.trim()) {
        const q = search.value.toLowerCase();
        list = list.filter(
          (v) => {
            var _a, _b;
            return v.product_name.toLowerCase().includes(q) || ((_a = v.sku) != null ? _a : "").toLowerCase().includes(q) || ((_b = v.weight_variant) != null ? _b : "").toLowerCase().includes(q);
          }
        );
      }
      return list;
    });
    const catalogGrades = computed(() => {
      const gs = /* @__PURE__ */ new Set();
      for (const v of allCatalogVariants.value) {
        if (v.grade) gs.add(v.grade);
      }
      return [...gs].sort();
    });
    const variantsByGrade = computed(() => {
      const map = {};
      for (const v of filteredCatalogVariants.value) {
        const g = v.grade || "?";
        if (!map[g]) map[g] = [];
        map[g].push(v);
      }
      return map;
    });
    const displayedGradeKeys = computed(() => {
      if (gradeTab.value !== "All") return gradeTab.value === "?" ? [] : [gradeTab.value];
      return catalogGrades.value;
    });
    const ungradedFiltered = computed(
      () => filteredCatalogVariants.value.filter((v) => !v.grade)
    );
    const displayedVariants = computed(() => {
      if (gradeTab.value === "All") return filteredCatalogVariants.value;
      return filteredCatalogVariants.value.filter(
        (v) => gradeTab.value === "?" ? !v.grade : v.grade === gradeTab.value
      );
    });
    function filteredByGrade(grade) {
      return filteredCatalogVariants.value.filter((v) => v.grade === grade);
    }
    function productCountForGrade(grade) {
      return new Set(filteredByGrade(grade).map((v) => v.product_id)).size;
    }
    function gradePillActive(g) {
      var _a;
      if (g === "All") return "bg-white/[0.08] border-white/[0.14] text-gray-100 shadow-sm";
      const m = {
        A: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        B: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        C: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        R: "bg-rose-500/20 text-rose-300 border-rose-500/40"
      };
      return (_a = m[g]) != null ? _a : "bg-gold-500/15 text-gold-300 border-gold-500/30";
    }
    const editingCell = ref(null);
    const editingValue = ref(0);
    const savingCell = ref(false);
    const vAutofocus = {
      mounted(el) {
        el.focus();
        el.select();
      }
    };
    const showAddProduct = ref(false);
    const addingProduct = ref(false);
    const newProduct = reactive({ name: "", base_sku: "", category: "Flour", description: "" });
    const showEditProduct = ref(false);
    const editingProduct = ref(false);
    const editProductForm = reactive({ id: 0, name: "", base_sku: "", category: "Flour", description: "", status: "active" });
    const deleteProductTarget = ref(null);
    const deletingProduct = ref(false);
    const showAddVariant = ref(false);
    const addingVariant = ref(false);
    ref(null);
    const newVariant = reactive({ packWeight: "50kg", grade: "", uom: "bag", barcode: "" });
    function categoryPill(cat) {
      var _a;
      const m = {
        Flour: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
        Atta: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
        Bran: "bg-green-500/15 text-green-400 border border-green-500/20",
        Semolina: "bg-sky-500/15 text-sky-400 border border-sky-500/20"
      };
      return (_a = m[cat]) != null ? _a : "bg-gray-500/15 text-gray-400 border border-gray-500/20";
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
    function packBadge(w) {
      const n = parseInt(w);
      if (n === 50) return "bg-blue-500/15 text-blue-300";
      if (n === 74) return "bg-purple-500/15 text-purple-300";
      if (n === 37) return "bg-rose-500/15 text-rose-300";
      return "bg-amber-500/15 text-amber-300";
    }
    function stockPct(v) {
      const available = Math.max(0, Number(v.stock_qty) - Number(v.reserved_qty));
      const reorder = Number(v.reorder_level) || 1;
      return Math.min(100, Math.round(available / Math.max(reorder * 3, 1) * 100));
    }
    function stockBarColor(v) {
      const available = Math.max(0, Number(v.stock_qty) - Number(v.reserved_qty));
      const reorder = Number(v.reorder_level) || 0;
      if (Number(v.stock_qty) === 0) return "bg-gray-600";
      if (available <= reorder) return "bg-red-500";
      if (available <= reorder * 2) return "bg-amber-500";
      return "bg-emerald-500";
    }
    function availColor(v) {
      const available = Math.max(0, Number(v.stock_qty) - Number(v.reserved_qty));
      const reorder = Number(v.reorder_level) || 0;
      if (Number(v.stock_qty) === 0) return "text-gray-600";
      if (available <= reorder) return "text-red-400";
      if (available <= reorder * 2) return "text-amber-400";
      return "text-emerald-400";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_PricingEnginePanel = _sfc_main$2;
      let _temp0, _temp1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))} data-v-8cb77c87>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Products",
        subtitle: "Base products \xB7 grades \xB7 variants \xB7 pricing \xB7 inventory",
        breadcrumb: ["Products"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2" data-v-8cb77c87${_scopeId}><a href="/api/products/export/csv" download class="btn-ghost text-xs flex items-center gap-1.5" data-v-8cb77c87${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" data-v-8cb77c87${_scopeId}></path></svg> Export CSV </a><button class="btn-gold text-xs flex items-center gap-1.5" data-v-8cb77c87${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" data-v-8cb77c87${_scopeId}></path></svg> New Product </button></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2" }, [
                createVNode("a", {
                  href: "/api/products/export/csv",
                  download: "",
                  class: "btn-ghost text-xs flex items-center gap-1.5"
                }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-3.5 h-3.5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    })
                  ])),
                  createTextVNode(" Export CSV ")
                ]),
                createVNode("button", {
                  onClick: ($event) => showAddProduct.value = true,
                  class: "btn-gold text-xs flex items-center gap-1.5"
                }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-3.5 h-3.5",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2.5",
                      d: "M12 4v16m8-8H4"
                    })
                  ])),
                  createTextVNode(" New Product ")
                ], 8, ["onClick"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-3" data-v-8cb77c87><!--[-->`);
      ssrRenderList(unref(kpis), (k) => {
        _push(`<div class="glass-card p-4 flex items-center gap-3 overflow-hidden relative group hover:ring-1 hover:ring-white/[0.06] transition-all duration-200" data-v-8cb77c87><div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110" style="${ssrRenderStyle(`background:${k.bg};border:1px solid ${k.border}`)}" data-v-8cb77c87><span class="text-xl leading-none" data-v-8cb77c87>${ssrInterpolate(k.icon)}</span></div><div data-v-8cb77c87><p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold" data-v-8cb77c87>${ssrInterpolate(k.label)}</p><p class="${ssrRenderClass([k.color, "text-2xl font-black tabular-nums"])}" data-v-8cb77c87>${ssrInterpolate(k.val)}</p><p class="text-[10px] text-gray-600" data-v-8cb77c87>${ssrInterpolate(k.sub)}</p></div></div>`);
      });
      _push(`<!--]--></div><div class="flex items-center justify-between flex-wrap gap-3" data-v-8cb77c87><div class="flex gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.06]" data-v-8cb77c87><button class="${ssrRenderClass([unref(tab) === "catalog" ? "bg-white/[0.09] text-gray-100 shadow-sm" : "text-gray-500 hover:text-gray-300", "px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2"])}" data-v-8cb77c87><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" data-v-8cb77c87></path></svg> Catalog </button>`);
      if (unref(isAdmin)) {
        _push(`<button class="${ssrRenderClass([unref(tab) === "pricing" ? "bg-white/[0.09] text-gray-100 shadow-sm" : "text-gray-500 hover:text-gray-300", "px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2"])}" data-v-8cb77c87><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-8cb77c87></path></svg> Pricing Engine <span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20" data-v-8cb77c87>ADMIN</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(tab) === "catalog") {
        _push(`<div data-v-8cb77c87><div class="relative" data-v-8cb77c87><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" data-v-8cb77c87></path></svg><input${ssrRenderAttr("value", unref(search))} placeholder="Search product, SKU, pack\u2026" class="input-glass pl-9 pr-3 py-1.5 text-xs w-56" data-v-8cb77c87></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center space-y-3" data-v-8cb77c87><div class="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto" data-v-8cb77c87></div><p class="text-xs text-gray-500" data-v-8cb77c87>Loading\u2026</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-8cb77c87>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        if (unref(tab) === "catalog") {
          _push(`<div class="space-y-5" data-v-8cb77c87><div class="flex items-center gap-1.5 flex-wrap" data-v-8cb77c87><!--[-->`);
          ssrRenderList(["All", ...unref(catalogGrades)], (g) => {
            var _a, _b;
            _push(`<button class="${ssrRenderClass([unref(gradeTab) === g ? gradePillActive(g) : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]", "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"])}" data-v-8cb77c87>`);
            if (g !== "All") {
              _push(`<span class="${ssrRenderClass([unref(gradeTab) === g ? gradeBadge(g) : "bg-white/[0.06] border-white/[0.10] text-gray-500", "inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-black border"])}" data-v-8cb77c87>${ssrInterpolate(g)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(` ${ssrInterpolate(g === "All" ? "All Grades" : `Grade ${g}`)} <span class="text-[10px] opacity-50 tabular-nums" data-v-8cb77c87>${ssrInterpolate(g === "All" ? unref(allCatalogVariants).length : (_b = (_a = unref(variantsByGrade)[g]) == null ? void 0 : _a.length) != null ? _b : 0)}</span></button>`);
          });
          _push(`<!--]-->`);
          if (unref(ungradedFiltered).length) {
            _push(`<div class="h-4 w-px bg-white/[0.08] mx-1" data-v-8cb77c87></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(ungradedFiltered).length) {
            _push(`<button class="${ssrRenderClass([unref(gradeTab) === "?" ? "bg-white/[0.08] border-white/[0.14] text-gray-300" : "bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-400", "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"])}" data-v-8cb77c87> Ungraded <span class="text-[10px] opacity-50" data-v-8cb77c87>${ssrInterpolate(unref(ungradedFiltered).length)}</span></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><!--[-->`);
          ssrRenderList(unref(displayedGradeKeys), (grade) => {
            _push(`<!--[-->`);
            if (unref(gradeTab) === "All") {
              _push(`<div class="flex items-center gap-3" data-v-8cb77c87><span class="${ssrRenderClass([gradeBadge(grade), "inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm border shrink-0"])}" data-v-8cb77c87>${ssrInterpolate(grade)}</span><div data-v-8cb77c87><h3 class="font-semibold text-gray-300 text-sm" data-v-8cb77c87>Grade ${ssrInterpolate(grade)}</h3><p class="text-[11px] text-gray-600" data-v-8cb77c87>${ssrInterpolate(filteredByGrade(grade).length)} variant${ssrInterpolate(filteredByGrade(grade).length !== 1 ? "s" : "")} \xB7 ${ssrInterpolate(productCountForGrade(grade))} product${ssrInterpolate(productCountForGrade(grade) !== 1 ? "s" : "")}</p></div><div class="flex-1 h-px bg-white/[0.05]" data-v-8cb77c87></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" data-v-8cb77c87><!--[-->`);
            ssrRenderList(filteredByGrade(grade), (v) => {
              _push(`<div class="group rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden flex flex-col hover:border-white/[0.10] hover:bg-white/[0.035] transition-all duration-200" data-v-8cb77c87><div class="px-4 pt-3.5 pb-3 border-b border-white/[0.05]" data-v-8cb77c87><div class="flex items-start justify-between gap-1.5 mb-2.5" data-v-8cb77c87><p class="font-bold text-gray-200 text-sm leading-tight flex-1 min-w-0" data-v-8cb77c87>${ssrInterpolate(v.product_name)}</p><div class="flex items-center gap-0.5 shrink-0" data-v-8cb77c87><span class="${ssrRenderClass([categoryPill(v.category), "px-2 py-0.5 rounded-full text-[10px] font-semibold"])}" data-v-8cb77c87>${ssrInterpolate(v.category)}</span><button title="Edit product" class="p-1 rounded text-gray-700 hover:text-gray-300 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100" data-v-8cb77c87><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" data-v-8cb77c87></path></svg></button>`);
              if (unref(isAdmin)) {
                _push(`<button title="Delete product" class="p-1 rounded text-gray-700 hover:text-red-400 hover:bg-red-500/[0.06] transition-all opacity-0 group-hover:opacity-100" data-v-8cb77c87><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-8cb77c87></path></svg></button>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div><div class="flex items-center gap-2 flex-wrap" data-v-8cb77c87><span class="${ssrRenderClass([packBadge(v.weight_variant), "px-2.5 py-0.5 rounded-lg text-[11px] font-black"])}" data-v-8cb77c87>${ssrInterpolate(v.weight_variant)}</span><span class="${ssrRenderClass([gradeBadge(grade), "inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black border"])}" data-v-8cb77c87>${ssrInterpolate(grade)}</span>`);
              if (v.sku) {
                _push(`<span class="font-mono text-[10px] text-gray-600 truncate" data-v-8cb77c87>${ssrInterpolate(v.sku)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div><div class="px-4 py-3 flex-1 space-y-1.5" data-v-8cb77c87><!--[-->`);
              ssrRenderList(unref(branches), (b) => {
                var _a;
                _push(`<div class="flex items-center gap-2 group/pr" data-v-8cb77c87><span class="text-[10px] font-semibold text-gray-600 w-10 shrink-0 uppercase tracking-wide" data-v-8cb77c87>${ssrInterpolate(b.code)}</span><div class="flex-1 h-px bg-white/[0.04]" data-v-8cb77c87></div>`);
                if (unref(editingCell) === `${v.id}:${b.id}`) {
                  _push(`<div class="flex items-center gap-1" data-v-8cb77c87><span class="text-gold-500/80 text-[10px]" data-v-8cb77c87>\u09F3</span><input${ssrRenderAttrs((_temp0 = mergeProps({
                    value: unref(editingValue),
                    type: "number",
                    min: "0",
                    step: "1",
                    class: "w-20 bg-transparent border-b border-gold-500 text-right text-xs font-mono font-bold text-gold-300 outline-none appearance-none"
                  }, ssrGetDirectiveProps(_ctx, vAutofocus)), mergeProps(_temp0, ssrGetDynamicModelProps(_temp0, unref(editingValue)))))} data-v-8cb77c87><button${ssrIncludeBooleanAttr(unref(savingCell)) ? " disabled" : ""} class="text-emerald-400 text-xs leading-none disabled:opacity-40" data-v-8cb77c87>\u2713</button><button class="text-gray-600 text-xs leading-none hover:text-gray-400" data-v-8cb77c87>\u2715</button></div>`);
                } else {
                  _push(`<button class="transition-all duration-100" data-v-8cb77c87>`);
                  if ((_a = v.prices[b.id]) == null ? void 0 : _a.unit_price) {
                    _push(`<span class="font-mono font-bold text-xs text-gold-400 group-hover/pr:text-gold-300 tabular-nums" data-v-8cb77c87> \u09F3${ssrInterpolate(Number(v.prices[b.id].unit_price).toLocaleString())}</span>`);
                  } else {
                    _push(`<span class="text-[10px] text-gray-700 border border-dashed border-gray-700/50 group-hover/pr:border-gold-500/40 group-hover/pr:text-gold-500/60 rounded px-1.5 py-0.5 transition-all" data-v-8cb77c87> + Set </span>`);
                  }
                  _push(`</button>`);
                }
                _push(`</div>`);
              });
              _push(`<!--]--></div><div class="px-4 py-2.5 border-t border-white/[0.04] flex items-center gap-2.5" data-v-8cb77c87><div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden" data-v-8cb77c87><div class="${ssrRenderClass([stockBarColor(v), "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${stockPct(v)}%`)}" data-v-8cb77c87></div></div><span class="${ssrRenderClass([availColor(v), "text-[10px] font-mono tabular-nums shrink-0"])}" data-v-8cb77c87>${ssrInterpolate(Number(v.stock_qty || 0).toLocaleString())}</span>`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/products/${v.product_id}/${v.id}/pricing`,
                class: "text-gray-700 hover:text-gold-400 transition-colors shrink-0",
                title: "Open pricing"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-8cb77c87${_scopeId}></path></svg>`);
                  } else {
                    return [
                      (openBlock(), createBlock("svg", {
                        class: "w-3.5 h-3.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M9 5l7 7-7 7"
                        })
                      ]))
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div></div>`);
            });
            _push(`<!--]--></div><!--]-->`);
          });
          _push(`<!--]-->`);
          if ((unref(gradeTab) === "All" || unref(gradeTab) === "?") && unref(ungradedFiltered).length) {
            _push(`<!--[-->`);
            if (unref(gradeTab) === "All") {
              _push(`<div class="flex items-center gap-3" data-v-8cb77c87><div class="w-8 h-8 rounded-lg bg-gray-500/10 border border-gray-500/20 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0" data-v-8cb77c87>?</div><div data-v-8cb77c87><h3 class="font-semibold text-gray-500 text-sm" data-v-8cb77c87>Ungraded</h3><p class="text-[11px] text-gray-600" data-v-8cb77c87>${ssrInterpolate(unref(ungradedFiltered).length)} variant${ssrInterpolate(unref(ungradedFiltered).length !== 1 ? "s" : "")}</p></div><div class="flex-1 h-px bg-white/[0.05]" data-v-8cb77c87></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" data-v-8cb77c87><!--[-->`);
            ssrRenderList(unref(ungradedFiltered), (v) => {
              _push(`<div class="group rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden flex flex-col hover:border-white/[0.10] hover:bg-white/[0.035] transition-all duration-200" data-v-8cb77c87><div class="px-4 pt-3.5 pb-3 border-b border-white/[0.05]" data-v-8cb77c87><div class="flex items-start justify-between gap-1.5 mb-2.5" data-v-8cb77c87><p class="font-bold text-gray-200 text-sm leading-tight flex-1 min-w-0" data-v-8cb77c87>${ssrInterpolate(v.product_name)}</p><div class="flex items-center gap-0.5 shrink-0" data-v-8cb77c87><span class="${ssrRenderClass([categoryPill(v.category), "px-2 py-0.5 rounded-full text-[10px] font-semibold"])}" data-v-8cb77c87>${ssrInterpolate(v.category)}</span><button title="Edit product" class="p-1 rounded text-gray-700 hover:text-gray-300 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100" data-v-8cb77c87><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" data-v-8cb77c87></path></svg></button>`);
              if (unref(isAdmin)) {
                _push(`<button title="Delete product" class="p-1 rounded text-gray-700 hover:text-red-400 hover:bg-red-500/[0.06] transition-all opacity-0 group-hover:opacity-100" data-v-8cb77c87><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-8cb77c87></path></svg></button>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div><div class="flex items-center gap-2" data-v-8cb77c87><span class="${ssrRenderClass([packBadge(v.weight_variant), "px-2.5 py-0.5 rounded-lg text-[11px] font-black"])}" data-v-8cb77c87>${ssrInterpolate(v.weight_variant)}</span>`);
              if (v.sku) {
                _push(`<span class="font-mono text-[10px] text-gray-600" data-v-8cb77c87>${ssrInterpolate(v.sku)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div><div class="px-4 py-3 flex-1 space-y-1.5" data-v-8cb77c87><!--[-->`);
              ssrRenderList(unref(branches), (b) => {
                var _a;
                _push(`<div class="flex items-center gap-2 group/pr" data-v-8cb77c87><span class="text-[10px] font-semibold text-gray-600 w-10 shrink-0 uppercase tracking-wide" data-v-8cb77c87>${ssrInterpolate(b.code)}</span><div class="flex-1 h-px bg-white/[0.04]" data-v-8cb77c87></div>`);
                if (unref(editingCell) === `${v.id}:${b.id}`) {
                  _push(`<div class="flex items-center gap-1" data-v-8cb77c87><span class="text-gold-500/80 text-[10px]" data-v-8cb77c87>\u09F3</span><input${ssrRenderAttrs((_temp1 = mergeProps({
                    value: unref(editingValue),
                    type: "number",
                    min: "0",
                    step: "1",
                    class: "w-20 bg-transparent border-b border-gold-500 text-right text-xs font-mono font-bold text-gold-300 outline-none appearance-none"
                  }, ssrGetDirectiveProps(_ctx, vAutofocus)), mergeProps(_temp1, ssrGetDynamicModelProps(_temp1, unref(editingValue)))))} data-v-8cb77c87><button${ssrIncludeBooleanAttr(unref(savingCell)) ? " disabled" : ""} class="text-emerald-400 text-xs disabled:opacity-40" data-v-8cb77c87>\u2713</button><button class="text-gray-600 text-xs hover:text-gray-400" data-v-8cb77c87>\u2715</button></div>`);
                } else {
                  _push(`<button class="transition-all duration-100" data-v-8cb77c87>`);
                  if ((_a = v.prices[b.id]) == null ? void 0 : _a.unit_price) {
                    _push(`<span class="font-mono font-bold text-xs text-gold-400 group-hover/pr:text-gold-300 tabular-nums" data-v-8cb77c87>\u09F3${ssrInterpolate(Number(v.prices[b.id].unit_price).toLocaleString())}</span>`);
                  } else {
                    _push(`<span class="text-[10px] text-gray-700 border border-dashed border-gray-700/50 group-hover/pr:border-gold-500/40 group-hover/pr:text-gold-500/60 rounded px-1.5 py-0.5 transition-all" data-v-8cb77c87>+ Set</span>`);
                  }
                  _push(`</button>`);
                }
                _push(`</div>`);
              });
              _push(`<!--]--></div><div class="px-4 py-2.5 border-t border-white/[0.04] flex items-center gap-2.5" data-v-8cb77c87><div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden" data-v-8cb77c87><div class="${ssrRenderClass([stockBarColor(v), "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${stockPct(v)}%`)}" data-v-8cb77c87></div></div><span class="${ssrRenderClass([availColor(v), "text-[10px] font-mono tabular-nums shrink-0"])}" data-v-8cb77c87>${ssrInterpolate(Number(v.stock_qty || 0).toLocaleString())}</span>`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/products/${v.product_id}/${v.id}/pricing`,
                class: "text-gray-700 hover:text-gold-400 transition-colors shrink-0"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-8cb77c87${_scopeId}></path></svg>`);
                  } else {
                    return [
                      (openBlock(), createBlock("svg", {
                        class: "w-3.5 h-3.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M9 5l7 7-7 7"
                        })
                      ]))
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div></div>`);
            });
            _push(`<!--]--></div><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          if (unref(displayedVariants).length === 0) {
            _push(`<div class="glass-card p-14 text-center space-y-3" data-v-8cb77c87><div class="text-5xl" data-v-8cb77c87>\u{1F4E6}</div><p class="text-gray-400 font-semibold" data-v-8cb77c87>No variants found</p><p class="text-xs text-gray-600" data-v-8cb77c87>Try adjusting your search or grade filter</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (unref(tab) === "pricing") {
          _push(`<div data-v-8cb77c87>`);
          _push(ssrRenderComponent(_component_PricingEnginePanel, null, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddProduct)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-8cb77c87><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-8cb77c87><div class="flex items-center justify-between" data-v-8cb77c87><h3 class="text-lg font-bold text-gray-100" data-v-8cb77c87>New Base Product</h3><button class="text-gray-500 hover:text-gray-200" data-v-8cb77c87>\u2715</button></div><div class="space-y-4" data-v-8cb77c87><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Product Name *</label><input${ssrRenderAttr("value", unref(newProduct).name)} type="text" class="input-glass" placeholder="e.g. 2Hati Moida" data-v-8cb77c87></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Base SKU</label><input${ssrRenderAttr("value", unref(newProduct).base_sku)} type="text" class="input-glass font-mono uppercase" placeholder="e.g. UFF" data-v-8cb77c87></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Category *</label><select class="input-glass" data-v-8cb77c87><option value="Flour" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Flour") : ssrLooseEqual(unref(newProduct).category, "Flour")) ? " selected" : ""}>Flour (Moida)</option><option value="Atta" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Atta") : ssrLooseEqual(unref(newProduct).category, "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Bran") : ssrLooseEqual(unref(newProduct).category, "Bran")) ? " selected" : ""}>Bran (Vushi)</option><option value="Semolina" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Semolina") : ssrLooseEqual(unref(newProduct).category, "Semolina")) ? " selected" : ""}>Semolina (Sooji)</option></select></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Description</label><textarea rows="2" class="input-glass resize-none" data-v-8cb77c87>${ssrInterpolate(unref(newProduct).description)}</textarea></div></div><div class="flex gap-3 pt-2" data-v-8cb77c87><button${ssrIncludeBooleanAttr(!unref(newProduct).name || unref(addingProduct)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-8cb77c87>${ssrInterpolate(unref(addingProduct) ? "Adding\u2026" : "Add Product")}</button><button class="btn-ghost text-xs" data-v-8cb77c87>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showEditProduct)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-8cb77c87><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-8cb77c87><div class="flex items-center justify-between" data-v-8cb77c87><h3 class="text-lg font-bold text-gray-100" data-v-8cb77c87>Edit Product</h3><button class="text-gray-500 hover:text-gray-200" data-v-8cb77c87>\u2715</button></div><div class="space-y-4" data-v-8cb77c87><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Product Name *</label><input${ssrRenderAttr("value", unref(editProductForm).name)} type="text" class="input-glass" data-v-8cb77c87></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Base SKU</label><input${ssrRenderAttr("value", unref(editProductForm).base_sku)} type="text" class="input-glass font-mono uppercase" placeholder="e.g. UFF" data-v-8cb77c87></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Category *</label><select class="input-glass" data-v-8cb77c87><option value="Flour" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).category) ? ssrLooseContain(unref(editProductForm).category, "Flour") : ssrLooseEqual(unref(editProductForm).category, "Flour")) ? " selected" : ""}>Flour (Moida)</option><option value="Atta" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).category) ? ssrLooseContain(unref(editProductForm).category, "Atta") : ssrLooseEqual(unref(editProductForm).category, "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).category) ? ssrLooseContain(unref(editProductForm).category, "Bran") : ssrLooseEqual(unref(editProductForm).category, "Bran")) ? " selected" : ""}>Bran (Vushi)</option><option value="Semolina" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).category) ? ssrLooseContain(unref(editProductForm).category, "Semolina") : ssrLooseEqual(unref(editProductForm).category, "Semolina")) ? " selected" : ""}>Semolina (Sooji)</option></select></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Description</label><textarea rows="2" class="input-glass resize-none" data-v-8cb77c87>${ssrInterpolate(unref(editProductForm).description)}</textarea></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Status</label><select class="input-glass" data-v-8cb77c87><option value="active" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).status) ? ssrLooseContain(unref(editProductForm).status, "active") : ssrLooseEqual(unref(editProductForm).status, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).status) ? ssrLooseContain(unref(editProductForm).status, "inactive") : ssrLooseEqual(unref(editProductForm).status, "inactive")) ? " selected" : ""}>Inactive</option></select></div></div><div class="flex gap-3 pt-2" data-v-8cb77c87><button${ssrIncludeBooleanAttr(!unref(editProductForm).name || unref(editingProduct)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-8cb77c87>${ssrInterpolate(unref(editingProduct) ? "Saving\u2026" : "Save Changes")}</button><button class="btn-ghost text-xs" data-v-8cb77c87>Cancel</button></div>`);
          if (unref(isAdmin)) {
            _push2(`<div class="pt-2 border-t border-white/[0.06]" data-v-8cb77c87><button class="w-full text-xs text-red-500/60 hover:text-red-400 py-1.5 rounded-lg hover:bg-red-500/[0.06] transition-all" data-v-8cb77c87> Delete this product </button></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(deleteProductTarget)) {
          _push2(`<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-8cb77c87><div class="w-full max-w-sm rounded-2xl bg-[#161616] border border-red-500/20 p-6 space-y-4" data-v-8cb77c87><div class="flex items-start gap-3" data-v-8cb77c87><div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0" data-v-8cb77c87><svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8cb77c87><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-8cb77c87></path></svg></div><div class="flex-1" data-v-8cb77c87><h3 class="text-base font-bold text-gray-100" data-v-8cb77c87>Delete Product?</h3><p class="text-sm text-gray-400 mt-1" data-v-8cb77c87><span class="font-semibold text-gray-200" data-v-8cb77c87>${ssrInterpolate(unref(deleteProductTarget).name)}</span> and all its variants will be archived. </p></div></div><div class="flex gap-3" data-v-8cb77c87><button${ssrIncludeBooleanAttr(unref(deletingProduct)) ? " disabled" : ""} class="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 disabled:opacity-50 transition-all" data-v-8cb77c87>${ssrInterpolate(unref(deletingProduct) ? "Deleting\u2026" : "Yes, Delete")}</button><button class="btn-ghost text-xs" data-v-8cb77c87>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddVariant)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-8cb77c87><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-8cb77c87><div class="flex items-center justify-between" data-v-8cb77c87><h3 class="text-lg font-bold text-gray-100" data-v-8cb77c87>New Variant</h3><button class="text-gray-500 hover:text-gray-200" data-v-8cb77c87>\u2715</button></div><div class="grid grid-cols-2 gap-4" data-v-8cb77c87><div class="col-span-2 space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Pack Weight *</label><select class="field-input" data-v-8cb77c87><option value="37kg" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "37kg") : ssrLooseEqual(unref(newVariant).packWeight, "37kg")) ? " selected" : ""}>37 kg</option><option value="50kg" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "50kg") : ssrLooseEqual(unref(newVariant).packWeight, "50kg")) ? " selected" : ""}>50 kg</option><option value="55kg" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "55kg") : ssrLooseEqual(unref(newVariant).packWeight, "55kg")) ? " selected" : ""}>55 kg</option><option value="74kg" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "74kg") : ssrLooseEqual(unref(newVariant).packWeight, "74kg")) ? " selected" : ""}>74 kg</option></select></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Grade</label><select class="field-input" data-v-8cb77c87><option value="" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "") : ssrLooseEqual(unref(newVariant).grade, "")) ? " selected" : ""}>\u2014 None \u2014</option><option value="A" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "A") : ssrLooseEqual(unref(newVariant).grade, "A")) ? " selected" : ""}>Grade A</option><option value="B" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "B") : ssrLooseEqual(unref(newVariant).grade, "B")) ? " selected" : ""}>Grade B</option><option value="C" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "C") : ssrLooseEqual(unref(newVariant).grade, "C")) ? " selected" : ""}>Grade C</option><option value="R" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "R") : ssrLooseEqual(unref(newVariant).grade, "R")) ? " selected" : ""}>Grade R</option></select></div><div class="space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>UOM</label><select class="field-input" data-v-8cb77c87><option value="bag" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "bag") : ssrLooseEqual(unref(newVariant).uom, "bag")) ? " selected" : ""}>bag</option><option value="kg" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "kg") : ssrLooseEqual(unref(newVariant).uom, "kg")) ? " selected" : ""}>kg</option><option value="gm" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "gm") : ssrLooseEqual(unref(newVariant).uom, "gm")) ? " selected" : ""}>gm</option><option value="litre" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "litre") : ssrLooseEqual(unref(newVariant).uom, "litre")) ? " selected" : ""}>litre</option><option value="pcs" data-v-8cb77c87${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "pcs") : ssrLooseEqual(unref(newVariant).uom, "pcs")) ? " selected" : ""}>pcs</option></select></div><div class="col-span-2 space-y-1.5" data-v-8cb77c87><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8cb77c87>Barcode</label><input${ssrRenderAttr("value", unref(newVariant).barcode)} type="text" class="field-input font-mono" placeholder="EAN-13 or custom" data-v-8cb77c87></div></div><div class="flex gap-3 pt-2" data-v-8cb77c87><button${ssrIncludeBooleanAttr(unref(addingVariant)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-8cb77c87>${ssrInterpolate(unref(addingVariant) ? "Adding\u2026" : "Add Variant")}</button><button class="btn-ghost text-xs" data-v-8cb77c87>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8cb77c87"]]);

export { index as default };
//# sourceMappingURL=index-BU1hTPbV.mjs.map
