import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const perPage = 50;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "audit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const severities = ["All", "info", "warning", "error"];
    const severityFilter = ref("");
    const userFilter = ref("");
    const dateFilter = ref("");
    const page = ref(1);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/audit-logs",
      {
        query: computed(() => ({
          severity: severityFilter.value || void 0,
          user: userFilter.value || void 0,
          date: dateFilter.value || void 0,
          page: page.value,
          per: perPage
        }))
      },
      "$-Rd1YWZEgN"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const logs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.logs) != null ? _b : [];
    });
    const userNames = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.users) != null ? _b : [];
    });
    function severityActive(s) {
      return s === "info" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : s === "warning" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : s === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-gold-500/15 text-gold-400 border-gold-500/25";
    }
    function severityDot(s) {
      return s === "info" ? "bg-emerald-400" : s === "warning" ? "bg-yellow-400" : s === "error" ? "bg-red-400" : "bg-gray-500";
    }
    function exportCsv() {
      const rows = logs.value;
      if (!rows.length) return;
      const headers = ["Date", "User", "Action", "Entity", "Description", "Severity", "IP"];
      const lines = rows.map((l) => [
        String(l.created_at).slice(0, 19),
        l.user_name || "",
        l.action || "",
        l.module || "",
        `"${(l.description || "").replace(/"/g, '""')}"`,
        l.severity || "",
        l.ip_address || ""
      ].join(","));
      const csv = [headers.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = "audit-log.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Audit Trail",
        subtitle: "All system events \xB7 user actions \xB7 login history",
        breadcrumb: ["Admin", "Audit Trail"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u{1F4CA} Export CSV</button>`);
          } else {
            return [
              createVNode("button", {
                onClick: exportCsv,
                class: "btn-ghost text-xs"
              }, "\u{1F4CA} Export CSV")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4"><div class="flex flex-wrap items-center gap-3"><div class="flex gap-2"><!--[-->`);
      ssrRenderList(severities, (s) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
          (s === "All" ? !unref(severityFilter) : unref(severityFilter) === s) ? severityActive(s) : "text-gray-600 border-white/[0.07] hover:text-gray-400"
        ])}">${ssrInterpolate(s)}</button>`);
      });
      _push(`<!--]--></div><select class="field-input text-xs py-1.5 w-52"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(userFilter)) ? ssrLooseContain(unref(userFilter), "") : ssrLooseEqual(unref(userFilter), "")) ? " selected" : ""}>All Users</option><!--[-->`);
      ssrRenderList(unref(userNames), (u) => {
        _push(`<option${ssrRenderAttr("value", u.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(userFilter)) ? ssrLooseContain(unref(userFilter), u.id) : ssrLooseEqual(unref(userFilter), u.id)) ? " selected" : ""}>${ssrInterpolate(u.display_name)}</option>`);
      });
      _push(`<!--]--></select><input type="date"${ssrRenderAttr("value", unref(dateFilter))} class="field-input text-xs py-1.5 w-36"><button class="btn-ghost text-xs py-1.5">Reset</button><span class="text-xs text-gray-600 ml-auto">${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.total) != null ? _b : 0)} events</span></div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="glass-card overflow-hidden"><div class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(logs), (log) => {
          _push(`<div class="flex gap-4 p-4 hover:bg-white/[0.02] transition-colors"><div class="flex flex-col items-center shrink-0 mt-1.5"><div class="${ssrRenderClass(["w-2.5 h-2.5 rounded-full shrink-0", severityDot(log.severity)])}"></div></div><div class="flex-1 min-w-0"><div class="flex items-start justify-between gap-2"><p class="text-sm text-gray-200 leading-snug">${ssrInterpolate(log.description)}</p><span class="text-[10px] text-gray-600 shrink-0 font-mono whitespace-nowrap">${ssrInterpolate(String(log.created_at).slice(0, 16).replace("T", " "))}</span></div><div class="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1"><span class="text-[11px] text-gray-500 font-mono">${ssrInterpolate(log.user_name || "\u2014")}</span>`);
          if (log.module) {
            _push(`<span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">${ssrInterpolate(log.module)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (log.ip_address) {
            _push(`<span class="text-[11px] text-gray-700 font-mono">${ssrInterpolate(log.ip_address)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(logs).length) {
          _push(`<div class="py-12 text-center"><p class="text-2xl mb-2">\u{1F50D}</p><p class="text-sm text-gray-600">No events match the current filters</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        if (((_d = (_c = unref(data)) == null ? void 0 : _c.total) != null ? _d : 0) > perPage) {
          _push(`<div class="flex justify-center gap-2 items-center"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1.5"])}">\u2190 Prev</button><span class="text-xs text-gray-500">Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(((_f = (_e = unref(data)) == null ? void 0 : _e.total) != null ? _f : 0) / perPage))}</span><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(((_h = (_g = unref(data)) == null ? void 0 : _g.total) != null ? _h : 0) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1.5">Next \u2192</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/audit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=audit-D96XM8jV.mjs.map
