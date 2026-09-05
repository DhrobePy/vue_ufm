import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { defineComponent, inject, computed, unref, shallowRef, getCurrentInstance, provide, cloneVNode, h, createElementBlock, ref, Suspense, hasInjectionContext, toRef, isRef, defineAsyncComponent, Fragment, shallowReactive, nextTick, mergeProps, createApp, onErrorCaptured, onServerPrefetch, createVNode, resolveDynamicComponent, reactive, effectScope, getCurrentScope, withCtx, isReadonly, useSSRContext, isShallow, isReactive, toRaw, markRaw } from 'vue';
import { m as createError$1, ac as parseURL, u as encodePath, p as decodePath, Y as hasProtocol, a2 as isScriptProtocol, a3 as joinURL, aY as withQuery, s as defu, aM as sanitizeStatusCode, w as getContext, $ as $fetch$1, h as baseURL, n as createHooks, v as executeAsync } from '../nitro/nitro.mjs';
import { useRoute as useRoute$1, RouterView, createMemoryHistory, createRouter, START_LOCATION } from 'vue-router';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderAttrs } from 'vue/server-renderer';
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

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const appLayoutTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const asyncDataDefaults = { "value": null, "errorValue": null, "deep": true };
const fetchDefaults = {};
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.21.6";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = /* @__PURE__ */ Symbol("layout-meta");
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
const HTML_ATTR_ENCODE_MAP = {
  "&": "%26",
  '"': "%22",
  "'": "%27",
  "<": "%3C",
  ">": "%3E"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = encodeForHtmlAttr(location2);
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
function freezeHead(head) {
  const realPush = head.push;
  head.push = () => ({ dispose: () => {
  }, patch: () => {
  }, _poll: () => {
  } });
  return () => {
    head.push = realPush;
  };
}
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    if (nuxtApp.ssrContext.islandContext) {
      const unfreeze = freezeHead(head);
      nuxtApp.hooks.hookOnce("app:created", unfreeze);
    }
    nuxtApp.vueApp.use(head);
  }
});
function toArray$1(value) {
  return Array.isArray(value) ? value : [value];
}
const matcher = /* @__PURE__ */ (() => {
  const $0 = {};
  return (m, p) => {
    let r = [];
    if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
    let s = p.split("/"), l = s.length;
    if (l > 1) {
      if (s[1] === "api") {
        r.unshift({ data: $0, params: { "_": s.slice(2).join("/") } });
      }
    }
    return r;
  };
})();
const _routeRulesMatcher = (path) => defu({}, ...matcher("", path).map((r) => r.data).reverse());
const routeRulesMatcher$1 = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher$1(path);
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
const __nuxt_page_meta$2V = { layout: "default" };
const __nuxt_page_meta$2U = { layout: "default" };
const __nuxt_page_meta$2T = { layout: "default" };
const __nuxt_page_meta$2S = { layout: "default" };
const __nuxt_page_meta$2R = { layout: false };
const __nuxt_page_meta$2Q = { layout: "default" };
const __nuxt_page_meta$2P = { layout: "default" };
const __nuxt_page_meta$2O = { layout: false };
const __nuxt_page_meta$2N = { layout: "default" };
const __nuxt_page_meta$2M = { layout: "default" };
const __nuxt_page_meta$2L = { layout: "default" };
const __nuxt_page_meta$2K = { layout: "default" };
const __nuxt_page_meta$2J = { layout: "default" };
const __nuxt_page_meta$2I = { layout: "default" };
const __nuxt_page_meta$2H = { layout: "default" };
const __nuxt_page_meta$2G = { layout: "default" };
const __nuxt_page_meta$2F = { layout: "default" };
const __nuxt_page_meta$2E = { layout: "kiosk" };
const __nuxt_page_meta$2D = { layout: "default" };
const __nuxt_page_meta$2C = { layout: "default" };
const __nuxt_page_meta$2B = { layout: "default" };
const __nuxt_page_meta$2A = { layout: "default" };
const __nuxt_page_meta$2z = { layout: "default" };
const __nuxt_page_meta$2y = { layout: "default" };
const __nuxt_page_meta$2x = { layout: "default" };
const __nuxt_page_meta$2w = { layout: "default" };
const __nuxt_page_meta$2v = { layout: "default" };
const __nuxt_page_meta$2u = { layout: "default" };
const __nuxt_page_meta$2t = { layout: "default" };
const __nuxt_page_meta$2s = { layout: "default" };
const __nuxt_page_meta$2r = { layout: "default" };
const __nuxt_page_meta$2q = { layout: "default" };
const __nuxt_page_meta$2p = { layout: "default" };
const __nuxt_page_meta$2o = { layout: "default" };
const __nuxt_page_meta$2n = { layout: "default" };
const __nuxt_page_meta$2m = { layout: "default" };
const __nuxt_page_meta$2l = { layout: "default" };
const __nuxt_page_meta$2k = { layout: "default" };
const __nuxt_page_meta$2j = { layout: "default" };
const __nuxt_page_meta$2i = { layout: "default" };
const __nuxt_page_meta$2h = { layout: "default" };
const __nuxt_page_meta$2g = { layout: "default" };
const __nuxt_page_meta$2f = { layout: "default" };
const __nuxt_page_meta$2e = { layout: "default" };
const __nuxt_page_meta$2d = { layout: "default" };
const __nuxt_page_meta$2c = { layout: "default" };
const __nuxt_page_meta$2b = { layout: "default" };
const __nuxt_page_meta$2a = { layout: "default" };
const __nuxt_page_meta$29 = { layout: "default" };
const __nuxt_page_meta$28 = { layout: "default" };
const __nuxt_page_meta$27 = { layout: "default" };
const __nuxt_page_meta$26 = { layout: "default" };
const __nuxt_page_meta$25 = { layout: "default" };
const __nuxt_page_meta$24 = { layout: "default" };
const __nuxt_page_meta$23 = { layout: "default" };
const __nuxt_page_meta$22 = { layout: "default" };
const __nuxt_page_meta$21 = { layout: "default" };
const __nuxt_page_meta$20 = { layout: "default" };
const __nuxt_page_meta$1$ = { layout: "default" };
const __nuxt_page_meta$1_ = { layout: "default" };
const __nuxt_page_meta$1Z = { layout: "default" };
const __nuxt_page_meta$1Y = { layout: "default" };
const __nuxt_page_meta$1X = { layout: "default" };
const __nuxt_page_meta$1W = { layout: "default" };
const __nuxt_page_meta$1V = { layout: "default" };
const __nuxt_page_meta$1U = { layout: "default" };
const __nuxt_page_meta$1T = { layout: "default" };
const __nuxt_page_meta$1S = { layout: "default" };
const __nuxt_page_meta$1R = { layout: "default" };
const __nuxt_page_meta$1Q = { layout: "default" };
const __nuxt_page_meta$1P = { layout: "default" };
const __nuxt_page_meta$1O = { layout: "default" };
const __nuxt_page_meta$1N = { layout: "default" };
const __nuxt_page_meta$1M = { layout: "default" };
const __nuxt_page_meta$1L = { layout: "default" };
const __nuxt_page_meta$1K = { layout: "default" };
const __nuxt_page_meta$1J = { layout: "default" };
const __nuxt_page_meta$1I = { layout: "default" };
const __nuxt_page_meta$1H = { layout: "default" };
const __nuxt_page_meta$1G = { layout: "default" };
const __nuxt_page_meta$1F = { layout: "default" };
const __nuxt_page_meta$1E = { layout: "default" };
const __nuxt_page_meta$1D = { layout: "default" };
const __nuxt_page_meta$1C = { layout: "default" };
const __nuxt_page_meta$1B = { layout: "default" };
const __nuxt_page_meta$1A = { layout: "default" };
const __nuxt_page_meta$1z = { layout: "default" };
const __nuxt_page_meta$1y = { layout: "default" };
const __nuxt_page_meta$1x = { layout: "default" };
const __nuxt_page_meta$1w = { layout: "default" };
const __nuxt_page_meta$1v = { layout: "default" };
const __nuxt_page_meta$1u = { layout: false };
const __nuxt_page_meta$1t = { layout: "default" };
const __nuxt_page_meta$1s = { layout: "default" };
const __nuxt_page_meta$1r = { layout: "default" };
const __nuxt_page_meta$1q = { layout: "default" };
const __nuxt_page_meta$1p = { layout: "default" };
const __nuxt_page_meta$1o = { layout: "default" };
const __nuxt_page_meta$1n = { layout: "default" };
const __nuxt_page_meta$1m = { layout: "default" };
const __nuxt_page_meta$1l = { layout: "default" };
const __nuxt_page_meta$1k = { layout: "default" };
const __nuxt_page_meta$1j = { layout: "default" };
const __nuxt_page_meta$1i = { layout: false };
const __nuxt_page_meta$1h = { layout: "default" };
const __nuxt_page_meta$1g = { layout: "default" };
const __nuxt_page_meta$1f = { layout: "default" };
const __nuxt_page_meta$1e = { layout: "default" };
const __nuxt_page_meta$1d = { layout: "default" };
const __nuxt_page_meta$1c = { layout: "default" };
const __nuxt_page_meta$1b = { layout: "default" };
const __nuxt_page_meta$1a = { layout: "default" };
const __nuxt_page_meta$19 = { layout: "default" };
const __nuxt_page_meta$18 = { layout: "default" };
const __nuxt_page_meta$17 = { layout: "default" };
const __nuxt_page_meta$16 = { layout: "default" };
const __nuxt_page_meta$15 = { layout: "default" };
const __nuxt_page_meta$14 = { layout: "default" };
const __nuxt_page_meta$13 = { layout: "default" };
const __nuxt_page_meta$12 = { layout: "default" };
const __nuxt_page_meta$11 = { layout: "default" };
const __nuxt_page_meta$10 = { layout: "default" };
const __nuxt_page_meta$$ = { layout: "default" };
const __nuxt_page_meta$_ = { layout: false };
const __nuxt_page_meta$Z = { layout: "default" };
const __nuxt_page_meta$Y = { layout: "default" };
const __nuxt_page_meta$X = { layout: "default" };
const __nuxt_page_meta$W = { layout: "default" };
const __nuxt_page_meta$V = { layout: "default" };
const __nuxt_page_meta$U = { layout: "default" };
const __nuxt_page_meta$T = { layout: "default" };
const __nuxt_page_meta$S = { layout: "default" };
const __nuxt_page_meta$R = { layout: "default" };
const __nuxt_page_meta$Q = { layout: "default" };
const __nuxt_page_meta$P = { layout: "default" };
const __nuxt_page_meta$O = { layout: "default" };
const __nuxt_page_meta$N = { layout: "default" };
const __nuxt_page_meta$M = { layout: "default" };
const __nuxt_page_meta$L = { layout: "default" };
const __nuxt_page_meta$K = { layout: "print" };
const __nuxt_page_meta$J = { layout: "default" };
const __nuxt_page_meta$I = { layout: "default" };
const __nuxt_page_meta$H = { layout: "default" };
const __nuxt_page_meta$G = { layout: "default" };
const __nuxt_page_meta$F = { layout: "default" };
const __nuxt_page_meta$E = { layout: "default" };
const __nuxt_page_meta$D = { layout: "default" };
const __nuxt_page_meta$C = { layout: "default" };
const __nuxt_page_meta$B = { layout: "default" };
const __nuxt_page_meta$A = { layout: "default" };
const __nuxt_page_meta$z = { layout: "default" };
const __nuxt_page_meta$y = { layout: "default" };
const __nuxt_page_meta$x = { layout: "default" };
const __nuxt_page_meta$w = { layout: false };
const __nuxt_page_meta$v = { layout: "default" };
const __nuxt_page_meta$u = { layout: "default" };
const __nuxt_page_meta$t = { layout: "default" };
const __nuxt_page_meta$s = { layout: "default" };
const __nuxt_page_meta$r = { layout: "default" };
const __nuxt_page_meta$q = { layout: "default" };
const __nuxt_page_meta$p = { layout: "default" };
const __nuxt_page_meta$o = { layout: "default" };
const __nuxt_page_meta$n = { layout: "default" };
const __nuxt_page_meta$m = { layout: "default" };
const __nuxt_page_meta$l = { layout: "default" };
const __nuxt_page_meta$k = { layout: false };
const __nuxt_page_meta$j = { layout: "default" };
const __nuxt_page_meta$i = { layout: false };
const __nuxt_page_meta$h = { layout: "default" };
const __nuxt_page_meta$g = { layout: "default" };
const __nuxt_page_meta$f = { layout: "default" };
const __nuxt_page_meta$e = { layout: "default" };
const __nuxt_page_meta$d = { layout: "default" };
const __nuxt_page_meta$c = { layout: "default" };
const __nuxt_page_meta$b = { layout: "print" };
const __nuxt_page_meta$a = { layout: false };
const __nuxt_page_meta$9 = { layout: "default" };
const __nuxt_page_meta$8 = { layout: "default" };
const __nuxt_page_meta$7 = { layout: "default" };
const __nuxt_page_meta$6 = { layout: "default" };
const __nuxt_page_meta$5 = { layout: "default" };
const __nuxt_page_meta$4 = { layout: false };
const __nuxt_page_meta$3 = { layout: "default" };
const __nuxt_page_meta$2 = { layout: "default" };
const __nuxt_page_meta$1 = { layout: "default" };
const __nuxt_page_meta = { layout: "default" };
const _routes = [
  {
    name: "index",
    path: "/",
    component: () => import('./index-B1cMQb2H.mjs')
  },
  {
    name: "pos-eod",
    path: "/pos/eod",
    meta: __nuxt_page_meta$2V || {},
    component: () => import('./eod-Dvq56pbk.mjs')
  },
  {
    name: "hr",
    path: "/hr",
    meta: __nuxt_page_meta$2U || {},
    component: () => import('./index-Bn1igKbd.mjs')
  },
  {
    name: "hr-loans",
    path: "/hr/loans",
    meta: __nuxt_page_meta$2T || {},
    component: () => import('./loans-DpE4GFlR.mjs')
  },
  {
    name: "pos-id",
    path: "/pos/:id()",
    meta: __nuxt_page_meta$2S || {},
    component: () => import('./_id_-BvnMmvsv.mjs')
  },
  {
    name: "d-order",
    path: "/d/:order()",
    meta: __nuxt_page_meta$2R || {},
    component: () => import('./_order_-C5Vb6H3z.mjs')
  },
  {
    name: "pos",
    path: "/pos",
    meta: __nuxt_page_meta$2Q || {},
    component: () => import('./index-GKPY59z3.mjs')
  },
  {
    name: "pos-today",
    path: "/pos/today",
    meta: __nuxt_page_meta$2P || {},
    component: () => import('./today-BybS8bXn.mjs')
  },
  {
    name: "auth-login",
    path: "/auth/login",
    meta: __nuxt_page_meta$2O || {},
    component: () => import('./login-COFS-zd0.mjs')
  },
  {
    name: "bank",
    path: "/bank",
    meta: __nuxt_page_meta$2N || {},
    component: () => import('./index-DrYGiEhX.mjs')
  },
  {
    name: "hr-bonuses",
    path: "/hr/bonuses",
    meta: __nuxt_page_meta$2M || {},
    component: () => import('./bonuses-CPkg31fR.mjs')
  },
  {
    name: "loans-id",
    path: "/loans/:id()",
    meta: __nuxt_page_meta$2L || {},
    component: () => import('./_id_-BuuI_rQd.mjs')
  },
  {
    name: "admin-audit",
    path: "/admin/audit",
    meta: __nuxt_page_meta$2K || {},
    component: () => import('./audit-ChV2j1Ym.mjs')
  },
  {
    name: "admin",
    path: "/admin",
    meta: __nuxt_page_meta$2J || {},
    component: () => import('./index-DZ25M85S.mjs')
  },
  {
    name: "fleet",
    path: "/fleet",
    meta: __nuxt_page_meta$2I || {},
    component: () => import('./index-DtbpeBJj.mjs')
  },
  {
    name: "hr-advances",
    path: "/hr/advances",
    meta: __nuxt_page_meta$2H || {},
    component: () => import('./advances-CjrzYayF.mjs')
  },
  {
    name: "hr-holidays",
    path: "/hr/holidays",
    meta: __nuxt_page_meta$2G || {},
    component: () => import('./holidays-Df1LEFcY.mjs')
  },
  {
    name: "hr-overtime",
    path: "/hr/overtime",
    meta: __nuxt_page_meta$2F || {},
    component: () => import('./overtime-tTuiiYUS.mjs')
  },
  {
    name: "kiosk",
    path: "/kiosk",
    meta: __nuxt_page_meta$2E || {},
    component: () => import('./index-DlfbPYPi.mjs')
  },
  {
    name: "loans",
    path: "/loans",
    meta: __nuxt_page_meta$2D || {},
    component: () => import('./index-Bq6ok6ll.mjs')
  },
  {
    name: "pos-reports",
    path: "/pos/reports",
    meta: __nuxt_page_meta$2C || {},
    component: () => import('./reports-DxVu9Xjj.mjs')
  },
  {
    name: "sales",
    path: "/sales",
    meta: __nuxt_page_meta$2B || {},
    component: () => import('./index-CptDgcom.mjs')
  },
  {
    name: "accounts-coa",
    path: "/accounts/coa",
    meta: __nuxt_page_meta$2A || {},
    component: () => import('./coa-DNqoADZg.mjs')
  },
  {
    name: "hr-biometric",
    path: "/hr/biometric",
    meta: __nuxt_page_meta$2z || {},
    component: () => import('./biometric-DobZvmzz.mjs')
  },
  {
    name: "bank-transfer",
    path: "/bank/transfer",
    meta: __nuxt_page_meta$2y || {},
    component: () => import('./transfer-CUJd2579.mjs')
  },
  {
    name: "hr-attendance",
    path: "/hr/attendance",
    meta: __nuxt_page_meta$2x || {},
    component: () => import('./attendance-CyC55Wmw.mjs')
  },
  {
    name: "pos-dashboard",
    path: "/pos/dashboard",
    meta: __nuxt_page_meta$2w || {},
    component: () => import('./dashboard-DLIxMeCl.mjs')
  },
  {
    name: "products-base",
    path: "/products/base",
    meta: __nuxt_page_meta$2v || {},
    component: () => import('./base-BnXL4CZp.mjs')
  },
  {
    name: "trading",
    path: "/trading",
    meta: __nuxt_page_meta$2u || {},
    component: () => import('./index-CMLtXOEg.mjs')
  },
  {
    name: "accounts",
    path: "/accounts",
    meta: __nuxt_page_meta$2t || {},
    component: () => import('./index-B9k1vYBz.mjs')
  },
  {
    name: "admin-settings",
    path: "/admin/settings",
    meta: __nuxt_page_meta$2s || {},
    component: () => import('./settings-BJI6eh0G.mjs')
  },
  {
    name: "bank-statement",
    path: "/bank/statement",
    meta: __nuxt_page_meta$2r || {},
    component: () => import('./statement-Bw-CL1rJ.mjs')
  },
  {
    name: "dispatch",
    path: "/dispatch",
    meta: __nuxt_page_meta$2q || {},
    component: () => import('./index-C8ODzfC3.mjs')
  },
  {
    name: "expenses",
    path: "/expenses",
    meta: __nuxt_page_meta$2p || {},
    component: () => import('./index-CuGzXdDq.mjs')
  },
  {
    name: "logistics-fuel",
    path: "/logistics/fuel",
    meta: __nuxt_page_meta$2o || {},
    component: () => import('./fuel-D-5lI3L3.mjs')
  },
  {
    name: "products",
    path: "/products",
    meta: __nuxt_page_meta$2n || {},
    component: () => import('./index-C3Oh7_dF.mjs')
  },
  {
    name: "purchase",
    path: "/purchase",
    meta: __nuxt_page_meta$2m || {},
    component: () => import('./index-CN5dvmEE.mjs')
  },
  {
    name: "collector",
    path: "/collector",
    meta: __nuxt_page_meta$2l || {},
    component: () => import('./index-nrMaq2am.mjs')
  },
  {
    name: "customers",
    path: "/customers",
    meta: __nuxt_page_meta$2k || {},
    component: () => import('./index-BIU3DLdH.mjs')
  },
  {
    name: "dashboard",
    path: "/dashboard",
    meta: __nuxt_page_meta$2j || {},
    component: () => import('./index-Dgb5wCQX.mjs')
  },
  {
    name: "expenses-create",
    path: "/expenses/create",
    meta: __nuxt_page_meta$2i || {},
    component: () => import('./create-CK46Q9na.mjs')
  },
  {
    name: "hr-payslip-id",
    path: "/hr/payslip/:id()",
    meta: __nuxt_page_meta$2h || {},
    component: () => import('./_id_-3_aS9fSv.mjs')
  },
  {
    name: "logistics",
    path: "/logistics",
    meta: __nuxt_page_meta$2g || {},
    component: () => import('./index-f5fG3vtV.mjs')
  },
  {
    name: "credit-sales-all",
    path: "/credit-sales/all",
    meta: __nuxt_page_meta$2f || {},
    component: () => import('./all-CkUEzaRi.mjs')
  },
  {
    name: "customers-create",
    path: "/customers/create",
    meta: __nuxt_page_meta$2e || {},
    component: () => import('./create-C6Mhp1tg.mjs')
  },
  {
    name: "expenses-approve",
    path: "/expenses/approve",
    meta: __nuxt_page_meta$2d || {},
    component: () => import('./approve-rS-ZZXaN.mjs')
  },
  {
    name: "expenses-history",
    path: "/expenses/history",
    meta: __nuxt_page_meta$2c || {},
    component: () => import('./history-DPS_I1UJ.mjs')
  },
  {
    name: "fleet-fuel",
    path: "/fleet/fuel",
    meta: __nuxt_page_meta$2b || {},
    component: () => import('./index-DbexPLVR.mjs')
  },
  {
    name: "hr-payroll",
    path: "/hr/payroll",
    meta: __nuxt_page_meta$2a || {},
    component: () => import('./index-B3IORQ3E.mjs')
  },
  {
    name: "pos-exit-order",
    path: "/pos/exit/:order()",
    meta: __nuxt_page_meta$29 || {},
    component: () => import('./_order_-BcPPZGIQ.mjs')
  },
  {
    name: "production",
    path: "/production",
    meta: __nuxt_page_meta$28 || {},
    component: () => import('./index-BihSLmva.mjs')
  },
  {
    name: "products-pricing",
    path: "/products/pricing",
    meta: __nuxt_page_meta$27 || {},
    component: () => import('./pricing-X6fz8ZTP.mjs')
  },
  {
    name: "trading-partners",
    path: "/trading/partners",
    meta: __nuxt_page_meta$26 || {},
    component: () => import('./partners-REI3SeCO.mjs')
  },
  {
    name: "accounts-transfer",
    path: "/accounts/transfer",
    meta: __nuxt_page_meta$25 || {},
    component: () => import('./transfer-PKFYQn6l.mjs')
  },
  {
    name: "admin-recycle-bin",
    path: "/admin/recycle-bin",
    meta: __nuxt_page_meta$24 || {},
    component: () => import('./recycle-bin-cxcrjMpD.mjs')
  },
  {
    name: "admin-users",
    path: "/admin/users",
    meta: __nuxt_page_meta$23 || {},
    component: () => import('./index-DLXHC1nV.mjs')
  },
  {
    name: "expenses-vouchers",
    path: "/expenses/vouchers",
    meta: __nuxt_page_meta$22 || {},
    component: () => import('./vouchers-CzjjgocN.mjs')
  },
  {
    name: "fleet-fuel-create",
    path: "/fleet/fuel/create",
    meta: __nuxt_page_meta$21 || {},
    component: () => import('./create-CpO2HiF9.mjs')
  },
  {
    name: "fleet-items",
    path: "/fleet/items",
    meta: __nuxt_page_meta$20 || {},
    component: () => import('./index-CbbudFSx.mjs')
  },
  {
    name: "fleet-reports-pnl",
    path: "/fleet/reports/pnl",
    meta: __nuxt_page_meta$1$ || {},
    component: () => import('./pnl-BWeyIjdO.mjs')
  },
  {
    name: "fleet-trips",
    path: "/fleet/trips",
    meta: __nuxt_page_meta$1_ || {},
    component: () => import('./index-CnYNhysE.mjs')
  },
  {
    name: "hr-employees-id",
    path: "/hr/employees/:id()",
    meta: __nuxt_page_meta$1Z || {},
    component: () => import('./_id_-Bv7lgiPk.mjs')
  },
  {
    name: "hr-leave-requests",
    path: "/hr/leave-requests",
    meta: __nuxt_page_meta$1Y || {},
    component: () => import('./leave-requests-WVi4xq5S.mjs')
  },
  {
    name: "production-create",
    path: "/production/create",
    meta: __nuxt_page_meta$1X || {},
    component: () => import('./create-n0MOEsxK.mjs')
  },
  {
    name: "production-totals",
    path: "/production/totals",
    meta: __nuxt_page_meta$1W || {},
    component: () => import('./totals-Drwaj5vr.mjs')
  },
  {
    name: "products-variants",
    path: "/products/variants",
    meta: __nuxt_page_meta$1V || {},
    component: () => import('./variants-V9lpG86m.mjs')
  },
  {
    name: "accounts-daily-log",
    path: "/accounts/daily-log",
    meta: __nuxt_page_meta$1U || {},
    component: () => import('./daily-log-CofYzfeC.mjs')
  },
  {
    name: "accounts-statement",
    path: "/accounts/statement",
    meta: __nuxt_page_meta$1T || {},
    component: () => import('./statement-D8lqwPa5.mjs')
  },
  {
    name: "admin-users-create",
    path: "/admin/users/create",
    meta: __nuxt_page_meta$1S || {},
    component: () => import('./create-B-sGqTCI.mjs')
  },
  {
    name: "credit-sales",
    path: "/credit-sales",
    meta: __nuxt_page_meta$1R || {},
    component: () => import('./index-Cl3aPcEu.mjs')
  },
  {
    name: "expenses-id-edit",
    path: "/expenses/:id()/edit",
    meta: __nuxt_page_meta$1Q || {},
    component: () => import('./edit-__DKucoh.mjs')
  },
  {
    name: "fleet-trips-create",
    path: "/fleet/trips/create",
    meta: __nuxt_page_meta$1P || {},
    component: () => import('./create-CATHKPGb.mjs')
  },
  {
    name: "hr-employees",
    path: "/hr/employees",
    meta: __nuxt_page_meta$1O || {},
    component: () => import('./index-BwOEc1Rk.mjs')
  },
  {
    name: "hr-payroll-history",
    path: "/hr/payroll/history",
    meta: __nuxt_page_meta$1N || {},
    component: () => import('./history-BT9TbI0F.mjs')
  },
  {
    name: "products-inventory",
    path: "/products/inventory",
    meta: __nuxt_page_meta$1M || {},
    component: () => import('./inventory-CEPDVqNB.mjs')
  },
  {
    name: "purchase-grn",
    path: "/purchase/grn",
    meta: __nuxt_page_meta$1L || {},
    component: () => import('./index-C9z8pyl7.mjs')
  },
  {
    name: "bank-accounts",
    path: "/bank/accounts",
    meta: __nuxt_page_meta$1K || {},
    component: () => import('./index-l7ojSk-X.mjs')
  },
  {
    name: "bank-accounts-types",
    path: "/bank/accounts/types",
    meta: __nuxt_page_meta$1J || {},
    component: () => import('./types-X0S1EB8q.mjs')
  },
  {
    name: "bank-reconciliation",
    path: "/bank/reconciliation",
    meta: __nuxt_page_meta$1I || {},
    component: () => import('./reconciliation-Dr6VGl_u.mjs')
  },
  {
    name: "credit-sales-ageing",
    path: "/credit-sales/ageing",
    meta: __nuxt_page_meta$1H || {},
    component: () => import('./ageing-Bcuxlyfe.mjs')
  },
  {
    name: "credit-sales-create",
    path: "/credit-sales/create",
    meta: __nuxt_page_meta$1G || {},
    component: () => import('./create-IeXGcwLB.mjs')
  },
  {
    name: "credit-sales-ledger",
    path: "/credit-sales/ledger",
    meta: __nuxt_page_meta$1F || {},
    component: () => import('./ledger-CZFHgrBP.mjs')
  },
  {
    name: "customers-id-edit",
    path: "/customers/:id()/edit",
    meta: __nuxt_page_meta$1E || {},
    component: () => import('./edit-CM9ojnUh.mjs')
  },
  {
    name: "expenses-id",
    path: "/expenses/:id()",
    meta: __nuxt_page_meta$1D || {},
    component: () => import('./index-WrPzYoqI.mjs')
  },
  {
    name: "expenses-categories",
    path: "/expenses/categories",
    meta: __nuxt_page_meta$1C || {},
    component: () => import('./categories-B4-zYiQ8.mjs')
  },
  {
    name: "fleet-drivers",
    path: "/fleet/drivers",
    meta: __nuxt_page_meta$1B || {},
    component: () => import('./index-BiUQI5LH.mjs')
  },
  {
    name: "fleet-rentals",
    path: "/fleet/rentals",
    meta: __nuxt_page_meta$1A || {},
    component: () => import('./index-CnjFihXA.mjs')
  },
  {
    name: "fleet-reports",
    path: "/fleet/reports",
    meta: __nuxt_page_meta$1z || {},
    component: () => import('./index-CapUEvwu.mjs')
  },
  {
    name: "fleet-reports-trips",
    path: "/fleet/reports/trips",
    meta: __nuxt_page_meta$1y || {},
    component: () => import('./trips-CMtstwvN.mjs')
  },
  {
    name: "hr-salary-structure",
    path: "/hr/salary-structure",
    meta: __nuxt_page_meta$1x || {},
    component: () => import('./salary-structure-CRHMJWc8.mjs')
  },
  {
    name: "purchase-grn-create",
    path: "/purchase/grn/create",
    meta: __nuxt_page_meta$1w || {},
    component: () => import('./create-BBDxOKFR.mjs')
  },
  {
    name: "trading-sales",
    path: "/trading/sales",
    meta: __nuxt_page_meta$1v || {},
    component: () => import('./index-DB7ozhrc.mjs')
  },
  {
    name: "trading-verify-id",
    path: "/trading/verify/:id()",
    meta: __nuxt_page_meta$1u || {},
    component: () => import('./_id_-CsykrC2M.mjs')
  },
  {
    name: "credit-sales-approve",
    path: "/credit-sales/approve",
    meta: __nuxt_page_meta$1t || {},
    component: () => import('./approve-q_BD5I2-.mjs')
  },
  {
    name: "credit-sales-collect",
    path: "/credit-sales/collect",
    meta: __nuxt_page_meta$1s || {},
    component: () => import('./collect-D86lMR8V.mjs')
  },
  {
    name: "customers-id",
    path: "/customers/:id()",
    meta: __nuxt_page_meta$1r || {},
    component: () => import('./index-DGX1Gwet.mjs')
  },
  {
    name: "fleet-drivers-create",
    path: "/fleet/drivers/create",
    meta: __nuxt_page_meta$1q || {},
    component: () => import('./create-KIPSb8_c.mjs')
  },
  {
    name: "fleet-purchases-id",
    path: "/fleet/purchases/:id()",
    meta: __nuxt_page_meta$1p || {},
    component: () => import('./_id_-CbPcQ1vn.mjs')
  },
  {
    name: "fleet-vehicles",
    path: "/fleet/vehicles",
    meta: __nuxt_page_meta$1o || {},
    component: () => import('./index-B9tW8Opq.mjs')
  },
  {
    name: "purchase-commodities",
    path: "/purchase/commodities",
    meta: __nuxt_page_meta$1n || {},
    component: () => import('./commodities-Dl4uINt9.mjs')
  },
  {
    name: "admin-employees",
    path: "/admin/employees",
    meta: __nuxt_page_meta$1m || {},
    component: () => import('./index-C3hj8icZ.mjs')
  },
  {
    name: "admin-users-id-edit",
    path: "/admin/users/:id()/edit",
    meta: __nuxt_page_meta$1l || {},
    component: () => import('./edit-PnP6HQ0K.mjs')
  },
  {
    name: "credit-sales-dispatch",
    path: "/credit-sales/dispatch",
    meta: __nuxt_page_meta$1k || {},
    component: () => import('./dispatch-BIp1ySyR.mjs')
  },
  {
    name: "credit-sales-payments",
    path: "/credit-sales/payments",
    meta: __nuxt_page_meta$1j || {},
    component: () => import('./payments-Bz8Cdkvy.mjs')
  },
  {
    name: "expenses-id-voucher",
    path: "/expenses/:id()/voucher",
    meta: __nuxt_page_meta$1i || {},
    component: () => import('./voucher-BBWkZtq5.mjs')
  },
  {
    name: "fleet-fuel-efficiency",
    path: "/fleet/fuel/efficiency",
    meta: __nuxt_page_meta$1h || {},
    component: () => import('./efficiency-BRStlJ8U.mjs')
  },
  {
    name: "fleet-purchases",
    path: "/fleet/purchases",
    meta: __nuxt_page_meta$1g || {},
    component: () => import('./index-BVUI2u8D.mjs')
  },
  {
    name: "fleet-reports-drivers",
    path: "/fleet/reports/drivers",
    meta: __nuxt_page_meta$1f || {},
    component: () => import('./drivers-B0TaGet6.mjs')
  },
  {
    name: "fleet-vehicles-create",
    path: "/fleet/vehicles/create",
    meta: __nuxt_page_meta$1e || {},
    component: () => import('./create-DBRheVtj.mjs')
  },
  {
    name: "logistics-maintenance",
    path: "/logistics/maintenance",
    meta: __nuxt_page_meta$1d || {},
    component: () => import('./maintenance-CaewxXYs.mjs')
  },
  {
    name: "logistics-trips",
    path: "/logistics/trips",
    meta: __nuxt_page_meta$1c || {},
    component: () => import('./index-iY3d4ITV.mjs')
  },
  {
    name: "pos-pending-approvals",
    path: "/pos/pending-approvals",
    meta: __nuxt_page_meta$1b || {},
    component: () => import('./pending-approvals-B_SPonMS.mjs')
  },
  {
    name: "production-id",
    path: "/production/:id()",
    meta: __nuxt_page_meta$1a || {},
    component: () => import('./index-D2m32Ya-.mjs')
  },
  {
    name: "purchase-grn-variance",
    path: "/purchase/grn/variance",
    meta: __nuxt_page_meta$19 || {},
    component: () => import('./variance-Bwy0jRvs.mjs')
  },
  {
    name: "purchase-orders",
    path: "/purchase/orders",
    meta: __nuxt_page_meta$18 || {},
    component: () => import('./index-CM0IK7MU.mjs')
  },
  {
    name: "trading-margin-report",
    path: "/trading/margin-report",
    meta: __nuxt_page_meta$17 || {},
    component: () => import('./margin-report-X1jCJ6aY.mjs')
  },
  {
    name: "accounts-journal",
    path: "/accounts/journal",
    meta: __nuxt_page_meta$16 || {},
    component: () => import('./index-0n39DR_t.mjs')
  },
  {
    name: "accounts-tax-statement",
    path: "/accounts/tax-statement",
    meta: __nuxt_page_meta$15 || {},
    component: () => import('./tax-statement-DeS1ATWd.mjs')
  },
  {
    name: "accounts-voucher",
    path: "/accounts/voucher",
    meta: __nuxt_page_meta$14 || {},
    component: () => import('./index-IlHOMXh3.mjs')
  },
  {
    name: "admin-employees-create",
    path: "/admin/employees/create",
    meta: __nuxt_page_meta$13 || {},
    component: () => import('./create-C6heYyoI.mjs')
  },
  {
    name: "fleet-maintenance-id",
    path: "/fleet/maintenance/:id()",
    meta: __nuxt_page_meta$12 || {},
    component: () => import('./_id_-C30Die9W.mjs')
  },
  {
    name: "fleet-purchases-create",
    path: "/fleet/purchases/create",
    meta: __nuxt_page_meta$11 || {},
    component: () => import('./create-B1pQ0m2K.mjs')
  },
  {
    name: "fleet-reports-vehicles",
    path: "/fleet/reports/vehicles",
    meta: __nuxt_page_meta$10 || {},
    component: () => import('./vehicles-BBkSmLmJ.mjs')
  },
  {
    name: "fleet-trips-id",
    path: "/fleet/trips/:id()",
    meta: __nuxt_page_meta$$ || {},
    component: () => import('./index-Cu88F2b8.mjs')
  },
  {
    name: "fleet-trips-id-print",
    path: "/fleet/trips/:id()/print",
    meta: __nuxt_page_meta$_ || {},
    component: () => import('./print-Hhf5bSvU.mjs')
  },
  {
    name: "logistics-trips-create",
    path: "/logistics/trips/create",
    meta: __nuxt_page_meta$Z || {},
    component: () => import('./create-CVSzi2IY.mjs')
  },
  {
    name: "production-requirement",
    path: "/production/requirement",
    meta: __nuxt_page_meta$Y || {},
    component: () => import('./requirement-CNUw3DL-.mjs')
  },
  {
    name: "purchase-grn-id-edit",
    path: "/purchase/grn/:id()/edit",
    meta: __nuxt_page_meta$X || {},
    component: () => import('./edit-DHvtxfp9.mjs')
  },
  {
    name: "purchase-orders-create",
    path: "/purchase/orders/create",
    meta: __nuxt_page_meta$W || {},
    component: () => import('./create-CfsS6B_f.mjs')
  },
  {
    name: "accounts-journal-create",
    path: "/accounts/journal/create",
    meta: __nuxt_page_meta$V || {},
    component: () => import('./create-uCN-0QsJ.mjs')
  },
  {
    name: "accounts-voucher-create",
    path: "/accounts/voucher/create",
    meta: __nuxt_page_meta$U || {},
    component: () => import('./create-BtNPEmzF.mjs')
  },
  {
    name: "bank-transaction-create",
    path: "/bank/transaction/create",
    meta: __nuxt_page_meta$T || {},
    component: () => import('./create-Cxiy6Sc1.mjs')
  },
  {
    name: "credit-sales-id-amend",
    path: "/credit-sales/:id()/amend",
    meta: __nuxt_page_meta$S || {},
    component: () => import('./amend-M-aSzTjK.mjs')
  },
  {
    name: "credit-sales-id",
    path: "/credit-sales/:id()",
    meta: __nuxt_page_meta$R || {},
    component: () => import('./index-Dhwn3SUl.mjs')
  },
  {
    name: "credit-sales-production",
    path: "/credit-sales/production",
    meta: __nuxt_page_meta$Q || {},
    component: () => import('./production-DYco3qyz.mjs')
  },
  {
    name: "fleet-drivers-id-edit",
    path: "/fleet/drivers/:id()/edit",
    meta: __nuxt_page_meta$P || {},
    component: () => import('./edit-D6ebDVDP.mjs')
  },
  {
    name: "fleet-maintenance",
    path: "/fleet/maintenance",
    meta: __nuxt_page_meta$O || {},
    component: () => import('./index-BNYULlAf.mjs')
  },
  {
    name: "logistics-drivers",
    path: "/logistics/drivers",
    meta: __nuxt_page_meta$N || {},
    component: () => import('./index-CAiCnxuf.mjs')
  },
  {
    name: "products-pricing-engine",
    path: "/products/pricing-engine",
    meta: __nuxt_page_meta$M || {},
    component: () => import('./pricing-engine-C4KBf2Yq.mjs')
  },
  {
    name: "purchase-grn-id",
    path: "/purchase/grn/:id()",
    meta: __nuxt_page_meta$L || {},
    component: () => import('./index-L7VQF3dR.mjs')
  },
  {
    name: "purchase-grn-id-print",
    path: "/purchase/grn/:id()/print",
    meta: __nuxt_page_meta$K || {},
    component: () => import('./print-XKdtqDFk.mjs')
  },
  {
    name: "purchase-payments",
    path: "/purchase/payments",
    meta: __nuxt_page_meta$J || {},
    component: () => import('./index-2bn_s3q-.mjs')
  },
  {
    name: "credit-sales-id-return",
    path: "/credit-sales/:id()/return",
    meta: __nuxt_page_meta$I || {},
    component: () => import('./return-BN8hr82i.mjs')
  },
  {
    name: "credit-sales-qr-scan-log",
    path: "/credit-sales/qr-scan-log",
    meta: __nuxt_page_meta$H || {},
    component: () => import('./qr-scan-log-BRTD0mJw.mjs')
  },
  {
    name: "fleet-drivers-id",
    path: "/fleet/drivers/:id()",
    meta: __nuxt_page_meta$G || {},
    component: () => import('./index-boh2Up8e.mjs')
  },
  {
    name: "fleet-maintenance-create",
    path: "/fleet/maintenance/create",
    meta: __nuxt_page_meta$F || {},
    component: () => import('./create-C-XbmVTB.mjs')
  },
  {
    name: "fleet-vehicles-id-edit",
    path: "/fleet/vehicles/:id()/edit",
    meta: __nuxt_page_meta$E || {},
    component: () => import('./edit-IhxLRB00.mjs')
  },
  {
    name: "logistics-drivers-create",
    path: "/logistics/drivers/create",
    meta: __nuxt_page_meta$D || {},
    component: () => import('./create-2VT15qhS.mjs')
  },
  {
    name: "logistics-vehicles",
    path: "/logistics/vehicles",
    meta: __nuxt_page_meta$C || {},
    component: () => import('./index-DV9nAdkG.mjs')
  },
  {
    name: "pos-customer-ledger-id",
    path: "/pos/customer-ledger/:id()",
    meta: __nuxt_page_meta$B || {},
    component: () => import('./_id_-DtqTozce.mjs')
  },
  {
    name: "purchase-payments-record",
    path: "/purchase/payments/record",
    meta: __nuxt_page_meta$A || {},
    component: () => import('./record-CP87aM7k.mjs')
  },
  {
    name: "purchase-suppliers",
    path: "/purchase/suppliers",
    meta: __nuxt_page_meta$z || {},
    component: () => import('./index-DC2zObFU.mjs')
  },
  {
    name: "trading-sales-id",
    path: "/trading/sales/:id()",
    meta: __nuxt_page_meta$y || {},
    component: () => import('./index-18KPNe36.mjs')
  },
  {
    name: "credit-sales-id-deliver",
    path: "/credit-sales/:id()/deliver",
    meta: __nuxt_page_meta$x || {},
    component: () => import('./deliver-B5zrnnKg.mjs')
  },
  {
    name: "credit-sales-id-invoice",
    path: "/credit-sales/:id()/invoice",
    meta: __nuxt_page_meta$w || {},
    component: () => import('./invoice-Dax8gcXT.mjs')
  },
  {
    name: "credit-sales-id-payment",
    path: "/credit-sales/:id()/payment",
    meta: __nuxt_page_meta$v || {},
    component: () => import('./payment-eKNvTtlX.mjs')
  },
  {
    name: "credit-sales-order-status",
    path: "/credit-sales/order-status",
    meta: __nuxt_page_meta$u || {},
    component: () => import('./order-status-CGx2o91X.mjs')
  },
  {
    name: "fleet-reports-maintenance",
    path: "/fleet/reports/maintenance",
    meta: __nuxt_page_meta$t || {},
    component: () => import('./maintenance-we1ThMrB.mjs')
  },
  {
    name: "fleet-vehicles-id",
    path: "/fleet/vehicles/:id()",
    meta: __nuxt_page_meta$s || {},
    component: () => import('./index-B7cSdUho.mjs')
  },
  {
    name: "logistics-vehicles-create",
    path: "/logistics/vehicles/create",
    meta: __nuxt_page_meta$r || {},
    component: () => import('./create-oVHhv3hg.mjs')
  },
  {
    name: "purchase-orders-id-edit",
    path: "/purchase/orders/:id()/edit",
    meta: __nuxt_page_meta$q || {},
    component: () => import('./edit-D0pGwOhn.mjs')
  },
  {
    name: "credit-sales-credit-limits",
    path: "/credit-sales/credit-limits",
    meta: __nuxt_page_meta$p || {},
    component: () => import('./credit-limits-HQvUcNSF.mjs')
  },
  {
    name: "credit-sales-payment-watch",
    path: "/credit-sales/payment-watch",
    meta: __nuxt_page_meta$o || {},
    component: () => import('./payment-watch-L1lFhQak.mjs')
  },
  {
    name: "products-stock-adjustments",
    path: "/products/stock-adjustments",
    meta: __nuxt_page_meta$n || {},
    component: () => import('./stock-adjustments-BYUKzYp3.mjs')
  },
  {
    name: "purchase-adjustments",
    path: "/purchase/adjustments",
    meta: __nuxt_page_meta$m || {},
    component: () => import('./index-Jkj0ZJ1D.mjs')
  },
  {
    name: "purchase-orders-id",
    path: "/purchase/orders/:id()",
    meta: __nuxt_page_meta$l || {},
    component: () => import('./index-CR0UFmQJ.mjs')
  },
  {
    name: "purchase-orders-id-print",
    path: "/purchase/orders/:id()/print",
    meta: __nuxt_page_meta$k || {},
    component: () => import('./print-CuLH2Nlm.mjs')
  },
  {
    name: "purchase-suppliers-summary",
    path: "/purchase/suppliers/summary",
    meta: __nuxt_page_meta$j || {},
    component: () => import('./summary-CvUDSopV.mjs')
  },
  {
    name: "trading-sales-id-invoice",
    path: "/trading/sales/:id()/invoice",
    meta: __nuxt_page_meta$i || {},
    component: () => import('./invoice-DIxX6g1J.mjs')
  },
  {
    name: "purchase-adjustments-create",
    path: "/purchase/adjustments/create",
    meta: __nuxt_page_meta$h || {},
    component: () => import('./create-Bn6hP-L5.mjs')
  },
  {
    name: "purchase-payments-id-edit",
    path: "/purchase/payments/:id()/edit",
    meta: __nuxt_page_meta$g || {},
    component: () => import('./edit-kurPwEzx.mjs')
  },
  {
    name: "admin-users-id-permissions",
    path: "/admin/users/:id()/permissions",
    meta: __nuxt_page_meta$f || {},
    component: () => import('./permissions-P8Mv4xyB.mjs')
  },
  {
    name: "credit-sales-backdated-entry",
    path: "/credit-sales/backdated-entry",
    meta: __nuxt_page_meta$e || {},
    component: () => import('./backdated-entry-CUW2Tzq8.mjs')
  },
  {
    name: "credit-sales-over-deliveries",
    path: "/credit-sales/over-deliveries",
    meta: __nuxt_page_meta$d || {},
    component: () => import('./over-deliveries-DfhIanSf.mjs')
  },
  {
    name: "purchase-payments-id",
    path: "/purchase/payments/:id()",
    meta: __nuxt_page_meta$c || {},
    component: () => import('./index-DafNbns5.mjs')
  },
  {
    name: "purchase-payments-id-print",
    path: "/purchase/payments/:id()/print",
    meta: __nuxt_page_meta$b || {},
    component: () => import('./print-dD65GtFm.mjs')
  },
  {
    name: "trading-sales-id-gate-pass",
    path: "/trading/sales/:id()/gate-pass",
    meta: __nuxt_page_meta$a || {},
    component: () => import('./gate-pass-D7OJdxeE.mjs')
  },
  {
    name: "fleet-maintenance-rules",
    path: "/fleet/maintenance/rules",
    meta: __nuxt_page_meta$9 || {},
    component: () => import('./index-BtokNzsa.mjs')
  },
  {
    name: "products-productId-variants",
    path: "/products/:productId()/variants",
    meta: __nuxt_page_meta$8 || {},
    component: () => import('./variants-DubXEaDb.mjs')
  },
  {
    name: "credit-sales-approval-requests",
    path: "/credit-sales/approval-requests",
    meta: __nuxt_page_meta$7 || {},
    component: () => import('./approval-requests-oSayRYif.mjs')
  },
  {
    name: "purchase-suppliers-id-ledger",
    path: "/purchase/suppliers/:id()/ledger",
    meta: __nuxt_page_meta$6 || {},
    component: () => import('./ledger-D59zFaal.mjs')
  },
  {
    name: "accounts-day-end-reconciliation",
    path: "/accounts/day-end-reconciliation",
    meta: __nuxt_page_meta$5 || {},
    component: () => import('./day-end-reconciliation-CdDyzxL3.mjs')
  },
  {
    name: "credit-sales-id-dispatch-slip",
    path: "/credit-sales/:id()/dispatch-slip",
    meta: __nuxt_page_meta$4 || {},
    component: () => import('./dispatch-slip-B60-TCyM.mjs')
  },
  {
    name: "credit-sales-id-over-delivery",
    path: "/credit-sales/:id()/over-delivery",
    meta: __nuxt_page_meta$3 || {},
    component: () => import('./over-delivery-BEdir7Fk.mjs')
  },
  {
    name: "purchase-adjustments-id",
    path: "/purchase/adjustments/:id()",
    meta: __nuxt_page_meta$2 || {},
    component: () => import('./index-Rrsl6RmP.mjs')
  },
  {
    name: "credit-sales-receipt-paymentId",
    path: "/credit-sales/receipt/:paymentId()",
    meta: __nuxt_page_meta$1 || {},
    component: () => import('./_paymentId_-BPi_SqqX.mjs')
  },
  {
    name: "products-productId-variantId-pricing",
    path: "/products/:productId()/:variantId()/pricing",
    meta: __nuxt_page_meta || {},
    component: () => import('./pricing-BXq0HWwT.mjs')
  }
];
const _wrapInTransition = (props, children) => {
  return { default: () => children.default?.() };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
function _mergeTransitionProps(routeProps) {
  const _props = [];
  for (const prop of routeProps) {
    if (!prop) {
      continue;
    }
    _props.push({
      ...prop,
      onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0,
      onBeforeLeave: prop.onBeforeLeave ? toArray(prop.onBeforeLeave) : void 0
    });
  }
  return defu(..._props);
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const hashScrollBehaviour = useRouter().options?.scrollBehaviorType ?? "auto";
    if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior: hashScrollBehaviour };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    if (from === START_LOCATION) {
      return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
    }
    return new Promise((resolve) => {
      const doScroll = () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour)));
      };
      nuxtApp.hooks.hookOnce("page:loading:end", () => {
        const transitionPromise = nuxtApp["~transitionPromise"];
        if (transitionPromise) {
          transitionPromise.then(doScroll);
        } else {
          doScroll();
        }
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
  if (savedPosition) {
    return savedPosition;
  }
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: isChangingPage(to, from) ? defaultHashScrollBehaviour : "instant"
    };
  }
  return {
    left: 0,
    top: 0
  };
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  if (!to.meta?.validate) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    status: result && (result.status || result.statusCode) || 404,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
function useRequestEvent(nuxtApp) {
  nuxtApp ||= useNuxtApp();
  return nuxtApp.ssrContext?.event;
}
function useRequestFetch() {
  return useRequestEvent()?.$fetch || globalThis.$fetch;
}
const useSessionState = () => useState("nuxt-session", () => ({}));
const useAuthReadyState = () => useState("nuxt-auth-ready", () => false);
function useUserSession() {
  const sessionState = useSessionState();
  const authReadyState = useAuthReadyState();
  return {
    ready: computed(() => authReadyState.value),
    loggedIn: computed(() => Boolean(sessionState.value.user)),
    user: computed(() => sessionState.value.user || null),
    session: sessionState,
    fetch,
    clear
  };
}
async function fetch() {
  const authReadyState = useAuthReadyState();
  useSessionState().value = await useRequestFetch()("/api/_auth/session", {
    headers: {
      Accept: "text/json"
    },
    retry: false
  }).catch(() => ({}));
  if (!authReadyState.value) {
    authReadyState.value = true;
  }
}
async function clear() {
  await $fetch("/api/_auth/session", { method: "DELETE" });
  useSessionState().value = {};
}
const auth_45global = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/auth")) return;
  return;
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  auth_45global,
  manifest_45route_45rule
];
const namedMiddleware = {
  "permissions-global-client": () => import('./permissions.global.client-Big4rTC9.mjs')
};
const pageIslandRoutes = {};
const plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = routerOptions.history?.(routerBase) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    router.afterEach((to, from) => {
      const lastTo = to.matched.at(-1)?.components?.default;
      const lastFrom = from.matched.at(-1)?.components?.default;
      if (lastTo === lastFrom) {
        syncCurrentRoute();
        return;
      }
      if (to.matched.length < from.matched.length && to.matched.every((m, i) => m.components?.default === from.matched[i]?.components?.default)) {
        syncCurrentRoute();
      }
    });
    const route = { sync: syncCurrentRoute };
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const error = /* @__PURE__ */ useError();
    const isServerPage = nuxtApp.ssrContext?.islandContext?.name?.startsWith("page_");
    if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if (failure?.type === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    const hasDeferredRoute = false;
    syncCurrentRoute();
    if (nuxtApp.ssrContext?.islandContext && !isServerPage) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray$1(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        const routeRules = getRouteRules({ path: to.path });
        if (routeRules.appMiddleware) {
          for (const key in routeRules.appMiddleware) {
            if (routeRules.appMiddleware[key]) {
              middlewareEntries.add(key);
            } else {
              middlewareEntries.delete(key);
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await namedMiddleware[entry2]?.().then((r) => r.default || r) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            if (false) ;
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    if (isServerPage) {
      router.beforeResolve((to) => {
        const expected = pageIslandRoutes[nuxtApp.ssrContext.islandContext.name];
        const actual = to.matched.find((m) => m.components?.default?.__nuxt_island)?.components?.default;
        if (!expected || expected !== actual?.__nuxt_island) {
          nuxtApp.ssrContext["~renderResponse"] = {
            statusCode: 400,
            statusMessage: "Invalid island request path"
          };
          return false;
        }
      });
    }
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach((to) => {
      if (to.matched.length === 0 && !error.value) {
        return nuxtApp.runWithContext(() => showError(createError({
          status: 404,
          fatal: false,
          statusText: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        if (hasDeferredRoute) ;
        else {
          await router.replace({
            ...resolvedInitialRoute,
            force: true
          });
        }
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
const session_server_fi7D7q_WjeXZl2Hh05GOWPuIxZQWSnpY3ifY_sSGHJo = /* @__PURE__ */ defineNuxtPlugin({
  name: "session-fetch-plugin",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    nuxtApp.payload.isCached = Boolean(useRequestEvent()?.context.cache);
    if (nuxtApp.payload.serverRendered && !nuxtApp.payload.prerenderedAt && !nuxtApp.payload.isCached) {
      [__temp, __restore] = executeAsync(() => useUserSession().fetch()), await __temp, __restore();
    }
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const piniaSymbol = (
  /* istanbul ignore next */
  /* @__PURE__ */ Symbol()
);
var MutationType;
(function(MutationType2) {
  MutationType2["direct"] = "direct";
  MutationType2["patchObject"] = "patch object";
  MutationType2["patchFunction"] = "patch function";
})(MutationType || (MutationType = {}));
function createPinia() {
  const scope = effectScope(true);
  const state = scope.run(() => ref({}));
  let _p = [];
  let toBeInstalled = [];
  const pinia = markRaw({
    install(app) {
      {
        pinia._a = app;
        app.provide(piniaSymbol, pinia);
        app.config.globalProperties.$pinia = pinia;
        toBeInstalled.forEach((plugin2) => _p.push(plugin2));
        toBeInstalled = [];
      }
    },
    use(plugin2) {
      if (!this._a && true) {
        toBeInstalled.push(plugin2);
      } else {
        _p.push(plugin2);
      }
      return this;
    },
    _p,
    // it's actually undefined here
    // @ts-expect-error
    _a: null,
    _e: scope,
    _s: /* @__PURE__ */ new Map(),
    state
  });
  return pinia;
}
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
const __nuxt_component_1 = defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia",
  setup(nuxtApp) {
    const pinia = createPinia();
    nuxtApp.vueApp.use(pinia);
    {
      nuxtApp.payload.pinia = pinia.state.value;
    }
    return {
      provide: {
        pinia
      }
    };
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const session_bootstrap_server_lCFTzuGCOoIfPNDypkeGN80y_RJWKOUw2nB5LL3VESg = /* @__PURE__ */ defineNuxtPlugin({
  name: "session-bootstrap",
  enforce: "post",
  async setup() {
    let __temp, __restore;
    const event = useRequestEvent();
    if (!event) return;
    const cookieHeader = event.headers.get("cookie");
    if (!cookieHeader) return;
    try {
      const data = ([__temp, __restore] = executeAsync(() => $fetch(
        "/api/_auth/session",
        {
          headers: { cookie: cookieHeader },
          retry: false
        }
      )), __temp = await __temp, __restore(), __temp);
      if (data?.user) {
        useState("nuxt-session", () => ({})).value = data;
        useState("nuxt-auth-ready", () => false).value = true;
      }
    } catch {
    }
  }
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin$1,
  session_server_fi7D7q_WjeXZl2Hh05GOWPuIxZQWSnpY3ifY_sSGHJo,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  plugin,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4,
  session_bootstrap_server_lCFTzuGCOoIfPNDypkeGN80y_RJWKOUw2nB5LL3VESg
];
const layouts = {
  auth: defineAsyncComponent(() => import('./auth-UNuwSoTZ.mjs').then((m) => m.default || m)),
  default: defineAsyncComponent(() => import('./default-Kf0P6-G4.mjs').then((m) => m.default || m)),
  kiosk: defineAsyncComponent(() => import('./kiosk-CzgAjXLJ.mjs').then((m) => m.default || m)),
  print: defineAsyncComponent(() => import('./print-CKR5tjTT.mjs').then((m) => m.default || m))
};
const routeRulesMatcher = _routeRulesMatcher;
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_0 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path).appLayout ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      const hasLayout = !!layout.value && layout.value in layouts;
      const hasTransition = hasLayout && !!(route?.meta.layoutTransition ?? appLayoutTransition);
      const transitionProps = hasTransition && _mergeTransitionProps([
        route?.meta.layoutTransition,
        appLayoutTransition,
        {
          onBeforeLeave() {
            nuxtApp["~transitionPromise"] = new Promise((resolve) => {
              nuxtApp["~transitionFinish"] = resolve;
            });
          },
          onAfterLeave() {
            nuxtApp["~transitionFinish"]?.();
            delete nuxtApp["~transitionFinish"];
            delete nuxtApp["~transitionPromise"];
          }
        }
      ]);
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(transitionProps, {
        default: () => h(
          Suspense,
          {
            suspensible: true,
            onResolve: async () => {
              await nextTick(done);
            }
          },
          {
            default: () => h(
              LayoutProvider,
              {
                layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
                key: layout.value || void 0,
                name: layout.value,
                shouldProvide: !props.name,
                isRenderingNewLayout: (name) => {
                  return name !== previouslyRenderedLayout && name === layout.value;
                },
                hasTransition
              },
              context.slots
            )
          }
        )
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        // When name=false, always return true so NuxtPage doesn't skip rendering
        isCurrent: (route) => name === false || name === (route.meta.layout ?? routeRulesMatcher(route.path).appLayout ?? "default")
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            return props.isRenderingNewLayout(props.name) ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      if (!name || typeof name === "string" && !(name in layouts)) {
        return context.slots.default?.();
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_2 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          return h(Suspense, { suspensible: true }, {
            default() {
              return h(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        }
      });
    };
  }
});
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtLayout = __nuxt_component_0;
  const _component_NuxtPage = __nuxt_component_2;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "dark" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_NuxtLayout, null, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(ssrRenderComponent(_component_NuxtPage, null, null, _parent2, _scopeId));
      } else {
        return [
          createVNode(_component_NuxtPage)
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-D0iTqZzG.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-sBu7HU0F.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    function invokeAppErrorHandler(err, target, info) {
      const errorHandler = nuxtApp.vueApp.config.errorHandler;
      if (errorHandler && !errorHandler.__nuxt_default) {
        try {
          errorHandler(err, target, info);
        } catch (handlerError) {
          console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
        }
      }
    }
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        invokeAppErrorHandler(err, target, info);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(AppComponent), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));

export { __nuxt_component_0 as _, __nuxt_component_1 as a, __nuxt_component_2 as b, _export_sfc as c, asyncDataDefaults as d, entry_default as default, createError as e, defineNuxtRouteMiddleware as f, encodeRoutePath as g, fetchDefaults as h, nuxtLinkDefaults as i, useRequestFetch as j, useRoute as k, useRouter as l, useRuntimeConfig as m, navigateTo as n, useState as o, useUserSession as p, resolveRouteObject as r, tryUseNuxtApp as t, useNuxtApp as u };
//# sourceMappingURL=server.mjs.map
