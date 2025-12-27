import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Printer } from 'lucide-react';
import { exportToXlsx, exportToPdf } from '@/utils/export';
import { useTranslation } from "react-i18next";
import { format } from "@/lib/utils";
import { useRoute } from 'wouter';

// Shared types (kept minimal here)
interface TaxReport {
  period?: string;
  company?: string;
  currency?: string;
  salesTax?: {
    totalSales?: number;
    taxableSales?: number;
    exemptSales?: number;
    collectedTax?: number;
    rates?: Array<{ jurisdiction?: string; rate?: number; taxable?: number; tax?: number }>;
  };
  purchaseTax?: {
    totalPurchases?: number;
    taxablePurchases?: number;
    exemptPurchases?: number;
    paidTax?: number;
    recoverable?: number;
  };
  incomeTax?: {
    grossIncome?: number;
    deductions?: number;
    taxableIncome?: number;
    estimatedTax?: number;
    quarterlyPayments?: Array<{ quarter?: string; dueDate?: string | Date; amount?: number; status?: string }>;
  };
  payrollTax?: {
    grossWages?: number;
    federalWithholding?: number;
    stateWithholding?: number;
    socialSecurity?: number;
    medicare?: number;
    employerContributions?: number;
    totalPayrollTax?: number;
  };
}

