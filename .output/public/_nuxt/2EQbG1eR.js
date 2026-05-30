function d(){function e(i,r="Ujjal FMC ERP"){const o=document.getElementById(i);if(!o)return;const t=window.open("","_blank","width=900,height=700");t&&(Array.from(document.styleSheets).map(p=>{try{return Array.from(p.cssRules).map(a=>a.cssText).join(`
`)}catch{return""}}).join(`
`),t.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${r}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fff; color: #111; padding: 24px; font-size: 13px; }
    .print-header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #f59e0b; margin-bottom: 20px; }
    .print-logo { width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; color: #000; }
    .print-company { margin-left: 12px; }
    .print-company h1 { font-size: 18px; font-weight: 700; color: #111; }
    .print-company p { font-size: 11px; color: #666; margin-top: 2px; }
    .print-doc-info { text-align: right; }
    .print-doc-info .doc-no { font-size: 16px; font-weight: 700; color: #111; }
    .print-doc-info p { font-size: 11px; color: #666; margin-top: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .info-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; font-weight: 600; margin-bottom: 6px; }
    .info-box p { font-size: 13px; color: #111; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #f8f5ee; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #666; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
    td { padding: 10px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #111; }
    tr:last-child td { border-bottom: none; }
    .totals { margin-left: auto; width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
    .totals-row.grand { border-top: 2px solid #f59e0b; margin-top: 8px; padding-top: 10px; font-weight: 700; font-size: 15px; color: #b45309; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
    .badge-gold { background: #fef3c7; color: #b45309; border: 1px solid #fcd34d; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #888; }
    .signature-area { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 40px; }
    .signature-box { text-align: center; }
    .signature-line { border-top: 1px solid #888; padding-top: 6px; font-size: 11px; color: #888; margin-top: 40px; }
    @media print {
      body { padding: 0; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
${o.innerHTML}
<script>window.onload = () => { window.print(); window.close(); }<\/script>
</body>
</html>`),t.document.close())}function n(){window.print()}return{printElement:e,printPage:n}}export{d as u};
