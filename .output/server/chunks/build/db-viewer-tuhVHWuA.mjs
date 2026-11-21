import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import '@opentelemetry/api';
import 'standardwebhooks';
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
  __name: "db-viewer",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const table = ref(""), q = ref(""), page = ref(1), filter = ref("");
    const { data: list, pending: listPending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/db-viewer",
      "$Ji1e2vP5vA"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const shownTables = computed(() => {
      var _a, _b;
      return ((_b = (_a = list.value) == null ? void 0 : _a.tables) != null ? _b : []).filter((t) => t.name.toLowerCase().includes(filter.value.toLowerCase()));
    });
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/db-viewer",
      { query: computed(() => ({ table: table.value || void 0, q: q.value || void 0, page: page.value })), immediate: false, watch: false },
      "$QEJVnQyfbS"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "DB Viewer",
        subtitle: "Read-only look at the database \u2014 Superadmin only",
        breadcrumb: ["Admin", "DB Viewer"]
      }, null, _parent));
      _push(`<div class="glass-card p-3 text-xs text-gray-500">Read-only by design: edits and deletes made here would skip the ledger, balances and audit trail, so they are not offered. Password and token columns are hidden.</div>`);
      if (!unref(table)) {
        _push(`<div class="space-y-3"><input${ssrRenderAttr("value", unref(filter))} type="search" placeholder="Find a table\u2026" class="field-input text-xs py-1.5 w-64">`);
        if (unref(listPending)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
        } else {
          _push(`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"><!--[-->`);
          ssrRenderList(unref(shownTables), (t) => {
            _push(`<button class="glass-card px-3 py-2 text-left hover:border-gold-500/30"><p class="text-xs font-mono text-gray-200 truncate">${ssrInterpolate(t.name)}`);
            if (t.view) {
              _push(`<span class="text-gray-600"> (view)</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p><p class="text-[10px] text-gray-600">\u2248 ${ssrInterpolate(t.rows.toLocaleString())} rows</p></button>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!--[--><div class="flex flex-wrap items-center gap-2"><button class="btn-ghost text-xs">\u2190 All tables</button><strong class="font-mono text-sm text-gray-100">${ssrInterpolate(unref(table))}</strong><input${ssrRenderAttr("value", unref(q))} type="search" placeholder="Search this table\u2026" class="field-input text-xs py-1.5 w-64"><button class="btn-ghost text-xs">Search</button><button class="btn-ghost text-xs ml-auto"${ssrIncludeBooleanAttr(!((_b = (_a = unref(data)) == null ? void 0 : _a.rows) == null ? void 0 : _b.length)) ? " disabled" : ""}>Export this page (CSV)</button></div>`);
        if (unref(pending)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
        } else if (unref(error)) {
          _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
        } else if ((_c = unref(data)) == null ? void 0 : _c.rows) {
          _push(`<!--[--><p class="text-[11px] text-gray-600">${ssrInterpolate(unref(data).total.toLocaleString())} rows \xB7 page ${ssrInterpolate(unref(data).page)} of ${ssrInterpolate(Math.max(1, Math.ceil(unref(data).total / unref(data).per)))}`);
          if (unref(data).hidden.length) {
            _push(`<span> \xB7 hidden columns: ${ssrInterpolate(unref(data).hidden.join(", "))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p><div class="glass-card overflow-auto max-h-[70vh]"><table class="w-full text-[11px]"><thead class="sticky top-0 bg-[var(--bg-card,#14110d)]"><tr class="text-gray-500 uppercase tracking-wide"><!--[-->`);
          ssrRenderList(unref(data).columns, (c) => {
            _push(`<th class="px-2 py-1.5 text-left whitespace-nowrap">${ssrInterpolate(c.name)}`);
            if (c.pk) {
              _push(`<span class="text-gold-400"> \u{1F511}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</th>`);
          });
          _push(`<!--]--></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(data).rows, (r, i) => {
            _push(`<tr class="border-t border-white/[0.04] hover:bg-white/[0.02]"><!--[-->`);
            ssrRenderList(unref(data).columns, (c) => {
              var _a2;
              _push(`<td class="px-2 py-1 font-mono text-gray-300 whitespace-nowrap max-w-[22rem] truncate"${ssrRenderAttr("title", String((_a2 = r[c.name]) != null ? _a2 : ""))}>${ssrInterpolate(r[c.name] === null ? "\u2205" : r[c.name])}</td>`);
            });
            _push(`<!--]--></tr>`);
          });
          _push(`<!--]--></tbody></table></div><div class="flex gap-2"><button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""}>\u2039 Prev</button><button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(unref(page) * unref(data).per >= unref(data).total) ? " disabled" : ""}>Next \u203A</button></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/db-viewer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=db-viewer-tuhVHWuA.mjs.map
