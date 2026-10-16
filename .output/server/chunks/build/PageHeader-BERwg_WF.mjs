import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { c as _export_sfc, l as useRouter } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PageHeader",
  __ssrInlineRender: true,
  props: {
    title: {},
    subtitle: {},
    breadcrumb: {},
    hideBack: { type: Boolean }
  },
  setup(__props) {
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 min-w-0" }, _attrs))} data-v-ab407edb><div class="flex items-start gap-3 min-w-0" data-v-ab407edb>`);
      if (!__props.hideBack) {
        _push(`<button type="button" title="Go back" class="mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] border border-white/[0.06] transition-colors" data-v-ab407edb><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-ab407edb><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" data-v-ab407edb></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="min-w-0" data-v-ab407edb>`);
      if (__props.breadcrumb) {
        _push(`<div class="flex flex-wrap items-center gap-1.5 text-xs text-gray-600 mb-1.5" data-v-ab407edb><!--[-->`);
        ssrRenderList(__props.breadcrumb, (crumb, i) => {
          _push(`<span class="flex items-center gap-1.5" data-v-ab407edb><span class="${ssrRenderClass(i === __props.breadcrumb.length - 1 ? "text-gray-400" : "hover:text-gray-400 cursor-pointer transition-colors")}" data-v-ab407edb>${ssrInterpolate(crumb)}</span>`);
          if (i < __props.breadcrumb.length - 1) {
            _push(`<svg class="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-ab407edb><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" data-v-ab407edb></path></svg>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<h1 class="font-display font-bold text-xl text-white tracking-tight break-words" data-v-ab407edb>${ssrInterpolate(__props.title)}</h1>`);
      if (__props.subtitle) {
        _push(`<p class="text-sm text-gray-500 mt-0.5" data-v-ab407edb>${ssrInterpolate(__props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (_ctx.$slots.actions) {
        _push(`<div class="page-actions flex flex-wrap items-center gap-2 min-w-0 sm:justify-end sm:max-w-[60%]" data-v-ab407edb>`);
        ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/PageHeader.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ab407edb"]]);

export { __nuxt_component_0 as _ };
//# sourceMappingURL=PageHeader-BERwg_WF.mjs.map
