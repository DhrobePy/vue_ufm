import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './PricingEnginePanel-CRqah_4n.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import './useToast-Mxh_qoqg.mjs';
import './server.mjs';
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
import 'vue-router';
import './fetch-BiYh1qCk.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pricing-engine",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_PricingEnginePanel = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Smart Pricing Engine",
        subtitle: "Factory base prices flow to every sales region \u2014 freight & charges added automatically",
        breadcrumb: ["Products", "Pricing Engine"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30"${_scopeId}> \u{1F512} Admin Only </span><a href="/products/pricing" class="text-xs text-gray-500 hover:text-gray-300 underline"${_scopeId}>\u2190 Manual pricing</a>`);
          } else {
            return [
              createVNode("span", { class: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30" }, " \u{1F512} Admin Only "),
              createVNode("a", {
                href: "/products/pricing",
                class: "text-xs text-gray-500 hover:text-gray-300 underline"
              }, "\u2190 Manual pricing")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_PricingEnginePanel, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/products/pricing-engine.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pricing-engine-eQ5QQXnH.mjs.map
