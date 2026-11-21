import { Z as defineEventHandler, U as crossSell, bU as scopedHealth } from '../../../nitro/nitro.mjs';
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

const crossSell_get = defineEventHandler(async (event) => {
  const r = await crossSell(await scopedHealth(event));
  return { gaps: r.gaps, suggestions: r.suggestions.slice(0, 120), total: r.suggestions.length };
});

export { crossSell_get as default };
//# sourceMappingURL=cross-sell.get.mjs.map
