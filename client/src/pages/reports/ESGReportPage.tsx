import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import PageContainer from '@/components/layout/PageContainer';
import { Leaf, Factory, Zap, Droplets } from "lucide-react";

type ESGData = {
  year: number;
  total_co2_kg: number;
  by_category: {
    category: string;
    total_co2: number;
    total_spend: number;
    count: number;
  }[];
  trend: {
    month: string;
    total_co2: number;
  }[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ESGReportPage() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery<ESGData>({
    queryKey: ['/api/esg/summary'],
  });

  if (isLoading) return <div className="p-8">{t("reports.loadingESGReport", "Loading ESG Report...")}</div>;
  if (error) return <div className="p-8 text-red-500">{t("reports.failedToLoadESGReport", "Failed to load ESG Report")}</div>;

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t('reports.esgTitle', 'Sustainability & ESG Report')}</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.totalCarbon', 'Total Carbon Footprint')}
            </CardTitle>
            <Leaf className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(data?.total_co2_kg || 0).toLocaleString()} kgCO2e
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.yearToDate', 'Year to Date')}
            </p>
          </CardContent>
        </Card>
        
        {/* Placeholder cards for future metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.energyUsage', 'Energy Usage')}
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-- kWh</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.emissionsByCategory', 'Emissions by Category')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.by_category}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_co2"
                    nameKey="category"
                  >
                    {data?.by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.emissionsTrend', 'Monthly Emissions Trend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_co2" name="CO2 (kg)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
