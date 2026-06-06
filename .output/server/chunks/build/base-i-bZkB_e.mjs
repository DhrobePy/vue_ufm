import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "base",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const saving = ref(false);
    const editForm = reactive({ id: 0, name: "", category: "Flour", description: "", status: "active" });
    function openEdit(row) {
      Object.assign(editForm, {
        id: row.id,
        name: row.name,
        category: row.category.charAt(0).toUpperCase() + row.category.slice(1),
        description: row.description || "",
        status: row.status
      });
      showEditModal.value = true;
    }
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/base",
      "$adT_lj2Kjl"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const products = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.products) != null ? _b : []).map((p) => {
          var _a2, _b2, _c, _d;
          return {
            id: p.id,
            name: p.base_name,
            nameEn: "",
            category: ((_a2 = p.category) != null ? _a2 : "").toLowerCase(),
            description: (_b2 = p.description) != null ? _b2 : "",
            variants: Number((_c = p.variant_count) != null ? _c : 0),
            status: (_d = p.status) != null ? _d : "active"
          };
        });
      }
    );
    const cols = [
      { key: "name", label: "Product", sortable: true },
      { key: "category", label: "Category", sortable: true },
      { key: "variants", label: "Variants" },
      { key: "status", label: "Status" }
    ];
    const newProduct = reactive({ name: "", category: "Flour", description: "" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-f5863144>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Base Products",
        subtitle: "Master list of all product families",
        breadcrumb: ["Products", "Base Products"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-f5863144${_scopeId}>+ New Product</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: ($event) => showAddModal.value = true,
                class: "btn-gold text-xs"
              }, "+ New Product", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-5" data-v-f5863144>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(products),
        "per-page": 15,
        "search-placeholder": "Search products\u2026"
      }, {
        "cell-name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-v-f5863144${_scopeId}><p class="text-sm font-semibold text-gray-200" data-v-f5863144${_scopeId}>${ssrInterpolate(row.name)}</p><p class="text-xs text-gray-500" data-v-f5863144${_scopeId}>${ssrInterpolate(row.nameEn)}</p></div>`);
          } else {
            return [
              createVNode("div", null, [
                createVNode("p", { class: "text-sm font-semibold text-gray-200" }, toDisplayString(row.name), 1),
                createVNode("p", { class: "text-xs text-gray-500" }, toDisplayString(row.nameEn), 1)
              ])
            ];
          }
        }),
        "cell-category": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-xs capitalize text-gray-400" data-v-f5863144${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-xs capitalize text-gray-400" }, toDisplayString(value), 1)
            ];
          }
        }),
        "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
            ];
          }
        }),
        actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex gap-1.5" data-v-f5863144${_scopeId}><button class="btn-ghost text-xs py-1 px-2" data-v-f5863144${_scopeId}>Edit</button>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/products/variants",
              class: "btn-ghost text-xs py-1 px-2"
            }, {
              default: withCtx((_, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Variants`);
                } else {
                  return [
                    createTextVNode("Variants")
                  ];
                }
              }),
              _: 2
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex gap-1.5" }, [
                createVNode("button", {
                  onClick: ($event) => openEdit(row),
                  class: "btn-ghost text-xs py-1 px-2"
                }, "Edit", 8, ["onClick"]),
                createVNode(_component_NuxtLink, {
                  to: "/products/variants",
                  class: "btn-ghost text-xs py-1 px-2"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Variants")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showEditModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-f5863144><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-f5863144><div class="flex items-center justify-between" data-v-f5863144><h3 class="text-lg font-bold text-gray-100" data-v-f5863144>Edit Product</h3><button class="text-gray-500 hover:text-gray-200" data-v-f5863144>\u2715</button></div><div class="space-y-4" data-v-f5863144><div class="space-y-1.5" data-v-f5863144><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-f5863144>Product Name *</label><input${ssrRenderAttr("value", unref(editForm).name)} type="text" class="input-glass" placeholder="e.g. 2Hati Moida" data-v-f5863144></div><div class="space-y-1.5" data-v-f5863144><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-f5863144>Category *</label><select class="input-glass" data-v-f5863144><option value="Flour" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).category) ? ssrLooseContain(unref(editForm).category, "Flour") : ssrLooseEqual(unref(editForm).category, "Flour")) ? " selected" : ""}>Flour (Moida)</option><option value="Atta" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).category) ? ssrLooseContain(unref(editForm).category, "Atta") : ssrLooseEqual(unref(editForm).category, "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).category) ? ssrLooseContain(unref(editForm).category, "Bran") : ssrLooseEqual(unref(editForm).category, "Bran")) ? " selected" : ""}>Bran (Vushi)</option><option value="Semolina" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).category) ? ssrLooseContain(unref(editForm).category, "Semolina") : ssrLooseEqual(unref(editForm).category, "Semolina")) ? " selected" : ""}>Semolina (Sooji)</option></select></div><div class="space-y-1.5" data-v-f5863144><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-f5863144>Description</label><textarea rows="2" class="input-glass resize-none" data-v-f5863144>${ssrInterpolate(unref(editForm).description)}</textarea></div><div class="space-y-1.5" data-v-f5863144><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-f5863144>Status</label><select class="input-glass" data-v-f5863144><option value="active" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "active") : ssrLooseEqual(unref(editForm).status, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).status) ? ssrLooseContain(unref(editForm).status, "inactive") : ssrLooseEqual(unref(editForm).status, "inactive")) ? " selected" : ""}>Inactive</option></select></div></div><div class="flex gap-3 pt-2" data-v-f5863144><button${ssrIncludeBooleanAttr(!unref(editForm).name || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-f5863144>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button><button class="btn-ghost text-xs" data-v-f5863144>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-f5863144><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-f5863144><div class="flex items-center justify-between" data-v-f5863144><h3 class="text-lg font-bold text-gray-100" data-v-f5863144>New Base Product</h3><button class="text-gray-500 hover:text-gray-200" data-v-f5863144>\u2715</button></div><div class="space-y-4" data-v-f5863144><div class="space-y-1.5" data-v-f5863144><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-f5863144>Product Name *</label><input${ssrRenderAttr("value", unref(newProduct).name)} type="text" class="input-glass" placeholder="e.g. 2Hati Moida" data-v-f5863144></div><div class="space-y-1.5" data-v-f5863144><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-f5863144>Category *</label><select class="input-glass" data-v-f5863144><option value="Flour" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Flour") : ssrLooseEqual(unref(newProduct).category, "Flour")) ? " selected" : ""}>Flour (Moida)</option><option value="Atta" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Atta") : ssrLooseEqual(unref(newProduct).category, "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Bran") : ssrLooseEqual(unref(newProduct).category, "Bran")) ? " selected" : ""}>Bran (Vushi)</option><option value="Semolina" data-v-f5863144${ssrIncludeBooleanAttr(Array.isArray(unref(newProduct).category) ? ssrLooseContain(unref(newProduct).category, "Semolina") : ssrLooseEqual(unref(newProduct).category, "Semolina")) ? " selected" : ""}>Semolina (Sooji)</option></select></div><div class="space-y-1.5" data-v-f5863144><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-f5863144>Description</label><textarea rows="2" class="input-glass resize-none" data-v-f5863144>${ssrInterpolate(unref(newProduct).description)}</textarea></div></div><div class="flex gap-3 pt-2" data-v-f5863144><button${ssrIncludeBooleanAttr(!unref(newProduct).name || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-f5863144>Add Product</button><button class="btn-ghost text-xs" data-v-f5863144>Cancel</button></div></div></div>`);
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
const base = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f5863144"]]);

export { base as default };
//# sourceMappingURL=base-i-bZkB_e.mjs.map
