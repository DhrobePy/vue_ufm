import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as _sfc_main$2 } from './CrmLabel-C2h7E70V.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
import { k as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-DhfvsbwY.mjs';
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
import '../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const segments = ["Trader / Store", "Bakery", "Food manufacturer", "Hotel / Institution", "Other business", "Unclassified"];
    const { data: d, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/crm/customers/${route.params.id}`,
      "$23yGkk7JBM"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const c = computed(() => d.value.customer);
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const tiles = computed(() => {
      const x = c.value;
      return [
        { l: "12-month sales", v: "\u09F3" + n0(x.value_12m), s: `${x.orders_12m} orders${x.gap_days ? ` \xB7 every ~${x.gap_days} days` : ""}` },
        { l: "Last order", v: x.days_since_last != null ? `${x.days_since_last} d ago` : "\u2014", s: x.last_order ? String(x.last_order).slice(0, 10) : "never" },
        { l: "Balance / limit", v: `\u09F3${n0(x.balance)}`, s: x.credit_limit >= 1e3 ? `limit \u09F3${n0(x.credit_limit)}${x.over_limit ? " \u2014 OVER" : ""}` : "no real limit set" },
        { l: "Pays in", v: x.pay_days != null ? `${x.pay_days} days` : "\u2014", s: x.overdue60 > 0 ? `\u09F3${n0(x.overdue60)} older than 60 d` : "nothing older than 60 days" }
      ];
    });
    const f = reactive({ channel: "call", outcome: "", summary: "", follow_up_date: "", promise_amount: null });
    const busy = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_HubTabs = _sfc_main$1;
      const _component_CrmLabel = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else if (unref(d)) {
        _push(`<!--[--><div class="glass-card p-5 space-y-2"><div class="flex flex-wrap items-center gap-3"><h1 class="text-xl font-bold text-gray-100">${ssrInterpolate(unref(c).name)}</h1>`);
        _push(ssrRenderComponent(_component_CrmLabel, {
          label: unref(c).label
        }, null, _parent));
        _push(`<span class="text-xs text-gray-500">${ssrInterpolate(unref(c).business_name)}</span><div class="ml-auto flex gap-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/customers/${unref(c).id}`,
          class: "btn-ghost text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Customer profile`);
            } else {
              return [
                createTextVNode("Customer profile")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/credit-sales/ledger?customer=${unref(c).id}`,
          class: "btn-ghost text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Ledger`);
            } else {
              return [
                createTextVNode("Ledger")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
        if (unref(c).reasons.length) {
          _push(`<p class="text-xs text-gray-400">${ssrInterpolate(unref(c).reasons.join(" \xB7 "))}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(c).suggestions.length) {
          _push(`<ul class="text-xs text-gray-200 list-disc pl-5 space-y-0.5"><!--[-->`);
          ssrRenderList(unref(c).suggestions, (s) => {
            _push(`<li>${ssrInterpolate(s)}</li>`);
          });
          _push(`<!--]--></ul>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-2 lg:grid-cols-4 gap-3"><!--[-->`);
        ssrRenderList(unref(tiles), (k) => {
          _push(`<div class="glass-card p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500">${ssrInterpolate(k.l)}</p><p class="text-lg font-bold font-mono text-gray-100">${ssrInterpolate(k.v)}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(k.s)}</p></div>`);
        });
        _push(`<!--]--></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card p-4 space-y-3"><h2 class="section-title">Log a contact</h2><div class="flex flex-wrap gap-2"><select class="field-input text-xs py-1.5 w-32"><!--[-->`);
        ssrRenderList(["call", "visit", "whatsapp", "sms", "email", "note"], (x) => {
          _push(`<option${ssrRenderAttr("value", x)}${ssrIncludeBooleanAttr(Array.isArray(unref(f).channel) ? ssrLooseContain(unref(f).channel, x) : ssrLooseEqual(unref(f).channel, x)) ? " selected" : ""}>${ssrInterpolate(x)}</option>`);
        });
        _push(`<!--]--></select><input${ssrRenderAttr("value", unref(f).outcome)} class="field-input text-xs py-1.5 flex-1 min-w-[8rem]" placeholder="Outcome (e.g. promised to pay)"></div><textarea rows="2" class="field-input text-xs w-full" placeholder="What was said / agreed\u2026">${ssrInterpolate(unref(f).summary)}</textarea><div class="flex flex-wrap items-center gap-2 text-xs text-gray-400"> Follow up on <input${ssrRenderAttr("value", unref(f).follow_up_date)} type="date" class="field-input text-xs py-1.5 w-36"> promised \u09F3 <input${ssrRenderAttr("value", unref(f).promise_amount)} type="number" min="0" class="field-input text-xs py-1.5 w-28" placeholder="optional"><button class="btn-gold text-xs ml-auto"${ssrIncludeBooleanAttr(!unref(f).summary.trim() || unref(busy)) ? " disabled" : ""}>Save</button></div></div><div class="glass-card p-4 space-y-2"><h2 class="section-title">Profile</h2><div class="flex flex-wrap items-center gap-2 text-xs"><span class="w-20 text-gray-500">Business type</span><select${ssrRenderAttr("value", unref(c).segment_confirmed ? unref(c).segment : "")} class="field-input text-xs py-1.5 w-48"><option value="">${ssrInterpolate(unref(c).segment)} (guess)</option><!--[-->`);
        ssrRenderList(segments, (s) => {
          _push(`<option${ssrRenderAttr("value", s)}>${ssrInterpolate(s)}</option>`);
        });
        _push(`<!--]--></select></div><div class="flex flex-wrap items-center gap-2 text-xs"><span class="w-20 text-gray-500">District</span><input${ssrRenderAttr("value", unref(c).district_confirmed ? unref(c).district : "")}${ssrRenderAttr("placeholder", `${unref(c).district} (guess)`)} class="field-input text-xs py-1.5 w-48"></div><p class="text-[11px] text-gray-600">Phone ${ssrInterpolate((_a = unref(c).phone) != null ? _a : "\u2014")} \xB7 ${ssrInterpolate((_b = unref(c).address) != null ? _b : "no address")} \xB7 branch ${ssrInterpolate((_c = unref(c).branch) != null ? _c : "\u2014")}</p></div></div><div class="glass-card p-4 space-y-2"><h2 class="section-title">Tasks</h2><!--[-->`);
        ssrRenderList(unref(d).tasks, (t) => {
          _push(`<div class="flex items-center gap-2 text-xs py-1.5 border-b border-white/[0.05]"><span class="px-2 py-0.5 rounded bg-white/10 text-gray-300">${ssrInterpolate(t.kind.replace("_", " "))}</span><span class="${ssrRenderClass([t.status === "open" ? "text-gray-200" : "text-gray-600 line-through", "flex-1"])}">${ssrInterpolate(t.title)}</span><span class="text-gray-500">${ssrInterpolate(t.due_date ? String(t.due_date).slice(0, 10) : "")}</span>`);
          if (t.status === "open") {
            _push(`<button class="btn-gold text-[11px] px-2.5 py-1">Done</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        if (!unref(d).tasks.length) {
          _push(`<p class="text-xs text-gray-600">No tasks. Saving a contact with a follow-up date creates one.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="glass-card p-4"><h2 class="section-title mb-2">Recent orders</h2><!--[-->`);
        ssrRenderList(unref(d).orders, (o) => {
          _push(`<div class="flex items-center gap-2 text-xs py-1 border-b border-white/[0.04]">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${o.id}`,
            class: "text-gold-400 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(o.order_number)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(o.order_number), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-gray-500">${ssrInterpolate(String(o.order_date).slice(0, 10))}</span><span class="text-gray-500">${ssrInterpolate(o.status)}</span><span class="ml-auto font-mono">\u09F3${ssrInterpolate(n0(o.amount))}</span>`);
          if (Number(o.due) > 0) {
            _push(`<span class="font-mono text-amber-400">due ${ssrInterpolate(n0(o.due))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div><div class="glass-card p-4"><h2 class="section-title mb-2">Recent payments</h2><!--[-->`);
        ssrRenderList(unref(d).payments, (p) => {
          _push(`<div class="flex items-center gap-2 text-xs py-1 border-b border-white/[0.04]"><span class="font-mono text-gray-400">${ssrInterpolate(p.payment_number)}</span><span class="text-gray-500">${ssrInterpolate(String(p.payment_date).slice(0, 10))}</span><span class="text-gray-500">${ssrInterpolate(p.method)}</span><span class="ml-auto font-mono text-emerald-400">\u09F3${ssrInterpolate(n0(p.amount))}</span></div>`);
        });
        _push(`<!--]--></div></div><div class="glass-card p-4 space-y-1"><h2 class="section-title mb-1">Contact log</h2><!--[-->`);
        ssrRenderList(unref(d).interactions, (i) => {
          _push(`<div class="text-xs py-1.5 border-b border-white/[0.04]"><span class="text-gray-500">${ssrInterpolate(String(i.created_at).slice(0, 16))}</span> <span class="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 mx-1">${ssrInterpolate(i.channel)}</span><span class="text-gray-200">${ssrInterpolate(i.summary)}</span>`);
          if (i.outcome) {
            _push(`<span class="text-emerald-400"> \u2014 ${ssrInterpolate(i.outcome)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<span class="text-gray-600"> \xB7 ${ssrInterpolate(i.via_agent ? "assistant" : i.by_user)}</span></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(d).interactions.length) {
          _push(`<p class="text-xs text-gray-600">No contact recorded yet.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/customers/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-2cKwE9H4.mjs.map
