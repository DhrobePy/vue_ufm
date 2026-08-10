import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, mergeProps, withCtx, createVNode, openBlock, createBlock, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
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
  __name: "base",
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
    const { data, pending, error: fetchError, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/base",
      "$5EDA_Khvtj"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const products = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.products) != null ? _b : [];
    });
    const search = ref("");
    const filterCat = ref("");
    const filtered = computed(() => {
      let list = products.value;
      if (filterCat.value) list = list.filter((p) => p.category === filterCat.value);
      if (search.value.trim()) {
        const q = search.value.toLowerCase();
        list = list.filter(
          (p) => {
            var _a;
            return p.base_name.toLowerCase().includes(q) || ((_a = p.base_sku) != null ? _a : "").toLowerCase().includes(q);
          }
        );
      }
      return list;
    });
    const editingId = ref(null);
    const editForm = reactive({ base_name: "", base_sku: "", category: "Flour", description: "", status: "active" });
    const saving = ref(false);
    const showAdd = ref(false);
    const addForm = reactive({ base_name: "", base_sku: "", category: "Flour", description: "" });
    function openAdd() {
      Object.assign(addForm, { base_name: "", base_sku: "", category: "Flour", description: "" });
      showAdd.value = true;
    }
    const deleteTarget = ref(null);
    const deleting = ref(false);
    function catPill(cat) {
      var _a;
      const m = {
        Flour: "bg-amber-500/15 text-amber-400",
        Atta: "bg-orange-500/15 text-orange-400",
        Bran: "bg-green-500/15 text-green-400",
        Semolina: "bg-sky-500/15 text-sky-400"
      };
      return (_a = m[cat]) != null ? _a : "bg-gray-500/15 text-gray-400";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))} data-v-cf6fb8f0>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Base Products",
        subtitle: "Master list of all product families",
        breadcrumb: ["Products", "Base Products"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs flex items-center gap-1.5" data-v-cf6fb8f0${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-cf6fb8f0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" data-v-cf6fb8f0${_scopeId}></path></svg> New Product </button>`);
          } else {
            return [
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
                createTextVNode(" New Product ")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center" data-v-cf6fb8f0><div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2" data-v-cf6fb8f0></div><p class="text-xs text-gray-500" data-v-cf6fb8f0>Loading\u2026</p></div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-cf6fb8f0> \u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else {
        _push(`<div class="glass-card p-0 overflow-hidden" data-v-cf6fb8f0><div class="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3 flex-wrap" data-v-cf6fb8f0><div class="relative flex-1 min-w-[180px] max-w-xs" data-v-cf6fb8f0><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-cf6fb8f0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" data-v-cf6fb8f0></path></svg><input${ssrRenderAttr("value", unref(search))} placeholder="Search name or SKU\u2026" class="input-glass pl-9 pr-3 py-1.5 text-xs w-full" data-v-cf6fb8f0></div><select class="input-glass py-1.5 text-xs w-auto" data-v-cf6fb8f0><option value="" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(filterCat)) ? ssrLooseContain(unref(filterCat), "") : ssrLooseEqual(unref(filterCat), "")) ? " selected" : ""}>All Categories</option><option value="Flour" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(filterCat)) ? ssrLooseContain(unref(filterCat), "Flour") : ssrLooseEqual(unref(filterCat), "Flour")) ? " selected" : ""}>Flour</option><option value="Atta" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(filterCat)) ? ssrLooseContain(unref(filterCat), "Atta") : ssrLooseEqual(unref(filterCat), "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(filterCat)) ? ssrLooseContain(unref(filterCat), "Bran") : ssrLooseEqual(unref(filterCat), "Bran")) ? " selected" : ""}>Bran</option><option value="Semolina" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(filterCat)) ? ssrLooseContain(unref(filterCat), "Semolina") : ssrLooseEqual(unref(filterCat), "Semolina")) ? " selected" : ""}>Semolina</option></select><span class="text-[11px] text-gray-600 ml-auto" data-v-cf6fb8f0>${ssrInterpolate(unref(filtered).length)} product${ssrInterpolate(unref(filtered).length !== 1 ? "s" : "")}</span></div><div class="overflow-x-auto" data-v-cf6fb8f0><table class="w-full text-xs" data-v-cf6fb8f0><thead data-v-cf6fb8f0><tr class="border-b border-white/[0.06] text-[10px] text-gray-600 uppercase tracking-wider" data-v-cf6fb8f0><th class="px-4 py-3 text-left font-semibold" data-v-cf6fb8f0>Name</th><th class="px-3 py-3 text-left font-semibold" data-v-cf6fb8f0>Base SKU</th><th class="px-3 py-3 text-left font-semibold" data-v-cf6fb8f0>Category</th><th class="px-3 py-3 text-center font-semibold" data-v-cf6fb8f0>Variants</th><th class="px-3 py-3 text-center font-semibold" data-v-cf6fb8f0>Status</th><th class="px-3 py-3 text-center font-semibold" data-v-cf6fb8f0>Actions</th></tr></thead><tbody class="divide-y divide-white/[0.03]" data-v-cf6fb8f0>`);
        if (!unref(filtered).length) {
          _push(`<tr data-v-cf6fb8f0><td colspan="6" class="py-10 text-center text-gray-600 text-xs italic" data-v-cf6fb8f0>No products match your filter</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(filtered), (p) => {
          _push(`<!--[-->`);
          if (unref(editingId) !== p.id) {
            _push(`<tr class="hover:bg-white/[0.025] transition-colors group" data-v-cf6fb8f0><td class="px-4 py-2.5 font-semibold text-gray-200" data-v-cf6fb8f0>${ssrInterpolate(p.base_name)}</td><td class="px-3 py-2.5 font-mono text-gray-400 text-[11px]" data-v-cf6fb8f0>${ssrInterpolate(p.base_sku || "\u2014")}</td><td class="px-3 py-2.5" data-v-cf6fb8f0><span class="${ssrRenderClass([catPill(p.category), "px-2 py-0.5 rounded-full text-[10px] font-semibold"])}" data-v-cf6fb8f0>${ssrInterpolate(p.category)}</span></td><td class="px-3 py-2.5 text-center text-gray-400" data-v-cf6fb8f0>${ssrInterpolate(p.variant_count)}</td><td class="px-3 py-2.5 text-center" data-v-cf6fb8f0><span class="${ssrRenderClass([p.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-500/10 text-gray-500 border-gray-500/20", "px-2 py-0.5 rounded-full text-[10px] font-semibold border"])}" data-v-cf6fb8f0>${ssrInterpolate(p.status)}</span></td><td class="px-3 py-2.5 text-center" data-v-cf6fb8f0><div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" data-v-cf6fb8f0>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/products/${p.id}/variants`,
              class: "px-2 py-1 rounded text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Variants `);
                } else {
                  return [
                    createTextVNode(" Variants ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<button class="p-1.5 rounded text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-all" data-v-cf6fb8f0><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-cf6fb8f0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" data-v-cf6fb8f0></path></svg></button>`);
            if (unref(isAdmin)) {
              _push(`<button class="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all" data-v-cf6fb8f0><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-cf6fb8f0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-cf6fb8f0></path></svg></button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></td></tr>`);
          } else {
            _push(`<tr class="bg-white/[0.04]" data-v-cf6fb8f0><td class="px-3 py-2" data-v-cf6fb8f0><input${ssrRenderAttr("value", unref(editForm).base_name)} class="input-glass py-1.5 text-xs w-full" placeholder="Product name *" data-v-cf6fb8f0></td><td class="px-3 py-2" data-v-cf6fb8f0><input${ssrRenderAttr("value", unref(editForm).base_sku)} class="input-glass py-1.5 text-xs w-full font-mono" placeholder="UFF" data-v-cf6fb8f0></td><td class="px-3 py-2" data-v-cf6fb8f0><select class="input-glass py-1.5 text-xs w-full" data-v-cf6fb8f0><option value="Flour" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).category) ? ssrLooseContain(unref(editForm).category, "Flour") : ssrLooseEqual(unref(editForm).category, "Flour")) ? " selected" : ""}>Flour</option><option value="Atta" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).category) ? ssrLooseContain(unref(editForm).category, "Atta") : ssrLooseEqual(unref(editForm).category, "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).category) ? ssrLooseContain(unref(editForm).category, "Bran") : ssrLooseEqual(unref(editForm).category, "Bran")) ? " selected" : ""}>Bran</option><option value="Semolina" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).category) ? ssrLooseContain(unref(editForm).category, "Semolina") : ssrLooseEqual(unref(editForm).category, "Semolina")) ? " selected" : ""}>Semolina</option></select></td><td class="px-3 py-2 text-center text-gray-500" data-v-cf6fb8f0>${ssrInterpolate(p.variant_count)}</td><td class="px-3 py-2" data-v-cf6fb8f0><select class="input-glass py-1.5 text-xs w-full" data-v-cf6fb8f0><option value="active" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "active") : ssrLooseEqual(unref(editForm).status, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "inactive") : ssrLooseEqual(unref(editForm).status, "inactive")) ? " selected" : ""}>Inactive</option></select></td><td class="px-3 py-2" data-v-cf6fb8f0><div class="flex items-center justify-center gap-1.5" data-v-cf6fb8f0><button${ssrIncludeBooleanAttr(unref(saving) || !unref(editForm).base_name) ? " disabled" : ""} class="px-3 py-1 rounded text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors" data-v-cf6fb8f0>${ssrInterpolate(unref(saving) ? "\u2026" : "Save")}</button><button class="px-3 py-1 rounded text-[11px] text-gray-500 border border-white/[0.08] hover:text-gray-300 transition-colors" data-v-cf6fb8f0> Cancel </button></div></td></tr>`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAdd)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-cf6fb8f0><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-cf6fb8f0><div class="flex items-center justify-between" data-v-cf6fb8f0><h3 class="text-lg font-bold text-gray-100" data-v-cf6fb8f0>New Base Product</h3><button class="text-gray-500 hover:text-gray-200 text-lg" data-v-cf6fb8f0>\u2715</button></div><div class="space-y-4" data-v-cf6fb8f0><div class="space-y-1.5" data-v-cf6fb8f0><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-cf6fb8f0>Product Name *</label><input${ssrRenderAttr("value", unref(addForm).base_name)} type="text" class="input-glass" placeholder="e.g. 2Hati Moida" data-v-cf6fb8f0></div><div class="space-y-1.5" data-v-cf6fb8f0><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-cf6fb8f0>Base SKU</label><input${ssrRenderAttr("value", unref(addForm).base_sku)} type="text" class="input-glass font-mono uppercase" placeholder="e.g. UFF" data-v-cf6fb8f0><p class="text-[10px] text-gray-600" data-v-cf6fb8f0>Used for auto-generating variant SKUs (e.g. UFF-50KG-A)</p></div><div class="space-y-1.5" data-v-cf6fb8f0><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-cf6fb8f0>Category *</label><select class="input-glass" data-v-cf6fb8f0><option value="Flour" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).category) ? ssrLooseContain(unref(addForm).category, "Flour") : ssrLooseEqual(unref(addForm).category, "Flour")) ? " selected" : ""}>Flour (Moida)</option><option value="Atta" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).category) ? ssrLooseContain(unref(addForm).category, "Atta") : ssrLooseEqual(unref(addForm).category, "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).category) ? ssrLooseContain(unref(addForm).category, "Bran") : ssrLooseEqual(unref(addForm).category, "Bran")) ? " selected" : ""}>Bran (Vushi)</option><option value="Semolina" data-v-cf6fb8f0${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).category) ? ssrLooseContain(unref(addForm).category, "Semolina") : ssrLooseEqual(unref(addForm).category, "Semolina")) ? " selected" : ""}>Semolina (Sooji)</option></select></div><div class="space-y-1.5" data-v-cf6fb8f0><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-cf6fb8f0>Description</label><textarea rows="2" class="input-glass resize-none" data-v-cf6fb8f0>${ssrInterpolate(unref(addForm).description)}</textarea></div></div><div class="flex gap-3 pt-2" data-v-cf6fb8f0><button${ssrIncludeBooleanAttr(!unref(addForm).base_name || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-cf6fb8f0>${ssrInterpolate(unref(saving) ? "Adding\u2026" : "Add Product")}</button><button class="btn-ghost text-xs" data-v-cf6fb8f0>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        var _a;
        if (unref(deleteTarget)) {
          _push2(`<div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-cf6fb8f0><div class="w-full max-w-sm rounded-2xl bg-[#161616] border border-red-500/20 p-6 space-y-4" data-v-cf6fb8f0><div class="flex items-start gap-3" data-v-cf6fb8f0><div class="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0" data-v-cf6fb8f0><svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-cf6fb8f0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" data-v-cf6fb8f0></path></svg></div><div data-v-cf6fb8f0><h3 class="text-base font-bold text-gray-100" data-v-cf6fb8f0>Delete Product?</h3><p class="text-xs text-gray-400 mt-1" data-v-cf6fb8f0> &quot;<strong data-v-cf6fb8f0>${ssrInterpolate((_a = unref(deleteTarget)) == null ? void 0 : _a.base_name)}</strong>&quot; will be soft-deleted. Variants and prices are preserved. </p></div></div><div class="flex gap-3" data-v-cf6fb8f0><button${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""} class="flex-1 px-4 py-2 rounded-lg text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 disabled:opacity-50 transition-colors" data-v-cf6fb8f0>${ssrInterpolate(unref(deleting) ? "Deleting\u2026" : "Yes, Delete")}</button><button class="btn-ghost text-xs px-4 py-2" data-v-cf6fb8f0>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/base.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const base = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cf6fb8f0"]]);

export { base as default };
//# sourceMappingURL=base-DxJVcIQc.mjs.map
