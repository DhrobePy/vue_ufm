import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as _sfc_main$1 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$2 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, Fragment, createVNode, renderList, createCommentVNode, withDirectives, isRef, vModelText, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRoute, l as useRouter } from './server.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './useAppSettings-Cev_RXDm.mjs';
import '../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "bank-statement",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const route = useRoute(), router = useRouter();
    const uuid = ref(String((_a = route.query.uuid) != null ? _a : ""));
    const from = ref(""), to = ref(""), type = ref("all"), find = ref("");
    const { data: list, pending: listPending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/bank-statement",
      { immediate: !uuid.value },
      "$7eINDu8ZyG"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const shownAccounts = computed(() => {
      var _a2, _b;
      return ((_b = (_a2 = list.value) == null ? void 0 : _a2.accounts) != null ? _b : []).filter((a) => `${a.account_name} ${a.bank_name} ${a.account_number}`.toLowerCase().includes(find.value.toLowerCase()));
    });
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/bank-statement",
      { query: computed(() => ({ uuid: uuid.value || void 0, from: from.value || void 0, to: to.value || void 0, type: type.value })), immediate: !!uuid.value, watch: [from, to, type] },
      "$8hbsWNCNg-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const back = () => {
      uuid.value = "";
      data.value = null;
      router.replace({ query: {} });
    };
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const tiles = computed(() => data.value ? [{ l: "Opening balance", v: data.value.opening }, { l: "Total debits", v: data.value.totals.debit }, { l: "Total credits", v: data.value.totals.credit }, { l: "Closing balance", v: data.value.totals.closing }] : []);
    const T = (key, label, extra = {}) => ({ key, label, ...extra });
    const cols = [T("date", "Date"), T("type", "Type"), T("description", "Description"), T("voucher", "Voucher"), T("po", "PO #"), T("supplier", "Supplier"), T("reference", "Reference"), T("method", "Method"), T("debit", "Debit \u09F3", { fmt: "money" }), T("credit", "Credit \u09F3", { fmt: "money" }), T("balance", "Balance \u09F3", { fmt: "money" })];
    const sheets = computed(() => data.value ? [{ name: "Statement", cols: cols.map((c, i) => i >= 8 && i <= 9 ? { ...c, sum: true } : c), rows: data.value.lines, totals: true }] : []);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b, _c, _d, _e, _f;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_ReportFrame = _sfc_main$1;
      const _component_ReportTable = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      if (!unref(uuid)) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: "Bank Statement",
          subtitle: "Pick a bank account to see its ledger, with the purchase payments made from it",
          breadcrumb: ["Purchase", "Bank Statement"]
        }, null, _parent));
        _push(`<input${ssrRenderAttr("value", unref(find))} type="search" placeholder="Find an account\u2026" class="field-input text-xs py-1.5 w-64">`);
        if (unref(listPending)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
        } else {
          _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"><!--[-->`);
          ssrRenderList(unref(shownAccounts), (a) => {
            _push(`<button class="glass-card p-4 text-left hover:border-gold-500/30"><div class="flex items-start justify-between"><p class="font-semibold text-gray-100">${ssrInterpolate(a.account_name)}</p>`);
            if (a.purchase_payments) {
              _push(`<span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">${ssrInterpolate(a.purchase_payments)} payments</span>`);
            } else {
              _push(`<span class="text-[10px] text-gray-600">no purchases</span>`);
            }
            _push(`</div><p class="text-xs text-gray-500">${ssrInterpolate(a.bank_name)}</p><p class="font-mono text-[11px] text-gray-600 mt-1">${ssrInterpolate(a.account_number)}</p><p class="${ssrRenderClass([a.balance < 0 ? "text-red-400" : "text-gray-300", "text-xs font-mono mt-2"])}">Ledger balance \u09F3${ssrInterpolate(n0(a.balance))}</p></button>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`<!--]-->`);
      } else {
        _push(ssrRenderComponent(_component_ReportFrame, {
          title: `Bank Statement \u2014 ${(_c = (_b = (_a2 = unref(data)) == null ? void 0 : _a2.account) == null ? void 0 : _b.account_name) != null ? _c : ""}`,
          subtitle: unref(data) ? `${unref(data).account.bank_name}${unref(data).account.branch_name ? " \xB7 " + unref(data).account.branch_name : ""} \xB7 ${unref(data).account.account_number}` : "",
          period: `${unref(from) || "beginning"} to ${unref(to) || "today"}`,
          filename: `bank-statement_${(_f = (_e = (_d = unref(data)) == null ? void 0 : _d.account) == null ? void 0 : _e.account_number) != null ? _f : ""}`,
          sheets: unref(sheets)
        }, {
          filters: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="glass-card p-4 flex flex-wrap items-center gap-2"${_scopeId}><button class="btn-ghost text-xs"${_scopeId}>\u2190 Accounts</button><input${ssrRenderAttr("value", unref(from))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><span class="text-xs text-gray-600"${_scopeId}>to</span><input${ssrRenderAttr("value", unref(to))} type="date" class="field-input text-xs py-1.5 w-36"${_scopeId}><select class="field-input text-xs py-1.5 w-44"${_scopeId}><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(type)) ? ssrLooseContain(unref(type), "all") : ssrLooseEqual(unref(type), "all")) ? " selected" : ""}${_scopeId}>All entries</option><option value="purchase"${ssrIncludeBooleanAttr(Array.isArray(unref(type)) ? ssrLooseContain(unref(type), "purchase") : ssrLooseEqual(unref(type), "purchase")) ? " selected" : ""}${_scopeId}>Purchase payments only</option><option value="transfer"${ssrIncludeBooleanAttr(Array.isArray(unref(type)) ? ssrLooseContain(unref(type), "transfer") : ssrLooseEqual(unref(type), "transfer")) ? " selected" : ""}${_scopeId}>Internal transfers only</option></select></div>`);
            } else {
              return [
                createVNode("div", { class: "glass-card p-4 flex flex-wrap items-center gap-2" }, [
                  createVNode("button", {
                    class: "btn-ghost text-xs",
                    onClick: back
                  }, "\u2190 Accounts"),
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
                    "onUpdate:modelValue": ($event) => isRef(type) ? type.value = $event : null,
                    class: "field-input text-xs py-1.5 w-44"
                  }, [
                    createVNode("option", { value: "all" }, "All entries"),
                    createVNode("option", { value: "purchase" }, "Purchase payments only"),
                    createVNode("option", { value: "transfer" }, "Internal transfers only")
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(type)]
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
                _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"${_scopeId}><!--[-->`);
                ssrRenderList(unref(tiles), (k) => {
                  _push2(`<div class="glass-card p-3"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(k.l)}</p><p class="text-lg font-bold font-mono text-gray-100"${_scopeId}>\u09F3${ssrInterpolate(n0(k.v))}</p></div>`);
                });
                _push2(`<!--]--></div>`);
                _push2(ssrRenderComponent(_component_ReportTable, {
                  cols,
                  rows: unref(data).lines
                }, null, _parent2, _scopeId));
                _push2(`<!--]-->`);
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
                  createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-4 gap-3" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(tiles), (k) => {
                      return openBlock(), createBlock("div", {
                        key: k.l,
                        class: "glass-card p-3"
                      }, [
                        createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, toDisplayString(k.l), 1),
                        createVNode("p", { class: "text-lg font-bold font-mono text-gray-100" }, "\u09F3" + toDisplayString(n0(k.v)), 1)
                      ]);
                    }), 128))
                  ]),
                  createVNode(_component_ReportTable, {
                    cols,
                    rows: unref(data).lines
                  }, null, 8, ["rows"])
                ], 64)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/bank-statement.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=bank-statement-BaeccYkr.mjs.map
