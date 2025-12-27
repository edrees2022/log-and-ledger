/**
 * Timeline Component
 * Visual timeline for tracking events and history
 */
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Check,
  Circle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  status?: 'completed' | 'current' | 'pending' | 'error';
  icon?: ReactNode;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, string>;
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  showConnector?: boolean;
  className?: string;
}

export function Timeline({
  items,
  orientation = 'vertical',
  showConnector = true,
  className,
}: TimelineProps) {
  const { t, i18n } = useTranslation();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(i18n.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusIcon = (status?: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'current':
        return <Circle className="h-4 w-4 fill-current" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status?: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'current':
        return 'bg-primary text-primary-foreground';
      case 'error':
        return 'bg-red-500 text-white';
      case 'pending':
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (orientation === 'horizontal') {
    return (
      <div className={cn("flex items-start overflow-x-auto pb-4", className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex-shrink-0 flex items-start">
            {/* Item */}
            <div className="flex flex-col items-center w-40">
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  getStatusColor(item.status)
                )}
              >
                {item.icon || getStatusIcon(item.status)}
              </div>
              
              {/* Content */}
              <div className="mt-3 text-center">
                <p className="font-medium text-sm">{item.title}</p>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(item.timestamp)}
                </p>
              </div>
            </div>

            {/* Connector */}
            {showConnector && index < items.length - 1 && (
              <div className={cn(
                "flex-shrink-0 w-8 h-0.5 mt-5",
                item.status === 'completed' ? 'bg-green-500' : 'bg-muted'
              )} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Timeline connector */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                getStatusColor(item.status)
              )}
            >
              {item.icon || getStatusIcon(item.status)}
            </div>
            {showConnector && index < items.length - 1 && (
              <div className={cn(
                "w-0.5 flex-1 min-h-[40px]",
                item.status === 'completed' ? 'bg-green-500' : 'bg-muted'
              )} />
            )}
          </div>

          {/* Content */}
          <div className="pb-8 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatDate(item.timestamp)}
              </span>
            </div>

            {/* User info */}
            {item.user && (
              <div className="flex items-center gap-2 mt-2">
                {item.user.avatar ? (
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                    {item.user.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm text-muted-foreground">{item.user.name}</span>
              </div>
            )}

            {/* Metadata */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {Object.entries(item.metadata).map(([key, value]) => (
                  <span key={key} className="text-xs text-muted-foreground">
                    <span className="font-medium">{key}:</span> {value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Simple Activity Log Component
 */
interface ActivityLogItem {
  id: string;
  action: string;
  target?: string;
  user: string;
  timestamp: Date;
  type?: 'create' | 'update' | 'delete' | 'view' | 'other';
}

interface ActivityLogProps {
  items: ActivityLogItem[];
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

export function ActivityLog({
  items,
  maxItems = 10,
  showLoadMore = true,
  onLoadMore,
}: ActivityLogProps) {
  const { t, i18n } = useTranslation();

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('time.justNow', 'Just now');
    if (minutes < 60) return t('time.minutesAgo', '{{minutes}}m ago', { minutes });
    if (hours < 24) return t('time.hoursAgo', '{{hours}}h ago', { hours });
    if (days < 7) return t('time.daysAgo', '{{days}}d ago', { days });
    
    return new Intl.DateTimeFormat(i18n.language, {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getTypeColor = (type?: ActivityLogItem['type']) => {
    switch (type) {
      case 'create':
        return 'text-green-500';
      case 'update':
        return 'text-blue-500';
      case 'delete':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const displayItems = items.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayItems.map((item) => (
        <div key={item.id} className="flex items-start gap-3 text-sm">
          <div className={cn(
            "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
            item.type === 'create' && "bg-green-500",
            item.type === 'update' && "bg-blue-500",
            item.type === 'delete' && "bg-red-500",
            item.type === 'view' && "bg-gray-400",
            !item.type && "bg-gray-400"
          )} />
          <div className="flex-1 min-w-0">
            <p>
              <span className="font-medium">{item.user}</span>
              {' '}
              <span className={getTypeColor(item.type)}>{item.action}</span>
              {item.target && (
                <>
                  {' '}
                  <span className="font-medium">{item.target}</span>
                </>
              )}
            </p>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>
      ))}

      {showLoadMore && items.length > maxItems && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="text-sm text-primary hover:underline"
        >
          {t('activity.loadMore', 'Load more')}
        </button>
      )}
    </div>
  );
}
