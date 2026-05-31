import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRouter } from './server.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useRouter();
    const loading = ref(false);
    const error = ref("");
    const { data: itemsData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/items",
      "$roTLrMxcIw"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const fleetItems = computed(() => {
      var _a, _b;
      return (_b = (_a = itemsData.value) == null ? void 0 : _a.items) != null ? _b : [];
    });
    const form = reactive({
      purchase_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      supplier_name: "",
      notes: "",
      items: []
    });
    const totalAmount = computed(
      () => form.items.reduce((s, i) => s + Number(i.amount || 0), 0)
    );
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-3xl mx-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "New Purchase Order",
        breadcrumb: ["Fleet", "Purchases", "New PO"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/purchases",
              class: "btn-secondary text-xs"
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
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/fleet/purchases",
                class: "btn-secondary text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="section-title">Purchase Order Details</h3><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Purchase Date *</label><input${ssrRenderAttr("value", unref(form).purchase_date)} type="date" class="form-input" required></div><div><label class="form-label">Supplier Name</label><input${ssrRenderAttr("value", unref(form).supplier_name)} class="form-input" placeholder="Supplier / Vendor name"></div></div><div><label class="form-label">Notes</label><textarea class="form-input" rows="2" placeholder="Purchase notes or reference\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div><div class="glass-card p-5 space-y-3"><div class="flex items-center justify-between"><h3 class="section-title">Items</h3><button type="button" class="btn-secondary text-xs">+ Add Item</button></div><!--[-->`);
      ssrRenderList(unref(form).items, (item, i) => {
        _push(`<div class="grid grid-cols-12 gap-3 p-3 rounded-xl bg-white/[0.03]"><div class="col-span-4"><label class="form-label">Item</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(item.item_id) ? ssrLooseContain(item.item_id, "") : ssrLooseEqual(item.item_id, "")) ? " selected" : ""}>\u2014 Custom / Other \u2014</option><!--[-->`);
        ssrRenderList(unref(fleetItems), (it) => {
          _push(`<option${ssrRenderAttr("value", it.id)}${ssrIncludeBooleanAttr(Array.isArray(item.item_id) ? ssrLooseContain(item.item_id, it.id) : ssrLooseEqual(item.item_id, it.id)) ? " selected" : ""}>${ssrInterpolate(it.item_name)}</option>`);
        });
        _push(`<!--]--></select></div>`);
        if (!item.item_id) {
          _push(`<div class="col-span-4"><label class="form-label">Item Name *</label><input${ssrRenderAttr("value", item.item_name)} class="form-input" required placeholder="e.g. Engine Oil 5W-30"></div>`);
        } else {
          _push(`<div class="col-span-4"><label class="form-label">Item Name</label><input${ssrRenderAttr("value", item.item_name)} class="form-input bg-white/[0.02] cursor-not-allowed" disabled></div>`);
        }
        _push(`<div class="col-span-2"><label class="form-label">Qty *</label><input${ssrRenderAttr("value", item.quantity)} type="number" step="0.001" class="form-input" required></div><div class="col-span-2"><label class="form-label">Rate \u09F3</label><input${ssrRenderAttr("value", item.unit_rate)} type="number" step="0.01" class="form-input"></div><div class="col-span-12 flex justify-between items-center"><span class="text-xs text-gray-500"> Amount: <span class="text-gold-400 font-medium">\u09F3${ssrInterpolate(fmt(item.amount))}</span></span><button type="button" class="text-xs text-red-400 hover:text-red-300">Remove</button></div></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(form).items.length) {
        _push(`<div class="text-center py-4 text-gray-600 text-xs">No items added yet. Click &quot;+ Add Item&quot; to begin.</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(form).items.length) {
        _push(`<div class="flex justify-end border-t border-white/[0.06] pt-3"><div class="text-right"><p class="text-xs text-gray-500">Total Amount</p><p class="text-xl font-bold text-gold-400">\u09F3${ssrInterpolate(fmt(unref(totalAmount)))}</p></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(error)) {
        _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-3"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(loading) || !unref(form).items.length) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Creating\u2026" : "Create Purchase Order")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/purchases",
        class: "btn-secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cancel`);
          } else {
            return [
              createTextVNode("Cancel")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/purchases/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-BISXO3fL.mjs.map
