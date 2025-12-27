import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  RefreshCw,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Globe,
  DollarSign,
  Euro,
  PoundSterling,
  Banknote,
  Calculator,
  History,
  Star,
  StarOff,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Search,
  Copy,
  Check,
  Info,
  Wallet,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
interface Currency {
  code: string;
  name: string;
  nameAr: string;
  symbol: string;
  flag: string;
  rate: number; // Rate against USD
  region?: string;
}

interface ConversionHistory {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: Date;
}

interface RateHistory {
  date: string;
  rate: number;
}

interface MultiCurrencyConverterProps {
  baseCurrency?: string;
  onConvert?: (from: string, to: string, amount: number, result: number) => void;
  showHistory?: boolean;
  compact?: boolean;
}

// Currency data with exchange rates
const currencyData: Currency[] = [
  { code: 'USD', name: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', flag: '🇺🇸', rate: 1, region: 'Americas' },
  { code: 'EUR', name: 'Euro', nameAr: 'يورو', symbol: '€', flag: '🇪🇺', rate: 0.92, region: 'Europe' },
  { code: 'GBP', name: 'British Pound', nameAr: 'جنيه إسترليني', symbol: '£', flag: '🇬🇧', rate: 0.79, region: 'Europe' },
  { code: 'JPY', name: 'Japanese Yen', nameAr: 'ين ياباني', symbol: '¥', flag: '🇯🇵', rate: 149.50, region: 'Asia' },
  { code: 'CHF', name: 'Swiss Franc', nameAr: 'فرنك سويسري', symbol: 'Fr', flag: '🇨🇭', rate: 0.88, region: 'Europe' },
  { code: 'CAD', name: 'Canadian Dollar', nameAr: 'دولار كندي', symbol: 'C$', flag: '🇨🇦', rate: 1.36, region: 'Americas' },
  { code: 'AUD', name: 'Australian Dollar', nameAr: 'دولار أسترالي', symbol: 'A$', flag: '🇦🇺', rate: 1.53, region: 'Oceania' },
  { code: 'CNY', name: 'Chinese Yuan', nameAr: 'يوان صيني', symbol: '¥', flag: '🇨🇳', rate: 7.24, region: 'Asia' },
  { code: 'INR', name: 'Indian Rupee', nameAr: 'روبية هندية', symbol: '₹', flag: '🇮🇳', rate: 83.12, region: 'Asia' },
  { code: 'SAR', name: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'ر.س', flag: '🇸🇦', rate: 3.75, region: 'Middle East' },
  { code: 'AED', name: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ', flag: '🇦🇪', rate: 3.67, region: 'Middle East' },
  { code: 'EGP', name: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'ج.م', flag: '🇪🇬', rate: 30.90, region: 'Africa' },
  { code: 'KWD', name: 'Kuwaiti Dinar', nameAr: 'دينار كويتي', symbol: 'د.ك', flag: '🇰🇼', rate: 0.31, region: 'Middle East' },
  { code: 'QAR', name: 'Qatari Riyal', nameAr: 'ريال قطري', symbol: 'ر.ق', flag: '🇶🇦', rate: 3.64, region: 'Middle East' },
  { code: 'BHD', name: 'Bahraini Dinar', nameAr: 'دينار بحريني', symbol: 'د.ب', flag: '🇧🇭', rate: 0.38, region: 'Middle East' },
  { code: 'OMR', name: 'Omani Rial', nameAr: 'ريال عماني', symbol: 'ر.ع', flag: '🇴🇲', rate: 0.38, region: 'Middle East' },
  { code: 'JOD', name: 'Jordanian Dinar', nameAr: 'دينار أردني', symbol: 'د.أ', flag: '🇯🇴', rate: 0.71, region: 'Middle East' },
  { code: 'TRY', name: 'Turkish Lira', nameAr: 'ليرة تركية', symbol: '₺', flag: '🇹🇷', rate: 32.15, region: 'Europe' },
  { code: 'ZAR', name: 'South African Rand', nameAr: 'راند جنوب أفريقي', symbol: 'R', flag: '🇿🇦', rate: 18.65, region: 'Africa' },
  { code: 'BRL', name: 'Brazilian Real', nameAr: 'ريال برازيلي', symbol: 'R$', flag: '🇧🇷', rate: 4.97, region: 'Americas' },
  { code: 'MXN', name: 'Mexican Peso', nameAr: 'بيزو مكسيكي', symbol: '$', flag: '🇲🇽', rate: 17.15, region: 'Americas' },
  { code: 'SGD', name: 'Singapore Dollar', nameAr: 'دولار سنغافوري', symbol: 'S$', flag: '🇸🇬', rate: 1.34, region: 'Asia' },
  { code: 'HKD', name: 'Hong Kong Dollar', nameAr: 'دولار هونغ كونغ', symbol: 'HK$', flag: '🇭🇰', rate: 7.82, region: 'Asia' },
  { code: 'KRW', name: 'South Korean Won', nameAr: 'وون كوري', symbol: '₩', flag: '🇰🇷', rate: 1320.50, region: 'Asia' },
  { code: 'RUB', name: 'Russian Ruble', nameAr: 'روبل روسي', symbol: '₽', flag: '🇷🇺', rate: 92.50, region: 'Europe' },
  { code: 'SEK', name: 'Swedish Krona', nameAr: 'كرونة سويدية', symbol: 'kr', flag: '🇸🇪', rate: 10.45, region: 'Europe' },
  { code: 'NOK', name: 'Norwegian Krone', nameAr: 'كرونة نرويجية', symbol: 'kr', flag: '🇳🇴', rate: 10.72, region: 'Europe' },
  { code: 'DKK', name: 'Danish Krone', nameAr: 'كرونة دنماركية', symbol: 'kr', flag: '🇩🇰', rate: 6.87, region: 'Europe' },
  { code: 'PLN', name: 'Polish Zloty', nameAr: 'زلوتي بولندي', symbol: 'zł', flag: '🇵🇱', rate: 3.95, region: 'Europe' },
  { code: 'THB', name: 'Thai Baht', nameAr: 'باهت تايلندي', symbol: '฿', flag: '🇹🇭', rate: 35.80, region: 'Asia' }
];

// Group currencies by region
const currencyGroups = currencyData.reduce((groups, currency) => {
  const region = currency.region || 'Other';
  if (!groups[region]) groups[region] = [];
  groups[region].push(currency);
  return groups;
}, {} as Record<string, Currency[]>);

export function MultiCurrencyConverter({ 
  baseCurrency = 'USD', 
  onConvert,
  showHistory = true,
  compact = false 
}: MultiCurrencyConverterProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [fromCurrency, setFromCurrency] = useState(baseCurrency);
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState<string>('1000');
  const [favorites, setFavorites] = useState<string[]>(['USD', 'EUR', 'GBP', 'SAR', 'AED']);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [rateHistoryOpen, setRateHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get currency objects
  const fromCurrencyData = useMemo(() => 
    currencyData.find(c => c.code === fromCurrency) || currencyData[0], 
    [fromCurrency]
  );
  
  const toCurrencyData = useMemo(() => 
    currencyData.find(c => c.code === toCurrency) || currencyData[1], 
    [toCurrency]
  );

  // Calculate exchange rate
  const exchangeRate = useMemo(() => {
    return toCurrencyData.rate / fromCurrencyData.rate;
  }, [fromCurrencyData, toCurrencyData]);

  // Calculate converted amount
  const convertedAmount = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    return numAmount * exchangeRate;
  }, [amount, exchangeRate]);

  // Generate fake rate history
  const rateHistory = useMemo((): RateHistory[] => {
    const history: RateHistory[] = [];
    let baseRate = exchangeRate;
    for (let i = 30; i >= 0; i--) {
      const variance = (Math.random() - 0.5) * 0.1 * baseRate;
      const rate = baseRate + variance;
      history.push({
        date: format(subDays(new Date(), i), 'MMM dd'),
        rate: parseFloat(rate.toFixed(4))
      });
      baseRate = rate; // Small drift
    }
    // Reset to actual rate for today
    history[history.length - 1].rate = exchangeRate;
    return history;
  }, [exchangeRate]);

  // Format currency amount
  const formatCurrency = useCallback((value: number, currencyCode: string): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  }, [i18n.language]);

  // Swap currencies
  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  // Toggle favorite
  const toggleFavorite = useCallback((code: string) => {
    setFavorites(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code) 
        : [...prev, code]
    );
  }, []);

  // Refresh rates
  const refreshRates = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdate(new Date());
    setIsRefreshing(false);
    toast({ title: t('currency.ratesUpdated') });
  }, [t, toast]);

  // Add to history
  const addToHistory = useCallback(() => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return;
    
    const newEntry: ConversionHistory = {
      id: Date.now().toString(),
      fromCurrency,
      toCurrency,
      fromAmount: numAmount,
      toAmount: convertedAmount,
      rate: exchangeRate,
      timestamp: new Date()
    };
    
    setHistory(prev => [newEntry, ...prev.slice(0, 19)]);
    onConvert?.(fromCurrency, toCurrency, numAmount, convertedAmount);
    toast({ title: t('currency.conversionSaved') });
  }, [amount, fromCurrency, toCurrency, convertedAmount, exchangeRate, onConvert, t, toast]);

  // Copy result
  const copyResult = useCallback(() => {
    navigator.clipboard.writeText(convertedAmount.toFixed(4));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: t('currency.copied') });
  }, [convertedAmount, t, toast]);

  // Filter currencies
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return currencyData;
    const query = searchQuery.toLowerCase();
    return currencyData.filter(c => 
      c.code.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.nameAr.includes(query)
    );
  }, [searchQuery]);

  // Currency selector
  const CurrencySelector = ({ value, onChange, label }: { 
    value: string; 
    onChange: (v: string) => void;
    label: string;
  }) => {
    const selected = currencyData.find(c => c.code === value);
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-12">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selected?.flag}</span>
                <span className="font-medium">{selected?.code}</span>
                <span className="text-muted-foreground text-sm hidden sm:inline">
                  {isRTL ? selected?.nameAr : selected?.name}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('currency.searchCurrencies')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9"
                />
              </div>
            </div>
            
            {/* Favorites */}
            {favorites.length > 0 && !searchQuery && (
              <div className="p-2 border-b">
                <p className="text-xs text-muted-foreground mb-2 px-2">{t('currency.favorites')}</p>
                <div className="flex flex-wrap gap-1">
                  {favorites.map(code => {
                    const cur = currencyData.find(c => c.code === code);
                    if (!cur) return null;
                    return (
                      <Button
                        key={code}
                        variant={value === code ? "default" : "outline"}
                        size="sm"
                        onClick={() => { onChange(code); setSearchQuery(''); }}
                        className="gap-1"
                      >
                        <span>{cur.flag}</span>
                        <span>{cur.code}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <ScrollArea className="h-64">
              {Object.entries(currencyGroups).map(([region, currencies]) => {
                const filtered = currencies.filter(c => 
                  !searchQuery || 
                  c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.nameAr.includes(searchQuery)
                );
                if (filtered.length === 0) return null;
                
                return (
                  <div key={region}>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted">
                      {t(`currency.regions.${region.toLowerCase().replace(' ', '')}`)}
                    </div>
                    {filtered.map(currency => (
                      <div
                        key={currency.code}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent",
                          value === currency.code && "bg-accent"
                        )}
                        onClick={() => { onChange(currency.code); setSearchQuery(''); }}
                      >
                        <span className="text-xl">{currency.flag}</span>
                        <div className="flex-1">
                          <p className="font-medium">{currency.code}</p>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? currency.nameAr : currency.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(currency.code);
                          }}
                        >
                          {favorites.includes(currency.code) ? (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Rate trend indicator
  const RateTrend = () => {
    const firstRate = rateHistory[0].rate;
    const lastRate = rateHistory[rateHistory.length - 1].rate;
    const change = ((lastRate - firstRate) / firstRate) * 100;
    const isUp = change > 0;
    
    return (
      <div className={cn(
        "flex items-center gap-1 text-sm",
        isUp ? "text-green-500" : "text-red-500"
      )}>
        {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{isUp ? '+' : ''}{change.toFixed(2)}%</span>
        <span className="text-muted-foreground text-xs">{t('currency.last30Days')}</span>
      </div>
    );
  };

  // Mini chart
  const MiniChart = () => {
    const max = Math.max(...rateHistory.map(r => r.rate));
    const min = Math.min(...rateHistory.map(r => r.rate));
    const range = max - min;
    
    return (
      <div className="flex items-end gap-px h-8">
        {rateHistory.slice(-14).map((r, i) => (
          <div
            key={i}
            className="flex-1 bg-primary/60 rounded-t hover:bg-primary transition-colors"
            style={{ height: `${((r.rate - min) / range) * 100}%`, minHeight: '4px' }}
          />
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyData.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={swapCurrencies}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyData.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 text-center">
            <p className="text-2xl font-bold">{formatCurrency(convertedAmount, toCurrency)}</p>
            <p className="text-xs text-muted-foreground">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-6 w-6" />
            {t('currency.title')}
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            {t('currency.lastUpdate')}: {format(lastUpdate, 'HH:mm', { locale: dateLocale })}
            {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin" />}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={refreshRates}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4 me-2", isRefreshing && "animate-spin")} />
          {t('currency.refreshRates')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Converter Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t('currency.converter')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <CurrencySelector
                value={fromCurrency}
                onChange={setFromCurrency}
                label={t('currency.from')}
              />
              <CurrencySelector
                value={toCurrency}
                onChange={setToCurrency}
                label={t('currency.to')}
              />
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="icon" onClick={swapCurrencies} className="rounded-full">
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('currency.amount')}</Label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {fromCurrencyData.symbol}
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="ps-10 text-lg font-medium h-12"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>{t('currency.result')}</Label>
                <div className="relative">
                  <div className="flex items-center h-12 px-3 bg-muted rounded-md">
                    <span className="text-muted-foreground me-2">{toCurrencyData.symbol}</span>
                    <span className="text-lg font-bold">{convertedAmount.toFixed(4)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ms-auto h-8 w-8"
                      onClick={copyResult}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('currency.exchangeRate')}</span>
                <span className="font-medium">
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('currency.inverseRate')}</span>
                <span className="font-medium">
                  1 {toCurrency} = {(1 / exchangeRate).toFixed(4)} {fromCurrency}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <RateTrend />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setRateHistoryOpen(true)}
                >
                  <LineChartIcon className="h-4 w-4 me-2" />
                  {t('currency.viewHistory')}
                </Button>
              </div>
            </div>

            <Button onClick={addToHistory} className="w-full">
              <History className="h-4 w-4 me-2" />
              {t('currency.saveConversion')}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              {t('currency.quickRates')}
            </CardTitle>
            <CardDescription>
              {t('currency.quickRatesDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {favorites.map(code => {
                  if (code === fromCurrency) return null;
                  const cur = currencyData.find(c => c.code === code);
                  if (!cur) return null;
                  const rate = cur.rate / fromCurrencyData.rate;
                  
                  return (
                    <div
                      key={code}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => setToCurrency(code)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cur.flag}</span>
                        <div>
                          <p className="font-medium">{cur.code}</p>
                          <p className="text-xs text-muted-foreground">
                            {isRTL ? cur.nameAr : cur.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="font-medium">{rate.toFixed(4)}</p>
                        <p className="text-xs text-muted-foreground">
                          1 {fromCurrency}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {showHistory && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t('currency.conversionHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {history.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">
                          {formatCurrency(entry.fromAmount, entry.fromCurrency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(entry.timestamp, 'MMM dd, HH:mm', { locale: dateLocale })}
                        </p>
                      </div>
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium text-primary">
                        {formatCurrency(entry.toAmount, entry.toCurrency)}
                      </p>
                    </div>
                    <Badge variant="outline">
                      1 {entry.fromCurrency} = {entry.rate.toFixed(4)} {entry.toCurrency}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Rate History Dialog */}
      <Dialog open={rateHistoryOpen} onOpenChange={setRateHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {fromCurrency}/{toCurrency} {t('currency.rateHistory')}
            </DialogTitle>
            <DialogDescription>
              {t('currency.last30Days')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Chart */}
            <div className="h-32">
              <div className="flex items-end gap-1 h-full">
                {rateHistory.map((r, i) => {
                  const max = Math.max(...rateHistory.map(x => x.rate));
                  const min = Math.min(...rateHistory.map(x => x.rate));
                  const range = max - min || 1;
                  
                  return (
                    <TooltipProvider key={i}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="flex-1 bg-primary rounded-t hover:bg-primary/80 transition-colors cursor-pointer"
                            style={{ height: `${((r.rate - min) / range) * 100}%`, minHeight: '4px' }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">{r.rate.toFixed(4)}</p>
                          <p className="text-xs">{r.date}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{t('currency.high')}</p>
                <p className="font-medium">{Math.max(...rateHistory.map(r => r.rate)).toFixed(4)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{t('currency.low')}</p>
                <p className="font-medium">{Math.min(...rateHistory.map(r => r.rate)).toFixed(4)}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">{t('currency.average')}</p>
                <p className="font-medium">
                  {(rateHistory.reduce((sum, r) => sum + r.rate, 0) / rateHistory.length).toFixed(4)}
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateHistoryOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MultiCurrencyConverter;
