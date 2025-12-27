import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  BarChart3,
  LineChart,
  Eye,
  EyeOff,
  Target,
  Wallet,
  CreditCard,
  Coins,
  PiggyBank,
  Banknote,
  CircleDollarSign,
  Activity,
  ChevronRight,
  ChevronLeft,
  Settings,
  Download,
  Share2,
  Layers,
  Zap,
  Clock,
  Shield,
  Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { format, addMonths, addDays, eachMonthOfInterval, subMonths } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type ForecastPeriod = '3M' | '6M' | '12M' | '24M';
type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';

interface CashFlowData {
  month: Date;
  inflow: number;
  outflow: number;
  balance: number;
  projected?: boolean;
}

interface Scenario {
  type: ScenarioType;
  growthRate: number;
  expenseRate: number;
  confidence: number;
}

interface PredictionInsight {
  id: string;
  type: 'warning' | 'opportunity' | 'info';
  title: string;
  description: string;
  impact?: number;
  month?: Date;
}

interface CashFlowItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  type: 'inflow' | 'outflow';
  recurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
}

// Generate sample data
const generateHistoricalData = (): CashFlowData[] => {
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  });

  let balance = 150000;
  
  return months.map((month, idx) => {
    const inflow = 180000 + Math.random() * 40000 + (idx * 5000);
    const outflow = 150000 + Math.random() * 30000 + (idx * 3000);
    balance = balance + inflow - outflow;
    
    return {
      month,
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      balance: Math.round(balance),
      projected: false,
    };
  });
};

const generateProjectedData = (
  historical: CashFlowData[],
  months: number,
  scenario: Scenario
): CashFlowData[] => {
  const lastData = historical[historical.length - 1];
  let balance = lastData.balance;
  const avgInflow = historical.reduce((sum, d) => sum + d.inflow, 0) / historical.length;
  const avgOutflow = historical.reduce((sum, d) => sum + d.outflow, 0) / historical.length;

  const projectedMonths = eachMonthOfInterval({
    start: addMonths(lastData.month, 1),
    end: addMonths(lastData.month, months),
  });

  return projectedMonths.map((month, idx) => {
    const growthMultiplier = 1 + (scenario.growthRate / 100 / 12);
    const expenseMultiplier = 1 + (scenario.expenseRate / 100 / 12);
    
    const inflow = Math.round(avgInflow * Math.pow(growthMultiplier, idx + 1));
    const outflow = Math.round(avgOutflow * Math.pow(expenseMultiplier, idx + 1));
    balance = balance + inflow - outflow;

    return {
      month,
      inflow,
      outflow,
      balance: Math.round(balance),
      projected: true,
    };
  });
};

const scenarios: Record<ScenarioType, Scenario> = {
  optimistic: { type: 'optimistic', growthRate: 15, expenseRate: 5, confidence: 70 },
  realistic: { type: 'realistic', growthRate: 8, expenseRate: 8, confidence: 85 },
  pessimistic: { type: 'pessimistic', growthRate: 3, expenseRate: 12, confidence: 90 },
};

const sampleRecurringItems: CashFlowItem[] = [
  { id: '1', category: 'إيرادات المبيعات', description: 'مبيعات المنتجات', amount: 120000, type: 'inflow', recurring: true, frequency: 'monthly' },
  { id: '2', category: 'خدمات', description: 'رسوم الخدمات الشهرية', amount: 45000, type: 'inflow', recurring: true, frequency: 'monthly' },
  { id: '3', category: 'إيرادات أخرى', description: 'إيجار مستلم', amount: 5000, type: 'inflow', recurring: true, frequency: 'monthly' },
  { id: '4', category: 'رواتب', description: 'رواتب الموظفين', amount: 85000, type: 'outflow', recurring: true, frequency: 'monthly' },
  { id: '5', category: 'إيجار', description: 'إيجار المكتب', amount: 15000, type: 'outflow', recurring: true, frequency: 'monthly' },
  { id: '6', category: 'مرافق', description: 'كهرباء وماء', amount: 5000, type: 'outflow', recurring: true, frequency: 'monthly' },
  { id: '7', category: 'تسويق', description: 'حملات إعلانية', amount: 20000, type: 'outflow', recurring: true, frequency: 'monthly' },
  { id: '8', category: 'ضرائب', description: 'ضريبة الدخل ربع سنوية', amount: 35000, type: 'outflow', recurring: true, frequency: 'quarterly' },
];

