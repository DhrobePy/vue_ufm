import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { c as _export_sfc, p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const txPerPage = 25;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#0ea5e9"];
    const { user: sessionUser } = useUserSession();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const isSuperadmin = computed(() => {
      var _a, _b;
      return ((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase() === "superadmin";
    });
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
    const rejectModal = reactive({ open: false, txId: 0, txNumber: "", reason: "" });
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const txFilters = reactive({ account: "", from: weekAgo, to: today, status: "", type: "" });
    const appliedTxFilters = reactive({ ...txFilters });
    const txPage = ref(1);
    const txQuery = computed(() => ({
      account: appliedTxFilters.account || void 0,
      from: appliedTxFilters.from || void 0,
      to: appliedTxFilters.to || void 0,
      status: appliedTxFilters.status || void 0,
      type: appliedTxFilters.type || void 0,
      page: txPage.value,
      per: txPerPage
    }));
    const { data: txData, pending: txPending, error: txError, refresh: fetchTx } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/transactions",
      { query: txQuery },
      "$SQPvdSOJ8l"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const bulkMode = ref(false);
    let selectedIds = ref(/* @__PURE__ */ new Set());
    const bulkBusy = ref(null);
    const drawerOpen = ref(false);
    const drawerLoading = ref(false);
    const drawerTx = ref(null);
    const drawerAudit = ref([]);
    const drawerFields = computed(() => {
      var _a;
      const t = drawerTx.value;
      if (!t) return [];
      return [
        ["Transaction #", t.transaction_number],
        ["Date", t.transaction_date],
        ["Account", `${t.bank_name} \u2014 ${t.account_name}`],
        ["Account No.", t.account_number],
        ["Type", (_a = t.entry_type) == null ? void 0 : _a.toUpperCase()],
        ["Reference", t.reference_number],
        ["Cheque #", t.cheque_number],
        ["Payee / Payer", t.payee_payer_name],
        ["Description", t.description],
        ["Submitted by", t.created_by_name]
      ].filter(([, v]) => v);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-856797cd>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Bank",
        subtitle: "Maker-checker bank transactions \xB7 transfers \xB7 statements",
        breadcrumb: ["Bank"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/bank/accounts",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Accounts`);
                } else {
                  return [
                    createTextVNode("Accounts")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
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
                to: "/bank/accounts",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("Accounts")
                ]),
                _: 1
              }),
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
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-856797cd>Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-856797cd>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-856797cd><div class="glass-card p-4 text-center space-y-1" data-v-856797cd><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold" data-v-856797cd>Total Balance</p><p class="text-2xl font-bold text-teal-400" data-v-856797cd>\u09F3${ssrInterpolate(fmtLakh((_a = unref(stats).total_balance) != null ? _a : 0))}</p></div><div class="glass-card p-4 text-center space-y-1" data-v-856797cd><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold" data-v-856797cd>Pending Approval</p><p class="text-2xl font-bold text-yellow-400" data-v-856797cd>${ssrInterpolate((_b = unref(stats).pending_count) != null ? _b : 0)}</p><p class="text-xs text-gray-600" data-v-856797cd>\u09F3${ssrInterpolate(fmtLakh((_c = unref(stats).pending_amount) != null ? _c : 0))}</p></div><div class="glass-card p-4 text-center space-y-1" data-v-856797cd><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold" data-v-856797cd>Deposits Today</p><p class="text-2xl font-bold text-emerald-400" data-v-856797cd>\u09F3${ssrInterpolate(fmtLakh((_d = unref(stats).deposits_today) != null ? _d : 0))}</p></div><div class="glass-card p-4 text-center space-y-1" data-v-856797cd><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold" data-v-856797cd>Withdrawals Today</p><p class="text-2xl font-bold text-orange-400" data-v-856797cd>\u09F3${ssrInterpolate(fmtLakh((_e = unref(stats).withdrawals_today) != null ? _e : 0))}</p></div></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-v-856797cd><!--[-->`);
        ssrRenderList(unref(accounts), (acc, i) => {
          _push(`<div class="glass-card-hover p-5 space-y-3 relative overflow-hidden" data-v-856797cd><div class="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10" style="${ssrRenderStyle(`background:radial-gradient(circle,${COLORS[i % COLORS.length]},transparent)`)}" data-v-856797cd></div><div class="flex items-start justify-between" data-v-856797cd><div data-v-856797cd><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5" data-v-856797cd>${ssrInterpolate(acc.bank_name)}</p><p class="text-sm font-semibold text-gray-200" data-v-856797cd>${ssrInterpolate(acc.account_name)}</p></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: acc.status
          }, null, _parent));
          _push(`</div><p class="text-xs text-gray-600 font-mono" data-v-856797cd>${ssrInterpolate(acc.account_number)}</p><p class="text-2xl font-bold" style="${ssrRenderStyle(`color:${COLORS[i % COLORS.length]}`)}" data-v-856797cd> \u09F3${ssrInterpolate(Number(acc.balance || 0).toLocaleString())}</p><div class="flex gap-2 pt-1" data-v-856797cd>`);
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
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/bank/statement?account=${acc.id}`,
            class: "btn-ghost text-[11px] py-1 px-2.5"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Statement`);
              } else {
                return [
                  createTextVNode("Statement")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
        if (unref(glAccounts).length) {
          _push(`<div class="glass-card p-4" data-v-856797cd><div class="flex items-center justify-between mb-3" data-v-856797cd><h3 class="text-sm font-semibold text-gray-300" data-v-856797cd>\u{1F4D2} GL Account Statements</h3>`);
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
          _push(`</div><div class="flex flex-wrap gap-2" data-v-856797cd><!--[-->`);
          ssrRenderList(unref(glAccounts), (acc) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: acc.id,
              to: `/bank/statement?account=${acc.id}`,
              class: "flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] transition-all text-xs group"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="text-base" data-v-856797cd${_scopeId}>\u{1F3E6}</span><div data-v-856797cd${_scopeId}><p class="font-semibold text-gray-200 group-hover:text-white" data-v-856797cd${_scopeId}>${ssrInterpolate(acc.bank_name)}</p><p class="text-gray-600 font-mono text-[10px]" data-v-856797cd${_scopeId}>${ssrInterpolate(acc.account_name)}</p></div><span class="ml-2 text-blue-400/50 group-hover:text-blue-400 text-[11px]" data-v-856797cd${_scopeId}>\u2192</span>`);
                } else {
                  return [
                    createVNode("span", { class: "text-base" }, "\u{1F3E6}"),
                    createVNode("div", null, [
                      createVNode("p", { class: "font-semibold text-gray-200 group-hover:text-white" }, toDisplayString(acc.bank_name), 1),
                      createVNode("p", { class: "text-gray-600 font-mono text-[10px]" }, toDisplayString(acc.account_name), 1)
                    ]),
                    createVNode("span", { class: "ml-2 text-blue-400/50 group-hover:text-blue-400 text-[11px]" }, "\u2192")
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
        if (unref(pendingRows).length) {
          _push(`<div class="glass-card p-5" data-v-856797cd><div class="flex items-center justify-between mb-4" data-v-856797cd><h2 class="section-title" data-v-856797cd>Pending Transactions</h2><span class="text-xs text-yellow-400 font-medium" data-v-856797cd>\u26A0 Awaiting approval</span></div><div class="space-y-2" data-v-856797cd><!--[-->`);
          ssrRenderList(unref(pendingRows), (row) => {
            _push(`<div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-yellow-500/10 hover:bg-white/[0.05] transition-colors" data-v-856797cd><div class="flex items-center gap-3 min-w-0" data-v-856797cd><span class="${ssrRenderClass(["w-2 h-2 rounded-full flex-shrink-0", row.entry_type === "credit" ? "bg-emerald-400" : "bg-red-400"])}" data-v-856797cd></span><div class="min-w-0" data-v-856797cd><p class="font-mono text-xs text-gold-400/80 font-medium" data-v-856797cd>${ssrInterpolate(row.transaction_number)}</p><p class="text-xs text-gray-500 truncate" data-v-856797cd>${ssrInterpolate(row.bank_name)} \xB7 ${ssrInterpolate(row.description)}</p></div></div><div class="flex items-center gap-3 flex-shrink-0 ml-3" data-v-856797cd><div class="text-right hidden sm:block" data-v-856797cd><p class="${ssrRenderClass([row.entry_type === "credit" ? "text-emerald-400" : "text-red-400", "text-sm font-bold font-mono"])}" data-v-856797cd>${ssrInterpolate(row.entry_type === "credit" ? "+" : "-")}\u09F3${ssrInterpolate(Number(row.amount).toLocaleString())}</p><p class="text-[10px] text-gray-600" data-v-856797cd>${ssrInterpolate(row.transaction_date)}</p></div><div class="flex gap-1.5" data-v-856797cd><button class="btn-ghost text-xs py-1 px-2" data-v-856797cd>View</button><button${ssrIncludeBooleanAttr(unref(acting) === row.id) ? " disabled" : ""} class="btn-gold text-xs py-1 px-2.5" data-v-856797cd>${ssrInterpolate(unref(acting) === row.id ? "\u2026" : "Approve")}</button><button${ssrIncludeBooleanAttr(unref(acting) === row.id) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-2.5 border-red-500/20 text-red-400 hover:bg-red-500/10" data-v-856797cd> Reject </button></div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-5 space-y-4" data-v-856797cd><div class="flex flex-wrap items-center justify-between gap-3" data-v-856797cd><h2 class="section-title" data-v-856797cd>All Transactions</h2><div class="flex items-center gap-2" data-v-856797cd>`);
        if (unref(isAdmin)) {
          _push(`<button class="${ssrRenderClass(["btn-ghost text-xs py-1 px-2.5", unref(bulkMode) ? "border-amber-500/40 text-amber-400" : ""])}" data-v-856797cd>${ssrInterpolate(unref(bulkMode) ? "\u2715 Cancel Select" : "\u2611 Select")}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(bulkMode) && unref(selectedIds).size > 0) {
          _push(`<span class="text-xs text-amber-400 font-medium" data-v-856797cd>${ssrInterpolate(unref(selectedIds).size)} selected</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        if (unref(bulkMode) && unref(selectedIds).size > 0) {
          _push(`<div class="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20" data-v-856797cd><span class="text-xs text-amber-300 font-semibold" data-v-856797cd>${ssrInterpolate(unref(selectedIds).size)} selected</span><button${ssrIncludeBooleanAttr(!!unref(bulkBusy)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3 text-yellow-400 hover:border-yellow-500/30" data-v-856797cd>${ssrInterpolate(unref(bulkBusy) === "unpost" ? "\u2026" : "\u21A9 Bulk Unpost")}</button>`);
          if (unref(isSuperadmin)) {
            _push(`<button${ssrIncludeBooleanAttr(!!unref(bulkBusy)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3 text-red-400 hover:border-red-500/30" data-v-856797cd>${ssrInterpolate(unref(bulkBusy) === "delete" ? "\u2026" : "\u{1F5D1} Bulk Delete")}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="ml-auto btn-ghost text-xs py-1 px-2.5" data-v-856797cd>Clear</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex flex-wrap gap-2 items-center" data-v-856797cd><select class="field-input text-xs py-1.5 min-w-[180px]" data-v-856797cd><option value="" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).account) ? ssrLooseContain(unref(txFilters).account, "") : ssrLooseEqual(unref(txFilters).account, "")) ? " selected" : ""}>All Accounts</option><!--[-->`);
        ssrRenderList(unref(accounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)} data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).account) ? ssrLooseContain(unref(txFilters).account, a.id) : ssrLooseEqual(unref(txFilters).account, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)}</option>`);
        });
        _push(`<!--]--></select><input${ssrRenderAttr("value", unref(txFilters).from)} type="date" class="field-input text-xs py-1.5" data-v-856797cd><input${ssrRenderAttr("value", unref(txFilters).to)} type="date" class="field-input text-xs py-1.5" data-v-856797cd><select class="field-input text-xs py-1.5" data-v-856797cd><option value="" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).status) ? ssrLooseContain(unref(txFilters).status, "") : ssrLooseEqual(unref(txFilters).status, "")) ? " selected" : ""}>All Status</option><option value="pending" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).status) ? ssrLooseContain(unref(txFilters).status, "pending") : ssrLooseEqual(unref(txFilters).status, "pending")) ? " selected" : ""}>Pending</option><option value="approved" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).status) ? ssrLooseContain(unref(txFilters).status, "approved") : ssrLooseEqual(unref(txFilters).status, "approved")) ? " selected" : ""}>Approved</option><option value="rejected" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).status) ? ssrLooseContain(unref(txFilters).status, "rejected") : ssrLooseEqual(unref(txFilters).status, "rejected")) ? " selected" : ""}>Rejected</option><option value="unposted" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).status) ? ssrLooseContain(unref(txFilters).status, "unposted") : ssrLooseEqual(unref(txFilters).status, "unposted")) ? " selected" : ""}>Unposted</option></select><select class="field-input text-xs py-1.5" data-v-856797cd><option value="" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).type) ? ssrLooseContain(unref(txFilters).type, "") : ssrLooseEqual(unref(txFilters).type, "")) ? " selected" : ""}>All Types</option><option value="credit" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).type) ? ssrLooseContain(unref(txFilters).type, "credit") : ssrLooseEqual(unref(txFilters).type, "credit")) ? " selected" : ""}>Credit (In)</option><option value="debit" data-v-856797cd${ssrIncludeBooleanAttr(Array.isArray(unref(txFilters).type) ? ssrLooseContain(unref(txFilters).type, "debit") : ssrLooseEqual(unref(txFilters).type, "debit")) ? " selected" : ""}>Debit (Out)</option></select><button class="btn-gold text-xs py-1.5 px-4" data-v-856797cd>Apply</button><button class="btn-ghost text-xs py-1.5" data-v-856797cd>Reset</button></div>`);
        if (unref(txPending)) {
          _push(`<div class="text-center text-xs text-gray-500 py-6" data-v-856797cd>Loading\u2026</div>`);
        } else if (unref(txError)) {
          _push(`<div class="text-center text-red-400 text-sm py-4" data-v-856797cd>\u26A0 ${ssrInterpolate((_f = unref(txError)) == null ? void 0 : _f.message)}</div>`);
        } else {
          _push(`<!--[-->`);
          if (!((_h = (_g = unref(txData)) == null ? void 0 : _g.transactions) == null ? void 0 : _h.length)) {
            _push(`<div class="text-center text-gray-600 text-xs py-8" data-v-856797cd>No transactions found</div>`);
          } else {
            _push(`<div class="overflow-x-auto" data-v-856797cd><table class="w-full text-xs min-w-[640px]" data-v-856797cd><thead data-v-856797cd><tr class="border-b border-white/[0.06]" data-v-856797cd>`);
            if (unref(bulkMode)) {
              _push(`<th class="pb-2 px-2 w-8" data-v-856797cd><input type="checkbox" class="accent-amber-500" data-v-856797cd></th>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-856797cd>Txn #</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-856797cd>Date</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-856797cd>Account</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-856797cd>Type</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider" data-v-856797cd>Amount</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider" data-v-856797cd>Description</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider" data-v-856797cd>Status</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider" data-v-856797cd>Actions</th></tr></thead><tbody class="divide-y divide-white/[0.04]" data-v-856797cd><!--[-->`);
            ssrRenderList(unref(txData).transactions, (tx) => {
              _push(`<tr class="${ssrRenderClass(["hover:bg-white/[0.02] transition-colors", unref(selectedIds).has(tx.id) ? "bg-amber-500/[0.04]" : ""])}" data-v-856797cd>`);
              if (unref(bulkMode)) {
                _push(`<td class="py-2.5 px-2" data-v-856797cd><input type="checkbox"${ssrIncludeBooleanAttr(unref(selectedIds).has(tx.id)) ? " checked" : ""} class="accent-amber-500" data-v-856797cd></td>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<td class="py-2.5 px-3 font-mono text-gold-400/80 font-medium whitespace-nowrap" data-v-856797cd>${ssrInterpolate(tx.transaction_number)}</td><td class="py-2.5 px-3 text-gray-500 whitespace-nowrap" data-v-856797cd>${ssrInterpolate(tx.transaction_date)}</td><td class="py-2.5 px-3 text-gray-400 whitespace-nowrap" data-v-856797cd>${ssrInterpolate(tx.bank_name)}</td><td class="py-2.5 px-3" data-v-856797cd><span class="${ssrRenderClass(["px-2 py-0.5 rounded text-[10px] font-semibold", tx.entry_type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"])}" data-v-856797cd>${ssrInterpolate(tx.entry_type)}</span></td><td class="${ssrRenderClass([tx.entry_type === "credit" ? "text-emerald-400" : "text-red-400", "py-2.5 px-3 text-right font-mono font-semibold"])}" data-v-856797cd> \u09F3${ssrInterpolate(Number(tx.amount).toLocaleString())}</td><td class="py-2.5 px-3 text-gray-400 max-w-[200px] truncate" data-v-856797cd>${ssrInterpolate(tx.description)}</td><td class="py-2.5 px-3 text-center" data-v-856797cd>`);
              _push(ssrRenderComponent(_component_UiStatusBadge, {
                status: tx.status
              }, null, _parent));
              _push(`</td><td class="py-2.5 px-3" data-v-856797cd><div class="flex gap-1 justify-center flex-wrap" data-v-856797cd><button class="btn-ghost text-[10px] py-0.5 px-2" data-v-856797cd>View</button>`);
              if (unref(isAdmin) && tx.status === "pending") {
                _push(`<button${ssrIncludeBooleanAttr(unref(acting) === tx.id) ? " disabled" : ""} class="btn-gold text-[10px] py-0.5 px-2" data-v-856797cd>${ssrInterpolate(unref(acting) === tx.id ? "\u2026" : "Approve")}</button>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<button class="btn-ghost text-[10px] py-0.5 px-2" data-v-856797cd>\u{1F5A8}</button></div></td></tr>`);
            });
            _push(`<!--]--></tbody></table></div>`);
          }
          if (((_j = (_i = unref(txData)) == null ? void 0 : _i.total) != null ? _j : 0) > txPerPage) {
            _push(`<div class="flex items-center justify-between text-xs text-gray-500 pt-2" data-v-856797cd><span data-v-856797cd>${ssrInterpolate((_k = unref(txData)) == null ? void 0 : _k.total)} total \xB7 Page ${ssrInterpolate(unref(txPage))}</span><div class="flex gap-2" data-v-856797cd><button${ssrIncludeBooleanAttr(unref(txPage) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(txPage) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}" data-v-856797cd>\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(txPage) >= Math.ceil(((_m = (_l = unref(txData)) == null ? void 0 : _l.total) != null ? _m : 0) / txPerPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3" data-v-856797cd>Next \u2192</button></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        }
        _push(`</div><!--]-->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(drawerOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex" data-v-856797cd><div class="flex-1 bg-black/50 backdrop-blur-sm" data-v-856797cd></div><div class="w-full max-w-md bg-[#111] border-l border-white/[0.08] overflow-y-auto flex flex-col" data-v-856797cd><div class="sticky top-0 bg-[#111] border-b border-white/[0.06] p-4 flex items-center justify-between z-10" data-v-856797cd><h3 class="text-sm font-bold text-gray-100" data-v-856797cd>Transaction Detail</h3><button class="text-gray-500 hover:text-gray-200 text-xl" data-v-856797cd>\u2715</button></div>`);
          if (unref(drawerLoading)) {
            _push2(`<div class="flex-1 flex items-center justify-center text-xs text-gray-500" data-v-856797cd>Loading\u2026</div>`);
          } else if (unref(drawerTx)) {
            _push2(`<div class="p-5 space-y-5 flex-1" data-v-856797cd><div class="text-center py-4 border-b border-white/[0.06]" data-v-856797cd><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1" data-v-856797cd>${ssrInterpolate(unref(drawerTx).entry_type === "credit" ? "\u2193 Deposit" : "\u2191 Withdrawal")}</p><p class="${ssrRenderClass([unref(drawerTx).entry_type === "credit" ? "text-emerald-400" : "text-red-400", "text-3xl font-bold font-mono"])}" data-v-856797cd> \u09F3${ssrInterpolate(Number(unref(drawerTx).amount).toLocaleString())}</p><div class="mt-2 flex justify-center gap-2" data-v-856797cd>`);
            _push2(ssrRenderComponent(_component_UiStatusBadge, {
              status: unref(drawerTx).status
            }, null, _parent));
            _push2(`</div></div><div class="space-y-3 text-xs" data-v-856797cd><!--[-->`);
            ssrRenderList(unref(drawerFields), ([label, val]) => {
              _push2(`<div class="flex justify-between gap-4" data-v-856797cd><span class="text-gray-600 shrink-0" data-v-856797cd>${ssrInterpolate(label)}</span><span class="text-gray-200 text-right font-medium break-words" data-v-856797cd>${ssrInterpolate(val || "\u2014")}</span></div>`);
            });
            _push2(`<!--]--></div>`);
            if (unref(drawerTx).special_note) {
              _push2(`<div class="p-3 rounded-xl bg-yellow-500/[0.06] border border-yellow-500/20" data-v-856797cd><p class="text-[10px] text-yellow-500 font-semibold uppercase tracking-wider mb-1" data-v-856797cd>Special Note</p><p class="text-xs text-yellow-300" data-v-856797cd>${ssrInterpolate(unref(drawerTx).special_note)}</p></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<div class="space-y-2 border-t border-white/[0.06] pt-4" data-v-856797cd><div class="flex gap-2 flex-wrap" data-v-856797cd>`);
            if (unref(isAdmin) && unref(drawerTx).status === "pending") {
              _push2(`<button${ssrIncludeBooleanAttr(unref(acting) === unref(drawerTx).id) ? " disabled" : ""} class="btn-gold text-xs flex-1" data-v-856797cd>${ssrInterpolate(unref(acting) === unref(drawerTx).id ? "\u2026" : "\u2713 Approve")}</button>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(isAdmin) && unref(drawerTx).status === "pending") {
              _push2(`<button${ssrIncludeBooleanAttr(unref(acting) === unref(drawerTx).id) ? " disabled" : ""} class="btn-ghost text-xs flex-1 text-red-400 border-red-500/20 hover:bg-red-500/10" data-v-856797cd> \u2715 Reject </button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="flex gap-2 flex-wrap" data-v-856797cd>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/bank/transaction/create?edit=${unref(drawerTx).id}`,
              class: "btn-ghost text-xs flex-1 justify-center"
            }, {
              default: withCtx((_, _push3, _parent2, _scopeId) => {
                if (_push3) {
                  _push3(`\u270F Edit`);
                } else {
                  return [
                    createTextVNode("\u270F Edit")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push2(`<button class="btn-ghost text-xs flex-1" data-v-856797cd>\u{1F5A8} Receipt</button></div>`);
            if (unref(isAdmin) && unref(drawerTx).status !== "unposted") {
              _push2(`<button${ssrIncludeBooleanAttr(unref(acting) === unref(drawerTx).id) ? " disabled" : ""} class="btn-ghost text-xs w-full text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10" data-v-856797cd>${ssrInterpolate(unref(acting) === unref(drawerTx).id ? "\u2026" : "\u21A9 Unpost Transaction")}</button>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(isSuperadmin)) {
              _push2(`<button class="btn-ghost text-xs w-full text-red-500 border-red-600/20 hover:bg-red-500/10" data-v-856797cd> \u{1F5D1} Permanently Delete </button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
            if (unref(drawerAudit).length) {
              _push2(`<div class="space-y-3 border-t border-white/[0.06] pt-4" data-v-856797cd><h4 class="text-[10px] font-semibold text-gray-500 uppercase tracking-wider" data-v-856797cd>Audit Trail</h4><!--[-->`);
              ssrRenderList(unref(drawerAudit), (log) => {
                _push2(`<div class="flex gap-3 text-xs" data-v-856797cd><div class="${ssrRenderClass([log.action === "approved" ? "bg-emerald-400" : log.action === "rejected" || log.action === "deleted" ? "bg-red-400" : "bg-gray-400", "w-2 h-2 rounded-full mt-1.5 flex-shrink-0"])}" data-v-856797cd></div><div data-v-856797cd><p class="text-gray-300 capitalize font-medium" data-v-856797cd>${ssrInterpolate(log.action)}</p><p class="text-gray-600" data-v-856797cd>${ssrInterpolate(log.user_name || "System")} \xB7 ${ssrInterpolate(String(log.created_at).slice(0, 16))}</p>`);
                if (log.notes) {
                  _push2(`<p class="text-gray-500 mt-0.5 italic" data-v-856797cd>${ssrInterpolate(log.notes)}</p>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(rejectModal).open) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" data-v-856797cd><div class="w-full max-w-sm rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-856797cd><h3 class="font-bold text-gray-100" data-v-856797cd>Reject Transaction</h3><p class="text-xs text-gray-500" data-v-856797cd>${ssrInterpolate(unref(rejectModal).txNumber)}</p><textarea rows="3" class="input-glass w-full resize-none text-xs" placeholder="Reason for rejection (optional)\u2026" data-v-856797cd>${ssrInterpolate(unref(rejectModal).reason)}</textarea><div class="flex gap-3" data-v-856797cd><button${ssrIncludeBooleanAttr(unref(acting) === unref(rejectModal).txId) ? " disabled" : ""} class="btn-gold text-xs flex-1 bg-red-600/80 border-red-500/30 hover:bg-red-600" data-v-856797cd>${ssrInterpolate(unref(acting) === unref(rejectModal).txId ? "\u2026" : "Confirm Reject")}</button><button class="btn-ghost text-xs" data-v-856797cd>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
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
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-856797cd"]]);

export { index as default };
//# sourceMappingURL=index-DrYGiEhX.mjs.map
