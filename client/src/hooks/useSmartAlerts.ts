/**
 * Smart Alerts Hook
 * Provides intelligent alerts for overdue invoices, low stock, etc.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useCompanyCurrency } from './use-company-currency';
import { 
  AlertCircle, 
  Clock, 
  Package, 
  TrendingDown,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';

export interface SmartAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  category: 'receivables' | 'payables' | 'inventory' | 'cash' | 'tasks' | 'general';
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    href: string;
  };
  timestamp?: Date;
  priority: number; // Higher = more urgent
}

interface AlertsData {
  overdueInvoices: {
    count: number;
    total: number;
    items: Array<{ id: string; number: string; customer: string; amount: number; days_overdue: number }>;
  };
  overdueBills: {
    count: number;
    total: number;
    items: Array<{ id: string; number: string; supplier: string; amount: number; days_overdue: number }>;
  };
  lowStockItems: {
    count: number;
    items: Array<{ id: string; name: string; current: number; reorder_level: number }>;
  };
  upcomingPayments: {
    count: number;
    total: number;
    items: Array<{ id: string; number: string; supplier: string; amount: number; due_date: string }>;
  };
  pendingApprovals: number;
  cashFlowWarning?: boolean;
}

export function useSmartAlerts() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();

  const { data: alertsData, isLoading } = useQuery<AlertsData>({
    queryKey: ['/api/alerts/smart'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const alerts = useMemo<SmartAlert[]>(() => {
    if (!alertsData) return [];

    const result: SmartAlert[] = [];

    // Overdue invoices (high priority)
    if (alertsData.overdueInvoices?.count > 0) {
      result.push({
        id: 'overdue-invoices',
        type: 'danger',
        category: 'receivables',
        title: t('alerts.overdueInvoices', { count: alertsData.overdueInvoices.count }),
        description: t('alerts.overdueInvoicesDesc', { 
          amount: formatCurrency(alertsData.overdueInvoices.total)
        }),
        icon: AlertCircle,
        action: {
          label: t('alerts.viewOverdue'),
          href: '/sales/invoices?status=overdue',
        },
        priority: 100,
      });
    }

    // Overdue bills (high priority)
    if (alertsData.overdueBills?.count > 0) {
      result.push({
        id: 'overdue-bills',
        type: 'danger',
        category: 'payables',
        title: t('alerts.overdueBills', { count: alertsData.overdueBills.count }),
        description: t('alerts.overdueBillsDesc', { 
          amount: formatCurrency(alertsData.overdueBills.total)
        }),
        icon: CreditCard,
        action: {
          label: t('alerts.viewOverdueBills'),
          href: '/purchases/bills?status=overdue',
        },
        priority: 95,
      });
    }

    // Low stock items (medium priority)
    if (alertsData.lowStockItems?.count > 0) {
      result.push({
        id: 'low-stock',
        type: 'warning',
        category: 'inventory',
        title: t('alerts.lowStock', { count: alertsData.lowStockItems.count }),
        description: t('alerts.lowStockDesc'),
        icon: Package,
        action: {
          label: t('alerts.viewInventory'),
          href: '/inventory?filter=low-stock',
        },
        priority: 70,
      });
    }

    // Upcoming payments (info)
    if (alertsData.upcomingPayments?.count > 0) {
      result.push({
        id: 'upcoming-payments',
        type: 'info',
        category: 'payables',
        title: t('alerts.upcomingPayments', { count: alertsData.upcomingPayments.count }),
        description: t('alerts.upcomingPaymentsDesc', { 
          amount: formatCurrency(alertsData.upcomingPayments.total)
        }),
        icon: Calendar,
        action: {
          label: t('alerts.viewPayments'),
          href: '/purchases/bills?due=week',
        },
        priority: 50,
      });
    }

    // Pending approvals
    if (alertsData.pendingApprovals > 0) {
      result.push({
        id: 'pending-approvals',
        type: 'info',
        category: 'general',
        title: t('alerts.pendingApprovals', { count: alertsData.pendingApprovals }),
        description: t('alerts.pendingApprovalsDesc'),
        icon: Clock,
        action: {
          label: t('alerts.viewApprovals'),
          href: '/approvals',
        },
        priority: 60,
      });
    }

    // Cash flow warning
    if (alertsData.cashFlowWarning) {
      result.push({
        id: 'cash-flow-warning',
        type: 'warning',
        category: 'cash',
        title: t('alerts.cashFlowWarning'),
        description: t('alerts.cashFlowWarningDesc'),
        icon: TrendingDown,
        action: {
          label: t('alerts.viewCashFlow'),
          href: '/reports/cash-flow',
        },
        priority: 90,
      });
    }

    // Sort by priority (descending)
    return result.sort((a, b) => b.priority - a.priority);
  }, [alertsData, t, formatCurrency]);

  return {
    alerts,
    isLoading,
    hasAlerts: alerts.length > 0,
    criticalCount: alerts.filter(a => a.type === 'danger').length,
    warningCount: alerts.filter(a => a.type === 'warning').length,
  };
}
