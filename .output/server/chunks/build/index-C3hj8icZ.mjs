import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const statusFilter = ref("");
    const cols = [
      { key: "full_name", label: "Employee", sortable: true },
      { key: "position", label: "Position", sortable: true },
      { key: "branch_name", label: "Branch", sortable: true },
      { key: "hire_date", label: "Join Date", sortable: true },
      { key: "base_salary", label: "Salary", sortable: true },
      { key: "status", label: "Status" }
    ];
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/employees",
      {
        query: computed(() => ({
          search: search.value,
          status: statusFilter.value
        }))
      },
      "$Wk32yiMSXS"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const employees = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.employees) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Employees",
        subtitle: "All staff members across all branches",
        breadcrumb: ["Admin", "Employees"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/admin/employees/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Add Employee`);
                } else {
                  return [
                    createTextVNode("+ Add Employee")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/admin/employees/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Add Employee")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Staff</p><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total) != null ? _a : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Active</p><p class="text-2xl font-bold text-gold-400">${ssrInterpolate((_b = unref(stats).active) != null ? _b : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Branches</p><p class="text-2xl font-bold text-blue-400">${ssrInterpolate((_c = unref(stats).branches) != null ? _c : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Monthly Payroll</p><p class="text-2xl font-bold text-emerald-400">\u09F3${ssrInterpolate(Number((_d = unref(stats).monthly_payroll) != null ? _d : 0).toLocaleString())}</p></div></div><div class="glass-card p-4 flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="input-glass flex-1 min-w-[200px] text-xs py-1.5" placeholder="Search employees\u2026"><select class="input-glass w-auto text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "") : ssrLooseEqual(unref(statusFilter), "")) ? " selected" : ""}>All Status</option><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "active") : ssrLooseEqual(unref(statusFilter), "active")) ? " selected" : ""}>Active</option><option value="on_leave"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "on_leave") : ssrLooseEqual(unref(statusFilter), "on_leave")) ? " selected" : ""}>On Leave</option><option value="terminated"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "terminated") : ssrLooseEqual(unref(statusFilter), "terminated")) ? " selected" : ""}>Terminated</option></select><button class="btn-ghost text-xs py-1.5">Reset</button></div><div class="glass-card p-5">`);
      if (unref(pending)) {
        _push(`<div class="py-8 text-center text-xs text-gray-500 animate-pulse">Loading employees\u2026</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(employees),
          "per-page": 15,
          "search-placeholder": ""
        }, {
          "cell-full_name": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<div class="flex items-center gap-2.5"${_scopeId}><div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, #f59e0b, #d97706)" })}"${_scopeId}>${ssrInterpolate((_a2 = row.full_name) == null ? void 0 : _a2.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase())}</div><div${_scopeId}><p class="text-xs font-semibold text-gray-200"${_scopeId}>${ssrInterpolate(row.full_name)}</p><p class="text-[11px] text-gray-600"${_scopeId}>${ssrInterpolate(row.phone)}</p></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-2.5" }, [
                  createVNode("div", {
                    class: "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0",
                    style: { "background": "linear-gradient(135deg, #f59e0b, #d97706)" }
                  }, toDisplayString((_b2 = row.full_name) == null ? void 0 : _b2.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()), 1),
                  createVNode("div", null, [
                    createVNode("p", { class: "text-xs font-semibold text-gray-200" }, toDisplayString(row.full_name), 1),
                    createVNode("p", { class: "text-[11px] text-gray-600" }, toDisplayString(row.phone), 1)
                  ])
                ])
              ];
            }
          }),
          "cell-base_salary": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gray-200"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gray-200" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex gap-1.5"${_scopeId}><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>View</button><button class="btn-ghost text-xs py-1 px-2"${_scopeId}>Edit</button></div>`);
            } else {
              return [
                createVNode("div", { class: "flex gap-1.5" }, [
                  createVNode("button", { class: "btn-ghost text-xs py-1 px-2" }, "View"),
                  createVNode("button", { class: "btn-ghost text-xs py-1 px-2" }, "Edit")
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/employees/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C3hj8icZ.mjs.map
