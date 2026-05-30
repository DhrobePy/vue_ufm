import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, ref, withAsyncContext, watch, computed, mergeProps, withCtx, unref, withDirectives, createVNode, isRef, vModelText, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { u as usePrint } from './usePrint-B798zm70.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "daily-log",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { printElement } = usePrint();
    const selectedDate = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const typeFilter = ref("all");
    const typeFilters = [
      { value: "all", label: "All" },
      { value: "sales", label: "Sales" },
      { value: "payment", label: "Payments" },
      { value: "expense", label: "Expenses" }
    ];
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/accounts/daily-log?date=${selectedDate.value}`,
      "$5OzrxW4Yx9"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(selectedDate, () => refresh());
    const entries = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.entries) != null ? _b : [];
    });
    const filteredEntries = computed(
      () => typeFilter.value === "all" ? entries.value : entries.value.filter((e) => e.type === typeFilter.value)
    );
    const totalDebits = computed(
      () => filteredEntries.value.flatMap((e) => e.lines).reduce((s, l) => s + l.debit, 0)
    );
    const totalCredits = computed(
      () => filteredEntries.value.flatMap((e) => e.lines).reduce((s, l) => s + l.credit, 0)
    );
    const isBalanced = computed(() => totalDebits.value === totalCredits.value);
    function printLog() {
      printElement("daily-log-print", `Daily Accounts Log \u2014 ${selectedDate.value}`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Daily Accounts Log",
        subtitle: "All transactions posted today across all accounts",
        breadcrumb: ["Accounts", "Daily Log"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<input${ssrRenderAttr("value", unref(selectedDate))} type="date" class="input-glass text-xs py-1.5"${_scopeId}><button class="btn-ghost text-xs"${_scopeId}>\u{1F5A8} Print</button>`);
          } else {
            return [
              withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(selectedDate) ? selectedDate.value = $event : null,
                type: "date",
                class: "input-glass text-xs py-1.5"
              }, null, 8, ["onUpdate:modelValue"]), [
                [vModelText, unref(selectedDate)]
              ]),
              createVNode("button", {
                onClick: printLog,
                class: "btn-ghost text-xs"
              }, "\u{1F5A8} Print")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Entries</p><p class="text-2xl font-bold text-gray-100">${ssrInterpolate(unref(entries).length)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Debits</p><p class="text-2xl font-bold text-red-400">\u09F3${ssrInterpolate(unref(totalDebits).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Credits</p><p class="text-2xl font-bold text-emerald-400">\u09F3${ssrInterpolate(unref(totalCredits).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Balance Check</p><p class="${ssrRenderClass([unref(isBalanced) ? "text-emerald-400" : "text-red-400", "text-2xl font-bold"])}">${ssrInterpolate(unref(isBalanced) ? "\u2713 Balanced" : "\u2717 Error")}</p></div></div><div id="daily-log-print" class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h3 class="section-title">Journal Entries \u2014 ${ssrInterpolate(unref(selectedDate))}</h3><div class="flex gap-2"><!--[-->`);
      ssrRenderList(typeFilters, (f) => {
        _push(`<button class="${ssrRenderClass([
          "text-xs px-3 py-1 rounded-lg border transition-all",
          unref(typeFilter) === f.value ? "bg-gold-500/10 border-gold-500/40 text-gold-400" : "border-white/10 text-gray-500 hover:border-white/20"
        ])}">${ssrInterpolate(f.label)}</button>`);
      });
      _push(`<!--]--></div></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Time</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Description</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Reference</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Debit</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Credit</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">By</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
      ssrRenderList(unref(filteredEntries), (entry) => {
        _push(`<!--[--><!--[-->`);
        ssrRenderList(entry.lines, (line, li) => {
          _push(`<tr class="hover:bg-white/[0.02]"><td class="py-2.5 px-3 text-gray-600 font-mono">${ssrInterpolate(li === 0 ? entry.time : "")}</td><td class="py-2.5 px-3"><span class="text-gray-300">${ssrInterpolate(line.account)}</span><span class="text-gray-600 ml-1">${ssrInterpolate(line.code)}</span></td><td class="py-2.5 px-3 text-gray-400">${ssrInterpolate(li === 0 ? entry.description : "")}</td><td class="py-2.5 px-3 text-gray-600 font-mono">${ssrInterpolate(li === 0 ? entry.ref : "")}</td><td class="py-2.5 px-3 text-right font-mono text-red-400">${ssrInterpolate(line.debit ? `\u09F3${line.debit.toLocaleString()}` : "")}</td><td class="py-2.5 px-3 text-right font-mono text-emerald-400">${ssrInterpolate(line.credit ? `\u09F3${line.credit.toLocaleString()}` : "")}</td><td class="py-2.5 px-3 text-center text-gray-600">${ssrInterpolate(li === 0 ? entry.postedBy : "")}</td></tr>`);
        });
        _push(`<!--]--><tr class="border-b-2 border-white/[0.06]"><td colspan="7" class="py-0"></td></tr><!--]-->`);
      });
      _push(`<!--]--></tbody><tfoot class="border-t-2 border-white/10"><tr><td colspan="4" class="pt-3 px-3 text-right font-bold text-gray-600">Totals</td><td class="pt-3 px-3 text-right font-bold text-red-400 font-mono">\u09F3${ssrInterpolate(unref(totalDebits).toLocaleString())}</td><td class="pt-3 px-3 text-right font-bold text-emerald-400 font-mono">\u09F3${ssrInterpolate(unref(totalCredits).toLocaleString())}</td><td></td></tr></tfoot></table></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/daily-log.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=daily-log-CQZkTKwP.mjs.map
