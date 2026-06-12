import { p as useUserSession, o as useState } from './server.mjs';
import { computed, readonly } from 'vue';

const PERM_ROUTES = {
  "/dashboard": { module: "dashboard", page: "main" },
  "/credit-sales": { module: "credit_sales", page: "dashboard" },
  "/credit-sales/all": { module: "credit_sales", page: "all" },
  "/credit-sales/create": { module: "credit_sales", page: "create" },
  "/credit-sales/approve": { module: "credit_sales", page: "approve" },
  "/credit-sales/production": { module: "credit_sales", page: "production" },
  "/credit-sales/dispatch": { module: "credit_sales", page: "dispatch" },
  "/credit-sales/ledger": { module: "credit_sales", page: "ledger" },
  "/credit-sales/ageing": { module: "credit_sales", page: "ageing" },
  "/fleet": { module: "fleet", page: "dashboard" },
  "/fleet/vehicles": { module: "fleet", page: "vehicles" },
  "/fleet/drivers": { module: "fleet", page: "drivers" },
  "/fleet/trips": { module: "fleet", page: "trips" },
  "/fleet/maintenance": { module: "fleet", page: "maintenance" },
  "/fleet/maintenance/rules": { module: "fleet", page: "pm_rules" },
  "/fleet/fuel": { module: "fleet", page: "fuel" },
  "/fleet/fuel/efficiency": { module: "fleet", page: "fuel_report" },
  "/fleet/purchases": { module: "fleet", page: "purchases" },
  "/fleet/items": { module: "fleet", page: "items" },
  "/fleet/reports": { module: "fleet", page: "reports" },
  "/purchase": { module: "purchase", page: "dashboard" },
  "/purchase/orders": { module: "purchase", page: "orders" },
  "/purchase/orders/create": { module: "purchase", page: "orders_create" },
  "/purchase/grn": { module: "purchase", page: "grn" },
  "/purchase/grn/variance": { module: "purchase", page: "grn_variance" },
  "/purchase/payments": { module: "purchase", page: "payments" },
  "/purchase/adjustments": { module: "purchase", page: "adjustments" },
  "/purchase/suppliers": { module: "purchase", page: "suppliers" },
  "/purchase/suppliers/summary": { module: "purchase", page: "suppliers_summary" },
  "/expenses": { module: "expenses", page: "dashboard" },
  "/expenses/create": { module: "expenses", page: "create" },
  "/expenses/history": { module: "expenses", page: "history" },
  "/expenses/approve": { module: "expenses", page: "approve" },
  "/expenses/categories": { module: "expenses", page: "categories" },
  "/bank": { module: "bank", page: "dashboard" },
  "/bank/transaction/create": { module: "bank", page: "transaction" },
  "/bank/transfer": { module: "bank", page: "transfer" },
  "/bank/statement": { module: "bank", page: "statement" },
  "/bank/accounts": { module: "bank", page: "accounts" },
  "/accounts/coa": { module: "accounts", page: "coa" },
  "/accounts/journal/create": { module: "accounts", page: "journal_create" },
  "/accounts/statement": { module: "accounts", page: "statement" },
  "/accounts/voucher": { module: "accounts", page: "voucher" },
  "/accounts/daily-log": { module: "accounts", page: "daily_log" },
  "/sales": { module: "sales", page: "report" },
  "/production": { module: "production", page: "dashboard" },
  "/production/create": { module: "production", page: "create" },
  "/dispatch": { module: "dispatch", page: "queue" },
  "/collector": { module: "collector", page: "collections" },
  "/customers": { module: "customers", page: "list" },
  "/products": { module: "products", page: "overview" },
  "/products/base": { module: "products", page: "base" },
  "/products/variants": { module: "products", page: "variants" },
  "/products/pricing": { module: "products", page: "pricing" },
  "/products/pricing-engine": { module: "products", page: "pricing_engine" },
  "/products/inventory": { module: "products", page: "inventory" },
  "/pos": { module: "pos", page: "terminal" },
  "/admin": { module: "admin", page: "dashboard" },
  "/admin/users": { module: "admin", page: "users" },
  "/admin/audit": { module: "admin", page: "audit" },
  "/admin/settings": { module: "admin", page: "settings" },
  "/admin/employees": { module: "admin", page: "employees" },
  "/hr": { module: "hr", page: "dashboard" },
  "/hr/employees": { module: "hr", page: "employees" },
  "/hr/attendance": { module: "hr", page: "attendance" },
  "/hr/leave-requests": { module: "hr", page: "leave_requests" },
  "/hr/salary-structure": { module: "hr", page: "salary_structure" },
  "/hr/payroll": { module: "hr", page: "payroll" },
  "/hr/advances": { module: "hr", page: "advances" },
  "/hr/loans": { module: "hr", page: "loans" },
  "/hr/overtime": { module: "hr", page: "overtime" },
  "/hr/bonuses": { module: "hr", page: "bonuses" },
  "/hr/holidays": { module: "hr", page: "holidays" },
  "/hr/biometric": { module: "hr", page: "biometric" }
};
function permRouteFor(path) {
  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  let best = null;
  let bestLen = 0;
  for (const [route, entry] of Object.entries(PERM_ROUTES)) {
    if ((clean === route || clean.startsWith(route + "/")) && route.length > bestLen) {
      best = entry;
      bestLen = route.length;
    }
  }
  return best;
}
const ROUTE_MODULE_MAP = {
  dashboard: "dashboard",
  "credit-sales": "credit_sales",
  fleet: "fleet",
  purchase: "purchase",
  expenses: "expenses",
  bank: "bank",
  accounts: "accounts",
  sales: "sales",
  production: "production",
  dispatch: "dispatch",
  collector: "collector",
  customers: "customers",
  products: "products",
  pos: "pos",
  admin: "admin",
  hr: "hr"
};
const DEFAULT_STATE = () => ({
  loaded: false,
  isAdmin: false,
  data_scope: "branch",
  allowed_branches: [],
  permissions: {},
  userId: null
});
const usePermissions = () => {
  const { user } = useUserSession();
  const state = useState("user-perms", DEFAULT_STATE);
  const sessionIsAdmin = computed(
    () => {
      var _a, _b;
      return ["admin", "superadmin"].includes(((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    }
  );
  async function load(force = false) {
    var _a, _b, _c, _d;
    const uid = (_b = (_a = user.value) == null ? void 0 : _a.id) != null ? _b : null;
    if (!force && state.value.loaded && state.value.userId === uid) return;
    try {
      const data = await $fetch("/api/me/permissions");
      state.value = {
        loaded: true,
        isAdmin: data.isAdmin,
        data_scope: data.data_scope,
        allowed_branches: (_c = data.allowed_branches) != null ? _c : [],
        permissions: (_d = data.permissions) != null ? _d : {},
        userId: uid
      };
    } catch {
      state.value = { ...DEFAULT_STATE(), loaded: true, userId: uid };
    }
  }
  function clear() {
    state.value = DEFAULT_STATE();
  }
  function canAccessModule(key) {
    if (sessionIsAdmin.value) return true;
    if (!state.value.loaded) return false;
    if (state.value.isAdmin) return true;
    const mod = state.value.permissions[key];
    if (!mod) return false;
    return mod.enabled === true;
  }
  function canAccessPage(module, page) {
    if (sessionIsAdmin.value) return true;
    if (!state.value.loaded) return false;
    if (state.value.isAdmin) return true;
    const mod = state.value.permissions[module];
    if (!(mod == null ? void 0 : mod.enabled)) return false;
    if (!Array.isArray(mod.pages) || mod.pages.length === 0) return true;
    return mod.pages.includes(page);
  }
  function canDo(module, page, action) {
    var _a, _b;
    if (sessionIsAdmin.value) return true;
    if (!state.value.loaded) return false;
    if (state.value.isAdmin) return true;
    const mod = state.value.permissions[module];
    if (!(mod == null ? void 0 : mod.enabled)) return false;
    if (!Array.isArray(mod.pages) || mod.pages.length === 0) return true;
    if (!mod.pages.includes(page)) return false;
    return ((_b = (_a = mod.actions) == null ? void 0 : _a[page]) == null ? void 0 : _b[action]) === true;
  }
  function canAccessRoute(path) {
    if (sessionIsAdmin.value) return true;
    const entry = permRouteFor(path);
    if (entry) return canAccessPage(entry.module, entry.page);
    const mod = moduleFromPath(path);
    return mod ? canAccessModule(mod) : true;
  }
  function moduleFromPath(path) {
    var _a;
    const segment = path.replace(/^\//, "").split("/")[0];
    return (_a = ROUTE_MODULE_MAP[segment]) != null ? _a : null;
  }
  function firstAllowedRoute() {
    if (sessionIsAdmin.value || state.value.isAdmin) return "/dashboard";
    for (const [route, entry] of Object.entries(PERM_ROUTES)) {
      if (canAccessModule(entry.module) && canAccessPage(entry.module, entry.page)) return route;
    }
    return "/pos";
  }
  return {
    state: readonly(state),
    sessionIsAdmin,
    load,
    clear,
    canAccessModule,
    canAccessPage,
    canAccessRoute,
    canDo,
    moduleFromPath,
    firstAllowedRoute
  };
};

export { usePermissions as u };
//# sourceMappingURL=usePermissions-BQOlC5r3.mjs.map
