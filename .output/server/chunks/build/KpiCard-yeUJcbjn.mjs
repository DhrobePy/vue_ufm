import { _ as _sfc_main$1 } from './SidebarIcon-oZVkzwjh.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "KpiCard",
  __ssrInlineRender: true,
  props: {
    label: {},
    value: {},
    trend: {},
    trendUp: { type: Boolean },
    icon: {},
    color: {},
    subLabel: {},
    urgent: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const accentMap = {
      gold: { hex: "#f59e0b", rgb: "245,158,11" },
      blue: { hex: "#3b82f6", rgb: "59,130,246" },
      orange: { hex: "#f97316", rgb: "249,115,22" },
      teal: { hex: "#14b8a6", rgb: "20,184,166" },
      purple: { hex: "#a855f7", rgb: "168,85,247" },
      green: { hex: "#22c55e", rgb: "34,197,94" }
    };
    const accentHex = computed(() => {
      var _a, _b;
      return (_b = (_a = accentMap[props.color]) == null ? void 0 : _a.hex) != null ? _b : "#f59e0b";
    });
    const accentRgb = computed(() => {
      var _a, _b;
      return (_b = (_a = accentMap[props.color]) == null ? void 0 : _a.rgb) != null ? _b : "245,158,11";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SidebarIcon = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["glass-card-hover p-5 flex flex-col gap-3 relative overflow-hidden", __props.urgent ? "animate-glow-pulse" : ""]
      }, _attrs))}><div class="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] transition-opacity duration-200" style="${ssrRenderStyle(`background: radial-gradient(circle, ${unref(accentHex)}, transparent)`)}"></div><div class="flex items-start justify-between"><span class="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">${ssrInterpolate(__props.label)}</span><div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="${ssrRenderStyle(`background: rgba(${unref(accentRgb)}, 0.12); border: 1px solid rgba(${unref(accentRgb)}, 0.2);`)}">`);
      _push(ssrRenderComponent(_component_SidebarIcon, {
        type: __props.icon,
        class: "w-3.5 h-3.5",
        style: `color: ${unref(accentHex)}`
      }, null, _parent));
      _push(`</div></div><div><p class="font-display font-bold text-2xl text-white leading-none tracking-tight">${ssrInterpolate(__props.value)}</p><p class="text-[11px] text-gray-600 mt-1 leading-tight">${ssrInterpolate(__props.subLabel)}</p></div><div class="flex items-center gap-1.5"><span class="${ssrRenderClass(["flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md", __props.trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"])}"><svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">`);
      if (__props.trendUp) {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"></path>`);
      } else {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>`);
      }
      _push(`</svg> ${ssrInterpolate(__props.trend)}</span>`);
      if (__props.urgent) {
        _push(`<span class="text-[10px] text-gold-500 font-medium">Action needed</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/KpiCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=KpiCard-yeUJcbjn.mjs.map
