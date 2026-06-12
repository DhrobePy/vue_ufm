import { defineComponent, computed, withAsyncContext, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
    const { data: orderData, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/verify/${orderNum.value}`,
      { key: `verify-${orderNum.value}` },
      "$dn8CKDEqla"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const pinInput = ref("");
    const pinError = ref("");
    const confirming = ref(false);
    const confirmSuccess = ref(false);
    const confirmMessage = ref("");
    const showPinEntry = ref(false);
    const { data: canDeliverData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/verify/can-deliver",
      "$Bo_50qgMgy"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const canDeliver = computed(() => {
      var _a;
      return ((_a = canDeliverData.value) == null ? void 0 : _a.allowed) === true;
    });
    const deliverUserName = computed(() => {
      var _a, _b;
      return (_b = (_a = canDeliverData.value) == null ? void 0 : _a.user_name) != null ? _b : "";
    });
    const deliverArmed = ref(false);
    const delivering = ref(false);
    const deliverSuccess = ref(false);
    const deliverMessage = ref("");
    const deliverError = ref("");
    const canConfirmDispatch = computed(
      () => {
        var _a, _b, _c, _d;
        return ((_b = (_a = orderData.value) == null ? void 0 : _a.order) == null ? void 0 : _b.status) === "ready_to_ship" && ((_d = (_c = orderData.value) == null ? void 0 : _c.order) == null ? void 0 : _d.has_dispatch_pin);
      }
    );
    const statusLabel = computed(() => {
      var _a, _b, _c, _d;
      const s = (_c = (_b = (_a = orderData.value) == null ? void 0 : _a.order) == null ? void 0 : _b.status) != null ? _c : "";
      const map = {
        pending_approval: "Pending Approval",
        escalated: "Escalated",
        approved: "Approved",
        in_production: "In Production",
        produced: "Produced",
        ready_to_ship: "Ready to Ship",
        dispatched: "Dispatched",
        delivered: "Delivered",
        completed: "Completed",
        cancelled: "Cancelled",
        rejected: "Rejected"
      };
      return (_d = map[s]) != null ? _d : s;
    });
    const statusStyle = computed(() => {
      var _a, _b, _c;
      const s = (_c = (_b = (_a = orderData.value) == null ? void 0 : _a.order) == null ? void 0 : _b.status) != null ? _c : "";
      if (s === "delivered" || s === "completed") return "background:rgba(74,222,128,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.3);";
      if (s === "dispatched") return "background:rgba(96,165,250,0.15);color:#60a5fa;border:1px solid rgba(96,165,250,0.3);";
      if (s === "ready_to_ship") return "background:rgba(167,139,250,0.15);color:#a78bfa;border:1px solid rgba(167,139,250,0.3);";
      if (s === "in_production" || s === "produced") return "background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3);";
      if (s === "cancelled" || s === "rejected") return "background:rgba(248,113,113,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.3);";
      if (s === "escalated") return "background:rgba(251,146,60,0.15);color:#fb923c;border:1px solid rgba(251,146,60,0.3);";
      return "background:rgba(156,163,175,0.15);color:#9ca3af;border:1px solid rgba(156,163,175,0.3);";
    });
    function formatDate(d) {
      if (!d) return "\u2014";
      try {
        return new Date(d).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" });
      } catch {
        return d;
      }
    }
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
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "min-h-screen",
        style: { "background": "#0e0c0a", "font-family": "'Inter',sans-serif" }
      }, _attrs))} data-v-a2ea1ed7><div style="${ssrRenderStyle({ "background": "rgba(20,16,10,0.97)", "border-bottom": "1px solid rgba(255,255,255,0.08)", "padding": "14px 20px", "display": "flex", "align-items": "center", "gap": "12px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "width": "32px", "height": "32px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "border-radius": "8px", "display": "flex", "align-items": "center", "justify-content": "center", "font-size": "16px", "flex-shrink": "0" })}" data-v-a2ea1ed7>\u{1F3ED}</div><div data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "13px", "font-weight": "700", "color": "#e5e7eb" })}" data-v-a2ea1ed7>Ujjal FMC \u2014 Delivery Verification</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#6b7280" })}" data-v-a2ea1ed7>Scan &amp; confirm goods dispatch</div></div></div>`);
      if (unref(pending)) {
        _push(`<div style="${ssrRenderStyle({ "padding": "60px 24px", "text-align": "center" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "width": "40px", "height": "40px", "border": "3px solid rgba(245,158,11,0.2)", "border-top-color": "#f59e0b", "border-radius": "50%", "animation": "spin 0.8s linear infinite", "margin": "0 auto 16px" })}" data-v-a2ea1ed7></div><p style="${ssrRenderStyle({ "color": "#6b7280", "font-size": "13px" })}" data-v-a2ea1ed7>Loading order\u2026</p></div>`);
      } else if (unref(error) || !unref(orderData)) {
        _push(`<div style="${ssrRenderStyle({ "padding": "48px 24px", "text-align": "center" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "48px", "margin-bottom": "12px" })}" data-v-a2ea1ed7>\u274C</div><p style="${ssrRenderStyle({ "color": "#f87171", "font-size": "15px", "font-weight": "600" })}" data-v-a2ea1ed7>Order Not Found</p><p style="${ssrRenderStyle({ "color": "#6b7280", "font-size": "12px", "margin-top": "6px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(route).params.order)} \u2014 no matching order in the system.</p></div>`);
      } else {
        _push(`<div style="${ssrRenderStyle({ "padding": "20px", "max-width": "480px", "margin": "0 auto" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(255,255,255,0.08)", "border-radius": "16px", "padding": "20px", "margin-bottom": "16px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "display": "flex", "align-items": "flex-start", "justify-content": "space-between", "gap": "12px" })}" data-v-a2ea1ed7><div data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "18px", "font-weight": "700", "color": "#e5e7eb", "letter-spacing": "0.5px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(orderData).order.order_number)}</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#9ca3af", "margin-top": "2px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(orderData).order.customer_name)} \xB7 ${ssrInterpolate(unref(orderData).order.branch_name)}</div></div><div style="${ssrRenderStyle(`padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;${unref(statusStyle)}`)}" data-v-a2ea1ed7>${ssrInterpolate(unref(statusLabel))}</div></div><div style="${ssrRenderStyle({ "margin-top": "14px", "display": "grid", "grid-template-columns": "1fr 1fr", "gap": "10px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border-radius": "10px", "padding": "10px 12px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280", "text-transform": "uppercase", "letter-spacing": "0.5px" })}" data-v-a2ea1ed7>Order Date</div><div style="${ssrRenderStyle({ "font-size": "13px", "color": "#d1d5db", "font-weight": "600", "margin-top": "2px" })}" data-v-a2ea1ed7>${ssrInterpolate(formatDate(unref(orderData).order.order_date))}</div></div><div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border-radius": "10px", "padding": "10px 12px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280", "text-transform": "uppercase", "letter-spacing": "0.5px" })}" data-v-a2ea1ed7>Required By</div><div style="${ssrRenderStyle({ "font-size": "13px", "color": "#d1d5db", "font-weight": "600", "margin-top": "2px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(orderData).order.required_date ? formatDate(unref(orderData).order.required_date) : "\u2014")}</div></div><div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border-radius": "10px", "padding": "10px 12px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280", "text-transform": "uppercase", "letter-spacing": "0.5px" })}" data-v-a2ea1ed7>Total Amount</div><div style="${ssrRenderStyle({ "font-size": "13px", "color": "#d1d5db", "font-weight": "600", "margin-top": "2px" })}" data-v-a2ea1ed7>\u09F3${ssrInterpolate(fmtNum(unref(orderData).order.total_amount))}</div></div><div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border-radius": "10px", "padding": "10px 12px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280", "text-transform": "uppercase", "letter-spacing": "0.5px" })}" data-v-a2ea1ed7>Balance Due</div><div style="${ssrRenderStyle(`font-size:13px;font-weight:600;margin-top:2px;${unref(orderData).order.balance_due > 0 ? "color:#f87171" : "color:#4ade80"}`)}" data-v-a2ea1ed7>\u09F3${ssrInterpolate(fmtNum(unref(orderData).order.balance_due))}</div></div></div></div>`);
        if (unref(canConfirmDispatch) || unref(orderData).order.status === "dispatched") {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.05)", "border": "1px solid rgba(245,158,11,0.2)", "border-radius": "16px", "padding": "20px", "margin-bottom": "16px" })}" data-v-a2ea1ed7>`);
          if (unref(orderData).order.status === "dispatched" && !unref(confirmSuccess)) {
            _push(`<div data-v-a2ea1ed7><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "10px", "margin-bottom": "12px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "24px" })}" data-v-a2ea1ed7>\u{1F69A}</div><div data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "14px", "font-weight": "700", "color": "#fbbf24" })}" data-v-a2ea1ed7>Order Dispatched</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#9ca3af" })}" data-v-a2ea1ed7>Goods have left the warehouse. You can re-scan to verify.</div></div></div><button style="${ssrRenderStyle({ "width": "100%", "padding": "10px", "border-radius": "10px", "background": "rgba(245,158,11,0.1)", "border": "1px solid rgba(245,158,11,0.25)", "color": "#fbbf24", "font-size": "12px", "font-weight": "600", "cursor": "pointer" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(showPinEntry) ? "\u2191 Hide PIN entry" : "\u{1F522} Re-scan with PIN")}</button></div>`);
          } else if (unref(canConfirmDispatch) && !unref(confirmSuccess)) {
            _push(`<div data-v-a2ea1ed7><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "10px", "margin-bottom": "14px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "24px" })}" data-v-a2ea1ed7>\u{1F4E6}</div><div data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "14px", "font-weight": "700", "color": "#fbbf24" })}" data-v-a2ea1ed7>Confirm Dispatch</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#9ca3af" })}" data-v-a2ea1ed7>Enter the 6-digit PIN from the invoice to confirm goods dispatch.</div></div></div><div style="${ssrRenderStyle([{ "margin-bottom": "1px" }, unref(showPinEntry) ? "" : "display:none"])}" data-v-a2ea1ed7></div><div style="${ssrRenderStyle(unref(showPinEntry) || unref(canConfirmDispatch) ? "" : "display:none")}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "margin-bottom": "12px" })}" data-v-a2ea1ed7><input${ssrRenderAttr("value", unref(pinInput))} type="number" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="6-digit PIN" style="${ssrRenderStyle({ "flex": "1", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)", "border-radius": "10px", "padding": "11px 14px", "color": "#e5e7eb", "font-size": "18px", "font-weight": "700", "letter-spacing": "4px", "font-family": "monospace", "outline": "none", "text-align": "center" })}"${ssrIncludeBooleanAttr(unref(confirming)) ? " disabled" : ""} data-v-a2ea1ed7></div>`);
            if (unref(pinError)) {
              _push(`<p style="${ssrRenderStyle({ "color": "#f87171", "font-size": "12px", "text-align": "center", "margin-bottom": "10px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(pinError))}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<button${ssrIncludeBooleanAttr(unref(confirming) || !unref(pinInput)) ? " disabled" : ""} style="${ssrRenderStyle([{ "width": "100%", "padding": "12px", "border-radius": "12px", "background": "linear-gradient(135deg,#f59e0b,#d97706)", "color": "#000", "font-size": "14px", "font-weight": "700", "border": "none", "cursor": "pointer", "transition": "opacity 0.15s" }, unref(confirming) || !unref(pinInput) ? "opacity:0.5;cursor:not-allowed" : ""])}" data-v-a2ea1ed7>`);
            if (unref(confirming)) {
              _push(`<span data-v-a2ea1ed7>Verifying\u2026</span>`);
            } else {
              _push(`<span data-v-a2ea1ed7>\u2713 Confirm Dispatch</span>`);
            }
            _push(`</button></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(confirmSuccess)) {
            _push(`<div style="${ssrRenderStyle({ "text-align": "center", "padding": "8px 0" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "48px", "margin-bottom": "10px" })}" data-v-a2ea1ed7>\u2705</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "700", "color": "#4ade80", "margin-bottom": "6px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(confirmMessage))}</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#6b7280" })}" data-v-a2ea1ed7>Order status has been updated.</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(orderData).order.status === "dispatched" && unref(canDeliver) && !unref(deliverSuccess)) {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(74,222,128,0.05)", "border": "1px solid rgba(74,222,128,0.2)", "border-radius": "16px", "padding": "20px", "margin-bottom": "16px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "10px", "margin-bottom": "14px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "24px" })}" data-v-a2ea1ed7>\u2705</div><div data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "14px", "font-weight": "700", "color": "#4ade80" })}" data-v-a2ea1ed7>Confirm Final Delivery</div><div style="${ssrRenderStyle({ "font-size": "11px", "color": "#9ca3af" })}" data-v-a2ea1ed7>Logged in as ${ssrInterpolate(unref(deliverUserName))}. This records the full delivery, posts it to the customer ledger and marks the order delivered.</div></div></div>`);
          if (unref(deliverError)) {
            _push(`<p style="${ssrRenderStyle({ "color": "#f87171", "font-size": "12px", "text-align": "center", "margin-bottom": "10px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(deliverError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(deliverArmed)) {
            _push(`<button style="${ssrRenderStyle({ "width": "100%", "padding": "12px", "border-radius": "12px", "background": "rgba(74,222,128,0.12)", "border": "1px solid rgba(74,222,128,0.3)", "color": "#4ade80", "font-size": "14px", "font-weight": "700", "cursor": "pointer" })}" data-v-a2ea1ed7> \u{1F69A} Confirm Delivery\u2026 </button>`);
          } else {
            _push(`<div style="${ssrRenderStyle({ "display": "flex", "gap": "8px" })}" data-v-a2ea1ed7><button${ssrIncludeBooleanAttr(unref(delivering)) ? " disabled" : ""} style="${ssrRenderStyle({ "flex": "1", "padding": "12px", "border-radius": "12px", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)", "color": "#9ca3af", "font-size": "13px", "font-weight": "600", "cursor": "pointer" })}" data-v-a2ea1ed7> Cancel </button><button${ssrIncludeBooleanAttr(unref(delivering)) ? " disabled" : ""} style="${ssrRenderStyle([{ "flex": "2", "padding": "12px", "border-radius": "12px", "background": "linear-gradient(135deg,#22c55e,#16a34a)", "color": "#fff", "font-size": "13px", "font-weight": "700", "border": "none", "cursor": "pointer" }, unref(delivering) ? "opacity:0.5;cursor:not-allowed" : ""])}" data-v-a2ea1ed7>`);
            if (unref(delivering)) {
              _push(`<span data-v-a2ea1ed7>Recording delivery\u2026</span>`);
            } else {
              _push(`<span data-v-a2ea1ed7>\u2713 Yes, mark as delivered</span>`);
            }
            _push(`</button></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(deliverSuccess)) {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(74,222,128,0.05)", "border": "1px solid rgba(74,222,128,0.2)", "border-radius": "16px", "padding": "24px", "margin-bottom": "16px", "text-align": "center" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "48px", "margin-bottom": "10px" })}" data-v-a2ea1ed7>\u{1F389}</div><div style="${ssrRenderStyle({ "font-size": "16px", "font-weight": "700", "color": "#4ade80", "margin-bottom": "6px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(deliverMessage))}</div><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#6b7280" })}" data-v-a2ea1ed7>Ledger updated \xB7 order marked as delivered.</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(orderData).order.status === "dispatched" && unref(showPinEntry) && !unref(confirmSuccess)) {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.08)", "border-radius": "16px", "padding": "20px", "margin-bottom": "16px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "display": "flex", "gap": "8px", "margin-bottom": "12px" })}" data-v-a2ea1ed7><input${ssrRenderAttr("value", unref(pinInput))} type="number" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="6-digit PIN" style="${ssrRenderStyle({ "flex": "1", "background": "rgba(255,255,255,0.06)", "border": "1px solid rgba(255,255,255,0.12)", "border-radius": "10px", "padding": "11px 14px", "color": "#e5e7eb", "font-size": "18px", "font-weight": "700", "letter-spacing": "4px", "font-family": "monospace", "outline": "none", "text-align": "center" })}"${ssrIncludeBooleanAttr(unref(confirming)) ? " disabled" : ""} data-v-a2ea1ed7></div>`);
          if (unref(pinError)) {
            _push(`<p style="${ssrRenderStyle({ "color": "#f87171", "font-size": "12px", "text-align": "center", "margin-bottom": "10px" })}" data-v-a2ea1ed7>${ssrInterpolate(unref(pinError))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button${ssrIncludeBooleanAttr(unref(confirming) || !unref(pinInput)) ? " disabled" : ""} style="${ssrRenderStyle([{ "width": "100%", "padding": "12px", "border-radius": "12px", "background": "rgba(245,158,11,0.15)", "border": "1px solid rgba(245,158,11,0.3)", "color": "#fbbf24", "font-size": "13px", "font-weight": "600", "cursor": "pointer" }, unref(confirming) || !unref(pinInput) ? "opacity:0.5;cursor:not-allowed" : ""])}" data-v-a2ea1ed7>`);
          if (unref(confirming)) {
            _push(`<span data-v-a2ea1ed7>Verifying\u2026</span>`);
          } else {
            _push(`<span data-v-a2ea1ed7>\u{1F522} Verify PIN</span>`);
          }
          _push(`</button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(orderData).scans.length) {
          _push(`<div style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.07)", "border-radius": "16px", "padding": "16px", "margin-bottom": "16px" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "600", "color": "#9ca3af", "text-transform": "uppercase", "letter-spacing": "0.5px", "margin-bottom": "12px" })}" data-v-a2ea1ed7>Scan History</div><div style="${ssrRenderStyle({ "space-y": "8px" })}" data-v-a2ea1ed7><!--[-->`);
          ssrRenderList(unref(orderData).scans.slice(0, 10), (s, i) => {
            _push(`<div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "justify-content": "space-between", "padding": "8px 0", "border-bottom": "1px solid rgba(255,255,255,0.04)" })}" data-v-a2ea1ed7><div style="${ssrRenderStyle({ "display": "flex", "align-items": "center", "gap": "8px" })}" data-v-a2ea1ed7><span style="${ssrRenderStyle({ "font-size": "14px" })}" data-v-a2ea1ed7>${ssrInterpolate(s.scan_type === "dispatch" ? "\u{1F4E6}" : s.scan_type === "delivery" ? "\u{1F69A}" : "\u{1F441}\uFE0F")}</span><div data-v-a2ea1ed7><div style="${ssrRenderStyle({ "font-size": "12px", "color": "#d1d5db", "font-weight": "500", "text-transform": "capitalize" })}" data-v-a2ea1ed7>${ssrInterpolate(s.scan_type)}</div><div style="${ssrRenderStyle({ "font-size": "10px", "color": "#6b7280" })}" data-v-a2ea1ed7>${ssrInterpolate(formatDateTime(s.scanned_at))}</div></div></div>`);
            if (s.scan_type !== "view") {
              _push(`<div style="${ssrRenderStyle(`font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;${s.pin_correct ? "background:rgba(74,222,128,0.1);color:#4ade80;" : "background:rgba(248,113,113,0.1);color:#f87171;"}`)}" data-v-a2ea1ed7>${ssrInterpolate(s.pin_correct ? "\u2713 Correct" : "\u2717 Wrong")}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div style="${ssrRenderStyle({ "text-align": "center", "padding": "20px 0 40px" })}" data-v-a2ea1ed7><p style="${ssrRenderStyle({ "font-size": "10px", "color": "#4b5563" })}" data-v-a2ea1ed7>Powered by Ujjal FMC ERP \xA0\xB7\xA0 ${ssrInterpolate(unref(orderData).order.order_number)}</p></div></div>`);
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
const _order_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a2ea1ed7"]]);

export { _order_ as default };
//# sourceMappingURL=_order_-DH2VKBea.mjs.map
