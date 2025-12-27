import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { 
  Brain, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Activity,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface AIAnalyticsData {
  summary: {
    totalExtractions: number;
    successfulExtractions: number;
    failedExtractions: number;
    successRate: number;
    estimatedCost: number;
    currency: string;
  };
  providers: Array<{
    name: string;
    total: number;
    success: number;
    successRate: string;
    model?: string;
  }>;
  models: Array<{
    name: string;
    count: number;
  }>;
  modes: Array<{
    name: string;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    extractions: number;
    success: number;
  }>;
  recentExtractions: Array<{
    id: string;
    timestamp: string;
    entity_id: string;
    provider: string;
    model: string;
    mode: string;
    success: boolean;
    actor: string;
    cost?: number;
    tokens?: { in: number; out: number };
    error?: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AIAnalyticsPage() {
  const { t } = useTranslation();
  const days = 30; // Default to last 30 days

  const { data, isLoading, error } = useQuery<AIAnalyticsData>({
    queryKey: [`/api/reports/ai-analytics?days=${days}`],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">{t('ai.analytics.title')}</h1>
            <p className="text-muted-foreground">{t('ai.analytics.subtitle')}</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">{t('errors.loadFailed')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, providers, models, modes, dailyTrend, recentExtractions } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">{t('ai.analytics.title')}</h1>
          <p className="text-muted-foreground">{t('ai.analytics.subtitle')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('ai.analytics.totalExtractions')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalExtractions}</div>
            <p className="text-xs text-muted-foreground">
              {summary.successfulExtractions} {t('ai.analytics.successful')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('ai.analytics.successRate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {summary.failedExtractions} {t('ai.analytics.failed')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('ai.analytics.estimatedCost')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.estimatedCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              ${(summary.estimatedCost / Math.max(summary.totalExtractions, 1)).toFixed(4)} {t('ai.analytics.perExtraction')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('ai.analytics.providers')}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providers.length}</div>
            <p className="text-xs text-muted-foreground">
              {models.length} {t('ai.analytics.models')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trend">
            <Calendar className="h-4 w-4 me-2" />
            {t('ai.analytics.trend')}
          </TabsTrigger>
          <TabsTrigger value="providers">
            {t('ai.analytics.providers')}
          </TabsTrigger>
          <TabsTrigger value="modes">
            {t('ai.analytics.modes')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('ai.analytics.dailyExtractions')}</CardTitle>
              <CardDescription>{t('ai.analytics.last30Days')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="extractions" stroke="#8884d8" name={t('ai.analytics.total')} />
                  <Line type="monotone" dataKey="success" stroke="#82ca9d" name={t('ai.analytics.successful')} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('ai.analytics.providerUsage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={providers.map(p => ({ name: p.name, value: p.total }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {providers.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ai.analytics.providerStats')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers.map(provider => (
                    <div key={provider.name} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">{provider.model || t('ai.analytics.unknownModel')}</p>
                      </div>
                      <div className="text-end">
                        <Badge variant={parseFloat(provider.successRate) > 80 ? 'default' : 'secondary'}>
                          {provider.successRate}%
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {provider.success}/{provider.total}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('ai.analytics.extractionModes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name={t('ai.analytics.extractions')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Extractions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('ai.analytics.recentExtractions')}</CardTitle>
          <CardDescription>{t('ai.analytics.last10')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExtractions.map(extraction => (
              <div key={extraction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {extraction.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{extraction.entity_id}</p>
                      {extraction.cost !== undefined && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          ${extraction.cost.toFixed(4)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(extraction.timestamp).toLocaleString()} • {extraction.actor}
                      {extraction.tokens && (
                        <span className="ms-2 text-xs opacity-70">
                          {t('ai.analytics.tokensInOut', { in: extraction.tokens.in, out: extraction.tokens.out })}
                        </span>
                      )}
                    </p>
                    {extraction.error && (
                      <p className="text-xs text-red-500 mt-1 max-w-md truncate">
                        {extraction.error}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <Badge variant="outline" className="mb-1">
                    {extraction.provider}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {extraction.mode} • {extraction.model}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
