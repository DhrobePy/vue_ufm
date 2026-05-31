import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { defineComponent, withAsyncContext, computed, ref, reactive, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data: prodData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/production",
      "$9s2lhfeNrA"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const apiPendingOrders = computed(() => {
      var _a, _b;
      return (_b = (_a = prodData.value) == null ? void 0 : _a.pendingOrders) != null ? _b : [];
    });
    const machines = [
      { id: "Mill-1", name: "Mill-1", status: "Available" },
      { id: "Mill-2", name: "Mill-2", status: "Available" },
      { id: "Mill-3", name: "Mill-3", status: "Maintenance" },
      { id: "Pack-1", name: "Pack-1", status: "Busy" },
      { id: "Pack-2", name: "Pack-2", status: "Available" },
      { id: "Pack-3", name: "Pack-3", status: "Available" }
    ];
    const shifts = [
      "Morning (6AM\u20132PM)",
      "Evening (2PM\u201310PM)",
      "Night (10PM\u20136AM)"
    ];
    const silos = [
      "Hard Wheat \u2014 Silo A",
      "Hard Wheat \u2014 Silo B",
      "Soft Wheat \u2014 Silo C",
      "Local Wheat \u2014 Store 1"
    ];
    const pendingOrders = computed(
      () => apiPendingOrders.value.map((o) => {
        var _a, _b, _c, _d;
        return {
          id: o.id,
          orderNo: o.order_number,
          customer: o.customer_name,
          product: "\u2014",
          // product detail not available without joining order_items
          weight: String(Math.round(Number((_a = o.total_weight_kg) != null ? _a : 0) / 1e3 * 10) / 10),
          reqDate: (_c = (_b = o.required_date) != null ? _b : o.order_date) != null ? _c : "\u2014",
          priority: (_d = o.priority) != null ? _d : "Normal"
        };
      })
    );
    const orderSearch = ref("");
    const priorityFilter = ref("");
    const selectedOrder = ref(null);
    const saving = ref(false);
    const nextBatchNo = ref("0001");
    const form = reactive({
      machine: "",
      shift: "",
      operator: "",
      targetBags: 200,
      bagWeight: 50,
      rawMaterial: "",
      scheduledDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      startTime: (/* @__PURE__ */ new Date()).toTimeString().slice(0, 5),
      notes: ""
    });
    const filteredOrders = computed(
      () => pendingOrders.value.filter((o) => {
        const q = orderSearch.value.toLowerCase();
        const matchQ = !q || o.orderNo.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
        const matchP = !priorityFilter.value || o.priority === priorityFilter.value;
        return matchQ && matchP;
      })
    );
    const bagWeight = computed(() => form.bagWeight);
    const validationMsg = computed(() => {
      if (!selectedOrder.value) return "Select a sales order.";
      if (!form.machine) return "Select a machine.";
      if (!form.shift) return "Select a shift.";
      if (!form.operator.trim()) return "Enter operator name.";
      if (!form.targetBags || form.targetBags < 1) return "Enter target bag count.";
      return null;
    });
    const canSubmit = computed(() => !validationMsg.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "New Production Batch",
        subtitle: "Assign a pending sales order to a machine and shift",
        breadcrumb: ["Production", "New Batch"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/production",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Production`);
                } else {
                  return [
                    createTextVNode("\u2190 Production")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/production",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 Production")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-4"><div class="flex items-center gap-3"><div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#f59e0b,#d97706)" })}">1</div><h3 class="text-sm font-semibold text-gray-200">Select Sales Order</h3></div><div class="flex gap-2"><input${ssrRenderAttr("value", unref(orderSearch))} type="text" class="field-input flex-1" placeholder="Search by order #, customer, product\u2026"><select class="field-input w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(priorityFilter)) ? ssrLooseContain(unref(priorityFilter), "") : ssrLooseEqual(unref(priorityFilter), "")) ? " selected" : ""}>All Priority</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(priorityFilter)) ? ssrLooseContain(unref(priorityFilter), null) : ssrLooseEqual(unref(priorityFilter), null)) ? " selected" : ""}>High</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(priorityFilter)) ? ssrLooseContain(unref(priorityFilter), null) : ssrLooseEqual(unref(priorityFilter), null)) ? " selected" : ""}>Normal</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(priorityFilter)) ? ssrLooseContain(unref(priorityFilter), null) : ssrLooseEqual(unref(priorityFilter), null)) ? " selected" : ""}>Low</option></select></div><div class="space-y-2 max-h-64 overflow-y-auto"><!--[-->`);
      ssrRenderList(unref(filteredOrders), (order) => {
        var _a, _b, _c;
        _push(`<div class="${ssrRenderClass([((_a = unref(selectedOrder)) == null ? void 0 : _a.id) === order.id ? "border-gold-500/50 bg-gold-500/[0.08]" : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]", "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all text-xs"])}"><div class="flex items-center gap-3"><div class="${ssrRenderClass([((_b = unref(selectedOrder)) == null ? void 0 : _b.id) === order.id ? "border-gold-400 bg-gold-400" : "border-gray-600", "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0"])}">`);
        if (((_c = unref(selectedOrder)) == null ? void 0 : _c.id) === order.id) {
          _push(`<div class="w-1.5 h-1.5 rounded-full bg-black"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div><p class="font-mono text-gold-400/80">${ssrInterpolate(order.orderNo)}</p><p class="text-gray-500 mt-0.5">${ssrInterpolate(order.customer)} \xB7 ${ssrInterpolate(order.product)}</p></div></div><div class="text-right"><span class="${ssrRenderClass([order.priority === "High" ? "text-red-400" : order.priority === "Normal" ? "text-gray-400" : "text-gray-600", "font-semibold"])}">${ssrInterpolate(order.priority)}</span><p class="text-gray-600 mt-0.5">Due ${ssrInterpolate(order.reqDate)}</p></div></div>`);
      });
      _push(`<!--]-->`);
      if (unref(filteredOrders).length === 0) {
        _push(`<div class="text-center text-xs text-gray-600 py-6"> No pending orders match your search. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(selectedOrder)) {
        _push(`<div class="rounded-xl p-3 text-xs space-y-1" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.05)", "border": "1px solid rgba(245,158,11,0.15)" })}"><p class="text-gold-400 font-semibold text-[11px] uppercase tracking-wider">Selected Order</p><p class="text-gray-300"><span class="text-gray-600">Order:</span> ${ssrInterpolate(unref(selectedOrder).orderNo)}</p><p class="text-gray-300"><span class="text-gray-600">Customer:</span> ${ssrInterpolate(unref(selectedOrder).customer)}</p><p class="text-gray-300"><span class="text-gray-600">Product:</span> ${ssrInterpolate(unref(selectedOrder).product)}</p><p class="text-gray-300"><span class="text-gray-600">Weight:</span> ${ssrInterpolate(unref(selectedOrder).weight)} MT</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="glass-card p-6 space-y-4"><div class="flex items-center gap-3"><div style="${ssrRenderStyle(unref(selectedOrder) ? "background:linear-gradient(135deg,#f59e0b,#d97706)" : "background:#374151")}" class="${ssrRenderClass([unref(selectedOrder) ? "" : "opacity-50", "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"])}">2</div><h3 class="${ssrRenderClass([unref(selectedOrder) ? "text-gray-200" : "text-gray-600", "text-sm font-semibold"])}"> Batch Configuration </h3></div><div class="${ssrRenderClass([!unref(selectedOrder) ? "opacity-40 pointer-events-none" : "", "grid grid-cols-1 sm:grid-cols-2 gap-4"])}"><div><label class="field-label">Machine / Mill <span class="text-red-400">*</span></label><select class="field-input w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).machine) ? ssrLooseContain(unref(form).machine, "") : ssrLooseEqual(unref(form).machine, "")) ? " selected" : ""}>Select machine\u2026</option><!--[-->`);
      ssrRenderList(machines, (m) => {
        _push(`<option${ssrRenderAttr("value", m.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).machine) ? ssrLooseContain(unref(form).machine, m.id) : ssrLooseEqual(unref(form).machine, m.id)) ? " selected" : ""}>${ssrInterpolate(m.name)} \u2014 ${ssrInterpolate(m.status)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="field-label">Shift <span class="text-red-400">*</span></label><select class="field-input w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).shift) ? ssrLooseContain(unref(form).shift, "") : ssrLooseEqual(unref(form).shift, "")) ? " selected" : ""}>Select shift\u2026</option><!--[-->`);
      ssrRenderList(shifts, (s) => {
        _push(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).shift) ? ssrLooseContain(unref(form).shift, s) : ssrLooseEqual(unref(form).shift, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="field-label">Operator <span class="text-red-400">*</span></label><input${ssrRenderAttr("value", unref(form).operator)} type="text" class="field-input w-full" placeholder="Operator full name"></div><div><label class="field-label">Target Bags <span class="text-red-400">*</span></label><input${ssrRenderAttr("value", unref(form).targetBags)} type="number" min="1" class="field-input w-full" placeholder="e.g. 200">`);
      if (unref(form).targetBags && unref(selectedOrder)) {
        _push(`<p class="text-[10px] text-gray-600 mt-1"> \u2248 ${ssrInterpolate((unref(form).targetBags * unref(bagWeight) / 1e3).toFixed(2))} MT output </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><label class="field-label">Bag Weight (kg) <span class="text-red-400">*</span></label><select class="field-input w-full"><option${ssrRenderAttr("value", 37)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).bagWeight) ? ssrLooseContain(unref(form).bagWeight, 37) : ssrLooseEqual(unref(form).bagWeight, 37)) ? " selected" : ""}>37 kg</option><option${ssrRenderAttr("value", 50)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).bagWeight) ? ssrLooseContain(unref(form).bagWeight, 50) : ssrLooseEqual(unref(form).bagWeight, 50)) ? " selected" : ""}>50 kg</option><option${ssrRenderAttr("value", 74)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).bagWeight) ? ssrLooseContain(unref(form).bagWeight, 74) : ssrLooseEqual(unref(form).bagWeight, 74)) ? " selected" : ""}>74 kg</option></select></div><div><label class="field-label">Raw Material Source <span class="text-red-400">*</span></label><select class="field-input w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).rawMaterial) ? ssrLooseContain(unref(form).rawMaterial, "") : ssrLooseEqual(unref(form).rawMaterial, "")) ? " selected" : ""}>Select silo / source\u2026</option><!--[-->`);
      ssrRenderList(silos, (s) => {
        _push(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).rawMaterial) ? ssrLooseContain(unref(form).rawMaterial, s) : ssrLooseEqual(unref(form).rawMaterial, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="field-label">Scheduled Date *</label><input${ssrRenderAttr("value", unref(form).scheduledDate)} type="date" class="field-input w-full"></div><div><label class="field-label">Scheduled Start Time</label><input${ssrRenderAttr("value", unref(form).startTime)} type="time" class="field-input w-full"></div><div class="sm:col-span-2"><label class="field-label">Instructions / Notes</label><textarea rows="2" class="field-input w-full resize-none" placeholder="Any special instructions for this batch\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div></div></div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">Batch Preview</h3>`);
      if (!unref(selectedOrder)) {
        _push(`<div class="text-xs text-gray-600 text-center py-4"> Select an order to preview batch details </div>`);
      } else {
        _push(`<div class="space-y-3 text-xs"><div class="text-center p-3 rounded-xl" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.05)", "border": "1px solid rgba(245,158,11,0.12)" })}"><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">New Batch ID</p><p class="font-mono font-bold text-gold-400 text-sm">BTH-${ssrInterpolate(unref(nextBatchNo))}</p></div><div class="space-y-2"><div class="flex justify-between"><span class="text-gray-600">Order</span><span class="font-mono text-gray-300">${ssrInterpolate(unref(selectedOrder).orderNo)}</span></div><div class="flex justify-between"><span class="text-gray-600">Product</span><span class="text-gray-300 text-right max-w-[60%]">${ssrInterpolate(unref(selectedOrder).product)}</span></div><div class="flex justify-between"><span class="text-gray-600">Target</span><span class="text-gray-300">${ssrInterpolate(unref(form).targetBags || "\u2014")} bags</span></div><div class="flex justify-between"><span class="text-gray-600">Output</span><span class="text-emerald-400 font-semibold">${ssrInterpolate(unref(form).targetBags ? (unref(form).targetBags * unref(form).bagWeight / 1e3).toFixed(2) + " MT" : "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Machine</span><span class="text-gray-300">${ssrInterpolate(unref(form).machine || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Shift</span><span class="text-gray-300 text-right max-w-[55%]">${ssrInterpolate(unref(form).shift || "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Operator</span><span class="text-gray-300">${ssrInterpolate(unref(form).operator || "\u2014")}</span></div></div>`);
        if (unref(validationMsg)) {
          _push(`<div class="text-[11px] text-red-400 p-2 rounded-lg" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.07)", "border": "1px solid rgba(239,68,68,0.15)" })}">${ssrInterpolate(unref(validationMsg))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Machine Status</h3><div class="space-y-2"><!--[-->`);
      ssrRenderList(machines, (m) => {
        _push(`<div class="${ssrRenderClass([m.status === "Available" ? "bg-emerald-500/[0.05]" : m.status === "Busy" ? "bg-red-500/[0.05]" : "bg-yellow-500/[0.05]", "flex items-center justify-between text-xs p-2 rounded-lg"])}"><span class="text-gray-300 font-medium">${ssrInterpolate(m.name)}</span><span class="${ssrRenderClass([m.status === "Available" ? "text-emerald-400" : m.status === "Busy" ? "text-red-400" : "text-yellow-400", "font-semibold"])}">${ssrInterpolate(m.status)}</span></div>`);
      });
      _push(`<!--]--></div></div><button${ssrIncludeBooleanAttr(!unref(canSubmit) || unref(saving)) ? " disabled" : ""} class="btn-gold text-xs w-full justify-center py-3">`);
      if (unref(saving)) {
        _push(`<span>Creating batch\u2026</span>`);
      } else {
        _push(`<span>\u25B6 Create &amp; Start Batch</span>`);
      }
      _push(`</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/production",
        class: "btn-ghost text-xs w-full justify-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cancel`);
          } else {
            return [
              createTextVNode("Cancel")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/production/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=create-Bts5xneF.mjs.map
