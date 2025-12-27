import React, { useState } from 'react';
import type { TFunction } from 'i18next';
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
  Banknote, 
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
  ArrowUpRight,
  Calendar,
  User,
  CreditCard,
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

// Receipt form schema factory for i18n messages
const receiptSchemaFactory = (t: TFunction) => z.object({
  customer_id: z.string().min(1, t('validation.selectCustomer')),
  description: z.string().min(2, t('validation.descriptionMin2')),
  amount: z.string().min(1, t('validation.amountRequired')),
  receipt_date: z.string().min(1, t('validation.receiptDateRequired')),
  payment_method: z.string().min(1, t('validation.paymentMethodRequired')),
  bank_account_id: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type ReceiptForm = z.infer<ReturnType<typeof receiptSchemaFactory>>;

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

export default function ReceiptsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const companyCurrency = useCompanyCurrency();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const aiClassify = useClassifyTransaction();
  const [aiHint, setAiHint] = useState<{ category: string; confidence: number; accounts?: { debit: string[]; credit: string[] } } | null>(null);
  const receiptSchema = receiptSchemaFactory(t);

  // Helper to get account display name
  const getAccountName = (account: Account) => {
    if (i18n.language === 'ar' && account.name_ar) {
      return account.name_ar;
    }
    return account.name;
  };

  // Fetch GL accounts for deposit account selection
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
  
  const statusConfig = {
    pending: { label: t('common.pending'), icon: Clock, color: 'default' },
    received: { label: t('statuses.received'), icon: CheckCircle, color: 'success' },
    cleared: { label: t('statuses.cleared'), icon: CheckCircle, color: 'success' },
    bounced: { label: t('statuses.bounced'), icon: XCircle, color: 'destructive' },
  };
  
  // Fetch contacts (customers)
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  const customers = contacts.filter(contact => 
    contact.type === 'customer' || contact.type === 'both'
  );

  // Create receipt mutation
  const createMutation = useMutation({
    mutationFn: async (data: ReceiptForm) => {
      const processedData = {
        ...data,
        amount: data.amount, // Send as string
        bank_account_id: data.bank_account_id || null,
        status: 'received',
        receipt_number: `REC-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      };
      return await apiRequest('POST', '/api/banking/receipts', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/receipts'] });
      setShowDialog(false);
      toast({
        title: t('banking.receipts.receiptCreated'),
        description: t('banking.receipts.receiptCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('banking.receipts.createError'),
        variant: 'destructive',
      });
    },
  });

  // Form with default bank account from company settings
  const form = useForm<ReceiptForm>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      customer_id: '',
      description: '',
      amount: '',
      receipt_date: new Date().toISOString().split('T')[0],
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

  const onSubmit = (data: ReceiptForm) => {
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

  // Fetch receipts data
  const { data: receipts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/banking/receipts'],
    select: (data: any[]) => {
      return data.map((receipt: any) => ({
        ...receipt,
        // Normalize status and amounts
        status: receipt.status || 'received',
        amount: Number(receipt.amount) || 0,
        // Format date for compatibility 
        receipt_date: receipt.date ? new Date(receipt.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));
    }
  });

  // Delete receipt mutation
  const deleteReceiptMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/banking/receipts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/receipts'] });
      toast({
        title: t('banking.receipts.receiptDeleted'),
        description: t('banking.receipts.receiptDeletedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: t('banking.receipts.receiptDeleteError'),
        variant: 'destructive',
      });
    },
  });

  const handleDeleteReceipt = (id: string) => {
    if (confirm(t('banking.receipts.confirmDelete'))) {
      deleteReceiptMutation.mutate(id);
    }
  };

  // Filter receipts
  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch = 
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'pending':
        return receipt.status === 'pending';
      case 'received':
        return receipt.status === 'received';
      case 'cleared':
        return receipt.status === 'cleared';
      case 'bounced':
        return receipt.status === 'bounced';
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = {
    total: receipts.length,
    totalAmount: receipts.reduce((sum, r) => sum + r.amount, 0),
    received: receipts.filter(r => r.status === 'received' || r.status === 'cleared').reduce((sum, r) => sum + r.amount, 0),
    pending: receipts.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
    todayAmount: receipts.filter(r => r.receipt_date === '2024-02-14').reduce((sum, r) => sum + r.amount, 0),
  };

  const handleApplyToInvoice = (id: string) => {
    toast({
      title: t('banking.receipts.receiptApplied'),
      description: t('banking.receipts.receiptAppliedDesc'),
    });
  };

  const handleSendReceipt = (id: string) => {
    toast({
      title: t('banking.receipts.receiptSent'),
      description: t('banking.receipts.receiptSentDesc'),
    });
  };

  const handleRefund = (id: string) => {
    if (confirm(t('banking.receipts.confirmRefund'))) {
      toast({
        title: t('banking.receipts.refundInitiated'),
        description: t('banking.receipts.refundInitiatedDesc'),
      });
    }
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
        <p className="text-destructive mb-4">{t('banking.receipts.failedToLoad')}</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('banking.receipts.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {isMobile ? t('banking.receipts.descriptionShort') : t('banking.receipts.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports/ai-analytics?source=receipts-form">
            <Button variant="ghost" size={isMobile ? 'sm' : 'default'} className="hidden md:inline-flex">
              <BarChart3 className="h-4 w-4 me-2" />
              {t('reports.aiAnalytics.title', { defaultValue: 'AI Analytics' })}
            </Button>
          </Link>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              className="w-full sm:w-auto"
              data-testid="button-new-receipt"
            >
              <Plus className="h-4 w-4 me-2" />
              {t('banking.receipts.addReceipt')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('banking.receipts.createReceipt')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form id="receipt-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.customer')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('placeholders.Select customer')} />
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
                    name="receipt_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.receiptDate')}</FormLabel>
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
                          placeholder={t('banking.receipts.descriptionPlaceholder')} 
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

                {/* Deposit To Account */}
                {cashAccounts.length > 0 && (
                  <FormField
                    control={form.control}
                    name="bank_account_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.receipts.depositToAccount', { defaultValue: 'إيداع في حساب' })}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('banking.receipts.selectDepositAccount', { defaultValue: 'اختر حساب الإيداع' })} />
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
                      <FormLabel>{`${t('banking.payments.paymentReference')} (${t('common.optional')})`}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('banking.payments.referencePlaceholder')} {...field} />
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
              <Button type="submit" form="receipt-form" disabled={createMutation.isPending} className="w-full sm:w-auto">
                {createMutation.isPending ? t('buttons.Creating...') : t('banking.receipts.createReceipt')}
              </Button>
            </DialogFooter>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.receipts.totalReceipts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('common.thisMonth')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.receipts.totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.receipts.allReceipts')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.receipts.collected')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.received)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.receipts.collectedDesc')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.receipts.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pending)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.receipts.beingProcessed')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.receipts.today')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.todayAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('banking.receipts.receivedToday')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchReceipts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-receipts"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all">{t('banking.receipts.allReceipts')}</TabsTrigger>
          <TabsTrigger value="pending">{t('banking.receipts.pending')}</TabsTrigger>
          <TabsTrigger value="received">{t('statuses.received')}</TabsTrigger>
          <TabsTrigger value="cleared">{t('statuses.cleared')}</TabsTrigger>
          <TabsTrigger value="bounced">{t('statuses.bounced')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('banking.receipts.receiptNumber')}</TableHead>
                    <TableHead>{t('common.customer')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('common.reference')}</TableHead>
                    <TableHead>{t('banking.payments.paymentMethod')}</TableHead>
                    <TableHead>{t('common.amount')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => {
                    const PaymentIcon = getPaymentMethodIcon(receipt.payment_method);
                    return (
                      <TableRow key={receipt.id} data-testid={`row-receipt-${receipt.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                            {receipt.receipt_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {receipt.customer_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(receipt.receipt_date).toLocaleDateString(i18n.language)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {receipt.reference}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PaymentIcon className="h-4 w-4 text-muted-foreground" />
                            {receipt.payment_method}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          +{formatCurrency(receipt.amount, receipt.currency)}
                        </TableCell>
                        <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                        <TableCell className="text-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${receipt.id}`}>
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
                              {receipt.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleApplyToInvoice(receipt.id)}>
                                  <CheckCircle className="h-4 w-4 me-2" />
                                  {t('banking.receipts.applyToInvoice')}
                                </DropdownMenuItem>
                              )}
                              {receipt.status === 'completed' && (
                                <DropdownMenuItem onClick={() => handleSendReceipt(receipt.id)}>
                                  <Send className="h-4 w-4 me-2" />
                                  {t('banking.receipts.sendReceipt')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 me-2" />
                                {t('common.download') + ' PDF'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {(receipt.status === 'received' || receipt.status === 'cleared') && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleRefund(receipt.id)}
                                >
                                  <XCircle className="h-4 w-4 me-2" />
                                  {t('banking.receipts.refund')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteReceipt(receipt.id)}
                                disabled={deleteReceiptMutation.isPending}
                                data-testid={`button-delete-${receipt.id}`}
                              >
                                {deleteReceiptMutation.isPending ? (
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