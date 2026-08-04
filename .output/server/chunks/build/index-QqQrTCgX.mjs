import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './SearchSelect-tVsYmwju.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrRenderTeleport, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './SidebarIcon-oZVkzwjh.mjs';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const filterStatus = ref("");
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/rentals",
      {
        query: computed(() => ({ status: filterStatus.value }))
      },
      "$K_Z1fBCYFN"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rentals = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.rentals) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const { data: vData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/vehicles",
      "$ImfhyEbbis"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: cData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/customers",
      { query: { per: 500, simple: "1" } },
      "$eJi-U7q4gU"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const customerOptions = computed(
      () => {
        var _a, _b, _c, _d;
        return ((_d = (_c = (_a = cData.value) == null ? void 0 : _a.customers) != null ? _c : (_b = cData.value) == null ? void 0 : _b.data) != null ? _d : []).map((c) => ({ value: c.id, label: c.name }));
      }
    );
    function fmtDate(d) {
      if (!d) return "\u2014";
      return new Date(d).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "2-digit" });
    }
    const showCreate = ref(false);
    const saving = ref(false);
    const createError = ref("");
    const form = reactive({
      vehicle_id: "",
      customer_id: "",
      rental_type: "Daily",
      rate: 0,
      start_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 864e5).toISOString().slice(0, 16),
      total_amount: 0,
      notes: ""
    });
    function openCreate() {
      Object.assign(form, {
        vehicle_id: "",
        customer_id: "",
        rental_type: "Daily",
        rate: 0,
        start_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 864e5).toISOString().slice(0, 16),
        total_amount: 0,
        notes: ""
      });
      createError.value = "";
      showCreate.value = true;
    }
    const canSubmit = computed(
      () => form.vehicle_id && form.customer_id && form.total_amount > 0 && form.start_date && form.end_date
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiSearchSelect = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Vehicle Rentals",
        subtitle: "Rental income \u2014 daily/monthly/trip/fixed contracts",
        breadcrumb: ["Fleet", "Rentals"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs"${_scopeId}>+ New Rental</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: openCreate,
                class: "btn-gold text-xs"
              }, "+ New Rental")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`);
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Scheduled",
        value: String(unref(stats).scheduled || 0),
        icon: "list",
        color: "blue",
        "trend-up": "",
        trend: "Upcoming"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "In Progress",
        value: String(unref(stats).in_progress || 0),
        icon: "truck",
        color: "teal",
        "trend-up": "",
        trend: "Active now"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Completed (mo.)",
        value: String(unref(stats).completed_this_month || 0),
        icon: "check",
        color: "gold",
        "trend-up": "",
        trend: "This month"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Revenue (mo.)",
        value: "\u09F3" + Number(unref(stats).revenue_this_month || 0).toLocaleString(),
        icon: "chart",
        color: "gold",
        "trend-up": "",
        trend: "This month"
      }, null, _parent));
      _push(`</div><div class="glass-card p-4 flex flex-wrap gap-3"><select class="input-glass w-auto text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "") : ssrLooseEqual(unref(filterStatus), "")) ? " selected" : ""}>All Status</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), null) : ssrLooseEqual(unref(filterStatus), null)) ? " selected" : ""}>Scheduled</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), null) : ssrLooseEqual(unref(filterStatus), null)) ? " selected" : ""}>In Progress</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), null) : ssrLooseEqual(unref(filterStatus), null)) ? " selected" : ""}>Completed</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), null) : ssrLooseEqual(unref(filterStatus), null)) ? " selected" : ""}>Cancelled</option></select></div><div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="py-2.5 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Vehicle</th><th class="py-2.5 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Customer</th><th class="py-2.5 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Type</th><th class="py-2.5 px-4 text-left text-gray-600 font-semibold uppercase tracking-wider">Period</th><th class="py-2.5 px-4 text-right text-gray-600 font-semibold uppercase tracking-wider">Amount \u09F3</th><th class="py-2.5 px-4 text-center text-gray-600 font-semibold uppercase tracking-wider">Status</th><th class="py-2.5 px-4 text-center text-gray-600 font-semibold uppercase tracking-wider">Payment</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
      ssrRenderList(unref(rentals), (r) => {
        _push(`<tr class="hover:bg-white/[0.02]"><td class="py-2.5 px-4 font-mono text-gold-400/80">${ssrInterpolate(r.vehicle_no)}</td><td class="py-2.5 px-4 text-gray-200">${ssrInterpolate(r.customer_name)}</td><td class="py-2.5 px-4 text-gray-400">${ssrInterpolate(r.rental_type)}</td><td class="py-2.5 px-4 text-gray-500">${ssrInterpolate(fmtDate(r.start_datetime))} \u2192 ${ssrInterpolate(fmtDate(r.end_datetime))}</td><td class="py-2.5 px-4 text-right font-semibold text-gray-200">${ssrInterpolate(Number(r.total_amount).toLocaleString())}</td><td class="py-2.5 px-4 text-center"><select${ssrRenderAttr("value", r.status)} class="input-glass text-[10px] py-0.5"><option>Scheduled</option><option>In Progress</option><option>Completed</option><option>Cancelled</option></select></td><td class="py-2.5 px-4 text-center"><select${ssrRenderAttr("value", r.payment_status)} class="input-glass text-[10px] py-0.5"><option>Pending</option><option>Partially Paid</option><option>Paid</option></select></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(rentals).length) {
        _push(`<tr><td colspan="7" class="py-10 text-center text-gray-600">No rentals yet. Book one with &quot;+ New Rental&quot;.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreate)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-lg space-y-4"><div class="flex items-start justify-between"><h3 class="text-sm font-semibold text-gray-200">New Vehicle Rental</h3><button class="text-gray-600 hover:text-gray-300 text-lg leading-none">\u2715</button></div><div class="grid grid-cols-2 gap-3"><div><label class="field-label">Vehicle *</label><select class="field-input w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, "") : ssrLooseEqual(unref(form).vehicle_id, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
          ssrRenderList(unref(vehicles), (v) => {
            _push2(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, v.id) : ssrLooseEqual(unref(form).vehicle_id, v.id)) ? " selected" : ""}>${ssrInterpolate(v.registration_no)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="field-label">Customer *</label>`);
          _push2(ssrRenderComponent(_component_UiSearchSelect, {
            modelValue: unref(form).customer_id,
            "onUpdate:modelValue": ($event) => unref(form).customer_id = $event,
            options: unref(customerOptions),
            placeholder: "Search customer\u2026"
          }, null, _parent));
          _push2(`</div><div><label class="field-label">Rental Type *</label><select class="field-input w-full"><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).rental_type) ? ssrLooseContain(unref(form).rental_type, null) : ssrLooseEqual(unref(form).rental_type, null)) ? " selected" : ""}>Daily</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).rental_type) ? ssrLooseContain(unref(form).rental_type, null) : ssrLooseEqual(unref(form).rental_type, null)) ? " selected" : ""}>Monthly</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).rental_type) ? ssrLooseContain(unref(form).rental_type, null) : ssrLooseEqual(unref(form).rental_type, null)) ? " selected" : ""}>Trip</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).rental_type) ? ssrLooseContain(unref(form).rental_type, null) : ssrLooseEqual(unref(form).rental_type, null)) ? " selected" : ""}>Fixed</option></select></div><div><label class="field-label">${ssrInterpolate(unref(form).rental_type === "Trip" || unref(form).rental_type === "Fixed" ? "Total Cost \u09F3 *" : `Rate per ${unref(form).rental_type === "Monthly" ? "Month" : "Day"} \u09F3 *`)}</label><input${ssrRenderAttr("value", unref(form).rate)} type="number" class="field-input w-full font-mono"></div><div><label class="field-label">Start</label><input${ssrRenderAttr("value", unref(form).start_date)} type="datetime-local" class="field-input w-full"></div><div><label class="field-label">End</label><input${ssrRenderAttr("value", unref(form).end_date)} type="datetime-local" class="field-input w-full"></div><div class="col-span-2"><label class="field-label">Total Amount \u09F3 *</label><input${ssrRenderAttr("value", unref(form).total_amount)} type="number" class="field-input w-full font-mono"><p class="text-[10px] text-gray-600 mt-1">Posts as an invoice: DR Accounts Receivable / CR Vehicle Rental Income.</p></div><div class="col-span-2"><label class="field-label">Notes</label><input${ssrRenderAttr("value", unref(form).notes)} type="text" class="field-input w-full" placeholder="Rental terms, destination, etc."></div></div>`);
          if (unref(createError)) {
            _push2(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">${ssrInterpolate(unref(createError))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex gap-2 pt-1"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button${ssrIncludeBooleanAttr(!unref(canSubmit) || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs flex-1 justify-center disabled:opacity-40">${ssrInterpolate(unref(saving) ? "Booking\u2026" : "Book Rental")}</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/rentals/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-QqQrTCgX.mjs.map
