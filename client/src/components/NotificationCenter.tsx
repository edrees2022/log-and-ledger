import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  BellOff,
  BellRing,
  Check,
  X,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Filter,
  Settings,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Mail,
  Smartphone,
  Calendar,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Package,
  CreditCard,
  Building2,
  Zap,
  RefreshCw,
  ChevronRight,
  Archive,
  Star,
  StarOff,
  Bookmark,
  Search
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'reminder';
type NotificationCategory = 'invoice' | 'payment' | 'expense' | 'inventory' | 'customer' | 'report' | 'system' | 'goal';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  archived: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  email: boolean;
  push: boolean;
  categories: Record<NotificationCategory, boolean>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

// Type configurations
const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bgColor: string }> = {
  info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  success: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  error: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  reminder: { icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

// Category configurations
const categoryConfig: Record<NotificationCategory, { icon: React.ElementType; label: string }> = {
  invoice: { icon: FileText, label: 'notifications.categories.invoice' },
  payment: { icon: CreditCard, label: 'notifications.categories.payment' },
  expense: { icon: DollarSign, label: 'notifications.categories.expense' },
  inventory: { icon: Package, label: 'notifications.categories.inventory' },
  customer: { icon: Users, label: 'notifications.categories.customer' },
  report: { icon: TrendingUp, label: 'notifications.categories.report' },
  system: { icon: Settings, label: 'notifications.categories.system' },
  goal: { icon: Zap, label: 'notifications.categories.goal' },
};

// Priority configurations
const priorityConfig: Record<NotificationPriority, { color: string; label: string }> = {
  low: { color: 'gray', label: 'notifications.priority.low' },
  medium: { color: 'blue', label: 'notifications.priority.medium' },
  high: { color: 'orange', label: 'notifications.priority.high' },
  urgent: { color: 'red', label: 'notifications.priority.urgent' },
};

// Sample notifications
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'فاتورة جديدة مستحقة',
    message: 'الفاتورة INV-2024-0156 بقيمة 15,000 ريال مستحقة خلال 3 أيام',
    type: 'warning',
    category: 'invoice',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    starred: true,
    archived: false,
    actionUrl: '/sales/invoices/156',
    actionLabel: 'عرض الفاتورة',
  },
  {
    id: '2',
    title: 'تم استلام دفعة',
    message: 'تم استلام دفعة بقيمة 25,000 ريال من شركة التقنية المتقدمة',
    type: 'success',
    category: 'payment',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    starred: false,
    archived: false,
    actionUrl: '/banking/receipts/89',
    actionLabel: 'عرض الإيصال',
  },
  {
    id: '3',
    title: 'تنبيه المخزون',
    message: 'المنتج "لابتوب HP ProBook" وصل للحد الأدنى (5 وحدات متبقية)',
    type: 'warning',
    category: 'inventory',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    starred: false,
    archived: false,
    actionUrl: '/items',
    actionLabel: 'إدارة المخزون',
  },
  {
    id: '4',
    title: 'تحقيق الهدف الشهري',
    message: 'تهانينا! تم تحقيق هدف المبيعات الشهري بنسبة 105%',
    type: 'success',
    category: 'goal',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    starred: true,
    archived: false,
  },
  {
    id: '5',
    title: 'فاتورة متأخرة',
    message: 'الفاتورة INV-2024-0089 متأخرة منذ 15 يوم - المبلغ المستحق: 8,500 ريال',
    type: 'error',
    category: 'invoice',
    priority: 'urgent',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: false,
    starred: false,
    archived: false,
    actionUrl: '/sales/invoices/89',
    actionLabel: 'عرض الفاتورة',
  },
  {
    id: '6',
    title: 'تذكير: اجتماع مراجعة الميزانية',
    message: 'اجتماع مراجعة الميزانية الربعية غداً الساعة 10:00 صباحاً',
    type: 'reminder',
    category: 'report',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    starred: false,
    archived: false,
  },
  {
    id: '7',
    title: 'عميل جديد',
    message: 'تم إضافة عميل جديد: مؤسسة النجاح للتجارة',
    type: 'info',
    category: 'customer',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
    read: true,
    starred: false,
    archived: false,
    actionUrl: '/contacts',
    actionLabel: 'عرض العميل',
  },
  {
    id: '8',
    title: 'تحديث النظام',
    message: 'تم تحديث النظام بنجاح إلى الإصدار 2.5.0 مع ميزات جديدة',
    type: 'info',
    category: 'system',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    read: true,
    starred: false,
    archived: true,
  },
];

