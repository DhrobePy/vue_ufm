function useReportExport() {
  const save = (blob, filename) => {
    const a = (void 0).createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2e3);
  };
  const cell = (c, v) => c.fmt === "money" || c.fmt === "qty" ? Number(v != null ? v : 0) : v != null ? v : "";
  const matrix = (s) => {
    const body = s.rows.map((r) => s.cols.map((c) => cell(c, r[c.key])));
    if (s.totals) body.push(s.cols.map((c, i) => i === 0 ? "TOTAL" : c.sum ? s.rows.reduce((a, r) => {
      var _a;
      return a + Number((_a = r[c.key]) != null ? _a : 0);
    }, 0) : ""));
    return [s.cols.map((c) => c.label), ...body];
  };
  function csv(filename, sheet) {
    const esc = (v) => {
      const t = String(v != null ? v : "");
      return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    save(new Blob(["\uFEFF" + matrix(sheet).map((r) => r.map(esc).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
  }
  async function xlsx(filename, sheets, title) {
    const X = await import('../_/xlsx.mjs').then(function (n) { return n.x; });
    const wb = X.utils.book_new();
    for (const s of sheets) {
      const aoa = [...title ? [[title], []] : [], ...matrix(s)];
      const ws = X.utils.aoa_to_sheet(aoa);
      ws["!cols"] = s.cols.map((c) => ({ wch: Math.max(c.label.length + 2, c.fmt === "text" || !c.fmt ? 22 : 14) }));
      X.utils.book_append_sheet(wb, ws, s.name.replace(/[\\/?*[\]:]/g, " ").slice(0, 31));
    }
    X.writeFile(wb, `${filename}.xlsx`);
  }
  const print = () => (void 0).print();
  return { csv, xlsx, print };
}

export { useReportExport as u };
//# sourceMappingURL=useReportExport-C9Ps5sj9.mjs.map
