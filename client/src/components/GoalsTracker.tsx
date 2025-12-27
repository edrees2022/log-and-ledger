import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Award,
  Flame,
  Zap,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Filter,
  Download,
  Share2,
  Bell,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  Star,
  Flag,
  Users,
  Building2,
  Wallet,
  CreditCard,
  ShoppingCart,
  Package,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Types
type GoalCategory = 'revenue' | 'expenses' | 'profit' | 'customers' | 'sales' | 'inventory' | 'custom';
type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'completed' | 'not_started';
type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

interface Goal {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  startDate: Date;
  endDate: Date;
  period: GoalPeriod;
  status: GoalStatus;
  priority: GoalPriority;
  milestones: Milestone[];
  reminders: boolean;
  teamMembers: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  name: string;
  targetValue: number;
  targetDate: Date;
  completed: boolean;
  completedDate?: Date;
}

interface GoalStats {
  totalGoals: number;
  completedGoals: number;
  onTrackGoals: number;
  atRiskGoals: number;
  behindGoals: number;
  averageProgress: number;
}

// Category configurations
const categoryConfig: Record<GoalCategory, { icon: React.ElementType; color: string; label: string }> = {
  revenue: { icon: DollarSign, color: 'green', label: 'goals.categories.revenue' },
  expenses: { icon: CreditCard, color: 'red', label: 'goals.categories.expenses' },
  profit: { icon: TrendingUp, color: 'blue', label: 'goals.categories.profit' },
  customers: { icon: Users, color: 'purple', label: 'goals.categories.customers' },
  sales: { icon: ShoppingCart, color: 'orange', label: 'goals.categories.sales' },
  inventory: { icon: Package, color: 'indigo', label: 'goals.categories.inventory' },
  custom: { icon: Target, color: 'gray', label: 'goals.categories.custom' },
};

// Status configurations
const statusConfig: Record<GoalStatus, { color: string; icon: React.ElementType; label: string }> = {
  on_track: { color: 'green', icon: CheckCircle, label: 'goals.status.onTrack' },
  at_risk: { color: 'yellow', icon: AlertCircle, label: 'goals.status.atRisk' },
  behind: { color: 'red', icon: TrendingDown, label: 'goals.status.behind' },
  completed: { color: 'blue', icon: Award, label: 'goals.status.completed' },
  not_started: { color: 'gray', icon: Clock, label: 'goals.status.notStarted' },
};

// Priority configurations
const priorityConfig: Record<GoalPriority, { color: string; label: string }> = {
  low: { color: 'gray', label: 'goals.priority.low' },
  medium: { color: 'blue', label: 'goals.priority.medium' },
  high: { color: 'orange', label: 'goals.priority.high' },
  critical: { color: 'red', label: 'goals.priority.critical' },
};