// Notification Item Component
function NotificationItem({ 
  notification, 
  onRead, 
  onStar, 
  onArchive, 
  onDelete 
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onStar: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const config = typeConfig[notification.type];
  const categoryInfo = categoryConfig[notification.category];
  const dateLocale = isRTL ? ar : enUS;

  return (
    <div
      className={`p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
          <config.icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {notification.title}
                </h4>
                {notification.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                {!notification.read && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-xs">
                  <categoryInfo.icon className="h-3 w-3 ml-1" />
                  {t(categoryInfo.label)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: dateLocale })}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                {!notification.read && (
                  <DropdownMenuItem onClick={() => onRead(notification.id)}>
                    <Check className="h-4 w-4 ml-2" />
                    {t('notifications.markAsRead')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onStar(notification.id)}>
                  {notification.starred ? (
                    <>
                      <StarOff className="h-4 w-4 ml-2" />
                      {t('notifications.unstar')}
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 ml-2" />
                      {t('notifications.star')}
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(notification.id)}>
                  <Archive className="h-4 w-4 ml-2" />
                  {t('notifications.archive')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(notification.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 ml-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {notification.actionUrl && (
            <a href={notification.actionUrl} className="inline-flex items-center text-sm text-primary hover:underline mt-2">
              {notification.actionLabel}
              <ChevronRight className="h-4 w-4 mr-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';

  // State
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    email: true,
    push: true,
    categories: {
      invoice: true,
      payment: true,
      expense: true,
      inventory: true,
      customer: true,
      report: true,
      system: true,
      goal: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  // Stats
  const stats = useMemo(() => {
    const unread = notifications.filter(n => !n.read && !n.archived).length;
    const starred = notifications.filter(n => n.starred && !n.archived).length;
    const archived = notifications.filter(n => n.archived).length;
    const urgent = notifications.filter(n => n.priority === 'urgent' && !n.read && !n.archived).length;
    return { unread, starred, archived, urgent };
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Tab filter
      if (activeTab === 'unread' && (n.read || n.archived)) return false;
      if (activeTab === 'starred' && (!n.starred || n.archived)) return false;
      if (activeTab === 'archived' && !n.archived) return false;
      if (activeTab === 'all' && n.archived) return false;

      // Type filter
      if (filterType !== 'all' && n.type !== filterType) return false;

      // Category filter
      if (filterCategory !== 'all' && n.category !== filterCategory) return false;

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query);
      }

      return true;
    });
  }, [notifications, activeTab, filterType, filterCategory, searchQuery]);

  // Handlers
  const handleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleStar = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
  };

  const handleArchive = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, archived: true } : n));
    toast({
      title: t('notifications.archived'),
      description: t('notifications.archivedDesc'),
    });
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: t('notifications.deleted'),
      description: t('notifications.deletedDesc'),
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: t('notifications.allRead'),
      description: t('notifications.allReadDesc'),
    });
  };

  const handleClearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, archived: true })));
    toast({
      title: t('notifications.cleared'),
      description: t('notifications.clearedDesc'),
    });
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            {t('notifications.title', 'مركز الإشعارات')}
            {stats.unread > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {stats.unread}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('notifications.subtitle', 'تتبع جميع التنبيهات والإشعارات المهمة')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 ml-2" />
              {t('notifications.markAllRead')}
            </Button>
          )}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('notifications.settings')}</DialogTitle>
                <DialogDescription>{t('notifications.settingsDesc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* General Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('notifications.enabled')}</Label>
                      <p className="text-sm text-muted-foreground">{t('notifications.enabledDesc')}</p>
                    </div>
                    <Switch
                      checked={settings.enabled}
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, enabled: v }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <Label>{t('notifications.sound')}</Label>
                    </div>
                    <Switch
                      checked={settings.sound}
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, sound: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label>{t('notifications.email')}</Label>
                    </div>
                    <Switch
                      checked={settings.email}
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, email: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label>{t('notifications.push')}</Label>
                    </div>
                    <Switch
                      checked={settings.push}
                      onCheckedChange={(v) => setSettings(prev => ({ ...prev, push: v }))}
                    />
                  </div>
                </div>

                <Separator />

                {/* Quiet Hours */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('notifications.quietHours')}</Label>
                      <p className="text-sm text-muted-foreground">{t('notifications.quietHoursDesc')}</p>
                    </div>
                    <Switch
                      checked={settings.quietHours.enabled}
                      onCheckedChange={(v) => setSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: v }
                      }))}
                    />
                  </div>
                  {settings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">{t('notifications.from')}</Label>
                        <Input
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, start: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('notifications.to')}</Label>
                        <Input
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, end: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setSettingsOpen(false)}>
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab('unread')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.unread}</p>
                <p className="text-xs text-muted-foreground">{t('notifications.stats.unread')}</p>
              </div>
              <BellRing className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab('starred')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.starred}</p>
                <p className="text-xs text-muted-foreground">{t('notifications.stats.starred')}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                <p className="text-xs text-muted-foreground">{t('notifications.stats.urgent')}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setActiveTab('archived')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
                <p className="text-xs text-muted-foreground">{t('notifications.stats.archived')}</p>
              </div>
              <Archive className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList>
                <TabsTrigger value="all">
                  {t('notifications.tabs.all')}
                </TabsTrigger>
                <TabsTrigger value="unread" className="gap-1">
                  {t('notifications.tabs.unread')}
                  {stats.unread > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5">
                      {stats.unread}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="starred">
                  {t('notifications.tabs.starred')}
                </TabsTrigger>
                <TabsTrigger value="archived">
                  {t('notifications.tabs.archived')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('notifications.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pr-9"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder={t('notifications.filterCategory')} />
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
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={handleRead}
                  onStar={handleStar}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <BellOff className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  {t('notifications.noNotifications')}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        {filteredNotifications.length > 0 && (
          <CardFooter className="border-t pt-4 justify-center">
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <Archive className="h-4 w-4 ml-2" />
              {t('notifications.archiveAll')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default NotificationCenter;
