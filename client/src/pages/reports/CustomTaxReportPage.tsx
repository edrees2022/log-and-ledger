import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportContainer } from '@/components/layout/ReportContainer';
import { TableContainer, ResponsiveTable } from '@/components/layout/TableContainer';
import { Download, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRoute } from 'wouter';
import { exportToXlsx, exportToPdf } from '@/utils/export';

interface CustomTaxReport {
  period?: string;
  currency?: string;
  tax?: { id: string; code: string; name: string; rate?: string; tax_type?: string };
  sales?: { taxable: number; tax: number; count: number; lines: any[] };
  purchases?: { taxable: number; tax: number; count: number; lines: any[] };
  totals?: { taxable: number; collected: number; paid: number; net: number };
}

export default function CustomTaxReportPage() {
  const { t, i18n } = useTranslation();
  const [, params] = useRoute('/reports/tax/custom/:id');
  const taxId = params?.id || '';

  const [period, setPeriod] = useState<'month'|'quarter'|'year'|'custom'>('quarter');
  const [startDate, setStartDate] = useState<string>(() => {
    const y = new Date().getFullYear();
    return new Date(y, 0, 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const y = new Date().getFullYear();
    return new Date(y, 11, 31).toISOString().split('T')[0];
  });
  const [customerId, setCustomerId] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');
  const [currency, setCurrency] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [jurisdiction, setJurisdiction] = useState<string>('');

  const { data: warehouses } = useQuery({
    queryKey: ['/api/warehouses'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/warehouses');
      return res.json();
    }
  });

  const { data: contacts } = useQuery({
    queryKey: ['/api/contacts'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/contacts');
      return res.json();
    }
  });

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    if (period === 'year') {
      setStartDate(new Date(y, 0, 1).toISOString().split('T')[0]);
      setEndDate(new Date(y, 11, 31).toISOString().split('T')[0]);
    } else if (period === 'quarter') {
      const m = now.getMonth();
      const qStart = Math.floor(m / 3) * 3;
      const qEnd = qStart + 2;
      setStartDate(new Date(y, qStart, 1).toISOString().split('T')[0]);
      setEndDate(new Date(y, qEnd + 1, 0).toISOString().split('T')[0]);
    } else if (period === 'month') {
      setStartDate(new Date(y, now.getMonth(), 1).toISOString().split('T')[0]);
      setEndDate(new Date(y, now.getMonth() + 1, 0).toISOString().split('T')[0]);
    }
  }, [period]);

  const { data } = useQuery<CustomTaxReport>({
    queryKey: ['/api/reports/taxes', taxId, startDate, endDate, customerId, vendorId, currency, warehouseId, jurisdiction],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (customerId) params.set('customerId', customerId);
      if (vendorId) params.set('vendorId', vendorId);
      if (currency) params.set('currency', currency);
      if (warehouseId) params.set('warehouseId', warehouseId);
      if (jurisdiction) params.set('jurisdiction', jurisdiction);
      const res = await apiRequest('GET', `/api/reports/taxes/${taxId}?${params.toString()}`);
      return res.json();
    }
  });

  const report = data || {};
  const money = (n: any) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: report.currency || 'USD' }).format(Number(n || 0));

  const handleExportExcel = async () => {
    const headers = ['Type', 'Number', 'Date', 'Taxable', 'Tax'];
    const rows: (string|number)[][] = [];
    (report.sales?.lines || []).forEach((l: any) => rows.push(['Invoice', l.number || l.id, new Date(l.date || new Date()).toLocaleDateString(i18n.language), l.line_total || 0, l.tax_amount || 0]));
    (report.purchases?.lines || []).forEach((l: any) => rows.push(['Bill', l.number || l.id, new Date(l.date || new Date()).toLocaleDateString(i18n.language), l.line_total || 0, l.tax_amount || 0]));
    await exportToXlsx(`tax-${report.tax?.code || report.tax?.name || taxId}-${startDate}_to_${endDate}.xlsx`, headers, rows, 'Tax Lines');
  };

  const handleExportPdf = async () => {
    const headers = ['Type', 'Number', 'Date', 'Taxable', 'Tax'];
    const rows: (string|number)[][] = [];
    (report.sales?.lines || []).forEach((l: any) => rows.push(['Invoice', l.number || l.id, new Date(l.date || new Date()).toLocaleDateString(i18n.language), l.line_total || 0, l.tax_amount || 0]));
    (report.purchases?.lines || []).forEach((l: any) => rows.push(['Bill', l.number || l.id, new Date(l.date || new Date()).toLocaleDateString(i18n.language), l.line_total || 0, l.tax_amount || 0]));
    await exportToPdf(`tax-${report.tax?.code || report.tax?.name || taxId}-${startDate}_to_${endDate}.pdf`, headers, rows, {
      title: report.tax?.name || 'Custom Tax Report',
      subtitle: `${report.period || ''}`,
      orientation: 'p',
    });
  };

  return (
    <ReportContainer>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{report.tax?.name || t('navigation.customTaxReport')}</h1>
          <p className="text-muted-foreground mt-1">{report.period || ''}</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="h-9 rounded-md border px-3 bg-muted text-foreground border-border">
              <option value="">{t('common.all')}</option>
              {(contacts || []).filter((c: any) => (c.type === 'customer' || c.type === 'both')).map((c: any) => (
                <option key={c.id} value={c.id}>{c.display_name || c.name}</option>
              ))}
            </select>
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} className="h-9 rounded-md border px-3 bg-muted text-foreground border-border">
              <option value="">{t('common.all')}</option>
              {(contacts || []).filter((c: any) => (c.type === 'supplier' || c.type === 'both')).map((c: any) => (
                <option key={c.id} value={c.id}>{c.display_name || c.name}</option>
              ))}
            </select>
            <Input placeholder={t('common.currency') || 'Currency'} value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} className="h-9 w-28" />
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="h-9 rounded-md border px-3 bg-muted text-foreground border-border">
              <option value="">{t('common.all')}</option>
              {(warehouses || []).map((w: any) => (
                <option key={w.id} value={w.id}>{w.name || w.code}</option>
              ))}
            </select>
            <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="h-9 rounded-md border px-3 bg-muted text-foreground border-border">
              <option value="">{t('common.none')}</option>
              <option value="sa">SA</option>
              <option value="eu">EU</option>
            </select>
          </div>
          <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="h-9 rounded-md border px-3 bg-muted text-foreground border-border">
            <option value="month">{t('reports.thisMonth')}</option>
            <option value="quarter">{t('reports.thisQuarter')}</option>
            <option value="year">{t('reports.thisYear')}</option>
            <option value="custom">{t('reports.customRange')}</option>
          </select>
          {period === 'custom' && (
            <div className="flex items-center gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" />
              <span className="text-muted-foreground">{t('common.to') || 'to'}</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9" />
            </div>
          )}
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleExportExcel}><Download className="h-4 w-4 me-2" />{t('reports.export')}</Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleExportPdf}><Download className="h-4 w-4 me-2" />{t('reports.exportPDF')}</Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}><Printer className="h-4 w-4 me-2" />{t('reports.print')}</Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t('tax.salesTax')}</CardTitle></CardHeader><CardContent><div className="font-bold text-2xl">{money(report.sales?.tax)}</div><div className="text-xs text-muted-foreground mt-1">{t('tax.collected')}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t('tax.purchaseTax')}</CardTitle></CardHeader><CardContent><div className="font-bold text-2xl">{money(report.purchases?.tax)}</div><div className="text-xs text-muted-foreground mt-1">{t('common.paid')}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t('tax.netTax')}</CardTitle></CardHeader><CardContent><div className="font-bold text-orange-600 text-2xl">{money(report.totals?.net)}</div><div className="text-xs text-muted-foreground mt-1">{t('tax.payable')}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">{t('tax.taxRate')}</CardTitle></CardHeader><CardContent><div className="font-bold text-2xl">{report.tax?.rate ? `${report.tax.rate}%` : '-'}</div><div className="text-xs text-muted-foreground mt-1">{report.tax?.tax_type}</div></CardContent></Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>{t('invoice.lineItems')}</CardTitle></CardHeader>
        <CardContent>
          <TableContainer>
            <ResponsiveTable className="min-w-[450px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sales.invoices.invoiceNumber')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead className="text-end">{t('tax.taxableAmount')}</TableHead>
                  <TableHead className="text-end">{t('common.tax')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report.sales?.lines || []).map((l: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{l.number || l.id}</TableCell>
                    <TableCell>{new Date(l.date || new Date()).toLocaleDateString(i18n.language)}</TableCell>
                    <TableCell className="text-end">{money(l.line_total)}</TableCell>
                    <TableCell className="text-end">{money(l.tax_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ResponsiveTable>
          </TableContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader><CardTitle>{t('purchases.bills.title')} {t('common.lines')}</CardTitle></CardHeader>
        <CardContent>
          <TableContainer>
            <ResponsiveTable className="min-w-[450px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('purchases.bills.billNumber')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead className="text-end">{t('tax.taxableAmount')}</TableHead>
                  <TableHead className="text-end">{t('common.tax')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report.purchases?.lines || []).map((l: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell>{l.number || l.id}</TableCell>
                    <TableCell>{new Date(l.date || new Date()).toLocaleDateString(i18n.language)}</TableCell>
                    <TableCell className="text-end">{money(l.line_total)}</TableCell>
                    <TableCell className="text-end">{money(l.tax_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ResponsiveTable>
          </TableContainer>
        </CardContent>
      </Card>
    </ReportContainer>
  );
}
