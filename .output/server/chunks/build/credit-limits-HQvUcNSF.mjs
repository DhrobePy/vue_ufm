import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, ref, withAsyncContext, computed, watch, mergeProps, withCtx, unref, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
  __name: "credit-limits",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { success, error: toastError } = useToast();
    const filterUtil = ref("all");
    const saving = ref(false);
    const utilizationFilters = [
      { value: "all", label: "All" },
      { value: "high", label: ">80%" },
      { value: "over", label: "Overdue" }
    ];
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/credit-limits",
      "$n5cKgObh_z"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const customers = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.customers) != null ? _b : []).map((c) => ({
          ...c,
          newLimit: Number(c.credit_limit || 0)
        }));
      }
    );
    const rows = ref([]);
    watch(customers, (val) => {
      rows.value = val.map((c) => ({ ...c }));
    }, { immediate: true });
    const dirty = computed(
      () => rows.value.some((r) => r.newLimit !== Number(r.credit_limit || 0))
    );
    const utilPercent = (c) => {
      const limit = Number(c.credit_limit || 0);
      if (!limit) return 0;
      return Math.min(100, Math.round(Number(c.outstanding || 0) / limit * 100));
    };
    const filteredCustomers = computed(() => {
      if (filterUtil.value === "high") return rows.value.filter((c) => utilPercent(c) > 80);
      if (filterUtil.value === "over") return rows.value.filter((c) => Number(c.overdue) > 0);
      return rows.value;
    });
    const atRiskCount = computed(() => rows.value.filter((c) => utilPercent(c) > 80).length);
    const overdueCount = computed(() => rows.value.filter((c) => Number(c.overdue) > 0).length);
    async function saveAll() {
      var _a, _b;
      const updates = rows.value.filter((c) => c.newLimit !== Number(c.credit_limit || 0)).map((c) => ({ id: c.id, credit_limit: c.newLimit }));
      if (!updates.length) return;
      saving.value = true;
      try {
        await $fetch("/api/credit-sales/credit-limits", {
          method: "PATCH",
          body: { updates }
        });
        success(`${updates.length} credit limit(s) updated successfully`);
        await refresh();
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to save credit limits");
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Credit Limits",
        subtitle: "Review and manage credit limits for all customers",
        breadcrumb: ["Credit Sales", "Credit Limits"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button${ssrIncludeBooleanAttr(unref(saving) || !unref(dirty)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"${_scopeId}>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: saveAll,
                disabled: unref(saving) || !unref(dirty),
                class: "btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              }, toDisplayString(unref(saving) ? "Saving\u2026" : "Save Changes"), 9, ["disabled"])
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
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Credit Extended</p><p class="text-xl font-bold text-gray-100">\u09F3${ssrInterpolate(Number(unref(stats).total_limit || 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Outstanding</p><p class="text-xl font-bold text-red-400">\u09F3${ssrInterpolate(Number(unref(stats).total_outstanding || 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">At Risk (&gt;80%)</p><p class="text-xl font-bold text-orange-400">${ssrInterpolate(unref(atRiskCount))}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Overdue Customers</p><p class="text-xl font-bold text-red-500">${ssrInterpolate(unref(overdueCount))}</p></div></div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h3 class="section-title">Customer Credit Limits</h3><div class="flex gap-2"><!--[-->`);
        ssrRenderList(utilizationFilters, (f) => {
          _push(`<button class="${ssrRenderClass([
            "text-xs px-3 py-1 rounded-lg border transition-all",
            unref(filterUtil) === f.value ? "bg-gold-500/10 border-gold-500/40 text-gold-400" : "border-white/10 text-gray-500 hover:border-white/20"
          ])}">${ssrInterpolate(f.label)}</button>`);
        });
        _push(`<!--]--></div></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Customer</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit Limit</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Outstanding</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Overdue</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider w-40">Utilisation</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Terms</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">New Limit</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(filteredCustomers), (c) => {
          _push(`<tr class="hover:bg-white/[0.02]"><td class="py-3 px-3"><p class="font-semibold text-gray-200">${ssrInterpolate(c.name)}</p><p class="text-gray-600">${ssrInterpolate(c.area || "\u2014")}</p></td><td class="py-3 px-3 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(Number(c.credit_limit || 0).toLocaleString())}</td><td class="py-3 px-3 text-right font-mono font-bold text-red-400">\u09F3${ssrInterpolate(Number(c.outstanding || 0).toLocaleString())}</td><td class="${ssrRenderClass([Number(c.overdue) > 0 ? "text-orange-400 font-bold" : "text-gray-600", "py-3 px-3 text-right font-mono"])}">${ssrInterpolate(Number(c.overdue) > 0 ? `\u09F3${Number(c.overdue).toLocaleString()}` : "\u2014")}</td><td class="py-3 px-3"><div class="flex items-center gap-2"><div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="${ssrRenderClass([utilPercent(c) > 90 ? "bg-red-500" : utilPercent(c) > 80 ? "bg-orange-500" : utilPercent(c) > 60 ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded-full transition-all"])}" style="${ssrRenderStyle(`width:${Math.min(100, utilPercent(c))}%`)}"></div></div><span class="${ssrRenderClass([utilPercent(c) > 80 ? "text-red-400" : "text-gray-500", "w-8 text-right"])}">${ssrInterpolate(utilPercent(c))}%</span></div></td><td class="py-3 px-3 text-center text-gray-400">${ssrInterpolate(c.payment_terms || "\u2014")}d</td><td class="py-3 px-3 text-right"><div class="relative inline-flex"><span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600">\u09F3</span><input${ssrRenderAttr("value", c.newLimit)} type="number" step="100000" class="w-28 bg-white/[0.05] border border-gold-500/20 rounded-lg pl-5 pr-2 py-1 text-right font-mono text-xs text-gold-300 focus:outline-none focus:ring-1 focus:ring-gold-500/50"></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/credit-limits.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=credit-limits-HQvUcNSF.mjs.map
