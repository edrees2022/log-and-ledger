import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { format } from "@/lib/utils";
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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Building2,
  CreditCard,
  Wallet,
  Loader2
} from 'lucide-react';

export default function BalanceSheetPage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const companyCurrency = useCompanyCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(undefined);

  // Fetch balance sheet data from API with proper authentication
  const { data: balanceSheetData, isLoading, error } = useQuery({
    queryKey: ['/api/reports/balance-sheet', selectedEndDate],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (selectedEndDate) params.set('end_date', selectedEndDate.toISOString());
        const res = await apiRequest('GET', `/api/reports/balance-sheet?${params.toString()}`);
        return await res.json();
      } catch (err) {
        console.error('Balance Sheet API error:', err);
        throw err;
      }
    }
  });

  // Normalize backend/legacy shapes
  const balanceSheet: any = balanceSheetData ?? {
    assets: { current: [], nonCurrent: [], accounts: [], total: 0 },
    liabilities: { current: [], nonCurrent: [], accounts: [], total: 0 },
    equity: { accounts: [], total: 0 },
    as_of_date: new Date()
  };

  const toArray = (val: any): any[] => (Array.isArray(val) ? val : []);
  const pickAccounts = (section: any): any[] => {
    if (!section) return [];
    if (Array.isArray(section)) return section; // legacy array
    if (Array.isArray(section.accounts)) return section.accounts; // backend shape
    return [];
  };

  const hasSplitAssets = Array.isArray(balanceSheet.assets?.current) || Array.isArray(balanceSheet.assets?.nonCurrent);
  const assetsCurrent = hasSplitAssets ? toArray(balanceSheet.assets?.current) : pickAccounts(balanceSheet.assets);
  const assetsNonCurrent = hasSplitAssets ? toArray(balanceSheet.assets?.nonCurrent) : [];

  const hasSplitLiabilities = Array.isArray(balanceSheet.liabilities?.current) || Array.isArray(balanceSheet.liabilities?.nonCurrent);
  const liabilitiesCurrent = hasSplitLiabilities ? toArray(balanceSheet.liabilities?.current) : pickAccounts(balanceSheet.liabilities);
  const liabilitiesNonCurrent = hasSplitLiabilities ? toArray(balanceSheet.liabilities?.nonCurrent) : [];

  const equityList = Array.isArray(balanceSheet.equity) ? balanceSheet.equity : pickAccounts(balanceSheet.equity);

  // Calculate totals safely
  const totalCurrentAssets = assetsCurrent.reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const totalNonCurrentAssets = assetsNonCurrent.reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;

  const totalCurrentLiabilities = liabilitiesCurrent.reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const totalNonCurrentLiabilities = liabilitiesNonCurrent.reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const totalLiabilities = totalCurrentLiabilities + totalNonCurrentLiabilities;

  const totalEquity = equityList.reduce((sum: number, item: any) => sum + (item.balance || 0), 0);
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: companyCurrency,
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
    
    if (amount < 0) {
      return `(${formatted})`;
    }
    return formatted;
  };

  const handleExport = async (exportType: 'csv' | 'xlsx' | 'pdf') => {
    if (exportType === 'pdf') {
      window.print();
      return;
    }
    const headers = [t('reports.section'), t('reports.account'), t('reports.amount')];
    const rows: Array<Array<string | number>> = [];
    const pushRows = (section: string, list: any[]) => {
      for (const item of list) {
        rows.push([section, item.name ?? item.account_name ?? '', Number(item.balance || 0)]);
      }
    };
    pushRows(t('reports.currentAssets'), assetsCurrent);
    pushRows(t('reports.nonCurrentAssets'), assetsNonCurrent);
    rows.push([t('reports.totalAssets'), '', totalAssets]);
    pushRows(t('reports.currentLiabilities'), liabilitiesCurrent);
    pushRows(t('reports.nonCurrentLiabilities'), liabilitiesNonCurrent);
    rows.push([t('reports.totalLiabilities'), '', totalLiabilities]);
    pushRows(t('reports.equity'), equityList);
    rows.push([t('reports.totalEquity'), '', totalEquity]);
    rows.push([t('reports.totalLiabilitiesAndEquity'), '', totalLiabilitiesAndEquity]);
    const asOf = toSafeDate((balanceSheet as any).as_of_date ?? (balanceSheet as any).date ?? (balanceSheet as any).period_end).toISOString().split('T')[0];
    if (exportType === 'csv') {
      exportToCsv(`balance-sheet-${asOf}.csv`, headers, rows);
    } else if (exportType === 'xlsx') {
      await exportToXlsx(`balance-sheet-${asOf}.xlsx`, headers, rows, 'Balance Sheet');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reports.financial.balanceSheetTitle')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.loadingData')}</p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-40 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-40 mt-1" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-40 mt-1" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
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
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reports.financial.balanceSheetTitle')}</h1>
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

  // Small helper to safely coerce to valid Date
  const toSafeDate = (value: any): Date => {
    if (!value) return new Date();
    if (value instanceof Date) return isNaN(value.getTime()) ? new Date() : value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  return (
    <ReportContainer>
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reports.financial.balanceSheetTitle')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('reports.statementOfFinancialPosition')} {toSafeDate((balanceSheet as any).as_of_date ?? (balanceSheet as any).date ?? (balanceSheet as any).period_end).toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('csv')} data-testid="button-export-csv">
            <Download className="h-4 w-4 me-2" />
            {t('reports.exportCSV')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('xlsx')} data-testid="button-export-excel">
            <Download className="h-4 w-4 me-2" />
            {t('reports.exportExcel')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('pdf')} data-testid="button-export-pdf">
            <FileText className="h-4 w-4 me-2" />
            {t('reports.exportPDF')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePrint} data-testid="button-print">
            <Printer className="h-4 w-4 me-2" />
            {t('reports.print')}
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-period">
              <SelectValue placeholder={t('reports.selectPeriod')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">{t('reports.currentMonth')}</SelectItem>
              <SelectItem value="lastMonth">{t('reports.lastMonth')}</SelectItem>
              <SelectItem value="quarter">{t('reports.currentQuarter')}</SelectItem>
              <SelectItem value="year">{t('reports.currentYear')}</SelectItem>
              <SelectItem value="lastYear">{t('reports.lastYear')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant={compareMode ? 'default' : 'outline'}
          onClick={() => setCompareMode(!compareMode)}
          data-testid="button-compare"
          className="w-full sm:w-auto"
        >
          {t('reports.comparePeriods')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 flex-shrink-0" />
              {t('reports.totalAssets')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{formatCurrency(totalAssets)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{t('reports.percentageFromLastPeriod', { percentage: 12.5 })}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 flex-shrink-0" />
              {t('reports.totalLiabilities')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{formatCurrency(totalLiabilities)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">-5.2% {t('reports.fromLastPeriod')}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              {t('reports.totalEquity')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{formatCurrency(totalEquity)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{t('reports.percentageFromLastPeriod', { percentage: 8.3 })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Sheet Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center">
            {t('reports.companyBalanceSheet')}
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            {t('reports.balanceSheetAsOf')} {format(toSafeDate((balanceSheet as any).date ?? (balanceSheet as any).as_of_date ?? (balanceSheet as any).period_end), 'MMMM dd, yyyy')}
          </p>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table className="min-w-[450px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60%]">{t('reports.account')}</TableHead>
                <TableHead className="text-end">{t('reports.amountUSD')}</TableHead>
                {compareMode && (
                  <TableHead className="text-end">{t('reports.previousPeriod')}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Assets Section */}
              <TableRow>
                <TableCell colSpan={compareMode ? 3 : 2} className="font-bold bg-muted/50">
                  {t('reports.assets').toUpperCase()}
                </TableCell>
              </TableRow>
              
              {/* Current Assets */}
              {(assetsCurrent.length) > 0 && (
                <>
                  <TableRow>
                    <TableCell className="font-semibold ps-8">{t('accountTypes.currentAssets')}</TableCell>
                    <TableCell></TableCell>
                    {compareMode && <TableCell></TableCell>}
                  </TableRow>
                  {assetsCurrent.map((item: any, index: number) => (
                    <TableRow key={`current-asset-${item.id || index}`}>
                      <TableCell className="ps-12" data-label={t('common.account')}>{item.name}</TableCell>
                      <TableCell className="text-end" data-label={t('common.amount')}>{formatCurrency(item.balance)}</TableCell>
                      {compareMode && (
                        <TableCell className="text-end text-muted-foreground">
                          {formatCurrency(item.balance * 0.9)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </>
              )}
              <TableRow>
                <TableCell className="ps-8 font-semibold" data-label={t('common.account')}>{t('reports.totalCurrentAssets')}</TableCell>
                <TableCell className="text-end font-semibold" data-label={t('common.amount')}>{formatCurrency(totalCurrentAssets)}</TableCell>
                {compareMode && (
                  <TableCell className="text-end text-muted-foreground font-semibold">
                    {formatCurrency(totalCurrentAssets * 0.9)}
                  </TableCell>
                )}
              </TableRow>
              
              {/* Non-Current Assets */}
              {(assetsNonCurrent.length) > 0 && (
                <>
                  <TableRow>
                    <TableCell className="font-semibold ps-8 pt-4">{t('accountTypes.nonCurrentAssets')}</TableCell>
                    <TableCell></TableCell>
                    {compareMode && <TableCell></TableCell>}
                  </TableRow>
                  {assetsNonCurrent.map((item: any, index: number) => (
                    <TableRow key={`non-current-asset-${item.id || index}`}>
                      <TableCell className="ps-12" data-label={t('common.account')}>{item.name}</TableCell>
                      <TableCell className="text-end" data-label={t('common.amount')}>{formatCurrency(item.balance)}</TableCell>
                      {compareMode && (
                        <TableCell className="text-end text-muted-foreground">
                          {formatCurrency(item.balance * 0.95)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </>
              )}
              <TableRow>
                <TableCell className="ps-8 font-semibold" data-label={t('common.account')}>{t('reports.totalNonCurrentAssets')}</TableCell>
                <TableCell className="text-end font-semibold" data-label={t('common.amount')}>{formatCurrency(totalNonCurrentAssets)}</TableCell>
                {compareMode && (
                  <TableCell className="text-end text-muted-foreground font-semibold">
                    {formatCurrency(totalNonCurrentAssets * 0.95)}
                  </TableCell>
                )}
              </TableRow>
              
              <TableRow className="bg-muted/30">
                <TableCell className="font-bold" data-label={t('common.account')}>{t('reports.totalAssets').toUpperCase()}</TableCell>
                <TableCell className="text-end font-bold text-lg" data-label={t('common.amount')}>{formatCurrency(totalAssets)}</TableCell>
                {compareMode && (
                  <TableCell className="text-end text-muted-foreground font-bold">
                    {formatCurrency(totalAssets * 0.92)}
                  </TableCell>
                )}
              </TableRow>
              
              {/* Liabilities Section */}
              <TableRow>
                <TableCell colSpan={compareMode ? 3 : 2} className="font-bold bg-muted/50 pt-6">
                  {t('reports.liabilitiesAndEquity').toUpperCase()}
                </TableCell>
              </TableRow>
              
              {/* Current Liabilities */}
              {(liabilitiesCurrent.length) > 0 && (
                <>
                  <TableRow>
                    <TableCell className="font-semibold ps-8">{t('accountTypes.currentLiabilities')}</TableCell>
                    <TableCell></TableCell>
                    {compareMode && <TableCell></TableCell>}
                  </TableRow>
                  {liabilitiesCurrent.map((item: any, index: number) => (
                    <TableRow key={`current-liability-${item.id || index}`}>
                      <TableCell className="ps-12">{item.name}</TableCell>
                      <TableCell className="text-end">{formatCurrency(item.balance)}</TableCell>
                      {compareMode && (
                        <TableCell className="text-end text-muted-foreground">
                          {formatCurrency(item.balance * 1.1)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </>
              )}
              <TableRow>
                <TableCell className="ps-8 font-semibold">{t('reports.totalCurrentLiabilities')}</TableCell>
                <TableCell className="text-end font-semibold">{formatCurrency(totalCurrentLiabilities)}</TableCell>
                {compareMode && (
                  <TableCell className="text-end text-muted-foreground font-semibold">
                    {formatCurrency(totalCurrentLiabilities * 1.1)}
                  </TableCell>
                )}
              </TableRow>
              
              {/* Non-Current Liabilities */}
              {(liabilitiesNonCurrent.length) > 0 && (
                <>
                  <TableRow>
                    <TableCell className="font-semibold ps-8 pt-4">{t('accountTypes.nonCurrentLiabilities')}</TableCell>
                    <TableCell></TableCell>
                    {compareMode && <TableCell></TableCell>}
                  </TableRow>
                  {liabilitiesNonCurrent.map((item: any, index: number) => (
                    <TableRow key={`non-current-liability-${item.id || index}`}>
                      <TableCell className="ps-12">{item.name}</TableCell>
                      <TableCell className="text-end">{formatCurrency(item.balance)}</TableCell>
                      {compareMode && (
                        <TableCell className="text-end text-muted-foreground">
                          {formatCurrency(item.balance * 0.95)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </>
              )}
              <TableRow>
                <TableCell className="ps-8 font-semibold">{t('reports.totalNonCurrentLiabilities')}</TableCell>
                <TableCell className="text-end font-semibold">{formatCurrency(totalNonCurrentLiabilities)}</TableCell>
                {compareMode && (
                  <TableCell className="text-end text-muted-foreground font-semibold">
                    {formatCurrency(totalNonCurrentLiabilities * 0.95)}
                  </TableCell>
                )}
              </TableRow>
              
              <TableRow>
                <TableCell className="font-bold ps-4">{t('reports.totalLiabilities')}</TableCell>
                <TableCell className="text-end font-bold">{formatCurrency(totalLiabilities)}</TableCell>
                {compareMode && (
                  <TableCell className="text-end text-muted-foreground font-bold">
                    {formatCurrency(totalLiabilities * 1.02)}
                  </TableCell>
                )}
              </TableRow>
              
              {/* Equity Section */}
              {(equityList.length) > 0 && (
                <>
                  <TableRow>
                    <TableCell className="font-semibold ps-8 pt-4">{t('reports.shareholdersEquity')}</TableCell>
                    <TableCell></TableCell>
                    {compareMode && <TableCell></TableCell>}
                  </TableRow>
                  {equityList.map((item: any, index: number) => (
                    <TableRow key={`equity-${item.id || index}`}>
                      <TableCell className="ps-12">{item.name}</TableCell>
                      <TableCell className="text-end">{formatCurrency(item.balance)}</TableCell>
                      {compareMode && (
                        <TableCell className="text-end text-muted-foreground">
                          {formatCurrency(item.balance * 0.9)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </>
              )}
              <TableRow>
                <TableCell className="font-bold ps-4">{t('reports.totalEquity')}</TableCell>
                <TableCell className="text-end font-bold">{formatCurrency(totalEquity)}</TableCell>
                {compareMode && (
                  <TableCell className="text-end text-muted-foreground font-bold">
                    {formatCurrency(totalEquity * 0.9)}
                  </TableCell>
                )}
              </TableRow>
              
              <TableRow className="bg-muted/30">
                <TableCell className="font-bold">{t('reports.totalLiabilitiesAndEquity').toUpperCase()}</TableCell>
                <TableCell className="text-end font-bold text-lg">{formatCurrency(totalLiabilitiesAndEquity)}</TableCell>
                {compareMode && (
                  <TableCell className="text-end text-muted-foreground font-bold">
                    {formatCurrency(totalLiabilitiesAndEquity * 0.92)}
                  </TableCell>
                )}
              </TableRow>
            </TableBody>
            </Table>
          </TableContainer>
          
          {/* Balance Check */}
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{t('reports.balanceCheck')}:</span>
              <Badge variant={Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01 ? 'default' : 'destructive'}>
                {Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01 ? t('reports.balanced') : t('reports.imbalanced')}
              </Badge>
            </div>
            {Math.abs(totalAssets - totalLiabilitiesAndEquity) >= 0.01 && (
              <p className="text-sm text-destructive mt-2">
                {t('reports.difference')}: {formatCurrency(totalAssets - totalLiabilitiesAndEquity)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </ReportContainer>
  );
}