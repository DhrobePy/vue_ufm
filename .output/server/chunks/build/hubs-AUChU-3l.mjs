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
    { label: "Debit Vouchers", to: "/accounts/voucher" },
    { label: "All Accounts", to: "/accounts/all-accounts" }
  ],
  crm: [
    { label: "Today", to: "/crm", exact: true, also: ["/crm/customers"] },
    { label: "Portfolio", to: "/crm/portfolio" },
    { label: "Prospects", to: "/crm/prospects" },
    { label: "Insights", to: "/crm/insights" },
    { label: "Route", to: "/crm/route" },
    { label: "Messages", to: "/crm/messages" },
    { label: "Results", to: "/crm/results" },
    { label: "Ask", to: "/crm/agent" }
  ],
  returns: [
    { label: "Goods Returns", to: "/credit-sales/returns" },
    { label: "Stock Adjustments", to: "/products/stock-adjustments" },
    { label: "Over-Delivery", to: "/credit-sales/over-deliveries" }
  ],
  statements: [
    { label: "GL Statement", to: "/accounts/statement" },
    { label: "Balance Sheet", to: "/accounts/balance-sheet" },
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
//# sourceMappingURL=hubs-AUChU-3l.mjs.map
