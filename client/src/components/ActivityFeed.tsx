import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  FileText,
  Users,
  Package,
  Receipt,
  CreditCard,
  Calculator,
  Wallet,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ArrowRight,
  Clock,
  Filter,
  Calendar,
  RefreshCw,
  Download,
  User,
  Building2,
  Briefcase,
  BarChart3,
} from "lucide-react";
import { format, formatDistanceToNow, subDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: "create" | "update" | "delete" | "view" | "export" | "email" | "payment" | "status_change";
  entityType: "invoice" | "contact" | "item" | "expense" | "payment" | "journal" | "project" | "account" | "report" | "settings";
  entityId: string | number;
  entityName: string;
  description: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  entityType?: string;
  entityId?: string | number;
  userId?: string;
  limit?: number;
  showFilters?: boolean;
  maxHeight?: string;
}

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "create",
    entityType: "invoice",
    entityId: "INV-001",
    entityName: "فاتورة #INV-001",
    description: "تم إنشاء فاتورة جديدة",
    user: { id: "1", name: "أحمد محمد" },
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    metadata: { amount: 5000, currency: "SAR" },
  },
  {
    id: "2",
    type: "update",
    entityType: "contact",
    entityId: "1",
    entityName: "شركة التقنية المتقدمة",
    description: "تم تحديث بيانات العميل",
    changes: [
      { field: "phone", oldValue: "0501234567", newValue: "0507654321" },
      { field: "email", oldValue: "old@example.com", newValue: "new@example.com" },
    ],
    user: { id: "2", name: "سارة أحمد" },
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "3",
    type: "payment",
    entityType: "payment",
    entityId: "PAY-001",
    entityName: "دفعة للفاتورة #INV-001",
    description: "تم تسجيل دفعة جديدة",
    user: { id: "1", name: "أحمد محمد" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    metadata: { amount: 2500, method: "bank_transfer" },
  },
  {
    id: "4",
    type: "status_change",
    entityType: "invoice",
    entityId: "INV-001",
    entityName: "فاتورة #INV-001",
    description: "تم تغيير حالة الفاتورة",
    changes: [{ field: "status", oldValue: "draft", newValue: "sent" }],
    user: { id: "1", name: "أحمد محمد" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "5",
    type: "delete",
    entityType: "item",
    entityId: "5",
    entityName: "منتج محذوف",
    description: "تم حذف منتج من المخزون",
    user: { id: "3", name: "محمد علي" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "6",
    type: "export",
    entityType: "report",
    entityId: "profit-loss",
    entityName: "تقرير الأرباح والخسائر",
    description: "تم تصدير التقرير",
    user: { id: "2", name: "سارة أحمد" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    metadata: { format: "PDF", period: "2024-Q3" },
  },
  {
    id: "7",
    type: "email",
    entityType: "invoice",
    entityId: "INV-002",
    entityName: "فاتورة #INV-002",
    description: "تم إرسال الفاتورة بالبريد الإلكتروني",
    user: { id: "1", name: "أحمد محمد" },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    metadata: { recipient: "client@example.com" },
  },
];

export default function ActivityFeed({
  entityType,
  entityId,
  userId,
  limit = 50,
  showFilters = true,
  maxHeight = "500px",
}: ActivityFeedProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dateLocale = i18n.language === "ar" ? ar : enUS;

  const [activities, setActivities] = useState<ActivityItem[]>(mockActivities);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("7days");
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    // Filter by type
    if (filterType !== "all" && activity.type !== filterType) return false;

    // Filter by entity type
    if (filterEntity !== "all" && activity.entityType !== filterEntity) return false;

    // Filter by entity (if specified in props)
    if (entityType && activity.entityType !== entityType) return false;
    if (entityId && activity.entityId !== entityId) return false;

    // Filter by user (if specified in props)
    if (userId && activity.user.id !== userId) return false;

    // Filter by period
    const now = new Date();
    const activityDate = new Date(activity.timestamp);
    switch (filterPeriod) {
      case "today":
        if (format(activityDate, "yyyy-MM-dd") !== format(now, "yyyy-MM-dd")) return false;
        break;
      case "7days":
        if (activityDate < subDays(now, 7)) return false;
        break;
      case "30days":
        if (activityDate < subDays(now, 30)) return false;
        break;
      case "90days":
        if (activityDate < subDays(now, 90)) return false;
        break;
    }

    return true;
  });

  // Get icon for activity type
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "create":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "update":
        return <Edit2 className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "view":
        return <Eye className="h-4 w-4 text-gray-500" />;
      case "export":
        return <Download className="h-4 w-4 text-purple-500" />;
      case "email":
        return <Receipt className="h-4 w-4 text-orange-500" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-green-600" />;
      case "status_change":
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      default:
        return <History className="h-4 w-4" />;
    }
  };

  // Get icon for entity type
  const getEntityIcon = (type: ActivityItem["entityType"]) => {
    switch (type) {
      case "invoice":
        return <FileText className="h-4 w-4" />;
      case "contact":
        return <Users className="h-4 w-4" />;
      case "item":
        return <Package className="h-4 w-4" />;
      case "expense":
        return <Receipt className="h-4 w-4" />;
      case "payment":
        return <CreditCard className="h-4 w-4" />;
      case "journal":
        return <Calculator className="h-4 w-4" />;
      case "project":
        return <Briefcase className="h-4 w-4" />;
      case "account":
        return <Wallet className="h-4 w-4" />;
      case "report":
        return <BarChart3 className="h-4 w-4" />;
      case "settings":
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get badge color for activity type
  const getTypeBadgeVariant = (type: ActivityItem["type"]) => {
    switch (type) {
      case "create":
        return "default";
      case "delete":
        return "destructive";
      case "update":
      case "status_change":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 1000 * 60 * 60 * 24) {
      return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
    }
    return format(date, "PPp", { locale: dateLocale });
  };

  // Toggle details
  const toggleDetails = (id: string) => {
    setShowDetails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = format(new Date(activity.timestamp), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("activity.filterByType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="create">{t("activity.types.create")}</SelectItem>
              <SelectItem value="update">{t("activity.types.update")}</SelectItem>
              <SelectItem value="delete">{t("activity.types.delete")}</SelectItem>
              <SelectItem value="payment">{t("activity.types.payment")}</SelectItem>
              <SelectItem value="email">{t("activity.types.email")}</SelectItem>
              <SelectItem value="export">{t("activity.types.export")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEntity} onValueChange={setFilterEntity}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("activity.filterByEntity")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="invoice">{t("common.invoices")}</SelectItem>
              <SelectItem value="contact">{t("common.contacts")}</SelectItem>
              <SelectItem value="item">{t("common.items")}</SelectItem>
              <SelectItem value="expense">{t("common.expenses")}</SelectItem>
              <SelectItem value="payment">{t("common.payments")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("activity.period")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{t("activity.periods.today")}</SelectItem>
              <SelectItem value="7days">{t("activity.periods.7days")}</SelectItem>
              <SelectItem value="30days">{t("activity.periods.30days")}</SelectItem>
              <SelectItem value="90days">{t("activity.periods.90days")}</SelectItem>
              <SelectItem value="all">{t("common.all")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Activity List */}
      <ScrollArea style={{ maxHeight }}>
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("activity.noActivity")}</p>
            <p className="text-muted-foreground">{t("activity.noActivityDesc")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date}>
                <div className="sticky top-0 bg-background py-2 z-10">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(date), "PPPP", { locale: dateLocale })}
                  </h3>
                </div>

                <div className="space-y-3 mt-3">
                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleDetails(activity.id)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={getTypeBadgeVariant(activity.type)}>
                                {t(`activity.types.${activity.type}`)}
                              </Badge>
                              <span className="font-medium text-sm">
                                {activity.entityName}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(new Date(activity.timestamp))}
                          </span>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="text-xs">
                              {activity.user.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {activity.user.name}
                          </span>
                        </div>

                        {/* Changes (if expanded) */}
                        {showDetails.has(activity.id) && activity.changes && (
                          <div className="mt-3 p-2 rounded bg-muted/50 space-y-1">
                            {activity.changes.map((change, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="font-medium">
                                  {t(`fields.${change.field}`, change.field)}:
                                </span>
                                <span className="line-through text-muted-foreground">
                                  {change.oldValue || "-"}
                                </span>
                                <ArrowRight className="h-3 w-3" />
                                <span className="text-green-600 dark:text-green-400">
                                  {change.newValue || "-"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Metadata (if expanded) */}
                        {showDetails.has(activity.id) && activity.metadata && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {t(`fields.${key}`, key)}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Load More */}
      {filteredActivities.length >= limit && (
        <div className="text-center">
          <Button variant="outline">
            {t("activity.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
