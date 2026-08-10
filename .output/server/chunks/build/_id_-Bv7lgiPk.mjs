import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, ref, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const empId = computed(() => parseInt(route.params.id));
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/hr/employees/${empId.value}`,
      "$l-FGs-kEZK"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const d = computed(() => {
      var _a;
      return (_a = data.value) != null ? _a : {};
    });
    const emp = computed(() => {
      var _a;
      return (_a = d.value.employee) != null ? _a : null;
    });
    const salaryStructure = computed(() => {
      var _a;
      return (_a = d.value.salary_structure) != null ? _a : null;
    });
    const payrolls = computed(() => {
      var _a;
      return (_a = d.value.payrolls) != null ? _a : [];
    });
    const attendance = computed(() => {
      var _a;
      return (_a = d.value.attendance) != null ? _a : [];
    });
    const attSummary = computed(() => {
      var _a;
      return (_a = d.value.att_summary) != null ? _a : {};
    });
    const loans = computed(() => {
      var _a;
      return (_a = d.value.loans) != null ? _a : [];
    });
    const loanInstallments = computed(() => {
      var _a;
      return (_a = d.value.loan_installments) != null ? _a : [];
    });
    const leaves = computed(() => {
      var _a;
      return (_a = d.value.leaves) != null ? _a : [];
    });
    const leaveSummary = computed(() => {
      var _a;
      return (_a = d.value.leave_summary) != null ? _a : [];
    });
    const documents = computed(() => {
      var _a;
      return (_a = d.value.documents) != null ? _a : [];
    });
    const assets = computed(() => {
      var _a;
      return (_a = d.value.assets) != null ? _a : [];
    });
    const positions = computed(() => {
      var _a;
      return (_a = d.value.positions) != null ? _a : [];
    });
    const branches = computed(() => {
      var _a;
      return (_a = d.value.branches) != null ? _a : [];
    });
    const holidays = computed(() => {
      var _a;
      return (_a = d.value.holidays) != null ? _a : [];
    });
    const siteSettings = computed(() => {
      var _a;
      return (_a = d.value.settings) != null ? _a : {};
    });
    const tab = ref("overview");
    const tabs = [
      { key: "overview", label: "Overview", icon: "\u{1F4CA}" },
      { key: "attendance", label: "Attendance", icon: "\u{1F550}" },
      { key: "payroll", label: "Payroll", icon: "\u{1F4B0}" },
      { key: "loans", label: "Loans", icon: "\u{1F3E6}" },
      { key: "leaves", label: "Leaves", icon: "\u{1F4CB}" },
      { key: "documents", label: "Documents", icon: "\u{1F4C1}" },
      { key: "assets", label: "Assets", icon: "\u{1F5A5}\uFE0F" }
    ];
    const initials = computed(() => {
      var _a, _b, _c, _d;
      if (!emp.value) return "?";
      return (((_b = (_a = emp.value.first_name) == null ? void 0 : _a[0]) != null ? _b : "") + ((_d = (_c = emp.value.last_name) == null ? void 0 : _c[0]) != null ? _d : "")).toUpperCase();
    });
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d2) => {
      if (!d2) return "\u2014";
      try {
        return new Date(d2).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      } catch {
        return d2;
      }
    };
    const fmtTime = (t) => {
      if (!t) return "";
      return t.toString().slice(0, 5);
    };
    const calcHours = (inn, out) => {
      try {
        const [ih, im] = inn.split(":").map(Number);
        const [oh, om] = out.split(":").map(Number);
        const mins = oh * 60 + om - (ih * 60 + im);
        if (mins <= 0) return "0h";
        const h = Math.floor(mins / 60), m = mins % 60;
        return `${h}h ${m > 0 ? m + "m" : ""}`.trim();
      } catch {
        return "";
      }
    };
    const ucfirst = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "";
    const daysDiff = (s, e) => {
      if (!s || !e) return 0;
      return Math.max(1, Math.round((new Date(e).getTime() - new Date(s).getTime()) / 864e5) + 1);
    };
    const loanPct = (loan) => {
      const total = parseFloat(loan.amount || 0);
      if (!total) return 0;
      return Math.min(100, Math.round(parseFloat(loan.paid_amount || 0) / total * 100));
    };
    const isExpired = (d2) => d2 && new Date(d2) < /* @__PURE__ */ new Date();
    const docEmoji = (type) => {
      if (!type) return "\u{1F4C4}";
      const t = type.toLowerCase();
      if (t.includes("pdf")) return "\u{1F4D5}";
      if (t.includes("jpg") || t.includes("png") || t.includes("jpeg") || t.includes("img")) return "\u{1F5BC}\uFE0F";
      if (t.includes("doc")) return "\u{1F4DD}";
      return "\u{1F4C4}";
    };
    function statusBadge(s) {
      const m = { active: "badge-green", on_leave: "badge-yellow", terminated: "badge-red", inactive: "badge-gray" };
      return m[s] || "badge-gray";
    }
    function payStatusBadge(s) {
      const m = { paid: "badge-green", approved: "badge-blue", pending_approval: "badge-yellow", rejected: "badge-red" };
      return m[s] || "badge-gray";
    }
    function leaveStatusBadge(s) {
      const m = { approved: "badge-green", pending: "badge-yellow", rejected: "badge-red" };
      return m[s] || "badge-gray";
    }
    ref(null);
    const photoPreview = ref("");
    const photoUploading = ref(false);
    const toastMsg = ref("");
    const toastType = ref("success");
    const saving = ref(false);
    const today = /* @__PURE__ */ new Date();
    const calYear = ref(today.getFullYear());
    const calMonth = ref(today.getMonth());
    const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const calMonthLabel = computed(
      () => new Date(calYear.value, calMonth.value, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    );
    const attByDate = computed(() => {
      const m = {};
      attendance.value.forEach((r) => {
        var _a, _b, _c;
        m[(_c = (_b = (_a = r.date) == null ? void 0 : _a.slice) == null ? void 0 : _b.call(_a, 0, 10)) != null ? _c : r.date] = r;
      });
      return m;
    });
    const holidayByDate = computed(() => {
      const m = {};
      holidays.value.forEach((h) => {
        var _a, _b, _c;
        m[(_c = (_b = (_a = h.holiday_date) == null ? void 0 : _a.slice) == null ? void 0 : _b.call(_a, 0, 10)) != null ? _c : h.holiday_date] = h;
      });
      return m;
    });
    const dayOffNums = computed(() => {
      const raw = siteSettings.value.weekly_off || "friday";
      const map = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      return raw.split(",").map((x) => map[x.trim().toLowerCase()]).filter((n) => n !== void 0);
    });
    const calLeadingBlanks = computed(
      () => new Date(calYear.value, calMonth.value, 1).getDay()
    );
    const calDays = computed(() => {
      var _a, _b;
      const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate();
      const todayStr = today.toISOString().slice(0, 10);
      const days = [];
      for (let d2 = 1; d2 <= daysInMonth; d2++) {
        const dateStr = `${calYear.value}-${String(calMonth.value + 1).padStart(2, "0")}-${String(d2).padStart(2, "0")}`;
        const dow = new Date(calYear.value, calMonth.value, d2).getDay();
        const holiday = holidayByDate.value[dateStr];
        days.push({
          d: d2,
          date: dateStr,
          dow,
          isDayOff: dayOffNums.value.includes(dow),
          isHoliday: !!holiday,
          holidayName: (_a = holiday == null ? void 0 : holiday.holiday_name) != null ? _a : "",
          isToday: dateStr === todayStr,
          isFuture: dateStr > todayStr,
          att: (_b = attByDate.value[dateStr]) != null ? _b : null
        });
      }
      return days;
    });
    const calMonthlySummary = computed(() => {
      const s = { present: 0, absent: 0, late: 0, on_leave: 0, holiday: 0, dayoff: 0 };
      calDays.value.forEach((d2) => {
        var _a, _b, _c, _d;
        if (d2.isHoliday) s.holiday++;
        else if (d2.isDayOff) s.dayoff++;
        else if (((_a = d2.att) == null ? void 0 : _a.status) === "present") s.present++;
        else if (((_b = d2.att) == null ? void 0 : _b.status) === "absent") s.absent++;
        else if (((_c = d2.att) == null ? void 0 : _c.status) === "late") s.late++;
        else if (((_d = d2.att) == null ? void 0 : _d.status) === "on_leave") s.on_leave++;
      });
      return s;
    });
    const calEditDay = ref(null);
    const attEditForm = reactive({ status: "present", clock_in: "09:00", clock_out: "17:00" });
    const attStatuses = [
      { val: "present", label: "Present", cls: "bg-green-600/30 text-green-300 border border-green-500/40" },
      { val: "absent", label: "Absent", cls: "bg-red-600/30 text-red-300 border border-red-500/40" },
      { val: "late", label: "Late", cls: "bg-amber-600/30 text-amber-300 border border-amber-500/40" },
      { val: "on_leave", label: "On Leave", cls: "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40" }
    ];
    function calCellTitle(day) {
      const parts = [];
      if (day.isHoliday) parts.push("Holiday: " + day.holidayName);
      if (day.isDayOff) parts.push("Day Off");
      if (day.att) parts.push(ucfirst(day.att.status));
      if (!day.isFuture && !day.att && !day.isHoliday) parts.push("Click to mark attendance");
      return parts.join(" \xB7 ");
    }
    const showEditEmp = ref(false);
    const ef = reactive({});
    const showSalary = ref(false);
    const sf = reactive({ basic_salary: 0, house_allowance: 0, transport_allowance: 0, medical_allowance: 0, other_allowances: 0, provident_fund: 0, tax_deduction: 0, other_deductions: 0 });
    const sfGross = computed(() => (sf.basic_salary || 0) + (sf.house_allowance || 0) + (sf.transport_allowance || 0) + (sf.medical_allowance || 0) + (sf.other_allowances || 0));
    const sfNet = computed(() => sfGross.value - (sf.provident_fund || 0) - (sf.tax_deduction || 0) - (sf.other_deductions || 0));
    const showPayroll = ref(false);
    const payForm = reactive({ pay_period_start: "", pay_period_end: "", gross_salary: 0, deductions: 0, status: "paid" });
    const newLoan = reactive({ amount: 0, installments: 12, installment_type: "monthly", loan_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) });
    const showLeave = ref(false);
    const leaveForm = reactive({ leave_type: "annual", start_date: "", end_date: "", reason: "", status: "approved" });
    const showDoc = ref(false);
    const docForm = reactive({ name: "", category: "general", file_type: "", file_path: "", expiry_date: "", notes: "" });
    const showAsset = ref(false);
    const availableAssets = ref([]);
    const assetForm = reactive({ asset_id: "", assigned_on: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), due_date: "", condition_in: "good", notes: "" });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))} data-v-89f761b7>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-20 text-center text-gray-400" data-v-89f761b7>Loading profile\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-10 text-center text-red-400" data-v-89f761b7> Failed to load employee profile. </div>`);
      } else if (unref(emp)) {
        _push(`<!--[--><div class="glass-card p-6" data-v-89f761b7><div class="flex items-center gap-3 mb-5" data-v-89f761b7>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/hr/employees",
          class: "btn-secondary text-xs flex items-center gap-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u2190 Back `);
            } else {
              return [
                createTextVNode(" \u2190 Back ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="flex flex-wrap items-start gap-5" data-v-89f761b7><div class="shrink-0 relative group cursor-pointer" title="Click to change photo" data-v-89f761b7>`);
        if (unref(photoPreview) || unref(emp).photo) {
          _push(`<img${ssrRenderAttr("src", unref(photoPreview) || unref(emp).photo)} class="w-20 h-20 rounded-full object-cover border-2 border-amber-500/50" data-v-89f761b7>`);
        } else {
          _push(`<div class="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-amber-400" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.15)" })}" data-v-89f761b7>${ssrInterpolate(unref(initials))}</div>`);
        }
        _push(`<div class="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" data-v-89f761b7>`);
        if (!unref(photoUploading)) {
          _push(`<span class="text-white text-xs font-medium" data-v-89f761b7>\u{1F4F7}</span>`);
        } else {
          _push(`<span class="text-white text-xs" data-v-89f761b7>\u2026</span>`);
        }
        _push(`</div><input type="file" accept="image/*" class="hidden" data-v-89f761b7></div><div class="flex-1 min-w-0" data-v-89f761b7><h2 class="text-2xl font-bold text-white" data-v-89f761b7>${ssrInterpolate(unref(emp).first_name)} ${ssrInterpolate(unref(emp).last_name)}</h2><div class="flex flex-wrap gap-4 mt-1.5 text-sm text-gray-400" data-v-89f761b7><span data-v-89f761b7>\u{1F4BC} ${ssrInterpolate(unref(emp).position_name || "\u2014")}</span><span data-v-89f761b7>\u{1F3E2} ${ssrInterpolate(unref(emp).department_name || "\u2014")}</span><span data-v-89f761b7>\u{1F4CD} ${ssrInterpolate(unref(emp).branch_name || "\u2014")}</span><span data-v-89f761b7>\u{1F4C5} Joined ${ssrInterpolate(fmtDate(unref(emp).hire_date))}</span></div><div class="mt-2" data-v-89f761b7><span class="${ssrRenderClass([statusBadge(unref(emp).status), "text-xs capitalize"])}" data-v-89f761b7>${ssrInterpolate(unref(emp).status)}</span></div></div><div class="flex gap-3 flex-wrap" data-v-89f761b7><div class="text-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]" data-v-89f761b7><div class="text-xl font-bold text-amber-400" data-v-89f761b7>${ssrInterpolate((_a = unref(attSummary).present) != null ? _a : 0)}</div><div class="text-xs text-gray-500 mt-0.5" data-v-89f761b7>Present</div></div><div class="text-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]" data-v-89f761b7><div class="text-xl font-bold text-red-400" data-v-89f761b7>${ssrInterpolate((_b = unref(attSummary).absent) != null ? _b : 0)}</div><div class="text-xs text-gray-500 mt-0.5" data-v-89f761b7>Absent</div></div><div class="text-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]" data-v-89f761b7><div class="text-xl font-bold text-blue-400" data-v-89f761b7>${ssrInterpolate(unref(leaves).length)}</div><div class="text-xs text-gray-500 mt-0.5" data-v-89f761b7>Leaves</div></div><div class="text-center px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]" data-v-89f761b7><div class="text-xl font-bold text-purple-400" data-v-89f761b7>${ssrInterpolate(unref(loans).length)}</div><div class="text-xs text-gray-500 mt-0.5" data-v-89f761b7>Loans</div></div></div><button class="btn-primary text-sm shrink-0" data-v-89f761b7>\u270F\uFE0F Edit Profile</button></div></div><div class="glass-card p-2 flex gap-1 overflow-x-auto" data-v-89f761b7><!--[-->`);
        ssrRenderList(tabs, (t) => {
          _push(`<button class="${ssrRenderClass([unref(tab) === t.key ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-gray-400 hover:text-white hover:bg-white/[0.04]", "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"])}" data-v-89f761b7>${ssrInterpolate(t.icon)} ${ssrInterpolate(t.label)}</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(tab) === "overview") {
          _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-5" data-v-89f761b7><div class="glass-card p-5" data-v-89f761b7><h3 class="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]" data-v-89f761b7>\u{1F464} Personal Information</h3><dl class="info-grid" data-v-89f761b7><dt data-v-89f761b7>Full Name</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).first_name)} ${ssrInterpolate(unref(emp).last_name)}</dd><dt data-v-89f761b7>Email</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).email || "\u2014")}</dd><dt data-v-89f761b7>Phone</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).phone || "\u2014")}</dd><dt data-v-89f761b7>Address</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).address || "\u2014")}</dd><dt data-v-89f761b7>NID</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).nid || "\u2014")}</dd><dt data-v-89f761b7>Date of Birth</dt><dd data-v-89f761b7>${ssrInterpolate(fmtDate(unref(emp).dob))}</dd><dt data-v-89f761b7>Gender</dt><dd class="capitalize" data-v-89f761b7>${ssrInterpolate(unref(emp).gender || "\u2014")}</dd><dt data-v-89f761b7>Blood Group</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).blood_group || "\u2014")}</dd><dt data-v-89f761b7>Emergency Contact</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).emergency_contact || "\u2014")}</dd></dl></div><div class="glass-card p-5" data-v-89f761b7><h3 class="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]" data-v-89f761b7>\u{1F3F7}\uFE0F Employment Details</h3><dl class="info-grid" data-v-89f761b7><dt data-v-89f761b7>Employee ID</dt><dd data-v-89f761b7>#${ssrInterpolate(unref(emp).id)}</dd><dt data-v-89f761b7>Position</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).position_name || "\u2014")}</dd><dt data-v-89f761b7>Department</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).department_name || "\u2014")}</dd><dt data-v-89f761b7>Branch</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).branch_name || "\u2014")}</dd><dt data-v-89f761b7>Hire Date</dt><dd data-v-89f761b7>${ssrInterpolate(fmtDate(unref(emp).hire_date))}</dd><dt data-v-89f761b7>Base Salary</dt><dd data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(emp).base_salary))}</dd><dt data-v-89f761b7>Status</dt><dd data-v-89f761b7><span class="${ssrRenderClass([statusBadge(unref(emp).status), "text-xs capitalize"])}" data-v-89f761b7>${ssrInterpolate(unref(emp).status)}</span></dd></dl></div><div class="glass-card p-5" data-v-89f761b7><h3 class="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]" data-v-89f761b7>\u{1F3E6} Bank Details</h3><dl class="info-grid" data-v-89f761b7><dt data-v-89f761b7>Bank Name</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).bank_name || "\u2014")}</dd><dt data-v-89f761b7>Account No.</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).bank_account || "\u2014")}</dd><dt data-v-89f761b7>Bank Branch</dt><dd data-v-89f761b7>${ssrInterpolate(unref(emp).bank_branch || "\u2014")}</dd></dl></div><div class="glass-card p-5" data-v-89f761b7><div class="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]" data-v-89f761b7><h3 class="font-semibold text-white" data-v-89f761b7>\u{1F4B0} Salary Structure</h3><button class="btn-xs" data-v-89f761b7>${ssrInterpolate(unref(salaryStructure) ? "Edit" : "Set Up")}</button></div>`);
          if (unref(salaryStructure)) {
            _push(`<div class="space-y-1.5" data-v-89f761b7><div class="sal-row earn" data-v-89f761b7><span data-v-89f761b7>Basic Salary</span><span data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).basic_salary))}</span></div><div class="sal-row earn" data-v-89f761b7><span data-v-89f761b7>House Allowance</span><span data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).house_allowance))}</span></div><div class="sal-row earn" data-v-89f761b7><span data-v-89f761b7>Transport Allowance</span><span data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).transport_allowance))}</span></div><div class="sal-row earn" data-v-89f761b7><span data-v-89f761b7>Medical Allowance</span><span data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).medical_allowance))}</span></div><div class="sal-row earn" data-v-89f761b7><span data-v-89f761b7>Other Allowances</span><span data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).other_allowances))}</span></div><div class="sal-row total mt-1" data-v-89f761b7><span data-v-89f761b7>Gross Salary</span><span data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).gross_salary))}</span></div><div class="sal-row ded" data-v-89f761b7><span data-v-89f761b7>Provident Fund</span><span data-v-89f761b7>-\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).provident_fund))}</span></div><div class="sal-row ded" data-v-89f761b7><span data-v-89f761b7>Tax Deduction</span><span data-v-89f761b7>-\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).tax_deduction))}</span></div><div class="sal-row ded" data-v-89f761b7><span data-v-89f761b7>Other Deductions</span><span data-v-89f761b7>-\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).other_deductions))}</span></div><div class="sal-row net mt-1" data-v-89f761b7><span data-v-89f761b7>Net Salary</span><span data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(salaryStructure).net_salary))}</span></div></div>`);
          } else {
            _push(`<p class="text-gray-500 text-sm py-4 text-center" data-v-89f761b7>No salary structure set up yet.</p>`);
          }
          _push(`</div><div class="glass-card p-5 lg:col-span-2" data-v-89f761b7><h3 class="font-semibold text-white mb-4 pb-3 border-b border-white/[0.06]" data-v-89f761b7>\u{1F4CB} Leave Summary</h3>`);
          if (unref(leaveSummary).length) {
            _push(`<div class="overflow-x-auto" data-v-89f761b7><table class="w-full text-sm" data-v-89f761b7><thead data-v-89f761b7><tr class="border-b border-white/[0.06]" data-v-89f761b7><th class="th text-left" data-v-89f761b7>Leave Type</th><th class="th text-left" data-v-89f761b7>Status</th><th class="th text-right" data-v-89f761b7>Count</th><th class="th text-right" data-v-89f761b7>Days</th></tr></thead><tbody data-v-89f761b7><!--[-->`);
            ssrRenderList(unref(leaveSummary), (r) => {
              _push(`<tr class="tr" data-v-89f761b7><td class="td capitalize" data-v-89f761b7>${ssrInterpolate(ucfirst(r.leave_type))}</td><td class="td" data-v-89f761b7><span class="${ssrRenderClass([leaveStatusBadge(r.status), "text-xs capitalize"])}" data-v-89f761b7>${ssrInterpolate(r.status)}</span></td><td class="td text-right text-gray-300" data-v-89f761b7>${ssrInterpolate(r.cnt)}</td><td class="td text-right text-gray-300" data-v-89f761b7>${ssrInterpolate(r.days)}</td></tr>`);
            });
            _push(`<!--]--></tbody></table></div>`);
          } else {
            _push(`<p class="text-gray-500 text-sm py-4 text-center" data-v-89f761b7>No leave records.</p>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tab) === "attendance") {
          _push(`<div class="space-y-4" data-v-89f761b7><div class="glass-card p-5" data-v-89f761b7><div class="flex items-center gap-3 mb-4" data-v-89f761b7><button class="btn-xs" data-v-89f761b7>\u2039</button><span class="text-white font-semibold text-lg flex-1 text-center" data-v-89f761b7>${ssrInterpolate(unref(calMonthLabel))}</span><button class="btn-xs" data-v-89f761b7>\u203A</button><button class="btn-xs text-xs" data-v-89f761b7>Today</button></div><div class="flex flex-wrap gap-2 mb-4" data-v-89f761b7><span class="cal-chip cal-chip-green" data-v-89f761b7>\u2705 Present <b data-v-89f761b7>${ssrInterpolate(unref(calMonthlySummary).present)}</b></span><span class="cal-chip cal-chip-red" data-v-89f761b7>\u274C Absent <b data-v-89f761b7>${ssrInterpolate(unref(calMonthlySummary).absent)}</b></span><span class="cal-chip cal-chip-amber" data-v-89f761b7>\u23F0 Late <b data-v-89f761b7>${ssrInterpolate(unref(calMonthlySummary).late)}</b></span><span class="cal-chip cal-chip-indigo" data-v-89f761b7>\u{1F4CB} On Leave <b data-v-89f761b7>${ssrInterpolate(unref(calMonthlySummary).on_leave)}</b></span><span class="cal-chip cal-chip-teal" data-v-89f761b7>\u{1F389} Holiday <b data-v-89f761b7>${ssrInterpolate(unref(calMonthlySummary).holiday)}</b></span><span class="cal-chip cal-chip-gray" data-v-89f761b7>\u{1F5D3}\uFE0F Day Off <b data-v-89f761b7>${ssrInterpolate(unref(calMonthlySummary).dayoff)}</b></span></div><div class="flex flex-wrap gap-3 text-xs" data-v-89f761b7><span class="flex items-center gap-1" data-v-89f761b7><span class="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500/50 inline-block" data-v-89f761b7></span> Present</span><span class="flex items-center gap-1" data-v-89f761b7><span class="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500/50 inline-block" data-v-89f761b7></span> Absent</span><span class="flex items-center gap-1" data-v-89f761b7><span class="w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-500/50 inline-block" data-v-89f761b7></span> Late</span><span class="flex items-center gap-1" data-v-89f761b7><span class="w-3 h-3 rounded-sm bg-indigo-500/30 border border-indigo-500/50 inline-block" data-v-89f761b7></span> On Leave</span><span class="flex items-center gap-1" data-v-89f761b7><span class="w-3 h-3 rounded-sm bg-teal-500/30 border border-teal-500/50 inline-block" data-v-89f761b7></span> Holiday</span><span class="flex items-center gap-1" data-v-89f761b7><span class="w-3 h-3 rounded-sm bg-white/[0.06] border border-white/[0.08] inline-block" data-v-89f761b7></span> Day Off</span></div></div><div class="glass-card p-5" data-v-89f761b7><div class="cal-grid" data-v-89f761b7><!--[-->`);
          ssrRenderList(dayHeaders, (d2) => {
            _push(`<div class="cal-dow" data-v-89f761b7>${ssrInterpolate(d2)}</div>`);
          });
          _push(`<!--]--><!--[-->`);
          ssrRenderList(unref(calLeadingBlanks), (n) => {
            _push(`<div class="cal-cell" data-v-89f761b7></div>`);
          });
          _push(`<!--]--><!--[-->`);
          ssrRenderList(unref(calDays), (day) => {
            var _a2, _b2, _c, _d;
            _push(`<div class="${ssrRenderClass([[
              day.isToday ? "ring-2 ring-amber-400" : "",
              day.isHoliday ? "cal-holiday" : "",
              day.isDayOff && !day.isHoliday ? "cal-dayoff" : "",
              day.isFuture ? "opacity-30 cursor-default" : "",
              ((_a2 = day.att) == null ? void 0 : _a2.status) === "present" ? "cal-present" : "",
              ((_b2 = day.att) == null ? void 0 : _b2.status) === "absent" ? "cal-absent" : "",
              ((_c = day.att) == null ? void 0 : _c.status) === "late" ? "cal-late" : "",
              ((_d = day.att) == null ? void 0 : _d.status) === "on_leave" ? "cal-on-leave" : ""
            ], "cal-cell cursor-pointer"])}"${ssrRenderAttr("title", calCellTitle(day))} data-v-89f761b7><div class="cal-day-num" data-v-89f761b7>${ssrInterpolate(day.d)}</div>`);
            if (day.isHoliday) {
              _push(`<div class="cal-holiday-name" data-v-89f761b7>${ssrInterpolate(day.holidayName)}</div>`);
            } else {
              _push(`<!---->`);
            }
            if (day.att) {
              _push(`<!--[-->`);
              if (day.att.clock_in) {
                _push(`<div class="cal-time" data-v-89f761b7>${ssrInterpolate(fmtTime(day.att.clock_in))}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            } else if (day.isDayOff && !day.isHoliday) {
              _push(`<div class="cal-label-small" data-v-89f761b7>Off</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
          ssrRenderTeleport(_push, (_push2) => {
            if (unref(calEditDay)) {
              _push2(`<div class="modal-overlay" data-v-89f761b7><div class="modal-box max-w-sm" data-v-89f761b7><div class="flex items-center justify-between mb-4" data-v-89f761b7><div data-v-89f761b7><div class="font-semibold text-white" data-v-89f761b7>${ssrInterpolate(fmtDate(unref(calEditDay).date))}</div>`);
              if (unref(calEditDay).isHoliday) {
                _push2(`<div class="text-xs text-teal-400 mt-0.5" data-v-89f761b7> \u{1F389} ${ssrInterpolate(unref(calEditDay).holidayName)}</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><button class="text-gray-400 hover:text-white text-xl leading-none" data-v-89f761b7>\xD7</button></div><div class="flex flex-wrap gap-2 mb-4" data-v-89f761b7><!--[-->`);
              ssrRenderList(attStatuses, (s) => {
                _push2(`<button class="${ssrRenderClass([[s.cls, unref(attEditForm).status === s.val ? "ring-2 ring-white" : "opacity-70"], "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"])}" data-v-89f761b7>${ssrInterpolate(s.label)}</button>`);
              });
              _push2(`<!--]--><button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-900/30 text-red-400 border border-red-500/30" data-v-89f761b7>\u{1F5D1} Clear</button></div>`);
              if (unref(attEditForm).status !== "absent") {
                _push2(`<div class="grid grid-cols-2 gap-3 mb-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Clock In</label><input${ssrRenderAttr("value", unref(attEditForm).clock_in)} type="time" class="input-field w-full text-sm" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Clock Out</label><input${ssrRenderAttr("value", unref(attEditForm).clock_out)} type="time" class="input-field w-full text-sm" data-v-89f761b7></div></div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(attEditForm).clock_in && unref(attEditForm).clock_out && unref(attEditForm).status !== "absent") {
                _push2(`<div class="text-xs text-gray-400 mb-4" data-v-89f761b7> \u23F1 ${ssrInterpolate(calcHours(unref(attEditForm).clock_in, unref(attEditForm).clock_out))} worked </div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="flex justify-end gap-3" data-v-89f761b7><button class="btn-secondary text-sm" data-v-89f761b7>Cancel</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary text-sm" data-v-89f761b7>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save")}</button></div></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          }, "body", false, _parent);
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tab) === "payroll") {
          _push(`<div class="glass-card p-5" data-v-89f761b7><div class="flex items-center justify-between mb-4" data-v-89f761b7><h3 class="font-semibold text-white" data-v-89f761b7>\u{1F4B0} Payroll History</h3><button class="btn-primary text-sm" data-v-89f761b7>+ Add Record</button></div><div class="overflow-x-auto" data-v-89f761b7><table class="w-full text-sm" data-v-89f761b7><thead data-v-89f761b7><tr class="border-b border-white/[0.06]" data-v-89f761b7><th class="th" data-v-89f761b7>Period</th><th class="th text-right" data-v-89f761b7>Gross</th><th class="th text-right" data-v-89f761b7>Deductions</th><th class="th text-right" data-v-89f761b7>Net Pay</th><th class="th text-center" data-v-89f761b7>Status</th></tr></thead><tbody data-v-89f761b7><!--[-->`);
          ssrRenderList(unref(payrolls), (p) => {
            var _a2, _b2, _c;
            _push(`<tr class="tr" data-v-89f761b7><td class="td text-gray-300" data-v-89f761b7>${ssrInterpolate((_b2 = (_a2 = p.pay_period_start) == null ? void 0 : _a2.slice(0, 7)) != null ? _b2 : "\u2014")}</td><td class="td text-right text-gray-400" data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(p.gross_salary))}</td><td class="td text-right text-gray-400" data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(p.deductions))}</td><td class="td text-right font-semibold text-amber-400" data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(p.net_salary))}</td><td class="td text-center" data-v-89f761b7><span class="${ssrRenderClass([payStatusBadge(p.status), "text-xs capitalize"])}" data-v-89f761b7>${ssrInterpolate((_c = p.status) == null ? void 0 : _c.replace("_", " "))}</span></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(payrolls).length) {
            _push(`<tr data-v-89f761b7><td colspan="5" class="td text-center text-gray-500 py-10" data-v-89f761b7>No payroll records.</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tab) === "loans") {
          _push(`<div class="space-y-5" data-v-89f761b7><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-v-89f761b7><!--[-->`);
          ssrRenderList(unref(loans), (loan) => {
            _push(`<div class="glass-card p-5" data-v-89f761b7><div class="flex items-start justify-between mb-3" data-v-89f761b7><div data-v-89f761b7><div class="text-2xl font-bold text-amber-400" data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(loan.amount))}</div><div class="text-xs text-gray-500 mt-0.5" data-v-89f761b7>${ssrInterpolate(loan.installments)} installments \xB7 ${ssrInterpolate(loan.installment_type)}</div></div><span class="${ssrRenderClass([loan.status === "active" ? "badge-yellow" : "badge-green", "text-xs capitalize"])}" data-v-89f761b7>${ssrInterpolate(loan.status)}</span></div><div class="mb-3" data-v-89f761b7><div class="h-2 bg-white/[0.06] rounded-full overflow-hidden" data-v-89f761b7><div class="h-full bg-amber-400 rounded-full transition-all" style="${ssrRenderStyle(`width:${loanPct(loan)}%`)}" data-v-89f761b7></div></div><div class="flex justify-between text-xs text-gray-500 mt-1" data-v-89f761b7><span data-v-89f761b7>Paid: \u09F3 ${ssrInterpolate(fmt(loan.paid_amount))}</span><span data-v-89f761b7>Remaining: \u09F3 ${ssrInterpolate(fmt(loan.remaining_amount))}</span></div></div><div class="text-xs text-gray-500 mb-3" data-v-89f761b7>Issued: ${ssrInterpolate(fmtDate(loan.loan_date))}</div>`);
            if (loan.status === "active") {
              _push(`<button class="btn-secondary text-xs w-full" data-v-89f761b7>Mark Settled</button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]-->`);
          if (!unref(loans).length) {
            _push(`<div class="glass-card p-10 text-center text-gray-500" data-v-89f761b7> No loans on record. </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="glass-card p-5" data-v-89f761b7><h3 class="font-semibold text-white mb-4" data-v-89f761b7>\u{1F195} Issue New Loan</h3><div class="grid grid-cols-2 md:grid-cols-4 gap-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Amount (\u09F3)</label><input${ssrRenderAttr("value", unref(newLoan).amount)} type="number" min="0" class="input-field w-full" placeholder="50000" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Installments</label><input${ssrRenderAttr("value", unref(newLoan).installments)} type="number" min="1" class="input-field w-full" placeholder="12" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Type</label><select class="input-field w-full" data-v-89f761b7><option value="monthly" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(newLoan).installment_type) ? ssrLooseContain(unref(newLoan).installment_type, "monthly") : ssrLooseEqual(unref(newLoan).installment_type, "monthly")) ? " selected" : ""}>Monthly</option><option value="weekly" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(newLoan).installment_type) ? ssrLooseContain(unref(newLoan).installment_type, "weekly") : ssrLooseEqual(unref(newLoan).installment_type, "weekly")) ? " selected" : ""}>Weekly</option><option value="bi_weekly" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(newLoan).installment_type) ? ssrLooseContain(unref(newLoan).installment_type, "bi_weekly") : ssrLooseEqual(unref(newLoan).installment_type, "bi_weekly")) ? " selected" : ""}>Bi-Weekly</option></select></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Loan Date</label><input${ssrRenderAttr("value", unref(newLoan).loan_date)} type="date" class="input-field w-full" data-v-89f761b7></div></div><div class="mt-4" data-v-89f761b7><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary text-sm" data-v-89f761b7>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Issue Loan")}</button></div></div>`);
          if (unref(loanInstallments).length) {
            _push(`<div class="glass-card p-5" data-v-89f761b7><h3 class="font-semibold text-white mb-4" data-v-89f761b7>\u{1F4C3} Repayment History</h3><div class="overflow-x-auto" data-v-89f761b7><table class="w-full text-sm" data-v-89f761b7><thead data-v-89f761b7><tr class="border-b border-white/[0.06]" data-v-89f761b7><th class="th" data-v-89f761b7>Payment Date</th><th class="th text-right" data-v-89f761b7>Amount</th><th class="th text-center" data-v-89f761b7>Status</th><th class="th" data-v-89f761b7>Payroll Period</th></tr></thead><tbody data-v-89f761b7><!--[-->`);
            ssrRenderList(unref(loanInstallments), (i) => {
              var _a2, _b2;
              _push(`<tr class="tr" data-v-89f761b7><td class="td text-gray-300" data-v-89f761b7>${ssrInterpolate(fmtDate(i.payment_date))}</td><td class="td text-right text-amber-400 font-semibold" data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(i.amount))}</td><td class="td text-center" data-v-89f761b7><span class="${ssrRenderClass([i.payroll_id ? "badge-green" : "badge-yellow", "text-xs"])}" data-v-89f761b7>${ssrInterpolate(i.payroll_id ? "Deducted" : "Pending")}</span></td><td class="td text-gray-400" data-v-89f761b7>${ssrInterpolate((_b2 = (_a2 = i.pay_period_start) == null ? void 0 : _a2.slice(0, 7)) != null ? _b2 : "\u2014")}</td></tr>`);
            });
            _push(`<!--]--></tbody></table></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tab) === "leaves") {
          _push(`<div class="glass-card p-5" data-v-89f761b7><div class="flex items-center justify-between mb-4" data-v-89f761b7><h3 class="font-semibold text-white" data-v-89f761b7>\u{1F4CB} Leave History</h3><button class="btn-primary text-sm" data-v-89f761b7>+ Add Leave</button></div><div class="overflow-x-auto" data-v-89f761b7><table class="w-full text-sm" data-v-89f761b7><thead data-v-89f761b7><tr class="border-b border-white/[0.06]" data-v-89f761b7><th class="th" data-v-89f761b7>Type</th><th class="th" data-v-89f761b7>From</th><th class="th" data-v-89f761b7>To</th><th class="th text-right" data-v-89f761b7>Days</th><th class="th" data-v-89f761b7>Reason</th><th class="th text-center" data-v-89f761b7>Status</th><th class="th text-right" data-v-89f761b7>Actions</th></tr></thead><tbody data-v-89f761b7><!--[-->`);
          ssrRenderList(unref(leaves), (l) => {
            _push(`<tr class="tr" data-v-89f761b7><td class="td capitalize text-gray-200" data-v-89f761b7>${ssrInterpolate(ucfirst(l.leave_type))}</td><td class="td text-gray-400" data-v-89f761b7>${ssrInterpolate(fmtDate(l.start_date))}</td><td class="td text-gray-400" data-v-89f761b7>${ssrInterpolate(fmtDate(l.end_date))}</td><td class="td text-right text-gray-300" data-v-89f761b7>${ssrInterpolate(daysDiff(l.start_date, l.end_date))}</td><td class="td text-gray-500 max-w-[180px] truncate" data-v-89f761b7>${ssrInterpolate(l.reason || "\u2014")}</td><td class="td text-center" data-v-89f761b7><select${ssrRenderAttr("value", l.status)} class="input-field text-xs py-0.5 px-2" data-v-89f761b7><option value="pending" data-v-89f761b7>Pending</option><option value="approved" data-v-89f761b7>Approved</option><option value="rejected" data-v-89f761b7>Rejected</option></select></td><td class="td text-right" data-v-89f761b7><button class="btn-xs text-red-400 hover:text-red-300" data-v-89f761b7>\u{1F5D1}</button></td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(leaves).length) {
            _push(`<tr data-v-89f761b7><td colspan="7" class="td text-center text-gray-500 py-10" data-v-89f761b7>No leave records.</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tab) === "documents") {
          _push(`<div class="glass-card p-5" data-v-89f761b7><div class="flex items-center justify-between mb-4" data-v-89f761b7><h3 class="font-semibold text-white" data-v-89f761b7>\u{1F4C1} Documents &amp; Certificates</h3><button class="btn-primary text-sm" data-v-89f761b7>+ Add Document</button></div>`);
          if (unref(documents).length) {
            _push(`<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-v-89f761b7><!--[-->`);
            ssrRenderList(unref(documents), (doc) => {
              _push(`<div class="flex gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]" data-v-89f761b7><div class="text-3xl shrink-0" data-v-89f761b7>${ssrInterpolate(docEmoji(doc.file_type))}</div><div class="flex-1 min-w-0" data-v-89f761b7><p class="font-medium text-gray-200 text-sm truncate" data-v-89f761b7>${ssrInterpolate(doc.name)}</p><p class="text-xs text-gray-500 mt-0.5" data-v-89f761b7>${ssrInterpolate(ucfirst(doc.category))} \xB7 ${ssrInterpolate(doc.file_type || "\u2014")}</p>`);
              if (doc.expiry_date) {
                _push(`<p class="${ssrRenderClass([isExpired(doc.expiry_date) ? "text-red-400" : "text-gray-500", "text-xs mt-0.5"])}" data-v-89f761b7>Expires: ${ssrInterpolate(fmtDate(doc.expiry_date))}</p>`);
              } else {
                _push(`<!---->`);
              }
              if (doc.notes) {
                _push(`<p class="text-xs text-gray-600 mt-0.5 italic" data-v-89f761b7>${ssrInterpolate(doc.notes)}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div><div class="flex flex-col gap-1" data-v-89f761b7>`);
              if (doc.file_path) {
                _push(`<a${ssrRenderAttr("href", doc.file_path)} target="_blank" class="text-amber-400 hover:text-amber-300 text-xs" data-v-89f761b7>\u2197</a>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<button class="text-red-400 hover:text-red-300 text-xs" data-v-89f761b7>\u{1F5D1}</button></div></div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<p class="text-gray-500 text-sm text-center py-10" data-v-89f761b7>No documents uploaded.</p>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(tab) === "assets") {
          _push(`<div class="glass-card p-5" data-v-89f761b7><div class="flex items-center justify-between mb-4" data-v-89f761b7><h3 class="font-semibold text-white" data-v-89f761b7>\u{1F5A5}\uFE0F Assigned Assets</h3><button class="btn-primary text-sm" data-v-89f761b7>+ Assign Asset</button></div><div class="overflow-x-auto" data-v-89f761b7><table class="w-full text-sm" data-v-89f761b7><thead data-v-89f761b7><tr class="border-b border-white/[0.06]" data-v-89f761b7><th class="th" data-v-89f761b7>Asset</th><th class="th" data-v-89f761b7>Code</th><th class="th" data-v-89f761b7>Category</th><th class="th" data-v-89f761b7>Assigned On</th><th class="th" data-v-89f761b7>Due Date</th><th class="th" data-v-89f761b7>Cond. In</th><th class="th" data-v-89f761b7>Cond. Out</th><th class="th text-center" data-v-89f761b7>Status</th><th class="th text-right" data-v-89f761b7>Actions</th></tr></thead><tbody data-v-89f761b7><!--[-->`);
          ssrRenderList(unref(assets), (a) => {
            _push(`<tr class="tr" data-v-89f761b7><td class="td text-gray-200" data-v-89f761b7>${ssrInterpolate(a.asset_name)}</td><td class="td text-gray-400 font-mono text-xs" data-v-89f761b7>${ssrInterpolate(a.asset_code)}</td><td class="td text-gray-400 capitalize" data-v-89f761b7>${ssrInterpolate(a.category)}</td><td class="td text-gray-400" data-v-89f761b7>${ssrInterpolate(fmtDate(a.assigned_on))}</td><td class="td text-gray-400" data-v-89f761b7>${ssrInterpolate(fmtDate(a.due_date))}</td><td class="td text-gray-400 capitalize" data-v-89f761b7>${ssrInterpolate(a.condition_in)}</td><td class="td text-gray-400 capitalize" data-v-89f761b7>${ssrInterpolate(a.condition_out || "\u2014")}</td><td class="td text-center" data-v-89f761b7><span class="${ssrRenderClass([a.returned_on ? "badge-green" : "badge-yellow", "text-xs"])}" data-v-89f761b7>${ssrInterpolate(a.returned_on ? "Returned" : "Active")}</span></td><td class="td text-right" data-v-89f761b7>`);
            if (!a.returned_on) {
              _push(`<button class="btn-xs" data-v-89f761b7>Return</button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td></tr>`);
          });
          _push(`<!--]-->`);
          if (!unref(assets).length) {
            _push(`<tr data-v-89f761b7><td colspan="9" class="td text-center text-gray-500 py-10" data-v-89f761b7>No assets assigned.</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showEditEmp)) {
          _push2(`<div class="modal-overlay" data-v-89f761b7><div class="modal-box w-full max-w-2xl" data-v-89f761b7><h2 class="text-lg font-bold text-white mb-5" data-v-89f761b7>\u270F\uFE0F Edit Employee Profile</h2><div class="grid grid-cols-2 gap-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>First Name</label><input${ssrRenderAttr("value", unref(ef).first_name)} class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Last Name</label><input${ssrRenderAttr("value", unref(ef).last_name)} class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Email</label><input${ssrRenderAttr("value", unref(ef).email)} type="email" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Phone</label><input${ssrRenderAttr("value", unref(ef).phone)} class="input-field w-full" data-v-89f761b7></div><div class="col-span-2" data-v-89f761b7><label class="label" data-v-89f761b7>Address</label><textarea rows="2" class="input-field w-full resize-none" data-v-89f761b7>${ssrInterpolate(unref(ef).address)}</textarea></div><div data-v-89f761b7><label class="label" data-v-89f761b7>NID</label><input${ssrRenderAttr("value", unref(ef).nid)} class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Date of Birth</label><input${ssrRenderAttr("value", unref(ef).dob)} type="date" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Gender</label><select class="input-field w-full" data-v-89f761b7><option value="" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).gender) ? ssrLooseContain(unref(ef).gender, "") : ssrLooseEqual(unref(ef).gender, "")) ? " selected" : ""}>\u2014</option><option value="male" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).gender) ? ssrLooseContain(unref(ef).gender, "male") : ssrLooseEqual(unref(ef).gender, "male")) ? " selected" : ""}>Male</option><option value="female" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).gender) ? ssrLooseContain(unref(ef).gender, "female") : ssrLooseEqual(unref(ef).gender, "female")) ? " selected" : ""}>Female</option><option value="other" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).gender) ? ssrLooseContain(unref(ef).gender, "other") : ssrLooseEqual(unref(ef).gender, "other")) ? " selected" : ""}>Other</option></select></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Blood Group</label><input${ssrRenderAttr("value", unref(ef).blood_group)} class="input-field w-full" placeholder="A+, B-, O+\u2026" data-v-89f761b7></div><div class="col-span-2" data-v-89f761b7><label class="label" data-v-89f761b7>Emergency Contact</label><input${ssrRenderAttr("value", unref(ef).emergency_contact)} class="input-field w-full" data-v-89f761b7></div><div class="col-span-2 border-t border-white/[0.06] pt-3 mt-1" data-v-89f761b7><p class="text-xs text-gray-500 mb-3 font-medium" data-v-89f761b7>Bank Details</p></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Bank Name</label><input${ssrRenderAttr("value", unref(ef).bank_name)} class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Account Number</label><input${ssrRenderAttr("value", unref(ef).bank_account)} class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Bank Branch</label><input${ssrRenderAttr("value", unref(ef).bank_branch)} class="input-field w-full" data-v-89f761b7></div><div class="col-span-2 border-t border-white/[0.06] pt-3 mt-1" data-v-89f761b7><p class="text-xs text-gray-500 mb-3 font-medium" data-v-89f761b7>Employment</p></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Position</label><select class="input-field w-full" data-v-89f761b7><!--[-->`);
          ssrRenderList(unref(positions), (p) => {
            _push2(`<option${ssrRenderAttr("value", p.id)} data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).position_id) ? ssrLooseContain(unref(ef).position_id, p.id) : ssrLooseEqual(unref(ef).position_id, p.id)) ? " selected" : ""}>${ssrInterpolate(p.department_name)} \u2192 ${ssrInterpolate(p.name)}</option>`);
          });
          _push2(`<!--]--></select></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Branch</label><select class="input-field w-full" data-v-89f761b7><!--[-->`);
          ssrRenderList(unref(branches), (b) => {
            _push2(`<option${ssrRenderAttr("value", b.id)} data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).branch_id) ? ssrLooseContain(unref(ef).branch_id, b.id) : ssrLooseEqual(unref(ef).branch_id, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
          });
          _push2(`<!--]--></select></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Hire Date</label><input${ssrRenderAttr("value", unref(ef).hire_date)} type="date" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Base Salary (\u09F3)</label><input${ssrRenderAttr("value", unref(ef).base_salary)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Status</label><select class="input-field w-full" data-v-89f761b7><option value="active" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).status) ? ssrLooseContain(unref(ef).status, "active") : ssrLooseEqual(unref(ef).status, "active")) ? " selected" : ""}>Active</option><option value="on_leave" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).status) ? ssrLooseContain(unref(ef).status, "on_leave") : ssrLooseEqual(unref(ef).status, "on_leave")) ? " selected" : ""}>On Leave</option><option value="inactive" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).status) ? ssrLooseContain(unref(ef).status, "inactive") : ssrLooseEqual(unref(ef).status, "inactive")) ? " selected" : ""}>Inactive</option><option value="terminated" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(ef).status) ? ssrLooseContain(unref(ef).status, "terminated") : ssrLooseEqual(unref(ef).status, "terminated")) ? " selected" : ""}>Terminated</option></select></div></div><div class="flex justify-end gap-3 mt-6" data-v-89f761b7><button class="btn-secondary" data-v-89f761b7>Cancel</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary" data-v-89f761b7>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showSalary)) {
          _push2(`<div class="modal-overlay" data-v-89f761b7><div class="modal-box w-full max-w-xl" data-v-89f761b7><h2 class="text-lg font-bold text-white mb-4" data-v-89f761b7>\u{1F4B0} Salary Structure</h2><p class="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider" data-v-89f761b7>Earnings</p><div class="grid grid-cols-2 gap-4 mb-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Basic Salary</label><input${ssrRenderAttr("value", unref(sf).basic_salary)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>House Allowance</label><input${ssrRenderAttr("value", unref(sf).house_allowance)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Transport Allowance</label><input${ssrRenderAttr("value", unref(sf).transport_allowance)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Medical Allowance</label><input${ssrRenderAttr("value", unref(sf).medical_allowance)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Other Allowances</label><input${ssrRenderAttr("value", unref(sf).other_allowances)} type="number" class="input-field w-full" data-v-89f761b7></div></div><p class="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wider" data-v-89f761b7>Deductions</p><div class="grid grid-cols-3 gap-4 mb-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Provident Fund</label><input${ssrRenderAttr("value", unref(sf).provident_fund)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Tax Deduction</label><input${ssrRenderAttr("value", unref(sf).tax_deduction)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Other Deductions</label><input${ssrRenderAttr("value", unref(sf).other_deductions)} type="number" class="input-field w-full" data-v-89f761b7></div></div><div class="flex gap-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] mb-5 text-sm" data-v-89f761b7><div data-v-89f761b7>Gross: <span class="text-amber-400 font-bold" data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(sfGross)))}</span></div><div data-v-89f761b7>Net: <span class="text-green-400 font-bold" data-v-89f761b7>\u09F3 ${ssrInterpolate(fmt(unref(sfNet)))}</span></div></div><div class="flex justify-end gap-3" data-v-89f761b7><button class="btn-secondary" data-v-89f761b7>Cancel</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary" data-v-89f761b7>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Structure")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showPayroll)) {
          _push2(`<div class="modal-overlay" data-v-89f761b7><div class="modal-box" data-v-89f761b7><h2 class="text-lg font-bold text-white mb-4" data-v-89f761b7>\u{1F4B0} Add Payroll Record</h2><div class="grid grid-cols-2 gap-4 mb-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Period Start</label><input${ssrRenderAttr("value", unref(payForm).pay_period_start)} type="date" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Period End</label><input${ssrRenderAttr("value", unref(payForm).pay_period_end)} type="date" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Gross Salary</label><input${ssrRenderAttr("value", unref(payForm).gross_salary)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Deductions</label><input${ssrRenderAttr("value", unref(payForm).deductions)} type="number" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Net Salary</label><input${ssrRenderAttr("value", unref(payForm).gross_salary - unref(payForm).deductions)} type="number" readonly class="input-field w-full opacity-60" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Status</label><select class="input-field w-full" data-v-89f761b7><option value="pending_approval" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(payForm).status) ? ssrLooseContain(unref(payForm).status, "pending_approval") : ssrLooseEqual(unref(payForm).status, "pending_approval")) ? " selected" : ""}>Pending Approval</option><option value="approved" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(payForm).status) ? ssrLooseContain(unref(payForm).status, "approved") : ssrLooseEqual(unref(payForm).status, "approved")) ? " selected" : ""}>Approved</option><option value="paid" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(payForm).status) ? ssrLooseContain(unref(payForm).status, "paid") : ssrLooseEqual(unref(payForm).status, "paid")) ? " selected" : ""}>Paid</option></select></div></div><div class="flex justify-end gap-3" data-v-89f761b7><button class="btn-secondary" data-v-89f761b7>Cancel</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary" data-v-89f761b7>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showLeave)) {
          _push2(`<div class="modal-overlay" data-v-89f761b7><div class="modal-box" data-v-89f761b7><h2 class="text-lg font-bold text-white mb-4" data-v-89f761b7>\u{1F4CB} Add Leave Record</h2><div class="grid grid-cols-2 gap-4 mb-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Leave Type</label><select class="input-field w-full" data-v-89f761b7><option value="annual" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).leave_type) ? ssrLooseContain(unref(leaveForm).leave_type, "annual") : ssrLooseEqual(unref(leaveForm).leave_type, "annual")) ? " selected" : ""}>Annual</option><option value="sick" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).leave_type) ? ssrLooseContain(unref(leaveForm).leave_type, "sick") : ssrLooseEqual(unref(leaveForm).leave_type, "sick")) ? " selected" : ""}>Sick</option><option value="casual" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).leave_type) ? ssrLooseContain(unref(leaveForm).leave_type, "casual") : ssrLooseEqual(unref(leaveForm).leave_type, "casual")) ? " selected" : ""}>Casual</option><option value="unpaid" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).leave_type) ? ssrLooseContain(unref(leaveForm).leave_type, "unpaid") : ssrLooseEqual(unref(leaveForm).leave_type, "unpaid")) ? " selected" : ""}>Unpaid</option><option value="maternity" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).leave_type) ? ssrLooseContain(unref(leaveForm).leave_type, "maternity") : ssrLooseEqual(unref(leaveForm).leave_type, "maternity")) ? " selected" : ""}>Maternity</option><option value="paternity" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).leave_type) ? ssrLooseContain(unref(leaveForm).leave_type, "paternity") : ssrLooseEqual(unref(leaveForm).leave_type, "paternity")) ? " selected" : ""}>Paternity</option></select></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Status</label><select class="input-field w-full" data-v-89f761b7><option value="approved" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).status) ? ssrLooseContain(unref(leaveForm).status, "approved") : ssrLooseEqual(unref(leaveForm).status, "approved")) ? " selected" : ""}>Approved</option><option value="pending" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).status) ? ssrLooseContain(unref(leaveForm).status, "pending") : ssrLooseEqual(unref(leaveForm).status, "pending")) ? " selected" : ""}>Pending</option><option value="rejected" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(leaveForm).status) ? ssrLooseContain(unref(leaveForm).status, "rejected") : ssrLooseEqual(unref(leaveForm).status, "rejected")) ? " selected" : ""}>Rejected</option></select></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Start Date</label><input${ssrRenderAttr("value", unref(leaveForm).start_date)} type="date" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>End Date</label><input${ssrRenderAttr("value", unref(leaveForm).end_date)} type="date" class="input-field w-full" data-v-89f761b7></div></div><div class="mb-4" data-v-89f761b7><label class="label" data-v-89f761b7>Reason</label><textarea rows="2" class="input-field w-full resize-none" data-v-89f761b7>${ssrInterpolate(unref(leaveForm).reason)}</textarea></div><div class="flex justify-end gap-3" data-v-89f761b7><button class="btn-secondary" data-v-89f761b7>Cancel</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary" data-v-89f761b7>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showDoc)) {
          _push2(`<div class="modal-overlay" data-v-89f761b7><div class="modal-box" data-v-89f761b7><h2 class="text-lg font-bold text-white mb-4" data-v-89f761b7>\u{1F4C4} Add Document</h2><div class="space-y-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Document Name *</label><input${ssrRenderAttr("value", unref(docForm).name)} class="input-field w-full" placeholder="NID, Degree Certificate, etc." data-v-89f761b7></div><div class="grid grid-cols-2 gap-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Category</label><select class="input-field w-full" data-v-89f761b7><option value="identity" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(docForm).category) ? ssrLooseContain(unref(docForm).category, "identity") : ssrLooseEqual(unref(docForm).category, "identity")) ? " selected" : ""}>Identity</option><option value="education" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(docForm).category) ? ssrLooseContain(unref(docForm).category, "education") : ssrLooseEqual(unref(docForm).category, "education")) ? " selected" : ""}>Education</option><option value="employment" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(docForm).category) ? ssrLooseContain(unref(docForm).category, "employment") : ssrLooseEqual(unref(docForm).category, "employment")) ? " selected" : ""}>Employment</option><option value="medical" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(docForm).category) ? ssrLooseContain(unref(docForm).category, "medical") : ssrLooseEqual(unref(docForm).category, "medical")) ? " selected" : ""}>Medical</option><option value="certificate" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(docForm).category) ? ssrLooseContain(unref(docForm).category, "certificate") : ssrLooseEqual(unref(docForm).category, "certificate")) ? " selected" : ""}>Certificate</option><option value="general" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(docForm).category) ? ssrLooseContain(unref(docForm).category, "general") : ssrLooseEqual(unref(docForm).category, "general")) ? " selected" : ""}>General</option></select></div><div data-v-89f761b7><label class="label" data-v-89f761b7>File Type</label><input${ssrRenderAttr("value", unref(docForm).file_type)} class="input-field w-full" placeholder="PDF, JPG\u2026" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Expiry Date</label><input${ssrRenderAttr("value", unref(docForm).expiry_date)} type="date" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>File Path / URL</label><input${ssrRenderAttr("value", unref(docForm).file_path)} class="input-field w-full" placeholder="/uploads/\u2026" data-v-89f761b7></div></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Notes</label><textarea rows="2" class="input-field w-full resize-none" data-v-89f761b7>${ssrInterpolate(unref(docForm).notes)}</textarea></div></div><div class="flex justify-end gap-3 mt-5" data-v-89f761b7><button class="btn-secondary" data-v-89f761b7>Cancel</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary" data-v-89f761b7>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showAsset)) {
          _push2(`<div class="modal-overlay" data-v-89f761b7><div class="modal-box" data-v-89f761b7><h2 class="text-lg font-bold text-white mb-4" data-v-89f761b7>\u{1F5A5}\uFE0F Assign Asset</h2><div class="space-y-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Asset</label><select class="input-field w-full" data-v-89f761b7><option value="" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(assetForm).asset_id) ? ssrLooseContain(unref(assetForm).asset_id, "") : ssrLooseEqual(unref(assetForm).asset_id, "")) ? " selected" : ""}>Select asset\u2026</option><!--[-->`);
          ssrRenderList(unref(availableAssets), (a) => {
            _push2(`<option${ssrRenderAttr("value", a.id)} data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(assetForm).asset_id) ? ssrLooseContain(unref(assetForm).asset_id, a.id) : ssrLooseEqual(unref(assetForm).asset_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.name)} (${ssrInterpolate(a.asset_code)}) </option>`);
          });
          _push2(`<!--]--></select></div><div class="grid grid-cols-3 gap-4" data-v-89f761b7><div data-v-89f761b7><label class="label" data-v-89f761b7>Assigned On</label><input${ssrRenderAttr("value", unref(assetForm).assigned_on)} type="date" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Due Date</label><input${ssrRenderAttr("value", unref(assetForm).due_date)} type="date" class="input-field w-full" data-v-89f761b7></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Condition</label><select class="input-field w-full" data-v-89f761b7><option value="new" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(assetForm).condition_in) ? ssrLooseContain(unref(assetForm).condition_in, "new") : ssrLooseEqual(unref(assetForm).condition_in, "new")) ? " selected" : ""}>New</option><option value="good" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(assetForm).condition_in) ? ssrLooseContain(unref(assetForm).condition_in, "good") : ssrLooseEqual(unref(assetForm).condition_in, "good")) ? " selected" : ""}>Good</option><option value="fair" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(assetForm).condition_in) ? ssrLooseContain(unref(assetForm).condition_in, "fair") : ssrLooseEqual(unref(assetForm).condition_in, "fair")) ? " selected" : ""}>Fair</option><option value="poor" data-v-89f761b7${ssrIncludeBooleanAttr(Array.isArray(unref(assetForm).condition_in) ? ssrLooseContain(unref(assetForm).condition_in, "poor") : ssrLooseEqual(unref(assetForm).condition_in, "poor")) ? " selected" : ""}>Poor</option></select></div></div><div data-v-89f761b7><label class="label" data-v-89f761b7>Notes</label><textarea rows="2" class="input-field w-full resize-none" data-v-89f761b7>${ssrInterpolate(unref(assetForm).notes)}</textarea></div></div><div class="flex justify-end gap-3 mt-5" data-v-89f761b7><button class="btn-secondary" data-v-89f761b7>Cancel</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary" data-v-89f761b7>${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Assign")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(toastMsg)) {
          _push2(`<div class="${ssrRenderClass([unref(toastType) === "error" ? "bg-red-900/90 border-red-500/50 text-red-200" : "bg-green-900/90 border-green-500/50 text-green-200", "fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl border text-sm font-medium shadow-2xl"])}" data-v-89f761b7>${ssrInterpolate(unref(toastMsg))}</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/employees/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-89f761b7"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-Bv7lgiPk.mjs.map
