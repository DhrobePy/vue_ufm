import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import { c as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
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
  __name: "approve",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, pending: loading, error: fetchError, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/expenses",
      {
        query: { status: "pending", per: 50 }
      },
      "$DzSXdpzxnc"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const expenses = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.expenses) != null ? _b : [];
    });
    const acting = ref(null);
    const rejectModal = ref(false);
    const rejectTarget = ref(null);
    const rejectReason = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-dc2520d5>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Approve Expenses",
        subtitle: "Review pending expense vouchers",
        breadcrumb: ["Expenses", "Approve"]
      }, null, _parent));
      if (unref(loading)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-dc2520d5>Loading\u2026</div>`);
      } else if (unref(fetchError)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-dc2520d5>\u26A0 ${ssrInterpolate(unref(fetchError).message)}</div>`);
      } else {
        _push(`<div class="space-y-3" data-v-dc2520d5><!--[-->`);
        ssrRenderList(unref(expenses), (e) => {
          _push(`<div class="glass-card-hover p-5 flex flex-col md:flex-row md:items-center gap-4" data-v-dc2520d5><div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#f59e0b,#d97706)" })}" data-v-dc2520d5>${ssrInterpolate((e.category_name || "E")[0])}</div><div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" data-v-dc2520d5><div data-v-dc2520d5><p class="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider" data-v-dc2520d5>Voucher</p><p class="font-mono text-gold-400/80 font-medium" data-v-dc2520d5>${ssrInterpolate(e.voucher_number)}</p></div><div data-v-dc2520d5><p class="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider" data-v-dc2520d5>Category</p><p class="text-gray-300" data-v-dc2520d5>${ssrInterpolate(e.category_name || "\u2014")}</p></div><div data-v-dc2520d5><p class="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider" data-v-dc2520d5>Amount</p><p class="font-bold text-white" data-v-dc2520d5>\u09F3${ssrInterpolate(Number(e.total_amount).toLocaleString())}</p></div><div data-v-dc2520d5><p class="text-[10px] text-gray-600 mb-0.5 uppercase tracking-wider" data-v-dc2520d5>Submitted By</p><p class="text-gray-400" data-v-dc2520d5>${ssrInterpolate(e.created_by_name || "\u2014")}</p></div></div>`);
          if (e.remarks) {
            _push(`<p class="text-xs text-gray-500 md:max-w-[200px] truncate" data-v-dc2520d5>${ssrInterpolate(e.remarks)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex gap-2 shrink-0" data-v-dc2520d5><button${ssrIncludeBooleanAttr(unref(acting) === e.id) ? " disabled" : ""} class="btn-ghost text-xs py-1.5 px-3 border-red-500/20 text-red-400 hover:bg-red-500/10" data-v-dc2520d5> Reject </button><button${ssrIncludeBooleanAttr(unref(acting) === e.id) ? " disabled" : ""} class="btn-gold text-xs py-1.5 px-3" data-v-dc2520d5>${ssrInterpolate(unref(acting) === e.id ? "\u2026" : "Approve")}</button></div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(expenses).length) {
          _push(`<div class="glass-card p-12 text-center" data-v-dc2520d5><p class="text-emerald-400 font-semibold" data-v-dc2520d5>\u2713 All caught up \u2014 no pending expenses</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b, _c;
        if (unref(rejectModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.6)", "backdrop-filter": "blur(4px)" })}" data-v-dc2520d5><div class="w-full max-w-md glass-card p-6 space-y-4" data-v-dc2520d5><h3 class="section-title text-red-400" data-v-dc2520d5>Reject Expense</h3><p class="text-sm text-gray-400" data-v-dc2520d5> Rejecting <strong class="text-gold-400" data-v-dc2520d5>${ssrInterpolate((_a = unref(rejectTarget)) == null ? void 0 : _a.voucher_number)}</strong>. Please provide a reason. </p><textarea rows="3" class="field-input w-full resize-none" placeholder="Rejection reason\u2026" data-v-dc2520d5>${ssrInterpolate(unref(rejectReason))}</textarea><div class="flex gap-3 justify-end" data-v-dc2520d5><button class="btn-ghost text-xs" data-v-dc2520d5>Cancel</button><button${ssrIncludeBooleanAttr(!unref(rejectReason).trim() || unref(acting) === ((_b = unref(rejectTarget)) == null ? void 0 : _b.id)) ? " disabled" : ""} class="btn-ghost text-xs border-red-500/25 text-red-400 hover:bg-red-500/10 disabled:opacity-40" data-v-dc2520d5>${ssrInterpolate(unref(acting) === ((_c = unref(rejectTarget)) == null ? void 0 : _c.id) ? "\u2026" : "Confirm Reject")}</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/expenses/approve.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const approve = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-dc2520d5"]]);

export { approve as default };
//# sourceMappingURL=approve-i7Atxykk.mjs.map
