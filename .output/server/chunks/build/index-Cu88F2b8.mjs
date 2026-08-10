import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, unref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const id = Number(route.params.id);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/fleet/trips/${id}`,
      "$TVuNgi-DY2"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const trip = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.trip) != null ? _b : null;
    });
    const advances = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.advances) != null ? _b : [];
    });
    const expenses = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.expenses) != null ? _b : [];
    });
    const settlement = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.settlement) != null ? _b : { revenue: 0, total_advance: 0, total_expense: 0, final_balance: 0 };
    });
    const subTab = ref("Advances");
    const showAddAdvance = ref(false);
    const advForm = reactive({ amount: "", purpose: "", given_by: "" });
    const showAddExpense = ref(false);
    const expCategories = ["Toll", "Fuel", "Food", "Labour", "Repair", "Parking", "Ferry", "Other"];
    const expForm = reactive({ category: "Toll", description: "", amount: "" });
    const tripFields = computed(() => {
      const t = trip.value;
      if (!t) return [];
      return [
        { label: "Trip Date", value: t.trip_date },
        { label: "Departure", value: t.departure_time || "\u2014" },
        { label: "Origin", value: t.origin },
        { label: "Destination", value: t.destination },
        { label: "Goods", value: t.goods_description },
        { label: "Quantity", value: t.quantity ? Number(t.quantity).toLocaleString() : null },
        { label: "Weight", value: t.weight_kg ? Number(t.weight_kg).toLocaleString() + " kg" : null },
        { label: "Est. Duration", value: t.estimated_duration ? t.estimated_duration + " hrs" : null },
        { label: "Trip Charge", value: t.trip_charge ? "\u09F3" + Number(t.trip_charge).toLocaleString() : null },
        { label: "Advance", value: t.advance_amount ? "\u09F3" + Number(t.advance_amount).toLocaleString() : null },
        { label: "Dest. Account", value: t.destination_account },
        { label: "Payment Date", value: t.payment_date }
      ];
    });
    function fmt(n) {
      return Number(n || 0).toLocaleString("en-BD");
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      if (unref(trip)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_UiPageHeader, {
          title: unref(trip).trip_number,
          subtitle: `${unref(trip).origin || "\u2014"} \u2192 ${unref(trip).destination || "\u2014"}`,
          breadcrumb: ["Fleet", "Trips", unref(trip).trip_number]
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, {
                status: unref(trip).trip_status
              }, null, _parent2, _scopeId));
              _push2(`<span class="${ssrRenderClass([unref(trip).report_status === "reported" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400", "badge text-[10px]"])}"${_scopeId}>${ssrInterpolate(unref(trip).report_status)}</span>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/fleet/trips/${unref(id)}/print`,
                target: "_blank",
                class: "btn-secondary text-xs"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u{1F5A8} Print Sheet`);
                  } else {
                    return [
                      createTextVNode("\u{1F5A8} Print Sheet")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, {
                  status: unref(trip).trip_status
                }, null, 8, ["status"]),
                createVNode("span", {
                  class: ["badge text-[10px]", unref(trip).report_status === "reported" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"]
                }, toDisplayString(unref(trip).report_status), 3),
                createVNode(_component_NuxtLink, {
                  to: `/fleet/trips/${unref(id)}/print`,
                  target: "_blank",
                  class: "btn-secondary text-xs"
                }, {
                  default: withCtx(() => [
                    createTextVNode("\u{1F5A8} Print Sheet")
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="flex gap-2 flex-wrap">`);
        if (unref(trip).trip_status === "scheduled") {
          _push(`<button class="btn-gold text-xs">\u25B6 Start Trip</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(trip).trip_status === "in_progress") {
          _push(`<button class="btn-secondary text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">\u2713 Mark Completed</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(trip).trip_status === "completed") {
          _push(`<button class="btn-secondary text-xs">Close Trip</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(trip).trip_status === "scheduled" || unref(trip).trip_status === "in_progress") {
          _push(`<button class="btn-secondary text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">\u2715 Cancel</button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(trip).trip_status === "completed" && unref(trip).report_status === "unreported") {
          _push(`<button class="btn-secondary text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10">\u{1F4CB} Mark Reported</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-5"><h3 class="section-title mb-4">Trip Details</h3><div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm"><!--[-->`);
        ssrRenderList(unref(tripFields), (f) => {
          _push(`<div class="flex justify-between"><span class="text-gray-500">${ssrInterpolate(f.label)}</span><span class="text-gray-200 font-medium">${ssrInterpolate(f.value || "\u2014")}</span></div>`);
        });
        _push(`<!--]--></div></div><div class="glass-card p-5"><div class="flex gap-1 border-b border-white/[0.06] mb-4"><!--[-->`);
        ssrRenderList(["Advances", "Expenses", "Profitability"], (t) => {
          _push(`<button class="${ssrRenderClass([unref(subTab) === t ? "text-gold-400 border-b-2 border-gold-400" : "text-gray-500 hover:text-gray-300", "px-4 py-2 text-xs font-medium transition-colors"])}">${ssrInterpolate(t)}</button>`);
        });
        _push(`<!--]--></div>`);
        if (unref(subTab) === "Advances") {
          _push(`<div><div class="flex justify-end mb-3"><button class="btn-gold text-xs">+ Add Advance</button></div>`);
          if (unref(showAddAdvance)) {
            _push(`<form class="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-white/[0.03]"><div><label class="form-label">Amount *</label><input${ssrRenderAttr("value", unref(advForm).amount)} type="number" class="form-input" required></div><div><label class="form-label">Purpose</label><input${ssrRenderAttr("value", unref(advForm).purpose)} class="form-input"></div><div><label class="form-label">Given By</label><input${ssrRenderAttr("value", unref(advForm).given_by)} class="form-input"></div><div class="col-span-3 flex gap-2"><button type="submit" class="btn-gold text-xs">Save</button><button type="button" class="btn-secondary text-xs">Cancel</button></div></form>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(advances).length) {
            _push(`<div class="text-center py-4 text-gray-600 text-sm">No advances recorded</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(advances), (a) => {
            var _a2;
            _push(`<div class="flex justify-between p-3 rounded-lg hover:bg-white/[0.02] text-sm"><div><p class="text-gray-300">${ssrInterpolate(a.purpose || "Advance")}</p><p class="text-xs text-gray-600">${ssrInterpolate(a.given_by ? "By " + a.given_by : "")} \xB7 ${ssrInterpolate((_a2 = a.given_at) == null ? void 0 : _a2.slice(0, 10))}</p></div><p class="font-medium text-amber-400">\u09F3${ssrInterpolate(Number(a.amount).toLocaleString())}</p></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(subTab) === "Expenses") {
          _push(`<div><div class="flex justify-end mb-3"><button class="btn-gold text-xs">+ Add Expense</button></div>`);
          if (unref(showAddExpense)) {
            _push(`<form class="grid grid-cols-3 gap-3 mb-4 p-3 rounded-xl bg-white/[0.03]"><div><label class="form-label">Category</label><select class="form-input"><!--[-->`);
            ssrRenderList(expCategories, (c) => {
              _push(`<option${ssrRenderAttr("value", c)}${ssrIncludeBooleanAttr(Array.isArray(unref(expForm).category) ? ssrLooseContain(unref(expForm).category, c) : ssrLooseEqual(unref(expForm).category, c)) ? " selected" : ""}>${ssrInterpolate(c)}</option>`);
            });
            _push(`<!--]--></select></div><div><label class="form-label">Description</label><input${ssrRenderAttr("value", unref(expForm).description)} class="form-input"></div><div><label class="form-label">Amount *</label><input${ssrRenderAttr("value", unref(expForm).amount)} type="number" class="form-input" required></div><div class="col-span-3 flex gap-2"><button type="submit" class="btn-gold text-xs">Save</button><button type="button" class="btn-secondary text-xs">Cancel</button></div></form>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(expenses).length) {
            _push(`<div class="text-center py-4 text-gray-600 text-sm">No expenses recorded</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(expenses), (e) => {
            var _a2;
            _push(`<div class="flex justify-between p-3 rounded-lg hover:bg-white/[0.02] text-sm"><div><p class="text-gray-300">${ssrInterpolate(e.category || "Expense")} <span class="text-gray-500">\xB7 ${ssrInterpolate(e.description)}</span></p><p class="text-xs text-gray-600">${ssrInterpolate((_a2 = e.incurred_at) == null ? void 0 : _a2.slice(0, 10))}</p></div><p class="font-medium text-red-400">\u09F3${ssrInterpolate(Number(e.amount).toLocaleString())}</p></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(subTab) === "Profitability") {
          _push(`<div><div class="space-y-3"><div class="flex justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><span class="text-sm text-emerald-400">Revenue (Trip Charge)</span><span class="text-sm font-bold text-emerald-400">\u09F3${ssrInterpolate(fmt(unref(settlement).revenue))}</span></div><div class="flex justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"><span class="text-sm text-amber-400">Total Advances Given</span><span class="text-sm font-bold text-amber-400">\u09F3${ssrInterpolate(fmt(unref(settlement).total_advance))}</span></div><div class="flex justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20"><span class="text-sm text-red-400">Total Expenses</span><span class="text-sm font-bold text-red-400">\u09F3${ssrInterpolate(fmt(unref(settlement).total_expense))}</span></div><div class="${ssrRenderClass([unref(settlement).final_balance >= 0 ? "bg-blue-500/10 border border-blue-500/20" : "bg-red-500/10 border border-red-500/20", "flex justify-between p-3 rounded-xl"])}"><span class="${ssrRenderClass([unref(settlement).final_balance >= 0 ? "text-blue-400" : "text-red-400", "text-sm font-bold"])}">Final Balance (Due to Company)</span><span class="${ssrRenderClass([unref(settlement).final_balance >= 0 ? "text-blue-400" : "text-red-400", "text-sm font-bold"])}">\u09F3${ssrInterpolate(fmt(unref(settlement).final_balance))}</span></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="space-y-4"><div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Vehicle</h4><p class="text-sm font-mono font-bold text-gold-400/90">${ssrInterpolate(unref(trip).vehicle_no)}</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(trip).vehicle_type)} \xB7 ${ssrInterpolate(unref(trip).make)} ${ssrInterpolate(unref(trip).model)}</p></div><div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Driver</h4><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">${ssrInterpolate((_a = unref(trip).driver_name) == null ? void 0 : _a.charAt(0))}</div><div><p class="text-sm text-gray-200">${ssrInterpolate(unref(trip).driver_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(trip).driver_mobile || "No mobile")}</p></div></div></div>`);
        if (unref(trip).customer_name) {
          _push(`<div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer</h4><p class="text-sm text-gray-200">${ssrInterpolate(unref(trip).customer_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(unref(trip).customer_phone || "")}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="glass-card p-4"><h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Settlement Summary</h4><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-500">Charge</span><span class="text-emerald-400 font-medium">\u09F3${ssrInterpolate(fmt(unref(settlement).revenue))}</span></div><div class="flex justify-between"><span class="text-gray-500">Advance</span><span class="text-amber-400 font-medium">\u09F3${ssrInterpolate(fmt(unref(settlement).total_advance))}</span></div><div class="flex justify-between"><span class="text-gray-500">Expenses</span><span class="text-red-400 font-medium">\u09F3${ssrInterpolate(fmt(unref(settlement).total_expense))}</span></div><div class="border-t border-white/[0.06] pt-2 flex justify-between"><span class="text-gray-400 font-medium">Balance Due</span><span class="${ssrRenderClass([unref(settlement).final_balance >= 0 ? "text-blue-400" : "text-red-400", "font-bold"])}">\u09F3${ssrInterpolate(fmt(unref(settlement).final_balance))}</span></div></div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/trips/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Cu88F2b8.mjs.map
