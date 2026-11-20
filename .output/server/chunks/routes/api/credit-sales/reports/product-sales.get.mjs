import { x as defineEventHandler, q as buildOrderReport } from '../../../../nitro/nitro.mjs';
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

const productSales_get = defineEventHandler((event) => buildOrderReport(event, "product"));

export { productSales_get as default };
//# sourceMappingURL=product-sales.get.mjs.map
