/**
 * Realtime Notifications Component
 * Enterprise-grade notification system with sound and badges
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Volume2,
  VolumeX,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  category?: 'invoice' | 'bill' | 'payment' | 'inventory' | 'system';
}

interface NotificationsProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: Notification) => void;
  maxDisplay?: number;
}

export function RealtimeNotifications({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onClearAll,
  onNotificationClick,
  maxDisplay = 50,
}: NotificationsProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notification-sound');
    return saved !== 'false';
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousCount = useRef(notifications.filter(n => !n.read).length);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = notifications.slice(0, maxDisplay);

  // Play sound on new notification
  useEffect(() => {
    if (soundEnabled && unreadCount > previousCount.current) {
      playNotificationSound();
    }
    previousCount.current = unreadCount;
  }, [unreadCount, soundEnabled]);

  const playNotificationSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1tbF5ygYuSjn1sXGVugIuRhnRpZ3WAiIx/c29+h4eAfnyDhoSAfYGFhoR/fYKGh4R/fIGGiIV+e4CIiYV+e4CGiYiDfXuBiIqGfXp/h4qIhHp5foiMioV4d3+JjIyFdnZ9i5CNhXVzeouSjoNzc3mLlJCAdHV4i5aRfnN1eIuXkn5xdHiLl5J+cHN3i5iUfm9ydYuZlH5tc3SMmpV9bHNzjJqVfWxzc4yalX1sc3OMmpV9bHNzjJqVfWxzc4yalX1sc3OMmpV9bHJyAA==');
      }
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // Audio play failed - likely due to autoplay policy
      });
    } catch {
      // Audio not supported
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('notification-sound', String(newValue));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category?: Notification['category']) => {
    switch (category) {
      case 'invoice':
        return <FileText className="h-3 w-3" />;
      case 'bill':
        return <FileText className="h-3 w-3" />;
      case 'payment':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('notifications.justNow', 'Just now');
    if (minutes < 60) return t('notifications.minutesAgo', '{{minutes}}m ago', { minutes });
    if (hours < 24) return t('notifications.hoursAgo', '{{hours}}h ago', { hours });
    return t('notifications.daysAgo', '{{days}}d ago', { days });
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h4 className="font-semibold">{t('notifications.title', 'Notifications')}</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSound}
              title={soundEnabled ? t('notifications.muteSound', 'Mute') : t('notifications.enableSound', 'Enable sound')}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Notification List */}
        <ScrollArea className="h-[400px]">
          {displayNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BellOff className="h-12 w-12 mb-4" />
              <p>{t('notifications.empty', 'No notifications')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notification.read && "bg-muted/30"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {notification.category && getCategoryIcon(notification.category)}
                        <span>{formatTime(notification.timestamp)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {displayNotifications.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {t('notifications.markAllRead', 'Mark all read')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('notifications.clearAll', 'Clear all')}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Hook for managing notifications state
 */
export function useNotifications(maxNotifications = 100) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    return newNotification.id;
  }, [maxNotifications]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    markRead,
    markAllRead,
    deleteNotification,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length,
  };
}
