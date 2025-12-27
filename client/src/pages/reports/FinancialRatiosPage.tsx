import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Scale,
  Wallet,
  PieChart,
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';

interface BalanceSheetData {
  assets: {
    current: { items: Array<{ accountId: string; name: string; balance: number }> };
    nonCurrent: { items: Array<{ accountId: string; name: string; balance: number }> };
  };
  liabilities: {
    current: { items: Array<{ accountId: string; name: string; balance: number }> };
    nonCurrent: { items: Array<{ accountId: string; name: string; balance: number }> };
  };
  equity: { items: Array<{ accountId: string; name: string; balance: number }> };
}

interface ProfitLossData {
  revenue: {
    operating: Array<{ name: string; balance: number }>;
  };
  expenses: {
    costOfGoodsSold: Array<{ name: string; balance: number }>;
    operating: Array<{ name: string; balance: number }>;
  };
}

interface RatioResult {
  name: string;
  value: number;
  displayValue: string;
  benchmark?: string;
  status: 'good' | 'warning' | 'bad' | 'neutral';
  description: string;
}

export default function FinancialRatiosPage() {
  const { t, i18n } = useTranslation();
  const currency = useCompanyCurrency();
  const [activeTab, setActiveTab] = useState('liquidity');

  // Fetch Balance Sheet data
  const { data: balanceSheet, isLoading: loadingBS, refetch: refetchBS } = useQuery<BalanceSheetData>({
    queryKey: ['/api/reports/balance-sheet'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/reports/balance-sheet');
      return res.json();
    },
  });

  // Fetch Profit & Loss data
  const { data: profitLoss, isLoading: loadingPL, refetch: refetchPL } = useQuery<ProfitLossData>({
    queryKey: ['/api/reports/profit-loss'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/reports/profit-loss');
      return res.json();
    },
  });

  const isLoading = loadingBS || loadingPL;

  // Calculate totals from data
  const totals = useMemo(() => {
    if (!balanceSheet || !profitLoss) {
      return {
        currentAssets: 0,
        inventory: 0,
        nonCurrentAssets: 0,
        totalAssets: 0,
        currentLiabilities: 0,
        nonCurrentLiabilities: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        revenue: 0,
        cogs: 0,
        grossProfit: 0,
        operatingExpenses: 0,
        netIncome: 0,
      };
    }

    const currentAssets = (balanceSheet.assets?.current?.items || [])
      .reduce((s, i) => s + (i.balance || 0), 0);
    
    const inventory = (balanceSheet.assets?.current?.items || [])
      .filter(i => i.name?.toLowerCase().includes('inventory') || i.name?.toLowerCase().includes('مخزون'))
      .reduce((s, i) => s + (i.balance || 0), 0);
    
    const nonCurrentAssets = (balanceSheet.assets?.nonCurrent?.items || [])
      .reduce((s, i) => s + (i.balance || 0), 0);
    
    const currentLiabilities = (balanceSheet.liabilities?.current?.items || [])
      .reduce((s, i) => s + (i.balance || 0), 0);
    
    const nonCurrentLiabilities = (balanceSheet.liabilities?.nonCurrent?.items || [])
      .reduce((s, i) => s + (i.balance || 0), 0);
    
    const totalEquity = (balanceSheet.equity?.items || [])
      .reduce((s, i) => s + (i.balance || 0), 0);

    const revenue = (profitLoss.revenue?.operating || [])
      .reduce((s, i) => s + (i.balance || 0), 0);
    
    const cogs = (profitLoss.expenses?.costOfGoodsSold || [])
      .reduce((s, i) => s + (i.balance || 0), 0);
    
    const operatingExpenses = (profitLoss.expenses?.operating || [])
      .reduce((s, i) => s + (i.balance || 0), 0);

    const grossProfit = revenue - cogs;
    const netIncome = grossProfit - operatingExpenses;

    return {
      currentAssets,
      inventory,
      nonCurrentAssets,
      totalAssets: currentAssets + nonCurrentAssets,
      currentLiabilities,
      nonCurrentLiabilities,
      totalLiabilities: currentLiabilities + nonCurrentLiabilities,
      totalEquity,
      revenue,
      cogs,
      grossProfit,
      operatingExpenses,
      netIncome,
    };
  }, [balanceSheet, profitLoss]);

  // Calculate ratios
  const liquidityRatios = useMemo((): RatioResult[] => {
    const { currentAssets, inventory, currentLiabilities } = totals;
    
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const quickRatio = currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0;
    const cashRatio = 0; // Would need cash specifically

    return [
      {
        name: t('ratios.currentRatio'),
        value: currentRatio,
        displayValue: currentRatio.toFixed(2),
        benchmark: '1.5 - 3.0',
        status: currentRatio >= 1.5 && currentRatio <= 3 ? 'good' : currentRatio >= 1 ? 'warning' : 'bad',
        description: t('ratios.currentRatioDesc'),
      },
      {
        name: t('ratios.quickRatio'),
        value: quickRatio,
        displayValue: quickRatio.toFixed(2),
        benchmark: '1.0 - 2.0',
        status: quickRatio >= 1 ? 'good' : quickRatio >= 0.5 ? 'warning' : 'bad',
        description: t('ratios.quickRatioDesc'),
      },
      {
        name: t('ratios.workingCapital'),
        value: currentAssets - currentLiabilities,
        displayValue: formatCurrency(currentAssets - currentLiabilities),
        benchmark: t('ratios.positive'),
        status: (currentAssets - currentLiabilities) > 0 ? 'good' : 'bad',
        description: t('ratios.workingCapitalDesc'),
      },
    ];
  }, [totals, t]);

  const profitabilityRatios = useMemo((): RatioResult[] => {
    const { revenue, grossProfit, netIncome, totalAssets, totalEquity } = totals;
    
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
    const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
    const roe = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;

    return [
      {
        name: t('ratios.grossMargin'),
        value: grossMargin,
        displayValue: `${grossMargin.toFixed(1)}%`,
        benchmark: '> 20%',
        status: grossMargin >= 20 ? 'good' : grossMargin >= 10 ? 'warning' : 'bad',
        description: t('ratios.grossMarginDesc'),
      },
      {
        name: t('ratios.netMargin'),
        value: netMargin,
        displayValue: `${netMargin.toFixed(1)}%`,
        benchmark: '> 10%',
        status: netMargin >= 10 ? 'good' : netMargin >= 5 ? 'warning' : 'bad',
        description: t('ratios.netMarginDesc'),
      },
      {
        name: t('ratios.roa'),
        value: roa,
        displayValue: `${roa.toFixed(1)}%`,
        benchmark: '> 5%',
        status: roa >= 5 ? 'good' : roa >= 2 ? 'warning' : 'bad',
        description: t('ratios.roaDesc'),
      },
      {
        name: t('ratios.roe'),
        value: roe,
        displayValue: `${roe.toFixed(1)}%`,
        benchmark: '> 15%',
        status: roe >= 15 ? 'good' : roe >= 8 ? 'warning' : 'bad',
        description: t('ratios.roeDesc'),
      },
    ];
  }, [totals, t]);

  const leverageRatios = useMemo((): RatioResult[] => {
    const { totalAssets, totalLiabilities, totalEquity } = totals;
    
    const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const debtToEquity = totalEquity > 0 ? totalLiabilities / totalEquity : 0;
    const equityRatio = totalAssets > 0 ? (totalEquity / totalAssets) * 100 : 0;

    return [
      {
        name: t('ratios.debtRatio'),
        value: debtRatio,
        displayValue: `${debtRatio.toFixed(1)}%`,
        benchmark: '< 60%',
        status: debtRatio <= 40 ? 'good' : debtRatio <= 60 ? 'warning' : 'bad',
        description: t('ratios.debtRatioDesc'),
      },
      {
        name: t('ratios.debtToEquity'),
        value: debtToEquity,
        displayValue: debtToEquity.toFixed(2),
        benchmark: '< 2.0',
        status: debtToEquity <= 1 ? 'good' : debtToEquity <= 2 ? 'warning' : 'bad',
        description: t('ratios.debtToEquityDesc'),
      },
      {
        name: t('ratios.equityRatio'),
        value: equityRatio,
        displayValue: `${equityRatio.toFixed(1)}%`,
        benchmark: '> 40%',
        status: equityRatio >= 40 ? 'good' : equityRatio >= 25 ? 'warning' : 'bad',
        description: t('ratios.equityRatioDesc'),
      },
    ];
  }, [totals, t]);

  const efficiencyRatios = useMemo((): RatioResult[] => {
    const { revenue, totalAssets, inventory, cogs } = totals;
    
    const assetTurnover = totalAssets > 0 ? revenue / totalAssets : 0;
    const inventoryTurnover = inventory > 0 ? cogs / inventory : 0;
    const daysInventory = inventoryTurnover > 0 ? 365 / inventoryTurnover : 0;

    return [
      {
        name: t('ratios.assetTurnover'),
        value: assetTurnover,
        displayValue: assetTurnover.toFixed(2),
        benchmark: '> 1.0',
        status: assetTurnover >= 1 ? 'good' : assetTurnover >= 0.5 ? 'warning' : 'bad',
        description: t('ratios.assetTurnoverDesc'),
      },
      {
        name: t('ratios.inventoryTurnover'),
        value: inventoryTurnover,
        displayValue: inventoryTurnover.toFixed(2),
        benchmark: '> 6',
        status: inventoryTurnover >= 6 ? 'good' : inventoryTurnover >= 3 ? 'warning' : 'bad',
        description: t('ratios.inventoryTurnoverDesc'),
      },
      {
        name: t('ratios.daysInventory'),
        value: daysInventory,
        displayValue: `${daysInventory.toFixed(0)} ${t('ratios.days')}`,
        benchmark: '< 60',
        status: daysInventory <= 60 ? 'good' : daysInventory <= 90 ? 'warning' : 'bad',
        description: t('ratios.daysInventoryDesc'),
      },
    ];
  }, [totals, t]);

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'bad':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'bad': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const renderRatioCard = (ratio: RatioResult) => (
    <Card key={ratio.name} className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{ratio.name}</p>
            <p className="text-3xl font-bold mt-1">{ratio.displayValue}</p>
          </div>
          {getStatusIcon(ratio.status)}
        </div>
        
        {ratio.benchmark && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground">{t('ratios.benchmark')}:</span>
            <Badge variant="outline" className="text-xs">
              {ratio.benchmark}
            </Badge>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">{ratio.description}</p>
        
        <div className={`absolute top-0 right-0 w-1 h-full ${
          ratio.status === 'good' ? 'bg-green-500' :
          ratio.status === 'warning' ? 'bg-yellow-500' :
          ratio.status === 'bad' ? 'bg-red-500' : 'bg-gray-300'
        }`} />
      </CardContent>
    </Card>
  );

  const handleRefresh = () => {
    refetchBS();
    refetchPL();
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t('ratios.title')}</h1>
            <p className="text-muted-foreground">{t('ratios.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-blue-500 mb-2">
                    <Wallet className="h-5 w-5" />
                    <span className="text-sm font-medium">{t('ratios.totalAssets')}</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(totals.totalAssets)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <Scale className="h-5 w-5" />
                    <span className="text-sm font-medium">{t('ratios.totalLiabilities')}</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(totals.totalLiabilities)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-500 mb-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-sm font-medium">{t('ratios.revenue')}</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-purple-500 mb-2">
                    <PieChart className="h-5 w-5" />
                    <span className="text-sm font-medium">{t('ratios.netIncome')}</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(totals.netIncome)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Ratio Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="liquidity" className="gap-2">
                  <Activity className="h-4 w-4" />
                  {t('ratios.liquidity')}
                </TabsTrigger>
                <TabsTrigger value="profitability" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('ratios.profitability')}
                </TabsTrigger>
                <TabsTrigger value="leverage" className="gap-2">
                  <Scale className="h-4 w-4" />
                  {t('ratios.leverage')}
                </TabsTrigger>
                <TabsTrigger value="efficiency" className="gap-2">
                  <PieChart className="h-4 w-4" />
                  {t('ratios.efficiency')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="liquidity">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {liquidityRatios.map(renderRatioCard)}
                </div>
              </TabsContent>

              <TabsContent value="profitability">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {profitabilityRatios.map(renderRatioCard)}
                </div>
              </TabsContent>

              <TabsContent value="leverage">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {leverageRatios.map(renderRatioCard)}
                </div>
              </TabsContent>

              <TabsContent value="efficiency">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {efficiencyRatios.map(renderRatioCard)}
                </div>
              </TabsContent>
            </Tabs>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('ratios.legend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{t('ratios.healthy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{t('ratios.needsAttention')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{t('ratios.critical')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
