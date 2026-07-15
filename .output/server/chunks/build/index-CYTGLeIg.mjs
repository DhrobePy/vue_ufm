import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderTeleport, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const showCreate = ref(false);
    const creating = ref(false);
    const createError = ref("");
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/items",
      "$2m8jQK1BxT"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const filteredItems = computed(() => {
      const q = search.value.toLowerCase();
      return items.value.filter(
        (i) => (i.item_name || "").toLowerCase().includes(q) || (i.item_code || "").toLowerCase().includes(q)
      );
    });
    const newItem = reactive({
      item_code: "",
      item_name: "",
      unit: "pcs",
      reorder_level: "",
      unit_cost: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Fleet Inventory",
        subtitle: "Parts, supplies, and stock management",
        breadcrumb: ["Fleet", "Items"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs"${_scopeId}>+ Add Item</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: ($event) => showCreate.value = true,
                class: "btn-gold text-xs"
              }, "+ Add Item", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="relative"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg><input${ssrRenderAttr("value", unref(search))} type="text" placeholder="Search item name, code\u2026" class="form-input pl-9"></div><div class="glass-card overflow-hidden"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="px-4 py-3 text-left text-gray-500">Code</th><th class="px-4 py-3 text-left text-gray-500">Item Name</th><th class="px-4 py-3 text-left text-gray-500">Category</th><th class="px-4 py-3 text-left text-gray-500">Unit</th><th class="px-4 py-3 text-right text-gray-500">Stock</th><th class="px-4 py-3 text-right text-gray-500">Reorder Level</th><th class="px-4 py-3 text-right text-gray-500">Unit Cost \u09F3</th><th class="px-4 py-3 text-left text-gray-500">Status</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(filteredItems), (item) => {
        _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02]"><td class="px-4 py-3 font-mono text-gray-400">${ssrInterpolate(item.item_code || "\u2014")}</td><td class="px-4 py-3 font-medium text-gray-200">${ssrInterpolate(item.item_name)}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(item.category_name || "\u2014")}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(item.unit)}</td><td class="${ssrRenderClass([Number(item.current_stock) <= Number(item.reorder_level) ? "text-red-400" : "text-gray-200", "px-4 py-3 text-right font-medium"])}">${ssrInterpolate(Number(item.current_stock).toFixed(2))}</td><td class="px-4 py-3 text-right text-gray-500">${ssrInterpolate(Number(item.reorder_level).toFixed(2))}</td><td class="px-4 py-3 text-right text-gray-300">${ssrInterpolate(item.unit_cost ? "\u09F3" + Number(item.unit_cost).toFixed(2) : "\u2014")}</td><td class="px-4 py-3"><span class="${ssrRenderClass([Number(item.current_stock) <= Number(item.reorder_level) ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400", "badge text-[10px]"])}">${ssrInterpolate(Number(item.current_stock) <= Number(item.reorder_level) ? "Low Stock" : "In Stock")}</span></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(filteredItems).length) {
        _push(`<tr><td colspan="8" class="px-4 py-12 text-center text-gray-600">No items found. Add your first fleet inventory item.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreate)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)" })}"><div class="glass-card p-6 w-full max-w-md space-y-4" style="${ssrRenderStyle({ "background": "rgba(18,18,20,0.98)" })}"><div class="flex items-center justify-between"><h3 class="font-semibold text-gray-200">Add Fleet Item</h3><button class="text-gray-500 hover:text-gray-300">\u2715</button></div><form class="space-y-3"><div class="grid grid-cols-2 gap-3"><div><label class="form-label">Item Code</label><input${ssrRenderAttr("value", unref(newItem).item_code)} class="form-input" placeholder="PART-001"></div><div><label class="form-label">Unit</label><select class="form-input"><option${ssrIncludeBooleanAttr(Array.isArray(unref(newItem).unit) ? ssrLooseContain(unref(newItem).unit, null) : ssrLooseEqual(unref(newItem).unit, null)) ? " selected" : ""}>pcs</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newItem).unit) ? ssrLooseContain(unref(newItem).unit, null) : ssrLooseEqual(unref(newItem).unit, null)) ? " selected" : ""}>litre</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newItem).unit) ? ssrLooseContain(unref(newItem).unit, null) : ssrLooseEqual(unref(newItem).unit, null)) ? " selected" : ""}>kg</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newItem).unit) ? ssrLooseContain(unref(newItem).unit, null) : ssrLooseEqual(unref(newItem).unit, null)) ? " selected" : ""}>set</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newItem).unit) ? ssrLooseContain(unref(newItem).unit, null) : ssrLooseEqual(unref(newItem).unit, null)) ? " selected" : ""}>pair</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newItem).unit) ? ssrLooseContain(unref(newItem).unit, null) : ssrLooseEqual(unref(newItem).unit, null)) ? " selected" : ""}>box</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newItem).unit) ? ssrLooseContain(unref(newItem).unit, null) : ssrLooseEqual(unref(newItem).unit, null)) ? " selected" : ""}>roll</option></select></div></div><div><label class="form-label">Item Name *</label><input${ssrRenderAttr("value", unref(newItem).item_name)} class="form-input" required></div><div class="grid grid-cols-2 gap-3"><div><label class="form-label">Reorder Level</label><input${ssrRenderAttr("value", unref(newItem).reorder_level)} type="number" step="0.001" class="form-input" placeholder="5"></div><div><label class="form-label">Unit Cost \u09F3</label><input${ssrRenderAttr("value", unref(newItem).unit_cost)} type="number" step="0.01" class="form-input" placeholder="0"></div></div>`);
          if (unref(createError)) {
            _push2(`<div class="p-2 rounded-lg bg-red-500/10 text-red-400 text-xs">${ssrInterpolate(unref(createError))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex gap-2 pt-1"><button type="submit" class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(creating)) ? " disabled" : ""}>${ssrInterpolate(unref(creating) ? "Saving\u2026" : "Save Item")}</button><button type="button" class="btn-secondary text-xs">Cancel</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/items/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CYTGLeIg.mjs.map
