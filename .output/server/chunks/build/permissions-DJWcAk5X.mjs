import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    let __temp, __restore;
    const route = useRoute();
    const userId = Number(route.params.id);
    const moduleRegistry = [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: "\u{1F3E0}",
        pages: [
          {
            key: "main",
            label: "Main Dashboard",
            route: "dashboard",
            actions: []
          }
        ]
      },
      {
        key: "credit_sales",
        label: "Credit Sales",
        icon: "\u{1F4CB}",
        pages: [
          {
            key: "dashboard",
            label: "CS Dashboard",
            route: "credit-sales",
            actions: []
          },
          {
            key: "all",
            label: "All Sales",
            route: "credit-sales/all",
            actions: [
              { key: "create", label: "Create Order" },
              { key: "edit", label: "Edit Order" },
              { key: "delete", label: "Delete Order" },
              { key: "export", label: "Export CSV" },
              { key: "print", label: "Print Invoice" }
            ]
          },
          {
            key: "create",
            label: "Create Order Form",
            route: "credit-sales/create",
            actions: [
              { key: "submit", label: "Submit Order" }
            ]
          },
          {
            key: "approve",
            label: "Approve Orders",
            route: "credit-sales/approve",
            actions: [
              { key: "approve", label: "Approve" },
              { key: "reject", label: "Reject" },
              { key: "escalate", label: "Escalate" }
            ]
          },
          {
            key: "production",
            label: "Production Queue",
            route: "credit-sales/production",
            actions: [
              { key: "mark_ready", label: "Mark Ready" },
              { key: "set_priority", label: "Set Priority" }
            ]
          },
          {
            key: "dispatch",
            label: "Dispatch Queue",
            route: "credit-sales/dispatch",
            actions: [
              { key: "mark_dispatched", label: "Mark Dispatched" }
            ]
          },
          {
            key: "ledger",
            label: "Customer Ledger",
            route: "credit-sales/ledger",
            actions: [
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "ageing",
            label: "Ageing Report",
            route: "credit-sales/ageing",
            actions: [
              { key: "export", label: "Export" }
            ]
          }
        ]
      },
      {
        key: "fleet",
        label: "Fleet Management",
        icon: "\u{1F69B}",
        pages: [
          {
            key: "dashboard",
            label: "Fleet Dashboard",
            route: "fleet",
            actions: []
          },
          {
            key: "vehicles",
            label: "Vehicles",
            route: "fleet/vehicles",
            actions: [
              { key: "create", label: "Add Vehicle" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          },
          {
            key: "drivers",
            label: "Drivers",
            route: "fleet/drivers",
            actions: [
              { key: "create", label: "Add Driver" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          },
          {
            key: "trips",
            label: "Trips",
            route: "fleet/trips",
            actions: [
              { key: "create", label: "Create Trip" },
              { key: "complete", label: "Mark Complete" },
              { key: "edit", label: "Edit" }
            ]
          },
          {
            key: "maintenance",
            label: "Maintenance",
            route: "fleet/maintenance",
            actions: [
              { key: "create", label: "Log Maintenance" },
              { key: "edit", label: "Edit" }
            ]
          },
          {
            key: "pm_rules",
            label: "PM Rules",
            route: "fleet/maintenance/rules",
            actions: [
              { key: "create", label: "Add Rule" },
              { key: "edit", label: "Edit Rule" }
            ]
          },
          {
            key: "fuel",
            label: "Fuel Logs",
            route: "fleet/fuel",
            actions: [
              { key: "create", label: "Log Fuel" },
              { key: "edit", label: "Edit" }
            ]
          },
          {
            key: "fuel_report",
            label: "Fuel Efficiency Report",
            route: "fleet/fuel/efficiency",
            actions: [
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "purchases",
            label: "Fleet Purchases",
            route: "fleet/purchases",
            actions: [
              { key: "create", label: "Create Purchase" },
              { key: "edit", label: "Edit" }
            ]
          },
          {
            key: "items",
            label: "Fleet Items",
            route: "fleet/items",
            actions: [
              { key: "create", label: "Add Item" },
              { key: "edit", label: "Edit" }
            ]
          },
          {
            key: "reports",
            label: "Fleet Reports",
            route: "fleet/reports",
            actions: [
              { key: "export", label: "Export" }
            ]
          }
        ]
      },
      {
        key: "purchase",
        label: "Purchase",
        icon: "\u{1F6D2}",
        pages: [
          {
            key: "dashboard",
            label: "Purchase Dashboard",
            route: "purchase",
            actions: []
          },
          {
            key: "orders",
            label: "All Purchase Orders",
            route: "purchase/orders",
            actions: [
              { key: "create", label: "Create PO" },
              { key: "approve", label: "Approve PO" },
              { key: "cancel", label: "Cancel PO" },
              { key: "print", label: "Print PO" },
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "orders_create",
            label: "Create PO Form",
            route: "purchase/orders/create",
            actions: [
              { key: "submit", label: "Submit" }
            ]
          },
          {
            key: "grn",
            label: "Goods Received (GRN)",
            route: "purchase/grn",
            actions: [
              { key: "create", label: "Create GRN" },
              { key: "approve", label: "Approve GRN" },
              { key: "edit", label: "Edit GRN" }
            ]
          },
          {
            key: "grn_variance",
            label: "GRN Variance Report",
            route: "purchase/grn/variance",
            actions: [
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "payments",
            label: "Purchase Payments",
            route: "purchase/payments",
            actions: [
              { key: "create", label: "Record Payment" },
              { key: "approve", label: "Approve Payment" },
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "adjustments",
            label: "Adjustment Notes",
            route: "purchase/adjustments",
            actions: [
              { key: "create", label: "Create Note" },
              { key: "edit", label: "Edit" }
            ]
          },
          {
            key: "suppliers",
            label: "Suppliers",
            route: "purchase/suppliers",
            actions: [
              { key: "create", label: "Add Supplier" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          },
          {
            key: "suppliers_summary",
            label: "Supplier Summary",
            route: "purchase/suppliers/summary",
            actions: [
              { key: "export", label: "Export" }
            ]
          }
        ]
      },
      {
        key: "expenses",
        label: "Expenses",
        icon: "\u{1F4B8}",
        pages: [
          {
            key: "dashboard",
            label: "Expenses Dashboard",
            route: "expenses",
            actions: []
          },
          {
            key: "create",
            label: "Create Expense",
            route: "expenses/create",
            actions: [
              { key: "submit", label: "Submit Expense" }
            ]
          },
          {
            key: "history",
            label: "Expense History",
            route: "expenses/history",
            actions: [
              { key: "export", label: "Export" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          },
          {
            key: "approve",
            label: "Approve Expenses",
            route: "expenses/approve",
            actions: [
              { key: "approve", label: "Approve" },
              { key: "reject", label: "Reject" }
            ]
          },
          {
            key: "categories",
            label: "Expense Categories",
            route: "expenses/categories",
            actions: [
              { key: "create", label: "Add Category" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          }
        ]
      },
      {
        key: "bank",
        label: "Bank",
        icon: "\u{1F3E6}",
        pages: [
          {
            key: "dashboard",
            label: "Bank Dashboard",
            route: "bank",
            actions: []
          },
          {
            key: "transaction",
            label: "New Transaction",
            route: "bank/transaction/create",
            actions: [
              { key: "create", label: "Create Transaction" },
              { key: "approve", label: "Approve" }
            ]
          },
          {
            key: "transfer",
            label: "Bank Transfer",
            route: "bank/transfer",
            actions: [
              { key: "initiate", label: "Initiate Transfer" },
              { key: "approve", label: "Approve Transfer" }
            ]
          },
          {
            key: "statement",
            label: "Bank Statement",
            route: "bank/statement",
            actions: [
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "accounts",
            label: "Bank Accounts",
            route: "bank/accounts",
            actions: [
              { key: "create", label: "Add Account" },
              { key: "edit", label: "Edit" }
            ]
          }
        ]
      },
      {
        key: "accounts",
        label: "Accounts (GL)",
        icon: "\u{1F4CA}",
        pages: [
          {
            key: "coa",
            label: "Chart of Accounts",
            route: "accounts/coa",
            actions: [
              { key: "create", label: "Add Account" },
              { key: "edit", label: "Edit" }
            ]
          },
          {
            key: "journal_create",
            label: "New Journal Entry",
            route: "accounts/journal/create",
            actions: [
              { key: "post", label: "Post Entry" }
            ]
          },
          {
            key: "statement",
            label: "GL Statement",
            route: "accounts/statement",
            actions: [
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "voucher",
            label: "Debit Voucher",
            route: "accounts/voucher",
            actions: [
              { key: "create", label: "Create Voucher" },
              { key: "print", label: "Print" }
            ]
          },
          {
            key: "daily_log",
            label: "Daily Log",
            route: "accounts/daily-log",
            actions: [
              { key: "export", label: "Export" }
            ]
          }
        ]
      },
      {
        key: "sales",
        label: "Sales Reports",
        icon: "\u{1F4C8}",
        pages: [
          {
            key: "report",
            label: "Sales Overview",
            route: "sales",
            actions: [
              { key: "export", label: "Export" }
            ]
          }
        ]
      },
      {
        key: "production",
        label: "Production",
        icon: "\u{1F3ED}",
        pages: [
          {
            key: "dashboard",
            label: "Production Dashboard",
            route: "production",
            actions: [
              { key: "update_status", label: "Update Status" }
            ]
          },
          {
            key: "create",
            label: "New Batch",
            route: "production/create",
            actions: [
              { key: "submit", label: "Submit Batch" }
            ]
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
            actions: [
              { key: "mark_dispatched", label: "Mark Dispatched" },
              { key: "export", label: "Export" }
            ]
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
            actions: [
              { key: "record", label: "Record Collection" },
              { key: "approve", label: "Approve" },
              { key: "export", label: "Export" }
            ]
          }
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
            actions: [
              { key: "create", label: "Add Customer" },
              { key: "edit", label: "Edit Customer" },
              { key: "delete", label: "Delete" },
              { key: "blacklist", label: "Blacklist" },
              { key: "export", label: "Export" }
            ]
          }
        ]
      },
      {
        key: "products",
        label: "Products",
        icon: "\u{1F4E6}",
        pages: [
          {
            key: "overview",
            label: "Products Overview",
            route: "products",
            actions: []
          },
          {
            key: "base",
            label: "Base Products",
            route: "products/base",
            actions: [
              { key: "create", label: "Add Product" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          },
          {
            key: "variants",
            label: "Product Variants",
            route: "products/variants",
            actions: [
              { key: "create", label: "Add Variant" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          },
          {
            key: "pricing",
            label: "Pricing",
            route: "products/pricing",
            actions: [
              { key: "edit", label: "Update Price" }
            ]
          },
          {
            key: "pricing_engine",
            label: "Pricing Engine",
            route: "products/pricing-engine",
            actions: [
              { key: "configure", label: "Configure Rules" }
            ]
          },
          {
            key: "inventory",
            label: "Inventory",
            route: "products/inventory",
            actions: [
              { key: "adjust", label: "Adjust Stock" },
              { key: "export", label: "Export" }
            ]
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
            actions: [
              { key: "sale", label: "Complete Sale" },
              { key: "discount", label: "Apply Discount" },
              { key: "refund", label: "Process Refund" },
              { key: "hold", label: "Hold Order" },
              { key: "reprint", label: "Reprint Receipt" }
            ]
          }
        ]
      },
      {
        key: "admin",
        label: "Admin",
        icon: "\u2699\uFE0F",
        pages: [
          {
            key: "dashboard",
            label: "Admin Dashboard",
            route: "admin",
            actions: []
          },
          {
            key: "users",
            label: "User Management",
            route: "admin/users",
            actions: [
              { key: "create", label: "Create User" },
              { key: "edit", label: "Edit User" },
              { key: "deactivate", label: "Deactivate User" },
              { key: "delete", label: "Delete User" },
              { key: "permissions", label: "Set Permissions" }
            ]
          },
          {
            key: "audit",
            label: "Audit Trail",
            route: "admin/audit",
            actions: [
              { key: "export", label: "Export Log" }
            ]
          },
          {
            key: "settings",
            label: "Settings",
            route: "admin/settings",
            actions: [
              { key: "edit", label: "Edit Settings" }
            ]
          },
          {
            key: "employees",
            label: "Employees (Admin)",
            route: "admin/employees",
            actions: [
              { key: "create", label: "Add Employee" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          }
        ]
      },
      {
        key: "hr",
        label: "Human Resources",
        icon: "\u{1F464}",
        pages: [
          {
            key: "dashboard",
            label: "HR Dashboard",
            route: "hr",
            actions: []
          },
          {
            key: "employees",
            label: "HR Employees",
            route: "hr/employees",
            actions: [
              { key: "create", label: "Add Employee" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" },
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "attendance",
            label: "Attendance",
            route: "hr/attendance",
            actions: [
              { key: "mark", label: "Mark Attendance" },
              { key: "edit", label: "Edit Entry" },
              { key: "export", label: "Export" }
            ]
          },
          {
            key: "leave_requests",
            label: "Leave Requests",
            route: "hr/leave-requests",
            actions: [
              { key: "apply", label: "Apply Leave" },
              { key: "approve", label: "Approve" },
              { key: "reject", label: "Reject" }
            ]
          },
          {
            key: "salary_structure",
            label: "Salary Structure",
            route: "hr/salary-structure",
            actions: [
              { key: "create", label: "Create Structure" },
              { key: "edit", label: "Edit" }
            ]
          },
          {
            key: "payroll",
            label: "Payroll",
            route: "hr/payroll",
            actions: [
              { key: "run", label: "Run Payroll" },
              { key: "approve", label: "Approve" },
              { key: "export", label: "Export Payslips" }
            ]
          },
          {
            key: "advances",
            label: "Advances",
            route: "hr/advances",
            actions: [
              { key: "create", label: "Issue Advance" },
              { key: "approve", label: "Approve" },
              { key: "reject", label: "Reject" }
            ]
          },
          {
            key: "loans",
            label: "Loans",
            route: "hr/loans",
            actions: [
              { key: "create", label: "Create Loan" },
              { key: "approve", label: "Approve" },
              { key: "reject", label: "Reject" }
            ]
          },
          {
            key: "overtime",
            label: "Overtime",
            route: "hr/overtime",
            actions: [
              { key: "record", label: "Record Overtime" },
              { key: "approve", label: "Approve" }
            ]
          },
          {
            key: "bonuses",
            label: "Bonuses",
            route: "hr/bonuses",
            actions: [
              { key: "create", label: "Create Bonus" },
              { key: "approve", label: "Approve" }
            ]
          },
          {
            key: "holidays",
            label: "Holidays",
            route: "hr/holidays",
            actions: [
              { key: "create", label: "Add Holiday" },
              { key: "edit", label: "Edit" },
              { key: "delete", label: "Delete" }
            ]
          },
          {
            key: "biometric",
            label: "Biometric",
            route: "hr/biometric",
            actions: [
              { key: "sync", label: "Sync Device" },
              { key: "export", label: "Export Log" }
            ]
          }
        ]
      }
    ];
    const scopes = [
      { value: "all", label: "All Data", desc: "Access records from all branches" },
      { value: "branch", label: "Branch Only", desc: "Restricted to selected branches below" },
      { value: "own", label: "Own Only", desc: "Only records created by this user" }
    ];
    const branches = [
      { value: "srg", label: "Sirajgonj" },
      { value: "demra", label: "Demra" },
      { value: "dhaka", label: "Dhaka" }
    ];
    const globalScope = ref("branch");
    const allowedBranches = ref(["srg"]);
    const loadError = ref("");
    const perms = ref({});
    const expanded = ref({});
    const user = ref({
      id: userId,
      name: "\u2026",
      email: "\u2014",
      role: "\u2014",
      lastLogin: null
    });
    function buildDefaultPerms() {
      const out = {};
      for (const mod of moduleRegistry) {
        out[mod.key] = { enabled: false, pages: [], actions: {} };
        expanded.value[mod.key] = false;
      }
      return out;
    }
    function mergePerms(saved) {
      const out = buildDefaultPerms();
      for (const mod of moduleRegistry) {
        const s = saved[mod.key];
        if (!s) continue;
        out[mod.key] = {
          enabled: Boolean(s.enabled),
          pages: Array.isArray(s.pages) ? s.pages : [],
          actions: typeof s.actions === "object" && s.actions ? s.actions : {}
        };
      }
      return out;
    }
    const { data, error } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      `/api/admin/users/${userId}/permissions`,
      "$H72hicMiTJ"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    if (error.value) {
      loadError.value = (_b = (_a = error.value) == null ? void 0 : _a.statusMessage) != null ? _b : "Failed to load permissions";
      perms.value = buildDefaultPerms();
    } else if (data.value) {
      const d = data.value;
      user.value = {
        id: (_d = (_c = d.user) == null ? void 0 : _c.id) != null ? _d : userId,
        name: (_f = (_e = d.user) == null ? void 0 : _e.name) != null ? _f : "\u2014",
        email: (_h = (_g = d.user) == null ? void 0 : _g.email) != null ? _h : "\u2014",
        role: (_j = (_i = d.user) == null ? void 0 : _i.role) != null ? _j : "\u2014",
        lastLogin: (_l = (_k = d.user) == null ? void 0 : _k.last_login) != null ? _l : null
      };
      globalScope.value = (_m = d.data_scope) != null ? _m : "branch";
      allowedBranches.value = (_n = d.allowed_branches) != null ? _n : ["srg"];
      perms.value = mergePerms((_o = d.permissions) != null ? _o : {});
    }
    const isDirty = ref(false);
    const changesCount = computed(() => isDirty.value ? 1 : 0);
    const enabledCount = computed(
      () => moduleRegistry.filter((m) => {
        var _a2;
        return (_a2 = perms.value[m.key]) == null ? void 0 : _a2.enabled;
      }).length
    );
    function isPageAllowed(mod, pg) {
      var _a2, _b2;
      return (_b2 = (_a2 = perms.value[mod]) == null ? void 0 : _a2.pages.includes(pg)) != null ? _b2 : false;
    }
    function isActionAllowed(mod, pg, act) {
      var _a2, _b2, _c2;
      return (_c2 = (_b2 = (_a2 = perms.value[mod]) == null ? void 0 : _a2.actions[pg]) == null ? void 0 : _b2[act]) != null ? _c2 : false;
    }
    function countActions(mod) {
      return mod.pages.reduce((s, p) => {
        var _a2, _b2;
        return s + ((_b2 = (_a2 = p.actions) == null ? void 0 : _a2.length) != null ? _b2 : 0);
      }, 0);
    }
    function allPagesEnabled(mod) {
      return mod.pages.every((p) => isPageAllowed(mod.key, p.key));
    }
    function somePagesEnabled(mod) {
      return mod.pages.some((p) => isPageAllowed(mod.key, p.key));
    }
    const saving = ref(false);
    const saveError = ref("");
    const saveSuccess = ref(false);
    async function save() {
      var _a2, _b2, _c2;
      if (saving.value) return;
      saving.value = true;
      saveError.value = "";
      saveSuccess.value = false;
      try {
        await $fetch(`/api/admin/users/${userId}/permissions`, {
          method: "PUT",
          body: {
            data_scope: globalScope.value,
            allowed_branches: allowedBranches.value,
            permissions: perms.value
          }
        });
        isDirty.value = false;
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3e3);
      } catch (e) {
        saveError.value = (_c2 = (_b2 = (_a2 = e == null ? void 0 : e.data) == null ? void 0 : _a2.statusMessage) != null ? _b2 : e == null ? void 0 : e.message) != null ? _c2 : "Save failed \u2014 check console";
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      const _component_UiPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-010346a7>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Permissions \u2014 ${unref(user).name}`,
        subtitle: unref(user).role,
        breadcrumb: ["Admin", "Users", unref(user).name, "Permissions"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs" data-v-010346a7${_scopeId}>\u2190 Back</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(saving) || unref(changesCount) === 0) ? " disabled" : ""} data-v-010346a7${_scopeId}>`);
            if (unref(saving)) {
              _push2(`<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" data-v-010346a7${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-010346a7${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" data-v-010346a7${_scopeId}></path></svg>`);
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
                disabled: unref(saving) || unref(changesCount) === 0,
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
      _push(`<div class="glass-card p-4 flex items-center gap-4" data-v-010346a7><div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,var(--accent-from),var(--accent-to))", "color": "var(--accent-text)" })}" data-v-010346a7>${ssrInterpolate((_a2 = unref(user).name[0]) != null ? _a2 : "?")}</div><div class="flex-1 min-w-0" data-v-010346a7><p class="text-sm font-semibold text-gray-200" data-v-010346a7>${ssrInterpolate(unref(user).name)}</p><p class="text-xs text-gray-500" data-v-010346a7>${ssrInterpolate(unref(user).email)} \xB7 Role: <span class="font-mono text-[11px]" style="${ssrRenderStyle({ "color": "var(--accent-from)" })}" data-v-010346a7>${ssrInterpolate(unref(user).role)}</span></p></div><div class="text-xs text-gray-600 text-right" data-v-010346a7><p data-v-010346a7>Last Login</p><p class="text-gray-400" data-v-010346a7>${ssrInterpolate(unref(user).lastLogin ? new Date(unref(user).lastLogin).toLocaleDateString() : "\u2014")}</p></div></div>`);
      if (unref(loadError)) {
        _push(`<div class="glass-card p-4 border border-red-500/30 text-red-400 text-sm" data-v-010346a7> \u26A0\uFE0F ${ssrInterpolate(unref(loadError))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-5" data-v-010346a7><h2 class="section-title mb-1" data-v-010346a7>Global Data Scope</h2><p class="text-xs text-gray-500 mb-4" data-v-010346a7>Controls which records this user can see across all modules.</p><div class="flex flex-wrap gap-5" data-v-010346a7><!--[-->`);
      ssrRenderList(scopes, (s) => {
        _push(`<label class="flex items-center gap-2.5 cursor-pointer group" data-v-010346a7><div class="${ssrRenderClass([
          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
          unref(globalScope) === s.value ? "border-amber-500 bg-amber-500/20" : "border-white/20 group-hover:border-white/40"
        ])}" data-v-010346a7>`);
        if (unref(globalScope) === s.value) {
          _push(`<div class="w-2 h-2 rounded-full bg-amber-400" data-v-010346a7></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div data-v-010346a7><p class="text-sm font-medium text-gray-300" data-v-010346a7>${ssrInterpolate(s.label)}</p><p class="text-[11px] text-gray-600" data-v-010346a7>${ssrInterpolate(s.desc)}</p></div></label>`);
      });
      _push(`<!--]--></div>`);
      if (unref(globalScope) === "branch") {
        _push(`<div class="mt-4 flex flex-wrap gap-3" data-v-010346a7><!--[-->`);
        ssrRenderList(branches, (b) => {
          _push(`<label class="flex items-center gap-2 cursor-pointer" data-v-010346a7><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(allowedBranches)) ? ssrLooseContain(unref(allowedBranches), b.value) : unref(allowedBranches)) ? " checked" : ""}${ssrRenderAttr("value", b.value)} class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500" data-v-010346a7><span class="text-sm text-gray-300" data-v-010346a7>${ssrInterpolate(b.label)}</span></label>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center gap-3 px-1" data-v-010346a7><button class="btn-ghost text-xs" data-v-010346a7>Enable All Modules</button><button class="btn-ghost text-xs" data-v-010346a7>Disable All</button><button class="btn-ghost text-xs" data-v-010346a7>Expand All</button><button class="btn-ghost text-xs" data-v-010346a7>Collapse All</button><span class="flex-1" data-v-010346a7></span><span class="text-xs text-gray-600" data-v-010346a7>${ssrInterpolate(unref(enabledCount))} / ${ssrInterpolate(moduleRegistry.length)} modules enabled </span></div><div class="space-y-2" data-v-010346a7><!--[-->`);
      ssrRenderList(moduleRegistry, (mod) => {
        var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2;
        _push(`<div class="${ssrRenderClass([((_a3 = unref(perms)[mod.key]) == null ? void 0 : _a3.enabled) ? "" : "opacity-60", "glass-card overflow-hidden transition-opacity"])}" data-v-010346a7><div class="${ssrRenderClass([unref(expanded)[mod.key] && ((_b2 = unref(perms)[mod.key]) == null ? void 0 : _b2.enabled) ? "border-b border-white/[0.05]" : "", "flex items-center gap-3 p-4 cursor-pointer select-none"])}" data-v-010346a7><div class="${ssrRenderClass([
          "w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0",
          ((_c2 = unref(perms)[mod.key]) == null ? void 0 : _c2.enabled) ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/[0.04] border border-white/[0.08]"
        ])}" data-v-010346a7>${ssrInterpolate(mod.icon)}</div><div class="flex-1 min-w-0" data-v-010346a7><p class="text-sm font-semibold text-gray-200" data-v-010346a7>${ssrInterpolate(mod.label)}</p><p class="text-xs text-gray-600" data-v-010346a7>${ssrInterpolate(mod.pages.length)} pages \xB7 ${ssrInterpolate(countActions(mod))} actions</p></div>`);
        if ((_d2 = unref(perms)[mod.key]) == null ? void 0 : _d2.enabled) {
          _push(`<div class="text-[11px] text-gray-600 shrink-0 mr-2 hidden sm:block" data-v-010346a7>${ssrInterpolate((_g2 = (_f2 = (_e2 = unref(perms)[mod.key]) == null ? void 0 : _e2.pages) == null ? void 0 : _f2.length) != null ? _g2 : 0)}/${ssrInterpolate(mod.pages.length)} pages </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="${ssrRenderClass([
          "relative w-11 h-6 rounded-full transition-all duration-200 border shrink-0",
          ((_h2 = unref(perms)[mod.key]) == null ? void 0 : _h2.enabled) ? "bg-amber-500/20 border-amber-500/40" : "bg-white/[0.05] border-white/[0.08]"
        ])}" data-v-010346a7><span class="${ssrRenderClass([
          "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200",
          ((_i2 = unref(perms)[mod.key]) == null ? void 0 : _i2.enabled) ? "left-5 bg-amber-400" : "left-0.5 bg-gray-600"
        ])}" data-v-010346a7></span></button><svg class="${ssrRenderClass([unref(expanded)[mod.key] ? "rotate-180" : "", "w-4 h-4 text-gray-600 transition-transform duration-200 shrink-0"])}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-010346a7><path d="m6 9 6 6 6-6" data-v-010346a7></path></svg></div>`);
        if (unref(expanded)[mod.key] && ((_j2 = unref(perms)[mod.key]) == null ? void 0 : _j2.enabled)) {
          _push(`<div class="divide-y divide-white/[0.04]" data-v-010346a7><div class="px-4 py-2 flex items-center gap-3 bg-white/[0.02]" data-v-010346a7><input type="checkbox"${ssrRenderAttr("id", `mod-all-${mod.key}`)}${ssrIncludeBooleanAttr(allPagesEnabled(mod)) ? " checked" : ""}${ssrRenderAttr("indeterminate", somePagesEnabled(mod) && !allPagesEnabled(mod))} class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500" data-v-010346a7><label${ssrRenderAttr("for", `mod-all-${mod.key}`)} class="text-xs text-gray-500 cursor-pointer select-none" data-v-010346a7> Select all pages &amp; actions </label></div><!--[-->`);
          ssrRenderList(mod.pages, (pg) => {
            var _a4, _b3;
            _push(`<div class="p-4" data-v-010346a7><div class="flex items-center gap-3 mb-2" data-v-010346a7><input type="checkbox"${ssrRenderAttr("id", `pg-${mod.key}-${pg.key}`)}${ssrIncludeBooleanAttr(isPageAllowed(mod.key, pg.key)) ? " checked" : ""} class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500 shrink-0" data-v-010346a7><label${ssrRenderAttr("for", `pg-${mod.key}-${pg.key}`)} class="text-sm font-medium text-gray-300 cursor-pointer select-none flex-1" data-v-010346a7>${ssrInterpolate(pg.label)}</label><span class="text-[10px] font-mono text-gray-700 shrink-0" data-v-010346a7>/${ssrInterpolate(pg.route)}</span></div>`);
            if (((_a4 = pg.actions) == null ? void 0 : _a4.length) && isPageAllowed(mod.key, pg.key)) {
              _push(`<div class="ml-7 flex flex-wrap gap-x-4 gap-y-1.5" data-v-010346a7><!--[-->`);
              ssrRenderList(pg.actions, (act) => {
                _push(`<label class="flex items-center gap-1.5 cursor-pointer group" data-v-010346a7><input type="checkbox"${ssrIncludeBooleanAttr(isActionAllowed(mod.key, pg.key, act.key)) ? " checked" : ""} class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-500 shrink-0" data-v-010346a7><span class="${ssrRenderClass([
                  "text-xs transition-colors",
                  isActionAllowed(mod.key, pg.key, act.key) ? "text-gray-400 group-hover:text-gray-300" : "text-gray-700 group-hover:text-gray-600"
                ])}" data-v-010346a7>${ssrInterpolate(act.label)}</span></label>`);
              });
              _push(`<!--]--></div>`);
            } else if (((_b3 = pg.actions) == null ? void 0 : _b3.length) && !isPageAllowed(mod.key, pg.key)) {
              _push(`<div class="ml-7 text-[11px] text-gray-700 italic" data-v-010346a7> Enable page to configure actions </div>`);
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
      _push(`<!--]--></div><div class="sticky bottom-4 flex justify-end pt-2" data-v-010346a7><div class="glass-card px-4 py-3 flex items-center gap-3 shadow-xl" data-v-010346a7>`);
      if (unref(saveSuccess)) {
        _push(`<span class="text-xs text-green-400 font-medium" data-v-010346a7>\u2713 Saved successfully</span>`);
      } else if (unref(saveError)) {
        _push(`<span class="text-xs text-red-400 max-w-xs truncate" data-v-010346a7>\u26A0 ${ssrInterpolate(unref(saveError))}</span>`);
      } else {
        _push(`<span class="${ssrRenderClass([unref(changesCount) ? "text-amber-400" : "text-gray-500", "text-xs"])}" data-v-010346a7>${ssrInterpolate(unref(changesCount) ? "Unsaved changes" : "No unsaved changes")}</span>`);
      }
      _push(`<button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(unref(saving) || !unref(changesCount)) ? " disabled" : ""} data-v-010346a7>Reset</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(saving) || !unref(changesCount)) ? " disabled" : ""} data-v-010346a7>`);
      if (unref(saving)) {
        _push(`<svg class="w-3.5 h-3.5 animate-spin mr-1 inline" fill="none" viewBox="0 0 24 24" data-v-010346a7><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-010346a7></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" data-v-010346a7></path></svg>`);
      } else {
        _push(`<!---->`);
      }
      _push(` ${ssrInterpolate(unref(saving) ? "Saving\u2026" : "Save Permissions")}</button></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/[id]/permissions.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const permissions = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-010346a7"]]);

export { permissions as default };
//# sourceMappingURL=permissions-DJWcAk5X.mjs.map
