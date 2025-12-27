import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearch } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency, useCurrentCompany } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { 
  Loader2, 
  Download, 
  Users,
  FileText,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Mail,
  Phone,
  Building,
  Printer,
  ArrowLeft,
  FileDown
} from 'lucide-react';
import { useLocation } from 'wouter';
import PageContainer from '@/components/layout/PageContainer';
import { downloadContactStatementPDF, type ContactStatementPDFData } from '@/utils/contactStatementPDF';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: string; // customer, supplier, both
}

interface StatementEntry {
  id: string;
  date: string;
  documentType: string;
  documentNumber: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface ContactStatement {
  contact: Contact;
  startDate: string;
  endDate: string;
  openingBalance: number;
  entries: StatementEntry[];
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
}

export default function ContactStatementPage() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  const currentCompany = useCurrentCompany();
  const { toast } = useToast();
  const searchString = useSearch();
  const [, navigate] = useLocation();
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  // Parse URL params
  const urlParams = new URLSearchParams(searchString);
  const contactFromUrl = urlParams.get('contactId') || urlParams.get('contact') || '';
  
  // Fetch contacts
  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ['/api/contacts'],
  });

  // Auto-detect contact type from URL contactId
  const contactFromUrlData = useMemo(() => {
    if (!contactFromUrl || contacts.length === 0) return null;
    return contacts.find(c => c.id === contactFromUrl) || null;
  }, [contacts, contactFromUrl]);

  // Determine initial contact type based on URL contact
  const initialContactType = useMemo<'customer' | 'supplier'>(() => {
    if (contactFromUrlData) {
      return contactFromUrlData.type === 'supplier' ? 'supplier' : 'customer';
    }
    return 'customer';
  }, [contactFromUrlData]);

  // State
  const [contactType, setContactType] = useState<'customer' | 'supplier'>(initialContactType);
  const [selectedContactId, setSelectedContactId] = useState<string>(contactFromUrl);
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(0, 1); // January 1st of current year
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Update contact type when URL contact is detected
  useEffect(() => {
    if (contactFromUrlData) {
      setContactType(contactFromUrlData.type === 'supplier' ? 'supplier' : 'customer');
    }
  }, [contactFromUrlData]);

  // Filter contacts by type
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.type === contactType || c.type === 'both'
    );
  }, [contacts, contactType]);

  // Fetch contact statement
  const { data: statement, isLoading, refetch } = useQuery<ContactStatement>({
    queryKey: ['/api/reports/contact-statement', selectedContactId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const res = await apiRequest('GET', `/api/reports/contact-statement/${selectedContactId}?${params.toString()}`);
      return res.json();
    },
    enabled: !!selectedContactId && !!startDate && !!endDate,
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language);
  };

  // Get document type badge
  const getDocumentTypeBadge = (type: string) => {
    const types: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      invoice: { label: t('reports.contactStatement.invoice'), variant: 'default' },
      bill: { label: t('reports.contactStatement.bill'), variant: 'secondary' },
      payment: { label: t('reports.contactStatement.payment'), variant: 'outline' },
      receipt: { label: t('reports.contactStatement.receipt'), variant: 'outline' },
      credit_note: { label: t('reports.contactStatement.creditNote'), variant: 'destructive' },
      debit_note: { label: t('reports.contactStatement.debitNote'), variant: 'destructive' },
      opening: { label: t('reports.contactStatement.openingBalance'), variant: 'secondary' },
    };
    return types[type] || { label: type, variant: 'outline' as const };
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!statement) return;

    const headers = [
      t('reports.contactStatement.date'),
      t('reports.contactStatement.type'),
      t('reports.contactStatement.documentNumber'),
      t('reports.contactStatement.description'),
      t('common.debit'),
      t('common.credit'),
      t('reports.contactStatement.balance'),
    ];
    
    const rows: string[][] = [];
    
    // Opening balance row
    rows.push([
      formatDate(statement.startDate),
      t('reports.contactStatement.openingBalance'),
      '-',
      t('reports.contactStatement.openingBalance'),
      statement.openingBalance >= 0 ? statement.openingBalance.toFixed(2) : '',
      statement.openingBalance < 0 ? Math.abs(statement.openingBalance).toFixed(2) : '',
      statement.openingBalance.toFixed(2),
    ]);
    
    // Entries
    statement.entries.forEach(entry => {
      rows.push([
        formatDate(entry.date),
        getDocumentTypeBadge(entry.documentType).label,
        entry.documentNumber,
        entry.description || '',
        entry.debit > 0 ? entry.debit.toFixed(2) : '',
        entry.credit > 0 ? entry.credit.toFixed(2) : '',
        entry.balance.toFixed(2),
      ]);
    });

    // Totals
    rows.push([
      '',
      '',
      '',
      t('common.total'),
      statement.totalDebits.toFixed(2),
      statement.totalCredits.toFixed(2),
      statement.closingBalance.toFixed(2),
    ]);

    const csvContent = [
      `${t('reports.contactStatement.title')}: ${statement.contact.name}`,
      `${t('reports.contactStatement.period')}: ${formatDate(statement.startDate)} - ${formatDate(statement.endDate)}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statement-${statement.contact.name}-${startDate?.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleExportPDF = async () => {
    if (!statement) return;
    
    setIsExportingPDF(true);
    try {
      const pdfData: ContactStatementPDFData = {
        contact: {
          name: statement.contact.name,
          email: statement.contact.email,
          phone: statement.contact.phone,
          type: statement.contact.type,
        },
        company: currentCompany ? {
          name: currentCompany.name,
        } : undefined,
        startDate: statement.startDate,
        endDate: statement.endDate,
        openingBalance: statement.openingBalance,
        closingBalance: statement.closingBalance,
        totalDebits: statement.totalDebits,
        totalCredits: statement.totalCredits,
        entries: statement.entries,
        currency: currency || 'USD',
      };
      
      await downloadContactStatementPDF(pdfData, i18n.language);
      
      toast({
        title: t('common.success'),
        description: t('reports.exportSuccess', { defaultValue: 'تم تصدير التقرير بنجاح' }),
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: t('common.error'),
        description: t('reports.exportError', { defaultValue: 'فشل في تصدير PDF' }),
        variant: 'destructive',
      });
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Print statement
  const handlePrint = () => {
    window.print();
  };

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate('/contacts')}
              title={t('common.back')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t('reports.contactStatement.title')}</h1>
              <p className="text-muted-foreground mt-1">
                {t('reports.contactStatement.description')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPDF} disabled={!statement || isExportingPDF}>
              {isExportingPDF ? (
                <Loader2 className="h-4 w-4 me-2 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4 me-2" />
              )}
              PDF
            </Button>
            <Button variant="outline" onClick={handleExportCSV} disabled={!statement}>
              <Download className="h-4 w-4 me-2" />
              CSV
            </Button>
            <Button variant="outline" onClick={handlePrint} disabled={!statement}>
              <Printer className="h-4 w-4 me-2" />
              {t('common.print')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.contactStatement.filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {/* Contact Type */}
              <div className="space-y-2">
                <Label>{t('reports.contactStatement.contactType')}</Label>
                <Tabs value={contactType} onValueChange={(v) => {
                  setContactType(v as 'customer' | 'supplier');
                  setSelectedContactId('');
                }}>
                  <TabsList className="w-full">
                    <TabsTrigger value="customer" className="flex-1">
                      <ArrowUpRight className="h-4 w-4 me-1" />
                      {t('reports.contactStatement.customer')}
                    </TabsTrigger>
                    <TabsTrigger value="supplier" className="flex-1">
                      <ArrowDownRight className="h-4 w-4 me-1" />
                      {t('reports.contactStatement.supplier')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Contact Selection */}
              <div className="space-y-2">
                <Label>{t('reports.contactStatement.selectContact')}</Label>
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.contactStatement.selectContact')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>{t('reports.contactStatement.startDate')}</Label>
                <DatePicker value={startDate} onChange={setStartDate} />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>{t('reports.contactStatement.endDate')}</Label>
                <DatePicker value={endDate} onChange={setEndDate} />
              </div>

              {/* Generate Button */}
              <div className="flex items-end">
                <Button 
                  onClick={() => refetch()} 
                  disabled={isLoading || !selectedContactId}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 me-2" />
                  )}
                  {t('reports.contactStatement.generate')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statement Content */}
        {statement && (
          <>
            {/* Contact Info Header - Printable */}
            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Building className="h-5 w-5" />
                      {statement.contact.name}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap gap-4 mt-2">
                      {statement.contact.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {statement.contact.email}
                        </span>
                      )}
                      {statement.contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {statement.contact.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-end">
                    <div className="text-sm text-muted-foreground">
                      {t('reports.contactStatement.period')}
                    </div>
                    <div className="font-medium">
                      {formatDate(statement.startDate)} - {formatDate(statement.endDate)}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4 print:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('reports.contactStatement.openingBalance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${statement.openingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(statement.openingBalance))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {statement.openingBalance >= 0 
                      ? (contactType === 'customer' ? t('reports.contactStatement.owes') : t('reports.contactStatement.owed'))
                      : (contactType === 'customer' ? t('reports.contactStatement.credit') : t('reports.contactStatement.prepaid'))
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('reports.contactStatement.totalDebits')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(statement.totalDebits)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contactType === 'customer' 
                      ? t('reports.contactStatement.invoiced')
                      : t('reports.contactStatement.paid')
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('reports.contactStatement.totalCredits')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(statement.totalCredits)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contactType === 'customer'
                      ? t('reports.contactStatement.received')
                      : t('reports.contactStatement.billed')
                    }
                  </div>
                </CardContent>
              </Card>

              <Card className={statement.closingBalance !== 0 ? 'border-2 border-primary' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t('reports.contactStatement.closingBalance')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${statement.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(statement.closingBalance))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {statement.closingBalance >= 0 
                      ? (contactType === 'customer' ? t('reports.contactStatement.owes') : t('reports.contactStatement.owed'))
                      : (contactType === 'customer' ? t('reports.contactStatement.credit') : t('reports.contactStatement.prepaid'))
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statement Table */}
            <Card className="print:shadow-none print:border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('reports.contactStatement.transactions')}
                </CardTitle>
                <CardDescription>
                  {statement.entries.length} {t('reports.contactStatement.entries')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : statement.entries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('reports.contactStatement.noTransactions')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[120px]">{t('reports.contactStatement.date')}</TableHead>
                          <TableHead className="w-[120px]">{t('reports.contactStatement.type')}</TableHead>
                          <TableHead className="w-[140px]">{t('reports.contactStatement.documentNumber')}</TableHead>
                          <TableHead>{t('reports.contactStatement.description')}</TableHead>
                          <TableHead className="text-end w-[130px]">{t('common.debit')}</TableHead>
                          <TableHead className="text-end w-[130px]">{t('common.credit')}</TableHead>
                          <TableHead className="text-end w-[140px]">{t('reports.contactStatement.balance')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Opening Balance Row */}
                        <TableRow className="bg-muted/30 font-medium">
                          <TableCell>{formatDate(statement.startDate)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {t('reports.contactStatement.openingBalance')}
                            </Badge>
                          </TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>{t('reports.contactStatement.balanceBroughtForward')}</TableCell>
                          <TableCell className="text-end font-mono">
                            {statement.openingBalance >= 0 ? formatCurrency(statement.openingBalance) : '-'}
                          </TableCell>
                          <TableCell className="text-end font-mono">
                            {statement.openingBalance < 0 ? formatCurrency(Math.abs(statement.openingBalance)) : '-'}
                          </TableCell>
                          <TableCell className="text-end font-mono font-semibold">
                            {formatCurrency(statement.openingBalance)}
                          </TableCell>
                        </TableRow>

                        {/* Transaction Rows */}
                        {statement.entries.map((entry) => {
                          const typeInfo = getDocumentTypeBadge(entry.documentType);
                          return (
                            <TableRow key={entry.id} className="hover:bg-muted/50">
                              <TableCell>{formatDate(entry.date)}</TableCell>
                              <TableCell>
                                <Badge variant={typeInfo.variant}>
                                  {typeInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono">{entry.documentNumber}</TableCell>
                              <TableCell>{entry.description || '-'}</TableCell>
                              <TableCell className="text-end font-mono">
                                {entry.debit > 0 ? (
                                  <span className="text-green-600">{formatCurrency(entry.debit)}</span>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="text-end font-mono">
                                {entry.credit > 0 ? (
                                  <span className="text-red-600">{formatCurrency(entry.credit)}</span>
                                ) : '-'}
                              </TableCell>
                              <TableCell className="text-end font-mono font-semibold">
                                <span className={entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(Math.abs(entry.balance))}
                                </span>
                                <span className="text-xs text-muted-foreground ms-1">
                                  {entry.balance >= 0 ? 'Dr' : 'Cr'}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {/* Closing Balance Row */}
                        <TableRow className="bg-primary/10 font-bold border-t-2">
                          <TableCell colSpan={4} className="text-end">
                            {t('reports.contactStatement.closingBalance')}
                          </TableCell>
                          <TableCell className="text-end font-mono text-green-600">
                            {formatCurrency(statement.totalDebits)}
                          </TableCell>
                          <TableCell className="text-end font-mono text-red-600">
                            {formatCurrency(statement.totalCredits)}
                          </TableCell>
                          <TableCell className="text-end font-mono">
                            <span className={statement.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(Math.abs(statement.closingBalance))}
                            </span>
                            <span className="text-xs text-muted-foreground ms-1">
                              {statement.closingBalance >= 0 ? 'Dr' : 'Cr'}
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!statement && !isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">{t('reports.contactStatement.selectContactPrompt')}</p>
                <p className="text-sm mt-1">{t('reports.contactStatement.selectContactDescription')}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
