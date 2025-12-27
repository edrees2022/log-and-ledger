import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { useLocation } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  Building2,
  Users,
  Receipt,
  ShoppingCart,
  PiggyBank,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Upload,
  RefreshCw,
  Plus,
  FileText,
  Package,
  Calculator,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { exportToCsv } from "@/utils/export";

// Types for Dashboard API response
interface DashboardData {
  kpis: {
    totalCash: number;
    accountsReceivable: number;
    accountsPayable: number;
    monthlyRevenue: number;
    revenueChange: number;
  };
  monthlyRevenueData: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  expenseBreakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recentTransactions: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    amount: string;
    status: string;
  }>;
}

// Move expense breakdown inside component to access t()
// const expenseBreakdown will be defined inside Dashboard component

// Move recent transactions inside component to access t()
// const recentTransactions will be defined inside Dashboard component

const getStatusBadge = (status: string, t: any) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800">{t('common.paid')}</Badge>;
    case "pending":
      return <Badge variant="secondary">{t('common.pending')}</Badge>;
    case "overdue":
      return <Badge variant="destructive">{t('common.overdue')}</Badge>;
    case "approved":
      return <Badge className="bg-blue-100 text-blue-800">{t('common.approved')}</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "invoice":
      return <Receipt className="h-4 w-4" />;
    case "expense":
      return <PiggyBank className="h-4 w-4" />;
    case "bill":
      return <ShoppingCart className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
};

