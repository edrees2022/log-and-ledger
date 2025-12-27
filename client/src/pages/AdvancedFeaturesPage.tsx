import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  History, 
  ArrowLeftRight, 
  FileText, 
  BarChart3,
  Sparkles,
  ChevronRight,
  Settings,
  Target,
  Bell,
  Repeat,
  DollarSign,
  TrendingUp,
  Users,
  Globe,
  Shield
} from "lucide-react";
import { SmartDashboard } from "@/components/SmartDashboard";
import { AuditTrail } from "@/components/AuditTrail";
import { MultiCurrencyConverter } from "@/components/MultiCurrencyConverter";
import { InvoiceTemplateSelector } from "@/components/InvoiceTemplateSelector";
import { DataVisualization } from "@/components/DataVisualization";
import { GoalsTracker } from "@/components/GoalsTracker";
import { NotificationCenter } from "@/components/NotificationCenter";
import { RecurringManager } from "@/components/RecurringManager";
import { ExpenseAnalyzer } from "@/components/ExpenseAnalyzer";
import { CashFlowPredictor } from "@/components/CashFlowPredictor";
import { TeamCollaboration } from "@/components/TeamCollaboration";
import { CustomerPortal } from "@/components/CustomerPortal";
import { ZatcaCompliance } from "@/components/ZatcaCompliance";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
}

