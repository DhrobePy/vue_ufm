const REVIEW_REASONS = {
  PILOT_ERA: { label: "Pilot period (Vue only)", hint: 'Entered in Vue between 20 Jun and 24 Jul 2026. The legacy system does not have this line; legacy later reset the account with a "Closing Adjustment" and "Opening Adjustment".' },
  NOT_IN_LEGACY: { label: "Not in legacy", hint: "Dated after 24 Jul 2026 and present only in Vue \u2014 legacy no longer has it (usually deleted or reversed there since the last sync)." },
  "DUPLICATE?": { label: "Possible duplicate", hint: "An identical line (same customer, day, type and amount) already exists." },
  INVOICE_ORDER_NOT_SHIPPED: { label: "Invoice, order not shipped", hint: "The order this invoice belongs to is a draft, cancelled or rejected." },
  NO_CUSTOMER: { label: "No customer", hint: "The line is attached to customer 0 / a customer that does not exist, so it counts for nobody." },
  OPENING_RESTORED: { label: "Opening line restored", hint: "The customer record carries an opening due/advance that had no line in the ledger (legacy shows it through the customer record). Added so the ledger adds up." }
};
const reasonLabel = (code) => {
  var _a;
  return code && ((_a = REVIEW_REASONS[code]) == null ? void 0 : _a.label) || code || "";
};

export { REVIEW_REASONS as R, reasonLabel as r };
//# sourceMappingURL=ledgerReview-BfAlWnhR.mjs.map
