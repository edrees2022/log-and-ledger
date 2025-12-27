/**
 * Mobile Card List Component
 * Alternative to data tables for mobile devices
 * Displays data as cards instead of table rows
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SwipeableRow, createDeleteAction, createEditAction } from './SwipeableRow';

export interface CardField {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  isPrimary?: boolean;
  isSecondary?: boolean;
  isBadge?: boolean;
}

export interface CardAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'destructive';
}

interface MobileCardListProps<T extends { id: string }> {
  data: T[];
  fields: CardField[];
  actions?: CardAction[];
  isLoading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onRowClick?: (row: T) => void;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  swipeActions?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  className?: string;
}

export function MobileCardList<T extends { id: string }>({
  data,
  fields,
  actions = [],
  isLoading = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  pagination = true,
  pageSize = 10,
  emptyMessage,
  emptyIcon,
  swipeActions = false,
  onEdit,
  onDelete,
  className,
}: MobileCardListProps<T>) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  const primaryField = fields.find(f => f.isPrimary);
  const secondaryField = fields.find(f => f.isSecondary);
  const badgeField = fields.find(f => f.isBadge);
  const detailFields = fields.filter(f => !f.isPrimary && !f.isSecondary && !f.isBadge);

  // Pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = pagination ? data.slice(startIndex, startIndex + pageSize) : data;

  const handleSelect = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getValue = (row: any, field: CardField) => {
    const value = row[field.key];
    if (field.render) return field.render(value, row);
    return value ?? '-';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        {emptyIcon && <div className="mb-4 text-muted-foreground">{emptyIcon}</div>}
        <p className="text-muted-foreground">
          {emptyMessage || t('common.noData')}
        </p>
      </div>
    );
  }

  const renderCard = (row: T) => {
    const cardContent = (
      <Card
        className={cn(
          'cursor-pointer hover:bg-muted/50 transition-colors',
          selectedIds.includes(row.id) && 'ring-2 ring-primary'
        )}
        onClick={() => {
          if (onRowClick) onRowClick(row);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            {selectable && (
              <Checkbox
                checked={selectedIds.includes(row.id)}
                onCheckedChange={() => handleSelect(row.id)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1"
              />
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {/* Primary Field */}
                  {primaryField && (
                    <h4 className="font-medium truncate">
                      {getValue(row, primaryField)}
                    </h4>
                  )}
                  {/* Secondary Field */}
                  {secondaryField && (
                    <p className="text-sm text-muted-foreground truncate">
                      {getValue(row, secondaryField)}
                    </p>
                  )}
                </div>
                {/* Badge */}
                {badgeField && (
                  <div className="flex-shrink-0">
                    {getValue(row, badgeField)}
                  </div>
                )}
              </div>

              {/* Detail Fields */}
              {detailFields.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {detailFields.slice(0, 4).map(field => (
                    <div key={field.key} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{field.label}</span>
                      <span className="truncate">{getValue(row, field)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Menu */}
            {actions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.map((action, idx) => (
                    <div key={action.id}>
                      {action.variant === 'destructive' && idx > 0 && (
                        <DropdownMenuSeparator />
                      )}
                      <DropdownMenuItem
                        onClick={() => action.onClick(row)}
                        className={action.variant === 'destructive' ? 'text-destructive' : ''}
                      >
                        {action.icon}
                        <span className="ms-2">{action.label}</span>
                      </DropdownMenuItem>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    );

    // Wrap with swipeable if enabled
    if (swipeActions && (onEdit || onDelete)) {
      const rightActions = [];
      if (onDelete) {
        rightActions.push(createDeleteAction(() => onDelete(row), t));
      }
      const leftActions = [];
      if (onEdit) {
        leftActions.push(createEditAction(() => onEdit(row), t));
      }

      return (
        <SwipeableRow
          key={row.id}
          leftActions={leftActions}
          rightActions={rightActions}
        >
          {cardContent}
        </SwipeableRow>
      );
    }

    return <div key={row.id}>{cardContent}</div>;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {paginatedData.map(renderCard)}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('common.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('common.pageOf', { current: currentPage, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            {t('common.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Responsive wrapper that shows table on desktop and cards on mobile
 */
interface ResponsiveListProps<T extends { id: string }> {
  data: T[];
  tableView: React.ReactNode;
  mobileProps: Omit<MobileCardListProps<T>, 'data'>;
}

export function ResponsiveList<T extends { id: string }>({
  data,
  tableView,
  mobileProps,
}: ResponsiveListProps<T>) {
  return (
    <>
      {/* Desktop: Table */}
      <div className="hidden md:block">
        {tableView}
      </div>
      {/* Mobile: Cards */}
      <div className="md:hidden">
        <MobileCardList data={data} {...mobileProps} />
      </div>
    </>
  );
}
