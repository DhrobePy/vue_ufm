import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, unref, openBlock, createBlock, createCommentVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-Bt-D0WF_.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
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
import './permRoutes-Ddy1yO1t.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ageing",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/ageing",
      "$NeAz2k8YRl"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const summary = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.summary) != null ? _b : [];
    });
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.rows) != null ? _b : [];
    });
    const cols = [
      { key: "customer", label: "Customer", sortable: true },
      { key: "current_amt", label: "0\u201330 Days" },
      { key: "d30_amt", label: "31\u201360 Days" },
      { key: "d60_amt", label: "61\u201390 Days" },
      { key: "d90_amt", label: "91\u2013120 Days" },
      { key: "d120_amt", label: "120+ Days" },
      { key: "total", label: "Total Due", sortable: true },
      { key: "status", label: "Status" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Ageing Report",
        subtitle: "Outstanding receivables by age bucket",
        breadcrumb: ["Credit Sales", "Ageing Report"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(perms).canDo("credit_sales", "ageing", "export")) {
              _push2(`<button class="btn-gold text-xs"${_scopeId}>Export PDF</button>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(perms).canDo("credit_sales", "ageing", "export") ? (openBlock(), createBlock("button", {
                key: 0,
                class: "btn-gold text-xs"
              }, "Export PDF")) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-5 gap-4"><!--[-->`);
        ssrRenderList(unref(summary), (b) => {
          _push(`<div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] font-semibold uppercase tracking-wider text-gray-600">${ssrInterpolate(b.label)}</p><p class="text-xl font-bold" style="${ssrRenderStyle(`color:${b.color}`)}">\u09F3${ssrInterpolate(Number(b.value).toLocaleString())}</p><p class="text-[11px] text-gray-600">${ssrInterpolate(b.count)} customers</p></div>`);
        });
        _push(`<!--]--></div>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(rows),
          "per-page": 12,
          exportable: "",
          "search-placeholder": "Search customers\u2026"
        }, {
          "cell-current_amt": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-emerald-400"${_scopeId}>${ssrInterpolate(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-emerald-400" }, toDisplayString(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-d30_amt": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-yellow-400"${_scopeId}>${ssrInterpolate(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-yellow-400" }, toDisplayString(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-d60_amt": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-orange-400"${_scopeId}>${ssrInterpolate(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-orange-400" }, toDisplayString(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-d90_amt": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-red-400"${_scopeId}>${ssrInterpolate(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-red-400" }, toDisplayString(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-d120_amt": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-red-600 font-bold"${_scopeId}>${ssrInterpolate(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-red-600 font-bold" }, toDisplayString(value > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-total": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-bold text-gold-400 font-mono text-xs"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-bold text-gold-400 font-mono text-xs" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/ageing.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ageing-CVtN9mrd.mjs.map
