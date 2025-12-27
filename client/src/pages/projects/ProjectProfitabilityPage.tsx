import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useCompanyCurrency } from "@/hooks/use-company-currency";
import { 
  TrendingUp, TrendingDown, DollarSign, Download, 
  ArrowUpCircle, ArrowDownCircle, PieChart, BarChart3,
  Target, AlertTriangle, CheckCircle2
} from "lucide-react";

export default function ProjectProfitabilityPage() {
  const { t, i18n } = useTranslation();
  const companyCurrency = useCompanyCurrency();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all projects with financials
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects-profitability"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/projects");
      const projectsList = await res.json();
      const projectsArray = Array.isArray(projectsList) ? projectsList : (projectsList.data || []);
      
      // Fetch financials for each project
      const projectsWithFinancials = await Promise.all(
        projectsArray.map(async (project: any) => {
          try {
            const financialsRes = await apiRequest("GET", `/api/projects/${project.id}/financials`);
            const financials = await financialsRes.json();
            return { ...project, financials };
          } catch {
            return { ...project, financials: { revenue: 0, expenses: 0, profit: 0 } };
          }
        })
      );
      
      return projectsWithFinancials;
    },
  });

  // Filter projects based on tab
  const filteredProjects = projects?.filter((p: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "profitable") return p.financials?.profit > 0;
    if (activeTab === "loss") return p.financials?.profit < 0;
    if (activeTab === "active") return p.status === "active";
    return true;
  }) || [];

  // Calculate summary statistics
  const summary = {
    totalRevenue: projects?.reduce((sum: number, p: any) => sum + (p.financials?.revenue || 0), 0) || 0,
    totalExpenses: projects?.reduce((sum: number, p: any) => sum + (p.financials?.expenses || 0), 0) || 0,
    totalProfit: projects?.reduce((sum: number, p: any) => sum + (p.financials?.profit || 0), 0) || 0,
    totalBudget: projects?.reduce((sum: number, p: any) => sum + (parseFloat(p.budget) || 0), 0) || 0,
    profitableCount: projects?.filter((p: any) => p.financials?.profit > 0).length || 0,
    lossCount: projects?.filter((p: any) => p.financials?.profit < 0).length || 0,
    activeCount: projects?.filter((p: any) => p.status === "active").length || 0,
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(i18n.language, { style: 'currency', currency: companyCurrency });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      active: "default",
      completed: "secondary", 
      on_hold: "outline",
      cancelled: "destructive"
    };
    return variants[status] || "default";
  };

  const getProfitabilityBadge = (profit: number) => {
    if (profit > 0) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><ArrowUpCircle className="h-3 w-3 me-1" />{t("projects.profitable", "رابح")}</Badge>;
    if (profit < 0) return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><ArrowDownCircle className="h-3 w-3 me-1" />{t("projects.loss", "خاسر")}</Badge>;
    return <Badge variant="outline">{t("projects.breakeven", "متعادل")}</Badge>;
  };

  const getBudgetUtilization = (project: any) => {
    const budget = parseFloat(project.budget) || 0;
    const expenses = project.financials?.expenses || 0;
    if (budget === 0) return null;
    const percentage = (expenses / budget) * 100;
    return { percentage: Math.min(percentage, 100), isOverBudget: percentage > 100 };
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      t("projects.code"),
      t("projects.name"),
      t("projects.status"),
      t("projects.budget"),
      t("projects.revenue"),
      t("projects.expenses"),
      t("projects.profit"),
      t("projects.profitMargin", "هامش الربح") + " %"
    ];

    const rows = filteredProjects.map((p: any) => {
      const profitMargin = p.financials?.revenue > 0 
        ? ((p.financials.profit / p.financials.revenue) * 100).toFixed(1)
        : "0";
      return [
        p.code,
        p.name,
        t(`projects.${p.status}`),
        parseFloat(p.budget) || 0,
        p.financials?.revenue || 0,
        p.financials?.expenses || 0,
        p.financials?.profit || 0,
        profitMargin
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `project-profitability-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("projects.profitabilityReport", "تقرير ربحية المشاريع")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("projects.profitabilityDesc", "تحليل شامل لربحية جميع المشاريع")}
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="me-2 h-4 w-4" />
          {t("common.exportCSV", "تصدير CSV")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t("projects.totalRevenue", "إجمالي الإيرادات")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              {t("projects.totalExpenses", "إجمالي المصروفات")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              {t("projects.netProfit", "صافي الربح")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.totalProfit)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-purple-600" />
              {t("projects.profitMargin", "هامش الربح")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {summary.totalRevenue > 0 ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">{t("projects.profitableProjects", "مشاريع رابحة")}</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{summary.profitableCount}</span>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium">{t("projects.lossProjects", "مشاريع خاسرة")}</span>
            </div>
            <span className="text-2xl font-bold text-red-600">{summary.lossCount}</span>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">{t("projects.activeProjects", "مشاريع نشطة")}</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{summary.activeCount}</span>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("projects.profitabilityDetails", "تفاصيل الربحية")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">{t("common.all", "الكل")} ({projects?.length || 0})</TabsTrigger>
              <TabsTrigger value="profitable">{t("projects.profitable", "رابح")} ({summary.profitableCount})</TabsTrigger>
              <TabsTrigger value="loss">{t("projects.loss", "خاسر")} ({summary.lossCount})</TabsTrigger>
              <TabsTrigger value="active">{t("projects.active", "نشط")} ({summary.activeCount})</TabsTrigger>
            </TabsList>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("projects.code")}</TableHead>
                    <TableHead>{t("projects.name")}</TableHead>
                    <TableHead>{t("projects.status")}</TableHead>
                    <TableHead className="text-end">{t("projects.budget")}</TableHead>
                    <TableHead className="text-end">{t("projects.revenue")}</TableHead>
                    <TableHead className="text-end">{t("projects.expenses")}</TableHead>
                    <TableHead className="text-end">{t("projects.profit")}</TableHead>
                    <TableHead>{t("projects.budgetUsage", "استخدام الميزانية")}</TableHead>
                    <TableHead>{t("projects.profitability", "الربحية")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        {t("common.noData")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project: any) => {
                      const budgetUtil = getBudgetUtilization(project);
                      const profitMargin = project.financials?.revenue > 0
                        ? ((project.financials.profit / project.financials.revenue) * 100).toFixed(1)
                        : "0";
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.code}</TableCell>
                          <TableCell>{project.name}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(project.status)}>
                              {t(`projects.${project.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-end">
                            {project.budget ? formatCurrency(parseFloat(project.budget)) : '-'}
                          </TableCell>
                          <TableCell className="text-end text-green-600 font-medium">
                            {formatCurrency(project.financials?.revenue || 0)}
                          </TableCell>
                          <TableCell className="text-end text-red-600 font-medium">
                            {formatCurrency(project.financials?.expenses || 0)}
                          </TableCell>
                          <TableCell className={`text-end font-bold ${project.financials?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(project.financials?.profit || 0)}
                          </TableCell>
                          <TableCell>
                            {budgetUtil ? (
                              <div className="space-y-1">
                                <Progress 
                                  value={budgetUtil.percentage} 
                                  className={`h-2 ${budgetUtil.isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                                />
                                <span className={`text-xs ${budgetUtil.isOverBudget ? 'text-red-600' : 'text-muted-foreground'}`}>
                                  {budgetUtil.percentage.toFixed(0)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getProfitabilityBadge(project.financials?.profit || 0)}
                              <span className="text-xs text-muted-foreground">{profitMargin}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
