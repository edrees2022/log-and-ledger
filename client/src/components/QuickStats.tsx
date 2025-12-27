/**
 * Quick Stats Widget
 * Displays key metrics with real-time updates and trends
 */
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  FileText,
  Receipt,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface QuickStatsData {
  revenue: {
    current: number;
    previous: number;
    trend: number;
  };
  expenses: {
    current: number;
    previous: number;
    trend: number;
  };
  receivables: {
    total: number;
    overdue: number;
    count: number;
  };
  payables: {
    total: number;
    overdue: number;
    count: number;
  };
  invoices: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
  };
  cashBalance: number;
}

interface QuickStatsProps {
  className?: string;
}

export function QuickStats({ className }: QuickStatsProps) {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  
  const { data: stats, isLoading } = useQuery<QuickStatsData>({
    queryKey: ['/api/reports/quick-stats'],
    refetchInterval: 60000, // Refresh every minute
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const TrendIcon = ({ trend }: { trend: number }) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const statCards = useMemo(() => [
    {
      label: t('quickStats.monthlyRevenue', 'Monthly Revenue'),
      value: formatCurrency(stats?.revenue.current || 0),
      trend: stats?.revenue.trend || 0,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: t('quickStats.monthlyExpenses', 'Monthly Expenses'),
      value: formatCurrency(stats?.expenses.current || 0),
      trend: stats?.expenses.trend || 0,
      icon: Receipt,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      invertTrend: true, // Lower expenses = good
    },
    {
      label: t('quickStats.receivables', 'Receivables'),
      value: formatCurrency(stats?.receivables.total || 0),
      subtext: stats?.receivables.overdue ? t('quickStats.overdueAmount', '{{amount}} overdue', { amount: formatCurrency(stats.receivables.overdue) }) : undefined,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      alert: (stats?.receivables.overdue || 0) > 0,
    },
    {
      label: t('quickStats.payables', 'Payables'),
      value: formatCurrency(stats?.payables.total || 0),
      subtext: stats?.payables.overdue ? t('quickStats.overdueAmount', '{{amount}} overdue', { amount: formatCurrency(stats.payables.overdue) }) : undefined,
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      alert: (stats?.payables.overdue || 0) > 0,
    },
    {
      label: t('quickStats.cashBalance', 'Cash Balance'),
      value: formatCurrency(stats?.cashBalance || 0),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
    },
  ], [stats, t, formatCurrency]);

  const invoiceStats = useMemo(() => [
    { label: t('quickStats.draft', 'Draft'), value: stats?.invoices.draft || 0, icon: Clock, color: 'text-muted-foreground' },
    { label: t('quickStats.sent', 'Sent'), value: stats?.invoices.sent || 0, icon: FileText, color: 'text-blue-600' },
    { label: t('quickStats.paid', 'Paid'), value: stats?.invoices.paid || 0, icon: CheckCircle, color: 'text-green-600' },
    { label: t('quickStats.overdue', 'Overdue'), value: stats?.invoices.overdue || 0, icon: AlertCircle, color: 'text-red-600' },
  ], [stats, t]);

  if (isLoading) {
    return (
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-5 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.subtext && (
                    <div className={`text-xs ${stat.alert ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {stat.alert && <AlertCircle className="h-3 w-3 inline me-1" />}
                      {stat.subtext}
                    </div>
                  )}
                </div>
                {stat.trend !== undefined && (
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={stat.invertTrend ? -stat.trend : stat.trend} />
                    <span className={`text-xs ${
                      (stat.invertTrend ? -stat.trend : stat.trend) > 0 
                        ? 'text-green-600' 
                        : (stat.invertTrend ? -stat.trend : stat.trend) < 0 
                          ? 'text-red-600' 
                          : 'text-muted-foreground'
                    }`}>
                      {formatPercent(Math.abs(stat.trend))}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoice Pipeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{t('quickStats.invoicePipeline', 'Invoice Pipeline')}</h3>
            <span className="text-sm text-muted-foreground">
              {t('quickStats.thisMonth', 'This Month')}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {invoiceStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
