import { _ as _sfc_main$1 } from './HubTabs-B7UBGuJv.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, unref, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import { u as useAppSettings } from './useAppSettings-Cev_RXDm.mjs';
import { u as useReportExport } from './useReportExport-C9Ps5sj9.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import './hubs-AUChU-3l.mjs';
import './server.mjs';
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
import './usePermissions-CG_SWEjg.mjs';
import './permRoutes-DvaKf2tr.mjs';
import '@vue/shared';
import 'perfect-debounce';

function useVoucherPrint() {
  const esc = (s) => String(s != null ? s : "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function openVoucher(v, print, c) {
    var _a, _b;
    const w = (void 0).open("", "_blank", "width=820,height=720");
    if (!w) return false;
    const amount = Number((_a = v.amount) != null ? _a : 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const row = (k, val) => `<tr><th>${k}</th><td>${esc(val) || "\u2014"}</td></tr>`;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Voucher ${esc(v.voucher_number)}</title><style>
      *{box-sizing:border-box} body{font-family:Inter,Arial,sans-serif;color:#111;padding:28px;font-size:13px}
      .top{display:flex;justify-content:space-between;border-bottom:2px solid #f59e0b;padding-bottom:12px;margin-bottom:18px}
      h1{font-size:18px;margin:0} .muted{color:#666;font-size:11px;margin-top:3px} .no{font-size:16px;font-weight:700;text-align:right}
      table{width:100%;border-collapse:collapse} th{width:34%;text-align:left;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:.06em;padding:9px 8px;border-bottom:1px solid #eee} td{padding:9px 8px;border-bottom:1px solid #eee}
      .amt{font-size:20px;font-weight:700;color:#b45309} .sig{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-top:64px;text-align:center;font-size:11px;color:#666} .sig div{border-top:1px solid #888;padding-top:6px}
      .tag{display:inline-block;padding:2px 10px;border-radius:99px;background:#fef3c7;color:#b45309;font-size:11px;font-weight:600} @media print{body{padding:10mm}}
    </style></head><body>
      <div class="top"><div><h1>${esc(c.name)}</h1><div class="muted">${esc(c.address)}<br>${esc(c.phone)}</div></div><div><div class="no">DEBIT VOUCHER<br>${esc(v.voucher_number)}</div><div class="muted" style="text-align:right">Date: ${esc(String((_b = v.date) != null ? _b : "").slice(0, 10))}</div></div></div>
      <table>${row("Pay to", v.paid_to)}${row("Purpose", v.purpose)}${row("Expense account", v.expense_account)}${row("Paid from", v.payment_account)}
        <tr><th>Amount</th><td class="amt">\u09F3 ${amount}</td></tr><tr><th>Status</th><td><span class="tag">${esc(v.status)}</span></td></tr>${row("Prepared by", v.created_by)}</table>
      <div class="sig"><div>Prepared by</div><div>Approved by</div><div>Received by</div></div>
      ${print ? "<script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script>" : '<p style="margin-top:28px"><button onclick="window.print()">Print</button></p>'}
    </body></html>`);
    w.document.close();
    return true;
  }
  return { openVoucher };
}
const perPage = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const statusFilter = ref("");
    const page = ref(1);
    const cols = [
      { key: "voucher_number", label: "Voucher #", sortable: true },
      { key: "date", label: "Date", sortable: true },
      { key: "paid_to", label: "Pay To", sortable: true },
      { key: "purpose", label: "Purpose" },
      { key: "payment_account", label: "Method" },
      { key: "amount", label: "Amount", sortable: true },
      { key: "status", label: "Status" }
    ];
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/vouchers",
      {
        query: computed(() => ({
          search: search.value,
          status: statusFilter.value,
          page: page.value,
          per: perPage
        }))
      },
      "$tykqzYEmxe"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vouchers = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.vouchers) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const total = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.total) != null ? _b : 0;
    });
    const { company } = useAppSettings();
    const exp = useReportExport(), { error: toastError } = useToast();
    const exporting = ref(false);
    async function exportCsv() {
      var _a, _b, _c;
      exporting.value = true;
      try {
        const r = await $fetch("/api/accounts/vouchers", { query: { search: search.value, status: statusFilter.value, page: 1, per: 5e3 } });
        exp.csv(`debit-vouchers_${new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10)}`, {
          name: "Debit vouchers",
          cols: [
            { key: "voucher_number", label: "Voucher #" },
            { key: "date", label: "Date" },
            { key: "paid_to", label: "Pay to" },
            { key: "purpose", label: "Purpose" },
            { key: "expense_account", label: "Expense account" },
            { key: "payment_account", label: "Paid from" },
            { key: "amount", label: "Amount (\u09F3)", fmt: "money", sum: true },
            { key: "status", label: "Status" },
            { key: "created_by", label: "Created by" }
          ],
          rows: ((_a = r.vouchers) != null ? _a : []).map((v) => {
            var _a2;
            return { ...v, date: String((_a2 = v.date) != null ? _a2 : "").slice(0, 10) };
          }),
          totals: true
        });
      } catch (e) {
        toastError((_c = (_b = e == null ? void 0 : e.data) == null ? void 0 : _b.statusMessage) != null ? _c : "Export failed");
      } finally {
        exporting.value = false;
      }
    }
    const { openVoucher: openVoucherWindow } = useVoucherPrint();
    const openVoucher = (v, print) => {
      if (!openVoucherWindow(v, print, company.value)) toastError("Allow pop-ups to view or print the voucher");
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_HubTabs = _sfc_main$1;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "accounts" }, null, _parent));
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Debit Vouchers",
        subtitle: "Payment vouchers authorised for disbursement",
        breadcrumb: ["Accounts", "Voucher"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(unref(exporting)) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(exporting) ? "Preparing\u2026" : "\u2B07 Export CSV")}</button>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/accounts/voucher/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Voucher`);
                } else {
                  return [
                    createTextVNode("+ New Voucher")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode("button", {
                class: "btn-ghost text-xs",
                disabled: unref(exporting),
                onClick: exportCsv
              }, toDisplayString(unref(exporting) ? "Preparing\u2026" : "\u2B07 Export CSV"), 9, ["disabled"]),
              createVNode(_component_NuxtLink, {
                to: "/accounts/voucher/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Voucher")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Today&#39;s Vouchers</p><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).today_count) != null ? _a : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Today&#39;s Total</p><p class="text-2xl font-bold text-red-400">\u09F3${ssrInterpolate(Number((_b = unref(stats).today_total) != null ? _b : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Pending Approval</p><p class="text-2xl font-bold text-yellow-400">${ssrInterpolate((_c = unref(stats).pending_count) != null ? _c : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">This Month Total</p><p class="text-2xl font-bold text-gray-200">\u09F3${ssrInterpolate(Number((_d = unref(stats).month_total) != null ? _d : 0).toLocaleString())}</p></div></div><div class="glass-card p-4 flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" placeholder="Search voucher #, payee\u2026"><select class="input-glass w-auto text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "") : ssrLooseEqual(unref(statusFilter), "")) ? " selected" : ""}>All Status</option><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "draft") : ssrLooseEqual(unref(statusFilter), "draft")) ? " selected" : ""}>Draft / Pending</option><option value="approved"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "approved") : ssrLooseEqual(unref(statusFilter), "approved")) ? " selected" : ""}>Approved</option><option value="cancelled"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "cancelled") : ssrLooseEqual(unref(statusFilter), "cancelled")) ? " selected" : ""}>Cancelled</option></select><button class="btn-ghost text-xs py-1.5">Reset</button></div><div class="glass-card p-5">`);
      if (unref(pending)) {
        _push(`<div class="py-8 text-center text-xs text-gray-500 animate-pulse">Loading vouchers\u2026</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(vouchers),
          "per-page": 15,
          "search-placeholder": ""
        }, {
          "cell-voucher_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
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
              _push2(`<span class="font-mono text-xs font-bold text-red-400"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs font-bold text-red-400" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex gap-1.5"${_scopeId}><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>View</button><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>Print</button></div>`);
            } else {
              return [
                createVNode("div", { class: "flex gap-1.5" }, [
                  createVNode("button", {
                    class: "btn-ghost text-xs py-1 px-2",
                    onClick: ($event) => openVoucher(row, false)
                  }, "View", 8, ["onClick"]),
                  createVNode("button", {
                    class: "btn-ghost text-xs py-1 px-2",
                    onClick: ($event) => openVoucher(row, true)
                  }, "Print", 8, ["onClick"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div>`);
      if (unref(total) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(unref(total) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(unref(total) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/voucher/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-tacLSeCf.mjs.map
