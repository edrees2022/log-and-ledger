import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Wallet, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  User,
  Tag,
  CreditCard,
  Upload,
  Paperclip
} from 'lucide-react';
import { BarChart3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import AIIngestDialog from '@/components/ai/AIIngestDialog';
import ExtractionPreview from '@/components/ai/ExtractionPreview';
import { computeCompleteness, normalizeDate } from '@shared/aiSchemas';
import { Loader2 } from 'lucide-react';
import { useClassifyTransaction } from '@/hooks/useAIClassification';
import { Link } from 'wouter';
import PageContainer from '@/components/layout/PageContainer';
import { SmartScanButton } from '@/components/ai/SmartScanButton';

// Schema built in component to localize validation messages
type ExpenseForm = {
  description: string;
  category: string;
  expense_account_id?: string;
  paid_from_account_id?: string;
  amount: string;
  date: string;
  paid_by: string;
  payment_method: string;
  reimbursable: boolean;
  notes?: string;
  project_id?: string;
};

// Available categories (fallback when no expense accounts)
const expenseCategories = [
  'Travel',
  'Office Supplies',
  'Software',
  'Entertainment',
  'Utilities',
  'Marketing',
  'Training',
  'Equipment',
  'Meals',
  'Communication',
  'Other',
];

// Payment methods (fallback when no cash accounts)
const paymentMethods = [
  'Cash',
  'Credit Card',
  'Company Card',
  'Bank Transfer',
  'Personal Card',
  'Petty Cash',
];

// Account interface
interface Account {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  account_type: string;
  account_subtype: string;
}

// Removed mock expenses; data will be fetched from API.

const categoryColors = {
  'Travel': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Office Supplies': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Software': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Entertainment': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  'Utilities': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export default function ExpensesPage() {
  const { t, i18n } = useTranslation();
  
  // Helper to get account display name
  const getAccountName = (account: Account) => {
    if (i18n.language === 'ar' && account.name_ar) {
      return account.name_ar;
    }
    return account.name;
  };
  
  // Build schema with localized validation messages
  const expenseSchema = z.object({
    description: z.string().min(2, t('validation.descriptionMin2')),
    category: z.string().optional(),
    expense_account_id: z.string().optional(),
    paid_from_account_id: z.string().optional(),
    amount: z.string().min(1, t('validation.amountRequired')),
    date: z.string().min(1, t('validation.dateRequired')),
    paid_by: z.string().min(1, t('validation.specifyWhoPaid')),
    payment_method: z.string().optional(),
    reimbursable: z.boolean(),
    notes: z.string().optional(),
    project_id: z.string().optional(),
  });
  
  const statusConfig = {
    pending: { label: t('common.pending'), icon: Clock, color: 'default' },
    submitted: { label: t('common.submitted'), icon: CheckCircle, color: 'success' },
    approved: { label: t('common.approved'), icon: CheckCircle, color: 'success' },
    rejected: { label: t('common.rejected'), icon: XCircle, color: 'destructive' },
  };
  const { toast } = useToast();
  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });
  
  // Fetch accounts for expense and payment selection
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });
  
  // Fetch company default accounts
  const { data: defaultAccounts } = useQuery<{
    default_expense_account_id: string | null;
    default_cash_account_id: string | null;
  }>({
    queryKey: ['/api/settings/default-accounts'],
  });
  
  // Filter expense accounts (expense type)
  const expenseAccounts = accounts.filter(
    (a) => a.account_type === 'expense'
  );
  
  // Filter cash/bank accounts for payment
  const cashAccounts = accounts.filter(
    (a) => a.account_type === 'asset' && 
           (a.account_subtype === 'cash' || a.account_subtype === 'current_asset')
  );
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [extracted, setExtracted] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [applyFields, setApplyFields] = useState({
    date: true,
    total: true,
    payment_method: true,
    notes_vendor: true,
    notes_text: true,
  });
  const isMobile = useIsMobile();
  const aiClassify = useClassifyTransaction();
  const [aiHint, setAiHint] = useState<{ category: string; confidence: number } | null>(null);

  // Create expense mutation
  const createMutation = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      const processedData = {
        ...data,
        payee: data.paid_by, // Map paid_by to payee
        amount: data.amount, // Keep as string for decimal field
        expense_account_id: data.expense_account_id || null,
        paid_from_account_id: data.paid_from_account_id || null,
        status: 'pending',
      };
      return await apiRequest('POST', '/api/purchases/expenses', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/expenses'] });
      setShowDialog(false);
      toast({
        title: t('purchases.expenses.expenseCreated'),
        description: t('purchases.expenses.expenseCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.expenses.expenseCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Update expense mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ExpenseForm & { id: string }) => {
      const { id, ...rest } = data;
      const processedData = {
        ...rest,
        payee: rest.paid_by,
        amount: rest.amount,
        expense_account_id: rest.expense_account_id || null,
        paid_from_account_id: rest.paid_from_account_id || null,
      };
      return await apiRequest('PUT', `/api/purchases/expenses/${id}`, processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/expenses'] });
      setShowDialog(false);
      setEditingExpense(null);
      toast({
        title: t('purchases.expenses.expenseUpdated'),
        description: t('purchases.expenses.expenseUpdatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.expenses.expenseUpdateError'),
        variant: 'destructive',
      });
    },
  });

  // Handle edit click
  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    form.reset({
      description: expense.description || '',
      category: expense.category || '',
      expense_account_id: expense.expense_account_id || '',
      paid_from_account_id: expense.paid_from_account_id || '',
      amount: expense.amount?.toString() || '',
      date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      paid_by: expense.payee || expense.paid_by || '',
      payment_method: expense.payment_method || '',
      reimbursable: expense.reimbursable ?? true,
      notes: expense.notes || '',
      project_id: expense.project_id || '',
    });
    setShowDialog(true);
  };

  // Form with default accounts from company settings
  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      category: '',
      expense_account_id: defaultAccounts?.default_expense_account_id || '',
      paid_from_account_id: defaultAccounts?.default_cash_account_id || '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paid_by: '',
      payment_method: '',
      reimbursable: true,
      notes: '',
      project_id: '',
    },
  });
  
  // Update form defaults when defaultAccounts loads
  React.useEffect(() => {
    if (defaultAccounts && !editingExpense) {
      if (defaultAccounts.default_expense_account_id && !form.getValues('expense_account_id')) {
        form.setValue('expense_account_id', defaultAccounts.default_expense_account_id);
      }
      if (defaultAccounts.default_cash_account_id && !form.getValues('paid_from_account_id')) {
        form.setValue('paid_from_account_id', defaultAccounts.default_cash_account_id);
      }
    }
  }, [defaultAccounts, editingExpense, form]);

  const onSubmit = (data: ExpenseForm) => {
    // Correction logging if snapshot differs
    try {
      const snap = (form as any).__aiSnapshot;
      if (snap) {
        const current = {
          date: data.date,
          total: parseFloat(data.amount || '0'),
          payment_method: data.payment_method,
        };
        const corrections: any[] = [];
        if (snap.date && snap.date !== current.date) corrections.push({ field: 'date', before: snap.date, after: current.date });
        if (snap.total !== undefined && Math.abs((snap.total || 0) - (current.total || 0)) > 0.001) corrections.push({ field: 'total', before: snap.total, after: current.total });
        if (snap.payment_method && snap.payment_method !== current.payment_method) corrections.push({ field: 'payment_method', before: snap.payment_method, after: current.payment_method });
        if (corrections.length > 0) {
          const fb = {
            source: 'expense',
            accepted: false,
            category: 'extraction-correction',
            description: JSON.stringify({ corrections, meta: snap.meta || null }),
          } as any;
          void apiRequest('POST', '/api/ai/feedback', fb).catch(() => {});
        }
      }
    } catch {}
    
    if (editingExpense) {
      updateMutation.mutate({ ...data, id: editingExpense.id });
    } else {
      createMutation.mutate(data);
    }
  };

  // AI ingest handlers
  const handleApplyToggle = (key: keyof typeof applyFields, value: any) => {
    const boolVal = !!value;
    setApplyFields(s => ({ ...s, [key]: boolVal }));
    try {
      const prefsRaw = localStorage.getItem('ai.applyDefaults.expenses');
      const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
      localStorage.setItem('ai.applyDefaults.expenses', JSON.stringify({ ...prefs, [key]: boolVal }));
    } catch {}
  };

  const setAllApply = (value: boolean) => {
    if (!extracted) return;
    const next = {
      date: value && !!extracted.date,
      total: value && !!extracted.total,
      payment_method: value && !!extracted.payment_method,
      notes_vendor: value && !!extracted.vendor_name,
      notes_text: value && !!extracted.notes,
    };
    setApplyFields(next);
    try { localStorage.setItem('ai.applyDefaults.expenses', JSON.stringify(next)); } catch {}
  };

  const resetApplyDefaults = () => {
    try { localStorage.removeItem('ai.applyDefaults.expenses'); } catch {}
    if (!extracted) return;
    setApplyFields({
      date: !!extracted.date,
      total: !!extracted.total,
      payment_method: !!extracted.payment_method,
      notes_vendor: !!extracted.vendor_name,
      notes_text: !!extracted.notes,
    });
  };

  const handleScanExtract = (payload: any) => {
    if (!payload) return;
    setExtracted(payload);
    try {
      const raw = localStorage.getItem('ai.applyDefaults.expenses');
      if (raw) setApplyFields(prev => ({ ...prev, ...JSON.parse(raw) }));
    } catch {}
    setPreviewOpen(true);
  };

  const applyExtracted = () => {
    if (!extracted) return;
    if (applyFields.date && extracted.date) {
      const d = normalizeDate(extracted.date) || '';
      form.setValue('date', d, { shouldDirty: true, shouldValidate: true });
    }
    if (applyFields.total && extracted.total != null) {
      const amt = parseFloat(String(extracted.total));
      if (!isNaN(amt)) {
        form.setValue('amount', amt.toFixed(2), { shouldDirty: true, shouldValidate: true });
      }
    }
    if (applyFields.payment_method && extracted.payment_method) {
      form.setValue('payment_method', extracted.payment_method, { shouldDirty: true, shouldValidate: true });
    }
    if (applyFields.notes_vendor && extracted.vendor_name) {
      const prev = form.getValues('notes') || '';
      const next = `${prev ? prev + '\n' : ''}${t('ai.vendorDetected')}: ${extracted.vendor_name}`.trim();
      form.setValue('notes', next, { shouldDirty: true, shouldValidate: false });
    }
    if (applyFields.notes_text && extracted.notes) {
      const prev = form.getValues('notes') || '';
      const next = `${prev ? prev + '\n' : ''}${extracted.notes}`.trim();
      form.setValue('notes', next, { shouldDirty: true, shouldValidate: false });
    }
    // Snapshot for correction logging
    try {
      const amt = parseFloat(String(extracted.total));
      (form as any).__aiSnapshot = {
        date: applyFields.date ? (normalizeDate(extracted.date) || undefined) : undefined,
        total: applyFields.total && !isNaN(amt) ? amt : undefined,
        payment_method: applyFields.payment_method ? (extracted.payment_method || undefined) : undefined,
        notes_vendor: !!(applyFields.notes_vendor && extracted.vendor_name),
        notes_text: !!(applyFields.notes_text && extracted.notes),
        meta: extracted.meta || null,
      };
    } catch {}
    // Fire-and-forget feedback log
    try {
      const fields = ['date','total','currency','vendor_name','payment_method','notes'];
      const { percent } = computeCompleteness(extracted, fields);
      const applied = {
        date: !!(applyFields.date && extracted.date),
        total: !!(applyFields.total && extracted.total),
        payment_method: !!(applyFields.payment_method && extracted.payment_method),
        notes_vendor: !!(applyFields.notes_vendor && extracted.vendor_name),
        notes_text: !!(applyFields.notes_text && extracted.notes),
      };
      const amt = parseFloat(String(extracted.total));
      const fb = {
        source: 'expense',
        accepted: true,
        category: 'extraction-apply',
        confidence: percent / 100,
        amount: !isNaN(amt) ? amt : undefined,
        description: JSON.stringify({ applied, meta: extracted.meta || null }),
      } as any;
      void apiRequest('POST', '/api/ai/feedback', fb).catch(() => {});
    } catch {}
    setPreviewOpen(false);
    setScanOpen(false);
    setExtracted(null);
  };

  const onSuggestCategory = async () => {
    try {
      const desc = form.getValues('description') || '';
      const amtStr = form.getValues('amount') || '';
      const amt = parseFloat(amtStr);
      if (!desc.trim()) {
        return;
      }
      const res = await aiClassify.mutateAsync({
        description: desc,
        amount: isFinite(amt) ? Math.abs(amt) : undefined,
        currency: 'USD',
      });
      if (res?.category) {
        form.setValue('category', res.category, { shouldDirty: true, shouldValidate: true });
        setAiHint({ category: res.category, confidence: res.confidence });
      }
    } catch (e: any) {
      // Soft-fail, user can still continue
    }
  };

  // Fetch real expenses
  const { data: expenses = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/purchases/expenses'],
    select: (data: any[]) =>
      data.map((e: any) => ({
        ...e,
        amount: Number(e.amount || 0),
        tax_amount: Number(e.tax_amount || 0),
        // Map backend fields to UI expectations
        paid_by: e.payee || '-',
        currency: e.currency || 'USD',
        has_receipt: false,
      })),
  });

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = 
      expense.expense_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.paid_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'pending':
        return expense.status === 'pending';
      case 'approved':
        return expense.status === 'approved';
      case 'rejected':
        return expense.status === 'rejected';
      case 'reimbursable':
        return expense.reimbursable;
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = {
    total: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    pending: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
    approved: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
    reimbursable: expenses.filter(e => e.reimbursable && e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
  };

  const handleApprove = (id: string) => {
    toast({
      title: t('purchases.expenses.approved'),
      description: t('purchases.expenses.expenseApprovedDesc'),
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: t('purchases.expenses.expenseRejected'),
      description: t('purchases.expenses.expenseRejectedDesc'),
    });
  };

  const handleReimburse = (id: string) => {
    toast({
      title: t('purchases.expenses.reimbursementProcessed'),
      description: t('purchases.expenses.reimbursementProcessedDesc'),
    });
  };

  const handleUploadReceipt = (id: string) => {
    toast({
      title: t('purchases.expenses.receiptUploaded'),
      description: t('purchases.expenses.receiptUploadedDesc'),
    });
  };

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

  const getCategoryBadge = (category: string) => {
    const colorClass = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';
    const keyMap: Record<string, string> = {
      'Travel': 'travel',
      'Office Supplies': 'office',
      'Software': 'software',
      'Entertainment': 'entertainment',
      'Utilities': 'utilities',
      'Marketing': 'marketing',
      'Training': 'training',
      'Equipment': 'equipment',
      'Meals': 'meals',
      'Communication': 'communication',
      'Other': 'other'
    };
    const translationKey = keyMap[category] || category.toLowerCase();

    return (
      <Badge className={`${colorClass} border-0`}>
        <Tag className="h-3 w-3 me-1" />
        {t(`purchases.expenses.categories.${translationKey}`, category)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleScanComplete = (data: any) => {
    // Pre-fill the form with scanned data
    form.setValue('description', data.items?.[0]?.description || `Expense from ${data.contact_name || 'Unknown'}`);
    form.setValue('amount', data.total ? String(data.total) : '');
    form.setValue('date', data.date || new Date().toISOString().split('T')[0]);
    // Try to map category if AI suggests one, else leave blank
    if (data.category && expenseCategories.includes(data.category)) {
      form.setValue('category', data.category);
    }
    
    setIsCreateOpen(true);
    toast({
      title: t("ai.scanSuccess"),
      description: t("ai.scanFormFilled", "Form pre-filled from document."),
    });
  };

  return (
    <PageContainer className="w-full max-w-screen-lg mx-auto px-3 md:px-6 space-y-6">
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-sm text-destructive">{(error as any)?.message || t('common.error')}</p>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('purchases.expenses.title')}</h1>
          <p className="text-muted-foreground mt-1 hidden sm:block">{t('purchases.expenses.description')}</p>
          <p className="text-muted-foreground mt-1 sm:hidden">{t('purchases.expenses.descriptionShort')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/reports/ai-analytics?source=expenses-form">
            <Button variant="ghost" size={isMobile ? 'sm' : 'default'} className="hidden md:inline-flex">
              <BarChart3 className="h-4 w-4 me-2" />
              {t('reports.aiAnalytics.title')}
            </Button>
          </Link>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              size={isMobile ? 'sm' : 'default'}
              data-testid="button-new-expense"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 me-2" />
              {t('purchases.expenses.addExpense')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExpense ? t('purchases.expenses.editExpense') : t('purchases.expenses.addExpense')}</DialogTitle>
            </DialogHeader>
              <div className="flex items-center justify-end pb-2">
                <AIIngestDialog
                  open={scanOpen}
                  onOpenChange={setScanOpen}
                  title={t('ai.pasteReceiptText')}
                  onExtract={handleScanExtract}
                  allowPdf
                  autoCloseOnExtract
                  locale={i18n?.language || 'en'}
                />
              </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Description */}
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

                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.amount')}</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category with AI Suggest */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>{t('common.category')}</FormLabel>
                        <Button type="button" size="sm" variant="outline" onClick={onSuggestCategory} disabled={aiClassify.isPending}>
                          {aiClassify.isPending ? t('ai.generating') : t('ai.suggestCategory')}
                        </Button>
                      </div>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('purchases.expenses.selectCategory')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((cat) => {
                            const keyMap: Record<string, string> = {
                              'Travel': 'travel',
                              'Office Supplies': 'office',
                              'Software': 'software',
                              'Entertainment': 'entertainment',
                              'Utilities': 'utilities',
                              'Marketing': 'marketing',
                              'Training': 'training',
                              'Equipment': 'equipment',
                              'Meals': 'meals',
                              'Communication': 'communication',
                              'Other': 'other'
                            };
                            const translationKey = keyMap[cat] || cat.toLowerCase();
                            return (
                              <SelectItem key={cat} value={cat}>
                                {t(`purchases.expenses.categories.${translationKey}`, cat)}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {aiHint && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {t('ai.suggested')}: <span className="font-medium">{aiHint.category}</span> · {Math.round(aiHint.confidence * 100)}%
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expense Account - Link to Chart of Accounts */}
                {expenseAccounts.length > 0 && (
                  <FormField
                    control={form.control}
                    name="expense_account_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.expenses.expenseAccount', { defaultValue: 'حساب المصروفات' })}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('purchases.expenses.selectExpenseAccount', { defaultValue: 'اختر حساب المصروفات' })} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expenseAccounts.map((account) => (
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

                {/* Project */}
                <FormField
                  control={form.control}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.project')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('common.selectProject')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.date')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Paid by */}
                <FormField
                  control={form.control}
                  name="paid_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('purchases.expenses.paidBy')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('purchases.expenses.paidByPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Payment method */}
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('purchases.expenses.paymentMethod')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('placeholders.selectMethod', 'Select method')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => {
                            const keyMap: Record<string, string> = {
                              'Cash': 'cash',
                              'Credit Card': 'creditCard',
                              'Company Card': 'companyCard',
                              'Bank Transfer': 'bankTransfer',
                              'Personal Card': 'personalCard',
                              'Petty Cash': 'pettyCash'
                            };
                            const translationKey = keyMap[method] || method.toLowerCase();
                            return (
                              <SelectItem key={method} value={method}>
                                {t(`purchases.expenses.paymentMethods.${translationKey}`, method)}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Paid From Account - Link to Chart of Accounts */}
                {cashAccounts.length > 0 && (
                  <FormField
                    control={form.control}
                    name="paid_from_account_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.expenses.paidFromAccount', { defaultValue: 'دُفع من حساب' })}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('purchases.expenses.selectPaidFromAccount', { defaultValue: 'اختر حساب الدفع' })} />
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

                {/* Reimbursable */}
                <FormField
                  control={form.control}
                  name="reimbursable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t('purchases.expenses.reimbursable')}</FormLabel>
                        <div className="text-sm text-muted-foreground">{t('purchases.expenses.reimbursableHint')}</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Notes */}
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

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                    {createMutation.isPending ? t('common.creating') : t('purchases.expenses.createExpense')}
                  </Button>
                </div>
              </form>
            </Form>
              {/* Preview Extracted Dialog */}
              <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center justify-between gap-2">
                      <DialogTitle>{t('ai.previewExtraction')}</DialogTitle>
                      <div className="flex items-center gap-2">
                        {extracted && (() => {
                          const fields = ['date','total','currency','vendor_name','payment_method','notes'];
                          const { count, total, percent } = computeCompleteness(extracted, fields);
                          return <Badge variant="secondary" className="text-xs">{t('ai.completeness')}: {count}/{total} ({percent}%)</Badge>;
                        })()}
                        <Button size="sm" variant="ghost" onClick={() => setAllApply(true)}>{t('common.all')}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAllApply(false)}>{t('common.none')}</Button>
                        <Button size="sm" variant="ghost" onClick={resetApplyDefaults}>{t('common.reset')}</Button>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-3">
                    {extracted ? (
                      <ExtractionPreview
                        extraction={extracted}
                        kind="receipt"
                        requiredFields={["date","total"]}
                        fieldMap={{ date: 'date', total: 'amount', payment_method: 'payment_method' }}
                        currentValues={{ date: form.getValues('date'), amount: form.getValues('amount'), payment_method: form.getValues('payment_method'), notes: form.getValues('notes') }}
                        applyToggles={applyFields as any}
                        onToggle={(k, v) => handleApplyToggle(k as any, v)}
                        toggleLabels={{
                          date: t('common.date'),
                          total: t('common.amount'),
                          payment_method: t('purchases.expenses.paymentMethod'),
                          notes_vendor: t('ai.vendor'),
                          notes_text: t('common.notes'),
                        }}
                      />
                    ) : (
                      <p className="text-muted-foreground">{t('ai.noData')}</p>
                    )}
                    <div className="flex items-center gap-3 justify-end">
                      <Button variant="outline" onClick={() => setPreviewOpen(false)}>{t('common.cancel')}</Button>
                      <Button type="button" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(JSON.stringify(extracted, null, 2)); setCopied(true); setTimeout(()=>setCopied(false), 1500);} catch {} }}>
                        {copied ? t('common.copied') : t('ai.copyJson')}
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => { try { const blob = new Blob([JSON.stringify(extracted, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'extraction.json'; a.click(); URL.revokeObjectURL(url); } catch {} }}>
                        {t('ai.downloadJson')}
                      </Button>
                      <Button onClick={applyExtracted}>{t('common.apply')}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.expenses.totalExpenses')}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t('common.totalAmount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalAmount, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.expenses.allExpenses')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('common.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(stats.pending, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.expenses.awaitingApproval')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('common.approved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.approved, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.expenses.approvedExpenses')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.expenses.reimbursable')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.reimbursable, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.expenses.toReimburse')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchExpenses')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
            data-testid="input-search-expenses"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border sticky top-0 z-20"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all">{t('purchases.expenses.allExpenses')}</TabsTrigger>
          <TabsTrigger value="pending">{t('common.pending')}</TabsTrigger>
          <TabsTrigger value="approved">{t('common.approved')}</TabsTrigger>
          <TabsTrigger value="rejected">{t('common.rejected')}</TabsTrigger>
          <TabsTrigger value="reimbursable">{t('purchases.expenses.reimbursable')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('purchases.expenses.expenseNumber')}</TableHead>
                      <TableHead>{t('common.description')}</TableHead>
                      <TableHead>{t('common.category')}</TableHead>
                      <TableHead>{t('common.date')}</TableHead>
                      <TableHead>{t('purchases.expenses.paidBy')}</TableHead>
                      <TableHead>{t('purchases.expenses.payment')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead>{t('purchases.expenses.receipt')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                      <TableCell className="font-medium" data-label={t('purchases.expenses.expenseNumber')}>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          {expense.expense_number}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('common.description')}>
                        <div className="max-w-[200px] truncate">
                          {expense.description}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('common.category')}>{getCategoryBadge(expense.category)}</TableCell>
                      <TableCell data-label={t('common.date')}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(expense.date).toLocaleDateString(i18n.language)}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('purchases.expenses.paidBy')}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {expense.paid_by}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('purchases.expenses.payment')}>{expense.payment_method}</TableCell>
                      <TableCell className="font-semibold" data-label={t('common.amount')}>
                        {formatCurrency(expense.amount, expense.currency)}
                      </TableCell>
                      <TableCell data-label={t('common.status')}>{getStatusBadge(expense.status)}</TableCell>
                      <TableCell data-label={t('purchases.expenses.receipt')}>
                        {expense.has_receipt ? (
                          <Paperclip className="h-4 w-4 text-green-600" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end" data-label={t('common.actions')}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${expense.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 me-2" />
                              {t('purchases.expenses.viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                              <Edit className="h-4 w-4 me-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 me-2" />
                              {t('common.duplicate')}
                            </DropdownMenuItem>
                            {!expense.has_receipt && (
                              <DropdownMenuItem onClick={() => handleUploadReceipt(expense.id)}>
                                <Upload className="h-4 w-4 me-2" />
                                {t('purchases.expenses.uploadReceipt')}
                              </DropdownMenuItem>
                            )}
                            {expense.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(expense.id)}>
                                  <CheckCircle className="h-4 w-4 me-2" />
                                  {t('purchases.expenses.approve')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(expense.id)}>
                                  <XCircle className="h-4 w-4 me-2" />
                                  {t('purchases.expenses.reject')}
                                </DropdownMenuItem>
                              </>
                            )}
                            {expense.status === 'approved' && expense.reimbursable && (
                              <DropdownMenuItem onClick={() => handleReimburse(expense.id)}>
                                <CreditCard className="h-4 w-4 me-2" />
                                {t('purchases.expenses.reimburse')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="h-4 w-4 me-2" />
                              {t('common.delete')}
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
    </PageContainer>
  );
}