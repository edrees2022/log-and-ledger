import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Filter,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  FileText,
  CreditCard,
  DollarSign,
  Users,
  Building2,
  CalendarDays,
  CalendarClock,
  Repeat,
  ArrowRight,
  ChevronRight,
  Settings,
  Bell,
  BellOff,
  Zap,
  History,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type RecurringType = 'invoice' | 'bill' | 'expense' | 'journal' | 'payment';
type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
type RecurringStatus = 'active' | 'paused' | 'completed' | 'cancelled';

interface RecurringTemplate {
  id: string;
  name: string;
  type: RecurringType;
  frequency: Frequency;
  amount: number;
  currency: string;
  contactId?: string;
  contactName?: string;
  description: string;
  status: RecurringStatus;
  startDate: Date;
  endDate?: Date;
  nextRunDate: Date;
  lastRunDate?: Date;
  totalRuns: number;
  maxRuns?: number;
  notifyBefore: number; // days before
  autoApprove: boolean;
  items?: RecurringLineItem[];
  history: RecurringHistory[];
  createdAt: Date;
  updatedAt: Date;
}

interface RecurringLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

interface RecurringHistory {
  id: string;
  date: Date;
  status: 'success' | 'failed' | 'skipped';
  documentId?: string;
  documentNumber?: string;
  amount: number;
  notes?: string;
}

// Type configurations
const typeConfig: Record<RecurringType, { icon: React.ElementType; color: string; label: string }> = {
  invoice: { icon: FileText, color: 'blue', label: 'recurring.types.invoice' },
  bill: { icon: CreditCard, color: 'orange', label: 'recurring.types.bill' },
  expense: { icon: DollarSign, color: 'red', label: 'recurring.types.expense' },
  journal: { icon: FileText, color: 'purple', label: 'recurring.types.journal' },
  payment: { icon: CreditCard, color: 'green', label: 'recurring.types.payment' },
};

// Frequency configurations
const frequencyConfig: Record<Frequency, { label: string; days: number }> = {
  daily: { label: 'recurring.frequency.daily', days: 1 },
  weekly: { label: 'recurring.frequency.weekly', days: 7 },
  biweekly: { label: 'recurring.frequency.biweekly', days: 14 },
  monthly: { label: 'recurring.frequency.monthly', days: 30 },
  quarterly: { label: 'recurring.frequency.quarterly', days: 90 },
  yearly: { label: 'recurring.frequency.yearly', days: 365 },
};

// Status configurations
const statusConfig: Record<RecurringStatus, { color: string; icon: React.ElementType; label: string }> = {
  active: { color: 'green', icon: Play, label: 'recurring.status.active' },
  paused: { color: 'yellow', icon: Pause, label: 'recurring.status.paused' },
  completed: { color: 'blue', icon: CheckCircle, label: 'recurring.status.completed' },
  cancelled: { color: 'red', icon: XCircle, label: 'recurring.status.cancelled' },
};

