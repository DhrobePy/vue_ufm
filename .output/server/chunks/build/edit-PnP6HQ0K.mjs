import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, withAsyncContext, computed, reactive, watch, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderDynamicModel, ssrInterpolate, ssrRenderStyle, ssrRenderTeleport } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute, l as useRouter } from './server.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    useRouter();
    useToast();
    const userId = Number(route.params.id);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/admin/users/${userId}`,
      "$vV1oKbjyIy"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const user = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.user) != null ? _b : {};
    });
    const initials = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = user.value) == null ? void 0 : _a.display_name) != null ? _b : "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      }
    );
    const form = reactive({
      name: "",
      email: "",
      role: "",
      status: "active",
      phone: "",
      telegram: "",
      newPassword: "",
      confirmPassword: ""
    });
    watch(user, (u) => {
      var _a, _b, _c, _d;
      if (u == null ? void 0 : u.id) {
        form.name = (_a = u.display_name) != null ? _a : "";
        form.email = (_b = u.email) != null ? _b : "";
        form.role = (_c = u.role) != null ? _c : "";
        form.status = (_d = u.status) != null ? _d : "active";
      }
    }, { immediate: true });
    const showPass = ref(false);
    const saving = ref(false);
    const passwordOk = computed(
      () => !form.newPassword || form.newPassword.length >= 8 && form.newPassword === form.confirmPassword
    );
    const isValid = computed(() => form.name && form.email && form.role && passwordOk.value);
    const suspending = ref(false);
    const deleting = ref(false);
    const confirmDeleteModal = ref(false);
    const deleteConfirmText = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-f39e765a>`);
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
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-f39e765a><div class="lg:col-span-2 space-y-5" data-v-f39e765a><div class="glass-card p-6 space-y-5" data-v-f39e765a><h3 class="section-title" data-v-f39e765a>Account Details</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-f39e765a><div class="space-y-1.5" data-v-f39e765a><label class="form-label" data-v-f39e765a>Full Name *</label><input${ssrRenderAttr("value", unref(form).name)} type="text" class="input-glass" data-v-f39e765a></div><div class="space-y-1.5" data-v-f39e765a><label class="form-label" data-v-f39e765a>Email *</label><input${ssrRenderAttr("value", unref(form).email)} type="email" class="input-glass font-mono" data-v-f39e765a></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-f39e765a><div class="space-y-1.5" data-v-f39e765a><label class="form-label" data-v-f39e765a>Role *</label><select class="input-glass" data-v-f39e765a><optgroup label="System" data-v-f39e765a><option value="Superadmin" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Superadmin") : ssrLooseEqual(unref(form).role, "Superadmin")) ? " selected" : ""}>Superadmin</option><option value="admin" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "admin") : ssrLooseEqual(unref(form).role, "admin")) ? " selected" : ""}>Admin</option></optgroup><optgroup label="Accounts" data-v-f39e765a><option value="Accounts" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Accounts") : ssrLooseEqual(unref(form).role, "Accounts")) ? " selected" : ""}>Accounts (All branches)</option><option value="accounts-srg" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accounts-srg") : ssrLooseEqual(unref(form).role, "accounts-srg")) ? " selected" : ""}>Accounts \u2014 Sirajgonj</option><option value="accounts-demra" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accounts-demra") : ssrLooseEqual(unref(form).role, "accounts-demra")) ? " selected" : ""}>Accounts \u2014 Demra</option><option value="accountspos-srg" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accountspos-srg") : ssrLooseEqual(unref(form).role, "accountspos-srg")) ? " selected" : ""}>Accounts POS \u2014 Sirajgonj</option><option value="accountspos-demra" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accountspos-demra") : ssrLooseEqual(unref(form).role, "accountspos-demra")) ? " selected" : ""}>Accounts POS \u2014 Demra</option></optgroup><optgroup label="Sales" data-v-f39e765a><option value="sales-srg" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-srg") : ssrLooseEqual(unref(form).role, "sales-srg")) ? " selected" : ""}>Sales \u2014 Sirajgonj</option><option value="sales-demra" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-demra") : ssrLooseEqual(unref(form).role, "sales-demra")) ? " selected" : ""}>Sales \u2014 Demra</option><option value="sales-other" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-other") : ssrLooseEqual(unref(form).role, "sales-other")) ? " selected" : ""}>Sales \u2014 Other</option></optgroup><optgroup label="Production" data-v-f39e765a><option value="production manager-srg" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "production manager-srg") : ssrLooseEqual(unref(form).role, "production manager-srg")) ? " selected" : ""}>Production Manager \u2014 Sirajgonj</option><option value="production manager-demra" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "production manager-demra") : ssrLooseEqual(unref(form).role, "production manager-demra")) ? " selected" : ""}>Production Manager \u2014 Demra</option></optgroup><optgroup label="Dispatch" data-v-f39e765a><option value="dispatch-srg" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatch-srg") : ssrLooseEqual(unref(form).role, "dispatch-srg")) ? " selected" : ""}>Dispatch \u2014 Sirajgonj</option><option value="dispatch-demra" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatch-demra") : ssrLooseEqual(unref(form).role, "dispatch-demra")) ? " selected" : ""}>Dispatch \u2014 Demra</option><option value="dispatchpos-srg" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatchpos-srg") : ssrLooseEqual(unref(form).role, "dispatchpos-srg")) ? " selected" : ""}>Dispatch POS \u2014 Sirajgonj</option><option value="dispatchpos-demra" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatchpos-demra") : ssrLooseEqual(unref(form).role, "dispatchpos-demra")) ? " selected" : ""}>Dispatch POS \u2014 Demra</option></optgroup><optgroup label="Operations" data-v-f39e765a><option value="collector" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "collector") : ssrLooseEqual(unref(form).role, "collector")) ? " selected" : ""}>Collector</option><option value="Transport Manager" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Transport Manager") : ssrLooseEqual(unref(form).role, "Transport Manager")) ? " selected" : ""}>Transport Manager</option><option value="Expense Initiator" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Expense Initiator") : ssrLooseEqual(unref(form).role, "Expense Initiator")) ? " selected" : ""}>Expense Initiator</option><option value="Expense Approver" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Expense Approver") : ssrLooseEqual(unref(form).role, "Expense Approver")) ? " selected" : ""}>Expense Approver</option><option value="Bank Transaction Initiator" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Bank Transaction Initiator") : ssrLooseEqual(unref(form).role, "Bank Transaction Initiator")) ? " selected" : ""}>Bank Transaction Initiator</option><option value="Bank Transaction Approver" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Bank Transaction Approver") : ssrLooseEqual(unref(form).role, "Bank Transaction Approver")) ? " selected" : ""}>Bank Transaction Approver</option></optgroup></select></div><div class="space-y-1.5" data-v-f39e765a><label class="form-label" data-v-f39e765a>Status</label><select class="input-glass" data-v-f39e765a><option value="active" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="pending" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "pending") : ssrLooseEqual(unref(form).status, "pending")) ? " selected" : ""}>Pending</option><option value="suspended" data-v-f39e765a${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "suspended") : ssrLooseEqual(unref(form).status, "suspended")) ? " selected" : ""}>Suspended</option></select></div></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-f39e765a><div class="space-y-1.5" data-v-f39e765a><label class="form-label" data-v-f39e765a>Phone</label><input${ssrRenderAttr("value", unref(form).phone)} type="tel" class="input-glass" placeholder="+880\u2026" data-v-f39e765a></div><div class="space-y-1.5" data-v-f39e765a><label class="form-label" data-v-f39e765a>Telegram Username</label><div class="relative" data-v-f39e765a><span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" data-v-f39e765a>@</span><input${ssrRenderAttr("value", unref(form).telegram)} type="text" class="input-glass pl-7 font-mono" placeholder="username" data-v-f39e765a></div></div></div></div><div class="glass-card p-6 space-y-4" data-v-f39e765a><h3 class="section-title" data-v-f39e765a>Change Password</h3><p class="text-xs text-gray-500" data-v-f39e765a>Leave blank to keep the current password.</p><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-f39e765a><div class="space-y-1.5" data-v-f39e765a><label class="form-label" data-v-f39e765a>New Password</label><div class="relative" data-v-f39e765a><input${ssrRenderDynamicModel(unref(showPass) ? "text" : "password", unref(form).newPassword, null)}${ssrRenderAttr("type", unref(showPass) ? "text" : "password")} class="input-glass pr-10" placeholder="Min 8 characters" data-v-f39e765a><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" data-v-f39e765a>`);
      if (!unref(showPass)) {
        _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-f39e765a><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-v-f39e765a></path><circle cx="12" cy="12" r="3" data-v-f39e765a></circle></svg>`);
      } else {
        _push(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-f39e765a><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" data-v-f39e765a></path><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" data-v-f39e765a></path><line x1="1" y1="1" x2="23" y2="23" data-v-f39e765a></line></svg>`);
      }
      _push(`</button></div></div><div class="space-y-1.5" data-v-f39e765a><label class="form-label" data-v-f39e765a>Confirm New Password</label><input${ssrRenderDynamicModel(unref(showPass) ? "text" : "password", unref(form).confirmPassword, null)}${ssrRenderAttr("type", unref(showPass) ? "text" : "password")} class="input-glass" data-v-f39e765a></div></div>`);
      if (unref(form).newPassword && unref(form).newPassword !== unref(form).confirmPassword) {
        _push(`<p class="text-xs text-red-400" data-v-f39e765a>Passwords do not match</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center gap-3" data-v-f39e765a><button${ssrIncludeBooleanAttr(!unref(isValid) || unref(saving)) ? " disabled" : ""} class="btn-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" data-v-f39e765a>`);
      if (unref(saving)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" data-v-f39e765a><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-f39e765a></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" data-v-f39e765a></path></svg>`);
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
      _push(`</div></div><div class="space-y-5" data-v-f39e765a><div class="glass-card p-5 space-y-4" data-v-f39e765a><h3 class="text-sm font-semibold text-gray-300" data-v-f39e765a>User Info</h3><div class="flex items-center gap-3" data-v-f39e765a><div class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, #f59e0b, #d97706)" })}" data-v-f39e765a>${ssrInterpolate(unref(initials))}</div><div data-v-f39e765a><p class="text-sm font-bold text-gray-200" data-v-f39e765a>${ssrInterpolate((_f = (_e = unref(user)) == null ? void 0 : _e.display_name) != null ? _f : "\u2014")}</p><p class="text-xs text-gray-500 font-mono" data-v-f39e765a>${ssrInterpolate((_h = (_g = unref(user)) == null ? void 0 : _g.role) != null ? _h : "\u2014")}</p></div></div><div class="space-y-2 text-xs" data-v-f39e765a><div class="flex justify-between" data-v-f39e765a><span class="text-gray-600" data-v-f39e765a>User ID</span><span class="font-mono text-gray-400" data-v-f39e765a>#${ssrInterpolate(unref(route).params.id)}</span></div><div class="flex justify-between items-center" data-v-f39e765a><span class="text-gray-600" data-v-f39e765a>Status</span>`);
      _push(ssrRenderComponent(_component_UiStatusBadge, {
        status: (_j = (_i = unref(user)) == null ? void 0 : _i.status) != null ? _j : "active"
      }, null, _parent));
      _push(`</div><div class="flex justify-between" data-v-f39e765a><span class="text-gray-600" data-v-f39e765a>Joined</span><span class="text-gray-400" data-v-f39e765a>${ssrInterpolate((_m = (_l = (_k = unref(user)) == null ? void 0 : _k.created_at) == null ? void 0 : _l.slice(0, 10)) != null ? _m : "\u2014")}</span></div><div class="flex justify-between" data-v-f39e765a><span class="text-gray-600" data-v-f39e765a>Last Login</span><span class="text-gray-400" data-v-f39e765a>${ssrInterpolate((_o = (_n = unref(user)) == null ? void 0 : _n.last_login) != null ? _o : "Never")}</span></div></div></div><div class="glass-card p-5 space-y-3" style="${ssrRenderStyle({ "border": "1px solid rgba(239,68,68,0.15)" })}" data-v-f39e765a><h3 class="text-sm font-semibold text-red-400" data-v-f39e765a>Danger Zone</h3>`);
      if (((_p = unref(user)) == null ? void 0 : _p.status) !== "suspended") {
        _push(`<button${ssrIncludeBooleanAttr(unref(suspending) || unref(deleting)) ? " disabled" : ""} class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed" data-v-f39e765a><svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-f39e765a><circle cx="12" cy="12" r="10" data-v-f39e765a></circle><line x1="12" y1="8" x2="12" y2="12" data-v-f39e765a></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-f39e765a></line></svg> ${ssrInterpolate(unref(suspending) ? "Suspending\u2026" : "Suspend this account")}</button>`);
      } else {
        _push(`<button${ssrIncludeBooleanAttr(unref(suspending) || unref(deleting)) ? " disabled" : ""} class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed" data-v-f39e765a><svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-f39e765a><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" data-v-f39e765a></path><polyline points="22 4 12 14.01 9 11.01" data-v-f39e765a></polyline></svg> ${ssrInterpolate(unref(suspending) ? "Activating\u2026" : "Activate this account")}</button>`);
      }
      _push(`<button${ssrIncludeBooleanAttr(unref(suspending) || unref(deleting)) ? " disabled" : ""} class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-500 hover:bg-red-500/10 border border-red-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed" data-v-f39e765a><svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-f39e765a><polyline points="3 6 5 6 21 6" data-v-f39e765a></polyline><path d="M19 6l-1 14H6L5 6" data-v-f39e765a></path><path d="M10 11v6M14 11v6" data-v-f39e765a></path></svg> ${ssrInterpolate(unref(deleting) ? "Deleting\u2026" : "Delete this account")}</button></div></div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2, _c2, _d2;
        if (unref(confirmDeleteModal)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)", "backdrop-filter": "blur(4px)" })}" data-v-f39e765a><div class="w-full max-w-md glass-card p-6 space-y-4" style="${ssrRenderStyle({ "border": "1px solid rgba(239,68,68,0.25)" })}" data-v-f39e765a><div class="flex items-center gap-3" data-v-f39e765a><div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.12)", "border": "1px solid rgba(239,68,68,0.25)" })}" data-v-f39e765a><svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-f39e765a><polyline points="3 6 5 6 21 6" data-v-f39e765a></polyline><path d="M19 6l-1 14H6L5 6" data-v-f39e765a></path></svg></div><div data-v-f39e765a><h3 class="text-sm font-bold text-red-400" data-v-f39e765a>Delete User Account</h3><p class="text-xs text-gray-500 mt-0.5" data-v-f39e765a>This action cannot be undone</p></div></div><p class="text-sm text-gray-400 leading-relaxed" data-v-f39e765a> You are about to permanently delete <strong class="text-red-400" data-v-f39e765a>${ssrInterpolate((_a2 = unref(user)) == null ? void 0 : _a2.display_name)}</strong> (${ssrInterpolate((_b2 = unref(user)) == null ? void 0 : _b2.email)}). The account will be soft-deleted and inaccessible. </p><div class="space-y-1.5" data-v-f39e765a><label class="text-xs font-medium text-gray-500" data-v-f39e765a> Type <span class="font-mono text-red-400" data-v-f39e765a>${ssrInterpolate((_c2 = unref(user)) == null ? void 0 : _c2.display_name)}</span> to confirm </label><input${ssrRenderAttr("value", unref(deleteConfirmText))} class="input-glass text-sm font-mono" placeholder="Type user name exactly\u2026" data-v-f39e765a></div><div class="flex gap-3 justify-end pt-1" data-v-f39e765a><button class="btn-ghost text-xs" data-v-f39e765a>Cancel</button><button${ssrIncludeBooleanAttr(unref(deleteConfirmText) !== ((_d2 = unref(user)) == null ? void 0 : _d2.display_name) || unref(deleting)) ? " disabled" : ""} class="text-xs font-semibold px-4 py-2 rounded-xl border transition-all text-red-400 border-red-500/30 hover:bg-red-500/15 disabled:opacity-40 disabled:cursor-not-allowed" data-v-f39e765a>${ssrInterpolate(unref(deleting) ? "Deleting\u2026" : "Yes, Delete Account")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const edit = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f39e765a"]]);

export { edit as default };
//# sourceMappingURL=edit-PnP6HQ0K.mjs.map
