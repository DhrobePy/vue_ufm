import { _ as _sfc_main$1 } from './PageHeader-CvF0chzj.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CVkglZ_a.mjs';
import { defineComponent, withAsyncContext, reactive, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useFetch } from './fetch-BuG1JnEF.mjs';
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
import '@vue/shared';
import './server.mjs';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d, _e, _f;
    let __temp, __restore;
    useToast();
    const TC_DEFAULTS = {
      tc_purchase_order: [
        "Goods must conform to specified quality standards upon delivery.",
        "Moisture content must not exceed 13% for wheat.",
        "Supplier must provide phytosanitary certificate for imported wheat.",
        "Payment terms as stated above from GRN acceptance.",
        "Any short delivery must be notified before unloading.",
        "Subject to Sirajgonj jurisdiction."
      ].join("\n"),
      tc_credit_invoice: [
        "Payment due within 30 days of invoice date.",
        "Goods once sold cannot be returned without prior written approval.",
        "Interest @ 2% per month charged on overdue balances.",
        "All disputes subject to Sirajgonj jurisdiction.",
        "This invoice is valid only with authorised company stamp."
      ].join("\n")
    };
    const { data: docData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/settings/documents",
      "$DwdUfiZ5-1"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const docSettings = reactive({
      tc_purchase_order: (_c = (_b = (_a = docData.value) == null ? void 0 : _a.settings) == null ? void 0 : _b.tc_purchase_order) != null ? _c : TC_DEFAULTS.tc_purchase_order,
      tc_credit_invoice: (_f = (_e = (_d = docData.value) == null ? void 0 : _d.settings) == null ? void 0 : _e.tc_credit_invoice) != null ? _f : TC_DEFAULTS.tc_credit_invoice
    });
    const docSaving = ref(false);
    const seeding = ref(false);
    const seedReport = ref(null);
    const seedSummary = ref("");
    const activeTab = ref("company");
    const tabs = [
      { id: "company", icon: "\u{1F3E2}", label: "Company" },
      { id: "branches", icon: "\u{1F4CD}", label: "Branches" },
      { id: "finance", icon: "\u{1F4B0}", label: "Finance" },
      { id: "orders", icon: "\u{1F4CB}", label: "Orders" },
      { id: "documents", icon: "\u{1F4C4}", label: "Documents" },
      { id: "notifications", icon: "\u{1F514}", label: "Notifications" },
      { id: "security", icon: "\u{1F512}", label: "Security" },
      { id: "maintenance", icon: "\u{1F527}", label: "Maintenance" }
    ];
    const company = reactive({
      name: "Ujjal Flour Mills Company",
      tradeName: "Ujjal FMC",
      regNo: "C-XXXXXX/XX",
      tin: "123456789-0101",
      address: "Sirajgonj Sadar, Sirajgonj-6700, Bangladesh",
      phone: "+880 1711-000000",
      email: "info@ujjalfmc.com"
    });
    const { data: branchData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$R2g-v84IhP"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const branches = computed(
      () => {
        var _a2, _b2;
        return ((_b2 = (_a2 = branchData.value) == null ? void 0 : _a2.branches) != null ? _b2 : []).map((b) => {
          var _a3, _b3, _c2;
          return {
            id: b.id,
            name: b.name,
            code: (_a3 = b.code) != null ? _a3 : "",
            address: (_b3 = b.address) != null ? _b3 : "\u2014",
            status: (_c2 = b.status) != null ? _c2 : "active"
          };
        });
      }
    );
    const finance = reactive({
      fyStart: "07",
      currency: "BDT",
      defaultCreditLimit: 5e5,
      defaultPaymentTerms: 30,
      vatRate: 0,
      lateRate: 1.5
    });
    const orderOptions = reactive([
      { key: "auto_approve", label: "Auto-approve orders under credit limit", description: "Orders within limit bypass manual approval", value: false },
      { key: "require_pod", label: "Require Proof of Delivery", description: "Driver must upload photo or signature", value: true },
      { key: "allow_partial", label: "Allow partial deliveries", description: "Orders can be delivered in multiple trips", value: true },
      { key: "block_overdue", label: "Block orders for overdue customers", description: "Prevent new orders if customer has overdue amount", value: true }
    ]);
    const notifChannels = reactive([
      { key: "telegram", label: "Telegram Notifications", description: "Send order & payment alerts to Telegram", enabled: true },
      { key: "email", label: "Email Notifications", description: "Send daily summaries by email", enabled: false }
    ]);
    const notifSettings = reactive({ telegramToken: "", adminChatId: "" });
    const security = reactive({ sessionTimeout: 120, maxLoginAttempts: 5 });
    const securityOptions = reactive([
      { key: "force_2fa", label: "Require 2FA for Admin roles", description: "Superadmin and admin must use two-factor auth", value: false },
      { key: "ip_whitelist", label: "IP Whitelist (office only)", description: "Restrict login to known office IPs", value: false },
      { key: "audit_all", label: "Log all page views", description: "Include read actions in audit trail", value: false }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "System Settings",
        subtitle: "Configure ERP preferences, branches, and integrations",
        breadcrumb: ["Admin", "Settings"]
      }, null, _parent));
      _push(`<div class="flex gap-6 flex-col lg:flex-row"><div class="lg:w-52 shrink-0"><div class="glass-card p-2 space-y-0.5"><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(`<button class="${ssrRenderClass([
          "w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
          unref(activeTab) === tab.id ? "bg-gold-500/10 text-gold-400 border border-gold-500/20" : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]"
        ])}"><span class="text-base">${ssrInterpolate(tab.icon)}</span> ${ssrInterpolate(tab.label)}</button>`);
      });
      _push(`<!--]--></div></div><div class="flex-1 space-y-5">`);
      if (unref(activeTab) === "company") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Company Information</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Name</label><input${ssrRenderAttr("value", unref(company).name)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trade Name</label><input${ssrRenderAttr("value", unref(company).tradeName)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registration No.</label><input${ssrRenderAttr("value", unref(company).regNo)} type="text" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">TIN / BIN</label><input${ssrRenderAttr("value", unref(company).tin)} type="text" class="input-glass font-mono"></div><div class="space-y-1.5 sm:col-span-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Address</label><textarea rows="2" class="input-glass resize-none">${ssrInterpolate(unref(company).address)}</textarea></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</label><input${ssrRenderAttr("value", unref(company).phone)} type="text" class="input-glass"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label><input${ssrRenderAttr("value", unref(company).email)} type="email" class="input-glass"></div></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "branches") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-4"><div class="flex items-center justify-between"><h3 class="section-title">Branches</h3><button class="btn-gold text-xs">+ Add Branch</button></div><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          _push(`<div class="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]"><div><p class="text-sm font-semibold text-gray-200">${ssrInterpolate(b.name)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(b.address)}</p></div><div class="flex items-center gap-3">`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: b.status
          }, null, _parent));
          _push(`<button class="text-xs text-gray-500 hover:text-gold-400 transition-colors">Edit</button></div></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "finance") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Fiscal Settings</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fiscal Year Start</label><select class="input-glass"><option value="01"${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "01") : ssrLooseEqual(unref(finance).fyStart, "01")) ? " selected" : ""}>January</option><option value="04"${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "04") : ssrLooseEqual(unref(finance).fyStart, "04")) ? " selected" : ""}>April</option><option value="07"${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "07") : ssrLooseEqual(unref(finance).fyStart, "07")) ? " selected" : ""}>July (Bangladesh FY)</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Currency</label><select class="input-glass"><option value="BDT"${ssrIncludeBooleanAttr(Array.isArray(unref(finance).currency) ? ssrLooseContain(unref(finance).currency, "BDT") : ssrLooseEqual(unref(finance).currency, "BDT")) ? " selected" : ""}>BDT \u2014 Bangladeshi Taka (\u09F3)</option></select></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Credit Limit (\u09F3)</label><input${ssrRenderAttr("value", unref(finance).defaultCreditLimit)} type="number" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Default Payment Terms (days)</label><input${ssrRenderAttr("value", unref(finance).defaultPaymentTerms)} type="number" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">VAT Rate (%)</label><input${ssrRenderAttr("value", unref(finance).vatRate)} type="number" step="0.5" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Late Payment Penalty (%)</label><input${ssrRenderAttr("value", unref(finance).lateRate)} type="number" step="0.5" class="input-glass font-mono"></div></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "orders") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Order Settings</h3><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(orderOptions), (opt) => {
          _push(`<div class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0"><div><p class="text-sm font-medium text-gray-200">${ssrInterpolate(opt.label)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(opt.description)}</p></div><label class="relative inline-flex items-center cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(opt.value) ? ssrLooseContain(opt.value, null) : opt.value) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "documents") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-6"><h3 class="section-title">Document Terms &amp; Conditions</h3><p class="text-xs text-gray-500">Customize the T&amp;C text printed on vouchers. Enter one clause per line \u2014 each line becomes a bullet point on the document.</p><div class="space-y-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Purchase Order T&amp;C</label><p class="text-[11px] text-gray-600">Printed in the Terms &amp; Conditions box of every PO receipt.</p><textarea rows="7" class="input-glass resize-y font-mono text-xs leading-relaxed" placeholder="One clause per line\u2026">${ssrInterpolate(unref(docSettings).tc_purchase_order)}</textarea></div><div class="space-y-2"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Credit Sales Invoice T&amp;C</label><p class="text-[11px] text-gray-600">Printed in the Notes &amp; Terms section of every credit sales invoice.</p><textarea rows="7" class="input-glass resize-y font-mono text-xs leading-relaxed" placeholder="One clause per line\u2026">${ssrInterpolate(unref(docSettings).tc_credit_invoice)}</textarea></div><div class="flex items-center justify-between pt-2"><button class="btn-ghost text-xs">Reset to Defaults</button><button${ssrIncludeBooleanAttr(unref(docSaving)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(docSaving)) {
          _push(`<svg class="w-3.5 h-3.5 animate-spin inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(docSaving) ? "Saving\u2026" : "Save Document Settings")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "notifications") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Notification Channels</h3><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(notifChannels), (ch) => {
          _push(`<div class="flex items-start justify-between py-3 border-b border-white/[0.04] last:border-0"><div class="flex-1 mr-4"><p class="text-sm font-medium text-gray-200">${ssrInterpolate(ch.label)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(ch.description)}</p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5"><input${ssrIncludeBooleanAttr(Array.isArray(ch.enabled) ? ssrLooseContain(ch.enabled, null) : ch.enabled) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label></div>`);
        });
        _push(`<!--]--></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telegram Bot Token</label><input${ssrRenderAttr("value", unref(notifSettings).telegramToken)} type="password" class="input-glass font-mono" placeholder="bot:xxxx\u2026"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin Telegram Chat ID</label><input${ssrRenderAttr("value", unref(notifSettings).adminChatId)} type="text" class="input-glass font-mono" placeholder="-100xxxxx"></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "security") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-5"><h3 class="section-title">Security &amp; Access</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Session Timeout (minutes)</label><input${ssrRenderAttr("value", unref(security).sessionTimeout)} type="number" min="5" class="input-glass font-mono"></div><div class="space-y-1.5"><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Login Attempts</label><input${ssrRenderAttr("value", unref(security).maxLoginAttempts)} type="number" min="3" class="input-glass font-mono"></div></div><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(securityOptions), (opt) => {
          _push(`<div class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0"><div><p class="text-sm font-medium text-gray-200">${ssrInterpolate(opt.label)}</p><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(opt.description)}</p></div><label class="relative inline-flex items-center cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(opt.value) ? ssrLooseContain(opt.value, null) : opt.value) ? " checked" : ""} type="checkbox" class="sr-only peer"><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div></label></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end"><button class="btn-gold text-xs">Save Changes</button></div></div><div class="glass-card p-6 space-y-4 border border-red-500/20"><h3 class="text-sm font-semibold text-red-400">Danger Zone</h3><div class="flex items-center justify-between py-3"><div><p class="text-sm font-medium text-gray-200">Clear All Cache</p><p class="text-xs text-gray-500">Flush system cache and session data</p></div><button class="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">Clear Cache</button></div><div class="flex items-center justify-between py-3 border-t border-white/[0.04]"><div><p class="text-sm font-medium text-gray-200">Export All Data</p><p class="text-xs text-gray-500">Download full database backup as SQL</p></div><button class="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/[0.05] transition-colors">Export</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "maintenance") {
        _push(`<div class="space-y-5"><div class="glass-card p-6 space-y-4"><h3 class="section-title">Data Migrations</h3><p class="text-xs text-gray-500">One-time tasks to backfill historical data into new accounting tables. Safe to run multiple times \u2014 already-linked records are skipped automatically.</p><div class="border border-white/[0.06] rounded-xl p-5 space-y-4"><div><p class="text-sm font-semibold text-gray-200">Backfill Expense Journal Entries</p><p class="text-xs text-gray-500 mt-1"> Creates <strong class="text-gray-300">journal_entries</strong> and <strong class="text-gray-300">transaction_lines</strong> for every approved / cancelled-after-approval expense voucher that currently has no GL entry. Cancelled expenses also get a matching reversal entry. </p></div>`);
        if (unref(seedReport)) {
          _push(`<div class="rounded-xl p-4 text-xs space-y-1" style="${ssrRenderStyle(unref(seedReport).errors.length ? "background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2)" : "background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2)")}"><p class="${ssrRenderClass(unref(seedReport).errors.length ? "text-red-300 font-semibold" : "text-emerald-300 font-semibold")}">${ssrInterpolate(unref(seedSummary))}</p><p class="text-gray-400">\u2705 Created: ${ssrInterpolate(unref(seedReport).created)} \xA0\xB7\xA0 \u23ED Skipped: ${ssrInterpolate(unref(seedReport).skipped)} \xA0\xB7\xA0 \u274C Errors: ${ssrInterpolate(unref(seedReport).errors.length)}</p>`);
          if (unref(seedReport).errors.length) {
            _push(`<div class="mt-2 space-y-1"><p class="text-red-400 font-semibold">Errors (missing GL account config):</p><!--[-->`);
            ssrRenderList(unref(seedReport).errors, (e) => {
              _push(`<div class="text-red-300 font-mono">${ssrInterpolate(e.voucher)}: ${ssrInterpolate(e.reason)}</div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button${ssrIncludeBooleanAttr(unref(seeding)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">`);
        if (unref(seeding)) {
          _push(`<svg class="w-3.5 h-3.5 animate-spin inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-opacity=".25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(seeding) ? "Running backfill\u2026" : "\u25B6 Run Backfill Now")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-Cm-YgP8o.mjs.map
