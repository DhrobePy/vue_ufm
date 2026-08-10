import { _ as _sfc_main$1 } from './PageHeader-D3S7than.mjs';
import { _ as _sfc_main$2 } from './StatusBadge-CIXHKBxR.mjs';
import { defineComponent, ref, watch, withAsyncContext, reactive, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useToast } from './useToast-Mxh_qoqg.mjs';
import { u as useTheme } from './useTheme-DcI34_eY.mjs';
import { u as useFetch } from './fetch-BiYh1qCk.mjs';
import { c as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
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
import 'perfect-debounce';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    let __temp, __restore;
    useToast();
    const themeStore = useTheme();
    const appCustomHex = ref(themeStore.customHex.value);
    watch(() => themeStore.customHex.value, (v) => {
      appCustomHex.value = v;
    });
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
      "$MSbevq6tl-"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const docSettings = reactive({
      tc_purchase_order: (_c = (_b = (_a = docData.value) == null ? void 0 : _a.settings) == null ? void 0 : _b.tc_purchase_order) != null ? _c : TC_DEFAULTS.tc_purchase_order,
      tc_credit_invoice: (_f = (_e = (_d = docData.value) == null ? void 0 : _d.settings) == null ? void 0 : _e.tc_credit_invoice) != null ? _f : TC_DEFAULTS.tc_credit_invoice
    });
    const docShowOutstanding = ref(((_i = (_h = (_g = docData.value) == null ? void 0 : _g.settings) == null ? void 0 : _h.show_invoice_outstanding) != null ? _i : "1") !== "0");
    const docSaving = ref(false);
    const { data: cwData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/settings/credit-workflow",
      "$_miHTY0VzC"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const creditWorkflow = reactive({
      dispatch_global_hold: (_l = (_k = (_j = cwData.value) == null ? void 0 : _j.settings) == null ? void 0 : _k.dispatch_global_hold) != null ? _l : true,
      credit_limit_auto_release: (_o = (_n = (_m = cwData.value) == null ? void 0 : _m.settings) == null ? void 0 : _n.credit_limit_auto_release) != null ? _o : false,
      payment_require_approval: (_r = (_q = (_p = cwData.value) == null ? void 0 : _p.settings) == null ? void 0 : _q.payment_require_approval) != null ? _r : true
    });
    const creditWorkflowSaving = ref(false);
    const { data: deliveryData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/settings/delivery",
      "$0sMfWoqxeA"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const deliverySettings = reactive({
      require_dispatch_pin: (_u = (_t = (_s = deliveryData.value) == null ? void 0 : _s.settings) == null ? void 0 : _t.require_dispatch_pin) != null ? _u : true,
      delivery_confirm_user_ids: [
        ...(_x = (_w = (_v = deliveryData.value) == null ? void 0 : _v.settings) == null ? void 0 : _w.delivery_confirm_user_ids) != null ? _x : []
      ].map(Number)
    });
    const deliverySaving = ref(false);
    const deliverySaveMsg = ref("");
    const { data: allUsersData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/admin/users",
      "$0uVxYYAZgT"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const assignableUsers = computed(
      () => {
        var _a2, _b2;
        return ((_b2 = (_a2 = allUsersData.value) == null ? void 0 : _a2.users) != null ? _b2 : []).filter(
          (u) => {
            var _a3;
            return u.status === "active" && !["admin", "superadmin"].includes(((_a3 = u.role) != null ? _a3 : "").toLowerCase());
          }
        );
      }
    );
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
      { id: "delivery", icon: "\u{1F4E6}", label: "Delivery" },
      { id: "appearance", icon: "\u{1F3A8}", label: "Appearance" },
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
    const { data: branchData, refresh: refreshBranches } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/branches",
      "$RdEy5bIz9L"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const branches = computed(
      () => {
        var _a2, _b2;
        return ((_b2 = (_a2 = branchData.value) == null ? void 0 : _a2.branches) != null ? _b2 : []).map((b) => {
          var _a3, _b3, _c2, _d2, _e2, _f2;
          return {
            id: b.id,
            name: b.name,
            code: (_a3 = b.code) != null ? _a3 : "",
            address: (_b3 = b.address) != null ? _b3 : "\u2014",
            phone: (_c2 = b.phone) != null ? _c2 : "",
            status: (_d2 = b.status) != null ? _d2 : "active",
            branch_type: (_e2 = b.branch_type) != null ? _e2 : "sales_region",
            source_branch_id: (_f2 = b.source_branch_id) != null ? _f2 : null
          };
        });
      }
    );
    const factoryBranches = computed(
      () => branches.value.filter((b) => b.branch_type === "factory" && b.id !== branchForm.id)
    );
    function branchTypeIcon(t) {
      return t === "factory" ? "\u{1F3ED}" : t === "office" ? "\u{1F3E2}" : "\u{1F4CD}";
    }
    function branchTypeLabel(t) {
      return t === "factory" ? "Factory" : t === "office" ? "Office" : "Sales Region";
    }
    function branchName(id) {
      var _a2, _b2;
      return (_b2 = (_a2 = branches.value.find((b) => b.id === id)) == null ? void 0 : _a2.name) != null ? _b2 : "?";
    }
    const branchModalOpen = ref(false);
    const savingBranch = ref(false);
    const branchForm = reactive({
      id: 0,
      name: "",
      code: "",
      address: "",
      phone: "",
      status: "active",
      branch_type: "sales_region",
      source_branch_id: null
    });
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
    const notifSettings = reactive({ telegramToken: "", adminChatId: "", tokenMasked: "" });
    const telegramCategories = ref([]);
    const savingTelegram = ref(false);
    const { data: tgData } = ([__temp, __restore] = withAsyncContext(() => useFetch(
      "/api/settings/telegram",
      {
        // non-admin roles get 403 — swallow silently, the tab is admin-only anyway
        ignoreResponseError: true
      },
      "$LQd9RXcTGn"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    watch(tgData, (d) => {
      var _a2, _b2, _c2;
      if (!d) return;
      notifSettings.adminChatId = (_a2 = d.chat_id) != null ? _a2 : "";
      notifSettings.tokenMasked = (_b2 = d.token_masked) != null ? _b2 : "";
      telegramCategories.value = (_c2 = d.categories) != null ? _c2 : [];
    }, { immediate: true });
    const security = reactive({ sessionTimeout: 120, maxLoginAttempts: 5 });
    const securityOptions = reactive([
      { key: "force_2fa", label: "Require 2FA for Admin roles", description: "Superadmin and admin must use two-factor auth", value: false },
      { key: "ip_whitelist", label: "IP Whitelist (office only)", description: "Restrict login to known office IPs", value: false },
      { key: "audit_all", label: "Log all page views", description: "Include read actions in audit trail", value: false }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b2;
      const _component_UiPageHeader = _sfc_main$1;
      const _component_UiStatusBadge = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))} data-v-8475d242>`);
      _push(ssrRenderComponent(_component_UiPageHeader, {
        title: "System Settings",
        subtitle: "Configure ERP preferences, branches, and integrations",
        breadcrumb: ["Admin", "Settings"]
      }, null, _parent));
      _push(`<div class="flex gap-6 flex-col lg:flex-row" data-v-8475d242><div class="lg:w-52 shrink-0" data-v-8475d242><div class="glass-card p-2 space-y-0.5" data-v-8475d242><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(`<button class="${ssrRenderClass([
          "w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
          unref(activeTab) !== tab.id && "text-gray-400 hover:text-gray-200 hover:bg-white/[0.05]"
        ])}" style="${ssrRenderStyle(unref(activeTab) === tab.id ? "background:rgb(var(--accent)/0.10);color:var(--accent-from);border:1px solid rgb(var(--accent)/0.20)" : "")}" data-v-8475d242><span class="text-base" data-v-8475d242>${ssrInterpolate(tab.icon)}</span> ${ssrInterpolate(tab.label)}</button>`);
      });
      _push(`<!--]--></div></div><div class="flex-1 space-y-5" data-v-8475d242>`);
      if (unref(activeTab) === "company") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-5" data-v-8475d242><h3 class="section-title" data-v-8475d242>Company Information</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-8475d242><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Company Name</label><input${ssrRenderAttr("value", unref(company).name)} type="text" class="input-glass" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Trade Name</label><input${ssrRenderAttr("value", unref(company).tradeName)} type="text" class="input-glass" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Registration No.</label><input${ssrRenderAttr("value", unref(company).regNo)} type="text" class="input-glass font-mono" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>TIN / BIN</label><input${ssrRenderAttr("value", unref(company).tin)} type="text" class="input-glass font-mono" data-v-8475d242></div><div class="space-y-1.5 sm:col-span-2" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Registered Address</label><textarea rows="2" class="input-glass resize-none" data-v-8475d242>${ssrInterpolate(unref(company).address)}</textarea></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Phone</label><input${ssrRenderAttr("value", unref(company).phone)} type="text" class="input-glass" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Email</label><input${ssrRenderAttr("value", unref(company).email)} type="email" class="input-glass" data-v-8475d242></div></div><div class="flex justify-end" data-v-8475d242><button class="btn-gold text-xs" data-v-8475d242>Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "branches") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-4" data-v-8475d242><div class="flex items-center justify-between" data-v-8475d242><div data-v-8475d242><h3 class="section-title" data-v-8475d242>Branches</h3><p class="text-xs text-gray-600 mt-0.5" data-v-8475d242>Factories produce; sales regions get factory price + their freight charges (set in Pricing Engine).</p></div><button class="btn-gold text-xs" data-v-8475d242>+ Add Branch</button></div><div class="space-y-3" data-v-8475d242><!--[-->`);
        ssrRenderList(unref(branches), (b) => {
          _push(`<div class="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] gap-3 flex-wrap" data-v-8475d242><div class="flex items-center gap-3 min-w-0" data-v-8475d242><span class="text-lg shrink-0" data-v-8475d242>${ssrInterpolate(branchTypeIcon(b.branch_type))}</span><div class="min-w-0" data-v-8475d242><p class="text-sm font-semibold text-gray-200" data-v-8475d242>${ssrInterpolate(b.name)} `);
          if (b.code) {
            _push(`<span class="text-[10px] font-mono text-gray-600 ml-1" data-v-8475d242>${ssrInterpolate(b.code)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p><p class="text-xs text-gray-500 mt-0.5 truncate" data-v-8475d242>${ssrInterpolate(branchTypeLabel(b.branch_type))} `);
          if (b.branch_type === "sales_region" && b.source_branch_id) {
            _push(`<span class="text-sky-500/80" data-v-8475d242> \xB7 via ${ssrInterpolate(branchName(b.source_branch_id))}</span>`);
          } else if (b.branch_type === "sales_region") {
            _push(`<span class="text-amber-500/90" data-v-8475d242> \xB7 \u26A0 no source factory</span>`);
          } else {
            _push(`<!---->`);
          }
          if (b.address && b.address !== "\u2014") {
            _push(`<span data-v-8475d242> \xB7 ${ssrInterpolate(b.address)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p></div></div><div class="flex items-center gap-3 shrink-0" data-v-8475d242>`);
          _push(ssrRenderComponent(_component_UiStatusBadge, {
            status: b.status
          }, null, _parent));
          _push(`<button class="text-xs text-gray-500 hover:text-gold-400 transition-colors" data-v-8475d242>Edit</button></div></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "finance") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-5" data-v-8475d242><h3 class="section-title" data-v-8475d242>Fiscal Settings</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-8475d242><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Fiscal Year Start</label><select class="input-glass" data-v-8475d242><option value="01" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "01") : ssrLooseEqual(unref(finance).fyStart, "01")) ? " selected" : ""}>January</option><option value="04" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "04") : ssrLooseEqual(unref(finance).fyStart, "04")) ? " selected" : ""}>April</option><option value="07" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(finance).fyStart) ? ssrLooseContain(unref(finance).fyStart, "07") : ssrLooseEqual(unref(finance).fyStart, "07")) ? " selected" : ""}>July (Bangladesh FY)</option></select></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Base Currency</label><select class="input-glass" data-v-8475d242><option value="BDT" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(finance).currency) ? ssrLooseContain(unref(finance).currency, "BDT") : ssrLooseEqual(unref(finance).currency, "BDT")) ? " selected" : ""}>BDT \u2014 Bangladeshi Taka (\u09F3)</option></select></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Default Credit Limit (\u09F3)</label><input${ssrRenderAttr("value", unref(finance).defaultCreditLimit)} type="number" class="input-glass font-mono" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Default Payment Terms (days)</label><input${ssrRenderAttr("value", unref(finance).defaultPaymentTerms)} type="number" class="input-glass font-mono" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>VAT Rate (%)</label><input${ssrRenderAttr("value", unref(finance).vatRate)} type="number" step="0.5" class="input-glass font-mono" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Late Payment Penalty (%)</label><input${ssrRenderAttr("value", unref(finance).lateRate)} type="number" step="0.5" class="input-glass font-mono" data-v-8475d242></div></div><div class="flex justify-end" data-v-8475d242><button class="btn-gold text-xs" data-v-8475d242>Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "orders") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-5" data-v-8475d242><h3 class="section-title" data-v-8475d242>Dispatch &amp; Credit Policy</h3><div class="flex items-start justify-between gap-4 py-3 border-b border-white/[0.04]" data-v-8475d242><div class="flex-1" data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>Dispatch Hold Policy</p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242> When ON, every order is held from reaching <span class="text-gray-300 font-mono text-[11px]" data-v-8475d242>goods on board</span> until Accounts or Admin explicitly grants clearance on Payment Watch \u2014 regardless of any payment condition. When OFF, orders dispatch freely unless a specific hold/condition was set. </p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0" data-v-8475d242><input${ssrIncludeBooleanAttr(Array.isArray(unref(creditWorkflow).dispatch_global_hold) ? ssrLooseContain(unref(creditWorkflow).dispatch_global_hold, null) : unref(creditWorkflow).dispatch_global_hold) ? " checked" : ""} type="checkbox" class="sr-only peer" data-v-8475d242><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" data-v-8475d242></div></label></div><div class="flex items-start justify-between gap-4 py-3 border-b border-white/[0.04]" data-v-8475d242><div class="flex-1" data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>Payment Approval Policy</p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242> When ON, <strong data-v-8475d242>every</strong> payment recorded by a non-admin queues for a checker&#39;s approval on Approval Requests \u2014 regardless of the maker&#39;s personal transaction limit. When OFF, only payments over the maker&#39;s limit (or from makers with no limit configured) queue. </p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0" data-v-8475d242><input${ssrIncludeBooleanAttr(Array.isArray(unref(creditWorkflow).payment_require_approval) ? ssrLooseContain(unref(creditWorkflow).payment_require_approval, null) : unref(creditWorkflow).payment_require_approval) ? " checked" : ""} type="checkbox" class="sr-only peer" data-v-8475d242><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" data-v-8475d242></div></label></div><div class="flex items-start justify-between gap-4 py-3 border-b border-white/[0.04]" data-v-8475d242><div class="flex-1" data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>Auto-release over-limit orders once paid within limit</p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242> When ON, approving an order that breaches the customer&#39;s credit limit force-sets a dispatch hold that auto-clears the instant their ledger balance (incl. this invoice) comes back within limit \u2014 no manual re-check needed. Who can approve the breach itself is unchanged. </p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0" data-v-8475d242><input${ssrIncludeBooleanAttr(Array.isArray(unref(creditWorkflow).credit_limit_auto_release) ? ssrLooseContain(unref(creditWorkflow).credit_limit_auto_release, null) : unref(creditWorkflow).credit_limit_auto_release) ? " checked" : ""} type="checkbox" class="sr-only peer" data-v-8475d242><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" data-v-8475d242></div></label></div><div class="flex justify-end" data-v-8475d242><button${ssrIncludeBooleanAttr(unref(creditWorkflowSaving)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50" data-v-8475d242>${ssrInterpolate(unref(creditWorkflowSaving) ? "Saving\u2026" : "Save Dispatch & Credit Policy")}</button></div></div><div class="glass-card p-6 space-y-5" data-v-8475d242><h3 class="section-title" data-v-8475d242>Order Settings</h3><div class="space-y-4" data-v-8475d242><!--[-->`);
        ssrRenderList(unref(orderOptions), (opt) => {
          _push(`<div class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0" data-v-8475d242><div data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>${ssrInterpolate(opt.label)}</p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242>${ssrInterpolate(opt.description)}</p></div><label class="relative inline-flex items-center cursor-pointer" data-v-8475d242><input${ssrIncludeBooleanAttr(Array.isArray(opt.value) ? ssrLooseContain(opt.value, null) : opt.value) ? " checked" : ""} type="checkbox" class="sr-only peer" data-v-8475d242><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" data-v-8475d242></div></label></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end" data-v-8475d242><button class="btn-gold text-xs" data-v-8475d242>Save Changes</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "documents") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-6" data-v-8475d242><h3 class="section-title" data-v-8475d242>Document Terms &amp; Conditions</h3><p class="text-xs text-gray-500" data-v-8475d242>Customize the T&amp;C text printed on vouchers. Enter one clause per line \u2014 each line becomes a bullet point on the document.</p><div class="space-y-2" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Purchase Order T&amp;C</label><p class="text-[11px] text-gray-600" data-v-8475d242>Printed in the Terms &amp; Conditions box of every PO receipt.</p><textarea rows="7" class="input-glass resize-y font-mono text-xs leading-relaxed" placeholder="One clause per line\u2026" data-v-8475d242>${ssrInterpolate(unref(docSettings).tc_purchase_order)}</textarea></div><div class="space-y-2" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Credit Sales Invoice T&amp;C</label><p class="text-[11px] text-gray-600" data-v-8475d242>Printed in the Notes &amp; Terms section of every credit sales invoice.</p><textarea rows="7" class="input-glass resize-y font-mono text-xs leading-relaxed" placeholder="One clause per line\u2026" data-v-8475d242>${ssrInterpolate(unref(docSettings).tc_credit_invoice)}</textarea></div><div class="flex items-start justify-between gap-4 py-3 border-t border-white/[0.06]" data-v-8475d242><div class="flex-1" data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>Show Customer Outstanding on Invoice</p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242> When ON, the printed invoice&#39;s Bill-To block shows the customer&#39;s credit limit and outstanding balance. Turn OFF to keep account standing off paper handed to drivers/customers. </p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0" data-v-8475d242><input${ssrIncludeBooleanAttr(Array.isArray(unref(docShowOutstanding)) ? ssrLooseContain(unref(docShowOutstanding), null) : unref(docShowOutstanding)) ? " checked" : ""} type="checkbox" class="sr-only peer" data-v-8475d242><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" data-v-8475d242></div></label></div><div class="flex items-center justify-between pt-2" data-v-8475d242><button class="btn-ghost text-xs" data-v-8475d242>Reset to Defaults</button><button${ssrIncludeBooleanAttr(unref(docSaving)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" data-v-8475d242>`);
        if (unref(docSaving)) {
          _push(`<svg class="w-3.5 h-3.5 animate-spin inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-8475d242><circle cx="12" cy="12" r="10" stroke-opacity=".25" data-v-8475d242></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" data-v-8475d242></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(docSaving) ? "Saving\u2026" : "Save Document Settings")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "appearance") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-6" data-v-8475d242><div data-v-8475d242><h3 class="section-title" data-v-8475d242>Appearance &amp; Theme</h3><p class="text-xs text-gray-500 mt-1" data-v-8475d242>Personalise the look of your workspace \u2014 background, accent colour, and presets.</p></div><div class="space-y-3" data-v-8475d242><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500" data-v-8475d242>Background</p><div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5" data-v-8475d242><!--[-->`);
        ssrRenderList(unref(themeStore).BASE_THEMES, (base) => {
          _push(`<button style="${ssrRenderStyle([unref(themeStore).baseId.value === base.id ? "border-color:var(--accent-from);box-shadow:0 0 0 3px rgb(var(--accent)/0.18)" : "border-color:transparent", { "height": "76px" }])}" class="${ssrRenderClass([unref(themeStore).baseId.value !== base.id && "hover:border-white/20", "relative rounded-xl overflow-hidden border-2 transition-all duration-200 text-left"])}" data-v-8475d242><div class="absolute inset-0" style="${ssrRenderStyle(`background: linear-gradient(135deg, ${base.preview[0]} 0%, ${base.bgTo} 100%)`)}" data-v-8475d242></div><div class="absolute top-0 left-0 bottom-0 w-[28%]" style="${ssrRenderStyle(`background: linear-gradient(180deg, ${base.sidebarFrom} 0%, ${base.sidebarTo} 100%); opacity: 0.9`)}" data-v-8475d242></div><div class="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-9 rounded-lg opacity-80" style="${ssrRenderStyle(`background: ${base.dark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.80)"}; border: 1px solid ${base.dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"}`)}" data-v-8475d242></div><div class="absolute bottom-2 right-3 text-right" data-v-8475d242><p class="text-[11px] font-semibold leading-tight" style="${ssrRenderStyle(`color: ${base.dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)"}`)}" data-v-8475d242>${ssrInterpolate(base.emoji)} ${ssrInterpolate(base.name)}</p></div>`);
          if (unref(themeStore).baseId.value === base.id) {
            _push(`<div class="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style="${ssrRenderStyle({ "background": "var(--accent-from)" })}" data-v-8475d242><svg class="w-3 h-3 text-black" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" data-v-8475d242><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-8475d242></path></svg></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--></div></div><div class="space-y-3" data-v-8475d242><p class="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500" data-v-8475d242>Accent Color</p><div class="flex flex-wrap gap-2" data-v-8475d242><!--[-->`);
        ssrRenderList(unref(themeStore).ACCENTS, (accent) => {
          _push(`<button${ssrRenderAttr("title", accent.name)} style="${ssrRenderStyle(`background: linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`)}" class="${ssrRenderClass([unref(themeStore).accentId.value === accent.id ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105", "relative w-9 h-9 rounded-full transition-all duration-200"])}" data-v-8475d242>`);
          if (unref(themeStore).accentId.value === accent.id) {
            _push(`<span class="absolute inset-0 flex items-center justify-center" data-v-8475d242><svg class="w-4 h-4" style="${ssrRenderStyle(`color:${accent.btnText}`)}" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" data-v-8475d242><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-8475d242></path></svg></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</button>`);
        });
        _push(`<!--]--><div class="relative" data-v-8475d242><label${ssrRenderAttr("title", `Custom: ${unref(appCustomHex)}`)} class="${ssrRenderClass([unref(themeStore).accentId.value === "custom" ? "ring-2 ring-offset-2 ring-offset-transparent ring-white/60 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105", "relative w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-all"])}" style="${ssrRenderStyle(`background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red)`)}" data-v-8475d242>`);
        if (unref(themeStore).accentId.value !== "custom") {
          _push(`<svg class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" data-v-8475d242><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.657-6.343l-.707.707M7.05 16.95l-.707.707m12.02 0l-.707-.707M7.05 7.05l-.707-.707" data-v-8475d242></path><circle cx="12" cy="12" r="3" data-v-8475d242></circle></svg>`);
        } else {
          _push(`<svg class="w-4 h-4 text-white drop-shadow" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" data-v-8475d242><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" data-v-8475d242></path></svg>`);
        }
        _push(`<input type="color"${ssrRenderAttr("value", unref(appCustomHex))} class="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full" data-v-8475d242></label></div></div><div class="flex items-center gap-2 text-xs text-gray-500 mt-1" data-v-8475d242><div class="w-4 h-4 rounded-full shrink-0" style="${ssrRenderStyle({ "background": "linear-gradient(135deg, var(--accent-from) 0%, var(--accent-to) 100%)" })}" data-v-8475d242></div><span data-v-8475d242>${ssrInterpolate(unref(themeStore).accentId.value === "custom" ? `Custom ${unref(appCustomHex)}` : (_b2 = (_a2 = unref(themeStore).currentAccent.value) == null ? void 0 : _a2.name) != null ? _b2 : "Custom")}</span></div></div><div class="rounded-xl p-4 space-y-3" style="${ssrRenderStyle({ "background": "rgb(var(--tint)/0.04)", "border": "1px solid rgb(var(--tint)/0.08)" })}" data-v-8475d242><p class="text-[10px] text-gray-600 uppercase tracking-wider font-semibold" data-v-8475d242>Preview</p><div class="flex gap-2 items-center flex-wrap" data-v-8475d242><button class="btn-gold text-xs px-3 py-1.5" data-v-8475d242>Primary Action</button><button class="btn-ghost text-xs px-3 py-1.5" data-v-8475d242>Secondary</button><span class="nav-item nav-item-active text-xs px-2.5 py-1" data-v-8475d242>Active item</span></div><div class="flex gap-2 items-center" data-v-8475d242><div class="h-1.5 flex-1 rounded-full overflow-hidden" style="${ssrRenderStyle({ "background": "rgb(var(--tint)/0.08)" })}" data-v-8475d242><div class="h-full w-[65%] rounded-full" style="${ssrRenderStyle({ "background": "linear-gradient(90deg,var(--accent-from),var(--accent-to))" })}" data-v-8475d242></div></div><span class="text-[10px] text-gray-500" data-v-8475d242>65%</span></div></div><div class="flex justify-between items-center pt-2" data-v-8475d242><button class="btn-ghost text-xs" data-v-8475d242>\u21BA Reset to default</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "notifications") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-4" data-v-8475d242><h3 class="section-title" data-v-8475d242>Notification Channels</h3><div class="space-y-4" data-v-8475d242><!--[-->`);
        ssrRenderList(unref(notifChannels), (ch) => {
          _push(`<div class="flex items-start justify-between py-3 border-b border-white/[0.04] last:border-0" data-v-8475d242><div class="flex-1 mr-4" data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>${ssrInterpolate(ch.label)}</p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242>${ssrInterpolate(ch.description)}</p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5" data-v-8475d242><input${ssrIncludeBooleanAttr(Array.isArray(ch.enabled) ? ssrLooseContain(ch.enabled, null) : ch.enabled) ? " checked" : ""} type="checkbox" class="sr-only peer" data-v-8475d242><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" data-v-8475d242></div></label></div>`);
        });
        _push(`<!--]--></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Telegram Bot Token</label><input${ssrRenderAttr("value", unref(notifSettings).telegramToken)} type="password" class="input-glass font-mono"${ssrRenderAttr("placeholder", unref(notifSettings).tokenMasked || "123456:ABC-xxxx\u2026")} data-v-8475d242>`);
        if (unref(notifSettings).tokenMasked) {
          _push(`<p class="text-[11px] text-gray-600" data-v-8475d242> Saved: ${ssrInterpolate(unref(notifSettings).tokenMasked)} \u2014 leave blank to keep it </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Group / Admin Chat ID</label><input${ssrRenderAttr("value", unref(notifSettings).adminChatId)} type="text" class="input-glass font-mono" placeholder="-100xxxxx" data-v-8475d242></div><div class="space-y-2 pt-2 border-t border-white/[0.06]" data-v-8475d242><p class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Category Routing (optional)</p><p class="text-[11px] text-gray-600 leading-snug" data-v-8475d242> Route each event category to its own Telegram group. Leave a category blank to send it to the general group above. </p><div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2" data-v-8475d242><!--[-->`);
        ssrRenderList(unref(telegramCategories), (cat) => {
          _push(`<div class="flex items-center gap-2" data-v-8475d242><span class="text-[11px] text-gray-500 w-36 shrink-0 capitalize" data-v-8475d242>${ssrInterpolate(cat.key.replace(/_/g, " "))}</span><input${ssrRenderAttr("value", cat.chat_id)} type="text" class="input-glass font-mono text-xs py-1.5 flex-1" placeholder="general group" data-v-8475d242></div>`);
        });
        _push(`<!--]--></div></div><div class="flex justify-end gap-3" data-v-8475d242><button${ssrIncludeBooleanAttr(unref(savingTelegram)) ? " disabled" : ""} class="btn-ghost text-xs disabled:opacity-50" data-v-8475d242> Save &amp; Send Test </button><button${ssrIncludeBooleanAttr(unref(savingTelegram)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50" data-v-8475d242>${ssrInterpolate(unref(savingTelegram) ? "Saving\u2026" : "Save Changes")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "security") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-5" data-v-8475d242><h3 class="section-title" data-v-8475d242>Security &amp; Access</h3><div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-v-8475d242><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Session Timeout (minutes)</label><input${ssrRenderAttr("value", unref(security).sessionTimeout)} type="number" min="5" class="input-glass font-mono" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Max Login Attempts</label><input${ssrRenderAttr("value", unref(security).maxLoginAttempts)} type="number" min="3" class="input-glass font-mono" data-v-8475d242></div></div><div class="space-y-4" data-v-8475d242><!--[-->`);
        ssrRenderList(unref(securityOptions), (opt) => {
          _push(`<div class="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0" data-v-8475d242><div data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>${ssrInterpolate(opt.label)}</p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242>${ssrInterpolate(opt.description)}</p></div><label class="relative inline-flex items-center cursor-pointer" data-v-8475d242><input${ssrIncludeBooleanAttr(Array.isArray(opt.value) ? ssrLooseContain(opt.value, null) : opt.value) ? " checked" : ""} type="checkbox" class="sr-only peer" data-v-8475d242><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" data-v-8475d242></div></label></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end" data-v-8475d242><button class="btn-gold text-xs" data-v-8475d242>Save Changes</button></div></div><div class="glass-card p-6 space-y-4 border border-red-500/20" data-v-8475d242><h3 class="text-sm font-semibold text-red-400" data-v-8475d242>Danger Zone</h3><div class="flex items-center justify-between py-3" data-v-8475d242><div data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>Clear All Cache</p><p class="text-xs text-gray-500" data-v-8475d242>Flush system cache and session data</p></div><button class="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors" data-v-8475d242>Clear Cache</button></div><div class="flex items-center justify-between py-3 border-t border-white/[0.04]" data-v-8475d242><div data-v-8475d242><p class="text-sm font-medium text-gray-200" data-v-8475d242>Export All Data</p><p class="text-xs text-gray-500" data-v-8475d242>Download full database backup as SQL</p></div><button class="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-white/[0.05] transition-colors" data-v-8475d242>Export</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "delivery") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-5" data-v-8475d242><div data-v-8475d242><h3 class="section-title" data-v-8475d242>QR Delivery Verification</h3><p class="text-xs text-gray-500 mt-1" data-v-8475d242> Each credit sales invoice gets a unique QR code and 6-digit PIN. When scanned, the dispatcher or driver can confirm dispatch / delivery without logging into the ERP. </p></div><div class="flex items-start justify-between gap-4 py-4 border-t border-white/[0.06]" data-v-8475d242><div class="flex-1" data-v-8475d242><p class="text-sm font-semibold text-gray-200" data-v-8475d242>Require Dispatch PIN <span class="text-[10px] font-normal text-emerald-400 ml-1.5" data-v-8475d242>Active</span></p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242> Dispatcher must scan the invoice QR and enter the 6-digit PIN to mark an order as <span class="text-gray-300 font-mono text-[11px]" data-v-8475d242>goods on board</span> \u2014 this posts the invoice to the ledger. PIN is printed on the invoice footer and never expires. </p><p class="text-xs text-gray-600 mt-1" data-v-8475d242>Status transition: <span class="text-purple-400 font-mono text-[11px]" data-v-8475d242>ready_to_ship \u2192 goods_on_board</span></p></div><label class="relative inline-flex items-center cursor-pointer mt-0.5 shrink-0" data-v-8475d242><input${ssrIncludeBooleanAttr(Array.isArray(unref(deliverySettings).require_dispatch_pin) ? ssrLooseContain(unref(deliverySettings).require_dispatch_pin, null) : unref(deliverySettings).require_dispatch_pin) ? " checked" : ""} type="checkbox" class="sr-only peer" data-v-8475d242><div class="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500" data-v-8475d242></div></label></div><div class="py-4 border-t border-white/[0.06]" data-v-8475d242><p class="text-sm font-semibold text-gray-200" data-v-8475d242> Final Delivery Confirmation \u2014 Authorized Staff <span class="text-[10px] font-normal text-emerald-400 ml-1.5" data-v-8475d242>Active</span></p><p class="text-xs text-gray-500 mt-0.5" data-v-8475d242> Drivers do not confirm deliveries. When a <span class="text-gray-300 font-mono text-[11px]" data-v-8475d242>goods on board</span> order&#39;s QR is scanned by a logged-in authorized user, they get a one-tap &quot;Confirm Final Delivery&quot; button that records the full delivery, posts the customer ledger entry and marks the order <span class="text-gray-300 font-mono text-[11px]" data-v-8475d242>delivered</span>. </p><p class="text-xs text-gray-600 mt-1.5 mb-3" data-v-8475d242> Admins and superadmins are always authorized. Assign additional users below (e.g. the dispatch manager): </p><div class="rounded-xl bg-white/[0.03] border border-white/[0.07] divide-y divide-white/[0.05] max-h-64 overflow-y-auto" data-v-8475d242><!--[-->`);
        ssrRenderList(unref(assignableUsers), (u) => {
          _push(`<label class="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/[0.03]" data-v-8475d242><div class="min-w-0" data-v-8475d242><p class="text-xs font-medium text-gray-200 truncate" data-v-8475d242>${ssrInterpolate(u.display_name)}</p><p class="text-[10px] text-gray-500 truncate" data-v-8475d242>${ssrInterpolate(u.email)} \xB7 ${ssrInterpolate(u.role)}</p></div><input type="checkbox" class="accent-amber-500 shrink-0"${ssrIncludeBooleanAttr(unref(deliverySettings).delivery_confirm_user_ids.includes(u.id)) ? " checked" : ""} data-v-8475d242></label>`);
        });
        _push(`<!--]-->`);
        if (!unref(assignableUsers).length) {
          _push(`<p class="px-4 py-3 text-xs text-gray-500" data-v-8475d242>No other active users found.</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="rounded-xl p-4 bg-white/[0.03] border border-white/[0.07] space-y-2" data-v-8475d242><p class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>How it works</p><ol class="text-xs text-gray-500 space-y-1.5 list-decimal list-inside" data-v-8475d242><li data-v-8475d242>Invoice is printed with a QR code and 6-digit PIN in the footer.</li><li data-v-8475d242>When order is <span class="text-gray-300 font-mono" data-v-8475d242>ready_to_ship</span>, dispatcher scans the QR with any phone camera.</li><li data-v-8475d242>Public page opens \u2014 no login needed. Dispatcher enters the PIN.</li><li data-v-8475d242>Status updates to <span class="text-gray-300 font-mono" data-v-8475d242>goods_on_board</span> automatically \u2014 the invoice posts to the ledger.</li><li data-v-8475d242>At handover, an authorized staff member (logged into the ERP on their phone) scans the same QR and taps <span class="text-gray-300" data-v-8475d242>Confirm Final Delivery</span>.</li><li data-v-8475d242>Full delivery is recorded \u2014 ledger, journal entry and balances \u2014 and status becomes <span class="text-gray-300 font-mono" data-v-8475d242>delivered</span>.</li><li data-v-8475d242>QR is rescanable \u2014 scanning again shows current status and audit trail.</li></ol></div>`);
        if (unref(deliverySaveMsg)) {
          _push(`<div class="${ssrRenderClass([unref(deliverySaveMsg).startsWith("\u2713") ? "text-emerald-400" : "text-red-400", "text-xs"])}" data-v-8475d242>${ssrInterpolate(unref(deliverySaveMsg))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end" data-v-8475d242><button${ssrIncludeBooleanAttr(unref(deliverySaving)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" data-v-8475d242>${ssrInterpolate(unref(deliverySaving) ? "Saving\u2026" : "Save Delivery Settings")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "maintenance") {
        _push(`<div class="space-y-5" data-v-8475d242><div class="glass-card p-6 space-y-4" data-v-8475d242><h3 class="section-title" data-v-8475d242>Data Migrations</h3><p class="text-xs text-gray-500" data-v-8475d242>One-time tasks to backfill historical data into new accounting tables. Safe to run multiple times \u2014 already-linked records are skipped automatically.</p><div class="border border-white/[0.06] rounded-xl p-5 space-y-4" data-v-8475d242><div data-v-8475d242><p class="text-sm font-semibold text-gray-200" data-v-8475d242>Backfill Expense Journal Entries</p><p class="text-xs text-gray-500 mt-1" data-v-8475d242> Creates <strong class="text-gray-300" data-v-8475d242>journal_entries</strong> and <strong class="text-gray-300" data-v-8475d242>transaction_lines</strong> for every approved / cancelled-after-approval expense voucher that currently has no GL entry. Cancelled expenses also get a matching reversal entry. </p></div>`);
        if (unref(seedReport)) {
          _push(`<div class="rounded-xl p-4 text-xs space-y-1" style="${ssrRenderStyle(unref(seedReport).errors.length ? "background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.2)" : "background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.2)")}" data-v-8475d242><p class="${ssrRenderClass(unref(seedReport).errors.length ? "text-red-300 font-semibold" : "text-emerald-300 font-semibold")}" data-v-8475d242>${ssrInterpolate(unref(seedSummary))}</p><p class="text-gray-400" data-v-8475d242>\u2705 Created: ${ssrInterpolate(unref(seedReport).created)} \xA0\xB7\xA0 \u23ED Skipped: ${ssrInterpolate(unref(seedReport).skipped)} \xA0\xB7\xA0 \u274C Errors: ${ssrInterpolate(unref(seedReport).errors.length)}</p>`);
          if (unref(seedReport).errors.length) {
            _push(`<div class="mt-2 space-y-1" data-v-8475d242><p class="text-red-400 font-semibold" data-v-8475d242>Errors (missing GL account config):</p><!--[-->`);
            ssrRenderList(unref(seedReport).errors, (e) => {
              _push(`<div class="text-red-300 font-mono" data-v-8475d242>${ssrInterpolate(e.voucher)}: ${ssrInterpolate(e.reason)}</div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button${ssrIncludeBooleanAttr(unref(seeding)) ? " disabled" : ""} class="btn-gold text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100" data-v-8475d242>`);
        if (unref(seeding)) {
          _push(`<svg class="w-3.5 h-3.5 animate-spin inline mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" data-v-8475d242><circle cx="12" cy="12" r="10" stroke-opacity=".25" data-v-8475d242></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" data-v-8475d242></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(seeding) ? "Running backfill\u2026" : "\u25B6 Run Backfill Now")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(branchModalOpen)) {
          _push2(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-v-8475d242><div class="w-full max-w-md rounded-2xl bg-[#161616] border border-white/[0.08] p-6 space-y-4" data-v-8475d242><div class="flex items-center justify-between" data-v-8475d242><h3 class="text-lg font-bold text-gray-100" data-v-8475d242>${ssrInterpolate(unref(branchForm).id ? "Edit Branch" : "New Branch")}</h3><button class="text-gray-500 hover:text-gray-200" data-v-8475d242>\u2715</button></div><div class="grid grid-cols-2 gap-4" data-v-8475d242><div class="col-span-2 space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Branch Name *</label><input${ssrRenderAttr("value", unref(branchForm).name)} type="text" class="input-glass" placeholder="e.g. Sylhet Branch" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Code</label><input${ssrRenderAttr("value", unref(branchForm).code)} type="text" class="input-glass font-mono uppercase" placeholder="e.g. SYL" data-v-8475d242></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Status</label><select class="input-glass" data-v-8475d242><option value="active" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(branchForm).status) ? ssrLooseContain(unref(branchForm).status, "active") : ssrLooseEqual(unref(branchForm).status, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(branchForm).status) ? ssrLooseContain(unref(branchForm).status, "inactive") : ssrLooseEqual(unref(branchForm).status, "inactive")) ? " selected" : ""}>Inactive</option></select></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Type *</label><select class="input-glass" data-v-8475d242><option value="factory" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(branchForm).branch_type) ? ssrLooseContain(unref(branchForm).branch_type, "factory") : ssrLooseEqual(unref(branchForm).branch_type, "factory")) ? " selected" : ""}>\u{1F3ED} Factory</option><option value="sales_region" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(branchForm).branch_type) ? ssrLooseContain(unref(branchForm).branch_type, "sales_region") : ssrLooseEqual(unref(branchForm).branch_type, "sales_region")) ? " selected" : ""}>\u{1F4CD} Sales Region</option><option value="office" data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(branchForm).branch_type) ? ssrLooseContain(unref(branchForm).branch_type, "office") : ssrLooseEqual(unref(branchForm).branch_type, "office")) ? " selected" : ""}>\u{1F3E2} Office</option></select></div><div class="space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Source Factory</label><select${ssrIncludeBooleanAttr(unref(branchForm).branch_type !== "sales_region") ? " disabled" : ""} class="input-glass disabled:opacity-40" data-v-8475d242><option${ssrRenderAttr("value", null)} data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(branchForm).source_branch_id) ? ssrLooseContain(unref(branchForm).source_branch_id, null) : ssrLooseEqual(unref(branchForm).source_branch_id, null)) ? " selected" : ""}>\u2014 None \u2014</option><!--[-->`);
          ssrRenderList(unref(factoryBranches), (f) => {
            _push2(`<option${ssrRenderAttr("value", f.id)} data-v-8475d242${ssrIncludeBooleanAttr(Array.isArray(unref(branchForm).source_branch_id) ? ssrLooseContain(unref(branchForm).source_branch_id, f.id) : ssrLooseEqual(unref(branchForm).source_branch_id, f.id)) ? " selected" : ""}>${ssrInterpolate(f.name)}</option>`);
          });
          _push2(`<!--]--></select></div><div class="col-span-2 space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Address</label><input${ssrRenderAttr("value", unref(branchForm).address)} type="text" class="input-glass" placeholder="District, area\u2026" data-v-8475d242></div><div class="col-span-2 space-y-1.5" data-v-8475d242><label class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-8475d242>Phone</label><input${ssrRenderAttr("value", unref(branchForm).phone)} type="text" class="input-glass font-mono" placeholder="01XXXXXXXXX" data-v-8475d242></div></div>`);
          if (unref(branchForm).branch_type === "sales_region" && !unref(branchForm).source_branch_id) {
            _push2(`<p class="text-[11px] text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2" data-v-8475d242> \u26A0 Without a source factory the pricing engine will skip this region. You can also set it later in the Pricing Engine \u2192 Branch Network. </p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`<div class="flex gap-3 pt-2" data-v-8475d242><button${ssrIncludeBooleanAttr(!unref(branchForm).name.trim() || unref(savingBranch)) ? " disabled" : ""} class="btn-gold text-xs flex-1 disabled:opacity-50" data-v-8475d242>${ssrInterpolate(unref(savingBranch) ? "Saving\u2026" : unref(branchForm).id ? "Save Changes" : "Create Branch")}</button><button class="btn-ghost text-xs" data-v-8475d242>Cancel</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const settings = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-8475d242"]]);

export { settings as default };
//# sourceMappingURL=settings-6Z397MT6.mjs.map
