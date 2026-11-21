import { J as defineEventHandler, w as buildOrderReport } from '../../../nitro/nitro.mjs';
import '@anthropic-ai/sdk';
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

const dispatchReport_get = defineEventHandler((event) => buildOrderReport(event, "dispatch"));

export { dispatchReport_get as default };
//# sourceMappingURL=dispatch-report.get.mjs.map
