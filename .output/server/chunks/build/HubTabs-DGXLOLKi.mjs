import { _ as __nuxt_component_0 } from './nuxt-link-DxEkMwEk.mjs';
import { H as HUBS, a as hubTabActive } from './hubs-BW_b6Cf9.mjs';
import { defineComponent, computed, unref, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as usePermissions } from './usePermissions-0FBklcsN.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "HubTabs",
  __ssrInlineRender: true,
  props: {
    hub: {}
  },
  setup(__props) {
    const props = __props;
    const route = useRoute();
    const perms = usePermissions();
    const tabs = computed(() => {
      var _a;
      return ((_a = HUBS[props.hub]) != null ? _a : []).filter((t) => perms.canAccessRoute(t.to));
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      if (unref(tabs).length > 1) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: "flex flex-wrap gap-1.5 p-1 rounded-xl w-fit max-w-full",
          style: { "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(255,255,255,0.07)" }
        }, _attrs))}><!--[-->`);
        ssrRenderList(unref(tabs), (t) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: t.to,
            to: t.to,
            class: ["px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors", ("hubTabActive" in _ctx ? _ctx.hubTabActive : unref(hubTabActive))(t, unref(route).path) ? "btn-gold" : "text-gray-400 hover:text-gray-100 hover:bg-white/[0.06]"]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(t.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(t.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HubTabs.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=HubTabs-DGXLOLKi.mjs.map
