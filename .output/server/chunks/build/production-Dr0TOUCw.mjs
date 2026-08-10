import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, withCtx, unref, openBlock, createBlock, createVNode, createTextVNode, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as usePermissions } from './usePermissions-Bt-D0WF_.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { c as _export_sfc, p as useUserSession } from './server.mjs';
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
import './permRoutes-Ddy1yO1t.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "production",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const { success, error: toastError } = useToast();
    const { user: sessionUser } = useUserSession();
    const isAdmin = computed(
      () => {
        var _a, _b;
        return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
      }
    );
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/production-queue",
      "$PlOXEMDEER"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const urgentCount = computed(() => queue.value.filter((o) => o.priority === "urgent").length);
    const dragging = ref(null);
    const dragOver = ref(null);
    const isDragging = ref(false);
    const queue = ref([]);
    watch(
      () => {
        var _a;
        return (_a = data.value) == null ? void 0 : _a.orders;
      },
      (orders) => {
        if (!isDragging.value && orders) {
          queue.value = orders.map((o) => ({ ...o }));
        }
      },
      { immediate: true }
    );
    const saving = ref(false);
    let saveTimer = null;
    function scheduleSave() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(persistOrder, 800);
    }
    async function persistOrder() {
      saving.value = true;
      try {
        await $fetch("/api/credit-sales/production-queue/reorder", {
          method: "PATCH",
          body: { ids: queue.value.map((o) => o.id) }
        });
      } catch {
        toastError("Could not save queue order \u2014 please try again");
      } finally {
        saving.value = false;
      }
    }
    const PRIORITY_SCORE = { urgent: 3, high: 2, normal: 1 };
    function autoRank() {
      queue.value = [...queue.value].sort((a, b) => {
        var _a, _b;
        const pa = (_a = PRIORITY_SCORE[a.priority]) != null ? _a : 1;
        const pb = (_b = PRIORITY_SCORE[b.priority]) != null ? _b : 1;
        if (pa !== pb) return pb - pa;
        const da = a.required_date ? new Date(a.required_date).getTime() : Infinity;
        const db = b.required_date ? new Date(b.required_date).getTime() : Infinity;
        if (da !== db) return da - db;
        return Number(b.total_amount) - Number(a.total_amount);
      });
      scheduleSave();
      success("Queue auto-ranked: urgent \u2192 nearest due date \u2192 highest value \u2713");
    }
    function dueSoon(order) {
      if (!order.required_date) return false;
      const daysAway = (new Date(order.required_date).getTime() - Date.now()) / 864e5;
      return daysAway <= 2;
    }
    function fmtDate(d) {
      if (!d) return "\u2014";
      return new Date(d).toLocaleDateString("en-BD", { day: "2-digit", month: "short" });
    }
    const acting = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-aa9b3821>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Production Queue",
        subtitle: "Drag to prioritise \u2014 changes save automatically",
        breadcrumb: ["Credit Sales", "Production Queue"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(isAdmin) && unref(queue).length > 1) {
              _push2(`<button class="btn-ghost text-xs flex items-center gap-1.5" data-v-aa9b3821${_scopeId}><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-aa9b3821${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" data-v-aa9b3821${_scopeId}></path></svg> Auto-rank </button>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="btn-ghost text-xs" data-v-aa9b3821${_scopeId}>\u21BB Refresh</button>`);
          } else {
            return [
              unref(isAdmin) && unref(queue).length > 1 ? (openBlock(), createBlock("button", {
                key: 0,
                onClick: autoRank,
                class: "btn-ghost text-xs flex items-center gap-1.5"
              }, [
                (openBlock(), createBlock("svg", {
                  class: "w-3.5 h-3.5",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  })
                ])),
                createTextVNode(" Auto-rank ")
              ])) : createCommentVNode("", true),
              createVNode("button", {
                onClick: unref(refresh),
                class: "btn-ghost text-xs"
              }, "\u21BB Refresh", 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-aa9b3821><div class="glass-card p-4 text-center space-y-1" data-v-aa9b3821><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold" data-v-aa9b3821>In Production</p><p class="text-2xl font-bold text-blue-400" data-v-aa9b3821>${ssrInterpolate((_a = unref(stats).in_production) != null ? _a : unref(queue).length)}</p></div><div class="glass-card p-4 text-center space-y-1" data-v-aa9b3821><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold" data-v-aa9b3821>Ready Today</p><p class="text-2xl font-bold text-emerald-400" data-v-aa9b3821>${ssrInterpolate((_b = unref(stats).ready_today) != null ? _b : 0)}</p></div><div class="glass-card p-4 text-center space-y-1" data-v-aa9b3821><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold" data-v-aa9b3821>Total Weight</p><p class="text-2xl font-bold text-gold-400" data-v-aa9b3821>${ssrInterpolate((((_c = unref(stats).total_weight_kg) != null ? _c : 0) / 1e3).toFixed(1))}MT</p></div><div class="glass-card p-4 text-center space-y-1" data-v-aa9b3821><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold" data-v-aa9b3821>Urgent Orders</p><p class="text-2xl font-bold text-red-400" data-v-aa9b3821>${ssrInterpolate(unref(urgentCount))}</p></div></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500" data-v-aa9b3821>Loading queue\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm" data-v-aa9b3821>\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(isAdmin) && unref(queue).length > 1) {
          _push(`<p class="text-[11px] text-gray-600 flex items-center gap-2 px-1 select-none" data-v-aa9b3821><svg class="w-3 h-4 shrink-0" viewBox="0 0 12 18" fill="currentColor" data-v-aa9b3821><circle cx="3" cy="3" r="1.4" data-v-aa9b3821></circle><circle cx="9" cy="3" r="1.4" data-v-aa9b3821></circle><circle cx="3" cy="9" r="1.4" data-v-aa9b3821></circle><circle cx="9" cy="9" r="1.4" data-v-aa9b3821></circle><circle cx="3" cy="15" r="1.4" data-v-aa9b3821></circle><circle cx="9" cy="15" r="1.4" data-v-aa9b3821></circle></svg> Drag cards to set production priority \xB7 saved automatically </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-3" data-v-aa9b3821><!--[-->`);
        ssrRenderList(unref(queue), (order, idx) => {
          _push(`<div${ssrRenderAttr("draggable", unref(isAdmin) ? "true" : "false")} class="${ssrRenderClass([
            "glass-card p-4 transition-all duration-150 select-none",
            unref(isAdmin) ? "cursor-grab active:cursor-grabbing" : "",
            unref(isDragging) && unref(dragOver) === idx && unref(dragging) !== idx ? "ring-1 ring-gold-400/50 bg-gold-400/[0.03] translate-y-0.5 shadow-xl shadow-gold-400/10" : "",
            unref(dragging) === idx ? "opacity-20 scale-[0.98]" : "opacity-100"
          ])}" data-v-aa9b3821><div class="flex items-center gap-3" data-v-aa9b3821><div class="${ssrRenderClass([
            "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-colors",
            idx === 0 ? "bg-red-500/20 text-red-400 border border-red-500/30" : idx === 1 ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : idx === 2 ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/25" : "bg-white/[0.04] text-gray-500 border border-white/[0.08]"
          ])}" data-v-aa9b3821>${ssrInterpolate(idx + 1)}</div>`);
          if (unref(isAdmin)) {
            _push(`<div class="text-gray-600 hover:text-gray-400 transition-colors shrink-0 cursor-grab active:cursor-grabbing" title="Drag to reorder" data-v-aa9b3821><svg class="w-3.5 h-5" viewBox="0 0 12 20" fill="currentColor" data-v-aa9b3821><circle cx="3" cy="4" r="1.5" data-v-aa9b3821></circle><circle cx="9" cy="4" r="1.5" data-v-aa9b3821></circle><circle cx="3" cy="10" r="1.5" data-v-aa9b3821></circle><circle cx="9" cy="10" r="1.5" data-v-aa9b3821></circle><circle cx="3" cy="16" r="1.5" data-v-aa9b3821></circle><circle cx="9" cy="16" r="1.5" data-v-aa9b3821></circle></svg></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex-1 min-w-0" data-v-aa9b3821><div class="flex items-center gap-2 flex-wrap" data-v-aa9b3821><span class="font-mono text-xs font-bold text-gold-400/90" data-v-aa9b3821>${ssrInterpolate(order.orderNo)}</span>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: order.priority
          }, null, _parent));
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: order.status
          }, null, _parent));
          if (dueSoon(order)) {
            _push(`<span class="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full border border-red-500/20 animate-pulse" data-v-aa9b3821> \u23F0 Due ${ssrInterpolate(fmtDate(order.required_date))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><p class="text-sm font-semibold text-gray-200 mt-1 truncate" data-v-aa9b3821>${ssrInterpolate(order.customer)}</p><p class="text-[11px] text-gray-500 mt-0.5 truncate" data-v-aa9b3821>${ssrInterpolate(order.items.map((i) => `${i.product} \xD7${i.qty}`).join(" \xB7 ") || "\u2014")}</p></div><div class="w-28 shrink-0 hidden sm:block" data-v-aa9b3821><div class="flex justify-between text-[10px] text-gray-600 mb-1.5" data-v-aa9b3821><span data-v-aa9b3821>Progress</span><span class="${ssrRenderClass([order.progress >= 100 ? "text-emerald-400" : "text-gray-400", "font-semibold"])}" data-v-aa9b3821>${ssrInterpolate(order.progress)}% </span></div><div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden" data-v-aa9b3821><div class="h-full rounded-full transition-all duration-500" style="${ssrRenderStyle(`width:${order.progress}%;background:${order.progress >= 100 ? "#10b981" : "#3b82f6"}`)}" data-v-aa9b3821></div></div></div><div class="text-right shrink-0 hidden md:block w-24" data-v-aa9b3821><p class="text-xs font-bold text-gold-400" data-v-aa9b3821>\u09F3${ssrInterpolate(Number(order.total_amount).toLocaleString())}</p><p class="text-[10px] text-gray-600 mt-0.5" data-v-aa9b3821>${ssrInterpolate(order.items.reduce((s, i) => s + i.qty, 0).toLocaleString())} bags </p></div>`);
          if (order.status === "approved" && unref(perms).canDo("credit_sales", "production", "start_production")) {
            _push(`<button${ssrIncludeBooleanAttr(unref(acting) === order.id) ? " disabled" : ""} class="btn-ghost text-xs py-1.5 px-3 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed text-blue-400 border-blue-500/20" data-v-aa9b3821>${ssrInterpolate(unref(acting) === order.id ? "\u2026" : "\u25B6 Start")}</button>`);
          } else {
            _push(`<!---->`);
          }
          if (order.status === "in_production" && unref(perms).canDo("credit_sales", "production", "mark_ready")) {
            _push(`<button${ssrIncludeBooleanAttr(unref(acting) === order.id) ? " disabled" : ""} class="btn-gold text-xs py-1.5 px-3 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed" data-v-aa9b3821>${ssrInterpolate(unref(acting) === order.id ? "\u2026" : "\u2713 Ready")}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (unref(queue).length === 0) {
          _push(`<div class="glass-card p-14 text-center space-y-3" data-v-aa9b3821><p class="text-4xl" data-v-aa9b3821>\u{1F3ED}</p><p class="text-sm font-semibold text-gray-400" data-v-aa9b3821>No orders in production</p><p class="text-xs text-gray-600" data-v-aa9b3821>Approved orders appear here when sent to production.</p>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/credit-sales/approve",
            class: "btn-ghost text-xs inline-block mt-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` View pending approvals \u2192 `);
              } else {
                return [
                  createTextVNode(" View pending approvals \u2192 ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--]-->`);
      }
      if (unref(saving)) {
        _push(`<div class="fixed bottom-6 right-6 z-40 glass-card px-4 py-2.5 flex items-center gap-2.5 text-xs text-gray-400 shadow-2xl border border-gold-400/20" data-v-aa9b3821><div class="w-2 h-2 rounded-full bg-gold-400 animate-pulse shrink-0" data-v-aa9b3821></div> Saving queue order\u2026 </div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/production.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const production = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-aa9b3821"]]);

export { production as default };
//# sourceMappingURL=production-Dr0TOUCw.mjs.map
