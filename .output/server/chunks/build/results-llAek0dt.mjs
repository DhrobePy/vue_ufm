import { _ as _sfc_main$1 } from './HubTabs-B7UBGuJv.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "results",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: o, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/outcomes",
      { lazy: true },
      "$4foqjzYV1i"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const tiles = computed(() => {
      const x = o.value;
      if (!x) return [];
      return [
        { l: "Contacts that led to an order", v: x.contacts.order_rate != null ? x.contacts.order_rate + "%" : "\u2014", s: `${x.contacts.ordered_14d} of ${x.contacts.matured} within 14 days` },
        { l: "Contacts that led to a payment", v: x.contacts.pay_rate != null ? x.contacts.pay_rate + "%" : "\u2014", s: `${x.contacts.paid_14d} of ${x.contacts.matured}` },
        { l: "Promises kept", v: x.promises.kept_rate != null ? x.promises.kept_rate + "%" : "\u2014", s: `${x.promises.kept} of ${x.promises.due_checked} due` },
        { l: "Prospect win rate", v: x.prospects.win_rate != null ? x.prospects.win_rate + "%" : "\u2014", s: `${x.prospects.won} won, ${x.prospects.lost} lost` }
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_HubTabs = _sfc_main$1;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "CRM \u2014 Results",
        subtitle: "Are the calls, promises and prospect work paying off?",
        breadcrumb: ["CRM", "Results"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(o)) {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"><!--[-->`);
        ssrRenderList(unref(tiles), (k) => {
          _push(`<div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">${ssrInterpolate(k.l)}</p><p class="text-lg font-bold font-mono text-gray-100">${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(k.s)}</p></div>`);
        });
        _push(`<!--]--></div>`);
        if (!unref(o).contacts.total_180d) {
          _push(`<p class="glass-card p-4 text-xs text-amber-300/90">No calls, visits or messages have been logged yet, so there is nothing to measure. Each time someone contacts a customer and logs it (Log a contact, or Message on a customer card), this page starts counting how many ordered or paid within 14 days.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card p-4 space-y-1"><h2 class="section-title">Contacts \u2192 orders and payments <span class="text-gray-600 font-normal">(within 14 days, last 180 days)</span></h2><p class="text-[11px] text-gray-500">For comparison, ${ssrInterpolate((_a = unref(o).contacts.baseline_order_rate) != null ? _a : "\u2014")}% of all buying customers ordered in the last 14 days anyway \u2014 a contact is only worth credit for what it adds above that.</p><table class="w-full text-xs mt-2"><thead><tr class="text-[10px] uppercase text-gray-500"><th class="py-1 text-left">By channel</th><th class="text-right">Contacts</th><th class="text-right">Ordered</th><th class="text-right">Paid</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(o).contacts.by_channel, (g) => {
          var _a2, _b;
          _push(`<tr class="border-t border-white/[0.04]"><td class="py-1 text-gray-300">${ssrInterpolate(g.key)}</td><td class="text-right">${ssrInterpolate(g.contacts)}</td><td class="text-right">${ssrInterpolate((_a2 = g.order_rate) != null ? _a2 : "\u2014")}%</td><td class="text-right">${ssrInterpolate((_b = g.pay_rate) != null ? _b : "\u2014")}%</td></tr>`);
        });
        _push(`<!--]--></tbody></table><table class="w-full text-xs mt-3"><thead><tr class="text-[10px] uppercase text-gray-500"><th class="py-1 text-left">By state when contacted</th><th class="text-right">Contacts</th><th class="text-right">Ordered</th><th class="text-right">Paid</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(o).contacts.by_label, (g) => {
          var _a2, _b;
          _push(`<tr class="border-t border-white/[0.04]"><td class="py-1 text-gray-300">${ssrInterpolate(g.key)}</td><td class="text-right">${ssrInterpolate(g.contacts)}</td><td class="text-right">${ssrInterpolate((_a2 = g.order_rate) != null ? _a2 : "\u2014")}%</td><td class="text-right">${ssrInterpolate((_b = g.pay_rate) != null ? _b : "\u2014")}%</td></tr>`);
        });
        _push(`<!--]--></tbody></table><p class="text-[10px] text-gray-600">Only contacts at least 14 days old are counted, so every one has had the full 14 days.</p></div><div class="glass-card p-4 space-y-1"><h2 class="section-title">Promises to pay</h2><p class="text-xs text-gray-400">A promise counts as kept when at least 80% of the amount arrived by the promised date + 3 days.</p><!--[-->`);
        ssrRenderList(unref(o).promises.recent, (p) => {
          _push(`<div class="flex items-center gap-2 text-xs py-1 border-b border-white/[0.04]"><span class="${ssrRenderClass(p.kept ? "text-emerald-400" : "text-red-400")}">${ssrInterpolate(p.kept ? "\u2713" : "\u2717")}</span>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/crm/customers/${p.customer_id}`,
            class: "text-gold-400 hover:underline flex-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(p.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(p.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-gray-500">due ${ssrInterpolate(p.due)}</span><span class="font-mono">\u09F3${ssrInterpolate(n0(p.paid))} / ${ssrInterpolate(n0(p.amount))}</span></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(o).promises.recent.length) {
          _push(`<p class="text-xs text-gray-600">No promise has reached its due date yet. Log one with \u201Cpromised \u09F3\u201D on a customer card.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h2 class="section-title pt-3">Tasks</h2><p class="text-xs text-gray-300">${ssrInterpolate(unref(o).tasks.done)} done`);
        if (unref(o).tasks.on_time_rate != null) {
          _push(`<!--[--> (${ssrInterpolate(unref(o).tasks.on_time_rate)}% on time)<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(` \xB7 ${ssrInterpolate(unref(o).tasks.open)} open \xB7 <span class="${ssrRenderClass(unref(o).tasks.overdue ? "text-red-400" : "")}">${ssrInterpolate(unref(o).tasks.overdue)} overdue</span></p></div></div><div class="glass-card p-4 space-y-2"><h2 class="section-title">New customers (prospects)</h2><p class="text-xs text-gray-300">${ssrInterpolate(unref(o).prospects.total)} prospects \xB7 ${ssrInterpolate(unref(o).prospects.won)} won \xB7 ${ssrInterpolate(unref(o).prospects.lost)} lost`);
        if (unref(o).prospects.win_rate != null) {
          _push(`<!--[--> \xB7 win rate ${ssrInterpolate(unref(o).prospects.win_rate)}%<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        if (unref(o).prospects.median_days_to_first_order != null) {
          _push(`<!--[--> \xB7 typical ${ssrInterpolate(unref(o).prospects.median_days_to_first_order)} days from first listing to first order<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p>`);
        if (unref(o).prospects.avg_fit_won != null && unref(o).prospects.avg_fit_lost != null) {
          _push(`<p class="${ssrRenderClass([unref(o).prospects.avg_fit_won > unref(o).prospects.avg_fit_lost ? "text-emerald-400" : "text-amber-300", "text-xs"])}">Average fit score: won ${ssrInterpolate(unref(o).prospects.avg_fit_won)} vs lost ${ssrInterpolate(unref(o).prospects.avg_fit_lost)} \u2014 ${ssrInterpolate(unref(o).prospects.avg_fit_won > unref(o).prospects.avg_fit_lost ? "a higher score has gone with winning, as it should" : "the score is not separating winners yet; treat it with caution")}.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs"><div><p class="text-[10px] uppercase text-gray-500 mb-1">By source</p><!--[-->`);
        ssrRenderList(unref(o).prospects.by_source, (g) => {
          var _a2;
          _push(`<div class="flex border-t border-white/[0.04] py-1"><span class="flex-1 text-gray-300">${ssrInterpolate(g.key)}</span><span class="text-gray-500">${ssrInterpolate(g.n)} \xB7 ${ssrInterpolate((_a2 = g.win_rate) != null ? _a2 : "\u2014")}% won</span></div>`);
        });
        _push(`<!--]--></div><div><p class="text-[10px] uppercase text-gray-500 mb-1">By business type</p><!--[-->`);
        ssrRenderList(unref(o).prospects.by_segment, (g) => {
          var _a2;
          _push(`<div class="flex border-t border-white/[0.04] py-1"><span class="flex-1 text-gray-300">${ssrInterpolate(g.key)}</span><span class="text-gray-500">${ssrInterpolate(g.n)} \xB7 ${ssrInterpolate((_a2 = g.win_rate) != null ? _a2 : "\u2014")}% won</span></div>`);
        });
        _push(`<!--]--></div><div><p class="text-[10px] uppercase text-gray-500 mb-1">Why we lost</p><!--[-->`);
        ssrRenderList(unref(o).prospects.lost_reasons, (g) => {
          _push(`<div class="flex border-t border-white/[0.04] py-1"><span class="flex-1 text-gray-300">${ssrInterpolate(g.reason)}</span><span class="text-gray-500">${ssrInterpolate(g.n)}</span></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(o).prospects.lost_reasons.length) {
          _push(`<p class="text-gray-600">None recorded yet.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
        if (unref(o).messages.available) {
          _push(`<div class="glass-card p-4"><h2 class="section-title">Messages (last 30 days)</h2><p class="text-xs text-gray-300">${ssrInterpolate(unref(o).messages.sent_30d)} sent \xB7 ${ssrInterpolate(unref(o).messages.failed_30d)} failed \xB7 ${ssrInterpolate(unref(o).messages.replies_30d)} replies`);
          if (unref(o).messages.reply_rate != null) {
            _push(`<!--[--> (${ssrInterpolate(unref(o).messages.reply_rate)}% of sent)<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(` \xB7 ${ssrInterpolate(unref(o).messages.opted_out)} numbers on the do-not-contact list</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/results.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=results-llAek0dt.mjs.map
