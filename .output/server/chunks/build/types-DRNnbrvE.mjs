import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderClass, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { c as _export_sfc } from './server.mjs';
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
  __name: "types",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const showModal = ref(false);
    const saving = ref(false);
    const editingId = ref(null);
    const form = reactive({ name: "", nature: "income", description: "", chart_of_account_id: "" });
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank/transaction-types",
      "$ZqL6JPjvfo"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const types2 = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.types) != null ? _b : [];
    });
    const { data: coaData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/accounts/coa",
      "$aBsYMGZg4K"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const glAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = coaData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const NATURE_COLORS = {
      income: "#10b981",
      expense: "#ef4444",
      transfer: "#3b82f6",
      other: "#6b7280"
    };
    const NATURE_ICONS = {
      income: "\u2191",
      expense: "\u2193",
      transfer: "\u21C4",
      other: "\u25CB"
    };
    function natureColor(n) {
      var _a;
      return (_a = NATURE_COLORS[n]) != null ? _a : NATURE_COLORS.other;
    }
    function natureIcon(n) {
      var _a;
      return (_a = NATURE_ICONS[n]) != null ? _a : NATURE_ICONS.other;
    }
    function openAdd() {
      editingId.value = null;
      Object.assign(form, { name: "", nature: "income", description: "", chart_of_account_id: "" });
      showModal.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-1b2c2057>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Transaction Types",
        subtitle: "Manage income / expense / transfer categories for bank transactions",
        breadcrumb: ["Bank", "Accounts", "Transaction Types"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs" data-v-1b2c2057${_scopeId}>+ Add Type</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: openAdd,
                class: "btn-gold text-xs"
              }, "+ Add Type")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-v-1b2c2057><!--[-->`);
        ssrRenderList(4, (i) => {
          _push(`<div class="glass-card p-5 h-36 animate-pulse" data-v-1b2c2057></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-v-1b2c2057><!--[-->`);
        ssrRenderList(unref(types2), (t) => {
          _push(`<div class="glass-card p-5 space-y-3" data-v-1b2c2057><div class="flex items-center justify-between" data-v-1b2c2057><div class="flex items-center gap-2.5" data-v-1b2c2057><div class="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style="${ssrRenderStyle(`background: ${natureColor(t.nature)}20; border: 1px solid ${natureColor(t.nature)}40; color: ${natureColor(t.nature)}`)}" data-v-1b2c2057>${ssrInterpolate(natureIcon(t.nature))}</div><p class="text-sm font-semibold text-gray-200" data-v-1b2c2057>${ssrInterpolate(t.name)}</p></div><button class="${ssrRenderClass([
            "text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors",
            t.is_active ? "bg-emerald-500/15 text-emerald-400 hover:bg-red-500/15 hover:text-red-400" : "bg-red-500/15 text-red-400 hover:bg-emerald-500/15 hover:text-emerald-400"
          ])}" data-v-1b2c2057>${ssrInterpolate(t.is_active ? "Active" : "Inactive")}</button></div><p class="text-xs text-gray-500 leading-relaxed" data-v-1b2c2057>${ssrInterpolate(t.description || "\u2014")}</p><div class="flex justify-between items-center text-xs" data-v-1b2c2057><span class="capitalize px-2 py-0.5 rounded-full text-[10px] font-medium" style="${ssrRenderStyle(`background: ${natureColor(t.nature)}15; color: ${natureColor(t.nature)}`)}" data-v-1b2c2057>${ssrInterpolate(t.nature)}</span></div><div class="text-xs" data-v-1b2c2057><span class="text-gray-600" data-v-1b2c2057>GL Account: </span>`);
          if (t.gl_account_name) {
            _push(`<span class="text-blue-400" data-v-1b2c2057>${ssrInterpolate(t.gl_account_name)}</span>`);
          } else {
            _push(`<span class="text-red-400" data-v-1b2c2057>Not mapped \u2014 approvals blocked</span>`);
          }
          _push(`</div><div class="flex gap-2 pt-1" data-v-1b2c2057><button class="btn-ghost text-xs flex-1 justify-center py-1.5" data-v-1b2c2057>Edit</button></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showModal)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-1b2c2057><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-1b2c2057><div class="flex items-center justify-between" data-v-1b2c2057><h3 class="text-lg font-bold text-gray-100" data-v-1b2c2057>${ssrInterpolate(unref(editingId) ? "Edit Transaction Type" : "Add Transaction Type")}</h3><button class="text-gray-500 hover:text-gray-200" data-v-1b2c2057>\u2715</button></div><div class="space-y-4" data-v-1b2c2057><div class="space-y-1.5" data-v-1b2c2057><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1b2c2057>Type Name *</label><input${ssrRenderAttr("value", unref(form).name)} class="input-glass" placeholder="e.g. Customer Receipt" data-v-1b2c2057></div><div class="space-y-1.5" data-v-1b2c2057><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1b2c2057>Nature</label><select class="input-glass" data-v-1b2c2057><option value="income" data-v-1b2c2057${ssrIncludeBooleanAttr(Array.isArray(unref(form).nature) ? ssrLooseContain(unref(form).nature, "income") : ssrLooseEqual(unref(form).nature, "income")) ? " selected" : ""}>Income</option><option value="expense" data-v-1b2c2057${ssrIncludeBooleanAttr(Array.isArray(unref(form).nature) ? ssrLooseContain(unref(form).nature, "expense") : ssrLooseEqual(unref(form).nature, "expense")) ? " selected" : ""}>Expense</option><option value="transfer" data-v-1b2c2057${ssrIncludeBooleanAttr(Array.isArray(unref(form).nature) ? ssrLooseContain(unref(form).nature, "transfer") : ssrLooseEqual(unref(form).nature, "transfer")) ? " selected" : ""}>Transfer</option><option value="other" data-v-1b2c2057${ssrIncludeBooleanAttr(Array.isArray(unref(form).nature) ? ssrLooseContain(unref(form).nature, "other") : ssrLooseEqual(unref(form).nature, "other")) ? " selected" : ""}>Other</option></select></div><div class="space-y-1.5" data-v-1b2c2057><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1b2c2057>Description</label><textarea rows="2" class="input-glass resize-none" placeholder="Optional description\u2026" data-v-1b2c2057>${ssrInterpolate(unref(form).description)}</textarea></div><div class="space-y-1.5" data-v-1b2c2057><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-1b2c2057>GL Account *</label><select class="input-glass" data-v-1b2c2057><option value="" data-v-1b2c2057${ssrIncludeBooleanAttr(Array.isArray(unref(form).chart_of_account_id) ? ssrLooseContain(unref(form).chart_of_account_id, "") : ssrLooseEqual(unref(form).chart_of_account_id, "")) ? " selected" : ""}>\u2014 Select GL account \u2014</option><!--[-->`);
          ssrRenderList(unref(glAccounts), (a) => {
            _push2(`<option${ssrRenderAttr("value", a.id)} data-v-1b2c2057${ssrIncludeBooleanAttr(Array.isArray(unref(form).chart_of_account_id) ? ssrLooseContain(unref(form).chart_of_account_id, a.id) : ssrLooseEqual(unref(form).chart_of_account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.name)} (${ssrInterpolate(a.account_type)}) </option>`);
          });
          _push2(`<!--]--></select><p class="text-[11px] text-gray-600" data-v-1b2c2057>The offsetting account posted whenever a transaction of this type is approved.</p></div></div><div class="flex gap-3 pt-2" data-v-1b2c2057><button${ssrIncludeBooleanAttr(!unref(form).name.trim() || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-1b2c2057>${ssrInterpolate(unref(saving) ? "Saving\u2026" : unref(editingId) ? "Save Changes" : "Add Type")}</button><button class="btn-ghost text-xs" data-v-1b2c2057>Cancel</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/bank/accounts/types.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const types = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1b2c2057"]]);

export { types as default };
//# sourceMappingURL=types-DRNnbrvE.mjs.map
