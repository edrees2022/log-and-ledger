import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutGrid, 
  Plus, 
  Settings, 
  GripVertical,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Receipt,
  Package,
  Wallet,
  CreditCard,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Bell,
  Target,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Undo,
  Lock,
  Unlock,
  Sparkles,
  Zap,
  Activity,
  FileText,
  Building2,
  Globe,
  Star,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
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
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type WidgetType = 
  | 'kpi' 
  | 'chart' 
  | 'list' 
  | 'calendar' 
  | 'tasks' 
  | 'alerts' 
  | 'quick-actions'
  | 'recent-activity'
  | 'goals'
  | 'weather'
  | 'notes';

type WidgetSize = 'small' | 'medium' | 'large' | 'full';
type ChartType = 'bar' | 'line' | 'pie' | 'area' | 'donut';

interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  subtitle?: string;
  size: WidgetSize;
  order: number;
  visible: boolean;
  locked?: boolean;
  config?: {
    metric?: string;
    chartType?: ChartType;
    showTrend?: boolean;
    refreshInterval?: number;
    customData?: Record<string, unknown>;
  };
}

interface KPIData {
  value: number;
  previousValue?: number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  format: 'currency' | 'number' | 'percentage';
}

interface SmartDashboardProps {
  organizationId?: number;
  userId?: string;
}

// Widget type configurations
const widgetTypeConfig: Record<WidgetType, { 
  icon: React.ElementType; 
  label: string;
  sizes: WidgetSize[];
}> = {
  kpi: { icon: Activity, label: 'dashboard.widgets.kpi', sizes: ['small', 'medium'] },
  chart: { icon: BarChart3, label: 'dashboard.widgets.chart', sizes: ['medium', 'large', 'full'] },
  list: { icon: FileText, label: 'dashboard.widgets.list', sizes: ['small', 'medium', 'large'] },
  calendar: { icon: Calendar, label: 'dashboard.widgets.calendar', sizes: ['medium', 'large'] },
  tasks: { icon: CheckCircle, label: 'dashboard.widgets.tasks', sizes: ['small', 'medium'] },
  alerts: { icon: Bell, label: 'dashboard.widgets.alerts', sizes: ['small', 'medium'] },
  'quick-actions': { icon: Zap, label: 'dashboard.widgets.quickActions', sizes: ['small', 'medium'] },
  'recent-activity': { icon: ClockIcon, label: 'dashboard.widgets.recentActivity', sizes: ['medium', 'large'] },
  goals: { icon: Target, label: 'dashboard.widgets.goals', sizes: ['medium', 'large'] },
  weather: { icon: Globe, label: 'dashboard.widgets.weather', sizes: ['small'] },
  notes: { icon: FileText, label: 'dashboard.widgets.notes', sizes: ['small', 'medium'] }
};

// Size configurations
const sizeConfig: Record<WidgetSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-1 md:col-span-2',
  large: 'col-span-1 md:col-span-2 lg:col-span-3',
  full: 'col-span-full'
};

// Default widgets
const defaultWidgets: DashboardWidget[] = [
  { id: 'revenue', type: 'kpi', title: 'Revenue', size: 'small', order: 1, visible: true, config: { metric: 'revenue', showTrend: true } },
  { id: 'expenses', type: 'kpi', title: 'Expenses', size: 'small', order: 2, visible: true, config: { metric: 'expenses', showTrend: true } },
  { id: 'profit', type: 'kpi', title: 'Profit', size: 'small', order: 3, visible: true, config: { metric: 'profit', showTrend: true } },
  { id: 'invoices', type: 'kpi', title: 'Invoices', size: 'small', order: 4, visible: true, config: { metric: 'invoices', showTrend: true } },
  { id: 'revenue-chart', type: 'chart', title: 'Revenue Trend', size: 'large', order: 5, visible: true, config: { chartType: 'bar' } },
  { id: 'quick-actions', type: 'quick-actions', title: 'Quick Actions', size: 'small', order: 6, visible: true, locked: true },
  { id: 'alerts', type: 'alerts', title: 'Alerts', size: 'medium', order: 7, visible: true },
  { id: 'tasks', type: 'tasks', title: 'My Tasks', size: 'medium', order: 8, visible: true },
  { id: 'recent-activity', type: 'recent-activity', title: 'Recent Activity', size: 'medium', order: 9, visible: true },
  { id: 'goals', type: 'goals', title: 'Goals', size: 'medium', order: 10, visible: true }
];

