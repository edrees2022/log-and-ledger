import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { format } from "@/lib/utils";
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Package, 
  Plus, 
  Download, 
  Printer, 
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Inventory item form schema
const inventoryItemSchemaBase = z.object({
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: z.string(),
  reorderPoint: z.string(),
  reorderQuantity: z.string(),
  unitCost: z.string(),
  unitPrice: z.string(),
  location: z.string().optional(),
});

type InventoryItemForm = z.infer<typeof inventoryItemSchemaBase>;

// Empty inventory data structure - will be populated from API
const emptyInventoryData = {
  period: new Date().toISOString().split('T')[0],
  company: '',
  currency: '', // Will be set from company currency
  items: [],
  movements: [],
  valuationMethod: 'FIFO',
  categories: [],
};



export default function InventoryPage() {
  const { t, i18n } = useTranslation();
  const companyCurrency = useCompanyCurrency();
  const inventoryItemSchema = z.object({
    sku: z.string().min(1, t('validation.skuRequired')),
    name: z.string().min(2, t('validation.nameMin')),
    category: z.string().min(1, t('validation.categoryRequired')),
    quantity: z.string().min(1, t('validation.quantityRequired')),
    reorderPoint: z.string().min(1, t('validation.reorderPointRequired')),
    reorderQuantity: z.string().min(1, t('validation.reorderQuantityRequired')),
    unitCost: z.string().min(1, t('validation.unitCostRequired')),
    unitPrice: z.string().min(1, t('validation.unitPriceRequired')),
    location: z.string().optional(),
  });

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showDialog, setShowDialog] = useState(false);

  // Create inventory item mutation
  const createMutation = useMutation({
    mutationFn: async (data: InventoryItemForm) => {
      const processedData = {
        sku: data.sku,
        name: data.name,
        category: data.category,
        stock_quantity: data.quantity,
        reorder_level: data.reorderPoint,
        cost_price: data.unitCost,
        sales_price: data.unitPrice,
        type: 'product',
      };
      return await apiRequest('POST', '/api/items', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] });
      setShowDialog(false);
      toast({
        title: t('inventory.itemAdded'),
        description: t('inventory.itemAddedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('inventory.failedToAddItem'),
        variant: 'destructive',
      });
    },
  });

  // Form
  const form = useForm<InventoryItemForm>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      sku: '',
      name: '',
      category: 'Electronics',
      quantity: '',
      reorderPoint: '',
      reorderQuantity: '',
      unitCost: '',
      unitPrice: '',
      location: '',
    },
  });

  const onSubmit = (data: InventoryItemForm) => {
    createMutation.mutate(data);
  };

  // Use real items data from API
  const { data: itemsData = [] } = useQuery<any[]>({
    queryKey: ['/api/items'],
  });

  // Build inventory data structure from real items
  const inventoryData = {
    ...emptyInventoryData,
    items: itemsData.map((item: any) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      category: item.category || 'Other',
      quantity: parseFloat(item.stock_quantity || '0'),
      reorderPoint: parseFloat(item.reorder_level || '0'),
      reorderQuantity: 0,
      unitCost: parseFloat(item.cost_price || '0'),
      unitPrice: parseFloat(item.sales_price || '0'),
      value: parseFloat(item.stock_quantity || '0') * parseFloat(item.cost_price || '0'),
      status: (parseFloat(item.stock_quantity || '0') <= parseFloat(item.reorder_level || '0') && parseFloat(item.reorder_level || '0') > 0) ? 'low_stock' : 'in_stock',
      location: 'N/A',
      lastRestocked: item.updated_at || item.created_at,
    })),
  };

  // Filter inventory
  const filteredItems = inventoryData.items.filter((item: any) => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics
  const totalItems = inventoryData.items.length;
  const totalValue = inventoryData.items.reduce((sum: number, item: any) => sum + item.value, 0);
  const lowStockItems = inventoryData.items.filter((item: any) => 
    item.status === 'low_stock' || item.status === 'critical'
  ).length;
  const totalQuantity = inventoryData.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: inventoryData.currency || companyCurrency,
    }).format(amount);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log(`Exporting inventory report as ${format}`);
  };

  const handleReorder = (sku: string) => {
    console.log(`Creating reorder for ${sku}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { label: t('inventory.inStock'), icon: CheckCircle, color: 'success' },
      low_stock: { label: t('inventory.lowStock'), icon: AlertTriangle, color: 'warning' },
      critical: { label: t('inventory.critical'), icon: AlertTriangle, color: 'destructive' },
      out_of_stock: { label: t('inventory.outOfStock'), icon: AlertTriangle, color: 'destructive' },
      service: { label: t('categories.services'), icon: Package, color: 'secondary' },
    };

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

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('inventory.inventoryReport')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('inventory.stockLevelsAsOf')} {new Date().toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 me-2" />
            {t('common.export')}
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}>
            <Printer className="h-4 w-4 me-2" />
            {t('common.print')}
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-item">
                <Plus className="h-4 w-4 me-2" />
                {t('inventory.addItem')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('reports.addNewInventoryItem')}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form id="inventory-item-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.sku')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('inventory.skuPlaceholder') || "PRD-001"} {...field} />
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
                          <FormLabel>{t('reports.productName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('inventory.productNamePlaceholder') || "Enter product name"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.category')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('inventory.selectCategory')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Electronics">{t('categories.electronics')}</SelectItem>
                              <SelectItem value="Accessories">{t('categories.accessories')}</SelectItem>
                              <SelectItem value="Services">{t('categories.services')}</SelectItem>
                              <SelectItem value="Raw Materials">{t('inventory.rawMaterials')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('inventory.locationOptional')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('inventory.warehousePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('inventory.currentQuantity')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reorderPoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('inventory.reorderPoint')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reorderQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('inventory.reorderQuantity')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unitCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('inventory.unitCost')}</FormLabel>
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
                      name="unitPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('common.unitPrice')}</FormLabel>
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
                <Button type="submit" form="inventory-item-form" disabled={createMutation.isPending} className="w-full sm:w-auto">
                  {createMutation.isPending ? t('inventory.addingItem') : t('inventory.addItem')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('inventory.totalItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('inventory.uniqueSkus')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('inventory.totalValue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 me-1" />
              {t('inventory.fromLastMonth', '+8.5% from last month')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('inventory.totalQuantity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('inventory.unitsInStock')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('inventory.lowStockAlert')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('inventory.itemsNeedReorder')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="flex-1">
          <Input
            placeholder={t('inventory.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            data-testid="input-search-inventory"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48" data-testid="select-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="Electronics">{t('categories.electronics')}</SelectItem>
            <SelectItem value="Accessories">{t('categories.accessories')}</SelectItem>
            <SelectItem value="Services">{t('categories.services')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap w-full h-auto min-h-10 gap-1 sm:gap-2">
          <TabsTrigger value="overview">{t('common.overview')}</TabsTrigger>
          <TabsTrigger value="movements">{t('inventory.stockMovements')}</TabsTrigger>
          <TabsTrigger value="valuation">{t('inventory.valuation.title')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.sku')}</TableHead>
                    <TableHead>{t('reports.productName')}</TableHead>
                    <TableHead>{t('common.category')}</TableHead>
                    <TableHead>{t('inventory.location')}</TableHead>
                    <TableHead className="text-end">{t('common.quantity')}</TableHead>
                    <TableHead className="text-end">{t('inventory.reorderPoint')}</TableHead>
                    <TableHead className="text-end">{t('inventory.unitCost')}</TableHead>
                    <TableHead className="text-end">{t('inventory.totalValue')}</TableHead>
                    <TableHead>{t('common.status')}s</TableHead>
                    <TableHead className="text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                      <TableCell className="font-medium" data-label={t('common.sku')}>{item.sku}</TableCell>
                      <TableCell data-label={t('inventory.productName')}>{item.name}</TableCell>
                      <TableCell data-label={t('common.category')}>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell data-label={t('inventory.location')}>{item.location}</TableCell>
                      <TableCell className="text-end font-semibold" data-label={t('common.quantity')}>
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-end" data-label={t('inventory.reorderPoint')}>
                        {item.reorderPoint || '-'}
                      </TableCell>
                      <TableCell className="text-end" data-label={t('inventory.unitCost')}>
                        {item.unitCost > 0 ? formatCurrency(item.unitCost) : '-'}
                      </TableCell>
                      <TableCell className="text-end font-semibold" data-label={t('inventory.totalValue')}>
                        {item.value > 0 ? formatCurrency(item.value) : '-'}
                      </TableCell>
                      <TableCell data-label={t('common.status')}>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-end" data-label={t('common.actions')}>
                        {(item.status === 'low_stock' || item.status === 'critical') && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleReorder(item.sku)}
                            data-testid={`button-reorder-${item.id}`}
                          >
                            Reorder
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>{t('inventory.recentStockMovements')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[450px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('common.type')}</TableHead>
                    <TableHead>{t('common.sku')}</TableHead>
                    <TableHead>{t('common.reference')}</TableHead>
                    <TableHead className="text-end">{t('common.quantity')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.movements.length > 0 ? (
                    inventoryData.movements.map((movement: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell data-label={t('common.date')}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(movement.date), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell data-label={t('common.type')}>
                          <Badge variant={movement.type === 'purchase' ? 'default' : movement.type === 'sale' ? 'destructive' : 'secondary'}>
                            {movement.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium" data-label={t('common.sku')}>{movement.sku}</TableCell>
                        <TableCell data-label={t('common.reference')}>{movement.reference}</TableCell>
                        <TableCell className="text-end" data-label={t('common.quantity')}>
                          <div className="flex items-center justify-end gap-1">
                            {movement.quantity > 0 ? (
                              <ArrowUpRight className="h-3 w-3 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-600" />
                            )}
                            <span className={`font-semibold ${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {t('common.noDataYet')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Valuation Tab */}
        <TabsContent value="valuation">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('inventory.inventoryValuationMethod')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{inventoryData.valuationMethod}</p>
                    <p className="text-sm text-muted-foreground">{t('inventory.fifo')}</p>
                  </div>
                  <Button variant="outline">{t('inventory.changeMethod')}</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('inventory.valuationByCategory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[450px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('common.category')}</TableHead>
                      <TableHead className="text-end">{t('common.items')}</TableHead>
                      <TableHead className="text-end">{t('inventory.totalValue')}</TableHead>
                      <TableHead className="text-end">{t('common.percentage')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.categories.length > 0 ? (
                      inventoryData.categories.map((category: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium" data-label={t('common.category')}>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-end" data-label={t('common.items')}>{category.items}</TableCell>
                          <TableCell className="text-end font-semibold" data-label={t('inventory.totalValue')}>
                            {formatCurrency(category.value)}
                          </TableCell>
                          <TableCell className="text-end" data-label={t('common.percentage')}>
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                style={{ width: `${category.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{category.percentage}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {t('common.noDataYet')}
                      </TableCell>
                    </TableRow>
                  )}
                    {inventoryData.categories.length > 0 && (
                    <TableRow className="font-bold">
                      <TableCell data-label={t('common.category')}>{t('common.total')}</TableCell>
                      <TableCell className="text-end" data-label={t('common.items')}>{totalItems}</TableCell>
                      <TableCell className="text-end text-green-600" data-label={t('inventory.totalValue')}>
                        {formatCurrency(totalValue)}
                      </TableCell>
                      <TableCell className="text-end" data-label={t('common.percentage')}>100%</TableCell>
                    </TableRow>
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}