// Sample data
const sampleTemplates: RecurringTemplate[] = [
  {
    id: '1',
    name: 'إيجار المكتب الشهري',
    type: 'expense',
    frequency: 'monthly',
    amount: 15000,
    currency: 'SAR',
    contactName: 'شركة العقارات المتحدة',
    description: 'إيجار المكتب الرئيسي - الطابق الخامس',
    status: 'active',
    startDate: new Date('2024-01-01'),
    nextRunDate: new Date('2024-12-01'),
    lastRunDate: new Date('2024-11-01'),
    totalRuns: 11,
    notifyBefore: 3,
    autoApprove: true,
    history: [
      { id: 'h1', date: new Date('2024-11-01'), status: 'success', documentId: 'exp-89', documentNumber: 'EXP-2024-089', amount: 15000 },
      { id: 'h2', date: new Date('2024-10-01'), status: 'success', documentId: 'exp-78', documentNumber: 'EXP-2024-078', amount: 15000 },
      { id: 'h3', date: new Date('2024-09-01'), status: 'success', documentId: 'exp-67', documentNumber: 'EXP-2024-067', amount: 15000 },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: '2',
    name: 'فاتورة خدمات شهرية - العميل أ',
    type: 'invoice',
    frequency: 'monthly',
    amount: 25000,
    currency: 'SAR',
    contactId: 'cust-1',
    contactName: 'شركة التقنية المتقدمة',
    description: 'خدمات الدعم الفني والصيانة الشهرية',
    status: 'active',
    startDate: new Date('2024-03-01'),
    nextRunDate: new Date('2024-12-01'),
    lastRunDate: new Date('2024-11-01'),
    totalRuns: 9,
    notifyBefore: 5,
    autoApprove: false,
    items: [
      { id: 'i1', description: 'دعم فني - 40 ساعة', quantity: 40, unitPrice: 500, taxRate: 15, total: 23000 },
      { id: 'i2', description: 'صيانة وقائية', quantity: 1, unitPrice: 2000, taxRate: 15, total: 2300 },
    ],
    history: [
      { id: 'h1', date: new Date('2024-11-01'), status: 'success', documentId: 'inv-156', documentNumber: 'INV-2024-0156', amount: 25000 },
      { id: 'h2', date: new Date('2024-10-01'), status: 'success', documentId: 'inv-145', documentNumber: 'INV-2024-0145', amount: 25000 },
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: '3',
    name: 'اشتراك برامج سنوي',
    type: 'bill',
    frequency: 'yearly',
    amount: 12000,
    currency: 'SAR',
    contactName: 'مايكروسوفت',
    description: 'اشتراك Office 365 Business',
    status: 'active',
    startDate: new Date('2024-01-15'),
    nextRunDate: new Date('2025-01-15'),
    lastRunDate: new Date('2024-01-15'),
    totalRuns: 1,
    notifyBefore: 30,
    autoApprove: false,
    history: [
      { id: 'h1', date: new Date('2024-01-15'), status: 'success', documentId: 'bill-12', documentNumber: 'BILL-2024-012', amount: 12000 },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '4',
    name: 'رواتب الموظفين',
    type: 'expense',
    frequency: 'monthly',
    amount: 150000,
    currency: 'SAR',
    description: 'رواتب الموظفين - نهاية الشهر',
    status: 'active',
    startDate: new Date('2024-01-25'),
    nextRunDate: new Date('2024-11-25'),
    lastRunDate: new Date('2024-10-25'),
    totalRuns: 10,
    notifyBefore: 5,
    autoApprove: true,
    history: [
      { id: 'h1', date: new Date('2024-10-25'), status: 'success', documentId: 'exp-95', documentNumber: 'EXP-2024-095', amount: 150000 },
      { id: 'h2', date: new Date('2024-09-25'), status: 'success', documentId: 'exp-84', documentNumber: 'EXP-2024-084', amount: 150000 },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-25'),
  },
  {
    id: '5',
    name: 'فاتورة ربع سنوية',
    type: 'invoice',
    frequency: 'quarterly',
    amount: 75000,
    currency: 'SAR',
    contactName: 'مجموعة الاستثمار العربي',
    description: 'خدمات استشارية ربع سنوية',
    status: 'paused',
    startDate: new Date('2024-01-01'),
    nextRunDate: new Date('2025-01-01'),
    lastRunDate: new Date('2024-10-01'),
    totalRuns: 4,
    notifyBefore: 7,
    autoApprove: false,
    history: [
      { id: 'h1', date: new Date('2024-10-01'), status: 'success', documentId: 'inv-134', documentNumber: 'INV-2024-0134', amount: 75000 },
      { id: 'h2', date: new Date('2024-07-01'), status: 'success', documentId: 'inv-98', documentNumber: 'INV-2024-0098', amount: 75000 },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-15'),
  },
];

// Template Card Component
function TemplateCard({ template, onEdit, onDelete, onToggleStatus, onViewHistory }: {
  template: RecurringTemplate;
  onEdit: (template: RecurringTemplate) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onViewHistory: (template: RecurringTemplate) => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;
  const config = typeConfig[template.type];
  const status = statusConfig[template.status];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: template.currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const daysUntilNext = Math.ceil((template.nextRunDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${config.color}-100`}>
              <config.icon className={`h-5 w-5 text-${config.color}-600`} />
            </div>
            <div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`text-xs bg-${status.color}-50 text-${status.color}-700`}>
                  <status.icon className="h-3 w-3 ml-1" />
                  {t(status.label)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {t(frequencyConfig[template.frequency].label)}
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
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Edit2 className="h-4 w-4 ml-2" />
                {t('common.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewHistory(template)}>
                <History className="h-4 w-4 ml-2" />
                {t('recurring.viewHistory')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(template.id)}>
                {template.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 ml-2" />
                    {t('recurring.pause')}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 ml-2" />
                    {t('recurring.resume')}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(template.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 ml-2" />
                {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        
        {/* Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{t('recurring.amount')}</span>
          <span className="text-lg font-bold">{formatCurrency(template.amount)}</span>
        </div>

        {/* Contact */}
        {template.contactName && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{template.contactName}</span>
          </div>
        )}

        {/* Next Run */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('recurring.nextRun')}</span>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <span className={daysUntilNext <= 3 ? 'text-orange-600 font-medium' : ''}>
              {format(template.nextRunDate, 'dd MMM yyyy', { locale: dateLocale })}
            </span>
            {daysUntilNext <= 7 && daysUntilNext > 0 && (
              <Badge variant="outline" className="text-xs">
                {t('recurring.daysLeft', { days: daysUntilNext })}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>{t('recurring.totalRuns', { count: template.totalRuns })}</span>
          <span className="flex items-center gap-1">
            <Repeat className="h-3 w-3" />
            {template.autoApprove ? t('recurring.autoApprove') : t('recurring.manualApprove')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecurringManager() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [templates, setTemplates] = useState<RecurringTemplate[]>(sampleTemplates);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<RecurringTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const active = templates.filter(t => t.status === 'active').length;
    const paused = templates.filter(t => t.status === 'paused').length;
    const totalMonthly = templates
      .filter(t => t.status === 'active')
      .reduce((sum, t) => {
        const multiplier = t.frequency === 'daily' ? 30 
          : t.frequency === 'weekly' ? 4 
          : t.frequency === 'biweekly' ? 2 
          : t.frequency === 'monthly' ? 1 
          : t.frequency === 'quarterly' ? 1/3 
          : 1/12;
        return sum + (t.amount * multiplier);
      }, 0);
    const upcomingThisWeek = templates.filter(t => {
      const daysUntil = Math.ceil((t.nextRunDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return t.status === 'active' && daysUntil >= 0 && daysUntil <= 7;
    }).length;

    return { active, paused, totalMonthly, upcomingThisWeek };
  }, [templates]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(query) || 
               t.description.toLowerCase().includes(query) ||
               t.contactName?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [templates, filterType, filterStatus, searchQuery]);

  // Handlers
  const handleEdit = (template: RecurringTemplate) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: t('recurring.deleted'),
      description: t('recurring.deletedDesc'),
    });
  };

  const handleToggleStatus = (id: string) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'active' ? 'paused' : 'active';
        return { ...t, status: newStatus };
      }
      return t;
    }));
    toast({
      title: t('recurring.statusUpdated'),
      description: t('recurring.statusUpdatedDesc'),
    });
  };

  const handleViewHistory = (template: RecurringTemplate) => {
    setSelectedTemplate(template);
    setIsHistoryOpen(true);
  };

  const handleAddTemplate = () => {
    setSelectedTemplate(null);
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency = 'SAR') => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Repeat className="h-6 w-6 text-primary" />
            {t('recurring.title', 'المعاملات المتكررة')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('recurring.subtitle', 'إدارة الفواتير والمصروفات المتكررة تلقائياً')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleAddTemplate}>
            <Plus className="h-4 w-4 ml-2" />
            {t('recurring.addTemplate', 'إضافة قالب')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-muted-foreground">{t('recurring.stats.active')}</p>
              </div>
              <Play className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.paused}</p>
                <p className="text-xs text-muted-foreground">{t('recurring.stats.paused')}</p>
              </div>
              <Pause className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalMonthly)}</p>
                <p className="text-xs text-muted-foreground">{t('recurring.stats.monthlyTotal')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.upcomingThisWeek}</p>
                <p className="text-xs text-muted-foreground">{t('recurring.stats.upcomingWeek')}</p>
              </div>
              <CalendarClock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('recurring.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={t('recurring.filterType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
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
                <SelectValue placeholder={t('recurring.filterStatus')} />
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
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      {filteredTemplates.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onViewHistory={handleViewHistory}
              />
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('recurring.name')}</TableHead>
                  <TableHead>{t('recurring.type')}</TableHead>
                  <TableHead>{t('recurring.frequency')}</TableHead>
                  <TableHead>{t('recurring.amount')}</TableHead>
                  <TableHead>{t('recurring.nextRun')}</TableHead>
                  <TableHead>{t('recurring.status')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map(template => {
                  const config = typeConfig[template.type];
                  const status = statusConfig[template.status];
                  return (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <config.icon className="h-3 w-3" />
                          {t(config.label)}
                        </Badge>
                      </TableCell>
                      <TableCell>{t(frequencyConfig[template.frequency].label)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(template.amount, template.currency)}</TableCell>
                      <TableCell>{format(template.nextRunDate, 'dd/MM/yyyy', { locale: dateLocale })}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`bg-${status.color}-50 text-${status.color}-700`}>
                          <status.icon className="h-3 w-3 ml-1" />
                          {t(status.label)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Edit2 className="h-4 w-4 ml-2" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewHistory(template)}>
                              <History className="h-4 w-4 ml-2" />
                              {t('recurring.viewHistory')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4 ml-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Repeat className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">
              {t('recurring.noTemplates', 'لا توجد معاملات متكررة')}
            </p>
            <Button variant="outline" className="mt-4" onClick={handleAddTemplate}>
              <Plus className="h-4 w-4 ml-2" />
              {t('recurring.addFirst', 'أضف أول معاملة متكررة')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  {t('recurring.history')} - {selectedTemplate.name}
                </DialogTitle>
                <DialogDescription>
                  {t('recurring.historyDesc', { count: selectedTemplate.history.length })}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {selectedTemplate.history.map(entry => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.status === 'success' ? 'bg-green-50' :
                        entry.status === 'failed' ? 'bg-red-50' : 'bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {entry.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : entry.status === 'failed' ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {entry.documentNumber || format(entry.date, 'dd MMM yyyy', { locale: dateLocale })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(entry.date, 'dd MMM yyyy', { locale: dateLocale })}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(entry.amount, selectedTemplate.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
                  {t('common.close')}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RecurringManager;
