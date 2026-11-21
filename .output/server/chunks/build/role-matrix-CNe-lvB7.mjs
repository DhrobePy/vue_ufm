import { _ as _sfc_main$1 } from './ReportFrame-Dts5xb5M.mjs';
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, openBlock, createBlock, Fragment, createVNode, createTextVNode, renderList, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './useAppSettings-Cev_RXDm.mjs';
import '../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "role-matrix",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const today = new Date(Date.now() + 6 * 36e5).toISOString().slice(0, 10);
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/role-matrix",
      "$w45rvaUHAy"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const cnt = (r, k) => {
      var _a;
      return Number((_a = r.mods[k]) != null ? _a : 0);
    };
    const cls = (r, k) => cnt(r, k) >= r.users && r.users > 0 ? "bg-emerald-500 text-white" : cnt(r, k) > 0 ? "bg-amber-400 text-white" : "bg-white/10 text-gray-500";
    const txt = (r, k) => cnt(r, k) >= r.users && r.users > 0 ? "All" : cnt(r, k) > 0 ? `${cnt(r, k)}/${r.users}` : "\u2014";
    const sheets = computed(() => data.value ? [{
      name: "Role access",
      cols: [{ key: "role", label: "Role" }, { key: "users", label: "Users", fmt: "qty" }, ...Object.entries(data.value.modules).map(([k, l]) => ({ key: k, label: String(l) }))],
      rows: data.value.roles.map((r) => ({ role: r.role, users: r.users, ...Object.fromEntries(Object.keys(data.value.modules).map((k) => [k, txt(r, k)])) }))
    }] : []);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReportFrame = _sfc_main$1;
      _push(ssrRenderComponent(_component_ReportFrame, mergeProps({
        title: "Role Access Matrix",
        subtitle: "Which modules each role's users can open \u2014 from the live permissions the app enforces",
        period: unref(today),
        filename: "role-access-matrix",
        sheets: unref(sheets)
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(pending)) {
              _push2(`<div class="glass-card p-8 text-center text-xs text-gray-500"${_scopeId}>Loading\u2026</div>`);
            } else if (unref(data)) {
              _push2(`<!--[--><div class="no-print flex flex-wrap gap-4 text-xs text-gray-500"${_scopeId}><span${_scopeId}><span class="inline-block w-3 h-3 rounded bg-emerald-500 align-middle mr-1"${_scopeId}></span>All users of the role</span><span${_scopeId}><span class="inline-block w-3 h-3 rounded bg-amber-400 align-middle mr-1"${_scopeId}></span>Some users</span><span${_scopeId}><span class="inline-block w-3 h-3 rounded bg-gray-600 align-middle mr-1"${_scopeId}></span>None</span><span${_scopeId}>\u{1F6E1} = users on the role&#39;s default access (no personal permission set)</span></div><div class="glass-card overflow-x-auto"${_scopeId}><table class="w-full text-xs"${_scopeId}><thead${_scopeId}><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"${_scopeId}><th class="px-3 py-2 text-left"${_scopeId}>Role</th><th class="px-3 py-2 text-center"${_scopeId}>Users</th><!--[-->`);
              ssrRenderList(unref(data).modules, (l, k) => {
                _push2(`<th class="px-2 py-2 text-center whitespace-nowrap"${_scopeId}>${ssrInterpolate(l)}</th>`);
              });
              _push2(`<!--]--></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(data).roles, (r) => {
                _push2(`<tr class="border-b border-white/[0.04]"${_scopeId}><td class="px-3 py-2 font-semibold text-gray-200 whitespace-nowrap"${_scopeId}>${ssrInterpolate(r.role)} `);
                if (r.presetUsers) {
                  _push2(`<span${ssrRenderAttr("title", `${r.presetUsers} user(s) on role-default access`)}${_scopeId}>\u{1F6E1}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td class="px-3 py-2 text-center text-gray-500"${_scopeId}>${ssrInterpolate(r.users)}</td><!--[-->`);
                ssrRenderList(unref(data).modules, (l, k) => {
                  _push2(`<td class="px-2 py-2 text-center"${_scopeId}><span class="${ssrRenderClass([cls(r, String(k)), "inline-block min-w-[2.5rem] px-2 py-0.5 rounded text-[11px] font-bold"])}"${_scopeId}>${ssrInterpolate(txt(r, String(k)))}</span></td>`);
                });
                _push2(`<!--]--></tr>`);
              });
              _push2(`<!--]--></tbody></table></div><p class="no-print text-[11px] text-gray-600"${_scopeId}>Admin and Superadmin always have every module. Set exact access per user under Admin \u2192 Users \u2192 Permissions.</p><!--]-->`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(pending) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "glass-card p-8 text-center text-xs text-gray-500"
              }, "Loading\u2026")) : unref(data) ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                createVNode("div", { class: "no-print flex flex-wrap gap-4 text-xs text-gray-500" }, [
                  createVNode("span", null, [
                    createVNode("span", { class: "inline-block w-3 h-3 rounded bg-emerald-500 align-middle mr-1" }),
                    createTextVNode("All users of the role")
                  ]),
                  createVNode("span", null, [
                    createVNode("span", { class: "inline-block w-3 h-3 rounded bg-amber-400 align-middle mr-1" }),
                    createTextVNode("Some users")
                  ]),
                  createVNode("span", null, [
                    createVNode("span", { class: "inline-block w-3 h-3 rounded bg-gray-600 align-middle mr-1" }),
                    createTextVNode("None")
                  ]),
                  createVNode("span", null, "\u{1F6E1} = users on the role's default access (no personal permission set)")
                ]),
                createVNode("div", { class: "glass-card overflow-x-auto" }, [
                  createVNode("table", { class: "w-full text-xs" }, [
                    createVNode("thead", null, [
                      createVNode("tr", { class: "border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500" }, [
                        createVNode("th", { class: "px-3 py-2 text-left" }, "Role"),
                        createVNode("th", { class: "px-3 py-2 text-center" }, "Users"),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(data).modules, (l, k) => {
                          return openBlock(), createBlock("th", {
                            key: k,
                            class: "px-2 py-2 text-center whitespace-nowrap"
                          }, toDisplayString(l), 1);
                        }), 128))
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(data).roles, (r) => {
                        return openBlock(), createBlock("tr", {
                          key: r.role,
                          class: "border-b border-white/[0.04]"
                        }, [
                          createVNode("td", { class: "px-3 py-2 font-semibold text-gray-200 whitespace-nowrap" }, [
                            createTextVNode(toDisplayString(r.role) + " ", 1),
                            r.presetUsers ? (openBlock(), createBlock("span", {
                              key: 0,
                              title: `${r.presetUsers} user(s) on role-default access`
                            }, "\u{1F6E1}", 8, ["title"])) : createCommentVNode("", true)
                          ]),
                          createVNode("td", { class: "px-3 py-2 text-center text-gray-500" }, toDisplayString(r.users), 1),
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(data).modules, (l, k) => {
                            return openBlock(), createBlock("td", {
                              key: k,
                              class: "px-2 py-2 text-center"
                            }, [
                              createVNode("span", {
                                class: ["inline-block min-w-[2.5rem] px-2 py-0.5 rounded text-[11px] font-bold", cls(r, String(k))]
                              }, toDisplayString(txt(r, String(k))), 3)
                            ]);
                          }), 128))
                        ]);
                      }), 128))
                    ])
                  ])
                ]),
                createVNode("p", { class: "no-print text-[11px] text-gray-600" }, "Admin and Superadmin always have every module. Set exact access per user under Admin \u2192 Users \u2192 Permissions.")
              ], 64)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/role-matrix.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=role-matrix-CNe-lvB7.mjs.map
