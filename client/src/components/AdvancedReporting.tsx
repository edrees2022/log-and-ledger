import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Maximize2,
  Share2,
  Settings,
  Plus,
  X,
  GripVertical,
  Eye,
  EyeOff,
  Layers,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Printer,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  DollarSign,
  Users,
  ShoppingCart,
  Receipt,
  Wallet,
  Building2,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type DateRangePreset = 'today' | 'yesterday' | '7days' | '30days' | '90days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear' | 'custom';
type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'donut';
type MetricType = 'revenue' | 'expenses' | 'profit' | 'invoices' | 'customers' | 'items' | 'transactions' | 'receivables' | 'payables';

interface DateRange {
  from: Date;
  to: Date;
}

interface KPIMetric {
  id: string;
  type: MetricType;
  label: string;
  value: number;
  previousValue?: number;
  format: 'currency' | 'number' | 'percentage';
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

interface ReportWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'comparison';
  title: string;
  metric?: MetricType;
  chartType?: ChartType;
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean;
  order: number;
}

interface AdvancedReportingProps {
  organizationId?: number;
}

// Date range presets
const dateRangePresets: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'reports.dateRange.today' },
  { value: 'yesterday', label: 'reports.dateRange.yesterday' },
  { value: '7days', label: 'reports.dateRange.7days' },
  { value: '30days', label: 'reports.dateRange.30days' },
  { value: '90days', label: 'reports.dateRange.90days' },
  { value: 'thisMonth', label: 'reports.dateRange.thisMonth' },
  { value: 'lastMonth', label: 'reports.dateRange.lastMonth' },
  { value: 'thisYear', label: 'reports.dateRange.thisYear' },
  { value: 'lastYear', label: 'reports.dateRange.lastYear' },
  { value: 'custom', label: 'reports.dateRange.custom' }
];

// Metric icons
const metricIcons: Record<MetricType, React.ElementType> = {
  revenue: DollarSign,
  expenses: Wallet,
  profit: TrendingUp,
  invoices: Receipt,
  customers: Users,
  items: ShoppingCart,
  transactions: Building2,
  receivables: ArrowUpRight,
  payables: ArrowDownRight
};

// Metric colors
const metricColors: Record<MetricType, string> = {
  revenue: 'text-green-500',
  expenses: 'text-red-500',
  profit: 'text-blue-500',
  invoices: 'text-purple-500',
  customers: 'text-orange-500',
  items: 'text-teal-500',
  transactions: 'text-indigo-500',
  receivables: 'text-emerald-500',
  payables: 'text-rose-500'
};

