import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { defineComponent, ref, withAsyncContext, reactive, watch, computed, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrLooseContain, ssrRenderAttr } from 'vue/server-renderer';
import { c as _export_sfc, k as useRoute } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import '../nitro/nitro.mjs';
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
            label: "All Sales & Order Detail",
            route: "credit-sales/all",
            actions: [
              { key: "create", label: "Create Order" },
              { key: "edit", label: "Edit Order (admin header edit)" },
              { key: "delete", label: "Delete Order" },
              { key: "export", label: "Export CSV" },
              { key: "print", label: "Print Invoice" },
              { key: "collect_payment", label: "Collect Payment" },
              { key: "record_delivery", label: "Record Delivery" },
              { key: "record_return", label: "Record Return" },
              { key: "record_over_delivery", label: "Record Over-Delivery" },
              { key: "request_amendment", label: "Request Amendment" },
              { key: "telegram", label: "Send Telegram Alert" },
              { key: "cancel", label: "Cancel Order" }
            ]
          },
          {
            key: "create",
            label: "Create Order Form",
            route: "credit-sales/create",
            actions: [
              { key: "submit", label: "Submit Order" },
              { key: "take_advance", label: "Take Advance Payment" },
              { key: "mini_truck", label: "Choose Mini-Truck Delivery" }
            ]
          },
          {
            key: "approve",
            label: "Approve Orders",
            route: "credit-sales/approve",
            actions: [
              { key: "approve", label: "Approve (within personal limit / 80% rule)" },
              { key: "reject", label: "Reject" },
              { key: "escalate", label: "Escalate to Admin" },
              { key: "set_conditions", label: "Set Special Instructions (holds & payment conditions)" }
            ]
          },
          {
            key: "production",
            label: "Production Queue",
            route: "credit-sales/production",
            actions: [
              { key: "start_production", label: "Start Production" },
              { key: "mark_ready", label: "Mark Ready to Ship" },
              { key: "set_priority", label: "Reorder Queue / Set Priority" }
            ]
          },
          {
            key: "dispatch",
            label: "Dispatch Queue",
            route: "credit-sales/dispatch",
            actions: [
              { key: "mark_dispatched", label: "Goods on Board (posts invoice to ledger)" },
              { key: "mark_shipped", label: "Mark Shipped (truck departed)" }
            ]
          },
          {
            key: "payment-watch",
            label: "Payment Watch",
            route: "credit-sales/payment-watch",
            actions: [
              { key: "set_conditions", label: "Set / Edit Hold Conditions" },
              { key: "clear_dispatch", label: "Grant Dispatch Clearance" },
              { key: "revoke_dispatch", label: "Revoke Dispatch Clearance" }
            ]
          },
          {
            key: "approval-requests",
            label: "Approval Requests (maker/checker)",
            route: "credit-sales/approval-requests",
            actions: [
              { key: "decide", label: "Approve / Reject Queued Payments" }
            ]
          },
          {
            key: "over-deliveries",
            label: "Over-Deliveries",
            route: "credit-sales/over-deliveries",
            actions: [
              { key: "decide", label: "Approve / Reject Over-Deliveries" },
              { key: "mark_retrieved", label: "Mark Goods Retrieved" }
            ]
          },
          {
            key: "collect",
            label: "Collect Payment (customer-level)",
            route: "credit-sales/collect",
            actions: [
              { key: "collect", label: "Record Payment" },
              { key: "allocate", label: "Allocate Across Orders" }
            ]
          },
          {
            key: "payments",
            label: "Payment History",
            route: "credit-sales/payments",
            actions: [
              { key: "export", label: "Export CSV" },
              { key: "reverse", label: "Reverse Payment" },
              { key: "print_receipt", label: "Print Money Receipt" }
            ]
          },
          {
            key: "amendments",
            label: "Amendments",
            route: "credit-sales/all",
            actions: [
              { key: "decide", label: "Approve / Reject Amendments" }
            ]
          },
          {
            key: "ledger",
            label: "Customer Ledger",
            route: "credit-sales/ledger",
            actions: [
              { key: "export", label: "Export CSV" }
            ]
          },
          {
            key: "ageing",
            label: "Ageing Report",
            route: "credit-sales/ageing",
            actions: [
              { key: "export", label: "Export CSV" }
            ]
          },
          {
            key: "credit-limits",
            label: "Credit Limits",
            route: "credit-sales/credit-limits",
            actions: [
              { key: "edit_limits", label: "Edit Customer Credit Limits" }
            ]
          },
          {
            key: "order_status",
            label: "Order Status Override (admin)",
            route: "credit-sales/order-status",
            actions: []
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
            key: "commodities",
            label: "Commodities",
            route: "purchase/commodities",
            actions: [
              { key: "create", label: "Add Commodity" },
              { key: "edit", label: "Edit" }
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
            key: "reconciliation",
            label: "Bank Reconciliation",
            route: "bank/reconciliation",
            actions: [
              { key: "reconcile", label: "Mark Transactions Reconciled" }
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
          },
          {
            key: "stock_adjustments",
            label: "Stock Adjustments (maker/checker)",
            route: "products/stock-adjustments",
            actions: [
              { key: "create", label: "Submit Adjustment" },
              { key: "decide", label: "Approve / Reject Adjustments" }
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
    const authority = reactive({ max_order_amount: 0, max_transaction_amount: 0 });
    const actionLimitDefs = [
      { key: "approve_order", label: "Approve Order (\u09F3)" },
      { key: "amend_order", label: "Amend Order (\u09F3)" },
      { key: "collect_payment", label: "Collect Payment (\u09F3)" },
      { key: "partial_delivery", label: "Partial Delivery (\u09F3)" },
      { key: "commodity_sale", label: "Commodity Sale (\u09F3)" },
      { key: "loan_disbursement", label: "Loan Disbursement (\u09F3)" }
    ];
    const actionLimits = reactive({
      approve_order: 0,
      amend_order: 0,
      collect_payment: 0,
      partial_delivery: 0,
      commodity_sale: 0,
      loan_disbursement: 0
    });
    const savingAuthority = ref(false);
    useToast();
    const { data: limitsData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/credit-sales/approval-limits",
      { ignoreResponseError: true },
      "$6wCsiGjeG7"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(limitsData, (d) => {
      var _a2, _b2, _c2, _d2, _e2;
      const row = ((_a2 = d == null ? void 0 : d.users) != null ? _a2 : []).find((u) => u.id === userId);
      if (row) {
        authority.max_order_amount = Number((_b2 = row.max_order_amount) != null ? _b2 : 0);
        authority.max_transaction_amount = Number((_c2 = row.max_transaction_amount) != null ? _c2 : 0);
        for (const al of (_d2 = row.action_limits) != null ? _d2 : []) {
          if (al.action_key in actionLimits) actionLimits[al.action_key] = Number((_e2 = al.max_amount) != null ? _e2 : 0);
        }
      }
    }, { immediate: true });
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-3b76384c>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: `Permissions \u2014 ${unref(user).name}`,
        subtitle: unref(user).role,
        breadcrumb: ["Admin", "Users", unref(user).name, "Permissions"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs" data-v-3b76384c${_scopeId}>\u2190 Back</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(saving) || unref(changesCount) === 0) ? " disabled" : ""} data-v-3b76384c${_scopeId}>`);
            if (unref(saving)) {
              _push2(`<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" data-v-3b76384c${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-3b76384c${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" data-v-3b76384c${_scopeId}></path></svg>`);
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
      _push(`<div class="glass-card p-4 flex items-center gap-4" data-v-3b76384c><div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-black shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg,var(--accent-from),var(--accent-to))", "color": "var(--accent-text)" })}" data-v-3b76384c>${ssrInterpolate((_a2 = unref(user).name[0]) != null ? _a2 : "?")}</div><div class="flex-1 min-w-0" data-v-3b76384c><p class="text-sm font-semibold text-gray-200" data-v-3b76384c>${ssrInterpolate(unref(user).name)}</p><p class="text-xs text-gray-500" data-v-3b76384c>${ssrInterpolate(unref(user).email)} \xB7 Role: <span class="font-mono text-[11px]" style="${ssrRenderStyle({ "color": "var(--accent-from)" })}" data-v-3b76384c>${ssrInterpolate(unref(user).role)}</span></p></div><div class="text-xs text-gray-600 text-right" data-v-3b76384c><p data-v-3b76384c>Last Login</p><p class="text-gray-400" data-v-3b76384c>${ssrInterpolate(unref(user).lastLogin ? new Date(unref(user).lastLogin).toLocaleDateString() : "\u2014")}</p></div></div>`);
      if (unref(loadError)) {
        _push(`<div class="glass-card p-4 border border-red-500/30 text-red-400 text-sm" data-v-3b76384c> \u26A0\uFE0F ${ssrInterpolate(unref(loadError))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="glass-card p-5" data-v-3b76384c><h2 class="section-title mb-1" data-v-3b76384c>Global Data Scope</h2><p class="text-xs text-gray-500 mb-4" data-v-3b76384c>Controls which records this user can see across all modules.</p><div class="flex flex-wrap gap-5" data-v-3b76384c><!--[-->`);
      ssrRenderList(scopes, (s) => {
        _push(`<label class="flex items-center gap-2.5 cursor-pointer group" data-v-3b76384c><div class="${ssrRenderClass([
          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
          unref(globalScope) === s.value ? "border-amber-500 bg-amber-500/20" : "border-white/20 group-hover:border-white/40"
        ])}" data-v-3b76384c>`);
        if (unref(globalScope) === s.value) {
          _push(`<div class="w-2 h-2 rounded-full bg-amber-400" data-v-3b76384c></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div data-v-3b76384c><p class="text-sm font-medium text-gray-300" data-v-3b76384c>${ssrInterpolate(s.label)}</p><p class="text-[11px] text-gray-600" data-v-3b76384c>${ssrInterpolate(s.desc)}</p></div></label>`);
      });
      _push(`<!--]--></div>`);
      if (unref(globalScope) === "branch") {
        _push(`<div class="mt-4 flex flex-wrap gap-3" data-v-3b76384c><!--[-->`);
        ssrRenderList(branches, (b) => {
          _push(`<label class="flex items-center gap-2 cursor-pointer" data-v-3b76384c><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(allowedBranches)) ? ssrLooseContain(unref(allowedBranches), b.value) : unref(allowedBranches)) ? " checked" : ""}${ssrRenderAttr("value", b.value)} class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500" data-v-3b76384c><span class="text-sm text-gray-300" data-v-3b76384c>${ssrInterpolate(b.label)}</span></label>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="glass-card p-5 border border-gold-500/15" data-v-3b76384c><h2 class="section-title mb-1" data-v-3b76384c>Credit Authority</h2><p class="text-xs text-gray-500 mb-4" data-v-3b76384c> Delegated money powers, enforced server-side. A personal <strong class="text-gray-400" data-v-3b76384c>order approval limit</strong> lets this user approve orders (even escalated ones) up to that amount \u2014 it overrides the 80% rule. A <strong class="text-gray-400" data-v-3b76384c>transaction limit</strong> caps every single payment they can record. 0 = not delegated. </p><div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end" data-v-3b76384c><div class="space-y-1.5" data-v-3b76384c><label class="text-[11px] text-gray-500 uppercase tracking-wider" data-v-3b76384c>Order Approval Limit (\u09F3)</label><input${ssrRenderAttr("value", unref(authority).max_order_amount)} type="number" min="0" step="1000" class="input-glass w-full font-mono text-center" placeholder="0 \u2014 cannot approve beyond 80% rule" data-v-3b76384c></div><div class="space-y-1.5" data-v-3b76384c><label class="text-[11px] text-gray-500 uppercase tracking-wider" data-v-3b76384c>Transaction Limit (\u09F3 / payment)</label><input${ssrRenderAttr("value", unref(authority).max_transaction_amount)} type="number" min="0" step="1000" class="input-glass w-full font-mono text-center" placeholder="0 \u2014 no personal cap" data-v-3b76384c></div><button${ssrIncludeBooleanAttr(unref(savingAuthority)) ? " disabled" : ""} class="btn-gold text-xs py-2.5 disabled:opacity-50" data-v-3b76384c>${ssrInterpolate(unref(savingAuthority) ? "Saving\u2026" : "Save Authority Limits")}</button></div><div class="mt-4 pt-4 border-t border-white/[0.06]" data-v-3b76384c><p class="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-1" data-v-3b76384c>Per-Action Overrides (optional)</p><p class="text-[11px] text-gray-600 mb-3 leading-snug" data-v-3b76384c> A per-action limit overrides the defaults above for that specific action only. Blank/0 = use the default (order-approval limit for approving/amending, transaction limit for collecting). </p><div class="grid grid-cols-2 sm:grid-cols-4 gap-3" data-v-3b76384c><!--[-->`);
      ssrRenderList(actionLimitDefs, (al) => {
        _push(`<div class="space-y-1.5" data-v-3b76384c><label class="text-[11px] text-gray-500" data-v-3b76384c>${ssrInterpolate(al.label)}</label><input${ssrRenderAttr("value", unref(actionLimits)[al.key])} type="number" min="0" step="1000" class="input-glass w-full font-mono text-center text-xs" placeholder="default" data-v-3b76384c></div>`);
      });
      _push(`<!--]--></div></div><p class="text-[11px] text-gray-600 mt-3" data-v-3b76384c> Amendment approvals follow the order approval limit (increases only; decreases are always allowed for delegated users). Dispatch clearance / hold powers are toggled below under <strong class="text-gray-500" data-v-3b76384c>Payment Watch</strong>. </p></div><div class="flex items-center gap-3 px-1" data-v-3b76384c><button class="btn-ghost text-xs" data-v-3b76384c>Enable All Modules</button><button class="btn-ghost text-xs" data-v-3b76384c>Disable All</button><button class="btn-ghost text-xs" data-v-3b76384c>Expand All</button><button class="btn-ghost text-xs" data-v-3b76384c>Collapse All</button><span class="flex-1" data-v-3b76384c></span><span class="text-xs text-gray-600" data-v-3b76384c>${ssrInterpolate(unref(enabledCount))} / ${ssrInterpolate(moduleRegistry.length)} modules enabled </span></div><div class="space-y-2" data-v-3b76384c><!--[-->`);
      ssrRenderList(moduleRegistry, (mod) => {
        var _a3, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2;
        _push(`<div class="${ssrRenderClass([((_a3 = unref(perms)[mod.key]) == null ? void 0 : _a3.enabled) ? "" : "opacity-60", "glass-card overflow-hidden transition-opacity"])}" data-v-3b76384c><div class="${ssrRenderClass([unref(expanded)[mod.key] && ((_b2 = unref(perms)[mod.key]) == null ? void 0 : _b2.enabled) ? "border-b border-white/[0.05]" : "", "flex items-center gap-3 p-4 cursor-pointer select-none"])}" data-v-3b76384c><div class="${ssrRenderClass([
          "w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0",
          ((_c2 = unref(perms)[mod.key]) == null ? void 0 : _c2.enabled) ? "bg-amber-500/10 border border-amber-500/20" : "bg-white/[0.04] border border-white/[0.08]"
        ])}" data-v-3b76384c>${ssrInterpolate(mod.icon)}</div><div class="flex-1 min-w-0" data-v-3b76384c><p class="text-sm font-semibold text-gray-200" data-v-3b76384c>${ssrInterpolate(mod.label)}</p><p class="text-xs text-gray-600" data-v-3b76384c>${ssrInterpolate(mod.pages.length)} pages \xB7 ${ssrInterpolate(countActions(mod))} actions</p></div>`);
        if ((_d2 = unref(perms)[mod.key]) == null ? void 0 : _d2.enabled) {
          _push(`<div class="text-[11px] text-gray-600 shrink-0 mr-2 hidden sm:block" data-v-3b76384c>${ssrInterpolate((_g2 = (_f2 = (_e2 = unref(perms)[mod.key]) == null ? void 0 : _e2.pages) == null ? void 0 : _f2.length) != null ? _g2 : 0)}/${ssrInterpolate(mod.pages.length)} pages </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="${ssrRenderClass([
          "relative w-11 h-6 rounded-full transition-all duration-200 border shrink-0",
          ((_h2 = unref(perms)[mod.key]) == null ? void 0 : _h2.enabled) ? "bg-amber-500/20 border-amber-500/40" : "bg-white/[0.05] border-white/[0.08]"
        ])}" data-v-3b76384c><span class="${ssrRenderClass([
          "absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200",
          ((_i2 = unref(perms)[mod.key]) == null ? void 0 : _i2.enabled) ? "left-5 bg-amber-400" : "left-0.5 bg-gray-600"
        ])}" data-v-3b76384c></span></button><svg class="${ssrRenderClass([unref(expanded)[mod.key] ? "rotate-180" : "", "w-4 h-4 text-gray-600 transition-transform duration-200 shrink-0"])}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-3b76384c><path d="m6 9 6 6 6-6" data-v-3b76384c></path></svg></div>`);
        if (unref(expanded)[mod.key] && ((_j2 = unref(perms)[mod.key]) == null ? void 0 : _j2.enabled)) {
          _push(`<div class="divide-y divide-white/[0.04]" data-v-3b76384c><div class="px-4 py-2 flex items-center gap-3 bg-white/[0.02]" data-v-3b76384c><input type="checkbox"${ssrRenderAttr("id", `mod-all-${mod.key}`)}${ssrIncludeBooleanAttr(allPagesEnabled(mod)) ? " checked" : ""}${ssrRenderAttr("indeterminate", somePagesEnabled(mod) && !allPagesEnabled(mod))} class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500" data-v-3b76384c><label${ssrRenderAttr("for", `mod-all-${mod.key}`)} class="text-xs text-gray-500 cursor-pointer select-none" data-v-3b76384c> Select all pages &amp; actions </label></div><!--[-->`);
          ssrRenderList(mod.pages, (pg) => {
            var _a4, _b3;
            _push(`<div class="p-4" data-v-3b76384c><div class="flex items-center gap-3 mb-2" data-v-3b76384c><input type="checkbox"${ssrRenderAttr("id", `pg-${mod.key}-${pg.key}`)}${ssrIncludeBooleanAttr(isPageAllowed(mod.key, pg.key)) ? " checked" : ""} class="w-4 h-4 rounded border-white/20 bg-white/5 accent-amber-500 shrink-0" data-v-3b76384c><label${ssrRenderAttr("for", `pg-${mod.key}-${pg.key}`)} class="text-sm font-medium text-gray-300 cursor-pointer select-none flex-1" data-v-3b76384c>${ssrInterpolate(pg.label)}</label><span class="text-[10px] font-mono text-gray-700 shrink-0" data-v-3b76384c>/${ssrInterpolate(pg.route)}</span></div>`);
            if (((_a4 = pg.actions) == null ? void 0 : _a4.length) && isPageAllowed(mod.key, pg.key)) {
              _push(`<div class="ml-7 flex flex-wrap gap-x-4 gap-y-1.5" data-v-3b76384c><!--[-->`);
              ssrRenderList(pg.actions, (act) => {
                _push(`<label class="flex items-center gap-1.5 cursor-pointer group" data-v-3b76384c><input type="checkbox"${ssrIncludeBooleanAttr(isActionAllowed(mod.key, pg.key, act.key)) ? " checked" : ""} class="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-500 shrink-0" data-v-3b76384c><span class="${ssrRenderClass([
                  "text-xs transition-colors",
                  isActionAllowed(mod.key, pg.key, act.key) ? "text-gray-400 group-hover:text-gray-300" : "text-gray-700 group-hover:text-gray-600"
                ])}" data-v-3b76384c>${ssrInterpolate(act.label)}</span></label>`);
              });
              _push(`<!--]--></div>`);
            } else if (((_b3 = pg.actions) == null ? void 0 : _b3.length) && !isPageAllowed(mod.key, pg.key)) {
              _push(`<div class="ml-7 text-[11px] text-gray-700 italic" data-v-3b76384c> Enable page to configure actions </div>`);
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
      _push(`<!--]--></div><div class="sticky bottom-4 flex justify-end pt-2" data-v-3b76384c><div class="glass-card px-4 py-3 flex items-center gap-3 shadow-xl" data-v-3b76384c>`);
      if (unref(saveSuccess)) {
        _push(`<span class="text-xs text-green-400 font-medium" data-v-3b76384c>\u2713 Saved successfully</span>`);
      } else if (unref(saveError)) {
        _push(`<span class="text-xs text-red-400 max-w-xs truncate" data-v-3b76384c>\u26A0 ${ssrInterpolate(unref(saveError))}</span>`);
      } else {
        _push(`<span class="${ssrRenderClass([unref(changesCount) ? "text-amber-400" : "text-gray-500", "text-xs"])}" data-v-3b76384c>${ssrInterpolate(unref(changesCount) ? "Unsaved changes" : "No unsaved changes")}</span>`);
      }
      _push(`<button class="btn-ghost text-xs"${ssrIncludeBooleanAttr(unref(saving) || !unref(changesCount)) ? " disabled" : ""} data-v-3b76384c>Reset</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(saving) || !unref(changesCount)) ? " disabled" : ""} data-v-3b76384c>`);
      if (unref(saving)) {
        _push(`<svg class="w-3.5 h-3.5 animate-spin mr-1 inline" fill="none" viewBox="0 0 24 24" data-v-3b76384c><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-3b76384c></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" data-v-3b76384c></path></svg>`);
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
const permissions = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3b76384c"]]);

export { permissions as default };
//# sourceMappingURL=permissions-P8Mv4xyB.mjs.map
