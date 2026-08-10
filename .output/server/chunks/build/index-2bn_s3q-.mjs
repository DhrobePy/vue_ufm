import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './DataTable-COn8qGcx.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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
    const search = ref("");
    const page = ref(1);
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/payments",
      {
        query: computed(() => ({
          search: search.value,
          page: page.value,
          per: perPage
        }))
      },
      "$VDM53TVNUG"
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
        return ((_b = (_a = data.value) == null ? void 0 : _a.payments) != null ? _b : []).map((p) => ({
          ...p,
          payment_date: fmtDate(p.payment_date)
        }));
      }
    );
    const pageTotalPaid = computed(
      () => rows.value.reduce((s, p) => {
        var _a;
        return s + Number((_a = p.amount_paid) != null ? _a : 0);
      }, 0)
    );
    const cols = [
      { key: "payment_voucher_number", label: "Voucher #", sortable: true },
      { key: "payment_date", label: "Date", sortable: true },
      { key: "supplier_name", label: "Supplier", sortable: true },
      { key: "po_number", label: "PO #" },
      { key: "amount_paid", label: "Amount", sortable: true },
      { key: "payment_type", label: "Type" },
      { key: "payment_method", label: "Method" },
      { key: "reference_number", label: "Reference" }
    ];
    const typeStyles = {
      advance: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      credit: "bg-blue-500/10   text-blue-400   border-blue-500/20",
      against_delivery: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      contra: "bg-rose-500/10   text-rose-400   border-rose-500/20"
    };
    const typeLabels = {
      advance: "Advance",
      credit: "Credit",
      against_delivery: "Delivery",
      contra: "Contra"
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Purchase Payments",
        subtitle: "Supplier payment records",
        breadcrumb: ["Purchase", "Payments"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/payments/record",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Record Payment`);
                } else {
                  return [
                    createTextVNode("+ Record Payment")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/purchase/payments/record",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Record Payment")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-3 gap-4"><div class="glass-card p-4 text-center"><p class="text-xs text-gray-500 mb-1">Total Paid (Page)</p><p class="text-xl font-bold text-emerald-400">\u09F3${ssrInterpolate(unref(pageTotalPaid).toLocaleString())}</p></div><div class="glass-card p-4 text-center"><p class="text-xs text-gray-500 mb-1">Records (Total)</p><p class="text-xl font-bold text-gold-400">${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.total) != null ? _b : 0)}</p></div><div class="glass-card p-4 text-center"><p class="text-xs text-gray-500 mb-1">Page</p><p class="text-xl font-bold text-gray-300">${ssrInterpolate(unref(page))} / ${ssrInterpolate(Math.ceil(((_d = (_c = unref(data)) == null ? void 0 : _c.total) != null ? _d : 0) / perPage) || 1)}</p></div></div><div class="glass-card p-4 flex flex-wrap items-center gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search voucher #, supplier, PO\u2026"><button class="btn-ghost text-xs py-1.5">Reset</button></div>`);
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
          "search-placeholder": ""
        }, {
          "cell-payment_voucher_number": withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/purchase/payments/${row.id}`,
                class: "font-mono text-xs text-gold-400/80 hover:underline"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`${ssrInterpolate(row.payment_voucher_number)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(row.payment_voucher_number), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/purchase/payments/${row.id}`,
                  class: "font-mono text-xs text-gold-400/80 hover:underline"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(row.payment_voucher_number), 1)
                  ]),
                  _: 2
                }, 1032, ["to"])
              ];
            }
          }),
          "cell-amount_paid": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-semibold text-emerald-400 font-mono text-xs"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-semibold text-emerald-400 font-mono text-xs" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-payment_type": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d2, _e2, _f2;
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(_a2 = typeStyles[value]) != null ? _a2 : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`)}"${_scopeId}>${ssrInterpolate((_c2 = (_b2 = typeLabels[value]) != null ? _b2 : value) != null ? _c2 : "\u2014")}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: `px-2 py-0.5 rounded-full text-[10px] font-semibold border ${(_d2 = typeStyles[value]) != null ? _d2 : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`
                }, toDisplayString((_f2 = (_e2 = typeLabels[value]) != null ? _e2 : value) != null ? _f2 : "\u2014"), 3)
              ];
            }
          }),
          "cell-payment_method": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-gray-400 border border-white/10"${_scopeId}>${ssrInterpolate(value === "contra" ? "Contra Adj." : value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-gray-400 border border-white/10" }, toDisplayString(value === "contra" ? "Contra Adj." : value), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      if (((_f = (_e = unref(data)) == null ? void 0 : _e.total) != null ? _f : 0) > perPage) {
        _push(`<div class="flex items-center justify-between text-xs text-gray-500"><span>Page ${ssrInterpolate(unref(page))} of ${ssrInterpolate(Math.ceil(((_h = (_g = unref(data)) == null ? void 0 : _g.total) != null ? _h : 0) / perPage))}</span><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} class="${ssrRenderClass([unref(page) <= 1 ? "opacity-40" : "", "btn-ghost text-xs py-1 px-3"])}">\u2190 Prev</button><button${ssrIncludeBooleanAttr(unref(page) >= Math.ceil(((_j = (_i = unref(data)) == null ? void 0 : _i.total) != null ? _j : 0) / perPage)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">Next \u2192</button></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/payments/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-2bn_s3q-.mjs.map
