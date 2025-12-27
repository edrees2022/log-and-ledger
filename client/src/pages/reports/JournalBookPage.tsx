import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Download, Search, Calendar, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

interface JournalEntry {
  id: string;
  journal_number: string;
  date: string;
  description: string;
  reference?: string;
  source_type?: string;
  source_id?: string;
  total_amount: string;
  lines: JournalLine[];
}

interface JournalLine {
  id: string;
  account_id: string;
  account_code: string;
  account_name: string;
  account_name_ar?: string;
  description?: string;
  debit: string;
  credit: string;
}

export default function JournalBookPage() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  
  // Filters
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Last month
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Fetch journal entries
  const { data: journalEntries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journals', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());
      params.append('include_lines', 'true');
      const res = await apiRequest('GET', `/api/journals?${params.toString()}`);
      return res.json();
    },
  });

  // Get account name based on language
  const getAccountName = (line: JournalLine) => {
    if (i18n.language === 'ar' && line.account_name_ar) {
      return line.account_name_ar;
    }
    return line.account_name;
  };

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(num || 0);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter entries by source type
  const filteredEntries = useMemo(() => {
    if (sourceFilter === 'all') return journalEntries;
    return journalEntries.filter(entry => entry.source_type === sourceFilter);
  }, [journalEntries, sourceFilter]);

  // Calculate totals
  const totals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    filteredEntries.forEach(entry => {
      entry.lines?.forEach(line => {
        totalDebit += parseFloat(line.debit || '0');
        totalCredit += parseFloat(line.credit || '0');
      });
    });
    return { debit: totalDebit, credit: totalCredit };
  }, [filteredEntries]);

  // Get source type badge color
  const getSourceTypeBadge = (sourceType?: string) => {
    const colors: Record<string, string> = {
      invoice: 'bg-green-100 text-green-800',
      bill: 'bg-orange-100 text-orange-800',
      payment: 'bg-blue-100 text-blue-800',
      receipt: 'bg-purple-100 text-purple-800',
      expense: 'bg-red-100 text-red-800',
      manual: 'bg-gray-100 text-gray-800',
    };
    return colors[sourceType || 'manual'] || 'bg-gray-100 text-gray-800';
  };

  // Get source type label
  const getSourceTypeLabel = (sourceType?: string) => {
    const labels: Record<string, string> = {
      invoice: t('common.invoice'),
      bill: t('common.bill'),
      payment: t('common.payment'),
      receipt: t('common.receipt'),
      expense: t('common.expense'),
      manual: t('accounting.journal.manual'),
    };
    return labels[sourceType || 'manual'] || sourceType || t('accounting.journal.manual');
  };

  // Export to CSV
  const handleExport = () => {
    if (!filteredEntries || filteredEntries.length === 0) return;
    
    const headers = [
      t('accounting.journal.journalNumber'),
      t('common.date'),
      t('common.description'),
      t('common.reference'),
      t('common.type'),
      t('accounting.accounts.account'),
      t('accounting.journal.debit'),
      t('accounting.journal.credit'),
    ];
    
    const rows: any[] = [];
    filteredEntries.forEach(entry => {
      entry.lines?.forEach((line, index) => {
        rows.push([
          index === 0 ? entry.journal_number : '',
          index === 0 ? formatDate(entry.date) : '',
          index === 0 ? entry.description : '',
          index === 0 ? (entry.reference || '') : '',
          index === 0 ? getSourceTypeLabel(entry.source_type) : '',
          `${line.account_code} - ${getAccountName(line)}`,
          line.debit || '',
          line.credit || '',
        ]);
      });
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `journal_book_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('reports.journalBook.title')}</h1>
          <p className="text-muted-foreground">{t('reports.journalBook.description')}</p>
        </div>
        
        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('reports.journalBook.filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{t('reports.journalBook.fromDate')}</Label>
                <DatePicker value={startDate} onChange={setStartDate} />
              </div>
              
              <div className="space-y-2">
                <Label>{t('reports.journalBook.toDate')}</Label>
                <DatePicker value={endDate} onChange={setEndDate} />
              </div>
              
              <div className="space-y-2">
                <Label>{t('reports.journalBook.sourceType')}</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    <SelectItem value="invoice">{t('common.invoice')}</SelectItem>
                    <SelectItem value="bill">{t('common.bill')}</SelectItem>
                    <SelectItem value="payment">{t('common.payment')}</SelectItem>
                    <SelectItem value="receipt">{t('common.receipt')}</SelectItem>
                    <SelectItem value="expense">{t('common.expense')}</SelectItem>
                    <SelectItem value="manual">{t('accounting.journal.manual')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={handleExport} disabled={filteredEntries.length === 0}>
                  <Download className="h-4 w-4 me-2" />
                  {t('common.export')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">{t('reports.journalBook.totalEntries')}</div>
              <div className="text-2xl font-bold">{filteredEntries.length}</div>
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
        </div>

        {/* Journal Entries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('reports.journalBook.entries')}
            </CardTitle>
            <CardDescription>
              {t('reports.journalBook.entriesCount', { count: filteredEntries.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('reports.journalBook.noEntries')}</p>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-2">
                {filteredEntries.map((entry) => (
                  <AccordionItem key={entry.id} value={entry.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center justify-between w-full pe-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(entry.date)}</span>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {entry.journal_number}
                          </Badge>
                          <Badge className={getSourceTypeBadge(entry.source_type)}>
                            {getSourceTypeLabel(entry.source_type)}
                          </Badge>
                        </div>
                        <div className="text-end">
                          <div className="font-medium">{formatCurrency(entry.total_amount)}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {entry.description}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-2 pb-4">
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {entry.description}
                            {entry.reference && (
                              <span className="ms-2 text-xs">
                                ({t('common.reference')}: {entry.reference})
                              </span>
                            )}
                          </p>
                        )}
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('accounting.accounts.account')}</TableHead>
                              <TableHead>{t('common.description')}</TableHead>
                              <TableHead className="text-end">{t('accounting.journal.debit')}</TableHead>
                              <TableHead className="text-end">{t('accounting.journal.credit')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entry.lines?.map((line) => (
                              <TableRow key={line.id}>
                                <TableCell className="font-medium">
                                  <span className="font-mono text-xs text-muted-foreground me-2">
                                    {line.account_code}
                                  </span>
                                  {getAccountName(line)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {line.description || '-'}
                                </TableCell>
                                <TableCell className="text-end font-mono">
                                  {parseFloat(line.debit || '0') > 0 ? (
                                    <span className="text-green-600">{formatCurrency(line.debit)}</span>
                                  ) : '-'}
                                </TableCell>
                                <TableCell className="text-end font-mono">
                                  {parseFloat(line.credit || '0') > 0 ? (
                                    <span className="text-red-600">{formatCurrency(line.credit)}</span>
                                  ) : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
