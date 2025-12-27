import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, TrendingDown, Target, DollarSign, ArrowUpRight, ArrowDownRight, Minus, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BudgetLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
}

interface BudgetSummary {
  totalRevenueBudget: number;
  totalRevenueActual: number;
  totalExpenseBudget: number;
  totalExpenseActual: number;
  netBudget: number;
  netActual: number;
  netVariance: number;
}

interface BudgetReport {
  lines: BudgetLine[];
  summary: BudgetSummary;
}

export default function BudgetVsActualPage() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [fiscalYear, setFiscalYear] = useState(currentYear.toString());
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'revenue'>('all');

  const { data: report, isLoading } = useQuery<BudgetReport>({
    queryKey: ["budget-vs-actual", fiscalYear],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/budgets/vs-actual?fiscalYear=${fiscalYear}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      return await res.json();
    },
  });

  const calculatePercentage = (actual: number, budget: number) => {
    if (!budget || budget === 0) return 0;
    return Math.min((actual / budget) * 100, 150); // Allow over 100%
  };

  const getVarianceStatus = (variance: number, type: string) => {
    // For Expense: Positive variance (Budget > Actual) = Under budget = Good
    // For Revenue: Negative variance (Budget < Actual) = Over target = Good
    if (type === 'expense') {
      if (variance > 0) return { color: "text-green-600", bg: "bg-green-100", label: t('budgets.underBudget'), icon: ArrowDownRight };
      if (variance < 0) return { color: "text-red-600", bg: "bg-red-100", label: t('budgets.overBudget'), icon: ArrowUpRight };
      return { color: "text-gray-500", bg: "bg-gray-100", label: t('budgets.onTarget'), icon: Minus };
    } else {
      if (variance < 0) return { color: "text-green-600", bg: "bg-green-100", label: t('budgets.aboveTarget'), icon: ArrowUpRight };
      if (variance > 0) return { color: "text-red-600", bg: "bg-red-100", label: t('budgets.belowTarget'), icon: ArrowDownRight };
      return { color: "text-gray-500", bg: "bg-gray-100", label: t('budgets.onTarget'), icon: Minus };
    }
  };

  const getProgressColor = (percentage: number, type: string) => {
    if (type === 'expense') {
      if (percentage > 100) return "bg-red-500";
      if (percentage > 80) return "bg-yellow-500";
      return "bg-green-500";
    } else {
      if (percentage > 100) return "bg-green-500";
      if (percentage > 80) return "bg-blue-500";
      return "bg-gray-400";
    }
  };

  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const exportToCSV = () => {
    if (!report?.lines) return;
    
    const headers = [
      t('budgets.accountCode'),
      t('budgets.accountName'),
      t('budgets.type'),
      t('budgets.budget'),
      t('budgets.actual'),
      t('budgets.variance'),
      t('budgets.variancePercentage')
    ];
    
    const rows = report.lines.map(line => [
      line.accountCode,
      line.accountName,
      line.accountType,
      line.budgetAmount.toString(),
      line.actualAmount.toString(),
      line.variance.toString(),
      `${line.variancePercentage.toFixed(1)}%`
    ]);
    
    // Add summary rows
    rows.push([]);
    rows.push([t('budgets.totalRevenue'), '', '', summary.totalRevenueBudget.toString(), summary.totalRevenueActual.toString(), '', '']);
    rows.push([t('budgets.totalExpenses'), '', '', summary.totalExpenseBudget.toString(), summary.totalExpenseActual.toString(), '', '']);
    rows.push([t('budgets.netBudget'), '', '', summary.netBudget.toString(), summary.netActual.toString(), summary.netVariance.toString(), '']);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `budget-vs-actual-${fiscalYear}.csv`;
    link.click();
  };

  const filteredLines = report?.lines?.filter(line => {
    if (activeTab === 'all') return true;
    return line.accountType === activeTab;
  }) || [];

  const summary = report?.summary || {
    totalRevenueBudget: 0,
    totalRevenueActual: 0,
    totalExpenseBudget: 0,
    totalExpenseActual: 0,
    netBudget: 0,
    netActual: 0,
    netVariance: 0
  };

  // Calculate performance indicators
  const revenuePerformance = summary.totalRevenueBudget > 0 
    ? ((summary.totalRevenueActual / summary.totalRevenueBudget) * 100).toFixed(1)
    : '0';
  const expensePerformance = summary.totalExpenseBudget > 0 
    ? ((summary.totalExpenseActual / summary.totalExpenseBudget) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('budgets.budgetVsActual')}</h1>
          <p className="text-sm text-muted-foreground">{t('budgets.budgetVsActualDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Label>{t('budgets.fiscalYear')}</Label>
          <Select value={fiscalYear} onValueChange={setFiscalYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
              <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
              <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!report?.lines?.length}>
            <FileDown className="h-4 w-4 me-2" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('budgets.totalRevenue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenueActual)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{t('budgets.target')}: {formatCurrency(summary.totalRevenueBudget)}</span>
              <Badge variant={parseFloat(revenuePerformance) >= 100 ? "default" : "secondary"} className="text-xs">
                {revenuePerformance}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(parseFloat(revenuePerformance), 150)} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('budgets.totalExpenses')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenseActual)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{t('budgets.budget')}: {formatCurrency(summary.totalExpenseBudget)}</span>
              <Badge variant={parseFloat(expensePerformance) <= 100 ? "default" : "destructive"} className="text-xs">
                {expensePerformance}%
              </Badge>
            </div>
            <Progress 
              value={Math.min(parseFloat(expensePerformance), 150)} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>

        {/* Net Budget Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('budgets.netBudget')}</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netBudget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('budgets.plannedProfit')}
            </p>
          </CardContent>
        </Card>

        {/* Net Actual Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('budgets.netActual')}</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netActual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netActual)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">{t('budgets.variance')}:</span>
              <span className={`text-xs font-medium ${summary.netVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.netVariance >= 0 ? '+' : ''}{formatCurrency(summary.netVariance)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>{t('budgets.performanceReport')}</CardTitle>
              <CardDescription>{t('budgets.detailedBreakdown')}</CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
                <TabsTrigger value="revenue">{t('budgets.revenue')}</TabsTrigger>
                <TabsTrigger value="expense">{t('budgets.expenses')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>{t('budgets.account')}</TableHead>
                  <TableHead>{t('budgets.type')}</TableHead>
                  <TableHead className="text-end">{t('budgets.budget')}</TableHead>
                  <TableHead className="text-end">{t('budgets.actual')}</TableHead>
                  <TableHead className="text-end">{t('budgets.variance')}</TableHead>
                  <TableHead>{t('budgets.status')}</TableHead>
                  <TableHead className="w-[180px]">{t('budgets.progress')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">{t('common.loading')}</TableCell>
                  </TableRow>
                ) : filteredLines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {t('budgets.noBudgetData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLines.map((row) => {
                    const status = getVarianceStatus(row.variance, row.accountType);
                    const percentage = calculatePercentage(row.actualAmount, row.budgetAmount);
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={row.accountId}>
                        <TableCell>
                          <div className="font-medium">{row.accountName}</div>
                          <div className="text-xs text-muted-foreground">{row.accountCode}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.accountType === 'revenue' ? 'default' : 'secondary'}>
                            {t(`accounts.types.${row.accountType}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end font-medium">{formatCurrency(row.budgetAmount)}</TableCell>
                        <TableCell className="text-end font-medium">{formatCurrency(row.actualAmount)}</TableCell>
                        <TableCell className={`text-end font-medium ${status.color}`}>
                          {row.variance >= 0 ? '+' : ''}{formatCurrency(row.variance)}
                          <div className="text-xs">
                            ({row.variancePercentage >= 0 ? '+' : ''}{row.variancePercentage.toFixed(1)}%)
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getProgressColor(percentage, row.accountType)} transition-all`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-end">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
