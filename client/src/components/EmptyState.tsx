/**
 * Empty State Component
 * Beautiful empty states for lists and pages
 */
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FileText,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Search,
  FolderOpen,
  Inbox,
  Plus,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'default' | 'compact' | 'card';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const { t } = useTranslation();

  if (variant === 'compact') {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
          {icon || <Inbox className="h-6 w-6 text-muted-foreground" />}
        </div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {action && (
          <Button size="sm" className="mt-4" onClick={action.onClick}>
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        "border rounded-lg p-8 text-center bg-muted/30",
        className
      )}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          {icon || <FolderOpen className="h-8 w-8 text-muted-foreground" />}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && (
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">{description}</p>
        )}
        <div className="flex items-center justify-center gap-3 mt-6">
          {action && (
            <Button onClick={action.onClick}>
              {action.icon || <Plus className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center",
      className
    )}>
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
        {icon || <Inbox className="h-10 w-10 text-muted-foreground" />}
      </div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md">{description}</p>
      )}
      <div className="flex items-center gap-3 mt-8">
        {action && (
          <Button onClick={action.onClick}>
            {action.icon || <Plus className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Pre-built empty state variants
 */
export function NoSearchResults({ 
  query,
  onClear,
}: { 
  query?: string;
  onClear?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<Search className="h-8 w-8 text-muted-foreground" />}
      title={t('empty.noResults', 'No results found')}
      description={query 
        ? t('empty.noResultsFor', 'No results found for "{{query}}"', { query })
        : t('empty.tryDifferentSearch', 'Try adjusting your search or filters')
      }
      action={onClear ? {
        label: t('empty.clearSearch', 'Clear search'),
        onClick: onClear,
      } : undefined}
      variant="compact"
    />
  );
}

export function NoInvoices({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FileText className="h-10 w-10 text-muted-foreground" />}
      title={t('empty.noInvoices', 'No invoices yet')}
      description={t('empty.noInvoicesDesc', 'Create your first invoice to start tracking your sales')}
      action={onCreate ? {
        label: t('empty.createInvoice', 'Create Invoice'),
        onClick: onCreate,
        icon: <Plus className="h-4 w-4 mr-2" />,
      } : undefined}
    />
  );
}

export function NoContacts({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<Users className="h-10 w-10 text-muted-foreground" />}
      title={t('empty.noContacts', 'No contacts yet')}
      description={t('empty.noContactsDesc', 'Add customers and suppliers to manage your business relationships')}
      action={onCreate ? {
        label: t('empty.addContact', 'Add Contact'),
        onClick: onCreate,
        icon: <Plus className="h-4 w-4 mr-2" />,
      } : undefined}
    />
  );
}

export function NoItems({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<Package className="h-10 w-10 text-muted-foreground" />}
      title={t('empty.noItems', 'No items yet')}
      description={t('empty.noItemsDesc', 'Add products and services to include in your invoices')}
      action={onCreate ? {
        label: t('empty.addItem', 'Add Item'),
        onClick: onCreate,
        icon: <Plus className="h-4 w-4 mr-2" />,
      } : undefined}
    />
  );
}

export function NoTransactions({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<DollarSign className="h-10 w-10 text-muted-foreground" />}
      title={t('empty.noTransactions', 'No transactions yet')}
      description={t('empty.noTransactionsDesc', 'Record payments and receipts to track your cash flow')}
      action={onCreate ? {
        label: t('empty.addTransaction', 'Add Transaction'),
        onClick: onCreate,
        icon: <Plus className="h-4 w-4 mr-2" />,
      } : undefined}
    />
  );
}

export function NoOrders({ onCreate }: { onCreate?: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<ShoppingCart className="h-10 w-10 text-muted-foreground" />}
      title={t('empty.noOrders', 'No orders yet')}
      description={t('empty.noOrdersDesc', 'Create orders to track your sales before invoicing')}
      action={onCreate ? {
        label: t('empty.createOrder', 'Create Order'),
        onClick: onCreate,
        icon: <Plus className="h-4 w-4 mr-2" />,
      } : undefined}
    />
  );
}

export function NoReports({ onGenerate }: { onGenerate?: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<BarChart3 className="h-10 w-10 text-muted-foreground" />}
      title={t('empty.noReports', 'No data for this period')}
      description={t('empty.noReportsDesc', 'Try selecting a different date range or add transactions first')}
      action={onGenerate ? {
        label: t('empty.generateReport', 'Generate Report'),
        onClick: onGenerate,
      } : undefined}
    />
  );
}
