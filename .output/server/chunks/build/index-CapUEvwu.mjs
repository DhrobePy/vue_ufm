import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import './server.mjs';
import '../nitro/nitro.mjs';
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
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const reports = [
      { title: "Trip Summary", desc: "Revenue, expenses, driver performance", to: "/fleet/reports/trips", icon: "\u{1F69B}", bg: "bg-blue-500/20" },
      { title: "Vehicle Utilisation", desc: "Fleet availability and usage analytics", to: "/fleet/reports/vehicles", icon: "\u{1F4CA}", bg: "bg-teal-500/20" },
      { title: "Fuel Efficiency", desc: "Mileage, consumption by vehicle", to: "/fleet/fuel/efficiency", icon: "\u26FD", bg: "bg-amber-500/20" },
      { title: "Maintenance Summary", desc: "Repair costs, downtime by vehicle", to: "/fleet/reports/maintenance", icon: "\u{1F527}", bg: "bg-orange-500/20" },
      { title: "Driver Performance", desc: "Trips, on-time, complaints by driver", to: "/fleet/reports/drivers", icon: "\u{1F464}", bg: "bg-purple-500/20" },
      { title: "Monthly P&L", desc: "Revenue vs cost for the period", to: "/fleet/reports/pnl", icon: "\u{1F4B0}", bg: "bg-emerald-500/20" },
      { title: "PM Rules", desc: "Manage preventive maintenance schedules", to: "/fleet/maintenance/rules", icon: "\u{1F4CB}", bg: "bg-indigo-500/20" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Fleet Reports",
        breadcrumb: ["Fleet", "Reports"]
      }, null, _parent));
      _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
      ssrRenderList(reports, (r) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: r.title,
          to: r.to,
          class: "glass-card p-5 hover:ring-1 hover:ring-white/[0.12] transition-all cursor-pointer group"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center gap-3 mb-3"${_scopeId}><div class="${ssrRenderClass([r.bg, "w-10 h-10 rounded-xl flex items-center justify-center text-xl"])}"${_scopeId}>${ssrInterpolate(r.icon)}</div><div${_scopeId}><p class="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors"${_scopeId}>${ssrInterpolate(r.title)}</p><p class="text-xs text-gray-600"${_scopeId}>${ssrInterpolate(r.desc)}</p></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-3 mb-3" }, [
                  createVNode("div", {
                    class: ["w-10 h-10 rounded-xl flex items-center justify-center text-xl", r.bg]
                  }, toDisplayString(r.icon), 3),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-sm font-semibold text-gray-200 group-hover:text-white transition-colors" }, toDisplayString(r.title), 1),
                    createVNode("p", { class: "text-xs text-gray-600" }, toDisplayString(r.desc), 1)
                  ])
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/reports/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CapUEvwu.mjs.map
