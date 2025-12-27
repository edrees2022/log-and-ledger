/**
 * Mobile Dashboard Component
 * Optimized dashboard for mobile devices with touch-friendly widgets
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { HorizontalStats } from '@/components/ResponsiveStats';
import { cn } from '@/lib/utils';
import {
  Receipt,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  ChevronRight,
  Plus,
  DollarSign,
  CreditCard,
  FileText,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

interface RecentItem {
  id: string;
  title: string;
  subtitle: string;
  amount?: string;
  status?: string;
  type: 'invoice' | 'expense' | 'payment' | 'receipt';
}

export function MobileDashboard() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/dashboard/recent'],
  });

  const quickActions: QuickAction[] = [
    {
      id: 'new-invoice',
      label: t('dashboard.newInvoice'),
      icon: <Receipt className="h-6 w-6" />,
      href: '/sales/invoices/new',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    },
    {
      id: 'new-expense',
      label: t('dashboard.newExpense'),
      icon: <ShoppingCart className="h-6 w-6" />,
      href: '/purchases/expenses/new',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    },
    {
      id: 'receive-payment',
      label: t('dashboard.receivePayment'),
      icon: <DollarSign className="h-6 w-6" />,
      href: '/banking/receipts/new',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    },
    {
      id: 'make-payment',
      label: t('dashboard.makePayment'),
      icon: <CreditCard className="h-6 w-6" />,
      href: '/banking/payments/new',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    },
  ];

  // Mock stats for demo
  const dashboardStats = [
    {
      id: 'revenue',
      label: t('dashboard.revenue'),
      value: '$45,250',
      trend: { value: 12, isPositive: true },
      color: 'success' as const,
    },
    {
      id: 'expenses',
      label: t('dashboard.expenses'),
      value: '$18,420',
      trend: { value: 5, isPositive: false },
      color: 'danger' as const,
    },
    {
      id: 'receivables',
      label: t('dashboard.receivables'),
      value: '$12,800',
      color: 'warning' as const,
    },
    {
      id: 'profit',
      label: t('dashboard.profit'),
      value: '$26,830',
      trend: { value: 18, isPositive: true },
      color: 'success' as const,
    },
  ];

  // Mock recent items
  const recentItems: RecentItem[] = [
    {
      id: '1',
      title: 'Invoice #INV-2024-156',
      subtitle: 'ABC Company',
      amount: '$2,500.00',
      status: 'paid',
      type: 'invoice',
    },
    {
      id: '2',
      title: 'Expense - Office Supplies',
      subtitle: 'Amazon',
      amount: '$156.00',
      type: 'expense',
    },
    {
      id: '3',
      title: 'Payment Received',
      subtitle: 'XYZ Corp',
      amount: '$5,000.00',
      type: 'receipt',
    },
    {
      id: '4',
      title: 'Invoice #INV-2024-155',
      subtitle: 'Tech Solutions',
      amount: '$8,750.00',
      status: 'overdue',
      type: 'invoice',
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const variants: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-700'}>
        {t(`common.${status}`)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      invoice: <Receipt className="h-4 w-4 text-blue-500" />,
      expense: <ShoppingCart className="h-4 w-4 text-red-500" />,
      payment: <CreditCard className="h-4 w-4 text-purple-500" />,
      receipt: <DollarSign className="h-4 w-4 text-green-500" />,
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(i18n.language, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
        </Button>
      </div>

      {/* Stats Cards - Horizontal Scroll */}
      <HorizontalStats stats={dashboardStats} isLoading={statsLoading} />

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('dashboard.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => setLocation(action.href)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg transition-colors active:scale-95',
                  action.color
                )}
              >
                {action.icon}
                <span className="text-xs font-medium text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                {t('dashboard.alertsTitle')}
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                <li>• 3 {t('dashboard.overdueInvoices')}</li>
                <li>• 2 {t('dashboard.lowStockItems')}</li>
                <li>• 1 {t('dashboard.pendingApproval')}</li>
              </ul>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 mt-2 text-yellow-700 dark:text-yellow-300 underline"
                onClick={() => setLocation('/reports')}
              >
                {t('dashboard.viewAll')} <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('dashboard.recentActivity')}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/reports/journal-book')}
            >
              {t('common.viewAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <p className="text-sm font-medium">{item.amount}</p>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Flow Mini Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('dashboard.cashFlow')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/reports/cash-flow')}
            >
              {t('common.details')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">{t('dashboard.inflows')}</span>
              </div>
              <span className="font-medium text-green-600">+$45,250</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-green-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">{t('dashboard.outflows')}</span>
              </div>
              <span className="font-medium text-red-600">-$18,420</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-red-500 rounded-full" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('dashboard.netCashFlow')}</span>
                <span className="font-bold text-green-600">+$26,830</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Due */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('dashboard.upcomingDue')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Invoice #INV-2024-157</p>
                <p className="text-xs text-muted-foreground">Due in 3 days</p>
              </div>
              <span className="font-medium">$3,200</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Bill #BILL-2024-089</p>
                <p className="text-xs text-muted-foreground">Due in 5 days</p>
              </div>
              <span className="font-medium">$1,450</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Invoice #INV-2024-158</p>
                <p className="text-xs text-muted-foreground">Due in 7 days</p>
              </div>
              <span className="font-medium">$5,800</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Mobile Widget Component
 * Reusable widget for mobile dashboard
 */
interface MobileWidgetProps {
  title: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  children: React.ReactNode;
  className?: string;
}

export function MobileWidget({
  title,
  icon,
  action,
  children,
  className,
}: MobileWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {action && (
            <Button variant="ghost" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