function FeatureCard({ title, description, icon, badge, onClick }: FeatureCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          {badge && (
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-3">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-primary text-sm font-medium">
          <span>افتح الميزة</span>
          <ChevronRight className="h-4 w-4 mr-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdvancedFeaturesPage() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const isRTL = i18n.language === "ar";

  const features = [
    {
      id: "smart-dashboard",
      title: t("dashboard.smartDashboard", "لوحة التحكم الذكية"),
      description: t("dashboard.smartDashboardDesc", "لوحة تحكم قابلة للتخصيص مع السحب والإفلات وودجات متعددة"),
      icon: <LayoutDashboard className="h-6 w-6" />,
      badge: t("common.new", "جديد"),
    },
    {
      id: "audit-trail",
      title: t("audit.title", "سجل المراجعة"),
      description: t("audit.description", "تتبع شامل لجميع التغييرات والعمليات في النظام"),
      icon: <History className="h-6 w-6" />,
      badge: t("common.premium", "متميز"),
    },
    {
      id: "currency-converter",
      title: t("currency.converter", "محول العملات"),
      description: t("currency.converterDesc", "تحويل العملات مع أسعار صرف حية وأكثر من 30 عملة"),
      icon: <ArrowLeftRight className="h-6 w-6" />,
    },
    {
      id: "invoice-templates",
      title: t("templates.title", "قوالب الفواتير"),
      description: t("templates.description", "أكثر من 14 قالب احترافي مع تخصيص كامل"),
      icon: <FileText className="h-6 w-6" />,
      badge: t("common.new", "جديد"),
    },
    {
      id: "data-visualization",
      title: t("visualization.title", "تصور البيانات"),
      description: t("visualization.description", "رسوم بيانية متقدمة وتحليلات مرئية للبيانات"),
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      id: "goals-tracker",
      title: t("goals.title", "تتبع الأهداف المالية"),
      description: t("goals.description", "حدد أهدافك المالية وتابع تقدمك نحو تحقيقها"),
      icon: <Target className="h-6 w-6" />,
      badge: t("common.new", "جديد"),
    },
    {
      id: "notifications",
      title: t("notifications.title", "مركز الإشعارات"),
      description: t("notifications.description", "إشعارات ذكية للتنبيهات والمواعيد والمهام"),
      icon: <Bell className="h-6 w-6" />,
    },
    {
      id: "recurring",
      title: t("recurring.title", "المعاملات المتكررة"),
      description: t("recurring.description", "إدارة الفواتير والمصروفات المتكررة تلقائياً"),
      icon: <Repeat className="h-6 w-6" />,
      badge: t("common.new", "جديد"),
    },
    {
      id: "expense-analyzer",
      title: t("expenses.analyzer.title", "تحليل المصروفات"),
      description: t("expenses.analyzer.description", "تحليل شامل للمصروفات مع رؤى ذكية"),
      icon: <DollarSign className="h-6 w-6" />,
    },
    {
      id: "cashflow",
      title: t("cashflow.title", "توقعات التدفق النقدي"),
      description: t("cashflow.description", "تحليل وتوقع التدفقات النقدية المستقبلية"),
      icon: <TrendingUp className="h-6 w-6" />,
      badge: t("common.premium", "متميز"),
    },
    {
      id: "team",
      title: t("team.title", "تعاون الفريق"),
      description: t("team.description", "التواصل والتعاون مع أعضاء الفريق"),
      icon: <Users className="h-6 w-6" />,
      badge: t("common.new", "جديد"),
    },
    {
      id: "customer-portal",
      title: t("portal.title", "بوابة العملاء"),
      description: t("portal.description", "بوابة خدمة ذاتية للعملاء والموردين"),
      icon: <Globe className="h-6 w-6" />,
      badge: t("common.new", "جديد"),
    },
    {
      id: "zatca",
      title: t("zatca.title", "الامتثال لهيئة الزكاة والدخل"),
      description: t("zatca.description", "الفوترة الإلكترونية والامتثال لمتطلبات ZATCA"),
      icon: <Shield className="h-6 w-6" />,
      badge: t("common.required", "مطلوب"),
    },
  ];

  const handleTemplateSelect = (template: any, customization: any) => {
    console.log("Selected template:", template, customization);
    // يمكن إضافة منطق لحفظ القالب المختار
  };

  return (
    <div className={`container mx-auto py-6 space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            {t("advanced.title", "الميزات المتقدمة")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("advanced.subtitle", "اكتشف الأدوات القوية لإدارة أعمالك بكفاءة أعلى")}
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 ml-2" />
          {t("common.settings", "الإعدادات")}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="overview">{t("common.overview", "نظرة عامة")}</TabsTrigger>
            <TabsTrigger value="smart-dashboard">{t("dashboard.smart", "لوحة ذكية")}</TabsTrigger>
            <TabsTrigger value="audit-trail">{t("audit.log", "السجل")}</TabsTrigger>
            <TabsTrigger value="currency-converter">{t("currency.short", "العملات")}</TabsTrigger>
            <TabsTrigger value="invoice-templates">{t("templates.short", "القوالب")}</TabsTrigger>
            <TabsTrigger value="data-visualization">{t("visualization.short", "البيانات")}</TabsTrigger>
            <TabsTrigger value="goals-tracker">{t("goals.short", "الأهداف")}</TabsTrigger>
            <TabsTrigger value="notifications">{t("notifications.short", "الإشعارات")}</TabsTrigger>
            <TabsTrigger value="recurring">{t("recurring.short", "المتكررة")}</TabsTrigger>
            <TabsTrigger value="expense-analyzer">{t("expenses.short", "المصروفات")}</TabsTrigger>
            <TabsTrigger value="cashflow">{t("cashflow.short", "التدفق النقدي")}</TabsTrigger>
            <TabsTrigger value="team">{t("team.short", "الفريق")}</TabsTrigger>
            <TabsTrigger value="customer-portal">{t("portal.short", "البوابة")}</TabsTrigger>
            <TabsTrigger value="zatca">{t("zatca.short", "ZATCA")}</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <FeatureCard
                key={feature.id}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                badge={feature.badge}
                onClick={() => setActiveTab(feature.id)}
              />
            ))}
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t("advanced.quickStats", "إحصائيات سريعة")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">13</div>
                  <div className="text-sm text-muted-foreground">{t("advanced.featuresCount", "ميزات متقدمة")}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">30+</div>
                  <div className="text-sm text-muted-foreground">{t("currency.count", "عملة مدعومة")}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">14+</div>
                  <div className="text-sm text-muted-foreground">{t("templates.count", "قالب فاتورة")}</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">7</div>
                  <div className="text-sm text-muted-foreground">{t("visualization.chartTypes", "أنواع رسوم")}</div>
                </div>
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">5</div>
                  <div className="text-sm text-muted-foreground">{t("goals.typesCount", "أنواع أهداف")}</div>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">24</div>
                  <div className="text-sm text-muted-foreground">{t("cashflow.monthsForecast", "شهر توقعات")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Dashboard Tab */}
        <TabsContent value="smart-dashboard">
          <SmartDashboard />
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit-trail">
          <AuditTrail />
        </TabsContent>

        {/* Currency Converter Tab */}
        <TabsContent value="currency-converter">
          <MultiCurrencyConverter />
        </TabsContent>

        {/* Invoice Templates Tab */}
        <TabsContent value="invoice-templates">
          <InvoiceTemplateSelector onSelect={handleTemplateSelect} />
        </TabsContent>

        {/* Data Visualization Tab */}
        <TabsContent value="data-visualization">
          <DataVisualization />
        </TabsContent>

        {/* Goals Tracker Tab */}
        <TabsContent value="goals-tracker">
          <GoalsTracker />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>

        {/* Recurring Manager Tab */}
        <TabsContent value="recurring">
          <RecurringManager />
        </TabsContent>

        {/* Expense Analyzer Tab */}
        <TabsContent value="expense-analyzer">
          <ExpenseAnalyzer />
        </TabsContent>

        {/* Cash Flow Predictor Tab */}
        <TabsContent value="cashflow">
          <CashFlowPredictor />
        </TabsContent>

        {/* Team Collaboration Tab */}
        <TabsContent value="team">
          <TeamCollaboration />
        </TabsContent>

        {/* Customer Portal Tab */}
        <TabsContent value="customer-portal">
          <CustomerPortal />
        </TabsContent>

        {/* ZATCA Compliance Tab */}
        <TabsContent value="zatca">
          <ZatcaCompliance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
