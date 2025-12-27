import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Loader2, 
  Download, 
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Printer,
  BarChart3
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

interface ProfitLossData {
  revenue: {
    operating: Array<{ account_id: string; name: string; balance: number }>;
    nonOperating: Array<{ account_id: string; name: string; balance: number }>;
  };
  expenses: {
    costOfGoodsSold: Array<{ account_id: string; name: string; balance: number }>;
    operating: Array<{ account_id: string; name: string; balance: number }>;
    nonOperating: Array<{ account_id: string; name: string; balance: number }>;
  };
}

export default function ProfitLossComparisonPage() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  
  // Preset periods
  const [presetPeriod, setPresetPeriod] = useState('thisVsLast');
  
  // Period 1 (Current)
  const [period1Start, setPeriod1Start] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth(), 1);
    return date;
  });
  const [period1End, setPeriod1End] = useState<Date | undefined>(new Date());
  
  // Period 2 (Comparison)
  const [period2Start, setPeriod2Start] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1, 1);
    return date;
  });
  const [period2End, setPeriod2End] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setDate(0); // Last day of previous month
    return date;
  });

  // Handle preset change
  const handlePresetChange = (preset: string) => {
    setPresetPeriod(preset);
    const now = new Date();
    
    switch (preset) {
      case 'thisVsLast':
        // This month vs last month
        setPeriod1Start(new Date(now.getFullYear(), now.getMonth(), 1));
        setPeriod1End(now);
        setPeriod2Start(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        setPeriod2End(new Date(now.getFullYear(), now.getMonth(), 0));
        break;
      case 'thisQVsLastQ':
        // This quarter vs last quarter
        const currentQ = Math.floor(now.getMonth() / 3);
        setPeriod1Start(new Date(now.getFullYear(), currentQ * 3, 1));
        setPeriod1End(now);
        setPeriod2Start(new Date(now.getFullYear(), (currentQ - 1) * 3, 1));
        setPeriod2End(new Date(now.getFullYear(), currentQ * 3, 0));
        break;
      case 'thisYVsLastY':
        // This year vs last year (same period)
        setPeriod1Start(new Date(now.getFullYear(), 0, 1));
        setPeriod1End(now);
        setPeriod2Start(new Date(now.getFullYear() - 1, 0, 1));
        setPeriod2End(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
        break;
      case 'ytdVsPriorYtd':
        // YTD vs prior year YTD
        setPeriod1Start(new Date(now.getFullYear(), 0, 1));
        setPeriod1End(now);
        setPeriod2Start(new Date(now.getFullYear() - 1, 0, 1));
        setPeriod2End(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
        break;
      case 'custom':
        // Keep current dates for custom
        break;
    }
  };

  // Fetch Period 1 data
  const { data: period1Data, isLoading: loading1 } = useQuery<ProfitLossData>({
    queryKey: ['/api/reports/profit-loss', period1Start?.toISOString(), period1End?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period1Start) params.set('start_date', period1Start.toISOString());
      if (period1End) params.set('end_date', period1End.toISOString());
      const res = await apiRequest('GET', `/api/reports/profit-loss?${params.toString()}`);
      return res.json();
    },
    enabled: !!period1Start && !!period1End,
  });

  // Fetch Period 2 data
  const { data: period2Data, isLoading: loading2 } = useQuery<ProfitLossData>({
    queryKey: ['/api/reports/profit-loss', period2Start?.toISOString(), period2End?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period2Start) params.set('start_date', period2Start.toISOString());
      if (period2End) params.set('end_date', period2End.toISOString());
      const res = await apiRequest('GET', `/api/reports/profit-loss?${params.toString()}`);
      return res.json();
    },
    enabled: !!period2Start && !!period2End,
  });

  const isLoading = loading1 || loading2;

  // Calculate totals
  const calculateTotals = (data: ProfitLossData | undefined) => {
    if (!data) return { revenue: 0, cogs: 0, grossProfit: 0, opex: 0, otherExp: 0, netIncome: 0 };
    
    const revenue = (data.revenue?.operating || []).reduce((s, i) => s + (i.balance || 0), 0) +
                   (data.revenue?.nonOperating || []).reduce((s, i) => s + (i.balance || 0), 0);
    const cogs = (data.expenses?.costOfGoodsSold || []).reduce((s, i) => s + (i.balance || 0), 0);
    const grossProfit = revenue - cogs;
    const opex = (data.expenses?.operating || []).reduce((s, i) => s + (i.balance || 0), 0);
    const otherExp = (data.expenses?.nonOperating || []).reduce((s, i) => s + (i.balance || 0), 0);
    const netIncome = grossProfit - opex - otherExp;
    
    return { revenue, cogs, grossProfit, opex, otherExp, netIncome };
  };

  const period1Totals = useMemo(() => calculateTotals(period1Data), [period1Data]);
  const period2Totals = useMemo(() => calculateTotals(period2Data), [period2Data]);

  // Calculate variance
  const calculateVariance = (current: number, previous: number) => {
    const diff = current - previous;
    const pct = previous !== 0 ? ((diff / Math.abs(previous)) * 100) : (current !== 0 ? 100 : 0);
    return { diff, pct };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPct = (pct: number) => {
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(1)}%`;
  };

  // Format date range
  const formatDateRange = (start: Date | undefined, end: Date | undefined) => {
    if (!start || !end) return '';
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString(i18n.language, opts)} - ${end.toLocaleDateString(i18n.language, opts)}`;
  };

  // Get variance indicator
  const getVarianceIndicator = (diff: number, isExpense: boolean = false) => {
    // For expenses, negative is good; for revenue/profit, positive is good
    const isPositive = isExpense ? diff < 0 : diff > 0;
    const isNegative = isExpense ? diff > 0 : diff < 0;
    
    if (diff === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (isPositive) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (isNegative) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return null;
  };

  // Comparison rows
  const comparisonRows = [
    { 
      label: t('reports.comparison.totalRevenue'), 
      period1: period1Totals.revenue, 
      period2: period2Totals.revenue,
      isExpense: false,
      isTotal: true
    },
    { 
      label: t('reports.comparison.costOfGoodsSold'), 
      period1: period1Totals.cogs, 
      period2: period2Totals.cogs,
      isExpense: true,
      isTotal: false
    },
    { 
      label: t('reports.comparison.grossProfit'), 
      period1: period1Totals.grossProfit, 
      period2: period2Totals.grossProfit,
      isExpense: false,
      isTotal: true
    },
    { 
      label: t('reports.comparison.operatingExpenses'), 
      period1: period1Totals.opex, 
      period2: period2Totals.opex,
      isExpense: true,
      isTotal: false
    },
    { 
      label: t('reports.comparison.otherExpenses'), 
      period1: period1Totals.otherExp, 
      period2: period2Totals.otherExp,
      isExpense: true,
      isTotal: false
    },
    { 
      label: t('reports.comparison.netIncome'), 
      period1: period1Totals.netIncome, 
      period2: period2Totals.netIncome,
      isExpense: false,
      isTotal: true,
      highlight: true
    },
  ];

  // Handle print
  const handlePrint = () => window.print();

  // Handle export
  const handleExport = () => {
    const rows = comparisonRows.map(row => {
      const variance = calculateVariance(row.period1, row.period2);
      return [
        row.label,
        row.period1,
        row.period2,
        variance.diff,
        `${variance.pct.toFixed(1)}%`
      ];
    });
    
    const csvContent = [
      [t('reports.comparison.item'), t('reports.comparison.period1'), t('reports.comparison.period2'), t('reports.comparison.variance'), t('reports.comparison.change')].join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `profit-loss-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {t('reports.comparison.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('reports.comparison.description')}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 me-2" />
              {t('buttons.print')}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 me-2" />
              {t('buttons.export')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.comparison.selectPeriods')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset selector */}
            <div className="space-y-2">
              <Label>{t('reports.comparison.quickSelect')}</Label>
              <Select value={presetPeriod} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisVsLast">{t('reports.comparison.thisMonthVsLast')}</SelectItem>
                  <SelectItem value="thisQVsLastQ">{t('reports.comparison.thisQuarterVsLast')}</SelectItem>
                  <SelectItem value="thisYVsLastY">{t('reports.comparison.thisYearVsLast')}</SelectItem>
                  <SelectItem value="ytdVsPriorYtd">{t('reports.comparison.ytdVsPriorYtd')}</SelectItem>
                  <SelectItem value="custom">{t('reports.comparison.customPeriods')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom date pickers */}
            {presetPeriod === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Period 1 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <Label className="text-base font-semibold">{t('reports.comparison.period1')}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t('reports.comparison.startDate')}</Label>
                      <DatePicker value={period1Start} onChange={setPeriod1Start} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('reports.comparison.endDate')}</Label>
                      <DatePicker value={period1End} onChange={setPeriod1End} />
                    </div>
                  </div>
                </div>

                {/* Period 2 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <Label className="text-base font-semibold">{t('reports.comparison.period2')}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t('reports.comparison.startDate')}</Label>
                      <DatePicker value={period2Start} onChange={setPeriod2Start} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('reports.comparison.endDate')}</Label>
                      <DatePicker value={period2End} onChange={setPeriod2End} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {/* Comparison Results */}
        {!isLoading && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Net Income Change */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('reports.comparison.netIncomeChange')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    period1Totals.netIncome >= period2Totals.netIncome ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(period1Totals.netIncome - period2Totals.netIncome)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    {getVarianceIndicator(period1Totals.netIncome - period2Totals.netIncome)}
                    <span>{formatPct(calculateVariance(period1Totals.netIncome, period2Totals.netIncome).pct)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Change */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('reports.comparison.revenueChange')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${
                    period1Totals.revenue >= period2Totals.revenue ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(period1Totals.revenue - period2Totals.revenue)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    {getVarianceIndicator(period1Totals.revenue - period2Totals.revenue)}
                    <span>{formatPct(calculateVariance(period1Totals.revenue, period2Totals.revenue).pct)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Gross Margin Change */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('reports.comparison.grossMarginChange')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const margin1 = period1Totals.revenue > 0 ? (period1Totals.grossProfit / period1Totals.revenue) * 100 : 0;
                    const margin2 = period2Totals.revenue > 0 ? (period2Totals.grossProfit / period2Totals.revenue) * 100 : 0;
                    const diff = margin1 - margin2;
                    return (
                      <>
                        <div className={`text-2xl font-bold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {margin1.toFixed(1)}% vs {margin2.toFixed(1)}%
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.comparison.detailedComparison')}</CardTitle>
                <CardDescription>
                  {formatDateRange(period1Start, period1End)} vs {formatDateRange(period2Start, period2End)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">{t('reports.comparison.item')}</TableHead>
                      <TableHead className="text-end">{t('reports.comparison.period1')}</TableHead>
                      <TableHead className="text-end">{t('reports.comparison.period2')}</TableHead>
                      <TableHead className="text-end">{t('reports.comparison.variance')}</TableHead>
                      <TableHead className="text-end">{t('reports.comparison.change')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonRows.map((row, idx) => {
                      const variance = calculateVariance(row.period1, row.period2);
                      return (
                        <TableRow 
                          key={idx}
                          className={row.highlight ? 'bg-muted/50 font-bold' : row.isTotal ? 'font-semibold' : ''}
                        >
                          <TableCell>{row.label}</TableCell>
                          <TableCell className="text-end">{formatCurrency(row.period1)}</TableCell>
                          <TableCell className="text-end">{formatCurrency(row.period2)}</TableCell>
                          <TableCell className="text-end">
                            <div className="flex items-center justify-end gap-1">
                              {getVarianceIndicator(variance.diff, row.isExpense)}
                              <span className={
                                variance.diff === 0 ? '' :
                                (row.isExpense ? variance.diff < 0 : variance.diff > 0) ? 'text-green-600' : 'text-red-600'
                              }>
                                {formatCurrency(Math.abs(variance.diff))}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-end">
                            <Badge 
                              variant={variance.diff === 0 ? 'secondary' : 
                                (row.isExpense ? variance.diff < 0 : variance.diff > 0) ? 'default' : 'destructive'}
                              className="font-mono"
                            >
                              {formatPct(variance.pct)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
