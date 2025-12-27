import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Download, 
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Printer,
  BarChart3,
  PieChart
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

interface SalesSummary {
  totalSales: number;
  totalPaid: number;
  totalUnpaid: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  unpaidInvoiceCount: number;
  partialInvoiceCount: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalAmount: number;
    invoiceCount: number;
  }>;
  topItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    totalAmount: number;
  }>;
  byMonth: Array<{
    month: string;
    total: number;
    count: number;
  }>;
}

interface PurchaseSummary {
  totalPurchases: number;
  totalPaid: number;
  totalUnpaid: number;
  billCount: number;
  paidBillCount: number;
  unpaidBillCount: number;
  partialBillCount: number;
  topSuppliers: Array<{
    supplierId: string;
    supplierName: string;
    totalAmount: number;
    billCount: number;
  }>;
  topItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    totalAmount: number;
  }>;
  byMonth: Array<{
    month: string;
    total: number;
    count: number;
  }>;
}

export default function SalesPurchaseSummaryPage() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  
  // State
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases'>('sales');
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(0, 1); // January 1st of current year
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Fetch sales summary
  const { data: salesSummary, isLoading: loadingSales, refetch: refetchSales } = useQuery<SalesSummary>({
    queryKey: ['/api/reports/sales-summary', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const res = await apiRequest('GET', `/api/reports/sales-summary?${params.toString()}`);
      return res.json();
    },
    enabled: !!startDate && !!endDate,
  });

  // Fetch purchases summary
  const { data: purchasesSummary, isLoading: loadingPurchases, refetch: refetchPurchases } = useQuery<PurchaseSummary>({
    queryKey: ['/api/reports/purchases-summary', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      const res = await apiRequest('GET', `/api/reports/purchases-summary?${params.toString()}`);
      return res.json();
    },
    enabled: !!startDate && !!endDate,
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US').format(num);
  };

  // Calculate collection rate
  const getCollectionRate = (paid: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((paid / total) * 100);
  };

  // Export to CSV
  const handleExportCSV = (type: 'sales' | 'purchases') => {
    const summary = type === 'sales' ? salesSummary : purchasesSummary;
    if (!summary) return;

    const csvRows: string[] = [];
    
    // Header
    csvRows.push(type === 'sales' 
      ? t('reports.salesPurchase.salesSummaryExport')
      : t('reports.salesPurchase.purchasesSummaryExport'));
    csvRows.push(`${t('reports.salesPurchase.period')}: ${startDate?.toLocaleDateString(i18n.language)} - ${endDate?.toLocaleDateString(i18n.language)}`);
    csvRows.push('');
    
    // Summary
    if (type === 'sales' && salesSummary) {
      csvRows.push(`${t('reports.salesPurchase.totalSales')},${salesSummary.totalSales}`);
      csvRows.push(`${t('reports.salesPurchase.totalPaid')},${salesSummary.totalPaid}`);
      csvRows.push(`${t('reports.salesPurchase.totalUnpaid')},${salesSummary.totalUnpaid}`);
      csvRows.push(`${t('reports.salesPurchase.invoiceCount')},${salesSummary.invoiceCount}`);
      csvRows.push('');
      csvRows.push(t('reports.salesPurchase.topCustomers'));
      csvRows.push(`${t('reports.salesPurchase.customerName')},${t('reports.salesPurchase.totalAmount')},${t('reports.salesPurchase.count')}`);
      salesSummary.topCustomers.forEach(c => {
        csvRows.push(`${c.customerName},${c.totalAmount},${c.invoiceCount}`);
      });
    } else if (type === 'purchases' && purchasesSummary) {
      csvRows.push(`${t('reports.salesPurchase.totalPurchases')},${purchasesSummary.totalPurchases}`);
      csvRows.push(`${t('reports.salesPurchase.totalPaid')},${purchasesSummary.totalPaid}`);
      csvRows.push(`${t('reports.salesPurchase.totalUnpaid')},${purchasesSummary.totalUnpaid}`);
      csvRows.push(`${t('reports.salesPurchase.billCount')},${purchasesSummary.billCount}`);
      csvRows.push('');
      csvRows.push(t('reports.salesPurchase.topSuppliers'));
      csvRows.push(`${t('reports.salesPurchase.supplierName')},${t('reports.salesPurchase.totalAmount')},${t('reports.salesPurchase.count')}`);
      purchasesSummary.topSuppliers.forEach(s => {
        csvRows.push(`${s.supplierName},${s.totalAmount},${s.billCount}`);
      });
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}-summary-${startDate?.toISOString().split('T')[0]}-${endDate?.toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  const isLoading = activeTab === 'sales' ? loadingSales : loadingPurchases;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              {t('reports.salesPurchase.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('reports.salesPurchase.description')}
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 me-2" />
              {t('buttons.print')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportCSV(activeTab)}>
              <Download className="h-4 w-4 me-2" />
              {t('buttons.export')}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-lg">{t('reports.salesPurchase.filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2 min-w-[180px]">
                <Label>{t('reports.salesPurchase.startDate')}</Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                />
              </div>
              <div className="space-y-2 min-w-[180px]">
                <Label>{t('reports.salesPurchase.endDate')}</Label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => activeTab === 'sales' ? refetchSales() : refetchPurchases()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t('buttons.refresh')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'sales' | 'purchases')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 print:hidden">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('reports.salesPurchase.sales')}
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {t('reports.salesPurchase.purchases')}
            </TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales" className="mt-6 space-y-6">
            {loadingSales ? (
              <Card>
                <CardContent className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : !salesSummary ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('reports.salesPurchase.noSalesData')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t('reports.salesPurchase.totalSales')}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(salesSummary.totalSales)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(salesSummary.invoiceCount)} {t('reports.salesPurchase.invoices')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t('reports.salesPurchase.collected')}
                      </CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(salesSummary.totalPaid)}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{t('reports.salesPurchase.collectionRate')}</span>
                          <span>{getCollectionRate(salesSummary.totalPaid, salesSummary.totalSales)}%</span>
                        </div>
                        <Progress value={getCollectionRate(salesSummary.totalPaid, salesSummary.totalSales)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t('reports.salesPurchase.outstanding')}
                      </CardTitle>
                      <ArrowDownRight className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(salesSummary.totalUnpaid)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(salesSummary.unpaidInvoiceCount)} {t('reports.salesPurchase.unpaidInvoices')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t('reports.salesPurchase.averageInvoice')}
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(salesSummary.invoiceCount > 0 ? salesSummary.totalSales / salesSummary.invoiceCount : 0)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {formatNumber(salesSummary.paidInvoiceCount)} {t('reports.salesPurchase.paid')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formatNumber(salesSummary.partialInvoiceCount)} {t('reports.salesPurchase.partial')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Customers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {t('reports.salesPurchase.topCustomers')}
                    </CardTitle>
                    <CardDescription>
                      {t('reports.salesPurchase.topCustomersDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {salesSummary.topCustomers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        {t('reports.salesPurchase.noCustomers')}
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('reports.salesPurchase.customerName')}</TableHead>
                            <TableHead className="text-center">{t('reports.salesPurchase.invoiceCount')}</TableHead>
                            <TableHead className="text-end">{t('reports.salesPurchase.totalAmount')}</TableHead>
                            <TableHead className="text-end">{t('reports.salesPurchase.percentage')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesSummary.topCustomers.map((customer, index) => (
                            <TableRow key={customer.customerId}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                                    {index + 1}
                                  </Badge>
                                  {customer.customerName}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {formatNumber(customer.invoiceCount)}
                              </TableCell>
                              <TableCell className="text-end font-medium">
                                {formatCurrency(customer.totalAmount)}
                              </TableCell>
                              <TableCell className="text-end">
                                <div className="flex items-center justify-end gap-2">
                                  <Progress 
                                    value={(customer.totalAmount / salesSummary.totalSales) * 100} 
                                    className="w-16 h-2" 
                                  />
                                  <span className="text-xs text-muted-foreground w-10">
                                    {((customer.totalAmount / salesSummary.totalSales) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Top Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {t('reports.salesPurchase.topItems')}
                    </CardTitle>
                    <CardDescription>
                      {t('reports.salesPurchase.topItemsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {salesSummary.topItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        {t('reports.salesPurchase.noItems')}
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('reports.salesPurchase.itemName')}</TableHead>
                            <TableHead className="text-center">{t('reports.salesPurchase.quantity')}</TableHead>
                            <TableHead className="text-end">{t('reports.salesPurchase.totalAmount')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesSummary.topItems.map((item, index) => (
                            <TableRow key={item.itemId}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                                    {index + 1}
                                  </Badge>
                                  {item.itemName}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {formatNumber(item.quantity)}
                              </TableCell>
                              <TableCell className="text-end font-medium">
                                {formatCurrency(item.totalAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Purchases Tab */}
          <TabsContent value="purchases" className="mt-6 space-y-6">
            {loadingPurchases ? (
              <Card>
                <CardContent className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : !purchasesSummary ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <TrendingDown className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('reports.salesPurchase.noPurchasesData')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t('reports.salesPurchase.totalPurchases')}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(purchasesSummary.totalPurchases)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(purchasesSummary.billCount)} {t('reports.salesPurchase.bills')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t('reports.salesPurchase.paid')}
                      </CardTitle>
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(purchasesSummary.totalPaid)}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{t('reports.salesPurchase.paymentRate')}</span>
                          <span>{getCollectionRate(purchasesSummary.totalPaid, purchasesSummary.totalPurchases)}%</span>
                        </div>
                        <Progress value={getCollectionRate(purchasesSummary.totalPaid, purchasesSummary.totalPurchases)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t('reports.salesPurchase.unpaid')}
                      </CardTitle>
                      <ArrowDownRight className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(purchasesSummary.totalUnpaid)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatNumber(purchasesSummary.unpaidBillCount)} {t('reports.salesPurchase.unpaidBills')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t('reports.salesPurchase.averageBill')}
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(purchasesSummary.billCount > 0 ? purchasesSummary.totalPurchases / purchasesSummary.billCount : 0)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {formatNumber(purchasesSummary.paidBillCount)} {t('reports.salesPurchase.paid')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {formatNumber(purchasesSummary.partialBillCount)} {t('reports.salesPurchase.partial')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Suppliers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {t('reports.salesPurchase.topSuppliers')}
                    </CardTitle>
                    <CardDescription>
                      {t('reports.salesPurchase.topSuppliersDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {purchasesSummary.topSuppliers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        {t('reports.salesPurchase.noSuppliers')}
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('reports.salesPurchase.supplierName')}</TableHead>
                            <TableHead className="text-center">{t('reports.salesPurchase.billCount')}</TableHead>
                            <TableHead className="text-end">{t('reports.salesPurchase.totalAmount')}</TableHead>
                            <TableHead className="text-end">{t('reports.salesPurchase.percentage')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchasesSummary.topSuppliers.map((supplier, index) => (
                            <TableRow key={supplier.supplierId}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                                    {index + 1}
                                  </Badge>
                                  {supplier.supplierName}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {formatNumber(supplier.billCount)}
                              </TableCell>
                              <TableCell className="text-end font-medium">
                                {formatCurrency(supplier.totalAmount)}
                              </TableCell>
                              <TableCell className="text-end">
                                <div className="flex items-center justify-end gap-2">
                                  <Progress 
                                    value={(supplier.totalAmount / purchasesSummary.totalPurchases) * 100} 
                                    className="w-16 h-2" 
                                  />
                                  <span className="text-xs text-muted-foreground w-10">
                                    {((supplier.totalAmount / purchasesSummary.totalPurchases) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Top Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {t('reports.salesPurchase.topPurchasedItems')}
                    </CardTitle>
                    <CardDescription>
                      {t('reports.salesPurchase.topPurchasedItemsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {purchasesSummary.topItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        {t('reports.salesPurchase.noItems')}
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('reports.salesPurchase.itemName')}</TableHead>
                            <TableHead className="text-center">{t('reports.salesPurchase.quantity')}</TableHead>
                            <TableHead className="text-end">{t('reports.salesPurchase.totalAmount')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchasesSummary.topItems.map((item, index) => (
                            <TableRow key={item.itemId}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="w-6 h-6 flex items-center justify-center text-xs">
                                    {index + 1}
                                  </Badge>
                                  {item.itemName}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {formatNumber(item.quantity)}
                              </TableCell>
                              <TableCell className="text-end font-medium">
                                {formatCurrency(item.totalAmount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
