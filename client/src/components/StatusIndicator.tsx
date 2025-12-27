/**
 * Status Indicator Components
 * Visual status badges and indicators
 */
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Circle,
  Loader2,
  Ban,
  Send,
  Eye,
  RefreshCw,
} from 'lucide-react';

// Basic Status Dot
interface StatusDotProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'pending';
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusDot({ status, pulse = false, size = 'md', className }: StatusDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-400',
    pending: 'bg-orange-500',
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full",
        sizeClasses[size],
        colorClasses[status],
        pulse && "animate-pulse",
        className
      )}
    />
  );
}

// Status Badge with Icon
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

const statusConfig: Record<string, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  label: string;
}> = {
  // Invoice/Bill statuses
  draft: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: <Circle className="w-3 h-3" />,
    label: 'Draft',
  },
  pending: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    icon: <Clock className="w-3 h-3" />,
    label: 'Pending',
  },
  sent: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: <Send className="w-3 h-3" />,
    label: 'Sent',
  },
  viewed: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
    icon: <Eye className="w-3 h-3" />,
    label: 'Viewed',
  },
  paid: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Paid',
  },
  partial: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: <RefreshCw className="w-3 h-3" />,
    label: 'Partial',
  },
  overdue: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: <AlertTriangle className="w-3 h-3" />,
    label: 'Overdue',
  },
  cancelled: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: <XCircle className="w-3 h-3" />,
    label: 'Cancelled',
  },
  void: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: <Ban className="w-3 h-3" />,
    label: 'Void',
  },
  // Generic statuses
  active: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Active',
  },
  inactive: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: <Circle className="w-3 h-3" />,
    label: 'Inactive',
  },
  processing: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    label: 'Processing',
  },
  completed: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    icon: <CheckCircle className="w-3 h-3" />,
    label: 'Completed',
  },
  failed: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: <XCircle className="w-3 h-3" />,
    label: 'Failed',
  },
};

export function StatusBadge({
  status,
  variant = 'default',
  size = 'md',
  icon,
  className,
}: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status.toLowerCase()] || {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: <Circle className="w-3 h-3" />,
    label: status,
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  const variantClasses = {
    default: cn(config.bgColor, config.color),
    outline: cn('bg-transparent border', config.borderColor, config.color),
    ghost: config.color,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {icon || config.icon}
      <span>{t(`status.${status.toLowerCase()}`, config.label)}</span>
    </span>
  );
}

// Connection Status
interface ConnectionStatusProps {
  connected: boolean;
  label?: string;
  className?: string;
}

export function ConnectionStatus({ connected, label, className }: ConnectionStatusProps) {
  const { t } = useTranslation();
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StatusDot 
        status={connected ? 'success' : 'error'} 
        pulse={!connected}
      />
      <span className="text-sm text-muted-foreground">
        {label || (connected 
          ? t('status.connected', 'Connected') 
          : t('status.disconnected', 'Disconnected')
        )}
      </span>
    </div>
  );
}

// Step Status
interface StepStatusProps {
  current: number;
  total: number;
  labels?: string[];
  className?: string;
}

export function StepStatus({ current, total, labels, className }: StepStatusProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }).map((_, index) => {
        const isComplete = index < current;
        const isCurrent = index === current;
        
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                isComplete && "bg-primary text-primary-foreground",
                isCurrent && "bg-primary/20 text-primary border-2 border-primary",
                !isComplete && !isCurrent && "bg-muted text-muted-foreground"
              )}
            >
              {isComplete ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {labels && labels[index] && (
              <span className={cn(
                "text-sm hidden sm:inline",
                isCurrent && "font-medium",
                !isComplete && !isCurrent && "text-muted-foreground"
              )}>
                {labels[index]}
              </span>
            )}
            {index < total - 1 && (
              <div className={cn(
                "w-8 h-0.5",
                isComplete ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Payment Status Badge
interface PaymentStatusBadgeProps {
  amount: number;
  paid: number;
  currency?: string;
  className?: string;
}

export function PaymentStatusBadge({
  amount,
  paid,
  currency = 'SAR',
  className,
}: PaymentStatusBadgeProps) {
  const { t, i18n } = useTranslation();
  const remaining = amount - paid;
  const percentage = (paid / amount) * 100;
  
  let status: 'success' | 'warning' | 'error' | 'neutral';
  let label: string;
  
  if (paid >= amount) {
    status = 'success';
    label = t('payment.paid', 'Paid');
  } else if (paid > 0) {
    status = 'warning';
    label = t('payment.partial', 'Partial');
  } else {
    status = 'neutral';
    label = t('payment.unpaid', 'Unpaid');
  }

  const formatAmount = (value: number) => 
    new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
    }).format(value);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <StatusBadge status={status === 'success' ? 'paid' : status === 'warning' ? 'partial' : 'pending'} size="sm" />
        <span className="text-muted-foreground">
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            status === 'success' && "bg-green-500",
            status === 'warning' && "bg-yellow-500",
            status === 'neutral' && "bg-gray-300"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {paid < amount && (
        <p className="text-xs text-muted-foreground">
          {t('payment.remaining', 'Remaining')}: {formatAmount(remaining)}
        </p>
      )}
    </div>
  );
}
