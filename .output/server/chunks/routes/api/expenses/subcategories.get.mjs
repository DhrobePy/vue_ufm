import { n as defineEventHandler, C as getQuery, j as createError, a7 as query } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const subcategories_get = defineEventHandler(async (event) => {
  const q = getQuery(event);
  const categoryId = Number(q.category_id);
  if (!categoryId)
    throw createError({ statusCode: 400, statusMessage: "category_id is required" });
  let subcategories = [];
  try {
    subcategories = await query(
      `SELECT id, subcategory_name AS name,
              COALESCE(unit_of_measurement, '') AS unit_of_measurement
       FROM expense_subcategories
       WHERE category_id = ? AND is_active = 1
       ORDER BY subcategory_name`,
      [categoryId]
    );
  } catch {
    subcategories = await query(
      `SELECT id, subcategory_name AS name, '' AS unit_of_measurement
       FROM expense_subcategories
       WHERE category_id = ? AND is_active = 1
       ORDER BY subcategory_name`,
      [categoryId]
    );
  }
  return { subcategories };
});

export { subcategories_get as default };
//# sourceMappingURL=subcategories.get.mjs.map
