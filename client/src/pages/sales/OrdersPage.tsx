import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  ShoppingCart, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy,
  Truck,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Calendar,
  User
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

// Sales order form schema (localized)
const salesOrderSchemaFactory = (t: (key: string) => string) => z.object({
  customer_id: z.string().min(1, t('validation.selectCustomer')),
  order_date: z.string().min(1, t('validation.orderDateRequired')),
  delivery_date: z.string().min(1, t('validation.deliveryDateRequired')),
  description: z.string().min(2, t('validation.descriptionMin2')),
  amount: z.string().min(1, t('validation.amountRequired')),
  notes: z.string().optional(),
  project_id: z.string().optional(),
});

type SalesOrderForm = z.infer<ReturnType<typeof salesOrderSchemaFactory>>;

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  
  const statusConfig = {
    draft: { label: t('common.draft'), icon: Edit, color: 'secondary' },
    pending: { label: t('common.pending'), icon: Clock, color: 'secondary' },
    confirmed: { label: t('sales.orders.confirmed'), icon: CheckCircle, color: 'default' },
    processing: { label: t('sales.orders.processing'), icon: Package, color: 'warning' },
    shipped: { label: t('sales.orders.shipped'), icon: Truck, color: 'success' },
    delivered: { label: t('sales.orders.delivered'), icon: CheckCircle, color: 'success' },
    cancelled: { label: t('common.cancelled'), icon: XCircle, color: 'secondary' },
  };
  
  const fulfillmentConfig = {
    unfulfilled: { label: t('sales.orders.unfulfilled'), color: 'secondary' },
    partial: { label: t('common.partial'), color: 'warning' },
    fulfilled: { label: t('sales.orders.fulfilled'), color: 'success' },
    pending: { label: t('common.pending'), color: 'secondary' },
  };
  
  const paymentStatusConfig = {
    pending: { label: t('common.pending'), color: 'secondary' },
    partial: { label: t('common.partial'), color: 'warning' },
    paid: { label: t('common.paid'), color: 'success' },
    refunded: { label: t('common.refunded'), color: 'destructive' },
  };
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const isMobile = useIsMobile();

  // Fetch contacts (customers)
  const { data: contacts = [] } = useQuery<any[]>({
    queryKey: ['/api/contacts'],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const customers = contacts.filter(contact => 
    contact.type === 'customer' || contact.type === 'both'
  );

  // Create sales order mutation
  const createMutation = useMutation({
    mutationFn: async (data: SalesOrderForm) => {
      const processedData = {
        ...data,
        subtotal: data.amount, // Send as string
        total: data.amount,    // Send as string
        tax_total: '0',
        date: data.order_date, // Map order_date to date
        delivery_date: data.delivery_date, // Map expected_date to delivery_date
        status: 'pending',
        lines: [{
            description: data.description,
            quantity: 1,
            unit_price: data.amount, // Send as string
            amount: data.amount,     // Send as string
            project_id: data.project_id
        }]
      };
      return await apiRequest('POST', '/api/sales/orders', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales/orders'] });
      setShowDialog(false);
      toast({
        title: t('common.createSuccess'),
        description: t('sales.orders.orderCreatedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('sales.orders.orderCreateError'),
        variant: 'destructive',
      });
    },
  });

  // Form
  const form = useForm<SalesOrderForm>({
    resolver: zodResolver(salesOrderSchemaFactory(t)),
    defaultValues: {
      customer_id: '',
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      description: '',
      amount: '',
      notes: '',
      project_id: '',
    },
  });

  const onSubmit = (data: SalesOrderForm) => {
    createMutation.mutate(data);
  };

  // Fetch real sales orders
  const { data: orders = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/sales/orders'],
    select: (data: any[]) =>
      data.map((o: any) => ({
        ...o,
        total: Number(o.total || 0),
        subtotal: Number(o.subtotal || 0),
        tax_total: Number(o.tax_total || 0),
      })),
  });

  // Join with contacts to show customer names
  const displayOrders = orders.map((o: any) => {
    const customer = customers.find((c: any) => c.id === o.customer_id);
    return {
      id: o.id,
      order_number: o.order_number,
      customer_name: customer?.name || '-',
      order_date: o.date,
      delivery_date: o.delivery_date,
      total_amount: Number(o.total || 0),
      currency: o.currency || 'USD',
      items_count: 0,
      payment_status: 'pending',
      status: o.status || 'pending',
    };
  });

  // Filter orders
  const filteredOrders = displayOrders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'pending':
        return order.status === 'pending';
      case 'processing':
        return order.status === 'processing';
      case 'shipped':
        return order.status === 'shipped';
      case 'delivered':
        return order.status === 'delivered';
      case 'cancelled':
        return order.status === 'cancelled';
      default:
        return true;
    }
  });

  // Calculate statistics
  const stats = {
    total: displayOrders.length,
    totalValue: displayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
    pending: displayOrders.filter(o => o.status === 'pending').length,
    processing: displayOrders.filter(o => o.status === 'processing').length,
    shipped: displayOrders.filter(o => o.status === 'shipped').length,
    delivered: displayOrders.filter(o => o.status === 'delivered').length,
  };

  const handleConvertToInvoice = (id: string) => {
    toast({
      title: t('sales.orders.invoiceCreated'),
      description: t('sales.orders.orderConvertedSuccess'),
    });
  };

  const handleMarkAsShipped = (id: string) => {
    toast({
      title: t('sales.orders.orderShipped'),
      description: t('sales.orders.orderShippedSuccess'),
    });
  };

  const handleCancelOrder = (id: string) => {
    if (confirm(t('sales.orders.confirmCancel'))) {
      toast({
        title: t('sales.orders.orderCancelled'),
        description: t('sales.orders.orderCancelledSuccess'),
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

  const getPaymentStatusBadge = (status: string) => {
    const config = paymentStatusConfig[status as keyof typeof paymentStatusConfig];
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('sales.orders.title')}</h1>
          <p className="text-muted-foreground mt-1 hidden sm:block">{t('sales.orders.description')}</p>
          <p className="text-muted-foreground mt-1 sm:hidden">{t('sales.orders.descriptionShort')}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              size={isMobile ? 'sm' : 'default'}
              data-testid="button-new-order"
            >
              <Plus className="h-4 w-4 me-2" />
              {t('sales.orders.addOrder')}
            </Button>
          </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('sales.orders.addOrder')}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.customer')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('placeholders.selectCustomer')} />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.orders.orderDate')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('sales.orders.deliveryDate')}</FormLabel>
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
                            placeholder={t('placeholders.enterDescription')} 
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
                      <FormLabel>{t('common.notes')} ({t('common.optional')})</FormLabel>
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
                      <FormLabel>{t('common.project', { defaultValue: 'Project' })}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('common.selectProject', { defaultValue: 'Select Project' })} />
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
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? t('common.creating') : t('common.create')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.orders.totalOrders')}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t('sales.orders.orderValue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalValue, 'USD')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.orders.totalRevenue')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('common.pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.orders.toProcess')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.orders.processing')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.processing}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.orders.inProgress')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('sales.orders.shipped')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.shipped}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('sales.orders.onTheWay')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder={t('placeholders.searchOrders')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:max-w-sm"
            data-testid="input-search-orders"
          />
        </div>
      </div>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Responsive, sticky tabs list similar to Tax Reports */}
        <TabsList
          className="flex flex-wrap w-full h-auto min-h-10 items-start content-start gap-3 bg-muted/70 backdrop-blur rounded-lg px-4 py-4 mb-4 shadow-sm border border-border sticky top-0 z-20"
          style={{ height: 'auto' }}
        >
          <TabsTrigger value="all">{t('sales.orders.allOrders')}</TabsTrigger>
          <TabsTrigger value="pending">{t('common.pending')}</TabsTrigger>
          <TabsTrigger value="processing">{t('sales.orders.processing')}</TabsTrigger>
          <TabsTrigger value="shipped">{t('sales.orders.shipped')}</TabsTrigger>
          <TabsTrigger value="delivered">{t('sales.orders.delivered')}</TabsTrigger>
          <TabsTrigger value="cancelled">{t('common.cancelled')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('sales.orders.orderNumber')}</TableHead>
                      <TableHead>{t('common.customer')}</TableHead>
                      <TableHead>{t('sales.orders.orderDate')}</TableHead>
                      <TableHead>{t('sales.orders.deliveryDate')}</TableHead>
                      <TableHead>{t('common.items')}</TableHead>
                      <TableHead>{t('common.amount')}</TableHead>
                      <TableHead>{t('sales.orders.paymentStatus')}</TableHead>
                      <TableHead>{t('common.status')}</TableHead>
                      <TableHead className="text-end">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium" data-label={t('sales.orders.orderNumber')}>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                          {order.order_number}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('common.customer')}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {order.customer_name}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('sales.orders.orderDate')}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(order.order_date).toLocaleDateString(i18n.language)}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('sales.orders.deliveryDate')}>
                        {new Date(order.delivery_date).toLocaleDateString(i18n.language)}
                      </TableCell>
                      <TableCell data-label={t('common.items')}>{order.items_count} {t('common.items')}</TableCell>
                      <TableCell className="font-semibold" data-label={t('common.amount')}>
                        {formatCurrency(order.total_amount, order.currency)}
                      </TableCell>
                      <TableCell data-label={t('sales.orders.paymentStatus')}>{getPaymentStatusBadge(order.payment_status)}</TableCell>
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
                            {order.status === 'processing' && (
                              <DropdownMenuItem onClick={() => handleMarkAsShipped(order.id)}>
                                <Truck className="h-4 w-4 me-2" />
                                {t('sales.orders.markAsShipped')}
                              </DropdownMenuItem>
                            )}
                            {order.status === 'delivered' && order.payment_status === 'paid' && (
                              <DropdownMenuItem onClick={() => handleConvertToInvoice(order.id)}>
                                <ArrowRight className="h-4 w-4 me-2" />
                                {t('sales.orders.createInvoice')}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <XCircle className="h-4 w-4 me-2" />
                              {t('sales.orders.cancelOrder')}
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