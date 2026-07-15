import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { c as _export_sfc } from './server.mjs';
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
import '@vue/shared';
import 'perfect-debounce';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "variants",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const showAddModal = ref(false);
    const filterProduct = ref("");
    const filterCategory = ref("");
    const saving = ref(false);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/products/variants",
      {
        query: computed(() => ({
          product: filterProduct.value || void 0,
          category: filterCategory.value || void 0
        }))
      },
      "$27Ors4P5RZ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const variants2 = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.variants) != null ? _b : [];
    });
    const baseProducts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.products) != null ? _b : [];
    });
    function bagsPerMT(weight) {
      const kg = parseInt(weight);
      if (!kg) return 0;
      return Math.round(1e3 / kg);
    }
    const newVariant = reactive({
      productId: "",
      packWeight: "50kg",
      grade: "",
      barcode: "",
      unitPrice: 0
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-ed1607f7>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Product Variants",
        subtitle: "Size, pack weight and barcode management",
        breadcrumb: ["Products", "Variants"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-ed1607f7${_scopeId}>+ New Variant</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: ($event) => showAddModal.value = true,
                class: "btn-gold text-xs"
              }, "+ New Variant", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-ed1607f7>Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-ed1607f7>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<div class="glass-card p-5" data-v-ed1607f7><div class="flex flex-wrap gap-3 mb-4" data-v-ed1607f7><select class="field-input w-auto text-xs py-1.5" data-v-ed1607f7><option value="" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(filterProduct)) ? ssrLooseContain(unref(filterProduct), "") : ssrLooseEqual(unref(filterProduct), "")) ? " selected" : ""}>All Products</option><!--[-->`);
        ssrRenderList(unref(baseProducts), (p) => {
          _push(`<option${ssrRenderAttr("value", p.id)} data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(filterProduct)) ? ssrLooseContain(unref(filterProduct), p.id) : ssrLooseEqual(unref(filterProduct), p.id)) ? " selected" : ""}>${ssrInterpolate(p.name)}</option>`);
        });
        _push(`<!--]--></select><select class="field-input w-auto text-xs py-1.5" data-v-ed1607f7><option value="" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "") : ssrLooseEqual(unref(filterCategory), "")) ? " selected" : ""}>All Categories</option><option value="Flour" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "Flour") : ssrLooseEqual(unref(filterCategory), "Flour")) ? " selected" : ""}>Flour</option><option value="Atta" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "Atta") : ssrLooseEqual(unref(filterCategory), "Atta")) ? " selected" : ""}>Atta</option><option value="Bran" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(filterCategory)) ? ssrLooseContain(unref(filterCategory), "Bran") : ssrLooseEqual(unref(filterCategory), "Bran")) ? " selected" : ""}>Bran</option></select></div><table class="w-full text-xs" data-v-ed1607f7><thead data-v-ed1607f7><tr class="border-b border-white/[0.06]" data-v-ed1607f7><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-ed1607f7>Product</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-ed1607f7>Category</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider" data-v-ed1607f7>Pack Weight</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider" data-v-ed1607f7>Bags/MT</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider" data-v-ed1607f7>Unit Price</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-ed1607f7>Barcode</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider" data-v-ed1607f7>Status</th></tr></thead><tbody class="divide-y divide-white/[0.04]" data-v-ed1607f7>`);
        if (!unref(variants2).length) {
          _push(`<tr data-v-ed1607f7><td colspan="7" class="py-6 text-center text-gray-600" data-v-ed1607f7>No variants found</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(variants2), (v) => {
          _push(`<tr class="hover:bg-white/[0.02]" data-v-ed1607f7><td class="py-2.5 px-3 font-semibold text-gray-200" data-v-ed1607f7>${ssrInterpolate(v.product_name)}</td><td class="py-2.5 px-3 text-gray-400" data-v-ed1607f7>${ssrInterpolate(v.category)}</td><td class="py-2.5 px-3 text-right font-mono text-gray-300" data-v-ed1607f7>${ssrInterpolate(v.weight_variant)}</td><td class="py-2.5 px-3 text-right text-gray-400" data-v-ed1607f7>${ssrInterpolate(bagsPerMT(v.weight_variant))}</td><td class="py-2.5 px-3 text-right font-mono text-gray-300" data-v-ed1607f7>\u09F3${ssrInterpolate(Number(v.unit_price).toLocaleString())}</td><td class="py-2.5 px-3 font-mono text-gray-600 text-[11px]" data-v-ed1607f7>${ssrInterpolate(v.barcode || "\u2014")}</td><td class="py-2.5 px-3 text-center" data-v-ed1607f7>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: v.status
          }, null, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-ed1607f7><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-ed1607f7><div class="flex items-center justify-between" data-v-ed1607f7><h3 class="text-lg font-bold text-gray-100" data-v-ed1607f7>New Variant</h3><button class="text-gray-500 hover:text-gray-200" data-v-ed1607f7>\u2715</button></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-ed1607f7><div class="space-y-1.5 sm:col-span-2" data-v-ed1607f7><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-ed1607f7>Base Product *</label><select class="field-input" data-v-ed1607f7><option value="" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).productId) ? ssrLooseContain(unref(newVariant).productId, "") : ssrLooseEqual(unref(newVariant).productId, "")) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
          ssrRenderList(unref(baseProducts), (p) => {
            _push2(`<option${ssrRenderAttr("value", p.id)} data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).productId) ? ssrLooseContain(unref(newVariant).productId, p.id) : ssrLooseEqual(unref(newVariant).productId, p.id)) ? " selected" : ""}>${ssrInterpolate(p.name)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="space-y-1.5" data-v-ed1607f7><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-ed1607f7>Pack Weight *</label><select class="field-input" data-v-ed1607f7><option value="37kg" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "37kg") : ssrLooseEqual(unref(newVariant).packWeight, "37kg")) ? " selected" : ""}>37kg</option><option value="50kg" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "50kg") : ssrLooseEqual(unref(newVariant).packWeight, "50kg")) ? " selected" : ""}>50kg</option><option value="55kg" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "55kg") : ssrLooseEqual(unref(newVariant).packWeight, "55kg")) ? " selected" : ""}>55kg</option><option value="74kg" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).packWeight) ? ssrLooseContain(unref(newVariant).packWeight, "74kg") : ssrLooseEqual(unref(newVariant).packWeight, "74kg")) ? " selected" : ""}>74kg</option></select></div><div class="space-y-1.5" data-v-ed1607f7><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-ed1607f7>Grade</label><select class="field-input" data-v-ed1607f7><option value="" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "") : ssrLooseEqual(unref(newVariant).grade, "")) ? " selected" : ""}>\u2014 None \u2014</option><option value="A" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "A") : ssrLooseEqual(unref(newVariant).grade, "A")) ? " selected" : ""}>Grade A</option><option value="B" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "B") : ssrLooseEqual(unref(newVariant).grade, "B")) ? " selected" : ""}>Grade B</option><option value="C" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "C") : ssrLooseEqual(unref(newVariant).grade, "C")) ? " selected" : ""}>Grade C</option><option value="R" data-v-ed1607f7${ssrIncludeBooleanAttr(Array.isArray(unref(newVariant).grade) ? ssrLooseContain(unref(newVariant).grade, "R") : ssrLooseEqual(unref(newVariant).grade, "R")) ? " selected" : ""}>Grade R</option></select></div><div class="space-y-1.5" data-v-ed1607f7><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-ed1607f7>Barcode</label><input${ssrRenderAttr("value", unref(newVariant).barcode)} type="text" class="field-input font-mono" placeholder="EAN-13 or custom" data-v-ed1607f7></div><div class="space-y-1.5" data-v-ed1607f7><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-ed1607f7>Unit Price (\u09F3)</label><input${ssrRenderAttr("value", unref(newVariant).unitPrice)} type="number" min="0" class="field-input" placeholder="0" data-v-ed1607f7></div></div><div class="flex gap-3 pt-2" data-v-ed1607f7><button${ssrIncludeBooleanAttr(!unref(newVariant).productId || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-ed1607f7>${ssrInterpolate(unref(saving) ? "Adding\u2026" : "Add Variant")}</button><button class="btn-ghost text-xs" data-v-ed1607f7>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/variants.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const variants = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ed1607f7"]]);

export { variants as default };
//# sourceMappingURL=variants-BUE4JJeB.mjs.map
