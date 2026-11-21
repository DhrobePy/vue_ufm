import { Z as defineEventHandler, aa as forecast, bS as scopedHealth } from '../../../nitro/nitro.mjs';
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

const forecast_get = defineEventHandler(async (event) => forecast(await scopedHealth(event)));

export { forecast_get as default };
//# sourceMappingURL=forecast.get.mjs.map
