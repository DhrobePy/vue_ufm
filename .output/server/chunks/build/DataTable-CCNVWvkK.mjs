import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderSlot, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DataTable",
  __ssrInlineRender: true,
  props: {
    columns: {},
    rows: {},
    loading: { type: Boolean },
    searchPlaceholder: {},
    exportable: { type: Boolean },
    perPage: {},
    onRowClick: { type: Boolean }
  },
  emits: ["row-click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const search = ref("");
    const sortKey = ref("");
    const sortDir = ref("asc");
    const currentPage = ref(1);
    const perPage = computed(() => {
      var _a;
      return (_a = props.perPage) != null ? _a : 10;
    });
    const filteredRows = computed(() => {
      var _a;
      let rows = (_a = props.rows) != null ? _a : [];
      if (search.value) {
        const q = search.value.toLowerCase();
        rows = rows.filter((r) => Object.values(r).some((v) => String(v != null ? v : "").toLowerCase().includes(q)));
      }
      if (sortKey.value) {
        rows = [...rows].sort((a, b) => {
          var _a2, _b;
          const av = (_a2 = a[sortKey.value]) != null ? _a2 : "";
          const bv = (_b = b[sortKey.value]) != null ? _b : "";
          return sortDir.value === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });
      }
      return rows;
    });
    const totalPages = computed(() => Math.ceil(filteredRows.value.length / perPage.value));
    const paginatedRows = computed(() => filteredRows.value.slice((currentPage.value - 1) * perPage.value, currentPage.value * perPage.value));
    const pageNumbers = computed(() => {
      const total = totalPages.value;
      const cur = currentPage.value;
      if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
      if (cur <= 3) return [1, 2, 3, 4, 5];
      if (cur >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
      return [cur - 2, cur - 1, cur, cur + 1, cur + 2];
    });
    watch(search, () => {
      currentPage.value = 1;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "glass-card overflow-hidden" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-white/[0.06]"><div class="relative"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg><input${ssrRenderAttr("value", unref(search))} type="text"${ssrRenderAttr("placeholder", __props.searchPlaceholder || "Search\u2026")} class="input-glass pl-9 pr-3 py-2 text-xs w-60"></div><div class="flex items-center gap-2">`);
      ssrRenderSlot(_ctx.$slots, "toolbar", {}, null, _push, _parent);
      if (__props.exportable) {
        _push(`<button class="btn-ghost text-xs py-1.5"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Export </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="overflow-x-auto"><table class="w-full"><thead><tr class="border-b border-white/[0.05]"><!--[-->`);
      ssrRenderList(__props.columns, (col) => {
        _push(`<th class="${ssrRenderClass([
          "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600 whitespace-nowrap select-none",
          col.sortable ? "cursor-pointer hover:text-gray-400 transition-colors" : ""
        ])}"><span class="flex items-center gap-1.5">${ssrInterpolate(col.label)} `);
        if (col.sortable) {
          _push(`<span class="flex flex-col gap-0.5"><svg class="${ssrRenderClass(["w-2.5 h-2.5 transition-colors", unref(sortKey) === col.key && unref(sortDir) === "asc" ? "text-gold-400" : "text-gray-700"])}" viewBox="0 0 10 6" fill="currentColor"><path d="M0 6l5-6 5 6H0z"></path></svg><svg class="${ssrRenderClass(["w-2.5 h-2.5 transition-colors", unref(sortKey) === col.key && unref(sortDir) === "desc" ? "text-gold-400" : "text-gray-700"])}" viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6H0z"></path></svg></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</span></th>`);
      });
      _push(`<!--]-->`);
      if (_ctx.$slots.actions) {
        _push(`<th class="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600">Actions</th>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tr></thead><tbody class="divide-y divide-white/[0.04]">`);
      if (__props.loading) {
        _push(`<!--[-->`);
        ssrRenderList(6, (i) => {
          _push(`<tr><!--[-->`);
          ssrRenderList(__props.columns, (col) => {
            _push(`<td class="px-4 py-3.5"><div class="skeleton h-3.5 rounded" style="${ssrRenderStyle(`width: ${50 + Math.random() * 40}%`)}"></div></td>`);
          });
          _push(`<!--]-->`);
          if (_ctx.$slots.actions) {
            _push(`<td class="px-4 py-3.5"><div class="skeleton h-3.5 w-16 rounded ml-auto"></div></td>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tr>`);
        });
        _push(`<!--]-->`);
      } else if (unref(paginatedRows).length) {
        _push(`<!--[-->`);
        ssrRenderList(unref(paginatedRows), (row, i) => {
          _push(`<tr class="${ssrRenderClass(["transition-colors duration-100 group", __props.onRowClick ? "cursor-pointer hover:bg-white/[0.03]" : ""])}"><!--[-->`);
          ssrRenderList(__props.columns, (col) => {
            _push(`<td class="px-4 py-3.5 text-sm">`);
            ssrRenderSlot(_ctx.$slots, `cell-${col.key}`, {
              row,
              value: row[col.key]
            }, () => {
              var _a;
              _push(`<span class="text-gray-300">${ssrInterpolate((_a = row[col.key]) != null ? _a : "\u2014")}</span>`);
            }, _push, _parent);
            _push(`</td>`);
          });
          _push(`<!--]-->`);
          if (_ctx.$slots.actions) {
            _push(`<td class="px-4 py-3.5"><div class="flex items-center justify-end gap-1.5">`);
            ssrRenderSlot(_ctx.$slots, "actions", { row }, null, _push, _parent);
            _push(`</div></td>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tr>`);
        });
        _push(`<!--]-->`);
      } else {
        _push(`<tr><td${ssrRenderAttr("colspan", __props.columns.length + (_ctx.$slots.actions ? 1 : 0))} class="px-4 py-16 text-center"><div class="flex flex-col items-center gap-2"><div class="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-1"><svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg></div><p class="text-sm font-medium text-gray-500">No records found</p><p class="text-xs text-gray-700">${ssrInterpolate(unref(search) ? "Try a different search term" : "Nothing here yet")}</p></div></td></tr>`);
      }
      _push(`</tbody></table></div>`);
      if (!__props.loading && unref(filteredRows).length > unref(perPage)) {
        _push(`<div class="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]"><span class="text-xs text-gray-600"> Showing ${ssrInterpolate((unref(currentPage) - 1) * unref(perPage) + 1)}\u2013${ssrInterpolate(Math.min(unref(currentPage) * unref(perPage), unref(filteredRows).length))} of ${ssrInterpolate(unref(filteredRows).length)}</span><div class="flex items-center gap-1"><button${ssrIncludeBooleanAttr(unref(currentPage) === 1) ? " disabled" : ""} class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button><!--[-->`);
        ssrRenderList(unref(pageNumbers), (p) => {
          _push(`<button class="${ssrRenderClass([
            "w-7 h-7 rounded-lg text-xs font-medium transition-all duration-150",
            p === unref(currentPage) ? "bg-gold-500/15 text-gold-400 border border-gold-500/25" : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.07]"
          ])}">${ssrInterpolate(p)}</button>`);
        });
        _push(`<!--]--><button${ssrIncludeBooleanAttr(unref(currentPage) === unref(totalPages)) ? " disabled" : ""} class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/DataTable.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=DataTable-CCNVWvkK.mjs.map
