import { _ as _sfc_main$1 } from './HubTabs-B7UBGuJv.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { _ as _sfc_main$2 } from './CrmComposer-CvTvqJYr.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-AUChU-3l.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import './usePermissions-CG_SWEjg.mjs';
import './permRoutes-DvaKf2tr.mjs';
import './useToast-Mxh_qoqg.mjs';
import '@vue/shared';
import 'perfect-debounce';

const W = 640, H = 170, bw = 28;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "insights",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const TABS = [{ k: "reorder", l: "\u{1F501} Reorder radar" }, { k: "cross", l: "\u2795 Cross-sell" }, { k: "forecast", l: "\u{1F4C8} Forecast" }];
    const STATUSES = [{ k: "lapsing", l: "Going quiet", c: "text-red-400", b: "bg-red-500/15 text-red-300" }, { k: "late", l: "Late", c: "text-orange-400", b: "bg-orange-500/15 text-orange-300" }, { k: "due", l: "Due now", c: "text-amber-400", b: "bg-amber-500/15 text-amber-300" }, { k: "due_soon", l: "Due soon", c: "text-blue-400", b: "bg-blue-500/15 text-blue-300" }, { k: "on_track", l: "On track", c: "text-emerald-400", b: "bg-emerald-500/15 text-emerald-300" }];
    const tab = ref("reorder"), status = ref(""), cm = ref(null);
    const { data: re, pending: rp } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/reorder",
      { lazy: true },
      "$AWSL1OmDQ4"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: cs, pending: cp } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/cross-sell",
      { lazy: true },
      "$5MqD_J4hI2"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: fc, pending: fp } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/forecast",
      { lazy: true },
      "$lSseerFgIA"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return ((_b = (_a = re.value) == null ? void 0 : _a.rows) != null ? _b : []).filter((r) => !status.value || r.status === status.value);
    });
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const money = (v) => "\u09F3" + (v >= 1e7 ? (v / 1e7).toFixed(2) + " cr" : v >= 1e5 ? (v / 1e5).toFixed(1) + " lakh" : n0(v));
    const bars = computed(() => {
      if (!fc.value) return [];
      const all = [...fc.value.months.map((m) => ({ ...m, fc: false })), ...fc.value.next.map((m) => ({ month: m.month, value: m.expected, low: m.low, high: m.high, fc: true }))];
      const max = Math.max(1, ...all.map((m) => {
        var _a;
        return (_a = m.high) != null ? _a : m.value;
      })), step = (W - 10) / all.length;
      const y = (v) => H - v / max * (H - 18);
      return all.map((m, i) => {
        var _a, _b;
        return { ...m, x: 5 + i * step + (step - bw) / 2, y: y(m.value), h: Math.max(1, H - y(m.value)), yHigh: y((_a = m.high) != null ? _a : m.value), yLow: y((_b = m.low) != null ? _b : m.value), label: m.value >= 1e6 ? (m.value / 1e6).toFixed(0) + "M" : "" };
      });
    });
    const fcTiles = computed(() => {
      const f = fc.value;
      if (!f) return [];
      const n = f.next[0];
      return [
        { l: "This month so far", v: money(f.this_month.so_far), s: `day ${f.this_month.days_in} of ${f.this_month.days_total}` },
        { l: "On pace for", v: money(f.this_month.pace), s: "if the rest of the month matches the average so far" },
        { l: "Next month (forecast)", v: money(n.expected), s: `likely ${money(n.low)} \u2013 ${money(n.high)}` },
        { l: "Orders due in 30 days", v: money(f.orders_expected_30d.value), s: `${f.orders_expected_30d.count} regular customers` }
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HubTabs = _sfc_main$1;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      const _component_CrmComposer = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "CRM \u2014 Insights",
        subtitle: "Who is due to reorder, what else to sell them, and where sales are heading",
        breadcrumb: ["CRM", "Insights"]
      }, null, _parent));
      _push(`<div class="flex gap-2"><!--[-->`);
      ssrRenderList(TABS, (t) => {
        _push(`<button class="${ssrRenderClass([unref(tab) === t.k ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07]", "px-3 py-1.5 rounded-xl text-xs border transition-all"])}">${ssrInterpolate(t.l)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(tab) === "reorder") {
        _push(`<!--[-->`);
        if (unref(rp)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
        } else if (unref(re)) {
          _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-5 gap-3"><!--[-->`);
          ssrRenderList(STATUSES, (s) => {
            var _a;
            _push(`<button class="${ssrRenderClass([unref(status) === s.k ? "ring-1 ring-gold-500/40" : "", "glass-card p-3 text-left"])}"><p class="text-[10px] uppercase tracking-wider text-gray-500">${ssrInterpolate(s.l)}</p><p class="${ssrRenderClass([s.c, "text-xl font-bold"])}">${ssrInterpolate((_a = unref(re).counts[s.k]) != null ? _a : 0)}</p></button>`);
          });
          _push(`<!--]--></div><p class="text-xs text-gray-400">Based on each customer&#39;s own rhythm: the usual gap is the median days between their recent orders (at least 4 orders needed, never shorter than a week). \u201CSlipping %\u201D compares the silence so far with how much that customer&#39;s gaps normally vary \u2014 it is a rule of thumb, not a certainty. <b class="text-amber-300">${ssrInterpolate(money(unref(re).at_risk_value))}</b> of yearly sales sits with customers at 50%+.</p><div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">Customer</th><th class="px-3 py-2 text-left">Status</th><th class="px-3 py-2 text-right">Usual gap</th><th class="px-3 py-2 text-right">Silent</th><th class="px-3 py-2 text-left">Expected</th><th class="px-3 py-2 text-right">Typical order</th><th class="px-3 py-2 text-right">Slipping</th><th class="px-3 py-2 text-right">Yearly sales at risk</th><th></th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(rows), (r) => {
            var _a, _b;
            _push(`<tr class="border-b border-white/[0.04]"><td class="px-3 py-2">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/crm/customers/${r.id}`,
              class: "text-gold-400 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(r.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(r.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<div class="text-[10px] text-gray-600">${ssrInterpolate(r.segment)} \xB7 ${ssrInterpolate(r.district)}</div></td><td class="px-3 py-2"><span class="${ssrRenderClass([(_a = STATUSES.find((s) => s.k === r.status)) == null ? void 0 : _a.b, "px-2 py-0.5 rounded-full text-[10px]"])}">${ssrInterpolate((_b = STATUSES.find((s) => s.k === r.status)) == null ? void 0 : _b.l)}</span></td><td class="px-3 py-2 text-right">${ssrInterpolate(r.usual_gap)} d${ssrInterpolate(r.regular ? "" : " ~")}</td><td class="px-3 py-2 text-right">${ssrInterpolate(r.days_since)} d</td><td class="px-3 py-2 text-gray-400">${ssrInterpolate(r.expected_date)} <span class="text-gray-600">(${ssrInterpolate(r.days_to_expected >= 0 ? "in " + r.days_to_expected : -r.days_to_expected + " late")} d)</span></td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n0(r.avg_order))}</td><td class="${ssrRenderClass([r.churn_pct >= 60 ? "text-red-400" : r.churn_pct >= 30 ? "text-amber-300" : "text-gray-400", "px-3 py-2 text-right font-mono"])}">${ssrInterpolate(r.churn_pct)}%</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n0(r.value_at_risk))}</td><td class="px-3 py-2 text-right"><button class="btn-ghost text-[11px] px-2 py-0.5">Message</button></td></tr>`);
          });
          _push(`<!--]--></tbody></table>`);
          if (!unref(rows).length) {
            _push(`<p class="p-4 text-xs text-gray-600">No customers in this group.</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "cross") {
        _push(`<!--[-->`);
        if (unref(cp)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
        } else if (unref(cs)) {
          _push(`<!--[--><p class="text-xs text-gray-400">For each business type, products that at least a quarter of its customers buy. Customers of that type who buy none of it are the opportunity; the value is what their peers spend on it, scaled to the customer&#39;s size.</p><div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">Product</th><th class="px-3 py-2 text-left">Business type</th><th class="px-3 py-2 text-right">Peers buying</th><th class="px-3 py-2 text-right">Customers missing it</th><th class="px-3 py-2 text-right">Potential a month</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(cs).gaps, (g) => {
            _push(`<tr class="border-b border-white/[0.04]"><td class="px-3 py-2 text-gray-200">${ssrInterpolate(g.product)}</td><td class="px-3 py-2 text-gray-400">${ssrInterpolate(g.segment)}</td><td class="px-3 py-2 text-right">${ssrInterpolate(g.peers_buying_pct)}%</td><td class="px-3 py-2 text-right">${ssrInterpolate(g.customers_missing)}</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n0(g.est_monthly_total))}</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div><h2 class="text-sm font-bold text-gray-200">Best individual offers <span class="text-gray-600 font-normal">(${ssrInterpolate(unref(cs).total)} in all)</span></h2><div class="glass-card overflow-x-auto"><table class="w-full text-xs"><tbody><!--[-->`);
          ssrRenderList(unref(cs).suggestions.slice(0, 40), (s) => {
            _push(`<tr class="border-b border-white/[0.04]"><td class="px-3 py-2">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/crm/customers/${s.customer_id}`,
              class: "text-gold-400 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(s.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(s.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<div class="text-[10px] text-gray-600">${ssrInterpolate(s.segment)} \xB7 ${ssrInterpolate(s.district)}</div></td><td class="px-3 py-2 text-gray-200">${ssrInterpolate(s.product)}</td><td class="px-3 py-2 text-gray-500">${ssrInterpolate(s.peers_buying_pct)}% of ${ssrInterpolate(s.peers)} peers buy it</td><td class="px-3 py-2 text-right font-mono">\u2248 \u09F3${ssrInterpolate(n0(s.est_monthly))} / month</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "forecast") {
        _push(`<!--[-->`);
        if (unref(fp)) {
          _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
        } else if (unref(fc)) {
          _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"><!--[-->`);
          ssrRenderList(unref(fcTiles), (k) => {
            _push(`<div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">${ssrInterpolate(k.l)}</p><p class="text-lg font-bold font-mono text-gray-100">${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(k.s)}</p></div>`);
          });
          _push(`<!--]--></div><div class="glass-card p-4"><svg${ssrRenderAttr("viewBox", `0 0 ${W} ${H + 22}`)} class="w-full" role="img" aria-label="Monthly sales and forecast"><!--[-->`);
          ssrRenderList(unref(bars), (b, i) => {
            _push(`<g><rect${ssrRenderAttr("x", b.x)}${ssrRenderAttr("y", b.y)}${ssrRenderAttr("width", bw)}${ssrRenderAttr("height", b.h)}${ssrRenderAttr("fill", b.fc ? "rgb(var(--accent) / .35)" : b.partial ? "rgb(var(--accent) / .5)" : "rgb(var(--accent))")} rx="3"></rect>`);
            if (b.fc) {
              _push(`<line${ssrRenderAttr("x1", b.x + bw / 2)}${ssrRenderAttr("x2", b.x + bw / 2)}${ssrRenderAttr("y1", b.yHigh)}${ssrRenderAttr("y2", b.yLow)} stroke="currentColor" stroke-width="1.5" class="text-gray-400"></line>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<text${ssrRenderAttr("x", b.x + bw / 2)}${ssrRenderAttr("y", H + 14)} text-anchor="middle" font-size="9" class="fill-gray-500">${ssrInterpolate(b.month.slice(2))}</text><text${ssrRenderAttr("x", b.x + bw / 2)}${ssrRenderAttr("y", b.y - 4)} text-anchor="middle" font-size="9" class="fill-gray-300">${ssrInterpolate(b.label)}</text></g>`);
          });
          _push(`<!--]--></svg><p class="text-[11px] text-gray-500">Solid bars = recorded sales (the latest month is still in progress). Faded bars with a line = forecast and its likely range. Method: ${ssrInterpolate(unref(fc).method)}. When the same method is run on past months it missed by about \xB1${ssrInterpolate(unref(fc).error_pct)}%`);
          if (unref(fc).thin_history) {
            _push(`<!--[--> \u2014 there are only ${ssrInterpolate(unref(fc).backtest_months)} months of history to check against, so treat the range as rough and it will tighten as months pass<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`. History starts ${ssrInterpolate(unref(fc).history_from)}.</p></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card p-4 space-y-1"><h2 class="section-title">By business type (next month)</h2><!--[-->`);
          ssrRenderList(unref(fc).by_segment, (s) => {
            _push(`<div class="flex text-xs py-1 border-b border-white/[0.04]"><span class="flex-1 text-gray-300">${ssrInterpolate(s.segment)}</span><span class="text-gray-500 w-12 text-right">${ssrInterpolate(s.share)}%</span><span class="font-mono w-28 text-right">${ssrInterpolate(n0(s.expected_next_month))}</span></div>`);
          });
          _push(`<!--]--></div><div class="glass-card p-4 space-y-1"><h2 class="section-title">Orders expected in the next 30 days <span class="text-gray-600 font-normal">(${ssrInterpolate(unref(fc).orders_expected_30d.count)} customers \xB7 \u09F3${ssrInterpolate(n0(unref(fc).orders_expected_30d.value))})</span></h2><div class="max-h-72 overflow-y-auto"><!--[-->`);
          ssrRenderList(unref(fc).orders_expected_30d.customers, (c) => {
            _push(`<div class="flex text-xs py-1 border-b border-white/[0.04]">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/crm/customers/${c.id}`,
              class: "flex-1 text-gold-400 hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(c.name)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(c.name), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="text-gray-500 w-24">${ssrInterpolate(c.expected_date)}</span><span class="font-mono w-24 text-right">${ssrInterpolate(n0(c.avg_order))}</span></div>`);
          });
          _push(`<!--]--></div></div></div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (unref(cm)) {
        _push(ssrRenderComponent(_component_CrmComposer, {
          open: !!unref(cm),
          "party-type": "customer",
          "party-id": unref(cm).party_id,
          name: unref(cm).name,
          phone: unref(cm).phone,
          kind: unref(cm).kind,
          onClose: ($event) => cm.value = null
        }, null, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/insights.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=insights-VzBCeOa3.mjs.map
