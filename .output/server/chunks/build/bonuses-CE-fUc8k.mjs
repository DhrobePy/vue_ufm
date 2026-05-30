import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderComponent, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "bonuses",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/bonuses",
      "$-ALIqscMIj"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const batches = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.batches) != null ? _b : [];
    });
    const showCreate = ref(false);
    const saving = ref(false);
    const err = ref("");
    const bForm = ref({ name: "", bonus_type: "festival", calc_method: "flat", calc_value: 0, disburse_date: "", notes: "" });
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "\u2014";
    const statusBadge = (s) => ({
      draft: "badge-yellow",
      approved: "badge-blue",
      paid: "badge-green"
    })[s] || "badge-gray";
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div><h1 class="text-2xl font-bold text-white">Bonus Management</h1><p class="text-sm text-gray-400">Festival &amp; performance bonuses</p></div><button class="btn-primary">+ New Batch</button></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Batch Name</th><th class="th">Type</th><th class="th">Method</th><th class="th text-right">Total Amount</th><th class="th">Disburse Date</th><th class="th text-center">Status</th><th class="th text-right">Actions</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(batches), (b) => {
        _push(`<tr class="tr"><td class="td text-gray-200 font-medium">${ssrInterpolate(b.name)}</td><td class="td text-gray-400">${ssrInterpolate(b.bonus_type)}</td><td class="td text-gray-400">${ssrInterpolate(b.calc_method)} ${ssrInterpolate(b.calc_value)}${ssrInterpolate(b.calc_method === "percent" ? "%" : "")}</td><td class="td text-right text-amber-400 font-semibold">\u09F3${ssrInterpolate(fmt(b.total_amount))}</td><td class="td text-gray-400">${ssrInterpolate(b.disburse_date ? fmtDate(b.disburse_date) : "\u2014")}</td><td class="td text-center"><span class="${ssrRenderClass([statusBadge(b.status), "text-xs"])}">${ssrInterpolate(b.status)}</span></td><td class="td text-right"><div class="flex justify-end gap-1">`);
        if (b.status === "draft") {
          _push(`<button class="btn-xs">Generate</button>`);
        } else {
          _push(`<!---->`);
        }
        if (b.status === "approved") {
          _push(`<button class="btn-xs badge-green text-xs px-2 py-0.5 rounded">Pay All</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/hr/bonuses/${b.id}`,
          class: "btn-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Detail`);
            } else {
              return [
                createTextVNode("Detail")
              ];
            }
          }),
          _: 2
        }, _parent));
        if (b.status === "draft") {
          _push(`<button class="btn-xs text-red-400">Del</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(batches).length) {
        _push(`<tr><td colspan="7" class="td text-center text-gray-500 py-10">No bonus batches yet.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreate)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-md"><h2 class="text-lg font-bold text-white mb-5">New Bonus Batch</h2><form class="space-y-4"><div><label class="label">Batch Name *</label><input${ssrRenderAttr("value", unref(bForm).name)} type="text" required class="input-field w-full" placeholder="e.g. Eid Bonus 2025"></div><div class="grid grid-cols-2 gap-4"><div><label class="label">Bonus Type</label><select class="input-field w-full"><option value="festival"${ssrIncludeBooleanAttr(Array.isArray(unref(bForm).bonus_type) ? ssrLooseContain(unref(bForm).bonus_type, "festival") : ssrLooseEqual(unref(bForm).bonus_type, "festival")) ? " selected" : ""}>Festival</option><option value="performance"${ssrIncludeBooleanAttr(Array.isArray(unref(bForm).bonus_type) ? ssrLooseContain(unref(bForm).bonus_type, "performance") : ssrLooseEqual(unref(bForm).bonus_type, "performance")) ? " selected" : ""}>Performance</option><option value="annual"${ssrIncludeBooleanAttr(Array.isArray(unref(bForm).bonus_type) ? ssrLooseContain(unref(bForm).bonus_type, "annual") : ssrLooseEqual(unref(bForm).bonus_type, "annual")) ? " selected" : ""}>Annual</option><option value="special"${ssrIncludeBooleanAttr(Array.isArray(unref(bForm).bonus_type) ? ssrLooseContain(unref(bForm).bonus_type, "special") : ssrLooseEqual(unref(bForm).bonus_type, "special")) ? " selected" : ""}>Special</option></select></div><div><label class="label">Calc Method</label><select class="input-field w-full"><option value="flat"${ssrIncludeBooleanAttr(Array.isArray(unref(bForm).calc_method) ? ssrLooseContain(unref(bForm).calc_method, "flat") : ssrLooseEqual(unref(bForm).calc_method, "flat")) ? " selected" : ""}>Flat Amount</option><option value="percent"${ssrIncludeBooleanAttr(Array.isArray(unref(bForm).calc_method) ? ssrLooseContain(unref(bForm).calc_method, "percent") : ssrLooseEqual(unref(bForm).calc_method, "percent")) ? " selected" : ""}>% of Gross</option></select></div></div><div><label class="label">${ssrInterpolate(unref(bForm).calc_method === "percent" ? "Percentage (%)" : "Amount (\u09F3)")} *</label><input${ssrRenderAttr("value", unref(bForm).calc_value)} type="number" min="0" step="0.01" required class="input-field w-full"></div><div><label class="label">Disburse Date</label><input${ssrRenderAttr("value", unref(bForm).disburse_date)} type="date" class="input-field w-full"></div><div><label class="label">Notes</label><textarea rows="2" class="input-field w-full">${ssrInterpolate(unref(bForm).notes)}</textarea></div>`);
          if (unref(err)) {
            _push2(`<div class="text-red-400 text-sm rounded bg-red-500/10 p-2">${ssrInterpolate(unref(err))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-end gap-3 pt-1"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(saving) ? "Creating\u2026" : "Create Batch")}</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/bonuses.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=bonuses-CE-fUc8k.mjs.map
