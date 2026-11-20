import { defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderSlot } from 'vue/server-renderer';
import { u as useAppSettings } from './useAppSettings-Cev_RXDm.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ReportFrame",
  __ssrInlineRender: true,
  props: {
    title: {},
    subtitle: {},
    period: {},
    filename: {},
    sheets: {},
    activeSheet: {}
  },
  setup(__props) {
    const { company } = useAppSettings();
    const now = (/* @__PURE__ */ new Date()).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "report-frame space-y-5" }, _attrs))}><div class="no-print flex flex-wrap items-start justify-between gap-3"><div><h1 class="text-xl font-bold text-gray-100">${ssrInterpolate(__props.title)}</h1><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(__props.subtitle)}</p></div><div class="flex gap-2"><button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(!__props.sheets.length) ? " disabled" : ""}>Excel</button><button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(!__props.sheets.length) ? " disabled" : ""}>CSV</button><button class="btn-gold text-xs">Print / PDF</button></div></div><div class="no-print">`);
      ssrRenderSlot(_ctx.$slots, "filters", {}, null, _push, _parent);
      _push(`</div><div class="print-only report-letterhead"><div><strong>${ssrInterpolate(unref(company).name)}</strong><div>${ssrInterpolate(unref(company).address)}</div><div>${ssrInterpolate(unref(company).phone)}</div></div><div class="r"><strong>${ssrInterpolate(__props.title)}</strong><div>${ssrInterpolate(__props.period)}</div><div>Generated ${ssrInterpolate(unref(now))}</div></div></div>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`<div class="print-only report-foot">Prepared from live data \xB7 ${ssrInterpolate(unref(company).name)} \xB7 ${ssrInterpolate(unref(now))}</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReportFrame.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ReportFrame-Dts5xb5M.mjs.map
