import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { apiRequest } from '@/lib/queryClient';
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
  CheckCircle,
  AlertCircle,
  DollarSign,
  Loader2
} from 'lucide-react';
import { normalizeTrialBalanceAccounts } from '@/utils/reports';
import { exportToCsv, exportToXlsx } from '@/utils/export';

export default function TrialBalancePage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const companyCurrency = useCompanyCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');

  // Fetch trial balance data
  type TrialBalanceReport = {
    report_name?: string;
    as_of_date?: string | Date;
    company_id?: string;
    accounts?: Array<{
      account_id: string;
      account_code: string;
      account_name: string;
      account_type: string;
      parent_id: string | null;
      debit: number;
      credit: number;
      balance: number;
    }>;
    total_debits?: number;
    total_credits?: number;
    balanced?: boolean;
    difference?: number;
  };

  const { data: trialBalanceData, isLoading, error } = useQuery<TrialBalanceReport>({
    queryKey: ['/api/reports/trial-balance', selectedEndDate],
    queryFn: async () => {
      const url = selectedEndDate 
        ? `/api/reports/trial-balance?end_date=${selectedEndDate}`
        : '/api/reports/trial-balance';
      const res = await apiRequest('GET', url);
      return await res.json();
    }
  });
  const [filterType, setFilterType] = useState('all');

  // Normalize incoming accounts to a consistent shape for rendering and filtering
  const normalizedAccounts = normalizeTrialBalanceAccounts(trialBalanceData?.accounts);

  // Filter accounts based on type
  const filteredAccounts = filterType === 'all'
    ? normalizedAccounts
    : normalizedAccounts.filter((acc: any) => acc.account_type === filterType);

  // Calculate totals
  const totalDebits = filteredAccounts.reduce((sum: number, acc: any) => sum + (Number(acc.debit) || 0), 0);
  const totalCredits = filteredAccounts.reduce((sum: number, acc: any) => sum + (Number(acc.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Group accounts by type
  const groupedAccounts = {
    asset: filteredAccounts.filter((acc: any) => acc.account_type === 'asset'),
    liability: filteredAccounts.filter((acc: any) => acc.account_type === 'liability'),
    equity: filteredAccounts.filter((acc: any) => acc.account_type === 'equity'),
    revenue: filteredAccounts.filter((acc: any) => acc.account_type === 'revenue'),
    expense: filteredAccounts.filter((acc: any) => acc.account_type === 'expense'),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: companyCurrency,
    }).format(amount);
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    if (format === 'pdf') {
      // For now, advise print-to-PDF via the browser
      window.print();
      return;
    }
    const headers = [t('trialBalancePage.accountCode'), t('trialBalancePage.accountName'), t('common.type'), t('trialBalancePage.debit'), t('trialBalancePage.credit'), t('trialBalancePage.balance')];
    const rows = normalizedAccounts.map((acc: any) => {
      const debit = Number(acc.debit) || 0;
      const credit = Number(acc.credit) || 0;
      const balance = debit - credit;
      return [acc.code, acc.name, acc.account_type, debit, credit, balance];
    });
    // Add totals row
    rows.push(['', t('trialBalancePage.total').toUpperCase(), '', totalDebits, totalCredits, Number((totalDebits - totalCredits).toFixed(2))]);
    const dateSuffix = (trialBalanceData?.as_of_date ? new Date(trialBalanceData.as_of_date) : new Date()).toISOString().slice(0,10);
    if (format === 'csv') {
      exportToCsv(`trial-balance-${dateSuffix}.csv`, headers, rows);
    } else if (format === 'xlsx') {
      await exportToXlsx(`trial-balance-${dateSuffix}.xlsx`, headers, rows, 'Trial Balance');
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('trialBalancePage.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('trialBalancePage.asOf')} {new Date(trialBalanceData?.as_of_date || new Date()).toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-auto" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">{t('trialBalancePage.currentPeriod')}</SelectItem>
              <SelectItem value="previous">{t('trialBalancePage.previousPeriod')}</SelectItem>
              <SelectItem value="yearend">{t('trialBalancePage.yearEnd')}</SelectItem>
              <SelectItem value="custom">{t('trialBalancePage.customDate')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-auto" data-testid="select-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('trialBalancePage.allAccounts')}</SelectItem>
              <SelectItem value="asset">{t('trialBalancePage.assetsOnly')}</SelectItem>
              <SelectItem value="liability">{t('trialBalancePage.liabilitiesOnly')}</SelectItem>
              <SelectItem value="equity">{t('trialBalancePage.equityOnly')}</SelectItem>
              <SelectItem value="revenue">{t('trialBalancePage.revenueOnly')}</SelectItem>
              <SelectItem value="expense">{t('trialBalancePage.expensesOnly')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 me-2" />
            {t('trialBalancePage.exportCSV')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('xlsx')}>
            <Download className="h-4 w-4 me-2" />
            {t('trialBalancePage.exportExcel')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={handlePrint}>
            <Printer className="h-4 w-4 me-2" />
            {t('trialBalancePage.print')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('trialBalancePage.totalDebits')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebits)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('trialBalancePage.allDebitEntries')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('trialBalancePage.totalCredits')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCredits)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('trialBalancePage.allCreditEntries')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('trialBalancePage.difference')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totalDebits - totalCredits))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isBalanced ? t('trialBalancePage.balanced') : t('trialBalancePage.unbalanced')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('trialBalancePage.status')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-600 font-semibold">{t('trialBalancePage.balanced')}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-600 font-semibold">{t('trialBalancePage.unbalanced')}</span>
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {filteredAccounts.length} {t('trialBalancePage.accounts')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t('trialBalancePage.trialBalanceDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ms-2">{t('trialBalancePage.loading')}</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {t('trialBalancePage.errorLoading')}
            </div>
          ) : normalizedAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('trialBalancePage.noAccountData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[450px]">
              <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('trialBalancePage.accountCode')}</TableHead>
                <TableHead className="w-[400px]">{t('trialBalancePage.accountName')}</TableHead>
                <TableHead className="w-[100px]">{t('common.type')}</TableHead>
                <TableHead className="text-end">{t('trialBalancePage.debit')}</TableHead>
                <TableHead className="text-end">{t('trialBalancePage.credit')}</TableHead>
                <TableHead className="text-end">{t('trialBalancePage.balance')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterType === 'all' ? (
                // Show grouped accounts
                Object.entries(groupedAccounts).map(([type, accounts]) => (
                  accounts.length > 0 && (
                    <>
                      <TableRow key={type} className="font-semibold bg-muted/50">
                        <TableCell colSpan={6}>{type.toUpperCase()}S</TableCell>
                      </TableRow>
                      {accounts.map((account: any) => {
                        const debit = Number(account.debit) || 0;
                        const credit = Number(account.credit) || 0;
                        const balance = debit - credit;
                        return (
                          <TableRow key={account.code}>
                            <TableCell className="font-medium">{account.code}</TableCell>
                            <TableCell className="ps-8">{account.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="text-xs">
                                {account.account_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-end">
                              {debit > 0 ? formatCurrency(debit) : '-'}
                            </TableCell>
                            <TableCell className="text-end">
                              {credit > 0 ? formatCurrency(credit) : '-'}
                            </TableCell>
                            <TableCell className={`text-end font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(Math.abs(balance))} {balance < 0 ? '(CR)' : '(DR)'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="font-semibold">
                        <TableCell colSpan={3} className="text-end">
                          {t('trialBalancePage.subtotal')} - {type}s
                        </TableCell>
                        <TableCell className="text-end">
                          {formatCurrency(accounts.reduce((sum: number, acc: any) => sum + (Number(acc.debit) || 0), 0))}
                        </TableCell>
                        <TableCell className="text-end">
                          {formatCurrency(accounts.reduce((sum: number, acc: any) => sum + (Number(acc.credit) || 0), 0))}
                        </TableCell>
                        <TableCell className="text-end">
                          {formatCurrency(Math.abs(
                            accounts.reduce((sum: number, acc: any) => sum + ((Number(acc.debit) || 0) - (Number(acc.credit) || 0)), 0)
                          ))}
                        </TableCell>
                      </TableRow>
                    </>
                  )
                ))
              ) : (
                // Show filtered accounts
                filteredAccounts.map((account: any) => {
                  const debit = Number(account.debit) || 0;
                  const credit = Number(account.credit) || 0;
                  const balance = debit - credit;
                  return (
                    <TableRow key={account.code}>
                      <TableCell className="font-medium">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {account.account_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        {debit > 0 ? formatCurrency(debit) : '-'}
                      </TableCell>
                      <TableCell className="text-end">
                        {credit > 0 ? formatCurrency(credit) : '-'}
                      </TableCell>
                      <TableCell className={`text-end font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(balance))} {balance < 0 ? '(CR)' : '(DR)'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              {/* Total Row */}
              <TableRow className={`font-bold text-lg ${isBalanced ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                <TableCell colSpan={3}>{t('trialBalancePage.total').toUpperCase()}</TableCell>
                <TableCell className="text-end">{formatCurrency(totalDebits)}</TableCell>
                <TableCell className="text-end">{formatCurrency(totalCredits)}</TableCell>
                <TableCell className={`text-end ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                  {isBalanced ? t('trialBalancePage.balanced').toUpperCase() : formatCurrency(Math.abs(totalDebits - totalCredits))}
                </TableCell>
              </TableRow>
              </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </ReportContainer>
  );
}