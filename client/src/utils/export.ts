// Lightweight CSV export helper usable across client pages
// Creates a UTF-8 BOM CSV so Excel opens it correctly.
export function exportToCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (val: string | number) => {
    const s = String(val ?? '');
    // Escape double quotes by doubling them
    const needsQuotes = s.includes(',') || s.includes('\n') || s.includes('"');
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');
  // Add BOM for Excel
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Excel (XLSX) export helper using a dynamic import to keep initial bundle small.
// Writes a single worksheet with provided headers and rows.
export async function exportToXlsx(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
  sheetName = 'Sheet1'
) {
  // Dynamic import to avoid heavy upfront bundle cost
  const XLSX = await import('xlsx');

  const aoa: Array<Array<string | number>> = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// PDF export helper using jsPDF and autoTable. Dynamically imported to keep bundle size small.
// Renders a simple title, optional subtitle, then a table with the provided headers/rows.
export async function exportToPdf(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number>>,
  options?: {
    title?: string;
    subtitle?: string;
    orientation?: 'p' | 'l';
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: string | number[];
  }
) {
  const [{ default: jsPDF }, autoTable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable').then(m => (m as any).default ? (m as any).default : m),
  ]);

  const doc = new jsPDF({
    orientation: options?.orientation || 'p',
    unit: options?.unit || 'pt',
    format: options?.format || 'a4',
  });

  const marginLeft = 40;
  let cursorY = 40;

  if (options?.title) {
    doc.setFontSize(16);
    doc.text(String(options.title), marginLeft, cursorY);
    cursorY += 18;
  }
  if (options?.subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(String(options.subtitle), marginLeft, cursorY);
    cursorY += 16;
    doc.setTextColor(0);
  }

  (autoTable as any)(doc, {
    head: [headers],
    body: rows.map(r => r.map(v => (typeof v === 'number' && isFinite(v) ? v : String(v ?? '')))),
    startY: cursorY,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [33, 37, 41] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: marginLeft, right: 40 },
  });

  const out = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(out);
}
