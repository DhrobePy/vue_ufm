import { _ as _sfc_main$3 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$4 } from './KpiCard-yeUJcbjn.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, unref, createTextVNode, createVNode, openBlock, createBlock, withModifiers, toDisplayString, isRef, withDirectives, Fragment, renderList, vModelSelect, vModelText, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrInterpolate, ssrRenderStyle, ssrRenderTeleport, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _sfc_main$5 } from './DataTable-CCNVWvkK.mjs';
import { _ as _sfc_main$6 } from './StatusBadge-CVkglZ_a.mjs';
import { c as _export_sfc, n as navigateTo } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import './SidebarIcon-oZVkzwjh.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "PipelineColumn",
  __ssrInlineRender: true,
  props: {
    label: {},
    count: {},
    color: {},
    route: {},
    status: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: __props.route,
        class: "glass-card-hover p-4 text-center flex flex-col items-center gap-2 group"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style="${ssrRenderStyle(`background: ${__props.color}18; border: 1px solid ${__props.color}30;`)}"${_scopeId}><span class="font-display font-bold text-lg" style="${ssrRenderStyle(`color:${__props.color}`)}"${_scopeId}>${ssrInterpolate(__props.count)}</span></div><span class="text-[11px] font-semibold text-gray-500 group-hover:text-gray-300 transition-colors text-center leading-tight"${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
          } else {
            return [
              createVNode("div", {
                class: "w-10 h-10 rounded-xl flex items-center justify-center mb-1",
                style: `background: ${__props.color}18; border: 1px solid ${__props.color}30;`
              }, [
                createVNode("span", {
                  class: "font-display font-bold text-lg",
                  style: `color:${__props.color}`
                }, toDisplayString(__props.count), 5)
              ], 4),
              createVNode("span", { class: "text-[11px] font-semibold text-gray-500 group-hover:text-gray-300 transition-colors text-center leading-tight" }, toDisplayString(__props.label), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PipelineColumn.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "UiSlideOver",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean },
    title: {},
    subtitle: {},
    width: { default: 460 }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.modelValue) {
          _push2(`<div class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" data-v-873255c1></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (__props.modelValue) {
          _push2(`<div class="fixed right-0 top-0 h-full z-[101] flex flex-col" style="${ssrRenderStyle([`width: ${__props.width}px`, { "background": "rgba(16,12,8,0.99)", "border-left": "1px solid rgba(255,255,255,0.08)", "box-shadow": "-32px 0 80px rgba(0,0,0,0.7)" }])}" data-v-873255c1><div class="flex items-center justify-between px-6 py-4 shrink-0" style="${ssrRenderStyle({ "border-bottom": "1px solid rgba(255,255,255,0.07)" })}" data-v-873255c1><div class="min-w-0" data-v-873255c1><h3 class="text-base font-bold text-gray-100 truncate" data-v-873255c1>${ssrInterpolate(__props.title)}</h3>`);
          if (__props.subtitle) {
            _push2(`<p class="text-xs text-gray-500 mt-0.5 truncate" data-v-873255c1>${ssrInterpolate(__props.subtitle)}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="flex items-center gap-2 ml-3 shrink-0" data-v-873255c1>`);
          ssrRenderSlot(_ctx.$slots, "header-actions", {}, null, _push2, _parent);
          _push2(`<button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.08] transition-all" data-v-873255c1><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-873255c1><path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12" data-v-873255c1></path></svg></button></div></div><div class="flex-1 overflow-y-auto" data-v-873255c1>`);
          ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent);
          _push2(`</div>`);
          if (_ctx.$slots.footer) {
            _push2(`<div class="shrink-0" style="${ssrRenderStyle({ "border-top": "1px solid rgba(255,255,255,0.07)" })}" data-v-873255c1>`);
            ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push2, _parent);
            _push2(`</div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UiSlideOver.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-873255c1"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { success, error: toastError } = useToast();
    const view = ref("table");
    const [{ data: ordersData, refresh: refreshOrders }, { data: custData }, { data: prodData }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useFetch(
        "/api/credit-sales",
        { query: { per: 50 } },
        "$vLDGxXLJ9r"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/customers",
        { query: { per: 200 } },
        "$12BSFi8XSt"
        /* nuxt-injected */
      ),
      useFetch(
        "/api/products",
        "$apF4rJAVwy"
        /* nuxt-injected */
      )
    ])), __temp = await __temp, __restore(), __temp);
    const recentOrders = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = ordersData.value) == null ? void 0 : _a.orders) != null ? _b : []).map((o) => {
          var _a2, _b2;
          return {
            id: o.id,
            orderNo: o.order_number,
            customer: o.customer_name,
            date: String(o.order_date).slice(0, 10),
            amount: Number((_a2 = o.total_amount) != null ? _a2 : 0),
            status: o.status,
            branch: o.branch_id ? String(o.branch_id) : "",
            priority: (_b2 = o.priority) != null ? _b2 : "normal"
          };
        });
      }
    );
    const PIPELINE_META = [
      { status: "pending_approval", label: "Pending", color: "#eab308", route: "/credit-sales/approve" },
      { status: "escalated", label: "Escalated", color: "#f97316", route: "/credit-sales/approve" },
      { status: "approved", label: "Approved", color: "#10b981", route: "/credit-sales/all" },
      { status: "in_production", label: "In Production", color: "#3b82f6", route: "/credit-sales/production" },
      { status: "ready_to_ship", label: "Ready to Ship", color: "#06b6d4", route: "/credit-sales/dispatch" },
      { status: "delivered", label: "Delivered", color: "#14b8a6", route: "/credit-sales/all" }
    ];
    const pipeline = computed(
      () => PIPELINE_META.map((m) => ({
        ...m,
        count: recentOrders.value.filter((o) => o.status === m.status).length
      }))
    );
    const kpiPending = computed(() => recentOrders.value.filter((o) => ["pending_approval", "escalated"].includes(o.status)).length);
    const kpiProduction = computed(() => recentOrders.value.filter((o) => o.status === "in_production").length);
    const kpiReady = computed(() => recentOrders.value.filter((o) => o.status === "ready_to_ship").length);
    const kpiUrgent = computed(() => recentOrders.value.filter((o) => o.priority === "urgent").length);
    const kanbanCols = computed(
      () => pipeline.value.map((col) => ({
        ...col,
        orders: recentOrders.value.filter((o) => o.status === col.status)
      }))
    );
    const tableFilters = reactive({ status: "", branch: "", priority: "", dateFrom: "", dateTo: "" });
    const filteredTableOrders = computed(() => recentOrders.value.filter((o) => {
      if (tableFilters.status && o.status !== tableFilters.status) return false;
      if (tableFilters.branch && o.branch !== tableFilters.branch) return false;
      if (tableFilters.priority && o.priority !== tableFilters.priority) return false;
      if (tableFilters.dateFrom && o.date < tableFilters.dateFrom) return false;
      if (tableFilters.dateTo && o.date > tableFilters.dateTo) return false;
      return true;
    }));
    const cols = [
      { key: "orderNo", label: "Order #", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "date", label: "Date", sortable: true },
      { key: "amount", label: "Amount", sortable: true },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" }
    ];
    const drawerOpen = ref(false);
    const editOrder = ref(null);
    const saving = ref(false);
    const customers = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = custData.value) == null ? void 0 : _a.customers) != null ? _b : []).map((c) => ({
          id: String(c.id),
          name: c.name
        }));
      }
    );
    const products = computed(() => {
      var _a, _b, _c, _d;
      const list = [];
      for (const p of (_b = (_a = prodData.value) == null ? void 0 : _a.products) != null ? _b : []) {
        for (const v of (_c = p.variants) != null ? _c : []) {
          list.push(`${p.base_name} ${(_d = v.weight_variant) != null ? _d : ""}`.trim());
        }
      }
      return list;
    });
    const blankForm = () => ({
      customerId: "",
      branch: "srg",
      priority: "normal",
      orderDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      requiredDate: "",
      discount: 0,
      advance: 0,
      notes: "",
      status: "pending_approval",
      items: [{ product: "", qty: 1, price: 0 }]
    });
    const form = reactive(blankForm());
    computed(
      () => {
        var _a, _b;
        return (_b = (_a = customers.value.find((c) => c.id === form.customerId)) == null ? void 0 : _a.name) != null ? _b : form.customerId;
      }
    );
    function openCreate(defaultStatus = "pending_approval") {
      editOrder.value = null;
      Object.assign(form, blankForm());
      form.status = defaultStatus;
      drawerOpen.value = true;
    }
    function openEdit(order) {
      var _a, _b, _c;
      editOrder.value = order;
      const matchedCust = customers.value.find((c) => c.name === order.customer);
      Object.assign(form, {
        customerId: (_a = matchedCust == null ? void 0 : matchedCust.id) != null ? _a : "",
        branch: (_b = order.branch) != null ? _b : "srg",
        priority: order.priority,
        orderDate: order.date,
        requiredDate: "",
        discount: 0,
        advance: 0,
        notes: "",
        status: order.status,
        items: [{ product: (_c = products.value[0]) != null ? _c : "", qty: 1, price: order.amount }]
      });
      drawerOpen.value = true;
    }
    function addItem() {
      form.items.push({ product: "", qty: 1, price: 0 });
    }
    function removeItem(i) {
      form.items.splice(i, 1);
    }
    const subtotal = computed(() => form.items.reduce((s, l) => s + l.qty * l.price, 0));
    const orderTotal = computed(() => Math.max(0, subtotal.value - form.discount));
    const formValid = computed(() => form.customerId && form.items.some((l) => l.product && l.qty > 0 && l.price > 0));
    async function saveOrder() {
      var _a, _b;
      if (!formValid.value) return;
      saving.value = true;
      try {
        if (editOrder.value) {
          if (form.status !== editOrder.value.status) {
            await $fetch(`/api/credit-sales/${editOrder.value.id}/workflow`, {
              method: "POST",
              body: { to_status: form.status, comments: "Updated via quick-edit" }
            });
          }
          success(`Order ${editOrder.value.orderNo} updated`);
          await refreshOrders();
        } else {
          const result = await $fetch("/api/credit-sales", {
            method: "POST",
            body: {
              customer_id: Number(form.customerId),
              order_date: form.orderDate,
              required_date: form.requiredDate || null,
              priority: form.priority,
              delivery_address: form.notes || null,
              amount_paid: form.advance || 0,
              items: form.items.filter((i) => i.product && i.qty > 0).map((i) => ({
                variant_id: null,
                product_id: null,
                qty_bags: i.qty,
                unit_price: i.price,
                discount_amount: 0
              }))
            }
          });
          success(`Order ${result.order_number} created \u2014 pending approval`);
          await refreshOrders();
        }
        drawerOpen.value = false;
      } catch (e) {
        toastError((_b = (_a = e == null ? void 0 : e.data) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to save order");
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$3;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_KpiCard = _sfc_main$4;
      const _component_PipelineColumn = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$5;
      const _component_UiStatusBadge = _sfc_main$6;
      const _component_UiSlideOver = __nuxt_component_6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-9615ab2f>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Credit Sales",
        subtitle: "Order lifecycle \xB7 Approval \xB7 Dispatch \xB7 Collection",
        breadcrumb: ["Credit Sales"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex rounded-xl overflow-hidden border border-white/[0.08]" data-v-9615ab2f${_scopeId}><button class="${ssrRenderClass(["px-3 py-1.5 text-xs font-medium transition-all", unref(view) === "table" ? "bg-gold-500/20 text-gold-400" : "text-gray-500 hover:text-gray-300"])}" data-v-9615ab2f${_scopeId}> \u2261 Table </button><button class="${ssrRenderClass(["px-3 py-1.5 text-xs font-medium transition-all", unref(view) === "kanban" ? "bg-gold-500/20 text-gold-400" : "text-gray-500 hover:text-gray-300"])}" data-v-9615ab2f${_scopeId}> \u229E Kanban </button></div>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/credit-sales/all",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`View All`);
                } else {
                  return [
                    createTextVNode("View All")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<button class="btn-gold text-xs" data-v-9615ab2f${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-9615ab2f${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" data-v-9615ab2f${_scopeId}></path></svg> New Order </button>`);
          } else {
            return [
              createVNode("div", { class: "flex rounded-xl overflow-hidden border border-white/[0.08]" }, [
                createVNode("button", {
                  onClick: ($event) => view.value = "table",
                  class: ["px-3 py-1.5 text-xs font-medium transition-all", unref(view) === "table" ? "bg-gold-500/20 text-gold-400" : "text-gray-500 hover:text-gray-300"]
                }, " \u2261 Table ", 10, ["onClick"]),
                createVNode("button", {
                  onClick: ($event) => view.value = "kanban",
                  class: ["px-3 py-1.5 text-xs font-medium transition-all", unref(view) === "kanban" ? "bg-gold-500/20 text-gold-400" : "text-gray-500 hover:text-gray-300"]
                }, " \u229E Kanban ", 10, ["onClick"])
              ]),
              createVNode(_component_NuxtLink, {
                to: "/credit-sales/all",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("View All")
                ]),
                _: 1
              }),
              createVNode("button", {
                onClick: openCreate,
                class: "btn-gold text-xs"
              }, [
                (openBlock(), createBlock("svg", {
                  class: "w-3.5 h-3.5",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2.5",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M12 4v16m8-8H4"
                  })
                ])),
                createTextVNode(" New Order ")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-9615ab2f>`);
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Pending Approval",
        value: String(unref(kpiPending)),
        trend: "awaiting review",
        "trend-up": false,
        icon: "check",
        color: "yellow"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "In Production",
        value: String(unref(kpiProduction)),
        trend: unref(kpiUrgent) + " urgent",
        "trend-up": false,
        icon: "factory",
        color: "blue"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Ready to Dispatch",
        value: String(unref(kpiReady)),
        trend: "ready to ship",
        "trend-up": "",
        icon: "truck",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Active Orders",
        value: String(unref(recentOrders).length),
        trend: "loaded",
        "trend-up": "",
        icon: "money",
        color: "gold"
      }, null, _parent));
      _push(`</div><div class="glass-card p-5" data-v-9615ab2f><h2 class="section-title mb-4" data-v-9615ab2f>Order Pipeline</h2><div class="grid grid-cols-3 lg:grid-cols-6 gap-3" data-v-9615ab2f><!--[-->`);
      ssrRenderList(unref(pipeline), (col) => {
        _push(ssrRenderComponent(_component_PipelineColumn, {
          key: col.status,
          label: col.label,
          count: col.count,
          color: col.color,
          route: col.route
        }, null, _parent));
      });
      _push(`<!--]--></div></div>`);
      if (unref(view) === "table") {
        _push(`<div class="space-y-4" data-v-9615ab2f><div class="glass-card p-4 flex flex-wrap items-center gap-3" data-v-9615ab2f><select class="input-glass w-auto text-xs py-1.5 min-w-[140px]" data-v-9615ab2f><option value="" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "") : ssrLooseEqual(unref(tableFilters).status, "")) ? " selected" : ""}>All Statuses</option><option value="pending_approval" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "pending_approval") : ssrLooseEqual(unref(tableFilters).status, "pending_approval")) ? " selected" : ""}>Pending Approval</option><option value="escalated" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "escalated") : ssrLooseEqual(unref(tableFilters).status, "escalated")) ? " selected" : ""}>Escalated</option><option value="approved" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "approved") : ssrLooseEqual(unref(tableFilters).status, "approved")) ? " selected" : ""}>Approved</option><option value="in_production" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "in_production") : ssrLooseEqual(unref(tableFilters).status, "in_production")) ? " selected" : ""}>In Production</option><option value="ready_to_ship" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "ready_to_ship") : ssrLooseEqual(unref(tableFilters).status, "ready_to_ship")) ? " selected" : ""}>Ready to Ship</option><option value="delivered" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "delivered") : ssrLooseEqual(unref(tableFilters).status, "delivered")) ? " selected" : ""}>Delivered</option><option value="partial_delivery" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "partial_delivery") : ssrLooseEqual(unref(tableFilters).status, "partial_delivery")) ? " selected" : ""}>Partial Delivery</option><option value="completed" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "completed") : ssrLooseEqual(unref(tableFilters).status, "completed")) ? " selected" : ""}>Completed</option><option value="rejected" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "rejected") : ssrLooseEqual(unref(tableFilters).status, "rejected")) ? " selected" : ""}>Rejected</option><option value="cancelled" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).status) ? ssrLooseContain(unref(tableFilters).status, "cancelled") : ssrLooseEqual(unref(tableFilters).status, "cancelled")) ? " selected" : ""}>Cancelled</option></select><select class="input-glass w-auto text-xs py-1.5 min-w-[120px]" data-v-9615ab2f><option value="" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).branch) ? ssrLooseContain(unref(tableFilters).branch, "") : ssrLooseEqual(unref(tableFilters).branch, "")) ? " selected" : ""}>All Branches</option><option value="srg" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).branch) ? ssrLooseContain(unref(tableFilters).branch, "srg") : ssrLooseEqual(unref(tableFilters).branch, "srg")) ? " selected" : ""}>Sirajgonj</option><option value="demra" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).branch) ? ssrLooseContain(unref(tableFilters).branch, "demra") : ssrLooseEqual(unref(tableFilters).branch, "demra")) ? " selected" : ""}>Demra</option></select><select class="input-glass w-auto text-xs py-1.5 min-w-[120px]" data-v-9615ab2f><option value="" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).priority) ? ssrLooseContain(unref(tableFilters).priority, "") : ssrLooseEqual(unref(tableFilters).priority, "")) ? " selected" : ""}>All Priorities</option><option value="urgent" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).priority) ? ssrLooseContain(unref(tableFilters).priority, "urgent") : ssrLooseEqual(unref(tableFilters).priority, "urgent")) ? " selected" : ""}>Urgent</option><option value="high" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).priority) ? ssrLooseContain(unref(tableFilters).priority, "high") : ssrLooseEqual(unref(tableFilters).priority, "high")) ? " selected" : ""}>High</option><option value="normal" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(tableFilters).priority) ? ssrLooseContain(unref(tableFilters).priority, "normal") : ssrLooseEqual(unref(tableFilters).priority, "normal")) ? " selected" : ""}>Normal</option></select><input${ssrRenderAttr("value", unref(tableFilters).dateFrom)} type="date" class="input-glass w-auto text-xs py-1.5" data-v-9615ab2f><span class="text-gray-600 text-xs" data-v-9615ab2f>\u2013</span><input${ssrRenderAttr("value", unref(tableFilters).dateTo)} type="date" class="input-glass w-auto text-xs py-1.5" data-v-9615ab2f><button class="btn-ghost text-xs py-1.5" data-v-9615ab2f>Reset</button><div class="ml-auto text-xs text-gray-500" data-v-9615ab2f><span class="font-medium text-gray-300" data-v-9615ab2f>${ssrInterpolate(unref(filteredTableOrders).length)}</span> orders </div></div><div class="glass-card p-5" data-v-9615ab2f><div class="flex items-center justify-between mb-4" data-v-9615ab2f><h2 class="section-title" data-v-9615ab2f>Recent Orders</h2>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/credit-sales/all",
          class: "text-xs text-gold-500 hover:text-gold-400 font-medium transition-colors"
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
          columns: cols,
          rows: unref(filteredTableOrders),
          "per-page": 8,
          exportable: "",
          "search-placeholder": "Search orders\u2026",
          onRowClick: openEdit
        }, {
          "cell-orderNo": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-mono text-xs text-gold-400/80" data-v-9615ab2f${_scopeId}>${ssrInterpolate(value)}</span>`);
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
          "cell-amount": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="font-semibold text-gold-400/90 font-mono" data-v-9615ab2f${_scopeId}>\u09F3${ssrInterpolate(Number(value).toLocaleString())}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-semibold text-gold-400/90 font-mono" }, "\u09F3" + toDisplayString(Number(value).toLocaleString()), 1)
              ];
            }
          }),
          "cell-priority": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(["text-xs font-medium", value === "urgent" ? "text-red-400" : value === "high" ? "text-orange-400" : "text-gray-600"])}" data-v-9615ab2f${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: ["text-xs font-medium", value === "urgent" ? "text-red-400" : value === "high" ? "text-orange-400" : "text-gray-600"]
                }, toDisplayString(value), 3)
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex gap-1" data-v-9615ab2f${_scopeId}><button class="btn-ghost text-xs py-1 px-2" data-v-9615ab2f${_scopeId}>Edit</button>`);
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/credit-sales/${row.id}`,
                class: "btn-ghost text-xs py-1 px-2"
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
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex gap-1" }, [
                  createVNode("button", {
                    onClick: withModifiers(($event) => openEdit(row), ["stop"]),
                    class: "btn-ghost text-xs py-1 px-2"
                  }, "Edit", 8, ["onClick"]),
                  createVNode(_component_NuxtLink, {
                    to: `/credit-sales/${row.id}`,
                    class: "btn-ghost text-xs py-1 px-2"
                  }, {
                    default: withCtx(() => [
                      createTextVNode("View")
                    ]),
                    _: 1
                  }, 8, ["to"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<div class="overflow-x-auto pb-2" data-v-9615ab2f><div class="flex gap-4" style="${ssrRenderStyle({ "min-width": "max-content" })}" data-v-9615ab2f><!--[-->`);
        ssrRenderList(unref(kanbanCols), (col) => {
          _push(`<div class="w-64 shrink-0 rounded-2xl p-3 space-y-2" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.02)", "border": "1px solid rgba(255,255,255,0.06)" })}" data-v-9615ab2f><div class="flex items-center justify-between px-1 pb-1" data-v-9615ab2f><div class="flex items-center gap-2" data-v-9615ab2f><div class="w-2.5 h-2.5 rounded-full" style="${ssrRenderStyle(`background:${col.color}`)}" data-v-9615ab2f></div><span class="text-xs font-semibold text-gray-300" data-v-9615ab2f>${ssrInterpolate(col.label)}</span></div><span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-gray-400" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.06)" })}" data-v-9615ab2f>${ssrInterpolate(col.orders.length)}</span></div><div class="space-y-2 max-h-[520px] overflow-y-auto pr-0.5" data-v-9615ab2f><!--[-->`);
          ssrRenderList(col.orders, (order) => {
            _push(`<div class="rounded-xl p-3 cursor-pointer group transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(255,255,255,0.07)" })}" data-v-9615ab2f><div class="flex items-center justify-between mb-2" data-v-9615ab2f><span class="font-mono text-[10px] text-gold-400/70" data-v-9615ab2f>${ssrInterpolate(order.orderNo)}</span><span class="text-[10px] text-gray-600" data-v-9615ab2f>${ssrInterpolate(order.date)}</span></div><p class="text-xs font-semibold text-gray-200 truncate mb-2" data-v-9615ab2f>${ssrInterpolate(order.customer)}</p><div class="flex items-center justify-between" data-v-9615ab2f><span class="text-xs font-bold text-gold-400 font-mono" data-v-9615ab2f>\u09F3${ssrInterpolate((order.amount / 1e3).toFixed(0))}K</span><div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" data-v-9615ab2f><button class="text-[10px] px-1.5 py-0.5 rounded-lg text-gray-400 hover:text-gold-400 transition-colors" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.06)" })}" data-v-9615ab2f>Edit</button>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/credit-sales/${order.id}`,
              class: "text-[10px] px-1.5 py-0.5 rounded-lg text-gray-400 hover:text-gold-400 transition-colors",
              style: { "background": "rgba(255,255,255,0.06)" },
              onClick: () => {
              }
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`View`);
                } else {
                  return [
                    createTextVNode("View")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div></div></div>`);
          });
          _push(`<!--]-->`);
          if (col.orders.length === 0) {
            _push(`<div class="py-6 text-center" data-v-9615ab2f><p class="text-[10px] text-gray-700" data-v-9615ab2f>No orders</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><button class="w-full py-2 rounded-xl text-[11px] text-gray-600 hover:text-gold-400 hover:bg-white/[0.04] transition-all border border-dashed border-white/[0.06] hover:border-gold-500/30" data-v-9615ab2f> + Add order </button></div>`);
        });
        _push(`<!--]--></div></div>`);
      }
      _push(ssrRenderComponent(_component_UiSlideOver, {
        modelValue: unref(drawerOpen),
        "onUpdate:modelValue": ($event) => isRef(drawerOpen) ? drawerOpen.value = $event : null,
        title: unref(editOrder) ? `Edit ${unref(editOrder).orderNo}` : "New Credit Order",
        subtitle: unref(editOrder) ? unref(editOrder).customer : "Create a new credit sales order"
      }, {
        "header-actions": withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(editOrder)) {
              _push2(`<span class="text-[10px] px-2 py-1 rounded-lg font-mono text-gold-400" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.1)", "border": "1px solid rgba(245,158,11,0.2)" })}" data-v-9615ab2f${_scopeId}>${ssrInterpolate(unref(editOrder).orderNo)}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(editOrder) ? (openBlock(), createBlock("span", {
                key: 0,
                class: "text-[10px] px-2 py-1 rounded-lg font-mono text-gold-400",
                style: { "background": "rgba(245,158,11,0.1)", "border": "1px solid rgba(245,158,11,0.2)" }
              }, toDisplayString(unref(editOrder).orderNo), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-3 px-6 py-4" data-v-9615ab2f${_scopeId}><button${ssrIncludeBooleanAttr(!unref(formValid) || unref(saving)) ? " disabled" : ""} class="btn-gold flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100" data-v-9615ab2f${_scopeId}>`);
            if (unref(saving)) {
              _push2(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" data-v-9615ab2f${_scopeId}><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" data-v-9615ab2f${_scopeId}></circle><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" class="opacity-75" data-v-9615ab2f${_scopeId}></path></svg>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : unref(editOrder) ? "Save Changes" : "Create Order")}</button>`);
            if (unref(editOrder)) {
              _push2(`<button class="btn-ghost text-xs" data-v-9615ab2f${_scopeId}> Full View \u2192 </button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="btn-ghost text-xs" data-v-9615ab2f${_scopeId}>Cancel</button></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-3 px-6 py-4" }, [
                createVNode("button", {
                  onClick: saveOrder,
                  disabled: !unref(formValid) || unref(saving),
                  class: "btn-gold flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
                }, [
                  unref(saving) ? (openBlock(), createBlock("svg", {
                    key: 0,
                    class: "w-4 h-4 animate-spin",
                    fill: "none",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("circle", {
                      cx: "12",
                      cy: "12",
                      r: "10",
                      stroke: "currentColor",
                      "stroke-width": "4",
                      class: "opacity-25"
                    }),
                    createVNode("path", {
                      fill: "currentColor",
                      d: "M4 12a8 8 0 018-8v8H4z",
                      class: "opacity-75"
                    })
                  ])) : createCommentVNode("", true),
                  createTextVNode(" " + toDisplayString(unref(saving) ? "Saving\u2026" : unref(editOrder) ? "Save Changes" : "Create Order"), 1)
                ], 8, ["disabled"]),
                unref(editOrder) ? (openBlock(), createBlock("button", {
                  key: 0,
                  onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/credit-sales/${unref(editOrder).id}`),
                  class: "btn-ghost text-xs"
                }, " Full View \u2192 ", 8, ["onClick"])) : createCommentVNode("", true),
                createVNode("button", {
                  onClick: ($event) => drawerOpen.value = false,
                  class: "btn-ghost text-xs"
                }, "Cancel", 8, ["onClick"])
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6 space-y-5" data-v-9615ab2f${_scopeId}><div class="grid grid-cols-2 gap-4" data-v-9615ab2f${_scopeId}><div class="space-y-1.5 col-span-2" data-v-9615ab2f${_scopeId}><label class="field-label" data-v-9615ab2f${_scopeId}>Customer *</label><select class="input-glass" data-v-9615ab2f${_scopeId}><option value="" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).customerId) ? ssrLooseContain(unref(form).customerId, "") : ssrLooseEqual(unref(form).customerId, "")) ? " selected" : ""}${_scopeId}>\u2014 Select customer \u2014</option><!--[-->`);
            ssrRenderList(unref(customers), (c) => {
              _push2(`<option${ssrRenderAttr("value", c.id)} data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).customerId) ? ssrLooseContain(unref(form).customerId, c.id) : ssrLooseEqual(unref(form).customerId, c.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(c.name)}</option>`);
            });
            _push2(`<!--]--></select></div><div class="space-y-1.5" data-v-9615ab2f${_scopeId}><label class="field-label" data-v-9615ab2f${_scopeId}>Branch *</label><select class="input-glass" data-v-9615ab2f${_scopeId}><option value="srg" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch) ? ssrLooseContain(unref(form).branch, "srg") : ssrLooseEqual(unref(form).branch, "srg")) ? " selected" : ""}${_scopeId}>Sirajgonj</option><option value="demra" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch) ? ssrLooseContain(unref(form).branch, "demra") : ssrLooseEqual(unref(form).branch, "demra")) ? " selected" : ""}${_scopeId}>Demra</option></select></div><div class="space-y-1.5" data-v-9615ab2f${_scopeId}><label class="field-label" data-v-9615ab2f${_scopeId}>Priority</label><select class="input-glass" data-v-9615ab2f${_scopeId}><option value="normal" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "normal") : ssrLooseEqual(unref(form).priority, "normal")) ? " selected" : ""}${_scopeId}>Normal</option><option value="high" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "high") : ssrLooseEqual(unref(form).priority, "high")) ? " selected" : ""}${_scopeId}>High</option><option value="urgent" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).priority) ? ssrLooseContain(unref(form).priority, "urgent") : ssrLooseEqual(unref(form).priority, "urgent")) ? " selected" : ""}${_scopeId}>Urgent</option></select></div><div class="space-y-1.5" data-v-9615ab2f${_scopeId}><label class="field-label" data-v-9615ab2f${_scopeId}>Order Date *</label><input${ssrRenderAttr("value", unref(form).orderDate)} type="date" class="input-glass" data-v-9615ab2f${_scopeId}></div><div class="space-y-1.5" data-v-9615ab2f${_scopeId}><label class="field-label" data-v-9615ab2f${_scopeId}>Required Date</label><input${ssrRenderAttr("value", unref(form).requiredDate)} type="date" class="input-glass" data-v-9615ab2f${_scopeId}></div></div><div data-v-9615ab2f${_scopeId}><div class="flex items-center justify-between mb-2" data-v-9615ab2f${_scopeId}><label class="field-label" data-v-9615ab2f${_scopeId}>Line Items *</label><button class="text-[11px] text-gold-400 hover:text-gold-300 transition-colors" data-v-9615ab2f${_scopeId}>+ Add item</button></div><div class="space-y-2" data-v-9615ab2f${_scopeId}><!--[-->`);
            ssrRenderList(unref(form).items, (item, i) => {
              _push2(`<div class="grid grid-cols-12 gap-2 items-center p-3 rounded-xl" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.06)" })}" data-v-9615ab2f${_scopeId}><div class="col-span-5" data-v-9615ab2f${_scopeId}><select class="input-glass text-xs py-1.5 w-full" data-v-9615ab2f${_scopeId}><option value="" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(item.product) ? ssrLooseContain(item.product, "") : ssrLooseEqual(item.product, "")) ? " selected" : ""}${_scopeId}>\u2014 Product \u2014</option><!--[-->`);
              ssrRenderList(unref(products), (p) => {
                _push2(`<option${ssrRenderAttr("value", p)} data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(item.product) ? ssrLooseContain(item.product, p) : ssrLooseEqual(item.product, p)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(p)}</option>`);
              });
              _push2(`<!--]--></select></div><div class="col-span-2" data-v-9615ab2f${_scopeId}><input${ssrRenderAttr("value", item.qty)} type="number" min="1" placeholder="Qty" class="input-glass text-xs py-1.5 text-right font-mono w-full" data-v-9615ab2f${_scopeId}></div><div class="col-span-3" data-v-9615ab2f${_scopeId}><div class="relative" data-v-9615ab2f${_scopeId}><span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-xs" data-v-9615ab2f${_scopeId}>\u09F3</span><input${ssrRenderAttr("value", item.price)} type="number" min="0" placeholder="Price" class="input-glass text-xs py-1.5 pl-5 text-right font-mono w-full" data-v-9615ab2f${_scopeId}></div></div><div class="col-span-2 flex justify-end" data-v-9615ab2f${_scopeId}>`);
              if (unref(form).items.length > 1) {
                _push2(`<button class="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all" data-v-9615ab2f${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-9615ab2f${_scopeId}><path d="M18 6L6 18M6 6l12 12" data-v-9615ab2f${_scopeId}></path></svg></button>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            });
            _push2(`<!--]--></div></div><div class="rounded-xl p-4 space-y-2 text-sm" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.06)" })}" data-v-9615ab2f${_scopeId}><div class="flex justify-between text-gray-500" data-v-9615ab2f${_scopeId}><span data-v-9615ab2f${_scopeId}>Subtotal</span><span class="font-mono" data-v-9615ab2f${_scopeId}>\u09F3${ssrInterpolate(unref(subtotal).toLocaleString())}</span></div><div class="flex justify-between items-center" data-v-9615ab2f${_scopeId}><span class="text-gray-500" data-v-9615ab2f${_scopeId}>Discount</span><div class="flex items-center gap-1" data-v-9615ab2f${_scopeId}><span class="text-gray-600 text-xs" data-v-9615ab2f${_scopeId}>\u09F3</span><input${ssrRenderAttr("value", unref(form).discount)} type="number" min="0" class="w-24 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-right font-mono text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50" data-v-9615ab2f${_scopeId}></div></div><div class="flex justify-between font-bold text-base pt-1 border-t border-white/[0.06]" data-v-9615ab2f${_scopeId}><span class="text-gray-300" data-v-9615ab2f${_scopeId}>Total</span><span class="text-gold-400 font-mono" data-v-9615ab2f${_scopeId}>\u09F3${ssrInterpolate(unref(orderTotal).toLocaleString())}</span></div><div class="flex justify-between items-center" data-v-9615ab2f${_scopeId}><span class="text-gray-500 text-xs" data-v-9615ab2f${_scopeId}>Advance Payment</span><div class="flex items-center gap-1" data-v-9615ab2f${_scopeId}><span class="text-gray-600 text-xs" data-v-9615ab2f${_scopeId}>\u09F3</span><input${ssrRenderAttr("value", unref(form).advance)} type="number" min="0" class="w-24 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-right font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" data-v-9615ab2f${_scopeId}></div></div><div class="flex justify-between text-xs" data-v-9615ab2f${_scopeId}><span class="text-gray-600" data-v-9615ab2f${_scopeId}>Balance Due</span><span class="font-mono text-red-400" data-v-9615ab2f${_scopeId}>\u09F3${ssrInterpolate(Math.max(0, unref(orderTotal) - unref(form).advance).toLocaleString())}</span></div></div><div class="space-y-1.5" data-v-9615ab2f${_scopeId}><label class="field-label" data-v-9615ab2f${_scopeId}>Delivery Address / Notes</label><textarea rows="2" class="input-glass resize-none text-xs" placeholder="Delivery address, special instructions\u2026" data-v-9615ab2f${_scopeId}>${ssrInterpolate(unref(form).notes)}</textarea></div>`);
            if (unref(editOrder)) {
              _push2(`<div class="space-y-1.5" data-v-9615ab2f${_scopeId}><label class="field-label" data-v-9615ab2f${_scopeId}>Status</label><select class="input-glass" data-v-9615ab2f${_scopeId}><option value="pending_approval" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "pending_approval") : ssrLooseEqual(unref(form).status, "pending_approval")) ? " selected" : ""}${_scopeId}>Pending Approval</option><option value="escalated" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "escalated") : ssrLooseEqual(unref(form).status, "escalated")) ? " selected" : ""}${_scopeId}>Escalated</option><option value="approved" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "approved") : ssrLooseEqual(unref(form).status, "approved")) ? " selected" : ""}${_scopeId}>Approved</option><option value="in_production" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "in_production") : ssrLooseEqual(unref(form).status, "in_production")) ? " selected" : ""}${_scopeId}>In Production</option><option value="ready_to_ship" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "ready_to_ship") : ssrLooseEqual(unref(form).status, "ready_to_ship")) ? " selected" : ""}${_scopeId}>Ready to Ship</option><option value="delivered" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "delivered") : ssrLooseEqual(unref(form).status, "delivered")) ? " selected" : ""}${_scopeId}>Delivered</option><option value="partial_delivery" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "partial_delivery") : ssrLooseEqual(unref(form).status, "partial_delivery")) ? " selected" : ""}${_scopeId}>Partial Delivery</option><option value="completed" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "completed") : ssrLooseEqual(unref(form).status, "completed")) ? " selected" : ""}${_scopeId}>Completed</option><option value="rejected" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "rejected") : ssrLooseEqual(unref(form).status, "rejected")) ? " selected" : ""}${_scopeId}>Rejected</option><option value="cancelled" data-v-9615ab2f${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "cancelled") : ssrLooseEqual(unref(form).status, "cancelled")) ? " selected" : ""}${_scopeId}>Cancelled</option></select></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "p-6 space-y-5" }, [
                createVNode("div", { class: "grid grid-cols-2 gap-4" }, [
                  createVNode("div", { class: "space-y-1.5 col-span-2" }, [
                    createVNode("label", { class: "field-label" }, "Customer *"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => unref(form).customerId = $event,
                      class: "input-glass"
                    }, [
                      createVNode("option", { value: "" }, "\u2014 Select customer \u2014"),
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(customers), (c) => {
                        return openBlock(), createBlock("option", {
                          key: c.id,
                          value: c.id
                        }, toDisplayString(c.name), 9, ["value"]);
                      }), 128))
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, unref(form).customerId]
                    ])
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", { class: "field-label" }, "Branch *"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => unref(form).branch = $event,
                      class: "input-glass"
                    }, [
                      createVNode("option", { value: "srg" }, "Sirajgonj"),
                      createVNode("option", { value: "demra" }, "Demra")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, unref(form).branch]
                    ])
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", { class: "field-label" }, "Priority"),
                    withDirectives(createVNode("select", {
                      "onUpdate:modelValue": ($event) => unref(form).priority = $event,
                      class: "input-glass"
                    }, [
                      createVNode("option", { value: "normal" }, "Normal"),
                      createVNode("option", { value: "high" }, "High"),
                      createVNode("option", { value: "urgent" }, "Urgent")
                    ], 8, ["onUpdate:modelValue"]), [
                      [vModelSelect, unref(form).priority]
                    ])
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", { class: "field-label" }, "Order Date *"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => unref(form).orderDate = $event,
                      type: "date",
                      class: "input-glass"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(form).orderDate]
                    ])
                  ]),
                  createVNode("div", { class: "space-y-1.5" }, [
                    createVNode("label", { class: "field-label" }, "Required Date"),
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => unref(form).requiredDate = $event,
                      type: "date",
                      class: "input-glass"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelText, unref(form).requiredDate]
                    ])
                  ])
                ]),
                createVNode("div", null, [
                  createVNode("div", { class: "flex items-center justify-between mb-2" }, [
                    createVNode("label", { class: "field-label" }, "Line Items *"),
                    createVNode("button", {
                      onClick: addItem,
                      class: "text-[11px] text-gold-400 hover:text-gold-300 transition-colors"
                    }, "+ Add item")
                  ]),
                  createVNode("div", { class: "space-y-2" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(form).items, (item, i) => {
                      return openBlock(), createBlock("div", {
                        key: i,
                        class: "grid grid-cols-12 gap-2 items-center p-3 rounded-xl",
                        style: { "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.06)" }
                      }, [
                        createVNode("div", { class: "col-span-5" }, [
                          withDirectives(createVNode("select", {
                            "onUpdate:modelValue": ($event) => item.product = $event,
                            class: "input-glass text-xs py-1.5 w-full"
                          }, [
                            createVNode("option", { value: "" }, "\u2014 Product \u2014"),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(products), (p) => {
                              return openBlock(), createBlock("option", {
                                key: p,
                                value: p
                              }, toDisplayString(p), 9, ["value"]);
                            }), 128))
                          ], 8, ["onUpdate:modelValue"]), [
                            [vModelSelect, item.product]
                          ])
                        ]),
                        createVNode("div", { class: "col-span-2" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => item.qty = $event,
                            type: "number",
                            min: "1",
                            placeholder: "Qty",
                            class: "input-glass text-xs py-1.5 text-right font-mono w-full"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [
                              vModelText,
                              item.qty,
                              void 0,
                              { number: true }
                            ]
                          ])
                        ]),
                        createVNode("div", { class: "col-span-3" }, [
                          createVNode("div", { class: "relative" }, [
                            createVNode("span", { class: "absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 text-xs" }, "\u09F3"),
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => item.price = $event,
                              type: "number",
                              min: "0",
                              placeholder: "Price",
                              class: "input-glass text-xs py-1.5 pl-5 text-right font-mono w-full"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                item.price,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ])
                        ]),
                        createVNode("div", { class: "col-span-2 flex justify-end" }, [
                          unref(form).items.length > 1 ? (openBlock(), createBlock("button", {
                            key: 0,
                            onClick: ($event) => removeItem(i),
                            class: "w-6 h-6 flex items-center justify-center text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                          }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-3.5 h-3.5",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-width": "2",
                              viewBox: "0 0 24 24"
                            }, [
                              createVNode("path", { d: "M18 6L6 18M6 6l12 12" })
                            ]))
                          ], 8, ["onClick"])) : createCommentVNode("", true)
                        ])
                      ]);
                    }), 128))
                  ])
                ]),
                createVNode("div", {
                  class: "rounded-xl p-4 space-y-2 text-sm",
                  style: { "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.06)" }
                }, [
                  createVNode("div", { class: "flex justify-between text-gray-500" }, [
                    createVNode("span", null, "Subtotal"),
                    createVNode("span", { class: "font-mono" }, "\u09F3" + toDisplayString(unref(subtotal).toLocaleString()), 1)
                  ]),
                  createVNode("div", { class: "flex justify-between items-center" }, [
                    createVNode("span", { class: "text-gray-500" }, "Discount"),
                    createVNode("div", { class: "flex items-center gap-1" }, [
                      createVNode("span", { class: "text-gray-600 text-xs" }, "\u09F3"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(form).discount = $event,
                        type: "number",
                        min: "0",
                        class: "w-24 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-right font-mono text-gray-200 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [
                          vModelText,
                          unref(form).discount,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "flex justify-between font-bold text-base pt-1 border-t border-white/[0.06]" }, [
                    createVNode("span", { class: "text-gray-300" }, "Total"),
                    createVNode("span", { class: "text-gold-400 font-mono" }, "\u09F3" + toDisplayString(unref(orderTotal).toLocaleString()), 1)
                  ]),
                  createVNode("div", { class: "flex justify-between items-center" }, [
                    createVNode("span", { class: "text-gray-500 text-xs" }, "Advance Payment"),
                    createVNode("div", { class: "flex items-center gap-1" }, [
                      createVNode("span", { class: "text-gray-600 text-xs" }, "\u09F3"),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => unref(form).advance = $event,
                        type: "number",
                        min: "0",
                        class: "w-24 bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 text-xs text-right font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [
                          vModelText,
                          unref(form).advance,
                          void 0,
                          { number: true }
                        ]
                      ])
                    ])
                  ]),
                  createVNode("div", { class: "flex justify-between text-xs" }, [
                    createVNode("span", { class: "text-gray-600" }, "Balance Due"),
                    createVNode("span", { class: "font-mono text-red-400" }, "\u09F3" + toDisplayString(Math.max(0, unref(orderTotal) - unref(form).advance).toLocaleString()), 1)
                  ])
                ]),
                createVNode("div", { class: "space-y-1.5" }, [
                  createVNode("label", { class: "field-label" }, "Delivery Address / Notes"),
                  withDirectives(createVNode("textarea", {
                    "onUpdate:modelValue": ($event) => unref(form).notes = $event,
                    rows: "2",
                    class: "input-glass resize-none text-xs",
                    placeholder: "Delivery address, special instructions\u2026"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, unref(form).notes]
                  ])
                ]),
                unref(editOrder) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "space-y-1.5"
                }, [
                  createVNode("label", { class: "field-label" }, "Status"),
                  withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => unref(form).status = $event,
                    class: "input-glass"
                  }, [
                    createVNode("option", { value: "pending_approval" }, "Pending Approval"),
                    createVNode("option", { value: "escalated" }, "Escalated"),
                    createVNode("option", { value: "approved" }, "Approved"),
                    createVNode("option", { value: "in_production" }, "In Production"),
                    createVNode("option", { value: "ready_to_ship" }, "Ready to Ship"),
                    createVNode("option", { value: "delivered" }, "Delivered"),
                    createVNode("option", { value: "partial_delivery" }, "Partial Delivery"),
                    createVNode("option", { value: "completed" }, "Completed"),
                    createVNode("option", { value: "rejected" }, "Rejected"),
                    createVNode("option", { value: "cancelled" }, "Cancelled")
                  ], 8, ["onUpdate:modelValue"]), [
                    [vModelSelect, unref(form).status]
                  ])
                ])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9615ab2f"]]);

export { index as default };
//# sourceMappingURL=index-YPboTiwT.mjs.map