// Sample goals data
const sampleGoals: Goal[] = [
  {
    id: '1',
    name: 'زيادة المبيعات السنوية',
    description: 'تحقيق نمو 25% في إجمالي المبيعات مقارنة بالعام الماضي',
    category: 'revenue',
    targetValue: 1000000,
    currentValue: 750000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    period: 'yearly',
    status: 'on_track',
    priority: 'high',
    milestones: [
      { id: 'm1', name: 'الربع الأول', targetValue: 250000, targetDate: new Date('2024-03-31'), completed: true, completedDate: new Date('2024-03-28') },
      { id: 'm2', name: 'الربع الثاني', targetValue: 500000, targetDate: new Date('2024-06-30'), completed: true, completedDate: new Date('2024-06-25') },
      { id: 'm3', name: 'الربع الثالث', targetValue: 750000, targetDate: new Date('2024-09-30'), completed: true, completedDate: new Date('2024-09-28') },
      { id: 'm4', name: 'الربع الرابع', targetValue: 1000000, targetDate: new Date('2024-12-31'), completed: false },
    ],
    reminders: true,
    teamMembers: ['أحمد', 'سارة', 'محمد'],
    notes: 'التركيز على العملاء الجدد في الشرق الأوسط',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-11-15'),
  },
  {
    id: '2',
    name: 'خفض المصاريف التشغيلية',
    description: 'تقليل التكاليف التشغيلية بنسبة 15%',
    category: 'expenses',
    targetValue: 150000,
    currentValue: 120000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    period: 'yearly',
    status: 'at_risk',
    priority: 'medium',
    milestones: [
      { id: 'm1', name: 'مراجعة العقود', targetValue: 50000, targetDate: new Date('2024-04-30'), completed: true },
      { id: 'm2', name: 'تحسين العمليات', targetValue: 100000, targetDate: new Date('2024-08-31'), completed: true },
      { id: 'm3', name: 'الأتمتة', targetValue: 150000, targetDate: new Date('2024-12-31'), completed: false },
    ],
    reminders: true,
    teamMembers: ['خالد', 'نورة'],
    notes: 'البحث عن بدائل أقل تكلفة للموردين',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-11-10'),
  },
  {
    id: '3',
    name: 'اكتساب عملاء جدد',
    description: 'إضافة 100 عميل جديد هذا الربع',
    category: 'customers',
    targetValue: 100,
    currentValue: 85,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31'),
    period: 'quarterly',
    status: 'on_track',
    priority: 'high',
    milestones: [
      { id: 'm1', name: 'الشهر الأول', targetValue: 30, targetDate: new Date('2024-10-31'), completed: true },
      { id: 'm2', name: 'الشهر الثاني', targetValue: 65, targetDate: new Date('2024-11-30'), completed: true },
      { id: 'm3', name: 'الشهر الثالث', targetValue: 100, targetDate: new Date('2024-12-31'), completed: false },
    ],
    reminders: true,
    teamMembers: ['أحمد', 'ليلى'],
    notes: 'حملة تسويقية مكثفة على وسائل التواصل',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-20'),
  },
  {
    id: '4',
    name: 'تحسين هامش الربح',
    description: 'رفع هامش الربح الصافي إلى 20%',
    category: 'profit',
    targetValue: 20,
    currentValue: 18.5,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    period: 'yearly',
    status: 'on_track',
    priority: 'critical',
    milestones: [
      { id: 'm1', name: 'Q1', targetValue: 16, targetDate: new Date('2024-03-31'), completed: true },
      { id: 'm2', name: 'Q2', targetValue: 17.5, targetDate: new Date('2024-06-30'), completed: true },
      { id: 'm3', name: 'Q3', targetValue: 19, targetDate: new Date('2024-09-30'), completed: false },
      { id: 'm4', name: 'Q4', targetValue: 20, targetDate: new Date('2024-12-31'), completed: false },
    ],
    reminders: true,
    teamMembers: ['المدير المالي'],
    notes: 'تحسين الكفاءة وتقليل الهدر',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-11-18'),
  },
];

