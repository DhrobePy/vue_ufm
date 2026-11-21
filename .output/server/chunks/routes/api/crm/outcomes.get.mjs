import { Z as defineEventHandler, b0 as outcomes, bU as scopedHealth } from '../../../nitro/nitro.mjs';
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

const outcomes_get = defineEventHandler(async (event) => outcomes(await scopedHealth(event)));

export { outcomes_get as default };
//# sourceMappingURL=outcomes.get.mjs.map
