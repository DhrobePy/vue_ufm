import { _ as _sfc_main$1 } from './ReportFrame-Dts5xb5M.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { _ as _sfc_main$2 } from './ReportTable-B52hYz1U.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, openBlock, createBlock, toDisplayString, Fragment, createVNode, renderList, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ledger-repair",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { success, error: toastError } = useToast();
    const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
    const { data: d, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/ledger-repair",
      "$FVqkgae_A8"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const T = (key, label, fmt) => ({ key, label, fmt });
    const checks = computed(() => d.value ? [
      { l: "1 \xB7 Stored balance \u2260 ledger", n: d.value.balanceMismatch.length },
      { l: "2 \xB7 Running balance out of order", n: d.value.chain.length },
      { l: "3 \xB7 Dispatched, no ledger invoice", n: d.value.noLedger.length },
      { l: "4 \xB7 Dispatched, no journal entry", n: d.value.noJe.length },
      { l: "5 \xB7 Unbalanced journal entries", n: d.value.unbalanced.length }
    ] : []);
    const sections = computed(() => {
      const x = d.value;
      if (!x) return [];
      return [
        { title: "1 \xB7 Stored balance differs from the ledger", help: "Fix on the Customer Balance Reconciliation screen (reversible).", cols: [T("name", "Customer"), T("stored", "Stored \u09F3", "money"), T("ledger", "Ledger \u09F3", "money")], rows: x.balanceMismatch },
        { title: "2 \xB7 Running balance out of date order", help: "Caused by back-dated entries. Use \u201CRebuild running balances\u201D above.", cols: [T("name", "Customer"), T("rows_off", "Lines out of order")], rows: x.chain },
        { title: "3 \xB7 Dispatched orders with no customer-ledger invoice line", help: "The customer was never charged on the ledger. Post through the order's own flow or the Ledger Review screen \u2014 not fixed automatically.", cols: [T("order_number", "Order #"), T("customer", "Customer"), T("status", "Status"), T("amount", "Amount \u09F3", "money")], rows: x.noLedger },
        { title: "4 \xB7 Dispatched orders with no journal entry", help: "Revenue / receivable never reached the general ledger.", cols: [T("order_number", "Order #"), T("customer", "Customer"), T("status", "Status"), T("amount", "Amount \u09F3", "money")], rows: x.noJe },
        { title: "5 \xB7 Unbalanced journal entries", help: "Debits \u2260 credits. These need a correcting entry from Accounts; they are never edited silently.", cols: [T("id", "Entry #"), T("date", "Date"), T("description", "Description"), T("line_count", "Lines"), T("debit", "Debit \u09F3", "money"), T("credit", "Credit \u09F3", "money")], rows: x.unbalanced }
      ];
    });
    const sheets = computed(() => sections.value.map((s) => ({ name: s.title.slice(0, 30), cols: s.cols, rows: s.rows })));
    const busy = ref(false);
    async function rebuild(customer_id) {
      var _a, _b;
      if (!confirm("Rebuild the running-balance column in date order? No amounts or totals change.")) return;
      busy.value = true;
      try {
        const r = await $fetch("/api/admin/ledger-repair", { method: "POST", body: { action: "rebuild_running_balances", customer_id: customer_id || void 0 } });
        success(r.message);
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed");
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReportFrame = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_1;
      const _component_ReportTable = _sfc_main$2;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: "Ledger Repair \u2014 Health Check",
        subtitle: "Where the books and the customer ledgers disagree \u2014 Superadmin only",
        period: unref(today),
        filename: "ledger-health-check",
        sheets: unref(sheets)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Checking\u2026</div>`);
            } else if (unref(error)) {
              _push2(`<div class="glass-card p-6 text-center text-red-400 text-sm"${_scopeId}>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
            } else if (unref(d)) {
              _push2(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-5 gap-3"${_scopeId}><!--[-->`);
              ssrRenderList(unref(checks), (c) => {
                _push2(`<div class="${ssrRenderClass([c.n ? "border-l-2 border-l-amber-500/60" : "border-l-2 border-l-emerald-500/40", "glass-card p-3"])}"${_scopeId}><p class="text-[10px] uppercase tracking-wider text-gray-500"${_scopeId}>${ssrInterpolate(c.l)}</p><p class="${ssrRenderClass([c.n ? "text-amber-400" : "text-emerald-400", "text-xl font-bold"])}"${_scopeId}>${ssrInterpolate(c.n ? c.n : "\u2713 OK")}</p></div>`);
              });
              _push2(`<!--]--></div><div class="no-print glass-card p-4 flex flex-wrap items-center gap-3"${_scopeId}><div class="flex-1 min-w-[16rem] text-xs text-gray-400"${_scopeId}><strong class="text-gray-200"${_scopeId}>Rebuild running balances</strong> \u2014 puts each ledger line&#39;s \u201Cbalance after\u201D back in date order for the ${ssrInterpolate(unref(d).chain.length)} customer(s) listed under check 2. No debit, credit or total changes. </div><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(d).chain.length || unref(busy)) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(busy) ? "Working\u2026" : "Rebuild all")}</button>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/admin/customer-reconciliation",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Customer balance reconciliation \u2192`);
                  } else {
                    return [
                      createTextVNode("Customer balance reconciliation \u2192")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div><!--[-->`);
              ssrRenderList(unref(sections), (s) => {
                _push2(`<section class="space-y-1"${_scopeId}><h2 class="text-sm font-bold text-gray-200 mt-3"${_scopeId}>${ssrInterpolate(s.title)} <span class="text-gray-600 font-normal"${_scopeId}>(${ssrInterpolate(s.rows.length)})</span></h2><p class="text-[11px] text-gray-600"${_scopeId}>${ssrInterpolate(s.help)}</p>`);
                _push2(ssrRenderComponent(_component_ReportTable, {
                  cols: s.cols,
                  rows: s.rows,
                  totals: false
                }, null, _parent2, _scopeId));
                _push2(`</section>`);
              });
              _push2(`<!--]--><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Checking\u2026")) : unref(error) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "glass-card p-6 text-center text-red-400 text-sm"
              }, "\u26A0 " + toDisplayString(unref(error).message), 1)) : unref(d) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                createVNode("div", { class: "grid grid-cols-2 lg:grid-cols-5 gap-3" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(checks), (c) => {
                    return openBlock(), createBlock("div", {
                      key: c.l,
                      class: ["glass-card p-3", c.n ? "border-l-2 border-l-amber-500/60" : "border-l-2 border-l-emerald-500/40"]
                    }, [
                      createVNode("p", { class: "text-[10px] uppercase tracking-wider text-gray-500" }, toDisplayString(c.l), 1),
                      createVNode("p", {
                        class: ["text-xl font-bold", c.n ? "text-amber-400" : "text-emerald-400"]
                      }, toDisplayString(c.n ? c.n : "\u2713 OK"), 3)
                    ], 2);
                  }), 128))
                ]),
                createVNode("div", { class: "no-print glass-card p-4 flex flex-wrap items-center gap-3" }, [
                  createVNode("div", { class: "flex-1 min-w-[16rem] text-xs text-gray-400" }, [
                    createVNode("strong", { class: "text-gray-200" }, "Rebuild running balances"),
                    createTextVNode(" \u2014 puts each ledger line's \u201Cbalance after\u201D back in date order for the " + toDisplayString(unref(d).chain.length) + " customer(s) listed under check 2. No debit, credit or total changes. ", 1)
                  ]),
                  createVNode("button", {
                    class: "btn-gold text-xs",
                    disabled: !unref(d).chain.length || unref(busy),
                    onClick: ($event) => rebuild(0)
                  }, toDisplayString(unref(busy) ? "Working\u2026" : "Rebuild all"), 9, ["disabled", "onClick"]),
                  createVNode(_component_NuxtLink, {
                    to: "/admin/customer-reconciliation",
                    class: "btn-ghost text-xs"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("Customer balance reconciliation \u2192")
                    ]),
                    _: 1
                  })
                ]),
                (openBlock(true), createBlock(Fragment, null, renderList(unref(sections), (s) => {
                  return openBlock(), createBlock("section", {
                    key: s.title,
                    class: "space-y-1"
                  }, [
                    createVNode("h2", { class: "text-sm font-bold text-gray-200 mt-3" }, [
                      createTextVNode(toDisplayString(s.title) + " ", 1),
                      createVNode("span", { class: "text-gray-600 font-normal" }, "(" + toDisplayString(s.rows.length) + ")", 1)
                    ]),
                    createVNode("p", { class: "text-[11px] text-gray-600" }, toDisplayString(s.help), 1),
                    createVNode(_component_ReportTable, {
                      cols: s.cols,
                      rows: s.rows,
                      totals: false
                    }, null, 8, ["cols", "rows"])
                  ]);
                }), 128))
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/ledger-repair.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=ledger-repair-CGwYVzoi.mjs.map
