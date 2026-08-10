import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, computed, ref, withAsyncContext, reactive, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
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
  __name: "[order]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const orderNum = computed(() => {
      var _a;
      return ((_a = route.params.order) != null ? _a : "").toUpperCase();
    });
    const sig = computed(() => {
      var _a;
      return String((_a = route.query.sig) != null ? _a : "");
    });
    const { user } = useUserSession();
    const myName = computed(() => {
      var _a, _b, _c, _d;
      return (_d = (_c = (_a = user.value) == null ? void 0 : _a.name) != null ? _c : (_b = user.value) == null ? void 0 : _b.display_name) != null ? _d : "";
    });
    const hasHistory = ref(false);
    const { data: orderData, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/verify/${orderNum.value}`,
      { key: `verify-${orderNum.value}`, query: computed(() => ({ sig: sig.value })) },
      "$dn8CKDEqla"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const errorMessage = computed(
      () => {
        var _a, _b, _c;
        return (_c = (_b = (_a = error.value) == null ? void 0 : _a.data) == null ? void 0 : _b.statusMessage) != null ? _c : "Could not verify this code.";
      }
    );
    const stage = computed(() => {
      var _a, _b;
      return (_b = (_a = orderData.value) == null ? void 0 : _a.stage) != null ? _b : "error";
    });
    const gateOut = computed(() => {
      var _a, _b;
      return !!((_b = (_a = orderData.value) == null ? void 0 : _a.confirmation) == null ? void 0 : _b.gate_out_at);
    });
    const delivered = computed(() => {
      var _a, _b;
      return !!((_b = (_a = orderData.value) == null ? void 0 : _a.confirmation) == null ? void 0 : _b.confirmed_at);
    });
    const totalBags = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = orderData.value) == null ? void 0 : _a.items) != null ? _b : []).reduce((s, i) => {
          var _a2;
          return s + Number((_a2 = i.quantity) != null ? _a2 : 0);
        }, 0);
      }
    );
    const gateForm = reactive({ driver_name: "", vehicle_number: "", gate_note: "" });
    const gateSubmitting = ref(false);
    const gateError = ref("");
    const deliverForm = reactive({ received_by: "", note: "" });
    const deliverSubmitting = ref(false);
    const deliverError = ref("");
    function formatDateTime(d) {
      if (!d) return "\u2014";
      try {
        return new Date(d).toLocaleString("en-BD", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
      } catch {
        return d;
      }
    }
    function fmtNum(n) {
      return Number(n != null ? n : 0).toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
      const _component_UiBackButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "min-h-screen",
        style: { "background": "#0e0c0a", "font-family": "'Inter',sans-serif" }
      }, _attrs))} data-v-280ad482><div style="${ssrRenderStyle({ "background": "rgba(20,16,10,0.97)", "border-bottom": "1px solid rgba(255,255,255,0.08)", "padding": "14px 20px", "display": "flex", "align-items": "center", "gap": "12px" })}" data-v-280ad482>`);
      if (unref(hasHistory)) {
        _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle({ "width": "32px", "height": "32px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "border-radius": "8px", "display": "flex", "align-items": "center", "justify-content": "center", "font-size": "16px", "flex-shrink": "0" })}" data-v-280ad482>\u{1F3ED}</div><div data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#e5e7eb" })}" data-v-280ad482>Ujjal FMC \u2014 Gate Pass &amp; Delivery</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280" })}" data-v-280ad482>Two-stage QR verification</div></div></div>`);
      if (unref(pending)) {
        _push(`<div style="${ssrRenderStyle({ "padding": "60px 24px", "text-align": "center" })}" data-v-280ad482><div style="${ssrRenderStyle({ "width": "40px", "height": "40px", "border": "3px solid rgba(245,158,11,0.2)", "border-top-color": "#f59e0b", "border-radius": "50%", "animation": "spin 0.8s linear infinite", "margin": "0 auto 16px" })}" data-v-280ad482></div><p style="${ssrRenderStyle({ "color": "#6b7280", "font-size": "13px" })}" data-v-280ad482>Loading order\u2026</p></div>`);
      } else if (unref(error) || !unref(orderData)) {
        _push(`<div style="${ssrRenderStyle({ "padding": "20px", "max-width": "480px", "margin": "0 auto" })}" data-v-280ad482><div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(255,255,255,0.08)", "border-radius": "16px", "overflow": "hidden" })}" data-v-280ad482><div style="${ssrRenderStyle({ "background": "#dc2626", "color": "#fff", "padding": "24px", "text-align": "center" })}" data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "40px", "margin-bottom": "8px" })}" data-v-280ad482>\u2715</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "700" })}" data-v-280ad482>Not Verified</div></div><div style="${ssrRenderStyle({ "padding": "20px", "text-align": "center", "font-size": "13px", "color": "#9ca3af" })}" data-v-280ad482>${ssrInterpolate(unref(errorMessage))}</div></div></div>`);
      } else {
        _push(`<div style="${ssrRenderStyle({ "padding": "20px", "max-width": "480px", "margin": "0 auto" })}" data-v-280ad482><div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(255,255,255,0.08)", "border-radius": "16px", "overflow": "hidden", "margin-bottom": "16px" })}" data-v-280ad482>`);
        if (unref(stage) === "done") {
          _push(`<div style="${ssrRenderStyle({ "background": "#374151", "color": "#fff", "padding": "22px", "text-align": "center" })}" data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "36px", "margin-bottom": "4px" })}" data-v-280ad482>\u2713</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "700" })}" data-v-280ad482>COMPLETED</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#d1d5db", "margin-top": "2px" })}" data-v-280ad482>Gate pass &amp; delivery both recorded.</div></div>`);
        } else if (unref(stage) === "delivery") {
          _push(`<div style="${ssrRenderStyle({ "background": "#16a34a", "color": "#fff", "padding": "22px", "text-align": "center" })}" data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "36px", "margin-bottom": "4px" })}" data-v-280ad482>\u{1F4E6}</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "700" })}" data-v-280ad482>CONFIRM DELIVERY</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#dcfce7", "margin-top": "2px" })}" data-v-280ad482>Goods already left the gate \u2014 confirm the customer received them.</div></div>`);
        } else if (!unref(orderData).dispatch_ok) {
          _push(`<div style="${ssrRenderStyle({ "background": "#dc2626", "color": "#fff", "padding": "22px", "text-align": "center" })}" data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "36px", "margin-bottom": "4px" })}" data-v-280ad482>\u26D4</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "700" })}" data-v-280ad482>HELD \u2014 DO NOT RELEASE</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#fecaca", "margin-top": "2px" })}" data-v-280ad482>This order is not cleared for dispatch.</div></div>`);
        } else {
          _push(`<div style="${ssrRenderStyle({ "background": "#2563eb", "color": "#fff", "padding": "22px", "text-align": "center" })}" data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "36px", "margin-bottom": "4px" })}" data-v-280ad482>\u{1F6AA}</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "700" })}" data-v-280ad482>GATE PASS</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#dbeafe", "margin-top": "2px" })}" data-v-280ad482>Verify the load &amp; driver, then release the goods.</div></div>`);
        }
        if (unref(orderData).is_reuse) {
          _push(`<div style="${ssrRenderStyle({ "margin": "12px 14px 0", "padding": "10px 12px", "border-radius": "10px", "background": "rgba(220,38,38,0.12)", "border": "1px solid rgba(220,38,38,0.3)", "color": "#fca5a5", "font-size": "11.5px" })}" data-v-280ad482> \u26A0 <strong data-v-280ad482>This QR has already been used.</strong> Scanned ${ssrInterpolate(unref(orderData).scan_total)} time(s) \u2014 admins have been notified. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div style="${ssrRenderStyle({ "padding": "16px", "border-top": "1px solid rgba(255,255,255,0.06)", "font-size": "13px" })}" data-v-280ad482><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0" })}" data-v-280ad482><span style="${ssrRenderStyle({ "color": "#6b7280" })}" data-v-280ad482>Invoice No.</span><span style="${ssrRenderStyle({ "font-weight": "700", "color": "#e5e7eb", "font-family": "monospace" })}" data-v-280ad482>${ssrInterpolate(unref(orderData).order.order_number)}</span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0" })}" data-v-280ad482><span style="${ssrRenderStyle({ "color": "#6b7280" })}" data-v-280ad482>Customer</span><span style="${ssrRenderStyle({ "color": "#d1d5db", "font-weight": "600" })}" data-v-280ad482>${ssrInterpolate(unref(orderData).order.customer_name)}</span></div>`);
        if (unref(orderData).order.branch_name) {
          _push(`<div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0" })}" data-v-280ad482><span style="${ssrRenderStyle({ "color": "#6b7280" })}" data-v-280ad482>From</span><span style="${ssrRenderStyle({ "color": "#d1d5db" })}" data-v-280ad482>${ssrInterpolate(unref(orderData).order.branch_name)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div style="${ssrRenderStyle({ "padding": "0 16px 12px", "display": "flex", "align-items": "center", "gap": "8px" })}" data-v-280ad482><span style="${ssrRenderStyle(`padding:3px 10px;border-radius:20px;font-size:10.5px;font-weight:700;${unref(gateOut) ? "background:rgba(74,222,128,0.15);color:#4ade80;" : "background:rgba(96,165,250,0.15);color:#60a5fa;"}`)}" data-v-280ad482>${ssrInterpolate(unref(gateOut) ? "\u2713 Gate out" : "1 \xB7 Gate out")}</span><span style="${ssrRenderStyle({ "color": "#4b5563", "font-size": "12px" })}" data-v-280ad482>\u2192</span><span style="${ssrRenderStyle(`padding:3px 10px;border-radius:20px;font-size:10.5px;font-weight:700;${unref(delivered) ? "background:rgba(74,222,128,0.15);color:#4ade80;" : "background:rgba(156,163,175,0.15);color:#6b7280;"}`)}" data-v-280ad482>${ssrInterpolate(unref(delivered) ? "\u2713 Delivered" : "2 \xB7 Delivered")}</span></div>`);
        if ((_a = unref(orderData).items) == null ? void 0 : _a.length) {
          _push(`<div style="${ssrRenderStyle({ "padding": "12px 16px", "border-top": "1px solid rgba(255,255,255,0.06)" })}" data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "11px", "font-weight": "600", "color": "#6b7280", "text-transform": "uppercase", "letter-spacing": "0.5px", "margin-bottom": "8px" })}" data-v-280ad482>Items (${ssrInterpolate(unref(totalBags))} bags)</div><!--[-->`);
          ssrRenderList(unref(orderData).items, (it, i) => {
            _push(`<div style="${ssrRenderStyle([{ "display": "flex", "justify-content": "space-between", "padding": "6px 0", "font-size": "12.5px" }, i < unref(orderData).items.length - 1 ? "border-bottom:1px solid rgba(255,255,255,0.04);" : ""])}" data-v-280ad482><span style="${ssrRenderStyle({ "color": "#e5e7eb" })}" data-v-280ad482>${ssrInterpolate(it.product_name)}`);
            if (it.weight_variant) {
              _push(`<span style="${ssrRenderStyle({ "color": "#9ca3af" })}" data-v-280ad482> \xB7 ${ssrInterpolate(it.weight_variant)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</span><span style="${ssrRenderStyle({ "color": "#fbbf24", "font-weight": "700" })}" data-v-280ad482>${ssrInterpolate(fmtNum(it.quantity))} bags</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(stage) === "gate" && unref(orderData).dispatch_ok) {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(37,99,235,0.06)", "border": "1px solid rgba(37,99,235,0.2)", "border-radius": "16px", "padding": "20px", "margin-bottom": "16px" })}" data-v-280ad482>`);
          if (!unref(orderData).can_gate) {
            _push(`<div style="${ssrRenderStyle({ "text-align": "center", "font-size": "12.5px", "color": "#9ca3af" })}" data-v-280ad482> Your account is not authorised to release goods at the gate. </div>`);
          } else {
            _push(`<form style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "gap": "10px" })}" data-v-280ad482><div data-v-280ad482><label style="${ssrRenderStyle({ "display": "block", "font-size": "11px", "font-weight": "600", "color": "#9ca3af", "margin-bottom": "4px" })}" data-v-280ad482>Driver name *</label><input${ssrRenderAttr("value", unref(gateForm).driver_name)} required maxlength="150" placeholder="Driver at the gate" style="${ssrRenderStyle({ "width": "100%", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)", "border-radius": "10px", "padding": "10px 12px", "color": "#e5e7eb", "font-size": "13px", "outline": "none" })}" data-v-280ad482></div><div data-v-280ad482><label style="${ssrRenderStyle({ "display": "block", "font-size": "11px", "font-weight": "600", "color": "#9ca3af", "margin-bottom": "4px" })}" data-v-280ad482>Vehicle / Truck no. *</label><input${ssrRenderAttr("value", unref(gateForm).vehicle_number)} required maxlength="100" placeholder="Vehicle leaving the gate" style="${ssrRenderStyle({ "width": "100%", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)", "border-radius": "10px", "padding": "10px 12px", "color": "#e5e7eb", "font-size": "13px", "outline": "none" })}" data-v-280ad482></div><input${ssrRenderAttr("value", unref(gateForm).gate_note)} maxlength="500" placeholder="Gate note (optional \u2014 e.g. seal no.)" style="${ssrRenderStyle({ "width": "100%", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)", "border-radius": "10px", "padding": "10px 12px", "color": "#e5e7eb", "font-size": "13px", "outline": "none" })}" data-v-280ad482>`);
            if (unref(gateError)) {
              _push(`<p style="${ssrRenderStyle({ "color": "#f87171", "font-size": "12px", "text-align": "center" })}" data-v-280ad482>${ssrInterpolate(unref(gateError))}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(gateSubmitting)) ? " disabled" : ""} style="${ssrRenderStyle([{ "width": "100%", "padding": "12px", "border-radius": "12px", "background": "linear-gradient(135deg,#2563eb,#1d4ed8)", "color": "#fff", "font-size": "14px", "font-weight": "700", "border": "none", "cursor": "pointer" }, unref(gateSubmitting) ? "opacity:0.5;cursor:not-allowed" : ""])}" data-v-280ad482>${ssrInterpolate(unref(gateSubmitting) ? "Releasing\u2026" : "\u{1F6AA} Confirm Gate Pass (release goods)")}</button><p style="${ssrRenderStyle({ "font-size": "10.5px", "color": "#6b7280", "text-align": "center" })}" data-v-280ad482>Releasing as <strong data-v-280ad482>${ssrInterpolate(unref(myName))}</strong>.</p></form>`);
          }
          _push(`</div>`);
        } else if (unref(stage) === "gate" && !unref(orderData).dispatch_ok) {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(220,38,38,0.06)", "border": "1px solid rgba(220,38,38,0.2)", "border-radius": "16px", "padding": "18px", "margin-bottom": "16px", "font-size": "12.5px", "color": "#fca5a5" })}" data-v-280ad482> \u{1F512} This order is <strong data-v-280ad482>held</strong>. It cannot leave until Accounts/Admin clears the dispatch hold in Payment Watch. </div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage) === "delivery") {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(22,163,74,0.06)", "border": "1px solid rgba(22,163,74,0.2)", "border-radius": "16px", "padding": "20px", "margin-bottom": "16px" })}" data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "11.5px", "color": "#6b7280", "margin-bottom": "12px" })}" data-v-280ad482> Released at gate by <strong style="${ssrRenderStyle({ "color": "#9ca3af" })}" data-v-280ad482>${ssrInterpolate((_c = (_b = unref(orderData).confirmation) == null ? void 0 : _b.gate_out_by_name) != null ? _c : "staff")}</strong> on ${ssrInterpolate(formatDateTime((_d = unref(orderData).confirmation) == null ? void 0 : _d.gate_out_at))} `);
          if ((_e = unref(orderData).confirmation) == null ? void 0 : _e.driver_name) {
            _push(`<!--[--> \xB7 Driver ${ssrInterpolate(unref(orderData).confirmation.driver_name)} \xB7 Vehicle ${ssrInterpolate(unref(orderData).confirmation.vehicle_number)}<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (!unref(orderData).can_deliver) {
            _push(`<div style="${ssrRenderStyle({ "text-align": "center", "font-size": "12.5px", "color": "#9ca3af" })}" data-v-280ad482> Waiting for an authorised staff member to confirm delivery. </div>`);
          } else {
            _push(`<form style="${ssrRenderStyle({ "display": "flex", "flex-direction": "column", "gap": "10px" })}" data-v-280ad482><input${ssrRenderAttr("value", unref(deliverForm).received_by)} maxlength="150" placeholder="Received by (customer name, optional)" style="${ssrRenderStyle({ "width": "100%", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)", "border-radius": "10px", "padding": "10px 12px", "color": "#e5e7eb", "font-size": "13px", "outline": "none" })}" data-v-280ad482><input${ssrRenderAttr("value", unref(deliverForm).note)} maxlength="500" placeholder="Note (optional)" style="${ssrRenderStyle({ "width": "100%", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)", "border-radius": "10px", "padding": "10px 12px", "color": "#e5e7eb", "font-size": "13px", "outline": "none" })}" data-v-280ad482>`);
            if (unref(deliverError)) {
              _push(`<p style="${ssrRenderStyle({ "color": "#f87171", "font-size": "12px", "text-align": "center" })}" data-v-280ad482>${ssrInterpolate(unref(deliverError))}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<button type="submit"${ssrIncludeBooleanAttr(unref(deliverSubmitting)) ? " disabled" : ""} style="${ssrRenderStyle([{ "width": "100%", "padding": "12px", "border-radius": "12px", "background": "linear-gradient(135deg,#16a34a,#15803d)", "color": "#fff", "font-size": "14px", "font-weight": "700", "border": "none", "cursor": "pointer" }, unref(deliverSubmitting) ? "opacity:0.5;cursor:not-allowed" : ""])}" data-v-280ad482>${ssrInterpolate(unref(deliverSubmitting) ? "Confirming\u2026" : "\u2713 Confirm Delivery")}</button><p style="${ssrRenderStyle({ "font-size": "10.5px", "color": "#6b7280", "text-align": "center" })}" data-v-280ad482>Confirming as <strong data-v-280ad482>${ssrInterpolate(unref(myName))}</strong>.</p></form>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(stage) === "done") {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.07)", "border-radius": "16px", "padding": "18px", "margin-bottom": "16px", "font-size": "12.5px" })}" data-v-280ad482><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0" })}" data-v-280ad482><span style="${ssrRenderStyle({ "color": "#6b7280" })}" data-v-280ad482>Gate out</span><span style="${ssrRenderStyle({ "color": "#d1d5db" })}" data-v-280ad482>${ssrInterpolate((_g = (_f = unref(orderData).confirmation) == null ? void 0 : _f.gate_out_by_name) != null ? _g : "\u2014")} \xB7 ${ssrInterpolate(formatDateTime((_h = unref(orderData).confirmation) == null ? void 0 : _h.gate_out_at))}</span></div><div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0" })}" data-v-280ad482><span style="${ssrRenderStyle({ "color": "#6b7280" })}" data-v-280ad482>Delivered</span><span style="${ssrRenderStyle({ "color": "#d1d5db" })}" data-v-280ad482>${ssrInterpolate((_j = (_i = unref(orderData).confirmation) == null ? void 0 : _i.confirmed_by_name) != null ? _j : "\u2014")} \xB7 ${ssrInterpolate(formatDateTime((_k = unref(orderData).confirmation) == null ? void 0 : _k.confirmed_at))}</span></div>`);
          if ((_l = unref(orderData).confirmation) == null ? void 0 : _l.received_by) {
            _push(`<div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0" })}" data-v-280ad482><span style="${ssrRenderStyle({ "color": "#6b7280" })}" data-v-280ad482>Received by</span><span style="${ssrRenderStyle({ "color": "#d1d5db" })}" data-v-280ad482>${ssrInterpolate(unref(orderData).confirmation.received_by)}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "padding": "4px 0" })}" data-v-280ad482><span style="${ssrRenderStyle({ "color": "#6b7280" })}" data-v-280ad482>QR scanned</span><span style="${ssrRenderStyle(unref(orderData).scan_total > 2 ? "color:#f87171;font-weight:700;" : "color:#d1d5db;")}" data-v-280ad482>${ssrInterpolate(unref(orderData).scan_total)} time(s)</span></div><p style="${ssrRenderStyle({ "font-size": "10.5px", "color": "#f59e0b", "margin-top": "8px" })}" data-v-280ad482>\u{1F512} This order is locked \u2014 it cannot be delivered again.</p></div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_m = unref(orderData).scans) == null ? void 0 : _m.length) {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.07)", "border-radius": "16px", "padding": "16px", "margin-bottom": "16px" })}" data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "11px", "font-weight": "600", "color": "#6b7280", "text-transform": "uppercase", "letter-spacing": "0.5px", "margin-bottom": "10px" })}" data-v-280ad482>Scan History</div><!--[-->`);
          ssrRenderList(unref(orderData).scans.slice(0, 10), (s, i) => {
            _push(`<div style="${ssrRenderStyle([{ "display": "flex", "align-items": "center", "justify-content": "space-between", "padding": "7px 0" }, i < unref(orderData).scans.length - 1 ? "border-bottom:1px solid rgba(255,255,255,0.04);" : ""])}" data-v-280ad482><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "8px" })}" data-v-280ad482><span style="${ssrRenderStyle({ "font-size": "13px" })}" data-v-280ad482>${ssrInterpolate(s.stage === "gate" ? "\u{1F6AA}" : s.stage === "delivery" ? "\u{1F4E6}" : "\u2713")}</span><div data-v-280ad482><div style="${ssrRenderStyle({ "font-size": "11.5px", "color": "#d1d5db", "font-weight": "500", "text-transform": "capitalize" })}" data-v-280ad482>${ssrInterpolate(s.stage)}`);
            if (s.reused) {
              _push(`<span style="${ssrRenderStyle({ "color": "#f87171" })}" data-v-280ad482> (reuse)</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div style="${ssrRenderStyle({ "font-size": "9.5px", "color": "#6b7280" })}" data-v-280ad482>${ssrInterpolate(s.scanned_by_name)} \xB7 ${ssrInterpolate(formatDateTime(s.scanned_at))}</div></div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div style="${ssrRenderStyle({ "text-align": "center", "padding": "16px 0 32px" })}" data-v-280ad482><p style="${ssrRenderStyle({ "font-size": "10px", "color": "#4b5563" })}" data-v-280ad482>Powered by Ujjal FMC ERP \xA0\xB7\xA0 ${ssrInterpolate(unref(orderData).order.order_number)}</p></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/d/[order].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _order_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-280ad482"]]);

export { _order_ as default };
//# sourceMappingURL=_order_-C5Vb6H3z.mjs.map
