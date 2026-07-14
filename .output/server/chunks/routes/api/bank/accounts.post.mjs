import { n as defineEventHandler, a9 as readBody, j as createError, u as getDb } from '../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const accounts_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    bank_name,
    account_name,
    account_number,
    branch_name,
    account_type,
    opening_balance
  } = body != null ? body : {};
  if (!bank_name || !account_number) {
    throw createError({ statusCode: 400, statusMessage: "bank_name and account_number are required" });
  }
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO bank_tx_accounts
         (bank_name, account_name, account_number, branch_name, account_type, opening_balance, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        bank_name,
        account_name || bank_name,
        account_number,
        branch_name || null,
        account_type || "Current",
        Number(opening_balance || 0)
      ]
    );
    await conn.commit();
    return { ok: true, id: result.insertId };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { accounts_post as default };
//# sourceMappingURL=accounts.post.mjs.map
