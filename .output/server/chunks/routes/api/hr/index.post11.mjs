import { q as defineEventHandler, as as readBody, m as createError, ap as query } from '../../../nitro/nitro.mjs';
import 'node:child_process';
import 'node:fs/promises';
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

const index_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    employee_id,
    basic_salary,
    house_allowance,
    transport_allowance,
    medical_allowance,
    other_allowances,
    provident_fund,
    tax_deduction,
    other_deductions
  } = body;
  if (!employee_id) throw createError({ statusCode: 400, statusMessage: "employee_id required" });
  const basicSalary = Number(basic_salary) || 0;
  const houseAllow = Number(house_allowance) || 0;
  const transportAllow = Number(transport_allowance) || 0;
  const medicalAllow = Number(medical_allowance) || 0;
  const otherAllows = Number(other_allowances) || 0;
  const provFund = Number(provident_fund) || 0;
  const taxDed = Number(tax_deduction) || 0;
  const otherDeds = Number(other_deductions) || 0;
  const grossSalary = basicSalary + houseAllow + transportAllow + medicalAllow + otherAllows;
  const netSalary = Math.max(0, grossSalary - provFund - taxDed - otherDeds);
  await query(`
    INSERT INTO hr_salary_structures
      (employee_id, basic_salary, house_allowance, transport_allowance, medical_allowance,
       other_allowances, provident_fund, tax_deduction, other_deductions, gross_salary, net_salary)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      basic_salary        = VALUES(basic_salary),
      house_allowance     = VALUES(house_allowance),
      transport_allowance = VALUES(transport_allowance),
      medical_allowance   = VALUES(medical_allowance),
      other_allowances    = VALUES(other_allowances),
      provident_fund      = VALUES(provident_fund),
      tax_deduction       = VALUES(tax_deduction),
      other_deductions    = VALUES(other_deductions),
      gross_salary        = VALUES(gross_salary),
      net_salary          = VALUES(net_salary)
  `, [
    employee_id,
    basicSalary,
    houseAllow,
    transportAllow,
    medicalAllow,
    otherAllows,
    provFund,
    taxDed,
    otherDeds,
    grossSalary,
    netSalary
  ]);
  await query("UPDATE hr_employees SET base_salary = ? WHERE id = ?", [grossSalary, employee_id]);
  return { ok: true, gross_salary: grossSalary, net_salary: netSalary, message: "Salary structure saved." };
});

export { index_post as default };
//# sourceMappingURL=index.post11.mjs.map
