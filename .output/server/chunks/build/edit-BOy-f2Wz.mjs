import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, watch, mergeProps, withCtx, unref, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const saving = ref(false);
    const { data: loadData, pending: loadPending, error: loadError } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/purchase/grn/${route.params.id}`,
      "$OpyNbAxbjG"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const grn = computed(() => {
      var _a, _b;
      return (_b = (_a = loadData.value) == null ? void 0 : _a.grn) != null ? _b : {};
    });
    const form = reactive({
      grn_date: "",
      truck_number: "",
      quantity_received_kg: 0,
      unload_point_name: "",
      remarks: ""
    });
    watch(grn, (g) => {
      if (!(g == null ? void 0 : g.id)) return;
      form.grn_date = g.grn_date || "";
      form.truck_number = g.truck_number || "";
      form.quantity_received_kg = Number(g.quantity_received_kg || 0);
      form.unload_point_name = g.unload_point_name || "";
      form.remarks = g.remarks || "";
    }, { immediate: true });
    const previewValue = computed(
      () => Math.round(form.quantity_received_kg * Number(grn.value.unit_price_per_kg || 0))
    );
    const isValid = computed(() => form.grn_date && form.quantity_received_kg > 0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Edit GRN",
        subtitle: "Update goods received note details",
        breadcrumb: ["Purchase", "GRNs", "Edit"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/purchase/grn/${unref(route).params.id}`,
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
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: `/purchase/grn/${unref(route).params.id}`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Back")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(loadPending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(loadError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(loadError).message)}</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">GRN Details</h3><div class="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 text-xs space-y-1"><div class="flex justify-between"><span class="text-gray-600">GRN #</span><span class="font-mono text-gold-400/80">${ssrInterpolate(unref(grn).grn_number)}</span></div><div class="flex justify-between"><span class="text-gray-600">PO #</span><span class="text-gray-300">${ssrInterpolate(unref(grn).po_number)}</span></div><div class="flex justify-between"><span class="text-gray-600">Supplier</span><span class="text-gray-300">${ssrInterpolate(unref(grn).supplier_name)}</span></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">GRN Date *</label><input${ssrRenderAttr("value", unref(form).grn_date)} type="date" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Transport Vehicle</label><input${ssrRenderAttr("value", unref(form).truck_number)} type="text" class="input-glass" placeholder="Reg. plate / vehicle no."></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quantity Received (kg)</label><input${ssrRenderAttr("value", unref(form).quantity_received_kg)} type="number" min="0" step="0.01" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Unload Point</label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "") : ssrLooseEqual(unref(form).unload_point_name, "")) ? " selected" : ""}>\u2014 Select \u2014</option><option value="\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C") : ssrLooseEqual(unref(form).unload_point_name, "\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C")) ? " selected" : ""}>\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C</option><option value="\u09A1\u09C7\u09AE\u09B0\u09BE"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09A1\u09C7\u09AE\u09B0\u09BE") : ssrLooseEqual(unref(form).unload_point_name, "\u09A1\u09C7\u09AE\u09B0\u09BE")) ? " selected" : ""}>\u09A1\u09C7\u09AE\u09B0\u09BE</option><option value="\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE") : ssrLooseEqual(unref(form).unload_point_name, "\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE")) ? " selected" : ""}>\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE</option><option value="Head Office"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "Head Office") : ssrLooseEqual(unref(form).unload_point_name, "Head Office")) ? " selected" : ""}>Head Office</option><option value="Other"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "Other") : ssrLooseEqual(unref(form).unload_point_name, "Other")) ? " selected" : ""}>Other</option></select></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Remarks</label><textarea rows="3" class="input-glass resize-none" placeholder="Any notes\u2026">${ssrInterpolate(unref(form).remarks)}</textarea></div><div class="flex items-center gap-3 pt-2"><button${ssrIncludeBooleanAttr(unref(saving) || !unref(isValid)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/grn/${unref(route).params.id}`,
          class: "btn-ghost"
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
        _push(`</div></div></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Value Preview</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Qty</span><span class="font-mono text-gray-300">${ssrInterpolate(unref(form).quantity_received_kg.toLocaleString())} kg</span></div><div class="flex justify-between"><span class="text-gray-600">Unit Price</span><span class="font-mono text-gray-300">\u09F3${ssrInterpolate(Number(unref(grn).unit_price_per_kg || 0).toLocaleString())}/kg</span></div><div class="h-px bg-white/[0.06]"></div><div class="flex justify-between"><span class="text-gray-600 font-semibold">Total Value</span><span class="font-bold text-gold-400">\u09F3${ssrInterpolate(unref(previewValue).toLocaleString())}</span></div></div></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/grn/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=edit-BOy-f2Wz.mjs.map
