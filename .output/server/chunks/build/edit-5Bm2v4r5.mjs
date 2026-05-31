import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, computed, reactive, watch, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderDynamicModel, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
import { j as useRoute } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useToast();
    const userId = Number(route.params.id);
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/admin/users/${userId}`,
      "$vV1oKbjyIy"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const user = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.user) != null ? _b : {};
    });
    const form = reactive({
      name: "",
      email: "",
      role: "",
      status: "active",
      telegram: "",
      telegramEnabled: false,
      newPassword: "",
      confirmPassword: ""
    });
    watch(user, (u) => {
      if (u == null ? void 0 : u.id) {
        form.name = u.display_name;
        form.email = u.email;
        form.role = u.role;
        form.status = u.status;
      }
    }, { immediate: true });
    const showPass = ref(false);
    const saving = ref(false);
    const passwordOk = computed(
      () => !form.newPassword || form.newPassword.length >= 8 && form.newPassword === form.confirmPassword
    );
    const isValid = computed(() => form.name && form.email && form.role && passwordOk.value);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Edit User \u2014 ${(_b = (_a = unref(user)) == null ? void 0 : _a.display_name) != null ? _b : "\u2026"}`,
        breadcrumb: ["Admin", "Users", (_d = (_c = unref(user)) == null ? void 0 : _c.display_name) != null ? _d : "\u2026", "Edit"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/admin/users",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 All Users`);
                } else {
                  return [
                    createTextVNode("\u2190 All Users")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: `/admin/users/${unref(route).params.id}/permissions`,
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u{1F511} Permissions`);
                } else {
                  return [
                    createTextVNode("\u{1F511} Permissions")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/admin/users",
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u2190 All Users")
                ]),
                _: 1
              }),
              createVNode(_component_NuxtLink, {
                to: `/admin/users/${unref(route).params.id}/permissions`,
                class: "btn-ghost text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u{1F511} Permissions")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Account Details</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name *</label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email *</label><input${ssrRenderAttr("value", unref(form).email)} type="email" class="input-glass font-mono"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role *</label><select class="input-glass"><optgroup label="System"><option value="Superadmin"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Superadmin") : ssrLooseEqual(unref(form).role, "Superadmin")) ? " selected" : ""}>Superadmin</option><option value="admin"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "admin") : ssrLooseEqual(unref(form).role, "admin")) ? " selected" : ""}>Admin</option></optgroup><optgroup label="Accounts"><option value="Accounts"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Accounts") : ssrLooseEqual(unref(form).role, "Accounts")) ? " selected" : ""}>Accounts (All branches)</option><option value="accounts-srg"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accounts-srg") : ssrLooseEqual(unref(form).role, "accounts-srg")) ? " selected" : ""}>Accounts \u2014 Sirajgonj</option><option value="accounts-demra"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accounts-demra") : ssrLooseEqual(unref(form).role, "accounts-demra")) ? " selected" : ""}>Accounts \u2014 Demra</option><option value="accountspos-srg"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accountspos-srg") : ssrLooseEqual(unref(form).role, "accountspos-srg")) ? " selected" : ""}>Accounts POS \u2014 Sirajgonj</option><option value="accountspos-demra"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accountspos-demra") : ssrLooseEqual(unref(form).role, "accountspos-demra")) ? " selected" : ""}>Accounts POS \u2014 Demra</option></optgroup><optgroup label="Sales"><option value="sales-srg"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-srg") : ssrLooseEqual(unref(form).role, "sales-srg")) ? " selected" : ""}>Sales \u2014 Sirajgonj</option><option value="sales-demra"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-demra") : ssrLooseEqual(unref(form).role, "sales-demra")) ? " selected" : ""}>Sales \u2014 Demra</option><option value="sales-other"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-other") : ssrLooseEqual(unref(form).role, "sales-other")) ? " selected" : ""}>Sales \u2014 Other</option></optgroup><optgroup label="Production"><option value="production manager-srg"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "production manager-srg") : ssrLooseEqual(unref(form).role, "production manager-srg")) ? " selected" : ""}>Production Manager \u2014 Sirajgonj</option><option value="production manager-demra"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "production manager-demra") : ssrLooseEqual(unref(form).role, "production manager-demra")) ? " selected" : ""}>Production Manager \u2014 Demra</option></optgroup><optgroup label="Dispatch"><option value="dispatch-srg"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatch-srg") : ssrLooseEqual(unref(form).role, "dispatch-srg")) ? " selected" : ""}>Dispatch \u2014 Sirajgonj</option><option value="dispatch-demra"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatch-demra") : ssrLooseEqual(unref(form).role, "dispatch-demra")) ? " selected" : ""}>Dispatch \u2014 Demra</option><option value="dispatchpos-srg"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatchpos-srg") : ssrLooseEqual(unref(form).role, "dispatchpos-srg")) ? " selected" : ""}>Dispatch POS \u2014 Sirajgonj</option><option value="dispatchpos-demra"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatchpos-demra") : ssrLooseEqual(unref(form).role, "dispatchpos-demra")) ? " selected" : ""}>Dispatch POS \u2014 Demra</option></optgroup><optgroup label="Operations"><option value="collector"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "collector") : ssrLooseEqual(unref(form).role, "collector")) ? " selected" : ""}>Collector</option><option value="Transport Manager"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Transport Manager") : ssrLooseEqual(unref(form).role, "Transport Manager")) ? " selected" : ""}>Transport Manager</option><option value="Expense Initiator"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Expense Initiator") : ssrLooseEqual(unref(form).role, "Expense Initiator")) ? " selected" : ""}>Expense Initiator</option><option value="Expense Approver"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Expense Approver") : ssrLooseEqual(unref(form).role, "Expense Approver")) ? " selected" : ""}>Expense Approver</option><option value="Bank Transaction Initiator"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Bank Transaction Initiator") : ssrLooseEqual(unref(form).role, "Bank Transaction Initiator")) ? " selected" : ""}>Bank Transaction Initiator</option><option value="Bank Transaction Approver"${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Bank Transaction Approver") : ssrLooseEqual(unref(form).role, "Bank Transaction Approver")) ? " selected" : ""}>Bank Transaction Approver</option></optgroup></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</label><select class="input-glass"><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="pending"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "pending") : ssrLooseEqual(unref(form).status, "pending")) ? " selected" : ""}>Pending</option><option value="suspended"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "suspended") : ssrLooseEqual(unref(form).status, "suspended")) ? " selected" : ""}>Suspended</option></select></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label><input${ssrRenderAttr("value", unref(form).phone)} type="tel" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telegram Username</label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span><input${ssrRenderAttr("value", unref(form).telegram)} type="text" class="input-glass pl-7 font-mono" placeholder="username"></div></div></div><div class="flex items-center gap-3"><label class="relative inline-flex items-center cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).telegramEnabled) ? ssrLooseContain(unref(form).telegramEnabled, null) : unref(form).telegramEnabled) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label><span class="text-sm text-gray-300">Enable Telegram notifications</span></div></div><div class="glass-card p-6 space-y-4"><h3 class="section-title">Change Password</h3><p class="text-xs text-gray-500">Leave blank to keep the current password.</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Password</label><div class="relative"><input${ssrRenderDynamicModel(unref(showPass) ? "text" : "password", unref(form).newPassword, null)}${ssrRenderAttr("type", unref(showPass) ? "text" : "password")} class="input-glass pr-10" placeholder="Min 8 characters"><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">`);
      if (!unref(showPass)) {
        _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`);
      } else {
        _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"></path><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`);
      }
      _push(`</button></div></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Confirm New Password</label><input${ssrRenderDynamicModel(unref(showPass) ? "text" : "password", unref(form).confirmPassword, null)}${ssrRenderAttr("type", unref(showPass) ? "text" : "password")} class="input-glass"></div></div>`);
      if (unref(form).newPassword && unref(form).newPassword !== unref(form).confirmPassword) {
        _push(`<p class="text-xs text-red-400">Passwords do not match</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center gap-3"><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Changes")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/users",
        class: "btn-ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cancel`);
          } else {
            return [
              createTextVNode("Cancel")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="space-y-5"><div class="glass-card p-5 space-y-4"><h3 class="text-sm font-semibold text-gray-300">User Info</h3><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, #f59e0b, #d97706)" })}">${ssrInterpolate(((_f = (_e = unref(user)) == null ? void 0 : _e.display_name) != null ? _f : "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase())}</div><div><p class="text-sm font-bold text-gray-200">${ssrInterpolate((_h = (_g = unref(user)) == null ? void 0 : _g.display_name) != null ? _h : "\u2014")}</p><p class="text-xs text-gray-500 font-mono">${ssrInterpolate((_j = (_i = unref(user)) == null ? void 0 : _i.role) != null ? _j : "\u2014")}</p></div></div><div class="space-y-2 text-xs"><div class="flex justify-between"><span class="text-gray-600">User ID</span><span class="font-mono text-gray-400">#${ssrInterpolate(unref(route).params.id)}</span></div><div class="flex justify-between"><span class="text-gray-600">Status</span>`);
      _push(ssrRenderComponent(_component_UiStatusBadge, {
        status: (_l = (_k = unref(user)) == null ? void 0 : _k.status) != null ? _l : "active"
      }, null, _parent));
      _push(`</div><div class="flex justify-between"><span class="text-gray-600">Joined</span><span class="text-gray-400">${ssrInterpolate((_o = (_n = (_m = unref(user)) == null ? void 0 : _m.created_at) == null ? void 0 : _n.slice(0, 10)) != null ? _o : "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Last Login</span><span class="text-gray-400">${ssrInterpolate((_q = (_p = unref(user)) == null ? void 0 : _p.last_login) != null ? _q : "\u2014")}</span></div></div></div><div class="glass-card p-5 space-y-3"><h3 class="text-sm font-semibold text-gray-300">Danger Zone</h3><button class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"></path></svg> Suspend this account </button><button class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-all"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14H6L5 6"></path></svg> Delete this account </button></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=edit-5Bm2v4r5.mjs.map
