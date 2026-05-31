import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
  __name: "types",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const showAddModal = ref(false);
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/account-types",
      "$ZqL6JPjvfo"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const dbTypes = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.types) != null ? _b : [];
    });
    const localTypes = reactive([]);
    const accountTypes = computed(() => [...dbTypes.value, ...localTypes]);
    const newType = reactive({ name: "", description: "" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-dfef659b>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Account Types",
        subtitle: "Configure and manage bank account types",
        breadcrumb: ["Bank", "Accounts", "Types"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-dfef659b${_scopeId}>+ Add Type</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: ($event) => showAddModal.value = true,
                class: "btn-gold text-xs"
              }, "+ Add Type", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-v-dfef659b><!--[-->`);
      ssrRenderList(unref(accountTypes), (t) => {
        _push(`<div class="glass-card p-5 space-y-3" data-v-dfef659b><div class="flex items-center justify-between" data-v-dfef659b><div class="flex items-center gap-2.5" data-v-dfef659b><div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style="${ssrRenderStyle(`background: ${t.color}20; border: 1px solid ${t.color}40; color: ${t.color}`)}" data-v-dfef659b>${ssrInterpolate(t.icon)}</div><p class="text-sm font-semibold text-gray-200" data-v-dfef659b>${ssrInterpolate(t.name)}</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: t.status
        }, null, _parent));
        _push(`</div><p class="text-xs text-gray-500 leading-relaxed" data-v-dfef659b>${ssrInterpolate(t.description)}</p><div class="flex justify-between text-xs" data-v-dfef659b><span class="text-gray-600" data-v-dfef659b>Accounts</span><span class="font-semibold text-gray-300" data-v-dfef659b>${ssrInterpolate(t.count)}</span></div><div class="flex gap-2" data-v-dfef659b><button class="btn-ghost text-xs flex-1 justify-center py-1.5" data-v-dfef659b>Edit</button></div></div>`);
      });
      _push(`<!--]--></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAddModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-dfef659b><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-dfef659b><div class="flex items-center justify-between" data-v-dfef659b><h3 class="text-lg font-bold text-gray-100" data-v-dfef659b>Add Account Type</h3><button class="text-gray-500 hover:text-gray-200" data-v-dfef659b>\u2715</button></div><div class="space-y-4" data-v-dfef659b><div class="space-y-1.5" data-v-dfef659b><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-dfef659b>Type Name *</label><input${ssrRenderAttr("value", unref(newType).name)} type="text" class="input-glass" placeholder="e.g. Foreign Currency" data-v-dfef659b></div><div class="space-y-1.5" data-v-dfef659b><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-dfef659b>Description</label><textarea rows="2" class="input-glass resize-none" data-v-dfef659b>${ssrInterpolate(unref(newType).description)}</textarea></div></div><div class="flex gap-3 pt-2" data-v-dfef659b><button${ssrIncludeBooleanAttr(!unref(newType).name) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-dfef659b>Add</button><button class="btn-ghost text-xs" data-v-dfef659b>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bank/accounts/types.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const types = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-dfef659b"]]);

export { types as default };
//# sourceMappingURL=types-D-BSaFLu.mjs.map
