import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
  __name: "variants",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const productId = Number(route.params.productId);
    const { user } = useUserSession();
    useToast();
    const isProd = computed(() => {
      var _a, _b;
      const r = ((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
      return ["admin", "superadmin", "production manager-srg", "production manager-demra"].includes(r);
    });
    const { data, pending, error: fetchError, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/products/variants?product=${productId}`,
      "$im_10GZ9US"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const variants2 = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.variants) != null ? _b : [];
    });
    const product = computed(() => {
      var _a, _b, _c;
      const prods = (_b = (_a = data.value) == null ? void 0 : _a.products) != null ? _b : [];
      return (_c = prods.find((p) => p.id === productId)) != null ? _c : null;
    });
    computed(() => {
      var _a, _b;
      return (_b = (_a = product.value) == null ? void 0 : _a.base_sku) != null ? _b : "";
    });
    const skuPreview = ref("");
    const showAdd = ref(false);
    const saving = ref(false);
    const addForm = reactive({
      weight_variant: "",
      grade: "",
      sku: "",
      unit_of_measure: "bag",
      weight_kg: null,
      barcode: ""
    });
    function openAdd() {
      Object.assign(addForm, { weight_variant: "", grade: "", sku: "", unit_of_measure: "bag", weight_kg: null, barcode: "" });
      skuPreview.value = "";
      showAdd.value = true;
    }
    const showEdit = ref(false);
    ref(null);
    const editForm = reactive({
      weight_variant: "",
      grade: "",
      sku: "",
      unit_of_measure: "bag",
      weight_kg: null,
      status: "active"
    });
    const deleteTarget = ref(null);
    const deleting = ref(false);
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
    function catIcon(cat) {
      var _a;
      const m = { Flour: "\u{1F33E}", Atta: "\u{1FAD3}", Bran: "\u{1F33F}", Semolina: "\u2728" };
      return (_a = m[cat]) != null ? _a : "\u{1F4E6}";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))} data-v-b59b6b97>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: (_b = (_a = unref(product)) == null ? void 0 : _a.base_name) != null ? _b : "Variants",
        subtitle: "Manage pack sizes, grades, and SKUs for this product",
        breadcrumb: ["Products", "Base Products", (_d = (_c = unref(product)) == null ? void 0 : _c.base_name) != null ? _d : "\u2026", "Variants"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2" data-v-b59b6b97${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/products/base",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Back`);
                } else {
                  return [
                    createTextVNode("\u2190 Back")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<button class="btn-gold text-xs flex items-center gap-1.5" data-v-b59b6b97${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b59b6b97${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" data-v-b59b6b97${_scopeId}></path></svg> Add Variant </button></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2" }, [
                createVNode(_component_NuxtLink, {
                  to: "/products/base",
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u2190 Back")
                  ]),
                  _: 1
                }),
                createVNode("button", {
                  onClick: openAdd,
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
                  createTextVNode(" Add Variant ")
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(product)) {
        _push(`<div class="glass-card px-5 py-3.5 flex items-center gap-4 flex-wrap" data-v-b59b6b97><div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl shrink-0" data-v-b59b6b97>${ssrInterpolate(catIcon(unref(product).category))}</div><div data-v-b59b6b97><p class="font-bold text-gray-200" data-v-b59b6b97>${ssrInterpolate(unref(product).base_name)}</p><p class="text-[11px] text-gray-500" data-v-b59b6b97> Category: <span class="text-gray-400" data-v-b59b6b97>${ssrInterpolate(unref(product).category)}</span>`);
        if (unref(product).base_sku) {
          _push(`<span class="ml-3 font-mono text-gold-400/80" data-v-b59b6b97>SKU: ${ssrInterpolate(unref(product).base_sku)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p></div><div class="ml-auto flex items-center gap-3 text-[11px]" data-v-b59b6b97><span class="text-gray-600" data-v-b59b6b97>${ssrInterpolate(unref(variants2).length)} variant${ssrInterpolate(unref(variants2).length !== 1 ? "s" : "")}</span><span class="${ssrRenderClass([unref(product).status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20", "px-2 py-0.5 rounded-full border text-[10px] font-semibold"])}" data-v-b59b6b97>${ssrInterpolate(unref(product).status)}</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center" data-v-b59b6b97><div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" data-v-b59b6b97></div><p class="text-xs text-gray-500" data-v-b59b6b97>Loading variants\u2026</p></div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-b59b6b97>\u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else {
        _push(`<div class="glass-card p-0 overflow-hidden" data-v-b59b6b97><div class="overflow-x-auto" data-v-b59b6b97><table class="w-full text-xs" data-v-b59b6b97><thead data-v-b59b6b97><tr class="border-b border-white/[0.06] text-[10px] text-gray-600 uppercase tracking-wider" data-v-b59b6b97><th class="px-4 py-3 text-left font-semibold" data-v-b59b6b97>SKU</th><th class="px-3 py-3 text-left font-semibold" data-v-b59b6b97>Weight / Pack</th><th class="px-3 py-3 text-center font-semibold" data-v-b59b6b97>Grade</th><th class="px-3 py-3 text-center font-semibold" data-v-b59b6b97>Weight kg</th><th class="px-3 py-3 text-center font-semibold" data-v-b59b6b97>UOM</th><th class="px-3 py-3 text-center font-semibold" data-v-b59b6b97>Stock</th><th class="px-3 py-3 text-center font-semibold" data-v-b59b6b97>Status</th><th class="px-3 py-3 text-center font-semibold" data-v-b59b6b97>Actions</th></tr></thead><tbody class="divide-y divide-white/[0.03]" data-v-b59b6b97>`);
        if (!unref(variants2).length) {
          _push(`<tr data-v-b59b6b97><td colspan="8" class="py-10 text-center text-gray-600 italic" data-v-b59b6b97>No variants yet \u2014 add one above</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(variants2), (v) => {
          var _a2;
          _push(`<tr class="hover:bg-white/[0.025] transition-colors group" data-v-b59b6b97><td class="px-4 py-3 font-mono text-gray-300 text-[11px]" data-v-b59b6b97>${ssrInterpolate(v.sku || "\u2014")}</td><td class="px-3 py-3" data-v-b59b6b97><span class="${ssrRenderClass([packBadge(v.weight_variant), "px-2 py-0.5 rounded-md text-[11px] font-bold"])}" data-v-b59b6b97>${ssrInterpolate(v.weight_variant)}</span></td><td class="px-3 py-3 text-center" data-v-b59b6b97>`);
          if (v.grade) {
            _push(`<span class="${ssrRenderClass([gradeBadge(v.grade), "inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border shadow-sm"])}" data-v-b59b6b97>${ssrInterpolate(v.grade)}</span>`);
          } else {
            _push(`<span class="text-gray-700 text-[10px]" data-v-b59b6b97>\u2014</span>`);
          }
          _push(`</td><td class="px-3 py-3 text-center text-gray-400 font-mono" data-v-b59b6b97>${ssrInterpolate(v.weight_kg ? Number(v.weight_kg).toFixed(2) : "\u2014")}</td><td class="px-3 py-3 text-center" data-v-b59b6b97><span class="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.06] text-gray-500" data-v-b59b6b97>${ssrInterpolate((_a2 = v.unit_of_measure) != null ? _a2 : "bag")}</span></td><td class="px-3 py-3 text-center font-mono text-gray-300" data-v-b59b6b97>${ssrInterpolate(Number(v.stock_qty || 0).toLocaleString())}</td><td class="px-3 py-3 text-center" data-v-b59b6b97><span class="${ssrRenderClass([v.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20", "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}" data-v-b59b6b97>${ssrInterpolate(v.status)}</span></td><td class="px-3 py-3 text-center" data-v-b59b6b97><div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" data-v-b59b6b97>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/products/${unref(productId)}/${v.id}/pricing`,
            class: "px-2 py-1 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Pricing `);
              } else {
                return [
                  createTextVNode(" Pricing ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button class="p-1.5 rounded text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-all" data-v-b59b6b97><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b59b6b97><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" data-v-b59b6b97></path></svg></button>`);
          if (unref(isProd)) {
            _push(`<button class="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all" data-v-b59b6b97><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b59b6b97><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-b59b6b97></path></svg></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAdd)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-b59b6b97><div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-b59b6b97><div class="flex items-center justify-between" data-v-b59b6b97><h3 class="text-lg font-bold text-gray-100" data-v-b59b6b97>Add Variant</h3><button class="text-gray-500 hover:text-gray-200 text-lg" data-v-b59b6b97>\u2715</button></div>`);
          if (unref(skuPreview)) {
            _push2(`<div class="rounded-lg bg-gold-500/10 border border-gold-500/20 px-4 py-2.5 flex items-center gap-2" data-v-b59b6b97><span class="text-[10px] text-gray-500 uppercase tracking-wider" data-v-b59b6b97>SKU preview:</span><span class="font-mono font-bold text-gold-300 text-sm" data-v-b59b6b97>${ssrInterpolate(unref(skuPreview))}</span></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="grid grid-cols-2 gap-4" data-v-b59b6b97><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Pack Weight *</label><input${ssrRenderAttr("value", unref(addForm).weight_variant)} class="input-glass text-xs" placeholder="e.g. 50kg" data-v-b59b6b97></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Grade</label><select class="input-glass text-xs" data-v-b59b6b97><option value="" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).grade) ? ssrLooseContain(unref(addForm).grade, "") : ssrLooseEqual(unref(addForm).grade, "")) ? " selected" : ""}>\u2014 None \u2014</option><option value="A" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).grade) ? ssrLooseContain(unref(addForm).grade, "A") : ssrLooseEqual(unref(addForm).grade, "A")) ? " selected" : ""}>Grade A</option><option value="B" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).grade) ? ssrLooseContain(unref(addForm).grade, "B") : ssrLooseEqual(unref(addForm).grade, "B")) ? " selected" : ""}>Grade B</option><option value="C" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).grade) ? ssrLooseContain(unref(addForm).grade, "C") : ssrLooseEqual(unref(addForm).grade, "C")) ? " selected" : ""}>Grade C</option><option value="R" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).grade) ? ssrLooseContain(unref(addForm).grade, "R") : ssrLooseEqual(unref(addForm).grade, "R")) ? " selected" : ""}>Grade R</option></select></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Custom SKU</label><input${ssrRenderAttr("value", unref(addForm).sku)} class="input-glass text-xs font-mono" placeholder="Auto-generated or custom" data-v-b59b6b97></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Unit of Measure</label><select class="input-glass text-xs" data-v-b59b6b97><option value="bag" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).unit_of_measure) ? ssrLooseContain(unref(addForm).unit_of_measure, "bag") : ssrLooseEqual(unref(addForm).unit_of_measure, "bag")) ? " selected" : ""}>bag</option><option value="kg" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).unit_of_measure) ? ssrLooseContain(unref(addForm).unit_of_measure, "kg") : ssrLooseEqual(unref(addForm).unit_of_measure, "kg")) ? " selected" : ""}>kg</option><option value="gm" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).unit_of_measure) ? ssrLooseContain(unref(addForm).unit_of_measure, "gm") : ssrLooseEqual(unref(addForm).unit_of_measure, "gm")) ? " selected" : ""}>gm</option><option value="litre" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).unit_of_measure) ? ssrLooseContain(unref(addForm).unit_of_measure, "litre") : ssrLooseEqual(unref(addForm).unit_of_measure, "litre")) ? " selected" : ""}>litre</option><option value="pcs" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).unit_of_measure) ? ssrLooseContain(unref(addForm).unit_of_measure, "pcs") : ssrLooseEqual(unref(addForm).unit_of_measure, "pcs")) ? " selected" : ""}>pcs</option></select></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Weight (kg)</label><input${ssrRenderAttr("value", unref(addForm).weight_kg)} type="number" step="0.01" min="0" class="input-glass text-xs" placeholder="e.g. 50.00" data-v-b59b6b97></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Barcode</label><input${ssrRenderAttr("value", unref(addForm).barcode)} class="input-glass text-xs font-mono" placeholder="EAN-13 or custom" data-v-b59b6b97></div></div><div class="flex gap-3 pt-1" data-v-b59b6b97><button${ssrIncludeBooleanAttr(!unref(addForm).weight_variant || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-b59b6b97>${ssrInterpolate(unref(saving) ? "Adding\u2026" : "Add Variant")}</button><button class="btn-ghost text-xs" data-v-b59b6b97>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showEdit)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-b59b6b97><div class="w-full max-w-lg rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-b59b6b97><div class="flex items-center justify-between" data-v-b59b6b97><h3 class="text-lg font-bold text-gray-100" data-v-b59b6b97>Edit Variant</h3><button class="text-gray-500 hover:text-gray-200 text-lg" data-v-b59b6b97>\u2715</button></div><div class="grid grid-cols-2 gap-4" data-v-b59b6b97><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Pack Weight *</label><input${ssrRenderAttr("value", unref(editForm).weight_variant)} class="input-glass text-xs" data-v-b59b6b97></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Grade</label><select class="input-glass text-xs" data-v-b59b6b97><option value="" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).grade) ? ssrLooseContain(unref(editForm).grade, "") : ssrLooseEqual(unref(editForm).grade, "")) ? " selected" : ""}>\u2014 None \u2014</option><option value="A" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).grade) ? ssrLooseContain(unref(editForm).grade, "A") : ssrLooseEqual(unref(editForm).grade, "A")) ? " selected" : ""}>Grade A</option><option value="B" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).grade) ? ssrLooseContain(unref(editForm).grade, "B") : ssrLooseEqual(unref(editForm).grade, "B")) ? " selected" : ""}>Grade B</option><option value="C" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).grade) ? ssrLooseContain(unref(editForm).grade, "C") : ssrLooseEqual(unref(editForm).grade, "C")) ? " selected" : ""}>Grade C</option><option value="R" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).grade) ? ssrLooseContain(unref(editForm).grade, "R") : ssrLooseEqual(unref(editForm).grade, "R")) ? " selected" : ""}>Grade R</option></select></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>SKU</label><input${ssrRenderAttr("value", unref(editForm).sku)} class="input-glass text-xs font-mono" data-v-b59b6b97></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Unit of Measure</label><select class="input-glass text-xs" data-v-b59b6b97><option value="bag" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).unit_of_measure) ? ssrLooseContain(unref(editForm).unit_of_measure, "bag") : ssrLooseEqual(unref(editForm).unit_of_measure, "bag")) ? " selected" : ""}>bag</option><option value="kg" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).unit_of_measure) ? ssrLooseContain(unref(editForm).unit_of_measure, "kg") : ssrLooseEqual(unref(editForm).unit_of_measure, "kg")) ? " selected" : ""}>kg</option><option value="gm" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).unit_of_measure) ? ssrLooseContain(unref(editForm).unit_of_measure, "gm") : ssrLooseEqual(unref(editForm).unit_of_measure, "gm")) ? " selected" : ""}>gm</option><option value="litre" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).unit_of_measure) ? ssrLooseContain(unref(editForm).unit_of_measure, "litre") : ssrLooseEqual(unref(editForm).unit_of_measure, "litre")) ? " selected" : ""}>litre</option><option value="pcs" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).unit_of_measure) ? ssrLooseContain(unref(editForm).unit_of_measure, "pcs") : ssrLooseEqual(unref(editForm).unit_of_measure, "pcs")) ? " selected" : ""}>pcs</option></select></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Weight (kg)</label><input${ssrRenderAttr("value", unref(editForm).weight_kg)} type="number" step="0.01" min="0" class="input-glass text-xs" data-v-b59b6b97></div><div class="space-y-1.5" data-v-b59b6b97><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-b59b6b97>Status</label><select class="input-glass text-xs" data-v-b59b6b97><option value="active" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "active") : ssrLooseEqual(unref(editForm).status, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-b59b6b97${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "inactive") : ssrLooseEqual(unref(editForm).status, "inactive")) ? " selected" : ""}>Inactive</option></select></div></div><div class="flex gap-3 pt-1" data-v-b59b6b97><button${ssrIncludeBooleanAttr(!unref(editForm).weight_variant || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-b59b6b97>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button><button class="btn-ghost text-xs" data-v-b59b6b97>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2;
        if (unref(deleteTarget)) {
          _push2(`<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-b59b6b97><div class="w-full max-w-sm rounded-2xl bg-[#161616] border border-red-500/20 p-6 space-y-4" data-v-b59b6b97><div class="flex items-start gap-3" data-v-b59b6b97><div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0" data-v-b59b6b97><svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-b59b6b97><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" data-v-b59b6b97></path></svg></div><div data-v-b59b6b97><h3 class="text-base font-bold text-gray-100" data-v-b59b6b97>Deactivate Variant?</h3><p class="text-xs text-gray-400 mt-1" data-v-b59b6b97> &quot;<strong data-v-b59b6b97>${ssrInterpolate((_a2 = unref(deleteTarget)) == null ? void 0 : _a2.weight_variant)}</strong> ${ssrInterpolate(((_b2 = unref(deleteTarget)) == null ? void 0 : _b2.grade) ? `Grade ${unref(deleteTarget).grade}` : "")}&quot; will be set to inactive. </p></div></div><div class="flex gap-3" data-v-b59b6b97><button${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""} class="flex-1 px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 disabled:opacity-50 transition-colors" data-v-b59b6b97>${ssrInterpolate(unref(deleting) ? "Deactivating\u2026" : "Yes, Deactivate")}</button><button class="btn-ghost text-xs px-4 py-2" data-v-b59b6b97>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/[productId]/variants.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const variants = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b59b6b97"]]);

export { variants as default };
//# sourceMappingURL=variants-DubXEaDb.mjs.map
