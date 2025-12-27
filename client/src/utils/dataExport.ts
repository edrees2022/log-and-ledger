/**
 * Data Export Utility
 * Professional multi-format export functionality
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  format?: 'text' | 'currency' | 'number' | 'date' | 'percent';
}

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  currency?: string;
  dateFormat?: string;
  language?: string;
  companyName?: string;
  logo?: string;
}

/**
 * Export data to Excel (XLSX)
 */
export function exportToExcel(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: ExportOptions
): void {
  const { filename, title, companyName } = options;

  // Prepare header row
  const headers = columns.map(col => col.header);
  
  // Prepare data rows
  const rows = data.map(row => 
    columns.map(col => formatCellValue(row[col.key], col.format, options))
  );

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Add title rows if provided
  const sheetData: any[][] = [];
  if (companyName) {
    sheetData.push([companyName]);
    sheetData.push([]);
  }
  if (title) {
    sheetData.push([title]);
    sheetData.push([]);
  }
  
  // Add headers and data
  sheetData.push(headers);
  sheetData.push(...rows);
  
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  
  // Set column widths
  ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  
  // Save file
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data to PDF
 */
export function exportToPDF(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: ExportOptions
): void {
  const { 
    filename, 
    title, 
    subtitle,
    orientation = 'portrait',
    companyName,
    language = 'en'
  } = options;
  
  const isRTL = language === 'ar';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  let yPos = 15;

  // Company name
  if (companyName) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(companyName, isRTL ? doc.internal.pageSize.width - 15 : 15, yPos, {
      align: isRTL ? 'right' : 'left'
    });
    yPos += 10;
  }

  // Title
  if (title) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, isRTL ? doc.internal.pageSize.width - 15 : 15, yPos, {
      align: isRTL ? 'right' : 'left'
    });
    yPos += 7;
  }

  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(subtitle, isRTL ? doc.internal.pageSize.width - 15 : 15, yPos, {
      align: isRTL ? 'right' : 'left'
    });
    doc.setTextColor(0);
    yPos += 10;
  }

  // Prepare table data
  const headers = columns.map(col => col.header);
  const rows = data.map(row => 
    columns.map(col => formatCellValue(row[col.key], col.format, options))
  );

  // Generate table
  autoTable(doc, {
    startY: yPos,
    head: [isRTL ? headers.reverse() : headers],
    body: isRTL ? rows.map(r => r.reverse()) : rows,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: columns.reduce((acc, col, i) => {
      const idx = isRTL ? columns.length - 1 - i : i;
      if (col.format === 'currency' || col.format === 'number') {
        acc[idx] = { halign: 'right' };
      }
      return acc;
    }, {} as Record<number, any>),
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    const footerText = `Page ${i} of ${pageCount} | Generated: ${new Date().toLocaleDateString()}`;
    doc.text(
      footerText, 
      doc.internal.pageSize.width / 2, 
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  // Save file
  doc.save(`${filename}.pdf`);
}

/**
 * Export data to CSV
 */
export function exportToCSV(
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: ExportOptions
): void {
  const { filename } = options;
  
  // BOM for UTF-8
  const BOM = '\uFEFF';
  
  // Headers
  const headers = columns.map(col => `"${col.header}"`).join(',');
  
  // Rows
  const rows = data.map(row => 
    columns.map(col => {
      const value = formatCellValue(row[col.key], col.format, options);
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );
  
  const csvContent = BOM + headers + '\n' + rows.join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Format cell value based on type
 */
function formatCellValue(
  value: any, 
  format?: string, 
  options?: ExportOptions
): string {
  if (value === null || value === undefined) return '';
  
  switch (format) {
    case 'currency':
      const currency = options?.currency || 'USD';
      return new Intl.NumberFormat(options?.language || 'en', {
        style: 'currency',
        currency,
      }).format(Number(value) || 0);
      
    case 'number':
      return new Intl.NumberFormat(options?.language || 'en').format(Number(value) || 0);
      
    case 'percent':
      return `${(Number(value) || 0).toFixed(2)}%`;
      
    case 'date':
      if (!value) return '';
      try {
        return new Date(value).toLocaleDateString(options?.language || 'en');
      } catch {
        return String(value);
      }
      
    default:
      return String(value);
  }
}

/**
 * Quick export with format selection dialog
 */
export type ExportFormat = 'excel' | 'pdf' | 'csv';

export function exportData(
  format: ExportFormat,
  data: Record<string, any>[],
  columns: ExportColumn[],
  options: ExportOptions
): void {
  switch (format) {
    case 'excel':
      exportToExcel(data, columns, options);
      break;
    case 'pdf':
      exportToPDF(data, columns, options);
      break;
    case 'csv':
      exportToCSV(data, columns, options);
      break;
  }
}
