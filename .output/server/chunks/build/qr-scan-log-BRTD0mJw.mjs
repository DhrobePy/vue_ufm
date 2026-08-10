import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, openBlock, createBlock, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
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
  __name: "qr-scan-log",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const dateFrom = ref("");
    const dateTo = ref("");
    const reusedOnly = ref(false);
    const route = useRoute();
    if (route.query.reused_only === "1") reusedOnly.value = true;
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/qr-scan-log",
      {
        query: computed(() => ({
          search: search.value || void 0,
          date_from: dateFrom.value || void 0,
          date_to: dateTo.value || void 0,
          reused_only: reusedOnly.value ? "1" : void 0
        }))
      },
      "$_8mvrz0gvg"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.rows) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const cols = [
      { key: "order_number", label: "Order #" },
      { key: "stage", label: "Stage" },
      { key: "scanned_by_name", label: "Scanned By" },
      { key: "ip", label: "IP" },
      { key: "scanned_at", label: "Scanned At", sortable: true },
      { key: "reused", label: "Status" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiDataTable = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Delivery QR Scan Log",
        subtitle: "Every gate/delivery QR scan attempt \u2014 flags a re-scan after an order is already delivered",
        breadcrumb: ["Credit Sales", "QR Scan Log"]
      }, null, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-3 gap-4"><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Total Scans</p><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total) != null ? _a : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Re-scans (7d)</p><p class="text-2xl font-bold text-red-400">${ssrInterpolate((_b = unref(stats).reused_7d) != null ? _b : 0)}</p></div><div class="glass-card p-4"><p class="text-xs text-gray-500 mb-1">Re-scans (all time)</p><p class="text-2xl font-bold text-amber-400">${ssrInterpolate((_c = unref(stats).reused_total) != null ? _c : 0)}</p></div></div><div class="glass-card p-4 flex flex-wrap items-center gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="input-glass w-52 text-xs" placeholder="Search order #\u2026"><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="input-glass w-auto text-xs"><span class="text-xs text-gray-600">to</span><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="input-glass w-auto text-xs"><label class="flex items-center gap-2 text-xs text-gray-400 cursor-pointer ml-auto"><input${ssrIncludeBooleanAttr(Array.isArray(unref(reusedOnly)) ? ssrLooseContain(unref(reusedOnly), null) : unref(reusedOnly)) ? " checked" : ""} type="checkbox" class="accent-gold-500"> Re-scans only </label></div><div class="glass-card p-5">`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: cols,
        rows: unref(rows),
        "per-page": 20,
        "search-placeholder": ""
      }, {
        "cell-order_number": withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (row.credit_order_id) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/credit-sales/${row.credit_order_id}`,
                class: "font-mono text-xs text-gold-400/80 hover:text-gold-300"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(row.order_number)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(row.order_number), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              _push2(`<span class="font-mono text-xs text-gray-500"${_scopeId}>${ssrInterpolate(row.order_number)}</span>`);
            }
          } else {
            return [
              row.credit_order_id ? (openBlock(), createBlock(_component_NuxtLink, {
                key: 0,
                to: `/credit-sales/${row.credit_order_id}`,
                class: "font-mono text-xs text-gold-400/80 hover:text-gold-300"
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(row.order_number), 1)
                ]),
                _: 2
              }, 1032, ["to"])) : (openBlock(), createBlock("span", {
                key: 1,
                class: "font-mono text-xs text-gray-500"
              }, toDisplayString(row.order_number), 1))
            ];
          }
        }),
        "cell-stage": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-xs text-gray-400"${_scopeId}>${ssrInterpolate(value != null ? value : "\u2014")}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-xs text-gray-400" }, toDisplayString(value != null ? value : "\u2014"), 1)
            ];
          }
        }),
        "cell-scanned_by_name": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-xs text-gray-300"${_scopeId}>${ssrInterpolate(value != null ? value : "\u2014")}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-xs text-gray-300" }, toDisplayString(value != null ? value : "\u2014"), 1)
            ];
          }
        }),
        "cell-ip": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-[11px] text-gray-600"${_scopeId}>${ssrInterpolate(value != null ? value : "\u2014")}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-[11px] text-gray-600" }, toDisplayString(value != null ? value : "\u2014"), 1)
            ];
          }
        }),
        "cell-scanned_at": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-xs text-gray-500"${_scopeId}>${ssrInterpolate(new Date(value).toLocaleString("en-GB"))}</span>`);
          } else {
            return [
              createVNode("span", { class: "text-xs text-gray-500" }, toDisplayString(new Date(value).toLocaleString("en-GB")), 1)
            ];
          }
        }),
        "cell-reused": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (value) {
              _push2(`<span class="badge bg-red-500/15 text-red-400 text-[10px]"${_scopeId}>\u26A0 Re-scan</span>`);
            } else {
              _push2(`<span class="badge bg-emerald-500/10 text-emerald-400 text-[10px]"${_scopeId}>First scan</span>`);
            }
          } else {
            return [
              value ? (openBlock(), createBlock("span", {
                key: 0,
                class: "badge bg-red-500/15 text-red-400 text-[10px]"
              }, "\u26A0 Re-scan")) : (openBlock(), createBlock("span", {
                key: 1,
                class: "badge bg-emerald-500/10 text-emerald-400 text-[10px]"
              }, "First scan"))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/qr-scan-log.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=qr-scan-log-BRTD0mJw.mjs.map
