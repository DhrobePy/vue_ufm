import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, mergeProps, withCtx, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { c as _export_sfc } from './server.mjs';
import './SidebarIcon-oZVkzwjh.mjs';
import '../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import '@vue/shared';
import 'perfect-debounce';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/collector/schedule",
      "$bHNuFbH9dY"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const schedule = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.schedule) != null ? _b : [];
    });
    const recentCollections = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recentCollections) != null ? _b : [];
    });
    ref({});
    const collectModal = ref(false);
    const currentVisit = ref(null);
    ref(false);
    const collectForm = reactive({ amount: 0, method: "Cash", notes: "" });
    function fmtBDT(n) {
      const v = Number(n);
      if (v >= 1e5) return `\u09F3${(v / 1e5).toFixed(1)}L`;
      if (v >= 1e3) return `\u09F3${(v / 1e3).toFixed(0)}K`;
      return `\u09F3${v.toLocaleString()}`;
    }
    const cols = [
      { key: "date", label: "Date", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "amount", label: "Amount", sortable: true },
      { key: "paymentMode", label: "Method" },
      { key: "reference", label: "Reference" },
      { key: "collector", label: "Collector" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-22ec5a08>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Collections",
        subtitle: "Field payment collection \xB7 reconciliation \xB7 daily summary",
        breadcrumb: ["Collector"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-22ec5a08${_scopeId}>+ Record Collection</button>`);
          } else {
            return [
              createVNode("button", { class: "btn-gold text-xs" }, "+ Record Collection")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-22ec5a08>`);
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Today's Collections",
        value: fmtBDT((_b = (_a = unref(stats)) == null ? void 0 : _a.today_total) != null ? _b : 0),
        trend: "Collected today",
        "trend-up": "",
        icon: "money",
        color: "gold"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Pending Accounts",
        value: String(unref(schedule).length),
        trend: "With balance due",
        "trend-up": false,
        icon: "users",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Month Total",
        value: fmtBDT((_d = (_c = unref(stats)) == null ? void 0 : _c.month_total) != null ? _d : 0),
        trend: "This month",
        "trend-up": "",
        icon: "chart",
        color: "teal"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Overdue Accounts",
        value: String(unref(schedule).filter((v) => Number(v.outstanding) > 1e5).length),
        trend: "High balance",
        "trend-up": false,
        icon: "list",
        color: "red"
      }, null, _parent));
      _push(`</div><div class="glass-card p-5" data-v-22ec5a08><h2 class="section-title mb-4" data-v-22ec5a08>Today&#39;s Collection Schedule</h2><div class="space-y-2" data-v-22ec5a08>`);
      if (!unref(schedule).length) {
        _push(`<div class="py-8 text-center text-xs text-gray-600" data-v-22ec5a08>No outstanding accounts today</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(schedule), (visit) => {
        _push(`<div class="flex items-center gap-4 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors" data-v-22ec5a08><div class="${ssrRenderClass([
          "w-2 h-2 rounded-full shrink-0",
          visit.status === "collected" ? "bg-emerald-400" : visit.status === "partial" ? "bg-yellow-400" : visit.status === "skipped" ? "bg-red-400" : "bg-gray-600"
        ])}" data-v-22ec5a08></div><div class="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3" data-v-22ec5a08><div data-v-22ec5a08><p class="text-xs font-medium text-gray-200 truncate" data-v-22ec5a08>${ssrInterpolate(visit.customer)}</p><p class="text-[11px] text-gray-600" data-v-22ec5a08>${ssrInterpolate(visit.area)}</p></div><div data-v-22ec5a08><p class="text-[10px] text-gray-600 uppercase tracking-wider" data-v-22ec5a08>Outstanding</p><p class="text-sm font-bold text-red-400" data-v-22ec5a08>\u09F3${ssrInterpolate(visit.outstanding.toLocaleString())}</p></div><div data-v-22ec5a08><p class="text-[10px] text-gray-600 uppercase tracking-wider" data-v-22ec5a08>Collected</p><p class="${ssrRenderClass([visit.collected > 0 ? "text-emerald-400" : "text-gray-600", "text-sm font-semibold"])}" data-v-22ec5a08>${ssrInterpolate(visit.collected > 0 ? `\u09F3${visit.collected.toLocaleString()}` : "\u2014")}</p></div><div data-v-22ec5a08><p class="text-[10px] text-gray-600 uppercase tracking-wider" data-v-22ec5a08>Method</p><p class="text-xs text-gray-400" data-v-22ec5a08>${ssrInterpolate(visit.method || "\u2014")}</p></div></div><div class="flex gap-2 shrink-0" data-v-22ec5a08>`);
        if (visit.status === "pending") {
          _push(`<button class="btn-gold text-xs py-1.5 px-3" data-v-22ec5a08> Collect </button>`);
        } else if (visit.status === "collected") {
          _push(`<span class="text-xs text-emerald-400 font-medium px-2" data-v-22ec5a08>\u2713 Done</span>`);
        } else if (visit.status === "partial") {
          _push(`<span class="text-xs text-yellow-400 font-medium px-2" data-v-22ec5a08>Partial</span>`);
        } else {
          _push(`<span class="text-xs text-red-400 font-medium px-2" data-v-22ec5a08>Skipped</span>`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-5" data-v-22ec5a08><h2 class="section-title mb-4" data-v-22ec5a08>Recent Collections</h2>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(recentCollections),
        "per-page": 10,
        exportable: "",
        "search-placeholder": "Search\u2026"
      }, {
        "cell-amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs font-bold text-emerald-400" data-v-22ec5a08${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs font-bold text-emerald-400" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        "cell-paymentMode": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]" data-v-22ec5a08${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]" }, toDisplayString(value), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(collectModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-22ec5a08><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-22ec5a08></div><div class="relative w-full max-w-md glass-card p-6 space-y-5 animate-slide-up" data-v-22ec5a08><h3 class="font-display font-bold text-lg text-white" data-v-22ec5a08>Record Collection</h3>`);
          if (unref(currentVisit)) {
            _push2(`<div data-v-22ec5a08><p class="text-sm text-gray-300 font-medium" data-v-22ec5a08>${ssrInterpolate(unref(currentVisit).customer)}</p><p class="text-xs text-gray-600 mt-0.5" data-v-22ec5a08>Outstanding: <span class="text-red-400 font-bold" data-v-22ec5a08>\u09F3${ssrInterpolate(unref(currentVisit).outstanding.toLocaleString())}</span></p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="space-y-4" data-v-22ec5a08><div data-v-22ec5a08><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5" data-v-22ec5a08>Amount Collected (\u09F3)</label><input${ssrRenderAttr("value", unref(collectForm).amount)} type="number" min="0" class="input-glass" placeholder="0" data-v-22ec5a08></div><div data-v-22ec5a08><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5" data-v-22ec5a08>Payment Method</label><select class="input-glass" data-v-22ec5a08><option value="Cash" data-v-22ec5a08${ssrIncludeBooleanAttr(Array.isArray(unref(collectForm).method) ? ssrLooseContain(unref(collectForm).method, "Cash") : ssrLooseEqual(unref(collectForm).method, "Cash")) ? " selected" : ""}>Cash</option><option value="Bank Transfer" data-v-22ec5a08${ssrIncludeBooleanAttr(Array.isArray(unref(collectForm).method) ? ssrLooseContain(unref(collectForm).method, "Bank Transfer") : ssrLooseEqual(unref(collectForm).method, "Bank Transfer")) ? " selected" : ""}>Bank Transfer</option><option value="Mobile Banking" data-v-22ec5a08${ssrIncludeBooleanAttr(Array.isArray(unref(collectForm).method) ? ssrLooseContain(unref(collectForm).method, "Mobile Banking") : ssrLooseEqual(unref(collectForm).method, "Mobile Banking")) ? " selected" : ""}>Mobile Banking (bKash/Nagad)</option><option value="Cheque" data-v-22ec5a08${ssrIncludeBooleanAttr(Array.isArray(unref(collectForm).method) ? ssrLooseContain(unref(collectForm).method, "Cheque") : ssrLooseEqual(unref(collectForm).method, "Cheque")) ? " selected" : ""}>Cheque</option></select></div><div data-v-22ec5a08><label class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5" data-v-22ec5a08>Notes</label><input${ssrRenderAttr("value", unref(collectForm).notes)} class="input-glass" placeholder="Reference / cheque number\u2026" data-v-22ec5a08></div></div><div class="flex gap-3 pt-2" data-v-22ec5a08><button class="btn-ghost flex-1 justify-center" data-v-22ec5a08>Cancel</button><button class="btn-gold flex-1 justify-center" data-v-22ec5a08>Save Collection</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/collector/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-22ec5a08"]]);

export { index as default };
//# sourceMappingURL=index-nrMaq2am.mjs.map
