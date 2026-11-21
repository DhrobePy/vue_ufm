import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CrmCapture",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    geo: {},
    pin: { type: Boolean }
  },
  emits: ["update:modelValue", "update:geo", "update:pin"],
  setup(__props, { emit: __emit }) {
    const locating = ref(false), listening = ref(false), msg = ref(""), lang = ref("bn-BD"), canDictate = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-wrap items-center gap-2 text-[11px] text-gray-400" }, _attrs))}><button type="button" class="btn-ghost text-[11px] px-2.5 py-1"${ssrIncludeBooleanAttr(unref(locating)) ? " disabled" : ""}>\u{1F4CD} ${ssrInterpolate(__props.geo ? `Location captured (\xB1${__props.geo.acc} m)` : unref(locating) ? "Locating\u2026" : "Capture my location")}</button>`);
      if (__props.geo) {
        _push(`<label class="flex items-center gap-1"><input type="checkbox"${ssrIncludeBooleanAttr(__props.pin) ? " checked" : ""}> Save as this place&#39;s location</label>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(canDictate)) {
        _push(`<!--[--><button type="button" class="btn-ghost text-[11px] px-2.5 py-1">${ssrInterpolate(unref(listening) ? "\u23F9 Stop" : "\u{1F399} Dictate")}</button><select class="field-input text-[11px] py-1 w-24"><option value="bn-BD"${ssrIncludeBooleanAttr(Array.isArray(unref(lang)) ? ssrLooseContain(unref(lang), "bn-BD") : ssrLooseEqual(unref(lang), "bn-BD")) ? " selected" : ""}>\u09AC\u09BE\u0982\u09B2\u09BE</option><option value="en-US"${ssrIncludeBooleanAttr(Array.isArray(unref(lang)) ? ssrLooseContain(unref(lang), "en-US") : ssrLooseEqual(unref(lang), "en-US")) ? " selected" : ""}>English</option></select><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (unref(msg)) {
        _push(`<span class="text-amber-400">${ssrInterpolate(unref(msg))}</span>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CrmCapture.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=CrmCapture-DZl4jzVe.mjs.map
