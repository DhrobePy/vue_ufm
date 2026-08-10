import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { l as useRouter } from './server.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useRouter();
    const loading = ref(false);
    const error = ref("");
    const prevOdometer = ref(null);
    const { data: vData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/vehicles",
      "$AlNSlLRq6b"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: dData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/drivers",
      "$cJYxGvTQHW"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: pettyData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/expenses/petty-cash-accounts",
      "$aYhEYvDoE2"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: bankData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/bank-accounts",
      "$BQ5wOxcLUZ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const drivers = computed(() => {
      var _a, _b;
      return ((_b = (_a = dData.value) == null ? void 0 : _a.drivers) != null ? _b : []).filter((d) => d.status === "active");
    });
    const pettyCashAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = pettyData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const bankAccounts = computed(() => {
      var _a, _b;
      return (_b = (_a = bankData.value) == null ? void 0 : _a.accounts) != null ? _b : [];
    });
    const form = reactive({
      vehicle_id: "",
      driver_id: "",
      fuel_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      fuel_type: "DIESEL",
      quantity_liters: "",
      price_per_liter: "",
      total_amount: "",
      odometer_reading: "",
      previous_odometer: "",
      station_name: "",
      receipt_no: "",
      payment_method: "",
      cash_account_id: "",
      bank_account_id: ""
    });
    const mileagePreview = computed(() => {
      const odo = Number(form.odometer_reading);
      const prev = Number(form.previous_odometer);
      const qty = Number(form.quantity_liters);
      if (odo > prev && prev > 0 && qty > 0) {
        return ((odo - prev) / qty).toFixed(2) + " km/L";
      }
      return "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 max-w-xl mx-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Log Fuel Fill-up",
        breadcrumb: ["Fleet", "Fuel", "Log"]
      }, null, _parent));
      _push(`<form class="glass-card p-6 space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Vehicle *</label><select class="form-input" required><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, "") : ssrLooseEqual(unref(form).vehicle_id, "")) ? " selected" : ""}>\u2014 Select vehicle \u2014</option><!--[-->`);
      ssrRenderList(unref(vehicles), (v) => {
        _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).vehicle_id) ? ssrLooseContain(unref(form).vehicle_id, v.id) : ssrLooseEqual(unref(form).vehicle_id, v.id)) ? " selected" : ""}>${ssrInterpolate(v.registration_no)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="form-label">Driver</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).driver_id) ? ssrLooseContain(unref(form).driver_id, "") : ssrLooseEqual(unref(form).driver_id, "")) ? " selected" : ""}>\u2014 Select driver \u2014</option><!--[-->`);
      ssrRenderList(unref(drivers), (d) => {
        _push(`<option${ssrRenderAttr("value", d.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).driver_id) ? ssrLooseContain(unref(form).driver_id, d.id) : ssrLooseEqual(unref(form).driver_id, d.id)) ? " selected" : ""}>${ssrInterpolate(d.full_name)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Date *</label><input${ssrRenderAttr("value", unref(form).fuel_date)} type="date" class="form-input" required></div><div><label class="form-label">Fuel Type</label><select class="form-input"><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>DIESEL</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>PETROL</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>CNG</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).fuel_type) ? ssrLooseContain(unref(form).fuel_type, null) : ssrLooseEqual(unref(form).fuel_type, null)) ? " selected" : ""}>ELECTRIC</option></select></div></div><div class="grid grid-cols-3 gap-4"><div><label class="form-label">Quantity (Litres) *</label><input${ssrRenderAttr("value", unref(form).quantity_liters)} type="number" step="0.001" class="form-input" required placeholder="50.000"></div><div><label class="form-label">Price per Litre \u09F3</label><input${ssrRenderAttr("value", unref(form).price_per_liter)} type="number" step="0.01" class="form-input" placeholder="115.00"></div><div><label class="form-label">Total Amount \u09F3</label><input${ssrRenderAttr("value", unref(form).total_amount)} type="number" step="0.01" class="form-input" placeholder="5750.00"></div></div><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Odometer Reading (km)</label><input${ssrRenderAttr("value", unref(form).odometer_reading)} type="number" class="form-input" placeholder="45200"></div><div><label class="form-label">Previous Odometer (km)</label><input${ssrRenderAttr("value", unref(form).previous_odometer)} type="number" class="form-input"${ssrRenderAttr("placeholder", unref(prevOdometer) ? String(unref(prevOdometer)) : "Auto-filled")}></div></div>`);
      if (unref(mileagePreview)) {
        _push(`<div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center"> Estimated mileage: ${ssrInterpolate(unref(mileagePreview))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 gap-4"><div><label class="form-label">Station Name</label><input${ssrRenderAttr("value", unref(form).station_name)} class="form-input" placeholder="e.g. Meghna Filling Station"></div><div><label class="form-label">Receipt No</label><input${ssrRenderAttr("value", unref(form).receipt_no)} class="form-input" placeholder="Receipt/Invoice number"></div></div><div class="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]"><div><label class="form-label">Paid From</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_method) ? ssrLooseContain(unref(form).payment_method, "") : ssrLooseEqual(unref(form).payment_method, "")) ? " selected" : ""}>\u2014 Not posting to GL yet \u2014</option><option value="cash"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_method) ? ssrLooseContain(unref(form).payment_method, "cash") : ssrLooseEqual(unref(form).payment_method, "cash")) ? " selected" : ""}>Petty Cash</option><option value="bank"${ssrIncludeBooleanAttr(Array.isArray(unref(form).payment_method) ? ssrLooseContain(unref(form).payment_method, "bank") : ssrLooseEqual(unref(form).payment_method, "bank")) ? " selected" : ""}>Bank</option></select></div>`);
      if (unref(form).payment_method === "cash") {
        _push(`<div><label class="form-label">Petty Cash Account *</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).cash_account_id) ? ssrLooseContain(unref(form).cash_account_id, "") : ssrLooseEqual(unref(form).cash_account_id, "")) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
        ssrRenderList(unref(pettyCashAccounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).cash_account_id) ? ssrLooseContain(unref(form).cash_account_id, a.id) : ssrLooseEqual(unref(form).cash_account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.account_name)} (\u09F3${ssrInterpolate(Number(a.current_balance).toLocaleString())})</option>`);
        });
        _push(`<!--]--></select></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(form).payment_method === "bank") {
        _push(`<div><label class="form-label">Bank Account *</label><select class="form-input"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).bank_account_id) ? ssrLooseContain(unref(form).bank_account_id, "") : ssrLooseEqual(unref(form).bank_account_id, "")) ? " selected" : ""}>\u2014 Select \u2014</option><!--[-->`);
        ssrRenderList(unref(bankAccounts), (a) => {
          _push(`<option${ssrRenderAttr("value", a.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).bank_account_id) ? ssrLooseContain(unref(form).bank_account_id, a.id) : ssrLooseEqual(unref(form).bank_account_id, a.id)) ? " selected" : ""}>${ssrInterpolate(a.bank_name)} \u2014 ${ssrInterpolate(a.account_name)}</option>`);
        });
        _push(`<!--]--></select></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(error)) {
        _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex gap-3 pt-2"><button type="submit" class="btn-gold"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "Saving\u2026" : "Log Fuel")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/fleet/fuel",
        class: "btn-secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cancel`);
          } else {
            return [
              createTextVNode("Cancel")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/fuel/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-CXwbgF_Q.mjs.map
