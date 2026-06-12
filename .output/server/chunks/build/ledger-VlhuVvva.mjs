import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, ref, computed, withAsyncContext, mergeProps, unref, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-6DwEuDDc.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
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
  __name: "ledger",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const selectedCustomerId = ref("");
    const dateFrom = ref("");
    const dateTo = ref("");
    const appliedCustomerId = ref("");
    const appliedFrom = ref("");
    const appliedTo = ref("");
    const queryParams = computed(() => ({
      customer_id: appliedCustomerId.value || void 0,
      date_from: appliedFrom.value || void 0,
      date_to: appliedTo.value || void 0
    }));
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/ledger",
      {
        query: queryParams
      },
      "$pWSnpufZST"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const ledger = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.ledger) != null ? _b : [];
    });
    const customerList = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.customers) != null ? _b : [];
    });
    const totalDebit = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.totalDebit) != null ? _b : 0;
    });
    const totalCredit = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.totalCredit) != null ? _b : 0;
    });
    const balance = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.balance) != null ? _b : 0;
    });
    const cols = [
      { key: "date", label: "Date", sortable: true },
      { key: "type", label: "Type", sortable: true },
      { key: "ref", label: "Reference" },
      { key: "description", label: "Description" },
      { key: "debit", label: "Debit (\u09F3)" },
      { key: "credit", label: "Credit (\u09F3)" },
      { key: "balance", label: "Balance (\u09F3)", sortable: true }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Customer Ledger",
        subtitle: "Running debit \xB7 credit \xB7 balance per customer",
        breadcrumb: ["Credit Sales", "Customer Ledger"]
      }, null, _parent));
      _push(`<div class="flex gap-3 flex-wrap"><select class="input-glass w-64"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCustomerId)) ? ssrLooseContain(unref(selectedCustomerId), "") : ssrLooseEqual(unref(selectedCustomerId), "")) ? " selected" : ""}>All Customers</option><!--[-->`);
      ssrRenderList(unref(customerList), (c) => {
        _push(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedCustomerId)) ? ssrLooseContain(unref(selectedCustomerId), c.id) : ssrLooseEqual(unref(selectedCustomerId), c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select><input type="date"${ssrRenderAttr("value", unref(dateFrom))} class="input-glass w-40"><input type="date"${ssrRenderAttr("value", unref(dateTo))} class="input-glass w-40"><button class="btn-ghost text-xs">Filter</button>`);
      if (unref(perms).canDo("credit_sales", "ledger", "export")) {
        _push(`<button class="btn-gold text-xs">Export</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-3 gap-4"><div class="glass-card p-4 text-center"><p class="text-xs text-gray-500 mb-1">Total Debit</p><p class="text-xl font-bold text-red-400">\u09F3${ssrInterpolate(Number(unref(totalDebit)).toLocaleString())}</p></div><div class="glass-card p-4 text-center"><p class="text-xs text-gray-500 mb-1">Total Credit</p><p class="text-xl font-bold text-emerald-400">\u09F3${ssrInterpolate(Number(unref(totalCredit)).toLocaleString())}</p></div><div class="glass-card p-4 text-center"><p class="text-xs text-gray-500 mb-1">Balance (Due)</p><p class="text-xl font-bold text-gold-400">\u09F3${ssrInterpolate(Number(unref(balance)).toLocaleString())}</p></div></div>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(ledger),
          "per-page": 15,
          exportable: "",
          "search-placeholder": "Search transactions\u2026"
        }, {
          "cell-debit": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-red-400 font-mono text-xs"${_scopeId}>${ssrInterpolate(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-red-400 font-mono text-xs" }, toDisplayString(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-credit": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-emerald-400 font-mono text-xs"${_scopeId}>${ssrInterpolate(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-emerald-400 font-mono text-xs" }, toDisplayString(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "\u2014"), 1)
              ];
            }
          }),
          "cell-balance": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-bold text-gold-400 font-mono text-xs"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-bold text-gold-400 font-mono text-xs" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/ledger.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ledger-VlhuVvva.mjs.map
