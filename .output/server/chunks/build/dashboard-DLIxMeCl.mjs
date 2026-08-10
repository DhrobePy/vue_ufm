import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate } from 'vue/server-renderer';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "dashboard",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/pos/dashboard",
      "$joevn6TPFp"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const mtd = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.mtd) != null ? _b : {};
    });
    const today = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.today) != null ? _b : {};
    });
    const pendingApprovals = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.pending_approvals) != null ? _b : 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "POS Dashboard",
        subtitle: "Month-to-date summary across the counter",
        breadcrumb: ["POS", "Dashboard"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/pos",
              class: "btn-gold text-xs py-2"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u{1F5A5}\uFE0F Open Terminal`);
                } else {
                  return [
                    createTextVNode("\u{1F5A5}\uFE0F Open Terminal")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/pos",
                class: "btn-gold text-xs py-2"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u{1F5A5}\uFE0F Open Terminal")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pendingApprovals) > 0) {
        _push(`<div class="rounded-xl p-3 text-xs text-orange-300 flex items-center justify-between" style="${ssrRenderStyle({ "background": "rgba(245,158,11,0.08)", "border": "1px solid rgba(245,158,11,0.25)" })}"><span>\u23F3 ${ssrInterpolate(unref(pendingApprovals))} POS exit release(s) awaiting approval</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/pos/pending-approvals",
          class: "underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Review \u2192`);
            } else {
              return [
                createTextVNode("Review \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-2 md:grid-cols-4 gap-3"><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">MTD Orders</p><p class="text-lg font-bold text-gray-200 mt-1">${ssrInterpolate((_a = unref(mtd).order_count) != null ? _a : 0)}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">MTD Revenue</p><p class="text-lg font-bold text-gold-400 mt-1">\u09F3${ssrInterpolate(Number((_b = unref(mtd).revenue) != null ? _b : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">MTD Cash</p><p class="text-lg font-bold text-emerald-400 mt-1">\u09F3${ssrInterpolate(Number((_c = unref(mtd).cash_total) != null ? _c : 0).toLocaleString())}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">MTD Credit</p><p class="text-lg font-bold text-orange-400 mt-1">\u09F3${ssrInterpolate(Number((_d = unref(mtd).credit_total) != null ? _d : 0).toLocaleString())}</p></div></div><div class="grid grid-cols-2 gap-3"><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Today&#39;s Orders</p><p class="text-lg font-bold text-gray-200 mt-1">${ssrInterpolate((_e = unref(today).order_count) != null ? _e : 0)}</p></div><div class="glass-card p-4"><p class="text-[10px] text-gray-600 uppercase tracking-wider">Today&#39;s Revenue</p><p class="text-lg font-bold text-gold-400 mt-1">\u09F3${ssrInterpolate(Number((_f = unref(today).revenue) != null ? _f : 0).toLocaleString())}</p></div></div><div class="flex flex-wrap gap-3">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/pos/today",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Today&#39;s Orders`);
          } else {
            return [
              createTextVNode("Today's Orders")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/pos/reports",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Reports`);
          } else {
            return [
              createTextVNode("Reports")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/pos/eod",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`End of Day`);
          } else {
            return [
              createTextVNode("End of Day")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/pos/pending-approvals",
        class: "btn-ghost text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Pending Approvals`);
          } else {
            return [
              createTextVNode("Pending Approvals")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pos/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=dashboard-DLIxMeCl.mjs.map
