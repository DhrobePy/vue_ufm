import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const cols = [
      { key: "driver_name", label: "Name", sortable: true },
      { key: "phone_number", label: "Phone" },
      { key: "license_type", label: "License Type" },
      { key: "license_expiry_date", label: "License Expiry" },
      { key: "assigned_vehicle", label: "Assigned Vehicle" },
      { key: "total_trips", label: "Total Trips", sortable: true },
      { key: "rating", label: "Rating", sortable: true },
      { key: "status", label: "Status" }
    ];
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/logistics/drivers",
      "$yKYcEZpZX3"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.drivers) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : { total: 0, active: 0, on_leave: 0 };
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Drivers",
        breadcrumb: ["Logistics", "Drivers"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/logistics/drivers/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Add Driver`);
                } else {
                  return [
                    createTextVNode("+ Add Driver")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/logistics/drivers/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Add Driver")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-3 gap-4"><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gold-400">${ssrInterpolate(unref(stats).total)}</p><p class="text-xs text-gray-500 mt-1">Total Drivers</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate(unref(stats).active)}</p><p class="text-xs text-gray-500 mt-1">Active</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-amber-400">${ssrInterpolate(unref(stats).on_leave)}</p><p class="text-xs text-gray-500 mt-1">On Leave</p></div></div>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(rows),
        "per-page": 10,
        exportable: "",
        "search-placeholder": "Search drivers\u2026"
      }, {
        "cell-driver_name": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-medium text-gray-200"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-medium text-gray-200" }, toDisplayString(value), 1)
            ];
          }
        }),
        "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, {
              status: value == null ? void 0 : value.toLowerCase()
            }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, {
                status: value == null ? void 0 : value.toLowerCase()
              }, null, 8, ["status"])
            ];
          }
        }),
        "cell-license_expiry_date": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="${ssrRenderClass(["text-xs", value && new Date(value) < /* @__PURE__ */ new Date() ? "text-red-400 font-bold" : "text-gray-400"])}"${_scopeId}>${ssrInterpolate(value != null ? value : "\u2014")}</span>`);
          } else {
            return [
              createVNode("span", {
                class: ["text-xs", value && new Date(value) < /* @__PURE__ */ new Date() ? "text-red-400 font-bold" : "text-gray-400"]
              }, toDisplayString(value != null ? value : "\u2014"), 3)
            ];
          }
        }),
        "cell-rating": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="flex items-center gap-1 text-xs"${_scopeId}>\u2B50 <span class="text-gray-300 font-medium"${_scopeId}>${ssrInterpolate(value != null ? value : "\u2014")}</span></span>`);
          } else {
            return [
              createVNode("span", { class: "flex items-center gap-1 text-xs" }, [
                createTextVNode("\u2B50 "),
                createVNode("span", { class: "text-gray-300 font-medium" }, toDisplayString(value != null ? value : "\u2014"), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/logistics/drivers/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bo643IFg.mjs.map
