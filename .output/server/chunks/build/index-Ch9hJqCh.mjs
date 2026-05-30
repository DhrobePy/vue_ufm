import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-BjcgcLNw.mjs';
import { _ as _sfc_main$2 } from './DataTable-CCNVWvkK.mjs';
import { _ as _sfc_main$3 } from './StatusBadge-CVkglZ_a.mjs';
import { n as navigateTo } from './server.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
import '../nitro/nitro.mjs';
import 'mysql2/promise';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const search = ref("");
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/users",
      {
        query: computed(() => ({ search: search.value }))
      },
      "$bI54NyrgR9"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const rows = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.users) != null ? _b : [];
    });
    const stats = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
    });
    const statsCards = computed(() => {
      var _a, _b, _c, _d;
      return [
        { label: "Total Users", value: (_a = stats.value.total) != null ? _a : 0, cls: "text-white" },
        { label: "Active", value: (_b = stats.value.active) != null ? _b : 0, cls: "text-emerald-400" },
        { label: "Pending", value: (_c = stats.value.pending) != null ? _c : 0, cls: "text-yellow-400" },
        { label: "Suspended", value: (_d = stats.value.suspended) != null ? _d : 0, cls: "text-red-400" }
      ];
    });
    const cols = [
      { key: "display_name", label: "Name", sortable: true },
      { key: "email", label: "Email", sortable: true },
      { key: "role", label: "Role", sortable: true },
      { key: "branch_name", label: "Branch" },
      { key: "last_login_at", label: "Last Login", sortable: true },
      { key: "status", label: "Status" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_UiDataTable = _sfc_main$2;
      const _component_UiStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Users",
        subtitle: "Manage system users and access",
        breadcrumb: ["Admin", "Users"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/admin/users/create",
              class: "btn-gold text-xs"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`+ Add User`);
                } else {
                  return [
                    createTextVNode("+ Add User")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/admin/users/create",
                class: "btn-gold text-xs"
              }, {
                default: withCtx(() => [
                  createTextVNode("+ Add User")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="grid grid-cols-2 sm:grid-cols-4 gap-3"><!--[-->`);
      ssrRenderList(unref(statsCards), (s) => {
        _push(`<div class="glass-card p-4"><p class="text-xs text-gray-500">${ssrInterpolate(s.label)}</p><p class="${ssrRenderClass([s.cls, "text-xl font-bold mt-1"])}">${ssrInterpolate(s.value)}</p></div>`);
      });
      _push(`<!--]--></div><div class="glass-card p-4 flex flex-wrap items-center gap-3"><input${ssrRenderAttr("value", unref(search))} type="text" class="field-input text-xs py-1.5 w-52" placeholder="Search name, email, role\u2026"><button class="btn-ghost text-xs py-1.5">Reset</button></div>`);
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(error)) {
        _push(`<div class="glass-card p-6 text-center text-red-400 text-sm">\u26A0 ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(ssrRenderComponent(_component_UiDataTable, {
          columns: cols,
          rows: unref(rows),
          "per-page": 25,
          exportable: "",
          "search-placeholder": "",
          onRowClick: (row) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/admin/users/${row.id}/permissions`)
        }, {
          "cell-role": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border bg-blue-500/10 text-blue-300 border-blue-500/20 whitespace-nowrap"${_scopeId}>${ssrInterpolate(value)}</span>`);
            } else {
              return [
                createVNode("span", { class: "px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border bg-blue-500/10 text-blue-300 border-blue-500/20 whitespace-nowrap" }, toDisplayString(value), 1)
              ];
            }
          }),
          "cell-branch_name": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (value) {
                _push2(`<span class="text-xs text-gray-400"${_scopeId}>${ssrInterpolate(value)}</span>`);
              } else {
                _push2(`<span class="text-xs text-gray-700"${_scopeId}>All</span>`);
              }
            } else {
              return [
                value ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-xs text-gray-400"
                }, toDisplayString(value), 1)) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "text-xs text-gray-700"
                }, "All"))
              ];
            }
          }),
          "cell-status": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_UiStatusBadge, { status: value }, null, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_UiStatusBadge, { status: value }, null, 8, ["status"])
              ];
            }
          }),
          "cell-last_login_at": withCtx(({ value }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-[11px] text-gray-500 font-mono"${_scopeId}>${ssrInterpolate(value ? String(value).slice(0, 16).replace("T", " ") : "Never")}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-[11px] text-gray-500 font-mono" }, toDisplayString(value ? String(value).slice(0, 16).replace("T", " ") : "Never"), 1)
              ];
            }
          }),
          actions: withCtx(({ row }, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/admin/users/${row.id}/permissions`,
                class: "btn-ghost text-[11px] py-1 px-2.5"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Permissions`);
                  } else {
                    return [
                      createTextVNode("Permissions")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/admin/users/${row.id}/edit`,
                class: "btn-ghost text-[11px] py-1 px-2.5"
              }, {
                default: withCtx((_, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`Edit`);
                  } else {
                    return [
                      createTextVNode("Edit")
                    ];
                  }
                }),
                _: 2
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, {
                  to: `/admin/users/${row.id}/permissions`,
                  class: "btn-ghost text-[11px] py-1 px-2.5"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Permissions")
                  ]),
                  _: 1
                }, 8, ["to"]),
                createVNode(_component_NuxtLink, {
                  to: `/admin/users/${row.id}/edit`,
                  class: "btn-ghost text-[11px] py-1 px-2.5"
                }, {
                  default: withCtx(() => [
                    createTextVNode("Edit")
                  ]),
                  _: 1
                }, 8, ["to"])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Ch9hJqCh.mjs.map