export default function TaxTypeReportPage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const [, params] = useRoute('/reports/tax/:type');
  const type = (params?.type || '').toLowerCase();

  // Date range state (defaults align with current quarter/year UX)
  const now = new Date();
  const y = now.getFullYear();
  const [period, setPeriod] = useState<'month'|'quarter'|'year'|'custom'>('quarter');
  const [startDate, setStartDate] = useState<string>(new Date(y, 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(y, 11, 31).toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState<string>('');
  const [filterCurrency, setFilterCurrency] = useState<string>('');
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

  // Recompute start/end when period changes (except custom)
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

  const { data } = useQuery<TaxReport>({
  queryKey: ['/api/reports/tax', startDate, endDate, customerId, filterCurrency, warehouseId, jurisdiction],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (customerId) params.set('customerId', customerId);
  if (filterCurrency) params.set('currency', filterCurrency);
      if (warehouseId) params.set('warehouseId', warehouseId);
      if (jurisdiction) params.set('jurisdiction', jurisdiction);
      const res = await apiRequest('GET', `/api/reports/tax?${params.toString()}`);
      return res.json();
    },
  });

  const report: TaxReport = data ?? {};

  const n = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const currency = report.currency || 'USD';
  const money = (amt: number) => new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(amt || 0);
  const toDate = (v: any) => {
    if (!v) return new Date();
    if (v instanceof Date) return isNaN(v.getTime()) ? new Date() : v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const title =
    type === 'vat' || type === 'sales' || type === 'gst'
      ? t('navigation.vatReport')
      : type === 'corporate'
      ? t('navigation.corporateTaxReport')
      : type === 'withholding'
      ? t('navigation.withholdingTaxReport')
      : t('reports.tax.title');

  const handleExport = async (fmt: 'pdf' | 'excel') => {
    const dateSuffix = `${startDate}_to_${endDate}`;
    if (type === 'vat' || type === 'sales' || type === 'gst') {
      const headers = ['Jurisdiction', 'Rate', 'Taxable', 'Tax'];
      const rows = (report.salesTax?.rates || []).map(r => [
        r.jurisdiction || '',
        (r.rate ?? 0) + '%',
        n(r.taxable),
        n(r.tax),
      ]);
      rows.push(['', 'Net VAT', '', n(n(report.salesTax?.collectedTax) - n(report.purchaseTax?.recoverable))]);
      if (fmt === 'excel') {
        await exportToXlsx(`vat-report-${dateSuffix}.xlsx`, headers, rows, 'VAT');
      } else {
        await exportToPdf(`vat-report-${dateSuffix}.pdf`, headers, rows, {
          title: t('navigation.vatReport'),
          subtitle: `${report.company || ''} • ${report.period || ''}`,
          orientation: 'p',
        });
      }
    } else if (type === 'corporate') {
      const headers = ['Metric', 'Amount'];
      const rows: (string|number)[][] = [
        ['Gross Income', n(report.incomeTax?.grossIncome)],
        ['Deductions', n(report.incomeTax?.deductions)],
        ['Taxable Income', n(report.incomeTax?.taxableIncome)],
        ['Estimated Tax', n(report.incomeTax?.estimatedTax)],
      ];
      if (fmt === 'excel') {
        await exportToXlsx(`corporate-tax-${dateSuffix}.xlsx`, headers, rows, 'Corporate Tax');
      } else {
        await exportToPdf(`corporate-tax-${dateSuffix}.pdf`, headers, rows, {
          title: t('navigation.corporateTaxReport'),
          subtitle: `${report.company || ''} • ${report.period || ''}`,
        });
      }
    } else if (type === 'withholding') {
      const headers = ['Description', 'Amount'];
      const p = report.payrollTax || {};
      const rows: (string|number)[][] = [
        ['Gross Wages', n(p.grossWages)],
        ['Federal Withholding', n(p.federalWithholding)],
        ['State Withholding', n(p.stateWithholding)],
        ['Social Security', n(p.socialSecurity)],
        ['Medicare', n(p.medicare)],
        ['Employer Contributions', n(p.employerContributions)],
        ['Total Payroll Tax', n(p.totalPayrollTax)],
      ];
      if (fmt === 'excel') {
        await exportToXlsx(`withholding-tax-${dateSuffix}.xlsx`, headers, rows, 'Withholding');
      } else {
        await exportToPdf(`withholding-tax-${dateSuffix}.pdf`, headers, rows, {
          title: t('navigation.withholdingTaxReport'),
          subtitle: `${report.company || ''} • ${report.period || ''}`,
        });
      }
    }
  };

  // Renderers per type
  const renderVAT = () => {
    const collected = n(report.salesTax?.collectedTax);
    const recoverable = n(report.purchaseTax?.recoverable);
    const net = collected - recoverable; // VAT payable

    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('taxTypes.salesTax')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-xl sm:text-2xl">{money(collected)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('reports.tax.collected')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('tax.inputTax')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-xl sm:text-2xl">{money(recoverable)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('tax.recoverable')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('tax.netTax')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-bold text-orange-600 text-xl sm:text-2xl">{money(net)}</div>
              <div className="text-xs text-muted-foreground mt-1">{t('tax.payable')}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('tax.ratesBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[450px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tax.jurisdiction')}</TableHead>
                    <TableHead className="text-end">{t('tax.rate')}</TableHead>
                    <TableHead className="text-end">{t('tax.taxableAmount')}</TableHead>
                    <TableHead className="text-end">{t('common.tax')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report.salesTax?.rates || []).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell data-label={t('tax.jurisdiction')}>{r.jurisdiction}</TableCell>
                      <TableCell className="text-end" data-label={t('tax.rate')}>{r.rate}%</TableCell>
                      <TableCell className="text-end" data-label={t('tax.taxableAmount')}>{money(n(r.taxable))}</TableCell>
                      <TableCell className="text-end" data-label={t('common.tax')}>{money(n(r.tax))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCorporate = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('tax.grossIncome')}</CardTitle></CardHeader>
            <CardContent><div className="font-bold text-xl sm:text-2xl">{money(n(report.incomeTax?.grossIncome))}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('tax.deductions')}</CardTitle></CardHeader>
            <CardContent><div className="font-bold text-xl sm:text-2xl">{money(n(report.incomeTax?.deductions))}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('tax.taxableIncome')}</CardTitle></CardHeader>
            <CardContent><div className="font-bold text-xl sm:text-2xl">{money(n(report.incomeTax?.taxableIncome))}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{t('tax.estimatedTax')}</CardTitle></CardHeader>
            <CardContent><div className="font-bold text-orange-600 text-xl sm:text-2xl">{money(n(report.incomeTax?.estimatedTax))}</div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>{t('tax.quarterlyPayments')}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[450px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tax.quarter')}</TableHead>
                    <TableHead>{t('common.dueDate')}</TableHead>
                    <TableHead className="text-end">{t('common.amount')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report.incomeTax?.quarterlyPayments || []).map((q, i) => (
                    <TableRow key={i}>
                      <TableCell data-label={t('tax.quarter')}>{q.quarter}</TableCell>
                      <TableCell data-label={t('common.dueDate')}>{format(toDate(q.dueDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-end" data-label={t('common.amount')}>{money(n(q.amount))}</TableCell>
                      <TableCell data-label={t('common.status')}>{q.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWithholding = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>{t('tax.payrollTaxSummary')}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[450px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead className="text-end">{t('common.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell data-label={t('common.description')}>{t('tax.grossWages')}</TableCell><TableCell className="text-end" data-label={t('common.amount')}>{money(n(report.payrollTax?.grossWages))}</TableCell></TableRow>
                  <TableRow><TableCell data-label={t('common.description')}>{t('tax.federalWithholding')}</TableCell><TableCell className="text-end" data-label={t('common.amount')}>{money(n(report.payrollTax?.federalWithholding))}</TableCell></TableRow>
                  <TableRow><TableCell data-label={t('common.description')}>{t('tax.stateWithholding')}</TableCell><TableCell className="text-end" data-label={t('common.amount')}>{money(n(report.payrollTax?.stateWithholding))}</TableCell></TableRow>
                  <TableRow><TableCell data-label={t('common.description')}>{t('tax.socialSecurity')}</TableCell><TableCell className="text-end" data-label={t('common.amount')}>{money(n(report.payrollTax?.socialSecurity))}</TableCell></TableRow>
                  <TableRow><TableCell data-label={t('common.description')}>{t('tax.medicare')}</TableCell><TableCell className="text-end" data-label={t('common.amount')}>{money(n(report.payrollTax?.medicare))}</TableCell></TableRow>
                  <TableRow><TableCell data-label={t('common.description')}>{t('tax.employerContributions')}</TableCell><TableCell className="text-end" data-label={t('common.amount')}>{money(n(report.payrollTax?.employerContributions))}</TableCell></TableRow>
                  <TableRow className="font-semibold"><TableCell data-label={t('common.description')}>{t('tax.totalPayrollTax')}</TableCell><TableCell className="text-end text-orange-600" data-label={t('common.amount')}>{money(n(report.payrollTax?.totalPayrollTax))}</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1">
            {report.period || ''}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full sm:w-auto h-9 rounded-md border px-3 bg-muted text-foreground border-border"
              aria-label={t('reports.customer')}
            >
              <option value="">{t('common.all')}</option>
              {(contacts || []).filter((c: any) => (c.type === 'customer' || c.type === 'both')).map((c: any) => (
                <option key={c.id} value={c.id}>{c.display_name || c.name}</option>
              ))}
            </select>
            <Input placeholder={t('common.currency') || 'Currency'} value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value.toUpperCase())} className="h-9 w-28" />
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full sm:w-auto h-9 rounded-md border px-3 bg-muted text-foreground border-border"
              aria-label={t('reports.warehouse')}
            >
              <option value="">{t('common.all')}</option>
              {(warehouses || []).map((w: any) => (
                <option key={w.id} value={w.id}>{w.name || w.code}</option>
              ))}
            </select>
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className="w-full sm:w-auto h-9 rounded-md border px-3 bg-muted text-foreground border-border"
              aria-label={t('reports.jurisdiction')}
            >
              <option value="">{t('common.none')}</option>
              <option value="sa">SA</option>
              <option value="eu">EU</option>
            </select>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full sm:w-auto h-9 rounded-md border px-3 bg-muted text-foreground border-border"
            aria-label={t('reports.period')}
          >
            <option value="month">{t('reports.thisMonth')}</option>
            <option value="quarter">{t('reports.thisQuarter')}</option>
            <option value="year">{t('reports.thisYear')}</option>
            <option value="custom">{t('reports.customRange')}</option>
          </select>
          {period === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" />
              <span className="text-muted-foreground">{t('common.to') || 'to'}</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9" />
            </div>
          )}
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 me-2" />{t('reports.export')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 me-2" />{t('reports.exportPDF')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}>
            <Printer className="h-4 w-4 me-2" />{t('reports.print')}
          </Button>
        </div>
      </div>

      {type === 'vat' || type === 'sales' || type === 'gst' ? renderVAT() : null}
      {type === 'corporate' ? renderCorporate() : null}
      {type === 'withholding' ? renderWithholding() : null}

      {/* Fallback if unknown type */}
      {!(type === 'vat' || type === 'sales' || type === 'gst' || type === 'corporate' || type === 'withholding') && (
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground">{t('common.notFound')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
