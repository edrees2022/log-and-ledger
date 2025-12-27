/**
 * Confirmation Dialog Hook
 * Reusable confirmation dialog with promise-based API
 */
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
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
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Trash2, Info, HelpCircle } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'info';
  icon?: React.ElementType;
}

interface ConfirmationContextValue {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
  confirmDelete: (itemName?: string) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

const variantConfig = {
  default: {
    icon: HelpCircle,
    iconClass: 'text-primary',
    buttonClass: '',
  },
  destructive: {
    icon: Trash2,
    iconClass: 'text-destructive',
    buttonClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    buttonClass: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    buttonClass: 'bg-blue-500 text-white hover:bg-blue-600',
  },
};

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      setResolveRef(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const confirmDelete = useCallback((itemName?: string) => {
    return confirm({
      title: t('confirm.deleteTitle', 'Delete {{item}}?', { item: itemName || t('common.item', 'item') }),
      description: t('confirm.deleteDescription', 'This action cannot be undone. This will permanently delete this {{item}}.', { item: itemName || t('common.item', 'item') }),
      confirmLabel: t('common.delete'),
      variant: 'destructive',
    });
  }, [confirm, t]);

  const handleConfirm = useCallback(() => {
    resolveRef?.(true);
    setIsOpen(false);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    resolveRef?.(false);
    setIsOpen(false);
  }, [resolveRef]);

  const variant = options.variant || 'default';
  const config = variantConfig[variant];
  const Icon = options.icon || config.icon;

  return (
    <ConfirmationContext.Provider value={{ confirm, confirmDelete }}>
      {children}
      
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-muted ${config.iconClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              {options.title || t('confirm.title', 'Are you sure?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {options.description || t('confirm.description', 'Please confirm this action.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {options.cancelLabel || t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className={config.buttonClass}>
              {options.confirmLabel || t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }
  return context;
}
