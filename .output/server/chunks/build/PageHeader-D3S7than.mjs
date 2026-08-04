import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { l as useRouter } from './server.mjs';

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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" }, _attrs))}><div class="flex items-start gap-3">`);
      if (!__props.hideBack) {
        _push(`<button type="button" title="Go back" class="mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] border border-white/[0.06] transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div>`);
      if (__props.breadcrumb) {
        _push(`<div class="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5"><!--[-->`);
        ssrRenderList(__props.breadcrumb, (crumb, i) => {
          _push(`<span class="flex items-center gap-1.5"><span class="${ssrRenderClass(i === __props.breadcrumb.length - 1 ? "text-gray-400" : "hover:text-gray-400 cursor-pointer transition-colors")}">${ssrInterpolate(crumb)}</span>`);
          if (i < __props.breadcrumb.length - 1) {
            _push(`<svg class="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<h1 class="font-display font-bold text-xl text-white tracking-tight">${ssrInterpolate(__props.title)}</h1>`);
      if (__props.subtitle) {
        _push(`<p class="text-sm text-gray-500 mt-0.5">${ssrInterpolate(__props.subtitle)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (_ctx.$slots.actions) {
        _push(`<div class="flex items-center gap-2 shrink-0">`);
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

export { _sfc_main as _ };
//# sourceMappingURL=PageHeader-D3S7than.mjs.map