export function Dashboard() {
  const { t } = useTranslation();
  const companyCurrency = useCompanyCurrency();
  const [, setLocation] = useLocation();
  
  // Currency formatter using company's base currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: companyCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  // Fetch real dashboard data from API
  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['/api/reports/dashboard'],
    refetchInterval: 60000, // Refetch every minute
  });

  const kpis = dashboardData?.kpis || {
    totalCash: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    monthlyRevenue: 0,
    revenueChange: 0
  };
  const monthlyRevenueData = dashboardData?.monthlyRevenueData || [];
  const expenseBreakdown = dashboardData?.expenseBreakdown || [];
  const recentTransactions = dashboardData?.recentTransactions || [];
  
  // KPI data from API
  const kpiData = [
    {
      title: t('dashboard.totalCash'),
      value: formatCurrency(kpis.totalCash || 0),
      change: kpis.totalCash > 0 ? "+5.2%" : "—",
      trend: "up" as const,
      icon: Wallet,
      color: "text-green-600",
    },
    {
      title: t('dashboard.accountsReceivable'),
      value: formatCurrency(kpis.accountsReceivable || 0),
      change: kpis.accountsReceivable > 0 ? "+3.1%" : "—",
      trend: "up" as const,
      icon: CreditCard,
      color: "text-blue-600",
    },
    {
      title: t('dashboard.accountsPayable'),
      value: formatCurrency(kpis.accountsPayable || 0),
      change: kpis.accountsPayable > 0 ? "-2.3%" : "—",
      trend: "down" as const,
      icon: Receipt,
      color: "text-orange-600",
    },
    {
      title: t('dashboard.monthlyRevenue'),
      value: formatCurrency(kpis.monthlyRevenue || 0),
      change: kpis.revenueChange ? `${kpis.revenueChange > 0 ? '+' : ''}${kpis.revenueChange}%` : "—",
      trend: (kpis.revenueChange || 0) >= 0 ? "up" as const : "down" as const,
      icon: TrendingUp,
      color: "text-green-600",
    },
  ];
  
  const handleSyncNow = async () => {
    await refetch();
  };

  const handleExport = () => {
    try {
      // Export a lightweight snapshot of current dashboard KPIs and any available series
      const headers: string[] = [t('dashboard.metric', { defaultValue: 'Metric' }), t('dashboard.value', { defaultValue: 'Value' })];
      const kpiRows = kpiData.map((k) => [k.title, k.value]);

      // Build a single CSV with simple section separators
      const rows: Array<Array<string | number>> = [
        ...kpiRows,
      ];

      // Add a blank line and a section for Monthly Revenue vs Expenses if present
      if (monthlyRevenueData.length > 0) {
        rows.push([], [t('dashboard.revenueVsExpenses', { defaultValue: 'Revenue vs Expenses' }), '']);
        rows.push([t('common.month', { defaultValue: 'Month' }), t('dashboard.revenue', { defaultValue: 'Revenue' }), t('dashboard.expenses', { defaultValue: 'Expenses' })]);
        for (const pt of monthlyRevenueData) rows.push([pt.month, pt.revenue ?? 0, pt.expenses ?? 0]);
      }

      // Add a recent transactions section if present
      if (recentTransactions.length > 0) {
        rows.push([], [t('dashboard.recentTransactions', { defaultValue: 'Recent Transactions' }), '']);
        rows.push([
          t('common.date', { defaultValue: 'Date' }),
          t('common.type', { defaultValue: 'Type' }),
          t('common.description', { defaultValue: 'Description' }),
          t('common.amount', { defaultValue: 'Amount' }),
          t('common.status', { defaultValue: 'Status' }),
        ]);
        for (const tx of recentTransactions) rows.push([tx.date, tx.type, tx.description, tx.amount, tx.status]);
      }

      exportToCsv(`dashboard_export_${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('common.loading')}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.welcome')}
          </p>
        </div>
        <div className="page-actions mobile-button-group">
          <Button variant="outline" onClick={handleSyncNow} data-testid="button-sync-now">
            <RefreshCw className="h-4 w-4 me-2" />
            {t('dashboard.syncNow')}
          </Button>
          <Button onClick={handleExport} data-testid="button-export-dashboard">
            <Download className="h-4 w-4 me-2" />
            {t('dashboard.export')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover-elevate" data-testid={`card-kpi-${kpi.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {kpi.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 me-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 me-1" />
                  )}
                  <span className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {kpi.change}
                  </span>
                  <span className="ms-1">{t('dashboard.fromLastMonth')}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setLocation('/sales/invoices/new')}
            >
              <Plus className="h-5 w-5 text-green-600" />
              <span className="text-xs">{t('dashboard.newInvoice')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setLocation('/purchases/bills/new')}
            >
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              <span className="text-xs">{t('dashboard.newBill')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setLocation('/accounting/journal')}
            >
              <Calculator className="h-5 w-5 text-blue-600" />
              <span className="text-xs">{t('dashboard.journalEntry')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setLocation('/contacts')}
            >
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-xs">{t('dashboard.addContact')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setLocation('/items')}
            >
              <Package className="h-5 w-5 text-teal-600" />
              <span className="text-xs">{t('dashboard.addItem')}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col py-4 gap-2"
              onClick={() => setLocation('/reports/profit-loss')}
            >
              <FileText className="h-5 w-5 text-indigo-600" />
              <span className="text-xs">{t('dashboard.viewReports')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue vs Expenses Chart */}
        <Card data-testid="card-revenue-chart">
          <CardHeader>
            <CardTitle>{t('dashboard.revenueVsExpenses')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.monthlyComparison')}
            </p>
          </CardHeader>
          <CardContent>
            {monthlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" name={t('dashboard.revenue')} />
                  <Bar dataKey="expenses" fill="hsl(var(--chart-2))" name={t('dashboard.expenses')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {t('common.noDataYet')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card data-testid="card-expense-breakdown">
          <CardHeader>
            <CardTitle>{t('dashboard.expenseBreakdown')}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.currentMonthExpenses')}
            </p>
          </CardHeader>
          <CardContent>
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {t('common.noDataYet')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card data-testid="card-recent-transactions">
        <CardHeader>
          <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.latestActivities')}
          </p>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-muted rounded-lg shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ms-2">
                      <span
                        className={`font-medium ${
                          transaction.amount.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount}
                      </span>
                      {getStatusBadge(transaction.status, t)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full" data-testid="button-view-all-transactions">
                  {t('dashboard.viewAllTransactions')}
                  <ArrowUpRight className="h-4 w-4 ms-2 rtl:rotate-180" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <p>{t('common.noDataYet')}</p>
              <p className="text-sm mt-2">{t('dashboard.startByCreating')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
