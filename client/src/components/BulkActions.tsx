/**
 * Bulk Actions Component
 * Professional bulk operations for tables
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ChevronDown, 
  Trash2, 
  Archive, 
  Send, 
  Download,
  CheckCircle,
  XCircle,
  Tag,
  Printer
} from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ElementType;
  variant?: 'default' | 'destructive';
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
}

interface BulkActionsProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  allIds: string[];
  actions: BulkAction[];
  onAction: (actionId: string, selectedIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

const defaultActions: BulkAction[] = [
  { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive', requiresConfirmation: true },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'print', label: 'Print', icon: Printer },
];

export function BulkActions({
  selectedIds,
  onSelectionChange,
  allIds,
  actions = defaultActions,
  onAction,
  isLoading = false,
}: BulkActionsProps) {
  const { t } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [executing, setExecuting] = useState(false);

  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < allIds.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allIds);
    }
  };

  const handleAction = async (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action);
      return;
    }
    await executeAction(action);
  };

  const executeAction = async (action: BulkAction) => {
    setExecuting(true);
    try {
      await onAction(action.id, selectedIds);
      onSelectionChange([]);
    } finally {
      setExecuting(false);
      setConfirmAction(null);
    }
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-primary/5 border rounded-lg animate-in slide-in-from-top-2">
        <Checkbox
          checked={isAllSelected}
          ref={(ref) => {
            if (ref) {
              (ref as any).indeterminate = isPartiallySelected;
            }
          }}
          onCheckedChange={handleSelectAll}
        />
        
        <span className="text-sm font-medium">
          {t('bulk.selected', '{{count}} selected', { count: selectedIds.length })}
        </span>

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading || executing}>
              {t('bulk.actions', 'Actions')}
              <ChevronDown className="h-4 w-4 ms-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {actions.map((action, index) => (
              <div key={action.id}>
                {index > 0 && action.variant === 'destructive' && (
                  <DropdownMenuSeparator />
                )}
                <DropdownMenuItem
                  onClick={() => handleAction(action)}
                  className={action.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''}
                >
                  <action.icon className="h-4 w-4 me-2" />
                  {t(`bulk.${action.id}`, action.label)}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" onClick={() => onSelectionChange([])}>
          {t('bulk.clearSelection', 'Clear')}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmTitle || t('bulk.confirmTitle', 'Confirm Action')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription || 
                t('bulk.confirmDescription', 'Are you sure you want to {{action}} {{count}} items? This action cannot be undone.', {
                  action: confirmAction?.label.toLowerCase(),
                  count: selectedIds.length
                })
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              className={confirmAction?.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {executing ? t('common.processing') : t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Hook for managing bulk selection state
 */
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const allIds = items.map(item => item.id);
  
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };
  
  const isSelected = (id: string) => selectedIds.includes(id);
  
  const selectedItems = items.filter(item => selectedIds.includes(item.id));
  
  return {
    selectedIds,
    setSelectedIds,
    allIds,
    toggleSelection,
    isSelected,
    selectedItems,
    clearSelection: () => setSelectedIds([]),
  };
}
