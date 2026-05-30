import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PageHeader",
  __ssrInlineRender: true,
  props: {
    title: {},
    subtitle: {},
    breadcrumb: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" }, _attrs))}><div>`);
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
      _push(`</div>`);
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
//# sourceMappingURL=PageHeader-CvF0chzj.mjs.map
