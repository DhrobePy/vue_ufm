import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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

const perPage = 50;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "statement",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const page = ref(1);
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const monthStart = today.slice(0, 7) + "-01";
    const appliedFilters = reactive({
      account: route.query.account ? Number(route.query.account) : "",
      from: monthStart,
      to: today,
      type: ""
    });
    const filters = reactive({ ...appliedFilters });
    const { data: acctData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/dashboard",
      "$UEO0l4ar0H"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const accounts = computed(() => {
      var _a, _b;
      return (_b = (_a = acctData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const selectedAccount = computed(
      () => {
        var _a;
        return appliedFilters.account ? (_a = accounts.value.find((a) => a.id === Number(appliedFilters.account))) != null ? _a : null : null;
      }
    );
    const { data: txData, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/transactions",
      {
        query: computed(() => ({
          account: appliedFilters.account || void 0,
          from: appliedFilters.from || void 0,
          to: appliedFilters.to || void 0,
          type: appliedFilters.type || void 0,
          page: page.value,
          per: perPage
        }))
      },
      "$P3FyKwL49-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const transactions = computed(() => {
      var _a, _b;
      return (_b = (_a = txData.value) == null ? void 0 : _a.transactions) != null ? _b : [];
    });
    function printStatement() {
      (void 0).print();
    }
    function exportCsv() {
      const rows = transactions.value;
      if (!rows.length) return;
      const headers = ["Date", "Description", "Reference", "Account", "Credit", "Debit", "Status"];
      const lines = rows.map((tx) => [
        String(tx.transaction_date).slice(0, 10),
        `"${tx.description}"`,
        tx.reference_number || "",
        tx.bank_name,
        tx.entry_type === "credit" ? tx.amount : "",
        tx.entry_type === "debit" ? tx.amount : "",
        tx.status
      ].join(","));
      const csv = [headers.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `bank-statement-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Bank Statement",
        subtitle: "View and export transaction history per account",
        breadcrumb: ["Bank", "Statement"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u{1F5A8} Print</button><button class="btn-gold text-xs"${_scopeId}>\u2B07 Export CSV</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: printStatement,
                class: "btn-ghost text-xs"
              }, "\u{1F5A8} Print"),
              createVNode("button", {
                onClick: exportCsv,
                class: "btn-gold text-xs"
              }, "\u2B07 Export CSV")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3 items-center"><select class="field-input text-xs py-1.5 min-w-[220px]"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).account) ? ssrLooseContain(unref(filters).account, "") : ssrLooseEqual(unref(filters).account, "")) ? " selected" : ""}>\u2014 All Accounts \u2014</option><!--[-->`);
      ssrRenderList(unref(accounts), (a) => {
        _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(filters).account) ? ssrLooseContain(unref(filters).account, a.id) : ssrLooseEqual(unref(filters).account, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)}</option>`);
      });
      _push(`<!--]--></select><input${ssrRenderAttr("value", unref(filters).from)} type="date" class="field-input text-xs py-1.5"><span class="text-gray-600">\u2192</span><input${ssrRenderAttr("value", unref(filters).to)} type="date" class="field-input text-xs py-1.5"><select class="field-input text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "") : ssrLooseEqual(unref(filters).type, "")) ? " selected" : ""}>All Types</option><option value="credit"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "credit") : ssrLooseEqual(unref(filters).type, "credit")) ? " selected" : ""}>Credits (In)</option><option value="debit"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "debit") : ssrLooseEqual(unref(filters).type, "debit")) ? " selected" : ""}>Debits (Out)</option></select><button class="btn-ghost text-xs py-1.5">Reset</button></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Opening Balance</p><p class="text-xl font-bold text-gray-100"> \u09F3${ssrInterpolate(Number(((_a = unref(selectedAccount)) == null ? void 0 : _a.balance) || 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Credits</p><p class="text-xl font-bold text-emerald-400">\u09F3${ssrInterpolate(Number(((_b = unref(txData)) == null ? void 0 : _b.totalCredits) || 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Debits</p><p class="text-xl font-bold text-red-400">\u09F3${ssrInterpolate(Number(((_c = unref(txData)) == null ? void 0 : _c.totalDebits) || 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Net</p><p class="text-xl font-bold text-gold-400"> \u09F3${ssrInterpolate((Number(((_d = unref(txData)) == null ? void 0 : _d.totalCredits) || 0) - Number(((_e = unref(txData)) == null ? void 0 : _e.totalDebits) || 0)).toLocaleString())}</p></div></div><div id="statement-print" class="glass-card p-5"><div class="flex items-center justify-between mb-4"><div><h3 class="section-title">${ssrInterpolate(unref(selectedAccount) ? `${unref(selectedAccount).bank_name} \u2014 ${unref(selectedAccount).account_name}` : "All Accounts")}</h3>`);
        if (unref(selectedAccount)) {
          _push(`<p class="text-xs text-gray-500 mt-0.5"> AC: ${ssrInterpolate(unref(selectedAccount).account_number)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="text-right text-xs text-gray-500"><p>${ssrInterpolate(unref(appliedFilters).from || "All dates")} \u2014 ${ssrInterpolate(unref(appliedFilters).to || "present")}</p><p class="font-mono">${ssrInterpolate(((_f = unref(txData)) == null ? void 0 : _f.total) || 0)} transactions</p></div></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Ref. No.</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th></tr></thead><tbody class="divide-y divide-white/[0.04]">`);
        if (!unref(transactions).length) {
          _push(`<tr><td colspan="7" class="py-6 text-center text-gray-600">No transactions found</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(transactions), (tx) => {
          _push(`<tr class="hover:bg-white/[0.02]"><td class="py-2.5 px-3 text-gray-500 font-mono whitespace-nowrap">${ssrInterpolate(String(tx.transaction_date).slice(0, 10))}</td><td class="py-2.5 px-3 text-gray-300">${ssrInterpolate(tx.description)}</td><td class="py-2.5 px-3 text-gray-600 font-mono text-[11px]">${ssrInterpolate(tx.reference_number || "\u2014")}</td><td class="py-2.5 px-3 text-gray-500 text-[11px] whitespace-nowrap">${ssrInterpolate(tx.bank_name)}</td><td class="py-2.5 px-3 text-right text-emerald-400 font-mono">${ssrInterpolate(tx.entry_type === "credit" ? `\u09F3${Number(tx.amount).toLocaleString()}` : "\u2014")}</td><td class="py-2.5 px-3 text-right text-red-400 font-mono">${ssrInterpolate(tx.entry_type === "debit" ? `\u09F3${Number(tx.amount).toLocaleString()}` : "\u2014")}</td><td class="py-2.5 px-3 text-center">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: tx.status
          }, null, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody>`);
        if (unref(transactions).length) {
          _push(`<tfoot class="border-t-2 border-white/10"><tr><td colspan="4" class="pt-3 px-3 text-gray-600 font-semibold">Totals</td><td class="pt-3 px-3 text-right font-bold text-emerald-400 font-mono"> \u09F3${ssrInterpolate(Number(((_g = unref(txData)) == null ? void 0 : _g.totalCredits) || 0).toLocaleString())}</td><td class="pt-3 px-3 text-right font-bold text-red-400 font-mono"> \u09F3${ssrInterpolate(Number(((_h = unref(txData)) == null ? void 0 : _h.totalDebits) || 0).toLocaleString())}</td><td></td></tr></tfoot>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</table>`);
        if ((((_i = unref(txData)) == null ? void 0 : _i.total) || 0) > perPage) {
          _push(`<div class="flex items-center justify-between mt-4 text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil((((_j = unref(txData)) == null ? void 0 : _j.total) || 0) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil((((_k = unref(txData)) == null ? void 0 : _k.total) || 0) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bank/statement.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=statement-DL_zfswB.mjs.map
