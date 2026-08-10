import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { defineComponent, ref, reactive, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderDynamicModel, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { c as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'googleapis';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "create",
  __ssrInlineRender: true,
  setup(__props) {
    const showPass = ref(false);
    const submitting = ref(false);
    const form = reactive({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      branch: "",
      status: "active",
      phone: "",
      telegramEnabled: false,
      telegramChatId: ""
    });
    const roleDescriptions = {
      "Superadmin": "Full system access \u2014 no restrictions. Can create users and modify all settings.",
      "admin": "Administrative access. Can manage users, view all modules, adjust settings.",
      "Accounts": "HQ-level accounts access across both branches.",
      "accounts-srg": "Accounts access restricted to Sirajgonj branch.",
      "accounts-demra": "Accounts access restricted to Demra branch.",
      "accountspos-srg": "Combined accounts + POS for Sirajgonj.",
      "accountspos-demra": "Combined accounts + POS for Demra.",
      "sales-srg": "Sales order creation and tracking \u2014 Sirajgonj.",
      "sales-demra": "Sales order creation and tracking \u2014 Demra.",
      "sales-other": "Sales access for other/remote locations.",
      "production manager-srg": "Manages production queue and floor at Sirajgonj.",
      "production manager-demra": "Manages production queue and floor at Demra.",
      "dispatch-srg": "Handles dispatch and delivery \u2014 Sirajgonj.",
      "dispatch-demra": "Handles dispatch and delivery \u2014 Demra.",
      "dispatchpos-srg": "Combined dispatch + POS \u2014 Sirajgonj.",
      "dispatchpos-demra": "Combined dispatch + POS \u2014 Demra.",
      "collector": "Collects payments from customers in the field.",
      "Transport Manager": "Manages vehicles, drivers and trip assignments.",
      "Expense Initiator": "Can create and submit expense requests.",
      "Expense Approver": "Approves or rejects submitted expenses.",
      "Bank Transaction Initiator": "Creates bank transfer/transaction entries.",
      "Bank Transaction Approver": "Reviews and approves bank transactions."
    };
    const roleDescription = computed(() => {
      var _a;
      return (_a = roleDescriptions[form.role]) != null ? _a : "Custom role \u2014 set permissions manually after creation.";
    });
    useToast();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-8b222e60>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Create User",
        subtitle: "Add a new system user and assign their role",
        breadcrumb: ["Admin", "Users", "Create"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/admin/users",
              class: "btn-ghost text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 Cancel`);
                } else {
                  return [
                    createTextVNode("\u2190 Cancel")
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
                  createTextVNode("\u2190 Cancel")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-8b222e60><div class="lg:col-span-2 space-y-6" data-v-8b222e60><div class="glass-card p-6 space-y-5" data-v-8b222e60><h2 class="section-title" data-v-8b222e60>Identity</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-8b222e60><div data-v-8b222e60><label class="form-label" data-v-8b222e60>Full Name *</label><input${ssrRenderAttr("value", unref(form).name)} class="input-glass" placeholder="e.g. Accounts Sirajgonj" required data-v-8b222e60></div><div data-v-8b222e60><label class="form-label" data-v-8b222e60>Email Address *</label><input${ssrRenderAttr("value", unref(form).email)} type="email" class="input-glass" placeholder="user@ujjalfmc.com" required data-v-8b222e60></div><div data-v-8b222e60><label class="form-label" data-v-8b222e60>Password *</label><div class="relative" data-v-8b222e60><input${ssrRenderDynamicModel(unref(showPass) ? "text" : "password", unref(form).password, null)}${ssrRenderAttr("type", unref(showPass) ? "text" : "password")} class="input-glass pr-10" placeholder="Min 8 characters" required data-v-8b222e60><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400" data-v-8b222e60><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-8b222e60>`);
      if (!unref(showPass)) {
        _push(`<!--[--><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-v-8b222e60></path><circle cx="12" cy="12" r="3" data-v-8b222e60></circle><!--]-->`);
      } else {
        _push(`<!--[--><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" data-v-8b222e60></path><line x1="1" y1="1" x2="23" y2="23" data-v-8b222e60></line><!--]-->`);
      }
      _push(`</svg></button></div></div><div data-v-8b222e60><label class="form-label" data-v-8b222e60>Confirm Password *</label><input${ssrRenderDynamicModel(unref(showPass) ? "text" : "password", unref(form).confirmPassword, null)}${ssrRenderAttr("type", unref(showPass) ? "text" : "password")} class="input-glass" placeholder="Repeat password" required data-v-8b222e60>`);
      if (unref(form).confirmPassword && unref(form).password !== unref(form).confirmPassword) {
        _push(`<p class="text-xs text-red-400 mt-1" data-v-8b222e60>Passwords do not match</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="glass-card p-6 space-y-5" data-v-8b222e60><h2 class="section-title" data-v-8b222e60>Role &amp; Access</h2><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-8b222e60><div data-v-8b222e60><label class="form-label" data-v-8b222e60>Role *</label><select class="input-glass" required data-v-8b222e60><option value="" disabled data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "") : ssrLooseEqual(unref(form).role, "")) ? " selected" : ""}>Select role\u2026</option><optgroup label="System Admin" data-v-8b222e60><option value="Superadmin" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Superadmin") : ssrLooseEqual(unref(form).role, "Superadmin")) ? " selected" : ""}>Superadmin</option><option value="admin" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "admin") : ssrLooseEqual(unref(form).role, "admin")) ? " selected" : ""}>Admin</option></optgroup><optgroup label="Accounts" data-v-8b222e60><option value="Accounts" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Accounts") : ssrLooseEqual(unref(form).role, "Accounts")) ? " selected" : ""}>Accounts (HQ)</option><option value="accounts-srg" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accounts-srg") : ssrLooseEqual(unref(form).role, "accounts-srg")) ? " selected" : ""}>Accounts \u2014 Sirajgonj</option><option value="accounts-demra" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accounts-demra") : ssrLooseEqual(unref(form).role, "accounts-demra")) ? " selected" : ""}>Accounts \u2014 Demra</option><option value="accountspos-srg" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accountspos-srg") : ssrLooseEqual(unref(form).role, "accountspos-srg")) ? " selected" : ""}>Accounts POS \u2014 Sirajgonj</option><option value="accountspos-demra" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "accountspos-demra") : ssrLooseEqual(unref(form).role, "accountspos-demra")) ? " selected" : ""}>Accounts POS \u2014 Demra</option></optgroup><optgroup label="Sales" data-v-8b222e60><option value="sales-srg" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-srg") : ssrLooseEqual(unref(form).role, "sales-srg")) ? " selected" : ""}>Sales \u2014 Sirajgonj</option><option value="sales-demra" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-demra") : ssrLooseEqual(unref(form).role, "sales-demra")) ? " selected" : ""}>Sales \u2014 Demra</option><option value="sales-other" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "sales-other") : ssrLooseEqual(unref(form).role, "sales-other")) ? " selected" : ""}>Sales \u2014 Other</option></optgroup><optgroup label="Production" data-v-8b222e60><option value="production manager-srg" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "production manager-srg") : ssrLooseEqual(unref(form).role, "production manager-srg")) ? " selected" : ""}>Production Manager \u2014 Sirajgonj</option><option value="production manager-demra" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "production manager-demra") : ssrLooseEqual(unref(form).role, "production manager-demra")) ? " selected" : ""}>Production Manager \u2014 Demra</option></optgroup><optgroup label="Dispatch" data-v-8b222e60><option value="dispatch-srg" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatch-srg") : ssrLooseEqual(unref(form).role, "dispatch-srg")) ? " selected" : ""}>Dispatch \u2014 Sirajgonj</option><option value="dispatch-demra" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatch-demra") : ssrLooseEqual(unref(form).role, "dispatch-demra")) ? " selected" : ""}>Dispatch \u2014 Demra</option><option value="dispatchpos-srg" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatchpos-srg") : ssrLooseEqual(unref(form).role, "dispatchpos-srg")) ? " selected" : ""}>Dispatch POS \u2014 Sirajgonj</option><option value="dispatchpos-demra" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "dispatchpos-demra") : ssrLooseEqual(unref(form).role, "dispatchpos-demra")) ? " selected" : ""}>Dispatch POS \u2014 Demra</option></optgroup><optgroup label="Operations" data-v-8b222e60><option value="collector" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "collector") : ssrLooseEqual(unref(form).role, "collector")) ? " selected" : ""}>Collector</option><option value="Transport Manager" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Transport Manager") : ssrLooseEqual(unref(form).role, "Transport Manager")) ? " selected" : ""}>Transport Manager</option></optgroup><optgroup label="Finance" data-v-8b222e60><option value="Expense Initiator" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Expense Initiator") : ssrLooseEqual(unref(form).role, "Expense Initiator")) ? " selected" : ""}>Expense Initiator</option><option value="Expense Approver" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Expense Approver") : ssrLooseEqual(unref(form).role, "Expense Approver")) ? " selected" : ""}>Expense Approver</option><option value="Bank Transaction Initiator" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Bank Transaction Initiator") : ssrLooseEqual(unref(form).role, "Bank Transaction Initiator")) ? " selected" : ""}>Bank Transaction Initiator</option><option value="Bank Transaction Approver" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).role) ? ssrLooseContain(unref(form).role, "Bank Transaction Approver") : ssrLooseEqual(unref(form).role, "Bank Transaction Approver")) ? " selected" : ""}>Bank Transaction Approver</option></optgroup></select></div><div data-v-8b222e60><label class="form-label" data-v-8b222e60>Branch</label><select class="input-glass" data-v-8b222e60><option value="" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch) ? ssrLooseContain(unref(form).branch, "") : ssrLooseEqual(unref(form).branch, "")) ? " selected" : ""}>All Branches</option><option value="srg" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch) ? ssrLooseContain(unref(form).branch, "srg") : ssrLooseEqual(unref(form).branch, "srg")) ? " selected" : ""}>Sirajgonj</option><option value="demra" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).branch) ? ssrLooseContain(unref(form).branch, "demra") : ssrLooseEqual(unref(form).branch, "demra")) ? " selected" : ""}>Demra</option></select></div><div data-v-8b222e60><label class="form-label" data-v-8b222e60>Status</label><select class="input-glass" data-v-8b222e60><option value="active" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>Active</option><option value="pending" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "pending") : ssrLooseEqual(unref(form).status, "pending")) ? " selected" : ""}>Pending (awaiting activation)</option><option value="suspended" data-v-8b222e60${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "suspended") : ssrLooseEqual(unref(form).status, "suspended")) ? " selected" : ""}>Suspended</option></select></div><div data-v-8b222e60><label class="form-label" data-v-8b222e60>Phone (optional)</label><input${ssrRenderAttr("value", unref(form).phone)} class="input-glass" placeholder="+880\u2026" data-v-8b222e60></div></div></div><div class="glass-card p-6 space-y-4" data-v-8b222e60><div class="flex items-center justify-between" data-v-8b222e60><div data-v-8b222e60><h2 class="section-title" data-v-8b222e60>Telegram Notifications</h2><p class="text-xs text-gray-600 mt-0.5" data-v-8b222e60>Send order status alerts via Telegram bot</p></div><button type="button" class="${ssrRenderClass([
        "relative w-11 h-6 rounded-full transition-all border",
        unref(form).telegramEnabled ? "bg-gold-500/20 border-gold-500/40" : "bg-white/[0.05] border-white/[0.08]"
      ])}" data-v-8b222e60><span class="${ssrRenderClass([
        "absolute top-0.5 w-5 h-5 rounded-full transition-all",
        unref(form).telegramEnabled ? "left-5 bg-gold-400" : "left-0.5 bg-gray-600"
      ])}" data-v-8b222e60></span></button></div>`);
      if (unref(form).telegramEnabled) {
        _push(`<div data-v-8b222e60><label class="form-label" data-v-8b222e60>Telegram Chat ID</label><input${ssrRenderAttr("value", unref(form).telegramChatId)} class="input-glass font-mono" placeholder="e.g. 123456789" data-v-8b222e60><p class="text-[11px] text-gray-600 mt-1" data-v-8b222e60>Start a chat with @ujjalfmc_bot to get your chat ID</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="space-y-4" data-v-8b222e60>`);
      if (unref(form).role) {
        _push(`<div class="glass-card p-5" data-v-8b222e60><h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3" data-v-8b222e60>Role Summary</h3><p class="text-sm font-mono text-gold-400 mb-2" data-v-8b222e60>${ssrInterpolate(unref(form).role)}</p><p class="text-xs text-gray-500 leading-relaxed" data-v-8b222e60>${ssrInterpolate(unref(roleDescription))}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-5 border border-blue-500/10" data-v-8b222e60><div class="flex gap-3" data-v-8b222e60><svg class="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-8b222e60><circle cx="12" cy="12" r="10" data-v-8b222e60></circle><path d="M12 16v-4M12 8h.01" data-v-8b222e60></path></svg><div data-v-8b222e60><p class="text-xs font-medium text-blue-300 mb-1" data-v-8b222e60>Default permissions apply</p><p class="text-[11px] text-gray-500 leading-relaxed" data-v-8b222e60>The selected role determines default module access. You can fine-tune permissions after creation from the user&#39;s permission page.</p></div></div></div><button type="submit" class="btn-gold w-full justify-center py-3"${ssrIncludeBooleanAttr(unref(submitting) || unref(form).password !== unref(form).confirmPassword) ? " disabled" : ""} data-v-8b222e60>`);
      if (unref(submitting)) {
        _push(`<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" data-v-8b222e60><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-8b222e60></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" data-v-8b222e60></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(submitting) ? "Creating\u2026" : "Create User")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/users",
        class: "btn-ghost w-full justify-center text-sm"
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
      _push(`</div></form></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const create = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8b222e60"]]);

export { create as default };
//# sourceMappingURL=create-D64fa1ZU.mjs.map
