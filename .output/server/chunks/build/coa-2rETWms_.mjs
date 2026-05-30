import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "coa",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const filterType = ref("");
    const filterStatus = ref("");
    const showAddModal = ref(false);
    const collapsedGroups = ref(/* @__PURE__ */ new Set());
    const GROUP_META = {
      Asset: { icon: "\u{1F3DB}", color: "#10b981" },
      Liability: { icon: "\u{1F4CB}", color: "#ef4444" },
      Equity: { icon: "\u{1F4CA}", color: "#8b5cf6" },
      Revenue: { icon: "\u{1F4B0}", color: "#f59e0b" },
      Expense: { icon: "\u{1F4B8}", color: "#f97316" }
    };
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/coa",
      {
        query: computed(() => ({
          search: search.value,
          type: filterType.value,
          status: filterStatus.value
        }))
      },
      "$TPRnchBJT8"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const accounts = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const filteredGroups = computed(() => {
      var _a;
      const groups = {};
      for (const acc of accounts.value) {
        const g = (_a = acc.account_type_group) != null ? _a : "Other";
        if (!groups[g]) groups[g] = [];
        groups[g].push(acc);
      }
      return Object.entries(groups).map(([type, accs]) => {
        var _a2, _b, _c, _d;
        return {
          type,
          label: type,
          icon: (_b = (_a2 = GROUP_META[type]) == null ? void 0 : _a2.icon) != null ? _b : "\u{1F4C1}",
          color: (_d = (_c = GROUP_META[type]) == null ? void 0 : _c.color) != null ? _d : "#6b7280",
          accounts: accs
        };
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Chart of Accounts",
        subtitle: "Full list of ledger accounts organised by type",
        breadcrumb: ["Accounts", "Chart of Accounts"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs"${_scopeId}>+ Add Account</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: ($event) => showAddModal.value = true,
                class: "btn-gold text-xs"
              }, "+ Add Account", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" placeholder="Search accounts\u2026"><select class="input-glass w-auto text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterType)) ? ssrLooseContain(unref(filterType), "") : ssrLooseEqual(unref(filterType), "")) ? " selected" : ""}>All Groups</option><option value="Asset"${ssrIncludeBooleanAttr(Array.isArray(unref(filterType)) ? ssrLooseContain(unref(filterType), "Asset") : ssrLooseEqual(unref(filterType), "Asset")) ? " selected" : ""}>Asset</option><option value="Liability"${ssrIncludeBooleanAttr(Array.isArray(unref(filterType)) ? ssrLooseContain(unref(filterType), "Liability") : ssrLooseEqual(unref(filterType), "Liability")) ? " selected" : ""}>Liability</option><option value="Equity"${ssrIncludeBooleanAttr(Array.isArray(unref(filterType)) ? ssrLooseContain(unref(filterType), "Equity") : ssrLooseEqual(unref(filterType), "Equity")) ? " selected" : ""}>Equity</option><option value="Revenue"${ssrIncludeBooleanAttr(Array.isArray(unref(filterType)) ? ssrLooseContain(unref(filterType), "Revenue") : ssrLooseEqual(unref(filterType), "Revenue")) ? " selected" : ""}>Revenue</option><option value="Expense"${ssrIncludeBooleanAttr(Array.isArray(unref(filterType)) ? ssrLooseContain(unref(filterType), "Expense") : ssrLooseEqual(unref(filterType), "Expense")) ? " selected" : ""}>Expense</option></select><select class="input-glass w-auto text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "") : ssrLooseEqual(unref(filterStatus), "")) ? " selected" : ""}>All</option><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "active") : ssrLooseEqual(unref(filterStatus), "active")) ? " selected" : ""}>Active</option><option value="inactive"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "inactive") : ssrLooseEqual(unref(filterStatus), "inactive")) ? " selected" : ""}>Inactive</option></select></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500 animate-pulse">Loading accounts\u2026</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(filteredGroups), (group) => {
        _push(`<div class="glass-card p-5"><div class="flex items-center justify-between mb-4 cursor-pointer"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold" style="${ssrRenderStyle(`background: ${group.color}20; color: ${group.color}`)}">${ssrInterpolate(group.icon)}</div><div><h3 class="font-semibold text-gray-200">${ssrInterpolate(group.label)}</h3><p class="text-xs text-gray-500">${ssrInterpolate(group.accounts.length)} accounts</p></div></div><div class="flex items-center gap-4"><div class="text-right"><p class="text-xs text-gray-500">Net Balance</p><p class="font-bold text-sm" style="${ssrRenderStyle(`color: ${group.color}`)}"> \u09F3${ssrInterpolate(group.accounts.reduce((s, a) => {
          var _a;
          return s + Number((_a = a.balance) != null ? _a : 0);
        }, 0).toLocaleString())}</p></div><svg class="${ssrRenderClass([unref(collapsedGroups).has(group.type) ? "" : "rotate-180", "w-4 h-4 text-gray-600 transition-transform"])}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg></div></div>`);
        if (!unref(collapsedGroups).has(group.type)) {
          _push(`<div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Code</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Account Name</th><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Type</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Balance (\u09F3)</th><th class="pb-2 px-3 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th><th class="pb-2 px-3"></th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
          ssrRenderList(group.accounts, (acc) => {
            var _a, _b;
            _push(`<tr class="hover:bg-white/[0.02]"><td class="py-2.5 px-3 font-mono text-gray-500">${ssrInterpolate((_a = acc.account_number) != null ? _a : "\u2014")}</td><td class="py-2.5 px-3 text-gray-200 font-medium">${ssrInterpolate(acc.name)}</td><td class="py-2.5 px-3 text-gray-500">${ssrInterpolate(acc.account_type)}</td><td class="py-2.5 px-3 text-right font-mono font-semibold" style="${ssrRenderStyle(`color: ${group.color}`)}">${ssrInterpolate(Number((_b = acc.balance) != null ? _b : 0).toLocaleString())}</td><td class="py-2.5 px-3 text-center">`);
            _push(ssrRenderComponent(_component_UiStatusBadge, {
              status: acc.status
            }, null, _parent));
            _push(`</td><td class="py-2.5 px-3 text-right"><button class="text-gray-600 hover:text-gold-400 text-xs transition-colors">Edit</button></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/accounts/coa.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=coa-2rETWms_.mjs.map
