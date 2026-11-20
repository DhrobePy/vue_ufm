import { defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderSlot, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { u as useAppSettings } from './useAppSettings-Cev_RXDm.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
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
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReportFrame.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ReportTable",
  __ssrInlineRender: true,
  props: {
    cols: {},
    rows: {},
    totals: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const alignCls = (c) => {
      var _a;
      return ((_a = c.align) != null ? _a : c.fmt === "money" || c.fmt === "qty" ? "right" : "left") === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left";
    };
    const show = (c, v) => c.fmt === "money" ? Number(v != null ? v : 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) : c.fmt === "qty" ? Number(v != null ? v : 0).toLocaleString("en-US", { maximumFractionDigits: 2 }) : v != null ? v : "";
    const total = (c) => props.rows.reduce((a, r) => {
      var _a;
      return a + Number((_a = r[c.key]) != null ? _a : 0);
    }, 0);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "glass-card overflow-x-auto" }, _attrs))}><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><!--[-->`);
      ssrRenderList(__props.cols, (c) => {
        _push(`<th class="${ssrRenderClass([alignCls(c), "px-3 py-2 font-semibold whitespace-nowrap"])}">${ssrInterpolate(c.label)}</th>`);
      });
      _push(`<!--]--></tr></thead><tbody><!--[-->`);
      ssrRenderList(__props.rows, (r, i) => {
        _push(`<tr class="border-b border-white/[0.04] hover:bg-white/[0.02]"><!--[-->`);
        ssrRenderList(__props.cols, (c) => {
          _push(`<td class="${ssrRenderClass([[alignCls(c), c.fmt === "money" || c.fmt === "qty" ? "font-mono" : ""], "px-3 py-1.5 whitespace-nowrap"])}">${ssrInterpolate(show(c, r[c.key]))}</td>`);
        });
        _push(`<!--]--></tr>`);
      });
      _push(`<!--]-->`);
      if (!__props.rows.length) {
        _push(`<tr><td${ssrRenderAttr("colspan", __props.cols.length)} class="px-3 py-8 text-center text-gray-600">No records for this period</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody>`);
      if (__props.totals && __props.rows.length) {
        _push(`<tfoot><tr class="border-t border-white/[0.12] font-semibold text-gray-200"><!--[-->`);
        ssrRenderList(__props.cols, (c, i) => {
          _push(`<td class="${ssrRenderClass([alignCls(c), "px-3 py-2"])}">${ssrInterpolate(i === 0 ? "Total" : c.sum ? show(c, total(c)) : "")}</td>`);
        });
        _push(`<!--]--></tr></tfoot>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</table></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReportTable.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _, _sfc_main$1 as a };
//# sourceMappingURL=ReportTable-BVgbf3WP.mjs.map
