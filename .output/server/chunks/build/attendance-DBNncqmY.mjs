import { defineComponent, ref, computed, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
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
  __name: "attendance",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const selDate = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    const selMonth = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 7));
    const viewMode = ref("daily");
    const queryParams = computed(() => {
      if (viewMode.value === "monthly") return { view: "monthly", month: selMonth.value };
      return { view: "daily", date: selDate.value };
    });
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/attendance",
      { query: queryParams },
      "$2Gz_Adv_6U"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const attendance = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.attendance) != null ? _b : [];
    });
    const allEmployees = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.employees) != null ? _b : [];
    });
    const attMap = computed(() => {
      const m = {};
      for (const a of attendance.value) m[a.employee_id] = a;
      return m;
    });
    const attFor = (id) => attMap.value[id];
    const presCount = computed(() => attendance.value.filter((a) => a.status === "present").length);
    const absentCount = computed(() => Math.max(0, allEmployees.value.length - attendance.value.length));
    const showManual = ref(false);
    const mSaving = ref(false);
    const mForm = ref({ employee_id: "", clock_in: "", clock_out: "", status: "present", note: "" });
    const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "\u2014";
    const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString("en-GB") : "\u2014";
    const calcHours = (ci, co) => {
      if (!ci || !co) return "\u2014";
      const h = (new Date(co).getTime() - new Date(ci).getTime()) / 36e5;
      return `${h.toFixed(1)}h`;
    };
    const statusBadge = (s) => ({
      present: "badge-green",
      late: "badge-yellow",
      half_day: "badge-yellow",
      absent: "badge-red"
    })[s] || "badge-gray";
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div><h1 class="text-2xl font-bold text-white">Attendance</h1><p class="text-sm text-gray-400">${ssrInterpolate(unref(presCount))} present \xB7 ${ssrInterpolate(unref(absentCount))} absent today</p></div><button class="btn-primary flex items-center gap-2"><span class="text-lg leading-none">+</span> Manual Entry </button></div><div class="flex flex-wrap gap-3 items-center"><input${ssrRenderAttr("value", unref(selDate))} type="date" class="input-field text-sm"><select class="input-field text-sm"><option value="daily"${ssrIncludeBooleanAttr(Array.isArray(unref(viewMode)) ? ssrLooseContain(unref(viewMode), "daily") : ssrLooseEqual(unref(viewMode), "daily")) ? " selected" : ""}>Daily View</option><option value="monthly"${ssrIncludeBooleanAttr(Array.isArray(unref(viewMode)) ? ssrLooseContain(unref(viewMode), "monthly") : ssrLooseEqual(unref(viewMode), "monthly")) ? " selected" : ""}>Monthly View</option></select>`);
      if (unref(viewMode) === "monthly") {
        _push(`<input${ssrRenderAttr("value", unref(selMonth))} type="month" class="input-field text-sm">`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(viewMode) === "daily") {
        _push(`<div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th text-center">Status</th><th class="th">Clock In</th><th class="th">Clock Out</th><th class="th text-center">Hours</th><th class="th text-right">Note</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(allEmployees), (emp) => {
          var _a, _b, _c, _d, _e;
          _push(`<tr class="tr"><td class="td"><span class="text-gray-200 font-medium">${ssrInterpolate(emp.first_name)} ${ssrInterpolate(emp.last_name)}</span></td><td class="td text-center">`);
          if (attFor(emp.id)) {
            _push(`<span class="${ssrRenderClass([statusBadge(attFor(emp.id).status), "badge"])}">${ssrInterpolate(attFor(emp.id).status)}</span>`);
          } else {
            _push(`<span class="badge badge-red">absent</span>`);
          }
          _push(`</td><td class="td text-gray-400">${ssrInterpolate(fmtTime((_a = attFor(emp.id)) == null ? void 0 : _a.clock_in))}</td><td class="td text-gray-400">${ssrInterpolate(fmtTime((_b = attFor(emp.id)) == null ? void 0 : _b.clock_out))}</td><td class="td text-center text-gray-400">${ssrInterpolate(calcHours((_c = attFor(emp.id)) == null ? void 0 : _c.clock_in, (_d = attFor(emp.id)) == null ? void 0 : _d.clock_out))}</td><td class="td text-right text-gray-500 text-xs">${ssrInterpolate(((_e = attFor(emp.id)) == null ? void 0 : _e.note) || "")}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(viewMode) === "monthly") {
        _push(`<div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th">Date</th><th class="th text-center">Status</th><th class="th">Clock In</th><th class="th">Clock Out</th><th class="th text-center">Hours</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(attendance), (row) => {
          _push(`<tr class="tr"><td class="td text-gray-200">${ssrInterpolate(row.first_name)} ${ssrInterpolate(row.last_name)}</td><td class="td text-gray-400">${ssrInterpolate(fmtDate(row.clock_in))}</td><td class="td text-center"><span class="${ssrRenderClass([statusBadge(row.status), "badge"])}">${ssrInterpolate(row.status)}</span></td><td class="td text-gray-400">${ssrInterpolate(fmtTime(row.clock_in))}</td><td class="td text-gray-400">${ssrInterpolate(fmtTime(row.clock_out))}</td><td class="td text-center text-gray-400">${ssrInterpolate(calcHours(row.clock_in, row.clock_out))}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showManual)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-lg"><h2 class="text-lg font-bold text-white mb-5">Manual Attendance Entry</h2><form class="space-y-4"><div><label class="label">Employee *</label><select required class="input-field w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(mForm).employee_id) ? ssrLooseContain(unref(mForm).employee_id, "") : ssrLooseEqual(unref(mForm).employee_id, "")) ? " selected" : ""}>Select employee</option><!--[-->`);
          ssrRenderList(unref(allEmployees), (e) => {
            _push2(`<option${ssrRenderAttr("value", e.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(mForm).employee_id) ? ssrLooseContain(unref(mForm).employee_id, e.id) : ssrLooseEqual(unref(mForm).employee_id, e.id)) ? " selected" : ""}>${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Clock In *</label><input${ssrRenderAttr("value", unref(mForm).clock_in)} type="datetime-local" required class="input-field w-full"></div><div><label class="label">Clock Out</label><input${ssrRenderAttr("value", unref(mForm).clock_out)} type="datetime-local" class="input-field w-full"></div></div><div><label class="label">Status</label><select class="input-field w-full"><option value="present"${ssrIncludeBooleanAttr(Array.isArray(unref(mForm).status) ? ssrLooseContain(unref(mForm).status, "present") : ssrLooseEqual(unref(mForm).status, "present")) ? " selected" : ""}>Present</option><option value="late"${ssrIncludeBooleanAttr(Array.isArray(unref(mForm).status) ? ssrLooseContain(unref(mForm).status, "late") : ssrLooseEqual(unref(mForm).status, "late")) ? " selected" : ""}>Late</option><option value="half_day"${ssrIncludeBooleanAttr(Array.isArray(unref(mForm).status) ? ssrLooseContain(unref(mForm).status, "half_day") : ssrLooseEqual(unref(mForm).status, "half_day")) ? " selected" : ""}>Half Day</option><option value="absent"${ssrIncludeBooleanAttr(Array.isArray(unref(mForm).status) ? ssrLooseContain(unref(mForm).status, "absent") : ssrLooseEqual(unref(mForm).status, "absent")) ? " selected" : ""}>Absent</option></select></div><div><label class="label">Note</label><input${ssrRenderAttr("value", unref(mForm).note)} class="input-field w-full"></div><div class="flex justify-end gap-3 pt-2"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(mSaving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(mSaving) ? "Saving\u2026" : "Save Entry")}</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/attendance.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=attendance-DBNncqmY.mjs.map
