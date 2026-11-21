import { _ as _sfc_main$1 } from './OrderReportView-aUnNmKCs.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';
import './ReportFrame-Dts5xb5M.mjs';
import './useAppSettings-Cev_RXDm.mjs';
import './fetch-DAhIlcha.mjs';
import '../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';
import './ReportTable-B52hYz1U.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dispatch-report",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_OrderReportView = _sfc_main$1;
      _push(ssrRenderComponent(_component_OrderReportView, mergeProps({ mode: "dispatch" }, _attrs), null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/production/dispatch-report.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dispatch-report-BjtE0xvX.mjs.map
