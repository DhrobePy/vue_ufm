import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as _sfc_main$2 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as _sfc_main$3 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, withAsyncContext, ref, computed, mergeProps, unref, withCtx, openBlock, createBlock, Fragment, withDirectives, createVNode, isRef, vModelText, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './nuxt-link-rXgW20ax.mjs';
import '../nitro/nitro.mjs';
import '@opentelemetry/api';
import 'standardwebhooks';
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
import './server.mjs';
import 'vue-router';
import './hubs-DhfvsbwY.mjs';
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
import './useAppSettings-Cev_RXDm.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "all-accounts",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/all-accounts",
      "$MgMaWO1dwS"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
    const search = ref("");
    const cols = [
      { key: "code", label: "Code" },
      { key: "name", label: "Account" },
      { key: "type", label: "Type" },
      { key: "debit", label: "Total debit \u09F3", fmt: "money", sum: true },
      { key: "credit", label: "Total credit \u09F3", fmt: "money", sum: true },
      { key: "balance", label: "Balance \u09F3", fmt: "money" }
    ];
    const shown = computed(() => {
      var _a, _b;
      const s = search.value.trim().toLowerCase();
      const r = (_b = (_a = data.value) == null ? void 0 : _a.rows) != null ? _b : [];
      return s ? r.filter((x) => `${x.code} ${x.name} ${x.type}`.toLowerCase().includes(s)) : r;
    });
    const sheets = computed(() => [{ name: "Accounts", cols, rows: shown.value, totals: true }]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HubTabs = _sfc_main$1;
      const _component_ReportFrame = _sfc_main$2;
      const _component_ReportTable = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="no-print">`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "accounts" }, null, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_ReportFrame, {
        title: "Account Balances (Non-Bank)",
        subtitle: "Every general-ledger account except banks \u2014 debit, credit and balance",
        period: `as of ${unref(today)}`,
        filename: "account-balances",
        sheets: unref(sheets)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else {
              _push2(`<!--[--><input${ssrRenderAttr("value", unref(search))} type="search" placeholder="Search code, name or type\u2026" class="no-print field-input text-xs py-1.5 w-64"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_ReportTable, {
                cols,
                rows: unref(shown),
                totals: ""
              }, null, _parent2, _scopeId));
              _push2(`<p class="no-print text-[11px] text-gray-600"${_scopeId}>Balance follows each account&#39;s normal side (assets/expenses: debit \u2212 credit; liabilities/equity/income: credit \u2212 debit). Open an account&#39;s statement from the GL Statement page.</p><!--]-->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Loading\u2026")) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(search) ? search.value = $event : null,
                  type: "search",
                  placeholder: "Search code, name or type\u2026",
                  class: "no-print field-input text-xs py-1.5 w-64"
                }, null, 8, ["onUpdate:modelValue"]), [
                  [vModelText, unref(search)]
                ]),
                createVNode(_component_ReportTable, {
                  cols,
                  rows: unref(shown),
                  totals: ""
                }, null, 8, ["rows"]),
                createVNode("p", { class: "no-print text-[11px] text-gray-600" }, "Balance follows each account's normal side (assets/expenses: debit \u2212 credit; liabilities/equity/income: credit \u2212 debit). Open an account's statement from the GL Statement page.")
              ], 64))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/all-accounts.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=all-accounts-CBG7kiLv.mjs.map
