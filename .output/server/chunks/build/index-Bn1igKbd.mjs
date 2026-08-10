import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
import 'node:zlib';
import 'node:stream';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/dashboard",
      "$FHxkEqOxWe"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const d = computed(() => {
      var _a;
      return (_a = data.value) != null ? _a : {};
    });
    const todayLabel = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const attendanceDateLabel = computed(() => {
      var _a;
      const ad = (_a = d.value) == null ? void 0 : _a.attendance_date;
      if (!ad) return "";
      const adStr = typeof ad === "string" ? ad.slice(0, 10) : new Date(ad).toISOString().slice(0, 10);
      const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      if (adStr === todayStr) return "Today";
      return new Date(adStr).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    });
    const payrollSummary = computed(() => {
      var _a, _b;
      const raw = (_b = (_a = d.value) == null ? void 0 : _a.payroll_trend) != null ? _b : [];
      const map = /* @__PURE__ */ new Map();
      for (const r of raw) {
        const existing = map.get(r.month);
        if (!existing || Number(r.emp_count) > Number(existing.emp_count)) {
          map.set(r.month, r);
        }
      }
      return Array.from(map.values()).slice(0, 6);
    });
    function statusBadge(s) {
      const m = {
        present: "badge-green",
        absent: "badge-red",
        late: "badge-yellow",
        half_day: "badge-yellow",
        leave: "badge-blue",
        holiday: "badge-blue"
      };
      return m[s] || "badge-gray";
    }
    const quickLinks = [
      { label: "Employees", route: "/hr/employees", icon: "\u{1F465}" },
      { label: "Attendance", route: "/hr/attendance", icon: "\u{1F550}" },
      { label: "Leave", route: "/hr/leave-requests", icon: "\u{1F4CB}" },
      { label: "Salary", route: "/hr/salary-structure", icon: "\u{1F4CA}" },
      { label: "Payroll", route: "/hr/payroll", icon: "\u{1F4B0}" },
      { label: "Loans", route: "/hr/loans", icon: "\u{1F3E6}" },
      { label: "Advances", route: "/hr/advances", icon: "\u{1F4B8}" },
      { label: "Overtime", route: "/hr/overtime", icon: "\u23F1\uFE0F" },
      { label: "Bonuses", route: "/hr/bonuses", icon: "\u{1F381}" },
      { label: "Holidays", route: "/hr/holidays", icon: "\u{1F4C5}" },
      { label: "Biometric", route: "/hr/biometric", icon: "\u{1F512}" },
      { label: "Settings", route: "/hr/settings", icon: "\u2699\uFE0F" },
      { label: "Kiosk", route: "/kiosk", icon: "\u{1F916}" },
      { label: "Reports", route: "/hr/reports", icon: "\u{1F4C8}" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E;
      const _component_UiBackButton = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-6" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div><h1 class="text-2xl font-bold text-white">HR Dashboard</h1><p class="text-sm text-gray-400 mt-0.5">${ssrInterpolate(unref(todayLabel))}</p></div></div><div class="flex gap-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/hr/payroll",
        class: "btn-primary text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u{1F4B0} Run Payroll`);
          } else {
            return [
              createTextVNode("\u{1F4B0} Run Payroll")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/hr/attendance",
        class: "btn-secondary text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u{1F4CB} Attendance`);
          } else {
            return [
              createTextVNode("\u{1F4CB} Attendance")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 flex items-center gap-4"><div class="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl shrink-0">\u{1F465}</div><div><p class="text-2xl font-bold text-white">${ssrInterpolate((_b = (_a = unref(d).employees) == null ? void 0 : _a.total) != null ? _b : 0)}</p><p class="text-xs text-gray-400">Total Employees</p><p class="text-xs text-gray-600 mt-0.5">${ssrInterpolate((_d = (_c = unref(d).employees) == null ? void 0 : _c.active) != null ? _d : 0)} active \xB7 ${ssrInterpolate((_f = (_e = unref(d).employees) == null ? void 0 : _e.ex_count) != null ? _f : 0)} ex</p></div></div><div class="glass-card p-4 flex items-center gap-4"><div class="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center text-xl shrink-0">\u2705</div><div><p class="text-2xl font-bold text-white">${ssrInterpolate((_h = (_g = unref(d).attendance) == null ? void 0 : _g.present) != null ? _h : 0)}</p><p class="text-xs text-gray-400">Present</p><p class="text-xs text-gray-600 mt-0.5">${ssrInterpolate(unref(attendanceDateLabel))}</p></div></div><div class="glass-card p-4 flex items-center gap-4"><div class="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center text-xl shrink-0">\u274C</div><div><p class="text-2xl font-bold text-white">${ssrInterpolate((_j = (_i = unref(d).attendance) == null ? void 0 : _i.absent) != null ? _j : 0)}</p><p class="text-xs text-gray-400">Absent</p><p class="text-xs text-gray-600 mt-0.5">${ssrInterpolate((_l = (_k = unref(d).attendance) == null ? void 0 : _k.late) != null ? _l : 0)} late</p></div></div><div class="glass-card p-4 flex items-center gap-4"><div class="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl shrink-0">\u{1F3E6}</div><div><p class="text-2xl font-bold text-white">${ssrInterpolate((_n = (_m = unref(d).loans) == null ? void 0 : _m.active) != null ? _n : 0)}</p><p class="text-xs text-gray-400">Active Loans</p><p class="text-xs text-gray-600 mt-0.5">${ssrInterpolate((_p = (_o = unref(d).loans) == null ? void 0 : _o.total) != null ? _p : 0)} total</p></div></div></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="glass-card p-4 flex items-center gap-4"><div class="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl shrink-0">\u{1F4B0}</div><div><p class="text-2xl font-bold text-white">${ssrInterpolate((_r = (_q = unref(d).payroll) == null ? void 0 : _q.approved) != null ? _r : 0)}</p><p class="text-xs text-gray-400">Approved Payrolls</p><p class="text-xs text-gray-600 mt-0.5">${ssrInterpolate(unref(d).payroll_month)} \xB7 ${ssrInterpolate((_t = (_s = unref(d).payroll) == null ? void 0 : _s.paid) != null ? _t : 0)} paid</p></div></div><div class="glass-card p-4 flex items-center gap-4"><div class="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center text-xl shrink-0">\u23F3</div><div><p class="text-2xl font-bold text-white">${ssrInterpolate((_v = (_u = unref(d).payroll) == null ? void 0 : _u.pending) != null ? _v : 0)}</p><p class="text-xs text-gray-400">Pending Approval</p><p class="text-xs text-gray-600 mt-0.5">payrolls this month</p></div></div><div class="glass-card p-4 flex items-center gap-4"><div class="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl shrink-0">\u{1F4B8}</div><div><p class="text-2xl font-bold text-white">${ssrInterpolate((_x = (_w = unref(d).advances) == null ? void 0 : _w.approved) != null ? _x : 0)}</p><p class="text-xs text-gray-400">Approved Advances</p><p class="text-xs text-gray-600 mt-0.5">${ssrInterpolate((_z = (_y = unref(d).advances) == null ? void 0 : _y.pending) != null ? _z : 0)} pending</p></div></div><div class="glass-card p-4 flex items-center gap-4"><div class="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-xl shrink-0">\u{1F381}</div><div><p class="text-2xl font-bold text-white">${ssrInterpolate((_B = (_A = unref(d).holidays) == null ? void 0 : _A.upcoming) != null ? _B : 0)}</p><p class="text-xs text-gray-400">Upcoming Holidays</p><p class="text-xs text-gray-600 mt-0.5">next 30 days</p></div></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 glass-card p-5"><div class="flex items-center justify-between mb-4"><div><h2 class="font-semibold text-white">Attendance</h2><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(attendanceDateLabel))}</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/hr/attendance",
        class: "text-xs text-amber-400 hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`View all \u2192`);
          } else {
            return [
              createTextVNode("View all \u2192")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if ((_C = unref(d).recent_attendance) == null ? void 0 : _C.length) {
        _push(`<div class="space-y-1"><!--[-->`);
        ssrRenderList(unref(d).recent_attendance, (a) => {
          _push(`<div class="flex items-center justify-between text-sm py-2 border-b border-white/[0.04] last:border-0"><span class="text-gray-200 font-medium w-40 truncate">${ssrInterpolate(a.first_name)} ${ssrInterpolate(a.last_name)}</span><div class="flex items-center gap-3"><span class="text-gray-500 text-xs font-mono">${ssrInterpolate(a.clock_in ? a.clock_in.toString().slice(0, 5) : "--:--")} `);
          if (a.clock_out) {
            _push(`<span class="text-gray-600"> \u2192 ${ssrInterpolate(a.clock_out.toString().slice(0, 5))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span><span class="${ssrRenderClass([statusBadge(a.status), "text-xs capitalize"])}">${ssrInterpolate(a.status)}</span></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="text-gray-500 text-sm py-4 text-center">No attendance data for this date.</p>`);
      }
      _push(`</div><div class="space-y-5"><div class="glass-card p-5"><h2 class="font-semibold text-white mb-3">Active by Department</h2>`);
      if ((_D = unref(d).dept_breakdown) == null ? void 0 : _D.length) {
        _push(`<div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(d).dept_breakdown, (dep) => {
          var _a2;
          _push(`<div class="flex items-center gap-2"><div class="flex-1 text-xs text-gray-300 truncate">${ssrInterpolate(dep.dept)}</div><div class="text-xs font-bold text-amber-400 w-6 text-right">${ssrInterpolate(dep.cnt)}</div><div class="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden"><div class="h-full bg-amber-400 rounded-full" style="${ssrRenderStyle(`width:${Math.round(dep.cnt / (((_a2 = unref(d).employees) == null ? void 0 : _a2.active) || 1) * 100)}%`)}"></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="text-gray-500 text-xs">No department data.</p>`);
      }
      _push(`</div><div class="glass-card p-5"><div class="flex items-center justify-between mb-3"><h2 class="font-semibold text-white">Upcoming Leaves</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/hr/leave-requests",
        class: "text-xs text-amber-400 hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`View all \u2192`);
          } else {
            return [
              createTextVNode("View all \u2192")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if ((_E = unref(d).upcoming_leaves) == null ? void 0 : _E.length) {
        _push(`<div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(d).upcoming_leaves, (lv) => {
          _push(`<div class="text-xs py-1.5 border-b border-white/[0.04] last:border-0"><p class="text-gray-200 font-medium">${ssrInterpolate(lv.first_name)} ${ssrInterpolate(lv.last_name)}</p><p class="text-gray-500 mt-0.5">${ssrInterpolate(lv.start_date)} \u2192 ${ssrInterpolate(lv.end_date)} <span class="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">${ssrInterpolate(lv.leave_type)}</span></p></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="text-gray-500 text-xs">No upcoming approved leaves.</p>`);
      }
      _push(`</div></div></div>`);
      if (unref(payrollSummary).length) {
        _push(`<div class="glass-card p-5"><h2 class="font-semibold text-white mb-4">Payroll \u2014 Last 6 Months</h2><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th text-left">Month</th><th class="th text-right">Employees</th><th class="th text-right">Net Paid (\u09F3)</th><th class="th text-center">Status</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(payrollSummary), (p) => {
          _push(`<tr class="tr"><td class="td font-medium text-gray-200">${ssrInterpolate(p.month)}</td><td class="td text-right text-gray-400">${ssrInterpolate(p.emp_count)}</td><td class="td text-right text-amber-400 font-semibold">${ssrInterpolate(Number(p.total_net).toLocaleString())}</td><td class="td text-center"><span class="${ssrRenderClass([{
            "badge-green": p.status === "paid",
            "badge-blue": p.status === "approved",
            "badge-yellow": p.status === "pending_approval",
            "badge-red": p.status === "rejected"
          }, "text-xs capitalize"])}">${ssrInterpolate(p.status.replace("_", " "))}</span></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><h2 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h2><div class="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2"><!--[-->`);
      ssrRenderList(quickLinks, (link) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: link.route,
          to: link.route,
          class: "glass-card-hover flex flex-col items-center gap-1.5 rounded-xl p-3 text-center group"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-xl"${_scopeId}>${ssrInterpolate(link.icon)}</div><span class="text-[11px] font-medium text-gray-400 group-hover:text-white leading-tight"${_scopeId}>${ssrInterpolate(link.label)}</span>`);
            } else {
              return [
                createVNode("div", { class: "text-xl" }, toDisplayString(link.icon), 1),
                createVNode("span", { class: "text-[11px] font-medium text-gray-400 group-hover:text-white leading-tight" }, toDisplayString(link.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bn1igKbd.mjs.map
