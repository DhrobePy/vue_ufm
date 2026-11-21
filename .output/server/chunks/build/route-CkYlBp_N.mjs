import { _ as _sfc_main$1 } from './HubTabs-B7UBGuJv.mjs';
import { _ as __nuxt_component_0 } from './PageHeader-BERwg_WF.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { q as useUserSession } from './server.mjs';
import { u as useFetch } from './fetch-DAhIlcha.mjs';
import './nuxt-link-rXgW20ax.mjs';
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
import './hubs-AUChU-3l.mjs';
import './usePermissions-CG_SWEjg.mjs';
import './permRoutes-DvaKf2tr.mjs';
import 'vue-router';
import '@vue/shared';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "route",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useToast();
    const { user: sessionUser } = useUserSession();
    const { data: d, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/route",
      { lazy: true },
      "$cPdiPYbp3g"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: tr, refresh: refreshTr } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/crm/territory",
      { lazy: true },
      "$jlfxoOdz1W"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const isAdmin = computed(() => {
      var _a, _b;
      return ["admin", "superadmin"].includes(String((_b = (_a = sessionUser.value) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase());
    });
    const n0 = (v) => Math.round(Number(v != null ? v : 0)).toLocaleString("en-US");
    const sel = reactive({}), startKey = ref("demra"), mine = ref(null), route = ref([]), tasking = ref(false);
    const startsAll = computed(() => {
      var _a, _b;
      return [...(_b = (_a = d.value) == null ? void 0 : _a.starts) != null ? _b : [], ...mine.value ? [mine.value] : []];
    });
    const start = computed(() => {
      var _a;
      return (_a = startsAll.value.find((s) => s.key === startKey.value)) != null ? _a : startsAll.value[0];
    });
    const picked = computed(() => {
      var _a, _b;
      return ((_b = (_a = d.value) == null ? void 0 : _a.stops) != null ? _b : []).filter((s) => sel[s.key] && s.lat != null);
    });
    ref(null);
    const hav = (a, b) => {
      const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r, x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(x));
    };
    const km = computed(() => {
      let t = 0, cur = start.value;
      for (const s of route.value) {
        t += hav(cur, s);
        cur = s;
      }
      return Math.round(t * 1.3);
    });
    const gUrl = computed(() => {
      const pts = [start.value, ...route.value.slice(0, 9)].map((p) => `${p.lat},${p.lon}`);
      return `https://www.google.com/maps/dir/${pts.join("/")}`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_HubTabs = _sfc_main$1;
      const _component_UiPageHeader = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_HubTabs, { hub: "crm" }, null, _parent));
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "CRM \u2014 Route & territory",
        subtitle: "Plan a day of visits, and see how well each district is covered",
        breadcrumb: ["CRM", "Route"]
      }, null, _parent));
      if (unref(pending)) {
        _push(`<div class="glass-card p-8 text-center text-xs text-gray-500">Loading\u2026</div>`);
      } else if (unref(d)) {
        _push(`<!--[--><div class="glass-card p-4 space-y-3"><div class="flex flex-wrap items-center gap-2"><h2 class="section-title">Visit route</h2><select class="field-input text-xs py-1.5 w-40"><!--[-->`);
        ssrRenderList(unref(startsAll), (s) => {
          _push(`<option${ssrRenderAttr("value", s.key)}${ssrIncludeBooleanAttr(Array.isArray(unref(startKey)) ? ssrLooseContain(unref(startKey), s.key) : ssrLooseEqual(unref(startKey), s.key)) ? " selected" : ""}>Start: ${ssrInterpolate(s.label)}</option>`);
        });
        _push(`<!--]--></select><button class="btn-ghost text-xs">\u{1F4CD} Use my location</button><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(!unref(picked).length) ? " disabled" : ""}>Plan route (${ssrInterpolate(unref(picked).length)})</button><span class="text-[11px] text-gray-500">${ssrInterpolate(unref(d).pinned)} places have an exact GPS pin; the rest sit at the middle of their district (\u2248). Pin a place by logging a visit with \u201CSave as this place&#39;s location\u201D.</span></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="max-h-96 overflow-y-auto border border-white/[0.06] rounded-lg"><!--[-->`);
        ssrRenderList(unref(d).stops, (s) => {
          _push(`<label class="${ssrRenderClass([s.lat == null ? "opacity-40" : "", "flex items-start gap-2 px-3 py-1.5 text-xs border-b border-white/[0.04] hover:bg-white/[0.03]"])}"><input${ssrIncludeBooleanAttr(Array.isArray(unref(sel)[s.key]) ? ssrLooseContain(unref(sel)[s.key], null) : unref(sel)[s.key]) ? " checked" : ""} type="checkbox"${ssrIncludeBooleanAttr(s.lat == null) ? " disabled" : ""} class="mt-0.5"><span class="flex-1"><span class="text-gray-200">${ssrInterpolate(s.name)}</span> <span class="text-gray-500">${ssrInterpolate(s.district)}${ssrInterpolate(s.exact ? "" : " \u2248")}</span><br><span class="text-gray-500">${ssrInterpolate(s.reason)}</span></span><span class="text-[10px] text-gray-600">${ssrInterpolate(s.tags.join(", "))}</span></label>`);
        });
        _push(`<!--]-->`);
        if (!unref(d).stops.length) {
          _push(`<p class="p-4 text-xs text-gray-600">Nothing needs a visit right now.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div><div class="h-96 rounded-lg border border-white/[0.07] bg-white/[0.03]"></div></div></div>`);
        if (unref(route).length) {
          _push(`<div class="space-y-2"><p class="text-xs text-gray-300">${ssrInterpolate(unref(route).length)} stops \xB7 about ${ssrInterpolate(unref(km))} km by road (straight-line distance + 30%, so a guide only). Order: nearest next stop from the start.</p><ol class="list-decimal pl-5 text-xs text-gray-200 space-y-0.5"><!--[-->`);
          ssrRenderList(unref(route), (s) => {
            _push(`<li>${ssrInterpolate(s.name)} <span class="text-gray-500">\u2014 ${ssrInterpolate(s.district)}${ssrInterpolate(s.exact ? "" : " \u2248")} \xB7 ${ssrInterpolate(s.reason)}</span></li>`);
          });
          _push(`<!--]--></ol><div class="flex flex-wrap gap-2"><a${ssrRenderAttr("href", unref(gUrl))} target="_blank" rel="noopener" class="btn-ghost text-xs">Open in Google Maps</a><button class="btn-gold text-xs"${ssrIncludeBooleanAttr(unref(tasking)) ? " disabled" : ""}>Make today&#39;s visit tasks</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="glass-card p-4 space-y-2 overflow-x-auto"><h2 class="section-title">Territory <span class="text-gray-600 font-normal">\u2014 by district, last 12 months</span></h2><table class="w-full text-xs"><thead><tr class="border-b border-white/[0.07] text-[10px] uppercase tracking-wide text-gray-500"><th class="px-3 py-2 text-left">District</th><th class="px-3 py-2 text-right">Customers</th><th class="px-3 py-2 text-right">Sales</th><th class="px-3 py-2 text-right">Share</th><th class="px-3 py-2 text-right">Slipping / dormant</th><th class="px-3 py-2 text-right">Risky</th><th class="px-3 py-2 text-right">Buyers not contacted in 60 d</th><th class="px-3 py-2 text-left">Looked after by</th>`);
        if (unref(isAdmin)) {
          _push(`<th class="px-3 py-2 text-left">Assign</th>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tr></thead><tbody><!--[-->`);
        ssrRenderList((_b = (_a = unref(tr)) == null ? void 0 : _a.districts) != null ? _b : [], (t) => {
          _push(`<tr class="border-b border-white/[0.04]"><td class="px-3 py-2 text-gray-200">${ssrInterpolate(t.district)}</td><td class="px-3 py-2 text-right">${ssrInterpolate(t.customers)}</td><td class="px-3 py-2 text-right font-mono">${ssrInterpolate(n0(t.value_12m))}</td><td class="px-3 py-2 text-right">${ssrInterpolate(t.share)}%</td><td class="${ssrRenderClass([t.slipping ? "text-amber-300" : "", "px-3 py-2 text-right"])}">${ssrInterpolate(t.slipping)}</td><td class="${ssrRenderClass([t.risky ? "text-red-400" : "", "px-3 py-2 text-right"])}">${ssrInterpolate(t.risky)}</td><td class="${ssrRenderClass([t.not_contacted_60d && t.buyers ? "text-amber-300" : "", "px-3 py-2 text-right"])}">${ssrInterpolate(t.not_contacted_60d)} / ${ssrInterpolate(t.buyers)}</td><td class="px-3 py-2 text-gray-400">${ssrInterpolate(t.owners.map((o) => `${o.name} (${o.n})`).join(", "))}</td>`);
          if (unref(isAdmin)) {
            _push(`<td class="px-3 py-2"><select class="field-input text-[11px] py-1 w-36"><option value="">Choose person\u2026</option><option value="0">\u2014 clear \u2014</option><!--[-->`);
            ssrRenderList(unref(tr).users, (u) => {
              _push(`<option${ssrRenderAttr("value", u.id)}>${ssrInterpolate(u.name)}</option>`);
            });
            _push(`<!--]--></select></td>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tr>`);
        });
        _push(`<!--]--></tbody></table><p class="text-[11px] text-gray-600">Assigning sets \u201Cwho looks after\u201D for every customer of that district (only fills the CRM owner field; money and orders are untouched). Owners get a small boost in their own action list.</p></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/crm/route.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=route-CkYlBp_N.mjs.map
