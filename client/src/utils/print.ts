/**
 * Print Utility
 * Professional print functionality for documents
 */

interface PrintOptions {
  title?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  styles?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

/**
 * Print specific element by ID
 */
export function printElement(elementId: string, options: PrintOptions = {}): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found`);
    return;
  }

  printContent(element.innerHTML, options);
}

/**
 * Print HTML content
 */
export function printContent(content: string, options: PrintOptions = {}): void {
  const {
    title = document.title,
    hideHeader = false,
    hideFooter = false,
    styles = '',
    onBeforePrint,
    onAfterPrint,
  } = options;

  // Create print window
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  // Get all stylesheets from current document
  const styleSheets = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        if (sheet.href) {
          return `<link rel="stylesheet" href="${sheet.href}" />`;
        }
        if (sheet.cssRules) {
          const rules = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
          return `<style>${rules}</style>`;
        }
      } catch (e) {
        // Cross-origin stylesheets will throw
        if (sheet.href) {
          return `<link rel="stylesheet" href="${sheet.href}" />`;
        }
      }
      return '';
    })
    .join('\n');

  // Build print document
  const printDocument = `
    <!DOCTYPE html>
    <html dir="${document.dir}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${styleSheets}
      <style>
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          ${hideHeader ? '@page { margin-top: 0; }' : ''}
          ${hideFooter ? '@page { margin-bottom: 0; }' : ''}
          
          .no-print {
            display: none !important;
          }
          
          .print-break {
            page-break-before: always;
          }
          
          .print-no-break {
            page-break-inside: avoid;
          }
        }
        
        @media screen {
          body {
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
        }
        
        ${styles}
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  printWindow.document.write(printDocument);
  printWindow.document.close();

  // Wait for resources to load
  printWindow.onload = () => {
    onBeforePrint?.();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Close after printing (or after cancel)
      printWindow.onafterprint = () => {
        onAfterPrint?.();
        printWindow.close();
      };
      
      // Fallback close after 1 second if onafterprint doesn't fire
      setTimeout(() => {
        if (!printWindow.closed) {
          onAfterPrint?.();
          // Don't auto-close on mobile, user might still be in print dialog
        }
      }, 1000);
    }, 250);
  };
}

/**
 * Print current page
 */
export function printPage(options: PrintOptions = {}): void {
  options.onBeforePrint?.();
  window.print();
  options.onAfterPrint?.();
}

/**
 * Print table data
 */
export function printTable(
  headers: string[],
  rows: (string | number)[][],
  options: PrintOptions & { tableTitle?: string } = {}
): void {
  const { tableTitle, ...printOptions } = options;

  const tableHtml = `
    ${tableTitle ? `<h1 style="margin-bottom: 20px; font-size: 24px;">${tableTitle}</h1>` : ''}
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f5f5f5;">
          ${headers.map(h => `<th style="padding: 12px 8px; border: 1px solid #ddd; text-align: start;">${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row, i) => `
          <tr style="background: ${i % 2 === 0 ? 'white' : '#fafafa'};">
            ${row.map(cell => `<td style="padding: 10px 8px; border: 1px solid #ddd;">${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top: 20px; font-size: 12px; color: #666;">
      ${new Date().toLocaleString()} | ${rows.length} rows
    </div>
  `;

  printContent(tableHtml, {
    ...printOptions,
    title: tableTitle || printOptions.title,
  });
}
