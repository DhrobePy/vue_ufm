import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, computed, withAsyncContext, watch, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { k as useRoute, p as useUserSession, n as navigateTo } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const actionBusy = ref(false);
    const { user: sessionUser } = useUserSession();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      () => `/api/purchase/orders/${route.params.id}`,
      "$eKuTIMi9NP"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const po = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.po) != null ? _b : {};
    });
    const grns = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.grns) != null ? _b : [];
    });
    const payments = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.payments) != null ? _b : [];
    });
    const poUnitLabel = computed(() => {
      var _a;
      const u = (_a = po.value) == null ? void 0 : _a.commodity_unit;
      return !u || u === "MT" ? "KG" : u;
    });
    const availableCredit = ref(0);
    watch(() => {
      var _a;
      return (_a = po.value) == null ? void 0 : _a.supplier_id;
    }, async (sid) => {
      var _a;
      if (!sid) return;
      try {
        const res = await $fetch(`/api/purchase/suppliers/${sid}/credit`);
        availableCredit.value = Number((_a = res == null ? void 0 : res.available_credit) != null ? _a : 0);
      } catch {
        availableCredit.value = 0;
      }
    }, { immediate: true });
    function fmtDate(val) {
      if (!val) return "\u2014";
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    function ptLabel(raw) {
      if (!raw) return "\u2014";
      const r = raw.trim().toLowerCase();
      if (r === "advance") return "Advance Payment";
      const m = r.match(/^credit[- _]?(\d+)$/);
      if (m) return `Credit \u2014 ${m[1]} Days`;
      return raw;
    }
    const outstanding = computed(() => {
      var _a;
      return Math.max(0, Number((_a = po.value.balance_payable) != null ? _a : 0));
    });
    const paidPct = computed(() => {
      var _a;
      const total = Number(po.value.total_received_value || po.value.total_order_value || 0);
      if (!total) return 0;
      return Math.min(100, Math.round(Number((_a = po.value.total_paid) != null ? _a : 0) / total * 100));
    });
    const receivedKg = computed(() => grns.value.reduce((s, g) => {
      var _a;
      return s + Number((_a = g.quantity_received_kg) != null ? _a : 0);
    }, 0));
    const deliveredPct = computed(() => {
      var _a;
      const ordered = Number((_a = po.value.quantity_kg) != null ? _a : 0);
      if (!ordered) return 0;
      return Math.min(100, Math.round(receivedKg.value / ordered * 100));
    });
    function printPO() {
      navigateTo(`/purchase/orders/${route.params.id}/print`);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading purchase order\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: `Purchase Order \u2014 ${unref(po).po_number}`,
          subtitle: `${unref(po).company_name || "\u2014"} \xB7 ${unref(po).po_status || "\u2014"}`,
          breadcrumb: ["Purchase", "Orders", unref(po).po_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<button class="btn-ghost text-xs"${_scopeId}>\u{1F5A8} Print PO</button>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: "/purchase/orders",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u2190 All POs`);
                  } else {
                    return [
                      createTextVNode("\u2190 All POs")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode("button", {
                  onClick: printPO,
                  class: "btn-ghost text-xs"
                }, "\u{1F5A8} Print PO"),
                createVNode(_component_NuxtLink, {
                  to: "/purchase/orders",
                  class: "btn-ghost text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u2190 All POs")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(po).is_delivery_locked) {
          _push(`<div class="rounded-xl p-4 border flex items-start gap-3" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.06)", "border-color": "rgba(245,158,11,0.20)" })}"><span class="text-base mt-0.5">\u{1F512}</span><div class="text-xs"><p class="font-semibold text-yellow-300">Delivery Permanently Locked</p><p class="text-yellow-200/60 mt-0.5">${ssrInterpolate(unref(po).delivery_lock_reason || "Final delivery marked")} `);
          if (unref(po).delivery_locked_at) {
            _push(`<span> \xB7 ${ssrInterpolate(fmtDate(unref(po).delivery_locked_at))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p><p class="text-yellow-200/40 mt-0.5">No further GRNs can be added. Contact admin to unlock.</p></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div id="po-print" class="glass-card p-6 space-y-5"><div class="flex items-start justify-between flex-wrap gap-4"><div><h2 class="text-xl font-bold font-mono text-gold-400">${ssrInterpolate(unref(po).po_number)}</h2><p class="text-xs text-gray-500 mt-0.5">Date: ${ssrInterpolate(fmtDate(unref(po).po_date))} \xB7 By: ${ssrInterpolate(unref(po).created_by_name || "\u2014")}</p></div><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(po).po_status
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(po).payment_status
        }, null, _parent));
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: unref(po).delivery_status
        }, null, _parent));
        _push(`</div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"><div class="space-y-2"><h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Supplier</h3><p class="text-gray-200 font-semibold">${ssrInterpolate(unref(po).company_name || "\u2014")}</p>`);
        if (unref(po).supplier_address) {
          _push(`<p class="text-gray-400">${ssrInterpolate(unref(po).supplier_address)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(po).phone) {
          _push(`<p class="text-gray-400">${ssrInterpolate(unref(po).phone)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-2"><h3 class="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Delivery</h3><p class="text-gray-300">Expected: <span class="text-gray-200 font-semibold">${ssrInterpolate(fmtDate(unref(po).expected_delivery_date))}</span></p><p class="text-gray-300">To: <span class="text-gray-200">${ssrInterpolate(unref(po).branch_name || "\u2014")}</span></p><p class="text-gray-300">Payment Terms: <span class="text-gray-200 font-semibold">${ssrInterpolate(ptLabel(unref(po).po_payment_terms || unref(po).supplier_payment_terms || ""))}</span></p><p class="text-gray-300">${ssrInterpolate((_a = unref(po).commodity_name) != null ? _a : "Wheat")} Origin: <span class="text-gray-200">${ssrInterpolate(unref(po).wheat_origin || "\u2014")}</span></p></div></div><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 px-3 text-left text-gray-600 font-semibold uppercase tracking-wider">Product</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Qty (${ssrInterpolate(unref(poUnitLabel))})</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Rate / ${ssrInterpolate(unref(poUnitLabel))}</th><th class="pb-2 px-3 text-right text-gray-600 font-semibold uppercase tracking-wider">Total Value</th></tr></thead><tbody><tr><td class="py-3 px-3 text-gray-200">${ssrInterpolate(unref(po).wheat_origin ? unref(po).wheat_origin + " " + ((_b = unref(po).commodity_name) != null ? _b : "Wheat") : (_c = unref(po).commodity_name) != null ? _c : "Wheat")}</td><td class="py-3 px-3 text-right font-mono text-gray-300">${ssrInterpolate(Number(unref(po).quantity_kg).toLocaleString())}</td><td class="py-3 px-3 text-right font-mono text-gray-300">\u09F3${ssrInterpolate(Number(unref(po).unit_price_per_kg || 0).toLocaleString())}</td><td class="py-3 px-3 text-right font-mono font-bold text-gray-200">\u09F3${ssrInterpolate(Number(unref(po).total_order_value).toLocaleString())}</td></tr></tbody><tfoot><tr class="border-t border-white/10"><td colspan="3" class="pt-3 px-3 text-right text-gray-400 font-semibold">Grand Total</td><td class="pt-3 px-3 text-right font-bold text-gold-400 text-sm">\u09F3${ssrInterpolate(Number(unref(po).total_order_value).toLocaleString())}</td></tr></tfoot></table>`);
        if (unref(po).remarks) {
          _push(`<div class="text-xs text-gray-500 border-t border-white/[0.06] pt-3"><span class="font-semibold text-gray-600">Notes: </span>${ssrInterpolate(unref(po).remarks)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5 space-y-3"><h3 class="section-title">Goods Received</h3>`);
        if (!unref(grns).length) {
          _push(`<div class="text-xs text-gray-600 text-center py-4">No GRNs recorded yet.</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(grns), (grn) => {
          _push(`<div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs"><div><p class="font-mono text-gold-400/80">${ssrInterpolate(grn.grn_number)}</p><p class="text-gray-500 mt-0.5">${ssrInterpolate(grn.grn_date)} \xB7 ${ssrInterpolate(Number(grn.quantity_received_kg).toLocaleString())} kg `);
          if (grn.unload_point_name) {
            _push(`<span> \xB7 ${ssrInterpolate(grn.unload_point_name)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (grn.unload_branch_name) {
            _push(`<span> \xB7 ${ssrInterpolate(grn.unload_branch_name)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: grn.grn_status || "completed"
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/purchase/grn/create",
          class: "btn-ghost text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`+ Record GRN`);
            } else {
              return [
                createTextVNode("+ Record GRN")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(payments).length) {
          _push(`<div class="glass-card p-5 space-y-3"><h3 class="section-title">Payment History</h3><!--[-->`);
          ssrRenderList(unref(payments), (pmt) => {
            var _a2;
            _push(`<div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs"><div><p class="font-semibold text-gray-200">\u09F3${ssrInterpolate(Number((_a2 = pmt.amount_paid) != null ? _a2 : 0).toLocaleString())}</p><p class="text-gray-500 mt-0.5">${ssrInterpolate(fmtDate(pmt.payment_date))} \xB7 ${ssrInterpolate(pmt.payment_mode || pmt.payment_method || "\u2014")} `);
            if (pmt.bank_name) {
              _push(`<span> \xB7 ${ssrInterpolate(pmt.bank_name)}</span>`);
            } else {
              _push(`<!---->`);
            }
            if (pmt.reference_number) {
              _push(`<span> \xB7 Ref: ${ssrInterpolate(pmt.reference_number)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</p></div>`);
            _push(ssrRenderComponent(_component_UiStatusBadge, { status: "approved" }, null, _parent));
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Payment Status</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">PO Total</span><span class="font-bold text-gray-200">\u09F3${ssrInterpolate(Number(unref(po).total_order_value).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Paid</span><span class="font-bold text-emerald-400">\u09F3${ssrInterpolate(Number(unref(po).total_paid || 0).toLocaleString())}</span></div><div class="flex justify-between"><span class="text-gray-600">Outstanding</span><span class="font-bold text-red-400">\u09F3${ssrInterpolate(unref(outstanding).toLocaleString())}</span></div>`);
        if (unref(availableCredit) > 0) {
          _push(`<div class="flex justify-between pt-1 border-t border-white/[0.06]"><span class="text-blue-400">Available Credit</span><span class="font-bold text-blue-300">\u09F3${ssrInterpolate(unref(availableCredit).toLocaleString())}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full bg-emerald-500 transition-all" style="${ssrRenderStyle(`width:${unref(paidPct)}%`)}"></div></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/payments/record?po_id=${unref(route).params.id}&supplier_id=${unref(po).supplier_id}`,
          class: "btn-gold text-xs w-full justify-center"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Record Payment`);
            } else {
              return [
                createTextVNode("Record Payment")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(availableCredit) > 0) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/purchase/payments/record?po_id=${unref(route).params.id}&supplier_id=${unref(po).supplier_id}&use_credit=1`,
            class: "btn-ghost text-xs w-full justify-center text-blue-400 hover:border-blue-500/30"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Use Supplier Credit (\u09F3${ssrInterpolate(unref(availableCredit).toLocaleString())}) `);
              } else {
                return [
                  createTextVNode(" Use Supplier Credit (\u09F3" + toDisplayString(unref(availableCredit).toLocaleString()) + ") ", 1)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Delivery Progress</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Ordered</span><span class="text-gray-300">${ssrInterpolate(Number(unref(po).quantity_kg).toLocaleString())} kg</span></div><div class="flex justify-between"><span class="text-gray-600">Received</span><span class="font-bold text-emerald-400">${ssrInterpolate(unref(receivedKg).toLocaleString())} kg</span></div><div class="flex justify-between"><span class="text-gray-600">Pending</span><span class="font-bold text-yellow-400">${ssrInterpolate((Number(unref(po).quantity_kg) - unref(receivedKg)).toLocaleString())} kg</span></div></div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full bg-sky-500 transition-all" style="${ssrRenderStyle(`width:${unref(deliveredPct)}%`)}"></div></div></div><div class="glass-card p-5 space-y-2"><h3 class="text-sm font-semibold text-gray-300">Actions</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/orders/${unref(route).params.id}/edit`,
          class: "btn-ghost text-xs w-full justify-start gap-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"${_scopeId}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"${_scopeId}></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"${_scopeId}></path></svg> Edit PO `);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  class: "w-3.5 h-3.5",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", { d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" }),
                  createVNode("path", { d: "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" })
                ])),
                createTextVNode(" Edit PO ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/purchase/adjustments/create?po_id=${unref(route).params.id}`,
          class: "btn-ghost text-xs w-full justify-start gap-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u{1F4CB} Adjustment Note (DAN/CAN) `);
            } else {
              return [
                createTextVNode(" \u{1F4CB} Adjustment Note (DAN/CAN) ")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(isAdmin) || unref(po).delivery_status !== "closed" && unref(po).po_status !== "cancelled") {
          _push(`<button${ssrIncludeBooleanAttr(!!unref(actionBusy)) ? " disabled" : ""} class="btn-ghost text-xs w-full justify-start gap-2 text-yellow-400 hover:border-yellow-500/30"> \u{1F512} ${ssrInterpolate(unref(actionBusy) === "close" ? "Closing\u2026" : "Close Delivery")}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isAdmin) || unref(po).delivery_status === "closed") {
          _push(`<button${ssrIncludeBooleanAttr(!!unref(actionBusy)) ? " disabled" : ""} class="btn-ghost text-xs w-full justify-start gap-2 text-emerald-400 hover:border-emerald-500/30"> \u{1F513} ${ssrInterpolate(unref(actionBusy) === "reopen" ? "Reopening\u2026" : "Reopen Delivery")}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(po).po_status !== "cancelled" || unref(isAdmin)) {
          _push(`<button${ssrIncludeBooleanAttr(!!unref(actionBusy)) ? " disabled" : ""} class="btn-ghost text-xs w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:border-red-500/30"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636l-12.728 12.728"></path><path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636l12.728 12.728"></path></svg> ${ssrInterpolate(unref(actionBusy) === "cancel" ? "Cancelling\u2026" : "Cancel PO")}</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isAdmin)) {
          _push(`<!--[--><div class="h-px bg-white/[0.06] my-1"></div><p class="text-[10px] font-semibold text-gray-600 uppercase tracking-wider px-1">Admin Override</p>`);
          if (unref(po).delivery_status !== "closed" || !unref(po).is_delivery_locked) {
            _push(`<button${ssrIncludeBooleanAttr(!!unref(actionBusy)) ? " disabled" : ""} class="btn-ghost text-xs w-full justify-start gap-2 text-teal-400 hover:text-teal-300 hover:border-teal-500/30"> \u{1F512} ${ssrInterpolate(unref(actionBusy) === "final_delivery" ? "Locking\u2026" : "Mark Final Delivery & Lock")}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button${ssrIncludeBooleanAttr(!!unref(actionBusy)) ? " disabled" : ""} class="btn-ghost text-xs w-full justify-start gap-2 text-orange-400 hover:text-orange-300 hover:border-orange-500/30"> \u21A9 ${ssrInterpolate(unref(actionBusy) === "reverse" ? "Reversing\u2026" : "Reverse PO (Cancel all GRNs & Payments)")}</button><button${ssrIncludeBooleanAttr(!!unref(actionBusy)) ? " disabled" : ""} class="btn-ghost text-xs w-full justify-start gap-2 text-red-500 hover:text-red-400 hover:border-red-600/30"> \u{1F5D1} ${ssrInterpolate(unref(actionBusy) === "hardDelete" ? "Deleting\u2026" : "Permanently Delete PO")}</button><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/purchase/orders/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CR0UFmQJ.mjs.map
