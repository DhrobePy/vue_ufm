import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
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
    const source = ref("bank");
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
    const bankModuleAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = acctData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const { data: glAcctData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank-accounts",
      "$P3FyKwL49-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const glBankAccounts = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = glAcctData.value) == null ? void 0 : _a.accounts) != null ? _b : []).filter((a) => a.chart_of_account_id);
      }
    );
    const selectedBankAccount = computed(
      () => {
        var _a;
        return appliedFilters.account ? (_a = bankModuleAccounts.value.find((a) => a.id === Number(appliedFilters.account))) != null ? _a : null : null;
      }
    );
    const selectedGlAccount = computed(
      () => {
        var _a;
        return appliedFilters.account ? (_a = glBankAccounts.value.find((a) => a.id === Number(appliedFilters.account))) != null ? _a : null : null;
      }
    );
    const selectedAccountBalance = computed(() => {
      var _a, _b;
      if (source.value === "bank") return (_b = (_a = selectedBankAccount.value) == null ? void 0 : _a.balance) != null ? _b : 0;
      return 0;
    });
    const accountLabel = computed(() => {
      if (source.value === "bank") {
        const a2 = selectedBankAccount.value;
        return a2 ? `${a2.bank_name} \u2014 ${a2.account_name}` : "All Bank Accounts";
      }
      const a = selectedGlAccount.value;
      return a ? `${a.bank_name} \u2014 ${a.account_name}` : "GL Ledger \u2014 Select an account";
    });
    const accountSubtitle = computed(() => {
      var _a, _b;
      if (source.value === "bank") return (_b = (_a = selectedBankAccount.value) == null ? void 0 : _a.account_number) != null ? _b : "";
      const a = selectedGlAccount.value;
      return a ? `A/C: ${a.account_number}` : "";
    });
    const apiUrl = computed(
      () => source.value === "gl" ? "/api/bank/gl-ledger" : "/api/bank/transactions"
    );
    const apiQuery = computed(() => ({
      account: appliedFilters.account || void 0,
      from: appliedFilters.from || void 0,
      to: appliedFilters.to || void 0,
      type: appliedFilters.type || void 0,
      page: page.value,
      per: perPage
    }));
    const { data: txData, pending, error: fetchError, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      apiUrl,
      {
        query: apiQuery
      },
      "$CIWUDbpRlW"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const transactions = computed(() => {
      var _a, _b;
      return (_b = (_a = txData.value) == null ? void 0 : _a.transactions) != null ? _b : [];
    });
    function sourceLabel(s) {
      var _a, _b;
      const map = {
        ExpenseVoucher: "Expense",
        CustomerPayment: "Payment",
        GeneralTransaction: "General",
        ManualReversal: "Reversal"
      };
      return (_b = (_a = map[s]) != null ? _a : s) != null ? _b : "Journal";
    }
    function sourceColor(s) {
      var _a;
      const map = {
        ExpenseVoucher: "bg-orange-500/10 text-orange-400",
        CustomerPayment: "bg-emerald-500/10 text-emerald-400",
        ManualReversal: "bg-red-500/10 text-red-400",
        GeneralTransaction: "bg-gray-500/10 text-gray-400"
      };
      return (_a = map[s]) != null ? _a : "bg-gray-500/10 text-gray-400";
    }
    function printStatement() {
      (void 0).print();
    }
    function exportCsv() {
      const rows = transactions.value;
      if (!rows.length) return;
      const headers = ["Date", "Description", "Reference", "Source", "Credit", "Debit", "Status"];
      const lines = rows.map((tx) => {
        var _a, _b, _c;
        return [
          String(tx.transaction_date).slice(0, 10),
          `"${((_a = tx.description) != null ? _a : "").replace(/"/g, '""')}"`,
          tx.reference_number || (tx.journal_entry_id ? `JE-${tx.journal_entry_id}` : ""),
          (_c = (_b = tx.source) != null ? _b : tx.bank_name) != null ? _c : "",
          tx.entry_type === "credit" ? tx.amount : "",
          tx.entry_type === "debit" ? tx.amount : "",
          tx.status
        ].join(",");
      });
      const csv = [headers.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `bank-statement-${source.value}-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
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
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3 items-center"><div class="flex rounded-xl overflow-hidden border border-white/[0.08]"><button class="${ssrRenderClass([
        "px-3 py-1.5 text-xs font-semibold transition-all",
        unref(source) === "bank" ? "bg-gold-500/15 text-gold-300" : "text-gray-500 hover:text-gray-300"
      ])}"> \u{1F3E6} Bank Module </button><button class="${ssrRenderClass([
        "px-3 py-1.5 text-xs font-semibold transition-all border-l border-white/[0.08]",
        unref(source) === "gl" ? "bg-blue-500/15 text-blue-300" : "text-gray-500 hover:text-gray-300"
      ])}"> \u{1F4D2} GL Ledger </button></div><select class="field-input text-xs py-1.5 min-w-[240px]"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).account) ? ssrLooseContain(unref(filters).account, "") : ssrLooseEqual(unref(filters).account, "")) ? " selected" : ""}>\u2014 ${ssrInterpolate(unref(source) === "bank" ? "All Bank Accounts" : "Select GL Account")} \u2014</option>`);
      if (unref(source) === "bank") {
        _push(`<!--[-->`);
        ssrRenderList(unref(bankModuleAccounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(filters).account) ? ssrLooseContain(unref(filters).account, a.id) : ssrLooseEqual(unref(filters).account, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)}</option>`);
        });
        _push(`<!--]-->`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(glBankAccounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(filters).account) ? ssrLooseContain(unref(filters).account, a.id) : ssrLooseEqual(unref(filters).account, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)} (${ssrInterpolate(a.account_number)}) </option>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</select><input${ssrRenderAttr("value", unref(filters).from)} type="date" class="field-input text-xs py-1.5"><span class="text-gray-600">\u2192</span><input${ssrRenderAttr("value", unref(filters).to)} type="date" class="field-input text-xs py-1.5"><select class="field-input text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "") : ssrLooseEqual(unref(filters).type, "")) ? " selected" : ""}>All Types</option><option value="credit"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "credit") : ssrLooseEqual(unref(filters).type, "credit")) ? " selected" : ""}>Credits (In)</option><option value="debit"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "debit") : ssrLooseEqual(unref(filters).type, "debit")) ? " selected" : ""}>Debits (Out)</option></select><button class="btn-ghost text-xs py-1.5">Reset</button></div>`);
      if (unref(source) === "gl" && unref(appliedFilters).account) {
        _push(`<div class="text-xs text-blue-400/70 px-1 -mt-2"> \u{1F4D2} Showing all journal-entry lines posted to this account&#39;s GL ledger \u2014 includes expense payments, customer payment receipts, transfers, and manual entries. </div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(source) === "gl" && !unref(appliedFilters).account) {
        _push(`<div class="glass-card p-8 text-center text-blue-400/60 text-sm"> \u{1F4D2} Select a GL-linked bank account above to view its journal ledger. </div>`);
      } else {
        _push(`<!---->`);
      }
      if (!(unref(source) === "gl" && !unref(appliedFilters).account)) {
        _push(`<!--[-->`);
        if (unref(pending)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
        } else if (unref(fetchError)) {
          _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
        } else {
          _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Opening Balance</p><p class="text-xl font-bold text-gray-100"> \u09F3${ssrInterpolate(Number(unref(selectedAccountBalance)).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Credits (In)</p><p class="text-xl font-bold text-emerald-400">\u09F3${ssrInterpolate(Number(((_a = unref(txData)) == null ? void 0 : _a.totalCredits) || 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Debits (Out)</p><p class="text-xl font-bold text-red-400">\u09F3${ssrInterpolate(Number(((_b = unref(txData)) == null ? void 0 : _b.totalDebits) || 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Net Movement</p><p class="text-xl font-bold text-gold-400"> \u09F3${ssrInterpolate((Number(((_c = unref(txData)) == null ? void 0 : _c.totalCredits) || 0) - Number(((_d = unref(txData)) == null ? void 0 : _d.totalDebits) || 0)).toLocaleString())}</p></div></div><div id="statement-print" class="glass-card p-5"><div class="flex items-center justify-between mb-4"><div><h3 class="section-title">${ssrInterpolate(unref(accountLabel))}</h3>`);
          if (unref(accountSubtitle)) {
            _push(`<p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(accountSubtitle))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-right text-xs text-gray-500"><p>${ssrInterpolate(unref(appliedFilters).from || "All dates")} \u2192 ${ssrInterpolate(unref(appliedFilters).to || "present")}</p><p class="font-mono">${ssrInterpolate(((_e = unref(txData)) == null ? void 0 : _e.total) || 0)} entries</p></div></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Date</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Ref / JE</th>`);
          if (unref(source) === "gl") {
            _push(`<th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Source</th>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit (In)</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit (Out)</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th></tr></thead><tbody class="divide-y divide-white/[0.04]">`);
          if (!unref(transactions).length) {
            _push(`<tr><td${ssrRenderAttr("colspan", unref(source) === "gl" ? 7 : 6)} class="py-6 text-center text-gray-600">No transactions found</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(transactions), (tx) => {
            _push(`<tr class="${ssrRenderClass([tx.is_reversed ? "opacity-40" : "", "hover:bg-white/[0.02]"])}"><td class="py-2.5 px-3 text-gray-500 font-mono whitespace-nowrap">${ssrInterpolate(String(tx.transaction_date).slice(0, 10))}</td><td class="py-2.5 px-3 text-gray-300">${ssrInterpolate(tx.description)} `);
            if (tx.line_description && tx.line_description !== tx.description) {
              _push(`<span class="text-gray-600 text-[10px] block">${ssrInterpolate(tx.line_description)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td><td class="py-2.5 px-3 font-mono text-[11px]">`);
            if (unref(source) === "gl") {
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: "/accounts/journal",
                class: "text-blue-400 hover:text-blue-300 transition-colors"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(` JE-${ssrInterpolate(tx.journal_entry_id)}`);
                  } else {
                    return [
                      createTextVNode(" JE-" + toDisplayString(tx.journal_entry_id), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<span class="text-gray-600">${ssrInterpolate(tx.reference_number || "\u2014")}</span>`);
            }
            _push(`</td>`);
            if (unref(source) === "gl") {
              _push(`<td class="py-2.5 px-3 text-[11px]"><span class="${ssrRenderClass([sourceColor(tx.source), "px-1.5 py-0.5 rounded text-[10px] font-medium"])}">${ssrInterpolate(sourceLabel(tx.source))}</span></td>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<td class="py-2.5 px-3 text-right text-emerald-400 font-mono">${ssrInterpolate(tx.entry_type === "credit" ? `\u09F3${Number(tx.amount).toLocaleString()}` : "\u2014")}</td><td class="py-2.5 px-3 text-right text-red-400 font-mono">${ssrInterpolate(tx.entry_type === "debit" ? `\u09F3${Number(tx.amount).toLocaleString()}` : "\u2014")}</td><td class="py-2.5 px-3 text-center">`);
            _push(ssrRenderComponent(_component_UiStatusBadge, {
              status: tx.status
            }, null, _parent));
            _push(`</td></tr>`);
          });
          _push(`<!--]--></tbody>`);
          if (unref(transactions).length) {
            _push(`<tfoot class="border-t-2 border-white/10"><tr><td${ssrRenderAttr("colspan", unref(source) === "gl" ? 4 : 4)} class="pt-3 px-3 text-gray-600 font-semibold">Totals</td><td class="pt-3 px-3 text-right font-bold text-emerald-400 font-mono"> \u09F3${ssrInterpolate(Number(((_f = unref(txData)) == null ? void 0 : _f.totalCredits) || 0).toLocaleString())}</td><td class="pt-3 px-3 text-right font-bold text-red-400 font-mono"> \u09F3${ssrInterpolate(Number(((_g = unref(txData)) == null ? void 0 : _g.totalDebits) || 0).toLocaleString())}</td><td></td></tr></tfoot>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</table>`);
          if ((((_h = unref(txData)) == null ? void 0 : _h.total) || 0) > perPage) {
            _push(`<div class="flex items-center justify-between mt-4 text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil((((_i = unref(txData)) == null ? void 0 : _i.total) || 0) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil((((_j = unref(txData)) == null ? void 0 : _j.total) || 0) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><!--]-->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
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
//# sourceMappingURL=statement-Bb4qsmDj.mjs.map
