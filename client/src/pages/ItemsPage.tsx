import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFormatCurrency } from '@/hooks/use-company-currency';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Plus, Edit, Trash2, Barcode, DollarSign, Tag, Archive, ShoppingCart, TrendingUp, History, RefreshCw } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { StockHistoryDialog } from '@/components/inventory/StockHistoryDialog';
import { SmartScanButton } from '@/components/ai/SmartScanButton';
import { BatchList } from '@/components/inventory/BatchList';

// Item form schema factory (localized)
const itemSchemaFactory = (t: TFunction) => z.object({
  type: z.enum(['product', 'service']),
  code: z.string().min(1, t('validation.itemCodeRequired')),
  name: z.string().min(2, t('validation.itemNameMin2')),
  description: z.string().optional(),
  unit: z.string().default('piece'),
  category: z.string().optional(),
  barcode: z.string().optional(),
  is_active: z.boolean(),
  is_sellable: z.boolean(),
  is_purchasable: z.boolean(),
  sale_price: z.string().optional(),
  purchase_price: z.string().optional(),
  track_inventory: z.boolean(),
  tracking_type: z.enum(['none', 'batch', 'serial']).default('none'),
  stock_quantity: z.string().optional(),
  minimum_stock: z.string().optional(),
  reorder_level: z.string().optional(),
  default_warehouse_id: z.string().optional(),
  sales_account_id: z.string().optional(),
  purchase_account_id: z.string().optional(),
  inventory_account_id: z.string().optional(),
  default_tax_id: z.string().optional(),
});

type ItemForm = z.infer<ReturnType<typeof itemSchemaFactory>>;

const getUnits = (t: TFunction) => [
  { value: 'piece', label: t('items.units.piece') },
  { value: 'kg', label: t('items.units.kg') },
  { value: 'liter', label: t('items.units.liter') },
  { value: 'meter', label: t('items.units.meter') },
  { value: 'hour', label: t('items.units.hour') },
  { value: 'day', label: t('items.units.day') },
  { value: 'box', label: t('items.units.box') },
  { value: 'pack', label: t('items.units.pack') },
  { value: 'dozen', label: t('items.units.dozen') },
];

const getCategories = (t: TFunction) => [
  { value: 'electronics', label: t('items.categories.electronics') },
  { value: 'furniture', label: t('items.categories.furniture') },
  { value: 'clothing', label: t('items.categories.clothing') },
  { value: 'food', label: t('items.categories.food') },
  { value: 'stationery', label: t('items.categories.stationery') },
  { value: 'services', label: t('items.categories.services') },
  { value: 'consulting', label: t('items.categories.consulting') },
  { value: 'maintenance', label: t('items.categories.maintenance') },
  { value: 'other', label: t('items.categories.other') },
];

