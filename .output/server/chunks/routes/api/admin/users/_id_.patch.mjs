import { h as defineEventHandler, v as getRouterParam, e as createError, K as readBody, w as getUserSession, n as getDb, a as auditLog } from '../../../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:crypto';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const id = Number(getRouterParam(event, "id"));
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid user ID" });
  const body = await readBody(event);
  const session = await getUserSession(event);
  const actorId = (_b = (_a = session == null ? void 0 : session.user) == null ? void 0 : _a.id) != null ? _b : 1;
  const actorName = (_f = (_e = (_c = session == null ? void 0 : session.user) == null ? void 0 : _c.name) != null ? _e : (_d = session == null ? void 0 : session.user) == null ? void 0 : _d.email) != null ? _f : "System";
  const actionType = body == null ? void 0 : body.action;
  const db = getDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[old]] = await conn.query(
      `SELECT id, display_name, email, role, status FROM users WHERE id = ?`,
      [id]
    );
    if (!old) throw createError({ statusCode: 404, statusMessage: "User not found" });
    if (actionType === "suspend") {
      if (old.id === actorId)
        throw createError({ statusCode: 400, statusMessage: "Cannot suspend your own account" });
      if (old.status === "suspended")
        throw createError({ statusCode: 400, statusMessage: "User is already suspended" });
      await conn.query(
        `UPDATE users SET status = 'suspended', updated_at = NOW() WHERE id = ?`,
        [id]
      );
      await auditLog(conn, {
        userId: actorId,
        action: "user_suspended",
        module: "admin",
        recordType: "user",
        recordId: id,
        referenceNumber: old.email,
        description: `User "${old.display_name}" (${old.email}) [${old.role}] suspended by ${actorName}`,
        severity: "warning"
      });
      await conn.commit();
      return { ok: true, action: "suspended" };
    }
    if (actionType === "activate") {
      await conn.query(
        `UPDATE users SET status = 'active', updated_at = NOW() WHERE id = ?`,
        [id]
      );
      await auditLog(conn, {
        userId: actorId,
        action: "user_activated",
        module: "admin",
        recordType: "user",
        recordId: id,
        referenceNumber: old.email,
        description: `User "${old.display_name}" (${old.email}) [${old.role}] activated (was: ${old.status}) by ${actorName}`,
        severity: "info"
      });
      await conn.commit();
      return { ok: true, action: "activated" };
    }
    const { display_name, email, role, status, password } = body != null ? body : {};
    if (!display_name || !email || !role)
      throw createError({ statusCode: 400, statusMessage: "display_name, email, and role are required" });
    const setClauses = [
      "display_name = ?",
      "email        = ?",
      "role         = ?",
      "status       = ?"
    ];
    const params = [
      display_name.trim(),
      email.toLowerCase().trim(),
      role,
      status != null ? status : "active"
    ];
    const pwdChanged = !!(password && password.length >= 8);
    if (pwdChanged) {
      setClauses.push("password_hash = ?", "plain_password = ?");
      params.push(password, password);
    }
    params.push(id);
    await conn.query(
      `UPDATE users SET ${setClauses.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );
    const changes = [];
    if (display_name.trim() !== old.display_name) changes.push(`name: "${old.display_name}" \u2192 "${display_name.trim()}"`);
    if (email.toLowerCase().trim() !== old.email) changes.push(`email: ${old.email} \u2192 ${email.toLowerCase().trim()}`);
    if (role !== old.role) changes.push(`role: [${old.role}] \u2192 [${role}]`);
    if ((status != null ? status : "active") !== old.status) changes.push(`status: ${old.status} \u2192 ${status != null ? status : "active"}`);
    if (pwdChanged) changes.push("password changed");
    const roleChanged = role !== old.role;
    const auditAction = pwdChanged ? "user_pwd_changed" : roleChanged ? "user_role_changed" : "user_updated";
    await auditLog(conn, {
      userId: actorId,
      action: auditAction,
      module: "admin",
      recordType: "user",
      recordId: id,
      referenceNumber: old.email,
      description: changes.length ? `User "${old.display_name}" updated by ${actorName}: ${changes.join(" \xB7 ")}` : `User "${old.display_name}" saved (no field changes) by ${actorName}`,
      severity: pwdChanged || roleChanged ? "warning" : "info"
    });
    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
