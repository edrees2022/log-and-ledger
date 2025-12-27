/**
 * Notifications System
 * Real-time notifications with categories and actions
 */
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Bell,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Users,
  Package,
  Settings,
  Trash2,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Notification Types
export type NotificationType = 
  | 'invoice_overdue'
  | 'invoice_paid'
  | 'payment_received'
  | 'payment_due'
  | 'low_stock'
  | 'new_order'
  | 'approval_required'
  | 'system'
  | 'reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

// Notification Icons
const notificationIcons: Record<NotificationType, React.ReactNode> = {
  invoice_overdue: <AlertTriangle className="h-5 w-5 text-red-500" />,
  invoice_paid: <CheckCircle className="h-5 w-5 text-green-500" />,
  payment_received: <DollarSign className="h-5 w-5 text-green-500" />,
  payment_due: <Clock className="h-5 w-5 text-yellow-500" />,
  low_stock: <Package className="h-5 w-5 text-orange-500" />,
  new_order: <FileText className="h-5 w-5 text-blue-500" />,
  approval_required: <Users className="h-5 w-5 text-purple-500" />,
  system: <Settings className="h-5 w-5 text-gray-500" />,
  reminder: <Bell className="h-5 w-5 text-blue-500" />,
};

// Priority Colors
const priorityColors: Record<NotificationPriority, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-yellow-100 text-yellow-600',
  urgent: 'bg-red-100 text-red-600',
};

// Context for global notifications
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}

// Generate mock notifications for demo
function generateMockNotifications(): Notification[] {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'invoice_overdue',
      title: 'Invoice Overdue',
      message: 'Invoice #INV-2024-0156 is 7 days overdue. Amount: $2,500.00',
      priority: 'urgent',
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 30), // 30 mins ago
      actionUrl: '/sales/invoices/1',
      actionLabel: 'View Invoice',
    },
    {
      id: '2',
      type: 'payment_received',
      title: 'Payment Received',
      message: 'Received $5,000.00 from ABC Company for Invoice #INV-2024-0155',
      priority: 'medium',
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
      actionUrl: '/banking/receipts',
    },
    {
      id: '3',
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Product "Widget Pro" is running low. Only 5 units remaining.',
      priority: 'high',
      read: false,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
      actionUrl: '/inventory',
    },
    {
      id: '4',
      type: 'approval_required',
      title: 'Approval Required',
      message: 'Purchase Order #PO-2024-089 requires your approval. Amount: $12,000.00',
      priority: 'high',
      read: true,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
      actionUrl: '/approvals',
    },
    {
      id: '5',
      type: 'system',
      title: 'Backup Complete',
      message: 'Your daily backup completed successfully.',
      priority: 'low',
      read: true,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    },
  ];
}

// Provider Component
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(generateMockNotifications());

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    },
    []
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// Notification Bell Component
export function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.type === activeTab;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });
    if (hours < 24) return t('notifications.hoursAgo', { count: hours });
    return t('notifications.daysAgo', { count: days });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -end-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('notifications.title')}
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount}</Badge>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              {t('notifications.all')}
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              {t('notifications.unread')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    {t('notifications.noNotifications')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={() => markAsRead(notification.id)}
                      onDelete={() => deleteNotification(notification.id)}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Single Notification Item
interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
  formatTime: (date: Date) => string;
}

function NotificationItem({
  notification,
  onRead,
  onDelete,
  formatTime,
}: NotificationItemProps) {
  const { t } = useTranslation();
  const [, setLocation] = useState('');

  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-colors cursor-pointer',
        notification.read
          ? 'bg-background hover:bg-muted/50'
          : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {notificationIcons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn('font-medium', !notification.read && 'text-primary')}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {notification.message}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!notification.read && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRead(); }}>
                    <Check className="h-4 w-4 me-2" />
                    {t('notifications.markRead')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 me-2" />
                  {t('common.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn('text-xs', priorityColors[notification.priority])}>
              {t(`notifications.priority.${notification.priority}`)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTime(notification.createdAt)}
            </span>
          </div>
          {notification.actionLabel && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 mt-2 gap-1 underline"
              onClick={handleClick}
            >
              {notification.actionLabel}
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast-style notification for real-time alerts
export function NotificationToast({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 end-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-background border rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex gap-3">
          {notificationIcons[notification.type]}
          <div className="flex-1">
            <p className="font-medium">{notification.title}</p>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
