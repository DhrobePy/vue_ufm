import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, computed, unref, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const id = Number(route.params.id);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/fleet/maintenance/${id}`,
      "$NM2xGr_mFF"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const req = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.request) != null ? _b : null;
    });
    const tasks = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.tasks) != null ? _b : [];
    });
    const materials = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.materials) != null ? _b : [];
    });
    const taskTotal = computed(() => tasks.value.reduce((s, t) => s + Number(t.service_cost || 0), 0));
    const matTotal = computed(() => materials.value.reduce((s, m) => s + Number(m.amount || 0), 0));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      if (unref(req)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(req).request_no,
          subtitle: `${unref(req).vehicle_no} \xB7 ${unref(req).repair_type}`,
          breadcrumb: ["Fleet", "Maintenance", unref(req).request_no]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, {
                status: unref(req).status
              }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, {
                  status: unref(req).status
                }, null, 8, ["status"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="flex gap-2">`);
        if (unref(req).status === "pending") {
          _push(`<button class="btn-gold text-xs">\u25B6 Start Work</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(req).status === "in_progress") {
          _push(`<button class="btn-secondary text-xs border-emerald-500/30 text-emerald-400">\u2713 Mark Completed</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(req).status !== "cancelled" && unref(req).status !== "completed") {
          _push(`<button class="btn-secondary text-xs border-red-500/30 text-red-400">\u2715 Cancel</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-5"><h3 class="section-title mb-4">Request Details</h3><dl class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm"><div class="flex justify-between"><dt class="text-gray-500">Request No</dt><dd class="text-gray-200 font-mono">${ssrInterpolate(unref(req).request_no)}</dd></div><div class="flex justify-between"><dt class="text-gray-500">Vehicle</dt><dd class="font-mono text-gold-400/80">${ssrInterpolate(unref(req).vehicle_no)}</dd></div><div class="flex justify-between"><dt class="text-gray-500">Date</dt><dd class="text-gray-200">${ssrInterpolate(unref(req).request_date)}</dd></div><div class="flex justify-between"><dt class="text-gray-500">Type</dt><dd><span class="${ssrRenderClass([unref(req).repair_type === "preventive" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400", "badge text-[10px]"])}">${ssrInterpolate(unref(req).repair_type)}</span></dd></div><div class="flex justify-between"><dt class="text-gray-500">Station</dt><dd class="text-gray-200">${ssrInterpolate(unref(req).station_supplier || "\u2014")}</dd></div><div class="flex justify-between"><dt class="text-gray-500">Odometer</dt><dd class="text-gray-200">${ssrInterpolate(unref(req).odometer_at_request ? unref(req).odometer_at_request.toLocaleString() + " km" : "\u2014")}</dd></div></dl><div class="mt-4 pt-4 border-t border-white/[0.06]"><p class="text-xs text-gray-500 mb-1">Issue Description</p><p class="text-sm text-gray-300">${ssrInterpolate(unref(req).issue_description || "\u2014")}</p></div></div><div class="glass-card p-5"><h3 class="section-title mb-4">Repair Tasks</h3>`);
        if (!unref(tasks).length) {
          _push(`<div class="text-center py-4 text-gray-600 text-sm">No tasks recorded</div>`);
        } else {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(tasks), (t) => {
            _push(`<div class="flex justify-between p-3 rounded-xl bg-white/[0.03]"><span class="text-sm text-gray-300">${ssrInterpolate(t.description)}</span><span class="text-sm font-medium text-gray-200">\u09F3${ssrInterpolate(Number(t.service_cost || 0).toLocaleString())}</span></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div><div class="glass-card p-5"><h3 class="section-title mb-4">Materials Used</h3>`);
        if (!unref(materials).length) {
          _push(`<div class="text-center py-4 text-gray-600 text-sm">No materials recorded</div>`);
        } else {
          _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-500">Item</th><th class="pb-2 text-right text-gray-500">Qty</th><th class="pb-2 text-right text-gray-500">Rate \u09F3</th><th class="pb-2 text-right text-gray-500">Amount \u09F3</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(materials), (m) => {
            _push(`<tr class="border-b border-white/[0.03]"><td class="py-2 text-gray-300">${ssrInterpolate(m.item_name)}</td><td class="py-2 text-right text-gray-400">${ssrInterpolate(m.quantity)}</td><td class="py-2 text-right text-gray-400">\u09F3${ssrInterpolate(Number(m.unit_rate || 0).toFixed(2))}</td><td class="py-2 text-right font-medium text-gray-200">\u09F3${ssrInterpolate(Number(m.amount || 0).toLocaleString())}</td></tr>`);
          });
          _push(`<!--]--></tbody></table>`);
        }
        _push(`</div></div><div class="space-y-4"><div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cost Summary</h4><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-500">Labour / Service</span><span class="text-gray-200">\u09F3${ssrInterpolate(Number(unref(taskTotal)).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-500">Materials</span><span class="text-gray-200">\u09F3${ssrInterpolate(Number(unref(matTotal)).toLocaleString())}</span></div><div class="flex justify-between border-t border-white/[0.06] pt-2 mt-2"><span class="font-semibold text-gray-300">Total</span><span class="font-bold text-gold-400">\u09F3${ssrInterpolate(Number(unref(req).total_cost || 0).toLocaleString())}</span></div></div></div>`);
        if (unref(req).notes) {
          _push(`<div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</h4><p class="text-xs text-gray-400">${ssrInterpolate(unref(req).notes)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/maintenance/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BoNpRt7J.mjs.map