export function AdvancedReporting({ organizationId }: AdvancedReportingProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('30days');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [comparePeriod, setComparePeriod] = useState<'previous' | 'lastYear'>('previous');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['revenue', 'expenses', 'profit', 'invoices']);
  const [activeView, setActiveView] = useState<'dashboard' | 'custom'>('dashboard');
  const [isExporting, setIsExporting] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Widgets configuration
  const [widgets, setWidgets] = useState<ReportWidget[]>([
    { id: '1', type: 'kpi', title: 'KPI Summary', size: 'full', visible: true, order: 1 },
    { id: '2', type: 'chart', title: 'Revenue Trend', chartType: 'line', metric: 'revenue', size: 'large', visible: true, order: 2 },
    { id: '3', type: 'chart', title: 'Expenses by Category', chartType: 'pie', metric: 'expenses', size: 'medium', visible: true, order: 3 },
    { id: '4', type: 'chart', title: 'Cash Flow', chartType: 'bar', size: 'medium', visible: true, order: 4 },
    { id: '5', type: 'table', title: 'Top Customers', size: 'medium', visible: true, order: 5 },
    { id: '6', type: 'comparison', title: 'Period Comparison', size: 'medium', visible: true, order: 6 },
  ]);

  // Calculate date range from preset
  const getDateRangeFromPreset = useCallback((preset: DateRangePreset): DateRange => {
    const today = new Date();
    switch (preset) {
      case 'today':
        return { from: today, to: today };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { from: yesterday, to: yesterday };
      case '7days':
        return { from: subDays(today, 7), to: today };
      case '30days':
        return { from: subDays(today, 30), to: today };
      case '90days':
        return { from: subDays(today, 90), to: today };
      case 'thisMonth':
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      case 'thisYear':
        return { from: startOfYear(today), to: endOfYear(today) };
      case 'lastYear':
        const lastYear = subMonths(today, 12);
        return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
      default:
        return dateRange;
    }
  }, [dateRange]);

  // Handle preset change
  const handlePresetChange = useCallback((preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset !== 'custom') {
      setDateRange(getDateRangeFromPreset(preset));
    }
  }, [getDateRangeFromPreset]);

  // Sample KPI data
  const kpiMetrics: KPIMetric[] = useMemo(() => [
    {
      id: '1',
      type: 'revenue',
      label: t('reports.metrics.revenue'),
      value: 125000,
      previousValue: 112000,
      format: 'currency',
      icon: DollarSign,
      color: 'text-green-500',
      trend: 'up',
      trendValue: 11.6
    },
    {
      id: '2',
      type: 'expenses',
      label: t('reports.metrics.expenses'),
      value: 78000,
      previousValue: 85000,
      format: 'currency',
      icon: Wallet,
      color: 'text-red-500',
      trend: 'down',
      trendValue: -8.2
    },
    {
      id: '3',
      type: 'profit',
      label: t('reports.metrics.profit'),
      value: 47000,
      previousValue: 27000,
      format: 'currency',
      icon: TrendingUp,
      color: 'text-blue-500',
      trend: 'up',
      trendValue: 74.1
    },
    {
      id: '4',
      type: 'invoices',
      label: t('reports.metrics.invoices'),
      value: 156,
      previousValue: 142,
      format: 'number',
      icon: Receipt,
      color: 'text-purple-500',
      trend: 'up',
      trendValue: 9.9
    },
    {
      id: '5',
      type: 'customers',
      label: t('reports.metrics.customers'),
      value: 48,
      previousValue: 45,
      format: 'number',
      icon: Users,
      color: 'text-orange-500',
      trend: 'up',
      trendValue: 6.7
    },
    {
      id: '6',
      type: 'receivables',
      label: t('reports.metrics.receivables'),
      value: 32000,
      format: 'currency',
      icon: ArrowUpRight,
      color: 'text-emerald-500'
    },
    {
      id: '7',
      type: 'payables',
      label: t('reports.metrics.payables'),
      value: 18500,
      format: 'currency',
      icon: ArrowDownRight,
      color: 'text-rose-500'
    }
  ], [t]);

  // Sample chart data
  const revenueChartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      { label: t('reports.metrics.revenue'), data: [45000, 52000, 48000, 61000, 55000, 67000, 72000, 69000, 81000, 95000, 102000, 125000], color: '#22c55e' },
      { label: t('reports.metrics.expenses'), data: [32000, 35000, 41000, 38000, 42000, 45000, 48000, 51000, 55000, 62000, 70000, 78000], color: '#ef4444' }
    ]
  };

  // Top customers data
  const topCustomers = [
    { name: 'Acme Corporation', revenue: 25000, invoices: 12, growth: 15 },
    { name: 'Global Industries', revenue: 18500, invoices: 8, growth: 22 },
    { name: 'Tech Solutions Ltd', revenue: 15000, invoices: 6, growth: -5 },
    { name: 'Prime Services', revenue: 12000, invoices: 10, growth: 8 },
    { name: 'Delta Partners', revenue: 9500, invoices: 5, growth: 12 }
  ];

  // Export report
  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv' | 'image') => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: t('reports.exportSuccess'),
        description: t('reports.exportedAs', { format: format.toUpperCase() })
      });
    } catch (error) {
      toast({
        title: t('reports.exportError'),
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  }, [t, toast]);

  // Toggle widget visibility
  const toggleWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  }, []);

  // Format value based on type
  const formatValue = useCallback((value: number, format: 'currency' | 'number' | 'percentage'): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat(i18n.language).format(value);
    }
  }, [i18n.language]);

  // Render KPI card
  const renderKPICard = (metric: KPIMetric) => {
    const Icon = metric.icon;
    return (
      <Card key={metric.id} className="relative overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-2xl font-bold mt-1">
                {formatValue(metric.value, metric.format)}
              </p>
              {metric.trend && metric.trendValue !== undefined && (
                <div className={cn(
                  "flex items-center gap-1 text-sm mt-2",
                  metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                )}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  <span>{Math.abs(metric.trendValue)}%</span>
                  <span className="text-muted-foreground">
                    {t('reports.vsPrevious')}
                  </span>
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-full bg-muted", metric.color)}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          metric.trend === 'up' ? 'bg-green-500' : metric.trend === 'down' ? 'bg-red-500' : 'bg-muted'
        )} />
      </Card>
    );
  };

  // Render simple bar chart (CSS-based)
  const renderBarChart = (data: ChartData, height: number = 200) => {
    const maxValue = Math.max(...data.datasets.flatMap(d => d.data));
    
    return (
      <div className="space-y-4">
        <div className="flex items-end gap-2 h-48">
          {data.labels.map((label, idx) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: `${height}px` }}>
                {data.datasets.map((dataset, dIdx) => (
                  <TooltipProvider key={dIdx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="flex-1 rounded-t transition-all hover:opacity-80 cursor-pointer"
                          style={{
                            height: `${(dataset.data[idx] / maxValue) * 100}%`,
                            backgroundColor: dataset.color,
                            minHeight: '4px'
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{dataset.label}: {formatValue(dataset.data[idx], 'currency')}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6">
          {data.datasets.map((dataset, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-sm">{dataset.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render pie chart (CSS-based)
  const renderPieChart = () => {
    const expenses = [
      { label: t('reports.categories.salaries'), value: 35000, color: '#3b82f6' },
      { label: t('reports.categories.rent'), value: 15000, color: '#22c55e' },
      { label: t('reports.categories.utilities'), value: 8000, color: '#f59e0b' },
      { label: t('reports.categories.supplies'), value: 12000, color: '#ef4444' },
      { label: t('reports.categories.other'), value: 8000, color: '#8b5cf6' }
    ];
    
    const total = expenses.reduce((sum, e) => sum + e.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="flex items-center gap-8">
        <div 
          className="relative w-48 h-48 rounded-full"
          style={{
            background: `conic-gradient(${expenses.map(e => {
              const start = currentAngle;
              const angle = (e.value / total) * 360;
              currentAngle += angle;
              return `${e.color} ${start}deg ${currentAngle}deg`;
            }).join(', ')})`
          }}
        >
          <div className="absolute inset-8 bg-background rounded-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatValue(total, 'currency')}</p>
              <p className="text-xs text-muted-foreground">{t('reports.total')}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {expenses.map((expense, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: expense.color }}
              />
              <span className="text-sm flex-1">{expense.label}</span>
              <span className="text-sm font-medium">{formatValue(expense.value, 'currency')}</span>
              <span className="text-xs text-muted-foreground">
                ({((expense.value / total) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('reports.title')}</h2>
          <p className="text-muted-foreground">{t('reports.description')}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting}>
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <Download className="h-4 w-4 me-2" />
                )}
                {t('reports.export')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('reports.exportAs')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 me-2" />
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 me-2" />
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="h-4 w-4 me-2" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('image')}>
                <ImageIcon className="h-4 w-4 me-2" />
                {t('reports.image')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" onClick={() => setCustomizeOpen(true)}>
            <Settings className="h-4 w-4 me-2" />
            {t('reports.customize')}
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-48">
              <Label className="text-sm text-muted-foreground mb-2 block">
                {t('reports.dateRange.label')}
              </Label>
              <Select value={dateRangePreset} onValueChange={(v) => handlePresetChange(v as DateRangePreset)}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 me-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateRangePresets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {t(preset.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dateRangePreset === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={format(dateRange.from, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                  className="w-36"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={format(dateRange.to, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                  className="w-36"
                />
              </div>
            )}

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-2">
              <Switch
                id="compare"
                checked={compareEnabled}
                onCheckedChange={setCompareEnabled}
              />
              <Label htmlFor="compare" className="cursor-pointer">
                {t('reports.compare')}
              </Label>
            </div>

            {compareEnabled && (
              <Select value={comparePeriod} onValueChange={(v) => setComparePeriod(v as 'previous' | 'lastYear')}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">{t('reports.previousPeriod')}</SelectItem>
                  <SelectItem value="lastYear">{t('reports.lastYear')}</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-1 ms-auto">
              <span className="text-sm text-muted-foreground">
                {format(dateRange.from, 'PP', { locale: dateLocale })} - {format(dateRange.to, 'PP', { locale: dateLocale })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Summary */}
      {widgets.find(w => w.id === '1')?.visible && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {kpiMetrics.filter(m => selectedMetrics.includes(m.type) || selectedMetrics.length === 0).slice(0, 7).map(renderKPICard)}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Trend */}
        {widgets.find(w => w.id === '2')?.visible && (
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>{t('reports.charts.revenueTrend')}</CardTitle>
                <CardDescription>{t('reports.charts.revenueTrendDesc')}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem checked>
                    {t('reports.metrics.revenue')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked>
                    {t('reports.metrics.expenses')}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {renderBarChart(revenueChartData)}
            </CardContent>
          </Card>
        )}

        {/* Expenses by Category */}
        {widgets.find(w => w.id === '3')?.visible && (
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.charts.expensesByCategory')}</CardTitle>
              <CardDescription>{t('reports.charts.expensesByCategoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderPieChart()}
            </CardContent>
          </Card>
        )}

        {/* Cash Flow */}
        {widgets.find(w => w.id === '4')?.visible && (
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.charts.cashFlow')}</CardTitle>
              <CardDescription>{t('reports.charts.cashFlowDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('reports.cashFlow.inflow')}</p>
                      <p className="text-2xl font-bold text-green-600">{formatValue(125000, 'currency')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ArrowDownRight className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('reports.cashFlow.outflow')}</p>
                      <p className="text-2xl font-bold text-red-600">{formatValue(78000, 'currency')}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">{t('reports.cashFlow.net')}</p>
                      <p className="text-2xl font-bold text-blue-600">{formatValue(47000, 'currency')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Customers */}
        {widgets.find(w => w.id === '5')?.visible && (
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.tables.topCustomers')}</CardTitle>
              <CardDescription>{t('reports.tables.topCustomersDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('reports.tables.customer')}</TableHead>
                    <TableHead className="text-end">{t('reports.tables.revenue')}</TableHead>
                    <TableHead className="text-end">{t('reports.tables.growth')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {idx + 1}
                          </div>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-end font-medium">
                        {formatValue(customer.revenue, 'currency')}
                      </TableCell>
                      <TableCell className="text-end">
                        <Badge variant={customer.growth >= 0 ? 'default' : 'destructive'} className="gap-1">
                          {customer.growth >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {customer.growth}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Period Comparison */}
        {widgets.find(w => w.id === '6')?.visible && compareEnabled && (
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.comparison.title')}</CardTitle>
              <CardDescription>{t('reports.comparison.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: t('reports.metrics.revenue'), current: 125000, previous: 112000 },
                  { label: t('reports.metrics.expenses'), current: 78000, previous: 85000 },
                  { label: t('reports.metrics.profit'), current: 47000, previous: 27000 },
                  { label: t('reports.metrics.invoices'), current: 156, previous: 142, format: 'number' as const }
                ].map((item, idx) => {
                  const change = ((item.current - item.previous) / item.previous) * 100;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{item.label}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-end">
                          <p className="font-bold">{formatValue(item.current, item.format || 'currency')}</p>
                          <p className="text-xs text-muted-foreground">
                            vs {formatValue(item.previous, item.format || 'currency')}
                          </p>
                        </div>
                        <Badge variant={change >= 0 ? 'default' : 'destructive'} className="w-20 justify-center">
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {t('reports.insights.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">
                  {t('reports.insights.revenueUp')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('reports.insights.revenueUpDesc')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  {t('reports.insights.overdueInvoices')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('reports.insights.overdueInvoicesDesc')}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-400">
                  {t('reports.insights.cashFlowPositive')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('reports.insights.cashFlowPositiveDesc')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customize Dialog */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reports.customize')}</DialogTitle>
            <DialogDescription>{t('reports.customizeDescription')}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Label>{t('reports.visibleWidgets')}</Label>
            <div className="space-y-2">
              {widgets.map(widget => (
                <div key={widget.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>{widget.title}</span>
                  <Switch
                    checked={widget.visible}
                    onCheckedChange={() => toggleWidget(widget.id)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomizeOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdvancedReporting;