// Simple Chart Component
function CashFlowChart({ data, showBalance = true }: { data: CashFlowData[]; showBalance?: boolean }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  const maxValue = Math.max(...data.map(d => Math.max(d.inflow, d.outflow, Math.abs(d.balance))));
  const minBalance = Math.min(...data.map(d => d.balance));
  const chartHeight = 250;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  return (
    <div className="relative">
      <div className="flex items-end gap-1 h-[250px] px-2 overflow-x-auto">
        {data.map((item, idx) => {
          const inflowHeight = (item.inflow / maxValue) * (chartHeight - 60);
          const outflowHeight = (item.outflow / maxValue) * (chartHeight - 60);
          
          return (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 min-w-[50px] flex-1">
                    <div className="flex items-end gap-1 h-[200px]">
                      {/* Inflow bar */}
                      <div
                        className={`w-4 rounded-t transition-all ${item.projected ? 'bg-green-300' : 'bg-green-500'}`}
                        style={{ height: `${inflowHeight}px` }}
                      />
                      {/* Outflow bar */}
                      <div
                        className={`w-4 rounded-t transition-all ${item.projected ? 'bg-red-300' : 'bg-red-500'}`}
                        style={{ height: `${outflowHeight}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(item.month, 'MMM', { locale: dateLocale })}
                    </span>
                    {item.projected && (
                      <Badge variant="outline" className="text-[10px] px-1">
                        متوقع
                      </Badge>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="p-3">
                  <p className="font-medium">{format(item.month, 'MMMM yyyy', { locale: dateLocale })}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-green-600">تدفق داخل:</span>
                      <span>{formatCurrency(item.inflow)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-red-600">تدفق خارج:</span>
                      <span>{formatCurrency(item.outflow)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4 font-medium">
                      <span>الرصيد:</span>
                      <span className={item.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(item.balance)}
                      </span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-sm">تدفق داخل</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-sm">تدفق خارج</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 rounded border border-dashed border-green-500" />
          <span className="text-sm">متوقع</span>
        </div>
      </div>
    </div>
  );
}

// Balance Trend Line
function BalanceTrendLine({ data }: { data: CashFlowData[] }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  const minBalance = Math.min(...data.map(d => d.balance));
  const maxBalance = Math.max(...data.map(d => d.balance));
  const range = maxBalance - minBalance || 1;
  const height = 100;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = height - ((d.balance - minBalance) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative h-[120px] w-full">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />
        
        {/* Projected area */}
        {data.findIndex(d => d.projected) > 0 && (
          <rect 
            x={((data.findIndex(d => d.projected) - 1) / (data.length - 1)) * 100} 
            y="0" 
            width={100 - ((data.findIndex(d => d.projected) - 1) / (data.length - 1)) * 100}
            height="100"
            fill="rgba(59, 130, 246, 0.1)"
          />
        )}
        
        {/* Balance line */}
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = height - ((d.balance - minBalance) / range) * height;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={d.projected ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--primary))'}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      
      {/* Min/Max labels */}
      <div className="absolute left-2 top-0 text-xs text-muted-foreground">
        {formatCurrency(maxBalance)}
      </div>
      <div className="absolute left-2 bottom-0 text-xs text-muted-foreground">
        {formatCurrency(minBalance)}
      </div>
    </div>
  );
}

export function CashFlowPredictor() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('6M');
  const [scenarioType, setScenarioType] = useState<ScenarioType>('realistic');
  const [customGrowth, setCustomGrowth] = useState(8);
  const [customExpense, setCustomExpense] = useState(8);
  const [useCustomScenario, setUseCustomScenario] = useState(false);
  const [showProjected, setShowProjected] = useState(true);
  const [historicalData] = useState<CashFlowData[]>(generateHistoricalData);
  const [recurringItems] = useState<CashFlowItem[]>(sampleRecurringItems);

  // Current scenario
  const currentScenario = useMemo(() => {
    if (useCustomScenario) {
      return {
        type: 'custom' as ScenarioType,
        growthRate: customGrowth,
        expenseRate: customExpense,
        confidence: 75,
      };
    }
    return scenarios[scenarioType];
  }, [useCustomScenario, customGrowth, customExpense, scenarioType]);

  // Projected data
  const projectedData = useMemo(() => {
    const months = parseInt(forecastPeriod.replace('M', ''));
    return generateProjectedData(historicalData, months, currentScenario);
  }, [historicalData, forecastPeriod, currentScenario]);

  // Combined data
  const allData = useMemo(() => {
    return showProjected ? [...historicalData, ...projectedData] : historicalData;
  }, [historicalData, projectedData, showProjected]);

  // Insights
  const insights = useMemo<PredictionInsight[]>(() => {
    const result: PredictionInsight[] = [];
    
    // Check for negative balance months
    const negativeMonths = projectedData.filter(d => d.balance < 0);
    if (negativeMonths.length > 0) {
      result.push({
        id: 'negative-balance',
        type: 'warning',
        title: t('cashflow.insights.negativeBalance', 'تنبيه: رصيد سلبي متوقع'),
        description: t('cashflow.insights.negativeBalanceDesc', 'قد يصبح الرصيد سلبياً في بعض الأشهر. راجع مصروفاتك أو ابحث عن مصادر تمويل إضافية.'),
        month: negativeMonths[0].month,
        impact: negativeMonths[0].balance,
      });
    }

    // Growth opportunity
    const avgGrowth = projectedData.length > 0 
      ? ((projectedData[projectedData.length - 1].inflow - historicalData[historicalData.length - 1].inflow) / historicalData[historicalData.length - 1].inflow) * 100
      : 0;
    
    if (avgGrowth > 20) {
      result.push({
        id: 'growth-opportunity',
        type: 'opportunity',
        title: t('cashflow.insights.growthOpportunity', 'فرصة نمو'),
        description: t('cashflow.insights.growthOpportunityDesc', 'التوقعات تشير إلى نمو جيد في الإيرادات. فكر في الاستثمار في التوسع.'),
        impact: avgGrowth,
      });
    }

    // Cash buffer recommendation
    const avgMonthlyOutflow = allData.reduce((sum, d) => sum + d.outflow, 0) / allData.length;
    const recommendedBuffer = avgMonthlyOutflow * 3;
    const currentBalance = historicalData[historicalData.length - 1].balance;
    
    if (currentBalance < recommendedBuffer) {
      result.push({
        id: 'cash-buffer',
        type: 'info',
        title: t('cashflow.insights.cashBuffer', 'احتياطي نقدي'),
        description: t('cashflow.insights.cashBufferDesc', 'يُنصح بالاحتفاظ باحتياطي نقدي يعادل 3 أشهر من المصروفات.'),
        impact: recommendedBuffer - currentBalance,
      });
    }

    return result;
  }, [projectedData, historicalData, allData, t]);

  // Summary stats
  const stats = useMemo(() => {
    const lastHistorical = historicalData[historicalData.length - 1];
    const lastProjected = projectedData[projectedData.length - 1];
    const totalProjectedInflow = projectedData.reduce((sum, d) => sum + d.inflow, 0);
    const totalProjectedOutflow = projectedData.reduce((sum, d) => sum + d.outflow, 0);
    
    return {
      currentBalance: lastHistorical.balance,
      projectedBalance: lastProjected?.balance || 0,
      balanceChange: lastProjected ? lastProjected.balance - lastHistorical.balance : 0,
      totalProjectedInflow,
      totalProjectedOutflow,
      netCashFlow: totalProjectedInflow - totalProjectedOutflow,
      avgMonthlyInflow: totalProjectedInflow / projectedData.length,
      avgMonthlyOutflow: totalProjectedOutflow / projectedData.length,
    };
  }, [historicalData, projectedData]);

  // Format helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompact = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      notation: 'compact',
    }).format(amount);
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            {t('cashflow.title', 'توقعات التدفق النقدي')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('cashflow.subtitle', 'تحليل وتوقع التدفقات النقدية المستقبلية')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={forecastPeriod} onValueChange={(v) => setForecastPeriod(v as ForecastPeriod)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3M">3 أشهر</SelectItem>
              <SelectItem value="6M">6 أشهر</SelectItem>
              <SelectItem value="12M">12 شهر</SelectItem>
              <SelectItem value="24M">24 شهر</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('cashflow.currentBalance')}</p>
                <p className="text-2xl font-bold">{formatCompact(stats.currentBalance)}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('cashflow.projectedBalance')}</p>
                <p className="text-2xl font-bold">{formatCompact(stats.projectedBalance)}</p>
                <div className={`flex items-center gap-1 text-sm ${stats.balanceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.balanceChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {formatCompact(Math.abs(stats.balanceChange))}
                </div>
              </div>
              <div className={`p-3 rounded-full ${stats.balanceChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-6 w-6 ${stats.balanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('cashflow.avgInflow')}</p>
                <p className="text-2xl font-bold text-green-600">{formatCompact(stats.avgMonthlyInflow)}</p>
                <p className="text-xs text-muted-foreground">{t('common.perMonth')}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <ArrowUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('cashflow.avgOutflow')}</p>
                <p className="text-2xl font-bold text-red-600">{formatCompact(stats.avgMonthlyOutflow)}</p>
                <p className="text-xs text-muted-foreground">{t('common.perMonth')}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <ArrowDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('cashflow.chart.title')}
                </CardTitle>
                <CardDescription>{t('cashflow.chart.subtitle')}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="show-projected" className="text-sm">
                  {t('cashflow.showProjected')}
                </Label>
                <Switch
                  id="show-projected"
                  checked={showProjected}
                  onCheckedChange={setShowProjected}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={allData} />
          </CardContent>
        </Card>

        {/* Scenario Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t('cashflow.scenarios.title', 'السيناريوهات')}
            </CardTitle>
            <CardDescription>{t('cashflow.scenarios.subtitle', 'اختر سيناريو للتوقعات')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Scenarios */}
            <div className="space-y-2">
              {Object.entries(scenarios).map(([key, scenario]) => (
                <button
                  key={key}
                  onClick={() => {
                    setScenarioType(key as ScenarioType);
                    setUseCustomScenario(false);
                  }}
                  className={`w-full p-3 rounded-lg border text-right transition-all ${
                    !useCustomScenario && scenarioType === key
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={key === 'optimistic' ? 'default' : key === 'pessimistic' ? 'destructive' : 'secondary'}>
                      {t(`cashflow.scenarios.${key}`)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {scenario.confidence}% ثقة
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-green-600">نمو: {scenario.growthRate}%</span>
                    <span className="text-red-600">مصروفات: {scenario.expenseRate}%</span>
                  </div>
                </button>
              ))}
            </div>

            <Separator />

            {/* Custom Scenario */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-scenario">{t('cashflow.customScenario', 'سيناريو مخصص')}</Label>
                <Switch
                  id="custom-scenario"
                  checked={useCustomScenario}
                  onCheckedChange={setUseCustomScenario}
                />
              </div>

              {useCustomScenario && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('cashflow.growthRate', 'معدل النمو')}</Label>
                      <span className="text-sm font-medium text-green-600">{customGrowth}%</span>
                    </div>
                    <Slider
                      value={[customGrowth]}
                      onValueChange={(v) => setCustomGrowth(v[0])}
                      min={-10}
                      max={30}
                      step={1}
                      className="py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">{t('cashflow.expenseRate', 'معدل المصروفات')}</Label>
                      <span className="text-sm font-medium text-red-600">{customExpense}%</span>
                    </div>
                    <Slider
                      value={[customExpense]}
                      onValueChange={(v) => setCustomExpense(v[0])}
                      min={0}
                      max={25}
                      step={1}
                      className="py-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            {t('cashflow.balanceTrend', 'اتجاه الرصيد')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BalanceTrendLine data={allData} />
        </CardContent>
      </Card>

      {/* AI Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('cashflow.insights.title', 'رؤى ذكية')}
            </CardTitle>
            <CardDescription>{t('cashflow.insights.subtitle', 'تحليلات وتوصيات مبنية على التوقعات')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map(insight => {
                const iconClass = insight.type === 'warning' ? 'text-orange-500' 
                  : insight.type === 'opportunity' ? 'text-green-500'
                  : 'text-blue-500';
                const bgClass = insight.type === 'warning' ? 'bg-orange-50 border-orange-200' 
                  : insight.type === 'opportunity' ? 'bg-green-50 border-green-200'
                  : 'bg-blue-50 border-blue-200';

                return (
                  <div key={insight.id} className={`p-4 rounded-lg border ${bgClass}`}>
                    <div className="flex items-start gap-3">
                      {insight.type === 'warning' && <AlertTriangle className={`h-5 w-5 ${iconClass} shrink-0`} />}
                      {insight.type === 'opportunity' && <CheckCircle className={`h-5 w-5 ${iconClass} shrink-0`} />}
                      {insight.type === 'info' && <Info className={`h-5 w-5 ${iconClass} shrink-0`} />}
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        {insight.impact && (
                          <Badge variant="outline" className="mt-2">
                            {insight.type === 'warning' 
                              ? formatCurrency(insight.impact)
                              : insight.type === 'opportunity'
                              ? `+${insight.impact.toFixed(1)}%`
                              : formatCurrency(insight.impact)
                            }
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t('cashflow.recurringItems', 'التدفقات المتكررة')}
          </CardTitle>
          <CardDescription>{t('cashflow.recurringItemsDesc', 'التدفقات النقدية المتكررة المستخدمة في التوقعات')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.description')}</TableHead>
                <TableHead>{t('common.category')}</TableHead>
                <TableHead>{t('common.frequency')}</TableHead>
                <TableHead>{t('common.type')}</TableHead>
                <TableHead className="text-left">{t('common.amount')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`frequency.${item.frequency}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'inflow' ? 'default' : 'destructive'}>
                      {item.type === 'inflow' ? 'داخل' : 'خارج'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-medium text-left ${item.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'inflow' ? '+' : '-'}{formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default CashFlowPredictor;
