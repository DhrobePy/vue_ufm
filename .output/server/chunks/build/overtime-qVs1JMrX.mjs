import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, ref, withAsyncContext, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "overtime",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const filterMonth = ref((/* @__PURE__ */ new Date()).toISOString().slice(0, 7));
    const filterStatus = ref("");
    const search = ref("");
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/overtime",
      {
        query: computed(() => ({ month: filterMonth.value, status: filterStatus.value || void 0 }))
      },
      "$beeRxowChs"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const records = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.records) != null ? _b : [];
    });
    const employees = ref([]);
    const { data: empData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/employees",
      "$C70IjOPXUw"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(empData, (v) => {
      var _a;
      employees.value = (_a = v == null ? void 0 : v.employees) != null ? _a : [];
    }, { immediate: true });
    const filtered = computed(() => {
      const q = search.value.toLowerCase();
      return records.value.filter(
        (r) => !q || `${r.first_name} ${r.last_name}`.toLowerCase().includes(q)
      );
    });
    const showAdd = ref(false);
    const saving = ref(false);
    const err = ref("");
    const form = ref({ employee_id: "", ot_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), ot_hours: 2, rate_type: "1.5x", reason: "" });
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    const statusBadge = (s) => ({
      pending: "badge-yellow",
      approved: "badge-green",
      paid: "badge-blue",
      rejected: "badge-red"
    })[s] || "badge-gray";
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBackButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div><h1 class="text-2xl font-bold text-white">Overtime</h1><p class="text-sm text-gray-400">Record &amp; approve overtime hours</p></div></div><button class="btn-primary">+ Add Overtime</button></div><div class="flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} placeholder="Search employee\u2026" class="input-field w-44 text-sm"><select class="input-field text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "") : ssrLooseEqual(unref(filterStatus), "")) ? " selected" : ""}>All Status</option><option value="pending"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "pending") : ssrLooseEqual(unref(filterStatus), "pending")) ? " selected" : ""}>Pending</option><option value="approved"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "approved") : ssrLooseEqual(unref(filterStatus), "approved")) ? " selected" : ""}>Approved</option><option value="paid"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "paid") : ssrLooseEqual(unref(filterStatus), "paid")) ? " selected" : ""}>Paid</option><option value="rejected"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "rejected") : ssrLooseEqual(unref(filterStatus), "rejected")) ? " selected" : ""}>Rejected</option></select><input${ssrRenderAttr("value", unref(filterMonth))} type="month" class="input-field text-sm"></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th">Date</th><th class="th text-right">Hours</th><th class="th">Rate</th><th class="th text-right">Amount</th><th class="th text-center">Status</th><th class="th text-right">Actions</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(filtered), (r) => {
        _push(`<tr class="tr"><td class="td text-gray-200 font-medium">${ssrInterpolate(r.first_name)} ${ssrInterpolate(r.last_name)}</td><td class="td text-gray-400">${ssrInterpolate(fmtDate(r.ot_date))}</td><td class="td text-right text-gray-300">${ssrInterpolate(r.ot_hours)}h</td><td class="td text-gray-400">${ssrInterpolate(r.rate_type)}</td><td class="td text-right font-semibold text-amber-400">\u09F3${ssrInterpolate(fmt(r.amount))}</td><td class="td text-center"><span class="${ssrRenderClass([statusBadge(r.status), "text-xs"])}">${ssrInterpolate(r.status)}</span></td><td class="td text-right"><div class="flex justify-end gap-1">`);
        if (r.status === "pending") {
          _push(`<button class="btn-xs badge-green text-xs px-2 py-0.5 rounded">\u2713</button>`);
        } else {
          _push(`<!---->`);
        }
        if (r.status === "pending") {
          _push(`<button class="btn-xs badge-red text-xs px-2 py-0.5 rounded">\u2717</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="btn-xs text-red-400">Del</button></div></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(filtered).length) {
        _push(`<tr><td colspan="7" class="td text-center text-gray-500 py-10">No overtime records found.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAdd)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-md"><h2 class="text-lg font-bold text-white mb-5">Record Overtime</h2><form class="space-y-4"><div><label class="label">Employee *</label><select required class="input-field w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).employee_id) ? ssrLooseContain(unref(form).employee_id, "") : ssrLooseEqual(unref(form).employee_id, "")) ? " selected" : ""}>Select employee</option><!--[-->`);
          ssrRenderList(unref(employees), (e) => {
            _push2(`<option${ssrRenderAttr("value", e.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).employee_id) ? ssrLooseContain(unref(form).employee_id, e.id) : ssrLooseEqual(unref(form).employee_id, e.id)) ? " selected" : ""}>${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Date *</label><input${ssrRenderAttr("value", unref(form).ot_date)} type="date" required class="input-field w-full"></div><div><label class="label">Hours *</label><input${ssrRenderAttr("value", unref(form).ot_hours)} type="number" min="0.5" max="24" step="0.5" required class="input-field w-full"></div></div><div><label class="label">Rate Type</label><select class="input-field w-full"><option value="1.5x"${ssrIncludeBooleanAttr(Array.isArray(unref(form).rate_type) ? ssrLooseContain(unref(form).rate_type, "1.5x") : ssrLooseEqual(unref(form).rate_type, "1.5x")) ? " selected" : ""}>1.5\xD7 (Normal OT)</option><option value="2x"${ssrIncludeBooleanAttr(Array.isArray(unref(form).rate_type) ? ssrLooseContain(unref(form).rate_type, "2x") : ssrLooseEqual(unref(form).rate_type, "2x")) ? " selected" : ""}>2\xD7 (Holiday OT)</option><option value="flat"${ssrIncludeBooleanAttr(Array.isArray(unref(form).rate_type) ? ssrLooseContain(unref(form).rate_type, "flat") : ssrLooseEqual(unref(form).rate_type, "flat")) ? " selected" : ""}>Flat</option></select></div><div><label class="label">Reason</label><input${ssrRenderAttr("value", unref(form).reason)} type="text" class="input-field w-full" placeholder="Optional reason"></div>`);
          if (unref(err)) {
            _push2(`<div class="text-red-400 text-sm rounded bg-red-500/10 p-2">${ssrInterpolate(unref(err))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-end gap-3 pt-1"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save")}</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/overtime.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=overtime-qVs1JMrX.mjs.map
