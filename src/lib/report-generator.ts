export const generateReportHtml = (title: string, columns: { header: string; dataKey: string }[], data: any[]): string => {
    const tableHeaders = columns.map(col => `<th style="padding: 12px;">${col.header}</th>`).join('');
    
    const tableRows = data.map(item => {
        const cells = columns.map(col => {
            let cellData = item[col.dataKey] ?? '';
            // If the column is 'items' and it's an array, format it as a sub-table
            if (col.dataKey === 'items' && Array.isArray(cellData)) {
                const itemRows = cellData.map(orderItem => `
                    <tr>
                        <td style="padding: 4px 8px; border-bottom: 1px solid #f3f4f6;">${orderItem.quantity}x ${orderItem.name}</td>
                        <td style="padding: 4px 8px; border-bottom: 1px solid #f3f4f6; text-align: left;">${(orderItem.price).toFixed(2)} ر.س</td>
                    </tr>
                `).join('');

                return `
                    <td style="padding: 8px;">
                        <table style="width: 100%; font-size: 0.8rem; background-color: #fafafa; border-radius: 4px;">
                            <thead>
                                <tr style="background-color: #e5e7eb;">
                                    <th style="padding: 6px 8px; text-align: right;">المنتج</th>
                                    <th style="padding: 6px 8px; text-align: left;">السعر</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemRows}
                            </tbody>
                        </table>
                    </td>
                `;
            }
            return `<td style="padding: 12px; vertical-align: top;">${cellData}</td>`;
        }).join('');
        return `<tr style="border-bottom: 1px solid #e5e7eb;">${cells}</tr>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
              body {
                  font-family: 'Tajawal', sans-serif;
                  background-color: #f3f4f6;
                  margin: 0;
                  padding: 2rem;
              }
              .report-container {
                  max-width: 1000px;
                  margin: auto;
                  background-color: white;
                  padding: 3rem;
                  border-radius: 8px;
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
              }
              header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  padding-bottom: 2rem;
                  border-bottom: 1px solid #e5e7eb;
              }
              header h1 {
                font-family: 'Playfair Display', serif;
                font-size: 2.25rem;
                font-weight: bold;
                color: #16a085;
              }
              .company-info svg {
                  height: 31px;
                  width: 114px;
              }
              .company-info p {
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0.5rem 0 0 0;
              }
              section {
                  margin: 2rem 0;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  text-align: right;
              }
              th, td {
                  padding: 0.75rem;
                  font-size: 0.875rem;
              }
              thead {
                  background-color: #16a085;
                  color: white;
              }
              tbody tr:nth-child(even) {
                  background-color: #f9fafb;
              }
              footer {
                  text-align: center;
                  font-size: 0.75rem;
                  color: #9ca3af;
                  margin-top: 3rem;
                  padding-top: 1rem;
                  border-top: 1px solid #e5e7eb;
              }
          </style>
      </head>
      <body>
          <div class="report-container">
              <header>
                  <div class="company-info">
                      <svg width="114" height="31" viewBox="0 0 114 31" fill="#111827" xmlns="http://www.w3.org/2000/svg" aria-label="NUOMI Logo">
                          <text x="0" y="24" font-family="Playfair Display, serif" font-size="30" font-weight="bold" letter-spacing="2">NUOMI</text>
                      </svg>
                      <p>شركة تصميم وديكور داخلي فاخر</p>
                  </div>
                  <h1>${title}</h1>
              </header>
              <section>
                  <h3>بيانات التقرير</h3>
                   <table>
                      <thead>
                          <tr>${tableHeaders}</tr>
                      </thead>
                      <tbody>
                          ${tableRows}
                      </tbody>
                  </table>
              </section>
              <footer>
                  &copy; ${new Date().getFullYear()} NUOMI. جميع الحقوق محفوظة.
              </footer>
          </div>
      </body>
      </html>
    `;
};
