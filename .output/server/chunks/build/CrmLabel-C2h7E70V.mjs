import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CrmLabel",
  __ssrInlineRender: true,
  props: {
    label: {}
  },
  setup(__props) {
    const props = __props;
    const cls = computed(() => {
      var _a;
      return (_a = {
        Risky: "bg-red-500/15 text-red-300",
        Slipping: "bg-amber-500/15 text-amber-300",
        Dormant: "bg-orange-500/15 text-orange-300",
        Growing: "bg-emerald-500/15 text-emerald-300",
        Loyal: "bg-blue-500/15 text-blue-300",
        Steady: "bg-white/10 text-gray-300",
        "Never bought": "bg-white/5 text-gray-500"
      }[props.label]) != null ? _a : "bg-white/10 text-gray-300";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap", unref(cls)]
      }, _attrs))}>${ssrInterpolate(__props.label)}</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CrmLabel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=CrmLabel-C2h7E70V.mjs.map
