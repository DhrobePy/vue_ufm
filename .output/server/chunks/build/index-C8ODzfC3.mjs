import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import './SidebarIcon-oZVkzwjh.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const [{ data, pending, error, refresh }, { data: vData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/credit-sales/dispatch",
        "$wyIlaOLDq6"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/logistics/vehicles",
        "$pmHf6KMz9H"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const orders = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = vData.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const activeVehicles = computed(() => vehicles.value.filter((v) => v.status === "active"));
    const assignedVehicle = ref({});
    const acting = ref(null);
    function fmtMT(kg) {
      return (Number(kg) / 1e3).toFixed(1) + " MT";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_KpiCard = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Dispatch",
        subtitle: "Ready-to-ship orders \xB7 vehicle assignment \xB7 delivery tracking",
        breadcrumb: ["Dispatch"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`);
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Ready to Ship",
          value: String((_a = unref(stats).ready_count) != null ? _a : 0),
          trend: "Awaiting dispatch",
          "trend-up": false,
          icon: "truck",
          color: "cyan"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Dispatched Today",
          value: String((_b = unref(stats).dispatched_today) != null ? _b : 0),
          trend: "Confirmed",
          "trend-up": "",
          icon: "check",
          color: "teal"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Total Weight",
          value: fmtMT((_c = unref(stats).dispatched_kg_today) != null ? _c : 0),
          trend: "dispatched today",
          "trend-up": "",
          icon: "list",
          color: "blue"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Vehicles Active",
          value: String(unref(activeVehicles).length),
          trend: "available",
          "trend-up": "",
          icon: "truck",
          color: "orange"
        }, null, _parent));
        _push(`</div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Ready to Ship</h2><span class="text-xs text-gray-600">${ssrInterpolate(unref(orders).length)} orders waiting</span></div><div class="space-y-3">`);
        if (!unref(orders).length) {
          _push(`<div class="py-8 text-center text-xs text-gray-600"> No orders ready to ship </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(orders), (order) => {
          var _a2;
          _push(`<div class="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"><div class="sm:col-span-2"><p class="font-mono text-xs text-gold-400/90 font-semibold">${ssrInterpolate(order.order_number)}</p><p class="text-sm font-medium text-gray-200 mt-0.5">${ssrInterpolate(order.customer_name)}</p><p class="text-[11px] text-gray-600 mt-0.5">${ssrInterpolate(order.delivery_address || order.branch_name || "\u2014")}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Weight</p><p class="text-xs font-semibold text-gray-300">${ssrInterpolate(fmtMT((_a2 = order.total_weight_kg) != null ? _a2 : 0))}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Priority</p><span class="${ssrRenderClass([
            "text-xs font-medium",
            order.priority === "urgent" ? "text-red-400" : order.priority === "high" ? "text-orange-400" : "text-gray-500"
          ])}">${ssrInterpolate(order.priority)}</span></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Vehicle</p><select class="field-input text-xs py-1.5"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(assignedVehicle)[order.id]) ? ssrLooseContain(unref(assignedVehicle)[order.id], "") : ssrLooseEqual(unref(assignedVehicle)[order.id], "")) ? " selected" : ""}>Assign\u2026</option><!--[-->`);
          ssrRenderList(unref(activeVehicles), (v) => {
            _push(`<option${ssrRenderAttr("value", v.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(assignedVehicle)[order.id]) ? ssrLooseContain(unref(assignedVehicle)[order.id], v.id) : ssrLooseEqual(unref(assignedVehicle)[order.id], v.id)) ? " selected" : ""}>${ssrInterpolate(v.vehicle_number)} (${ssrInterpolate(v.capacity_mt)}MT) </option>`);
          });
          _push(`<!--]--></select></div><div class="flex gap-2"><button class="btn-gold text-xs py-1.5 px-3 flex-1 justify-center"${ssrIncludeBooleanAttr(!unref(assignedVehicle)[order.id] || unref(acting) === order.id) ? " disabled" : ""}>`);
          if (unref(acting) === order.id) {
            _push(`<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
          } else {
            _push(`<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>`);
          }
          _push(` ${ssrInterpolate(unref(acting) === order.id ? "\u2026" : "Dispatch")}</button></div></div>`);
        });
        _push(`<!--]--></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dispatch/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C8ODzfC3.mjs.map
