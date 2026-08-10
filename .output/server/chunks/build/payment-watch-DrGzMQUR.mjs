import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, computed, withAsyncContext, ref, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { p as useUserSession } from './server.mjs';
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
  __name: "payment-watch",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { user } = useUserSession();
    useToast();
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/payment-watch",
      "$VZAeG-5d7L"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const orders = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.orders) != null ? _b : [];
    });
    const heldValue = computed(() => orders.value.filter((o) => o.dispatch_hold && !o.dispatch_cleared).reduce((s, o) => {
      var _a;
      return s + Number((_a = o.total_amount) != null ? _a : 0);
    }, 0));
    const acting = ref(null);
    const flash = ref("");
    const undoTarget = ref(null);
    function conditionLabel(o) {
      var _a;
      const amt = o.condition_amount != null ? ` \u09F3${Number(o.condition_amount).toLocaleString()}` : "";
      const map = {
        manual: "Manual clearance by accounts",
        outstanding_below: `Old dues must drop to${amt}`,
        outstanding_after_ship: Number(o.condition_amount) === 0 ? "Pay everything incl. this invoice" : `Total dues after shipping \u2264${amt}`,
        amount_received: `Receive${amt} against this order`
      };
      return (_a = map[o.condition_type]) != null ? _a : "Dispatch hold";
    }
    function progressPct(o) {
      var _a, _b;
      if (o.condition_met) return 100;
      const target = Number((_a = o.condition_amount) != null ? _a : 0);
      const cur = Number((_b = o.current_value) != null ? _b : 0);
      if (o.condition_type === "amount_received" && target > 0)
        return Math.min(99, Math.round(cur / target * 100));
      if (["outstanding_below", "outstanding_after_ship"].includes(o.condition_type) && cur > 0)
        return Math.min(99, Math.max(5, Math.round(target / cur * 100)));
      return 5;
    }
    function progressText(o) {
      if (o.current_value == null) return "waiting";
      if (o.condition_type === "amount_received")
        return `\u09F3${Number(o.current_value).toLocaleString()} received`;
      return `dues \u09F3${Number(o.current_value).toLocaleString()}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Payment Watch",
        subtitle: "Held orders \u2014 clear dispatch when payment conditions are met",
        breadcrumb: ["Credit Sales", "Payment Watch"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30"${_scopeId}> \u{1F441} Accounts </span>`);
          } else {
            return [
              createVNode("span", { class: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30" }, " \u{1F441} Accounts ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-3"><div class="glass-card p-4"><p class="text-[11px] text-gray-500 uppercase tracking-wide">On Watch</p><p class="text-2xl font-bold text-gray-100 mt-1">${ssrInterpolate(unref(orders).length)}</p></div><div class="glass-card p-4"><p class="text-[11px] text-gray-500 uppercase tracking-wide">Condition Met</p><p class="text-2xl font-bold text-emerald-400 mt-1">${ssrInterpolate(unref(orders).filter((o) => o.condition_met && !o.dispatch_cleared).length)}</p></div><div class="glass-card p-4"><p class="text-[11px] text-gray-500 uppercase tracking-wide">Cleared, Not Shipped</p><p class="text-2xl font-bold text-sky-400 mt-1">${ssrInterpolate(unref(orders).filter((o) => o.dispatch_cleared).length)}</p></div><div class="glass-card p-4"><p class="text-[11px] text-gray-500 uppercase tracking-wide">Held Value</p><p class="text-2xl font-bold text-gold-400 mt-1">\u09F3${ssrInterpolate(unref(heldValue).toLocaleString())}</p></div></div>`);
      if (unref(flash)) {
        _push(`<div class="glass-card px-4 py-3 text-sm border bg-emerald-500/10 border-emerald-500/25 text-emerald-300 flex items-center justify-between"><span>\u2713 ${ssrInterpolate(unref(flash))}</span>`);
        if (unref(undoTarget)) {
          _push(`<button class="text-xs underline text-emerald-400 hover:text-emerald-200">Undo</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="glass-card p-12 text-center"><div class="w-7 h-7 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mx-auto mb-2"></div><p class="text-xs text-gray-500">Loading watch list\u2026</p></div>`);
      } else if (!unref(orders).length) {
        _push(`<div class="glass-card p-14 text-center space-y-2"><div class="text-5xl">\u{1F54A}\uFE0F</div><p class="text-gray-400 font-semibold">Nothing on watch</p><p class="text-xs text-gray-600">Orders with payment conditions or production holds appear here</p></div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(orders), (o) => {
          _push(`<div class="${ssrRenderClass([o.condition_met && !o.dispatch_cleared ? "border-emerald-500/30" : "", "glass-card p-0 overflow-hidden"])}"><div class="px-5 py-4 flex items-start gap-4 flex-wrap"><div class="min-w-[180px]">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/credit-sales/${o.id}`,
            class: "font-bold text-gray-200 text-sm hover:text-gold-400"
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
          _push(`<p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(o.customer_name)}</p><div class="flex items-center gap-2 mt-1.5">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: o.status
          }, null, _parent));
          if (o.production_hold && !o.production_released) {
            _push(`<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/25"> \u26D4 Production hold </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="text-xs space-y-1 min-w-[150px]"><p class="text-gray-500">Invoice <span class="font-mono font-bold text-gray-300 float-right">\u09F3${ssrInterpolate(Number(o.total_amount).toLocaleString())}</span></p><p class="text-gray-500">Received <span class="font-mono font-bold text-emerald-400 float-right">\u09F3${ssrInterpolate(Number(o.amount_paid).toLocaleString())}</span></p><p class="text-gray-500">Balance <span class="font-mono font-bold text-gold-400 float-right">\u09F3${ssrInterpolate(Number(o.balance_due).toLocaleString())}</span></p></div>`);
          if (o.dispatch_hold) {
            _push(`<div class="flex-1 min-w-[220px]"><div class="flex items-center justify-between text-[11px] mb-1"><span class="text-gray-500">${ssrInterpolate(conditionLabel(o))}</span><span class="${ssrRenderClass(o.condition_met ? "text-emerald-400 font-bold" : "text-gray-500")}">${ssrInterpolate(o.condition_met ? "\u2713 CONDITION MET" : progressText(o))}</span></div><div class="h-2 rounded-full bg-white/[0.06] overflow-hidden"><div class="${ssrRenderClass([o.condition_met ? "bg-emerald-500 animate-pulse" : "bg-sky-500/60", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${progressPct(o)}%`)}"></div></div>`);
            if (o.accounts_note) {
              _push(`<p class="text-[11px] text-gray-600 mt-1.5 italic">\u{1F4DD} ${ssrInterpolate(o.accounts_note)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (o.auto_release) {
              _push(`<p class="text-[10px] text-amber-500/80 mt-0.5">\u26A1 Auto-release on condition (cheque risk accepted)</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex flex-col gap-2 items-end shrink-0">`);
          if (o.dispatch_hold && !o.dispatch_cleared) {
            _push(`<button${ssrIncludeBooleanAttr(unref(acting) === o.id) ? " disabled" : ""} class="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">${ssrInterpolate(unref(acting) === o.id ? "\u2026" : "\u2713 Grant Clearance")}</button>`);
          } else if (o.dispatch_cleared) {
            _push(`<!--[--><span class="text-[11px] text-emerald-400"> \u2713 Cleared ${ssrInterpolate(o.cleared_by_name ? `by ${o.cleared_by_name}` : "")}</span><button${ssrIncludeBooleanAttr(unref(acting) === o.id) ? " disabled" : ""} class="px-3 py-1 rounded-lg text-[11px] text-gray-500 border border-white/[0.08] hover:text-red-400 hover:border-red-500/25 disabled:opacity-40 transition-colors"> Revoke </button><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          if (o.production_hold && !o.production_released && unref(isAdmin)) {
            _push(`<button${ssrIncludeBooleanAttr(unref(acting) === o.id) ? " disabled" : ""} class="px-3 py-1 rounded-lg text-[11px] text-amber-400 border border-amber-500/25 hover:bg-amber-500/10 disabled:opacity-40 transition-colors"> Release Production </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/credit-sales/payment-watch.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=payment-watch-DrGzMQUR.mjs.map
