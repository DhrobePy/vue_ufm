import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrLooseContain, ssrRenderAttr } from 'vue/server-renderer';
import { c as _export_sfc, j as useRoute } from './server.mjs';
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
  __name: "permissions",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const userId = Number(route.params.id);
    const { data: userData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/admin/users/${userId}`,
      "$H72hicMiTJ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const user = computed(() => {
      var _a, _b, _c, _d;
      const u = userData.value;
      return {
        id: userId,
        name: (_a = u == null ? void 0 : u.display_name) != null ? _a : "\u2014",
        email: (_b = u == null ? void 0 : u.email) != null ? _b : "\u2014",
        role: (_c = u == null ? void 0 : u.role) != null ? _c : "\u2014",
        lastLogin: (_d = u == null ? void 0 : u.last_login) != null ? _d : "\u2014"
      };
    });
    const moduleRegistry = [
      {
        key: "credit_orders",
        label: "Credit Sales",
        icon: "\u{1F4CB}",
        pages: [
          {
            key: "list",
            label: "All Orders",
            route: "credit-sales/all",
            actions: [{ key: "export", label: "Export CSV" }, { key: "create", label: "Create Order" }]
          },
          { key: "order_status", label: "Track Orders", route: "credit-sales", actions: [] },
          {
            key: "approve",
            label: "Approve Orders",
            route: "credit-sales/approve",
            actions: [{ key: "approve", label: "Approve" }, { key: "reject", label: "Reject" }, { key: "escalate", label: "Escalate" }]
          },
          {
            key: "production",
            label: "Production Queue",
            route: "credit-sales/production",
            actions: [{ key: "mark_ready", label: "Mark Ready" }]
          },
          {
            key: "dispatch",
            label: "Dispatch",
            route: "credit-sales/dispatch",
            actions: [{ key: "dispatch", label: "Mark Dispatched" }]
          },
          { key: "ledger", label: "Customer Ledger", route: "credit-sales/ledger", actions: [] },
          { key: "ageing", label: "Ageing Report", route: "credit-sales/ageing", actions: [] }
        ]
      },
      {
        key: "purchase",
        label: "Purchase",
        icon: "\u{1F6D2}",
        pages: [
          {
            key: "orders",
            label: "Purchase Orders",
            route: "purchase/orders",
            actions: [{ key: "create", label: "Create PO" }, { key: "approve", label: "Approve" }, { key: "cancel", label: "Cancel" }]
          },
          {
            key: "grn",
            label: "GRN",
            route: "purchase/grn",
            actions: [{ key: "create", label: "Create GRN" }, { key: "approve", label: "Approve GRN" }]
          },
          {
            key: "suppliers",
            label: "Suppliers",
            route: "purchase/suppliers",
            actions: [{ key: "create", label: "Add Supplier" }, { key: "edit", label: "Edit" }]
          },
          {
            key: "payments",
            label: "Purchase Payments",
            route: "purchase/payments",
            actions: [{ key: "create", label: "Record Payment" }]
          }
        ]
      },
      {
        key: "expenses",
        label: "Expenses",
        icon: "\u{1F4B8}",
        pages: [
          {
            key: "list",
            label: "All Expenses",
            route: "expenses",
            actions: [{ key: "create", label: "Create" }, { key: "export", label: "Export" }]
          },
          {
            key: "approve",
            label: "Approve",
            route: "expenses/approve",
            actions: [{ key: "approve", label: "Approve" }, { key: "reject", label: "Reject" }]
          }
        ]
      },
      {
        key: "bank",
        label: "Bank",
        icon: "\u{1F3E6}",
        pages: [
          {
            key: "accounts",
            label: "Accounts Overview",
            route: "bank",
            actions: []
          },
          {
            key: "transactions",
            label: "Transactions",
            route: "bank/transactions",
            actions: [{ key: "initiate", label: "Initiate" }, { key: "approve", label: "Approve" }]
          }
        ]
      },
      {
        key: "accounts",
        label: "Accounts",
        icon: "\u{1F4CA}",
        pages: [
          { key: "dashboard", label: "Accounts Dashboard", route: "accounts", actions: [] }
        ]
      },
      {
        key: "customers",
        label: "Customers",
        icon: "\u{1F465}",
        pages: [
          {
            key: "list",
            label: "Customer List",
            route: "customers",
            actions: [{ key: "create", label: "Add Customer" }, { key: "edit", label: "Edit" }, { key: "blacklist", label: "Blacklist" }]
          }
        ]
      },
      {
        key: "products",
        label: "Products",
        icon: "\u{1F4E6}",
        pages: [
          {
            key: "list",
            label: "Product List",
            route: "products",
            actions: [{ key: "create", label: "Add Product" }, { key: "edit", label: "Edit" }, { key: "price_update", label: "Update Price" }]
          }
        ]
      },
      {
        key: "logistics",
        label: "Logistics",
        icon: "\u{1F69B}",
        pages: [
          {
            key: "vehicles",
            label: "Vehicles",
            route: "logistics/vehicles",
            actions: [{ key: "create", label: "Add Vehicle" }, { key: "edit", label: "Edit" }]
          },
          {
            key: "drivers",
            label: "Drivers",
            route: "logistics/drivers",
            actions: [{ key: "create", label: "Add Driver" }, { key: "edit", label: "Edit" }]
          },
          {
            key: "trips",
            label: "Trips",
            route: "logistics/trips",
            actions: [{ key: "create", label: "Create Trip" }, { key: "complete", label: "Mark Complete" }]
          }
        ]
      },
      {
        key: "pos",
        label: "POS Terminal",
        icon: "\u{1F5A5}\uFE0F",
        pages: [
          {
            key: "terminal",
            label: "POS Terminal",
            route: "pos",
            actions: [{ key: "sale", label: "Complete Sale" }, { key: "discount", label: "Apply Discount" }, { key: "refund", label: "Process Refund" }]
          }
        ]
      },
      {
        key: "sales",
        label: "Sales Reports",
        icon: "\u{1F4C8}",
        pages: [
          { key: "report", label: "Sales Report", route: "sales", actions: [{ key: "export", label: "Export" }] }
        ]
      },
      {
        key: "production",
        label: "Production",
        icon: "\u{1F3ED}",
        pages: [
          {
            key: "floor",
            label: "Production Floor",
            route: "production",
            actions: [{ key: "update", label: "Update Status" }]
          }
        ]
      },
      {
        key: "dispatch",
        label: "Dispatch",
        icon: "\u{1F4E4}",
        pages: [
          {
            key: "queue",
            label: "Dispatch Queue",
            route: "dispatch",
            actions: [{ key: "dispatch", label: "Mark Dispatched" }]
          }
        ]
      },
      {
        key: "collector",
        label: "Collector",
        icon: "\u{1F4B0}",
        pages: [
          {
            key: "collections",
            label: "Collections",
            route: "collector",
            actions: [{ key: "record", label: "Record Collection" }]
          }
        ]
      },
      {
        key: "admin",
        label: "Admin",
        icon: "\u2699\uFE0F",
        pages: [
          {
            key: "users",
            label: "User Management",
            route: "admin/users",
            actions: [{ key: "create", label: "Create User" }, { key: "edit", label: "Edit User" }, { key: "deactivate", label: "Deactivate" }, { key: "permissions", label: "Set Permissions" }]
          },
          { key: "audit", label: "Audit Trail", route: "admin/audit", actions: [{ key: "export", label: "Export" }] },
          { key: "settings", label: "Settings", route: "admin/settings", actions: [] },
          {
            key: "employees",
            label: "Employees",
            route: "admin/employees",
            actions: [{ key: "create", label: "Add Employee" }, { key: "edit", label: "Edit" }]
          }
        ]
      }
    ];
    const scopes = [
      { value: "all", label: "All Data", desc: "Access records from all branches" },
      { value: "branch", label: "Branch Only", desc: "Restricted to selected branches" },
      { value: "own", label: "Own Only", desc: "Only records created by this user" }
    ];
    const branches = [
      { value: "srg", label: "Sirajgonj" },
      { value: "demra", label: "Demra" }
    ];
    const globalScope = ref("branch");
    const allowedBranches = ref(["srg"]);
    const perms = ref({});
    const expanded = ref({});
    function initPerms() {
      for (const mod of moduleRegistry) {
        perms.value[mod.key] = {
          enabled: ["credit_orders", "customers", "pos"].includes(mod.key),
          pages: mod.key === "credit_orders" ? ["list", "order_status", "ledger", "ageing"] : mod.key === "customers" ? ["list"] : mod.key === "pos" ? ["terminal"] : [],
          actions: {}
        };
        expanded.value[mod.key] = false;
      }
      expanded.value["credit_orders"] = true;
    }
    initPerms();
    const original = ref(JSON.stringify({ scope: globalScope.value, branches: allowedBranches.value, perms: perms.value }));
    function isPageAllowed(mod, pg) {
      var _a, _b;
      return (_b = (_a = perms.value[mod]) == null ? void 0 : _a.pages.includes(pg)) != null ? _b : false;
    }
    function isActionAllowed(mod, pg, act) {
      var _a, _b, _c;
      return (_c = (_b = (_a = perms.value[mod]) == null ? void 0 : _a.actions[pg]) == null ? void 0 : _b[act]) != null ? _c : false;
    }
    function countActions(mod) {
      return mod.pages.reduce((s, p) => {
        var _a, _b;
        return s + ((_b = (_a = p.actions) == null ? void 0 : _a.length) != null ? _b : 0);
      }, 0);
    }
    const changesCount = computed(() => {
      const curr = JSON.stringify({ scope: globalScope.value, branches: allowedBranches.value, perms: perms.value });
      return curr === original.value ? 0 : 1;
    });
    const saving = ref(false);
    async function save() {
      saving.value = true;
      await new Promise((r) => setTimeout(r, 800));
      original.value = JSON.stringify({ scope: globalScope.value, branches: allowedBranches.value, perms: perms.value });
      saving.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-846ee724>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Permissions \u2014 ${unref(user).name}`,
        subtitle: unref(user).role,
        breadcrumb: ["Admin", "Users", unref(user).name, "Permissions"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs" data-v-846ee724${_scopeId}>\u2190 Back</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-846ee724${_scopeId}>`);
            if (unref(saving)) {
              _push2(`<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" data-v-846ee724${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-846ee724${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" data-v-846ee724${_scopeId}></path></svg>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Permissions")}</button>`);
          } else {
            return [
              createVNode("button", {
                class: "btn-ghost text-xs",
                onClick: ($event) => _ctx.$router.back()
              }, "\u2190 Back", 8, ["onClick"]),
              createVNode("button", {
                class: "btn-gold text-xs",
                disabled: unref(saving),
                onClick: save
              }, [
                unref(saving) ? (openBlock(), createBlock("svg", {
                  key: 0,
                  class: "w-3.5 h-3.5 animate-spin",
                  fill: "none",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("circle", {
                    class: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    "stroke-width": "4"
                  }),
                  createVNode("path", {
                    class: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8v8z"
                  })
                ])) : createCommentVNode("", true),
                createTextVNode(" " + toDisplayString(unref(saving) ? "Saving\u2026" : "Save Permissions"), 1)
              ], 8, ["disabled"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="glass-card p-4 flex items-center gap-4" data-v-846ee724><div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,#f59e0b,#d97706)" })}" data-v-846ee724>${ssrInterpolate(unref(user).name[0])}</div><div class="flex-1 min-w-0" data-v-846ee724><p class="text-sm font-semibold text-gray-200" data-v-846ee724>${ssrInterpolate(unref(user).name)}</p><p class="text-xs text-gray-500" data-v-846ee724>${ssrInterpolate(unref(user).email)} \xB7 Role: <span class="text-gold-400 font-mono text-[11px]" data-v-846ee724>${ssrInterpolate(unref(user).role)}</span></p></div><div class="text-xs text-gray-600 text-right" data-v-846ee724><p data-v-846ee724>Last Login</p><p class="text-gray-400" data-v-846ee724>${ssrInterpolate(unref(user).lastLogin)}</p></div></div><div class="glass-card p-5" data-v-846ee724><h2 class="section-title mb-4" data-v-846ee724>Global Data Scope</h2><p class="text-xs text-gray-500 mb-3" data-v-846ee724>Controls which records this user can view across all modules.</p><div class="flex flex-wrap gap-3" data-v-846ee724><!--[-->`);
      ssrRenderList(scopes, (s) => {
        _push(`<label class="flex items-center gap-2.5 cursor-pointer group" data-v-846ee724><div class="${ssrRenderClass([
          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
          unref(globalScope) === s.value ? "border-gold-500 bg-gold-500/20" : "border-white/20 group-hover:border-white/40"
        ])}" data-v-846ee724>`);
        if (unref(globalScope) === s.value) {
          _push(`<div class="w-2 h-2 rounded-full bg-gold-400" data-v-846ee724></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div data-v-846ee724><p class="text-sm font-medium text-gray-300" data-v-846ee724>${ssrInterpolate(s.label)}</p><p class="text-[11px] text-gray-600" data-v-846ee724>${ssrInterpolate(s.desc)}</p></div></label>`);
      });
      _push(`<!--]--></div>`);
      if (unref(globalScope) === "branch") {
        _push(`<div class="mt-4 flex flex-wrap gap-2" data-v-846ee724><!--[-->`);
        ssrRenderList(branches, (b) => {
          _push(`<label class="flex items-center gap-2 cursor-pointer" data-v-846ee724><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(allowedBranches)) ? ssrLooseContain(unref(allowedBranches), b.value) : unref(allowedBranches)) ? " checked" : ""}${ssrRenderAttr("value", b.value)} class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500" data-v-846ee724><span class="text-sm text-gray-300" data-v-846ee724>${ssrInterpolate(b.label)}</span></label>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-3" data-v-846ee724><!--[-->`);
      ssrRenderList(moduleRegistry, (mod) => {
        var _a, _b, _c, _d, _e;
        _push(`<div class="glass-card overflow-hidden" data-v-846ee724><div class="${ssrRenderClass([((_a = unref(perms)[mod.key]) == null ? void 0 : _a.enabled) ? "" : "opacity-60", "flex items-center gap-3 p-4 border-b border-white/[0.05]"])}" data-v-846ee724><div class="${ssrRenderClass([
          "w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0",
          ((_b = unref(perms)[mod.key]) == null ? void 0 : _b.enabled) ? "bg-gold-500/10 border border-gold-500/20" : "bg-white/[0.04] border border-white/[0.08]"
        ])}" data-v-846ee724>${ssrInterpolate(mod.icon)}</div><div class="flex-1 min-w-0" data-v-846ee724><p class="text-sm font-semibold text-gray-200" data-v-846ee724>${ssrInterpolate(mod.label)}</p><p class="text-xs text-gray-600" data-v-846ee724>${ssrInterpolate(mod.pages.length)} pages \xB7 ${ssrInterpolate(countActions(mod))} actions</p></div><button class="${ssrRenderClass([
          "relative w-11 h-6 rounded-full transition-all duration-200 border shrink-0",
          ((_c = unref(perms)[mod.key]) == null ? void 0 : _c.enabled) ? "bg-gold-500/20 border-gold-500/40" : "bg-white/[0.05] border-white/[0.08]"
        ])}" data-v-846ee724><span class="${ssrRenderClass([
          "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 flex items-center justify-center",
          ((_d = unref(perms)[mod.key]) == null ? void 0 : _d.enabled) ? "left-5 bg-gold-400 shadow-gold-sm" : "left-0.5 bg-gray-600"
        ])}" data-v-846ee724></span></button><button class="${ssrRenderClass([
          "text-gray-600 hover:text-gray-300 transition-all duration-200 ml-1",
          unref(expanded)[mod.key] ? "rotate-180" : ""
        ])}" data-v-846ee724><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-846ee724><path d="m6 9 6 6 6-6" data-v-846ee724></path></svg></button></div>`);
        if (unref(expanded)[mod.key] && ((_e = unref(perms)[mod.key]) == null ? void 0 : _e.enabled)) {
          _push(`<div class="divide-y divide-white/[0.04]" data-v-846ee724><!--[-->`);
          ssrRenderList(mod.pages, (pg) => {
            var _a2;
            _push(`<div class="p-4" data-v-846ee724><div class="flex items-center gap-3 mb-3" data-v-846ee724><input type="checkbox"${ssrRenderAttr("id", `pg-${mod.key}-${pg.key}`)}${ssrIncludeBooleanAttr(isPageAllowed(mod.key, pg.key)) ? " checked" : ""} class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500 shrink-0" data-v-846ee724><label${ssrRenderAttr("for", `pg-${mod.key}-${pg.key}`)} class="text-sm font-medium text-gray-300 cursor-pointer select-none" data-v-846ee724>${ssrInterpolate(pg.label)}</label><span class="text-[10px] font-mono text-gray-700 ml-1" data-v-846ee724>/${ssrInterpolate(pg.route)}</span></div>`);
            if (((_a2 = pg.actions) == null ? void 0 : _a2.length) && isPageAllowed(mod.key, pg.key)) {
              _push(`<div class="ml-7 flex flex-wrap gap-2" data-v-846ee724><!--[-->`);
              ssrRenderList(pg.actions, (act) => {
                _push(`<label class="flex items-center gap-1.5 cursor-pointer group" data-v-846ee724><input type="checkbox"${ssrIncludeBooleanAttr(isActionAllowed(mod.key, pg.key, act.key)) ? " checked" : ""} class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-500" data-v-846ee724><span class="${ssrRenderClass([
                  "text-xs transition-colors",
                  isActionAllowed(mod.key, pg.key, act.key) ? "text-gray-400 group-hover:text-gray-300" : "text-gray-700 group-hover:text-gray-600"
                ])}" data-v-846ee724>${ssrInterpolate(act.label)}</span></label>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div><div class="sticky bottom-4 flex justify-end" data-v-846ee724><div class="glass-card px-4 py-3 flex items-center gap-3" data-v-846ee724><span class="text-xs text-gray-500" data-v-846ee724>${ssrInterpolate(unref(changesCount))} unsaved change${ssrInterpolate(unref(changesCount) !== 1 ? "s" : "")}</span><button class="btn-ghost text-xs" data-v-846ee724>Reset</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(saving) || unref(changesCount) === 0) ? " disabled" : ""} data-v-846ee724> Save Permissions </button></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/[id]/permissions.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const permissions = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-846ee724"]]);

export { permissions as default };
//# sourceMappingURL=permissions-g6OXU2m_.mjs.map
