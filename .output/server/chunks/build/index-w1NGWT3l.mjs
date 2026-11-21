import { _ as _sfc_main$1 } from './HubTabs-rK5xWWPl.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { _ as __nuxt_component_1 } from './nuxt-link-rXgW20ax.mjs';
import { defineComponent, ref, withAsyncContext, computed, reactive, mergeProps, withCtx, unref, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './hubs-DhfvsbwY.mjs';
import './server.mjs';
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
import './usePermissions-D6Wyx0sM.mjs';
import './permRoutes-DkS2YyDC.mjs';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const segments = ["Trader / Store", "Bakery", "Food manufacturer", "Hotel / Institution", "Other business", "Unclassified"];
    const stages = ["new", "researching", "contacted", "quoted", "trial", "won", "lost"];
    const stage = ref(""), adding = ref(false), busy = ref(false);
    const { data, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/prospects",
      "$ae3sNVhwRq"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const all = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.prospects) != null ? _b : [];
    });
    const shown = computed(() => stage.value ? all.value.filter((p) => p.stage === stage.value) : all.value);
    const count = (s) => all.value.filter((p) => p.stage === s).length;
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const n = reactive({ name: "", business_name: "", segment: "", phone: "", address: "", source: "", source_url: "" });
    const finding = ref(false), searching = ref(false);
    const areas = ["Dhaka", "Gazipur", "Narayanganj", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Bogura", "Sirajganj", "Cumilla", "Mymensingh"];
    const kinds = { bakery: "Bakeries", sweets: "Sweets / confectionery", wholesale: "Wholesalers / traders", factory: "Food factories" };
    const q = reactive({ district: "Dhaka", kinds: ["bakery", "sweets"] });
    const found = ref(null), picked = ref([]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_HubTabs = _sfc_main$1;
      const _component_UiPageHeader = __nuxt_component_0;
      const _component_NuxtLink = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "Prospects",
        subtitle: "New customers to win \u2014 assessed before we open credit",
        breadcrumb: ["CRM", "Prospects"]
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn-ghost text-xs mr-2"${_scopeId}>${ssrInterpolate(unref(finding) ? "Close search" : "\u{1F50E} Find prospects")}</button><button class="btn-gold text-xs"${_scopeId}>${ssrInterpolate(unref(adding) ? "Close" : "+ Add prospect")}</button>`);
          } else {
            return [
              createVNode("button", {
                class: "btn-ghost text-xs mr-2",
                onClick: ($event) => finding.value = !unref(finding)
              }, toDisplayString(unref(finding) ? "Close search" : "\u{1F50E} Find prospects"), 9, ["onClick"]),
              createVNode("button", {
                class: "btn-gold text-xs",
                onClick: ($event) => adding.value = !unref(adding)
              }, toDisplayString(unref(adding) ? "Close" : "+ Add prospect"), 9, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(finding)) {
        _push(`<div class="glass-card p-4 space-y-3"><div class="text-[11px] text-gray-500">Searches public business listings (OpenStreetMap; Google Places if a key is set). Only the business type and area are sent out. Contact details on listings are often missing or stale \u2014 verify before calling. Nothing is saved until you pick it.</div><div class="flex flex-wrap items-center gap-2"><select class="field-input text-xs w-40"><!--[-->`);
        ssrRenderList(areas, (a) => {
          _push(`<option${ssrRenderAttr("value", a)}${ssrIncludeBooleanAttr(Array.isArray(unref(q).district) ? ssrLooseContain(unref(q).district, a) : ssrLooseEqual(unref(q).district, a)) ? " selected" : ""}>${ssrInterpolate(a)}</option>`);
        });
        _push(`<!--]--></select><!--[-->`);
        ssrRenderList(kinds, (label, k) => {
          _push(`<label class="text-xs text-gray-400 flex items-center gap-1"><input${ssrIncludeBooleanAttr(Array.isArray(unref(q).kinds) ? ssrLooseContain(unref(q).kinds, k) : unref(q).kinds) ? " checked" : ""} type="checkbox"${ssrRenderAttr("value", k)}>${ssrInterpolate(label)}</label>`);
        });
        _push(`<!--]--><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(searching) || !unref(q).kinds.length) ? " disabled" : ""}>${ssrInterpolate(unref(searching) ? "Searching\u2026 (up to a minute)" : "Search")}</button></div>`);
        if (unref(found)) {
          _push(`<div><div class="text-xs text-gray-400 mb-2">${ssrInterpolate(unref(found).candidates.length)} new \xB7 ${ssrInterpolate(unref(found).already_known)} already customers/prospects hidden \xB7 ${ssrInterpolate(unref(found).with_phone)} with phone \xB7 ${ssrInterpolate(unref(found).with_address)} with address \xB7 source: ${ssrInterpolate(unref(found).source)}</div><div class="max-h-96 overflow-auto border border-white/[0.07] rounded-xl"><table class="w-full text-xs"><tbody><!--[-->`);
          ssrRenderList(unref(found).candidates, (c, i) => {
            _push(`<tr class="border-b border-white/[0.04]"><td class="px-2 py-1.5"><input${ssrIncludeBooleanAttr(Array.isArray(unref(picked)) ? ssrLooseContain(unref(picked), i) : unref(picked)) ? " checked" : ""} type="checkbox"${ssrRenderAttr("value", i)}></td><td class="px-2 py-1.5"><a${ssrRenderAttr("href", c.source_url)} target="_blank" rel="noopener" class="text-gold-400 hover:underline">${ssrInterpolate(c.name)}</a><div class="text-[10px] text-gray-600">${ssrInterpolate(c.segment)}</div></td><td class="px-2 py-1.5 text-gray-400">${ssrInterpolate(c.phone || "\u2014")}</td><td class="px-2 py-1.5 text-gray-500">${ssrInterpolate(c.address || "\u2014")}</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div><button class="btn-gold text-xs mt-2"${ssrIncludeBooleanAttr(!unref(picked).length || unref(busy)) ? " disabled" : ""}>Add ${ssrInterpolate(unref(picked).length)} selected as prospects</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(adding)) {
        _push(`<div class="glass-card p-4 space-y-3"><div class="grid grid-cols-1 sm:grid-cols-3 gap-2"><input${ssrRenderAttr("value", unref(n).name)} class="field-input text-xs" placeholder="Name *"><input${ssrRenderAttr("value", unref(n).business_name)} class="field-input text-xs" placeholder="Business name"><select class="field-input text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(n).segment) ? ssrLooseContain(unref(n).segment, "") : ssrLooseEqual(unref(n).segment, "")) ? " selected" : ""}>Business type (guess if blank)</option><!--[-->`);
        ssrRenderList(segments, (s) => {
          _push(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(n).segment) ? ssrLooseContain(unref(n).segment, s) : ssrLooseEqual(unref(n).segment, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
        });
        _push(`<!--]--></select><input${ssrRenderAttr("value", unref(n).phone)} class="field-input text-xs" placeholder="Phone"><input${ssrRenderAttr("value", unref(n).address)} class="field-input text-xs sm:col-span-2" placeholder="Address / area"><input${ssrRenderAttr("value", unref(n).source)} class="field-input text-xs" placeholder="Where did you hear of them?"><input${ssrRenderAttr("value", unref(n).source_url)} class="field-input text-xs sm:col-span-2" placeholder="Link (page / listing), if found online"></div><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(n).name.trim() || unref(busy)) ? " disabled" : ""}>Save prospect</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
      ssrRenderList(stages, (s) => {
        _push(`<button class="${ssrRenderClass([unref(stage) === s ? "bg-gold-500/15 text-gold-400 border-gold-500/25" : "text-gray-500 border-white/[0.07]", "px-3 py-1.5 rounded-xl text-xs border"])}">${ssrInterpolate(s)} <span class="text-gray-600">${ssrInterpolate(count(s))}</span></button>`);
      });
      _push(`<!--]--></div><div class="glass-card overflow-x-auto"><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">Prospect</th><th class="px-3 py-2 text-left">Type \xB7 district</th><th class="px-3 py-2 text-left">Stage</th><th class="px-3 py-2 text-right">Fit</th><th class="px-3 py-2 text-left">Risk</th><th class="px-3 py-2 text-right">Potential / month \u09F3</th><th class="px-3 py-2 text-left">Verdict</th><th class="px-3 py-2 text-left">Last contact</th></tr></thead><tbody><!--[-->`);
      ssrRenderList(unref(shown), (p) => {
        var _a, _b;
        _push(`<tr class="border-b border-white/[0.04]"><td class="px-3 py-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/crm/prospects/${p.id}`,
          class: "text-gold-400 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(p.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(p.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`<div class="text-[10px] text-gray-600">${ssrInterpolate(p.business_name)}`);
        if (p.created_by_agent) {
          _push(`<span> \xB7 found by assistant</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></td><td class="px-3 py-2 text-gray-400">${ssrInterpolate((_a = p.segment) != null ? _a : "\u2014")} \xB7 ${ssrInterpolate((_b = p.district) != null ? _b : "\u2014")}</td><td class="px-3 py-2">${ssrInterpolate(p.stage)}</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(p.fit)}</td><td class="${ssrRenderClass([p.risk_band === "High" ? "text-red-400" : p.risk_band === "Medium" ? "text-amber-400" : "text-emerald-400", "px-3 py-2"])}">${ssrInterpolate(p.risk_band)}</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n0(p.potential_monthly_low))} \u2013 ${ssrInterpolate(n0(p.potential_monthly_high))}</td><td class="px-3 py-2 text-gray-300">${ssrInterpolate(p.verdict)}</td><td class="px-3 py-2 text-gray-500">${ssrInterpolate(p.last_contact ? String(p.last_contact).slice(0, 10) : "\u2014")}</td></tr>`);
      });
      _push(`<!--]-->`);
      if (!unref(shown).length) {
        _push(`<tr><td colspan="8" class="px-3 py-8 text-center text-gray-600">No prospects yet. Add one, or ask the assistant to find some.</td></tr>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/prospects/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-w1NGWT3l.mjs.map
