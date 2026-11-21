import { _ as _sfc_main$1 } from './HubTabs-B7UBGuJv.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, withAsyncContext, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-AUChU-3l.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';
import 'vue-router';
import './usePermissions-CG_SWEjg.mjs';
import './permRoutes-DvaKf2tr.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "messages",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/messages",
      { lazy: true },
      "$H3sNS3jA0w"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const g = computed(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.gateway;
    });
    const cur = ref(""), conv = ref(null), text = ref(""), ch = ref("whatsapp"), busy = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_HubTabs = _sfc_main$1;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "CRM \u2014 Messages",
        subtitle: "Replies from customers and prospects, and what has been sent",
        breadcrumb: ["CRM", "Messages"]
      }, null, _parent));
      if (unref(g)) {
        _push(`<div class="glass-card p-3 text-xs flex flex-wrap gap-x-4 gap-y-1 text-gray-400"><span class="${ssrRenderClass(unref(g).enabled ? "text-emerald-400" : "text-amber-400")}">\u25CF Sending ${ssrInterpolate(unref(g).enabled ? "is on" : "is off (Admin \u2192 Settings \u2192 CRM)")}</span><span class="${ssrRenderClass(unref(g).sms ? "text-emerald-400" : "text-gray-600")}">SMS ${ssrInterpolate(unref(g).sms ? "connected" : "not connected")}</span><span class="${ssrRenderClass(unref(g).whatsapp ? "text-emerald-400" : "text-gray-600")}">WhatsApp ${ssrInterpolate(unref(g).whatsapp ? "connected" : "not connected")}</span><span class="${ssrRenderClass(unref(g).inbound_sms || unref(g).inbound_whatsapp ? "text-emerald-400" : "text-gray-600")}">Replies ${ssrInterpolate(unref(g).inbound_sms || unref(g).inbound_whatsapp ? "arrive here" : "cannot arrive yet (webhook not set up)")}</span><span class="text-gray-600">${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.opted_out) != null ? _b : 0)} on the do-not-contact list</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-4"><div class="glass-card p-2 max-h-[70vh] overflow-y-auto lg:col-span-1"><!--[-->`);
      ssrRenderList((_d = (_c = unref(data)) == null ? void 0 : _c.threads) != null ? _d : [], (t) => {
        var _a2;
        _push(`<button class="${ssrRenderClass([unref(cur) === t.phone ? "bg-white/[0.07]" : "", "w-full text-left px-3 py-2 rounded-lg hover:bg-white/[0.05] border-b border-white/[0.04]"])}"><div class="flex items-center gap-2 text-xs"><span class="font-semibold text-gray-200 flex-1 truncate">${ssrInterpolate((_a2 = t.name) != null ? _a2 : t.phone)}</span>`);
        if (Number(t.unread)) {
          _push(`<span class="px-1.5 rounded-full bg-gold-500/20 text-gold-400 text-[10px]">${ssrInterpolate(t.unread)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><p class="text-[11px] text-gray-500 truncate">${ssrInterpolate(t.direction === "in" ? "" : "you: ")}${ssrInterpolate(t.body)}</p><p class="text-[10px] text-gray-600">${ssrInterpolate(t.channel)} \xB7 ${ssrInterpolate(String(t.created_at).slice(0, 16))}</p></button>`);
      });
      _push(`<!--]-->`);
      if (!((_f = (_e = unref(data)) == null ? void 0 : _e.threads) != null ? _f : []).length) {
        _push(`<p class="p-4 text-xs text-gray-600">No messages yet. Messages sent from a customer card or the Today list, and any replies, appear here.</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="glass-card p-4 space-y-3 lg:col-span-2">`);
      if (unref(conv)) {
        _push(`<!--[--><div class="flex items-center gap-2"><h2 class="section-title flex-1">${ssrInterpolate((_h = (_g = unref(conv).party) == null ? void 0 : _g.name) != null ? _h : unref(cur))}</h2>`);
        if (unref(conv).party) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: unref(conv).party.party_type === "prospect" ? `/crm/prospects/${unref(conv).party.party_id}` : `/crm/customers/${unref(conv).party.party_id}`,
            class: "btn-ghost text-[11px] px-2.5 py-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Open card`);
              } else {
                return [
                  createTextVNode("Open card")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        if (!unref(conv).opted_out) {
          _push(`<button class="btn-ghost text-[11px] px-2.5 py-1">Do not contact</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(conv).opted_out) {
          _push(`<p class="text-xs text-red-400">\u26D4 This number asked not to be contacted. Sending is blocked.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-2 max-h-[45vh] overflow-y-auto"><!--[-->`);
        ssrRenderList(unref(conv).messages, (m) => {
          _push(`<div class="${ssrRenderClass([m.direction === "out" ? "justify-end" : "", "flex"])}"><div class="${ssrRenderClass([m.direction === "out" ? "bg-gold-500/15 text-gray-100" : "bg-white/[0.07] text-gray-200", "max-w-[80%] rounded-xl px-3 py-2 text-xs"])}"><p class="whitespace-pre-wrap">${ssrInterpolate(m.body)}</p><p class="text-[10px] text-gray-500 mt-1">${ssrInterpolate(m.channel)} \xB7 ${ssrInterpolate(String(m.created_at).slice(5, 16))}`);
          if (m.by_user) {
            _push(`<!--[--> \xB7 ${ssrInterpolate(m.by_user)}<!--]-->`);
          } else {
            _push(`<!---->`);
          }
          if (m.status === "failed") {
            _push(`<span class="text-red-400"> \xB7 not sent: ${ssrInterpolate(m.error)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p></div></div>`);
        });
        _push(`<!--]--></div>`);
        if (!unref(conv).opted_out && unref(conv).party) {
          _push(`<div class="flex gap-2 items-end"><select class="field-input text-xs py-1.5 w-28"><option value="whatsapp"${ssrIncludeBooleanAttr(Array.isArray(unref(ch)) ? ssrLooseContain(unref(ch), "whatsapp") : ssrLooseEqual(unref(ch), "whatsapp")) ? " selected" : ""}>WhatsApp</option><option value="sms"${ssrIncludeBooleanAttr(Array.isArray(unref(ch)) ? ssrLooseContain(unref(ch), "sms") : ssrLooseEqual(unref(ch), "sms")) ? " selected" : ""}>SMS</option></select><textarea rows="2" class="field-input text-xs flex-1" placeholder="Reply\u2026">${ssrInterpolate(unref(text))}</textarea><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(text).trim() || unref(busy) || !((_i = unref(g)) == null ? void 0 : _i.enabled)) ? " disabled" : ""}>${ssrInterpolate(unref(busy) ? "Sending\u2026" : "Send")}</button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(conv).party && !((_j = unref(g)) == null ? void 0 : _j.enabled)) {
          _push(`<p class="text-[11px] text-gray-600">Direct sending is off \u2014 reply from your own phone, then log it on the card.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<p class="text-xs text-gray-600">Pick a conversation on the left.</p>`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/messages.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=messages-Br1XO5vd.mjs.map
