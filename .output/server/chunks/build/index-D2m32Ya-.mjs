import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, reactive, computed, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { k as useRoute, e as createError } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J;
    let __temp, __restore;
    const route = useRoute();
    const { info, error } = useToast();
    const batchId = route.params.id;
    const { data: apiData, error: loadError } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/production/${batchId}`,
      "$uCSqcAcgA7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    if (loadError.value) {
      throw createError({ statusCode: 404, message: "Production batch not found" });
    }
    const batch = reactive({
      id: (_b = (_a = apiData.value) == null ? void 0 : _a.id) != null ? _b : batchId,
      dbId: (_d = (_c = apiData.value) == null ? void 0 : _c.dbId) != null ? _d : 0,
      orderId: (_f = (_e = apiData.value) == null ? void 0 : _e.orderId) != null ? _f : "",
      creditOrderId: (_h = (_g = apiData.value) == null ? void 0 : _g.creditOrderId) != null ? _h : 0,
      product: (_j = (_i = apiData.value) == null ? void 0 : _i.product) != null ? _j : "",
      customer: (_l = (_k = apiData.value) == null ? void 0 : _k.customer) != null ? _l : "",
      status: (_n = (_m = apiData.value) == null ? void 0 : _m.status) != null ? _n : "pending",
      startDate: (_p = (_o = apiData.value) == null ? void 0 : _o.startDate) != null ? _p : "",
      startTime: (_r = (_q = apiData.value) == null ? void 0 : _q.startTime) != null ? _r : "",
      shift: (_t = (_s = apiData.value) == null ? void 0 : _s.shift) != null ? _t : "\u2014",
      machine: (_v = (_u = apiData.value) == null ? void 0 : _u.machine) != null ? _v : "\u2014",
      operator: (_x = (_w = apiData.value) == null ? void 0 : _w.operator) != null ? _x : "\u2014",
      rawMaterial: (_z = (_y = apiData.value) == null ? void 0 : _y.rawMaterial) != null ? _z : "\u2014",
      bagWeightKg: (_B = (_A = apiData.value) == null ? void 0 : _A.bagWeightKg) != null ? _B : 50,
      targetBags: (_D = (_C = apiData.value) == null ? void 0 : _C.targetBags) != null ? _D : 0,
      doneBags: (_F = (_E = apiData.value) == null ? void 0 : _E.doneBags) != null ? _F : 0,
      updates: (_H = (_G = apiData.value) == null ? void 0 : _G.updates) != null ? _H : [],
      qualityChecks: (_J = (_I = apiData.value) == null ? void 0 : _I.qualityChecks) != null ? _J : []
    });
    const completionPct = computed(() => Math.round(batch.doneBags / batch.targetBags * 100));
    const orderedMT = computed(() => (batch.targetBags * batch.bagWeightKg / 1e3).toFixed(2));
    const producedMT = computed(() => (batch.doneBags * batch.bagWeightKg / 1e3).toFixed(2));
    const remainingMT = computed(() => ((batch.targetBags - batch.doneBags) * batch.bagWeightKg / 1e3).toFixed(2));
    const quickBags = ref(batch.doneBags);
    const logModal = ref(false);
    const logForm = reactive({ doneBags: 0, note: "", by: "" });
    const saving = ref(false);
    async function patchStatus(newStatus, extraNotes) {
      var _a2, _b2;
      saving.value = true;
      try {
        await $fetch(`/api/production/${batch.id}`, {
          method: "PATCH",
          body: { status: newStatus, ...extraNotes ? { notes: extraNotes } : {} }
        });
      } catch (e) {
        error((_b2 = (_a2 = e == null ? void 0 : e.data) == null ? void 0 : _a2.statusMessage) != null ? _b2 : "Failed to update status");
        throw e;
      } finally {
        saving.value = false;
      }
    }
    const completeModal = ref(false);
    const completeNote = ref("");
    const pauseModal = ref(false);
    const pauseReason = ref("");
    async function resumeBatch() {
      try {
        await patchStatus("running");
        batch.updates.push({
          time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" }),
          type: "update",
          note: "Batch resumed",
          by: "Current User"
        });
        batch.status = "running";
        info(`Batch ${batch.id} resumed \u25B6`);
      } catch {
      }
    }
    const cancelModal = ref(false);
    const cancelReason = ref("");
    const qcModal = ref(false);
    const qcForm = reactive({ moisture: 12.5, grade: "A" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: unref(batch).id,
        subtitle: `${unref(batch).product} \xB7 ${unref(batch).customer}`,
        breadcrumb: ["Production", unref(batch).id]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_UiStatusBadge, {
              status: unref(batch).status
            }, null, _parent2, _scopeId));
            if (unref(batch).status === "running") {
              _push2(`<button class="btn-ghost text-xs text-yellow-400"${_scopeId}>\u23F8 Pause</button>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(batch).status === "paused") {
              _push2(`<button class="btn-ghost text-xs text-emerald-400"${_scopeId}>\u25B6 Resume</button>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(batch).status !== "completed" && unref(batch).status !== "cancelled") {
              _push2(`<button class="btn-gold text-xs"${_scopeId}>\u2713 Mark Complete</button>`);
            } else {
              _push2(`<!---->`);
            }
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
              createVNode(_component_UiStatusBadge, {
                status: unref(batch).status
              }, null, 8, ["status"]),
              unref(batch).status === "running" ? (openBlock(), createBlock("button", {
                key: 0,
                onClick: ($event) => pauseModal.value = true,
                class: "btn-ghost text-xs text-yellow-400"
              }, "\u23F8 Pause", 8, ["onClick"])) : createCommentVNode("", true),
              unref(batch).status === "paused" ? (openBlock(), createBlock("button", {
                key: 1,
                onClick: resumeBatch,
                class: "btn-ghost text-xs text-emerald-400"
              }, "\u25B6 Resume")) : createCommentVNode("", true),
              unref(batch).status !== "completed" && unref(batch).status !== "cancelled" ? (openBlock(), createBlock("button", {
                key: 2,
                onClick: ($event) => completeModal.value = true,
                class: "btn-gold text-xs"
              }, "\u2713 Mark Complete", 8, ["onClick"])) : createCommentVNode("", true),
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
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-5"><div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs"><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Sales Order</p><p class="font-mono text-gold-400/80">${ssrInterpolate(unref(batch).orderId)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Customer</p><p class="text-gray-200">${ssrInterpolate(unref(batch).customer)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Shift</p><p class="text-gray-300">${ssrInterpolate(unref(batch).shift)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Machine</p><p class="text-gray-200 font-semibold">${ssrInterpolate(unref(batch).machine)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Operator</p><p class="text-gray-200">${ssrInterpolate(unref(batch).operator)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Started</p><p class="text-gray-300">${ssrInterpolate(unref(batch).startDate)} ${ssrInterpolate(unref(batch).startTime)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Raw Material</p><p class="text-gray-300">${ssrInterpolate(unref(batch).rawMaterial)}</p></div><div><p class="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Bag Weight</p><p class="text-gray-300">${ssrInterpolate(unref(batch).bagWeightKg)} kg</p></div></div><div class="space-y-2"><div class="flex justify-between text-xs"><span class="text-gray-500">Output Progress</span><span class="font-mono font-semibold text-gray-200">${ssrInterpolate(unref(batch).doneBags)} / ${ssrInterpolate(unref(batch).targetBags)} bags</span></div><div class="h-3 rounded-full bg-white/[0.06] overflow-hidden"><div class="${ssrRenderClass([unref(completionPct) >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-gold-600 to-gold-400", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(unref(completionPct), 100)}%`)}"></div></div><div class="flex justify-between text-[11px]"><span class="${ssrRenderClass(unref(completionPct) >= 80 ? "text-emerald-400 font-semibold" : "text-gray-500")}">${ssrInterpolate(unref(completionPct))}% complete </span><span class="text-gray-600">${ssrInterpolate(unref(batch).targetBags - unref(batch).doneBags)} bags remaining</span></div></div><div class="grid grid-cols-3 gap-3 text-center"><div class="rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.06)" })}"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Ordered (MT)</p><p class="text-lg font-bold font-mono text-gray-200">${ssrInterpolate(unref(orderedMT))}</p></div><div class="rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.05)", "border": "1px solid rgba(16,185,129,0.12)" })}"><p class="text-[10px] text-emerald-600 uppercase tracking-wider">Produced (MT)</p><p class="text-lg font-bold font-mono text-emerald-400">${ssrInterpolate(unref(producedMT))}</p></div><div class="rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.05)", "border": "1px solid rgba(245,158,11,0.12)" })}"><p class="text-[10px] text-yellow-600 uppercase tracking-wider">Remaining (MT)</p><p class="text-lg font-bold font-mono text-yellow-400">${ssrInterpolate(unref(remainingMT))}</p></div></div></div><div class="glass-card p-5 space-y-4"><div class="flex items-center justify-between"><h3 class="section-title">Activity Log</h3>`);
      if (unref(batch).status !== "completed") {
        _push(`<button class="btn-ghost text-xs">+ Log Update</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-2"><!--[-->`);
      ssrRenderList(unref(batch).updates, (log, i) => {
        _push(`<div class="flex gap-3 text-xs"><div class="flex flex-col items-center"><div class="${ssrRenderClass([log.type === "start" ? "bg-gold-400" : log.type === "complete" ? "bg-emerald-400" : log.type === "pause" ? "bg-yellow-400" : "bg-blue-400", "w-2 h-2 rounded-full mt-0.5 shrink-0"])}"></div>`);
        if (i < unref(batch).updates.length - 1) {
          _push(`<div class="w-px flex-1 bg-white/[0.06] mt-1 mb-0"></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="pb-3 flex-1"><div class="flex items-start justify-between gap-2"><p class="text-gray-300">${ssrInterpolate(log.note)}</p><span class="text-gray-600 shrink-0">${ssrInterpolate(log.time)}</span></div>`);
        if (log.doneBags !== void 0) {
          _push(`<p class="text-gray-600 mt-0.5"> Progress: ${ssrInterpolate(log.doneBags)} / ${ssrInterpolate(unref(batch).targetBags)} bags (${ssrInterpolate(Math.round(log.doneBags / unref(batch).targetBags * 100))}%) </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<p class="text-gray-600 mt-0.5">By: ${ssrInterpolate(log.by)}</p></div></div>`);
      });
      _push(`<!--]-->`);
      if (unref(batch).updates.length === 0) {
        _push(`<div class="text-xs text-gray-600 text-center py-4">No activity logged yet.</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="glass-card p-5 space-y-3"><div class="flex items-center justify-between"><h3 class="section-title">Quality Checks</h3><button class="btn-ghost text-xs">+ Add Check</button></div>`);
      if (unref(batch).qualityChecks.length === 0) {
        _push(`<div class="text-xs text-gray-600 text-center py-4">No QC entries yet.</div>`);
      } else {
        _push(`<table class="w-full text-xs"><thead><tr class="border-b border-white/[0.06]"><th class="pb-2 text-left text-gray-600 font-semibold uppercase tracking-wider">Time</th><th class="pb-2 text-center text-gray-600 font-semibold uppercase tracking-wider">Moisture %</th><th class="pb-2 text-center text-gray-600 font-semibold uppercase tracking-wider">Grade</th><th class="pb-2 text-center text-gray-600 font-semibold uppercase tracking-wider">Result</th></tr></thead><tbody class="divide-y divide-white/[0.04]"><!--[-->`);
        ssrRenderList(unref(batch).qualityChecks, (qc, i) => {
          _push(`<tr><td class="py-2 text-gray-500">${ssrInterpolate(qc.time)}</td><td class="${ssrRenderClass([qc.moisture > 13 ? "text-red-400" : "text-gray-300", "py-2 text-center font-mono"])}">${ssrInterpolate(qc.moisture)}% </td><td class="py-2 text-center text-gray-300">${ssrInterpolate(qc.grade)}</td><td class="py-2 text-center"><span class="${ssrRenderClass([qc.passed ? "text-emerald-400" : "text-red-400", "text-xs font-semibold"])}">${ssrInterpolate(qc.passed ? "\u2713 Pass" : "\u2717 Fail")}</span></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`</div></div><div class="space-y-5">`);
      if (unref(batch).status !== "completed") {
        _push(`<div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Quick Update</h3><div class="space-y-2"><label class="field-label">Bags Completed</label><input${ssrRenderAttr("value", unref(quickBags))} type="number" class="field-input w-full"${ssrRenderAttr("min", unref(batch).doneBags)}${ssrRenderAttr("max", unref(batch).targetBags)}${ssrRenderAttr("placeholder", String(unref(batch).doneBags))}><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div class="h-full rounded-full bg-gold-500/70 transition-all" style="${ssrRenderStyle(`width:${Math.min(Math.round(unref(quickBags) / unref(batch).targetBags * 100), 100)}%`)}"></div></div></div><button${ssrIncludeBooleanAttr(unref(quickBags) <= unref(batch).doneBags) ? " disabled" : ""} class="btn-gold text-xs w-full justify-center"> Save Progress </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Batch Summary</h3><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">Status</span>`);
      _push(ssrRenderComponent(_component_UiStatusBadge, {
        status: unref(batch).status
      }, null, _parent));
      _push(`</div><div class="flex justify-between"><span class="text-gray-600">Machine</span><span class="text-gray-200 font-semibold">${ssrInterpolate(unref(batch).machine)}</span></div><div class="flex justify-between"><span class="text-gray-600">Operator</span><span class="text-gray-300">${ssrInterpolate(unref(batch).operator)}</span></div><div class="flex justify-between"><span class="text-gray-600">Shift</span><span class="text-gray-300">${ssrInterpolate(unref(batch).shift)}</span></div><div class="flex justify-between"><span class="text-gray-600">QC Checks</span><span class="${ssrRenderClass(unref(batch).qualityChecks.some((q) => !q.passed) ? "text-red-400 font-semibold" : "text-emerald-400")}">${ssrInterpolate(unref(batch).qualityChecks.filter((q) => q.passed).length)} / ${ssrInterpolate(unref(batch).qualityChecks.length)} pass </span></div></div></div><div class="glass-card p-5 space-y-2"><h3 class="text-sm font-semibold text-gray-300">Actions</h3>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/credit-sales/${unref(batch).creditOrderId || unref(batch).orderId}`,
        class: "btn-ghost text-xs w-full justify-start gap-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u{1F517} View Sales Order `);
          } else {
            return [
              createTextVNode(" \u{1F517} View Sales Order ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(batch).status !== "completed" && unref(batch).status !== "cancelled") {
        _push(`<button class="btn-ghost text-xs w-full justify-start gap-2 text-red-400 hover:border-red-500/30"> \u2715 Cancel Batch </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(logModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-sm space-y-4"><h3 class="text-sm font-semibold text-gray-200">Log Progress Update</h3><div class="space-y-3"><div><label class="field-label">Bags Completed</label><input${ssrRenderAttr("value", unref(logForm).doneBags)} type="number" class="field-input w-full"${ssrRenderAttr("min", unref(batch).doneBags)}${ssrRenderAttr("max", unref(batch).targetBags)}></div><div><label class="field-label">Note</label><input${ssrRenderAttr("value", unref(logForm).note)} type="text" class="field-input w-full" placeholder="e.g. Shift handover, machine cleaned\u2026"></div><div><label class="field-label">By</label><input${ssrRenderAttr("value", unref(logForm).by)} type="text" class="field-input w-full" placeholder="Your name"></div></div><div class="flex gap-2"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button class="btn-gold text-xs flex-1 justify-center">Save</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(completeModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-sm space-y-4"><h3 class="text-sm font-semibold text-gray-200">Mark Batch Complete</h3><div class="space-y-2 text-xs rounded-xl p-3" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.06)", "border": "1px solid rgba(16,185,129,0.15)" })}"><p class="text-gray-400">Final bags: <span class="text-gray-200 font-bold">${ssrInterpolate(unref(batch).doneBags)}</span></p><p class="text-gray-400">Output: <span class="text-emerald-400 font-bold">${ssrInterpolate(unref(producedMT))} MT</span></p></div><div><label class="field-label">Closing Note (optional)</label><input${ssrRenderAttr("value", unref(completeNote))} type="text" class="field-input w-full" placeholder="Any remarks\u2026"></div><div class="flex gap-2"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button class="btn-gold text-xs flex-1 justify-center" style="${ssrRenderStyle({ "background": "rgba(16,185,129,0.15)", "border-color": "rgba(16,185,129,0.3)", "color": "#6ee7b7" })}"> \u2713 Complete Batch </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(pauseModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-sm space-y-4"><h3 class="text-sm font-semibold text-gray-200">Pause Batch</h3><div><label class="field-label">Reason for pause</label><input${ssrRenderAttr("value", unref(pauseReason))} type="text" class="field-input w-full" placeholder="e.g. Machine maintenance, shift break\u2026"></div><div class="flex gap-2"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button${ssrIncludeBooleanAttr(!unref(pauseReason)) ? " disabled" : ""} class="btn-ghost text-xs flex-1 justify-center text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"> \u23F8 Pause </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(cancelModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-sm space-y-4"><h3 class="text-sm font-semibold text-red-400">Cancel Batch?</h3><p class="text-xs text-gray-500">This will mark the batch as cancelled. The sales order will be returned to the pending queue.</p><div><label class="field-label">Reason (required)</label><input${ssrRenderAttr("value", unref(cancelReason))} type="text" class="field-input w-full" placeholder="Why is this batch being cancelled?"></div><div class="flex gap-2"><button class="btn-ghost text-xs flex-1 justify-center">Back</button><button${ssrIncludeBooleanAttr(!unref(cancelReason)) ? " disabled" : ""} class="btn-ghost text-xs flex-1 justify-center text-red-400 border-red-500/30 hover:bg-red-500/10"> Cancel Batch </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(qcModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}"><div class="glass-card p-6 w-full max-w-sm space-y-4"><h3 class="text-sm font-semibold text-gray-200">Add Quality Check</h3><div class="grid grid-cols-2 gap-3"><div><label class="field-label">Moisture %</label><input${ssrRenderAttr("value", unref(qcForm).moisture)} type="number" step="0.1" min="0" max="30" class="field-input w-full" placeholder="e.g. 12.4"></div><div><label class="field-label">Grade</label><select class="field-input w-full"><option${ssrIncludeBooleanAttr(Array.isArray(unref(qcForm).grade) ? ssrLooseContain(unref(qcForm).grade, null) : ssrLooseEqual(unref(qcForm).grade, null)) ? " selected" : ""}>A+</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(qcForm).grade) ? ssrLooseContain(unref(qcForm).grade, null) : ssrLooseEqual(unref(qcForm).grade, null)) ? " selected" : ""}>A</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(qcForm).grade) ? ssrLooseContain(unref(qcForm).grade, null) : ssrLooseEqual(unref(qcForm).grade, null)) ? " selected" : ""}>B</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(qcForm).grade) ? ssrLooseContain(unref(qcForm).grade, null) : ssrLooseEqual(unref(qcForm).grade, null)) ? " selected" : ""}>C</option></select></div></div><div class="text-xs text-gray-500"> Pass criteria: moisture &lt; 13%, grade A or above </div><div class="flex gap-2"><button class="btn-ghost text-xs flex-1 justify-center">Cancel</button><button class="btn-gold text-xs flex-1 justify-center">Add Check</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/production/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-D2m32Ya-.mjs.map
