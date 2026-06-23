import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, watch, mergeProps, withCtx, createVNode, openBlock, createBlock, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrGetDirectiveProps, ssrGetDynamicModelProps, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { c as _export_sfc, p as useUserSession } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
      "$92syt1y5Gk"
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
    const engineData = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.engine) != null ? _b : null;
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
    const showAddVariant = ref(false);
    const addingVariant = ref(false);
    ref(null);
    const newVariant = reactive({ packWeight: "50kg", grade: "", uom: "bag", barcode: "" });
    const peGrades = computed(() => {
      var _a, _b;
      return (_b = (_a = engineData.value) == null ? void 0 : _a.grades) != null ? _b : [];
    });
    const peGradeData = computed(() => {
      var _a, _b;
      return (_b = (_a = engineData.value) == null ? void 0 : _a.gradeData) != null ? _b : {};
    });
    computed(() => {
      var _a, _b;
      return (_b = (_a = engineData.value) == null ? void 0 : _a.currentPrices) != null ? _b : {};
    });
    computed(() => {
      var _a, _b;
      return (_b = (_a = engineData.value) == null ? void 0 : _a.customCurrent) != null ? _b : {};
    });
    const peCustomAll = computed(() => {
      var _a, _b;
      const list = [];
      for (const [, wcs] of Object.entries(peGradeData.value)) {
        for (const item of (_a = wcs["custom"]) != null ? _a : []) {
          list.push(item);
          if (peCustomPrices[item.variant_id] === void 0)
            peCustomPrices[item.variant_id] = (_b = item.current_price) != null ? _b : null;
        }
      }
      return list;
    });
    const cfg = reactive({
      formula: { bag_50: 50, bag_74: 74, packaging_fee: 150 },
      branch_surcharges: {}
    });
    const base50 = reactive({});
    const peCustomPrices = reactive({});
    const savingConfig = ref(false);
    const peFlash = reactive({ msg: "", ok: true });
    watch(() => engineData.value, (ed) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      if (!ed) return;
      const c = ed.config;
      cfg.formula.bag_50 = (_b = (_a = c.formula) == null ? void 0 : _a.bag_50) != null ? _b : 50;
      cfg.formula.bag_74 = (_d = (_c = c.formula) == null ? void 0 : _c.bag_74) != null ? _d : 74;
      cfg.formula.packaging_fee = (_f = (_e = c.formula) == null ? void 0 : _e.packaging_fee) != null ? _f : 150;
      for (const b of (_h = (_g = data.value) == null ? void 0 : _g.branches) != null ? _h : []) {
        cfg.branch_surcharges[b.id] = {
          surcharge_50: (_k = (_j = (_i = c.branch_surcharges) == null ? void 0 : _i[b.id]) == null ? void 0 : _j.surcharge_50) != null ? _k : 0,
          surcharge_74: (_n = (_m = (_l = c.branch_surcharges) == null ? void 0 : _l[b.id]) == null ? void 0 : _m.surcharge_74) != null ? _n : 0
        };
      }
      for (const g of (_o = ed.grades) != null ? _o : []) {
        if (base50[g] === void 0) base50[g] = (_q = (_p = ed.current50) == null ? void 0 : _p[g]) != null ? _q : null;
      }
    }, { immediate: true });
    function calc74(b50) {
      return Math.round((b50 / cfg.formula.bag_50 * cfg.formula.bag_74 + cfg.formula.packaging_fee) * 100) / 100;
    }
    function calc74For(grade) {
      const v = Number(base50[grade]);
      if (!v || v <= 0) return "\u2014";
      return "\u09F3" + fmt(calc74(v));
    }
    function fmt(n) {
      if (n == null || isNaN(Number(n))) return "\u2014";
      return Number(n).toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    const pePreview = reactive({});
    function recalcPreview() {
      var _a, _b, _c;
      for (const grade of peGrades.value) {
        const b50 = Number(base50[grade]);
        if (!b50 || b50 <= 0) {
          pePreview[grade] = { base50: "\u2014", base74: "\u2014", branches: {} };
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
        pePreview[grade] = { base50: "\u09F3" + fmt(b50), base74: "\u09F3" + fmt(b74), branches: brs };
      }
    }
    watch([base50, cfg], recalcPreview, { deep: true, immediate: true });
    const peReviewOpen = ref(false);
    const peReviewRows = ref([]);
    const applying = ref(false);
    const peReviewStats = computed(() => {
      let increases = 0, decreases = 0, unchanged = 0, isNew = 0;
      for (const r of peReviewRows.value) {
        if (r.delta === null) isNew++;
        else if (r.delta > 5e-3) increases++;
        else if (r.delta < -5e-3) decreases++;
        else unchanged++;
      }
      return { increases, decreases, unchanged, isNew };
    });
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
      let _temp0, _temp1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))} data-v-8ebe66a5>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Products",
        subtitle: "Base products \xB7 grades \xB7 variants \xB7 pricing \xB7 inventory",
        breadcrumb: ["Products"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2" data-v-8ebe66a5${_scopeId}><a href="/api/products/export/csv" download class="btn-ghost text-xs flex items-center gap-1.5" data-v-8ebe66a5${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8ebe66a5${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" data-v-8ebe66a5${_scopeId}></path></svg> Export CSV </a><button class="btn-gold text-xs flex items-center gap-1.5" data-v-8ebe66a5${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8ebe66a5${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" data-v-8ebe66a5${_scopeId}></path></svg> New Product </button></div>`);
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
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-3" data-v-8ebe66a5><!--[-->`);
      ssrRenderList(unref(kpis), (k) => {
        _push(`<div class="glass-card p-4 flex items-center gap-3 overflow-hidden relative group hover:ring-1 hover:ring-white/[0.06] transition-all duration-200" data-v-8ebe66a5><div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110" style="${ssrRenderStyle(`background:${k.bg};border:1px solid ${k.border}`)}" data-v-8ebe66a5><span class="text-xl leading-none" data-v-8ebe66a5>${ssrInterpolate(k.icon)}</span></div><div data-v-8ebe66a5><p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold" data-v-8ebe66a5>${ssrInterpolate(k.label)}</p><p class="${ssrRenderClass([k.color, "text-2xl font-black tabular-nums"])}" data-v-8ebe66a5>${ssrInterpolate(k.val)}</p><p class="text-[10px] text-gray-600" data-v-8ebe66a5>${ssrInterpolate(k.sub)}</p></div></div>`);
      });
      _push(`<!--]--></div><div class="flex items-center justify-between flex-wrap gap-3" data-v-8ebe66a5><div class="flex gap-1 p-1 bg-white/[0.03] rounded-2xl border border-white/[0.06]" data-v-8ebe66a5><button class="${ssrRenderClass([unref(tab) === "catalog" ? "bg-white/[0.09] text-gray-100 shadow-sm" : "text-gray-500 hover:text-gray-300", "px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2"])}" data-v-8ebe66a5><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8ebe66a5><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" data-v-8ebe66a5></path></svg> Catalog </button>`);
      if (unref(isAdmin)) {
        _push(`<button class="${ssrRenderClass([unref(tab) === "pricing" ? "bg-white/[0.09] text-gray-100 shadow-sm" : "text-gray-500 hover:text-gray-300", "px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2"])}" data-v-8ebe66a5><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8ebe66a5><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-8ebe66a5></path></svg> Pricing Engine <span class="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20" data-v-8ebe66a5>ADMIN</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(tab) === "catalog") {
        _push(`<div data-v-8ebe66a5><div class="relative" data-v-8ebe66a5><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8ebe66a5><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" data-v-8ebe66a5></path></svg><input${ssrRenderAttr("value", unref(search))} placeholder="Search product, SKU, pack\u2026" class="input-glass pl-9 pr-3 py-1.5 text-xs w-56" data-v-8ebe66a5></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center space-y-3" data-v-8ebe66a5><div class="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto" data-v-8ebe66a5></div><p class="text-xs text-gray-500" data-v-8ebe66a5>Loading\u2026</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-8ebe66a5>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        if (unref(tab) === "catalog") {
          _push(`<div class="space-y-5" data-v-8ebe66a5><div class="flex items-center gap-1.5 flex-wrap" data-v-8ebe66a5><!--[-->`);
          ssrRenderList(["All", ...unref(catalogGrades)], (g) => {
            var _a, _b;
            _push(`<button class="${ssrRenderClass([unref(gradeTab) === g ? gradePillActive(g) : "bg-white/[0.03] border-white/[0.07] text-gray-500 hover:text-gray-300 hover:border-white/[0.12]", "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"])}" data-v-8ebe66a5>`);
            if (g !== "All") {
              _push(`<span class="${ssrRenderClass([unref(gradeTab) === g ? gradeBadge(g) : "bg-white/[0.06] border-white/[0.10] text-gray-500", "inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-black border"])}" data-v-8ebe66a5>${ssrInterpolate(g)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(` ${ssrInterpolate(g === "All" ? "All Grades" : `Grade ${g}`)} <span class="text-[10px] opacity-50 tabular-nums" data-v-8ebe66a5>${ssrInterpolate(g === "All" ? unref(allCatalogVariants).length : (_b = (_a = unref(variantsByGrade)[g]) == null ? void 0 : _a.length) != null ? _b : 0)}</span></button>`);
          });
          _push(`<!--]-->`);
          if (unref(ungradedFiltered).length) {
            _push(`<div class="h-4 w-px bg-white/[0.08] mx-1" data-v-8ebe66a5></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(ungradedFiltered).length) {
            _push(`<button class="${ssrRenderClass([unref(gradeTab) === "?" ? "bg-white/[0.08] border-white/[0.14] text-gray-300" : "bg-white/[0.03] border-white/[0.07] text-gray-600 hover:text-gray-400", "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"])}" data-v-8ebe66a5> Ungraded <span class="text-[10px] opacity-50" data-v-8ebe66a5>${ssrInterpolate(unref(ungradedFiltered).length)}</span></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><!--[-->`);
          ssrRenderList(unref(displayedGradeKeys), (grade) => {
            _push(`<!--[-->`);
            if (unref(gradeTab) === "All") {
              _push(`<div class="flex items-center gap-3" data-v-8ebe66a5><span class="${ssrRenderClass([gradeBadge(grade), "inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm border shrink-0"])}" data-v-8ebe66a5>${ssrInterpolate(grade)}</span><div data-v-8ebe66a5><h3 class="font-semibold text-gray-300 text-sm" data-v-8ebe66a5>Grade ${ssrInterpolate(grade)}</h3><p class="text-[11px] text-gray-600" data-v-8ebe66a5>${ssrInterpolate(filteredByGrade(grade).length)} variant${ssrInterpolate(filteredByGrade(grade).length !== 1 ? "s" : "")} \xB7 ${ssrInterpolate(productCountForGrade(grade))} product${ssrInterpolate(productCountForGrade(grade) !== 1 ? "s" : "")}</p></div><div class="flex-1 h-px bg-white/[0.05]" data-v-8ebe66a5></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" data-v-8ebe66a5><!--[-->`);
            ssrRenderList(filteredByGrade(grade), (v) => {
              _push(`<div class="rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden flex flex-col hover:border-white/[0.10] hover:bg-white/[0.035] transition-all duration-200" data-v-8ebe66a5><div class="px-4 pt-3.5 pb-3 border-b border-white/[0.05]" data-v-8ebe66a5><div class="flex items-start justify-between gap-2 mb-2.5" data-v-8ebe66a5><p class="font-bold text-gray-200 text-sm leading-tight flex-1 min-w-0" data-v-8ebe66a5>${ssrInterpolate(v.product_name)}</p><span class="${ssrRenderClass([categoryPill(v.category), "px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"])}" data-v-8ebe66a5>${ssrInterpolate(v.category)}</span></div><div class="flex items-center gap-2 flex-wrap" data-v-8ebe66a5><span class="${ssrRenderClass([packBadge(v.weight_variant), "px-2.5 py-0.5 rounded-lg text-[11px] font-black"])}" data-v-8ebe66a5>${ssrInterpolate(v.weight_variant)}</span><span class="${ssrRenderClass([gradeBadge(grade), "inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black border"])}" data-v-8ebe66a5>${ssrInterpolate(grade)}</span>`);
              if (v.sku) {
                _push(`<span class="font-mono text-[10px] text-gray-600 truncate" data-v-8ebe66a5>${ssrInterpolate(v.sku)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div><div class="px-4 py-3 flex-1 space-y-1.5" data-v-8ebe66a5><!--[-->`);
              ssrRenderList(unref(branches), (b) => {
                var _a;
                _push(`<div class="flex items-center gap-2 group/pr" data-v-8ebe66a5><span class="text-[10px] font-semibold text-gray-600 w-10 shrink-0 uppercase tracking-wide" data-v-8ebe66a5>${ssrInterpolate(b.code)}</span><div class="flex-1 h-px bg-white/[0.04]" data-v-8ebe66a5></div>`);
                if (unref(editingCell) === `${v.id}:${b.id}`) {
                  _push(`<div class="flex items-center gap-1" data-v-8ebe66a5><span class="text-gold-500/80 text-[10px]" data-v-8ebe66a5>\u09F3</span><input${ssrRenderAttrs((_temp0 = mergeProps({
                    value: unref(editingValue),
                    type: "number",
                    min: "0",
                    step: "1",
                    class: "w-20 bg-transparent border-b border-gold-500 text-right text-xs font-mono font-bold text-gold-300 outline-none appearance-none"
                  }, ssrGetDirectiveProps(_ctx, vAutofocus)), mergeProps(_temp0, ssrGetDynamicModelProps(_temp0, unref(editingValue)))))} data-v-8ebe66a5><button${ssrIncludeBooleanAttr(unref(savingCell)) ? " disabled" : ""} class="text-emerald-400 text-xs leading-none disabled:opacity-40" data-v-8ebe66a5>\u2713</button><button class="text-gray-600 text-xs leading-none hover:text-gray-400" data-v-8ebe66a5>\u2715</button></div>`);
                } else {
                  _push(`<button class="transition-all duration-100" data-v-8ebe66a5>`);
                  if ((_a = v.prices[b.id]) == null ? void 0 : _a.unit_price) {
                    _push(`<span class="font-mono font-bold text-xs text-gold-400 group-hover/pr:text-gold-300 tabular-nums" data-v-8ebe66a5> \u09F3${ssrInterpolate(Number(v.prices[b.id].unit_price).toLocaleString())}</span>`);
                  } else {
                    _push(`<span class="text-[10px] text-gray-700 border border-dashed border-gray-700/50 group-hover/pr:border-gold-500/40 group-hover/pr:text-gold-500/60 rounded px-1.5 py-0.5 transition-all" data-v-8ebe66a5> + Set </span>`);
                  }
                  _push(`</button>`);
                }
                _push(`</div>`);
              });
              _push(`<!--]--></div><div class="px-4 py-2.5 border-t border-white/[0.04] flex items-center gap-2.5" data-v-8ebe66a5><div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden" data-v-8ebe66a5><div class="${ssrRenderClass([stockBarColor(v), "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${stockPct(v)}%`)}" data-v-8ebe66a5></div></div><span class="${ssrRenderClass([availColor(v), "text-[10px] font-mono tabular-nums shrink-0"])}" data-v-8ebe66a5>${ssrInterpolate(Number(v.stock_qty || 0).toLocaleString())}</span>`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/products/${v.product_id}/${v.id}/pricing`,
                class: "text-gray-700 hover:text-gold-400 transition-colors shrink-0",
                title: "Open pricing"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8ebe66a5${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-8ebe66a5${_scopeId}></path></svg>`);
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
              _push(`<div class="flex items-center gap-3" data-v-8ebe66a5><div class="w-8 h-8 rounded-lg bg-gray-500/10 border border-gray-500/20 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0" data-v-8ebe66a5>?</div><div data-v-8ebe66a5><h3 class="font-semibold text-gray-500 text-sm" data-v-8ebe66a5>Ungraded</h3><p class="text-[11px] text-gray-600" data-v-8ebe66a5>${ssrInterpolate(unref(ungradedFiltered).length)} variant${ssrInterpolate(unref(ungradedFiltered).length !== 1 ? "s" : "")}</p></div><div class="flex-1 h-px bg-white/[0.05]" data-v-8ebe66a5></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3" data-v-8ebe66a5><!--[-->`);
            ssrRenderList(unref(ungradedFiltered), (v) => {
              _push(`<div class="rounded-2xl border border-white/[0.06] bg-white/[0.025] overflow-hidden flex flex-col hover:border-white/[0.10] hover:bg-white/[0.035] transition-all duration-200" data-v-8ebe66a5><div class="px-4 pt-3.5 pb-3 border-b border-white/[0.05]" data-v-8ebe66a5><div class="flex items-start justify-between gap-2 mb-2.5" data-v-8ebe66a5><p class="font-bold text-gray-200 text-sm leading-tight flex-1 min-w-0" data-v-8ebe66a5>${ssrInterpolate(v.product_name)}</p><span class="${ssrRenderClass([categoryPill(v.category), "px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"])}" data-v-8ebe66a5>${ssrInterpolate(v.category)}</span></div><div class="flex items-center gap-2" data-v-8ebe66a5><span class="${ssrRenderClass([packBadge(v.weight_variant), "px-2.5 py-0.5 rounded-lg text-[11px] font-black"])}" data-v-8ebe66a5>${ssrInterpolate(v.weight_variant)}</span>`);
              if (v.sku) {
                _push(`<span class="font-mono text-[10px] text-gray-600" data-v-8ebe66a5>${ssrInterpolate(v.sku)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div><div class="px-4 py-3 flex-1 space-y-1.5" data-v-8ebe66a5><!--[-->`);
              ssrRenderList(unref(branches), (b) => {
                var _a;
                _push(`<div class="flex items-center gap-2 group/pr" data-v-8ebe66a5><span class="text-[10px] font-semibold text-gray-600 w-10 shrink-0 uppercase tracking-wide" data-v-8ebe66a5>${ssrInterpolate(b.code)}</span><div class="flex-1 h-px bg-white/[0.04]" data-v-8ebe66a5></div>`);
                if (unref(editingCell) === `${v.id}:${b.id}`) {
                  _push(`<div class="flex items-center gap-1" data-v-8ebe66a5><span class="text-gold-500/80 text-[10px]" data-v-8ebe66a5>\u09F3</span><input${ssrRenderAttrs((_temp1 = mergeProps({
                    value: unref(editingValue),
                    type: "number",
                    min: "0",
                    step: "1",
                    class: "w-20 bg-transparent border-b border-gold-500 text-right text-xs font-mono font-bold text-gold-300 outline-none appearance-none"
                  }, ssrGetDirectiveProps(_ctx, vAutofocus)), mergeProps(_temp1, ssrGetDynamicModelProps(_temp1, unref(editingValue)))))} data-v-8ebe66a5><button${ssrIncludeBooleanAttr(unref(savingCell)) ? " disabled" : ""} class="text-emerald-400 text-xs disabled:opacity-40" data-v-8ebe66a5>\u2713</button><button class="text-gray-600 text-xs hover:text-gray-400" data-v-8ebe66a5>\u2715</button></div>`);
                } else {
                  _push(`<button class="transition-all duration-100" data-v-8ebe66a5>`);
                  if ((_a = v.prices[b.id]) == null ? void 0 : _a.unit_price) {
                    _push(`<span class="font-mono font-bold text-xs text-gold-400 group-hover/pr:text-gold-300 tabular-nums" data-v-8ebe66a5>\u09F3${ssrInterpolate(Number(v.prices[b.id].unit_price).toLocaleString())}</span>`);
                  } else {
                    _push(`<span class="text-[10px] text-gray-700 border border-dashed border-gray-700/50 group-hover/pr:border-gold-500/40 group-hover/pr:text-gold-500/60 rounded px-1.5 py-0.5 transition-all" data-v-8ebe66a5>+ Set</span>`);
                  }
                  _push(`</button>`);
                }
                _push(`</div>`);
              });
              _push(`<!--]--></div><div class="px-4 py-2.5 border-t border-white/[0.04] flex items-center gap-2.5" data-v-8ebe66a5><div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden" data-v-8ebe66a5><div class="${ssrRenderClass([stockBarColor(v), "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${stockPct(v)}%`)}" data-v-8ebe66a5></div></div><span class="${ssrRenderClass([availColor(v), "text-[10px] font-mono tabular-nums shrink-0"])}" data-v-8ebe66a5>${ssrInterpolate(Number(v.stock_qty || 0).toLocaleString())}</span>`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/products/${v.product_id}/${v.id}/pricing`,
                class: "text-gray-700 hover:text-gold-400 transition-colors shrink-0"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8ebe66a5${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-8ebe66a5${_scopeId}></path></svg>`);
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
            _push(`<div class="glass-card p-14 text-center space-y-3" data-v-8ebe66a5><div class="text-5xl" data-v-8ebe66a5>\u{1F4E6}</div><p class="text-gray-400 font-semibold" data-v-8ebe66a5>No variants found</p><p class="text-xs text-gray-600" data-v-8ebe66a5>Try adjusting your search or grade filter</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (unref(tab) === "pricing") {
          _push(`<div class="space-y-5" data-v-8ebe66a5>`);
          if (unref(peFlash).msg) {
            _push(`<div class="${ssrRenderClass([unref(peFlash).ok ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-300", "px-4 py-3 text-sm border rounded-xl flex items-start gap-2"])}" data-v-8ebe66a5><span data-v-8ebe66a5>${ssrInterpolate(unref(peFlash).ok ? "\u2713" : "\u2717")}</span><span data-v-8ebe66a5>${ssrInterpolate(unref(peFlash).msg)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="glass-card p-0 overflow-hidden" data-v-8ebe66a5><div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between" data-v-8ebe66a5><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2" data-v-8ebe66a5><svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8ebe66a5><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" data-v-8ebe66a5></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" data-v-8ebe66a5></path></svg> Formula &amp; Branch Surcharges </h2><button${ssrIncludeBooleanAttr(unref(savingConfig)) ? " disabled" : ""} class="btn-gold text-xs px-4 py-1.5 disabled:opacity-50" data-v-8ebe66a5>${ssrInterpolate(unref(savingConfig) ? "Saving\u2026" : "Save Config")}</button></div><div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-8" data-v-8ebe66a5><div data-v-8ebe66a5><p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3" data-v-8ebe66a5>74 kg Auto-Price Formula</p><div class="rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-3 font-mono text-xs text-blue-300 mb-4" data-v-8ebe66a5> price_74 = (price_50 \xF7 <strong data-v-8ebe66a5>${ssrInterpolate(unref(cfg).formula.bag_50)}</strong>) \xD7 <strong data-v-8ebe66a5>${ssrInterpolate(unref(cfg).formula.bag_74)}</strong> + <strong data-v-8ebe66a5>${ssrInterpolate(unref(cfg).formula.packaging_fee)}</strong></div><div class="grid grid-cols-3 gap-3" data-v-8ebe66a5><div data-v-8ebe66a5><label class="block text-[11px] text-gray-500 mb-1" data-v-8ebe66a5>Bag size 50 kg</label><input${ssrRenderAttr("value", unref(cfg).formula.bag_50)} type="number" min="1" class="input-glass w-full text-xs py-1.5 text-center font-mono" data-v-8ebe66a5></div><div data-v-8ebe66a5><label class="block text-[11px] text-gray-500 mb-1" data-v-8ebe66a5>Bag size 74 kg</label><input${ssrRenderAttr("value", unref(cfg).formula.bag_74)} type="number" min="1" class="input-glass w-full text-xs py-1.5 text-center font-mono" data-v-8ebe66a5></div><div data-v-8ebe66a5><label class="block text-[11px] text-gray-500 mb-1" data-v-8ebe66a5>Packaging (\u09F3)</label><input${ssrRenderAttr("value", unref(cfg).formula.packaging_fee)} type="number" step="0.01" class="input-glass w-full text-xs py-1.5 text-center font-mono" data-v-8ebe66a5></div></div></div><div data-v-8ebe66a5><p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3" data-v-8ebe66a5>Branch Surcharges (\u09F3)</p><table class="w-full text-xs" data-v-8ebe66a5><thead data-v-8ebe66a5><tr class="text-gray-600 border-b border-white/[0.04] text-[11px]" data-v-8ebe66a5><th class="pb-2 text-left font-medium" data-v-8ebe66a5>Branch</th><th class="pb-2 text-center font-medium" data-v-8ebe66a5>50 kg</th><th class="pb-2 text-center font-medium" data-v-8ebe66a5>74 kg</th></tr></thead><tbody class="divide-y divide-white/[0.03]" data-v-8ebe66a5><!--[-->`);
          ssrRenderList(unref(branches), (b) => {
            _push(`<tr data-v-8ebe66a5><td class="py-1.5 text-gray-300 font-medium" data-v-8ebe66a5>${ssrInterpolate(b.name)} <span class="text-gray-600 text-[10px] ml-1" data-v-8ebe66a5>(${ssrInterpolate(b.code)})</span></td><td class="py-1.5 px-2" data-v-8ebe66a5><input${ssrRenderAttr("value", unref(cfg).branch_surcharges[b.id].surcharge_50)} type="number" step="0.01" class="input-glass w-full text-xs py-1 text-center font-mono" data-v-8ebe66a5></td><td class="py-1.5 px-2" data-v-8ebe66a5><input${ssrRenderAttr("value", unref(cfg).branch_surcharges[b.id].surcharge_74)} type="number" step="0.01" class="input-glass w-full text-xs py-1 text-center font-mono" data-v-8ebe66a5></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div></div></div><div class="glass-card p-0 overflow-hidden" data-v-8ebe66a5><div class="px-5 py-3.5 border-b border-white/[0.06]" data-v-8ebe66a5><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2" data-v-8ebe66a5><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-black" data-v-8ebe66a5>1</span> Set Base 50 kg Price per Grade </h2><p class="text-xs text-gray-500 mt-0.5" data-v-8ebe66a5>74 kg is auto-calculated from the formula above.</p></div><div class="p-5 space-y-4" data-v-8ebe66a5><!--[-->`);
          ssrRenderList(unref(peGrades), (grade) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            _push(`<div class="border border-white/[0.06] rounded-xl overflow-hidden hover:border-white/[0.10] transition-colors" data-v-8ebe66a5><div class="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border-b border-white/[0.05]" data-v-8ebe66a5><span class="${ssrRenderClass([gradeBadge(grade), "inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg border"])}" data-v-8ebe66a5>${ssrInterpolate(grade)}</span><div data-v-8ebe66a5><p class="font-bold text-gray-200 text-sm" data-v-8ebe66a5>Grade ${ssrInterpolate(grade)}</p><p class="text-[11px] text-gray-600" data-v-8ebe66a5>${ssrInterpolate(((_b = (_a = unref(peGradeData)[grade]) == null ? void 0 : _a["50"]) != null ? _b : []).length)} \xD7 50 kg \xB7 ${ssrInterpolate(((_d = (_c = unref(peGradeData)[grade]) == null ? void 0 : _c["74"]) != null ? _d : []).length)} \xD7 74 kg </p></div></div><div class="p-4 grid grid-cols-1 lg:grid-cols-3 gap-5" data-v-8ebe66a5><div class="flex flex-col justify-center" data-v-8ebe66a5><label class="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide" data-v-8ebe66a5>Base 50 kg Price (\u09F3)</label><input${ssrRenderAttr("value", unref(base50)[grade])} type="number" step="0.01" min="0" placeholder="Enter price\u2026" class="input-glass w-full py-3 text-center font-black text-xl text-gold-300" data-v-8ebe66a5><div class="mt-2 text-center text-xs text-gray-500" data-v-8ebe66a5> 74 kg auto \u2192 <span class="font-bold text-purple-400" data-v-8ebe66a5>${ssrInterpolate(calc74For(grade))}</span></div></div><div data-v-8ebe66a5><p class="text-[11px] font-semibold text-blue-400 uppercase tracking-wide mb-2" data-v-8ebe66a5>50 kg Products</p>`);
            if (!((_f = (_e = unref(peGradeData)[grade]) == null ? void 0 : _e["50"]) == null ? void 0 : _f.length)) {
              _push(`<div class="text-xs text-gray-600 italic" data-v-8ebe66a5>None</div>`);
            } else {
              _push(`<div class="space-y-1 max-h-32 overflow-y-auto pr-1" data-v-8ebe66a5><!--[-->`);
              ssrRenderList(unref(peGradeData)[grade]["50"], (v) => {
                _push(`<div class="flex items-start gap-2 bg-blue-500/10 rounded-lg px-2.5 py-1.5" data-v-8ebe66a5><span class="text-blue-400/80 text-[10px] mt-0.5 shrink-0" data-v-8ebe66a5>\u{1F4E6}</span><div class="min-w-0" data-v-8ebe66a5><p class="text-xs font-medium text-gray-300 truncate" data-v-8ebe66a5>${ssrInterpolate(v.product_name)}</p><p class="text-[10px] text-gray-600" data-v-8ebe66a5>${ssrInterpolate(v.sku)} `);
                if (v.current_price !== null) {
                  _push(`<span data-v-8ebe66a5> \xB7 \u09F3${ssrInterpolate(fmt(v.current_price))}</span>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</p></div></div>`);
              });
              _push(`<!--]--></div>`);
            }
            _push(`</div><div data-v-8ebe66a5><p class="text-[11px] font-semibold text-purple-400 uppercase tracking-wide mb-2" data-v-8ebe66a5>74 kg (auto)</p>`);
            if (!((_h = (_g = unref(peGradeData)[grade]) == null ? void 0 : _g["74"]) == null ? void 0 : _h.length)) {
              _push(`<div class="text-xs text-gray-600 italic" data-v-8ebe66a5>None</div>`);
            } else {
              _push(`<div class="space-y-1 max-h-32 overflow-y-auto pr-1" data-v-8ebe66a5><!--[-->`);
              ssrRenderList(unref(peGradeData)[grade]["74"], (v) => {
                _push(`<div class="flex items-start gap-2 bg-purple-500/10 rounded-lg px-2.5 py-1.5" data-v-8ebe66a5><span class="text-purple-400/80 text-[10px] mt-0.5 shrink-0" data-v-8ebe66a5>\u{1F4E6}</span><div class="min-w-0" data-v-8ebe66a5><p class="text-xs font-medium text-gray-300 truncate" data-v-8ebe66a5>${ssrInterpolate(v.product_name)}</p><p class="text-[10px] text-gray-600" data-v-8ebe66a5>${ssrInterpolate(v.sku)} `);
                if (v.current_price !== null) {
                  _push(`<span data-v-8ebe66a5> \xB7 \u09F3${ssrInterpolate(fmt(v.current_price))}</span>`);
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
          if (unref(peCustomAll).length) {
            _push(`<div class="glass-card p-0 overflow-hidden border border-amber-500/20" data-v-8ebe66a5><div class="px-5 py-3.5 border-b border-amber-500/20 bg-amber-500/5" data-v-8ebe66a5><h2 class="text-sm font-bold text-amber-300 flex items-center gap-2" data-v-8ebe66a5><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black" data-v-8ebe66a5>2</span> Custom-Weight Products \u2014 Manual Price </h2><p class="text-xs text-amber-500/70 mt-0.5" data-v-8ebe66a5>Formula doesn&#39;t apply. Enter flat price per bag.</p></div><div class="p-5" data-v-8ebe66a5><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-v-8ebe66a5><!--[-->`);
            ssrRenderList(unref(peCustomAll), (item) => {
              _push(`<div class="border border-white/[0.06] rounded-xl p-4 hover:border-amber-500/30 transition-colors" data-v-8ebe66a5><p class="text-xs font-semibold text-gray-300 truncate" data-v-8ebe66a5>${ssrInterpolate(item.product_name)}</p><div class="flex items-center gap-2 mt-1 mb-3" data-v-8ebe66a5><span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-medium" data-v-8ebe66a5>${ssrInterpolate(item.weight_variant)} ${ssrInterpolate(item.uom)}</span><span class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-gray-500" data-v-8ebe66a5>Grade ${ssrInterpolate(item.grade)}</span></div><label class="block text-[11px] text-gray-500 mb-1" data-v-8ebe66a5>Price per bag (\u09F3)</label><input${ssrRenderAttr("value", unref(peCustomPrices)[item.variant_id])} type="number" step="0.01" min="0" placeholder="Enter price\u2026" class="input-glass w-full text-xs py-2 text-center font-mono font-bold" data-v-8ebe66a5>`);
              if (item.current_price !== null) {
                _push(`<p class="mt-1 text-[10px] text-gray-600 text-center" data-v-8ebe66a5> Current: \u09F3${ssrInterpolate(fmt(item.current_price))}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="glass-card p-0 overflow-hidden" data-v-8ebe66a5><div class="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between" data-v-8ebe66a5><h2 class="text-sm font-bold text-gray-200 flex items-center gap-2" data-v-8ebe66a5><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-black" data-v-8ebe66a5>${ssrInterpolate(unref(peCustomAll).length ? "3" : "2")}</span> Live Price Preview <span class="text-xs font-normal text-gray-600 ml-1" data-v-8ebe66a5>\u2014 updates as you type</span></h2></div><div class="overflow-x-auto" data-v-8ebe66a5><table class="w-full text-xs" data-v-8ebe66a5><thead class="border-b border-white/[0.06]" data-v-8ebe66a5><tr data-v-8ebe66a5><th class="px-4 py-2.5 text-left text-gray-600 font-semibold uppercase tracking-wider sticky left-0 bg-[#0f1117] min-w-[90px]" data-v-8ebe66a5>Grade</th><th class="px-3 py-2.5 text-center text-blue-400 font-semibold bg-blue-500/5 min-w-[90px]" data-v-8ebe66a5>Base 50</th><th class="px-3 py-2.5 text-center text-purple-400 font-semibold bg-purple-500/5 min-w-[90px]" data-v-8ebe66a5>Base 74</th><!--[-->`);
          ssrRenderList(unref(branches), (b) => {
            _push(`<!--[--><th class="px-3 py-2.5 text-center text-blue-400/70 font-semibold bg-blue-500/5 min-w-[90px]" data-v-8ebe66a5>${ssrInterpolate(b.code)}<br data-v-8ebe66a5><span class="text-[10px] font-normal text-gray-600" data-v-8ebe66a5>50 kg</span></th><th class="px-3 py-2.5 text-center text-purple-400/70 font-semibold bg-purple-500/5 min-w-[90px]" data-v-8ebe66a5>${ssrInterpolate(b.code)}<br data-v-8ebe66a5><span class="text-[10px] font-normal text-gray-600" data-v-8ebe66a5>74 kg</span></th><!--]-->`);
          });
          _push(`<!--]--></tr></thead><tbody class="divide-y divide-white/[0.03]" data-v-8ebe66a5><!--[-->`);
          ssrRenderList(unref(peGrades), (grade) => {
            var _a, _b, _c, _d;
            _push(`<tr class="hover:bg-white/[0.02]" data-v-8ebe66a5><td class="px-4 py-2.5 font-bold text-gray-300 sticky left-0 bg-[#0f1117]" data-v-8ebe66a5>Grade ${ssrInterpolate(grade)}</td><td class="px-3 py-2.5 text-center bg-blue-500/5 font-semibold text-blue-300" data-v-8ebe66a5>${ssrInterpolate((_b = (_a = unref(pePreview)[grade]) == null ? void 0 : _a.base50) != null ? _b : "\u2014")}</td><td class="px-3 py-2.5 text-center bg-purple-500/5 font-semibold text-purple-300" data-v-8ebe66a5>${ssrInterpolate((_d = (_c = unref(pePreview)[grade]) == null ? void 0 : _c.base74) != null ? _d : "\u2014")}</td><!--[-->`);
            ssrRenderList(unref(branches), (b) => {
              var _a2, _b2, _c2, _d2, _e, _f;
              _push(`<!--[--><td class="px-3 py-2.5 text-center bg-blue-500/5 text-blue-300/80" data-v-8ebe66a5>${ssrInterpolate((_c2 = (_b2 = (_a2 = unref(pePreview)[grade]) == null ? void 0 : _a2.branches[b.id]) == null ? void 0 : _b2.p50) != null ? _c2 : "\u2014")}</td><td class="px-3 py-2.5 text-center bg-purple-500/5 text-purple-300/80" data-v-8ebe66a5>${ssrInterpolate((_f = (_e = (_d2 = unref(pePreview)[grade]) == null ? void 0 : _d2.branches[b.id]) == null ? void 0 : _e.p74) != null ? _f : "\u2014")}</td><!--]-->`);
            });
            _push(`<!--]--></tr>`);
          });
          _push(`<!--]--></tbody></table></div></div><div class="glass-card p-5 flex items-center justify-between flex-wrap gap-4" data-v-8ebe66a5><div data-v-8ebe66a5><p class="font-bold text-gray-200 text-sm flex items-center gap-2" data-v-8ebe66a5><span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-black text-[10px] font-black" data-v-8ebe66a5>${ssrInterpolate(unref(peCustomAll).length ? "4" : "3")}</span> Review &amp; Apply All Prices </p><p class="text-xs text-gray-500 mt-0.5" data-v-8ebe66a5>Review the full before/after comparison before writing to DB.</p></div><div class="flex items-center gap-3" data-v-8ebe66a5><button class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors" data-v-8ebe66a5> \u21BA Reset </button><button class="btn-gold text-xs px-5 py-2" data-v-8ebe66a5> \u{1F50D} Review Changes </button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddProduct)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-8ebe66a5><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-8ebe66a5><div class="flex items-center justify-between" data-v-8ebe66a5><h3 class="text-lg font-bold text-gray-100" data-v-8ebe66a5>New Base Product</h3><button class="text-gray-500 hover:text-gray-200" data-v-8ebe66a5>\u2715</button></div><div class="space-y-4" data-v-8ebe66a5><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Product Name *</label><input${ssrRenderAttr("value", unref(newProduct).name)} type="text" class="input-glass" placeholder="e.g. 2Hati Moida" data-v-8ebe66a5></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Base SKU</label><input${ssrRenderAttr("value", unref(newProduct).base_sku)} type="text" class="input-glass font-mono uppercase" placeholder="e.g. UFF" data-v-8ebe66a5></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Category *</label><select class="input-glass" data-v-8ebe66a5><option value="Flour" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Flour") : ssrLooseEqual(unref(newProduct).category, "Flour")) ? " selected" : ""}>Flour (Moida)</option><option value="Atta" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Atta") : ssrLooseEqual(unref(newProduct).category, "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Bran") : ssrLooseEqual(unref(newProduct).category, "Bran")) ? " selected" : ""}>Bran (Vushi)</option><option value="Semolina" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Semolina") : ssrLooseEqual(unref(newProduct).category, "Semolina")) ? " selected" : ""}>Semolina (Sooji)</option></select></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Description</label><textarea rows="2" class="input-glass resize-none" data-v-8ebe66a5>${ssrInterpolate(unref(newProduct).description)}</textarea></div></div><div class="flex gap-3 pt-2" data-v-8ebe66a5><button${ssrIncludeBooleanAttr(!unref(newProduct).name || unref(addingProduct)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-8ebe66a5>${ssrInterpolate(unref(addingProduct) ? "Adding\u2026" : "Add Product")}</button><button class="btn-ghost text-xs" data-v-8ebe66a5>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showEditProduct)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-8ebe66a5><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-8ebe66a5><div class="flex items-center justify-between" data-v-8ebe66a5><h3 class="text-lg font-bold text-gray-100" data-v-8ebe66a5>Edit Product</h3><button class="text-gray-500 hover:text-gray-200" data-v-8ebe66a5>\u2715</button></div><div class="space-y-4" data-v-8ebe66a5><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Product Name *</label><input${ssrRenderAttr("value", unref(editProductForm).name)} type="text" class="input-glass" data-v-8ebe66a5></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Base SKU</label><input${ssrRenderAttr("value", unref(editProductForm).base_sku)} type="text" class="input-glass font-mono uppercase" placeholder="e.g. UFF" data-v-8ebe66a5></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Category *</label><select class="input-glass" data-v-8ebe66a5><option value="Flour" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).category) ? ssrLooseContain(unref(editProductForm).category, "Flour") : ssrLooseEqual(unref(editProductForm).category, "Flour")) ? " selected" : ""}>Flour (Moida)</option><option value="Atta" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).category) ? ssrLooseContain(unref(editProductForm).category, "Atta") : ssrLooseEqual(unref(editProductForm).category, "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).category) ? ssrLooseContain(unref(editProductForm).category, "Bran") : ssrLooseEqual(unref(editProductForm).category, "Bran")) ? " selected" : ""}>Bran (Vushi)</option><option value="Semolina" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).category) ? ssrLooseContain(unref(editProductForm).category, "Semolina") : ssrLooseEqual(unref(editProductForm).category, "Semolina")) ? " selected" : ""}>Semolina (Sooji)</option></select></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Description</label><textarea rows="2" class="input-glass resize-none" data-v-8ebe66a5>${ssrInterpolate(unref(editProductForm).description)}</textarea></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Status</label><select class="input-glass" data-v-8ebe66a5><option value="active" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).status) ? ssrLooseContain(unref(editProductForm).status, "active") : ssrLooseEqual(unref(editProductForm).status, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(editProductForm).status) ? ssrLooseContain(unref(editProductForm).status, "inactive") : ssrLooseEqual(unref(editProductForm).status, "inactive")) ? " selected" : ""}>Inactive</option></select></div></div><div class="flex gap-3 pt-2" data-v-8ebe66a5><button${ssrIncludeBooleanAttr(!unref(editProductForm).name || unref(editingProduct)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-8ebe66a5>${ssrInterpolate(unref(editingProduct) ? "Saving\u2026" : "Save Changes")}</button><button class="btn-ghost text-xs" data-v-8ebe66a5>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddVariant)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-8ebe66a5><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-8ebe66a5><div class="flex items-center justify-between" data-v-8ebe66a5><h3 class="text-lg font-bold text-gray-100" data-v-8ebe66a5>New Variant</h3><button class="text-gray-500 hover:text-gray-200" data-v-8ebe66a5>\u2715</button></div><div class="grid grid-cols-2 gap-4" data-v-8ebe66a5><div class="col-span-2 space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Pack Weight *</label><select class="field-input" data-v-8ebe66a5><option value="37kg" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "37kg") : ssrLooseEqual(unref(newVariant).packWeight, "37kg")) ? " selected" : ""}>37 kg</option><option value="50kg" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "50kg") : ssrLooseEqual(unref(newVariant).packWeight, "50kg")) ? " selected" : ""}>50 kg</option><option value="55kg" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "55kg") : ssrLooseEqual(unref(newVariant).packWeight, "55kg")) ? " selected" : ""}>55 kg</option><option value="74kg" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "74kg") : ssrLooseEqual(unref(newVariant).packWeight, "74kg")) ? " selected" : ""}>74 kg</option></select></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Grade</label><select class="field-input" data-v-8ebe66a5><option value="" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "") : ssrLooseEqual(unref(newVariant).grade, "")) ? " selected" : ""}>\u2014 None \u2014</option><option value="A" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "A") : ssrLooseEqual(unref(newVariant).grade, "A")) ? " selected" : ""}>Grade A</option><option value="B" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "B") : ssrLooseEqual(unref(newVariant).grade, "B")) ? " selected" : ""}>Grade B</option><option value="C" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "C") : ssrLooseEqual(unref(newVariant).grade, "C")) ? " selected" : ""}>Grade C</option><option value="R" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "R") : ssrLooseEqual(unref(newVariant).grade, "R")) ? " selected" : ""}>Grade R</option></select></div><div class="space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>UOM</label><select class="field-input" data-v-8ebe66a5><option value="bag" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "bag") : ssrLooseEqual(unref(newVariant).uom, "bag")) ? " selected" : ""}>bag</option><option value="kg" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "kg") : ssrLooseEqual(unref(newVariant).uom, "kg")) ? " selected" : ""}>kg</option><option value="gm" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "gm") : ssrLooseEqual(unref(newVariant).uom, "gm")) ? " selected" : ""}>gm</option><option value="litre" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "litre") : ssrLooseEqual(unref(newVariant).uom, "litre")) ? " selected" : ""}>litre</option><option value="pcs" data-v-8ebe66a5${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).uom) ? ssrLooseContain(unref(newVariant).uom, "pcs") : ssrLooseEqual(unref(newVariant).uom, "pcs")) ? " selected" : ""}>pcs</option></select></div><div class="col-span-2 space-y-1.5" data-v-8ebe66a5><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8ebe66a5>Barcode</label><input${ssrRenderAttr("value", unref(newVariant).barcode)} type="text" class="field-input font-mono" placeholder="EAN-13 or custom" data-v-8ebe66a5></div></div><div class="flex gap-3 pt-2" data-v-8ebe66a5><button${ssrIncludeBooleanAttr(unref(addingVariant)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-8ebe66a5>${ssrInterpolate(unref(addingVariant) ? "Adding\u2026" : "Add Variant")}</button><button class="btn-ghost text-xs" data-v-8ebe66a5>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(peReviewOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8" data-v-8ebe66a5><div class="relative bg-[#0f1117] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-5xl mx-4 flex flex-col" style="${ssrRenderStyle({ "max-height": "90vh" })}" data-v-8ebe66a5><div class="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0" data-v-8ebe66a5><div data-v-8ebe66a5><h3 class="text-base font-bold text-gray-100" data-v-8ebe66a5>Review Price Changes</h3><p class="text-xs text-gray-500 mt-0.5" data-v-8ebe66a5>Confirm all changes before writing to the database.</p></div><button class="text-gray-600 hover:text-gray-300 text-lg" data-v-8ebe66a5>\u2715</button></div><div class="px-6 py-2.5 border-b border-white/[0.04] bg-white/[0.02] flex flex-wrap gap-5 text-xs shrink-0" data-v-8ebe66a5><span data-v-8ebe66a5><strong class="text-gray-200" data-v-8ebe66a5>${ssrInterpolate(unref(peReviewRows).length)}</strong> <span class="text-gray-500" data-v-8ebe66a5>rows</span></span><span data-v-8ebe66a5><strong class="text-emerald-400" data-v-8ebe66a5>${ssrInterpolate(unref(peReviewStats).increases)}</strong> <span class="text-gray-500" data-v-8ebe66a5>increases</span></span><span data-v-8ebe66a5><strong class="text-red-400" data-v-8ebe66a5>${ssrInterpolate(unref(peReviewStats).decreases)}</strong> <span class="text-gray-500" data-v-8ebe66a5>decreases</span></span><span data-v-8ebe66a5><strong class="text-gray-400" data-v-8ebe66a5>${ssrInterpolate(unref(peReviewStats).unchanged)}</strong> <span class="text-gray-500" data-v-8ebe66a5>unchanged</span></span><span data-v-8ebe66a5><strong class="text-blue-400" data-v-8ebe66a5>${ssrInterpolate(unref(peReviewStats).isNew)}</strong> <span class="text-gray-500" data-v-8ebe66a5>new</span></span></div><div class="overflow-y-auto flex-1 min-h-0" data-v-8ebe66a5><table class="w-full text-xs" data-v-8ebe66a5><thead class="sticky top-0 z-10 bg-[#0f1117] border-b border-white/[0.06]" data-v-8ebe66a5><tr class="text-gray-600 uppercase tracking-wide" data-v-8ebe66a5><th class="px-4 py-2.5 text-left font-semibold" data-v-8ebe66a5>Grade / Product</th><th class="px-4 py-2.5 text-left font-semibold" data-v-8ebe66a5>Branch</th><th class="px-4 py-2.5 text-center font-semibold" data-v-8ebe66a5>Weight</th><th class="px-4 py-2.5 text-center font-semibold" data-v-8ebe66a5>Current</th><th class="px-4 py-2.5 text-center font-semibold" data-v-8ebe66a5>New Price</th><th class="px-4 py-2.5 text-center font-semibold" data-v-8ebe66a5>\u0394</th><th class="px-4 py-2.5 text-center font-semibold" data-v-8ebe66a5>%</th></tr></thead><tbody class="divide-y divide-white/[0.03]" data-v-8ebe66a5><!--[-->`);
          ssrRenderList(unref(peReviewRows), (r, i) => {
            var _a, _b, _c;
            _push2(`<tr class="${ssrRenderClass({
              "bg-blue-500/5": r.delta === null,
              "bg-emerald-500/5": r.delta !== null && r.delta > 5e-3,
              "bg-red-500/5": r.delta !== null && r.delta < -5e-3
            })}" data-v-8ebe66a5><td class="px-4 py-2 font-semibold text-gray-300" data-v-8ebe66a5>${ssrInterpolate(r.label)}</td><td class="px-4 py-2 text-gray-400" data-v-8ebe66a5>${ssrInterpolate(r.branch)}</td><td class="px-4 py-2 text-center" data-v-8ebe66a5><span class="${ssrRenderClass([r.weight.startsWith("50") ? "bg-blue-500/20 text-blue-300" : r.weight.includes("custom") ? "bg-amber-500/20 text-amber-300" : "bg-purple-500/20 text-purple-300", "px-1.5 py-0.5 rounded text-[10px] font-medium"])}" data-v-8ebe66a5>${ssrInterpolate(r.weight)}</span></td><td class="px-4 py-2 text-center" data-v-8ebe66a5>`);
            if (r.curr !== null) {
              _push2(`<span class="text-gray-400 font-mono" data-v-8ebe66a5>\u09F3${ssrInterpolate(fmt(r.curr))}</span>`);
            } else {
              _push2(`<span class="text-blue-400 text-[10px] font-medium" data-v-8ebe66a5>New</span>`);
            }
            _push2(`</td><td class="px-4 py-2 text-center font-bold font-mono text-gray-200" data-v-8ebe66a5>\u09F3${ssrInterpolate(fmt(r.newP))}</td><td class="px-4 py-2 text-center font-mono" data-v-8ebe66a5>`);
            if (r.delta === null) {
              _push2(`<span class="text-blue-400 text-[10px]" data-v-8ebe66a5>No prior</span>`);
            } else if (r.delta > 5e-3) {
              _push2(`<span class="text-emerald-400" data-v-8ebe66a5>+\u09F3${ssrInterpolate(fmt(r.delta))}</span>`);
            } else if (r.delta < -5e-3) {
              _push2(`<span class="text-red-400" data-v-8ebe66a5>(\u09F3${ssrInterpolate(fmt(Math.abs(r.delta)))})</span>`);
            } else {
              _push2(`<span class="text-gray-600" data-v-8ebe66a5>\u2014</span>`);
            }
            _push2(`</td><td class="px-4 py-2 text-center font-mono" data-v-8ebe66a5>`);
            if (r.pct !== null && Math.abs((_a = r.delta) != null ? _a : 0) > 5e-3) {
              _push2(`<span class="${ssrRenderClass(((_b = r.delta) != null ? _b : 0) > 0 ? "text-emerald-400" : "text-red-400")}" data-v-8ebe66a5>${ssrInterpolate(((_c = r.delta) != null ? _c : 0) > 0 ? "+" : "")}${ssrInterpolate(r.pct.toFixed(1))}% </span>`);
            } else {
              _push2(`<span class="text-gray-600" data-v-8ebe66a5>\u2014</span>`);
            }
            _push2(`</td></tr>`);
          });
          _push2(`<!--]--></tbody></table></div><div class="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 rounded-b-2xl" data-v-8ebe66a5><div class="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-lg" data-v-8ebe66a5> \u26A0 Existing prices will be <strong class="ml-1" data-v-8ebe66a5>archived</strong> and replaced. </div><div class="flex items-center gap-3" data-v-8ebe66a5><button class="px-4 py-2 text-xs border border-white/10 rounded-lg text-gray-400 hover:text-gray-200 transition-colors" data-v-8ebe66a5> \u2190 Back </button><button${ssrIncludeBooleanAttr(unref(applying)) ? " disabled" : ""} class="btn-gold text-xs px-6 py-2 disabled:opacity-50" data-v-8ebe66a5>`);
          if (unref(applying)) {
            _push2(`<svg class="w-3 h-3 animate-spin inline mr-1.5" fill="none" viewBox="0 0 24 24" data-v-8ebe66a5><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-8ebe66a5></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" data-v-8ebe66a5></path></svg>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8ebe66a5"]]);

export { index as default };
//# sourceMappingURL=index-TSfK9tCg.mjs.map
