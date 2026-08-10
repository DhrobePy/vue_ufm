import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
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
  __name: "advances",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const filterStatus = ref("");
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/advances",
      {
        query: computed(() => filterStatus.value ? { status: filterStatus.value } : {})
      },
      "$MC9HL5hFsh"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const advances = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.advances) != null ? _b : [];
    });
    const employees = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.employees) != null ? _b : [];
    });
    const showCreate = ref(false);
    const cSaving = ref(false);
    const now = /* @__PURE__ */ new Date();
    const cForm = ref({
      employee_id: "",
      amount: 0,
      advance_month: String(now.getMonth() + 1).padStart(2, "0"),
      advance_year: String(now.getFullYear()),
      reason: ""
    });
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    const statusBadge = (s) => ({
      pending: "badge-yellow",
      approved: "badge-green",
      rejected: "badge-red",
      paid: "badge-blue"
    })[s] || "badge-gray";
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBackButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div><h1 class="text-2xl font-bold text-white">Salary Advances</h1><p class="text-sm text-gray-400">${ssrInterpolate(unref(advances).length)} records</p></div></div><button class="btn-primary flex items-center gap-2"><span>+</span> New Advance </button></div><div class="flex gap-2"><!--[-->`);
      ssrRenderList(["", "pending", "approved", "rejected", "paid"], (tab) => {
        _push(`<button class="${ssrRenderClass(["btn-xs", unref(filterStatus) === tab ? "btn-primary" : "btn-secondary"])}">${ssrInterpolate(tab || "All")}</button>`);
      });
      _push(`<!--]--></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th">Date</th><th class="th">Month</th><th class="th text-right">Amount</th><th class="th">Reason</th><th class="th text-center">Status</th><th class="th text-right">Actions</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(advances), (adv) => {
        _push(`<tr class="tr"><td class="td"><p class="font-medium text-gray-200">${ssrInterpolate(adv.first_name)} ${ssrInterpolate(adv.last_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(adv.position_name || "\u2014")}</p></td><td class="td text-gray-400">${ssrInterpolate(fmtDate(adv.advance_date))}</td><td class="td text-gray-400 text-xs">${ssrInterpolate(adv.advance_month && adv.advance_year ? `${adv.advance_month}/${adv.advance_year}` : "\u2014")}</td><td class="td text-right font-medium text-gray-200">\u09F3${ssrInterpolate(fmt(adv.amount))}</td><td class="td text-gray-500 text-xs max-w-[140px] truncate">${ssrInterpolate(adv.reason || "\u2014")}</td><td class="td text-center"><span class="${ssrRenderClass([statusBadge(adv.status), "badge"])}">${ssrInterpolate(adv.status)}</span></td><td class="td text-right">`);
        if (adv.status === "pending") {
          _push(`<div class="flex justify-end gap-1"><button class="btn-xs badge-green text-xs px-2 py-0.5 rounded">\u2713</button><button class="btn-xs badge-red text-xs px-2 py-0.5 rounded">\u2717</button></div>`);
        } else if (adv.status === "approved") {
          _push(`<button class="btn-xs badge-blue text-xs px-2 py-0.5 rounded">Mark Paid</button>`);
        } else {
          _push(`<span class="text-gray-600 text-xs">\u2014</span>`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(advances).length) {
        _push(`<tr><td colspan="7" class="td text-center text-gray-500 py-10">No salary advances found.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreate)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-md"><h2 class="text-lg font-bold text-white mb-5">New Salary Advance</h2><form class="space-y-4"><div><label class="label">Employee *</label><select required class="input-field w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).employee_id) ? ssrLooseContain(unref(cForm).employee_id, "") : ssrLooseEqual(unref(cForm).employee_id, "")) ? " selected" : ""}>Select employee</option><!--[-->`);
          ssrRenderList(unref(employees), (e) => {
            _push2(`<option${ssrRenderAttr("value", e.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).employee_id) ? ssrLooseContain(unref(cForm).employee_id, e.id) : ssrLooseEqual(unref(cForm).employee_id, e.id)) ? " selected" : ""}>${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="label">Amount (\u09F3) *</label><input${ssrRenderAttr("value", unref(cForm).amount)} type="number" min="1" required class="input-field w-full"></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Month (MM)</label><input${ssrRenderAttr("value", unref(cForm).advance_month)} type="text" maxlength="2" placeholder="07" class="input-field w-full"></div><div><label class="label">Year (YYYY)</label><input${ssrRenderAttr("value", unref(cForm).advance_year)} type="text" maxlength="4" placeholder="2025" class="input-field w-full"></div></div><div><label class="label">Reason</label><textarea rows="2" class="input-field w-full resize-none">${ssrInterpolate(unref(cForm).reason)}</textarea></div><div class="flex justify-end gap-3 pt-2"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(cSaving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(cSaving) ? "Submitting\u2026" : "Submit")}</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/advances.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=advances-CjrzYayF.mjs.map
