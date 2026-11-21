import { _ as _sfc_main$1 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$2 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, Fragment, createCommentVNode, createVNode, renderList, withDirectives, isRef, vModelText, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './useAppSettings-Cev_RXDm.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "chairman-reports",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const dhaka = (d = /* @__PURE__ */ new Date()) => new Date(d.getTime() + 6 * 36e5).toISOString().slice(0, 10);
    const t0 = dhaka(), mStart = t0.slice(0, 8) + "01";
    const weekStart = dhaka(new Date(Date.now() - (new Date(Date.now() + 6 * 36e5).getUTCDay() + 6) % 7 * 864e5));
    const qStart = `${t0.slice(0, 4)}-${String(Math.floor((Number(t0.slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, "0")}-01`;
    const presets = [{ l: "Today", from: t0, to: t0 }, { l: "This week", from: weekStart, to: t0 }, { l: "This month", from: mStart, to: t0 }, { l: "This quarter", from: qStart, to: t0 }, { l: "This year", from: t0.slice(0, 4) + "-01-01", to: t0 }];
    const type = ref("completed_sales"), from = ref(mStart), to = ref(t0), branch = ref("");
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/chairman-report",
      { query: computed(() => ({ type: type.value, date_from: from.value, date_to: to.value, branch_id: branch.value || void 0 })), watch: [type, from, to, branch] },
      "$wczZTMvRkJ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: bdata } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$ZDmDV_JinC"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const branches = computed(() => {
      var _a, _b;
      return (_b = (_a = bdata.value) == null ? void 0 : _a.branches) != null ? _b : [];
    });
    const sheets = computed(() => data.value ? [{ name: String(data.value.label).slice(0, 30), cols: data.value.cols, rows: data.value.rows, totals: true }] : []);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_ReportFrame = _sfc_main$1;
      const _component_ReportTable = _sfc_main$2;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: `Chairman's Report \u2014 ${(_b = (_a = unref(data)) == null ? void 0 : _a.label) != null ? _b : ""}`,
        subtitle: "Date-ranged reports for the chairman: sales, receivables, collections, expenses, purchases and more",
        period: `${unref(from)} to ${unref(to)}`,
        filename: `chairman_${unref(type)}_${unref(from)}_to_${unref(to)}`,
        sheets: unref(sheets)
      }, _attrs), {
        filters: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c, _d;
          if (_push2) {
            _push2(`<div class="glass-card p-4 space-y-3"${_scopeId}><div class="flex flex-wrap gap-1.5"${_scopeId}><!--[-->`);
            ssrRenderList((_b2 = (_a2 = unref(data)) == null ? void 0 : _a2.types) != null ? _b2 : {}, (l, k) => {
              _push2(`<button class="${ssrRenderClass([unref(type) === k ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300", "px-3 py-1.5 rounded-xl text-xs border transition-all"])}"${_scopeId}>${ssrInterpolate(l)}</button>`);
            });
            _push2(`<!--]--></div><div class="flex flex-wrap items-center gap-2"${_scopeId}><!--[-->`);
            ssrRenderList(presets, (p) => {
              _push2(`<button class="px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200"${_scopeId}>${ssrInterpolate(p.l)}</button>`);
            });
            _push2(`<!--]--><input${ssrRenderAttr("value", unref(from))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><span class="text-xs text-gray-600"${_scopeId}>to</span><input${ssrRenderAttr("value", unref(to))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><select class="field-input text-xs py-1.5 w-44"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(branch)) ? ssrLooseContain(unref(branch), "") : ssrLooseEqual(unref(branch), "")) ? " selected" : ""}${_scopeId}>All factories</option><!--[-->`);
            ssrRenderList(unref(branches), (b) => {
              _push2(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(branch)) ? ssrLooseContain(unref(branch), b.id) : ssrLooseEqual(unref(branch), b.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(b.name)}</option>`);
            });
            _push2(`<!--]--></select></div></div>`);
          } else {
            return [
              createVNode("div", { class: "glass-card p-4 space-y-3" }, [
                createVNode("div", { class: "flex flex-wrap gap-1.5" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList((_d = (_c = unref(data)) == null ? void 0 : _c.types) != null ? _d : {}, (l, k) => {
                    return openBlock(), createBlock("button", {
                      key: k,
                      class: ["px-3 py-1.5 rounded-xl text-xs border transition-all", unref(type) === k ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300"],
                      onClick: ($event) => type.value = String(k)
                    }, toDisplayString(l), 11, ["onClick"]);
                  }), 128))
                ]),
                createVNode("div", { class: "flex flex-wrap items-center gap-2" }, [
                  (openBlock(), createBlock(Fragment, null, renderList(presets, (p) => {
                    return createVNode("button", {
                      key: p.l,
                      class: "px-3 py-1.5 rounded-xl text-xs border border-white/[0.07] text-gray-400 hover:text-gray-200",
                      onClick: ($event) => {
                        from.value = p.from;
                        to.value = p.to;
                      }
                    }, toDisplayString(p.l), 9, ["onClick"]);
                  }), 64)),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(from) ? from.value = $event : null,
                    type: "date",
                    class: "field-input text-xs py-1.5 w-36"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(from)]
                  ]),
                  createVNode("span", { class: "text-xs text-gray-600" }, "to"),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => isRef(to) ? to.value = $event : null,
                    type: "date",
                    class: "field-input text-xs py-1.5 w-36"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(to)]
                  ]),
                  withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => isRef(branch) ? branch.value = $event : null,
                    class: "field-input text-xs py-1.5 w-44"
                  }, [
                    createVNode("option", { value: "" }, "All factories"),
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(branches), (b) => {
                      return openBlock(), createBlock("option", {
                        key: b.id,
                        value: b.id
                      }, toDisplayString(b.name), 9, ["value"]);
                    }), 128))
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(branch)]
                  ])
                ])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(error)) {
              _push2(`<div class="glass-card p-6 text-center text-red-400 text-sm"${_scopeId}>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
            } else if (unref(data)) {
              _push2(`<!--[-->`);
              if (unref(data).note) {
                _push2(`<p class="text-xs text-gray-500"${_scopeId}>${ssrInterpolate(unref(data).note)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(ssrRenderComponent(_component_ReportTable, {
                cols: unref(data).cols,
                rows: unref(data).rows,
                totals: ""
              }, null, _parent2, _scopeId));
              _push2(`<p class="no-print text-[11px] text-gray-600"${_scopeId}>${ssrInterpolate(unref(data).rows.length)} row(s). Use Excel / CSV for spreadsheets, Print / PDF for the formatted copy.</p><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Loading\u2026")) : unref(error) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "glass-card p-6 text-center text-red-400 text-sm"
              }, "\u26A0 " + toDisplayString(unref(error).message), 1)) : unref(data) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                unref(data).note ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-xs text-gray-500"
                }, toDisplayString(unref(data).note), 1)) : createCommentVNode("", true),
                createVNode(_component_ReportTable, {
                  cols: unref(data).cols,
                  rows: unref(data).rows,
                  totals: ""
                }, null, 8, ["cols", "rows"]),
                createVNode("p", { class: "no-print text-[11px] text-gray-600" }, toDisplayString(unref(data).rows.length) + " row(s). Use Excel / CSV for spreadsheets, Print / PDF for the formatted copy.", 1)
              ], 64)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/chairman-reports.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=chairman-reports-DA6d7YGv.mjs.map
