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
  "/purchase/commodities": { module: "purchase", page: "commodities" },
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
const DYNAMIC_PERM_ROUTES = [
  { pattern: /^\/credit-sales\/\d+(\/|$)/, entry: { module: "credit_sales", page: "all" } },
  { pattern: /^\/customers\/\d+(\/|$)/, entry: { module: "customers", page: "list" } },
  { pattern: /^\/customers\/create$/, entry: { module: "customers", page: "list" } },
  { pattern: /^\/purchase\/orders\/\d+(\/|$)/, entry: { module: "purchase", page: "orders" } },
  { pattern: /^\/admin\/users\/\d+(\/|$)/, entry: { module: "admin", page: "users" } },
  { pattern: /^\/hr\/employees\/\d+(\/|$)/, entry: { module: "hr", page: "employees" } }
];
function permRouteFor(path) {
  const clean = path.split("?")[0].replace(/\/+$/, "") || "/";
  for (const { pattern, entry } of DYNAMIC_PERM_ROUTES) {
    if (pattern.test(clean)) return entry;
  }
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

export { PERM_ROUTES as P, permRouteFor as p };
//# sourceMappingURL=permRoutes-DGgjb71b.mjs.map
