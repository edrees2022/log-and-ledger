import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, Plus, Edit, Trash2, ChevronRight, ChevronDown, Wallet, Building2, CreditCard, TrendingUp, Receipt, Sparkles, Loader2, Languages, FileText } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useCompanyCurrency } from '@/hooks/use-company-currency';

// Account interface with balance info
interface Account {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  account_type: string;
  account_subtype: string;
  parent_id: string | null;
  is_system: boolean;
  is_active: boolean;
  description?: string;
  balance?: number;
  debit?: number;
  credit?: number;
}

// Account form schema
const accountSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  name_ar: z.string().optional(),
  account_type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  account_subtype: z.string().min(1),
  parent_id: z.string().optional().nullable(),
  is_active: z.boolean(),
  description: z.string().optional(),
  opening_balance: z.string().optional(),
});

type AccountForm = z.infer<typeof accountSchema>;

const accountTypes = [
  { value: 'asset', icon: Wallet, color: 'text-blue-600' },
  { value: 'liability', icon: CreditCard, color: 'text-red-600' },
  { value: 'equity', icon: Building2, color: 'text-purple-600' },
  { value: 'revenue', icon: TrendingUp, color: 'text-green-600' },
  { value: 'expense', icon: Receipt, color: 'text-orange-600' },
];

const accountSubtypes: Record<string, string[]> = {
  asset: ['current_asset', 'cash', 'accounts_receivable', 'inventory', 'fixed_asset', 'other_asset'],
  liability: ['current_liability', 'accounts_payable', 'credit_card', 'long_term_liability', 'other_liability'],
  equity: ['owners_equity', 'retained_earnings', 'share_capital', 'dividends'],
  revenue: ['sales_revenue', 'service_revenue', 'other_revenue', 'interest_income'],
  expense: ['cost_of_goods', 'operating_expense', 'salary_expense', 'rent_expense', 'utility_expense', 'other_expense'],
};

