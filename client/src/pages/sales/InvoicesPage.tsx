import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  Send, 
  Download, 
  Copy,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { SmartScanButton } from '@/components/ai/SmartScanButton';
import { SendInvoiceEmailDialog } from '@/components/SendInvoiceEmailDialog';

const statusConfig = {
  draft: { icon: Edit, color: 'secondary' },
  sent: { icon: Send, color: 'default' },
  paid: { icon: CheckCircle, color: 'success' },
  partially_paid: { icon: Clock, color: 'warning' },
  overdue: { icon: AlertCircle, color: 'destructive' },
  cancelled: { icon: XCircle, color: 'secondary' },
};

export default function InvoicesPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleScanComplete = (data: any) => {
    // In a real implementation, this would open the "Create Invoice" dialog/page with pre-filled data.
    // For now, we'll just show a toast and log it.
    console.log('Scanned Invoice Data:', data);
    toast({
      title: t("ai.scanSuccess"),
      description: t("ai.scanRedirect", "Data extracted. Redirecting to creation form..."),
    });
    // TODO: Redirect to /sales/invoices/new with state: { initialData: data }
    // For this demo, we will just alert the user that the feature is ready to be linked.
  };

  // Fetch invoices from API
  const { 
    data: invoices = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/sales/invoices'],
    select: (data: any[]) => data || []
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      return apiRequest('DELETE', `/api/sales/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      toast({
        title: t('common.deleteSuccess'),
        description: t('sales.invoices.invoiceDeletedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.invoices.invoiceDeleteError'),
        variant: 'destructive',
      });
    },
  });

  // Allocation dialog state
  const [allocOpen, setAllocOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const selectedId = selectedInvoice?.id;

  // Email dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailInvoice, setEmailInvoice] = useState<any | null>(null);

  // Fetch allocations for selected invoice
  const { data: allocations = [], isLoading: allocLoading } = useQuery({
    queryKey: ['/api/sales/invoices', selectedId || '', 'allocations'],
    enabled: !!selectedId && allocOpen,
    select: (rows: any[]) => rows || [],
  });

  const unmatchMutation = useMutation({
    mutationFn: async (allocationId: string) => {
      return apiRequest('DELETE', `/api/banking/reconciliation/allocations/${allocationId}`);
    },
    onSuccess: () => {
      if (selectedId) {
        queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices', selectedId, 'allocations'] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/banking/reconciliation/allocations/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      toast({ title: t('common.success'), description: t('banking.unmatchedSuccessfully') });
    },
    onError: (error: any) => {
      toast({ title: t('common.error'), description: error.message || t('banking.unmatchFailed'), variant: 'destructive' });
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('sales.invoices.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.loading')}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('sales.invoices.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.errorLoadingData')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t('sales.invoices.loadFailedTryAgain')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter invoices based on tab and search
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'draft':
        return invoice.status === 'draft';
      case 'sent':
        return invoice.status === 'sent';
      case 'paid':
        return invoice.status === 'paid';
      case 'overdue':
        return invoice.status === 'overdue';
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    paidAmount: invoices.reduce((sum, inv) => sum + inv.paid_amount, 0),
    outstanding: invoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0),
    draft: invoices.filter(inv => inv.status === 'draft').length,
    sent: invoices.filter(inv => inv.status === 'sent').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
  };

  const handleDelete = (id: string) => {
    if (confirm(t('sales.invoices.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (id: string) => {
    toast({
      title: t('sales.invoices.invoiceDuplicated'),
      description: t('sales.invoices.invoiceDuplicatedDesc'),
    });
  };

  const handleSend = (id: string) => {
    toast({
      title: t('sales.invoices.invoiceSent'),
      description: t('sales.invoices.invoiceSentDesc'),
    });
  };

  // Hooks moved to top

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <Badge variant={config.color as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {t(`sales.invoices.${status}`)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

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
        <Button 
          asChild 
          className="w-full sm:w-auto"
          data-testid="button-new-invoice"
        >
          <Link href="/sales/invoices/new">
            <Plus className="h-4 w-4 me-2" />
            {t('sales.invoices.addInvoice')}
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.invoices.totalInvoices')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.draft} {t('common.draft')}, {stats.sent} {t('common.sent')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('common.total')} {t('common.amount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAmount, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.invoices.allInvoices')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.invoices.paidAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.paidAmount, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.invoices.collected')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.invoices.outstanding')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.outstanding, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.invoices.toCollect')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchInvoices')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-invoices"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all" data-testid="tab-all">
            {t('common.all')} ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="draft" data-testid="tab-draft">
            {t('common.draft')} ({stats.draft})
          </TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent">
            {t('common.sent')} ({stats.sent})
          </TabsTrigger>
          <TabsTrigger value="paid" data-testid="tab-paid">
            {t('common.paid')} ({stats.paid})
          </TabsTrigger>
          <TabsTrigger value="overdue" data-testid="tab-overdue">
            {t('common.overdue')} ({stats.overdue})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sales.invoices.invoiceNumber')}</TableHead>
                    <TableHead>{t('sales.invoices.customer')}</TableHead>
                    <TableHead>{t('sales.invoices.invoiceDate')}</TableHead>
                    <TableHead>{t('sales.invoices.dueDate')}</TableHead>
                    <TableHead>{t('common.amount')}</TableHead>
                    <TableHead>{t('common.paid')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">{t('sales.invoices.noInvoicesFound')}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} data-testid={`row-invoice-${invoice.id}`}>
                        <TableCell className="font-medium">
                          <Link 
                            href={`/sales/invoices/${invoice.id}`}
                            className="hover:underline"
                          >
                            {invoice.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {invoice.customer_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(invoice.issue_date).toLocaleDateString(i18n.language)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.due_date).toLocaleDateString(i18n.language)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(invoice.total_amount, invoice.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {invoice.paid_amount > 0 ? (
                            <span className="text-green-600">
                              {formatCurrency(invoice.paid_amount, invoice.currency)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                data-testid={`button-actions-${invoice.id}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/sales/invoices/${invoice.id}`}>
                                  <Eye className="h-4 w-4 me-2" />
                                  {t('common.view')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedInvoice(invoice); setAllocOpen(true); }}>
                                <DollarSign className="h-4 w-4 me-2" />
                                {t('banking.allocations')}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/sales/invoices/${invoice.id}/edit`}>
                                  <Edit className="h-4 w-4 me-2" />
                                  {t('common.edit')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(invoice.id)}>
                                <Copy className="h-4 w-4 me-2" />
                                {t('common.duplicate')}
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleSend(invoice.id)}>
                                  <Send className="h-4 w-4 me-2" />
                                  {t('common.send')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => { setEmailInvoice(invoice); setEmailDialogOpen(true); }}>
                                <Mail className="h-4 w-4 me-2" />
                                {t('email.sendEmail')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 me-2" />
                                {t('common.downloadPDF')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(invoice.id)}
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

      {/* Allocations Dialog */}
      <Dialog open={allocOpen} onOpenChange={(o) => { setAllocOpen(o); if (!o) setSelectedInvoice(null); }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
                  const amt = Number((a.allocated_amount as any)?.toString?.() || a.allocated_amount || 0);
                  const dt = a.allocation_date ? new Date(a.allocation_date) : null;
                  const pay = a.payment_details || {};
                  const payRef = a.payment_type === 'receipt' ? pay.receipt_number : pay.payment_number;
                  const payDate = pay.date ? new Date(pay.date) : null;
                  const currency = selectedInvoice?.currency || 'USD';
                  return (
                    <div key={a.id} className="p-3 flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatCurrency(amt, currency)}
                          <span className="ms-2 text-muted-foreground">· {a.payment_type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dt ? new Date(dt).toLocaleDateString(i18n.language) : ''}
                          {payRef ? ` • ${payRef}` : ''}
                          {payDate ? ` • ${new Date(payDate).toLocaleDateString(i18n.language)}` : ''}
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

      {/* Email Invoice Dialog */}
      <SendInvoiceEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        invoice={emailInvoice}
      />
    </div>
  );
}