export default function ItemsPage() {
  const { t, i18n } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const units = useMemo(() => getUnits(t), [t]);
  const categories = useMemo(() => getCategories(t), [t]);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState<'product' | 'service'>('product');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedHistoryItemId, setSelectedHistoryItemId] = useState<string | null>(null);

  const handleScanComplete = (data: any) => {
    // Pre-fill form
    form.setValue('name', data.name || '');
    form.setValue('description', data.description || '');
    form.setValue('code', data.sku || '');
    form.setValue('sale_price', data.price ? String(data.price) : '');
    form.setValue('purchase_price', data.cost ? String(data.cost) : '');
    
    // Try to map category
    if (data.category) {
      const cat = categories.find(c => c.value === data.category.toLowerCase());
      if (cat) form.setValue('category', cat.value);
    }

    setShowDialog(true);
    toast({
      title: t("ai.scanSuccess"),
      description: t("ai.scanFormFilled", "Item details extracted."),
    });
  };

  // Fetch items
  const { data: items = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/items'],
  });

  // Fetch accounts for dropdowns
  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ['/api/accounts'],
  });

  // Fetch taxes for dropdown
  const { data: taxes = [] } = useQuery<any[]>({
    queryKey: ['/api/taxes'],
  });

  // Fetch warehouses for dropdown
  const { data: warehouses = [] } = useQuery<any[]>({
    queryKey: ['/api/inventory/warehouses'],
  });

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: async (data: ItemForm) => {
      // Map UI fields to API contract and keep decimals as strings
      // If track_inventory is true, set type to 'inventory', otherwise 'service'
      const itemType = data.type === 'product' && data.track_inventory ? 'inventory' : 
                       data.type === 'product' ? 'inventory' : 'service';
      const payload = {
        type: itemType,
        sku: data.code || undefined,
        name: data.name,
        description: data.description || undefined,
        unit_of_measure: data.unit || 'piece',
        sales_price: data.sale_price?.trim() || undefined,
        cost_price: data.purchase_price?.trim() || undefined,
        stock_quantity: data.stock_quantity?.trim() || undefined,
        reorder_level: data.reorder_level?.trim() || undefined,
        default_warehouse_id: data.default_warehouse_id || undefined,
        tracking_type: data.tracking_type || 'none',
        sales_account_id: data.sales_account_id || undefined,
        cost_account_id: data.purchase_account_id || undefined,
        inventory_account_id: data.inventory_account_id || undefined,
        default_tax_id: data.default_tax_id || undefined,
        is_active: data.is_active,
      } as const;
      return await apiRequest('POST', '/api/items', payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      setShowDialog(false);
      toast({
        title: t('items.itemCreated'),
        description: t('items.itemCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('items.itemCreateFailed'),
        variant: 'destructive',
      });
    },
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ItemForm> }) => {
      // Map UI fields to API contract and keep decimals as strings
      const payload = {
        type: data.type ? (data.type === 'product' ? 'inventory' : 'service') : undefined,
        sku: data.code || undefined,
        name: data.name,
        description: data.description,
        unit_of_measure: data.unit,
        sales_price: data.sale_price?.trim(),
        cost_price: data.purchase_price?.trim(),
        stock_quantity: data.stock_quantity?.trim(),
        reorder_level: data.reorder_level?.trim(),
        tracking_type: data.tracking_type || 'none',
        sales_account_id: data.sales_account_id,
        cost_account_id: (data as any).purchase_account_id,
        inventory_account_id: data.inventory_account_id,
        default_tax_id: data.default_tax_id,
        is_active: data.is_active,
      } as const;
      return await apiRequest('PUT', `/api/items/${id}`, payload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      setShowDialog(false);
      setEditingItem(null);
      toast({
        title: t('items.itemUpdated'),
        description: t('items.itemUpdatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('items.itemUpdateFailed'),
        variant: 'destructive',
      });
    },
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      toast({
        title: t('items.itemDeleted'),
        description: t('items.itemDeletedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('items.itemDeleteFailed'),
        variant: 'destructive',
      });
    },
  });

  // Backfill stock movements mutation
  const backfillMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/inventory/backfill-movements');
    },
    onSuccess: (data: any) => {
      toast({
        title: t('inventory.backfillComplete', { defaultValue: 'تم تحديث الحركات' }),
        description: t('inventory.backfillResult', { 
          recorded: data.recorded || 0, 
          skipped: data.skipped || 0,
          defaultValue: `تم تسجيل ${data.recorded || 0} حركة، تم تخطي ${data.skipped || 0}`
        }),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const schema = itemSchemaFactory(t);
  const form = useForm<ItemForm>({
    resolver: zodResolver(schema),
    defaultValues: editingItem || {
      type: 'product',
      code: '',
      name: '',
      description: '',
      unit: 'piece',
      category: '',
      barcode: '',
      is_active: true,
      is_sellable: true,
      is_purchasable: true,
      sale_price: '',
      purchase_price: '',
      track_inventory: false,
      tracking_type: 'none',
      stock_quantity: '',
      minimum_stock: '',
      reorder_level: '',
      default_warehouse_id: '',
      sales_account_id: '',
      purchase_account_id: '',
      inventory_account_id: '',
      default_tax_id: '',
    },
  });

  const onSubmit = async (data: ItemForm) => {
    if (editingItem) {
      await updateMutation.mutateAsync({ id: editingItem.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    // Map API fields to form fields
    const itemType = item.type === 'inventory' ? 'product' : (item.type === 'service' ? 'service' : item.type);
    form.reset({
      type: itemType || 'product',
      code: item.sku || item.code || '',
      name: item.name || '',
      description: item.description || '',
      unit: item.unit_of_measure || item.unit || 'piece',
      category: item.category || '',
      barcode: item.barcode || '',
      is_active: item.is_active ?? true,
      is_sellable: item.is_sellable ?? true,
      is_purchasable: item.is_purchasable ?? true,
      sale_price: (item.sales_price || item.sale_price)?.toString() || '',
      purchase_price: (item.cost_price || item.purchase_price)?.toString() || '',
      track_inventory: item.type === 'inventory',
      tracking_type: item.tracking_type || 'none',
      stock_quantity: item.stock_quantity?.toString() || '',
      minimum_stock: item.minimum_stock?.toString() || '',
      reorder_level: item.reorder_level?.toString() || '',
      default_warehouse_id: item.default_warehouse_id || '',
      sales_account_id: item.sales_account_id || '',
      purchase_account_id: item.cost_account_id || item.purchase_account_id || '',
      inventory_account_id: item.inventory_account_id || '',
      default_tax_id: item.default_tax_id || '',
    });
    setSelectedType(itemType as 'product' | 'service');
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const openHistoryDialog = (itemId: string) => {
    setSelectedHistoryItemId(itemId);
    setHistoryDialogOpen(true);
  };

  const closeHistoryDialog = () => {
    setSelectedHistoryItemId(null);
    setHistoryDialogOpen(false);
  };

  // Filter items by tab
  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    // 'inventory' type in DB = product in UI
    if (activeTab === 'products') return item.type === 'inventory' || item.type === 'product';
    if (activeTab === 'services') return item.type === 'service';
    if (activeTab === 'low-stock') {
      const qty = parseFloat(item.stock_quantity) || 0;
      const reorder = parseFloat(item.reorder_level) || 0;
      return (item.type === 'inventory' || item.type === 'product') && qty <= reorder;
    }
    return true;
  });

  // Calculate statistics
  const stats = {
    total: items.length,
    // 'inventory' type in DB = product in UI
    products: items.filter(i => i.type === 'inventory' || i.type === 'product').length,
    services: items.filter(i => i.type === 'service').length,
    lowStock: items.filter(i => {
      const qty = parseFloat(i.stock_quantity) || 0;
      const reorder = parseFloat(i.reorder_level) || 0;
      return (i.type === 'inventory' || i.type === 'product') && qty <= reorder;
    }).length,
  };

  // Group accounts by type for selection
  const salesAccounts = accounts.filter(a => a.account_type === 'revenue');
  const purchaseAccounts = accounts.filter(a => a.account_type === 'expense');
  const inventoryAccounts = accounts.filter(a => a.account_type === 'asset' && a.account_subtype === 'inventory');

  // Helper function to get account display name based on language
  const getAccountDisplayName = (account: any) => {
    if (i18n.language === 'ar' && account.name_ar) {
      return `${account.code} - ${account.name_ar}`;
    }
    return `${account.code} - ${account.name}`;
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('items.title')}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t('items.subtitle')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => backfillMutation.mutate()}
            disabled={backfillMutation.isPending}
            title={t('inventory.syncMovements', { defaultValue: 'مزامنة حركات المخزون من الفواتير' })}
          >
            <RefreshCw className={`h-4 w-4 ${backfillMutation.isPending ? 'animate-spin' : ''}`} />
            <span className="sr-only sm:not-sr-only sm:ml-2">
              {t('inventory.syncMovements', { defaultValue: 'مزامنة' })}
            </span>
          </Button>
          <SmartScanButton 
            documentType="item" 
            onScanComplete={handleScanComplete}
          />
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto" onClick={() => {
                setEditingItem(null);
                form.reset({
                  type: 'product',
                  code: '',
                  name: '',
                  description: '',
                  unit: 'piece',
                  category: '',
                  barcode: '',
                  is_active: true,
                  is_sellable: true,
                  is_purchasable: true,
                  sale_price: '',
                  purchase_price: '',
                  track_inventory: true,
                  tracking_type: 'none',
                  stock_quantity: '0',
                  minimum_stock: '0',
                  reorder_level: '0',
                  sales_account_id: '',
                  purchase_account_id: '',
                  inventory_account_id: '',
                  default_tax_id: '',
                });
                setSelectedType('product');
              }}>
                <Plus className="mr-2 h-4 w-4" />
                {t('items.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? t('items.editItem') : t('items.addItem')}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Type Selection */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('items.itemType')}</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedType(value as 'product' | 'service');
                          }} 
                          value={field.value || 'product'}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-item-type">
                              <SelectValue placeholder={t('items.itemType')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="product">{t('items.product')}</SelectItem>
                            <SelectItem value="service">{t('items.service')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('items.description')}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.itemCode')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('items.itemCode')} data-testid="input-item-code" {...field} />
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
                            <FormLabel>{t('items.itemName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('items.itemName')} data-testid="input-item-name" {...field} />
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
                          <FormLabel>{t('items.description')}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t('items.description')} 
                              data-testid="input-item-description" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.unit')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || 'piece'}>
                              <FormControl>
                                <SelectTrigger data-testid="select-unit">
                                  <SelectValue placeholder={t('items.unit')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit.value} value={unit.value}>
                                    {unit.label}
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
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.category')}</FormLabel>
                            <Select 
                              onValueChange={(val) => field.onChange(val === '__none__' ? '' : val)} 
                              value={field.value || '__none__'}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-category">
                                  <SelectValue placeholder={t('items.category')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="__none__">{t('common.select')}</SelectItem>
                                {categories.map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
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
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.barcode')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('items.barcode')} data-testid="input-barcode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Sales & Purchase */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('items.salePrice')}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="is_sellable"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>{t('items.isSellable')}</FormLabel>
                              <FormDescription className="text-xs">
                                {t('items.isSellable')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-sellable"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_purchasable"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>{t('items.isPurchasable')}</FormLabel>
                              <FormDescription className="text-xs">
                                {t('items.isPurchasable')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-purchasable"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sale_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.salePrice')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder={t('items.salePrice')} 
                                data-testid="input-sale-price" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="purchase_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.purchasePrice')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01"
                                placeholder={t('items.purchasePrice')} 
                                data-testid="input-purchase-price" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Inventory (only for products) */}
                  {selectedType === 'product' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground">{t('items.trackInventory')}</h3>
                      
                      <FormField
                        control={form.control}
                        name="track_inventory"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>{t('items.trackInventory')}</FormLabel>
                              <FormDescription className="text-xs">
                                {t('items.trackInventoryDesc')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-track-inventory"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {form.watch('track_inventory') && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="tracking_type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('items.trackingType', { defaultValue: 'Tracking Type' })}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || 'none'}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('common.select')} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      <div className="flex flex-col">
                                        <span>{t('items.tracking.none', { defaultValue: 'Standard Tracking' })}</span>
                                        <span className="text-xs text-muted-foreground">{t('items.tracking.noneDesc', { defaultValue: 'Track quantity only' })}</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="batch">
                                      <div className="flex flex-col">
                                        <span>{t('items.tracking.batch', { defaultValue: 'Batch / Lot Tracking' })}</span>
                                        <span className="text-xs text-muted-foreground">{t('items.tracking.batchDesc', { defaultValue: 'Track by batch number and expiry date' })}</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="serial">
                                      <div className="flex flex-col">
                                        <span>{t('items.tracking.serial', { defaultValue: 'Serial Number Tracking' })}</span>
                                        <span className="text-xs text-muted-foreground">{t('items.tracking.serialDesc', { defaultValue: 'Track each unit individually' })}</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription className="text-xs">
                                  {field.value === 'batch' && t('items.tracking.batchHint', { defaultValue: 'Ideal for products with expiry dates like food and medicine' })}
                                  {field.value === 'serial' && t('items.tracking.serialHint', { defaultValue: 'Ideal for electronics, equipment, and high-value items' })}
                                  {(!field.value || field.value === 'none') && t('items.tracking.noneHint', { defaultValue: 'Simple quantity tracking for general products' })}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="stock_quantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('items.stockQuantity')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      placeholder={t('items.stockQuantity')} 
                                      data-testid="input-stock-quantity" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="default_warehouse_id"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('inventory.warehouse', 'Warehouse')}</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder={t('inventory.selectWarehouse', 'Select warehouse')} />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {warehouses.map((w: any) => (
                                        <SelectItem key={w.id} value={w.id}>
                                          {w.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    {t('items.warehouseHint', 'Required to record opening stock')}
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="minimum_stock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('items.minimumStock')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      placeholder={t('items.minimumStock')} 
                                      data-testid="input-minimum-stock" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="reorder_level"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('items.reorderLevel')}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      placeholder={t('items.reorderLevel')} 
                                      data-testid="input-reorder-level" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Accounting */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{t('accounting.accounts.title')}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sales_account_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.salesAccount')}</FormLabel>
                            <Select 
                              onValueChange={(val) => field.onChange(val === '__none__' ? '' : val)} 
                              value={field.value || '__none__'}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-sales-account">
                                  <SelectValue placeholder={t('common.select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="__none__">{t('common.select')}</SelectItem>
                                {salesAccounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {getAccountDisplayName(account)}
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
                        name="purchase_account_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.purchaseAccount')}</FormLabel>
                            <Select 
                              onValueChange={(val) => field.onChange(val === '__none__' ? '' : val)} 
                              value={field.value || '__none__'}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-purchase-account">
                                  <SelectValue placeholder={t('common.select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="__none__">{t('common.select')}</SelectItem>
                                {purchaseAccounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {getAccountDisplayName(account)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {selectedType === 'product' && (
                      <FormField
                        control={form.control}
                        name="inventory_account_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('items.inventoryAccount')}</FormLabel>
                            <Select 
                              onValueChange={(val) => field.onChange(val === '__none__' ? '' : val)} 
                              value={field.value || '__none__'}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-inventory-account">
                                  <SelectValue placeholder={t('common.select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="__none__">{t('common.select')}</SelectItem>
                                {inventoryAccounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {getAccountDisplayName(account)}
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
                      name="default_tax_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('items.defaultTax')}</FormLabel>
                          <Select 
                            onValueChange={(val) => field.onChange(val === 'none' ? '' : val)} 
                            value={field.value || 'none'}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-default-tax">
                                <SelectValue placeholder={t('common.select')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('taxTypes.noTax')}</SelectItem>
                              {taxes.map((tax) => (
                                <SelectItem key={tax.id} value={tax.id}>
                                  {tax.name} ({tax.rate}%)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>{t('items.isActive')}</FormLabel>
                          <FormDescription>
                            {t('items.isActive')}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-item-active"
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
                      className="w-full sm:w-auto"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      data-testid="button-save-item"
                      className="w-full sm:w-auto"
                    >
                      {editingItem ? t('common.update') : t('common.create')} {t('common.item')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('inventory.totalItems')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Archive className="h-4 w-4 text-blue-600" />
              {t('items.products')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-600" />
              {t('items.services')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.services}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              {t('items.lowStock')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap w-full h-auto min-h-10 gap-1 sm:gap-2">
          <TabsTrigger value="all" data-testid="tab-all">{t('items.all')}</TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">{t('items.products')}</TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">{t('items.services')}</TabsTrigger>
          <TabsTrigger value="low-stock" data-testid="tab-low-stock">{t('items.lowStock')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{t('items.noItems')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('items.noItemsDesc')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <Card key={item.id} data-testid={`card-item-${item.id}`}>
                  <CardContent className="p-4">
                    {/* Main content */}
                    <div className="space-y-3">
                      {/* Header with name and badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {item.sku || item.code}
                        </Badge>
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge variant={(item.type === 'inventory' || item.type === 'product') ? 'default' : 'secondary'}>
                          {t(`items.${item.type === 'inventory' ? 'product' : item.type}`)}
                        </Badge>
                        {!item.is_active && (
                          <Badge variant="secondary">{t('common.inactive')}</Badge>
                        )}
                      </div>
                      
                      {/* Description */}
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}

                      {/* Prices and details */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {item.barcode && (
                          <div className="flex items-center gap-1">
                            <Barcode className="h-4 w-4 text-muted-foreground" />
                            <span>{item.barcode}</span>
                          </div>
                        )}
                        
                        {(item.sales_price || item.sale_price) && (
                          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
                            <Tag className="h-4 w-4 text-green-600" />
                            <span>{t('items.salePrice')}: {formatCurrency(Number(item.sales_price || item.sale_price))}</span>
                          </div>
                        )}
                        
                        {(item.cost_price || item.purchase_price) && (
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
                            <ShoppingCart className="h-4 w-4 text-blue-600" />
                            <span>{t('items.purchasePrice')}: {formatCurrency(Number(item.cost_price || item.purchase_price))}</span>
                          </div>
                        )}
                      </div>

                      {item.tracking_type === 'batch' && (
                        <div className="mt-4 pt-4 border-t">
                          <BatchList itemId={item.id} />
                        </div>
                      )}

                      {/* Category and status badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.category && (
                          <Badge variant="outline">{t(`items.categories.${item.category}`)}</Badge>
                        )}
                        {item.is_sellable && (
                          <Badge variant="outline" className="text-xs">{t('items.isSellable')}</Badge>
                        )}
                        {item.is_purchasable && (
                          <Badge variant="outline" className="text-xs">{t('items.isPurchasable')}</Badge>
                        )}
                        {(item.type === 'inventory' || item.type === 'product') && parseFloat(item.stock_quantity || '0') <= parseFloat(item.reorder_level || '0') && (
                          <Badge variant="destructive" className="text-xs">{t('items.lowStock')}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Action buttons - separate row at bottom */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t justify-end">
                      {(item.type === 'inventory' || item.type === 'product') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedHistoryItemId(item.id);
                            setHistoryDialogOpen(true);
                          }}
                          className="gap-1"
                        >
                          <History className="h-4 w-4" />
                          {t('inventory.history', { defaultValue: 'الحركات' })}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        data-testid={`button-edit-${item.id}`}
                        className="gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                        data-testid={`button-delete-${item.id}`}
                        className="gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t('common.delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <StockHistoryDialog 
        itemId={selectedHistoryItemId}
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      />
    </div>
  );
}