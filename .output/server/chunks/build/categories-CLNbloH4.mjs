import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "categories",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { success, error } = useToast();
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/expenses/categories",
      "$O_FrhRrFcM"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const categories = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.categories) != null ? _b : [];
    });
    const categoriesWithBudget = computed(() => categories.value.filter((c) => c.budget > 0));
    const { data: coaData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/coa",
      "$74jHa-DFIb"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const glOptions = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = coaData.value) == null ? void 0 : _a.accounts) != null ? _b : []).map((a) => ({
          value: a.id,
          label: `${a.account_number ? a.account_number + " \u2014 " : ""}${a.name}`
        }));
      }
    );
    const form = reactive({ name: "", description: "", icon: "", color: "#f59e0b", budget: 0, chartOfAccountId: null });
    const editingId = ref(null);
    const saving = ref(false);
    function openAdd() {
      editingId.value = null;
      Object.assign(form, { name: "", description: "", icon: "", color: "#f59e0b", budget: 0, chartOfAccountId: null });
    }
    const expandedCat = ref(null);
    const subGlSelection = reactive({});
    async function saveSubGl(sub, value) {
      var _a, _b;
      subGlSelection[sub.id] = value;
      try {
        await $fetch(`/api/expenses/subcategories/${sub.id}`, {
          method: "PATCH",
          body: { chart_of_account_id: value || null }
        });
        success(`GL account updated for "${sub.name}"`);
        await refresh();
      } catch (e) {
        error((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to update GL account");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiSearchSelect = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Expense Categories",
        subtitle: "Manage expense categories and budget allocations",
        breadcrumb: ["Expenses", "Categories"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs"${_scopeId}>+ New Category</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: openAdd,
                class: "btn-gold text-xs"
              }, "+ New Category")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-5 space-y-4"><div class="flex items-center justify-between"><h3 class="section-title">All Categories</h3><span class="text-xs text-gray-500">${ssrInterpolate(unref(categories).length)} categories</span></div><div class="space-y-2"><!--[-->`);
      ssrRenderList(unref(categories), (cat) => {
        _push(`<div class="rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/20 transition-all"><div class="flex items-center justify-between p-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-xl flex items-center justify-center text-base" style="${ssrRenderStyle(`background: ${cat.color}20; border: 1px solid ${cat.color}40`)}">${ssrInterpolate(cat.icon)}</div><div><p class="text-sm font-semibold text-gray-200">${ssrInterpolate(cat.name)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(cat.description)}</p><p class="${ssrRenderClass([cat.glAccountName ? "text-emerald-400" : "text-red-400", "text-[10px] mt-0.5"])}">${ssrInterpolate(cat.glAccountName ? `GL: ${cat.glAccountName}` : "\u26A0 No GL account mapped \u2014 approvals will be blocked")}</p></div></div><div class="flex items-center gap-4 text-right"><div><p class="text-xs text-gray-500">This month</p><p class="text-sm font-bold text-gray-200">\u09F3${ssrInterpolate(cat.monthlySpend.toLocaleString())}</p></div>`);
        if (cat.budget) {
          _push(`<div><p class="text-xs text-gray-500">Budget</p><p class="${ssrRenderClass([cat.monthlySpend > cat.budget ? "text-red-400" : "text-emerald-400", "text-xs font-semibold"])}"> \u09F3${ssrInterpolate(cat.budget.toLocaleString())}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-1.5"><button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all" title="Subcategories"><svg class="${ssrRenderClass([unref(expandedCat) === cat.id ? "rotate-180" : "", "w-3.5 h-3.5"])}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg></button><button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gold-400 hover:bg-gold-500/10 transition-all"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button></div></div></div>`);
        if (unref(expandedCat) === cat.id) {
          _push(`<div class="px-4 pb-4 pt-1 space-y-2 border-t border-white/[0.06]">`);
          if (!cat.subcategories.length) {
            _push(`<div class="text-[11px] text-gray-600 pt-2">No subcategories.</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(cat.subcategories, (sub) => {
            var _a;
            _push(`<div class="flex items-center justify-between gap-2 pt-2"><span class="text-xs text-gray-300 truncate">${ssrInterpolate(sub.name)}</span>`);
            _push(ssrRenderComponent(_component_UiSearchSelect, {
              "model-value": (_a = unref(subGlSelection)[sub.id]) != null ? _a : sub.chartOfAccountId,
              "onUpdate:modelValue": (v) => saveSubGl(sub, v),
              options: unref(glOptions),
              placeholder: "Inherit category GL",
              class: "text-[11px] w-52 shrink-0"
            }, null, _parent));
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="section-title">${ssrInterpolate(unref(editingId) ? "Edit Category" : "New Category")}</h3><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name *</label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="input-glass" placeholder="e.g. Fuel &amp; Vehicle"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label><input${ssrRenderAttr("value", unref(form).description)} type="text" class="input-glass" placeholder="What this covers\u2026"></div><div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Icon (emoji)</label><input${ssrRenderAttr("value", unref(form).icon)} type="text" class="input-glass text-center text-xl" placeholder="\u{1F3F7}\uFE0F" maxlength="2"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colour</label><input${ssrRenderAttr("value", unref(form).color)} type="color" class="w-full h-10 rounded-xl border border-white/10 bg-white/[0.05] cursor-pointer"></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Monthly Budget (\u09F3)</label><input${ssrRenderAttr("value", unref(form).budget)} type="number" class="input-glass font-mono" placeholder="0 = no limit"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">GL Account *</label>`);
      _push(ssrRenderComponent(_component_UiSearchSelect, {
        modelValue: unref(form).chartOfAccountId,
        "onUpdate:modelValue": ($event) => unref(form).chartOfAccountId = $event,
        options: unref(glOptions),
        placeholder: "Search chart of accounts\u2026"
      }, null, _parent));
      _push(`<p class="text-[10px] text-gray-600">Required before any expense in this category can be approved.</p></div><div class="flex gap-2"><button${ssrIncludeBooleanAttr(!unref(form).name || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50">${ssrInterpolate(unref(saving) ? "Saving\u2026" : unref(editingId) ? "Update" : "Create Category")}</button>`);
      if (unref(editingId)) {
        _push(`<button class="btn-ghost text-xs">Cancel</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">May 2026 Summary</h3><!--[-->`);
      ssrRenderList(unref(categoriesWithBudget), (cat) => {
        _push(`<div class="space-y-1"><div class="flex justify-between text-xs"><span class="text-gray-400">${ssrInterpolate(cat.name)}</span><span class="${ssrRenderClass([cat.monthlySpend > cat.budget ? "text-red-400" : "text-gray-300", "font-mono"])}"> \u09F3${ssrInterpolate(cat.monthlySpend.toLocaleString())} / \u09F3${ssrInterpolate(cat.budget.toLocaleString())}</span></div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="${ssrRenderClass([cat.monthlySpend > cat.budget ? "bg-red-500" : "bg-emerald-500", "h-full rounded-full transition-all"])}" style="${ssrRenderStyle(`width:${Math.min(100, Math.round(cat.monthlySpend / cat.budget * 100))}%`)}"></div></div></div>`);
      });
      _push(`<!--]--></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/categories.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=categories-CLNbloH4.mjs.map
