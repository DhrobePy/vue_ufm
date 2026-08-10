import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { a as __nuxt_component_1 } from './server.mjs';
import { defineComponent, ref, withAsyncContext, watch, computed, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle, ssrRenderTeleport } from 'vue/server-renderer';
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
  __name: "biometric",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const activeTab = ref("devices");
    const loading = ref(true);
    const logLoading = ref(false);
    const reprocessing = ref(false);
    const saving = ref(false);
    const copied = ref(false);
    const saveErr = ref("");
    const devices = ref([]);
    const branches = ref([]);
    const employees = ref([]);
    const punchLog = ref([]);
    const logTotal = ref(0);
    const logOffset = ref(0);
    const unmatched = ref([]);
    const { data: branchData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$BYvADVsGVc"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(branchData, (v) => {
      var _a;
      branches.value = (_a = v == null ? void 0 : v.branches) != null ? _a : [];
    }, { immediate: true });
    const { data: empData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/employees",
      "$NwVNvrjtW9"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(empData, (v) => {
      var _a;
      employees.value = (_a = v == null ? void 0 : v.employees) != null ? _a : [];
    }, { immediate: true });
    const admsUrl = computed(() => {
      return "/api/device/adms";
    });
    const logFilter = reactive({
      from: new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10),
      to: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      serial: ""
    });
    const tabs = computed(() => [
      { key: "devices", label: "\u{1F512} Devices", badge: null, onLoad: null },
      { key: "punchlog", label: "\u{1F446} Punch Log", badge: null, onLoad: loadLog },
      { key: "unmatched", label: "\u26A0\uFE0F Unmatched", badge: unmatched.value.length, onLoad: loadUnmatched },
      { key: "facekiosk", label: "\u{1F916} Face Kiosk", badge: null, onLoad: loadEnrolled },
      { key: "setup", label: "\u2699\uFE0F Setup Guide", badge: null, onLoad: null }
    ]);
    async function loadLog() {
      var _a, _b;
      logLoading.value = true;
      try {
        const res = await $fetch("/api/hr/biometric", {
          query: { view: "punch_log", from: logFilter.from, to: logFilter.to, serial: logFilter.serial || void 0, limit: 100, offset: logOffset.value }
        });
        punchLog.value = (_a = res.logs) != null ? _a : [];
        logTotal.value = (_b = res.total) != null ? _b : 0;
      } finally {
        logLoading.value = false;
      }
    }
    async function loadUnmatched() {
      var _a;
      const res = await $fetch("/api/hr/biometric", { query: { view: "unmatched" } });
      unmatched.value = (_a = res.unmatched) != null ? _a : [];
    }
    const showDeviceModal = ref(false);
    const deviceForm = reactive({ id: null, serial_no: "", device_name: "", brand: "ZKTeco", model: "", branch_id: null, ip_address: "", notes: "" });
    const showPinModal = ref(false);
    const pinForm = reactive({ employee_id: "", device_pin: "" });
    const kioskCopied = ref(false);
    const faceLoading = ref(false);
    const enrolledList = ref([]);
    const showFaceModal = ref(false);
    const faceEnrollEmpId = ref(null);
    const kioskUrl = computed(() => {
      return "/kiosk";
    });
    async function loadEnrolled() {
      var _a;
      faceLoading.value = true;
      try {
        const res = await $fetch("/api/hr/biometric/face-list");
        enrolledList.value = (_a = res.employees) != null ? _a : [];
      } finally {
        faceLoading.value = false;
      }
    }
    function statusPill(s) {
      return s === "online" ? "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400" : s === "pending" ? "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400" : "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400";
    }
    function punchTypeLabel(t) {
      var _a;
      return (_a = { 0: "Clock In", 1: "Clock Out", 4: "Break Out", 5: "Break In" }[t]) != null ? _a : `Type ${t}`;
    }
    function verifyLabel(t) {
      var _a;
      return (_a = { 0: "Password", 1: "Fingerprint", 4: "RFID Card", 15: "Face" }[t]) != null ? _a : `Mode ${t}`;
    }
    function relativeTime(dt) {
      const diff = (Date.now() - new Date(dt).getTime()) / 1e3;
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    }
    const brandGuides = [
      {
        name: "ZKTeco",
        emoji: "\u{1F535}",
        models: "ZK4500, SpeedFace V5L, K40, UFace, ZK9500\u2026",
        steps: [
          "Press Menu \u2192 Comm \u2192 Cloud Service (or ADMS)",
          "Enable ADMS: ON",
          `Server Address: ${"yourdomain.com"}`,
          "Server Port: 80",
          "URL Path: /api/device/adms",
          "Save \u2192 device reboots and connects automatically"
        ],
        note: "Older ZKTeco firmware (v6.60) uses fixed path /iclock/cdata \u2014 add a Nuxt server route rewrite or proxy if needed."
      },
      {
        name: "Hikvision",
        emoji: "\u{1F534}",
        models: "DS-K1T671, DS-K1T341, DS-K1T671TM\u2026",
        steps: [
          "Open Device Web UI \u2192 Configuration \u2192 Network \u2192 Advanced Settings",
          "Enable iClock protocol",
          `Server Address: ${"yourdomain.com"}`,
          "URL: /api/device/adms",
          "Port: 80",
          "Click Save \u2014 device registers on next heartbeat"
        ]
      },
      {
        name: "Dahua",
        emoji: "\u{1F7E0}",
        models: "ASI7213Y-T1, ASI3214H, DHI-ASI\u2026",
        steps: [
          "Login to device Web UI \u2192 Setup \u2192 Network \u2192 ATDM",
          "Enable ATDM/iClock: ON",
          `Server IP/Domain: ${"yourdomain.com"}`,
          "Server Port: 80",
          "Path: /api/device/adms",
          "Save configuration"
        ]
      },
      {
        name: "eSSL / Realand",
        emoji: "\u{1F7E2}",
        models: "X990, G3, X-628, eTime Track\u2026",
        steps: [
          "Menu \u2192 Setup \u2192 Comm Settings \u2192 Cloud Service",
          `Server: ${"yourdomain.com"}`,
          "Port: 80",
          "URL: /api/device/adms",
          "Enable push: ON \u2192 Save and reconnect"
        ],
        note: "eSSL devices are ZKTeco OEMs \u2014 same protocol, identical setup."
      },
      {
        name: "FingerTec",
        emoji: "\u26AB",
        models: "TA200 Plus, R2 Mark II, Kadex, Q2i\u2026",
        steps: [
          "Login to TCMS V3 software or device web UI",
          "Device Settings \u2192 Connection \u2192 Cloud Server",
          `Server URL: http://${"yourdomain.com"}/api/device/adms`,
          "Enable cloud sync: YES \u2192 Apply"
        ]
      },
      {
        name: "Anviz",
        emoji: "\u{1F7E3}",
        models: "CrossChex Cloud, EP300, M5, T5 Pro\u2026",
        steps: [
          "Menu \u2192 System \u2192 Server Setting",
          "Connection type: TCP/IP \u2192 Cloud",
          `Server: ${"yourdomain.com"}, Port: 80`,
          "URL: /api/device/adms"
        ],
        note: "Anviz requires firmware v2.x+ for ADMS compatibility."
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBackButton = _sfc_main$1;
      const _component_ClientOnly = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div><h1 class="text-2xl font-bold text-white">Biometric Devices</h1><p class="text-sm text-gray-400">Hardware attendance terminals \u2014 ZKTeco, Hikvision, Dahua, eSSL, FingerTec &amp; more</p></div></div><button class="btn-primary">+ Add Device</button></div><div class="flex gap-1 border-b border-white/[0.07] pb-0"><!--[-->`);
      ssrRenderList(unref(tabs), (t) => {
        _push(`<button class="${ssrRenderClass([
          "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
          unref(activeTab) === t.key ? "border-amber-400 text-amber-400" : "border-transparent text-gray-400 hover:text-gray-200"
        ])}">${ssrInterpolate(t.label)} `);
        if (t.badge) {
          _push(`<span class="${ssrRenderClass([t.badge > 0 ? "bg-red-500/20 text-red-400" : "bg-white/[0.06] text-gray-500", "ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"])}">${ssrInterpolate(t.badge)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(activeTab) === "devices") {
        _push(`<div>`);
        if (unref(loading)) {
          _push(`<div class="card p-12 text-center text-gray-500">Loading devices\u2026</div>`);
        } else if (!unref(devices).length) {
          _push(`<div class="card p-12 text-center"><div class="text-4xl mb-3">\u{1F4E1}</div><p class="text-gray-400 font-medium">No devices registered yet</p><p class="text-gray-600 text-sm mt-1">Add a device manually or wait for auto-connect via ADMS</p></div>`);
        } else {
          _push(`<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"><!--[-->`);
          ssrRenderList(unref(devices), (d) => {
            var _a;
            _push(`<div class="glass-card p-4 flex flex-col gap-3"><div class="flex items-start gap-3"><div class="${ssrRenderClass([d.status === "online" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400", "w-10 h-10 rounded-xl flex items-center justify-center shrink-0"])}"><span class="text-lg">\u{1F512}</span></div><div class="flex-1 min-w-0"><p class="font-bold text-gray-100 truncate">${ssrInterpolate(d.device_name || d.serial_no)}</p><p class="text-xs text-gray-500">${ssrInterpolate(d.brand)} ${ssrInterpolate(d.model)}</p></div><span class="${ssrRenderClass(statusPill(d.status))}"><span class="w-1.5 h-1.5 rounded-full bg-current inline-block mr-1"></span> ${ssrInterpolate(d.status)}</span></div><div class="grid grid-cols-2 gap-1.5 text-xs text-gray-400"><div>\u{1F522} ${ssrInterpolate(d.serial_no)}</div><div>\u{1F3E2} ${ssrInterpolate(d.branch_name || "No branch")}</div><div>\u{1F310} ${ssrInterpolate(d.ip_address || "IP unknown")}</div><div>\u{1F550} ${ssrInterpolate(d.last_seen ? relativeTime(d.last_seen) : "Never")}</div></div><div class="flex divide-x divide-white/[0.06] border border-white/[0.06] rounded-lg overflow-hidden"><div class="flex-1 text-center py-2"><div class="text-lg font-bold text-white">${ssrInterpolate((d.total_records || 0).toLocaleString())}</div><div class="text-[10px] text-gray-500">Total Punches</div></div><div class="flex-1 text-center py-2"><div class="text-lg font-bold text-amber-400">${ssrInterpolate((_a = d.today_punches) != null ? _a : 0)}</div><div class="text-[10px] text-gray-500">Today</div></div><div class="flex-1 text-center py-2"><div class="text-sm font-semibold text-gray-300">${ssrInterpolate(d.firmware_version || "\u2014")}</div><div class="text-[10px] text-gray-500">Firmware</div></div></div><div class="flex gap-2"><button class="btn-secondary flex-1 text-xs py-1.5">Edit</button><button class="btn-secondary flex-1 text-xs py-1.5">Log</button><button class="text-xs py-1.5 px-3 rounded-lg text-red-400 hover:bg-red-500/10 transition">Del</button></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`<div class="card p-4 mt-4 flex items-center gap-4 flex-wrap"><span class="text-2xl shrink-0">\u{1F517}</span><div class="flex-1 min-w-0"><p class="font-semibold text-gray-100 text-sm">ADMS Server Endpoint</p><p class="text-xs text-gray-500 mt-0.5">Configure this URL on your device&#39;s Cloud / Server settings</p></div><div class="flex items-center gap-2 flex-wrap"><code class="bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-1.5 text-amber-300 text-sm font-mono">${ssrInterpolate(unref(admsUrl))}</code><button class="btn-secondary text-xs py-1.5 px-3">${ssrInterpolate(unref(copied) ? "\u2713 Copied!" : "\u{1F4CB} Copy")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "punchlog") {
        _push(`<div class="space-y-4"><div class="card p-4 flex flex-wrap gap-3 items-end"><div><label class="label">From</label><input${ssrRenderAttr("value", unref(logFilter).from)} type="date" class="input-field text-sm"></div><div><label class="label">To</label><input${ssrRenderAttr("value", unref(logFilter).to)} type="date" class="input-field text-sm"></div><div><label class="label">Device</label><select class="input-field text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(logFilter).serial) ? ssrLooseContain(unref(logFilter).serial, "") : ssrLooseEqual(unref(logFilter).serial, "")) ? " selected" : ""}>All Devices</option><!--[-->`);
        ssrRenderList(unref(devices), (d) => {
          _push(`<option${ssrRenderAttr("value", d.serial_no)}${ssrIncludeBooleanAttr(Array.isArray(unref(logFilter).serial) ? ssrLooseContain(unref(logFilter).serial, d.serial_no) : ssrLooseEqual(unref(logFilter).serial, d.serial_no)) ? " selected" : ""}>${ssrInterpolate(d.device_name || d.serial_no)}</option>`);
        });
        _push(`<!--]--></select></div><button class="btn-primary text-sm">\u{1F50D} Search</button></div><div class="card overflow-hidden"><div class="px-4 py-3 border-b border-white/[0.06] flex justify-between items-center"><p class="text-sm font-semibold text-gray-200">Punch Records</p><span class="text-xs text-gray-500">${ssrInterpolate(unref(logTotal).toLocaleString())} total</span></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Time</th><th class="th">Employee</th><th class="th">PIN</th><th class="th">Device</th><th class="th text-center">Type</th><th class="th text-center">Verify</th></tr></thead><tbody>`);
        if (unref(logLoading)) {
          _push(`<tr><td colspan="6" class="td text-center text-gray-500 py-10">Loading\u2026</td></tr>`);
        } else if (!unref(punchLog).length) {
          _push(`<tr><td colspan="6" class="td text-center text-gray-500 py-10">No punch records found.</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(punchLog), (l) => {
          _push(`<tr class="tr"><td class="td text-gray-300 whitespace-nowrap">${ssrInterpolate(l.punch_time)}</td><td class="td">`);
          if (l.employee_name) {
            _push(`<span class="font-medium text-gray-200">${ssrInterpolate(l.employee_name)}</span>`);
          } else {
            _push(`<span class="badge-red text-xs">Unmatched</span>`);
          }
          _push(`</td><td class="td"><code class="text-xs text-amber-300">${ssrInterpolate(l.pin)}</code></td><td class="td text-gray-500 text-xs">${ssrInterpolate(l.device_serial)}</td><td class="td text-center"><span class="${ssrRenderClass([l.punch_type == 0 ? "badge-green" : "badge-blue", "text-xs"])}">${ssrInterpolate(punchTypeLabel(l.punch_type))}</span></td><td class="td text-center"><span class="badge-gray text-xs">${ssrInterpolate(verifyLabel(l.verify_type))}</span></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
        if (unref(logTotal) > 100) {
          _push(`<div class="px-4 py-3 border-t border-white/[0.06] flex justify-end gap-2"><button${ssrIncludeBooleanAttr(unref(logOffset) === 0) ? " disabled" : ""} class="btn-secondary text-sm">\u2190 Prev</button><span class="text-xs text-gray-500 self-center">${ssrInterpolate(unref(logOffset) + 1)}\u2013${ssrInterpolate(Math.min(unref(logOffset) + 100, unref(logTotal)))}</span><button${ssrIncludeBooleanAttr(unref(logOffset) + 100 >= unref(logTotal)) ? " disabled" : ""} class="btn-secondary text-sm">Next \u2192</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "unmatched") {
        _push(`<div class="space-y-4"><div class="card p-4 flex items-center gap-3 flex-wrap"><span class="text-amber-400 text-xl">\u26A0\uFE0F</span><div class="flex-1"><p class="text-sm font-semibold text-gray-100">Unmatched Punches</p><p class="text-xs text-gray-500 mt-0.5">Device PINs that didn&#39;t match any employee. Assign PINs in profiles or use Reprocess.</p></div><button${ssrIncludeBooleanAttr(unref(reprocessing)) ? " disabled" : ""} class="btn-primary text-sm">${ssrInterpolate(unref(reprocessing) ? "\u27F3 Processing\u2026" : "\u27F3 Reprocess All")}</button></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">PIN</th><th class="th">Device</th><th class="th">Punch Time</th><th class="th">Raw Data</th><th class="th text-right">Action</th></tr></thead><tbody>`);
        if (!unref(unmatched).length) {
          _push(`<tr><td colspan="5" class="td text-center text-gray-500 py-10">\u{1F389} No unmatched punches!</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(unmatched), (u) => {
          _push(`<tr class="tr"><td class="td"><code class="font-bold text-amber-300">${ssrInterpolate(u.pin)}</code></td><td class="td text-gray-500 text-xs">${ssrInterpolate(u.device_serial)}</td><td class="td text-gray-300 whitespace-nowrap text-xs">${ssrInterpolate(u.punch_time)}</td><td class="td text-gray-600 text-xs truncate max-w-[180px]">${ssrInterpolate(u.raw_line)}</td><td class="td text-right"><button class="btn-xs">Assign PIN</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "facekiosk") {
        _push(`<div class="space-y-4"><div class="card p-5 flex items-center gap-5 flex-wrap"><div class="text-4xl shrink-0">\u{1F916}</div><div class="flex-1"><h2 class="font-bold text-gray-100">Standalone Face Recognition Kiosk</h2><p class="text-sm text-gray-400 mt-1"> Open this on a dedicated tablet or PC at the gate. Employees look into the camera \u2014 it automatically records their attendance. No PIN, no card needed. </p></div><div class="flex gap-3 flex-wrap"><a${ssrRenderAttr("href", `/kiosk`)} target="_blank" class="btn-primary">\u{1F680} Launch Kiosk</a><button class="btn-secondary text-sm">${ssrInterpolate(unref(kioskCopied) ? "\u2713 Copied!" : "\u{1F4CB} Copy URL")}</button></div></div><div class="card p-4"><p class="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Kiosk URL</p><code class="block bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-2.5 text-amber-300 font-mono text-sm break-all">${ssrInterpolate(unref(kioskUrl))}</code><p class="text-xs text-gray-600 mt-2"> Append <code class="text-amber-300">?branch=2</code> to skip branch selection and go straight to scanning. </p></div><div class="card overflow-hidden"><div class="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between"><div><p class="font-semibold text-gray-200">\u{1F464} Face Enrolment</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(enrolledList).length)} employees have Face IDs</p></div><button class="btn-primary text-sm">+ Enrol Employee</button></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Employee</th><th class="th text-center">Status</th><th class="th">Enrolled At</th><th class="th text-right">Action</th></tr></thead><tbody>`);
        if (unref(faceLoading)) {
          _push(`<tr><td colspan="4" class="td text-center text-gray-500 py-8">Loading\u2026</td></tr>`);
        } else if (!unref(enrolledList).length) {
          _push(`<tr><td colspan="4" class="td text-center text-gray-500 py-8"> No employees enrolled yet. Click &quot;+ Enrol Employee&quot; to start. </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(enrolledList), (e) => {
          _push(`<tr class="tr"><td class="td"><span class="font-medium text-gray-200">#${ssrInterpolate(e.employee_id)} ${ssrInterpolate(e.name)}</span></td><td class="td text-center"><span class="${ssrRenderClass([e.valid ? "badge-green" : "badge-red", "text-xs"])}">${ssrInterpolate(e.valid ? "\u2713 Valid" : "\u2717 Corrupt")}</span></td><td class="td text-gray-500 text-xs">${ssrInterpolate(e.saved_at)}</td><td class="td text-right"><button class="btn-xs mr-2">Re-enrol</button><button class="text-xs text-red-400 hover:text-red-300">Delete</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "setup") {
        _push(`<div class="space-y-4"><div class="card p-5"><h2 class="font-bold text-gray-100 mb-3">\u{1F517} Your ADMS Server URL</h2><div class="flex items-center gap-3 flex-wrap"><code class="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-4 py-2.5 text-amber-300 font-mono text-sm break-all">${ssrInterpolate(unref(admsUrl))}</code><button class="btn-primary text-sm">${ssrInterpolate(unref(copied) ? "\u2713 Copied!" : "\u{1F4CB} Copy URL")}</button></div><p class="text-xs text-gray-500 mt-3"> Configure all supported devices to push data to this URL. New devices auto-register on first connection \u2014 no manual setup needed. </p></div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"><!--[-->`);
        ssrRenderList(brandGuides, (b) => {
          _push(`<div class="card p-4"><div class="flex items-center gap-3 mb-4"><div class="text-2xl">${ssrInterpolate(b.emoji)}</div><div><p class="font-bold text-gray-100">${ssrInterpolate(b.name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(b.models)}</p></div></div><ol class="space-y-1.5 list-decimal list-inside"><!--[-->`);
          ssrRenderList(b.steps, (step, i) => {
            _push(`<li class="text-xs text-gray-300 leading-relaxed">${ssrInterpolate(step)}</li>`);
          });
          _push(`<!--]--></ol>`);
          if (b.note) {
            _push(`<div class="mt-3 p-2.5 bg-indigo-500/10 border-l-2 border-indigo-400 rounded text-xs text-indigo-300">${ssrInterpolate(b.note)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div><div class="card p-5"><h2 class="font-bold text-gray-100 mb-2">\u{1F194} Employee PIN Mapping</h2><p class="text-xs text-gray-500 mb-4"> Each employee enrolled on a device has a PIN. Map it to their profile so punches are recognised correctly. If the device PIN equals the employee&#39;s System ID, no mapping is needed. </p><div class="flex items-end gap-3 flex-wrap"><div><label class="label">Employee</label><select class="input-field" style="${ssrRenderStyle({ "min-width": "200px" })}"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(pinForm).employee_id) ? ssrLooseContain(unref(pinForm).employee_id, "") : ssrLooseEqual(unref(pinForm).employee_id, "")) ? " selected" : ""}>Select employee\u2026</option><!--[-->`);
        ssrRenderList(unref(employees), (e) => {
          _push(`<option${ssrRenderAttr("value", e.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(pinForm).employee_id) ? ssrLooseContain(unref(pinForm).employee_id, e.id) : ssrLooseEqual(unref(pinForm).employee_id, e.id)) ? " selected" : ""}> [${ssrInterpolate(e.id)}] ${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="label">Device PIN</label><input${ssrRenderAttr("value", unref(pinForm).device_pin)} class="input-field w-32" placeholder="e.g. 4501"></div><button${ssrIncludeBooleanAttr(!unref(pinForm).employee_id || !unref(pinForm).device_pin) ? " disabled" : ""} class="btn-primary"> Save PIN </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showDeviceModal)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-lg"><h2 class="text-lg font-bold text-white mb-5">${ssrInterpolate(unref(deviceForm).id ? "Edit Device" : "Add Device")}</h2><div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="label">Serial Number *</label><input${ssrRenderAttr("value", unref(deviceForm).serial_no)} class="input-field w-full" placeholder="e.g. CGXJ231200001"><p class="text-xs text-gray-600 mt-1">Found on device sticker or menu</p></div><div><label class="label">Device Name</label><input${ssrRenderAttr("value", unref(deviceForm).device_name)} class="input-field w-full" placeholder="e.g. Factory Gate A"></div></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Brand</label><select class="input-field w-full"><option value="ZKTeco"${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).brand) ? ssrLooseContain(unref(deviceForm).brand, "ZKTeco") : ssrLooseEqual(unref(deviceForm).brand, "ZKTeco")) ? " selected" : ""}>ZKTeco</option><option value="Hikvision"${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).brand) ? ssrLooseContain(unref(deviceForm).brand, "Hikvision") : ssrLooseEqual(unref(deviceForm).brand, "Hikvision")) ? " selected" : ""}>Hikvision</option><option value="Dahua"${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).brand) ? ssrLooseContain(unref(deviceForm).brand, "Dahua") : ssrLooseEqual(unref(deviceForm).brand, "Dahua")) ? " selected" : ""}>Dahua</option><option value="eSSL"${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).brand) ? ssrLooseContain(unref(deviceForm).brand, "eSSL") : ssrLooseEqual(unref(deviceForm).brand, "eSSL")) ? " selected" : ""}>eSSL / Realand</option><option value="FingerTec"${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).brand) ? ssrLooseContain(unref(deviceForm).brand, "FingerTec") : ssrLooseEqual(unref(deviceForm).brand, "FingerTec")) ? " selected" : ""}>FingerTec</option><option value="Anviz"${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).brand) ? ssrLooseContain(unref(deviceForm).brand, "Anviz") : ssrLooseEqual(unref(deviceForm).brand, "Anviz")) ? " selected" : ""}>Anviz</option><option value="Suprema"${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).brand) ? ssrLooseContain(unref(deviceForm).brand, "Suprema") : ssrLooseEqual(unref(deviceForm).brand, "Suprema")) ? " selected" : ""}>Suprema</option><option value="Unknown"${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).brand) ? ssrLooseContain(unref(deviceForm).brand, "Unknown") : ssrLooseEqual(unref(deviceForm).brand, "Unknown")) ? " selected" : ""}>Other</option></select></div><div><label class="label">Model</label><input${ssrRenderAttr("value", unref(deviceForm).model)} class="input-field w-full" placeholder="e.g. ZK4500"></div></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Branch</label><select class="input-field w-full"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).branch_id) ? ssrLooseContain(unref(deviceForm).branch_id, null) : ssrLooseEqual(unref(deviceForm).branch_id, null)) ? " selected" : ""}>No branch</option><!--[-->`);
          ssrRenderList(unref(branches), (b) => {
            _push2(`<option${ssrRenderAttr("value", b.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(deviceForm).branch_id) ? ssrLooseContain(unref(deviceForm).branch_id, b.id) : ssrLooseEqual(unref(deviceForm).branch_id, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="label">IP Address</label><input${ssrRenderAttr("value", unref(deviceForm).ip_address)} class="input-field w-full" placeholder="192.168.1.201"></div></div><div><label class="label">Notes</label><input${ssrRenderAttr("value", unref(deviceForm).notes)} class="input-field w-full" placeholder="Location, floor, etc."></div>`);
          if (unref(saveErr)) {
            _push2(`<div class="text-red-400 text-sm rounded bg-red-500/10 p-2">${ssrInterpolate(unref(saveErr))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-end gap-3 pt-1"><button class="btn-secondary">Cancel</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Device")}</button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b;
        if (unref(showFaceModal)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-lg"><div class="flex items-center justify-between mb-5"><h2 class="text-lg font-bold text-white">Enrol Face ID</h2><button class="text-gray-500 hover:text-gray-300 text-xl leading-none">\u2715</button></div>`);
          if (!unref(faceEnrollEmpId)) {
            _push2(`<div class="mb-4"><label class="label">Select Employee</label><select class="input-field w-full"><option value="">Choose employee\u2026</option><!--[-->`);
            ssrRenderList(unref(employees), (e) => {
              _push2(`<option${ssrRenderAttr("value", e.id)}> [${ssrInterpolate(e.id)}] ${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
            });
            _push2(`<!--]--></select></div>`);
          } else {
            _push2(`<div class="mb-3 text-sm text-gray-400"> Enrolling: <span class="text-gray-200 font-semibold">${ssrInterpolate((_a = unref(employees).find((e) => e.id === unref(faceEnrollEmpId))) == null ? void 0 : _a.first_name)} ${ssrInterpolate((_b = unref(employees).find((e) => e.id === unref(faceEnrollEmpId))) == null ? void 0 : _b.last_name)} (#${ssrInterpolate(unref(faceEnrollEmpId))}) </span><button class="ml-2 text-xs text-amber-400 hover:text-amber-300">Change</button></div>`);
          }
          _push2(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showPinModal)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-sm"><h2 class="text-lg font-bold text-white mb-5">Assign Device PIN</h2><div class="space-y-4"><div><label class="label">Device PIN</label><input${ssrRenderAttr("value", unref(pinForm).device_pin)} class="input-field w-full" placeholder="PIN from device"></div><div><label class="label">Employee</label><select class="input-field w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(pinForm).employee_id) ? ssrLooseContain(unref(pinForm).employee_id, "") : ssrLooseEqual(unref(pinForm).employee_id, "")) ? " selected" : ""}>Select employee\u2026</option><!--[-->`);
          ssrRenderList(unref(employees), (e) => {
            _push2(`<option${ssrRenderAttr("value", e.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(pinForm).employee_id) ? ssrLooseContain(unref(pinForm).employee_id, e.id) : ssrLooseEqual(unref(pinForm).employee_id, e.id)) ? " selected" : ""}> [${ssrInterpolate(e.id)}] ${ssrInterpolate(e.first_name)} ${ssrInterpolate(e.last_name)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="flex justify-end gap-3 pt-1"><button class="btn-secondary">Cancel</button><button${ssrIncludeBooleanAttr(!unref(pinForm).employee_id || !unref(pinForm).device_pin) ? " disabled" : ""} class="btn-primary"> Save PIN </button></div></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/biometric.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=biometric-DobZvmzz.mjs.map
