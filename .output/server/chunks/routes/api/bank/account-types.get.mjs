import { q as defineEventHandler, ap as query } from '../../../nitro/nitro.mjs';
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

const TYPE_CONFIG = {
  Checking: { name: "Current / Checking", icon: "\u{1F3E6}", color: "#10b981", description: "Primary operational accounts for daily transactions and payments." },
  Savings: { name: "Savings Account", icon: "\u{1F4B0}", color: "#3b82f6", description: "Interest-bearing savings and reserve accounts." },
  Loan: { name: "Loan Account", icon: "\u{1F3DB}", color: "#ef4444", description: "Bank loan and credit facility accounts." },
  Credit: { name: "Credit Account", icon: "\u{1F4B3}", color: "#8b5cf6", description: "Credit line and overdraft accounts." },
  Other: { name: "Other / MFS", icon: "\u{1F4F1}", color: "#f59e0b", description: "bKash, Nagad, Rocket and other mobile financial accounts." }
};
const accountTypes_get = defineEventHandler(async () => {
  const rows = await query(
    `SELECT account_type, COUNT(*) AS cnt
     FROM bank_accounts
     WHERE status != 'closed'
     GROUP BY account_type`
  );
  const countMap = {};
  for (const r of rows) countMap[r.account_type] = Number(r.cnt);
  const types = Object.entries(TYPE_CONFIG).map(([id, cfg]) => {
    var _a;
    return {
      id,
      name: cfg.name,
      icon: cfg.icon,
      color: cfg.color,
      description: cfg.description,
      count: (_a = countMap[id]) != null ? _a : 0,
      status: "active"
    };
  }).filter((t) => t.count > 0 || ["Checking", "Savings"].includes(t.id));
  return { types };
});

export { accountTypes_get as default };
//# sourceMappingURL=account-types.get.mjs.map
