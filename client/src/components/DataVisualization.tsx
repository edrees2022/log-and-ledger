import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Share2,
  Copy,
  Image,
  FileText,
  Table as TableIcon,
  Grid,
  LayoutGrid,
  Sparkles,
  Zap,
  Target,
  DollarSign,
  Users,
  Package,
  Receipt,
  Wallet,
  Building2,
  Globe,
  Activity,
  Layers,
  MoreVertical,
  Check,
  Info,
  Clock,
  AlertTriangle,
  CircleDot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'donut' | 'gauge' | 'funnel' | 'radar';
type TimeRange = '7d' | '30d' | '90d' | 'ytd' | '1y' | 'custom';
type ViewMode = 'grid' | 'list' | 'single';

interface DataPoint {
  label: string;
  value: number;
  previousValue?: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

interface ChartConfig {
  id: string;
  title: string;
  titleAr: string;
  type: ChartType;
  data: DataPoint[];
  showLegend?: boolean;
  showLabels?: boolean;
  showTrend?: boolean;
  animate?: boolean;
  stacked?: boolean;
  colors?: string[];
}

interface DataVisualizationProps {
  organizationId?: number;
  onExport?: (format: 'png' | 'svg' | 'pdf' | 'csv') => void;
}

// Color palettes
const colorPalettes = {
  default: ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#f59e0b', '#06b6d4', '#ec4899', '#84cc16'],
  warm: ['#dc2626', '#ea580c', '#f59e0b', '#facc15', '#fef08a'],
  cool: ['#2563eb', '#3b82f6', '#06b6d4', '#14b8a6', '#22c55e'],
  mono: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
  rainbow: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899']
};

// Sample chart configurations
const sampleCharts: ChartConfig[] = [
  {
    id: 'revenue-trend',
    title: 'Revenue Trend',
    titleAr: 'اتجاه الإيرادات',
    type: 'area',
    data: [
      { label: 'Jan', value: 45000, previousValue: 38000 },
      { label: 'Feb', value: 52000, previousValue: 45000 },
      { label: 'Mar', value: 48000, previousValue: 52000 },
      { label: 'Apr', value: 61000, previousValue: 48000 },
      { label: 'May', value: 55000, previousValue: 61000 },
      { label: 'Jun', value: 67000, previousValue: 55000 }
    ],
    showTrend: true,
    animate: true
  },
  {
    id: 'expense-breakdown',
    title: 'Expense Breakdown',
    titleAr: 'توزيع المصروفات',
    type: 'donut',
    data: [
      { label: 'Salaries', value: 45000, color: '#2563eb' },
      { label: 'Rent', value: 15000, color: '#16a34a' },
      { label: 'Utilities', value: 5000, color: '#f59e0b' },
      { label: 'Marketing', value: 12000, color: '#9333ea' },
      { label: 'Other', value: 8000, color: '#64748b' }
    ],
    showLegend: true
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow',
    titleAr: 'التدفق النقدي',
    type: 'bar',
    data: [
      { label: 'Jan', value: 25000, previousValue: -12000 },
      { label: 'Feb', value: 18000, previousValue: -8000 },
      { label: 'Mar', value: -5000, previousValue: 22000 },
      { label: 'Apr', value: 32000, previousValue: -15000 },
      { label: 'May', value: 28000, previousValue: -10000 },
      { label: 'Jun', value: 35000, previousValue: -18000 }
    ],
    stacked: true
  },
  {
    id: 'invoice-status',
    title: 'Invoice Status',
    titleAr: 'حالة الفواتير',
    type: 'pie',
    data: [
      { label: 'Paid', value: 65, color: '#22c55e' },
      { label: 'Pending', value: 25, color: '#f59e0b' },
      { label: 'Overdue', value: 10, color: '#ef4444' }
    ],
    showLabels: true
  },
  {
    id: 'performance-gauge',
    title: 'Collection Rate',
    titleAr: 'معدل التحصيل',
    type: 'gauge',
    data: [
      { label: 'Current', value: 85 }
    ]
  },
  {
    id: 'sales-funnel',
    title: 'Sales Funnel',
    titleAr: 'قمع المبيعات',
    type: 'funnel',
    data: [
      { label: 'Leads', value: 1000 },
      { label: 'Qualified', value: 600 },
      { label: 'Proposals', value: 350 },
      { label: 'Negotiations', value: 150 },
      { label: 'Closed', value: 80 }
    ]
  }
];

export function DataVisualization({ organizationId, onExport }: DataVisualizationProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [charts, setCharts] = useState<ChartConfig[]>(sampleCharts);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [colorPalette, setColorPalette] = useState<keyof typeof colorPalettes>('default');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Current colors
  const colors = useMemo(() => colorPalettes[colorPalette], [colorPalette]);

  // Format currency
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }, [i18n.language]);

  // Format number
  const formatNumber = useCallback((value: number) => {
    return new Intl.NumberFormat(i18n.language).format(value);
  }, [i18n.language]);

  // Calculate trend
  const calculateTrend = useCallback((current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isUp: change > 0
    };
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setIsRefreshing(false);
    toast({ title: t('visualization.refreshed') });
  }, [t, toast]);

  // Export chart
  const exportChart = useCallback((chartId: string, format: 'png' | 'svg' | 'pdf' | 'csv') => {
    onExport?.(format);
    toast({ title: t('visualization.exported', { format: format.toUpperCase() }) });
  }, [onExport, t, toast]);

  // Render Bar Chart
  const BarChart = ({ chart, height = 200 }: { chart: ChartConfig; height?: number }) => {
    const maxValue = Math.max(...chart.data.map(d => Math.abs(d.value)));
    
    return (
      <div className="space-y-3" style={{ height }}>
        <div className="flex items-end gap-2 h-full">
          {chart.data.map((point, idx) => {
            const percentage = (Math.abs(point.value) / maxValue) * 100;
            const isNegative = point.value < 0;
            
            return (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1 flex flex-col items-center h-full justify-end">
                      <div
                        className={cn(
                          "w-full rounded-t transition-all duration-500 hover:opacity-80",
                          isNegative ? "bg-red-500" : ""
                        )}
                        style={{
                          height: `${percentage}%`,
                          minHeight: '8px',
                          backgroundColor: isNegative ? undefined : (point.color || colors[idx % colors.length])
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{point.label}</p>
                    <p>{formatCurrency(point.value)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          {chart.data.map((point, idx) => (
            <span key={idx} className="flex-1 text-center truncate">{point.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render Area Chart
  const AreaChart = ({ chart, height = 200 }: { chart: ChartConfig; height?: number }) => {
    const maxValue = Math.max(...chart.data.map(d => d.value));
    const minValue = Math.min(...chart.data.map(d => d.value));
    const range = maxValue - minValue;
    
    const points = chart.data.map((d, i) => {
      const x = (i / (chart.data.length - 1)) * 100;
      const y = 100 - ((d.value - minValue) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    const areaPoints = `0,100 ${points} 100,100`;
    
    return (
      <div style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Area */}
          <polygon
            points={areaPoints}
            fill={colors[0]}
            fillOpacity="0.2"
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Points */}
          {chart.data.map((d, i) => {
            const x = (i / (chart.data.length - 1)) * 100;
            const y = 100 - ((d.value - minValue) / range) * 100;
            return (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <circle
                      cx={x}
                      cy={y}
                      r="2"
                      fill={colors[0]}
                      className="cursor-pointer hover:r-3 transition-all"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{d.label}</p>
                    <p>{formatCurrency(d.value)}</p>
                    {d.previousValue && (
                      <p className="text-xs text-muted-foreground">
                        Previous: {formatCurrency(d.previousValue)}
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </svg>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          {chart.data.map((point, idx) => (
            <span key={idx}>{point.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render Pie/Donut Chart
  const PieChart = ({ chart, donut = false, size = 200 }: { chart: ChartConfig; donut?: boolean; size?: number }) => {
    const total = chart.data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = -90; // Start from top
    
    const segments = chart.data.map((d, idx) => {
      const angle = (d.value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      const radius = 50;
      const innerRadius = donut ? 30 : 0;
      
      // Convert to SVG path
      const x1 = 50 + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = 50 + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = 50 + radius * Math.cos(((startAngle + angle) * Math.PI) / 180);
      const y2 = 50 + radius * Math.sin(((startAngle + angle) * Math.PI) / 180);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      let path: string;
      if (donut) {
        const ix1 = 50 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
        const iy1 = 50 + innerRadius * Math.sin((startAngle * Math.PI) / 180);
        const ix2 = 50 + innerRadius * Math.cos(((startAngle + angle) * Math.PI) / 180);
        const iy2 = 50 + innerRadius * Math.sin(((startAngle + angle) * Math.PI) / 180);
        
        path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
      } else {
        path = `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      }
      
      return {
        ...d,
        path,
        color: d.color || colors[idx % colors.length],
        percentage: ((d.value / total) * 100).toFixed(1)
      };
    });
    
    return (
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
          {segments.map((seg, idx) => (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <path
                    d={seg.path}
                    fill={seg.color}
                    className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                    style={{ transform: 'scale(1)', transformOrigin: '50% 50%' }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{seg.label}</p>
                  <p>{formatCurrency(seg.value)} ({seg.percentage}%)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {donut && (
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold fill-current">
              {formatCurrency(total)}
            </text>
          )}
        </svg>
        
        {chart.showLegend && (
          <div className="space-y-2">
            {segments.map((seg, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-muted-foreground">{seg.label}</span>
                <span className="font-medium">{seg.percentage}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render Gauge Chart
  const GaugeChart = ({ chart, size = 200 }: { chart: ChartConfig; size?: number }) => {
    const value = chart.data[0]?.value || 0;
    const percentage = Math.min(Math.max(value, 0), 100);
    const angle = (percentage / 100) * 180 - 90;
    
    // Color based on value
    const color = percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444';
    
    return (
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 100 60" style={{ width: size, height: size * 0.6 }}>
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          <path
            d={`M 10 50 A 40 40 0 ${percentage > 50 ? 1 : 0} 1 ${50 + 40 * Math.cos((angle * Math.PI) / 180)} ${50 + 40 * Math.sin((angle * Math.PI) / 180)}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
          
          {/* Center text */}
          <text x="50" y="48" textAnchor="middle" className="text-2xl font-bold fill-current">
            {percentage}%
          </text>
        </svg>
        
        <div className="flex justify-between w-full text-xs text-muted-foreground mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    );
  };

  // Render Funnel Chart
  const FunnelChart = ({ chart }: { chart: ChartConfig }) => {
    const maxValue = chart.data[0]?.value || 1;
    
    return (
      <div className="space-y-2">
        {chart.data.map((point, idx) => {
          const width = (point.value / maxValue) * 100;
          const conversionRate = idx > 0 
            ? ((point.value / chart.data[idx - 1].value) * 100).toFixed(1)
            : 100;
          
          return (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-sm text-end text-muted-foreground">
                      {point.label}
                    </div>
                    <div className="flex-1 h-8 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-500 flex items-center justify-end pe-2"
                        style={{
                          width: `${width}%`,
                          backgroundColor: colors[idx % colors.length]
                        }}
                      >
                        <span className="text-xs text-white font-medium">
                          {formatNumber(point.value)}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-sm">
                      {idx > 0 && (
                        <span className={cn(
                          "flex items-center gap-1",
                          parseFloat(String(conversionRate)) >= 50 ? "text-green-500" : "text-orange-500"
                        )}>
                          {conversionRate}%
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{point.label}</p>
                  <p>{formatNumber(point.value)} items</p>
                  {idx > 0 && <p className="text-xs">{conversionRate}% conversion</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  };

  // Render chart by type
  const renderChart = (chart: ChartConfig) => {
    switch (chart.type) {
      case 'bar':
        return <BarChart chart={chart} />;
      case 'line':
      case 'area':
        return <AreaChart chart={chart} />;
      case 'pie':
        return <PieChart chart={chart} />;
      case 'donut':
        return <PieChart chart={chart} donut />;
      case 'gauge':
        return <GaugeChart chart={chart} />;
      case 'funnel':
        return <FunnelChart chart={chart} />;
      default:
        return <BarChart chart={chart} />;
    }
  };

  // Chart Card
  const ChartCard = ({ chart }: { chart: ChartConfig }) => {
    const trend = chart.showTrend && chart.data.length > 0
      ? calculateTrend(
          chart.data[chart.data.length - 1].value,
          chart.data[chart.data.length - 1].previousValue
        )
      : null;
    
    return (
      <Card className={cn(
        "transition-all",
        expandedChart === chart.id && "ring-2 ring-primary"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-sm font-medium">
                {isRTL ? chart.titleAr : chart.title}
              </CardTitle>
              {trend && (
                <div className={cn(
                  "flex items-center gap-1 text-xs mt-1",
                  trend.isUp ? "text-green-500" : "text-red-500"
                )}>
                  {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span>{trend.value}%</span>
                </div>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setExpandedChart(chart.id)}>
                  <Maximize2 className="h-4 w-4 me-2" />
                  {t('visualization.expand')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('visualization.exportAs')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => exportChart(chart.id, 'png')}>
                  <Image className="h-4 w-4 me-2" />
                  PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChart(chart.id, 'svg')}>
                  <FileText className="h-4 w-4 me-2" />
                  SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChart(chart.id, 'csv')}>
                  <TableIcon className="h-4 w-4 me-2" />
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart(chart)}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            {t('visualization.title')}
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            {t('visualization.lastUpdate')}: {format(lastUpdate, 'HH:mm', { locale: dateLocale })}
            {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin" />}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Time Range */}
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-36">
              <Calendar className="h-4 w-4 me-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('visualization.ranges.7d')}</SelectItem>
              <SelectItem value="30d">{t('visualization.ranges.30d')}</SelectItem>
              <SelectItem value="90d">{t('visualization.ranges.90d')}</SelectItem>
              <SelectItem value="ytd">{t('visualization.ranges.ytd')}</SelectItem>
              <SelectItem value="1y">{t('visualization.ranges.1y')}</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-none rounded-s"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-9 w-9 rounded-none rounded-e"
              onClick={() => setViewMode('list')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          
          <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {charts.map(chart => (
          <ChartCard key={chart.id} chart={chart} />
        ))}
      </div>

      {/* Expanded Chart Dialog */}
      <Dialog 
        open={!!expandedChart} 
        onOpenChange={(open) => !open && setExpandedChart(null)}
      >
        <DialogContent className="max-w-4xl">
          {expandedChart && (() => {
            const chart = charts.find(c => c.id === expandedChart);
            if (!chart) return null;
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{isRTL ? chart.titleAr : chart.title}</DialogTitle>
                </DialogHeader>
                <div className="py-4" style={{ height: 400 }}>
                  {renderChart(chart)}
                </div>
                <DialogFooter>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => exportChart(chart.id, 'png')}>
                      <Download className="h-4 w-4 me-2" />
                      {t('visualization.download')}
                    </Button>
                    <Button variant="outline" onClick={() => setExpandedChart(null)}>
                      {t('common.close')}
                    </Button>
                  </div>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('visualization.settings')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('visualization.colorPalette')}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(Object.keys(colorPalettes) as (keyof typeof colorPalettes)[]).map(palette => (
                  <Button
                    key={palette}
                    variant={colorPalette === palette ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setColorPalette(palette)}
                    className="gap-2"
                  >
                    <div className="flex gap-0.5">
                      {colorPalettes[palette].slice(0, 4).map((c, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    {t(`visualization.palettes.${palette}`)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>
              {t('common.done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DataVisualization;
