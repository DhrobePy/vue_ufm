import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, reactive, computed, withAsyncContext, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "statement",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const monthStart = today.slice(0, 7) + "-01";
    const filters = reactive({
      account: "",
      from: monthStart,
      to: today,
      type: ""
    });
    const applied = reactive({ ...filters });
    const apiQuery = computed(() => ({
      account: applied.account || void 0,
      from: applied.from || void 0,
      to: applied.to || void 0
    }));
    const { data, pending, error: fetchError, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/unified-ledger",
      {
        query: apiQuery
      },
      "$UEO0l4ar0H"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const accounts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const openingBalance = computed(() => {
      var _a, _b;
      return Number((_b = (_a = data.value) == null ? void 0 : _a.opening_balance) != null ? _b : 0);
    });
    const closingBalance = computed(() => {
      var _a, _b;
      return Number((_b = (_a = data.value) == null ? void 0 : _a.closing_balance) != null ? _b : 0);
    });
    const totalCredits = computed(() => {
      var _a, _b;
      return Number((_b = (_a = data.value) == null ? void 0 : _a.totalCredits) != null ? _b : 0);
    });
    const totalDebits = computed(() => {
      var _a, _b;
      return Number((_b = (_a = data.value) == null ? void 0 : _a.totalDebits) != null ? _b : 0);
    });
    const netMovement = computed(() => totalCredits.value - totalDebits.value);
    const filteredTxns = computed(() => {
      var _a, _b;
      const all = (_b = (_a = data.value) == null ? void 0 : _a.transactions) != null ? _b : [];
      if (applied.type === "credit") return all.filter((t) => Number(t.credit_in) > 0);
      if (applied.type === "debit") return all.filter((t) => Number(t.debit_out) > 0);
      return all;
    });
    const accountLabel = computed(() => {
      var _a;
      const a = (_a = data.value) == null ? void 0 : _a.bankAccount;
      return a ? `${a.bank_name} \u2014 ${a.account_name}` : "Bank Statement";
    });
    function sourceLabel(s) {
      var _a;
      const map = {
        CustomerPayment: "Payment",
        ExpenseVoucher: "Expense",
        CreditOrderDelivery: "Delivery",
        BankTransfer: "Transfer",
        Manual: "Manual",
        GeneralTransaction: "General",
        ManualReversal: "Reversal"
      };
      return (_a = map[s]) != null ? _a : s ? s.replace(/([A-Z])/g, " $1").trim() : "Entry";
    }
    function sourceColor(s) {
      var _a;
      const map = {
        CustomerPayment: "bg-emerald-500/10 text-emerald-400",
        ExpenseVoucher: "bg-orange-500/10  text-orange-400",
        CreditOrderDelivery: "bg-blue-500/10    text-blue-400",
        BankTransfer: "bg-purple-500/10  text-purple-400",
        ManualReversal: "bg-red-500/10     text-red-400",
        Manual: "bg-gray-500/10    text-gray-400",
        GeneralTransaction: "bg-gray-500/10    text-gray-400"
      };
      return (_a = map[s]) != null ? _a : "bg-gray-500/10 text-gray-400";
    }
    function printStatement() {
      (void 0).print();
    }
    function exportCsv() {
      var _a, _b, _c, _d, _e;
      const ba = (_a = data.value) == null ? void 0 : _a.bankAccount;
      const name = ba ? `${ba.bank_name}-${ba.account_name}` : "bank-statement";
      const headers = ["Date", "Description", "Source", "JE Ref", "Debit Out", "Credit In", "Balance", "Reversed"];
      const csvRows = [];
      csvRows.push([
        applied.from || "",
        '"Opening Balance"',
        "",
        "",
        "",
        "",
        openingBalance.value,
        ""
      ].join(","));
      const chrono = [...filteredTxns.value].reverse();
      for (const tx of chrono) {
        csvRows.push([
          String(tx.transaction_date).slice(0, 10),
          `"${String((_b = tx.description) != null ? _b : "").replace(/"/g, '""')}"`,
          (_c = tx.source) != null ? _c : "",
          `JE-${tx.journal_entry_id}`,
          Number(tx.debit_out) > 0 ? tx.debit_out : "",
          Number(tx.credit_in) > 0 ? tx.credit_in : "",
          tx.balance,
          tx.is_reversed ? "YES" : ""
        ].join(","));
      }
      csvRows.push([
        applied.to || today,
        '"Closing Balance"',
        "",
        "",
        totalDebits.value,
        totalCredits.value,
        closingBalance.value,
        ""
      ].join(","));
      const csv = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `${name.replace(/[^a-z0-9]/gi, "-")}-${(_d = applied.from) != null ? _d : today}-${(_e = applied.to) != null ? _e : today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Bank Account Statement",
        subtitle: "Complete passbook \u2014 every GL-posted transaction with running balance",
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
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3 items-center"><select class="field-input text-xs py-1.5 min-w-[260px]"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).account) ? ssrLooseContain(unref(filters).account, "") : ssrLooseEqual(unref(filters).account, "")) ? " selected" : ""}>\u2014 Select Bank Account \u2014</option><!--[-->`);
      ssrRenderList(unref(accounts), (a) => {
        _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(filters).account) ? ssrLooseContain(unref(filters).account, a.id) : ssrLooseEqual(unref(filters).account, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)} `);
        if (a.account_number) {
          _push(`<!--[--> (${ssrInterpolate(a.account_number)})<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</option>`);
      });
      _push(`<!--]--></select><input${ssrRenderAttr("value", unref(filters).from)} type="date" class="field-input text-xs py-1.5"><span class="text-gray-600">\u2192</span><input${ssrRenderAttr("value", unref(filters).to)} type="date" class="field-input text-xs py-1.5"><select class="field-input text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "") : ssrLooseEqual(unref(filters).type, "")) ? " selected" : ""}>All Transactions</option><option value="credit"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "credit") : ssrLooseEqual(unref(filters).type, "credit")) ? " selected" : ""}>Credits (Money In)</option><option value="debit"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "debit") : ssrLooseEqual(unref(filters).type, "debit")) ? " selected" : ""}>Debits (Money Out)</option></select><button class="btn-gold text-xs py-1.5 px-4">Apply</button><button class="btn-ghost text-xs py-1.5">Reset</button></div>`);
      if (!unref(applied).account) {
        _push(`<div class="glass-card p-14 text-center text-gray-500 text-sm space-y-2"><div class="text-4xl">\u{1F3E6}</div><p>Select a bank account above to view its complete statement</p><p class="text-xs text-gray-600">All GL-posted transactions with running balance</p></div>`);
      } else if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm"> \u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Opening Balance</p><p class="${ssrRenderClass([unref(openingBalance) >= 0 ? "text-gray-100" : "text-red-400", "text-xl font-bold"])}"> \u09F3${ssrInterpolate(unref(openingBalance).toLocaleString())}</p><p class="text-[10px] text-gray-600 mt-0.5">as of ${ssrInterpolate(unref(applied).from || "account start")}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Credits (In)</p><p class="text-xl font-bold text-emerald-400">\u09F3${ssrInterpolate(unref(totalCredits).toLocaleString())}</p><p class="text-[10px] text-gray-600 mt-0.5">money received</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Debits (Out)</p><p class="text-xl font-bold text-red-400">\u09F3${ssrInterpolate(unref(totalDebits).toLocaleString())}</p><p class="text-[10px] text-gray-600 mt-0.5">money paid out</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Closing Balance</p><p class="${ssrRenderClass([unref(closingBalance) >= 0 ? "text-gold-400" : "text-red-400", "text-xl font-bold"])}"> \u09F3${ssrInterpolate(unref(closingBalance).toLocaleString())}</p><p class="text-[10px] text-gray-600 mt-0.5">as of ${ssrInterpolate(unref(applied).to || "today")}</p></div></div><div id="statement-print" class="glass-card p-5"><div class="flex items-center justify-between mb-5"><div><h3 class="section-title">${ssrInterpolate(unref(accountLabel))}</h3>`);
        if ((_b = (_a = unref(data)) == null ? void 0 : _a.bankAccount) == null ? void 0 : _b.account_number) {
          _push(`<p class="text-xs text-gray-500 mt-0.5"> Account No: ${ssrInterpolate(unref(data).bankAccount.account_number)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="text-right text-xs text-gray-500 space-y-0.5"><p>${ssrInterpolate(unref(applied).from || "All dates")} \u2192 ${ssrInterpolate(unref(applied).to || "present")}</p><p class="font-mono">${ssrInterpolate(unref(filteredTxns).length)} entries</p></div></div><div class="overflow-x-auto"><table class="w-full text-xs min-w-[680px]"><thead><tr class="border-b border-white/[0.08]"><th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider w-[100px]">Date</th><th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th><th class="pb-2.5 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider w-[90px]">Source</th><th class="pb-2.5 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider w-[72px]">Ref</th><th class="pb-2.5 px-3 text-right text-red-400/70 font-semibold uppercase tracking-wider w-[120px]">Debit (Out)</th><th class="pb-2.5 px-3 text-right text-emerald-400/70 font-semibold uppercase tracking-wider w-[120px]">Credit (In)</th><th class="pb-2.5 px-3 text-right text-gray-400/70 font-semibold uppercase tracking-wider w-[130px]">Balance</th></tr></thead><tbody class="divide-y divide-white/[0.03]"><tr class="bg-gold-500/[0.04] border-b border-gold-500/10"><td class="py-2 px-3 text-gold-400/60 font-mono text-[11px] whitespace-nowrap">${ssrInterpolate(unref(applied).to || unref(today))}</td><td colspan="5" class="py-2 px-3 text-gold-400/70 font-medium"> \u2726 Closing Balance </td><td class="py-2 px-3 text-right font-bold text-gold-300 font-mono"> \u09F3${ssrInterpolate(unref(closingBalance).toLocaleString())}</td></tr>`);
        if (!unref(filteredTxns).length) {
          _push(`<tr><td colspan="7" class="py-10 text-center text-gray-600"> No GL transactions found for this period </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(filteredTxns), (tx) => {
          _push(`<tr class="${ssrRenderClass([tx.is_reversed ? "opacity-35" : "", "hover:bg-white/[0.025] transition-colors"])}"><td class="py-2.5 px-3 text-gray-500 font-mono whitespace-nowrap">${ssrInterpolate(String(tx.transaction_date).slice(0, 10))}</td><td class="py-2.5 px-3 text-gray-300 max-w-[300px]"><span class="leading-snug">${ssrInterpolate(tx.description)}</span>`);
          if (tx.line_description) {
            _push(`<span class="text-gray-600 text-[10px] block leading-tight mt-0.5">${ssrInterpolate(tx.line_description)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (tx.is_reversed) {
            _push(`<span class="text-red-400/70 text-[10px] block mt-0.5">\u27F2 Reversed</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="py-2.5 px-3 text-center"><span class="${ssrRenderClass(["px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap", sourceColor(tx.source)])}">${ssrInterpolate(sourceLabel(tx.source))}</span></td><td class="py-2.5 px-3 font-mono text-[11px]">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/accounts/journal",
            class: "text-blue-400/60 hover:text-blue-300 transition-colors"
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
          _push(`</td><td class="py-2.5 px-3 text-right font-mono">`);
          if (tx.debit_out > 0) {
            _push(`<span class="text-red-400"> \u09F3${ssrInterpolate(Number(tx.debit_out).toLocaleString())}</span>`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="py-2.5 px-3 text-right font-mono">`);
          if (tx.credit_in > 0) {
            _push(`<span class="text-emerald-400"> \u09F3${ssrInterpolate(Number(tx.credit_in).toLocaleString())}</span>`);
          } else {
            _push(`<span class="text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="${ssrRenderClass([Number(tx.balance) >= 0 ? "text-gray-200" : "text-red-400", "py-2.5 px-3 text-right font-mono font-semibold"])}"> \u09F3${ssrInterpolate(Number(tx.balance).toLocaleString())}</td></tr>`);
        });
        _push(`<!--]--><tr class="bg-blue-500/[0.04] border-t border-blue-500/10"><td class="py-2 px-3 text-blue-400/60 font-mono text-[11px] whitespace-nowrap">${ssrInterpolate(unref(applied).from || "Account Start")}</td><td colspan="5" class="py-2 px-3 text-blue-400/70 font-medium"> \u25C6 Opening Balance </td><td class="py-2 px-3 text-right font-bold text-blue-300 font-mono"> \u09F3${ssrInterpolate(unref(openingBalance).toLocaleString())}</td></tr></tbody>`);
        if (unref(filteredTxns).length) {
          _push(`<tfoot class="border-t-2 border-white/10"><tr><td colspan="4" class="pt-3 pb-1 px-3 text-gray-600 font-semibold text-[10px] uppercase tracking-wider"> Period Totals </td><td class="pt-3 pb-1 px-3 text-right font-bold text-red-400 font-mono"> \u09F3${ssrInterpolate(unref(totalDebits).toLocaleString())}</td><td class="pt-3 pb-1 px-3 text-right font-bold text-emerald-400 font-mono"> \u09F3${ssrInterpolate(unref(totalCredits).toLocaleString())}</td><td class="${ssrRenderClass([unref(netMovement) >= 0 ? "text-emerald-400" : "text-red-400", "pt-3 pb-1 px-3 text-right font-semibold font-mono"])}">${ssrInterpolate(unref(netMovement) >= 0 ? "+" : "")}\u09F3${ssrInterpolate(Math.abs(unref(netMovement)).toLocaleString())}</td></tr></tfoot>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</table></div>`);
        if (((_d = (_c = unref(data)) == null ? void 0 : _c.transactions) != null ? _d : []).length >= 2e3) {
          _push(`<p class="mt-3 text-center text-[11px] text-yellow-500/70"> \u26A0 Showing first 2000 entries \u2014 narrow the date range to see more </p>`);
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
//# sourceMappingURL=statement-I69DibsP.mjs.map
