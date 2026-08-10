import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, computed, ref, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "recycle-bin",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { user } = useUserSession();
    const isSuperadmin = computed(() => {
      var _a, _b;
      return ((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase() === "superadmin";
    });
    const tabs = [
      { value: "active", label: "Active" },
      { value: "restored", label: "Restored" },
      { value: "purged", label: "Purged" }
    ];
    const statusFilter = ref("active");
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/recycle-bin",
      {
        query: computed(() => ({ status: statusFilter.value }))
      },
      "$-eS1sqswWS"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const items = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.batches) != null ? _b : [];
    });
    const expanded = ref(null);
    const detailLoading = ref(false);
    const detailItems = ref([]);
    const acting = ref(null);
    function entityLabel(t) {
      var _a;
      return (_a = {
        credit_order: "Credit Order",
        credit_order_return: "Return",
        journal_entry: "Journal Entry",
        bank_transaction: "Bank Transaction",
        expense_voucher: "Expense Voucher",
        maintenance_rule: "Maintenance Rule",
        purchase_order: "Purchase Order",
        purchase_payment: "Purchase Payment",
        customer: "Customer",
        commodity_sale: "Trading Sale",
        commodity_payment: "Trading Payment",
        loan: "Loan",
        loan_repayment: "Loan Repayment",
        pos_order: "POS Sale"
      }[t]) != null ? _a : t.replace(/_/g, " ");
    }
    function timeAgo(dateStr) {
      if (!dateStr) return "\u2014";
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Recycle Bin",
        subtitle: "Deleted records \u2014 full snapshots, restorable until purged",
        breadcrumb: ["Admin", "Recycle Bin"]
      }, null, _parent));
      _push(`<div class="flex gap-2"><!--[-->`);
      ssrRenderList(tabs, (t) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border",
          unref(statusFilter) === t.value ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300 hover:border-white/[0.12]"
        ])}">${ssrInterpolate(t.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center"><div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"></div><p class="text-xs text-gray-500">Loading\u2026</p></div>`);
      } else if (!unref(items).length) {
        _push(`<div class="glass-card p-14 text-center space-y-2"><div class="text-5xl">\u{1F5D1}\uFE0F</div><p class="text-gray-400 font-semibold">Nothing here</p><p class="text-xs text-gray-600">Deleted records will appear here, fully recoverable until purged</p></div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(items), (b) => {
          var _a;
          _push(`<div class="glass-card p-5"><div class="flex items-start gap-4 flex-wrap"><div class="min-w-[220px] flex-1"><span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white/[0.06] text-gray-400 border border-white/[0.08]">${ssrInterpolate(entityLabel(b.entity_type))}</span><span class="text-sm font-bold text-gray-200 ml-2">${ssrInterpolate(b.label)}</span><p class="text-xs text-gray-500 mt-1">${ssrInterpolate(b.customer_name ? `${b.customer_name} \xB7 ` : "")}${ssrInterpolate(b.item_count)} row(s) captured \xB7 deleted by ${ssrInterpolate((_a = b.deleted_by_name) != null ? _a : "\u2014")} \xB7 ${ssrInterpolate(timeAgo(b.deleted_at))}</p>`);
          if (b.status === "restored") {
            _push(`<p class="text-[11px] text-emerald-400 mt-1">\u2713 Restored ${ssrInterpolate(timeAgo(b.restored_at))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (b.status === "purged") {
            _push(`<p class="text-[11px] text-red-400 mt-1">\u2717 Permanently purged ${ssrInterpolate(timeAgo(b.purged_at))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex items-center gap-2 shrink-0"><button class="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-white/[0.08] hover:text-gray-300 hover:border-white/[0.15] transition-colors">${ssrInterpolate(unref(expanded) === b.id ? "Hide" : "View")} contents </button>`);
          if (b.status === "active") {
            _push(`<!--[--><button${ssrIncludeBooleanAttr(unref(acting) === b.id) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">${ssrInterpolate(unref(acting) === b.id ? "\u2026" : "\u267B\uFE0F Restore")}</button>`);
            if (unref(isSuperadmin)) {
              _push(`<button${ssrIncludeBooleanAttr(unref(acting) === b.id) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 disabled:opacity-40 transition-colors"> Purge </button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
          if (unref(expanded) === b.id) {
            _push(`<div class="mt-4 pt-4 border-t border-white/[0.06]">`);
            if (unref(detailLoading)) {
              _push(`<div class="text-xs text-gray-500">Loading\u2026</div>`);
            } else {
              _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-600 font-semibold uppercase tracking-wider">Table</th><th class="pb-2 text-left text-gray-600 font-semibold uppercase tracking-wider">Change</th><th class="pb-2 text-right text-gray-600 font-semibold uppercase tracking-wider">Rows</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
              ssrRenderList(unref(detailItems), (row) => {
                _push(`<tr><td class="py-1.5 font-mono text-gray-400">${ssrInterpolate(row.table_name)}</td><td class="py-1.5 text-gray-500">${ssrInterpolate(row.op === "delete" ? "deleted" : "modified")}</td><td class="py-1.5 text-right text-gray-300 font-semibold">${ssrInterpolate(row.row_count)}</td></tr>`);
              });
              _push(`<!--]--></tbody></table>`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/recycle-bin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=recycle-bin-cxcrjMpD.mjs.map
