import { _ as _sfc_main$5 } from './BackButton-DGvLz7w-.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, ref, watch, mergeProps, unref, withCtx, openBlock, createBlock, createVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrRenderTeleport, ssrRenderList, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { _ as _sfc_main$6 } from './SidebarIcon-oZVkzwjh.mjs';
import { u as usePermissions } from './usePermissions-Bt-D0WF_.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { c as _export_sfc, p as useUserSession } from './server.mjs';
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
import './permRoutes-Ddy1yO1t.mjs';
import '@vue/shared';
import 'perfect-debounce';
import 'vue-router';

const gap = 2;
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "UiSparkline",
  __ssrInlineRender: true,
  props: {
    values: {},
    type: { default: "line" },
    color: { default: "#10b981" },
    width: { default: 80 },
    height: { default: 28 }
  },
  setup(__props) {
    const props = __props;
    const uid = Math.random().toString(36).slice(2, 7);
    const barW = computed(() => {
      const n = props.values.length || 7;
      const totalGap = (n - 1) * 2;
      return (props.width - totalGap) / n;
    });
    const min = computed(() => Math.min(...props.values));
    const max = computed(() => Math.max(...props.values));
    const range = computed(() => max.value - min.value || 1);
    const normalised = computed(
      () => props.values.map((v) => Math.max(2, (v - min.value) / range.value * (props.height - 4) + 2))
    );
    function barFill(i) {
      var _a;
      const isUp = props.values[i] >= ((_a = props.values[i - 1]) != null ? _a : props.values[i]);
      return isUp ? "#10b981" : "#f87171";
    }
    const points = computed(() => {
      const n = props.values.length;
      return props.values.map((v, i) => [
        i / (n - 1) * props.width,
        props.height - (v - min.value) / range.value * (props.height - 4) - 2
      ]);
    });
    const linePath = computed(() => {
      if (points.value.length < 2) return "";
      const [first, ...rest] = points.value;
      return `M${first[0]},${first[1]} ` + rest.map(([x, y]) => `L${x},${y}`).join(" ");
    });
    const areaPath = computed(() => {
      if (points.value.length < 2) return "";
      const first = points.value[0];
      const last = points.value[points.value.length - 1];
      return `${linePath.value} L${last[0]},${props.height} L${first[0]},${props.height} Z`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<svg${ssrRenderAttrs(mergeProps({
        width: __props.width,
        height: __props.height,
        viewBox: `0 0 ${__props.width} ${__props.height}`,
        class: "overflow-visible"
      }, _attrs))}>`);
      if (__props.type === "bar") {
        _push(`<g><!--[-->`);
        ssrRenderList(unref(normalised), (val, i) => {
          _push(`<rect${ssrRenderAttr("x", i * (unref(barW) + gap))}${ssrRenderAttr("y", __props.height - val)}${ssrRenderAttr("width", unref(barW))}${ssrRenderAttr("height", val)}${ssrRenderAttr("fill", barFill(i))}${ssrRenderAttr("opacity", i === unref(normalised).length - 1 ? 1 : 0.55)} rx="1.5"></rect>`);
        });
        _push(`<!--]--></g>`);
      } else {
        _push(`<g><path${ssrRenderAttr("d", unref(areaPath))}${ssrRenderAttr("fill", `url(#spark-grad-${unref(uid)})`)} opacity="0.18"></path><path${ssrRenderAttr("d", unref(linePath))} fill="none"${ssrRenderAttr("stroke", __props.color)} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle${ssrRenderAttr("cx", unref(points)[unref(points).length - 1][0])}${ssrRenderAttr("cy", unref(points)[unref(points).length - 1][1])} r="2"${ssrRenderAttr("fill", __props.color)}></circle><defs><linearGradient${ssrRenderAttr("id", `spark-grad-${unref(uid)}`)} x1="0" y1="0" x2="0" y2="1"><stop offset="0%"${ssrRenderAttr("stop-color", __props.color)} stop-opacity="1"></stop><stop offset="100%"${ssrRenderAttr("stop-color", __props.color)} stop-opacity="0"></stop></linearGradient></defs></g>`);
      }
      _push(`</svg>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UiSparkline.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "MiniStatCard",
  __ssrInlineRender: true,
  props: {
    label: {},
    value: {},
    delta: {},
    icon: {},
    positive: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SidebarIcon = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "glass-card px-4 py-3.5 flex items-center gap-3" }, _attrs))}><div class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 shrink-0" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.06)" })}">`);
      _push(ssrRenderComponent(_component_SidebarIcon, {
        type: __props.icon,
        class: "w-3.5 h-3.5"
      }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0"><p class="text-[11px] text-gray-500 truncate">${ssrInterpolate(__props.label)}</p><p class="text-base font-bold text-white leading-tight">${ssrInterpolate(__props.value)}</p></div><span class="${ssrRenderClass([
        "text-xs font-semibold px-1.5 py-0.5 rounded-md shrink-0",
        __props.positive !== false ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
      ])}">${ssrInterpolate(__props.delta)}</span></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MiniStatCard.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ActivityItem",
  __ssrInlineRender: true,
  props: {
    icon: {},
    label: {},
    time: {},
    type: {}
  },
  setup(__props) {
    const props = __props;
    const dotClass = computed(() => {
      var _a;
      return (_a = {
        success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        gold: "bg-gold-500/10 text-gold-400 border border-gold-500/20",
        info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        error: "bg-red-500/10 text-red-400 border border-red-500/20"
      }[props.type]) != null ? _a : "bg-white/[0.06] text-gray-400";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SidebarIcon = _sfc_main$6;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-start gap-3 group" }, _attrs))}><div class="${ssrRenderClass(["w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-150", unref(dotClass)])}">`);
      _push(ssrRenderComponent(_component_SidebarIcon, {
        type: __props.icon,
        class: "w-3 h-3"
      }, null, _parent));
      _push(`</div><div class="flex-1 min-w-0"><p class="text-xs text-gray-300 leading-snug">${ssrInterpolate(__props.label)}</p><p class="text-[10px] text-gray-600 mt-0.5">${ssrInterpolate(__props.time)}</p></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ActivityItem.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "PendingRow",
  __ssrInlineRender: true,
  props: {
    orderNo: {},
    customer: {},
    amount: {},
    status: {}
  },
  setup(__props) {
    const props = __props;
    const statusColor = computed(() => props.status === "escalated" ? "#f97316" : "#f59e0b");
    const statusLabel = computed(() => props.status === "escalated" ? "Escalated" : "Pending");
    const badgeClass = computed(
      () => props.status === "escalated" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:bg-white/[0.04] group cursor-pointer" }, _attrs))}><div class="w-1.5 h-1.5 rounded-full shrink-0" style="${ssrRenderStyle(`background: ${unref(statusColor)}`)}"></div><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-xs font-mono font-medium text-gold-400/80">${ssrInterpolate(__props.orderNo)}</span><span class="${ssrRenderClass(["badge text-[10px]", unref(badgeClass)])}">${ssrInterpolate(unref(statusLabel))}</span></div><p class="text-xs text-gray-400 truncate mt-0.5">${ssrInterpolate(__props.customer)}</p></div><div class="text-right shrink-0"><p class="text-xs font-semibold text-gray-200">\u09F3${ssrInterpolate((__props.amount / 1e3).toFixed(0))}K</p></div><svg class="w-3.5 h-3.5 text-gray-700 group-hover:text-gold-500 transition-colors duration-150 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PendingRow.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const perms = usePermissions();
    const { data: statsData, refresh: refreshStats } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/dashboard/stats",
      "$ImEurxGzVd"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { user: sessionUserForRadar } = useUserSession();
    const isAdminOrAccounts = computed(() => {
      var _a, _b;
      return ["admin", "superadmin", "accounts", "accounts-srg", "accounts-demra"].includes(((_b = (_a = sessionUserForRadar.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const { data: radarData } = isAdminOrAccounts.value ? ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/dashboard/exception-radar",
      "$rQJEDGjE0F"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp) : { data: ref(null) };
    const radarTiles = computed(() => {
      var _a, _b;
      return (_b = (_a = radarData.value) == null ? void 0 : _a.tiles) != null ? _b : [];
    });
    const radarTotal = computed(() => {
      var _a, _b;
      return (_b = (_a = radarData.value) == null ? void 0 : _a.total) != null ? _b : 0;
    });
    const chartPeriod = ref("1M");
    const { data: monthlyRevenueData, refresh: refreshRevenue } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/dashboard/monthly-revenue",
      {
        query: computed(() => ({ period: chartPeriod.value }))
      },
      "$V2Hc0igKsx"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(chartPeriod, () => refreshRevenue());
    const activityFeed = ref([]);
    const { user: sessionUser } = useUserSession();
    const greeting = computed(() => {
      const h = (/* @__PURE__ */ new Date()).getHours();
      return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
    });
    const formattedDate = computed(
      () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    );
    function fmtLakh(val) {
      const n = Number(val != null ? val : 0);
      if (n >= 1e7) return "\u09F3" + (n / 1e7).toFixed(1) + "Cr";
      if (n >= 1e5) return "\u09F3" + (n / 1e5).toFixed(1) + "L";
      return "\u09F3" + n.toLocaleString();
    }
    const s = computed(() => {
      var _a, _b;
      return (_b = (_a = statsData.value) == null ? void 0 : _a.orderStats) != null ? _b : {};
    });
    const rv = computed(() => {
      var _a, _b;
      return (_b = (_a = statsData.value) == null ? void 0 : _a.revenueStats) != null ? _b : {};
    });
    const ex = computed(() => {
      var _a, _b;
      return (_b = (_a = statsData.value) == null ? void 0 : _a.expenseStats) != null ? _b : {};
    });
    const po = computed(() => {
      var _a, _b;
      return (_b = (_a = statsData.value) == null ? void 0 : _a.purchaseStats) != null ? _b : {};
    });
    const collectionRate = computed(() => {
      var _a, _b;
      const total = Number((_a = rv.value.total_revenue) != null ? _a : 0);
      const collected = Number((_b = rv.value.total_collected) != null ? _b : 0);
      if (!total) return 0;
      return Math.min(100, Math.round(collected / total * 100));
    });
    const revenueSpark = computed(
      () => {
        var _a;
        return ((_a = monthlyRevenueData.value) != null ? _a : []).map((r) => Number(r.revenue) / 1e5);
      }
    );
    const orderCountSpark = computed(
      () => {
        var _a;
        return ((_a = monthlyRevenueData.value) != null ? _a : []).map((r) => Number(r.order_count));
      }
    );
    const kpiCards = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
      return [
        {
          label: "Month Revenue",
          value: fmtLakh(rv.value.total_revenue),
          sub: `Collected: ${fmtLakh(rv.value.total_collected)}`,
          trend: `${fmtLakh(rv.value.total_outstanding)} outstanding`,
          up: true,
          valueColor: "text-gold-400",
          spark: revenueSpark.value.length ? revenueSpark.value : [0]
        },
        {
          label: "Pending Approvals",
          value: String((_b = (_a = statsData.value) == null ? void 0 : _a.pendingApprovals) != null ? _b : 0),
          sub: `${(_c = s.value.escalated) != null ? _c : 0} escalated`,
          trend: ((_e = (_d = statsData.value) == null ? void 0 : _d.pendingApprovals) != null ? _e : 0) > 0 ? "needs action" : "all clear",
          up: ((_g = (_f = statsData.value) == null ? void 0 : _f.pendingApprovals) != null ? _g : 0) === 0,
          valueColor: "text-amber-400",
          spark: [0, 0, 0, 0, 0, 0, (_i = (_h = statsData.value) == null ? void 0 : _h.pendingApprovals) != null ? _i : 0]
        },
        {
          label: "Month Orders",
          value: String((_j = s.value.total) != null ? _j : 0),
          sub: `${(_k = s.value.delivered) != null ? _k : 0} delivered \xB7 ${(_l = s.value.in_production) != null ? _l : 0} in production`,
          trend: `${(_m = s.value.cancelled) != null ? _m : 0} cancelled`,
          up: true,
          valueColor: "text-orange-400",
          spark: orderCountSpark.value.length ? orderCountSpark.value : [0]
        },
        {
          label: "Month Expenses",
          value: fmtLakh(ex.value.total_amount),
          sub: `${(_n = ex.value.pending_count) != null ? _n : 0} pending approval`,
          trend: `${(_o = ex.value.total) != null ? _o : 0} vouchers`,
          up: false,
          valueColor: "text-teal-400",
          spark: [0, 0, 0, 0, 0, 0, Number((_p = ex.value.total_amount) != null ? _p : 0) / 1e5]
        }
      ];
    });
    const chartSvgData = computed(() => {
      var _a;
      const rows = (_a = monthlyRevenueData.value) != null ? _a : [];
      if (rows.length < 2) return { area: "", line: "", points: [] };
      const values = rows.map((r) => Number(r.revenue));
      const max = Math.max(...values, 1);
      const W = 600, H = 160;
      const pts = rows.map((_, i) => ({
        x: Math.round(i / (rows.length - 1) * W),
        y: Math.round(H - values[i] / max * (H - 24) + 8)
      }));
      const lineD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
      const areaD = `${lineD} L${W},${H} L0,${H} Z`;
      return { area: areaD, line: lineD, points: pts };
    });
    const chartLabels = computed(
      () => {
        var _a;
        return ((_a = monthlyRevenueData.value) != null ? _a : []).map((r) => r.month);
      }
    );
    const pendingOrdersList = computed(() => {
      var _a, _b;
      return (_b = (_a = statsData.value) == null ? void 0 : _a.pendingOrdersList) != null ? _b : [];
    });
    const warRoom = ref(false);
    const warRoomTime = ref("");
    const warRoomPipeline = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g;
      return [
        { label: "Pending", count: (_a = s.value.pending_approval) != null ? _a : 0, color: "#eab308" },
        { label: "Escalated", count: (_b = s.value.escalated) != null ? _b : 0, color: "#f97316" },
        { label: "Approved", count: (_c = s.value.approved) != null ? _c : 0, color: "#10b981" },
        { label: "Production", count: (_d = s.value.in_production) != null ? _d : 0, color: "#3b82f6" },
        { label: "Ready", count: (_e = s.value.ready_to_ship) != null ? _e : 0, color: "#06b6d4" },
        { label: "Dispatched", count: (_f = s.value.dispatched) != null ? _f : 0, color: "#f97316" },
        { label: "Delivered", count: (_g = s.value.delivered) != null ? _g : 0, color: "#14b8a6" }
      ];
    });
    const hasDraft = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_UiBackButton = _sfc_main$5;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiSparkline = _sfc_main$4;
      const _component_MiniStatCard = _sfc_main$3;
      const _component_ActivityItem = _sfc_main$2;
      const _component_PendingRow = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6 animate-fade-in" }, _attrs))} data-v-83d52554>`);
      if (unref(hasDraft) && unref(perms).canAccessModule("credit_sales")) {
        _push(`<div class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.08)", "border": "1px solid rgba(245,158,11,0.2)" })}" data-v-83d52554><svg class="w-4 h-4 text-gold-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-83d52554><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6H9v-2l6-6z" data-v-83d52554></path></svg><span class="text-gold-300 text-xs flex-1" data-v-83d52554>You have an unsaved order draft \u2014 restore it before it expires.</span><button class="text-xs font-semibold text-gold-400 hover:text-gold-300 underline underline-offset-2" data-v-83d52554>Restore</button><button class="text-gray-600 hover:text-gray-400 ml-1" data-v-83d52554>\u2715</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center justify-between" data-v-83d52554><div class="flex items-start gap-3" data-v-83d52554>`);
      _push(ssrRenderComponent(_component_UiBackButton, null, null, _parent));
      _push(`<div data-v-83d52554><h1 class="font-display font-bold text-2xl text-white tracking-tight" data-v-83d52554> Good ${ssrInterpolate(unref(greeting))}, <span class="text-gradient-gold" data-v-83d52554>${ssrInterpolate(((_a = unref(sessionUser)) == null ? void 0 : _a.name) || "User")}</span> \u{1F44B} </h1><p class="text-sm text-gray-500 mt-0.5" data-v-83d52554>${ssrInterpolate(unref(formattedDate))} \xB7 Here&#39;s what&#39;s happening today</p></div></div><div class="flex items-center gap-2" data-v-83d52554><button class="btn-ghost text-xs" data-v-83d52554><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-83d52554><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" data-v-83d52554></path></svg> Export </button><button class="btn-ghost text-xs" title="War Room mode (F)" data-v-83d52554><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-83d52554>`);
      if (!unref(warRoom)) {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" data-v-83d52554></path>`);
      } else {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" d="M9 9V4H4v5h5zm6 0h5V4h-5v5zM9 15H4v5h5v-5zm6 0v5h5v-5h-5z" data-v-83d52554></path>`);
      }
      _push(`</svg> ${ssrInterpolate(unref(warRoom) ? "Exit" : "War Room")}</button>`);
      if (unref(perms).canAccessModule("credit_sales")) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/credit-sales/create",
          class: "btn-gold text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-83d52554${_scopeId}><circle cx="12" cy="12" r="10" data-v-83d52554${_scopeId}></circle><line x1="12" y1="8" x2="12" y2="16" data-v-83d52554${_scopeId}></line><line x1="8" y1="12" x2="16" y2="12" data-v-83d52554${_scopeId}></line></svg> New Order `);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  class: "w-3.5 h-3.5",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2.5",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("circle", {
                    cx: "12",
                    cy: "12",
                    r: "10"
                  }),
                  createVNode("line", {
                    x1: "12",
                    y1: "8",
                    x2: "12",
                    y2: "16"
                  }),
                  createVNode("line", {
                    x1: "8",
                    y1: "12",
                    x2: "16",
                    y2: "12"
                  })
                ])),
                createTextVNode(" New Order ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2, _c2, _d2;
        if (unref(warRoom)) {
          _push2(`<div class="fixed inset-0 z-[200] flex flex-col p-6 gap-5 overflow-auto" style="${ssrRenderStyle({ "background": "rgba(6,5,3,0.98)" })}" data-v-83d52554><div class="flex items-center justify-between" data-v-83d52554><div data-v-83d52554><h1 class="font-display font-bold text-3xl text-white" data-v-83d52554>Ujjal FMC \u2014 War Room</h1><p class="text-sm text-gray-500 mt-1" data-v-83d52554>${ssrInterpolate(unref(formattedDate))} \xB7 ${ssrInterpolate(unref(warRoomTime))}</p></div><button class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.08] transition-all border border-white/[0.08]" data-v-83d52554><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-83d52554><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" data-v-83d52554></path></svg></button></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-83d52554><!--[-->`);
          ssrRenderList(unref(kpiCards), (kpi) => {
            _push2(`<div class="rounded-2xl p-6 flex flex-col gap-3" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.04)", "border": "1px solid rgba(255,255,255,0.08)" })}" data-v-83d52554><p class="text-sm text-gray-500 uppercase tracking-widest font-semibold" data-v-83d52554>${ssrInterpolate(kpi.label)}</p><p class="${ssrRenderClass([kpi.valueColor, "text-4xl font-bold tracking-tight"])}" data-v-83d52554>${ssrInterpolate(kpi.value)}</p><div class="flex items-center justify-between" data-v-83d52554><span class="text-sm text-gray-400" data-v-83d52554>${ssrInterpolate(kpi.sub)}</span>`);
            _push2(ssrRenderComponent(_component_UiSparkline, {
              values: kpi.spark,
              color: kpi.up ? "#10b981" : "#f87171",
              type: "line",
              width: 100,
              height: 36
            }, null, _parent));
            _push2(`</div></div>`);
          });
          _push2(`<!--]--></div><div class="grid grid-cols-3 lg:grid-cols-6 gap-3" data-v-83d52554><!--[-->`);
          ssrRenderList(unref(warRoomPipeline), (col) => {
            _push2(`<div class="rounded-xl p-4 text-center" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.07)" })}" data-v-83d52554><div class="w-3 h-3 rounded-full mx-auto mb-2" style="${ssrRenderStyle(`background:${col.color}`)}" data-v-83d52554></div><p class="text-3xl font-bold text-white mb-1" data-v-83d52554>${ssrInterpolate(col.count)}</p><p class="text-xs text-gray-500 uppercase tracking-wider font-semibold" data-v-83d52554>${ssrInterpolate(col.label)}</p></div>`);
          });
          _push2(`<!--]--></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-4" data-v-83d52554><div class="rounded-2xl p-5 flex flex-col gap-3" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.07)" })}" data-v-83d52554><p class="text-xs text-gray-500 uppercase tracking-widest font-semibold" data-v-83d52554>Monthly Revenue</p><p class="text-3xl font-bold text-gold-400" data-v-83d52554>${ssrInterpolate(fmtLakh(unref(rv).total_revenue))}</p><div class="flex justify-between text-sm" data-v-83d52554><span class="text-gray-500" data-v-83d52554>Collected</span><span class="text-emerald-400 font-bold" data-v-83d52554>${ssrInterpolate(fmtLakh(unref(rv).total_collected))}</span></div><div class="flex justify-between text-sm" data-v-83d52554><span class="text-gray-500" data-v-83d52554>Outstanding</span><span class="text-amber-400 font-bold" data-v-83d52554>${ssrInterpolate(fmtLakh(unref(rv).total_outstanding))}</span></div></div><div class="rounded-2xl p-5 flex flex-col gap-3" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.07)" })}" data-v-83d52554><p class="text-xs text-gray-500 uppercase tracking-widest font-semibold" data-v-83d52554>Expenses</p><p class="text-3xl font-bold text-teal-400" data-v-83d52554>${ssrInterpolate(fmtLakh(unref(ex).total_amount))}</p><div class="flex justify-between text-sm" data-v-83d52554><span class="text-gray-500" data-v-83d52554>Vouchers</span><span class="text-gray-300 font-bold" data-v-83d52554>${ssrInterpolate((_a2 = unref(ex).total) != null ? _a2 : 0)}</span></div><div class="flex justify-between text-sm" data-v-83d52554><span class="text-gray-500" data-v-83d52554>Pending</span><span class="text-amber-400 font-bold" data-v-83d52554>${ssrInterpolate((_b2 = unref(ex).pending_count) != null ? _b2 : 0)}</span></div></div><div class="rounded-2xl p-5 flex flex-col gap-3" style="${ssrRenderStyle({ "background": "rgba(255,255,255,0.03)", "border": "1px solid rgba(255,255,255,0.07)" })}" data-v-83d52554><p class="text-xs text-gray-500 uppercase tracking-widest font-semibold" data-v-83d52554>Purchases</p><p class="text-3xl font-bold text-blue-400" data-v-83d52554>${ssrInterpolate(fmtLakh(unref(po).total_value))}</p><div class="flex justify-between text-sm" data-v-83d52554><span class="text-gray-500" data-v-83d52554>Purchase Orders</span><span class="text-gray-300 font-bold" data-v-83d52554>${ssrInterpolate((_c2 = unref(po).total_pos) != null ? _c2 : 0)}</span></div><div class="flex justify-between text-sm" data-v-83d52554><span class="text-gray-500" data-v-83d52554>Credit Orders</span><span class="text-gray-300 font-bold" data-v-83d52554>${ssrInterpolate((_d2 = unref(s).total) != null ? _d2 : 0)}</span></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-83d52554><!--[-->`);
      ssrRenderList(unref(kpiCards), (kpi) => {
        _push(`<div class="glass-card p-4 flex flex-col gap-2 hover:border-white/[0.1] transition-all duration-200 cursor-default group" data-v-83d52554><div class="flex items-center justify-between" data-v-83d52554><p class="text-xs text-gray-500" data-v-83d52554>${ssrInterpolate(kpi.label)}</p><span class="${ssrRenderClass([kpi.up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400", "text-[10px] font-semibold px-1.5 py-0.5 rounded-full"])}" data-v-83d52554>${ssrInterpolate(kpi.trend)}</span></div><p class="${ssrRenderClass([kpi.valueColor, "text-2xl font-bold leading-none"])}" data-v-83d52554>${ssrInterpolate(kpi.value)}</p><div class="flex items-end justify-between gap-2" data-v-83d52554><p class="text-[11px] text-gray-600 leading-tight" data-v-83d52554>${ssrInterpolate(kpi.sub)}</p>`);
        _push(ssrRenderComponent(_component_UiSparkline, {
          values: kpi.spark,
          color: kpi.up ? "#10b981" : "#f87171",
          type: "line",
          width: 72,
          height: 24,
          class: "shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
        }, null, _parent));
        _push(`</div></div>`);
      });
      _push(`<!--]--></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4" data-v-83d52554>`);
      _push(ssrRenderComponent(_component_MiniStatCard, {
        label: "Credit Orders",
        value: (_b = unref(s).total) != null ? _b : 0,
        delta: `${(_c = unref(s).delivered) != null ? _c : 0} delivered`,
        icon: "sales"
      }, null, _parent));
      _push(ssrRenderComponent(_component_MiniStatCard, {
        label: "Purchase Orders",
        value: (_d = unref(po).total_pos) != null ? _d : 0,
        delta: `${fmtLakh(unref(po).total_value)} value`,
        icon: "cart"
      }, null, _parent));
      _push(ssrRenderComponent(_component_MiniStatCard, {
        label: "Expense Vouchers",
        value: (_e = unref(ex).total) != null ? _e : 0,
        delta: `${(_f = unref(ex).pending_count) != null ? _f : 0} pending`,
        positive: false,
        icon: "receipt"
      }, null, _parent));
      _push(ssrRenderComponent(_component_MiniStatCard, {
        label: "Outstanding",
        value: fmtLakh(unref(rv).total_outstanding),
        delta: "this month",
        icon: "money"
      }, null, _parent));
      _push(`</div>`);
      if (unref(isAdminOrAccounts) && unref(radarTiles).length) {
        _push(`<div class="glass-card p-5" data-v-83d52554><div class="flex items-center justify-between mb-4" data-v-83d52554><h3 class="section-title flex items-center gap-2" data-v-83d52554><span data-v-83d52554>\u{1F3AF}</span> Exception Radar </h3>`);
        if (unref(radarTotal) > 0) {
          _push(`<span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25" data-v-83d52554>${ssrInterpolate(unref(radarTotal))} need attention </span>`);
        } else {
          _push(`<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400" data-v-83d52554> \u2713 All clear </span>`);
        }
        _push(`</div><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" data-v-83d52554><!--[-->`);
        ssrRenderList(unref(radarTiles), (t) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: t.key,
            to: t.route,
            class: ["rounded-xl border p-3.5 flex flex-col gap-1.5 transition-all duration-150 hover:border-white/[0.16]", t.count > 0 ? "border-amber-500/20 bg-amber-500/[0.04]" : "border-white/[0.06] bg-white/[0.015]"]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="flex items-center justify-between" data-v-83d52554${_scopeId}><span class="text-base" data-v-83d52554${_scopeId}>${ssrInterpolate(t.icon)}</span><span class="${ssrRenderClass([t.count > 0 ? "text-amber-400" : "text-gray-600", "text-xl font-bold"])}" data-v-83d52554${_scopeId}>${ssrInterpolate(t.count)}</span></div><p class="text-[11px] text-gray-500 leading-tight" data-v-83d52554${_scopeId}>${ssrInterpolate(t.label)}</p>`);
              } else {
                return [
                  createVNode("div", { class: "flex items-center justify-between" }, [
                    createVNode("span", { class: "text-base" }, toDisplayString(t.icon), 1),
                    createVNode("span", {
                      class: ["text-xl font-bold", t.count > 0 ? "text-amber-400" : "text-gray-600"]
                    }, toDisplayString(t.count), 3)
                  ]),
                  createVNode("p", { class: "text-[11px] text-gray-500 leading-tight" }, toDisplayString(t.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-83d52554><div class="lg:col-span-2 glass-card p-5" data-v-83d52554><div class="flex items-center justify-between mb-5" data-v-83d52554><div data-v-83d52554><h2 class="section-title" data-v-83d52554>Revenue Overview</h2><p class="text-xs text-gray-500 mt-0.5" data-v-83d52554>Monthly sales performance \u2014 BDT</p></div><div class="flex items-center gap-1" data-v-83d52554><!--[-->`);
      ssrRenderList(["7D", "1M", "3M", "YTD"], (p) => {
        _push(`<button class="${ssrRenderClass([
          "px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150",
          unref(chartPeriod) === p ? "bg-gold-500/15 text-gold-400 border border-gold-500/25" : "text-gray-600 hover:text-gray-300 hover:bg-white/[0.05]"
        ])}" data-v-83d52554>${ssrInterpolate(p)}</button>`);
      });
      _push(`<!--]--></div></div><div class="relative h-48" data-v-83d52554>`);
      if (unref(chartSvgData).points.length >= 2) {
        _push(`<svg viewBox="0 0 600 180" class="w-full h-full" preserveAspectRatio="none" data-v-83d52554><defs data-v-83d52554><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1" data-v-83d52554><stop offset="0%" stop-color="#f59e0b" stop-opacity="0.25" data-v-83d52554></stop><stop offset="100%" stop-color="#f59e0b" stop-opacity="0" data-v-83d52554></stop></linearGradient></defs><!--[-->`);
        ssrRenderList([36, 72, 108, 144], (y) => {
          _push(`<line${ssrRenderAttr("x1", 0)}${ssrRenderAttr("y1", y)} x2="600"${ssrRenderAttr("y2", y)} stroke="rgba(255,255,255,0.04)" stroke-width="1" data-v-83d52554></line>`);
        });
        _push(`<!--]--><path${ssrRenderAttr("d", unref(chartSvgData).area)} fill="url(#areaGradient)" data-v-83d52554></path><path${ssrRenderAttr("d", unref(chartSvgData).line)} fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-83d52554></path><!--[-->`);
        ssrRenderList(unref(chartSvgData).points, (pt) => {
          _push(`<circle${ssrRenderAttr("cx", pt.x)}${ssrRenderAttr("cy", pt.y)} r="3.5" fill="#f59e0b" stroke="#0a0a0a" stroke-width="2" data-v-83d52554></circle>`);
        });
        _push(`<!--]--></svg>`);
      } else {
        _push(`<div class="w-full h-full flex items-center justify-center" data-v-83d52554><p class="text-xs text-gray-600" data-v-83d52554>No revenue data for this period yet</p></div>`);
      }
      if (unref(chartLabels).length) {
        _push(`<div class="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-600 px-1" data-v-83d52554><!--[-->`);
        ssrRenderList(unref(chartLabels), (l) => {
          _push(`<span data-v-83d52554>${ssrInterpolate(l)}</span>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="glass-card p-5 flex flex-col" data-v-83d52554><div class="flex items-center justify-between mb-4" data-v-83d52554><h2 class="section-title" data-v-83d52554>Live Activity</h2><span class="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400" data-v-83d52554><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" data-v-83d52554></span> Live </span></div><div class="flex-1 space-y-3 overflow-y-auto no-scrollbar" data-v-83d52554><!--[-->`);
      ssrRenderList(unref(activityFeed), (item) => {
        _push(ssrRenderComponent(_component_ActivityItem, {
          key: item.id,
          icon: item.icon,
          label: item.label,
          time: item.time,
          type: item.type
        }, null, _parent));
      });
      _push(`<!--]-->`);
      if (!unref(activityFeed).length) {
        _push(`<div class="flex flex-col items-center justify-center h-full py-10 gap-2 text-center" data-v-83d52554><svg class="w-9 h-9 text-gray-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" data-v-83d52554><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" data-v-83d52554></path></svg><p class="text-xs text-gray-600" data-v-83d52554>No recent activity</p><p class="text-[11px] text-gray-700" data-v-83d52554>Events appear here as the team works</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6" data-v-83d52554><div class="glass-card p-5" data-v-83d52554><div class="flex items-center justify-between mb-4" data-v-83d52554><h2 class="section-title" data-v-83d52554>Pending Approvals</h2>`);
      if (unref(perms).canAccessModule("credit_sales")) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/credit-sales/approve",
          class: "text-xs text-gold-500 hover:text-gold-400 font-medium transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` View all \u2192 `);
            } else {
              return [
                createTextVNode(" View all \u2192 ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-2" data-v-83d52554><!--[-->`);
      ssrRenderList(unref(pendingOrdersList), (row) => {
        _push(ssrRenderComponent(_component_PendingRow, {
          key: row.id,
          "order-no": row.order_number,
          customer: row.customer_name,
          amount: Number(row.total_amount),
          status: row.status
        }, null, _parent));
      });
      _push(`<!--]-->`);
      if (!unref(pendingOrdersList).length) {
        _push(`<p class="text-xs text-gray-600 text-center py-4" data-v-83d52554>No pending approvals \u2713</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="glass-card p-5" data-v-83d52554><div class="flex items-center justify-between mb-4" data-v-83d52554><h2 class="section-title" data-v-83d52554>Collection Summary</h2><span class="text-xs text-gray-500" data-v-83d52554>This Month</span></div><div class="space-y-3" data-v-83d52554><div class="flex justify-between items-center py-2.5 border-b border-white/[0.05]" data-v-83d52554><div class="flex items-center gap-2" data-v-83d52554><div class="w-2 h-2 rounded-full bg-gold-400" data-v-83d52554></div><span class="text-xs text-gray-400" data-v-83d52554>Total Billed</span></div><span class="text-sm font-bold text-gold-400" data-v-83d52554>${ssrInterpolate(fmtLakh(unref(rv).total_revenue))}</span></div><div class="flex justify-between items-center py-2.5 border-b border-white/[0.05]" data-v-83d52554><div class="flex items-center gap-2" data-v-83d52554><div class="w-2 h-2 rounded-full bg-emerald-400" data-v-83d52554></div><span class="text-xs text-gray-400" data-v-83d52554>Collected</span></div><span class="text-sm font-bold text-emerald-400" data-v-83d52554>${ssrInterpolate(fmtLakh(unref(rv).total_collected))}</span></div><div class="flex justify-between items-center py-2.5 border-b border-white/[0.05]" data-v-83d52554><div class="flex items-center gap-2" data-v-83d52554><div class="w-2 h-2 rounded-full bg-amber-400" data-v-83d52554></div><span class="text-xs text-gray-400" data-v-83d52554>Outstanding</span></div><span class="text-sm font-bold text-amber-400" data-v-83d52554>${ssrInterpolate(fmtLakh(unref(rv).total_outstanding))}</span></div><div class="pt-1" data-v-83d52554><div class="flex justify-between text-[11px] text-gray-600 mb-2" data-v-83d52554><span data-v-83d52554>Collection Rate</span><span class="font-medium text-gray-400" data-v-83d52554>${ssrInterpolate(unref(collectionRate))}%</span></div><div class="h-2 bg-white/[0.05] rounded-full overflow-hidden" data-v-83d52554><div class="h-full rounded-full transition-all duration-700" style="${ssrRenderStyle(`width: ${unref(collectionRate)}%; background: linear-gradient(90deg, #f59e0b, #10b981)`)}" data-v-83d52554></div></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dashboard/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-83d52554"]]);

export { index as default };
//# sourceMappingURL=index-Dgb5wCQX.mjs.map
