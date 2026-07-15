import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './KpiCard-yeUJcbjn.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './SidebarIcon-oZVkzwjh.mjs';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/dashboard",
      "$q2oBnZoPxG"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const users = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.users) != null ? _b : [];
    });
    const recentAudit = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.recentAudit) != null ? _b : [];
    });
    function timeAgo(dateStr) {
      if (!dateStr) return "\u2014";
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_KpiCard = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Admin",
        subtitle: "Users \xB7 employees \xB7 audit trail \xB7 system settings",
        breadcrumb: ["Admin"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4">`);
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Total Users",
          value: String((_a = unref(stats).total_users) != null ? _a : 0),
          trend: "registered",
          "trend-up": "",
          icon: "users",
          color: "blue"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Active Users",
          value: String((_b = unref(stats).active_users) != null ? _b : 0),
          trend: "online capable",
          "trend-up": "",
          icon: "check",
          color: "teal"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Audit Events",
          value: String((_c = unref(stats).audit_this_month) != null ? _c : 0),
          trend: "This month",
          "trend-up": "",
          icon: "list",
          color: "gold"
        }, null, _parent));
        _push(ssrRenderComponent(_component_KpiCard, {
          label: "Warnings 24h",
          value: String((_d = unref(stats).warnings_24h) != null ? _d : 0),
          trend: "security alerts",
          "trend-up": false,
          icon: "cog",
          color: "red"
        }, null, _parent));
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">System Users</h2>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/users",
          class: "text-xs text-gold-500 hover:text-gold-400 font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Manage \u2192`);
            } else {
              return [
                createTextVNode("Manage \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(users), (u) => {
          _push(`<div class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.03] transition-colors"><div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#f59e0b,#d97706)" })}">${ssrInterpolate((u.display_name || "U")[0])}</div><div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(u.display_name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(u.role)}${ssrInterpolate(u.branch_name ? " \xB7 " + u.branch_name : "")}</p></div>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: u.status
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        if (!unref(users).length) {
          _push(`<div class="text-xs text-center text-gray-600 py-4">No users found</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="glass-card p-5"><div class="flex items-center justify-between mb-4"><h2 class="section-title">Audit Trail</h2>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/audit",
          class: "text-xs text-gold-500 hover:text-gold-400 font-medium"
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
        _push(`</div><div class="space-y-2.5"><!--[-->`);
        ssrRenderList(unref(recentAudit), (log) => {
          _push(`<div class="flex gap-3"><div class="${ssrRenderClass([
            "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
            log.severity === "warning" ? "bg-yellow-400" : log.severity === "error" ? "bg-red-400" : "bg-emerald-400"
          ])}"></div><div><p class="text-xs text-gray-300">${ssrInterpolate(log.description)}</p><p class="text-[11px] text-gray-600">${ssrInterpolate(log.user_name)} \xB7 ${ssrInterpolate(timeAgo(log.created_at))}</p></div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(recentAudit).length) {
          _push(`<div class="text-xs text-center text-gray-600 py-4">No audit events</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-O7FJfJq2.mjs.map