export default function AccountsPage() {
  const { t, i18n } = useTranslation();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const currency = useCompanyCurrency();
  const [showDialog, setShowDialog] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [expandedTypes, setExpandedTypes] = useState<string[]>(['asset', 'liability', 'revenue', 'expense']);
  const [selectedType, setSelectedType] = useState<string>('asset');

  // Helper to get account name based on current language
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

  // Fetch accounts with balances
  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts', 'with-balances'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/accounts?include_balances=true');
      return res.json();
    },
  });

  // Initialize default accounts mutation
  const initMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/accounts/initialize-defaults');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setShowInitDialog(false);
      toast({
        title: t('common.success'),
        description: t('accounting.accounts.messages.defaultsCreated', { count: data.accounts?.length || 0 }),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('accounting.accounts.messages.initFailed'),
        variant: 'destructive',
      });
    },
  });

  // Update Arabic names mutation
  const updateArabicNamesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/accounts/update-arabic-names');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: t('common.success'),
        description: data.message || `تم تحديث ${data.updated} حساب بالأسماء العربية`,
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || 'فشل في تحديث الأسماء العربية',
        variant: 'destructive',
      });
    },
  });

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: async (data: AccountForm) => {
      const payload = {
        ...data,
        opening_balance: data.opening_balance || '0', // Ensure string
      };
      const response = await apiRequest('POST', '/api/accounts', payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setShowDialog(false);
      toast({
        title: t('common.success'),
        description: t('accounting.accounts.messages.created'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('accounting.accounts.messages.createFailed'),
        variant: 'destructive',
      });
    },
  });

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccountForm> }) => {
      const response = await apiRequest('PUT', `/api/accounts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      setShowDialog(false);
      setEditingAccount(null);
      toast({
        title: t('common.success'),
        description: t('accounting.accounts.messages.updated'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('accounting.accounts.messages.updateFailed'),
        variant: 'destructive',
      });
    },
  });

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/accounts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accounts'] });
      toast({
        title: t('common.success'),
        description: t('accounting.accounts.messages.deleted'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('accounting.accounts.messages.deleteFailed'),
        variant: 'destructive',
      });
    },
  });

  const form = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: editingAccount || {
      code: '',
      name: '',
      name_ar: '',
      account_type: 'asset',
      account_subtype: '',
      parent_id: null,
      is_active: true,
      description: '',
    },
  });

  const onSubmit = async (data: AccountForm) => {
    if (editingAccount) {
      await updateMutation.mutateAsync({ id: editingAccount.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    form.reset(account);
    setSelectedType(account.account_type);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(`${t('accounting.accounts.messages.deleteConfirm')} ${t('accounting.accounts.messages.deleteWarning')}`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const toggleType = (type: string) => {
    setExpandedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Group accounts by type
  const groupedAccounts = accounts.reduce((acc: any, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {});

  // Calculate totals
  const calculateTotal = (type: string) => {
    const typeAccounts = groupedAccounts[type] || [];
    return typeAccounts.length;
  };

  // Calculate total balance by type
  const calculateTotalBalance = (type: string) => {
    const typeAccounts = groupedAccounts[type] || [];
    return typeAccounts.reduce((sum: number, acc: Account) => sum + (acc.balance || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('accounting.accounts.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('accounting.accounts.description')}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Update Arabic Names Button */}
          {accounts.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => updateArabicNamesMutation.mutate()}
              disabled={updateArabicNamesMutation.isPending}
            >
              {updateArabicNamesMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
              <Languages className="h-4 w-4 me-2" />
              {t('accounting.accounts.updateArabicNames', { defaultValue: 'تحديث الأسماء العربية' })}
            </Button>
          )}
          {/* Initialize Defaults Button - Always visible */}
          <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="h-4 w-4 me-2" />
                {t('accounting.accounts.initDefaults')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('accounting.accounts.initDefaults')}</DialogTitle>
                <DialogDescription>
                  {t('accounting.accounts.messages.initDefaultsDesc')}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInitDialog(false)}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  onClick={() => initMutation.mutate()}
                  disabled={initMutation.isPending}
                >
                  {initMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                  {t('common.confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingAccount(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-account">
              <Plus className="h-4 w-4 me-2" />
              {t('accounting.accounts.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? t('accounting.accounts.edit') : t('accounting.accounts.create')}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('accounting.accounts.code')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.accounts.code')} data-testid="input-account-code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('accounting.accounts.name')} (EN)</FormLabel>
                        <FormControl>
                          <Input placeholder={t('accounting.accounts.name')} data-testid="input-account-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="name_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('accounting.accounts.nameAr', { defaultValue: 'الاسم بالعربية' })}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('accounting.accounts.nameArPlaceholder', { defaultValue: 'أدخل الاسم بالعربية' })} 
                          dir="rtl" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('accounting.accounts.type')}</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedType(value);
                            form.setValue('account_subtype', '');
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-account-type">
                              <SelectValue placeholder={t('common.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${type.color}`} />
                                    {t(`accounting.accounts.types.${type.value}`)}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account_subtype"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('accounting.accounts.subtype')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-account-subtype">
                              <SelectValue placeholder={t('common.select')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(accountSubtypes[selectedType] || []).map((subtype) => {
                              const key = subtype.replace(/_(.)/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase());
                              return (
                                <SelectItem key={subtype} value={subtype}>
                                  {t(`accounting.accounts.subtypes.${key}`)}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
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
                      <FormLabel>{t('accounting.accounts.descriptionLabel')}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t('accounting.accounts.descriptionLabel')} 
                          data-testid="input-account-description" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>{t('accounting.accounts.active')}</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {t('accounting.accounts.activeDesc')}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-account-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    data-testid="button-cancel"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-account"
                  >
                    {editingAccount ? t('common.update') : t('common.create')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {accountTypes.map((type) => {
          const Icon = type.icon;
          const count = calculateTotal(type.value);
          const totalBalance = calculateTotalBalance(type.value);
          return (
            <Card key={type.value} data-testid={`card-summary-${type.value}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${type.color}`} />
                  {t(`accounting.accounts.types.${type.value}`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">{t('accounting.accounts.title')}</p>
                {totalBalance !== 0 && (
                  <p className={`text-sm font-medium mt-1 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalBalance)}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accounts List by Type */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t('accounting.accounts.messages.noAccounts')}</p>
              <p className="text-sm text-muted-foreground">
                {t('accounting.accounts.messages.startAdding')}
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowInitDialog(true)}
              >
                <Sparkles className="h-4 w-4 me-2" />
                {t('accounting.accounts.initDefaults')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          accountTypes.map((type) => {
            const typeAccounts = groupedAccounts[type.value] || [];
            const Icon = type.icon;
            const isExpanded = expandedTypes.includes(type.value);
            const totalBalance = calculateTotalBalance(type.value);
            
            if (typeAccounts.length === 0) return null;
            
            return (
              <Card key={type.value} data-testid={`card-type-${type.value}`}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleType(type.value)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <Icon className={`h-5 w-5 ${type.color}`} />
                      {t(`accounting.accounts.types.${type.value}`)}
                    </div>
                    <div className="flex items-center gap-3">
                      {totalBalance !== 0 && (
                        <span className={`text-sm font-medium ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(totalBalance)}
                        </span>
                      )}
                      <Badge variant="secondary">{typeAccounts.length} {t('accounting.accounts.title')}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-2">
                      {typeAccounts.map((account: any) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                          data-testid={`account-${account.id}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono">
                                {account.code}
                              </Badge>
                              <span className="font-medium">{getAccountName(account)}</span>
                              {!account.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('common.inactive')}
                                </Badge>
                              )}
                            </div>
                            {account.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {account.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {t(`accounting.accounts.subtypes.${account.account_subtype.replace(/_(.)/g, (_: string, c: string) => c.toUpperCase()).replace(/^[a-z]/, (c: string) => c.toUpperCase())}`)}
                              </Badge>
                              {(account.balance !== undefined && account.balance !== 0) && (
                                <span className={`text-sm font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {formatCurrency(account.balance)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setLocation(`/reports/account-ledger?account=${account.id}`)}
                              title={t('navigation.accountLedger')}
                              data-testid={`button-ledger-${account.id}`}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(account)}
                              data-testid={`button-edit-${account.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!account.is_system && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(account.id)}
                                data-testid={`button-delete-${account.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}