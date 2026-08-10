import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, computed, ref, withAsyncContext, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
import 'node:zlib';
import 'node:stream';
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
  __name: "requirement",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { user: sessionUser } = useUserSession();
    const role = computed(() => {
      var _a, _b;
      return ((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
    });
    const canEdit = computed(() => ["admin", "superadmin"].includes(role.value) || role.value.startsWith("production manager"));
    const date = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const branchFilter = ref("");
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/production/requirement",
      {
        query: computed(() => ({ date: date.value, branch_id: branchFilter.value || void 0 }))
      },
      "$8_AuheS_32"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.rows) != null ? _b : [];
    });
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const lockedToBranch = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.locked_to_branch) != null ? _b : false;
    });
    const inputs = reactive({});
    const saving = ref(null);
    function rowKey(r) {
      return `${r.branch_id}-${r.variant_id}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Today's Production Requirement",
        subtitle: "What's needed vs what's in hand and produced",
        breadcrumb: ["Production", "Requirement"]
      }, null, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap items-center gap-3"><label class="text-xs text-gray-500">Date</label><input${ssrRenderAttr("value", unref(date))} type="date" class="input-glass w-auto text-xs">`);
      if (unref(branches).length) {
        _push(`<!--[--><label class="text-xs text-gray-500 ml-2">Branch</label><select class="input-glass w-auto text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(branchFilter)) ? ssrLooseContain(unref(branchFilter), "") : ssrLooseEqual(unref(branchFilter), "")) ? " selected" : ""}>All Branches</option><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          _push(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(branchFilter)) ? ssrLooseContain(unref(branchFilter), b.id) : ssrLooseEqual(unref(branchFilter), b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
        });
        _push(`<!--]--></select><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (unref(lockedToBranch)) {
        _push(`<span class="text-xs text-gray-600 ml-2">Scoped to your branch</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-ghost text-xs ml-auto">\u21BB Refresh</button></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<div class="glass-card p-5">`);
        if (!unref(rows).length) {
          _push(`<div class="text-xs text-gray-600 text-center py-8">No orders due on this date for the selected scope.</div>`);
        } else {
          _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]">`);
          if (!unref(branchFilter) && !unref(lockedToBranch)) {
            _push(`<th class="pb-2 text-left text-gray-500">Branch</th>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<th class="pb-2 text-left text-gray-500">Product</th><th class="pb-2 text-right text-gray-500">Required</th><th class="pb-2 text-right text-gray-500">In Hand</th><th class="pb-2 text-right text-gray-500">Produced</th><th class="pb-2 text-right text-gray-500">Still Needed</th>`);
          if (unref(canEdit)) {
            _push(`<th class="pb-2 text-right text-gray-500">Actions</th>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(rows), (r) => {
            _push(`<tr class="${ssrRenderClass([r.still_needed_bags > 0 ? "bg-red-500/[0.03]" : "", "border-b border-white/[0.03]"])}">`);
            if (!unref(branchFilter) && !unref(lockedToBranch)) {
              _push(`<td class="py-2 text-gray-400">${ssrInterpolate(r.branch_name)}</td>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<td class="py-2 text-gray-300">${ssrInterpolate(r.product)}</td><td class="py-2 text-right font-mono text-gray-300">${ssrInterpolate(r.required_bags.toLocaleString())}`);
            if (r.required_kg) {
              _push(`<span class="text-gray-600"> (${ssrInterpolate(r.required_kg.toLocaleString())}kg)</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td><td class="py-2 text-right font-mono text-gray-400">${ssrInterpolate(r.in_hand_bags.toLocaleString())}</td><td class="py-2 text-right font-mono text-gray-400">${ssrInterpolate(r.produced_bags.toLocaleString())}</td><td class="${ssrRenderClass([r.still_needed_bags > 0 ? "text-red-400" : "text-emerald-400", "py-2 text-right font-mono font-semibold"])}">${ssrInterpolate(r.still_needed_bags.toLocaleString())}`);
            if (r.still_needed_kg) {
              _push(`<span class="text-gray-600"> (${ssrInterpolate(r.still_needed_kg.toLocaleString())}kg)</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td>`);
            if (unref(canEdit)) {
              _push(`<td class="py-2 text-right"><div class="flex items-center justify-end gap-1.5"><input${ssrRenderAttr("value", unref(inputs)[rowKey(r)])} type="number" min="0" step="0.5" placeholder="qty" class="input-glass w-16 text-xs py-1 px-1.5 text-right"><button${ssrIncludeBooleanAttr(unref(saving) === rowKey(r)) ? " disabled" : ""} class="btn-ghost text-[10px] py-1 px-1.5" title="Overwrite in-hand count">Set In-Hand</button><button${ssrIncludeBooleanAttr(unref(saving) === rowKey(r)) ? " disabled" : ""} class="btn-ghost text-[10px] py-1 px-1.5" title="Add to produced total">+ Produced</button></div></td>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</tr>`);
          });
          _push(`<!--]--></tbody></table>`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/production/requirement.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=requirement-CNUw3DL-.mjs.map
