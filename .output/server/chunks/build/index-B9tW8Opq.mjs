import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjzzbmBf.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs';
import 'node:fs/promises';
import 'node:os';
import 'node:path';
import 'node:zlib';
import 'node:stream/promises';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const activeFilter = ref("");
    const search = ref("");
    ref(null);
    ref(false);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/fleet/vehicles",
      {
        query: computed(() => ({ status: activeFilter.value, search: search.value })),
        watch: [activeFilter, search]
      },
      "$eKBEnO3NFB"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const vehicles = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.vehicles) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const filtered = computed(() => vehicles.value);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Vehicles",
        breadcrumb: ["Fleet", "Vehicles"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/fleet/vehicles/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Add Vehicle`);
                } else {
                  return [
                    createTextVNode("+ Add Vehicle")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/fleet/vehicles/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Add Vehicle")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 lg:grid-cols-4 gap-4"><div class="${ssrRenderClass([unref(activeFilter) === "" ? "ring-1 ring-gold-400/40" : "", "glass-card p-4 text-center cursor-pointer"])}"><p class="text-2xl font-bold text-gray-100">${ssrInterpolate((_a = unref(stats).total) != null ? _a : 0)}</p><p class="text-xs text-gray-500 mt-1">All Vehicles</p></div><div class="${ssrRenderClass([unref(activeFilter) === "available" ? "ring-1 ring-emerald-400/40" : "", "glass-card p-4 text-center cursor-pointer"])}"><p class="text-2xl font-bold text-emerald-400">${ssrInterpolate((_b = unref(stats).available) != null ? _b : 0)}</p><p class="text-xs text-gray-500 mt-1">Available</p></div><div class="${ssrRenderClass([unref(activeFilter) === "busy" ? "ring-1 ring-blue-400/40" : "", "glass-card p-4 text-center cursor-pointer"])}"><p class="text-2xl font-bold text-blue-400">${ssrInterpolate((_c = unref(stats).busy) != null ? _c : 0)}</p><p class="text-xs text-gray-500 mt-1">On Trip</p></div><div class="${ssrRenderClass([unref(activeFilter) === "repair" ? "ring-1 ring-red-400/40" : "", "glass-card p-4 text-center cursor-pointer"])}"><p class="text-2xl font-bold text-red-400">${ssrInterpolate((_d = unref(stats).repair) != null ? _d : 0)}</p><p class="text-xs text-gray-500 mt-1">In Repair</p></div></div><div class="flex gap-3"><div class="relative flex-1"><svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg><input${ssrRenderAttr("value", unref(search))} type="text" placeholder="Search registration, make, model\u2026" class="form-input pl-9"></div></div><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"><!--[-->`);
      ssrRenderList(unref(filtered), (v) => {
        _push(`<div class="glass-card p-4 cursor-pointer hover:ring-1 hover:ring-white/[0.12] transition-all"><div class="flex items-start justify-between mb-3"><div><p class="font-mono text-sm font-bold text-gold-400/90">${ssrInterpolate(v.registration_no)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(v.make)} ${ssrInterpolate(v.model)}</p></div>`);
        _push(ssrRenderComponent(_component_UiStatusBadge, {
          status: v.status
        }, null, _parent));
        _push(`</div><div class="flex gap-2 mb-3"><span class="badge bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">${ssrInterpolate(v.vehicle_type)}</span><span class="badge bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">${ssrInterpolate(v.ownership_type)}</span><span class="badge bg-gray-500/10 text-gray-400 border-gray-500/20 text-[10px]">${ssrInterpolate(v.fuel_type)}</span></div><div class="space-y-1.5 text-[11px]"><div class="flex justify-between"><span class="text-gray-600">Capacity</span><span class="text-gray-300">${ssrInterpolate(v.weight_capacity_kg ? (v.weight_capacity_kg / 1e3).toFixed(1) + " MT" : "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Odometer</span><span class="text-gray-300">${ssrInterpolate(v.current_odometer ? v.current_odometer.toLocaleString() + " km" : "\u2014")}</span></div><div class="flex justify-between"><span class="text-gray-600">Driver</span><span class="text-gray-300 truncate max-w-[100px]">${ssrInterpolate(v.driver_name || "\u2014")}</span></div></div><div class="flex gap-2 mt-3 pt-3 border-t border-white/[0.06]">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/fleet/vehicles/${v.id}`,
          class: "flex-1 text-center text-[10px] text-gold-400/80 hover:text-gold-400 py-1",
          onClick: () => {
          }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`View Detail`);
            } else {
              return [
                createTextVNode("View Detail")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/fleet/vehicles/${v.id}/edit`,
          class: "flex-1 text-center text-[10px] text-gray-500 hover:text-gray-300 py-1",
          onClick: () => {
          }
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
        _push(`</div></div>`);
      });
      _push(`<!--]-->`);
      if (!unref(filtered).length) {
        _push(`<div class="col-span-full text-center py-12 text-gray-600"> No vehicles found </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/fleet/vehicles/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B9tW8Opq.mjs.map
