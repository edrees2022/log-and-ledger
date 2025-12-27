import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
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
  CreditCard, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit,
  Copy,
  Send,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownRight,
  Calendar,
  Building2,
  Banknote,
  FileText,
  Loader2,
  Trash2
} from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { useClassifyTransaction } from '@/hooks/useAIClassification';
import { Link } from 'wouter';
import PageContainer from '@/components/layout/PageContainer';

// Payment form schema (messages localized below in-component)
type PaymentForm = {
  vendor_id: string;
  description: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  bank_account_id?: string;
  reference?: string;
  notes?: string;
};

// Account interface for GL accounts
interface Account {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  account_type: string;
  account_subtype: string;
}

const paymentMethodIcons = {
  'Bank Transfer': Banknote,
  'Credit Card': CreditCard,
  'Check': FileText,
  'Online Payment': CreditCard,
  'Cash': Banknote,
};

export default function PaymentsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const companyCurrency = useCompanyCurrency();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const aiClassify = useClassifyTransaction();
  const [aiHint, setAiHint] = useState<{ category: string; confidence: number; accounts?: { debit: string[]; credit: string[] } } | null>(null);
  
  // Helper to get account display name
  const getAccountName = (account: Account) => {
    if (i18n.language === 'ar' && account.name_ar) {
      return account.name_ar;
    }
    return account.name;
  };

  // Fetch GL accounts for payment account selection
  const { data: glAccounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  // Fetch company default accounts
  const { data: defaultAccounts } = useQuery<{
    default_bank_account_id: string | null;
  }>({
    queryKey: ['/api/settings/default-accounts'],
  });

  // Filter cash/bank accounts
  const cashAccounts = glAccounts.filter(
    (a) => a.account_type === 'asset' && 
           (a.account_subtype === 'cash' || a.account_subtype === 'current_asset')
  );
  
  // Localized form schema
  const paymentSchema = z.object({
    vendor_id: z.string().min(1, t('validation.selectVendor')),
    description: z.string().min(2, t('validation.descriptionMin2')),
    amount: z.string().min(1, t('validation.amountRequired')),
    payment_date: z.string().min(1, t('validation.paymentDateRequired')),
    payment_method: z.string().min(1, t('validation.paymentMethodRequired')),
    bank_account_id: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
  });
  
  const statusConfig = {
    pending: { label: t('common.pending'), icon: Clock, color: 'default' },
    scheduled: { label: t('common.scheduled'), icon: Calendar, color: 'secondary' },
    completed: { label: t('common.completed'), icon: CheckCircle, color: 'success' },
    failed: { label: t('common.failed'), icon: XCircle, color: 'destructive' },
    cancelled: { label: t('common.cancelled'), icon: XCircle, color: 'secondary' },
  };
  
  // Fetch contacts (vendors/suppliers)
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  const vendors = contacts.filter(contact => 
    contact.type === 'vendor' || contact.type === 'supplier' || contact.type === 'both'
  );

  // Create payment mutation
  const createMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      const processedData = {
        ...data,
        amount: data.amount, // Send as string
        bank_account_id: data.bank_account_id || null,
        status: 'pending',
        payment_number: `PAY-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      };
      return await apiRequest('POST', '/api/banking/payments', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/payments'] });
      setShowDialog(false);
      toast({
        title: t('banking.payments.paymentCreated'),
        description: t('banking.payments.paymentCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('banking.payments.paymentCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Form with default bank account from company settings
  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      vendor_id: '',
      description: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      bank_account_id: defaultAccounts?.default_bank_account_id || '',
      reference: '',
      notes: '',
    },
  });

  // Update form defaults when defaultAccounts loads
  React.useEffect(() => {
    if (defaultAccounts?.default_bank_account_id && !form.getValues('bank_account_id')) {
      form.setValue('bank_account_id', defaultAccounts.default_bank_account_id);
    }
  }, [defaultAccounts, form]);

  const onSubmit = (data: PaymentForm) => {
    createMutation.mutate(data);
  };

  const onSuggestAI = async () => {
    try {
      const desc = form.getValues('description') || '';
      const amtStr = form.getValues('amount') || '';
      const amt = parseFloat(amtStr);
      if (!desc.trim()) return;
      const res = await aiClassify.mutateAsync({
        description: desc,
        amount: isFinite(amt) ? Math.abs(amt) : undefined,
        currency: 'USD',
      });
      if (res) {
        setAiHint({ category: res.category, confidence: res.confidence, accounts: res.suggestedAccounts });
      }
    } catch (_) {
      // soft fail
    }
  };

  // Fetch payments data
  const { data: payments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/banking/payments'],
    select: (data: any[]) => {
      return data.map((payment: any) => ({
        ...payment,
        // Normalize status and amounts
        status: payment.status || 'pending',
        amount: Number(payment.amount) || 0,
        // Format date for compatibility 
        payment_date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    }
  });

  // Delete payment mutation
  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/banking/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/payments'] });
      toast({
        title: t('banking.payments.paymentDeleted'),
        description: t('banking.payments.paymentDeletedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: t('banking.payments.paymentDeleteError'),
        variant: 'destructive',
      });
    },
  });

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.payment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'pending':
        return payment.status === 'pending';
      case 'scheduled':
        return payment.status === 'scheduled';
      case 'completed':
        return payment.status === 'completed';
      case 'failed':
        return payment.status === 'failed';
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    completed: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending' || p.status === 'scheduled').reduce((sum, p) => sum + p.amount, 0),
    failed: payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
  };

  const handleDeletePayment = (id: string) => {
    if (confirm(t('banking.payments.confirmDelete'))) {
      deletePaymentMutation.mutate(id);
    }
  };

  const handleRetryPayment = (id: string) => {
    toast({
      title: t('banking.payments.paymentRetried'),
      description: t('banking.payments.paymentRetriedDesc'),
    });
  };

  const handleCancelPayment = (id: string) => {
    if (confirm(t('banking.payments.confirmCancel'))) {
      toast({
        title: t('banking.payments.paymentCancelled'),
        description: t('banking.payments.paymentCancelledDesc'),
      });
    }
  };

  const handleSendRemittance = (id: string) => {
    toast({
      title: t('banking.payments.remittanceSent'),
      description: t('banking.payments.remittanceSentDesc'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{t('banking.payments.failedToLoad')}</p>
        <Button onClick={() => refetch()} variant="outline">
          {t('common.retry')}
        </Button>
      </div>
    );
  }

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

  const getPaymentMethodIcon = (method: string) => {
    const Icon = paymentMethodIcons[method as keyof typeof paymentMethodIcons] || CreditCard;
    return Icon;
  };

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency || companyCurrency,
    }).format(amount);
  };

  return (
    <PageContainer className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('banking.payments.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {isMobile ? t('banking.payments.descriptionShort') : t('banking.payments.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports/ai-analytics?source=payments-form">
            <Button variant="ghost" size={isMobile ? 'sm' : 'default'} className="hidden md:inline-flex">
              <BarChart3 className="h-4 w-4 me-2" />
              {t('reports.aiAnalytics.title', { defaultValue: 'AI Analytics' })}
            </Button>
          </Link>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              className="w-full sm:w-auto"
              data-testid="button-new-payment"
            >
              <Plus className="h-4 w-4 me-2" />
              {t('banking.payments.addPayment')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('banking.payments.addPayment')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vendor_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.bills.supplier')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.Select vendor')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
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
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.payments.paymentDate')}</FormLabel>
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
                      <div className="flex items-center justify-between">
                        <FormLabel>{t('common.description')}</FormLabel>
                        <Button type="button" size="sm" variant="outline" onClick={onSuggestAI} disabled={aiClassify.isPending}>
                          {aiClassify.isPending ? t('ai.generating', { defaultValue: 'Generating…' }) : t('ai.suggest', { defaultValue: 'Suggest' })}
                        </Button>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder={t('banking.payments.descriptionPlaceholder')} 
                          {...field} 
                        />
                      </FormControl>
                      {aiHint && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {t('ai.suggested', { defaultValue: 'Suggested' })}: <span className="font-medium">{aiHint.category}</span> · {Math.round(aiHint.confidence * 100)}%
                          {aiHint.accounts ? (
                            <>
                              {' '}· {t('ai.accounts', { defaultValue: 'Accounts' })}: {[
                                ...(aiHint.accounts.debit || []),
                                ...(aiHint.accounts.credit || []),
                              ].slice(0,3).join(', ')}
                            </>
                          ) : null}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.payments.paymentMethod')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.Select method')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Bank Transfer">{t('paymentMethods.Bank Transfer')}</SelectItem>
                            <SelectItem value="Credit Card">{t('paymentMethods.Credit Card')}</SelectItem>
                            <SelectItem value="Check">{t('paymentMethods.Check')}</SelectItem>
                            <SelectItem value="Online Payment">{t('paymentMethods.Online Payment')}</SelectItem>
                            <SelectItem value="Cash">{t('paymentMethods.Cash')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Paid From Account */}
                {cashAccounts.length > 0 && (
                  <FormField
                    control={form.control}
                    name="bank_account_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.payments.paidFromAccount', { defaultValue: 'دُفع من حساب' })}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('banking.payments.selectPaidFromAccount', { defaultValue: 'اختر حساب الدفع' })} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cashAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                <span className="font-mono text-xs me-2">{account.code}</span>
                                {getAccountName(account)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`${t('common.reference')} (${t('common.optional')})`}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('banking.payments.referencePlaceholder')} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`${t('common.notes')} (${t('common.optional')})`}</FormLabel>
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
              <Button type="submit" form="payment-form" disabled={createMutation.isPending} className="w-full sm:w-auto">
                {createMutation.isPending ? t('buttons.Creating...') : t('banking.payments.createPayment')}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('banking.payments.totalPayments')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('common.thisMonth')}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('banking.payments.totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.payments.allPayments')}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('banking.payments.completed')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.completed)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.payments.successfullyPaid')}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('banking.payments.pending')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pending)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.payments.inProcess')}
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-sm font-medium">{t('banking.payments.failed')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.failed)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.payments.needAttention')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchPayments')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-payments"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all">{t('banking.payments.allPayments')}</TabsTrigger>
          <TabsTrigger value="pending">{t('common.pending')}</TabsTrigger>
          <TabsTrigger value="scheduled">{t('common.scheduled')}</TabsTrigger>
          <TabsTrigger value="completed">{t('banking.payments.completed')}</TabsTrigger>
          <TabsTrigger value="failed">{t('common.failed')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('banking.payments.paymentNumber')}</TableHead>
                      <TableHead>{t('purchases.bills.supplier')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('common.reference')}</TableHead>
                      <TableHead>{t('banking.payments.paymentMethod')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => {
                      const PaymentIcon = getPaymentMethodIcon(payment.payment_method);
                      return (
                        <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                              {payment.payment_number}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {payment.vendor_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(payment.payment_date).toLocaleDateString(i18n.language)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              {payment.reference}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                              {payment.payment_method}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-red-600">
                            -{formatCurrency(payment.amount, payment.currency)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-actions-${payment.id}`}>
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
                                  {t('common.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 me-2" />
                                  {t('common.duplicate')}
                                </DropdownMenuItem>
                                {payment.status === 'failed' && (
                                  <DropdownMenuItem onClick={() => handleRetryPayment(payment.id)}>
                                    <CheckCircle className="h-4 w-4 me-2" />
                                    {t('banking.payments.retryPayment')}
                                  </DropdownMenuItem>
                                )}
                                {payment.status === 'completed' && (
                                  <DropdownMenuItem onClick={() => handleSendRemittance(payment.id)}>
                                    <Send className="h-4 w-4 me-2" />
                                    {t('banking.payments.sendRemittance')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 me-2" />
                                  {t('banking.payments.downloadReceipt')}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {(payment.status === 'pending' || payment.status === 'scheduled') && (
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleCancelPayment(payment.id)}
                                  >
                                    <XCircle className="h-4 w-4 me-2" />
                                    {t('banking.payments.cancelPayment')}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeletePayment(payment.id)}
                                  disabled={deletePaymentMutation.isPending}
                                  data-testid={`button-delete-${payment.id}`}
                                >
                                  {deletePaymentMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 me-2" />
                                  )}
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}