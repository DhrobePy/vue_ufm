import { Z as defineEventHandler, ab as gatewayStatus } from '../../../../nitro/nitro.mjs';
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

const status_get = defineEventHandler(async () => gatewayStatus());

export { status_get as default };
//# sourceMappingURL=status.get.mjs.map
