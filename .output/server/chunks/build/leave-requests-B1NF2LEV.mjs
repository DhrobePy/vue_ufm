import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
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
  __name: "leave-requests",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const filterStatus = ref("");
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/leave-requests",
      {
        query: computed(() => filterStatus.value ? { status: filterStatus.value } : {})
      },
      "$hZhf4WslIV"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const requests = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.requests) != null ? _b : [];
    });
    const { data: empData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/employees",
      "$vRCBVVUa7J"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const employees = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = empData.value) == null ? void 0 : _a.employees) == null ? void 0 : _b.filter((e) => e.status === "active")) != null ? _c : [];
    });
    const showCreate = ref(false);
    const cSaving = ref(false);
    const cForm = ref({ employee_id: "", leave_type: "Annual", start_date: "", end_date: "", reason: "" });
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    const daysBetween = (s, e) => {
      if (!s || !e) return "\u2014";
      const diff = (new Date(e).getTime() - new Date(s).getTime()) / 864e5;
      return `${Math.round(diff) + 1}d`;
    };
    const statusBadge = (s) => ({ pending: "badge-yellow", approved: "badge-green", rejected: "badge-red" })[s] || "badge-gray";
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div><h1 class="text-2xl font-bold text-white">Leave Requests</h1><p class="text-sm text-gray-400">${ssrInterpolate(unref(requests).length)} records</p></div><button class="btn-primary flex items-center gap-2"><span>+</span> New Request </button></div><div class="flex gap-2 flex-wrap"><!--[-->`);
      ssrRenderList(["", "pending", "approved", "rejected"], (tab) => {
        _push(`<button class="${ssrRenderClass(["btn-xs", unref(filterStatus) === tab ? "btn-primary" : "btn-secondary"])}">${ssrInterpolate(tab || "All")}</button>`);
      });
      _push(`<!--]--></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th">Leave Type</th><th class="th">From</th><th class="th">To</th><th class="th text-center">Days</th><th class="th">Reason</th><th class="th text-center">Status</th><th class="th text-right">Actions</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(requests), (req) => {
        _push(`<tr class="tr"><td class="td"><p class="text-gray-200 font-medium">${ssrInterpolate(req.first_name)} ${ssrInterpolate(req.last_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(req.position_name || req.department_name)}</p></td><td class="td text-gray-300">${ssrInterpolate(req.leave_type)}</td><td class="td text-gray-400">${ssrInterpolate(fmtDate(req.start_date))}</td><td class="td text-gray-400">${ssrInterpolate(fmtDate(req.end_date))}</td><td class="td text-center text-gray-300">${ssrInterpolate(daysBetween(req.start_date, req.end_date))}</td><td class="td text-gray-500 max-w-[180px] truncate text-xs">${ssrInterpolate(req.reason || "\u2014")}</td><td class="td text-center"><span class="${ssrRenderClass([statusBadge(req.status), "badge"])}">${ssrInterpolate(req.status)}</span></td><td class="td text-right">`);
        if (req.status === "pending") {
          _push(`<div class="flex justify-end gap-1"><button class="btn-xs badge-green text-xs px-2 py-1 rounded"> Approve </button><button class="btn-xs badge-red text-xs px-2 py-1 rounded"> Reject </button></div>`);
        } else {
          _push(`<span class="text-gray-600 text-xs">\u2014</span>`);
        }
        _push(`</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(requests).length) {
        _push(`<tr><td colspan="8" class="td text-center text-gray-500 py-10">No leave requests found.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreate)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-lg"><h2 class="text-lg font-bold text-white mb-5">New Leave Request</h2><form class="space-y-4"><div><label class="label">Employee *</label><select required class="input-field w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).employee_id) ? ssrLooseContain(unref(cForm).employee_id, "") : ssrLooseEqual(unref(cForm).employee_id, "")) ? " selected" : ""}>Select employee</option><!--[-->`);
          ssrRenderList(unref(employees), (e) => {
            _push2(`<option${ssrRenderAttr("value", e.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).employee_id) ? ssrLooseContain(unref(cForm).employee_id, e.id) : ssrLooseEqual(unref(cForm).employee_id, e.id)) ? " selected" : ""}>${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="label">Leave Type *</label><select required class="input-field w-full"><option value="Annual"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).leave_type) ? ssrLooseContain(unref(cForm).leave_type, "Annual") : ssrLooseEqual(unref(cForm).leave_type, "Annual")) ? " selected" : ""}>Annual Leave</option><option value="Sick"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).leave_type) ? ssrLooseContain(unref(cForm).leave_type, "Sick") : ssrLooseEqual(unref(cForm).leave_type, "Sick")) ? " selected" : ""}>Sick Leave</option><option value="Casual"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).leave_type) ? ssrLooseContain(unref(cForm).leave_type, "Casual") : ssrLooseEqual(unref(cForm).leave_type, "Casual")) ? " selected" : ""}>Casual Leave</option><option value="Maternity"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).leave_type) ? ssrLooseContain(unref(cForm).leave_type, "Maternity") : ssrLooseEqual(unref(cForm).leave_type, "Maternity")) ? " selected" : ""}>Maternity Leave</option><option value="Paternity"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).leave_type) ? ssrLooseContain(unref(cForm).leave_type, "Paternity") : ssrLooseEqual(unref(cForm).leave_type, "Paternity")) ? " selected" : ""}>Paternity Leave</option><option value="Unpaid"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).leave_type) ? ssrLooseContain(unref(cForm).leave_type, "Unpaid") : ssrLooseEqual(unref(cForm).leave_type, "Unpaid")) ? " selected" : ""}>Unpaid Leave</option><option value="Other"${ssrIncludeBooleanAttr(Array.isArray(unref(cForm).leave_type) ? ssrLooseContain(unref(cForm).leave_type, "Other") : ssrLooseEqual(unref(cForm).leave_type, "Other")) ? " selected" : ""}>Other</option></select></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Start Date *</label><input${ssrRenderAttr("value", unref(cForm).start_date)} type="date" required class="input-field w-full"></div><div><label class="label">End Date *</label><input${ssrRenderAttr("value", unref(cForm).end_date)} type="date" required class="input-field w-full"></div></div><div><label class="label">Reason</label><textarea rows="3" class="input-field w-full resize-none">${ssrInterpolate(unref(cForm).reason)}</textarea></div><div class="flex justify-end gap-3 pt-2"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(cSaving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(cSaving) ? "Submitting\u2026" : "Submit Request")}</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/leave-requests.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=leave-requests-B1NF2LEV.mjs.map
