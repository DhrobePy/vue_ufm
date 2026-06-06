import { p as useUserSession, o as useState } from './server.mjs';
import { computed, readonly } from 'vue';

const MODULE_ROUTES = {
  dashboard: "/dashboard",
  credit_sales: "/credit-sales",
  fleet: "/fleet",
  purchase: "/purchase",
  expenses: "/expenses",
  bank: "/bank",
  accounts: "/accounts",
  sales: "/sales",
  production: "/production",
  dispatch: "/dispatch",
  collector: "/collector",
  customers: "/customers",
  products: "/products",
  pos: "/pos",
  admin: "/admin",
  hr: "/hr"
};
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
  function canDo(module, page, action) {
    var _a, _b;
    if (sessionIsAdmin.value) return true;
    if (!state.value.loaded) return false;
    if (state.value.isAdmin) return true;
    const mod = state.value.permissions[module];
    if (!(mod == null ? void 0 : mod.enabled)) return false;
    const pg = (_a = mod.pages) == null ? void 0 : _a[page];
    if (!(pg == null ? void 0 : pg.enabled)) return false;
    return ((_b = pg.actions) == null ? void 0 : _b[action]) === true;
  }
  function moduleFromPath(path) {
    var _a;
    const segment = path.replace(/^\//, "").split("/")[0];
    return (_a = ROUTE_MODULE_MAP[segment]) != null ? _a : null;
  }
  function firstAllowedRoute() {
    if (sessionIsAdmin.value || state.value.isAdmin) return "/dashboard";
    for (const [key, route] of Object.entries(MODULE_ROUTES)) {
      if (canAccessModule(key)) return route;
    }
    return "/pos";
  }
  return {
    state: readonly(state),
    sessionIsAdmin,
    load,
    clear,
    canAccessModule,
    canDo,
    moduleFromPath,
    firstAllowedRoute
  };
};

export { usePermissions as u };
//# sourceMappingURL=usePermissions-Cs2s_JMA.mjs.map
