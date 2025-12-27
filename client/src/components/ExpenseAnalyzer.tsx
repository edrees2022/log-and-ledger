import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShoppingCart,
  Building2,
  Truck,
  Users,
  Coffee,
  Car,
  Wifi,
  Phone,
  Lightbulb,
  Shield,
  Tag,
  AlertTriangle,
  Target,
  Percent,
  Coins,
  Receipt,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
import { Separator } from '@/components/ui/separator';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, subDays } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type ExpenseCategory = 
  | 'rent' 
  | 'utilities' 
  | 'salaries' 
  | 'supplies' 
  | 'travel' 
  | 'marketing'
  | 'insurance'
  | 'maintenance'
  | 'telecom'
  | 'other';

type AnalysisPeriod = '1M' | '3M' | '6M' | '12M' | 'YTD';

interface CategoryData {
  category: ExpenseCategory;
  amount: number;
  previousAmount: number;
  budget: number;
  transactions: number;
  trend: number;
}

interface MonthlyExpense {
  month: Date;
  total: number;
  byCategory: Record<ExpenseCategory, number>;
}

interface ExpenseInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'action';
  title: string;
  description: string;
  impact?: number;
  category?: ExpenseCategory;
}

interface TopExpense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  vendor?: string;
}

// Category config
const categoryConfig: Record<ExpenseCategory, { icon: React.ElementType; color: string; label: string }> = {
  rent: { icon: Building2, color: 'blue', label: 'expenses.categories.rent' },
  utilities: { icon: Lightbulb, color: 'yellow', label: 'expenses.categories.utilities' },
  salaries: { icon: Users, color: 'green', label: 'expenses.categories.salaries' },
  supplies: { icon: ShoppingCart, color: 'purple', label: 'expenses.categories.supplies' },
  travel: { icon: Car, color: 'orange', label: 'expenses.categories.travel' },
  marketing: { icon: Target, color: 'pink', label: 'expenses.categories.marketing' },
  insurance: { icon: Shield, color: 'indigo', label: 'expenses.categories.insurance' },
  maintenance: { icon: Truck, color: 'gray', label: 'expenses.categories.maintenance' },
  telecom: { icon: Phone, color: 'cyan', label: 'expenses.categories.telecom' },
  other: { icon: Tag, color: 'slate', label: 'expenses.categories.other' },
};

// Sample data
const generateMonthlyData = (): MonthlyExpense[] => {
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 11),
    end: new Date(),
  });

  return months.map((month, idx) => ({
    month,
    total: 85000 + Math.random() * 30000,
    byCategory: {
      rent: 15000,
      utilities: 3000 + Math.random() * 1000,
      salaries: 45000 + Math.random() * 5000,
      supplies: 5000 + Math.random() * 2000,
      travel: 2000 + Math.random() * 3000,
      marketing: 8000 + Math.random() * 4000,
      insurance: 3000,
      maintenance: 1500 + Math.random() * 1500,
      telecom: 2000 + Math.random() * 500,
      other: 1500 + Math.random() * 2000,
    },
  }));
};

const sampleCategoryData: CategoryData[] = [
  { category: 'salaries', amount: 150000, previousAmount: 145000, budget: 160000, transactions: 12, trend: 3.4 },
  { category: 'rent', amount: 45000, previousAmount: 45000, budget: 45000, transactions: 3, trend: 0 },
  { category: 'marketing', amount: 32000, previousAmount: 28000, budget: 30000, transactions: 24, trend: 14.3 },
  { category: 'utilities', amount: 12500, previousAmount: 11000, budget: 15000, transactions: 8, trend: 13.6 },
  { category: 'supplies', amount: 18000, previousAmount: 16500, budget: 20000, transactions: 45, trend: 9.1 },
  { category: 'travel', amount: 8500, previousAmount: 12000, budget: 10000, transactions: 6, trend: -29.2 },
  { category: 'insurance', amount: 9000, previousAmount: 9000, budget: 9000, transactions: 1, trend: 0 },
  { category: 'maintenance', amount: 4500, previousAmount: 6000, budget: 8000, transactions: 5, trend: -25 },
  { category: 'telecom', amount: 6500, previousAmount: 6200, budget: 7000, transactions: 4, trend: 4.8 },
  { category: 'other', amount: 5000, previousAmount: 4800, budget: 10000, transactions: 12, trend: 4.2 },
];

