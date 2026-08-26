import { q as defineEventHandler, X as getUserSession, m as createError, at as readBody, aq as query } from '../../nitro/nitro.mjs';
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

const ADMIN_ROLES = ["admin", "superadmin"];
const VALID_TYPES = ["factory", "sales_region", "office"];
const branches_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const session = await getUserSession(event);
  const role = ((_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.role) != null ? _b : "").toLowerCase();
  if (!ADMIN_ROLES.includes(role))
    throw createError({ statusCode: 403, statusMessage: "Admin only" });
  const body = await readBody(event);
  const name = String((_c = body == null ? void 0 : body.name) != null ? _c : "").trim();
  if (!name) throw createError({ statusCode: 400, statusMessage: "Branch name is required" });
  const branchType = VALID_TYPES.includes(body == null ? void 0 : body.branch_type) ? body.branch_type : "sales_region";
  const sourceId = branchType === "sales_region" && (body == null ? void 0 : body.source_branch_id) ? Number(body.source_branch_id) : null;
  if (sourceId) {
    const factory = await query(
      `SELECT id FROM branches WHERE id = ? AND branch_type = 'factory'`,
      [sourceId]
    );
    if (!factory.length)
      throw createError({ statusCode: 400, statusMessage: "Source branch must be a factory" });
  }
  const result = await query(
    `INSERT INTO branches (name, code, address, phone_number, status, branch_type, source_branch_id, is_factory)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      String((_d = body == null ? void 0 : body.code) != null ? _d : "").trim().toUpperCase().slice(0, 50) || null,
      String((_e = body == null ? void 0 : body.address) != null ? _e : "").trim() || null,
      String((_f = body == null ? void 0 : body.phone) != null ? _f : "").trim().slice(0, 20) || null,
      (body == null ? void 0 : body.status) === "inactive" ? "inactive" : "active",
      branchType,
      sourceId,
      branchType === "factory" ? 1 : 0
    ]
  );
  return { ok: true, id: result.insertId, message: `Branch "${name}" created` };
});

export { branches_post as default };
//# sourceMappingURL=branches.post.mjs.map
