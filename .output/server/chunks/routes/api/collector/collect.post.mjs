import { Z as defineEventHandler, N as createError } from '../../../nitro/nitro.mjs';
import 'node:crypto';
import 'node:child_process';
import 'node:zlib';
import 'node:stream';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'mysql2/promise';
import 'node:url';

const collect_post = defineEventHandler(() => {
  throw createError({ statusCode: 410, statusMessage: "Use Credit Sales \u2192 Collect Payment to record a collection." });
});

export { collect_post as default };
//# sourceMappingURL=collect.post.mjs.map
