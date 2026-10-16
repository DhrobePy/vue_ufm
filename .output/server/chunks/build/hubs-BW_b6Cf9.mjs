const HUBS = {
  bank: [
    { label: "Dashboard", to: "/bank", exact: true, also: ["/bank/transaction", "/bank/transfer"] },
    { label: "Statement", to: "/bank/statement" },
    { label: "Reconciliation", to: "/bank/reconciliation" },
    { label: "Bank Accounts", to: "/bank/accounts" }
  ],
  accounts: [
    { label: "Overview", to: "/accounts", exact: true, also: ["/accounts/transfer"] },
    { label: "Chart of Accounts", to: "/accounts/coa" },
    { label: "Journal", to: "/accounts/journal" },
    { label: "Debit Vouchers", to: "/accounts/voucher" }
  ],
  statements: [
    { label: "GL Statement", to: "/accounts/statement" },
    { label: "Tax Statement", to: "/accounts/tax-statement" }
  ],
  close: [
    { label: "Daily Log", to: "/accounts/daily-log" },
    { label: "Day-End Reconciliation", to: "/accounts/day-end-reconciliation" }
  ]
};
function hubTabActive(tab, path) {
  var _a;
  if (path === tab.to) return true;
  if (!tab.exact && path.startsWith(tab.to + "/")) return true;
  return ((_a = tab.also) != null ? _a : []).some((p) => path === p || path.startsWith(p + "/"));
}
const hubOwnsPath = (hub, path) => {
  var _a;
  return ((_a = HUBS[hub]) != null ? _a : []).some((t) => hubTabActive(t, path));
};

export { HUBS as H, hubTabActive as a, hubOwnsPath as h };
//# sourceMappingURL=hubs-BW_b6Cf9.mjs.map
