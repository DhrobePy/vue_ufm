import { c as _export_sfc, k as useRoute, _ as __nuxt_component_0 } from './server.mjs';
import { defineComponent, reactive, ref, withCtx, unref, createVNode, withModifiers, openBlock, createBlock, withDirectives, vModelText, toDisplayString, createCommentVNode, vModelDynamic, vModelCheckbox, Transition, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrRenderDynamicModel, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
import '../nitro/nitro.mjs';
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
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const form = reactive({ email: "", password: "", remember: false });
    const errors = reactive({ email: "", password: "" });
    const loading = ref(false);
    const loginError = ref("");
    const showPassword = ref(false);
    function safeReturnTo() {
      const rt = route.query.return_to;
      if (typeof rt !== "string" || !rt.startsWith("/") || rt.startsWith("//") || rt.startsWith("/auth")) return null;
      return rt;
    }
    async function handleLogin() {
      var _a, _b, _c;
      errors.email = "";
      errors.password = "";
      loginError.value = "";
      if (!form.email) {
        errors.email = "Email is required";
        return;
      }
      if (!form.password) {
        errors.password = "Password is required";
        return;
      }
      loading.value = true;
      try {
        await $fetch("/api/auth/login", {
          method: "POST",
          body: { email: form.email, password: form.password }
        });
        (void 0).location.href = (_a = safeReturnTo()) != null ? _a : "/";
      } catch (e) {
        loading.value = false;
        loginError.value = ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.statusMessage) || ((_c = e == null ? void 0 : e.data) == null ? void 0 : _c.message) || "Invalid email or password";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-2c9a4e8b>`);
      _push(ssrRenderComponent(_component_NuxtLayout, { name: "auth" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="w-full max-w-md mx-auto px-4 animate-slide-up" data-v-2c9a4e8b${_scopeId}><div class="relative rounded-3xl overflow-hidden" style="${ssrRenderStyle({ "background": "linear-gradient(145deg, rgba(28,24,20,0.9) 0%, rgba(18,15,12,0.95) 100%)", "border": "1px solid rgba(245,158,11,0.15)", "box-shadow": "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,158,11,0.1)" })}" data-v-2c9a4e8b${_scopeId}><div class="h-px w-full" style="${ssrRenderStyle({ "background": "linear-gradient(90deg, transparent, #f59e0b 40%, #fbbf24 60%, transparent)" })}" data-v-2c9a4e8b${_scopeId}></div><div class="p-8" data-v-2c9a4e8b${_scopeId}><div class="flex flex-col items-center mb-8" data-v-2c9a4e8b${_scopeId}><div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-glow-pulse" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, #f59e0b, #d97706)", "box-shadow": "0 0 32px rgba(245,158,11,0.4)" })}" data-v-2c9a4e8b${_scopeId}><span class="font-display font-bold text-black text-2xl" data-v-2c9a4e8b${_scopeId}>U</span></div><h1 class="font-display font-bold text-2xl text-white tracking-tight" data-v-2c9a4e8b${_scopeId}>Welcome back</h1><p class="text-sm text-gray-500 mt-1" data-v-2c9a4e8b${_scopeId}>Sign in to Ujjal FMC ERP</p></div><form class="space-y-4" data-v-2c9a4e8b${_scopeId}><div class="space-y-1.5" data-v-2c9a4e8b${_scopeId}><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-2c9a4e8b${_scopeId}>Email address</label><div class="relative" data-v-2c9a4e8b${_scopeId}><div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" data-v-2c9a4e8b${_scopeId}><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" data-v-2c9a4e8b${_scopeId}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" data-v-2c9a4e8b${_scopeId}></path><polyline points="22,6 12,13 2,6" data-v-2c9a4e8b${_scopeId}></polyline></svg></div><input${ssrRenderAttr("value", unref(form).email)} type="email" placeholder="admin@ujjalfmc.com" class="${ssrRenderClass([unref(errors).email ? "border-red-500/50 focus:ring-red-500/30" : "", "input-glass pl-10"])}" data-v-2c9a4e8b${_scopeId}></div>`);
            if (unref(errors).email) {
              _push2(`<p class="text-xs text-red-400" data-v-2c9a4e8b${_scopeId}>${ssrInterpolate(unref(errors).email)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="space-y-1.5" data-v-2c9a4e8b${_scopeId}><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-2c9a4e8b${_scopeId}>Password</label><div class="relative" data-v-2c9a4e8b${_scopeId}><div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" data-v-2c9a4e8b${_scopeId}><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" data-v-2c9a4e8b${_scopeId}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" data-v-2c9a4e8b${_scopeId}></rect><path d="M7 11V7a5 5 0 0110 0v4" data-v-2c9a4e8b${_scopeId}></path></svg></div><input${ssrRenderDynamicModel(unref(showPassword) ? "text" : "password", unref(form).password, null)}${ssrRenderAttr("type", unref(showPassword) ? "text" : "password")} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" class="${ssrRenderClass([unref(errors).password ? "border-red-500/50 focus:ring-red-500/30" : "", "input-glass pl-10 pr-10"])}" data-v-2c9a4e8b${_scopeId}><button type="button" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors duration-150" data-v-2c9a4e8b${_scopeId}>`);
            if (!unref(showPassword)) {
              _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" data-v-2c9a4e8b${_scopeId}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" data-v-2c9a4e8b${_scopeId}></path><circle cx="12" cy="12" r="3" data-v-2c9a4e8b${_scopeId}></circle></svg>`);
            } else {
              _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" data-v-2c9a4e8b${_scopeId}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" data-v-2c9a4e8b${_scopeId}></path></svg>`);
            }
            _push2(`</button></div>`);
            if (unref(errors).password) {
              _push2(`<p class="text-xs text-red-400" data-v-2c9a4e8b${_scopeId}>${ssrInterpolate(unref(errors).password)}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="flex items-center justify-between pt-1" data-v-2c9a4e8b${_scopeId}><label class="flex items-center gap-2 cursor-pointer group" data-v-2c9a4e8b${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).remember) ? ssrLooseContain(unref(form).remember, null) : unref(form).remember) ? " checked" : ""} type="checkbox" class="w-4 h-4 rounded border-white/20 bg-white/[0.05] text-gold-500 focus:ring-gold-500/40" data-v-2c9a4e8b${_scopeId}><span class="text-xs text-gray-500 group-hover:text-gray-300 transition-colors" data-v-2c9a4e8b${_scopeId}>Remember me</span></label><button type="button" class="text-xs text-gold-500/80 hover:text-gold-400 transition-colors duration-150" data-v-2c9a4e8b${_scopeId}> Forgot password? </button></div>`);
            if (unref(loginError)) {
              _push2(`<div class="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm text-red-300" style="${ssrRenderStyle({ "background": "rgba(239,68,68,0.1)", "border": "1px solid rgba(239,68,68,0.2)" })}" data-v-2c9a4e8b${_scopeId}><svg class="w-4 h-4 shrink-0 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-2c9a4e8b${_scopeId}><circle cx="12" cy="12" r="10" data-v-2c9a4e8b${_scopeId}></circle><line x1="12" y1="8" x2="12" y2="12" data-v-2c9a4e8b${_scopeId}></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-2c9a4e8b${_scopeId}></line></svg> ${ssrInterpolate(unref(loginError))}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="btn-gold w-full justify-center py-3 text-sm font-semibold mt-2" data-v-2c9a4e8b${_scopeId}>`);
            if (unref(loading)) {
              _push2(`<svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-2c9a4e8b${_scopeId}><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 2a8 8 0 100 16A8 8 0 0012 4z" stroke-opacity=".2" data-v-2c9a4e8b${_scopeId}></path><path d="M12 2a10 10 0 0110 10h-2A8 8 0 0012 4V2z" data-v-2c9a4e8b${_scopeId}></path></svg>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<span data-v-2c9a4e8b${_scopeId}>${ssrInterpolate(unref(loading) ? "Signing in\u2026" : "Sign in")}</span>`);
            if (!unref(loading)) {
              _push2(`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-2c9a4e8b${_scopeId}><path d="M5 12h14M12 5l7 7-7 7" data-v-2c9a4e8b${_scopeId}></path></svg>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</button></form></div><div class="px-8 pb-6 text-center" data-v-2c9a4e8b${_scopeId}><p class="text-[11px] text-gray-700" data-v-2c9a4e8b${_scopeId}> Ujjal Flour Mills Company \xA9 ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} \xB7 ERP v1.0 </p></div></div><p class="text-center text-[11px] text-gray-700 mt-4" data-v-2c9a4e8b${_scopeId}> Secured with end-to-end session encryption </p></div>`);
          } else {
            return [
              createVNode("div", { class: "w-full max-w-md mx-auto px-4 animate-slide-up" }, [
                createVNode("div", {
                  class: "relative rounded-3xl overflow-hidden",
                  style: { "background": "linear-gradient(145deg, rgba(28,24,20,0.9) 0%, rgba(18,15,12,0.95) 100%)", "border": "1px solid rgba(245,158,11,0.15)", "box-shadow": "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,158,11,0.1)" }
                }, [
                  createVNode("div", {
                    class: "h-px w-full",
                    style: { "background": "linear-gradient(90deg, transparent, #f59e0b 40%, #fbbf24 60%, transparent)" }
                  }),
                  createVNode("div", { class: "p-8" }, [
                    createVNode("div", { class: "flex flex-col items-center mb-8" }, [
                      createVNode("div", {
                        class: "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-glow-pulse",
                        style: { "background": "linear-gradient(135deg, #f59e0b, #d97706)", "box-shadow": "0 0 32px rgba(245,158,11,0.4)" }
                      }, [
                        createVNode("span", { class: "font-display font-bold text-black text-2xl" }, "U")
                      ]),
                      createVNode("h1", { class: "font-display font-bold text-2xl text-white tracking-tight" }, "Welcome back"),
                      createVNode("p", { class: "text-sm text-gray-500 mt-1" }, "Sign in to Ujjal FMC ERP")
                    ]),
                    createVNode("form", {
                      onSubmit: withModifiers(handleLogin, ["prevent"]),
                      class: "space-y-4"
                    }, [
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", { class: "text-xs font-semibold text-gray-400 uppercase tracking-wider" }, "Email address"),
                        createVNode("div", { class: "relative" }, [
                          createVNode("div", { class: "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-4 h-4",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-width": "1.8",
                              viewBox: "0 0 24 24"
                            }, [
                              createVNode("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }),
                              createVNode("polyline", { points: "22,6 12,13 2,6" })
                            ]))
                          ]),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).email = $event,
                            type: "email",
                            placeholder: "admin@ujjalfmc.com",
                            class: ["input-glass pl-10", unref(errors).email ? "border-red-500/50 focus:ring-red-500/30" : ""]
                          }, null, 10, ["onUpdate:modelValue"]), [
                            [vModelText, unref(form).email]
                          ])
                        ]),
                        unref(errors).email ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "text-xs text-red-400"
                        }, toDisplayString(unref(errors).email), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "space-y-1.5" }, [
                        createVNode("label", { class: "text-xs font-semibold text-gray-400 uppercase tracking-wider" }, "Password"),
                        createVNode("div", { class: "relative" }, [
                          createVNode("div", { class: "absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-4 h-4",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-width": "1.8",
                              viewBox: "0 0 24 24"
                            }, [
                              createVNode("rect", {
                                x: "3",
                                y: "11",
                                width: "18",
                                height: "11",
                                rx: "2",
                                ry: "2"
                              }),
                              createVNode("path", { d: "M7 11V7a5 5 0 0110 0v4" })
                            ]))
                          ]),
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).password = $event,
                            type: unref(showPassword) ? "text" : "password",
                            placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
                            class: ["input-glass pl-10 pr-10", unref(errors).password ? "border-red-500/50 focus:ring-red-500/30" : ""]
                          }, null, 10, ["onUpdate:modelValue", "type"]), [
                            [vModelDynamic, unref(form).password]
                          ]),
                          createVNode("button", {
                            type: "button",
                            onClick: ($event) => showPassword.value = !unref(showPassword),
                            class: "absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors duration-150"
                          }, [
                            !unref(showPassword) ? (openBlock(), createBlock("svg", {
                              key: 0,
                              class: "w-4 h-4",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-width": "1.8",
                              viewBox: "0 0 24 24"
                            }, [
                              createVNode("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
                              createVNode("circle", {
                                cx: "12",
                                cy: "12",
                                r: "3"
                              })
                            ])) : (openBlock(), createBlock("svg", {
                              key: 1,
                              class: "w-4 h-4",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-width": "1.8",
                              viewBox: "0 0 24 24"
                            }, [
                              createVNode("path", { d: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" })
                            ]))
                          ], 8, ["onClick"])
                        ]),
                        unref(errors).password ? (openBlock(), createBlock("p", {
                          key: 0,
                          class: "text-xs text-red-400"
                        }, toDisplayString(unref(errors).password), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "flex items-center justify-between pt-1" }, [
                        createVNode("label", { class: "flex items-center gap-2 cursor-pointer group" }, [
                          withDirectives(createVNode("input", {
                            "onUpdate:modelValue": ($event) => unref(form).remember = $event,
                            type: "checkbox",
                            class: "w-4 h-4 rounded border-white/20 bg-white/[0.05] text-gold-500 focus:ring-gold-500/40"
                          }, null, 8, ["onUpdate:modelValue"]), [
                            [vModelCheckbox, unref(form).remember]
                          ]),
                          createVNode("span", { class: "text-xs text-gray-500 group-hover:text-gray-300 transition-colors" }, "Remember me")
                        ]),
                        createVNode("button", {
                          type: "button",
                          class: "text-xs text-gold-500/80 hover:text-gold-400 transition-colors duration-150"
                        }, " Forgot password? ")
                      ]),
                      createVNode(Transition, { name: "slide-up" }, {
                        default: withCtx(() => [
                          unref(loginError) ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm text-red-300",
                            style: { "background": "rgba(239,68,68,0.1)", "border": "1px solid rgba(239,68,68,0.2)" }
                          }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-4 h-4 shrink-0 text-red-400",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-width": "2",
                              viewBox: "0 0 24 24"
                            }, [
                              createVNode("circle", {
                                cx: "12",
                                cy: "12",
                                r: "10"
                              }),
                              createVNode("line", {
                                x1: "12",
                                y1: "8",
                                x2: "12",
                                y2: "12"
                              }),
                              createVNode("line", {
                                x1: "12",
                                y1: "16",
                                x2: "12.01",
                                y2: "16"
                              })
                            ])),
                            createTextVNode(" " + toDisplayString(unref(loginError)), 1)
                          ])) : createCommentVNode("", true)
                        ]),
                        _: 1
                      }),
                      createVNode("button", {
                        type: "submit",
                        disabled: unref(loading),
                        class: "btn-gold w-full justify-center py-3 text-sm font-semibold mt-2"
                      }, [
                        unref(loading) ? (openBlock(), createBlock("svg", {
                          key: 0,
                          class: "w-4 h-4 animate-spin",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", {
                            d: "M12 2a10 10 0 110 20A10 10 0 0112 2zm0 2a8 8 0 100 16A8 8 0 0012 4z",
                            "stroke-opacity": ".2"
                          }),
                          createVNode("path", { d: "M12 2a10 10 0 0110 10h-2A8 8 0 0012 4V2z" })
                        ])) : createCommentVNode("", true),
                        createVNode("span", null, toDisplayString(unref(loading) ? "Signing in\u2026" : "Sign in"), 1),
                        !unref(loading) ? (openBlock(), createBlock("svg", {
                          key: 1,
                          class: "w-4 h-4",
                          fill: "none",
                          stroke: "currentColor",
                          "stroke-width": "2.5",
                          viewBox: "0 0 24 24"
                        }, [
                          createVNode("path", { d: "M5 12h14M12 5l7 7-7 7" })
                        ])) : createCommentVNode("", true)
                      ], 8, ["disabled"])
                    ], 32)
                  ]),
                  createVNode("div", { class: "px-8 pb-6 text-center" }, [
                    createVNode("p", { class: "text-[11px] text-gray-700" }, " Ujjal Flour Mills Company \xA9 " + toDisplayString((/* @__PURE__ */ new Date()).getFullYear()) + " \xB7 ERP v1.0 ", 1)
                  ])
                ]),
                createVNode("p", { class: "text-center text-[11px] text-gray-700 mt-4" }, " Secured with end-to-end session encryption ")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/auth/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2c9a4e8b"]]);

export { login as default };
//# sourceMappingURL=login-COFS-zd0.mjs.map
