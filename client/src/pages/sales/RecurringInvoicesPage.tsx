import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  Copy,
  Send,
  Pause,
  Play,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Building2,
  RotateCcw,
  CalendarDays
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

// Recurring invoice form schema (localized)
const recurringInvoiceSchemaFactory = (t: (key: string) => string) => z.object({
  customer_id: z.string().min(1, t('validation.selectCustomer')),
  template_name: z.string().min(2, t('validation.templateNameMin2')),
  frequency: z.string().min(1, t('validation.selectFrequency')),
  start_date: z.string().min(1, t('validation.dateRequired')),
  end_date: z.string().optional(),
  amount: z.string().min(1, t('validation.amountRequired')),
  description: z.string().min(2, t('validation.descriptionMin2')),
  payment_terms: z.string().min(1, t('validation.paymentTermsRequired')),
  notes: z.string().optional(),
});

type RecurringInvoiceForm = z.infer<ReturnType<typeof recurringInvoiceSchemaFactory>>;

// Frequency options will be localized inside the component where t() is available

export default function RecurringInvoicesPage() {
  const { t, i18n } = useTranslation();
  const frequencyOptions = [
    { value: 'weekly', label: t('sales.recurringInvoices.weekly') },
    { value: 'monthly', label: t('sales.recurringInvoices.monthly') },
    { value: 'quarterly', label: t('sales.recurringInvoices.quarterly') },
    { value: 'yearly', label: t('sales.recurringInvoices.yearly') },
  ];
  
  const statusConfig = {
    active: { label: t('common.active'), icon: CheckCircle, color: 'default' },
    paused: { label: t('common.paused'), icon: Pause, color: 'secondary' },
    completed: { label: t('common.completed'), icon: CheckCircle, color: 'default' },
  };
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  
  // Fetch contacts (customers)
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  const customers = contacts.filter(contact => 
    contact.type === 'customer' || contact.type === 'both'
  );

  // Create recurring invoice mutation
  const createMutation = useMutation({
    mutationFn: async (data: RecurringInvoiceForm) => {
      const processedData = {
        ...data,
        amount: parseFloat(data.amount),
        status: 'active',
        invoices_sent: 0,
      };
      return await apiRequest('POST', '/api/sales/recurring-invoices', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/recurring-invoices'] });
      setShowDialog(false);
      toast({
        title: t('common.createSuccess'),
        description: t('sales.recurringInvoices.recurringInvoiceCreatedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.recurringInvoices.recurringInvoiceCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Form
  const form = useForm<RecurringInvoiceForm>({
    resolver: zodResolver(recurringInvoiceSchemaFactory(t)),
    defaultValues: {
      customer_id: '',
      template_name: '',
      frequency: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      amount: '',
      description: '',
      payment_terms: '30',
      notes: '',
    },
  });

  const onSubmit = (data: RecurringInvoiceForm) => {
    createMutation.mutate(data);
  };

  // Load recurring invoice templates from API
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery<any[]>({
    queryKey: ['/api/sales/recurring-invoices'],
  });

  // Adapt templates to UI shape
  const invoices = useMemo(() => {
    return (templates || []).map((tpl: any) => {
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
  }, [templates, customers]);

  // Filter recurring invoices
  const filteredInvoices: any[] = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'active':
        return invoice.status === 'active';
      case 'paused':
        return invoice.status === 'paused';
      case 'expired':
        return invoice.status === 'expired';
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = invoices.length;
    const active = invoices.filter(i => i.status === 'active').length;
    const paused = invoices.filter(i => i.status === 'paused').length;
    const totalRevenue = invoices
      .filter(i => i.status === 'active')
      .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    return { total, active, paused, totalRevenue };
  }, [invoices]);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <Badge variant={config.color as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest('PUT', `/api/sales/recurring-invoices/${id}`, { is_active: isActive });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/recurring-invoices'] });
      toast({
        title: t('sales.recurringInvoices.recurringInvoiceStatusChanged'),
        description: variables.isActive 
          ? t('sales.recurringInvoices.templateActivatedSuccess') 
          : t('sales.recurringInvoices.templatePausedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('common.updateFailed'),
        variant: 'destructive',
      });
    },
  });

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newIsActive = currentStatus !== 'active';
    toggleStatusMutation.mutate({ id, isActive: newIsActive });
  };

  // Generate invoice now mutation
  const generateNowMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/api/sales/recurring-invoices/${id}/generate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/recurring-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/invoices'] });
      toast({
        title: t('common.success'),
        description: t('sales.recurringInvoices.invoiceGeneratedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.recurringInvoices.invoiceGenerationFailed'),
        variant: 'destructive',
      });
    },
  });

  const handleGenerateNow = (id: string) => {
    generateNowMutation.mutate(id);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('sales.recurringInvoices.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('sales.recurringInvoices.description')}
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              className="w-full sm:w-auto"
              data-testid="button-new-recurring-invoice"
            >
              <Plus className="h-4 w-4 me-2" />
              {t('sales.recurringInvoices.addRecurringInvoice')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('sales.recurringInvoices.createTemplate')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form id="recurring-invoice-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.customer')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.selectCustomer')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="template_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.recurringInvoices.templateName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('placeholders.enterTemplateName')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.recurringInvoices.frequency')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.selectFrequency')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {frequencyOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.amount')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.recurringInvoices.startDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.recurringInvoices.endDate')} ({t('common.optional')})</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('common.description')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('placeholders.serviceDescription')} 
                          {...field} 
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sales.recurringInvoices.paymentTerms')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('placeholders.selectTerms')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">{t('paymentTerms.net15')}</SelectItem>
                          <SelectItem value="30">{t('paymentTerms.net30')}</SelectItem>
                          <SelectItem value="60">{t('paymentTerms.net60')}</SelectItem>
                          <SelectItem value="90">{t('paymentTerms.net90')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.notes')} ({t('common.optional')})</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('placeholders.additionalNotes')}
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="w-full sm:w-auto"
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" form="recurring-invoice-form" disabled={createMutation.isPending} className="w-full sm:w-auto">
                {createMutation.isPending ? t('common.creating') : t('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.recurringInvoices.totalRecurring')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('common.allTemplates')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.recurringInvoices.activeTemplates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('common.currentlyRunning')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('common.paused')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.paused}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('common.temporarilyStopped')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('common.monthlyRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('common.fromActiveTemplates')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchRecurringInvoices')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all">{t('common.all')} ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">{t('common.active')} ({stats.active})</TabsTrigger>
          <TabsTrigger value="paused">{t('common.paused')} ({stats.paused})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('sales.recurringInvoices.templateName')}</TableHead>
                      <TableHead>{t('common.customer')}</TableHead>
                      <TableHead>{t('sales.recurringInvoices.frequency')}</TableHead>
                      <TableHead>{t('sales.recurringInvoices.nextInvoice')}</TableHead>
                      <TableHead className="text-end">{t('common.amount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell data-label={t('sales.recurringInvoices.templateName')}>
                          <div>
                            <div className="font-medium">{invoice.template_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {invoice.invoices_sent} {t('sales.recurringInvoices.invoicesSent')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell data-label={t('common.customer')}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {invoice.customer_name}
                          </div>
                        </TableCell>
                        <TableCell data-label={t('sales.recurringInvoices.frequency')}>
                          <div className="flex items-center gap-2">
                            <RotateCcw className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{invoice.frequency}</span>
                          </div>
                        </TableCell>
                        <TableCell data-label={t('sales.recurringInvoices.nextInvoice')}>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            {new Date(invoice.next_invoice).toLocaleDateString(i18n.language)}
                          </div>
                        </TableCell>
                        <TableCell className="text-end" data-label={t('common.amount')}>
                          <div className="font-semibold">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </div>
                        </TableCell>
                        <TableCell data-label={t('common.status')}>
                          {getStatusBadge(invoice.status)}
                        </TableCell>
                        <TableCell className="text-end" data-label={t('common.actions')}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 me-2" />
                                {t('common.viewDetails')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 me-2" />
                                {t('sales.recurringInvoices.editTemplate')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 me-2" />
                                {t('common.duplicate')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                                disabled={toggleStatusMutation.isPending}
                              >
                                {invoice.status === 'active' ? (
                                  <>
                                    <Pause className="h-4 w-4 me-2" />
                                    {t('sales.recurringInvoices.pauseTemplate')}
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4 me-2" />
                                    {t('sales.recurringInvoices.activateTemplate')}
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleGenerateNow(invoice.id)}
                                disabled={generateNowMutation.isPending || invoice.status !== 'active'}
                              >
                                <Send className="h-4 w-4 me-2" />
                                {t('sales.recurringInvoices.generateNow')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}