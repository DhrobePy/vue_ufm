import { a as _sfc_main$1, _ as _sfc_main$2 } from './ReportTable-BVgbf3WP.mjs';
import { defineComponent, withAsyncContext, ref, computed, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, Fragment, createVNode, renderList, withDirectives, isRef, vModelText, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './useAppSettings-Cev_RXDm.mjs';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ageing",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/ageing",
      "$NeAz2k8YRl"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
    const search = ref("");
    const summary = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.summary) != null ? _b : [];
    });
    const shown = computed(() => {
      var _a, _b;
      const s = search.value.trim().toLowerCase();
      const r = (_b = (_a = data.value) == null ? void 0 : _a.rows) != null ? _b : [];
      return s ? r.filter((x) => String(x.customer).toLowerCase().includes(s)) : r;
    });
    const m = (key, label) => ({ key, label, fmt: "money", sum: true });
    const cols = [{ key: "customer", label: "Customer" }, m("current_amt", "0\u201330 days \u09F3"), m("d30_amt", "31\u201360 days \u09F3"), m("d60_amt", "61\u201390 days \u09F3"), m("d90_amt", "91\u2013120 days \u09F3"), m("d120_amt", "120+ days \u09F3"), m("total", "Total due \u09F3"), { key: "status", label: "Status" }];
    const sheets = computed(() => [{ name: "Ageing", cols, rows: shown.value, totals: true }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReportFrame = _sfc_main$1;
      const _component_ReportTable = _sfc_main$2;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: "Ageing Report",
        subtitle: "Outstanding receivables by age of the order",
        period: `as of ${unref(today)}`,
        filename: "ageing-report",
        sheets: unref(sheets)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(error)) {
              _push2(`<div class="glass-card p-6 text-center text-red-400 text-sm"${_scopeId}>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
            } else {
              _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-5 gap-4"${_scopeId}><!--[-->`);
              ssrRenderList(unref(summary), (b) => {
                _push2(`<div class="glass-card p-4 text-center space-y-1"${_scopeId}><p class="text-[11px] font-semibold uppercase tracking-wider text-gray-600"${_scopeId}>${ssrInterpolate(b.label)}</p><p class="text-xl font-bold" style="${ssrRenderStyle(`color:${b.color}`)}"${_scopeId}>\u09F3${ssrInterpolate(Number(b.value).toLocaleString())}</p><p class="text-[11px] text-gray-600"${_scopeId}>${ssrInterpolate(b.count)} customers</p></div>`);
              });
              _push2(`<!--]--></div><input${ssrRenderAttr("value", unref(search))} type="search" placeholder="Search customers\u2026" class="no-print field-input text-xs py-1.5 w-64"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_ReportTable, {
                cols,
                rows: unref(shown),
                totals: ""
              }, null, _parent2, _scopeId));
              _push2(`<!--]-->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Loading\u2026")) : unref(error) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "glass-card p-6 text-center text-red-400 text-sm"
              }, "\u26A0 " + toDisplayString(unref(error).message), 1)) : (openBlock(), createBlock(Fragment, { key: 2 }, [
                createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-5 gap-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(summary), (b) => {
                    return openBlock(), createBlock("div", {
                      key: b.label,
                      class: "glass-card p-4 text-center space-y-1"
                    }, [
                      createVNode("p", { class: "text-[11px] font-semibold uppercase tracking-wider text-gray-600" }, toDisplayString(b.label), 1),
                      createVNode("p", {
                        class: "text-xl font-bold",
                        style: `color:${b.color}`
                      }, "\u09F3" + toDisplayString(Number(b.value).toLocaleString()), 5),
                      createVNode("p", { class: "text-[11px] text-gray-600" }, toDisplayString(b.count) + " customers", 1)
                    ]);
                  }), 128))
                ]),
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                  type: "search",
                  placeholder: "Search customers\u2026",
                  class: "no-print field-input text-xs py-1.5 w-64"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(search)]
                ]),
                createVNode(_component_ReportTable, {
                  cols,
                  rows: unref(shown),
                  totals: ""
                }, null, 8, ["rows"])
              ], 64))
            ];
          }
        }),
        _: 1
      }, _parent));
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
//# sourceMappingURL=ageing-CF8K_XRF.mjs.map
