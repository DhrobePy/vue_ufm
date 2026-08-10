import { _ as _sfc_main$1 } from './BackButton-DGvLz7w-.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "holidays",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/hr/holidays",
      "$uufh-IYFCd"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const holidays = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.holidays) != null ? _b : [];
    });
    const showCreate = ref(false);
    const cSaving = ref(false);
    const cErr = ref("");
    const cForm = ref({ date: "", name: "", description: "" });
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "\u2014";
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiBackButton = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-6 space-y-5" }, _attrs))}><div class="flex items-center justify-between flex-wrap gap-3"><div class="flex items-start gap-3">`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div><h1 class="text-2xl font-bold text-white">Company Holidays</h1><p class="text-sm text-gray-400">${ssrInterpolate(unref(holidays).length)} holidays</p></div></div><button class="btn-primary flex items-center gap-2"><span>+</span> Add Holiday </button></div><div class="card overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-white/[0.06]"><th class="th">Date</th><th class="th">Holiday Name</th><th class="th">Description</th><th class="th text-right">Action</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(holidays), (h) => {
        _push(`<tr class="tr"><td class="td text-gray-200 font-medium">${ssrInterpolate(fmtDate(h.holiday_date))}</td><td class="td text-gray-300">${ssrInterpolate(h.holiday_name)}</td><td class="td text-gray-500 text-xs">${ssrInterpolate(h.description || "\u2014")}</td><td class="td text-right"><button class="btn-xs badge-red text-xs px-2 py-0.5 rounded">Delete</button></td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(holidays).length) {
        _push(`<tr><td colspan="4" class="td text-center text-gray-500 py-10">No holidays configured.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showCreate)) {
          _push2(`<div class="modal-overlay"><div class="modal-box w-full max-w-sm"><h2 class="text-lg font-bold text-white mb-5">Add Holiday</h2><form class="space-y-4"><div><label class="label">Date *</label><input${ssrRenderAttr("value", unref(cForm).date)} type="date" required class="input-field w-full"></div><div><label class="label">Holiday Name *</label><input${ssrRenderAttr("value", unref(cForm).name)} required class="input-field w-full"></div><div><label class="label">Description</label><input${ssrRenderAttr("value", unref(cForm).description)} class="input-field w-full"></div>`);
          if (unref(cErr)) {
            _push2(`<div class="text-sm text-red-400">${ssrInterpolate(unref(cErr))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex justify-end gap-3 pt-2"><button type="button" class="btn-secondary">Cancel</button><button type="submit"${ssrIncludeBooleanAttr(unref(cSaving)) ? " disabled" : ""} class="btn-primary">${ssrInterpolate(unref(cSaving) ? "Adding\u2026" : "Add")}</button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hr/holidays.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=holidays-Df1LEFcY.mjs.map
