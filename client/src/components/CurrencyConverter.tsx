/**
 * Currency Converter Widget
 * Real-time currency conversion
 */
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyCurrency } from '@/hooks/use-company-currency';
import { ArrowRightLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  date: string;
}

interface CurrencyConverterProps {
  className?: string;
  compact?: boolean;
}

const popularCurrencies = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'EGP', 'JPY', 'CNY', 'INR'];

export function CurrencyConverter({ className, compact = false }: CurrencyConverterProps) {
  const { t, i18n } = useTranslation();
  const baseCurrency = useCompanyCurrency();
  
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<string>(baseCurrency);
  const [toCurrency, setToCurrency] = useState<string>('USD');

  // Fetch exchange rates
  const { data: rates = [], isLoading, refetch } = useQuery<ExchangeRate[]>({
    queryKey: ['/api/currencies/rates'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch available currencies
  const { data: currencies = [] } = useQuery<{ code: string; name: string; symbol: string }[]>({
    queryKey: ['/api/currencies'],
  });

  // Calculate conversion
  const convertedAmount = useMemo(() => {
    const value = parseFloat(amount) || 0;
    if (fromCurrency === toCurrency) return value;
    
    // Find direct rate
    let rate = rates.find(r => r.from_currency === fromCurrency && r.to_currency === toCurrency)?.rate;
    
    // Try reverse rate
    if (!rate) {
      const reverseRate = rates.find(r => r.from_currency === toCurrency && r.to_currency === fromCurrency)?.rate;
      if (reverseRate) rate = 1 / reverseRate;
    }
    
    // Try via base currency
    if (!rate && baseCurrency) {
      const toBase = rates.find(r => r.from_currency === fromCurrency && r.to_currency === baseCurrency)?.rate || 
                     (rates.find(r => r.from_currency === baseCurrency && r.to_currency === fromCurrency)?.rate 
                       ? 1 / rates.find(r => r.from_currency === baseCurrency && r.to_currency === fromCurrency)!.rate 
                       : null);
      const fromBase = rates.find(r => r.from_currency === baseCurrency && r.to_currency === toCurrency)?.rate ||
                       (rates.find(r => r.from_currency === toCurrency && r.to_currency === baseCurrency)?.rate
                         ? 1 / rates.find(r => r.from_currency === toCurrency && r.to_currency === baseCurrency)!.rate
                         : null);
      if (toBase && fromBase) rate = toBase * fromBase;
    }
    
    return rate ? value * rate : null;
  }, [amount, fromCurrency, toCurrency, rates, baseCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Update default currencies when base currency changes
  useEffect(() => {
    if (baseCurrency && fromCurrency !== baseCurrency && toCurrency !== baseCurrency) {
      setFromCurrency(baseCurrency);
    }
  }, [baseCurrency]);

  const availableCurrencies = useMemo(() => {
    const allCodes = new Set([
      ...popularCurrencies,
      ...currencies.map(c => c.code),
      ...rates.flatMap(r => [r.from_currency, r.to_currency]),
    ]);
    return Array.from(allCodes).sort();
  }, [currencies, rates]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t('currency.converter', 'Currency Converter')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border bg-card ${className}`}>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24"
        />
        <Select value={fromCurrency} onValueChange={setFromCurrency}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableCurrencies.map(code => (
              <SelectItem key={code} value={code}>{code}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={swapCurrencies}>
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
        <Select value={toCurrency} onValueChange={setToCurrency}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableCurrencies.map(code => (
              <SelectItem key={code} value={code}>{code}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-medium">
          = {convertedAmount !== null ? formatCurrency(convertedAmount, toCurrency) : '—'}
        </span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            {t('currency.converter', 'Currency Converter')}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label>{t('currency.amount', 'Amount')}</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* Currency Selection */}
        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-2">
          <div className="space-y-2">
            <Label>{t('currency.from', 'From')}</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map(code => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="icon" onClick={swapCurrencies} className="mb-0.5">
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          <div className="space-y-2">
            <Label>{t('currency.to', 'To')}</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableCurrencies.map(code => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result */}
        <div className="p-4 rounded-lg bg-primary/5 border">
          <div className="text-sm text-muted-foreground mb-1">
            {t('currency.result', 'Converted Amount')}
          </div>
          <div className="text-2xl font-bold">
            {convertedAmount !== null 
              ? formatCurrency(convertedAmount, toCurrency)
              : t('currency.noRate', 'Rate not available')
            }
          </div>
          {convertedAmount !== null && parseFloat(amount) > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              1 {fromCurrency} = {(convertedAmount / parseFloat(amount)).toFixed(4)} {toCurrency}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
