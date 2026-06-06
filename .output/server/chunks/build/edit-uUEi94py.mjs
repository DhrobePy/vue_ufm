import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, watch, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const saving = ref(false);
    const [{ data: loadData, pending: loadPending, error: loadError }, { data: branchData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        () => `/api/purchase/grn/${route.params.id}`,
        "$OpyNbAxbjG"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/branches",
        "$tkJ-83yUXk"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const grn = computed(() => {
      var _a, _b;
      return (_b = (_a = loadData.value) == null ? void 0 : _a.grn) != null ? _b : {};
    });
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = branchData.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const form = reactive({
      grn_date: "",
      truck_number: "",
      quantity_received_kg: 0,
      expected_quantity: 0,
      unload_point_name: "",
      unload_point_branch_id: "",
      variance_remarks: "",
      remarks: ""
    });
    watch(grn, (g) => {
      if (!(g == null ? void 0 : g.id)) return;
      form.grn_date = g.grn_date || "";
      form.truck_number = g.truck_number || "";
      form.quantity_received_kg = Number(g.quantity_received_kg || 0);
      form.expected_quantity = Number(g.expected_quantity || 0);
      form.unload_point_name = g.unload_point_name || "";
      form.unload_point_branch_id = g.unload_point_branch_id || "";
      form.variance_remarks = g.variance_remarks || "";
      form.remarks = g.remarks || "";
    }, { immediate: true });
    const previewValue = computed(
      () => {
        var _a;
        return Math.round(form.quantity_received_kg * Number(((_a = grn.value) == null ? void 0 : _a.unit_price_per_kg) || 0) * 100) / 100;
      }
    );
    const isValid = computed(() => !!form.grn_date && form.quantity_received_kg > 0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Edit GRN${unref(grn).grn_number ? ` \u2014 ${unref(grn).grn_number}` : ""}`,
        subtitle: "Superadmin \u2014 modify goods received note",
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
        _push(`<!--[-->`);
        if (unref(grn).grn_status === "posted" && unref(grn).journal_entry_id) {
          _push(`<div class="glass-card p-4 border-l-4 border-amber-500/60 bg-amber-500/[0.05]"><p class="text-xs text-amber-300"> \u26A0 <strong>Note:</strong> This GRN is already posted. Editing will automatically reverse the old journal entry and generate a new one upon saving. </p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="max-w-4xl"><div class="glass-card p-4 mb-5 flex flex-wrap items-center gap-4 text-xs"><div><span class="text-gray-500">GRN #</span> <span class="font-mono text-gold-400/80 font-semibold ml-1">${ssrInterpolate(unref(grn).grn_number)}</span></div><div><span class="text-gray-500">PO #</span> <span class="text-gray-300 font-mono ml-1">${ssrInterpolate(unref(grn).po_number)}</span></div><div><span class="text-gray-500">Supplier</span> <span class="text-gray-300 ml-1">${ssrInterpolate(unref(grn).supplier_name)}</span></div><div class="ml-auto">`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(grn).grn_status
        }, null, _parent));
        _push(`</div></div><div class="glass-card p-6 space-y-5"><h3 class="section-title flex items-center gap-2">\u270F Modification Form</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5"><div class="space-y-5"><div class="space-y-1.5"><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"> GRN Date <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", unref(form).grn_date)} type="date" class="input-glass" required></div><div class="space-y-1.5"><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"> Truck Number <span class="text-red-500">*</span></label><input${ssrRenderAttr("value", unref(form).truck_number)} type="text" class="input-glass font-mono" maxlength="20" placeholder="e.g., 1234"></div><div class="space-y-1.5"><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"> Unload Point (Branch) <span class="text-red-500">*</span></label><select class="input-glass"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_branch_id) ? ssrLooseContain(unref(form).unload_point_branch_id, "") : ssrLooseEqual(unref(form).unload_point_branch_id, "")) ? " selected" : ""}>Select Branch</option><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          _push(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_branch_id) ? ssrLooseContain(unref(form).unload_point_branch_id, b.id) : ssrLooseEqual(unref(form).unload_point_branch_id, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
        });
        _push(`<!--]--></select><p class="text-[10px] text-gray-600">Or manually:</p><select class="input-glass text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "") : ssrLooseEqual(unref(form).unload_point_name, "")) ? " selected" : ""}>\u2014 Select Location \u2014</option><option value="\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C") : ssrLooseEqual(unref(form).unload_point_name, "\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C")) ? " selected" : ""}>\u09B8\u09BF\u09B0\u09BE\u099C\u0997\u099E\u09CD\u099C (Sirajganj)</option><option value="\u09A1\u09C7\u09AE\u09B0\u09BE"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09A1\u09C7\u09AE\u09B0\u09BE") : ssrLooseEqual(unref(form).unload_point_name, "\u09A1\u09C7\u09AE\u09B0\u09BE")) ? " selected" : ""}>\u09A1\u09C7\u09AE\u09B0\u09BE (Demra)</option><option value="\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE") : ssrLooseEqual(unref(form).unload_point_name, "\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE")) ? " selected" : ""}>\u09B0\u09BE\u09AE\u09AA\u09C1\u09B0\u09BE (Rampura)</option><option value="Head Office"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "Head Office") : ssrLooseEqual(unref(form).unload_point_name, "Head Office")) ? " selected" : ""}>Head Office</option><option value="Other"${ssrIncludeBooleanAttr(Array.isArray(unref(form).unload_point_name) ? ssrLooseContain(unref(form).unload_point_name, "Other") : ssrLooseEqual(unref(form).unload_point_name, "Other")) ? " selected" : ""}>Other</option></select></div><div class="space-y-1.5"><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variance Remarks</label><input${ssrRenderAttr("value", unref(form).variance_remarks)} type="text" class="input-glass" placeholder="e.g., 35kg loss during transit"></div></div><div class="space-y-5"><div class="space-y-1.5"><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"> Quantity Received (KG) <span class="text-red-500">*</span></label><div class="relative"><input${ssrRenderAttr("value", unref(form).quantity_received_kg)} type="number" step="0.01" min="0.01" class="input-glass font-black text-xl w-full pr-12" required><span class="absolute inset-y-0 right-4 flex items-center text-gray-500 text-xs font-bold">KG</span></div><p class="text-[10px] text-gray-500"> Unit Price: <span class="text-gray-300">\u09F3${ssrInterpolate(Number(unref(grn).unit_price_per_kg || 0).toLocaleString(void 0, { minimumFractionDigits: 4, maximumFractionDigits: 4 }))}/KG</span></p></div><div class="space-y-1.5"><label class="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Calculated Total Value</label><div class="relative"><input${ssrRenderAttr("value", `\u09F3${unref(previewValue).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)} readonly class="input-glass font-black text-xl text-blue-400 bg-blue-500/[0.05] border-blue-500/20 w-full pr-12"><span class="absolute inset-y-0 right-4 flex items-center text-blue-500 text-xs">\u2699</span></div><p class="text-[10px] text-blue-500/70 italic">Quantity \xD7 Unit Price (Auto-updated)</p></div><div class="space-y-1.5"><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Quantity (KG)</label><input${ssrRenderAttr("value", unref(form).expected_quantity)} type="number" step="0.01" min="0" class="input-glass font-mono" placeholder="As per truck challan"><p class="text-[10px] text-gray-600 italic">As per truck challan</p></div><div class="space-y-1.5"><label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Remarks</label><textarea rows="2" class="input-glass resize-none">${ssrInterpolate(unref(form).remarks)}</textarea></div></div></div><div class="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between"><p class="text-[10px] text-gray-600 uppercase tracking-wider">\u26A0 Superadmin Access Required</p><div class="flex items-center gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/grn/${unref(route).params.id}`,
          class: "btn-ghost text-xs"
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
        _push(`<button${ssrIncludeBooleanAttr(unref(saving) || !unref(isValid)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(saving)) {
          _push(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Update Goods Received Note")}</button></div></div></div></div><!--]-->`);
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
//# sourceMappingURL=edit-uUEi94py.mjs.map
