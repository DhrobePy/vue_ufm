function r(t,o){const e=t.items.map(i=>`
    <tr>
      <td style="padding:2px 0">${i.name}</td>
      <td style="text-align:center;padding:2px 4px">${i.qty}</td>
      <td style="text-align:right;padding:2px 0">৳${(i.price*i.qty).toLocaleString()}</td>
    </tr>`).join(""),n=t.verifyUrl?`
    <div style="display:flex;justify-content:center;margin-top:8px;"><canvas id="exit-qr" width="90" height="90"></canvas></div>
    <p class="c" style="font-size:9px;color:#666;word-break:break-all;">${t.verifyUrl}</p>
    <script src="https://cdn.jsdelivr.net/npm/qrious@4/dist/qrious.min.js"><\/script>
    <script>
      window.addEventListener('load', function() {
        try { new QRious({ element: document.getElementById('exit-qr'), value: ${JSON.stringify(t.verifyUrl)}, size: 90, level: 'M' }); } catch (e) {}
      });
    <\/script>`:"";return`<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Receipt ${t.receiptNo}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:monospace;font-size:12px;width:300px;margin:0 auto;padding:10px}
      h2{text-align:center;font-size:15px;margin-bottom:2px}
      .c{text-align:center}
      hr{border:none;border-top:1px dashed #000;margin:6px 0}
      table{width:100%;border-collapse:collapse}
      th{font-size:10px;padding:2px 0;border-bottom:1px solid #000}
      .total{font-weight:bold;font-size:13px}
    </style>
  </head><body>
    <h2>Ujjal Flour Mills</h2>
    <p class="c" style="font-size:10px">${o}</p>
    <hr/>
    <p class="c">${t.receiptNo}</p>
    <p class="c" style="font-size:10px">${new Date().toLocaleString("en-BD")}</p>
    ${t.customerName?`<p class="c" style="font-size:11px;margin-top:2px">Customer: ${t.customerName}</p>`:""}
    <hr/>
    <table>
      <thead><tr><th style="text-align:left">Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${e}</tbody>
    </table>
    <hr/>
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">৳${t.subtotal.toLocaleString()}</td></tr>
      ${t.discount>0?`<tr><td>Discount</td><td style="text-align:right">-৳${t.discount.toLocaleString()}</td></tr>`:""}
      <tr class="total"><td>TOTAL</td><td style="text-align:right">৳${t.total.toLocaleString()}</td></tr>
      <tr><td style="font-size:10px">Paid now (${t.paymentMethod})</td><td style="text-align:right;font-size:10px">৳${t.cashAmount.toLocaleString()}</td></tr>
      ${t.creditAmount>0?`<tr><td style="font-size:10px">On credit</td><td style="text-align:right;font-size:10px">৳${t.creditAmount.toLocaleString()}</td></tr>`:""}
    </table>
    ${n}
    <hr/>
    <p class="c" style="font-size:10px;margin-top:4px">Thank you!</p>
    <script>window.onload=()=>{setTimeout(()=>window.print(),${t.verifyUrl?300:0})}<\/script>
  </body></html>`}function l(t){for(const o of["Office Copy","Customer Copy","Delivery Copy"]){const e=window.open("","_blank","width=420,height=640");if(!e)return!1;e.document.write(r(t,o)),e.document.close()}return!0}export{l as p};
