import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { exportToCsv, exportToXlsx } from '@/utils/export';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ReportContainer } from '@/components/layout/ReportContainer';
import { TableContainer } from '@/components/layout/TableContainer';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2
} from 'lucide-react';

// Removed mock data; this page loads from API with safe fallbacks.

export default function ProfitLossPage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const companyCurrency = useCompanyCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [compareMode, setCompareMode] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), 0, 1)); // Year start
  const [endDate, setEndDate] = useState<Date | undefined>(new Date()); // Today

  // Fetch profit loss data from API with proper authentication
  const { data: profitLossData, isLoading, error } = useQuery({
    queryKey: ['/api/reports/profit-loss', startDate, endDate],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (startDate) params.set('start_date', startDate.toISOString());
        if (endDate) params.set('end_date', endDate.toISOString());
        const res = await apiRequest('GET', `/api/reports/profit-loss?${params.toString()}`);
        return await res.json();
      } catch (err) {
        console.error('Profit & Loss API error:', err);
        throw err;
      }
    }
  });

  // Use real data when available, fallback to empty structure
  const profitLoss: any = profitLossData || {
    revenue: { operating: [], nonOperating: [] },
    expenses: { costOfGoodsSold: [], operating: [], nonOperating: [] },
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date()
  };

  // Calculate totals from real data with safe array access
  const totalOperatingRevenue = (profitLoss.revenue?.operating || []).reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const totalNonOperatingRevenue = (profitLoss.revenue?.nonOperating || []).reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const totalRevenue = totalOperatingRevenue + totalNonOperatingRevenue;

  const totalCOGS = (profitLoss.expenses?.costOfGoodsSold || []).reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  
  const totalOperatingExpenses = (profitLoss.expenses?.operating || []).reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const operatingIncome = grossProfit - totalOperatingExpenses;
  
  const totalNonOperatingExpenses = (profitLoss.expenses?.nonOperating || []).reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const incomeBeforeTax = operatingIncome - totalNonOperatingExpenses;
  
  // For now, we'll assume taxes are 0 since we don't have a separate tax calculation
  const taxes = 0;
  const netIncome = incomeBeforeTax - taxes;
  const netProfitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

  // Derive a human-friendly period label from API data or fallback to current month
  const periodLabel = (() => {
    try {
      const end = profitLoss?.endDate ? new Date(profitLoss.endDate) : endDate || new Date();
      return end.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
    } catch {
      return new Date().toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' });
    }
  })();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: companyCurrency,
    }).format(amount);
  };

  const handleExport = async (exportType: 'csv' | 'xlsx' | 'pdf') => {
    if (exportType === 'pdf') {
      window.print();
      return;
    }
    const headers = [t('reports.section'), t('reports.account'), t('reports.amount'), t('reports.percentOfRevenue')];
    const rows: Array<Array<string | number>> = [];
    const pushRows = (section: string, list: any[]) => {
      for (const item of list) {
        const amt = Number(item.balance || 0);
        const pct = totalRevenue > 0 ? Number(((amt / totalRevenue) * 100).toFixed(2)) : 0;
        rows.push([section, item.name ?? item.account_name ?? '', amt, pct]);
      }
    };
    pushRows(t('reports.operatingRevenue'), profitLoss.revenue?.operating || []);
    pushRows(t('reports.nonOperatingRevenue'), profitLoss.revenue?.nonOperating || []);
    rows.push([t('reports.totalRevenue'), '', totalRevenue, 100]);
    pushRows(t('reports.cogs'), profitLoss.expenses?.costOfGoodsSold || []);
    rows.push([t('reports.totalCogs'), '', totalCOGS, totalRevenue > 0 ? Number(((totalCOGS / totalRevenue) * 100).toFixed(2)) : 0]);
    rows.push([t('reports.grossProfit'), '', grossProfit, totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(2)) : 0]);
    pushRows(t('reports.operatingExpenses'), profitLoss.expenses?.operating || []);
    rows.push([t('reports.totalOperatingExpenses'), '', totalOperatingExpenses, totalRevenue > 0 ? Number(((totalOperatingExpenses / totalRevenue) * 100).toFixed(2)) : 0]);
    pushRows(t('reports.otherExpenses'), profitLoss.expenses?.nonOperating || []);
    rows.push([t('reports.incomeBeforeTax'), '', incomeBeforeTax, totalRevenue > 0 ? Number(((incomeBeforeTax / totalRevenue) * 100).toFixed(2)) : 0]);
    rows.push([t('reports.taxes'), '', taxes, totalRevenue > 0 ? Number(((taxes / totalRevenue) * 100).toFixed(2)) : 0]);
    rows.push([t('reports.netIncome'), '', netIncome, totalRevenue > 0 ? Number(((netIncome / totalRevenue) * 100).toFixed(2)) : 0]);

    const dateSuffix = (endDate || new Date()).toISOString().slice(0, 10);
    if (exportType === 'csv') {
      exportToCsv(`profit-loss-${dateSuffix}.csv`, headers, rows);
    } else if (exportType === 'xlsx') {
      await exportToXlsx(`profit-loss-${dateSuffix}.xlsx`, headers, rows, 'Profit & Loss');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title text-3xl font-bold text-foreground">{t('reports.financial.profitLossTitle')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.loadingData')}</p>
          </div>
          <div className="page-actions mobile-button-group">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-32 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-20 mt-1" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title text-3xl font-bold text-foreground">{t('reports.financial.profitLossTitle')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.errorLoadingData')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{t('reports.failedToGenerateTryAgain')}</p>
              <Button onClick={() => window.location.reload()}>
                {t('common.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ReportContainer>
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reports.financial.profitLossTitle')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('reports.incomeStatementFor')} {periodLabel}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-auto" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">{t('reports.thisMonth')}</SelectItem>
              <SelectItem value="quarter">{t('reports.thisQuarter')}</SelectItem>
              <SelectItem value="year">{t('reports.thisYear')}</SelectItem>
              <SelectItem value="custom">{t('reports.customRange')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setCompareMode(!compareMode)}>
            <Calendar className="h-4 w-4 me-2" />
            {t('reports.compare')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 me-2" />
            {t('reports.exportCSV')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('xlsx')}>
            <Download className="h-4 w-4 me-2" />
            {t('reports.exportExcel')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePrint}>
            <Printer className="h-4 w-4 me-2" />
            {t('reports.print')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.totalRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 me-1" />
              {t('reports.percentageFromLastMonth', { percentage: 12 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.grossProfit')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(grossProfit)}</div>
            <Badge variant="secondary" className="text-xs mt-1">
              {grossProfitMargin.toFixed(1)}% {t('reports.margin')}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.operatingIncome')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(operatingIncome)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 me-1" />
              {t('reports.percentageFromLastMonth', { percentage: 8 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.netIncome')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome)}
            </div>
            <Badge variant={netIncome >= 0 ? "default" : "destructive"} className="text-xs mt-1">
              {netProfitMargin.toFixed(1)}% {t('reports.margin')}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed P&L Statement */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('reports.incomeStatementDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[450px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">{t('reports.account')}</TableHead>
                <TableHead className="text-end">{t('reports.amountUSD')}</TableHead>
                <TableHead className="text-end">{t('reports.percentOfRevenue')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Revenue Section */}
              {(((profitLoss.revenue?.operating?.length || 0) > 0) || ((profitLoss.revenue?.nonOperating?.length || 0) > 0)) && (
                <>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>{t('reports.revenue').toUpperCase()}</TableCell>
                    <TableCell className="text-end"></TableCell>
                    <TableCell className="text-end"></TableCell>
                  </TableRow>
                  {(profitLoss.revenue?.operating || []).map((item: any, index: number) => (
                    <TableRow key={`operating-revenue-${item.id || index}`}>
                      <TableCell className="ps-8">{item.name}</TableCell>
                      <TableCell className="text-end">{formatCurrency(item.balance)}</TableCell>
                      <TableCell className="text-end">{totalRevenue > 0 ? ((item.balance / totalRevenue) * 100).toFixed(1) : '0.0'}%</TableCell>
                    </TableRow>
                  ))}
                  {(profitLoss.revenue?.nonOperating || []).map((item: any, index: number) => (
                    <TableRow key={`non-operating-revenue-${item.id || index}`}>
                      <TableCell className="ps-8">{item.name}</TableCell>
                      <TableCell className="text-end">{formatCurrency(item.balance)}</TableCell>
                      <TableCell className="text-end">{totalRevenue > 0 ? ((item.balance / totalRevenue) * 100).toFixed(1) : '0.0'}%</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              <TableRow className="font-semibold">
                <TableCell>{t('reports.totalRevenue')}</TableCell>
                <TableCell className="text-end">{formatCurrency(totalRevenue)}</TableCell>
                <TableCell className="text-end">100.0%</TableCell>
              </TableRow>

              {/* COGS Section */}
              {(profitLoss.expenses?.costOfGoodsSold?.length || 0) > 0 && (
                <>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>{t('reports.costOfGoodsSold').toUpperCase()}</TableCell>
                    <TableCell className="text-end"></TableCell>
                    <TableCell className="text-end"></TableCell>
                  </TableRow>
                  {(profitLoss.expenses?.costOfGoodsSold || []).map((item: any, index: number) => (
                    <TableRow key={`cogs-${item.id || index}`}>
                      <TableCell className="ps-8">{item.name}</TableCell>
                      <TableCell className="text-end">{formatCurrency(item.balance)}</TableCell>
                      <TableCell className="text-end">{totalRevenue > 0 ? ((item.balance / totalRevenue) * 100).toFixed(1) : '0.0'}%</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              <TableRow className="font-semibold">
                <TableCell>{t('reports.totalCOGS')}</TableCell>
                <TableCell className="text-end">{formatCurrency(totalCOGS)}</TableCell>
                <TableCell className="text-end">{((totalCOGS / totalRevenue) * 100).toFixed(1)}%</TableCell>
              </TableRow>

              {/* Gross Profit */}
              <TableRow className="font-bold bg-green-50 dark:bg-green-900/20">
                <TableCell>{t('reports.grossProfit').toUpperCase()}</TableCell>
                <TableCell className="text-end text-green-600">{formatCurrency(grossProfit)}</TableCell>
                <TableCell className="text-end text-green-600">{grossProfitMargin.toFixed(1)}%</TableCell>
              </TableRow>

              {/* Operating Expenses */}
              {(profitLoss.expenses?.operating?.length || 0) > 0 && (
                <>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>{t('reports.operatingExpenses').toUpperCase()}</TableCell>
                    <TableCell className="text-end"></TableCell>
                    <TableCell className="text-end"></TableCell>
                  </TableRow>
                  {(profitLoss.expenses?.operating || []).map((item: any, index: number) => (
                    <TableRow key={`operating-expense-${item.id || index}`}>
                      <TableCell className="ps-8">{item.name}</TableCell>
                      <TableCell className="text-end">{formatCurrency(item.balance)}</TableCell>
                      <TableCell className="text-end">{totalRevenue > 0 ? ((item.balance / totalRevenue) * 100).toFixed(1) : '0.0'}%</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              <TableRow className="font-semibold">
                <TableCell>{t('reports.totalOperatingExpenses')}</TableCell>
                <TableCell className="text-end">{formatCurrency(totalOperatingExpenses)}</TableCell>
                <TableCell className="text-end">{((totalOperatingExpenses / totalRevenue) * 100).toFixed(1)}%</TableCell>
              </TableRow>

              {/* Operating Income */}
              <TableRow className="font-bold bg-blue-50 dark:bg-blue-900/20">
                <TableCell>{t('reports.operatingIncome').toUpperCase()}</TableCell>
                <TableCell className="text-end text-blue-600">{formatCurrency(operatingIncome)}</TableCell>
                <TableCell className="text-end text-blue-600">{((operatingIncome / totalRevenue) * 100).toFixed(1)}%</TableCell>
              </TableRow>

              {/* Other Expenses */}
              {(profitLoss.expenses?.nonOperating?.length || 0) > 0 && (
                <>
                  <TableRow className="font-semibold bg-muted/50">
                    <TableCell>{t('reports.otherExpenses').toUpperCase()}</TableCell>
                    <TableCell className="text-end"></TableCell>
                    <TableCell className="text-end"></TableCell>
                  </TableRow>
                  {(profitLoss.expenses?.nonOperating || []).map((item: any, index: number) => (
                    <TableRow key={`other-expense-${item.id || index}`}>
                      <TableCell className="ps-8">{item.name}</TableCell>
                      <TableCell className="text-end">{formatCurrency(item.balance)}</TableCell>
                      <TableCell className="text-end">{totalRevenue > 0 ? ((item.balance / totalRevenue) * 100).toFixed(1) : '0.0'}%</TableCell>
                    </TableRow>
                  ))}
                </>
              )}

              {/* Income Before Tax */}
              <TableRow className="font-semibold">
                <TableCell>{t('reports.incomeBeforeTax')}</TableCell>
                <TableCell className="text-end">{formatCurrency(incomeBeforeTax)}</TableCell>
                <TableCell className="text-end">{((incomeBeforeTax / totalRevenue) * 100).toFixed(1)}%</TableCell>
              </TableRow>

              {/* Taxes */}
              <TableRow>
                <TableCell className="ps-8">{t('reports.incomeTaxExpense')}</TableCell>
                <TableCell className="text-end">{formatCurrency(taxes)}</TableCell>
                <TableCell className="text-end">{totalRevenue > 0 ? ((taxes / totalRevenue) * 100).toFixed(1) : '0.0'}%</TableCell>
              </TableRow>

              {/* Net Income */}
              <TableRow className={`font-bold text-lg ${netIncome >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <TableCell>{t('reports.netIncome').toUpperCase()}</TableCell>
                <TableCell className={`text-end ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netIncome)}
                </TableCell>
                <TableCell className={`text-end ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netProfitMargin.toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </ReportContainer>
  );
}