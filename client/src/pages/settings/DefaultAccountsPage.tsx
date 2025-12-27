import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Save,
  Loader2,
  BookOpen,
  Wallet,
  CreditCard,
  Landmark,
  Package,
  Receipt,
  ShoppingCart,
  DollarSign
} from 'lucide-react';

interface DefaultAccountSettings {
  default_sales_account_id: string | null;
  default_purchase_account_id: string | null;
  default_inventory_account_id: string | null;
  default_receivable_account_id: string | null;
  default_payable_account_id: string | null;
  default_bank_account_id: string | null;
  default_cash_account_id: string | null;
  default_expense_account_id: string | null;
}

interface Account {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  type: string;
  subtype?: string;
}

export default function DefaultAccountsPage() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isRTL = i18n.dir() === 'rtl';

  // Fetch accounts
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
  });

  // Fetch current settings
  const { data: settings, isLoading: settingsLoading } = useQuery<DefaultAccountSettings>({
    queryKey: ['/api/settings/default-accounts'],
  });

  // State for form
  const [salesAccount, setSalesAccount] = useState<string>('');
  const [purchaseAccount, setPurchaseAccount] = useState<string>('');
  const [inventoryAccount, setInventoryAccount] = useState<string>('');
  const [receivableAccount, setReceivableAccount] = useState<string>('');
  const [payableAccount, setPayableAccount] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [cashAccount, setCashAccount] = useState<string>('');
  const [expenseAccount, setExpenseAccount] = useState<string>('');

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setSalesAccount(settings.default_sales_account_id || '');
      setPurchaseAccount(settings.default_purchase_account_id || '');
      setInventoryAccount(settings.default_inventory_account_id || '');
      setReceivableAccount(settings.default_receivable_account_id || '');
      setPayableAccount(settings.default_payable_account_id || '');
      setBankAccount(settings.default_bank_account_id || '');
      setCashAccount(settings.default_cash_account_id || '');
      setExpenseAccount(settings.default_expense_account_id || '');
    }
  }, [settings]);

  // Filter accounts by type
  const revenueAccounts = accounts.filter(a => a.type === 'revenue');
  const expenseAccounts = accounts.filter(a => a.type === 'expense');
  const assetAccounts = accounts.filter(a => a.type === 'asset');
  const liabilityAccounts = accounts.filter(a => a.type === 'liability');
  const cashAccounts = accounts.filter(a => a.type === 'asset' && a.subtype === 'cash');
  const bankAccounts = accounts.filter(a => a.type === 'asset' && (a.subtype === 'bank' || a.subtype === 'cash'));
  const inventoryAccounts = accounts.filter(a => a.type === 'asset' && a.subtype === 'inventory');
  const receivableAccts = accounts.filter(a => a.type === 'asset' && a.subtype === 'accounts_receivable');
  const payableAccts = accounts.filter(a => a.type === 'liability' && a.subtype === 'accounts_payable');
  const cogsAccounts = accounts.filter(a => a.type === 'expense' && (a.subtype === 'cogs' || a.code?.startsWith('5')));

  // Get display name based on language
  const getAccountDisplayName = (account: Account) => {
    if (isRTL && account.name_ar) {
      return `${account.code} - ${account.name_ar}`;
    }
    return `${account.code} - ${account.name}`;
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<DefaultAccountSettings>) => {
      const response = await apiRequest('PUT', '/api/settings/default-accounts', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/default-accounts'] });
      toast({
        title: t('common.settingsSaved'),
        description: t('settings.defaultAccountsSaved', 'Default accounts have been saved successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('common.errorSaving'),
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      default_sales_account_id: salesAccount || null,
      default_purchase_account_id: purchaseAccount || null,
      default_inventory_account_id: inventoryAccount || null,
      default_receivable_account_id: receivableAccount || null,
      default_payable_account_id: payableAccount || null,
      default_bank_account_id: bankAccount || null,
      default_cash_account_id: cashAccount || null,
      default_expense_account_id: expenseAccount || null,
    });
  };

  const isLoading = accountsLoading || settingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('settings.defaultAccounts', 'Default Accounts')}</h1>
          <p className="text-muted-foreground">
            {t('settings.defaultAccountsDescription', 'Configure default accounts for automatic journal entries')}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin me-2" />
          ) : (
            <Save className="h-4 w-4 me-2" />
          )}
          {t('common.save')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales & Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              {t('settings.salesRevenue', 'Sales & Revenue')}
            </CardTitle>
            <CardDescription>
              {t('settings.salesRevenueDesc', 'Accounts used for sales invoices and income')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.defaultSalesAccount', 'Default Sales Account')}</Label>
              <Select value={salesAccount || '__none__'} onValueChange={(v) => setSalesAccount(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectAccount', 'Select account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {revenueAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.salesAccountHint', 'Used for invoice line items without a specific account')}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.defaultReceivableAccount', 'Default Accounts Receivable')}</Label>
              <Select value={receivableAccount || '__none__'} onValueChange={(v) => setReceivableAccount(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectAccount', 'Select account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {receivableAccts.length > 0 ? receivableAccts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  )) : assetAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.receivableAccountHint', 'Used for customer invoice balances')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Purchases & Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              {t('settings.purchasesExpenses', 'Purchases & Expenses')}
            </CardTitle>
            <CardDescription>
              {t('settings.purchasesExpensesDesc', 'Accounts used for bills and expenses')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.defaultPurchaseAccount', 'Default Purchase Account (COGS)')}</Label>
              <Select value={purchaseAccount || '__none__'} onValueChange={(v) => setPurchaseAccount(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectAccount', 'Select account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {cogsAccounts.length > 0 ? cogsAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  )) : expenseAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.purchaseAccountHint', 'Used for bill line items without a specific account')}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.defaultPayableAccount', 'Default Accounts Payable')}</Label>
              <Select value={payableAccount || '__none__'} onValueChange={(v) => setPayableAccount(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectAccount', 'Select account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {payableAccts.length > 0 ? payableAccts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  )) : liabilityAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.payableAccountHint', 'Used for supplier bill balances')}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.defaultExpenseAccount', 'Default Expense Account')}</Label>
              <Select value={expenseAccount || '__none__'} onValueChange={(v) => setExpenseAccount(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectAccount', 'Select account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {expenseAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.expenseAccountHint', 'Used for general expenses without a specific account')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {t('settings.inventory', 'Inventory')}
            </CardTitle>
            <CardDescription>
              {t('settings.inventoryDesc', 'Accounts used for inventory tracking')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.defaultInventoryAccount', 'Default Inventory Account')}</Label>
              <Select value={inventoryAccount || '__none__'} onValueChange={(v) => setInventoryAccount(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectAccount', 'Select account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {inventoryAccounts.length > 0 ? inventoryAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  )) : assetAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.inventoryAccountHint', 'Used for inventory items without a specific account')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Banking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-purple-600" />
              {t('settings.banking', 'Banking')}
            </CardTitle>
            <CardDescription>
              {t('settings.bankingDesc', 'Default accounts for payments and receipts')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('settings.defaultBankAccount', 'Default Bank Account')}</Label>
              <Select value={bankAccount || '__none__'} onValueChange={(v) => setBankAccount(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectAccount', 'Select account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {bankAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.bankAccountHint', 'Used for bank transfers and payments')}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.defaultCashAccount', 'Default Cash Account')}</Label>
              <Select value={cashAccount || '__none__'} onValueChange={(v) => setCashAccount(v === '__none__' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.selectAccount', 'Select account')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">
                    {t('common.none', 'None')}
                  </SelectItem>
                  {cashAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountDisplayName(account)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.cashAccountHint', 'Used for cash payments and receipts')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
