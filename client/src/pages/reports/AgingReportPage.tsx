import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Download, 
  Clock, 
  AlertTriangle, 
  AlertCircle,
  Users,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Mail
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

interface AgingBucket {
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
}

interface AgingLineItem {
  id: string;
  documentNumber: string;
  contactId: string;
  contactName: string;
  date: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  balanceDue: number;
  daysOverdue: number;
  bucket: 'current' | '1-30' | '31-60' | '61-90' | 'over90';
  currency: string;
}

interface AgingContactSummary {
  contactId: string;
  contactName: string;
  contactEmail?: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
  items: AgingLineItem[];
}

interface AgingReport {
  type: 'receivable' | 'payable';
  asOfDate: string;
  summary: AgingBucket;
  byContact: AgingContactSummary[];
}

export default function AgingReportPage() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  
  // State
  const [reportType, setReportType] = useState<'receivable' | 'payable'>('receivable');
  const [asOfDate, setAsOfDate] = useState<Date | undefined>(new Date());

  // Fetch aging report
  const { data: report, isLoading, refetch } = useQuery<AgingReport>({
    queryKey: ['/api/reports/aging', reportType, asOfDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('type', reportType);
      if (asOfDate) params.append('asOfDate', asOfDate.toISOString());
      const res = await apiRequest('GET', `/api/reports/aging?${params.toString()}`);
      return res.json();
    },
    enabled: !!asOfDate,
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

  // Get bucket badge color
  const getBucketBadge = (bucket: string, amount: number) => {
    if (amount === 0) return null;
    
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      'current': { variant: 'default', label: t('reports.aging.current') },
      '1-30': { variant: 'secondary', label: '1-30 ' + t('reports.aging.days') },
      '31-60': { variant: 'outline', label: '31-60 ' + t('reports.aging.days') },
      '61-90': { variant: 'destructive', label: '61-90 ' + t('reports.aging.days') },
      'over90': { variant: 'destructive', label: '90+ ' + t('reports.aging.days') },
    };
    
    return variants[bucket] || { variant: 'outline' as const, label: bucket };
  };

  // Calculate percentages for progress bars
  const getPercentage = (amount: number) => {
    if (!report?.summary.total || report.summary.total === 0) return 0;
    return Math.round((amount / report.summary.total) * 100);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!report) return;

    const headers = [
      t('reports.aging.contact'),
      t('reports.aging.documentNumber'),
      t('reports.aging.date'),
      t('reports.aging.dueDate'),
      t('reports.aging.daysOverdue'),
      t('reports.aging.total'),
      t('reports.aging.paid'),
      t('reports.aging.balanceDue'),
      t('reports.aging.bucket'),
    ];
    
    const rows: string[][] = [];
    report.byContact.forEach(contact => {
      contact.items.forEach(item => {
        rows.push([
          item.contactName,
          item.documentNumber,
          formatDate(item.date),
          formatDate(item.dueDate),
          item.daysOverdue.toString(),
          item.total.toFixed(2),
          item.paidAmount.toFixed(2),
          item.balanceDue.toFixed(2),
          item.bucket,
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aging-${reportType}-${asOfDate?.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('reports.aging.title')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('reports.aging.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} disabled={!report || report.byContact.length === 0}>
              <Download className="h-4 w-4 me-2" />
              {t('common.export')}
            </Button>
          </div>
        </div>

        {/* Report Type Tabs & Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <Tabs value={reportType} onValueChange={(v) => setReportType(v as 'receivable' | 'payable')}>
                <TabsList>
                  <TabsTrigger value="receivable" className="gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    {t('reports.aging.receivables')}
                  </TabsTrigger>
                  <TabsTrigger value="payable" className="gap-2">
                    <ArrowDownRight className="h-4 w-4" />
                    {t('reports.aging.payables')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-3 items-end">
                <div className="space-y-2">
                  <Label>{t('reports.aging.asOfDate')}</Label>
                  <DatePicker
                    value={asOfDate}
                    onChange={setAsOfDate}
                  />
                </div>
                <Button onClick={() => refetch()} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 me-2" />
                  )}
                  {t('reports.aging.refresh')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {report && (
          <div className="grid gap-4 md:grid-cols-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('reports.aging.total')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(report.summary.total)}</div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">{t('reports.aging.current')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">{formatCurrency(report.summary.current)}</div>
                <Progress value={getPercentage(report.summary.current)} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{getPercentage(report.summary.current)}%</div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 dark:border-yellow-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-yellow-600">1-30 {t('reports.aging.days')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-yellow-600">{formatCurrency(report.summary.days1to30)}</div>
                <Progress value={getPercentage(report.summary.days1to30)} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{getPercentage(report.summary.days1to30)}%</div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-600">31-60 {t('reports.aging.days')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-600">{formatCurrency(report.summary.days31to60)}</div>
                <Progress value={getPercentage(report.summary.days31to60)} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{getPercentage(report.summary.days31to60)}%</div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-500">61-90 {t('reports.aging.days')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-500">{formatCurrency(report.summary.days61to90)}</div>
                <Progress value={getPercentage(report.summary.days61to90)} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{getPercentage(report.summary.days61to90)}%</div>
              </CardContent>
            </Card>
            
            <Card className="border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  90+ {t('reports.aging.days')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">{formatCurrency(report.summary.over90)}</div>
                <Progress value={getPercentage(report.summary.over90)} className="h-2 mt-2" />
                <div className="text-xs text-muted-foreground mt-1">{getPercentage(report.summary.over90)}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detail by Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {reportType === 'receivable' 
                ? t('reports.aging.byCustomer') 
                : t('reports.aging.bySupplier')
              }
            </CardTitle>
            <CardDescription>
              {report?.byContact.length || 0} {reportType === 'receivable' 
                ? t('reports.aging.customersWithBalance')
                : t('reports.aging.suppliersWithBalance')
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !report || report.byContact.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('reports.aging.noData')}</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {report.byContact.map((contact) => (
                  <AccordionItem key={contact.contactId} value={contact.contactId}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pe-4">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{contact.contactName}</div>
                          {contact.contactEmail && (
                            <Badge variant="outline" className="gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              {contact.contactEmail}
                            </Badge>
                          )}
                          {contact.over90 > 0 && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {t('reports.aging.overdue90')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-muted-foreground">
                            {contact.items.length} {t('reports.aging.items')}
                          </div>
                          <div className="font-bold text-lg">
                            {formatCurrency(contact.total)}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {/* Contact Summary Bar */}
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-5 gap-2 text-sm">
                          <div className="text-center">
                            <div className="text-green-600 font-medium">{formatCurrency(contact.current)}</div>
                            <div className="text-xs text-muted-foreground">{t('reports.aging.current')}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-yellow-600 font-medium">{formatCurrency(contact.days1to30)}</div>
                            <div className="text-xs text-muted-foreground">1-30</div>
                          </div>
                          <div className="text-center">
                            <div className="text-orange-600 font-medium">{formatCurrency(contact.days31to60)}</div>
                            <div className="text-xs text-muted-foreground">31-60</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-500 font-medium">{formatCurrency(contact.days61to90)}</div>
                            <div className="text-xs text-muted-foreground">61-90</div>
                          </div>
                          <div className="text-center">
                            <div className="text-red-600 font-medium">{formatCurrency(contact.over90)}</div>
                            <div className="text-xs text-muted-foreground">90+</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Items Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('reports.aging.documentNumber')}</TableHead>
                            <TableHead>{t('reports.aging.date')}</TableHead>
                            <TableHead>{t('reports.aging.dueDate')}</TableHead>
                            <TableHead className="text-center">{t('reports.aging.daysOverdue')}</TableHead>
                            <TableHead className="text-end">{t('reports.aging.total')}</TableHead>
                            <TableHead className="text-end">{t('reports.aging.paid')}</TableHead>
                            <TableHead className="text-end">{t('reports.aging.balanceDue')}</TableHead>
                            <TableHead>{t('reports.aging.bucket')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contact.items.map((item) => {
                            const bucketInfo = getBucketBadge(item.bucket, item.balanceDue);
                            return (
                              <TableRow key={item.id}>
                                <TableCell className="font-mono">{item.documentNumber}</TableCell>
                                <TableCell>{formatDate(item.date)}</TableCell>
                                <TableCell>{formatDate(item.dueDate)}</TableCell>
                                <TableCell className="text-center">
                                  <Badge 
                                    variant={item.daysOverdue > 0 ? 'destructive' : 'outline'}
                                    className="min-w-[60px] justify-center"
                                  >
                                    {item.daysOverdue > 0 ? item.daysOverdue : '-'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-end font-mono">{formatCurrency(item.total)}</TableCell>
                                <TableCell className="text-end font-mono text-green-600">
                                  {item.paidAmount > 0 ? formatCurrency(item.paidAmount) : '-'}
                                </TableCell>
                                <TableCell className="text-end font-mono font-semibold">
                                  {formatCurrency(item.balanceDue)}
                                </TableCell>
                                <TableCell>
                                  {bucketInfo && (
                                    <Badge variant={bucketInfo.variant}>{bucketInfo.label}</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
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
