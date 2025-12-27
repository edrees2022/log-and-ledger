import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearch } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Search, Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

interface Account {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  account_type: string;
}

interface LedgerEntry {
  id: string;
  date: string;
  journal_number?: string;
  description: string;
  reference?: string;
  debit: number;
  credit: number;
  balance: number;
  document_type?: string;
  document_id?: string;
}

export default function AccountLedgerPage() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  const searchString = useSearch();
  
  // Parse URL params
  const urlParams = new URLSearchParams(searchString);
  const accountFromUrl = urlParams.get('account') || '';
  
  // Filters
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accountFromUrl);
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(0, 1); // January 1st of current year
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Update selected account when URL changes
  useEffect(() => {
    if (accountFromUrl && accountFromUrl !== selectedAccountId) {
      setSelectedAccountId(accountFromUrl);
    }
  }, [accountFromUrl]);

  // Fetch accounts
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  // Fetch ledger entries for selected account
  const { data: ledgerData, isLoading } = useQuery<{ entries: LedgerEntry[]; opening_balance: number }>({
    queryKey: ['/api/accounts', selectedAccountId, 'ledger', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());
      const res = await apiRequest('GET', `/api/accounts/${selectedAccountId}/ledger?${params.toString()}`);
      return res.json();
    },
    enabled: !!selectedAccountId,
  });

  // Get account name based on language
  const getAccountName = (account: Account) => {
    if (i18n.language === 'ar' && account.name_ar) {
      return account.name_ar;
    }
    return account.name;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Group accounts by type
  const groupedAccounts = useMemo(() => {
    const groups: Record<string, Account[]> = {};
    accounts.forEach(account => {
      const type = account.account_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(account);
    });
    return groups;
  }, [accounts]);

  // Selected account details
  const selectedAccount = useMemo(() => 
    accounts.find(a => a.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  // Calculate totals
  const totals = useMemo(() => {
    if (!ledgerData?.entries) return { debit: 0, credit: 0, closing: 0 };
    const debit = ledgerData.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const credit = ledgerData.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const closing = (ledgerData.opening_balance || 0) + debit - credit;
    return { debit, credit, closing };
  }, [ledgerData]);

  // Export to CSV
  const handleExport = () => {
    if (!ledgerData?.entries || !selectedAccount) return;
    
    const headers = [
      t('common.date'),
      t('accounting.journal.journalNumber'),
      t('common.description'),
      t('common.reference'),
      t('accounting.journal.debit'),
      t('accounting.journal.credit'),
      t('common.balance'),
    ];
    
    const rows = ledgerData.entries.map(entry => [
      formatDate(entry.date),
      entry.journal_number || '',
      entry.description,
      entry.reference || '',
      entry.debit || '',
      entry.credit || '',
      entry.balance,
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ledger_${selectedAccount.code}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('reports.accountLedger.title')}</h1>
          <p className="text-muted-foreground">{t('reports.accountLedger.description')}</p>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('reports.accountLedger.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>{t('reports.accountLedger.selectAccount')}</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.accountLedger.selectAccountPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                      <div key={type}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          {t(`accounting.accountTypes.${type}`)}
                        </div>
                        {typeAccounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.code} - {getAccountName(account)}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('reports.accountLedger.fromDate')}</Label>
                <DatePicker value={startDate} onChange={setStartDate} />
              </div>
              
              <div className="space-y-2">
                <Label>{t('reports.accountLedger.toDate')}</Label>
                <DatePicker value={endDate} onChange={setEndDate} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Summary */}
        {selectedAccount && ledgerData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">{t('reports.accountLedger.openingBalance')}</div>
                <div className="text-2xl font-bold">{formatCurrency(ledgerData.opening_balance || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  {t('accounting.journal.totalDebit')}
                </div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.debit)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  {t('accounting.journal.totalCredit')}
                </div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.credit)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">{t('reports.accountLedger.closingBalance')}</div>
                <div className={`text-2xl font-bold ${totals.closing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.closing)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ledger Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedAccount 
                  ? `${t('reports.accountLedger.ledgerFor')} ${selectedAccount.code} - ${getAccountName(selectedAccount)}`
                  : t('reports.accountLedger.ledgerEntries')
                }
              </CardTitle>
              {ledgerData?.entries && (
                <CardDescription>
                  {t('reports.accountLedger.entriesCount', { count: ledgerData.entries.length })}
                </CardDescription>
              )}
            </div>
            {selectedAccount && ledgerData?.entries && ledgerData.entries.length > 0 && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 me-2" />
                {t('common.export')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!selectedAccountId ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('reports.accountLedger.selectAccountPrompt')}</p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !ledgerData?.entries || ledgerData.entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('reports.accountLedger.noEntries')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('accounting.journal.journalNumber')}</TableHead>
                      <TableHead className="min-w-[200px]">{t('common.description')}</TableHead>
                      <TableHead>{t('common.reference')}</TableHead>
                      <TableHead className="text-end">{t('accounting.journal.debit')}</TableHead>
                      <TableHead className="text-end">{t('accounting.journal.credit')}</TableHead>
                      <TableHead className="text-end">{t('common.balance')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Opening Balance Row */}
                    <TableRow className="bg-muted/30 font-medium">
                      <TableCell>{startDate ? formatDate(startDate.toISOString()) : '-'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{t('reports.accountLedger.openingBalance')}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-end">-</TableCell>
                      <TableCell className="text-end">-</TableCell>
                      <TableCell className="text-end font-mono font-bold">
                        {formatCurrency(ledgerData.opening_balance || 0)}
                      </TableCell>
                    </TableRow>
                    
                    {/* Entries */}
                    {ledgerData.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.date)}</TableCell>
                        <TableCell>
                          {entry.journal_number && (
                            <Badge variant="outline">{entry.journal_number}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.reference || '-'}</TableCell>
                        <TableCell className="text-end font-mono">
                          {entry.debit ? (
                            <span className="text-green-600">{formatCurrency(entry.debit)}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-end font-mono">
                          {entry.credit ? (
                            <span className="text-red-600">{formatCurrency(entry.credit)}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className={`text-end font-mono font-medium ${entry.balance >= 0 ? '' : 'text-red-600'}`}>
                          {formatCurrency(entry.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Closing Balance Row */}
                    <TableRow className="bg-muted/30 font-bold border-t-2">
                      <TableCell>{endDate ? formatDate(endDate.toISOString()) : '-'}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{t('reports.accountLedger.closingBalance')}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell className="text-end font-mono text-green-600">
                        {formatCurrency(totals.debit)}
                      </TableCell>
                      <TableCell className="text-end font-mono text-red-600">
                        {formatCurrency(totals.credit)}
                      </TableCell>
                      <TableCell className={`text-end font-mono ${totals.closing >= 0 ? '' : 'text-red-600'}`}>
                        {formatCurrency(totals.closing)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
