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
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

export default function CashFlowPage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const companyCurrency = useCompanyCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [viewType, setViewType] = useState('indirect');

  // Cash flow item translation mapping
  const cashFlowItemTranslations: Record<string, string> = {
    'Net Income': 'cashFlowPage.netIncome',
    'Depreciation & Amortization': 'cashFlowPage.depreciation',
    'Depreciation': 'cashFlowPage.depreciation',
    'Changes in Working Capital': 'cashFlowPage.workingCapital',
    'Accounts Receivable': 'cashFlowPage.accountsReceivable',
    'Accounts Payable': 'cashFlowPage.accountsPayable',
    'Inventory': 'cashFlowPage.inventory',
    'Prepaid Expenses': 'cashFlowPage.prepaidExpenses',
    'Accrued Expenses': 'cashFlowPage.accruedExpenses',
    'Purchase of Equipment': 'cashFlowPage.purchaseOfEquipment',
    'Sale of Equipment': 'cashFlowPage.saleOfEquipment',
    'Purchase of Investments': 'cashFlowPage.purchaseOfInvestments',
    'Sale of Investments': 'cashFlowPage.saleOfInvestments',
    'Proceeds from Loan': 'cashFlowPage.loansReceived',
    'Loans Received': 'cashFlowPage.loansReceived',
    'Loan Repayments': 'cashFlowPage.loanRepayments',
    'Interest Payments': 'cashFlowPage.interestPayments',
    'Dividends Paid': 'cashFlowPage.dividendsPaid',
    'Capital Contributions': 'cashFlowPage.capitalContributions',
    'Capital Withdrawals': 'cashFlowPage.capitalWithdrawals',
  };

  const translateCashFlowItem = (item: string): string => {
    const key = cashFlowItemTranslations[item];
    if (key) {
      return t(key, { defaultValue: item });
    }
    return item;
  };

  type CashFlowActivity = { description?: string; amount: number };
  type CashFlowReport = {
    period?: string;
    company?: string;
    currency?: string;
    beginningCash: number;
    operatingActivities?: CashFlowActivity[];
    investingActivities?: CashFlowActivity[];
    financingActivities?: CashFlowActivity[];
    operatingCashFlow?: number;
    investingCashFlow?: number;
    financingCashFlow?: number;
    netCashFlow?: number;
    endingCash?: number;
    startDate?: string;
    endDate?: string;
  };

  // Get current year dates for API call
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1).toISOString().split('T')[0]; // Jan 1
  const endDate = new Date(currentYear, 11, 31).toISOString().split('T')[0]; // Dec 31

  // Fetch cash flow data using React Query with proper authentication
  const { 
    data: cashFlowData, 
    isLoading, 
    error 
  } = useQuery<CashFlowReport>({
    queryKey: ['/api/reports/cash-flow', startDate, endDate],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/reports/cash-flow?start_date=${startDate}&end_date=${endDate}`);
        return await res.json();
      } catch (err) {
        console.error('Cash flow API error:', err);
        throw err;
      }
    },
  });

  // Use API data if available, otherwise show empty state
  const displayData: CashFlowReport = cashFlowData ?? {
    period: new Date().toISOString().split('T')[0],
    company: '',
    currency: companyCurrency,
    beginningCash: 0,
    operatingActivities: [],
    investingActivities: [],
    financingActivities: [],
    operatingCashFlow: 0,
    investingCashFlow: 0,
    financingCashFlow: 0,
    netCashFlow: 0,
    endingCash: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  };

  // Calculate totals from API data
  const operatingCashFlow = displayData.operatingCashFlow ?? (displayData.operatingActivities?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0);
  const investingCashFlow = displayData.investingCashFlow ?? (displayData.investingActivities?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0);
  const financingCashFlow = displayData.financingCashFlow ?? (displayData.financingActivities?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0);
  
  const netCashFlow = displayData.netCashFlow ?? (operatingCashFlow + investingCashFlow + financingCashFlow);
  const endingCash = (displayData.endingCash ?? (displayData.beginningCash || 0) + netCashFlow);

  const formatCurrency = (amount: number) => {
    // Always prioritize company currency from hook over API response
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: companyCurrency,
    }).format(amount);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6 w-full max-w-screen-lg mx-auto px-3 md:px-6">
        <div className="page-header">
          <div>
            <h1 className="page-title text-3xl font-bold text-foreground">{t('reports.financial.cashFlowTitle')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.loadingData')}</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ms-2 text-muted-foreground">{t('common.loadingData')}</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6 w-full max-w-screen-lg mx-auto px-3 md:px-6">
        <div className="page-header">
          <div>
            <h1 className="page-title text-3xl font-bold text-foreground">{t('reports.financial.cashFlowTitle')}</h1>
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
      </div>
    );
  }

  const handleExport = async (exportType: 'csv' | 'xlsx' | 'pdf') => {
    if (exportType === 'pdf') {
      window.print();
      return;
    }
    const headers = [t('reports.section'), t('common.description'), t('reports.amount')];
    const rows: Array<Array<string | number>> = [];
    const pushRows = (section: string, list?: CashFlowActivity[]) => {
      (list || []).forEach((item) => rows.push([section, item.description || '', Number(item.amount || 0)]));
    };
    pushRows(t('reports.cashFlow.operatingActivities'), displayData.operatingActivities);
    rows.push([t('reports.netOperatingCash'), '', Number(operatingCashFlow)]);
    pushRows(t('reports.cashFlow.investingActivities'), displayData.investingActivities);
    rows.push([t('reports.netInvestingCash'), '', Number(investingCashFlow)]);
    pushRows(t('reports.cashFlow.financingActivities'), displayData.financingActivities);
    rows.push([t('reports.netFinancingCash'), '', Number(financingCashFlow)]);
    rows.push([t('reports.cashFlow.netCashFlow'), '', Number(netCashFlow)]);
    rows.push([t('reports.beginningCash'), '', Number(displayData.beginningCash || 0)]);
    rows.push([t('reports.endingCash'), '', Number(endingCash)]);
    const dateSuffix = (displayData.endDate || new Date().toISOString().slice(0,10));
    if (exportType === 'csv') {
      exportToCsv(`cash-flow-${dateSuffix}.csv`, headers, rows);
    } else if (exportType === 'xlsx') {
      await exportToXlsx(`cash-flow-${dateSuffix}.xlsx`, headers, rows, 'Cash Flow');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ReportContainer>
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reports.financial.cashFlowTitle')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('reports.cashFlowAnalysisFor')} {displayData.startDate && displayData.endDate ? new Date(displayData.startDate).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' }) : new Date().toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
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
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-full sm:w-auto" data-testid="select-view">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indirect">{t('reports.indirectMethod')}</SelectItem>
              <SelectItem value="direct">{t('reports.directMethod')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('csv')} data-testid="button-export-csv">
            <Download className="h-4 w-4 me-2" />
            {t('reports.exportCSV')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('xlsx')} data-testid="button-export-excel">
            <Download className="h-4 w-4 me-2" />
            {t('reports.exportExcel')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePrint} data-testid="button-print">
            <Printer className="h-4 w-4 me-2" />
            {t('reports.print')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.beginningCash')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-beginning-cash">{formatCurrency(displayData.beginningCash || 0)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('reports.startOfPeriod')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.operatingCash')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(operatingCashFlow))}
            </div>
            <div className="flex items-center text-xs mt-1">
              {operatingCashFlow >= 0 ? (
                <ArrowUpRight className="h-3 w-3 me-1 text-green-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 me-1 text-red-600" />
              )}
              {operatingCashFlow >= 0 ? t('reports.financial.inflow') : t('reports.financial.outflow')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.investingCash')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${investingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(investingCashFlow))}
            </div>
            <div className="flex items-center text-xs mt-1">
              {investingCashFlow >= 0 ? (
                <ArrowUpRight className="h-3 w-3 me-1 text-green-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 me-1 text-red-600" />
              )}
              {investingCashFlow >= 0 ? t('reports.financial.inflow') : t('reports.financial.outflow')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.financingCash')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(financingCashFlow))}
            </div>
            <div className="flex items-center text-xs mt-1">
              {financingCashFlow >= 0 ? (
                <ArrowUpRight className="h-3 w-3 me-1 text-green-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 me-1 text-red-600" />
              )}
              {financingCashFlow >= 0 ? t('reports.financial.inflow') : t('reports.financial.outflow')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('reports.endingCash')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-ending-cash">{formatCurrency(endingCash)}</div>
            <Badge variant={netCashFlow >= 0 ? "default" : "destructive"} className="text-xs mt-1">
              {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cash Flow Statement */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('reports.financial.cashFlowTitle')} - {viewType === 'indirect' ? t('reports.indirectMethod') : t('reports.directMethod')}</CardTitle>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table className="min-w-[450px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[500px]">{t('common.description')}</TableHead>
                <TableHead className="text-end">{t('reports.financial.cashInflow')}</TableHead>
                <TableHead className="text-end">{t('reports.financial.cashOutflow')}</TableHead>
                <TableHead className="text-end">{t('reports.netAmount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Beginning Cash */}
              <TableRow className="font-bold bg-muted/50">
                <TableCell>{t('reports.beginningCashBalance')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end" data-testid="text-table-beginning-cash">{formatCurrency(displayData.beginningCash || 0)}</TableCell>
              </TableRow>

              {/* Operating Activities */}
              <TableRow className="font-semibold bg-blue-50 dark:bg-blue-900/20">
                <TableCell>{t('reports.cashFlowsFromOperatingActivities')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
              </TableRow>
              {(displayData.operatingActivities || []).map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="ps-8">{translateCashFlowItem(item.item)}</TableCell>
                  <TableCell className="text-end text-green-600">
                    {item.isInflow ? formatCurrency(Math.abs(item.amount)) : ''}
                  </TableCell>
                  <TableCell className="text-end text-red-600">
                    {!item.isInflow ? formatCurrency(Math.abs(item.amount)) : ''}
                  </TableCell>
                  <TableCell className="text-end">
                    <span className={item.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(item.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>{t('reports.netCashFromOperatingActivities')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className={`text-end ${operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(operatingCashFlow)}
                </TableCell>
              </TableRow>

              {/* Investing Activities */}
              <TableRow className="font-semibold bg-purple-50 dark:bg-purple-900/20">
                <TableCell>{t('reports.cashFlowsFromInvestingActivities')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
              </TableRow>
              {(displayData.investingActivities || []).map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="ps-8">{translateCashFlowItem(item.item)}</TableCell>
                  <TableCell className="text-end text-green-600">
                    {item.isInflow ? formatCurrency(Math.abs(item.amount)) : ''}
                  </TableCell>
                  <TableCell className="text-end text-red-600">
                    {!item.isInflow ? formatCurrency(Math.abs(item.amount)) : ''}
                  </TableCell>
                  <TableCell className="text-end">
                    <span className={item.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(item.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>{t('reports.netCashFromInvestingActivities')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className={`text-end ${investingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(investingCashFlow)}
                </TableCell>
              </TableRow>

              {/* Financing Activities */}
              <TableRow className="font-semibold bg-orange-50 dark:bg-orange-900/20">
                <TableCell>{t('reports.cashFlowsFromFinancingActivities')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
              </TableRow>
              {(displayData.financingActivities || []).map((item: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="ps-8">{translateCashFlowItem(item.item)}</TableCell>
                  <TableCell className="text-end text-green-600">
                    {item.isInflow ? formatCurrency(Math.abs(item.amount)) : ''}
                  </TableCell>
                  <TableCell className="text-end text-red-600">
                    {!item.isInflow ? formatCurrency(Math.abs(item.amount)) : ''}
                  </TableCell>
                  <TableCell className="text-end">
                    <span className={item.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(item.amount)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>{t('reports.netCashFromFinancingActivities')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className={`text-end ${financingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financingCashFlow)}
                </TableCell>
              </TableRow>

              {/* Net Change in Cash */}
              <TableRow className="font-bold bg-gray-100 dark:bg-gray-800">
                <TableCell>{t('reports.netChangeInCash')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className={`text-end text-lg ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netCashFlow)}
                </TableCell>
              </TableRow>

              {/* Ending Cash */}
              <TableRow className="font-bold bg-green-100 dark:bg-green-900/30 text-lg">
                <TableCell>{t('reports.endingCashBalance')}</TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end"></TableCell>
                <TableCell className="text-end text-green-600">
                  {formatCurrency(endingCash)}
                </TableCell>
              </TableRow>
            </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </ReportContainer>
  );
}