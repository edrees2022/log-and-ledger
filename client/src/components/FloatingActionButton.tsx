/**
 * Floating Action Button Component
 * Material Design style FAB for mobile quick actions
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Plus,
  X,
  FileText,
  Users,
  Package,
  Receipt,
  CreditCard,
} from 'lucide-react';

export interface FABAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  className?: string;
}

export function FloatingActionButton({
  actions,
  className,
}: FloatingActionButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const defaultActions: FABAction[] = [
    {
      id: 'new-invoice',
      label: t('sales.newInvoice'),
      icon: <Receipt className="h-5 w-5" />,
      onClick: () => {
        window.location.href = '/sales/invoices/new';
      },
    },
    {
      id: 'new-contact',
      label: t('contacts.addContact'),
      icon: <Users className="h-5 w-5" />,
      onClick: () => {
        window.location.href = '/contacts/new';
      },
    },
    {
      id: 'new-item',
      label: t('inventory.addItem'),
      icon: <Package className="h-5 w-5" />,
      onClick: () => {
        window.location.href = '/inventory/new';
      },
    },
    {
      id: 'new-payment',
      label: t('banking.recordPayment'),
      icon: <CreditCard className="h-5 w-5" />,
      onClick: () => {
        window.location.href = '/banking/payments/new';
      },
    },
  ];

  const fabActions = actions || defaultActions;

  const handleActionClick = (action: FABAction) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className={cn('fixed bottom-20 end-4 z-50 md:hidden', className)}>
      {/* Action Buttons */}
      <div
        className={cn(
          'absolute bottom-16 end-0 flex flex-col-reverse gap-3 transition-all duration-200',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {fabActions.map((action, index) => (
          <div
            key={action.id}
            className={cn(
              'flex items-center gap-3 transition-all duration-200',
              isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
            }}
          >
            <span className="bg-popover text-popover-foreground text-sm px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              {action.label}
            </span>
            <Button
              size="icon"
              className={cn(
                'h-12 w-12 rounded-full shadow-lg',
                action.color || 'bg-primary hover:bg-primary/90'
              )}
              onClick={() => handleActionClick(action)}
            >
              {action.icon}
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <Button
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full shadow-lg transition-transform duration-200',
          isOpen && 'rotate-45'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Simple single-action FAB
 */
interface SimpleFABProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  className?: string;
}

export function SimpleFAB({
  icon,
  onClick,
  label,
  className,
}: SimpleFABProps) {
  return (
    <Button
      size="icon"
      className={cn(
        'fixed bottom-20 end-4 z-50 h-14 w-14 rounded-full shadow-lg md:hidden',
        className
      )}
      onClick={onClick}
      title={label}
    >
      {icon}
    </Button>
  );
}
