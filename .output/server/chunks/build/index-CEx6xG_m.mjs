import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
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
import './server.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const { data } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/drivers",
      {
        query: computed(() => ({ search: search.value })),
        watch: [search]
      },
      "$Fc5mvid02O"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const drivers = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.drivers) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Drivers",
        breadcrumb: ["Fleet", "Drivers"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/drivers/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Add Driver`);
                } else {
                  return [
                    createTextVNode("+ Add Driver")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/fleet/drivers/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Add Driver")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-3 gap-4"><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total) != null ? _a : 0)}</p><p class="text-xs text-gray-500 mt-1">Total Drivers</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate((_b = unref(stats).active) != null ? _b : 0)}</p><p class="text-xs text-gray-500 mt-1">Active</p></div><div class="glass-card p-4 text-center"><p class="text-2xl font-bold text-red-400">${ssrInterpolate(((_c = unref(stats).inactive) != null ? _c : 0) + ((_d = unref(stats).suspended) != null ? _d : 0))}</p><p class="text-xs text-gray-500 mt-1">Inactive / Suspended</p></div></div><div class="relative"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg><input${ssrRenderAttr("value", unref(search))} type="text" placeholder="Search by name, mobile, NID\u2026" class="form-input pl-9"></div><div class="glass-card overflow-hidden"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07]"><th class="px-4 py-3 text-left text-gray-500 font-medium">Name</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Mobile</th><th class="px-4 py-3 text-left text-gray-500 font-medium">NID</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Joining Date</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Assigned Vehicle</th><th class="px-4 py-3 text-left text-gray-500 font-medium">Status</th><th class="px-4 py-3 text-center text-gray-500 font-medium">Actions</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(drivers), (d) => {
        var _a2;
        _push(`<tr class="border-b border-white/[0.03] hover:bg-white/[0.03] cursor-pointer transition-colors"><td class="px-4 py-3"><div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">${ssrInterpolate((_a2 = d.full_name) == null ? void 0 : _a2.charAt(0))}</div><span class="font-medium text-gray-200">${ssrInterpolate(d.full_name)}</span></div></td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(d.mobile || "\u2014")}</td><td class="px-4 py-3 font-mono text-gray-400">${ssrInterpolate(d.nid || "\u2014")}</td><td class="px-4 py-3 text-gray-400">${ssrInterpolate(d.joining_date || "\u2014")}</td><td class="px-4 py-3 font-mono text-gold-400/70">${ssrInterpolate(d.vehicle_no || "\u2014")}</td><td class="px-4 py-3">`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: d.status
        }, null, _parent));
        _push(`</td><td class="px-4 py-3 text-center">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/fleet/drivers/${d.id}/edit`,
          class: "text-xs text-gray-500 hover:text-gray-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Edit`);
            } else {
              return [
                createTextVNode("Edit")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(drivers).length) {
        _push(`<tr><td colspan="7" class="px-4 py-12 text-center text-gray-600">No drivers found</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</tbody></table></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/drivers/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CEx6xG_m.mjs.map
