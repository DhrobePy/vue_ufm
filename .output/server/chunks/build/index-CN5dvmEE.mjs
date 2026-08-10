import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$4 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { p as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import './SidebarIcon-oZVkzwjh.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { user: sessionUser } = useUserSession();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const poCols = [
      { key: "po_number", label: "PO #", sortable: true },
      { key: "supplier_name", label: "Supplier", sortable: true },
      { key: "qty_mt", label: "Qty (MT)" },
      { key: "value", label: "Value (\u09F3)" },
      { key: "status", label: "Status" },
      { key: "payment_status", label: "Payment" }
    ];
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/purchase/dashboard",
      "$wb-QVvjB74"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const recentPOs = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recentPOs) != null ? _b : [];
    });
    const topSuppliers = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.topSuppliers) != null ? _b : [];
    });
    const originStats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.originStats) != null ? _b : [];
    });
    const totalReceivedMT = computed(
      () => originStats.value.reduce((s, o) => {
        var _a;
        return s + Number((_a = o.received_mt) != null ? _a : 0);
      }, 0)
    );
    function originPct(o) {
      const total = totalReceivedMT.value;
      if (!total) return 0;
      return Math.round(Number(o.received_mt) / total * 100);
    }
    function fmtCr(v) {
      const n = Number(v != null ? v : 0);
      if (n >= 1e7) return `${(n / 1e7).toFixed(2)}Cr`;
      if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
      return n.toLocaleString();
    }
    const statusPills = [
      { label: "Active POs", query: "status=approved", color: "#f59e0b" },
      { label: "Pending Delivery", query: "delivery_status=partial", color: "#06b6d4" },
      { label: "Completed", query: "status=completed", color: "#10b981" },
      { label: "Unpaid", query: "payment_status=unpaid", color: "#ef4444" },
      { label: "Cancelled", query: "status=cancelled", color: "#6b7280" }
    ];
    const showRecon = ref(false);
    const reconLoading = ref(false);
    const reconLoaded = ref(false);
    const reconData = ref(null);
    const reconChecks = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
      if (!reconData.value) return [];
      const d = reconData.value;
      return [
        {
          key: "check1",
          label: "Balance Payable Accuracy",
          description: "POs where stored balance_payable differs from computed (paid vs order value) by more than \u09F31",
          count: (_b = (_a = d.check1) == null ? void 0 : _a.length) != null ? _b : 0,
          rows: (_c = d.check1) != null ? _c : []
        },
        {
          key: "check2",
          label: "Origin Remarks Consistency",
          description: 'POs with wheat_origin = "Other" but no remarks explaining the origin',
          count: (_e = (_d = d.check2) == null ? void 0 : _d.length) != null ? _e : 0,
          rows: (_f = d.check2) != null ? _f : []
        },
        {
          key: "check3",
          label: "Stale Adjustment Notes",
          description: "Adjustment notes in draft/approved status older than 7 days (possibly stuck)",
          count: (_h = (_g = d.check3) == null ? void 0 : _g.length) != null ? _h : 0,
          rows: (_i = d.check3) != null ? _i : []
        },
        {
          key: "check4",
          label: "GRN Line Total Accuracy",
          description: "GRNs where the stored total_value doesn't match quantity \xD7 unit price by more than \u09F31",
          count: (_k = (_j = d.check4) == null ? void 0 : _j.length) != null ? _k : 0,
          rows: (_l = d.check4) != null ? _l : []
        },
        {
          key: "check5",
          label: "Overpayment Not Flagged",
          description: `POs where posted payments exceed the total payable but payment_status isn't "overpaid"`,
          count: (_n = (_m = d.check5) == null ? void 0 : _m.length) != null ? _n : 0,
          rows: (_o = d.check5) != null ? _o : []
        },
        {
          key: "check6",
          label: "Completed With No GRN",
          description: "POs marked delivery-completed/closed with zero recorded (non-cancelled) GRNs",
          count: (_q = (_p = d.check6) == null ? void 0 : _p.length) != null ? _q : 0,
          rows: (_r = d.check6) != null ? _r : []
        },
        {
          key: "check7",
          label: "Received Quantity Accuracy",
          description: "POs where the stored total_received_qty differs from the live GRN sum by more than 1 kg",
          count: (_t = (_s = d.check7) == null ? void 0 : _s.length) != null ? _t : 0,
          rows: (_u = d.check7) != null ? _u : []
        }
      ];
    });
    const totalIssues = computed(
      () => reconChecks.value.reduce((s, c) => s + c.count, 0)
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      const _component_UiStatusBadge = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Purchase",
        subtitle: "Procure-to-pay \xB7 Wheat procurement management",
        breadcrumb: ["Purchase"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/purchase/orders/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New PO`);
                } else {
                  return [
                    createTextVNode("+ New PO")
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
                  createTextVNode("+ New PO")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`);
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Active POs",
        value: (_a = unref(stats).active_pos) != null ? _a : 0,
        trend: "pending/approved",
        "trend-up": "",
        icon: "file",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "GRNs Pending",
        value: (_b = unref(stats).grns_pending) != null ? _b : 0,
        trend: "Needs receipt",
        "trend-up": false,
        icon: "check",
        color: "yellow"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Total Payable",
        value: `\u09F3${fmtCr(unref(stats).total_payable)}`,
        trend: "Outstanding balance",
        "trend-up": false,
        icon: "money",
        color: "red"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Wheat Received",
        value: `${Number((_c = unref(stats).wheat_received_mt) != null ? _c : 0).toFixed(1)} MT`,
        trend: "All time",
        "trend-up": "",
        icon: "box",
        color: "teal"
      }, null, _parent));
      _push(`</div><div class="flex flex-wrap gap-2"><!--[-->`);
      ssrRenderList(statusPills, (pill) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: pill.label,
          to: `/purchase/orders?${pill.query}`,
          class: "text-xs px-3 py-1.5 rounded-full border transition-colors",
          style: `border-color:${pill.color}40; background:${pill.color}12; color:${pill.color}`
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(pill.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(pill.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Recent Purchase Orders</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/orders",
        class: "text-xs text-gold-500 hover:text-gold-400 font-medium"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`View all \u2192`);
          } else {
            return [
              createTextVNode("View all \u2192")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: poCols,
        rows: unref(recentPOs),
        "per-page": 8,
        "search-placeholder": "Search POs\u2026"
      }, {
        "cell-po_number": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-gold-400/80"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-gold-400/80" }, toDisplayString(value), 1)
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
        "cell-payment_status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
            ];
          }
        }),
        "cell-value": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="font-mono text-xs text-gray-300"${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
          } else {
            return [
              createVNode("span", { class: "font-mono text-xs text-gray-300" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Top Suppliers</h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/suppliers",
        class: "text-xs text-gold-500 hover:text-gold-400 font-medium"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`View all \u2192`);
          } else {
            return [
              createTextVNode("View all \u2192")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="space-y-3"><!--[-->`);
      ssrRenderList(unref(topSuppliers), (s) => {
        var _a2;
        _push(`<div class="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"><div class="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">${ssrInterpolate(((_a2 = s.name) != null ? _a2 : "?")[0])}</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(s.name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(s.type)} \xB7 ${ssrInterpolate(s.orders)} orders</p></div><div class="text-right"><p class="text-xs font-semibold text-gold-400">\u09F3${ssrInterpolate(fmtCr(s.amount))}</p>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: s.status
        }, null, _parent));
        _push(`</div></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(topSuppliers).length) {
        _push(`<p class="text-xs text-gray-600 text-center py-4">No suppliers yet</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
      if (unref(originStats).length) {
        _push(`<div class="glass-card p-5"><h2 class="section-title mb-4">Wheat Origin Breakdown</h2><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Origin</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">POs</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Received (MT)</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Total Value</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">% of Total</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(originStats), (o) => {
          _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.02]"><td class="py-2.5 px-3"><span class="font-medium text-gray-200">${ssrInterpolate(o.origin)}</span></td><td class="py-2.5 px-3 text-right text-gray-400">${ssrInterpolate(o.pos)}</td><td class="py-2.5 px-3 text-right font-mono font-semibold text-teal-400">${ssrInterpolate(Number(o.received_mt).toLocaleString())} MT</td><td class="py-2.5 px-3 text-right font-mono text-gray-200">\u09F3${ssrInterpolate(fmtCr(o.total_value))}</td><td class="py-2.5 px-3 text-right"><div class="flex items-center justify-end gap-2"><div class="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full bg-gold-500/60 transition-all" style="${ssrRenderStyle(`width:${originPct(o)}%`)}"></div></div><span class="text-gray-500 w-8 text-right">${ssrInterpolate(originPct(o))}%</span></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-5"><h2 class="section-title mb-4">Quick Links</h2><div class="flex flex-wrap gap-3">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/orders",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u{1F4CB} Purchase Orders`);
          } else {
            return [
              createTextVNode("\u{1F4CB} Purchase Orders")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/grn",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u{1F4E6} GRN List`);
          } else {
            return [
              createTextVNode("\u{1F4E6} GRN List")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/grn/variance",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u{1F4CA} Variance Report`);
          } else {
            return [
              createTextVNode("\u{1F4CA} Variance Report")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/payments",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u{1F4B3} Payments`);
          } else {
            return [
              createTextVNode("\u{1F4B3} Payments")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/adjustments",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2696 Adjustment Notes`);
          } else {
            return [
              createTextVNode("\u2696 Adjustment Notes")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/suppliers",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u{1F3ED} Suppliers`);
          } else {
            return [
              createTextVNode("\u{1F3ED} Suppliers")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/purchase/suppliers/summary",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u{1F4C8} Supplier Summary`);
          } else {
            return [
              createTextVNode("\u{1F4C8} Supplier Summary")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(isAdmin)) {
        _push(`<div class="glass-card p-5 space-y-4"><div class="flex items-center justify-between cursor-pointer"><div><h2 class="section-title">Data Integrity Checks</h2><p class="text-xs text-gray-600 mt-0.5">Admin-only reconciliation \xB7 click to expand</p></div><div class="flex items-center gap-3">`);
        if (unref(reconLoaded)) {
          _push(`<span class="${ssrRenderClass([
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            unref(totalIssues) === 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
          ])}">${ssrInterpolate(unref(totalIssues) === 0 ? "All Clear" : `${unref(totalIssues)} issue${unref(totalIssues) !== 1 ? "s" : ""}`)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button${ssrIncludeBooleanAttr(unref(reconLoading)) ? " disabled" : ""} class="btn-ghost text-xs py-1 px-3">${ssrInterpolate(unref(reconLoading) ? "Checking\u2026" : "Run Check")}</button><span class="text-gray-500 text-sm">${ssrInterpolate(unref(showRecon) ? "\u25B2" : "\u25BC")}</span></div></div>`);
        if (unref(showRecon) && unref(reconLoaded)) {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(reconChecks), (check) => {
            var _a2;
            _push(`<div class="rounded-xl p-4 border" style="${ssrRenderStyle(check.count === 0 ? "background:rgba(16,185,129,0.04);border-color:rgba(16,185,129,0.15)" : "background:rgba(239,68,68,0.05);border-color:rgba(239,68,68,0.20)")}"><div class="flex items-start justify-between gap-3"><div class="flex items-center gap-2.5"><span class="text-base">${ssrInterpolate(check.count === 0 ? "\u2705" : "\u26A0\uFE0F")}</span><div><p class="text-xs font-semibold text-gray-200">${ssrInterpolate(check.label)}</p><p class="text-[11px] text-gray-500 mt-0.5">${ssrInterpolate(check.description)}</p></div></div><span class="${ssrRenderClass(["text-sm font-bold", check.count === 0 ? "text-emerald-400" : "text-red-400"])}">${ssrInterpolate(check.count)}</span></div>`);
            if (check.count > 0 && ((_a2 = check.rows) == null ? void 0 : _a2.length)) {
              _push(`<div class="mt-3 space-y-1.5"><!--[-->`);
              ssrRenderList(check.rows.slice(0, 5), (row) => {
                var _a3, _b2;
                _push(`<div class="flex items-center gap-3 text-[11px] text-gray-500 border-t border-white/[0.04] pt-1.5">`);
                if (row.id || row.po_id) {
                  _push(ssrRenderComponent(_component_NuxtLink, {
                    to: `/purchase/orders/${(_a3 = row.id) != null ? _a3 : row.po_id}`,
                    class: "font-mono text-gold-400/80 hover:text-gold-300"
                  }, {
                    default: withCtx((_, _push2, _parent2, _scopeId) => {
                      var _a4, _b3;
                      if (_push2) {
                        _push2(`${ssrInterpolate(row.po_number || `PO#${(_a4 = row.id) != null ? _a4 : row.po_id}`)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(row.po_number || `PO#${(_b3 = row.id) != null ? _b3 : row.po_id}`), 1)
                        ];
                      }
                    }),
                    _: 2
                  }, _parent));
                } else {
                  _push(`<!---->`);
                }
                _push(`<span class="text-gray-600">${ssrInterpolate((_b2 = row.note) != null ? _b2 : "")}</span></div>`);
              });
              _push(`<!--]-->`);
              if (check.rows.length > 5) {
                _push(`<p class="text-[10px] text-gray-600">\u2026and ${ssrInterpolate(check.rows.length - 5)} more</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CN5dvmEE.mjs.map
