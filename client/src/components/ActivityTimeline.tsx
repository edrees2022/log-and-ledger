/**
 * Activity Timeline Component
 * Shows recent activities and changes in real-time
 */
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Receipt,
  CreditCard,
  User,
  Package,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Plus,
  Trash,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'invoice' | 'bill' | 'payment' | 'receipt' | 'contact' | 'item' | 'journal' | 'settings';
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'send';
  title: string;
  description?: string;
  user?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  limit?: number;
  className?: string;
}

const typeIcons: Record<string, React.ElementType> = {
  invoice: FileText,
  bill: Receipt,
  payment: CreditCard,
  receipt: CreditCard,
  contact: User,
  item: Package,
  journal: FileText,
  settings: Settings,
};

const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Edit,
  delete: Trash,
  approve: CheckCircle,
  reject: XCircle,
  send: AlertCircle,
};

const actionColors: Record<string, string> = {
  create: 'text-green-600',
  update: 'text-blue-600',
  delete: 'text-red-600',
  approve: 'text-green-600',
  reject: 'text-red-600',
  send: 'text-blue-600',
};

export function ActivityTimeline({ limit = 10, className }: ActivityTimelineProps) {
  const { t, i18n } = useTranslation();
  
  const { data: activities = [], isLoading } = useQuery<ActivityItem[]>({
    queryKey: ['/api/activities', { limit }],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const locale = i18n.language === 'ar' ? ar : enUS;

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale });
    } catch {
      return timestamp;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('activity.title', 'Recent Activity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('activity.title', 'Recent Activity')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pe-4">
          {activities.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('activity.noActivity', 'No recent activity')}
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute start-4 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-6">
                {activities.map((activity) => {
                  const TypeIcon = typeIcons[activity.type] || FileText;
                  const ActionIcon = actionIcons[activity.action] || Edit;
                  const actionColor = actionColors[activity.action] || 'text-muted-foreground';
                  
                  return (
                    <div key={activity.id} className="relative flex items-start gap-4 ps-10">
                      {/* Timeline dot */}
                      <div className="absolute start-0 p-2 rounded-full bg-background border-2 border-border">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ActionIcon className={`h-4 w-4 ${actionColor}`} />
                          <span className="font-medium truncate">{activity.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {t(`activity.actions.${activity.action}`, activity.action)}
                          </Badge>
                        </div>
                        
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          {activity.user && (
                            <>
                              <User className="h-3 w-3" />
                              <span>{activity.user}</span>
                              <span>·</span>
                            </>
                          )}
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