export function SmartDashboard({ organizationId, userId }: SmartDashboardProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sample KPI data
  const kpiData: Record<string, KPIData> = useMemo(() => ({
    revenue: { value: 125000, previousValue: 112000, trend: 'up', trendValue: 11.6, format: 'currency' },
    expenses: { value: 78000, previousValue: 85000, trend: 'down', trendValue: 8.2, format: 'currency' },
    profit: { value: 47000, previousValue: 27000, trend: 'up', trendValue: 74.1, format: 'currency' },
    invoices: { value: 156, previousValue: 142, trend: 'up', trendValue: 9.9, format: 'number' },
    customers: { value: 48, previousValue: 45, trend: 'up', trendValue: 6.7, format: 'number' },
    items: { value: 234, format: 'number' },
    receivables: { value: 32000, format: 'currency' },
    payables: { value: 18500, format: 'currency' }
  }), []);

  // Sample alerts
  const alerts = useMemo(() => [
    { id: '1', type: 'warning', message: t('dashboard.alerts.overdueInvoices', { count: 5 }), time: '10m' },
    { id: '2', type: 'info', message: t('dashboard.alerts.lowStock', { count: 3 }), time: '1h' },
    { id: '3', type: 'success', message: t('dashboard.alerts.paymentReceived'), time: '2h' }
  ], [t]);

  // Sample tasks
  const tasks = useMemo(() => [
    { id: '1', title: t('dashboard.tasks.reviewInvoices'), due: 'Today', completed: false, priority: 'high' },
    { id: '2', title: t('dashboard.tasks.sendQuotes'), due: 'Tomorrow', completed: false, priority: 'medium' },
    { id: '3', title: t('dashboard.tasks.reconcileAccounts'), due: 'This week', completed: true, priority: 'low' }
  ], [t]);

  // Sample activities
  const activities = useMemo(() => [
    { id: '1', action: 'created', entity: 'Invoice #1234', user: 'Ahmed', time: '5m ago' },
    { id: '2', action: 'updated', entity: 'Contact: Acme Corp', user: 'Sara', time: '15m ago' },
    { id: '3', action: 'paid', entity: 'Invoice #1230', user: 'System', time: '1h ago' },
    { id: '4', action: 'added', entity: 'New Item: Widget Pro', user: 'Ahmed', time: '2h ago' }
  ], []);

  // Sample goals
  const goals = useMemo(() => [
    { id: '1', title: t('dashboard.goals.monthlyRevenue'), current: 125000, target: 150000, unit: 'currency' },
    { id: '2', title: t('dashboard.goals.newCustomers'), current: 12, target: 20, unit: 'number' },
    { id: '3', title: t('dashboard.goals.invoiceCollection'), current: 85, target: 95, unit: 'percentage' }
  ], [t]);

  // Quick actions
  const quickActions = useMemo(() => [
    { id: 'new-invoice', label: t('dashboard.actions.newInvoice'), icon: Receipt, color: 'bg-blue-500' },
    { id: 'new-contact', label: t('dashboard.actions.newContact'), icon: Users, color: 'bg-green-500' },
    { id: 'new-expense', label: t('dashboard.actions.newExpense'), icon: Wallet, color: 'bg-red-500' },
    { id: 'new-item', label: t('dashboard.actions.newItem'), icon: Package, color: 'bg-purple-500' }
  ], [t]);

  // Format value based on type
  const formatValue = useCallback((value: number, format: 'currency' | 'number' | 'percentage'): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
      case 'percentage':
        return `${value}%`;
      default:
        return new Intl.NumberFormat(i18n.language).format(value);
    }
  }, [i18n.language]);

  // Refresh dashboard
  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
    toast({ title: t('dashboard.refreshed') });
  }, [t, toast]);

  // Toggle widget visibility
  const toggleWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  }, []);

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    toast({ title: t('dashboard.widgetRemoved') });
  }, [t, toast]);

  // Add widget
  const addWidget = useCallback((type: WidgetType) => {
    const newWidget: DashboardWidget = {
      id: `${type}-${Date.now()}`,
      type,
      title: t(widgetTypeConfig[type].label),
      size: widgetTypeConfig[type].sizes[0],
      order: widgets.length + 1,
      visible: true
    };
    setWidgets(prev => [...prev, newWidget]);
    setAddWidgetOpen(false);
    toast({ title: t('dashboard.widgetAdded') });
  }, [widgets.length, t, toast]);

  // Save layout
  const saveLayout = useCallback(() => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgets));
    setIsEditing(false);
    toast({ title: t('dashboard.layoutSaved') });
  }, [widgets, t, toast]);

  // Reset layout
  const resetLayout = useCallback(() => {
    setWidgets(defaultWidgets);
    toast({ title: t('dashboard.layoutReset') });
  }, [toast, t]);

  // Visible widgets sorted by order
  const visibleWidgets = useMemo(() => 
    widgets.filter(w => w.visible).sort((a, b) => a.order - b.order),
    [widgets]
  );

  // Render KPI widget
  const renderKPIWidget = (widget: DashboardWidget) => {
    const metric = widget.config?.metric || 'revenue';
    const data = kpiData[metric];
    if (!data) return null;

    const icons: Record<string, React.ElementType> = {
      revenue: DollarSign,
      expenses: Wallet,
      profit: TrendingUp,
      invoices: Receipt,
      customers: Users,
      items: Package,
      receivables: ArrowUpRight,
      payables: ArrowDownRight
    };

    const colors: Record<string, string> = {
      revenue: 'text-green-500',
      expenses: 'text-red-500',
      profit: 'text-blue-500',
      invoices: 'text-purple-500',
      customers: 'text-orange-500',
      items: 'text-teal-500',
      receivables: 'text-emerald-500',
      payables: 'text-rose-500'
    };

    const Icon = icons[metric] || Activity;
    const color = colors[metric] || 'text-primary';

    return (
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t(`dashboard.metrics.${metric}`)}</p>
          <p className="text-2xl font-bold mt-1">{formatValue(data.value, data.format)}</p>
          {data.trend && data.trendValue !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm mt-2",
              data.trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}>
              {data.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{data.trendValue}%</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-full bg-muted", color)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    );
  };

  // Render chart widget
  const renderChartWidget = (widget: DashboardWidget) => {
    const data = [45, 52, 48, 61, 55, 67, 72, 69, 81, 95, 102, 125];
    const maxValue = Math.max(...data);
    const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

    return (
      <div className="space-y-4">
        <div className="flex items-end gap-1 h-32">
          {data.map((value, idx) => (
            <TooltipProvider key={idx}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex-1 bg-primary rounded-t hover:bg-primary/80 transition-colors cursor-pointer"
                    style={{ height: `${(value / maxValue) * 100}%`, minHeight: '4px' }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatValue(value * 1000, 'currency')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          {labels.map(label => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Render quick actions widget
  const renderQuickActionsWidget = () => (
    <div className="grid grid-cols-2 gap-2">
      {quickActions.map(action => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="outline"
            className="h-auto py-3 flex flex-col items-center gap-2"
          >
            <div className={cn("p-2 rounded-full text-white", action.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );

  // Render alerts widget
  const renderAlertsWidget = () => (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg",
            alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
            alert.type === 'success' ? 'bg-green-50 dark:bg-green-950/20' :
            'bg-blue-50 dark:bg-blue-950/20'
          )}
        >
          {alert.type === 'warning' ? (
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          ) : alert.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-sm">{alert.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // Render tasks widget
  const renderTasksWidget = () => (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task.id} className="flex items-center gap-3">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
            task.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
          )}>
            {task.completed && <CheckCircle className="h-3 w-3 text-white" />}
          </div>
          <div className="flex-1">
            <p className={cn("text-sm", task.completed && "line-through text-muted-foreground")}>
              {task.title}
            </p>
            <p className="text-xs text-muted-foreground">{task.due}</p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              task.priority === 'high' ? 'border-red-500 text-red-500' :
              task.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
              'border-green-500 text-green-500'
            )}
          >
            {task.priority}
          </Badge>
        </div>
      ))}
    </div>
  );

  // Render activity widget
  const renderActivityWidget = () => (
    <div className="space-y-3">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user}</span>{' '}
              {activity.action}{' '}
              <span className="text-primary">{activity.entity}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // Render goals widget
  const renderGoalsWidget = () => (
    <div className="space-y-4">
      {goals.map(goal => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        return (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{goal.title}</span>
              <span className="text-sm text-muted-foreground">
                {goal.unit === 'currency' ? formatValue(goal.current, 'currency') : goal.current} / {goal.unit === 'currency' ? formatValue(goal.target, 'currency') : goal.target}{goal.unit === 'percentage' ? '%' : ''}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        );
      })}
    </div>
  );

  // Render widget content
  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'kpi':
        return renderKPIWidget(widget);
      case 'chart':
        return renderChartWidget(widget);
      case 'quick-actions':
        return renderQuickActionsWidget();
      case 'alerts':
        return renderAlertsWidget();
      case 'tasks':
        return renderTasksWidget();
      case 'recent-activity':
        return renderActivityWidget();
      case 'goals':
        return renderGoalsWidget();
      default:
        return <p className="text-muted-foreground text-sm">{t('dashboard.widgetPlaceholder')}</p>;
    }
  };

  // Render single widget
  const renderWidget = (widget: DashboardWidget) => (
    <Card 
      key={widget.id}
      className={cn(
        sizeConfig[widget.size],
        isEditing && "ring-2 ring-dashed ring-muted-foreground/20",
        isEditing && draggedWidget === widget.id && "opacity-50"
      )}
      draggable={isEditing && !widget.locked}
      onDragStart={() => setDraggedWidget(widget.id)}
      onDragEnd={() => setDraggedWidget(null)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing && !widget.locked && (
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            )}
            {widget.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
            <CardTitle className="text-sm font-medium">{t(`dashboard.metrics.${widget.config?.metric}`) || widget.title}</CardTitle>
          </div>
          
          {isEditing ? (
            <div className="flex items-center gap-1">
              {!widget.locked && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setSelectedWidget(widget);
                      setConfigOpen(true);
                    }}
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600"
                    onClick={() => removeWidget(widget.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={refreshDashboard}>
                  <RefreshCw className="h-4 w-4 me-2" />
                  {t('dashboard.refresh')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toggleWidget(widget.id)}>
                  <EyeOff className="h-4 w-4 me-2" />
                  {t('dashboard.hide')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {renderWidgetContent(widget)}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-6 w-6" />
            {t('dashboard.title')}
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            {t('dashboard.lastUpdate')}: {format(lastRefresh, 'HH:mm', { locale: dateLocale })}
            {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin" />}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshDashboard}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setAddWidgetOpen(true)}>
                <Plus className="h-4 w-4 me-2" />
                {t('dashboard.addWidget')}
              </Button>
              <Button variant="outline" onClick={resetLayout}>
                <Undo className="h-4 w-4 me-2" />
                {t('dashboard.reset')}
              </Button>
              <Button onClick={saveLayout}>
                <Save className="h-4 w-4 me-2" />
                {t('dashboard.save')}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-4 w-4 me-2" />
              {t('dashboard.customize')}
            </Button>
          )}
        </div>
      </div>

      {/* Edit mode indicator */}
      {isEditing && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-sm">{t('dashboard.editMode')}</span>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleWidgets.map(renderWidget)}
      </div>

      {/* Add Widget Dialog */}
      <Dialog open={addWidgetOpen} onOpenChange={setAddWidgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.addWidget')}</DialogTitle>
            <DialogDescription>{t('dashboard.selectWidgetType')}</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4">
            {Object.entries(widgetTypeConfig).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={type}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                  onClick={() => addWidget(type as WidgetType)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{t(config.label)}</span>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.configureWidget')}</DialogTitle>
          </DialogHeader>
          
          {selectedWidget && (
            <div className="space-y-4 py-4">
              <div>
                <Label>{t('dashboard.widgetTitle')}</Label>
                <Input 
                  value={selectedWidget.title}
                  onChange={(e) => {
                    setWidgets(prev => prev.map(w => 
                      w.id === selectedWidget.id ? { ...w, title: e.target.value } : w
                    ));
                    setSelectedWidget({ ...selectedWidget, title: e.target.value });
                  }}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>{t('dashboard.widgetSize')}</Label>
                <Select 
                  value={selectedWidget.size}
                  onValueChange={(v) => {
                    setWidgets(prev => prev.map(w => 
                      w.id === selectedWidget.id ? { ...w, size: v as WidgetSize } : w
                    ));
                    setSelectedWidget({ ...selectedWidget, size: v as WidgetSize });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {widgetTypeConfig[selectedWidget.type].sizes.map(size => (
                      <SelectItem key={size} value={size}>
                        {t(`dashboard.sizes.${size}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => setConfigOpen(false)}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SmartDashboard;
