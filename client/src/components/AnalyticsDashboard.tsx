/**
 * Analytics Dashboard Components
 * Enterprise analytics widgets with charts and KPIs
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Maximize2,
} from 'lucide-react';

// Types
export interface MetricData {
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  secondaryValue?: number;
}

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  format?: 'currency' | 'number' | 'percent';
  currency?: string;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  change,
  changePercent,
  trend = 'neutral',
  icon,
  description,
  format = 'number',
  currency = 'SAR',
  onClick,
}: KPICardProps) {
  const { t, i18n } = useTranslation();

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(i18n.language, {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat(i18n.language).format(val);
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <Card
      className={cn("cursor-pointer hover:shadow-md transition-shadow", onClick && "cursor-pointer")}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{formatValue(value)}</p>
            {(change !== undefined || changePercent !== undefined) && (
              <div className="flex items-center gap-1">
                <TrendIcon className={cn("h-4 w-4", trendColor)} />
                <span className={cn("text-sm font-medium", trendColor)}>
                  {changePercent !== undefined ? `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%` : ''}
                </span>
                {description && (
                  <span className="text-sm text-muted-foreground">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Mini Sparkline Component
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ data, width = 100, height = 30, color = 'currentColor' }: SparklineProps) {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');
  }, [data, width, height]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Comparison Card
interface ComparisonCardProps {
  title: string;
  current: number;
  previous: number;
  format?: 'currency' | 'number' | 'percent';
  currency?: string;
}

export function ComparisonCard({
  title,
  current,
  previous,
  format = 'number',
  currency = 'SAR',
}: ComparisonCardProps) {
  const { t, i18n } = useTranslation();
  const change = ((current - previous) / previous) * 100;
  const isPositive = change > 0;

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(i18n.language, {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat(i18n.language).format(val);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold">{formatValue(current)}</span>
            <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(change).toFixed(1)}%
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('analytics.previousPeriod', 'Previous period')}</span>
            <span>{formatValue(previous)}</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all",
                isPositive ? "bg-green-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min((current / Math.max(current, previous)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Donut Chart Component
interface DonutChartProps {
  data: ChartDataPoint[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  title?: string;
}

export function DonutChart({
  data,
  size = 200,
  strokeWidth = 30,
  showLegend = true,
  title,
}: DonutChartProps) {
  const { i18n } = useTranslation();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  ];

  let accumulatedPercent = 0;

  const segments = data.map((item, index) => {
    const percent = total > 0 ? (item.value / total) * 100 : 0;
    const offset = circumference * (accumulatedPercent / 100);
    const dash = circumference * (percent / 100);
    accumulatedPercent += percent;

    return {
      ...item,
      percent,
      offset,
      dash,
      color: item.color || colors[index % colors.length],
    };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.dash} ${circumference}`}
              strokeDashoffset={-segment.offset}
              className="transition-all duration-300"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {title && <span className="text-sm text-muted-foreground">{title}</span>}
          <span className="text-2xl font-bold">
            {new Intl.NumberFormat(i18n.language).format(total)}
          </span>
        </div>
      </div>

      {showLegend && (
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm">{segment.label}</span>
              <span className="text-sm text-muted-foreground">
                ({segment.percent.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Progress Ring Component
interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label,
  showValue = true,
  color = '#3b82f6',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min((value / max) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className="text-xl font-bold">{percent.toFixed(0)}%</span>
        )}
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  );
}

// Stat Grid Component
interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
}

interface StatGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatGrid({ stats, columns = 4 }: StatGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-2 md:grid-cols-4"
    )}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
              {stat.icon && (
                <div className="text-muted-foreground">{stat.icon}</div>
              )}
            </div>
            {stat.change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-1 text-xs",
                stat.trend === 'up' && "text-green-500",
                stat.trend === 'down' && "text-red-500",
                stat.trend === 'neutral' && "text-muted-foreground"
              )}>
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Analytics Dashboard Header
interface DashboardHeaderProps {
  title: string;
  description?: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

export function DashboardHeader({
  title,
  description,
  period = '7d',
  onPeriodChange,
  onRefresh,
  onExport,
  isLoading,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  const periods = [
    { value: '1d', label: t('analytics.today', 'Today') },
    { value: '7d', label: t('analytics.7days', '7 Days') },
    { value: '30d', label: t('analytics.30days', '30 Days') },
    { value: '90d', label: t('analytics.90days', '90 Days') },
    { value: '1y', label: t('analytics.1year', '1 Year') },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onPeriodChange && (
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {onRefresh && (
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        )}
        {onExport && (
          <Button variant="outline" size="icon" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
