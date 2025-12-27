import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReportContainer } from '@/components/layout/ReportContainer';
import { TableContainer, ResponsiveTable } from '@/components/layout/TableContainer';
import {
  FileText, 
  Download, 
  Printer, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calculator,
  Loader2
} from 'lucide-react';
import { exportToXlsx, exportToPdf } from '@/utils/export';
import { useTranslation } from "react-i18next";
import { format } from "@/lib/utils";

type TaxRate = {
  jurisdiction?: string;
  rate?: number;
  taxable?: number;
  tax?: number;
};

type Filing = {
  form?: string;
  period?: string;
  dueDate?: string | Date;
  status?: string;
  amount?: number;
};

type TaxReport = {
  period?: string;
  company?: string;
  currency?: string;
  salesTax?: {
    totalSales?: number;
    taxableSales?: number;
    exemptSales?: number;
    collectedTax?: number;
    rates?: TaxRate[];
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
    quarterlyPayments?: Array<{
      quarter?: string;
      dueDate?: string | Date;
      amount?: number;
      status?: string;
    }>;
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
  filings?: Filing[];
};

export default function TaxPage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const companyCurrency = useCompanyCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState<'month'|'quarter'|'year'|'custom'>('quarter');
  const [selectedTaxType, setSelectedTaxType] = useState('all');

  // Tax filing form name translations
  const taxFormTranslations: Record<string, string> = {
    'Sales Tax Return': 'tax.salesTaxReturn',
    'Corporate Tax Return': 'tax.corporateTaxReturn',
    'VAT Return': 'tax.vatReturn',
    'Withholding Tax Return': 'tax.withholdingTaxReturn',
    'Payroll Tax Return': 'tax.payrollTaxReturn',
  };

  const translateTaxForm = (form: string): string => {
    const key = taxFormTranslations[form];
    if (key) {
      return t(key, { defaultValue: form });
    }
    return form;
  };

  const [startDate, setStartDate] = useState<string>(() => {
    const y = new Date().getFullYear();
    return new Date(y, 0, 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const y = new Date().getFullYear();
    return new Date(y, 11, 31).toISOString().split('T')[0];
  });
  // Advanced filters
  const [customerId, setCustomerId] = useState<string>('all');
  const [vendorId, setVendorId] = useState<string>('all');
  const [currency, setCurrency] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('all');
  const [jurisdiction, setJurisdiction] = useState<string>('none');

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

  // Update date range when period changes (except custom)
  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    if (selectedPeriod === 'year') {
      setStartDate(new Date(y, 0, 1).toISOString().split('T')[0]);
      setEndDate(new Date(y, 11, 31).toISOString().split('T')[0]);
    } else if (selectedPeriod === 'quarter') {
      const m = now.getMonth();
      const qStartMonth = Math.floor(m / 3) * 3;
      const qEndMonth = qStartMonth + 2;
      const s = new Date(y, qStartMonth, 1);
      const e = new Date(y, qEndMonth + 1, 0);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(e.toISOString().split('T')[0]);
    } else if (selectedPeriod === 'month') {
      const s = new Date(y, now.getMonth(), 1);
      const e = new Date(y, now.getMonth() + 1, 0);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(e.toISOString().split('T')[0]);
    }
  }, [selectedPeriod]);

  // Fetch tax data using React Query with proper authentication
  const { 
    data: taxData, 
    isLoading, 
    error 
  } = useQuery<TaxReport>({
    queryKey: ['/api/reports/tax', startDate, endDate, customerId, vendorId, currency, warehouseId, jurisdiction],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
  if (customerId && customerId !== 'all') params.set('customerId', customerId);
  if (vendorId && vendorId !== 'all') params.set('vendorId', vendorId);
        if (currency) params.set('currency', currency);
  if (warehouseId && warehouseId !== 'all') params.set('warehouseId', warehouseId);
  if (jurisdiction && jurisdiction !== 'none') params.set('jurisdiction', jurisdiction);
        const res = await apiRequest('GET', `/api/reports/tax?${params.toString()}`);
        return await res.json();
      } catch (err) {
        console.error('Tax Report API error:', err);
        throw err;
      }
    },
  });

  // Note: we display whatever comes from API or a safe fallback

  // Use API data if available, otherwise show empty state
  const displayData: TaxReport = taxData ?? {
    period: new Date().toISOString().split('T')[0],
    company: '',
    currency: companyCurrency,
    salesTax: { totalSales: 0, taxableSales: 0, exemptSales: 0, collectedTax: 0, rates: [] },
    purchaseTax: { totalPurchases: 0, taxablePurchases: 0, exemptPurchases: 0, paidTax: 0, recoverable: 0 },
    incomeTax: { grossIncome: 0, deductions: 0, taxableIncome: 0, estimatedTax: 0, quarterlyPayments: [] },
    payrollTax: { grossWages: 0, federalWithholding: 0, stateWithholding: 0, socialSecurity: 0, medicare: 0, employerContributions: 0, totalPayrollTax: 0 },
    filings: []
  };

  // Helpers
  const num = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const toSafeDate = (value: any): Date => {
    if (!value) return new Date();
    if (value instanceof Date) return isNaN(value.getTime()) ? new Date() : value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Calculate totals from API data (safe)
  const netSalesTax = num(displayData.salesTax?.collectedTax) - num(displayData.purchaseTax?.recoverable);
  const totalTaxLiability = 
    netSalesTax + 
    num(displayData.incomeTax?.estimatedTax) / 4 + 
    num(displayData.payrollTax?.totalPayrollTax);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: displayData.currency || companyCurrency,
    }).format(amount);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <ReportContainer>
        <div className="page-header">
          <div>
            <h1 className="page-title text-3xl font-bold text-foreground">{t('reports.tax.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.loadingData')}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ms-2 text-muted-foreground">{t('common.loading')}</span>
        </div>
      </ReportContainer>
    );
  }

  // Handle error state
  if (error) {
    return (
      <ReportContainer>
        <div className="page-header">
          <div>
            <h1 className="page-title text-3xl font-bold text-foreground">{t('reports.tax.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.errorLoadingData')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{t('reports.failedToGenerateTryAgain')}: {error.message}</p>
              <Button onClick={() => window.location.reload()} variant="outline" data-testid="button-retry">
                {t('common.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </ReportContainer>
    );
  }

  const handleExport = async (fmt: 'pdf' | 'excel') => {
    const dateSuffix = `${startDate}_to_${endDate}`;
    // Build a compact multi-section export by concatenating sections with blank rows
    const headers = ['Section', 'Key', 'Value'];
    const rows: (string|number)[][] = [];
    const push = (section: string, key: string, value: number | string) => rows.push([section, key, value]);

    // Sales Tax
    push(t('reports.tax.salesTax'), t('reports.tax.totalSales'), num(displayData.salesTax?.totalSales));
    push(t('reports.tax.salesTax'), t('reports.tax.taxableSales'), num(displayData.salesTax?.taxableSales));
    push(t('reports.tax.salesTax'), t('reports.tax.exemptSales'), num(displayData.salesTax?.exemptSales));
    push(t('reports.tax.salesTax'), t('reports.tax.taxCollected'), num(displayData.salesTax?.collectedTax));
    rows.push(['', '', '']);

    // Purchase Tax
    push(t('reports.tax.purchaseTax'), t('reports.tax.totalPurchases'), num(displayData.purchaseTax?.totalPurchases));
    push(t('reports.tax.purchaseTax'), t('reports.tax.taxablePurchases'), num(displayData.purchaseTax?.taxablePurchases));
    push(t('reports.tax.purchaseTax'), t('reports.tax.exemptPurchases'), num(displayData.purchaseTax?.exemptPurchases));
    push(t('reports.tax.purchaseTax'), t('reports.tax.taxPaid'), num(displayData.purchaseTax?.paidTax));
    push(t('reports.tax.purchaseTax'), t('reports.tax.recoverable'), num(displayData.purchaseTax?.recoverable));
    rows.push(['', '', '']);

    // Income Tax
    push(t('reports.tax.incomeTax'), t('reports.tax.grossIncome'), num(displayData.incomeTax?.grossIncome));
    push(t('reports.tax.incomeTax'), t('reports.tax.deductions'), num(displayData.incomeTax?.deductions));
    push(t('reports.tax.incomeTax'), t('reports.tax.taxableIncome'), num(displayData.incomeTax?.taxableIncome));
    push(t('reports.tax.incomeTax'), t('reports.tax.estimatedTax'), num(displayData.incomeTax?.estimatedTax));
    rows.push(['', '', '']);

    // Payroll Tax
    push(t('reports.tax.payrollTax'), t('reports.tax.grossWages'), num(displayData.payrollTax?.grossWages));
    push(t('reports.tax.payrollTax'), t('reports.tax.federalWithholding'), num(displayData.payrollTax?.federalWithholding));
    push(t('reports.tax.payrollTax'), t('reports.tax.stateWithholding'), num(displayData.payrollTax?.stateWithholding));
    push(t('reports.tax.payrollTax'), t('reports.tax.socialSecurity'), num(displayData.payrollTax?.socialSecurity));
    push(t('reports.tax.payrollTax'), t('reports.tax.medicare'), num(displayData.payrollTax?.medicare));
    push(t('reports.tax.payrollTax'), t('reports.tax.employerContributions'), num(displayData.payrollTax?.employerContributions));
    push(t('reports.tax.payrollTax'), t('reports.tax.totalPayrollTax'), num(displayData.payrollTax?.totalPayrollTax));
    rows.push(['', '', '']);

    // Filings (optional summary)
    (displayData.filings || []).forEach((f, idx) => {
      push(t('reports.tax.filings'), `${f.form || t('common.form')} (${f.period || ''})`, num(f.amount));
    });

    if (fmt === 'excel') {
      await exportToXlsx(`tax-summary-${dateSuffix}.xlsx`, headers, rows, 'Tax Summary');
    } else {
      await exportToPdf(`tax-summary-${dateSuffix}.pdf`, headers, rows, {
        title: t('reports.tax.title'),
        subtitle: `${displayData.company || ''} • ${displayData.period || ''}`,
        orientation: 'p',
      });
    }
  };

  const handleFile = (formType: string) => {
    console.log(`Filing ${formType}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'filed':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />{t('reports.tax.statusFiled')}</Badge>;
      case 'paid':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />{t('reports.tax.statusPaid')}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" />{t('reports.tax.statusPending')}</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />{t('reports.tax.statusOverdue')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reports.tax.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('reports.tax.summary')} {displayData.period || format(new Date(), 'yyyy-QQQ')}
          </p>
        </div>
      </div>

      {/* Filters and Actions - Stacked on Mobile with Accordion */}
      <div className="sm:hidden">
  <Accordion type="single" collapsible>
          <AccordionItem value="filters">
            <AccordionTrigger>{t('common.filter')}</AccordionTrigger>
            <AccordionContent>
              <Card className="w-full overflow-hidden">
                <CardContent className="p-2 space-y-3">
        {/* Period Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">{t('reports.period')}</label>
          <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
            <SelectTrigger className="w-full" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month" data-testid="option-month">{t('reports.thisMonth')}</SelectItem>
              <SelectItem value="quarter" data-testid="option-quarter">{t('reports.thisQuarter')}</SelectItem>
              <SelectItem value="year" data-testid="option-year">{t('reports.thisYear')}</SelectItem>
              <SelectItem value="custom" data-testid="option-custom">{t('reports.customRange')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {selectedPeriod === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('reports.startDate')}</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{t('reports.endDate')}</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t('reports.customer')}</label>
            <Select value={customerId} onValueChange={(v) => setCustomerId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {(contacts || []).filter((c: any) => (c.type === 'customer' || c.type === 'both')).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.display_name || c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t('reports.vendor')}</label>
            <Select value={vendorId} onValueChange={(v) => setVendorId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {(contacts || []).filter((c: any) => (c.type === 'supplier' || c.type === 'both')).map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.display_name || c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t('common.currency')}</label>
            <Input
              placeholder="USD"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t('reports.warehouse')}</label>
            <Select value={warehouseId} onValueChange={(v) => setWarehouseId(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {(warehouses || []).map((w: any) => (
                  <SelectItem key={w.id} value={w.id}>{w.name || w.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t('reports.jurisdiction')}</label>
            <Select value={jurisdiction} onValueChange={(v) => setJurisdiction(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('common.none')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                <SelectItem value="sa">SA</SelectItem>
                <SelectItem value="eu">EU</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mobile-button-group pt-2 border-t">
          <Button 
            variant="outline" 
            onClick={() => handleExport('excel')} 
            data-testid="button-export"
            className="flex-1"
          >
            <Download className="h-4 w-4 me-2" />
            {t('reports.export')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('pdf')} 
            className="flex-1"
          >
            <Download className="h-4 w-4 me-2" />
            {t('reports.exportPDF')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            data-testid="button-print"
            className="flex-1"
          >
            <Printer className="h-4 w-4 me-2" />
            {t('reports.print')}
          </Button>
        </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="hidden sm:block">
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4 space-y-3">
            {/* Period Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('reports.period')}</label>
              <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
                <SelectTrigger className="w-full" data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month" data-testid="option-month">{t('reports.thisMonth')}</SelectItem>
                  <SelectItem value="quarter" data-testid="option-quarter">{t('reports.thisQuarter')}</SelectItem>
                  <SelectItem value="year" data-testid="option-year">{t('reports.thisYear')}</SelectItem>
                  <SelectItem value="custom" data-testid="option-custom">{t('reports.customRange')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {selectedPeriod === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('reports.startDate')}</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t('reports.endDate')}</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('reports.customer')}</label>
                <Select value={customerId} onValueChange={(v) => setCustomerId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {(contacts || []).filter((c: any) => (c.type === 'customer' || c.type === 'both')).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.display_name || c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('reports.vendor')}</label>
                <Select value={vendorId} onValueChange={(v) => setVendorId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {(contacts || []).filter((c: any) => (c.type === 'supplier' || c.type === 'both')).map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.display_name || c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('common.currency')}</label>
                <Input
                  placeholder="USD"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  className="uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('reports.warehouse')}</label>
                <Select value={warehouseId} onValueChange={(v) => setWarehouseId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('common.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {(warehouses || []).map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>{w.name || w.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{t('reports.jurisdiction')}</label>
                <Select value={jurisdiction} onValueChange={(v) => setJurisdiction(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('common.none')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('common.none')}</SelectItem>
                    <SelectItem value="sa">SA</SelectItem>
                    <SelectItem value="eu">EU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => handleExport('excel')} 
                data-testid="button-export"
                className="flex-1"
              >
                <Download className="h-4 w-4 me-2" />
                {t('reports.export')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('pdf')} 
                className="flex-1"
              >
                <Download className="h-4 w-4 me-2" />
                {t('reports.exportPDF')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                data-testid="button-print"
                className="flex-1"
              >
                <Printer className="h-4 w-4 me-2" />
                {t('reports.print')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      {/* Mobile summary cards - full width stacked */}
      <div className="sm:hidden grid grid-cols-1 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('taxTypes.salesTax')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-xl" data-testid="text-sales-tax">{formatCurrency(num(displayData.salesTax?.collectedTax))}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.collected')}
            </div>
          </CardContent>
        </Card>
  <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.tax.inputTax')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-xl" data-testid="text-input-tax">{formatCurrency(num(displayData.purchaseTax?.recoverable))}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.recoverable')}
            </div>
          </CardContent>
        </Card>
  <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.tax.netTax')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-orange-600 text-xl">{formatCurrency(netSalesTax)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.payable')}
            </div>
          </CardContent>
        </Card>
  <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.tax.incomeTax')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-xl" data-testid="text-income-tax">{formatCurrency(num(displayData.incomeTax?.estimatedTax) / 4)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.quarterly')}
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-[220px] snap-start">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.tax.totalLiability')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600 text-xl">{formatCurrency(totalTaxLiability)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.thisPeriod')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop summary cards - grid */}
      <div className="hidden sm:grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('taxTypes.salesTax')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl" data-testid="text-sales-tax">{formatCurrency(num(displayData.salesTax?.collectedTax))}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.collected')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.tax.inputTax')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl" data-testid="text-input-tax">{formatCurrency(num(displayData.purchaseTax?.recoverable))}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.recoverable')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.tax.netTax')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-orange-600 text-2xl">{formatCurrency(netSalesTax)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.payable')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.tax.incomeTax')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl" data-testid="text-income-tax">{formatCurrency(num(displayData.incomeTax?.estimatedTax) / 4)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.quarterly')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.tax.totalLiability')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-red-600 text-2xl">{formatCurrency(totalTaxLiability)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.tax.thisPeriod')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Details Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        {/* Enlarged Tabs container: allow multiple wrapped rows, extra padding, clear separation */}
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border sticky top-0 z-20"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="sales" data-testid="tab-sales">{t('taxTypes.salesTax')}</TabsTrigger>
          <TabsTrigger value="purchases" data-testid="tab-purchases">{t('reports.tax.purchaseTax')}</TabsTrigger>
          <TabsTrigger value="income" data-testid="tab-income">{t('reports.tax.incomeTax')}</TabsTrigger>
          <TabsTrigger value="payroll" data-testid="tab-payroll">{t('reports.tax.payrollTax')}</TabsTrigger>
          <TabsTrigger value="filings" data-testid="tab-filings">{t('reports.tax.filings')}</TabsTrigger>
        </TabsList>

        {/* Sales Tax Tab */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.tax.salesTaxDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('reports.tax.totalSales')}</p>
                    <p className="text-lg font-semibold" data-testid="text-total-sales">{formatCurrency(num(displayData.salesTax?.totalSales))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('reports.tax.taxableSales')}</p>
                    <p className="text-lg font-semibold" data-testid="text-taxable-sales">{formatCurrency(num(displayData.salesTax?.taxableSales))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('reports.tax.exemptSales')}</p>
                    <p className="text-lg font-semibold" data-testid="text-exempt-sales">{formatCurrency(num(displayData.salesTax?.exemptSales))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('reports.tax.taxCollected')}</p>
                    <p className="text-lg font-semibold text-green-600" data-testid="text-collected-tax">{formatCurrency(num(displayData.salesTax?.collectedTax))}</p>
                  </div>
                </div>

                <TableContainer>
                  <ResponsiveTable className="min-w-[450px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('reports.jurisdiction')}</TableHead>
                      <TableHead className="text-end">{t('reports.tax.taxRate')}</TableHead>
                      <TableHead className="text-end">{t('reports.tax.taxableAmount')}</TableHead>
                      <TableHead className="text-end">{t('reports.tax.taxAmount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(displayData.salesTax?.rates || []).map((rate: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell data-label={t('reports.jurisdiction')}>{rate.jurisdiction}</TableCell>
                        <TableCell className="text-end" data-label={t('reports.tax.taxRate')}>{rate.rate}%</TableCell>
                        <TableCell className="text-end" data-label={t('tax.taxableAmount')}>{formatCurrency(rate.taxable)}</TableCell>
                        <TableCell className="text-end font-semibold" data-label={t('tax.taxAmount')}>{formatCurrency(rate.tax)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold">
                      <TableCell colSpan={3} data-label="Total">{t('reports.tax.totalSalesTax')}</TableCell>
                      <TableCell className="text-end text-green-600" data-label={t('common.amount')}>
                        {formatCurrency(num(displayData.salesTax?.collectedTax))}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </ResponsiveTable>
                </TableContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Tax Tab */}
        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.tax.purchaseTaxDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports.tax.totalPurchases')}</p>
                  <p className="text-lg font-semibold" data-testid="text-total-purchases">{formatCurrency(num(displayData.purchaseTax?.totalPurchases))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports.tax.taxablePurchases')}</p>
                  <p className="text-lg font-semibold" data-testid="text-taxable-purchases">{formatCurrency(num(displayData.purchaseTax?.taxablePurchases))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports.tax.exemptPurchases')}</p>
                  <p className="text-lg font-semibold" data-testid="text-exempt-purchases">{formatCurrency(num(displayData.purchaseTax?.exemptPurchases))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports.tax.taxPaid')}</p>
                  <p className="text-lg font-semibold text-red-600" data-testid="text-paid-tax">{formatCurrency(num(displayData.purchaseTax?.paidTax))}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('reports.tax.recoverable')}</p>
                  <p className="text-lg font-semibold text-green-600" data-testid="text-recoverable-tax">{formatCurrency(num(displayData.purchaseTax?.recoverable))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income Tax Tab */}
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.tax.incomeTaxDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('reports.tax.grossIncome')}</p>
                    <p className="text-lg font-semibold" data-testid="text-gross-income">{formatCurrency(num(displayData.incomeTax?.grossIncome))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('reports.tax.deductions')}</p>
                    <p className="text-lg font-semibold" data-testid="text-deductions">{formatCurrency(num(displayData.incomeTax?.deductions))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('reports.tax.taxableIncome')}</p>
                    <p className="text-lg font-semibold" data-testid="text-taxable-income">{formatCurrency(num(displayData.incomeTax?.taxableIncome))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('reports.tax.estimatedTax')}</p>
                    <p className="text-lg font-semibold text-orange-600" data-testid="text-estimated-tax">{formatCurrency(num(displayData.incomeTax?.estimatedTax))}</p>
                  </div>
                </div>

                <TableContainer>
                  <ResponsiveTable className="min-w-[450px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('reports.tax.quarter')}</TableHead>
                      <TableHead>{t('common.dueDate')}</TableHead>
                      <TableHead className="text-end">{t('common.amount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(displayData.incomeTax?.quarterlyPayments || []).map((payment: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium" data-label={t('reports.tax.quarter')}>{payment.quarter}</TableCell>
                        <TableCell data-label={t('common.dueDate')}>{format(toSafeDate(payment.dueDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-end" data-label={t('common.amount')}>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell data-label={t('common.status')}>{getStatusBadge(payment.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </ResponsiveTable>
                </TableContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll Tax Tab */}
        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.tax.payrollTaxDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TableContainer>
                <ResponsiveTable className="min-w-[450px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead className="text-end">{t('common.amount')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell data-label={t('common.description')}>{t('reports.tax.grossWages')}</TableCell>
                    <TableCell className="text-end" data-testid="text-gross-wages" data-label={t('common.amount')}>{formatCurrency(num(displayData.payrollTax?.grossWages))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="ps-8" data-label={t('common.description')}>{t('reports.tax.federalWithholding')}</TableCell>
                    <TableCell className="text-end" data-testid="text-federal-withholding" data-label={t('common.amount')}>{formatCurrency(num(displayData.payrollTax?.federalWithholding))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="ps-8" data-label={t('common.description')}>{t('reports.tax.stateWithholding')}</TableCell>
                    <TableCell className="text-end" data-testid="text-state-withholding" data-label={t('common.amount')}>{formatCurrency(num(displayData.payrollTax?.stateWithholding))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="ps-8" data-label={t('common.description')}>{t('reports.tax.socialSecurity')}</TableCell>
                    <TableCell className="text-end" data-testid="text-social-security" data-label={t('common.amount')}>{formatCurrency(num(displayData.payrollTax?.socialSecurity))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="ps-8" data-label={t('common.description')}>{t('reports.tax.medicare')}</TableCell>
                    <TableCell className="text-end" data-testid="text-medicare" data-label={t('common.amount')}>{formatCurrency(num(displayData.payrollTax?.medicare))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="ps-8" data-label={t('common.description')}>{t('reports.tax.employerContributions')}</TableCell>
                    <TableCell className="text-end" data-testid="text-employer-contributions" data-label={t('common.amount')}>{formatCurrency(num(displayData.payrollTax?.employerContributions))}</TableCell>
                  </TableRow>
                  <TableRow className="font-semibold">
                    <TableCell data-label={t('common.description')}>{t('reports.tax.totalPayrollTax')}</TableCell>
                    <TableCell className="text-end text-orange-600" data-testid="text-total-payroll-tax" data-label={t('common.amount')}>
                      {formatCurrency(num(displayData.payrollTax?.totalPayrollTax))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </ResponsiveTable>
              </TableContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Filings Tab */}
        <TabsContent value="filings">
          <Card>
            <CardContent className="p-0">
              <TableContainer>
                <ResponsiveTable className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.form')}</TableHead>
                    <TableHead>{t('reports.period')}</TableHead>
                    <TableHead>{t('common.dueDate')}</TableHead>
                    <TableHead className="text-end">{t('common.amount')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(displayData.filings || []).map((filing: any, index: number) => (
                    <TableRow key={index} data-testid={`row-filing-${index}`}>
                      <TableCell className="font-medium" data-label={t('common.form')}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {translateTaxForm(filing.form)}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('reports.period')}>{filing.period}</TableCell>
                      <TableCell data-label={t('common.dueDate')}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(toSafeDate(filing.dueDate), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-end font-semibold" data-label={t('common.amount')}>
                        {formatCurrency(num(filing.amount))}
                      </TableCell>
                      <TableCell data-label={t('common.status')}>{getStatusBadge(filing.status)}</TableCell>
                      <TableCell className="text-end" data-label={t('common.actions')}>
                        {filing.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleFile(filing.form)}
                            data-testid={`button-file-${index}`}
                          >
                            {t('reports.tax.fileNow')}
                          </Button>
                        )}
                        {filing.status === 'filed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-view-${index}`}
                          >
                            {t('common.view')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </ResponsiveTable>
              </TableContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}