import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$4 } from './StatusBadge-CIXHKBxR.mjs';
import { n as navigateTo } from './server.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, unref, createTextVNode, openBlock, createBlock, createCommentVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-BSnAhZCp.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import './SidebarIcon-oZVkzwjh.mjs';
import 'vue-router';
import './permRoutes-D3m_BSE2.mjs';
import '@vue/shared';
import 'perfect-debounce';

const perPage = 30;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const search = ref("");
    const typeFilter = ref("");
    const page = ref(1);
    const typeFilters = [
      { value: "", label: "All" },
      { value: "credit", label: "Credit" },
      { value: "pos", label: "POS" }
    ];
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/customers",
      {
        query: computed(() => ({
          search: search.value,
          type: typeFilter.value,
          page: page.value,
          per: perPage
        }))
      },
      "$67oEpUy8Dg"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.customers) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    function fmtLakh(val) {
      const n = Number(val != null ? val : 0);
      if (n >= 1e7) return "\u09F3" + (n / 1e7).toFixed(1) + "Cr";
      if (n >= 1e5) return "\u09F3" + (n / 1e5).toFixed(1) + "L";
      return "\u09F3" + n.toLocaleString();
    }
    const cols = [
      { key: "name", label: "Name", sortable: true },
      { key: "business_name", label: "Business", sortable: true },
      { key: "phone_number", label: "Phone" },
      { key: "customer_type", label: "Type" },
      { key: "credit_limit", label: "Credit Limit" },
      { key: "current_balance", label: "Outstanding", sortable: true },
      { key: "status", label: "Status" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      const _component_UiStatusBadge = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Customers",
        subtitle: "Credit & POS customers \u2014 outstanding balances & limits",
        breadcrumb: ["Customers"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(perms).canDo("customers", "list", "create")) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/customers/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`+ Add Customer`);
                  } else {
                    return [
                      createTextVNode("+ Add Customer")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(perms).canDo("customers", "list", "create") ? (openBlock(), createBlock(_component_NuxtLink, {
                key: 0,
                to: "/customers/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Add Customer")
                ]),
                _: 1
              })) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`);
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Total Customers",
        value: String((_a = unref(stats).total_customers) != null ? _a : 0),
        trend: "registered",
        "trend-up": "",
        icon: "users",
        color: "blue"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Credit Customers",
        value: String((_b = unref(stats).credit_customers) != null ? _b : 0),
        trend: "Active credit lines",
        "trend-up": "",
        icon: "money",
        color: "gold"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Total Outstanding",
        value: fmtLakh(unref(stats).total_outstanding),
        trend: "current balance",
        icon: "chart",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Blacklisted",
        value: String((_c = unref(stats).blacklisted) != null ? _c : 0),
        trend: "Monitor",
        "trend-up": false,
        icon: "users",
        color: "red"
      }, null, _parent));
      _push(`</div><div class="flex gap-2"><!--[-->`);
      ssrRenderList(typeFilters, (f) => {
        _push(`<button class="${ssrRenderClass([
          "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
          unref(typeFilter) === f.value ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07] hover:text-gray-300"
        ])}">${ssrInterpolate(f.label)}</button>`);
      });
      _push(`<!--]--></div><div class="glass-card p-4 flex flex-wrap items-center gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search by name, business, phone\u2026"><button class="btn-ghost text-xs py-1.5">Reset</button><div class="ml-auto text-xs text-gray-500"><span class="font-medium text-gray-300">${ssrInterpolate((_e = (_d = unref(data)) == null ? void 0 : _d.total) != null ? _e : 0)}</span> customers </div></div>`);
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
          onRowClick: (r) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/customers/${r.id}`)
        }, {
          "cell-customer_type": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          "cell-credit_limit": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gray-300"${_scopeId}>${ssrInterpolate(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "N/A")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gray-300" }, toDisplayString(Number(value) > 0 ? "\u09F3" + Number(value).toLocaleString() : "N/A"), 1)
              ];
            }
          }),
          "cell-current_balance": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(["font-semibold font-mono text-xs", Number(value) > 0 ? "text-red-400" : "text-gray-500"])}"${_scopeId}> \u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: ["font-semibold font-mono text-xs", Number(value) > 0 ? "text-red-400" : "text-gray-500"]
                }, " \u09F3" + toDisplayString(Number(value).toLocaleString()), 3)
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
                to: `/customers/${row.id}`,
                class: "btn-ghost text-xs py-1 px-2.5"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`View`);
                  } else {
                    return [
                      createTextVNode("View")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/customers/${row.id}`,
                  class: "btn-ghost text-xs py-1 px-2.5"
                }, {
                  default: withCtx(() => [
                    createTextVNode("View")
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      if (((_g = (_f = unref(data)) == null ? void 0 : _f.total) != null ? _g : 0) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(((_i = (_h = unref(data)) == null ? void 0 : _h.total) != null ? _i : 0) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(((_k = (_j = unref(data)) == null ? void 0 : _j.total) != null ? _k : 0) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/customers/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BTPmr9F0.mjs.map
