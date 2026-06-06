import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "history",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/payroll",
      { query: { view: "history" } },
      "$lPbWXpiMwl"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const payrolls = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payrolls) != null ? _b : [];
    });
    const search = ref("");
    const filterStatus = ref("");
    const filtered = computed(() => payrolls.value.filter((p) => {
      const q = search.value.toLowerCase();
      return (!q || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q)) && (!filterStatus.value || p.status === filterStatus.value);
    }));
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    const statusBadge = (s) => ({
      pending_approval: "badge-yellow",
      approved: "badge-blue",
      paid: "badge-green",
      rejected: "badge-red"
    })[s] || "badge-gray";
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div><h1 class="text-2xl font-bold text-white">Payroll History</h1><p class="text-sm text-gray-400">${ssrInterpolate(unref(filtered).length)} records</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/hr/payroll",
        class: "btn-secondary text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 Back to Payroll`);
          } else {
            return [
              createTextVNode("\u2190 Back to Payroll")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} placeholder="Search employee\u2026" class="input-field w-48 text-sm"><select class="input-field text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "") : ssrLooseEqual(unref(filterStatus), "")) ? " selected" : ""}>All Status</option><option value="pending_approval"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "pending_approval") : ssrLooseEqual(unref(filterStatus), "pending_approval")) ? " selected" : ""}>Pending</option><option value="approved"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "approved") : ssrLooseEqual(unref(filterStatus), "approved")) ? " selected" : ""}>Approved</option><option value="paid"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "paid") : ssrLooseEqual(unref(filterStatus), "paid")) ? " selected" : ""}>Paid</option><option value="rejected"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "rejected") : ssrLooseEqual(unref(filterStatus), "rejected")) ? " selected" : ""}>Rejected</option></select></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th">Pay Period</th><th class="th text-right">Gross</th><th class="th text-right">Deductions</th><th class="th text-right text-green-400">Net</th><th class="th text-center">Status</th><th class="th text-right">Payslip</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(filtered), (p) => {
        _push(`<tr class="tr"><td class="td"><p class="font-medium text-gray-200">${ssrInterpolate(p.first_name)} ${ssrInterpolate(p.last_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(p.position_name)}</p></td><td class="td text-gray-400 text-xs">${ssrInterpolate(fmtDate(p.pay_period_start))} \u2013 ${ssrInterpolate(fmtDate(p.pay_period_end))}</td><td class="td text-right text-gray-300">\u09F3${ssrInterpolate(fmt(p.gross_salary))}</td><td class="td text-right text-red-400">\u09F3${ssrInterpolate(fmt(p.deductions))}</td><td class="td text-right font-semibold text-green-400">\u09F3${ssrInterpolate(fmt(p.net_salary))}</td><td class="td text-center"><span class="${ssrRenderClass([statusBadge(p.status), "badge"])}">${ssrInterpolate(p.status)}</span></td><td class="td text-right">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/hr/payslip/${p.id}`,
          class: "btn-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`View`);
            } else {
              return [
                createTextVNode("View")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(filtered).length) {
        _push(`<tr><td colspan="7" class="td text-center text-gray-500 py-10">No records found.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/payroll/history.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=history-BT9TbI0F.mjs.map
