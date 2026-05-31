import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './DataTable-CCNVWvkK.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { n as navigateTo } from './server.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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

const perPage = 25;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const page = ref(1);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/suppliers",
      {
        query: computed(() => ({
          search: search.value,
          page: page.value,
          per: perPage
        }))
      },
      "$Uloe7PBgvU"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.suppliers) != null ? _b : [];
    });
    const cols = [
      { key: "supplier_code", label: "Code", sortable: true },
      { key: "company_name", label: "Company", sortable: true },
      { key: "contact_person", label: "Contact" },
      { key: "phone", label: "Phone" },
      { key: "city", label: "City" },
      { key: "supplier_type", label: "Type" },
      { key: "total_pos", label: "POs" },
      { key: "current_balance", label: "Balance (\u09F3)", sortable: true },
      { key: "status", label: "Status" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Suppliers",
        subtitle: "All registered wheat suppliers",
        breadcrumb: ["Purchase", "Suppliers"]
      }, null, _parent));
      _push(`<div class="glass-card p-4 flex flex-wrap items-center gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search company, code, phone\u2026"><button class="btn-ghost text-xs py-1.5">Reset</button><div class="ml-auto text-xs text-gray-500"><span class="font-medium text-gray-300">${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.total) != null ? _b : 0)}</span> suppliers </div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(rows),
          "per-page": perPage,
          exportable: "",
          "search-placeholder": "",
          onRowClick: (r) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/purchase/suppliers/${r.id}/ledger`)
        }, {
          "cell-supplier_code": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-current_balance": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(["font-semibold font-mono text-xs", Number(value) > 0 ? "text-red-400" : "text-emerald-400"])}"${_scopeId}> \u09F3${ssrInterpolate(Number(Math.abs(value)).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: ["font-semibold font-mono text-xs", Number(value) > 0 ? "text-red-400" : "text-emerald-400"]
                }, " \u09F3" + toDisplayString(Number(Math.abs(value)).toLocaleString()), 3)
              ];
            }
          }),
          "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/purchase/suppliers/${row.id}/ledger`,
                class: "btn-ghost text-xs py-1 px-2.5"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Ledger`);
                  } else {
                    return [
                      createTextVNode("Ledger")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/purchase/suppliers/${row.id}/ledger`,
                  class: "btn-ghost text-xs py-1 px-2.5"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Ledger")
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      if (((_d = (_c = unref(data)) == null ? void 0 : _c.total) != null ? _d : 0) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(((_f = (_e = unref(data)) == null ? void 0 : _e.total) != null ? _f : 0) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(((_h = (_g = unref(data)) == null ? void 0 : _g.total) != null ? _h : 0) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/suppliers/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-_yw1QZqp.mjs.map
