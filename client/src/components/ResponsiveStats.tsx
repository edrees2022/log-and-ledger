/**
 * Responsive Stats Cards Component
 * Optimized statistics display for all screen sizes
 */
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

interface ResponsiveStatsProps {
  stats: StatItem[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4;
  compact?: boolean;
  className?: string;
}

const colorClasses = {
  default: 'text-foreground',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
};

const bgColorClasses = {
  default: 'bg-muted',
  success: 'bg-green-100 dark:bg-green-900/30',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30',
  danger: 'bg-red-100 dark:bg-red-900/30',
};

export function ResponsiveStats({
  stats,
  isLoading = false,
  columns = 4,
  compact = false,
  className,
}: ResponsiveStatsProps) {
  const { t } = useTranslation();

  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  if (isLoading) {
    return (
      <div className={cn(`grid gap-3 md:gap-4 ${gridClasses[columns]}`, className)}>
        {Array.from({ length: columns }).map((_, i) => (
          <Card key={i}>
            <CardContent className={cn('p-4', compact && 'p-3')}>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-8 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(`grid gap-3 md:gap-4 ${gridClasses[columns]}`, className)}>
      {stats.map(stat => (
        <Card key={stat.id} className="overflow-hidden">
          <CardContent className={cn('p-4', compact && 'p-3')}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className={cn(
                  'text-xs md:text-sm font-medium text-muted-foreground truncate',
                  compact && 'text-xs'
                )}>
                  {stat.label}
                </p>
                <p className={cn(
                  'text-lg md:text-2xl font-bold mt-1 truncate',
                  colorClasses[stat.color || 'default'],
                  compact && 'text-base md:text-xl'
                )}>
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {stat.description}
                  </p>
                )}
              </div>
              {stat.icon && (
                <div className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  bgColorClasses[stat.color || 'default']
                )}>
                  {stat.icon}
                </div>
              )}
            </div>

            {stat.trend && (
              <div className="flex items-center gap-1 mt-2">
                {stat.trend.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span className={cn(
                  'text-xs font-medium',
                  stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.trend.value}%
                </span>
                {stat.trend.label && (
                  <span className="text-xs text-muted-foreground">
                    {stat.trend.label}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Horizontal scrollable stats for mobile
 */
interface HorizontalStatsProps {
  stats: StatItem[];
  isLoading?: boolean;
  className?: string;
}

export function HorizontalStats({
  stats,
  isLoading = false,
  className,
}: HorizontalStatsProps) {
  if (isLoading) {
    return (
      <div className={cn('flex gap-3 overflow-x-auto pb-2 -mx-3 px-3', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="flex-shrink-0 w-36">
            <CardContent className="p-3">
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-6 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide', className)}>
      {stats.map(stat => (
        <Card key={stat.id} className="flex-shrink-0 min-w-[140px]">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground truncate">
              {stat.label}
            </p>
            <p className={cn(
              'text-lg font-bold mt-1 truncate',
              colorClasses[stat.color || 'default']
            )}>
              {stat.value}
            </p>
            {stat.trend && (
              <div className="flex items-center gap-1 mt-1">
                {stat.trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={cn(
                  'text-xs',
                  stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.trend.value}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Mini stat badge for inline use
 */
interface MiniStatProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MiniStat({
  label,
  value,
  trend,
  className,
}: MiniStatProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">{value}</span>
      {trend && (
        <>
          {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
          {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
          {trend === 'neutral' && <Minus className="h-3 w-3 text-muted-foreground" />}
        </>
      )}
    </div>
  );
}
