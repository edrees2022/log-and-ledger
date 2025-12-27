import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, DollarSign, Receipt, Calendar, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line, Legend
} from 'recharts';

export default function FinancialReports() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st
    end: new Date().toISOString().split('T')[0] // Today
  });

  const reports = [
    {
      id: "balance-sheet",
      name: t('reports.financial.balanceSheetTitle'),
      description: t('reports.financial.balanceSheetDesc'),
      icon: FileText,
      endpoint: "/api/reports/balance-sheet",
    },
    {
      id: "profit-loss",
      name: t('reports.financial.profitLossTitle'),
      description: t('reports.financial.profitLossDesc'),
      icon: TrendingUp,
      endpoint: "/api/reports/profit-loss",
    },
    {
      id: "trial-balance",
      name: t('reports.financial.trialBalanceTitle'),
      description: t('reports.financial.trialBalanceDesc'),
      icon: DollarSign,
      endpoint: "/api/reports/trial-balance",
    },
    {
      id: "cash-flow",
      name: t('reports.financial.cashFlowTitle'),
      description: t('reports.financial.cashFlowDesc'),
      icon: Receipt,
      endpoint: "/api/reports/cash-flow",
    },
    {
      id: "ar-aging",
      name: t('reports.financial.arAgingTitle'),
      description: t('reports.financial.arAgingDesc'),
      icon: Calendar,
      endpoint: "/api/reports/ar-aging",
    },
    {
      id: "consolidated-balance-sheet",
      name: t('reports.financial.consolidatedBalanceSheetTitle'),
      description: t('reports.financial.consolidatedBalanceSheetDesc'),
      icon: Building,
      endpoint: "/api/reports/consolidated-balance-sheet",
    },
  ];

  const generateReport = async (reportId: string, endpoint: string) => {
    setLoading(true);
    setSelectedReport(reportId);
    
    try {
      const auth = (await import('firebase/auth')).getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error(t('auth.notAuthenticated'));
      }
      
      const idToken = await currentUser.getIdToken();
      
      // Append query parameters
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.append('startDate', dateRange.start);
      url.searchParams.append('endDate', dateRange.end);
      url.searchParams.append('date', dateRange.end); // For balance sheets that need 'as of' date

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(t('reports.failedToGenerateReport'));
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(t('reports.failedToGenerateTryAgain'));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderBalanceSheet = (data: any) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.assets')}</h3>
        <div className="space-y-2">
          {data.assets.accounts.map((account: any) => (
            <div key={account.account_id} className="flex justify-between text-sm">
              <span>{account.account_name}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.financial.totalAssets')}</span>
            <span>{formatCurrency(data.assets.total)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.liabilities')}</h3>
        <div className="space-y-2">
          {data.liabilities.accounts.map((account: any) => (
            <div key={account.account_id} className="flex justify-between text-sm">
              <span>{account.account_name}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.financial.totalLiabilities')}</span>
            <span>{formatCurrency(data.liabilities.total)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.equity')}</h3>
        <div className="space-y-2">
          {data.equity.accounts.map((account: any) => (
            <div key={account.account_id} className="flex justify-between text-sm">
              <span>{account.account_name}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.financial.totalEquity')}</span>
            <span>{formatCurrency(data.equity.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="flex justify-between font-bold">
          <span>{t('common.status')}</span>
          <span className={data.balanced ? "text-green-600" : "text-red-600"}>
            {data.balanced ? `✓ ${t('reports.balanced')}` : `✗ ${t('reports.notBalanced')}`}
          </span>
        </div>
      </div>
    </div>
  );

  const renderProfitLoss = (data: any) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.revenue')}</h3>
        <div className="space-y-2">
          {data.revenue.accounts.map((account: any) => (
            <div key={account.account_id} className="flex justify-between text-sm">
              <span>{account.account_name}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.financial.totalIncome')}</span>
            <span>{formatCurrency(data.revenue.total)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.cogs')}</h3>
        <div className="space-y-2">
          {data.cost_of_goods_sold.accounts.map((account: any) => (
            <div key={account.account_id} className="flex justify-between text-sm">
              <span>{account.account_name}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.totalCogs')}</span>
            <span>{formatCurrency(data.cost_of_goods_sold.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <div className="flex justify-between font-bold">
          <span>{t('reports.financial.grossProfit')}</span>
          <span>{formatCurrency(data.gross_profit)}</span>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.expenses')}</h3>
        <div className="space-y-2">
          {data.expenses.accounts.map((account: any) => (
            <div key={account.account_id} className="flex justify-between text-sm">
              <span>{account.account_name}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.financial.totalExpenses')}</span>
            <span>{formatCurrency(data.expenses.total)}</span>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${data.net_income >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        <div className="flex justify-between font-bold text-lg">
          <span>{data.net_income >= 0 ? t('reports.financial.netProfit') : t('reports.financial.netLoss')}</span>
          <span className={data.net_income >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(data.net_income)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderTrialBalance = (data: any) => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-start py-2">{t('reports.accountCode')}</th>
                <th className="text-start py-2">{t('reports.accountName')}</th>
                <th className="text-end py-2">{t('reports.financial.debit')}</th>
                <th className="text-end py-2">{t('reports.financial.credit')}</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.map((account: any) => (
                <tr key={account.account_id} className="border-b">
                  <td className="py-2">{account.account_code}</td>
                  <td className="py-2">{account.account_name}</td>
                  <td className="text-end py-2">{formatCurrency(account.debit)}</td>
                  <td className="text-end py-2">{formatCurrency(account.credit)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t-2">
                <td colSpan={2} className="py-2">{t('reports.total')}</td>
                <td className="text-end py-2">{formatCurrency(data.total_debits)}</td>
                <td className="text-end py-2">{formatCurrency(data.total_credits)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <div className="flex justify-between font-bold">
          <span>{t('common.status')}</span>
          <span className={data.balanced ? "text-green-600" : "text-red-600"}>
            {data.balanced ? `✓ ${t('reports.balanced')}` : `✗ ${t('reports.notBalanced')}`}
          </span>
        </div>
      </div>
    </div>
  );

  const renderCashFlowForecast = (data: any) => {
    if (!data || !data.timeline) return null;

    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.financial.currentBalance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.currentBalance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.financial.projectedBalance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.projectedBalance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(data.projectedBalance)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.financial.netChange')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.summary.netChange < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {formatCurrency(data.summary.netChange)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.financial.lowestBalance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(data.summary.lowestBalance)}</div>
              <p className="text-xs text-muted-foreground">{t('reports.financial.on')} {data.summary.lowestBalanceDate}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.financial.cashFlowProjection')}</CardTitle>
            <CardDescription>{t('reports.financial.cashFlowProjectionDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="balance" fill="#8884d8" stroke="#8884d8" fillOpacity={0.3} />
                <Bar yAxisId="right" dataKey="inflow" fill="#82ca9d" name={t('reports.financial.inflow')} />
                <Bar yAxisId="right" dataKey="outflow" fill="#ff7c7c" name={t('reports.financial.outflow')} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {data.aiAnalysis && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {t('reports.financial.aiAnalysis')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{data.aiAnalysis}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.financial.forecastDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.timeline.map((day: any) => (
                day.items.length > 0 && (
                  <div key={day.date} className="border-b pb-4 last:border-0">
                    <h4 className="font-medium mb-2">{day.date}</h4>
                    <div className="space-y-2">
                      {day.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.description}</span>
                          <span className={item.type === 'inflow' ? 'text-green-600' : 'text-red-600'}>
                            {item.type === 'inflow' ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderARAging = (data: any) => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-start py-2">{t('reports.customer')}</th>
                <th className="text-end py-2">{t('reports.financial.current')}</th>
                <th className="text-end py-2">{t('reports.financial.days30')}</th>
                <th className="text-end py-2">{t('reports.financial.days60')}</th>
                <th className="text-end py-2">{t('reports.financial.days90')}</th>
                <th className="text-end py-2">{t('reports.financial.daysOver90')}</th>
                <th className="text-end py-2">{t('reports.total')}</th>
              </tr>
            </thead>
            <tbody>
              {data.customers?.map((customer: any) => (
                <tr key={customer.id} className="border-b">
                  <td className="py-2">{customer.name}</td>
                  <td className="text-end py-2">{formatCurrency(customer.current)}</td>
                  <td className="text-end py-2">{formatCurrency(customer.days_30)}</td>
                  <td className="text-end py-2">{formatCurrency(customer.days_60)}</td>
                  <td className="text-end py-2">{formatCurrency(customer.days_90)}</td>
                  <td className="text-end py-2">{formatCurrency(customer.days_over_90)}</td>
                  <td className="text-end py-2 font-medium">{formatCurrency(customer.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConsolidatedBalanceSheet = (data: any) => (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg mb-4">
        <h4 className="font-semibold mb-2">{t('reports.financial.consolidatedCompanies')}:</h4>
        <div className="flex flex-wrap gap-2">
          {data.companies?.map((name: string, idx: number) => (
            <span key={idx} className="bg-background px-2 py-1 rounded border text-sm">{name}</span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.assets')}</h3>
        <div className="space-y-2">
          {data.assets.map((account: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{account.accountName}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.financial.totalAssets')}</span>
            <span>{formatCurrency(data.totals.assets)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.liabilities')}</h3>
        <div className="space-y-2">
          {data.liabilities.map((account: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{account.accountName}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.financial.totalLiabilities')}</span>
            <span>{formatCurrency(data.totals.liabilities)}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">{t('reports.equity')}</h3>
        <div className="space-y-2">
          {data.equity.map((account: any, idx: number) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{account.accountName}</span>
              <span className="font-medium">{formatCurrency(account.balance)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>{t('reports.financial.totalEquity')}</span>
            <span>{formatCurrency(data.totals.equity)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('reports.financial.title')}</h1>
          <p className="text-muted-foreground">{t('reports.financial.subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-4 items-end bg-card p-4 rounded-lg border">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('common.startDate')}</label>
          <input 
            type="date" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('common.endDate')}</label>
          <input 
            type="date" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-primary" />
                  <CardTitle>{report.name}</CardTitle>
                </div>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generateReport(report.id, report.endpoint)}
                  disabled={loading && selectedReport === report.id}
                  className="w-full"
                >
                  {loading && selectedReport === report.id ? t('reports.generating') : t('reports.financial.generate')}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>{reportData.report_name}</CardTitle>
            <CardDescription>
              {(() => {
                const safeDate = (value: any) => {
                  if (!value) return null;
                  const d = value instanceof Date ? value : new Date(value);
                  return isNaN(d.getTime()) ? null : d;
                };
                const asOf = safeDate((reportData as any).as_of_date);
                const start = safeDate((reportData as any).period_start);
                const end = safeDate((reportData as any).period_end);
                return (
                  <>
                    {asOf && `${t('reports.financial.asOf')} ${asOf.toLocaleDateString()}`}
                    {start && end && ` ${t('reports.financial.from')} ${start.toLocaleDateString()} ${t('reports.financial.to')} ${end.toLocaleDateString()}`}
                  </>
                );
              })()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedReport === 'balance-sheet' && renderBalanceSheet(reportData)}
            {selectedReport === 'consolidated-balance-sheet' && renderConsolidatedBalanceSheet(reportData)}
            {selectedReport === 'profit-loss' && renderProfitLoss(reportData)}
            {selectedReport === 'trial-balance' && reportData && renderTrialBalance(reportData)}
            {selectedReport === 'cash-flow' && reportData && renderCashFlowForecast(reportData)}
            {selectedReport === 'ar-aging' && reportData && renderARAging(reportData)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
