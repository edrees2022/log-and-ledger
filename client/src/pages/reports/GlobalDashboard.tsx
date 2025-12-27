import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type CompanyStats = {
  id: string;
  name: string;
  cash: number;
  revenue: number;
  expenses: number;
  netIncome: number;
};

type GlobalDashboardData = {
  totals: {
    cash: number;
    revenue: number;
    expenses: number;
    netIncome: number;
  };
  companies: CompanyStats[];
};

export default function GlobalDashboard() {
  const { t, i18n } = useTranslation();

  const { data, isLoading } = useQuery<GlobalDashboardData>({
    queryKey: ["/api/reports/global-dashboard"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "USD", // Assuming USD for consolidation or base currency
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("reports.globalDashboard", "Global Financial Dashboard")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("reports.globalDashboardDesc", "Consolidated view of all group companies")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("reports.totalCash", "Total Cash Position")}
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.totals.cash || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("reports.totalRevenue", "Total Revenue (YTD)")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.totals.revenue || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("reports.totalExpenses", "Total Expenses (YTD)")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.totals.expenses || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("reports.netIncome", "Net Income (YTD)")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(data?.totals.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data?.totals.netIncome || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reports.companyBreakdown", "Company Breakdown")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[450px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.company", "Company")}</TableHead>
                <TableHead className="text-right">{t("reports.cash", "Cash")}</TableHead>
                <TableHead className="text-right">{t("reports.revenue", "Revenue")}</TableHead>
                <TableHead className="text-right">{t("reports.expenses", "Expenses")}</TableHead>
                <TableHead className="text-right">{t("reports.netIncome", "Net Income")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(company.cash)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(company.revenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(company.expenses)}</TableCell>
                  <TableCell className={`text-right ${company.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(company.netIncome)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
