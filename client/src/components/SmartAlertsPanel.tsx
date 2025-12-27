/**
 * Smart Alerts Panel Component
 * Displays intelligent business alerts
 */
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useSmartAlerts, type SmartAlert } from '@/hooks/useSmartAlerts';
import { Bell, ChevronRight, AlertTriangle } from 'lucide-react';

interface SmartAlertsPanelProps {
  maxAlerts?: number;
  className?: string;
}

const alertTypeStyles = {
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
};

function AlertItem({ alert }: { alert: SmartAlert }) {
  const { t } = useTranslation();
  const styles = alertTypeStyles[alert.type];
  const Icon = alert.icon;

  return (
    <div className={`p-3 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${styles.icon}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{alert.title}</span>
            <Badge variant="outline" className={`text-xs ${styles.badge}`}>
              {t(`alerts.types.${alert.type}`, alert.type)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {alert.description}
          </p>
          {alert.action && (
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className="h-auto p-0 mt-2 text-xs text-primary hover:text-primary/80"
            >
              <Link href={alert.action.href}>
                {alert.action.label}
                <ChevronRight className="h-3 w-3 ms-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SmartAlertsPanel({ maxAlerts = 5, className }: SmartAlertsPanelProps) {
  const { t } = useTranslation();
  const { alerts, isLoading, hasAlerts, criticalCount, warningCount } = useSmartAlerts();

  const displayedAlerts = alerts.slice(0, maxAlerts);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">{t('alerts.title', 'Smart Alerts')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle className="text-lg">{t('alerts.title', 'Smart Alerts')}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} {t('alerts.critical', 'Critical')}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800">
                {warningCount} {t('alerts.warnings', 'Warnings')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasAlerts ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20 mb-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-green-600">
              {t('alerts.allClear', 'All Clear!')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('alerts.noActiveAlerts', 'No active alerts at this time')}
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {displayedAlerts.map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
            {alerts.length > maxAlerts && (
              <div className="mt-4 pt-4 border-t text-center">
                <Button variant="ghost" size="sm">
                  {t('alerts.viewAll', 'View all {{count}} alerts', { count: alerts.length })}
                </Button>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
