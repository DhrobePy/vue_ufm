import { defineComponent, withAsyncContext, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { p as useUserSession, n as navigateTo } from './server.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { P as PERM_ROUTES } from './permRoutes-Ddy1yO1t.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d, _e;
    let __temp, __restore;
    const { user } = useUserSession();
    const role = ((_b = (_a = user.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
    if (["admin", "superadmin"].includes(role)) {
      [__temp, __restore] = withAsyncContext(() => navigateTo("/dashboard", { replace: true })), await __temp, __restore();
    } else if (user.value) {
      const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
        "/api/me/permissions",
        "$EHKTR4vuta"
        /* nuxt-injected */
      )), __temp = await __temp, __restore(), __temp);
      const permissions = (_d = (_c = data.value) == null ? void 0 : _c.permissions) != null ? _d : {};
      let target = "/pos";
      if ((_e = data.value) == null ? void 0 : _e.isAdmin) {
        target = "/dashboard";
      } else {
        for (const [route, entry] of Object.entries(PERM_ROUTES)) {
          const mod = permissions[entry.module];
          if (!(mod == null ? void 0 : mod.enabled)) continue;
          if (!Array.isArray(mod.pages) || mod.pages.length === 0 || mod.pages.includes(entry.page)) {
            target = route;
            break;
          }
        }
      }
      [__temp, __restore] = withAsyncContext(() => navigateTo(target, { replace: true })), await __temp, __restore();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B1cMQb2H.mjs.map
