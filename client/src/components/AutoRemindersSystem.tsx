import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  BellOff,
  Clock,
  Mail,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Plus,
  Send,
  History,
  Settings,
  Timer,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { format, addDays, isPast, differenceInDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ReminderRule {
  id: string;
  name: string;
  enabled: boolean;
  daysBeforeDue?: number;
  daysAfterDue?: number;
  channels: ("email" | "notification" | "sms")[];
  frequency: "once" | "daily" | "weekly";
  template?: string;
}

interface ReminderLog {
  id: string;
  invoiceId: number;
  invoiceNumber: string;
  contactName: string;
  sentAt: Date;
  channel: "email" | "notification" | "sms";
  status: "sent" | "failed" | "pending";
  message?: string;
}

interface OverdueInvoice {
  id: number;
  invoiceNumber: string;
  contactName: string;
  contactEmail?: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  currency: string;
  remindersSent: number;
  lastReminderDate?: string;
}

const defaultRules: ReminderRule[] = [
  {
    id: "before-due-3",
    name: "3 Days Before Due",
    enabled: true,
    daysBeforeDue: 3,
    channels: ["email", "notification"],
    frequency: "once",
  },
  {
    id: "on-due",
    name: "On Due Date",
    enabled: true,
    daysBeforeDue: 0,
    channels: ["email", "notification"],
    frequency: "once",
  },
  {
    id: "after-due-7",
    name: "7 Days Overdue",
    enabled: true,
    daysAfterDue: 7,
    channels: ["email"],
    frequency: "once",
  },
  {
    id: "after-due-14",
    name: "14 Days Overdue",
    enabled: true,
    daysAfterDue: 14,
    channels: ["email"],
    frequency: "once",
  },
  {
    id: "after-due-30",
    name: "30 Days Overdue",
    enabled: false,
    daysAfterDue: 30,
    channels: ["email"],
    frequency: "weekly",
  },
];

export default function AutoRemindersSystem() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isRTL = i18n.language === "ar";
  const dateLocale = i18n.language === "ar" ? ar : enUS;

  const [rules, setRules] = useState<ReminderRule[]>(() => {
    const saved = localStorage.getItem("reminderRules");
    return saved ? JSON.parse(saved) : defaultRules;
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [editingRule, setEditingRule] = useState<ReminderRule | null>(null);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [sendingReminder, setSendingReminder] = useState<number | null>(null);

  // Fetch overdue invoices
  const { data: invoices = [] } = useQuery<any[]>({
    queryKey: ["/api/sales/invoices"],
  });

  // Filter overdue invoices
  const overdueInvoices: OverdueInvoice[] = invoices
    .filter((inv: any) => {
      if (!inv.dueDate || inv.status === "paid" || inv.status === "cancelled") return false;
      return isPast(new Date(inv.dueDate));
    })
    .map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      contactName: inv.contactName || "Unknown",
      contactEmail: inv.contactEmail,
      amount: inv.totalAmount || inv.total || 0,
      dueDate: inv.dueDate,
      daysOverdue: differenceInDays(new Date(), new Date(inv.dueDate)),
      currency: inv.currency || "USD",
      remindersSent: inv.remindersSent || 0,
      lastReminderDate: inv.lastReminderDate,
    }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue);

  // Save rules to localStorage
  useEffect(() => {
    localStorage.setItem("reminderRules", JSON.stringify(rules));
  }, [rules]);

  // Toggle rule
  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  // Save rule
  const saveRule = (rule: ReminderRule) => {
    if (editingRule) {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
    } else {
      setRules((prev) => [...prev, { ...rule, id: `rule-${Date.now()}` }]);
    }
    setShowRuleDialog(false);
    setEditingRule(null);
  };

  // Delete rule
  const deleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  // Send reminder
  const sendReminder = async (invoice: OverdueInvoice) => {
    setSendingReminder(invoice.id);

    try {
      // Simulate sending reminder
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Log the reminder
      const log: ReminderLog = {
        id: `log-${Date.now()}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        contactName: invoice.contactName,
        sentAt: new Date(),
        channel: "email",
        status: "sent",
      };
      setReminderLogs((prev) => [log, ...prev]);

      toast({
        title: t("reminders.reminderSent"),
        description: t("reminders.reminderSentTo", { contact: invoice.contactName }),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("reminders.reminderFailed"),
        description: t("reminders.reminderFailedDesc"),
      });
    } finally {
      setSendingReminder(null);
    }
  };

  // Send bulk reminders
  const sendBulkReminders = async () => {
    for (const invoice of overdueInvoices.slice(0, 5)) {
      await sendReminder(invoice);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Get overdue severity
  const getOverdueSeverity = (days: number): "low" | "medium" | "high" | "critical" => {
    if (days <= 7) return "low";
    if (days <= 14) return "medium";
    if (days <= 30) return "high";
    return "critical";
  };

  const severityColors = {
    low: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    medium: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
    high: "text-red-600 bg-red-100 dark:bg-red-900/30",
    critical: "text-red-800 bg-red-200 dark:bg-red-900/50",
  };

  // Stats
  const stats = {
    totalOverdue: overdueInvoices.length,
    totalAmount: overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    avgDaysOverdue: overdueInvoices.length
      ? Math.round(overdueInvoices.reduce((sum, inv) => sum + inv.daysOverdue, 0) / overdueInvoices.length)
      : 0,
    remindersSentToday: reminderLogs.filter(
      (log) => format(new Date(log.sentAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    ).length,
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("reminders.title")}</h2>
          <p className="text-muted-foreground">{t("reminders.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setActiveTab("settings")}>
            <Settings className="h-4 w-4 mr-2" />
            {t("reminders.settings")}
          </Button>
          <Button onClick={sendBulkReminders} disabled={overdueInvoices.length === 0}>
            <Send className="h-4 w-4 mr-2" />
            {t("reminders.sendBulk")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("reminders.stats.overdueInvoices")}</p>
                <p className="text-2xl font-bold">{stats.totalOverdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("reminders.stats.totalAmount")}</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount, "USD")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("reminders.stats.avgDaysOverdue")}</p>
                <p className="text-2xl font-bold">{stats.avgDaysOverdue} {t("common.days")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("reminders.stats.sentToday")}</p>
                <p className="text-2xl font-bold">{stats.remindersSentToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <AlertCircle className="h-4 w-4 mr-2" />
            {t("reminders.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Timer className="h-4 w-4 mr-2" />
            {t("reminders.tabs.rules")}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            {t("reminders.tabs.history")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            {t("reminders.tabs.settings")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("reminders.overdueInvoices")}</CardTitle>
              <CardDescription>{t("reminders.overdueInvoicesDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {overdueInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">{t("reminders.noOverdue")}</p>
                  <p className="text-muted-foreground">{t("reminders.noOverdueDesc")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.invoice")}</TableHead>
                      <TableHead>{t("common.contact")}</TableHead>
                      <TableHead>{t("common.amount")}</TableHead>
                      <TableHead>{t("common.dueDate")}</TableHead>
                      <TableHead>{t("reminders.daysOverdue")}</TableHead>
                      <TableHead>{t("reminders.remindersSent")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueInvoices.map((invoice) => {
                      const severity = getOverdueSeverity(invoice.daysOverdue);
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">#{invoice.invoiceNumber}</TableCell>
                          <TableCell>{invoice.contactName}</TableCell>
                          <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                          <TableCell>
                            {format(new Date(invoice.dueDate), "PP", { locale: dateLocale })}
                          </TableCell>
                          <TableCell>
                            <Badge className={severityColors[severity]}>
                              {invoice.daysOverdue} {t("common.days")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{invoice.remindersSent}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => sendReminder(invoice)}
                              disabled={sendingReminder === invoice.id}
                            >
                              {sendingReminder === invoice.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("reminders.reminderRules")}</CardTitle>
                <CardDescription>{t("reminders.reminderRulesDesc")}</CardDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingRule(null);
                  setShowRuleDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("reminders.addRule")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      rule.enabled ? "bg-muted/50" : "opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          {rule.daysBeforeDue !== undefined && (
                            <span>
                              {rule.daysBeforeDue === 0
                                ? t("reminders.onDueDate")
                                : t("reminders.daysBefore", { days: rule.daysBeforeDue })}
                            </span>
                          )}
                          {rule.daysAfterDue !== undefined && (
                            <span>{t("reminders.daysAfter", { days: rule.daysAfterDue })}</span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {rule.channels.includes("email") && <Mail className="h-3 w-3" />}
                            {rule.channels.includes("notification") && <Bell className="h-3 w-3" />}
                            {rule.channels.includes("sms") && <MessageSquare className="h-3 w-3" />}
                          </span>
                          <span>•</span>
                          <span>{t(`reminders.frequency.${rule.frequency}`)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingRule(rule);
                          setShowRuleDialog(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("reminders.reminderHistory")}</CardTitle>
              <CardDescription>{t("reminders.reminderHistoryDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {reminderLogs.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{t("reminders.noHistory")}</p>
                  <p className="text-muted-foreground">{t("reminders.noHistoryDesc")}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.invoice")}</TableHead>
                      <TableHead>{t("common.contact")}</TableHead>
                      <TableHead>{t("reminders.channel")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reminderLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.sentAt), "PPp", { locale: dateLocale })}
                        </TableCell>
                        <TableCell className="font-medium">#{log.invoiceNumber}</TableCell>
                        <TableCell>{log.contactName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            {log.channel === "email" && <Mail className="h-3 w-3" />}
                            {log.channel === "notification" && <Bell className="h-3 w-3" />}
                            {log.channel === "sms" && <MessageSquare className="h-3 w-3" />}
                            {t(`reminders.channels.${log.channel}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={log.status === "sent" ? "default" : log.status === "failed" ? "destructive" : "secondary"}
                          >
                            {t(`reminders.status.${log.status}`)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("reminders.settingsTitle")}</CardTitle>
              <CardDescription>{t("reminders.settingsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("reminders.settings.autoReminders")}</p>
                  <p className="text-sm text-muted-foreground">{t("reminders.settings.autoRemindersDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("reminders.settings.emailNotifications")}</p>
                  <p className="text-sm text-muted-foreground">{t("reminders.settings.emailNotificationsDesc")}</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("reminders.settings.excludeWeekends")}</p>
                  <p className="text-sm text-muted-foreground">{t("reminders.settings.excludeWeekendsDesc")}</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{t("reminders.settings.maxReminders")}</Label>
                <Select defaultValue="5">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 {t("reminders.settings.reminders")}</SelectItem>
                    <SelectItem value="5">5 {t("reminders.settings.reminders")}</SelectItem>
                    <SelectItem value="10">10 {t("reminders.settings.reminders")}</SelectItem>
                    <SelectItem value="unlimited">{t("reminders.settings.unlimited")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Dialog */}
      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? t("reminders.editRule") : t("reminders.addRule")}
            </DialogTitle>
            <DialogDescription>
              {t("reminders.ruleDialogDesc")}
            </DialogDescription>
          </DialogHeader>
          <RuleForm
            rule={editingRule}
            onSave={saveRule}
            onCancel={() => {
              setShowRuleDialog(false);
              setEditingRule(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Rule Form Component
function RuleForm({
  rule,
  onSave,
  onCancel,
}: {
  rule: ReminderRule | null;
  onSave: (rule: ReminderRule) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<ReminderRule>>(
    rule || {
      name: "",
      enabled: true,
      daysAfterDue: 1,
      channels: ["email"],
      frequency: "once",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as ReminderRule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t("reminders.ruleName")}</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t("reminders.ruleNamePlaceholder")}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("reminders.timing")}</Label>
          <Select
            value={formData.daysBeforeDue !== undefined ? "before" : "after"}
            onValueChange={(v) => {
              if (v === "before") {
                setFormData({ ...formData, daysBeforeDue: 3, daysAfterDue: undefined });
              } else {
                setFormData({ ...formData, daysAfterDue: 7, daysBeforeDue: undefined });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before">{t("reminders.beforeDue")}</SelectItem>
              <SelectItem value="after">{t("reminders.afterDue")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("common.days")}</Label>
          <Input
            type="number"
            min="0"
            value={formData.daysBeforeDue ?? formData.daysAfterDue ?? 0}
            onChange={(e) => {
              const days = parseInt(e.target.value) || 0;
              if (formData.daysBeforeDue !== undefined) {
                setFormData({ ...formData, daysBeforeDue: days });
              } else {
                setFormData({ ...formData, daysAfterDue: days });
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("reminders.frequency.label")}</Label>
        <Select
          value={formData.frequency}
          onValueChange={(v: any) => setFormData({ ...formData, frequency: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">{t("reminders.frequency.once")}</SelectItem>
            <SelectItem value="daily">{t("reminders.frequency.daily")}</SelectItem>
            <SelectItem value="weekly">{t("reminders.frequency.weekly")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("reminders.channels.label")}</Label>
        <div className="flex gap-4">
          {["email", "notification", "sms"].map((channel) => (
            <label key={channel} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.channels?.includes(channel as any)}
                onChange={(e) => {
                  const channels = formData.channels || [];
                  if (e.target.checked) {
                    setFormData({ ...formData, channels: [...channels, channel as any] });
                  } else {
                    setFormData({ ...formData, channels: channels.filter((c) => c !== channel) });
                  }
                }}
                className="rounded"
              />
              <span className="text-sm">{t(`reminders.channels.${channel}`)}</span>
            </label>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">{t("common.save")}</Button>
      </DialogFooter>
    </form>
  );
}
