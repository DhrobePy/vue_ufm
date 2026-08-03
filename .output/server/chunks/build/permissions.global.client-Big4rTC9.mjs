import { v as executeAsync } from '../nitro/nitro.mjs';
import { f as defineNuxtRouteMiddleware, p as useUserSession, n as navigateTo } from './server.mjs';
import { u as usePermissions } from './usePermissions-Bt-D0WF_.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'vue';
import 'vue-router';
import 'vue/server-renderer';
import './permRoutes-Ddy1yO1t.mjs';

const permissions_global_client = defineNuxtRouteMiddleware(async (to) => {
  var _a;
  let __temp, __restore;
  const SKIP_PREFIXES = ["/login", "/auth", "/kiosk", "/_nuxt", "/api"];
  if (SKIP_PREFIXES.some((p) => to.path.startsWith(p))) return;
  const { user } = useUserSession();
  if (!user.value) return;
  const role = ((_a = user.value.role) != null ? _a : "").toLowerCase();
  if (["admin", "superadmin"].includes(role)) return;
  const perms = usePermissions();
  [__temp, __restore] = executeAsync(() => perms.load()), await __temp, __restore();
  if (to.path === "/" || to.path === "") {
    return navigateTo(perms.firstAllowedRoute(), { replace: true });
  }
  const moduleKey = perms.moduleFromPath(to.path);
  if (!moduleKey) return;
  if (!perms.canAccessModule(moduleKey)) {
    const fallback = perms.firstAllowedRoute();
    if (fallback === to.path) return;
    return navigateTo(fallback, { replace: true });
  }
  if (!perms.canAccessRoute(to.path)) {
    const fallback = perms.firstAllowedRoute();
    if (fallback === to.path) return;
    return navigateTo(fallback, { replace: true });
  }
});

export { permissions_global_client as default };
//# sourceMappingURL=permissions.global.client-Big4rTC9.mjs.map
