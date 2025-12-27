import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Wallet, 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  Building2, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

// Bank account form schema factory for i18n validation messages
const bankAccountSchemaFactory = (t: TFunction) => z.object({
  name: z.string().min(2, t('validation.accountNameMin')),
  account_id: z.string().min(1, t('validation.accountRequired', 'GL Account is required')),
  account_number: z.string().min(5, t('validation.accountNumberRequired')),
  bank_name: z.string().min(2, t('validation.bankNameRequired')),
  branch: z.string().optional(),
  swift_code: z.string().optional(),
  iban: z.string().optional(),
  currency: z.string().default('USD'),
  account_type: z.enum(['checking', 'savings', 'credit_card', 'cash', 'investment']),
  opening_balance: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  current_balance: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  is_active: z.boolean(),
  is_default: z.boolean(),
});

type BankAccountForm = z.infer<ReturnType<typeof bankAccountSchemaFactory>>;

// GL Account interface
interface GLAccount {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  account_type: string;
  account_subtype: string;
}

export default function BankAccountsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const companyCurrency = useCompanyCurrency();
  const [showDialog, setShowDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const bankAccountSchema = bankAccountSchemaFactory(t);

  // Helper to get GL account display name
  const getGLAccountName = (account: GLAccount) => {
    if (i18n.language === 'ar' && account.name_ar) {
      return account.name_ar;
    }
    return account.name;
  };

  // Fetch GL accounts for linking
  const { data: glAccounts = [] } = useQuery<GLAccount[]>({
    queryKey: ['/api/accounts'],
  });

  // Fetch company default accounts
  const { data: defaultAccounts } = useQuery<{
    default_bank_account_id: string | null;
  }>({
    queryKey: ['/api/settings/default-accounts'],
  });

  // Filter cash/bank type GL accounts
  const cashGLAccounts = glAccounts.filter(
    (a) => a.account_type === 'asset' && 
           (a.account_subtype === 'cash' || a.account_subtype === 'current_asset')
  );

  // Account types with translations
  const accountTypes = [
    { value: 'checking', label: t('banking.checkingAccount'), icon: Wallet },
    { value: 'savings', label: t('banking.savingsAccount'), icon: DollarSign },
    { value: 'credit_card', label: t('banking.creditCard'), icon: CreditCard },
    { value: 'cash', label: t('banking.cash'), icon: DollarSign },
    { value: 'investment', label: t('banking.investment'), icon: TrendingUp },
  ];

  // Comprehensive global currency list with symbols
  const currencies = [
  // Major World Currencies
  { code: 'USD', name: t('currencies.USD'), symbol: '$' },
  { code: 'EUR', name: t('currencies.EUR'), symbol: '€' },
  { code: 'GBP', name: t('currencies.GBP'), symbol: '£' },
  { code: 'JPY', name: t('currencies.JPY'), symbol: '¥' },
  { code: 'CHF', name: t('currencies.CHF'), symbol: 'CHF' },
  { code: 'CAD', name: t('currencies.CAD'), symbol: 'C$' },
  { code: 'AUD', name: t('currencies.AUD'), symbol: 'A$' },
  { code: 'NZD', name: t('currencies.NZD'), symbol: 'NZ$' },
  
  // Arabic & Middle Eastern Currencies
  { code: 'AED', name: t('currencies.AED'), symbol: 'د.إ' },
  { code: 'SAR', name: t('currencies.SAR'), symbol: 'ر.س' },
  { code: 'EGP', name: t('currencies.EGP'), symbol: 'ج.م' },
  { code: 'SYP', name: t('currencies.SYP'), symbol: 'ل.س' }, // Syria - specifically requested
  { code: 'LBP', name: t('currencies.LBP'), symbol: 'ل.ل' }, // Lebanon
  { code: 'IQD', name: t('currencies.IQD'), symbol: 'ع.د' }, // Iraq
  { code: 'JOD', name: t('currencies.JOD'), symbol: 'د.ا' }, // Jordan
  { code: 'KWD', name: t('currencies.KWD'), symbol: 'د.ك' }, // Kuwait
  { code: 'QAR', name: t('currencies.QAR'), symbol: 'ر.ق' }, // Qatar
  { code: 'BHD', name: t('currencies.BHD'), symbol: 'د.ب' }, // Bahrain
  { code: 'OMR', name: t('currencies.OMR'), symbol: 'ر.ع' }, // Oman
  { code: 'YER', name: t('currencies.YER'), symbol: 'ر.ي' }, // Yemen
  { code: 'MAD', name: t('currencies.MAD'), symbol: 'د.م' }, // Morocco
  { code: 'DZD', name: t('currencies.DZD'), symbol: 'د.ج' }, // Algeria
  { code: 'TND', name: t('currencies.TND'), symbol: 'د.ت' }, // Tunisia
  { code: 'LYD', name: t('currencies.LYD'), symbol: 'ل.د' }, // Libya
  { code: 'SDG', name: t('currencies.SDG'), symbol: 'ج.س' }, // Sudan
  { code: 'ILS', name: t('currencies.ILS'), symbol: '₪' }, // Israel
  { code: 'IRR', name: t('currencies.IRR'), symbol: 'ر' }, // Iran
  { code: 'TRY', name: t('currencies.TRY'), symbol: '₺' }, // Turkey
  
  // Asian Currencies
  { code: 'PHP', name: t('currencies.PHP'), symbol: '₱' }, // Philippines - specifically requested
  { code: 'CNY', name: t('currencies.CNY'), symbol: '¥' }, // China
  { code: 'KRW', name: t('currencies.KRW'), symbol: '₩' }, // South Korea
  { code: 'INR', name: t('currencies.INR'), symbol: '₹' }, // India
  { code: 'IDR', name: t('currencies.IDR'), symbol: 'Rp' }, // Indonesia
  { code: 'THB', name: t('currencies.THB'), symbol: '฿' }, // Thailand
  { code: 'MYR', name: t('currencies.MYR'), symbol: 'RM' }, // Malaysia
  { code: 'SGD', name: t('currencies.SGD'), symbol: 'S$' }, // Singapore
  { code: 'VND', name: t('currencies.VND'), symbol: '₫' }, // Vietnam
  { code: 'BDT', name: t('currencies.BDT'), symbol: '৳' }, // Bangladesh
  { code: 'PKR', name: t('currencies.PKR'), symbol: 'Rs' }, // Pakistan
  { code: 'LKR', name: t('currencies.LKR'), symbol: 'Rs' }, // Sri Lanka
  { code: 'MMK', name: t('currencies.MMK'), symbol: 'K' }, // Myanmar
  { code: 'KHR', name: t('currencies.KHR'), symbol: '៛' }, // Cambodia
  { code: 'LAK', name: t('currencies.LAK'), symbol: '₭' }, // Laos
  { code: 'NPR', name: t('currencies.NPR'), symbol: 'Rs' }, // Nepal
  { code: 'BTN', name: t('currencies.BTN'), symbol: 'Nu' }, // Bhutan
  { code: 'MNT', name: t('currencies.MNT'), symbol: '₮' }, // Mongolia
  { code: 'KZT', name: t('currencies.KZT'), symbol: '₸' }, // Kazakhstan
  { code: 'UZS', name: t('currencies.UZS'), symbol: 'лв' }, // Uzbekistan
  { code: 'TJS', name: t('currencies.TJS'), symbol: 'ЅМ' }, // Tajikistan
  { code: 'KGS', name: t('currencies.KGS'), symbol: 'лв' }, // Kyrgyzstan
  { code: 'TMT', name: t('currencies.TMT'), symbol: 'T' }, // Turkmenistan
  { code: 'AFN', name: t('currencies.AFN'), symbol: '؋' }, // Afghanistan
  
  // European Currencies
  { code: 'NOK', name: t('currencies.NOK'), symbol: 'kr' }, // Norway
  { code: 'SEK', name: t('currencies.SEK'), symbol: 'kr' }, // Sweden
  { code: 'DKK', name: t('currencies.DKK'), symbol: 'kr' }, // Denmark
  { code: 'ISK', name: t('currencies.ISK'), symbol: 'kr' }, // Iceland
  { code: 'PLN', name: t('currencies.PLN'), symbol: 'zł' }, // Poland
  { code: 'CZK', name: t('currencies.CZK'), symbol: 'Kč' }, // Czech Republic
  { code: 'HUF', name: t('currencies.HUF'), symbol: 'Ft' }, // Hungary
  { code: 'RON', name: t('currencies.RON'), symbol: 'lei' }, // Romania
  { code: 'BGN', name: t('currencies.BGN'), symbol: 'лв' }, // Bulgaria
  { code: 'HRK', name: t('currencies.HRK'), symbol: 'kn' }, // Croatia
  { code: 'RSD', name: t('currencies.RSD'), symbol: 'дин' }, // Serbia
  { code: 'BAM', name: t('currencies.BAM'), symbol: 'KM' }, // Bosnia
  { code: 'MKD', name: t('currencies.MKD'), symbol: 'ден' }, // North Macedonia
  { code: 'ALL', name: t('currencies.ALL'), symbol: 'L' }, // Albania
  { code: 'MDL', name: t('currencies.MDL'), symbol: 'L' }, // Moldova
  { code: 'UAH', name: t('currencies.UAH'), symbol: '₴' }, // Ukraine
  { code: 'BYN', name: t('currencies.BYN'), symbol: 'Br' }, // Belarus
  { code: 'RUB', name: t('currencies.RUB'), symbol: '₽' }, // Russia
  
  // African Currencies
  { code: 'ZAR', name: t('currencies.ZAR'), symbol: 'R' }, // South Africa
  { code: 'NGN', name: t('currencies.NGN'), symbol: '₦' }, // Nigeria
  { code: 'GHS', name: t('currencies.GHS'), symbol: '₵' }, // Ghana
  { code: 'KES', name: t('currencies.KES'), symbol: 'KSh' }, // Kenya
  { code: 'UGX', name: t('currencies.UGX'), symbol: 'USh' }, // Uganda
  { code: 'TZS', name: t('currencies.TZS'), symbol: 'TSh' }, // Tanzania
  { code: 'ETB', name: t('currencies.ETB'), symbol: 'Br' }, // Ethiopia
  { code: 'RWF', name: t('currencies.RWF'), symbol: 'RF' }, // Rwanda
  { code: 'XOF', name: t('currencies.XOF'), symbol: 'CFA' }, // West Africa CFA
  { code: 'XAF', name: t('currencies.XAF'), symbol: 'FCFA' }, // Central Africa CFA
  { code: 'MZN', name: t('currencies.MZN'), symbol: 'MT' }, // Mozambique
  { code: 'BWP', name: t('currencies.BWP'), symbol: 'P' }, // Botswana
  { code: 'NAD', name: t('currencies.NAD'), symbol: 'N$' }, // Namibia
  { code: 'SZL', name: t('currencies.SZL'), symbol: 'E' }, // Eswatini
  { code: 'LSL', name: t('currencies.LSL'), symbol: 'L' }, // Lesotho
  
  // American Currencies
  { code: 'MXN', name: t('currencies.MXN'), symbol: '$' }, // Mexico
  { code: 'BRL', name: t('currencies.BRL'), symbol: 'R$' }, // Brazil
  { code: 'ARS', name: t('currencies.ARS'), symbol: '$' }, // Argentina
  { code: 'CLP', name: t('currencies.CLP'), symbol: '$' }, // Chile
  { code: 'COP', name: t('currencies.COP'), symbol: '$' }, // Colombia
  { code: 'PEN', name: t('currencies.PEN'), symbol: 'S/' }, // Peru
  { code: 'UYU', name: t('currencies.UYU'), symbol: '$U' }, // Uruguay
  { code: 'PYG', name: t('currencies.PYG'), symbol: '₲' }, // Paraguay
  { code: 'BOB', name: t('currencies.BOB'), symbol: 'Bs' }, // Bolivia
  { code: 'VED', name: t('currencies.VED'), symbol: 'Bs' }, // Venezuela
  { code: 'GYD', name: t('currencies.GYD'), symbol: 'G$' }, // Guyana
  { code: 'SRD', name: t('currencies.SRD'), symbol: 'Sr$' }, // Suriname
];

// Removed mock data - using real API data only

  // Fetch bank accounts from API
  const { 
    data: accounts = [], 
    isLoading: isLoadingAccounts, 
    error: accountsError 
  } = useQuery({
    queryKey: ['/api/banking/accounts'],
    select: (data: any[]) => {
      if (!data) return [];
      // Normalize numeric fields to ensure proper calculation
      return data.map(account => ({
        ...account,
        current_balance: Number(account.current_balance) || 0,
        opening_balance: Number(account.opening_balance) || 0,
      }));
    }
  });

  // Fetch recent transactions from API
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions, 
    error: transactionsError 
  } = useQuery({
    queryKey: ['/api/banking/transactions'],
    select: (data: any[]) => {
      if (!data) return [];
      // Normalize numeric fields
      return data.map(transaction => ({
        ...transaction,
        amount: Number(transaction.amount) || 0,
      }));
    }
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: BankAccountForm) => {
      // Data is already properly typed thanks to schema preprocessing
      if (editingAccount) {
        return apiRequest('PUT', `/api/banking/accounts/${editingAccount.id}`, data);
      } else {
        return apiRequest('POST', '/api/banking/accounts', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/accounts'] });
      toast({
        title: editingAccount ? t('banking.accounts.accountUpdated') : t('banking.accounts.accountCreated'),
        description: editingAccount
          ? t('banking.accounts.accountUpdatedDesc')
          : t('banking.accounts.accountCreatedDesc'),
      });
      setShowDialog(false);
      setEditingAccount(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('banking.accounts.saveError'),
        variant: 'destructive',
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (accountId: string) => {
      return apiRequest('DELETE', `/api/banking/accounts/${accountId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banking/accounts'] });
      toast({
        title: t('banking.accounts.accountDeleted'),
        description: t('banking.accounts.accountDeletedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('banking.accounts.deleteError'),
        variant: 'destructive',
      });
    },
  });

  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  const totalAssets = accounts
    .filter(acc => acc.account_type !== 'credit_card' && acc.current_balance > 0)
    .reduce((sum, acc) => sum + acc.current_balance, 0);
  const totalLiabilities = accounts
    .filter(acc => acc.account_type === 'credit_card' || acc.current_balance < 0)
    .reduce((sum, acc) => sum + Math.abs(acc.current_balance), 0);

  // Form with default bank account from company settings
  const form = useForm<BankAccountForm>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: editingAccount || {
      name: '',
      account_id: defaultAccounts?.default_bank_account_id || '',
      account_number: '',
      bank_name: '',
      branch: '',
      swift_code: '',
      iban: '',
      currency: 'USD',
      account_type: 'checking',
      opening_balance: '',
      current_balance: '',
      is_active: true,
      is_default: false,
    },
  });

  // Update form defaults when defaultAccounts loads
  React.useEffect(() => {
    if (defaultAccounts?.default_bank_account_id && !editingAccount && !form.getValues('account_id')) {
      form.setValue('account_id', defaultAccounts.default_bank_account_id);
    }
  }, [defaultAccounts, editingAccount, form]);

  const onSubmit = async (data: BankAccountForm) => {
    saveMutation.mutate(data);
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    form.reset({
      ...account,
      account_id: account.account_id || '',
      opening_balance: account.opening_balance?.toString() || '',
      current_balance: account.current_balance?.toString() || '',
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('banking.accounts.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency || companyCurrency,
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    const accountType = accountTypes.find(t => t.value === type);
    return accountType ? accountType.icon : Wallet;
  };

  // Show loading state for accounts
  if (isLoadingAccounts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('banking.accounts.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('banking.accounts.loading')}</p>
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
  if (accountsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('banking.accounts.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('banking.accounts.errorLoading')}</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{t('banking.accounts.failedToLoad')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('banking.accounts.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('banking.accounts.description')}
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setEditingAccount(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" data-testid="button-add-account">
              <Plus className="h-4 w-4 me-2" />
              {t('banking.accounts.addAccount')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? t('banking.accounts.editAccount') : t('banking.accounts.addAccount')}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form id="bank-account-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{`${t('banking.accounts.accountName')} *`}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('banking.accounts.accountNamePlaceholder')} data-testid="input-account-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{`${t('banking.accounts.accountType')} *`}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-account-type">
                              <SelectValue placeholder={t('placeholders.Select type')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accountTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {type.label}
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
                </div>

                {/* GL Account Link */}
                <FormField
                  control={form.control}
                  name="account_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{`${t('banking.accounts.glAccount', { defaultValue: 'حساب دليل الحسابات' })} *`}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-gl-account">
                            <SelectValue placeholder={t('banking.accounts.selectGLAccount', { defaultValue: 'اختر الحساب المحاسبي' })} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cashGLAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <span className="font-mono text-xs me-2">{account.code}</span>
                              {getGLAccountName(account)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bank_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{`${t('banking.accounts.bankName')} *`}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('banking.accounts.bankNamePlaceholder')} data-testid="input-bank-name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.accounts.branch')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('banking.accounts.branchPlaceholder')} data-testid="input-branch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{`${t('banking.accounts.accountNumber')} *`}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('banking.accounts.accountNumberPlaceholder')} data-testid="input-account-number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.currency')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-currency">
                              <SelectValue placeholder={t('placeholders.Select currency')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.code} - {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="swift_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.accounts.swiftCode')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('banking.accounts.swiftPlaceholder')} data-testid="input-swift" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.accounts.iban')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('banking.accounts.ibanPlaceholder')} data-testid="input-iban" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="opening_balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.accounts.openingBalance')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder={t('banking.accounts.openingBalancePlaceholder')} 
                            data-testid="input-opening-balance" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="current_balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('banking.accounts.currentBalance')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder={t('banking.accounts.currentBalancePlaceholder')} 
                            data-testid="input-current-balance" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 flex-1">
                        <div className="space-y-0.5">
                          <FormLabel>{t('banking.accounts.activeAccount')}</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {t('banking.accounts.activeAccountDesc')}
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_default"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 flex-1">
                        <div className="space-y-0.5">
                          <FormLabel>{t('banking.accounts.defaultAccount')}</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {t('banking.accounts.defaultAccountDesc')}
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-default"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                data-testid="button-cancel"
                className="w-full sm:w-auto"
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" form="bank-account-form" data-testid="button-save" className="w-full sm:w-auto">
                {editingAccount ? t('banking.accounts.updateAccount') : t('banking.accounts.createAccount')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.accounts.totalBalance')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('banking.accounts.acrossAllAccounts')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.accounts.totalAssets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAssets)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('banking.accounts.cashBankBalances')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.accounts.totalLiabilities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalLiabilities)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('banking.accounts.creditCardsOverdrafts')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('banking.accounts.activeAccounts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.filter(a => a.is_active).length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('banking.accounts.ofTotal', { count: accounts.length })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const Icon = getAccountIcon(account.account_type);
          return (
            <Card key={account.id} data-testid={`card-account-${account.id}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {account.name}
                  </div>
                  <div className="flex gap-1">
                    {account.is_default && (
                      <Badge variant="default" className="text-xs">{t('banking.accounts.defaultBadge')}</Badge>
                    )}
                    {!account.is_active && (
                      <Badge variant="secondary" className="text-xs">{t('common.inactive')}</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t('banking.accounts.bank')}</p>
                  <p className="font-medium">{account.bank_name}</p>
                  {account.branch && (
                    <p className="text-sm text-muted-foreground">{account.branch}</p>
                  )}
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">{t('banking.accounts.accountNumber')}</p>
                  <p className="font-mono">{account.account_number}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">{t('banking.accounts.currentBalance')}</p>
                  <p className={`text-2xl font-bold ${account.current_balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(account.current_balance, account.currency)}
                  </p>
                </div>
                
                {account.last_transaction_date && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('banking.accounts.lastTransaction')}</p>
                    <p className="text-sm">{new Date(account.last_transaction_date).toLocaleDateString(i18n.language)}</p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(account)}
                    data-testid={`button-edit-${account.id}`}
                  >
                    <Edit className="h-3 w-3 me-1" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid={`button-reconcile-${account.id}`}
                  >
                    <CheckCircle className="h-3 w-3 me-1" />
                    {t('banking.reconciliation.reconcile')}
                  </Button>
                  {!account.is_default && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(account.id)}
                      data-testid={`button-delete-${account.id}`}
                    >
                      <Trash2 className="h-3 w-3 me-1" />
                      {t('common.delete')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('banking.accounts.recentTransactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                    <div>
                      <div className="h-4 w-32 bg-muted animate-pulse rounded mb-1" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : transactionsError ? (
            <div className="text-center py-6">
              <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{t('banking.accounts.failedToLoadTransactions')}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">{t('banking.accounts.noRecentTransactions')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-3 rounded-lg border"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex items-center gap-3">
                  {transaction.type === 'deposit' ? (
                    <ArrowDownRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.account} • {new Date(transaction.date).toLocaleDateString(i18n.language)}
                    </p>
                  </div>
                </div>
                <div className={`text-lg font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'deposit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}