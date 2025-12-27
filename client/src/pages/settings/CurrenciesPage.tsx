import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Loader2, Globe, TrendingUp, TrendingDown, Search } from "lucide-react";

// Popular currencies to show by default
const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'JOD', 'INR', 'CNY', 'JPY'];

interface LiveRate {
  currency: string;
  rate: number;
  name: string;
  symbol: string;
}

export default function CurrenciesPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const baseCurrency = user?.activeCompany?.base_currency || "AED";

  // Fetch all currencies
  const { data: currencies = [], isLoading: isLoadingCurrencies } = useQuery<any[]>({
    queryKey: ["/api/currencies"],
  });

  // Fetch live rates from API
  const { 
    data: liveRates = [], 
    isLoading: isLoadingRates, 
    refetch: refetchRates,
    isFetching: isFetchingRates 
  } = useQuery<LiveRate[]>({
    queryKey: ["/api/currencies/live-rates", baseCurrency],
    queryFn: async () => {
      const rates: LiveRate[] = [];
      const currenciesToFetch = POPULAR_CURRENCIES.filter(c => c !== baseCurrency);
      
      // Fetch rates in parallel
      const promises = currenciesToFetch.map(async (currency) => {
        try {
          const res = await apiRequest("GET", `/api/currencies/live-rate?from=${currency}&to=${baseCurrency}`);
          const data = await res.json();
          const currencyInfo = currencies.find((c: any) => c.code === currency);
          return {
            currency,
            rate: data.rate,
            name: currencyInfo?.name || currency,
            symbol: currencyInfo?.symbol || currency,
          };
        } catch {
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      setLastUpdated(new Date());
      return results.filter((r): r is LiveRate => r !== null);
    },
    enabled: currencies.length > 0,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  const handleRefresh = async () => {
    await refetchRates();
    toast({
      title: t("common.success"),
      description: t("settings.currencies.ratesUpdated", { defaultValue: "تم تحديث أسعار الصرف" }),
    });
  };

  // Filter currencies based on search
  const filteredRates = liveRates.filter(rate => 
    rate.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rate.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("settings.currencies.title")}</h1>
          <p className="text-muted-foreground">
            {t("settings.currencies.liveRatesDesc", { defaultValue: "أسعار الصرف المباشرة من الإنترنت - محدثة تلقائياً" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              {t("settings.currencies.lastUpdated", { defaultValue: "آخر تحديث:" })} {lastUpdated.toLocaleTimeString(i18n.language)}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isFetchingRates}
          >
            {isFetchingRates ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ms-2 hidden sm:inline">{t("common.refresh")}</span>
          </Button>
        </div>
      </div>

      {/* Base Currency Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("settings.currencies.baseCurrency", { defaultValue: "العملة الأساسية" })}</p>
                <p className="text-xl font-bold">{baseCurrency}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("settings.currencies.allRatesAgainst", { defaultValue: "جميع الأسعار مقابل" })} {baseCurrency}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Live Exchange Rates */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-500" />
                {t("settings.currencies.liveExchangeRates", { defaultValue: "أسعار الصرف المباشرة" })}
              </CardTitle>
              <CardDescription>
                {t("settings.currencies.liveRatesNote", { defaultValue: "الأسعار محدثة تلقائياً من الإنترنت كل 5 دقائق" })}
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 w-full sm:w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("settings.currencies.code")}</TableHead>
                  <TableHead>{t("settings.currencies.name")}</TableHead>
                  <TableHead className="text-end">{t("settings.currencies.rate")}</TableHead>
                  <TableHead className="text-end">{t("settings.currencies.inverse", { defaultValue: "معكوس" })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRates || isLoadingCurrencies ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">{t("settings.currencies.fetchingRates", { defaultValue: "جاري جلب أسعار الصرف..." })}</p>
                    </TableCell>
                  </TableRow>
                ) : filteredRates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? t("common.noResults") : t("settings.currencies.noRates", { defaultValue: "لا توجد أسعار صرف" })}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRates.map((rate) => (
                    <TableRow key={rate.currency}>
                      <TableCell>
                        <span className="font-mono font-bold">{rate.currency}</span>
                      </TableCell>
                      <TableCell>{rate.name}</TableCell>
                      <TableCell className="text-end font-mono">
                        <span className="text-green-600 dark:text-green-400">
                          {rate.rate.toFixed(4)}
                        </span>
                        <span className="text-xs text-muted-foreground ms-1">{baseCurrency}</span>
                      </TableCell>
                      <TableCell className="text-end font-mono text-muted-foreground">
                        {(1 / rate.rate).toFixed(4)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700 dark:text-blue-300">
                {t("settings.currencies.autoUpdateTitle", { defaultValue: "تحديث تلقائي" })}
              </p>
              <p className="text-blue-600 dark:text-blue-400">
                {t("settings.currencies.autoUpdateDesc", { defaultValue: "أسعار الصرف يتم جلبها تلقائياً من الإنترنت ولا تحتاج لإدخالها يدوياً. الأسعار محدثة دائماً ودقيقة." })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
