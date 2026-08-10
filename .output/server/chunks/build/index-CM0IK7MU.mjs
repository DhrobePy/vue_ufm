import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { k as useRoute, n as navigateTo } from './server.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
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

const perPage = 25;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const search = ref(route.query.search || "");
    const statusFilter = ref(route.query.status || "");
    const deliveryFilter = ref(route.query.delivery_status || "");
    const paymentFilter = ref(route.query.payment_status || "");
    const originFilter = ref(route.query.origin || "");
    const dateFrom = ref("");
    const dateTo = ref("");
    const page = ref(1);
    const { data: commData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/commodities",
      "$X0LswBtWmR"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const allOrigins = computed(() => {
      var _a, _b;
      const set = /* @__PURE__ */ new Set();
      for (const c of (_b = (_a = commData.value) == null ? void 0 : _a.commodities) != null ? _b : []) for (const o of c.origins) set.add(o);
      return [...set].sort();
    });
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/orders",
      {
        query: computed(() => ({
          search: search.value,
          status: statusFilter.value,
          delivery_status: deliveryFilter.value,
          payment_status: paymentFilter.value,
          origin: originFilter.value,
          date_from: dateFrom.value,
          date_to: dateTo.value,
          page: page.value,
          per: perPage
        }))
      },
      "$p7itIUEMVc"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    function fmtDate(val) {
      if (!val) return "\u2014";
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    const rows = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : []).map((o) => ({
          ...o,
          po_date: fmtDate(o.po_date),
          expected_delivery_date: fmtDate(o.expected_delivery_date)
        }));
      }
    );
    const cols = [
      { key: "po_number", label: "PO #", sortable: true },
      { key: "supplier_name", label: "Supplier", sortable: true },
      { key: "po_date", label: "Date", sortable: true },
      { key: "commodity_name", label: "Commodity" },
      { key: "wheat_origin", label: "Origin" },
      { key: "quantity_kg", label: "Qty (kg)" },
      { key: "total_order_value", label: "Total Value", sortable: true },
      { key: "po_status", label: "PO Status" },
      { key: "delivery_status", label: "Delivery" },
      { key: "payment_status", label: "Payment" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Purchase Orders",
        subtitle: "All wheat procurement orders",
        breadcrumb: ["Purchase", "All POs"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/orders/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Create PO`);
                } else {
                  return [
                    createTextVNode("+ Create PO")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/orders/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Create PO")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4 space-y-3"><div class="flex flex-wrap items-center gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search PO #, supplier\u2026"><select class="field-input text-xs py-1.5 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "") : ssrLooseEqual(unref(statusFilter), "")) ? " selected" : ""}>All Status</option><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "draft") : ssrLooseEqual(unref(statusFilter), "draft")) ? " selected" : ""}>Draft</option><option value="approved"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "approved") : ssrLooseEqual(unref(statusFilter), "approved")) ? " selected" : ""}>Approved</option><option value="partial"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "partial") : ssrLooseEqual(unref(statusFilter), "partial")) ? " selected" : ""}>Partial</option><option value="completed"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "completed") : ssrLooseEqual(unref(statusFilter), "completed")) ? " selected" : ""}>Completed</option><option value="cancelled"${ssrIncludeBooleanAttr(Array.isArray(unref(statusFilter)) ? ssrLooseContain(unref(statusFilter), "cancelled") : ssrLooseEqual(unref(statusFilter), "cancelled")) ? " selected" : ""}>Cancelled</option></select><select class="field-input text-xs py-1.5 w-40"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(deliveryFilter)) ? ssrLooseContain(unref(deliveryFilter), "") : ssrLooseEqual(unref(deliveryFilter), "")) ? " selected" : ""}>All Delivery</option><option value="pending"${ssrIncludeBooleanAttr(Array.isArray(unref(deliveryFilter)) ? ssrLooseContain(unref(deliveryFilter), "pending") : ssrLooseEqual(unref(deliveryFilter), "pending")) ? " selected" : ""}>Pending</option><option value="partial"${ssrIncludeBooleanAttr(Array.isArray(unref(deliveryFilter)) ? ssrLooseContain(unref(deliveryFilter), "partial") : ssrLooseEqual(unref(deliveryFilter), "partial")) ? " selected" : ""}>Partial</option><option value="closed"${ssrIncludeBooleanAttr(Array.isArray(unref(deliveryFilter)) ? ssrLooseContain(unref(deliveryFilter), "closed") : ssrLooseEqual(unref(deliveryFilter), "closed")) ? " selected" : ""}>Closed</option></select><select class="field-input text-xs py-1.5 w-40"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(paymentFilter)) ? ssrLooseContain(unref(paymentFilter), "") : ssrLooseEqual(unref(paymentFilter), "")) ? " selected" : ""}>All Payment</option><option value="unpaid"${ssrIncludeBooleanAttr(Array.isArray(unref(paymentFilter)) ? ssrLooseContain(unref(paymentFilter), "unpaid") : ssrLooseEqual(unref(paymentFilter), "unpaid")) ? " selected" : ""}>Unpaid</option><option value="partial"${ssrIncludeBooleanAttr(Array.isArray(unref(paymentFilter)) ? ssrLooseContain(unref(paymentFilter), "partial") : ssrLooseEqual(unref(paymentFilter), "partial")) ? " selected" : ""}>Partial</option><option value="paid"${ssrIncludeBooleanAttr(Array.isArray(unref(paymentFilter)) ? ssrLooseContain(unref(paymentFilter), "paid") : ssrLooseEqual(unref(paymentFilter), "paid")) ? " selected" : ""}>Paid</option></select><select class="field-input text-xs py-1.5 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(originFilter)) ? ssrLooseContain(unref(originFilter), "") : ssrLooseEqual(unref(originFilter), "")) ? " selected" : ""}>All Origins</option><!--[-->`);
      ssrRenderList(unref(allOrigins), (o) => {
        _push(`<option${ssrRenderAttr("value", o)}${ssrIncludeBooleanAttr(Array.isArray(unref(originFilter)) ? ssrLooseContain(unref(originFilter), o) : ssrLooseEqual(unref(originFilter), o)) ? " selected" : ""}>${ssrInterpolate(o)}</option>`);
      });
      _push(`<!--]--></select></div><div class="flex flex-wrap items-center gap-3"><div class="flex items-center gap-2 text-xs text-gray-500"><span>From:</span><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="field-input text-xs py-1 w-36"><span>To:</span><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="field-input text-xs py-1 w-36"></div><button class="btn-ghost text-xs py-1.5">Reset</button><div class="ml-auto text-xs text-gray-500"><span class="font-medium text-gray-300">${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.total) != null ? _b : 0)}</span> orders </div></div></div>`);
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
          onRowClick: (r) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/purchase/orders/${r.id}`)
        }, {
          "cell-po_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80 font-medium"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gold-400/80 font-medium" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-quantity_kg": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gray-300"${_scopeId}>${ssrInterpolate(Number(value).toLocaleString())} kg</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gray-300" }, toDisplayString(Number(value).toLocaleString()) + " kg", 1)
              ];
            }
          }),
          "cell-total_order_value": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gray-200 font-semibold"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-mono text-xs text-gray-200 font-semibold" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-po_status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          "cell-delivery_status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          "cell-payment_status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
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
                to: `/purchase/orders/${row.id}`,
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
                  to: `/purchase/orders/${row.id}`,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/orders/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CM0IK7MU.mjs.map
