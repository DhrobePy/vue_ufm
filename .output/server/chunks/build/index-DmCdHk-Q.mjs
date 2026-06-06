import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { success, error: toastError } = useToast();
    const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#0ea5e9"];
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/dashboard",
      "$lY9k_JJHJx"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const accounts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const pendingRows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.pendingTxns) != null ? _b : [];
    });
    const { data: glAcctData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank-accounts",
      "$zsEh-WG0BN"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const glAccounts = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = glAcctData.value) == null ? void 0 : _a.accounts) != null ? _b : []).filter((a) => a.chart_of_account_id);
      }
    );
    function fmtLakh(n) {
      if (n >= 1e7) return (n / 1e7).toFixed(2) + "Cr";
      if (n >= 1e5) return (n / 1e5).toFixed(1) + "L";
      if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
      return n.toLocaleString();
    }
    const acting = ref(null);
    async function doAction(row, action) {
      var _a, _b;
      acting.value = row.id;
      try {
        await $fetch(`/api/bank/transactions/${row.id}`, {
          method: "PATCH",
          body: { action }
        });
        success(`Transaction ${action}d \u2713`);
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : `Failed to ${action} transaction`);
      } finally {
        acting.value = null;
      }
    }
    const cols = [
      { key: "transaction_number", label: "Txn #", sortable: true },
      { key: "transaction_date", label: "Date", sortable: true },
      { key: "bank_name", label: "Account", sortable: true },
      { key: "entry_type", label: "Type" },
      { key: "amount", label: "Amount", sortable: true },
      { key: "description", label: "Description" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Bank",
        subtitle: "Maker-checker bank transactions \xB7 transfers \xB7 statements",
        breadcrumb: ["Bank"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/bank/transfer",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Transfer`);
                } else {
                  return [
                    createTextVNode("Transfer")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/bank/transaction/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Transaction`);
                } else {
                  return [
                    createTextVNode("+ New Transaction")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/bank/transfer",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("Transfer")
                ]),
                _: 1
              }),
              createVNode(_component_NuxtLink, {
                to: "/bank/transaction/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Transaction")
                ]),
                _: 1
              })
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
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Total Balance</p><p class="text-2xl font-bold text-teal-400">\u09F3${ssrInterpolate(fmtLakh((_a = unref(stats).total_balance) != null ? _a : 0))}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Pending Approval</p><p class="text-2xl font-bold text-yellow-400">${ssrInterpolate((_b = unref(stats).pending_count) != null ? _b : 0)}</p><p class="text-xs text-gray-600">\u09F3${ssrInterpolate(fmtLakh((_c = unref(stats).pending_amount) != null ? _c : 0))}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Deposits Today</p><p class="text-2xl font-bold text-emerald-400">\u09F3${ssrInterpolate(fmtLakh((_d = unref(stats).deposits_today) != null ? _d : 0))}</p></div><div class="glass-card p-4 text-center space-y-1"><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Withdrawals</p><p class="text-2xl font-bold text-orange-400">\u09F3${ssrInterpolate(fmtLakh((_e = unref(stats).withdrawals_today) != null ? _e : 0))}</p></div></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(unref(accounts), (acc, i) => {
          _push(`<div class="glass-card-hover p-5 space-y-3 relative overflow-hidden"><div class="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10" style="${ssrRenderStyle(`background:radial-gradient(circle,${COLORS[i % COLORS.length]},transparent)`)}"></div><div class="flex items-start justify-between"><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">${ssrInterpolate(acc.bank_name)}</p><p class="text-sm font-semibold text-gray-200">${ssrInterpolate(acc.account_name)}</p></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: acc.status
          }, null, _parent));
          _push(`</div><p class="text-xs text-gray-600 font-mono">${ssrInterpolate(acc.account_number)}</p><p class="text-2xl font-bold" style="${ssrRenderStyle(`color:${COLORS[i % COLORS.length]}`)}"> \u09F3${ssrInterpolate(Number(acc.balance || 0).toLocaleString())}</p><div class="flex gap-2 pt-1">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/bank/transaction/create",
            class: "btn-ghost text-[11px] py-1 px-2.5 flex-1 justify-center"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`+ Transaction`);
              } else {
                return [
                  createTextVNode("+ Transaction")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
        if (unref(glAccounts).length) {
          _push(`<div class="glass-card p-4"><div class="flex items-center justify-between mb-3"><h3 class="text-sm font-semibold text-gray-300">\u{1F4D2} GL Account Statements</h3>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/bank/statement",
            class: "text-xs text-blue-400/70 hover:text-blue-300"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Open Statement \u2192`);
              } else {
                return [
                  createTextVNode("Open Statement \u2192")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(unref(glAccounts), (acc) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: acc.id,
              to: `/bank/statement?account=${acc.id}`,
              class: "flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all text-xs group"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="text-base"${_scopeId}>\u{1F3E6}</span><div${_scopeId}><p class="font-semibold text-gray-200 group-hover:text-white transition-colors"${_scopeId}>${ssrInterpolate(acc.bank_name)}</p><p class="text-gray-600 font-mono text-[10px]"${_scopeId}>${ssrInterpolate(acc.account_name)}</p></div><span class="ml-2 text-blue-400/50 group-hover:text-blue-400 transition-colors text-[11px]"${_scopeId}>\u2192</span>`);
                } else {
                  return [
                    createVNode("span", { class: "text-base" }, "\u{1F3E6}"),
                    createVNode("div", null, [
                      createVNode("p", { class: "font-semibold text-gray-200 group-hover:text-white transition-colors" }, toDisplayString(acc.bank_name), 1),
                      createVNode("p", { class: "text-gray-600 font-mono text-[10px]" }, toDisplayString(acc.account_name), 1)
                    ]),
                    createVNode("span", { class: "ml-2 text-blue-400/50 group-hover:text-blue-400 transition-colors text-[11px]" }, "\u2192")
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Pending Transactions</h2><span class="text-xs text-yellow-400 font-medium">Awaiting approval</span></div>`);
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(pendingRows),
          "per-page": 8,
          "search-placeholder": "Search transactions\u2026"
        }, {
          "cell-transaction_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-semibold font-mono text-xs text-gray-200"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-semibold font-mono text-xs text-gray-200" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-entry_type": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(["badge text-[10px]", value === "credit" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"])}"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: ["badge text-[10px]", value === "credit" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"]
                }, toDisplayString(value), 3)
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex gap-1.5"${_scopeId}><button${ssrIncludeBooleanAttr(unref(acting) === row.id) ? " disabled" : ""} class="btn-gold text-xs py-1 px-2.5"${_scopeId}>${ssrInterpolate(unref(acting) === row.id ? "\u2026" : "Approve")}</button><button${ssrIncludeBooleanAttr(unref(acting) === row.id) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-2.5 border-red-500/20 text-red-400 hover:bg-red-500/10"${_scopeId}> Reject </button></div>`);
            } else {
              return [
                createVNode("div", { class: "flex gap-1.5" }, [
                  createVNode("button", {
                    onClick: ($event) => doAction(row, "approve"),
                    disabled: unref(acting) === row.id,
                    class: "btn-gold text-xs py-1 px-2.5"
                  }, toDisplayString(unref(acting) === row.id ? "\u2026" : "Approve"), 9, ["onClick", "disabled"]),
                  createVNode("button", {
                    onClick: ($event) => doAction(row, "reject"),
                    disabled: unref(acting) === row.id,
                    class: "btn-ghost text-xs py-1 px-2.5 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  }, " Reject ", 8, ["onClick", "disabled"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (!unref(pendingRows).length) {
          _push(`<div class="text-xs text-center text-gray-600 py-4">No pending transactions</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bank/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DmCdHk-Q.mjs.map
