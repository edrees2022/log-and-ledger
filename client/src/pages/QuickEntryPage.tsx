/**
 * Quick Entry Page
 * Fast data entry for common operations
 * Optimized for mobile use with large touch targets
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/layout/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Receipt,
  ShoppingCart,
  CreditCard,
  Wallet,
  FileText,
  Package,
  Plus,
  Check,
  Loader2,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type EntryType = 'invoice' | 'expense' | 'payment' | 'receipt' | 'item';

interface QuickEntryOption {
  id: EntryType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function QuickEntryPage() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<EntryType | null>(null);

  const entryOptions: QuickEntryOption[] = [
    {
      id: 'invoice',
      label: t('quickEntry.newInvoice'),
      description: t('quickEntry.invoiceDesc'),
      icon: <Receipt className="h-8 w-8" />,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'expense',
      label: t('quickEntry.newExpense'),
      description: t('quickEntry.expenseDesc'),
      icon: <ShoppingCart className="h-8 w-8" />,
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    },
    {
      id: 'payment',
      label: t('quickEntry.recordPayment'),
      description: t('quickEntry.paymentDesc'),
      icon: <CreditCard className="h-8 w-8" />,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      id: 'receipt',
      label: t('quickEntry.recordReceipt'),
      description: t('quickEntry.receiptDesc'),
      icon: <Wallet className="h-8 w-8" />,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'item',
      label: t('quickEntry.addItem'),
      description: t('quickEntry.itemDesc'),
      icon: <Package className="h-8 w-8" />,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    },
  ];

  if (selectedType) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{entryOptions.find(o => o.id === selectedType)?.label || ''}</h1>
            <p className="text-muted-foreground">{t('quickEntry.fillDetails')}</p>
          </div>
          <QuickEntryForm
            type={selectedType}
            onBack={() => setSelectedType(null)}
            onSuccess={() => {
              setSelectedType(null);
              toast({
                title: t('common.success'),
                description: t('quickEntry.entryCreated'),
              });
            }}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t('quickEntry.title')}</h1>
          <p className="text-muted-foreground">{t('quickEntry.description')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entryOptions.map(option => (
          <Card
            key={option.id}
            className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
            onClick={() => setSelectedType(option.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn('p-3 rounded-lg', option.color)}>
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{option.label}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {option.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
        </div>

        {/* Recent Entries */}
        <Card>
          <CardHeader>
            <CardTitle>{t('quickEntry.recentEntries')}</CardTitle>
            <CardDescription>{t('quickEntry.recentEntriesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              {t('quickEntry.noRecentEntries')}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

interface QuickEntryFormProps {
  type: EntryType;
  onBack: () => void;
  onSuccess: () => void;
}

function QuickEntryForm({ type, onBack, onSuccess }: QuickEntryFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch contacts for customer/supplier selection
  const { data: contacts = [] } = useQuery({
    queryKey: ['/api/contacts'],
  });

  // Fetch items for item selection
  const { data: items = [] } = useQuery({
    queryKey: ['/api/items'],
  });

  // Fetch bank accounts for payment/receipt
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['/api/bank-accounts'],
    enabled: type === 'payment' || type === 'receipt',
  });

  // Form state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let endpoint = '';
      let data = {};

      switch (type) {
        case 'invoice':
          endpoint = '/api/sales/invoices';
          data = {
            customer_id: formData.contact_id,
            date: new Date().toISOString().split('T')[0],
            due_date: formData.due_date || new Date().toISOString().split('T')[0],
            items: [{
              description: formData.description,
              quantity: parseFloat(formData.quantity) || 1,
              unit_price: formData.amount,
            }],
            notes: formData.notes,
          };
          break;

        case 'expense':
          endpoint = '/api/purchases/expenses';
          data = {
            supplier_id: formData.contact_id,
            date: new Date().toISOString().split('T')[0],
            category: formData.category || 'general',
            amount: formData.amount,
            description: formData.description,
            notes: formData.notes,
          };
          break;

        case 'payment':
          endpoint = '/api/banking/payments';
          data = {
            bank_account_id: formData.bank_account_id,
            contact_id: formData.contact_id,
            date: new Date().toISOString().split('T')[0],
            amount: formData.amount,
            reference: formData.reference,
            notes: formData.notes,
          };
          break;

        case 'receipt':
          endpoint = '/api/banking/receipts';
          data = {
            bank_account_id: formData.bank_account_id,
            contact_id: formData.contact_id,
            date: new Date().toISOString().split('T')[0],
            amount: formData.amount,
            reference: formData.reference,
            notes: formData.notes,
          };
          break;

        case 'item':
          endpoint = '/api/items';
          data = {
            name: formData.name,
            sku: formData.sku,
            type: formData.type || 'product',
            sale_price: formData.sale_price,
            purchase_price: formData.purchase_price,
            description: formData.description,
          };
          break;
      }

      await apiRequest('POST', endpoint, data);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [endpoint.replace('/api/', '/api/')] });

      onSuccess();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('quickEntry.createError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'invoice':
        return (
          <>
            <div className="space-y-2">
              <Label>{t('common.customer')}</Label>
              <Select
                value={formData.contact_id}
                onValueChange={(v) => handleChange('contact_id', v)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t('common.selectContact')} />
                </SelectTrigger>
                <SelectContent>
                  {(contacts as any[]).filter(c => c.type === 'customer' || c.type === 'both').map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common.description')}</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('quickEntry.descriptionPlaceholder')}
                className="h-12"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('common.quantity')}</Label>
                <Input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  placeholder="1"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('common.amount')}</Label>
                <Input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="0.00"
                  className="h-12"
                />
              </div>
            </div>
          </>
        );

      case 'expense':
        return (
          <>
            <div className="space-y-2">
              <Label>{t('common.supplier')}</Label>
              <Select
                value={formData.contact_id}
                onValueChange={(v) => handleChange('contact_id', v)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t('common.selectContact')} />
                </SelectTrigger>
                <SelectContent>
                  {(contacts as any[]).filter(c => c.type === 'supplier' || c.type === 'both').map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common.amount')}</Label>
              <Input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.description')}</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('quickEntry.expenseDescPlaceholder')}
                rows={3}
              />
            </div>
          </>
        );

      case 'payment':
      case 'receipt':
        return (
          <>
            <div className="space-y-2">
              <Label>{t('banking.bankAccount')}</Label>
              <Select
                value={formData.bank_account_id}
                onValueChange={(v) => handleChange('bank_account_id', v)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t('banking.selectAccount')} />
                </SelectTrigger>
                <SelectContent>
                  {(bankAccounts as any[]).map((account: any) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{type === 'payment' ? t('common.supplier') : t('common.customer')}</Label>
              <Select
                value={formData.contact_id}
                onValueChange={(v) => handleChange('contact_id', v)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={t('common.selectContact')} />
                </SelectTrigger>
                <SelectContent>
                  {(contacts as any[]).map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common.amount')}</Label>
              <Input
                type="number"
                value={formData.amount || ''}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                className="h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.reference')}</Label>
              <Input
                value={formData.reference || ''}
                onChange={(e) => handleChange('reference', e.target.value)}
                placeholder={t('quickEntry.referencePlaceholder')}
                className="h-12"
              />
            </div>
          </>
        );

      case 'item':
        return (
          <>
            <div className="space-y-2">
              <Label>{t('inventory.itemName')}</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('quickEntry.itemNamePlaceholder')}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('inventory.sku')}</Label>
              <Input
                value={formData.sku || ''}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder={t('quickEntry.skuPlaceholder')}
                className="h-12"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('inventory.salePrice')}</Label>
                <Input
                  type="number"
                  value={formData.sale_price || ''}
                  onChange={(e) => handleChange('sale_price', e.target.value)}
                  placeholder="0.00"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('inventory.purchasePrice')}</Label>
                <Input
                  type="number"
                  value={formData.purchase_price || ''}
                  onChange={(e) => handleChange('purchase_price', e.target.value)}
                  placeholder="0.00"
                  className="h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('common.description')}</Label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('common.back')}
      </Button>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {renderForm()}

          <div className="space-y-2">
            <Label>{t('common.notes')}</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={t('quickEntry.notesPlaceholder')}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 h-12"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 h-12 gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
