import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  ShoppingBag, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy,
  Send,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  ShoppingCart,
  Calendar,
  Building2,
  Truck
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

// Schema and types are created inside the component to localize validation messages
type PurchaseOrderForm = {
  supplier_id: string;
  order_date: string;
  expected_date: string;
  description: string;
  amount: string;
  notes?: string;
  project_id?: string;
};

// Removed mock data. We now fetch real purchase orders below.

// approval config will be created inside the component to use i18n labels

export default function PurchaseOrdersPage() {
  const { t, i18n } = useTranslation();
  
  // Build schema with localized validation messages
  const purchaseOrderSchema = z.object({
    supplier_id: z.string().min(1, t('validation.selectSupplier')),
    order_date: z.string().min(1, t('validation.orderDateRequired')),
    expected_date: z.string().min(1, t('validation.deliveryDateRequired')),
    description: z.string().min(2, t('validation.descriptionMin2')),
    amount: z.string().min(1, t('validation.amountRequired')),
    notes: z.string().optional(),
    project_id: z.string().optional(),
  });
  
  const statusConfig = {
    draft: { label: t('common.draft'), icon: Edit, color: 'secondary' },
    pending: { label: t('common.pending'), icon: Clock, color: 'default' },
    ordered: { label: t('purchases.orders.ordered'), icon: ShoppingCart, color: 'default' },
    received: { label: t('common.received'), icon: CheckCircle, color: 'success' },
    cancelled: { label: t('common.cancelled'), icon: XCircle, color: 'secondary' },
  };
  
  const approvalConfig = {
    draft: { label: t('common.draft'), color: 'secondary' },
    pending: { label: t('purchases.orders.pendingApproval'), color: 'default' },
    approved: { label: t('common.approved'), color: 'success' },
    rejected: { label: t('common.rejected'), color: 'destructive' },
  } as const;
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showDialog, setShowDialog] = useState(false);
  
  // Fetch contacts (suppliers)
  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
    select: (data) => data.filter((c: any) => c.type === 'supplier' || c.type === 'both'),
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  // Create purchase order mutation
  const createMutation = useMutation({
    mutationFn: async (data: PurchaseOrderForm) => {
      const processedData = {
        ...data,
        subtotal: data.amount, // Send as string
        total: data.amount,    // Send as string
        tax_total: '0',
        date: data.order_date, // Map order_date to date
        delivery_date: data.expected_date, // Map expected_date to delivery_date
        status: 'draft',
        approval_status: 'pending',
        lines: [{
            description: data.description,
            quantity: 1,
            unit_price: data.amount, // Send as string
            amount: data.amount,     // Send as string
            project_id: data.project_id
        }]
      };
      return await apiRequest('POST', '/api/purchases/orders', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/orders'] });
      setShowDialog(false);
      toast({
        title: t('purchases.orders.orderCreated'),
        description: t('purchases.orders.orderCreatedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.orders.orderCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Form
  const form = useForm<PurchaseOrderForm>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      description: '',
      amount: '',
      notes: '',
      project_id: '',
    },
  });

  const onSubmit = (data: PurchaseOrderForm) => {
    createMutation.mutate(data);
  };
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch real purchase orders
  const { data: orders = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/purchases/orders'],
    select: (data: any[]) =>
      data.map((o: any) => ({
        ...o,
        total: Number(o.total || 0),
        subtotal: Number(o.subtotal || 0),
        tax_total: Number(o.tax_total || 0),
      })),
  });

  // Join with contacts to display supplier names; map to UI shape
  const displayOrders = orders.map((o: any) => {
    const supplier = suppliers.find((c: any) => c.id === o.supplier_id);
    return {
      id: o.id,
      po_number: o.po_number,
      vendor_name: supplier?.name || '-',
      order_date: o.date,
      expected_date: o.delivery_date,
      total_amount: Number(o.total || 0),
      currency: o.currency || 'USD',
      items_count: 0,
      approval_status: o.approval_status || 'pending',
      status: o.status || 'pending',
    };
  });

  // Filter orders
  const filteredOrders = displayOrders.filter((order) => {
    const matchesSearch = 
      order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'draft':
        return order.status === 'draft';
      case 'pending':
        return order.status === 'pending';
      case 'approved':
        return order.approval_status === 'approved';
      case 'received':
        return order.status === 'received';
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = {
    total: displayOrders.length,
    totalValue: displayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
    pending: displayOrders.filter(o => o.status === 'pending').length,
    approved: displayOrders.filter(o => o.approval_status === 'approved').length,
    received: displayOrders.filter(o => o.status === 'received').length,
    avgValue: displayOrders.length > 0 ? displayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) / displayOrders.length : 0,
  };

  const handleApprove = (id: string) => {
    toast({
      title: t('purchases.orders.orderApproved'),
      description: t('purchases.orders.orderApprovedDesc'),
    });
  };

  // Convert mutation
  const convertMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return apiRequest('POST', `/api/purchases/orders/${orderId}/convert`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/purchases/bills'] });
      toast({
        title: t('purchases.orders.convertToBill'),
        description: t('purchases.orders.orderConvertedDesc'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('purchases.orders.orderConvertError'),
        variant: 'destructive',
      });
    },
  });

  const handleConvertToBill = (id: string) => {
    if (confirm(t('purchases.orders.confirmConvert'))) {
      convertMutation.mutate(id);
    }
  };

  const handleSend = (id: string) => {
    toast({
      title: t('purchases.orders.orderSent'),
      description: t('purchases.orders.orderSentDesc'),
    });
  };

  const handleCancel = (id: string) => {
    if (confirm(t('purchases.orders.confirmCancel'))) {
      toast({
        title: t('purchases.orders.orderCancelled'),
        description: t('purchases.orders.orderCancelledDesc'),
      });
    }
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

  const getApprovalBadge = (status: string) => {
    const config = approvalConfig[status as keyof typeof approvalConfig];
    if (!config) return null;
    
    return (
      <Badge variant={config.color as any}>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('purchases.orders.title')}</h1>
          <p className="text-muted-foreground mt-1 hidden sm:block">{t('purchases.orders.description')}</p>
          <p className="text-muted-foreground mt-1 sm:hidden">{t('purchases.orders.descriptionShort')}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              size={isMobile ? 'sm' : 'default'}
              data-testid="button-new-purchase-order"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 me-2" />
              {t('purchases.orders.addPurchaseOrder')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('purchases.orders.addPurchaseOrder')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('purchases.bills.supplier')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('placeholders.selectSupplier')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
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
                    name="order_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.orders.purchaseOrderDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expected_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('purchases.orders.expectedDelivery')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.description')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={t('purchases.orders.descriptionPlaceholder')} 
                            {...field} 
                          />
                        </FormControl>
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

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDialog(false)}
                    className="w-full sm:w-auto"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                    {createMutation.isPending ? t('common.creating') : t('purchases.orders.createPurchaseOrder')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

  {/* Statistics Cards */}
  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.orders.totalPurchaseOrders')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('dashboard.thisMonth')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.orders.totalValue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalValue, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.orders.purchaseVolume')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.orders.pendingApproval')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.orders.needReview')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('purchases.orders.averageValue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.avgValue, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('purchases.orders.perOrder')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchPurchaseOrders')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
            data-testid="input-search-purchase-orders"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border sticky top-0 z-20"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all">{t('purchases.orders.allOrders')}</TabsTrigger>
          <TabsTrigger value="draft">{t('common.draft')}</TabsTrigger>
          <TabsTrigger value="pending">{t('common.pending')}</TabsTrigger>
          <TabsTrigger value="approved">{t('common.approved')}</TabsTrigger>
          <TabsTrigger value="received">{t('common.received')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('purchases.orders.purchaseOrderNumber')}</TableHead>
                    <TableHead>{t('purchases.bills.supplier')}</TableHead>
                    <TableHead>{t('purchases.orders.purchaseOrderDate')}</TableHead>
                    <TableHead>{t('purchases.orders.expectedDelivery')}</TableHead>
                    <TableHead>{t('common.items')}</TableHead>
                    <TableHead>{t('common.amount')}</TableHead>
                    <TableHead>{t('purchases.orders.approval')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-purchase-order-${order.id}`}>
                      <TableCell className="font-medium" data-label={t('purchases.orders.purchaseOrderNumber')}>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          {order.po_number}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('purchases.bills.supplier')}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {order.vendor_name}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('purchases.orders.purchaseOrderDate')}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(order.order_date).toLocaleDateString(i18n.language)}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('purchases.orders.expectedDelivery')}>
                        {new Date(order.expected_date).toLocaleDateString(i18n.language)}
                      </TableCell>
                      <TableCell data-label={t('common.items')}>{order.items_count} {t('common.items')}</TableCell>
                      <TableCell className="font-semibold" data-label={t('common.amount')}>
                        {formatCurrency(order.total_amount, order.currency)}
                      </TableCell>
                      <TableCell data-label={t('purchases.orders.approval')}>{getApprovalBadge(order.approval_status)}</TableCell>
                      <TableCell data-label={t('common.status')}>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-end" data-label={t('common.actions')}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${order.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 me-2" />
                              {t('purchases.orders.viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 me-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 me-2" />
                              {t('common.duplicate')}
                            </DropdownMenuItem>
                            {order.approval_status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleApprove(order.id)}>
                                <CheckCircle className="h-4 w-4 me-2" />
                                {t('purchases.orders.approve')}
                              </DropdownMenuItem>
                            )}
                            {order.approval_status === 'approved' && order.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleSend(order.id)}>
                                <Send className="h-4 w-4 me-2" />
                                {t('purchases.orders.sendToVendor')}
                              </DropdownMenuItem>
                            )}
                            {order.status === 'received' && (
                              <DropdownMenuItem onClick={() => handleConvertToBill(order.id)}>
                                <ArrowRight className="h-4 w-4 me-2" />
                                {t('purchases.orders.convertToBill')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleCancel(order.id)}
                            >
                              <XCircle className="h-4 w-4 me-2" />
                              {t('purchases.orders.cancelOrder')}
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