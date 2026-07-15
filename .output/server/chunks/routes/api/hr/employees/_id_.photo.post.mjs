import { o as defineEventHandler, L as getRouterParam, k as createError, ad as readMultipartFormData, a9 as query } from '../../../../nitro/nitro.mjs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'mysql2/promise';
import 'node:url';

const _id__photo_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const id = parseInt((_a = getRouterParam(event, "id")) != null ? _a : "0");
  if (!id) throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  const form = await readMultipartFormData(event);
  if (!form) throw createError({ statusCode: 400, statusMessage: "No form data" });
  const file = form.find((f) => f.name === "photo");
  if (!file || !file.data) throw createError({ statusCode: 400, statusMessage: "No photo file" });
  const mime = (_b = file.type) != null ? _b : "";
  if (!mime.startsWith("image/")) throw createError({ statusCode: 400, statusMessage: "File must be an image" });
  const ext = extname((_c = file.filename) != null ? _c : ".jpg") || ".jpg";
  const filename = `emp-${id}-${Date.now()}${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads", "photos");
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });
  try {
    const [existing] = await query("SELECT photo FROM hr_employees WHERE id = ?", [id]);
    if ((_d = existing == null ? void 0 : existing.photo) == null ? void 0 : _d.startsWith("/uploads/photos/")) {
      const oldPath = join(process.cwd(), "public", existing.photo);
      if (existsSync(oldPath)) await unlink(oldPath);
    }
  } catch {
  }
  await writeFile(join(uploadDir, filename), file.data);
  const photoUrl = `/uploads/photos/${filename}`;
  await query("UPDATE hr_employees SET photo = ? WHERE id = ?", [photoUrl, id]);
  return { ok: true, photo: photoUrl };
});

export { _id__photo_post as default };
//# sourceMappingURL=_id_.photo.post.mjs.map
