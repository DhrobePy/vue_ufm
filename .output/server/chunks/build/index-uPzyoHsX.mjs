import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrRenderComponent, ssrRenderTeleport } from 'vue/server-renderer';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/employees",
      "$2DxxeWJlhu"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const employees = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.employees) != null ? _b : [];
    });
    const departments = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.departments) != null ? _b : [];
    });
    const positions = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.positions) != null ? _b : [];
    });
    const search = ref("");
    const filterDept = ref("");
    const filterStatus = ref("");
    const filtered = computed(() => {
      return employees.value.filter((e) => {
        const q = search.value.toLowerCase();
        const matchSearch = !q || `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(q);
        const matchDept = !filterDept.value || e.department_id === filterDept.value;
        const matchStatus = !filterStatus.value || e.status === filterStatus.value;
        return matchSearch && matchDept && matchStatus;
      });
    });
    const filteredPositions = computed(
      () => positions.value.filter((p) => !selectedDept.value || p.department_id === Number(selectedDept.value))
    );
    const showModal = ref(false);
    const saving = ref(false);
    const editingId = ref(null);
    const selectedDept = ref("");
    const emptyForm = () => ({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      position_id: "",
      hire_date: "",
      base_salary: 0,
      status: "active"
    });
    const form = ref(emptyForm());
    const initials = (f, l) => {
      var _a, _b;
      return `${(_a = f[0]) != null ? _a : ""}${(_b = l[0]) != null ? _b : ""}`.toUpperCase();
    };
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    const statusClass = (s) => ({
      active: "badge-green",
      on_leave: "badge-yellow",
      terminated: "badge-red"
    })[s] || "badge-gray";
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div><h1 class="text-2xl font-bold text-white">Employees</h1><p class="text-sm text-gray-400 mt-0.5">${ssrInterpolate(unref(filtered).length)} of ${ssrInterpolate(unref(employees).length)} shown</p></div><button class="btn-primary flex items-center gap-2"><span class="text-lg leading-none">+</span> Add Employee </button></div><div class="flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} placeholder="Search name / email\u2026" class="input-field w-56 text-sm"><select class="input-field text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterDept)) ? ssrLooseContain(unref(filterDept), "") : ssrLooseEqual(unref(filterDept), "")) ? " selected" : ""}>All Departments</option><!--[-->`);
      ssrRenderList(unref(departments), (d) => {
        _push(`<option${ssrRenderAttr("value", d.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(filterDept)) ? ssrLooseContain(unref(filterDept), d.id) : ssrLooseEqual(unref(filterDept), d.id)) ? " selected" : ""}>${ssrInterpolate(d.name)}</option>`);
      });
      _push(`<!--]--></select><select class="input-field text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "") : ssrLooseEqual(unref(filterStatus), "")) ? " selected" : ""}>All Status</option><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "active") : ssrLooseEqual(unref(filterStatus), "active")) ? " selected" : ""}>Active</option><option value="on_leave"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "on_leave") : ssrLooseEqual(unref(filterStatus), "on_leave")) ? " selected" : ""}>On Leave</option><option value="terminated"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "terminated") : ssrLooseEqual(unref(filterStatus), "terminated")) ? " selected" : ""}>Terminated</option></select></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th">Department / Position</th><th class="th">Hire Date</th><th class="th text-right">Gross Salary</th><th class="th text-center">Status</th><th class="th text-right">Actions</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(filtered), (emp) => {
        _push(`<tr class="tr"><td class="td"><div class="flex items-center gap-3">`);
        if (emp.photo) {
          _push(`<img${ssrRenderAttr("src", emp.photo)} class="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10">`);
        } else {
          _push(`<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style="${ssrRenderStyle({ "background": "rgba(var(--accent-glow),0.15)", "color": "var(--accent-from)" })}">${ssrInterpolate(initials(emp.first_name, emp.last_name))}</div>`);
        }
        _push(`<div><p class="font-medium text-gray-200">${ssrInterpolate(emp.first_name)} ${ssrInterpolate(emp.last_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(emp.email)}</p></div></div></td><td class="td"><p class="text-gray-300">${ssrInterpolate(emp.position_name || "\u2014")}</p><p class="text-xs text-gray-500">${ssrInterpolate(emp.department_name || "\u2014")}</p></td><td class="td text-gray-400">${ssrInterpolate(fmtDate(emp.hire_date))}</td><td class="td text-right text-gray-200">\u09F3${ssrInterpolate(fmt(emp.base_salary))}</td><td class="td text-center"><span class="${ssrRenderClass([statusClass(emp.status), "badge"])}">${ssrInterpolate(emp.status)}</span></td><td class="td text-right"><div class="flex items-center justify-end gap-1">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/hr/employees/${emp.id}`,
          class: "btn-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F464} Profile`);
            } else {
              return [
                createTextVNode("\u{1F464} Profile")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`<button class="btn-xs">Edit</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/hr/salary-structure?emp=${emp.id}`,
          class: "btn-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Salary`);
            } else {
              return [
                createTextVNode("Salary")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(filtered).length) {
        _push(`<tr><td colspan="6" class="td text-center text-gray-500 py-10">No employees found.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showModal)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-2xl"><h2 class="text-lg font-bold text-white mb-5">${ssrInterpolate(unref(editingId) ? "Edit Employee" : "Add Employee")}</h2><form class="grid grid-cols-2 gap-4"><div><label class="label">First Name *</label><input${ssrRenderAttr("value", unref(form).first_name)} required class="input-field w-full"></div><div><label class="label">Last Name *</label><input${ssrRenderAttr("value", unref(form).last_name)} required class="input-field w-full"></div><div><label class="label">Email *</label><input${ssrRenderAttr("value", unref(form).email)} type="email" required class="input-field w-full"></div><div><label class="label">Phone</label><input${ssrRenderAttr("value", unref(form).phone)} class="input-field w-full"></div><div class="col-span-2"><label class="label">Address</label><textarea rows="2" class="input-field w-full resize-none">${ssrInterpolate(unref(form).address)}</textarea></div><div><label class="label">Department</label><select class="input-field w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(selectedDept)) ? ssrLooseContain(unref(selectedDept), "") : ssrLooseEqual(unref(selectedDept), "")) ? " selected" : ""}>Select department</option><!--[-->`);
          ssrRenderList(unref(departments), (d) => {
            _push2(`<option${ssrRenderAttr("value", d.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedDept)) ? ssrLooseContain(unref(selectedDept), d.id) : ssrLooseEqual(unref(selectedDept), d.id)) ? " selected" : ""}>${ssrInterpolate(d.name)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="label">Position</label><select class="input-field w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).position_id) ? ssrLooseContain(unref(form).position_id, "") : ssrLooseEqual(unref(form).position_id, "")) ? " selected" : ""}>Select position</option><!--[-->`);
          ssrRenderList(unref(filteredPositions), (p) => {
            _push2(`<option${ssrRenderAttr("value", p.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).position_id) ? ssrLooseContain(unref(form).position_id, p.id) : ssrLooseEqual(unref(form).position_id, p.id)) ? " selected" : ""}>${ssrInterpolate(p.name)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="label">Hire Date *</label><input${ssrRenderAttr("value", unref(form).hire_date)} type="date" required class="input-field w-full"></div><div><label class="label">Base Salary (\u09F3)</label><input${ssrRenderAttr("value", unref(form).base_salary)} type="number" min="0" step="0.01" class="input-field w-full"></div><div><label class="label">Status</label><select class="input-field w-full"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="on_leave"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "on_leave") : ssrLooseEqual(unref(form).status, "on_leave")) ? " selected" : ""}>On Leave</option><option value="terminated"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "terminated") : ssrLooseEqual(unref(form).status, "terminated")) ? " selected" : ""}>Terminated</option></select></div><div class="col-span-2 flex justify-end gap-3 pt-2"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(saving) ? "Saving\u2026" : unref(editingId) ? "Update" : "Create")}</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/employees/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-uPzyoHsX.mjs.map
