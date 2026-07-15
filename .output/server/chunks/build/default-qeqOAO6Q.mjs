import { _ as __nuxt_component_0$2 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$8 } from './SidebarIcon-oZVkzwjh.mjs';
import { defineComponent, ref, watch, mergeProps, unref, computed, withCtx, openBlock, createBlock, createCommentVNode, createTextVNode, createVNode, nextTick, Transition, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderTeleport, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, b as __nuxt_component_2, p as useUserSession, l as useRouter } from './server.mjs';
import { u as usePermissions } from './usePermissions-BSnAhZCp.mjs';
import { u as useTheme } from './useTheme-DcI34_eY.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import './permRoutes-D3m_BSE2.mjs';

const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "SidebarNavItem",
  __ssrInlineRender: true,
  props: {
    label: {},
    route: {},
    iconType: {},
    collapsed: { type: Boolean },
    sub: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const currentRoute = useRoute();
    const isActive = computed(
      () => props.route === "/dashboard" ? currentRoute.path === props.route : currentRoute.path.startsWith(props.route)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_SidebarIcon = _sfc_main$8;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: __props.route,
        class: [
          "nav-item group relative",
          __props.sub ? "ml-1 pl-8 py-2 text-[13px]" : "",
          unref(isActive) ? "nav-item-active" : "",
          __props.collapsed && !__props.sub ? "justify-center px-0 w-full" : ""
        ],
        title: __props.collapsed ? __props.label : void 0
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(isActive) && !__props.sub) {
              _push2(`<div class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style="${ssrRenderStyle({ "background": "linear-gradient(180deg, var(--accent-from), var(--accent-to))" })}" data-v-a99991bd${_scopeId}></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.sub) {
              _push2(`<div class="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center" data-v-a99991bd${_scopeId}><div class="${ssrRenderClass(["w-1.5 h-1.5 rounded-full transition-all duration-150", unref(isActive) ? "" : "bg-white/20 group-hover:bg-white/40"])}" style="${ssrRenderStyle(unref(isActive) ? "background: var(--accent-from)" : "")}" data-v-a99991bd${_scopeId}></div></div>`);
            } else {
              _push2(`<!---->`);
            }
            if (!__props.sub || !__props.collapsed) {
              _push2(`<span class="${ssrRenderClass(["shrink-0 transition-colors duration-150", unref(isActive) ? "" : "text-gray-500 group-hover:text-gray-300", __props.collapsed && !__props.sub ? "mx-auto" : ""])}" style="${ssrRenderStyle(unref(isActive) ? "color: var(--accent-from)" : "")}" data-v-a99991bd${_scopeId}>`);
              _push2(ssrRenderComponent(_component_SidebarIcon, {
                type: __props.iconType,
                class: "w-4 h-4"
              }, null, _parent2, _scopeId));
              _push2(`</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(``);
            if (!__props.collapsed) {
              _push2(`<span class="${ssrRenderClass(["truncate transition-colors duration-150", unref(isActive) ? "" : "text-gray-400 group-hover:text-gray-100"])}" style="${ssrRenderStyle(unref(isActive) ? "color: var(--accent-from)" : "")}" data-v-a99991bd${_scopeId}>${ssrInterpolate(__props.label)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (__props.collapsed && !__props.sub) {
              _push2(`<div class="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-100 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50" style="${ssrRenderStyle({ "background": "rgba(28,28,28,0.95)", "border": "1px solid rgba(255,255,255,0.1)", "box-shadow": "0 4px 16px rgba(0,0,0,0.5)" })}" data-v-a99991bd${_scopeId}>${ssrInterpolate(__props.label)} <div class="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 rotate-45" style="${ssrRenderStyle({ "background": "rgba(28,28,28,0.95)", "border-left": "1px solid rgba(255,255,255,0.1)", "border-bottom": "1px solid rgba(255,255,255,0.1)" })}" data-v-a99991bd${_scopeId}></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(isActive) && !__props.sub ? (openBlock(), createBlock("div", {
                key: 0,
                class: "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full",
                style: { "background": "linear-gradient(180deg, var(--accent-from), var(--accent-to))" }
              })) : createCommentVNode("", true),
              __props.sub ? (openBlock(), createBlock("div", {
                key: 1,
                class: "absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center"
              }, [
                createVNode("div", {
                  class: ["w-1.5 h-1.5 rounded-full transition-all duration-150", unref(isActive) ? "" : "bg-white/20 group-hover:bg-white/40"],
                  style: unref(isActive) ? "background: var(--accent-from)" : ""
                }, null, 6)
              ])) : createCommentVNode("", true),
              !__props.sub || !__props.collapsed ? (openBlock(), createBlock("span", {
                key: 2,
                class: ["shrink-0 transition-colors duration-150", unref(isActive) ? "" : "text-gray-500 group-hover:text-gray-300", __props.collapsed && !__props.sub ? "mx-auto" : ""],
                style: unref(isActive) ? "color: var(--accent-from)" : ""
              }, [
                createVNode(_component_SidebarIcon, {
                  type: __props.iconType,
                  class: "w-4 h-4"
                }, null, 8, ["type"])
              ], 6)) : createCommentVNode("", true),
              createVNode(Transition, { name: "label-fade" }, {
                default: withCtx(() => [
                  !__props.collapsed ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: ["truncate transition-colors duration-150", unref(isActive) ? "" : "text-gray-400 group-hover:text-gray-100"],
                    style: unref(isActive) ? "color: var(--accent-from)" : ""
                  }, toDisplayString(__props.label), 7)) : createCommentVNode("", true)
                ]),
                _: 1
              }),
              __props.collapsed && !__props.sub ? (openBlock(), createBlock("div", {
                key: 3,
                class: "absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-100 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50",
                style: { "background": "rgba(28,28,28,0.95)", "border": "1px solid rgba(255,255,255,0.1)", "box-shadow": "0 4px 16px rgba(0,0,0,0.5)" }
              }, [
                createTextVNode(toDisplayString(__props.label) + " ", 1),
                createVNode("div", {
                  class: "absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 rotate-45",
                  style: { "background": "rgba(28,28,28,0.95)", "border-left": "1px solid rgba(255,255,255,0.1)", "border-bottom": "1px solid rgba(255,255,255,0.1)" }
                })
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SidebarNavItem.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-a99991bd"]]);
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "SidebarGroup",
  __ssrInlineRender: true,
  props: {
    label: {},
    route: {},
    iconType: {},
    collapsed: { type: Boolean },
    color: {}
  },
  setup(__props) {
    const props = __props;
    const currentRoute = useRoute();
    const isModuleActive = computed(() => currentRoute.path.startsWith(props.route));
    const open = ref(isModuleActive.value);
    watch(isModuleActive, (val) => {
      if (val) open.value = true;
    });
    watch(() => props.collapsed, (val) => {
      if (val) open.value = false;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SidebarIcon = _sfc_main$8;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-62cf9af8><button class="${ssrRenderClass([
        "nav-item w-full group relative",
        __props.collapsed ? "justify-center px-0" : "justify-between",
        unref(isModuleActive) ? "nav-item-active" : ""
      ])}"${ssrRenderAttr("title", __props.collapsed ? __props.label : void 0)} data-v-62cf9af8>`);
      if (unref(isModuleActive)) {
        _push(`<div class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style="${ssrRenderStyle({ "background": "linear-gradient(180deg, var(--accent-from), var(--accent-to))" })}" data-v-62cf9af8></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass([__props.collapsed ? "mx-auto" : "", "flex items-center gap-3"])}" data-v-62cf9af8><span class="${ssrRenderClass(["shrink-0 transition-colors duration-150", unref(isModuleActive) ? "" : "text-gray-500 group-hover:text-gray-300"])}" style="${ssrRenderStyle(unref(isModuleActive) ? "color: var(--accent-from)" : "")}" data-v-62cf9af8>`);
      _push(ssrRenderComponent(_component_SidebarIcon, {
        type: __props.iconType,
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</span>`);
      if (!__props.collapsed) {
        _push(`<span class="${ssrRenderClass(["text-sm font-medium transition-colors duration-150", unref(isModuleActive) ? "" : "text-gray-400 group-hover:text-gray-100"])}" style="${ssrRenderStyle(unref(isModuleActive) ? "color: var(--accent-from)" : "")}" data-v-62cf9af8>${ssrInterpolate(__props.label)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!__props.collapsed) {
        _push(`<svg class="${ssrRenderClass(["w-3.5 h-3.5 shrink-0 transition-transform duration-200 text-gray-600", unref(open) ? "rotate-180" : ""])}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-62cf9af8><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" data-v-62cf9af8></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.collapsed) {
        _push(`<div class="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-100 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50" style="${ssrRenderStyle({ "background": "rgba(28,28,28,0.95)", "border": "1px solid rgba(255,255,255,0.1)", "box-shadow": "0 4px 16px rgba(0,0,0,0.5)" })}" data-v-62cf9af8>${ssrInterpolate(__props.label)} <div class="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 rotate-45" style="${ssrRenderStyle({ "background": "rgba(28,28,28,0.95)", "border-left": "1px solid rgba(255,255,255,0.1)", "border-bottom": "1px solid rgba(255,255,255,0.1)" })}" data-v-62cf9af8></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
      if (unref(open) && !__props.collapsed) {
        _push(`<div class="mt-0.5 space-y-0.5 overflow-hidden" data-v-62cf9af8>`);
        ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SidebarGroup.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-62cf9af8"]]);
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "AppSidebar",
  __ssrInlineRender: true,
  props: {
    collapsed: { type: Boolean },
    mobileOpen: { type: Boolean }
  },
  emits: ["toggle", "close-mobile"],
  setup(__props) {
    const { user: sessionUser } = useUserSession();
    const initials = computed(() => {
      var _a;
      const name = ((_a = sessionUser.value) == null ? void 0 : _a.name) || "U";
      return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    });
    const isAdminUser = computed(
      () => {
        var _a, _b;
        return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
      }
    );
    const perms = usePermissions();
    const showOperations = computed(
      () => perms.canAccessModule("credit_sales") || perms.canAccessModule("fleet") || perms.canAccessModule("purchase")
    );
    const showFinance = computed(
      () => perms.canAccessModule("expenses") || perms.canAccessModule("bank") || perms.canAccessModule("accounts")
    );
    const showStandalone = computed(
      () => perms.canAccessModule("sales") || perms.canAccessModule("production") || perms.canAccessModule("dispatch") || perms.canAccessModule("collector")
    );
    const showMore = computed(
      () => perms.canAccessModule("customers") || perms.canAccessModule("products") || perms.canAccessModule("pos") || perms.canAccessModule("admin")
    );
    const showHR = computed(() => perms.canAccessModule("hr"));
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_SidebarNavItem = __nuxt_component_0$1;
      const _component_SidebarGroup = __nuxt_component_1$2;
      _push(`<aside${ssrRenderAttrs(mergeProps({
        class: [
          "fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out",
          // Desktop: collapsed or expanded
          __props.collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          // Mobile: always full width drawer, hidden off-screen unless open
          "w-[260px]",
          __props.mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        ],
        style: { "background": "linear-gradient(180deg, var(--sidebar-from) 0%, var(--sidebar-to) 100%)", "border-right": "1px solid rgb(var(--tint)/0.07)" }
      }, _attrs))} data-v-a42ec0c6><div class="absolute top-0 left-0 right-0 h-[2px]" style="${ssrRenderStyle({ "background": "linear-gradient(90deg, transparent, var(--accent-from), transparent)" })}" data-v-a42ec0c6></div><div class="absolute top-0 left-0 w-full h-64 pointer-events-none" style="${ssrRenderStyle({ "background": "radial-gradient(ellipse at top left, rgba(var(--accent-glow),0.06) 0%, transparent 70%)" })}" data-v-a42ec0c6></div><div class="${ssrRenderClass([__props.collapsed ? "justify-center" : "justify-between", "relative flex items-center h-16 px-4 shrink-0"])}" data-v-a42ec0c6><div class="flex items-center gap-3 overflow-hidden" data-v-a42ec0c6><div class="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center animate-glow-pulse" style="${ssrRenderStyle(`background: linear-gradient(135deg, var(--accent-from), var(--accent-to)); box-shadow: 0 0 16px rgba(var(--accent-glow),0.4)`)}" data-v-a42ec0c6><span class="font-display font-bold text-base leading-none" style="${ssrRenderStyle(`color: var(--accent-text)`)}" data-v-a42ec0c6>U</span></div>`);
      if (!__props.collapsed) {
        _push(`<div class="flex flex-col" data-v-a42ec0c6><span class="font-display font-bold text-sm text-white leading-tight tracking-tight" data-v-a42ec0c6>Ujjal FMC</span><span class="text-[10px] font-medium uppercase tracking-widest leading-tight" style="${ssrRenderStyle(`color: var(--accent-from); opacity: 0.8`)}" data-v-a42ec0c6>ERP System</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!__props.collapsed) {
        _push(`<button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150 shrink-0" data-v-a42ec0c6><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-a42ec0c6><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" data-v-a42ec0c6></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mx-4 h-px bg-white/[0.06]" data-v-a42ec0c6></div><nav class="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-0.5" data-v-a42ec0c6>`);
      if (unref(perms).canAccessModule("dashboard")) {
        _push(ssrRenderComponent(_component_SidebarNavItem, {
          label: "Dashboard",
          route: "/dashboard",
          collapsed: __props.collapsed,
          "icon-type": "dashboard"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(showOperations)) {
        _push(`<div class="py-1" data-v-a42ec0c6>`);
        if (!__props.collapsed) {
          _push(`<div class="px-3 mb-1" data-v-a42ec0c6><span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600" data-v-a42ec0c6>Operations</span></div>`);
        } else {
          _push(`<div class="mx-auto w-6 h-px bg-white/[0.06] my-2" data-v-a42ec0c6></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("credit_sales")) {
        _push(ssrRenderComponent(_component_SidebarGroup, {
          label: "Credit Sales",
          route: "/credit-sales",
          collapsed: __props.collapsed,
          "icon-type": "sales",
          color: "blue"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canAccessRoute("/credit-sales")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Dashboard",
                  route: "/credit-sales",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/all")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "All Sales",
                  route: "/credit-sales/all",
                  collapsed: __props.collapsed,
                  "icon-type": "list",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/create")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Create Order",
                  route: "/credit-sales/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/approve")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Approve Orders",
                  route: "/credit-sales/approve",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/production")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Production Queue",
                  route: "/credit-sales/production",
                  collapsed: __props.collapsed,
                  "icon-type": "factory",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/dispatch")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Dispatch Queue",
                  route: "/credit-sales/dispatch",
                  collapsed: __props.collapsed,
                  "icon-type": "truck",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/ledger")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Customer Ledger",
                  route: "/credit-sales/ledger",
                  collapsed: __props.collapsed,
                  "icon-type": "book",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/payment-watch")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Payment Watch",
                  route: "/credit-sales/payment-watch",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/approval-requests")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Approval Requests",
                  route: "/credit-sales/approval-requests",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/over-deliveries")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Over-Deliveries",
                  route: "/credit-sales/over-deliveries",
                  collapsed: __props.collapsed,
                  "icon-type": "list",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/collect")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Collect Payment",
                  route: "/credit-sales/collect",
                  collapsed: __props.collapsed,
                  "icon-type": "money",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/credit-sales/ageing")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Ageing Report",
                  route: "/credit-sales/ageing",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canAccessRoute("/credit-sales") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 0,
                  label: "Dashboard",
                  route: "/credit-sales",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/all") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 1,
                  label: "All Sales",
                  route: "/credit-sales/all",
                  collapsed: __props.collapsed,
                  "icon-type": "list",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/create") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 2,
                  label: "Create Order",
                  route: "/credit-sales/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/approve") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 3,
                  label: "Approve Orders",
                  route: "/credit-sales/approve",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/production") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 4,
                  label: "Production Queue",
                  route: "/credit-sales/production",
                  collapsed: __props.collapsed,
                  "icon-type": "factory",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/dispatch") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 5,
                  label: "Dispatch Queue",
                  route: "/credit-sales/dispatch",
                  collapsed: __props.collapsed,
                  "icon-type": "truck",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/ledger") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 6,
                  label: "Customer Ledger",
                  route: "/credit-sales/ledger",
                  collapsed: __props.collapsed,
                  "icon-type": "book",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/payment-watch") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 7,
                  label: "Payment Watch",
                  route: "/credit-sales/payment-watch",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/approval-requests") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 8,
                  label: "Approval Requests",
                  route: "/credit-sales/approval-requests",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/over-deliveries") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 9,
                  label: "Over-Deliveries",
                  route: "/credit-sales/over-deliveries",
                  collapsed: __props.collapsed,
                  "icon-type": "list",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/collect") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 10,
                  label: "Collect Payment",
                  route: "/credit-sales/collect",
                  collapsed: __props.collapsed,
                  "icon-type": "money",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/credit-sales/ageing") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 11,
                  label: "Ageing Report",
                  route: "/credit-sales/ageing",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("fleet")) {
        _push(ssrRenderComponent(_component_SidebarGroup, {
          label: "Fleet",
          route: "/fleet",
          collapsed: __props.collapsed,
          "icon-type": "truck",
          color: "teal"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canAccessRoute("/fleet")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Dashboard",
                  route: "/fleet",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/vehicles")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Vehicles",
                  route: "/fleet/vehicles",
                  collapsed: __props.collapsed,
                  "icon-type": "truck",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/drivers")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Drivers",
                  route: "/fleet/drivers",
                  collapsed: __props.collapsed,
                  "icon-type": "users",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/trips")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Trips",
                  route: "/fleet/trips",
                  collapsed: __props.collapsed,
                  "icon-type": "list",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/maintenance")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Maintenance",
                  route: "/fleet/maintenance",
                  collapsed: __props.collapsed,
                  "icon-type": "cog",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/maintenance/rules")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "PM Rules",
                  route: "/fleet/maintenance/rules",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/fuel")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Fuel Logs",
                  route: "/fleet/fuel",
                  collapsed: __props.collapsed,
                  "icon-type": "receipt",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/fuel/efficiency")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Fuel Report",
                  route: "/fleet/fuel/efficiency",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/purchases")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Purchases",
                  route: "/fleet/purchases",
                  collapsed: __props.collapsed,
                  "icon-type": "cart",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/items")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Items",
                  route: "/fleet/items",
                  collapsed: __props.collapsed,
                  "icon-type": "box",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/fleet/reports")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Reports",
                  route: "/fleet/reports",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canAccessRoute("/fleet") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 0,
                  label: "Dashboard",
                  route: "/fleet",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/vehicles") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 1,
                  label: "Vehicles",
                  route: "/fleet/vehicles",
                  collapsed: __props.collapsed,
                  "icon-type": "truck",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/drivers") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 2,
                  label: "Drivers",
                  route: "/fleet/drivers",
                  collapsed: __props.collapsed,
                  "icon-type": "users",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/trips") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 3,
                  label: "Trips",
                  route: "/fleet/trips",
                  collapsed: __props.collapsed,
                  "icon-type": "list",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/maintenance") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 4,
                  label: "Maintenance",
                  route: "/fleet/maintenance",
                  collapsed: __props.collapsed,
                  "icon-type": "cog",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/maintenance/rules") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 5,
                  label: "PM Rules",
                  route: "/fleet/maintenance/rules",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/fuel") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 6,
                  label: "Fuel Logs",
                  route: "/fleet/fuel",
                  collapsed: __props.collapsed,
                  "icon-type": "receipt",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/fuel/efficiency") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 7,
                  label: "Fuel Report",
                  route: "/fleet/fuel/efficiency",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/purchases") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 8,
                  label: "Purchases",
                  route: "/fleet/purchases",
                  collapsed: __props.collapsed,
                  "icon-type": "cart",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/items") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 9,
                  label: "Items",
                  route: "/fleet/items",
                  collapsed: __props.collapsed,
                  "icon-type": "box",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/fleet/reports") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 10,
                  label: "Reports",
                  route: "/fleet/reports",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("purchase")) {
        _push(ssrRenderComponent(_component_SidebarGroup, {
          label: "Purchase",
          route: "/purchase",
          collapsed: __props.collapsed,
          "icon-type": "cart",
          color: "orange"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canAccessRoute("/purchase")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Dashboard",
                  route: "/purchase",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/purchase/orders")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "All POs",
                  route: "/purchase/orders",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/purchase/orders/create")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Create PO",
                  route: "/purchase/orders/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/purchase/grn")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Goods Received",
                  route: "/purchase/grn",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(isAdminUser)) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Variance Report",
                  route: "/purchase/grn/variance",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/purchase/payments")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Payments",
                  route: "/purchase/payments",
                  collapsed: __props.collapsed,
                  "icon-type": "money",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/purchase/adjustments")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Adj. Notes",
                  route: "/purchase/adjustments",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/purchase/suppliers")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Suppliers",
                  route: "/purchase/suppliers",
                  collapsed: __props.collapsed,
                  "icon-type": "users",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/purchase/suppliers/summary")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Supplier Summary",
                  route: "/purchase/suppliers/summary",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canAccessRoute("/purchase") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 0,
                  label: "Dashboard",
                  route: "/purchase",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/purchase/orders") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 1,
                  label: "All POs",
                  route: "/purchase/orders",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/purchase/orders/create") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 2,
                  label: "Create PO",
                  route: "/purchase/orders/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/purchase/grn") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 3,
                  label: "Goods Received",
                  route: "/purchase/grn",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(isAdminUser) ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 4,
                  label: "Variance Report",
                  route: "/purchase/grn/variance",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/purchase/payments") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 5,
                  label: "Payments",
                  route: "/purchase/payments",
                  collapsed: __props.collapsed,
                  "icon-type": "money",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/purchase/adjustments") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 6,
                  label: "Adj. Notes",
                  route: "/purchase/adjustments",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/purchase/suppliers") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 7,
                  label: "Suppliers",
                  route: "/purchase/suppliers",
                  collapsed: __props.collapsed,
                  "icon-type": "users",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/purchase/suppliers/summary") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 8,
                  label: "Supplier Summary",
                  route: "/purchase/suppliers/summary",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(showFinance)) {
        _push(`<div class="py-1" data-v-a42ec0c6>`);
        if (!__props.collapsed) {
          _push(`<div class="px-3 mb-1" data-v-a42ec0c6><span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600" data-v-a42ec0c6>Finance</span></div>`);
        } else {
          _push(`<div class="mx-auto w-6 h-px bg-white/[0.06] my-2" data-v-a42ec0c6></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("expenses")) {
        _push(ssrRenderComponent(_component_SidebarGroup, {
          label: "Expenses",
          route: "/expenses",
          collapsed: __props.collapsed,
          "icon-type": "receipt",
          color: "yellow"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canAccessRoute("/expenses")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Dashboard",
                  route: "/expenses",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/expenses/create")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Create Expense",
                  route: "/expenses/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/expenses/history")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "History",
                  route: "/expenses/history",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/expenses/approve")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Approve",
                  route: "/expenses/approve",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/expenses/categories")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Categories",
                  route: "/expenses/categories",
                  collapsed: __props.collapsed,
                  "icon-type": "tag",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canAccessRoute("/expenses") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 0,
                  label: "Dashboard",
                  route: "/expenses",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/expenses/create") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 1,
                  label: "Create Expense",
                  route: "/expenses/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/expenses/history") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 2,
                  label: "History",
                  route: "/expenses/history",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/expenses/approve") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 3,
                  label: "Approve",
                  route: "/expenses/approve",
                  collapsed: __props.collapsed,
                  "icon-type": "check",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/expenses/categories") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 4,
                  label: "Categories",
                  route: "/expenses/categories",
                  collapsed: __props.collapsed,
                  "icon-type": "tag",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("bank")) {
        _push(ssrRenderComponent(_component_SidebarGroup, {
          label: "Bank",
          route: "/bank",
          collapsed: __props.collapsed,
          "icon-type": "bank",
          color: "indigo"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canAccessRoute("/bank")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Dashboard",
                  route: "/bank",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/bank/transaction/create")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "New Transaction",
                  route: "/bank/transaction/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/bank/transfer")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Transfer",
                  route: "/bank/transfer",
                  collapsed: __props.collapsed,
                  "icon-type": "arrows",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/bank/statement")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Statement",
                  route: "/bank/statement",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/bank/accounts")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Accounts",
                  route: "/bank/accounts",
                  collapsed: __props.collapsed,
                  "icon-type": "bank",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canAccessRoute("/bank") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 0,
                  label: "Dashboard",
                  route: "/bank",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/bank/transaction/create") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 1,
                  label: "New Transaction",
                  route: "/bank/transaction/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/bank/transfer") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 2,
                  label: "Transfer",
                  route: "/bank/transfer",
                  collapsed: __props.collapsed,
                  "icon-type": "arrows",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/bank/statement") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 3,
                  label: "Statement",
                  route: "/bank/statement",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/bank/accounts") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 4,
                  label: "Accounts",
                  route: "/bank/accounts",
                  collapsed: __props.collapsed,
                  "icon-type": "bank",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("accounts")) {
        _push(ssrRenderComponent(_component_SidebarGroup, {
          label: "Accounts",
          route: "/accounts",
          collapsed: __props.collapsed,
          "icon-type": "book",
          color: "teal"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canAccessRoute("/accounts/coa")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Chart of Accounts",
                  route: "/accounts/coa",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/accounts/journal/create")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "New Transaction",
                  route: "/accounts/journal/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/accounts/statement")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Statement",
                  route: "/accounts/statement",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/accounts/voucher")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Debit Voucher",
                  route: "/accounts/voucher",
                  collapsed: __props.collapsed,
                  "icon-type": "receipt",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/accounts/daily-log")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Daily Log",
                  route: "/accounts/daily-log",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canAccessRoute("/accounts/coa") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 0,
                  label: "Chart of Accounts",
                  route: "/accounts/coa",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/accounts/journal/create") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 1,
                  label: "New Transaction",
                  route: "/accounts/journal/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/accounts/statement") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 2,
                  label: "Statement",
                  route: "/accounts/statement",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/accounts/voucher") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 3,
                  label: "Debit Voucher",
                  route: "/accounts/voucher",
                  collapsed: __props.collapsed,
                  "icon-type": "receipt",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/accounts/daily-log") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 4,
                  label: "Daily Log",
                  route: "/accounts/daily-log",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(showStandalone)) {
        _push(`<div class="py-1" data-v-a42ec0c6>`);
        if (!__props.collapsed) {
          _push(`<div class="px-3 mb-1" data-v-a42ec0c6><span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600" data-v-a42ec0c6>Standalone Modules</span></div>`);
        } else {
          _push(`<div class="mx-auto w-6 h-px bg-white/[0.06] my-2" data-v-a42ec0c6></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("sales")) {
        _push(ssrRenderComponent(_component_SidebarNavItem, {
          label: "Sales",
          route: "/sales",
          collapsed: __props.collapsed,
          "icon-type": "chart"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("production")) {
        _push(ssrRenderComponent(_component_SidebarGroup, {
          label: "Production",
          route: "/production",
          collapsed: __props.collapsed,
          "icon-type": "factory",
          color: "teal"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canAccessRoute("/production")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Dashboard",
                  route: "/production",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/production/create")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "New Batch",
                  route: "/production/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canAccessRoute("/production") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 0,
                  label: "Dashboard",
                  route: "/production",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/production/create") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 1,
                  label: "New Batch",
                  route: "/production/create",
                  collapsed: __props.collapsed,
                  "icon-type": "plus",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("dispatch")) {
        _push(ssrRenderComponent(_component_SidebarNavItem, {
          label: "Dispatch",
          route: "/dispatch",
          collapsed: __props.collapsed,
          "icon-type": "truck"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("collector")) {
        _push(ssrRenderComponent(_component_SidebarNavItem, {
          label: "Collector",
          route: "/collector",
          collapsed: __props.collapsed,
          "icon-type": "money"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(showMore)) {
        _push(`<div class="py-1" data-v-a42ec0c6>`);
        if (!__props.collapsed) {
          _push(`<div class="px-3 mb-1" data-v-a42ec0c6><span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600" data-v-a42ec0c6>More</span></div>`);
        } else {
          _push(`<div class="mx-auto w-6 h-px bg-white/[0.06] my-2" data-v-a42ec0c6></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("customers")) {
        _push(ssrRenderComponent(_component_SidebarNavItem, {
          label: "Customers",
          route: "/customers",
          collapsed: __props.collapsed,
          "icon-type": "users"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("products")) {
        _push(ssrRenderComponent(_component_SidebarNavItem, {
          label: "Products",
          route: "/products",
          collapsed: __props.collapsed,
          "icon-type": "box"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("pos")) {
        _push(ssrRenderComponent(_component_SidebarNavItem, {
          label: "POS",
          route: "/pos",
          collapsed: __props.collapsed,
          "icon-type": "register"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("admin")) {
        _push(ssrRenderComponent(_component_SidebarNavItem, {
          label: "Admin",
          route: "/admin",
          collapsed: __props.collapsed,
          "icon-type": "cog"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(showHR)) {
        _push(`<div class="py-1" data-v-a42ec0c6>`);
        if (!__props.collapsed) {
          _push(`<div class="px-3 mb-1" data-v-a42ec0c6><span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-600" data-v-a42ec0c6>Human Resources</span></div>`);
        } else {
          _push(`<div class="mx-auto w-6 h-px bg-white/[0.06] my-2" data-v-a42ec0c6></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(perms).canAccessModule("hr")) {
        _push(ssrRenderComponent(_component_SidebarGroup, {
          label: "HR",
          route: "/hr",
          collapsed: __props.collapsed,
          "icon-type": "users",
          color: "teal"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(perms).canAccessRoute("/hr")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Dashboard",
                  route: "/hr",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/employees")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Employees",
                  route: "/hr/employees",
                  collapsed: __props.collapsed,
                  "icon-type": "users",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/attendance")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Attendance",
                  route: "/hr/attendance",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/leave-requests")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Leave Requests",
                  route: "/hr/leave-requests",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/salary-structure")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Salary Structure",
                  route: "/hr/salary-structure",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/payroll")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Payroll",
                  route: "/hr/payroll",
                  collapsed: __props.collapsed,
                  "icon-type": "money",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/advances")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Advances",
                  route: "/hr/advances",
                  collapsed: __props.collapsed,
                  "icon-type": "receipt",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/loans")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Loans",
                  route: "/hr/loans",
                  collapsed: __props.collapsed,
                  "icon-type": "bank",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/overtime")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Overtime",
                  route: "/hr/overtime",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/bonuses")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Bonuses",
                  route: "/hr/bonuses",
                  collapsed: __props.collapsed,
                  "icon-type": "money",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/holidays")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Holidays",
                  route: "/hr/holidays",
                  collapsed: __props.collapsed,
                  "icon-type": "calendar",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(perms).canAccessRoute("/hr/biometric")) {
                _push2(ssrRenderComponent(_component_SidebarNavItem, {
                  label: "Biometric",
                  route: "/hr/biometric",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                unref(perms).canAccessRoute("/hr") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 0,
                  label: "Dashboard",
                  route: "/hr",
                  collapsed: __props.collapsed,
                  "icon-type": "dashboard",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/employees") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 1,
                  label: "Employees",
                  route: "/hr/employees",
                  collapsed: __props.collapsed,
                  "icon-type": "users",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/attendance") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 2,
                  label: "Attendance",
                  route: "/hr/attendance",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/leave-requests") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 3,
                  label: "Leave Requests",
                  route: "/hr/leave-requests",
                  collapsed: __props.collapsed,
                  "icon-type": "file",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/salary-structure") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 4,
                  label: "Salary Structure",
                  route: "/hr/salary-structure",
                  collapsed: __props.collapsed,
                  "icon-type": "chart",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/payroll") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 5,
                  label: "Payroll",
                  route: "/hr/payroll",
                  collapsed: __props.collapsed,
                  "icon-type": "money",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/advances") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 6,
                  label: "Advances",
                  route: "/hr/advances",
                  collapsed: __props.collapsed,
                  "icon-type": "receipt",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/loans") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 7,
                  label: "Loans",
                  route: "/hr/loans",
                  collapsed: __props.collapsed,
                  "icon-type": "bank",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/overtime") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 8,
                  label: "Overtime",
                  route: "/hr/overtime",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/bonuses") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 9,
                  label: "Bonuses",
                  route: "/hr/bonuses",
                  collapsed: __props.collapsed,
                  "icon-type": "money",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/holidays") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 10,
                  label: "Holidays",
                  route: "/hr/holidays",
                  collapsed: __props.collapsed,
                  "icon-type": "calendar",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true),
                unref(perms).canAccessRoute("/hr/biometric") ? (openBlock(), createBlock(_component_SidebarNavItem, {
                  key: 11,
                  label: "Biometric",
                  route: "/hr/biometric",
                  collapsed: __props.collapsed,
                  "icon-type": "clock",
                  sub: ""
                }, null, 8, ["collapsed"])) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</nav><div class="shrink-0 mx-2 mb-3" data-v-a42ec0c6><div class="h-px bg-white/[0.06] mb-3" data-v-a42ec0c6></div><div class="${ssrRenderClass([
        "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer",
        "transition-all duration-150 hover:bg-white/[0.06] group",
        __props.collapsed ? "justify-center" : ""
      ])}" data-v-a42ec0c6><div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style="${ssrRenderStyle(`background: linear-gradient(135deg, var(--accent-from), var(--accent-to)); color: var(--accent-text)`)}" data-v-a42ec0c6>${ssrInterpolate(unref(initials))}</div>`);
      if (!__props.collapsed) {
        _push(`<div class="flex-1 min-w-0" data-v-a42ec0c6><p class="text-sm font-medium text-gray-200 truncate leading-tight" data-v-a42ec0c6>${ssrInterpolate(((_a = unref(sessionUser)) == null ? void 0 : _a.name) || "User")}</p><p class="text-[11px] text-gray-500 truncate leading-tight font-mono" data-v-a42ec0c6>${ssrInterpolate(((_b = unref(sessionUser)) == null ? void 0 : _b.role) || "")}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.collapsed) {
        _push(`<button class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 shrink-0" data-v-a42ec0c6><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-a42ec0c6><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" data-v-a42ec0c6></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.collapsed) {
        _push(`<button class="mt-1 w-full h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150" data-v-a42ec0c6><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-a42ec0c6><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" data-v-a42ec0c6></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></aside>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppSidebar.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-a42ec0c6"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ThemePicker",
  __ssrInlineRender: true,
  setup(__props) {
    const theme = useTheme();
    const customPickerHex = ref(theme.customHex.value);
    const PRESETS = [
      {
        id: "midnight-gold",
        name: "Midnight Gold",
        desc: "Classic dark \u2014 amber accent",
        base: "midnight",
        accent: "gold",
        sidebarFrom: "#1c1c1c",
        bgFrom: "#1a1410",
        accentFrom: "#f59e0b",
        accentTo: "#d97706"
      },
      {
        id: "abyss-sky",
        name: "Abyss Sky",
        desc: "Deep ocean \u2014 sky blue accent",
        base: "abyss",
        accent: "sky",
        sidebarFrom: "#0c1222",
        bgFrom: "#080e1a",
        accentFrom: "#38bdf8",
        accentTo: "#0ea5e9"
      },
      {
        id: "eclipse-violet",
        name: "Eclipse Violet",
        desc: "Dark cosmos \u2014 violet accent",
        base: "eclipse",
        accent: "violet",
        sidebarFrom: "#130c1e",
        bgFrom: "#0e0818",
        accentFrom: "#a78bfa",
        accentTo: "#7c3aed"
      },
      {
        id: "midnight-rose",
        name: "Noir Rose",
        desc: "Dark dramatic \u2014 rose accent",
        base: "midnight",
        accent: "rose",
        sidebarFrom: "#1c1c1c",
        bgFrom: "#1a1410",
        accentFrom: "#f43f5e",
        accentTo: "#e11d48"
      },
      {
        id: "abyss-emerald",
        name: "Deep Forest",
        desc: "Dark cool \u2014 emerald accent",
        base: "abyss",
        accent: "emerald",
        sidebarFrom: "#0c1222",
        bgFrom: "#080e1a",
        accentFrom: "#34d399",
        accentTo: "#059669"
      },
      {
        id: "ivory-gold",
        name: "Ivory Gold",
        desc: "Warm light \u2014 amber accent",
        base: "ivory",
        accent: "gold",
        sidebarFrom: "#fef8ec",
        bgFrom: "#fdf8ef",
        accentFrom: "#f59e0b",
        accentTo: "#d97706"
      },
      {
        id: "cloud-sky",
        name: "Cloud Sky",
        desc: "Cool light \u2014 sky blue accent",
        base: "cloud",
        accent: "sky",
        sidebarFrom: "#f5f8ff",
        bgFrom: "#f0f5ff",
        accentFrom: "#38bdf8",
        accentTo: "#0ea5e9"
      }
    ];
    const currentPresetId = computed(() => {
      var _a, _b;
      const b = theme.baseId.value;
      const a = theme.accentId.value;
      return (_b = (_a = PRESETS.find((p) => p.base === b && p.accent === a)) == null ? void 0 : _a.id) != null ? _b : null;
    });
    watch(() => theme.customHex.value, (v) => {
      customPickerHex.value = v;
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b;
        if (unref(theme).pickerOpen.value) {
          _push2(`<div class="fixed inset-0 z-[200]" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.45)", "backdrop-filter": "blur(3px)" })}" data-v-eeba4f05></div>`);
        } else {
          _push2(`<!---->`);
        }
        if (unref(theme).pickerOpen.value) {
          _push2(`<aside class="fixed right-0 top-0 h-full z-[201] flex flex-col" style="${ssrRenderStyle({ "width": "340px", "background": "var(--panel-bg, #111)", "border-left": "1px solid rgb(var(--tint)/0.09)", "box-shadow": "-12px 0 40px rgba(0,0,0,0.5)" })}" data-v-eeba4f05><div class="flex items-center justify-between px-5 py-4 shrink-0" style="${ssrRenderStyle({ "border-bottom": "1px solid rgb(var(--tint)/0.07)" })}" data-v-eeba4f05><div data-v-eeba4f05><h2 class="text-sm font-semibold text-gray-200" data-v-eeba4f05>Appearance</h2><p class="text-[11px] text-gray-500 mt-0.5" data-v-eeba4f05>Personalise your workspace</p></div><button class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all" data-v-eeba4f05><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-eeba4f05><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" data-v-eeba4f05></path></svg></button></div><div class="flex-1 overflow-y-auto no-scrollbar px-5 py-5 space-y-7" data-v-eeba4f05><section class="space-y-3" data-v-eeba4f05><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500" data-v-eeba4f05>Background</p><div class="grid grid-cols-2 gap-2.5" data-v-eeba4f05><!--[-->`);
          ssrRenderList(unref(theme).BASE_THEMES, (base) => {
            _push2(`<button class="${ssrRenderClass([unref(theme).baseId.value === base.id ? "border-[var(--accent-from)] shadow-[0_0_0_3px_rgb(var(--accent)/0.18)]" : "border-transparent hover:border-white/20", "relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left"])}" style="${ssrRenderStyle({ "height": "76px" })}" data-v-eeba4f05><div class="absolute inset-0" style="${ssrRenderStyle(`background: linear-gradient(135deg, ${base.preview[0]} 0%, ${base.bgTo} 100%)`)}" data-v-eeba4f05></div><div class="absolute top-0 left-0 bottom-0 w-[28%]" style="${ssrRenderStyle(`background: linear-gradient(180deg, ${base.sidebarFrom} 0%, ${base.sidebarTo} 100%); opacity: 0.9`)}" data-v-eeba4f05></div><div class="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-9 rounded-lg opacity-80" style="${ssrRenderStyle(`background: ${base.dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.80)"}; border: 1px solid ${base.dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`)}" data-v-eeba4f05></div><div class="absolute bottom-2 right-3 text-right" data-v-eeba4f05><p class="text-[11px] font-semibold leading-tight" style="${ssrRenderStyle(`color: ${base.dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)"}`)}" data-v-eeba4f05>${ssrInterpolate(base.emoji)} ${ssrInterpolate(base.name)}</p></div>`);
            if (unref(theme).baseId.value === base.id) {
              _push2(`<div class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style="${ssrRenderStyle({ "background": "var(--accent-from)" })}" data-v-eeba4f05><svg class="w-3 h-3 text-black" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" data-v-eeba4f05><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-eeba4f05></path></svg></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button>`);
          });
          _push2(`<!--]--></div></section><section class="space-y-3" data-v-eeba4f05><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500" data-v-eeba4f05>Accent Color</p><div class="flex flex-wrap gap-2" data-v-eeba4f05><!--[-->`);
          ssrRenderList(unref(theme).ACCENTS, (accent) => {
            _push2(`<button${ssrRenderAttr("title", accent.name)} style="${ssrRenderStyle(`background: linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`)}" class="${ssrRenderClass([unref(theme).accentId.value === accent.id ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105", "relative w-9 h-9 rounded-full transition-all duration-200"])}" data-v-eeba4f05>`);
            if (unref(theme).accentId.value === accent.id) {
              _push2(`<span class="absolute inset-0 flex items-center justify-center" data-v-eeba4f05><svg class="w-4 h-4" style="${ssrRenderStyle(`color:${accent.btnText}`)}" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" data-v-eeba4f05><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-eeba4f05></path></svg></span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button>`);
          });
          _push2(`<!--]--><div class="relative" data-v-eeba4f05><label${ssrRenderAttr("title", `Custom: ${unref(customPickerHex)}`)} class="${ssrRenderClass([unref(theme).accentId.value === "custom" ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105", "relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all"])}" style="${ssrRenderStyle(`background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`)}" data-v-eeba4f05>`);
          if (unref(theme).accentId.value !== "custom") {
            _push2(`<svg class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-eeba4f05><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.657-6.343l-.707.707M7.05 16.95l-.707.707m12.02 0l-.707-.707M7.05 7.05l-.707-.707" data-v-eeba4f05></path><circle cx="12" cy="12" r="3" data-v-eeba4f05></circle></svg>`);
          } else {
            _push2(`<svg class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" data-v-eeba4f05><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-eeba4f05></path></svg>`);
          }
          _push2(`<input type="color"${ssrRenderAttr("value", unref(customPickerHex))} class="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full" data-v-eeba4f05></label></div></div><div class="flex items-center gap-2 text-xs text-gray-500" data-v-eeba4f05><div class="w-4 h-4 rounded-full shrink-0" style="${ssrRenderStyle(`background: linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)`)}" data-v-eeba4f05></div><span data-v-eeba4f05>${ssrInterpolate(unref(theme).accentId.value === "custom" ? `Custom ${unref(customPickerHex)}` : (_b = (_a = unref(theme).currentAccent.value) == null ? void 0 : _a.name) != null ? _b : "Custom")}</span></div><div class="rounded-xl p-3 space-y-2.5" style="${ssrRenderStyle({ "background": "rgb(var(--tint)/0.04)", "border": "1px solid rgb(var(--tint)/0.08)" })}" data-v-eeba4f05><p class="text-[10px] text-gray-600 uppercase tracking-wider" data-v-eeba4f05>Preview</p><div class="flex gap-2 items-center flex-wrap" data-v-eeba4f05><button class="btn-gold text-xs px-3 py-1.5" data-v-eeba4f05>Primary Action</button><button class="btn-ghost text-xs px-3 py-1.5" data-v-eeba4f05>Secondary</button><span class="nav-item nav-item-active text-xs px-2.5 py-1" data-v-eeba4f05>Active item</span></div><div class="flex gap-2" data-v-eeba4f05><div class="h-1.5 flex-1 rounded-full overflow-hidden" style="${ssrRenderStyle({ "background": "rgb(var(--tint)/0.08)" })}" data-v-eeba4f05><div class="h-full w-[65%] rounded-full" style="${ssrRenderStyle({ "background": "linear-gradient(90deg,var(--accent-from),var(--accent-to))" })}" data-v-eeba4f05></div></div><span class="text-[10px] text-gray-500" data-v-eeba4f05>65%</span></div></div></section><section class="space-y-3" data-v-eeba4f05><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500" data-v-eeba4f05>Quick Presets</p><div class="grid grid-cols-1 gap-2" data-v-eeba4f05><!--[-->`);
          ssrRenderList(PRESETS, (preset) => {
            _push2(`<button class="${ssrRenderClass([unref(currentPresetId) === preset.id ? "ring-1 ring-[var(--accent-from)]" : "hover:bg-white/[0.05]", "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"])}" style="${ssrRenderStyle({ "border": "1px solid rgb(var(--tint)/0.07)" })}" data-v-eeba4f05><div class="flex shrink-0" data-v-eeba4f05><div class="w-4 h-7 rounded-l-full" style="${ssrRenderStyle(`background:${preset.sidebarFrom}`)}" data-v-eeba4f05></div><div class="w-4 h-7" style="${ssrRenderStyle(`background:${preset.bgFrom}`)}" data-v-eeba4f05></div><div class="w-4 h-7 rounded-r-full" style="${ssrRenderStyle(`background:linear-gradient(135deg,${preset.accentFrom},${preset.accentTo})`)}" data-v-eeba4f05></div></div><div class="flex-1 min-w-0" data-v-eeba4f05><p class="text-xs font-semibold text-gray-200" data-v-eeba4f05>${ssrInterpolate(preset.name)}</p><p class="text-[10px] text-gray-600" data-v-eeba4f05>${ssrInterpolate(preset.desc)}</p></div>`);
            if (unref(currentPresetId) === preset.id) {
              _push2(`<div class="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style="${ssrRenderStyle({ "background": "var(--accent-from)" })}" data-v-eeba4f05><svg class="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" data-v-eeba4f05><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-eeba4f05></path></svg></div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button>`);
          });
          _push2(`<!--]--></div></section></div><div class="shrink-0 px-5 py-4" style="${ssrRenderStyle({ "border-top": "1px solid rgb(var(--tint)/0.07)" })}" data-v-eeba4f05><button class="btn-ghost text-xs w-full justify-center" data-v-eeba4f05> \u21BA Reset to default </button></div></aside>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ThemePicker.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-eeba4f05"]]);
const INDEX = [
  // Pages / navigation
  { type: "page", icon: "\u{1F4CA}", label: "Dashboard", route: "/dashboard" },
  { type: "page", icon: "\u{1F4CB}", label: "All Credit Orders", route: "/credit-sales/all" },
  { type: "page", icon: "\u2705", label: "Approve Orders", route: "/credit-sales/approve" },
  { type: "page", icon: "\u{1F3ED}", label: "Production Queue", route: "/credit-sales/production" },
  { type: "page", icon: "\u{1F4E4}", label: "Dispatch Queue", route: "/credit-sales/dispatch" },
  { type: "page", icon: "\u{1F4D2}", label: "Customer Ledger", route: "/credit-sales/ledger" },
  { type: "page", icon: "\u{1F4C8}", label: "Ageing Report", route: "/credit-sales/ageing" },
  { type: "page", icon: "\u{1F6D2}", label: "Purchase Orders", route: "/purchase/orders" },
  { type: "page", icon: "\u{1F4E6}", label: "Goods Received (GRN)", route: "/purchase/grn" },
  { type: "page", icon: "\u{1F3E2}", label: "Suppliers", route: "/purchase/suppliers" },
  { type: "page", icon: "\u{1F4B8}", label: "Expenses", route: "/expenses" },
  { type: "page", icon: "\u2705", label: "Approve Expenses", route: "/expenses/approve" },
  { type: "page", icon: "\u{1F3E6}", label: "Bank Overview", route: "/bank" },
  { type: "page", icon: "\u{1F4B0}", label: "New Bank Transaction", route: "/bank/transaction/create" },
  { type: "page", icon: "\u{1F465}", label: "Customers", route: "/customers" },
  { type: "page", icon: "\u2795", label: "Add Customer", route: "/customers/create" },
  { type: "page", icon: "\u{1F4E6}", label: "Products", route: "/products" },
  { type: "page", icon: "\u{1F69B}", label: "Logistics", route: "/logistics" },
  { type: "page", icon: "\u{1F69B}", label: "Vehicles", route: "/logistics/vehicles" },
  { type: "page", icon: "\u{1F464}", label: "Drivers", route: "/logistics/drivers" },
  { type: "page", icon: "\u{1F4CD}", label: "Trips", route: "/logistics/trips" },
  { type: "page", icon: "\u{1F5A5}\uFE0F", label: "POS Terminal", route: "/pos" },
  { type: "page", icon: "\u{1F4C8}", label: "Sales Report", route: "/sales" },
  { type: "page", icon: "\u{1F3ED}", label: "Production Floor", route: "/production" },
  { type: "page", icon: "\u{1F4E4}", label: "Dispatch", route: "/dispatch" },
  { type: "page", icon: "\u{1F4B0}", label: "Collections", route: "/collector" },
  { type: "page", icon: "\u2699\uFE0F", label: "Admin", route: "/admin" },
  { type: "page", icon: "\u{1F465}", label: "Users", route: "/admin/users" },
  { type: "page", icon: "\u2795", label: "Create User", route: "/admin/users/create" },
  { type: "page", icon: "\u{1F4DC}", label: "Audit Trail", route: "/admin/audit" },
  { type: "page", icon: "\u2699\uFE0F", label: "Settings", route: "/admin/settings" },
  // Sample orders
  { type: "order", icon: "\u{1F4CB}", label: "CR-20260525-0001", sublabel: "Rahim Traders Ltd.", route: "/credit-sales/1", keywords: ["cr-20260525-0001", "rahim"] },
  { type: "order", icon: "\u{1F4CB}", label: "CR-20260525-0002", sublabel: "Karim Flour Depot", route: "/credit-sales/2", keywords: ["cr-20260525-0002", "karim"] },
  { type: "order", icon: "\u{1F4CB}", label: "CR-20260524-0008", sublabel: "Dhaka Bakeries Co.", route: "/credit-sales/3", keywords: ["cr-20260524-0008", "dhaka"] },
  // Sample customers
  { type: "customer", icon: "\u{1F464}", label: "Rahim Traders Ltd.", sublabel: "Credit \xB7 Sirajgonj", route: "/customers/1", keywords: ["rahim", "traders"] },
  { type: "customer", icon: "\u{1F464}", label: "Karim Flour Depot", sublabel: "Credit \xB7 Demra", route: "/customers/2", keywords: ["karim", "flour"] },
  { type: "customer", icon: "\u{1F464}", label: "Dhaka Bakeries Co.", sublabel: "Credit \xB7 Dhaka", route: "/customers/3", keywords: ["dhaka", "bakeries"] },
  { type: "customer", icon: "\u{1F464}", label: "National Biscuit Ltd.", sublabel: "Credit \xB7 Demra", route: "/customers/4", keywords: ["national", "biscuit"] },
  // Sample products
  { type: "product", icon: "\u{1F33E}", label: "2Hati Moida 50kg", sublabel: "\u09F32,200 \xB7 142 bags", route: "/products", keywords: ["2hati", "moida", "50kg"] },
  { type: "product", icon: "\u{1F33E}", label: "1Hati Moida 50kg", sublabel: "\u09F32,000 \xB7 98 bags", route: "/products", keywords: ["1hati", "moida"] },
  { type: "product", icon: "\u{1F33E}", label: "Aam Moida 50kg", sublabel: "\u09F31,850 \xB7 74 bags", route: "/products", keywords: ["aam", "moida"] },
  { type: "product", icon: "\u{1F33F}", label: "Mota Vushi 37kg", sublabel: "\u09F3480 \xB7 88 bags", route: "/products", keywords: ["mota", "vushi", "bran"] },
  // Expense pages + records
  { type: "page", icon: "\u{1F4CB}", label: "Expense History", sublabel: "All submitted expenses", route: "/expenses/history", keywords: ["expense", "history", "all"] },
  { type: "page", icon: "\u{1F5C2}\uFE0F", label: "Expense Vouchers", sublabel: "Voucher listing", route: "/expenses/vouchers", keywords: ["voucher", "expense"] },
  { type: "order", icon: "\u{1F4B8}", label: "EXP-20260525-001", sublabel: "Fuel & Vehicle \xB7 \u09F312,500", route: "/expenses/1", keywords: ["exp", "exp-001", "fuel", "kamal"] },
  { type: "order", icon: "\u{1F4B8}", label: "EXP-20260524-002", sublabel: "Maintenance \xB7 \u09F324,000", route: "/expenses/2", keywords: ["exp", "exp-002", "maintenance", "trk"] },
  { type: "order", icon: "\u{1F4B8}", label: "EXP-20260523-003", sublabel: "Labour & Wages \xB7 \u09F31,20,000", route: "/expenses/3", keywords: ["exp", "exp-003", "labour", "wages"] },
  { type: "order", icon: "\u{1F4B8}", label: "EXP-20260522-004", sublabel: "Office & Admin \xB7 \u09F33,200", route: "/expenses/4", keywords: ["exp", "exp-004", "office"] },
  { type: "order", icon: "\u{1F4B8}", label: "EXP-20260521-005", sublabel: "Utilities \xB7 \u09F318,600", route: "/expenses/5", keywords: ["exp", "exp-005", "electricity"] },
  // Quick actions
  { type: "action", icon: "\u2795", label: "New Credit Order", route: "/credit-sales/create", keywords: ["new", "order", "create"] },
  { type: "action", icon: "\u2795", label: "New Purchase Order", route: "/purchase/orders/create", keywords: ["new", "po", "purchase"] },
  { type: "action", icon: "\u2795", label: "Add Customer", route: "/customers/create", keywords: ["add", "customer", "new"] },
  { type: "action", icon: "\u2795", label: "Record Expense", route: "/expenses/create", keywords: ["expense", "create"] },
  { type: "action", icon: "\u{1F5A5}\uFE0F", label: "Open POS Terminal", route: "/pos", keywords: ["pos", "sale", "counter"] }
];
function useGlobalSearch() {
  const open = ref(false);
  const query = ref("");
  const results = computed(() => {
    if (!query.value.trim()) return INDEX.slice(0, 8);
    const q = query.value.toLowerCase();
    return INDEX.filter(
      (item) => {
        var _a, _b;
        return item.label.toLowerCase().includes(q) || ((_a = item.sublabel) == null ? void 0 : _a.toLowerCase().includes(q)) || ((_b = item.keywords) == null ? void 0 : _b.some((k) => k.includes(q)));
      }
    ).slice(0, 12);
  });
  function show() {
    open.value = true;
    query.value = "";
  }
  function hide() {
    open.value = false;
    query.value = "";
  }
  function toggle() {
    open.value ? hide() : show();
  }
  return { open, query, results, show, hide, toggle };
}
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "AppTopbar",
  __ssrInlineRender: true,
  props: {
    collapsed: { type: Boolean }
  },
  emits: ["toggle-sidebar"],
  setup(__props) {
    const route = useRoute();
    const { user: sessionUser } = useUserSession();
    const isAdminUser = computed(
      () => {
        var _a, _b;
        return ["admin", "superadmin"].includes(((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
      }
    );
    const perms = usePermissions();
    useGlobalSearch();
    useTheme();
    useToast();
    const dropdownOpen = ref(false);
    const notifOpen = ref(false);
    ref(null);
    ref(null);
    const userInitials = computed(() => {
      var _a;
      const name = ((_a = sessionUser.value) == null ? void 0 : _a.name) || "U";
      return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    });
    const routeSegments = computed(() => route.path.split("/").filter(Boolean));
    const currentModule = computed(() => {
      const seg = routeSegments.value[0];
      if (!seg) return "Home";
      return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    });
    const currentPage = computed(() => {
      const seg = routeSegments.value[1];
      if (!seg) return "";
      if (/^\d+$/.test(seg)) return `#${seg}`;
      return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    });
    const now = ref(/* @__PURE__ */ new Date());
    const formattedDate = computed(() => now.value.toLocaleDateString("en-BD", { weekday: "short", day: "numeric", month: "short" }));
    const formattedTime = computed(() => now.value.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" }));
    const notifications = ref([]);
    const bellRing = ref(false);
    const unreadNotifications = computed(() => notifications.value.filter((n) => !n.read));
    const unreadCount = computed(() => unreadNotifications.value.length);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_NuxtLink = __nuxt_component_0$2;
      const _component_ThemePicker = __nuxt_component_1$1;
      _push(`<!--[--><header class="h-16 shrink-0 flex items-center gap-4 px-6 relative z-30" style="${ssrRenderStyle(`background: var(--topbar-bg); backdrop-filter: blur(16px); border-bottom: 1px solid rgb(var(--tint)/0.07);`)}" data-v-1af7769e><button class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150 shrink-0" data-v-1af7769e><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-1af7769e><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" data-v-1af7769e></path></svg></button><div class="hidden sm:flex items-center gap-1.5 text-sm min-w-0" data-v-1af7769e><span class="text-gray-600 truncate" data-v-1af7769e>${ssrInterpolate(unref(currentModule))}</span>`);
      if (unref(currentPage)) {
        _push(`<span class="text-gray-700" data-v-1af7769e>/</span>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(currentPage)) {
        _push(`<span class="text-gray-300 font-medium truncate" data-v-1af7769e>${ssrInterpolate(unref(currentPage))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex-1" data-v-1af7769e></div><button class="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-500 transition-all duration-150 hover:text-gray-300 hover:bg-white/[0.05] shrink-0" style="${ssrRenderStyle({ "border": "1px solid rgba(255,255,255,0.07)", "min-width": "200px" })}" data-v-1af7769e><svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-1af7769e><circle cx="11" cy="11" r="8" data-v-1af7769e></circle><path d="m21 21-4.35-4.35" data-v-1af7769e></path></svg><span class="flex-1 text-left text-xs" data-v-1af7769e>Quick search\u2026</span><kbd class="text-[10px] font-mono text-gray-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]" data-v-1af7769e>\u2318K</kbd></button><button class="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150 shrink-0" title="Appearance settings" data-v-1af7769e><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" data-v-1af7769e><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28-.11-.53-.29-.71-.18-.18-.29-.43-.29-.71 0-.55.45-1 1-1h1.17c2.76 0 5.12-1.93 5.12-5C21 6.48 17.04 2 12 2z" data-v-1af7769e></path><circle cx="7" cy="11.5" r="1.5" fill="currentColor" stroke="none" data-v-1af7769e></circle><circle cx="10" cy="8" r="1.5" fill="currentColor" stroke="none" data-v-1af7769e></circle><circle cx="14" cy="8" r="1.5" fill="currentColor" stroke="none" data-v-1af7769e></circle><circle cx="17" cy="11.5" r="1.5" fill="currentColor" stroke="none" data-v-1af7769e></circle></svg></button>`);
      if (unref(isAdminUser)) {
        _push(`<div class="relative" data-v-1af7769e><button class="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-200 hover:bg-white/[0.07] transition-all duration-150" data-v-1af7769e><svg class="${ssrRenderClass([
          "w-4 h-4 transition-colors duration-300",
          unref(bellRing) ? "animate-bell text-gold-400" : unref(unreadCount) > 0 ? "text-gold-400/70" : ""
        ])}" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" data-v-1af7769e><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" data-v-1af7769e></path></svg>`);
        if (unref(unreadCount) > 0) {
          _push(`<span class="${ssrRenderClass([
            "absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[10px] font-bold px-1",
            unref(bellRing) ? "animate-pulse" : ""
          ])}" style="${ssrRenderStyle(`background: linear-gradient(135deg, var(--accent-from), var(--accent-to)); color: var(--accent-text)`)}" data-v-1af7769e>${ssrInterpolate(unref(unreadCount) > 9 ? "9+" : unref(unreadCount))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
        if (unref(notifOpen)) {
          _push(`<div class="absolute right-0 top-full mt-2 w-84 rounded-2xl overflow-hidden z-50" style="${ssrRenderStyle({ "background": "rgba(22,22,22,0.97)", "backdrop-filter": "blur(20px)", "border": "1px solid rgba(255,255,255,0.08)", "box-shadow": "0 16px 48px rgba(0,0,0,0.6)", "width": "340px" })}" data-v-1af7769e><div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]" data-v-1af7769e><p class="text-sm font-semibold text-gray-200" data-v-1af7769e>Notifications</p><div class="flex items-center gap-2" data-v-1af7769e>`);
          if (unref(unreadCount) > 0) {
            _push(`<span class="badge text-[10px] px-2 py-0.5 rounded-full font-bold" style="${ssrRenderStyle(`background:linear-gradient(135deg,var(--accent-from),var(--accent-to));color:var(--accent-text)`)}" data-v-1af7769e>${ssrInterpolate(unref(unreadCount))} new </span>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(unreadCount) > 0) {
            _push(`<button class="text-[10px] text-gray-500 hover:text-gray-300 transition-colors" data-v-1af7769e> Mark all read </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="divide-y divide-white/[0.04] max-h-72 overflow-y-auto" data-v-1af7769e><!--[-->`);
          ssrRenderList(unref(unreadNotifications), (n) => {
            _push(`<div class="flex gap-3 px-4 py-3 cursor-pointer transition-colors group hover:bg-white/[0.04]" data-v-1af7769e><div class="${ssrRenderClass([n.type === "warning" ? "bg-yellow-400" : n.type === "error" ? "bg-red-400" : n.type === "info" ? "bg-blue-400" : "bg-emerald-400", "w-2 h-2 rounded-full mt-1.5 shrink-0 transition-transform group-hover:scale-125"])}" data-v-1af7769e></div><div class="flex-1 min-w-0" data-v-1af7769e><p class="text-xs text-gray-300 leading-snug" data-v-1af7769e>${ssrInterpolate(n.text)}</p><p class="text-[10px] text-gray-600 mt-0.5" data-v-1af7769e>${ssrInterpolate(n.time)}</p></div><div class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style="${ssrRenderStyle({ "background": "var(--accent-from)" })}" data-v-1af7769e></div><svg class="w-3 h-3 text-gray-700 mt-1.5 shrink-0 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-1af7769e><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" data-v-1af7769e></path></svg></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(unreadNotifications).length) {
            _push(`<div class="px-4 py-8 text-center text-xs text-gray-600" data-v-1af7769e> All caught up \u{1F389} </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="px-4 py-2.5 border-t border-white/[0.06] flex justify-between items-center" data-v-1af7769e>`);
          if (unref(perms).canAccessRoute("/admin/audit")) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: "/admin/audit",
              onClick: ($event) => notifOpen.value = false,
              class: "text-xs transition-colors",
              style: { "color": "var(--accent-from)" }
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` View full audit log \u2192 `);
                } else {
                  return [
                    createTextVNode(" View full audit log \u2192 ")
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(`<span data-v-1af7769e></span>`);
          }
          if (unref(unreadNotifications).length) {
            _push(`<button class="text-[10px] text-gray-600 hover:text-gray-400" data-v-1af7769e>Clear all</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="hidden lg:flex flex-col items-end shrink-0" data-v-1af7769e><span class="text-xs font-medium text-gray-300" data-v-1af7769e>${ssrInterpolate(unref(formattedDate))}</span><span class="text-[11px] text-gray-600" data-v-1af7769e>${ssrInterpolate(unref(formattedTime))}</span></div><div class="relative" data-v-1af7769e><button class="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-white/[0.07] transition-all duration-150 shrink-0" data-v-1af7769e><div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style="${ssrRenderStyle(`background: linear-gradient(135deg, var(--accent-from), var(--accent-to)); color: var(--accent-text)`)}" data-v-1af7769e>${ssrInterpolate(unref(userInitials))}</div><div class="hidden md:flex flex-col items-start" data-v-1af7769e><span class="text-xs font-semibold text-gray-200 leading-tight" data-v-1af7769e>${ssrInterpolate(((_a = unref(sessionUser)) == null ? void 0 : _a.name) || "User")}</span><span class="text-[10px] text-gray-500 leading-tight font-mono" data-v-1af7769e>${ssrInterpolate(((_b = unref(sessionUser)) == null ? void 0 : _b.role) || "")}</span></div><svg class="w-3 h-3 text-gray-600 ml-0.5 hidden md:block" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-1af7769e><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" data-v-1af7769e></path></svg></button>`);
      if (unref(dropdownOpen)) {
        _push(`<div class="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50" style="${ssrRenderStyle({ "background": "rgba(22,22,22,0.97)", "backdrop-filter": "blur(20px)", "border": "1px solid rgba(255,255,255,0.08)", "box-shadow": "0 16px 48px rgba(0,0,0,0.6)" })}" data-v-1af7769e><div class="p-3 border-b border-white/[0.06]" data-v-1af7769e><p class="text-sm font-semibold text-gray-100" data-v-1af7769e>${ssrInterpolate((_c = unref(sessionUser)) == null ? void 0 : _c.name)}</p><p class="text-xs text-gray-500 mt-0.5" data-v-1af7769e>${ssrInterpolate((_d = unref(sessionUser)) == null ? void 0 : _d.email)}</p><p class="text-[10px] font-mono text-gold-500/80 mt-0.5" data-v-1af7769e>${ssrInterpolate((_e = unref(sessionUser)) == null ? void 0 : _e.role)}</p></div><div class="p-1.5 space-y-0.5" data-v-1af7769e>`);
        if (unref(perms).canAccessRoute("/admin/settings")) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/admin/settings",
            class: "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-all duration-150"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-1af7769e${_scopeId}><circle cx="12" cy="12" r="3" data-v-1af7769e${_scopeId}></circle><path d="M19.07 4.93l-1.41 1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" data-v-1af7769e${_scopeId}></path></svg> Settings `);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    class: "w-3.5 h-3.5",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("circle", {
                      cx: "12",
                      cy: "12",
                      r: "3"
                    }),
                    createVNode("path", { d: "M19.07 4.93l-1.41 1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2" })
                  ])),
                  createTextVNode(" Settings ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-all duration-150" data-v-1af7769e><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" data-v-1af7769e><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28-.11-.53-.29-.71-.18-.18-.29-.43-.29-.71 0-.55.45-1 1-1h1.17c2.76 0 5.12-1.93 5.12-5C21 6.48 17.04 2 12 2z" data-v-1af7769e></path><circle cx="7" cy="11.5" r="1.5" fill="currentColor" stroke="none" data-v-1af7769e></circle><circle cx="10" cy="8" r="1.5" fill="currentColor" stroke="none" data-v-1af7769e></circle><circle cx="14" cy="8" r="1.5" fill="currentColor" stroke="none" data-v-1af7769e></circle><circle cx="17" cy="11.5" r="1.5" fill="currentColor" stroke="none" data-v-1af7769e></circle></svg> Appearance </button><button class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-100 hover:bg-white/[0.06] transition-all duration-150" data-v-1af7769e><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-1af7769e><circle cx="11" cy="11" r="8" data-v-1af7769e></circle><path d="m21 21-4.35-4.35" data-v-1af7769e></path></svg> Search <kbd class="ml-auto text-[10px] font-mono text-gray-600" data-v-1af7769e>\u2318K</kbd></button></div><div class="p-1.5 border-t border-white/[0.06]" data-v-1af7769e><button class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150" data-v-1af7769e><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-1af7769e><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" data-v-1af7769e></path></svg> Sign out </button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></header>`);
      _push(ssrRenderComponent(_component_ThemePicker, null, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppTopbar.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-1af7769e"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "GlobalSearch",
  __ssrInlineRender: true,
  setup(__props) {
    const { open, query, results } = useGlobalSearch();
    useRouter();
    const cursor = ref(0);
    const inputRef = ref();
    watch(open, (v) => {
      if (v) nextTick(() => {
        var _a;
        return (_a = inputRef.value) == null ? void 0 : _a.focus();
      });
      cursor.value = 0;
    });
    watch(query, () => {
      cursor.value = 0;
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(open)) {
          _push2(`<div class="fixed inset-0 z-[150] flex items-start justify-center pt-[12vh] px-4" data-v-f3bbda6d><div class="absolute inset-0 bg-black/60 backdrop-blur-sm" data-v-f3bbda6d></div><div class="relative w-full max-w-2xl animate-slide-up" data-v-f3bbda6d><div class="rounded-2xl overflow-hidden border border-white/[0.10]" style="${ssrRenderStyle({ "background": "rgba(22,18,14,0.97)", "box-shadow": "0 32px 80px rgba(0,0,0,0.8)" })}" data-v-f3bbda6d><div class="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]" data-v-f3bbda6d><svg class="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-f3bbda6d><circle cx="11" cy="11" r="8" data-v-f3bbda6d></circle><path d="m21 21-4.35-4.35" data-v-f3bbda6d></path></svg><input${ssrRenderAttr("value", unref(query))} class="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none" placeholder="Search orders, customers, pages\u2026" data-v-f3bbda6d><kbd class="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-gray-600 font-mono border border-white/[0.08]" data-v-f3bbda6d>ESC</kbd></div><div class="max-h-[420px] overflow-y-auto py-2" data-v-f3bbda6d>`);
          if (!unref(query).trim()) {
            _push2(`<p class="px-4 pt-1 pb-2 text-[10px] uppercase tracking-widest text-gray-700 font-semibold" data-v-f3bbda6d>Quick navigation</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<!--[-->`);
          ssrRenderList(unref(results), (item, idx) => {
            _push2(`<div class="${ssrRenderClass([
              "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-75",
              unref(cursor) !== idx && "hover:bg-white/[0.03]"
            ])}" style="${ssrRenderStyle(unref(cursor) === idx ? "background:rgb(var(--accent)/0.10)" : "")}" data-v-f3bbda6d><span class="text-lg w-7 text-center shrink-0" data-v-f3bbda6d>${ssrInterpolate(item.icon)}</span><div class="flex-1 min-w-0" data-v-f3bbda6d><p class="${ssrRenderClass([unref(cursor) !== idx && "text-gray-200", "text-sm font-medium truncate"])}" style="${ssrRenderStyle(unref(cursor) === idx ? "color:var(--accent-from)" : "")}" data-v-f3bbda6d>${ssrInterpolate(item.label)}</p>`);
            if (item.sublabel) {
              _push2(`<p class="text-xs text-gray-600 truncate" data-v-f3bbda6d>${ssrInterpolate(item.sublabel)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><span class="text-[10px] text-gray-700 uppercase tracking-wider shrink-0" data-v-f3bbda6d>${ssrInterpolate(item.type)}</span></div>`);
          });
          _push2(`<!--]-->`);
          if (!unref(results).length) {
            _push2(`<div class="px-4 py-8 text-center" data-v-f3bbda6d><p class="text-sm text-gray-600" data-v-f3bbda6d>No results for &quot;<span class="text-gray-400" data-v-f3bbda6d>${ssrInterpolate(unref(query))}</span>&quot;</p></div>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06]" data-v-f3bbda6d><span class="text-[10px] text-gray-700 flex items-center gap-1.5" data-v-f3bbda6d><kbd class="px-1 py-0.5 rounded bg-white/[0.07] font-mono border border-white/[0.08]" data-v-f3bbda6d>\u2191\u2193</kbd> navigate </span><span class="text-[10px] text-gray-700 flex items-center gap-1.5" data-v-f3bbda6d><kbd class="px-1 py-0.5 rounded bg-white/[0.07] font-mono border border-white/[0.08]" data-v-f3bbda6d>\u21B5</kbd> go </span><span class="ml-auto text-[10px] text-gray-700" data-v-f3bbda6d>${ssrInterpolate(unref(results).length)} results</span></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/GlobalSearch.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-f3bbda6d"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ToastContainer",
  __ssrInlineRender: true,
  setup(__props) {
    const { toasts } = useToast();
    function toastClass(type) {
      var _a;
      return (_a = {
        success: "bg-emerald-950/90 border-emerald-500/30 text-emerald-100",
        error: "bg-red-950/90 border-red-500/30 text-red-100",
        warning: "bg-yellow-950/90 border-yellow-500/30 text-yellow-100",
        info: "bg-blue-950/90 border-blue-500/30 text-blue-100"
      }[type]) != null ? _a : "bg-surface-300/90 border-white/10 text-gray-200";
    }
    function titleClass(type) {
      var _a;
      return (_a = {
        success: "text-emerald-300",
        error: "text-red-300",
        warning: "text-yellow-300",
        info: "text-blue-300"
      }[type]) != null ? _a : "text-gray-200";
    }
    function toastIcon(type) {
      var _a;
      return (_a = { success: "\u2705", error: "\u274C", warning: "\u26A0\uFE0F", info: "\u2139\uFE0F" }[type]) != null ? _a : "\u{1F4AC}";
    }
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 pointer-events-none" style="${ssrRenderStyle({ "max-width": "360px", "width": "100%" })}" data-v-c91474eb><!--[-->`);
        ssrRenderList(unref(toasts), (t) => {
          _push2(`<div class="${ssrRenderClass([toastClass(t.type), "pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-2xl border backdrop-blur-xl"])}" data-v-c91474eb><span class="text-lg shrink-0 mt-0.5" data-v-c91474eb>${ssrInterpolate(toastIcon(t.type))}</span><div class="flex-1 min-w-0" data-v-c91474eb><p class="${ssrRenderClass([titleClass(t.type), "text-sm font-semibold leading-snug"])}" data-v-c91474eb>${ssrInterpolate(t.title)}</p>`);
          if (t.message) {
            _push2(`<p class="text-xs opacity-75 mt-0.5 leading-relaxed" data-v-c91474eb>${ssrInterpolate(t.message)}</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><button class="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5" data-v-c91474eb><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-c91474eb><path d="M6 18L18 6M6 6l12 12" data-v-c91474eb></path></svg></button></div>`);
        });
        _push2(`<!--]--></div>`);
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/ToastContainer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-c91474eb"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const sidebarCollapsed = ref(false);
    const mobileSidebarOpen = ref(false);
    function onToggleSidebar() {
      if ((void 0).innerWidth < 1024) {
        mobileSidebarOpen.value = !mobileSidebarOpen.value;
      } else {
        sidebarCollapsed.value = !sidebarCollapsed.value;
      }
    }
    const route = useRoute();
    watch(() => route.path, () => {
      mobileSidebarOpen.value = false;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppSidebar = __nuxt_component_0;
      const _component_AppTopbar = __nuxt_component_1;
      const _component_NuxtPage = __nuxt_component_2;
      const _component_GlobalSearch = __nuxt_component_3;
      const _component_UiToastContainer = __nuxt_component_4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-screen overflow-hidden" }, _attrs))} data-v-6c6c6e60>`);
      if (unref(mobileSidebarOpen)) {
        _push(`<div class="fixed inset-0 z-30 bg-black/60 lg:hidden" data-v-6c6c6e60></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_AppSidebar, {
        collapsed: unref(sidebarCollapsed),
        "mobile-open": unref(mobileSidebarOpen),
        onToggle: ($event) => sidebarCollapsed.value = !unref(sidebarCollapsed),
        onCloseMobile: ($event) => mobileSidebarOpen.value = false
      }, null, _parent));
      _push(`<div class="${ssrRenderClass([unref(sidebarCollapsed) ? "lg:ml-[72px]" : "lg:ml-[260px]", "flex flex-col flex-1 min-w-0 transition-all duration-300 ml-0"])}" data-v-6c6c6e60>`);
      _push(ssrRenderComponent(_component_AppTopbar, {
        collapsed: unref(sidebarCollapsed),
        onToggleSidebar
      }, null, _parent));
      _push(`<main class="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 animate-fade-in" data-v-6c6c6e60>`);
      _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
      _push(`</main></div>`);
      _push(ssrRenderComponent(_component_GlobalSearch, null, null, _parent));
      _push(ssrRenderComponent(_component_UiToastContainer, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6c6c6e60"]]);

export { _default as default };
//# sourceMappingURL=default-qeqOAO6Q.mjs.map