const sampleInsights: ExpenseInsight[] = [
  {
    id: '1',
    type: 'warning',
    title: 'تجاوز ميزانية التسويق',
    description: 'تجاوزت مصروفات التسويق الميزانية المحددة بنسبة 6.7%. راجع الحملات الإعلانية الحالية.',
    impact: 2000,
    category: 'marketing',
  },
  {
    id: '2',
    type: 'success',
    title: 'وفورات في مصروفات السفر',
    description: 'انخفضت مصروفات السفر بنسبة 29% هذا الشهر مقارنة بالشهر السابق.',
    impact: -3500,
    category: 'travel',
  },
  {
    id: '3',
    type: 'info',
    title: 'ارتفاع فواتير المرافق',
    description: 'ارتفعت فواتير الكهرباء بنسبة 14% - قد يكون ذلك بسبب موسم الصيف.',
    category: 'utilities',
  },
  {
    id: '4',
    type: 'action',
    title: 'فرصة للتفاوض',
    description: 'عقد الإيجار ينتهي الشهر القادم. قد تكون فرصة للتفاوض على سعر أفضل.',
    category: 'rent',
  },
];

const sampleTopExpenses: TopExpense[] = [
  { id: '1', description: 'رواتب نوفمبر', category: 'salaries', amount: 50000, date: new Date('2024-11-25'), vendor: 'الرواتب' },
  { id: '2', description: 'إيجار المكتب - ديسمبر', category: 'rent', amount: 15000, date: new Date('2024-12-01'), vendor: 'شركة العقارات' },
  { id: '3', description: 'حملة إعلانية رقمية', category: 'marketing', amount: 12000, date: new Date('2024-11-15'), vendor: 'جوجل' },
  { id: '4', description: 'تأمين شامل', category: 'insurance', amount: 9000, date: new Date('2024-11-01'), vendor: 'التعاونية' },
  { id: '5', description: 'معدات مكتبية', category: 'supplies', amount: 7500, date: new Date('2024-11-10'), vendor: 'مكتبة جرير' },
];

