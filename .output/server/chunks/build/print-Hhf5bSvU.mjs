import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, unref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
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
  __name: "print",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const id = Number(route.params.id);
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/fleet/trips/${id}`,
      "$QFeqMJb3El"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const trip = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.trip) != null ? _b : null;
    });
    const advances = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.advances) != null ? _b : [];
    });
    const expenses = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.expenses) != null ? _b : [];
    });
    const settlement = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.settlement) != null ? _b : { revenue: 0, total_advance: 0, total_expense: 0, final_balance: 0 };
    });
    const printDate = (/* @__PURE__ */ new Date()).toLocaleDateString("en-BD", { year: "numeric", month: "long", day: "numeric" });
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      if (unref(trip)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "print-page" }, _attrs))} data-v-3467ea4d><div class="no-print mb-4 flex gap-3" data-v-3467ea4d><button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg" data-v-3467ea4d>\u{1F5A8} Print / Save PDF</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/fleet/trips/${unref(id)}`,
          class: "px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u2190 Back`);
            } else {
              return [
                createTextVNode("\u2190 Back")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="trip-sheet" data-v-3467ea4d><div class="header" data-v-3467ea4d><div class="company-info" data-v-3467ea4d><h1 data-v-3467ea4d>TRIP SHEET</h1><p class="company-name" data-v-3467ea4d>FMC Transport Fleet Management</p></div><div class="trip-number-box" data-v-3467ea4d><span class="label" data-v-3467ea4d>Trip No</span><span class="value" data-v-3467ea4d>${ssrInterpolate(unref(trip).trip_number)}</span></div></div><div class="status-bar" data-v-3467ea4d><span class="${ssrRenderClass([`status-${unref(trip).trip_status}`, "status-pill"])}" data-v-3467ea4d>${ssrInterpolate((_a = unref(trip).trip_status) == null ? void 0 : _a.replace("_", " ").toUpperCase())}</span><span class="status-pill status-report" data-v-3467ea4d>${ssrInterpolate((_b = unref(trip).report_status) == null ? void 0 : _b.toUpperCase())}</span><span class="date-info" data-v-3467ea4d>Date: ${ssrInterpolate(unref(trip).trip_date)}</span></div><div class="two-col-section" data-v-3467ea4d><div class="info-box" data-v-3467ea4d><div class="box-title" data-v-3467ea4d>VEHICLE</div><table class="info-table" data-v-3467ea4d><tr data-v-3467ea4d><td class="label" data-v-3467ea4d>Reg No</td><td class="value" data-v-3467ea4d>${ssrInterpolate(unref(trip).vehicle_no)}</td></tr><tr data-v-3467ea4d><td class="label" data-v-3467ea4d>Type</td><td class="value" data-v-3467ea4d>${ssrInterpolate(unref(trip).vehicle_type)}</td></tr><tr data-v-3467ea4d><td class="label" data-v-3467ea4d>Make/Model</td><td class="value" data-v-3467ea4d>${ssrInterpolate(unref(trip).make)} ${ssrInterpolate(unref(trip).model)}</td></tr></table></div><div class="info-box" data-v-3467ea4d><div class="box-title" data-v-3467ea4d>DRIVER</div><table class="info-table" data-v-3467ea4d><tr data-v-3467ea4d><td class="label" data-v-3467ea4d>Name</td><td class="value" data-v-3467ea4d>${ssrInterpolate(unref(trip).driver_name)}</td></tr><tr data-v-3467ea4d><td class="label" data-v-3467ea4d>Mobile</td><td class="value" data-v-3467ea4d>${ssrInterpolate(unref(trip).driver_mobile || "\u2014")}</td></tr></table></div></div><div class="info-box full-width" data-v-3467ea4d><div class="box-title" data-v-3467ea4d>ROUTE &amp; CARGO DETAILS</div><div class="grid-4" data-v-3467ea4d><div class="field" data-v-3467ea4d><span class="field-label" data-v-3467ea4d>Origin</span><span class="field-value" data-v-3467ea4d>${ssrInterpolate(unref(trip).origin || "\u2014")}</span></div><div class="field" data-v-3467ea4d><span class="field-label" data-v-3467ea4d>Destination</span><span class="field-value" data-v-3467ea4d>${ssrInterpolate(unref(trip).destination || "\u2014")}</span></div><div class="field" data-v-3467ea4d><span class="field-label" data-v-3467ea4d>Departure</span><span class="field-value" data-v-3467ea4d>${ssrInterpolate(unref(trip).departure_time || "\u2014")}</span></div><div class="field" data-v-3467ea4d><span class="field-label" data-v-3467ea4d>Est. Duration</span><span class="field-value" data-v-3467ea4d>${ssrInterpolate(unref(trip).estimated_duration ? unref(trip).estimated_duration + " hrs" : "\u2014")}</span></div><div class="field" data-v-3467ea4d><span class="field-label" data-v-3467ea4d>Goods</span><span class="field-value" data-v-3467ea4d>${ssrInterpolate(unref(trip).goods_description || "\u2014")}</span></div><div class="field" data-v-3467ea4d><span class="field-label" data-v-3467ea4d>Quantity</span><span class="field-value" data-v-3467ea4d>${ssrInterpolate(unref(trip).quantity ? Number(unref(trip).quantity).toLocaleString() : "\u2014")}</span></div><div class="field" data-v-3467ea4d><span class="field-label" data-v-3467ea4d>Weight (kg)</span><span class="field-value" data-v-3467ea4d>${ssrInterpolate(unref(trip).weight_kg ? Number(unref(trip).weight_kg).toLocaleString() : "\u2014")}</span></div><div class="field" data-v-3467ea4d><span class="field-label" data-v-3467ea4d>Customer</span><span class="field-value" data-v-3467ea4d>${ssrInterpolate(unref(trip).customer_name || "\u2014")}</span></div></div></div><div class="two-col-section" data-v-3467ea4d><div class="info-box" data-v-3467ea4d><div class="box-title" data-v-3467ea4d>ADVANCES</div>`);
        if (unref(advances).length) {
          _push(`<table class="data-table" data-v-3467ea4d><thead data-v-3467ea4d><tr data-v-3467ea4d><th data-v-3467ea4d>Purpose</th><th data-v-3467ea4d>Given By</th><th class="amount" data-v-3467ea4d>Amount (\u09F3)</th></tr></thead><tbody data-v-3467ea4d><!--[-->`);
          ssrRenderList(unref(advances), (a) => {
            _push(`<tr data-v-3467ea4d><td data-v-3467ea4d>${ssrInterpolate(a.purpose || "Advance")}</td><td data-v-3467ea4d>${ssrInterpolate(a.given_by || "\u2014")}</td><td class="amount" data-v-3467ea4d>${ssrInterpolate(Number(a.amount).toLocaleString())}</td></tr>`);
          });
          _push(`<!--]--></tbody><tfoot data-v-3467ea4d><tr class="total-row" data-v-3467ea4d><td colspan="2" data-v-3467ea4d>Total Advances</td><td class="amount" data-v-3467ea4d>${ssrInterpolate(fmt(unref(settlement).total_advance))}</td></tr></tfoot></table>`);
        } else {
          _push(`<p class="empty-msg" data-v-3467ea4d>No advances recorded</p>`);
        }
        _push(`</div><div class="info-box" data-v-3467ea4d><div class="box-title" data-v-3467ea4d>EXPENSES</div>`);
        if (unref(expenses).length) {
          _push(`<table class="data-table" data-v-3467ea4d><thead data-v-3467ea4d><tr data-v-3467ea4d><th data-v-3467ea4d>Category</th><th data-v-3467ea4d>Description</th><th class="amount" data-v-3467ea4d>Amount (\u09F3)</th></tr></thead><tbody data-v-3467ea4d><!--[-->`);
          ssrRenderList(unref(expenses), (e) => {
            _push(`<tr data-v-3467ea4d><td data-v-3467ea4d>${ssrInterpolate(e.category || "Expense")}</td><td data-v-3467ea4d>${ssrInterpolate(e.description || "\u2014")}</td><td class="amount" data-v-3467ea4d>${ssrInterpolate(Number(e.amount).toLocaleString())}</td></tr>`);
          });
          _push(`<!--]--></tbody><tfoot data-v-3467ea4d><tr class="total-row" data-v-3467ea4d><td colspan="2" data-v-3467ea4d>Total Expenses</td><td class="amount" data-v-3467ea4d>${ssrInterpolate(fmt(unref(settlement).total_expense))}</td></tr></tfoot></table>`);
        } else {
          _push(`<p class="empty-msg" data-v-3467ea4d>No expenses recorded</p>`);
        }
        _push(`</div></div><div class="settlement-box" data-v-3467ea4d><div class="box-title" data-v-3467ea4d>SETTLEMENT SUMMARY</div><div class="settlement-grid" data-v-3467ea4d><div class="settlement-row income" data-v-3467ea4d><span data-v-3467ea4d>Trip Charge (Revenue)</span><span data-v-3467ea4d>\u09F3${ssrInterpolate(fmt(unref(settlement).revenue))}</span></div><div class="settlement-row deduct" data-v-3467ea4d><span data-v-3467ea4d>Less: Total Advances</span><span data-v-3467ea4d>\u2013 \u09F3${ssrInterpolate(fmt(unref(settlement).total_advance))}</span></div><div class="settlement-row deduct" data-v-3467ea4d><span data-v-3467ea4d>Less: Total Expenses</span><span data-v-3467ea4d>\u2013 \u09F3${ssrInterpolate(fmt(unref(settlement).total_expense))}</span></div><div class="${ssrRenderClass([unref(settlement).final_balance < 0 ? "negative" : "", "settlement-row balance"])}" data-v-3467ea4d><span data-v-3467ea4d>Balance Due to Company</span><span data-v-3467ea4d>\u09F3${ssrInterpolate(fmt(unref(settlement).final_balance))}</span></div></div></div><div class="signature-section" data-v-3467ea4d><div class="sig-box" data-v-3467ea4d><div class="sig-line" data-v-3467ea4d></div><p class="sig-label" data-v-3467ea4d>Driver Signature</p><p class="sig-name" data-v-3467ea4d>${ssrInterpolate(unref(trip).driver_name)}</p></div><div class="sig-box" data-v-3467ea4d><div class="sig-line" data-v-3467ea4d></div><p class="sig-label" data-v-3467ea4d>Supervisor Signature</p><p class="sig-name" data-v-3467ea4d>\xA0</p></div><div class="sig-box" data-v-3467ea4d><div class="sig-line" data-v-3467ea4d></div><p class="sig-label" data-v-3467ea4d>Accounts Signature</p><p class="sig-name" data-v-3467ea4d>\xA0</p></div></div><div class="doc-footer" data-v-3467ea4d><span data-v-3467ea4d>Printed: ${ssrInterpolate(unref(printDate))}</span><span data-v-3467ea4d>${ssrInterpolate(unref(trip).trip_number)} \xB7 FMC Fleet Management System</span></div></div></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center text-gray-500" }, _attrs))} data-v-3467ea4d> Loading trip data\u2026 </div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/trips/[id]/print.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const print = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3467ea4d"]]);

export { print as default };
//# sourceMappingURL=print-Hhf5bSvU.mjs.map
