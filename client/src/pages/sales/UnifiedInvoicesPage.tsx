import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InvoiceFormDialog } from '@/components/InvoiceFormDialog';
import { ViewInvoiceDialog } from '@/components/ViewInvoiceDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  DollarSign,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Pause,
  Play,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInvoicePDF, type InvoicePDFData } from '@/utils/invoicePDF';

const invoiceStatusConfig = {
  draft: { icon: Edit, color: 'secondary' },
  sent: { icon: Send, color: 'default' },
  paid: { icon: CheckCircle, color: 'success' },
  partially_paid: { icon: Clock, color: 'warning' },
  overdue: { icon: AlertCircle, color: 'destructive' },
  cancelled: { icon: XCircle, color: 'secondary' },
};

const recurringStatusConfig = {
  active: { label: 'Active', icon: CheckCircle, color: 'default' },
  paused: { label: 'Paused', icon: Pause, color: 'secondary' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'default' },
};

export default function UnifiedInvoicesPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  // Main tabs: invoices | recurring
  const [mainTab, setMainTab] = useState<'invoices' | 'recurring'>('invoices');
  
  // Invoice filter tabs
  const [invoiceTab, setInvoiceTab] = useState('all');
  const [recurringTab, setRecurringTab] = useState('all');
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialogs
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showEditInvoice, setShowEditInvoice] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [showViewInvoice, setShowViewInvoice] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [showNewRecurring, setShowNewRecurring] = useState(false);
  const [allocOpen, setAllocOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Helper to get customer name
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || '—';
  };

  // Helper to format date safely
  const formatDate = (dateValue: any) => {
    if (!dateValue) return '—';
    try {
      // Handle various date formats from server
      let date: Date;
      if (typeof dateValue === 'string') {
        // Handle ISO string or other formats
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return '—';
      }
      
      if (isNaN(date.getTime())) return '—';
      
      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '—';
    }
  };

  // ==================== Queries ====================
  
  // Invoices
  const { data: invoices = [], isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ['/api/sales/invoices'],
    select: (data: any[]) => data || []
  });

  // Company settings for base currency
  const { data: companySettings } = useQuery<any>({ queryKey: ['/api/settings/company'] });
  const baseCurrency = companySettings?.base_currency || 'AED';

  // Recurring invoices
  const { data: recurringTemplates = [] } = useQuery<any[]>({
    queryKey: ['/api/sales/recurring-invoices'],
  });

  // Contacts (customers)
  const { data: contactsData = [] } = useQuery<any[]>({ queryKey: ['/api/contacts'] });
  const customers = useMemo(() => (
    (contactsData || [])
      .filter((contact: any) => contact?.type === 'customer' || contact?.type === 'both')
      .map((c: any) => ({ id: c.id, name: c.name, email: c.email || '' }))
  ), [contactsData]);

  // Allocations for selected invoice
  const { data: allocations = [], isLoading: allocLoading } = useQuery({
    queryKey: ['/api/sales/invoices', selectedInvoice?.id || '', 'allocations'],
    enabled: !!selectedInvoice?.id && allocOpen,
    select: (rows: any[]) => rows || [],
  });

  // ==================== Mutations ====================
  
  const deleteMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return apiRequest('DELETE', `/api/sales/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      toast({ title: t('common.deleteSuccess'), description: t('sales.invoices.invoiceDeletedSuccess') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    },
  });

  const unmatchMutation = useMutation({
    mutationFn: async (allocationId: string) => {
      return apiRequest('DELETE', `/api/banking/reconciliation/allocations/${allocationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      toast({ title: t('common.success'), description: t('banking.unmatchedSuccessfully') });
    },
  });

  // ==================== Helpers ====================

  const formatCurrency = (amount: number, curr?: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: curr || 'USD',
    }).format(amount);
  };

  // Download PDF for an invoice
  const handleDownloadPDF = async (invoice: any) => {
    try {
      // Fetch full invoice details with lines
      const response = await apiRequest('GET', `/api/sales/invoices/${invoice.id}`);
      const fullInvoice: any = await response.json();
      
      // Debug: log the full invoice data
      console.log('Full invoice data for PDF:', JSON.stringify(fullInvoice, null, 2));
      
      // Format dates for filename
      const invoiceDate = fullInvoice.date ? new Date(fullInvoice.date) : new Date();
      const dateStr = invoiceDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const invoiceNum = fullInvoice.invoice_number || invoice.invoice_number || invoice.id;
      
      const pdfData: InvoicePDFData = {
        invoiceNumber: invoiceNum,
        issueDate: fullInvoice.date ? new Date(fullInvoice.date).toLocaleDateString(i18n.language) : '',
        dueDate: fullInvoice.due_date ? new Date(fullInvoice.due_date).toLocaleDateString(i18n.language) : '',
        status: fullInvoice.status,
        company: {
          name: companySettings?.company_name || companySettings?.name || 'Company',
          email: companySettings?.email,
          phone: companySettings?.phone,
          taxNumber: companySettings?.tax_number,
        },
        customer: {
          name: fullInvoice.customer_name || getCustomerName(fullInvoice.customer_id),
        },
        items: (fullInvoice.lines || []).map((line: any) => ({
          description: line.description || '',
          quantity: Number(line.quantity || 1),
          unitPrice: Number(line.unit_price || 0),
          discount: Number(line.discount_percentage || 0),
          taxRate: Number(line.tax_rate || line.tax_amount ? (Number(line.tax_amount) / Number(line.line_total || 1)) * 100 : 0),
          amount: Number(line.line_total || line.amount || 0),
        })),
        subtotal: Number(fullInvoice.subtotal || 0),
        taxTotal: Number(fullInvoice.tax_total || 0),
        total: Number(fullInvoice.total || 0),
        paidAmount: Number(fullInvoice.paid_amount || 0),
        outstanding: Math.max(0, Number(fullInvoice.total || 0) - Number(fullInvoice.paid_amount || 0)),
        currency: fullInvoice.currency || 'USD',
        // Base currency conversion
        baseCurrency: baseCurrency,
        fxRate: Number(fullInvoice.fx_rate || 1),
        totalInBaseCurrency: fullInvoice.currency !== baseCurrency && Number(fullInvoice.fx_rate) !== 1 
          ? Number(fullInvoice.total || 0) * Number(fullInvoice.fx_rate || 1)
          : undefined,
        notes: fullInvoice.notes,
      };
      
      // Debug: log the PDF data
      console.log('PDF data being generated:', JSON.stringify(pdfData, null, 2));

      // Create descriptive filename: invoice_[number]_[date].pdf
      const cleanInvoiceNum = String(invoiceNum).replace(/[^a-zA-Z0-9-]/g, '_');
      const pdfFilename = `invoice_${cleanInvoiceNum}_${dateStr}.pdf`;

      await generateInvoicePDF(pdfData, {
        language: i18n.language,
        filename: pdfFilename,
        download: true,
      });

      toast({ title: t('common.success'), description: t('sales.invoices.pdfDownloaded', { defaultValue: 'PDF downloaded' }) });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({ title: t('common.error'), description: error?.message || 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  // ==================== Filtered Data ====================

  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    switch (invoiceTab) {
      case 'draft': return invoice.status === 'draft';
      case 'sent': return invoice.status === 'sent';
      case 'paid': return invoice.status === 'paid';
      case 'overdue': return invoice.status === 'overdue';
      default: return true;
    }
  });

  const recurringInvoices = useMemo(() => {
    return (recurringTemplates || []).map((tpl: any) => {
      const data = tpl.template_data || {};
      const customer = customers.find(c => c.id === data.customer_id);
      return {
        id: tpl.id,
        template_name: tpl.template_name,
        customer_name: customer?.name || '—',
        frequency: tpl.frequency,
        next_invoice: tpl.next_run_date,
        amount: Number(data.amount || 0),
        currency: data.currency || 'USD',
        status: tpl.is_active ? 'active' : 'paused',
        invoices_sent: Number(data.invoices_sent || 0),
      };
    });
  }, [recurringTemplates, customers]);

  const filteredRecurring = recurringInvoices.filter((inv: any) => {
    const matchesSearch = 
      inv.template_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    switch (recurringTab) {
      case 'active': return inv.status === 'active';
      case 'paused': return inv.status === 'paused';
      default: return true;
    }
  });

  // Statistics - convert amounts to base currency using fx_rate
  const invoiceStats = {
    total: invoices.length,
    // Sum amounts converted to base currency: total * fx_rate
    totalAmount: invoices.reduce((sum: number, inv: any) => {
      const amount = parseFloat(inv.total || '0');
      const fxRate = parseFloat(inv.fx_rate || '1');
      return sum + (amount * fxRate);
    }, 0),
    paidAmount: invoices.reduce((sum: number, inv: any) => {
      const amount = parseFloat(inv.paid_amount || '0');
      const fxRate = parseFloat(inv.fx_rate || '1');
      return sum + (amount * fxRate);
    }, 0),
    outstanding: invoices.reduce((sum: number, inv: any) => {
      const total = parseFloat(inv.total || '0');
      const paid = parseFloat(inv.paid_amount || '0');
      const fxRate = parseFloat(inv.fx_rate || '1');
      return sum + ((total - paid) * fxRate);
    }, 0),
    draft: invoices.filter((inv: any) => inv.status === 'draft').length,
    sent: invoices.filter((inv: any) => inv.status === 'sent').length,
    paid: invoices.filter((inv: any) => inv.status === 'paid').length,
    overdue: invoices.filter((inv: any) => inv.status === 'overdue').length,
  };

  const recurringStats = {
    total: recurringInvoices.length,
    active: recurringInvoices.filter((i: any) => i.status === 'active').length,
    paused: recurringInvoices.filter((i: any) => i.status === 'paused').length,
    totalRevenue: recurringInvoices.filter((i: any) => i.status === 'active').reduce((sum: number, i: any) => sum + (Number(i.amount) || 0), 0),
  };

  const getInvoiceStatusBadge = (status: string) => {
    const config = invoiceStatusConfig[status as keyof typeof invoiceStatusConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge variant={config.color as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {t(`sales.invoices.${status}`)}
      </Badge>
    );
  };

  const getRecurringStatusBadge = (status: string) => {
    const config = recurringStatusConfig[status as keyof typeof recurringStatusConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge variant={config.color as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {t(`common.${status}`)}
      </Badge>
    );
  };

  // ==================== Render ====================

  if (invoicesLoading) {
    return (
      <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('sales.invoices.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.loading')}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('sales.invoices.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('sales.invoices.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowNewInvoice(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 me-2" />
            {t('sales.invoices.addInvoice')}
          </Button>
        </div>
      </div>

      {/* Main Tabs: Invoices | Recurring */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('sales.invoices.title')} ({invoiceStats.total})
          </TabsTrigger>
          <TabsTrigger value="recurring" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('sales.recurringInvoices.title')} ({recurringStats.total})
          </TabsTrigger>
        </TabsList>

        {/* ==================== INVOICES TAB ==================== */}
        <TabsContent value="invoices" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('sales.invoices.totalInvoices')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invoiceStats.total}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {invoiceStats.draft} {t('common.draft')}, {invoiceStats.sent} {t('common.sent')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('common.total')} {t('common.amount')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(invoiceStats.totalAmount, baseCurrency)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('sales.invoices.paidAmount')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(invoiceStats.paidAmount, baseCurrency)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('sales.invoices.outstanding')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(invoiceStats.outstanding, baseCurrency)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <Input
              placeholder={t('placeholders.searchInvoices')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Status Tabs */}
          <Tabs value={invoiceTab} onValueChange={setInvoiceTab}>
            <TabsList className="flex flex-wrap h-auto gap-2 p-2">
              <TabsTrigger value="all">{t('common.all')} ({invoiceStats.total})</TabsTrigger>
              <TabsTrigger value="draft">{t('common.draft')} ({invoiceStats.draft})</TabsTrigger>
              <TabsTrigger value="sent">{t('common.sent')} ({invoiceStats.sent})</TabsTrigger>
              <TabsTrigger value="paid">{t('common.paid')} ({invoiceStats.paid})</TabsTrigger>
              <TabsTrigger value="overdue">{t('common.overdue')} ({invoiceStats.overdue})</TabsTrigger>
            </TabsList>

            <TabsContent value={invoiceTab} className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('sales.invoices.invoiceNumber')}</TableHead>
                          <TableHead>{t('sales.invoices.customer')}</TableHead>
                          <TableHead>{t('sales.invoices.invoiceDate')}</TableHead>
                          <TableHead>{t('sales.invoices.dueDate')}</TableHead>
                          <TableHead>{t('common.amount')}</TableHead>
                          <TableHead>{t('common.status')}</TableHead>
                          <TableHead className="text-end">{t('common.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">{t('sales.invoices.noInvoicesFound')}</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredInvoices.map((invoice: any) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">
                                <button 
                                  onClick={() => { setViewInvoiceId(invoice.id); setShowViewInvoice(true); }}
                                  className="hover:underline text-primary"
                                >
                                  {invoice.invoice_number}
                                </button>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  {getCustomerName(invoice.customer_id)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDate(invoice.date)}
                              </TableCell>
                              <TableCell>
                                {formatDate(invoice.due_date)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatCurrency(parseFloat(invoice.total || '0'), invoice.currency)}
                              </TableCell>
                              <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                              <TableCell className="text-end">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setViewInvoiceId(invoice.id); setShowViewInvoice(true); }}>
                                      <Eye className="h-4 w-4 me-2" />
                                      {t('common.view')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedInvoice(invoice); setAllocOpen(true); }}>
                                      <DollarSign className="h-4 w-4 me-2" />
                                      {t('banking.allocations')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setEditInvoiceId(invoice.id); setShowEditInvoice(true); }}>
                                      <Edit className="h-4 w-4 me-2" />
                                      {t('common.edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                                      <Download className="h-4 w-4 me-2" />
                                      {t('common.downloadPDF')}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => deleteMutation.mutate(invoice.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 me-2" />
                                      {t('common.delete')}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ==================== RECURRING TAB ==================== */}
        <TabsContent value="recurring" className="space-y-6">
          {/* Add Recurring Button */}
          <div className="flex justify-end">
            <Button onClick={() => setShowNewRecurring(true)}>
              <Plus className="h-4 w-4 me-2" />
              {t('sales.recurringInvoices.addRecurringInvoice')}
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('common.total')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recurringStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('common.active')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{recurringStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('common.paused')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">{recurringStats.paused}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t('sales.recurringInvoices.monthlyRevenue')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(recurringStats.totalRevenue, baseCurrency)}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recurring Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('sales.recurringInvoices.templateName')}</TableHead>
                      <TableHead>{t('common.customer')}</TableHead>
                      <TableHead>{t('sales.recurringInvoices.frequency')}</TableHead>
                      <TableHead>{t('sales.recurringInvoices.nextInvoice')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecurring.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">{t('sales.recurringInvoices.noTemplatesFound')}</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecurring.map((template: any) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.template_name}</TableCell>
                          <TableCell>{template.customer_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {t(`sales.recurringInvoices.${template.frequency}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {template.next_invoice ? new Date(template.next_invoice).toLocaleDateString(i18n.language) : '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(template.amount, template.currency)}
                          </TableCell>
                          <TableCell>{getRecurringStatusBadge(template.status)}</TableCell>
                          <TableCell className="text-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 me-2" />
                                  {t('common.view')}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 me-2" />
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  {template.status === 'active' ? (
                                    <><Pause className="h-4 w-4 me-2" />{t('common.pause')}</>
                                  ) : (
                                    <><Play className="h-4 w-4 me-2" />{t('common.activate')}</>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== NEW INVOICE DIALOG ==================== */}
      <InvoiceFormDialog 
        open={showNewInvoice} 
        onOpenChange={setShowNewInvoice}
        onSuccess={() => {
          setShowNewInvoice(false);
          refetchInvoices();
        }}
      />

      {/* ==================== ALLOCATIONS DIALOG ==================== */}
      <Dialog open={allocOpen} onOpenChange={(o) => { setAllocOpen(o); if (!o) setSelectedInvoice(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t('banking.allocations')}
              {selectedInvoice ? ` - ${selectedInvoice.invoice_number}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {allocLoading ? (
              <p className="text-muted-foreground">{t('common.loading')}</p>
            ) : allocations.length === 0 ? (
              <p className="text-muted-foreground">{t('banking.noAllocations')}</p>
            ) : (
              <div className="divide-y border rounded-md">
                {allocations.map((a: any) => {
                  const amt = Number(a.allocated_amount || 0);
                  const dt = a.allocation_date ? new Date(a.allocation_date) : null;
                  return (
                    <div key={a.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatCurrency(amt, selectedInvoice?.currency || 'USD')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dt ? dt.toLocaleDateString(i18n.language) : ''}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => unmatchMutation.mutate(a.id)}>
                        {t('banking.unmatch')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ==================== VIEW INVOICE DIALOG ==================== */}
      <ViewInvoiceDialog
        open={showViewInvoice}
        onOpenChange={(o) => { setShowViewInvoice(o); if (!o) setViewInvoiceId(null); }}
        invoiceId={viewInvoiceId}
        onEdit={(id) => {
          setShowViewInvoice(false);
          setViewInvoiceId(null);
          setEditInvoiceId(id);
          setShowEditInvoice(true);
        }}
      />

      {/* ==================== EDIT INVOICE DIALOG ==================== */}
      <InvoiceFormDialog 
        open={showEditInvoice} 
        onOpenChange={(o) => { setShowEditInvoice(o); if (!o) setEditInvoiceId(null); }}
        editInvoiceId={editInvoiceId}
        onSuccess={() => {
          setShowEditInvoice(false);
          setEditInvoiceId(null);
          refetchInvoices();
        }}
      />
    </div>
  );
}
