import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import PageContainer from '@/components/layout/PageContainer';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrainCircuit, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

type ForecastData = {
  history: {
    month: string;
    cashIn: number;
    cashOut: number;
    net: number;
  }[];
  forecast: {
    month: string;
    cashIn: number;
    cashOut: number;
    net: number;
  }[];
  insights: string[];
};

export default function CashFlowForecast() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery<ForecastData>({
    queryKey: ['/api/ai-cfo/forecast/cashflow'],
  });

  if (isLoading) return <div className="p-8">{t("reports.loadingForecast", "Loading forecast...")}</div>;
  if (error) return <div className="p-8 text-red-500">{t("reports.failedToLoadForecast", "Failed to load forecast")}</div>;

  const chartData = [
    ...(data?.history || []).map(d => ({ ...d, type: 'Historical' })),
    ...(data?.forecast || []).map(d => ({ ...d, type: 'Forecast' }))
  ];

  // Find the split point for the chart (last historical month)
  const lastHistoricalMonth = data?.history?.at(-1)?.month;

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('reports.cashFlowForecast', 'AI Cash Flow Forecast')}</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.projectedCashIn', 'Projected Cash In (Next 6 Mo)')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.forecast.reduce((sum, item) => sum + item.cashIn, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.projectedCashOut', 'Projected Cash Out (Next 6 Mo)')}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.forecast.reduce((sum, item) => sum + item.cashOut, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.netForecast', 'Net Forecast')}
            </CardTitle>
            <BrainCircuit className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (data?.forecast.reduce((sum, item) => sum + item.net, 0) || 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${data?.forecast.reduce((sum, item) => sum + item.net, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('reports.cashFlowTrend', 'Cash Flow Trend & Forecast')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <ReferenceLine x={lastHistoricalMonth} stroke="red" strokeDasharray="3 3" label="Forecast Start" />
                  <Line type="monotone" dataKey="cashIn" stroke="#10b981" name="Cash In" strokeWidth={2} />
                  <Line type="monotone" dataKey="cashOut" stroke="#ef4444" name="Cash Out" strokeWidth={2} />
                  <Line type="monotone" dataKey="net" stroke="#3b82f6" name="Net Flow" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              {t('reports.aiInsights', 'AI Insights')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.insights.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("reports.noSpecificInsights", "No specific insights at this time.")}</p>
            ) : (
              data?.insights.map((insight, i) => (
                <Alert key={i} variant={insight.includes("Warning") || insight.includes("Alert") ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t("reports.insight", "Insight")}</AlertTitle>
                  <AlertDescription>{insight}</AlertDescription>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
