import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderSlot } from 'vue/server-renderer';
import { c as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';

const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-500" }, _attrs))}><div class="absolute inset-0 overflow-hidden pointer-events-none"><div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20" style="${ssrRenderStyle({ "background": "radial-gradient(circle, #f59e0b 0%, transparent 70%)", "filter": "blur(80px)" })}"></div><div class="absolute -bottom-60 -right-40 w-[700px] h-[700px] rounded-full opacity-10" style="${ssrRenderStyle({ "background": "radial-gradient(circle, #d97706 0%, transparent 70%)", "filter": "blur(100px)" })}"></div><div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-5" style="${ssrRenderStyle({ "background": "radial-gradient(circle, #fbbf24 0%, transparent 70%)", "filter": "blur(60px)" })}"></div></div><div class="absolute inset-0 opacity-[0.03]" style="${ssrRenderStyle({ "background-image": "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)", "background-size": "40px 40px" })}"></div>`);
  ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/auth.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const auth = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { auth as default };
//# sourceMappingURL=auth-UNuwSoTZ.mjs.map