// Chart component (simple SVG)
function SimpleBarChart({ data, height = 200 }: { data: { label: string; value: number; color: string }[]; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="flex items-end justify-between h-[200px] gap-2 px-4">
      {data.map((item, idx) => {
        const barHeight = (item.value / maxValue) * 100;
        return (
          <TooltipProvider key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className={`w-full max-w-[40px] rounded-t-md transition-all hover:opacity-80`}
                    style={{ 
                      height: `${barHeight}%`,
                      backgroundColor: item.color,
                      minHeight: '4px'
                    }}
                  />
                  <span className="text-xs text-muted-foreground truncate">{item.label}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}: {item.value.toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}

// Donut Chart (simple SVG)
function SimpleDonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;

  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (currentAngle - 90) * (Math.PI / 180);
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return {
      ...item,
      percentage,
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {segments.map((segment, idx) => (
          <path
            key={idx}
            d={segment.path}
            fill={segment.color}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold">{total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">ر.س</p>
        </div>
      </div>
    </div>
  );
}

export function ExpenseAnalyzer() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [period, setPeriod] = useState<AnalysisPeriod>('3M');
  const [categoryData] = useState<CategoryData[]>(sampleCategoryData);
  const [monthlyData] = useState<MonthlyExpense[]>(generateMonthlyData);
  const [insights] = useState<ExpenseInsight[]>(sampleInsights);
  const [topExpenses] = useState<TopExpense[]>(sampleTopExpenses);
  const [showBudget, setShowBudget] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  // Calculations
  const totalExpenses = useMemo(() => {
    return categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  }, [categoryData]);

  const totalBudget = useMemo(() => {
    return categoryData.reduce((sum, cat) => sum + cat.budget, 0);
  }, [categoryData]);

  const budgetUsage = useMemo(() => {
    return (totalExpenses / totalBudget) * 100;
  }, [totalExpenses, totalBudget]);

  const previousTotal = useMemo(() => {
    return categoryData.reduce((sum, cat) => sum + cat.previousAmount, 0);
  }, [categoryData]);

  const totalTrend = useMemo(() => {
    return ((totalExpenses - previousTotal) / previousTotal) * 100;
  }, [totalExpenses, previousTotal]);

  // Format helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Chart data
  const categoryChartData = categoryData
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
    .map(cat => ({
      label: t(categoryConfig[cat.category].label),
      value: cat.amount,
      color: `hsl(var(--${categoryConfig[cat.category].color}-500))`,
    }));

  const monthlyChartData = monthlyData.slice(-6).map(month => ({
    label: format(month.month, 'MMM', { locale: dateLocale }),
    value: Math.round(month.total),
    color: 'hsl(var(--primary))',
  }));

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            {t('expenses.analyzer.title', 'تحليل المصروفات')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('expenses.analyzer.subtitle', 'تحليل شامل لمصروفات الشركة مع رؤى ذكية')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as AnalysisPeriod)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1M">{t('periods.1month')}</SelectItem>
              <SelectItem value="3M">{t('periods.3months')}</SelectItem>
              <SelectItem value="6M">{t('periods.6months')}</SelectItem>
              <SelectItem value="12M">{t('periods.12months')}</SelectItem>
              <SelectItem value="YTD">{t('periods.ytd')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('expenses.total')}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                <div className={`flex items-center gap-1 text-sm ${totalTrend >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {totalTrend >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {formatPercent(totalTrend)}
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('expenses.budget')}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={budgetUsage} className="h-2 w-20" />
                  <span className="text-sm text-muted-foreground">{budgetUsage.toFixed(0)}%</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('expenses.remaining')}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget - totalExpenses)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('expenses.ofBudget', { percent: (100 - budgetUsage).toFixed(0) })}
                </p>
              </div>
              <div className={`p-3 rounded-full ${budgetUsage > 90 ? 'bg-red-100' : 'bg-green-100'}`}>
                <Coins className={`h-6 w-6 ${budgetUsage > 90 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('expenses.transactions')}</p>
                <p className="text-2xl font-bold">
                  {categoryData.reduce((sum, cat) => sum + cat.transactions, 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('expenses.avgPerTransaction', { 
                    avg: formatCurrency(totalExpenses / categoryData.reduce((sum, cat) => sum + cat.transactions, 0))
                  })}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {t('expenses.monthlyTrend')}
            </CardTitle>
            <CardDescription>{t('expenses.monthlyTrendDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={monthlyChartData} />
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('expenses.byCategory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleDonutChart data={categoryChartData} />
            <div className="mt-4 space-y-2">
              {categoryChartData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('expenses.insights.title', 'رؤى ذكية')}
          </CardTitle>
          <CardDescription>{t('expenses.insights.subtitle', 'تحليلات واقتراحات مدعومة بالذكاء الاصطناعي')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(insight => {
              const iconClass = insight.type === 'warning' ? 'text-orange-500' 
                : insight.type === 'success' ? 'text-green-500'
                : insight.type === 'action' ? 'text-blue-500'
                : 'text-gray-500';
              const bgClass = insight.type === 'warning' ? 'bg-orange-50 border-orange-200' 
                : insight.type === 'success' ? 'bg-green-50 border-green-200'
                : insight.type === 'action' ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200';

              return (
                <div key={insight.id} className={`p-4 rounded-lg border ${bgClass}`}>
                  <div className="flex items-start gap-3">
                    {insight.type === 'warning' && <AlertTriangle className={`h-5 w-5 ${iconClass} shrink-0`} />}
                    {insight.type === 'success' && <CheckCircle className={`h-5 w-5 ${iconClass} shrink-0`} />}
                    {insight.type === 'action' && <Sparkles className={`h-5 w-5 ${iconClass} shrink-0`} />}
                    {insight.type === 'info' && <AlertCircle className={`h-5 w-5 ${iconClass} shrink-0`} />}
                    <div>
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      {insight.impact && (
                        <Badge variant="outline" className="mt-2">
                          {insight.impact > 0 ? '+' : ''}{formatCurrency(insight.impact)}
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

      {/* Category Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('expenses.categoryDetails')}</CardTitle>
              <CardDescription>{t('expenses.categoryDetailsDesc')}</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowBudget(!showBudget)}
            >
              {showBudget ? <EyeOff className="h-4 w-4 ml-2" /> : <Eye className="h-4 w-4 ml-2" />}
              {showBudget ? t('expenses.hideBudget') : t('expenses.showBudget')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.sort((a, b) => b.amount - a.amount).map(cat => {
              const config = categoryConfig[cat.category];
              const usage = (cat.amount / cat.budget) * 100;
              const isOverBudget = usage > 100;

              return (
                <div key={cat.category} className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                    <config.icon className={`h-5 w-5 text-${config.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{t(config.label)}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{formatCurrency(cat.amount)}</span>
                        {showBudget && (
                          <span className="text-sm text-muted-foreground">
                            / {formatCurrency(cat.budget)}
                          </span>
                        )}
                        <Badge 
                          variant={cat.trend > 0 ? 'destructive' : cat.trend < 0 ? 'secondary' : 'outline'}
                          className="w-16 justify-center"
                        >
                          {formatPercent(cat.trend)}
                        </Badge>
                      </div>
                    </div>
                    {showBudget && (
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={Math.min(usage, 100)} 
                          className={`h-2 flex-1 ${isOverBudget ? 'bg-red-100' : ''}`}
                        />
                        <span className={`text-xs w-12 text-left ${isOverBudget ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                          {usage.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>{t('expenses.topExpenses', 'أعلى المصروفات')}</CardTitle>
          <CardDescription>{t('expenses.topExpensesDesc', 'أكبر 5 مصروفات في الفترة المحددة')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topExpenses.map((expense, idx) => {
              const config = categoryConfig[expense.category];
              return (
                <div key={expense.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                    <config.icon className={`h-4 w-4 text-${config.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{expense.vendor}</span>
                      <span>•</span>
                      <span>{format(expense.date, 'dd MMM', { locale: dateLocale })}</span>
                    </div>
                  </div>
                  <span className="font-bold">{formatCurrency(expense.amount)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExpenseAnalyzer;
