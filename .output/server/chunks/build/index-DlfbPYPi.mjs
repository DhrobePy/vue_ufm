import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute } from './server.mjs';
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
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const phase = ref("init");
    const initMsg = ref("Starting\u2026");
    const errorMsg = ref("");
    const branches = ref([]);
    const branchInfo = ref(null);
    const scanMsg = ref("Looking for face\u2026");
    const scanMsgClass = ref("kiosk-msg-idle");
    const ringClass = ref("");
    const resultData = ref({});
    const recentLogs = ref([]);
    const clockDisplay = ref("");
    const enrolledCount = ref(0);
    ref(null);
    ref(null);
    function actionClass(action) {
      if (action === "clock_in") return "ci";
      if (action === "clock_out") return "co";
      return "ret";
    }
    function actionEmoji(action) {
      if (action === "clock_in") return "\u2705";
      if (action === "clock_out") return "\u{1F44B}";
      return "\u{1F504}";
    }
    function actionText(action) {
      if (action === "clock_in") return "Clocked In";
      if (action === "clock_out") return "Clocked Out";
      return "Welcome Back";
    }
    function actionLabel(action) {
      if (action === "clock_in") return "\u2191 IN";
      if (action === "clock_out") return "\u2193 OUT";
      return "\u21BA BACK";
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "kiosk" }, _attrs))} data-v-132c3945>`);
      if (unref(phase) === "branch") {
        _push(`<div class="kiosk-center" data-v-132c3945><div class="kiosk-logo" data-v-132c3945><span style="${ssrRenderStyle({ "font-size": "52px" })}" data-v-132c3945>\u{1F3E2}</span></div><h2 class="kiosk-title" data-v-132c3945>Select Your Location</h2><p class="kiosk-desc" data-v-132c3945>Choose the branch this kiosk is installed at.</p><div class="kiosk-branch-list" data-v-132c3945><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          _push(`<button class="kiosk-branch-btn" data-v-132c3945><span style="${ssrRenderStyle({ "font-size": "26px" })}" data-v-132c3945>\u{1F4CD}</span><div style="${ssrRenderStyle({ "flex": "1" })}" data-v-132c3945><div style="${ssrRenderStyle({ "font-weight": "700", "font-size": "1rem" })}" data-v-132c3945>${ssrInterpolate(b.name)}</div><div style="${ssrRenderStyle({ "font-size": ".8125rem", "color": "#64748b", "margin-top": "2px" })}" data-v-132c3945>${ssrInterpolate(b.location || "No location set")}</div></div><span style="${ssrRenderStyle({ "color": "#64748b" })}" data-v-132c3945>\u203A</span></button>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (unref(phase) === "init") {
        _push(`<div class="kiosk-center" data-v-132c3945><div class="kiosk-spinner" data-v-132c3945></div><p class="kiosk-msg" style="${ssrRenderStyle({ "margin-top": "12px" })}" data-v-132c3945>${ssrInterpolate(unref(initMsg))}</p>`);
        if (unref(branchInfo)) {
          _push(`<p style="${ssrRenderStyle({ "font-size": ".8125rem", "color": "#64748b", "margin-top": "4px" })}" data-v-132c3945>${ssrInterpolate(unref(branchInfo).name)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (unref(phase) === "error") {
        _push(`<div class="kiosk-center" data-v-132c3945><span style="${ssrRenderStyle({ "font-size": "60px" })}" data-v-132c3945>\u26A0\uFE0F</span><h2 class="kiosk-title" data-v-132c3945>Setup Error</h2><p class="kiosk-desc" style="${ssrRenderStyle({ "color": "#ef4444" })}" data-v-132c3945>${ssrInterpolate(unref(errorMsg))}</p><div style="${ssrRenderStyle({ "display": "flex", "gap": "10px", "margin-top": "12px" })}" data-v-132c3945><button class="kiosk-btn kiosk-btn-outline" data-v-132c3945>Change Branch</button><button class="kiosk-btn" data-v-132c3945>Retry</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="kiosk-scan" style="${ssrRenderStyle(unref(phase) === "scan" ? null : { display: "none" })}" data-v-132c3945><div class="kiosk-header" data-v-132c3945><span style="${ssrRenderStyle({ "font-size": "20px" })}" data-v-132c3945>\u{1F512}</span><div style="${ssrRenderStyle({ "flex": "1" })}" data-v-132c3945><span class="kiosk-brand" data-v-132c3945>FMC-ERP Attendance</span>`);
      if (unref(branchInfo)) {
        _push(`<span style="${ssrRenderStyle({ "font-size": ".75rem", "color": "#64748b", "margin-left": "8px" })}" data-v-132c3945>${ssrInterpolate(unref(branchInfo).name)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><span class="kiosk-time" data-v-132c3945>${ssrInterpolate(unref(clockDisplay))}</span><button class="kiosk-change-btn" title="Change branch" data-v-132c3945>\u21C4</button></div><div class="kiosk-cam-wrap" data-v-132c3945><video class="kiosk-cam" autoplay muted playsinline data-v-132c3945></video><canvas class="kiosk-overlay" data-v-132c3945></canvas><div class="kiosk-scanline" data-v-132c3945></div><div class="${ssrRenderClass([unref(ringClass), "kiosk-ring"])}" data-v-132c3945></div></div><div class="${ssrRenderClass([unref(scanMsgClass), "kiosk-scan-msg"])}" data-v-132c3945>${ssrInterpolate(unref(scanMsg))}</div>`);
      if (unref(recentLogs).length) {
        _push(`<div class="kiosk-recent" data-v-132c3945><!--[-->`);
        ssrRenderList(unref(recentLogs), (log) => {
          _push(`<div class="kiosk-recent-row" data-v-132c3945><span class="kiosk-recent-name" data-v-132c3945>${ssrInterpolate(log.name)}</span><span class="${ssrRenderClass([actionClass(log.action), "kiosk-recent-action"])}" data-v-132c3945>${ssrInterpolate(actionLabel(log.action))}</span><span class="kiosk-recent-time" data-v-132c3945>${ssrInterpolate(log.time)}</span></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(enrolledCount) === 0 && unref(phase) === "scan") {
        _push(`<div class="kiosk-no-enroll" data-v-132c3945> \u2139\uFE0F No face IDs enrolled \u2014 go to <strong data-v-132c3945>HR \u2192 Employees \u2192 Face ID</strong> to enrol staff </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(phase) === "result") {
        _push(`<div class="kiosk-center" data-v-132c3945><div class="${ssrRenderClass([actionClass(unref(resultData).action), "kiosk-result-icon"])}" data-v-132c3945><span style="${ssrRenderStyle({ "font-size": "48px" })}" data-v-132c3945>${ssrInterpolate(actionEmoji(unref(resultData).action))}</span></div><h2 class="kiosk-title" style="${ssrRenderStyle({ "margin-top": "20px" })}" data-v-132c3945>${ssrInterpolate(unref(resultData).name)}</h2><div class="${ssrRenderClass([actionClass(unref(resultData).action), "kiosk-result-action"])}" data-v-132c3945>${ssrInterpolate(unref(resultData).message || actionText(unref(resultData).action))}</div><p class="kiosk-desc" style="${ssrRenderStyle({ "font-size": "1.25rem", "margin-top": "8px" })}" data-v-132c3945>${ssrInterpolate(unref(resultData).time)}</p>`);
        if (unref(resultData).punch_count > 1) {
          _push(`<div style="${ssrRenderStyle({ "margin-top": "6px", "font-size": ".8rem", "opacity": ".6" })}" data-v-132c3945> Punch #${ssrInterpolate(unref(resultData).punch_count)} today `);
          if (unref(resultData).overtime) {
            _push(`<span data-v-132c3945> \xB7 \u23F0 Overtime recorded</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/kiosk/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-132c3945"]]);

export { index as default };
//# sourceMappingURL=index-DlfbPYPi.mjs.map
