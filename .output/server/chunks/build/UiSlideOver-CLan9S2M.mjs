import { defineComponent, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderStyle, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { c as _export_sfc } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "UiSlideOver",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    title: {},
    subtitle: {},
    width: { default: 460 }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.modelValue) {
          _push2(`<div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" data-v-873255c1></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (__props.modelValue) {
          _push2(`<div class="fixed right-0 top-0 h-full z-[101] flex flex-col" style="${ssrRenderStyle([`width: ${__props.width}px`, { "background": "rgba(16,12,8,0.99)", "border-left": "1px solid rgba(255,255,255,0.08)", "box-shadow": "-32px 0 80px rgba(0,0,0,0.7)" }])}" data-v-873255c1><div class="flex items-center justify-between px-6 py-4 shrink-0" style="${ssrRenderStyle({ "border-bottom": "1px solid rgba(255,255,255,0.07)" })}" data-v-873255c1><div class="min-w-0" data-v-873255c1><h3 class="text-base font-bold text-gray-100 truncate" data-v-873255c1>${ssrInterpolate(__props.title)}</h3>`);
          if (__props.subtitle) {
            _push2(`<p class="text-xs text-gray-500 mt-0.5 truncate" data-v-873255c1>${ssrInterpolate(__props.subtitle)}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="flex items-center gap-2 ml-3 shrink-0" data-v-873255c1>`);
          ssrRenderSlot(_ctx.$slots, "header-actions", {}, null, _push2, _parent);
          _push2(`<button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.08] transition-all" data-v-873255c1><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-873255c1><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12" data-v-873255c1></path></svg></button></div></div><div class="flex-1 overflow-y-auto" data-v-873255c1>`);
          ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent);
          _push2(`</div>`);
          if (_ctx.$slots.footer) {
            _push2(`<div class="shrink-0" style="${ssrRenderStyle({ "border-top": "1px solid rgba(255,255,255,0.07)" })}" data-v-873255c1>`);
            ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push2, _parent);
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UiSlideOver.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-873255c1"]]);

export { __nuxt_component_3 as _ };
//# sourceMappingURL=UiSlideOver-CLan9S2M.mjs.map
