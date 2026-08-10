import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as _sfc_main$3 } from './DataTable-COn8qGcx.mjs';
import { _ as _sfc_main$4 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, ref, computed, reactive, mergeProps, withCtx, createTextVNode, createVNode, unref, withModifiers, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderTeleport, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
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
import './SidebarIcon-oZVkzwjh.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d;
    let __temp, __restore;
    useToast();
    const { data: apiData, refresh: refreshApi } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/production",
      "$d54NkWIf37"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    function parseNotes(notes) {
      const parts = {};
      for (const part of (notes != null ? notes : "").split("|")) {
        const sep = part.indexOf(":");
        if (sep > 0) parts[part.slice(0, sep).trim()] = part.slice(sep + 1).trim();
      }
      return parts;
    }
    function scheduleTooBatch(s) {
      var _a2, _b2, _c2, _d2, _e, _f, _g, _h, _i;
      const kg = Number((_a2 = s.total_weight_kg) != null ? _a2 : 0);
      const notes = parseNotes(s.notes);
      return {
        id: `PS-${s.id}`,
        dbId: s.id,
        product: (_c2 = (_b2 = notes["Product"]) != null ? _b2 : s.order_number) != null ? _c2 : "\u2014",
        orderId: (_d2 = s.order_number) != null ? _d2 : "\u2014",
        customer: (_e = s.customer_name) != null ? _e : "\u2014",
        targetBags: Number(s.target_bags) || (kg > 0 ? Math.round(kg / 50) : 200),
        doneBags: Number(s.bags_completed) || 0,
        status: s.status === "in_progress" ? "running" : s.status === "completed" ? "completed" : "paused",
        shift: (_f = notes["Shift"]) != null ? _f : "\u2014",
        machine: (_g = notes["Machine"]) != null ? _g : "\u2014",
        operator: (_i = (_h = notes["Operator"]) != null ? _h : s.manager_name) != null ? _i : "\u2014"
      };
    }
    function pendingToQueueRow(o) {
      var _a2, _b2, _c2, _d2, _e;
      const kg = Number((_a2 = o.total_weight_kg) != null ? _a2 : 0);
      return {
        id: o.id,
        orderNo: (_b2 = o.order_number) != null ? _b2 : "\u2014",
        customer: (_c2 = o.customer_name) != null ? _c2 : "\u2014",
        product: "\u2014",
        weight: kg > 0 ? (kg / 1e3).toFixed(1) : "\u2014",
        reqDate: (_d2 = o.required_date) != null ? _d2 : "\u2014",
        priority: (_e = o.priority) != null ? _e : "normal",
        status: "approved",
        defaultBags: kg > 0 ? Math.round(kg / 50) : 200
      };
    }
    const activeBatches = ref(
      ((_b = (_a = apiData.value) == null ? void 0 : _a.schedule) != null ? _b : []).map(scheduleTooBatch)
    );
    const completedToday = ref([]);
    const todayOutputMT = computed(() => {
      const bags = completedToday.value.reduce((s, b) => s + b.doneBags, 0);
      return (bags * 50 / 1e3).toFixed(1);
    });
    const shiftPct = computed(() => {
      const all = activeBatches.value;
      if (!all.length) return "0";
      const total = all.reduce((s, b) => s + b.targetBags, 0);
      const done = all.reduce((s, b) => s + b.doneBags, 0);
      return Math.round(done / total * 100);
    });
    const queueCols = [
      { key: "orderNo", label: "Order #", sortable: true },
      { key: "customer", label: "Customer", sortable: true },
      { key: "product", label: "Product", sortable: true },
      { key: "weight", label: "Weight" },
      { key: "priority", label: "Priority", sortable: true },
      { key: "reqDate", label: "Required", sortable: true },
      { key: "status", label: "Status" }
    ];
    const pendingQueue = ref(
      ((_d = (_c = apiData.value) == null ? void 0 : _c.pendingOrders) != null ? _d : []).map(pendingToQueueRow)
    );
    function pct(batch) {
      if (!batch) return 0;
      return Math.round(batch.doneBags / batch.targetBags * 100);
    }
    const machines = ["Mill-1", "Mill-2", "Mill-3", "Pack-1", "Pack-2", "Pack-3"];
    const silos = ["Hard Wheat \u2014 Silo A", "Hard Wheat \u2014 Silo B", "Soft Wheat \u2014 Silo C", "Local Wheat \u2014 Store 1"];
    const updateModal = reactive({
      open: false,
      batch: null,
      doneBags: 0,
      note: ""
    });
    const readyModal = reactive({
      open: false,
      batch: null,
      finalBags: 0
    });
    const startModal = reactive({
      open: false,
      row: null
    });
    const startForm = reactive({
      machine: "",
      shift: "",
      operator: "",
      targetBags: 0,
      rawMaterial: "",
      notes: ""
    });
    function openStart(row) {
      startModal.row = row;
      startForm.machine = "";
      startForm.shift = "";
      startForm.operator = "";
      startForm.targetBags = row.defaultBags;
      startForm.rawMaterial = "";
      startForm.notes = "";
      startModal.open = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_KpiCard = _sfc_main$2;
      const _component_UiDataTable = _sfc_main$3;
      const _component_UiStatusBadge = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Production Floor",
        subtitle: "Live production queue \xB7 batch tracking \xB7 shift output",
        breadcrumb: ["Production"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/production/requirement",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u{1F4CB} Today&#39;s Requirement`);
                } else {
                  return [
                    createTextVNode("\u{1F4CB} Today's Requirement")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/production/totals",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u{1F4CA} Production Totals`);
                } else {
                  return [
                    createTextVNode("\u{1F4CA} Production Totals")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/production/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ New Batch`);
                } else {
                  return [
                    createTextVNode("+ New Batch")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/production/requirement",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u{1F4CB} Today's Requirement")
                ]),
                _: 1
              }),
              createVNode(_component_NuxtLink, {
                to: "/production/totals",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u{1F4CA} Production Totals")
                ]),
                _: 1
              }),
              createVNode(_component_NuxtLink, {
                to: "/production/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ New Batch")
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
        label: "Active Batches",
        value: String(unref(activeBatches).filter((b) => b.status === "running").length),
        trend: "Running now",
        "trend-up": "",
        icon: "factory",
        color: "blue"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Today's Output",
        value: unref(todayOutputMT) + " MT",
        trend: "vs 12.1MT target",
        "trend-up": "",
        icon: "chart",
        color: "teal"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Pending Orders",
        value: String(unref(pendingQueue).length),
        trend: "Awaiting production",
        "trend-up": false,
        icon: "list",
        color: "orange"
      }, null, _parent));
      _push(ssrRenderComponent(_component_KpiCard, {
        label: "Shift Completion",
        value: unref(shiftPct) + "%",
        trend: "On track",
        "trend-up": "",
        icon: "check",
        color: "gold"
      }, null, _parent));
      _push(`</div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Active Batches</h2><span class="text-xs text-gray-600">Tap a row to open batch detail</span></div>`);
      if (unref(activeBatches).length === 0) {
        _push(`<div class="text-xs text-gray-600 text-center py-8"> No active batches. `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/production/create",
          class: "text-gold-400 underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Start one \u2192`);
            } else {
              return [
                createTextVNode("Start one \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-3"><!--[-->`);
      ssrRenderList(unref(activeBatches), (batch) => {
        _push(`<div class="${ssrRenderClass([batch.status === "paused" ? "opacity-60" : "", "flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer"])}"><div class="shrink-0"><div class="${ssrRenderClass([batch.status === "running" ? "bg-emerald-400 animate-pulse" : "bg-yellow-400", "w-2.5 h-2.5 rounded-full"])}"></div></div><div class="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3"><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Batch #</p><p class="text-sm font-mono font-semibold text-gold-400">${ssrInterpolate(batch.id)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Product</p><p class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(batch.product)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Order</p><p class="text-sm font-mono text-gray-400">${ssrInterpolate(batch.orderId)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider">Target</p><p class="text-sm text-gray-300">${ssrInterpolate(batch.targetBags)} bags</p></div></div><div class="w-28 shrink-0 space-y-1"><div class="flex justify-between text-[10px]"><span class="text-gray-600">Progress</span><span class="text-gray-400">${ssrInterpolate(batch.doneBags)}/${ssrInterpolate(batch.targetBags)}</span></div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="${ssrRenderClass([pct(batch) >= 100 ? "bg-emerald-500" : "bg-gold-500/70", "h-full rounded-full transition-all duration-500"])}" style="${ssrRenderStyle(`width:${Math.min(pct(batch), 100)}%`)}"></div></div><p class="${ssrRenderClass([pct(batch) >= 80 ? "text-emerald-400" : "text-gray-600", "text-[10px] text-right"])}">${ssrInterpolate(pct(batch))}% </p></div><div class="flex gap-2 shrink-0">`);
        if (batch.status === "running") {
          _push(`<button class="btn-ghost text-xs py-1 px-2.5">\u{1F4DD} Update</button>`);
        } else {
          _push(`<!---->`);
        }
        if (batch.status === "paused") {
          _push(`<button class="btn-ghost text-xs py-1 px-2.5 text-yellow-400">\u25B6 Resume</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="btn-gold text-xs py-1 px-2.5">\u2713 Ready</button></div></div>`);
      });
      _push(`<!--]--></div></div><div class="glass-card p-5"><h2 class="section-title mb-4">Pending Production Queue</h2>`);
      _push(ssrRenderComponent(_component_UiDataTable, {
        columns: queueCols,
        rows: unref(pendingQueue),
        "per-page": 10,
        "search-placeholder": "Search orders\u2026"
      }, {
        "cell-orderNo": withCtx(({ value }, _push2, _parent2, _scopeId) => {
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
        "cell-weight": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="text-xs text-gray-400"${_scopeId}>${ssrInterpolate(value)} MT</span>`);
          } else {
            return [
              createVNode("span", { class: "text-xs text-gray-400" }, toDisplayString(value) + " MT", 1)
            ];
          }
        }),
        "cell-priority": withCtx(({ value }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="${ssrRenderClass([value === "High" ? "text-red-400" : value === "Normal" ? "text-gray-400" : "text-gray-600", "text-xs font-medium"])}"${_scopeId}>${ssrInterpolate(value)}</span>`);
          } else {
            return [
              createVNode("span", {
                class: ["text-xs font-medium", value === "High" ? "text-red-400" : value === "Normal" ? "text-gray-400" : "text-gray-600"]
              }, toDisplayString(value), 3)
            ];
          }
        }),
        actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-gold text-xs py-1 px-2.5"${_scopeId}>\u25B6 Start</button>`);
          } else {
            return [
              createVNode("button", {
                class: "btn-gold text-xs py-1 px-2.5",
                onClick: withModifiers(($event) => openStart(row), ["stop"])
              }, "\u25B6 Start", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(completedToday).length) {
        _push(`<div class="glass-card p-5"><h2 class="section-title mb-4">Completed Today</h2><div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(completedToday), (batch) => {
          _push(`<div class="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] cursor-pointer"><div class="flex items-center gap-3"><span class="text-emerald-400 text-sm">\u2713</span><div><p class="text-xs font-mono text-gold-400/80">${ssrInterpolate(batch.id)}</p><p class="text-[11px] text-gray-500">${ssrInterpolate(batch.product)} \xB7 ${ssrInterpolate(batch.doneBags)} / ${ssrInterpolate(batch.targetBags)} bags</p></div></div><div class="text-right">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, { status: "completed" }, null, _parent));
          _push(`<p class="text-[10px] text-gray-600 mt-1">${ssrInterpolate(batch.completedAt)}</p></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2, _c2, _d2, _e, _f, _g, _h, _i;
        if (unref(updateModal).open) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-sm space-y-4"><div class="flex items-start justify-between"><div><h3 class="text-sm font-semibold text-gray-200">Update Progress</h3><p class="text-xs text-gray-500 mt-0.5 font-mono">${ssrInterpolate((_a2 = unref(updateModal).batch) == null ? void 0 : _a2.id)} \xB7 ${ssrInterpolate((_b2 = unref(updateModal).batch) == null ? void 0 : _b2.product)}</p></div><button class="text-gray-600 hover:text-gray-300 text-lg leading-none">\u2715</button></div><div class="space-y-3"><div><label class="field-label">Bags Completed</label><input${ssrRenderAttr("value", unref(updateModal).doneBags)} type="number"${ssrRenderAttr("min", ((_c2 = unref(updateModal).batch) == null ? void 0 : _c2.doneBags) || 0)}${ssrRenderAttr("max", ((_d2 = unref(updateModal).batch) == null ? void 0 : _d2.targetBags) || 9999)} class="field-input w-full" placeholder="e.g. 160"><p class="text-[10px] text-gray-600 mt-1"> Current: ${ssrInterpolate((_e = unref(updateModal).batch) == null ? void 0 : _e.doneBags)} / ${ssrInterpolate((_f = unref(updateModal).batch) == null ? void 0 : _f.targetBags)} bags (${ssrInterpolate(pct(unref(updateModal).batch))}%) </p></div><div><label class="field-label">Note (optional)</label><input${ssrRenderAttr("value", unref(updateModal).note)} type="text" class="field-input w-full" placeholder="e.g. Shift change handover"></div><div class="space-y-1"><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full bg-gold-500/70 transition-all duration-300" style="${ssrRenderStyle(`width:${Math.min(Math.round(unref(updateModal).doneBags / (((_g = unref(updateModal).batch) == null ? void 0 : _g.targetBags) || 1) * 100), 100)}%`)}"></div></div><p class="text-[10px] text-right text-gray-500">${ssrInterpolate(Math.min(Math.round(unref(updateModal).doneBags / (((_h = unref(updateModal).batch) == null ? void 0 : _h.targetBags) || 1) * 100), 100))}% after update </p></div></div><div class="flex gap-2 pt-1"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button class="btn-gold text-xs flex-1 justify-center"${ssrIncludeBooleanAttr(unref(updateModal).doneBags <= (((_i = unref(updateModal).batch) == null ? void 0 : _i.doneBags) || 0)) ? " disabled" : ""}> Save Update </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2, _c2, _d2, _e;
        if (unref(readyModal).open) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-sm space-y-4"><h3 class="text-sm font-semibold text-gray-200">Mark Batch as Complete?</h3><div class="rounded-xl p-3 space-y-1 text-xs" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.06)", "border": "1px solid rgba(16,185,129,0.15)" })}"><p class="text-gray-400">Batch: <span class="text-gray-200 font-mono">${ssrInterpolate((_a2 = unref(readyModal).batch) == null ? void 0 : _a2.id)}</span></p><p class="text-gray-400">Product: <span class="text-gray-200">${ssrInterpolate((_b2 = unref(readyModal).batch) == null ? void 0 : _b2.product)}</span></p><p class="text-gray-400">Output: <span class="text-gray-200 font-semibold">${ssrInterpolate((_c2 = unref(readyModal).batch) == null ? void 0 : _c2.doneBags)} / ${ssrInterpolate((_d2 = unref(readyModal).batch) == null ? void 0 : _d2.targetBags)} bags</span></p></div><div><label class="field-label">Final bag count</label><input${ssrRenderAttr("value", unref(readyModal).finalBags)} type="number"${ssrRenderAttr("min", 0)}${ssrRenderAttr("max", ((_e = unref(readyModal).batch) == null ? void 0 : _e.targetBags) || 9999)} class="field-input w-full"></div><div class="flex gap-2"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button class="btn-gold text-xs flex-1 justify-center bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"> \u2713 Mark Complete </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2, _c2;
        if (unref(startModal).open) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-md space-y-4"><div class="flex items-start justify-between"><div><h3 class="text-sm font-semibold text-gray-200">Start Production</h3><p class="text-xs text-gray-500 mt-0.5"> Order <span class="font-mono text-gold-400/80">${ssrInterpolate((_a2 = unref(startModal).row) == null ? void 0 : _a2.orderNo)}</span> \u2014 ${ssrInterpolate((_b2 = unref(startModal).row) == null ? void 0 : _b2.product)}</p></div><button class="text-gray-600 hover:text-gray-300 text-lg leading-none">\u2715</button></div><div class="grid grid-cols-2 gap-3"><div><label class="field-label">Machine / Mill</label><select class="field-input w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(startForm).machine) ? ssrLooseContain(unref(startForm).machine, "") : ssrLooseEqual(unref(startForm).machine, "")) ? " selected" : ""}>Select\u2026</option><!--[-->`);
          ssrRenderList(machines, (m) => {
            _push2(`<option${ssrRenderAttr("value", m)}${ssrIncludeBooleanAttr(Array.isArray(unref(startForm).machine) ? ssrLooseContain(unref(startForm).machine, m) : ssrLooseEqual(unref(startForm).machine, m)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="field-label">Shift</label><select class="field-input w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(startForm).shift) ? ssrLooseContain(unref(startForm).shift, "") : ssrLooseEqual(unref(startForm).shift, "")) ? " selected" : ""}>Select\u2026</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(startForm).shift) ? ssrLooseContain(unref(startForm).shift, null) : ssrLooseEqual(unref(startForm).shift, null)) ? " selected" : ""}>Morning (6AM\u20132PM)</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(startForm).shift) ? ssrLooseContain(unref(startForm).shift, null) : ssrLooseEqual(unref(startForm).shift, null)) ? " selected" : ""}>Evening (2PM\u201310PM)</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(startForm).shift) ? ssrLooseContain(unref(startForm).shift, null) : ssrLooseEqual(unref(startForm).shift, null)) ? " selected" : ""}>Night (10PM\u20136AM)</option></select></div><div><label class="field-label">Operator</label><input${ssrRenderAttr("value", unref(startForm).operator)} type="text" class="field-input w-full" placeholder="Operator name"></div><div><label class="field-label">Target Bags</label><input${ssrRenderAttr("value", unref(startForm).targetBags)} type="number" class="field-input w-full"${ssrRenderAttr("placeholder", `${((_c2 = unref(startModal).row) == null ? void 0 : _c2.defaultBags) || 200}`)}></div><div class="col-span-2"><label class="field-label">Raw Material Source</label><select class="field-input w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(startForm).rawMaterial) ? ssrLooseContain(unref(startForm).rawMaterial, "") : ssrLooseEqual(unref(startForm).rawMaterial, "")) ? " selected" : ""}>Select silo / source\u2026</option><!--[-->`);
          ssrRenderList(silos, (s) => {
            _push2(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(startForm).rawMaterial) ? ssrLooseContain(unref(startForm).rawMaterial, s) : ssrLooseEqual(unref(startForm).rawMaterial, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="col-span-2"><label class="field-label">Notes (optional)</label><input${ssrRenderAttr("value", unref(startForm).notes)} type="text" class="field-input w-full" placeholder="Any special instructions\u2026"></div></div><div class="flex gap-2 pt-1"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button${ssrIncludeBooleanAttr(!unref(startForm).machine || !unref(startForm).shift || !unref(startForm).operator) ? " disabled" : ""} class="btn-gold text-xs flex-1 justify-center"> \u25B6 Start Batch </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/production/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BihSLmva.mjs.map