// Progress Ring Component
function ProgressRing({ progress, size = 80, strokeWidth = 8, color = 'primary' }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`text-${color}-500 transition-all duration-500`}
          style={{ color: `var(--${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// Goal Card Component
function GoalCard({ goal, onEdit, onDelete, onViewDetails }: {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onViewDetails: (goal: Goal) => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const config = categoryConfig[goal.category];
  const status = statusConfig[goal.status];
  const progress = Math.round((goal.currentValue / goal.targetValue) * 100);
  const daysRemaining = Math.ceil((goal.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const formatValue = (value: number) => {
    if (goal.category === 'profit') return `${value}%`;
    if (goal.category === 'customers' || goal.category === 'sales') return value.toLocaleString();
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${config.color}-100`}>
              <config.icon className={`h-5 w-5 text-${config.color}-600`} />
            </div>
            <div>
              <CardTitle className="text-base">{goal.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs bg-${status.color}-50 text-${status.color}-700 border-${status.color}-200`}>
                  <status.icon className="h-3 w-3 ml-1" />
                  {t(status.label)}
                </Badge>
                <Badge variant="outline" className={`text-xs bg-${priorityConfig[goal.priority].color}-50`}>
                  {t(priorityConfig[goal.priority].label)}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
              <DropdownMenuItem onClick={() => onViewDetails(goal)}>
                <Eye className="h-4 w-4 ml-2" />
                {t('goals.viewDetails')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit2 className="h-4 w-4 ml-2" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 ml-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{goal.description}</p>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('goals.progress')}</span>
            <span className="font-medium">{formatValue(goal.currentValue)} / {formatValue(goal.targetValue)}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress}% {t('goals.complete')}</span>
            <span className={daysRemaining < 0 ? 'text-red-500' : ''}>
              {daysRemaining < 0 
                ? t('goals.overdue', { days: Math.abs(daysRemaining) })
                : t('goals.daysRemaining', { days: daysRemaining })
              }
            </span>
          </div>
        </div>

        {/* Milestones Preview */}
        <div className="flex items-center gap-1">
          {goal.milestones.map((milestone, index) => (
            <TooltipProvider key={milestone.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex-1 h-2 rounded-full ${
                      milestone.completed ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{milestone.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {milestone.completed ? t('goals.completed') : t('goals.pending')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Team */}
        {goal.teamMembers.length > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {goal.teamMembers.slice(0, 2).join('، ')}
              {goal.teamMembers.length > 2 && ` +${goal.teamMembers.length - 2}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GoalsTracker() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';

  // State
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [activeTab, setActiveTab] = useState('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);

  // Calculate stats
  const stats: GoalStats = useMemo(() => {
    const completed = goals.filter(g => g.status === 'completed').length;
    const onTrack = goals.filter(g => g.status === 'on_track').length;
    const atRisk = goals.filter(g => g.status === 'at_risk').length;
    const behind = goals.filter(g => g.status === 'behind').length;
    const avgProgress = goals.reduce((acc, g) => acc + (g.currentValue / g.targetValue) * 100, 0) / goals.length;

    return {
      totalGoals: goals.length,
      completedGoals: completed,
      onTrackGoals: onTrack,
      atRiskGoals: atRisk,
      behindGoals: behind,
      averageProgress: avgProgress,
    };
  }, [goals]);

  // Filter goals
  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      if (!showCompleted && goal.status === 'completed') return false;
      if (filterCategory !== 'all' && goal.category !== filterCategory) return false;
      if (filterStatus !== 'all' && goal.status !== filterStatus) return false;
      if (filterPriority !== 'all' && goal.priority !== filterPriority) return false;
      if (searchQuery && !goal.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [goals, filterCategory, filterStatus, filterPriority, searchQuery, showCompleted]);

  // Handlers
  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast({
      title: t('goals.deleted'),
      description: t('goals.deletedDesc'),
    });
  };

  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailsOpen(true);
  };

  const handleAddGoal = () => {
    setSelectedGoal(null);
    setIsDialogOpen(true);
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            {t('goals.title', 'متتبع الأهداف')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('goals.subtitle', 'حدد أهدافك وتتبع تقدمك نحو تحقيقها')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddGoal}>
            <Plus className="h-4 w-4 ml-2" />
            {t('goals.addGoal', 'إضافة هدف')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalGoals}</p>
                <p className="text-xs text-muted-foreground">{t('goals.stats.total')}</p>
              </div>
              <Target className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completedGoals}</p>
                <p className="text-xs text-muted-foreground">{t('goals.stats.completed')}</p>
              </div>
              <Award className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.onTrackGoals}</p>
                <p className="text-xs text-muted-foreground">{t('goals.stats.onTrack')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.atRiskGoals}</p>
                <p className="text-xs text-muted-foreground">{t('goals.stats.atRisk')}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.behindGoals}</p>
                <p className="text-xs text-muted-foreground">{t('goals.stats.behind')}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</p>
                <p className="text-xs text-muted-foreground">{t('goals.stats.avgProgress')}</p>
              </div>
              <ProgressRing progress={stats.averageProgress} size={40} strokeWidth={4} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={t('goals.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={t('goals.filterCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {t(config.label)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={t('goals.filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {t(config.label)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={t('goals.filterPriority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{t(config.label)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="showCompleted"
                checked={showCompleted}
                onCheckedChange={setShowCompleted}
              />
              <Label htmlFor="showCompleted" className="text-sm whitespace-nowrap">
                {t('goals.showCompleted')}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {t('goals.noGoals', 'لا توجد أهداف')}
            </p>
            <Button variant="outline" className="mt-4" onClick={handleAddGoal}>
              <Plus className="h-4 w-4 ml-2" />
              {t('goals.addFirstGoal', 'أضف هدفك الأول')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goal Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          {selectedGoal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(categoryConfig[selectedGoal.category].icon, { className: "h-5 w-5" })}
                  {selectedGoal.name}
                </DialogTitle>
                <DialogDescription>{selectedGoal.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="flex items-center justify-center py-4">
                  <ProgressRing
                    progress={(selectedGoal.currentValue / selectedGoal.targetValue) * 100}
                    size={120}
                    strokeWidth={12}
                  />
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-medium mb-3">{t('goals.milestones')}</h4>
                  <div className="space-y-2">
                    {selectedGoal.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          milestone.completed ? 'bg-green-50' : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {milestone.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{milestone.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(milestone.targetDate).toLocaleDateString(isRTL ? 'ar' : 'en')}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {selectedGoal.category === 'profit' 
                            ? `${milestone.targetValue}%`
                            : milestone.targetValue.toLocaleString()
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedGoal.notes && (
                  <div>
                    <h4 className="font-medium mb-2">{t('goals.notes')}</h4>
                    <p className="text-muted-foreground">{selectedGoal.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  {t('common.close')}
                </Button>
                <Button onClick={() => {
                  setIsDetailsOpen(false);
                  handleEdit(selectedGoal);
                }}>
                  <Edit2 className="h-4 w-4 ml-2" />
                  {t('common.edit')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GoalsTracker;
